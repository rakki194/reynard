#!/usr/bin/env python3
"""
Git Tool - Single comprehensive git operations tool

Consolidates all git operations into one tool with pagination support for diffs.
"""

import subprocess
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from protocol.tool_registry import register_tool


class GitTool:
    """Single git tool with pagination support for large diffs."""

    def __init__(self, working_dir: str = "."):
        self.working_dir = Path(working_dir).resolve()

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

    def _paginate_diff(self, diff_content: str, page: int = 1, page_size: int = 1000) -> Dict[str, Any]:
        """Paginate diff content to prevent context overflow."""
        lines = diff_content.split('\n')
        total_lines = len(lines)
        total_pages = (total_lines + page_size - 1) // page_size
        
        start_idx = (page - 1) * page_size
        end_idx = min(start_idx + page_size, total_lines)
        
        paginated_lines = lines[start_idx:end_idx]
        
        return {
            "content": '\n'.join(paginated_lines),
            "page": page,
            "page_size": page_size,
            "total_lines": total_lines,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1
        }

    def _format_git_output(self, operation: str, result: Dict[str, Any]) -> str:
        """Format git command output with status indicators."""
        if result["success"]:
            return f"✅ {operation}:\n{result['stdout']}"
        else:
            return f"❌ {operation} failed:\n{result['stderr']}"


# Initialize git tool
git_tool = GitTool()

@register_tool(
    name="git_tool",
    category="git",
    description="Comprehensive git operations tool with pagination support",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={
        "input_schema": {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "description": "Git operation to perform",
                    "enum": [
                        "status", "branch", "log", "diff", "add", "commit", 
                        "push", "pull", "checkout", "merge", "rebase", "reset",
                        "stash", "tag", "remote", "fetch", "clone"
                    ]
                },
                "args": {
                    "type": "object",
                    "description": "Operation-specific arguments",
                    "properties": {
                        "files": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Files to operate on (for add, commit, etc.)"
                        },
                        "message": {
                            "type": "string",
                            "description": "Commit message"
                        },
                        "branch": {
                            "type": "string",
                            "description": "Branch name"
                        },
                        "remote": {
                            "type": "string",
                            "description": "Remote name (default: origin)"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Limit for log entries (default: 10)"
                        },
                        "staged": {
                            "type": "boolean",
                            "description": "Show staged changes for diff (default: false)"
                        },
                        "page": {
                            "type": "integer",
                            "description": "Page number for paginated diff (default: 1)"
                        },
                        "page_size": {
                            "type": "integer",
                            "description": "Lines per page for diff (default: 1000)"
                        },
                        "force": {
                            "type": "boolean",
                            "description": "Force operation (for push, reset, etc.)"
                        },
                        "amend": {
                            "type": "boolean",
                            "description": "Amend last commit"
                        }
                    }
                }
            },
            "required": ["operation"]
        }
    },
)
async def git_tool_handler(**kwargs) -> dict[str, Any]:
    """Handle all git operations through a single tool."""
    arguments = kwargs.get("arguments", {})
    operation = arguments.get("operation")
    args = arguments.get("args", {})
    
    if not operation:
        return {
            "content": [{"type": "text", "text": "❌ Operation is required"}]
        }

    try:
        if operation == "status":
            result = await git_tool._run_command(["git", "status", "--porcelain"])
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Status", result)}]
            }

        elif operation == "branch":
            # Get current branch
            current_result = await git_tool._run_command(["git", "branch", "--show-current"])
            # Get all branches
            all_result = await git_tool._run_command(["git", "branch", "-a"])
            
            if current_result["success"] and all_result["success"]:
                current_branch = current_result["stdout"].strip()
                all_branches = all_result["stdout"]
                content = f"🌿 Current Branch: {current_branch}\n\nAll Branches:\n{all_branches}"
                return {"content": [{"type": "text", "text": content}]}
            else:
                return {"content": [{"type": "text", "text": "❌ Error getting branch info"}]}

        elif operation == "log":
            limit = args.get("limit", 10)
            result = await git_tool._run_command(["git", "log", "--oneline", f"-{limit}"])
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output(f"Recent Commits ({limit})", result)}]
            }

        elif operation == "diff":
            staged = args.get("staged", False)
            page = args.get("page", 1)
            page_size = args.get("page_size", 1000)
            
            cmd = ["git", "diff"]
            if staged:
                cmd.append("--cached")
            
            result = await git_tool._run_command(cmd)
            
            if result["success"]:
                diff_type = "staged" if staged else "unstaged"
                paginated = git_tool._paginate_diff(result["stdout"], page, page_size)
                
                content = f"📋 Git Diff ({diff_type}) - Page {page}/{paginated['total_pages']}:\n\n"
                content += paginated["content"]
                
                if paginated["has_next"] or paginated["has_previous"]:
                    content += f"\n\n--- Pagination Info ---\n"
                    content += f"Total lines: {paginated['total_lines']}\n"
                    content += f"Page size: {paginated['page_size']}\n"
                    if paginated["has_next"]:
                        content += f"Next page: {page + 1}\n"
                    if paginated["has_previous"]:
                        content += f"Previous page: {page - 1}\n"
                
                return {"content": [{"type": "text", "text": content}]}
            else:
                return {"content": [{"type": "text", "text": git_tool._format_git_output("Git Diff", result)}]}

        elif operation == "add":
            files = args.get("files", ["."])
            cmd = ["git", "add"] + (files if isinstance(files, list) else [files])
            result = await git_tool._run_command(cmd)
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Add", result)}]
            }

        elif operation == "commit":
            message = args.get("message", "")
            amend = args.get("amend", False)
            
            if not message:
                return {"content": [{"type": "text", "text": "❌ Commit message is required"}]}
            
            cmd = ["git", "commit", "-m", message]
            if amend:
                cmd.append("--amend")
            
            result = await git_tool._run_command(cmd)
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Commit", result)}]
            }

        elif operation == "push":
            remote = args.get("remote", "origin")
            branch = args.get("branch")
            force = args.get("force", False)
            
            cmd = ["git", "push"]
            if force:
                cmd.append("--force")
            if remote:
                cmd.append(remote)
            if branch:
                cmd.append(branch)
            
            result = await git_tool._run_command(cmd)
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Push", result)}]
            }

        elif operation == "pull":
            remote = args.get("remote", "origin")
            branch = args.get("branch")
            
            cmd = ["git", "pull"]
            if remote:
                cmd.append(remote)
            if branch:
                cmd.append(branch)
            
            result = await git_tool._run_command(cmd)
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Pull", result)}]
            }

        elif operation == "checkout":
            branch = args.get("branch")
            if not branch:
                return {"content": [{"type": "text", "text": "❌ Branch name is required for checkout"}]}
            
            result = await git_tool._run_command(["git", "checkout", branch])
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Checkout", result)}]
            }

        elif operation == "merge":
            branch = args.get("branch")
            if not branch:
                return {"content": [{"type": "text", "text": "❌ Branch name is required for merge"}]}
            
            result = await git_tool._run_command(["git", "merge", branch])
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Merge", result)}]
            }

        elif operation == "rebase":
            branch = args.get("branch")
            if not branch:
                return {"content": [{"type": "text", "text": "❌ Branch name is required for rebase"}]}
            
            result = await git_tool._run_command(["git", "rebase", branch])
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Rebase", result)}]
            }

        elif operation == "reset":
            reset_type = args.get("type", "mixed")  # mixed, soft, hard
            commit = args.get("commit", "HEAD")
            
            cmd = ["git", "reset", f"--{reset_type}", commit]
            result = await git_tool._run_command(cmd)
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Reset", result)}]
            }

        elif operation == "stash":
            action = args.get("action", "list")  # list, save, pop, apply, drop
            message = args.get("message", "")
            
            if action == "list":
                result = await git_tool._run_command(["git", "stash", "list"])
            elif action == "save":
                cmd = ["git", "stash", "save"]
                if message:
                    cmd.append(message)
                result = await git_tool._run_command(cmd)
            elif action in ["pop", "apply", "drop"]:
                stash_ref = args.get("stash", "stash@{0}")
                result = await git_tool._run_command(["git", "stash", action, stash_ref])
            else:
                return {"content": [{"type": "text", "text": f"❌ Unknown stash action: {action}"}]}
            
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output(f"Git Stash {action.title()}", result)}]
            }

        elif operation == "tag":
            action = args.get("action", "list")  # list, create, delete
            tag_name = args.get("name", "")
            message = args.get("message", "")
            
            if action == "list":
                result = await git_tool._run_command(["git", "tag", "-l"])
            elif action == "create":
                if not tag_name:
                    return {"content": [{"type": "text", "text": "❌ Tag name is required for create"}]}
                cmd = ["git", "tag", tag_name]
                if message:
                    cmd.extend(["-m", message])
                result = await git_tool._run_command(cmd)
            elif action == "delete":
                if not tag_name:
                    return {"content": [{"type": "text", "text": "❌ Tag name is required for delete"}]}
                result = await git_tool._run_command(["git", "tag", "-d", tag_name])
            else:
                return {"content": [{"type": "text", "text": f"❌ Unknown tag action: {action}"}]}
            
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output(f"Git Tag {action.title()}", result)}]
            }

        elif operation == "remote":
            action = args.get("action", "list")  # list, add, remove, show
            remote_name = args.get("name", "")
            remote_url = args.get("url", "")
            
            if action == "list":
                result = await git_tool._run_command(["git", "remote", "-v"])
            elif action == "add":
                if not remote_name or not remote_url:
                    return {"content": [{"type": "text", "text": "❌ Remote name and URL are required for add"}]}
                result = await git_tool._run_command(["git", "remote", "add", remote_name, remote_url])
            elif action == "remove":
                if not remote_name:
                    return {"content": [{"type": "text", "text": "❌ Remote name is required for remove"}]}
                result = await git_tool._run_command(["git", "remote", "remove", remote_name])
            elif action == "show":
                if not remote_name:
                    return {"content": [{"type": "text", "text": "❌ Remote name is required for show"}]}
                result = await git_tool._run_command(["git", "remote", "show", remote_name])
            else:
                return {"content": [{"type": "text", "text": f"❌ Unknown remote action: {action}"}]}
            
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output(f"Git Remote {action.title()}", result)}]
            }

        elif operation == "fetch":
            remote = args.get("remote", "origin")
            result = await git_tool._run_command(["git", "fetch", remote])
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Fetch", result)}]
            }

        elif operation == "clone":
            url = args.get("url", "")
            directory = args.get("directory", "")
            
            if not url:
                return {"content": [{"type": "text", "text": "❌ Repository URL is required for clone"}]}
            
            cmd = ["git", "clone", url]
            if directory:
                cmd.append(directory)
            
            result = await git_tool._run_command(cmd)
            return {
                "content": [{"type": "text", "text": git_tool._format_git_output("Git Clone", result)}]
            }

        else:
            return {
                "content": [{"type": "text", "text": f"❌ Unknown operation: {operation}"}]
            }

    except Exception as e:
        return {"content": [{"type": "text", "text": f"❌ Error: {e!s}"}]}
