import { DocumentField } from '../types/document.types';
export interface PopulatedDocument {
    templateName: string;
    documentType: string;
    content: string;
    confidence: number;
    fields: DocumentField[];
}
export declare class TemplatePopulationService {
    private aiService;
    populateTemplatesFromInvoice(documentId: string): Promise<PopulatedDocument[]>;
    getAvailableTemplates(): Promise<(import("mongoose").Document<unknown, {}, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        name: string;
        description: string;
        fields: import("mongoose").Types.DocumentArray<import("../types/document.types").TemplateField, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, import("../types/document.types").TemplateField> & import("../types/document.types").TemplateField>;
        documentType: string;
        createdBy: string;
        createdDate: NativeDate;
        updatedDate: NativeDate;
        isActive: boolean;
        templateContent?: string | null | undefined;
    }, {}, {
        timestamps: true;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        name: string;
        description: string;
        fields: import("mongoose").Types.DocumentArray<import("../types/document.types").TemplateField, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, import("../types/document.types").TemplateField> & import("../types/document.types").TemplateField>;
        documentType: string;
        createdBy: string;
        createdDate: NativeDate;
        updatedDate: NativeDate;
        isActive: boolean;
        templateContent?: string | null | undefined;
    } & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    previewTemplatePopulation(extractedFields: DocumentField[], templateId: string): Promise<PopulatedDocument>;
    enhanceFieldExtraction(documentId: string, additionalFields: DocumentField[]): Promise<DocumentField[]>;
}
