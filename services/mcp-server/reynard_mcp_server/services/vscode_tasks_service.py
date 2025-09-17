#!/usr/bin/env python3
"""
VS Code Tasks Service
=====================

Dedicated service for VS Code task management and execution.
Follows the 100-line axiom and modular architecture principles.
"""

import json
import logging
import subprocess
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class VSCodeTasksService:
    """Handles VS Code task discovery, validation, and execution."""

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent
        else:
            self.project_root = Path(project_root).resolve()

    def discover_tasks(self, workspace_path: str = ".") -> dict[str, Any]:
        """Discover all available VS Code tasks from tasks.json."""
        try:
            workspace_root = Path(workspace_path).resolve()
            tasks_file = workspace_root / ".vscode" / "tasks.json"

            if not tasks_file.exists():
                return {
                    "success": False,
                    "tasks": [],
                    "count": 0,
                    "error": f"tasks.json not found at {tasks_file}",
                }

            with tasks_file.open() as f:
                tasks_config = json.load(f)

            tasks = tasks_config.get("tasks", [])
            task_info = [
                {
                    "label": task.get("label", "Unnamed Task"),
                    "type": task.get("type", "shell"),
                    "command": task.get("command", ""),
                    "group": task.get("group", ""),
                    "is_background": task.get("isBackground", False),
                }
                for task in tasks
            ]

            return {
                "success": True,
                "tasks": task_info,
                "count": len(task_info),
                "tasks_file": str(tasks_file),
            }

        except Exception as e:
            logger.exception("Error discovering VS Code tasks")
            return {
                "success": False,
                "tasks": [],
                "count": 0,
                "error": str(e),
            }

    def validate_task(
        self, task_name: str, workspace_path: str = "."
    ) -> dict[str, Any]:
        """Validate that a task exists and is executable."""
        try:
            discovery_result = self.discover_tasks(workspace_path)
            if not discovery_result["success"]:
                return discovery_result

            tasks = discovery_result["tasks"]
            target_task = None

            for task in tasks:
                if task["label"] == task_name:
                    target_task = task
                    break

            if not target_task:
                return {
                    "success": False,
                    "error": f"Task '{task_name}' not found",
                    "available_tasks": [task["label"] for task in tasks],
                }

            return {
                "success": True,
                "task": target_task,
                "executable": bool(target_task.get("command")),
            }

        except Exception as e:
            logger.exception("Error validating VS Code task")
            return {
                "success": False,
                "error": str(e),
            }

    def execute_task(self, task_name: str, workspace_path: str = ".") -> dict[str, Any]:
        """Execute a VS Code task by name."""
        try:
            # Validate task first
            validation_result = self.validate_task(task_name, workspace_path)
            if not validation_result["success"]:
                return validation_result

            task = validation_result["task"]
            workspace_root = Path(workspace_path).resolve()

            # Extract command and args
            command = task.get("command", "")
            args = task.get("args", [])
            is_background = task.get("is_background", False)

            if not command:
                return {
                    "success": False,
                    "error": f"Task '{task_name}' has no command defined",
                }

            # Execute the task
            logger.info(f"Executing VS Code task: {task_name}")
            logger.info(f"Command: {command} {' '.join(args) if args else ''}")
            logger.info(f"Background: {is_background}")

            if is_background:
                # For background tasks, use Popen and return immediately
                process = subprocess.Popen(
                    [command, *args],
                    cwd=workspace_root,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                )

                return {
                    "success": True,
                    "task_name": task_name,
                    "command": f"{command} {' '.join(args) if args else ''}",
                    "pid": process.pid,
                    "background": True,
                    "status": "started",
                    "workspace": str(workspace_root),
                    "stdout": "Background task started",
                }
            # For non-background tasks, use run with timeout
            result = subprocess.run(
                [command, *args],
                cwd=workspace_root,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                check=False,
            )

            return {
                "success": result.returncode == 0,
                "task_name": task_name,
                "command": f"{command} {' '.join(args) if args else ''}",
                "return_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "workspace": str(workspace_root),
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": f"Task '{task_name}' timed out after 5 minutes",
                "task_name": task_name,
            }
        except Exception as e:
            logger.exception("Error executing VS Code task")
            return {
                "success": False,
                "error": str(e),
                "task_name": task_name,
            }
