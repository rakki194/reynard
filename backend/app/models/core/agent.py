"""Core Agent model for Reynard Backend.

This model represents the main Agent entity used throughout the application.
It's separate from the ECS Agent model which is specific to the ECS simulation system.
"""

import logging
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship

from app.models.base import Base

logger = logging.getLogger(__name__)


class Agent(Base):
    """Core Agent model for the main database.

    This represents a user/agent in the Reynard system, separate from
    the ECS simulation agents. Used for authentication, notes, todos, etc.
    """

    __tablename__ = "agents"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True, unique=True, index=True)
    spirit = Column(String(100), nullable=True, index=True)
    style = Column(String(100), nullable=True)
    generation = Column(String(50), nullable=True)
    active = Column(Boolean, default=True, index=True)
    is_system_agent = Column(Boolean, default=False)
    preferences = Column(Text, nullable=True)  # JSON string for preferences
    created_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )
    last_activity = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
    )

    # Relationships - these will be defined in the related models
    # to avoid circular imports
    notebooks = relationship("Notebook", back_populates="agent")
    notes = relationship("Note", back_populates="agent")
    todos = relationship("Todo", back_populates="agent")
    tags = relationship("Tag", back_populates="agent")
    ai_metadata = relationship("AIMetadata", back_populates="agent")

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "id": str(self.id),
            "agent_id": self.agent_id,
            "name": self.name,
            "email": self.email,
            "spirit": self.spirit,
            "style": self.style,
            "generation": self.generation,
            "active": self.active,
            "is_system_agent": self.is_system_agent,
            "preferences": self.preferences,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_activity": (
                self.last_activity.isoformat() if self.last_activity else None
            ),
        }

    def __repr__(self) -> str:
        return (
            f"<Agent(id='{self.id}', agent_id='{self.agent_id}', name='{self.name}')>"
        )
