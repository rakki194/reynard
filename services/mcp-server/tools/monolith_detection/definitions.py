#!/usr/bin/env python3
"""
Monolith Detection Tool Definitions
===================================

MCP tool definitions for monolith detection and code analysis.
"""

from typing import Any


def get_monolith_detection_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get monolith detection MCP tool definitions."""

    return {
        "detect_monoliths": {
            "name": "detect_monoliths",
            "description": "🦊 Detect large monolithic files that violate the 140-line axiom. Perfect for finding code that needs refactoring into smaller, more maintainable modules. Use this to identify files that are too complex and should be broken down.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "max_lines": {
                        "type": "integer",
                        "description": "Maximum lines of code threshold. Files exceeding this are considered monoliths. Reynard follows a 140-line axiom for optimal modularity.",
                        "default": 140,
                        "minimum": 50,
                        "maximum": 1000,
                    },
                    "exclude_comments": {
                        "type": "boolean",
                        "description": "Exclude comments and docstrings from line count. Set to true for pure code analysis, false to include documentation.",
                        "default": True,
                    },
                    "file_types": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "File extensions to analyze. Common patterns: ['.py'] for Python only, ['.ts', '.tsx'] for TypeScript, ['.js', '.jsx'] for JavaScript, or ['.py', '.ts', '.tsx', '.js', '.jsx'] for full-stack projects.",
                        "default": [".py", ".ts", ".tsx", ".js", ".jsx"],
                        "examples": [
                            [".py"],
                            [".ts", ".tsx"],
                            [".js", ".jsx"],
                            [".py", ".ts", ".tsx", ".js", ".jsx"],
                        ],
                    },
                    "directories": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Directories to scan for monoliths. Use specific paths like ['src/', 'packages/'] for targeted analysis, or ['../../'] for entire project. Tip: Start with specific directories for faster results.",
                        "default": ["packages/", "examples/", "backend/"],
                        "examples": [
                            ["packages/"],
                            ["src/", "lib/"],
                            ["backend/"],
                            ["../../"],
                        ],
                    },
                    "top_n": {
                        "type": "integer",
                        "description": "Number of largest files to return in results. Higher values show more files but take longer to process.",
                        "default": 20,
                        "minimum": 5,
                        "maximum": 100,
                    },
                    "include_metrics": {
                        "type": "boolean",
                        "description": "Include detailed code metrics like complexity scores, function counts, and class counts. Essential for understanding why a file is a monolith.",
                        "default": True,
                    },
                },
            },
        },
        "analyze_file_complexity": {
            "name": "analyze_file_complexity",
            "description": "🔍 Deep-dive analysis of a specific file's complexity metrics. Perfect for understanding why a file is considered a monolith and what specific refactoring opportunities exist.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Path to the file to analyze. Can be relative (e.g., 'src/utils.py') or absolute path. The tool will automatically resolve paths from the project root.",
                        "examples": [
                            "src/utils.py",
                            "packages/core/src/index.ts",
                            "backend/app/main.py",
                            "/absolute/path/to/file.py",
                        ],
                    },
                    "include_ast_analysis": {
                        "type": "boolean",
                        "description": "Include detailed AST (Abstract Syntax Tree) analysis showing function counts, class counts, and complexity scores. Essential for understanding code structure.",
                        "default": True,
                    },
                },
                "required": ["file_path"],
            },
        },
        "get_code_metrics_summary": {
            "name": "get_code_metrics_summary",
            "description": "📊 Comprehensive codebase health report showing overall metrics, language breakdown, and monolith statistics. Great for getting a bird's-eye view of your project's code quality and identifying areas that need attention.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "directories": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Directories to analyze for the summary. Use specific paths for targeted analysis or ['../../'] for entire project. Tip: Start with main source directories for faster results.",
                        "default": ["packages/", "examples/", "backend/"],
                        "examples": [
                            ["packages/"],
                            ["src/", "lib/"],
                            ["backend/"],
                            ["../../"],
                        ],
                    },
                    "file_types": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "File extensions to include in the analysis. Choose based on your project's primary languages.",
                        "default": [".py", ".ts", ".tsx", ".js", ".jsx"],
                        "examples": [
                            [".py"],
                            [".ts", ".tsx"],
                            [".js", ".jsx"],
                            [".py", ".ts", ".tsx", ".js", ".jsx"],
                        ],
                    },
                },
            },
        },
    }
