# CMO.ai Split Deployment Guide

This is the safer graduation-project deployment setup:

- `frontend` -> Vercel
- `backend` -> Render or Railway
- `database` -> PostgreSQL on the backend platform or a managed Postgres provider

## Why this setup

The repository already builds the frontend cleanly on Vercel, but the FastAPI backend is a separate long-running service with database access, file uploads, and AI-provider keys. Splitting deployment keeps each side simple and easier to debug.

## 1. Backend on Render

The repository now includes [render.yaml](/C:/Users/DELL/Desktop/CMO.ai/render.yaml) for the API service.

### Render settings

- Runtime: `Python`
- Build command: `pip install -r requirements.txt`
- Pre-deploy command: `alembic upgrade head`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

### Required backend environment variables

Copy values from [.env.example](/C:/Users/DELL/Desktop/CMO.ai/.env.example) and set real secrets:

- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `RUNWAY_API_KEY`
- `RUNWAY_MODEL`
- `RUNWAY_RATIO`
- `RUNWAY_DURATION`
- `RUNWAY_IMAGE_MODEL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `EMAILS_FROM_EMAIL`

### Important backend note

The current project stores generated images in `uploads/`. On Render or Railway, local disk is not guaranteed to be persistent unless you add persistent storage or move assets to cloud storage such as Cloudinary or S3. For a graduation-project demo, this is usually acceptable, but for long-term use it should be upgraded.

## 2. Backend on Railway

The repository now includes [railway.json](/C:/Users/DELL/Desktop/CMO.ai/railway.json).

### Railway deploy behavior

- Builder: `Nixpacks`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/health`

Use the same backend environment variables listed above.

## 3. Frontend on Vercel

The repo root already contains [vercel.json](/C:/Users/DELL/Desktop/CMO.ai/vercel.json), which builds the Vite frontend from `frontend/`.

### Required frontend environment variable

Set this in Vercel:

- `VITE_API_BASE_URL=https://your-backend-domain/api/v1`

### Vercel routing note

The repo's [vercel.json](/C:/Users/DELL/Desktop/CMO.ai/vercel.json) now includes an SPA rewrite so direct visits to routes like `/login`, `/pricing`, and `/dashboard` resolve to `index.html` instead of returning a 404.

Example:

```env
VITE_API_BASE_URL=https://cmo-ai-api.onrender.com/api/v1
```

The frontend now reads this value from [frontend/.env.example](/C:/Users/DELL/Desktop/CMO.ai/frontend/.env.example).

## 4. CORS setup

The backend now reads `CORS_ORIGINS` from environment.

Example:

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-frontend-project.vercel.app
```

If you later attach a custom frontend domain, add that domain here too.

## 5. Deployment order

Deploy in this order:

1. Deploy the backend to Render or Railway.
2. Copy the final backend URL.
3. Set `VITE_API_BASE_URL` in Vercel.
4. Deploy the frontend to Vercel.
5. Add the final Vercel domain into backend `CORS_ORIGINS`.
6. Redeploy the backend if you changed environment variables.

## 6. Quick verification checklist

After deploy:

1. Open `https://your-backend-domain/health`
2. Open the Vercel frontend
3. Test login
4. Open dashboard
5. Test one text generation request
6. Test one image/video request

## 7. Current graduation-project recommendation

For the demo and marking:

- Use `Railway` or `Render` for the backend
- Use `Vercel` for the frontend
- Keep local screenshots and walkthrough video as backup evidence
- If live media generation is unstable, demo text generation live and show saved screenshots/video outputs for image/video modules
