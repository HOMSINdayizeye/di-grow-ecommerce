import { Router } from 'express';
import * as products from '../../controllers/productController.js';
import * as categories from '../../controllers/categoryController.js';
import * as orders from '../../controllers/orderController.js';
import * as blog from '../../controllers/blogController.js';
import * as settings from '../../controllers/settingsController.js';
import * as seo from '../../controllers/seoController.js';
import { validate } from '../../middleware/validate.js';
import { orderLimiter, trackLimiter } from '../../middleware/rateLimit.js';
import { createOrderSchema, trackOrderSchema } from '../../validations/index.js';

const router = Router();

router.get('/products', products.listPublic);
router.get('/products/:slug', products.getBySlug);

router.get('/categories', categories.listPublic);
router.get('/categories/:slug', categories.getBySlug);

router.post('/orders', orderLimiter, validate(createOrderSchema), orders.create);
router.get('/orders/track', trackLimiter, validate(trackOrderSchema, 'query'), orders.track);
router.get('/orders/confirmation/:token', orders.getByToken);

router.get('/blog', blog.listPublic);
router.get('/blog/:slug', blog.getBySlug);

router.get('/settings', settings.getPublic);
router.get('/seo/sitemap.xml', seo.sitemap);

export default router;
