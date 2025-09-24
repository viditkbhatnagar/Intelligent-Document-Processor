export interface InvoiceGenerationRequest {
    transactionId: string;
    shipmentType: 'full' | 'partial';
    bankName: string;
    selectedItems?: InvoiceItem[];
}
export interface InvoiceItem {
    itemName: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
}
export interface GeneratedInvoice {
    invoiceNumber: string;
    content: string;
    currency: string;
    totalAmount: number;
    items: InvoiceItem[];
    bankName: string;
    isPartialShipment: boolean;
}
export declare class InvoiceGenerationService {
    private companyService;
    private customerService;
    /**
     * Generate invoice for full or partial shipment
     */
    generateInvoice(request: InvoiceGenerationRequest): Promise<GeneratedInvoice>;
    /**
     * Get available items for invoice generation
     */
    getAvailableItems(transactionId: string): Promise<{
        items: InvoiceItem[];
        currency: string;
        totalAmount: number;
    }>;
    /**
     * Generate the invoice document content
     */
    private generateInvoiceDocument;
    /**
     * Get banks list for dropdown
     */
    getBanksList(): string[];
    /**
     * Get fixed exchange rates
     */
    private getExchangeRate;
}
