import mongoose, { Document, Schema } from 'mongoose';
import { ProcessedDocument as IProcessedDocument, DocumentField } from '../types/document.types';

const DocumentFieldSchema = new Schema<DocumentField>({
  key: { type: String, required: true },
  value: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'currency', 'address', 'phone', 'email'],
    required: true
  },
  position: {
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number }
  }
}, { _id: false });

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
  // GridFS file storage
  fileId: mongoose.Types.ObjectId; // GridFS file ID
  // Workflow related fields
  transactionId?: string;
  relatedDocuments?: string[];
  entities?: any; // Will be typed properly in the schema
}

const ProcessedDocumentSchema = new Schema<ProcessedDocumentDoc>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  processedDate: { type: Date },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'failed'],
    default: 'uploaded'
  },
  documentType: {
    type: String,
    enum: ['quotation', 'proforma_invoice', 'purchase_order', 'invoice', 'commercial_invoice', 'tax_invoice', 'packing_list', 'bill_of_exchange', 'covering_letter', 'transport_document', 'unknown'],
    default: 'unknown'
  },
  extractedFields: [DocumentFieldSchema],
  rawText: { type: String },
  userId: { type: String, required: true },
  error: { type: String },
  // GridFS file storage
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  // Workflow related fields
  transactionId: { type: String },
  relatedDocuments: [{ type: String }],
  entities: {
    supplier: {
      name: { type: String },
      address: { type: String },
      contact: { type: String },
      email: { type: String }
    },
    tradingCompany: {
      name: { type: String },
      address: { type: String },
      contact: { type: String },
      email: { type: String }
    },
    customer: {
      name: { type: String },
      address: { type: String },
      contact: { type: String },
      email: { type: String }
    },
    consignee: {
      name: { type: String },
      address: { type: String },
      contact: { type: String },
      email: { type: String }
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ProcessedDocumentSchema.index({ userId: 1, uploadDate: -1 });
ProcessedDocumentSchema.index({ status: 1 });
ProcessedDocumentSchema.index({ documentType: 1 });
ProcessedDocumentSchema.index({ transactionId: 1 });
ProcessedDocumentSchema.index({ userId: 1, transactionId: 1 });

export const ProcessedDocumentModel = mongoose.model<ProcessedDocumentDoc>('ProcessedDocument', ProcessedDocumentSchema);