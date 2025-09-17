"""
Image Utils API Models for Reynard Backend

Pydantic models for image processing API endpoints.
"""

from pydantic import BaseModel, Field


class ImageFormatResponse(BaseModel):
    extension: str
    mime_type: str
    supported: bool
    requires_plugin: bool | None = None


class ImageProcessingServiceInfoResponse(BaseModel):
    jxl_supported: bool
    avif_supported: bool
    supported_formats: list[str]
    total_formats: int


class ImageValidationRequest(BaseModel):
    file_path: str = Field(..., description="Path to the image file")


class ImageDimensionsRequest(BaseModel):
    width: int = Field(..., ge=1, le=10000, description="Image width")
    height: int = Field(..., ge=1, le=10000, description="Image height")


class ResizeDimensionsRequest(BaseModel):
    original_width: int = Field(..., ge=1, le=10000)
    original_height: int = Field(..., ge=1, le=10000)
    target_width: int | None = Field(default=None, ge=1, le=10000)
    target_height: int | None = Field(default=None, ge=1, le=10000)


class ResizeDimensionsResponse(BaseModel):
    width: int
    height: int


class AspectRatioResponse(BaseModel):
    aspect_ratio: float


class ValidationResponse(BaseModel):
    valid: bool
    message: str | None = None
