"""
Reynard Content Extractor

Custom gallery-dl extractor for Reynard internal content.
Extracts media from Reynard's internal content management system.
"""

import logging
from typing import Any

from gallery_dl.extractor.common import Extractor, Message

logger = logging.getLogger(__name__)


class ReynardContentExtractor(Extractor):
    """Extractor for Reynard internal content"""

    category = "reynard"
    subcategory = "content"
    pattern = r"reynard://content/(\d+)"
    example = "reynard://content/123"

    def __init__(self, match):
        Extractor.__init__(self, match)
        self.content_id = match.group(1)
        self._content_data = None
        self._media_files = None

    def items(self):
        """Extract content and media files"""
        try:
            # Get content metadata
            content_data = self._get_reynard_content(self.content_id)
            if not content_data:
                logger.error(f"Content not found: {self.content_id}")
                return

            # Yield directory information
            yield (
                Message.Directory,
                {
                    "title": content_data.get(
                        "title", f"Reynard Content {self.content_id}"
                    ),
                    "author": content_data.get("author", "Unknown"),
                    "category": content_data.get("category", "content"),
                    "description": content_data.get("description", ""),
                    "tags": content_data.get("tags", []),
                    "created_at": content_data.get("created_at"),
                    "updated_at": content_data.get("updated_at"),
                    "reynard_id": self.content_id,
                    "reynard_type": "content",
                },
            )

            # Get media files
            media_files = self._get_content_media_files(self.content_id)

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
                        "reynard_content_id": self.content_id,
                        "metadata": media_file.get("metadata", {}),
                        "tags": media_file.get("tags", []),
                        "created_at": media_file.get("created_at"),
                    },
                )

        except Exception as e:
            logger.error(f"Failed to extract content {self.content_id}: {e}")
            raise

    def _get_reynard_content(self, content_id: str) -> dict[str, Any] | None:
        """Get Reynard content metadata"""
        try:
            # This would integrate with Reynard's content management system
            # For now, return mock data
            return {
                "id": content_id,
                "title": f"Reynard Content {content_id}",
                "author": "Reynard User",
                "category": "gallery",
                "description": f"Content extracted from Reynard system (ID: {content_id})",
                "tags": ["reynard", "content", "gallery"],
                "created_at": "2025-01-15T10:00:00Z",
                "updated_at": "2025-01-15T10:00:00Z",
                "status": "active",
                "visibility": "public",
            }
        except Exception as e:
            logger.error(f"Failed to get content {content_id}: {e}")
            return None

    def _get_content_media_files(self, content_id: str) -> list[dict[str, Any]]:
        """Get media files for content"""
        try:
            # This would integrate with Reynard's media storage system
            # For now, return mock data
            return [
                {
                    "id": f"media_{content_id}_1",
                    "url": f"https://reynard.example.com/media/{content_id}/image1.jpg",
                    "filename": f"content_{content_id}_image1.jpg",
                    "extension": ".jpg",
                    "size": 1024000,
                    "mime_type": "image/jpeg",
                    "metadata": {
                        "width": 1920,
                        "height": 1080,
                        "format": "JPEG",
                    },
                    "tags": ["image", "gallery"],
                    "created_at": "2025-01-15T10:00:00Z",
                },
                {
                    "id": f"media_{content_id}_2",
                    "url": f"https://reynard.example.com/media/{content_id}/image2.png",
                    "filename": f"content_{content_id}_image2.png",
                    "extension": ".png",
                    "size": 2048000,
                    "mime_type": "image/png",
                    "metadata": {
                        "width": 2560,
                        "height": 1440,
                        "format": "PNG",
                    },
                    "tags": ["image", "gallery"],
                    "created_at": "2025-01-15T10:00:00Z",
                },
            ]
        except Exception as e:
            logger.error(f"Failed to get media files for content {content_id}: {e}")
            return []

    @classmethod
    def metadata(cls):
        """Get extractor metadata"""
        return {
            "category": cls.category,
            "subcategory": cls.subcategory,
            "pattern": cls.pattern,
            "example": cls.example,
            "description": "Extract media from Reynard internal content",
            "features": ["metadata", "tags", "reynard-integration"],
        }
