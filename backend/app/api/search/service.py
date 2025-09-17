"""
Search Service
==============

Advanced search service that combines semantic search, syntax search, and hybrid search
capabilities for comprehensive codebase exploration.
"""

import asyncio
import logging
import time
from pathlib import Path
from typing import Any

import aiohttp

# Optional import for sentence transformers
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SentenceTransformer = None
    SENTENCE_TRANSFORMERS_AVAILABLE = False

# Optional import for BM25
try:
    from rank_bm25 import BM25Okapi
    BM25_AVAILABLE = True
except ImportError:
    BM25Okapi = None
    BM25_AVAILABLE = False

from .models import (
    HybridSearchRequest,
    IndexRequest,
    IndexResponse,
    SearchResponse,
    SearchResult,
    SearchStats,
    SemanticSearchRequest,
    SuggestionsResponse,
    SyntaxSearchRequest,
)

logger = logging.getLogger(__name__)


class SearchService:
    """Advanced search service with multiple search strategies."""

    def __init__(self, project_root: Path | None = None):
        """Initialize the search service."""
        if project_root is None:
            # Default to the Reynard project root
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent.parent.parent
        else:
            self.project_root = project_root

        # Initialize embedding models
        self._models = {}
        self._default_model = "all-MiniLM-L6-v2"  # Fast and efficient for code

        # Search configuration
        self._rag_base_url = "http://localhost:8000"
        self._timeout_seconds = 30

        # Cache for search results
        self._search_cache = {}
        self._cache_max_size = 1000

    async def initialize(self) -> bool:
        """Initialize the search service."""
        try:
            # Load default embedding model
            await self._load_model(self._default_model)

            # Test RAG backend connection (non-blocking)
            try:
                rag_available = await self._test_rag_connection()
                if not rag_available:
                    logger.info("RAG service not yet available, will retry on first search request")
                else:
                    logger.info("RAG service is available and ready")
            except Exception as e:
                logger.info(f"RAG service not yet available: {e}")

            logger.info("Search service initialized successfully")
            return True

        except Exception:
            logger.exception("Failed to initialize search service")
            return False

    async def semantic_search(self, request: SemanticSearchRequest) -> SearchResponse:
        """Perform semantic search using vector embeddings."""
        start_time = time.time()

        try:
            # Try RAG backend first
            rag_result = await self._search_via_rag(request)
            if rag_result.get("success"):
                return self._format_rag_response(rag_result, request.query, start_time)
            elif "RAG service not available" in str(rag_result.get("error", "")):
                logger.info("RAG service not available, using local search")

            # Fallback to local semantic search
            return await self._local_semantic_search(request, start_time)

        except Exception as e:
            logger.exception("Semantic search failed")
            return SearchResponse(
                success=False,
                query=request.query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )

    async def syntax_search(self, request: SyntaxSearchRequest) -> SearchResponse:
        """Perform syntax-based search using ripgrep."""
        start_time = time.time()

        try:
            # Build ripgrep command
            command = self._build_ripgrep_command(request)

            # Execute ripgrep
            result = await self._run_ripgrep(command)

            # Parse results
            results = self._parse_ripgrep_results(result, request)

            return SearchResponse(
                success=True,
                query=request.query,
                total_results=len(results),
                results=results,
                search_time=time.time() - start_time,
                search_strategies=["ripgrep"],
            )

        except Exception as e:
            logger.exception("Syntax search failed")
            return SearchResponse(
                success=False,
                query=request.query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )

    async def hybrid_search(self, request: HybridSearchRequest) -> SearchResponse:
        """Perform hybrid search combining semantic and syntax search."""
        start_time = time.time()

        try:
            # Create semantic and syntax requests
            semantic_req = SemanticSearchRequest(
                query=request.query,
                max_results=int(request.max_results * request.semantic_weight),
                file_types=request.file_types,
                directories=request.directories,
                similarity_threshold=request.similarity_threshold,
            )

            syntax_req = SyntaxSearchRequest(
                query=request.query,
                max_results=int(request.max_results * request.syntax_weight),
                file_types=request.file_types,
                directories=request.directories,
                case_sensitive=request.case_sensitive,
                whole_word=request.whole_word,
                context_lines=request.context_lines,
            )

            # Run both searches in parallel
            semantic_task = asyncio.create_task(self.semantic_search(semantic_req))
            syntax_task = asyncio.create_task(self.syntax_search(syntax_req))

            semantic_response, syntax_response = await asyncio.gather(
                semantic_task, syntax_task, return_exceptions=True
            )

            # Combine results
            combined_results = self._combine_search_results(
                semantic_response, syntax_response, request
            )

            return SearchResponse(
                success=True,
                query=request.query,
                total_results=len(combined_results),
                results=combined_results,
                search_time=time.time() - start_time,
                search_strategies=["semantic", "syntax", "hybrid"],
            )

        except Exception as e:
            logger.exception("Hybrid search failed")
            return SearchResponse(
                success=False,
                query=request.query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error=str(e),
            )

    async def index_codebase(self, request: IndexRequest) -> IndexResponse:
        """Index the codebase for search."""
        start_time = time.time()

        try:
            # Try RAG backend indexing first
            rag_result = await self._index_via_rag(request)
            if rag_result.get("success"):
                return IndexResponse(
                    success=True,
                    indexed_files=rag_result.get("indexed_files", 0),
                    total_chunks=rag_result.get("total_chunks", 0),
                    index_time=time.time() - start_time,
                    model_used=rag_result.get("model_used", "unknown"),
                )

            # Fallback to local indexing
            return await self._local_index_codebase(request, start_time)

        except Exception as e:
            logger.exception("Codebase indexing failed")
            return IndexResponse(
                success=False,
                indexed_files=0,
                total_chunks=0,
                index_time=time.time() - start_time,
                error=str(e),
            )

    async def get_search_stats(self) -> SearchStats:
        """Get search statistics."""
        try:
            # Try to get stats from RAG backend
            rag_stats = await self._get_rag_stats()
            if rag_stats.get("success"):
                return SearchStats(
                    total_files_indexed=rag_stats.get("total_files", 0),
                    total_chunks=rag_stats.get("total_chunks", 0),
                    index_size_mb=rag_stats.get("index_size_mb", 0.0),
                    last_indexed=rag_stats.get("last_indexed"),
                    search_count=rag_stats.get("search_count", 0),
                    avg_search_time=rag_stats.get("avg_search_time", 0.0),
                    cache_hit_rate=rag_stats.get("cache_hit_rate", 0.0),
                )

            # Fallback to local stats
            return SearchStats(
                total_files_indexed=0,
                total_chunks=0,
                index_size_mb=0.0,
                last_indexed=None,
                search_count=0,
                avg_search_time=0.0,
                cache_hit_rate=0.0,
            )

        except Exception:
            logger.exception("Failed to get search stats")
            return SearchStats(
                total_files_indexed=0,
                total_chunks=0,
                index_size_mb=0.0,
                last_indexed=None,
                search_count=0,
                avg_search_time=0.0,
                cache_hit_rate=0.0,
            )

    async def get_query_suggestions(
        self, query: str, max_suggestions: int = 5
    ) -> SuggestionsResponse:
        """Get intelligent query suggestions."""
        try:
            suggestions = []

            # Code-specific suggestions
            code_suggestions = self._generate_code_suggestions(query)
            suggestions.extend(code_suggestions[:max_suggestions])

            # Synonym suggestions
            synonym_suggestions = self._generate_synonym_suggestions(query)
            suggestions.extend(
                synonym_suggestions[: max_suggestions - len(suggestions)]
            )

            return SuggestionsResponse(
                success=True, query=query, suggestions=suggestions
            )

        except Exception as e:
            logger.exception("Failed to generate query suggestions")
            return SuggestionsResponse(
                success=False, query=query, suggestions=[], error=str(e)
            )

    # Private helper methods

    async def _load_model(self, model_name: str) -> None:
        """Load an embedding model."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            logger.warning(
                "Sentence transformers not available, skipping model loading"
            )
            return

        if model_name not in self._models:
            try:
                logger.info(f"Loading embedding model: {model_name}")
                self._models[model_name] = SentenceTransformer(model_name)
            except Exception as e:
                logger.warning(f"Failed to load model {model_name}: {e}")
                # Continue without the model - BM25 will be used as fallback

    async def _test_rag_connection(self) -> bool:
        """Test connection to RAG service."""
        try:
            # Try to get the RAG service instance from the service registry
            from app.core.service_registry import get_service_registry
            
            registry = get_service_registry()
            rag_service = registry.get_service_instance("rag")
            
            if rag_service is None:
                return False
                
            # Test if the RAG service is properly initialized
            try:
                # Try to get stats to verify the service is working
                await rag_service.get_stats()
                return True
            except Exception:
                return False
                
        except Exception:
            return False

    async def _search_via_rag(self, request: SemanticSearchRequest) -> dict[str, Any]:
        """Search via RAG service."""
        try:
            # Get the RAG service instance from the service registry
            from app.core.service_registry import get_service_registry
            
            registry = get_service_registry()
            rag_service = registry.get_service_instance("rag")
            
            if rag_service is None:
                return {"success": False, "error": "RAG service not available"}
            
            # Use the RAG service directly
            result = await rag_service.query(
                query=request.query,
                modality=request.search_type,
                top_k=request.max_results,
                similarity_threshold=request.similarity_threshold,
                enable_reranking=False
            )
            
            return {"success": True, "data": result}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _index_via_rag(self, request: IndexRequest) -> dict[str, Any]:
        """Index via RAG service."""
        try:
            # Get the RAG service instance from the service registry
            from app.core.service_registry import get_service_registry
            
            registry = get_service_registry()
            rag_service = registry.get_service_instance("rag")
            
            if rag_service is None:
                return {"success": False, "error": "RAG service not available"}
            
            # For now, return a placeholder response since indexing is not fully implemented
            return {
                "success": True, 
                "data": {
                    "indexed_files": 0,
                    "total_chunks": 0,
                    "model_used": "placeholder"
                }
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _get_rag_stats(self) -> dict[str, Any]:
        """Get stats from RAG service."""
        try:
            # Get the RAG service instance from the service registry
            from app.core.service_registry import get_service_registry
            
            registry = get_service_registry()
            rag_service = registry.get_service_instance("rag")
            
            if rag_service is None:
                return {"success": False, "error": "RAG service not available"}
            
            # Get stats from the RAG service
            stats = await rag_service.get_stats()
            return {"success": True, "data": stats}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def _format_rag_response(
        self, rag_result: dict[str, Any], query: str, start_time: float
    ) -> SearchResponse:
        """Format RAG backend response."""
        data = rag_result["data"]
        hits = data.get("hits", [])

        results = []
        for hit in hits:
            results.append(
                SearchResult(
                    file_path=hit.get("file_path", ""),
                    line_number=hit.get("chunk_index", 0),
                    content=hit.get("chunk_text", ""),
                    score=hit.get("score", 0.0),
                    match_type="semantic",
                    context=hit.get("chunk_text", ""),
                    snippet=self._extract_snippet(hit.get("chunk_text", "")),
                    metadata=hit.get("chunk_metadata", {}),
                )
            )

        return SearchResponse(
            success=True,
            query=query,
            total_results=len(results),
            results=results,
            search_time=time.time() - start_time,
            search_strategies=["rag_backend"],
        )

    async def _local_semantic_search(
        self, request: SemanticSearchRequest, start_time: float
    ) -> SearchResponse:
        """Fallback local semantic search using BM25."""
        try:
            # Use BM25 for local semantic search when RAG backend is unavailable
            if not BM25_AVAILABLE:
                return SearchResponse(
                    success=False,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    error="BM25 not available for local search",
                )

            # Get all relevant files
            files = await self._get_relevant_files(request)
            if not files:
                return SearchResponse(
                    success=True,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    search_strategies=["local_bm25"],
                )

            # Prepare documents for BM25
            documents = []
            file_paths = []
            for file_path in files:
                try:
                    content = await self._read_file_content(file_path)
                    if content:
                        documents.append(content.split())
                        file_paths.append(file_path)
                except Exception:
                    continue

            if not documents:
                return SearchResponse(
                    success=True,
                    query=request.query,
                    total_results=0,
                    results=[],
                    search_time=time.time() - start_time,
                    search_strategies=["local_bm25"],
                )

            # Create BM25 index
            bm25 = BM25Okapi(documents)

            # Search using BM25
            query_tokens = request.query.lower().split()
            scores = bm25.get_scores(query_tokens)

            # Create results
            results = []
            for i, (file_path, score) in enumerate(zip(file_paths, scores, strict=True)):
                if score > request.similarity_threshold:
                    # Find the best matching line
                    content = " ".join(documents[i])
                    best_line = self._find_best_matching_line(content, request.query)

                    results.append(
                        SearchResult(
                            file_path=str(file_path),
                            line_number=best_line["line_number"],
                            content=best_line["content"],
                            score=float(score),
                            match_type="bm25",
                            context=best_line["context"],
                            snippet=self._extract_snippet(best_line["content"]),
                        )
                    )

            # Sort by score and limit results
            results.sort(key=lambda x: x.score, reverse=True)
            results = results[:request.max_results]

            return SearchResponse(
                success=True,
                query=request.query,
                total_results=len(results),
                results=results,
                search_time=time.time() - start_time,
                search_strategies=["local_bm25"],
            )

        except Exception as e:
            logger.exception("Local BM25 search failed")
            return SearchResponse(
                success=False,
                query=request.query,
                total_results=0,
                results=[],
                search_time=time.time() - start_time,
                error="Local BM25 search failed: %s" % str(e),
            )

    async def _local_index_codebase(
        self, request: IndexRequest, start_time: float
    ) -> IndexResponse:
        """Fallback local codebase indexing."""
        # This would implement local indexing
        # For now, return empty results
        return IndexResponse(
            success=True,
            indexed_files=0,
            total_chunks=0,
            index_time=time.time() - start_time,
            model_used=self._default_model,
            error="Local indexing not yet implemented",
        )

    def _build_ripgrep_command(self, request: SyntaxSearchRequest) -> list[str]:
        """Build ripgrep command from request."""
        command = ["rg", "-n", "--color", "never", "--no-heading"]

        if not request.case_sensitive:
            command.append("-i")

        if request.whole_word:
            command.append("-w")

        if request.context_lines > 0:
            command.extend(["-C", str(request.context_lines)])

        if request.max_results:
            command.extend(["-m", str(request.max_results)])

        # Add file type filters
        if request.file_types:
            for file_type in request.file_types:
                command.extend(["-t", file_type])

        # Add directory filters
        if request.directories:
            command.extend(request.directories)
        else:
            command.append(".")

        # Add pattern
        command.append(request.query)

        return command

    async def _run_ripgrep(self, command: list[str]) -> dict[str, Any]:
        """Run ripgrep command."""
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                cwd=self.project_root,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            return {
                "success": process.returncode == 0,
                "stdout": stdout.decode("utf-8"),
                "stderr": stderr.decode("utf-8"),
                "returncode": process.returncode,
            }

        except Exception as e:
            return {"success": False, "stdout": "", "stderr": str(e), "returncode": -1}

    def _parse_ripgrep_results(
        self, result: dict[str, Any], request: SyntaxSearchRequest
    ) -> list[SearchResult]:
        """Parse ripgrep output into SearchResult objects."""
        if not result["success"] or not result["stdout"]:
            return []

        results = []
        lines = result["stdout"].strip().split("\n")

        for line in lines:
            if not line.strip():
                continue

            # Parse ripgrep format: file:line:content
            parts = line.split(":", 2)
            if len(parts) < 3:
                continue

            file_path = parts[0]
            line_number = int(parts[1])
            content = parts[2]

            results.append(
                SearchResult(
                    file_path=file_path,
                    line_number=line_number,
                    content=content.strip(),
                    score=1.0,  # Ripgrep doesn't provide scores
                    match_type="syntax",
                    context=content,
                    snippet=self._extract_snippet(content),
                )
            )

        return results

    def _combine_search_results(
        self,
        semantic_response: SearchResponse,
        syntax_response: SearchResponse,
        request: HybridSearchRequest,
    ) -> list[SearchResult]:
        """Combine results from semantic and syntax search."""
        combined = []
        seen_files = set()

        # Add semantic results with weight
        for result in semantic_response.results:
            if isinstance(result, Exception):
                continue

            file_line_key = f"{result.file_path}:{result.line_number}"
            if file_line_key not in seen_files:
                result.score *= request.semantic_weight
                result.match_type = "hybrid_semantic"
                combined.append(result)
                seen_files.add(file_line_key)

        # Add syntax results with weight
        for result in syntax_response.results:
            if isinstance(result, Exception):
                continue

            file_line_key = f"{result.file_path}:{result.line_number}"
            if file_line_key not in seen_files:
                result.score *= request.syntax_weight
                result.match_type = "hybrid_syntax"
                combined.append(result)
                seen_files.add(file_line_key)

        # Sort by score and limit results
        combined.sort(key=lambda x: x.score, reverse=True)
        return combined[: request.max_results]

    def _extract_snippet(self, text: str, max_length: int = 200) -> str:
        """Extract a meaningful snippet from text."""
        if len(text) <= max_length:
            return text

        words = text.split()
        snippet_words = []
        current_length = 0

        for word in words:
            if current_length + len(word) + 1 > max_length:
                break
            snippet_words.append(word)
            current_length += len(word) + 1

        snippet = " ".join(snippet_words)
        if len(snippet) < len(text):
            snippet += "..."

        return snippet

    def _generate_code_suggestions(self, query: str) -> list[dict[str, Any]]:
        """Generate code-specific query suggestions."""
        suggestions = []
        query_lower = query.lower()

        # Code pattern suggestions
        if "function" in query_lower:
            suggestions.append(
                {
                    "suggestion": "def " + query.replace("function", "").strip(),
                    "confidence": 0.8,
                    "type": "pattern",
                }
            )

        if "class" in query_lower:
            suggestions.append(
                {
                    "suggestion": "class " + query.replace("class", "").strip(),
                    "confidence": 0.8,
                    "type": "pattern",
                }
            )

        return suggestions

    def _generate_synonym_suggestions(self, query: str) -> list[dict[str, Any]]:
        """Generate synonym-based query suggestions."""
        synonyms = {
            "function": ["def", "method", "procedure"],
            "class": ["type", "object", "struct"],
            "import": ["require", "include", "from"],
            "error": ["exception", "bug", "issue"],
            "test": ["spec", "unit", "mock"],
        }

        suggestions = []
        query_lower = query.lower()

        for word, syns in synonyms.items():
            if word in query_lower:
                for syn in syns:
                    suggestions.append(
                        {
                            "suggestion": query.replace(word, syn),
                            "confidence": 0.6,
                            "type": "synonym",
                        }
                    )

        return suggestions

    async def _get_relevant_files(self, request: SemanticSearchRequest) -> list[Path]:
        """Get relevant files based on file types and directories."""
        files = []

        # Determine search directories
        search_dirs = request.directories or [self.project_root]

        for search_dir in search_dirs:
            search_path = Path(search_dir)
            if not search_path.exists():
                continue

            # Get file types to search
            patterns = request.file_types or ["*.py", "*.ts", "*.tsx", "*.js", "*.jsx", "*.md"]

            for pattern in patterns:
                files.extend(search_path.rglob(pattern))

        return files[:1000]  # Limit to prevent memory issues

    async def _read_file_content(self, file_path: Path) -> str | None:
        """Read file content safely."""
        try:
            if not file_path.exists() or not file_path.is_file():
                return None

            # Skip binary files and very large files
            if file_path.stat().st_size > 1024 * 1024:  # 1MB limit
                return None

            return file_path.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            return None

    def _find_best_matching_line(self, content: str, query: str) -> dict[str, Any]:
        """Find the best matching line in content for the query."""
        lines = content.split('\n')
        query_lower = query.lower()

        best_score = 0
        best_line = 0
        best_content = ""

        for i, line in enumerate(lines):
            line_lower = line.lower()
            # Simple scoring based on query word matches
            score = sum(1 for word in query_lower.split() if word in line_lower)

            if score > best_score:
                best_score = score
                best_line = i + 1
                best_content = line.strip()

        # Get context around the best line
        context_start = max(0, best_line - 3)
        context_end = min(len(lines), best_line + 2)
        context = '\n'.join(lines[context_start:context_end])

        return {
            "line_number": best_line,
            "content": best_content,
            "context": context
        }
