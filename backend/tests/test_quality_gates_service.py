"""Quality Gates Service Tests

🦊 *whiskers twitch with systematic precision* Comprehensive tests for the
quality gates service, ensuring proper database operations and business logic.
"""

import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import Mock, AsyncMock, patch
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.services.quality_gates import QualityGatesService
from app.models.quality_gates import (
    QualityGate, QualityGateCondition, QualityGateEvaluation,
    QualityGateConditionResult, QualityGateEnvironment,
    EnvironmentType, OperatorType, GateStatus
)


class TestQualityGatesService:
    """Test suite for QualityGatesService."""

    @pytest.fixture
    def mock_session(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def service(self, mock_session):
        """Quality gates service instance."""
        return QualityGatesService(mock_session)

    @pytest.fixture
    def sample_gate_data(self):
        """Sample quality gate data."""
        return {
            "gate_id": "test-gate",
            "name": "Test Quality Gate",
            "environment": EnvironmentType.DEVELOPMENT,
            "description": "Test gate for development",
            "enabled": True,
            "is_default": False,
            "conditions": [
                {
                    "metric": "bugs",
                    "operator": "EQ",
                    "threshold": 0,
                    "description": "No bugs allowed"
                },
                {
                    "metric": "codeSmells",
                    "operator": "LT",
                    "threshold": 50,
                    "description": "Keep code smells low"
                }
            ]
        }

    @pytest.fixture
    def sample_metrics(self):
        """Sample metrics for evaluation."""
        return {
            "bugs": 0,
            "vulnerabilities": 0,
            "codeSmells": 25,
            "cyclomaticComplexity": 150,
            "maintainabilityIndex": 75,
            "linesOfCode": 50000
        }

    # Quality Gate CRUD Tests

    @pytest.mark.asyncio
    async def test_create_quality_gate_success(self, service, mock_session, sample_gate_data):
        """Test successful quality gate creation."""
        # Mock session operations
        mock_session.add = Mock()
        mock_session.flush = AsyncMock()
        mock_session.commit = AsyncMock()
        
        # Mock the quality gate object
        mock_gate = Mock()
        mock_gate.id = uuid.uuid4()
        mock_gate.gate_id = sample_gate_data["gate_id"]
        mock_gate.name = sample_gate_data["name"]
        mock_gate.environment = sample_gate_data["environment"]
        mock_gate.enabled = sample_gate_data["enabled"]
        mock_gate.is_default = sample_gate_data["is_default"]
        mock_gate.conditions = []
        
        with patch('app.services.quality_gates.quality_gates_service.QualityGate', return_value=mock_gate):
            with patch('app.services.quality_gates.quality_gates_service.QualityGateCondition', return_value=Mock()):
                result = await service.create_quality_gate(**sample_gate_data)
                
                assert result == mock_gate
                assert mock_session.add.call_count == 3  # Gate + 2 conditions
                mock_session.flush.assert_called_once()
                mock_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_quality_gate_database_error(self, service, mock_session, sample_gate_data):
        """Test quality gate creation with database error."""
        mock_session.add = Mock()
        mock_session.flush = AsyncMock()
        mock_session.commit = AsyncMock(side_effect=SQLAlchemyError("Database error"))
        mock_session.rollback = AsyncMock()
        
        with patch('app.services.quality_gates.quality_gates_service.QualityGate', return_value=Mock()):
            with pytest.raises(Exception) as exc_info:
                await service.create_quality_gate(**sample_gate_data)
            
            assert "Failed to create quality gate" in str(exc_info.value)
            mock_session.rollback.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_quality_gate_success(self, service, mock_session):
        """Test successful quality gate retrieval."""
        gate_id = "test-gate"
        mock_gate = Mock()
        mock_gate.gate_id = gate_id
        mock_gate.conditions = []
        
        mock_query = Mock()
        mock_query.options.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first = AsyncMock(return_value=mock_gate)
        
        mock_session.query.return_value = mock_query
        
        result = await service.get_quality_gate(gate_id)
        
        assert result == mock_gate
        mock_session.query.assert_called_once_with(QualityGate)
        mock_query.filter.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_quality_gate_not_found(self, service, mock_session):
        """Test quality gate retrieval when not found."""
        gate_id = "non-existent"
        
        mock_query = Mock()
        mock_query.options.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first = AsyncMock(return_value=None)
        
        mock_session.query.return_value = mock_query
        
        result = await service.get_quality_gate(gate_id)
        
        assert result is None

    @pytest.mark.asyncio
    async def test_get_quality_gates_with_filters(self, service, mock_session):
        """Test quality gates retrieval with filters."""
        environment = EnvironmentType.DEVELOPMENT
        mock_gates = [Mock(), Mock()]
        
        mock_query = Mock()
        mock_query.options.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all = AsyncMock(return_value=mock_gates)
        
        mock_session.query.return_value = mock_query
        
        result = await service.get_quality_gates(environment=environment, enabled_only=True)
        
        assert result == mock_gates
        assert mock_query.filter.call_count == 2  # environment and enabled filters

    @pytest.mark.asyncio
    async def test_update_quality_gate_success(self, service, mock_session):
        """Test successful quality gate update."""
        gate_id = "test-gate"
        updates = {"name": "Updated Gate", "enabled": False}
        
        mock_gate = Mock()
        mock_gate.gate_id = gate_id
        mock_gate.conditions = []
        
        # Mock get_quality_gate
        service.get_quality_gate = AsyncMock(return_value=mock_gate)
        mock_session.commit = AsyncMock()
        
        result = await service.update_quality_gate(gate_id, updates)
        
        assert result == mock_gate
        assert mock_gate.name == "Updated Gate"
        assert mock_gate.enabled == False
        mock_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_quality_gate_not_found(self, service, mock_session):
        """Test quality gate update when gate not found."""
        gate_id = "non-existent"
        updates = {"name": "Updated Gate"}
        
        service.get_quality_gate = AsyncMock(return_value=None)
        
        result = await service.update_quality_gate(gate_id, updates)
        
        assert result is None

    @pytest.mark.asyncio
    async def test_delete_quality_gate_success(self, service, mock_session):
        """Test successful quality gate deletion."""
        gate_id = "test-gate"
        mock_gate = Mock()
        mock_gate.conditions = []
        
        service.get_quality_gate = AsyncMock(return_value=mock_gate)
        mock_session.delete = Mock()
        mock_session.commit = AsyncMock()
        
        result = await service.delete_quality_gate(gate_id)
        
        assert result is True
        mock_session.delete.assert_called_once_with(mock_gate)
        mock_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_quality_gate_not_found(self, service, mock_session):
        """Test quality gate deletion when gate not found."""
        gate_id = "non-existent"
        
        service.get_quality_gate = AsyncMock(return_value=None)
        
        result = await service.delete_quality_gate(gate_id)
        
        assert result is False

    # Quality Gate Evaluation Tests

    @pytest.mark.asyncio
    async def test_evaluate_quality_gates_success(self, service, mock_session, sample_metrics):
        """Test successful quality gates evaluation."""
        environment = "development"
        evaluation_id = "eval-123"
        
        # Mock gates
        mock_gate = Mock()
        mock_gate.gate_id = "test-gate"
        mock_gate.name = "Test Gate"
        mock_gate.conditions = []
        
        service.get_quality_gates = AsyncMock(return_value=[mock_gate])
        service._evaluate_gate = AsyncMock(return_value={
            "gateId": "test-gate",
            "gateName": "Test Gate",
            "status": "PASSED",
            "conditions": [],
            "overallScore": 100.0,
            "passedConditions": 2,
            "totalConditions": 2,
            "failedConditions": 0,
            "warningConditions": 0,
            "evaluationId": evaluation_id
        })
        
        result = await service.evaluate_quality_gates(sample_metrics, environment, evaluation_id)
        
        assert len(result) == 1
        assert result[0]["gateId"] == "test-gate"
        assert result[0]["status"] == "PASSED"
        service._evaluate_gate.assert_called_once_with(mock_gate, sample_metrics, environment, evaluation_id)

    @pytest.mark.asyncio
    async def test_evaluate_gate_success(self, service, mock_session, sample_metrics):
        """Test successful single gate evaluation."""
        # Mock gate
        mock_gate = Mock()
        mock_gate.id = uuid.uuid4()
        mock_gate.gate_id = "test-gate"
        mock_gate.name = "Test Gate"
        
        # Mock conditions
        mock_condition = Mock()
        mock_condition.enabled = True
        mock_gate.conditions = [mock_condition]
        
        # Mock evaluation
        mock_evaluation = Mock()
        mock_evaluation.id = uuid.uuid4()
        
        mock_session.add = Mock()
        mock_session.flush = AsyncMock()
        mock_session.commit = AsyncMock()
        
        with patch('app.services.quality_gates.quality_gates_service.QualityGateEvaluation', return_value=mock_evaluation):
            service._evaluate_condition = AsyncMock(return_value={
                "condition": {"metric": "bugs", "operator": "EQ", "threshold": 0},
                "status": "PASSED",
                "actualValue": 0,
                "threshold": 0,
                "message": "Condition passed"
            })
            
            result = await service._evaluate_gate(mock_gate, sample_metrics, "development", "eval-123")
            
            assert result["gateId"] == "test-gate"
            assert result["status"] == "PASSED"
            assert result["overallScore"] == 100.0
            mock_session.add.assert_called_once()
            mock_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_evaluate_condition_success(self, service, mock_session):
        """Test successful condition evaluation."""
        # Mock condition
        mock_condition = Mock()
        mock_condition.id = uuid.uuid4()
        mock_condition.metric = "bugs"
        mock_condition.operator = OperatorType.EQ
        mock_condition.threshold = 0
        mock_condition.error_threshold = None
        mock_condition.warning_threshold = None
        
        evaluation_id = uuid.uuid4()
        metrics = {"bugs": 0}
        
        mock_session.add = Mock()
        
        with patch('app.services.quality_gates.quality_gates_service.QualityGateConditionResult', return_value=Mock()):
            result = await service._evaluate_condition(mock_condition, metrics, evaluation_id)
            
            assert result["status"] == "PASSED"
            assert result["actualValue"] == 0
            assert result["threshold"] == 0
            assert "Condition passed" in result["message"]
            mock_session.add.assert_called_once()

    @pytest.mark.asyncio
    async def test_evaluate_condition_missing_metric(self, service, mock_session):
        """Test condition evaluation with missing metric."""
        mock_condition = Mock()
        mock_condition.id = uuid.uuid4()
        mock_condition.metric = "missing_metric"
        mock_condition.operator = OperatorType.EQ
        mock_condition.threshold = 0
        
        evaluation_id = uuid.uuid4()
        metrics = {"bugs": 0}  # missing_metric not present
        
        mock_session.add = Mock()
        
        with patch('app.services.quality_gates.quality_gates_service.QualityGateConditionResult', return_value=Mock()):
            result = await service._evaluate_condition(mock_condition, metrics, evaluation_id)
            
            assert result["status"] == "FAILED"
            assert "not found in analysis results" in result["message"]

    def test_compare_values_numeric_success(self, service):
        """Test numeric value comparison success."""
        result = service._compare_values(5, 10, OperatorType.LT)
        assert result is True
        
        result = service._compare_values(15, 10, OperatorType.GT)
        assert result is True
        
        result = service._compare_values(10, 10, OperatorType.EQ)
        assert result is True

    def test_compare_values_numeric_failure(self, service):
        """Test numeric value comparison failure."""
        result = service._compare_values(15, 10, OperatorType.LT)
        assert result is False
        
        result = service._compare_values(5, 10, OperatorType.GT)
        assert result is False

    def test_compare_values_with_warning_threshold(self, service):
        """Test value comparison with warning threshold."""
        result = service._compare_values(8, 10, OperatorType.LT, warning_threshold=5)
        assert result == "warning"
        
        result = service._compare_values(3, 10, OperatorType.LT, warning_threshold=5)
        assert result is True

    def test_compare_values_string_comparison(self, service):
        """Test string value comparison."""
        result = service._compare_values("test", "test", OperatorType.EQ)
        assert result is True
        
        result = service._compare_values("test", "other", OperatorType.NE)
        assert result is True

    def test_apply_operator_all_operators(self, service):
        """Test all comparison operators."""
        # GT (Greater Than)
        assert service._apply_operator(10, 5, OperatorType.GT) is True
        assert service._apply_operator(5, 10, OperatorType.GT) is False
        
        # LT (Less Than)
        assert service._apply_operator(5, 10, OperatorType.LT) is True
        assert service._apply_operator(10, 5, OperatorType.LT) is False
        
        # GTE (Greater Than or Equal)
        assert service._apply_operator(10, 10, OperatorType.GTE) is True
        assert service._apply_operator(10, 5, OperatorType.GTE) is True
        assert service._apply_operator(5, 10, OperatorType.GTE) is False
        
        # LTE (Less Than or Equal)
        assert service._apply_operator(10, 10, OperatorType.LTE) is True
        assert service._apply_operator(5, 10, OperatorType.LTE) is True
        assert service._apply_operator(10, 5, OperatorType.LTE) is False
        
        # EQ (Equal)
        assert service._apply_operator(10, 10, OperatorType.EQ) is True
        assert service._apply_operator(10, 5, OperatorType.EQ) is False
        
        # NE (Not Equal)
        assert service._apply_operator(10, 5, OperatorType.NE) is True
        assert service._apply_operator(10, 10, OperatorType.NE) is False

    # Environment Management Tests

    @pytest.mark.asyncio
    async def test_get_environment_config_success(self, service, mock_session):
        """Test successful environment config retrieval."""
        environment = "development"
        mock_config = Mock()
        mock_config.environment = environment
        mock_config.default_gate_id = "reynard-development"
        
        mock_query = Mock()
        mock_query.filter.return_value = mock_query
        mock_query.first = AsyncMock(return_value=mock_config)
        
        mock_session.query.return_value = mock_query
        
        result = await service.get_environment_config(environment)
        
        assert result == mock_config
        mock_session.query.assert_called_once_with(QualityGateEnvironment)

    @pytest.mark.asyncio
    async def test_set_default_gate_for_environment_new_config(self, service, mock_session):
        """Test setting default gate for new environment config."""
        environment = "staging"
        gate_id = "staging-gate"
        
        service.get_environment_config = AsyncMock(return_value=None)
        mock_session.add = Mock()
        mock_session.commit = AsyncMock()
        
        with patch('app.services.quality_gates.quality_gates_service.QualityGateEnvironment', return_value=Mock()):
            result = await service.set_default_gate_for_environment(environment, gate_id)
            
            assert result is True
            mock_session.add.assert_called_once()
            mock_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_set_default_gate_for_environment_existing_config(self, service, mock_session):
        """Test setting default gate for existing environment config."""
        environment = "development"
        gate_id = "new-dev-gate"
        
        mock_config = Mock()
        mock_config.default_gate_id = "old-dev-gate"
        
        service.get_environment_config = AsyncMock(return_value=mock_config)
        mock_session.commit = AsyncMock()
        
        result = await service.set_default_gate_for_environment(environment, gate_id)
        
        assert result is True
        assert mock_config.default_gate_id == gate_id
        mock_session.commit.assert_called_once()

    # Default Reynard Quality Gates Tests

    @pytest.mark.asyncio
    async def test_create_reynard_default_gates_success(self, service, mock_session):
        """Test successful creation of Reynard default gates."""
        service.create_quality_gate = AsyncMock(return_value=Mock())
        service.set_default_gate_for_environment = AsyncMock(return_value=True)
        
        result = await service.create_reynard_default_gates()
        
        assert len(result) == 3  # development, production, modularity
        assert service.create_quality_gate.call_count == 3
        assert service.set_default_gate_for_environment.call_count == 3

    # Evaluation History and Analytics Tests

    @pytest.mark.asyncio
    async def test_get_evaluation_history_success(self, service, mock_session):
        """Test successful evaluation history retrieval."""
        gate_id = "test-gate"
        environment = "development"
        limit = 50
        
        mock_evaluations = [Mock(), Mock()]
        
        mock_query = Mock()
        mock_query.options.return_value = mock_query
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all = AsyncMock(return_value=mock_evaluations)
        
        mock_session.query.return_value = mock_query
        
        result = await service.get_evaluation_history(gate_id, environment, limit)
        
        assert result == mock_evaluations
        mock_session.query.assert_called_once_with(QualityGateEvaluation)

    @pytest.mark.asyncio
    async def test_get_evaluation_stats_success(self, service, mock_session):
        """Test successful evaluation statistics retrieval."""
        gate_id = "test-gate"
        environment = "development"
        days = 30
        
        # Mock query results
        mock_query = Mock()
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.count = AsyncMock(return_value=100)
        mock_query.with_entities.return_value = mock_query
        mock_query.group_by.return_value = mock_query
        mock_query.all = AsyncMock(return_value=[
            (GateStatus.PASSED, 80),
            (GateStatus.FAILED, 15),
            (GateStatus.WARN, 5)
        ])
        mock_query.scalar = AsyncMock(return_value=85.5)
        
        mock_session.query.return_value = mock_query
        
        result = await service.get_evaluation_stats(gate_id, environment, days)
        
        assert result["totalEvaluations"] == 100
        assert result["passedRate"] == 80.0
        assert result["failedRate"] == 15.0
        assert result["warningRate"] == 5.0
        assert result["averageScore"] == 85.5

    @pytest.mark.asyncio
    async def test_get_evaluation_stats_no_data(self, service, mock_session):
        """Test evaluation statistics with no data."""
        mock_query = Mock()
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.count = AsyncMock(return_value=0)
        
        mock_session.query.return_value = mock_query
        
        result = await service.get_evaluation_stats()
        
        assert result["totalEvaluations"] == 0
        assert result["passedRate"] == 0
        assert result["failedRate"] == 0
        assert result["warningRate"] == 0
        assert result["averageScore"] == 0

    # Error Handling Tests

    @pytest.mark.asyncio
    async def test_database_error_handling(self, service, mock_session):
        """Test database error handling."""
        mock_session.query.side_effect = SQLAlchemyError("Database connection failed")
        
        with pytest.raises(Exception) as exc_info:
            await service.get_quality_gates()
        
        assert "Database connection failed" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_rollback_on_error(self, service, mock_session):
        """Test rollback on database error."""
        mock_session.add = Mock()
        mock_session.flush = AsyncMock()
        mock_session.commit = AsyncMock(side_effect=SQLAlchemyError("Commit failed"))
        mock_session.rollback = AsyncMock()
        
        with patch('app.services.quality_gates.quality_gates_service.QualityGate', return_value=Mock()):
            with pytest.raises(Exception):
                await service.create_quality_gate(
                    gate_id="test",
                    name="Test",
                    environment=EnvironmentType.DEVELOPMENT
                )
            
            mock_session.rollback.assert_called_once()
