#!/usr/bin/env python3
"""
Comprehensive Tests for Document Categorization System
====================================================

Test suite for the document categorization and paper indexing integration services.
Ensures all functionality works correctly with various test cases.

🦊 Fox approach: We test our categorization system with the cunning precision
of a fox, ensuring every component works flawlessly!
"""

import asyncio
import json
import pytest
import tempfile
from pathlib import Path
from typing import Dict, Any, List
from unittest.mock import Mock, patch

# Add the backend app to the path
import sys
sys.path.append(str(Path(__file__).parent.parent))

from app.services.rag.services.core.document_categorization import (
    DocumentCategorizationService, 
    DocumentCategory, 
    ScientificDomain
)
from app.services.rag.services.core.paper_indexing_integration import PaperIndexingIntegration
from app.config.rag_config import get_rag_config


class TestDocumentCategorizationService:
    """Test suite for DocumentCategorizationService."""
    
    @pytest.fixture
    async def categorization_service(self):
        """Create a test categorization service."""
        config = {
            "document_categorization_enabled": True,
            "categorization_cache_enabled": False,  # Disable cache for testing
            "min_confidence_threshold": 0.3,
            "papers_directory": "/tmp/test_papers"
        }
        service = DocumentCategorizationService(config)
        await service.initialize()
        yield service
        await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_initialization(self, categorization_service):
        """Test service initialization."""
        assert categorization_service.enabled is True
        assert categorization_service.status.value == "healthy"
        assert categorization_service.cache_enabled is False
    
    @pytest.mark.asyncio
    async def test_categorize_algorithm_paper(self, categorization_service):
        """Test categorization of an algorithm paper."""
        metadata = {
            "paper_id": "test-algo-001",
            "title": "Efficient Union-Find Data Structure for Connected Components",
            "abstract": "We present an improved union-find data structure that efficiently handles disjoint set operations. Our algorithm uses path compression and union by rank to achieve near-constant time complexity.",
            "authors": ["John Doe", "Jane Smith"],
            "categories": ["cs.DS", "cs.DM"]
        }
        
        category = await categorization_service.categorize_paper_from_metadata(metadata)
        
        assert category is not None
        assert category.primary_domain == ScientificDomain.ALGORITHMS
        assert category.confidence > 0.5
        assert "union-find" in category.keywords
        assert "algorithm" in category.keywords
        assert "cs.DS" in category.arxiv_categories
    
    @pytest.mark.asyncio
    async def test_categorize_ai_paper(self, categorization_service):
        """Test categorization of an AI/ML paper."""
        metadata = {
            "paper_id": "test-ai-001",
            "title": "Deep Learning for Natural Language Processing",
            "abstract": "We present a novel neural network architecture for natural language processing tasks. Our transformer-based model achieves state-of-the-art performance on multiple benchmarks.",
            "authors": ["Alice Johnson"],
            "categories": ["cs.AI", "cs.CL", "cs.LG"]
        }
        
        category = await categorization_service.categorize_paper_from_metadata(metadata)
        
        assert category is not None
        assert category.primary_domain in [ScientificDomain.ARTIFICIAL_INTELLIGENCE, ScientificDomain.MACHINE_LEARNING]
        assert category.confidence > 0.4
        assert "neural network" in category.keywords or "deep learning" in category.keywords
    
    @pytest.mark.asyncio
    async def test_categorize_math_paper(self, categorization_service):
        """Test categorization of a mathematics paper."""
        metadata = {
            "paper_id": "test-math-001",
            "title": "On the Riemann Hypothesis and Prime Number Distribution",
            "abstract": "We present a new approach to the Riemann hypothesis using advanced analytical number theory. Our proof relies on novel techniques in complex analysis and algebraic geometry.",
            "authors": ["Bob Wilson"],
            "categories": ["math.NT", "math.AG"]
        }
        
        category = await categorization_service.categorize_paper_from_metadata(metadata)
        
        assert category is not None
        assert category.primary_domain in [ScientificDomain.PURE_MATH, ScientificDomain.MATHEMATICS]
        assert category.confidence > 0.3
        assert "math.NT" in category.arxiv_categories
    
    @pytest.mark.asyncio
    async def test_categorize_physics_paper(self, categorization_service):
        """Test categorization of a physics paper."""
        metadata = {
            "paper_id": "test-physics-001",
            "title": "Quantum Entanglement in Many-Body Systems",
            "abstract": "We investigate quantum entanglement properties in strongly correlated many-body systems. Our theoretical framework provides new insights into quantum phase transitions.",
            "authors": ["Carol Davis"],
            "categories": ["quant-ph", "cond-mat.str-el"]
        }
        
        category = await categorization_service.categorize_paper_from_metadata(metadata)
        
        assert category is not None
        assert category.primary_domain in [ScientificDomain.QUANTUM_PHYSICS, ScientificDomain.PHYSICS]
        assert category.confidence > 0.3
        assert "quant-ph" in category.arxiv_categories
    
    @pytest.mark.asyncio
    async def test_categorize_biology_paper(self, categorization_service):
        """Test categorization of a biology paper."""
        metadata = {
            "paper_id": "test-bio-001",
            "title": "Genome Assembly Using Novel Bioinformatics Algorithms",
            "abstract": "We present new algorithms for genome assembly that improve accuracy and efficiency. Our methods use advanced sequence analysis techniques and machine learning.",
            "authors": ["David Lee"],
            "categories": ["q-bio.GN", "cs.DS"]
        }
        
        category = await categorization_service.categorize_paper_from_metadata(metadata)
        
        assert category is not None
        assert category.primary_domain in [ScientificDomain.BIOINFORMATICS, ScientificDomain.BIOLOGY, ScientificDomain.ALGORITHMS]
        assert category.confidence > 0.3
    
    @pytest.mark.asyncio
    async def test_categorize_interdisciplinary_paper(self, categorization_service):
        """Test categorization of an interdisciplinary paper."""
        metadata = {
            "paper_id": "test-inter-001",
            "title": "Computational Biology Approaches to Drug Discovery",
            "abstract": "We combine machine learning, molecular dynamics simulations, and bioinformatics to accelerate drug discovery. Our interdisciplinary approach shows promising results.",
            "authors": ["Eve Brown"],
            "categories": ["q-bio.BM", "cs.LG", "physics.bio-ph"]
        }
        
        category = await categorization_service.categorize_paper_from_metadata(metadata)
        
        assert category is not None
        assert category.primary_domain in [ScientificDomain.INTERDISCIPLINARY, ScientificDomain.COMPUTATIONAL_BIOLOGY, ScientificDomain.BIOINFORMATICS]
        assert len(category.secondary_domains) > 0  # Should have multiple domains
    
    @pytest.mark.asyncio
    async def test_categorize_unknown_paper(self, categorization_service):
        """Test categorization of a paper with unclear domain."""
        metadata = {
            "paper_id": "test-unknown-001",
            "title": "A Study of Various Topics",
            "abstract": "This paper discusses many different things without clear focus on any particular scientific domain.",
            "authors": ["Frank Miller"],
            "categories": []
        }
        
        category = await categorization_service.categorize_paper_from_metadata(metadata)
        
        assert category is not None
        assert category.primary_domain == ScientificDomain.OTHER
        assert category.confidence < 0.5
    
    @pytest.mark.asyncio
    async def test_domain_keywords_mapping(self, categorization_service):
        """Test that domain keywords are properly mapped."""
        # Test algorithms domain
        algo_keywords = categorization_service.domain_keywords[ScientificDomain.ALGORITHMS]
        assert "algorithm" in algo_keywords
        assert "union-find" in algo_keywords
        assert "data structure" in algo_keywords
        
        # Test AI domain
        ai_keywords = categorization_service.domain_keywords[ScientificDomain.ARTIFICIAL_INTELLIGENCE]
        assert "artificial intelligence" in ai_keywords
        assert "neural network" in ai_keywords
        assert "machine learning" in ai_keywords
    
    @pytest.mark.asyncio
    async def test_arxiv_category_mapping(self, categorization_service):
        """Test arXiv category to domain mapping."""
        # Test computer science categories
        assert categorization_service.arxiv_category_mapping["cs.DS"] == ScientificDomain.ALGORITHMS
        assert categorization_service.arxiv_category_mapping["cs.AI"] == ScientificDomain.ARTIFICIAL_INTELLIGENCE
        assert categorization_service.arxiv_category_mapping["cs.LG"] == ScientificDomain.MACHINE_LEARNING
        
        # Test mathematics categories
        assert categorization_service.arxiv_category_mapping["math.NT"] == ScientificDomain.PURE_MATH
        assert categorization_service.arxiv_category_mapping["math.ST"] == ScientificDomain.STATISTICS
        
        # Test physics categories
        assert categorization_service.arxiv_category_mapping["quant-ph"] == ScientificDomain.QUANTUM_PHYSICS
        assert categorization_service.arxiv_category_mapping["physics.gen-ph"] == ScientificDomain.PHYSICS
    
    @pytest.mark.asyncio
    async def test_confidence_scoring(self, categorization_service):
        """Test confidence scoring mechanism."""
        # High confidence case
        metadata_high = {
            "paper_id": "test-high-conf",
            "title": "Union-Find Algorithm with Path Compression",
            "abstract": "We present a union-find data structure algorithm with path compression optimization for disjoint set operations.",
            "authors": ["Test Author"],
            "categories": ["cs.DS"]
        }
        
        category_high = await categorization_service.categorize_paper_from_metadata(metadata_high)
        assert category_high.confidence > 0.6
        
        # Low confidence case
        metadata_low = {
            "paper_id": "test-low-conf",
            "title": "Various Topics",
            "abstract": "This paper discusses many different things without clear focus.",
            "authors": ["Test Author"],
            "categories": []
        }
        
        category_low = await categorization_service.categorize_paper_from_metadata(metadata_low)
        assert category_low.confidence < 0.5
    
    @pytest.mark.asyncio
    async def test_statistics_tracking(self, categorization_service):
        """Test that statistics are properly tracked."""
        initial_stats = categorization_service.get_statistics()
        initial_count = initial_stats["metrics"]["documents_categorized"]
        
        # Categorize a paper
        metadata = {
            "paper_id": "test-stats-001",
            "title": "Test Algorithm Paper",
            "abstract": "This is a test paper about algorithms and data structures.",
            "authors": ["Test Author"],
            "categories": ["cs.DS"]
        }
        
        await categorization_service.categorize_paper_from_metadata(metadata)
        
        # Check that statistics were updated
        updated_stats = categorization_service.get_statistics()
        assert updated_stats["metrics"]["documents_categorized"] == initial_count + 1
        assert "algorithms" in updated_stats["metrics"]["domain_distribution"]
    
    @pytest.mark.asyncio
    async def test_health_check(self, categorization_service):
        """Test health check functionality."""
        health = await categorization_service.health_check()
        
        assert health["status"] == "healthy"
        assert health["service"] == "document-categorization"
        assert health["enabled"] is True
        assert "documents_categorized" in health


class TestPaperIndexingIntegration:
    """Test suite for PaperIndexingIntegration."""
    
    @pytest.fixture
    async def integration_service(self):
        """Create a test integration service."""
        config = {
            "paper_indexing_integration_enabled": True,
            "auto_categorize_papers": True,
            "document_categorization_enabled": True,
            "categorization_cache_enabled": False,
            "papers_directory": "/tmp/test_papers"
        }
        service = PaperIndexingIntegration(config)
        await service.initialize()
        yield service
        await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_initialization(self, integration_service):
        """Test service initialization."""
        assert integration_service.enabled is True
        assert integration_service.auto_categorize is True
        assert integration_service.categorization_service is not None
        assert integration_service.status.value == "healthy"
    
    @pytest.mark.asyncio
    async def test_process_paper_for_rag(self, integration_service):
        """Test processing a single paper for RAG."""
        metadata = {
            "paper_id": "test-rag-001",
            "title": "Efficient Union-Find Data Structure",
            "abstract": "We present an improved union-find algorithm for disjoint set operations.",
            "authors": ["John Doe"],
            "categories": ["cs.DS"],
            "published_date": "2024-01-01",
            "pdf_path": "/path/to/test.pdf"
        }
        
        result = await integration_service.process_paper_for_rag(
            paper_id=metadata["paper_id"],
            metadata=metadata,
            force_reprocess=True
        )
        
        assert "error" not in result
        assert result["paper_id"] == "test-rag-001"
        assert result["rag_ready"]["searchable"] is True
        assert result["rag_ready"]["auto_categorized"] is True
        assert "categorization" in result
        assert result["categorization"]["primary_domain"] == "algorithms"
        assert result["categorization"]["confidence"] > 0.5
    
    @pytest.mark.asyncio
    async def test_batch_process_papers(self, integration_service, tmp_path):
        """Test batch processing of papers."""
        # Create test metadata files
        papers_dir = tmp_path / "papers"
        papers_dir.mkdir()
        
        # Create test paper directories
        paper1_dir = papers_dir / "paper1"
        paper1_dir.mkdir()
        
        paper2_dir = papers_dir / "paper2"
        paper2_dir.mkdir()
        
        # Create metadata files
        metadata1 = {
            "paper_id": "paper1",
            "title": "Algorithm Paper",
            "abstract": "This paper presents a new algorithm for data structures.",
            "authors": ["Author1"],
            "categories": ["cs.DS"]
        }
        
        metadata2 = {
            "paper_id": "paper2",
            "title": "AI Paper",
            "abstract": "This paper presents a new machine learning approach.",
            "authors": ["Author2"],
            "categories": ["cs.AI"]
        }
        
        with open(paper1_dir / "metadata.json", "w") as f:
            json.dump(metadata1, f)
        
        with open(paper2_dir / "metadata.json", "w") as f:
            json.dump(metadata2, f)
        
        # Process papers
        results = await integration_service.batch_process_papers(
            papers_directory=papers_dir,
            max_papers=2
        )
        
        assert results["processed"] == 2
        assert results["failed"] == 0
        assert results["success_rate"] == 100.0
        assert "algorithms" in results["domain_statistics"]["domain_distribution"]
        assert "artificial_intelligence" in results["domain_statistics"]["domain_distribution"]
    
    @pytest.mark.asyncio
    async def test_get_rag_ready_papers(self, integration_service):
        """Test getting RAG-ready papers."""
        # First process a paper
        metadata = {
            "paper_id": "test-ready-001",
            "title": "Test Algorithm Paper",
            "abstract": "This is a test paper about algorithms.",
            "authors": ["Test Author"],
            "categories": ["cs.DS"]
        }
        
        await integration_service.process_paper_for_rag(
            paper_id=metadata["paper_id"],
            metadata=metadata,
            force_reprocess=True
        )
        
        # Get RAG-ready papers
        ready_papers = await integration_service.get_rag_ready_papers(
            domain_filter=ScientificDomain.ALGORITHMS,
            min_confidence=0.3,
            limit=10
        )
        
        assert len(ready_papers) > 0
        assert ready_papers[0]["paper_id"] == "test-ready-001"
        assert ready_papers[0]["categorization"]["primary_domain"] == "algorithms"
    
    @pytest.mark.asyncio
    async def test_generate_rag_index_summary(self, integration_service):
        """Test generating RAG index summary."""
        # Process a paper first
        metadata = {
            "paper_id": "test-summary-001",
            "title": "Test Paper for Summary",
            "abstract": "This is a test paper for summary generation.",
            "authors": ["Test Author"],
            "categories": ["cs.DS"]
        }
        
        await integration_service.process_paper_for_rag(
            paper_id=metadata["paper_id"],
            metadata=metadata,
            force_reprocess=True
        )
        
        # Generate summary
        summary = await integration_service.generate_rag_index_summary()
        
        assert summary["total_papers"] > 0
        assert "algorithms" in summary["domain_distribution"]
        assert summary["categorization_status"]["categorized"] > 0
        assert "generated_at" in summary
    
    @pytest.mark.asyncio
    async def test_statistics_tracking(self, integration_service):
        """Test that statistics are properly tracked."""
        initial_stats = integration_service.get_statistics()
        initial_processed = initial_stats["metrics"]["papers_processed"]
        
        # Process a paper
        metadata = {
            "paper_id": "test-stats-001",
            "title": "Test Paper for Statistics",
            "abstract": "This is a test paper for statistics tracking.",
            "authors": ["Test Author"],
            "categories": ["cs.DS"]
        }
        
        await integration_service.process_paper_for_rag(
            paper_id=metadata["paper_id"],
            metadata=metadata,
            force_reprocess=True
        )
        
        # Check that statistics were updated
        updated_stats = integration_service.get_statistics()
        assert updated_stats["metrics"]["papers_processed"] == initial_processed + 1
        assert "algorithms" in updated_stats["metrics"]["domain_distribution"]
    
    @pytest.mark.asyncio
    async def test_health_check(self, integration_service):
        """Test health check functionality."""
        health = await integration_service.health_check()
        
        assert health["status"] == "healthy"
        assert health["service"] == "paper-indexing-integration"
        assert health["enabled"] is True
        assert health["auto_categorize"] is True
        assert "papers_processed" in health


class TestIntegrationWithRAGService:
    """Test integration with the main RAG service."""
    
    @pytest.mark.asyncio
    async def test_rag_service_categorization_methods(self):
        """Test that RAG service exposes categorization methods."""
        from app.services.rag.rag_service import RAGService
        
        config = {
            "rag_enabled": True,
            "document_categorization_enabled": True,
            "auto_categorize_papers": True,
            "categorization_cache_enabled": False,
            "papers_directory": "/tmp/test_papers"
        }
        
        rag_service = RAGService(config)
        
        # Check that categorization methods exist
        assert hasattr(rag_service, 'categorize_paper')
        assert hasattr(rag_service, 'process_papers_for_rag')
        assert hasattr(rag_service, 'get_rag_ready_papers')
        assert hasattr(rag_service, 'get_categorization_statistics')
    
    @pytest.mark.asyncio
    async def test_rag_service_categorize_paper(self):
        """Test RAG service categorize_paper method."""
        from app.services.rag.rag_service import RAGService
        
        config = {
            "rag_enabled": True,
            "document_categorization_enabled": True,
            "auto_categorize_papers": True,
            "categorization_cache_enabled": False,
            "papers_directory": "/tmp/test_papers"
        }
        
        rag_service = RAGService(config)
        await rag_service.initialize()
        
        try:
            metadata = {
                "paper_id": "test-rag-service-001",
                "title": "Test Paper for RAG Service",
                "abstract": "This is a test paper for the RAG service categorization.",
                "authors": ["Test Author"],
                "categories": ["cs.DS"]
            }
            
            result = await rag_service.categorize_paper(metadata)
            
            assert result["success"] is True
            assert result["primary_domain"] == "algorithms"
            assert result["confidence"] > 0.5
            assert "algorithm" in result["keywords"]
            
        finally:
            await rag_service.shutdown()


class TestEdgeCases:
    """Test edge cases and error conditions."""
    
    @pytest.mark.asyncio
    async def test_empty_metadata(self):
        """Test handling of empty metadata."""
        config = {
            "document_categorization_enabled": True,
            "categorization_cache_enabled": False,
            "papers_directory": "/tmp/test_papers"
        }
        
        service = DocumentCategorizationService(config)
        await service.initialize()
        
        try:
            empty_metadata = {}
            category = await service.categorize_paper_from_metadata(empty_metadata)
            
            assert category is not None
            assert category.primary_domain == ScientificDomain.OTHER
            assert category.confidence == 0.0
            
        finally:
            await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_malformed_metadata(self):
        """Test handling of malformed metadata."""
        config = {
            "document_categorization_enabled": True,
            "categorization_cache_enabled": False,
            "papers_directory": "/tmp/test_papers"
        }
        
        service = DocumentCategorizationService(config)
        await service.initialize()
        
        try:
            malformed_metadata = {
                "title": None,
                "abstract": "",
                "categories": ["invalid-category"]
            }
            
            category = await service.categorize_paper_from_metadata(malformed_metadata)
            
            assert category is not None
            assert category.primary_domain == ScientificDomain.OTHER
            
        finally:
            await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_service_disabled(self):
        """Test behavior when service is disabled."""
        config = {
            "document_categorization_enabled": False,
            "categorization_cache_enabled": False,
            "papers_directory": "/tmp/test_papers"
        }
        
        service = DocumentCategorizationService(config)
        await service.initialize()
        
        try:
            assert service.enabled is False
            
            metadata = {
                "paper_id": "test-disabled",
                "title": "Test Paper",
                "abstract": "This is a test paper.",
                "authors": ["Test Author"],
                "categories": ["cs.DS"]
            }
            
            # Service should still work even when disabled
            category = await service.categorize_paper_from_metadata(metadata)
            assert category is not None
            
        finally:
            await service.shutdown()


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])
