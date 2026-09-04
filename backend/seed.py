"""Seed the Bug Tracker Lite database with sample users and issues."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, Base, engine, User, Issue
from schemas import Status
import crud


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users = []
        for name in ["Alice Dev", "Bob Lead", "Carol QA"]:
            existing = db.query(User).filter(User.name == name).first()
            if existing:
                users.append(existing)
            else:
                users.append(crud.create_user(db, name))

        issues = [
            {
                "title": "Login form fails on Safari",
                "description": "Users report that the login button does nothing in Safari 17.",
                "priority": "high",
                "severity": "major",
                "reporter": "Carol QA",
                "assignee_id": users[0].id,
                "status": Status.IN_PROGRESS.value,
            },
            {
                "title": "Dark mode toggle not persisted",
                "description": "Theme resets to light on page refresh.",
                "priority": "low",
                "severity": "minor",
                "reporter": "Alice Dev",
                "assignee_id": users[1].id,
                "status": Status.OPEN.value,
            },
            {
                "title": "API returns 500 for invalid issue id",
                "description": "The backend should return 404 instead of 500.",
                "priority": "critical",
                "severity": "critical",
                "reporter": "Bob Lead",
                "assignee_id": users[0].id,
                "status": Status.RESOLVED.value,
            },
            {
                "title": "Footer copyright year is 2025",
                "description": "Should be updated to the current year.",
                "priority": "low",
                "severity": "minor",
                "reporter": "Carol QA",
                "assignee_id": None,
                "status": Status.CLOSED.value,
            },
            {
                "title": "Comment thread overflows container",
                "description": "Long comments break the layout on the issue detail page.",
                "priority": "medium",
                "severity": "normal",
                "reporter": "Alice Dev",
                "assignee_id": users[1].id,
                "status": Status.OPEN.value,
            },
        ]

        for i_data in issues:
            existing = db.query(Issue).filter(Issue.title == i_data["title"]).first()
            if existing:
                continue
            issue = Issue(**i_data)
            db.add(issue)
            db.commit()
            db.refresh(issue)

            if i_data["status"] != Status.CLOSED.value:
                crud.create_comment(
                    db,
                    issue,
                    crud.CommentCreate(
                        author_id=users[0].id,
                        body=f"Initial triage note for '{issue.title}'.",
                    ),
                )
        print("Seeded database.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
