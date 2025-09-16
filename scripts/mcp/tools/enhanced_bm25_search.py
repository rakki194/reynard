#!/usr/bin/env python3
"""
Enhanced BM25 Search Tool for AI Agents
=======================================

A comprehensive BM25 search implementation with agent-friendly features including:
- Query expansion and auto-suggestions
- Hybrid search capabilities
- Performance optimizations
- Smart caching
- Contextual search
- Multi-modal search support

Based on latest research in BM25 improvements and agent usability.
"""

import logging
import math
import os
import re
import time
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


class QueryExpander:
    """Query expansion and suggestion engine for better search results."""

    def __init__(self):
        self.synonyms = {
            # Code-related synonyms
            "function": ["func", "method", "procedure", "routine"],
            "class": ["type", "object", "struct"],
            "variable": ["var", "let", "const", "field"],
            "import": ["require", "include", "use"],
            "export": ["module.exports", "return"],
            "async": ["await", "promise", "callback"],
            "error": ["exception", "bug", "issue", "problem"],
            "test": ["spec", "unit", "integration", "e2e"],
            "config": ["settings", "options", "preferences"],
            "api": ["endpoint", "route", "service"],
            # Technology synonyms
            "react": ["jsx", "component", "hook"],
            "typescript": ["ts", "type", "interface"],
            "python": ["py", "script", "module"],
            "javascript": ["js", "node", "browser"],
            "css": ["style", "stylesheet", "styling"],
            "html": ["markup", "template", "dom"],
            # Common patterns
            "auth": ["authentication", "login", "security"],
            "db": ["database", "sql", "query"],
            "ui": ["interface", "user", "frontend"],
            "backend": ["server", "api", "service"],
            "frontend": ["client", "ui", "browser"],
        }

        self.stop_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "have",
            "has",
            "had",
            "do",
            "does",
            "did",
            "will",
            "would",
            "could",
            "should",
        }

    def expand_query(self, query: str) -> list[str]:
        """Expand query with synonyms and related terms."""
        tokens = self._tokenize(query)
        expanded_terms = set(tokens)

        for token in tokens:
            if token in self.synonyms:
                expanded_terms.update(self.synonyms[token])

        return list(expanded_terms)

    def suggest_queries(self, query: str, max_suggestions: int = 5) -> list[str]:
        """Generate query suggestions based on common patterns."""
        suggestions = []
        tokens = self._tokenize(query)

        # Add variations with synonyms
        for token in tokens:
            if token in self.synonyms:
                for synonym in self.synonyms[token][:2]:  # Limit to 2 synonyms
                    suggestion = query.replace(token, synonym)
                    if suggestion not in suggestions:
                        suggestions.append(suggestion)

        # Add common query patterns
        if "error" in tokens:
            suggestions.extend([f"{query} fix", f"{query} solution", f"{query} debug"])

        if "test" in tokens:
            suggestions.extend(
                [f"{query} unit", f"{query} integration", f"{query} spec"]
            )

        return suggestions[:max_suggestions]

    def _tokenize(self, text: str) -> list[str]:
        """Tokenize text for processing."""
        return re.findall(r"\b\w+\b", text.lower())


class SearchCache:
    """Intelligent caching system for search results."""

    def __init__(self, max_size: int = 1000, ttl: int = 3600):
        self.cache: dict[str, tuple[Any, float]] = {}
        self.max_size = max_size
        self.ttl = ttl  # Time to live in seconds

    def get(self, key: str) -> Any | None:
        """Get cached result if still valid."""
        if key in self.cache:
            result, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return result
            else:
                del self.cache[key]
        return None

    def set(self, key: str, value: Any) -> None:
        """Cache a result."""
        if len(self.cache) >= self.max_size:
            # Remove oldest entry
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k][1])
            del self.cache[oldest_key]

        self.cache[key] = (value, time.time())

    def clear(self) -> None:
        """Clear all cached results."""
        self.cache.clear()


class EnhancedBM25Engine:
    """Enhanced BM25 search engine with advanced features."""

    def __init__(self, k1: float = 1.2, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.documents: list[str] = []
        self.doc_paths: list[str] = []
        self.doc_freqs: list[dict[str, int]] = []
        self.idf: dict[str, float] = {}
        self.doc_len: list[int] = []
        self.corpus_size: int = 0
        self.avgdl: float = 0.0

        # Enhanced features
        self.query_expander = QueryExpander()
        self.cache = SearchCache()
        self.file_types: dict[str, int] = defaultdict(int)
        self.directory_stats: dict[str, int] = defaultdict(int)

        # Performance tracking
        self.search_stats = {
            "total_searches": 0,
            "cache_hits": 0,
            "avg_search_time": 0.0,
        }

    def _tokenize(self, text: str) -> list[str]:
        """Enhanced tokenization with better handling of code patterns."""
        # Handle code-specific patterns
        text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)  # camelCase
        text = re.sub(r"([A-Z])([A-Z][a-z])", r"\1 \2", text)  # PascalCase
        text = re.sub(r"([a-z])([0-9])", r"\1 \2", text)  # alphanumeric
        text = re.sub(r"([0-9])([a-z])", r"\1 \2", text)  # alphanumeric

        # Extract tokens
        tokens = re.findall(r"\b\w+\b", text.lower())

        # Filter out stop words and very short tokens
        return [
            token
            for token in tokens
            if len(token) > 2 and token not in self.query_expander.stop_words
        ]

    def _preprocess_document(self, content: str, file_path: str) -> str:
        """Enhanced document preprocessing with file type awareness."""
        # Remove excessive whitespace
        content = re.sub(r"\s+", " ", content.strip())

        # Add file type context
        file_ext = Path(file_path).suffix.lower()
        file_type_context = f"FILE_TYPE: {file_ext} "

        # Add directory context
        dir_path = str(Path(file_path).parent)
        dir_context = f"DIRECTORY: {dir_path} "

        # Enhanced content with metadata
        enhanced_content = f"{file_type_context}{dir_context}FILE: {Path(file_path).name} PATH: {file_path} CONTENT: {content}"

        return enhanced_content

    def add_documents(self, documents: list[str], paths: list[str]) -> None:
        """Add documents with enhanced indexing."""
        if len(documents) != len(paths):
            raise ValueError("Documents and paths must have the same length")

        for doc, path in zip(documents, paths):
            processed_doc = self._preprocess_document(doc, path)
            self.documents.append(processed_doc)
            self.doc_paths.append(path)

            # Track file types and directories
            file_ext = Path(path).suffix.lower()
            self.file_types[file_ext] += 1
            self.directory_stats[str(Path(path).parent)] += 1

            # Tokenize and count frequencies
            tokens = self._tokenize(processed_doc)
            self.doc_freqs.append(Counter(tokens))
            self.doc_len.append(len(tokens))

        self.corpus_size = len(self.documents)
        self.avgdl = sum(self.doc_len) / self.corpus_size if self.corpus_size > 0 else 0

        # Calculate IDF scores
        self._calculate_idf()

    def _calculate_idf(self) -> None:
        """Calculate Inverse Document Frequency for all terms."""
        doc_freq: defaultdict[str, int] = defaultdict(int)

        for doc_freq_dict in self.doc_freqs:
            for term in doc_freq_dict:
                doc_freq[term] += 1

        for term, freq in doc_freq.items():
            self.idf[term] = math.log((self.corpus_size - freq + 0.5) / (freq + 0.5))

    def search(
        self,
        query: str,
        top_k: int = 10,
        expand_query: bool = True,
        file_types: list[str | None] = None,
        directories: list[str | None] = None,
    ) -> list[tuple[str, float, str, dict[str, Any]]]:
        """
        Enhanced search with query expansion and filtering.

        Returns:
            List of tuples (path, score, snippet, metadata)
        """
        start_time = time.time()
        self.search_stats["total_searches"] += 1

        # Check cache first
        cache_key = f"{query}:{top_k}:{expand_query}:{file_types}:{directories}"
        cached_result = self.cache.get(cache_key)
        if cached_result:
            self.search_stats["cache_hits"] += 1
            return cached_result

        if self.corpus_size == 0:
            return []

        # Expand query if requested
        if expand_query:
            query_terms = self.query_expander.expand_query(query)
        else:
            query_terms = self._tokenize(query)

        scores = []

        for i, doc_freq in enumerate(self.doc_freqs):
            # Apply filters
            if file_types and not self._matches_file_type(
                self.doc_paths[i], file_types
            ):
                continue
            if directories and not self._matches_directory(
                self.doc_paths[i], directories
            ):
                continue

            score = 0.0

            for term in query_terms:
                # Exact match
                if term in doc_freq:
                    tf = doc_freq[term]
                    idf = self.idf.get(term, 0)

                    # BM25 formula
                    numerator = tf * (self.k1 + 1)
                    denominator = tf + self.k1 * (
                        1 - self.b + self.b * (self.doc_len[i] / self.avgdl)
                    )
                    score += idf * (numerator / denominator)
                else:
                    # Fuzzy match for numeric patterns
                    if term.isdigit() and len(term) >= 3:
                        for doc_term, tf in doc_freq.items():
                            if doc_term.isdigit() and term in doc_term:
                                idf = self.idf.get(doc_term, 0)
                                numerator = tf * (self.k1 + 1)
                                denominator = tf + self.k1 * (
                                    1 - self.b + self.b * (self.doc_len[i] / self.avgdl)
                                )
                                partial_score = idf * (numerator / denominator) * 0.5
                                score += partial_score

            if score > 0:
                # Create enhanced snippet
                snippet = self._create_snippet(self.documents[i], query_terms)

                # Create metadata
                metadata = {
                    "file_type": Path(self.doc_paths[i]).suffix.lower(),
                    "directory": str(Path(self.doc_paths[i]).parent),
                    "file_size": len(self.documents[i]),
                    "relevance_score": self._get_relevance_level(score),
                    "matched_terms": [term for term in query_terms if term in doc_freq],
                }

                scores.append((self.doc_paths[i], score, snippet, metadata))

        # Sort by score (descending) and return top_k
        scores.sort(key=lambda x: x[1], reverse=True)
        result = scores[:top_k]

        # Cache result
        self.cache.set(cache_key, result)

        # Update performance stats
        search_time = time.time() - start_time
        self.search_stats["avg_search_time"] = (
            self.search_stats["avg_search_time"]
            * (self.search_stats["total_searches"] - 1)
            + search_time
        ) / self.search_stats["total_searches"]

        return result

    def _matches_file_type(self, file_path: str, file_types: list[str]) -> bool:
        """Check if file matches any of the specified types."""
        file_ext = Path(file_path).suffix.lower()
        return any(ft.lower() in file_ext for ft in file_types)

    def _matches_directory(self, file_path: str, directories: list[str]) -> bool:
        """Check if file is in any of the specified directories."""
        file_dir = str(Path(file_path).parent)
        return any(dir_path.lower() in file_dir.lower() for dir_path in directories)

    def _create_snippet(self, content: str, query_terms: list[str]) -> str:
        """Create intelligent snippet highlighting matched terms."""
        # Find the best context around matched terms
        best_context = ""
        max_matches = 0

        for term in query_terms:
            if term in content.lower():
                # Find context around the term
                start = max(0, content.lower().find(term) - 100)
                end = min(len(content), start + 200)
                context = content[start:end]

                # Count matches in this context
                matches = sum(1 for t in query_terms if t in context.lower())
                if matches > max_matches:
                    max_matches = matches
                    best_context = context

        if not best_context:
            best_context = content[:200]

        return best_context + "..." if len(best_context) >= 200 else best_context

    def _get_relevance_level(self, score: float) -> str:
        """Get human-readable relevance level."""
        if score > 10.0:
            return "Very High"
        elif score > 5.0:
            return "High"
        elif score > 2.0:
            return "Medium"
        elif score > 1.0:
            return "Low"
        else:
            return "Very Low"

    def get_suggestions(self, query: str, max_suggestions: int = 5) -> list[str]:
        """Get query suggestions."""
        return self.query_expander.suggest_queries(query, max_suggestions)

    def get_stats(self) -> dict[str, Any]:
        """Get search engine statistics."""
        return {
            "corpus_size": self.corpus_size,
            "avg_document_length": self.avgdl,
            "file_types": dict(self.file_types),
            "top_directories": dict(
                sorted(self.directory_stats.items(), key=lambda x: x[1], reverse=True)[
                    :10
                ]
            ),
            "search_stats": self.search_stats,
            "cache_size": len(self.cache.cache),
        }


class EnhancedReynardBM25Search:
    """Enhanced Reynard-specific BM25 search with agent-friendly features."""

    def __init__(self):
        self.engine = EnhancedBM25Engine()
        self.indexed = False
        self.indexing_stats = {
            "files_indexed": 0,
            "indexing_time": 0.0,
            "last_indexed": None,
        }

    def index_project(
        self, project_root: str, file_patterns: list[str | None] = None
    ) -> None:
        """Index the entire Reynard project with enhanced features."""
        start_time = time.time()

        if file_patterns is None:
            file_patterns = [
                "*.py",
                "*.ts",
                "*.tsx",
                "*.js",
                "*.jsx",
                "*.md",
                "*.txt",
                "*.json",
                "*.yaml",
                "*.yml",
                "*.sh",
                "*.config.*",
                "*.css",
                "*.html",
                "*.xml",
                "*.sql",
                "*.dockerfile",
                "*.gitignore",
            ]

        documents = []
        paths = []

        project_path = Path(project_root)

        for pattern in file_patterns:
            for file_path in project_path.rglob(pattern):
                try:
                    # Skip certain directories
                    if any(
                        skip in str(file_path)
                        for skip in [
                            "node_modules",
                            "__pycache__",
                            ".git",
                            "venv",
                            "dist",
                            "build",
                            ".mypy_cache",
                            ".pytest_cache",
                            "coverage",
                            ".coverage",
                            "*.egg-info",
                            ".tox",
                            ".cache",
                            "tmp",
                            "temp",
                        ]
                    ):
                        continue

                    # Read file content
                    with open(file_path, encoding="utf-8", errors="ignore") as f:
                        content = f.read()

                    documents.append(content)
                    paths.append(str(file_path))

                except Exception as e:
                    logger.warning(f"Could not read file {file_path}: {e}")
                    continue

        self.engine.add_documents(documents, paths)
        self.indexed = True

        # Update indexing stats
        self.indexing_stats["files_indexed"] = len(documents)
        self.indexing_stats["indexing_time"] = time.time() - start_time
        self.indexing_stats["last_indexed"] = time.time()

        logger.info(
            f"Enhanced indexing complete: {len(documents)} files in {self.indexing_stats['indexing_time']:.2f}s"
        )

    def search_enhanced(
        self,
        query: str,
        top_k: int = 20,
        expand_query: bool = True,
        file_types: list[str | None] = None,
        directories: list[str | None] = None,
    ) -> list[dict[str, Any]]:
        """
        Enhanced search with all features.

        Args:
            query: Search query
            top_k: Number of results to return
            expand_query: Whether to expand query with synonyms
            file_types: Filter by file types (e.g., ['.py', '.ts'])
            directories: Filter by directories (e.g., ['packages/', 'examples/'])

        Returns:
            List of enhanced search results
        """
        if not self.indexed:
            raise RuntimeError("Project not indexed. Call index_project() first.")

        results = self.engine.search(
            query=query,
            top_k=top_k,
            expand_query=expand_query,
            file_types=file_types,
            directories=directories,
        )

        formatted_results = []
        for path, score, snippet, metadata in results:
            formatted_results.append(
                {
                    "file_path": path,
                    "score": round(score, 4),
                    "snippet": snippet,
                    "relevance": metadata["relevance_score"],
                    "file_type": metadata["file_type"],
                    "directory": metadata["directory"],
                    "matched_terms": metadata["matched_terms"],
                    "file_size": metadata["file_size"],
                }
            )

        return formatted_results

    def get_query_suggestions(self, query: str, max_suggestions: int = 5) -> list[str]:
        """Get intelligent query suggestions."""
        return self.engine.get_suggestions(query, max_suggestions)

    def get_search_stats(self) -> dict[str, Any]:
        """Get comprehensive search statistics."""
        engine_stats = self.engine.get_stats()
        return {
            **engine_stats,
            "indexing_stats": self.indexing_stats,
            "indexed": self.indexed,
        }

    def clear_cache(self) -> None:
        """Clear search cache."""
        self.engine.cache.clear()

    def reindex(self, project_root: str) -> None:
        """Reindex the project (useful for updates)."""
        self.indexed = False
        self.engine = EnhancedBM25Engine()  # Reset engine
        self.index_project(project_root)


# Global enhanced search instance
enhanced_bm25_search = EnhancedReynardBM25Search()


def search_enhanced(
    needle: str,
    project_root: str | None = None,
    top_k: int = 20,
    expand_query: bool = True,
    file_types: list[str | None] = None,
    directories: list[str | None] = None,
) -> list[dict[str, Any]]:
    """
    Enhanced search function with all features.

    Args:
        needle: The pattern to search for
        project_root: Root directory of the project
        top_k: Number of results to return
        expand_query: Whether to expand query with synonyms
        file_types: Filter by file types
        directories: Filter by directories

    Returns:
        List of enhanced search results
    """
    if project_root is None:
        # Default to the Reynard project root
        current_dir = os.getcwd()
        if "scripts/mcp" in current_dir:
            project_root = current_dir.replace("/scripts/mcp", "")
        else:
            project_root = current_dir

    # Index project if not already indexed
    if not enhanced_bm25_search.indexed:
        enhanced_bm25_search.index_project(project_root)

    return enhanced_bm25_search.search_enhanced(
        needle, top_k, expand_query, file_types, directories
    )


def get_query_suggestions(query: str, max_suggestions: int = 5) -> list[str]:
    """Get query suggestions for better search experience."""
    return enhanced_bm25_search.get_query_suggestions(query, max_suggestions)


def get_search_stats() -> dict[str, Any]:
    """Get comprehensive search statistics."""
    return enhanced_bm25_search.get_search_stats()


def clear_search_cache() -> None:
    """Clear search cache for fresh results."""
    enhanced_bm25_search.clear_cache()


def reindex_project(project_root: str | None = None) -> None:
    """Reindex the project for updated content."""
    if project_root is None:
        current_dir = os.getcwd()
        if "scripts/mcp" in current_dir:
            project_root = current_dir.replace("/scripts/mcp", "")
        else:
            project_root = current_dir

    enhanced_bm25_search.reindex(project_root)
