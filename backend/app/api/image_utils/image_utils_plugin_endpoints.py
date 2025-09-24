"""Image Utils Plugin Endpoints for Reynard Backend

Plugin-specific endpoints for image processing operations.
"""

import logging

from fastapi import APIRouter, HTTPException, status

from app.image_utils import ImageUtils, get_image_processing_service

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/image-utils", tags=["image-utils"])


@router.get("/jxl-supported")
async def is_jxl_supported():
    """Check if JXL format is supported."""
    try:
        service = await get_image_processing_service()
        return {"jxl_supported": service.is_jxl_supported()}

    except Exception as e:
        logger.error(f"Failed to check JXL support: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check JXL support: {e!s}",
        )


@router.get("/avif-supported")
async def is_avif_supported():
    """Check if AVIF format is supported."""
    try:
        service = await get_image_processing_service()
        return {"avif_supported": service.is_avif_supported()}

    except Exception as e:
        logger.error(f"Failed to check AVIF support: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check AVIF support: {e!s}",
        )


@router.get("/normalization/{model_type}")
async def get_default_normalization(model_type: str):
    """Get default normalization values for a model type."""
    try:
        normalization = ImageUtils.get_default_normalization(model_type)
        return {"model_type": model_type, "normalization": normalization}

    except Exception as e:
        logger.error(f"Failed to get normalization for {model_type}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get normalization: {e!s}",
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for the image utils service."""
    try:
        service = await get_image_processing_service()
        return {
            "status": "healthy",
            "jxl_supported": service.is_jxl_supported(),
            "avif_supported": service.is_avif_supported(),
            "supported_formats_count": len(
                service.get_supported_formats_for_inference(),
            ),
        }

    except Exception as e:
        logger.error(f"Image utils health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}
