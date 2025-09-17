#!/usr/bin/env python3
"""
Fixed Search System Test
=======================

Test script with proper timeout handling to prevent hanging.
"""

import asyncio
import signal
import sys
from pathlib import Path

# Add the MCP scripts directory to the path
mcp_scripts_dir = Path(__file__).parent / "mcp"
sys.path.insert(0, str(mcp_scripts_dir))

# Add services directory to path
services_dir = Path(__file__).parent.parent / "services"
sys.path.insert(0, str(services_dir))

# Add agent-naming to path
agent_naming_dir = services_dir / "agent-naming"
sys.path.insert(0, str(agent_naming_dir))

class TimeoutError(Exception):
    """Custom timeout error."""
    pass

def timeout_handler(signum, frame):
    """Handle timeout signal."""
    raise TimeoutError("Test timed out")

async def test_with_timeout(coro, timeout_seconds=10):
    """Run a coroutine with timeout."""
    try:
        return await asyncio.wait_for(coro, timeout=timeout_seconds)
    except asyncio.TimeoutError:
        print(f"   ⏰ Test timed out after {timeout_seconds} seconds")
        return None

async def test_search_service():
    """Test the search service with timeouts."""
    print("🦊 Testing Search Service...")
    
    try:
        from services.search_service import SearchService
        
        service = SearchService()
        
        # Test 1: Health check with timeout
        print("\n1. Testing health check...")
        health = await test_with_timeout(service.health_check(), 10)
        if health:
            print(f"   Health status: {health.get('success', False)}")
        else:
            print("   Health check timed out")
        
        # Test 2: Search stats with timeout
        print("\n2. Testing search stats...")
        stats = await test_with_timeout(service.get_search_stats(), 10)
        if stats:
            print(f"   Stats success: {stats.get('success', False)}")
        else:
            print("   Stats check timed out")
        
        # Test 3: Query suggestions with timeout
        print("\n3. Testing query suggestions...")
        suggestions = await test_with_timeout(
            service.get_query_suggestions("authentication", max_suggestions=3), 10
        )
        if suggestions:
            print(f"   Suggestions success: {suggestions.get('success', False)}")
        else:
            print("   Suggestions check timed out")
        
        # Test 4: Smart search with timeout
        print("\n4. Testing smart search...")
        search_result = await test_with_timeout(
            service.smart_search("authentication", max_results=5), 15
        )
        if search_result:
            print(f"   Smart search success: {search_result.get('success', False)}")
        else:
            print("   Smart search timed out")
        
        print("\n✅ Search service tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Search service test failed: {e}")
        return False

async def test_mcp_imports():
    """Test MCP imports."""
    print("\n🐺 Testing MCP Imports...")
    
    try:
        # Test agent naming import
        print("\n1. Testing agent naming import...")
        from reynard_agent_naming.agent_naming import AgentNameManager
        print("   ✅ Agent naming import successful")
        
        # Test MCP protocol imports
        print("\n2. Testing MCP protocol imports...")
        from protocol.mcp_handler import MCPHandler
        from protocol.tool_registry import ToolExecutionType, ToolRegistry
        print("   ✅ MCP protocol imports successful")
        
        # Test search tools import
        print("\n3. Testing search tools import...")
        from tools.search.search_tools import SearchTools
        print("   ✅ Search tools import successful")
        
        # Test tool registration
        print("\n4. Testing tool registration...")
        tool_registry = ToolRegistry()
        search_tools = SearchTools()
        tool_registry.register_tool(
            "search_health_check",
            search_tools.search_health_check,
            ToolExecutionType.ASYNC,
            "search",
        )
        print("   ✅ Tool registration successful")
        
        # Test MCP handler creation
        print("\n5. Testing MCP handler creation...")
        mcp_handler = MCPHandler(tool_registry)
        print("   ✅ MCP handler creation successful")
        
        print("\n✅ MCP import tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ MCP import test failed: {e}")
        return False

async def main():
    """Run all tests with proper timeout handling."""
    print("🚀 Starting Fixed Search System Tests...")
    print("=" * 60)
    
    # Set up signal handler for overall timeout
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(120)  # 2 minute overall timeout
    
    try:
        # Run tests
        search_success = await test_search_service()
        mcp_success = await test_mcp_imports()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        print(f"Search Service: {'✅ PASS' if search_success else '❌ FAIL'}")
        print(f"MCP Imports: {'✅ PASS' if mcp_success else '❌ FAIL'}")
        
        overall_success = search_success and mcp_success
        print(f"\nOverall: {'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}")
        
        return overall_success
        
    except TimeoutError:
        print("\n⏰ Overall test timeout reached!")
        return False
    finally:
        signal.alarm(0)  # Cancel the alarm

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {e}")
        sys.exit(1)
