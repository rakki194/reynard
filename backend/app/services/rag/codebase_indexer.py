"""
Codebase Indexer: Index the Reynard codebase for semantic search.

This service scans the Reynard monorepo and creates embeddings for:
- TypeScript/JavaScript files
- Python files
- Documentation files
- Configuration files
"""

import asyncio
import hashlib
import logging
import os
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

logger = logging.getLogger("uvicorn")


class CodebaseIndexer:
    """Service for indexing the Reynard codebase into the vector database."""

    def __init__(self):
        self._engine: Optional[Engine] = None
        self._enabled: bool = False
        self._dataset_id: Optional[str] = None
        self._codebase_root: str = "/home/kade/runeset/reynard"
        
        # File patterns to include/exclude
        self._include_patterns = [
            "*.ts", "*.tsx", "*.js", "*.jsx", "*.py", "*.md", "*.json", "*.yaml", "*.yml"
        ]
        self._exclude_patterns = [
            "node_modules", ".git", "dist", "build", "__pycache__", ".venv", "venv",
            "*.test.ts", "*.test.js", "*.spec.ts", "*.spec.js", "*.d.ts"
        ]

    async def initialize(self, config: Dict[str, Any]) -> bool:
        """Initialize the codebase indexer."""
        try:
            self._enabled = config.get("rag_enabled", False)
            dsn = config.get("pg_dsn")

            if not self._enabled:
                logger.info("CodebaseIndexer disabled by config")
                return True

            if not dsn:
                logger.warning("CodebaseIndexer enabled but PG DSN not provided")
                return False

            # Create engine
            self._engine = create_engine(dsn, echo=False, future=True, pool_pre_ping=True)

            # Verify connection and get dataset ID
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                
                # Get the reynard-codebase dataset ID
                result = conn.execute(text("""
                    SELECT id FROM datasets 
                    WHERE name = 'reynard-codebase' AND version = '1.0.0'
                """)).fetchone()
                
                if result:
                    self._dataset_id = str(result[0])
                    logger.info(f"Found dataset ID: {self._dataset_id}")
                else:
                    logger.error("reynard-codebase dataset not found")
                    return False

            logger.info("CodebaseIndexer initialized successfully")
            return True

        except Exception as e:
            logger.error(f"CodebaseIndexer initialization failed: {e}")
            return False

    def _should_include_file(self, file_path: Path) -> bool:
        """Check if a file should be included in indexing."""
        # Check exclude patterns
        for pattern in self._exclude_patterns:
            if pattern.startswith("*."):
                if file_path.suffix == pattern[1:]:
                    return False
            elif pattern in str(file_path):
                return False

        # Check include patterns
        for pattern in self._include_patterns:
            if pattern.startswith("*."):
                if file_path.suffix == pattern[1:]:
                    return True
            elif file_path.name == pattern:
                return True

        return False

    def _get_file_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Extract metadata from a file."""
        try:
            stat = file_path.stat()
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            
            # Determine file type and modality
            if file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                file_type = file_path.suffix[1:]
                modality = 'code'
            elif file_path.suffix == '.py':
                file_type = 'python'
                modality = 'code'
            elif file_path.suffix == '.md':
                file_type = 'markdown'
                modality = 'text'
            elif file_path.suffix in ['.json', '.yaml', '.yml']:
                file_type = file_path.suffix[1:]
                modality = 'data'
            else:
                file_type = file_path.suffix[1:] if file_path.suffix else 'unknown'
                modality = 'text'

            return {
                'path': str(file_path.relative_to(Path(self._codebase_root))),
                'file_type': file_type,
                'modality': modality,
                'size': stat.st_size,
                'hash': hashlib.sha256(content.encode()).hexdigest(),
                'mime_type': self._get_mime_type(file_path.suffix),
                'metadata': {
                    'package': self._get_package_name(file_path),
                    'is_test': 'test' in file_path.name.lower(),
                    'is_config': file_path.name in ['package.json', 'tsconfig.json', 'pyproject.toml', 'requirements.txt'],
                    'lines': len(content.splitlines()),
                    'last_modified': stat.st_mtime
                },
                'content': content
            }
        except Exception as e:
            logger.error(f"Failed to read file {file_path}: {e}")
            return None

    def _get_mime_type(self, suffix: str) -> str:
        """Get MIME type for file extension."""
        mime_types = {
            '.ts': 'text/typescript',
            '.tsx': 'text/typescript',
            '.js': 'text/javascript',
            '.jsx': 'text/javascript',
            '.py': 'text/x-python',
            '.md': 'text/markdown',
            '.json': 'application/json',
            '.yaml': 'text/yaml',
            '.yml': 'text/yaml'
        }
        return mime_types.get(suffix, 'text/plain')

    def _get_package_name(self, file_path: Path) -> str:
        """Extract package name from file path."""
        parts = file_path.parts
        if 'packages' in parts:
            packages_idx = parts.index('packages')
            if packages_idx + 1 < len(parts):
                return parts[packages_idx + 1]
        return 'root'

    async def scan_codebase(self) -> AsyncGenerator[Dict[str, Any], None]:
        """Scan the codebase and yield file information."""
        if not self._enabled:
            yield {"type": "error", "error": "CodebaseIndexer not enabled"}
            return

        try:
            codebase_path = Path(self._codebase_root)
            if not codebase_path.exists():
                yield {"type": "error", "error": f"Codebase path not found: {self._codebase_root}"}
                return

            total_files = 0
            processed_files = 0

            # Count total files first
            for file_path in codebase_path.rglob("*"):
                if file_path.is_file() and self._should_include_file(file_path):
                    total_files += 1

            yield {"type": "progress", "message": f"Found {total_files} files to index"}

            # Process files
            for file_path in codebase_path.rglob("*"):
                if file_path.is_file() and self._should_include_file(file_path):
                    metadata = self._get_file_metadata(file_path)
                    if metadata:
                        processed_files += 1
                        yield {
                            "type": "file",
                            "data": metadata,
                            "progress": {"processed": processed_files, "total": total_files}
                        }

            yield {"type": "complete", "message": f"Scanned {processed_files} files"}

        except Exception as e:
            logger.error(f"Failed to scan codebase: {e}")
            yield {"type": "error", "error": str(e)}

    async def index_file(self, file_data: Dict[str, Any]) -> bool:
        """Index a single file into the database."""
        if not self._engine or not self._dataset_id:
            return False

        try:
            with self._engine.connect() as conn:
                # Insert or update file record
                result = conn.execute(text("""
                    INSERT INTO files (
                        dataset_id, path, file_type, modality, size, hash, mime_type,
                        metadata, title, description, language, encoding, word_count,
                        last_modified, checksum
                    ) VALUES (
                        :dataset_id, :path, :file_type, :modality, :size, :hash, :mime_type,
                        :metadata, :title, :description, :language, :encoding, :word_count,
                        :last_modified, :checksum
                    )
                    ON CONFLICT (dataset_id, path) DO UPDATE SET
                        size = EXCLUDED.size,
                        hash = EXCLUDED.hash,
                        mime_type = EXCLUDED.mime_type,
                        metadata = EXCLUDED.metadata,
                        word_count = EXCLUDED.word_count,
                        last_modified = EXCLUDED.last_modified,
                        checksum = EXCLUDED.checksum,
                        updated_at = NOW()
                    RETURNING id
                """), {
                    'dataset_id': self._dataset_id,
                    'path': file_data['path'],
                    'file_type': file_data['file_type'],
                    'modality': file_data['modality'],
                    'size': file_data['size'],
                    'hash': file_data['hash'],
                    'mime_type': file_data['mime_type'],
                    'metadata': file_data['metadata'],
                    'title': file_data['path'].split('/')[-1],
                    'description': f"Code file from {file_data['metadata']['package']} package",
                    'language': file_data['file_type'],
                    'encoding': 'utf-8',
                    'word_count': file_data['metadata']['lines'],
                    'last_modified': file_data['metadata']['last_modified'],
                    'checksum': file_data['hash']
                })

                file_id = result.fetchone()[0]
                logger.debug(f"Indexed file: {file_data['path']} (ID: {file_id})")
                return True

        except Exception as e:
            logger.error(f"Failed to index file {file_data['path']}: {e}")
            return False

    async def index_codebase(self) -> AsyncGenerator[Dict[str, Any], None]:
        """Index the entire codebase."""
        if not self._enabled:
            yield {"type": "error", "error": "CodebaseIndexer not enabled"}
            return

        try:
            indexed_count = 0
            failed_count = 0

            async for item in self.scan_codebase():
                if item["type"] == "file":
                    success = await self.index_file(item["data"])
                    if success:
                        indexed_count += 1
                    else:
                        failed_count += 1

                    yield {
                        "type": "progress",
                        "indexed": indexed_count,
                        "failed": failed_count,
                        "message": f"Indexed {indexed_count} files, {failed_count} failed"
                    }
                else:
                    yield item

            yield {
                "type": "complete",
                "indexed": indexed_count,
                "failed": failed_count,
                "message": f"Indexing complete: {indexed_count} files indexed, {failed_count} failed"
            }

        except Exception as e:
            logger.error(f"Failed to index codebase: {e}")
            yield {"type": "error", "error": str(e)}

    async def get_stats(self) -> Dict[str, Any]:
        """Get indexing statistics."""
        if not self._engine or not self._dataset_id:
            return {"error": "CodebaseIndexer not initialized"}

        try:
            with self._engine.connect() as conn:
                # Get file counts by type
                result = conn.execute(text("""
                    SELECT file_type, COUNT(*) as count
                    FROM files
                    WHERE dataset_id = :dataset_id
                    GROUP BY file_type
                    ORDER BY count DESC
                """), {'dataset_id': self._dataset_id})

                file_types = {row[0]: row[1] for row in result}

                # Get total files
                total_result = conn.execute(text("""
                    SELECT COUNT(*) FROM files WHERE dataset_id = :dataset_id
                """), {'dataset_id': self._dataset_id})
                total_files = total_result.fetchone()[0]

                return {
                    "dataset_id": self._dataset_id,
                    "total_files": total_files,
                    "file_types": file_types,
                    "codebase_root": self._codebase_root,
                    "enabled": self._enabled
                }

        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {"error": str(e)}

    async def health_check(self) -> bool:
        """Perform health check."""
        if not self._enabled:
            return True

        try:
            if not self._engine:
                return False

            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True

        except Exception as e:
            logger.warning(f"CodebaseIndexer health check failed: {e}")
            return False

    async def shutdown(self):
        """Shutdown the service."""
        if self._engine:
            self._engine.dispose()
            self._engine = None
        logger.info("CodebaseIndexer shutdown complete")
