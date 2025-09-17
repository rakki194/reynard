"""
Image Utils Core Endpoints for Reynard Backend

Core endpoint implementations for image processing operations.
"""

import logging

from fastapi import APIRouter, HTTPException, status

from app.image_utils import ImageUtils, get_image_processing_service

from .image_utils_models import (
    ImageDimensionsRequest,
    ImageFormatResponse,
    ImageProcessingServiceInfoResponse,
    ImageValidationRequest,
    ValidationResponse,
)

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/image-utils", tags=["image-utils"])


@router.get("/service-info", response_model=ImageProcessingServiceInfoResponse)
async def get_service_info():
    """Get image processing service information."""
    try:
        service = await get_image_processing_service()
        supported_formats = service.get_supported_formats_for_inference()

        return ImageProcessingServiceInfoResponse(
            jxl_supported=service.is_jxl_supported(),
            avif_supported=service.is_avif_supported(),
            supported_formats=supported_formats,
            total_formats=len(supported_formats),
        )

    except Exception as e:
        logger.error(f"Failed to get service info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get service info: {e!s}",
        )


@router.get("/supported-formats", response_model=list[str])
async def get_supported_formats():
    """Get list of supported image formats."""
    try:
        service = await get_image_processing_service()
        return service.get_supported_formats_for_inference()

    except Exception as e:
        logger.error(f"Failed to get supported formats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get supported formats: {e!s}",
        )


@router.get("/format/{extension}", response_model=ImageFormatResponse)
async def get_format_info(extension: str):
    """Get format information for a specific extension."""
    try:
        format_info = ImageUtils.get_format_info(extension)
        if not format_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Format not found: {extension}",
            )

        return ImageFormatResponse(
            extension=format_info.extension,
            mime_type=format_info.mime_type,
            supported=format_info.supported,
            requires_plugin=format_info.requires_plugin,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get format info for {extension}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get format info: {e!s}",
        )


@router.post("/validate-path", response_model=ValidationResponse)
async def validate_image_path(request: ImageValidationRequest):
    """Validate an image file path."""
    try:
        valid = ImageUtils.validate_image_path(request.file_path)
        return ValidationResponse(
            valid=valid, message="Valid image path" if valid else "Invalid image path"
        )

    except Exception as e:
        logger.error(f"Failed to validate image path: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate image path: {e!s}",
        )


@router.post("/validate-dimensions", response_model=ValidationResponse)
async def validate_dimensions(request: ImageDimensionsRequest):
    """Validate image dimensions."""
    try:
        valid = ImageUtils.validate_dimensions(request.width, request.height)
        return ValidationResponse(
            valid=valid, message="Valid dimensions" if valid else "Invalid dimensions"
        )

    except Exception as e:
        logger.error(f"Failed to validate dimensions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate dimensions: {e!s}",
        )
