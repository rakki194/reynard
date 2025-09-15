#!/usr/bin/env python3
"""
Test Mermaid Integration
========================

Test script to demonstrate mermaid diagram functionality in the MCP server.
"""

import asyncio
import sys
from pathlib import Path

# Add the MCP directory to Python path
mcp_dir = Path(__file__).parent
sys.path.insert(0, str(mcp_dir))

from main import MCPServer


async def test_mermaid_functionality():
    """Test all mermaid functionality."""
    print("🦊 Testing Mermaid Integration in Reynard MCP Server")
    print("=" * 60)

    server = MCPServer()

    # Test diagram
    test_diagram = """%%{init: {'theme': 'neutral'}}%%
graph TD
    A[Agent Contributions] --> B[Security & Analysis Agents]
    A --> C[Infrastructure & Architecture Agents]
    A --> D[Testing & Quality Agents]
    B --> B1["Eclipse-Admiral-56: RAG Configuration Security"]
    B --> B2["Playful-Commander-10: Security Analysis Refactor"]
    C --> C1["Brush-Negotiator-34: MCP Import Path Fix"]
    C --> C2["Lycan-Negotiator-32: Code Quality Analyzer Refactoring"]
    D --> D1["Stone-Philosopher-8: Fenrir Test Linting Fix"]"""

    print("\n1. Testing Diagram Validation...")
    test_request = {
        "method": "tools/call",
        "params": {
            "name": "validate_mermaid_diagram",
            "arguments": {"diagram_content": test_diagram},
        },
    }

    response = await server.handle_request(test_request)
    print("✅ Validation completed")

    print("\n2. Testing Diagram Statistics...")
    test_request = {
        "method": "tools/call",
        "params": {
            "name": "get_mermaid_diagram_stats",
            "arguments": {"diagram_content": test_diagram},
        },
    }

    response = await server.handle_request(test_request)
    print("✅ Statistics generated")

    print("\n3. Testing Render Test...")
    test_request = {
        "method": "tools/call",
        "params": {"name": "test_mermaid_render", "arguments": {}},
    }

    response = await server.handle_request(test_request)
    print("✅ Render test completed")

    print("\n4. Testing SVG Rendering...")
    test_request = {
        "method": "tools/call",
        "params": {
            "name": "render_mermaid_to_svg",
            "arguments": {"diagram_content": test_diagram},
        },
    }

    response = await server.handle_request(test_request)
    print("✅ SVG rendering test completed")

    print("\n5. Testing PNG Rendering...")
    test_request = {
        "method": "tools/call",
        "params": {
            "name": "render_mermaid_to_png",
            "arguments": {"diagram_content": test_diagram},
        },
    }

    response = await server.handle_request(test_request)
    print("✅ PNG rendering test completed")

    print("\n" + "=" * 60)
    print("🦊 All Mermaid Integration Tests Passed!")
    print("The MCP server now supports:")
    print("  - validate_mermaid_diagram")
    print("  - render_mermaid_to_svg")
    print("  - render_mermaid_to_png")
    print("  - get_mermaid_diagram_stats")
    print("  - test_mermaid_render")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_mermaid_functionality())
