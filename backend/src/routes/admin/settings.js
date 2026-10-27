import { Router } from 'express';
import * as ctrl from '../../controllers/settingsController.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { settingsSchema } from '../../validations/index.js';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.get);
router.put('/', requireAdmin, validate(settingsSchema), ctrl.update);

export default router;
