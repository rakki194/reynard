#!/usr/bin/env python3
"""Test script for MCP authorization system.

This script tests the MCP token generation and RAG endpoint authorization.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend to the Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.security.mcp_auth import mcp_auth_service


async def test_mcp_authorization():
    """Test MCP authorization system."""
    print("🦊 Testing MCP Authorization System")
    print("=" * 50)

    # Test 1: Generate token for MCP server
    print("\n1. Generating MCP token for 'reynard-mcp-server'...")
    try:
        token = mcp_auth_service.generate_mcp_token("reynard-mcp-server")
        print("✅ Token generated successfully")
        print(f"Token (first 50 chars): {token[:50]}...")

        # Test 2: Validate token
        print("\n2. Validating MCP token...")
        token_data = mcp_auth_service.validate_mcp_token(token)
        print("✅ Token validated successfully")
        print(f"Client ID: {token_data.client_id}")
        print(f"Client Type: {token_data.client_type}")
        print(f"Permissions: {token_data.permissions}")
        print(f"Expires at: {token_data.expires_at}")

        # Test 3: Check permissions
        print("\n3. Testing permission checks...")
        permissions_to_test = [
            "rag:query",
            "rag:stats",
            "rag:config",
            "embed:text",
            "mcp:admin",
            "rag:ingest",  # This should fail
        ]

        for permission in permissions_to_test:
            has_permission = mcp_auth_service.check_permission(token_data, permission)
            status = "✅" if has_permission else "❌"
            print(f"{status} Permission '{permission}': {has_permission}")

        # Test 4: List all clients
        print("\n4. Listing all MCP clients...")
        clients = mcp_auth_service.list_clients()
        for client in clients:
            print(f"  • {client.client_id} ({client.client_type}): {client.name}")
            print(f"    Permissions: {client.permissions}")
            print(f"    Active: {client.is_active}")

        # Test 5: Generate token for semantic search tool
        print("\n5. Generating token for 'reynard-semantic-search'...")
        try:
            search_token = mcp_auth_service.generate_mcp_token(
                "reynard-semantic-search",
            )
            search_token_data = mcp_auth_service.validate_mcp_token(search_token)
            print("✅ Search tool token generated")
            print(f"Permissions: {search_token_data.permissions}")

            # Test permission for search tool
            has_rag_query = mcp_auth_service.check_permission(
                search_token_data,
                "rag:query",
            )
            has_rag_ingest = mcp_auth_service.check_permission(
                search_token_data,
                "rag:ingest",
            )
            print(f"  Can query RAG: {has_rag_query}")
            print(f"  Can ingest documents: {has_rag_ingest}")

        except Exception as e:
            print(f"❌ Failed to generate search tool token: {e}")

        print("\n🎉 MCP Authorization system test completed successfully!")

    except Exception as e:
        print(f"❌ MCP authorization test failed: {e}")
        return False

    return True


async def test_curl_commands():
    """Generate curl commands for testing the API."""
    print("\n" + "=" * 50)
    print("🔧 CURL Commands for Testing")
    print("=" * 50)

    try:
        # Generate token
        token = mcp_auth_service.generate_mcp_token("reynard-mcp-server")

        print("\n1. Generate MCP Token:")
        print("curl -X POST http://localhost:8000/api/mcp/token \\")
        print("  -H 'Content-Type: application/json' \\")
        print(f"  -H 'Authorization: Bearer {token}' \\")
        print('  -d \'{"client_id": "reynard-mcp-server"}\'')

        print("\n2. Test RAG Query (should work):")
        print("curl -X POST http://localhost:8000/api/rag/query \\")
        print("  -H 'Content-Type: application/json' \\")
        print(f"  -H 'Authorization: Bearer {token}' \\")
        print('  -d \'{"q": "test query", "modality": "hybrid", "top_k": 5}\'')

        print("\n3. Test RAG Stats (should work):")
        print("curl -X GET http://localhost:8000/api/rag/admin/stats \\")
        print(f"  -H 'Authorization: Bearer {token}'")

        print("\n4. Test RAG Ingest (should fail - no permission):")
        print("curl -X POST http://localhost:8000/api/rag/ingest \\")
        print("  -H 'Content-Type: application/json' \\")
        print(f"  -H 'Authorization: Bearer {token}' \\")
        print('  -d \'{"items": [{"file_path": "/test.txt"}]}\'')

        print("\n5. Test without token (should fail):")
        print("curl -X GET http://localhost:8000/api/rag/admin/stats")

    except Exception as e:
        print(f"❌ Failed to generate curl commands: {e}")


if __name__ == "__main__":

    async def main():
        success = await test_mcp_authorization()
        await test_curl_commands()

        if success:
            print("\n🦊 All tests passed! MCP authorization is working correctly.")
            sys.exit(0)
        else:
            print("\n❌ Some tests failed. Check the output above.")
            sys.exit(1)

    asyncio.run(main())
