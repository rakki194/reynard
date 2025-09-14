"""
Tests for image format support utilities.

This module tests the ImageFormatSupport class and its methods
for format detection, validation, and information retrieval.
"""

import pytest
from pathlib import Path

from app.utils.image_formats import ImageFormatSupport
from app.utils.image_types import ImageFormat


class TestImageFormatSupport:
    """Test the ImageFormatSupport class."""

    def test_supported_formats_structure(self):
        """Test that supported formats are properly structured."""
        formats = ImageFormatSupport.SUPPORTED_FORMATS
        
        assert isinstance(formats, dict)
        assert len(formats) > 0
        
        # Check that all entries are ImageFormat objects
        for ext, format_info in formats.items():
            assert isinstance(format_info, ImageFormat)
            assert ext.startswith('.')
            assert format_info.extension == ext
            assert format_info.mime_type.startswith('image/')

    def test_get_supported_formats(self):
        """Test getting supported image file extensions."""
        supported = ImageFormatSupport.get_supported_formats()
        
        assert isinstance(supported, set)
        assert len(supported) > 0
        
        # Check that all returned extensions are supported
        for ext in supported:
            assert ext.startswith('.')
            assert ImageFormatSupport.is_supported_format(ext)

    def test_is_supported_format_valid_extensions(self):
        """Test format support check with valid extensions."""
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
        
        for ext in valid_extensions:
            assert ImageFormatSupport.is_supported_format(ext)
            assert ImageFormatSupport.is_supported_format(ext.upper())  # Case insensitive

    def test_is_supported_format_invalid_extensions(self):
        """Test format support check with invalid extensions."""
        invalid_extensions = ['.txt', '.pdf', '.doc', '.mp4', '.avi', '']
        
        for ext in invalid_extensions:
            assert not ImageFormatSupport.is_supported_format(ext)

    def test_get_format_info_valid_extensions(self):
        """Test getting format information for valid extensions."""
        # Test JPEG
        jpg_info = ImageFormatSupport.get_format_info('.jpg')
        assert jpg_info is not None
        assert jpg_info.extension == '.jpg'
        assert jpg_info.mime_type == 'image/jpeg'
        assert jpg_info.supported is True
        
        # Test PNG
        png_info = ImageFormatSupport.get_format_info('.png')
        assert png_info is not None
        assert png_info.extension == '.png'
        assert png_info.mime_type == 'image/png'
        assert png_info.supported is True
        
        # Test case insensitive
        jpg_info_upper = ImageFormatSupport.get_format_info('.JPG')
        assert jpg_info_upper is not None
        assert jpg_info_upper.extension == '.jpg'

    def test_get_format_info_invalid_extensions(self):
        """Test getting format information for invalid extensions."""
        invalid_extensions = ['.txt', '.pdf', '.doc', '']
        
        for ext in invalid_extensions:
            info = ImageFormatSupport.get_format_info(ext)
            assert info is None

    def test_validate_image_path_valid_paths(self):
        """Test image path validation with valid paths."""
        valid_paths = [
            'image.jpg',
            'photo.png',
            'picture.gif',
            '/path/to/image.bmp',
            'C:\\path\\to\\image.tiff',
            'image.webp',
            'file.jpeg'
        ]
        
        for path in valid_paths:
            assert ImageFormatSupport.validate_image_path(path)

    def test_validate_image_path_invalid_paths(self):
        """Test image path validation with invalid paths."""
        invalid_paths = [
            'document.txt',
            'video.mp4',
            'archive.zip',
            'image',  # No extension
            '',  # Empty string
            '/path/to/file'  # No extension
        ]
        
        for path in invalid_paths:
            assert not ImageFormatSupport.validate_image_path(path)

    def test_get_file_extension(self):
        """Test file extension extraction."""
        test_cases = [
            ('image.jpg', '.jpg'),
            ('photo.png', '.png'),
            ('/path/to/image.gif', '.gif'),
            ('C:\\path\\to\\image.bmp', '.bmp'),
            ('file.jpeg', '.jpeg'),
            ('image.JPG', '.jpg'),  # Case insensitive
            ('image', ''),  # No extension
            ('', '')  # Empty string
        ]
        
        for path, expected_ext in test_cases:
            result = ImageFormatSupport.get_file_extension(path)
            assert result == expected_ext

    def test_get_mime_type_valid_extensions(self):
        """Test MIME type retrieval for valid extensions."""
        test_cases = [
            ('.jpg', 'image/jpeg'),
            ('.jpeg', 'image/jpeg'),
            ('.png', 'image/png'),
            ('.gif', 'image/gif'),
            ('.bmp', 'image/bmp'),
            ('.tiff', 'image/tiff'),
            ('.webp', 'image/webp')
        ]
        
        for ext, expected_mime in test_cases:
            result = ImageFormatSupport.get_mime_type(ext)
            assert result == expected_mime
            
            # Test case insensitive
            result_upper = ImageFormatSupport.get_mime_type(ext.upper())
            assert result_upper == expected_mime

    def test_get_mime_type_invalid_extensions(self):
        """Test MIME type retrieval for invalid extensions."""
        invalid_extensions = ['.txt', '.pdf', '.doc', '']
        
        for ext in invalid_extensions:
            result = ImageFormatSupport.get_mime_type(ext)
            assert result is None

    def test_requires_plugin(self):
        """Test plugin requirement check."""
        # Formats that require plugins
        plugin_formats = ['.jxl', '.avif']
        for ext in plugin_formats:
            assert ImageFormatSupport.requires_plugin(ext)
        
        # Formats that don't require plugins
        standard_formats = ['.jpg', '.png', '.gif', '.bmp', '.tiff', '.webp']
        for ext in standard_formats:
            assert not ImageFormatSupport.requires_plugin(ext)
        
        # Invalid extensions
        invalid_extensions = ['.txt', '.pdf', '']
        for ext in invalid_extensions:
            assert not ImageFormatSupport.requires_plugin(ext)

    def test_supports_transparency(self):
        """Test transparency support check."""
        # Formats that support transparency
        transparent_formats = ['.png', '.gif', '.webp']
        for ext in transparent_formats:
            assert ImageFormatSupport.supports_transparency(ext)
            assert ImageFormatSupport.supports_transparency(ext.upper())  # Case insensitive
        
        # Formats that don't support transparency
        opaque_formats = ['.jpg', '.jpeg', '.bmp', '.tiff', '.jxl', '.avif']
        for ext in opaque_formats:
            assert not ImageFormatSupport.supports_transparency(ext)
        
        # Invalid extensions
        invalid_extensions = ['.txt', '.pdf', '']
        for ext in invalid_extensions:
            assert not ImageFormatSupport.supports_transparency(ext)

    def test_all_supported_formats_have_mime_types(self):
        """Test that all supported formats have MIME types."""
        for ext, format_info in ImageFormatSupport.SUPPORTED_FORMATS.items():
            if format_info.supported:
                assert format_info.mime_type is not None
                assert format_info.mime_type.startswith('image/')

    def test_format_consistency(self):
        """Test consistency between different methods."""
        for ext, format_info in ImageFormatSupport.SUPPORTED_FORMATS.items():
            # Test that get_format_info returns the same object
            retrieved_info = ImageFormatSupport.get_format_info(ext)
            assert retrieved_info == format_info
            
            # Test that is_supported_format matches the format's supported flag
            assert ImageFormatSupport.is_supported_format(ext) == format_info.supported
            
            # Test that get_mime_type matches the format's mime_type
            assert ImageFormatSupport.get_mime_type(ext) == format_info.mime_type
            
            # Test that requires_plugin matches the format's requires_plugin flag
            assert ImageFormatSupport.requires_plugin(ext) == format_info.requires_plugin

    def test_edge_cases(self):
        """Test edge cases and error conditions."""
        # Test with None - these should raise AttributeError
        with pytest.raises(AttributeError):
            ImageFormatSupport.is_supported_format(None)
        
        with pytest.raises(AttributeError):
            ImageFormatSupport.get_format_info(None)
        
        with pytest.raises(AttributeError):
            ImageFormatSupport.get_mime_type(None)
        
        with pytest.raises(AttributeError):
            ImageFormatSupport.requires_plugin(None)
        
        with pytest.raises(AttributeError):
            ImageFormatSupport.supports_transparency(None)
        
        # Test with very long extension
        long_ext = '.' + 'a' * 100
        assert not ImageFormatSupport.is_supported_format(long_ext)
        
        # Test with special characters
        special_ext = '.jpg$'
        assert not ImageFormatSupport.is_supported_format(special_ext)
