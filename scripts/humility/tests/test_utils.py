"""
Tests for utility modules.
"""

import pytest
from pathlib import Path
import sys

# Add the parent directory to the path so we can import the modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from core import HumilityConfig
from utils import TextProcessor, CulturalAdapter, MetricsCalculator, ReportGenerator
from core.models import (
    HumilityFinding,
    HumilityProfile,
    DetectionCategory,
    SeverityLevel,
    ConfidenceLevel,
)


class TestTextProcessor:
    """Test the text processor utility."""

    @pytest.fixture
    def processor(self):
        """Create a text processor instance."""
        config = HumilityConfig()
        return TextProcessor(config)

    def test_preprocess_basic(self, processor):
        """Test basic text preprocessing."""
        text = "This is a test with   multiple   spaces."
        processed = processor.preprocess(text)

        assert "  " not in processed  # Multiple spaces should be normalized
        assert processed.strip() == processed  # Should be trimmed

    def test_expand_contractions(self, processor):
        """Test contraction expansion."""
        text = "I don't think we'll succeed."
        processed = processor.preprocess(text)

        assert "do not" in processed
        assert "we will" in processed  # "we'll" expands to "we will"

    def test_normalize_punctuation(self, processor):
        """Test punctuation normalization."""
        text = "This is amazing!!! Really??? Yes..."
        processed = processor.preprocess(text)

        assert "!!!" not in processed
        assert "???" not in processed
        assert "..." not in processed
        # The normalization should keep single punctuation marks
        assert "!" in processed or "?" in processed or "." in processed

    def test_normalize_case(self, processor):
        """Test case normalization."""
        text = "this is a test. another sentence here."
        processed = processor.preprocess(text)

        assert processed[0].isupper()  # First letter should be capitalized
        assert "This is a test." in processed
        assert "Another sentence here." in processed

    def test_extract_sentences(self, processor):
        """Test sentence extraction."""
        text = "This is sentence one. This is sentence two! This is sentence three?"
        sentences = processor.extract_sentences(text)

        assert len(sentences) == 3
        assert "This is sentence one" in sentences[0]
        assert "This is sentence two" in sentences[1]
        assert "This is sentence three" in sentences[2]

    def test_extract_words(self, processor):
        """Test word extraction."""
        text = "This is a test with some words."
        words = processor.extract_words(text)

        # Check that we get some words back
        assert len(words) > 0
        assert "test" in words
        assert "words" in words
        # Stop words should be filtered out
        assert "a" not in words
        assert "is" not in words

    def test_extract_phrases(self, processor):
        """Test phrase extraction."""
        text = "This is a test sentence."
        phrases = processor.extract_phrases(text, min_length=2, max_length=3)

        assert len(phrases) > 0
        # Check that we get some phrases back
        assert any("test" in phrase for phrase in phrases)

    def test_calculate_readability_metrics(self, processor):
        """Test readability metrics calculation."""
        text = "This is a simple test sentence. It has multiple sentences for testing."
        metrics = processor.calculate_readability_metrics(text)

        assert "avg_sentence_length" in metrics
        assert "avg_word_length" in metrics
        assert "sentence_count" in metrics
        assert "word_count" in metrics
        assert "flesch_reading_ease" in metrics

        assert metrics["sentence_count"] == 2
        assert metrics["word_count"] > 0
        assert metrics["avg_sentence_length"] > 0
        assert metrics["avg_word_length"] > 0

    def test_extract_linguistic_features(self, processor):
        """Test linguistic feature extraction."""
        text = "This is a test with some words and punctuation!"
        features = processor.extract_linguistic_features(text)

        assert "word_count" in features
        assert "sentence_count" in features
        assert "vocabulary_richness" in features
        assert "most_common_words" in features
        assert "readability_metrics" in features
        assert "punctuation_ratio" in features
        assert "capitalization_ratio" in features

        assert features["word_count"] > 0
        assert features["sentence_count"] > 0
        assert 0 <= features["vocabulary_richness"] <= 1
        assert 0 <= features["punctuation_ratio"] <= 1
        assert 0 <= features["capitalization_ratio"] <= 1

    def test_detect_language_patterns(self, processor):
        """Test language pattern detection."""
        text = "This is AMAZING!!! Really??? Yes... It's incredible!"
        patterns = processor.detect_language_patterns(text)

        assert "exclamation_marks" in patterns
        assert "question_marks" in patterns
        assert "capital_words" in patterns
        assert "quoted_text" in patterns

        assert patterns["exclamation_marks"] > 0
        assert patterns["question_marks"] > 0
        assert patterns["capital_words"] > 0


class TestCulturalAdapter:
    """Test the cultural adapter utility."""

    @pytest.fixture
    def adapter(self):
        """Create a cultural adapter instance."""
        config = HumilityConfig()
        return CulturalAdapter(config)

    def test_adapt_findings_western(self, adapter):
        """Test cultural adaptation for Western context."""
        findings = [
            HumilityFinding(
                file_path="test.txt",
                line_number=1,
                category=DetectionCategory.SUPERLATIVES,
                severity=SeverityLevel.LOW,
                confidence=ConfidenceLevel.MEDIUM,
                original_text="best",
                suggested_replacement="good",
                context="This is the best",
                confidence_score=0.5,
            )
        ]

        adapted = adapter.adapt_findings(findings, "western")

        assert len(adapted) == 1
        assert adapted[0].cultural_context == "western"
        # Western culture should be more tolerant of direct language

    def test_adapt_findings_eastern(self, adapter):
        """Test cultural adaptation for Eastern context."""
        findings = [
            HumilityFinding(
                file_path="test.txt",
                line_number=1,
                category=DetectionCategory.SUPERLATIVES,
                severity=SeverityLevel.LOW,
                confidence=ConfidenceLevel.MEDIUM,
                original_text="best",
                suggested_replacement="good",
                context="This is the best",
                confidence_score=0.5,
            )
        ]

        adapted = adapter.adapt_findings(findings, "eastern")

        assert len(adapted) == 1
        assert adapted[0].cultural_context == "eastern"
        # Eastern culture should be less tolerant of boastful language

    def test_adapt_findings_nordic(self, adapter):
        """Test cultural adaptation for Nordic context."""
        findings = [
            HumilityFinding(
                file_path="test.txt",
                line_number=1,
                category=DetectionCategory.SUPERLATIVES,
                severity=SeverityLevel.LOW,
                confidence=ConfidenceLevel.MEDIUM,
                original_text="best",
                suggested_replacement="good",
                context="This is the best",
                confidence_score=0.5,
            )
        ]

        adapted = adapter.adapt_findings(findings, "nordic")

        assert len(adapted) == 1
        assert adapted[0].cultural_context == "nordic"
        # Nordic culture should emphasize egalitarian values

    def test_adapt_findings_unknown_context(self, adapter):
        """Test cultural adaptation with unknown context."""
        findings = [
            HumilityFinding(
                file_path="test.txt",
                line_number=1,
                category=DetectionCategory.SUPERLATIVES,
                severity=SeverityLevel.LOW,
                confidence=ConfidenceLevel.MEDIUM,
                original_text="best",
                suggested_replacement="good",
                context="This is the best",
                confidence_score=0.5,
            )
        ]

        adapted = adapter.adapt_findings(findings, "unknown")

        # Should return original findings unchanged
        assert len(adapted) == 1
        assert adapted[0].cultural_context is None


class TestMetricsCalculator:
    """Test the metrics calculator utility."""

    @pytest.fixture
    def calculator(self):
        """Create a metrics calculator instance."""
        config = HumilityConfig()
        return MetricsCalculator(config)

    def test_calculate_humility_score_no_findings(self, calculator):
        """Test humility score calculation with no findings."""
        score = calculator.calculate_humility_score([])
        assert score == 100.0

    def test_calculate_humility_score_with_findings(self, calculator):
        """Test humility score calculation with findings."""
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
            )
        ]

        score = calculator.calculate_humility_score(findings)

        assert 0 <= score <= 100
        assert score < 100  # Should be less than perfect due to findings

    def test_calculate_detection_metrics(self, calculator):
        """Test detection metrics calculation."""
        true_findings = []
        predicted_findings = []

        metrics = calculator.calculate_detection_metrics(
            true_findings, predicted_findings
        )

        assert hasattr(metrics, "precision")
        assert hasattr(metrics, "recall")
        assert hasattr(metrics, "f1_score")
        assert hasattr(metrics, "accuracy")


class TestReportGenerator:
    """Test the report generator utility."""

    @pytest.fixture
    def generator(self):
        """Create a report generator instance."""
        config = HumilityConfig()
        return ReportGenerator(config)

    @pytest.fixture
    def sample_profiles(self):
        """Create sample profiles for testing."""
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
            )
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

        return {"test.txt": profile}

    def test_generate_text_report(self, generator, sample_profiles):
        """Test text report generation."""
        report = generator._generate_text_report(sample_profiles)

        assert isinstance(report, str)
        assert "Humility Detector Report" in report
        assert "Files analyzed: 1" in report
        assert "Total findings: 1" in report
        assert "test.txt" in report
        assert "best" in report
        assert "good" in report

    def test_generate_json_report(self, generator, sample_profiles):
        """Test JSON report generation."""
        report = generator._generate_json_report(sample_profiles)

        assert isinstance(report, str)
        # Should be valid JSON
        import json

        report_data = json.loads(report)

        assert "summary" in report_data
        assert "profiles" in report_data
        assert report_data["summary"]["total_files"] == 1
        assert report_data["summary"]["total_findings"] == 1
        assert "test.txt" in report_data["profiles"]

    def test_generate_html_report(self, generator, sample_profiles):
        """Test HTML report generation."""
        report = generator._generate_html_report(sample_profiles)

        assert isinstance(report, str)
        assert "<!DOCTYPE html>" in report
        assert "<html>" in report
        assert "<head>" in report
        assert "<body>" in report
        assert "Humility Detector Report" in report
        assert "test.txt" in report

    def test_generate_csv_report(self, generator, sample_profiles):
        """Test CSV report generation."""
        report = generator._generate_csv_report(sample_profiles)

        assert isinstance(report, str)
        lines = report.split("\n")
        assert len(lines) >= 2  # Header + at least one data row
        assert (
            "file_path,line_number,category,severity,original_text,suggested_replacement,overall_score"
            in lines[0]
        )
        assert "test.txt" in lines[1]
        assert "best" in lines[1]
        assert "good" in lines[1]

    def test_generate_report_default_format(self, generator, sample_profiles):
        """Test report generation with default format."""
        report = generator.generate_report(sample_profiles)

        assert isinstance(report, str)
        assert "Humility Detector Report" in report  # Should be text format by default

    def test_generate_report_json_format(self, generator, sample_profiles):
        """Test report generation with JSON format."""
        generator.config.output_format = "json"
        report = generator.generate_report(sample_profiles)

        assert isinstance(report, str)
        import json

        report_data = json.loads(report)
        assert "summary" in report_data

    def test_generate_report_html_format(self, generator, sample_profiles):
        """Test report generation with HTML format."""
        generator.config.output_format = "html"
        report = generator.generate_report(sample_profiles)

        assert isinstance(report, str)
        assert "<!DOCTYPE html>" in report

    def test_generate_report_csv_format(self, generator, sample_profiles):
        """Test report generation with CSV format."""
        generator.config.output_format = "csv"
        report = generator.generate_report(sample_profiles)

        assert isinstance(report, str)
        assert "file_path,line_number" in report


if __name__ == "__main__":
    pytest.main([__file__])
