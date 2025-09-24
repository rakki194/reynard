#!/usr/bin/env python3
"""Ignore File Utilities
====================

Utilities for parsing .gitignore and .cursorignore files to determine
which files should be excluded from indexing and search operations.
"""

import fnmatch
from pathlib import Path


class IgnoreFileParser:
    """Parser for .gitignore and .cursorignore files."""

    def __init__(self, project_root: Path):
        """Initialize the ignore file parser."""
        self.project_root = project_root
        self._gitignore_patterns: list[str] = []
        self._cursorignore_patterns: list[str] = []
        self._load_ignore_files()

    def _load_ignore_files(self):
        """Load patterns from .gitignore and .cursorignore files."""
        # Load .gitignore patterns
        gitignore_path = self.project_root / ".gitignore"
        if gitignore_path.exists():
            self._gitignore_patterns = self._parse_ignore_file(gitignore_path)

        # Load .cursorignore patterns (overrides .gitignore)
        cursorignore_path = self.project_root / ".cursorignore"
        if cursorignore_path.exists():
            self._cursorignore_patterns = self._parse_ignore_file(cursorignore_path)

    def _parse_ignore_file(self, ignore_file: Path) -> list[str]:
        """Parse an ignore file and return patterns."""
        patterns = []

        try:
            with open(ignore_file, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()

                    # Skip empty lines and comments
                    if not line or line.startswith("#"):
                        continue

                    # Handle negation patterns (starting with !)
                    if line.startswith("!"):
                        # Remove the ! and add as a negation pattern
                        pattern = line[1:]
                        patterns.append(f"!{pattern}")
                    else:
                        patterns.append(line)

        except Exception as e:
            print(f"Warning: Failed to parse {ignore_file}: {e}")

        return patterns

    def should_ignore(self, file_path: Path) -> bool:
        """Determine if a file should be ignored based on ignore patterns.

        .cursorignore patterns override .gitignore patterns.
        """
        # Convert to relative path from project root
        try:
            relative_path = file_path.relative_to(self.project_root)
        except ValueError:
            # File is outside project root
            return True

        # Check .cursorignore patterns first (higher priority)
        if self._check_patterns(relative_path, self._cursorignore_patterns):
            return True

        # Check .gitignore patterns
        if self._check_patterns(relative_path, self._gitignore_patterns):
            return True

        return False

    def _check_patterns(self, relative_path: Path, patterns: list[str]) -> bool:
        """Check if a path matches any ignore patterns."""
        path_str = str(relative_path).replace("\\", "/")
        path_parts = path_str.split("/")

        # Track negation patterns
        negations = [p[1:] for p in patterns if p.startswith("!")]
        ignore_patterns = [p for p in patterns if not p.startswith("!")]

        # Check if any ignore pattern matches
        ignored = False
        for pattern in ignore_patterns:
            if self._match_pattern(path_str, path_parts, pattern):
                ignored = True
                break

        # Check if any negation pattern matches (overrides ignore)
        if ignored:
            for negation in negations:
                if self._match_pattern(path_str, path_parts, negation):
                    ignored = False
                    break

        return ignored

    def _match_pattern(
        self, path_str: str, path_parts: list[str], pattern: str,
    ) -> bool:
        """Check if a path matches a specific pattern."""
        # Handle directory patterns (ending with /)
        if pattern.endswith("/"):
            pattern = pattern[:-1]
            # Match if any directory in the path matches
            for part in path_parts:
                if fnmatch.fnmatch(part, pattern):
                    return True
            return False

        # Handle patterns with ** (recursive)
        if "**" in pattern:
            return fnmatch.fnmatch(path_str, pattern)

        # Handle patterns with * (single level)
        if "*" in pattern:
            # Check if pattern matches any part of the path
            for part in path_parts:
                if fnmatch.fnmatch(part, pattern):
                    return True
            return False

        # Exact match
        return path_str == pattern or any(part == pattern for part in path_parts)

    def get_ignore_stats(self) -> dict:
        """Get statistics about loaded ignore patterns."""
        return {
            "gitignore_patterns": len(self._gitignore_patterns),
            "cursorignore_patterns": len(self._cursorignore_patterns),
            "total_patterns": len(self._gitignore_patterns)
            + len(self._cursorignore_patterns),
            "project_root": str(self.project_root),
        }


def create_ignore_parser(project_root: Path) -> IgnoreFileParser:
    """Create an ignore file parser for the given project root."""
    return IgnoreFileParser(project_root)
