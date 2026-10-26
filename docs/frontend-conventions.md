# Frontend conventions

Stack: Vite + React 18 + React Router 6 + Tailwind 3 + react-hook-form + zod + lucide-react + react-hot-toast + recharts.
Path alias: `@` → `frontend/src`.

## Design language

- Dark navy theme by default (`html.dark`), with a light theme toggle. Never hardcode page backgrounds; use the semantic tokens.
- Semantic Tailwind colours: `bg-bg`, `bg-surface`, `bg-surface-2`, `text-ink`, `text-muted`, `border-line`.
- Brand colours: `brand-*` (blue, 500 = #2087cb), `accent-*` (orange, 500 = #e98039), `gold-400/500`, `navy-700/800/900/950`, plus `success`, `warning`, `danger`.
- Fonts: `font-display` (serif, headings), `font-sans` (body), `font-ui` (buttons/labels).
- Headline accent: wrap one or two words in `<span className="text-gradient">`.
- Pill buttons: `btn btn-primary|btn-secondary|btn-ghost|btn-danger|btn-whatsapp` + `btn-sm|btn-md|btn-lg`. Or use `components/common/Button` (`variant`, `size`, `to`, `href`, `loading`, `icon`).
- Cards: `card` (+ `card-hover`). Glass panels: `glass`. Section spacing: `section`. Headings: `section-title`, `section-subtitle`, `eyebrow`.
- Form controls: `label`, `input`, `input-error`, `help-text`, `error-text`, or `components/common/FormField` (`as="input|select|textarea"`, `label`, `error`, `help`, spread `register()`), `Checkbox`, `Switch`.
- Decorative: `bg-grid`, `glow-brand`, `glow-accent` (use with `rounded-full blur-3xl` and `pointer-events-none`), `divider-gradient`.
- Scroll-reveal: add `reveal` to elements and wrap the page/container with `const ref = useReveal(); <div ref={ref}>`.
- Badges: `badge`. Prescription marker: `components/product/PrescriptionBadge`.

## Shared building blocks

| Need | Use |
| --- | --- |
| Page meta | `seo/SEOHead` (`title`, `description`, `image`, `type`, `noIndex`) |
| Inner page banner | `components/common/PageHero` (`eyebrow`, `title`, `highlight`, `subtitle`, `breadcrumbs=[{label,to}]`) |
| Section header | `components/common/SectionHeading` |
| Loading | `components/common/Loader` (`full`), `Skeleton`, `ProductCardSkeleton`, `TableSkeleton` |
| Empty | `components/common/EmptyState` (`icon`, `title`, `description`, `action`) |
| Pagination | `components/common/Pagination` (`page`, `totalPages`, `total`, `limit`, `onChange`) |
| Modal / confirm | `components/common/Modal`, `ConfirmModal` |
| Toasts | `import toast from 'react-hot-toast'` |
| Money / dates | `utils/formatCurrency` (RWF), `utils/formatDate` (`formatDate`, `formatDateTime`, `timeAgo`) |
| Data fetching | `hooks/useFetch(() => service.method(params), [deps])` → `{ data, meta, loading, error, refetch, setData }` |
| Products | `hooks/useProducts` (`useProducts(params)`, `useProduct(slug)`, `useFeaturedProducts`, `useCategories`) |
| Cart | `hooks/useCart` → `items, count, subtotal, hasPrescriptionItems, isEmpty, addItem(product, qty), updateQuantity, removeItem, clearCart, openCart` |
| Orders | `hooks/useOrders` (`useAdminOrders`, `useAdminOrder(id)`, `useCreateOrder`, `useTrackOrder`) |
| Settings | `hooks/useSettings` → `{ settings }` (phone, whatsapp, deliveryFee, freeDeliveryThreshold, deliveryNote, announcement…) |
| Site constants | `constants/site` (`SITE`, `whatsappLink(msg)`, `NAV_LINKS`) |
| Order status | `constants/orderStatus` (`ORDER_STATUS`, `ORDER_STATUS_META`, `ORDER_STATUS_OPTIONS`, `ORDER_STATUS_FLOW`) |
| Districts | `constants/districts` (`KIGALI_DISTRICTS`, `getSectors`) |
| Validation | `validations/*` zod schemas, with `@hookform/resolvers/zod` |
| Admin auth | `context/AdminAuthContext` → `useAdminAuth()` (`user`, `isAdmin`, `login`, `logout`) |
| Socket | `hooks/useSocket(onNewOrder)` (admin only) |

## Services (all return `{ data, meta? }`, throw axios-style errors; use `getErrorMessage(err)` from `services/api`)

- `productService`: `list(params)`, `getBySlug`, `featured`, `adminList`, `adminGet`, `create`, `update`, `remove`, `uploadImage(file)`
- `categoryService`: `list`, `getBySlug`, `adminList`, `create`, `update`, `remove`
- `orderService`: `create({customer, items:[{productId, quantity}]})`, `track({orderNumber, phone})`, `getByToken`, `adminList`, `adminGet`, `updateStatus(id, status, note)`, `updateNotes`
- `blogService`: `list`, `getBySlug`, `adminList`, `adminGet`, `create`, `update`, `remove`
- `adminAuthService`: `login`, `me`, `logout`, `forgotPassword`, `resetPassword`, `changePassword`, `listStaff`, `createStaff`, `updateStaff`, `removeStaff`
- `reportService`: `dashboard()`, `summary({from,to})`, `auditLogs()`, `toCsv(rows, columns)`, `downloadCsv(name, csv)`
- `settingsService`: `getPublic`, `get`, `update`
- `notificationService`: `list`, `markRead`, `markAllRead`

Mock mode (`VITE_USE_MOCK=true`) serves everything from `src/mocks`. Demo admin login: `admin@digrow.rw` / `admin123`.

## Data shapes (mock = backend contract)

- Product: `_id, name, slug, sku, brand, price, compareAtPrice, images[], category{_id,name,slug}, shortDescription, description, requiresPrescription, inStock, stockQty, rating, reviewCount, isFeatured, tags[], createdAt`
- Category: `_id, name, slug, description, icon (lucide name), image, productCount, isActive`
- Order: `_id, orderNumber (DG-YYYYMMDD-XXXX), trackingToken, customer{name,phone,email,district,sector,address,notes}, items[{product,name,slug,price,quantity,image,requiresPrescription}], subtotal, deliveryFee, total, hasPrescriptionItems, status, statusHistory[{status,note,at}], adminNotes, createdAt, updatedAt`
- Blog post: `_id, title, slug, excerpt, coverImage, category, tags[], author{name,role}, readTime, content (HTML), isPublished, publishedAt, createdAt`
- Admin user: `_id, name, email, role (admin|staff), isActive, lastLoginAt, createdAt`
- Notification: `_id, type (new_order|low_stock|stale_order), title, message, orderId?, isRead, createdAt`

## Rules

- Every page sets `<SEOHead>`; admin pages set `noIndex`.
- Mobile first; 16px gutters via `container`; no horizontal scroll.
- Handle `loading`, `error` and empty states on every data-driven page.
- Use `Link` for internal navigation. Never use `window.location` except for hard resets.
- Keep copy in plain English, Kigali / Rwanda context, RWF currency.
