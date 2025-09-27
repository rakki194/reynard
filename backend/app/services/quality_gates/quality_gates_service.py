"""Quality Gates Service

🦊 *whiskers twitch with systematic precision* Service for managing quality gates
in PostgreSQL, providing centralized quality standards enforcement across the
Reynard ecosystem.

This service provides:
- Quality gate CRUD operations
- Quality gate evaluation and scoring
- Environment-specific gate management
- Evaluation history and analytics
- Integration with existing testing ecosystem

Author: Strategic-Fox-42 (Reynard Fox Specialist)
Version: 1.0.0
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Union
from enum import Enum

from sqlalchemy import and_, or_, desc, asc, func, text
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError

from app.models.quality_gates import (
    QualityGate, QualityGateCondition, QualityGateEvaluation,
    QualityGateConditionResult, QualityGateEnvironment,
    EnvironmentType, OperatorType, GateStatus
)
from app.core.database_manager import get_e2e_session


class QualityGatesService:
    """Service for managing quality gates in PostgreSQL."""
    
    def __init__(self, session: Optional[Session] = None):
        self.session = session or get_e2e_session()
    
    # Quality Gate Management
    
    async def create_quality_gate(
        self,
        gate_id: str,
        name: str,
        environment: Union[str, EnvironmentType],
        description: Optional[str] = None,
        enabled: bool = True,
        is_default: bool = False,
        conditions: Optional[List[Dict[str, Any]]] = None
    ) -> QualityGate:
        """Create a new quality gate with conditions."""
        try:
            # Convert string environment to enum if needed
            if isinstance(environment, str):
                environment = EnvironmentType(environment)
            
            # Create the quality gate
            quality_gate = QualityGate(
                gate_id=gate_id,
                name=name,
                description=description,
                environment=environment,
                enabled=enabled,
                is_default=is_default
            )
            
            self.session.add(quality_gate)
            await self.session.flush()  # Get the ID
            
            # Add conditions if provided
            if conditions:
                for condition_data in conditions:
                    condition = QualityGateCondition(
                        quality_gate_id=quality_gate.id,
                        metric=condition_data['metric'],
                        operator=OperatorType(condition_data['operator']),
                        threshold=condition_data['threshold'],
                        error_threshold=condition_data.get('error_threshold'),
                        warning_threshold=condition_data.get('warning_threshold'),
                        description=condition_data.get('description'),
                        enabled=condition_data.get('enabled', True)
                    )
                    self.session.add(condition)
            
            await self.session.commit()
            return quality_gate
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Failed to create quality gate: {str(e)}")
    
    async def get_quality_gate(self, gate_id: str) -> Optional[QualityGate]:
        """Get a quality gate by ID with conditions."""
        return await self.session.query(QualityGate)\
            .options(joinedload(QualityGate.conditions))\
            .filter(QualityGate.gate_id == gate_id)\
            .first()
    
    async def get_quality_gates(
        self,
        environment: Optional[Union[str, EnvironmentType]] = None,
        enabled_only: bool = True
    ) -> List[QualityGate]:
        """Get quality gates with optional filtering."""
        query = self.session.query(QualityGate)\
            .options(joinedload(QualityGate.conditions))
        
        if environment:
            if isinstance(environment, str):
                environment = EnvironmentType(environment)
            query = query.filter(QualityGate.environment == environment)
        
        if enabled_only:
            query = query.filter(QualityGate.enabled == True)
        
        return await query.order_by(QualityGate.created_at.desc()).all()
    
    async def update_quality_gate(
        self,
        gate_id: str,
        updates: Dict[str, Any]
    ) -> Optional[QualityGate]:
        """Update a quality gate."""
        try:
            quality_gate = await self.get_quality_gate(gate_id)
            if not quality_gate:
                return None
            
            # Update fields
            for key, value in updates.items():
                if hasattr(quality_gate, key):
                    setattr(quality_gate, key, value)
            
            quality_gate.updated_at = datetime.now(timezone.utc)
            await self.session.commit()
            return quality_gate
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Failed to update quality gate: {str(e)}")
    
    async def delete_quality_gate(self, gate_id: str) -> bool:
        """Delete a quality gate and all its conditions."""
        try:
            quality_gate = await self.get_quality_gate(gate_id)
            if not quality_gate:
                return False
            
            self.session.delete(quality_gate)
            await self.session.commit()
            return True
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Failed to delete quality gate: {str(e)}")
    
    # Quality Gate Evaluation
    
    async def evaluate_quality_gates(
        self,
        metrics: Dict[str, Any],
        environment: str = "development",
        evaluation_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Evaluate all quality gates for an environment against metrics."""
        if not evaluation_id:
            evaluation_id = f"eval_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        results = []
        
        # Get quality gates for the environment
        gates = await self.get_quality_gates(environment=environment, enabled_only=True)
        
        for gate in gates:
            result = await self._evaluate_gate(gate, metrics, environment, evaluation_id)
            results.append(result)
        
        return results
    
    async def _evaluate_gate(
        self,
        gate: QualityGate,
        metrics: Dict[str, Any],
        environment: str,
        evaluation_id: str
    ) -> Dict[str, Any]:
        """Evaluate a single quality gate."""
        condition_results = []
        passed_conditions = 0
        failed_conditions = 0
        warning_conditions = 0
        
        # Create evaluation record
        evaluation = QualityGateEvaluation(
            quality_gate_id=gate.id,
            evaluation_id=evaluation_id,
            environment=environment,
            status=GateStatus.PASSED,  # Will be updated
            overall_score=0.0,
            passed_conditions=0,
            total_conditions=len(gate.conditions),
            failed_conditions=0,
            warning_conditions=0,
            metrics_data=metrics
        )
        
        self.session.add(evaluation)
        await self.session.flush()
        
        # Evaluate each condition
        for condition in gate.conditions:
            if not condition.enabled:
                continue
                
            condition_result = await self._evaluate_condition(condition, metrics, evaluation.id)
            condition_results.append(condition_result)
            
            if condition_result['status'] == GateStatus.PASSED:
                passed_conditions += 1
            elif condition_result['status'] == GateStatus.FAILED:
                failed_conditions += 1
            elif condition_result['status'] == GateStatus.WARN:
                warning_conditions += 1
        
        # Calculate overall score and status
        total_conditions = len(condition_results)
        overall_score = (passed_conditions / total_conditions * 100) if total_conditions > 0 else 0
        
        status = GateStatus.PASSED
        if failed_conditions > 0:
            status = GateStatus.FAILED
        elif warning_conditions > 0:
            status = GateStatus.WARN
        
        # Update evaluation record
        evaluation.status = status
        evaluation.overall_score = overall_score
        evaluation.passed_conditions = passed_conditions
        evaluation.failed_conditions = failed_conditions
        evaluation.warning_conditions = warning_conditions
        
        await self.session.commit()
        
        return {
            'gateId': gate.gate_id,
            'gateName': gate.name,
            'status': status.value,
            'conditions': condition_results,
            'overallScore': overall_score,
            'passedConditions': passed_conditions,
            'totalConditions': total_conditions,
            'failedConditions': failed_conditions,
            'warningConditions': warning_conditions,
            'evaluationId': evaluation_id
        }
    
    async def _evaluate_condition(
        self,
        condition: QualityGateCondition,
        metrics: Dict[str, Any],
        evaluation_id: uuid.UUID
    ) -> Dict[str, Any]:
        """Evaluate a single condition."""
        actual_value = metrics.get(condition.metric)
        
        if actual_value is None:
            status = GateStatus.FAILED
            message = f"Metric '{condition.metric}' not found in analysis results"
        else:
            comparison_result = self._compare_values(
                actual_value, 
                condition.threshold, 
                condition.operator,
                condition.error_threshold,
                condition.warning_threshold
            )
            
            if comparison_result == False:
                status = GateStatus.FAILED
                message = f"Condition failed: {condition.metric} {condition.operator.value} {condition.threshold} (actual: {actual_value})"
            elif comparison_result == "warning":
                status = GateStatus.WARN
                message = f"Warning threshold exceeded: {condition.metric} {condition.operator.value} {condition.threshold} (actual: {actual_value})"
            else:
                status = GateStatus.PASSED
                message = f"Condition passed: {condition.metric} {condition.operator.value} {condition.threshold} (actual: {actual_value})"
        
        # Create condition result record
        condition_result = QualityGateConditionResult(
            evaluation_id=evaluation_id,
            condition_id=condition.id,
            status=status,
            actual_value=float(actual_value) if actual_value is not None else 0.0,
            threshold=condition.threshold,
            message=message
        )
        
        self.session.add(condition_result)
        
        return {
            'condition': {
                'metric': condition.metric,
                'operator': condition.operator.value,
                'threshold': condition.threshold,
                'description': condition.description
            },
            'status': status.value,
            'actualValue': actual_value,
            'threshold': condition.threshold,
            'message': message
        }
    
    def _compare_values(
        self,
        actual: Any,
        threshold: float,
        operator: OperatorType,
        error_threshold: Optional[float] = None,
        warning_threshold: Optional[float] = None
    ) -> Union[bool, str]:
        """Compare values based on operator and thresholds."""
        # Handle numeric comparisons
        if isinstance(actual, (int, float)):
            actual_float = float(actual)
            
            # Check error threshold first
            if error_threshold is not None:
                if self._apply_operator(actual_float, error_threshold, operator) == False:
                    return False
            
            # Check warning threshold
            if warning_threshold is not None:
                if self._apply_operator(actual_float, warning_threshold, operator) == False:
                    return "warning"
            
            # Check main threshold
            return self._apply_operator(actual_float, threshold, operator)
        
        # Handle string comparisons
        if isinstance(actual, str):
            return self._apply_operator(actual, str(threshold), operator)
        
        # Handle boolean comparisons
        if isinstance(actual, bool):
            return self._apply_operator(actual, bool(threshold), operator)
        
        return False
    
    def _apply_operator(self, actual: Any, threshold: Any, operator: OperatorType) -> bool:
        """Apply the comparison operator."""
        if operator == OperatorType.GT:
            return actual > threshold
        elif operator == OperatorType.LT:
            return actual < threshold
        elif operator == OperatorType.GTE:
            return actual >= threshold
        elif operator == OperatorType.LTE:
            return actual <= threshold
        elif operator == OperatorType.EQ:
            return actual == threshold
        elif operator == OperatorType.NE:
            return actual != threshold
        else:
            return False
    
    # Environment Management
    
    async def get_environment_config(self, environment: str) -> Optional[QualityGateEnvironment]:
        """Get environment configuration."""
        return await self.session.query(QualityGateEnvironment)\
            .filter(QualityGateEnvironment.environment == environment)\
            .first()
    
    async def set_default_gate_for_environment(
        self,
        environment: str,
        gate_id: str
    ) -> bool:
        """Set the default quality gate for an environment."""
        try:
            env_config = await self.get_environment_config(environment)
            if not env_config:
                # Create new environment config
                env_config = QualityGateEnvironment(
                    environment=environment,
                    default_gate_id=gate_id
                )
                self.session.add(env_config)
            else:
                env_config.default_gate_id = gate_id
                env_config.updated_at = datetime.now(timezone.utc)
            
            await self.session.commit()
            return True
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Failed to set default gate for environment: {str(e)}")
    
    # Default Reynard Quality Gates
    
    async def create_reynard_default_gates(self) -> List[QualityGate]:
        """Create default Reynard quality gates."""
        gates = []
        
        # Development Quality Gate
        dev_gate = await self.create_quality_gate(
            gate_id="reynard-development",
            name="Reynard Development Quality Gate",
            environment=EnvironmentType.DEVELOPMENT,
            description="Quality standards for development environment",
            conditions=[
                {
                    "metric": "bugs",
                    "operator": "EQ",
                    "threshold": 0,
                    "description": "No bugs allowed in development"
                },
                {
                    "metric": "vulnerabilities", 
                    "operator": "EQ",
                    "threshold": 0,
                    "description": "No security vulnerabilities allowed"
                },
                {
                    "metric": "codeSmells",
                    "operator": "LT",
                    "threshold": 50,
                    "description": "Keep code smells under 50"
                },
                {
                    "metric": "cyclomaticComplexity",
                    "operator": "LT",
                    "threshold": 500,
                    "description": "Keep complexity manageable"
                },
                {
                    "metric": "maintainabilityIndex",
                    "operator": "GT",
                    "threshold": 60,
                    "description": "Maintain good maintainability"
                },
                {
                    "metric": "linesOfCode",
                    "operator": "LT",
                    "threshold": 100000,
                    "description": "Keep codebase size reasonable"
                }
            ]
        )
        gates.append(dev_gate)
        
        # Production Quality Gate
        prod_gate = await self.create_quality_gate(
            gate_id="reynard-production",
            name="Reynard Production Quality Gate",
            environment=EnvironmentType.PRODUCTION,
            description="Strict quality standards for production environment",
            conditions=[
                {
                    "metric": "bugs",
                    "operator": "EQ",
                    "threshold": 0,
                    "description": "Zero tolerance for bugs in production"
                },
                {
                    "metric": "vulnerabilities",
                    "operator": "EQ", 
                    "threshold": 0,
                    "description": "Zero tolerance for security vulnerabilities"
                },
                {
                    "metric": "codeSmells",
                    "operator": "LT",
                    "threshold": 20,
                    "description": "Minimal code smells in production"
                },
                {
                    "metric": "cyclomaticComplexity",
                    "operator": "LT",
                    "threshold": 200,
                    "description": "Low complexity in production"
                },
                {
                    "metric": "maintainabilityIndex",
                    "operator": "GT",
                    "threshold": 80,
                    "description": "High maintainability in production"
                },
                {
                    "metric": "lineCoverage",
                    "operator": "GT",
                    "threshold": 80,
                    "description": "High test coverage required"
                },
                {
                    "metric": "branchCoverage",
                    "operator": "GT",
                    "threshold": 70,
                    "description": "Good branch coverage required"
                }
            ]
        )
        gates.append(prod_gate)
        
        # Modularity Standards Gate
        modularity_gate = await self.create_quality_gate(
            gate_id="reynard-modularity",
            name="Reynard Modularity Standards",
            environment=EnvironmentType.ALL,
            description="Enforce Reynard modularity principles",
            conditions=[
                {
                    "metric": "maxFileLines",
                    "operator": "LT",
                    "threshold": 250,
                    "description": "Source files must be under 250 lines"
                },
                {
                    "metric": "maxTestFileLines",
                    "operator": "LT",
                    "threshold": 300,
                    "description": "Test files must be under 300 lines"
                },
                {
                    "metric": "averageFileComplexity",
                    "operator": "LT",
                    "threshold": 10,
                    "description": "Keep average file complexity low"
                }
            ]
        )
        gates.append(modularity_gate)
        
        # Set default gates for environments
        await self.set_default_gate_for_environment("development", "reynard-development")
        await self.set_default_gate_for_environment("staging", "reynard-development")
        await self.set_default_gate_for_environment("production", "reynard-production")
        
        return gates
    
    # Evaluation History and Analytics
    
    async def get_evaluation_history(
        self,
        gate_id: Optional[str] = None,
        environment: Optional[str] = None,
        limit: int = 100
    ) -> List[QualityGateEvaluation]:
        """Get quality gate evaluation history."""
        query = self.session.query(QualityGateEvaluation)\
            .options(joinedload(QualityGateEvaluation.quality_gate))
        
        if gate_id:
            query = query.join(QualityGate)\
                .filter(QualityGate.gate_id == gate_id)
        
        if environment:
            query = query.filter(QualityGateEvaluation.environment == environment)
        
        return await query.order_by(desc(QualityGateEvaluation.evaluated_at))\
            .limit(limit).all()
    
    async def get_evaluation_stats(
        self,
        gate_id: Optional[str] = None,
        environment: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get evaluation statistics."""
        query = self.session.query(QualityGateEvaluation)
        
        if gate_id:
            query = query.join(QualityGate)\
                .filter(QualityGate.gate_id == gate_id)
        
        if environment:
            query = query.filter(QualityGateEvaluation.environment == environment)
        
        # Filter by date range
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.filter(QualityGateEvaluation.evaluated_at >= cutoff_date)
        
        total_evaluations = await query.count()
        
        if total_evaluations == 0:
            return {
                "totalEvaluations": 0,
                "passedRate": 0,
                "failedRate": 0,
                "warningRate": 0,
                "averageScore": 0
            }
        
        # Get status counts
        status_counts = await query.with_entities(
            QualityGateEvaluation.status,
            func.count(QualityGateEvaluation.id)
        ).group_by(QualityGateEvaluation.status).all()
        
        status_dict = {status.value: count for status, count in status_counts}
        
        # Get average score
        avg_score = await query.with_entities(
            func.avg(QualityGateEvaluation.overall_score)
        ).scalar() or 0
        
        return {
            "totalEvaluations": total_evaluations,
            "passedRate": (status_dict.get("PASSED", 0) / total_evaluations) * 100,
            "failedRate": (status_dict.get("FAILED", 0) / total_evaluations) * 100,
            "warningRate": (status_dict.get("WARN", 0) / total_evaluations) * 100,
            "averageScore": float(avg_score)
        }
