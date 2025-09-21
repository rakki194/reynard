#!/usr/bin/env python3
"""
Debug Pre-Indexing Script

Simplified version that bypasses advanced services and focuses on core functionality.
"""

import argparse
import asyncio
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.rag.core import DocumentIndexer, EmbeddingService, VectorStoreService

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class SimplePreIndexer:
    """Simplified pre-indexer using only core services."""

    def __init__(self, root_path: str = "/home/kade/runeset/reynard"):
        self.root_path = Path(root_path)
        self.embedding_service = None
        self.vector_store_service = None
        self.document_indexer = None

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
            "third_party",
        }

    def should_skip_file(self, file_path: Path) -> bool:
        """Check if a file should be skipped."""
        # Check if any parent directory should be skipped
        for part in file_path.parts:
            if part in self.skip_dirs:
                return True

        # Skip very large files (>1MB)
        try:
            if file_path.stat().st_size > 1024 * 1024:
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

    async def initialize_services(self) -> bool:
        """Initialize only the core services."""
        try:
            # Simple configuration
            config = {
                "rag_enabled": True,
                "pg_dsn": "postgresql://postgres@localhost:5432/reynard_rag",
                "ollama_base_url": "http://localhost:11434",
                "rag_text_model": "nomic-embed-text",
                "rag_ingest_batch_size_text": 16,
                "rag_chunk_max_tokens": 512,
                "rag_chunk_min_tokens": 100,
                "rag_chunk_overlap_ratio": 0.15,
                "rag_ingest_concurrency": 2,
                "rag_ingest_max_attempts": 3,
                "rag_ingest_backoff_base_s": 0.1,
            }

            logger.info("Initializing core services...")

            # Initialize vector store service
            logger.info("Initializing VectorStoreService...")
            self.vector_store_service = VectorStoreService()
            if not await self.vector_store_service.initialize(config):
                logger.error("Failed to initialize VectorStoreService")
                return False
            logger.info("✅ VectorStoreService initialized")

            # Initialize embedding service
            logger.info("Initializing EmbeddingService...")
            self.embedding_service = EmbeddingService()
            if not await self.embedding_service.initialize(config):
                logger.error("Failed to initialize EmbeddingService")
                return False
            logger.info("✅ EmbeddingService initialized")

            # Initialize document indexer
            logger.info("Initializing DocumentIndexer...")
            self.document_indexer = DocumentIndexer()
            if not await self.document_indexer.initialize(
                config, self.vector_store_service, self.embedding_service
            ):
                logger.error("Failed to initialize DocumentIndexer")
                return False
            logger.info("✅ DocumentIndexer initialized")

            logger.info("🎉 All core services initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize services: {e}")
            return False

    async def scan_codebase(self) -> List[Dict[str, Any]]:
        """Scan the codebase and return file information."""
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

                # Create document
                doc = {
                    "file_id": str(file_path.relative_to(self.root_path)),
                    "path": str(file_path),
                    "relative_path": str(file_path.relative_to(self.root_path)),
                    "content": content,
                    "file_type": self._get_file_type(file_path),
                    "language": self._detect_language(file_path),
                    "size": len(content),
                    "metadata": {
                        "extension": file_path.suffix,
                        "parent_dir": str(file_path.parent.relative_to(self.root_path)),
                    },
                }

                documents.append(doc)

                if len(documents) % 50 == 0:
                    logger.info(f"Scanned {len(documents)} files...")

            except Exception as e:
                logger.warning(f"Failed to read {file_path}: {e}")
                continue

        logger.info(f"✅ Scan complete: {len(documents)} files found")
        return documents

    async def index_documents(
        self, documents: List[Dict[str, Any]], batch_size: int = 25
    ) -> Dict[str, Any]:
        """Index documents using the document indexer."""
        logger.info(f"📚 Starting indexing of {len(documents)} documents...")

        total_indexed = 0
        total_failed = 0

        # Process in batches
        for i in range(0, len(documents), batch_size):
            batch = documents[i : i + batch_size]
            batch_num = i // batch_size + 1
            total_batches = (len(documents) + batch_size - 1) // batch_size

            logger.info(
                f"Processing batch {batch_num}/{total_batches} ({len(batch)} documents)"
            )

            try:
                # Use the document indexer's index_documents method
                results = []
                async for result in self.document_indexer.index_documents(batch):
                    results.append(result)
                    if result.get("type") == "progress":
                        logger.info(
                            f"Progress: {result.get('message', 'Processing...')}"
                        )
                    elif result.get("type") == "complete":
                        logger.info(
                            f"✅ Batch {batch_num} completed: {result.get('message', '')}"
                        )
                        total_indexed += len(batch)
                    elif result.get("type") == "error":
                        logger.error(
                            f"❌ Batch {batch_num} error: {result.get('error', '')}"
                        )
                        total_failed += len(batch)

            except Exception as e:
                logger.error(f"❌ Batch {batch_num} failed: {e}")
                total_failed += len(batch)

        return {
            "total_documents": len(documents),
            "indexed_documents": total_indexed,
            "failed_documents": total_failed,
            "success_rate": (total_indexed / len(documents)) * 100 if documents else 0,
        }

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
        }

        return language_map.get(ext, "generic")

    async def run_preindexing(self, batch_size: int = 25) -> Dict[str, Any]:
        """Run the pre-indexing process."""
        start_time = asyncio.get_event_loop().time()

        try:
            # Initialize services
            if not await self.initialize_services():
                return {"error": "Failed to initialize services"}

            # Scan codebase
            documents = await self.scan_codebase()
            if not documents:
                return {"error": "No documents found to index"}

            # Index documents
            indexing_stats = await self.index_documents(documents, batch_size)

            # Get final stats
            final_stats = await self.document_indexer.get_stats()

            return {
                "status": "success",
                "indexing_stats": indexing_stats,
                "final_stats": final_stats,
                "total_time": asyncio.get_event_loop().time() - start_time,
            }

        except Exception as e:
            logger.error(f"Pre-indexing failed: {e}")
            return {"error": str(e)}

        finally:
            # Cleanup
            if self.document_indexer:
                await self.document_indexer.shutdown()
            if self.vector_store_service:
                await self.vector_store_service.shutdown()
            if self.embedding_service:
                await self.embedding_service.shutdown()


async def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description="Debug pre-indexing of Reynard codebase"
    )
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument(
        "--batch-size", type=int, default=25, help="Batch size for processing"
    )
    parser.add_argument(
        "--root", default="/home/kade/runeset/reynard", help="Root path to scan"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("🦊 Starting debug pre-indexing...")

    try:
        # Create pre-indexer
        preindexer = SimplePreIndexer(args.root)

        # Run pre-indexing
        result = await preindexer.run_preindexing(batch_size=args.batch_size)

        if result.get("status") == "success":
            logger.info("🎉 Debug pre-indexing completed successfully!")
            logger.info(f"⏱️  Total time: {result.get('total_time', 0):.2f} seconds")
            logger.info(f"📊 Stats: {result.get('indexing_stats', {})}")
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
