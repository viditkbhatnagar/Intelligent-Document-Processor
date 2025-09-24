import mongoose, { Document } from 'mongoose';
export interface CompanyDoc extends Document {
    name: string;
    code: string;
    address: string;
    contact: string;
    email: string;
    isActive: boolean;
    createdDate: Date;
    updatedDate: Date;
}
export declare const CompanyModel: mongoose.Model<CompanyDoc, {}, {}, {}, mongoose.Document<unknown, {}, CompanyDoc, {}, {}> & CompanyDoc & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
