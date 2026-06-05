# CMO.ai

CMO.ai is an AI-powered marketing workspace that helps teams move from campaign ideas to structured planning, creative production, and execution.

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

### Backend

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The frontend expects the backend API on `http://localhost:8000`.

## Deploying to Vercel

This repository is configured so Vercel can build the frontend from the repo root using `vercel.json`.

- Build command: `cd frontend && npm install && npm run build`
- Output directory: `frontend/dist`

## Notes

- The backend is not deployed by the Vercel frontend build in this repository layout.
- Image and video agents include fallback behavior when external providers are not configured.

