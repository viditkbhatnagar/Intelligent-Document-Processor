import express from 'express';
import multer from 'multer';
import { QuotationController } from '../controllers/quotation.controller';

const router = express.Router();
const quotationController = new QuotationController();

// Configure multer for file uploads
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

// Get companies for dropdown
router.get('/companies', quotationController.getCompanies.bind(quotationController));

// Get customers for dropdown
router.get('/customers', quotationController.getCustomers.bind(quotationController));

// Create new customer
router.post('/customers', quotationController.createCustomer.bind(quotationController));

// Upload quotation with workflow data
router.post('/upload', upload.single('file'), quotationController.uploadQuotation.bind(quotationController));

export default router;
