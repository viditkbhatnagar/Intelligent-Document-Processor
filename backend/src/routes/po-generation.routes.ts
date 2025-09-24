import express from 'express';
import { POGenerationController } from '../controllers/po-generation.controller';

const router = express.Router();
const poGenerationController = new POGenerationController();

// Generate PO and PFI
router.post('/generate', poGenerationController.generatePOAndPFI.bind(poGenerationController));

// Get transaction details for PO generation
router.get('/transaction/:transactionId', poGenerationController.getTransactionForPOGeneration.bind(poGenerationController));

export default router;
