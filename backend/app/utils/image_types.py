"""Image Types for Reynard Backend

Type definitions for the image processing system.
"""


class ImageFormat:
    """Image format information."""

    def __init__(
        self,
        extension: str,
        mime_type: str,
        supported: bool = True,
        requires_plugin: bool = False,
    ):
        self.extension = extension
        self.mime_type = mime_type
        self.supported = supported
        self.requires_plugin = requires_plugin


class ImageInfo:
    """Image information."""

    def __init__(self, width: int, height: int, format: str, mode: str, size: int):
        self.width = width
        self.height = height
        self.format = format
        self.mode = mode
        self.size = size


class ImageTransform:
    """Image transformation configuration."""

    def __init__(
        self,
        resize: tuple[int, int] | None = None,
        crop: tuple[int, int, int, int] | None = None,
        normalize: dict[str, list[float]] | None = None,
        convert: str | None = None,
    ):
        self.resize = resize
        self.crop = crop
        self.normalize = normalize
        self.convert = convert
