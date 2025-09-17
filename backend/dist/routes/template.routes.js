"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/template.routes.ts
const express_1 = require("express");
const template_controller_1 = require("../controllers/template.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const templateController = new template_controller_1.TemplateController();
router.use(auth_middleware_1.authenticateToken);
router.post('/', templateController.createTemplate);
router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.post('/:id/clone', templateController.cloneTemplate);
exports.default = router;
//# sourceMappingURL=template.routes.js.map