#!/usr/bin/env python3
"""
Ripgrep Service
===============

Advanced ripgrep service with syntactic and semantic NLP capabilities.
Combines traditional text search with intelligent query expansion and
semantic understanding for comprehensive code exploration.

Features:
- Advanced regex pattern matching
- Code-aware syntax highlighting
- Query expansion with synonyms
- Semantic search integration
- Multi-language support
- Intelligent result ranking
"""

import asyncio
import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class QueryExpander:
    """Intelligent query expansion for better search results."""

    def __init__(self) -> None:
        # Code-specific synonyms and patterns
        self.synonyms = {
            # Programming concepts
            "function": ["func", "method", "procedure", "routine", "fn"],
            "class": ["type", "object", "struct", "interface"],
            "variable": ["var", "let", "const", "field", "property"],
            "import": ["require", "include", "use", "from"],
            "export": ["module.exports", "return", "public"],
            "async": ["await", "promise", "callback", "then"],
            "error": ["exception", "bug", "issue", "problem", "fail"],
            "test": ["spec", "unit", "integration", "e2e", "mock"],
            "config": ["settings", "options", "preferences", "setup"],
            "api": ["endpoint", "route", "service", "handler"],
            # Technology stacks
            "react": ["jsx", "component", "hook", "props"],
            "typescript": ["ts", "type", "interface", "generic"],
            "python": ["py", "script", "module", "package"],
            "javascript": ["js", "node", "browser", "es6"],
            "css": ["style", "stylesheet", "styling", "scss"],
            "html": ["markup", "template", "dom", "element"],
            # Common patterns
            "auth": ["authentication", "login", "security", "token"],
            "db": ["database", "sql", "query", "table"],
            "ui": ["interface", "user", "frontend", "component"],
            "backend": ["server", "api", "service", "controller"],
            "frontend": ["client", "ui", "browser", "view"],
        }

        # Code pattern expansions
        self.patterns = {
            "function_def": [
                r"def\s+\w+",  # Python
                r"function\s+\w+",  # JavaScript
                r"const\s+\w+\s*=",  # Modern JS
                r"public\s+\w+\s+\w+\(",  # Java/C#
            ],
            "class_def": [
                r"class\s+\w+",  # Most languages
                r"interface\s+\w+",  # TypeScript/Java
                r"struct\s+\w+",  # C/C++
            ],
            "import_stmt": [
                r"import\s+.*from",  # ES6
                r"require\s*\(",  # CommonJS
                r"from\s+\w+\s+import",  # Python
                r"#include",  # C/C++
            ],
        }

    def expand_query(self, query: str) -> List[str]:
        """Expand query with synonyms and related terms."""
        tokens = self._tokenize(query)
        expanded_terms = set(tokens)

        for token in tokens:
            if token in self.synonyms:
                expanded_terms.update(self.synonyms[token])

        return list(expanded_terms)

    def get_code_patterns(self, query: str) -> List[str]:
        """Get relevant code patterns for the query."""
        patterns = []
        query_lower = query.lower()

        for pattern_type, pattern_list in self.patterns.items():
            if any(keyword in query_lower for keyword in pattern_type.split("_")):
                patterns.extend(pattern_list)

        return patterns

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text for processing."""
        return re.findall(r"\b\w+\b", text.lower())


class RipgrepService:
    """Advanced ripgrep service with NLP capabilities."""

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent
        else:
            self.project_root = project_root

        self.query_expander = QueryExpander()

        # File type mappings for ripgrep
        self.file_types = {
            "py": "python",
            "ts": "typescript",
            "tsx": "tsx",
            "js": "javascript",
            "jsx": "jsx",
            "md": "markdown",
            "json": "json",
            "yaml": "yaml",
            "yml": "yaml",
            "sh": "shell",
            "css": "css",
            "html": "html",
            "xml": "xml",
            "sql": "sql",
            "dockerfile": "dockerfile",
            "gitignore": "gitignore",
        }

    async def run_ripgrep(
        self,
        pattern: str,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        case_sensitive: bool = True,
        whole_word: bool = False,
        max_count: Optional[int] = None,
        context_lines: int = 0,
        include_line_numbers: bool = True,
        smart_case: bool = True,
        multiline: bool = False,
    ) -> Dict[str, Any]:
        """Run ripgrep with comprehensive options."""
        command = ["rg"]

        # Add pattern
        if whole_word:
            command.extend(["-w", pattern])
        else:
            command.append(pattern)

        # Add file type filters
        if file_types:
            for file_type in file_types:
                if file_type in self.file_types:
                    command.extend(["-t", self.file_types[file_type]])
                else:
                    command.extend(["-t", file_type])

        # Add directory filters
        if directories:
            command.extend(directories)
        else:
            command.append(".")

        # Add case sensitivity
        if not case_sensitive:
            command.append("-i")
        elif smart_case:
            command.append("--smart-case")

        # Add line numbers
        if include_line_numbers:
            command.append("-n")

        # Add context lines
        if context_lines > 0:
            command.extend(["-C", str(context_lines)])

        # Add max count
        if max_count:
            command.extend(["-m", str(max_count)])

        # Add multiline support
        if multiline:
            command.append("-U")

        # Add other useful options
        command.extend(
            [
                "--color",
                "never",
                "--no-heading",
                "--no-messages",  # Suppress error messages for missing files
            ]
        )

        return await self._run_command(command)

    async def semantic_search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        expand_query: bool = True,
        max_results: int = 50,
    ) -> Dict[str, Any]:
        """Perform semantic search with query expansion."""
        results = {}

        # Strategy 1: Direct search
        direct_result = await self.run_ripgrep(
            query,
            file_types=file_types,
            directories=directories,
            case_sensitive=False,
            max_count=max_results // 3,
        )
        results["direct"] = direct_result

        # Strategy 2: Expanded query search
        if expand_query:
            expanded_terms = self.query_expander.expand_query(query)
            for term in expanded_terms[:3]:  # Limit to top 3 expansions
                expanded_result = await self.run_ripgrep(
                    term,
                    file_types=file_types,
                    directories=directories,
                    case_sensitive=False,
                    max_count=max_results // 6,
                )
                results[f"expanded_{term}"] = expanded_result

        # Strategy 3: Code pattern search
        code_patterns = self.query_expander.get_code_patterns(query)
        for pattern in code_patterns[:2]:  # Limit to top 2 patterns
            pattern_result = await self.run_ripgrep(
                pattern,
                file_types=file_types,
                directories=directories,
                case_sensitive=False,
                max_count=max_results // 6,
            )
            results[f"pattern_{pattern[:20]}"] = pattern_result

        # Combine and rank results
        combined_results = self._combine_and_rank_results(results, max_results)

        return {
            "success": True,
            "query": query,
            "total_results": len(combined_results),
            "results": combined_results,
            "search_strategies": list(results.keys()),
        }

    async def search_code_patterns(
        self,
        pattern_type: str,
        language: str = "py",
        name: Optional[str] = None,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Search for specific code patterns."""
        patterns = {
            "function": {
                "py": r"^def\s+(\w+)",
                "ts": r"function\s+(\w+)",
                "js": r"function\s+(\w+)",
                "java": r"public\s+\w+\s+(\w+)\s*\(",
                "cpp": r"\w+\s+(\w+)\s*\(",
            },
            "class": {
                "py": r"^class\s+(\w+)",
                "ts": r"class\s+(\w+)",
                "js": r"class\s+(\w+)",
                "java": r"class\s+(\w+)",
                "cpp": r"class\s+(\w+)",
            },
            "import": {
                "py": r"^import\s+(\w+)",
                "ts": r"import\s+.*from\s+['\"]([^'\"]+)['\"]",
                "js": r"import\s+.*from\s+['\"]([^'\"]+)['\"]",
                "java": r"import\s+([\w.]+)",
                "cpp": r"#include\s*[<\"]([^>\"]+)[>\"]",
            },
            "todo": {
                "py": r"#\s*TODO:?\s*(.+)",
                "ts": r"//\s*TODO:?\s*(.+)",
                "js": r"//\s*TODO:?\s*(.+)",
                "java": r"//\s*TODO:?\s*(.+)",
                "cpp": r"//\s*TODO:?\s*(.+)",
            },
            "fixme": {
                "py": r"#\s*FIXME:?\s*(.+)",
                "ts": r"//\s*FIXME:?\s*(.+)",
                "js": r"//\s*FIXME:?\s*(.+)",
                "java": r"//\s*FIXME:?\s*(.+)",
                "cpp": r"//\s*FIXME:?\s*(.+)",
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

        return await self.run_ripgrep(
            pattern,
            file_types=file_types or [language],
            directories=directories,
            case_sensitive=False,
            context_lines=1,
        )

    async def search_with_context(
        self,
        query: str,
        context_lines: int = 3,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Search with surrounding context lines."""
        return await self.run_ripgrep(
            query,
            file_types=file_types,
            directories=directories,
            case_sensitive=False,
            context_lines=context_lines,
            max_count=20,  # Limit results when showing context
        )

    async def _run_command(self, command: List[str]) -> Dict[str, Any]:
        """Execute a command and return structured results."""
        try:
            logger.info("Running command: %s", " ".join(command))
            result = await asyncio.create_subprocess_exec(
                *command,
                cwd=self.project_root,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
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

    def _combine_and_rank_results(
        self, results: Dict[str, Any], max_results: int
    ) -> List[Dict[str, Any]]:
        """Combine and rank results from multiple search strategies."""
        combined = []
        seen_files: set[str] = set()

        # Priority order for different search strategies
        strategy_priority = {
            "direct": 1.0,
            "expanded_": 0.8,
            "pattern_": 0.6,
        }

        # Process results by priority
        for strategy, result in results.items():
            if not result.get("success") or not result.get("stdout"):
                continue

            priority = 1.0
            for prefix, score in strategy_priority.items():
                if strategy.startswith(prefix):
                    priority = score
                    break

            parsed_results = self._parse_ripgrep_output(
                result["stdout"], priority, seen_files
            )
            combined.extend(parsed_results)

        # Sort by priority and limit results
        combined.sort(key=lambda x: x["priority"], reverse=True)
        return combined[:max_results]

    def _parse_ripgrep_output(
        self, output: str, priority: float, seen_files: set
    ) -> List[Dict[str, Any]]:
        """Parse ripgrep output into structured results."""
        results = []
        lines = output.split("\n")

        for line in lines:
            if not line.strip():
                continue

            # Parse ripgrep output format: file:line:content
            parts = line.split(":", 2)
            if len(parts) < 3:
                continue

            file_path = parts[0]
            line_number = parts[1]
            content = parts[2]

            # Avoid duplicates
            file_line_key = f"{file_path}:{line_number}"
            if file_line_key in seen_files:
                continue
            seen_files.add(file_line_key)

            results.append(
                {
                    "file_path": file_path,
                    "line_number": int(line_number),
                    "content": content.strip(),
                    "priority": priority,
                    "match_type": "text",
                }
            )

        return results
