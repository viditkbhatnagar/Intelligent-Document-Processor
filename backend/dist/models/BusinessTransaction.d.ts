import mongoose, { Document } from 'mongoose';
import { DocumentEntities, TransactionDocument, PaymentTerms, WorkflowStep, WorkflowSuggestion } from '../types/document.types';
export interface BusinessTransactionDoc extends Document {
    transactionId: string;
    userId: string;
    status: string;
    currentStep: WorkflowStep;
    entities: DocumentEntities;
    documents: TransactionDocument[];
    paymentTerms?: PaymentTerms;
    totalAmount?: number;
    totalAmountAED?: number;
    currency?: string;
    createdDate: Date;
    updatedDate: Date;
    nextSuggestedActions?: WorkflowSuggestion[];
    orderReferenceNumber?: string;
    companyId?: mongoose.Types.ObjectId;
    customerId?: mongoose.Types.ObjectId;
    supplierId?: mongoose.Types.ObjectId;
    shipmentMethod?: 'sea' | 'air' | 'road';
    shippingTerms?: string;
    portName?: string;
    buyerOrderReference?: string;
    exchangeRate?: number;
}
export declare const BusinessTransactionModel: mongoose.Model<BusinessTransactionDoc, {}, {}, {}, mongoose.Document<unknown, {}, BusinessTransactionDoc, {}, {}> & BusinessTransactionDoc & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
