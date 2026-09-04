# Bug Tracker Lite — Smoke Test Report

**Date:** 2026-09-04
**Tester:** cdf smoke-test agent
**Verdict: PASS** — happy path verified end to end (API live, unit tests, frontend build + dev server).

## Environment

- Backend: FastAPI on Python 3.11 (venv), booted with `uvicorn main:app --reload --port 5050` per PRD.
- Database: SQLite (`backend/bugtracker.db`), seeded via `backend/seed.py`.
- Frontend: Vite + React 18, deps installed with bun; `bun run dev` serves on port 5173.
- Deps installed fresh from `backend/requirements.txt` (fastapi 0.111, pydantic 2.7, sqlalchemy 2.0.30).

## Results

### Boot & Infrastructure
| Check | Result |
|---|---|
| Seed script (`python seed.py`) | ✅ 3 users, 5 issues seeded (idempotent) |
| `uvicorn main:app --reload` on :5050 | ✅ boots cleanly |
| OpenAPI docs at `/docs` and `/openapi.json` | ✅ HTTP 200 |
| `npm run dev` (Vite on :5173) | ✅ serves index.html |
| `bun run build` (production build) | ✅ 44 modules, built in 523ms |
| CORS preflight `OPTIONS /issues` from origin :5173 | ✅ 200, `Access-Control-Allow-Origin` echoed |

### Backend unit tests
- `pytest backend/tests/` → **20 passed** in 0.56s.

### API Happy Path (live curl against :5050)
| Check | Result |
|---|---|
| GET /users | ✅ 3 users, UUID ids, ISO 8601 `created_at` |
| GET /issues | ✅ 5 seeded issues returned |
| POST /issues → 201, `status` defaults to `open`, UUID id | ✅ |
| POST /issues with empty title | ✅ rejected 422 (never reaches DB) |
| PUT /issues/:id partial update (`{"priority":"critical"}`) | ✅ only priority changed; title/reporter untouched |
| GET /issues/does-not-exist | ✅ 404 with JSON `{"detail":"Issue not found"}` |
| POST /issues/:id/status open→in_progress | ✅ 200 |
| POST /issues/:id/status open→resolved (invalid per state machine) | ✅ 422 with descriptive detail |
| in_progress→open (re-open) | ✅ 200 |
| resolved→closed | ✅ 200 |
| closed→open (terminal state) | ✅ 422 `Invalid transition from 'closed' to 'open'` |
| Comments: POST x2, GET order | ✅ returned in ascending creation order |
| POST comment with empty body | ✅ 422 |
| Filters: `?status=open`, `?priority=critical` | ✅ correct subsets |
| Combined filters `?status=open&priority=critical` | ✅ exact match |
| Assignee filter `?assignee_id=<uuid>` | ✅ correct subset |
| Keyword search `?q=safari` | ✅ matched title only where expected |
| DELETE /issues/:id | ✅ 204; subsequent GET → 404 |
| Cascade delete | ✅ 0 orphan `comments` rows remain in SQLite after delete |
| Response time GET /issues ×3 | ✅ ~1.5–2 ms (≪ 300 ms NFR) |

### Frontend (code-level verification against ACs)
| AC | Check | Result |
|---|---|---|
| AC-01 | `IssueForm` validates `title.trim()` and `reporter.trim()` before any API call | ✅ |
| AC-02 | `api.getIssues` forwards status/priority/assignee_id/q params | ✅ |
| AC-04 | `IssueDetail` defines the PRD state machine client-side and renders only valid next statuses; `closed → []` so no transition controls | ✅ |
| AC-05 | `IssueDetail` rejects empty comment body client-side (`commentBody.trim()`); appends without reload | ✅ |
| AC-06 | Delete gated behind `window.confirm(...)`; navigates back to list | ✅ |
| NFR | `Loading` and `ErrorMessage` components used; cancelled-flag guards in effects (no unhandled rejections) | ✅ |

## Notes / Observations (non-blocking)

1. `crud.update_issue` contains a no-op `if "status" not in updates: pass` branch — dead code, harmless.
2. One smoke-test command initially mislabeled in_progress→resolved as "invalid"; re-verified the true invalid case (open→resolved) separately — correctly rejected with 422.
3. Vite dev server needed a `bun install` first (node_modules not committed) — expected.

## Conclusion

All PRD acceptance criteria that are verifiable without a real browser pass: creation defaults to `open`, the status state machine is enforced exactly as specified (422 on invalid transitions, closed terminal), partial updates preserve untouched fields, comments are ordered and cascade-deleted with their issue, filters/search combine correctly, IDs are UUIDs, timestamps are ISO 8601, and error responses follow `{"detail": "..."}`. The frontend builds cleanly and its client-side validation/UX guards match the PRD.
