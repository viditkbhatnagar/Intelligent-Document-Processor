import Anthropic from '@anthropic-ai/sdk';
import { DocumentField, ProcessedDocument, Template, TemplateField } from '../types/document.types';

export class AIService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  async extractDocumentFields(text: string, documentType?: string): Promise<DocumentField[]> {
    try {
      const prompt = this.buildExtractionPrompt(text, documentType);
      
      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const response = message.content[0];
      if (response.type === 'text') {
        return this.parseExtractionResponse(response.text);
      }
      
      return [];
    } catch (error) {
      console.error('Error extracting document fields:', error);
      throw new Error('Failed to extract document fields');
    }
  }

  async classifyDocument(text: string): Promise<string> {
    try {
      const prompt = `
        Please classify this document into one of these categories:
        - quotation: Price quotation from supplier
        - proforma_invoice: Proforma invoice from supplier 
        - purchase_order: Purchase order from trading company
        - invoice: General commercial invoice
        - commercial_invoice: Commercial invoice from supplier
        - tax_invoice: Tax invoice from supplier
        - packing_list: Packing list document
        - bill_of_exchange: Bill of exchange document
        - covering_letter: Bank covering letter or collection letter
        - transport_document: Bill of lading, transport document
        - unknown: Other document type

        Document text:
        ${text.substring(0, 2000)}

        Respond with only the category name (lowercase with underscores).
      `;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const response = message.content[0];
      if (response.type === 'text') {
        const classification = response.text.trim().toLowerCase();
        const validTypes = [
          'quotation', 'proforma_invoice', 'purchase_order', 'invoice', 
          'commercial_invoice', 'tax_invoice', 'packing_list', 'bill_of_exchange', 
          'covering_letter', 'transport_document', 'unknown'
        ];
        return validTypes.includes(classification) ? classification : 'unknown';
      }
      
      return 'unknown';
    } catch (error) {
      console.error('Error classifying document:', error);
      return 'unknown';
    }
  }

  async mapFieldsToTemplate(
    extractedFields: DocumentField[], 
    template: Template
  ): Promise<{ mappedFields: DocumentField[], confidence: number }> {
    try {
      const prompt = this.buildMappingPrompt(extractedFields, template);
      
      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Use cheaper model for mapping
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const response = message.content[0];
      if (response.type === 'text') {
        return this.parseMappingResponse(response.text, template);
      }
      
      return { mappedFields: [], confidence: 0 };
    } catch (error) {
      console.error('Error mapping fields to template:', error);
      throw new Error('Failed to map fields to template');
    }
  }

  async generatePopulatedTemplate(
    extractedFields: DocumentField[],
    template: Template
  ): Promise<{ populatedContent: string, confidence: number }> {
    try {
      // Create field mapping for template population
      const fieldMapping: { [key: string]: string } = {};
      
      // Smart mapping based on field keys and hints
      for (const templateField of template.fields) {
        const matchedField = this.findBestFieldMatch(extractedFields, templateField);
        if (matchedField) {
          fieldMapping[templateField.key] = matchedField.value;
        } else {
          // Use placeholder if no match found
          fieldMapping[templateField.key] = templateField.placeholder || 'XXXX';
        }
      }

      // Add current date for date fields if needed
      const currentDate = new Date().toLocaleDateString('en-GB');
      if (!fieldMapping.date || fieldMapping.date === 'XXXX') {
        fieldMapping.date = currentDate;
      }

      // Populate template content
      let populatedContent = template.templateContent || '';
      for (const [key, value] of Object.entries(fieldMapping)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        populatedContent = populatedContent.replace(regex, value);
      }

      // Calculate confidence based on how many fields were successfully mapped
      const totalFields = template.fields.length;
      const mappedFields = Object.values(fieldMapping).filter(v => v !== 'XXXX').length;
      const confidence = totalFields > 0 ? mappedFields / totalFields : 0;

      return {
        populatedContent,
        confidence
      };
    } catch (error) {
      console.error('Error generating populated template:', error);
      throw new Error('Failed to generate populated template');
    }
  }

  private findBestFieldMatch(extractedFields: DocumentField[], templateField: any): DocumentField | null {
    // Direct key match first
    let match = extractedFields.find(f => f.key === templateField.key);
    if (match) return match;

    // Check mapping hints
    for (const hint of templateField.mappingHints || []) {
      match = extractedFields.find(f => f.key === hint || f.key.includes(hint));
      if (match) return match;
    }

    // Semantic matching for common fields
    const semanticMappings: { [key: string]: string[] } = {
      'amount': ['total_amount', 'amount', 'total', 'sum'],
      'date': ['invoice_date', 'date', 'current_date'],
      'invoice_number': ['invoice_number', 'inv_no', 'reference'],
      'bl_date': ['bl_date', 'bill_of_lading_date', 'shipping_date'],
      'drawee_company': ['buyer_name', 'customer_name', 'company_name'],
      'drawee_address': ['buyer_address', 'customer_address', 'address'],
      'drawer_company': ['seller_name', 'supplier_name'],
      'drawer_address': ['seller_address', 'supplier_address'],
      'account_number': ['iban', 'account_number'],
      'collection_documents_for': ['buyer_name', 'customer_name']
    };

    const possibleKeys = semanticMappings[templateField.key] || [];
    for (const key of possibleKeys) {
      match = extractedFields.find(f => f.key === key);
      if (match) return match;
    }

    return null;
  }

  private buildExtractionPrompt(text: string, documentType?: string): string {
    if (documentType === 'invoice') {
      return `
        Extract key information from this INVOICE document and return it as a JSON array of fields.
        
        Focus specifically on these invoice fields (use exact keys):
        - invoice_number: invoice number/reference
        - invoice_date: invoice date
        - total_amount: total invoice amount with currency
        - payment_terms: payment terms (e.g., "180 DAYS BL DATE")
        - buyer_name: buyer/customer company name
        - buyer_address: buyer company full address
        - seller_name: seller/supplier company name 
        - seller_address: seller company full address
        - swift_code: SWIFT code if mentioned
        - iban: IBAN account number if mentioned
        - shipping_terms: shipping terms (e.g., "CFR PORT SUDAN")
        - buyer_ref: buyer reference number
        - freight_amount: freight charges if separate
        - bl_date: bill of lading date if mentioned
        - currency: currency code (AED, USD, etc.)

        For each field, provide:
        - key: exact field identifier from the list above
        - value: the extracted value (clean, no extra formatting)
        - confidence: confidence score from 0.0 to 1.0
        - type: one of "text", "number", "date", "currency", "address", "phone", "email"

        Document text:
        ${text}

        Return only a valid JSON array, no additional text.
      `;
    }

    return `
      Extract key information from this document and return it as a JSON array of fields.
      
      Document type: ${documentType || 'unknown'}
      
      For each field, provide:
      - key: field identifier (e.g., "invoice_number", "amount", "date", "company_name")
      - value: the extracted value
      - confidence: confidence score from 0.0 to 1.0
      - type: one of "text", "number", "date", "currency", "address", "phone", "email"

      Focus on extracting:
      - Dates (invoice dates, BL dates, due dates)
      - Amounts and currencies
      - Company names and addresses
      - Reference numbers (invoice numbers, BL numbers)
      - Contact information
      - Banking details
      - Document-specific fields

      Document text:
      ${text}

      Return only a valid JSON array, no additional text.
    `;
  }

  private buildMappingPrompt(extractedFields: DocumentField[], template: Template): string {
    const templateFieldsStr = template.fields.map(f => 
      `- ${f.key} (${f.label}): type=${f.type}, hints=[${f.mappingHints.join(', ')}]`
    ).join('\n');

    const extractedFieldsStr = extractedFields.map(f => 
      `- ${f.key}: "${f.value}" (confidence: ${f.confidence}, type: ${f.type})`
    ).join('\n');

    return `
      Map the extracted document fields to the template fields. Consider:
      1. Field labels and hints
      2. Data types compatibility
      3. Semantic similarity
      4. Business context (invoice/banking/shipping terms)

      Template fields:
      ${templateFieldsStr}

      Extracted fields:
      ${extractedFieldsStr}

      Return a JSON object with:
      {
        "mappedFields": [
          {
            "templateKey": "template_field_key",
            "value": "mapped_value",
            "confidence": 0.95,
            "type": "field_type",
            "sourceField": "source_field_key"
          }
        ],
        "overallConfidence": 0.85
      }

      Only map fields with reasonable confidence (>0.5). Return only valid JSON.
    `;
  }

  private parseExtractionResponse(response: string): DocumentField[] {
    try {
      const cleanResponse = response.trim();
      const jsonStart = cleanResponse.indexOf('[');
      const jsonEnd = cleanResponse.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No valid JSON array found');
      }
      
      const jsonStr = cleanResponse.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonStr);
      
      return parsed.map((field: any) => ({
        key: field.key || '',
        value: this.normalizeFieldValue(field.value),
        confidence: Math.min(Math.max(field.confidence || 0, 0), 1),
        type: field.type || 'text'
      }));
    } catch (error) {
      console.error('Error parsing extraction response:', error);
      return [];
    }
  }

  private normalizeFieldValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    // If it's an array, join with commas
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    // If it's an object, stringify it
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    // Otherwise convert to string
    return String(value);
  }

  private parseMappingResponse(response: string, template: Template): { mappedFields: DocumentField[], confidence: number } {
    try {
      const cleanResponse = response.trim();
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No valid JSON object found');
      }
      
      const jsonStr = cleanResponse.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonStr);
      
      const mappedFields = (parsed.mappedFields || []).map((field: any) => ({
        key: field.templateKey || field.key || '',
        value: field.value || '',
        confidence: Math.min(Math.max(field.confidence || 0, 0), 1),
        type: field.type || 'text'
      }));

      return {
        mappedFields,
        confidence: Math.min(Math.max(parsed.overallConfidence || 0, 0), 1)
      };
    } catch (error) {
      console.error('Error parsing mapping response:', error);
      return { mappedFields: [], confidence: 0 };
    }
  }

  /**
   * Extract entity information from document fields
   */
  async extractDocumentEntities(extractedFields: DocumentField[], documentType: string): Promise<any> {
    try {
      const fieldsText = extractedFields.map(f => `${f.key}: ${f.value}`).join('\n');
      
      const prompt = `
        Extract entity information from this ${documentType} document:
        
        ${fieldsText}
        
        Please identify and extract:
        - Supplier information (name, address, contact, email)
        - Trading Company/Buyer information (name, address, contact, email)  
        - Customer/End Customer information (name, address, contact, email)
        - Consignee information if different from buyer (name, address, contact, email)
        
        Return as JSON with this structure:
        {
          "supplier": {"name": "", "address": "", "contact": "", "email": ""},
          "tradingCompany": {"name": "", "address": "", "contact": "", "email": ""},
          "customer": {"name": "", "address": "", "contact": "", "email": ""},
          "consignee": {"name": "", "address": "", "contact": "", "email": ""}
        }
        
        Only include entities that are clearly identified. Use empty strings for missing information.
      `;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const response = message.content[0];
      if (response.type === 'text') {
      try {
        // Clean the response text to extract only JSON
        let jsonText = response.text.trim();
        
        // Try to find JSON block if response contains other text
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
        
        return JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing entity extraction result:', parseError);
        console.error('Raw response:', response.text);
        // Return default structure if parsing fails
        return {
          supplier: { name: '', address: '', contact: '' },
          tradingCompany: { name: '', address: '', contact: '' },
          customer: { name: '', address: '', contact: '' },
          consignee: { name: '', address: '', contact: '' }
        };
      }
      }
      
      return {};
    } catch (error) {
      console.error('Error extracting document entities:', error);
      return {};
    }
  }

  /**
   * Check if documents are related based on entity information
   */
  async areDocumentsRelated(newDocument: any, existingDocumentIds: string[]): Promise<boolean> {
    try {
      // This is a simplified implementation
      // In practice, you'd load the existing documents and compare entities
      // For now, return false to force new transactions for each document
      return false;
    } catch (error) {
      console.error('Error checking document relationships:', error);
      return false;
    }
  }
}