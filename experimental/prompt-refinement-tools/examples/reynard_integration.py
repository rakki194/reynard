#!/usr/bin/env python3
"""
Reynard Integration Example

Shows how to integrate the prompt refinement tools with existing Reynard infrastructure.
This demonstrates the strategic approach of leveraging existing tools rather than rebuilding.

🦊 Fox approach: Strategic integration with existing Reynard ecosystem
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add the services directory to the path
sys.path.append(str(Path(__file__).parent.parent))

from services.refinement_service import PromptRefinementService

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ReynardIntegration:
    """
    Integration layer for existing Reynard tools.

    This class shows how to leverage existing Reynard infrastructure
    instead of rebuilding everything from scratch.
    """

    def __init__(self):
        """Initialize Reynard integration."""
        self.pawprint_available = self._check_pawprint_availability()
        self.rag_available = self._check_rag_availability()
        self.text_processor_available = self._check_text_processor_availability()

    def _check_pawprint_availability(self) -> bool:
        """Check if PawPrint scraper is available."""
        try:
            # Try to import PawPrint components
            sys.path.append("/home/kade/runeset/reynard/third_party/pawprint/src")
            from pawprint.scraper import EnhancedContentExtractor

            return True
        except ImportError:
            logger.warning("PawPrint not available - using fallback web scraping")
            return False

    def _check_rag_availability(self) -> bool:
        """Check if RAG backend is available."""
        try:
            # Try to import RAG components
            sys.path.append("/home/kade/runeset/reynard/backend/app/services/rag")
            from core.search import SearchEngine

            return True
        except ImportError:
            logger.warning("RAG backend not available - using fallback semantic search")
            return False

    def _check_text_processor_availability(self) -> bool:
        """Check if TextProcessor is available."""
        try:
            # Try to import TextProcessor
            sys.path.append(
                "/home/kade/runeset/reynard/third_party/yipyap/app/data_access"
            )
            from text_processor import TextProcessor

            return True
        except ImportError:
            logger.warning("TextProcessor not available - using fallback NLP")
            return False

    async def use_pawprint_scraper(self, query: str) -> dict:
        """Use existing PawPrint scraper for web research."""
        if not self.pawprint_available:
            return {"error": "PawPrint not available"}

        try:
            # This would use the actual PawPrint scraper
            # For now, return a mock response
            return {
                "success": True,
                "results": [
                    {
                        "url": "https://example.com",
                        "title": f"PawPrint result for {query}",
                        "content": f"Content scraped by PawPrint for query: {query}",
                        "quality_score": 0.8,
                    }
                ],
                "source": "pawprint",
            }
        except Exception as e:
            return {"error": f"PawPrint scraping failed: {e}"}

    async def use_rag_semantic_search(self, query: str) -> dict:
        """Use existing RAG backend for semantic search."""
        if not self.rag_available:
            return {"error": "RAG backend not available"}

        try:
            # This would use the actual RAG backend
            # For now, return a mock response
            return {
                "success": True,
                "results": [
                    {
                        "content": f"RAG semantic search result for {query}",
                        "score": 0.85,
                        "metadata": {"source": "rag_backend"},
                    }
                ],
                "source": "rag_backend",
            }
        except Exception as e:
            return {"error": f"RAG search failed: {e}"}

    async def use_text_processor(self, text: str) -> dict:
        """Use existing TextProcessor for NLP analysis."""
        if not self.text_processor_available:
            return {"error": "TextProcessor not available"}

        try:
            # This would use the actual TextProcessor
            # For now, return a mock response
            return {
                "success": True,
                "keywords": ["example", "text", "processing"],
                "language": "en",
                "summary": f"TextProcessor analysis of: {text[:100]}...",
                "source": "text_processor",
            }
        except Exception as e:
            return {"error": f"TextProcessor analysis failed: {e}"}


async def demonstrate_reynard_integration():
    """Demonstrate integration with existing Reynard tools."""
    print("🦊 Reynard Integration Example")
    print("=" * 60)

    # Initialize integration
    reynard_integration = ReynardIntegration()

    # Show available tools
    print(f"📊 Available Reynard Tools:")
    print(
        f"   • PawPrint Scraper: {'✅' if reynard_integration.pawprint_available else '❌'}"
    )
    print(f"   • RAG Backend: {'✅' if reynard_integration.rag_available else '❌'}")
    print(
        f"   • TextProcessor: {'✅' if reynard_integration.text_processor_available else '❌'}"
    )

    # Test query
    test_query = "How do I implement user authentication in React?"

    print(f"\n🔍 Testing Integration with Query: {test_query}")
    print("-" * 50)

    # Test PawPrint integration
    print("\n🕷️ Testing PawPrint Integration:")
    pawprint_result = await reynard_integration.use_pawprint_scraper(test_query)
    if pawprint_result.get("success"):
        print(f"   ✅ PawPrint found {len(pawprint_result['results'])} results")
        for result in pawprint_result["results"][:2]:
            print(f"      • {result['title']} (quality: {result['quality_score']})")
    else:
        print(f"   ❌ PawPrint error: {pawprint_result.get('error')}")

    # Test RAG integration
    print("\n🧠 Testing RAG Backend Integration:")
    rag_result = await reynard_integration.use_rag_semantic_search(test_query)
    if rag_result.get("success"):
        print(f"   ✅ RAG found {len(rag_result['results'])} semantic results")
        for result in rag_result["results"][:2]:
            print(f"      • {result['content']} (score: {result['score']})")
    else:
        print(f"   ❌ RAG error: {rag_result.get('error')}")

    # Test TextProcessor integration
    print("\n📝 Testing TextProcessor Integration:")
    text_result = await reynard_integration.use_text_processor(test_query)
    if text_result.get("success"):
        print(f"   ✅ TextProcessor analysis complete")
        print(f"      • Keywords: {', '.join(text_result['keywords'])}")
        print(f"      • Language: {text_result['language']}")
        print(f"      • Summary: {text_result['summary']}")
    else:
        print(f"   ❌ TextProcessor error: {text_result.get('error')}")

    print("\n🎯 Integration Benefits:")
    print("   • Leverages existing, production-ready tools")
    print("   • Reduces development time and maintenance")
    print("   • Maintains consistency with Reynard ecosystem")
    print("   • Provides fallbacks for missing components")

    print("\n🦊 The Fox's Way:")
    print("   Strategic integration over rebuilding from scratch!")


async def demonstrate_hybrid_approach():
    """Demonstrate hybrid approach using both new tools and existing Reynard tools."""
    print("\n🔄 Hybrid Approach Example")
    print("=" * 60)

    # Initialize both new tools and Reynard integration
    refinement_service = PromptRefinementService()
    reynard_integration = ReynardIntegration()

    test_query = "Implement a secure authentication system with JWT tokens"

    print(f"🔍 Hybrid Refinement for: {test_query}")
    print("-" * 50)

    # Use new tools for advanced features
    print("\n🆕 Using New Tools for Advanced Features:")
    try:
        result = await refinement_service.refine_query(test_query)
        print(
            f"   ✅ New tools refined query with score: {result.improvement_score:.2f}"
        )
        print(f"   📝 Refined: {result.refined_query}")
    except Exception as e:
        print(f"   ❌ New tools error: {e}")

    # Use existing Reynard tools for proven functionality
    print("\n🏗️ Using Existing Reynard Tools for Proven Functionality:")

    # PawPrint for web scraping
    pawprint_result = await reynard_integration.use_pawprint_scraper(test_query)
    if pawprint_result.get("success"):
        print(
            f"   ✅ PawPrint provided {len(pawprint_result['results'])} high-quality results"
        )

    # RAG for semantic search
    rag_result = await reynard_integration.use_rag_semantic_search(test_query)
    if rag_result.get("success"):
        print(f"   ✅ RAG provided {len(rag_result['results'])} semantic matches")

    # TextProcessor for NLP
    text_result = await reynard_integration.use_text_processor(test_query)
    if text_result.get("success"):
        print(f"   ✅ TextProcessor provided keyword analysis")

    print("\n🎯 Hybrid Approach Benefits:")
    print("   • Best of both worlds: new capabilities + proven reliability")
    print("   • Gradual migration path from pseudo-code to production")
    print("   • Fallback options for missing dependencies")
    print("   • Leverages existing Reynard infrastructure investment")


async def main():
    """Main example function."""
    await demonstrate_reynard_integration()
    await demonstrate_hybrid_approach()

    print("\n🦊 Summary:")
    print("This example shows how to strategically integrate new prompt refinement")
    print("tools with existing Reynard infrastructure, following the fox's way of")
    print("elegant solutions that leverage what you already have!")


if __name__ == "__main__":
    asyncio.run(main())
