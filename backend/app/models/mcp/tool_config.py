#!/usr/bin/env python3
"""
Tool Configuration Database Models
=================================

SQLAlchemy models for MCP tool configuration management.
Provides database schema for tools, categories, and configuration history.

Author: Reynard Development Team
Version: 1.0.0
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class ToolCategoryEnum(str, Enum):
    """Tool category enumeration."""
    AGENT = "AGENT"
    CHARACTER = "CHARACTER"
    ECS = "ECS"
    SOCIAL = "SOCIAL"
    LINTING = "LINTING"
    FORMATTING = "FORMATTING"
    SEARCH = "SEARCH"
    VISUALIZATION = "VISUALIZATION"
    SECURITY = "SECURITY"
    UTILITY = "UTILITY"
    VERSION = "VERSION"
    VSCODE = "VSCODE"
    PLAYWRIGHT = "PLAYWRIGHT"
    MONOLITH = "MONOLITH"
    MANAGEMENT = "MANAGEMENT"
    SECRETS = "SECRETS"
    RESEARCH = "RESEARCH"
    EMAIL = "EMAIL"
    GIT = "GIT"


class ExecutionType(str, Enum):
    """Tool execution type enumeration."""
    SYNC = "sync"
    ASYNC = "async"


class ToolAction(str, Enum):
    """Tool action enumeration for history tracking."""
    CREATED = "created"
    UPDATED = "updated"
    ENABLED = "enabled"
    DISABLED = "disabled"
    DELETED = "deleted"


class ToolCategory(Base):
    """Tool category model."""
    __tablename__ = "tool_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    color = Column(String(7), nullable=True)
    sort_order = Column(Integer, nullable=True)
    is_active = Column(Boolean, nullable=True, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    # Relationships
    tools = relationship("Tool", back_populates="category")


class Tool(Base):
    """Tool model."""
    __tablename__ = "tools"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("tool_categories.id"), nullable=False)
    enabled = Column(Boolean, nullable=False, default=True, index=True)
    description = Column(Text, nullable=False)
    dependencies = Column(JSON, nullable=True)
    config = Column(JSON, nullable=True)
    version = Column(String(20), nullable=False)
    is_system_tool = Column(Boolean, nullable=False, default=False)
    execution_type = Column(String(20), nullable=False, default="sync")
    timeout_seconds = Column(Integer, nullable=True)
    max_concurrent = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    # Relationships
    category = relationship("ToolCategory", back_populates="tools")
    history = relationship("ToolConfigHistory", back_populates="tool")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert tool to dictionary."""
        return {
            "id": str(self.id),
            "name": self.name,
            "category": self.category.name if self.category else None,
            "category_display_name": self.category.display_name if self.category else None,
            "enabled": self.enabled,
            "description": self.description,
            "dependencies": self.dependencies or [],
            "config": self.config or {},
            "version": self.version,
            "is_system_tool": self.is_system_tool,
            "execution_type": self.execution_type,
            "timeout_seconds": self.timeout_seconds,
            "max_concurrent": self.max_concurrent,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ToolConfigHistory(Base):
    """Tool configuration history model."""
    __tablename__ = "tool_config_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tool_id = Column(UUID(as_uuid=True), ForeignKey("tools.id"), nullable=False)
    change_type = Column(String(20), nullable=False)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    changed_by = Column(String(100), nullable=True)
    change_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    # Relationships
    tool = relationship("Tool", back_populates="history")


class ToolConfiguration(Base):
    """Global tool configuration model."""
    __tablename__ = "tool_configuration"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    version = Column(String(20), nullable=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    auto_sync_enabled = Column(Boolean, nullable=False, default=True)
    default_timeout = Column(Integer, nullable=False)
    max_concurrent_tools = Column(Integer, nullable=False)
    cache_ttl_seconds = Column(Integer, nullable=False)
    settings = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)