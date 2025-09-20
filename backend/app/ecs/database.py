"""
ECS Database Models and Connection

PostgreSQL database models and connection management for the ECS world system.
"""

import os
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from uuid import UUID, uuid4

import asyncpg
from sqlalchemy import create_engine, Column, String, Float, Boolean, DateTime, Text, Integer, ForeignKey, UniqueConstraint, text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.sql import func

logger = logging.getLogger(__name__)

# ECS Database configuration
ECS_DATABASE_URL = os.getenv("ECS_DATABASE_URL", "postgresql://postgres:password@localhost:5432/reynard_ecs")

# SQLAlchemy setup
engine = create_engine(ECS_DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Agent(Base):
    """Agent model for PostgreSQL database."""
    __tablename__ = "agents"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    spirit = Column(String(100), nullable=False, index=True)
    style = Column(String(100), nullable=False)
    generation = Column(Integer, default=1)
    active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))
    last_activity = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    # Relationships
    personality_traits = relationship("PersonalityTrait", back_populates="agent", cascade="all, delete-orphan")
    physical_traits = relationship("PhysicalTrait", back_populates="agent", cascade="all, delete-orphan")
    ability_traits = relationship("AbilityTrait", back_populates="agent", cascade="all, delete-orphan")
    position = relationship("AgentPosition", back_populates="agent", uselist=False, cascade="all, delete-orphan")
    interactions_sent = relationship("AgentInteraction", foreign_keys="AgentInteraction.sender_id", back_populates="sender")
    interactions_received = relationship("AgentInteraction", foreign_keys="AgentInteraction.receiver_id", back_populates="receiver")
    achievements = relationship("AgentAchievement", back_populates="agent", cascade="all, delete-orphan")
    specializations = relationship("AgentSpecialization", back_populates="agent", cascade="all, delete-orphan")
    domain_expertise = relationship("AgentDomainExpertise", back_populates="agent", cascade="all, delete-orphan")
    workflow_preferences = relationship("AgentWorkflowPreference", back_populates="agent", cascade="all, delete-orphan")
    knowledge_base_entries = relationship("KnowledgeBaseEntry", back_populates="agent", cascade="all, delete-orphan")
    performance_metrics = relationship("PerformanceMetric", back_populates="agent", cascade="all, delete-orphan")


class PersonalityTrait(Base):
    """Personality traits for agents."""
    __tablename__ = "personality_traits"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    trait_name = Column(String(100), nullable=False)
    trait_value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    agent = relationship("Agent", back_populates="personality_traits")
    __table_args__ = (UniqueConstraint('agent_id', 'trait_name', name='uq_agent_personality_trait'),)


class PhysicalTrait(Base):
    """Physical traits for agents."""
    __tablename__ = "physical_traits"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    trait_name = Column(String(100), nullable=False)
    trait_value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    agent = relationship("Agent", back_populates="physical_traits")
    __table_args__ = (UniqueConstraint('agent_id', 'trait_name', name='uq_agent_physical_trait'),)


class AbilityTrait(Base):
    """Ability traits for agents."""
    __tablename__ = "ability_traits"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    trait_name = Column(String(100), nullable=False)
    trait_value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    agent = relationship("Agent", back_populates="ability_traits")
    __table_args__ = (UniqueConstraint('agent_id', 'trait_name', name='uq_agent_ability_trait'),)


class AgentPosition(Base):
    """Agent position and movement data."""
    __tablename__ = "agent_positions"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, unique=True)
    x = Column(Float, default=0.0)
    y = Column(Float, default=0.0)
    target_x = Column(Float, default=0.0)
    target_y = Column(Float, default=0.0)
    velocity_x = Column(Float, default=0.0)
    velocity_y = Column(Float, default=0.0)
    movement_speed = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    agent = relationship("Agent", back_populates="position")


class AgentInteraction(Base):
    """Agent interactions and messages."""
    __tablename__ = "agent_interactions"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    sender_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    interaction_type = Column(String(100), nullable=False)
    message = Column(Text)
    energy_level = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    sender = relationship("Agent", foreign_keys=[sender_id], back_populates="interactions_sent")
    receiver = relationship("Agent", foreign_keys=[receiver_id], back_populates="interactions_received")


class AgentAchievement(Base):
    """Agent achievements."""
    __tablename__ = "agent_achievements"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    achievement_name = Column(String(255), nullable=False)
    achievement_description = Column(Text)
    achieved_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    agent = relationship("Agent", back_populates="achievements")


class AgentSpecialization(Base):
    """Agent specializations."""
    __tablename__ = "agent_specializations"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    specialization = Column(String(255), nullable=False)
    proficiency = Column(Float, default=0.5)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    agent = relationship("Agent", back_populates="specializations")
    __table_args__ = (UniqueConstraint('agent_id', 'specialization', name='uq_agent_specialization'),)


class AgentDomainExpertise(Base):
    """Agent domain expertise."""
    __tablename__ = "agent_domain_expertise"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String(255), nullable=False)
    expertise_level = Column(Float, default=0.5)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    agent = relationship("Agent", back_populates="domain_expertise")
    __table_args__ = (UniqueConstraint('agent_id', 'domain', name='uq_agent_domain'),)


class AgentWorkflowPreference(Base):
    """Agent workflow preferences."""
    __tablename__ = "agent_workflow_preferences"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    preference_name = Column(String(100), nullable=False)
    preference_value = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    agent = relationship("Agent", back_populates="workflow_preferences")
    __table_args__ = (UniqueConstraint('agent_id', 'preference_name', name='uq_agent_workflow_preference'),)


class ECSDatabase:
    """ECS Database manager for PostgreSQL operations."""

    def __init__(self):
        """Initialize the database connection."""
        self.engine = engine
        self.SessionLocal = SessionLocal

    def get_session(self) -> Session:
        """Get a database session."""
        return self.SessionLocal()

    async def create_tables(self):
        """Create all database tables."""
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("✅ ECS database tables created successfully")
        except Exception as e:
            logger.error(f"❌ Failed to create ECS database tables: {e}")
            raise

    def create_tables_sync(self):
        """Create all database tables synchronously."""
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("✅ ECS database tables created successfully")
        except Exception as e:
            logger.error(f"❌ Failed to create ECS database tables: {e}")
            raise

    async def health_check(self) -> bool:
        """Check database health."""
        try:
            with self.get_session() as session:
                session.execute(text("SELECT 1"))
                return True
        except Exception as e:
            logger.error(f"❌ Database health check failed: {e}")
            return False

    def health_check_sync(self) -> bool:
        """Check database health synchronously."""
        try:
            with self.get_session() as session:
                session.execute(text("SELECT 1"))
                return True
        except Exception as e:
            logger.error(f"❌ Database health check failed: {e}")
            return False

    def close(self):
        """Close database connections."""
        self.engine.dispose()


class KnowledgeBaseEntry(Base):
    """Knowledge base entries for agents."""
    __tablename__ = "knowledge_base_entries"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String(255), nullable=False)
    skill = Column(String(255), nullable=False)
    proficiency_level = Column(Float, nullable=False)
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    agent = relationship("Agent", back_populates="knowledge_base_entries")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "agent_id": str(self.agent_id),
            "domain": self.domain,
            "skill": self.skill,
            "proficiency_level": self.proficiency_level,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<KnowledgeBaseEntry(domain='{self.domain}', skill='{self.skill}', level={self.proficiency_level})>"


class PerformanceMetric(Base):
    """Performance metrics for agents."""
    __tablename__ = "performance_metrics"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    agent_id = Column(PostgresUUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String(255), nullable=False)
    metric_value = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    metric_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    agent = relationship("Agent", back_populates="performance_metrics")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "agent_id": str(self.agent_id),
            "metric_name": self.metric_name,
            "metric_value": self.metric_value,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "metadata": self.metric_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<PerformanceMetric(name='{self.metric_name}', value={self.metric_value})>"


# Global database instance
ecs_db = ECSDatabase()
