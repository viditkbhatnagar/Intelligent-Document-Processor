import { Router } from 'express';
import { TemplatePopulationController } from '../controllers/template-population.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const templatePopulationController = new TemplatePopulationController();

// Skip authentication for demo purposes - enable for production
// router.use(authenticateToken);

// Populate templates from invoice
router.post('/populate/:documentId', 
  templatePopulationController.populateFromInvoice.bind(templatePopulationController)
);

// Get available templates
router.get('/templates', 
  templatePopulationController.getTemplates.bind(templatePopulationController)
);

// Preview template population
router.post('/preview/:templateId', 
  templatePopulationController.previewPopulation.bind(templatePopulationController)
);

// Enhance document fields
router.put('/enhance/:documentId', 
  templatePopulationController.enhanceFields.bind(templatePopulationController)
);

// Download populated document
router.get('/download/:documentId/:templateType', 
  templatePopulationController.downloadPopulatedDocument.bind(templatePopulationController)
);

export default router;
