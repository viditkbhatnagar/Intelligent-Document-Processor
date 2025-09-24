export interface POGenerationRequest {
    transactionId: string;
    shippingTerms: string;
    portName: string;
    buyerOrderReference: string;
    shipmentMethod: 'sea' | 'air' | 'road';
}
export interface GeneratedDocument {
    type: 'PO' | 'PFI';
    content: string;
    currency: string;
    totalAmount: number;
    items: any[];
}
export declare class POGenerationService {
    private companyService;
    private customerService;
    private supplierService;
    private aiService;
    /**
     * Generate PO (Purchase Order) and PFI (Proforma Invoice)
     */
    generatePOAndPFI(request: POGenerationRequest): Promise<{
        po: GeneratedDocument;
        pfi: GeneratedDocument;
    }>;
    /**
     * Extract items and pricing from quotation fields
     */
    private extractItemsFromQuotation;
    /**
     * Generate Purchase Order in supplier currency
     */
    private generatePO;
    /**
     * Generate Proforma Invoice in AED
     */
    private generatePFI;
    /**
     * Save transaction to purchase history
     */
    private saveToPurchaseHistory;
    /**
     * Generate payment terms based on shipment method
     */
    private generatePaymentTerms;
    /**
     * Get fixed exchange rates
     */
    private getExchangeRate;
}
