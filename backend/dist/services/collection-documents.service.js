"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionDocumentsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BusinessTransaction_1 = require("../models/BusinessTransaction");
const Document_1 = require("../models/Document");
const company_service_1 = require("./company.service");
const customer_service_1 = require("./customer.service");
const ai_service_1 = require("./ai.service");
const ocr_service_1 = require("./ocr.service");
class CollectionDocumentsService {
    constructor() {
        this.companyService = new company_service_1.CompanyService();
        this.customerService = new customer_service_1.CustomerService();
        this.aiService = new ai_service_1.AIService();
        this.ocrService = new ocr_service_1.OCRService();
    }
    /**
     * Generate collection documents (covering letter + bill of exchange)
     */
    async generateCollectionDocuments(request) {
        try {
            // Get transaction details
            const transaction = await BusinessTransaction_1.BusinessTransactionModel.findOne({
                transactionId: request.transactionId
            }).exec();
            if (!transaction) {
                throw new Error('Transaction not found');
            }
            // Process transport document to extract date and number
            const transportDocData = await this.processTransportDocument(request.transportDocumentFile, request.transportDocumentType, transaction.shipmentMethod);
            // Get company and customer details
            const company = await this.companyService.getCompanyById(transaction.companyId.toString());
            const customer = await this.customerService.getCustomerById(transaction.customerId.toString());
            if (!company || !customer) {
                throw new Error('Missing required company or customer information');
            }
            // Generate covering letter
            const coveringLetter = this.generateCoveringLetter(transaction, company, customer, request, transportDocData);
            // Generate bill of exchange
            const billOfExchange = this.generateBillOfExchange(transaction, company, customer, request, transportDocData);
            // Store transport document
            await this.storeTransportDocument(request, transportDocData, transaction.transactionId);
            // Update transaction status to completed
            await BusinessTransaction_1.BusinessTransactionModel.findOneAndUpdate({ transactionId: request.transactionId }, {
                status: 'completed',
                updatedDate: new Date()
            });
            return {
                coveringLetter,
                billOfExchange,
                transportDocumentData: transportDocData
            };
        }
        catch (error) {
            console.error('Error generating collection documents:', error);
            throw new Error(`Failed to generate collection documents: ${error}`);
        }
    }
    /**
     * Process transport document to extract date and number
     */
    async processTransportDocument(fileBuffer, mimeType, shipmentMethod) {
        try {
            // Extract text from transport document
            const extractedText = await this.ocrService.extractTextFromBuffer(fileBuffer, mimeType);
            // Use AI to extract document number and date
            const fields = await this.aiService.extractDocumentFields(extractedText, 'transport_document');
            // Find document number
            const numberField = fields.find(f => f.key.toLowerCase().includes('number') ||
                f.key.toLowerCase().includes('bl') ||
                f.key.toLowerCase().includes('awb') ||
                f.key.toLowerCase().includes('rwb'));
            // Find document date
            const dateField = fields.find(f => f.type === 'date' ||
                f.key.toLowerCase().includes('date'));
            const documentNumber = numberField?.value || `DOC-${Date.now()}`;
            const documentDate = dateField?.value ? new Date(dateField.value) : new Date();
            let documentType;
            switch (shipmentMethod.toLowerCase()) {
                case 'sea':
                    documentType = 'BL';
                    break;
                case 'air':
                    documentType = 'AWB';
                    break;
                case 'road':
                    documentType = 'RWB';
                    break;
                default:
                    documentType = 'BL';
            }
            return {
                documentNumber,
                documentDate,
                documentType
            };
        }
        catch (error) {
            console.error('Error processing transport document:', error);
            // Return default values if processing fails
            return {
                documentNumber: `DOC-${Date.now()}`,
                documentDate: new Date(),
                documentType: 'BL'
            };
        }
    }
    /**
     * Generate covering letter based on bank template
     */
    generateCoveringLetter(transaction, company, customer, request, transportDoc) {
        const bankDetails = this.getBankDetails(request.bankName);
        const content = `
${bankDetails.name}
${bankDetails.address}

COVERING LETTER

Date: ${new Date().toDateString()}
Reference: ${transaction.orderReferenceNumber}

Dear Sirs,

We are pleased to enclose the following documents for collection as per LC/Contract terms:

DOCUMENTS ENCLOSED:
1. Commercial Invoice No. ${request.invoiceData.invoiceNumber}
2. ${transportDoc.documentType} No. ${transportDoc.documentNumber} dated ${transportDoc.documentDate.toDateString()}
3. Packing List
4. Certificate of Origin (if applicable)

SHIPMENT DETAILS:
- Shipper: ${company.name}
- Consignee: ${customer.name}
- Invoice Amount: ${request.invoiceData.currency} ${request.invoiceData.invoiceAmount.toFixed(2)}
- ${transportDoc.documentType} No: ${transportDoc.documentNumber}
- ${transportDoc.documentType} Date: ${transportDoc.documentDate.toDateString()}
- Shipping Terms: ${transaction.shippingTerms || 'As agreed'}

PAYMENT TERMS: ${transaction.paymentTerms?.description || '180 DAYS FROM ' + transportDoc.documentType}

Please arrange collection from the consignee and credit proceeds to our account as per standing instructions.

We confirm that the documents are in order and complete as per the terms of the underlying sales contract.

Thank you for your services.

Yours faithfully,

${company.name}
Authorized Signatory

---
${bankDetails.footer || ''}
    `;
        return {
            type: 'covering_letter',
            content: content.trim(),
            bankName: request.bankName
        };
    }
    /**
     * Generate bill of exchange based on bank template
     */
    generateBillOfExchange(transaction, company, customer, request, transportDoc) {
        const bankDetails = this.getBankDetails(request.bankName);
        const maturityDate = new Date();
        maturityDate.setDate(maturityDate.getDate() + 180); // 180 days from BL/AWB/RWB date
        const content = `
BILL OF EXCHANGE

${bankDetails.name}
${bankDetails.address}

Bill of Exchange No.: BE-${transaction.orderReferenceNumber}-${Date.now()}
Date: ${new Date().toDateString()}

FOR ${request.invoiceData.currency} ${request.invoiceData.invoiceAmount.toFixed(2)}

At 180 days after sight of this FIRST Bill of Exchange (Second unpaid)
Pay to the order of ${bankDetails.name}
The sum of ${this.numberToWords(request.invoiceData.invoiceAmount)} ${request.invoiceData.currency} only

Drawn under:
Invoice No: ${request.invoiceData.invoiceNumber}
${transportDoc.documentType} No: ${transportDoc.documentNumber}
${transportDoc.documentType} Date: ${transportDoc.documentDate.toDateString()}

Value received and charge to account of:

To: ${customer.name}
    ${customer.address}

Drawn by: ${company.name}
          ${company.address}

Date of Maturity: ${maturityDate.toDateString()}

_________________________
Authorized Signature
${company.name}

---
ENDORSEMENT:
Pay to the order of ${bankDetails.name}

_________________________
${bankDetails.endorsementLine || 'Authorized Officer'}

---
${bankDetails.footer || ''}
    `;
        return {
            type: 'bill_of_exchange',
            content: content.trim(),
            bankName: request.bankName
        };
    }
    /**
     * Store transport document in database
     */
    async storeTransportDocument(request, transportDocData, transactionId) {
        try {
            // Store transport document file (simplified - in production use GridFS)
            const transportDocument = new Document_1.ProcessedDocumentModel({
                filename: request.transportDocumentName,
                originalName: request.transportDocumentName,
                mimeType: request.transportDocumentType,
                size: request.transportDocumentFile.length,
                userId: 'system', // System generated
                status: 'processed',
                documentType: 'transport_document',
                extractedFields: [
                    {
                        key: 'documentNumber',
                        value: transportDocData.documentNumber,
                        confidence: 0.9,
                        type: 'text'
                    },
                    {
                        key: 'documentDate',
                        value: transportDocData.documentDate.toISOString(),
                        confidence: 0.9,
                        type: 'date'
                    },
                    {
                        key: 'documentType',
                        value: transportDocData.documentType,
                        confidence: 1.0,
                        type: 'text'
                    }
                ],
                transactionId,
                fileId: new mongoose_1.default.Types.ObjectId() // Placeholder
            });
            await transportDocument.save();
        }
        catch (error) {
            console.error('Error storing transport document:', error);
            // Don't fail the main process for this
        }
    }
    /**
     * Get bank details for different banks
     */
    getBankDetails(bankName) {
        const banks = {
            'ADIB': {
                name: 'Abu Dhabi Islamic Bank',
                address: 'P.O. Box 313, Abu Dhabi, UAE',
                footer: 'Licensed by the Central Bank of UAE',
                endorsementLine: 'For ADIB'
            },
            'DIB': {
                name: 'Dubai Islamic Bank',
                address: 'P.O. Box 1080, Dubai, UAE',
                footer: 'Licensed by the Central Bank of UAE',
                endorsementLine: 'For DIB'
            },
            'BOK': {
                name: 'Bank of Kuwait',
                address: 'P.O. Box 1066, Kuwait',
                footer: 'Licensed by the Central Bank of Kuwait',
                endorsementLine: 'For BOK'
            }
        };
        return banks[bankName] || banks['ADIB'];
    }
    /**
     * Convert number to words (simplified version)
     */
    numberToWords(amount) {
        // This is a simplified version - in production use a proper number-to-words library
        const rounded = Math.round(amount);
        if (rounded < 1000)
            return `${rounded}`;
        if (rounded < 1000000)
            return `${Math.round(rounded / 1000)} Thousand`;
        return `${Math.round(rounded / 1000000)} Million`;
    }
    /**
     * Get available banks for dropdown
     */
    getAvailableBanks() {
        return ['ADIB', 'DIB', 'BOK'];
    }
}
exports.CollectionDocumentsService = CollectionDocumentsService;
//# sourceMappingURL=collection-documents.service.js.map