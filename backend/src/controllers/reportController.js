import { Order, Product, AuditLog } from '../models/index.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { endOfDay } from '../lib/utils.js';

const LOW_STOCK = 5;
const STATUSES = ['new', 'contacted', 'confirmed', 'delivered', 'cancelled'];
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
const sameLocalDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

function productSales(delivered) {
  const map = {};
  delivered.forEach((o) =>
    o.items.forEach((i) => {
      map[i.name] = map[i.name] || { name: i.name, qty: 0, revenue: 0 };
      map[i.name].qty += i.quantity;
      map[i.name].revenue += i.quantity * i.price;
    })
  );
  return Object.values(map);
}

/**
 * KPIs for the admin home. Orders are read once and aggregated in memory, which is
 * fine for a shop doing hundreds of orders a month; move to $group pipelines beyond that.
 */
export const dashboard = asyncHandler(async (_req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const [orders, recentOrders, products, lowStock, statusCounts, revenueAgg, totalOrders, phones] = await Promise.all([
    Order.find({ createdAt: { $gte: since } }).lean(),
    Order.find().sort({ createdAt: -1 }).limit(6),
    Product.countDocuments(),
    Product.countDocuments({ stockQty: { $lte: LOW_STOCK } }),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, revenue: { $sum: '$total' } } }]),
    Order.countDocuments(),
    Order.distinct('customer.phone'),
  ]);
  const customers = phones.length;
  const now = new Date();

  const series = [...Array(14)].map((_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const dayOrders = orders.filter((o) => sameLocalDay(o.createdAt, d));
    return {
      date: dayKey(d),
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      orders: dayOrders.length,
      revenue: dayOrders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
    };
  });
  const countBy = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));
  const delivered = orders.filter((o) => o.status === 'delivered');

  res.json({
    success: true,
    data: {
      totals: {
        ordersToday: orders.filter((o) => sameLocalDay(o.createdAt, now)).length,
        newOrders: countBy.new || 0,
        totalOrders,
        revenue: revenueAgg[0]?.revenue || 0,
        products,
        lowStock,
        customers,
      },
      series,
      byStatus: STATUSES.map((status) => ({ status, count: countBy[status] || 0 })),
      topProducts: productSales(delivered).sort((a, b) => b.qty - a.qty).slice(0, 5),
      recentOrders,
    },
  });
});

export const summary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = endOfDay(to);
  }
  const list = await Order.find(filter).sort({ createdAt: 1 }).lean();
  const delivered = list.filter((o) => o.status === 'delivered');
  const revenue = delivered.reduce((s, o) => s + o.total, 0);

  const byDay = {};
  list.forEach((o) => {
    const k = dayKey(o.createdAt);
    byDay[k] = byDay[k] || { date: k, orders: 0, revenue: 0 };
    byDay[k].orders += 1;
    if (o.status === 'delivered') byDay[k].revenue += o.total;
  });

  const productIds = [...new Set(delivered.flatMap((o) => o.items.map((i) => String(i.product))))];
  const catByProduct = new Map(
    (await Product.find({ _id: { $in: productIds } }).populate('category', 'name').select('category').lean()).map((p) => [
      String(p._id),
      p.category?.name || 'Other',
    ])
  );
  const byCategory = {};
  delivered.forEach((o) =>
    o.items.forEach((i) => {
      const name = catByProduct.get(String(i.product)) || 'Other';
      byCategory[name] = byCategory[name] || { name, revenue: 0, qty: 0 };
      byCategory[name].revenue += i.price * i.quantity;
      byCategory[name].qty += i.quantity;
    })
  );

  const byDistrict = {};
  list.forEach((o) => {
    const d = o.customer?.district || 'Unknown';
    byDistrict[d] = byDistrict[d] || { name: d, orders: 0 };
    byDistrict[d].orders += 1;
  });

  res.json({
    success: true,
    data: {
      summary: {
        orders: list.length,
        delivered: delivered.length,
        cancelled: list.filter((o) => o.status === 'cancelled').length,
        revenue,
        avgOrderValue: delivered.length ? Math.round(revenue / delivered.length) : 0,
        conversion: list.length ? Math.round((delivered.length / list.length) * 100) : 0,
      },
      byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      byCategory: Object.values(byCategory).sort((a, b) => b.revenue - a.revenue),
      byDistrict: Object.values(byDistrict).sort((a, b) => b.orders - a.orders),
      topProducts: productSales(delivered).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    },
  });
});

export const audit = asyncHandler(async (_req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, data: logs });
});
