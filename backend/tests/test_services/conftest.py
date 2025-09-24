"""Test configuration and fixtures for RAG service tests.
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest


@pytest.fixture
def rag_config():
    """Complete RAG configuration for testing."""
    return {
        "rag_enabled": True,
        "ollama_base_url": "http://localhost:11434",
        "rag_database_url": "postgresql://test:test@localhost:5432/test_db",
        "embedding_model": "embeddinggemma:latest",
        "embedding_batch_size": 10,
        "embedding_cache_size": 1000,
        "rag_indexing_enabled": True,
        "rag_indexing_workers": 2,
        "rag_chunk_max_tokens": 512,
        "rag_chunk_min_tokens": 100,
        "rag_chunk_overlap_ratio": 0.15,
        "rag_search_enabled": True,
        "rag_search_semantic_weight": 0.7,
        "rag_search_keyword_weight": 0.3,
        "rag_search_rrf_k": 60,
        "rag_monitoring_enabled": True,
        "rag_monitoring_interval": 60,
        "rag_alert_thresholds": {
            "latency_ms": 2000,
            "error_rate": 0.05,
            "memory_usage_mb": 1000,
        },
        "rag_security_enabled": True,
        "rag_encryption_enabled": True,
        "rag_audit_logging_enabled": True,
        "rag_continuous_improvement_enabled": True,
        "rag_ab_testing_enabled": True,
        "rag_feedback_collection_enabled": True,
        "rag_documentation_enabled": True,
        "rag_auto_documentation_enabled": True,
        "rag_migrations_enabled": False,
    }


@pytest.fixture
def mock_embedding_service():
    """Mock embedding service for testing."""
    service = AsyncMock()
    service.embed_text.return_value = [0.1, 0.2, 0.3] * 100  # 300-dim embedding
    service.embed_batch.return_value = [
        [0.1, 0.2, 0.3] * 100,
        [0.4, 0.5, 0.6] * 100,
        [0.7, 0.8, 0.9] * 100,
    ]
    service.health_check.return_value = True
    service.get_embedding_stats.return_value = {
        "enabled": True,
        "model": "embeddinggemma:latest",
        "cache_hit_rate": 0.85,
        "total_requests": 100,
    }
    return service


@pytest.fixture
def mock_vector_store_service():
    """Mock vector store service for testing."""
    service = AsyncMock()
    service.health_check.return_value = {
        "status": "healthy",
        "pgvector_version": "0.5.1",
        "connection_status": "connected",
    }
    service.similarity_search.return_value = [
        {"id": 1, "text": "Test result 1", "similarity": 0.95},
        {"id": 2, "text": "Test result 2", "similarity": 0.90},
    ]
    service.insert_document_embeddings.return_value = {"inserted": 1}
    service.get_vector_store_stats.return_value = {
        "enabled": True,
        "connection_status": "connected",
        "total_embeddings": 1000,
    }
    return service


@pytest.fixture
def mock_document_indexer():
    """Mock document indexer for testing."""
    service = AsyncMock()
    service.health_check.return_value = True
    service.index_documents.return_value = {
        "status": "completed",
        "processed": 1,
        "chunks_created": 3,
    }
    service.get_metrics.return_value = {
        "enabled": True,
        "is_running": True,
        "queue_depth": 0,
        "active_workers": 2,
        "metrics": {"documents_processed": 10, "chunks_created": 30, "errors": 0},
    }
    return service


@pytest.fixture
def mock_search_engine():
    """Mock search engine for testing."""
    service = AsyncMock()
    service.health_check.return_value = True
    service.search.return_value = [
        {"id": 1, "text": "Search result 1", "score": 0.95},
        {"id": 2, "text": "Search result 2", "score": 0.90},
    ]
    service.get_search_stats.return_value = {
        "enabled": True,
        "total_searches": 100,
        "avg_latency_ms": 150.0,
        "search_types": ["semantic", "keyword", "hybrid"],
    }
    return service


@pytest.fixture
def mock_performance_monitor():
    """Mock performance monitor for testing."""
    service = AsyncMock()
    service.health_check.return_value = True
    service.record_metric.return_value = None
    service.get_performance_stats.return_value = {
        "enabled": True,
        "metrics": {
            "latency": {"count": 100, "avg": 150.0, "max": 300.0},
            "throughput": {"count": 100, "avg": 10.0, "max": 20.0},
        },
        "alerts": [],
        "system_health": "healthy",
    }
    return service


@pytest.fixture
def mock_security_service():
    """Mock security service for testing."""
    service = AsyncMock()
    service.health_check.return_value = True
    service.check_access_permission.return_value = True
    service.encrypt_data.return_value = "encrypted_data"
    service.decrypt_data.return_value = "decrypted_data"
    service.get_audit_logs.return_value = []
    service.get_security_report.return_value = {
        "report_timestamp": "2024-01-01T00:00:00",
        "total_audit_logs": 100,
        "success_rate": 0.95,
        "security_features": {
            "encryption": True,
            "audit_logging": True,
            "access_control": True,
        },
    }
    service.get_security_stats.return_value = {
        "enabled": True,
        "total_audit_logs": 100,
        "active_policies": 4,
        "encryption_keys_configured": 4,
    }
    return service


@pytest.fixture
def mock_continuous_improvement():
    """Mock continuous improvement service for testing."""
    service = AsyncMock()
    service.health_check.return_value = True
    service.create_experiment.return_value = "exp_123"
    service.start_experiment.return_value = True
    service.collect_experiment_data.return_value = True
    service.analyze_experiment.return_value = {
        "overall_success": True,
        "significant_improvements": 2,
        "total_metrics": 3,
        "recommendation": "implement",
    }
    service.collect_feedback.return_value = "feedback_123"
    service.get_improvement_progress.return_value = {
        "current_month": "2024-01",
        "target_improvement_percent": 5.0,
        "actual_improvement_percent": 7.5,
        "on_track": True,
    }
    service.get_continuous_improvement_stats.return_value = {
        "enabled": True,
        "total_experiments": 5,
        "active_experiments": 2,
        "total_feedback": 50,
    }
    return service


@pytest.fixture
def mock_documentation_service():
    """Mock documentation service for testing."""
    service = AsyncMock()
    service.health_check.return_value = True
    service.generate_user_documentation.return_value = (
        "# RAG System User Guide\n\nTest documentation"
    )
    service.generate_api_reference.return_value = (
        "# RAG System API Reference\n\nTest API docs"
    )
    service.generate_developer_guide.return_value = (
        "# RAG System Developer Guide\n\nTest dev guide"
    )
    service.generate_troubleshooting_guide.return_value = (
        "# Troubleshooting Guide\n\nTest troubleshooting"
    )
    service.generate_training_materials.return_value = {
        "user_guide": "# User Guide",
        "api_reference": "# API Reference",
        "developer_guide": "# Developer Guide",
        "troubleshooting": "# Troubleshooting",
    }
    service.save_documentation.return_value = {
        "user_guide": "/tmp/docs/user_guide.md",
        "api_reference": "/tmp/docs/api_reference.md",
        "developer_guide": "/tmp/docs/developer_guide.md",
        "troubleshooting": "/tmp/docs/troubleshooting.md",
    }
    service.get_documentation_stats.return_value = {
        "enabled": True,
        "templates_available": 4,
        "api_examples_count": 10,
        "best_practices_categories": 4,
    }
    return service


@pytest.fixture
def mock_model_evaluator():
    """Mock model evaluator for testing."""
    service = AsyncMock()
    service.evaluate_models.return_value = {
        "embeddinggemma:latest": {
            "model_name": "embeddinggemma:latest",
            "retrieval_accuracy": 0.85,
            "latency_ms": 150.0,
            "memory_usage_mb": 200.0,
            "code_specificity": 0.8,
            "throughput_per_second": 10.0,
            "error_rate": 0.01,
            "timestamp": "2024-01-01T00:00:00",
        },
    }
    service.generate_evaluation_report.return_value = (
        "# Model Evaluation Report\n\nTest report"
    )
    service.get_evaluation_stats.return_value = {
        "models_to_test": 5,
        "test_queries": 10,
        "evaluations_completed": 1,
        "models_available": ["embeddinggemma:latest", "nomic-embed-text"],
    }
    return service


@pytest.fixture
def sample_documents():
    """Sample documents for testing."""
    return [
        {
            "file_id": "test_1",
            "content": '''
def hello():
    """Return a greeting."""
    return "Hello, World!"

def fibonacci(n):
    """Calculate fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

class Calculator:
    """Simple calculator class."""
    
    def add(self, a, b):
        """Add two numbers."""
        return a + b
    
    def multiply(self, a, b):
        """Multiply two numbers."""
        return a * b
''',
            "file_path": "test.py",
            "language": "python",
        },
        {
            "file_id": "test_2",
            "content": """
function greetUser(name) {
    return `Hello, ${name}!`;
}

function calculateSum(a, b) {
    return a + b;
}

class UserManager {
    constructor() {
        this.users = [];
    }
    
    addUser(user) {
        this.users.push(user);
    }
    
    getUserCount() {
        return this.users.length;
    }
}
""",
            "file_path": "test.js",
            "language": "javascript",
        },
    ]


@pytest.fixture
def sample_search_queries():
    """Sample search queries for testing."""
    return [
        "hello function",
        "calculator class",
        "fibonacci calculation",
        "user management",
        "authentication system",
    ]


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_http_client():
    """Mock HTTP client for testing."""
    client = AsyncMock()
    response = AsyncMock()
    response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
    response.status = 200
    client.post.return_value.__aenter__.return_value = response
    return client


@pytest.fixture
def mock_database_connection():
    """Mock database connection for testing."""
    connection = AsyncMock()
    connection.execute.return_value.rowcount = 1
    connection.execute.return_value.fetchall.return_value = [
        {"id": 1, "text": "test result", "similarity": 0.95},
    ]
    connection.execute.return_value.fetchone.return_value = ["pgvector"]
    return connection


@pytest.fixture
def mock_sqlalchemy_engine():
    """Mock SQLAlchemy engine for testing."""
    engine = MagicMock()
    engine.connect.return_value.__enter__.return_value = mock_database_connection()
    return engine
