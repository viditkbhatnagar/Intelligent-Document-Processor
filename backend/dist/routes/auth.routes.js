"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_2 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post('/register', (0, validation_middleware_1.validateBody)(validation_middleware_2.authSchemas.register), authController.register);
router.post('/login', (0, validation_middleware_1.validateBody)(validation_middleware_2.authSchemas.login), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/profile', auth_middleware_1.authenticateToken, authController.getProfile);
router.put('/profile', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateBody)(validation_middleware_2.authSchemas.updateProfile), authController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map