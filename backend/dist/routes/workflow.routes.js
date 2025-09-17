"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workflow_controller_1 = require("../controllers/workflow.controller");
const router = (0, express_1.Router)();
const workflowController = new workflow_controller_1.WorkflowController();
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
exports.default = router;
//# sourceMappingURL=workflow.routes.js.map