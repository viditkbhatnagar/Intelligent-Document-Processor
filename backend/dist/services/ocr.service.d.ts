export declare class OCRService {
    extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string>;
    extractTextFromFile(filePath: string, mimeType: string): Promise<string>;
    private extractTextFromPDF;
    private extractTextFromWord;
    private extractTextFromImage;
    private extractTextFromPlainText;
    preprocessImage(inputPath: string, outputPath: string): Promise<string>;
    isImageFile(mimeType: string): boolean;
    isPDFFile(mimeType: string): boolean;
    isWordFile(mimeType: string): boolean;
    getSupportedMimeTypes(): string[];
}
