import { BusinessTransactionModel } from '../models/BusinessTransaction';
import { ProcessedDocumentModel } from '../models/Document';
import { PurchaseHistoryModel } from '../models/PurchaseHistory';
import { CompanyService } from './company.service';
import { CustomerService } from './customer.service';
import mongoose from 'mongoose';

export interface InvoiceGenerationRequest {
  transactionId: string;
  shipmentType: 'full' | 'partial';
  bankName: string;
  selectedItems?: InvoiceItem[];
}

export interface InvoiceItem {
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface GeneratedInvoice {
  invoiceNumber: string;
  content: string;
  currency: string;
  totalAmount: number;
  items: InvoiceItem[];
  bankName: string;
  isPartialShipment: boolean;
}

export class InvoiceGenerationService {
  private companyService = new CompanyService();
  private customerService = new CustomerService();

  /**
   * Generate invoice for full or partial shipment
   */
  async generateInvoice(request: InvoiceGenerationRequest): Promise<GeneratedInvoice> {
    try {
      // Get transaction details
      const transaction = await BusinessTransactionModel.findOne({ 
        transactionId: request.transactionId 
      }).exec();

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Get purchase history to get items and pricing
      const purchaseHistory = await PurchaseHistoryModel.findOne({
        transactionId: request.transactionId
      }).exec();

      if (!purchaseHistory) {
        throw new Error('Purchase history not found');
      }

      // Get company and customer details
      const company = await this.companyService.getCompanyById(transaction.companyId!.toString());
      const customer = await this.customerService.getCustomerById(transaction.customerId!.toString());

      if (!company || !customer) {
        throw new Error('Missing required company or customer information');
      }

      // Determine items to invoice
      let itemsToInvoice: InvoiceItem[];
      if (request.shipmentType === 'partial' && request.selectedItems) {
        itemsToInvoice = request.selectedItems;
      } else {
        // Full shipment - use all items
        itemsToInvoice = purchaseHistory.items.map(item => ({
          itemName: item.itemName,
          description: item.description || '',
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }));
      }

      // Generate invoice
      const invoice = await this.generateInvoiceDocument(
        transaction,
        purchaseHistory,
        company,
        customer,
        itemsToInvoice,
        request
      );

      // Update transaction status
      await BusinessTransactionModel.findOneAndUpdate(
        { transactionId: request.transactionId },
        {
          status: 'invoice_received',
          updatedDate: new Date()
        }
      );

      // Update purchase history status
      if (request.shipmentType === 'full') {
        await PurchaseHistoryModel.findOneAndUpdate(
          { transactionId: request.transactionId },
          { status: 'invoiced' }
        );
      }

      return invoice;

    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error(`Failed to generate invoice: ${error}`);
    }
  }

  /**
   * Get available items for invoice generation
   */
  async getAvailableItems(transactionId: string): Promise<{
    items: InvoiceItem[];
    currency: string;
    totalAmount: number;
  }> {
    try {
      const purchaseHistory = await PurchaseHistoryModel.findOne({
        transactionId
      }).exec();

      if (!purchaseHistory) {
        throw new Error('Purchase history not found');
      }

      const items = purchaseHistory.items.map(item => ({
        itemName: item.itemName,
        description: item.description || '',
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }));

      return {
        items,
        currency: purchaseHistory.currency,
        totalAmount: purchaseHistory.totalAmount
      };

    } catch (error) {
      console.error('Error fetching available items:', error);
      throw new Error('Failed to fetch available items');
    }
  }

  /**
   * Generate the invoice document content
   */
  private async generateInvoiceDocument(
    transaction: any,
    purchaseHistory: any,
    company: any,
    customer: any,
    items: InvoiceItem[],
    request: InvoiceGenerationRequest
  ): Promise<GeneratedInvoice> {
    
    const invoiceNumber = `INV-${transaction.orderReferenceNumber}-${Date.now()}`;
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Use AED currency for customer invoice (PFI was in AED)
    const exchangeRate = this.getExchangeRate(purchaseHistory.currency);
    const itemsAED = items.map(item => ({
      ...item,
      unitPrice: item.unitPrice * exchangeRate,
      totalPrice: item.totalPrice * exchangeRate
    }));
    const totalAmountAED = totalAmount * exchangeRate;

    const invoiceContent = `
COMMERCIAL INVOICE

From: ${company.name}
      ${company.address}
      Tel: ${company.contact}
      Email: ${company.email}

To: ${customer.name}
    ${customer.address}
    ${customer.contact ? 'Tel: ' + customer.contact : ''}
    ${customer.email ? 'Email: ' + customer.email : ''}

Invoice Date: ${new Date().toDateString()}
Invoice Number: ${invoiceNumber}
Order Reference: ${transaction.orderReferenceNumber}
${transaction.buyerOrderReference ? 'Customer PO: ' + transaction.buyerOrderReference : ''}

${request.shipmentType === 'partial' ? '*** PARTIAL SHIPMENT ***' : '*** FULL SHIPMENT ***'}

SHIPPING TERMS: ${transaction.shippingTerms || 'As agreed'} ${transaction.portName || ''}
SHIPMENT METHOD: ${transaction.shipmentMethod?.toUpperCase() || 'TBD'}

ITEMS INVOICED:
${itemsAED.map((item, index) => 
  `${index + 1}. ${item.itemName}
     Description: ${item.description}
     Quantity: ${item.quantity} ${item.unit}
     Unit Price: AED ${item.unitPrice.toFixed(2)}
     Total: AED ${item.totalPrice.toFixed(2)}`
).join('\n\n')}

TOTAL INVOICE AMOUNT: AED ${totalAmountAED.toFixed(2)}
${purchaseHistory.currency !== 'AED' ? `(Original: ${purchaseHistory.currency} ${totalAmount.toFixed(2)} @ Rate 1 ${purchaseHistory.currency} = ${exchangeRate} AED)` : ''}

PAYMENT TERMS: ${purchaseHistory.paymentTerms}
BANK: ${request.bankName}

${request.shipmentType === 'partial' ? 'Balance items will be shipped and invoiced separately.' : 'This completes the order as per PO/Contract.'}

Authorized by: ${company.name}
Date: ${new Date().toDateString()}

---
This invoice represents goods ready for shipment.
Collection documents will be prepared upon confirmation.
    `;

    return {
      invoiceNumber,
      content: invoiceContent,
      currency: 'AED',
      totalAmount: totalAmountAED,
      items: itemsAED,
      bankName: request.bankName,
      isPartialShipment: request.shipmentType === 'partial'
    };
  }

  /**
   * Get banks list for dropdown
   */
  getBanksList(): string[] {
    return [
      'ADIB - Abu Dhabi Islamic Bank',
      'DIB - Dubai Islamic Bank', 
      'BOK - Bank of Kuwait'
    ];
  }

  /**
   * Get fixed exchange rates
   */
  private getExchangeRate(currency: string): number {
    const rates: { [key: string]: number } = {
      'USD': 3.68,
      'EUR': 4.55,
      'AED': 1
    };
    
    return rates[currency] || 1;
  }
}
