"""
Reynard User Extractor

Custom gallery-dl extractor for Reynard user profiles.
Extracts media from user profiles and their public content.
"""

import logging
from typing import Any

from gallery_dl.extractor.common import Extractor, Message

logger = logging.getLogger(__name__)


class ReynardUserExtractor(Extractor):
    """Extractor for Reynard user profiles"""

    category = "reynard"
    subcategory = "user"
    pattern = r"reynard://user/([^/]+)"
    example = "reynard://user/username"

    def __init__(self, match):
        Extractor.__init__(self, match)
        self.username = match.group(1)
        self._user_data = None
        self._user_content = None

    def items(self):
        """Extract user profile and content"""
        try:
            # Get user metadata
            user_data = self._get_reynard_user(self.username)
            if not user_data:
                logger.error(f"User not found: {self.username}")
                return

            # Yield directory information
            yield (
                Message.Directory,
                {
                    "title": f"{user_data.get('display_name', self.username)}'s Profile",
                    "author": user_data.get("display_name", self.username),
                    "category": "user",
                    "description": user_data.get("bio", ""),
                    "tags": user_data.get("tags", []),
                    "created_at": user_data.get("created_at"),
                    "updated_at": user_data.get("updated_at"),
                    "reynard_id": user_data.get("id"),
                    "reynard_type": "user",
                    "username": self.username,
                    "user_stats": user_data.get("stats", {}),
                    "profile_settings": user_data.get("settings", {}),
                },
            )

            # Get user content (galleries, posts, etc.)
            user_content = self._get_user_content(self.username)

            # Yield each content item
            for content_item in user_content:
                yield (
                    Message.Url,
                    content_item["url"],
                    {
                        "filename": content_item.get("filename", ""),
                        "extension": content_item.get("extension", ""),
                        "size": content_item.get("size", 0),
                        "mime_type": content_item.get("mime_type", ""),
                        "reynard_id": content_item.get("id"),
                        "reynard_user_id": user_data.get("id"),
                        "metadata": content_item.get("metadata", {}),
                        "tags": content_item.get("tags", []),
                        "created_at": content_item.get("created_at"),
                        "content_type": content_item.get("content_type", "media"),
                    },
                )

        except Exception as e:
            logger.error(f"Failed to extract user {self.username}: {e}")
            raise

    def _get_reynard_user(self, username: str) -> dict[str, Any] | None:
        """Get Reynard user metadata"""
        try:
            # This would integrate with Reynard's user management system
            # For now, return mock data
            return {
                "id": f"user_{username}",
                "username": username,
                "display_name": f"User {username.title()}",
                "bio": f"Reynard user profile for {username}",
                "tags": ["reynard", "user", "profile"],
                "created_at": "2025-01-15T10:00:00Z",
                "updated_at": "2025-01-15T10:00:00Z",
                "status": "active",
                "visibility": "public",
                "stats": {
                    "galleries": 5,
                    "posts": 23,
                    "followers": 42,
                    "following": 18,
                },
                "settings": {
                    "allow_downloads": True,
                    "show_contact": True,
                    "public_profile": True,
                },
            }
        except Exception as e:
            logger.error(f"Failed to get user {username}: {e}")
            return None

    def _get_user_content(self, username: str) -> list[dict[str, Any]]:
        """Get user's public content"""
        try:
            # This would integrate with Reynard's content management system
            # For now, return mock data
            return [
                {
                    "id": f"user_{username}_avatar",
                    "url": f"https://reynard.example.com/users/{username}/avatar.jpg",
                    "filename": f"{username}_avatar.jpg",
                    "extension": ".jpg",
                    "size": 256000,
                    "mime_type": "image/jpeg",
                    "metadata": {
                        "width": 512,
                        "height": 512,
                        "format": "JPEG",
                    },
                    "tags": ["avatar", "profile", "user"],
                    "created_at": "2025-01-15T10:00:00Z",
                    "content_type": "avatar",
                },
                {
                    "id": f"user_{username}_banner",
                    "url": f"https://reynard.example.com/users/{username}/banner.jpg",
                    "filename": f"{username}_banner.jpg",
                    "extension": ".jpg",
                    "size": 1024000,
                    "mime_type": "image/jpeg",
                    "metadata": {
                        "width": 1920,
                        "height": 600,
                        "format": "JPEG",
                    },
                    "tags": ["banner", "profile", "user"],
                    "created_at": "2025-01-15T10:00:00Z",
                    "content_type": "banner",
                },
                {
                    "id": f"user_{username}_post_1",
                    "url": f"https://reynard.example.com/users/{username}/posts/post1.jpg",
                    "filename": f"{username}_post_1.jpg",
                    "extension": ".jpg",
                    "size": 2048000,
                    "mime_type": "image/jpeg",
                    "metadata": {
                        "width": 1920,
                        "height": 1080,
                        "format": "JPEG",
                    },
                    "tags": ["post", "user", "content"],
                    "created_at": "2025-01-15T10:00:00Z",
                    "content_type": "post",
                },
            ]
        except Exception as e:
            logger.error(f"Failed to get content for user {username}: {e}")
            return []

    def metadata(self):
        """Get extractor metadata"""
        return {
            "category": self.category,
            "subcategory": self.subcategory,
            "pattern": self.pattern,
            "example": self.example,
            "description": "Extract media from Reynard user profiles",
            "features": ["metadata", "tags", "user-stats", "reynard-integration"],
        }
