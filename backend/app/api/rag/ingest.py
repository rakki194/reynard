"""RAG Ingestion Endpoints for Reynard Backend

Endpoints for document ingestion and indexing operations.
"""

import logging
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from ...security.mcp_auth import MCPTokenData, require_rag_ingest
from .models import RAGIngestRequest, RAGIngestResponse
from .service import get_rag_service

logger = logging.getLogger("uvicorn")

router = APIRouter(tags=["rag"])


@router.post("/ingest", response_model=RAGIngestResponse)
async def ingest_documents(
    request: RAGIngestRequest, mcp_client: MCPTokenData = Depends(require_rag_ingest),
):
    """Ingest documents into the RAG system."""
    try:
        service = get_rag_service()
        result = await service.ingest_documents(
            items=request.items,
            model=request.model,
            batch_size=request.batch_size,
            force_reindex=request.force_reindex,
        )
        return RAGIngestResponse(**result)
    except Exception as e:
        logger.error(f"Failed to ingest documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest documents: {e!s}",
        )


@router.post("/ingest/stream")
async def ingest_documents_stream(
    request: RAGIngestRequest, mcp_client: MCPTokenData = Depends(require_rag_ingest),
):
    """Stream document ingestion progress."""
    try:
        service = get_rag_service()

        async def generate_stream() -> AsyncGenerator[str]:
            async for event in service.ingest_documents_stream(
                items=request.items,
                model=request.model,
                batch_size=request.batch_size,
                force_reindex=request.force_reindex,
            ):
                yield f"data: {event}\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )
    except Exception as e:
        logger.error(f"Failed to stream document ingestion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stream document ingestion: {e!s}",
        )
