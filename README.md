# AI Evaluator (SaaS)

A focused, developer-oriented README for the AI Evaluator SaaS: a two-service architecture that separates API/domain logic (Node.js + TypeScript + Prisma) from inference (Python + FastAPI).

## System Architecture 

Overview: The system is implemented as two cooperating services:

- **Backend API (Node.js / Express / TypeScript)**
  - Responsibilities: Authentication, persistence (Postgres via Prisma), chat domain logic (conversation and message management), and evaluation workflows.
  - Entry point: `node-evaluator-backend/src/index.ts` (run via `tsx` in development).

- **Inference Service (Python / FastAPI)**
  - Responsibilities: Hosting model inference endpoints (LLMs, embeddings, or other AI providers). The repo contains an inference placeholder (`python-llm-api/`) intended for a FastAPI-based service that exposes inference endpoints to the backend.

Simple ASCII diagram:

```
[Browser SPA] <--HTTP--> [Node.js Backend (Express + Prisma)] <--HTTP--> [Python FastAPI Inference Service]
                             |                                    |
                             |-- Postgres (Persistence) ----------|
```

## Tech Stack & Rationale 

| Layer | Technology | Purpose |
|---|---:|---|
| API | Node.js (ESM), TypeScript | Strong typing, modern ESM workflow, fast developer feedback using `tsx`.
| DB | PostgreSQL | Production-grade DB with JSONB & GIN for message previews and fast queries.
| ORM | Prisma v7 (+ Driver Adapters) | Type-safe DB access. This repo uses the Postgres driver adapter (`@prisma/adapter-pg`) for connection pooling.
| Inference | Python, FastAPI | Lightweight API for model inference; decouples compute from domain logic for scaling and deployment flexibility.

---

## Database & Persistence (Prisma) 

Key details:

- **Prisma version**: v7.x (see `node-evaluator-backend/package.json`).
- **Custom generator path**: The Prisma `generator client` uses a custom `output` path so the generated client is available to the TypeScript runtime in `src/generated/prisma` (generator configured in `schema.prisma`).
- **Driver adapters**: A Postgres adapter (`@prisma/adapter-pg`) is used to plug in a `pg.Pool` for robust connection pooling from `src/config/prisma.ts`.
- **Migrations**: Migrations are present in `node-evaluator-backend/src/prisma/migrations` (SQL migration files are included). For development use `npx prisma migrate dev`. For production migrations use `npx prisma migrate deploy`.

## 🛠 Tech Stack
![React](https://img.shields.io/badge/react-%2320232d.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/shadcn%20ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

## Project Structure
The project follows a **Feature-Based Architecture**, ensuring that logic, components, and types are localized to their domain.

```text
src/
├── common/              # Stateless UI Primitives (Shadcn)
│   └── ui/              # Buttons, Inputs, Textareas
├── features/            # Domain-specific logic
│   └── chat/
│       ├── components/  # ChatSidebar, ChatWindow (Compound), ChatContainer
│       ├── hooks/       # useChat (Logic & API state)
│       └── types.ts     # Domain interfaces (Message, Conversation)
├── layouts/             # Page skeletons
│   └── MainLayout.tsx   # 2-Layer Grid (Sidebar + Content)
├── hooks/               # App-wide utility hooks
└── App.tsx              # Application Entry
```

---

## Key Features — Chat History & Evaluation 

The backend implements a robust, developer-friendly chat model with the following behaviors:

- **Conversation-first model**: Conversations are top-level objects. Each conversation contains ordered messages (chronological by `createdAt`).
- **Sidebar (recency-sorted)**: The UI sidebar lists conversations for a user sorted by `updatedAt DESC`. The backend ensures `updatedAt` is "touched" when a conversation receives a new message so the most recently active conversations surface to the top.
- **Message storage**: `Message.content` is JSONB — supports structured content like code blocks, metadata, and message sub-objects for rich rendering.
- **Save flow (atomic & transactional)**:
  - If the request includes no `conversationId`, the backend uses a nested create to atomically create a `Conversation` and the first `Message` in one DB operation.
  - If the request supplies `conversationId`, the backend uses a transaction to create the new `Message` and update the `Conversation.updatedAt` in an atomic operation.
- **Evaluation workflow**: Messages can be evaluated via `PATCH /api/chat/message/:id/evaluate`. The API updates `rating`, sets `evaluationAt` timestamp, and optionally stores `evaluationComment`.

API (focused) endpoints:

| Endpoint | Method | Purpose |
|---|---:|---|
| POST `/api/chat/message` | POST | Save a message; create conversation (if absent) or append to conversation. Accepts `sender`, `content` (JSON), optional `conversationId`, and `userId` for new conversations.
| PATCH `/api/chat/message/:id/evaluate` | PATCH | Update evaluation fields (`rating`, `evaluationComment`). Sets `evaluationAt`.
| GET `/api/chat/history/:userId` | GET | Return all conversations for a user with messages (messages ordered asc).
| GET `/api/chat/sidebar/:userId` | GET | Return conversation previews (latest message, title, updatedAt) sorted by `updatedAt` desc for sidebar.
| GET `/api/chat/conversation/:id` | GET | Return full conversation with messages ordered asc.

---

## Environment Setup (.env) 

Two services with separate expectations. Keep secrets out of VCS; `.env` is already in `.gitignore`.

Node Backend (`node-evaluator-backend`) — example environment variables:

| Name | Required | Notes |
|---|---:|---|
| DATABASE_URL | yes | Postgres DSN (e.g. `postgresql://user:pass@localhost:5432/dbname?schema=public`). Prisma uses this to connect. `src/config/prisma.ts` resolves `src/.env` when run from source to ensure predictable DB loading.
| JWT_SECRET | yes | JWT signing secret (used for auth tokens).
| PORT | no | Defaults to `3000` if not set.

FastAPI Inference Service (`python-llm-api`) — example variables (implementer-provided):

| Name | Required | Notes |
|---|---:|---|
| FASTAPI_PORT | no | default `8000`.
| INFERENCE_MODEL_URL | yes | Model server or provider endpoint.
| INFERENCE_API_KEY | conditional | If your model provider requires an API key.
| BACKEND_URL | yes | If inference needs to call the backend or be called by it (e.g., webhook URL).

Note: `db-init.sh` is provided to launch a local Postgres Docker instance and prints a sample `DATABASE_URL` for local development.

---

## Development Workflow & Commands

Quick start (local dev):

1. Start Postgres (recommended using provided script):

```bash
./db-init.sh
# This prints a recommended DATABASE_URL you can copy into your .env
```

2. Set environment (example `node-evaluator-backend/src/.env` or root `.env`):

- `DATABASE_URL=postgresql://admin:securepassword123@localhost:5432/aievaluator?schema=public`
- `JWT_SECRET=your_secret_here`
- `PORT=3000`

3. Generate Prisma client and run migrations:

```bash
cd node-evaluator-backend
npx prisma generate              # generate the client (reflects custom generator path)
npm run prisma:migrate          # this runs `npx prisma migrate dev` (development migration)
# For production: npx prisma migrate deploy
```

4. Run backend locally (development):

```bash
npm install
npm run dev                      # uses `tsx` (script: `tsx watch src/index.ts`)
```

Build & production (backend):

```bash
npm run build                    # runs `npx prisma generate && tsc`
npm start                        # runs `node dist/index.ts`
```

FastAPI inference service (example):

- Install: `pip install -r requirements.txt` (requirements should include `fastapi`, `uvicorn`, and model deps).
- Run locally: `uvicorn main:app --reload --port 8000`

---

## Operational Notes & Best Practices 

- **DB indexes**: Ensure GIN indexes on JSONB columns are present in your migration to support fast searches and previews.
- **Connection pooling**: The repo leverages a Postgres pool passed into Prisma via `@prisma/adapter-pg` for production-quality pooling.
- **Separation of concerns**: Keep inference work in the FastAPI service to enable horizontal scaling and different resource profiles (GPU/CPU).
- **Avoid shipping artifacts**: `node_modules` and generated clients are build artifacts and intentionally excluded from the repository.

---

## Useful Files & Locations 

- Backend entry: `node-evaluator-backend/src/index.ts`
- Prisma config: `node-evaluator-backend/src/prisma.config.ts` and schema at `src/generated/prisma/schema.prisma` (generator points to `../generated/prisma`).
- Migrations: `node-evaluator-backend/src/prisma/migrations/`
- DB bootstrap: `db-init.sh` (local Docker-based Postgres)
- Chat domain: `node-evaluator-backend/src/api/chat/*` (routes + service + DAO)

