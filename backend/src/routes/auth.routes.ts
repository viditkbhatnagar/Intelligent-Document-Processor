// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { authSchemas } from '../middleware/validation.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', validateBody(authSchemas.register), authController.register);
router.post('/login', validateBody(authSchemas.login), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateBody(authSchemas.updateProfile), authController.updateProfile);

export default router;