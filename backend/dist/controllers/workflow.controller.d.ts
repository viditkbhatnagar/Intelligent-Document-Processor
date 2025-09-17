import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare class WorkflowController {
    private workflowEngine;
    /**
     * Get all transactions for the authenticated user
     */
    getUserTransactions(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get specific transaction by ID
     */
    getTransaction(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Update transaction status manually
     */
    updateTransactionStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get workflow dashboard with summary
     */
    getDashboard(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Re-evaluate workflow for existing transactions (for testing/debugging)
     */
    reevaluateWorkflows(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get workflow analytics
     */
    getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void>;
    private calculateMonthlyTrends;
}
export {};
