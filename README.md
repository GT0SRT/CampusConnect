# CampusConnect

Campus social app built with React + Vite and Firebase. Students can post images (Cloudinary), browse feeds and threads, edit profiles, and use an AI assistant (Gemini) for image captioning and text correction via a FastAPI microservice.

## Features

- Email/Google auth with Firebase Auth and profile completion
- Feed and threads with Firestore persistence; likes, comments, bookmarks
- Image uploads via Cloudinary; profile and post media support
- AI assistant with floating chat bubble (Gemini) for captions and grammar fixes
- Responsive layout with sidebar, mobile nav, and dark mode

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS 4, Zustand, Tiptap, Lucide icons
- Backend: FastAPI, google-generativeai (Gemini 2.5 flash-lite)
- Storage/DB/Auth: Firebase (Auth, Firestore, Storage)
- Media: Cloudinary

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Firebase project with Firestore and Storage enabled
- Cloudinary account (unsigned upload preset)
- Gemini API key

## Environment Variables

Create a `.env` in the project root for the frontend:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_PRESET=your_unsigned_preset
VITE_CAPTION_API_URL=https://your-fastapi-host/generate
VITE_API_BASE_URL=https://your-fastapi-host
VITE_AVATAR_API_URL=https://ui-avatars.com/api/
```

Create `server/.env` for the backend:

```
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGINS=https://your-frontend-domain,http://localhost:5173
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

## Local Development

### Frontend

```bash
npm install
npm run dev
```

App runs at http://localhost:5173

### Backend (FastAPI)

```bash
cd server
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

API runs at http://localhost:8000

## Build and Lint

```bash
npm run lint
npm run build
```

## Deployment Notes

- Set the same frontend env vars in Vercel (or your host) and point `VITE_CAPTION_API_URL` to the deployed FastAPI endpoint.
- Deploy FastAPI to Render/Railway/Cloud Run and allow CORS for your frontend domain.
- Configure Firebase Firestore/Storage security rules before going live.
