import { Router } from 'express';
import * as ctrl from '../../controllers/staffController.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { createStaffSchema, updateStaffSchema } from '../../validations/index.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/', ctrl.list);
router.post('/', validate(createStaffSchema), ctrl.create);
router.put('/:id', validate(updateStaffSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
