import { TemplateModel } from '../models/Template';
import { ProcessedDocumentModel } from '../models/Document';
import { AIService } from './ai.service';
import { DocumentField } from '../types/document.types';

export interface PopulatedDocument {
  templateName: string;
  documentType: string;
  content: string;
  confidence: number;
  fields: DocumentField[];
}

export class TemplatePopulationService {
  private aiService = new AIService();

  async populateTemplatesFromInvoice(documentId: string): Promise<PopulatedDocument[]> {
    try {
      // Get the processed invoice document
      const document = await ProcessedDocumentModel.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      if (document.documentType !== 'invoice') {
        throw new Error('Document must be an invoice');
      }

      if (!document.extractedFields || document.extractedFields.length === 0) {
        throw new Error('No extracted fields available');
      }

      // Get covering letter and bill of exchange templates
      const templates = await TemplateModel.find({
        documentType: { $in: ['covering_letter', 'bill_of_exchange'] },
        isActive: true
      });

      if (templates.length === 0) {
        throw new Error('No templates found');
      }

      const populatedDocuments: PopulatedDocument[] = [];

      // Populate each template
      for (const template of templates) {
        const templateData = {
          ...template.toObject(),
          _id: template._id?.toString(),
          templateContent: template.templateContent || ''
        };
        const result = await this.aiService.generatePopulatedTemplate(
          document.extractedFields,
          templateData
        );

        populatedDocuments.push({
          templateName: template.name,
          documentType: template.documentType,
          content: result.populatedContent,
          confidence: result.confidence,
          fields: document.extractedFields
        });
      }

      return populatedDocuments;
    } catch (error) {
      console.error('Error populating templates:', error);
      throw new Error(`Failed to populate templates: ${error}`);
    }
  }

  async getAvailableTemplates() {
    try {
      const templates = await TemplateModel.find({ isActive: true })
        .select('name description documentType fields');
      return templates;
    } catch (error) {
      console.error('Error getting templates:', error);
      throw new Error('Failed to get templates');
    }
  }

  async previewTemplatePopulation(
    extractedFields: DocumentField[],
    templateId: string
  ): Promise<PopulatedDocument> {
    try {
      const template = await TemplateModel.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const templateData = {
        ...template.toObject(),
        _id: template._id?.toString(),
        templateContent: template.templateContent || ''
      };
      const result = await this.aiService.generatePopulatedTemplate(
        extractedFields,
        templateData
      );

      return {
        templateName: template.name,
        documentType: template.documentType,
        content: result.populatedContent,
        confidence: result.confidence,
        fields: extractedFields
      };
    } catch (error) {
      console.error('Error previewing template population:', error);
      throw new Error(`Failed to preview template: ${error}`);
    }
  }

  async enhanceFieldExtraction(
    documentId: string,
    additionalFields: DocumentField[]
  ): Promise<DocumentField[]> {
    try {
      const document = await ProcessedDocumentModel.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Merge additional fields with existing ones
      const existingFields = document.extractedFields || [];
      const enhancedFields = [...existingFields];

      for (const newField of additionalFields) {
        const existingIndex = enhancedFields.findIndex(f => f.key === newField.key);
        if (existingIndex >= 0) {
          // Update existing field
          enhancedFields[existingIndex] = newField;
        } else {
          // Add new field
          enhancedFields.push(newField);
        }
      }

      // Update document with enhanced fields
      await ProcessedDocumentModel.findByIdAndUpdate(documentId, {
        extractedFields: enhancedFields
      });

      return enhancedFields;
    } catch (error) {
      console.error('Error enhancing field extraction:', error);
      throw new Error(`Failed to enhance fields: ${error}`);
    }
  }
}
