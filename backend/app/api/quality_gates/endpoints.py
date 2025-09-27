"""Quality Gates API Endpoints

🦊 *whiskers twitch with strategic precision* FastAPI endpoints for centralized
quality gates management in the Reynard ecosystem.

This module provides REST API endpoints for:
- Quality gate CRUD operations
- Quality gate evaluation and scoring
- Environment-specific gate management
- Evaluation history and analytics
- Integration with existing testing ecosystem

Author: Strategic-Fox-42 (Reynard Fox Specialist)
Version: 1.0.0
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Union
from enum import Enum

from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.services.quality_gates import QualityGatesService
from app.core.database_manager import get_e2e_session
from app.models.quality_gates import EnvironmentType, OperatorType, GateStatus

router = APIRouter(prefix="/api/quality-gates", tags=["quality-gates"])


# Pydantic Models

class QualityGateConditionCreate(BaseModel):
    metric: str = Field(..., description="Metric name to evaluate")
    operator: str = Field(..., description="Comparison operator (GT, LT, EQ, NE, GTE, LTE)")
    threshold: float = Field(..., description="Threshold value")
    error_threshold: Optional[float] = Field(None, description="Error threshold (optional)")
    warning_threshold: Optional[float] = Field(None, description="Warning threshold (optional)")
    description: Optional[str] = Field(None, description="Condition description")
    enabled: bool = Field(True, description="Whether condition is enabled")


class QualityGateCreate(BaseModel):
    gate_id: str = Field(..., description="Unique gate identifier")
    name: str = Field(..., description="Gate name")
    environment: str = Field(..., description="Environment (development, staging, production, all)")
    description: Optional[str] = Field(None, description="Gate description")
    enabled: bool = Field(True, description="Whether gate is enabled")
    is_default: bool = Field(False, description="Whether this is the default gate")
    conditions: Optional[List[QualityGateConditionCreate]] = Field([], description="Gate conditions")


class QualityGateUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Gate name")
    description: Optional[str] = Field(None, description="Gate description")
    environment: Optional[str] = Field(None, description="Environment")
    enabled: Optional[bool] = Field(None, description="Whether gate is enabled")
    is_default: Optional[bool] = Field(None, description="Whether this is the default gate")


class QualityGateResponse(BaseModel):
    id: str
    gate_id: str
    name: str
    description: Optional[str]
    environment: str
    enabled: bool
    is_default: bool
    created_at: datetime
    updated_at: datetime
    conditions: List[Dict[str, Any]]

    class Config:
        from_attributes = True


class QualityGateEvaluationRequest(BaseModel):
    metrics: Dict[str, Any] = Field(..., description="Metrics to evaluate against")
    environment: str = Field("development", description="Environment to evaluate for")
    evaluation_id: Optional[str] = Field(None, description="Custom evaluation ID")


class QualityGateEvaluationResponse(BaseModel):
    gateId: str
    gateName: str
    status: str
    conditions: List[Dict[str, Any]]
    overallScore: float
    passedConditions: int
    totalConditions: int
    failedConditions: int
    warningConditions: int
    evaluationId: str


class EnvironmentConfigUpdate(BaseModel):
    default_gate_id: str = Field(..., description="Default gate ID for environment")


class QualityGateStatsResponse(BaseModel):
    totalEvaluations: int
    passedRate: float
    failedRate: float
    warningRate: float
    averageScore: float


# Dependency Injection

def get_quality_gates_service(session: Session = Depends(get_e2e_session)) -> QualityGatesService:
    """Get quality gates service instance."""
    return QualityGatesService(session)


# Quality Gate CRUD Endpoints

@router.post("/", response_model=QualityGateResponse, status_code=status.HTTP_201_CREATED)
async def create_quality_gate(
    gate_data: QualityGateCreate,
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Create a new quality gate."""
    try:
        conditions = [
            {
                "metric": condition.metric,
                "operator": condition.operator,
                "threshold": condition.threshold,
                "error_threshold": condition.error_threshold,
                "warning_threshold": condition.warning_threshold,
                "description": condition.description,
                "enabled": condition.enabled
            }
            for condition in gate_data.conditions
        ]
        
        quality_gate = await service.create_quality_gate(
            gate_id=gate_data.gate_id,
            name=gate_data.name,
            environment=gate_data.environment,
            description=gate_data.description,
            enabled=gate_data.enabled,
            is_default=gate_data.is_default,
            conditions=conditions
        )
        
        return QualityGateResponse(
            id=str(quality_gate.id),
            gate_id=quality_gate.gate_id,
            name=quality_gate.name,
            description=quality_gate.description,
            environment=quality_gate.environment.value,
            enabled=quality_gate.enabled,
            is_default=quality_gate.is_default,
            created_at=quality_gate.created_at,
            updated_at=quality_gate.updated_at,
            conditions=[
                {
                    "id": str(condition.id),
                    "metric": condition.metric,
                    "operator": condition.operator.value,
                    "threshold": condition.threshold,
                    "error_threshold": condition.error_threshold,
                    "warning_threshold": condition.warning_threshold,
                    "description": condition.description,
                    "enabled": condition.enabled
                }
                for condition in quality_gate.conditions
            ]
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[QualityGateResponse])
async def get_quality_gates(
    environment: Optional[str] = Query(None, description="Filter by environment"),
    enabled_only: bool = Query(True, description="Show only enabled gates"),
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Get all quality gates with optional filtering."""
    try:
        gates = await service.get_quality_gates(
            environment=environment,
            enabled_only=enabled_only
        )
        
        return [
            QualityGateResponse(
                id=str(gate.id),
                gate_id=gate.gate_id,
                name=gate.name,
                description=gate.description,
                environment=gate.environment.value,
                enabled=gate.enabled,
                is_default=gate.is_default,
                created_at=gate.created_at,
                updated_at=gate.updated_at,
                conditions=[
                    {
                        "id": str(condition.id),
                        "metric": condition.metric,
                        "operator": condition.operator.value,
                        "threshold": condition.threshold,
                        "error_threshold": condition.error_threshold,
                        "warning_threshold": condition.warning_threshold,
                        "description": condition.description,
                        "enabled": condition.enabled
                    }
                    for condition in gate.conditions
                ]
            )
            for gate in gates
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{gate_id}", response_model=QualityGateResponse)
async def get_quality_gate(
    gate_id: str,
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Get a specific quality gate by ID."""
    try:
        gate = await service.get_quality_gate(gate_id)
        if not gate:
            raise HTTPException(status_code=404, detail="Quality gate not found")
        
        return QualityGateResponse(
            id=str(gate.id),
            gate_id=gate.gate_id,
            name=gate.name,
            description=gate.description,
            environment=gate.environment.value,
            enabled=gate.enabled,
            is_default=gate.is_default,
            created_at=gate.created_at,
            updated_at=gate.updated_at,
            conditions=[
                {
                    "id": str(condition.id),
                    "metric": condition.metric,
                    "operator": condition.operator.value,
                    "threshold": condition.threshold,
                    "error_threshold": condition.error_threshold,
                    "warning_threshold": condition.warning_threshold,
                    "description": condition.description,
                    "enabled": condition.enabled
                }
                for condition in gate.conditions
            ]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{gate_id}", response_model=QualityGateResponse)
async def update_quality_gate(
    gate_id: str,
    updates: QualityGateUpdate,
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Update a quality gate."""
    try:
        update_dict = {k: v for k, v in updates.dict().items() if v is not None}
        gate = await service.update_quality_gate(gate_id, update_dict)
        
        if not gate:
            raise HTTPException(status_code=404, detail="Quality gate not found")
        
        return QualityGateResponse(
            id=str(gate.id),
            gate_id=gate.gate_id,
            name=gate.name,
            description=gate.description,
            environment=gate.environment.value,
            enabled=gate.enabled,
            is_default=gate.is_default,
            created_at=gate.created_at,
            updated_at=gate.updated_at,
            conditions=[
                {
                    "id": str(condition.id),
                    "metric": condition.metric,
                    "operator": condition.operator.value,
                    "threshold": condition.threshold,
                    "error_threshold": condition.error_threshold,
                    "warning_threshold": condition.warning_threshold,
                    "description": condition.description,
                    "enabled": condition.enabled
                }
                for condition in gate.conditions
            ]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{gate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quality_gate(
    gate_id: str,
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Delete a quality gate."""
    try:
        success = await service.delete_quality_gate(gate_id)
        if not success:
            raise HTTPException(status_code=404, detail="Quality gate not found")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Quality Gate Evaluation Endpoints

@router.post("/evaluate", response_model=List[QualityGateEvaluationResponse])
async def evaluate_quality_gates(
    request: QualityGateEvaluationRequest,
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Evaluate quality gates against metrics."""
    try:
        results = await service.evaluate_quality_gates(
            metrics=request.metrics,
            environment=request.environment,
            evaluation_id=request.evaluation_id
        )
        
        return [
            QualityGateEvaluationResponse(
                gateId=result["gateId"],
                gateName=result["gateName"],
                status=result["status"],
                conditions=result["conditions"],
                overallScore=result["overallScore"],
                passedConditions=result["passedConditions"],
                totalConditions=result["totalConditions"],
                failedConditions=result["failedConditions"],
                warningConditions=result["warningConditions"],
                evaluationId=result["evaluationId"]
            )
            for result in results
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Environment Management Endpoints

@router.get("/environments/{environment}")
async def get_environment_config(
    environment: str,
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Get environment configuration."""
    try:
        config = await service.get_environment_config(environment)
        if not config:
            raise HTTPException(status_code=404, detail="Environment configuration not found")
        
        return {
            "environment": config.environment,
            "defaultGateId": config.default_gate_id,
            "enabled": config.enabled
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/environments/{environment}")
async def update_environment_config(
    environment: str,
    config_update: EnvironmentConfigUpdate,
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Update environment configuration."""
    try:
        success = await service.set_default_gate_for_environment(
            environment=environment,
            gate_id=config_update.default_gate_id
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to update environment configuration")
        
        return {"message": "Environment configuration updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Default Gates and Initialization

@router.post("/initialize", status_code=status.HTTP_201_CREATED)
async def initialize_default_gates(
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Initialize default Reynard quality gates."""
    try:
        gates = await service.create_reynard_default_gates()
        return {
            "message": "Default Reynard quality gates initialized successfully",
            "gatesCreated": len(gates)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reynard-defaults", status_code=status.HTTP_201_CREATED)
async def create_reynard_default_gates(
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Create Reynard-specific default quality gates."""
    try:
        gates = await service.create_reynard_default_gates()
        return {
            "message": "Reynard quality gates created successfully",
            "gatesCreated": len(gates)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Evaluation History and Analytics

@router.get("/evaluations")
async def get_evaluation_history(
    gate_id: Optional[str] = Query(None, description="Filter by gate ID"),
    environment: Optional[str] = Query(None, description="Filter by environment"),
    limit: int = Query(100, description="Maximum number of results"),
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Get quality gate evaluation history."""
    try:
        evaluations = await service.get_evaluation_history(
            gate_id=gate_id,
            environment=environment,
            limit=limit
        )
        
        return [
            {
                "id": str(eval.id),
                "gateId": eval.quality_gate.gate_id,
                "gateName": eval.quality_gate.name,
                "evaluationId": eval.evaluation_id,
                "environment": eval.environment,
                "status": eval.status.value,
                "overallScore": eval.overall_score,
                "passedConditions": eval.passed_conditions,
                "totalConditions": eval.total_conditions,
                "failedConditions": eval.failed_conditions,
                "warningConditions": eval.warning_conditions,
                "evaluatedAt": eval.evaluated_at
            }
            for eval in evaluations
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=QualityGateStatsResponse)
async def get_evaluation_stats(
    gate_id: Optional[str] = Query(None, description="Filter by gate ID"),
    environment: Optional[str] = Query(None, description="Filter by environment"),
    days: int = Query(30, description="Number of days to include in stats"),
    service: QualityGatesService = Depends(get_quality_gates_service)
):
    """Get quality gate evaluation statistics."""
    try:
        stats = await service.get_evaluation_stats(
            gate_id=gate_id,
            environment=environment,
            days=days
        )
        
        return QualityGateStatsResponse(
            totalEvaluations=stats["totalEvaluations"],
            passedRate=stats["passedRate"],
            failedRate=stats["failedRate"],
            warningRate=stats["warningRate"],
            averageScore=stats["averageScore"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Health Check

@router.get("/health")
async def health_check():
    """Health check endpoint for quality gates service."""
    return {
        "status": "healthy",
        "service": "quality-gates",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
