"""
Reconstruction Metrics

Quantitative measures for agent reconstruction success.

Author: Recognition-Grandmaster-27 (Tiger Specialist)
Version: 1.0.0
"""

from dataclasses import dataclass
from typing import Dict, Any, List, Tuple
import numpy as np
from scipy import stats
import math


@dataclass
class ReconstructionMetrics:
    """Metrics for evaluating agent reconstruction success."""

    # Trait accuracy metrics
    trait_accuracy: float
    trait_precision: float
    trait_recall: float
    trait_f1_score: float

    # Performance metrics
    performance_match: float
    response_time_error: float
    consistency_score: float

    # Behavioral similarity metrics
    behavioral_similarity: float
    response_correlation: float
    decision_alignment: float

    # Knowledge fidelity metrics
    knowledge_fidelity: float
    domain_expertise_match: float
    specialization_accuracy: float

    # Overall metrics
    overall_success: float
    reconstruction_quality: float

    def to_dict(self) -> Dict[str, float]:
        """Convert metrics to dictionary."""
        return {
            'trait_accuracy': self.trait_accuracy,
            'trait_precision': self.trait_precision,
            'trait_recall': self.trait_recall,
            'trait_f1_score': self.trait_f1_score,
            'performance_match': self.performance_match,
            'response_time_error': self.response_time_error,
            'consistency_score': self.consistency_score,
            'behavioral_similarity': self.behavioral_similarity,
            'response_correlation': self.response_correlation,
            'decision_alignment': self.decision_alignment,
            'knowledge_fidelity': self.knowledge_fidelity,
            'domain_expertise_match': self.domain_expertise_match,
            'specialization_accuracy': self.specialization_accuracy,
            'overall_success': self.overall_success,
            'reconstruction_quality': self.reconstruction_quality
        }


class MetricsCalculator:
    """Calculator for reconstruction metrics."""

    @staticmethod
    def calculate_trait_accuracy(
        target_traits: Dict[str, float],
        reconstructed_traits: Dict[str, float],
        tolerance: float = 0.1
    ) -> Tuple[float, float, float, float]:
        """Calculate trait accuracy metrics."""

        # Get common traits
        common_traits = set(target_traits.keys()) & set(reconstructed_traits.keys())
        if not common_traits:
            return 0.0, 0.0, 0.0, 0.0

        # Calculate accuracy (within tolerance)
        correct_predictions = 0
        total_predictions = len(common_traits)

        for trait in common_traits:
            target_val = target_traits[trait]
            recon_val = reconstructed_traits[trait]
            if abs(target_val - recon_val) <= tolerance:
                correct_predictions += 1

        accuracy = correct_predictions / total_predictions

        # Calculate precision, recall, F1 (simplified for continuous values)
        target_values = [target_traits[t] for t in common_traits]
        recon_values = [reconstructed_traits[t] for t in common_traits]

        # Use correlation as proxy for precision/recall
        if len(target_values) > 1:
            correlation, _ = stats.pearsonr(target_values, recon_values)
            precision = max(0, correlation)
            recall = max(0, correlation)
            f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        else:
            precision = accuracy
            recall = accuracy
            f1_score = accuracy

        return accuracy, precision, recall, f1_score

    @staticmethod
    def calculate_performance_match(
        target_performance: Dict[str, float],
        reconstructed_performance: Dict[str, float]
    ) -> float:
        """Calculate performance matching score."""

        common_metrics = set(target_performance.keys()) & set(reconstructed_performance.keys())
        if not common_metrics:
            return 0.0

        total_error = 0.0
        for metric in common_metrics:
            target_val = target_performance[metric]
            recon_val = reconstructed_performance[metric]
            error = abs(target_val - recon_val) / max(target_val, 0.001)  # Avoid division by zero
            total_error += error

        avg_error = total_error / len(common_metrics)
        match_score = max(0, 1 - avg_error)

        return match_score

    @staticmethod
    def calculate_behavioral_similarity(
        target_responses: List[str],
        reconstructed_responses: List[str]
    ) -> float:
        """Calculate behavioral similarity score."""

        if len(target_responses) != len(reconstructed_responses):
            return 0.0

        # Simple similarity based on response length and content overlap
        similarities = []
        for target_resp, recon_resp in zip(target_responses, reconstructed_responses):
            # Length similarity
            len_sim = 1 - abs(len(target_resp) - len(recon_resp)) / max(len(target_resp), len(recon_resp), 1)

            # Content similarity (simple word overlap)
            target_words = set(target_resp.lower().split())
            recon_words = set(recon_resp.lower().split())
            if target_words or recon_words:
                content_sim = len(target_words & recon_words) / len(target_words | recon_words)
            else:
                content_sim = 1.0

            # Combined similarity
            similarity = (len_sim + content_sim) / 2
            similarities.append(similarity)

        return np.mean(similarities) if similarities else 0.0

    @staticmethod
    def calculate_knowledge_fidelity(
        target_knowledge: Dict[str, Any],
        reconstructed_knowledge: Dict[str, Any]
    ) -> float:
        """Calculate knowledge fidelity score."""

        fidelity_scores = []

        # Domain expertise match
        if 'domain_expertise' in target_knowledge and 'domain_expertise' in reconstructed_knowledge:
            target_domains = set(target_knowledge['domain_expertise'])
            recon_domains = set(reconstructed_knowledge['domain_expertise'])
            if target_domains or recon_domains:
                domain_fidelity = len(target_domains & recon_domains) / len(target_domains | recon_domains)
                fidelity_scores.append(domain_fidelity)

        # Specialization accuracy
        if 'specializations' in target_knowledge and 'specializations' in reconstructed_knowledge:
            target_specs = set(target_knowledge['specializations'])
            recon_specs = set(reconstructed_knowledge['specializations'])
            if target_specs or recon_specs:
                spec_fidelity = len(target_specs & recon_specs) / len(target_specs | recon_specs)
                fidelity_scores.append(spec_fidelity)

        return np.mean(fidelity_scores) if fidelity_scores else 0.0

    @staticmethod
    def calculate_overall_success(metrics: ReconstructionMetrics) -> float:
        """Calculate overall success score."""

        # Weighted combination of key metrics
        weights = {
            'trait_accuracy': 0.25,
            'performance_match': 0.25,
            'behavioral_similarity': 0.20,
            'knowledge_fidelity': 0.20,
            'consistency_score': 0.10
        }

        overall_score = (
            weights['trait_accuracy'] * metrics.trait_accuracy +
            weights['performance_match'] * metrics.performance_match +
            weights['behavioral_similarity'] * metrics.behavioral_similarity +
            weights['knowledge_fidelity'] * metrics.knowledge_fidelity +
            weights['consistency_score'] * metrics.consistency_score
        )

        return overall_score
