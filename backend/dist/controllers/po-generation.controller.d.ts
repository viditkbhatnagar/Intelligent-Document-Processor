import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare class POGenerationController {
    private poGenerationService;
    /**
     * Generate PO and PFI from quotation
     */
    generatePOAndPFI(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get transaction details for PO generation form
     */
    getTransactionForPOGeneration(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
