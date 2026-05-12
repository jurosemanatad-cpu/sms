# School Management System (Simple)

This is a beginner-friendly full-stack school management system:

- `api/`: Express + Prisma + PostgreSQL
- `web/`: React + Vite
- `render.yaml`: Render blueprint for database + API + frontend

## 1) Local setup

1. Install Node.js LTS.
2. From project root:
   ```bash
   npm install
   ```
3. Create env files:
   - Copy `api/.env.example` to `api/.env`
   - Copy `web/.env.example` to `web/.env`
4. Set `api/.env` `DATABASE_URL` to a PostgreSQL URL.

## 2) Database (Prisma)

From root:

```bash
npm --workspace api run prisma:migrate -- --name init
npm --workspace api run prisma:generate
```

## 3) Run locally

Terminal 1:

```bash
npm run dev:api
```

Terminal 2:

```bash
npm run dev:web
```

Open `http://localhost:5173`.

## 4) Push to GitHub

```bash
git init
git add .
git commit -m "Initial simple school management system"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 5) Deploy to Render

### Option A: Blueprint (recommended)

1. In Render Dashboard: **New +** -> **Blueprint**.
2. Connect your GitHub repo.
3. Render will detect `render.yaml` and create:
   - PostgreSQL database: `sms-db`
   - API service: `sms-api`
   - Frontend static service: `sms-web`
4. Update `CORS_ORIGINS` and `VITE_API_URL` values after first deploy if URLs differ.

### Option B: Manual services

1. Create PostgreSQL in Render.
2. Create API Web Service from `api/`.
3. Create Static Site from `web/`.
4. Set environment variables manually.

## 6) Production migration flow

The API build command in `render.yaml` runs:

```bash
npm run prisma:deploy
```

This applies committed migrations safely in production.
