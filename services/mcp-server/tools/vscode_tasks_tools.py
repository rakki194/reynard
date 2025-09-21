#!/usr/bin/env python3
"""
VS Code Tasks Tools
===================

Tool handlers for VS Code task operations via MCP.
Now uses the new @register_tool decorator system for automatic registration.

Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

from services.vscode_tasks_service import VSCodeTasksService
from protocol.tool_registry import register_tool

# Initialize service
tasks_service = VSCodeTasksService()


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

    return {"content": [{"type": "text", "text": "\n".join(output_lines)}]}


@register_tool(
    name="discover_vscode_tasks",
    category="vscode",
    description="Discover all available VS Code tasks from tasks.json",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def discover_vscode_tasks(**kwargs) -> dict[str, Any]:
    """Discover all available VS Code tasks."""
    arguments = kwargs.get("arguments", {})
    workspace_path = arguments.get("workspace_path", ".")
    result = tasks_service.discover_tasks(workspace_path)
    return _format_result(result, "Discover VS Code Tasks")


@register_tool(
    name="validate_vscode_task",
    category="vscode",
    description="Validate that a VS Code task exists and is executable",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def validate_vscode_task(**kwargs) -> dict[str, Any]:
    """Validate a specific VS Code task."""
    arguments = kwargs.get("arguments", {})
    task_name = arguments.get("task_name")
    workspace_path = arguments.get("workspace_path", ".")

    if not task_name:
        return {"content": [{"type": "text", "text": "❌ Task name is required"}]}

    result = tasks_service.validate_task(task_name, workspace_path)
    return _format_result(result, f"Validate VS Code Task: {task_name}")


@register_tool(
    name="execute_vscode_task",
    category="vscode",
    description="Execute a VS Code task by name",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def execute_vscode_task(**kwargs) -> dict[str, Any]:
    """Execute a VS Code task by name."""
    arguments = kwargs.get("arguments", {})
    task_name = arguments.get("task_name")
    workspace_path = arguments.get("workspace_path", ".")

    if not task_name:
        return {"content": [{"type": "text", "text": "❌ Task name is required"}]}

    result = tasks_service.execute_task(task_name, workspace_path)
    return _format_result(result, f"Execute VS Code Task: {task_name}")


@register_tool(
    name="get_vscode_task_info",
    category="vscode",
    description="Get detailed information about a specific VS Code task",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def get_vscode_task_info(**kwargs) -> dict[str, Any]:
    """Get detailed information about a specific VS Code task."""
    arguments = kwargs.get("arguments", {})
    task_name = arguments.get("task_name")
    workspace_path = arguments.get("workspace_path", ".")

    if not task_name:
        return {"content": [{"type": "text", "text": "❌ Task name is required"}]}

    result = tasks_service.get_task_info(task_name, workspace_path)
    return _format_result(result, f"Get VS Code Task Info: {task_name}")
