# CampusConnect

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-AI%20Engine-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Jest](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](#license)

CampusConnect is a full-stack campus social + career platform with a modern web app, REST backend, and AI engine. It combines core social features (posts, comments, threads, squads) with AI-powered workflows (interviewer, assessment, resume analysis, and matchmaker intelligence).

---

## Key Features

### Social Experience
- Feed and thread system with commenting and engagement features
- User profiles and authentication flows (email/social)
- Squad/community experiences for campus collaboration
- Search and discovery across platform content

### AI-Powered Career Suite
- AI Interviewer chat flow
- AI Interview analysis from transcript input
- AI-generated interview assessments and response scoring
- Resume PDF analysis
- Matchmaker filter extraction from natural language prompts

### Production Readiness
- Layered backend architecture (`routes`, `controllers`, `middleware`)
- Prisma-based data access and migrations
- Security middleware (`helmet`, CORS policy, rate limiting)
- Service health endpoints and containerized services

---

## Architecture

This repository is organized as a multi-service monorepo:

```text
CampusConnect/
├─ frontend/     # React + Vite client
├─ backend/      # Node.js + Express + Prisma API
└─ ai-engine/    # FastAPI AI microservice (Gemini/Groq)
```

### Service Ports (default)
- Frontend: `5173`
- Backend API: `5000`
- AI Engine: `8000`

---

## Tech Stack

- Frontend: React 19, Vite 7, Tailwind CSS 4, Zustand, React Query, Tiptap
- Backend: Node.js, Express 5, Prisma ORM, PostgreSQL, JWT Auth
- AI Engine: FastAPI, Uvicorn, Gemini + Groq clients, PDF processing
- DevOps: Docker, Dockerfiles for backend and AI engine
- Testing: Jest + Supertest (backend API and unit tests)

---

## Prerequisites

- Node.js `18+` (recommended `20+`)
- npm `9+`
- Python `3.10+`
- PostgreSQL instance
- API keys for AI providers (Gemini, Groq)

---

## Environment Variables

### 1) Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_AI_ENGINE_URL=http://localhost:8000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_PRESET=your_unsigned_preset
VITE_AVATAR_API_URL=https://ui-avatars.com/api/
```

### 2) Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/campusconnect
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
JSON_BODY_LIMIT=1mb
```

### 3) AI Engine (`ai-engine/.env`)

```env
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
AI_ENGINE_API_KEY=optional_internal_service_key
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### AI Engine

```bash
cd ai-engine
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Testing

Backend tests are available with Jest/Supertest.

```bash
cd backend
npm test
```

Includes API and controller-focused tests under `backend/__tests__/`.

---

## 🐳 Docker

This repo includes Docker support for backend and AI engine.

### Backend image

```bash
cd backend
docker build -t campusconnect-backend .
docker run --env-file .env -p 5000:5000 campusconnect-backend
```

### AI engine image

```bash
cd ai-engine
docker build -t campusconnect-ai-engine .
docker run --env-file .env -p 8000:8000 campusconnect-ai-engine
```

---

## 🩺 Health Checks

- Backend: `GET /health`
- AI Engine: `GET /health`

---

## Core API Areas

### Backend routes
- `/api/auth`
- `/api/profile`
- `/api/posts`
- `/api/comments`
- `/api/threads`
- `/api/interviews`
- `/api/assessments`
- `/api/squads`
- `/api/search`

### AI engine routes
- `/generate` (caption/content generation)
- `/chat` (assistant chat)
- `/interviewer` (interview session)
- `/analyze` (interview analysis)
- `/resumeanalyzer` (resume PDF analysis)
- `/generate_assessment`, `/assess_response`
- `/matchmaker`, `/matchmaker-filters`

---

## Contributing

This is a proprietary software project.

- External copying, redistribution, or reuse is not permitted.
- Contribution is by owner approval only.

---

## Legal

- CampusConnect is provided for educational and development purposes.
- Third-party services and trademarks (for example React, Docker, FastAPI, Prisma, Groq, and Google Gemini) remain the property of their respective owners.
- You are responsible for complying with provider terms, privacy requirements, and applicable campus or regional regulations when deploying this project.
- No license is granted to copy, redistribute, sublicense, or commercially reuse this codebase without explicit written permission from the owner.

---

## License

All Rights Reserved. This software is proprietary and confidential. See [LICENSE](LICENSE).
