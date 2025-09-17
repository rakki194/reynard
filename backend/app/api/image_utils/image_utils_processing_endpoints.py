"""
Image Utils Processing Endpoints for Reynard Backend

Processing-specific endpoint implementations.
"""

import logging

from fastapi import APIRouter, HTTPException, status

from app.image_utils import ImageUtils

from .image_utils_models import (
    AspectRatioResponse,
    ImageDimensionsRequest,
    ResizeDimensionsRequest,
    ResizeDimensionsResponse,
)

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/image-utils", tags=["image-utils"])


@router.post("/aspect-ratio", response_model=AspectRatioResponse)
async def get_aspect_ratio(request: ImageDimensionsRequest):
    """Calculate aspect ratio for given dimensions."""
    try:
        aspect_ratio = ImageUtils.get_aspect_ratio(request.width, request.height)
        return AspectRatioResponse(aspect_ratio=aspect_ratio)

    except Exception as e:
        logger.error(f"Failed to calculate aspect ratio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate aspect ratio: {e!s}",
        )


@router.post("/resize-dimensions", response_model=ResizeDimensionsResponse)
async def calculate_resize_dimensions(request: ResizeDimensionsRequest):
    """Calculate resize dimensions maintaining aspect ratio."""
    try:
        width, height = ImageUtils.calculate_resize_dimensions(
            request.original_width,
            request.original_height,
            request.target_width,
            request.target_height,
        )

        return ResizeDimensionsResponse(width=width, height=height)

    except Exception as e:
        logger.error(f"Failed to calculate resize dimensions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate resize dimensions: {e!s}",
        )
