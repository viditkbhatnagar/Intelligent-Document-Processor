import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare class CollectionDocumentsController {
    private collectionService;
    /**
     * Get available banks for dropdown
     */
    getAvailableBanks(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Generate collection documents
     */
    generateCollectionDocuments(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get bank full name from code
     */
    private getBankFullName;
}
export {};
