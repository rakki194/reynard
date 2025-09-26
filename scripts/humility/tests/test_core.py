"""Tests for core humility detector functionality."""

import os

# Add the parent directory to the path so we can import the modules
import sys
import tempfile
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from core import (
    ConfidenceLevel,
    DetectionCategory,
    HumilityConfig,
    HumilityDetector,
    SeverityLevel,
)
from core.models import HumilityFinding, HumilityProfile


class TestHumilityConfig:
    """Test configuration management."""

    def test_default_config(self):
        """Test default configuration values."""
        config = HumilityConfig()

        assert config.min_confidence_threshold == 0.6
        assert config.min_severity_threshold == "medium"
        assert config.max_findings_per_file == 100
        assert config.use_transformer_models == True
        assert config.use_hexaco_assessment == True
        assert config.use_epistemic_humility == True
        assert config.use_liwc_analysis == True
        assert config.use_sentiment_analysis == True

    def test_config_validation(self):
        """Test configuration validation."""
        config = HumilityConfig()
        issues = config.validate()

        # Should have no issues with default config
        assert len(issues) == 0

    def test_config_validation_errors(self):
        """Test configuration validation with invalid values."""
        config = HumilityConfig()
        config.min_confidence_threshold = 1.5  # Invalid: > 1.0
        config.min_severity_threshold = "invalid"  # Invalid severity
        config.max_findings_per_file = -1  # Invalid: negative

        issues = config.validate()
        assert len(issues) > 0
        assert any("min_confidence_threshold" in issue for issue in issues)
        assert any("min_severity_threshold" in issue for issue in issues)
        assert any("max_findings_per_file" in issue for issue in issues)


class TestHumilityDetector:
    """Test the main humility detector."""

    @pytest.fixture
    def detector(self):
        """Create a detector instance for testing."""
        config = HumilityConfig()
        # Disable advanced features for faster testing
        config.use_transformer_models = False
        config.use_hexaco_assessment = False
        config.use_epistemic_humility = False
        config.use_liwc_analysis = False
        config.use_sentiment_analysis = False
        return HumilityDetector(config)

    @pytest.mark.asyncio
    async def test_analyze_text_basic(self, detector):
        """Test basic text analysis."""
        text = "This is the best solution ever!"
        profile = await detector.analyze_text(text, "test.txt")

        assert isinstance(profile, HumilityProfile)
        assert profile.overall_score >= 0
        assert profile.overall_score <= 100
        assert len(profile.findings) > 0  # Should find "best"

        # Check that we found the boastful word
        boastful_words = [f.original_text.lower() for f in profile.findings]
        assert "best" in boastful_words

    @pytest.mark.asyncio
    async def test_analyze_text_humble(self, detector):
        """Test analysis of humble text."""
        text = "This approach aims to provide a useful solution for common problems."
        profile = await detector.analyze_text(text, "test.txt")

        assert isinstance(profile, HumilityProfile)
        assert profile.overall_score >= 0
        assert profile.overall_score <= 100
        # Should have fewer findings for humble text
        assert len(profile.findings) == 0 or all(
            f.severity == SeverityLevel.LOW for f in profile.findings
        )

    @pytest.mark.asyncio
    async def test_analyze_text_multiple_issues(self, detector):
        """Test analysis of text with multiple boastful elements."""
        text = "Our revolutionary, industry-leading, award-winning solution is the best and most innovative platform ever created!"
        profile = await detector.analyze_text(text, "test.txt")

        assert isinstance(profile, HumilityProfile)
        assert len(profile.findings) > 5  # Should find multiple issues

        # Check for specific boastful words
        boastful_words = [f.original_text.lower() for f in profile.findings]
        expected_words = [
            "revolutionary",
            "industry-leading",
            "award-winning",
            "best",
            "most",
            "innovative",
        ]
        found_words = [word for word in expected_words if word in boastful_words]
        assert len(found_words) >= 3  # Should find at least 3 of the expected words

    @pytest.mark.asyncio
    async def test_analyze_file(self, detector):
        """Test file analysis."""
        # Create a temporary file with boastful content
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is the most amazing and incredible solution ever!")
            temp_file = f.name

        try:
            profile = await detector.analyze_file(Path(temp_file))

            assert isinstance(profile, HumilityProfile)
            assert len(profile.findings) > 0

            # Check that findings reference the correct file
            for finding in profile.findings:
                assert finding.file_path == temp_file
        finally:
            os.unlink(temp_file)

    @pytest.mark.asyncio
    async def test_analyze_directory(self, detector):
        """Test directory analysis."""
        # Create a temporary directory with test files
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create test files
            (temp_path / "humble.txt").write_text("This is a modest approach.")
            (temp_path / "boastful.txt").write_text("This is the best solution ever!")

            profiles = await detector.analyze_directory(temp_path, [".txt"])

            assert len(profiles) == 2
            assert "humble.txt" in str(profiles.keys())
            assert "boastful.txt" in str(profiles.keys())

            # Check that boastful file has more findings
            humble_profile = profiles[str(temp_path / "humble.txt")]
            boastful_profile = profiles[str(temp_path / "boastful.txt")]

            assert len(boastful_profile.findings) > len(humble_profile.findings)

    def test_filter_findings(self, detector):
        """Test findings filtering."""
        # Create test findings with different severities
        findings = [
            HumilityFinding(
                file_path="test.txt",
                line_number=1,
                category=DetectionCategory.SUPERLATIVES,
                severity=SeverityLevel.LOW,
                confidence=ConfidenceLevel.MEDIUM,
                original_text="good",
                suggested_replacement="decent",
                context="This is good",
                confidence_score=0.5,
            ),
            HumilityFinding(
                file_path="test.txt",
                line_number=2,
                category=DetectionCategory.SUPERLATIVES,
                severity=SeverityLevel.HIGH,
                confidence=ConfidenceLevel.HIGH,
                original_text="best",
                suggested_replacement="good",
                context="This is the best",
                confidence_score=0.9,
            ),
        ]

        # Test filtering by severity
        detector.config.min_severity_threshold = "high"
        filtered = detector._filter_findings(findings)
        assert len(filtered) == 1
        assert filtered[0].severity == SeverityLevel.HIGH

        # Test filtering by confidence
        detector.config.min_confidence_threshold = 0.8
        filtered = detector._filter_findings(findings)
        assert len(filtered) == 1
        assert filtered[0].confidence_score >= 0.8

    def test_calculate_comprehensive_scores(self, detector):
        """Test comprehensive score calculation."""
        # Test with no findings
        scores = detector._calculate_comprehensive_scores([], {})
        assert scores["overall"] == 100.0

        # Test with findings
        findings = [
            HumilityFinding(
                file_path="test.txt",
                line_number=1,
                category=DetectionCategory.SUPERLATIVES,
                severity=SeverityLevel.HIGH,
                confidence=ConfidenceLevel.HIGH,
                original_text="best",
                suggested_replacement="good",
                context="This is the best",
                confidence_score=0.9,
            ),
        ]

        scores = detector._calculate_comprehensive_scores(findings, {})
        assert scores["overall"] < 100.0
        assert scores["overall"] >= 0.0

    def test_generate_recommendations(self, detector):
        """Test recommendation generation."""
        findings = [
            HumilityFinding(
                file_path="test.txt",
                line_number=1,
                category=DetectionCategory.SUPERLATIVES,
                severity=SeverityLevel.HIGH,
                confidence=ConfidenceLevel.HIGH,
                original_text="best",
                suggested_replacement="good",
                context="This is the best",
                confidence_score=0.9,
            ),
        ]

        scores = {"overall": 60.0, "hexaco": 50.0, "epistemic": 40.0}
        recommendations = detector._generate_recommendations(findings, scores)

        assert "recommendations" in recommendations
        assert "improvement_areas" in recommendations
        assert "strengths" in recommendations
        assert len(recommendations["recommendations"]) > 0
        assert len(recommendations["improvement_areas"]) > 0

    def test_cache_functionality(self, detector):
        """Test cache functionality."""
        # Test cache stats
        stats = detector.get_cache_stats()
        assert "cache_size" in stats
        assert "cache_enabled" in stats
        assert "cache_ttl" in stats

        # Test cache clearing
        detector.clear_cache()
        stats = detector.get_cache_stats()
        assert stats["cache_size"] == 0


class TestHumilityFinding:
    """Test the HumilityFinding model."""

    def test_humility_finding_creation(self):
        """Test creating a HumilityFinding instance."""
        finding = HumilityFinding(
            file_path="test.txt",
            line_number=1,
            category=DetectionCategory.SUPERLATIVES,
            severity=SeverityLevel.HIGH,
            confidence=ConfidenceLevel.HIGH,
            original_text="best",
            suggested_replacement="good",
            context="This is the best",
            confidence_score=0.9,
        )

        assert finding.file_path == "test.txt"
        assert finding.line_number == 1
        assert finding.category == DetectionCategory.SUPERLATIVES
        assert finding.severity == SeverityLevel.HIGH
        assert finding.confidence == ConfidenceLevel.HIGH
        assert finding.original_text == "best"
        assert finding.suggested_replacement == "good"
        assert finding.context == "This is the best"
        assert finding.confidence_score == 0.9

    def test_humility_finding_to_dict(self):
        """Test converting HumilityFinding to dictionary."""
        finding = HumilityFinding(
            file_path="test.txt",
            line_number=1,
            category=DetectionCategory.SUPERLATIVES,
            severity=SeverityLevel.HIGH,
            confidence=ConfidenceLevel.HIGH,
            original_text="best",
            suggested_replacement="good",
            context="This is the best",
            confidence_score=0.9,
        )

        finding_dict = finding.to_dict()

        assert isinstance(finding_dict, dict)
        assert finding_dict["file_path"] == "test.txt"
        assert finding_dict["line_number"] == 1
        assert finding_dict["category"] == "superlatives"
        assert finding_dict["severity"] == "high"
        assert finding_dict["confidence"] == "high"
        assert finding_dict["original_text"] == "best"
        assert finding_dict["suggested_replacement"] == "good"
        assert finding_dict["context"] == "This is the best"
        assert finding_dict["confidence_score"] == 0.9


class TestHumilityProfile:
    """Test the HumilityProfile model."""

    def test_humility_profile_creation(self):
        """Test creating a HumilityProfile instance."""
        findings = [
            HumilityFinding(
                file_path="test.txt",
                line_number=1,
                category=DetectionCategory.SUPERLATIVES,
                severity=SeverityLevel.HIGH,
                confidence=ConfidenceLevel.HIGH,
                original_text="best",
                suggested_replacement="good",
                context="This is the best",
                confidence_score=0.9,
            ),
        ]

        profile = HumilityProfile(
            overall_score=75.0,
            hexaco_honesty_humility=80.0,
            epistemic_humility=70.0,
            linguistic_humility=65.0,
            behavioral_humility=85.0,
            cultural_adaptation=90.0,
            findings=findings,
            recommendations=["Be more modest"],
            improvement_areas=["Reduce superlatives"],
            strengths=["Good collaboration"],
        )

        assert profile.overall_score == 75.0
        assert profile.hexaco_honesty_humility == 80.0
        assert profile.epistemic_humility == 70.0
        assert profile.linguistic_humility == 65.0
        assert profile.behavioral_humility == 85.0
        assert profile.cultural_adaptation == 90.0
        assert len(profile.findings) == 1
        assert len(profile.recommendations) == 1
        assert len(profile.improvement_areas) == 1
        assert len(profile.strengths) == 1

    def test_humility_profile_to_dict(self):
        """Test converting HumilityProfile to dictionary."""
        profile = HumilityProfile(
            overall_score=75.0,
            hexaco_honesty_humility=80.0,
            epistemic_humility=70.0,
            linguistic_humility=65.0,
            behavioral_humility=85.0,
            cultural_adaptation=90.0,
            findings=[],
            recommendations=["Be more modest"],
            improvement_areas=["Reduce superlatives"],
            strengths=["Good collaboration"],
        )

        profile_dict = profile.to_dict()

        assert isinstance(profile_dict, dict)
        assert profile_dict["overall_score"] == 75.0
        assert profile_dict["hexaco_honesty_humility"] == 80.0
        assert profile_dict["epistemic_humility"] == 70.0
        assert profile_dict["linguistic_humility"] == 65.0
        assert profile_dict["behavioral_humility"] == 85.0
        assert profile_dict["cultural_adaptation"] == 90.0
        assert len(profile_dict["findings"]) == 0
        assert len(profile_dict["recommendations"]) == 1
        assert len(profile_dict["improvement_areas"]) == 1
        assert len(profile_dict["strengths"]) == 1


if __name__ == "__main__":
    pytest.main([__file__])
