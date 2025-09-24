"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workflow_transactions_controller_1 = require("../controllers/workflow-transactions.controller");
const router = express_1.default.Router();
const workflowController = new workflow_transactions_controller_1.WorkflowTransactionsController();
// Get all transactions for workflow dashboard
router.get('/transactions', workflowController.getTransactions.bind(workflowController));
// Get transaction statistics
router.get('/stats', workflowController.getTransactionStats.bind(workflowController));
// Get single transaction details
router.get('/transactions/:transactionId', workflowController.getTransactionDetail.bind(workflowController));
// Update transaction status
router.put('/transactions/:transactionId/status', workflowController.updateTransactionStatus.bind(workflowController));
exports.default = router;
//# sourceMappingURL=workflow-transactions.routes.js.map