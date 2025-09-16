"""
Gallery Service Package

Gallery-dl integration service for Reynard backend.
"""

from .gallery_service import DownloadProgress, DownloadResult, ReynardGalleryService
from .service_initializer import (
    get_gallery_service,
    initialize_gallery_service,
    shutdown_gallery_service,
)

__all__ = [
    "DownloadProgress",
    "DownloadResult",
    "ReynardGalleryService",
    "get_gallery_service",
    "initialize_gallery_service",
    "shutdown_gallery_service",
]
