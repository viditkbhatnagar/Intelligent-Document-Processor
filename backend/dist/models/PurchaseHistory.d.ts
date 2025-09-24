import mongoose, { Document } from 'mongoose';
export interface PurchaseHistoryDoc extends Document {
    orderReferenceNumber: string;
    companyId: mongoose.Types.ObjectId;
    supplierId: mongoose.Types.ObjectId;
    customerId?: mongoose.Types.ObjectId;
    transactionId: string;
    documentId: string;
    items: PurchaseItem[];
    totalAmount: number;
    currency: string;
    exchangeRate?: number;
    totalAmountAED?: number;
    purchaseDate: Date;
    shipmentMethod: 'sea' | 'air' | 'road';
    shippingTerms: string;
    portName?: string;
    paymentTerms: string;
    buyerOrderReference?: string;
    status: 'quotation' | 'po_issued' | 'invoiced' | 'completed' | 'cancelled';
    createdBy: string;
    createdDate: Date;
    updatedDate: Date;
}
export interface PurchaseItem {
    itemName: string;
    itemCode?: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    specifications?: string;
}
export declare const PurchaseHistoryModel: mongoose.Model<PurchaseHistoryDoc, {}, {}, {}, mongoose.Document<unknown, {}, PurchaseHistoryDoc, {}, {}> & PurchaseHistoryDoc & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
