import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare class InvoiceGenerationController {
    private invoiceService;
    /**
     * Get available items for invoice generation
     */
    getAvailableItems(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Generate invoice (full or partial shipment)
     */
    generateInvoice(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get banks list for dropdown
     */
    getBanksList(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
