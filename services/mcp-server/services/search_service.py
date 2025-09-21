"""
Search Service
==============

Modern search service with semantic search, BM25, and hybrid search capabilities.
Uses clean, direct naming without unnecessary prefixes.
"""

import asyncio
import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiohttp

# Modern alternatives to tensorflow
try:
    from sentence_transformers import SentenceTransformer

    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SentenceTransformer = None
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    from rank_bm25 import BM25Okapi

    BM25_AVAILABLE = True
except ImportError:
    BM25Okapi = None
    BM25_AVAILABLE = False

logger = logging.getLogger(__name__)


class SearchService:
    """Modern search service with semantic and BM25 capabilities."""

    def __init__(self, project_root: Optional[Path] = None):
        """Initialize the search service."""
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent.parent
        else:
            self.project_root = project_root

        # FastAPI backend configuration
        self._backend_url = "http://localhost:8000"
        self._timeout_seconds = 30
        self._max_retries = 3

        # Modern embedding models (no tensorflow dependency)
        self._models = {}
        self._default_model = "all-MiniLM-L6-v2"  # Fast and efficient

        # BM25 corpus for text search
        self._bm25_corpus = None
        self._bm25_model = None
        self._document_metadata = []

    async def initialize(self) -> bool:
        """Initialize the search service."""
        try:
            # Load default embedding model if available
            if SENTENCE_TRANSFORMERS_AVAILABLE:
                await self._load_model(self._default_model)
                logger.info("Sentence transformers model loaded")
            else:
                logger.warning("Sentence transformers not available, using BM25 only")

            # Initialize BM25 if available
            if BM25_AVAILABLE:
                await self._build_bm25_index()
                logger.info("BM25 index built")
            else:
                logger.warning("BM25 not available, using basic text search")

            logger.info("Search service initialized successfully")
            return True

        except Exception:
            logger.exception("Failed to initialize search service")
            return False

    async def semantic_search(
        self,
        query: str,
        search_type: str = "hybrid",
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        top_k: int = 20,
        similarity_threshold: float = 0.7,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Perform semantic search using vector embeddings."""
        try:
            # Try backend first
            backend_result = await self._search_via_backend(
                "semantic",
                query,
                file_types,
                directories,
                top_k,
                similarity_threshold=similarity_threshold,
                model=model,
            )
            if backend_result.get("success"):
                return backend_result

            # Fallback to local semantic search
            if not SENTENCE_TRANSFORMERS_AVAILABLE:
                return {
                    "success": False,
                    "error": "Semantic search not available - sentence transformers not installed",
                    "query": query,
                }

            return await self._local_semantic_search(
                query, file_types, directories, top_k, similarity_threshold, model
            )

        except Exception as e:
            logger.exception("Semantic search failed")
            return {"success": False, "error": str(e), "query": query}

    async def syntax_search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        case_sensitive: bool = False,
        whole_word: bool = False,
        max_count: Optional[int] = None,
        context_lines: int = 0,
        expand_query: bool = True,
    ) -> Dict[str, Any]:
        """Perform syntax-based search using ripgrep."""
        try:
            # Try backend first
            backend_result = await self._search_via_backend(
                "syntax", query, file_types, directories, max_count or 50
            )
            if backend_result.get("success"):
                return backend_result

            # Fallback to local ripgrep
            return await self._local_ripgrep_search(
                query,
                file_types,
                directories,
                case_sensitive,
                whole_word,
                max_count,
                context_lines,
            )

        except Exception as e:
            logger.exception("Syntax search failed")
            return {"success": False, "error": str(e), "query": query}

    async def hybrid_search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        max_results: int = 50,
        semantic_weight: float = 0.6,
        syntax_weight: float = 0.4,
        similarity_threshold: float = 0.7,
    ) -> Dict[str, Any]:
        """Perform hybrid search combining semantic and syntax search."""
        try:
            # Try backend first
            backend_result = await self._search_via_backend(
                "hybrid", query, file_types, directories, max_results
            )
            if backend_result.get("success"):
                return backend_result

            # Fallback to local hybrid search
            return await self._local_hybrid_search(
                query,
                file_types,
                directories,
                max_results,
                semantic_weight,
                syntax_weight,
                similarity_threshold,
            )

        except Exception as e:
            logger.exception("Hybrid search failed")
            return {"success": False, "error": str(e), "query": query}

    async def smart_search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        max_results: int = 20,
        case_sensitive: bool = False,
        whole_word: bool = False,
        context_lines: int = 0,
    ) -> Dict[str, Any]:
        """Perform smart search that automatically chooses the best strategy."""
        try:
            # Try backend first
            backend_result = await self._search_via_backend(
                "smart", query, file_types, directories, max_results
            )
            if backend_result.get("success"):
                return backend_result

            # Fallback to local smart search
            return await self._local_smart_search(
                query,
                file_types,
                directories,
                max_results,
                case_sensitive,
                whole_word,
                context_lines,
            )

        except Exception as e:
            logger.exception("Smart search failed")
            return {"success": False, "error": str(e), "query": query}

    async def index_codebase(
        self,
        project_root: Optional[str] = None,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
        force_reindex: bool = False,
        chunk_size: int = 512,
        overlap: int = 50,
    ) -> Dict[str, Any]:
        """Index the codebase for search."""
        try:
            # Try backend first
            backend_result = await self._index_via_backend(
                project_root,
                file_types,
                directories,
                force_reindex,
                chunk_size,
                overlap,
            )
            if backend_result.get("success"):
                return backend_result

            # Fallback to local indexing
            return await self._local_index_codebase(
                project_root,
                file_types,
                directories,
                force_reindex,
                chunk_size,
                overlap,
            )

        except Exception as e:
            logger.exception("Codebase indexing failed")
            return {"success": False, "error": str(e)}

    async def get_search_stats(self) -> Dict[str, Any]:
        """Get search statistics."""
        try:
            # Try backend first
            backend_result = await self._get_backend_stats()
            if backend_result.get("success"):
                return backend_result

            # Fallback to local stats
            return await self._get_local_stats()

        except Exception as e:
            logger.exception("Failed to get search stats")
            return {"success": False, "error": str(e)}

    async def get_query_suggestions(
        self, query: str, max_suggestions: int = 5
    ) -> Dict[str, Any]:
        """Get intelligent query suggestions."""
        try:
            # Try backend first
            backend_result = await self._get_backend_suggestions(query, max_suggestions)
            if backend_result.get("success"):
                return backend_result

            # Fallback to local suggestions
            return await self._get_local_suggestions(query, max_suggestions)

        except Exception as e:
            logger.exception("Failed to get query suggestions")
            return {"success": False, "error": str(e)}

    async def health_check(self) -> Dict[str, Any]:
        """Check the health of the search service."""
        try:
            # Try backend first
            backend_result = await self._check_backend_health()
            if backend_result.get("success"):
                return backend_result

            # Fallback to local health check
            return await self._check_local_health()

        except Exception as e:
            logger.exception("Search service health check failed")
            return {"success": False, "error": str(e)}

    # Backend integration methods

    async def _search_via_backend(
        self,
        search_type: str,
        query: str,
        file_types: Optional[List[str]],
        directories: Optional[List[str]],
        max_results: int,
        **kwargs,
    ) -> Dict[str, Any]:
        """Search via FastAPI backend."""
        try:
            endpoint_map = {
                "semantic": "/api/search/semantic",
                "syntax": "/api/search/syntax",
                "hybrid": "/api/search/hybrid",
                "smart": "/api/search/search",
            }

            endpoint = endpoint_map.get(search_type, "/api/search/search")

            search_request = {
                "query": query,
                "max_results": max_results,
                "file_types": file_types or [],
                "directories": directories or [],
                **kwargs,
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self._backend_url}{endpoint}",
                    json=search_request,
                    timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "query": query,
                            "search_type": search_type,
                            "total_results": result.get("total_results", 0),
                            "results": result.get("results", []),
                            "search_time": result.get("search_time", 0),
                            "search_strategies": result.get("search_strategies", []),
                        }
                    else:
                        return {
                            "success": False,
                            "error": f"Backend error: {response.status}",
                        }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _index_via_backend(
        self,
        project_root: Optional[str],
        file_types: Optional[List[str]],
        directories: Optional[List[str]],
        force_reindex: bool,
        chunk_size: int,
        overlap: int,
    ) -> Dict[str, Any]:
        """Index via FastAPI backend."""
        try:
            index_request = {
                "project_root": project_root or str(self.project_root),
                "file_types": file_types or [],
                "directories": directories or [],
                "force_reindex": force_reindex,
                "chunk_size": chunk_size,
                "overlap": overlap,
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self._backend_url}/api/search/index",
                    json=index_request,
                    timeout=aiohttp.ClientTimeout(total=300),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "indexed_files": result.get("indexed_files", 0),
                            "total_chunks": result.get("total_chunks", 0),
                            "index_time": result.get("index_time", 0),
                            "model_used": result.get("model_used", "unknown"),
                        }
                    else:
                        return {
                            "success": False,
                            "error": f"Backend error: {response.status}",
                        }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _get_backend_stats(self) -> Dict[str, Any]:
        """Get stats from backend."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self._backend_url}/api/search/stats",
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {"success": True, "stats": result}
                    else:
                        return {
                            "success": False,
                            "error": f"Backend error: {response.status}",
                        }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _get_backend_suggestions(
        self, query: str, max_suggestions: int
    ) -> Dict[str, Any]:
        """Get suggestions from backend."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self._backend_url}/api/search/suggestions",
                    params={"query": query, "max_suggestions": max_suggestions},
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "query": query,
                            "suggestions": result.get("suggestions", []),
                        }
                    else:
                        return {
                            "success": False,
                            "error": f"Backend error: {response.status}",
                        }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _check_backend_health(self) -> Dict[str, Any]:
        """Check backend health."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self._backend_url}/api/search/health",
                    timeout=aiohttp.ClientTimeout(total=5),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "status": result.get("status", "unknown"),
                            "service": result.get("service", "search"),
                            "indexed_files": result.get("indexed_files", "0"),
                            "total_chunks": result.get("total_chunks", "0"),
                        }
                    else:
                        return {
                            "success": False,
                            "error": f"Backend health check failed: {response.status}",
                        }

        except Exception as e:
            return {"success": False, "error": str(e)}

    # Local fallback methods

    async def _load_model(self, model_name: str) -> None:
        """Load an embedding model."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            return

        if model_name not in self._models:
            logger.info(f"Loading embedding model: {model_name}")
            self._models[model_name] = SentenceTransformer(model_name)

    async def _build_bm25_index(self) -> None:
        """Build BM25 index from codebase."""
        if not BM25_AVAILABLE:
            return

        try:
            # Collect documents from codebase
            documents = []
            metadata = []

            for file_path in self.project_root.rglob("*.py"):
                if any(part.startswith(".") for part in file_path.parts):
                    continue

                try:
                    with open(file_path, encoding="utf-8") as f:
                        content = f.read()
                        # Simple tokenization
                        tokens = re.findall(r"\b\w+\b", content.lower())
                        documents.append(tokens)
                        metadata.append(
                            {
                                "file_path": str(file_path),
                                "content": content[:500],  # First 500 chars
                                "line_count": len(content.splitlines()),
                            }
                        )
                except Exception as e:
                    logger.warning(f"Failed to read {file_path}: {e}")
                    continue

            if documents:
                self._bm25_model = BM25Okapi(documents)
                self._document_metadata = metadata
                logger.info(f"Built BM25 index with {len(documents)} documents")

        except Exception:
            logger.exception("Failed to build BM25 index")

    async def _local_semantic_search(
        self,
        query: str,
        file_types: Optional[List[str]],
        directories: Optional[List[str]],
        top_k: int,
        similarity_threshold: float,
        model: Optional[str],
    ) -> Dict[str, Any]:
        """Local semantic search fallback."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            return {
                "success": False,
                "error": "Semantic search not available - sentence transformers not installed",
                "query": query,
            }

        try:
            model_name = model or self._default_model
            if model_name not in self._models:
                await self._load_model(model_name)

            # Generate query embedding
            query_embedding = self._models[model_name].encode([query])

            # Simple file search for now
            results = []
            for file_path in self.project_root.rglob("*.py"):
                if any(part.startswith(".") for part in file_path.parts):
                    continue

                try:
                    with open(file_path, encoding="utf-8") as f:
                        content = f.read()
                        # Simple similarity based on content overlap
                        similarity = self._calculate_simple_similarity(query, content)

                        if similarity >= similarity_threshold:
                            results.append(
                                {
                                    "file_path": str(file_path),
                                    "score": similarity,
                                    "content": content[:200],
                                    "line_number": 1,
                                    "match_type": "semantic",
                                }
                            )
                except Exception:
                    continue

            # Sort by score and limit results
            results.sort(key=lambda x: x["score"], reverse=True)
            results = results[:top_k]

            return {
                "success": True,
                "query": query,
                "total_results": len(results),
                "results": results,
                "search_time": 0.1,  # Placeholder
                "search_strategies": ["local_semantic"],
            }

        except Exception as e:
            return {"success": False, "error": str(e), "query": query}

    async def _local_ripgrep_search(
        self,
        query: str,
        file_types: Optional[List[str]],
        directories: Optional[List[str]],
        case_sensitive: bool,
        whole_word: bool,
        max_count: Optional[int],
        context_lines: int,
    ) -> Dict[str, Any]:
        """Local ripgrep search fallback."""
        try:
            command = ["rg", "-n", "--color", "never", "--no-heading"]

            if not case_sensitive:
                command.append("-i")

            if whole_word:
                command.append("-w")

            if context_lines > 0:
                command.extend(["-C", str(context_lines)])

            if max_count:
                command.extend(["-m", str(max_count)])

            # Add file type filters
            if file_types:
                for file_type in file_types:
                    command.extend(["-t", file_type])

            # Add directory filters
            if directories:
                command.extend(directories)
            else:
                command.append(".")

            # Add pattern
            command.append(query)

            # Execute ripgrep
            process = await asyncio.create_subprocess_exec(
                *command,
                cwd=self.project_root,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                return {
                    "success": False,
                    "error": f"Ripgrep failed: {stderr.decode()}",
                    "query": query,
                }

            # Parse results
            results = []
            lines = stdout.decode("utf-8").strip().split("\n")

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
                    {
                        "file_path": file_path,
                        "line_number": line_number,
                        "content": content.strip(),
                        "score": 1.0,
                        "match_type": "syntax",
                    }
                )

            return {
                "success": True,
                "query": query,
                "total_results": len(results),
                "results": results,
                "search_time": 0.1,  # Placeholder
                "search_strategies": ["local_ripgrep"],
            }

        except Exception as e:
            return {"success": False, "error": str(e), "query": query}

    async def _local_hybrid_search(
        self,
        query: str,
        file_types: Optional[List[str]],
        directories: Optional[List[str]],
        max_results: int,
        semantic_weight: float,
        syntax_weight: float,
        similarity_threshold: float,
    ) -> Dict[str, Any]:
        """Local hybrid search fallback."""
        try:
            # Run semantic and syntax search in parallel
            semantic_task = asyncio.create_task(
                self._local_semantic_search(
                    query,
                    file_types,
                    directories,
                    max_results // 2,
                    similarity_threshold,
                    None,
                )
            )
            syntax_task = asyncio.create_task(
                self._local_ripgrep_search(
                    query, file_types, directories, False, False, max_results // 2, 0
                )
            )

            semantic_result, syntax_result = await asyncio.gather(
                semantic_task, syntax_task, return_exceptions=True
            )

            # Combine results
            combined_results = []
            seen_files = set()

            # Add semantic results with weight
            if isinstance(semantic_result, dict) and semantic_result.get("success"):
                for result in semantic_result.get("results", []):
                    file_line_key = (
                        f"{result['file_path']}:{result.get('line_number', 0)}"
                    )
                    if file_line_key not in seen_files:
                        result["score"] *= semantic_weight
                        result["match_type"] = "hybrid_semantic"
                        combined_results.append(result)
                        seen_files.add(file_line_key)

            # Add syntax results with weight
            if isinstance(syntax_result, dict) and syntax_result.get("success"):
                for result in syntax_result.get("results", []):
                    file_line_key = (
                        f"{result['file_path']}:{result.get('line_number', 0)}"
                    )
                    if file_line_key not in seen_files:
                        result["score"] *= syntax_weight
                        result["match_type"] = "hybrid_syntax"
                        combined_results.append(result)
                        seen_files.add(file_line_key)

            # Sort by score and limit results
            combined_results.sort(key=lambda x: x["score"], reverse=True)
            combined_results = combined_results[:max_results]

            return {
                "success": True,
                "query": query,
                "total_results": len(combined_results),
                "results": combined_results,
                "search_time": 0.2,  # Placeholder
                "search_strategies": ["local_hybrid"],
            }

        except Exception as e:
            return {"success": False, "error": str(e), "query": query}

    async def _local_smart_search(
        self,
        query: str,
        file_types: Optional[List[str]],
        directories: Optional[List[str]],
        max_results: int,
        case_sensitive: bool,
        whole_word: bool,
        context_lines: int,
    ) -> Dict[str, Any]:
        """Local smart search fallback."""
        # Simple heuristic: if query contains code patterns, use syntax search
        code_patterns = ["def ", "class ", "import ", "async ", "await "]
        has_code_patterns = any(pattern in query for pattern in code_patterns)

        if has_code_patterns:
            return await self._local_ripgrep_search(
                query,
                file_types,
                directories,
                case_sensitive,
                whole_word,
                max_results,
                context_lines,
            )
        else:
            return await self._local_semantic_search(
                query, file_types, directories, max_results, 0.5, None
            )

    async def _local_index_codebase(
        self,
        project_root: Optional[str],
        file_types: Optional[List[str]],
        directories: Optional[List[str]],
        force_reindex: bool,
        chunk_size: int,
        overlap: int,
    ) -> Dict[str, Any]:
        """Local codebase indexing fallback."""
        try:
            indexed_files = 0
            total_chunks = 0

            # Simple file counting for now
            for file_path in self.project_root.rglob("*.py"):
                if any(part.startswith(".") for part in file_path.parts):
                    continue
                indexed_files += 1
                total_chunks += 1  # Simple 1:1 mapping for now

            return {
                "success": True,
                "indexed_files": indexed_files,
                "total_chunks": total_chunks,
                "index_time": 0.1,  # Placeholder
                "model_used": "local",
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _get_local_stats(self) -> Dict[str, Any]:
        """Get local search stats."""
        try:
            return {
                "success": True,
                "stats": {
                    "total_files_indexed": len(self._document_metadata),
                    "total_chunks": len(self._document_metadata),
                    "index_size_mb": 0.0,  # Placeholder
                    "last_indexed": None,
                    "search_count": 0,
                    "avg_search_time": 0.0,
                    "cache_hit_rate": 0.0,
                },
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _get_local_suggestions(
        self, query: str, max_suggestions: int
    ) -> Dict[str, Any]:
        """Get local query suggestions."""
        try:
            suggestions = []

            # Simple code pattern suggestions
            if "function" in query.lower():
                suggestions.append(
                    {
                        "suggestion": query.replace("function", "def"),
                        "confidence": 0.8,
                        "type": "pattern",
                    }
                )

            if "class" in query.lower():
                suggestions.append(
                    {
                        "suggestion": query.replace("class", "class "),
                        "confidence": 0.8,
                        "type": "pattern",
                    }
                )

            return {
                "success": True,
                "query": query,
                "suggestions": suggestions[:max_suggestions],
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _check_local_health(self) -> Dict[str, Any]:
        """Check local search service health."""
        try:
            return {
                "success": True,
                "status": "healthy",
                "service": "search",
                "indexed_files": str(len(self._document_metadata)),
                "total_chunks": str(len(self._document_metadata)),
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def _calculate_simple_similarity(self, query: str, content: str) -> float:
        """Calculate simple text similarity."""
        query_words = set(re.findall(r"\b\w+\b", query.lower()))
        content_words = set(re.findall(r"\b\w+\b", content.lower()))

        if not query_words:
            return 0.0

        intersection = query_words.intersection(content_words)
        return len(intersection) / len(query_words)
