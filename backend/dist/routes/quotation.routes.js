"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const quotation_controller_1 = require("../controllers/quotation.controller");
const router = express_1.default.Router();
const quotationController = new quotation_controller_1.QuotationController();
// Configure multer for file uploads
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
// Get companies for dropdown
router.get('/companies', quotationController.getCompanies.bind(quotationController));
// Get customers for dropdown
router.get('/customers', quotationController.getCustomers.bind(quotationController));
// Create new customer
router.post('/customers', quotationController.createCustomer.bind(quotationController));
// Upload quotation with workflow data
router.post('/upload', upload.single('file'), quotationController.uploadQuotation.bind(quotationController));
exports.default = router;
//# sourceMappingURL=quotation.routes.js.map