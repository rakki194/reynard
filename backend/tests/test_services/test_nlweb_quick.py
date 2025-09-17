#!/usr/bin/env python3
"""
Quick NLWeb test script to verify setup and run basic tests.

This script provides a simple way to test NLWeb functionality
without running the full test suite.
"""

import asyncio
import sys
from pathlib import Path

import pytest

# Add the backend app to the path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "app"))

from app.services.nlweb.models import (
    NLWebConfiguration,
    NLWebTool,
    NLWebToolParameter,
)
from app.services.nlweb.nlweb_service import NLWebService
from app.services.nlweb.nlweb_tool_registry import NLWebToolRegistry


@pytest.mark.asyncio
async def test_nlweb_service_basic():
    """Test basic NLWeb service functionality."""
    print("🦦> Testing NLWeb service basic functionality...")

    # Create configuration
    config = NLWebConfiguration(
        enabled=True,
        base_url="http://localhost:3001",
        suggest_timeout_s=2.0,
        cache_ttl_s=15.0,
    )

    # Create service
    service = NLWebService(config)

    # Test initialization
    print("  - Testing service initialization...")
    initialized = await service.initialize()
    print(f"    Service initialized: {initialized}")

    # Test availability
    print("  - Testing service availability...")
    available = service.is_available()
    print(f"    Service available: {available}")

    # Test health status
    print("  - Testing health status...")
    health = await service.get_health_status()
    print(f"    Health status: {health.status}")
    print(f"    Enabled: {health.enabled}")
    print(f"    Connection state: {health.connection_state}")

    # Test performance stats
    print("  - Testing performance stats...")
    stats = await service.get_performance_stats()
    print(f"    Total requests: {stats.total_requests}")
    print(f"    Successful requests: {stats.successful_requests}")
    print(f"    Failed requests: {stats.failed_requests}")

    print("✅ NLWeb service basic test completed!")


def test_tool_registry():
    """Test NLWeb tool registry functionality."""
    print("🦦> Testing NLWeb tool registry...")

    # Create registry
    registry = NLWebToolRegistry()

    # Create test tool
    test_tool = NLWebTool(
        name="test_tool",
        description="A test tool for verification",
        category="testing",
        tags=["test", "example"],
        path="/api/test",
        method="POST",
        parameters=[
            NLWebToolParameter(
                name="param1",
                type="string",
                description="Test parameter",
                required=True,
            )
        ],
        examples=["test example", "run test tool"],
    )

    # Test tool registration
    print("  - Testing tool registration...")
    registry.register_tool(test_tool)
    print(f"    Tools registered: {len(registry.get_all_tools())}")

    # Test tool retrieval
    print("  - Testing tool retrieval...")
    retrieved_tool = registry.get_tool("test_tool")
    if retrieved_tool:
        print(f"    Retrieved tool: {retrieved_tool.name}")
        print(f"    Tool description: {retrieved_tool.description}")
        print(f"    Tool category: {retrieved_tool.category}")
        print(f"    Tool tags: {retrieved_tool.tags}")
    else:
        print("    ❌ Failed to retrieve tool")

    # Test category filtering
    print("  - Testing category filtering...")
    testing_tools = registry.get_tools_by_category("testing")
    print(f"    Tools in 'testing' category: {len(testing_tools)}")

    # Test tag filtering
    print("  - Testing tag filtering...")
    test_tools = registry.get_tools_by_tag("test")
    print(f"    Tools with 'test' tag: {len(test_tools)}")

    # Test getting all tools
    print("  - Testing get all tools...")
    all_tools = registry.get_all_tools()
    print(f"    Total tools: {len(all_tools)}")

    # Test categories and tags
    print("  - Testing categories and tags...")
    categories = registry.get_categories()
    tags = registry.get_tags()
    print(f"    Categories: {list(categories)}")
    print(f"    Tags: {list(tags)}")

    print("✅ NLWeb tool registry test completed!")


@pytest.mark.asyncio
async def test_ollama_integration():
    """Test Ollama integration (if available)."""
    print("🦦> Testing Ollama integration...")

    try:
        import httpx

        # Test Ollama connectivity
        print("  - Testing Ollama connectivity...")
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    "http://localhost:11434/api/tags", timeout=5.0
                )
                if response.status_code == 200:
                    models = response.json()
                    print("    ✅ Ollama is available")
                    print(f"    Available models: {len(models.get('models', []))}")
                    for model in models.get("models", [])[:3]:  # Show first 3 models
                        print(f"      - {model.get('name', 'Unknown')}")
                else:
                    print(f"    ⚠️ Ollama responded with status {response.status_code}")
            except Exception as e:
                print(f"    ❌ Ollama not available: {e}")
                print("    💡 Make sure Ollama is running on http://localhost:11434")

    except ImportError:
        print("  ⚠️ httpx not available, skipping Ollama connectivity test")

    print("✅ Ollama integration test completed!")


async def main():
    """Run all quick tests."""
    print("🦊> Starting NLWeb Quick Tests")
    print("=" * 50)

    try:
        # Test tool registry
        test_tool_registry()
        print()

        # Test NLWeb service
        await test_nlweb_service_basic()
        print()

        # Test Ollama integration
        await test_ollama_integration()
        print()

        print("🎉 All quick tests completed successfully!")
        print("💡 To run the full test suite, use: ./scripts/test-nlweb.sh")

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
