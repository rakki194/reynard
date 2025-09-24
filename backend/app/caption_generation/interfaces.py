"""Caption Generator Interfaces

This module defines the abstract interfaces that all caption generators must implement.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

from .types import CaptionType


class CaptionGenerator(ABC):
    """Abstract base class for Reynard caption generators.

    All caption generators must inherit from this class and implement its abstract
    methods. This ensures a consistent interface across different generator types
    while allowing for model-specific optimizations.
    """

    @abstractmethod
    async def generate(self, image_path: Path, **kwargs) -> str:
        """Generate caption for an image.

        Args:
            image_path (Path): Path to the image file
            **kwargs: Additional model-specific parameters

        Returns:
            str: Generated caption text

        Raises:
            Exception: If caption generation fails

        """

    @abstractmethod
    def is_available(self) -> bool:
        """Check if the model and its dependencies are available.

        Returns:
            bool: True if the generator is ready to use, False otherwise

        """

    @property
    @abstractmethod
    def name(self) -> str:
        """Get the name of the generator.

        Returns:
            str: Unique identifier for this generator type

        """

    @property
    @abstractmethod
    def caption_type(self) -> CaptionType:
        """Get the type of caption this generator produces.

        Returns:
            CaptionType: The type of caption generated

        """

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description of the captioner.

        Returns:
            str: Description of what this captioner does and its strengths

        """

    @property
    @abstractmethod
    def version(self) -> str:
        """Version information for this captioner.

        Returns:
            str: Version string in semver format (e.g., "1.0.0")

        """

    @property
    @abstractmethod
    def config_schema(self) -> dict[str, Any]:
        """JSON Schema for configuration options.

        Returns:
            Dict[str, Any]: JSON Schema describing available configuration options

        """
