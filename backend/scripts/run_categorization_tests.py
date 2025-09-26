#!/usr/bin/env python3
"""
Document Categorization System Test Runner
=========================================

Comprehensive test runner for the document categorization system.
Tests all major functionality without requiring pytest.
"""

import asyncio
import json
import logging
import sys
import tempfile
from pathlib import Path
from typing import Any, Dict, List

# Add the backend app to the path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.rag.services.core.document_categorization import (
    DocumentCategorizationService,
    DocumentCategory,
    ScientificDomain,
)
from app.services.rag.services.core.paper_indexing_integration import (
    PaperIndexingIntegration,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TestResult:
    """Test result container."""

    def __init__(
        self, name: str, passed: bool, message: str = "", details: Dict[str, Any] = None
    ):
        self.name = name
        self.passed = passed
        self.message = message
        self.details = details or {}


class CategorizationTestSuite:
    """Comprehensive test suite for document categorization system."""

    def __init__(self):
        self.results: List[TestResult] = []
        self.config = {
            "document_categorization_enabled": True,
            "categorization_cache_enabled": False,  # Disable cache for testing
            "min_confidence_threshold": 0.3,
            "papers_directory": "/tmp/test_papers",
            "paper_indexing_integration_enabled": True,
            "auto_categorize_papers": True,
        }

    def add_result(self, result: TestResult):
        """Add a test result."""
        self.results.append(result)
        status = "✅ PASSED" if result.passed else "❌ FAILED"
        logger.info(f"{status}: {result.name}")
        if result.message:
            logger.info(f"   {result.message}")
        if result.details:
            for key, value in result.details.items():
                logger.info(f"   {key}: {value}")

    async def test_categorization_service_initialization(self):
        """Test DocumentCategorizationService initialization."""
        try:
            service = DocumentCategorizationService(self.config)
            success = await service.initialize()

            if success and service.status.value == "healthy":
                self.add_result(
                    TestResult(
                        "Categorization Service Initialization",
                        True,
                        "Service initialized successfully",
                        {
                            "status": service.status.value,
                            "enabled": service.enabled,
                            "cache_enabled": service.cache_enabled,
                        },
                    )
                )
                await service.shutdown()
                return service
            else:
                self.add_result(
                    TestResult(
                        "Categorization Service Initialization",
                        False,
                        f"Service failed to initialize: {service.status.value}",
                    )
                )
                return None

        except Exception as e:
            self.add_result(
                TestResult(
                    "Categorization Service Initialization",
                    False,
                    f"Exception during initialization: {str(e)}",
                )
            )
            return None

    async def test_algorithm_paper_categorization(
        self, service: DocumentCategorizationService
    ):
        """Test categorization of algorithm papers."""
        try:
            metadata = {
                "paper_id": "test-algo-001",
                "title": "Efficient Union-Find Data Structure for Connected Components",
                "abstract": "We present an improved union-find data structure that efficiently handles disjoint set operations. Our algorithm uses path compression and union by rank to achieve near-constant time complexity.",
                "authors": ["John Doe", "Jane Smith"],
                "categories": ["cs.DS", "cs.DM"],
            }

            category = await service.categorize_paper_from_metadata(metadata)

            if (
                category
                and category.primary_domain == ScientificDomain.ALGORITHMS
                and category.confidence > 0.5
                and "union-find" in category.keywords
            ):

                self.add_result(
                    TestResult(
                        "Algorithm Paper Categorization",
                        True,
                        "Successfully categorized algorithm paper",
                        {
                            "primary_domain": category.primary_domain.value,
                            "confidence": f"{category.confidence:.2f}",
                            "keywords": category.keywords[:5],
                            "reasoning": category.reasoning,
                        },
                    )
                )
            else:
                self.add_result(
                    TestResult(
                        "Algorithm Paper Categorization",
                        False,
                        f"Unexpected categorization result: {category.primary_domain.value if category else 'None'}",
                    )
                )

        except Exception as e:
            self.add_result(
                TestResult(
                    "Algorithm Paper Categorization",
                    False,
                    f"Exception during categorization: {str(e)}",
                )
            )

    async def test_ai_paper_categorization(
        self, service: DocumentCategorizationService
    ):
        """Test categorization of AI/ML papers."""
        try:
            metadata = {
                "paper_id": "test-ai-001",
                "title": "Deep Learning for Natural Language Processing",
                "abstract": "We present a novel neural network architecture for natural language processing tasks. Our transformer-based model achieves state-of-the-art performance on multiple benchmarks.",
                "authors": ["Alice Johnson"],
                "categories": ["cs.AI", "cs.CL", "cs.LG"],
            }

            category = await service.categorize_paper_from_metadata(metadata)

            if (
                category
                and category.primary_domain
                in [
                    ScientificDomain.ARTIFICIAL_INTELLIGENCE,
                    ScientificDomain.MACHINE_LEARNING,
                ]
                and category.confidence > 0.4
            ):

                self.add_result(
                    TestResult(
                        "AI Paper Categorization",
                        True,
                        "Successfully categorized AI paper",
                        {
                            "primary_domain": category.primary_domain.value,
                            "confidence": f"{category.confidence:.2f}",
                            "keywords": category.keywords[:5],
                        },
                    )
                )
            else:
                self.add_result(
                    TestResult(
                        "AI Paper Categorization",
                        False,
                        f"Unexpected categorization result: {category.primary_domain.value if category else 'None'}",
                    )
                )

        except Exception as e:
            self.add_result(
                TestResult(
                    "AI Paper Categorization",
                    False,
                    f"Exception during categorization: {str(e)}",
                )
            )

    async def test_math_paper_categorization(
        self, service: DocumentCategorizationService
    ):
        """Test categorization of mathematics papers."""
        try:
            metadata = {
                "paper_id": "test-math-001",
                "title": "On the Riemann Hypothesis and Prime Number Distribution",
                "abstract": "We present a new approach to the Riemann hypothesis using advanced analytical number theory. Our proof relies on novel techniques in complex analysis and algebraic geometry.",
                "authors": ["Bob Wilson"],
                "categories": ["math.NT", "math.AG"],
            }

            category = await service.categorize_paper_from_metadata(metadata)

            if (
                category
                and category.primary_domain
                in [ScientificDomain.PURE_MATH, ScientificDomain.MATHEMATICS]
                and category.confidence > 0.3
            ):

                self.add_result(
                    TestResult(
                        "Mathematics Paper Categorization",
                        True,
                        "Successfully categorized mathematics paper",
                        {
                            "primary_domain": category.primary_domain.value,
                            "confidence": f"{category.confidence:.2f}",
                            "keywords": category.keywords[:5],
                        },
                    )
                )
            else:
                self.add_result(
                    TestResult(
                        "Mathematics Paper Categorization",
                        False,
                        f"Unexpected categorization result: {category.primary_domain.value if category else 'None'}",
                    )
                )

        except Exception as e:
            self.add_result(
                TestResult(
                    "Mathematics Paper Categorization",
                    False,
                    f"Exception during categorization: {str(e)}",
                )
            )

    async def test_physics_paper_categorization(
        self, service: DocumentCategorizationService
    ):
        """Test categorization of physics papers."""
        try:
            metadata = {
                "paper_id": "test-physics-001",
                "title": "Quantum Entanglement in Many-Body Systems",
                "abstract": "We investigate quantum entanglement properties in strongly correlated many-body systems. Our theoretical framework provides new insights into quantum phase transitions.",
                "authors": ["Carol Davis"],
                "categories": ["quant-ph", "cond-mat.str-el"],
            }

            category = await service.categorize_paper_from_metadata(metadata)

            if (
                category
                and category.primary_domain
                in [ScientificDomain.QUANTUM_PHYSICS, ScientificDomain.PHYSICS]
                and category.confidence > 0.3
            ):

                self.add_result(
                    TestResult(
                        "Physics Paper Categorization",
                        True,
                        "Successfully categorized physics paper",
                        {
                            "primary_domain": category.primary_domain.value,
                            "confidence": f"{category.confidence:.2f}",
                            "keywords": category.keywords[:5],
                        },
                    )
                )
            else:
                self.add_result(
                    TestResult(
                        "Physics Paper Categorization",
                        False,
                        f"Unexpected categorization result: {category.primary_domain.value if category else 'None'}",
                    )
                )

        except Exception as e:
            self.add_result(
                TestResult(
                    "Physics Paper Categorization",
                    False,
                    f"Exception during categorization: {str(e)}",
                )
            )

    async def test_domain_keywords_mapping(
        self, service: DocumentCategorizationService
    ):
        """Test domain keywords mapping."""
        try:
            # Test algorithms domain
            algo_keywords = service.domain_keywords[ScientificDomain.ALGORITHMS]
            has_algorithm = "algorithm" in algo_keywords
            has_union_find = "union-find" in algo_keywords
            has_data_structure = "data structure" in algo_keywords

            # Test AI domain
            ai_keywords = service.domain_keywords[
                ScientificDomain.ARTIFICIAL_INTELLIGENCE
            ]
            has_ai = "artificial intelligence" in ai_keywords
            has_neural_network = "neural network" in ai_keywords
            has_ml = "machine learning" in ai_keywords

            if (
                has_algorithm
                and has_union_find
                and has_data_structure
                and has_ai
                and has_neural_network
                and has_ml
            ):

                self.add_result(
                    TestResult(
                        "Domain Keywords Mapping",
                        True,
                        "All expected keywords found in domain mappings",
                        {
                            "algorithms_keywords_count": len(algo_keywords),
                            "ai_keywords_count": len(ai_keywords),
                            "total_domains": len(service.domain_keywords),
                        },
                    )
                )
            else:
                self.add_result(
                    TestResult(
                        "Domain Keywords Mapping",
                        False,
                        "Missing expected keywords in domain mappings",
                    )
                )

        except Exception as e:
            self.add_result(
                TestResult(
                    "Domain Keywords Mapping",
                    False,
                    f"Exception during keywords mapping test: {str(e)}",
                )
            )

    async def test_arxiv_category_mapping(self, service: DocumentCategorizationService):
        """Test arXiv category to domain mapping."""
        try:
            # Test computer science categories
            cs_ds_mapping = (
                service.arxiv_category_mapping.get("cs.DS")
                == ScientificDomain.ALGORITHMS
            )
            cs_ai_mapping = (
                service.arxiv_category_mapping.get("cs.AI")
                == ScientificDomain.ARTIFICIAL_INTELLIGENCE
            )
            cs_lg_mapping = (
                service.arxiv_category_mapping.get("cs.LG")
                == ScientificDomain.MACHINE_LEARNING
            )

            # Test mathematics categories
            math_nt_mapping = (
                service.arxiv_category_mapping.get("math.NT")
                == ScientificDomain.PURE_MATH
            )
            math_st_mapping = (
                service.arxiv_category_mapping.get("math.ST")
                == ScientificDomain.STATISTICS
            )

            # Test physics categories
            quant_ph_mapping = (
                service.arxiv_category_mapping.get("quant-ph")
                == ScientificDomain.QUANTUM_PHYSICS
            )
            physics_gen_mapping = (
                service.arxiv_category_mapping.get("physics.gen-ph")
                == ScientificDomain.PHYSICS
            )

            if (
                cs_ds_mapping
                and cs_ai_mapping
                and cs_lg_mapping
                and math_nt_mapping
                and math_st_mapping
                and quant_ph_mapping
                and physics_gen_mapping
            ):

                self.add_result(
                    TestResult(
                        "arXiv Category Mapping",
                        True,
                        "All expected arXiv categories mapped correctly",
                        {
                            "total_mappings": len(service.arxiv_category_mapping),
                            "cs_mappings": len(
                                [
                                    k
                                    for k in service.arxiv_category_mapping.keys()
                                    if k.startswith("cs.")
                                ]
                            ),
                            "math_mappings": len(
                                [
                                    k
                                    for k in service.arxiv_category_mapping.keys()
                                    if k.startswith("math.")
                                ]
                            ),
                            "physics_mappings": len(
                                [
                                    k
                                    for k in service.arxiv_category_mapping.keys()
                                    if k.startswith("physics.")
                                ]
                            ),
                        },
                    )
                )
            else:
                self.add_result(
                    TestResult(
                        "arXiv Category Mapping",
                        False,
                        "Some arXiv categories not mapped correctly",
                    )
                )

        except Exception as e:
            self.add_result(
                TestResult(
                    "arXiv Category Mapping",
                    False,
                    f"Exception during arXiv mapping test: {str(e)}",
                )
            )

    async def test_statistics_tracking(self, service: DocumentCategorizationService):
        """Test statistics tracking."""
        try:
            initial_stats = service.get_statistics()
            initial_count = initial_stats["metrics"]["documents_categorized"]

            # Categorize a paper
            metadata = {
                "paper_id": "test-stats-001",
                "title": "Test Algorithm Paper",
                "abstract": "This is a test paper about algorithms and data structures.",
                "authors": ["Test Author"],
                "categories": ["cs.DS"],
            }

            await service.categorize_paper_from_metadata(metadata)

            # Check that statistics were updated
            updated_stats = service.get_statistics()
            new_count = updated_stats["metrics"]["documents_categorized"]

            if (
                new_count == initial_count + 1
                and "algorithms" in updated_stats["metrics"]["domain_distribution"]
            ):
                self.add_result(
                    TestResult(
                        "Statistics Tracking",
                        True,
                        "Statistics properly tracked and updated",
                        {
                            "initial_count": initial_count,
                            "updated_count": new_count,
                            "domain_distribution": updated_stats["metrics"][
                                "domain_distribution"
                            ],
                        },
                    )
                )
            else:
                self.add_result(
                    TestResult(
                        "Statistics Tracking",
                        False,
                        f"Statistics not updated correctly: {initial_count} -> {new_count}",
                    )
                )

        except Exception as e:
            self.add_result(
                TestResult(
                    "Statistics Tracking",
                    False,
                    f"Exception during statistics test: {str(e)}",
                )
            )

    async def test_paper_indexing_integration_initialization(self):
        """Test PaperIndexingIntegration initialization."""
        try:
            service = PaperIndexingIntegration(self.config)
            success = await service.initialize()

            if (
                success
                and service.status.value == "healthy"
                and service.categorization_service is not None
            ):

                self.add_result(
                    TestResult(
                        "Paper Indexing Integration Initialization",
                        True,
                        "Integration service initialized successfully",
                        {
                            "status": service.status.value,
                            "enabled": service.enabled,
                            "auto_categorize": service.auto_categorize,
                            "categorization_service_available": service.categorization_service
                            is not None,
                        },
                    )
                )
                await service.shutdown()
                return service
            else:
                self.add_result(
                    TestResult(
                        "Paper Indexing Integration Initialization",
                        False,
                        f"Integration service failed to initialize: {service.status.value}",
                    )
                )
                return None

        except Exception as e:
            self.add_result(
                TestResult(
                    "Paper Indexing Integration Initialization",
                    False,
                    f"Exception during integration initialization: {str(e)}",
                )
            )
            return None

    async def test_paper_processing_for_rag(
        self, integration_service: PaperIndexingIntegration
    ):
        """Test processing a paper for RAG."""
        try:
            metadata = {
                "paper_id": "test-rag-001",
                "title": "Efficient Union-Find Data Structure",
                "abstract": "We present an improved union-find algorithm for disjoint set operations.",
                "authors": ["John Doe"],
                "categories": ["cs.DS"],
                "published_date": "2024-01-01",
                "pdf_path": "/path/to/test.pdf",
            }

            result = await integration_service.process_paper_for_rag(
                paper_id=metadata["paper_id"], metadata=metadata, force_reprocess=True
            )

            if (
                "error" not in result
                and result["paper_id"] == "test-rag-001"
                and result["rag_ready"]["searchable"] is True
                and result["rag_ready"]["auto_categorized"] is True
                and "categorization" in result
            ):

                self.add_result(
                    TestResult(
                        "Paper Processing for RAG",
                        True,
                        "Paper successfully processed for RAG",
                        {
                            "paper_id": result["paper_id"],
                            "rag_ready": result["rag_ready"],
                            "primary_domain": result["categorization"][
                                "primary_domain"
                            ],
                            "confidence": f"{result['categorization']['confidence']:.2f}",
                        },
                    )
                )
            else:
                self.add_result(
                    TestResult(
                        "Paper Processing for RAG",
                        False,
                        f"Paper processing failed or unexpected result: {result.get('error', 'Unknown error')}",
                    )
                )

        except Exception as e:
            self.add_result(
                TestResult(
                    "Paper Processing for RAG",
                    False,
                    f"Exception during paper processing: {str(e)}",
                )
            )

    async def test_batch_processing(
        self, integration_service: PaperIndexingIntegration
    ):
        """Test batch processing of papers."""
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                papers_dir = Path(temp_dir) / "papers"
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
                    "categories": ["cs.DS"],
                }

                metadata2 = {
                    "paper_id": "paper2",
                    "title": "AI Paper",
                    "abstract": "This paper presents a new machine learning approach.",
                    "authors": ["Author2"],
                    "categories": ["cs.AI"],
                }

                with open(paper1_dir / "metadata.json", "w") as f:
                    json.dump(metadata1, f)

                with open(paper2_dir / "metadata.json", "w") as f:
                    json.dump(metadata2, f)

                # Process papers
                results = await integration_service.batch_process_papers(
                    papers_directory=papers_dir, max_papers=2
                )

                if (
                    results["processed"] == 2
                    and results["failed"] == 0
                    and results["processing_summary"]["success_rate"] == 100.0
                    and "algorithms"
                    in results["domain_statistics"]["domain_distribution"]
                    and "artificial_intelligence"
                    in results["domain_statistics"]["domain_distribution"]
                ):

                    self.add_result(
                        TestResult(
                            "Batch Processing",
                            True,
                            "Batch processing completed successfully",
                            {
                                "processed": results["processed"],
                                "failed": results["failed"],
                                "success_rate": f"{results['processing_summary']['success_rate']:.1f}%",
                                "domains_found": list(
                                    results["domain_statistics"][
                                        "domain_distribution"
                                    ].keys()
                                ),
                            },
                        )
                    )
                else:
                    self.add_result(
                        TestResult(
                            "Batch Processing",
                            False,
                            f"Batch processing failed: {results['processed']} processed, {results['failed']} failed",
                        )
                    )

        except Exception as e:
            self.add_result(
                TestResult(
                    "Batch Processing",
                    False,
                    f"Exception during batch processing: {str(e)}",
                )
            )

    async def test_health_checks(
        self,
        categorization_service: DocumentCategorizationService,
        integration_service: PaperIndexingIntegration,
    ):
        """Test health check functionality."""
        try:
            # Test categorization service health check
            cat_health = await categorization_service.health_check()
            cat_healthy = (
                cat_health["status"] == "healthy"
                and cat_health["service"] == "document-categorization"
                and cat_health["enabled"] is True
            )

            # Test integration service health check
            int_health = await integration_service.health_check()
            int_healthy = (
                int_health["status"] == "healthy"
                and int_health["service"] == "paper-indexing-integration"
                and int_health["enabled"] is True
            )

            if cat_healthy and int_healthy:
                self.add_result(
                    TestResult(
                        "Health Checks",
                        True,
                        "All health checks passed",
                        {
                            "categorization_service": cat_health["status"],
                            "integration_service": int_health["status"],
                        },
                    )
                )
            else:
                self.add_result(
                    TestResult(
                        "Health Checks",
                        False,
                        f"Health checks failed: cat={cat_health['status']}, int={int_health['status']}",
                    )
                )

        except Exception as e:
            self.add_result(
                TestResult(
                    "Health Checks", False, f"Exception during health checks: {str(e)}"
                )
            )

    async def run_all_tests(self):
        """Run all tests."""
        logger.info("🦊 Starting Document Categorization System Tests")
        logger.info("=" * 60)

        # Initialize categorization service
        categorization_service = await self.test_categorization_service_initialization()
        if not categorization_service:
            logger.error("Cannot continue tests without categorization service")
            return

        # Test categorization functionality
        await self.test_algorithm_paper_categorization(categorization_service)
        await self.test_ai_paper_categorization(categorization_service)
        await self.test_math_paper_categorization(categorization_service)
        await self.test_physics_paper_categorization(categorization_service)
        await self.test_domain_keywords_mapping(categorization_service)
        await self.test_arxiv_category_mapping(categorization_service)
        await self.test_statistics_tracking(categorization_service)

        # Initialize integration service
        integration_service = (
            await self.test_paper_indexing_integration_initialization()
        )
        if not integration_service:
            logger.error(
                "Cannot continue integration tests without integration service"
            )
            await categorization_service.shutdown()
            return

        # Test integration functionality
        await self.test_paper_processing_for_rag(integration_service)
        await self.test_batch_processing(integration_service)
        await self.test_health_checks(categorization_service, integration_service)

        # Cleanup
        await categorization_service.shutdown()
        await integration_service.shutdown()

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary."""
        logger.info("\n" + "=" * 60)
        logger.info("🦊 TEST SUMMARY")
        logger.info("=" * 60)

        passed = sum(1 for result in self.results if result.passed)
        total = len(self.results)

        for result in self.results:
            status = "✅ PASSED" if result.passed else "❌ FAILED"
            logger.info(f"{result.name}: {status}")

        logger.info(f"\nOverall: {passed}/{total} tests passed")

        if passed == total:
            logger.info(
                "🎉 All tests passed! The categorization system is working correctly."
            )
        else:
            logger.error("⚠️  Some tests failed. Please check the logs for details.")

        return passed == total


async def main():
    """Main test runner."""
    test_suite = CategorizationTestSuite()
    success = await test_suite.run_all_tests()
    return success


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
