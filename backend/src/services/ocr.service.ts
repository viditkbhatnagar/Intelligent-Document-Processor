import { createWorker } from 'tesseract.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';

export class OCRService {
  async extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
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
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text from file: ${error}`);
    }
  }

  private async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw error;
    }
  }

  private async extractTextFromWord(filePath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from Word document:', error);
      throw error;
    }
  }

  private async extractTextFromImage(filePath: string): Promise<string> {
    const worker = await createWorker('eng');
    
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
    } catch (error) {
      await worker.terminate();
      console.error('Error extracting text from image:', error);
      throw error;
    }
  }

  private async extractTextFromPlainText(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error('Error reading plain text file:', error);
      throw error;
    }
  }

  async preprocessImage(inputPath: string, outputPath: string): Promise<string> {
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
    } catch (error) {
      console.error('Error preprocessing image:', error);
      return inputPath; // Return original if preprocessing fails
    }
  }

  isImageFile(mimeType: string): boolean {
    return ['image/jpeg', 'image/png', 'image/tiff', 'image/bmp'].includes(mimeType);
  }

  isPDFFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  isWordFile(mimeType: string): boolean {
    return [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ].includes(mimeType);
  }

  getSupportedMimeTypes(): string[] {
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