// backend/src/routes/document.routes.ts
import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();
const documentController = new DocumentController();

// Skip authentication for demo purposes - enable for production
// router.use(authenticateToken);

router.post('/upload', uploadMiddleware.single('file'), documentController.uploadDocument.bind(documentController));
router.get('/', documentController.getDocuments.bind(documentController));
router.get('/:id', documentController.getDocument.bind(documentController));
router.delete('/:id', documentController.deleteDocument.bind(documentController));
router.post('/:id/reprocess', documentController.reprocessDocument.bind(documentController));

export default router;