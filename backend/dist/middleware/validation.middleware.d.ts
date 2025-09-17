import { Request, Response, NextFunction } from 'express';
export declare const validateBody: (validations: any[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authSchemas: {
    register: import("express-validator").ValidationChain[];
    login: import("express-validator").ValidationChain[];
    updateProfile: import("express-validator").ValidationChain[];
};
