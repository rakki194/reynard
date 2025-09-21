#!/usr/bin/env python3
"""
Test suite for data structures.

Tests the custom data structures used throughout the PHOENIX Control system.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import sys
from pathlib import Path

import pytest

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from phoenix_control.src.utils.data_structures import (
    AgentState,
    NamingStyle,
    PerformanceMetrics,
    QualityConfig,
    ReleaseConfig,
    SpiritType,
    StatisticalSignificance,
)


class TestSpiritType:
    """Test cases for SpiritType enum."""

    def test_spirit_type_values(self):
        """Test spirit type enum values."""
        assert SpiritType.FOX.value == "fox"
        assert SpiritType.WOLF.value == "wolf"
        assert SpiritType.OTTER.value == "otter"
        assert SpiritType.EAGLE.value == "eagle"
        assert SpiritType.LION.value == "lion"
        assert SpiritType.TIGER.value == "tiger"
        assert SpiritType.DRAGON.value == "dragon"
        assert SpiritType.PHOENIX.value == "phoenix"
        assert SpiritType.ALIEN.value == "alien"
        assert SpiritType.YETI.value == "yeti"

    def test_spirit_type_from_string(self):
        """Test creating spirit type from string."""
        assert SpiritType.from_string("fox") == SpiritType.FOX
        assert SpiritType.from_string("wolf") == SpiritType.WOLF
        assert SpiritType.from_string("otter") == SpiritType.OTTER
        assert SpiritType.from_string("eagle") == SpiritType.EAGLE
        assert SpiritType.from_string("lion") == SpiritType.LION
        assert SpiritType.from_string("tiger") == SpiritType.TIGER
        assert SpiritType.from_string("dragon") == SpiritType.DRAGON
        assert SpiritType.from_string("phoenix") == SpiritType.PHOENIX
        assert SpiritType.from_string("alien") == SpiritType.ALIEN
        assert SpiritType.from_string("yeti") == SpiritType.YETI

    def test_spirit_type_invalid_string(self):
        """Test creating spirit type from invalid string."""
        with pytest.raises(ValueError):
            SpiritType.from_string("invalid")

    def test_spirit_type_all_values(self):
        """Test all spirit type values are accessible."""
        all_spirits = [
            SpiritType.FOX,
            SpiritType.WOLF,
            SpiritType.OTTER,
            SpiritType.EAGLE,
            SpiritType.LION,
            SpiritType.TIGER,
            SpiritType.DRAGON,
            SpiritType.PHOENIX,
            SpiritType.ALIEN,
            SpiritType.YETI,
        ]

        for spirit in all_spirits:
            assert spirit is not None
            assert spirit.value is not None
            assert isinstance(spirit.value, str)


class TestNamingStyle:
    """Test cases for NamingStyle enum."""

    def test_naming_style_values(self):
        """Test naming style enum values."""
        assert NamingStyle.FOUNDATION.value == "foundation"
        assert NamingStyle.EXO.value == "exo"
        assert NamingStyle.HYBRID.value == "hybrid"
        assert NamingStyle.CYBERPUNK.value == "cyberpunk"
        assert NamingStyle.MYTHOLOGICAL.value == "mythological"
        assert NamingStyle.SCIENTIFIC.value == "scientific"

    def test_naming_style_from_string(self):
        """Test creating naming style from string."""
        assert NamingStyle.from_string("foundation") == NamingStyle.FOUNDATION
        assert NamingStyle.from_string("exo") == NamingStyle.EXO
        assert NamingStyle.from_string("hybrid") == NamingStyle.HYBRID
        assert NamingStyle.from_string("cyberpunk") == NamingStyle.CYBERPUNK
        assert NamingStyle.from_string("mythological") == NamingStyle.MYTHOLOGICAL
        assert NamingStyle.from_string("scientific") == NamingStyle.SCIENTIFIC

    def test_naming_style_invalid_string(self):
        """Test creating naming style from invalid string."""
        with pytest.raises(ValueError):
            NamingStyle.from_string("invalid")

    def test_naming_style_all_values(self):
        """Test all naming style values are accessible."""
        all_styles = [
            NamingStyle.FOUNDATION,
            NamingStyle.EXO,
            NamingStyle.HYBRID,
            NamingStyle.CYBERPUNK,
            NamingStyle.MYTHOLOGICAL,
            NamingStyle.SCIENTIFIC,
        ]

        for style in all_styles:
            assert style is not None
            assert style.value is not None
            assert isinstance(style.value, str)


class TestPerformanceMetrics:
    """Test cases for PerformanceMetrics dataclass."""

    def test_performance_metrics_creation(self):
        """Test performance metrics creation."""
        metrics = PerformanceMetrics(
            timestamp="2025-01-15T10:30:00Z",
            action="test_action",
            success=True,
            duration=1.5,
            memory_usage=128.5,
            cpu_usage=25.0,
            details="Test performance metrics",
        )

        # Test basic properties
        assert metrics.timestamp == "2025-01-15T10:30:00Z"
        assert metrics.action == "test_action"
        assert metrics.success is True
        assert metrics.duration == 1.5
        assert metrics.memory_usage == 128.5
        assert metrics.cpu_usage == 25.0
        assert metrics.details == "Test performance metrics"

    def test_performance_metrics_defaults(self):
        """Test performance metrics with default values."""
        metrics = PerformanceMetrics(
            timestamp="2025-01-15T10:30:00Z", action="test_action", success=True
        )

        # Test default values
        assert metrics.duration == 0.0
        assert metrics.memory_usage == 0.0
        assert metrics.cpu_usage == 0.0
        assert metrics.details == ""

    def test_performance_metrics_serialization(self):
        """Test performance metrics serialization."""
        metrics = PerformanceMetrics(
            timestamp="2025-01-15T10:30:00Z",
            action="test_action",
            success=True,
            duration=1.5,
            memory_usage=128.5,
            cpu_usage=25.0,
            details="Test performance metrics",
        )

        # Test serialization to dict
        metrics_dict = metrics.to_dict()

        assert isinstance(metrics_dict, dict)
        assert metrics_dict["timestamp"] == "2025-01-15T10:30:00Z"
        assert metrics_dict["action"] == "test_action"
        assert metrics_dict["success"] is True
        assert metrics_dict["duration"] == 1.5
        assert metrics_dict["memory_usage"] == 128.5
        assert metrics_dict["cpu_usage"] == 25.0
        assert metrics_dict["details"] == "Test performance metrics"

    def test_performance_metrics_deserialization(self):
        """Test performance metrics deserialization."""
        metrics = PerformanceMetrics(
            timestamp="2025-01-15T10:30:00Z",
            action="test_action",
            success=True,
            duration=1.5,
            memory_usage=128.5,
            cpu_usage=25.0,
            details="Test performance metrics",
        )

        # Serialize to dict
        metrics_dict = metrics.to_dict()

        # Create new metrics from dict
        new_metrics = PerformanceMetrics.from_dict(metrics_dict)

        # Verify deserialization
        assert new_metrics.timestamp == metrics.timestamp
        assert new_metrics.action == metrics.action
        assert new_metrics.success == metrics.success
        assert new_metrics.duration == metrics.duration
        assert new_metrics.memory_usage == metrics.memory_usage
        assert new_metrics.cpu_usage == metrics.cpu_usage
        assert new_metrics.details == metrics.details


class TestStatisticalSignificance:
    """Test cases for StatisticalSignificance dataclass."""

    def test_statistical_significance_creation(self):
        """Test statistical significance creation."""
        significance = StatisticalSignificance(
            p_value=0.05,
            confidence_level=0.95,
            sample_size=100,
            effect_size=0.5,
            is_significant=True,
            interpretation="Significant difference detected",
        )

        # Test basic properties
        assert significance.p_value == 0.05
        assert significance.confidence_level == 0.95
        assert significance.sample_size == 100
        assert significance.effect_size == 0.5
        assert significance.is_significant is True
        assert significance.interpretation == "Significant difference detected"

    def test_statistical_significance_defaults(self):
        """Test statistical significance with default values."""
        significance = StatisticalSignificance(
            p_value=0.05, confidence_level=0.95, sample_size=100
        )

        # Test default values
        assert significance.effect_size == 0.0
        assert significance.is_significant is False
        assert significance.interpretation == ""

    def test_statistical_significance_serialization(self):
        """Test statistical significance serialization."""
        significance = StatisticalSignificance(
            p_value=0.05,
            confidence_level=0.95,
            sample_size=100,
            effect_size=0.5,
            is_significant=True,
            interpretation="Significant difference detected",
        )

        # Test serialization to dict
        significance_dict = significance.to_dict()

        assert isinstance(significance_dict, dict)
        assert significance_dict["p_value"] == 0.05
        assert significance_dict["confidence_level"] == 0.95
        assert significance_dict["sample_size"] == 100
        assert significance_dict["effect_size"] == 0.5
        assert significance_dict["is_significant"] is True
        assert significance_dict["interpretation"] == "Significant difference detected"

    def test_statistical_significance_deserialization(self):
        """Test statistical significance deserialization."""
        significance = StatisticalSignificance(
            p_value=0.05,
            confidence_level=0.95,
            sample_size=100,
            effect_size=0.5,
            is_significant=True,
            interpretation="Significant difference detected",
        )

        # Serialize to dict
        significance_dict = significance.to_dict()

        # Create new significance from dict
        new_significance = StatisticalSignificance.from_dict(significance_dict)

        # Verify deserialization
        assert new_significance.p_value == significance.p_value
        assert new_significance.confidence_level == significance.confidence_level
        assert new_significance.sample_size == significance.sample_size
        assert new_significance.effect_size == significance.effect_size
        assert new_significance.is_significant == significance.is_significant
        assert new_significance.interpretation == significance.interpretation


class TestReleaseConfig:
    """Test cases for ReleaseConfig dataclass."""

    def test_release_config_creation(self):
        """Test release config creation."""
        config = ReleaseConfig(
            auto_backup=True,
            comprehensive_analysis=True,
            detailed_logging=True,
            agent_state_tracking=True,
            create_tag=True,
            push_remote=False,
            version_type="auto",
        )

        # Test basic properties
        assert config.auto_backup is True
        assert config.comprehensive_analysis is True
        assert config.detailed_logging is True
        assert config.agent_state_tracking is True
        assert config.create_tag is True
        assert config.push_remote is False
        assert config.version_type == "auto"

    def test_release_config_defaults(self):
        """Test release config with default values."""
        config = ReleaseConfig()

        # Test default values
        assert config.auto_backup is True
        assert config.comprehensive_analysis is True
        assert config.detailed_logging is True
        assert config.agent_state_tracking is True
        assert config.create_tag is True
        assert config.push_remote is False
        assert config.version_type == "auto"

    def test_release_config_serialization(self):
        """Test release config serialization."""
        config = ReleaseConfig(
            auto_backup=True,
            comprehensive_analysis=True,
            detailed_logging=True,
            agent_state_tracking=True,
            create_tag=True,
            push_remote=False,
            version_type="auto",
        )

        # Test serialization to dict
        config_dict = config.to_dict()

        assert isinstance(config_dict, dict)
        assert config_dict["auto_backup"] is True
        assert config_dict["comprehensive_analysis"] is True
        assert config_dict["detailed_logging"] is True
        assert config_dict["agent_state_tracking"] is True
        assert config_dict["create_tag"] is True
        assert config_dict["push_remote"] is False
        assert config_dict["version_type"] == "auto"

    def test_release_config_deserialization(self):
        """Test release config deserialization."""
        config = ReleaseConfig(
            auto_backup=True,
            comprehensive_analysis=True,
            detailed_logging=True,
            agent_state_tracking=True,
            create_tag=True,
            push_remote=False,
            version_type="auto",
        )

        # Serialize to dict
        config_dict = config.to_dict()

        # Create new config from dict
        new_config = ReleaseConfig.from_dict(config_dict)

        # Verify deserialization
        assert new_config.auto_backup == config.auto_backup
        assert new_config.comprehensive_analysis == config.comprehensive_analysis
        assert new_config.detailed_logging == config.detailed_logging
        assert new_config.agent_state_tracking == config.agent_state_tracking
        assert new_config.create_tag == config.create_tag
        assert new_config.push_remote == config.push_remote
        assert new_config.version_type == config.version_type


class TestQualityConfig:
    """Test cases for QualityConfig dataclass."""

    def test_quality_config_creation(self):
        """Test quality config creation."""
        config = QualityConfig(
            enable_linting=True,
            enable_formatting=True,
            enable_type_checking=True,
            enable_security_scanning=True,
            enable_performance_testing=True,
            enable_documentation_validation=True,
            strict_mode=True,
            auto_fix=True,
        )

        # Test basic properties
        assert config.enable_linting is True
        assert config.enable_formatting is True
        assert config.enable_type_checking is True
        assert config.enable_security_scanning is True
        assert config.enable_performance_testing is True
        assert config.enable_documentation_validation is True
        assert config.strict_mode is True
        assert config.auto_fix is True

    def test_quality_config_defaults(self):
        """Test quality config with default values."""
        config = QualityConfig()

        # Test default values
        assert config.enable_linting is True
        assert config.enable_formatting is True
        assert config.enable_type_checking is True
        assert config.enable_security_scanning is True
        assert config.enable_performance_testing is True
        assert config.enable_documentation_validation is True
        assert config.strict_mode is True
        assert config.auto_fix is True

    def test_quality_config_serialization(self):
        """Test quality config serialization."""
        config = QualityConfig(
            enable_linting=True,
            enable_formatting=True,
            enable_type_checking=True,
            enable_security_scanning=True,
            enable_performance_testing=True,
            enable_documentation_validation=True,
            strict_mode=True,
            auto_fix=True,
        )

        # Test serialization to dict
        config_dict = config.to_dict()

        assert isinstance(config_dict, dict)
        assert config_dict["enable_linting"] is True
        assert config_dict["enable_formatting"] is True
        assert config_dict["enable_type_checking"] is True
        assert config_dict["enable_security_scanning"] is True
        assert config_dict["enable_performance_testing"] is True
        assert config_dict["enable_documentation_validation"] is True
        assert config_dict["strict_mode"] is True
        assert config_dict["auto_fix"] is True

    def test_quality_config_deserialization(self):
        """Test quality config deserialization."""
        config = QualityConfig(
            enable_linting=True,
            enable_formatting=True,
            enable_type_checking=True,
            enable_security_scanning=True,
            enable_performance_testing=True,
            enable_documentation_validation=True,
            strict_mode=True,
            auto_fix=True,
        )

        # Serialize to dict
        config_dict = config.to_dict()

        # Create new config from dict
        new_config = QualityConfig.from_dict(config_dict)

        # Verify deserialization
        assert new_config.enable_linting == config.enable_linting
        assert new_config.enable_formatting == config.enable_formatting
        assert new_config.enable_type_checking == config.enable_type_checking
        assert new_config.enable_security_scanning == config.enable_security_scanning
        assert (
            new_config.enable_performance_testing == config.enable_performance_testing
        )
        assert (
            new_config.enable_documentation_validation
            == config.enable_documentation_validation
        )
        assert new_config.strict_mode == config.strict_mode
        assert new_config.auto_fix == config.auto_fix


if __name__ == "__main__":
    pytest.main([__file__])
