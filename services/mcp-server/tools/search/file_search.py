#!/usr/bin/env python3
"""
File Search Engine
=================

Unified file search implementation with pattern matching and code analysis.
Provides comprehensive file discovery and content search capabilities.
"""

import asyncio
import fnmatch
import logging
import re
from pathlib import Path
from typing import Any, List

from .ignore_config import should_ignore_path

logger = logging.getLogger(__name__)


class FileSearchEngine:
    """
    Unified file search engine with pattern matching and code analysis.

    Combines file discovery, pattern matching, and content search capabilities
    into a single, efficient interface.
    """

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent.parent
        else:
            self.project_root = project_root

    async def search_files(
        self,
        pattern: str = "*",
        directory: str | None = None,
        recursive: bool = True,
        include_hidden: bool = False,
    ) -> List[str]:
        """
        Search for files by name pattern.

        Args:
            pattern: File name pattern to search for (supports glob patterns)
            directory: Directory to search in (defaults to project root)
            recursive: Search recursively in subdirectories
            include_hidden: Include hidden files and directories

        Returns:
            List of matching file paths
        """
        search_path = self.project_root
        if directory:
            if not Path(directory).is_absolute():
                search_path = self.project_root / directory
            else:
                search_path = Path(directory)

        if not search_path.exists():
            raise ValueError(f"Directory not found: {directory}")

        files = []
        if recursive:
            for file_path in search_path.rglob(pattern):
                if file_path.is_file():
                    # Skip ignored paths using centralized ignore system
                    if should_ignore_path(file_path):
                        continue
                    if not include_hidden and file_path.name.startswith("."):
                        continue
                    files.append(str(file_path.relative_to(self.project_root)))
        else:
            for file_path in search_path.glob(pattern):
                if file_path.is_file():
                    # Skip ignored paths using centralized ignore system
                    if should_ignore_path(file_path):
                        continue
                    if not include_hidden and file_path.name.startswith("."):
                        continue
                    files.append(str(file_path.relative_to(self.project_root)))

        return sorted(files)

    async def list_files(
        self,
        directory: str | None = None,
        pattern: str | None = None,
        include_hidden: bool = False,
    ) -> List[str]:
        """
        List files in a directory with optional filtering.

        Args:
            directory: Directory to list (defaults to project root)
            pattern: Optional file pattern filter
            include_hidden: Include hidden files and directories

        Returns:
            List of file paths
        """
        search_path = self.project_root
        if directory:
            if not Path(directory).is_absolute():
                search_path = self.project_root / directory
            else:
                search_path = Path(directory)

        if not search_path.exists():
            raise ValueError(f"Directory not found: {directory}")

        files = []
        for item in search_path.iterdir():
            # Skip ignored paths using centralized ignore system
            if should_ignore_path(item):
                continue

            if not include_hidden and item.name.startswith("."):
                continue

            if pattern and not fnmatch.fnmatch(item.name, pattern):
                continue

            if item.is_file():
                files.append(str(item.relative_to(self.project_root)))

        return sorted(files)

    async def search_content(
        self,
        query: str,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
        case_sensitive: bool = False,
        whole_word: bool = False,
        max_count: int | None = None,
        context_lines: int = 0,
    ) -> dict[str, Any]:
        """
        Search for content within files using grep.

        Args:
            query: Search query or pattern
            file_types: File extensions to search in (e.g., ['py', 'ts', 'js'])
            directories: Directories to search in
            case_sensitive: Case-sensitive search
            whole_word: Match whole words only
            max_count: Maximum number of matches
            context_lines: Number of context lines around matches

        Returns:
            List of search results with file paths and content
        """
        # Build grep command
        cmd = ["grep", "-r"]

        if not case_sensitive:
            cmd.append("-i")

        if whole_word:
            cmd.append("-w")

        if max_count:
            cmd.extend(["-m", str(max_count)])

        if context_lines > 0:
            cmd.extend(["-C", str(context_lines)])

        # Add file type filters
        if file_types:
            for ext in file_types:
                cmd.extend(["--include", f"*.{ext}"])
        else:
            # Default file types
            cmd.extend(
                [
                    "--include",
                    "*.py",
                    "--include",
                    "*.ts",
                    "--include",
                    "*.js",
                    "--include",
                    "*.tsx",
                    "--include",
                    "*.jsx",
                    "--include",
                    "*.md",
                    "--include",
                    "*.txt",
                ]
            )

        # Add directory filters
        search_paths = [str(self.project_root)]
        if directories:
            search_paths = []
            for directory in directories:
                if not Path(directory).is_absolute():
                    search_paths.append(str(self.project_root / directory))
                else:
                    search_paths.append(directory)

        cmd.extend([query] + search_paths)

        try:
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
                for line in stdout.split("\n"):
                    if line.strip():
                        matches.append(self._parse_grep_line(line))

            return {
                "success": result.returncode == 0 or matches,
                "matches": matches,
                "error": stderr if stderr else None,
            }

        except Exception as e:
            logger.exception("Error in content search")
            return {
                "success": False,
                "matches": [],
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
        Search for specific code patterns (functions, classes, imports, etc.).

        Args:
            pattern_type: Type of code pattern to search for
            language: Programming language to search in
            name: Optional specific name to search for
            file_types: File extensions to search in
            directories: Directories to search in

        Returns:
            List of matching code patterns
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
            raise ValueError(
                f"Unsupported pattern type: {pattern_type} for language: {language}"
            )

        pattern = patterns[pattern_type][language]
        if name:
            pattern = pattern.replace(r"(\w+)", re.escape(name))

        # Build grep command
        cmd = ["grep", "-r", "-n", "-E", pattern]

        # Add file type filters
        if file_types:
            for ext in file_types:
                cmd.extend(["--include", f"*.{ext}"])
        else:
            cmd.extend(["--include", f"*.{language}"])

        # Add directory filters
        search_paths = [str(self.project_root)]
        if directories:
            search_paths = []
            for directory in directories:
                if not Path(directory).is_absolute():
                    search_paths.append(str(self.project_root / directory))
                else:
                    search_paths.append(directory)

        cmd.extend(search_paths)

        try:
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
                for line in stdout.split("\n"):
                    if line.strip():
                        matches.append(self._parse_grep_line(line))

            return {
                "success": result.returncode == 0 or matches,
                "matches": matches,
                "error": stderr if stderr else None,
            }

        except Exception as e:
            logger.exception("Error searching code patterns")
            return {
                "success": False,
                "matches": [],
                "error": str(e),
            }

    def _parse_grep_line(self, line: str) -> dict[str, Any]:
        """Parse a grep output line into structured data."""
        # Format: file_path:line_number:content
        parts = line.split(":", 2)
        if len(parts) >= 3:
            return {
                "file_path": parts[0],
                "line_number": int(parts[1]) if parts[1].isdigit() else None,
                "content": parts[2].strip(),
                "full_line": line,
            }
        else:
            return {
                "file_path": parts[0] if parts else "unknown",
                "line_number": None,
                "content": line,
                "full_line": line,
            }

    def get_file_info(self, file_path: str) -> dict[str, Any]:
        """Get information about a specific file."""
        full_path = self.project_root / file_path
        if not full_path.exists():
            raise ValueError(f"File not found: {file_path}")

        stat = full_path.stat()
        return {
            "file_path": file_path,
            "size": stat.st_size,
            "modified": stat.st_mtime,
            "extension": full_path.suffix,
            "name": full_path.name,
            "parent": str(full_path.parent.relative_to(self.project_root)),
        }
