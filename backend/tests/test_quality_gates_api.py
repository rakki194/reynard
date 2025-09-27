"""Quality Gates API Tests

🦊 *whiskers twitch with systematic precision* Comprehensive tests for the
quality gates API endpoints, ensuring proper HTTP handling and validation.
"""

import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient
from fastapi import status

from app.api.quality_gates.endpoints import router
from app.models.quality_gates import (
    QualityGate, QualityGateCondition, QualityGateEvaluation,
    EnvironmentType, OperatorType, GateStatus
)


@pytest.fixture
def client():
    """Test client for quality gates API."""
    from fastapi import FastAPI
    from app.api.quality_gates.endpoints import get_quality_gates_service
    
    app = FastAPI()
    
    # Override the dependency to return a mock service by default
    def override_get_quality_gates_service():
        return Mock()
    
    app.dependency_overrides[get_quality_gates_service] = override_get_quality_gates_service
    app.include_router(router)
    return TestClient(app)


@pytest.fixture
def mock_service():
    """Mock quality gates service."""
    return Mock()


def override_dependency(client, mock_service):
    """Helper function to override the dependency for testing."""
    from app.api.quality_gates.endpoints import get_quality_gates_service
    
    def override_get_quality_gates_service():
        return mock_service
    
    client.app.dependency_overrides[get_quality_gates_service] = override_get_quality_gates_service


@pytest.fixture
def sample_gate_data():
    """Sample quality gate data for testing."""
    return {
        "gate_id": "test-gate",
        "name": "Test Quality Gate",
        "environment": "development",
        "description": "Test gate for development",
        "enabled": True,
        "is_default": False,
        "conditions": [
            {
                "metric": "bugs",
                "operator": "EQ",
                "threshold": 0,
                "description": "No bugs allowed"
            }
        ]
    }


@pytest.fixture
def sample_gate_response():
    """Sample quality gate response."""
    return {
        "id": str(uuid.uuid4()),
        "gate_id": "test-gate",
        "name": "Test Quality Gate",
        "description": "Test gate for development",
        "environment": "development",
        "enabled": True,
        "is_default": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "conditions": [
            {
                "id": str(uuid.uuid4()),
                "metric": "bugs",
                "operator": "EQ",
                "threshold": 0,
                "error_threshold": None,
                "warning_threshold": None,
                "description": "No bugs allowed",
                "enabled": True
            }
        ]
    }


class TestQualityGatesAPI:
    """Test suite for Quality Gates API endpoints."""

    def test_create_quality_gate_success(self, client, mock_service, sample_gate_data, sample_gate_response):
        """Test successful quality gate creation."""
        # Set up the mock service
        mock_gate = Mock()
        mock_gate.id = uuid.uuid4()
        mock_gate.gate_id = sample_gate_data["gate_id"]
        mock_gate.name = sample_gate_data["name"]
        mock_gate.description = sample_gate_data["description"]
        mock_gate.environment = EnvironmentType.DEVELOPMENT
        mock_gate.enabled = sample_gate_data["enabled"]
        mock_gate.is_default = sample_gate_data["is_default"]
        mock_gate.created_at = datetime.now(timezone.utc)
        mock_gate.updated_at = datetime.now(timezone.utc)
        mock_gate.conditions = []
        
        mock_service.create_quality_gate = AsyncMock(return_value=mock_gate)
        
        # Override the dependency
        override_dependency(client, mock_service)

        response = client.post("/api/quality-gates/", json=sample_gate_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["gate_id"] == sample_gate_data["gate_id"]
        assert data["name"] == sample_gate_data["name"]
        assert data["environment"] == sample_gate_data["environment"]

    def test_create_quality_gate_validation_error(self, client, mock_service):
        """Test quality gate creation with validation error."""
        invalid_data = {
            "gate_id": "",  # Invalid empty gate_id
            "name": "Test Gate",
            "environment": "invalid_environment"  # Invalid environment
        }

        response = client.post("/api/quality-gates/", json=invalid_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_quality_gate_service_error(self, client, mock_service, sample_gate_data):
        """Test quality gate creation with service error."""
        mock_service.create_quality_gate = AsyncMock(side_effect=Exception("Service error"))
        override_dependency(client, mock_service)

        response = client.post("/api/quality-gates/", json=sample_gate_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Service error" in response.json()["detail"]

    def test_get_quality_gates_success(self, client, mock_service, sample_gate_response):
        """Test successful quality gates retrieval."""
        mock_gate = Mock()
        mock_gate.id = uuid.uuid4()
        mock_gate.gate_id = "test-gate"
        mock_gate.name = "Test Gate"
        mock_gate.description = "Test description"
        mock_gate.environment = EnvironmentType.DEVELOPMENT
        mock_gate.enabled = True
        mock_gate.is_default = False
        mock_gate.created_at = datetime.now(timezone.utc)
        mock_gate.updated_at = datetime.now(timezone.utc)
        mock_gate.conditions = []

        mock_service.get_quality_gates = AsyncMock(return_value=[mock_gate])
        override_dependency(client, mock_service)

        response = client.get("/api/quality-gates/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["gate_id"] == "test-gate"

    def test_get_quality_gates_with_filters(self, client, mock_service):
        """Test quality gates retrieval with filters."""
        mock_service.get_quality_gates = AsyncMock(return_value=[])
        override_dependency(client, mock_service)

        response = client.get("/api/quality-gates/?environment=development&enabled_only=true")

        assert response.status_code == status.HTTP_200_OK
        mock_service.get_quality_gates.assert_called_once_with(
            environment="development",
            enabled_only=True
        )

    def test_get_quality_gate_success(self, client, mock_service, sample_gate_response):
        """Test successful single quality gate retrieval."""
        gate_id = "test-gate"
        
        mock_gate = Mock()
        mock_gate.id = uuid.uuid4()
        mock_gate.gate_id = gate_id
        mock_gate.name = "Test Gate"
        mock_gate.description = "Test description"
        mock_gate.environment = EnvironmentType.DEVELOPMENT
        mock_gate.enabled = True
        mock_gate.is_default = False
        mock_gate.created_at = datetime.now(timezone.utc)
        mock_gate.updated_at = datetime.now(timezone.utc)
        mock_gate.conditions = []
        
        mock_service.get_quality_gate = AsyncMock(return_value=mock_gate)
        override_dependency(client, mock_service)
        
        response = client.get(f"/api/quality-gates/{gate_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["gate_id"] == gate_id

    def test_get_quality_gate_not_found(self, client, mock_service):
        """Test quality gate retrieval when not found."""
        gate_id = "non-existent"
        
        mock_service.get_quality_gate = AsyncMock(return_value=None)
        override_dependency(client, mock_service)
        
        response = client.get(f"/api/quality-gates/{gate_id}")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Quality gate not found" in response.json()["detail"]

    def test_update_quality_gate_success(self, client, mock_service):
        """Test successful quality gate update."""
        gate_id = "test-gate"
        updates = {"name": "Updated Gate", "enabled": False}
        
        mock_gate = Mock()
        mock_gate.id = uuid.uuid4()
        mock_gate.gate_id = gate_id
        mock_gate.name = "Updated Gate"
        mock_gate.description = "Test description"
        mock_gate.environment = EnvironmentType.DEVELOPMENT
        mock_gate.enabled = False
        mock_gate.is_default = False
        mock_gate.created_at = datetime.now(timezone.utc)
        mock_gate.updated_at = datetime.now(timezone.utc)
        mock_gate.conditions = []
        
        mock_service.update_quality_gate = AsyncMock(return_value=mock_gate)
        override_dependency(client, mock_service)
        
        response = client.put(f"/api/quality-gates/{gate_id}", json=updates)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Gate"
        assert data["enabled"] == False

    def test_update_quality_gate_not_found(self, client, mock_service):
        """Test quality gate update when not found."""
        gate_id = "non-existent"
        updates = {"name": "Updated Gate"}
        
        mock_service.update_quality_gate = AsyncMock(return_value=None)
        override_dependency(client, mock_service)
        
        response = client.put(f"/api/quality-gates/{gate_id}", json=updates)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Quality gate not found" in response.json()["detail"]

    def test_delete_quality_gate_success(self, client, mock_service):
        """Test successful quality gate deletion."""
        gate_id = "test-gate"
        
        mock_service.delete_quality_gate = AsyncMock(return_value=True)
        override_dependency(client, mock_service)
        
        response = client.delete(f"/api/quality-gates/{gate_id}")
        
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_delete_quality_gate_not_found(self, client, mock_service):
        """Test quality gate deletion when not found."""
        gate_id = "non-existent"
        
        mock_service.delete_quality_gate = AsyncMock(return_value=False)
        override_dependency(client, mock_service)
        
        response = client.delete(f"/api/quality-gates/{gate_id}")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Quality gate not found" in response.json()["detail"]

    def test_evaluate_quality_gates_success(self, client, mock_service):
        """Test successful quality gates evaluation."""
        evaluation_request = {
            "metrics": {
                "bugs": 0,
                "vulnerabilities": 0,
                "codeSmells": 25
            },
            "environment": "development"
        }
        
        mock_results = [
            {
                "gateId": "test-gate",
                "gateName": "Test Gate",
                "status": "PASSED",
                "conditions": [],
                "overallScore": 100.0,
                "passedConditions": 3,
                "totalConditions": 3,
                "failedConditions": 0,
                "warningConditions": 0,
                "evaluationId": "eval-123"
            }
        ]
        
        mock_service.evaluate_quality_gates = AsyncMock(return_value=mock_results)
        override_dependency(client, mock_service)
        
        response = client.post("/api/quality-gates/evaluate", json=evaluation_request)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["gateId"] == "test-gate"
        assert data[0]["status"] == "PASSED"

    def test_evaluate_quality_gates_service_error(self, client, mock_service):
        """Test quality gates evaluation with service error."""
        evaluation_request = {
            "metrics": {"bugs": 0},
            "environment": "development"
        }
        
        mock_service.evaluate_quality_gates = AsyncMock(side_effect=Exception("Evaluation error"))
        override_dependency(client, mock_service)
        
        response = client.post("/api/quality-gates/evaluate", json=evaluation_request)
        
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Evaluation error" in response.json()["detail"]

    def test_get_environment_config_success(self, client, mock_service):
        """Test successful environment config retrieval."""
        environment = "development"
        
        mock_config = Mock()
        mock_config.environment = environment
        mock_config.default_gate_id = "reynard-development"
        mock_config.enabled = True
        
        mock_service.get_environment_config = AsyncMock(return_value=mock_config)
        override_dependency(client, mock_service)
        
        response = client.get(f"/api/quality-gates/environments/{environment}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["environment"] == environment
        assert data["defaultGateId"] == "reynard-development"

    def test_get_environment_config_not_found(self, client, mock_service):
        """Test environment config retrieval when not found."""
        environment = "non-existent"
        
        mock_service.get_environment_config = AsyncMock(return_value=None)
        override_dependency(client, mock_service)
        
        response = client.get(f"/api/quality-gates/environments/{environment}")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Environment configuration not found" in response.json()["detail"]

    def test_update_environment_config_success(self, client, mock_service):
        """Test successful environment config update."""
        environment = "development"
        config_update = {"default_gate_id": "new-dev-gate"}
        
        mock_service.set_default_gate_for_environment = AsyncMock(return_value=True)
        override_dependency(client, mock_service)
        
        response = client.put(f"/api/quality-gates/environments/{environment}", json=config_update)
        
        assert response.status_code == status.HTTP_200_OK
        assert "Environment configuration updated successfully" in response.json()["message"]

    def test_update_environment_config_failure(self, client, mock_service):
        """Test environment config update failure."""
        environment = "development"
        config_update = {"default_gate_id": "invalid-gate"}
        
        mock_service.set_default_gate_for_environment = AsyncMock(return_value=False)
        override_dependency(client, mock_service)
        
        response = client.put(f"/api/quality-gates/environments/{environment}", json=config_update)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Failed to update environment configuration" in response.json()["detail"]

    def test_initialize_default_gates_success(self, client, mock_service):
        """Test successful default gates initialization."""
        mock_gates = [Mock(), Mock(), Mock()]  # 3 default gates
        
        mock_service.create_reynard_default_gates = AsyncMock(return_value=mock_gates)
        override_dependency(client, mock_service)
        
        response = client.post("/api/quality-gates/initialize")
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "Default Reynard quality gates initialized successfully" in data["message"]
        assert data["gatesCreated"] == 3

    def test_create_reynard_default_gates_success(self, client, mock_service):
        """Test successful Reynard default gates creation."""
        mock_gates = [Mock(), Mock(), Mock()]
        
        mock_service.create_reynard_default_gates = AsyncMock(return_value=mock_gates)
        override_dependency(client, mock_service)
        
        response = client.post("/api/quality-gates/reynard-defaults")
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "Reynard quality gates created successfully" in data["message"]
        assert data["gatesCreated"] == 3

    def test_get_evaluation_history_success(self, client, mock_service):
        """Test successful evaluation history retrieval."""
        # Create a proper mock evaluation object
        mock_evaluation = Mock()
        mock_evaluation.id = uuid.uuid4()
        mock_evaluation.evaluation_id = "eval-123"
        mock_evaluation.environment = "development"
        mock_evaluation.status = GateStatus.PASSED
        mock_evaluation.overall_score = 100.0
        mock_evaluation.passed_conditions = 3
        mock_evaluation.total_conditions = 3
        mock_evaluation.failed_conditions = 0
        mock_evaluation.warning_conditions = 0
        mock_evaluation.evaluated_at = datetime.now(timezone.utc)
        
        # Create a proper mock quality gate object
        mock_quality_gate = Mock()
        mock_quality_gate.gate_id = "test-gate"
        mock_quality_gate.name = "Test Gate"
        mock_evaluation.quality_gate = mock_quality_gate
        
        mock_evaluations = [mock_evaluation]
        
        mock_service.get_evaluation_history = AsyncMock(return_value=mock_evaluations)
        override_dependency(client, mock_service)
        
        response = client.get("/api/quality-gates/evaluations?gateId=test-gate&environment=development&limit=50")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["gateId"] == "test-gate"
        assert data[0]["status"] == "PASSED"

    def test_get_evaluation_stats_success(self, client, mock_service):
        """Test successful evaluation statistics retrieval."""
        mock_stats = {
            "totalEvaluations": 100,
            "passedRate": 85.0,
            "failedRate": 10.0,
            "warningRate": 5.0,
            "averageScore": 87.5
        }
        
        mock_service.get_evaluation_stats = AsyncMock(return_value=mock_stats)
        override_dependency(client, mock_service)
        
        response = client.get("/api/quality-gates/stats?gateId=test-gate&environment=development&days=30")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["totalEvaluations"] == 100
        assert data["passedRate"] == 85.0
        assert data["failedRate"] == 10.0
        assert data["warningRate"] == 5.0
        assert data["averageScore"] == 87.5

    def test_health_check(self, client, mock_service):
        """Test health check endpoint."""
        # Override dependency to prevent database connection
        override_dependency(client, mock_service)
        
        response = client.get("/api/quality-gates/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "quality-gates"
        assert "timestamp" in data

    def test_api_error_handling(self, client, mock_service):
        """Test API error handling."""
        mock_service.get_quality_gates = AsyncMock(side_effect=Exception("Database error"))
        override_dependency(client, mock_service)
        
        response = client.get("/api/quality-gates/")
        
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Database error" in response.json()["detail"]

    def test_request_validation(self, client):
        """Test request validation."""
        # Test invalid environment
        invalid_data = {
            "gate_id": "test-gate",
            "name": "Test Gate",
            "environment": "invalid_environment"
        }
        
        response = client.post("/api/quality-gates/", json=invalid_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Test missing required fields
        incomplete_data = {
            "name": "Test Gate"
            # Missing gate_id and environment
        }
        
        response = client.post("/api/quality-gates/", json=incomplete_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_evaluation_request_validation(self, client, mock_service):
        """Test evaluation request validation."""
        # Override dependency to prevent database connection
        override_dependency(client, mock_service)
        
        # Test missing metrics
        invalid_request = {
            "environment": "development"
            # Missing metrics
        }
        
        response = client.post("/api/quality-gates/evaluate", json=invalid_request)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Test invalid environment
        invalid_request = {
            "metrics": {"bugs": 0},
            "environment": "invalid_environment"
        }
        
        response = client.post("/api/quality-gates/evaluate", json=invalid_request)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
