import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';

const router = Router();
const workflowController = new WorkflowController();

// Get all transactions for user
router.get('/transactions', workflowController.getUserTransactions.bind(workflowController));

// Get specific transaction
router.get('/transactions/:transactionId', workflowController.getTransaction.bind(workflowController));

// Update transaction status
router.put('/transactions/:transactionId/status', workflowController.updateTransactionStatus.bind(workflowController));

// Get workflow dashboard
router.get('/dashboard', workflowController.getDashboard.bind(workflowController));

// Re-evaluate workflows (for testing/debugging)
router.post('/reevaluate', workflowController.reevaluateWorkflows.bind(workflowController));

// Get workflow analytics
router.get('/analytics', workflowController.getAnalytics.bind(workflowController));

export default router;
