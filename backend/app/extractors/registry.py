"""
Reynard Extractor Registry

Manages custom Reynard extractors and integrates them with gallery-dl.
Provides registration, discovery, and management of custom extractors.
"""

import logging
from dataclasses import dataclass
from typing import Any

from gallery_dl import extractor

from .reynard_content import ReynardContentExtractor
from .reynard_gallery import ReynardGalleryExtractor
from .reynard_user import ReynardUserExtractor

logger = logging.getLogger(__name__)


@dataclass
class ExtractorInfo:
    """Information about a custom extractor"""

    name: str
    category: str
    subcategory: str
    pattern: str
    example: str
    description: str
    features: list[str]
    extractor_class: type


class ReynardExtractorRegistry:
    """Registry for Reynard custom extractors"""

    def __init__(self):
        self.custom_extractors: dict[str, ExtractorInfo] = {}
        self.reynard_extractors: dict[str, type] = {}
        self._register_default_extractors()

    def _register_default_extractors(self):
        """Register default Reynard extractors"""
        default_extractors = [
            {
                "name": "reynard-content",
                "extractor_class": ReynardContentExtractor,
            },
            {
                "name": "reynard-gallery",
                "extractor_class": ReynardGalleryExtractor,
            },
            {
                "name": "reynard-user",
                "extractor_class": ReynardUserExtractor,
            },
        ]

        for extractor_info in default_extractors:
            self.register_reynard_extractor(
                extractor_info["name"], extractor_info["extractor_class"]
            )

    def register_reynard_extractor(self, name: str, extractor_class: type):
        """Register a Reynard-specific extractor"""
        try:
            # Get extractor metadata
            metadata = (
                extractor_class.metadata()
                if hasattr(extractor_class, "metadata")
                else {}
            )

            # Create extractor info
            extractor_info = ExtractorInfo(
                name=name,
                category=metadata.get("category", "reynard"),
                subcategory=metadata.get("subcategory", "custom"),
                pattern=metadata.get("pattern", ""),
                example=metadata.get("example", ""),
                description=metadata.get("description", ""),
                features=metadata.get("features", []),
                extractor_class=extractor_class,
            )

            # Register with gallery-dl
            self._register_with_gallery_dl(extractor_class)

            # Store in registry
            self.reynard_extractors[name] = extractor_class
            self.custom_extractors[name] = extractor_info

            logger.info(f"Registered Reynard extractor: {name}")

        except Exception as e:
            logger.error(f"Failed to register extractor {name}: {e}")
            raise

    def _register_with_gallery_dl(self, extractor_class: type):
        """Register extractor with gallery-dl's internal registry"""
        try:
            # Get category and subcategory from extractor
            category = getattr(extractor_class, "category", "reynard")
            subcategory = getattr(extractor_class, "subcategory", "custom")

            # Register with gallery-dl
            if category not in extractor.extractors:
                extractor.extractors[category] = {}

            extractor.extractors[category][subcategory] = extractor_class

            logger.debug(f"Registered {category}.{subcategory} with gallery-dl")

        except Exception as e:
            logger.error(f"Failed to register with gallery-dl: {e}")
            raise

    def get_available_extractors(self) -> list[dict[str, Any]]:
        """Get all available extractors with Reynard metadata"""
        extractors = []

        # Add Reynard custom extractors
        for name, info in self.custom_extractors.items():
            extractors.append(
                {
                    "name": name,
                    "category": info.category,
                    "subcategory": info.subcategory,
                    "pattern": info.pattern,
                    "example": info.example,
                    "description": info.description,
                    "features": info.features,
                    "reynard_enabled": True,
                    "type": "custom",
                }
            )

        # Add standard gallery-dl extractors
        for category, extractors_dict in extractor.extractors.items():
            for subcategory, extractor_class in extractors_dict.items():
                try:
                    # Skip Reynard extractors (already added)
                    if category == "reynard":
                        continue

                    # Get extractor info
                    pattern = getattr(extractor_class, "pattern", [])
                    if isinstance(pattern, str):
                        pattern = [pattern]

                    extractors.append(
                        {
                            "name": f"{category}.{subcategory}",
                            "category": category,
                            "subcategory": subcategory,
                            "pattern": pattern,
                            "description": getattr(extractor_class, "__doc__", ""),
                            "reynard_enabled": False,
                            "type": "standard",
                        }
                    )

                except Exception as e:
                    logger.warning(
                        f"Failed to get extractor info for {category}.{subcategory}: {e}"
                    )

        return extractors

    def get_reynard_extractors(self) -> list[dict[str, Any]]:
        """Get only Reynard custom extractors"""
        return [
            {
                "name": name,
                "category": info.category,
                "subcategory": info.subcategory,
                "pattern": info.pattern,
                "example": info.example,
                "description": info.description,
                "features": info.features,
                "reynard_enabled": True,
                "type": "custom",
            }
            for name, info in self.custom_extractors.items()
        ]

    def find_extractor_for_url(self, url: str) -> dict[str, Any] | None:
        """Find the best extractor for a given URL"""
        try:
            # Check Reynard extractors first
            for name, info in self.custom_extractors.items():
                if info.pattern and self._url_matches_pattern(url, info.pattern):
                    return {
                        "name": name,
                        "category": info.category,
                        "subcategory": info.subcategory,
                        "pattern": info.pattern,
                        "example": info.example,
                        "description": info.description,
                        "features": info.features,
                        "reynard_enabled": True,
                        "type": "custom",
                    }

            # Check standard gallery-dl extractors
            for category, extractors_dict in extractor.extractors.items():
                for subcategory, extractor_class in extractors_dict.items():
                    pattern = getattr(extractor_class, "pattern", [])
                    if isinstance(pattern, str):
                        pattern = [pattern]

                    if self._url_matches_pattern(url, pattern):
                        return {
                            "name": f"{category}.{subcategory}",
                            "category": category,
                            "subcategory": subcategory,
                            "pattern": pattern,
                            "description": getattr(extractor_class, "__doc__", ""),
                            "reynard_enabled": False,
                            "type": "standard",
                        }

            return None

        except Exception as e:
            logger.error(f"Failed to find extractor for URL {url}: {e}")
            return None

    def _url_matches_pattern(self, url: str, patterns: list[str]) -> bool:
        """Check if URL matches any of the patterns"""
        if not patterns:
            return False

        for pattern in patterns:
            try:
                import re

                if re.match(pattern, url):
                    return True
            except Exception:
                # If regex fails, try simple string matching
                if url.startswith(pattern):
                    return True

        return False

    def get_extractor_stats(self) -> dict[str, Any]:
        """Get statistics about registered extractors"""
        total_extractors = len(extractor.extractors)
        reynard_extractors = len(self.custom_extractors)
        standard_extractors = total_extractors - reynard_extractors

        return {
            "total_extractors": total_extractors,
            "reynard_extractors": reynard_extractors,
            "standard_extractors": standard_extractors,
            "categories": list(extractor.extractors.keys()),
            "reynard_categories": list(
                set(info.category for info in self.custom_extractors.values())
            ),
        }


# Global registry instance
extractor_registry = ReynardExtractorRegistry()
