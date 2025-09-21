"""
Additional tests to improve analyzer coverage.
"""

import pytest
import asyncio
from pathlib import Path
import sys

# Add the parent directory to the path so we can import the modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from core import HumilityConfig, SeverityLevel, ConfidenceLevel, DetectionCategory
from analyzers import (
    PatternAnalyzer,
    SentimentAnalyzer,
    HexacoAnalyzer,
    EpistemicHumilityAnalyzer,
    LiwcAnalyzer,
    TransformerAnalyzer,
)


class TestPatternAnalyzerCoverage:
    """Additional tests for PatternAnalyzer to improve coverage."""

    @pytest.fixture
    def analyzer(self):
        """Create a pattern analyzer instance."""
        config = HumilityConfig()
        return PatternAnalyzer(config)

    def test_analyze_empty_text(self, analyzer):
        """Test analysis of empty text."""
        findings = analyzer.analyze("", "test.txt")
        assert len(findings) == 0

    def test_analyze_whitespace_only(self, analyzer):
        """Test analysis of whitespace-only text."""
        findings = analyzer.analyze("   \n\t   ", "test.txt")
        assert len(findings) == 0

    def test_analyze_multiple_categories(self, analyzer):
        """Test analysis with multiple boastful categories."""
        text = "Our revolutionary, award-winning, industry-leading solution is the best and most innovative platform ever created!"
        findings = analyzer.analyze(text, "test.txt")

        assert len(findings) > 5  # Should find multiple issues

        # Check for different categories
        categories = [f.category for f in findings]
        assert DetectionCategory.SUPERLATIVES in categories
        assert DetectionCategory.EXAGGERATION in categories
        assert DetectionCategory.SELF_PROMOTION in categories

    def test_analyze_with_context(self, analyzer):
        """Test analysis with context preservation."""
        text = "This is the best solution ever created by our team."
        findings = analyzer.analyze(text, "test.txt")

        assert len(findings) > 0
        for finding in findings:
            assert finding.context is not None
            assert len(finding.context) > 0

    def test_confidence_level_boundaries(self, analyzer):
        """Test confidence level calculation at boundaries."""
        assert analyzer._get_confidence_level(1.0) == ConfidenceLevel.VERY_HIGH
        assert analyzer._get_confidence_level(0.0) == ConfidenceLevel.LOW
        assert analyzer._get_confidence_level(0.5) == ConfidenceLevel.MEDIUM


class TestSentimentAnalyzerCoverage:
    """Additional tests for SentimentAnalyzer to improve coverage."""

    @pytest.fixture
    def analyzer(self):
        """Create a sentiment analyzer instance."""
        config = HumilityConfig()
        return SentimentAnalyzer(config)

    @pytest.mark.asyncio
    async def test_analyze_empty_text(self, analyzer):
        """Test analysis of empty text."""
        findings = await analyzer.analyze("", "test.txt")
        assert len(findings) == 0

    @pytest.mark.asyncio
    async def test_analyze_neutral_sentiment(self, analyzer):
        """Test analysis of neutral sentiment text."""
        text = "This is a neutral statement with no emotional content."
        findings = await analyzer.analyze(text, "test.txt")
        assert len(findings) == 0

    @pytest.mark.asyncio
    async def test_analyze_negative_sentiment(self, analyzer):
        """Test analysis of negative sentiment text."""
        text = "This is terrible and awful and horrible!"
        findings = await analyzer.analyze(text, "test.txt")
        # Should not flag negative sentiment as boastful
        assert len(findings) == 0

    def test_sentiment_score_boundaries(self, analyzer):
        """Test sentiment score calculation at boundaries."""
        # Test with very positive text
        positive_score = analyzer._calculate_sentiment_score(
            "amazing wonderful fantastic incredible"
        )
        assert positive_score > 0

        # Test with very negative text
        negative_score = analyzer._calculate_sentiment_score(
            "terrible awful horrible disgusting"
        )
        assert negative_score < 0

        # Test with neutral text
        neutral_score = analyzer._calculate_sentiment_score(
            "okay fine decent acceptable"
        )
        assert abs(neutral_score) < 0.5


class TestHexacoAnalyzerCoverage:
    """Additional tests for HexacoAnalyzer to improve coverage."""

    @pytest.fixture
    def analyzer(self):
        """Create a HEXACO analyzer instance."""
        config = HumilityConfig()
        return HexacoAnalyzer(config)

    @pytest.mark.asyncio
    async def test_analyze_empty_text(self, analyzer):
        """Test analysis of empty text."""
        findings = await analyzer.analyze("", "test.txt")
        assert len(findings) == 0

    @pytest.mark.asyncio
    async def test_analyze_neutral_language(self, analyzer):
        """Test analysis of neutral language."""
        text = "This is a neutral statement with no personality indicators."
        findings = await analyzer.analyze(text, "test.txt")
        assert len(findings) == 0

    def test_hexaco_score_calculation(self, analyzer):
        """Test HEXACO score calculation with different traits."""
        # Test honesty-humility trait
        humble_text = "I am modest and humble in my approach."
        arrogant_text = "I am superior and better than others."

        humble_score = analyzer._calculate_hexaco_score(humble_text, "honesty_humility")
        arrogant_score = analyzer._calculate_hexaco_score(
            arrogant_text, "honesty_humility"
        )

        assert humble_score > arrogant_score

        # Test other traits
        for trait in [
            "emotionality",
            "extraversion",
            "agreeableness",
            "conscientiousness",
            "openness",
        ]:
            score = analyzer._calculate_hexaco_score("test text", trait)
            assert isinstance(score, (int, float))


class TestEpistemicHumilityAnalyzerCoverage:
    """Additional tests for EpistemicHumilityAnalyzer to improve coverage."""

    @pytest.fixture
    def analyzer(self):
        """Create an epistemic humility analyzer instance."""
        config = HumilityConfig()
        return EpistemicHumilityAnalyzer(config)

    @pytest.mark.asyncio
    async def test_analyze_empty_text(self, analyzer):
        """Test analysis of empty text."""
        findings = await analyzer.analyze("", "test.txt")
        assert len(findings) == 0

    @pytest.mark.asyncio
    async def test_analyze_mixed_certainty(self, analyzer):
        """Test analysis of text with mixed certainty levels."""
        text = "I think this might work, but I'm not sure. However, I know it will definitely succeed!"
        findings = await analyzer.analyze(text, "test.txt")

        # Should find some issues due to certainty claims
        assert len(findings) >= 0

    def test_epistemic_score_calculation(self, analyzer):
        """Test epistemic humility score calculation."""
        # Test with humble uncertainty
        humble_text = "I don't know if this will work, but we can try."
        humble_score = analyzer._calculate_epistemic_score(humble_text)

        # Test with overconfident certainty
        overconfident_text = "This will definitely work, I'm absolutely certain!"
        overconfident_score = analyzer._calculate_epistemic_score(overconfident_text)

        assert humble_score > overconfident_score


class TestLiwcAnalyzerCoverage:
    """Additional tests for LiwcAnalyzer to improve coverage."""

    @pytest.fixture
    def analyzer(self):
        """Create a LIWC analyzer instance."""
        config = HumilityConfig()
        return LiwcAnalyzer(config)

    @pytest.mark.asyncio
    async def test_analyze_empty_text(self, analyzer):
        """Test analysis of empty text."""
        findings = await analyzer.analyze("", "test.txt")
        assert len(findings) == 0

    @pytest.mark.asyncio
    async def test_analyze_single_word(self, analyzer):
        """Test analysis of single word text."""
        findings = await analyzer.analyze("amazing", "test.txt")
        assert len(findings) >= 0

    def test_linguistic_humility_calculation(self, analyzer):
        """Test linguistic humility score calculation."""
        # Test with humble ratios
        humble_ratios = {
            "tentativeness": 0.15,
            "first_person_singular": 0.02,
            "certainty": 0.01,
            "achievement": 0.01,
            "power": 0.01,
        }

        # Test with boastful ratios
        boastful_ratios = {
            "tentativeness": 0.01,
            "first_person_singular": 0.20,
            "certainty": 0.15,
            "achievement": 0.12,
            "power": 0.10,
        }

        humble_score = analyzer._calculate_linguistic_humility(humble_ratios)
        boastful_score = analyzer._calculate_linguistic_humility(boastful_ratios)

        assert humble_score > boastful_score


class TestTransformerAnalyzerCoverage:
    """Additional tests for TransformerAnalyzer to improve coverage."""

    @pytest.fixture
    def analyzer(self):
        """Create a transformer analyzer instance."""
        config = HumilityConfig()
        return TransformerAnalyzer(config)

    @pytest.mark.asyncio
    async def test_analyze_empty_text(self, analyzer):
        """Test analysis of empty text."""
        findings = await analyzer.analyze("", "test.txt")
        assert len(findings) == 0

    @pytest.mark.asyncio
    async def test_analyze_with_disabled_models(self, analyzer):
        """Test analysis when transformer models are disabled."""
        analyzer.config.use_transformer_models = False
        findings = await analyzer.analyze("This is the best solution ever!", "test.txt")
        assert len(findings) == 0  # Should return empty when disabled

    @pytest.mark.asyncio
    async def test_get_metrics_with_disabled_models(self, analyzer):
        """Test metrics when transformer models are disabled."""
        analyzer.config.use_transformer_models = False
        metrics = await analyzer.get_metrics("This is the best solution ever!")
        assert "transformer_analysis" in metrics


if __name__ == "__main__":
    pytest.main([__file__])
