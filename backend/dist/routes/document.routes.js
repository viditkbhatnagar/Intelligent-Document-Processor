"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/document.routes.ts
const express_1 = require("express");
const document_controller_1 = require("../controllers/document.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
const documentController = new document_controller_1.DocumentController();
// Skip authentication for demo purposes - enable for production
// router.use(authenticateToken);
router.post('/upload', upload_middleware_1.uploadMiddleware.single('file'), documentController.uploadDocument.bind(documentController));
router.get('/', documentController.getDocuments.bind(documentController));
router.get('/:id', documentController.getDocument.bind(documentController));
router.delete('/:id', documentController.deleteDocument.bind(documentController));
router.post('/:id/reprocess', documentController.reprocessDocument.bind(documentController));
exports.default = router;
//# sourceMappingURL=document.routes.js.map