import mongoose, { Document, Schema } from 'mongoose';
import { Template, TemplateField } from '../types/document.types';

const TemplateFieldSchema = new Schema<TemplateField>({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'currency', 'address', 'phone', 'email'],
    required: true
  },
  required: { type: Boolean, default: false },
  placeholder: { type: String },
  validation: {
    pattern: { type: String },
    min: { type: Number },
    max: { type: Number },
    minLength: { type: Number },
    maxLength: { type: Number }
  },
  mappingHints: [{ type: String }]
}, { _id: false });

const TemplateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  documentType: { type: String, required: true },
  fields: [TemplateFieldSchema],
  templateContent: { type: String },
  createdBy: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Update the updatedDate on save
TemplateSchema.pre('save', function(next) {
  this.updatedDate = new Date();
  next();
});

// Indexes for better query performance
TemplateSchema.index({ createdBy: 1, isActive: 1 });
TemplateSchema.index({ documentType: 1, isActive: 1 });

export const TemplateModel = mongoose.model('Template', TemplateSchema);