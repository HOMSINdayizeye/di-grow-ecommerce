import { Router } from 'express';
import * as ctrl from '../../controllers/authController.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { loginLimiter, forgotLimiter, resetCodeLimiter } from '../../middleware/rateLimit.js';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../../validations/index.js';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), ctrl.login);
router.get('/me', requireAuth, ctrl.me);
router.post('/logout', requireAuth, ctrl.logout);
router.post('/forgot-password', forgotLimiter, validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post('/reset-password', resetCodeLimiter, validate(resetPasswordSchema), ctrl.resetPassword);
router.post('/change-password', requireAuth, validate(changePasswordSchema), ctrl.changePassword);

export default router;
