# Bug Tracker Lite

Bug Tracker Lite is a lightweight issue-tracking application. It provides a FastAPI-powered REST API backend and a React frontend for creating, updating, filtering, and commenting on bug issues.

## Features

- Create, read, update, and delete bug issues.
- Filter issues by status, priority, assignee, or free-text search.
- Status transitions following a simple state machine: open ↔ in_progress, open/resolved/in_progress → closed, etc.
- Add and delete comments on issues.
- SQLite database managed via SQLAlchemy.
- React frontend served by Vite.

## Project Layout

```
.
├── backend/           # FastAPI application
│   ├── main.py        # API routes
│   ├── database.py    # SQLAlchemy models and engine
│   ├── crud.py        # Database operations
│   ├── schemas.py     # Pydantic request/response models
│   ├── seed.py        # Sample data seeding script
│   ├── requirements.txt
│   └── tests/         # pytest unit tests
└── frontend/          # React + Vite application
    └── package.json
```

## Prerequisites

- [uv](https://docs.astral.sh/uv/) — a fast Python package manager and virtual environment tool.
- Node.js and npm (for the frontend).

## Backend Setup

All backend commands are run from the `backend/` directory.

```bash
cd backend

# Create a virtual environment
uv venv

# Install dependencies using uv
uv pip install -r requirements.txt

# (Optional) Seed the SQLite database with sample users and issues
uv run seed.py

# Start the FastAPI development server
uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://127.0.0.1:8000`. Interactive API docs are exposed at `/docs`.

## Run Backend Tests

```bash
cd backend
uv run pytest tests/test_api.py -v
```

## Frontend Setup

All frontend commands are run from the `frontend/` directory.

```bash
cd frontend

npm install
npm run dev
```

The frontend dev server typically starts at `http://localhost:5173` and expects the backend running on `http://127.0.0.1:8000`.
