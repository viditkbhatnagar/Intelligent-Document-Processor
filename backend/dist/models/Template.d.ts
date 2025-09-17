import mongoose from 'mongoose';
import { TemplateField } from '../types/document.types';
export declare const TemplateModel: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    description: string;
    fields: mongoose.Types.DocumentArray<TemplateField, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, TemplateField> & TemplateField>;
    documentType: string;
    createdBy: string;
    createdDate: NativeDate;
    updatedDate: NativeDate;
    isActive: boolean;
    templateContent?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    description: string;
    fields: mongoose.Types.DocumentArray<TemplateField, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, TemplateField> & TemplateField>;
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
    fields: mongoose.Types.DocumentArray<TemplateField, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, TemplateField> & TemplateField>;
    documentType: string;
    createdBy: string;
    createdDate: NativeDate;
    updatedDate: NativeDate;
    isActive: boolean;
    templateContent?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    description: string;
    fields: mongoose.Types.DocumentArray<TemplateField, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, TemplateField> & TemplateField>;
    documentType: string;
    createdBy: string;
    createdDate: NativeDate;
    updatedDate: NativeDate;
    isActive: boolean;
    templateContent?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    description: string;
    fields: mongoose.Types.DocumentArray<TemplateField, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, TemplateField> & TemplateField>;
    documentType: string;
    createdBy: string;
    createdDate: NativeDate;
    updatedDate: NativeDate;
    isActive: boolean;
    templateContent?: string | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    description: string;
    fields: mongoose.Types.DocumentArray<TemplateField, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, TemplateField> & TemplateField>;
    documentType: string;
    createdBy: string;
    createdDate: NativeDate;
    updatedDate: NativeDate;
    isActive: boolean;
    templateContent?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
