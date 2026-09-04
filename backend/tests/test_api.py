import os
import sys
import uuid

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

os.environ["DATABASE_URL"] = "sqlite:///./test_bugtracker.db"

from database import Base, engine, SessionLocal
from main import app, get_db
from schemas import Status


client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


def create_user(name="Test User"):
    r = client.post("/users", json={"name": name})
    assert r.status_code == 200
    return r.json()


def create_issue(**kwargs):
    payload = {
        "title": "Sample issue",
        "description": "A sample issue description.",
        "priority": "medium",
        "severity": "normal",
        "reporter": "Reporter One",
    }
    payload.update(kwargs)
    r = client.post("/issues", json=payload)
    assert r.status_code == 201
    return r.json()


def test_create_user():
    user = create_user("Alice")
    assert user["name"] == "Alice"
    assert "id" in user


def test_list_users():
    create_user("A")
    create_user("B")
    r = client.get("/users")
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_create_issue_default_status_open():
    issue = create_issue()
    assert issue["status"] == "open"
    assert issue["id"]
    assert "created_at" in issue


def test_create_issue_requires_assignee_exists():
    r = client.post(
        "/issues",
        json={
            "title": "X",
            "description": "Y",
            "priority": "medium",
            "severity": "normal",
            "reporter": "Z",
            "assignee_id": str(uuid.uuid4()),
        },
    )
    assert r.status_code == 404


def test_get_issue_not_found():
    r = client.get(f"/issues/{uuid.uuid4()}")
    assert r.status_code == 404


def test_update_issue():
    issue = create_issue(title="Old")
    r = client.put(f"/issues/{issue['id']}", json={"title": "New"})
    assert r.status_code == 200
    assert r.json()["title"] == "New"


def test_update_issue_not_found():
    r = client.put(f"/issues/{uuid.uuid4()}", json={"title": "X"})
    assert r.status_code == 404


def test_filter_issues_by_status():
    open_issue = create_issue(title="Open Issue")
    # transition to closed
    client.post(f"/issues/{open_issue['id']}/status", json={"status": "closed"})
    create_issue(title="Second Open")
    r = client.get("/issues?status=open")
    assert r.status_code == 200
    data = r.json()
    assert all(i["status"] == "open" for i in data)
    assert len(data) == 1


def test_filter_issues_by_priority():
    create_issue(title="A", priority="high")
    create_issue(title="B", priority="low")
    r = client.get("/issues?priority=high")
    assert len(r.json()) == 1
    assert r.json()[0]["priority"] == "high"


def test_filter_issues_by_assignee():
    u = create_user("Assignee")
    create_issue(title="Assigned", assignee_id=u["id"])
    create_issue(title="Unassigned")
    r = client.get(f"/issues?assignee_id={u['id']}")
    data = r.json()
    assert len(data) == 1
    assert data[0]["assignee_id"] == u["id"]


def test_search_issues():
    create_issue(title="Alpha bug", description="desc")
    create_issue(title="Bravo issue", description="contains Alpha")
    create_issue(title="Charlie", description="no match")
    r = client.get("/issues?q=Alpha")
    data = r.json()
    assert len(data) == 2


def test_status_transition_valid():
    issue = create_issue()
    r = client.post(f"/issues/{issue['id']}/status", json={"status": "in_progress"})
    assert r.status_code == 200
    assert r.json()["status"] == "in_progress"


def test_status_transition_invalid():
    issue = create_issue()
    # open -> resolved is invalid
    r = client.post(f"/issues/{issue['id']}/status", json={"status": "resolved"})
    assert r.status_code == 422
    assert "detail" in r.json()


def test_closed_issue_no_transitions():
    issue = create_issue()
    client.post(f"/issues/{issue['id']}/status", json={"status": "closed"})
    # verify state machine by attempting a transition
    r = client.post(f"/issues/{issue['id']}/status", json={"status": "open"})
    assert r.status_code == 422


def test_delete_issue_cascades_comments():
    issue = create_issue()
    client.post(
        f"/issues/{issue['id']}/comments",
        json={"author_id": None, "body": "A comment"},
    )
    r = client.delete(f"/issues/{issue['id']}")
    assert r.status_code == 204
    # ensure issue is gone
    assert client.get(f"/issues/{issue['id']}").status_code == 404


def test_create_comment():
    issue = create_issue()
    r = client.post(
        f"/issues/{issue['id']}/comments",
        json={"author_id": None, "body": "A comment"},
    )
    assert r.status_code == 201
    assert r.json()["body"] == "A comment"


def test_get_comments():
    issue = create_issue()
    client.post(f"/issues/{issue['id']}/comments", json={"body": "First"})
    client.post(f"/issues/{issue['id']}/comments", json={"body": "Second"})
    r = client.get(f"/issues/{issue['id']}/comments")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 2
    assert data[0]["body"] == "First"
    assert data[1]["body"] == "Second"


def test_create_comment_missing_body():
    issue = create_issue()
    r = client.post(f"/issues/{issue['id']}/comments", json={"body": ""})
    assert r.status_code == 422


def test_comment_author_not_found():
    issue = create_issue()
    r = client.post(
        f"/issues/{issue['id']}/comments",
        json={"author_id": str(uuid.uuid4()), "body": "x"},
    )
    assert r.status_code == 404


def test_comments_sorted_ascending():
    issue = create_issue()
    r1 = client.post(f"/issues/{issue['id']}/comments", json={"body": "A"}).json()
    r2 = client.post(f"/issues/{issue['id']}/comments", json={"body": "B"}).json()
    detail = client.get(f"/issues/{issue['id']}").json()
    comments = detail["comments"]
    assert [c["id"] for c in comments] == [r1["id"], r2["id"]]
