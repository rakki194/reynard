"""Image Processing Service for Reynard Backend.

This module provides image processing functionality for various image operations.
"""

import base64
import io
import json
import logging
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

# Conditional image processing imports
from app.core.service_conditional_loading import (
    is_pillow_enabled, is_opencv_enabled, is_numpy_enabled,
    can_load_service, load_service
)

# Pillow import
if is_pillow_enabled() and can_load_service("pillow"):
    try:
        import PIL.ExifTags
        from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
        PIL_AVAILABLE = True
        load_service("pillow")
    except ImportError:
        PIL_AVAILABLE = False
else:
    PIL_AVAILABLE = False

# OpenCV and numpy imports
if is_opencv_enabled() and is_numpy_enabled() and can_load_service("opencv") and can_load_service("numpy"):
    try:
        import cv2
        import numpy as np
        OPENCV_AVAILABLE = True
        load_service("opencv")
        load_service("numpy")
    except ImportError:
        OPENCV_AVAILABLE = False
        np = None
else:
    OPENCV_AVAILABLE = False
    np = None

# Scikit-image import (conditional)
if is_numpy_enabled() and can_load_service("scikit_learn"):
    try:
        import skimage
        from skimage import color, exposure, filters, measure, morphology, segmentation
        from skimage.feature import hog, local_binary_pattern
        from skimage.metrics import structural_similarity as ssim
        SKIMAGE_AVAILABLE = True
        load_service("scikit_learn")
    except ImportError:
        SKIMAGE_AVAILABLE = False
else:
    SKIMAGE_AVAILABLE = False

logger = logging.getLogger(__name__)


@dataclass
class ImageMetadata:
    """Image metadata data structure."""

    width: int
    height: int
    format: str
    mode: str
    size_bytes: int
    exif_data: dict[str, Any] = None
    color_profile: str | None = None
    dpi: tuple[int, int] = None
    has_transparency: bool = False
    created_at: datetime = None

    def __post_init__(self):
        if self.exif_data is None:
            self.exif_data = {}
        if self.created_at is None:
            self.created_at = datetime.now()


@dataclass
class ProcessingResult:
    """Image processing result data structure."""

    result_id: str
    operation: str
    input_image_id: str
    output_image_id: str
    parameters: dict[str, Any]
    processing_time_ms: float
    success: bool
    error_message: str | None = None
    created_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()


@dataclass
class ImageAnalysis:
    """Image analysis result data structure."""

    analysis_id: str
    image_id: str
    dominant_colors: list[tuple[int, int, int]]
    brightness: float
    contrast: float
    sharpness: float
    blur_score: float
    edge_density: float
    texture_features: dict[str, float] = None
    object_count: int = 0
    face_count: int = 0
    text_regions: list[dict[str, Any]] = None
    created_at: datetime = None

    def __post_init__(self):
        if self.texture_features is None:
            self.texture_features = {}
        if self.text_regions is None:
            self.text_regions = []
        if self.created_at is None:
            self.created_at = datetime.now()


class ImageProcessingService:
    """Service for image processing and analysis."""

    def __init__(
        self,
        data_dir: str = "data/images",
        output_dir: str = "data/processed_images",
    ):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Storage directories
        self.images_dir = self.data_dir / "images"
        self.images_dir.mkdir(exist_ok=True)
        self.processed_dir = self.output_dir / "processed"
        self.processed_dir.mkdir(exist_ok=True)
        self.thumbnails_dir = self.output_dir / "thumbnails"
        self.thumbnails_dir.mkdir(exist_ok=True)

        # Load existing data
        self._load_metadata()
        self._load_processing_results()

    def _load_metadata(self) -> None:
        """Load existing image metadata."""
        try:
            metadata_file = self.data_dir / "metadata.json"
            if metadata_file.exists():
                with open(metadata_file, encoding="utf-8") as f:
                    metadata_data = json.load(f)
                    self.metadata = {
                        image_id: ImageMetadata(**meta_data)
                        for image_id, meta_data in metadata_data.items()
                    }
            else:
                self.metadata = {}
        except Exception as e:
            logger.error(f"Failed to load image metadata: {e}")
            self.metadata = {}

    def _load_processing_results(self) -> None:
        """Load existing processing results."""
        try:
            results_file = self.data_dir / "processing_results.json"
            if results_file.exists():
                with open(results_file, encoding="utf-8") as f:
                    results_data = json.load(f)
                    self.processing_results = {
                        result_id: ProcessingResult(**result_data)
                        for result_id, result_data in results_data.items()
                    }
            else:
                self.processing_results = {}
        except Exception as e:
            logger.error(f"Failed to load processing results: {e}")
            self.processing_results = {}

    def _save_metadata(self) -> None:
        """Save image metadata to storage."""
        try:
            metadata_file = self.data_dir / "metadata.json"
            metadata_data = {
                image_id: asdict(meta) for image_id, meta in self.metadata.items()
            }

            # Convert datetime objects to ISO strings
            for meta_data in metadata_data.values():
                for key, value in meta_data.items():
                    if isinstance(value, datetime):
                        meta_data[key] = value.isoformat()

            with open(metadata_file, "w", encoding="utf-8") as f:
                json.dump(metadata_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save image metadata: {e}")

    def _save_processing_results(self) -> None:
        """Save processing results to storage."""
        try:
            results_file = self.data_dir / "processing_results.json"
            results_data = {
                result_id: asdict(result)
                for result_id, result in self.processing_results.items()
            }

            # Convert datetime objects to ISO strings
            for result_data in results_data.values():
                for key, value in result_data.items():
                    if isinstance(value, datetime):
                        result_data[key] = value.isoformat()

            with open(results_file, "w", encoding="utf-8") as f:
                json.dump(results_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save processing results: {e}")

    async def load_image(
        self,
        image_data: str | bytes | Path,
        image_id: str | None = None,
    ) -> tuple[str, ImageMetadata]:
        """Load an image and extract metadata.

        Args:
            image_data: Image data (base64 string, bytes, or file path)
            image_id: Optional image ID

        Returns:
            Tuple of (image_id, ImageMetadata)

        """
        try:
            if not PIL_AVAILABLE:
                raise RuntimeError("PIL not available for image processing")

            # Generate image ID if not provided
            if not image_id:
                image_id = str(uuid.uuid4())

            # Load image
            if isinstance(image_data, str):
                if image_data.startswith("data:image"):
                    # Base64 data URL
                    header, data = image_data.split(",", 1)
                    image_bytes = base64.b64decode(data)
                    image = Image.open(io.BytesIO(image_bytes))
                else:
                    # File path
                    image_path = Path(image_data)
                    image = Image.open(image_path)
            elif isinstance(image_data, bytes):
                # Raw bytes
                image = Image.open(io.BytesIO(image_data))
            elif isinstance(image_data, Path):
                # Path object
                image = Image.open(image_data)
            else:
                raise ValueError("Unsupported image data type")

            # Extract metadata
            metadata = ImageMetadata(
                width=image.width,
                height=image.height,
                format=image.format or "UNKNOWN",
                mode=image.mode,
                size_bytes=len(image.tobytes()),
                has_transparency=image.mode in ("RGBA", "LA")
                or "transparency" in image.info,
            )

            # Extract EXIF data
            if hasattr(image, "_getexif") and image._getexif():
                exif_data = {}
                for tag_id, value in image._getexif().items():
                    tag = PIL.ExifTags.TAGS.get(tag_id, tag_id)
                    exif_data[tag] = value
                metadata.exif_data = exif_data

            # Extract DPI
            if "dpi" in image.info:
                metadata.dpi = image.info["dpi"]

            # Store metadata
            self.metadata[image_id] = metadata
            self._save_metadata()

            # Save image
            image_path = self.images_dir / f"{image_id}.{metadata.format.lower()}"
            image.save(image_path)

            logger.info(f"Loaded image: {image_id}")
            return image_id, metadata

        except Exception as e:
            logger.error(f"Failed to load image: {e}")
            raise

    async def resize_image(
        self,
        image_id: str,
        width: int | None = None,
        height: int | None = None,
        scale_factor: float | None = None,
        maintain_aspect_ratio: bool = True,
    ) -> ProcessingResult:
        """Resize an image.

        Args:
            image_id: Image ID
            width: Target width
            height: Target height
            scale_factor: Scale factor (e.g., 0.5 for 50%)
            maintain_aspect_ratio: Whether to maintain aspect ratio

        Returns:
            ProcessingResult object

        """
        try:
            if not PIL_AVAILABLE:
                raise RuntimeError("PIL not available for image processing")

            if image_id not in self.metadata:
                raise ValueError(f"Image {image_id} not found")

            start_time = datetime.now()

            # Load image
            metadata = self.metadata[image_id]
            image_path = self.images_dir / f"{image_id}.{metadata.format.lower()}"
            image = Image.open(image_path)

            # Calculate new dimensions
            if scale_factor:
                new_width = int(image.width * scale_factor)
                new_height = int(image.height * scale_factor)
            elif width and height:
                new_width, new_height = width, height
            elif width:
                if maintain_aspect_ratio:
                    ratio = width / image.width
                    new_width = width
                    new_height = int(image.height * ratio)
                else:
                    new_width, new_height = width, image.height
            elif height:
                if maintain_aspect_ratio:
                    ratio = height / image.height
                    new_width = int(image.width * ratio)
                    new_height = height
                else:
                    new_width, new_height = image.width, height
            else:
                raise ValueError("Must specify width, height, or scale_factor")

            # Resize image
            resized_image = image.resize(
                (new_width, new_height), Image.Resampling.LANCZOS,
            )

            # Save processed image
            output_image_id = str(uuid.uuid4())
            output_path = (
                self.processed_dir / f"{output_image_id}.{metadata.format.lower()}"
            )
            resized_image.save(output_path)

            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            # Create processing result
            result = ProcessingResult(
                result_id=str(uuid.uuid4()),
                operation="resize",
                input_image_id=image_id,
                output_image_id=output_image_id,
                parameters={
                    "width": new_width,
                    "height": new_height,
                    "scale_factor": scale_factor,
                    "maintain_aspect_ratio": maintain_aspect_ratio,
                },
                processing_time_ms=processing_time,
                success=True,
            )

            # Store result
            self.processing_results[result.result_id] = result
            self._save_processing_results()

            logger.info(f"Resized image {image_id} to {new_width}x{new_height}")
            return result

        except Exception as e:
            logger.error(f"Failed to resize image: {e}")
            # Create error result
            result = ProcessingResult(
                result_id=str(uuid.uuid4()),
                operation="resize",
                input_image_id=image_id,
                output_image_id="",
                parameters={
                    "width": width,
                    "height": height,
                    "scale_factor": scale_factor,
                },
                processing_time_ms=0,
                success=False,
                error_message=str(e),
            )
            self.processing_results[result.result_id] = result
            self._save_processing_results()
            return result

    async def enhance_image(
        self,
        image_id: str,
        brightness: float | None = None,
        contrast: float | None = None,
        sharpness: float | None = None,
        color: float | None = None,
    ) -> ProcessingResult:
        """Enhance image quality.

        Args:
            image_id: Image ID
            brightness: Brightness factor (1.0 = no change)
            contrast: Contrast factor (1.0 = no change)
            sharpness: Sharpness factor (1.0 = no change)
            color: Color saturation factor (1.0 = no change)

        Returns:
            ProcessingResult object

        """
        try:
            if not PIL_AVAILABLE:
                raise RuntimeError("PIL not available for image processing")

            if image_id not in self.metadata:
                raise ValueError(f"Image {image_id} not found")

            start_time = datetime.now()

            # Load image
            metadata = self.metadata[image_id]
            image_path = self.images_dir / f"{image_id}.{metadata.format.lower()}"
            image = Image.open(image_path)

            # Apply enhancements
            enhanced_image = image.copy()

            if brightness is not None:
                enhancer = ImageEnhance.Brightness(enhanced_image)
                enhanced_image = enhancer.enhance(brightness)

            if contrast is not None:
                enhancer = ImageEnhance.Contrast(enhanced_image)
                enhanced_image = enhancer.enhance(contrast)

            if sharpness is not None:
                enhancer = ImageEnhance.Sharpness(enhanced_image)
                enhanced_image = enhancer.enhance(sharpness)

            if color is not None:
                enhancer = ImageEnhance.Color(enhanced_image)
                enhanced_image = enhancer.enhance(color)

            # Save processed image
            output_image_id = str(uuid.uuid4())
            output_path = (
                self.processed_dir / f"{output_image_id}.{metadata.format.lower()}"
            )
            enhanced_image.save(output_path)

            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            # Create processing result
            result = ProcessingResult(
                result_id=str(uuid.uuid4()),
                operation="enhance",
                input_image_id=image_id,
                output_image_id=output_image_id,
                parameters={
                    "brightness": brightness,
                    "contrast": contrast,
                    "sharpness": sharpness,
                    "color": color,
                },
                processing_time_ms=processing_time,
                success=True,
            )

            # Store result
            self.processing_results[result.result_id] = result
            self._save_processing_results()

            logger.info(f"Enhanced image {image_id}")
            return result

        except Exception as e:
            logger.error(f"Failed to enhance image: {e}")
            # Create error result
            result = ProcessingResult(
                result_id=str(uuid.uuid4()),
                operation="enhance",
                input_image_id=image_id,
                output_image_id="",
                parameters={
                    "brightness": brightness,
                    "contrast": contrast,
                    "sharpness": sharpness,
                    "color": color,
                },
                processing_time_ms=0,
                success=False,
                error_message=str(e),
            )
            self.processing_results[result.result_id] = result
            self._save_processing_results()
            return result

    async def apply_filter(
        self,
        image_id: str,
        filter_type: str,
        **kwargs,
    ) -> ProcessingResult:
        """Apply a filter to an image.

        Args:
            image_id: Image ID
            filter_type: Filter type ('blur', 'sharpen', 'edge_enhance', 'emboss', 'smooth')
            **kwargs: Additional filter parameters

        Returns:
            ProcessingResult object

        """
        try:
            if not PIL_AVAILABLE:
                raise RuntimeError("PIL not available for image processing")

            if image_id not in self.metadata:
                raise ValueError(f"Image {image_id} not found")

            start_time = datetime.now()

            # Load image
            metadata = self.metadata[image_id]
            image_path = self.images_dir / f"{image_id}.{metadata.format.lower()}"
            image = Image.open(image_path)

            # Apply filter
            if filter_type == "blur":
                radius = kwargs.get("radius", 2)
                filtered_image = image.filter(ImageFilter.GaussianBlur(radius=radius))
            elif filter_type == "sharpen":
                filtered_image = image.filter(ImageFilter.SHARPEN)
            elif filter_type == "edge_enhance":
                filtered_image = image.filter(ImageFilter.EDGE_ENHANCE)
            elif filter_type == "emboss":
                filtered_image = image.filter(ImageFilter.EMBOSS)
            elif filter_type == "smooth":
                filtered_image = image.filter(ImageFilter.SMOOTH)
            else:
                raise ValueError(f"Unknown filter type: {filter_type}")

            # Save processed image
            output_image_id = str(uuid.uuid4())
            output_path = (
                self.processed_dir / f"{output_image_id}.{metadata.format.lower()}"
            )
            filtered_image.save(output_path)

            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            # Create processing result
            result = ProcessingResult(
                result_id=str(uuid.uuid4()),
                operation="filter",
                input_image_id=image_id,
                output_image_id=output_image_id,
                parameters={"filter_type": filter_type, **kwargs},
                processing_time_ms=processing_time,
                success=True,
            )

            # Store result
            self.processing_results[result.result_id] = result
            self._save_processing_results()

            logger.info(f"Applied {filter_type} filter to image {image_id}")
            return result

        except Exception as e:
            logger.error(f"Failed to apply filter: {e}")
            # Create error result
            result = ProcessingResult(
                result_id=str(uuid.uuid4()),
                operation="filter",
                input_image_id=image_id,
                output_image_id="",
                parameters={"filter_type": filter_type, **kwargs},
                processing_time_ms=0,
                success=False,
                error_message=str(e),
            )
            self.processing_results[result.result_id] = result
            self._save_processing_results()
            return result

    async def create_thumbnail(
        self,
        image_id: str,
        size: tuple[int, int] = (128, 128),
        quality: int = 85,
    ) -> ProcessingResult:
        """Create a thumbnail of an image.

        Args:
            image_id: Image ID
            size: Thumbnail size (width, height)
            quality: JPEG quality (1-100)

        Returns:
            ProcessingResult object

        """
        try:
            if not PIL_AVAILABLE:
                raise RuntimeError("PIL not available for image processing")

            if image_id not in self.metadata:
                raise ValueError(f"Image {image_id} not found")

            start_time = datetime.now()

            # Load image
            metadata = self.metadata[image_id]
            image_path = self.images_dir / f"{image_id}.{metadata.format.lower()}"
            image = Image.open(image_path)

            # Create thumbnail
            image.thumbnail(size, Image.Resampling.LANCZOS)

            # Save thumbnail
            output_image_id = str(uuid.uuid4())
            output_path = self.thumbnails_dir / f"{output_image_id}.jpg"
            image.save(output_path, "JPEG", quality=quality)

            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            # Create processing result
            result = ProcessingResult(
                result_id=str(uuid.uuid4()),
                operation="thumbnail",
                input_image_id=image_id,
                output_image_id=output_image_id,
                parameters={"size": size, "quality": quality},
                processing_time_ms=processing_time,
                success=True,
            )

            # Store result
            self.processing_results[result.result_id] = result
            self._save_processing_results()

            logger.info(f"Created thumbnail for image {image_id}")
            return result

        except Exception as e:
            logger.error(f"Failed to create thumbnail: {e}")
            # Create error result
            result = ProcessingResult(
                result_id=str(uuid.uuid4()),
                operation="thumbnail",
                input_image_id=image_id,
                output_image_id="",
                parameters={"size": size, "quality": quality},
                processing_time_ms=0,
                success=False,
                error_message=str(e),
            )
            self.processing_results[result.result_id] = result
            self._save_processing_results()
            return result

    async def analyze_image(self, image_id: str) -> ImageAnalysis:
        """Analyze an image and extract features.

        Args:
            image_id: Image ID

        Returns:
            ImageAnalysis object

        """
        try:
            if not PIL_AVAILABLE:
                raise RuntimeError("PIL not available for image processing")

            if image_id not in self.metadata:
                raise ValueError(f"Image {image_id} not found")

            # Load image
            metadata = self.metadata[image_id]
            image_path = self.images_dir / f"{image_id}.{metadata.format.lower()}"
            image = Image.open(image_path)

            # Convert to RGB if necessary
            if image.mode != "RGB":
                image = image.convert("RGB")

            # Convert to numpy array
            image_array = np.array(image)

            # Extract dominant colors
            dominant_colors = self._extract_dominant_colors(image_array)

            # Calculate brightness
            brightness = np.mean(image_array) / 255.0

            # Calculate contrast
            contrast = np.std(image_array) / 255.0

            # Calculate sharpness (using Laplacian variance)
            if OPENCV_AVAILABLE:
                gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
                sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
            else:
                # Fallback using PIL
                sharpness = 0.0  # Placeholder

            # Calculate blur score
            blur_score = self._calculate_blur_score(image_array)

            # Calculate edge density
            edge_density = self._calculate_edge_density(image_array)

            # Extract texture features
            texture_features = {}
            if SKIMAGE_AVAILABLE:
                texture_features = self._extract_texture_features(image_array)

            # Create analysis result
            analysis = ImageAnalysis(
                analysis_id=str(uuid.uuid4()),
                image_id=image_id,
                dominant_colors=dominant_colors,
                brightness=brightness,
                contrast=contrast,
                sharpness=sharpness,
                blur_score=blur_score,
                edge_density=edge_density,
                texture_features=texture_features,
            )

            logger.info(f"Analyzed image {image_id}")
            return analysis

        except Exception as e:
            logger.error(f"Failed to analyze image: {e}")
            raise

    def _extract_dominant_colors(
        self, image_array: np.ndarray, n_colors: int = 5,
    ) -> list[tuple[int, int, int]]:
        """Extract dominant colors from image."""
        try:
            # Reshape image array
            pixels = image_array.reshape(-1, 3)

            # Use K-means clustering to find dominant colors
            if SKLEARN_AVAILABLE:
                from sklearn.cluster import KMeans

                kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
                kmeans.fit(pixels)

                # Get cluster centers (dominant colors)
                dominant_colors = kmeans.cluster_centers_.astype(int).tolist()
            else:
                # Fallback: sample colors
                step = len(pixels) // n_colors
                dominant_colors = [
                    pixels[i].tolist() for i in range(0, len(pixels), step)
                ][:n_colors]

            return dominant_colors

        except Exception as e:
            logger.error(f"Failed to extract dominant colors: {e}")
            return [(128, 128, 128)] * n_colors  # Fallback gray

    def _calculate_blur_score(self, image_array: np.ndarray) -> float:
        """Calculate blur score using Laplacian variance."""
        try:
            if OPENCV_AVAILABLE:
                gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
                return cv2.Laplacian(gray, cv2.CV_64F).var()
            # Fallback using PIL
            return 0.0
        except:
            return 0.0

    def _calculate_edge_density(self, image_array: np.ndarray) -> float:
        """Calculate edge density in the image."""
        try:
            if SKIMAGE_AVAILABLE:
                gray = color.rgb2gray(image_array)
                edges = filters.sobel(gray)
                return np.mean(edges > 0.1)
            return 0.0
        except:
            return 0.0

    def _extract_texture_features(self, image_array: np.ndarray) -> dict[str, float]:
        """Extract texture features from image."""
        try:
            if not SKIMAGE_AVAILABLE:
                return {}

            gray = color.rgb2gray(image_array)

            # Local Binary Pattern
            lbp = local_binary_pattern(gray, 8, 1, method="uniform")
            lbp_hist, _ = np.histogram(lbp.ravel(), bins=10, range=(0, 10))
            lbp_hist = lbp_hist.astype(float) / lbp_hist.sum()

            # HOG features
            hog_features = hog(
                gray, orientations=9, pixels_per_cell=(8, 8), cells_per_block=(2, 2),
            )

            return {
                "lbp_entropy": -np.sum(lbp_hist * np.log2(lbp_hist + 1e-10)),
                "hog_mean": np.mean(hog_features),
                "hog_std": np.std(hog_features),
            }

        except Exception as e:
            logger.error(f"Failed to extract texture features: {e}")
            return {}

    async def get_image_statistics(self, image_id: str) -> dict[str, Any]:
        """Get statistics for an image.

        Args:
            image_id: Image ID

        Returns:
            Dictionary containing image statistics

        """
        try:
            if image_id not in self.metadata:
                raise ValueError(f"Image {image_id} not found")

            metadata = self.metadata[image_id]

            # Get processing results for this image
            processing_results = [
                result
                for result in self.processing_results.values()
                if result.input_image_id == image_id
            ]

            statistics = {
                "image_id": image_id,
                "metadata": asdict(metadata),
                "processing_count": len(processing_results),
                "successful_operations": len(
                    [r for r in processing_results if r.success],
                ),
                "failed_operations": len(
                    [r for r in processing_results if not r.success],
                ),
                "average_processing_time": (
                    sum(r.processing_time_ms for r in processing_results)
                    / len(processing_results)
                    if processing_results
                    else 0
                ),
                "operations": [result.operation for result in processing_results],
            }

            return statistics

        except Exception as e:
            logger.error(f"Failed to get image statistics: {e}")
            raise

    async def delete_image(self, image_id: str) -> bool:
        """Delete an image and its associated data.

        Args:
            image_id: Image ID

        Returns:
            True if successful

        """
        try:
            if image_id not in self.metadata:
                return False

            # Remove metadata
            del self.metadata[image_id]
            self._save_metadata()

            # Remove processing results
            results_to_remove = [
                result_id
                for result_id, result in self.processing_results.items()
                if result.input_image_id == image_id
                or result.output_image_id == image_id
            ]
            for result_id in results_to_remove:
                del self.processing_results[result_id]
            self._save_processing_results()

            # Remove image files
            image_files = list(self.images_dir.glob(f"{image_id}.*"))
            for file_path in image_files:
                try:
                    file_path.unlink()
                except:
                    pass

            # Remove processed images
            processed_files = list(self.processed_dir.glob(f"*{image_id}*"))
            for file_path in processed_files:
                try:
                    file_path.unlink()
                except:
                    pass

            # Remove thumbnails
            thumbnail_files = list(self.thumbnails_dir.glob(f"*{image_id}*"))
            for file_path in thumbnail_files:
                try:
                    file_path.unlink()
                except:
                    pass

            logger.info(f"Deleted image: {image_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete image: {e}")
            return False


# Global image processing service instance
image_processing_service = ImageProcessingService()
