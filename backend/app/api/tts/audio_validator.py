"""
🦊 Reynard TTS Audio Validator
==============================

Advanced audio format validation and quality metrics for TTS service with comprehensive
audio analysis, format detection, and quality assessment capabilities.

This module provides:
- Comprehensive audio format validation
- Audio quality metrics and analysis
- Format conversion validation
- Audio file integrity checking
- Bitrate and sample rate validation
- Duration and size validation
- Audio content analysis

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import io
import os
import struct
import wave
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import aiofiles

from ...core.logging_config import get_service_logger

logger = get_service_logger("tts")


class AudioFormatError(Exception):
    """Exception raised for audio format validation errors."""

    def __init__(self, message: str, format_info: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.format_info = format_info or {}


class AudioQualityError(Exception):
    """Exception raised for audio quality issues."""

    def __init__(self, message: str, quality_metrics: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.quality_metrics = quality_metrics or {}


class AudioValidator:
    """
    Comprehensive audio validation and quality analysis.

    Provides advanced audio format validation, quality metrics,
    and content analysis for TTS service integration.
    """

    # Supported audio formats with their signatures
    AUDIO_FORMATS = {
        "wav": {
            "signature": b"RIFF",
            "mime_types": ["audio/wav", "audio/wave", "audio/x-wav"],
            "extensions": [".wav", ".wave"],
            "max_size_mb": 100,
            "min_duration": 0.1,
            "max_duration": 3600,  # 1 hour
        },
        "mp3": {
            "signature": b"\xff\xfb",
            "mime_types": ["audio/mpeg", "audio/mp3"],
            "extensions": [".mp3"],
            "max_size_mb": 50,
            "min_duration": 0.1,
            "max_duration": 3600,
        },
        "ogg": {
            "signature": b"OggS",
            "mime_types": ["audio/ogg", "audio/vorbis"],
            "extensions": [".ogg", ".oga"],
            "max_size_mb": 50,
            "min_duration": 0.1,
            "max_duration": 3600,
        },
        "flac": {
            "signature": b"fLaC",
            "mime_types": ["audio/flac"],
            "extensions": [".flac"],
            "max_size_mb": 200,
            "min_duration": 0.1,
            "max_duration": 3600,
        },
        "opus": {
            "signature": b"OpusHead",
            "mime_types": ["audio/opus"],
            "extensions": [".opus"],
            "max_size_mb": 30,
            "min_duration": 0.1,
            "max_duration": 3600,
        },
    }

    # Quality thresholds
    QUALITY_THRESHOLDS = {
        "low": {
            "min_bitrate": 64,
            "min_sample_rate": 8000,
            "min_channels": 1,
            "max_noise_ratio": 0.3,
        },
        "medium": {
            "min_bitrate": 128,
            "min_sample_rate": 16000,
            "min_channels": 1,
            "max_noise_ratio": 0.2,
        },
        "high": {
            "min_bitrate": 256,
            "min_sample_rate": 22050,
            "min_channels": 1,
            "max_noise_ratio": 0.1,
        },
        "ultra": {
            "min_bitrate": 320,
            "min_sample_rate": 44100,
            "min_channels": 1,
            "max_noise_ratio": 0.05,
        },
    }

    def __init__(self, quality_level: str = "high"):
        self.quality_level = quality_level
        self.thresholds = self.QUALITY_THRESHOLDS.get(
            quality_level, self.QUALITY_THRESHOLDS["high"]
        )

    async def validate_audio_file(
        self, file_path: Union[str, Path], validate_content: bool = True
    ) -> Dict[str, Any]:
        """
        Comprehensive audio file validation.

        Args:
            file_path: Path to audio file
            validate_content: Whether to perform content validation

        Returns:
            Dictionary with validation results and audio metadata

        Raises:
            AudioFormatError: If format validation fails
            AudioQualityError: If quality validation fails
        """
        file_path = Path(file_path)

        if not file_path.exists():
            raise AudioFormatError(f"Audio file not found: {file_path}")

        # Basic file validation
        file_size = file_path.stat().st_size
        if file_size == 0:
            raise AudioFormatError("Audio file is empty")

        # Read file header for format detection
        async with aiofiles.open(file_path, "rb") as f:
            header = await f.read(1024)  # Read first 1KB for format detection

        # Detect audio format
        format_info = self._detect_audio_format(header, file_path.suffix.lower())
        if not format_info:
            raise AudioFormatError(
                f"Unsupported audio format: {file_path.suffix}",
                {"detected_formats": list(self.AUDIO_FORMATS.keys())},
            )

        # Validate file size
        max_size_bytes = format_info["max_size_mb"] * 1024 * 1024
        if file_size > max_size_bytes:
            raise AudioFormatError(
                f"File too large: {file_size / (1024*1024):.1f}MB > {format_info['max_size_mb']}MB",
                format_info,
            )

        # Get audio metadata
        metadata = await self._get_audio_metadata(file_path, format_info["format"])

        # Validate duration
        if metadata["duration"] < format_info["min_duration"]:
            raise AudioFormatError(
                f"Audio too short: {metadata['duration']:.2f}s < {format_info['min_duration']}s",
                format_info,
            )

        if metadata["duration"] > format_info["max_duration"]:
            raise AudioFormatError(
                f"Audio too long: {metadata['duration']:.2f}s > {format_info['max_duration']}s",
                format_info,
            )

        # Quality validation
        if validate_content:
            quality_metrics = await self._analyze_audio_quality(file_path, metadata)
            self._validate_quality_metrics(quality_metrics)

            return {
                "valid": True,
                "format": format_info["format"],
                "metadata": metadata,
                "quality_metrics": quality_metrics,
                "file_size": file_size,
                "validation_timestamp": asyncio.get_event_loop().time(),
            }

        return {
            "valid": True,
            "format": format_info["format"],
            "metadata": metadata,
            "file_size": file_size,
            "validation_timestamp": asyncio.get_event_loop().time(),
        }

    async def validate_uploaded_audio(
        self, file_content: bytes, filename: str, validate_content: bool = True
    ) -> Dict[str, Any]:
        """
        Validate uploaded audio file content.

        Args:
            file_content: Raw file content
            filename: Original filename
            validate_content: Whether to perform content validation

        Returns:
            Dictionary with validation results
        """
        if not file_content:
            raise AudioFormatError("Uploaded audio file is empty")

        # Detect format from content
        format_info = self._detect_audio_format(
            file_content[:1024], Path(filename).suffix.lower()
        )
        if not format_info:
            raise AudioFormatError(
                f"Unsupported audio format: {Path(filename).suffix}",
                {"detected_formats": list(self.AUDIO_FORMATS.keys())},
            )

        # Validate file size
        file_size = len(file_content)
        max_size_bytes = format_info["max_size_mb"] * 1024 * 1024
        if file_size > max_size_bytes:
            raise AudioFormatError(
                f"File too large: {file_size / (1024*1024):.1f}MB > {format_info['max_size_mb']}MB",
                format_info,
            )

        # Create temporary file for analysis
        temp_path = Path(f"temp/audio_validation_{asyncio.get_event_loop().time()}.tmp")
        temp_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            async with aiofiles.open(temp_path, "wb") as f:
                await f.write(file_content)

            # Get metadata
            metadata = await self._get_audio_metadata(temp_path, format_info["format"])

            # Validate duration
            if metadata["duration"] < format_info["min_duration"]:
                raise AudioFormatError(
                    f"Audio too short: {metadata['duration']:.2f}s < {format_info['min_duration']}s",
                    format_info,
                )

            if metadata["duration"] > format_info["max_duration"]:
                raise AudioFormatError(
                    f"Audio too long: {metadata['duration']:.2f}s > {format_info['max_duration']}s",
                    format_info,
                )

            # Quality validation
            if validate_content:
                quality_metrics = await self._analyze_audio_quality(temp_path, metadata)
                self._validate_quality_metrics(quality_metrics)

                return {
                    "valid": True,
                    "format": format_info["format"],
                    "metadata": metadata,
                    "quality_metrics": quality_metrics,
                    "file_size": file_size,
                    "validation_timestamp": asyncio.get_event_loop().time(),
                }

            return {
                "valid": True,
                "format": format_info["format"],
                "metadata": metadata,
                "file_size": file_size,
                "validation_timestamp": asyncio.get_event_loop().time(),
            }

        finally:
            # Clean up temporary file
            if temp_path.exists():
                temp_path.unlink(missing_ok=True)

    def _detect_audio_format(
        self, header: bytes, extension: str
    ) -> Optional[Dict[str, Any]]:
        """Detect audio format from file header and extension."""
        for format_name, format_info in self.AUDIO_FORMATS.items():
            # Check extension
            if extension in format_info["extensions"]:
                # Check signature for some formats
                if format_name in ["wav", "ogg", "flac"] and header.startswith(
                    format_info["signature"]
                ):
                    return {"format": format_name, **format_info}
                elif format_name in ["mp3", "opus"]:
                    # MP3 and Opus have more complex signatures
                    if self._check_complex_signature(header, format_name):
                        return {"format": format_name, **format_info}
                else:
                    return {"format": format_name, **format_info}

        return None

    def _check_complex_signature(self, header: bytes, format_name: str) -> bool:
        """Check complex audio signatures (MP3, Opus)."""
        if format_name == "mp3":
            # Check for MP3 frame headers
            return header.startswith(b"\xff\xfb") or header.startswith(b"\xff\xfa")
        elif format_name == "opus":
            # Check for Opus header
            return b"OpusHead" in header[:100]
        return False

    async def _get_audio_metadata(
        self, file_path: Path, format_name: str
    ) -> Dict[str, Any]:
        """Get audio metadata based on format."""
        if format_name == "wav":
            return await self._get_wav_metadata(file_path)
        else:
            # For other formats, use basic file analysis
            return await self._get_basic_metadata(file_path)

    async def _get_wav_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Get WAV file metadata."""
        try:
            async with aiofiles.open(file_path, "rb") as f:
                # Read WAV header
                header = await f.read(44)

                if len(header) < 44:
                    raise AudioFormatError("Invalid WAV file: header too short")

                # Parse WAV header
                riff, file_size, wave, fmt, fmt_size = struct.unpack(
                    "<4sI4s4sI", header[:20]
                )

                if riff != b"RIFF" or wave != b"WAVE" or fmt != b"fmt ":
                    raise AudioFormatError(
                        "Invalid WAV file: missing RIFF/WAVE/fmt headers"
                    )

                # Read format chunk
                format_data = await f.read(16)
                if len(format_data) < 16:
                    raise AudioFormatError("Invalid WAV file: format chunk too short")

                (
                    audio_format,
                    channels,
                    sample_rate,
                    byte_rate,
                    block_align,
                    bits_per_sample,
                ) = struct.unpack("<HHIIHH", format_data)

                # Calculate duration
                if byte_rate > 0:
                    duration = file_size / byte_rate
                else:
                    duration = 0.0

                return {
                    "format": "wav",
                    "channels": channels,
                    "sample_rate": sample_rate,
                    "bits_per_sample": bits_per_sample,
                    "byte_rate": byte_rate,
                    "duration": duration,
                    "audio_format": audio_format,
                }

        except Exception as e:
            logger.error(f"Error reading WAV metadata: {e}")
            raise AudioFormatError(f"Failed to read WAV metadata: {e}")

    async def _get_basic_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Get basic metadata for non-WAV formats."""
        # For non-WAV formats, we'll use file size and basic analysis
        file_size = file_path.stat().st_size

        # Estimate duration based on file size and format
        # This is a rough estimate - in production, you'd use proper audio libraries
        estimated_duration = file_size / (16000 * 2)  # Assume 16kHz, 16-bit mono

        return {
            "format": "unknown",
            "channels": 1,  # Default assumption
            "sample_rate": 16000,  # Default assumption
            "bits_per_sample": 16,  # Default assumption
            "byte_rate": 32000,  # Default assumption
            "duration": estimated_duration,
            "estimated": True,
        }

    async def _analyze_audio_quality(
        self, file_path: Path, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze audio quality metrics."""
        try:
            # Basic quality metrics
            quality_metrics = {
                "sample_rate": metadata.get("sample_rate", 0),
                "channels": metadata.get("channels", 0),
                "bits_per_sample": metadata.get("bits_per_sample", 0),
                "duration": metadata.get("duration", 0.0),
                "estimated_bitrate": self._estimate_bitrate(metadata),
                "quality_score": 0.0,
                "issues": [],
            }

            # Calculate quality score
            quality_score = self._calculate_quality_score(quality_metrics)
            quality_metrics["quality_score"] = quality_score

            # Check for common issues
            issues = self._check_audio_issues(quality_metrics)
            quality_metrics["issues"] = issues

            return quality_metrics

        except Exception as e:
            logger.error(f"Error analyzing audio quality: {e}")
            return {
                "sample_rate": 0,
                "channels": 0,
                "bits_per_sample": 0,
                "duration": 0.0,
                "estimated_bitrate": 0,
                "quality_score": 0.0,
                "issues": [f"Quality analysis failed: {e}"],
            }

    def _estimate_bitrate(self, metadata: Dict[str, Any]) -> int:
        """Estimate audio bitrate from metadata."""
        sample_rate = metadata.get("sample_rate", 0)
        channels = metadata.get("channels", 0)
        bits_per_sample = metadata.get("bits_per_sample", 0)

        if sample_rate and channels and bits_per_sample:
            return sample_rate * channels * bits_per_sample
        return 0

    def _calculate_quality_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall audio quality score (0.0 to 1.0)."""
        score = 0.0

        # Sample rate score (0-0.3)
        sample_rate = metrics.get("sample_rate", 0)
        if sample_rate >= 44100:
            score += 0.3
        elif sample_rate >= 22050:
            score += 0.2
        elif sample_rate >= 16000:
            score += 0.1

        # Bit depth score (0-0.2)
        bits_per_sample = metrics.get("bits_per_sample", 0)
        if bits_per_sample >= 24:
            score += 0.2
        elif bits_per_sample >= 16:
            score += 0.15
        elif bits_per_sample >= 8:
            score += 0.1

        # Channel score (0-0.1)
        channels = metrics.get("channels", 0)
        if channels >= 2:
            score += 0.1
        elif channels >= 1:
            score += 0.05

        # Bitrate score (0-0.4)
        bitrate = metrics.get("estimated_bitrate", 0)
        if bitrate >= 320000:  # 320 kbps
            score += 0.4
        elif bitrate >= 256000:  # 256 kbps
            score += 0.3
        elif bitrate >= 128000:  # 128 kbps
            score += 0.2
        elif bitrate >= 64000:  # 64 kbps
            score += 0.1

        return min(score, 1.0)

    def _check_audio_issues(self, metrics: Dict[str, Any]) -> List[str]:
        """Check for common audio quality issues."""
        issues = []

        # Check sample rate
        sample_rate = metrics.get("sample_rate", 0)
        if sample_rate < self.thresholds["min_sample_rate"]:
            issues.append(
                f"Low sample rate: {sample_rate}Hz < {self.thresholds['min_sample_rate']}Hz"
            )

        # Check bitrate
        bitrate = metrics.get("estimated_bitrate", 0)
        if bitrate < self.thresholds["min_bitrate"] * 1000:
            issues.append(
                f"Low bitrate: {bitrate//1000}kbps < {self.thresholds['min_bitrate']}kbps"
            )

        # Check channels
        channels = metrics.get("channels", 0)
        if channels < self.thresholds["min_channels"]:
            issues.append(
                f"Insufficient channels: {channels} < {self.thresholds['min_channels']}"
            )

        # Check duration
        duration = metrics.get("duration", 0.0)
        if duration < 0.1:
            issues.append("Audio too short for analysis")
        elif duration > 3600:
            issues.append("Audio too long (over 1 hour)")

        return issues

    def _validate_quality_metrics(self, metrics: Dict[str, Any]) -> None:
        """Validate audio quality against thresholds."""
        issues = metrics.get("issues", [])
        if issues:
            raise AudioQualityError(
                f"Audio quality issues detected: {', '.join(issues)}",
                metrics,
            )

        quality_score = metrics.get("quality_score", 0.0)
        if quality_score < 0.3:  # Minimum acceptable quality
            raise AudioQualityError(
                f"Audio quality too low: {quality_score:.2f} < 0.3",
                metrics,
            )

    async def get_supported_formats(self) -> Dict[str, Any]:
        """Get information about supported audio formats."""
        return {
            "supported_formats": list(self.AUDIO_FORMATS.keys()),
            "format_details": self.AUDIO_FORMATS,
            "quality_levels": list(self.QUALITY_THRESHOLDS.keys()),
            "current_quality_level": self.quality_level,
            "current_thresholds": self.thresholds,
        }


# Global validator instance
_audio_validator: Optional[AudioValidator] = None


def get_audio_validator(quality_level: str = "high") -> AudioValidator:
    """Get the global audio validator instance."""
    global _audio_validator
    if _audio_validator is None or _audio_validator.quality_level != quality_level:
        _audio_validator = AudioValidator(quality_level)
    return _audio_validator
