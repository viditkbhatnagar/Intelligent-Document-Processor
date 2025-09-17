import { ProcessedDocument, DocumentField } from '../types/document.types';
import { AIService } from './ai.service';

export interface PopulatedTemplate {
  id: string;
  name: string;
  bankType: 'bank1' | 'bank2' | 'bank3';
  content: string;
  confidence: number;
  dataSource: {
    invoice?: string;
    transportDoc?: string;
    pfi?: string;
  };
  editableFields: EditableField[];
}

export interface EditableField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'date' | 'number' | 'currency';
  required: boolean;
  placeholder?: string;
}

export class TemplateAutoPopulationService {
  private aiService = new AIService();

  /**
   * Auto-populate covering letter and bill of exchange from transaction documents
   */
  async populateTemplatesFromTransaction(documents: ProcessedDocument[], bankType: 'bank1' | 'bank2' | 'bank3' = 'bank1'): Promise<PopulatedTemplate[]> {
    try {
      // Find key documents in the transaction
      const invoice = documents.find(d => d.documentType === 'commercial_invoice' || d.documentType === 'tax_invoice');
      const pfi = documents.find(d => d.documentType === 'proforma_invoice');
      const transportDoc = documents.find(d => d.documentType === 'packing_list'); // Can be extended for BL, AWB

      if (!invoice && !pfi) {
        throw new Error('No invoice or PFI found in transaction');
      }

      // Use PFI data to create invoice structure (as per user requirements)
      const sourceDoc = invoice || pfi;
      const extractedData = this.extractKeyDataFromDocuments(documents);

      // Generate both templates
      const templates: PopulatedTemplate[] = [];

      // 1. Covering Letter
      const coveringLetter = await this.generateCoveringLetter(extractedData, bankType);
      templates.push(coveringLetter);

      // 2. Bill of Exchange
      const billOfExchange = await this.generateBillOfExchange(extractedData, bankType);
      templates.push(billOfExchange);

      return templates;

    } catch (error) {
      console.error('Error populating templates from transaction:', error);
      throw new Error('Failed to populate templates from transaction');
    }
  }

  private extractKeyDataFromDocuments(documents: ProcessedDocument[]): any {
    const data: any = {
      // Core transaction data
      invoiceNumber: '',
      invoiceDate: '',
      totalAmount: '',
      currency: '',
      paymentTerms: '',
      shippingTerms: '',
      
      // Company details
      supplier: { name: '', address: '', contact: '' },
      tradingCompany: { name: '', address: '', contact: '' },
      customer: { name: '', address: '', contact: '' },
      
      // Banking details
      swiftCode: '',
      accountNumber: '',
      
      // Transport details
      blDate: '',
      blNumber: '',
      portOfLoading: '',
      portOfDischarge: '',
      
      // Additional
      referenceNumber: '',
      tenure: '180', // Default 180 days
      currentDate: new Date().toLocaleDateString('en-GB')
    };

    // Extract data from all documents
    documents.forEach(doc => {
      if (doc.extractedFields) {
        doc.extractedFields.forEach(field => {
          this.mapFieldToData(field, data);
        });
      }

      // Extract entity information
      if (doc.entities) {
        if (doc.entities.supplier) data.supplier = { ...data.supplier, ...doc.entities.supplier };
        if (doc.entities.tradingCompany) data.tradingCompany = { ...data.tradingCompany, ...doc.entities.tradingCompany };
        if (doc.entities.customer) data.customer = { ...data.customer, ...doc.entities.customer };
      }
    });

    return data;
  }

  private mapFieldToData(field: DocumentField, data: any): void {
    const keyMappings: { [key: string]: string } = {
      'invoice_number': 'invoiceNumber',
      'invoice_date': 'invoiceDate',
      'total_amount': 'totalAmount',
      'currency': 'currency',
      'payment_terms': 'paymentTerms',
      'shipping_terms': 'shippingTerms',
      'swift_code': 'swiftCode',
      'iban': 'accountNumber',
      'bl_date': 'blDate',
      'bl_number': 'blNumber',
      'buyer_name': 'customer.name',
      'seller_name': 'supplier.name',
      'port_loading': 'portOfLoading',
      'port_discharge': 'portOfDischarge'
    };

    const targetKey = keyMappings[field.key];
    if (targetKey) {
      if (targetKey.includes('.')) {
        const [obj, prop] = targetKey.split('.');
        if (!data[obj]) data[obj] = {};
        data[obj][prop] = field.value;
      } else {
        data[targetKey] = field.value;
      }
    }
  }

  private async generateCoveringLetter(data: any, bankType: 'bank1' | 'bank2' | 'bank3'): Promise<PopulatedTemplate> {
    const templates = {
      bank1: this.getCoveringLetterTemplateBank1(),
      bank2: this.getCoveringLetterTemplateBank2(),
      bank3: this.getCoveringLetterTemplateBank3()
    };

    const template = templates[bankType];
    let content = template.content;

    // Replace placeholders with extracted data
    const replacements: { [key: string]: string } = {
      '{{DATE}}': data.currentDate,
      '{{REFERENCE_NUMBER}}': data.referenceNumber || 'TRADE-REF-' + Date.now(),
      '{{CUSTOMER_NAME}}': data.customer.name || '[CUSTOMER NAME]',
      '{{CUSTOMER_ADDRESS}}': data.customer.address || '[CUSTOMER ADDRESS]',
      '{{INVOICE_NUMBER}}': data.invoiceNumber || '[INVOICE NUMBER]',
      '{{INVOICE_DATE}}': data.invoiceDate || '[INVOICE DATE]',
      '{{TOTAL_AMOUNT}}': data.totalAmount || '[TOTAL AMOUNT]',
      '{{CURRENCY}}': data.currency || 'USD',
      '{{PAYMENT_TERMS}}': data.paymentTerms || '180 DAYS BL DATE',
      '{{SHIPPING_TERMS}}': data.shippingTerms || 'CFR',
      '{{TENOR_DAYS}}': data.tenure || '180',
      '{{BL_DATE}}': data.blDate || '[BL DATE]',
      '{{SUPPLIER_NAME}}': data.supplier.name || '[SUPPLIER NAME]',
      '{{TRADING_COMPANY}}': data.tradingCompany.name || 'XYZ Trading Company Ltd'
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return {
      id: 'covering-letter-' + bankType,
      name: `Covering Letter (${bankType.toUpperCase()})`,
      bankType,
      content,
      confidence: this.calculateConfidence(replacements),
      dataSource: {
        invoice: data.invoiceNumber,
        pfi: data.pfiNumber,
        transportDoc: data.blNumber
      },
      editableFields: this.getCoveringLetterEditableFields(data)
    };
  }

  private async generateBillOfExchange(data: any, bankType: 'bank1' | 'bank2' | 'bank3'): Promise<PopulatedTemplate> {
    const template = this.getBillOfExchangeTemplate(); // Same for all banks
    let content = template.content;

    // Calculate maturity date (current date + tenor)
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + parseInt(data.tenure || '180'));

    const replacements: { [key: string]: string } = {
      '{{DATE}}': data.currentDate,
      '{{MATURITY_DATE}}': maturityDate.toLocaleDateString('en-GB'),
      '{{TOTAL_AMOUNT}}': data.totalAmount || '[TOTAL AMOUNT]',
      '{{CURRENCY}}': data.currency || 'USD',
      '{{CUSTOMER_NAME}}': data.customer.name || '[CUSTOMER NAME]',
      '{{CUSTOMER_ADDRESS}}': data.customer.address || '[CUSTOMER ADDRESS]',
      '{{INVOICE_NUMBER}}': data.invoiceNumber || '[INVOICE NUMBER]',
      '{{TENOR_DAYS}}': data.tenure || '180',
      '{{REFERENCE_NUMBER}}': data.referenceNumber || 'TRADE-REF-' + Date.now(),
      '{{TRADING_COMPANY}}': data.tradingCompany.name || 'XYZ Trading Company Ltd',
      '{{TRADING_ADDRESS}}': data.tradingCompany.address || '[TRADING COMPANY ADDRESS]'
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return {
      id: 'bill-of-exchange',
      name: 'Bill of Exchange',
      bankType,
      content,
      confidence: this.calculateConfidence(replacements),
      dataSource: {
        invoice: data.invoiceNumber,
        pfi: data.pfiNumber,
        transportDoc: data.blNumber
      },
      editableFields: this.getBillOfExchangeEditableFields(data)
    };
  }

  private calculateConfidence(replacements: { [key: string]: string }): number {
    const total = Object.keys(replacements).length;
    const filled = Object.values(replacements).filter(v => !v.includes('[')).length;
    return total > 0 ? filled / total : 0;
  }

  private getCoveringLetterEditableFields(data: any): EditableField[] {
    return [
      {
        key: 'reference_number',
        label: 'Reference Number',
        value: data.referenceNumber || 'TRADE-REF-' + Date.now(),
        type: 'text',
        required: true,
        placeholder: 'Enter reference number'
      },
      {
        key: 'date',
        label: 'Date',
        value: data.currentDate,
        type: 'date',
        required: true
      },
      {
        key: 'bl_date',
        label: 'B/L Date',
        value: data.blDate || '',
        type: 'date',
        required: true,
        placeholder: 'Enter bill of lading date'
      },
      {
        key: 'tenor_days',
        label: 'Tenor (Days)',
        value: data.tenure || '180',
        type: 'number',
        required: true,
        placeholder: '180'
      }
    ];
  }

  private getBillOfExchangeEditableFields(data: any): EditableField[] {
    return [
      {
        key: 'reference_number',
        label: 'Reference Number',
        value: data.referenceNumber || 'TRADE-REF-' + Date.now(),
        type: 'text',
        required: true,
        placeholder: 'Enter reference number'
      },
      {
        key: 'tenor_days',
        label: 'Tenor (Days)',
        value: data.tenure || '180',
        type: 'number',
        required: true,
        placeholder: '180'
      }
    ];
  }

  // Template definitions for different banks
  private getCoveringLetterTemplateBank1() {
    return {
      content: `
COVERING LETTER - BANK 1 FORMAT

Date: {{DATE}}
Reference: {{REFERENCE_NUMBER}}

To: International Trade Department
[BANK NAME]

Dear Sirs,

We are pleased to submit the following collection documents for account of {{CUSTOMER_NAME}}, {{CUSTOMER_ADDRESS}}:

INVOICE DETAILS:
- Invoice Number: {{INVOICE_NUMBER}}
- Invoice Date: {{INVOICE_DATE}}
- Amount: {{CURRENCY}} {{TOTAL_AMOUNT}}

COLLECTION INSTRUCTIONS:
- Terms: {{PAYMENT_TERMS}}
- Present documents to drawee for acceptance/payment {{TENOR_DAYS}} days from B/L date
- B/L Date: {{BL_DATE}}
- Shipping Terms: {{SHIPPING_TERMS}}

DOCUMENTS ENCLOSED:
1. Commercial Invoice (Original + 2 copies)
2. Packing List (Original + 2 copies)
3. Bill of Exchange
4. Other documents as required

Please handle in accordance with UCP 600 latest revision.

Yours faithfully,
{{TRADING_COMPANY}}

Authorized Signature
      `.trim()
    };
  }

  private getCoveringLetterTemplateBank2() {
    return {
      content: `
BANK 2 COLLECTION LETTER FORMAT

Ref: {{REFERENCE_NUMBER}}
Date: {{DATE}}

International Collections Department
[BANK NAME]

COLLECTION INSTRUCTION

We hereby request you to handle the collection of the under mentioned draft/documents:

DRAWEE: {{CUSTOMER_NAME}}
        {{CUSTOMER_ADDRESS}}

DRAWER: {{TRADING_COMPANY}}

AMOUNT: {{CURRENCY}} {{TOTAL_AMOUNT}}
TENURE: {{TENOR_DAYS}} DAYS FROM B/L DATE {{BL_DATE}}

INVOICE DETAILS:
Number: {{INVOICE_NUMBER}}
Date: {{INVOICE_DATE}}
Terms: {{PAYMENT_TERMS}}

INSTRUCTIONS:
- Documents against acceptance
- Present for acceptance and deliver against payment at maturity
- Advice fate by return

DOCUMENTS:
- Commercial Invoice (3 copies)
- Packing List (3 copies) 
- Draft/Bill of Exchange

Thank you for your cooperation.

{{TRADING_COMPANY}}
Authorized Officer
      `.trim()
    };
  }

  private getCoveringLetterTemplateBank3() {
    return {
      content: `
TRADE FINANCE DEPARTMENT
COLLECTION INSTRUCTION

Reference: {{REFERENCE_NUMBER}}
Date: {{DATE}}

Dear Sirs,

Please find enclosed collection documents for the following transaction:

BUYER: {{CUSTOMER_NAME}}
       {{CUSTOMER_ADDRESS}}

SELLER: {{TRADING_COMPANY}}

COMMERCIAL DETAILS:
- Invoice No: {{INVOICE_NUMBER}} dated {{INVOICE_DATE}}
- Amount: {{CURRENCY}} {{TOTAL_AMOUNT}}
- Terms: {{PAYMENT_TERMS}}
- Tenor: {{TENOR_DAYS}} days from B/L date {{BL_DATE}}

COLLECTION BASIS:
Documents Against Acceptance (D/A)

DOCUMENTS ATTACHED:
• Commercial Invoice (Original + copies)
• Packing List (Original + copies)
• Bill of Exchange

Please handle as per UCP 600 and confirm receipt.

Best regards,
{{TRADING_COMPANY}}
Trade Finance Department
      `.trim()
    };
  }

  private getBillOfExchangeTemplate() {
    return {
      content: `
BILL OF EXCHANGE

Reference: {{REFERENCE_NUMBER}}
Place: _______________
Date: {{DATE}}

At {{TENOR_DAYS}} days sight of this FIRST of Exchange (Second of the same tenor and date being unpaid)

Pay to the order of ourselves the sum of {{CURRENCY}} {{TOTAL_AMOUNT}}

({{CURRENCY}} {{TOTAL_AMOUNT}} ONLY)

Value received and charge the same to account as advised.

To: {{CUSTOMER_NAME}}
    {{CUSTOMER_ADDRESS}}

For: {{TRADING_COMPANY}}
     {{TRADING_ADDRESS}}

Invoice No: {{INVOICE_NUMBER}}
Due Date: {{MATURITY_DATE}}

_________________________
Authorized Signature

_________________________
Name & Designation

_________________________
Date

ACCEPTANCE:

Accepted this _____ day of _________, 20___

_________________________
Signature of Drawee

_________________________
Name & Designation

_________________________
Date
      `.trim()
    };
  }

  /**
   * Update template with user edits
   */
  async updateTemplateFields(templateId: string, fields: { [key: string]: string }): Promise<PopulatedTemplate> {
    // This would update the template with user-edited fields
    // Implementation depends on how you want to store/cache the templates
    throw new Error('Method not implemented');
  }

  /**
   * Generate final documents for download
   */
  async generateFinalDocuments(templates: PopulatedTemplate[]): Promise<{ filename: string, content: string }[]> {
    return templates.map(template => ({
      filename: `${template.name.replace(/\s+/g, '_')}.txt`,
      content: template.content
    }));
  }
}
