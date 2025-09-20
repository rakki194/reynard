"""
Configuration management for the Enhanced Humility Detector.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Set
from pathlib import Path
import json


@dataclass
class HumilityConfig:
    """Configuration for the Enhanced Humility Detector."""
    
    # Detection thresholds
    min_confidence_threshold: float = 0.6
    min_severity_threshold: str = "medium"
    max_findings_per_file: int = 100
    
    # Model settings
    use_transformer_models: bool = True
    use_hexaco_assessment: bool = True
    use_epistemic_humility: bool = True
    use_liwc_analysis: bool = True
    use_sentiment_analysis: bool = True
    
    # File processing
    supported_extensions: List[str] = field(default_factory=lambda: [
        '.md', '.txt', '.py', '.js', '.ts', '.tsx', '.jsx', '.json',
        '.rst', '.adoc', '.tex', '.html', '.xml', '.yaml', '.yml'
    ])
    
    # Directory exclusions
    excluded_directories: Set[str] = field(default_factory=lambda: {
        'node_modules', 'dist', 'build', 'out', 'target', 'bin', 'obj',
        'third_party', 'third-party', 'vendor', 'deps', 'dependencies',
        '.git', '.svn', '.hg', '.bzr', '.cvs',
        '.cache', 'cache', '.tmp', 'tmp', 'temp',
        '.coverage', 'coverage', '.nyc_output',
        '.pytest_cache', '.mypy_cache', '.tox',
        'logs', '.logs', 'log',
        '.next', '.nuxt', '.vuepress', '.docusaurus',
        'public', 'static', 'assets', 'media',
        '.vscode', '.idea', '.vs', '.sublime-*',
        'bower_components', 'jspm_packages',
        '.sass-cache', '.parcel-cache', '.turbo',
        '.eslintcache', '.stylelintcache'
    })
    
    # Output settings
    output_format: str = "text"  # text, json, html, csv
    include_context: bool = True
    include_suggestions: bool = True
    include_metrics: bool = True
    include_recommendations: bool = True
    
    # Advanced features
    enable_real_time_monitoring: bool = False
    enable_trend_analysis: bool = False
    enable_cultural_adaptation: bool = True
    enable_explainable_ai: bool = True
    
    # Performance settings
    max_file_size_mb: int = 10
    parallel_processing: bool = True
    max_workers: int = 4
    cache_results: bool = True
    cache_ttl_seconds: int = 3600
    
    # Cultural contexts
    cultural_contexts: Dict[str, Dict[str, Any]] = field(default_factory=lambda: {
        "western": {
            "directness_preference": 0.8,
            "modesty_emphasis": 0.6,
            "achievement_focus": 0.7
        },
        "eastern": {
            "directness_preference": 0.4,
            "modesty_emphasis": 0.9,
            "achievement_focus": 0.5
        },
        "nordic": {
            "directness_preference": 0.6,
            "modesty_emphasis": 0.8,
            "achievement_focus": 0.4
        }
    })
    
    # HEXACO model weights
    hexaco_weights: Dict[str, float] = field(default_factory=lambda: {
        "honesty_humility": 0.3,
        "emotionality": 0.1,
        "extraversion": 0.1,
        "agreeableness": 0.2,
        "conscientiousness": 0.1,
        "openness": 0.2
    })
    
    # Epistemic humility factors
    epistemic_factors: Dict[str, float] = field(default_factory=lambda: {
        "intellectual_modesty": 0.25,
        "open_mindedness": 0.25,
        "corrigibility": 0.25,
        "engagement": 0.25
    })
    
    @classmethod
    def from_file(cls, config_path: Path) -> 'HumilityConfig':
        """Load configuration from JSON file."""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
            return cls(**config_data)
        except Exception as e:
            print(f"Warning: Could not load config from {config_path}: {e}")
            return cls()
    
    def to_file(self, config_path: Path) -> None:
        """Save configuration to JSON file."""
        config_data = {
            'min_confidence_threshold': self.min_confidence_threshold,
            'min_severity_threshold': self.min_severity_threshold,
            'max_findings_per_file': self.max_findings_per_file,
            'use_transformer_models': self.use_transformer_models,
            'use_hexaco_assessment': self.use_hexaco_assessment,
            'use_epistemic_humility': self.use_epistemic_humility,
            'use_liwc_analysis': self.use_liwc_analysis,
            'use_sentiment_analysis': self.use_sentiment_analysis,
            'supported_extensions': self.supported_extensions,
            'output_format': self.output_format,
            'include_context': self.include_context,
            'include_suggestions': self.include_suggestions,
            'include_metrics': self.include_metrics,
            'enable_real_time_monitoring': self.enable_real_time_monitoring,
            'enable_trend_analysis': self.enable_trend_analysis,
            'enable_cultural_adaptation': self.enable_cultural_adaptation,
            'enable_explainable_ai': self.enable_explainable_ai,
            'max_file_size_mb': self.max_file_size_mb,
            'parallel_processing': self.parallel_processing,
            'max_workers': self.max_workers,
            'cache_results': self.cache_results,
            'cache_ttl_seconds': self.cache_ttl_seconds,
            'cultural_contexts': self.cultural_contexts,
            'hexaco_weights': self.hexaco_weights,
            'epistemic_factors': self.epistemic_factors
        }
        
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)
    
    def validate(self) -> List[str]:
        """Validate configuration and return list of issues."""
        issues = []
        
        if not 0.0 <= self.min_confidence_threshold <= 1.0:
            issues.append("min_confidence_threshold must be between 0.0 and 1.0")
        
        if self.min_severity_threshold not in ["low", "medium", "high", "critical"]:
            issues.append("min_severity_threshold must be one of: low, medium, high, critical")
        
        if self.max_findings_per_file <= 0:
            issues.append("max_findings_per_file must be positive")
        
        if self.max_file_size_mb <= 0:
            issues.append("max_file_size_mb must be positive")
        
        if self.max_workers <= 0:
            issues.append("max_workers must be positive")
        
        if self.cache_ttl_seconds <= 0:
            issues.append("cache_ttl_seconds must be positive")
        
        # Validate HEXACO weights sum to 1.0
        hexaco_sum = sum(self.hexaco_weights.values())
        if abs(hexaco_sum - 1.0) > 0.01:
            issues.append(f"HEXACO weights must sum to 1.0, got {hexaco_sum}")
        
        # Validate epistemic factors sum to 1.0
        epistemic_sum = sum(self.epistemic_factors.values())
        if abs(epistemic_sum - 1.0) > 0.01:
            issues.append(f"Epistemic factors must sum to 1.0, got {epistemic_sum}")
        
        return issues
