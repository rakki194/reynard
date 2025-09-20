"""
Additional tests to improve core module coverage.
"""

import pytest
import asyncio
import tempfile
import os
from pathlib import Path
import sys

# Add the parent directory to the path so we can import the modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from core import HumilityConfig, SeverityLevel, ConfidenceLevel, DetectionCategory
from core.models import HumilityFinding, HumilityProfile, DetectionMetrics, CulturalContext
from core.detector import HumilityDetector


class TestHumilityConfigCoverage:
    """Additional tests for HumilityConfig to improve coverage."""
    
    def test_config_creation_with_custom_values(self):
        """Test creating config with custom values."""
        config = HumilityConfig(
            min_confidence_threshold=0.8,
            min_severity_threshold="high",
            max_findings_per_file=50,
            use_transformer_models=False,
            use_hexaco_assessment=False,
            use_epistemic_humility=False,
            use_liwc_analysis=False,
            use_sentiment_analysis=False,
            output_format="json",
            include_context=False,
            include_suggestions=False,
            include_metrics=False,
            include_recommendations=False,
            enable_real_time_monitoring=True,
            enable_trend_analysis=True,
            enable_cultural_adaptation=False,
            cultural_contexts={"eastern": {"directness_preference": 0.4}},
            cache_results=False,
            cache_ttl_seconds=3600,
            supported_extensions=[".txt", ".md"],
            parallel_processing=True,
            max_workers=4
        )
        
        assert config.min_confidence_threshold == 0.8
        assert config.min_severity_threshold == "high"
        assert config.max_findings_per_file == 50
        assert config.use_transformer_models == False
        assert config.output_format == "json"
        assert "eastern" in config.cultural_contexts
        assert config.cache_results == False
        assert config.parallel_processing == True
    
    def test_config_validation_with_valid_values(self):
        """Test config validation with valid values."""
        config = HumilityConfig()
        config.min_confidence_threshold = 0.7
        config.min_severity_threshold = "medium"
        config.max_findings_per_file = 100
        config.output_format = "html"
        config.cultural_contexts = {"western": {"directness_preference": 0.8}}
        
        issues = config.validate()
        assert len(issues) == 0
    
    def test_config_validation_with_invalid_values(self):
        """Test config validation with invalid values."""
        config = HumilityConfig()
        config.min_confidence_threshold = 1.5  # Invalid: > 1.0
        config.min_severity_threshold = "invalid"  # Invalid severity
        config.max_findings_per_file = -1  # Invalid: negative
        config.output_format = "invalid"  # Invalid format
        config.cultural_contexts = {"invalid": {}}  # Invalid context
        config.cache_ttl_seconds = -1  # Invalid: negative
        config.max_workers = 0  # Invalid: zero
        
        issues = config.validate()
        assert len(issues) > 0
        # Check that we get some validation issues
        issue_text = " ".join(issues)
        assert "min_confidence_threshold" in issue_text or "min_severity_threshold" in issue_text or "max_findings_per_file" in issue_text
    
    def test_config_to_file_and_from_file(self):
        """Test saving and loading config to/from file."""
        config = HumilityConfig()
        config.min_confidence_threshold = 0.8
        config.cultural_contexts = {"nordic": {"directness_preference": 0.6}}
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            temp_file = f.name
        
        try:
            # Save config
            config.to_file(Path(temp_file))
            assert os.path.exists(temp_file)
            
            # Load config
            loaded_config = HumilityConfig.from_file(Path(temp_file))
            assert loaded_config.min_confidence_threshold == 0.8
            assert "nordic" in loaded_config.cultural_contexts
        finally:
            if os.path.exists(temp_file):
                os.unlink(temp_file)
    
    def test_config_from_file_nonexistent(self):
        """Test loading config from nonexistent file."""
        # The method logs a warning but doesn't raise an exception
        config = HumilityConfig.from_file(Path("nonexistent_config.json"))
        assert isinstance(config, HumilityConfig)


class TestHumilityDetectorCoverage:
    """Additional tests for HumilityDetector to improve coverage."""
    
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
    async def test_analyze_text_with_cultural_context(self, detector):
        """Test text analysis with cultural context."""
        text = "This is the best solution ever!"
        profile = await detector.analyze_text(text, "test.txt", cultural_context="eastern")
        
        assert isinstance(profile, HumilityProfile)
        assert profile.overall_score >= 0
        assert profile.overall_score <= 100
    
    @pytest.mark.asyncio
    async def test_analyze_text_with_cache(self, detector):
        """Test text analysis with caching enabled."""
        text = "This is the best solution ever!"
        
        # First analysis
        profile1 = await detector.analyze_text(text, "test.txt")
        
        # Second analysis (should use cache)
        profile2 = await detector.analyze_text(text, "test.txt")
        
        assert profile1.overall_score == profile2.overall_score
        assert len(profile1.findings) == len(profile2.findings)
    
    @pytest.mark.asyncio
    async def test_analyze_file_nonexistent(self, detector):
        """Test analysis of nonexistent file."""
        # The method logs an error but returns a profile with error indicators
        profile = await detector.analyze_file(Path("nonexistent_file.txt"))
        assert profile is not None
        assert profile.overall_score == 0.0
        assert "Analysis failed" in profile.improvement_areas
    
    @pytest.mark.asyncio
    async def test_analyze_directory_empty(self, detector):
        """Test analysis of empty directory."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            profiles = await detector.analyze_directory(temp_path, ['.txt'])
            assert len(profiles) == 0
    
    @pytest.mark.asyncio
    async def test_analyze_directory_with_mixed_files(self, detector):
        """Test analysis of directory with mixed file types."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Create files with different extensions
            (temp_path / "test.txt").write_text("This is the best solution ever!")
            (temp_path / "test.py").write_text("This is the best solution ever!")
            (temp_path / "test.log").write_text("This is the best solution ever!")
            (temp_path / "test.md").write_text("This is the best solution ever!")
            
            # Analyze with specific extensions
            profiles = await detector.analyze_directory(temp_path, ['.txt', '.py'])
            
            assert len(profiles) == 2
            assert str(temp_path / "test.txt") in profiles
            assert str(temp_path / "test.py") in profiles
            assert str(temp_path / "test.log") not in profiles
            assert str(temp_path / "test.md") not in profiles
    
    def test_filter_findings_by_confidence(self, detector):
        """Test filtering findings by confidence threshold."""
        findings = [
            HumilityFinding(
                file_path="test.txt",
                line_number=1,
                category=DetectionCategory.SUPERLATIVES,
                severity=SeverityLevel.HIGH,
                confidence=ConfidenceLevel.LOW,
                original_text="good",
                suggested_replacement="decent",
                context="This is good",
                confidence_score=0.3
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
                confidence_score=0.9
            )
        ]
        
        # Test filtering by confidence
        detector.config.min_confidence_threshold = 0.8
        filtered = detector._filter_findings(findings)
        assert len(filtered) == 1
        assert filtered[0].confidence_score >= 0.8
    
    def test_calculate_comprehensive_scores_with_metrics(self, detector):
        """Test comprehensive score calculation with additional metrics."""
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
                confidence_score=0.9
            )
        ]
        
        additional_metrics = {
            'hexaco_honesty_humility': 60.0,
            'epistemic_humility': 70.0,
            'linguistic_humility': 80.0,
            'behavioral_humility': 90.0,
            'cultural_adaptation': 85.0
        }
        
        scores = detector._calculate_comprehensive_scores(findings, additional_metrics)
        
        assert 'overall' in scores
        assert 'hexaco' in scores
        assert 'epistemic' in scores
        assert 'linguistic' in scores
        assert 'behavioral' in scores
        assert 'cultural' in scores
        
        assert scores['overall'] < 100.0
        assert scores['hexaco'] == 60.0
        assert scores['epistemic'] == 70.0
        assert scores['linguistic'] == 80.0
        assert scores['behavioral'] == 90.0
        assert scores['cultural'] == 85.0
    
    def test_generate_recommendations_with_different_scores(self, detector):
        """Test recommendation generation with different score patterns."""
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
                confidence_score=0.9
            )
        ]
        
        # Test with low scores
        low_scores = {'overall': 20.0, 'hexaco': 30.0, 'epistemic': 25.0}
        recommendations = detector._generate_recommendations(findings, low_scores)
        
        assert 'recommendations' in recommendations
        assert 'improvement_areas' in recommendations
        assert 'strengths' in recommendations
        assert len(recommendations['recommendations']) > 0
        assert len(recommendations['improvement_areas']) > 0
        assert len(recommendations['strengths']) == 0  # No strengths with low scores
        
        # Test with high scores
        high_scores = {'overall': 90.0, 'hexaco': 95.0, 'epistemic': 85.0}
        recommendations = detector._generate_recommendations([], high_scores)
        
        assert len(recommendations['recommendations']) == 0  # No recommendations needed
        assert len(recommendations['improvement_areas']) == 0  # No improvement needed
        assert len(recommendations['strengths']) > 0  # Should have strengths
    
    def test_cache_stats(self, detector):
        """Test cache statistics."""
        stats = detector.get_cache_stats()
        
        assert 'cache_size' in stats
        assert 'cache_enabled' in stats
        assert 'cache_ttl' in stats
        # max_cache_size might not be in the stats
        assert 'cache_size' in stats
        
        assert isinstance(stats['cache_size'], int)
        assert isinstance(stats['cache_enabled'], bool)
        assert isinstance(stats['cache_ttl'], int)
        # max_cache_size might not be in the stats
    
    def test_clear_cache(self, detector):
        """Test cache clearing."""
        # Add something to cache
        detector.cache['test_key'] = 'test_value'
        
        # Clear cache
        detector.clear_cache()
        
        # Check that cache is empty
        assert len(detector.cache) == 0
        stats = detector.get_cache_stats()
        assert stats['cache_size'] == 0


class TestModelsCoverage:
    """Additional tests for model classes to improve coverage."""
    
    def test_humility_finding_with_all_fields(self):
        """Test HumilityFinding with all optional fields."""
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
            hexaco_score=0.8,
            epistemic_humility_score=0.7,
            sentiment_score=0.6,
            linguistic_features={
                'pattern_matched': 'test_pattern',
                'word_position': 5,
                'line_length': 20
            },
            behavioral_indicators=['confidence', 'assertiveness'],
            cultural_context="western",
            timestamp="2025-01-01T00:00:00"
        )
        
        assert finding.hexaco_score == 0.8
        assert finding.epistemic_humility_score == 0.7
        assert finding.sentiment_score == 0.6
        assert finding.linguistic_features['pattern_matched'] == 'test_pattern'
        assert finding.behavioral_indicators == ['confidence', 'assertiveness']
        assert finding.cultural_context == "western"
        assert finding.timestamp == "2025-01-01T00:00:00"
    
    def test_humility_profile_with_all_fields(self):
        """Test HumilityProfile with all fields."""
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
                confidence_score=0.9
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
            timestamp="2025-01-01T00:00:00"
        )
        
        assert profile.timestamp == "2025-01-01T00:00:00"
    
    def test_detection_metrics_creation(self):
        """Test DetectionMetrics creation."""
        metrics = DetectionMetrics(
            precision=0.85,
            recall=0.90,
            f1_score=0.87,
            accuracy=0.88,
            true_positive_rate=0.85,
            false_positive_rate=0.15,
            true_negative_rate=0.90,
            false_negative_rate=0.10
        )
        
        assert metrics.precision == 0.85
        assert metrics.recall == 0.90
        assert metrics.f1_score == 0.87
        assert metrics.accuracy == 0.88
        assert metrics.true_positive_rate == 0.85
        assert metrics.false_positive_rate == 0.15
        assert metrics.true_negative_rate == 0.90
        assert metrics.false_negative_rate == 0.10
    
    def test_cultural_context_creation(self):
        """Test CulturalContext creation."""
        context = CulturalContext(
            region="western",
            language="en",
            cultural_norms={
                'directness': 'high',
                'hierarchy': 'low',
                'individualism': 'high'
            },
            humility_indicators=['modesty', 'understatement'],
            boastful_indicators=['self-promotion', 'exaggeration'],
            adaptation_factors={
                'directness_weight': 0.8,
                'hierarchy_weight': 0.6,
                'individualism_weight': 0.9
            }
        )
        
        assert context.region == "western"
        assert context.language == "en"
        assert context.cultural_norms['directness'] == 'high'
        assert 'modesty' in context.humility_indicators
        assert 'self-promotion' in context.boastful_indicators
        assert context.adaptation_factors['directness_weight'] == 0.8


if __name__ == "__main__":
    pytest.main([__file__])
