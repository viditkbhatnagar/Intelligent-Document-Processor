import { Request, Response } from 'express';
import { ProcessedDocumentModel, ProcessedDocumentDoc } from '../models/Document';
import { OCRService } from '../services/ocr.service';
import { AIService } from '../services/ai.service';
import { WorkflowEngine } from '../services/workflow-engine.service';
import { GridFSService } from '../services/gridfs.service';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export class DocumentController {
  private ocrService = new OCRService();
  private aiService = new AIService();
  private workflowEngine = new WorkflowEngine();
  private gridfsService = new GridFSService();

  async uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      // Demo mode - use dummy user if no authentication
      if (!req.user) {
        req.user = { userId: 'demo-user' };
      }

      const { originalname, buffer, mimetype, size } = req.file;
      
      // Generate unique filename
      const filename = `${uuidv4()}-${Date.now()}${path.extname(originalname)}`;

      // Store file in GridFS
      const fileId = await this.gridfsService.storeFile(
        buffer,
        filename,
        {
          originalName: originalname,
          mimeType: mimetype,
          userId: req.user.userId,
          uploadDate: new Date()
        }
      );

      // Create document record with GridFS file ID
      const document = new ProcessedDocumentModel({
        filename,
        originalName: originalname,
        mimeType: mimetype,
        size,
        userId: req.user.userId,
        status: 'uploaded',
        fileId: fileId
      });

      await document.save();

      // Start processing in background
      this.processDocumentAsync(document._id!.toString(), buffer, mimetype);

      const docData = document as ProcessedDocumentDoc;
      
      res.status(201).json({
        message: 'Document uploaded successfully',
        document: {
          id: document._id,
          originalName: docData.originalName,
          status: docData.status,
          uploadDate: docData.uploadDate
        }
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ message: 'Failed to upload document' });
    }
  }

  async getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Demo mode - use dummy user if no authentication
      if (!req.user) {
        req.user = { userId: 'demo-user' };
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const documentType = req.query.documentType as string;

      const filter: any = { userId: req.user.userId };
      if (status) filter.status = status;
      if (documentType) filter.documentType = documentType;

      const documents = await ProcessedDocumentModel
        .find(filter)
        .sort({ uploadDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-rawText'); // Exclude large text field

      const total = await ProcessedDocumentModel.countDocuments(filter);

      res.json({
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  }

  async getDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Demo mode - use dummy user if no authentication
      if (!req.user) {
        req.user = { userId: 'demo-user' };
      }

      const document = await ProcessedDocumentModel.findOne({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!document) {
        res.status(404).json({ message: 'Document not found' });
        return;
      }

      res.json({ document });

    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ message: 'Failed to fetch document' });
    }
  }

  async deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Demo mode - use dummy user if no authentication
      if (!req.user) {
        req.user = { userId: 'demo-user' };
      }

      const document = await ProcessedDocumentModel.findOne({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!document) {
        res.status(404).json({ message: 'Document not found' });
        return;
      }

      const docData = document as ProcessedDocumentDoc;
      
      // Delete file from GridFS
      try {
        await this.gridfsService.deleteFile(docData.fileId);
      } catch (fileError) {
        console.warn('Could not delete file from GridFS:', fileError);
      }

      await ProcessedDocumentModel.deleteOne({ _id: req.params.id });

      res.json({ message: 'Document deleted successfully' });

    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ message: 'Failed to delete document' });
    }
  }

  async reprocessDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Demo mode - use dummy user if no authentication
      if (!req.user) {
        req.user = { userId: 'demo-user' };
      }

      const document = await ProcessedDocumentModel.findOne({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!document) {
        res.status(404).json({ message: 'Document not found' });
        return;
      }

      const docData = document as ProcessedDocumentDoc;
      
      // Reset document status
      docData.status = 'processing';
      docData.extractedFields = [];
      docData.error = undefined;
      await document.save();

      // Reprocess document - get file from GridFS
      const fileBuffer = await this.gridfsService.getFile(docData.fileId);
      this.processDocumentAsync(document._id!.toString(), fileBuffer, docData.mimeType);

      res.json({ message: 'Document reprocessing started' });

    } catch (error) {
      console.error('Error reprocessing document:', error);
      res.status(500).json({ message: 'Failed to reprocess document' });
    }
  }

  private async processDocumentAsync(documentId: string, fileBuffer: Buffer, mimeType: string): Promise<void> {
    try {
      // Update status to processing
      await ProcessedDocumentModel.findByIdAndUpdate(documentId, {
        status: 'processing',
        processedDate: new Date()
      });

      // Extract text from document buffer
      const extractedText = await this.ocrService.extractTextFromBuffer(fileBuffer, mimeType);

      // Classify document type
      const documentType = await this.aiService.classifyDocument(extractedText);

      // Extract fields using AI
      const extractedFields = await this.aiService.extractDocumentFields(extractedText, documentType);

      // Extract entities for workflow processing
      const entities = await this.aiService.extractDocumentEntities(extractedFields, documentType);

      // Update document with results
      const updatedDocument = await ProcessedDocumentModel.findByIdAndUpdate(documentId, {
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
          await this.workflowEngine.processDocumentWorkflow(updatedDocument as any);
          console.log(`✅ Document ${documentId} processed successfully and added to workflow`);
        } catch (workflowError) {
          console.error(`⚠️ Document ${documentId} processed but workflow failed:`, workflowError);
        }
      }

    } catch (error) {
      console.error(`L Error processing document ${documentId}:`, error);
      
      await ProcessedDocumentModel.findByIdAndUpdate(documentId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Processing failed',
        processedDate: new Date()
      });
    }
  }
}