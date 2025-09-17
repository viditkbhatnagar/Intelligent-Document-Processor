import { DocumentField, Template } from '../types/document.types';
export declare class AIService {
    private anthropic;
    constructor();
    extractDocumentFields(text: string, documentType?: string): Promise<DocumentField[]>;
    classifyDocument(text: string): Promise<string>;
    mapFieldsToTemplate(extractedFields: DocumentField[], template: Template): Promise<{
        mappedFields: DocumentField[];
        confidence: number;
    }>;
    generatePopulatedTemplate(extractedFields: DocumentField[], template: Template): Promise<{
        populatedContent: string;
        confidence: number;
    }>;
    private findBestFieldMatch;
    private buildExtractionPrompt;
    private buildMappingPrompt;
    private parseExtractionResponse;
    private normalizeFieldValue;
    private parseMappingResponse;
    /**
     * Extract entity information from document fields
     */
    extractDocumentEntities(extractedFields: DocumentField[], documentType: string): Promise<any>;
    /**
     * Check if documents are related based on entity information
     */
    areDocumentsRelated(newDocument: any, existingDocumentIds: string[]): Promise<boolean>;
}
