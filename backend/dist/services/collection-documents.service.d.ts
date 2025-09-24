export interface CollectionDocumentsRequest {
    transactionId: string;
    bankName: 'ADIB' | 'DIB' | 'BOK';
    invoiceData: {
        invoiceNumber: string;
        invoiceAmount: number;
        currency: string;
    };
    transportDocumentFile: Buffer;
    transportDocumentType: string;
    transportDocumentName: string;
}
export interface TransportDocumentData {
    documentNumber: string;
    documentDate: Date;
    documentType: 'BL' | 'AWB' | 'RWB';
}
export interface CollectionDocument {
    type: 'covering_letter' | 'bill_of_exchange';
    content: string;
    bankName: string;
}
export declare class CollectionDocumentsService {
    private companyService;
    private customerService;
    private aiService;
    private ocrService;
    /**
     * Generate collection documents (covering letter + bill of exchange)
     */
    generateCollectionDocuments(request: CollectionDocumentsRequest): Promise<{
        coveringLetter: CollectionDocument;
        billOfExchange: CollectionDocument;
        transportDocumentData: TransportDocumentData;
    }>;
    /**
     * Process transport document to extract date and number
     */
    private processTransportDocument;
    /**
     * Generate covering letter based on bank template
     */
    private generateCoveringLetter;
    /**
     * Generate bill of exchange based on bank template
     */
    private generateBillOfExchange;
    /**
     * Store transport document in database
     */
    private storeTransportDocument;
    /**
     * Get bank details for different banks
     */
    private getBankDetails;
    /**
     * Convert number to words (simplified version)
     */
    private numberToWords;
    /**
     * Get available banks for dropdown
     */
    getAvailableBanks(): string[];
}
