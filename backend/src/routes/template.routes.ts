// backend/src/routes/template.routes.ts
import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const templateController = new TemplateController();

router.use(authenticateToken);

router.post('/', templateController.createTemplate);
router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.post('/:id/clone', templateController.cloneTemplate);

export default router;