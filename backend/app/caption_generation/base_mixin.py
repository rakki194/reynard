"""Caption Generator Base Mixin

This module provides default implementations and utility methods
for caption generators.
"""

from typing import Any

from .types import ModelCategory


class CaptionGeneratorMixin:
    """Mixin class providing default implementations for caption generators.

    This mixin provides sensible defaults for optional methods and properties
    that generators can override as needed.
    """

    @property
    def features(self) -> list[str]:
        """List of special features/capabilities this captioner supports.

        Returns:
            List[str]: List of feature identifiers

        """
        return []

    @property
    def model_category(self) -> ModelCategory:
        """Get the category of this model based on resource requirements.

        Returns:
            ModelCategory: The category of this model

        """
        return ModelCategory.HEAVY

    @property
    def is_loaded(self) -> bool:
        """Check if the model is currently loaded in memory.

        Returns:
            bool: True if the model is loaded, False otherwise

        """
        return False

    async def load(self, config: dict[str, Any] | None = None) -> None:
        """Load the model into memory.

        Args:
            config: Optional configuration for loading

        """

    async def unload(self) -> None:
        """Unload the model from memory."""

    def get_info(self) -> dict[str, Any]:
        """Get comprehensive information about this generator.

        Returns:
            Dict[str, Any]: Dictionary containing all generator information

        """
        return {
            "name": self.name,
            "description": self.description,
            "version": self.version,
            "caption_type": self.caption_type.value,
            "is_available": self.is_available(),
            "is_loaded": self.is_loaded,
            "config_schema": self.config_schema,
            "features": self.features,
            "model_category": self.model_category.value,
        }
