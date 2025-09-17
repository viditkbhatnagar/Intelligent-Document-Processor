import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare class TemplatePopulationController {
    private templatePopulationService;
    populateFromInvoice(req: AuthenticatedRequest, res: Response): Promise<void>;
    getTemplates(req: AuthenticatedRequest, res: Response): Promise<void>;
    previewPopulation(req: AuthenticatedRequest, res: Response): Promise<void>;
    enhanceFields(req: AuthenticatedRequest, res: Response): Promise<void>;
    downloadPopulatedDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
