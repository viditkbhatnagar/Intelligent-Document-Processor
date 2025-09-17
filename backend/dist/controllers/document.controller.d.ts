import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare class DocumentController {
    private ocrService;
    private aiService;
    private workflowEngine;
    uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    getDocuments(req: AuthenticatedRequest, res: Response): Promise<void>;
    getDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    reprocessDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    private processDocumentAsync;
}
export {};
