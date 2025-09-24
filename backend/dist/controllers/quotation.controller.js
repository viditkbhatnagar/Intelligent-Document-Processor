"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("mongodb");
const Document_1 = require("../models/Document");
const BusinessTransaction_1 = require("../models/BusinessTransaction");
const company_service_1 = require("../services/company.service");
const customer_service_1 = require("../services/customer.service");
const supplier_service_1 = require("../services/supplier.service");
const workflow_engine_service_1 = require("../services/workflow-engine.service");
const ai_service_1 = require("../services/ai.service");
const ocr_service_1 = require("../services/ocr.service");
class QuotationController {
    constructor() {
        this.companyService = new company_service_1.CompanyService();
        this.customerService = new customer_service_1.CustomerService();
        this.supplierService = new supplier_service_1.SupplierService();
        this.workflowEngine = new workflow_engine_service_1.WorkflowEngine();
        this.aiService = new ai_service_1.AIService();
        this.ocrService = new ocr_service_1.OCRService();
    }
    /**
     * Get companies for dropdown (Rock Stone / Kinship)
     */
    async getCompanies(req, res) {
        try {
            const companies = await this.companyService.getActiveCompanies();
            res.json({ companies });
        }
        catch (error) {
            console.error('Error fetching companies:', error);
            res.status(500).json({ message: 'Failed to fetch companies' });
        }
    }
    /**
     * Get customers for dropdown
     */
    async getCustomers(req, res) {
        try {
            const { search } = req.query;
            const userId = req.user?.userId || 'demo-user';
            let customers;
            if (search && typeof search === 'string') {
                customers = await this.customerService.searchCustomers(search, userId);
            }
            else {
                customers = await this.customerService.getActiveCustomers(userId);
            }
            res.json({ customers });
        }
        catch (error) {
            console.error('Error fetching customers:', error);
            res.status(500).json({ message: 'Failed to fetch customers' });
        }
    }
    /**
     * Create a new customer
     */
    async createCustomer(req, res) {
        try {
            const userId = req.user?.userId || 'demo-user';
            const customerData = req.body;
            const customer = await this.customerService.createCustomer(customerData, userId);
            res.status(201).json({ customer });
        }
        catch (error) {
            console.error('Error creating customer:', error);
            res.status(500).json({ message: 'Failed to create customer' });
        }
    }
    /**
     * Upload quotation with workflow data
     */
    async uploadQuotation(req, res) {
        try {
            const userId = req.user?.userId || 'demo-user';
            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            }
            const { orderReferenceNumber, companyId, customerId, shipmentMethod, shippingTerms, portName, buyerOrderReference } = req.body;
            // Validate required fields
            if (!orderReferenceNumber || !companyId || !customerId || !shipmentMethod) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }
            // Store file in GridFS
            const db = mongoose_1.default.connection.db;
            const bucket = new mongodb_1.GridFSBucket(db, { bucketName: 'uploads' });
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
            const document = new Document_1.ProcessedDocumentModel({
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
            const transaction = new BusinessTransaction_1.BusinessTransactionModel({
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
                        documentId: document._id.toString(),
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
                companyId: new mongoose_1.default.Types.ObjectId(companyId),
                customerId: new mongoose_1.default.Types.ObjectId(customerId),
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
            this.processQuotationAsync(document._id.toString(), req.file.buffer, req.file.mimetype, transactionId);
            res.status(201).json({
                message: 'Quotation uploaded successfully',
                document: {
                    id: document._id,
                    originalName: document.originalName,
                    status: document.status,
                    transactionId
                }
            });
        }
        catch (error) {
            console.error('Error uploading quotation:', error);
            res.status(500).json({ message: 'Failed to upload quotation' });
        }
    }
    /**
     * Generate payment terms based on shipment method
     */
    generatePaymentTerms(shipmentMethod) {
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
    async processQuotationAsync(documentId, fileBuffer, mimeType, transactionId) {
        try {
            // Update status to processing
            await Document_1.ProcessedDocumentModel.findByIdAndUpdate(documentId, {
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
            await Document_1.ProcessedDocumentModel.findByIdAndUpdate(documentId, {
                status: 'processed',
                documentType,
                extractedFields,
                rawText: extractedText,
                entities,
                processedDate: new Date()
            });
            // Update transaction with extracted data
            const transaction = await BusinessTransaction_1.BusinessTransactionModel.findOne({ transactionId });
            if (transaction) {
                // Find or create supplier
                if (entities.supplier) {
                    const supplier = await this.supplierService.findOrCreateSupplierFromDocument(entities.supplier, transaction.userId);
                    transaction.supplierId = supplier._id;
                    transaction.entities.supplier = entities.supplier;
                }
                // Set currency and exchange rate
                transaction.currency = supplierCurrency;
                if (supplierCurrency !== 'AED') {
                    transaction.exchangeRate = this.getExchangeRate(supplierCurrency);
                }
                // Extract total amount if available
                const totalAmountField = extractedFields.find(f => f.key.toLowerCase().includes('total') && f.type === 'currency');
                if (totalAmountField) {
                    transaction.totalAmount = parseFloat(totalAmountField.value.replace(/[^\d.]/g, ''));
                }
                await transaction.save();
            }
            console.log(`✅ Quotation ${documentId} processed successfully`);
        }
        catch (error) {
            console.error(`❌ Error processing quotation ${documentId}:`, error);
            await Document_1.ProcessedDocumentModel.findByIdAndUpdate(documentId, {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Processing failed',
                processedDate: new Date()
            });
        }
    }
    /**
     * Detect currency from extracted fields
     */
    detectCurrency(fields) {
        const currencyField = fields.find(f => f.key.toLowerCase().includes('currency') ||
            f.key.toLowerCase().includes('amount') ||
            f.type === 'currency');
        if (currencyField) {
            const value = currencyField.value.toLowerCase();
            if (value.includes('usd') || value.includes('$'))
                return 'USD';
            if (value.includes('eur') || value.includes('€'))
                return 'EUR';
            if (value.includes('aed') || value.includes('dh'))
                return 'AED';
        }
        // Default to USD if not detected
        return 'USD';
    }
    /**
     * Get fixed exchange rates
     */
    getExchangeRate(currency) {
        const rates = {
            'USD': 3.68,
            'EUR': 4.55
        };
        return rates[currency] || 1;
    }
}
exports.QuotationController = QuotationController;
//# sourceMappingURL=quotation.controller.js.map