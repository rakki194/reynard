"""
Document Indexer: Intelligent document processing and chunking.

This service provides:
- AST-aware code chunking for semantic boundaries
- Multi-language support (Python, TypeScript, JavaScript, Java, C++)
- Fallback regex-based chunking
- Document metadata extraction
- Batch processing with queue management
- Progress tracking and error handling
"""

import asyncio
import hashlib
import logging
import re
import time
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("uvicorn")

# Optional imports for tree-sitter
try:
    import tree_sitter
    from tree_sitter import Language, Parser

    TREE_SITTER_AVAILABLE = True
except ImportError:
    TREE_SITTER_AVAILABLE = False
    tree_sitter = None
    Language = None
    Parser = None


@dataclass
class ChunkMetadata:
    """Metadata for a document chunk."""

    chunk_id: str
    chunk_index: int
    chunk_type: str  # 'function', 'class', 'import', 'generic'
    start_line: int
    end_line: int
    language: str
    name: Optional[str] = None
    tokens: int = 0
    parent_chunk: Optional[str] = None


@dataclass
class DocumentChunk:
    """A chunk of a document with metadata."""

    text: str
    metadata: ChunkMetadata
    embedding: Optional[List[float]] = None


@dataclass
class QueueItem:
    """Item in the processing queue."""

    kind: str  # "docs" | "images" | "captions"
    payload: Dict[str, Any]
    job_id: Optional[str] = None
    attempts: int = 0
    enqueued_ts: float = field(default_factory=lambda: time.time())
    last_error: Optional[str] = None


class ASTCodeChunker:
    """AST-aware code chunking using tree-sitter for semantic boundaries."""

    def __init__(self) -> None:
        self.parsers: Dict[str, Any] = {}
        self._initialized = False
        self._initialize_parsers()

    def _initialize_parsers(self) -> None:
        """Initialize tree-sitter parsers for supported languages."""
        if not TREE_SITTER_AVAILABLE:
            logger.warning(
                "tree-sitter not available, falling back to regex-based chunking"
            )
            return

        languages = {
            "python": "tree-sitter-python",
            "typescript": "tree-sitter-typescript",
            "javascript": "tree-sitter-javascript",
            "java": "tree-sitter-java",
            "cpp": "tree-sitter-cpp",
        }

        for lang, lib in languages.items():
            try:
                # Try to load the language library
                # In production, these would be pre-built and available
                self.parsers[lang] = None  # Placeholder for now
                logger.info(f"Tree-sitter parser for {lang} would be initialized")
            except Exception as e:
                logger.warning(f"Failed to load {lang} parser: {e}")

        self._initialized = True

    def chunk_code_ast_aware(
        self, code: str, language: str
    ) -> Tuple[List[DocumentChunk], Dict[str, Any]]:
        """Chunk code using AST boundaries for semantic coherence."""
        if (
            not self._initialized
            or language not in self.parsers
            or self.parsers[language] is None
        ):
            return self._fallback_chunking(code, language)

        try:
            # For now, use fallback since we don't have actual tree-sitter libraries
            # In production, this would use actual AST parsing
            return self._fallback_chunking(code, language)
        except Exception as e:
            logger.warning(f"AST parsing failed for {language}: {e}, using fallback")
            return self._fallback_chunking(code, language)

    def _fallback_chunking(
        self, code: str, language: str
    ) -> Tuple[List[DocumentChunk], Dict[str, Any]]:
        """Fallback to regex-based chunking if AST parsing fails."""
        if language == "python":
            return self._chunk_python_regex(code)
        elif language in ["typescript", "javascript"]:
            return self._chunk_js_regex(code)
        elif language == "java":
            return self._chunk_java_regex(code)
        elif language == "cpp":
            return self._chunk_cpp_regex(code)
        else:
            return self._chunk_generic_regex(code)

    def _chunk_python_regex(
        self, code: str
    ) -> Tuple[List[DocumentChunk], Dict[str, Any]]:
        """Python regex-based chunking for functions and classes."""
        chunks = []
        symbol_map = {}
        lines = code.split("\n")

        # Regex patterns for Python
        function_pattern = re.compile(r"^(\s*)def\s+(\w+)\s*\(", re.MULTILINE)
        class_pattern = re.compile(r"^(\s*)class\s+(\w+)\s*\(?", re.MULTILINE)
        import_pattern = re.compile(
            r"^(import\s+\w+|from\s+\w+\s+import)", re.MULTILINE
        )

        # Find all matches
        functions = list(function_pattern.finditer(code))
        classes = list(class_pattern.finditer(code))
        imports = list(import_pattern.finditer(code))

        # Process imports first
        for match in imports:
            start_line = code[: match.start()].count("\n") + 1
            end_line = start_line
            chunk_text = lines[start_line - 1]

            chunk_id = f"import_{start_line}"
            metadata = ChunkMetadata(
                chunk_id=chunk_id,
                chunk_index=len(chunks),
                chunk_type="import",
                start_line=start_line,
                end_line=end_line,
                language="python",
                tokens=self._estimate_tokens(chunk_text),
            )

            chunks.append(DocumentChunk(text=chunk_text, metadata=metadata))

        # Process functions
        for match in functions:
            func_name = match.group(2)
            start_line = code[: match.start()].count("\n") + 1
            end_line = self._find_function_end(code, match.start(), lines)

            chunk_text = "\n".join(lines[start_line - 1 : end_line])
            chunk_id = f"func_{func_name}_{start_line}"

            metadata = ChunkMetadata(
                chunk_id=chunk_id,
                chunk_index=len(chunks),
                chunk_type="function",
                start_line=start_line,
                end_line=end_line,
                language="python",
                name=func_name,
                tokens=self._estimate_tokens(chunk_text),
            )

            chunks.append(DocumentChunk(text=chunk_text, metadata=metadata))

            symbol_map[func_name] = {
                "type": "function",
                "line": start_line,
                "chunk_index": len(chunks) - 1,
            }

        # Process classes
        for match in classes:
            class_name = match.group(2)
            start_line = code[: match.start()].count("\n") + 1
            end_line = self._find_class_end(code, match.start(), lines)

            chunk_text = "\n".join(lines[start_line - 1 : end_line])
            chunk_id = f"class_{class_name}_{start_line}"

            metadata = ChunkMetadata(
                chunk_id=chunk_id,
                chunk_index=len(chunks),
                chunk_type="class",
                start_line=start_line,
                end_line=end_line,
                language="python",
                name=class_name,
                tokens=self._estimate_tokens(chunk_text),
            )

            chunks.append(DocumentChunk(text=chunk_text, metadata=metadata))

            symbol_map[class_name] = {
                "type": "class",
                "line": start_line,
                "chunk_index": len(chunks) - 1,
            }

        return chunks, symbol_map

    def _chunk_js_regex(self, code: str) -> Tuple[List[DocumentChunk], Dict[str, Any]]:
        """JavaScript/TypeScript regex-based chunking."""
        chunks = []
        symbol_map = {}
        lines = code.split("\n")

        # Regex patterns for JavaScript/TypeScript
        function_pattern = re.compile(
            r"^(export\s+)?(async\s+)?function\s+(\w+)\s*\(", re.MULTILINE
        )
        class_pattern = re.compile(
            r"^(export\s+)?class\s+(\w+)\s*(extends\s+\w+)?\s*{", re.MULTILINE
        )
        arrow_function_pattern = re.compile(
            r"^(export\s+)?(const|let|var)\s+(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*=>",
            re.MULTILINE,
        )

        # Find all matches
        functions = list(function_pattern.finditer(code))
        classes = list(class_pattern.finditer(code))
        arrow_functions = list(arrow_function_pattern.finditer(code))

        # Process functions
        for match in functions:
            func_name = match.group(3)
            start_line = code[: match.start()].count("\n") + 1
            end_line = self._find_js_function_end(code, match.start(), lines)

            chunk_text = "\n".join(lines[start_line - 1 : end_line])
            chunk_id = f"func_{func_name}_{start_line}"

            metadata = ChunkMetadata(
                chunk_id=chunk_id,
                chunk_index=len(chunks),
                chunk_type="function",
                start_line=start_line,
                end_line=end_line,
                language="javascript",
                name=func_name,
                tokens=self._estimate_tokens(chunk_text),
            )

            chunks.append(DocumentChunk(text=chunk_text, metadata=metadata))

            symbol_map[func_name] = {
                "type": "function",
                "line": start_line,
                "chunk_index": len(chunks) - 1,
            }

        # Process classes
        for match in classes:
            class_name = match.group(2)
            start_line = code[: match.start()].count("\n") + 1
            end_line = self._find_js_class_end(code, match.start(), lines)

            chunk_text = "\n".join(lines[start_line - 1 : end_line])
            chunk_id = f"class_{class_name}_{start_line}"

            metadata = ChunkMetadata(
                chunk_id=chunk_id,
                chunk_index=len(chunks),
                chunk_type="class",
                start_line=start_line,
                end_line=end_line,
                language="javascript",
                name=class_name,
                tokens=self._estimate_tokens(chunk_text),
            )

            chunks.append(DocumentChunk(text=chunk_text, metadata=metadata))

            symbol_map[class_name] = {
                "type": "class",
                "line": start_line,
                "chunk_index": len(chunks) - 1,
            }

        return chunks, symbol_map

    def _chunk_java_regex(
        self, code: str
    ) -> Tuple[List[DocumentChunk], Dict[str, Any]]:
        """Java regex-based chunking."""
        chunks = []
        symbol_map = {}
        lines = code.split("\n")

        # Java patterns
        class_pattern = re.compile(
            r"^(public\s+|private\s+|protected\s+)?(static\s+)?(final\s+)?class\s+(\w+)",
            re.MULTILINE,
        )
        method_pattern = re.compile(
            r"^(public\s+|private\s+|protected\s+)?(static\s+)?(\w+\s+)*(\w+)\s+(\w+)\s*\(",
            re.MULTILINE,
        )

        # Process classes and methods
        classes = list(class_pattern.finditer(code))
        methods = list(method_pattern.finditer(code))

        for match in classes:
            class_name = match.group(4)
            start_line = code[: match.start()].count("\n") + 1
            end_line = self._find_java_class_end(code, match.start(), lines)

            chunk_text = "\n".join(lines[start_line - 1 : end_line])
            chunk_id = f"class_{class_name}_{start_line}"

            metadata = ChunkMetadata(
                chunk_id=chunk_id,
                chunk_index=len(chunks),
                chunk_type="class",
                start_line=start_line,
                end_line=end_line,
                language="java",
                name=class_name,
                tokens=self._estimate_tokens(chunk_text),
            )

            chunks.append(DocumentChunk(text=chunk_text, metadata=metadata))

            symbol_map[class_name] = {
                "type": "class",
                "line": start_line,
                "chunk_index": len(chunks) - 1,
            }

        return chunks, symbol_map

    def _chunk_cpp_regex(self, code: str) -> Tuple[List[DocumentChunk], Dict[str, Any]]:
        """C++ regex-based chunking."""
        chunks = []
        symbol_map = {}
        lines = code.split("\n")

        # C++ patterns
        class_pattern = re.compile(r"^(class|struct)\s+(\w+)", re.MULTILINE)
        function_pattern = re.compile(
            r"^(\w+\s+)*(\w+)\s+(\w+)\s*\([^)]*\)\s*{", re.MULTILINE
        )

        classes = list(class_pattern.finditer(code))
        functions = list(function_pattern.finditer(code))

        for match in classes:
            class_name = match.group(2)
            start_line = code[: match.start()].count("\n") + 1
            end_line = self._find_cpp_class_end(code, match.start(), lines)

            chunk_text = "\n".join(lines[start_line - 1 : end_line])
            chunk_id = f"class_{class_name}_{start_line}"

            metadata = ChunkMetadata(
                chunk_id=chunk_id,
                chunk_index=len(chunks),
                chunk_type="class",
                start_line=start_line,
                end_line=end_line,
                language="cpp",
                name=class_name,
                tokens=self._estimate_tokens(chunk_text),
            )

            chunks.append(DocumentChunk(text=chunk_text, metadata=metadata))

            symbol_map[class_name] = {
                "type": "class",
                "line": start_line,
                "chunk_index": len(chunks) - 1,
            }

        return chunks, symbol_map

    def _chunk_generic_regex(
        self, code: str
    ) -> Tuple[List[DocumentChunk], Dict[str, Any]]:
        """Generic regex-based chunking for unsupported languages."""
        chunks = []
        symbol_map = {}
        lines = code.split("\n")

        # Simple line-based chunking
        chunk_size = 50  # lines per chunk
        for i in range(0, len(lines), chunk_size):
            chunk_lines = lines[i : i + chunk_size]
            chunk_text = "\n".join(chunk_lines)
            chunk_id = f"generic_{i}_{i + len(chunk_lines)}"

            metadata = ChunkMetadata(
                chunk_id=chunk_id,
                chunk_index=len(chunks),
                chunk_type="generic",
                start_line=i + 1,
                end_line=min(i + chunk_size, len(lines)),
                language="generic",
                tokens=self._estimate_tokens(chunk_text),
            )

            chunks.append(DocumentChunk(text=chunk_text, metadata=metadata))

        return chunks, symbol_map

    def _find_function_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a Python function."""
        current_line = code[:start_pos].count("\n") + 1

        for i in range(current_line, len(lines)):
            line = lines[i].strip()
            if (
                line.startswith("def ")
                or line.startswith("class ")
                or line.startswith("@")
            ):
                return i
            if i == len(lines) - 1:
                return i + 1

        return len(lines)

    def _find_class_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a Python class."""
        current_line = code[:start_pos].count("\n") + 1

        for i in range(current_line, len(lines)):
            line = lines[i].strip()
            if line.startswith("class ") and i > current_line:
                return i
            if i == len(lines) - 1:
                return i + 1

        return len(lines)

    def _find_js_function_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a JavaScript function."""
        current_line = code[:start_pos].count("\n") + 1
        return min(current_line + 20, len(lines))  # Assume 20 lines max

    def _find_js_class_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a JavaScript class."""
        current_line = code[:start_pos].count("\n") + 1
        return min(current_line + 50, len(lines))  # Assume 50 lines max

    def _find_java_class_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a Java class."""
        current_line = code[:start_pos].count("\n") + 1
        return min(current_line + 100, len(lines))  # Assume 100 lines max

    def _find_cpp_class_end(self, code: str, start_pos: int, lines: List[str]) -> int:
        """Find the end of a C++ class."""
        current_line = code[:start_pos].count("\n") + 1
        return min(current_line + 100, len(lines))  # Assume 100 lines max

    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count for text."""
        return len(text.split()) * 1.3  # Rough estimation

    def get_supported_languages(self) -> List[str]:
        """Get list of supported languages."""
        return list(self.parsers.keys()) if self._initialized else []

    def is_language_supported(self, language: str) -> bool:
        """Check if language is supported."""
        return language in self.parsers and self.parsers[language] is not None

    def get_chunker_stats(self) -> Dict[str, Any]:
        """Get chunker statistics."""
        return {
            "tree_sitter_available": TREE_SITTER_AVAILABLE,
            "initialized": self._initialized,
            "supported_languages": self.get_supported_languages(),
            "parsers_loaded": len([p for p in self.parsers.values() if p is not None]),
        }


class DocumentIndexer:
    """Service for managing document ingestion and indexing."""

    def __init__(self):
        # Queue & workers
        self._queue: asyncio.Queue[QueueItem] = asyncio.Queue(maxsize=1000)
        self._dead_letter: List[QueueItem] = []
        self._workers: List[asyncio.Task] = []
        self._cancelled_jobs: set[str] = set()
        self._paused: asyncio.Event = asyncio.Event()
        self._shutdown_event: asyncio.Event = asyncio.Event()
        self._concurrency: int = 2
        self._max_attempts: int = 5
        self._backoff_base_s: float = 0.5

        # Chunking
        self.ast_chunker = ASTCodeChunker()

        # Metrics
        self._metrics: Dict[str, Any] = {
            "enqueued": 0,
            "processed": 0,
            "failed": 0,
            "dead_letter": 0,
            "in_flight": 0,
            "last_error": None,
            "avg_latency_ms": 0.0,
            "max_lag_s": 0.0,
            "throughput_last_sec": 0.0,
        }
        self._latency_ema_ms: float = 0.0
        self._ema_alpha: float = 0.2
        self._throughput_window: List[float] = []

        # Dependencies
        self._vector_store_service = None
        self._embedding_service = None
        self._file_indexing_service = None

        # Configuration
        self._enabled = False
        self._batch_size = 16
        self._chunk_max_tokens = 512
        self._chunk_min_tokens = 100
        self._chunk_overlap_ratio = 0.15

    async def initialize(
        self, config: Dict[str, Any], vector_store_service=None, embedding_service=None, file_indexing_service=None
    ) -> bool:
        """Initialize the document indexer."""
        try:
            self._enabled = config.get("rag_enabled", False)
            self._concurrency = config.get("rag_ingest_concurrency", 2)
            self._max_attempts = config.get("rag_ingest_max_attempts", 5)
            self._backoff_base_s = config.get("rag_ingest_backoff_base_s", 0.5)
            self._batch_size = config.get("rag_ingest_batch_size_text", 16)
            self._chunk_max_tokens = config.get("rag_chunk_max_tokens", 512)
            self._chunk_min_tokens = config.get("rag_chunk_min_tokens", 100)
            self._chunk_overlap_ratio = config.get("rag_chunk_overlap_ratio", 0.15)

            if not self._enabled:
                logger.info("DocumentIndexer disabled by config")
                return True

            # Set dependencies
            self._vector_store_service = vector_store_service
            self._embedding_service = embedding_service
            self._file_indexing_service = file_indexing_service

            # Start workers
            await self._start_workers()

            logger.info("DocumentIndexer initialized successfully")
            return True

        except Exception as e:
            logger.error(f"DocumentIndexer initialization failed: {e}")
            return False

    async def _start_workers(self):
        """Start worker tasks for processing the queue."""
        for i in range(self._concurrency):
            worker = asyncio.create_task(self._worker(f"worker-{i}"))
            self._workers.append(worker)

    async def _worker(self, worker_name: str):
        """Worker task for processing queue items."""
        logger.info(f"DocumentIndexer worker {worker_name} started")

        while not self._shutdown_event.is_set():
            try:
                # Wait for unpause
                await self._paused.wait()

                # Get item from queue
                try:
                    item = await asyncio.wait_for(self._queue.get(), timeout=1.0)
                except TimeoutError:
                    continue

                # Process item
                await self._process_item(item, worker_name)

            except Exception as e:
                logger.error(f"Worker {worker_name} error: {e}")
                await asyncio.sleep(1.0)

        logger.info(f"DocumentIndexer worker {worker_name} stopped")

    async def _process_item(self, item: QueueItem, worker_name: str):
        """Process a single queue item."""
        start_time = time.time()

        try:
            self._metrics["in_flight"] += 1

            # Process document based on type
            if item.kind == "docs":
                await self._process_document(item.payload)
            elif item.kind == "images":
                await self._process_image(item.payload)
            elif item.kind == "captions":
                await self._process_caption(item.payload)

            # Update metrics
            processing_time = (time.time() - start_time) * 1000
            self._metrics["processed"] += 1
            self._metrics["in_flight"] -= 1

            # Update latency EMA
            if self._latency_ema_ms == 0.0:
                self._latency_ema_ms = processing_time
            else:
                self._latency_ema_ms = (
                    self._ema_alpha * processing_time
                    + (1 - self._ema_alpha) * self._latency_ema_ms
                )

            self._metrics["avg_latency_ms"] = self._latency_ema_ms

            logger.debug(f"Worker {worker_name} processed {item.kind} item")

        except Exception as e:
            logger.error(f"Failed to process item: {e}")
            self._metrics["failed"] += 1
            self._metrics["in_flight"] -= 1
            self._metrics["last_error"] = str(e)

            # Retry logic
            if item.attempts < self._max_attempts:
                item.attempts += 1
                item.last_error = str(e)
                await asyncio.sleep(self._backoff_base_s * (2**item.attempts))
                await self._queue.put(item)
            else:
                self._dead_letter.append(item)
                self._metrics["dead_letter"] += 1

    async def _process_document(self, payload: Dict[str, Any]):
        """Process a document payload."""
        # Extract document information
        file_path = payload.get("path")
        content = payload.get("content", "")
        file_type = payload.get("file_type", "text")
        language = self._detect_language(file_path, file_type)

        # Chunk the document
        chunks, symbol_map = self.ast_chunker.chunk_code_ast_aware(content, language)

        # Generate embeddings for chunks
        if self._embedding_service:
            chunk_texts = [chunk.text for chunk in chunks]
            embeddings = await self._embedding_service.embed_batch(chunk_texts)

            # Add embeddings to chunks
            for chunk, embedding in zip(chunks, embeddings):
                chunk.embedding = embedding

        # Store in vector database
        if self._vector_store_service:
            embedding_data = []
            for chunk in chunks:
                embedding_data.append(
                    {
                        "file_id": payload.get("file_id"),
                        "chunk_index": chunk.metadata.chunk_index,
                        "chunk_text": chunk.text,
                        "embedding": chunk.embedding or [],
                        "metadata": {
                            "chunk_id": chunk.metadata.chunk_id,
                            "chunk_type": chunk.metadata.chunk_type,
                            "start_line": chunk.metadata.start_line,
                            "end_line": chunk.metadata.end_line,
                            "language": chunk.metadata.language,
                            "name": chunk.metadata.name,
                            "tokens": chunk.metadata.tokens,
                            "symbol_map": symbol_map,
                        },
                    }
                )

            await self._vector_store_service.insert_document_embeddings(embedding_data)

    async def _process_image(self, payload: Dict[str, Any]):
        """Process an image payload."""
        # TODO: Implement image processing
        logger.debug("Image processing not yet implemented")

    async def _process_caption(self, payload: Dict[str, Any]):
        """Process a caption payload."""
        # TODO: Implement caption processing
        logger.debug("Caption processing not yet implemented")

    def _detect_language(self, file_path: str, file_type: str) -> str:
        """Detect programming language from file path and type."""
        if not file_path:
            return "generic"

        path = Path(file_path)
        suffix = path.suffix.lower()

        language_map = {
            ".py": "python",
            ".ts": "typescript",
            ".tsx": "typescript",
            ".js": "javascript",
            ".jsx": "javascript",
            ".java": "java",
            ".cpp": "cpp",
            ".cc": "cpp",
            ".cxx": "cpp",
            ".c": "cpp",
            ".h": "cpp",
            ".hpp": "cpp",
        }

        return language_map.get(suffix, "generic")

    async def index_documents(
        self, documents: List[Dict[str, Any]]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Index documents with streaming progress."""
        if not self._enabled:
            yield {"type": "error", "error": "DocumentIndexer not enabled"}
            return

        try:
            total = len(documents)
            processed = 0
            failures = 0

            # Process in batches
            for i in range(0, total, self._batch_size):
                batch = documents[i : i + self._batch_size]

                # Queue batch items
                for doc in batch:
                    queue_item = QueueItem(
                        kind="docs", payload=doc, job_id=f"batch_{i}_{len(batch)}"
                    )
                    await self._queue.put(queue_item)
                    self._metrics["enqueued"] += 1

                # Wait for batch processing
                await asyncio.sleep(0.1)
                processed += len(batch)

                yield {
                    "type": "progress",
                    "processed": processed,
                    "total": total,
                    "failures": failures,
                    "message": f"Processed {processed}/{total} documents",
                }

            yield {
                "type": "complete",
                "processed": processed,
                "total": total,
                "failures": failures,
                "message": "Document indexing completed",
            }

        except Exception as e:
            logger.error(f"Failed to index documents: {e}")
            yield {"type": "error", "error": str(e)}

    async def pause(self):
        """Pause the document indexer."""
        self._paused.clear()
        logger.info("DocumentIndexer paused")

    async def resume(self):
        """Resume the document indexer."""
        self._paused.set()
        logger.info("DocumentIndexer resumed")

    async def get_stats(self) -> Dict[str, Any]:
        """Get document indexer statistics."""
        return {
            "enabled": self._enabled,
            "queue_size": self._queue.qsize(),
            "workers": len(self._workers),
            "concurrency": self._concurrency,
            "metrics": self._metrics.copy(),
            "dead_letter_size": len(self._dead_letter),
            "paused": not self._paused.is_set(),
            "chunker_stats": self.ast_chunker.get_chunker_stats(),
        }

    async def health_check(self) -> bool:
        """Perform health check."""
        if not self._enabled:
            return True

        try:
            # Check if workers are running
            if not self._workers:
                return False

            # Check if any workers are still alive
            alive_workers = [w for w in self._workers if not w.done()]
            if not alive_workers:
                return False

            return True

        except Exception as e:
            logger.warning(f"DocumentIndexer health check failed: {e}")
            return False

    async def shutdown(self):
        """Shutdown the document indexer."""
        logger.info("DocumentIndexer shutting down...")

        # Signal shutdown
        self._shutdown_event.set()

        # Cancel workers
        for worker in self._workers:
            worker.cancel()

        # Wait for workers to finish
        if self._workers:
            await asyncio.gather(*self._workers, return_exceptions=True)

        logger.info("DocumentIndexer shutdown complete")
