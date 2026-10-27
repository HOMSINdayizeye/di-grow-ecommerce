/**
 * In-memory mock data used when VITE_USE_MOCK=true.
 * Shapes mirror the backend models so swapping to the real API is seamless.
 */
const img = (seed, w = 900, h = 900) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const daysAgo = (n, h = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

export const categories = [
  { _id: 'c1', name: 'Health Supplements', slug: 'health-supplements', description: 'Vitamins, minerals and daily wellness support.', icon: 'Pill', image: img('cat-supplements', 800, 600), productCount: 0, isActive: true },
  { _id: 'c2', name: 'Organic Fertilizers', slug: 'organic-fertilizers', description: 'Foliar and soil nutrition for thriving crops.', icon: 'Sprout', image: img('cat-fertilizer', 800, 600), productCount: 0, isActive: true },
  { _id: 'c3', name: 'Personal Care', slug: 'personal-care', description: 'Skin, hair and body care essentials.', icon: 'Sparkles', image: img('cat-care', 800, 600), productCount: 0, isActive: true },
  { _id: 'c4', name: 'Mother & Baby', slug: 'mother-baby', description: 'Trusted products for mothers and little ones.', icon: 'Baby', image: img('cat-baby', 800, 600), productCount: 0, isActive: true },
  { _id: 'c5', name: 'Prescription Medicines', slug: 'prescription-medicines', description: 'Dispensed after a valid prescription is verified.', icon: 'Stethoscope', image: img('cat-rx', 800, 600), productCount: 0, isActive: true },
  { _id: 'c6', name: 'Farm Inputs', slug: 'farm-inputs', description: 'Seeds, tools and crop protection for your farm.', icon: 'Tractor', image: img('cat-farm', 800, 600), productCount: 0, isActive: true },
  { _id: 'c7', name: 'Herbal & Nutrition', slug: 'herbal-nutrition', description: 'Teas, superfoods and natural nutrition.', icon: 'Leaf', image: img('cat-herbal', 800, 600), productCount: 0, isActive: true },
  { _id: 'c8', name: 'Medical Devices', slug: 'medical-devices', description: 'Monitors, thermometers and home-care devices.', icon: 'HeartPulse', image: img('cat-devices', 800, 600), productCount: 0, isActive: true },
];

const cat = (id) => {
  const c = categories.find((x) => x._id === id);
  return { _id: c._id, name: c.name, slug: c.slug };
};

const P = (o) => ({
  rating: 4.6,
  reviewCount: 12,
  inStock: true,
  stockQty: 40,
  requiresPrescription: false,
  isFeatured: false,
  tags: [],
  compareAtPrice: null,
  createdAt: daysAgo(30),
  updatedAt: daysAgo(2),
  ...o,
  images: o.images || [img(o.slug), img(`${o.slug}-2`), img(`${o.slug}-3`)],
});

export const products = [
  P({ _id: 'p1', name: 'Multivitamin Complete (60 tablets)', slug: 'multivitamin-complete-60', sku: 'DG-SUP-001', brand: 'VitaCore', price: 18500, compareAtPrice: 22000, category: cat('c1'), shortDescription: 'Daily multivitamin with 23 essential nutrients for energy and immunity.', description: 'A complete daily multivitamin formulated with 23 essential vitamins and minerals including Vitamin C, D3, B-complex, Zinc and Iron. Supports immune health, energy metabolism and overall vitality. Take one tablet daily with food.', isFeatured: true, tags: ['immunity', 'energy', 'daily'], rating: 4.8, reviewCount: 64, stockQty: 120 }),
  P({ _id: 'p2', name: 'Vitamin C 1000mg Effervescent', slug: 'vitamin-c-1000-effervescent', sku: 'DG-SUP-002', brand: 'VitaCore', price: 9500, category: cat('c1'), shortDescription: 'Orange-flavoured effervescent tablets, 20 per tube.', description: 'High-strength Vitamin C in a refreshing orange effervescent tablet. Supports the immune system and helps reduce tiredness and fatigue. Dissolve one tablet in a glass of water daily.', tags: ['immunity'], rating: 4.5, reviewCount: 41 }),
  P({ _id: 'p3', name: 'Omega-3 Fish Oil 1000mg (90 softgels)', slug: 'omega-3-fish-oil-90', sku: 'DG-SUP-003', brand: 'PureSea', price: 27000, category: cat('c1'), shortDescription: 'Heart and brain support with EPA and DHA.', description: 'Molecularly distilled fish oil providing 180mg EPA and 120mg DHA per softgel. Supports cardiovascular health, cognitive function and joint comfort.', isFeatured: true, tags: ['heart', 'brain'], rating: 4.7, reviewCount: 29 }),
  P({ _id: 'p4', name: 'Organic Foliar Fertilizer 1L', slug: 'organic-foliar-fertilizer-1l', sku: 'DG-FER-001', brand: 'GrowMax', price: 12000, category: cat('c2'), shortDescription: 'Liquid organic foliar feed for vegetables, fruits and flowers.', description: 'A balanced organic foliar fertilizer rich in macro and micro nutrients, amino acids and natural growth promoters. Improves leaf colour, flowering and yield. Dilute 2ml per litre of water and spray every 7 to 10 days.', isFeatured: true, tags: ['organic', 'foliar', 'yield'], rating: 4.9, reviewCount: 88, stockQty: 200 }),
  P({ _id: 'p5', name: 'Organic Foliar Fertilizer 5L', slug: 'organic-foliar-fertilizer-5l', sku: 'DG-FER-002', brand: 'GrowMax', price: 52000, compareAtPrice: 60000, category: cat('c2'), shortDescription: 'Bulk pack for commercial growers.', description: 'The same trusted foliar formula in a 5 litre jerrycan, ideal for larger plots and cooperatives. Covers up to 2.5 hectares per application.', tags: ['organic', 'bulk'], rating: 4.8, reviewCount: 33 }),
  P({ _id: 'p6', name: 'Soil Conditioner & Compost Booster 2kg', slug: 'soil-conditioner-2kg', sku: 'DG-FER-003', brand: 'GrowMax', price: 15500, category: cat('c2'), shortDescription: 'Restores soil structure and microbial life.', description: 'Granular soil conditioner with beneficial microbes and organic matter. Improves water retention and nutrient availability in tired soils.', tags: ['organic', 'soil'], rating: 4.6, reviewCount: 17 }),
  P({ _id: 'p7', name: 'Shea Butter Body Lotion 400ml', slug: 'shea-butter-body-lotion-400', sku: 'DG-CARE-001', brand: 'Nuru', price: 8500, category: cat('c3'), shortDescription: 'Deep moisture with natural shea and vitamin E.', description: 'A rich, fast-absorbing lotion made with unrefined shea butter and vitamin E. Leaves skin soft and nourished for 24 hours. Suitable for all skin types.', tags: ['skin'], rating: 4.4, reviewCount: 52 }),
  P({ _id: 'p8', name: 'Aloe Vera Soothing Gel 200ml', slug: 'aloe-vera-soothing-gel-200', sku: 'DG-CARE-002', brand: 'Nuru', price: 6500, category: cat('c3'), shortDescription: '99% pure aloe for sunburn, irritation and hydration.', description: 'Cooling aloe vera gel to calm irritated skin, soothe sunburn and hydrate without a greasy feel. Can be used on face, body and scalp.', tags: ['skin', 'natural'], rating: 4.7, reviewCount: 73, isFeatured: true }),
  P({ _id: 'p9', name: 'Herbal Hair Growth Oil 100ml', slug: 'herbal-hair-growth-oil-100', sku: 'DG-CARE-003', brand: 'Nuru', price: 11000, category: cat('c3'), shortDescription: 'Castor, rosemary and black seed oil blend.', description: 'A nourishing blend of cold-pressed castor oil, rosemary extract and black seed oil to strengthen roots and reduce breakage. Massage into scalp 3 times a week.', tags: ['hair'], rating: 4.5, reviewCount: 38 }),
  P({ _id: 'p10', name: 'Prenatal Vitamins with Folic Acid (30)', slug: 'prenatal-vitamins-folic-acid-30', sku: 'DG-MB-001', brand: 'VitaCore', price: 16500, category: cat('c4'), shortDescription: 'Complete prenatal support for mother and baby.', description: 'Formulated with 400mcg folic acid, iron, iodine, DHA and vitamin D to support a healthy pregnancy. One tablet daily, preferably with a meal.', tags: ['pregnancy'], rating: 4.9, reviewCount: 45, isFeatured: true }),
  P({ _id: 'p11', name: 'Baby Diaper Rash Cream 100g', slug: 'baby-diaper-rash-cream-100', sku: 'DG-MB-002', brand: 'TinyCare', price: 7000, category: cat('c4'), shortDescription: 'Zinc oxide barrier cream, fragrance-free.', description: 'Gentle zinc oxide cream that forms a protective barrier against moisture and soothes diaper rash. Paediatrician recommended and free from fragrance and parabens.', tags: ['baby'], rating: 4.6, reviewCount: 27 }),
  P({ _id: 'p12', name: 'Infant Oral Rehydration Salts (10 sachets)', slug: 'infant-ors-10', sku: 'DG-MB-003', brand: 'TinyCare', price: 4500, category: cat('c4'), shortDescription: 'WHO-formula ORS for children and adults.', description: 'Low-osmolarity oral rehydration salts for the management of dehydration caused by diarrhoea. Dissolve one sachet in 500ml of clean water.', tags: ['baby', 'hydration'], rating: 4.8, reviewCount: 19 }),
  P({ _id: 'p13', name: 'Amoxicillin 500mg Capsules (21)', slug: 'amoxicillin-500-21', sku: 'DG-RX-001', brand: 'Generic', price: 6000, category: cat('c5'), requiresPrescription: true, shortDescription: 'Broad-spectrum antibiotic. Prescription required.', description: 'Amoxicillin is a penicillin-class antibiotic used to treat a range of bacterial infections. This product is dispensed only after our pharmacist verifies a valid prescription. Please have your prescription ready when we call to confirm your order.', tags: ['antibiotic'], rating: 4.7, reviewCount: 8, stockQty: 60 }),
  P({ _id: 'p14', name: 'Metformin 500mg Tablets (60)', slug: 'metformin-500-60', sku: 'DG-RX-002', brand: 'Generic', price: 7500, category: cat('c5'), requiresPrescription: true, shortDescription: 'For type 2 diabetes management. Prescription required.', description: 'Metformin helps control blood sugar levels in people with type 2 diabetes. Dispensed only after prescription verification by our pharmacist.', tags: ['diabetes'], rating: 4.8, reviewCount: 11 }),
  P({ _id: 'p15', name: 'Amlodipine 5mg Tablets (30)', slug: 'amlodipine-5-30', sku: 'DG-RX-003', brand: 'Generic', price: 5500, category: cat('c5'), requiresPrescription: true, shortDescription: 'Blood pressure medication. Prescription required.', description: 'Amlodipine is a calcium channel blocker used to treat high blood pressure and angina. A valid prescription is required before dispensing.', tags: ['blood pressure'], rating: 4.6, reviewCount: 6, stockQty: 0, inStock: false }),
  P({ _id: 'p16', name: 'Hybrid Maize Seed 2kg', slug: 'hybrid-maize-seed-2kg', sku: 'DG-FARM-001', brand: 'AgriSeed', price: 9800, category: cat('c6'), shortDescription: 'High-yield, drought-tolerant hybrid variety.', description: 'Certified hybrid maize seed selected for Rwandan highland and mid-altitude conditions. Matures in 120 to 130 days with excellent cob fill and disease tolerance.', tags: ['seeds'], rating: 4.7, reviewCount: 24, isFeatured: true }),
  P({ _id: 'p17', name: 'Knapsack Sprayer 16L', slug: 'knapsack-sprayer-16l', sku: 'DG-FARM-002', brand: 'FarmPro', price: 38000, compareAtPrice: 45000, category: cat('c6'), shortDescription: 'Durable manual sprayer with adjustable nozzle.', description: 'A 16 litre manual knapsack sprayer with padded straps, brass lance and adjustable nozzle. Ideal for foliar fertilizer and crop protection applications.', tags: ['tools'], rating: 4.5, reviewCount: 15 }),
  P({ _id: 'p18', name: 'Tomato Seeds Hybrid F1 (10g)', slug: 'tomato-seeds-f1-10g', sku: 'DG-FARM-003', brand: 'AgriSeed', price: 14000, category: cat('c6'), shortDescription: 'Determinate variety, firm fruits, long shelf life.', description: 'Premium F1 hybrid tomato seed producing firm, uniform fruits with excellent transport and shelf life. Suitable for open field and greenhouse production.', tags: ['seeds', 'vegetables'], rating: 4.8, reviewCount: 21 }),
  P({ _id: 'p19', name: 'Moringa Leaf Powder 250g', slug: 'moringa-leaf-powder-250', sku: 'DG-HERB-001', brand: 'Terra', price: 8000, category: cat('c7'), shortDescription: 'Nutrient-dense superfood, locally sourced.', description: 'Pure dried moringa leaf powder packed with vitamins A, C and E, calcium, potassium and protein. Add a teaspoon to smoothies, porridge or tea.', tags: ['superfood', 'natural'], rating: 4.7, reviewCount: 36, isFeatured: true }),
  P({ _id: 'p20', name: 'Ginger & Lemongrass Herbal Tea (25 bags)', slug: 'ginger-lemongrass-tea-25', sku: 'DG-HERB-002', brand: 'Terra', price: 5500, category: cat('c7'), shortDescription: 'Warming, caffeine-free blend for digestion.', description: 'A soothing blend of Rwandan ginger and lemongrass. Supports digestion and is naturally caffeine free. Steep for 5 minutes in freshly boiled water.', tags: ['tea'], rating: 4.6, reviewCount: 48 }),
  P({ _id: 'p21', name: 'Spirulina Tablets 500mg (120)', slug: 'spirulina-tablets-120', sku: 'DG-HERB-003', brand: 'Terra', price: 19500, category: cat('c7'), shortDescription: 'Plant protein and antioxidants in one tablet.', description: 'Organic spirulina pressed into easy tablets. A complete source of plant protein, iron and antioxidants to support energy and immunity.', tags: ['superfood', 'energy'], rating: 4.5, reviewCount: 14 }),
  P({ _id: 'p22', name: 'Digital Blood Pressure Monitor', slug: 'digital-blood-pressure-monitor', sku: 'DG-DEV-001', brand: 'MediSense', price: 45000, compareAtPrice: 55000, category: cat('c8'), shortDescription: 'Upper-arm monitor with irregular heartbeat detection.', description: 'Clinically validated automatic upper-arm blood pressure monitor with large backlit display, 2 user memory (120 readings) and irregular heartbeat detection. Includes cuff and batteries.', tags: ['monitor'], rating: 4.8, reviewCount: 57, isFeatured: true }),
  P({ _id: 'p23', name: 'Infrared Forehead Thermometer', slug: 'infrared-forehead-thermometer', sku: 'DG-DEV-002', brand: 'MediSense', price: 22000, category: cat('c8'), shortDescription: 'Non-contact reading in 1 second.', description: 'Fast, hygienic non-contact thermometer with fever alarm and memory for 32 readings. Suitable for babies, children and adults.', tags: ['thermometer'], rating: 4.6, reviewCount: 39 }),
  P({ _id: 'p24', name: 'Blood Glucose Meter Kit', slug: 'blood-glucose-meter-kit', sku: 'DG-DEV-003', brand: 'MediSense', price: 32000, category: cat('c8'), shortDescription: 'Meter, lancing device, 10 strips and 10 lancets.', description: 'A complete starter kit for home glucose monitoring. Results in 5 seconds with a tiny 0.5µL sample. Stores 500 readings with 7, 14 and 30 day averages.', tags: ['diabetes', 'monitor'], rating: 4.7, reviewCount: 26 }),
];

categories.forEach((c) => {
  c.productCount = products.filter((p) => p.category._id === c._id).length;
});

export const blogPosts = [
  {
    _id: 'b1',
    title: '5 Daily Habits That Strengthen Your Immune System',
    slug: '5-daily-habits-immune-system',
    excerpt: 'Small, consistent choices make the biggest difference to your immunity. Here are five habits our pharmacists recommend.',
    coverImage: img('blog-immunity', 1200, 700),
    category: 'Wellness',
    tags: ['immunity', 'lifestyle'],
    author: { name: 'Dr. Aline Uwase', role: 'Pharmacist' },
    readTime: 5,
    isPublished: true,
    publishedAt: daysAgo(3),
    createdAt: daysAgo(4),
    content: `<p>Your immune system is shaped every day by what you eat, how you sleep and how you move. The good news is that the most powerful changes are also the simplest.</p>
<h2>1. Sleep seven to eight hours</h2>
<p>During deep sleep your body produces cytokines, proteins that help fight infection. Consistently sleeping fewer than six hours has been shown to make people far more likely to catch a cold.</p>
<h2>2. Eat the rainbow</h2>
<p>Colourful fruits and vegetables supply vitamin C, beta-carotene and polyphenols. Aim for at least five portions a day, and lean on local favourites like passion fruit, tree tomato and amaranth.</p>
<h2>3. Move every day</h2>
<p>Thirty minutes of brisk walking improves circulation and helps immune cells move through the body more efficiently.</p>
<h2>4. Mind your vitamin D</h2>
<p>Even in sunny Kigali, people who work indoors are frequently low in vitamin D. A simple supplement can close the gap.</p>
<h2>5. Manage stress</h2>
<p>Chronic stress raises cortisol, which suppresses immune function. Prayer, meditation or simply time with friends all help.</p>
<blockquote>Consistency beats intensity. Pick one habit this week and build from there.</blockquote>`,
  },
  {
    _id: 'b2',
    title: 'How to Use Foliar Fertilizer for Maximum Yield',
    slug: 'how-to-use-foliar-fertilizer',
    excerpt: 'Foliar feeding delivers nutrients straight through the leaves. Learn the right timing, dilution and technique for vegetables and fruit trees.',
    coverImage: img('blog-foliar', 1200, 700),
    category: 'Farming',
    tags: ['fertilizer', 'farming'],
    author: { name: 'Jean Bosco Habimana', role: 'Agronomist' },
    readTime: 7,
    isPublished: true,
    publishedAt: daysAgo(9),
    createdAt: daysAgo(10),
    content: `<p>Foliar fertilizer is absorbed through the stomata on the leaf surface, which means plants can use the nutrients within hours instead of days.</p>
<h2>When to spray</h2>
<p>Spray early in the morning or late afternoon when stomata are open and temperatures are cool. Avoid spraying before rain or in strong sun.</p>
<h2>Dilution</h2>
<p>For most vegetables, dilute 2ml of concentrate per litre of water. For fruit trees and heavy feeders such as maize and bananas, use 3ml per litre.</p>
<h2>Technique</h2>
<ul><li>Use a fine mist nozzle so droplets coat the leaf without running off.</li><li>Cover the underside of leaves, where most stomata are found.</li><li>Repeat every 7 to 10 days during active growth.</li></ul>
<h2>Expected results</h2>
<p>Farmers who follow this schedule typically see deeper leaf colour within a week and a 20 to 35 percent increase in marketable yield at harvest.</p>`,
  },
  {
    _id: 'b3',
    title: 'Understanding Prescription Medicines: What to Expect When You Order',
    slug: 'prescription-medicines-what-to-expect',
    excerpt: 'Ordering a prescription medicine online in Rwanda is simple when you know the steps. Here is how our pharmacist-verified process works.',
    coverImage: img('blog-rx', 1200, 700),
    category: 'Pharmacy',
    tags: ['prescription', 'safety'],
    author: { name: 'Dr. Aline Uwase', role: 'Pharmacist' },
    readTime: 4,
    isPublished: true,
    publishedAt: daysAgo(16),
    createdAt: daysAgo(17),
    content: `<p>Products marked with a prescription badge can only be dispensed after a licensed pharmacist has reviewed a valid prescription. This protects you and is required by law.</p>
<h2>Step 1: Add the product to your cart</h2>
<p>You can place the order request as normal. Nothing is charged online.</p>
<h2>Step 2: We call you</h2>
<p>A member of our team calls within a few hours. For prescription items, we will ask you to send a clear photo of the prescription via WhatsApp.</p>
<h2>Step 3: Pharmacist review</h2>
<p>Our pharmacist checks the prescription, dosage and any interactions with other medicines you are taking.</p>
<h2>Step 4: Delivery</h2>
<p>Once confirmed, your medicines are delivered discreetly to your door, usually the same day within Kigali.</p>`,
  },
  {
    _id: 'b4',
    title: 'Caring for a Newborn: A Kigali Parent\'s Essentials Checklist',
    slug: 'newborn-essentials-checklist',
    excerpt: 'From rash creams to rehydration salts, these are the items experienced parents and paediatric nurses keep within reach.',
    coverImage: img('blog-baby', 1200, 700),
    category: 'Mother & Baby',
    tags: ['baby', 'checklist'],
    author: { name: 'Nurse Claudine Mukamana', role: 'Paediatric Nurse' },
    readTime: 6,
    isPublished: true,
    publishedAt: daysAgo(24),
    createdAt: daysAgo(25),
    content: `<p>The first weeks with a newborn are joyful and exhausting. Having the right essentials on hand means fewer late-night pharmacy runs.</p>
<h2>Skin care</h2>
<p>A fragrance-free barrier cream prevents and treats diaper rash. Apply a thin layer at every change.</p>
<h2>Hydration</h2>
<p>Keep oral rehydration salts at home. Diarrhoea can dehydrate a baby quickly, and ORS is the first line of care recommended by paediatricians.</p>
<h2>Temperature</h2>
<p>A reliable thermometer takes the guesswork out of fever. Non-contact infrared models are quick and will not wake a sleeping baby.</p>
<h2>For mum</h2>
<p>Continue prenatal vitamins while breastfeeding and keep a bottle of water within arm's reach at every feed.</p>`,
  },
  {
    _id: 'b5',
    title: 'Managing High Blood Pressure at Home',
    slug: 'managing-high-blood-pressure-at-home',
    excerpt: 'Hypertension often has no symptoms. A home monitor and a few lifestyle shifts can keep it under control.',
    coverImage: img('blog-bp', 1200, 700),
    category: 'Wellness',
    tags: ['blood pressure', 'devices'],
    author: { name: 'Dr. Aline Uwase', role: 'Pharmacist' },
    readTime: 5,
    isPublished: false,
    publishedAt: null,
    createdAt: daysAgo(1),
    content: `<p>Draft in progress.</p>`,
  },
];

export const siteSettings = {
  storeName: 'Di-Grow',
  tagline: 'Health, wellness and growth products delivered in Kigali',
  phone: '+250 790 911 427',
  whatsapp: '250790911427',
  email: 'hello@digrow.rw',
  address: 'KN 4 Ave, Nyarugenge, Kigali',
  openingHours: 'Mon - Sat, 8:00 AM - 7:00 PM',
  deliveryFee: 1500,
  freeDeliveryThreshold: 50000,
  deliveryNote: 'Same-day delivery within Kigali for orders confirmed before 3:00 PM.',
  announcement: 'Free delivery on orders above RWF 50,000 within Kigali.',
  announcementEnabled: true,
  notifyEmail: true,
  notifySms: true,
  notifyEmailRecipients: 'orders@digrow.rw',
  notifySmsRecipients: '+250790911427',
  socialFacebook: 'https://facebook.com',
  socialInstagram: 'https://instagram.com',
  socialTwitter: 'https://x.com',
  seoTitle: 'Di-Grow | Health, Wellness and Growth Products in Kigali',
  seoDescription: 'Order trusted health, wellness and agricultural growth products in Kigali. Request an order online, we call to confirm, and deliver to your door.',
};

export const adminUsers = [
  { _id: 'u1', name: 'Admin User', email: 'admin@digrow.rw', role: 'admin', isActive: true, lastLoginAt: daysAgo(0, 8), createdAt: daysAgo(120) },
  { _id: 'u2', name: 'Grace Ingabire', email: 'grace@digrow.rw', role: 'staff', isActive: true, lastLoginAt: daysAgo(1, 10), createdAt: daysAgo(60) },
  { _id: 'u3', name: 'Eric Nshimiyimana', email: 'eric@digrow.rw', role: 'staff', isActive: false, lastLoginAt: daysAgo(20), createdAt: daysAgo(90) },
];

// Demo credentials for the mock login: admin@digrow.rw / admin123
export const MOCK_ADMIN_PASSWORD = 'admin123';

const item = (p, quantity) => ({
  product: p._id,
  name: p.name,
  slug: p.slug,
  price: p.price,
  quantity,
  image: p.images[0],
  requiresPrescription: p.requiresPrescription,
});

const makeOrder = (n, custom) => {
  const items = custom.items;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= siteSettings.freeDeliveryThreshold ? 0 : siteSettings.deliveryFee;
  const created = custom.createdAt;
  const history = [{ status: 'new', note: 'Order request received', at: created }];
  const flow = ['contacted', 'confirmed', 'delivered'];
  const idx = flow.indexOf(custom.status);
  for (let i = 0; i <= idx; i++) {
    const d = new Date(created);
    d.setHours(d.getHours() + (i + 1) * 3);
    history.push({ status: flow[i], note: '', at: d.toISOString() });
  }
  if (custom.status === 'cancelled') {
    const d = new Date(created);
    d.setHours(d.getHours() + 5);
    history.push({ status: 'cancelled', note: 'Customer unreachable after 3 attempts', at: d.toISOString() });
  }
  const dt = new Date(created);
  const ymd = dt.toISOString().slice(0, 10).replace(/-/g, '');
  return {
    _id: `o${n}`,
    orderNumber: `DG-${ymd}-${String(1000 + n)}`,
    trackingToken: `tok_${n}_${Math.random().toString(36).slice(2, 8)}`,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    hasPrescriptionItems: items.some((i) => i.requiresPrescription),
    statusHistory: history,
    adminNotes: '',
    updatedAt: history[history.length - 1].at,
    ...custom,
  };
};

const byId = (id) => products.find((p) => p._id === id);

export const orders = [
  makeOrder(1, { status: 'new', createdAt: daysAgo(0, 7), customer: { name: 'Aimable Niyonzima', phone: '+250788123456', email: 'aimable@example.com', district: 'Gasabo', sector: 'Kimironko', address: 'KG 11 Ave, near the market', notes: 'Please call before delivery.' }, items: [item(byId('p1'), 1), item(byId('p8'), 2)] }),
  makeOrder(2, { status: 'new', createdAt: daysAgo(0, 6), customer: { name: 'Josiane Mukamana', phone: '+250722987654', email: '', district: 'Kicukiro', sector: 'Kanombe', address: 'Opposite Kanombe hospital gate', notes: '' }, items: [item(byId('p13'), 1), item(byId('p12'), 2)] }),
  makeOrder(3, { status: 'contacted', createdAt: daysAgo(1, 14), customer: { name: 'Patrick Mugisha', phone: '+250733456789', email: 'patrick.m@example.com', district: 'Nyarugenge', sector: 'Nyamirambo', address: 'KN 2 St, House 14', notes: '' }, items: [item(byId('p4'), 3), item(byId('p17'), 1)] }),
  makeOrder(4, { status: 'confirmed', createdAt: daysAgo(1, 9), customer: { name: 'Diane Uwimana', phone: '+250788765432', email: 'diane@example.com', district: 'Gasabo', sector: 'Remera', address: 'KG 5 Ave, Remera Taxi Park side', notes: 'Deliver after 5pm' }, items: [item(byId('p22'), 1)] }),
  makeOrder(5, { status: 'delivered', createdAt: daysAgo(2, 11), customer: { name: 'Emmanuel Hakizimana', phone: '+250780111222', email: '', district: 'Kicukiro', sector: 'Gikondo', address: 'KK 15 Rd', notes: '' }, items: [item(byId('p10'), 2), item(byId('p11'), 1)] }),
  makeOrder(6, { status: 'delivered', createdAt: daysAgo(3, 10), customer: { name: 'Solange Ishimwe', phone: '+250728333444', email: 'solange@example.com', district: 'Gasabo', sector: 'Kacyiru', address: 'KG 7 Ave', notes: '' }, items: [item(byId('p19'), 2), item(byId('p20'), 3), item(byId('p2'), 1)] }),
  makeOrder(7, { status: 'cancelled', createdAt: daysAgo(4, 15), customer: { name: 'Yves Rukundo', phone: '+250788555666', email: '', district: 'Nyarugenge', sector: 'Muhima', address: 'Near Muhima hospital', notes: '' }, items: [item(byId('p16'), 5)] }),
  makeOrder(8, { status: 'delivered', createdAt: daysAgo(5, 9), customer: { name: 'Clarisse Umutoni', phone: '+250722777888', email: 'clarisse@example.com', district: 'Kicukiro', sector: 'Niboye', address: 'KK 3 Ave', notes: '' }, items: [item(byId('p5'), 2)] }),
  makeOrder(9, { status: 'delivered', createdAt: daysAgo(6, 12), customer: { name: 'Olivier Ndayisaba', phone: '+250733999000', email: '', district: 'Gasabo', sector: 'Kinyinya', address: 'KG 33 Ave', notes: '' }, items: [item(byId('p3'), 1), item(byId('p24'), 1)] }),
  makeOrder(10, { status: 'delivered', createdAt: daysAgo(8, 10), customer: { name: 'Beatrice Nyirahabimana', phone: '+250788222333', email: 'bea@example.com', district: 'Nyarugenge', sector: 'Kimisagara', address: 'KN 20 Ave', notes: '' }, items: [item(byId('p7'), 2), item(byId('p9'), 1)] }),
  makeOrder(11, { status: 'delivered', createdAt: daysAgo(12, 10), customer: { name: 'Fabrice Twagirayezu', phone: '+250780444555', email: '', district: 'Kicukiro', sector: 'Gahanga', address: 'KK 700 St', notes: '' }, items: [item(byId('p4'), 6), item(byId('p18'), 2)] }),
  makeOrder(12, { status: 'delivered', createdAt: daysAgo(18, 10), customer: { name: 'Alice Mutesi', phone: '+250722666777', email: 'alice@example.com', district: 'Gasabo', sector: 'Gisozi', address: 'KG 180 St', notes: '' }, items: [item(byId('p23'), 1), item(byId('p1'), 2)] }),
];

export const notifications = [
  { _id: 'n1', type: 'new_order', title: 'New order request', message: 'DG order from Aimable Niyonzima (2 items)', orderId: 'o1', isRead: false, createdAt: daysAgo(0, 7) },
  { _id: 'n2', type: 'new_order', title: 'New order request', message: 'Prescription order from Josiane Mukamana', orderId: 'o2', isRead: false, createdAt: daysAgo(0, 6) },
  { _id: 'n3', type: 'low_stock', title: 'Low stock', message: 'Amlodipine 5mg Tablets (30) is out of stock', isRead: false, createdAt: daysAgo(1, 8) },
  { _id: 'n4', type: 'stale_order', title: 'Order needs attention', message: 'Order DG-… from Patrick Mugisha has been "contacted" for 20 hours', orderId: 'o3', isRead: true, createdAt: daysAgo(1, 6) },
];

export const auditLogs = [
  { _id: 'a1', actor: 'Admin User', action: 'order.status', target: 'DG order o4', detail: 'contacted -> confirmed', createdAt: daysAgo(1, 12) },
  { _id: 'a2', actor: 'Grace Ingabire', action: 'product.update', target: 'Organic Foliar Fertilizer 1L', detail: 'price 11500 -> 12000', createdAt: daysAgo(2, 10) },
  { _id: 'a3', actor: 'Admin User', action: 'settings.update', target: 'Site settings', detail: 'deliveryFee updated', createdAt: daysAgo(5, 9) },
];
