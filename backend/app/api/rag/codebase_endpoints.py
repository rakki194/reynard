"""Codebase indexing API endpoints.

Provides endpoints for:
- Indexing the Reynard codebase
- Getting indexing statistics
- Health checks
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from .service import get_rag_service

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/codebase", tags=["codebase"])

# Use the existing RAG service from the API module


@router.post("/index")
async def index_codebase(rag_service=Depends(get_rag_service)) -> StreamingResponse:
    """Index the Reynard codebase for semantic search."""
    try:

        async def generate():
            import json
            import os
            from pathlib import Path

            # Get configuration from environment
            reynard_root = Path(
                os.getenv(
                    "RAG_CONTINUOUS_INDEXING_WATCH_ROOT", "/home/kade/runeset/reynard",
                ),
            )
            batch_size = int(os.getenv("RAG_CONTINUOUS_INDEXING_BATCH_SIZE", "50"))
            max_file_size_mb = int(
                os.getenv("RAG_CONTINUOUS_INDEXING_MAX_FILE_SIZE_MB", "2"),
            )

            # Directories to skip
            skip_dirs = {
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
            }

            # File patterns to skip
            skip_files = {
                "*.pyc",
                "*.pyo",
                "*.pyd",
                "*.so",
                "*.dll",
                "*.exe",
                "*.log",
                "*.tmp",
                "*.temp",
                "*.swp",
                "*.swo",
                "*~",
                "*.min.js",
                "*.min.css",
                "*.map",
                "*.lock",
                "package-lock.json",
                "yarn.lock",
                "pnpm-lock.yaml",
                "*.sqlite",
                "*.db",
            }

            # File types to include
            include_extensions = {
                ".py",
                ".ts",
                ".tsx",
                ".js",
                ".jsx",
                ".vue",
                ".svelte",
                ".md",
                ".rst",
                ".txt",
                ".json",
                ".yaml",
                ".yml",
                ".toml",
                ".css",
                ".scss",
                ".sass",
                ".less",
                ".html",
                ".xml",
                ".sql",
                ".sh",
                ".bash",
                ".zsh",
                ".fish",
                ".ps1",
                ".go",
                ".rs",
                ".java",
                ".cpp",
                ".c",
                ".h",
                ".hpp",
                ".php",
                ".rb",
                ".swift",
                ".kt",
                ".scala",
                ".clj",
            }

            def should_skip_file(file_path: Path) -> bool:
                """Check if a file should be skipped."""
                # Check if any parent directory should be skipped
                for part in file_path.parts:
                    if part in skip_dirs:
                        return True

                # Check file patterns
                for pattern in skip_files:
                    if file_path.match(pattern):
                        return True

                # Skip very large files (configurable)
                try:
                    if file_path.stat().st_size > max_file_size_mb * 1024 * 1024:
                        return True
                except OSError:
                    return True

                return False

            def should_include_file(file_path: Path) -> bool:
                """Check if a file should be included."""
                return file_path.suffix.lower() in include_extensions

            # Scan the codebase
            yield f"data: {json.dumps({'type': 'info', 'message': '🔍 Scanning Reynard codebase...'})}\n\n"

            documents = []
            skipped_count = 0

            for file_path in reynard_root.rglob("*"):
                if not file_path.is_file():
                    continue

                if should_skip_file(file_path):
                    skipped_count += 1
                    continue

                if not should_include_file(file_path):
                    skipped_count += 1
                    continue

                try:
                    # Read file content
                    content = file_path.read_text(encoding="utf-8", errors="ignore")

                    # Create document
                    doc = {
                        "id": str(file_path.relative_to(reynard_root)),
                        "content": content,
                        "metadata": {
                            "source": str(file_path.relative_to(reynard_root)),
                            "file_type": file_path.suffix.lower(),
                            "size": len(content),
                            "lines": len(content.splitlines()),
                            "language": file_path.suffix.lower().lstrip("."),
                        },
                    }
                    documents.append(doc)

                    if len(documents) % 100 == 0:
                        yield f"data: {json.dumps({'type': 'progress', 'scanned': len(documents), 'skipped': skipped_count})}\n\n"

                except Exception as e:
                    logger.warning(f"Failed to read {file_path}: {e}")
                    skipped_count += 1

            yield f"data: {json.dumps({'type': 'info', 'message': f'📊 Found {len(documents)} files to index, skipped {skipped_count} files'})}\n\n"

            # Index documents in batches
            total_batches = (len(documents) + batch_size - 1) // batch_size

            for i in range(0, len(documents), batch_size):
                batch = documents[i : i + batch_size]
                batch_num = (i // batch_size) + 1

                yield f"data: {json.dumps({'type': 'progress', 'message': f'📝 Indexing batch {batch_num}/{total_batches} ({len(batch)} files)'})}\n\n"

                try:
                    result = await rag_service.index_documents(batch)
                    yield f"data: {json.dumps({'type': 'success', 'batch': batch_num, 'result': result})}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'type': 'error', 'batch': batch_num, 'error': str(e)})}\n\n"
                    logger.error(f"Failed to index batch {batch_num}: {e}")

            yield f"data: {json.dumps({'type': 'complete', 'message': f'✅ Codebase indexing completed! Indexed {len(documents)} files'})}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )

    except Exception as e:
        logger.error(f"Failed to index codebase: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_codebase_stats(rag_service=Depends(get_rag_service)) -> dict[str, Any]:
    """Get codebase indexing statistics."""
    try:
        stats = await rag_service.get_statistics()
        return stats

    except Exception as e:
        logger.error(f"Failed to get codebase stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check(rag_service=Depends(get_rag_service)) -> dict[str, Any]:
    """Check RAG service health."""
    try:
        # Simple health check - just verify the service is initialized
        if hasattr(rag_service, "_initialized") and rag_service._initialized:
            return {"healthy": True, "service": "rag_service", "status": "initialized"}
        return {
            "healthy": False,
            "service": "rag_service",
            "status": "not_initialized",
        }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"healthy": False, "service": "rag_service", "error": str(e)}


@router.post("/scan")
async def scan_codebase(rag_service=Depends(get_rag_service)) -> StreamingResponse:
    """Scan the codebase and return file information."""
    try:

        async def generate():
            import json
            import os
            from collections import defaultdict
            from pathlib import Path

            # Get configuration from environment
            reynard_root = Path(
                os.getenv(
                    "RAG_CONTINUOUS_INDEXING_WATCH_ROOT", "/home/kade/runeset/reynard",
                ),
            )
            batch_size = int(os.getenv("RAG_CONTINUOUS_INDEXING_BATCH_SIZE", "50"))
            max_file_size_mb = int(
                os.getenv("RAG_CONTINUOUS_INDEXING_MAX_FILE_SIZE_MB", "2"),
            )

            # Directories to skip
            skip_dirs = {
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
            }

            # File patterns to skip
            skip_files = {
                "*.pyc",
                "*.pyo",
                "*.pyd",
                "*.so",
                "*.dll",
                "*.exe",
                "*.log",
                "*.tmp",
                "*.temp",
                "*.swp",
                "*.swo",
                "*~",
                "*.min.js",
                "*.min.css",
                "*.map",
                "*.lock",
                "package-lock.json",
                "yarn.lock",
                "pnpm-lock.yaml",
                "*.sqlite",
                "*.db",
            }

            # File types to include
            include_extensions = {
                ".py",
                ".ts",
                ".tsx",
                ".js",
                ".jsx",
                ".vue",
                ".svelte",
                ".md",
                ".rst",
                ".txt",
                ".json",
                ".yaml",
                ".yml",
                ".toml",
                ".css",
                ".scss",
                ".sass",
                ".less",
                ".html",
                ".xml",
                ".sql",
                ".sh",
                ".bash",
                ".zsh",
                ".fish",
                ".ps1",
                ".go",
                ".rs",
                ".java",
                ".cpp",
                ".c",
                ".h",
                ".hpp",
                ".php",
                ".rb",
                ".swift",
                ".kt",
                ".scala",
                ".clj",
            }

            def should_skip_file(file_path: Path) -> bool:
                """Check if a file should be skipped."""
                # Check if any parent directory should be skipped
                for part in file_path.parts:
                    if part in skip_dirs:
                        return True

                # Check file patterns
                for pattern in skip_files:
                    if file_path.match(pattern):
                        return True

                # Skip very large files (configurable)
                try:
                    if file_path.stat().st_size > max_file_size_mb * 1024 * 1024:
                        return True
                except OSError:
                    return True

                return False

            def should_include_file(file_path: Path) -> bool:
                """Check if a file should be included."""
                return file_path.suffix.lower() in include_extensions

            # Scan the codebase
            yield f"data: {json.dumps({'type': 'info', 'message': '🔍 Scanning Reynard codebase...'})}\n\n"

            file_stats = defaultdict(int)
            total_size = 0
            total_lines = 0
            scanned_count = 0
            skipped_count = 0

            for file_path in reynard_root.rglob("*"):
                if not file_path.is_file():
                    continue

                if should_skip_file(file_path):
                    skipped_count += 1
                    continue

                if not should_include_file(file_path):
                    skipped_count += 1
                    continue

                try:
                    # Get file stats
                    file_size = file_path.stat().st_size
                    total_size += file_size

                    # Count lines
                    try:
                        with open(
                            file_path, encoding="utf-8", errors="ignore",
                        ) as f:
                            lines = sum(1 for _ in f)
                            total_lines += lines
                    except:
                        lines = 0

                    # Count by extension
                    ext = file_path.suffix.lower()
                    if ext:
                        file_stats[ext] += 1
                    else:
                        file_stats["no_extension"] += 1

                    scanned_count += 1

                    if scanned_count % 1000 == 0:
                        yield f"data: {json.dumps({'type': 'progress', 'scanned': scanned_count, 'skipped': skipped_count})}\n\n"

                except Exception as e:
                    logger.warning(f"Failed to scan {file_path}: {e}")
                    skipped_count += 1

            # Generate summary
            summary = {
                "total_files": scanned_count,
                "skipped_files": skipped_count,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "total_lines": total_lines,
                "file_types": dict(
                    sorted(file_stats.items(), key=lambda x: x[1], reverse=True),
                ),
            }

            yield f"data: {json.dumps({'type': 'summary', 'data': summary})}\n\n"
            yield f"data: {json.dumps({'type': 'complete', 'message': f'✅ Codebase scan completed! Found {scanned_count} files'})}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )

    except Exception as e:
        logger.error(f"Failed to scan codebase: {e}")
        raise HTTPException(status_code=500, detail=str(e))
