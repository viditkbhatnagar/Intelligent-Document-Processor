"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/processing.routes.ts
const express_1 = require("express");
const processing_controller_1 = require("../controllers/processing.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const processingController = new processing_controller_1.ProcessingController();
router.use(auth_middleware_1.authenticateToken);
router.post('/extract-fields', processingController.extractFields);
router.post('/map-fields', processingController.mapFields);
router.post('/generate-document', processingController.generateDocument);
router.get('/jobs', processingController.getProcessingJobs);
router.get('/jobs/:id', processingController.getProcessingJob);
router.post('/jobs/:id/cancel', processingController.cancelProcessingJob);
exports.default = router;
//# sourceMappingURL=processing.routes.js.map