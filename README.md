# Di-Grow E-commerce

Online storefront and admin dashboard for Di-Grow, a Kigali shop for health, wellness and agricultural growth products.

Customers browse products, add them to a cart and send an **order request** with their phone number and delivery address. There is no online payment: the shop calls to confirm (and a pharmacist verifies prescriptions), then delivers within Kigali and collects payment on delivery.

## Monorepo layout

```
di-grow-ecommerce/
├── frontend/        React 18 + Vite + Tailwind storefront and admin
├── backend/         Node 22 + Express + MongoDB + Socket.io API (see backend/README.md)
├── docs/            Design system and data contract
├── infrastructure/  Dockerfiles, nginx config, docker-compose (mongo + backend + frontend)
└── .github/         CI workflow (lint + build)
```

## Quick start

Requires Node 20+ and MongoDB running locally (`mongodb://127.0.0.1:27017`).

```bash
npm install
cp backend/.env.example backend/.env    # set JWT_SECRET and ADMIN_PASSWORD
npm run seed:demo                       # catalog, settings, admin user, demo orders
npm run dev:backend                     # API on http://localhost:5000
npm run dev                             # storefront on http://localhost:5173 (second terminal)
```

The Claude desktop app can start both from `.claude/launch.json`.

Admin dashboard: http://localhost:5173/admin/login. Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env` (default `admin@digrow.rw` / `admin123`), then add more users under **Admin → Staff**.

### Mock mode

Set `VITE_USE_MOCK=true` in `frontend/.env` to run the frontend against its in-memory mock API without MongoDB or the backend. Mock changes persist in `localStorage`. The mock and the real API share the same data contract and demo content.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server (proxies `/api` and `/socket.io` to `localhost:5000`) |
| `npm run dev:backend` | Start the API with file watching |
| `npm run start:backend` | Start the API for production |
| `npm run seed` / `npm run seed:demo` | Seed the database (demo adds sample orders) |
| `npm run build` | Production build to `frontend/dist` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over the frontend |

## Docker

```bash
cp infrastructure/.env.example infrastructure/.env   # set JWT_SECRET and ADMIN_PASSWORD
cd infrastructure
docker compose up -d --build
docker compose exec backend node src/seed/seed.js
```

Open http://localhost. nginx serves the frontend and proxies `/api`, `/socket.io` and `/sitemap.xml` to the backend container.

## Frontend features

**Storefront**

- Home, shop with filters/sort/pagination, category pages, search, product details with gallery and structured data
- Cart (localStorage), order request form with Kigali district/sector picker and Rwandan phone validation
- Order confirmation and order tracking by order number + phone
- Blog, How It Works, About, Contact, FAQ, Privacy, Terms
- Dark/light theme, floating WhatsApp button, SEO meta + JSON-LD (Organization, Product, Breadcrumb, FAQ)

**Admin**

- Login / forgot / reset password, role-based routes (admin, staff)
- Dashboard with KPIs and charts, real-time new-order notifications (Socket.io)
- Orders list, filters, CSV export, order details with status workflow and notes
- Products and categories CRUD with image uploads, blog CRUD with preview
- Reports, staff management, store settings

See [docs/frontend-conventions.md](docs/frontend-conventions.md) for the design system and the data contract the backend must honour.

## Environment variables (frontend)

Copy `frontend/.env.example` to `frontend/.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL (`/api` with the dev proxy) |
| `VITE_SOCKET_URL` | Socket.io server for admin notifications |
| `VITE_USE_MOCK` | `true` to use the built-in mock API |
| `VITE_SITE_URL` | Public URL for canonical links |
| `VITE_WHATSAPP_NUMBER`, `VITE_PHONE_NUMBER`, `VITE_CONTACT_EMAIL`, `VITE_ADDRESS` | Fallback contact details while settings load (the live values come from Admin → Settings) |

Backend variables are documented in [backend/README.md](backend/README.md).

## License

MIT
