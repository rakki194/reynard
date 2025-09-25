"""AST Document Processor: Intelligent document processing with AST-aware chunking.

This service provides intelligent document processing with AST-aware chunking
for programming languages, ensuring semantic boundaries are preserved.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import re
import time
from typing import Any, Dict, List, Optional, AsyncGenerator

from ...interfaces.base import BaseService, ServiceStatus
from ...interfaces.document import DocumentProcessor, IDocumentIndexer, Document, DocumentChunk, ChunkMetadata

logger = logging.getLogger("uvicorn")


class ASTDocumentProcessor(IDocumentIndexer):
    """AST-aware document processor with intelligent chunking."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("ast-document-processor", config)
        self.startup_time = None
        
        # Processing configuration
        self.max_chunk_size = self.config.get("max_chunk_size", 1000)  # Reduced for embedding models
        self.overlap_size = self.config.get("overlap_size", 100)
        self.supported_languages = self.config.get("supported_languages", [
            "python", "javascript", "typescript", "java", "cpp", "c", "go", "rust"
        ])
        
        # Language patterns for regex-based chunking
        self.language_patterns = self._initialize_language_patterns()
        
        # Metrics
        self.metrics = {
            "documents_processed": 0,
            "chunks_created": 0,
            "languages_detected": {},
            "processing_errors": 0,
        }

    def _initialize_language_patterns(self) -> Dict[str, Dict[str, str]]:
        """Initialize regex patterns for different programming languages."""
        return {
            "python": {
                "function": r"^def\s+(\w+)\s*\(",
                "class": r"^class\s+(\w+)",
                "import": r"^(import|from)\s+",
            },
            "javascript": {
                "function": r"(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:function|\([^)]*\)\s*=>))",
                "class": r"^class\s+(\w+)",
                "import": r"^(import|const|let|var)\s+",
            },
            "typescript": {
                "function": r"(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:function|\([^)]*\)\s*=>))",
                "class": r"^class\s+(\w+)",
                "import": r"^(import|const|let|var)\s+",
            },
            "java": {
                "function": r"(?:public|private|protected)?\s*(?:static\s+)?\w+\s+(\w+)\s*\(",
                "class": r"^(?:public\s+)?class\s+(\w+)",
                "import": r"^import\s+",
            },
            "cpp": {
                "function": r"(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*(?:const\s*)?{",
                "class": r"^class\s+(\w+)",
                "import": r"^#include\s*<",
            },
        }

    async def initialize(self) -> bool:
        """Initialize the document processor."""
        try:
            self.update_status(ServiceStatus.INITIALIZING, "Initializing AST document processor")
            self.startup_time = time.time()
            
            # Initialize language patterns
            self.language_patterns = self._initialize_language_patterns()
            
            # Initialize processing metrics
            self.metrics = {
                "documents_processed": 0,
                "chunks_created": 0,
                "processing_time_ms": 0,
                "errors": 0,
                "processing_errors": 0,
                "languages_detected": {}
            }
            
            self.update_status(ServiceStatus.HEALTHY, "AST document processor initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize AST document processor: {e}")
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the document processor."""
        try:
            self.update_status(ServiceStatus.SHUTTING_DOWN, "Shutting down AST document processor")
            
            # Clear any cached data
            self.language_patterns.clear()
            
            self.update_status(ServiceStatus.SHUTDOWN, "AST document processor shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            self.update_status(ServiceStatus.HEALTHY, "Service is healthy")
            
            return {
                "status": self.status.value,
                "message": self.health.message,
                "last_updated": self.health.last_updated.isoformat(),
                "metrics": self.metrics,
                "supported_languages": self.supported_languages,
                "dependencies": self.get_dependency_status(),
            }
            
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            self.update_status(ServiceStatus.ERROR, f"Health check failed: {e}")
            return {
                "status": "error",
                "message": str(e),
                "last_updated": self.health.last_updated.isoformat(),
                "metrics": self.metrics,
                "dependencies": self.get_dependency_status(),
            }

    async def process_document(
        self, 
        document: Document,
        **kwargs
    ) -> List[DocumentChunk]:
        """Process a single document into chunks."""
        if not self.is_healthy():
            raise RuntimeError("Document processor is not healthy")
        
        try:
            # Validate document
            if not await self.validate_document(document):
                raise ValueError(f"Invalid document: {document.id}")
            
            # Detect language
            language = self.detect_language(document.content, document.file_path)
            
            # Extract metadata
            metadata = await self.extract_metadata(document)
            
            # Process based on language
            if language in self.supported_languages:
                chunks = await self._process_structured_document(document, language, metadata)
            else:
                chunks = await self._process_generic_document(document, metadata)
            
            # Update metrics
            self.metrics["documents_processed"] += 1
            self.metrics["chunks_created"] += len(chunks)
            self.metrics["languages_detected"][language] = (
                self.metrics["languages_detected"].get(language, 0) + 1
            )
            
            return chunks
            
        except Exception as e:
            self.logger.error(f"Failed to process document {document.id}: {e}")
            self.metrics["processing_errors"] += 1
            raise RuntimeError(f"Failed to process document {document.id}: {e}")

    async def process_documents(
        self, 
        documents: List[Document],
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Process multiple documents with progress updates."""
        total_docs = len(documents)
        processed_docs = 0
        
        try:
            for i, document in enumerate(documents):
                try:
                    # Process document
                    chunks = await self.process_document(document)
                    
                    # Yield progress update
                    processed_docs += 1
                    yield {
                        "type": "progress",
                        "document_id": document.id,
                        "chunks_created": len(chunks),
                        "processed": processed_docs,
                        "total": total_docs,
                        "progress_percent": (processed_docs / total_docs) * 100,
                    }
                    
                    # Yield document result
                    yield {
                        "type": "document_result",
                        "document_id": document.id,
                        "chunks": chunks,
                    }
                    
                except Exception as e:
                    self.logger.error(f"Failed to process document {document.id}: {e}")
                    yield {
                        "type": "error",
                        "document_id": document.id,
                        "error": str(e),
                    }
            
            # Yield completion
            yield {
                "type": "completion",
                "total_processed": processed_docs,
                "total_documents": total_docs,
                "success_rate": (processed_docs / total_docs) * 100 if total_docs > 0 else 0,
            }
            
        except Exception as e:
            self.logger.error(f"Failed to process documents: {e}")
            yield {
                "type": "error",
                "error": str(e),
            }

    def detect_language(self, content: str, file_path: str) -> str:
        """Detect programming language from content and file path."""
        # First try to detect from file extension
        if file_path:
            extension = file_path.split('.')[-1].lower()
            extension_map = {
                'py': 'python',
                'js': 'javascript',
                'ts': 'typescript',
                'java': 'java',
                'cpp': 'cpp',
                'cc': 'cpp',
                'cxx': 'cpp',
                'c': 'c',
                'go': 'go',
                'rs': 'rust',
            }
            if extension in extension_map:
                return extension_map[extension]
        
        # Fallback to content analysis
        content_lower = content.lower()
        
        if 'def ' in content_lower and 'import ' in content_lower:
            return 'python'
        elif 'function ' in content_lower or '=>' in content_lower:
            return 'javascript'
        elif 'class ' in content_lower and 'public ' in content_lower:
            return 'java'
        elif '#include' in content_lower:
            return 'cpp'
        elif 'package ' in content_lower and 'func ' in content_lower:
            return 'go'
        elif 'fn ' in content_lower and 'let ' in content_lower:
            return 'rust'
        else:
            return 'generic'

    def get_supported_languages(self) -> List[str]:
        """Get list of supported programming languages."""
        return self.supported_languages.copy()

    def is_language_supported(self, language: str) -> bool:
        """Check if a language is supported."""
        return language in self.supported_languages

    async def extract_metadata(
        self, 
        document: Document
    ) -> Dict[str, Any]:
        """Extract metadata from document."""
        metadata = {
            "file_path": document.file_path,
            "file_type": document.file_type,
            "language": self.detect_language(document.content, document.file_path),
            "content_length": len(document.content),
            "line_count": len(document.content.split('\n')),
        }
        
        # Add language-specific metadata
        language = metadata["language"]
        if language in self.language_patterns:
            patterns = self.language_patterns[language]
            
            # Count functions, classes, imports
            function_count = len(re.findall(patterns["function"], document.content, re.MULTILINE))
            class_count = len(re.findall(patterns["class"], document.content, re.MULTILINE))
            import_count = len(re.findall(patterns["import"], document.content, re.MULTILINE))
            
            metadata.update({
                "function_count": function_count,
                "class_count": class_count,
                "import_count": import_count,
            })
        
        return metadata

    async def validate_document(self, document: Document) -> bool:
        """Validate document before processing."""
        if not document.id or not document.content:
            return False
        
        if len(document.content) > 1024 * 1024:  # 1MB limit
            return False
        
        return True

    async def _process_structured_document(
        self, 
        document: Document, 
        language: str, 
        metadata: Dict[str, Any]
    ) -> List[DocumentChunk]:
        """Process structured document with language-specific patterns."""
        chunks = []
        lines = document.content.split('\n')
        
        if language not in self.language_patterns:
            return await self._process_generic_document(document, metadata)
        
        patterns = self.language_patterns[language]
        current_chunk_lines = []
        current_chunk_type = "generic"
        current_chunk_name = None
        chunk_index = 0
        
        for i, line in enumerate(lines):
            current_chunk_lines.append(line)
            
            # Check if chunk is getting too large
            if len('\n'.join(current_chunk_lines)) > self.max_chunk_size:
                # Split the large chunk into smaller pieces
                split_chunks = self._split_large_chunk(current_chunk_lines, chunk_index, language, document.file_path, metadata)
                chunks.extend(split_chunks)
                chunk_index += len(split_chunks)
                
                # Start new chunk with overlap
                overlap_lines = current_chunk_lines[-self.overlap_size:] if self.overlap_size > 0 else []
                current_chunk_lines = overlap_lines
            
            # Check for function definition
            function_match = re.search(patterns["function"], line)
            if function_match:
                if current_chunk_lines and len(current_chunk_lines) > 1:
                    # Save previous chunk
                    chunk = self._create_chunk(
                        current_chunk_lines[:-1],  # Exclude current line
                        chunk_index,
                        current_chunk_type,
                        current_chunk_name,
                        language,
                        document.file_path,
                        metadata
                    )
                    chunks.append(chunk)
                    chunk_index += 1
                
                # Start new function chunk
                current_chunk_lines = [line]
                current_chunk_type = "function"
                current_chunk_name = function_match.group(1) or function_match.group(2)
            
            # Check for class definition
            class_match = re.search(patterns["class"], line)
            if class_match:
                if current_chunk_lines and len(current_chunk_lines) > 1:
                    # Save previous chunk
                    chunk = self._create_chunk(
                        current_chunk_lines[:-1],  # Exclude current line
                        chunk_index,
                        current_chunk_type,
                        current_chunk_name,
                        language,
                        document.file_path,
                        metadata
                    )
                    chunks.append(chunk)
                    chunk_index += 1
                
                # Start new class chunk
                current_chunk_lines = [line]
                current_chunk_type = "class"
                current_chunk_name = class_match.group(1)
            
            # Check for import statements
            import_match = re.search(patterns["import"], line)
            if import_match and current_chunk_type != "import":
                if current_chunk_lines and len(current_chunk_lines) > 1:
                    # Save previous chunk
                    chunk = self._create_chunk(
                        current_chunk_lines[:-1],  # Exclude current line
                        chunk_index,
                        current_chunk_type,
                        current_chunk_name,
                        language,
                        document.file_path,
                        metadata
                    )
                    chunks.append(chunk)
                    chunk_index += 1
                
                # Start new import chunk
                current_chunk_lines = [line]
                current_chunk_type = "import"
                current_chunk_name = None
        
        # Save final chunk
        if current_chunk_lines:
            # Check if final chunk is too large and split it if needed
            final_chunk_text = '\n'.join(current_chunk_lines)
            if len(final_chunk_text) > self.max_chunk_size:
                # Split the large chunk into smaller pieces
                split_chunks = self._split_large_chunk(current_chunk_lines, chunk_index, language, document.file_path, metadata)
                chunks.extend(split_chunks)
            else:
                chunk = self._create_chunk(
                    current_chunk_lines,
                    chunk_index,
                    current_chunk_type,
                    current_chunk_name,
                    language,
                    document.file_path,
                    metadata
                )
                chunks.append(chunk)
        
        return chunks

    async def _process_generic_document(
        self, 
        document: Document, 
        metadata: Dict[str, Any]
    ) -> List[DocumentChunk]:
        """Process generic document with simple chunking."""
        chunks = []
        lines = document.content.split('\n')
        
        current_chunk_lines = []
        chunk_index = 0
        
        for line in lines:
            current_chunk_lines.append(line)
            
            # Check if chunk is getting too large
            if len('\n'.join(current_chunk_lines)) > self.max_chunk_size:
                # Split the large chunk into smaller pieces
                split_chunks = self._split_large_chunk(current_chunk_lines, chunk_index, metadata["language"], document.file_path, metadata)
                chunks.extend(split_chunks)
                chunk_index += len(split_chunks)
                
                # Start new chunk with overlap
                overlap_lines = current_chunk_lines[-self.overlap_size:] if self.overlap_size > 0 else []
                current_chunk_lines = overlap_lines
        
        # Save final chunk
        if current_chunk_lines:
            # Check if final chunk is too large and split it if needed
            final_chunk_text = '\n'.join(current_chunk_lines)
            if len(final_chunk_text) > self.max_chunk_size:
                # Split the large chunk into smaller pieces
                split_chunks = self._split_large_chunk(current_chunk_lines, chunk_index, metadata["language"], document.file_path, metadata)
                chunks.extend(split_chunks)
            else:
                chunk = self._create_chunk(
                    current_chunk_lines,
                    chunk_index,
                    "generic",
                    None,
                    metadata["language"],
                    document.file_path,
                    metadata
                )
                chunks.append(chunk)
        
        return chunks

    def _create_chunk(
        self,
        lines: List[str],
        chunk_index: int,
        chunk_type: str,
        chunk_name: Optional[str],
        language: str,
        file_path: str,
        metadata: Dict[str, Any]
    ) -> DocumentChunk:
        """Create a document chunk from lines."""
        text = '\n'.join(lines)
        
        chunk_metadata = ChunkMetadata(
            file_path=file_path,
            language=language,
            chunk_type=chunk_type,
            start_line=0,  # Would need to track actual line numbers
            end_line=len(lines),
            parent_function=metadata.get("parent_function"),
            parent_class=metadata.get("parent_class"),
            complexity_score=0.0
        )
        
        return DocumentChunk(
            id=f"{metadata.get('file_path', 'unknown')}_{chunk_index}",
            content=text,
            start_line=0,  # Would need to track actual line numbers
            end_line=len(lines),
            chunk_type=chunk_type,
            metadata=chunk_metadata.__dict__
        )

    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count for text."""
        return len(text.split()) * 1.3  # Rough estimation

    def _split_large_chunk(self, lines: List[str], start_index: int, language: str, file_path: str, metadata: Dict[str, Any]) -> List[DocumentChunk]:
        """Split a large chunk into smaller pieces."""
        chunks = []
        current_lines = []
        chunk_index = start_index
        
        for line in lines:
            current_lines.append(line)
            
            # Check if adding this line would exceed the limit
            if len('\n'.join(current_lines)) > self.max_chunk_size:
                # Save current chunk (without the last line)
                if len(current_lines) > 1:
                    chunk = self._create_chunk(
                        current_lines[:-1],  # Exclude the last line
                        chunk_index,
                        "code_block",
                        None,
                        language,
                        file_path,
                        metadata
                    )
                    chunks.append(chunk)
                    chunk_index += 1
                    
                    # Start new chunk with overlap
                    overlap_lines = current_lines[-self.overlap_size:] if self.overlap_size > 0 else []
                    current_lines = overlap_lines + [line]  # Include the line that caused overflow
                else:
                    # Single line is too long, force split it
                    chunk = self._create_chunk(
                        current_lines,
                        chunk_index,
                        "code_block",
                        None,
                        language,
                        file_path,
                        metadata
                    )
                    chunks.append(chunk)
                    chunk_index += 1
                    current_lines = []
        
        # Save any remaining lines
        if current_lines:
            chunk = self._create_chunk(
                current_lines,
                chunk_index,
                "code_block",
                None,
                language,
                file_path,
                metadata
            )
            chunks.append(chunk)
        
        return chunks

    async def get_processing_stats(self) -> Dict[str, Any]:
        """Get document processing statistics."""
        return {
            "service_name": self.name,
            "status": self.status.value,
            "documents_processed": self.metrics["documents_processed"],
            "chunks_created": self.metrics["chunks_created"],
            "languages_detected": self.metrics["languages_detected"],
            "processing_errors": self.metrics["processing_errors"],
            "supported_languages": self.supported_languages,
            "max_chunk_size": self.max_chunk_size,
            "overlap_size": self.overlap_size,
        }

    async def optimize_processing(self) -> bool:
        """Optimize document processing for better performance."""
        try:
            # Could implement caching, parallel processing, etc.
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to optimize processing: {e}")
            return False

    # DocumentProcessor interface methods
    def get_supported_file_types(self) -> List[str]:
        """Get list of supported file types."""
        return [
            ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp", ".c", ".h",
            ".cs", ".php", ".rb", ".go", ".rs", ".swift", ".kt", ".scala",
            ".md", ".txt", ".json", ".yaml", ".yml", ".xml", ".html", ".css"
        ]

    def is_file_type_supported(self, file_type: str) -> bool:
        """Check if file type is supported."""
        return file_type.lower() in self.get_supported_file_types()

    async def get_stats(self) -> Dict[str, Any]:
        """Get service statistics."""
        try:
            stats = await self.get_processing_stats()
            return {
                "total_documents_processed": stats.get("total_documents_processed", 0),
                "total_chunks_created": stats.get("total_chunks_created", 0),
                "average_chunks_per_document": stats.get("average_chunks_per_document", 0),
                "supported_languages": len(self.get_supported_languages()),
                "supported_file_types": len(self.get_supported_file_types()),
                "uptime_seconds": time.time() - (self.startup_time or time.time()),
                "status": self.status.value,
                "last_updated": self.health.last_updated.isoformat() if self.health else None
            }
        except Exception as e:
            self.logger.error(f"Failed to get stats: {e}")
            return {"error": str(e), "status": self.status.value}

    # Methods required by indexing scripts - now using modular scanner
    async def scan_codebase(self):
        """Scan the codebase for files to index (scan-only mode)."""
        from .codebase_scanner import CodebaseScanner
        
        scanner = CodebaseScanner(self.config)
        async for item in scanner.scan_codebase():
            yield item

    async def index_codebase(self):
        """Index the entire codebase."""
        from .codebase_scanner import CodebaseScanner
        
        scanner = CodebaseScanner(self.config)
        async for item in scanner.scan_and_index(
            document_processor=self,
            # Note: vector_store and embedding_service would be injected by the calling script
        ):
            yield item

    # IDocumentIndexer interface methods
    async def index_documents(
        self, documents: List[Dict[str, Any]],
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Index documents with streaming progress."""
        try:
            total_docs = len(documents)
            processed = 0
            failures = 0
            
            for i, doc_data in enumerate(documents):
                try:
                    # Create Document object from dict
                    document = Document(
                        id=doc_data.get("id", f"doc_{i}"),
                        content=doc_data.get("content", ""),
                        file_path=doc_data.get("file_path", ""),
                        file_type=doc_data.get("file_type", "text"),
                        language=doc_data.get("language", "text"),
                        metadata=doc_data.get("metadata", {})
                    )
                    
                    # Process document into chunks
                    chunks = await self.process_document(document)
                    
                    # Update metrics
                    self.metrics["documents_processed"] += 1
                    self.metrics["chunks_created"] += len(chunks)
                    
                    processed += 1
                    
                    # Yield progress update
                    yield {
                        "type": "progress",
                        "processed": processed,
                        "total": total_docs,
                        "failures": failures,
                        "document_id": document.id,
                        "chunks_created": len(chunks)
                    }
                    
                except Exception as e:
                    failures += 1
                    logger.error(f"Failed to process document {i}: {e}")
                    yield {
                        "type": "error",
                        "document_id": doc_data.get("id", f"doc_{i}"),
                        "error": str(e)
                    }
            
            # Yield completion
            yield {
                "type": "complete",
                "processed": processed,
                "total": total_docs,
                "failures": failures
            }
            
        except Exception as e:
            logger.error(f"Failed to index documents: {e}")
            yield {
                "type": "error",
                "error": str(e)
            }

    async def pause(self) -> None:
        """Pause the document indexer."""
        # For now, this is a no-op since we don't have background processing
        logger.info("Document indexer paused")

    async def resume(self) -> None:
        """Resume the document indexer."""
        # For now, this is a no-op since we don't have background processing
        logger.info("Document indexer resumed")

    def get_supported_languages(self) -> List[str]:
        """Get list of supported languages for chunking."""
        return self.supported_languages.copy()

    def is_language_supported(self, language: str) -> bool:
        """Check if language is supported for chunking."""
        return language.lower() in [lang.lower() for lang in self.supported_languages]

    # DocumentProcessor interface methods
    async def process_document(
        self, document: Document,
    ) -> List[DocumentChunk]:
        """Process a document into chunks."""
        try:
            start_time = time.time()
            
            # Detect language
            language = self._detect_language(document.file_path, document.content)
            
            # Process based on language
            if language in self.supported_languages:
                chunks = await self._process_structured_document(document, language)
            else:
                chunks = await self._process_text_document(document)
            
            # Update metrics
            processing_time = (time.time() - start_time) * 1000
            self.metrics["documents_processed"] += 1
            self.metrics["chunks_created"] += len(chunks)
            self.metrics["languages_detected"][language] = self.metrics["languages_detected"].get(language, 0) + 1
            
            logger.debug(f"Processed document {document.id} into {len(chunks)} chunks in {processing_time:.2f}ms")
            return chunks
            
        except Exception as e:
            self.metrics["processing_errors"] += 1
            logger.error(f"Failed to process document {document.id}: {e}")
            raise

    def get_supported_file_types(self) -> List[str]:
        """Get list of supported file types."""
        return [
            ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp", ".c", ".h", ".hpp",
            ".go", ".rs", ".php", ".rb", ".swift", ".kt", ".scala", ".clj", ".hs",
            ".ml", ".fs", ".vb", ".cs", ".dart", ".r", ".m", ".mm", ".pl", ".sh",
            ".bash", ".zsh", ".fish", ".ps1", ".bat", ".cmd", ".sql", ".html", ".css",
            ".scss", ".sass", ".less", ".xml", ".json", ".yaml", ".yml", ".toml",
            ".ini", ".cfg", ".conf", ".md", ".rst", ".txt", ".log"
        ]

    def _detect_language(self, file_path: str, content: str) -> str:
        """Detect programming language from file path and content."""
        if not file_path:
            return "text"
        
        # Get file extension
        ext = file_path.lower().split('.')[-1] if '.' in file_path else ""
        
        # Language mapping
        language_map = {
            "py": "python",
            "js": "javascript", 
            "ts": "typescript",
            "jsx": "javascript",
            "tsx": "typescript",
            "java": "java",
            "cpp": "cpp",
            "c": "c",
            "h": "c",
            "hpp": "cpp",
            "go": "go",
            "rs": "rust",
            "php": "php",
            "rb": "ruby",
            "swift": "swift",
            "kt": "kotlin",
            "scala": "scala",
            "clj": "clojure",
            "hs": "haskell",
            "ml": "ocaml",
            "fs": "fsharp",
            "vb": "vb",
            "cs": "csharp",
            "dart": "dart",
            "r": "r",
            "m": "matlab",
            "mm": "objective-c",
            "pl": "perl",
            "sh": "bash",
            "bash": "bash",
            "zsh": "bash",
            "fish": "bash",
            "ps1": "powershell",
            "bat": "batch",
            "cmd": "batch",
            "sql": "sql",
            "html": "html",
            "css": "css",
            "scss": "scss",
            "sass": "sass",
            "less": "less",
            "xml": "xml",
            "json": "json",
            "yaml": "yaml",
            "yml": "yaml",
            "toml": "toml",
            "ini": "ini",
            "cfg": "ini",
            "conf": "ini",
            "md": "markdown",
            "rst": "rst",
            "txt": "text",
            "log": "text"
        }
        
        return language_map.get(ext, "text")

    async def _process_text_document(self, document: Document) -> List[DocumentChunk]:
        """Process a text document into chunks using simple text chunking."""
        try:
            content = document.content
            if not content:
                return []
            
            chunks = []
            lines = content.split('\n')
            current_chunk = ""
            current_line = 1
            chunk_id = 1
            
            for line_num, line in enumerate(lines, 1):
                current_chunk += line + '\n'
                
                # Create chunk when we reach max size or end of document
                if len(current_chunk) >= self.max_chunk_size or line_num == len(lines):
                    if current_chunk.strip():
                        chunk = DocumentChunk(
                            id=f"{document.id}_chunk_{chunk_id}",
                            content=current_chunk.strip(),
                            start_line=current_line,
                            end_line=line_num,
                            chunk_type="text",
                            metadata={
                                "file_path": document.file_path,
                                "language": document.language,
                                "chunk_type": "text",
                                "parent_function": None,
                                "parent_class": None,
                                "complexity_score": 0.0
                            }
                        )
                        chunks.append(chunk)
                        chunk_id += 1
                    
                    current_chunk = ""
                    current_line = line_num + 1
            
            return chunks
            
        except Exception as e:
            logger.error(f"Failed to process text document {document.id}: {e}")
            return []
