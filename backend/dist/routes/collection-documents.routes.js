"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const collection_documents_controller_1 = require("../controllers/collection-documents.controller");
const router = express_1.default.Router();
const collectionController = new collection_documents_controller_1.CollectionDocumentsController();
// Configure multer for transport document uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        // Accept common document formats
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/tiff'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
// Get available banks for dropdown
router.get('/banks', collectionController.getAvailableBanks.bind(collectionController));
// Generate collection documents with transport document upload
router.post('/generate', upload.single('transportDocument'), collectionController.generateCollectionDocuments.bind(collectionController));
exports.default = router;
//# sourceMappingURL=collection-documents.routes.js.map