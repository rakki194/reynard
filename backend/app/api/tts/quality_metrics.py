"""🦊 Reynard TTS Audio Quality Metrics
====================================

Advanced audio quality metrics and analysis for TTS service with comprehensive
quality assessment, performance tracking, and optimization recommendations.

This module provides:
- Real-time audio quality analysis
- Performance metrics collection
- Quality trend analysis
- Optimization recommendations
- Quality-based routing
- A/B testing support for quality improvements

Author: Reynard Development Team
Version: 1.0.0
"""

import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Any

from ...core.logging_config import get_service_logger

logger = get_service_logger("tts")


@dataclass
class AudioQualityMetrics:
    """Comprehensive audio quality metrics."""

    # Basic metrics
    sample_rate: int = 0
    channels: int = 0
    bits_per_sample: int = 0
    duration: float = 0.0
    bitrate: int = 0

    # Quality scores (0.0 to 1.0)
    overall_quality: float = 0.0
    clarity_score: float = 0.0
    naturalness_score: float = 0.0
    intelligibility_score: float = 0.0

    # Technical metrics
    signal_to_noise_ratio: float = 0.0
    dynamic_range: float = 0.0
    frequency_response_score: float = 0.0
    distortion_level: float = 0.0

    # Performance metrics
    processing_time: float = 0.0
    memory_usage: float = 0.0
    cpu_usage: float = 0.0

    # Metadata
    backend_used: str = ""
    voice_used: str = ""
    language: str = ""
    timestamp: float = field(default_factory=time.time)

    # Issues and recommendations
    issues: list[str] = field(default_factory=list)
    recommendations: list[str] = field(default_factory=list)


@dataclass
class QualityTrend:
    """Quality trend analysis data."""

    time_window: str  # "1h", "24h", "7d", "30d"
    average_quality: float
    quality_variance: float
    trend_direction: str  # "improving", "declining", "stable"
    sample_count: int
    last_updated: float = field(default_factory=time.time)


class AudioQualityAnalyzer:
    """Advanced audio quality analysis and metrics collection.

    Provides comprehensive quality assessment, trend analysis,
    and optimization recommendations for TTS service.
    """

    def __init__(self, max_history_size: int = 10000):
        self.max_history_size = max_history_size
        self.quality_history: deque = deque(maxlen=max_history_size)
        self.backend_metrics: dict[str, list[AudioQualityMetrics]] = defaultdict(list)
        self.voice_metrics: dict[str, list[AudioQualityMetrics]] = defaultdict(list)
        self.language_metrics: dict[str, list[AudioQualityMetrics]] = defaultdict(list)

        # Quality thresholds
        self.quality_thresholds = {
            "excellent": 0.9,
            "good": 0.7,
            "acceptable": 0.5,
            "poor": 0.3,
        }

    async def analyze_audio_quality(
        self,
        audio_metadata: dict[str, Any],
        processing_metrics: dict[str, Any],
        backend: str = "",
        voice: str = "",
        language: str = "",
    ) -> AudioQualityMetrics:
        """Analyze audio quality and create comprehensive metrics.

        Args:
            audio_metadata: Audio file metadata
            processing_metrics: Processing performance metrics
            backend: TTS backend used
            voice: Voice used for synthesis
            language: Language of synthesis

        Returns:
            Comprehensive audio quality metrics

        """
        try:
            # Create base metrics
            metrics = AudioQualityMetrics(
                sample_rate=audio_metadata.get("sample_rate", 0),
                channels=audio_metadata.get("channels", 0),
                bits_per_sample=audio_metadata.get("bits_per_sample", 0),
                duration=audio_metadata.get("duration", 0.0),
                bitrate=audio_metadata.get("estimated_bitrate", 0),
                processing_time=processing_metrics.get("processing_time", 0.0),
                memory_usage=processing_metrics.get("memory_usage", 0.0),
                cpu_usage=processing_metrics.get("cpu_usage", 0.0),
                backend_used=backend,
                voice_used=voice,
                language=language,
            )

            # Calculate quality scores
            metrics.overall_quality = await self._calculate_overall_quality(metrics)
            metrics.clarity_score = await self._calculate_clarity_score(metrics)
            metrics.naturalness_score = await self._calculate_naturalness_score(metrics)
            metrics.intelligibility_score = await self._calculate_intelligibility_score(
                metrics,
            )

            # Calculate technical metrics
            metrics.signal_to_noise_ratio = await self._calculate_snr(metrics)
            metrics.dynamic_range = await self._calculate_dynamic_range(metrics)
            metrics.frequency_response_score = await self._calculate_frequency_response(
                metrics,
            )
            metrics.distortion_level = await self._calculate_distortion(metrics)

            # Identify issues and recommendations
            metrics.issues = await self._identify_issues(metrics)
            metrics.recommendations = await self._generate_recommendations(metrics)

            # Store metrics
            await self._store_metrics(metrics)

            logger.info(
                f"Audio quality analyzed: {metrics.overall_quality:.3f} overall quality",
                extra={
                    "backend": backend,
                    "voice": voice,
                    "language": language,
                    "duration": metrics.duration,
                    "issues_count": len(metrics.issues),
                },
            )

            return metrics

        except Exception as e:
            logger.error(f"Error analyzing audio quality: {e}")
            # Return minimal metrics on error
            return AudioQualityMetrics(
                backend_used=backend,
                voice_used=voice,
                language=language,
                issues=[f"Quality analysis failed: {e}"],
            )

    async def _calculate_overall_quality(self, metrics: AudioQualityMetrics) -> float:
        """Calculate overall audio quality score."""
        score = 0.0

        # Technical quality (40% weight)
        technical_score = 0.0
        if metrics.sample_rate >= 44100:
            technical_score += 0.3
        elif metrics.sample_rate >= 22050:
            technical_score += 0.2
        elif metrics.sample_rate >= 16000:
            technical_score += 0.1

        if metrics.bits_per_sample >= 24:
            technical_score += 0.2
        elif metrics.bits_per_sample >= 16:
            technical_score += 0.15
        elif metrics.bits_per_sample >= 8:
            technical_score += 0.1

        if metrics.bitrate >= 320000:
            technical_score += 0.3
        elif metrics.bitrate >= 256000:
            technical_score += 0.2
        elif metrics.bitrate >= 128000:
            technical_score += 0.1

        score += technical_score * 0.4

        # Performance quality (20% weight)
        performance_score = 1.0
        if metrics.processing_time > 10.0:  # Over 10 seconds
            performance_score -= 0.3
        elif metrics.processing_time > 5.0:  # Over 5 seconds
            performance_score -= 0.1

        if metrics.memory_usage > 1000:  # Over 1GB
            performance_score -= 0.2
        elif metrics.memory_usage > 500:  # Over 500MB
            performance_score -= 0.1

        score += max(0.0, performance_score) * 0.2

        # Duration appropriateness (10% weight)
        duration_score = 1.0
        if metrics.duration < 0.1:  # Too short
            duration_score -= 0.5
        elif metrics.duration > 3600:  # Too long
            duration_score -= 0.3

        score += duration_score * 0.1

        # Backend-specific quality (30% weight)
        backend_score = await self._get_backend_quality_score(metrics.backend_used)
        score += backend_score * 0.3

        return min(score, 1.0)

    async def _calculate_clarity_score(self, metrics: AudioQualityMetrics) -> float:
        """Calculate audio clarity score."""
        score = 0.0

        # Sample rate impact on clarity
        if metrics.sample_rate >= 44100:
            score += 0.4
        elif metrics.sample_rate >= 22050:
            score += 0.3
        elif metrics.sample_rate >= 16000:
            score += 0.2
        elif metrics.sample_rate >= 8000:
            score += 0.1

        # Bit depth impact on clarity
        if metrics.bits_per_sample >= 24:
            score += 0.3
        elif metrics.bits_per_sample >= 16:
            score += 0.2
        elif metrics.bits_per_sample >= 8:
            score += 0.1

        # Channel configuration
        if metrics.channels >= 2:
            score += 0.2
        elif metrics.channels >= 1:
            score += 0.1

        # Backend-specific clarity
        backend_clarity = await self._get_backend_clarity_score(metrics.backend_used)
        score += backend_clarity * 0.1

        return min(score, 1.0)

    async def _calculate_naturalness_score(self, metrics: AudioQualityMetrics) -> float:
        """Calculate speech naturalness score."""
        score = 0.0

        # Backend-specific naturalness (most important factor)
        backend_naturalness = await self._get_backend_naturalness_score(
            metrics.backend_used,
        )
        score += backend_naturalness * 0.6

        # Voice quality impact
        voice_naturalness = await self._get_voice_naturalness_score(metrics.voice_used)
        score += voice_naturalness * 0.3

        # Language-specific naturalness
        language_naturalness = await self._get_language_naturalness_score(
            metrics.language,
        )
        score += language_naturalness * 0.1

        return min(score, 1.0)

    async def _calculate_intelligibility_score(
        self, metrics: AudioQualityMetrics,
    ) -> float:
        """Calculate speech intelligibility score."""
        score = 0.0

        # Sample rate impact on intelligibility
        if metrics.sample_rate >= 16000:
            score += 0.4
        elif metrics.sample_rate >= 8000:
            score += 0.2

        # Bit depth impact
        if metrics.bits_per_sample >= 16:
            score += 0.3
        elif metrics.bits_per_sample >= 8:
            score += 0.1

        # Backend-specific intelligibility
        backend_intelligibility = await self._get_backend_intelligibility_score(
            metrics.backend_used,
        )
        score += backend_intelligibility * 0.3

        return min(score, 1.0)

    async def _calculate_snr(self, metrics: AudioQualityMetrics) -> float:
        """Calculate estimated signal-to-noise ratio."""
        # This is a simplified estimation - in production, you'd analyze actual audio
        base_snr = 20.0  # Base SNR in dB

        # Adjust based on bit depth
        if metrics.bits_per_sample >= 24:
            base_snr += 10.0
        elif metrics.bits_per_sample >= 16:
            base_snr += 5.0

        # Adjust based on sample rate
        if metrics.sample_rate >= 44100:
            base_snr += 5.0
        elif metrics.sample_rate >= 22050:
            base_snr += 2.0

        return base_snr

    async def _calculate_dynamic_range(self, metrics: AudioQualityMetrics) -> float:
        """Calculate estimated dynamic range."""
        # Simplified calculation based on bit depth
        if metrics.bits_per_sample >= 24:
            return 144.0  # 24-bit theoretical maximum
        if metrics.bits_per_sample >= 16:
            return 96.0  # 16-bit theoretical maximum
        if metrics.bits_per_sample >= 8:
            return 48.0  # 8-bit theoretical maximum
        return 0.0

    async def _calculate_frequency_response_score(
        self, metrics: AudioQualityMetrics,
    ) -> float:
        """Calculate frequency response quality score."""
        score = 0.0

        # Sample rate determines frequency range
        if metrics.sample_rate >= 44100:
            score += 0.5  # Full frequency range
        elif metrics.sample_rate >= 22050:
            score += 0.3  # Good frequency range
        elif metrics.sample_rate >= 16000:
            score += 0.2  # Limited frequency range
        elif metrics.sample_rate >= 8000:
            score += 0.1  # Basic frequency range

        # Backend-specific frequency response
        backend_response = await self._get_backend_frequency_response(
            metrics.backend_used,
        )
        score += backend_response * 0.5

        return min(score, 1.0)

    async def _calculate_distortion(self, metrics: AudioQualityMetrics) -> float:
        """Calculate estimated distortion level."""
        # Simplified estimation - in production, you'd analyze actual audio
        distortion = 0.0

        # Higher bit rates generally mean less distortion
        if metrics.bitrate < 64000:
            distortion += 0.3
        elif metrics.bitrate < 128000:
            distortion += 0.2
        elif metrics.bitrate < 256000:
            distortion += 0.1

        # Backend-specific distortion characteristics
        backend_distortion = await self._get_backend_distortion(metrics.backend_used)
        distortion += backend_distortion

        return min(distortion, 1.0)

    async def _get_backend_quality_score(self, backend: str) -> float:
        """Get quality score for specific backend."""
        backend_scores = {
            "xtts": 0.9,  # High quality neural TTS
            "coqui": 0.8,  # Good quality neural TTS
            "espeak": 0.5,  # Basic concatenative TTS
            "festival": 0.6,  # Better concatenative TTS
            "default": 0.7,  # Default score
        }
        return backend_scores.get(backend.lower(), backend_scores["default"])

    async def _get_backend_clarity_score(self, backend: str) -> float:
        """Get clarity score for specific backend."""
        clarity_scores = {
            "xtts": 0.9,
            "coqui": 0.8,
            "espeak": 0.6,
            "festival": 0.7,
            "default": 0.7,
        }
        return clarity_scores.get(backend.lower(), clarity_scores["default"])

    async def _get_backend_naturalness_score(self, backend: str) -> float:
        """Get naturalness score for specific backend."""
        naturalness_scores = {
            "xtts": 0.95,  # Very natural
            "coqui": 0.85,  # Natural
            "espeak": 0.4,  # Robotic
            "festival": 0.5,  # Less robotic
            "default": 0.7,
        }
        return naturalness_scores.get(backend.lower(), naturalness_scores["default"])

    async def _get_backend_intelligibility_score(self, backend: str) -> float:
        """Get intelligibility score for specific backend."""
        intelligibility_scores = {
            "xtts": 0.9,
            "coqui": 0.85,
            "espeak": 0.7,
            "festival": 0.75,
            "default": 0.8,
        }
        return intelligibility_scores.get(
            backend.lower(), intelligibility_scores["default"],
        )

    async def _get_backend_frequency_response(self, backend: str) -> float:
        """Get frequency response score for specific backend."""
        response_scores = {
            "xtts": 0.9,
            "coqui": 0.8,
            "espeak": 0.6,
            "festival": 0.7,
            "default": 0.7,
        }
        return response_scores.get(backend.lower(), response_scores["default"])

    async def _get_backend_distortion(self, backend: str) -> float:
        """Get distortion level for specific backend."""
        distortion_levels = {
            "xtts": 0.05,  # Very low distortion
            "coqui": 0.1,  # Low distortion
            "espeak": 0.3,  # Higher distortion
            "festival": 0.2,  # Medium distortion
            "default": 0.15,
        }
        return distortion_levels.get(backend.lower(), distortion_levels["default"])

    async def _get_voice_naturalness_score(self, voice: str) -> float:
        """Get naturalness score for specific voice."""
        # This would typically be based on voice characteristics
        # For now, return a default score
        return 0.8

    async def _get_language_naturalness_score(self, language: str) -> float:
        """Get naturalness score for specific language."""
        # Some languages are more challenging for TTS
        language_scores = {
            "en": 0.9,  # English - well supported
            "es": 0.85,  # Spanish - good support
            "fr": 0.8,  # French - good support
            "de": 0.8,  # German - good support
            "zh": 0.7,  # Chinese - more challenging
            "ja": 0.7,  # Japanese - more challenging
            "default": 0.8,
        }
        return language_scores.get(language.lower(), language_scores["default"])

    async def _identify_issues(self, metrics: AudioQualityMetrics) -> list[str]:
        """Identify quality issues in the audio."""
        issues = []

        # Check overall quality
        if metrics.overall_quality < self.quality_thresholds["acceptable"]:
            issues.append(f"Low overall quality: {metrics.overall_quality:.2f}")

        # Check clarity
        if metrics.clarity_score < 0.5:
            issues.append(f"Poor clarity: {metrics.clarity_score:.2f}")

        # Check naturalness
        if metrics.naturalness_score < 0.6:
            issues.append(f"Unnatural speech: {metrics.naturalness_score:.2f}")

        # Check intelligibility
        if metrics.intelligibility_score < 0.7:
            issues.append(f"Poor intelligibility: {metrics.intelligibility_score:.2f}")

        # Check technical issues
        if metrics.sample_rate < 16000:
            issues.append(f"Low sample rate: {metrics.sample_rate}Hz")

        if metrics.bits_per_sample < 16:
            issues.append(f"Low bit depth: {metrics.bits_per_sample} bits")

        if metrics.distortion_level > 0.2:
            issues.append(f"High distortion: {metrics.distortion_level:.2f}")

        # Check performance issues
        if metrics.processing_time > 10.0:
            issues.append(f"Slow processing: {metrics.processing_time:.1f}s")

        return issues

    async def _generate_recommendations(
        self, metrics: AudioQualityMetrics,
    ) -> list[str]:
        """Generate optimization recommendations."""
        recommendations = []

        # Quality improvement recommendations
        if metrics.overall_quality < 0.7:
            recommendations.append(
                "Consider using a higher quality TTS backend (e.g., XTTS)",
            )

        if metrics.sample_rate < 22050:
            recommendations.append(
                "Increase sample rate to 22050Hz or higher for better quality",
            )

        if metrics.bits_per_sample < 16:
            recommendations.append("Use 16-bit or higher audio for better quality")

        if metrics.naturalness_score < 0.7:
            recommendations.append(
                "Try a different voice or backend for more natural speech",
            )

        # Performance optimization recommendations
        if metrics.processing_time > 5.0:
            recommendations.append(
                "Consider optimizing text length or using faster backend",
            )

        if metrics.memory_usage > 500:
            recommendations.append("Monitor memory usage and consider batch processing")

        # Backend-specific recommendations
        if metrics.backend_used == "espeak" and metrics.naturalness_score < 0.6:
            recommendations.append(
                "Consider upgrading to neural TTS backend for better naturalness",
            )

        return recommendations

    async def _store_metrics(self, metrics: AudioQualityMetrics) -> None:
        """Store metrics in history and categorized collections."""
        self.quality_history.append(metrics)
        self.backend_metrics[metrics.backend_used].append(metrics)
        self.voice_metrics[metrics.voice_used].append(metrics)
        self.language_metrics[metrics.language].append(metrics)

        # Keep collections within size limits
        for collection in [
            self.backend_metrics,
            self.voice_metrics,
            self.language_metrics,
        ]:
            for key, values in collection.items():
                if len(values) > self.max_history_size:
                    collection[key] = values[-self.max_history_size :]

    async def get_quality_trends(
        self, time_window: str = "24h",
    ) -> dict[str, QualityTrend]:
        """Get quality trends for different categories."""
        trends = {}

        # Calculate time threshold
        now = time.time()
        time_thresholds = {
            "1h": 3600,
            "24h": 86400,
            "7d": 604800,
            "30d": 2592000,
        }
        threshold = time_thresholds.get(time_window, 86400)
        cutoff_time = now - threshold

        # Filter recent metrics
        recent_metrics = [m for m in self.quality_history if m.timestamp >= cutoff_time]

        if not recent_metrics:
            return trends

        # Overall trend
        qualities = [m.overall_quality for m in recent_metrics]
        trends["overall"] = QualityTrend(
            time_window=time_window,
            average_quality=sum(qualities) / len(qualities),
            quality_variance=self._calculate_variance(qualities),
            trend_direction=self._calculate_trend_direction(qualities),
            sample_count=len(qualities),
        )

        # Backend trends
        for backend, metrics in self.backend_metrics.items():
            recent_backend_metrics = [m for m in metrics if m.timestamp >= cutoff_time]
            if recent_backend_metrics:
                qualities = [m.overall_quality for m in recent_backend_metrics]
                trends[f"backend_{backend}"] = QualityTrend(
                    time_window=time_window,
                    average_quality=sum(qualities) / len(qualities),
                    quality_variance=self._calculate_variance(qualities),
                    trend_direction=self._calculate_trend_direction(qualities),
                    sample_count=len(qualities),
                )

        return trends

    def _calculate_variance(self, values: list[float]) -> float:
        """Calculate variance of a list of values."""
        if len(values) < 2:
            return 0.0

        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        return variance

    def _calculate_trend_direction(self, values: list[float]) -> str:
        """Calculate trend direction from a list of values."""
        if len(values) < 2:
            return "stable"

        # Simple linear trend calculation
        first_half = values[: len(values) // 2]
        second_half = values[len(values) // 2 :]

        first_avg = sum(first_half) / len(first_half)
        second_avg = sum(second_half) / len(second_half)

        if second_avg > first_avg * 1.05:  # 5% improvement
            return "improving"
        if second_avg < first_avg * 0.95:  # 5% decline
            return "declining"
        return "stable"

    async def get_quality_summary(self) -> dict[str, Any]:
        """Get comprehensive quality summary."""
        if not self.quality_history:
            return {"message": "No quality data available"}

        recent_metrics = list(self.quality_history)[-100:]  # Last 100 samples

        # Calculate averages
        avg_quality = sum(m.overall_quality for m in recent_metrics) / len(
            recent_metrics,
        )
        avg_clarity = sum(m.clarity_score for m in recent_metrics) / len(recent_metrics)
        avg_naturalness = sum(m.naturalness_score for m in recent_metrics) / len(
            recent_metrics,
        )
        avg_intelligibility = sum(
            m.intelligibility_score for m in recent_metrics
        ) / len(recent_metrics)

        # Backend performance
        backend_performance = {}
        for backend, metrics in self.backend_metrics.items():
            if metrics:
                recent_backend_metrics = metrics[-50:]  # Last 50 samples
                backend_performance[backend] = {
                    "average_quality": sum(
                        m.overall_quality for m in recent_backend_metrics
                    )
                    / len(recent_backend_metrics),
                    "sample_count": len(recent_backend_metrics),
                    "last_used": max(m.timestamp for m in recent_backend_metrics),
                }

        return {
            "overall_quality": avg_quality,
            "clarity_score": avg_clarity,
            "naturalness_score": avg_naturalness,
            "intelligibility_score": avg_intelligibility,
            "backend_performance": backend_performance,
            "total_samples": len(self.quality_history),
            "recent_samples": len(recent_metrics),
            "quality_distribution": self._get_quality_distribution(recent_metrics),
        }

    def _get_quality_distribution(
        self, metrics: list[AudioQualityMetrics],
    ) -> dict[str, int]:
        """Get distribution of quality levels."""
        distribution = {"excellent": 0, "good": 0, "acceptable": 0, "poor": 0}

        for metric in metrics:
            quality = metric.overall_quality
            if quality >= self.quality_thresholds["excellent"]:
                distribution["excellent"] += 1
            elif quality >= self.quality_thresholds["good"]:
                distribution["good"] += 1
            elif quality >= self.quality_thresholds["acceptable"]:
                distribution["acceptable"] += 1
            else:
                distribution["poor"] += 1

        return distribution


# Global quality analyzer instance
_quality_analyzer: AudioQualityAnalyzer | None = None


def get_quality_analyzer() -> AudioQualityAnalyzer:
    """Get the global quality analyzer instance."""
    global _quality_analyzer
    if _quality_analyzer is None:
        _quality_analyzer = AudioQualityAnalyzer()
    return _quality_analyzer
