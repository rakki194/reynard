"""Test suite for RAG Advanced Services.

Tests the advanced RAG functionality including monitoring, security, improvement, documentation, and evaluation.
"""

from unittest.mock import AsyncMock

import pytest

from app.services.rag.advanced import (
    ContinuousImprovement,
    DocumentationService,
    ModelEvaluator,
    PerformanceMonitor,
    SecurityService,
)


class TestPerformanceMonitor:
    """Test performance monitoring functionality."""

    @pytest.fixture
    def config(self):
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
    def performance_monitor(self, config):
        """Create performance monitor instance."""
        return PerformanceMonitor(config)

    @pytest.mark.asyncio
    async def test_performance_monitor_initialization(self, performance_monitor):
        """Test performance monitor initialization."""
        assert performance_monitor is not None
        assert performance_monitor.config is not None
        assert performance_monitor.enabled is True

    @pytest.mark.asyncio
    async def test_record_metric(self, performance_monitor):
        """Test recording performance metrics."""
        await performance_monitor.record_metric(
            "latency", 150.0, {"operation": "search"},
        )

        stats = performance_monitor.get_performance_stats()
        assert "latency" in stats["metrics"]
        assert stats["metrics"]["latency"]["count"] >= 1

    @pytest.mark.asyncio
    async def test_alert_threshold_exceeded(self, performance_monitor):
        """Test alert generation when thresholds are exceeded."""
        # Record metric that exceeds threshold
        await performance_monitor.record_metric(
            "latency", 3000.0, {"operation": "search"},
        )

        alerts = await performance_monitor.check_alerts()
        assert len(alerts) > 0
        assert any(alert["metric"] == "latency" for alert in alerts)

    @pytest.mark.asyncio
    async def test_performance_regression_detection(self, performance_monitor):
        """Test performance regression detection."""
        # Record baseline metrics
        for i in range(10):
            await performance_monitor.record_metric(
                "latency", 100.0 + i, {"operation": "search"},
            )

        # Record degraded metrics
        for i in range(10):
            await performance_monitor.record_metric(
                "latency", 200.0 + i, {"operation": "search"},
            )

        regressions = await performance_monitor.detect_regressions()
        assert len(regressions) > 0

    def test_get_performance_stats(self, performance_monitor):
        """Test performance statistics retrieval."""
        stats = performance_monitor.get_performance_stats()

        assert "enabled" in stats
        assert "metrics" in stats
        assert "alerts" in stats
        assert "system_health" in stats

    @pytest.mark.asyncio
    async def test_capacity_planning(self, performance_monitor):
        """Test capacity planning recommendations."""
        # Record high usage metrics
        for i in range(100):
            await performance_monitor.record_metric("memory_usage", 800.0 + i, {})

        recommendations = await performance_monitor.get_capacity_recommendations()
        assert len(recommendations) > 0
        assert any("memory" in rec["type"].lower() for rec in recommendations)


class TestSecurityService:
    """Test security service functionality."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_security_enabled": True,
            "rag_encryption_enabled": True,
            "rag_audit_logging_enabled": True,
        }

    @pytest.fixture
    def security_service(self, config):
        """Create security service instance."""
        return SecurityService(config)

    @pytest.mark.asyncio
    async def test_security_service_initialization(self, security_service):
        """Test security service initialization."""
        assert security_service is not None
        assert security_service.enabled is True
        assert len(security_service.encryption_keys) > 0

    @pytest.mark.asyncio
    async def test_data_encryption(self, security_service):
        """Test data encryption and decryption."""
        test_data = "Sensitive information"
        access_level = security_service.AccessLevel.CONFIDENTIAL

        encrypted = await security_service.encrypt_data(test_data, access_level)
        assert encrypted != test_data
        assert len(encrypted) > 0

        decrypted = await security_service.decrypt_data(encrypted, access_level)
        assert decrypted == test_data

    @pytest.mark.asyncio
    async def test_access_permission_check(self, security_service):
        """Test access permission checking."""
        user_id = "test_user"
        operation = security_service.OperationType.READ
        resource_type = "document"
        access_level = security_service.AccessLevel.INTERNAL

        # Test allowed access
        has_permission = await security_service.check_access_permission(
            user_id, operation, resource_type, access_level,
        )
        assert has_permission is True

    @pytest.mark.asyncio
    async def test_audit_logging(self, security_service):
        """Test audit logging functionality."""
        user_id = "test_user"
        operation = security_service.OperationType.SEARCH
        resource_type = "document"
        access_level = security_service.AccessLevel.PUBLIC

        # Perform operation that should be logged
        await security_service.check_access_permission(
            user_id, operation, resource_type, access_level,
        )

        # Check audit logs
        logs = await security_service.get_audit_logs(user_id=user_id)
        assert len(logs) > 0
        assert any(log["user_id"] == user_id for log in logs)

    @pytest.mark.asyncio
    async def test_suspicious_activity_detection(self, security_service):
        """Test suspicious activity detection."""
        user_id = "suspicious_user"
        operation = security_service.OperationType.READ
        resource_type = "document"
        access_level = security_service.AccessLevel.RESTRICTED

        # Simulate multiple failed access attempts
        for i in range(6):
            await security_service._log_audit_event(
                user_id,
                operation,
                resource_type,
                f"resource_{i}",
                access_level,
                success=False,
                details={"error": "Access denied"},
            )

        # Check if suspicious activity was detected
        logs = await security_service.get_audit_logs(user_id=user_id)
        assert len(logs) >= 6

    @pytest.mark.asyncio
    async def test_security_report_generation(self, security_service):
        """Test security report generation."""
        # Generate some audit activity
        await security_service.check_access_permission(
            "user1",
            security_service.OperationType.READ,
            "document",
            security_service.AccessLevel.PUBLIC,
        )

        report = await security_service.get_security_report()
        assert "report_timestamp" in report
        assert "total_audit_logs" in report
        assert "success_rate" in report
        assert "security_features" in report

    def test_get_security_stats(self, security_service):
        """Test security service statistics."""
        stats = security_service.get_security_stats()

        assert "enabled" in stats
        assert "total_audit_logs" in stats
        assert "active_policies" in stats
        assert "encryption_keys_configured" in stats


class TestContinuousImprovement:
    """Test continuous improvement functionality."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_continuous_improvement_enabled": True,
            "rag_ab_testing_enabled": True,
            "rag_feedback_collection_enabled": True,
        }

    @pytest.fixture
    def continuous_improvement(self, config):
        """Create continuous improvement instance."""
        return ContinuousImprovement(config)

    @pytest.mark.asyncio
    async def test_continuous_improvement_initialization(self, continuous_improvement):
        """Test continuous improvement initialization."""
        assert continuous_improvement is not None
        assert continuous_improvement.enabled is True

    @pytest.mark.asyncio
    async def test_create_experiment(self, continuous_improvement):
        """Test A/B testing experiment creation."""
        experiment_id = await continuous_improvement.create_experiment(
            name="Test Experiment",
            description="Testing new embedding model",
            hypothesis="New model will improve accuracy by 10%",
            improvement_type=continuous_improvement.ImprovementType.ACCURACY,
            control_config={"model": "embeddinggemma:latest"},
            treatment_config={"model": "nomic-embed-text"},
            traffic_split=0.5,
        )

        assert experiment_id is not None
        assert experiment_id in continuous_improvement.experiments

    @pytest.mark.asyncio
    async def test_start_experiment(self, continuous_improvement):
        """Test starting an A/B testing experiment."""
        # Create experiment first
        experiment_id = await continuous_improvement.create_experiment(
            name="Test Experiment",
            description="Testing new embedding model",
            hypothesis="New model will improve accuracy by 10%",
            improvement_type=continuous_improvement.ImprovementType.ACCURACY,
            control_config={"model": "embeddinggemma:latest"},
            treatment_config={"model": "nomic-embed-text"},
        )

        # Start experiment
        success = await continuous_improvement.start_experiment(experiment_id)
        assert success is True

        experiment = continuous_improvement.experiments[experiment_id]
        assert experiment.status == continuous_improvement.ExperimentStatus.RUNNING

    @pytest.mark.asyncio
    async def test_collect_experiment_data(self, continuous_improvement):
        """Test collecting experiment data."""
        # Create and start experiment
        experiment_id = await continuous_improvement.create_experiment(
            name="Test Experiment",
            description="Testing new embedding model",
            hypothesis="New model will improve accuracy by 10%",
            improvement_type=continuous_improvement.ImprovementType.ACCURACY,
            control_config={"model": "embeddinggemma:latest"},
            treatment_config={"model": "nomic-embed-text"},
        )
        await continuous_improvement.start_experiment(experiment_id)

        # Collect data
        success = await continuous_improvement.collect_experiment_data(
            experiment_id, "user1", "control", {"accuracy": 0.85},
        )
        assert success is True

    @pytest.mark.asyncio
    async def test_analyze_experiment(self, continuous_improvement):
        """Test experiment analysis."""
        # Create and start experiment
        experiment_id = await continuous_improvement.create_experiment(
            name="Test Experiment",
            description="Testing new embedding model",
            hypothesis="New model will improve accuracy by 10%",
            improvement_type=continuous_improvement.ImprovementType.ACCURACY,
            control_config={"model": "embeddinggemma:latest"},
            treatment_config={"model": "nomic-embed-text"},
            minimum_sample_size=2,
        )
        await continuous_improvement.start_experiment(experiment_id)

        # Collect sample data
        await continuous_improvement.collect_experiment_data(
            experiment_id, "user1", "control", {"accuracy": 0.80},
        )
        await continuous_improvement.collect_experiment_data(
            experiment_id, "user2", "treatment", {"accuracy": 0.90},
        )

        # Analyze experiment
        analysis = await continuous_improvement.analyze_experiment(experiment_id)
        assert "overall_success" in analysis
        assert "metric_analysis" in analysis

    @pytest.mark.asyncio
    async def test_collect_feedback(self, continuous_improvement):
        """Test user feedback collection."""
        feedback_id = await continuous_improvement.collect_feedback(
            user_id="user1",
            query="machine learning algorithm",
            results=[{"text": "ML implementation", "score": 0.9}],
            relevance_score=4,
            satisfaction_score=5,
            comments="Very helpful results",
        )

        assert feedback_id is not None
        assert len(continuous_improvement.feedback_data) > 0

    @pytest.mark.asyncio
    async def test_get_improvement_progress(self, continuous_improvement):
        """Test improvement progress tracking."""
        progress = await continuous_improvement.get_improvement_progress()

        assert "current_month" in progress
        assert "target_improvement_percent" in progress
        assert "actual_improvement_percent" in progress
        assert "on_track" in progress

    def test_get_continuous_improvement_stats(self, continuous_improvement):
        """Test continuous improvement statistics."""
        stats = continuous_improvement.get_continuous_improvement_stats()

        assert "enabled" in stats
        assert "total_experiments" in stats
        assert "active_experiments" in stats
        assert "total_feedback" in stats


class TestDocumentationService:
    """Test documentation service functionality."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_documentation_enabled": True,
            "rag_auto_documentation_enabled": True,
        }

    @pytest.fixture
    def documentation_service(self, config):
        """Create documentation service instance."""
        return DocumentationService(config)

    @pytest.mark.asyncio
    async def test_documentation_service_initialization(self, documentation_service):
        """Test documentation service initialization."""
        assert documentation_service is not None
        assert documentation_service.enabled is True
        assert len(documentation_service.templates) > 0

    @pytest.mark.asyncio
    async def test_generate_user_documentation(self, documentation_service):
        """Test user documentation generation."""
        doc = await documentation_service.generate_user_documentation()

        assert "RAG System User Guide" in doc
        assert "Quick Start" in doc
        assert "API Examples" in doc
        assert "Best Practices" in doc

    @pytest.mark.asyncio
    async def test_generate_api_reference(self, documentation_service):
        """Test API reference generation."""
        doc = await documentation_service.generate_api_reference()

        assert "RAG System API Reference" in doc
        assert "RAGService" in doc
        assert "Methods" in doc

    @pytest.mark.asyncio
    async def test_generate_developer_guide(self, documentation_service):
        """Test developer guide generation."""
        doc = await documentation_service.generate_developer_guide()

        assert "RAG System Developer Guide" in doc
        assert "System Architecture" in doc
        assert "Development Setup" in doc

    @pytest.mark.asyncio
    async def test_generate_troubleshooting_guide(self, documentation_service):
        """Test troubleshooting guide generation."""
        doc = await documentation_service.generate_troubleshooting_guide()

        assert "RAG System Troubleshooting Guide" in doc
        assert "Common Issues" in doc

    @pytest.mark.asyncio
    async def test_generate_training_materials(self, documentation_service):
        """Test comprehensive training materials generation."""
        materials = await documentation_service.generate_training_materials()

        assert "user_guide" in materials
        assert "api_reference" in materials
        assert "developer_guide" in materials
        assert "troubleshooting" in materials

    @pytest.mark.asyncio
    async def test_save_documentation(self, documentation_service, tmp_path):
        """Test saving documentation to files."""
        output_dir = str(tmp_path / "docs")

        saved_files = await documentation_service.save_documentation(output_dir)

        assert len(saved_files) == 4
        assert "user_guide" in saved_files
        assert "api_reference" in saved_files
        assert "developer_guide" in saved_files
        assert "troubleshooting" in saved_files

    def test_get_documentation_stats(self, documentation_service):
        """Test documentation service statistics."""
        stats = documentation_service.get_documentation_stats()

        assert "enabled" in stats
        assert "templates_available" in stats
        assert "api_examples_count" in stats
        assert "best_practices_categories" in stats


class TestModelEvaluator:
    """Test model evaluation functionality."""

    @pytest.fixture
    def mock_embedding_service(self):
        """Mock embedding service."""
        service = AsyncMock()
        service.embed_text.return_value = [0.1, 0.2, 0.3] * 100
        return service

    @pytest.fixture
    def mock_vector_store_service(self):
        """Mock vector store service."""
        service = AsyncMock()
        service.similarity_search.return_value = [
            {"text": "function that calculates fibonacci", "score": 0.95},
            {"text": "fibonacci implementation", "score": 0.90},
        ]
        return service

    @pytest.fixture
    def model_evaluator(self, mock_embedding_service, mock_vector_store_service):
        """Create model evaluator instance."""
        return ModelEvaluator(mock_embedding_service, mock_vector_store_service)

    def test_model_evaluator_initialization(self, model_evaluator):
        """Test model evaluator initialization."""
        assert model_evaluator is not None
        assert len(model_evaluator.test_queries) > 0
        assert len(model_evaluator.models_to_test) > 0

    @pytest.mark.asyncio
    async def test_evaluate_models(self, model_evaluator):
        """Test model evaluation."""
        results = await model_evaluator.evaluate_models()

        assert len(results) > 0
        assert all("embeddinggemma" in model for model in results.keys())

        for model, metrics in results.items():
            assert hasattr(metrics, "model_name")
            assert hasattr(metrics, "retrieval_accuracy")
            assert hasattr(metrics, "latency_ms")

    def test_calculate_retrieval_accuracy(self, model_evaluator):
        """Test retrieval accuracy calculation."""
        results = [
            {"text": "function that calculates fibonacci numbers"},
            {"text": "fibonacci implementation"},
        ]
        expected = ["fibonacci", "fib", "calculate_fibonacci"]

        accuracy = model_evaluator._calculate_retrieval_accuracy(results, expected)
        assert 0.0 <= accuracy <= 1.0

    def test_rank_models(self, model_evaluator):
        """Test model ranking."""
        # Create mock evaluation results
        results = {
            "model1": model_evaluator.EvaluationMetrics(
                model_name="model1",
                retrieval_accuracy=0.9,
                latency_ms=100.0,
                memory_usage_mb=200.0,
                code_specificity=0.8,
                throughput_per_second=10.0,
                error_rate=0.01,
                timestamp="2024-01-01",
            ),
            "model2": model_evaluator.EvaluationMetrics(
                model_name="model2",
                retrieval_accuracy=0.8,
                latency_ms=150.0,
                memory_usage_mb=150.0,
                code_specificity=0.7,
                throughput_per_second=8.0,
                error_rate=0.02,
                timestamp="2024-01-01",
            ),
        }

        rankings = model_evaluator.rank_models(results)
        assert len(rankings) == 2
        assert rankings[0][1] >= rankings[1][1]  # First model should have higher score

    def test_generate_evaluation_report(self, model_evaluator):
        """Test evaluation report generation."""
        # Create mock evaluation results
        results = {
            "model1": model_evaluator.EvaluationMetrics(
                model_name="model1",
                retrieval_accuracy=0.9,
                latency_ms=100.0,
                memory_usage_mb=200.0,
                code_specificity=0.8,
                throughput_per_second=10.0,
                error_rate=0.01,
                timestamp="2024-01-01",
            ),
        }

        report = model_evaluator.generate_evaluation_report(results)

        assert "Embedding Model Evaluation Report" in report
        assert "Model Rankings" in report
        assert "Detailed Metrics" in report
        assert "Recommendations" in report

    def test_get_evaluation_stats(self, model_evaluator):
        """Test evaluation statistics."""
        stats = model_evaluator.get_evaluation_stats()

        assert "models_to_test" in stats
        assert "test_queries" in stats
        assert "evaluations_completed" in stats
        assert "models_available" in stats


class TestRAGAdvancedIntegration:
    """Integration tests for RAG advanced services."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_monitoring_enabled": True,
            "rag_security_enabled": True,
            "rag_continuous_improvement_enabled": True,
            "rag_documentation_enabled": True,
        }

    @pytest.mark.asyncio
    async def test_advanced_services_workflow(self, config):
        """Test complete advanced services workflow."""
        # Initialize services
        performance_monitor = PerformanceMonitor(config)
        security_service = SecurityService(config)
        continuous_improvement = ContinuousImprovement(config)
        documentation_service = DocumentationService(config)

        # Test performance monitoring
        await performance_monitor.record_metric(
            "latency", 150.0, {"operation": "search"},
        )
        stats = performance_monitor.get_performance_stats()
        assert "metrics" in stats

        # Test security
        has_permission = await security_service.check_access_permission(
            "user1",
            security_service.OperationType.READ,
            "document",
            security_service.AccessLevel.PUBLIC,
        )
        assert has_permission is True

        # Test continuous improvement
        experiment_id = await continuous_improvement.create_experiment(
            name="Test Experiment",
            description="Testing new model",
            hypothesis="New model will improve accuracy",
            improvement_type=continuous_improvement.ImprovementType.ACCURACY,
            control_config={"model": "embeddinggemma:latest"},
            treatment_config={"model": "nomic-embed-text"},
        )
        assert experiment_id is not None

        # Test documentation
        doc = await documentation_service.generate_user_documentation()
        assert "RAG System User Guide" in doc


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
