import express from 'express';
import { WorkflowActionsController } from '../controllers/workflow-actions.controller';

const router = express.Router();
const workflowActionsController = new WorkflowActionsController();

// Generate templates for a transaction
router.post('/transactions/:transactionId/generate-templates', 
  workflowActionsController.generateTemplates.bind(workflowActionsController)
);

// Update template with user edits
router.put('/templates/:templateId', 
  workflowActionsController.updateTemplate.bind(workflowActionsController)
);

// Download final documents
router.post('/transactions/:transactionId/download', 
  workflowActionsController.downloadTemplates.bind(workflowActionsController)
);

// Advance workflow to next step
router.post('/transactions/:transactionId/advance', 
  workflowActionsController.advanceWorkflow.bind(workflowActionsController)
);

// Get transaction details with suggested actions
router.get('/transactions/:transactionId/details', 
  workflowActionsController.getTransactionDetails.bind(workflowActionsController)
);

// Get supported bank formats
router.get('/bank-formats', 
  workflowActionsController.getBankFormats.bind(workflowActionsController)
);

export default router;
