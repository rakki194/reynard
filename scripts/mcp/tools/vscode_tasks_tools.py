#!/usr/bin/env python3
"""
VS Code Tasks Tools
===================

Tool handlers for VS Code task operations via MCP.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any

from services.vscode_tasks_service import VSCodeTasksService


class VSCodeTasksTools:
    """Handles VS Code task tool operations."""

    def __init__(self) -> None:
        self.tasks_service = VSCodeTasksService()

    def _format_result(self, result: dict[str, Any], operation: str) -> dict[str, Any]:
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

    def discover_tasks(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Discover all available VS Code tasks."""
        workspace_path = arguments.get("workspace_path", ".")
        result = self.tasks_service.discover_tasks(workspace_path)
        return self._format_result(result, "Discover VS Code Tasks")

    def validate_task(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Validate a specific VS Code task."""
        task_name = arguments.get("task_name")
        workspace_path = arguments.get("workspace_path", ".")

        if not task_name:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ FAILED - Validate VS Code Task\n\n⚠️ Error: task_name is required",
                    }
                ]
            }

        result = self.tasks_service.validate_task(task_name, workspace_path)
        return self._format_result(result, f"Validate VS Code Task: {task_name}")

    def execute_task(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Execute a VS Code task by name."""
        task_name = arguments.get("task_name")
        workspace_path = arguments.get("workspace_path", ".")

        if not task_name:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ FAILED - Execute VS Code Task\n\n⚠️ Error: task_name is required",
                    }
                ]
            }

        result = self.tasks_service.execute_task(task_name, workspace_path)
        return self._format_result(result, f"Execute VS Code Task: {task_name}")

    def get_task_info(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get detailed information about a specific task."""
        task_name = arguments.get("task_name")
        workspace_path = arguments.get("workspace_path", ".")

        if not task_name:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ FAILED - Get Task Info\n\n⚠️ Error: task_name is required",
                    }
                ]
            }

        result = self.tasks_service.validate_task(task_name, workspace_path)
        if result.get("success"):
            task = result.get("task", {})
            info_text = f"✅ SUCCESS - Get Task Info: {task_name}\n\n"
            info_text += "📋 Task Details:\n"
            info_text += f"  • Label: {task.get('label', 'N/A')}\n"
            info_text += f"  • Type: {task.get('type', 'N/A')}\n"
            info_text += f"  • Command: {task.get('command', 'N/A')}\n"
            info_text += f"  • Group: {task.get('group', 'N/A')}\n"
            info_text += f"  • Background: {task.get('is_background', False)}\n"
            info_text += f"  • Executable: {result.get('executable', False)}"

            return {"content": [{"type": "text", "text": info_text}]}
        return self._format_result(result, f"Get Task Info: {task_name}")
