"""Tests for the image_processing module."""

from app.utils.image_processing import ImageProcessing
from app.utils.image_types import ImageTransform


class TestImageProcessing:
    """Test cases for ImageProcessing class."""

    def test_validate_dimensions_valid(self):
        """Test validate_dimensions with valid dimensions."""
        assert ImageProcessing.validate_dimensions(100, 200) is True
        assert ImageProcessing.validate_dimensions(1, 1) is True
        assert ImageProcessing.validate_dimensions(9999, 9999) is True

    def test_validate_dimensions_invalid(self):
        """Test validate_dimensions with invalid dimensions."""
        assert ImageProcessing.validate_dimensions(0, 100) is False
        assert ImageProcessing.validate_dimensions(100, 0) is False
        assert ImageProcessing.validate_dimensions(-1, 100) is False
        assert ImageProcessing.validate_dimensions(100, -1) is False
        assert ImageProcessing.validate_dimensions(10000, 100) is False
        assert ImageProcessing.validate_dimensions(100, 10000) is False

    def test_get_aspect_ratio_normal(self):
        """Test get_aspect_ratio with normal dimensions."""
        assert ImageProcessing.get_aspect_ratio(100, 50) == 2.0
        assert ImageProcessing.get_aspect_ratio(50, 100) == 0.5
        assert ImageProcessing.get_aspect_ratio(100, 100) == 1.0

    def test_get_aspect_ratio_zero_height(self):
        """Test get_aspect_ratio with zero height."""
        assert ImageProcessing.get_aspect_ratio(100, 0) == 0

    def test_calculate_resize_dimensions_no_target(self):
        """Test calculate_resize_dimensions with no target dimensions."""
        result = ImageProcessing.calculate_resize_dimensions(100, 200)
        assert result == (100, 200)

    def test_calculate_resize_dimensions_target_width_only(self):
        """Test calculate_resize_dimensions with target width only."""
        result = ImageProcessing.calculate_resize_dimensions(100, 200, target_width=50)
        assert result == (50, 100)  # 50 / (100/200) = 50 / 0.5 = 100

    def test_calculate_resize_dimensions_target_height_only(self):
        """Test calculate_resize_dimensions with target height only."""
        result = ImageProcessing.calculate_resize_dimensions(100, 200, target_height=50)
        assert result == (25, 50)  # 50 * (100/200) = 25

    def test_calculate_resize_dimensions_both_targets_width_based(self):
        """Test calculate_resize_dimensions with both targets, width-based better fit."""
        # Original: 100x200 (aspect ratio 0.5)
        # Target: 50x30
        # Width-based: 50x100 (diff: |100-30| = 70)
        # Height-based: 15x30 (diff: |15-50| = 35)
        # Height-based is better, so should return (15, 30)
        result = ImageProcessing.calculate_resize_dimensions(
            100, 200, target_width=50, target_height=30
        )
        assert result == (15, 30)

    def test_calculate_resize_dimensions_both_targets_height_based(self):
        """Test calculate_resize_dimensions with both targets, height-based better fit."""
        # Original: 200x100 (aspect ratio 2.0)
        # Target: 50x30
        # Width-based: 50x25 (diff: |25-30| = 5)
        # Height-based: 60x30 (diff: |60-50| = 10)
        # Width-based is better, so should return (50, 25)
        result = ImageProcessing.calculate_resize_dimensions(
            200, 100, target_width=50, target_height=30
        )
        assert result == (50, 25)

    def test_calculate_best_fit_dimensions_width_based(self):
        """Test _calculate_best_fit_dimensions with width-based better fit."""
        result = ImageProcessing._calculate_best_fit_dimensions(50, 30, 0.5)
        # Width-based: 50x100 (diff: |100-30| = 70)
        # Height-based: 15x30 (diff: |15-50| = 35)
        # Height-based is better
        assert result == (15, 30)

    def test_calculate_best_fit_dimensions_height_based(self):
        """Test _calculate_best_fit_dimensions with height-based better fit."""
        result = ImageProcessing._calculate_best_fit_dimensions(50, 30, 2.0)
        # Width-based: 50x25 (diff: |25-30| = 5)
        # Height-based: 60x30 (diff: |60-50| = 10)
        # Width-based is better
        assert result == (50, 25)

    def test_generate_filename_basic(self):
        """Test generate_filename with basic parameters."""
        result = ImageProcessing.generate_filename("image", "jpg")
        assert result == "image.jpg"

    def test_generate_filename_with_dot_extension(self):
        """Test generate_filename with extension that already has dot."""
        result = ImageProcessing.generate_filename("image", ".png")
        assert result == "image.png"

    def test_generate_filename_with_suffix(self):
        """Test generate_filename with suffix."""
        result = ImageProcessing.generate_filename("image", "jpg", "thumb")
        assert result == "image_thumb.jpg"

    def test_generate_filename_with_suffix_and_dot_extension(self):
        """Test generate_filename with suffix and dot extension."""
        result = ImageProcessing.generate_filename("image", ".png", "resized")
        assert result == "image_resized.png"

    def test_get_default_normalization_imagenet(self):
        """Test get_default_normalization for ImageNet model."""
        result = ImageProcessing.get_default_normalization("imagenet")
        expected = {"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225]}
        assert result == expected

    def test_get_default_normalization_imagenet_case_insensitive(self):
        """Test get_default_normalization for ImageNet model with different case."""
        result = ImageProcessing.get_default_normalization("IMAGENET")
        expected = {"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225]}
        assert result == expected

    def test_get_default_normalization_clip(self):
        """Test get_default_normalization for CLIP model."""
        result = ImageProcessing.get_default_normalization("clip")
        expected = {
            "mean": [0.48145466, 0.4578275, 0.40821073],
            "std": [0.26862954, 0.26130258, 0.27577711],
        }
        assert result == expected

    def test_get_default_normalization_siglip(self):
        """Test get_default_normalization for SigLIP model."""
        result = ImageProcessing.get_default_normalization("siglip")
        expected = {"mean": [0.5, 0.5, 0.5], "std": [0.5, 0.5, 0.5]}
        assert result == expected

    def test_get_default_normalization_unknown_model(self):
        """Test get_default_normalization for unknown model."""
        result = ImageProcessing.get_default_normalization("unknown_model")
        expected = {"mean": [0.5, 0.5, 0.5], "std": [0.5, 0.5, 0.5]}
        assert result == expected

    def test_create_transform_full_config(self):
        """Test create_transform with full configuration."""
        config = {
            "resize": (100, 200),
            "crop": (10, 10, 50, 50),
            "normalize": {"mean": [0.5], "std": [0.5]},
            "convert": "RGB",
        }
        result = ImageProcessing.create_transform(config)

        assert isinstance(result, ImageTransform)
        assert result.resize == (100, 200)
        assert result.crop == (10, 10, 50, 50)
        assert result.normalize == {"mean": [0.5], "std": [0.5]}
        assert result.convert == "RGB"

    def test_create_transform_partial_config(self):
        """Test create_transform with partial configuration."""
        config = {"resize": (100, 200), "convert": "RGB"}
        result = ImageProcessing.create_transform(config)

        assert isinstance(result, ImageTransform)
        assert result.resize == (100, 200)
        assert result.crop is None
        assert result.normalize is None
        assert result.convert == "RGB"

    def test_create_transform_empty_config(self):
        """Test create_transform with empty configuration."""
        config = {}
        result = ImageProcessing.create_transform(config)

        assert isinstance(result, ImageTransform)
        assert result.resize is None
        assert result.crop is None
        assert result.normalize is None
        assert result.convert is None
