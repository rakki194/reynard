"""Pytest configuration for Modular RAG Services.

This module provides shared fixtures and configuration for all modular RAG service tests.
"""

import asyncio
import os
import tempfile
from typing import Any, Dict, List
from unittest.mock import AsyncMock, MagicMock

import pytest


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def base_config() -> Dict[str, Any]:
    """Base configuration for RAG services."""
    return {
        "rag_enabled": True,
        "ollama_base_url": "http://localhost:11434",
        "rag_database_url": "postgresql://test:test@localhost:5432/test_db",
        "rag_migrations_enabled": False,
        "rag_indexing_enabled": True,
        "rag_search_enabled": True,
        "rag_monitoring_enabled": True,
        "rag_security_enabled": True,
        "rag_continuous_improvement_enabled": True,
        "rag_documentation_enabled": True,
        "rag_model_evaluation_enabled": True,
        "rag_continuous_indexing_enabled": True,
        "rag_initial_indexing_enabled": True,
    }


@pytest.fixture
def embedding_config(base_config: Dict[str, Any]) -> Dict[str, Any]:
    """Configuration for embedding service."""
    config = base_config.copy()
    config.update(
        {
            "embedding_model": "embeddinggemma:latest",
            "embedding_batch_size": 10,
            "embedding_cache_size": 1000,
        }
    )
    return config


@pytest.fixture
def vector_store_config(base_config: Dict[str, Any]) -> Dict[str, Any]:
    """Configuration for vector store service."""
    config = base_config.copy()
    config.update(
        {
            "rag_migrations_enabled": False,
        }
    )
    return config


@pytest.fixture
def search_config(base_config: Dict[str, Any]) -> Dict[str, Any]:
    """Configuration for search service."""
    config = base_config.copy()
    config.update(
        {
            "rag_search_semantic_weight": 0.7,
            "rag_search_keyword_weight": 0.3,
            "rag_search_rrf_k": 60,
        }
    )
    return config


@pytest.fixture
def monitoring_config(base_config: Dict[str, Any]) -> Dict[str, Any]:
    """Configuration for monitoring service."""
    config = base_config.copy()
    config.update(
        {
            "rag_monitoring_interval": 60,
            "rag_alert_thresholds": {
                "latency_ms": 2000,
                "error_rate": 0.05,
                "memory_usage_mb": 1000,
            },
        }
    )
    return config


@pytest.fixture
def security_config(base_config: Dict[str, Any]) -> Dict[str, Any]:
    """Configuration for security service."""
    config = base_config.copy()
    config.update(
        {
            "rag_encryption_enabled": True,
            "rag_audit_logging_enabled": True,
        }
    )
    return config


@pytest.fixture
def improvement_config(base_config: Dict[str, Any]) -> Dict[str, Any]:
    """Configuration for continuous improvement service."""
    config = base_config.copy()
    config.update(
        {
            "rag_ab_testing_enabled": True,
            "rag_feedback_collection_enabled": True,
        }
    )
    return config


@pytest.fixture
def documentation_config(base_config: Dict[str, Any]) -> Dict[str, Any]:
    """Configuration for documentation service."""
    config = base_config.copy()
    config.update(
        {
            "rag_auto_documentation_enabled": True,
        }
    )
    return config


@pytest.fixture
def evaluation_config(base_config: Dict[str, Any]) -> Dict[str, Any]:
    """Configuration for model evaluation service."""
    config = base_config.copy()
    config.update(
        {
            "rag_evaluation_models": ["embeddinggemma:latest", "nomic-embed-text"],
        }
    )
    return config


@pytest.fixture
def mock_embedding_service():
    """Mock embedding service."""
    service = AsyncMock()
    service.embed_text.return_value = [0.1, 0.2, 0.3] * 100
    service.embed_batch.return_value = [[0.1, 0.2, 0.3] * 100 for _ in range(3)]
    service.get_available_models.return_value = [
        "embeddinggemma:latest",
        "nomic-embed-text",
    ]
    service.get_best_model.return_value = "embeddinggemma:latest"
    service.is_healthy.return_value = True
    service.health_check.return_value = {"status": "healthy", "message": "OK"}
    service.get_stats.return_value = {"embedding_requests": 10, "cache_hit_rate": 0.8}
    return service


@pytest.fixture
def mock_vector_store_service():
    """Mock vector store service."""
    service = AsyncMock()
    service.similarity_search.return_value = [
        {"id": 1, "text": "Test result 1", "similarity": 0.95},
        {"id": 2, "text": "Test result 2", "similarity": 0.90},
    ]
    service.insert_document_embeddings.return_value = 1
    service.get_document_chunks.return_value = [
        {"id": 1, "text": "Chunk 1", "metadata": {}},
        {"id": 2, "text": "Chunk 2", "metadata": {}},
    ]
    service.delete_document.return_value = True
    service.get_dataset_stats.return_value = {
        "total_documents": 100,
        "total_chunks": 500,
    }
    service.is_healthy.return_value = True
    service.health_check.return_value = {"status": "healthy", "message": "OK"}
    service.get_stats.return_value = {
        "total_embeddings": 100,
        "connection_status": "connected",
    }
    return service


@pytest.fixture
def mock_document_indexer():
    """Mock document indexer."""
    service = AsyncMock()
    service.index_documents.return_value = [
        {"status": "success", "file_id": "test_1"},
    ]
    service.get_supported_languages.return_value = [
        "python",
        "typescript",
        "javascript",
    ]
    service.is_language_supported.return_value = True
    service.is_healthy.return_value = True
    service.health_check.return_value = {"status": "healthy", "message": "OK"}
    service.get_stats.return_value = {"documents_processed": 5, "queue_depth": 0}
    return service


@pytest.fixture
def mock_search_engine():
    """Mock search engine."""
    service = AsyncMock()
    service.semantic_search.return_value = [
        {"id": 1, "text": "Semantic result", "score": 0.95},
    ]
    service.keyword_search.return_value = [
        {"id": 1, "text": "Keyword result", "score": 0.85},
    ]
    service.hybrid_search.return_value = [
        {"id": 1, "text": "Hybrid result", "score": 0.92},
    ]
    service.search_with_filters.return_value = [
        {"id": 1, "text": "Filtered result", "score": 0.90},
    ]
    service.populate_from_vector_store.return_value = None
    service.clear_index.return_value = None
    service.benchmark_search_performance.return_value = {
        "semantic_search": {"avg_latency": 100},
        "keyword_search": {"avg_latency": 50},
        "hybrid_search": {"avg_latency": 75},
    }
    service.is_healthy.return_value = True
    service.health_check.return_value = {"status": "healthy", "message": "OK"}
    service.get_stats.return_value = {"total_searches": 20, "avg_latency_ms": 75}
    return service


@pytest.fixture
def mock_performance_monitor():
    """Mock performance monitor."""
    service = AsyncMock()
    service.record_metric.return_value = None
    service.get_health_status.return_value = {"status": "healthy", "message": "OK"}
    service.get_performance_summary.return_value = {
        "time_period": "24h",
        "metrics": {"latency": {"avg": 100}},
        "alerts": [],
    }
    service.generate_report.return_value = "Performance Report Content"
    service.get_prometheus_metrics.return_value = "# HELP test_metric Test metric"
    service.is_healthy.return_value = True
    service.health_check.return_value = {"status": "healthy", "message": "OK"}
    service.get_stats.return_value = {"metrics_recorded": 100, "alerts_active": 0}
    return service


@pytest.fixture
def mock_security_service():
    """Mock security service."""
    service = AsyncMock()
    service.encrypt_data.return_value = "encrypted_data_123"
    service.decrypt_data.return_value = "original_data"
    service.check_access_permission.return_value = True
    service.get_audit_logs.return_value = [
        {"user_id": "test_user", "operation": "read", "timestamp": "2024-01-01"},
    ]
    service.get_security_report.return_value = {
        "report_timestamp": "2024-01-01",
        "total_audit_logs": 100,
        "security_features": ["encryption", "audit_logging"],
    }
    service.is_healthy.return_value = True
    service.health_check.return_value = {"status": "healthy", "message": "OK"}
    service.get_stats.return_value = {"total_audit_logs": 100, "active_policies": 5}
    return service


@pytest.fixture
def mock_model_evaluator():
    """Mock model evaluator."""
    service = AsyncMock()
    service.evaluate_models.return_value = {
        "embeddinggemma:latest": {"accuracy": 0.95, "latency": 100}
    }
    service.benchmark_model_performance.return_value = {
        "model_name": "embeddinggemma:latest",
        "latency_ms": 100,
        "accuracy": 0.95,
    }
    service.compare_models.return_value = {
        "comparison_results": {"model1": 0.95, "model2": 0.90},
        "recommendations": ["Use model1 for better accuracy"],
    }
    service.is_healthy.return_value = True
    service.health_check.return_value = {"status": "healthy", "message": "OK"}
    service.get_stats.return_value = {"models_evaluated": 2, "evaluations_completed": 5}
    return service


@pytest.fixture
def mock_continuous_improvement():
    """Mock continuous improvement service."""
    service = AsyncMock()
    service.create_experiment.return_value = "exp_123"
    service.start_experiment.return_value = True
    service.collect_feedback.return_value = "feedback_123"
    service.generate_optimization_recommendations.return_value = [
        {"type": "performance", "description": "Optimize cache"},
    ]
    service.is_healthy.return_value = True
    service.health_check.return_value = {"status": "healthy", "message": "OK"}
    service.get_stats.return_value = {"total_experiments": 3, "active_experiments": 1}
    return service


@pytest.fixture
def mock_documentation_service():
    """Mock documentation service."""
    service = AsyncMock()
    service.generate_user_documentation.return_value = "User Documentation Content"
    service.generate_api_reference.return_value = "API Reference Content"
    service.generate_developer_guide.return_value = "Developer Guide Content"
    service.generate_troubleshooting_guide.return_value = (
        "Troubleshooting Guide Content"
    )
    service.generate_training_materials.return_value = {
        "user_guide": "User Guide",
        "api_reference": "API Reference",
        "developer_guide": "Developer Guide",
        "troubleshooting": "Troubleshooting Guide",
    }
    service.save_documentation.return_value = {
        "user_guide": "user_guide.md",
        "api_reference": "api_reference.md",
    }
    service.is_healthy.return_value = True
    service.health_check.return_value = {"status": "healthy", "message": "OK"}
    service.get_stats.return_value = {"templates_available": 4, "docs_generated": 10}
    return service


@pytest.fixture
def mock_file_indexing_service():
    """Mock file indexing service."""
    service = AsyncMock()
    service.initialize.return_value = True
    service.is_healthy.return_value = True
    service.health_check.return_value = {"status": "healthy", "message": "OK"}
    service.get_stats.return_value = {"files_indexed": 100, "index_size_mb": 50}
    return service


@pytest.fixture
def mock_continuous_indexing():
    """Mock continuous indexing service."""
    service = AsyncMock()
    service.initialize.return_value = True
    service.start_watching.return_value = None
    service.shutdown.return_value = None
    service.set_rag_service.return_value = None
    service.get_stats.return_value = {"files_watched": 100, "changes_detected": 5}
    return service


@pytest.fixture
def mock_initial_indexing():
    """Mock initial indexing service."""
    service = AsyncMock()
    service.initialize.return_value = None
    service.is_database_empty.return_value = True
    service.perform_initial_indexing.return_value = None
    service.get_stats.return_value = {"files_processed": 100, "status": "completed"}
    return service


@pytest.fixture
def temp_dir():
    """Temporary directory for tests."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        yield tmp_dir


@pytest.fixture
def sample_documents() -> List[Dict[str, Any]]:
    """Sample documents for testing."""
    return [
        {
            "file_id": "test_1",
            "content": "def hello(): return 'world'",
            "file_path": "test.py",
            "language": "python",
            "metadata": {"chunk_type": "function"},
        },
        {
            "file_id": "test_2",
            "content": "class TestClass: pass",
            "file_path": "test.py",
            "language": "python",
            "metadata": {"chunk_type": "class"},
        },
        {
            "file_id": "test_3",
            "content": "const hello = () => 'world';",
            "file_path": "test.ts",
            "language": "typescript",
            "metadata": {"chunk_type": "function"},
        },
    ]


@pytest.fixture
def sample_queries() -> List[str]:
    """Sample queries for testing."""
    return [
        "hello function",
        "test class",
        "machine learning algorithm",
        "authentication system",
        "database connection",
    ]


@pytest.fixture
def sample_embeddings() -> List[List[float]]:
    """Sample embeddings for testing."""
    return [
        [0.1, 0.2, 0.3] * 100,  # 300-dim embedding
        [0.4, 0.5, 0.6] * 100,
        [0.7, 0.8, 0.9] * 100,
    ]


@pytest.fixture
def sample_search_results() -> List[Dict[str, Any]]:
    """Sample search results for testing."""
    return [
        {
            "id": 1,
            "text": "function that calculates fibonacci numbers",
            "score": 0.95,
            "metadata": {"file_path": "math.py", "chunk_type": "function"},
        },
        {
            "id": 2,
            "text": "fibonacci implementation with memoization",
            "score": 0.90,
            "metadata": {"file_path": "algorithms.py", "chunk_type": "function"},
        },
        {
            "id": 3,
            "text": "recursive fibonacci function",
            "score": 0.85,
            "metadata": {"file_path": "recursion.py", "chunk_type": "function"},
        },
    ]


# Pytest configuration
def pytest_configure(config):
    """Configure pytest for RAG modular tests."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line("markers", "integration: marks tests as integration tests")
    config.addinivalue_line("markers", "unit: marks tests as unit tests")


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers."""
    for item in items:
        # Add unit marker to all tests by default
        if "integration" not in item.keywords:
            item.add_marker(pytest.mark.unit)

        # Mark slow tests
        if "slow" in item.keywords:
            item.add_marker(pytest.mark.slow)
