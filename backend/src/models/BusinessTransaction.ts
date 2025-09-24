import mongoose, { Document, Schema } from 'mongoose';
import { 
  BusinessTransaction, 
  DocumentEntities, 
  TransactionDocument, 
  PaymentTerms, 
  WorkflowStep, 
  WorkflowSuggestion 
} from '../types/document.types';

const PaymentTermsSchema = new Schema<PaymentTerms>({
  type: {
    type: String,
    enum: ['full_advance', 'partial_advance', 'on_delivery', 'credit'],
    required: true
  },
  percentage: { type: Number, min: 0, max: 100 },
  daysFromProforma: { type: Number },
  daysFromDelivery: { type: Number },
  description: { type: String }
}, { _id: false });

const TransactionDocumentSchema = new Schema<TransactionDocument>({
  documentId: { type: String, required: true },
  documentType: { type: String, required: true },
  uploadDate: { type: Date, required: true },
  processedDate: { type: Date },
  status: { type: String, required: true },
  role: {
    type: String,
    enum: ['source', 'generated', 'received'],
    required: true
  }
}, { _id: false });

const WorkflowStepSchema = new Schema<WorkflowStep>({
  stepId: { type: String, required: true },
  stepName: { type: String, required: true },
  description: { type: String, required: true },
  requiredDocuments: [{ type: String }],
  optionalDocuments: [{ type: String }],
  expectedNextSteps: [{ type: String }]
}, { _id: false });

const WorkflowSuggestionSchema = new Schema<WorkflowSuggestion>({
  action: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  requiredDocuments: [{ type: String }],
  confidence: { type: Number, required: true, min: 0, max: 1 }
}, { _id: false });

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
  // New workflow fields
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

const BusinessTransactionSchema = new Schema<BusinessTransactionDoc>({
  transactionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  status: {
    type: String,
    enum: ['quotation_received', 'po_issued', 'proforma_received', 'payment_made', 'order_ready', 'invoice_received', 'completed'],
    required: true
  },
  currentStep: { type: WorkflowStepSchema, required: true },
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
  },
  documents: [TransactionDocumentSchema],
  paymentTerms: PaymentTermsSchema,
  totalAmount: { type: Number },
  totalAmountAED: { type: Number },
  currency: { type: String, default: 'USD' },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  nextSuggestedActions: [WorkflowSuggestionSchema],
  // New workflow fields
  orderReferenceNumber: { type: String, trim: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  shipmentMethod: { 
    type: String, 
    enum: ['sea', 'air', 'road'] 
  },
  shippingTerms: { type: String, trim: true },
  portName: { type: String, trim: true },
  buyerOrderReference: { type: String, trim: true },
  exchangeRate: { type: Number, min: 0 }
}, {
  timestamps: true
});

// Update the updatedDate on save
BusinessTransactionSchema.pre('save', function(next) {
  this.updatedDate = new Date();
  next();
});

// Indexes for better query performance
BusinessTransactionSchema.index({ userId: 1, createdDate: -1 });
BusinessTransactionSchema.index({ transactionId: 1 });
BusinessTransactionSchema.index({ status: 1 });
BusinessTransactionSchema.index({ userId: 1, status: 1 });
BusinessTransactionSchema.index({ orderReferenceNumber: 1 });
BusinessTransactionSchema.index({ companyId: 1, createdDate: -1 });
BusinessTransactionSchema.index({ supplierId: 1 });
BusinessTransactionSchema.index({ customerId: 1 });

export const BusinessTransactionModel = mongoose.model<BusinessTransactionDoc>('BusinessTransaction', BusinessTransactionSchema);
