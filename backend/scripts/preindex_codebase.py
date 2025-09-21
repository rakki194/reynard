#!/usr/bin/env python3
"""
Reynard Codebase Pre-Indexing Script

This script performs comprehensive pre-indexing of the entire Reynard codebase:
- Scans all source files
- Generates embeddings using Ollama
- Stores in PostgreSQL with pgvector
- Creates BM25 indices for fast text search
- Caches results for instant retrieval

Usage:
    python scripts/preindex_codebase.py [--force] [--verbose] [--batch-size N]
"""

import argparse
import asyncio
import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import get_config
from app.services.rag import RAGService

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ReynardPreIndexer:
    """Comprehensive pre-indexer for the Reynard codebase."""

    def __init__(self, root_path: str = "/home/kade/runeset/reynard"):
        self.root_path = Path(root_path)
        self.rag_service = None
        self.indexed_files = 0
        self.total_chunks = 0
        self.failed_files = 0

        # File patterns to include
        self.include_patterns = {
            "*.py",
            "*.ts",
            "*.tsx",
            "*.js",
            "*.jsx",
            "*.vue",
            "*.svelte",
            "*.md",
            "*.txt",
            "*.json",
            "*.yaml",
            "*.yml",
            "*.toml",
            "*.css",
            "*.scss",
            "*.sass",
            "*.less",
            "*.html",
            "*.xml",
            "*.java",
            "*.cpp",
            "*.c",
            "*.h",
            "*.hpp",
            "*.cc",
            "*.cxx",
            "*.go",
            "*.rs",
            "*.php",
            "*.rb",
            "*.swift",
            "*.kt",
            "*.scala",
        }

        # Directories to skip
        self.skip_dirs = {
            "node_modules",
            "__pycache__",
            ".git",
            ".vscode",
            ".idea",
            "dist",
            "build",
            "target",
            "coverage",
            ".nyc_output",
            "venv",
            "env",
            ".env",
            "logs",
            "tmp",
            "temp",
            ".pytest_cache",
            ".mypy_cache",
            ".tox",
            "htmlcov",
            "reynard_backend.egg-info",
            "alembic/versions",
            ".cursor",
            "third_party",  # Skip third party and cursor files
        }

        # File patterns to skip
        self.skip_files = {
            "*.pyc",
            "*.pyo",
            "*.pyd",
            "*.so",
            "*.dll",
            "*.exe",
            "*.log",
            "*.tmp",
            "*.temp",
            "*.cache",
            "*.lock",
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
            "*.min.js",
            "*.min.css",
            "*.bundle.js",
            "*.tsbuildinfo",
        }

    def should_skip_file(self, file_path: Path) -> bool:
        """Check if a file should be skipped."""
        # Check if any parent directory should be skipped
        for part in file_path.parts:
            if part in self.skip_dirs:
                return True

        # Check file patterns
        for pattern in self.skip_files:
            if file_path.match(pattern):
                return True

        # Skip very large files (>2MB)
        try:
            if file_path.stat().st_size > 2 * 1024 * 1024:
                return True
        except OSError:
            return True

        return False

    def should_include_file(self, file_path: Path) -> bool:
        """Check if a file should be included."""
        for pattern in self.include_patterns:
            if file_path.match(pattern):
                return True
        return False

    async def initialize_rag_service(self) -> bool:
        """Initialize the RAG service with optimized configuration."""
        try:
            # Optimized RAG configuration for pre-indexing
            rag_config = {
                "rag_enabled": True,
                "pg_dsn": "postgresql://postgres@localhost:5432/reynard_rag",
                "ollama_base_url": "http://localhost:11434",
                "rag_text_model": "nomic-embed-text",  # Better embedding model
                "rag_code_model": "codellama:7b",  # Code-specific model
                "rag_ingest_batch_size_text": 32,  # Larger batches for efficiency
                "rag_chunk_max_tokens": 1024,  # Larger chunks for better context
                "rag_chunk_min_tokens": 200,  # Minimum meaningful chunks
                "rag_chunk_overlap_ratio": 0.2,  # Better overlap for context
                "rag_ingest_concurrency": 4,  # More concurrency
                "rag_ingest_max_attempts": 3,  # Fewer retries for speed
                "rag_ingest_backoff_base_s": 0.1,  # Faster backoff
                "rag_query_rate_limit_per_minute": 120,  # Higher rate limits
                "rag_ingest_rate_limit_per_minute": 30,
                "rag_enable_bm25": True,  # Enable BM25 indexing
                "rag_enable_caching": True,  # Enable result caching
                "rag_cache_ttl": 3600,  # 1 hour cache TTL
            }

            logger.info("Initializing RAG service with optimized configuration...")
            self.rag_service = RAGService(rag_config)

            if not await self.rag_service.initialize():
                logger.error("Failed to initialize RAG service")
                return False

            logger.info("✅ RAG service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {e}")
            return False

    async def scan_and_prepare_documents(self) -> List[Dict[str, Any]]:
        """Scan the codebase and prepare documents for indexing."""
        documents = []

        logger.info(f"🔍 Scanning codebase at {self.root_path}")

        for file_path in self.root_path.rglob("*"):
            if not file_path.is_file():
                continue

            if self.should_skip_file(file_path):
                continue

            if not self.should_include_file(file_path):
                continue

            try:
                # Read file content
                content = file_path.read_text(encoding="utf-8", errors="ignore")

                # Skip empty files
                if not content.strip():
                    continue

                # Determine file type and language
                file_type = self._get_file_type(file_path)
                language = self._detect_language(file_path)

                # Create document with enhanced metadata
                doc = {
                    "file_id": str(file_path.relative_to(self.root_path)),
                    "path": str(file_path),
                    "relative_path": str(file_path.relative_to(self.root_path)),
                    "content": content,
                    "file_type": file_type,
                    "language": language,
                    "size": len(content),
                    "lines": len(content.splitlines()),
                    "metadata": {
                        "scanned_at": time.time(),
                        "file_size": file_path.stat().st_size,
                        "extension": file_path.suffix,
                        "parent_dir": str(file_path.parent.relative_to(self.root_path)),
                        "is_code": language != "generic",
                        "is_documentation": file_type in ["markdown", "text"],
                        "is_config": file_type in ["json", "yaml", "toml"],
                        "is_style": file_type in ["css", "scss", "sass", "less"],
                        "is_template": file_type in ["html", "vue", "svelte"],
                    },
                }

                documents.append(doc)

                if len(documents) % 100 == 0:
                    logger.info(f"Prepared {len(documents)} documents...")

            except Exception as e:
                logger.warning(f"Failed to read {file_path}: {e}")
                self.failed_files += 1
                continue

        logger.info(
            f"✅ Document preparation complete: {len(documents)} documents prepared, {self.failed_files} failed"
        )
        return documents

    async def preindex_documents(
        self, documents: List[Dict[str, Any]], batch_size: int = 50
    ) -> Dict[str, Any]:
        """Pre-index documents with comprehensive vectorization and caching."""
        logger.info(f"📚 Starting pre-indexing of {len(documents)} documents...")

        total_indexed = 0
        total_failed = 0
        total_chunks = 0

        # Process in optimized batches
        for i in range(0, len(documents), batch_size):
            batch = documents[i : i + batch_size]
            batch_num = i // batch_size + 1
            total_batches = (len(documents) + batch_size - 1) // batch_size

            logger.info(
                f"Processing batch {batch_num}/{total_batches} ({len(batch)} documents)"
            )

            try:
                # Index batch with progress tracking
                start_time = time.time()
                result = await self.rag_service.index_documents(batch)
                batch_time = time.time() - start_time

                if result.get("status") == "success":
                    total_indexed += len(batch)
                    batch_chunks = result.get("total_chunks", 0)
                    total_chunks += batch_chunks

                    logger.info(
                        f"✅ Batch {batch_num} indexed: {len(batch)} docs, {batch_chunks} chunks in {batch_time:.2f}s"
                    )
                else:
                    total_failed += len(batch)
                    logger.error(f"❌ Batch {batch_num} failed: {result}")

            except Exception as e:
                logger.error(f"❌ Batch {batch_num} error: {e}")
                total_failed += len(batch)

        # Generate comprehensive statistics
        stats = {
            "total_documents": len(documents),
            "indexed_documents": total_indexed,
            "failed_documents": total_failed,
            "total_chunks": total_chunks,
            "success_rate": (total_indexed / len(documents)) * 100 if documents else 0,
            "indexing_time": (
                time.time() - self.start_time if hasattr(self, "start_time") else 0
            ),
        }

        logger.info(f"🎉 Pre-indexing complete!")
        logger.info(
            f"📊 Stats: {total_indexed}/{len(documents)} docs indexed, {total_chunks} chunks, {stats['success_rate']:.1f}% success rate"
        )

        return stats

    async def build_search_indices(self) -> Dict[str, Any]:
        """Build optimized search indices for fast retrieval."""
        logger.info("🔍 Building search indices...")

        try:
            # Get system statistics
            stats = await self.rag_service.get_statistics()

            # Test search functionality
            test_queries = [
                "authentication system",
                "RAG service implementation",
                "document indexing",
                "vector database",
                "embedding generation",
                "API endpoints",
                "database models",
                "frontend components",
                "configuration management",
                "error handling",
            ]

            search_results = {}
            for query in test_queries:
                try:
                    results = await self.rag_service.search(query, limit=5)
                    search_results[query] = len(results)
                    logger.info(f"Query '{query}': {len(results)} results")
                except Exception as e:
                    logger.warning(f"Search test failed for '{query}': {e}")
                    search_results[query] = 0

            # Build BM25 index if available
            try:
                # This would trigger BM25 index building
                await self.rag_service.search("test bm25 index", search_type="hybrid")
                logger.info("✅ BM25 index built successfully")
            except Exception as e:
                logger.warning(f"BM25 index building failed: {e}")

            return {
                "search_tests": search_results,
                "system_stats": stats,
                "indices_built": True,
            }

        except Exception as e:
            logger.error(f"Failed to build search indices: {e}")
            return {"error": str(e)}

    def _get_file_type(self, file_path: Path) -> str:
        """Determine file type from extension."""
        ext = file_path.suffix.lower()

        type_map = {
            ".py": "python",
            ".ts": "typescript",
            ".tsx": "typescript",
            ".js": "javascript",
            ".jsx": "javascript",
            ".vue": "vue",
            ".svelte": "svelte",
            ".md": "markdown",
            ".txt": "text",
            ".json": "json",
            ".yaml": "yaml",
            ".yml": "yaml",
            ".toml": "toml",
            ".css": "css",
            ".scss": "scss",
            ".sass": "sass",
            ".less": "less",
            ".html": "html",
            ".xml": "xml",
            ".java": "java",
            ".cpp": "cpp",
            ".c": "c",
            ".h": "c",
            ".hpp": "cpp",
            ".cc": "cpp",
            ".cxx": "cpp",
            ".go": "go",
            ".rs": "rust",
            ".php": "php",
            ".rb": "ruby",
            ".swift": "swift",
            ".kt": "kotlin",
            ".scala": "scala",
        }

        return type_map.get(ext, "text")

    def _detect_language(self, file_path: Path) -> str:
        """Detect programming language from file path."""
        ext = file_path.suffix.lower()

        language_map = {
            ".py": "python",
            ".ts": "typescript",
            ".tsx": "typescript",
            ".js": "javascript",
            ".jsx": "javascript",
            ".vue": "javascript",
            ".svelte": "javascript",
            ".java": "java",
            ".cpp": "cpp",
            ".cc": "cpp",
            ".cxx": "cpp",
            ".c": "c",
            ".h": "c",
            ".hpp": "cpp",
            ".go": "go",
            ".rs": "rust",
            ".php": "php",
            ".rb": "ruby",
            ".swift": "swift",
            ".kt": "kotlin",
            ".scala": "scala",
        }

        return language_map.get(ext, "generic")

    async def run_comprehensive_preindexing(
        self, force: bool = False, batch_size: int = 50
    ) -> Dict[str, Any]:
        """Run comprehensive pre-indexing of the entire codebase."""
        self.start_time = time.time()

        try:
            # Initialize RAG service
            if not await self.initialize_rag_service():
                return {"error": "Failed to initialize RAG service"}

            # Check if already indexed (unless force)
            if not force:
                stats = await self.rag_service.get_statistics()
                if (
                    stats.get("core_services", {})
                    .get("document_indexer", {})
                    .get("metrics", {})
                    .get("processed", 0)
                    > 0
                ):
                    logger.info("Codebase already indexed. Use --force to re-index.")
                    return {"status": "already_indexed", "stats": stats}

            # Scan and prepare documents
            documents = await self.scan_and_prepare_documents()
            if not documents:
                return {"error": "No documents found to index"}

            # Pre-index documents
            indexing_stats = await self.preindex_documents(documents, batch_size)

            # Build search indices
            index_stats = await self.build_search_indices()

            # Final statistics
            final_stats = await self.rag_service.get_statistics()

            return {
                "status": "success",
                "indexing_stats": indexing_stats,
                "index_stats": index_stats,
                "final_stats": final_stats,
                "total_time": time.time() - self.start_time,
            }

        except Exception as e:
            logger.error(f"Pre-indexing failed: {e}")
            return {"error": str(e)}

        finally:
            # Cleanup
            if self.rag_service:
                await self.rag_service.shutdown()


async def main():
    """Main pre-indexing function."""
    parser = argparse.ArgumentParser(
        description="Pre-index Reynard codebase for fast RAG search"
    )
    parser.add_argument(
        "--force", action="store_true", help="Force re-indexing even if already indexed"
    )
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument(
        "--batch-size", type=int, default=50, help="Batch size for processing"
    )
    parser.add_argument(
        "--root", default="/home/kade/runeset/reynard", help="Root path to scan"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("🦊 Starting comprehensive Reynard codebase pre-indexing...")

    try:
        # Create pre-indexer
        preindexer = ReynardPreIndexer(args.root)

        # Run comprehensive pre-indexing
        result = await preindexer.run_comprehensive_preindexing(
            force=args.force, batch_size=args.batch_size
        )

        if result.get("status") == "success":
            logger.info("🎉 Comprehensive pre-indexing completed successfully!")
            logger.info(f"⏱️  Total time: {result.get('total_time', 0):.2f} seconds")

            # Save results to file
            results_file = Path(
                "/home/kade/runeset/reynard/backend/preindex_results.json"
            )
            with open(results_file, "w") as f:
                json.dump(result, f, indent=2, default=str)
            logger.info(f"📄 Results saved to {results_file}")

            return 0
        else:
            logger.error(
                f"❌ Pre-indexing failed: {result.get('error', 'Unknown error')}"
            )
            return 1

    except Exception as e:
        logger.error(f"❌ Pre-indexing failed: {e}")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
