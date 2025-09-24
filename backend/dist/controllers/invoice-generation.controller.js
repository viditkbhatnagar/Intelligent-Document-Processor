"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceGenerationController = void 0;
const invoice_generation_service_1 = require("../services/invoice-generation.service");
class InvoiceGenerationController {
    constructor() {
        this.invoiceService = new invoice_generation_service_1.InvoiceGenerationService();
    }
    /**
     * Get available items for invoice generation
     */
    async getAvailableItems(req, res) {
        try {
            const { transactionId } = req.params;
            const result = await this.invoiceService.getAvailableItems(transactionId);
            res.json({
                success: true,
                items: result.items,
                currency: result.currency,
                totalAmount: result.totalAmount,
                banks: this.invoiceService.getBanksList()
            });
        }
        catch (error) {
            console.error('Error fetching available items:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch available items'
            });
        }
    }
    /**
     * Generate invoice (full or partial shipment)
     */
    async generateInvoice(req, res) {
        try {
            const userId = req.user?.userId || 'demo-user';
            const request = {
                transactionId: req.body.transactionId,
                shipmentType: req.body.shipmentType,
                bankName: req.body.bankName,
                selectedItems: req.body.selectedItems
            };
            // Validate required fields
            if (!request.transactionId || !request.shipmentType || !request.bankName) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: transactionId, shipmentType, or bankName'
                });
                return;
            }
            // If partial shipment, validate selected items
            if (request.shipmentType === 'partial' && (!request.selectedItems || request.selectedItems.length === 0)) {
                res.status(400).json({
                    success: false,
                    message: 'Selected items are required for partial shipment'
                });
                return;
            }
            const invoice = await this.invoiceService.generateInvoice(request);
            res.json({
                success: true,
                invoice,
                message: `${request.shipmentType === 'partial' ? 'Partial' : 'Full'} shipment invoice generated successfully`
            });
        }
        catch (error) {
            console.error('Error generating invoice:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to generate invoice'
            });
        }
    }
    /**
     * Get banks list for dropdown
     */
    async getBanksList(req, res) {
        try {
            const banks = this.invoiceService.getBanksList();
            res.json({
                success: true,
                banks
            });
        }
        catch (error) {
            console.error('Error fetching banks list:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch banks list'
            });
        }
    }
}
exports.InvoiceGenerationController = InvoiceGenerationController;
//# sourceMappingURL=invoice-generation.controller.js.map