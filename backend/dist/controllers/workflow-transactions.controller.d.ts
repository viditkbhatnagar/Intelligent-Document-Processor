import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare class WorkflowTransactionsController {
    /**
     * Get all transactions for workflow dashboard
     */
    getTransactions(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get single transaction details
     */
    getTransactionDetail(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Update transaction status
     */
    updateTransactionStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get transaction statistics
     */
    getTransactionStats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
