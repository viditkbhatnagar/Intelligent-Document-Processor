import mongoose, { Document } from 'mongoose';
export interface CustomerDoc extends Document {
    name: string;
    address: string;
    contact?: string;
    email?: string;
    country?: string;
    currency?: string;
    paymentTerms?: string;
    creditLimit?: number;
    isActive: boolean;
    createdBy: string;
    createdDate: Date;
    updatedDate: Date;
}
export declare const CustomerModel: mongoose.Model<CustomerDoc, {}, {}, {}, mongoose.Document<unknown, {}, CustomerDoc, {}, {}> & CustomerDoc & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
