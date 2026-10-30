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

## Deploying

The frontend is a static Vite build; the backend is a long-running Node server (Express, Socket.io, file uploads) and needs a host that runs a process, for example Render, Railway, Fly.io or a VPS with `infrastructure/docker-compose.yml`. Vercel can host the **frontend only**.

**Frontend on Vercel** (project root `frontend/`; `frontend/vercel.json` adds the SPA rewrite):

| Variable | Value |
| --- | --- |
| `VITE_USE_MOCK` | `false` (already the default in `.env.production`; never `true` in production or the site runs on in-browser demo data) |
| `VITE_API_URL` | public API URL with the `/api` prefix, e.g. `https://api.digrow.rw/api` |
| `VITE_SOCKET_URL` | the API host without `/api`, e.g. `https://api.digrow.rw` |
| `VITE_SITE_URL`, contact variables | as in `frontend/.env.example` |

**Backend on Render** (`render.yaml` at the repo root is a Render Blueprint):

1. Create a free MongoDB Atlas cluster, add a database user, allow access from anywhere (0.0.0.0/0, Render has no fixed IP on the free plan) and copy the `mongodb+srv://` connection string.
2. Render → New → **Blueprint** → choose this GitHub repository. Render reads `render.yaml` and asks for the values it cannot guess: `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL` (the Vercel URL), `CORS_ORIGINS` (the Vercel URL, plus a custom domain if any, comma separated), the Brevo variables.
3. Deploy. On the first start with an empty database the API creates the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` by itself (no seed command needed). The log shows `Mail: ready via …` when email is configured correctly.
4. Copy the service URL (`https://<name>.onrender.com`) into the Vercel variables above and redeploy the frontend.

Notes: the free plan sleeps after 15 minutes without traffic (the first request then takes up to a minute) and has no persistent disk, so uploaded images are lost on the next deploy or restart; a paid plan with the `disk` block in `render.yaml` keeps them. `UPLOADS_BASE_URL` defaults to the Render URL automatically.

**Any other host:** set the same variables plus `UPLOADS_BASE_URL` = `https://<api host>/api/uploads`, then run `npm run seed` once (or let the first start create the admin).

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
- Import a PDF catalogue: pictures and the text beside them become draft products; the admin adds prices, picks categories, edits descriptions and imports them (Admin → Products → Import PDF catalogue)
- Email through Brevo (or any SMTP) for password resets and order alerts, with a test button under Settings → Notifications
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
