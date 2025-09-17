"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const template_population_controller_1 = require("../controllers/template-population.controller");
const router = (0, express_1.Router)();
const templatePopulationController = new template_population_controller_1.TemplatePopulationController();
// Skip authentication for demo purposes - enable for production
// router.use(authenticateToken);
// Populate templates from invoice
router.post('/populate/:documentId', templatePopulationController.populateFromInvoice.bind(templatePopulationController));
// Get available templates
router.get('/templates', templatePopulationController.getTemplates.bind(templatePopulationController));
// Preview template population
router.post('/preview/:templateId', templatePopulationController.previewPopulation.bind(templatePopulationController));
// Enhance document fields
router.put('/enhance/:documentId', templatePopulationController.enhanceFields.bind(templatePopulationController));
// Download populated document
router.get('/download/:documentId/:templateType', templatePopulationController.downloadPopulatedDocument.bind(templatePopulationController));
exports.default = router;
//# sourceMappingURL=template-population.routes.js.map