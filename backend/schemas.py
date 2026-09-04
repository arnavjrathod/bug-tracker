from datetime import datetime
from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, Field, field_validator, ConfigDict


class Status(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Severity(str, Enum):
    MINOR = "minor"
    NORMAL = "normal"
    MAJOR = "major"
    CRITICAL = "critical"


# Valid status transitions from PRD state machine
VALID_TRANSITIONS: dict[Status, set[Status]] = {
    Status.OPEN: {Status.IN_PROGRESS, Status.CLOSED},
    Status.IN_PROGRESS: {Status.RESOLVED, Status.OPEN},
    Status.RESOLVED: {Status.CLOSED, Status.OPEN},
    Status.CLOSED: set(),
}


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime


class CommentBase(BaseModel):
    body: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    author_id: Optional[str] = None


class CommentResponse(CommentBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    issue_id: str
    author_id: Optional[str]
    body: str
    created_at: datetime


class CommentWithAuthor(CommentResponse):
    author: Optional[UserResponse] = None


class IssueBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=0)
    priority: Priority = Priority.MEDIUM
    severity: Severity = Severity.NORMAL
    reporter: str = Field(..., min_length=1, max_length=255)
    assignee_id: Optional[str] = None


class IssueCreate(IssueBase):
    pass


class IssueUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    priority: Optional[Priority] = None
    severity: Optional[Severity] = None
    reporter: Optional[str] = Field(None, min_length=1, max_length=255)
    assignee_id: Optional[str] = None

    @field_validator("assignee_id")
    @classmethod
    def empty_assignee_is_none(cls, v):
        if v == "":
            return None
        return v


class StatusUpdate(BaseModel):
    status: Status


class IssueResponse(IssueBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: Status
    created_at: datetime
    updated_at: datetime
    comments: List[CommentWithAuthor] = []


class IssueListResponse(IssueBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: Status
    created_at: datetime
    updated_at: datetime
