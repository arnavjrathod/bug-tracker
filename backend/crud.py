from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from database import Issue, Comment, User, utcnow
from schemas import (
    IssueCreate,
    IssueUpdate,
    StatusUpdate,
    CommentCreate,
    Status,
    VALID_TRANSITIONS,
)


def get_users(db: Session) -> List[User]:
    return db.query(User).order_by(User.name).all()


def get_user(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, name: str) -> User:
    user = User(name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_issues(
    db: Session,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee_id: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Issue]:
    query = db.query(Issue).order_by(Issue.created_at.desc())
    if status:
        query = query.filter(Issue.status == status)
    if priority:
        query = query.filter(Issue.priority == priority)
    if assignee_id:
        query = query.filter(Issue.assignee_id == assignee_id)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Issue.title.ilike(like), Issue.description.ilike(like)))
    return query.all()


def get_issue(db: Session, issue_id: str) -> Optional[Issue]:
    return (
        db.query(Issue)
        .options(joinedload(Issue.comments).joinedload(Comment.author))
        .filter(Issue.id == issue_id)
        .first()
    )


def create_issue(db: Session, data: IssueCreate) -> Issue:
    issue = Issue(
        title=data.title,
        description=data.description,
        priority=data.priority.value,
        severity=data.severity.value,
        reporter=data.reporter,
        assignee_id=data.assignee_id,
        status=Status.OPEN.value,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


def update_issue(db: Session, issue: Issue, data: IssueUpdate) -> Issue:
    updates = data.model_dump(exclude_unset=True)
    if "priority" in updates:
        updates["priority"] = updates["priority"].value
    if "severity" in updates:
        updates["severity"] = updates["severity"].value
    if "status" not in updates:
        # update timestamp manually because no onupdate for status field
        pass
    for key, value in updates.items():
        setattr(issue, key, value)
    issue.updated_at = utcnow()
    db.commit()
    db.refresh(issue)
    return issue


def transition_issue_status(db: Session, issue: Issue, new_status: Status) -> Issue:
    current = Status(issue.status)
    if new_status not in VALID_TRANSITIONS[current]:
        raise ValueError(
            f"Invalid transition from '{current.value}' to '{new_status.value}'"
        )
    issue.status = new_status.value
    issue.updated_at = utcnow()
    db.commit()
    db.refresh(issue)
    return issue


def delete_issue(db: Session, issue: Issue) -> None:
    db.delete(issue)
    db.commit()


def create_comment(db: Session, issue: Issue, data: CommentCreate) -> Comment:
    comment = Comment(
        issue_id=issue.id,
        author_id=data.author_id,
        body=data.body,
    )
    db.add(comment)
    issue.updated_at = utcnow()
    db.commit()
    db.refresh(comment)
    return comment


def get_comment(db: Session, comment_id: str) -> Optional[Comment]:
    return db.query(Comment).filter(Comment.id == comment_id).first()


def delete_comment(db: Session, comment: Comment) -> None:
    db.delete(comment)
    db.commit()
