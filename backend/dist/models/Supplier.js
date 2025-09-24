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
exports.SupplierModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SupplierSchema = new mongoose_1.Schema({
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
SupplierSchema.pre('save', function (next) {
    this.updatedDate = new Date();
    next();
});
// Indexes for better query performance
SupplierSchema.index({ name: 1 });
SupplierSchema.index({ createdBy: 1, isActive: 1 });
SupplierSchema.index({ country: 1 });
SupplierSchema.index({ currency: 1 });
SupplierSchema.index({ isActive: 1 });
exports.SupplierModel = mongoose_1.default.model('Supplier', SupplierSchema);
//# sourceMappingURL=Supplier.js.map