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
exports.TemplateModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TemplateFieldSchema = new mongoose_1.Schema({
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
const TemplateSchema = new mongoose_1.Schema({
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
TemplateSchema.pre('save', function (next) {
    this.updatedDate = new Date();
    next();
});
// Indexes for better query performance
TemplateSchema.index({ createdBy: 1, isActive: 1 });
TemplateSchema.index({ documentType: 1, isActive: 1 });
exports.TemplateModel = mongoose_1.default.model('Template', TemplateSchema);
//# sourceMappingURL=Template.js.map