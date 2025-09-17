import mongoose, { Document } from 'mongoose';
import { DocumentField } from '../types/document.types';
export interface ProcessedDocumentDoc extends Document {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadDate: Date;
    processedDate?: Date;
    status: 'uploaded' | 'processing' | 'processed' | 'failed';
    documentType: 'quotation' | 'proforma_invoice' | 'purchase_order' | 'invoice' | 'commercial_invoice' | 'tax_invoice' | 'packing_list' | 'bill_of_exchange' | 'covering_letter' | 'transport_document' | 'unknown';
    extractedFields: DocumentField[];
    rawText?: string;
    userId: string;
    error?: string;
    transactionId?: string;
    relatedDocuments?: string[];
    entities?: any;
}
export declare const ProcessedDocumentModel: mongoose.Model<ProcessedDocumentDoc, {}, {}, {}, mongoose.Document<unknown, {}, ProcessedDocumentDoc, {}, {}> & ProcessedDocumentDoc & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
