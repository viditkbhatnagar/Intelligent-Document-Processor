import { 
  BusinessTransaction, 
  ProcessedDocument, 
  WorkflowStep, 
  WorkflowSuggestion, 
  DocumentEntities,
  PaymentTerms 
} from '../types/document.types';
import { BusinessTransactionModel } from '../models/BusinessTransaction';
import { ProcessedDocumentModel } from '../models/Document';
import { AIService } from './ai.service';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowEngine {
  private aiService = new AIService();

  // Define workflow steps
  private workflowSteps = {
    quotation_received: {
      stepId: 'quotation_received',
      stepName: 'Quotation Received',
      description: 'Supplier has provided pricing via quotation',
      requiredDocuments: ['quotation'],
      optionalDocuments: [],
      expectedNextSteps: ['po_issued']
    },
    proforma_invoice_received: {
      stepId: 'proforma_invoice_received', 
      stepName: 'Proforma Invoice Received',
      description: 'Supplier has provided pricing via proforma invoice',
      requiredDocuments: ['proforma_invoice'],
      optionalDocuments: [],
      expectedNextSteps: ['po_issued']
    },
    po_issued: {
      stepId: 'po_issued',
      stepName: 'Purchase Order Issued',
      description: 'Trading company has confirmed purchase with supplier',
      requiredDocuments: ['purchase_order'],
      optionalDocuments: ['quotation', 'proforma_invoice'],
      expectedNextSteps: ['proforma_received', 'payment_made']
    },
    proforma_received: {
      stepId: 'proforma_received',
      stepName: 'Proforma Invoice Received',
      description: 'Supplier has issued proforma invoice after PO',
      requiredDocuments: ['proforma_invoice', 'purchase_order'],
      optionalDocuments: ['quotation'],
      expectedNextSteps: ['payment_made']
    },
    payment_made: {
      stepId: 'payment_made',
      stepName: 'Payment Made',
      description: 'Trading company has paid supplier according to payment terms',
      requiredDocuments: ['proforma_invoice', 'purchase_order'],
      optionalDocuments: ['payment_confirmation'],
      expectedNextSteps: ['order_ready']
    },
    order_ready: {
      stepId: 'order_ready',
      stepName: 'Order Ready for Shipment',
      description: 'Supplier has prepared the order for shipment',
      requiredDocuments: ['proforma_invoice', 'purchase_order'],
      optionalDocuments: ['shipping_confirmation'],
      expectedNextSteps: ['invoice_received']
    },
    invoice_received: {
      stepId: 'invoice_received',
      stepName: 'Invoice and Documents Received',
      description: 'Supplier has issued commercial/tax invoice and packing list',
      requiredDocuments: ['commercial_invoice', 'packing_list'],
      optionalDocuments: ['tax_invoice', 'bill_of_lading'],
      expectedNextSteps: ['completed']
    },
    completed: {
      stepId: 'completed',
      stepName: 'Transaction Completed',
      description: 'All documents received and transaction is complete',
      requiredDocuments: ['commercial_invoice', 'packing_list', 'purchase_order'],
      optionalDocuments: ['bill_of_lading', 'covering_letter', 'bill_of_exchange'],
      expectedNextSteps: []
    }
  };

  /**
   * Process a newly uploaded document and determine workflow actions
   */
  async processDocumentWorkflow(document: ProcessedDocument): Promise<any | null> {
    try {
      // Check if document belongs to existing transaction
      const existingTransaction = await this.findRelatedTransaction(document);
      
      if (existingTransaction) {
        return await this.updateExistingTransaction(existingTransaction, document);
      } else {
        return await this.createNewTransaction(document);
      }
    } catch (error) {
      console.error('Error processing document workflow:', error);
      throw new Error('Failed to process document workflow');
    }
  }

  /**
   * Find existing transaction that this document might belong to
   */
  private async findRelatedTransaction(document: ProcessedDocument): Promise<any | null> {
    if (document.transactionId) {
      const transaction = await BusinessTransactionModel.findOne({
        transactionId: document.transactionId,
        userId: document.userId
      });
      return transaction;
    }

    // Find related transactions based on entities and business logic
    const transactions = await BusinessTransactionModel.find({
      userId: document.userId,
      status: { $ne: 'completed' },
      createdDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Within last 7 days
    }).sort({ createdDate: -1 });

    // Extract current document entities
    const currentEntities = document.entities || {};
    
    for (const transaction of transactions) {
      if (this.areDocumentsRelated(document, transaction, currentEntities)) {
        return transaction;
      }
    }

    return null;
  }

  /**
   * Check if documents are related based on business entities
   */
  private areDocumentsRelated(document: ProcessedDocument, transaction: any, currentEntities: any): boolean {
    const transactionEntities = transaction.entities || {};
    
    // Check supplier name match (most reliable indicator)
    const currentSupplier = this.extractCompanyName(currentEntities.supplier) || 
                           this.extractFieldValue(document.extractedFields, ['supplier_name', 'seller_name']);
    const transactionSupplier = this.extractCompanyName(transactionEntities.supplier) || 
                               this.extractCompanyName(transactionEntities.tradingCompany);
    
    if (currentSupplier && transactionSupplier && 
        this.normalizeCompanyName(currentSupplier) === this.normalizeCompanyName(transactionSupplier)) {
      return true;
    }

    // Check trading company name match
    const currentTradingCo = this.extractCompanyName(currentEntities.tradingCompany) ||
                            this.extractFieldValue(document.extractedFields, ['buyer_name', 'customer_name']);
    const transactionTradingCo = this.extractCompanyName(transactionEntities.tradingCompany);
    
    if (currentTradingCo && transactionTradingCo && 
        this.normalizeCompanyName(currentTradingCo) === this.normalizeCompanyName(transactionTradingCo)) {
      return true;
    }

    // Check invoice/reference numbers
    const currentInvoiceNum = this.extractFieldValue(document.extractedFields, ['invoice_number', 'po_number', 'reference_number']);
    if (currentInvoiceNum && transaction.documents) {
      for (const doc of transaction.documents) {
        // We could check if document has same invoice number, but this is complex
        // For now, rely on company name matching which is more reliable
      }
    }

    return false;
  }

  private extractCompanyName(entity: any): string | null {
    if (!entity) return null;
    return entity.name || entity.companyName || null;
  }

  private extractFieldValue(fields: any[], keys: string[]): string | null {
    if (!fields) return null;
    for (const field of fields) {
      if (keys.includes(field.key) && field.value) {
        return field.value;
      }
    }
    return null;
  }

  private normalizeCompanyName(name: string): string {
    return name.toLowerCase()
               .replace(/\s+ltd\.?$/i, '')
               .replace(/\s+limited$/i, '')
               .replace(/\s+corp\.?$/i, '')
               .replace(/\s+inc\.?$/i, '')
               .replace(/\s+company$/i, '')
               .trim();
  }

  /**
   * Create new transaction from document
   */
  private async createNewTransaction(document: ProcessedDocument): Promise<any> {
    const transactionId = uuidv4();
    
    // Extract entities from document
    const entities = await this.extractEntitiesFromDocument(document);
    
    // Determine initial workflow step
    const currentStep = this.determineInitialWorkflowStep(document.documentType);
    
    // Generate initial suggestions
    const suggestions = await this.generateWorkflowSuggestions(currentStep, [document]);

    const transaction = new BusinessTransactionModel({
      transactionId,
      userId: document.userId,
      status: this.getStatusFromStep(currentStep.stepId),
      currentStep,
      entities,
      documents: [{
        documentId: document._id!,
        documentType: document.documentType,
        uploadDate: document.uploadDate,
        processedDate: document.processedDate,
        status: document.status,
        role: 'source'
      }],
      nextSuggestedActions: suggestions,
      createdDate: new Date(),
      updatedDate: new Date()
    });

    await transaction.save();

    // Update document with transaction ID
    await ProcessedDocumentModel.findByIdAndUpdate(document._id, {
      transactionId: transactionId
    });

    console.log(`Created new transaction ${transactionId} for document ${document._id} (${document.documentType})`);

    return transaction;
  }

  /**
   * Update existing transaction with new document
   */
  private async updateExistingTransaction(
    transaction: any, 
    document: ProcessedDocument
  ): Promise<any> {
    // Add document to transaction
    const updatedTransaction = await BusinessTransactionModel.findByIdAndUpdate(
      transaction._id,
      {
        $push: {
          documents: {
            documentId: document._id!,
            documentType: document.documentType,
            uploadDate: document.uploadDate,
            processedDate: document.processedDate,
            status: document.status,
            role: 'received'
          }
        },
        updatedDate: new Date()
      },
      { new: true }
    );

    if (!updatedTransaction) {
      throw new Error('Failed to update transaction');
    }

    // Update document with transaction ID
    await ProcessedDocumentModel.findByIdAndUpdate(document._id, {
      transactionId: updatedTransaction.transactionId
    });

    console.log(`Updated transaction ${updatedTransaction.transactionId} with document ${document._id} (${document.documentType})`);

    // Determine if workflow step should advance
    const newStep = await this.shouldAdvanceWorkflow(updatedTransaction, document);
    
    if (newStep) {
      const suggestions = await this.generateWorkflowSuggestions(
        newStep, 
        await this.getTransactionDocumentsInternal(updatedTransaction)
      );

      await BusinessTransactionModel.findByIdAndUpdate(transaction._id, {
        status: this.getStatusFromStep(newStep.stepId),
        currentStep: newStep,
        nextSuggestedActions: suggestions,
        updatedDate: new Date()
      });
    }

    return updatedTransaction;
  }

  /**
   * Determine initial workflow step based on document type
   */
  private determineInitialWorkflowStep(documentType: string): WorkflowStep {
    switch (documentType) {
      case 'quotation':
        return this.workflowSteps.quotation_received;
      case 'proforma_invoice':
        return this.workflowSteps.proforma_invoice_received;
      case 'purchase_order':
        return this.workflowSteps.po_issued;
      default:
        return this.workflowSteps.quotation_received;
    }
  }

  /**
   * Check if workflow should advance based on new document
   */
  private async shouldAdvanceWorkflow(
    transaction: any, 
    newDocument: ProcessedDocument
  ): Promise<WorkflowStep | null> {
    const currentStep = transaction.currentStep;
    const documentTypes = transaction.documents.map((d: any) => d.documentType);
    
    // Check workflow advancement logic based on business rules
    switch (currentStep.stepId) {
      case 'quotation_received':
        if (newDocument.documentType === 'purchase_order') {
          return this.workflowSteps.po_issued;
        }
        break;
        
      case 'proforma_invoice_received':
        if (newDocument.documentType === 'purchase_order') {
          return this.workflowSteps.po_issued;
        }
        break;
        
      case 'po_issued':
        // If supplier had quotation initially, they should issue proforma invoice
        if (documentTypes.includes('quotation') && newDocument.documentType === 'proforma_invoice') {
          return this.workflowSteps.proforma_received;
        }
        // If supplier had proforma invoice initially, wait for commercial invoice
        if (documentTypes.includes('proforma_invoice')) {
          return this.workflowSteps.proforma_received;
        }
        break;
        
      case 'proforma_received':
        // Move to invoice received when commercial/tax invoice is uploaded
        if (newDocument.documentType === 'commercial_invoice' || newDocument.documentType === 'tax_invoice') {
          return this.workflowSteps.invoice_received;
        }
        break;
        
      case 'payment_made':
        // Skip shipping confirmation check for now  
        // if (newDocument.documentType === 'shipping_confirmation') {
        //   return this.workflowSteps.order_ready;
        // }
        break;
        
      case 'order_ready':
        if (newDocument.documentType === 'commercial_invoice' || newDocument.documentType === 'tax_invoice') {
          return this.workflowSteps.invoice_received;
        }
        break;
        
      case 'invoice_received':
        // Check if all required documents are present
        const hasInvoice = documentTypes.some((type: string) => 
          ['commercial_invoice', 'tax_invoice', 'invoice'].includes(type)
        );
        const hasPackingList = documentTypes.includes('packing_list');
        
        if (hasInvoice && hasPackingList) {
          return this.workflowSteps.completed;
        }
        break;
    }
    
    return null;
  }

  /**
   * Generate intelligent workflow suggestions
   */
  private async generateWorkflowSuggestions(
    currentStep: WorkflowStep, 
    documents: ProcessedDocument[]
  ): Promise<WorkflowSuggestion[]> {
    const suggestions: WorkflowSuggestion[] = [];
    const documentTypes = documents.map(d => d.documentType);

    switch (currentStep.stepId) {
      case 'quotation_received':
        suggestions.push({
          action: 'issue_purchase_order',
          description: 'Issue Purchase Order (PO) to confirm purchase from supplier',
          priority: 'high',
          requiredDocuments: ['purchase_order'],
          confidence: 0.95
        });
        break;

      case 'proforma_invoice_received':
        suggestions.push({
          action: 'issue_purchase_order',
          description: 'Issue Purchase Order (PO) to confirm purchase from supplier',
          priority: 'high',
          requiredDocuments: ['purchase_order'],
          confidence: 0.95
        });
        break;

      case 'po_issued':
        if (documentTypes.includes('quotation')) {
          suggestions.push({
            action: 'wait_proforma_invoice',
            description: 'Wait for supplier to issue Proforma Invoice',
            priority: 'medium',
            confidence: 0.85
          });
        } else {
          suggestions.push({
            action: 'make_payment',
            description: 'Proceed with payment according to payment terms',
            priority: 'high',
            confidence: 0.90
          });
        }
        break;

      case 'proforma_received':
        suggestions.push({
          action: 'make_payment',
          description: 'Make payment to supplier (full or partial based on payment terms)',
          priority: 'high',
          confidence: 0.95
        });
        break;

      case 'payment_made':
        suggestions.push({
          action: 'wait_order_ready',
          description: 'Wait for supplier to prepare order for shipment',
          priority: 'medium',
          confidence: 0.80
        });
        break;

      case 'order_ready':
        suggestions.push({
          action: 'wait_invoice_documents',
          description: 'Wait for supplier to issue commercial/tax invoice and packing list',
          priority: 'high',
          confidence: 0.90
        });
        break;

      case 'invoice_received':
        if (!documentTypes.includes('packing_list')) {
          suggestions.push({
            action: 'request_packing_list',
            description: 'Request packing list from supplier',
            priority: 'high',
            confidence: 0.95
          });
        }
        
        suggestions.push({
          action: 'generate_supporting_docs',
          description: 'Generate covering letter and bill of exchange if needed',
          priority: 'medium',
          confidence: 0.75
        });
        break;
    }

    return suggestions;
  }

  /**
   * Extract entities from document using AI
   */
  private async extractEntitiesFromDocument(document: ProcessedDocument): Promise<DocumentEntities> {
    // Use AI to extract entity information from document fields
    return await this.aiService.extractDocumentEntities(document.extractedFields, document.documentType);
  }

  /**
   * Get transaction documents (public method for controllers)
   */
  async getTransactionDocuments(transactionId: string): Promise<ProcessedDocument[]> {
    try {
      const documents = await ProcessedDocumentModel.find({
        transactionId: transactionId
      }).sort({ uploadDate: 1 });

      return documents as ProcessedDocument[];
    } catch (error) {
      console.error('Error getting transaction documents:', error);
      throw new Error('Failed to get transaction documents');
    }
  }

  /**
   * Get transaction documents (private helper method)
   */
  private async getTransactionDocumentsInternal(transaction: any): Promise<ProcessedDocument[]> {
    const documentIds = transaction.documents.map((d: any) => d.documentId);
    return await ProcessedDocumentModel.find({
      _id: { $in: documentIds }
    });
  }

  /**
   * Convert workflow step to transaction status
   */
  private getStatusFromStep(stepId: string): string {
    const statusMap: { [key: string]: string } = {
      'quotation_received': 'quotation_received',
      'proforma_invoice_received': 'quotation_received',
      'po_issued': 'po_issued',
      'proforma_received': 'proforma_received',
      'payment_made': 'payment_made',
      'order_ready': 'order_ready',
      'invoice_received': 'invoice_received',
      'completed': 'completed'
    };
    
    return statusMap[stepId] || 'quotation_received';
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(userId: string): Promise<any[]> {
    return await BusinessTransactionModel.find({ userId }).sort({ updatedDate: -1 });
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string, userId: string): Promise<any | null> {
    return await BusinessTransactionModel.findOne({ transactionId, userId });
  }

  /**
   * Update transaction manually
   */
  async updateTransactionStatus(
    transactionId: string, 
    userId: string, 
    status: string,
    notes?: string
  ): Promise<any | null> {
    const transaction = await BusinessTransactionModel.findOne({ transactionId, userId });
    
    if (!transaction) {
      return null;
    }

    const newStep = Object.values(this.workflowSteps).find(step => 
      this.getStatusFromStep(step.stepId) === status
    );

    if (!newStep) {
      console.log(`No valid workflow step found for status: ${status}`);
      return null;
    }

    const documents = await this.getTransactionDocumentsInternal(transaction);
    const suggestions = await this.generateWorkflowSuggestions(newStep, documents);

    return await BusinessTransactionModel.findByIdAndUpdate(
      transaction._id,
      {
        status,
        currentStep: newStep,
        nextSuggestedActions: suggestions,
        updatedDate: new Date()
      },
      { new: true }
    );
  }
}
