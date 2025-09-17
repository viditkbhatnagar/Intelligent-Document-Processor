import { ProcessedDocument } from '../types/document.types';
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
export declare class TemplateAutoPopulationService {
    private aiService;
    /**
     * Auto-populate covering letter and bill of exchange from transaction documents
     */
    populateTemplatesFromTransaction(documents: ProcessedDocument[], bankType?: 'bank1' | 'bank2' | 'bank3'): Promise<PopulatedTemplate[]>;
    private extractKeyDataFromDocuments;
    private mapFieldToData;
    private generateCoveringLetter;
    private generateBillOfExchange;
    private calculateConfidence;
    private getCoveringLetterEditableFields;
    private getBillOfExchangeEditableFields;
    private getCoveringLetterTemplateBank1;
    private getCoveringLetterTemplateBank2;
    private getCoveringLetterTemplateBank3;
    private getBillOfExchangeTemplate;
    /**
     * Update template with user edits
     */
    updateTemplateFields(templateId: string, fields: {
        [key: string]: string;
    }): Promise<PopulatedTemplate>;
    /**
     * Generate final documents for download
     */
    generateFinalDocuments(templates: PopulatedTemplate[]): Promise<{
        filename: string;
        content: string;
    }[]>;
}
