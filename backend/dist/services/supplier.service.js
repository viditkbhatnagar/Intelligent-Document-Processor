"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const Supplier_1 = require("../models/Supplier");
const PurchaseHistory_1 = require("../models/PurchaseHistory");
const mongoose_1 = __importDefault(require("mongoose"));
class SupplierService {
    /**
     * Create a new supplier
     */
    async createSupplier(supplierData, createdBy) {
        try {
            const supplier = new Supplier_1.SupplierModel({
                ...supplierData,
                createdBy
            });
            return await supplier.save();
        }
        catch (error) {
            console.error('Error creating supplier:', error);
            throw new Error('Failed to create supplier');
        }
    }
    /**
     * Get all active suppliers
     */
    async getActiveSuppliers(createdBy) {
        try {
            const query = { isActive: true };
            if (createdBy) {
                query.createdBy = createdBy;
            }
            return await Supplier_1.SupplierModel.find(query)
                .sort({ name: 1 })
                .select('name address contact email country currency')
                .exec();
        }
        catch (error) {
            console.error('Error fetching suppliers:', error);
            throw new Error('Failed to fetch suppliers');
        }
    }
    /**
     * Get supplier by ID
     */
    async getSupplierById(supplierId) {
        try {
            return await Supplier_1.SupplierModel.findById(supplierId).exec();
        }
        catch (error) {
            console.error('Error fetching supplier by ID:', error);
            throw new Error('Failed to fetch supplier');
        }
    }
    /**
     * Find or create supplier from document entities
     */
    async findOrCreateSupplierFromDocument(supplierEntity, createdBy) {
        try {
            // Try to find existing supplier by name
            let supplier = await Supplier_1.SupplierModel.findOne({
                name: { $regex: new RegExp(supplierEntity.name.trim(), 'i') },
                isActive: true
            }).exec();
            if (!supplier) {
                // Create new supplier
                return await this.createSupplier({
                    name: supplierEntity.name.trim(),
                    address: supplierEntity.address || '',
                    contact: supplierEntity.contact,
                    email: supplierEntity.email,
                    currency: 'USD' // Default, will be detected from document
                }, createdBy);
            }
            return supplier;
        }
        catch (error) {
            console.error('Error finding or creating supplier:', error);
            throw new Error('Failed to find or create supplier');
        }
    }
    /**
     * Get item price history for a specific item from a supplier
     */
    async getItemPriceHistory(supplierId, itemName, limit = 10) {
        try {
            const purchases = await PurchaseHistory_1.PurchaseHistoryModel.aggregate([
                {
                    $match: {
                        supplierId: new mongoose_1.default.Types.ObjectId(supplierId),
                        'items.itemName': { $regex: new RegExp(itemName, 'i') }
                    }
                },
                { $unwind: '$items' },
                {
                    $match: {
                        'items.itemName': { $regex: new RegExp(itemName, 'i') }
                    }
                },
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'companyId',
                        foreignField: '_id',
                        as: 'company'
                    }
                },
                {
                    $project: {
                        itemName: '$items.itemName',
                        purchaseDate: 1,
                        unitPrice: '$items.unitPrice',
                        currency: 1,
                        quantity: '$items.quantity',
                        orderReferenceNumber: 1,
                        companyName: { $arrayElemAt: ['$company.name', 0] }
                    }
                },
                { $sort: { purchaseDate: -1 } },
                { $limit: limit }
            ]);
            return purchases;
        }
        catch (error) {
            console.error('Error fetching item price history:', error);
            throw new Error('Failed to fetch item price history');
        }
    }
    /**
     * Get all items purchased from a supplier
     */
    async getSupplierItems(supplierId) {
        try {
            const items = await PurchaseHistory_1.PurchaseHistoryModel.distinct('items.itemName', {
                supplierId: new mongoose_1.default.Types.ObjectId(supplierId)
            });
            return items.sort();
        }
        catch (error) {
            console.error('Error fetching supplier items:', error);
            throw new Error('Failed to fetch supplier items');
        }
    }
    /**
     * Update supplier
     */
    async updateSupplier(supplierId, updateData) {
        try {
            return await Supplier_1.SupplierModel.findByIdAndUpdate(supplierId, { ...updateData, updatedDate: new Date() }, { new: true }).exec();
        }
        catch (error) {
            console.error('Error updating supplier:', error);
            throw new Error('Failed to update supplier');
        }
    }
    /**
     * Deactivate supplier (soft delete)
     */
    async deactivateSupplier(supplierId) {
        try {
            return await Supplier_1.SupplierModel.findByIdAndUpdate(supplierId, { isActive: false, updatedDate: new Date() }, { new: true }).exec();
        }
        catch (error) {
            console.error('Error deactivating supplier:', error);
            throw new Error('Failed to deactivating supplier');
        }
    }
}
exports.SupplierService = SupplierService;
//# sourceMappingURL=supplier.service.js.map