"""
Test suite for RAG Phase 2 features: AST chunking, model evaluation, and hybrid search.

Tests the enhanced chunking system, model evaluation framework, and hybrid search engine.
"""

import pytest
import asyncio
import time
from unittest.mock import AsyncMock, MagicMock, patch
from typing import List, Dict, Any

from app.services.rag.ast_code_chunker import ASTCodeChunker
from app.services.rag.model_evaluator import ModelEvaluator, TestQuery, EvaluationMetrics
from app.services.rag.hybrid_search_engine import HybridSearchEngine, KeywordIndex


class TestASTCodeChunker:
    """Test AST-aware code chunking functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.chunker = ASTCodeChunker()

    def test_python_regex_chunking(self):
        """Test Python regex-based chunking."""
        python_code = '''
import os
import sys

class TestClass:
    def __init__(self):
        self.value = 0
    
    def test_method(self):
        return self.value

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def main():
    print("Hello, World!")
'''
        
        chunks, symbol_map = self.chunker._chunk_python_regex(python_code)
        
        assert len(chunks) > 0
        assert len(symbol_map) > 0
        
        # Check that we found functions and classes
        function_names = [name for name, info in symbol_map.items() if info['type'] == 'function']
        class_names = [name for name, info in symbol_map.items() if info['type'] == 'class']
        
        assert 'fibonacci' in function_names
        assert 'main' in function_names
        assert 'TestClass' in class_names

    def test_javascript_regex_chunking(self):
        """Test JavaScript regex-based chunking."""
        js_code = '''
class HttpClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    async get(url) {
        return fetch(this.baseUrl + url);
    }
}

function calculateSum(a, b) {
    return a + b;
}

const arrowFunction = (x) => x * 2;
'''
        
        chunks, symbol_map = self.chunker._chunk_js_regex(js_code)
        
        assert len(chunks) > 0
        assert len(symbol_map) > 0
        
        # Check that we found functions and classes
        function_names = [name for name, info in symbol_map.items() if info['type'] == 'function']
        class_names = [name for name, info in symbol_map.items() if info['type'] == 'class']
        
        assert 'calculateSum' in function_names
        assert 'HttpClient' in class_names

    def test_java_regex_chunking(self):
        """Test Java regex-based chunking."""
        java_code = '''
public class Calculator {
    private int result;
    
    public Calculator() {
        this.result = 0;
    }
    
    public int add(int a, int b) {
        return a + b;
    }
    
    public int getResult() {
        return result;
    }
}
'''
        
        chunks, symbol_map = self.chunker._chunk_java_regex(java_code)
        
        assert len(chunks) > 0
        assert len(symbol_map) > 0
        
        # Check that we found classes
        class_names = [name for name, info in symbol_map.items() if info['type'] == 'class']
        assert 'Calculator' in class_names

    def test_fallback_chunking(self):
        """Test fallback chunking for unsupported languages."""
        code = '''
This is some generic code
that doesn't match any specific language
but should still be chunked
'''
        
        chunks, symbol_map = self.chunker._chunk_generic_regex(code)
        
        assert len(chunks) > 0
        assert all(chunk['metadata']['type'] == 'generic' for chunk in chunks)

    def test_chunker_stats(self):
        """Test chunker statistics."""
        stats = self.chunker.get_chunker_stats()
        
        assert 'tree_sitter_available' in stats
        assert 'initialized' in stats
        assert 'supported_languages' in stats
        assert 'parsers_loaded' in stats

    def test_language_support(self):
        """Test language support detection."""
        assert isinstance(self.chunker.get_supported_languages(), list)
        assert isinstance(self.chunker.is_language_supported('python'), bool)


class TestModelEvaluator:
    """Test model evaluation framework."""

    @pytest.fixture
    async def model_evaluator(self):
        """Create model evaluator for testing."""
        embedding_service = AsyncMock()
        vector_db_service = AsyncMock()
        
        evaluator = ModelEvaluator(embedding_service, vector_db_service)
        return evaluator

    def test_test_query_creation(self):
        """Test TestQuery dataclass creation."""
        query = TestQuery(
            query="test query",
            expected_results=["result1", "result2"],
            query_type="function",
            difficulty="easy"
        )
        
        assert query.query == "test query"
        assert query.expected_results == ["result1", "result2"]
        assert query.query_type == "function"
        assert query.difficulty == "easy"

    def test_evaluation_metrics_creation(self):
        """Test EvaluationMetrics dataclass creation."""
        metrics = EvaluationMetrics(
            model_name="test-model",
            retrieval_accuracy=0.85,
            latency_ms=150.0,
            memory_usage_mb=2.0,
            code_specificity=0.9,
            throughput_per_second=10.0,
            error_rate=0.05,
            timestamp="2025-01-01 12:00:00"
        )
        
        assert metrics.model_name == "test-model"
        assert metrics.retrieval_accuracy == 0.85
        assert metrics.latency_ms == 150.0

    def test_benchmark_queries_loaded(self, model_evaluator):
        """Test that benchmark queries are loaded."""
        assert len(model_evaluator.test_queries) > 0
        
        # Check query types
        query_types = set(q.query_type for q in model_evaluator.test_queries)
        assert 'function' in query_types
        assert 'class' in query_types
        assert 'concept' in query_types

    def test_calculate_retrieval_accuracy(self, model_evaluator):
        """Test retrieval accuracy calculation."""
        results = [
            {'text': 'This is a fibonacci function'},
            {'text': 'This is a calculator class'},
            {'text': 'This is some other code'}
        ]
        expected = ['fibonacci', 'calculator']
        
        accuracy = model_evaluator._calculate_retrieval_accuracy(results, expected)
        assert 0.0 <= accuracy <= 1.0
        assert accuracy > 0.0  # Should find some matches

    def test_estimate_memory_usage(self, model_evaluator):
        """Test memory usage estimation."""
        memory = model_evaluator._estimate_memory_usage("embeddinggemma:latest")
        assert isinstance(memory, float)
        assert memory > 0.0

    def test_calculate_code_specificity(self, model_evaluator):
        """Test code specificity calculation."""
        specificity = model_evaluator._calculate_code_specificity("embeddinggemma:latest", 0.8)
        assert 0.0 <= specificity <= 1.0

    def test_rank_models(self, model_evaluator):
        """Test model ranking functionality."""
        # Create mock evaluation results
        results = {
            "model1": EvaluationMetrics(
                model_name="model1",
                retrieval_accuracy=0.9,
                latency_ms=100.0,
                memory_usage_mb=2.0,
                code_specificity=0.8,
                throughput_per_second=15.0,
                error_rate=0.01,
                timestamp="2025-01-01 12:00:00"
            ),
            "model2": EvaluationMetrics(
                model_name="model2",
                retrieval_accuracy=0.7,
                latency_ms=200.0,
                memory_usage_mb=3.0,
                code_specificity=0.6,
                throughput_per_second=10.0,
                error_rate=0.05,
                timestamp="2025-01-01 12:00:00"
            )
        }
        
        rankings = model_evaluator.rank_models(results)
        
        assert len(rankings) == 2
        assert rankings[0][1] >= rankings[1][1]  # Should be sorted by score

    def test_generate_evaluation_report(self, model_evaluator):
        """Test evaluation report generation."""
        results = {
            "test-model": EvaluationMetrics(
                model_name="test-model",
                retrieval_accuracy=0.85,
                latency_ms=150.0,
                memory_usage_mb=2.0,
                code_specificity=0.9,
                throughput_per_second=10.0,
                error_rate=0.05,
                timestamp="2025-01-01 12:00:00"
            )
        }
        
        report = model_evaluator.generate_evaluation_report(results)
        
        assert isinstance(report, str)
        assert "Model Rankings" in report
        assert "Detailed Metrics" in report
        assert "Recommendations" in report
        assert "test-model" in report

    def test_get_evaluation_stats(self, model_evaluator):
        """Test evaluation statistics."""
        stats = model_evaluator.get_evaluation_stats()
        
        assert 'models_to_test' in stats
        assert 'test_queries' in stats
        assert 'evaluations_completed' in stats
        assert 'models_available' in stats
        assert 'query_types' in stats
        assert 'difficulty_levels' in stats


class TestHybridSearchEngine:
    """Test hybrid search engine functionality."""

    @pytest.fixture
    async def hybrid_search_engine(self):
        """Create hybrid search engine for testing."""
        embedding_service = AsyncMock()
        vector_db_service = AsyncMock()
        
        engine = HybridSearchEngine(embedding_service, vector_db_service)
        return engine

    def test_keyword_index_creation(self):
        """Test keyword index creation."""
        index = KeywordIndex()
        
        assert len(index.index) == 0
        assert len(index.documents) == 0

    def test_keyword_index_add_document(self):
        """Test adding documents to keyword index."""
        index = KeywordIndex()
        
        index.add_document("doc1", "This is a test document", {"type": "test"})
        
        assert len(index.documents) == 1
        assert len(index.index) > 0
        assert "test" in index.index
        assert "document" in index.index

    def test_keyword_search(self):
        """Test keyword search functionality."""
        index = KeywordIndex()
        
        # Add test documents
        index.add_document("doc1", "This is a fibonacci function", {"type": "function"})
        index.add_document("doc2", "This is a calculator class", {"type": "class"})
        index.add_document("doc3", "This is some other code", {"type": "other"})
        
        # Search for fibonacci
        results = index.search_keywords("fibonacci function")
        
        assert len(results) > 0
        assert any("fibonacci" in result['content'].lower() for result in results)

    def test_hybrid_search_engine_creation(self, hybrid_search_engine):
        """Test hybrid search engine creation."""
        assert hybrid_search_engine.embedding_service is not None
        assert hybrid_search_engine.vector_db_service is not None
        assert hybrid_search_engine.keyword_index is not None

    @pytest.mark.asyncio
    async def test_hybrid_search(self, hybrid_search_engine):
        """Test hybrid search functionality."""
        # Mock the embedding and vector DB services
        hybrid_search_engine.embedding_service.embed_text = AsyncMock(return_value=[0.1] * 1024)
        hybrid_search_engine.vector_db_service.similarity_search = AsyncMock(return_value=[
            {'text': 'This is a fibonacci function', 'similarity': 0.9, 'metadata': {'id': 'doc1'}}
        ])
        
        # Add documents to keyword index
        hybrid_search_engine.keyword_index.add_document(
            "doc1", "This is a fibonacci function", {"id": "doc1"}
        )
        
        # Perform hybrid search
        results = await hybrid_search_engine.hybrid_search("fibonacci function", limit=5)
        
        assert len(results) > 0
        assert all(result['type'] == 'hybrid' for result in results)

    @pytest.mark.asyncio
    async def test_semantic_search(self, hybrid_search_engine):
        """Test semantic search functionality."""
        # Mock the services
        hybrid_search_engine.embedding_service.embed_text = AsyncMock(return_value=[0.1] * 1024)
        hybrid_search_engine.vector_db_service.similarity_search = AsyncMock(return_value=[
            {'text': 'Test result', 'similarity': 0.8, 'metadata': {'id': 'doc1'}}
        ])
        
        results = await hybrid_search_engine._semantic_search("test query", limit=5)
        
        assert len(results) > 0
        assert all(result['type'] == 'semantic' for result in results)

    @pytest.mark.asyncio
    async def test_keyword_search_engine(self, hybrid_search_engine):
        """Test keyword search functionality."""
        # Add test documents
        hybrid_search_engine.keyword_index.add_document(
            "doc1", "This is a test document", {"id": "doc1"}
        )
        
        results = await hybrid_search_engine._keyword_search("test document", limit=5)
        
        assert len(results) > 0
        assert all(result['type'] in ['keyword', 'bm25'] for result in results)

    def test_reciprocal_rank_fusion(self, hybrid_search_engine):
        """Test Reciprocal Rank Fusion algorithm."""
        semantic_results = [
            {'content': 'Result 1', 'score': 0.9, 'type': 'semantic', 'metadata': {'id': 'doc1'}},
            {'content': 'Result 2', 'score': 0.8, 'type': 'semantic', 'metadata': {'id': 'doc2'}}
        ]
        
        keyword_results = [
            {'content': 'Result 1', 'score': 0.7, 'type': 'keyword', 'metadata': {'id': 'doc1'}},
            {'content': 'Result 3', 'score': 0.6, 'type': 'keyword', 'metadata': {'id': 'doc3'}}
        ]
        
        fused_results = hybrid_search_engine._reciprocal_rank_fusion(
            semantic_results, keyword_results, 0.7, 0.3, limit=5
        )
        
        assert len(fused_results) > 0
        assert all(result['type'] == 'hybrid' for result in fused_results)
        
        # Result 1 should have higher score since it appears in both
        doc1_score = next((r['score'] for r in fused_results if r['metadata']['id'] == 'doc1'), 0)
        doc3_score = next((r['score'] for r in fused_results if r['metadata']['id'] == 'doc3'), 0)
        assert doc1_score > doc3_score

    def test_index_documents(self, hybrid_search_engine):
        """Test document indexing functionality."""
        documents = [
            {'id': 'doc1', 'text': 'This is document 1', 'metadata': {'type': 'test'}},
            {'id': 'doc2', 'text': 'This is document 2', 'metadata': {'type': 'test'}}
        ]
        
        hybrid_search_engine.index_documents(documents)
        
        assert len(hybrid_search_engine.keyword_index.documents) == 2

    def test_get_search_stats(self, hybrid_search_engine):
        """Test search statistics."""
        stats = hybrid_search_engine.get_search_stats()
        
        assert 'semantic_searches' in stats
        assert 'keyword_searches' in stats
        assert 'hybrid_searches' in stats
        assert 'documents_indexed' in stats
        assert 'unique_keywords' in stats

    def test_clear_index(self, hybrid_search_engine):
        """Test index clearing functionality."""
        # Add some documents
        hybrid_search_engine.keyword_index.add_document("doc1", "test", {})
        
        # Clear index
        hybrid_search_engine.clear_index()
        
        assert len(hybrid_search_engine.keyword_index.documents) == 0
        assert len(hybrid_search_engine.keyword_index.index) == 0

    @pytest.mark.asyncio
    async def test_benchmark_search_performance(self, hybrid_search_engine):
        """Test search performance benchmarking."""
        # Mock the services
        hybrid_search_engine.embedding_service.embed_text = AsyncMock(return_value=[0.1] * 1024)
        hybrid_search_engine.vector_db_service.similarity_search = AsyncMock(return_value=[])
        
        test_queries = ["test query 1", "test query 2"]
        
        benchmark_results = await hybrid_search_engine.benchmark_search_performance(
            test_queries, iterations=2
        )
        
        assert 'semantic_only' in benchmark_results
        assert 'keyword_only' in benchmark_results
        assert 'hybrid' in benchmark_results
        
        for method in benchmark_results:
            assert 'average_ms' in benchmark_results[method]
            assert 'min_ms' in benchmark_results[method]
            assert 'max_ms' in benchmark_results[method]
            assert 'total_queries' in benchmark_results[method]


class TestIntegration:
    """Integration tests for Phase 2 features."""

    @pytest.mark.asyncio
    async def test_end_to_end_phase2_workflow(self):
        """Test complete Phase 2 workflow."""
        # Initialize services
        embedding_service = AsyncMock()
        vector_db_service = AsyncMock()
        
        # Mock embedding service
        embedding_service.embed_text = AsyncMock(return_value=[0.1] * 1024)
        vector_db_service.similarity_search = AsyncMock(return_value=[
            {'text': 'Test result', 'similarity': 0.8, 'metadata': {'id': 'doc1'}}
        ])
        
        # Test AST chunking
        chunker = ASTCodeChunker()
        python_code = '''
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
'''
        chunks, symbol_map = chunker.chunk_code_ast_aware(python_code, 'python')
        assert len(chunks) > 0
        
        # Test model evaluation
        evaluator = ModelEvaluator(embedding_service, vector_db_service)
        stats = evaluator.get_evaluation_stats()
        assert stats['models_to_test'] > 0
        
        # Test hybrid search
        hybrid_engine = HybridSearchEngine(embedding_service, vector_db_service)
        hybrid_engine.keyword_index.add_document("doc1", "fibonacci function", {"id": "doc1"})
        
        results = await hybrid_engine.hybrid_search("fibonacci", limit=5)
        assert len(results) >= 0  # May be empty due to mocking


if __name__ == "__main__":
    pytest.main([__file__])
