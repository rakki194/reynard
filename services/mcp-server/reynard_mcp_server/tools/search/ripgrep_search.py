#!/usr/bin/env python3
"""
Ripgrep Search Engine
====================

Unified ripgrep search implementation with advanced pattern matching.
Provides high-performance text search with syntactic and semantic capabilities.
"""

import asyncio
import logging
from pathlib import Path
from typing import Any

from .ignore_config import should_ignore_path, filter_paths

logger = logging.getLogger(__name__)


class RipgrepSearchEngine:
    """
    Unified ripgrep search engine with advanced pattern matching.

    Provides high-performance text search with comprehensive options
    and intelligent result processing.
    """

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent.parent
        else:
            self.project_root = project_root

    async def search(
        self,
        pattern: str,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
        case_sensitive: bool = False,
        whole_word: bool = False,
        max_count: int | None = None,
        context_lines: int = 0,
        smart_case: bool = True,
        multiline: bool = False,
    ) -> dict[str, Any]:
        """
        Perform advanced ripgrep search with comprehensive options.

        Args:
            pattern: Search pattern (supports regex)
            file_types: File extensions to search in
            directories: Directories to search in
            case_sensitive: Case-sensitive search
            whole_word: Match whole words only
            max_count: Maximum number of matches
            context_lines: Number of context lines around matches
            smart_case: Smart case matching (case-sensitive if pattern has uppercase)
            multiline: Enable multiline matching

        Returns:
            Search results with file paths, line numbers, and content
        """
        try:
            # Build ripgrep command
            cmd = ["rg"]

            # Add search options
            if case_sensitive:
                cmd.append("--case-sensitive")
            elif smart_case and not any(c.isupper() for c in pattern):
                cmd.append("--smart-case")

            if whole_word:
                cmd.append("--word-regexp")

            if max_count:
                cmd.extend(["--max-count", str(max_count)])

            if context_lines > 0:
                cmd.extend(["--context", str(context_lines)])

            if multiline:
                cmd.append("--multiline")

            # Add file type filters
            if file_types:
                for ext in file_types:
                    cmd.extend(["--type-add", f"custom:{ext}:*.{ext}"])
                    cmd.extend(["--type", f"custom:{ext}"])
            else:
                # Default file types
                cmd.extend([
                    "--type", "py",
                    "--type", "ts",
                    "--type", "js",
                    "--type", "tsx",
                    "--type", "jsx",
                    "--type", "md",
                    "--type", "txt",
                ])

            # Add directory filters
            search_paths = [str(self.project_root)]
            if directories:
                search_paths = []
                for directory in directories:
                    if not Path(directory).is_absolute():
                        search_paths.append(str(self.project_root / directory))
                    else:
                        search_paths.append(directory)

            # Add pattern and search paths
            cmd.extend([pattern] + search_paths)

            # Run ripgrep command
            result = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout_bytes, stderr_bytes = await result.communicate()
            stdout = stdout_bytes.decode("utf-8")
            stderr = stderr_bytes.decode("utf-8")

            # Parse results
            matches = []
            if stdout:
                for line in stdout.split("\n"):
                    if line.strip():
                        matches.append(self._parse_ripgrep_line(line))

            return {
                "success": result.returncode == 0 or matches,
                "results": matches,
                "stdout": stdout,
                "stderr": stderr,
                "search_strategies": ["ripgrep"],
            }

        except Exception as e:
            logger.exception("Error in ripgrep search")
            return {
                "success": False,
                "results": [],
                "error": str(e),
            }

    async def search_code_patterns(
        self,
        pattern_type: str,
        language: str = "py",
        name: str | None = None,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Search for specific code patterns using ripgrep.

        Args:
            pattern_type: Type of code pattern to search for
            language: Programming language to search in
            name: Optional specific name to search for
            file_types: File extensions to search in
            directories: Directories to search in

        Returns:
            Search results with code pattern matches
        """
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
            "export": {
                "py": r"^def\s+(\w+)",  # Python doesn't have explicit exports
                "ts": r"export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)",
                "js": r"module\.exports\s*=\s*(\w+)",
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
                "results": [],
            }

        pattern = patterns[pattern_type][language]
        if name:
            pattern = pattern.replace(r"(\w+)", name)

        return await self.search(
            pattern=pattern,
            file_types=file_types or [language],
            directories=directories,
            case_sensitive=False,
        )

    async def search_with_context(
        self,
        query: str,
        context_lines: int = 3,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Search with surrounding context lines for better understanding.

        Args:
            query: Search query
            context_lines: Number of context lines around matches
            file_types: File extensions to search in
            directories: Directories to search in

        Returns:
            Search results with context lines
        """
        return await self.search(
            pattern=query,
            context_lines=context_lines,
            file_types=file_types,
            directories=directories,
        )

    async def search_todos(
        self,
        todo_type: str = "todo",
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Search for TODO and FIXME comments.

        Args:
            todo_type: Type of comment to search for ("todo" or "fixme")
            file_types: File extensions to search in
            directories: Directories to search in

        Returns:
            Search results with TODO/FIXME comments
        """
        return await self.search_code_patterns(
            pattern_type=todo_type,
            language="py",  # Will be overridden by file_types
            file_types=file_types,
            directories=directories,
        )

    async def search_imports(
        self,
        import_name: str | None = None,
        language: str = "py",
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Search for import statements.

        Args:
            import_name: Optional specific import name to search for
            language: Programming language to search in
            file_types: File extensions to search in
            directories: Directories to search in

        Returns:
            Search results with import statements
        """
        return await self.search_code_patterns(
            pattern_type="import",
            language=language,
            name=import_name,
            file_types=file_types,
            directories=directories,
        )

    async def search_functions(
        self,
        function_name: str | None = None,
        language: str = "py",
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Search for function definitions.

        Args:
            function_name: Optional specific function name to search for
            language: Programming language to search in
            file_types: File extensions to search in
            directories: Directories to search in

        Returns:
            Search results with function definitions
        """
        return await self.search_code_patterns(
            pattern_type="function",
            language=language,
            name=function_name,
            file_types=file_types,
            directories=directories,
        )

    async def search_classes(
        self,
        class_name: str | None = None,
        language: str = "py",
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Search for class definitions.

        Args:
            class_name: Optional specific class name to search for
            language: Programming language to search in
            directories: Directories to search in

        Returns:
            Search results with class definitions
        """
        return await self.search_code_patterns(
            pattern_type="class",
            language=language,
            name=class_name,
            file_types=file_types,
            directories=directories,
        )

    def _parse_ripgrep_line(self, line: str) -> dict[str, Any]:
        """Parse a ripgrep output line into structured data."""
        # Format: file_path:line_number:content
        parts = line.split(":", 2)
        if len(parts) >= 3:
            return {
                "file_path": parts[0],
                "line_number": int(parts[1]) if parts[1].isdigit() else None,
                "content": parts[2].strip(),
                "full_line": line,
                "priority": 1.0,  # Default priority for ripgrep results
            }
        else:
            return {
                "file_path": parts[0] if parts else "unknown",
                "line_number": None,
                "content": line,
                "full_line": line,
                "priority": 1.0,
            }
