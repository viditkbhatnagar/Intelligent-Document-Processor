import mongoose, { Document, Schema } from 'mongoose';

export interface CompanyDoc extends Document {
  name: string;
  code: string;
  address: string;
  contact: string;
  email: string;
  isActive: boolean;
  createdDate: Date;
  updatedDate: Date;
}

const CompanySchema = new Schema<CompanyDoc>({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // 'RS' for Rock Stone, 'KS' for Kinship
  address: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Update the updatedDate on save
CompanySchema.pre('save', function(next) {
  this.updatedDate = new Date();
  next();
});

// Indexes for better query performance
CompanySchema.index({ code: 1 });
CompanySchema.index({ isActive: 1 });

export const CompanyModel = mongoose.model<CompanyDoc>('Company', CompanySchema);
