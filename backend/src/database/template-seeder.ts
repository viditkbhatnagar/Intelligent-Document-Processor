import { TemplateModel } from '../models/Template';

export async function seedTemplates() {
  try {
    // Clear existing templates
    await TemplateModel.deleteMany({});

    // Covering Letter Template
    const coveringLetterTemplate = new TemplateModel({
      name: 'Bank Covering Letter Template',
      description: 'Standard bank covering letter for document collection',
      documentType: 'covering_letter',
      createdBy: 'system',
      fields: [
        {
          key: 'date',
          label: 'Letter Date',
          type: 'date',
          required: true,
          placeholder: 'XXXX',
          mappingHints: ['date', 'letter_date', 'current_date', 'today']
        },
        {
          key: 'our_ref',
          label: 'Our Reference',
          type: 'text',
          required: true,
          placeholder: 'XXXX',
          mappingHints: ['reference', 'our_ref', 'ref_number', 'invoice_number']
        },
        {
          key: 'collection_documents_for',
          label: 'Collection Documents For',
          type: 'text',
          required: true,
          placeholder: 'XXXX',
          mappingHints: ['buyer_name', 'drawee', 'customer_name', 'company_name']
        },
        {
          key: 'bl_date',
          label: 'Bill of Lading Date',
          type: 'date',
          required: true,
          placeholder: 'XXXX',
          mappingHints: ['bl_date', 'bill_of_lading_date', 'shipping_date', 'bol_date']
        },
        {
          key: 'account_number',
          label: 'Account Number',
          type: 'text',
          required: true,
          placeholder: '18866589',
          mappingHints: ['account_number', 'iban', 'account_no']
        },
        {
          key: 'drawee_company',
          label: 'Drawee Company',
          type: 'text',
          required: true,
          placeholder: 'Araak Food Industries Company Ltd',
          mappingHints: ['drawee', 'buyer_name', 'customer_name', 'company_name']
        }
      ],
      templateContent: `
ROCK STONE INTERNATIONAL TRADING FZCO

Dated: {{date}}                                    Our Ref: {{our_ref}}

The Manager
Abu Dhabi Islamic Bank
Trade Finance Department
Abu Dhabi, UAE

Dear Sir,

We enclose herewith the following documents and request you to forward the same to collecting bank without any responsibility on your part requesting them to release the documents to drawee only against their acceptance for payment on due date without any responsibility on collecting bank and Abu Dhabi Islamic Bank's part and only upon receipt of funds from them, please credit the proceeds to our account no {{account_number}} held with you after deduction of your charges under advice to us.

All bank charges outside UAE are to be collected from {{drawee_company}}.

COLLECTION DOCUMENTS for: {{collection_documents_for}}
TENOR: 180 days from Bill of Lading date. (BL Date: {{bl_date}}) Partial payments and early settlement allowed.

COLLECTING BANK:
Bank of Khartoum (BOK), Market Branch, Near Naval Lines, Opp Tarco Airline Office, Port Sudan, Sudan. Attn: Mr Muzmil Hassan Mohamed Ismail

DRAWEE:
{{drawee_company}}
No. 10/2, Block 6, Industrial Area, Khartoum, Sudan,
Tel: 00249185314147

DOCUMENTS ENCLOSED:
[Document list to be populated]
      `
    });

    // Bill of Exchange Template
    const billOfExchangeTemplate = new TemplateModel({
      name: 'Bill of Exchange Template',
      description: 'Standard bill of exchange for trade finance',
      documentType: 'bill_of_exchange',
      createdBy: 'system',
      fields: [
        {
          key: 'amount',
          label: 'Amount',
          type: 'currency',
          required: true,
          placeholder: 'XXX',
          mappingHints: ['amount', 'total', 'total_amount', 'invoice_total', 'sum']
        },
        {
          key: 'date',
          label: 'Bill Date',
          type: 'date',
          required: true,
          placeholder: 'XXXX',
          mappingHints: ['date', 'bill_date', 'current_date', 'today']
        },
        {
          key: 'bl_date',
          label: 'Bill of Lading Date',
          type: 'date',
          required: true,
          placeholder: 'XXXX',
          mappingHints: ['bl_date', 'bill_of_lading_date', 'shipping_date', 'bol_date']
        },
        {
          key: 'invoice_number',
          label: 'Invoice Number',
          type: 'text',
          required: true,
          placeholder: 'XXXX',
          mappingHints: ['invoice_number', 'invoice_no', 'inv_no', 'reference']
        },
        {
          key: 'invoice_date',
          label: 'Invoice Date',
          type: 'date',
          required: true,
          placeholder: 'XXXXX',
          mappingHints: ['invoice_date', 'date', 'inv_date']
        },
        {
          key: 'drawee_company',
          label: 'Drawee Company (Drawn On)',
          type: 'text',
          required: true,
          placeholder: 'Araak Food Industries Co. Ltd',
          mappingHints: ['drawee', 'buyer_name', 'customer_name', 'company_name']
        },
        {
          key: 'drawee_address',
          label: 'Drawee Address',
          type: 'address',
          required: true,
          placeholder: 'No. 10/2, Block No. 6, Industrial Area Khartoum, Sudan',
          mappingHints: ['drawee_address', 'buyer_address', 'customer_address', 'address']
        },
        {
          key: 'drawer_company',
          label: 'Drawer Company',
          type: 'text',
          required: true,
          placeholder: 'Rock Stone International Trading FZCO',
          mappingHints: ['drawer', 'seller_name', 'company_name', 'supplier']
        },
        {
          key: 'drawer_address',
          label: 'Drawer Address',
          type: 'address',
          required: true,
          placeholder: 'Block 6WB, DAFZA Dubai, UAE',
          mappingHints: ['drawer_address', 'seller_address', 'company_address', 'supplier_address']
        }
      ],
      templateContent: `
BILL OF EXCHANGE

┌─────────────────────────────────┬─────────────────────────────────┐
│        AMOUNT: {{amount}}       │         DATED: {{date}}         │
└─────────────────────────────────┴─────────────────────────────────┘

At 180 days from the date of Bill of Lading (BL Date:{{bl_date}}) of this bill of exchange pay to the order of Abu Dhabi Islamic Bank, Abu Dhabi — UAE a sum of {{amount}} only being value drawn under, Invoice # {{invoice_number}} dated {{invoice_date}}


DRAWN ON                           DRAWER

{{drawee_company}}                {{drawer_company}}
{{drawee_address}}                {{drawer_address}}
      `
    });

    await coveringLetterTemplate.save();
    await billOfExchangeTemplate.save();

    console.log('✅ Templates seeded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    return false;
  }
}
