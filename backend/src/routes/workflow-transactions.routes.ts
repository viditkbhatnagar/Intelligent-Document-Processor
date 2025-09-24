import express from 'express';
import { WorkflowTransactionsController } from '../controllers/workflow-transactions.controller';

const router = express.Router();
const workflowController = new WorkflowTransactionsController();

// Get all transactions for workflow dashboard
router.get('/transactions', workflowController.getTransactions.bind(workflowController));

// Get transaction statistics
router.get('/stats', workflowController.getTransactionStats.bind(workflowController));

// Get single transaction details
router.get('/transactions/:transactionId', workflowController.getTransactionDetail.bind(workflowController));

// Update transaction status
router.put('/transactions/:transactionId/status', workflowController.updateTransactionStatus.bind(workflowController));

export default router;
