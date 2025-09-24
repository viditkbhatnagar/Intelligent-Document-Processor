"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRService = void 0;
const tesseract_js_1 = require("tesseract.js");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const promises_1 = __importDefault(require("fs/promises"));
class OCRService {
    async extractTextFromBuffer(buffer, mimeType) {
        // Create a temporary file path for libraries that need file paths
        const tempFilePath = `/tmp/temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
            // Write buffer to temporary file
            await promises_1.default.writeFile(tempFilePath, buffer);
            // Extract text using the existing method
            const text = await this.extractTextFromFile(tempFilePath, mimeType);
            // Clean up temporary file
            await promises_1.default.unlink(tempFilePath).catch(() => { }); // Ignore cleanup errors
            return text;
        }
        catch (error) {
            // Ensure cleanup even if extraction fails
            await promises_1.default.unlink(tempFilePath).catch(() => { });
            throw error;
        }
    }
    async extractTextFromFile(filePath, mimeType) {
        try {
            switch (mimeType) {
                case 'application/pdf':
                    return await this.extractTextFromPDF(filePath);
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                case 'application/msword':
                    return await this.extractTextFromWord(filePath);
                case 'image/jpeg':
                case 'image/png':
                case 'image/tiff':
                case 'image/bmp':
                    return await this.extractTextFromImage(filePath);
                case 'text/plain':
                    return await this.extractTextFromPlainText(filePath);
                default:
                    throw new Error(`Unsupported file type: ${mimeType}`);
            }
        }
        catch (error) {
            console.error('Error extracting text from file:', error);
            throw new Error(`Failed to extract text from file: ${error}`);
        }
    }
    async extractTextFromPDF(filePath) {
        try {
            const buffer = await promises_1.default.readFile(filePath);
            const data = await (0, pdf_parse_1.default)(buffer);
            return data.text;
        }
        catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw error;
        }
    }
    async extractTextFromWord(filePath) {
        try {
            const buffer = await promises_1.default.readFile(filePath);
            const result = await mammoth_1.default.extractRawText({ buffer });
            return result.value;
        }
        catch (error) {
            console.error('Error extracting text from Word document:', error);
            throw error;
        }
    }
    async extractTextFromImage(filePath) {
        const worker = await (0, tesseract_js_1.createWorker)('eng');
        try {
            // Configure Tesseract for better accuracy
            await worker.setParameters({
                tessedit_page_seg_mode: '1', // Automatic page segmentation with OSD
                tessedit_ocr_engine_mode: '2', // Neural nets LSTM engine
                preserve_interword_spaces: '1',
            });
            const { data: { text } } = await worker.recognize(filePath);
            await worker.terminate();
            return text.trim();
        }
        catch (error) {
            await worker.terminate();
            console.error('Error extracting text from image:', error);
            throw error;
        }
    }
    async extractTextFromPlainText(filePath) {
        try {
            const content = await promises_1.default.readFile(filePath, 'utf-8');
            return content;
        }
        catch (error) {
            console.error('Error reading plain text file:', error);
            throw error;
        }
    }
    async preprocessImage(inputPath, outputPath) {
        try {
            const sharp = require('sharp');
            // Preprocess image for better OCR results
            await sharp(inputPath)
                .greyscale()
                .normalize()
                .sharpen()
                .jpeg({ quality: 95 })
                .toFile(outputPath);
            return outputPath;
        }
        catch (error) {
            console.error('Error preprocessing image:', error);
            return inputPath; // Return original if preprocessing fails
        }
    }
    isImageFile(mimeType) {
        return ['image/jpeg', 'image/png', 'image/tiff', 'image/bmp'].includes(mimeType);
    }
    isPDFFile(mimeType) {
        return mimeType === 'application/pdf';
    }
    isWordFile(mimeType) {
        return [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ].includes(mimeType);
    }
    getSupportedMimeTypes() {
        return [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'image/jpeg',
            'image/png',
            'image/tiff',
            'image/bmp',
            'text/plain'
        ];
    }
}
exports.OCRService = OCRService;
//# sourceMappingURL=ocr.service.js.map