from contextlib import asynccontextmanager
from typing import Optional, List
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from schemas import (
    IssueCreate,
    IssueUpdate,
    IssueResponse,
    IssueListResponse,
    StatusUpdate,
    CommentCreate,
    CommentResponse,
    UserCreate,
    UserResponse,
    Status,
)
import crud


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI(
    title="Bug Tracker Lite",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return crud.get_users(db)


@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user.name)


@app.get("/issues", response_model=List[IssueListResponse])
def list_issues(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assignee_id: Optional[str] = Query(None),
    q: Optional[str] = Query(None, description="Search keyword"),
    db: Session = Depends(get_db),
):
    return crud.get_issues(db, status=status, priority=priority, assignee_id=assignee_id, search=q)


@app.post("/issues", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
def create_issue(issue: IssueCreate, db: Session = Depends(get_db)):
    if issue.assignee_id:
        assignee = crud.get_user(db, issue.assignee_id)
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")
    return crud.create_issue(db, issue)


@app.get("/issues/{issue_id}", response_model=IssueResponse)
def get_issue(issue_id: str, db: Session = Depends(get_db)):
    issue = crud.get_issue(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@app.put("/issues/{issue_id}", response_model=IssueResponse)
def update_issue(issue_id: str, data: IssueUpdate, db: Session = Depends(get_db)):
    issue = crud.get_issue(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if data.assignee_id:
        assignee = crud.get_user(db, data.assignee_id)
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")
    return crud.update_issue(db, issue, data)


@app.delete("/issues/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(issue_id: str, db: Session = Depends(get_db)):
    issue = crud.get_issue(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    crud.delete_issue(db, issue)
    return None


@app.post("/issues/{issue_id}/status", response_model=IssueResponse)
def transition_status(issue_id: str, data: StatusUpdate, db: Session = Depends(get_db)):
    issue = crud.get_issue(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    try:
        return crud.transition_issue_status(db, issue, data.status)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@app.get("/issues/{issue_id}/comments", response_model=List[CommentResponse])
def list_comments(issue_id: str, db: Session = Depends(get_db)):
    issue = crud.get_issue(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue.comments


@app.post("/issues/{issue_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(issue_id: str, data: CommentCreate, db: Session = Depends(get_db)):
    issue = crud.get_issue(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if data.author_id:
        author = crud.get_user(db, data.author_id)
        if not author:
            raise HTTPException(status_code=404, detail="Author not found")
    return crud.create_comment(db, issue, data)


@app.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: str, db: Session = Depends(get_db)):
    comment = crud.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    crud.delete_comment(db, comment)
    return None
