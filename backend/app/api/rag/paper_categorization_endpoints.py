#!/usr/bin/env python3
"""
Paper Categorization API Endpoints
=================================

API endpoints for paper categorization and RAG indexing integration.
Provides RESTful access to the document categorization system.

🦊 Fox approach: We strategically expose categorization capabilities with the cunning
precision of a fox, ensuring seamless integration with the existing RAG infrastructure!
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from fastapi import Path as FastAPIPath
from fastapi import Query
from pydantic import BaseModel, Field

from ...config.rag_config import get_rag_config
from ...core.logging_config import get_service_logger
from ...services.rag.rag_service import RAGService

logger = get_service_logger("rag-paper-categorization")

# Create router
router = APIRouter(prefix="/api/rag/papers", tags=["Paper Categorization"])


# Pydantic models
class PaperMetadata(BaseModel):
    """Paper metadata for categorization."""

    paper_id: str = Field(..., description="Unique paper identifier")
    title: str = Field(..., description="Paper title")
    abstract: str = Field(..., description="Paper abstract")
    authors: List[str] = Field(default_factory=list, description="List of authors")
    categories: List[str] = Field(default_factory=list, description="arXiv categories")
    published_date: Optional[str] = Field(None, description="Publication date")
    pdf_path: Optional[str] = Field(None, description="Path to PDF file")


class CategorizationResult(BaseModel):
    """Categorization result."""

    success: bool = Field(..., description="Whether categorization was successful")
    primary_domain: Optional[str] = Field(None, description="Primary scientific domain")
    secondary_domains: List[str] = Field(
        default_factory=list, description="Secondary domains"
    )
    confidence: Optional[float] = Field(None, description="Confidence score (0.0-1.0)")
    keywords: List[str] = Field(default_factory=list, description="Matched keywords")
    domain_tags: List[str] = Field(
        default_factory=list, description="Domain tags for search"
    )
    reasoning: Optional[str] = Field(None, description="Human-readable reasoning")
    error: Optional[str] = Field(None, description="Error message if failed")


class BatchProcessingRequest(BaseModel):
    """Request for batch processing papers."""

    papers_directory: Optional[str] = Field(
        None, description="Directory containing papers"
    )
    max_papers: Optional[int] = Field(
        None, description="Maximum number of papers to process"
    )
    force_reprocess: bool = Field(
        False, description="Force reprocessing of existing papers"
    )


class BatchProcessingResult(BaseModel):
    """Result of batch processing."""

    processed: int = Field(..., description="Number of papers successfully processed")
    failed: int = Field(..., description="Number of papers that failed processing")
    success_rate: float = Field(..., description="Success rate percentage")
    domain_statistics: Dict[str, Any] = Field(
        ..., description="Domain distribution statistics"
    )
    processing_summary: Dict[str, Any] = Field(..., description="Processing summary")


class RAGReadyPapersRequest(BaseModel):
    """Request for RAG-ready papers."""

    domain_filter: Optional[str] = Field(
        None, description="Filter by scientific domain"
    )
    min_confidence: float = Field(0.0, description="Minimum confidence threshold")
    limit: Optional[int] = Field(None, description="Maximum number of papers to return")


# Global RAG service instance
_rag_service: Optional[RAGService] = None


def get_rag_service() -> RAGService:
    """Get the global RAG service instance."""
    global _rag_service
    if _rag_service is None:
        config = get_rag_config().to_dict()
        _rag_service = RAGService(config)
    return _rag_service


@router.post("/categorize", response_model=CategorizationResult)
async def categorize_paper(metadata: PaperMetadata) -> CategorizationResult:
    """
    Categorize a single paper into scientific domains.

    This endpoint analyzes the paper's title, abstract, and arXiv categories
    to determine its primary and secondary scientific domains.
    """
    try:
        rag_service = get_rag_service()

        # Convert to dict format expected by the service
        metadata_dict = {
            "paper_id": metadata.paper_id,
            "title": metadata.title,
            "abstract": metadata.abstract,
            "authors": metadata.authors,
            "categories": metadata.categories,
            "published_date": metadata.published_date,
            "pdf_path": metadata.pdf_path,
        }

        result = await rag_service.categorize_paper(metadata_dict)

        if result.get("success", False):
            return CategorizationResult(
                success=True,
                primary_domain=result.get("primary_domain"),
                secondary_domains=result.get("secondary_domains", []),
                confidence=result.get("confidence"),
                keywords=result.get("keywords", []),
                domain_tags=result.get("domain_tags", []),
                reasoning=result.get("reasoning"),
            )
        else:
            return CategorizationResult(
                success=False, error=result.get("error", "Unknown error")
            )

    except Exception as e:
        logger.error(f"Failed to categorize paper: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to categorize paper: {str(e)}"
        )


@router.post("/process-batch", response_model=BatchProcessingResult)
async def process_papers_batch(
    request: BatchProcessingRequest,
) -> BatchProcessingResult:
    """
    Process multiple papers for RAG indexing with automatic categorization.

    This endpoint processes all papers in a directory, categorizing them
    and preparing them for RAG indexing.
    """
    try:
        rag_service = get_rag_service()

        result = await rag_service.process_papers_for_rag(
            papers_directory=request.papers_directory,
            max_papers=request.max_papers,
            force_reprocess=request.force_reprocess,
        )

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return BatchProcessingResult(
            processed=result["processed"],
            failed=result["failed"],
            success_rate=result["processing_summary"]["success_rate"],
            domain_statistics=result["domain_statistics"],
            processing_summary=result["processing_summary"],
        )

    except Exception as e:
        logger.error(f"Failed to process papers batch: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to process papers: {str(e)}"
        )


@router.get("/rag-ready", response_model=List[Dict[str, Any]])
async def get_rag_ready_papers(
    domain_filter: Optional[str] = Query(
        None, description="Filter by scientific domain"
    ),
    min_confidence: float = Query(0.0, description="Minimum confidence threshold"),
    limit: Optional[int] = Query(
        None, description="Maximum number of papers to return"
    ),
) -> List[Dict[str, Any]]:
    """
    Get papers that are ready for RAG indexing.

    Returns papers that have been processed and categorized, ready for
    indexing in the RAG system.
    """
    try:
        rag_service = get_rag_service()

        papers = await rag_service.get_rag_ready_papers(
            domain_filter=domain_filter, min_confidence=min_confidence, limit=limit
        )

        return papers

    except Exception as e:
        logger.error(f"Failed to get RAG ready papers: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get RAG ready papers: {str(e)}"
        )


@router.get("/statistics", response_model=Dict[str, Any])
async def get_categorization_statistics() -> Dict[str, Any]:
    """
    Get categorization service statistics.

    Returns comprehensive statistics about the categorization service
    including domain distribution, confidence scores, and performance metrics.
    """
    try:
        rag_service = get_rag_service()

        stats = await rag_service.get_categorization_statistics()

        if "error" in stats:
            raise HTTPException(status_code=500, detail=stats["error"])

        return stats

    except Exception as e:
        logger.error(f"Failed to get categorization statistics: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get statistics: {str(e)}"
        )


@router.get("/domains", response_model=List[str])
async def get_available_domains() -> List[str]:
    """
    Get list of available scientific domains.

    Returns all available scientific domains that papers can be categorized into.
    """
    try:
        from ...services.rag.services.core.document_categorization import (
            ScientificDomain,
        )

        return [domain.value for domain in ScientificDomain]

    except Exception as e:
        logger.error(f"Failed to get available domains: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get domains: {str(e)}")


@router.get("/paper/{paper_id}/categorization", response_model=CategorizationResult)
async def get_paper_categorization(
    paper_id: str = FastAPIPath(..., description="Paper ID")
) -> CategorizationResult:
    """
    Get categorization for a specific paper.

    Retrieves the categorization information for a paper that has already
    been processed by the system.
    """
    try:
        rag_service = get_rag_service()

        # Get RAG ready papers and filter by paper_id
        papers = await rag_service.get_rag_ready_papers(limit=1000)  # Get all papers

        for paper in papers:
            if paper.get("paper_id") == paper_id:
                categorization = paper.get("categorization", {})
                return CategorizationResult(
                    success=True,
                    primary_domain=categorization.get("primary_domain"),
                    secondary_domains=categorization.get("secondary_domains", []),
                    confidence=categorization.get("confidence"),
                    keywords=categorization.get("keywords", []),
                    domain_tags=categorization.get("domain_tags", []),
                    reasoning=categorization.get("reasoning"),
                )

        raise HTTPException(
            status_code=404, detail=f"Paper {paper_id} not found or not categorized"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get paper categorization: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get paper categorization: {str(e)}"
        )


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint for paper categorization service.

    Returns the health status of the categorization service.
    """
    try:
        rag_service = get_rag_service()

        if rag_service.is_initialized():
            return {"status": "healthy", "service": "paper-categorization"}
        else:
            return {
                "status": "unhealthy",
                "service": "paper-categorization",
                "reason": "not initialized",
            }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "paper-categorization",
            "error": str(e),
        }
