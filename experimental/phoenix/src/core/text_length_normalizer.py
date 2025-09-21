"""
PHOENIX Text Length Normalizer

Specialized module for handling text length dependency in results:
- Length normalization algorithms
- Bias correction techniques
- Quality preservation during normalization
- Statistical adjustment methods

Author: Vulpine (Fox Specialist)
Version: 1.0.0
"""

import re
import logging
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import math
from collections import Counter

from ..utils.data_structures import AgentState


class TextLengthNormalizer:
    """
    Text length normalization system to address length dependency in results.

    Features:
    - Multiple normalization strategies
    - Bias correction techniques
    - Quality preservation
    - Statistical adjustment methods
    """

    def __init__(self):
        """Initialize the text length normalizer."""
        self.logger = logging.getLogger(__name__)

        # Normalization parameters
        self.normalization_params = {
            'target_length': 150,  # Target word count
            'min_length': 20,      # Minimum acceptable length
            'max_length': 500,     # Maximum acceptable length
            'length_tolerance': 0.2,  # 20% tolerance around target
            'quality_preservation_threshold': 0.8
        }

        # Statistical parameters for bias correction
        self.bias_correction_params = {
            'length_weight': 0.3,
            'content_weight': 0.7,
            'complexity_weight': 0.2,
            'density_weight': 0.8
        }

        self.logger.info("📏 Text length normalizer initialized")

    def normalize_text_length(self, text: str, strategy: str = "adaptive") -> Dict[str, Any]:
        """
        Normalize text length using specified strategy.

        Args:
            text: Input text to normalize
            strategy: Normalization strategy ("adaptive", "truncate", "expand", "statistical")

        Returns:
            Dictionary containing normalized text and metadata
        """
        self.logger.debug(f"Normalizing text of length {len(text.split())} words using {strategy} strategy")

        if strategy == "adaptive":
            return self._adaptive_normalization(text)
        elif strategy == "truncate":
            return self._truncation_normalization(text)
        elif strategy == "expand":
            return self._expansion_normalization(text)
        elif strategy == "statistical":
            return self._statistical_normalization(text)
        else:
            raise ValueError(f"Unknown normalization strategy: {strategy}")

    def _adaptive_normalization(self, text: str) -> Dict[str, Any]:
        """Apply adaptive normalization based on text characteristics."""
        words = text.split()
        word_count = len(words)
        target_length = self.normalization_params['target_length']

        if word_count < self.normalization_params['min_length']:
            # Text too short - expand with context
            return self._expand_short_text(text, target_length)
        elif word_count > self.normalization_params['max_length']:
            # Text too long - intelligently truncate
            return self._truncate_long_text(text, target_length)
        elif abs(word_count - target_length) / target_length > self.normalization_params['length_tolerance']:
            # Text within acceptable range but not optimal - adjust
            if word_count < target_length:
                return self._expand_short_text(text, target_length)
            else:
                return self._truncate_long_text(text, target_length)
        else:
            # Text already optimal length
            return {
                'normalized_text': text,
                'original_length': word_count,
                'normalized_length': word_count,
                'normalization_factor': 1.0,
                'strategy_used': 'none',
                'quality_preserved': True
            }

    def _expand_short_text(self, text: str, target_length: int) -> Dict[str, Any]:
        """Expand short text while preserving quality."""
        words = text.split()
        current_length = len(words)
        expansion_needed = target_length - current_length

        # Analyze text to determine expansion strategy
        text_analysis = self._analyze_text_characteristics(text)

        if text_analysis['is_technical']:
            # Add technical context
            expanded_text = self._add_technical_context(text, expansion_needed)
        elif text_analysis['is_analytical']:
            # Add analytical context
            expanded_text = self._add_analytical_context(text, expansion_needed)
        else:
            # Add general context
            expanded_text = self._add_general_context(text, expansion_needed)

        return {
            'normalized_text': expanded_text,
            'original_length': current_length,
            'normalized_length': len(expanded_text.split()),
            'normalization_factor': len(expanded_text.split()) / current_length,
            'strategy_used': 'expansion',
            'quality_preserved': self._assess_quality_preservation(text, expanded_text)
        }

    def _truncate_long_text(self, text: str, target_length: int) -> Dict[str, Any]:
        """Intelligently truncate long text while preserving key information."""
        words = text.split()
        current_length = len(words)

        # Use importance scoring to determine what to keep
        word_importance = self._calculate_word_importance(text)

        # Keep most important words
        important_words = sorted(word_importance.items(), key=lambda x: x[1], reverse=True)
        words_to_keep = [word for word, _ in important_words[:target_length]]

        # Reconstruct text maintaining sentence structure
        truncated_text = self._reconstruct_text_from_words(words_to_keep, text)

        return {
            'normalized_text': truncated_text,
            'original_length': current_length,
            'normalized_length': len(truncated_text.split()),
            'normalization_factor': len(truncated_text.split()) / current_length,
            'strategy_used': 'truncation',
            'quality_preserved': self._assess_quality_preservation(text, truncated_text)
        }

    def _statistical_normalization(self, text: str) -> Dict[str, Any]:
        """Apply statistical normalization with bias correction."""
        words = text.split()
        current_length = len(words)
        target_length = self.normalization_params['target_length']

        # Calculate statistical adjustment factor
        length_ratio = current_length / target_length

        # Apply bias correction
        bias_corrected_ratio = self._apply_bias_correction(length_ratio, text)

        # Adjust text based on corrected ratio
        if bias_corrected_ratio > 1.2:
            # Text is significantly longer - truncate
            return self._truncate_long_text(text, target_length)
        elif bias_corrected_ratio < 0.8:
            # Text is significantly shorter - expand
            return self._expand_short_text(text, target_length)
        else:
            # Text is within acceptable range
            return {
                'normalized_text': text,
                'original_length': current_length,
                'normalized_length': current_length,
                'normalization_factor': 1.0,
                'strategy_used': 'statistical_none',
                'quality_preserved': True,
                'bias_correction_applied': True
            }

    def _analyze_text_characteristics(self, text: str) -> Dict[str, Any]:
        """Analyze text characteristics to inform normalization strategy."""
        words = text.lower().split()

        # Technical indicators
        technical_terms = [
            'algorithm', 'data', 'analysis', 'system', 'process', 'method',
            'implementation', 'optimization', 'performance', 'efficiency'
        ]
        technical_score = sum(1 for word in words if word in technical_terms) / len(words)

        # Analytical indicators
        analytical_terms = [
            'analyze', 'evaluate', 'assess', 'examine', 'investigate',
            'consider', 'review', 'compare', 'contrast', 'determine'
        ]
        analytical_score = sum(1 for word in words if word in analytical_terms) / len(words)

        # Complexity indicators
        avg_word_length = sum(len(word) for word in words) / len(words)
        sentence_count = len(re.split(r'[.!?]+', text))
        avg_sentence_length = len(words) / sentence_count if sentence_count > 0 else len(words)

        return {
            'is_technical': technical_score > 0.1,
            'is_analytical': analytical_score > 0.1,
            'complexity_score': (avg_word_length / 10) + (avg_sentence_length / 20),
            'technical_score': technical_score,
            'analytical_score': analytical_score
        }

    def _add_technical_context(self, text: str, expansion_needed: int) -> str:
        """Add technical context to expand text."""
        context_phrases = [
            "This approach demonstrates technical expertise in",
            "The implementation shows proficiency in",
            "Technical considerations include",
            "From a technical perspective,",
            "The methodology involves",
            "Technical aspects encompass",
            "Implementation details reveal",
            "Technical analysis indicates"
        ]

        # Select appropriate context phrase
        context_phrase = context_phrases[len(text) % len(context_phrases)]

        # Add technical filler words
        technical_fillers = [
            "systematic analysis", "methodical approach", "structured methodology",
            "comprehensive evaluation", "detailed assessment", "thorough examination",
            "rigorous implementation", "precise execution", "efficient optimization"
        ]

        filler_count = min(expansion_needed // 2, len(technical_fillers))
        selected_fillers = technical_fillers[:filler_count]

        expanded_text = f"{text} {context_phrase} {' '.join(selected_fillers)}"

        # Add remaining words if needed
        remaining_words = expansion_needed - len(selected_fillers) * 2
        if remaining_words > 0:
            additional_words = ["technical", "analysis", "implementation"] * (remaining_words // 3)
            expanded_text += " " + " ".join(additional_words[:remaining_words])

        return expanded_text

    def _add_analytical_context(self, text: str, expansion_needed: int) -> str:
        """Add analytical context to expand text."""
        context_phrases = [
            "This analysis demonstrates",
            "The evaluation reveals",
            "Assessment indicates that",
            "Examination shows",
            "Investigation demonstrates",
            "Analysis suggests that",
            "Evaluation points to",
            "Assessment reveals"
        ]

        context_phrase = context_phrases[len(text) % len(context_phrases)]

        analytical_fillers = [
            "comprehensive analysis", "detailed evaluation", "thorough assessment",
            "systematic examination", "rigorous investigation", "methodical review",
            "in-depth analysis", "careful consideration", "thoughtful evaluation"
        ]

        filler_count = min(expansion_needed // 2, len(analytical_fillers))
        selected_fillers = analytical_fillers[:filler_count]

        expanded_text = f"{text} {context_phrase} {' '.join(selected_fillers)}"

        # Add remaining words if needed
        remaining_words = expansion_needed - len(selected_fillers) * 2
        if remaining_words > 0:
            additional_words = ["analysis", "evaluation", "assessment"] * (remaining_words // 3)
            expanded_text += " " + " ".join(additional_words[:remaining_words])

        return expanded_text

    def _add_general_context(self, text: str, expansion_needed: int) -> str:
        """Add general context to expand text."""
        context_phrases = [
            "This demonstrates",
            "The approach shows",
            "Analysis indicates",
            "Evaluation reveals",
            "Assessment demonstrates",
            "Examination shows",
            "Investigation indicates",
            "Review reveals"
        ]

        context_phrase = context_phrases[len(text) % len(context_phrases)]

        general_fillers = [
            "comprehensive approach", "effective methodology", "systematic process",
            "thorough analysis", "detailed evaluation", "rigorous assessment",
            "methodical examination", "careful investigation", "thoughtful review"
        ]

        filler_count = min(expansion_needed // 2, len(general_fillers))
        selected_fillers = general_fillers[:filler_count]

        expanded_text = f"{text} {context_phrase} {' '.join(selected_fillers)}"

        # Add remaining words if needed
        remaining_words = expansion_needed - len(selected_fillers) * 2
        if remaining_words > 0:
            additional_words = ["approach", "methodology", "process"] * (remaining_words // 3)
            expanded_text += " " + " ".join(additional_words[:remaining_words])

        return expanded_text

    def _calculate_word_importance(self, text: str) -> Dict[str, float]:
        """Calculate importance scores for words in text."""
        words = text.lower().split()
        word_freq = Counter(words)

        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
        }

        # Calculate importance scores
        importance_scores = {}
        total_words = len(words)

        for word in words:
            if word not in stop_words and len(word) > 2:
                # Base score from frequency
                freq_score = word_freq[word] / total_words

                # Length bonus (longer words often more important)
                length_bonus = min(0.2, (len(word) - 3) * 0.05)

                # Technical term bonus
                technical_bonus = 0.1 if word in [
                    'algorithm', 'analysis', 'system', 'process', 'method',
                    'implementation', 'optimization', 'performance', 'efficiency'
                ] else 0.0

                importance_scores[word] = freq_score + length_bonus + technical_bonus

        return importance_scores

    def _reconstruct_text_from_words(self, important_words: List[str], original_text: str) -> str:
        """Reconstruct text from important words while maintaining structure."""
        # Simple reconstruction - in practice, this could be more sophisticated
        # using sentence parsing and reconstruction
        return " ".join(important_words)

    def _apply_bias_correction(self, length_ratio: float, text: str) -> float:
        """Apply bias correction to length ratio."""
        # Analyze text complexity
        text_analysis = self._analyze_text_characteristics(text)

        # Adjust ratio based on complexity
        complexity_factor = 1.0 + (text_analysis['complexity_score'] * 0.1)

        # Apply bias correction
        corrected_ratio = length_ratio * complexity_factor

        return corrected_ratio

    def _assess_quality_preservation(self, original_text: str, normalized_text: str) -> bool:
        """Assess whether quality was preserved during normalization."""
        # Simple quality assessment - in practice, this could be more sophisticated
        original_words = set(original_text.lower().split())
        normalized_words = set(normalized_text.lower().split())

        # Calculate overlap
        overlap = len(original_words.intersection(normalized_words))
        overlap_ratio = overlap / len(original_words) if original_words else 0

        return overlap_ratio >= self.normalization_params['quality_preservation_threshold']

    def calculate_length_bias_factor(self, text: str) -> float:
        """Calculate length bias factor for statistical adjustment."""
        word_count = len(text.split())
        target_length = self.normalization_params['target_length']

        # Calculate bias factor
        length_ratio = word_count / target_length

        # Apply logarithmic scaling to prevent extreme values
        if length_ratio > 1:
            bias_factor = 1.0 + math.log(length_ratio) * 0.1
        else:
            bias_factor = 1.0 - math.log(1 / length_ratio) * 0.1

        return max(0.5, min(2.0, bias_factor))  # Clamp between 0.5 and 2.0

    def normalize_metrics_by_length(self, metrics: Dict[str, float], text: str) -> Dict[str, float]:
        """Normalize metrics by text length to remove length bias."""
        length_bias_factor = self.calculate_length_bias_factor(text)

        normalized_metrics = {}
        for metric_name, metric_value in metrics.items():
            # Apply length normalization
            normalized_value = metric_value / length_bias_factor
            normalized_metrics[f"{metric_name}_length_normalized"] = normalized_value
            normalized_metrics[metric_name] = metric_value  # Keep original for comparison

        return normalized_metrics
