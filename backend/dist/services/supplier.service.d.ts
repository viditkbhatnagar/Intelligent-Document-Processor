import { SupplierDoc } from '../models/Supplier';
export interface ItemPriceHistory {
    itemName: string;
    purchaseDate: Date;
    unitPrice: number;
    currency: string;
    quantity: number;
    orderReferenceNumber: string;
    companyName: string;
}
export declare class SupplierService {
    /**
     * Create a new supplier
     */
    createSupplier(supplierData: {
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
    }, createdBy: string): Promise<SupplierDoc>;
    /**
     * Get all active suppliers
     */
    getActiveSuppliers(createdBy?: string): Promise<SupplierDoc[]>;
    /**
     * Get supplier by ID
     */
    getSupplierById(supplierId: string): Promise<SupplierDoc | null>;
    /**
     * Find or create supplier from document entities
     */
    findOrCreateSupplierFromDocument(supplierEntity: any, createdBy: string): Promise<SupplierDoc>;
    /**
     * Get item price history for a specific item from a supplier
     */
    getItemPriceHistory(supplierId: string, itemName: string, limit?: number): Promise<ItemPriceHistory[]>;
    /**
     * Get all items purchased from a supplier
     */
    getSupplierItems(supplierId: string): Promise<string[]>;
    /**
     * Update supplier
     */
    updateSupplier(supplierId: string, updateData: Partial<SupplierDoc>): Promise<SupplierDoc | null>;
    /**
     * Deactivate supplier (soft delete)
     */
    deactivateSupplier(supplierId: string): Promise<SupplierDoc | null>;
}
