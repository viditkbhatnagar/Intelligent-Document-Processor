import mongoose, { Document, Schema } from 'mongoose';

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
  createdBy: string; // userId
  createdDate: Date;
  updatedDate: Date;
}

const CustomerSchema = new Schema<CustomerDoc>({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  contact: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  country: { type: String, trim: true },
  currency: { type: String, default: 'AED' },
  paymentTerms: { type: String, trim: true },
  creditLimit: { type: Number, min: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Update the updatedDate on save
CustomerSchema.pre('save', function(next) {
  this.updatedDate = new Date();
  next();
});

// Indexes for better query performance
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ createdBy: 1, isActive: 1 });
CustomerSchema.index({ country: 1 });
CustomerSchema.index({ isActive: 1 });

export const CustomerModel = mongoose.model<CustomerDoc>('Customer', CustomerSchema);
