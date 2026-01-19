# Backend (Node + Express + Mongoose)

API server for the Quantumronics assessment app. Provides JWT auth, OAuth integration, RBAC, admin endpoints, and activity logging.

## Folder Structure
```
backend/
├─ src/
│  ├─ config/
│  │  ├─ db.js
│  │  └─ passport.js
│  ├─ controllers/
│  │  └─ authController.js
│  ├─ middleware/
│  │  └─ auth.js
│  ├─ models/
│  │  ├─ AdminActivity.js
│  │  ├─ LoginLog.js
│  │  └─ User.js
│  ├─ routes/
│  │  ├─ adminRoutes.js
│  │  └─ authRoutes.js
│  └─ index.js
├─ package.json
└─ Dockerfile
```

## Environment Variables
- `MONGODB` Mongo connection string (Docker uses `mongodb://mongo:27017/app`)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` for signing tokens
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional OAuth)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (optional OAuth)
- `FRONTEND_URL` allowed origin for CORS (Docker uses `http://frontend:5173`)

Store these in `backend/.env`. The file is gitignored.

## Run Locally
```bash
cd backend
npm install
echo "MONGODB=mongodb://localhost:27017/app" > .env
echo "JWT_SECRET=changeme" >> .env
echo "JWT_REFRESH_SECRET=changeme2" >> .env
npm run dev
# server listens on http://0.0.0.0:8000
```

## Run with Docker Compose
```bash
# from repository root
docker compose up --build
# API: http://localhost:8000
```
Compose sets `MONGODB=mongodb://mongo:27017/app` and reads JWT/OAuth secrets from environment.

## Security and Auth
- JWT access tokens, refresh token stored as httpOnly cookie
- Passwords hashed via bcrypt in Mongoose pre-save
- RBAC via roles (Admin, Manager, User)
- AdminActivity logs: role change, delete, user update, password update

## Admin API Highlights
- `GET /api/admin/users` list users (paged)
- `PATCH /api/admin/users/:id/role` change role
- `PATCH /api/admin/users/:id` update name/email
- `PATCH /api/admin/users/:id/password` update password
- `DELETE /api/admin/users/:id` delete user
