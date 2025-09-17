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
    currency?: string;
    createdDate: Date;
    updatedDate: Date;
    nextSuggestedActions?: WorkflowSuggestion[];
}
export declare const BusinessTransactionModel: mongoose.Model<BusinessTransactionDoc, {}, {}, {}, mongoose.Document<unknown, {}, BusinessTransactionDoc, {}, {}> & BusinessTransactionDoc & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
