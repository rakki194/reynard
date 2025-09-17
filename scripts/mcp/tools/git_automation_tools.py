"""
🦊 Git Automation Tools for MCP Server

MCP tools for Git workflow automation in the Reynard ecosystem.
Provides programmatic access to all Git automation components.
"""

import json
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

from .definitions import ToolDefinition


class GitAutomationTools:
    """Git automation tools for MCP server integration."""

    def __init__(self, working_dir: str = "."):
        self.working_dir = Path(working_dir).resolve()
        self.package_path = self.working_dir / "packages" / "git-automation"

    async def _run_command(
        self, command: List[str], cwd: Optional[Path] = None
    ) -> Dict[str, Any]:
        """Run a command and return the result."""
        try:
            cwd = cwd or self.working_dir
            result = subprocess.run(
                command, cwd=cwd, capture_output=True, text=True, timeout=300
            )

            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode,
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "stdout": "",
                "stderr": "Command timed out",
                "returncode": -1,
            }
        except Exception as e:
            return {"success": False, "stdout": "", "stderr": str(e), "returncode": -1}

    async def _run_git_automation(
        self, command: str, args: List[str] = None
    ) -> Dict[str, Any]:
        """Run a reynard-git command."""
        if not self.package_path.exists():
            return {
                "success": False,
                "error": "Git automation package not found. Please install reynard-git-automation.",
            }

        cmd = ["npx", "reynard-git", command]
        if args:
            cmd.extend(args)

        return await self._run_command(cmd)

    async def detect_junk_files(
        self, cleanup: bool = False, force: bool = False, dry_run: bool = False
    ) -> Dict[str, Any]:
        """Detect and optionally clean up junk files in the repository."""
        args = []
        if cleanup:
            args.append("--cleanup")
        if force:
            args.append("--force")
        if dry_run:
            args.append("--dry-run")

        result = await self._run_git_automation("junk", args)

        if result["success"]:
            return {
                "success": True,
                "message": "Junk file detection completed",
                "output": result["stdout"],
            }
        else:
            return {
                "success": False,
                "error": f"Junk file detection failed: {result['stderr']}",
            }

    async def analyze_changes(self) -> Dict[str, Any]:
        """Analyze Git changes and determine their impact."""
        result = await self._run_git_automation("analyze")

        if result["success"]:
            return {
                "success": True,
                "message": "Change analysis completed",
                "output": result["stdout"],
            }
        else:
            return {
                "success": False,
                "error": f"Change analysis failed: {result['stderr']}",
            }

    async def generate_commit_message(
        self, include_body: bool = True, include_footer: bool = True
    ) -> Dict[str, Any]:
        """Generate a conventional commit message from changes."""
        args = []
        if include_body:
            args.append("--body")
        if include_footer:
            args.append("--footer")

        result = await self._run_git_automation("commit", args)

        if result["success"]:
            return {
                "success": True,
                "message": "Commit message generated",
                "output": result["stdout"],
            }
        else:
            return {
                "success": False,
                "error": f"Commit message generation failed: {result['stderr']}",
            }

    async def manage_changelog(
        self,
        action: str = "show",
        version: Optional[str] = None,
        date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Manage CHANGELOG.md file."""
        args = []

        if action == "validate":
            args.append("--validate")
        elif action == "promote" and version:
            args.extend(["--version", version])
            if date:
                args.extend(["--date", date])
        elif action == "show":
            pass  # Default action
        else:
            return {
                "success": False,
                "error": f"Invalid action: {action}. Valid actions are 'show', 'validate', 'promote'",
            }

        result = await self._run_git_automation("changelog", args)

        if result["success"]:
            return {
                "success": True,
                "message": f"Changelog {action} completed",
                "output": result["stdout"],
            }
        else:
            return {
                "success": False,
                "error": f"Changelog {action} failed: {result['stderr']}",
            }

    async def manage_version(
        self,
        action: str = "show",
        bump_type: Optional[str] = None,
        create_tag: bool = False,
        push_tag: bool = False,
    ) -> Dict[str, Any]:
        """Manage package versions and Git tags."""
        args = []

        if action == "bump" and bump_type:
            args.extend(["--bump", bump_type])
            if create_tag:
                args.append("--tag")
            if push_tag:
                args.append("--push")
        elif action == "show":
            pass  # Default action
        else:
            return {
                "success": False,
                "error": f"Invalid action: {action}. Valid actions are 'show', 'bump'",
            }

        result = await self._run_git_automation("version", args)

        if result["success"]:
            return {
                "success": True,
                "message": f"Version {action} completed",
                "output": result["stdout"],
            }
        else:
            return {
                "success": False,
                "error": f"Version {action} failed: {result['stderr']}",
            }

    async def execute_workflow(
        self,
        skip_junk: bool = False,
        skip_analysis: bool = False,
        skip_commit: bool = False,
        skip_version: bool = False,
        skip_changelog: bool = False,
        skip_tag: bool = False,
        dry_run: bool = False,
        auto_confirm: bool = False,
        commit_message: Optional[str] = None,
        bump_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Execute the complete Git workflow automation."""
        args = []

        if skip_junk:
            args.append("--skip-junk")
        if skip_analysis:
            args.append("--skip-analysis")
        if skip_commit:
            args.append("--skip-commit")
        if skip_version:
            args.append("--skip-version")
        if skip_changelog:
            args.append("--skip-changelog")
        if skip_tag:
            args.append("--skip-tag")
        if dry_run:
            args.append("--dry-run")
        if auto_confirm:
            args.append("--auto-confirm")
        if commit_message:
            args.extend(["-m", commit_message])
        if bump_type:
            args.extend(["-b", bump_type])

        result = await self._run_git_automation("workflow", args)

        if result["success"]:
            return {
                "success": True,
                "message": "Git workflow completed successfully",
                "output": result["stdout"],
            }
        else:
            return {
                "success": False,
                "error": f"Git workflow failed: {result['stderr']}",
            }

    async def quick_workflow(self) -> Dict[str, Any]:
        """Execute quick workflow with minimal prompts."""
        result = await self._run_git_automation("quick")

        if result["success"]:
            return {
                "success": True,
                "message": "Quick workflow completed successfully",
                "output": result["stdout"],
            }
        else:
            return {
                "success": False,
                "error": f"Quick workflow failed: {result['stderr']}",
            }

    async def get_workflow_status(self) -> Dict[str, Any]:
        """Get current workflow status."""
        # Check if we have changes
        git_status = await self._run_command(["git", "status", "--porcelain"])
        has_changes = bool(git_status["stdout"].strip())

        # Check current version
        try:
            with open(self.working_dir / "package.json") as f:
                package_json = json.load(f)
                current_version = package_json.get("version", "unknown")
        except:
            current_version = "unknown"

        # Check latest tag
        git_tags = await self._run_command(
            ["git", "tag", "--list", "--sort=-version:refname"]
        )
        latest_tag = (
            git_tags["stdout"].split("\n")[0] if git_tags["stdout"].strip() else None
        )

        return {
            "success": True,
            "status": {
                "has_changes": has_changes,
                "current_version": current_version,
                "latest_tag": latest_tag,
                "working_directory": str(self.working_dir),
            },
        }


# Tool definitions for MCP server
GIT_AUTOMATION_TOOL_DEFINITIONS = [
    ToolDefinition(
        name="detect_junk_files",
        description="Detect and optionally clean up junk files in the repository",
        parameters={
            "type": "object",
            "properties": {
                "cleanup": {
                    "type": "boolean",
                    "description": "Clean up detected junk files",
                    "default": False,
                },
                "force": {
                    "type": "boolean",
                    "description": "Force cleanup without confirmation",
                    "default": False,
                },
                "dry_run": {
                    "type": "boolean",
                    "description": "Show what would be cleaned up without actually doing it",
                    "default": False,
                },
            },
        },
    ),
    ToolDefinition(
        name="analyze_git_changes",
        description="Analyze Git changes and determine their impact and categorization",
        parameters={"type": "object", "properties": {}},
    ),
    ToolDefinition(
        name="generate_commit_message",
        description="Generate a conventional commit message from analyzed changes",
        parameters={
            "type": "object",
            "properties": {
                "include_body": {
                    "type": "boolean",
                    "description": "Include detailed body in commit message",
                    "default": True,
                },
                "include_footer": {
                    "type": "boolean",
                    "description": "Include footer with additional information",
                    "default": True,
                },
            },
        },
    ),
    ToolDefinition(
        name="manage_changelog",
        description="Manage CHANGELOG.md file with validation and version promotion",
        parameters={
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "Action to perform: 'show', 'validate', 'promote'",
                    "enum": ["show", "validate", "promote"],
                    "default": "show",
                },
                "version": {
                    "type": "string",
                    "description": "Version to promote unreleased changes to (required for 'promote' action)",
                },
                "date": {
                    "type": "string",
                    "description": "Date for the version in YYYY-MM-DD format",
                },
            },
        },
    ),
    ToolDefinition(
        name="manage_version",
        description="Manage package versions and Git tags with semantic versioning",
        parameters={
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "Action to perform: 'show', 'bump'",
                    "enum": ["show", "bump"],
                    "default": "show",
                },
                "bump_type": {
                    "type": "string",
                    "description": "Version bump type: 'major', 'minor', 'patch' (required for 'bump' action)",
                    "enum": ["major", "minor", "patch"],
                },
                "create_tag": {
                    "type": "boolean",
                    "description": "Create Git tag for the version",
                    "default": False,
                },
                "push_tag": {
                    "type": "boolean",
                    "description": "Push Git tag to remote",
                    "default": False,
                },
            },
        },
    ),
    ToolDefinition(
        name="execute_git_workflow",
        description="Execute the complete Git workflow automation with all steps",
        parameters={
            "type": "object",
            "properties": {
                "skip_junk": {
                    "type": "boolean",
                    "description": "Skip junk file detection",
                    "default": False,
                },
                "skip_analysis": {
                    "type": "boolean",
                    "description": "Skip change analysis",
                    "default": False,
                },
                "skip_commit": {
                    "type": "boolean",
                    "description": "Skip commit message generation",
                    "default": False,
                },
                "skip_version": {
                    "type": "boolean",
                    "description": "Skip version bump",
                    "default": False,
                },
                "skip_changelog": {
                    "type": "boolean",
                    "description": "Skip changelog update",
                    "default": False,
                },
                "skip_tag": {
                    "type": "boolean",
                    "description": "Skip Git tag creation",
                    "default": False,
                },
                "dry_run": {
                    "type": "boolean",
                    "description": "Show what would be done without executing",
                    "default": False,
                },
                "auto_confirm": {
                    "type": "boolean",
                    "description": "Skip all confirmations and proceed automatically",
                    "default": False,
                },
                "commit_message": {
                    "type": "string",
                    "description": "Custom commit message (overrides generated message)",
                },
                "bump_type": {
                    "type": "string",
                    "description": "Version bump type: 'major', 'minor', 'patch'",
                    "enum": ["major", "minor", "patch"],
                },
            },
        },
    ),
    ToolDefinition(
        name="quick_git_workflow",
        description="Execute quick Git workflow with minimal prompts and auto-confirm",
        parameters={"type": "object", "properties": {}},
    ),
    ToolDefinition(
        name="get_git_workflow_status",
        description="Get current Git workflow status including changes, version, and tags",
        parameters={"type": "object", "properties": {}},
    ),
]
