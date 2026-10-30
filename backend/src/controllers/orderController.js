import { env } from '../config/env.js';
import { Order, Product, Settings, Counter, AuditLog } from '../models/index.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { normalisePhone, last9, randomToken, pageParams, meta, endOfDay, escapeRegex } from '../lib/utils.js';
import { emitAdmin } from '../socket/index.js';
import { pushNotification } from '../lib/notify.js';
import { sendMail } from '../lib/mailer.js';
import { logger } from '../lib/logger.js';

const LOW_STOCK = 5;

async function nextOrderNumber(date = new Date()) {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = await Counter.next(`order:${ymd}`);
  return `DG-${ymd}-${seq}`;
}

/* ------------------------------ Public ------------------------------ */
export const create = asyncHandler(async (req, res) => {
  const { customer, items: requested } = req.body;

  // Merge duplicate lines and price everything from the database, never from the client.
  const qtyById = new Map();
  requested.forEach((i) => qtyById.set(i.productId, (qtyById.get(i.productId) || 0) + i.quantity));
  const products = await Product.find({ _id: { $in: [...qtyById.keys()] } });
  if (products.length !== qtyById.size) throw ApiError.badRequest('One of the products in your cart is no longer available');

  const items = products.map((p) => ({
    product: p._id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    quantity: qtyById.get(String(p._id)),
    image: p.images[0],
    requiresPrescription: p.requiresPrescription,
  }));
  const outOfStock = products.filter((p) => !p.inStock);
  if (outOfStock.length) throw ApiError.badRequest(`${outOfStock[0].name} is currently out of stock`);

  const settings = await Settings.get();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;

  const order = await Order.create({
    orderNumber: await nextOrderNumber(),
    trackingToken: randomToken(18),
    customer: { ...customer, phone: normalisePhone(customer.phone) },
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    hasPrescriptionItems: items.some((i) => i.requiresPrescription),
    status: 'new',
    statusHistory: [{ status: 'new', note: 'Order request received', at: new Date() }],
  });

  const json = order.toJSON();
  emitAdmin('order:new', json);
  await pushNotification({
    type: 'new_order',
    title: order.hasPrescriptionItems ? 'New prescription order' : 'New order request',
    message: `${order.orderNumber} from ${order.customer.name} (${items.length} item${items.length > 1 ? 's' : ''})`,
    orderId: order._id,
  });
  notifyShop(order, settings).catch((err) => logger.warn('Order notification failed', err.message));
  notifyCustomer(order, settings).catch((err) => logger.warn('Customer confirmation email failed', err.message));

  res.status(201).json({ success: true, data: json });
});

/** Email the customer their order number and how to track it, when they gave an address. */
async function notifyCustomer(order, settings) {
  const to = order.customer.email;
  if (!to) return;
  const store = settings.storeName || 'Di-Grow';
  const lines = order.items.map((i) => `- ${i.quantity} x ${i.name} (RWF ${i.price * i.quantity})`).join('\n');
  const trackUrl = `${env.frontendUrl}/track-order`;
  const place = order.customer.address || order.customer.district ? `${order.customer.address}${order.customer.sector ? `, ${order.customer.sector}` : ''}${order.customer.district ? `, ${order.customer.district}` : ''}` : 'to be agreed with you on WhatsApp';
  await sendMail({
    to,
    subject: `${store} order ${order.orderNumber} received`,
    text: `Hello ${order.customer.name},\n\nThank you, we received your order request ${order.orderNumber}.\n\nItems:\n${lines}\n\nSubtotal: RWF ${order.subtotal}\nDelivery: RWF ${order.deliveryFee}\nTotal on delivery: RWF ${order.total}\nDelivery place: ${place}\n\nWe confirm every order before dispatch. Track it any time at ${trackUrl} with your order number and phone number.\n\n${store}`,
    html: `<p>Hello ${order.customer.name},</p><p>Thank you, we received your order request <strong>${order.orderNumber}</strong>.</p><ul>${order.items.map((i) => `<li>${i.quantity} x ${i.name} (RWF ${i.price * i.quantity})</li>`).join('')}</ul><p>Subtotal: RWF ${order.subtotal}<br/>Delivery: RWF ${order.deliveryFee}<br/><strong>Total on delivery: RWF ${order.total}</strong><br/>Delivery place: ${place}</p><p>We confirm every order before dispatch. <a href="${trackUrl}">Track it any time</a> with your order number and phone number.</p><p>${store}</p>`,
  });
}

/** Email the shop about a new order when enabled in settings (SMS has no provider yet, so it is logged). */
async function notifyShop(order, settings) {
  const lines = order.items.map((i) => `- ${i.quantity} x ${i.name} (RWF ${i.price * i.quantity})`).join('\n');
  const text = `New order ${order.orderNumber}\n\nCustomer: ${order.customer.name}\nPhone: ${order.customer.phone}\nDistrict: ${order.customer.district} / ${order.customer.sector}\nAddress: ${order.customer.address}\nNotes: ${order.customer.notes || '-'}\n\nItems:\n${lines}\n\nSubtotal: RWF ${order.subtotal}\nDelivery: RWF ${order.deliveryFee}\nTotal: RWF ${order.total}${order.hasPrescriptionItems ? '\n\nThis order contains prescription items.' : ''}`;
  if (settings.notifyEmail && settings.notifyEmailRecipients) {
    await sendMail({
      to: settings.notifyEmailRecipients.split(',').map((s) => s.trim()),
      subject: `New order ${order.orderNumber} from ${order.customer.name}`,
      text,
    });
  }
  if (settings.notifySms && settings.notifySmsRecipients) {
    logger.info(`[sms:console] To ${settings.notifySmsRecipients}: New order ${order.orderNumber} from ${order.customer.name}, RWF ${order.total}`);
  }
}

export const track = asyncHandler(async (req, res) => {
  const { orderNumber, phone } = req.query;
  const order = await Order.findOne({ orderNumber: new RegExp(`^${escapeRegex(orderNumber)}$`, 'i') });
  if (!order || last9(order.customer.phone) !== last9(phone)) {
    throw ApiError.notFound('No order matches that order number and phone number.');
  }
  res.json({ success: true, data: order });
});

export const getByToken = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ trackingToken: req.params.token });
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ success: true, data: order });
});

/* ------------------------------ Admin ------------------------------ */
export const listAdmin = asyncHandler(async (req, res) => {
  const { status, q, from, to } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ orderNumber: rx }, { 'customer.name': rx }, { 'customer.phone': rx }];
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = endOfDay(to);
  }
  const { page, limit, skip } = pageParams(req.query, 10, 100);
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: meta(page, limit, total) });
});

export const getAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ success: true, data: order });
});

/**
 * Stock is reserved when an order is confirmed and released if it is cancelled
 * afterwards, so the shop's "call to confirm" step stays the source of truth.
 */
async function applyStock(order, nextStatus) {
  const reserve = nextStatus === 'confirmed' || nextStatus === 'delivered';
  if (reserve && !order.stockReserved) {
    for (const item of order.items) {
      const p = await Product.findByIdAndUpdate(item.product, [{ $set: { stockQty: { $max: [0, { $subtract: ['$stockQty', item.quantity] }] } } }], { new: true });
      if (!p) continue;
      p.inStock = p.stockQty > 0;
      if (p.stockQty <= LOW_STOCK && !p.lowStockNotifiedAt) {
        p.lowStockNotifiedAt = new Date();
        await pushNotification({
          type: 'low_stock',
          title: p.stockQty === 0 ? 'Out of stock' : 'Low stock',
          message: p.stockQty === 0 ? `${p.name} is out of stock` : `${p.name} has only ${p.stockQty} left`,
        });
      }
      await p.save();
    }
    order.stockReserved = true;
  } else if (nextStatus === 'cancelled' && order.stockReserved) {
    for (const item of order.items) {
      const p = await Product.findByIdAndUpdate(item.product, { $inc: { stockQty: item.quantity } }, { new: true });
      if (p) {
        p.inStock = p.stockQty > 0;
        if (p.stockQty > LOW_STOCK) p.lowStockNotifiedAt = null;
        await p.save();
      }
    }
    order.stockReserved = false;
  }
}

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  const { status, note } = req.body;
  if (order.status === 'delivered' && status !== 'delivered') throw ApiError.badRequest('A delivered order cannot change status');
  const prev = order.status;
  await applyStock(order, status);
  order.status = status;
  order.statusHistory.push({ status, note: note || '', at: new Date(), by: req.user.name });
  order.staleNotifiedAt = null;
  await order.save();
  AuditLog.record(req.user, 'order.status', order.orderNumber, `${prev} -> ${status}${note ? ` (${note})` : ''}`);
  emitAdmin('order:updated', order.toJSON());
  res.json({ success: true, data: order });
});

export const updateNotes = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  order.adminNotes = req.body.adminNotes;
  await order.save();
  AuditLog.record(req.user, 'order.notes', order.orderNumber, 'admin notes updated');
  res.json({ success: true, data: order });
});
