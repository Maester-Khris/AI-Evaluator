# AI Evaluator App

A high-performance, single-page AI Chat interface designed for AI/LLMs outputs evaluation. Built with a focus on senior-level architecture, modularity, and scalability.

## Project Scope & Purpose
The **AI Evaluator** serves as a specialized chat interface for people who want to overlook whats Artificial intelligence tools re feeding us. It allows for real-time interaction with an AI agent (backed by Node.js/Python) to evaluate the quality of output, relevance and logic reasoning during conversation with an automated tool.

## The Challenge
- **High Velocity:** Transitioning from an Angular/Node background to a production-ready React setup within a 24-hour sprint.
- **State Management:** Implementing clean state colocation without the overhead of heavy global state libraries.
- **AI UX:** Creating a "Gemini-style" 2-layer layout with responsive sidebars and auto-expanding text areas.

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