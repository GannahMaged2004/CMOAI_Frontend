# CMO.ai

CMO.ai is an AI-powered marketing workspace that helps teams move from campaign ideas to structured planning, creative production, and execution.

## Demo video

[Watch the CMO.ai demo video](<demo-assets/CMO.AI video.mp4>)

## What is included

- Frontend dashboard built with React, TypeScript, Vite, and Tailwind CSS
- FastAPI backend for auth, brands, campaigns, strategies, analytics, and agent endpoints
- Market planner workspace for business inputs, content pillars, and posting schedules
- Text, image, and video agent flows
- Notification center and campaign workspace management

## Project structure

```text
CMO.ai/
|- frontend/              # Vite frontend
|- app/                   # FastAPI backend
|- alembic/               # database migrations
|- uploads/               # generated assets
|- requirements.txt       # backend dependencies
|- frontend/package.json  # frontend dependencies
```

## Local development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional frontend env file:

```bash
copy .env.example .env
```

### Backend

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Optional backend env file:

```bash
copy .env.example .env
```

The frontend uses Vite proxy in local development, and can also be pointed at a hosted backend with `VITE_API_BASE_URL`.

## Deployment

### Recommended split deployment

- Frontend -> Vercel
- Backend -> Render or Railway

This is the safer setup for this repository because the frontend is a Vite static build while the backend is a separate FastAPI service with database access and long-running API integrations.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment flow.

### Frontend on Vercel

This repository is configured so Vercel can build the frontend from the repo root using `vercel.json`.

- Build command: `cd frontend && npm install && npm run build`
- Output directory: `frontend/dist`
- Required frontend env: `VITE_API_BASE_URL=https://your-backend-domain/api/v1`

### Backend on Render or Railway

The repository now includes:

- `render.yaml`
- `railway.json`
- `.env.example`

## Notes

- Backend CORS origins are now configured through `CORS_ORIGINS`.
- Generated image uploads currently use local disk storage in `uploads/`, which is acceptable for demo use but should be moved to persistent cloud storage for long-term production use.
- Image and video agents include fallback behavior when external providers are not configured.

## Team

- Frontend was done by Gannah Maged Eltonsy
- Backend was done by Ahmed Saber https://github.com/ahmedsaberabdelgalil/
- AI Team: Abdelrahman Yosri, Esraa Reda, Habiba Helal, Shahd Mohamed, and Sara Wael
