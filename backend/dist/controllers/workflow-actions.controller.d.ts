import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare class WorkflowActionsController {
    private workflowEngine;
    private templateService;
    /**
     * Generate templates for a transaction
     */
    generateTemplates(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Update template with user edits
     */
    updateTemplate(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Download final documents
     */
    downloadTemplates(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Advance workflow to next step
     */
    advanceWorkflow(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get transaction details with suggested actions
     */
    getTransactionDetails(req: AuthenticatedRequest, res: Response): Promise<void>;
    private getAvailableActions;
    /**
     * Get supported bank formats
     */
    getBankFormats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
