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
exports.PurchaseHistoryModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PurchaseItemSchema = new mongoose_1.Schema({
    itemName: { type: String, required: true, trim: true },
    itemCode: { type: String, trim: true },
    description: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    specifications: { type: String, trim: true }
}, { _id: false });
const PurchaseHistorySchema = new mongoose_1.Schema({
    orderReferenceNumber: { type: String, required: true, trim: true },
    companyId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Company', required: true },
    supplierId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    customerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Customer' },
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
PurchaseHistorySchema.pre('save', function (next) {
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
exports.PurchaseHistoryModel = mongoose_1.default.model('PurchaseHistory', PurchaseHistorySchema);
//# sourceMappingURL=PurchaseHistory.js.map