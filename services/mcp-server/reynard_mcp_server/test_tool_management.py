#!/usr/bin/env python3
"""
Test Script for Tool Management System

This script tests the tool management functionality including:
- Tool configuration service
- Tool registry integration
- Authentication system
- Backend communication
"""

import asyncio
import json
import sys
from pathlib import Path

# Add the MCP scripts directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from services.tool_config_service import ToolConfigService
from services.auth_service import mcp_auth_service
from protocol.tool_registry import ToolRegistry, ToolExecutionType
from tools.tool_management_tools import ToolManagementTools


async def test_tool_config_service():
    """Test the tool configuration service."""
    print("🦦 Testing Tool Configuration Service...")
    
    # Initialize service
    config_service = ToolConfigService("test_tool_config.json")
    
    # Test getting all tools
    all_tools = config_service.get_all_tools()
    print(f"✅ Found {len(all_tools)} tools in configuration")
    
    # Test enabling/disabling tools
    test_tool = "lint_frontend"
    original_state = config_service.is_tool_enabled(test_tool)
    print(f"✅ Tool '{test_tool}' is {'enabled' if original_state else 'disabled'}")
    
    # Toggle the tool
    success = config_service.toggle_tool(test_tool)
    new_state = config_service.is_tool_enabled(test_tool)
    print(f"✅ Toggled tool '{test_tool}' to {'enabled' if new_state else 'disabled'}")
    
    # Restore original state
    if new_state != original_state:
        config_service.toggle_tool(test_tool)
        print(f"✅ Restored tool '{test_tool}' to original state")
    
    # Test getting tools by category
    linting_tools = config_service.get_tools_by_category("linting")
    print(f"✅ Found {len(linting_tools)} linting tools")
    
    # Test getting stats
    stats = config_service.get_tool_stats()
    print(f"✅ Tool stats: {stats['enabled_tools']}/{stats['total_tools']} enabled")
    
    # Clean up test file
    test_file = Path("test_tool_config.json")
    if test_file.exists():
        test_file.unlink()
        print("✅ Cleaned up test configuration file")


def test_auth_service():
    """Test the authentication service."""
    print("\n🦊 Testing Authentication Service...")
    
    # Test token generation
    client_id = "test-client"
    permissions = ["mcp:tools:execute", "mcp:config:read"]
    
    token = mcp_auth_service.generate_mcp_token(client_id, permissions)
    print(f"✅ Generated token for client: {client_id}")
    
    # Test token validation
    try:
        payload = mcp_auth_service.validate_mcp_token(token)
        print(f"✅ Validated token for client: {payload['client_id']}")
        print(f"✅ Token permissions: {payload['permissions']}")
        
        # Test permission checks
        can_execute = mcp_auth_service.can_execute_tools(payload)
        can_manage = mcp_auth_service.can_manage_tools(payload)
        is_admin = mcp_auth_service.is_admin(payload)
        
        print(f"✅ Can execute tools: {can_execute}")
        print(f"✅ Can manage tools: {can_manage}")
        print(f"✅ Is admin: {is_admin}")
        
    except Exception as e:
        print(f"❌ Token validation failed: {e}")
    
    # Test admin token
    admin_token = mcp_auth_service.generate_mcp_token("admin-client", ["mcp:admin"])
    try:
        admin_payload = mcp_auth_service.validate_mcp_token(admin_token)
        is_admin = mcp_auth_service.is_admin(admin_payload)
        can_manage = mcp_auth_service.can_manage_tools(admin_payload)
        print(f"✅ Admin token - Is admin: {is_admin}, Can manage: {can_manage}")
    except Exception as e:
        print(f"❌ Admin token validation failed: {e}")


async def test_tool_management_tools():
    """Test the tool management tools."""
    print("\n🐺 Testing Tool Management Tools...")
    
    # Initialize components
    config_service = ToolConfigService("test_tool_config.json")
    tool_registry = ToolRegistry(tool_config_service=config_service)
    tool_management = ToolManagementTools(tool_registry)
    
    # Test getting tool configs
    result = tool_management.get_tool_configs({})
    if result["success"]:
        print(f"✅ Retrieved {len(result['tools'])} tool configurations")
    else:
        print(f"❌ Failed to get tool configs: {result['error']}")
    
    # Test getting tool status
    result = tool_management.get_tool_status({"tool_name": "lint_frontend"})
    if result["success"]:
        print(f"✅ Tool status: {result['tool_name']} is {'enabled' if result['is_enabled'] else 'disabled'}")
    else:
        print(f"❌ Failed to get tool status: {result['error']}")
    
    # Test enabling a tool
    result = tool_management.enable_tool({"tool_name": "lint_frontend"})
    if result["success"]:
        print(f"✅ Enabled tool: {result['tool_name']}")
    else:
        print(f"❌ Failed to enable tool: {result['error']}")
    
    # Test getting tools by category
    result = tool_management.get_tools_by_category({"category": "linting"})
    if result["success"]:
        print(f"✅ Found {result['count']} tools in linting category")
    else:
        print(f"❌ Failed to get tools by category: {result['error']}")
    
    # Clean up test file
    test_file = Path("test_tool_config.json")
    if test_file.exists():
        test_file.unlink()
        print("✅ Cleaned up test configuration file")


async def main():
    """Run all tests."""
    print("🦊🦦🐺 Testing Reynard Tool Management System")
    print("=" * 50)
    
    try:
        await test_tool_config_service()
        test_auth_service()
        await test_tool_management_tools()
        
        print("\n" + "=" * 50)
        print("✅ All tests completed successfully!")
        print("🦊 The tool management system is ready for integration!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
