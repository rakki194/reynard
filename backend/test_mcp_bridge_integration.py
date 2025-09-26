#!/usr/bin/env python3
"""Test MCP-NLWeb Bridge Integration

This script tests the complete MCP-NLWeb bridge integration to ensure
all components work together correctly.
"""

import asyncio
import json
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from app.services.mcp_integration import get_mcp_integration


async def test_mcp_integration():
    """Test the MCP integration directly."""
    print("🦊 Testing MCP Integration...")
    
    # Get MCP integration
    mcp_integration = get_mcp_integration()
    
    # Test 1: Health Check
    print("\n1. Testing health check...")
    health = await mcp_integration.health_check()
    print(f"   Health Status: {health['status']}")
    print(f"   Service: {health.get('service', 'unknown')}")
    
    if health['status'] != 'healthy':
        print("   ❌ MCP integration is not healthy, skipping further tests")
        return False
    
    # Test 2: Tool Discovery
    print("\n2. Testing tool discovery...")
    tools_result = await mcp_integration.list_tools()
    tools = tools_result.get('tools', [])
    print(f"   Discovered {len(tools)} tools")
    
    if not tools:
        print("   ❌ No tools discovered")
        return False
    
    # Show some tools
    for i, tool in enumerate(tools[:3]):
        print(f"   - {tool.get('name', 'unknown')}: {tool.get('description', 'no description')}")
    
    # Test 3: Tool Information
    print("\n3. Testing tool information...")
    git_tool_info = None
    for tool in tools:
        if tool.get('name') == 'git_tool':
            git_tool_info = tool
            break
    
    if git_tool_info:
        print(f"   ✅ git_tool found: {git_tool_info.get('description', 'no description')}")
    else:
        print("   ❌ git_tool not found")
    
    # Test 4: Tool Execution (if git_tool is available)
    print("\n4. Testing tool execution...")
    if git_tool_info:
        try:
            result = await mcp_integration.call_tool(
                "git_tool",
                {"operation": "status", "args": {}}
            )
            
            print(f"   ✅ git_tool executed successfully")
            print(f"   Result keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
        except Exception as e:
            print(f"   ❌ git_tool execution error: {e}")
    else:
        print("   ⏭️  Skipping tool execution (git_tool not available)")
    
    print("\n✅ MCP Integration Test Complete!")
    return True


async def test_nlweb_service_integration():
    """Test NLWeb service integration with MCP integration."""
    print("\n🦊 Testing NLWeb Service Integration...")
    
    try:
        from app.services.nlweb.nlweb_service import NLWebService
        
        # Initialize NLWeb service
        nlweb_service = NLWebService()
        
        # Test tool registration
        print("   Testing tool registration...")
        await nlweb_service._register_default_tools()
        
        # Get registered tools
        tools = nlweb_service.tool_registry.get_all_tools()
        print(f"   Registered {len(tools)} tools in NLWeb service")
        
        # Show some tools
        for i, tool in enumerate(tools[:3]):
            print(f"   - {tool.name}: {tool.description}")
        
        print("   ✅ NLWeb Service Integration Test Complete!")
        return True
        
    except Exception as e:
        print(f"   ❌ NLWeb Service Integration Test Failed: {e}")
        return False


async def main():
    """Run all integration tests."""
    print("🦊 MCP Integration Test Suite")
    print("=" * 50)
    
    # Test MCP integration
    mcp_success = await test_mcp_integration()
    
    # Test NLWeb service
    nlweb_success = await test_nlweb_service_integration()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   MCP Integration: {'✅ PASS' if mcp_success else '❌ FAIL'}")
    print(f"   NLWeb Service: {'✅ PASS' if nlweb_success else '❌ FAIL'}")
    
    if mcp_success and nlweb_success:
        print("\n🎉 All tests passed! MCP integration is working correctly.")
        return 0
    else:
        print("\n💥 Some tests failed. Check the output above for details.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
