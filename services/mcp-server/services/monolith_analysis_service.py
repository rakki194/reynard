#!/usr/bin/env python3
"""
Monolith Analysis Service
=========================

Service for analyzing code complexity and detecting monolithic files.
Provides AST parsing, metrics calculation, and complexity scoring with
RAG system integration for blazing-fast performance.

🔥 Phoenix approach: We rise from the ashes of slow filesystem scanning
to soar with the speed of intelligent indexing and caching!
"""

import ast
import asyncio
import hashlib
import logging
import re
import time
import warnings
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Suppress regex warnings from analyzed files
warnings.filterwarnings("ignore", category=SyntaxWarning, module="<unknown>")


class MonolithAnalysisService:
    """Service for analyzing code complexity and structure."""

    def __init__(self, project_root: Path | None = None) -> None:
        """Initialize the monolith analysis service with RAG integration."""
        self.supported_extensions = {".py", ".ts", ".tsx", ".js", ".jsx"}

        # Set project root - default to Reynard project root
        if project_root is None:
            # Go up from services/mcp-server to the project root
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent
        else:
            self.project_root = project_root

        # RAG integration
        self._rag_service = None
        self._search_service = None
        self._cache_manager = None

        # Performance tracking
        self._metrics_cache = {}
        self._file_cache = {}
        self._cache_ttl = 3600  # 1 hour
        self._last_cache_cleanup = time.time()

        # Initialize RAG integration
        self._initialize_rag_integration()

    def _initialize_rag_integration(self) -> None:
        """Initialize RAG service integration for fast file discovery and caching."""
        try:
            # Try to get RAG service from service registry
            import sys
            import os

            # Add backend path to sys.path for imports
            backend_path = os.path.join(
                os.path.dirname(__file__), "..", "..", "..", "backend"
            )
            if backend_path not in sys.path:
                sys.path.insert(0, backend_path)

            # Try to import service registry
            try:
                from app.core.service_registry import get_service_registry

                registry = get_service_registry()
                self._rag_service = registry.get_service_instance("rag")
                self._search_service = registry.get_service_instance("search")

                # Try to get cache manager
                try:
                    from app.core.cache_optimizer import IntelligentCacheManager

                    self._cache_manager = IntelligentCacheManager()
                    logger.info("🔥 RAG integration initialized with cache support")
                except ImportError:
                    logger.info("🔥 RAG integration initialized (cache not available)")

            except ImportError:
                logger.info("🔥 RAG integration not available (backend not accessible)")
                # Try file indexing service as fallback
                try:
                    from app.services.rag.file_indexing_service import get_file_indexing_service
                    self._rag_service = get_file_indexing_service()
                    logger.info("🔥 File indexing service initialized as fallback")
                except ImportError:
                    logger.info("🔥 No file indexing services available")
                    self._rag_service = None
                    self._search_service = None
                    self._cache_manager = None

        except Exception as e:
            logger.warning("RAG integration not available: %s", e)
            self._rag_service = None
            self._search_service = None
            self._cache_manager = None

    async def _get_cached_metrics(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Get cached metrics for a file."""
        if not self._cache_manager:
            return self._metrics_cache.get(file_path)

        try:
            cache_key = (
                f"monolith_metrics:{hashlib.md5(file_path.encode()).hexdigest()}"
            )
            return await self._cache_manager.get(cache_key)
        except Exception:
            return self._metrics_cache.get(file_path)

    async def _cache_metrics(self, file_path: str, metrics: Dict[str, Any]) -> None:
        """Cache metrics for a file."""
        if not self._cache_manager:
            self._metrics_cache[file_path] = {
                "metrics": metrics,
                "timestamp": time.time(),
            }
            return

        try:
            cache_key = (
                f"monolith_metrics:{hashlib.md5(file_path.encode()).hexdigest()}"
            )
            await self._cache_manager.set(cache_key, metrics, ttl=self._cache_ttl)
        except Exception:
            self._metrics_cache[file_path] = {
                "metrics": metrics,
                "timestamp": time.time(),
            }

    async def _get_indexed_files(
        self, directories: List[str], file_types: List[str]
    ) -> List[str]:
        """Get files from RAG index instead of filesystem scanning."""
        # Try file indexing service first
        indexed_files = await self._try_file_indexing_service(directories, file_types)
        if indexed_files:
            return indexed_files
        
        # Fallback to search service if available
        return await self._try_search_service_indexing(directories, file_types)
    
    async def _try_file_indexing_service(self, directories: List[str], file_types: List[str]) -> List[str]:
        """Try to get files from file indexing service."""
        if not (self._rag_service and hasattr(self._rag_service, 'index_files')):
            return []
        
        try:
            result = await self._rag_service.index_files(directories, file_types)
            if result.get("success"):
                indexed_files = result.get("files", [])
                logger.info("🔥 Retrieved %d files from file indexing service", len(indexed_files))
                return indexed_files
        except Exception as e:
            logger.warning("Failed to get files from file indexing service: %s", e)
        
        return []
    
    async def _try_search_service_indexing(self, directories: List[str], file_types: List[str]) -> List[str]:
        """Try to get files from search service."""
        if not self._search_service:
            return []

        try:
            indexed_files = []
            for directory in directories:
                directory_files = await self._get_files_from_directory(directory, file_types)
                indexed_files.extend(directory_files)
            
            logger.info("🔥 Retrieved %d files from RAG index", len(indexed_files))
            return indexed_files

        except Exception as e:
            logger.warning("Failed to get indexed files from RAG: %s", e)
            return []
    
    async def _get_files_from_directory(self, directory: str, file_types: List[str]) -> List[str]:
        """Get files from a specific directory using search service."""
        try:
            extension_pattern = "|".join(file_types)
            pattern = f"\\.({extension_pattern})$"

            class SimpleRequest:
                def __init__(self, query, max_results, file_types, directories, case_sensitive):
                    self.query = query
                    self.max_results = max_results
                    self.file_types = file_types
                    self.directories = directories
                    self.case_sensitive = case_sensitive

            request = SimpleRequest(
                query=pattern,
                max_results=10000,
                file_types=file_types,
                directories=[directory],
                case_sensitive=False,
            )

            result = await self._search_service.syntax_search(request)
            if result.success:
                return [search_result.file_path for search_result in result.results]
            
        except Exception as e:
            logger.warning("Failed to get indexed files for %s: %s", directory, e)
        
        return []

    def _cleanup_cache(self) -> None:
        """Clean up expired cache entries."""
        current_time = time.time()
        if current_time - self._last_cache_cleanup < 300:  # Cleanup every 5 minutes
            return

        # Clean up in-memory cache
        expired_keys = []
        for key, value in self._metrics_cache.items():
            if current_time - value.get("timestamp", 0) > self._cache_ttl:
                expired_keys.append(key)

        for key in expired_keys:
            del self._metrics_cache[key]

        self._last_cache_cleanup = current_time
        logger.debug("🔥 Cleaned up %d expired cache entries", len(expired_keys))

    async def _analyze_file_async(
        self,
        file_path: str,
        exclude_comments: bool,
        include_metrics: bool,
        max_lines: int,
    ) -> Optional[Dict[str, Any]]:
        """Analyze a single file asynchronously and return monolith info if applicable."""
        try:
            metrics = await self.analyze_file_metrics(
                file_path,
                exclude_comments=exclude_comments,
                include_ast=include_metrics,
            )

            lines_of_code = metrics.get("lines_of_code", 0)

            if lines_of_code > max_lines:
                monolith_info = {
                    "file_path": file_path,
                    "lines_of_code": lines_of_code,
                    "total_lines": metrics.get("total_lines", 0),
                }

                if include_metrics and "ast_metrics" in metrics:
                    monolith_info["ast_metrics"] = metrics["ast_metrics"]

                return monolith_info

            # Return basic info for non-monoliths too (for total counting)
            return {
                "file_path": file_path,
                "lines_of_code": lines_of_code,
                "total_lines": metrics.get("total_lines", 0),
            }

        except Exception as e:
            logger.debug("Failed to analyze %s: %s", file_path, e)
            return None

    async def _process_files_batch(
        self,
        file_paths: List[str],
        exclude_comments: bool,
        include_metrics: bool,
        max_lines: int,
    ) -> tuple[int, int, List[Dict[str, Any]]]:
        """Process files in batches for better performance."""
        total_files = 0
        total_lines = 0
        monoliths = []

        batch_size = 50
        for i in range(0, len(file_paths), batch_size):
            batch = file_paths[i : i + batch_size]

            # Process batch concurrently
            tasks = []
            for file_path in batch:
                task = self._analyze_file_async(
                    file_path, exclude_comments, include_metrics, max_lines
                )
                tasks.append(task)

            # Wait for batch to complete
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            # Process results
            for result in batch_results:
                if isinstance(result, Exception):
                    continue

                if result:
                    total_files += 1
                    total_lines += result.get("lines_of_code", 0)

                    if result.get("lines_of_code", 0) > max_lines:
                        monoliths.append(result)

        return total_files, total_lines, monoliths

    async def analyze_file_metrics(
        self, file_path: str, exclude_comments: bool = True, include_ast: bool = True
    ) -> dict[str, Any]:
        """Analyze metrics for a single file with intelligent caching."""
        # Check cache first
        cached_metrics = await self._get_cached_metrics(file_path)
        if cached_metrics:
            logger.debug("🔥 Cache hit for %s", file_path)
            return cached_metrics

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

            # Cache the results
            await self._cache_metrics(file_path, metrics)

            return metrics

        except (OSError, UnicodeDecodeError) as e:
            error_metrics = {
                "file_path": file_path,
                "total_lines": 0,
                "lines_of_code": 0,
                "error": str(e),
            }
            # Cache error results too (with shorter TTL)
            await self._cache_metrics(file_path, error_metrics)
            return error_metrics

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
                r"\b(function|const\s+\w+\s*=\s*\(|=>\s*\{|async\s+function)", stripped
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

    async def detect_monoliths(
        self,
        max_lines: int = 140,
        exclude_comments: bool = True,
        file_types: list[str] = None,
        directories: list[str] = None,
        top_n: int = 20,
        include_metrics: bool = True,
    ) -> str:
        """Detect large monolithic files that violate the 140-line axiom with RAG acceleration."""
        if file_types is None:
            file_types = [".py", ".ts", ".tsx", ".js", ".jsx"]
        if directories is None:
            directories = ["packages/", "examples/", "backend/"]

        monoliths = []
        total_files = 0
        total_lines = 0
        start_time = time.time()

        # Clean up cache periodically
        self._cleanup_cache()

        # Try to get files from RAG index first (much faster)
        indexed_files = await self._get_indexed_files(directories, file_types)

        if indexed_files:
            logger.info("🔥 Using RAG index: %d files found", len(indexed_files))
            file_paths = indexed_files
        else:
            logger.info("🔥 RAG index not available, falling back to filesystem scan")
            # Fallback to filesystem scanning
            file_paths = []

            for directory in directories:
                # Resolve directory path relative to project root
                if Path(directory).is_absolute():
                    dir_path = Path(directory)
                else:
                    dir_path = self.project_root / directory

                if not dir_path.exists():
                    logger.warning("Directory does not exist: %s", dir_path)
                    continue

                for file_path in dir_path.rglob("*"):
                    if file_path.is_file() and file_path.suffix.lower() in file_types:
                        # Check if file should be excluded
                        should_exclude = False
                        file_str = str(file_path)

                        # Simple exclusion patterns
                        exclude_dirs = [
                            "/dist/",
                            "/build/",
                            "/node_modules/",
                            "/__pycache__/",
                            "/.git/",
                            "/venv/",
                            "/env/",
                            "/target/",
                            "/out/",
                            "/coverage/",
                            "/.next/",
                            "/.nuxt/",
                            "/vendor/",
                            "/third_party/",
                            "/generated/",
                        ]

                        # Check directory exclusions
                        for exclude_dir in exclude_dirs:
                            if exclude_dir in file_str:
                                should_exclude = True
                                break

                        # Check file pattern exclusions
                        if not should_exclude:
                            exclude_files = [
                                ".min.js",
                                ".bundle.js",
                                ".chunk.js",
                                ".vendor.js",
                                ".generated.",
                                ".auto.",
                            ]
                            for exclude_file in exclude_files:
                                if exclude_file in file_str:
                                    should_exclude = True
                                    break

                        if not should_exclude:
                            file_paths.append(str(file_path))

        # Process files with async batching for better performance
        total_files, total_lines, monoliths = await self._process_files_batch(
            file_paths, exclude_comments, include_metrics, max_lines
        )

        # Sort by lines of code (descending)
        monoliths.sort(key=lambda x: x["lines_of_code"], reverse=True)

        # Take top N
        top_monoliths = monoliths[:top_n]

        # Calculate performance metrics
        analysis_time = time.time() - start_time
        files_per_second = total_files / analysis_time if analysis_time > 0 else 0

        # Generate report
        report_lines = []
        report_lines.append("🔥 Phoenix Monolith Detection Report")
        report_lines.append(f"📊 Threshold: {max_lines} lines of code")
        report_lines.append(f"📁 Directories scanned: {', '.join(directories)}")
        report_lines.append(f"📄 Total files analyzed: {total_files}")
        report_lines.append(f"📏 Total lines of code: {total_lines:,}")
        report_lines.append(f"🚨 Monoliths found: {len(monoliths)}")
        report_lines.append(f"⚡ Analysis time: {analysis_time:.2f}s")
        report_lines.append(f"🚀 Files per second: {files_per_second:.1f}")
        report_lines.append(
            f"🔥 RAG acceleration: {'Enabled' if indexed_files else 'Disabled'}"
        )
        report_lines.append("")

        if top_monoliths:
            report_lines.append("🔍 Top Monoliths:")
            report_lines.append("")

            for i, monolith in enumerate(top_monoliths, 1):
                report_lines.append(f"{i:2d}. {monolith['file_path']}")
                report_lines.append(
                    f"    📏 Lines of code: {monolith['lines_of_code']}"
                )
                report_lines.append(f"    📄 Total lines: {monolith['total_lines']}")

                if include_metrics and "ast_metrics" in monolith:
                    ast_metrics = monolith["ast_metrics"]
                    report_lines.append(
                        f"    🔧 Functions: {ast_metrics.get('functions', 0)}"
                    )
                    report_lines.append(
                        f"    🏗️  Classes: {ast_metrics.get('classes', 0)}"
                    )
                    report_lines.append(
                        f"    📦 Imports: {ast_metrics.get('imports', 0)}"
                    )
                    report_lines.append(
                        f"    ⚡ Complexity: {ast_metrics.get('complexity', 0)}"
                    )

                report_lines.append("")
        else:
            report_lines.append(
                "✅ No monoliths found! All files follow the 140-line axiom."
            )

        return "\n".join(report_lines)
