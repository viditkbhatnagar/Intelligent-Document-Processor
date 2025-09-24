"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoice_generation_controller_1 = require("../controllers/invoice-generation.controller");
const router = express_1.default.Router();
const invoiceController = new invoice_generation_controller_1.InvoiceGenerationController();
// Get available items for invoice generation
router.get('/items/:transactionId', invoiceController.getAvailableItems.bind(invoiceController));
// Generate invoice (full or partial)
router.post('/generate', invoiceController.generateInvoice.bind(invoiceController));
// Get banks list
router.get('/banks', invoiceController.getBanksList.bind(invoiceController));
exports.default = router;
//# sourceMappingURL=invoice-generation.routes.js.map