# Frontend (React + Vite)

Enterprise UI for the Quantumronics assessment app. Implements authentication flows (JWT + OAuth), RBAC, and admin management tools.

## Folder Structure
```
frontend/
├─ src/
│  ├─ auth/
│  │  ├─ AuthContext.jsx
│  │  ├─ ProtectedRoute.jsx
│  │  ├─ api.js
│  │  └─ contextCore.js
│  ├─ components/
│  │  ├─ ConfirmModal.jsx
│  │  ├─ Layout.jsx
│  │  ├─ LogList.jsx
│  │  ├─ Sidebar.jsx
│  │  └─ UserTable.jsx
│  ├─ pages/
│  │  ├─ ActivityLogsPage.jsx
│  │  ├─ Dashboard.jsx
│  │  ├─ Login.jsx
│  │  ├─ SecurityLogsPage.jsx
│  │  ├─ Signup.jsx
│  │  └─ UsersPage.jsx
│  ├─ App.jsx
│  ├─ main.jsx
│  ├─ App.css
│  └─ index.css
├─ package.json
└─ Dockerfile
```

## Configuration
- Environment variables are read via `import.meta.env`:
  - `VITE_API_BASE_URL` points to the backend API base.
    - Local: `http://localhost:8000/api`
    - Docker: `http://backend:8000/api`
  - Set in `frontend/.env` and gitignored.

## Run Locally
```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env
npm run dev
# open http://localhost:5173
```

## Run with Docker Compose
```bash
# from repository root
docker compose up --build
# frontend: http://localhost:5173
# backend API: http://localhost:8000
```
The compose file exports `VITE_API_BASE_URL=http://backend:8000/api` for internal networking.

## Notes
- Uses lucide-react icons for a compact admin UI.
- Admin actions available on Users page: role change, delete, update name/email/password.
- AuthContext initializes session via JWT access token and refresh flow.
