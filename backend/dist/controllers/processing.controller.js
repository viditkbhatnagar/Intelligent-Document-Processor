"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingController = void 0;
const Document_1 = require("../models/Document");
const Template_1 = require("../models/Template");
const ProcessedData_1 = require("../models/ProcessedData");
const ai_service_1 = require("../services/ai.service");
const field_extractor_1 = require("../ai/field-extractor");
const template_service_1 = require("../services/template.service");
const logger_1 = require("../utils/logger");
const server_1 = require("../server");
class ProcessingController {
    constructor() {
        this.aiService = new ai_service_1.AIService();
        this.fieldExtractor = new field_extractor_1.FieldExtractor();
        this.templateService = new template_service_1.TemplateService();
    }
    async extractFields(req, res) {
        try {
            const userId = req.userId;
            const { documentId, templateId, useAI = true } = req.body;
            const document = await Document_1.Document.findOne({
                where: { id: documentId, userId }
            });
            const template = await Template_1.Template.findByPk(templateId);
            if (!document || !template) {
                res.status(404).json({ error: 'Document or template not found' });
                return;
            }
            if (!document.extractedText) {
                res.status(400).json({ error: 'Document text extraction not completed' });
                return;
            }
            let extractedFields = {};
            let confidenceScores = {};
            if (useAI && process.env.ENABLE_AI_PROCESSING === 'true') {
                try {
                    const aiResult = await this.aiService.extractFields({
                        text: document.extractedText,
                        documentType: document.type,
                        templateFields: template.fields
                    });
                    extractedFields = aiResult.fields;
                    confidenceScores = aiResult.confidence;
                    logger_1.logger.info(`AI field extraction completed for document ${documentId}`);
                }
                catch (aiError) {
                    logger_1.logger.error('AI extraction failed, falling back to pattern matching:', aiError);
                    // Fall back to pattern matching
                    const patternResult = await this.fieldExtractor.extractFields(document.extractedText, template.fields);
                    Object.entries(patternResult).forEach(([key, value]) => {
                        extractedFields[key] = value.value;
                        confidenceScores[key] = value.confidence;
                    });
                }
            }
            else {
                // Use pattern-based extraction
                const patternResult = await this.fieldExtractor.extractFields(document.extractedText, template.fields);
                Object.entries(patternResult).forEach(([key, value]) => {
                    extractedFields[key] = value.value;
                    confidenceScores[key] = value.confidence;
                });
            }
            const processedData = await ProcessedData_1.ProcessedData.create({
                status: ProcessedData_1.ProcessingStatus.COMPLETED,
                extractedFields,
                confidenceScores,
                userId,
                documentId: document.id,
                templateId: template.id,
                processingTimeMs: 0 // Will be updated after processing
            });
            // Emit real-time update
            server_1.io.to(`processing_${documentId}`).emit('field_extraction_complete', {
                processedDataId: processedData.id,
                extractedFields,
                confidenceScores
            });
            res.json({
                message: 'Fields extracted successfully',
                processedData: {
                    id: processedData.id,
                    extractedFields,
                    confidenceScores,
                    status: processedData.status
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Field extraction failed:', error);
            res.status(500).json({ error: 'Field extraction failed' });
        }
    }
    async mapFields(req, res) {
        try {
            const userId = req.userId;
            const { processedDataId, fieldMappings, manualOverrides } = req.body;
            const processedData = await ProcessedData_1.ProcessedData.findOne({
                where: { id: processedDataId, userId },
                include: ['template']
            });
            if (!processedData) {
                res.status(404).json({ error: 'Processed data not found' });
                return;
            }
            const mappedFields = await this.templateService.mapFields(processedData.extractedFields, processedData.template.mappingRules, fieldMappings || {});
            await processedData.update({
                mappedFields,
                manualOverrides: manualOverrides || {},
                status: ProcessedData_1.ProcessingStatus.COMPLETED
            });
            res.json({
                message: 'Fields mapped successfully',
                mappedFields,
                processedDataId: processedData.id
            });
        }
        catch (error) {
            logger_1.logger.error('Field mapping failed:', error);
            res.status(500).json({ error: 'Field mapping failed' });
        }
    }
    async generateDocument(req, res) {
        try {
            const userId = req.userId;
            const { processedDataId, outputFormat = 'pdf' } = req.body;
            const processedData = await ProcessedData_1.ProcessedData.findOne({
                where: { id: processedDataId, userId },
                include: ['template', 'document']
            });
            if (!processedData) {
                res.status(404).json({ error: 'Processed data not found' });
                return;
            }
            const startTime = Date.now();
            // Merge extracted fields with manual overrides
            const finalFields = {
                ...processedData.extractedFields,
                ...processedData.mappedFields,
                ...processedData.manualOverrides
            };
            // Generate document content using AI
            let generatedContent;
            if (process.env.ENABLE_AI_PROCESSING === 'true') {
                generatedContent = await this.aiService.generateDocumentContent(processedData.template.content, finalFields, processedData.template.type);
            }
            else {
                generatedContent = await this.templateService.fillTemplate(processedData.template.content, finalFields);
            }
            // Convert to requested format and save
            const outputFilePath = await this.templateService.saveDocument(generatedContent, outputFormat, `${processedData.template.name}_${Date.now()}`);
            const processingTime = Date.now() - startTime;
            await processedData.update({
                generatedContent,
                outputFilePath,
                processingTimeMs: processingTime,
                status: ProcessedData_1.ProcessingStatus.COMPLETED
            });
            logger_1.logger.info(`Document generated: ${outputFilePath} for user ${userId}`);
            res.json({
                message: 'Document generated successfully',
                outputFilePath,
                downloadUrl: `/api/v1/processing/download/${processedData.id}`,
                processingTime
            });
        }
        catch (error) {
            logger_1.logger.error('Document generation failed:', error);
            res.status(500).json({ error: 'Document generation failed' });
        }
    }
    async getProcessingJobs(req, res) {
        try {
            const userId = req.userId;
            const { page = 1, limit = 10, status } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = { userId };
            if (status)
                where.status = status;
            const { rows: jobs, count: total } = await ProcessedData_1.ProcessedData.findAndCountAll({
                where,
                offset,
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']],
                include: ['document', 'template']
            });
            res.json({
                jobs,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get processing jobs failed:', error);
            res.status(500).json({ error: 'Failed to get processing jobs' });
        }
    }
    async getProcessingJob(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const job = await ProcessedData_1.ProcessedData.findOne({
                where: { id, userId },
                include: ['document', 'template', 'user']
            });
            if (!job) {
                res.status(404).json({ error: 'Processing job not found' });
                return;
            }
            res.json({ job });
        }
        catch (error) {
            logger_1.logger.error('Get processing job failed:', error);
            res.status(500).json({ error: 'Failed to get processing job' });
        }
    }
    async cancelProcessingJob(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const job = await ProcessedData_1.ProcessedData.findOne({
                where: { id, userId }
            });
            if (!job) {
                res.status(404).json({ error: 'Processing job not found' });
                return;
            }
            if (job.status === ProcessedData_1.ProcessingStatus.COMPLETED) {
                res.status(400).json({ error: 'Cannot cancel completed job' });
                return;
            }
            await job.update({ status: ProcessedData_1.ProcessingStatus.CANCELLED });
            res.json({ message: 'Processing job cancelled' });
        }
        catch (error) {
            logger_1.logger.error('Cancel processing job failed:', error);
            res.status(500).json({ error: 'Failed to cancel processing job' });
        }
    }
}
exports.ProcessingController = ProcessingController;
//# sourceMappingURL=processing.controller.js.map