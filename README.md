## STOREFRONT – Anonymous marketplace with custodial escrow (MVP)

### Status report

- **Environment**: ✅ Node `v20.19.5`, npm `9.2.0`
- **Frontend**: ✅ Vite dev server starts cleanly (`npm run dev` in `frontend/`) and serves on `http://localhost:5173/`
- **Backend**: ✅ Express/TypeScript server boots (`npm run dev`) and `GET /health` returns `{"status":"ok"}` with CORS enabled
- **Database/Redis**: ✅ Postgres 16 and Redis 7 run via `docker-compose`; Sequelize migrations apply successfully

### Prerequisites

- Node.js **18+** (tested with `v20.19.5`)
- npm **9+**
- Docker + Docker Compose (for Postgres and Redis)

### How to run locally

#### 1. Start infrastructure (Postgres + Redis)

From the repo root:

```bash
docker compose up -d db redis
```

This starts:
- Postgres on `localhost:5432` with DB `storefront`, user `storefront`, password `storefront`
- Redis on `localhost:6379`

#### 2. Install backend dependencies and run migrations

From the repo root:

```bash
cd /home/lupin/storefront
npm install

# Apply Sequelize migrations
npx sequelize-cli db:migrate
```

#### 3. Start the backend API

Backend runs on **port 3000**.

```bash
cd /home/lupin/storefront
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
# -> {"status":"ok"}
```

#### 4. Install frontend dependencies and start Vite

In a separate terminal:

```bash
cd /home/lupin/storefront/frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

You should see output similar to:

```text
VITE v6.x ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173/` in your browser to view the STOREFRONT UI.

**Frontend Design**: The UI is designed in a classic eBay-style marketplace format:
- Light background with clean, scannable listings
- Category sidebar (collapses to dropdown on mobile)
- List/Grid view toggle
- Seller ratings and feedback prominently displayed
- Search functionality
- Escrow protection badges
- Seller profile pages with feedback breakdown

### Environment configuration

**Backend** (create `.env` in repo root):

```bash
JWT_SECRET=change_me
JWT_EXPIRES_IN=1h
ADMIN_EMAIL=admin@example.com
CORS_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_USER=storefront
DB_PASSWORD=storefront
DB_NAME=storefront
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
DEMO_MODE=true
```

**Frontend** (copy `frontend/env.example` to `frontend/.env`):

```bash
VITE_API_URL=http://localhost:3000
VITE_DEMO_MODE=false
```

### API endpoints (auth module)

**POST /auth/register**
- Body: `{ pseudonym: string, email?: string, password: string }`
- Returns: `{ token: string, user: User }`

**POST /auth/login**
- Body: `{ emailOrPseudonym: string, password: string }`
- Returns: `{ token: string, user: User }`

**GET /auth/me**
- Headers: `Authorization: Bearer <token>`
- Returns: `{ user: User }`

**Admin promotion**: If a user registers or logs in with an email matching `ADMIN_EMAIL` (case-insensitive), their role is automatically set/promoted to `"admin"`.

### Frontend features

- ✅ **Auth integration**: Login/Register pages wired to backend API
- ✅ **Auth context**: Global auth state with token management
- ✅ **Protected routes**: Seller and Admin dashboards require authentication + role checks
- ✅ **Dynamic header**: Shows user pseudonym, role badges, and logout when authenticated
- ✅ **Auto-redirect**: Logged-in users redirected from login/register pages
- ✅ **Error handling**: Form validation and API error display

### Testing auth flow

1. **Register a new user**:
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"pseudonym":"testuser","email":"user@example.com","password":"password123"}'
   ```

2. **Login**:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"emailOrPseudonym":"user@example.com","password":"password123"}'
   ```

3. **Get current user** (replace `<TOKEN>` with token from login/register):
   ```bash
   curl http://localhost:3000/auth/me \
     -H "Authorization: Bearer <TOKEN>"
   ```

Or use the frontend UI at `http://localhost:5173/register` and `http://localhost:5173/login`.

### New files added for ops

- **`docker-compose.yml`** – runs Postgres (`db`) and Redis (`redis`) with sensible local defaults.
- **`frontend/env.example`** – example Vite environment file with `VITE_API_URL`.
- **`backend/src/routes/health.routes.ts`** – `GET /health` endpoint returning `{ "status": "ok" }`.

These provide a clean baseline so you can run both servers and the database locally with the commands above.

### Demo mode guardrails

Demo-only endpoints (like `POST /demo/checkout`) are blocked unless `DEMO_MODE=true`.
If `DEMO_MODE` is not set to `true`, demo endpoints return `403` with
`"Demo mode disabled"`.

### Deploy (Production)

1. **Deploy backend (Render/Railway/etc.)**
   - Provision Postgres + Redis.
   - Set environment variables:
     - `NODE_ENV=production`
     - `JWT_SECRET=<strong secret>`
     - `CORS_ORIGIN=https://your-frontend-domain`
     - `DEMO_MODE=false`
     - `UPLOAD_DIR=/var/data/uploads` (use a persistent disk)
     - DB + Redis connection settings
   - Run migrations:
     ```bash
     npx sequelize-cli db:migrate
     ```

2. **Deploy frontend (Vercel)**
   - Set environment variables:
     - `VITE_API_URL=https://your-backend-domain`
     - `VITE_DEMO_MODE=false`

3. **Create an admin user**
   - Once a user registers:
     ```sql
     UPDATE users SET role='admin' WHERE email='admin@example.com';
     ```

**Uploads note:** Local disk uploads require a persistent disk. On Render,
attach a disk or use object storage if you need durable uploads.
