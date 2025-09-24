"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowTransactionsController = void 0;
const BusinessTransaction_1 = require("../models/BusinessTransaction");
const Document_1 = require("../models/Document");
class WorkflowTransactionsController {
    /**
     * Get all transactions for workflow dashboard
     */
    async getTransactions(req, res) {
        try {
            const userId = req.user?.userId || 'demo-user';
            const { status, company, search, limit = '50', offset = '0' } = req.query;
            // Build query
            const query = { userId };
            if (status && status !== 'all') {
                query.status = status;
            }
            if (company && company !== 'all') {
                // Add company filter if needed
                // This would require populating company data
            }
            // Get transactions
            const transactions = await BusinessTransaction_1.BusinessTransactionModel.find(query)
                .populate('companyId', 'name code')
                .populate('customerId', 'name address country')
                .populate('supplierId', 'name address country')
                .sort({ updatedDate: -1, createdDate: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(offset));
            // Format response
            const formattedTransactions = transactions.map(transaction => ({
                _id: transaction._id,
                transactionId: transaction.transactionId,
                orderReferenceNumber: transaction.orderReferenceNumber,
                status: transaction.status,
                companyName: transaction.companyId?.name || 'N/A',
                companyCode: transaction.companyId?.code || 'N/A',
                customerName: transaction.customerId?.name || 'N/A',
                supplierName: transaction.supplierId?.name || 'N/A',
                currency: transaction.currency,
                totalAmount: transaction.totalAmount,
                totalAmountAED: transaction.totalAmountAED,
                exchangeRate: transaction.exchangeRate,
                shipmentMethod: transaction.shipmentMethod,
                shippingTerms: transaction.shippingTerms,
                portName: transaction.portName,
                buyerOrderReference: transaction.buyerOrderReference,
                paymentTerms: transaction.paymentTerms,
                createdDate: transaction.createdDate,
                updatedDate: transaction.updatedDate
            }));
            // Apply search filter if provided
            let filteredTransactions = formattedTransactions;
            if (search && typeof search === 'string') {
                const searchLower = search.toLowerCase();
                filteredTransactions = formattedTransactions.filter(t => t.orderReferenceNumber?.toLowerCase().includes(searchLower) ||
                    t.transactionId?.toLowerCase().includes(searchLower) ||
                    t.customerName?.toLowerCase().includes(searchLower) ||
                    t.supplierName?.toLowerCase().includes(searchLower) ||
                    t.companyName?.toLowerCase().includes(searchLower));
            }
            res.json({
                success: true,
                transactions: filteredTransactions,
                total: filteredTransactions.length,
                hasMore: transactions.length === parseInt(limit)
            });
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch transactions'
            });
        }
    }
    /**
     * Get single transaction details
     */
    async getTransactionDetail(req, res) {
        try {
            const { transactionId } = req.params;
            const userId = req.user?.userId || 'demo-user';
            const transaction = await BusinessTransaction_1.BusinessTransactionModel.findOne({
                transactionId,
                userId
            })
                .populate('companyId', 'name code address contact email')
                .populate('customerId', 'name address contact email country')
                .populate('supplierId', 'name address contact email country');
            if (!transaction) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
                return;
            }
            // Get associated documents
            const documents = await Document_1.ProcessedDocumentModel.find({
                transactionId
            }).select('_id documentType originalName uploadDate processedDate status mimeType size');
            const formattedTransaction = {
                _id: transaction._id,
                transactionId: transaction.transactionId,
                orderReferenceNumber: transaction.orderReferenceNumber,
                status: transaction.status,
                currentStep: transaction.currentStep,
                companyName: transaction.companyId?.name,
                companyDetails: transaction.companyId,
                customerName: transaction.customerId?.name,
                customerDetails: transaction.customerId,
                supplierName: transaction.supplierId?.name,
                supplierDetails: transaction.supplierId,
                currency: transaction.currency,
                totalAmount: transaction.totalAmount,
                totalAmountAED: transaction.totalAmountAED,
                exchangeRate: transaction.exchangeRate,
                shipmentMethod: transaction.shipmentMethod,
                shippingTerms: transaction.shippingTerms,
                portName: transaction.portName,
                buyerOrderReference: transaction.buyerOrderReference,
                paymentTerms: transaction.paymentTerms?.description,
                entities: transaction.entities,
                documents: documents.map(doc => ({
                    documentId: doc._id.toString(),
                    documentType: doc.documentType,
                    originalName: doc.originalName,
                    uploadDate: doc.uploadDate,
                    processedDate: doc.processedDate,
                    status: doc.status,
                    role: 'source', // Could be enhanced based on document source
                    mimeType: doc.mimeType,
                    size: doc.size
                })),
                createdDate: transaction.createdDate,
                updatedDate: transaction.updatedDate
            };
            res.json({
                success: true,
                transaction: formattedTransaction
            });
        }
        catch (error) {
            console.error('Error fetching transaction detail:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch transaction detail'
            });
        }
    }
    /**
     * Update transaction status
     */
    async updateTransactionStatus(req, res) {
        try {
            const { transactionId } = req.params;
            const { status, notes } = req.body;
            const userId = req.user?.userId || 'demo-user';
            const transaction = await BusinessTransaction_1.BusinessTransactionModel.findOneAndUpdate({ transactionId, userId }, {
                status,
                updatedDate: new Date(),
                ...(notes && { notes })
            }, { new: true });
            if (!transaction) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Transaction status updated successfully',
                transaction: {
                    transactionId: transaction.transactionId,
                    status: transaction.status,
                    updatedDate: transaction.updatedDate
                }
            });
        }
        catch (error) {
            console.error('Error updating transaction status:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update transaction status'
            });
        }
    }
    /**
     * Get transaction statistics
     */
    async getTransactionStats(req, res) {
        try {
            const userId = req.user?.userId || 'demo-user';
            const stats = await BusinessTransaction_1.BusinessTransactionModel.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        completed: {
                            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                        },
                        active: {
                            $sum: { $cond: [{ $not: { $in: ['$status', ['completed', 'failed']] } }, 1, 0] }
                        },
                        failed: {
                            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                        },
                        totalValue: { $sum: { $ifNull: ['$totalAmountAED', '$totalAmount'] } }
                    }
                }
            ]);
            const result = stats[0] || {
                total: 0,
                completed: 0,
                active: 0,
                failed: 0,
                totalValue: 0
            };
            res.json({
                success: true,
                stats: result
            });
        }
        catch (error) {
            console.error('Error fetching transaction stats:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch transaction stats'
            });
        }
    }
}
exports.WorkflowTransactionsController = WorkflowTransactionsController;
//# sourceMappingURL=workflow-transactions.controller.js.map