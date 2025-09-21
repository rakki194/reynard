"""
🦊 Reynard Semantic Search API Endpoints
========================================

Advanced semantic search with AST parsing for code and document parsing for documentation.
Provides intelligent code-aware search capabilities.

Features:
- Semantic search with vector embeddings
- AST-aware code search and analysis
- Document parsing for documentation
- Hybrid search combining semantic and keyword search
- Code structure analysis and symbol resolution

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from app.core.service_registry import get_service_registry

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/semantic-search", tags=["semantic-search"])


@router.post("/search")
async def semantic_search(
    query: str,
    search_type: str = Query("hybrid", description="Search type: semantic, keyword, or hybrid"),
    top_k: int = Query(10, description="Number of results to return"),
    language_filter: Optional[str] = Query(None, description="Filter by programming language"),
    file_type_filter: Optional[str] = Query(None, description="Filter by file type"),
    include_metadata: bool = Query(True, description="Include metadata in results")
) -> JSONResponse:
    """Perform semantic search with AST parsing capabilities."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")
        
        if not rag_service:
            raise HTTPException(
                status_code=503,
                detail="RAG service not available"
            )
        
        # Perform search based on type
        if search_type == "semantic":
            results = await rag_service.semantic_search(
                query=query,
                top_k=top_k,
                language_filter=language_filter,
                file_type_filter=file_type_filter
            )
        elif search_type == "keyword":
            results = await rag_service.keyword_search(
                query=query,
                top_k=top_k,
                language_filter=language_filter,
                file_type_filter=file_type_filter
            )
        elif search_type == "hybrid":
            results = await rag_service.hybrid_search(
                query=query,
                top_k=top_k,
                language_filter=language_filter,
                file_type_filter=file_type_filter
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid search_type. Must be 'semantic', 'keyword', or 'hybrid'"
            )
        
        # Process results for AST-aware information
        processed_results = []
        for result in results:
            processed_result = {
                "content": result.get("content", ""),
                "score": result.get("score", 0.0),
                "file_path": result.get("file_path", ""),
                "chunk_index": result.get("chunk_index", 0),
                "metadata": result.get("metadata", {})
            }
            
            # Add AST-specific information if available
            if include_metadata and "metadata" in result:
                metadata = result["metadata"]
                processed_result["ast_info"] = {
                    "chunk_type": metadata.get("chunk_type", "unknown"),
                    "language": metadata.get("language", "unknown"),
                    "start_line": metadata.get("start_line", 0),
                    "end_line": metadata.get("end_line", 0),
                    "symbol_map": metadata.get("symbol_map", {}),
                    "tokens": metadata.get("tokens", 0)
                }
            
            processed_results.append(processed_result)
        
        return JSONResponse({
            "status": "success",
            "data": {
                "query": query,
                "search_type": search_type,
                "total_results": len(processed_results),
                "results": processed_results
            }
        })
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to perform semantic search: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to perform semantic search: {str(e)}"
        )


@router.post("/code-analysis")
async def analyze_code_structure(
    query: str,
    analysis_type: str = Query("functions", description="Analysis type: functions, classes, imports, or symbols"),
    top_k: int = Query(20, description="Number of results to return")
) -> JSONResponse:
    """Analyze code structure using AST parsing."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")
        
        if not rag_service:
            raise HTTPException(
                status_code=503,
                detail="RAG service not available"
            )
        
        # Perform semantic search first
        results = await rag_service.semantic_search(
            query=query,
            top_k=top_k * 2  # Get more results for analysis
        )
        
        # Analyze code structure
        analyzed_results = []
        for result in results:
            metadata = result.get("metadata", {})
            symbol_map = metadata.get("symbol_map", {})
            chunk_type = metadata.get("chunk_type", "")
            
            # Filter based on analysis type
            if analysis_type == "functions" and chunk_type in ["function", "method"]:
                analyzed_results.append({
                    "type": "function",
                    "name": symbol_map.get("name", "unknown"),
                    "content": result.get("content", ""),
                    "file_path": result.get("file_path", ""),
                    "start_line": metadata.get("start_line", 0),
                    "end_line": metadata.get("end_line", 0),
                    "language": metadata.get("language", "unknown"),
                    "parameters": symbol_map.get("parameters", []),
                    "return_type": symbol_map.get("return_type", "unknown")
                })
            elif analysis_type == "classes" and chunk_type in ["class", "interface"]:
                analyzed_results.append({
                    "type": "class",
                    "name": symbol_map.get("name", "unknown"),
                    "content": result.get("content", ""),
                    "file_path": result.get("file_path", ""),
                    "start_line": metadata.get("start_line", 0),
                    "end_line": metadata.get("end_line", 0),
                    "language": metadata.get("language", "unknown"),
                    "methods": symbol_map.get("methods", []),
                    "properties": symbol_map.get("properties", [])
                })
            elif analysis_type == "imports" and chunk_type == "import":
                analyzed_results.append({
                    "type": "import",
                    "module": symbol_map.get("module", "unknown"),
                    "content": result.get("content", ""),
                    "file_path": result.get("file_path", ""),
                    "start_line": metadata.get("start_line", 0),
                    "language": metadata.get("language", "unknown"),
                    "imports": symbol_map.get("imports", [])
                })
            elif analysis_type == "symbols":
                analyzed_results.append({
                    "type": "symbol",
                    "name": symbol_map.get("name", "unknown"),
                    "symbol_type": chunk_type,
                    "content": result.get("content", ""),
                    "file_path": result.get("file_path", ""),
                    "start_line": metadata.get("start_line", 0),
                    "end_line": metadata.get("end_line", 0),
                    "language": metadata.get("language", "unknown"),
                    "scope": symbol_map.get("scope", "unknown")
                })
        
        # Limit results
        analyzed_results = analyzed_results[:top_k]
        
        return JSONResponse({
            "status": "success",
            "data": {
                "query": query,
                "analysis_type": analysis_type,
                "total_results": len(analyzed_results),
                "results": analyzed_results
            }
        })
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to analyze code structure: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze code structure: {str(e)}"
        )


@router.post("/document-search")
async def search_documentation(
    query: str,
    doc_type: str = Query("all", description="Document type: markdown, comments, docstrings, or all"),
    top_k: int = Query(15, description="Number of results to return")
) -> JSONResponse:
    """Search documentation and comments with intelligent parsing."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")
        
        if not rag_service:
            raise HTTPException(
                status_code=503,
                detail="RAG service not available"
            )
        
        # Build file type filter based on doc_type
        file_type_filter = None
        if doc_type == "markdown":
            file_type_filter = "*.md"
        elif doc_type == "comments":
            # This would need special handling for comment extraction
            pass
        elif doc_type == "docstrings":
            # This would need special handling for docstring extraction
            pass
        
        # Perform semantic search
        results = await rag_service.semantic_search(
            query=query,
            top_k=top_k,
            file_type_filter=file_type_filter
        )
        
        # Process documentation results
        doc_results = []
        for result in results:
            metadata = result.get("metadata", {})
            chunk_type = metadata.get("chunk_type", "")
            
            # Filter based on document type
            if doc_type == "all" or (
                (doc_type == "markdown" and chunk_type in ["markdown", "documentation"]) or
                (doc_type == "comments" and chunk_type in ["comment", "inline_comment"]) or
                (doc_type == "docstrings" and chunk_type in ["docstring", "function_doc"])
            ):
                doc_results.append({
                    "content": result.get("content", ""),
                    "score": result.get("score", 0.0),
                    "file_path": result.get("file_path", ""),
                    "chunk_type": chunk_type,
                    "start_line": metadata.get("start_line", 0),
                    "end_line": metadata.get("end_line", 0),
                    "language": metadata.get("language", "unknown")
                })
        
        return JSONResponse({
            "status": "success",
            "data": {
                "query": query,
                "doc_type": doc_type,
                "total_results": len(doc_results),
                "results": doc_results
            }
        })
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to search documentation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search documentation: {str(e)}"
        )


@router.get("/search-stats")
async def get_search_statistics() -> JSONResponse:
    """Get semantic search statistics and capabilities."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")
        
        if not rag_service:
            raise HTTPException(
                status_code=503,
                detail="RAG service not available"
            )
        
        # Get search engine stats
        search_stats = {}
        if hasattr(rag_service, 'search_engine'):
            # Check if search engine has get_stats method
            if hasattr(rag_service.search_engine, 'get_stats'):
                search_stats = await rag_service.search_engine.get_stats()
            else:
                search_stats = {"status": "available", "type": "search_engine"}
        
        # Get embedding service stats
        embedding_stats = {}
        if hasattr(rag_service, 'embedding_service'):
            embedding_stats = await rag_service.embedding_service.get_stats()
        
        # Get document indexer stats
        indexer_stats = {}
        if hasattr(rag_service, 'document_indexer'):
            indexer_stats = await rag_service.document_indexer.get_stats()
        
        return JSONResponse({
            "status": "success",
            "data": {
                "search_engine": search_stats,
                "embedding_service": embedding_stats,
                "document_indexer": indexer_stats,
                "capabilities": {
                    "semantic_search": True,
                    "ast_parsing": True,
                    "document_parsing": True,
                    "hybrid_search": True,
                    "code_analysis": True,
                    "symbol_resolution": True
                }
            }
        })
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get search statistics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get search statistics: {str(e)}"
        )
