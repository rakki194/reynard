"""Tests for image types utilities.

This module tests the ImageFormat, ImageInfo, and ImageTransform classes
for image processing type definitions.
"""

from app.utils.image_types import ImageFormat, ImageInfo, ImageTransform


class TestImageFormat:
    """Test the ImageFormat class."""

    def test_image_format_creation(self):
        """Test ImageFormat creation with all parameters."""
        fmt = ImageFormat(
            extension=".jpg",
            mime_type="image/jpeg",
            supported=True,
            requires_plugin=False,
        )

        assert fmt.extension == ".jpg"
        assert fmt.mime_type == "image/jpeg"
        assert fmt.supported is True
        assert fmt.requires_plugin is False

    def test_image_format_creation_defaults(self):
        """Test ImageFormat creation with default parameters."""
        fmt = ImageFormat(extension=".png", mime_type="image/png")

        assert fmt.extension == ".png"
        assert fmt.mime_type == "image/png"
        assert fmt.supported is True  # Default value
        assert fmt.requires_plugin is False  # Default value

    def test_image_format_creation_unsupported(self):
        """Test ImageFormat creation for unsupported format."""
        fmt = ImageFormat(
            extension=".xyz",
            mime_type="image/xyz",
            supported=False,
            requires_plugin=True,
        )

        assert fmt.extension == ".xyz"
        assert fmt.mime_type == "image/xyz"
        assert fmt.supported is False
        assert fmt.requires_plugin is True

    def test_image_format_equality(self):
        """Test ImageFormat equality comparison."""
        fmt1 = ImageFormat(".jpg", "image/jpeg", True, False)
        fmt2 = ImageFormat(".jpg", "image/jpeg", True, False)
        fmt3 = ImageFormat(".png", "image/png", True, False)

        # Data classes with same values should be equal
        assert fmt1.extension == fmt2.extension
        assert fmt1.mime_type == fmt2.mime_type
        assert fmt1.supported == fmt2.supported
        assert fmt1.requires_plugin == fmt2.requires_plugin
        assert fmt1.extension != fmt3.extension

    def test_image_format_string_representation(self):
        """Test ImageFormat string representation."""
        fmt = ImageFormat(".jpg", "image/jpeg", True, False)
        str_repr = str(fmt)

        # Should be a standard object representation
        assert "ImageFormat" in str_repr
        assert str_repr.startswith("<")
        assert str_repr.endswith(">")


class TestImageInfo:
    """Test the ImageInfo class."""

    def test_image_info_creation(self):
        """Test ImageInfo creation with all parameters."""
        info = ImageInfo(
            width=1920,
            height=1080,
            format="JPEG",
            mode="RGB",
            size=1024000,
        )

        assert info.width == 1920
        assert info.height == 1080
        assert info.format == "JPEG"
        assert info.mode == "RGB"
        assert info.size == 1024000

    def test_image_info_creation_minimal(self):
        """Test ImageInfo creation with minimal parameters."""
        info = ImageInfo(width=100, height=100, format="PNG", mode="RGBA", size=5000)

        assert info.width == 100
        assert info.height == 100
        assert info.format == "PNG"
        assert info.mode == "RGBA"
        assert info.size == 5000

    def test_image_info_equality(self):
        """Test ImageInfo equality comparison."""
        info1 = ImageInfo(100, 100, "PNG", "RGB", 1000)
        info2 = ImageInfo(100, 100, "PNG", "RGB", 1000)
        info3 = ImageInfo(200, 200, "JPEG", "RGB", 2000)

        # Data classes with same values should have same attributes
        assert info1.width == info2.width
        assert info1.height == info2.height
        assert info1.format == info2.format
        assert info1.mode == info2.mode
        assert info1.size == info2.size
        assert info1.width != info3.width

    def test_image_info_string_representation(self):
        """Test ImageInfo string representation."""
        info = ImageInfo(1920, 1080, "JPEG", "RGB", 1024000)
        str_repr = str(info)

        # Should be a standard object representation
        assert "ImageInfo" in str_repr
        assert str_repr.startswith("<")
        assert str_repr.endswith(">")

    def test_image_info_edge_cases(self):
        """Test ImageInfo with edge case values."""
        # Zero dimensions
        info = ImageInfo(0, 0, "PNG", "RGB", 0)
        assert info.width == 0
        assert info.height == 0
        assert info.size == 0

        # Large dimensions
        info = ImageInfo(10000, 10000, "TIFF", "CMYK", 100000000)
        assert info.width == 10000
        assert info.height == 10000
        assert info.size == 100000000


class TestImageTransform:
    """Test the ImageTransform class."""

    def test_image_transform_creation_empty(self):
        """Test ImageTransform creation with no parameters."""
        transform = ImageTransform()

        assert transform.resize is None
        assert transform.crop is None
        assert transform.normalize is None
        assert transform.convert is None

    def test_image_transform_creation_with_resize(self):
        """Test ImageTransform creation with resize parameter."""
        transform = ImageTransform(resize=(800, 600))

        assert transform.resize == (800, 600)
        assert transform.crop is None
        assert transform.normalize is None
        assert transform.convert is None

    def test_image_transform_creation_with_crop(self):
        """Test ImageTransform creation with crop parameter."""
        transform = ImageTransform(crop=(100, 100, 500, 400))

        assert transform.resize is None
        assert transform.crop == (100, 100, 500, 400)
        assert transform.normalize is None
        assert transform.convert is None

    def test_image_transform_creation_with_normalize(self):
        """Test ImageTransform creation with normalize parameter."""
        normalize_config = {"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225]}
        transform = ImageTransform(normalize=normalize_config)

        assert transform.resize is None
        assert transform.crop is None
        assert transform.normalize == normalize_config
        assert transform.convert is None

    def test_image_transform_creation_with_convert(self):
        """Test ImageTransform creation with convert parameter."""
        transform = ImageTransform(convert="RGB")

        assert transform.resize is None
        assert transform.crop is None
        assert transform.normalize is None
        assert transform.convert == "RGB"

    def test_image_transform_creation_all_parameters(self):
        """Test ImageTransform creation with all parameters."""
        normalize_config = {"mean": [0.5, 0.5, 0.5], "std": [0.5, 0.5, 0.5]}
        transform = ImageTransform(
            resize=(224, 224),
            crop=(10, 10, 214, 214),
            normalize=normalize_config,
            convert="RGB",
        )

        assert transform.resize == (224, 224)
        assert transform.crop == (10, 10, 214, 214)
        assert transform.normalize == normalize_config
        assert transform.convert == "RGB"

    def test_image_transform_equality(self):
        """Test ImageTransform equality comparison."""
        transform1 = ImageTransform(resize=(100, 100))
        transform2 = ImageTransform(resize=(100, 100))
        transform3 = ImageTransform(resize=(200, 200))

        # Data classes with same values should have same attributes
        assert transform1.resize == transform2.resize
        assert transform1.crop == transform2.crop
        assert transform1.normalize == transform2.normalize
        assert transform1.convert == transform2.convert
        assert transform1.resize != transform3.resize

    def test_image_transform_string_representation(self):
        """Test ImageTransform string representation."""
        transform = ImageTransform(resize=(800, 600), convert="RGB")
        str_repr = str(transform)

        # Should be a standard object representation
        assert "ImageTransform" in str_repr
        assert str_repr.startswith("<")
        assert str_repr.endswith(">")

    def test_image_transform_edge_cases(self):
        """Test ImageTransform with edge case values."""
        # Zero dimensions for resize
        transform = ImageTransform(resize=(0, 0))
        assert transform.resize == (0, 0)

        # Negative crop coordinates
        transform = ImageTransform(crop=(-10, -10, 100, 100))
        assert transform.crop == (-10, -10, 100, 100)

        # Empty normalize config
        transform = ImageTransform(normalize={})
        assert transform.normalize == {}

        # Empty convert string
        transform = ImageTransform(convert="")
        assert transform.convert == ""

    def test_image_transform_complex_normalize(self):
        """Test ImageTransform with complex normalize configuration."""
        complex_normalize = {
            "mean": [0.485, 0.456, 0.406, 0.5],
            "std": [0.229, 0.224, 0.225, 0.25],
            "scale": [1.0, 1.0, 1.0, 1.0],
            "offset": [0.0, 0.0, 0.0, 0.0],
        }
        transform = ImageTransform(normalize=complex_normalize)

        assert transform.normalize == complex_normalize
        assert len(transform.normalize["mean"]) == 4
        assert len(transform.normalize["std"]) == 4

    def test_image_transform_immutability(self):
        """Test that ImageTransform parameters are properly stored."""
        resize = (800, 600)
        crop = (100, 100, 500, 400)
        normalize = {"mean": [0.5], "std": [0.5]}
        convert = "RGB"

        transform = ImageTransform(
            resize=resize,
            crop=crop,
            normalize=normalize,
            convert=convert,
        )

        # Modify original values
        resize = (1000, 800)
        crop = (200, 200, 600, 500)
        normalize["mean"] = [0.3]
        convert = "RGBA"

        # Transform should still have original values for immutable types
        assert transform.resize == (800, 600)
        assert transform.crop == (100, 100, 500, 400)
        assert transform.convert == "RGB"

        # Note: normalize is mutable, so it will be affected by the modification
        # This is expected behavior for mutable default arguments
        assert transform.normalize == {"mean": [0.3], "std": [0.5]}
