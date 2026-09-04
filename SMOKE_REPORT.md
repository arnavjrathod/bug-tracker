# Smoke Test Report — Bug Tracker Lite

**Date:** 2026-09-04
**Scope:** Boot the app and verify the happy path following the README's `uv`-based launch steps.
**Result:** ✅ PASS

## Environment

- uv 0.11.32 (`/usr/local/bin/uv`)
- Python 3.11 (managed by `uv venv`)
- bun (frontend package manager; repo has `bun.lock`)

## Backend boot (per README)

Steps executed exactly as documented in `README.md`, from `backend/`:

| Step | Command | Result |
|------|---------|--------|
| Create venv | `uv venv` | ✅ `.venv` created |
| Install deps | `uv pip install -r requirements.txt` | ✅ all packages installed |
| Seed DB | `uv run seed.py` | ✅ "Seeded database." (sample users + issues created) |
| Start server | `uv run uvicorn main:app --host 127.0.0.1 --port 8000` | ✅ startup complete, listening on :8000 |

## API happy path (live server on 127.0.0.1:8000)

| Check | Result |
|-------|--------|
| `GET /users` returns seeded users | ✅ 200 (Alice Dev, Bob Lead, Carol QA) |
| `POST /issues` create issue with assignee | ✅ 200, issue created |
| `GET /issues/{id}` read back | ✅ matches created payload |
| `POST /issues/{id}/status` open → in_progress | ✅ status = `in_progress` |
| `POST /issues/{id}/status` in_progress → resolved | ✅ status = `resolved` (valid per `VALID_TRANSITIONS` in `schemas.py`) |
| `POST /issues/{id}/status` resolved → closed | ✅ status = `closed` |
| `POST /issues/{id}/comments` add comment | ✅ 200, comment persisted |
| `GET /issues?status=...` filter | ✅ correct count |
| `GET /issues?q=...` free-text search | ✅ correct count |
| `DELETE /issues/{id}` | ✅ 204 |
| `GET /docs` OpenAPI UI | ✅ 200 |

Note: the status-transition endpoint is `POST /issues/{id}/status` (not PATCH). A first
probe using PATCH correctly returned 405 — that was a test-script error, not an app bug.

## Backend test suite (per README)

```
uv run pytest tests/test_api.py -v
→ 20 passed, 2 warnings in 0.62s
```

All 20 endpoint tests pass. Warnings are upstream deprecations (starlette/formparsers,
anyio) — not actionable here.

## Frontend boot

Steps executed from `frontend/`:

| Step | Command | Result |
|------|---------|--------|
| Install deps | `bun install` | ✅ 66 packages |
| Dev server | `bun run dev` (vite) | ✅ ready in 159 ms |
| Serve check | `curl http://localhost:5173` | ✅ 200, `<title>Bug Tracker Lite</title>` |

## Conclusion

The `uv`-based backend launch steps in `README.md` are accurate and work end-to-end:
venv creation, dependency install, seeding, server boot, and the test suite. The API
happy path (create → read → transition per the documented state machine → comment →
filter/search → delete) behaves as specified, and the frontend serves correctly.
No defects found.