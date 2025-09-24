"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadErrors = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const ocr_service_1 = require("../services/ocr.service");
const ocrService = new ocr_service_1.OCRService();
// Configure multer storage for memory storage (no local files)
const storage = multer_1.default.memoryStorage();
// File filter to validate file types
const fileFilter = (req, file, cb) => {
    const supportedTypes = ocrService.getSupportedMimeTypes();
    if (supportedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Unsupported file type: ${file.mimetype}. Supported types: ${supportedTypes.join(', ')}`));
    }
};
// Configure multer
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 1
    }
});
// Error handling for multer
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
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
exports.handleUploadErrors = handleUploadErrors;
//# sourceMappingURL=upload.middleware.js.map