## Biofuel Management System (Frontend)

Role-based React + TypeScript app (Vite) for Admin, Supervisor, and Operator. Features include CRUD for plants, vendors, vehicles, entries, invoices, and filterable/exportable reports.

### Tech
- React 19 + Vite + TypeScript
- Redux Toolkit (no RTK Query), React Router v6
- Axios (interceptors), Tailwind CSS, React-Toastify
- ESLint + Prettier + Husky (pre-commit with lint-staged)

### Getting Started
1. Install Node 20+.
2. Copy environment file and set API base:
   - Create a `.env` in project root:
     ```
VITE_API_URL=http://localhost:3000
     ```
3. Install deps and run:
   ```bash
   npm i
   npm run dev
   ```

### Scripts
- `npm run dev` — start dev server
- `npm run build` — type-check and build
- `npm run preview` — preview the production build
- `npm run lint` — lint TS/TSX

### Project Structure
```
src/
  api/           # Axios API modules per feature
  components/    # Reusable UI (table, pagination, filters, header)
  hooks/         # useAuth etc.
  layout/        # Role layouts
  pages/         # Feature pages per role
  routes/        # Route guards and route tree
  store/         # Redux store and slices
  utils/         # axios instance and toast helpers
```

### Auth & Routing
- Login hits `/api/auth/login`, stores token+user in Redux/localStorage.
- Route guards enforce auth and allowed roles.
- Layouts render role-specific navigation.

### Features
- Plants/Vendors/Vehicles: list, search, paginate, create/edit, delete.
- Entries (operator): record and update exit weight.
- Invoices: list, filter by vendor/plant/status/date, create/edit/delete, download PDF.
- Reports: summary/detailed/vendor-wise/plant-wise; CSV export.

### Environment
- `VITE_API_URL`: API base URL (e.g., `http://localhost:3000`).

### Code Quality
Husky pre-commit runs lint-staged (ESLint + Prettier) on staged files.

