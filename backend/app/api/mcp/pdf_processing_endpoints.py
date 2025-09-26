"""
PDF Processing API Endpoints
===========================

API endpoints for processing PDF papers to markdown using Marker.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from app.core.project_root import get_papers_directory
from app.services.pdf_processor import (
    MARKER_PACKAGE_ENABLED,
    PDF_PROCESSING_ENABLED,
    pdf_processor,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp/pdf-processing", tags=["PDF Processing"])


class PDFProcessingRequest(BaseModel):
    """Request model for PDF processing."""

    pdf_path: str
    output_dir: Optional[str] = None
    use_llm: bool = False


class PaperCollectionRequest(BaseModel):
    """Request model for processing a collection of papers."""

    papers_dir: str
    use_llm: bool = False
    max_papers: Optional[int] = None


class ProcessingResult(BaseModel):
    """Result model for PDF processing."""

    success: bool
    pdf_path: str
    markdown_path: Optional[str] = None
    pdf_size: Optional[int] = None
    markdown_size: Optional[int] = None
    processing_time: Optional[float] = None
    use_llm: bool = False
    compression_ratio: Optional[float] = None
    error: Optional[str] = None


class CollectionResult(BaseModel):
    """Result model for paper collection processing."""

    success: bool
    total_papers: int
    successful: int
    failed: int
    results: List[ProcessingResult]
    stats: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@router.post("/process-pdf", response_model=ProcessingResult)
async def process_pdf(request: PDFProcessingRequest):
    """
    Process a single PDF file to markdown.

    Args:
        request: PDF processing request

    Returns:
        Processing result
    """
    if not PDF_PROCESSING_ENABLED:
        raise HTTPException(status_code=503, detail="PDF processing is disabled")

    try:
        logger.info(f"Processing PDF: {request.pdf_path}")

        result = await pdf_processor.process_pdf_to_markdown(
            pdf_path=request.pdf_path,
            output_dir=request.output_dir,
            use_llm=request.use_llm,
        )

        return ProcessingResult(**result)

    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-collection", response_model=CollectionResult)
async def process_paper_collection(request: PaperCollectionRequest):
    """
    Process a collection of PDF papers to markdown.

    Args:
        request: Paper collection processing request

    Returns:
        Collection processing result
    """
    try:
        logger.info(f"Processing paper collection: {request.papers_dir}")

        result = await pdf_processor.process_paper_collection(
            papers_dir=request.papers_dir,
            use_llm=request.use_llm,
            max_papers=request.max_papers,
        )

        if not result["success"]:
            return CollectionResult(
                success=False,
                total_papers=0,
                successful=0,
                failed=0,
                results=[],
                error=result["error"],
            )

        # Convert results to ProcessingResult objects
        processing_results = [ProcessingResult(**r) for r in result["results"]]

        # Get processing stats
        stats = pdf_processor.get_processing_stats(result["results"])

        return CollectionResult(
            success=True,
            total_papers=result["total_papers"],
            successful=result["successful"],
            failed=result["failed"],
            results=processing_results,
            stats=stats,
        )

    except Exception as e:
        logger.error(f"Error processing paper collection: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_processing_status():
    """
    Get the status of the PDF processing service.

    Returns:
        Service status
    """
    try:
        status = {
            "service_available": PDF_PROCESSING_ENABLED,
            "marker_package_enabled": MARKER_PACKAGE_ENABLED,
            "models_initialized": (
                pdf_processor._models_initialized if PDF_PROCESSING_ENABLED else False
            ),
            "converter_available": (
                pdf_processor.models is not None if PDF_PROCESSING_ENABLED else False
            ),
        }

        return {"success": True, "status": status}

    except Exception as e:
        logger.error(f"Error getting processing status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-research-papers")
async def process_research_papers(
    use_llm: bool = False, max_papers: Optional[int] = None
):
    """
    Process all research papers in the backend/data/papers directory.

    Args:
        use_llm: Whether to use LLM for enhanced processing
        max_papers: Maximum number of papers to process

    Returns:
        Processing result
    """
    try:
        papers_dir = str(get_papers_directory())
        logger.info(f"Processing research papers from: {papers_dir}")

        result = await pdf_processor.process_paper_collection(
            papers_dir=papers_dir, use_llm=use_llm, max_papers=max_papers
        )

        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])

        # Get processing stats
        stats = pdf_processor.get_processing_stats(result["results"])

        return {
            "success": True,
            "message": f"Processed {result['successful']}/{result['total_papers']} papers successfully",
            "stats": stats,
            "results": result["results"],
        }

    except Exception as e:
        logger.error(f"Error processing research papers: {e}")
        raise HTTPException(status_code=500, detail=str(e))
