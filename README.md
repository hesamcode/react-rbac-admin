# RBAC Admin Console

Production-grade React + Tailwind v4 admin console demo focused on role-based access control, static deployment safety, and accessibility.

## Stack

- Vite + React 19
- Tailwind CSS v4 with `@tailwindcss/vite`
- Hash-based routing (`HashRouter`) for GitHub Pages compatibility
- Local state persistence with schema versioning + migration stub

## Features

- Auth simulation (email + role selector: Admin, Manager, Support, Viewer)
- RBAC permission matrix: `view`, `edit`, `delete`, `export`, `manageBilling`, `manageUsers`
- Protected routes with friendly access-denied states
- Overview dashboard with KPIs + inline SVG activity chart
- Users module:
  - desktop table + mobile card layout
  - search, sort, pagination
  - create/edit modal with validation
  - delete restricted to Admin role
  - loading/empty states + toast notifications
- Billing route restricted to Admin
- Audit trail for login/logout, user CRUD, billing exports, and settings changes
- Settings:
  - dark/light theme toggle (persists)
  - density toggle (persists)
  - reset demo data confirm modal
- About route with required author paragraph/signature
- Global footer signature across all routes
- Accessibility:
  - visible focus states
  - keyboard navigation
  - modal focus trap + ESC close + focus return

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Output is generated in `dist/` and is fully static.

## GitHub Pages Notes (Important)

- Routing uses `HashRouter`, so deep links work on static hosting without server rewrites.
- Do not switch to `BrowserRouter` for GitHub Pages.
- Keep Vite `base` path configurable externally (for example via CI `vite build --base=/repo-name/`).
- Avoid hardcoded root URLs and absolute asset paths (`/...`).
  - Use imports or `new URL(..., import.meta.url)` style paths.
- No backend/server/SSR is required.
- No Node-only runtime APIs are used by the client app.

## Persistence

- Local storage key: `rbac-admin-console-store`
- Schema version included with migration stub in `src/storage.js`
- Demo seed data is only created on first run and is not overwritten unless reset via settings

Author
HesamCode
Portfolio: https://hesamcode.github.io
