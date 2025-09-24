"""Notes and Todos Models for ECS Database

SQLAlchemy models for notes, todos, and related entities in the Reynard ECS system.
These models extend the existing Agent model to provide comprehensive note-taking
and todo management capabilities.
"""

import logging
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship

from app.models.base import Base

logger = logging.getLogger(__name__)

# Association tables for many-to-many relationships
note_tags = Table(
    "note_tags",
    Base.metadata,
    Column(
        "note_id",
        PostgresUUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        PostgresUUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

todo_tags = Table(
    "todo_tags",
    Base.metadata,
    Column(
        "todo_id",
        PostgresUUID(as_uuid=True),
        ForeignKey("todos.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        PostgresUUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Notebook(Base):
    """Notebook model for organizing notes."""

    __tablename__ = "notebooks"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), nullable=False, default="#3b82f6")  # Hex color
    is_public = Column(Boolean, nullable=False, default=False)
    is_archived = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    # Foreign key to Agent (user)
    agent_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    agent = relationship("Agent", back_populates="notebooks")
    notes = relationship(
        "Note", back_populates="notebook", cascade="all, delete-orphan",
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "color": self.color,
            "is_public": self.is_public,
            "is_archived": self.is_archived,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "agent_id": str(self.agent_id),
            "note_count": len(self.notes) if self.notes else 0,
        }

    def __repr__(self) -> str:
        return f"<Notebook(id='{self.id}', title='{self.title}')>"


class Note(Base):
    """Note model for rich text content."""

    __tablename__ = "notes"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False, default="")
    content_type = Column(
        String(20), nullable=False, default="markdown",
    )  # markdown, rich-text, code
    is_favorite = Column(Boolean, nullable=False, default=False)
    is_archived = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    # Foreign keys
    notebook_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("notebooks.id", ondelete="CASCADE"),
        nullable=False,
    )
    agent_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    notebook = relationship("Notebook", back_populates="notes")
    agent = relationship("Agent", back_populates="notes")
    tags = relationship("Tag", secondary="note_tags", back_populates="notes")
    attachments = relationship(
        "NoteAttachment", back_populates="note", cascade="all, delete-orphan",
    )
    collaborations = relationship(
        "NoteCollaboration", back_populates="note", cascade="all, delete-orphan",
    )
    versions = relationship(
        "NoteVersion", back_populates="note", cascade="all, delete-orphan",
    )
    ai_metadata = relationship(
        "AIMetadata", back_populates="note", cascade="all, delete-orphan",
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "id": str(self.id),
            "title": self.title,
            "content": self.content,
            "content_type": self.content_type,
            "is_favorite": self.is_favorite,
            "is_archived": self.is_archived,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "notebook_id": str(self.notebook_id),
            "agent_id": str(self.agent_id),
            "tags": [tag.to_dict() for tag in self.tags] if self.tags else [],
            "attachment_count": len(self.attachments) if self.attachments else 0,
            "collaborator_count": (
                len(self.collaborations) if self.collaborations else 0
            ),
        }

    def __repr__(self) -> str:
        return f"<Note(id='{self.id}', title='{self.title}')>"


class Todo(Base):
    """Todo model for task management."""

    __tablename__ = "todos"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, nullable=False, default=False)
    priority = Column(
        String(10), nullable=False, default="medium",
    )  # low, medium, high, urgent
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    # Foreign key to Agent (user)
    agent_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    agent = relationship("Agent", back_populates="todos")
    tags = relationship("Tag", secondary="todo_tags", back_populates="todos")
    ai_metadata = relationship(
        "AIMetadata", back_populates="todo", cascade="all, delete-orphan",
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "priority": self.priority,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "agent_id": str(self.agent_id),
            "tags": [tag.to_dict() for tag in self.tags] if self.tags else [],
        }

    def mark_completed(self) -> None:
        """Mark todo as completed."""
        self.completed = True
        self.completed_at = datetime.now(UTC)

    def mark_incomplete(self) -> None:
        """Mark todo as incomplete."""
        self.completed = False
        self.completed_at = None

    def __repr__(self) -> str:
        return (
            f"<Todo(id='{self.id}', title='{self.title}', completed={self.completed})>"
        )


class Tag(Base):
    """Tag model for categorizing notes and todos."""

    __tablename__ = "tags"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False)
    color = Column(String(7), nullable=False, default="#6b7280")  # Hex color
    created_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"),
    )

    # Foreign key to Agent (user)
    agent_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    agent = relationship("Agent", back_populates="tags")
    notes = relationship("Note", secondary="note_tags", back_populates="tags")
    todos = relationship("Todo", secondary="todo_tags", back_populates="tags")

    # Unique constraint on name per agent
    __table_args__ = (UniqueConstraint("name", "agent_id", name="uq_tag_name_agent"),)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "id": str(self.id),
            "name": self.name,
            "color": self.color,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "agent_id": str(self.agent_id),
            "note_count": len(self.notes) if self.notes else 0,
            "todo_count": len(self.todos) if self.todos else 0,
        }

    def __repr__(self) -> str:
        return f"<Tag(id='{self.id}', name='{self.name}')>"


class NoteAttachment(Base):
    """Note attachment model for file uploads."""

    __tablename__ = "note_attachments"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"),
    )

    # Foreign key to Note
    note_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    note = relationship("Note", back_populates="attachments")

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "id": str(self.id),
            "filename": self.filename,
            "file_path": self.file_path,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "note_id": str(self.note_id),
        }

    def __repr__(self) -> str:
        return f"<NoteAttachment(id='{self.id}', filename='{self.filename}')>"


class NoteCollaboration(Base):
    """Note collaboration model for sharing notes."""

    __tablename__ = "note_collaborations"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    permission = Column(
        String(20), nullable=False, default="read",
    )  # read, write, admin
    created_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"),
    )

    # Foreign keys
    note_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        nullable=False,
    )
    collaborator_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    note = relationship("Note", back_populates="collaborations")
    collaborator = relationship("Agent", foreign_keys=[collaborator_id])

    # Unique constraint on note and collaborator
    __table_args__ = (
        UniqueConstraint("note_id", "collaborator_id", name="uq_note_collaboration"),
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "id": str(self.id),
            "permission": self.permission,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "note_id": str(self.note_id),
            "collaborator_id": str(self.collaborator_id),
        }

    def __repr__(self) -> str:
        return f"<NoteCollaboration(id='{self.id}', permission='{self.permission}')>"


class NoteVersion(Base):
    """Note version model for history tracking."""

    __tablename__ = "note_versions"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    content_type = Column(String(20), nullable=False)
    version_number = Column(Integer, nullable=False)
    change_summary = Column(String(500), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"),
    )

    # Foreign keys
    note_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        nullable=False,
    )
    agent_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    note = relationship("Note", back_populates="versions")
    agent = relationship("Agent", foreign_keys=[agent_id])

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "id": str(self.id),
            "title": self.title,
            "content": self.content,
            "content_type": self.content_type,
            "version_number": self.version_number,
            "change_summary": self.change_summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "note_id": str(self.note_id),
            "agent_id": str(self.agent_id),
        }

    def __repr__(self) -> str:
        return f"<NoteVersion(id='{self.id}', version={self.version_number})>"


class AIMetadata(Base):
    """AI metadata model for AI-generated content."""

    __tablename__ = "ai_metadata"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    entity_type = Column(String(20), nullable=False)  # note, todo, notebook
    entity_id = Column(PostgresUUID(as_uuid=True), nullable=False)
    ai_type = Column(String(50), nullable=False)  # summary, tags, categorization, etc.
    ai_data = Column(JSON, nullable=False)
    confidence_score = Column(Float, nullable=True)
    model_used = Column(String(100), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"),
    )

    # Foreign key to Agent (user)
    agent_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    agent = relationship("Agent", back_populates="ai_metadata")
    note = relationship(
        "Note",
        back_populates="ai_metadata",
        foreign_keys=[entity_id],
        primaryjoin="and_(AIMetadata.entity_type == 'note', AIMetadata.entity_id == Note.id)",
    )
    todo = relationship(
        "Todo",
        back_populates="ai_metadata",
        foreign_keys=[entity_id],
        primaryjoin="and_(AIMetadata.entity_type == 'todo', AIMetadata.entity_id == Todo.id)",
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "id": str(self.id),
            "entity_type": self.entity_type,
            "entity_id": str(self.entity_id),
            "ai_type": self.ai_type,
            "ai_data": self.ai_data,
            "confidence_score": self.confidence_score,
            "model_used": self.model_used,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "agent_id": str(self.agent_id),
        }

    def __repr__(self) -> str:
        return f"<AIMetadata(id='{self.id}', entity_type='{self.entity_type}', ai_type='{self.ai_type}')>"
