"""Comprehensive tests for the enhanced image format converter.

This module tests the format conversion capabilities, optimization settings,
and plugin-dependent format support.
"""

from unittest.mock import MagicMock, patch

import pytest

from app.utils.image_format_converter import (
    ImageFormatConverter,
    UnsupportedFormatError,
    get_format_converter,
)


class TestImageFormatConverter:
    """Test suite for the image format converter."""

    @pytest.fixture
    def converter(self):
        """Create a fresh format converter for testing."""
        return ImageFormatConverter()

    def test_converter_initialization(self, converter):
        """Test converter initialization."""
        assert converter is not None
        assert len(converter.supported_formats) > 0

    def test_base_format_support(self, converter):
        """Test base format support."""
        # Test standard formats
        assert converter.is_format_supported("jpeg")
        assert converter.is_format_supported("png")
        assert converter.is_format_supported("webp")
        assert converter.is_format_supported("gif")
        assert converter.is_format_supported("bmp")
        assert converter.is_format_supported("tiff")

    def test_format_info_retrieval(self, converter):
        """Test format information retrieval."""
        jpeg_info = converter.get_format_info("jpeg")
        assert jpeg_info is not None
        assert jpeg_info["extensions"] == [".jpg", ".jpeg"]
        assert jpeg_info["mime_type"] == "image/jpeg"
        assert jpeg_info["supports_animation"] is False
        assert jpeg_info["supports_alpha"] is False

    def test_webp_format_info(self, converter):
        """Test WebP format information."""
        webp_info = converter.get_format_info("webp")
        assert webp_info is not None
        assert webp_info["supports_animation"] is True
        assert webp_info["supports_alpha"] is True
        assert webp_info["default_quality"] == 80
        assert "default_method" in webp_info

    def test_png_format_info(self, converter):
        """Test PNG format information."""
        png_info = converter.get_format_info("png")
        assert png_info is not None
        assert png_info["supports_animation"] is True  # APNG
        assert png_info["supports_alpha"] is True
        assert png_info["default_quality"] == 95
        assert png_info["optimize"] is True

    def test_conversion_options(self, converter):
        """Test conversion options generation."""
        # Test JPEG options
        jpeg_options = converter.get_conversion_options("jpeg")
        assert "quality" in jpeg_options
        assert "optimize" in jpeg_options
        assert "progressive" in jpeg_options
        assert jpeg_options["quality"] == 85

        # Test WebP options
        webp_options = converter.get_conversion_options("webp")
        assert "quality" in webp_options
        assert "method" in webp_options
        assert webp_options["quality"] == 80
        assert webp_options["method"] == 4

        # Test PNG options
        png_options = converter.get_conversion_options("png")
        assert "quality" in png_options
        assert "optimize" in png_options
        assert png_options["quality"] == 95

    def test_unsupported_format_error(self, converter):
        """Test error handling for unsupported formats."""
        with pytest.raises(UnsupportedFormatError):
            converter.get_conversion_options("unsupported")

    def test_conversion_validation(self, converter):
        """Test conversion validation."""
        # Valid conversions
        assert converter.validate_conversion("jpeg", "png") is True
        assert converter.validate_conversion("png", "webp") is True
        assert converter.validate_conversion("gif", "png") is True

        # Invalid conversions
        assert converter.validate_conversion("unsupported", "png") is False
        assert converter.validate_conversion("jpeg", "unsupported") is False

    def test_alpha_channel_warning(self, converter):
        """Test alpha channel conversion warnings."""
        # PNG to JPEG (loses alpha)
        with patch("app.utils.image_format_converter.logger") as mock_logger:
            result = converter.validate_conversion("png", "jpeg")
            assert result is True
            mock_logger.warning.assert_called()

    def test_animation_warning(self, converter):
        """Test animation conversion warnings."""
        # GIF to JPEG (loses animation)
        with patch("app.utils.image_format_converter.logger") as mock_logger:
            result = converter.validate_conversion("gif", "jpeg")
            assert result is True
            mock_logger.warning.assert_called()

    def test_optimal_format_selection(self, converter):
        """Test optimal format selection based on requirements."""
        # High quality, no special requirements
        optimal = converter.get_optimal_format(
            {"quality_priority": "high", "size_priority": "large"},
        )
        assert optimal in ["png", "tiff"]

        # Small size, no special requirements
        optimal = converter.get_optimal_format(
            {"quality_priority": "low", "size_priority": "small"},
        )
        assert optimal in ["jpeg", "webp"]

        # Needs alpha channel
        optimal = converter.get_optimal_format(
            {"needs_alpha": True, "quality_priority": "medium"},
        )
        assert optimal in ["png", "webp"]

        # Needs animation
        optimal = converter.get_optimal_format(
            {"needs_animation": True, "quality_priority": "medium"},
        )
        assert optimal in ["gif", "webp"]

        # Needs both alpha and animation
        optimal = converter.get_optimal_format(
            {"needs_alpha": True, "needs_animation": True, "quality_priority": "medium"},
        )
        assert optimal == "webp"

    def test_file_extension_retrieval(self, converter):
        """Test file extension retrieval."""
        assert converter.get_file_extension("jpeg") == ".jpg"
        assert converter.get_file_extension("png") == ".png"
        assert converter.get_file_extension("webp") == ".webp"
        assert converter.get_file_extension("tiff") == ".tiff"

    def test_mime_type_retrieval(self, converter):
        """Test MIME type retrieval."""
        assert converter.get_mime_type("jpeg") == "image/jpeg"
        assert converter.get_mime_type("png") == "image/png"
        assert converter.get_mime_type("webp") == "image/webp"
        assert converter.get_mime_type("gif") == "image/gif"

    def test_unsupported_format_mime_type_error(self, converter):
        """Test error handling for unsupported format MIME type retrieval."""
        with pytest.raises(UnsupportedFormatError):
            converter.get_mime_type("unsupported")

    def test_unsupported_format_extension_error(self, converter):
        """Test error handling for unsupported format extension retrieval."""
        with pytest.raises(UnsupportedFormatError):
            converter.get_file_extension("unsupported")


class TestPluginFormatSupport:
    """Test suite for plugin-dependent format support."""

    @pytest.fixture
    def converter(self):
        """Create a format converter for testing."""
        return ImageFormatConverter()

    @patch("app.utils.image_format_converter._global_image_service")
    def test_jxl_support_when_available(self, mock_global_service, converter):
        """Test JXL support when plugin is available."""
        # Mock service with JXL support
        mock_service = MagicMock()
        mock_service.is_jxl_supported.return_value = True
        mock_global_service.return_value = mock_service

        # Add JXL format back to supported formats (it was removed during init)
        converter.supported_formats["jxl"] = {
            "extensions": [".jxl"],
            "mime_type": "image/jxl",
            "supports_animation": True,
            "supports_alpha": True,
            "default_quality": 90,
            "default_effort": 7,
            "compression_levels": list(range(10)),
        }

        # Re-initialize converter to check plugin support
        converter._check_optional_formats()

        assert converter.is_format_supported("jxl")
        jxl_info = converter.get_format_info("jxl")
        assert jxl_info is not None
        assert jxl_info["supports_animation"] is True
        assert jxl_info["supports_alpha"] is True
        assert jxl_info["default_quality"] == 90
        assert jxl_info["default_effort"] == 7

    @patch("app.services.image_processing_service._global_image_service")
    def test_jxl_support_when_unavailable(self, mock_global_service, converter):
        """Test JXL support when plugin is unavailable."""
        # Mock service without JXL support
        mock_service = MagicMock()
        mock_service.is_jxl_supported.return_value = False
        mock_global_service.return_value = mock_service

        # Re-initialize converter to check plugin support
        converter._check_optional_formats()

        assert not converter.is_format_supported("jxl")

    @patch("app.utils.image_format_converter._global_image_service")
    def test_avif_support_when_available(self, mock_global_service, converter):
        """Test AVIF support when plugin is available."""
        # Mock service with AVIF support
        mock_service = MagicMock()
        mock_service.is_avif_supported.return_value = True
        mock_global_service.return_value = mock_service

        # Add AVIF format back to supported formats (it was removed during init)
        converter.supported_formats["avif"] = {
            "extensions": [".avif"],
            "mime_type": "image/avif",
            "supports_animation": True,
            "supports_alpha": True,
            "default_quality": 80,
            "compression_levels": list(range(10)),
        }

        # Re-initialize converter to check plugin support
        converter._check_optional_formats()

        assert converter.is_format_supported("avif")
        avif_info = converter.get_format_info("avif")
        assert avif_info is not None
        assert avif_info["supports_animation"] is True
        assert avif_info["supports_alpha"] is True
        assert avif_info["default_quality"] == 80

    @patch("app.services.image_processing_service._global_image_service")
    def test_avif_support_when_unavailable(self, mock_global_service, converter):
        """Test AVIF support when plugin is unavailable."""
        # Mock service without AVIF support
        mock_service = MagicMock()
        mock_service.is_avif_supported.return_value = False
        mock_global_service.return_value = mock_service

        # Re-initialize converter to check plugin support
        converter._check_optional_formats()

        assert not converter.is_format_supported("avif")

    @patch("app.services.image_processing_service._global_image_service")
    def test_plugin_check_error_handling(self, mock_global_service, converter):
        """Test error handling during plugin availability check."""
        # Mock service that raises an exception
        mock_global_service.side_effect = Exception("Service error")

        # Should handle gracefully
        converter._check_optional_formats()

        # Plugin formats should not be available
        assert not converter.is_format_supported("jxl")
        assert not converter.is_format_supported("avif")


class TestGlobalConverterManagement:
    """Test suite for global converter management."""

    def test_get_format_converter(self):
        """Test global converter retrieval."""
        converter = get_format_converter()
        assert isinstance(converter, ImageFormatConverter)

    def test_singleton_behavior(self):
        """Test that get_format_converter returns the same instance."""
        converter1 = get_format_converter()
        converter2 = get_format_converter()
        assert converter1 is converter2


class TestFormatConversionScenarios:
    """Test suite for real-world format conversion scenarios."""

    @pytest.fixture
    def converter(self):
        """Create a format converter for testing."""
        return ImageFormatConverter()

    def test_photo_optimization_scenario(self, converter):
        """Test photo optimization scenario."""
        # High quality photo with alpha support
        optimal = converter.get_optimal_format(
            {"needs_alpha": True, "quality_priority": "high", "size_priority": "medium"},
        )
        assert optimal == "png"

        # High quality photo without alpha
        optimal = converter.get_optimal_format(
            {
                "needs_alpha": False,
                "quality_priority": "high",
                "size_priority": "medium",
            },
        )
        assert optimal in ["jpeg", "png"]

    def test_web_optimization_scenario(self, converter):
        """Test web optimization scenario."""
        # Web image with animation support
        optimal = converter.get_optimal_format(
            {
                "needs_animation": True,
                "quality_priority": "medium",
                "size_priority": "small",
            },
        )
        assert optimal == "webp"

        # Web image without animation
        optimal = converter.get_optimal_format(
            {
                "needs_animation": False,
                "quality_priority": "medium",
                "size_priority": "small",
            },
        )
        assert optimal in ["jpeg", "webp"]

    def test_archive_preservation_scenario(self, converter):
        """Test archive preservation scenario."""
        # Archive image with maximum quality
        optimal = converter.get_optimal_format(
            {"quality_priority": "high", "size_priority": "large"},
        )
        assert optimal in ["png", "tiff"]

    def test_conversion_chain_validation(self, converter):
        """Test validation of conversion chains."""
        # Valid conversion chain: JPEG -> PNG -> WebP
        assert converter.validate_conversion("jpeg", "png") is True
        assert converter.validate_conversion("png", "webp") is True

        # Invalid conversion chain: GIF -> JPEG (loses animation)
        with patch("app.utils.image_format_converter.logger") as mock_logger:
            result = converter.validate_conversion("gif", "jpeg")
            assert result is True  # Technically valid but with warnings
            mock_logger.warning.assert_called()


if __name__ == "__main__":
    pytest.main([__file__])
