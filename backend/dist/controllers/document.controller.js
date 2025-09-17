"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const Document_1 = require("../models/Document");
const ocr_service_1 = require("../services/ocr.service");
const ai_service_1 = require("../services/ai.service");
const workflow_engine_service_1 = require("../services/workflow-engine.service");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class DocumentController {
    constructor() {
        this.ocrService = new ocr_service_1.OCRService();
        this.aiService = new ai_service_1.AIService();
        this.workflowEngine = new workflow_engine_service_1.WorkflowEngine();
    }
    async uploadDocument(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            }
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const { originalname, filename, mimetype, size, path: filePath } = req.file;
            // Create document record
            const document = new Document_1.ProcessedDocumentModel({
                filename,
                originalName: originalname,
                mimeType: mimetype,
                size,
                userId: req.user.userId,
                status: 'uploaded'
            });
            await document.save();
            // Start processing in background
            this.processDocumentAsync(document._id.toString(), filePath, mimetype);
            const docData = document;
            res.status(201).json({
                message: 'Document uploaded successfully',
                document: {
                    id: document._id,
                    originalName: docData.originalName,
                    status: docData.status,
                    uploadDate: docData.uploadDate
                }
            });
        }
        catch (error) {
            console.error('Error uploading document:', error);
            res.status(500).json({ message: 'Failed to upload document' });
        }
    }
    async getDocuments(req, res) {
        try {
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status;
            const documentType = req.query.documentType;
            const filter = { userId: req.user.userId };
            if (status)
                filter.status = status;
            if (documentType)
                filter.documentType = documentType;
            const documents = await Document_1.ProcessedDocumentModel
                .find(filter)
                .sort({ uploadDate: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-rawText'); // Exclude large text field
            const total = await Document_1.ProcessedDocumentModel.countDocuments(filter);
            res.json({
                documents,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            console.error('Error fetching documents:', error);
            res.status(500).json({ message: 'Failed to fetch documents' });
        }
    }
    async getDocument(req, res) {
        try {
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const document = await Document_1.ProcessedDocumentModel.findOne({
                _id: req.params.id,
                userId: req.user.userId
            });
            if (!document) {
                res.status(404).json({ message: 'Document not found' });
                return;
            }
            res.json({ document });
        }
        catch (error) {
            console.error('Error fetching document:', error);
            res.status(500).json({ message: 'Failed to fetch document' });
        }
    }
    async deleteDocument(req, res) {
        try {
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const document = await Document_1.ProcessedDocumentModel.findOne({
                _id: req.params.id,
                userId: req.user.userId
            });
            if (!document) {
                res.status(404).json({ message: 'Document not found' });
                return;
            }
            const docData = document;
            // Delete file from filesystem
            try {
                const filePath = path_1.default.join(process.env.UPLOAD_DIR || 'uploads', docData.filename);
                await promises_1.default.unlink(filePath);
            }
            catch (fileError) {
                console.warn('Could not delete file from filesystem:', fileError);
            }
            await Document_1.ProcessedDocumentModel.deleteOne({ _id: req.params.id });
            res.json({ message: 'Document deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting document:', error);
            res.status(500).json({ message: 'Failed to delete document' });
        }
    }
    async reprocessDocument(req, res) {
        try {
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const document = await Document_1.ProcessedDocumentModel.findOne({
                _id: req.params.id,
                userId: req.user.userId
            });
            if (!document) {
                res.status(404).json({ message: 'Document not found' });
                return;
            }
            const docData = document;
            // Reset document status
            docData.status = 'processing';
            docData.extractedFields = [];
            docData.error = undefined;
            await document.save();
            // Reprocess document
            const filePath = path_1.default.join(process.env.UPLOAD_DIR || 'uploads', docData.filename);
            this.processDocumentAsync(document._id.toString(), filePath, docData.mimeType);
            res.json({ message: 'Document reprocessing started' });
        }
        catch (error) {
            console.error('Error reprocessing document:', error);
            res.status(500).json({ message: 'Failed to reprocess document' });
        }
    }
    async processDocumentAsync(documentId, filePath, mimeType) {
        try {
            // Update status to processing
            await Document_1.ProcessedDocumentModel.findByIdAndUpdate(documentId, {
                status: 'processing',
                processedDate: new Date()
            });
            // Extract text from document
            const extractedText = await this.ocrService.extractTextFromFile(filePath, mimeType);
            // Classify document type
            const documentType = await this.aiService.classifyDocument(extractedText);
            // Extract fields using AI
            const extractedFields = await this.aiService.extractDocumentFields(extractedText, documentType);
            // Extract entities for workflow processing
            const entities = await this.aiService.extractDocumentEntities(extractedFields, documentType);
            // Update document with results
            const updatedDocument = await Document_1.ProcessedDocumentModel.findByIdAndUpdate(documentId, {
                status: 'processed',
                documentType,
                extractedFields,
                rawText: extractedText,
                entities,
                processedDate: new Date()
            }, { new: true });
            console.log(` Document ${documentId} processed successfully`);
            // Process workflow after document is successfully processed
            if (updatedDocument) {
                try {
                    await this.workflowEngine.processDocumentWorkflow(updatedDocument);
                    console.log(`✅ Document ${documentId} processed successfully and added to workflow`);
                }
                catch (workflowError) {
                    console.error(`⚠️ Document ${documentId} processed but workflow failed:`, workflowError);
                }
            }
        }
        catch (error) {
            console.error(`L Error processing document ${documentId}:`, error);
            await Document_1.ProcessedDocumentModel.findByIdAndUpdate(documentId, {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Processing failed',
                processedDate: new Date()
            });
        }
    }
}
exports.DocumentController = DocumentController;
//# sourceMappingURL=document.controller.js.map