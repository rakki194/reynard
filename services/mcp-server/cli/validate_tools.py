#!/usr/bin/env python3
"""
MCP Tool Validation CLI
=======================

Command-line tool to validate all registered MCP tools and their schemas.

Follows the 140-line axiom and modular architecture principles.
"""

import argparse
import sys

from protocol.tool_discovery import ToolDiscovery
from protocol.tool_registry import get_tool_registry

from validation.schema_validator import MCPSchemaValidator


def validate_all_tools() -> tuple[int, int]:
    """
    Validate all registered tools.

    Returns:
        Tuple of (valid_count, total_count)
    """
    # Get registry and discover tools
    registry = get_tool_registry()
    discovery = ToolDiscovery(registry)
    discovery.discover_and_import_tools("tools")

    validator = MCPSchemaValidator()
    valid_count = 0
    total_count = 0

    print("🔍 Validating MCP tools...")
    print("=" * 50)

    for tool_name, metadata in registry.list_all_tools().items():
        total_count += 1

        try:
            # Create tool definition from metadata
            tool_def = {
                "name": metadata.name,
                "description": metadata.description,
                "inputSchema": getattr(
                    metadata,
                    "input_schema",
                    {"type": "object", "properties": {}, "required": []},
                ),
            }

            # Validate the tool
            result = validator.validate_tool_schema(tool_def)

            if result.is_valid:
                print(f"✅ {tool_name}: Valid")
                valid_count += 1
            else:
                print(f"❌ {tool_name}: Invalid")
                for error in result.errors:
                    print(f"   Error: {error}")
                for warning in result.warnings:
                    print(f"   Warning: {warning}")

        except Exception as e:
            print(f"❌ {tool_name}: Error - {e}")

    print("=" * 50)
    print(f"📊 Validation Results: {valid_count}/{total_count} tools valid")

    return valid_count, total_count


def validate_specific_tool(tool_name: str) -> bool:
    """
    Validate a specific tool.

    Args:
        tool_name: Name of the tool to validate

    Returns:
        True if valid, False otherwise
    """
    registry = get_tool_registry()
    discovery = ToolDiscovery(registry)
    discovery.discover_and_import_tools("tools")

    if tool_name not in registry.list_all_tools():
        print(f"❌ Tool '{tool_name}' not found")
        return False

    metadata = registry.list_all_tools()[tool_name]
    validator = MCPSchemaValidator()

    try:
        tool_def = {
            "name": metadata.name,
            "description": metadata.description,
            "inputSchema": getattr(
                metadata,
                "input_schema",
                {"type": "object", "properties": {}, "required": []},
            ),
        }

        result = validator.validate_tool_schema(tool_def)

        if result.is_valid:
            print(f"✅ {tool_name}: Valid")
            return True
        else:
            print(f"❌ {tool_name}: Invalid")
            for error in result.errors:
                print(f"   Error: {error}")
            for warning in result.warnings:
                print(f"   Warning: {warning}")
            return False

    except Exception as e:
        print(f"❌ {tool_name}: Error - {e}")
        return False


def list_tools() -> None:
    """List all registered tools."""
    registry = get_tool_registry()
    discovery = ToolDiscovery(registry)
    discovery.discover_and_import_tools("tools")

    tools = registry.list_all_tools()

    print(f"📋 Registered Tools ({len(tools)} total):")
    print("=" * 50)

    for tool_name, metadata in tools.items():
        status = "✅" if registry.is_tool_enabled(tool_name) else "❌"
        print(f"{status} {tool_name}: {metadata.description}")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description="MCP Tool Validation CLI")
    parser.add_argument(
        "command",
        choices=["validate", "validate-tool", "list"],
        help="Command to execute",
    )
    parser.add_argument("--tool", help="Tool name for validate-tool command")

    args = parser.parse_args()

    try:
        if args.command == "validate":
            valid_count, total_count = validate_all_tools()
            sys.exit(0 if valid_count == total_count else 1)

        elif args.command == "validate-tool":
            if not args.tool:
                print("❌ --tool argument required for validate-tool command")
                sys.exit(1)
            is_valid = validate_specific_tool(args.tool)
            sys.exit(0 if is_valid else 1)

        elif args.command == "list":
            list_tools()
            sys.exit(0)

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
