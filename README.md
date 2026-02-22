# SchemaSense AI

A database intelligence platform that connects to your PostgreSQL database, analyzes schema and data quality, and uses AI to generate business-friendly documentation through a conversational interface.

## Features

- **Database Connection Management** -- Connect multiple PostgreSQL databases, switch between them, and manage connections from a single dashboard.
- **Schema Analysis** -- Automatically discovers all tables, columns, types, primary keys, and row counts with a visual breakdown.
- **Data Quality Scoring** -- Runs completeness, consistency, validity, accuracy, and timeliness checks per column and assigns an overall quality grade.
- **AI Chat** -- Ask natural language questions about your database schema and get streamed, markdown-formatted responses powered by DeepSeek.
- **AI Table Explanations** -- Generates business context for each table, cached in SQLite so repeated requests are instant.
- **Export** -- Download schema documentation as JSON, Markdown, or a formatted PDF report. All exports reuse the cached AI analysis.
- **Activity Tracking** -- Logs database connections, analyses, AI queries, and exports in a recent activity timeline.
- **Demo Mode** -- One-click demo button pre-fills credentials for a sample e-commerce database to try the platform instantly.

## Tech Stack

- **Frontend** -- Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend** -- Python, FastAPI, asyncpg, Pydantic
- **AI** -- DeepSeek API for chat and table explanations
- **Database** -- PostgreSQL (user databases), SQLite (explanation and chat cache)
- **PDF Generation** -- fpdf2

## Project Structure

```
app/                    Next.js pages (dashboard, analysis, chat, exports, etc.)
components/             Reusable UI components (sidebar, markdown renderer, etc.)
hooks/                  React hooks (useChat, useDatabase, useDashboard)
lib/                    API client, utilities
backend/
  routes/               FastAPI route handlers
  utils/                Database, cache, activity, AI client, PDF generator
  schemas/              Pydantic request/response models
  config.py             Environment configuration
  main.py               FastAPI app entry point
```

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # add your DEEPSEEK_API_KEY
python main.py
```

The backend runs on port 8000 by default.

### Frontend

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

The frontend runs on port 3000 by default.

## Environment Variables

### Backend (.env)

| Variable | Description |
|---|---|
| DEEPSEEK_API_KEY | API key for DeepSeek AI |
| API_HOST | Host to bind (default: 0.0.0.0) |
| API_PORT | Port to bind (default: 8000) |
| CORS_ORIGINS | Comma-separated allowed origins |

### Frontend (.env.local)

| Variable | Description |
|---|---|
| NEXT_PUBLIC_API_URL | Backend URL (default: http://localhost:8000) |

## License

MIT