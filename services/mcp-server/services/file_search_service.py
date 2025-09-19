#!/usr/bin/env python3
"""
File Search Service
===================

Core service for file searching and semantic search operations using ripgrep
and other search utilities. Follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import logging
import subprocess
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class FileSearchService:
    """Handles all file search and semantic search operations."""

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            # Go up from services/mcp-server to the project root
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent
        else:
            self.project_root = project_root

    async def run_command(
        self, command: list[str], cwd: Path | None = None
    ) -> dict[str, Any]:
        """Execute a command and return structured results."""
        working_dir = cwd or self.project_root

        try:
            logger.info("Running command: %s", " ".join(command))
            result = await asyncio.create_subprocess_exec(
                *command,
                cwd=working_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            stdout_bytes, stderr_bytes = await result.communicate()
            stdout = stdout_bytes.decode("utf-8")
            stderr = stderr_bytes.decode("utf-8")

            return {
                "success": result.returncode == 0,
                "returncode": result.returncode,
                "stdout": stdout.strip(),
                "stderr": stderr.strip(),
                "command": " ".join(command),
            }

        except Exception as e:
            logger.exception("Command execution failed")
            return {
                "success": False,
                "returncode": -1,
                "stdout": "",
                "stderr": str(e),
                "command": " ".join(command),
            }

    async def search_files_with_ripgrep(
        self,
        pattern: str,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
        case_sensitive: bool = True,
        whole_word: bool = False,
        max_count: int | None = None,
        include_line_numbers: bool = True,
    ) -> dict[str, Any]:
        """Search files using ripgrep with comprehensive options."""
        command = ["rg"]

        # Add pattern
        if whole_word:
            command.extend(["-w", pattern])
        else:
            command.append(pattern)

        # Add file type filters
        if file_types:
            for file_type in file_types:
                command.extend(["-t", file_type])

        # Add directory filters
        if directories:
            command.extend(directories)
        else:
            command.append(".")

        # Add case sensitivity
        if not case_sensitive:
            command.append("-i")

        # Add line numbers
        if include_line_numbers:
            command.append("-n")

        # Add max count
        if max_count:
            command.extend(["-m", str(max_count)])

        # Add other useful options
        command.extend(["--color", "never", "--no-heading"])

        return await self.run_command(command)

    async def list_files_by_pattern(
        self,
        pattern: str | None = None,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
        max_depth: int | None = None,
    ) -> dict[str, Any]:
        """List files matching pattern using find command."""
        command = ["find", "."]

        # Add max depth
        if max_depth:
            command.extend(["-maxdepth", str(max_depth)])

        # Add file type filters
        if file_types:
            if len(file_types) == 1:
                command.extend(["-name", f"*.{file_types[0]}"])
            else:
                # Multiple file types - use OR conditions
                command.append("\\(")
                command.extend(["-name", f"*.{file_types[0]}"])
                for file_type in file_types[1:]:
                    command.extend(["-o", "-name", f"*.{file_type}"])
                command.append("\\)")

        # Add name pattern
        if pattern:
            command.extend(["-name", f"*{pattern}*"])

        # Add directory filters
        if directories:
            command.extend(directories)

        return await self.run_command(command)

    async def semantic_search(
        self,
        query: str,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
        context_lines: int = 2,
    ) -> dict[str, Any]:
        """Perform semantic search using multiple strategies."""
        results = {}

        # Strategy 1: Direct pattern search
        results["direct_search"] = await self.search_files_with_ripgrep(
            query,
            file_types=file_types,
            directories=directories,
            case_sensitive=False,
        )

        # Strategy 2: Word boundary search
        results["word_search"] = await self.search_files_with_ripgrep(
            query,
            file_types=file_types,
            directories=directories,
            case_sensitive=False,
            whole_word=True,
        )

        # Strategy 3: Context search with surrounding lines
        if context_lines > 0:
            command = ["rg", "-C", str(context_lines), "-i", query]
            if file_types:
                for file_type in file_types:
                    command.extend(["-t", file_type])
            if directories:
                command.extend(directories)
            else:
                command.append(".")
            command.extend(["--color", "never"])
            results["context_search"] = await self.run_command(command)

        return {
            "success": any(result.get("success", False) for result in results.values()),
            "results": results,
            "summary": self._generate_search_summary(results),
        }

    def _generate_search_summary(self, results: dict[str, Any]) -> str:
        """Generate a summary of search results."""
        total_searches = len(results)
        successful_searches = sum(
            1 for result in results.values() if result.get("success", False)
        )
        failed_searches = total_searches - successful_searches

        return f"Search Summary: {successful_searches}/{total_searches} searches successful, {failed_searches} failed"
