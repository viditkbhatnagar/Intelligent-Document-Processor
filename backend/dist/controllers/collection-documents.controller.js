"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionDocumentsController = void 0;
const collection_documents_service_1 = require("../services/collection-documents.service");
class CollectionDocumentsController {
    constructor() {
        this.collectionService = new collection_documents_service_1.CollectionDocumentsService();
    }
    /**
     * Get available banks for dropdown
     */
    async getAvailableBanks(req, res) {
        try {
            const banks = this.collectionService.getAvailableBanks();
            res.json({
                success: true,
                banks: banks.map(bank => ({
                    code: bank,
                    name: this.getBankFullName(bank)
                }))
            });
        }
        catch (error) {
            console.error('Error fetching banks:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch banks list'
            });
        }
    }
    /**
     * Generate collection documents
     */
    async generateCollectionDocuments(req, res) {
        try {
            const userId = req.user?.userId || 'demo-user';
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: 'Transport document file is required'
                });
                return;
            }
            const { transactionId, bankName, invoiceNumber, invoiceAmount, currency } = req.body;
            // Validate required fields
            if (!transactionId || !bankName || !invoiceNumber || !invoiceAmount || !currency) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
                return;
            }
            const request = {
                transactionId,
                bankName: bankName,
                invoiceData: {
                    invoiceNumber,
                    invoiceAmount: parseFloat(invoiceAmount),
                    currency
                },
                transportDocumentFile: req.file.buffer,
                transportDocumentType: req.file.mimetype,
                transportDocumentName: req.file.originalname
            };
            const result = await this.collectionService.generateCollectionDocuments(request);
            res.json({
                success: true,
                coveringLetter: result.coveringLetter,
                billOfExchange: result.billOfExchange,
                transportDocument: result.transportDocumentData,
                message: 'Collection documents generated successfully'
            });
        }
        catch (error) {
            console.error('Error generating collection documents:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to generate collection documents'
            });
        }
    }
    /**
     * Get bank full name from code
     */
    getBankFullName(code) {
        const bankNames = {
            'ADIB': 'Abu Dhabi Islamic Bank',
            'DIB': 'Dubai Islamic Bank',
            'BOK': 'Bank of Kuwait'
        };
        return bankNames[code] || code;
    }
}
exports.CollectionDocumentsController = CollectionDocumentsController;
//# sourceMappingURL=collection-documents.controller.js.map