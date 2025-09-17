import { Request, Response } from 'express';
export declare class ProcessingController {
    private aiService;
    private fieldExtractor;
    private templateService;
    constructor();
    extractFields(req: Request, res: Response): Promise<void>;
    mapFields(req: Request, res: Response): Promise<void>;
    generateDocument(req: Request, res: Response): Promise<void>;
    getProcessingJobs(req: Request, res: Response): Promise<void>;
    getProcessingJob(req: Request, res: Response): Promise<void>;
    cancelProcessingJob(req: Request, res: Response): Promise<void>;
}
