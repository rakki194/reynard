"""Test suite for Modular RAG Specialized Services.

Tests the new modular RAG specialized functionality including monitoring, security,
evaluation, improvement, and documentation services with the new interface-based architecture.
"""

from datetime import datetime
from typing import Any, Dict, List
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.rag.interfaces.base import ServiceStatus
from app.services.rag.services.documentation.auto_documentation import (
    AutoDocumentationService,
)
from app.services.rag.services.evaluation.model_evaluation import ModelEvaluationService
from app.services.rag.services.improvement.continuous_improvement import (
    ContinuousImprovementService,
)
from app.services.rag.services.monitoring.prometheus_monitoring import (
    PrometheusMonitoringService,
)
from app.services.rag.services.security.access_control_security import (
    AccessControlSecurityService,
)


class TestPrometheusMonitoringService:
    """Test the new modular monitoring service."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_monitoring_enabled": True,
            "rag_monitoring_interval": 60,
            "rag_alert_thresholds": {
                "latency_ms": 2000,
                "error_rate": 0.05,
                "memory_usage_mb": 1000,
            },
        }

    @pytest.fixture
    def monitoring_service(self, config: Dict[str, Any]) -> PrometheusMonitoringService:
        """Create monitoring service instance."""
        return PrometheusMonitoringService(config)

    @pytest.mark.asyncio
    async def test_monitoring_service_initialization(
        self, monitoring_service: PrometheusMonitoringService
    ):
        """Test monitoring service initialization."""
        result = await monitoring_service.initialize()
        assert result is True
        assert monitoring_service.status == ServiceStatus.HEALTHY

    @pytest.mark.asyncio
    async def test_record_metric(self, monitoring_service: PrometheusMonitoringService):
        """Test recording performance metrics."""
        await monitoring_service.initialize()

        await monitoring_service.record_metric(
            "latency",
            150.0,
            {"operation": "search"},
        )

        # Verify metric was recorded
        stats = await monitoring_service.get_monitoring_stats()
        assert "metrics" in stats

    @pytest.mark.asyncio
    async def test_get_health_status(
        self, monitoring_service: PrometheusMonitoringService
    ):
        """Test getting health status."""
        await monitoring_service.initialize()
        health = await monitoring_service.get_health_status()

        assert "status" in health
        assert "message" in health
        assert "last_updated" in health

    @pytest.mark.asyncio
    async def test_get_performance_summary(
        self, monitoring_service: PrometheusMonitoringService
    ):
        """Test getting performance summary."""
        await monitoring_service.initialize()
        summary = await monitoring_service.get_performance_summary(hours=24)

        assert "time_period" in summary
        assert "metrics" in summary
        assert "alerts" in summary

    @pytest.mark.asyncio
    async def test_generate_report(
        self, monitoring_service: PrometheusMonitoringService
    ):
        """Test generating performance report."""
        await monitoring_service.initialize()
        report = await monitoring_service.generate_report("performance", hours=24)

        assert isinstance(report, str)
        assert len(report) > 0

    def test_get_prometheus_metrics(
        self, monitoring_service: PrometheusMonitoringService
    ):
        """Test getting Prometheus metrics."""
        metrics = monitoring_service.get_prometheus_metrics()
        assert isinstance(metrics, str)

    @pytest.mark.asyncio
    async def test_health_check(self, monitoring_service: PrometheusMonitoringService):
        """Test monitoring service health check."""
        await monitoring_service.initialize()
        health = await monitoring_service.health_check()

        assert "status" in health
        assert "message" in health
        assert "last_updated" in health

    @pytest.mark.asyncio
    async def test_get_stats(self, monitoring_service: PrometheusMonitoringService):
        """Test monitoring service statistics."""
        await monitoring_service.initialize()
        stats = await monitoring_service.get_stats()

        assert "service_name" in stats
        assert "status" in stats
        assert "metrics_recorded" in stats

    @pytest.mark.asyncio
    async def test_shutdown(self, monitoring_service: PrometheusMonitoringService):
        """Test monitoring service shutdown."""
        await monitoring_service.initialize()
        await monitoring_service.shutdown()
        assert monitoring_service.status == ServiceStatus.SHUTDOWN


class TestAccessControlSecurityService:
    """Test the new modular security service."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_security_enabled": True,
            "rag_encryption_enabled": True,
            "rag_audit_logging_enabled": True,
        }

    @pytest.fixture
    def security_service(self, config: Dict[str, Any]) -> AccessControlSecurityService:
        """Create security service instance."""
        return AccessControlSecurityService(config)

    @pytest.mark.asyncio
    async def test_security_service_initialization(
        self, security_service: AccessControlSecurityService
    ):
        """Test security service initialization."""
        result = await security_service.initialize()
        assert result is True
        assert security_service.status == ServiceStatus.HEALTHY

    @pytest.mark.asyncio
    async def test_encrypt_data(self, security_service: AccessControlSecurityService):
        """Test data encryption."""
        await security_service.initialize()

        test_data = "Sensitive information"
        access_level = "confidential"

        encrypted = await security_service.encrypt_data(test_data, access_level)
        assert encrypted != test_data
        assert len(encrypted) > 0

    @pytest.mark.asyncio
    async def test_decrypt_data(self, security_service: AccessControlSecurityService):
        """Test data decryption."""
        await security_service.initialize()

        test_data = "Sensitive information"
        access_level = "confidential"

        encrypted = await security_service.encrypt_data(test_data, access_level)
        decrypted = await security_service.decrypt_data(encrypted, access_level)
        assert decrypted == test_data

    @pytest.mark.asyncio
    async def test_check_access_permission(
        self, security_service: AccessControlSecurityService
    ):
        """Test access permission checking."""
        await security_service.initialize()

        user_id = "test_user"
        operation = "read"
        resource_type = "document"
        access_level = "internal"

        has_permission = await security_service.check_access_permission(
            user_id,
            operation,
            resource_type,
            access_level,
        )
        assert isinstance(has_permission, bool)

    @pytest.mark.asyncio
    async def test_get_audit_logs(self, security_service: AccessControlSecurityService):
        """Test getting audit logs."""
        await security_service.initialize()

        logs = await security_service.get_audit_logs(
            user_id="test_user",
            hours=24,
        )
        assert isinstance(logs, list)

    @pytest.mark.asyncio
    async def test_get_security_report(
        self, security_service: AccessControlSecurityService
    ):
        """Test security report generation."""
        await security_service.initialize()
        report = await security_service.get_security_report()

        assert "report_timestamp" in report
        assert "total_audit_logs" in report
        assert "security_features" in report

    @pytest.mark.asyncio
    async def test_health_check(self, security_service: AccessControlSecurityService):
        """Test security service health check."""
        await security_service.initialize()
        health = await security_service.health_check()

        assert "status" in health
        assert "message" in health
        assert "last_updated" in health

    @pytest.mark.asyncio
    async def test_get_stats(self, security_service: AccessControlSecurityService):
        """Test security service statistics."""
        await security_service.initialize()
        stats = await security_service.get_stats()

        assert "service_name" in stats
        assert "status" in stats
        assert "total_audit_logs" in stats

    @pytest.mark.asyncio
    async def test_shutdown(self, security_service: AccessControlSecurityService):
        """Test security service shutdown."""
        await security_service.initialize()
        await security_service.shutdown()
        assert security_service.status == ServiceStatus.SHUTDOWN


class TestModelEvaluationService:
    """Test the new modular model evaluation service."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_model_evaluation_enabled": True,
            "rag_evaluation_models": ["embeddinggemma:latest", "nomic-embed-text"],
        }

    @pytest.fixture
    def mock_embedding_service(self) -> AsyncMock:
        """Mock embedding service."""
        service = AsyncMock()
        service.embed_text.return_value = [0.1, 0.2, 0.3] * 100
        service.is_healthy.return_value = True
        return service

    @pytest.fixture
    def mock_vector_store_service(self) -> AsyncMock:
        """Mock vector store service."""
        service = AsyncMock()
        service.similarity_search.return_value = [
            {"text": "function that calculates fibonacci", "score": 0.95},
            {"text": "fibonacci implementation", "score": 0.90},
        ]
        service.is_healthy.return_value = True
        return service

    @pytest.fixture
    def model_evaluator(
        self,
        config: Dict[str, Any],
        mock_embedding_service: AsyncMock,
        mock_vector_store_service: AsyncMock,
    ) -> ModelEvaluationService:
        """Create model evaluator instance."""
        evaluator = ModelEvaluationService(config)
        evaluator.set_dependencies(mock_embedding_service, mock_vector_store_service)
        return evaluator

    @pytest.mark.asyncio
    async def test_model_evaluator_initialization(
        self, model_evaluator: ModelEvaluationService
    ):
        """Test model evaluator initialization."""
        result = await model_evaluator.initialize()
        assert result is True
        assert model_evaluator.status == ServiceStatus.HEALTHY

    @pytest.mark.asyncio
    async def test_evaluate_models(self, model_evaluator: ModelEvaluationService):
        """Test model evaluation."""
        await model_evaluator.initialize()
        results = await model_evaluator.evaluate_models()

        assert isinstance(results, dict)
        assert len(results) > 0

    @pytest.mark.asyncio
    async def test_benchmark_model_performance(
        self, model_evaluator: ModelEvaluationService
    ):
        """Test model performance benchmarking."""
        await model_evaluator.initialize()
        results = await model_evaluator.benchmark_model_performance(
            "embeddinggemma:latest", test_queries=["test query"]
        )

        assert "model_name" in results
        assert "latency_ms" in results
        assert "accuracy" in results

    @pytest.mark.asyncio
    async def test_compare_models(self, model_evaluator: ModelEvaluationService):
        """Test model comparison."""
        await model_evaluator.initialize()
        results = await model_evaluator.compare_models(
            ["embeddinggemma:latest", "nomic-embed-text"]
        )

        assert "comparison_results" in results
        assert "recommendations" in results

    @pytest.mark.asyncio
    async def test_health_check(self, model_evaluator: ModelEvaluationService):
        """Test model evaluator health check."""
        await model_evaluator.initialize()
        health = await model_evaluator.health_check()

        assert "status" in health
        assert "message" in health
        assert "last_updated" in health

    @pytest.mark.asyncio
    async def test_get_stats(self, model_evaluator: ModelEvaluationService):
        """Test model evaluator statistics."""
        await model_evaluator.initialize()
        stats = await model_evaluator.get_stats()

        assert "service_name" in stats
        assert "status" in stats
        assert "models_evaluated" in stats

    @pytest.mark.asyncio
    async def test_shutdown(self, model_evaluator: ModelEvaluationService):
        """Test model evaluator shutdown."""
        await model_evaluator.initialize()
        await model_evaluator.shutdown()
        assert model_evaluator.status == ServiceStatus.SHUTDOWN


class TestContinuousImprovementService:
    """Test the new modular continuous improvement service."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_continuous_improvement_enabled": True,
            "rag_ab_testing_enabled": True,
            "rag_feedback_collection_enabled": True,
        }

    @pytest.fixture
    def improvement_service(
        self, config: Dict[str, Any]
    ) -> ContinuousImprovementService:
        """Create continuous improvement service instance."""
        return ContinuousImprovementService(config)

    @pytest.mark.asyncio
    async def test_improvement_service_initialization(
        self, improvement_service: ContinuousImprovementService
    ):
        """Test continuous improvement service initialization."""
        result = await improvement_service.initialize()
        assert result is True
        assert improvement_service.status == ServiceStatus.HEALTHY

    @pytest.mark.asyncio
    async def test_create_experiment(
        self, improvement_service: ContinuousImprovementService
    ):
        """Test A/B testing experiment creation."""
        await improvement_service.initialize()

        experiment_id = await improvement_service.create_experiment(
            name="Test Experiment",
            description="Testing new embedding model",
            hypothesis="New model will improve accuracy by 10%",
            improvement_type="accuracy",
            control_config={"model": "embeddinggemma:latest"},
            treatment_config={"model": "nomic-embed-text"},
            traffic_split=0.5,
        )

        assert experiment_id is not None

    @pytest.mark.asyncio
    async def test_start_experiment(
        self, improvement_service: ContinuousImprovementService
    ):
        """Test starting an A/B testing experiment."""
        await improvement_service.initialize()

        # Create experiment first
        experiment_id = await improvement_service.create_experiment(
            name="Test Experiment",
            description="Testing new embedding model",
            hypothesis="New model will improve accuracy by 10%",
            improvement_type="accuracy",
            control_config={"model": "embeddinggemma:latest"},
            treatment_config={"model": "nomic-embed-text"},
        )

        # Start experiment
        success = await improvement_service.start_experiment(experiment_id)
        assert success is True

    @pytest.mark.asyncio
    async def test_collect_feedback(
        self, improvement_service: ContinuousImprovementService
    ):
        """Test user feedback collection."""
        await improvement_service.initialize()

        feedback_id = await improvement_service.collect_feedback(
            user_id="user1",
            query="machine learning algorithm",
            results=[{"text": "ML implementation", "score": 0.9}],
            relevance_score=4,
            satisfaction_score=5,
            comments="Very helpful results",
        )

        assert feedback_id is not None

    @pytest.mark.asyncio
    async def test_generate_optimization_recommendations(
        self, improvement_service: ContinuousImprovementService
    ):
        """Test optimization recommendations generation."""
        await improvement_service.initialize()
        recommendations = (
            await improvement_service.generate_optimization_recommendations()
        )

        assert isinstance(recommendations, list)

    @pytest.mark.asyncio
    async def test_health_check(
        self, improvement_service: ContinuousImprovementService
    ):
        """Test continuous improvement service health check."""
        await improvement_service.initialize()
        health = await improvement_service.health_check()

        assert "status" in health
        assert "message" in health
        assert "last_updated" in health

    @pytest.mark.asyncio
    async def test_get_stats(self, improvement_service: ContinuousImprovementService):
        """Test continuous improvement service statistics."""
        await improvement_service.initialize()
        stats = await improvement_service.get_stats()

        assert "service_name" in stats
        assert "status" in stats
        assert "total_experiments" in stats

    @pytest.mark.asyncio
    async def test_shutdown(self, improvement_service: ContinuousImprovementService):
        """Test continuous improvement service shutdown."""
        await improvement_service.initialize()
        await improvement_service.shutdown()
        assert improvement_service.status == ServiceStatus.SHUTDOWN


class TestAutoDocumentationService:
    """Test the new modular documentation service."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_documentation_enabled": True,
            "rag_auto_documentation_enabled": True,
        }

    @pytest.fixture
    def documentation_service(self, config: Dict[str, Any]) -> AutoDocumentationService:
        """Create documentation service instance."""
        return AutoDocumentationService(config)

    @pytest.mark.asyncio
    async def test_documentation_service_initialization(
        self, documentation_service: AutoDocumentationService
    ):
        """Test documentation service initialization."""
        result = await documentation_service.initialize()
        assert result is True
        assert documentation_service.status == ServiceStatus.HEALTHY

    @pytest.mark.asyncio
    async def test_generate_user_documentation(
        self, documentation_service: AutoDocumentationService
    ):
        """Test user documentation generation."""
        await documentation_service.initialize()
        doc = await documentation_service.generate_user_documentation()

        assert isinstance(doc, str)
        assert len(doc) > 0

    @pytest.mark.asyncio
    async def test_generate_api_reference(
        self, documentation_service: AutoDocumentationService
    ):
        """Test API reference generation."""
        await documentation_service.initialize()
        doc = await documentation_service.generate_api_reference()

        assert isinstance(doc, str)
        assert len(doc) > 0

    @pytest.mark.asyncio
    async def test_generate_developer_guide(
        self, documentation_service: AutoDocumentationService
    ):
        """Test developer guide generation."""
        await documentation_service.initialize()
        doc = await documentation_service.generate_developer_guide()

        assert isinstance(doc, str)
        assert len(doc) > 0

    @pytest.mark.asyncio
    async def test_generate_troubleshooting_guide(
        self, documentation_service: AutoDocumentationService
    ):
        """Test troubleshooting guide generation."""
        await documentation_service.initialize()
        doc = await documentation_service.generate_troubleshooting_guide()

        assert isinstance(doc, str)
        assert len(doc) > 0

    @pytest.mark.asyncio
    async def test_generate_training_materials(
        self, documentation_service: AutoDocumentationService
    ):
        """Test comprehensive training materials generation."""
        await documentation_service.initialize()
        materials = await documentation_service.generate_training_materials()

        assert "user_guide" in materials
        assert "api_reference" in materials
        assert "developer_guide" in materials
        assert "troubleshooting" in materials

    @pytest.mark.asyncio
    async def test_save_documentation(
        self, documentation_service: AutoDocumentationService, tmp_path
    ):
        """Test saving documentation to files."""
        await documentation_service.initialize()
        output_dir = str(tmp_path / "docs")

        saved_files = await documentation_service.save_documentation(output_dir)

        assert isinstance(saved_files, dict)
        assert len(saved_files) > 0

    @pytest.mark.asyncio
    async def test_health_check(self, documentation_service: AutoDocumentationService):
        """Test documentation service health check."""
        await documentation_service.initialize()
        health = await documentation_service.health_check()

        assert "status" in health
        assert "message" in health
        assert "last_updated" in health

    @pytest.mark.asyncio
    async def test_get_stats(self, documentation_service: AutoDocumentationService):
        """Test documentation service statistics."""
        await documentation_service.initialize()
        stats = await documentation_service.get_stats()

        assert "service_name" in stats
        assert "status" in stats
        assert "templates_available" in stats

    @pytest.mark.asyncio
    async def test_shutdown(self, documentation_service: AutoDocumentationService):
        """Test documentation service shutdown."""
        await documentation_service.initialize()
        await documentation_service.shutdown()
        assert documentation_service.status == ServiceStatus.SHUTDOWN


class TestModularRAGSpecializedIntegration:
    """Integration tests for modular RAG specialized services."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_monitoring_enabled": True,
            "rag_security_enabled": True,
            "rag_continuous_improvement_enabled": True,
            "rag_documentation_enabled": True,
            "rag_model_evaluation_enabled": True,
        }

    @pytest.mark.asyncio
    async def test_advanced_services_workflow(self, config: Dict[str, Any]):
        """Test complete advanced services workflow."""
        # Initialize services
        monitoring_service = PrometheusMonitoringService(config)
        security_service = AccessControlSecurityService(config)
        improvement_service = ContinuousImprovementService(config)
        documentation_service = AutoDocumentationService(config)

        # Initialize all services
        await monitoring_service.initialize()
        await security_service.initialize()
        await improvement_service.initialize()
        await documentation_service.initialize()

        # Test performance monitoring
        await monitoring_service.record_metric(
            "latency",
            150.0,
            {"operation": "search"},
        )
        stats = await monitoring_service.get_monitoring_stats()
        assert "metrics" in stats

        # Test security
        has_permission = await security_service.check_access_permission(
            "user1",
            "read",
            "document",
            "public",
        )
        assert isinstance(has_permission, bool)

        # Test continuous improvement
        experiment_id = await improvement_service.create_experiment(
            name="Test Experiment",
            description="Testing new model",
            hypothesis="New model will improve accuracy",
            improvement_type="accuracy",
            control_config={"model": "embeddinggemma:latest"},
            treatment_config={"model": "nomic-embed-text"},
        )
        assert experiment_id is not None

        # Test documentation
        doc = await documentation_service.generate_user_documentation()
        assert isinstance(doc, str)
        assert len(doc) > 0

    @pytest.mark.asyncio
    async def test_service_dependency_management(self, config: Dict[str, Any]):
        """Test service dependency management."""
        monitoring_service = PrometheusMonitoringService(config)
        security_service = AccessControlSecurityService(config)

        await monitoring_service.initialize()
        await security_service.initialize()

        # Test that services can work independently
        health_monitoring = await monitoring_service.health_check()
        health_security = await security_service.health_check()

        assert "status" in health_monitoring
        assert "status" in health_security

    @pytest.mark.asyncio
    async def test_error_handling_and_recovery(self, config: Dict[str, Any]):
        """Test error handling and recovery mechanisms."""
        monitoring_service = PrometheusMonitoringService(config)

        # Test initialization failure
        with patch.object(monitoring_service, '_setup_prometheus') as mock_setup:
            mock_setup.side_effect = Exception("Prometheus setup failed")

            result = await monitoring_service.initialize()
            assert result is False
            assert monitoring_service.status == ServiceStatus.ERROR

        # Test recovery
        with patch.object(monitoring_service, '_setup_prometheus') as mock_setup:
            mock_setup.return_value = None

            result = await monitoring_service.initialize()
            assert result is True
            assert monitoring_service.status == ServiceStatus.HEALTHY

    @pytest.mark.asyncio
    async def test_cross_service_integration(self, config: Dict[str, Any]):
        """Test integration between different specialized services."""
        monitoring_service = PrometheusMonitoringService(config)
        security_service = AccessControlSecurityService(config)

        await monitoring_service.initialize()
        await security_service.initialize()

        # Test that monitoring can track security operations
        await security_service.check_access_permission(
            "user1",
            "read",
            "document",
            "public",
        )

        # Record a security-related metric
        await monitoring_service.record_metric(
            "security_operation",
            1.0,
            {"operation": "access_check"},
        )

        # Verify metrics were recorded
        stats = await monitoring_service.get_monitoring_stats()
        assert "metrics" in stats


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
