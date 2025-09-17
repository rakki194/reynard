"""
Image Processing Utilities for Reynard Backend

Core image processing operations and transformations.
"""

from .image_types import ImageTransform


class ImageProcessing:
    """Image processing utilities."""

    @classmethod
    def validate_dimensions(cls, width: int, height: int) -> bool:
        """Validate image dimensions."""
        return 0 < width < 10000 and 0 < height < 10000

    @classmethod
    def get_aspect_ratio(cls, width: int, height: int) -> float:
        """Calculate aspect ratio."""
        return width / height if height > 0 else 0

    @classmethod
    def calculate_resize_dimensions(
        cls,
        original_width: int,
        original_height: int,
        target_width: int | None = None,
        target_height: int | None = None,
    ) -> tuple[int, int]:
        """Calculate resize dimensions maintaining aspect ratio."""
        if not target_width and not target_height:
            return original_width, original_height

        aspect_ratio = cls.get_aspect_ratio(original_width, original_height)

        if target_width and not target_height:
            return target_width, int(target_width / aspect_ratio)

        if not target_width and target_height:
            return int(target_height * aspect_ratio), target_height

        # Both dimensions specified - choose the one that maintains aspect ratio better
        return cls._calculate_best_fit_dimensions(
            target_width, target_height, aspect_ratio
        )

    @classmethod
    def _calculate_best_fit_dimensions(
        cls, target_width: int, target_height: int, aspect_ratio: float
    ) -> tuple[int, int]:
        """Calculate best fit dimensions when both target dimensions are specified."""
        width_based_height = int(target_width / aspect_ratio)
        height_based_width = int(target_height * aspect_ratio)

        if abs(width_based_height - target_height) < abs(
            height_based_width - target_width
        ):
            return target_width, width_based_height
        return height_based_width, target_height

    @classmethod
    def generate_filename(
        cls, base_name: str, extension: str, suffix: str | None = None
    ) -> str:
        """Generate image filename with proper extension."""
        normalized_ext = extension if extension.startswith(".") else f".{extension}"
        suffix_part = f"_{suffix}" if suffix else ""
        return f"{base_name}{suffix_part}{normalized_ext}"

    @classmethod
    def get_default_normalization(cls, model_type: str) -> dict[str, list[float]]:
        """Get default normalization values for common models."""
        model_type = model_type.lower()

        if model_type == "imagenet":
            return {"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225]}
        if model_type == "clip":
            return {
                "mean": [0.48145466, 0.4578275, 0.40821073],
                "std": [0.26862954, 0.26130258, 0.27577711],
            }
        if model_type == "siglip":
            return {"mean": [0.5, 0.5, 0.5], "std": [0.5, 0.5, 0.5]}
        return {"mean": [0.5, 0.5, 0.5], "std": [0.5, 0.5, 0.5]}

    @classmethod
    def create_transform(cls, config: dict[str, any]) -> ImageTransform:
        """Create image transform configuration."""
        return ImageTransform(
            resize=config.get("resize"),
            crop=config.get("crop"),
            normalize=config.get("normalize"),
            convert=config.get("convert"),
        )
