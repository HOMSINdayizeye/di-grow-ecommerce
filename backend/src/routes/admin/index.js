import { Router } from 'express';
import authRoutes from './auth.js';
import staffRoutes from './staff.js';
import settingsRoutes from './settings.js';
import * as products from '../../controllers/productController.js';
import * as categories from '../../controllers/categoryController.js';
import * as orders from '../../controllers/orderController.js';
import * as blog from '../../controllers/blogController.js';
import * as uploads from '../../controllers/uploadController.js';
import * as catalog from '../../controllers/catalogImportController.js';
import * as notifications from '../../controllers/notificationController.js';
import * as reports from '../../controllers/reportController.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { uploadImage, uploadPdf } from '../../middleware/upload.js';
import {
  productSchema,
  productUpdateSchema,
  categorySchema,
  categoryUpdateSchema,
  blogPostSchema,
  blogPostUpdateSchema,
  orderStatusSchema,
  orderNotesSchema,
  catalogItemsUpdateSchema,
  catalogCommitSchema,
} from '../../validations/index.js';

const router = Router();

// Sign-in, password flows and session.
router.use('/auth', authRoutes);

// Everything below needs a signed-in admin or staff member.
router.use(requireAuth);

router.use('/staff', staffRoutes);
router.use('/settings', settingsRoutes);

// Catalogue PDF imports (before /products/:id so "imports" is never read as an id).
router.get('/products/imports', catalog.list);
router.post('/products/imports', uploadPdf, catalog.create);
router.get('/products/imports/:id', catalog.get);
router.put('/products/imports/:id/items', validate(catalogItemsUpdateSchema), catalog.updateItems);
router.post('/products/imports/:id/commit', validate(catalogCommitSchema), catalog.commit);
router.delete('/products/imports/:id', catalog.remove);

router.get('/products', products.listAdmin);
router.post('/products', validate(productSchema), products.create);
router.get('/products/:id', products.getAdmin);
router.put('/products/:id', validate(productUpdateSchema), products.update);
router.delete('/products/:id', products.remove);

router.get('/categories', categories.listAdmin);
router.post('/categories', validate(categorySchema), categories.create);
router.put('/categories/:id', validate(categoryUpdateSchema), categories.update);
router.delete('/categories/:id', requireAdmin, categories.remove);

router.get('/orders', orders.listAdmin);
router.get('/orders/:id', orders.getAdmin);
router.patch('/orders/:id/status', validate(orderStatusSchema), orders.updateStatus);
router.patch('/orders/:id/notes', validate(orderNotesSchema), orders.updateNotes);

router.get('/blog', blog.listAdmin);
router.post('/blog', validate(blogPostSchema), blog.create);
router.get('/blog/:id', blog.getAdmin);
router.put('/blog/:id', validate(blogPostUpdateSchema), blog.update);
router.delete('/blog/:id', blog.remove);

router.post('/uploads', uploadImage, uploads.upload);

router.get('/notifications', notifications.list);
router.patch('/notifications/:id/read', notifications.markRead);
router.post('/notifications/read-all', notifications.markAllRead);

router.get('/reports/dashboard', reports.dashboard);
router.get('/reports', requireAdmin, reports.summary);
router.get('/reports/audit', requireAdmin, reports.audit);

export default router;
