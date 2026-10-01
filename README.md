# Applyly

Applyly is a job application tracker with a Next.js frontend and a Python/FastAPI backend backed by MongoDB.

## Run locally

1. Copy `.env.example` to `.env.local` and provide a MongoDB connection string.
2. Install frontend packages and start Next.js:

   ```bash
   npm install
   npm run dev
   ```

3. Install backend packages and start FastAPI in a second terminal:

   ```bash
   /opt/homebrew/bin/python3 -m pip install -r backend/requirements.txt
   /opt/homebrew/bin/python3 -m uvicorn backend.main:app --reload --port 8000
   ```

The frontend runs at `http://localhost:3000` and calls the backend configured by `NEXT_PUBLIC_API_URL`.

## Current data model

Each application stores the company, role, job link, location, resume used, application status, referral email, and whether the referral was confirmed. The API currently exposes list, create, and status-update operations under `/api/applications`.

Authentication and per-user data isolation should be added before deploying this as a multi-user enterprise product. The current API is intentionally a single-workspace foundation.
