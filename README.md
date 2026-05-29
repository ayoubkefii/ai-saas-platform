# AI Workspace

A full-stack AI SaaS platform with dark futuristic UI, Groq-powered AI chat, PDF analysis, Kanban task manager, and analytics dashboard.

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, TailwindCSS, Framer Motion, Three.js, Zustand, React Router v6, Recharts, @dnd-kit  
**Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon), JWT, Groq SDK  
**AI:** Groq API (Llama 3 70B)

## Project Structure

```
Aiworkspace/
├── frontend/          # React + Vite app
└── backend/           # Express + Prisma API
```

## Quick Start

### 1. Clone & Setup Environment

```bash
# Backend env
cp backend/.env.example backend/.env
# Fill in: DATABASE_URL, JWT_SECRET, GROQ_API_KEY

# Frontend env
cp frontend/.env.example frontend/.env
# Set: VITE_API_URL=http://localhost:3001/api
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Setup Database

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The app will be available at **http://localhost:5173**

## Features

- **AI Chat** — Streaming chat with Groq Llama 3 70B, markdown rendering, code syntax highlighting, chat history, voice input, AI suggestions
- **PDF Analysis** — Upload PDFs, AI-generated summaries, follow-up Q&A with streaming, document preview
- **Task Manager** — Kanban board with drag & drop (To Do / In Progress / In Review / Done), priorities, due dates, templates, export/import
- **Dashboard** — Analytics cards, usage charts (Recharts), activity feed, quick actions
- **Analytics** — Detailed analytics with real-time data, multiple chart types, team activity
- **Notifications** — Real-time toast notifications for system events
- **Keyboard Shortcuts** — Productivity shortcuts for common actions
- **Auth** — JWT authentication, register/login, protected routes, animated transitions
- **Workspace** — Profile settings, dark/light theme toggle, password management

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon recommended) |
| `JWT_SECRET` | Secret key for JWT signing (32+ chars) |
| `GROQ_API_KEY` | API key from console.groq.com |
| `GROQ_MODEL` | Model ID (default: `llama3-70b-8192`) |
| `PORT` | Server port (default: `3001`) |
| `FRONTEND_URL` | Frontend URL for CORS (default: `http://localhost:5173`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (default: `http://localhost:3001/api`) |

## Deployment

- **Frontend** → Vercel (`npm run build`, deploy `dist/`)
- **Backend** → Railway (set all env vars in dashboard)
- **Database** → Neon (free PostgreSQL, copy connection string)

## Getting a Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / log in
3. Create an API key
4. Copy it to `GROQ_API_KEY` in `backend/.env`
