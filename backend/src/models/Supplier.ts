import mongoose, { Document, Schema } from 'mongoose';

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
  createdBy: string; // userId
  createdDate: Date;
  updatedDate: Date;
}

const SupplierSchema = new Schema<SupplierDoc>({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  contact: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  country: { type: String, trim: true },
  currency: { type: String, default: 'USD' },
  paymentTerms: { type: String, trim: true },
  bankDetails: {
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    swiftCode: { type: String, trim: true },
    iban: { type: String, trim: true }
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Update the updatedDate on save
SupplierSchema.pre('save', function(next) {
  this.updatedDate = new Date();
  next();
});

// Indexes for better query performance
SupplierSchema.index({ name: 1 });
SupplierSchema.index({ createdBy: 1, isActive: 1 });
SupplierSchema.index({ country: 1 });
SupplierSchema.index({ currency: 1 });
SupplierSchema.index({ isActive: 1 });

export const SupplierModel = mongoose.model<SupplierDoc>('Supplier', SupplierSchema);
