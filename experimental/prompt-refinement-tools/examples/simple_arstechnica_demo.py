#!/usr/bin/env python3
"""
Simple Ars Technica Demo

A clean demonstration of our experimental prompt refinement tools
working with simulated Ars Technica content.

🦊 Fox approach: Elegant demonstration of core capabilities
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add the services directory to the path
sys.path.append(str(Path(__file__).parent.parent))

from services.nlp_processing import NLPProcessingService
from services.refinement_service import PromptRefinementService
from services.semantic_search import SemanticSearchService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main():
    """Simple demonstration of our experimental tools."""
    print("🦊 Experimental Prompt Refinement Tools - Ars Technica Demo")
    print("=" * 70)

    # Initialize services
    nlp_processor = NLPProcessingService()
    semantic_search = SemanticSearchService()
    refinement_service = PromptRefinementService()

    print("\n🔧 Initializing services...")
    await asyncio.gather(
        nlp_processor.initialize(),
        semantic_search.initialize(),
        refinement_service.initialize(),
    )
    print("✅ All services initialized successfully")

    # Sample Ars Technica articles
    articles = [
        {
            "title": "Apple's new M4 chip delivers 50% better performance than M3",
            "content": "Apple has unveiled its new M4 processor, promising substantial performance improvements over the previous generation. The chip features enhanced CPU cores, improved GPU performance, and better power efficiency. Early benchmarks show up to 50% better performance in CPU-intensive tasks and 30% improvement in graphics workloads.",
            "category": "Technology",
        },
        {
            "title": "SpaceX successfully launches 100th Falcon 9 mission this year",
            "content": "SpaceX has achieved another milestone, completing its 100th Falcon 9 launch of 2024. The mission successfully deployed 60 Starlink satellites into low Earth orbit. This represents a significant increase in launch frequency compared to previous years, demonstrating the company's improved operational efficiency.",
            "category": "Science",
        },
        {
            "title": "OpenAI releases GPT-5 with improved reasoning capabilities",
            "content": "OpenAI has released GPT-5, the next generation of its large language model. The new model demonstrates improved reasoning capabilities, better mathematical problem-solving, and enhanced understanding of complex instructions. Early testing shows substantial improvements in accuracy and reliability across various tasks.",
            "category": "AI",
        },
    ]

    print(f"\n📰 Processing {len(articles)} Ars Technica articles...")

    # Process each article
    processed_articles = []
    for i, article in enumerate(articles, 1):
        print(f"\n🔍 Article {i}: {article['title']}")

        # Extract key concepts using NLP
        key_concepts = await nlp_processor.extract_key_concepts(
            f"{article['title']} {article['content']}"
        )
        print(f"   Key Concepts: {', '.join(key_concepts[:5])}")

        # Analyze text comprehensively
        nlp_analysis = await nlp_processor.analyze_text_comprehensive(
            article["content"]
        )
        print(f"   Language: {nlp_analysis.language}")
        sentiment = nlp_analysis.sentiment
        if isinstance(sentiment, dict):
            print(
                f"   Sentiment: {sentiment.get('label', 'neutral')} ({sentiment.get('score', 0):.2f})"
            )
        else:
            print(f"   Sentiment: neutral (0.50)")
        print(f"   Processing Time: {nlp_analysis.processing_time:.3f}s")

        # Assess clarity and effectiveness
        clarity_issues = await nlp_processor.assess_clarity_issues(article["title"])
        effectiveness = await nlp_processor.predict_effectiveness(article["title"])
        print(f"   Clarity Issues: {len(clarity_issues)}")
        print(f"   Effectiveness Score: {effectiveness:.2f}")

        processed_articles.append(
            {
                **article,
                "key_concepts": key_concepts,
                "nlp_analysis": nlp_analysis,
                "clarity_issues": clarity_issues,
                "effectiveness": effectiveness,
            }
        )

    # Create semantic search index
    print(f"\n🔍 Creating semantic search index...")
    documents = []
    for i, article in enumerate(processed_articles):
        doc = {
            "id": f"article_{i}",
            "content": f"{article['title']}\n\n{article['content']}",
            "metadata": {
                "title": article["title"],
                "category": article["category"],
                "key_concepts": article["key_concepts"],
            },
        }
        documents.append(doc)

    await semantic_search.add_documents(documents)
    print("✅ Semantic index created successfully")

    # Test semantic search
    print(f"\n🔍 Testing semantic search capabilities...")
    search_queries = [
        "artificial intelligence and machine learning",
        "space exploration and rockets",
        "computer processors and performance",
    ]

    for query in search_queries:
        print(f"\n   Searching for: '{query}'")
        results = await semantic_search.semantic_search(query, limit=2)
        for j, result in enumerate(results, 1):
            metadata = result.get("metadata", {})
            similarity = 1 - result.get("distance", 1)
            print(
                f"   {j}. {metadata.get('title', 'Unknown')} (similarity: {similarity:.2f})"
            )

    # Test prompt refinement
    print(f"\n🎯 Testing prompt refinement capabilities...")
    test_queries = [
        "How do I make my code better?",
        "What's the latest in AI technology?",
        "Tell me about space missions",
    ]

    for query in test_queries:
        print(f"\n   Original Query: {query}")
        refinement_result = await refinement_service.refine_query(query)
        print(f"   Refined Query: {refinement_result.refined_query}")
        print(f"   Improvement Score: {refinement_result.improvement_score:.2f}")
        print(f"   Processing Time: {refinement_result.processing_time:.3f}s")

    # Generate summary insights
    print(f"\n📊 SUMMARY INSIGHTS")
    print("=" * 70)

    # Analyze categories
    categories = {}
    for article in processed_articles:
        category = article["category"]
        categories[category] = categories.get(category, 0) + 1

    print(f"Article Categories: {categories}")

    # Analyze key concepts
    all_concepts = []
    for article in processed_articles:
        all_concepts.extend(article["key_concepts"])

    concept_frequency = {}
    for concept in all_concepts:
        concept_frequency[concept] = concept_frequency.get(concept, 0) + 1

    top_concepts = sorted(concept_frequency.items(), key=lambda x: x[1], reverse=True)[
        :5
    ]
    print(f"Top Concepts: {[concept for concept, count in top_concepts]}")

    # Analyze effectiveness
    effectiveness_scores = [article["effectiveness"] for article in processed_articles]
    avg_effectiveness = sum(effectiveness_scores) / len(effectiveness_scores)
    print(f"Average Effectiveness Score: {avg_effectiveness:.2f}")

    # Analyze sentiment
    sentiments = []
    for article in processed_articles:
        sentiment = article["nlp_analysis"].sentiment
        if isinstance(sentiment, dict):
            sentiments.append(sentiment.get("label", "neutral"))
        else:
            sentiments.append("neutral")

    sentiment_dist = {}
    for sentiment in sentiments:
        sentiment_dist[sentiment] = sentiment_dist.get(sentiment, 0) + 1
    print(f"Sentiment Distribution: {sentiment_dist}")

    print(f"\n🦊 Mission Accomplished!")
    print("Our experimental prompt refinement tools successfully demonstrated:")
    print("✅ Advanced NLP processing with key concept extraction")
    print("✅ Sentiment analysis and text comprehension")
    print("✅ Semantic search with vector similarity matching")
    print("✅ Intelligent prompt refinement and optimization")
    print("✅ Real-world content analysis capabilities")

    # Clean up
    await semantic_search.close()
    print("\n✅ Demo completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())
