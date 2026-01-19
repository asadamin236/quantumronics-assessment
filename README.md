# Quantumronics Assessment App

Enterprise-style MERN application featuring OAuth, RBAC, JWT-based auth flows, and Dockerized deployment for local development.

## Features
- OAuth login (Google/GitHub when configured)
- Role-Based Access Control (Admin, Manager, User)
- JWT Access + Refresh tokens with cookie refresh flow
- Admin tools: user role changes, delete, update name/email/password
- Activity logs and security-oriented CORS settings

## Tech Stack
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + Passport + Mongoose
- Database: MongoDB
- Auth: JWT (access/refresh), cookies, OAuth strategies

## Environment Variables
- Backend:
  - MONGODB (e.g., mongodb://mongo:27017/app)
  - JWT_SECRET, JWT_REFRESH_SECRET
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
  - FRONTEND_URL (e.g., http://frontend:5173)
- Frontend:
  - VITE_API_BASE_URL (e.g., http://backend:8000/api)

Never commit secrets. .env is gitignored in both frontend and backend.

## Docker
### Build and Run
```bash
docker compose up --build
```
Services:
- frontend: http://localhost:5173
- backend: http://localhost:8000
- mongo: mongodb://localhost:27017

Networking:
- Frontend uses internal Docker service name for API: `http://backend:8000/api`
- Backend allows CORS from `FRONTEND_URL`

### Stopping
```bash
docker compose down
```

## Local Development (without Docker)
- Backend: set MONGODB and JWT secrets in backend/.env, run `npm run dev`
- Frontend: set VITE_API_BASE_URL in frontend/.env, run `npm run dev`

## Security Notes
- Access tokens issued via JWT; refresh token stored as httpOnly cookie
- Passwords hashed via bcrypt with Mongoose pre-save
- Admin actions logged via AdminActivity
- CORS restricted to configured frontend origin

## OAuth Setup
Provide client IDs/secrets via environment variables. When missing, OAuth endpoints return appropriate errors.
