"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessedDocumentModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DocumentFieldSchema = new mongoose_1.Schema({
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
const ProcessedDocumentSchema = new mongoose_1.Schema({
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
exports.ProcessedDocumentModel = mongoose_1.default.model('ProcessedDocument', ProcessedDocumentSchema);
//# sourceMappingURL=Document.js.map