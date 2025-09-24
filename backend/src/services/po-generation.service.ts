import { BusinessTransactionModel, BusinessTransactionDoc } from '../models/BusinessTransaction';
import { ProcessedDocumentModel } from '../models/Document';
import { PurchaseHistoryModel } from '../models/PurchaseHistory';
import { CompanyService } from './company.service';
import { CustomerService } from './customer.service';
import { SupplierService } from './supplier.service';
import { AIService } from './ai.service';
import mongoose from 'mongoose';

export interface POGenerationRequest {
  transactionId: string;
  shippingTerms: string;
  portName: string;
  buyerOrderReference: string;
  shipmentMethod: 'sea' | 'air' | 'road';
}

export interface GeneratedDocument {
  type: 'PO' | 'PFI';
  content: string;
  currency: string;
  totalAmount: number;
  items: any[];
}

export class POGenerationService {
  private companyService = new CompanyService();
  private customerService = new CustomerService();
  private supplierService = new SupplierService();
  private aiService = new AIService();

  /**
   * Generate PO (Purchase Order) and PFI (Proforma Invoice)
   */
  async generatePOAndPFI(request: POGenerationRequest): Promise<{
    po: GeneratedDocument;
    pfi: GeneratedDocument;
  }> {
    try {
      // Get transaction details
      const transaction = await BusinessTransactionModel.findOne({ 
        transactionId: request.transactionId 
      }).exec();

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Get the quotation document
      const quotationDoc = transaction.documents.find(d => d.documentType === 'quotation');
      if (!quotationDoc) {
        throw new Error('Quotation document not found in transaction');
      }

      const processedQuotation = await ProcessedDocumentModel.findById(quotationDoc.documentId).exec();
      if (!processedQuotation) {
        throw new Error('Processed quotation document not found');
      }

      // Get company, customer, and supplier details
      const company = await this.companyService.getCompanyById(transaction.companyId!.toString());
      const customer = await this.customerService.getCustomerById(transaction.customerId!.toString());
      const supplier = await this.supplierService.getSupplierById(transaction.supplierId!.toString());

      if (!company || !customer || !supplier) {
        throw new Error('Missing required company, customer, or supplier information');
      }

      // Extract items and pricing from quotation
      const extractedData = this.extractItemsFromQuotation(processedQuotation.extractedFields);
      
      // Generate PO in supplier currency
      const po = await this.generatePO(
        transaction,
        processedQuotation,
        extractedData,
        company,
        supplier,
        request
      );

      // Generate PFI in AED
      const pfi = await this.generatePFI(
        transaction,
        extractedData,
        company,
        customer,
        request
      );

      // Update transaction status
      await BusinessTransactionModel.findOneAndUpdate(
        { transactionId: request.transactionId },
        {
          status: 'po_issued',
          shippingTerms: request.shippingTerms,
          portName: request.portName,
          buyerOrderReference: request.buyerOrderReference,
          updatedDate: new Date()
        }
      );

      // Save to purchase history
      await this.saveToPurchaseHistory(transaction, extractedData, request);

      return { po, pfi };

    } catch (error) {
      console.error('Error generating PO and PFI:', error);
      throw new Error(`Failed to generate PO and PFI: ${error}`);
    }
  }

  /**
   * Extract items and pricing from quotation fields
   */
  private extractItemsFromQuotation(fields: any[]): any {
    const items: any[] = [];
    let totalAmount = 0;
    let currency = 'USD';

    // Look for currency information
    const currencyField = fields.find(f => 
      f.key.toLowerCase().includes('currency') || 
      f.type === 'currency'
    );
    if (currencyField) {
      const value = currencyField.value.toLowerCase();
      if (value.includes('usd') || value.includes('$')) currency = 'USD';
      else if (value.includes('eur') || value.includes('€')) currency = 'EUR';
      else if (value.includes('aed') || value.includes('dh')) currency = 'AED';
    }

    // Extract items (this is a simplified version - in production you'd want more sophisticated parsing)
    const itemFields = fields.filter(f => 
      f.key.toLowerCase().includes('item') ||
      f.key.toLowerCase().includes('product') ||
      f.key.toLowerCase().includes('description')
    );

    const quantityFields = fields.filter(f => 
      f.key.toLowerCase().includes('quantity') ||
      f.key.toLowerCase().includes('qty')
    );

    const priceFields = fields.filter(f => 
      f.key.toLowerCase().includes('price') ||
      f.key.toLowerCase().includes('rate') ||
      f.key.toLowerCase().includes('amount')
    );

    // Create items from extracted fields
    for (let i = 0; i < Math.max(itemFields.length, 1); i++) {
      const item = {
        itemName: itemFields[i]?.value || 'Item',
        description: itemFields[i]?.value || '',
        quantity: quantityFields[i] ? parseFloat(quantityFields[i].value.replace(/[^\d.]/g, '')) || 1 : 1,
        unit: 'PCS',
        unitPrice: priceFields[i] ? parseFloat(priceFields[i].value.replace(/[^\d.]/g, '')) || 0 : 0,
        totalPrice: 0
      };
      
      item.totalPrice = item.quantity * item.unitPrice;
      totalAmount += item.totalPrice;
      items.push(item);
    }

    // If no items found, create a default item from total amount
    if (items.length === 0) {
      const totalField = fields.find(f => 
        f.key.toLowerCase().includes('total') && f.type === 'currency'
      );
      if (totalField) {
        totalAmount = parseFloat(totalField.value.replace(/[^\d.]/g, ''));
        items.push({
          itemName: 'As per quotation',
          description: 'As specified in quotation',
          quantity: 1,
          unit: 'LOT',
          unitPrice: totalAmount,
          totalPrice: totalAmount
        });
      }
    }

    return {
      items,
      totalAmount,
      currency
    };
  }

  /**
   * Generate Purchase Order in supplier currency
   */
  private async generatePO(
    transaction: BusinessTransactionDoc,
    quotation: any,
    extractedData: any,
    company: any,
    supplier: any,
    request: POGenerationRequest
  ): Promise<GeneratedDocument> {
    const paymentTerms = this.generatePaymentTerms(request.shipmentMethod);
    
    const poContent = `
PURCHASE ORDER

From: ${company.name}
      ${company.address}
      Tel: ${company.contact}
      Email: ${company.email}

To: ${supplier.name}
    ${supplier.address}
    ${supplier.contact ? 'Tel: ' + supplier.contact : ''}
    ${supplier.email ? 'Email: ' + supplier.email : ''}

PO Date: ${new Date().toDateString()}
PO Number: PO-${transaction.orderReferenceNumber}
Order Reference: ${transaction.orderReferenceNumber}
${request.buyerOrderReference ? 'Buyer Order Reference: ' + request.buyerOrderReference : ''}

SHIPPING TERMS: ${request.shippingTerms} ${request.portName}
SHIPMENT METHOD: ${request.shipmentMethod.toUpperCase()}
PAYMENT TERMS: ${paymentTerms}

ITEMS:
${extractedData.items.map((item: any, index: number) => 
  `${index + 1}. ${item.itemName}
     Description: ${item.description}
     Quantity: ${item.quantity} ${item.unit}
     Unit Price: ${extractedData.currency} ${item.unitPrice.toFixed(2)}
     Total: ${extractedData.currency} ${item.totalPrice.toFixed(2)}`
).join('\n\n')}

TOTAL AMOUNT: ${extractedData.currency} ${extractedData.totalAmount.toFixed(2)}

Please confirm receipt and provide delivery schedule.

Authorized by: ${company.name}
Date: ${new Date().toDateString()}
    `;

    return {
      type: 'PO',
      content: poContent,
      currency: extractedData.currency,
      totalAmount: extractedData.totalAmount,
      items: extractedData.items
    };
  }

  /**
   * Generate Proforma Invoice in AED
   */
  private async generatePFI(
    transaction: BusinessTransactionDoc,
    extractedData: any,
    company: any,
    customer: any,
    request: POGenerationRequest
  ): Promise<GeneratedDocument> {
    const exchangeRate = this.getExchangeRate(extractedData.currency);
    const totalAmountAED = extractedData.totalAmount * exchangeRate;
    
    const itemsAED = extractedData.items.map((item: any) => ({
      ...item,
      unitPrice: item.unitPrice * exchangeRate,
      totalPrice: item.totalPrice * exchangeRate
    }));

    const pfiContent = `
PROFORMA INVOICE

From: ${company.name}
      ${company.address}
      Tel: ${company.contact}
      Email: ${company.email}

To: ${customer.name}
    ${customer.address}
    ${customer.contact ? 'Tel: ' + customer.contact : ''}
    ${customer.email ? 'Email: ' + customer.email : ''}

PFI Date: ${new Date().toDateString()}
PFI Number: PFI-${transaction.orderReferenceNumber}
Order Reference: ${transaction.orderReferenceNumber}
${request.buyerOrderReference ? 'Customer PO: ' + request.buyerOrderReference : ''}

SHIPPING TERMS: ${request.shippingTerms} ${request.portName}
SHIPMENT METHOD: ${request.shipmentMethod.toUpperCase()}

ITEMS:
${itemsAED.map((item: any, index: number) => 
  `${index + 1}. ${item.itemName}
     Description: ${item.description}
     Quantity: ${item.quantity} ${item.unit}
     Unit Price: AED ${item.unitPrice.toFixed(2)}
     Total: AED ${item.totalPrice.toFixed(2)}`
).join('\n\n')}

TOTAL AMOUNT: AED ${totalAmountAED.toFixed(2)}
${extractedData.currency !== 'AED' ? `(Original: ${extractedData.currency} ${extractedData.totalAmount.toFixed(2)} @ Rate 1 ${extractedData.currency} = ${exchangeRate} AED)` : ''}

This proforma invoice is valid for 30 days from date of issue.

Prepared by: ${company.name}
Date: ${new Date().toDateString()}
    `;

    return {
      type: 'PFI',
      content: pfiContent,
      currency: 'AED',
      totalAmount: totalAmountAED,
      items: itemsAED
    };
  }

  /**
   * Save transaction to purchase history
   */
  private async saveToPurchaseHistory(
    transaction: BusinessTransactionDoc,
    extractedData: any,
    request: POGenerationRequest
  ): Promise<void> {
    try {
      const exchangeRate = this.getExchangeRate(extractedData.currency);
      
      const purchaseHistory = new PurchaseHistoryModel({
        orderReferenceNumber: transaction.orderReferenceNumber!,
        companyId: transaction.companyId,
        supplierId: transaction.supplierId,
        customerId: transaction.customerId,
        transactionId: transaction.transactionId,
        documentId: transaction.documents[0].documentId, // Quotation document
        items: extractedData.items,
        totalAmount: extractedData.totalAmount,
        currency: extractedData.currency,
        exchangeRate: extractedData.currency !== 'AED' ? exchangeRate : undefined,
        totalAmountAED: extractedData.totalAmount * exchangeRate,
        purchaseDate: new Date(),
        shipmentMethod: request.shipmentMethod,
        shippingTerms: request.shippingTerms,
        portName: request.portName,
        paymentTerms: this.generatePaymentTerms(request.shipmentMethod),
        buyerOrderReference: request.buyerOrderReference,
        status: 'po_issued',
        createdBy: transaction.userId
      });

      await purchaseHistory.save();
    } catch (error) {
      console.error('Error saving purchase history:', error);
      // Don't throw error here as this shouldn't fail the main process
    }
  }

  /**
   * Generate payment terms based on shipment method
   */
  private generatePaymentTerms(shipmentMethod: string): string {
    switch (shipmentMethod.toLowerCase()) {
      case 'sea':
        return '180 DAYS FROM BL';
      case 'air':
        return '180 DAYS FROM AWB';
      case 'road':
        return '180 DAYS FROM RWB';
      default:
        return '180 DAYS FROM SHIPPING DOCUMENT';
    }
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
