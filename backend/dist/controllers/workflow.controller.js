"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowController = void 0;
const workflow_engine_service_1 = require("../services/workflow-engine.service");
const BusinessTransaction_1 = require("../models/BusinessTransaction");
class WorkflowController {
    constructor() {
        this.workflowEngine = new workflow_engine_service_1.WorkflowEngine();
    }
    /**
     * Get all transactions for the authenticated user
     */
    async getUserTransactions(req, res) {
        try {
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const transactions = await this.workflowEngine.getUserTransactions(req.user.userId);
            res.json({
                message: 'Transactions retrieved successfully',
                transactions
            });
        }
        catch (error) {
            console.error('Error retrieving transactions:', error);
            res.status(500).json({ message: 'Failed to retrieve transactions' });
        }
    }
    /**
     * Get specific transaction by ID
     */
    async getTransaction(req, res) {
        try {
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const { transactionId } = req.params;
            const transaction = await this.workflowEngine.getTransaction(transactionId, req.user.userId);
            if (!transaction) {
                res.status(404).json({ message: 'Transaction not found' });
                return;
            }
            res.json({
                message: 'Transaction retrieved successfully',
                transaction
            });
        }
        catch (error) {
            console.error('Error retrieving transaction:', error);
            res.status(500).json({ message: 'Failed to retrieve transaction' });
        }
    }
    /**
     * Update transaction status manually
     */
    async updateTransactionStatus(req, res) {
        try {
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const { transactionId } = req.params;
            const { status, notes } = req.body;
            if (!status) {
                res.status(400).json({ message: 'Status is required' });
                return;
            }
            const transaction = await this.workflowEngine.updateTransactionStatus(transactionId, req.user.userId, status, notes);
            if (!transaction) {
                res.status(404).json({ message: 'Transaction not found' });
                return;
            }
            res.json({
                message: 'Transaction status updated successfully',
                transaction
            });
        }
        catch (error) {
            console.error('Error updating transaction status:', error);
            res.status(500).json({ message: 'Failed to update transaction status' });
        }
    }
    /**
     * Get workflow dashboard with summary
     */
    async getDashboard(req, res) {
        try {
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const transactions = await this.workflowEngine.getUserTransactions(req.user.userId);
            // Calculate dashboard metrics
            const totalTransactions = transactions.length;
            const completedTransactions = transactions.filter(t => t.status === 'completed').length;
            const activeTransactions = transactions.filter(t => t.status !== 'completed').length;
            const statusBreakdown = transactions.reduce((acc, transaction) => {
                acc[transaction.status] = (acc[transaction.status] || 0) + 1;
                return acc;
            }, {});
            // Get high priority actions across all transactions
            const highPriorityActions = transactions.flatMap(t => (t.nextSuggestedActions || []).filter((action) => action.priority === 'high'));
            res.json({
                message: 'Dashboard data retrieved successfully',
                dashboard: {
                    summary: {
                        totalTransactions,
                        completedTransactions,
                        activeTransactions,
                        statusBreakdown
                    },
                    highPriorityActions,
                    recentTransactions: transactions.slice(0, 5)
                }
            });
        }
        catch (error) {
            console.error('Error retrieving dashboard:', error);
            res.status(500).json({ message: 'Failed to retrieve dashboard data' });
        }
    }
    /**
     * Re-evaluate workflow for existing transactions (for testing/debugging)
     */
    async reevaluateWorkflows(req, res) {
        try {
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const transactions = await this.workflowEngine.getUserTransactions(req.user.userId);
            let updatedCount = 0;
            for (const transaction of transactions) {
                if (transaction.status !== 'completed') {
                    // Get the latest document to trigger workflow advancement
                    const latestDoc = transaction.documents[transaction.documents.length - 1];
                    if (latestDoc) {
                        // Simulate processing the latest document again to trigger workflow advancement
                        await this.workflowEngine.processDocumentWorkflow({
                            _id: latestDoc.documentId,
                            documentType: latestDoc.documentType,
                            userId: req.user.userId,
                            transactionId: transaction.transactionId,
                            entities: transaction.entities,
                            extractedFields: [],
                            uploadDate: latestDoc.uploadDate,
                            processedDate: latestDoc.processedDate,
                            status: latestDoc.status
                        });
                        updatedCount++;
                    }
                }
            }
            res.json({
                message: `Re-evaluated ${updatedCount} transactions`,
                updatedCount
            });
        }
        catch (error) {
            console.error('Error re-evaluating workflows:', error);
            res.status(500).json({ message: 'Failed to re-evaluate workflows' });
        }
    }
    /**
     * Get workflow analytics
     */
    async getAnalytics(req, res) {
        try {
            // Demo mode - use dummy user if no authentication
            if (!req.user) {
                req.user = { userId: 'demo-user' };
            }
            const transactions = await BusinessTransaction_1.BusinessTransactionModel.find({
                userId: req.user.userId
            }).sort({ createdDate: -1 });
            // Calculate average processing time by status
            const processingTimes = {};
            transactions.forEach(transaction => {
                const createdTime = new Date(transaction.createdDate).getTime();
                const updatedTime = new Date(transaction.updatedDate).getTime();
                const processingTime = (updatedTime - createdTime) / (1000 * 60 * 60 * 24); // in days
                if (!processingTimes[transaction.status]) {
                    processingTimes[transaction.status] = [];
                }
                processingTimes[transaction.status].push(processingTime);
            });
            const averageProcessingTimes = Object.keys(processingTimes).reduce((acc, status) => {
                const times = processingTimes[status];
                acc[status] = times.reduce((sum, time) => sum + time, 0) / times.length;
                return acc;
            }, {});
            // Document type distribution
            const documentTypeDistribution = transactions.reduce((acc, transaction) => {
                transaction.documents.forEach(doc => {
                    acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
                });
                return acc;
            }, {});
            res.json({
                message: 'Analytics retrieved successfully',
                analytics: {
                    totalTransactions: transactions.length,
                    averageProcessingTimes,
                    documentTypeDistribution,
                    monthlyTrends: this.calculateMonthlyTrends(transactions)
                }
            });
        }
        catch (error) {
            console.error('Error retrieving analytics:', error);
            res.status(500).json({ message: 'Failed to retrieve analytics' });
        }
    }
    calculateMonthlyTrends(transactions) {
        const monthly = {};
        transactions.forEach(transaction => {
            const date = new Date(transaction.createdDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthly[monthKey] = (monthly[monthKey] || 0) + 1;
        });
        return monthly;
    }
}
exports.WorkflowController = WorkflowController;
//# sourceMappingURL=workflow.controller.js.map