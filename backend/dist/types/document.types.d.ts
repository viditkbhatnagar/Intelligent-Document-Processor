export interface DocumentField {
    key: string;
    value: string;
    confidence: number;
    type: 'text' | 'number' | 'date' | 'currency' | 'address' | 'phone' | 'email';
    position?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export interface ProcessedDocument {
    _id?: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadDate: Date;
    processedDate?: Date;
    status: 'uploaded' | 'processing' | 'processed' | 'failed';
    documentType: 'quotation' | 'proforma_invoice' | 'purchase_order' | 'invoice' | 'commercial_invoice' | 'tax_invoice' | 'packing_list' | 'bill_of_exchange' | 'covering_letter' | 'transport_document' | 'unknown';
    extractedFields: DocumentField[];
    rawText?: string;
    userId: string;
    error?: string;
    transactionId?: string;
    relatedDocuments?: string[];
    entities?: DocumentEntities;
}
export interface Template {
    _id?: string;
    name: string;
    description: string;
    documentType: string;
    fields: TemplateField[];
    templateContent?: string;
    createdBy: string;
    createdDate: Date;
    updatedDate: Date;
    isActive: boolean;
}
export interface TemplateField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'currency' | 'address' | 'phone' | 'email';
    required: boolean;
    placeholder?: string;
    validation?: {
        pattern?: string;
        min?: number;
        max?: number;
        minLength?: number;
        maxLength?: number;
    };
    mappingHints: string[];
}
export interface DocumentProcessingJob {
    _id?: string;
    documentId: string;
    templateId?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    startTime: Date;
    endTime?: Date;
    result?: any;
    error?: string;
    userId: string;
}
export interface AutoFillRequest {
    templateId: string;
    sourceDocumentIds: string[];
    targetFields: string[];
}
export interface AutoFillResult {
    templateId: string;
    filledFields: DocumentField[];
    confidence: number;
    suggestions: DocumentField[];
    unmappedFields: string[];
}
export interface DocumentEntities {
    supplier?: {
        name: string;
        address?: string;
        contact?: string;
        email?: string;
    };
    tradingCompany?: {
        name: string;
        address?: string;
        contact?: string;
        email?: string;
    };
    customer?: {
        name: string;
        address?: string;
        contact?: string;
        email?: string;
    };
    consignee?: {
        name: string;
        address?: string;
        contact?: string;
        email?: string;
    };
}
export interface BusinessTransaction {
    _id?: string;
    transactionId: string;
    userId: string;
    status: 'quotation_received' | 'po_issued' | 'proforma_received' | 'payment_made' | 'order_ready' | 'invoice_received' | 'completed';
    currentStep: WorkflowStep;
    entities: DocumentEntities;
    documents: TransactionDocument[];
    paymentTerms?: PaymentTerms;
    totalAmount?: number;
    currency?: string;
    createdDate: Date;
    updatedDate: Date;
    nextSuggestedActions?: WorkflowSuggestion[];
}
export interface TransactionDocument {
    documentId: string;
    documentType: string;
    uploadDate: Date;
    processedDate?: Date;
    status: string;
    role: 'source' | 'generated' | 'received';
}
export interface PaymentTerms {
    type: 'full_advance' | 'partial_advance' | 'on_delivery' | 'credit';
    percentage?: number;
    daysFromProforma?: number;
    daysFromDelivery?: number;
    description?: string;
}
export interface WorkflowStep {
    stepId: string;
    stepName: string;
    description: string;
    requiredDocuments: string[];
    optionalDocuments: string[];
    expectedNextSteps: string[];
}
export interface WorkflowSuggestion {
    action: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    requiredDocuments?: string[];
    confidence: number;
}
