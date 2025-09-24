import express from 'express';
import multer from 'multer';
import { CollectionDocumentsController } from '../controllers/collection-documents.controller';

const router = express.Router();
const collectionController = new CollectionDocumentsController();

// Configure multer for transport document uploads
const upload = multer({
  storage: multer.memoryStorage(),
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
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get available banks for dropdown
router.get('/banks', collectionController.getAvailableBanks.bind(collectionController));

// Generate collection documents with transport document upload
router.post('/generate', upload.single('transportDocument'), collectionController.generateCollectionDocuments.bind(collectionController));

export default router;
