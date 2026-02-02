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

### Environment configuration

- Backend environment variables are read via `dotenv` (see `config/database.js` and `backend/src/startup/db.ts`).
- For local development, defaults are baked in:
  - DB host: `localhost`
  - DB name: `storefront`
  - DB user/password: `storefront` / `storefront`
  - Redis URL: `redis://localhost:6379`
  - Backend port: `3000`
  - CORS origin: `http://localhost:5173`
- A sample frontend env file is provided at:
  - `frontend/env.example` (copy to `frontend/.env` and adjust as needed)

Example `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

### New files added for ops

- **`docker-compose.yml`** – runs Postgres (`db`) and Redis (`redis`) with sensible local defaults.
- **`frontend/env.example`** – example Vite environment file with `VITE_API_URL`.
- **`backend/src/routes/health.routes.ts`** – `GET /health` endpoint returning `{ "status": "ok" }`.

These provide a clean baseline so you can run both servers and the database locally with the commands above.


