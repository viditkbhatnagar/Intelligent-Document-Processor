import multer from 'multer';
import { OCRService } from '../services/ocr.service';

const ocrService = new OCRService();

// Configure multer storage for memory storage (no local files)
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const supportedTypes = ocrService.getSupportedMimeTypes();
  
  if (supportedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Supported types: ${supportedTypes.join(', ')}`));
  }
};

// Configure multer
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1
  }
});

// Error handling for multer
export const handleUploadErrors = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          message: 'File too large. Maximum size is 50MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Too many files. Only one file allowed.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          message: 'Unexpected file field.'
        });
      default:
        return res.status(400).json({
          message: `Upload error: ${error.message}`
        });
    }
  }
  
  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }
  
  next();
};