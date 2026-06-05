# Deployment

## GitHub

The current production-ready frontend state should live on the repository default branch for easy Git-based deployment.

## Vercel

This repository uses a root `vercel.json` to build the frontend from `frontend/`.

### Build details

- Build command: `cd frontend && npm install && npm run build`
- Output directory: `frontend/dist`
- Framework: `vite`

## Important note

The backend in `app/` is not automatically deployed by this Vercel frontend configuration.

