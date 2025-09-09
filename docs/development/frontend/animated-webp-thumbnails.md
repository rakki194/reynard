# Animated WebP Thumbnail Support

This document describes the animated WebP thumbnail processing functionality added to the yipyap application.

## Overview

The application now supports generating animated WebP thumbnails from animated source images (GIF, APNG, animated WebP). This provides better visual representation of animated content in the gallery while maintaining efficient file sizes.

## Features

### Backend Support

- **Automatic Animation Detection**: The system automatically detects animated images using the existing animation detection infrastructure
- **Animated WebP Generation**: Creates animated WebP thumbnails that preserve the original animation
- **Frame Processing**: Processes all frames of animated images and maintains timing information
- **Fallback Support**: Single-frame animated images fall back to static WebP generation
- **Quality Optimization**: Uses high-quality WebP encoding (method 6) with appropriate quality settings

### Frontend Support

- **Native Browser Support**: Animated WebP thumbnails are displayed natively by modern browsers
- **Animation Indicators**: Existing animation indicators continue to work with animated thumbnails
- **Performance**: Animated thumbnails are efficiently loaded through the existing batch thumbnail system
- **Progressive Loading**: Maintains the existing progressive loading behavior

## Technical Implementation

### Backend Changes

The `ImageProcessor` class has been enhanced with:

1. **Animation Detection**: Uses the existing `detect_animation_info` function to identify animated images
2. **Dual Processing Paths**:
   - `_generate_static_thumbnail()` for static images
   - `_generate_animated_thumbnail()` for animated images
3. **Frame-by-Frame Processing**: Extracts and processes each frame individually
4. **Duration Preservation**: Maintains original frame timing information

### Key Methods

```python
def generate_thumbnail(self, path: Path) -> bytes:
    """Generate WebP thumbnail from image, preserving animation for animated images."""

def _generate_animated_thumbnail(self, img: Image.Image, animation_info: Dict[str, Any]) -> bytes:
    """Generate animated WebP thumbnail from animated image."""

def _generate_static_thumbnail(self, img: Image.Image) -> bytes:
    """Generate static WebP thumbnail from image."""
```

### Frontend Integration

The frontend automatically supports animated WebP thumbnails through:

1. **Existing Image Display**: The current `<img>` tag implementation supports animated WebP natively
2. **Batch Loading**: Animated thumbnails work with the existing batch thumbnail loading system
3. **Animation Indicators**: The existing animation indicator overlay continues to work
4. **Performance**: No additional frontend code required

## Supported Formats

### Input Formats (Animated)

- **GIF**: Animated GIF files
- **APNG**: Animated PNG files
- **WebP**: Animated WebP files

### Output Format

- **WebP**: Animated WebP thumbnails with preserved animation

## Configuration

The animated WebP functionality uses the same configuration as static thumbnails:

- **Thumbnail Size**: Controlled by the existing thumbnail size settings
- **Quality**: WebP quality setting of 80 (optimized for size vs quality)
- **Encoding Method**: Method 6 for high-quality encoding

## Performance Considerations

### File Size

- Animated WebP thumbnails are typically larger than static thumbnails due to multiple frames
- However, they are still significantly smaller than the original animated files
- The system uses efficient WebP encoding to minimize file size

### Processing Time

- Animated thumbnail generation takes longer than static thumbnails
- Each frame must be processed individually
- The system uses the existing thread pool for background processing

### Memory Usage

- Frame processing requires additional memory for temporary frame storage
- Memory usage scales with the number of frames and frame size

## Testing

The implementation includes comprehensive tests:

1. **Unit Tests**: Mock-based tests for all new functionality
2. **Integration Tests**: Real file-based tests using generated animated GIFs
3. **Edge Case Tests**: Single-frame animated images, error handling
4. **Performance Tests**: File size and processing time validation

### Running Tests

```bash
# Run all image processor tests
python -m pytest app/tests/test_image_processor.py -v

# Run animated WebP integration tests
python -m pytest app/tests/test_animated_webp_integration.py -v
```

## Browser Support

Animated WebP is supported by:

- Chrome 32+
- Firefox 65+
- Safari 14+
- Edge 79+

For browsers that don't support animated WebP, the thumbnails will display as static images (first frame only).

## Future Enhancements

Potential improvements for future versions:

1. **Format-Specific Optimization**: Different encoding settings for different source formats
2. **Frame Rate Control**: Option to reduce frame rate for smaller file sizes
3. **Selective Frame Processing**: Skip frames for very long animations
4. **Quality Tiers**: Different quality settings for different use cases
5. **Fallback Formats**: Generate static thumbnails for unsupported browsers

## Troubleshooting

### Common Issues

1. **Large File Sizes**: Check if the source animation has many frames or high resolution
2. **Processing Errors**: Verify that the source file is a valid animated image
3. **Browser Display Issues**: Ensure the browser supports animated WebP

### Debug Information

The system logs detailed information about animation processing:

```python
logger.debug(f"Processing animated image: {frame_count} frames, {duration}s duration")
logger.debug(f"Generated animated WebP thumbnail: {len(thumbnail_data)} bytes")
```

## Migration Notes

This feature is backward compatible:

- Existing static thumbnails continue to work unchanged
- New animated images automatically get animated thumbnails
- No database migration required
- No frontend changes required
