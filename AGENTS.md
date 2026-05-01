# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

```bash
# Development (uses Turbopack)
npm run dev

# Production build (uses Turbopack)
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

There are no automated tests configured in this project.

## Environment Variables

Create a `.env` file in the project root with:

```
MONGO_URI=<MongoDB Atlas connection string>
TOKEN_SECRET=<JWT signing secret>
DOMAIN=http://localhost:3000
```

## Architecture Overview

This is a **Next.js 15 App Router** admin panel ("Clean-AI") for the Garbage Detection & Classification system — used by municipal staff to manage garbage reports, moderate flagged content, and manage field workers.

### Tech Stack

- **Next.js 15** with App Router and Turbopack
- **React 19**, **TypeScript**, **Tailwind CSS v4**
- **MongoDB + Mongoose** for persistence
- **JWT** (stored in httpOnly cookie named `token`) + **bcryptjs** for auth
- **Framer Motion** for animated layout transitions
- **Recharts** for dashboard charts
- **Lucide React** for icons, **react-hot-toast** for notifications
- **Axios** for API calls from the client

### Authentication

JWT is stored in an httpOnly cookie called `token`. `src/middleware.ts` guards the routes `/`, `/profile`, `/login`, and `/signup` only — other admin routes (e.g. `/AdminDashboard`) are **not** in the middleware matcher and are unprotected at the middleware level.

Token parsing in API routes is done via `src/helpers/getDataFromToken.ts`, which calls `jwt.verify` and returns the user's `_id`.

### Layout System

`src/app/layout.tsx` wraps all pages with `BarLayout` (`src/components/layout/Barlayout.tsx`), which controls the animated **Sidebar** and **Topbar** visibility:
- Both are hidden on `/login` and `/signup`
- Topbar is additionally hidden on `/profile` pages
- Sidebar auto-collapses below 768px viewport width
- `activePage` state is lifted into `BarLayout` and passed down to both `Sidebar` and `Topbar` for title display

### Routing

Pages live in `src/app/(pages)/` — the `(pages)` group does not affect URLs. The root `src/app/page.tsx` renders `LoginPage` directly (i.e., visiting `/` shows login). After login, users are redirected to `/AdminDashboard`.

| Route | Purpose |
|---|---|
| `/login`, `/signup` | Auth pages — no sidebar/topbar |
| `/AdminDashboard` | Static charts (mock data) |
| `/AdminModeration` | Review flagged posts (mock data) |
| `/AdminReports` | Browse reports with map/detail modals (mock data) |
| `/AdminWorker` | Manage field workers; form POSTs to `/api/worker/add` |
| `/profile/[id]` | Admin profile view, fetches from `/api/users/me` |

### API Routes

Located in `src/app/api/`. Each route handler calls `connect()` at module level to establish the MongoDB connection.

| Route | Method | Description |
|---|---|---|
| `/api/admin/login` | POST | Authenticate admin, sets `token` cookie |
| `/api/admin/signup` | POST | Register new admin |
| `/api/admin/me` | GET | Return current admin data (password excluded) |
| `/api/auth/logout` | GET | Clears `token` cookie |
| `/api/worker/add` | POST | Create a worker record |

> **Important:** The frontend pages (`login`, `signup`, `profile`) call `/api/users/login`, `/api/users/me`, and `/api/users/logout` respectively — but the actual route files are at `/api/admin/...` and `/api/auth/logout`. These paths are mismatched and will 404 unless corrected.

### Data Models

Both models are in `src/models/` as `.js` files (not TypeScript):

- **`adminModel.js`** — Mongoose model for AMC staff admins. Fields: `username`, `email`, `mobile`, `password` (hashed), `employeeId`, `department`, `designation`, `role`, `zone`, `ward`, `officeLocation`, `isVerified`, `isAdmin`, plus forgot-password/verify token fields. **Known bug:** line 64 references `userSchema` instead of `adminSchema`, which will throw a ReferenceError at runtime.

- **`WorkerModel.js`** — Mongoose model for field workers. Fields: `firstName`, `middleName`, `lastName`, `email`, `mobile`, `aadhaar`, `address`, `password`, `zone`, `ward`, `createdBy`.

### Backend Directory

The `backend/` directory contains an empty Python project scaffold (FastAPI-style structure with `main.py`, `config.py`, `database.py`, `auth/`). All files are currently empty — this is a placeholder for the AI/ML inference backend that is not yet implemented.

### Current State / Known Issues

- All admin pages (Dashboard, Moderation, Reports, Worker list) use **hardcoded mock data** — no live database reads on the frontend yet.
- `src/app/api/worker/add/route.ts` contains only a JWT helper function and no actual route handler.
- `adminModel.js` has a `ReferenceError` bug (`userSchema` is undefined).
- The `@/*` path alias resolves to `src/*` (configured in `tsconfig.json`).
- `next.config.ts` allows images only from `images.unsplash.com` — add other domains here as needed.
