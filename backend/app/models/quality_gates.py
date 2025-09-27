"""Quality Gates Database Models

🦊 *whiskers twitch with systematic precision* Comprehensive SQLAlchemy models for
quality gates management in PostgreSQL, integrated with the Reynard testing ecosystem.

This module provides models for:
- Quality gate definitions and configurations
- Quality gate conditions and thresholds
- Quality gate evaluation results and history
- Environment-specific gate assignments

Author: Strategic-Fox-42 (Reynard Fox Specialist)
Version: 1.0.0
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Text, Boolean, ForeignKey,
    Index, UniqueConstraint, CheckConstraint, Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column
from sqlalchemy.sql import func

Base = declarative_base()


class EnvironmentType(str, Enum):
    """Environment types for quality gates."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    ALL = "all"


class OperatorType(str, Enum):
    """Comparison operators for quality gate conditions."""
    GT = "GT"      # Greater than
    LT = "LT"      # Less than
    EQ = "EQ"      # Equal to
    NE = "NE"      # Not equal to
    GTE = "GTE"    # Greater than or equal to
    LTE = "LTE"    # Less than or equal to


class GateStatus(str, Enum):
    """Quality gate evaluation status."""
    PASSED = "PASSED"
    FAILED = "FAILED"
    WARN = "WARN"


class QualityGate(Base):
    """Quality gate definitions and configurations."""
    
    __tablename__ = 'quality_gates'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gate_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    environment: Mapped[EnvironmentType] = mapped_column(SQLEnum(EnvironmentType), nullable=False, index=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    conditions: Mapped[List["QualityGateCondition"]] = relationship(
        "QualityGateCondition", 
        back_populates="quality_gate", 
        cascade="all, delete-orphan",
        order_by="QualityGateCondition.created_at"
    )
    evaluations: Mapped[List["QualityGateEvaluation"]] = relationship(
        "QualityGateEvaluation", 
        back_populates="quality_gate", 
        cascade="all, delete-orphan",
        order_by="QualityGateEvaluation.evaluated_at.desc()"
    )
    
    __table_args__ = (
        Index('idx_quality_gates_environment_enabled', 'environment', 'enabled'),
        Index('idx_quality_gates_default', 'is_default'),
        UniqueConstraint('gate_id', name='uq_quality_gates_gate_id'),
        CheckConstraint("environment IN ('development', 'staging', 'production', 'all')", name='ck_quality_gates_environment'),
    )


class QualityGateCondition(Base):
    """Individual conditions within a quality gate."""
    
    __tablename__ = 'quality_gate_conditions'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quality_gate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey('quality_gates.id', ondelete='CASCADE'), 
        nullable=False, 
        index=True
    )
    metric: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    operator: Mapped[OperatorType] = mapped_column(SQLEnum(OperatorType), nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    error_threshold: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    warning_threshold: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    quality_gate: Mapped["QualityGate"] = relationship("QualityGate", back_populates="conditions")
    condition_results: Mapped[List["QualityGateConditionResult"]] = relationship(
        "QualityGateConditionResult", 
        back_populates="condition", 
        cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        Index('idx_quality_gate_conditions_gate_id', 'quality_gate_id'),
        Index('idx_quality_gate_conditions_metric', 'metric'),
        CheckConstraint("operator IN ('GT', 'LT', 'EQ', 'NE', 'GTE', 'LTE')", name='ck_quality_gate_conditions_operator'),
    )


class QualityGateEvaluation(Base):
    """Quality gate evaluation results and history."""
    
    __tablename__ = 'quality_gate_evaluations'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quality_gate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey('quality_gates.id', ondelete='CASCADE'), 
        nullable=False, 
        index=True
    )
    evaluation_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    environment: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[GateStatus] = mapped_column(SQLEnum(GateStatus), nullable=False, index=True)
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)
    passed_conditions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_conditions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_conditions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    warning_conditions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    metrics_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    quality_gate: Mapped["QualityGate"] = relationship("QualityGate", back_populates="evaluations")
    condition_results: Mapped[List["QualityGateConditionResult"]] = relationship(
        "QualityGateConditionResult", 
        back_populates="evaluation", 
        cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        Index('idx_quality_gate_evaluations_gate_id', 'quality_gate_id'),
        Index('idx_quality_gate_evaluations_evaluation_id', 'evaluation_id'),
        Index('idx_quality_gate_evaluations_environment', 'environment'),
        Index('idx_quality_gate_evaluations_status', 'status'),
        Index('idx_quality_gate_evaluations_evaluated_at', 'evaluated_at'),
        CheckConstraint("status IN ('PASSED', 'FAILED', 'WARN')", name='ck_quality_gate_evaluations_status'),
        CheckConstraint("overall_score >= 0 AND overall_score <= 100", name='ck_quality_gate_evaluations_score'),
    )


class QualityGateConditionResult(Base):
    """Individual condition evaluation results."""
    
    __tablename__ = 'quality_gate_condition_results'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey('quality_gate_evaluations.id', ondelete='CASCADE'), 
        nullable=False, 
        index=True
    )
    condition_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey('quality_gate_conditions.id', ondelete='CASCADE'), 
        nullable=False, 
        index=True
    )
    status: Mapped[GateStatus] = mapped_column(SQLEnum(GateStatus), nullable=False, index=True)
    actual_value: Mapped[float] = mapped_column(Float, nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    evaluation: Mapped["QualityGateEvaluation"] = relationship("QualityGateEvaluation", back_populates="condition_results")
    condition: Mapped["QualityGateCondition"] = relationship("QualityGateCondition", back_populates="condition_results")
    
    __table_args__ = (
        Index('idx_quality_gate_condition_results_evaluation_id', 'evaluation_id'),
        Index('idx_quality_gate_condition_results_condition_id', 'condition_id'),
        Index('idx_quality_gate_condition_results_status', 'status'),
        CheckConstraint("status IN ('PASSED', 'FAILED', 'WARN')", name='ck_quality_gate_condition_results_status'),
    )


class QualityGateEnvironment(Base):
    """Environment-specific quality gate assignments."""
    
    __tablename__ = 'quality_gate_environments'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    environment: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    default_gate_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    __table_args__ = (
        Index('idx_quality_gate_environments_environment', 'environment'),
        UniqueConstraint('environment', name='uq_quality_gate_environments_environment'),
    )
