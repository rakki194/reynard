#!/usr/bin/env python3
"""
🦊 Git Automation Tools for MCP Server

MCP tools for Git workflow automation in the Reynard ecosystem.
Now uses the new @register_tool decorator system for automatic registration.

Provides programmatic access to all Git automation components.
"""

import json
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

from protocol.tool_registry import register_tool


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
        """Run a git automation command."""
        if args is None:
            args = []

        cmd = ["python", "-m", "git_automation", command] + args
        return await self._run_command(cmd, self.package_path)


# Initialize git automation tools
git_tools = GitAutomationTools()


@register_tool(
    name="git_status",
    category="git",
    description="Get current Git repository status",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def git_status(**kwargs) -> dict[str, Any]:
    """Get current Git repository status."""
    try:
        result = await git_tools._run_command(["git", "status", "--porcelain"])

        if result["success"]:
            return {
                "content": [
                    {"type": "text", "text": f"📊 Git Status:\n\n{result['stdout']}"}
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting git status: {result['stderr']}",
                    }
                ]
            }
    except Exception as e:
        return {"content": [{"type": "text", "text": f"❌ Error: {e!s}"}]}


@register_tool(
    name="git_branch_info",
    category="git",
    description="Get current branch information",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def git_branch_info(**kwargs) -> dict[str, Any]:
    """Get current branch information."""
    try:
        # Get current branch
        branch_result = await git_tools._run_command(
            ["git", "branch", "--show-current"]
        )

        # Get branch list
        branches_result = await git_tools._run_command(["git", "branch", "-a"])

        if branch_result["success"] and branches_result["success"]:
            current_branch = branch_result["stdout"].strip()
            all_branches = branches_result["stdout"]

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"🌿 Current Branch: {current_branch}\n\nAll Branches:\n{all_branches}",
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting branch info: {branch_result.get('stderr', '')} {branches_result.get('stderr', '')}",
                    }
                ]
            }
    except Exception as e:
        return {"content": [{"type": "text", "text": f"❌ Error: {e!s}"}]}


@register_tool(
    name="git_commit_history",
    category="git",
    description="Get recent commit history",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def git_commit_history(**kwargs) -> dict[str, Any]:
    """Get recent commit history."""
    arguments = kwargs.get("arguments", {})
    limit = arguments.get("limit", 10)

    try:
        result = await git_tools._run_command(["git", "log", "--oneline", f"-{limit}"])

        if result["success"]:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"📝 Recent Commits ({limit}):\n\n{result['stdout']}",
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting commit history: {result['stderr']}",
                    }
                ]
            }
    except Exception as e:
        return {"content": [{"type": "text", "text": f"❌ Error: {e!s}"}]}


@register_tool(
    name="git_diff",
    category="git",
    description="Get diff of current changes",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def git_diff(**kwargs) -> dict[str, Any]:
    """Get diff of current changes."""
    arguments = kwargs.get("arguments", {})
    staged = arguments.get("staged", False)

    try:
        cmd = ["git", "diff"]
        if staged:
            cmd.append("--cached")

        result = await git_tools._run_command(cmd)

        if result["success"]:
            diff_type = "staged" if staged else "unstaged"
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"📋 Git Diff ({diff_type}):\n\n{result['stdout']}",
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting diff: {result['stderr']}",
                    }
                ]
            }
    except Exception as e:
        return {"content": [{"type": "text", "text": f"❌ Error: {e!s}"}]}


@register_tool(
    name="git_add",
    category="git",
    description="Add files to Git staging area",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def git_add(**kwargs) -> dict[str, Any]:
    """Add files to Git staging area."""
    arguments = kwargs.get("arguments", {})
    files = arguments.get("files", ["."])

    try:
        cmd = ["git", "add"] + (files if isinstance(files, list) else [files])
        result = await git_tools._run_command(cmd)

        if result["success"]:
            return {
                "content": [
                    {"type": "text", "text": f"✅ Files added to staging area: {files}"}
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error adding files: {result['stderr']}",
                    }
                ]
            }
    except Exception as e:
        return {"content": [{"type": "text", "text": f"❌ Error: {e!s}"}]}


@register_tool(
    name="git_commit",
    category="git",
    description="Create a new commit",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def git_commit(**kwargs) -> dict[str, Any]:
    """Create a new commit."""
    arguments = kwargs.get("arguments", {})
    message = arguments.get("message", "")
    amend = arguments.get("amend", False)

    if not message:
        return {"content": [{"type": "text", "text": "❌ Commit message is required"}]}

    try:
        cmd = ["git", "commit", "-m", message]
        if amend:
            cmd.append("--amend")

        result = await git_tools._run_command(cmd)

        if result["success"]:
            return {
                "content": [{"type": "text", "text": f"✅ Commit created: {message}"}]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error creating commit: {result['stderr']}",
                    }
                ]
            }
    except Exception as e:
        return {"content": [{"type": "text", "text": f"❌ Error: {e!s}"}]}


@register_tool(
    name="git_push",
    category="git",
    description="Push commits to remote repository",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def git_push(**kwargs) -> dict[str, Any]:
    """Push commits to remote repository."""
    arguments = kwargs.get("arguments", {})
    remote = arguments.get("remote", "origin")
    branch = arguments.get("branch")
    force = arguments.get("force", False)

    try:
        cmd = ["git", "push"]
        if force:
            cmd.append("--force")
        if remote:
            cmd.append(remote)
        if branch:
            cmd.append(branch)

        result = await git_tools._run_command(cmd)

        if result["success"]:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Successfully pushed to {remote}/{branch or 'current branch'}",
                    }
                ]
            }
        else:
            return {
                "content": [
                    {"type": "text", "text": f"❌ Error pushing: {result['stderr']}"}
                ]
            }
    except Exception as e:
        return {"content": [{"type": "text", "text": f"❌ Error: {e!s}"}]}


@register_tool(
    name="git_pull",
    category="git",
    description="Pull latest changes from remote repository",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def git_pull(**kwargs) -> dict[str, Any]:
    """Pull latest changes from remote repository."""
    arguments = kwargs.get("arguments", {})
    remote = arguments.get("remote", "origin")
    branch = arguments.get("branch")

    try:
        cmd = ["git", "pull"]
        if remote:
            cmd.append(remote)
        if branch:
            cmd.append(branch)

        result = await git_tools._run_command(cmd)

        if result["success"]:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Successfully pulled from {remote}/{branch or 'current branch'}\n\n{result['stdout']}",
                    }
                ]
            }
        else:
            return {
                "content": [
                    {"type": "text", "text": f"❌ Error pulling: {result['stderr']}"}
                ]
            }
    except Exception as e:
        return {"content": [{"type": "text", "text": f"❌ Error: {e!s}"}]}
