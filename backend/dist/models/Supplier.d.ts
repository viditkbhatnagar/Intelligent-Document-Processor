import mongoose, { Document } from 'mongoose';
export interface SupplierDoc extends Document {
    name: string;
    address: string;
    contact?: string;
    email?: string;
    country?: string;
    currency?: string;
    paymentTerms?: string;
    bankDetails?: {
        bankName?: string;
        accountNumber?: string;
        swiftCode?: string;
        iban?: string;
    };
    isActive: boolean;
    createdBy: string;
    createdDate: Date;
    updatedDate: Date;
}
export declare const SupplierModel: mongoose.Model<SupplierDoc, {}, {}, {}, mongoose.Document<unknown, {}, SupplierDoc, {}, {}> & SupplierDoc & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
