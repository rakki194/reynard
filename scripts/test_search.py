#!/usr/bin/env python3
"""Test Enhanced Search Functionality
==================================

Test script to validate the new enhanced search capabilities.
"""

import asyncio
import sys
from pathlib import Path

# Add the MCP scripts directory to the path
mcp_scripts_dir = Path(__file__).parent / "mcp"
sys.path.insert(0, str(mcp_scripts_dir))

from services.search_service import SearchService


async def test_search():
    """Test the search service."""
    print("🦊 Testing Search Service...")

    # Initialize the service
    service = SearchService()

    # Test 1: Health check
    print("\n1. Testing health check...")
    health = await service.health_check()
    print(f"   Health status: {health}")

    # Test 2: Search stats
    print("\n2. Testing search stats...")
    stats = await service.get_search_stats()
    print(f"   Search stats: {stats}")

    # Test 3: Query suggestions
    print("\n3. Testing query suggestions...")
    suggestions = await service.get_query_suggestions(
        "authentication",
        max_suggestions=3,
    )
    print(f"   Query suggestions: {suggestions}")

    # Test 4: Smart search
    print("\n4. Testing smart search...")
    search_result = await service.smart_search(
        query="authentication",
        max_results=5,
        file_types=["py", "ts"],
        directories=["backend", "packages"],
    )
    print(f"   Smart search results: {search_result}")

    # Test 5: Semantic search
    print("\n5. Testing semantic search...")
    semantic_result = await service.semantic_search(
        query="user authentication flow",
        top_k=3,
        file_types=["py"],
        directories=["backend"],
    )
    print(f"   Semantic search results: {semantic_result}")

    # Test 6: Syntax search
    print("\n6. Testing syntax search...")
    syntax_result = await service.syntax_search(
        query="def authenticate",
        max_count=3,
        file_types=["py"],
        directories=["backend"],
    )
    print(f"   Syntax search results: {syntax_result}")

    # Test 7: Hybrid search
    print("\n7. Testing hybrid search...")
    hybrid_result = await service.hybrid_search(
        query="authentication",
        max_results=5,
        file_types=["py", "ts"],
        directories=["backend", "packages"],
    )
    print(f"   Hybrid search results: {hybrid_result}")

    print("\n✅ Search testing completed!")


if __name__ == "__main__":
    asyncio.run(test_search())
