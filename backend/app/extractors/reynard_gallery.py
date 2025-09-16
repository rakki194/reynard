"""
Reynard Gallery Extractor

Custom gallery-dl extractor for Reynard user galleries.
Extracts media from user-created galleries in the Reynard system.
"""

import logging
from typing import Any

from gallery_dl.extractor.common import Extractor, Message

logger = logging.getLogger(__name__)


class ReynardGalleryExtractor(Extractor):
    """Extractor for Reynard user galleries"""

    category = "reynard"
    subcategory = "gallery"
    pattern = r"reynard://gallery/(\d+)"
    example = "reynard://gallery/456"

    def __init__(self, match):
        Extractor.__init__(self, match)
        self.gallery_id = match.group(1)
        self._gallery_data = None
        self._media_files = None

    def items(self):
        """Extract gallery and media files"""
        try:
            # Get gallery metadata
            gallery_data = self._get_reynard_gallery(self.gallery_id)
            if not gallery_data:
                logger.error(f"Gallery not found: {self.gallery_id}")
                return

            # Yield directory information
            yield (
                Message.Directory,
                {
                    "title": gallery_data.get(
                        "title", f"Reynard Gallery {self.gallery_id}"
                    ),
                    "author": gallery_data.get("author", "Unknown"),
                    "category": "gallery",
                    "description": gallery_data.get("description", ""),
                    "tags": gallery_data.get("tags", []),
                    "created_at": gallery_data.get("created_at"),
                    "updated_at": gallery_data.get("updated_at"),
                    "reynard_id": self.gallery_id,
                    "reynard_type": "gallery",
                    "gallery_settings": gallery_data.get("settings", {}),
                    "view_count": gallery_data.get("view_count", 0),
                    "like_count": gallery_data.get("like_count", 0),
                },
            )

            # Get media files
            media_files = self._get_gallery_media_files(self.gallery_id)

            # Yield each media file
            for media_file in media_files:
                yield (
                    Message.Url,
                    media_file["url"],
                    {
                        "filename": media_file.get("filename", ""),
                        "extension": media_file.get("extension", ""),
                        "size": media_file.get("size", 0),
                        "mime_type": media_file.get("mime_type", ""),
                        "reynard_id": media_file.get("id"),
                        "reynard_gallery_id": self.gallery_id,
                        "metadata": media_file.get("metadata", {}),
                        "tags": media_file.get("tags", []),
                        "created_at": media_file.get("created_at"),
                        "order": media_file.get("order", 0),
                    },
                )

        except Exception as e:
            logger.error(f"Failed to extract gallery {self.gallery_id}: {e}")
            raise

    def _get_reynard_gallery(self, gallery_id: str) -> dict[str, Any] | None:
        """Get Reynard gallery metadata"""
        try:
            # This would integrate with Reynard's gallery management system
            # For now, return mock data
            return {
                "id": gallery_id,
                "title": f"Reynard Gallery {gallery_id}",
                "author": "Reynard User",
                "description": f"User-created gallery in Reynard system (ID: {gallery_id})",
                "tags": ["reynard", "gallery", "user-created"],
                "created_at": "2025-01-15T10:00:00Z",
                "updated_at": "2025-01-15T10:00:00Z",
                "status": "active",
                "visibility": "public",
                "settings": {
                    "allow_downloads": True,
                    "show_metadata": True,
                    "watermark": False,
                },
                "view_count": 42,
                "like_count": 7,
            }
        except Exception as e:
            logger.error(f"Failed to get gallery {gallery_id}: {e}")
            return None

    def _get_gallery_media_files(self, gallery_id: str) -> list[dict[str, Any]]:
        """Get media files for gallery"""
        try:
            # This would integrate with Reynard's media storage system
            # For now, return mock data
            return [
                {
                    "id": f"gallery_{gallery_id}_1",
                    "url": f"https://reynard.example.com/galleries/{gallery_id}/photo1.jpg",
                    "filename": f"gallery_{gallery_id}_photo1.jpg",
                    "extension": ".jpg",
                    "size": 1536000,
                    "mime_type": "image/jpeg",
                    "metadata": {
                        "width": 2048,
                        "height": 1536,
                        "format": "JPEG",
                        "camera": "Canon EOS R5",
                        "lens": "24-70mm f/2.8",
                    },
                    "tags": ["photo", "gallery", "art"],
                    "created_at": "2025-01-15T10:00:00Z",
                    "order": 1,
                },
                {
                    "id": f"gallery_{gallery_id}_2",
                    "url": f"https://reynard.example.com/galleries/{gallery_id}/photo2.jpg",
                    "filename": f"gallery_{gallery_id}_photo2.jpg",
                    "extension": ".jpg",
                    "size": 2048000,
                    "mime_type": "image/jpeg",
                    "metadata": {
                        "width": 2560,
                        "height": 1920,
                        "format": "JPEG",
                        "camera": "Canon EOS R5",
                        "lens": "70-200mm f/2.8",
                    },
                    "tags": ["photo", "gallery", "nature"],
                    "created_at": "2025-01-15T10:00:00Z",
                    "order": 2,
                },
                {
                    "id": f"gallery_{gallery_id}_3",
                    "url": f"https://reynard.example.com/galleries/{gallery_id}/video1.mp4",
                    "filename": f"gallery_{gallery_id}_video1.mp4",
                    "extension": ".mp4",
                    "size": 15728640,  # 15MB
                    "mime_type": "video/mp4",
                    "metadata": {
                        "width": 1920,
                        "height": 1080,
                        "format": "MP4",
                        "duration": 30.5,
                        "fps": 30,
                    },
                    "tags": ["video", "gallery", "timelapse"],
                    "created_at": "2025-01-15T10:00:00Z",
                    "order": 3,
                },
            ]
        except Exception as e:
            logger.error(f"Failed to get media files for gallery {gallery_id}: {e}")
            return []

    def metadata(self):
        """Get extractor metadata"""
        return {
            "category": self.category,
            "subcategory": self.subcategory,
            "pattern": self.pattern,
            "example": self.example,
            "description": "Extract media from Reynard user galleries",
            "features": ["metadata", "tags", "gallery-settings", "reynard-integration"],
        }
