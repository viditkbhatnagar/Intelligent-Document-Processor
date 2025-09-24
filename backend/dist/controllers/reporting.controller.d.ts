import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare class ReportingController {
    private reportingService;
    /**
     * Get report summary with filtering options
     */
    getReportSummary(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get item price history
     */
    getItemPriceHistory(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get transactions by company
     */
    getTransactionsByCompany(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Export report in specified format
     */
    exportReport(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
