# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Align** is a full-stack AI-powered resume/cover letter SaaS application. Users authenticate via Firebase, upload their resume and a job description, and the app uses the Claude API to generate tailored resumes, cover letters, and interview prep materials. Monetization uses Stripe with 4 subscription tiers.

## Commands

### Frontend (React + Vite)
```bash
cd Frontend
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (Express.js)
```bash
cd Backend
npm install
npm start          # Production (PORT 3000)
npm run dev        # Development with nodemon — http://localhost:3000
```

## Architecture

### Stack
- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Firebase Auth, Stripe.js
- **Backend:** Express.js, Firebase Admin SDK, PostgreSQL (`pg`), Stripe, Axios
- **AI:** Claude API (primary — resumes, cover letters, questions), Perplexity API (supplementary)
- **Auth:** Firebase Google OAuth on the frontend; backend validates Firebase UIDs against PostgreSQL
- **Payments:** Stripe Checkout sessions; subscription tier stored in PostgreSQL

### Request Flow
```
React (Frontend) → Express (Backend) → Claude/Perplexity APIs
                                      → Stripe API
                                      → PostgreSQL
```

### Frontend Key Files
- `Frontend/src/App.jsx` — Router with protected routes
- `Frontend/src/context/AuthContext.jsx` — Firebase auth state
- `Frontend/src/context/UsageContext.jsx` — Subscription tier, generation limits, upgrade modals
- `Frontend/src/pages/Dashboard.jsx` — Main user page
- `Frontend/src/components/TabsContainer.jsx` — Multi-tab results interface

### Backend Key Files
- `Backend/server.js` — Express app, middleware, route mounting
- `Backend/services/aiService.js` — All Claude/Perplexity calls; system prompts loaded from `.txt` files
- `Backend/services/databaseService.js` — All PostgreSQL operations (users, documents, usage)
- `Backend/services/stripeService.js` — Stripe checkout & subscription management
- `Backend/routes/` — Route handlers: `aiRoutes.js`, `userRoutes.js`, `documentRoutes.js`, `stripeRoutes.js`

### Backend API Routes
- `GET /api/health` — Health check
- `GET /api/users/profile/:firebaseUid` — Fetch user profile & usage
- `POST /api/users/:uid/increment-usage` — Track generation usage
- `POST /api/create-resume` / `POST /api/tailor-resume` — Resume generation
- `POST /api/create-cover-letter` — Cover letter generation
- `POST /api/generate-questions` — Interview questions
- `POST /api/create-checkout-session` — Stripe payment

### Database
PostgreSQL with two main tables:
- **users** — Firebase UID, email, subscription tier, Stripe IDs, monthly usage counters
- **generated_documents** — Document type, content, metadata, per-user

Schema is in `Database/Tables Initialization.sql`. Subscription tiers: `FREEMIUM` (2/mo), `BASIC` (5/mo, $5), `PREMIUM` (10/mo, $10), `PREMIUM_PLUS` (unlimited, $15).

### AI System Prompts
System prompts for Claude are stored as plain text files in the Backend directory:
- `Backend/Resume-Instructions.txt`
- `Backend/Cover-Letter-Instructions.txt`

### Environment Variables
**Backend** (required): `CLAUDE_API_KEY`, `PERPLEXITY_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DB_PASSWORD`, `FIREBASE_SERVICE_ACCOUNT_KEY` (full JSON), `FRONTEND_URLS`

**Frontend** (VITE_ prefixed): Firebase config keys, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_API_URL`

## Commit Rules
- Never add Claude as a co-author in commits (no `Co-Authored-By: Claude` lines)

### Deployment
- Frontend deployed on **Netlify** (`netlify.toml` handles SPA routing, functions in `netlify/functions/`)
- Backend deployed separately; dev URL is `http://localhost:3000`
