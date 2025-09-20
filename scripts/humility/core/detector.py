"""
Enhanced Humility Detector - Core Detection Engine
"""

import re
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Optional, Any, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

from .models import (
    HumilityFinding, HumilityProfile, DetectionMetrics, CulturalContext,
    SeverityLevel, ConfidenceLevel, DetectionCategory
)
from .config import HumilityConfig
from analyzers import (
    PatternAnalyzer, SentimentAnalyzer, HexacoAnalyzer, 
    EpistemicHumilityAnalyzer, LiwcAnalyzer, TransformerAnalyzer
)
from utils import TextProcessor, CulturalAdapter, MetricsCalculator


class HumilityDetector:
    """
    Humility Detector with NLP, ML, and psychological analysis.
    
    This detector combines multiple analysis techniques:
    - Pattern-based detection
    - Transformer model analysis (BERT, RoBERTa)
    - HEXACO personality assessment
    - Epistemic humility evaluation
    - LIWC linguistic analysis
    - Sentiment and emotional analysis
    - Cultural context adaptation
    - Explainable AI features
    """
    
    def __init__(self, config: Optional[HumilityConfig] = None):
        """Initialize the humility detector."""
        self.config = config or HumilityConfig()
        self.logger = logging.getLogger(__name__)
        
        # Initialize analyzers
        self.pattern_analyzer = PatternAnalyzer(self.config)
        self.sentiment_analyzer = SentimentAnalyzer(self.config) if self.config.use_sentiment_analysis else None
        self.hexaco_analyzer = HexacoAnalyzer(self.config) if self.config.use_hexaco_assessment else None
        self.epistemic_analyzer = EpistemicHumilityAnalyzer(self.config) if self.config.use_epistemic_humility else None
        self.liwc_analyzer = LiwcAnalyzer(self.config) if self.config.use_liwc_analysis else None
        self.transformer_analyzer = TransformerAnalyzer(self.config) if self.config.use_transformer_models else None
        
        # Initialize utilities
        self.text_processor = TextProcessor(self.config)
        self.cultural_adapter = CulturalAdapter(self.config) if self.config.enable_cultural_adaptation else None
        self.metrics_calculator = MetricsCalculator(self.config)
        
        # Cache for results
        self.cache: Dict[str, Any] = {}
        
        self.logger.info("Humility Detector initialized")
    
    async def analyze_text(self, text: str, file_path: str = "", 
                          cultural_context: Optional[str] = None) -> HumilityProfile:
        """
        Analyze text for humility-related patterns and generate comprehensive profile.
        
        Args:
            text: Text to analyze
            file_path: Path to the file (for context)
            cultural_context: Cultural context for adaptation
            
        Returns:
            Comprehensive humility profile
        """
        self.logger.info(f"Analyzing text from {file_path or 'string input'}")
        
        # Check cache first
        cache_key = f"{hash(text)}_{file_path}_{cultural_context}"
        if self.config.cache_results and cache_key in self.cache:
            self.logger.debug("Returning cached result")
            return self.cache[cache_key]
        
        # Process text
        processed_text = self.text_processor.preprocess(text)
        
        # Run all analyzers in parallel
        tasks = []
        
        # Pattern-based analysis (always run)
        tasks.append(self._run_pattern_analysis(processed_text, file_path))
        
        # Optional analyzers
        if self.sentiment_analyzer:
            tasks.append(self._run_sentiment_analysis(processed_text, file_path))
        
        if self.hexaco_analyzer:
            tasks.append(self._run_hexaco_analysis(processed_text, file_path))
        
        if self.epistemic_analyzer:
            tasks.append(self._run_epistemic_analysis(processed_text, file_path))
        
        if self.liwc_analyzer:
            tasks.append(self._run_liwc_analysis(processed_text, file_path))
        
        if self.transformer_analyzer:
            tasks.append(self._run_transformer_analysis(processed_text, file_path))
        
        # Wait for all analyses to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine results
        all_findings = []
        analysis_metrics = {}
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                self.logger.error(f"Analysis {i} failed: {result}")
                continue
            
            if isinstance(result, dict):
                if 'findings' in result:
                    all_findings.extend(result['findings'])
                if 'metrics' in result:
                    analysis_metrics.update(result['metrics'])
        
        # Apply cultural adaptation if enabled
        if self.cultural_adapter and cultural_context:
            all_findings = self.cultural_adapter.adapt_findings(all_findings, cultural_context)
        
        # Filter findings by confidence and severity
        filtered_findings = self._filter_findings(all_findings)
        
        # Calculate comprehensive scores
        scores = self._calculate_comprehensive_scores(filtered_findings, analysis_metrics)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(filtered_findings, scores)
        
        # Create profile
        profile = HumilityProfile(
            overall_score=scores['overall'],
            hexaco_honesty_humility=scores.get('hexaco', 0.0),
            epistemic_humility=scores.get('epistemic', 0.0),
            linguistic_humility=scores.get('linguistic', 0.0),
            behavioral_humility=scores.get('behavioral', 0.0),
            cultural_adaptation=scores.get('cultural', 0.0),
            findings=filtered_findings,
            recommendations=recommendations['recommendations'],
            improvement_areas=recommendations['improvement_areas'],
            strengths=recommendations['strengths']
        )
        
        # Cache result
        if self.config.cache_results:
            self.cache[cache_key] = profile
        
        self.logger.info(f"Analysis complete: {len(filtered_findings)} findings, overall score: {scores['overall']:.2f}")
        return profile
    
    async def analyze_file(self, file_path: Path) -> HumilityProfile:
        """Analyze a single file for humility patterns."""
        try:
            # Check file size
            file_size_mb = file_path.stat().st_size / (1024 * 1024)
            if file_size_mb > self.config.max_file_size_mb:
                self.logger.warning(f"File {file_path} is too large ({file_size_mb:.1f}MB), skipping")
                return self._create_empty_profile()
            
            # Read file
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            return await self.analyze_text(content, str(file_path))
            
        except Exception as e:
            self.logger.error(f"Error analyzing file {file_path}: {e}")
            return self._create_empty_profile()
    
    async def analyze_directory(self, directory: Path, 
                               extensions: Optional[List[str]] = None) -> Dict[str, HumilityProfile]:
        """Analyze all files in a directory."""
        if extensions is None:
            extensions = self.config.supported_extensions
        
        # Use configurable excluded directories
        excluded_dirs = self.config.excluded_directories
        
        # Find all files, excluding specified directories
        files = []
        for ext in extensions:
            for file_path in directory.rglob(f'*{ext}'):
                # Check if any parent directory is in excluded list
                if not any(part in excluded_dirs for part in file_path.parts):
                    files.append(file_path)
        
        self.logger.info(f"Found {len(files)} files to analyze (excluding {len(excluded_dirs)} directory types)")
        
        # Analyze files in parallel
        profiles = {}
        
        if self.config.parallel_processing:
            with ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
                # Submit all tasks
                future_to_file = {
                    executor.submit(self._analyze_file_sync, file_path): file_path 
                    for file_path in files
                }
                
                # Collect results
                for future in as_completed(future_to_file):
                    file_path = future_to_file[future]
                    try:
                        profile = future.result()
                        profiles[str(file_path)] = profile
                    except Exception as e:
                        self.logger.error(f"Error analyzing {file_path}: {e}")
        else:
            # Sequential processing
            for file_path in files:
                try:
                    profile = await self.analyze_file(file_path)
                    profiles[str(file_path)] = profile
                except Exception as e:
                    self.logger.error(f"Error analyzing {file_path}: {e}")
        
        return profiles
    
    def _analyze_file_sync(self, file_path: Path) -> HumilityProfile:
        """Synchronous wrapper for file analysis."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self.analyze_file(file_path))
        finally:
            loop.close()
    
    async def _run_pattern_analysis(self, text: str, file_path: str) -> Dict[str, Any]:
        """Run pattern-based analysis."""
        try:
            findings = self.pattern_analyzer.analyze(text, file_path)
            return {'findings': findings, 'metrics': {'pattern_analysis': True}}
        except Exception as e:
            self.logger.error(f"Pattern analysis failed: {e}")
            return {'findings': [], 'metrics': {}}
    
    async def _run_sentiment_analysis(self, text: str, file_path: str) -> Dict[str, Any]:
        """Run sentiment analysis."""
        try:
            if not self.sentiment_analyzer:
                return {'findings': [], 'metrics': {}}
            
            findings = await self.sentiment_analyzer.analyze(text, file_path)
            metrics = await self.sentiment_analyzer.get_metrics(text)
            return {'findings': findings, 'metrics': metrics}
        except Exception as e:
            self.logger.error(f"Sentiment analysis failed: {e}")
            return {'findings': [], 'metrics': {}}
    
    async def _run_hexaco_analysis(self, text: str, file_path: str) -> Dict[str, Any]:
        """Run HEXACO personality analysis."""
        try:
            if not self.hexaco_analyzer:
                return {'findings': [], 'metrics': {}}
            
            findings = await self.hexaco_analyzer.analyze(text, file_path)
            metrics = await self.hexaco_analyzer.get_metrics(text)
            return {'findings': findings, 'metrics': metrics}
        except Exception as e:
            self.logger.error(f"HEXACO analysis failed: {e}")
            return {'findings': [], 'metrics': {}}
    
    async def _run_epistemic_analysis(self, text: str, file_path: str) -> Dict[str, Any]:
        """Run epistemic humility analysis."""
        try:
            if not self.epistemic_analyzer:
                return {'findings': [], 'metrics': {}}
            
            findings = await self.epistemic_analyzer.analyze(text, file_path)
            metrics = await self.epistemic_analyzer.get_metrics(text)
            return {'findings': findings, 'metrics': metrics}
        except Exception as e:
            self.logger.error(f"Epistemic analysis failed: {e}")
            return {'findings': [], 'metrics': {}}
    
    async def _run_liwc_analysis(self, text: str, file_path: str) -> Dict[str, Any]:
        """Run LIWC linguistic analysis."""
        try:
            if not self.liwc_analyzer:
                return {'findings': [], 'metrics': {}}
            
            findings = await self.liwc_analyzer.analyze(text, file_path)
            metrics = await self.liwc_analyzer.get_metrics(text)
            return {'findings': findings, 'metrics': metrics}
        except Exception as e:
            self.logger.error(f"LIWC analysis failed: {e}")
            return {'findings': [], 'metrics': {}}
    
    async def _run_transformer_analysis(self, text: str, file_path: str) -> Dict[str, Any]:
        """Run transformer model analysis."""
        try:
            if not self.transformer_analyzer:
                return {'findings': [], 'metrics': {}}
            
            findings = await self.transformer_analyzer.analyze(text, file_path)
            metrics = await self.transformer_analyzer.get_metrics(text)
            return {'findings': findings, 'metrics': metrics}
        except Exception as e:
            self.logger.error(f"Transformer analysis failed: {e}")
            return {'findings': [], 'metrics': {}}
    
    def _filter_findings(self, findings: List[HumilityFinding]) -> List[HumilityFinding]:
        """Filter findings based on confidence and severity thresholds."""
        filtered = []
        
        for finding in findings:
            # Check confidence threshold
            if finding.confidence_score < self.config.min_confidence_threshold:
                continue
            
            # Check severity threshold
            severity_order = [SeverityLevel.LOW, SeverityLevel.MEDIUM, 
                            SeverityLevel.HIGH, SeverityLevel.CRITICAL]
            min_severity = SeverityLevel(self.config.min_severity_threshold)
            
            if severity_order.index(finding.severity) < severity_order.index(min_severity):
                continue
            
            filtered.append(finding)
        
        return filtered
    
    def _calculate_comprehensive_scores(self, findings: List[HumilityFinding], 
                                      analysis_metrics: Dict[str, Any]) -> Dict[str, float]:
        """Calculate comprehensive humility scores."""
        scores = {}
        
        # Overall score (weighted combination)
        if not findings:
            scores['overall'] = 100.0
        else:
            # Calculate based on findings severity and confidence
            total_penalty = 0
            for finding in findings:
                severity_weight = {
                    SeverityLevel.LOW: 1,
                    SeverityLevel.MEDIUM: 2,
                    SeverityLevel.HIGH: 3,
                    SeverityLevel.CRITICAL: 4
                }[finding.severity]
                total_penalty += severity_weight * finding.confidence_score
            
            max_possible_penalty = len(findings) * 4 * 1.0
            scores['overall'] = max(0, 100 - (total_penalty / max_possible_penalty * 100))
        
        # Individual component scores
        scores['hexaco'] = analysis_metrics.get('hexaco_honesty_humility', 0.0)
        scores['epistemic'] = analysis_metrics.get('epistemic_humility', 0.0)
        scores['linguistic'] = analysis_metrics.get('linguistic_humility', 0.0)
        scores['behavioral'] = analysis_metrics.get('behavioral_humility', 0.0)
        scores['cultural'] = analysis_metrics.get('cultural_adaptation', 0.0)
        
        return scores
    
    def _generate_recommendations(self, findings: List[HumilityFinding], 
                                scores: Dict[str, float]) -> Dict[str, List[str]]:
        """Generate recommendations based on findings and scores."""
        recommendations = []
        improvement_areas = []
        strengths = []
        
        # Analyze findings by category
        category_counts = {}
        for finding in findings:
            category = finding.category.value
            category_counts[category] = category_counts.get(category, 0) + 1
        
        # Generate specific recommendations
        for category, count in category_counts.items():
            if count > 0:
                improvement_areas.append(f"Reduce {category.replace('_', ' ')} language")
                
                if category == 'superlatives':
                    recommendations.append("Replace superlatives with more modest alternatives")
                elif category == 'exaggeration':
                    recommendations.append("Use more measured language instead of hyperbolic claims")
                elif category == 'self_promotion':
                    recommendations.append("Focus on user value rather than system capabilities")
                elif category == 'dismissiveness':
                    recommendations.append("Acknowledge other approaches and solutions")
                elif category == 'absolute_claims':
                    recommendations.append("Use more nuanced language instead of absolute statements")
        
        # Score-based recommendations
        if scores['overall'] < 70:
            recommendations.append("Consider a comprehensive review of communication style")
            improvement_areas.append("Overall humility and modesty")
        elif scores['overall'] > 85:
            strengths.append("Maintains good balance of confidence and humility")
        
        if scores.get('hexaco', 0) < 60:
            improvement_areas.append("Honesty and humility in communication")
            recommendations.append("Focus on sincere and modest expression")
        
        if scores.get('epistemic', 0) < 60:
            improvement_areas.append("Intellectual humility and openness")
            recommendations.append("Acknowledge limitations and uncertainties")
        
        return {
            'recommendations': recommendations,
            'improvement_areas': improvement_areas,
            'strengths': strengths
        }
    
    def _create_empty_profile(self) -> HumilityProfile:
        """Create an empty profile for error cases."""
        return HumilityProfile(
            overall_score=0.0,
            hexaco_honesty_humility=0.0,
            epistemic_humility=0.0,
            linguistic_humility=0.0,
            behavioral_humility=0.0,
            cultural_adaptation=0.0,
            findings=[],
            recommendations=["Unable to analyze due to error"],
            improvement_areas=["Analysis failed"],
            strengths=[]
        )
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            'cache_size': len(self.cache),
            'cache_enabled': self.config.cache_results,
            'cache_ttl': self.config.cache_ttl_seconds
        }
    
    def clear_cache(self) -> None:
        """Clear the analysis cache."""
        self.cache.clear()
        self.logger.info("Cache cleared")
