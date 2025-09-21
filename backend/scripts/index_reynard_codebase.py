#!/usr/bin/env python3
"""
Reynard Codebase Indexing Script

This script indexes the entire Reynard codebase into the RAG system for semantic search.
It uses the existing RAG infrastructure to scan, chunk, and index all source files.

Usage:
    python scripts/index_reynard_codebase.py [--scan-only] [--force] [--verbose]
"""

import argparse
import asyncio
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.rag import RAGService

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ReynardCodebaseScanner:
    """Scanner for the Reynard codebase."""

    def __init__(self, root_path: str = "/home/kade/runeset/reynard"):
        self.root_path = Path(root_path)
        self.scanned_files = 0
        self.skipped_files = 0

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
            ".cursorrules",
            "third_party",
            "e2e/node_modules",
            "examples/node_modules",
            "templates/node_modules",
            "packages/*/node_modules",
            "packages/*/dist",
            "packages/*/build",
            "packages/*/coverage",
            "packages/*/.nyc_output",
            "packages/*/venv",
            "packages/*/env",
            "packages/*/logs",
            "packages/*/tmp",
            "packages/*/temp",
            "packages/*/.pytest_cache",
            "packages/*/.mypy_cache",
            "packages/*/.tox",
            "packages/*/htmlcov",
            "packages/*/reynard_backend.egg-info",
            "packages/*/alembic/versions",
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
        }

    def should_skip_file(self, file_path: Path) -> bool:
        """Check if a file should be skipped."""
        # Check if any parent directory should be skipped
        for part in file_path.parts:
            if part in self.skip_dirs:
                return True

        # Check for common dev directories in path
        path_str = str(file_path)
        if any(
            dev_dir in path_str
            for dev_dir in [
                "/node_modules/",
                "/__pycache__/",
                "/.git/",
                "/.vscode/",
                "/.idea/",
                "/dist/",
                "/build/",
                "/target/",
                "/coverage/",
                "/.nyc_output/",
                "/venv/",
                "/env/",
                "/logs/",
                "/tmp/",
                "/temp/",
                "/.pytest_cache/",
                "/.mypy_cache/",
                "/.tox/",
                "/htmlcov/",
                "/third_party/",
                "/.cursor/",
                "/e2e/node_modules/",
                "/examples/node_modules/",
                "/templates/node_modules/",
            ]
        ):
            return True

        # Check file patterns
        for pattern in self.skip_files:
            if file_path.match(pattern):
                return True

        # Skip very large files (>1MB)
        try:
            if file_path.stat().st_size > 1024 * 1024:
                return True
        except OSError:
            return True

        # Skip files with no content
        try:
            if file_path.stat().st_size == 0:
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

    async def scan_codebase(self) -> List[Dict[str, Any]]:
        """Scan the entire codebase and return file information."""
        documents = []

        logger.info(f"🔍 Scanning codebase at {self.root_path}")
        logger.info(
            "📁 Focusing on source code directories: packages/, backend/, services/, examples/, templates/"
        )

        # Focus on specific directories that contain source code
        source_dirs = [
            "packages",
            "backend",
            "services",
            "examples",
            "templates",
            "docs",
        ]

        for source_dir in source_dirs:
            dir_path = self.root_path / source_dir
            if not dir_path.exists():
                logger.info(f"⚠️  Directory {source_dir} not found, skipping")
                continue

            logger.info(f"📂 Scanning {source_dir}/ directory...")

            for file_path in dir_path.rglob("*"):
                if not file_path.is_file():
                    continue

                if self.should_skip_file(file_path):
                    self.skipped_files += 1
                    if self.skipped_files % 1000 == 0:
                        logger.debug(f"Skipped {self.skipped_files} files...")
                    continue

                if not self.should_include_file(file_path):
                    self.skipped_files += 1
                    continue

                try:
                    # Read file content
                    content = file_path.read_text(encoding="utf-8", errors="ignore")

                    # Determine file type
                    file_type = self._get_file_type(file_path)

                    # Create document
                    doc = {
                        "file_id": str(file_path.relative_to(self.root_path)),
                        "path": str(file_path),
                        "relative_path": str(file_path.relative_to(self.root_path)),
                        "content": content,
                        "file_type": file_type,
                        "size": len(content),
                        "language": self._detect_language(file_path),
                        "metadata": {
                            "scanned_at": asyncio.get_event_loop().time(),
                            "file_size": file_path.stat().st_size,
                            "extension": file_path.suffix,
                            "parent_dir": str(
                                file_path.parent.relative_to(self.root_path)
                            ),
                        },
                    }

                    documents.append(doc)
                    self.scanned_files += 1

                    if self.scanned_files % 50 == 0:
                        logger.info(f"📄 Scanned {self.scanned_files} source files...")

                except Exception as e:
                    logger.warning(f"Failed to read {file_path}: {e}")
                    self.skipped_files += 1
                    continue

        logger.info(
            f"✅ Scan complete: {self.scanned_files} source files scanned, {self.skipped_files} files skipped"
        )
        return documents

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


async def main():
    """Main indexing function."""
    parser = argparse.ArgumentParser(description="Index Reynard codebase for RAG")
    parser.add_argument(
        "--scan-only", action="store_true", help="Only scan, don't index"
    )
    parser.add_argument("--force", action="store_true", help="Force re-indexing")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument(
        "--root", default="/home/kade/runeset/reynard", help="Root path to scan"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("🦊 Starting Reynard codebase indexing...")

    try:
        # RAG configuration - Using Ollama with embeddinggemma
        rag_config = {
            "rag_enabled": True,
            "pg_dsn": "postgresql://postgres:password@localhost:5432/reynard",
            "ollama_base_url": "http://localhost:11434",
            # Force Ollama as primary embedding backend
            "embedding_backends_enabled": True,
            "embedding_default_backend": "ollama",
            "embedding_ollama_enabled": True,
            "embedding_ollama_default_model": "embeddinggemma:latest",
            "embedding_sentence_transformers_enabled": False,  # Disable fallback
            "embedding_mock_mode": False,
            # RAG processing settings
            "rag_ingest_batch_size_text": 16,
            "rag_chunk_max_tokens": 512,
            "rag_chunk_min_tokens": 100,
            "rag_chunk_overlap_ratio": 0.15,
            "rag_ingest_concurrency": 2,
            "rag_ingest_max_attempts": 5,
            "rag_ingest_backoff_base_s": 0.5,
            "rag_query_rate_limit_per_minute": 60,
            "rag_ingest_rate_limit_per_minute": 10,
        }

        # Initialize RAG service
        logger.info("Initializing RAG service...")
        logger.info("🔧 Configuration: Using Ollama with embeddinggemma:latest")
        rag_service = RAGService(rag_config)

        if not await rag_service.initialize():
            logger.error("Failed to initialize RAG service")
            return 1

        logger.info("✅ RAG service initialized successfully")

        # Verify embedding backend configuration
        try:
            embedding_service = rag_service.embedding_service
            if hasattr(embedding_service, "get_stats"):
                stats = embedding_service.get_stats()
                logger.info(f"🔍 Embedding service stats: {stats}")
        except Exception as e:
            logger.warning(f"Could not get embedding service stats: {e}")

        # Initialize codebase scanner
        scanner = ReynardCodebaseScanner(args.root)

        # Scan codebase
        logger.info("🔍 Scanning Reynard codebase...")
        documents = await scanner.scan_codebase()

        logger.info(
            f"📊 Scan results: {scanner.scanned_files} files found, {scanner.skipped_files} skipped"
        )

        if args.scan_only:
            logger.info("🔍 Scan-only mode - not indexing")

            # Count by file type
            type_counts = {}
            for doc in documents:
                file_type = doc["file_type"]
                type_counts[file_type] = type_counts.get(file_type, 0) + 1

            logger.info("📁 File breakdown by type:")
            for file_type, count in sorted(type_counts.items()):
                logger.info(f"  - {file_type}: {count} files")

            # Show sample of found files
            logger.info("\n📄 Sample of found files:")
            for i, doc in enumerate(documents[:10]):
                logger.info(
                    f"  {i+1}. {doc['relative_path']} ({doc['file_type']}, {doc['size']} chars)"
                )

            if len(documents) > 10:
                logger.info(f"  ... and {len(documents) - 10} more files")

            return 0

        # Index documents
        logger.info("📚 Indexing documents...")

        # Process in batches
        batch_size = 50
        total_indexed = 0
        total_failed = 0

        for i in range(0, len(documents), batch_size):
            batch = documents[i : i + batch_size]
            logger.info(
                f"Processing batch {i//batch_size + 1}/{(len(documents) + batch_size - 1)//batch_size}"
            )

            try:
                result = await rag_service.index_documents(batch)

                if result.get("status") == "success":
                    total_indexed += len(batch)
                    logger.info(
                        f"✅ Batch indexed successfully: {len(batch)} documents"
                    )
                else:
                    total_failed += len(batch)
                    logger.error(f"❌ Batch indexing failed: {result}")

            except Exception as e:
                logger.error(f"❌ Batch indexing error: {e}")
                total_failed += len(batch)

        logger.info(
            f"🎉 Indexing complete! Indexed: {total_indexed}, Failed: {total_failed}"
        )

        # Get final stats
        stats = await rag_service.get_statistics()
        logger.info(f"📊 Final RAG service stats: {stats}")

        # Test search functionality
        logger.info("🧪 Testing search functionality...")
        try:
            test_queries = [
                "authentication system",
                "RAG service implementation",
                "document indexing",
                "vector database",
                "embedding generation",
            ]

            for query in test_queries:
                results = await rag_service.search(query, limit=3)
                logger.info(f"Query '{query}': {len(results)} results")

        except Exception as e:
            logger.warning(f"Search test failed: {e}")

        logger.info("🦊 Reynard codebase indexing completed successfully!")
        return 0

    except Exception as e:
        logger.error(f"❌ Indexing failed: {e}")
        return 1

    finally:
        # Cleanup
        try:
            if "rag_service" in locals():
                await rag_service.shutdown()
        except Exception as e:
            logger.warning(f"Cleanup error: {e}")


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
