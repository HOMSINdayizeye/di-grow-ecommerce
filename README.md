# Di-Grow E-commerce

Online storefront and admin dashboard for Di-Grow, a Kigali shop for health, wellness and agricultural growth products.

Customers browse products, add them to a cart and send an **order request** with their phone number and delivery address. There is no online payment: the shop calls to confirm (and a pharmacist verifies prescriptions), then delivers within Kigali and collects payment on delivery.

## Monorepo layout

```
di-grow-ecommerce/
├── frontend/        React 18 + Vite + Tailwind storefront and admin (this phase)
├── docs/            Design system and data contract
├── infrastructure/  Frontend Dockerfile, nginx config, docker-compose
└── .github/         CI workflow (lint + build)
```

The `backend/` workspace (Node/Express API, Socket.io, jobs) is added in the next phase; the nginx config and the frontend services already expect it at `http://backend:5000`.

## Quick start (frontend)

Requires Node 20+.

```bash
npm install
npm run dev
```

Open http://localhost:5173 (the Claude desktop app can also start it from `.claude/launch.json`). The frontend ships with an in-memory **mock API** (`VITE_USE_MOCK=true` in `frontend/.env`) so every page works before the backend exists. Mock changes persist in `localStorage`.

Admin dashboard: http://localhost:5173/admin/login

| Field | Value |
| --- | --- |
| Email | `admin@digrow.rw` |
| Password | `admin123` |

To point at a real backend, set `VITE_USE_MOCK=false` and `VITE_API_URL` in `frontend/.env`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server (proxies `/api` and `/socket.io` to `localhost:5000`) |
| `npm run build` | Production build to `frontend/dist` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over the frontend |

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
| `VITE_WHATSAPP_NUMBER`, `VITE_PHONE_NUMBER`, `VITE_CONTACT_EMAIL`, `VITE_ADDRESS` | Business contact details |

## License

MIT
