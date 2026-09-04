## Repository Context

This is a greenfield project repository with only a `README.md` file indicating it has been initialized.

## Files to Change

1. Create `backend/` directory.
2. Create `frontend/` directory.
3. Implement the REST API using FastAPI in `backend/main.py`.
4. Design React components and pages in `frontend/src/`.
5. Create `frontend/package.json` for dependencies and scripts.
6. Create seed script as `backend/seed.py`.

## Implementation Steps

1. **Set up Backend**
   - Use FastAPI to construct the REST API.
   - Define models using Pydantic.
   - Implement endpoints for issue tracking functionalities.

2. **Create Database Schema**
   - Define schema compatible with both SQLite for local testing and Postgres for production readiness.

3. **Develop Frontend**
   - Use React for building UI components:
     - Navigation bar.
     - Issue List Page.
     - Issue Detail Page.
     - New Issue Form.
     - Edit Issue Form.
   - Use React Query or `useState`/`useEffect` for state management.

4. **Implement Seed Script**
   - Populate the database with initial data using a Python script.
   - Ensure script compatibility with the database schema.

5. **Configure Environment**
   - Set up required configurations for CORS and API documentation.
   - Ensure scripts to start backend and frontend are operational through specified commands.

6. **Testing**
   - Unit tests for individual components and API endpoints.
   - Integration tests ensuring the API performs correctly with the frontend.

7. **Deployment Preparation**
   - Verify that all functionalities are aligned with Postgres compatibility.

## Tests to Run

- API endpoint tests for CRUD operations.
- UI interaction tests using a testing library compatible with React.
- Integration tests to validate communication between React frontend and FastAPI backend.

## Risks

- Ensuring compatibility between SQLite and Postgres may introduce subtle schema issues.
- API performance constraints might require optimization if local hardware response time goals are not met.
- Ensuring all user stories and acceptance criteria are fully implemented can be challenging without a detailed UI/UX prototype.

## Commit Summary

Set up initial implementation plan for Bug Tracker Lite features based on PRD specifications.