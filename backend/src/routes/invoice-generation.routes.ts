import express from 'express';
import { InvoiceGenerationController } from '../controllers/invoice-generation.controller';

const router = express.Router();
const invoiceController = new InvoiceGenerationController();

// Get available items for invoice generation
router.get('/items/:transactionId', invoiceController.getAvailableItems.bind(invoiceController));

// Generate invoice (full or partial)
router.post('/generate', invoiceController.generateInvoice.bind(invoiceController));

// Get banks list
router.get('/banks', invoiceController.getBanksList.bind(invoiceController));

export default router;
