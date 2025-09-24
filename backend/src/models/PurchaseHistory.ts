import mongoose, { Document, Schema } from 'mongoose';

export interface PurchaseHistoryDoc extends Document {
  orderReferenceNumber: string;
  companyId: mongoose.Types.ObjectId; // Rock Stone or Kinship
  supplierId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  transactionId: string;
  documentId: string; // Reference to source document
  items: PurchaseItem[];
  totalAmount: number;
  currency: string;
  exchangeRate?: number; // If converted to AED
  totalAmountAED?: number;
  purchaseDate: Date;
  shipmentMethod: 'sea' | 'air' | 'road';
  shippingTerms: string; // EXW, CFR, CPT, DAP
  portName?: string;
  paymentTerms: string;
  buyerOrderReference?: string;
  status: 'quotation' | 'po_issued' | 'invoiced' | 'completed' | 'cancelled';
  createdBy: string; // userId
  createdDate: Date;
  updatedDate: Date;
}

export interface PurchaseItem {
  itemName: string;
  itemCode?: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
}

const PurchaseItemSchema = new Schema<PurchaseItem>({
  itemName: { type: String, required: true, trim: true },
  itemCode: { type: String, trim: true },
  description: { type: String, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, trim: true },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  specifications: { type: String, trim: true }
}, { _id: false });

const PurchaseHistorySchema = new Schema<PurchaseHistoryDoc>({
  orderReferenceNumber: { type: String, required: true, trim: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  transactionId: { type: String, required: true },
  documentId: { type: String, required: true },
  items: [PurchaseItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD' },
  exchangeRate: { type: Number, min: 0 },
  totalAmountAED: { type: Number, min: 0 },
  purchaseDate: { type: Date, required: true },
  shipmentMethod: {
    type: String,
    enum: ['sea', 'air', 'road'],
    required: true
  },
  shippingTerms: { type: String, required: true, trim: true },
  portName: { type: String, trim: true },
  paymentTerms: { type: String, required: true, trim: true },
  buyerOrderReference: { type: String, trim: true },
  status: {
    type: String,
    enum: ['quotation', 'po_issued', 'invoiced', 'completed', 'cancelled'],
    default: 'quotation'
  },
  createdBy: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Update the updatedDate on save
PurchaseHistorySchema.pre('save', function(next) {
  this.updatedDate = new Date();
  next();
});

// Indexes for better query performance
PurchaseHistorySchema.index({ orderReferenceNumber: 1 });
PurchaseHistorySchema.index({ companyId: 1, purchaseDate: -1 });
PurchaseHistorySchema.index({ supplierId: 1, purchaseDate: -1 });
PurchaseHistorySchema.index({ customerId: 1 });
PurchaseHistorySchema.index({ transactionId: 1 });
PurchaseHistorySchema.index({ createdBy: 1 });
PurchaseHistorySchema.index({ status: 1 });
PurchaseHistorySchema.index({ 'items.itemName': 1, supplierId: 1, purchaseDate: -1 }); // For price history queries

export const PurchaseHistoryModel = mongoose.model<PurchaseHistoryDoc>('PurchaseHistory', PurchaseHistorySchema);
