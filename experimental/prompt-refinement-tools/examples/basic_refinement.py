#!/usr/bin/env python3
"""
Basic Prompt Refinement Example

Demonstrates how to use the prompt refinement tools to improve user queries.
This replaces the pseudo-code from the guide with actual working implementations.

🦊 Fox approach: Strategic query refinement with elegant service composition
"""

import asyncio
import logging
from pathlib import Path
import sys

# Add the services directory to the path
sys.path.append(str(Path(__file__).parent.parent))

from services.refinement_service import PromptRefinementService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def main():
    """Main example function."""
    print("🦊 Prompt Refinement Tools - Basic Example")
    print("=" * 60)
    
    # Initialize the refinement service
    config = {
        'web_scraping': {
            'max_concurrent_requests': 3,
            'request_timeout': 15
        },
        'semantic_search': {
            'embedding_model': 'all-MiniLM-L6-v2',
            'similarity_threshold': 0.7,
            'max_results': 10
        },
        'nlp_processing': {
            'model_name': 'en_core_web_sm'
        }
    }
    
    refinement_service = PromptRefinementService(config)
    
    # Test queries
    test_queries = [
        "How do I make my code better?",
        "Implement a React component for user authentication with TypeScript and proper error handling",
        "What is machine learning?",
        "Fix the bug in my function that's not working properly"
    ]
    
    print(f"\n📝 Testing {len(test_queries)} queries:")
    print("-" * 40)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n🔍 Test Query {i}: {query}")
        print("-" * 50)
        
        try:
            # Refine the query
            result = await refinement_service.refine_query(query)
            
            # Display results
            print(f"✅ Original Query: {result.original_query}")
            print(f"🎯 Refined Query: {result.refined_query}")
            print(f"📊 Improvement Score: {result.improvement_score:.2f}")
            print(f"⏱️  Processing Time: {result.processing_time:.2f}s")
            
            # Show refinement rationale
            if result.refinement_rationale:
                print(f"💡 Refinement Rationale:")
                for rationale in result.refinement_rationale:
                    print(f"   • {rationale}")
            
            # Show research findings
            if result.research_findings.get('key_concepts'):
                print(f"🔍 Key Concepts: {', '.join(result.research_findings['key_concepts'][:5])}")
            
            # Show analysis results
            if result.analysis_results.get('clarity_issues'):
                print(f"⚠️  Clarity Issues: {', '.join(result.analysis_results['clarity_issues'])}")
            
            if result.analysis_results.get('specificity_gaps'):
                print(f"📋 Specificity Gaps: {', '.join(result.analysis_results['specificity_gaps'])}")
            
            if result.analysis_results.get('optimization_opportunities'):
                print(f"🚀 Optimization Opportunities:")
                for opportunity in result.analysis_results['optimization_opportunities'][:3]:
                    print(f"   • {opportunity}")
            
        except Exception as e:
            print(f"❌ Error refining query: {e}")
            logger.error(f"Failed to refine query '{query}': {e}")
        
        print("\n" + "=" * 60)
    
    print("\n🎯 Summary:")
    print("This example demonstrates how the prompt refinement tools")
    print("replace the pseudo-code functions from the guide with actual")
    print("working implementations using modern Python libraries.")
    print("\n🦊 The fox's way: Strategic refinement with elegant service composition!")


if __name__ == "__main__":
    asyncio.run(main())
