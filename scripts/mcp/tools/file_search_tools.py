#!/usr/bin/env python3
"""
File Search Tool Handlers
=========================

Handles file search and code pattern matching MCP tool calls.
Follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import fnmatch
import logging
import re
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class FileSearchTools:
    """Handles file search and code pattern operations."""

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            # Go up from scripts/mcp/tools to the project root
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent
        else:
            self.project_root = project_root

    def _format_result(self, result: dict[str, Any], operation: str) -> dict[str, Any]:
        """Format tool result for MCP response."""
        if result.get("success", False):
            status = "✅ SUCCESS"
        else:
            status = "❌ FAILED"

        # Format output text
        output_lines = [f"{status} - {operation}"]

        if "files" in result:
            files = result["files"]
            output_lines.append(f"\n📁 Found {len(files)} files:")
            for file_path in files[:10]:  # Show first 10 files
                output_lines.append(f"  • {file_path}")
            if len(files) > 10:
                output_lines.append(f"  ... and {len(files) - 10} more")

        if "matches" in result:
            matches = result["matches"]
            output_lines.append(f"\n🔍 Found {len(matches)} matches:")
            for match in matches[:5]:  # Show first 5 matches
                output_lines.append(f"  • {match}")
            if len(matches) > 5:
                output_lines.append(f"  ... and {len(matches) - 5} more")

        if result.get("error"):
            output_lines.append(f"\n⚠️ Error: {result['error']}")

        return {"content": [{"type": "text", "text": "\n".join(output_lines)}]}

    async def search_files(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Search for files by name pattern."""
        pattern = arguments.get("pattern", "*")
        directory = arguments.get("directory", str(self.project_root))
        recursive = arguments.get("recursive", True)

        try:
            search_path = Path(directory)
            if not search_path.exists():
                return {"success": False, "error": f"Directory not found: {directory}"}

            files = []
            if recursive:
                for file_path in search_path.rglob(pattern):
                    if file_path.is_file():
                        files.append(str(file_path.relative_to(self.project_root)))
            else:
                for file_path in search_path.glob(pattern):
                    if file_path.is_file():
                        files.append(str(file_path.relative_to(self.project_root)))

            return self._format_result(
                {"success": True, "files": sorted(files)}, "File Search"
            )

        except Exception as e:
            logger.exception("Error searching files")
            return self._format_result(
                {"success": False, "error": str(e)}, "File Search"
            )

    async def list_files(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """List files in a directory."""
        directory = arguments.get("directory", str(self.project_root))
        pattern = arguments.get("pattern")
        include_hidden = arguments.get("include_hidden", False)

        try:
            # Handle relative paths by making them relative to project root
            if not Path(directory).is_absolute():
                search_path = self.project_root / directory
            else:
                search_path = Path(directory)

            if not search_path.exists():
                return {"success": False, "error": f"Directory not found: {directory}"}

            files = []
            for item in search_path.iterdir():
                if not include_hidden and item.name.startswith("."):
                    continue

                if pattern and not fnmatch.fnmatch(item.name, pattern):
                    continue

                if item.is_file():
                    files.append(str(item.relative_to(self.project_root)))

            return self._format_result(
                {"success": True, "files": sorted(files)}, "List Files"
            )

        except Exception as e:
            logger.exception("Error listing files")
            return self._format_result(
                {"success": False, "error": str(e)}, "List Files"
            )

    async def semantic_search(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Search for code by semantic meaning."""
        query = arguments.get("query", "")
        file_types = arguments.get("file_types", [])
        case_sensitive = arguments.get("case_sensitive", False)

        try:
            # Build grep command
            cmd = ["grep", "-r"]
            if not case_sensitive:
                cmd.append("-i")

            cmd.extend(
                [
                    "--include=*.py",
                    "--include=*.ts",
                    "--include=*.js",
                    "--include=*.tsx",
                    "--include=*.jsx",
                ]
            )

            if file_types:
                include_patterns = [f"--include=*.{ext}" for ext in file_types]
                cmd.extend(include_patterns)

            cmd.extend([query, str(self.project_root)])

            # Run grep command
            result = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout_bytes, stderr_bytes = await result.communicate()
            stdout = stdout_bytes.decode("utf-8")
            stderr = stderr_bytes.decode("utf-8")

            matches = []
            if stdout:
                matches = [line.strip() for line in stdout.split("\n") if line.strip()]

            return self._format_result(
                {
                    "success": result.returncode == 0 or matches,
                    "matches": matches,
                    "error": stderr if stderr else None,
                },
                "Semantic Search",
            )

        except Exception as e:
            logger.exception("Error in semantic search")
            return self._format_result(
                {"success": False, "error": str(e)}, "Semantic Search"
            )

    async def search_code_patterns(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Search for specific code patterns."""
        pattern_type = arguments.get("pattern_type", "function")
        language = arguments.get("language", "py")
        name = arguments.get("name")

        try:
            # Define patterns for different code elements
            patterns = {
                "function": {
                    "py": r"^def\s+(\w+)",
                    "ts": r"function\s+(\w+)",
                    "js": r"function\s+(\w+)",
                },
                "class": {
                    "py": r"^class\s+(\w+)",
                    "ts": r"class\s+(\w+)",
                    "js": r"class\s+(\w+)",
                },
                "import": {
                    "py": r"^import\s+(\w+)",
                    "ts": r"import\s+.*from\s+['\"]([^'\"]+)['\"]",
                    "js": r"import\s+.*from\s+['\"]([^'\"]+)['\"]",
                },
                "todo": {
                    "py": r"#\s*TODO:?\s*(.+)",
                    "ts": r"//\s*TODO:?\s*(.+)",
                    "js": r"//\s*TODO:?\s*(.+)",
                },
                "fixme": {
                    "py": r"#\s*FIXME:?\s*(.+)",
                    "ts": r"//\s*FIXME:?\s*(.+)",
                    "js": r"//\s*FIXME:?\s*(.+)",
                },
            }

            if pattern_type not in patterns or language not in patterns[pattern_type]:
                return {
                    "success": False,
                    "error": f"Unsupported pattern type: {pattern_type} for language: {language}",
                }

            pattern = patterns[pattern_type][language]
            if name:
                pattern = pattern.replace(r"(\w+)", re.escape(name))

            # Search using grep
            cmd = [
                "grep",
                "-r",
                "-n",
                "--include=*." + language,
                pattern,
                str(self.project_root),
            ]

            result = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout_bytes, stderr_bytes = await result.communicate()
            stdout = stdout_bytes.decode("utf-8")
            stderr = stderr_bytes.decode("utf-8")

            matches = []
            if stdout:
                matches = [line.strip() for line in stdout.split("\n") if line.strip()]

            return self._format_result(
                {
                    "success": result.returncode == 0 or matches,
                    "matches": matches,
                    "error": stderr if stderr else None,
                },
                "Code Pattern Search",
            )

        except Exception as e:
            logger.exception("Error searching code patterns")
            return self._format_result(
                {"success": False, "error": str(e)}, "Code Pattern Search"
            )
