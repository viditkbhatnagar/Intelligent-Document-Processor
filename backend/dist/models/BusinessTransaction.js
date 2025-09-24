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
exports.BusinessTransactionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PaymentTermsSchema = new mongoose_1.Schema({
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
const TransactionDocumentSchema = new mongoose_1.Schema({
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
const WorkflowStepSchema = new mongoose_1.Schema({
    stepId: { type: String, required: true },
    stepName: { type: String, required: true },
    description: { type: String, required: true },
    requiredDocuments: [{ type: String }],
    optionalDocuments: [{ type: String }],
    expectedNextSteps: [{ type: String }]
}, { _id: false });
const WorkflowSuggestionSchema = new mongoose_1.Schema({
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
const BusinessTransactionSchema = new mongoose_1.Schema({
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
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Company' },
    customerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Customer' },
    supplierId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Supplier' },
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
BusinessTransactionSchema.pre('save', function (next) {
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
exports.BusinessTransactionModel = mongoose_1.default.model('BusinessTransaction', BusinessTransactionSchema);
//# sourceMappingURL=BusinessTransaction.js.map