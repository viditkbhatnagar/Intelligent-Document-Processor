import { Request, Response } from 'express';
import { TemplatePopulationService } from '../services/template-population.service';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export class TemplatePopulationController {
  private templatePopulationService = new TemplatePopulationService();

  async populateFromInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Demo mode - use dummy user if no authentication
      if (!req.user) {
        req.user = { userId: 'demo-user' };
      }

      const { documentId } = req.params;
      if (!documentId) {
        res.status(400).json({ message: 'Document ID is required' });
        return;
      }

      const populatedDocuments = await this.templatePopulationService.populateTemplatesFromInvoice(documentId);

      res.json({
        message: 'Templates populated successfully',
        populatedDocuments,
        totalTemplates: populatedDocuments.length
      });
    } catch (error) {
      console.error('Error populating templates:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to populate templates'
      });
    }
  }

  async getTemplates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Demo mode - use dummy user if no authentication
      if (!req.user) {
        req.user = { userId: 'demo-user' };
      }

      const templates = await this.templatePopulationService.getAvailableTemplates();

      res.json({
        templates,
        totalTemplates: templates.length
      });
    } catch (error) {
      console.error('Error getting templates:', error);
      res.status(500).json({ message: 'Failed to get templates' });
    }
  }

  async previewPopulation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Demo mode - use dummy user if no authentication
      if (!req.user) {
        req.user = { userId: 'demo-user' };
      }

      const { templateId } = req.params;
      const { extractedFields } = req.body;

      if (!templateId) {
        res.status(400).json({ message: 'Template ID is required' });
        return;
      }

      if (!extractedFields || !Array.isArray(extractedFields)) {
        res.status(400).json({ message: 'Extracted fields are required' });
        return;
      }

      const preview = await this.templatePopulationService.previewTemplatePopulation(
        extractedFields,
        templateId
      );

      res.json({
        message: 'Template preview generated',
        preview
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to generate preview'
      });
    }
  }

  async enhanceFields(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Demo mode - use dummy user if no authentication
      if (!req.user) {
        req.user = { userId: 'demo-user' };
      }

      const { documentId } = req.params;
      const { additionalFields } = req.body;

      if (!documentId) {
        res.status(400).json({ message: 'Document ID is required' });
        return;
      }

      if (!additionalFields || !Array.isArray(additionalFields)) {
        res.status(400).json({ message: 'Additional fields are required' });
        return;
      }

      const enhancedFields = await this.templatePopulationService.enhanceFieldExtraction(
        documentId,
        additionalFields
      );

      res.json({
        message: 'Fields enhanced successfully',
        enhancedFields,
        totalFields: enhancedFields.length
      });
    } catch (error) {
      console.error('Error enhancing fields:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to enhance fields'
      });
    }
  }

  async downloadPopulatedDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Demo mode - use dummy user if no authentication
      if (!req.user) {
        req.user = { userId: 'demo-user' };
      }

      const { documentId, templateType } = req.params;

      if (!documentId || !templateType) {
        res.status(400).json({ message: 'Document ID and template type are required' });
        return;
      }

      const populatedDocuments = await this.templatePopulationService.populateTemplatesFromInvoice(documentId);
      const targetDocument = populatedDocuments.find(doc => doc.documentType === templateType);

      if (!targetDocument) {
        res.status(404).json({ message: 'Template not found or not populated' });
        return;
      }

      // Set appropriate headers for file download
      const filename = `${templateType}_${documentId}.txt`;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      res.send(targetDocument.content);
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to download document'
      });
    }
  }
}
