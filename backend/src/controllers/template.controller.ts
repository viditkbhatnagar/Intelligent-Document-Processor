import { Request, Response } from 'express';
import { TemplateModel } from '../models/Template';

export class TemplateController {
  async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { name, description, type, content, fields, mappingRules, styling, settings, isPublic } = req.body;

      const template = new TemplateModel({
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
    } catch (error) {
      console.error('Create template failed:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  }

  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { page = 1, limit = 10, type, status, search } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const where: any = {
        $or: [
          { createdBy: userId },
          { isActive: true }
        ]
      };

      if (type) where.documentType = type;
      if (status) where.isActive = status === 'active';
      if (search) {
        where.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const templates = await TemplateModel.find(where)
        .skip(offset)
        .limit(parseInt(limit as string))
        .sort({ createdDate: -1 });
      
      const total = await TemplateModel.countDocuments(where);

      res.json({
        templates,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Get templates failed:', error);
      res.status(500).json({ error: 'Failed to get templates' });
    }
  }

  async getTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const template = await TemplateModel.findOne({
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
    } catch (error) {
      console.error('Get template failed:', error);
      res.status(500).json({ error: 'Failed to get template' });
    }
  }

  async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const updates = req.body;

      const template = await TemplateModel.findOne({
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
    } catch (error) {
      console.error('Update template failed:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  }

  async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const template = await TemplateModel.findOne({
        _id: id,
        createdBy: userId
      });

      if (!template) {
        res.status(404).json({ error: 'Template not found or not authorized' });
        return;
      }

      await TemplateModel.findByIdAndDelete(id);

      console.info(`Template deleted: ${id} by user ${userId}`);

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Delete template failed:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }

  async cloneTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const { name } = req.body;

      const originalTemplate = await TemplateModel.findOne({
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

      const templateData = originalTemplate as any;
      
      const clonedTemplate = new TemplateModel({
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
    } catch (error) {
      console.error('Clone template failed:', error);
      res.status(500).json({ error: 'Failed to clone template' });
    }
  }
}