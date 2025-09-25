#!/usr/bin/env python3
"""
Enhanced Tool Handlers
======================

Handles enhanced MCP tool calls including version detection and VS Code integration.
Now uses the new @register_tool decorator system for automatic registration.

Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

from protocol.tool_registry import register_tool
from services.security_service import SecurityService
from services.version_service import VersionService
from services.vscode_service import VSCodeService

# Initialize services
version_service = VersionService()
vscode_service = VSCodeService()
security_service = SecurityService()


def _format_result(result: dict[str, Any], operation: str) -> dict[str, Any]:
    """Format tool result for MCP response."""
    if result.get("success", False):
        status = "✅ SUCCESS"
    else:
        status = "❌ FAILED"

    # Format output text
    output_lines = [f"{status} - {operation}"]

    if "summary" in result:
        output_lines.append(f"\n📊 {result['summary']}")

    if result.get("stdout"):
        output_lines.append(f"\n📝 Output:\n{result['stdout']}")

    if result.get("stderr") and not result.get("success", False):
        output_lines.append(f"\n⚠️ Errors:\n{result['stderr']}")

    # Show actual result data for VS Code tools
    if result.get("success", False):
        # Remove success flag and show actual data
        result_data = {
            k: v
            for k, v in result.items()
            if k not in ["success", "stdout", "stderr", "summary"]
        }
        if result_data:
            import json

            output_lines.append(f"\n📋 Data:\n{json.dumps(result_data, indent=2)}")

    return {"content": [{"type": "text", "text": "\n".join(output_lines)}]}


@register_tool(
    name="get_versions",
    category="version",
    description="Get versions of Python, Node.js, npm, pnpm, and TypeScript",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def get_versions(**kwargs) -> dict[str, Any]:
    """Get versions of Python, Node.js, npm, pnpm, and TypeScript."""
    result = await version_service.get_versions()
    return _format_result(result, "Version Detection")


@register_tool(
    name="get_python_version",
    category="version",
    description="Get Python version information",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def get_python_version(**kwargs) -> dict[str, Any]:
    """Get Python version information."""
    result = version_service.get_python_version()
    return _format_result(result, "Python Version Detection")


@register_tool(
    name="get_vscode_active_file",
    category="vscode",
    description="Get currently active file path in VS Code",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def get_vscode_active_file(**kwargs) -> dict[str, Any]:
    """Get currently active file path in VS Code."""
    result = vscode_service.get_vscode_active_file()
    return _format_result(result, "VS Code Active File Detection")
