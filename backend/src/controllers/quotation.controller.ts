import { Request, Response } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { ProcessedDocumentModel } from '../models/Document';
import { BusinessTransactionModel } from '../models/BusinessTransaction';
import { CompanyService } from '../services/company.service';
import { CustomerService } from '../services/customer.service';
import { SupplierService } from '../services/supplier.service';
import { WorkflowEngine } from '../services/workflow-engine.service';
import { AIService } from '../services/ai.service';
import { OCRService } from '../services/ocr.service';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export class QuotationController {
  private companyService = new CompanyService();
  private customerService = new CustomerService();
  private supplierService = new SupplierService();
  private workflowEngine = new WorkflowEngine();
  private aiService = new AIService();
  private ocrService = new OCRService();

  /**
   * Get companies for dropdown (Rock Stone / Kinship)
   */
  async getCompanies(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const companies = await this.companyService.getActiveCompanies();
      res.json({ companies });
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ message: 'Failed to fetch companies' });
    }
  }

  /**
   * Get customers for dropdown
   */
  async getCustomers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search } = req.query;
      const userId = req.user?.userId || 'demo-user';

      let customers;
      if (search && typeof search === 'string') {
        customers = await this.customerService.searchCustomers(search, userId);
      } else {
        customers = await this.customerService.getActiveCustomers(userId);
      }

      res.json({ customers });
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ message: 'Failed to fetch customers' });
    }
  }

  /**
   * Create a new customer
   */
  async createCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'demo-user';
      const customerData = req.body;

      const customer = await this.customerService.createCustomer(customerData, userId);
      res.status(201).json({ customer });
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ message: 'Failed to create customer' });
    }
  }

  /**
   * Upload quotation with workflow data
   */
  async uploadQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'demo-user';
      
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const { 
        orderReferenceNumber, 
        companyId, 
        customerId, 
        shipmentMethod,
        shippingTerms,
        portName,
        buyerOrderReference 
      } = req.body;

      // Validate required fields
      if (!orderReferenceNumber || !companyId || !customerId || !shipmentMethod) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      // Store file in GridFS
      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db!, { bucketName: 'uploads' });
      
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        metadata: {
          userId,
          uploadDate: new Date(),
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size
        }
      });

      const fileId = uploadStream.id;

      uploadStream.end(req.file.buffer);

      // Create document record
      const document = new ProcessedDocumentModel({
        filename: `${fileId}.${req.file.originalname.split('.').pop()}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        userId,
        status: 'uploaded',
        documentType: 'quotation',
        extractedFields: [],
        fileId
      });

      await document.save();

      // Generate automatic payment terms based on shipment method
      const paymentTerms = this.generatePaymentTerms(shipmentMethod);

      // Create business transaction
      const transactionId = `${orderReferenceNumber}-${Date.now()}`;
      
      const transaction = new BusinessTransactionModel({
        transactionId,
        userId,
        status: 'quotation_received',
        currentStep: {
          stepId: 'quotation_received',
          stepName: 'Quotation Received',
          description: 'Supplier has provided pricing via quotation',
          requiredDocuments: ['quotation'],
          optionalDocuments: [],
          expectedNextSteps: ['po_issued']
        },
        entities: {
          supplier: null, // Will be extracted from document
          tradingCompany: null, // Will be set based on company selection
          customer: null // Will be set from customer selection
        },
        documents: [{
          documentId: document._id!.toString(),
          documentType: 'quotation',
          uploadDate: new Date(),
          status: 'uploaded',
          role: 'source'
        }],
        paymentTerms: {
          type: 'credit',
          description: paymentTerms
        },
        orderReferenceNumber,
        companyId: new mongoose.Types.ObjectId(companyId),
        customerId: new mongoose.Types.ObjectId(customerId),
        shipmentMethod,
        shippingTerms,
        portName,
        buyerOrderReference
      });

      await transaction.save();

      // Update document with transaction ID
      document.transactionId = transactionId;
      await document.save();

      // Start async processing
      this.processQuotationAsync(document._id!.toString(), req.file.buffer, req.file.mimetype, transactionId);

      res.status(201).json({
        message: 'Quotation uploaded successfully',
        document: {
          id: document._id,
          originalName: document.originalName,
          status: document.status,
          transactionId
        }
      });

    } catch (error) {
      console.error('Error uploading quotation:', error);
      res.status(500).json({ message: 'Failed to upload quotation' });
    }
  }

  /**
   * Generate payment terms based on shipment method
   */
  private generatePaymentTerms(shipmentMethod: string): string {
    switch (shipmentMethod.toLowerCase()) {
      case 'sea':
        return '180 DAYS FROM BL';
      case 'air':
        return '180 DAYS FROM AWB';
      case 'road':
        return '180 DAYS FROM RWB';
      default:
        return '180 DAYS FROM SHIPPING DOCUMENT';
    }
  }

  /**
   * Process quotation document asynchronously
   */
  private async processQuotationAsync(documentId: string, fileBuffer: Buffer, mimeType: string, transactionId: string): Promise<void> {
    try {
      // Update status to processing
      await ProcessedDocumentModel.findByIdAndUpdate(documentId, {
        status: 'processing',
        processedDate: new Date()
      });

      // Extract text from document buffer
      const extractedText = await this.ocrService.extractTextFromBuffer(fileBuffer, mimeType);

      // Classify document type (should be quotation)
      const documentType = await this.aiService.classifyDocument(extractedText);

      // Extract fields using AI
      const extractedFields = await this.aiService.extractDocumentFields(extractedText, documentType);

      // Extract entities for workflow processing
      const entities = await this.aiService.extractDocumentEntities(extractedFields, documentType);

      // Detect supplier currency
      const supplierCurrency = this.detectCurrency(extractedFields);

      // Update document with results
      await ProcessedDocumentModel.findByIdAndUpdate(documentId, {
        status: 'processed',
        documentType,
        extractedFields,
        rawText: extractedText,
        entities,
        processedDate: new Date()
      });

      // Update transaction with extracted data
      const transaction = await BusinessTransactionModel.findOne({ transactionId });
      if (transaction) {
        // Find or create supplier
        if (entities.supplier) {
          const supplier = await this.supplierService.findOrCreateSupplierFromDocument(
            entities.supplier, 
            transaction.userId
          );
          
          transaction.supplierId = supplier._id as mongoose.Types.ObjectId;
          transaction.entities.supplier = entities.supplier;
        }

        // Set currency and exchange rate
        transaction.currency = supplierCurrency;
        if (supplierCurrency !== 'AED') {
          transaction.exchangeRate = this.getExchangeRate(supplierCurrency);
        }

        // Extract total amount if available
        const totalAmountField = extractedFields.find(f => 
          f.key.toLowerCase().includes('total') && f.type === 'currency'
        );
        if (totalAmountField) {
          transaction.totalAmount = parseFloat(totalAmountField.value.replace(/[^\d.]/g, ''));
        }

        await transaction.save();
      }

      console.log(`✅ Quotation ${documentId} processed successfully`);

    } catch (error) {
      console.error(`❌ Error processing quotation ${documentId}:`, error);
      
      await ProcessedDocumentModel.findByIdAndUpdate(documentId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Processing failed',
        processedDate: new Date()
      });
    }
  }

  /**
   * Detect currency from extracted fields
   */
  private detectCurrency(fields: any[]): string {
    const currencyField = fields.find(f => 
      f.key.toLowerCase().includes('currency') || 
      f.key.toLowerCase().includes('amount') ||
      f.type === 'currency'
    );

    if (currencyField) {
      const value = currencyField.value.toLowerCase();
      if (value.includes('usd') || value.includes('$')) return 'USD';
      if (value.includes('eur') || value.includes('€')) return 'EUR';
      if (value.includes('aed') || value.includes('dh')) return 'AED';
    }

    // Default to USD if not detected
    return 'USD';
  }

  /**
   * Get fixed exchange rates
   */
  private getExchangeRate(currency: string): number {
    const rates: { [key: string]: number } = {
      'USD': 3.68,
      'EUR': 4.55
    };
    
    return rates[currency] || 1;
  }
}
