#!/usr/bin/env python3
"""
Monolith Analysis Service
=========================

Service for analyzing code complexity and detecting monolithic files.
Provides AST parsing, metrics calculation, and complexity scoring.

🦦 Otter approach: We dive deep into code analysis with the same thoroughness
an otter explores a stream - every metric is a treasure to discover!
"""

import ast
import re
from pathlib import Path
from typing import Any


class MonolithAnalysisService:
    """Service for analyzing code complexity and structure."""

    def __init__(self) -> None:
        """Initialize the monolith analysis service."""
        self.supported_extensions = {".py", ".ts", ".tsx", ".js", ".jsx"}

    def analyze_file_metrics(
        self, file_path: str, exclude_comments: bool = True, include_ast: bool = True
    ) -> dict[str, Any]:
        """Analyze metrics for a single file."""
        try:
            with open(file_path, encoding="utf-8") as f:
                content = f.read()

            total_lines = len(content.splitlines())

            if exclude_comments:
                lines_of_code = self._count_lines_of_code(content, file_path)
            else:
                lines_of_code = total_lines

            metrics = {
                "file_path": file_path,
                "total_lines": total_lines,
                "lines_of_code": lines_of_code,
            }

            if include_ast:
                metrics["ast_metrics"] = self._analyze_ast_metrics(content, file_path)

            return metrics

        except Exception as e:
            return {
                "file_path": file_path,
                "total_lines": 0,
                "lines_of_code": 0,
                "error": str(e),
            }

    def _count_lines_of_code(self, content: str, file_path: str) -> int:
        """Count lines of code excluding comments and docstrings."""
        ext = Path(file_path).suffix.lower()

        if ext == ".py":
            return self._count_python_loc(content)
        elif ext in [".ts", ".tsx", ".js", ".jsx"]:
            return self._count_typescript_loc(content)
        else:
            # Fallback to simple line counting
            lines = content.splitlines()
            return len(
                [
                    line
                    for line in lines
                    if line.strip() and not line.strip().startswith("#")
                ]
            )

    def _count_python_loc(self, content: str) -> int:
        """Count Python lines of code using AST parsing."""
        try:
            tree = ast.parse(content)
            line_numbers = set()

            for node in ast.walk(tree):
                if hasattr(node, "lineno"):
                    line_numbers.add(node.lineno)

            return len(line_numbers)
        except SyntaxError:
            # Fallback to regex-based counting
            return self._count_python_loc_fallback(content)

    def _count_python_loc_fallback(self, content: str) -> int:
        """Fallback Python LOC counting using regex."""
        lines = content.splitlines()
        loc_lines = []
        in_multiline_string = False

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            # Handle multiline strings
            if '"""' in line or "'''" in line:
                in_multiline_string = not in_multiline_string
                continue

            if in_multiline_string:
                continue

            # Skip comments
            if stripped.startswith("#"):
                continue

            loc_lines.append(line)

        return len(loc_lines)

    def _count_typescript_loc(self, content: str) -> int:
        """Count TypeScript/JavaScript lines of code."""
        lines = content.splitlines()
        loc_lines = []
        in_multiline_comment = False

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            # Handle multiline comments
            if "/*" in line:
                in_multiline_comment = True
            if "*/" in line:
                in_multiline_comment = False
                continue

            if in_multiline_comment:
                continue

            # Skip single-line comments
            if stripped.startswith("//"):
                continue

            # Skip import/export statements (they're not really "code")
            if stripped.startswith(("import ", "export ")):
                continue

            loc_lines.append(line)

        return len(loc_lines)

    def _analyze_ast_metrics(self, content: str, file_path: str) -> dict[str, int]:
        """Analyze AST metrics for complexity scoring."""
        ext = Path(file_path).suffix.lower()

        if ext == ".py":
            return self._analyze_python_ast(content)
        elif ext in [".ts", ".tsx", ".js", ".jsx"]:
            return self._analyze_typescript_ast(content)
        else:
            # For other files, return basic metrics
            return {
                "functions": 0,
                "classes": 0,
                "imports": 0,
                "complexity": 0,
            }

    def _analyze_python_ast(self, content: str) -> dict[str, int]:
        """Analyze Python AST for complexity metrics."""
        try:
            tree = ast.parse(content)

            functions = 0
            classes = 0
            imports = 0
            complexity = 0

            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    functions += 1
                    complexity += 1
                elif isinstance(node, ast.ClassDef):
                    classes += 1
                    complexity += 2
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    imports += 1
                elif isinstance(node, (ast.If, ast.For, ast.While, ast.Try)):
                    complexity += 1

            return {
                "functions": functions,
                "classes": classes,
                "imports": imports,
                "complexity": complexity,
            }
        except SyntaxError:
            return {
                "functions": 0,
                "classes": 0,
                "imports": 0,
                "complexity": 0,
            }

    def _analyze_typescript_ast(self, content: str) -> dict[str, int]:
        """Analyze TypeScript/JavaScript AST for complexity metrics using regex."""
        functions = 0
        classes = 0
        imports = 0
        complexity = 0

        lines = content.splitlines()

        for line in lines:
            stripped = line.strip()
            if not stripped or stripped.startswith("//"):
                continue

            # Count functions
            if re.search(
                r"\b(function|const\s+\w+\s*=\s*\(|=>\s*{|async\s+function)", stripped
            ):
                functions += 1
                complexity += 1

            # Count classes
            if re.search(r"\bclass\s+\w+", stripped):
                classes += 1
                complexity += 2

            # Count imports
            if re.search(r"\b(import|export)\s+", stripped):
                imports += 1

            # Count control structures
            if re.search(r"\b(if|for|while|switch|try|catch)\b", stripped):
                complexity += 1

        return {
            "functions": functions,
            "classes": classes,
            "imports": imports,
            "complexity": complexity,
        }
