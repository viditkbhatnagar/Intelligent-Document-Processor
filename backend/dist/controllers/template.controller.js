"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateController = void 0;
const Template_1 = require("../models/Template");
class TemplateController {
    async createTemplate(req, res) {
        try {
            const userId = req.userId;
            const { name, description, type, content, fields, mappingRules, styling, settings, isPublic } = req.body;
            const template = new Template_1.TemplateModel({
                name,
                description,
                documentType: type || 'custom',
                fields: fields || [],
                createdBy: userId,
                isActive: true
            });
            await template.save();
            console.log(`Template created: ${name} by user ${userId}`);
            res.status(201).json({
                message: 'Template created successfully',
                template
            });
        }
        catch (error) {
            console.error('Create template failed:', error);
            res.status(500).json({ error: 'Failed to create template' });
        }
    }
    async getTemplates(req, res) {
        try {
            const userId = req.userId;
            const { page = 1, limit = 10, type, status, search } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {
                $or: [
                    { createdBy: userId },
                    { isActive: true }
                ]
            };
            if (type)
                where.documentType = type;
            if (status)
                where.isActive = status === 'active';
            if (search) {
                where.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            const templates = await Template_1.TemplateModel.find(where)
                .skip(offset)
                .limit(parseInt(limit))
                .sort({ createdDate: -1 });
            const total = await Template_1.TemplateModel.countDocuments(where);
            res.json({
                templates,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        }
        catch (error) {
            console.error('Get templates failed:', error);
            res.status(500).json({ error: 'Failed to get templates' });
        }
    }
    async getTemplate(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const template = await Template_1.TemplateModel.findOne({
                _id: id,
                $or: [
                    { createdBy: userId },
                    { isActive: true }
                ]
            });
            if (!template) {
                res.status(404).json({ error: 'Template not found' });
                return;
            }
            res.json({ template });
        }
        catch (error) {
            console.error('Get template failed:', error);
            res.status(500).json({ error: 'Failed to get template' });
        }
    }
    async updateTemplate(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const updates = req.body;
            const template = await Template_1.TemplateModel.findOne({
                _id: id,
                createdBy: userId
            });
            if (!template) {
                res.status(404).json({ error: 'Template not found or not authorized' });
                return;
            }
            Object.assign(template, updates, { updatedDate: new Date() });
            await template.save();
            console.info(`Template updated: ${id} by user ${userId}`);
            res.json({
                message: 'Template updated successfully',
                template
            });
        }
        catch (error) {
            console.error('Update template failed:', error);
            res.status(500).json({ error: 'Failed to update template' });
        }
    }
    async deleteTemplate(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const template = await Template_1.TemplateModel.findOne({
                _id: id,
                createdBy: userId
            });
            if (!template) {
                res.status(404).json({ error: 'Template not found or not authorized' });
                return;
            }
            await Template_1.TemplateModel.findByIdAndDelete(id);
            console.info(`Template deleted: ${id} by user ${userId}`);
            res.json({ message: 'Template deleted successfully' });
        }
        catch (error) {
            console.error('Delete template failed:', error);
            res.status(500).json({ error: 'Failed to delete template' });
        }
    }
    async cloneTemplate(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const { name } = req.body;
            const originalTemplate = await Template_1.TemplateModel.findOne({
                _id: id,
                $or: [
                    { createdBy: userId },
                    { isActive: true }
                ]
            });
            if (!originalTemplate) {
                res.status(404).json({ error: 'Template not found' });
                return;
            }
            const templateData = originalTemplate;
            const clonedTemplate = new Template_1.TemplateModel({
                name: name || `${templateData.name} (Copy)`,
                description: templateData.description,
                documentType: templateData.documentType,
                fields: templateData.fields,
                createdBy: userId,
                isActive: true
            });
            await clonedTemplate.save();
            console.info(`Template cloned: ${id} to ${clonedTemplate._id} by user ${userId}`);
            res.status(201).json({
                message: 'Template cloned successfully',
                template: clonedTemplate
            });
        }
        catch (error) {
            console.error('Clone template failed:', error);
            res.status(500).json({ error: 'Failed to clone template' });
        }
    }
}
exports.TemplateController = TemplateController;
//# sourceMappingURL=template.controller.js.map