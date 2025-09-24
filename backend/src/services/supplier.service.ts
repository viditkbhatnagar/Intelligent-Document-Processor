import { SupplierModel, SupplierDoc } from '../models/Supplier';
import { PurchaseHistoryModel } from '../models/PurchaseHistory';
import mongoose from 'mongoose';

export interface ItemPriceHistory {
  itemName: string;
  purchaseDate: Date;
  unitPrice: number;
  currency: string;
  quantity: number;
  orderReferenceNumber: string;
  companyName: string;
}

export class SupplierService {
  
  /**
   * Create a new supplier
   */
  async createSupplier(supplierData: {
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
  }, createdBy: string): Promise<SupplierDoc> {
    try {
      const supplier = new SupplierModel({
        ...supplierData,
        createdBy
      });
      
      return await supplier.save();
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error('Failed to create supplier');
    }
  }
  
  /**
   * Get all active suppliers
   */
  async getActiveSuppliers(createdBy?: string): Promise<SupplierDoc[]> {
    try {
      const query: any = { isActive: true };
      if (createdBy) {
        query.createdBy = createdBy;
      }
      
      return await SupplierModel.find(query)
        .sort({ name: 1 })
        .select('name address contact email country currency')
        .exec();
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error('Failed to fetch suppliers');
    }
  }
  
  /**
   * Get supplier by ID
   */
  async getSupplierById(supplierId: string): Promise<SupplierDoc | null> {
    try {
      return await SupplierModel.findById(supplierId).exec();
    } catch (error) {
      console.error('Error fetching supplier by ID:', error);
      throw new Error('Failed to fetch supplier');
    }
  }
  
  /**
   * Find or create supplier from document entities
   */
  async findOrCreateSupplierFromDocument(supplierEntity: any, createdBy: string): Promise<SupplierDoc> {
    try {
      // Try to find existing supplier by name
      let supplier = await SupplierModel.findOne({
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
      
      return supplier as SupplierDoc;
    } catch (error) {
      console.error('Error finding or creating supplier:', error);
      throw new Error('Failed to find or create supplier');
    }
  }
  
  /**
   * Get item price history for a specific item from a supplier
   */
  async getItemPriceHistory(supplierId: string, itemName: string, limit = 10): Promise<ItemPriceHistory[]> {
    try {
      const purchases = await PurchaseHistoryModel.aggregate([
        {
          $match: {
            supplierId: new mongoose.Types.ObjectId(supplierId),
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
    } catch (error) {
      console.error('Error fetching item price history:', error);
      throw new Error('Failed to fetch item price history');
    }
  }
  
  /**
   * Get all items purchased from a supplier
   */
  async getSupplierItems(supplierId: string): Promise<string[]> {
    try {
      const items = await PurchaseHistoryModel.distinct('items.itemName', {
        supplierId: new mongoose.Types.ObjectId(supplierId)
      });
      
      return items.sort();
    } catch (error) {
      console.error('Error fetching supplier items:', error);
      throw new Error('Failed to fetch supplier items');
    }
  }
  
  /**
   * Update supplier
   */
  async updateSupplier(supplierId: string, updateData: Partial<SupplierDoc>): Promise<SupplierDoc | null> {
    try {
      return await SupplierModel.findByIdAndUpdate(
        supplierId,
        { ...updateData, updatedDate: new Date() },
        { new: true }
      ).exec();
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error('Failed to update supplier');
    }
  }
  
  /**
   * Deactivate supplier (soft delete)
   */
  async deactivateSupplier(supplierId: string): Promise<SupplierDoc | null> {
    try {
      return await SupplierModel.findByIdAndUpdate(
        supplierId,
        { isActive: false, updatedDate: new Date() },
        { new: true }
      ).exec();
    } catch (error) {
      console.error('Error deactivating supplier:', error);
      throw new Error('Failed to deactivating supplier');
    }
  }
}
