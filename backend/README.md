# Di-Grow API

Node 22 + Express + MongoDB (Mongoose) + Socket.io. Serves everything the frontend's `services/*` call, with the same `{ success, data, meta? }` envelope the mock API uses.

## Run locally

Requires MongoDB running on `mongodb://127.0.0.1:27017` (the Windows service installed with MongoDB 8 is enough).

```bash
cp backend/.env.example backend/.env   # then set JWT_SECRET and ADMIN_PASSWORD
npm install                            # from the repo root (workspaces)
npm run seed:demo                      # catalog, settings, admin user and demo orders
npm run dev:backend                    # http://localhost:5000, restarts on file changes
```

In another terminal run `npm run dev` for the frontend with `VITE_USE_MOCK=false` in `frontend/.env`. The Vite dev server proxies `/api` and `/socket.io` to port 5000.

Sign in at `/admin/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env` (default `admin@digrow.rw` / `admin123`). From **Admin → Staff** you can add more administrators or staff members.

| Script | What it does |
| --- | --- |
| `npm run dev --workspace=backend` | Start with file watching |
| `npm run start --workspace=backend` | Start for production |
| `npm run seed --workspace=backend` | Seed catalog, posts, settings and the admin (skips anything already present) |
| `npm run seed:demo --workspace=backend` | Same, plus 12 demo orders for the dashboard and reports |
| `npm run seed:reset --workspace=backend` | Wipe the database and seed again with demo data |

The seed reads the demo catalog from `frontend/src/mocks/data.js`, so the mock and the API share one data set.

## Environment variables

See `.env.example`. `JWT_SECRET` is required. Without `SMTP_HOST`, password-reset links and new-order emails are printed to the server console instead of being sent.

## Roles

| Capability | admin | staff |
| --- | --- | --- |
| Sign in, dashboard, notifications | yes | yes |
| Orders: list, view, change status, notes | yes | yes |
| Products, categories, blog, uploads | yes | yes |
| Delete a category | yes | no |
| Reports and audit log | yes | no |
| Staff management (add, edit, deactivate, delete users) | yes | no |
| Edit store settings | yes | read only |

Safeguards: a user cannot change their own role, deactivate or delete themselves, and the last active administrator cannot be demoted, deactivated or deleted. Deactivated accounts are refused at sign-in and on every request.

## Endpoints

All paths are under `/api`. Admin routes need `Authorization: Bearer <token>`.

**Public**

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | Liveness |
| GET | `/products` | `q, category (slug, comma separated), minPrice, maxPrice, inStock, prescription, featured, sort (newest, price-asc, price-desc, popular, rating, name), page, limit` |
| GET | `/products/:slug` | Includes `related[]` |
| GET | `/categories`, `/categories/:slug` | Active only, with `productCount` |
| POST | `/orders` | `{ customer{name, phone, email?, district, sector, address, notes?}, items[{productId, quantity}] }`. Prices come from the database. Rate limited. |
| GET | `/orders/track?orderNumber=&phone=` | Phone matched on its last 9 digits |
| GET | `/orders/confirmation/:token` | Lookup by the `trackingToken` returned on creation |
| GET | `/blog`, `/blog/:slug` | Published posts; `q, category, page, limit` |
| GET | `/settings` | Public subset of store settings |
| GET | `/seo/sitemap.xml` | nginx maps `/sitemap.xml` here |
| GET | `/uploads/...` | Uploaded images |

**Admin**

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/admin/auth/login` | `{ email, password, remember? }` → `{ token, user }` |
| GET | `/admin/auth/me` | Current user |
| POST | `/admin/auth/logout` | Stateless; the client drops the token |
| POST | `/admin/auth/forgot-password` | Emails a link to `FRONTEND_URL/admin/reset-password/:token`, valid for one hour |
| POST | `/admin/auth/reset-password` | `{ token, password }` |
| POST | `/admin/auth/change-password` | `{ currentPassword, newPassword }` |
| GET/POST | `/admin/staff` | admin only |
| PUT/DELETE | `/admin/staff/:id` | admin only. `PUT` accepts `name, email, role, isActive, password` |
| GET/POST | `/admin/products` | `q, category (slug), stock (low or out), sort, page, limit` |
| GET/PUT/DELETE | `/admin/products/:id` | Body uses `categoryId`; `tags` may be an array or comma string |
| GET/POST | `/admin/categories` | |
| PUT/DELETE | `/admin/categories/:id` | Delete refuses while products use it |
| GET | `/admin/orders` | `status, q, from, to, page, limit` |
| GET | `/admin/orders/:id` | |
| PATCH | `/admin/orders/:id/status` | `{ status, note? }`. Confirming reserves stock; cancelling a confirmed order releases it |
| PATCH | `/admin/orders/:id/notes` | `{ adminNotes }` |
| GET/POST | `/admin/blog` | `q, status (published or draft), page, limit` |
| GET/PUT/DELETE | `/admin/blog/:id` | |
| POST | `/admin/uploads` | multipart `image` (jpg, png, webp, gif, svg, max 5 MB), optional `folder` → `{ url }` |
| GET | `/admin/notifications` | Latest 30, `meta.unread` |
| PATCH | `/admin/notifications/:id/read`, POST `/admin/notifications/read-all` | |
| GET | `/admin/reports/dashboard` | KPIs, 14-day series, status breakdown, top products, recent orders |
| GET | `/admin/reports?from=&to=` | admin only |
| GET | `/admin/reports/audit` | admin only |
| GET/PUT | `/admin/settings` | `PUT` is admin only |

Errors come back as `{ success: false, message, errors? }` with the matching HTTP status; the frontend's `getErrorMessage` reads `message`.

## Real-time

Dashboards connect to the `/admin` Socket.io namespace with `{ auth: { token } }`. Events: `order:new` (full order), `order:updated`, `notification:new`.

## Background jobs

Every 15 minutes: orders left in `new` or `contacted` for over 12 hours raise a `stale_order` notification once, and products at 5 units or fewer raise a `low_stock` notification once until restocked.

## Layout

```
backend/
├── src/
│   ├── app.js              Express app (middleware, routes)
│   ├── server.js           HTTP server, Socket.io, jobs, graceful shutdown
│   ├── config/             env, database connection, paths
│   ├── controllers/        One per resource
│   ├── routes/public/      Storefront endpoints
│   ├── routes/admin/       Dashboard endpoints
│   ├── middleware/         auth (JWT), validate (zod), rate limits, upload (multer), errors
│   ├── models/             Mongoose schemas
│   ├── validations/        Zod schemas mirroring frontend/src/validations
│   ├── socket/             /admin namespace
│   ├── jobs/               Stale-order and low-stock checks
│   ├── lib/                helpers, mailer, notifications, logger
│   └── seed/seed.js        Database seeding
└── uploads/                Uploaded images (git-ignored)
```
