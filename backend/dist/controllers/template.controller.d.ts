import { Request, Response } from 'express';
export declare class TemplateController {
    createTemplate(req: Request, res: Response): Promise<void>;
    getTemplates(req: Request, res: Response): Promise<void>;
    getTemplate(req: Request, res: Response): Promise<void>;
    updateTemplate(req: Request, res: Response): Promise<void>;
    deleteTemplate(req: Request, res: Response): Promise<void>;
    cloneTemplate(req: Request, res: Response): Promise<void>;
}
