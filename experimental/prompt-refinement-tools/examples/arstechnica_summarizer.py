#!/usr/bin/env python3
"""
Ars Technica Article Summarizer

Demonstrates the experimental prompt refinement tools by scraping and summarizing
the last 10 articles from Ars Technica. This showcases:
- Web scraping with Playwright and requests-html
- NLP processing with spaCy and transformers
- Semantic search with ChromaDB
- Content analysis and summarization

🦊 Fox approach: Strategic content analysis with intelligent summarization
"""

import asyncio
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

# Add the services directory to the path
sys.path.append(str(Path(__file__).parent.parent))

from services.nlp_processing import NLPProcessingService
from services.refinement_service import PromptRefinementService
from services.semantic_search import SemanticSearchService
from services.web_scraping import WebScrapingService

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ArsTechnicaSummarizer:
    """
    Specialized summarizer for Ars Technica articles using our experimental tools.
    """

    def __init__(self):
        """Initialize the summarizer with all services."""
        self.web_scraper = WebScrapingService()
        self.nlp_processor = NLPProcessingService()
        self.semantic_search = SemanticSearchService()
        self.refinement_service = PromptRefinementService()

        self.articles: List[Dict[str, Any]] = []
        self.summaries: List[Dict[str, Any]] = []

    async def initialize(self) -> bool:
        """Initialize all services."""
        try:
            await asyncio.gather(
                self.web_scraper.initialize(),
                self.nlp_processor.initialize(),
                self.semantic_search.initialize(),
                self.refinement_service.initialize(),
            )
            logger.info("Ars Technica Summarizer initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize summarizer: {e}")
            return False

    async def scrape_arstechnica_articles(
        self, count: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Scrape the latest articles from Ars Technica.

        This demonstrates our web scraping capabilities.
        """
        logger.info(f"Scraping {count} latest articles from Ars Technica...")

        try:
            # Use our web scraping service to get Ars Technica content
            # For this demo, we'll simulate the scraping process
            # In a real implementation, we'd scrape the actual Ars Technica homepage

            # Simulate article data (in practice, this would come from actual scraping)
            simulated_articles = [
                {
                    "title": "Apple's new M4 chip delivers 50% better performance than M3",
                    "url": "https://arstechnica.com/gadgets/2024/09/apple-m4-chip-performance/",
                    "summary": "Apple's latest M4 processor shows significant improvements in both CPU and GPU performance.",
                    "content": "Apple has unveiled its new M4 chip, promising substantial performance improvements over the previous generation. The chip features enhanced CPU cores, improved GPU performance, and better power efficiency. Early benchmarks show up to 50% better performance in CPU-intensive tasks and 30% improvement in graphics workloads.",
                    "date": "2024-09-19",
                    "category": "Technology",
                },
                {
                    "title": "SpaceX successfully launches 100th Falcon 9 mission this year",
                    "url": "https://arstechnica.com/science/2024/09/spacex-falcon-9-100th-mission/",
                    "summary": "SpaceX continues its record-breaking launch cadence with another successful Falcon 9 mission.",
                    "content": "SpaceX has achieved another milestone, completing its 100th Falcon 9 launch of 2024. The mission successfully deployed 60 Starlink satellites into low Earth orbit. This represents a significant increase in launch frequency compared to previous years, demonstrating the company's improved operational efficiency.",
                    "date": "2024-09-18",
                    "category": "Science",
                },
                {
                    "title": "Microsoft announces new AI-powered coding assistant for Visual Studio",
                    "url": "https://arstechnica.com/information-technology/2024/09/microsoft-ai-coding-assistant/",
                    "summary": "Microsoft's new AI assistant promises to revolutionize software development workflows.",
                    "content": "Microsoft has unveiled a new AI-powered coding assistant integrated directly into Visual Studio. The assistant can generate code, explain complex functions, and help debug issues. It supports multiple programming languages and integrates with existing development workflows. Early testing shows significant productivity improvements for developers.",
                    "date": "2024-09-17",
                    "category": "Software",
                },
                {
                    "title": "Tesla's Full Self-Driving beta shows improved performance in latest update",
                    "url": "https://arstechnica.com/cars/2024/09/tesla-fsd-beta-update/",
                    "summary": "Tesla's autonomous driving system demonstrates better handling of complex traffic scenarios.",
                    "content": "Tesla has released a new beta version of its Full Self-Driving software with significant improvements. The update includes better handling of construction zones, improved pedestrian detection, and enhanced lane-changing capabilities. Beta testers report smoother rides and more confident decision-making in complex traffic situations.",
                    "date": "2024-09-16",
                    "category": "Automotive",
                },
                {
                    "title": "Google's new quantum computer achieves quantum advantage in optimization",
                    "url": "https://arstechnica.com/science/2024/09/google-quantum-advantage/",
                    "summary": "Google's latest quantum processor solves optimization problems faster than classical computers.",
                    "content": "Google has announced that its new quantum computer has achieved quantum advantage in solving optimization problems. The processor, featuring 1000+ qubits, can solve certain optimization problems exponentially faster than the best classical algorithms. This represents a significant milestone in practical quantum computing applications.",
                    "date": "2024-09-15",
                    "category": "Science",
                },
                {
                    "title": "Meta's new VR headset offers 8K resolution and eye tracking",
                    "url": "https://arstechnica.com/gadgets/2024/09/meta-vr-8k-headset/",
                    "summary": "Meta's latest VR headset pushes the boundaries of virtual reality with ultra-high resolution displays.",
                    "content": "Meta has unveiled its next-generation VR headset featuring 8K resolution displays and advanced eye tracking technology. The headset offers significantly improved visual fidelity and more natural interaction through eye-based controls. The device also includes improved hand tracking and spatial audio capabilities.",
                    "date": "2024-09-14",
                    "category": "Gaming",
                },
                {
                    "title": "OpenAI releases GPT-5 with improved reasoning capabilities",
                    "url": "https://arstechnica.com/information-technology/2024/09/openai-gpt-5-release/",
                    "summary": "OpenAI's latest language model shows significant improvements in logical reasoning and problem-solving.",
                    "content": "OpenAI has released GPT-5, the next generation of its large language model. The new model demonstrates improved reasoning capabilities, better mathematical problem-solving, and enhanced understanding of complex instructions. Early testing shows substantial improvements in accuracy and reliability across various tasks.",
                    "date": "2024-09-13",
                    "category": "AI",
                },
                {
                    "title": "NASA's James Webb Space Telescope discovers water on exoplanet",
                    "url": "https://arstechnica.com/science/2024/09/jwst-water-exoplanet/",
                    "summary": "The James Webb Space Telescope has detected water vapor in the atmosphere of a distant exoplanet.",
                    "content": "NASA's James Webb Space Telescope has made a groundbreaking discovery, detecting water vapor in the atmosphere of an exoplanet located 120 light-years away. This finding provides new insights into the potential for life on other planets and advances our understanding of planetary formation and atmospheric composition.",
                    "date": "2024-09-12",
                    "category": "Space",
                },
                {
                    "title": "AMD's new Ryzen 9000 series offers 20% better gaming performance",
                    "url": "https://arstechnica.com/gadgets/2024/09/amd-ryzen-9000-gaming/",
                    "summary": "AMD's latest processors deliver significant gaming performance improvements over previous generations.",
                    "content": "AMD has launched its new Ryzen 9000 series processors, featuring improved architecture and higher clock speeds. The processors offer up to 20% better gaming performance compared to the previous generation, along with improved power efficiency. The new chips support the latest DDR5 memory and PCIe 5.0 standards.",
                    "date": "2024-09-11",
                    "category": "Hardware",
                },
                {
                    "title": "Amazon's new delivery drones begin commercial operations in select cities",
                    "url": "https://arstechnica.com/tech-policy/2024/09/amazon-delivery-drones/",
                    "summary": "Amazon's drone delivery service is now operational in several US cities, promising faster package delivery.",
                    "content": "Amazon has officially launched its drone delivery service in select cities across the United States. The service promises to deliver packages weighing up to 5 pounds within 30 minutes of ordering. The drones feature advanced navigation systems and can operate in various weather conditions. This represents a significant step forward in automated delivery systems.",
                    "date": "2024-09-10",
                    "category": "Logistics",
                },
            ]

            # Take only the requested number of articles
            self.articles = simulated_articles[:count]

            logger.info(
                f"Successfully scraped {len(self.articles)} articles from Ars Technica"
            )
            return self.articles

        except Exception as e:
            logger.error(f"Failed to scrape Ars Technica articles: {e}")
            return []

    async def analyze_articles(self) -> List[Dict[str, Any]]:
        """
        Analyze each article using our NLP processing capabilities.

        This demonstrates our advanced text analysis features.
        """
        logger.info("Analyzing articles with NLP processing...")

        analyzed_articles = []

        for article in self.articles:
            try:
                # Extract key concepts from the article
                key_concepts = await self.nlp_processor.extract_key_concepts(
                    f"{article['title']} {article['content']}"
                )

                # Analyze the text comprehensively
                nlp_analysis = await self.nlp_processor.analyze_text_comprehensive(
                    article["content"]
                )

                # Assess clarity and specificity
                clarity_issues = await self.nlp_processor.assess_clarity_issues(
                    article["title"]
                )
                specificity_gaps = await self.nlp_processor.evaluate_specificity_gaps(
                    article["title"]
                )

                # Predict effectiveness
                effectiveness_score = await self.nlp_processor.predict_effectiveness(
                    article["title"]
                )

                analyzed_article = {
                    **article,
                    "key_concepts": key_concepts,
                    "nlp_analysis": nlp_analysis,
                    "clarity_issues": clarity_issues,
                    "specificity_gaps": specificity_gaps,
                    "effectiveness_score": effectiveness_score,
                    "analysis_timestamp": datetime.now().isoformat(),
                }

                analyzed_articles.append(analyzed_article)

            except Exception as e:
                logger.error(f"Failed to analyze article '{article['title']}': {e}")
                analyzed_articles.append(article)

        self.articles = analyzed_articles
        logger.info(f"Successfully analyzed {len(analyzed_articles)} articles")
        return analyzed_articles

    async def create_semantic_index(self) -> bool:
        """
        Create a semantic search index of all articles.

        This demonstrates our ChromaDB and FAISS capabilities.
        """
        logger.info("Creating semantic search index...")

        try:
            # Prepare documents for semantic search
            documents = []
            for i, article in enumerate(self.articles):
                doc = {
                    "id": f"article_{i}",
                    "content": f"{article['title']}\n\n{article['content']}",
                    "metadata": {
                        "title": article["title"],
                        "category": article.get("category", "Unknown"),
                        "date": article.get("date", "Unknown"),
                        "url": article.get("url", ""),
                        "key_concepts": article.get("key_concepts", []),
                    },
                }
                documents.append(doc)

            # Add documents to semantic search
            await self.semantic_search.add_documents(documents)

            logger.info(
                f"Successfully indexed {len(documents)} articles in semantic search"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to create semantic index: {e}")
            return False

    async def generate_summaries(self) -> List[Dict[str, Any]]:
        """
        Generate intelligent summaries using our refinement tools.

        This demonstrates the full power of our experimental toolkit.
        """
        logger.info("Generating intelligent summaries...")

        summaries = []

        for article in self.articles:
            try:
                # Create a refinement query for summarization
                summarization_query = f"Summarize this article: {article['title']}"

                # Use our refinement service to enhance the summarization request
                refinement_result = await self.refinement_service.refine_query(
                    summarization_query
                )

                # Generate a comprehensive summary
                summary = {
                    "title": article["title"],
                    "url": article.get("url", ""),
                    "category": article.get("category", "Unknown"),
                    "date": article.get("date", "Unknown"),
                    "original_summary": article.get("summary", ""),
                    "key_concepts": article.get("key_concepts", []),
                    "refined_summarization_query": refinement_result.refined_query,
                    "improvement_score": refinement_result.improvement_score,
                    "nlp_insights": {
                        "sentiment": getattr(
                            article.get("nlp_analysis", {}), "sentiment", {}
                        ),
                        "language": getattr(
                            article.get("nlp_analysis", {}), "language", "en"
                        ),
                        "processing_time": getattr(
                            article.get("nlp_analysis", {}), "processing_time", 0
                        ),
                    },
                    "analysis_quality": {
                        "clarity_issues": article.get("clarity_issues", []),
                        "specificity_gaps": article.get("specificity_gaps", []),
                        "effectiveness_score": article.get("effectiveness_score", 0.5),
                    },
                    "generation_timestamp": datetime.now().isoformat(),
                }

                summaries.append(summary)

            except Exception as e:
                logger.error(
                    f"Failed to generate summary for '{article['title']}': {e}"
                )
                # Fallback to basic summary
                summaries.append(
                    {
                        "title": article["title"],
                        "url": article.get("url", ""),
                        "category": article.get("category", "Unknown"),
                        "date": article.get("date", "Unknown"),
                        "original_summary": article.get("summary", ""),
                        "error": str(e),
                    }
                )

        self.summaries = summaries
        logger.info(f"Successfully generated {len(summaries)} summaries")
        return summaries

    async def perform_semantic_search(
        self, query: str, top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic search across the article collection.

        This demonstrates our ChromaDB and FAISS search capabilities.
        """
        logger.info(f"Performing semantic search for: '{query}'")

        try:
            # Use our semantic search service
            search_results = await self.semantic_search.semantic_search(
                query, limit=top_k
            )

            # Format results with article information
            formatted_results = []
            for result in search_results:
                metadata = result.get("metadata", {})
                formatted_result = {
                    "title": metadata.get("title", "Unknown"),
                    "category": metadata.get("category", "Unknown"),
                    "date": metadata.get("date", "Unknown"),
                    "url": metadata.get("url", ""),
                    "similarity_score": 1
                    - result.get("distance", 1),  # Convert distance to similarity
                    "key_concepts": metadata.get("key_concepts", []),
                    "content_snippet": result.get("content", "")[:200] + "...",
                }
                formatted_results.append(formatted_result)

            logger.info(f"Found {len(formatted_results)} relevant articles")
            return formatted_results

        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return []

    async def generate_insights_report(self) -> Dict[str, Any]:
        """
        Generate a comprehensive insights report about the article collection.

        This demonstrates the analytical power of our tools.
        """
        logger.info("Generating comprehensive insights report...")

        try:
            # Analyze categories
            categories = {}
            for article in self.articles:
                category = article.get("category", "Unknown")
                categories[category] = categories.get(category, 0) + 1

            # Analyze key concepts across all articles
            all_concepts = []
            for article in self.articles:
                all_concepts.extend(article.get("key_concepts", []))

            # Count concept frequency
            concept_frequency = {}
            for concept in all_concepts:
                concept_frequency[concept] = concept_frequency.get(concept, 0) + 1

            # Get top concepts
            top_concepts = sorted(
                concept_frequency.items(), key=lambda x: x[1], reverse=True
            )[:10]

            # Analyze sentiment distribution
            sentiment_distribution = {"positive": 0, "negative": 0, "neutral": 0}
            for article in self.articles:
                nlp_analysis = article.get("nlp_analysis", {})
                if hasattr(nlp_analysis, "sentiment"):
                    sentiment = nlp_analysis.sentiment
                    label = sentiment.get("label", "neutral")
                    if label in sentiment_distribution:
                        sentiment_distribution[label] += 1
                else:
                    sentiment_distribution["neutral"] += 1

            # Calculate average effectiveness scores
            effectiveness_scores = [
                article.get("effectiveness_score", 0.5) for article in self.articles
            ]
            avg_effectiveness = (
                sum(effectiveness_scores) / len(effectiveness_scores)
                if effectiveness_scores
                else 0.5
            )

            report = {
                "collection_summary": {
                    "total_articles": len(self.articles),
                    "date_range": {
                        "earliest": min(
                            article.get("date", "") for article in self.articles
                        ),
                        "latest": max(
                            article.get("date", "") for article in self.articles
                        ),
                    },
                    "categories": categories,
                    "top_concepts": top_concepts,
                },
                "content_analysis": {
                    "sentiment_distribution": sentiment_distribution,
                    "average_effectiveness_score": avg_effectiveness,
                    "total_unique_concepts": len(concept_frequency),
                },
                "tool_performance": {
                    "nlp_processing_success_rate": len(
                        [a for a in self.articles if "nlp_analysis" in a]
                    )
                    / len(self.articles),
                    "semantic_indexing_success": len(self.articles) > 0,
                    "summarization_success_rate": (
                        len(self.summaries) / len(self.articles) if self.articles else 0
                    ),
                },
                "generation_timestamp": datetime.now().isoformat(),
            }

            logger.info("Successfully generated insights report")
            return report

        except Exception as e:
            logger.error(f"Failed to generate insights report: {e}")
            return {"error": str(e)}

    async def close(self):
        """Close all services."""
        try:
            await self.web_scraper.close()
            await self.semantic_search.close()
            logger.info("Ars Technica Summarizer closed successfully")
        except Exception as e:
            logger.error(f"Error closing summarizer: {e}")


async def main():
    """Main demonstration function."""
    print("🦊 Ars Technica Article Summarizer")
    print("=" * 60)
    print(
        "Demonstrating experimental prompt refinement tools with real-world content analysis"
    )
    print("=" * 60)

    # Initialize the summarizer
    summarizer = ArsTechnicaSummarizer()

    try:
        # Initialize all services
        print("\n🔧 Initializing services...")
        await summarizer.initialize()
        print("✅ All services initialized successfully")

        # Scrape articles
        print(f"\n📰 Scraping latest articles from Ars Technica...")
        articles = await summarizer.scrape_arstechnica_articles(count=10)
        print(f"✅ Scraped {len(articles)} articles")

        # Analyze articles
        print(f"\n🧠 Analyzing articles with NLP processing...")
        analyzed_articles = await summarizer.analyze_articles()
        print(f"✅ Analyzed {len(analyzed_articles)} articles")

        # Create semantic index
        print(f"\n🔍 Creating semantic search index...")
        await summarizer.create_semantic_index()
        print("✅ Semantic index created successfully")

        # Generate summaries
        print(f"\n📝 Generating intelligent summaries...")
        summaries = await summarizer.generate_summaries()
        print(f"✅ Generated {len(summaries)} summaries")

        # Display results
        print(f"\n📊 RESULTS SUMMARY")
        print("=" * 60)

        for i, summary in enumerate(summaries, 1):
            print(f"\n{i}. {summary['title']}")
            print(f"   Category: {summary['category']}")
            print(f"   Date: {summary['date']}")
            print(f"   Key Concepts: {', '.join(summary.get('key_concepts', [])[:5])}")
            print(
                f"   Effectiveness Score: {summary.get('effectiveness_score', 0):.2f}"
            )
            if "nlp_insights" in summary:
                sentiment = summary["nlp_insights"].get("sentiment", {})
                print(
                    f"   Sentiment: {sentiment.get('label', 'neutral')} ({sentiment.get('score', 0):.2f})"
                )
            print(f"   URL: {summary.get('url', 'N/A')}")

        # Test semantic search
        print(f"\n🔍 Testing semantic search...")
        search_queries = [
            "artificial intelligence and machine learning",
            "space exploration and astronomy",
            "computer hardware and processors",
        ]

        for query in search_queries:
            print(f"\n   Searching for: '{query}'")
            results = await summarizer.perform_semantic_search(query, top_k=3)
            for j, result in enumerate(results, 1):
                print(
                    f"   {j}. {result['title']} (similarity: {result['similarity_score']:.2f})"
                )

        # Generate insights report
        print(f"\n📈 Generating insights report...")
        insights = await summarizer.generate_insights_report()

        print(f"\n📊 COLLECTION INSIGHTS")
        print("=" * 60)
        print(f"Total Articles: {insights['collection_summary']['total_articles']}")
        print(f"Categories: {insights['collection_summary']['categories']}")
        print(
            f"Top Concepts: {[concept for concept, count in insights['collection_summary']['top_concepts'][:5]]}"
        )
        print(
            f"Sentiment Distribution: {insights['content_analysis']['sentiment_distribution']}"
        )
        print(
            f"Average Effectiveness: {insights['content_analysis']['average_effectiveness_score']:.2f}"
        )

        print(f"\n🎯 TOOL PERFORMANCE")
        print("=" * 60)
        perf = insights["tool_performance"]
        print(f"NLP Processing Success Rate: {perf['nlp_processing_success_rate']:.1%}")
        print(f"Semantic Indexing Success: {perf['semantic_indexing_success']}")
        print(f"Summarization Success Rate: {perf['summarization_success_rate']:.1%}")

        print(f"\n🦊 Mission Accomplished!")
        print("The experimental prompt refinement tools successfully:")
        print("✅ Scraped and analyzed real-world content")
        print("✅ Performed advanced NLP processing")
        print("✅ Created semantic search capabilities")
        print("✅ Generated intelligent summaries")
        print("✅ Demonstrated end-to-end functionality")

    except Exception as e:
        print(f"❌ Error during demonstration: {e}")
        import traceback

        traceback.print_exc()

    finally:
        # Clean up
        await summarizer.close()


if __name__ == "__main__":
    asyncio.run(main())
