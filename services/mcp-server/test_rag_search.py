#!/usr/bin/env python3
"""
Test script for the new RAG search tools.
"""

import asyncio
import json
import sys
from pathlib import Path

# Add the current directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from tools.search.rag_search_tools import (
    search_codebase,
    search_keyword,
    search_semantic,
)


async def test_rag_search():
    """Test the new RAG search tools."""
    print("🦊 Testing RAG Search Tools")
    print("=" * 50)

    # Test search_codebase
    print("\n1. Testing search_codebase:")
    try:
        result = await search_codebase("Reynard MCP server implementation", top_k=3)
        print(f"✅ search_codebase: {len(result.get('results', []))} results")
        if result.get("results"):
            print(f"   First result: {result['results'][0].get('path', 'N/A')}")
            print(f"   Search type: {result.get('search_type', 'N/A')}")
    except Exception as e:
        print(f"❌ search_codebase failed: {e}")

    # Test search_semantic
    print("\n2. Testing search_semantic:")
    try:
        result = await search_semantic("authentication flow", top_k=2)
        print(f"✅ search_semantic: {len(result.get('results', []))} results")
        if result.get("results"):
            print(f"   First result: {result['results'][0].get('path', 'N/A')}")
    except Exception as e:
        print(f"❌ search_semantic failed: {e}")

    # Test search_keyword
    print("\n3. Testing search_keyword:")
    try:
        result = await search_keyword("def main", top_k=2)
        print(f"✅ search_keyword: {len(result.get('results', []))} results")
        if result.get("results"):
            print(f"   First result: {result['results'][0].get('path', 'N/A')}")
    except Exception as e:
        print(f"❌ search_keyword failed: {e}")

    print("\n🎉 RAG Search Tools Test Complete!")


if __name__ == "__main__":
    asyncio.run(test_rag_search())
