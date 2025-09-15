"""
RAG Core Endpoints for Reynard Backend

Core endpoint implementations for RAG search operations.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from ..security.mcp_auth import MCPTokenData, require_rag_config, require_rag_query
from .models import (
    RAGConfigRequest,
    RAGConfigResponse,
    RAGQueryRequest,
    RAGQueryResponse,
)
from .service import get_rag_service

logger = logging.getLogger("uvicorn")

router = APIRouter(tags=["rag"])


@router.post("/query", response_model=RAGQueryResponse)
async def query_rag(
    request: RAGQueryRequest, mcp_client: MCPTokenData = Depends(require_rag_query)
):
    """Perform semantic search using RAG system."""
    try:
        service = get_rag_service()
        result = await service.query(
            query=request.q,
            modality=request.modality,
            top_k=request.top_k,
            similarity_threshold=request.similarity_threshold,
            enable_reranking=request.enable_reranking,
        )
        return RAGQueryResponse(**result)
    except Exception as e:
        logger.error(f"Failed to perform RAG query: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform RAG query: {e!s}",
        )


@router.get("/config", response_model=RAGConfigResponse)
async def get_rag_config(mcp_client: MCPTokenData = Depends(require_rag_config)):
    """Get current RAG configuration."""
    try:
        service = get_rag_service()
        config = await service.get_config()
        return RAGConfigResponse(config=config, updated=False)
    except Exception as e:
        logger.error(f"Failed to get RAG config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get RAG config: {e!s}",
        )


@router.post("/config", response_model=RAGConfigResponse)
async def update_rag_config(
    request: RAGConfigRequest, mcp_client: MCPTokenData = Depends(require_rag_config)
):
    """Update RAG configuration."""
    try:
        service = get_rag_service()
        await service.update_config(request.config)
        updated_config = await service.get_config()
        return RAGConfigResponse(config=updated_config, updated=True)
    except Exception as e:
        logger.error(f"Failed to update RAG config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update RAG config: {e!s}",
        )
