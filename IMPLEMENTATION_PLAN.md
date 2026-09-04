## Repo Context

This is a greenfield repository with minimal contents. The only file present is a README.md with a placeholder text stating the repository has been initialized.

## Files to Change

- Create new files for the frontend and backend as specified in the PRD, particularly those related to React components, FastAPI endpoints, and database seed scripts.

## Implementation Steps

1. **Frontend Setup:**
   - Initialize a new React application in the `frontend` directory using `create-react-app` or a similar tool.
   - Set up the basic structure with main pages: Issue List, Issue Detail, New Issue, and Edit Issue.
   - Implement common components like the navigation bar, status badges, and priority badges.

2. **Backend Setup:**
   - Set up FastAPI in the `backend` directory.
   - Implement endpoints for issue creation, viewing, editing, deletion, and searching.
   - Define the status state machine to enforce valid transitions.

3. **Database Configuration:**
   - Implement SQLite database setup with SQLAlchemy.
   - Ensure schema compatibility with PostgreSQL.
   - Create a seed script to populate the database with initial users and issues.

4. **API Integration:**
   - Connect the React frontend to the FastAPI backend.
   - Ensure adherence to constraints such as CORS, JSON responses, and status codes.

5. **Testing & Validation:**
   - Conduct unit and integration tests for the API endpoints.
   - Verify frontend components function correctly with mocked data.
   - Confirm end-to-end workflow from issue creation to deletion.

## Tests to Run

- Unit tests for each backend API endpoint to check input validation, status transitions, and response format.
- Component tests for React pages and features, ensuring UI elements behave as expected.
- Integration tests confirming smooth interaction between frontend and backend.

## Risks

- Potential misalignment between React state management and API responses.
- Ensuring SQLite setup doesn't hinder PostgreSQL compatibility.
- Adhering to the performance criteria for API response times might be challenging under certain local setups.
- API versioning or changes could lead to stale documentation or frontend breaks if not managed carefully.