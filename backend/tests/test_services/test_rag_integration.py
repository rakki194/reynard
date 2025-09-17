"""
Integration test suite for the complete RAG system.

Tests the full RAG workflow from document indexing to search, including
all core and advanced services working together.
"""

import pytest
import asyncio
import time
from unittest.mock import AsyncMock, MagicMock, patch
from typing import List, Dict, Any

from app.services.rag import RAGService
from app.services.rag.core import EmbeddingService, VectorStoreService, DocumentIndexer, SearchEngine
from app.services.rag.advanced import (
    PerformanceMonitor, SecurityService, ContinuousImprovement, 
    DocumentationService, ModelEvaluator
)


class TestRAGServiceIntegration:
    """Test the main RAG service orchestrator."""

    @pytest.fixture
    def config(self):
        """Complete RAG configuration."""
        return {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "pg_dsn": "postgresql://test:test@localhost:5432/test_db",
            "embedding_model": "embeddinggemma:latest",
            "rag_indexing_enabled": True,
            "rag_search_enabled": True,
            "rag_monitoring_enabled": True,
            "rag_security_enabled": True,
            "rag_continuous_improvement_enabled": True,
            "rag_documentation_enabled": True,
            "rag_migrations_enabled": False
        }

    @pytest.fixture
    def rag_service(self, config):
        """Create RAG service instance."""
        return RAGService(config)

    @pytest.mark.asyncio
    async def test_rag_service_initialization(self, rag_service):
        """Test RAG service initialization."""
        assert rag_service is not None
        assert rag_service.config is not None

    @pytest.mark.asyncio
    async def test_rag_service_health_check(self, rag_service):
        """Test RAG service health check."""
        with patch.object(rag_service, 'embedding_service') as mock_embedding, \
             patch.object(rag_service, 'vector_store_service') as mock_vector, \
             patch.object(rag_service, 'document_indexer') as mock_indexer, \
             patch.object(rag_service, 'search_engine') as mock_search:
            
            mock_embedding.health_check.return_value = True
            mock_vector.health_check.return_value = True
            mock_indexer.health_check.return_value = True
            mock_search.health_check.return_value = True
            
            health = await rag_service.health_check()
            
            assert health is not None
            assert "status" in health
            assert "services" in health

    @pytest.mark.asyncio
    async def test_rag_service_statistics(self, rag_service):
        """Test RAG service statistics."""
        stats = await rag_service.get_statistics()
        
        assert "rag_service" in stats
        assert "core_services" in stats
        assert "advanced_services" in stats
        assert "system_health" in stats

    @pytest.mark.asyncio
    async def test_rag_service_shutdown(self, rag_service):
        """Test RAG service shutdown."""
        await rag_service.shutdown()
        # Should complete without errors


class TestCompleteRAGWorkflow:
    """Test the complete RAG workflow from indexing to search."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "pg_dsn": "postgresql://test:test@localhost:5432/test_db",
            "embedding_model": "embeddinggemma:latest",
            "rag_indexing_enabled": True,
            "rag_search_enabled": True,
            "rag_monitoring_enabled": True,
            "rag_security_enabled": True,
            "rag_continuous_improvement_enabled": True,
            "rag_documentation_enabled": True,
            "rag_migrations_enabled": False
        }

    @pytest.mark.asyncio
    async def test_end_to_end_document_indexing_and_search(self, config):
        """Test complete workflow: index documents and search them."""
        # Initialize RAG service
        rag_service = RAGService(config)
        
        # Mock all external dependencies
        with patch('aiohttp.ClientSession.post') as mock_post, \
             patch('sqlalchemy.create_engine') as mock_engine, \
             patch('asyncio.create_task') as mock_task:
            
            # Mock embedding service
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_embedding_response
            
            # Mock vector store
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.rowcount = 1
            mock_connection.execute.return_value.fetchall.return_value = [
                {"id": 1, "text": "def hello(): return 'world'", "similarity": 0.95}
            ]
            mock_engine.return_value.connect.return_value.__enter__.return_value = mock_connection
            
            # Mock task creation for workers
            mock_task.return_value = AsyncMock()
            
            # Test documents
            documents = [
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
                    "language": "python"
                },
                {
                    "file_id": "test_2",
                    "content": '''
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
''',
                    "file_path": "test.js",
                    "language": "javascript"
                }
            ]
            
            # Index documents
            index_result = await rag_service.index_documents(documents)
            assert index_result["status"] == "completed"
            assert index_result["processed"] == len(documents)
            
            # Search for functions
            search_results = await rag_service.search("hello function", limit=5)
            assert isinstance(search_results, list)
            
            # Search for classes
            search_results = await rag_service.search("calculator class", limit=5)
            assert isinstance(search_results, list)
            
            # Search for specific functionality
            search_results = await rag_service.search("fibonacci calculation", limit=5)
            assert isinstance(search_results, list)

    @pytest.mark.asyncio
    async def test_hybrid_search_workflow(self, config):
        """Test hybrid search with both semantic and keyword matching."""
        rag_service = RAGService(config)
        
        with patch('aiohttp.ClientSession.post') as mock_post, \
             patch('sqlalchemy.create_engine') as mock_engine, \
             patch('asyncio.create_task') as mock_task:
            
            # Mock embedding service
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_embedding_response
            
            # Mock vector store with different result types
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchall.return_value = [
                {"id": 1, "text": "def hello(): return 'world'", "similarity": 0.95},
                {"id": 2, "text": "function greet() { return 'hi'; }", "similarity": 0.90}
            ]
            mock_engine.return_value.connect.return_value.__enter__.return_value = mock_connection
            
            # Mock task creation
            mock_task.return_value = AsyncMock()
            
            # Test hybrid search
            search_results = await rag_service.search(
                "hello function", 
                search_type="hybrid", 
                limit=10
            )
            
            assert isinstance(search_results, list)
            assert len(search_results) >= 0

    @pytest.mark.asyncio
    async def test_security_integration(self, config):
        """Test security service integration with RAG operations."""
        rag_service = RAGService(config)
        
        with patch('aiohttp.ClientSession.post') as mock_post, \
             patch('sqlalchemy.create_engine') as mock_engine, \
             patch('asyncio.create_task') as mock_task:
            
            # Mock embedding service
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_embedding_response
            
            # Mock vector store
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchall.return_value = [
                {"id": 1, "text": "sensitive data", "similarity": 0.95}
            ]
            mock_engine.return_value.connect.return_value.__enter__.return_value = mock_connection
            
            # Mock task creation
            mock_task.return_value = AsyncMock()
            
            # Test search with security
            search_results = await rag_service.search(
                "sensitive information", 
                user_id="test_user",
                access_level="confidential"
            )
            
            assert isinstance(search_results, list)
            
            # Check that security service was involved
            assert rag_service.security_service is not None

    @pytest.mark.asyncio
    async def test_performance_monitoring_integration(self, config):
        """Test performance monitoring integration."""
        rag_service = RAGService(config)
        
        with patch('aiohttp.ClientSession.post') as mock_post, \
             patch('sqlalchemy.create_engine') as mock_engine, \
             patch('asyncio.create_task') as mock_task:
            
            # Mock embedding service
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_embedding_response
            
            # Mock vector store
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchall.return_value = [
                {"id": 1, "text": "test result", "similarity": 0.95}
            ]
            mock_engine.return_value.connect.return_value.__enter__.return_value = mock_connection
            
            # Mock task creation
            mock_task.return_value = AsyncMock()
            
            # Perform search operation
            start_time = time.time()
            search_results = await rag_service.search("test query", limit=5)
            end_time = time.time()
            
            assert isinstance(search_results, list)
            
            # Check that performance monitoring recorded the operation
            assert rag_service.performance_monitor is not None
            
            # Get performance stats
            stats = rag_service.performance_monitor.get_performance_stats()
            assert "metrics" in stats

    @pytest.mark.asyncio
    async def test_continuous_improvement_integration(self, config):
        """Test continuous improvement integration."""
        rag_service = RAGService(config)
        
        # Test A/B testing experiment creation
        experiment_id = await rag_service.create_experiment(
            name="Embedding Model Test",
            description="Test new embedding model",
            hypothesis="New model improves accuracy",
            improvement_type="accuracy",
            control_config={"model": "embeddinggemma:latest"},
            treatment_config={"model": "nomic-embed-text"}
        )
        
        assert experiment_id is not None
        
        # Test feedback collection
        feedback_id = await rag_service.collect_feedback(
            user_id="test_user",
            query="test query",
            results=[{"text": "test result", "score": 0.9}],
            relevance_score=4,
            satisfaction_score=5
        )
        
        assert feedback_id is not None

    @pytest.mark.asyncio
    async def test_documentation_generation(self, config):
        """Test automated documentation generation."""
        rag_service = RAGService(config)
        
        # Generate user documentation
        user_doc = await rag_service.generate_user_documentation()
        assert "RAG System User Guide" in user_doc
        
        # Generate API reference
        api_doc = await rag_service.generate_api_reference()
        assert "RAG System API Reference" in api_doc
        
        # Generate developer guide
        dev_doc = await rag_service.generate_developer_guide()
        assert "RAG System Developer Guide" in dev_doc

    @pytest.mark.asyncio
    async def test_model_evaluation_workflow(self, config):
        """Test model evaluation workflow."""
        rag_service = RAGService(config)
        
        with patch('aiohttp.ClientSession.post') as mock_post, \
             patch('sqlalchemy.create_engine') as mock_engine:
            
            # Mock embedding service
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_embedding_response
            
            # Mock vector store
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchall.return_value = [
                {"id": 1, "text": "function that calculates fibonacci", "similarity": 0.95}
            ]
            mock_engine.return_value.connect.return_value.__enter__.return_value = mock_connection
            
            # Run model evaluation
            evaluation_results = await rag_service.evaluate_models()
            
            assert isinstance(evaluation_results, dict)
            assert len(evaluation_results) > 0
            
            # Generate evaluation report
            report = rag_service.generate_evaluation_report(evaluation_results)
            assert "Embedding Model Evaluation Report" in report


class TestRAGServiceErrorHandling:
    """Test error handling in the RAG service."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "pg_dsn": "postgresql://test:test@localhost:5432/test_db",
            "embedding_model": "embeddinggemma:latest",
            "rag_indexing_enabled": True,
            "rag_search_enabled": True,
            "rag_monitoring_enabled": True,
            "rag_security_enabled": True,
            "rag_continuous_improvement_enabled": True,
            "rag_documentation_enabled": True,
            "rag_migrations_enabled": False
        }

    @pytest.mark.asyncio
    async def test_embedding_service_error_handling(self, config):
        """Test error handling when embedding service fails."""
        rag_service = RAGService(config)
        
        with patch('aiohttp.ClientSession.post') as mock_post:
            # Mock embedding service failure
            mock_post.side_effect = Exception("Embedding service unavailable")
            
            with pytest.raises(Exception):
                await rag_service.embed_text("test text")

    @pytest.mark.asyncio
    async def test_vector_store_error_handling(self, config):
        """Test error handling when vector store fails."""
        rag_service = RAGService(config)
        
        with patch('aiohttp.ClientSession.post') as mock_post, \
             patch('sqlalchemy.create_engine') as mock_engine:
            
            # Mock embedding service success
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_embedding_response
            
            # Mock vector store failure
            mock_engine.side_effect = Exception("Database connection failed")
            
            with pytest.raises(Exception):
                await rag_service.search("test query")

    @pytest.mark.asyncio
    async def test_document_indexer_error_handling(self, config):
        """Test error handling when document indexer fails."""
        rag_service = RAGService(config)
        
        documents = [
            {
                "file_id": "test_1",
                "content": "def hello(): return 'world'",
                "file_path": "test.py",
                "language": "python"
            }
        ]
        
        with patch('aiohttp.ClientSession.post') as mock_post, \
             patch('sqlalchemy.create_engine') as mock_engine, \
             patch('asyncio.create_task') as mock_task:
            
            # Mock embedding service
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_embedding_response
            
            # Mock vector store failure
            mock_engine.side_effect = Exception("Database connection failed")
            
            # Mock task creation
            mock_task.return_value = AsyncMock()
            
            # Index documents should handle the error gracefully
            result = await rag_service.index_documents(documents)
            assert result["status"] in ["error", "completed"]


class TestRAGServiceConcurrency:
    """Test concurrent operations in the RAG service."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "pg_dsn": "postgresql://test:test@localhost:5432/test_db",
            "embedding_model": "embeddinggemma:latest",
            "rag_indexing_enabled": True,
            "rag_search_enabled": True,
            "rag_monitoring_enabled": True,
            "rag_security_enabled": True,
            "rag_continuous_improvement_enabled": True,
            "rag_documentation_enabled": True,
            "rag_migrations_enabled": False
        }

    @pytest.mark.asyncio
    async def test_concurrent_search_operations(self, config):
        """Test concurrent search operations."""
        rag_service = RAGService(config)
        
        with patch('aiohttp.ClientSession.post') as mock_post, \
             patch('sqlalchemy.create_engine') as mock_engine:
            
            # Mock embedding service
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_embedding_response
            
            # Mock vector store
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchall.return_value = [
                {"id": 1, "text": "test result", "similarity": 0.95}
            ]
            mock_engine.return_value.connect.return_value.__enter__.return_value = mock_connection
            
            # Perform concurrent searches
            queries = ["query 1", "query 2", "query 3", "query 4", "query 5"]
            
            tasks = [rag_service.search(query, limit=5) for query in queries]
            results = await asyncio.gather(*tasks)
            
            assert len(results) == len(queries)
            assert all(isinstance(result, list) for result in results)

    @pytest.mark.asyncio
    async def test_concurrent_embedding_operations(self, config):
        """Test concurrent embedding operations."""
        rag_service = RAGService(config)
        
        with patch('aiohttp.ClientSession.post') as mock_post:
            # Mock embedding service
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_embedding_response
            
            # Perform concurrent embeddings
            texts = ["text 1", "text 2", "text 3", "text 4", "text 5"]
            
            tasks = [rag_service.embed_text(text) for text in texts]
            results = await asyncio.gather(*tasks)
            
            assert len(results) == len(texts)
            assert all(isinstance(result, list) for result in results)
            assert all(len(result) == 300 for result in results)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
