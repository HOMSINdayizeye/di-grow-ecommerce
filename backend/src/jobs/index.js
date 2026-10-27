import { Order, Product } from '../models/index.js';
import { pushNotification } from '../lib/notify.js';
import { logger } from '../lib/logger.js';

const STALE_HOURS = 12;
const LOW_STOCK = 5;
let timer = null;

/** Flag orders that have sat in "new" or "contacted" for too long, once per order. */
async function checkStaleOrders() {
  const cutoff = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000);
  const stale = await Order.find({ status: { $in: ['new', 'contacted'] }, updatedAt: { $lte: cutoff }, staleNotifiedAt: null }).limit(50);
  for (const order of stale) {
    const hours = Math.round((Date.now() - order.updatedAt.getTime()) / 3600000);
    await pushNotification({
      type: 'stale_order',
      title: 'Order needs attention',
      message: `Order ${order.orderNumber} from ${order.customer.name} has been "${order.status}" for ${hours} hours`,
      orderId: order._id,
    });
    order.staleNotifiedAt = new Date();
    await order.save();
  }
}

/** Catch stock that dropped via manual edits without a notification. */
async function checkLowStock() {
  const low = await Product.find({ stockQty: { $lte: LOW_STOCK }, lowStockNotifiedAt: null }).limit(50);
  for (const p of low) {
    await pushNotification({
      type: 'low_stock',
      title: p.stockQty === 0 ? 'Out of stock' : 'Low stock',
      message: p.stockQty === 0 ? `${p.name} is out of stock` : `${p.name} has only ${p.stockQty} left`,
    });
    p.lowStockNotifiedAt = new Date();
    await p.save();
  }
}

async function tick() {
  try {
    await checkStaleOrders();
    await checkLowStock();
  } catch (err) {
    logger.warn('Background job failed', err.message);
  }
}

export function startJobs() {
  if (timer) return;
  timer = setInterval(tick, 15 * 60 * 1000);
  timer.unref();
  setTimeout(tick, 10 * 1000).unref();
}

export function stopJobs() {
  if (timer) clearInterval(timer);
  timer = null;
}
