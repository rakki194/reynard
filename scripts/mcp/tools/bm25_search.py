"""
BM25 Needle-in-Haystack Search Tool for Reynard MCP Server

This module provides a modular BM25 implementation for finding specific patterns
or text within large codebases - perfect for the "needle in haystack" problem.
"""

import logging
import math
import os
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Tuple

logger = logging.getLogger(__name__)


class BM25SearchEngine:
    """
    BM25 (Best Matching 25) search engine for text retrieval.

    This implementation is optimized for code search and documentation
    exploration within the Reynard project.
    """

    def __init__(self, k1: float = 1.2, b: float = 0.75) -> None:
        """
        Initialize BM25 search engine.

        Args:
            k1: Controls term frequency saturation (default: 1.2)
            b: Controls length normalization (default: 0.75)
        """
        self.k1 = k1
        self.b = b
        self.documents: list[str] = []
        self.doc_paths: list[str] = []
        self.doc_freqs: list[dict[str, int]] = []
        self.idf: dict[str, float] = {}
        self.doc_len: list[int] = []
        self.corpus_size: int = 0
        self.avgdl: float = 0.0

    def _tokenize(self, text: str) -> list[str]:
        """
        Tokenize text for BM25 processing.

        Args:
            text: Input text to tokenize

        Returns:
            List of tokens
        """
        # Simple tokenization - can be enhanced for code-specific patterns
        tokens = re.findall(r"\b\w+\b", text.lower())
        return tokens

    def _preprocess_document(self, content: str) -> str:
        """
        Preprocess document content for better search.

        Args:
            content: Raw document content

        Returns:
            Preprocessed content
        """
        # Remove excessive whitespace and normalize
        content = re.sub(r"\s+", " ", content.strip())
        return content

    def add_documents(
        self, documents: list[str], paths: list[str] | None = None
    ) -> None:
        """
        Add documents to the search index.

        Args:
            documents: List of document contents
            paths: Optional list of file paths for the documents
        """
        if paths is None:
            paths = [f"doc_{i}" for i in range(len(documents))]

        if len(documents) != len(paths):
            raise ValueError("Documents and paths must have the same length")

        for doc, path in zip(documents, paths):
            processed_doc = self._preprocess_document(doc)
            self.documents.append(processed_doc)
            self.doc_paths.append(path)

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

    def search(self, query: str, top_k: int = 10) -> list[tuple[str, float, str]]:
        """
        Search for documents using BM25 scoring with fuzzy matching.

        Args:
            query: Search query
            top_k: Number of top results to return

        Returns:
            List of tuples (path, score, content_snippet)
        """
        if self.corpus_size == 0:
            return []

        query_tokens = self._tokenize(query)
        scores = []

        for i, doc_freq in enumerate(self.doc_freqs):
            score = 0.0

            for term in query_tokens:
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
                    # Fuzzy match for numeric patterns (e.g., 8888 matches 888888)
                    if term.isdigit() and len(term) >= 3:
                        for doc_term, tf in doc_freq.items():
                            if doc_term.isdigit() and term in doc_term:
                                # Partial match with reduced score
                                idf = self.idf.get(doc_term, 0)
                                numerator = tf * (self.k1 + 1)
                                denominator = tf + self.k1 * (
                                    1 - self.b + self.b * (self.doc_len[i] / self.avgdl)
                                )
                                # Reduce score for partial matches
                                partial_score = idf * (numerator / denominator) * 0.5
                                score += partial_score

            if score > 0:
                # Create content snippet (first 200 chars)
                snippet = (
                    self.documents[i][:200] + "..."
                    if len(self.documents[i]) > 200
                    else self.documents[i]
                )
                scores.append((self.doc_paths[i], score, snippet))

        # Sort by score (descending) and return top_k
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]


class ReynardBM25Search:
    """
    Reynard-specific BM25 search implementation for codebase exploration.
    """

    def __init__(self) -> None:
        self.engine = BM25SearchEngine()
        self.indexed = False

    def index_project(
        self, project_root: str, file_patterns: list[str] | None = None
    ) -> None:
        """
        Index the entire Reynard project for search.

        Args:
            project_root: Root directory of the project
            file_patterns: List of file patterns to include (default: common text files)
        """
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
                "*.css",  # Added CSS files
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
                        ]
                    ):
                        continue

                    # Read file content
                    with open(file_path, encoding="utf-8", errors="ignore") as f:
                        content = f.read()

                    # Add metadata to content for better search
                    enhanced_content = (
                        f"FILE: {file_path.name}\nPATH: {file_path}\nCONTENT: {content}"
                    )

                    documents.append(enhanced_content)
                    paths.append(str(file_path))

                except Exception as e:
                    logger.warning(f"Could not read file {file_path}: {e}")
                    continue

        self.engine.add_documents(documents, paths)
        self.indexed = True
        logger.info(f"Indexed {len(documents)} files for BM25 search")

    def search_needle_in_haystack(
        self, needle: str, top_k: int = 20
    ) -> list[dict[str, Any]]:
        """
        Find a specific pattern (needle) in the codebase (haystack).

        Args:
            needle: The pattern to search for
            top_k: Number of results to return

        Returns:
            List of search results with metadata
        """
        if not self.indexed:
            raise RuntimeError("Project not indexed. Call index_project() first.")

        results = self.engine.search(needle, top_k)

        formatted_results = []
        for path, score, snippet in results:
            formatted_results.append(
                {
                    "file_path": path,
                    "score": round(score, 4),
                    "snippet": snippet,
                    "relevance": self._get_relevance_level(score),
                }
            )

        return formatted_results

    def _get_relevance_level(self, score: float) -> str:
        """Get human-readable relevance level."""
        if score > 5.0:
            return "Very High"
        elif score > 2.0:
            return "High"
        elif score > 1.0:
            return "Medium"
        elif score > 0.5:
            return "Low"
        else:
            return "Very Low"


# Global search instance
bm25_search = ReynardBM25Search()


def search_needle_in_haystack(
    needle: str, project_root: str | None = None, top_k: int = 20
) -> list[dict[str, Any]]:
    """
    Main function to search for a needle in the haystack.

    Args:
        needle: The pattern to search for
        project_root: Root directory of the project (defaults to current working directory)
        top_k: Number of results to return

    Returns:
        List of search results
    """
    if project_root is None:
        # Default to the Reynard project root (3 levels up from MCP directory)
        current_dir = os.getcwd()
        if "scripts/mcp" in current_dir:
            project_root = current_dir.replace("/scripts/mcp", "")
        else:
            project_root = current_dir

    # Index project if not already indexed
    if not bm25_search.indexed:
        bm25_search.index_project(project_root)

    return bm25_search.search_needle_in_haystack(needle, top_k)
