import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare class QuotationController {
    private companyService;
    private customerService;
    private supplierService;
    private workflowEngine;
    private aiService;
    private ocrService;
    /**
     * Get companies for dropdown (Rock Stone / Kinship)
     */
    getCompanies(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get customers for dropdown
     */
    getCustomers(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Create a new customer
     */
    createCustomer(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Upload quotation with workflow data
     */
    uploadQuotation(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Generate payment terms based on shipment method
     */
    private generatePaymentTerms;
    /**
     * Process quotation document asynchronously
     */
    private processQuotationAsync;
    /**
     * Detect currency from extracted fields
     */
    private detectCurrency;
    /**
     * Get fixed exchange rates
     */
    private getExchangeRate;
}
export {};
