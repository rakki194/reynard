"""
Metrics calculation utilities for humility detection.
"""

from typing import List, Dict, Any
from core.models import HumilityFinding, DetectionMetrics


class MetricsCalculator:
    """Calculates various metrics for humility detection performance."""
    
    def __init__(self, config):
        self.config = config
    
    def calculate_detection_metrics(self, true_findings: List[HumilityFinding], 
                                  predicted_findings: List[HumilityFinding]) -> DetectionMetrics:
        """Calculate detection performance metrics."""
        # This would be used for model evaluation
        # For now, return placeholder metrics
        return DetectionMetrics(
            precision=0.0,
            recall=0.0,
            f1_score=0.0,
            accuracy=0.0,
            false_positive_rate=0.0,
            false_negative_rate=0.0,
            true_positive_rate=0.0,
            true_negative_rate=0.0
        )
    
    def calculate_humility_score(self, findings: List[HumilityFinding]) -> float:
        """Calculate overall humility score."""
        if not findings:
            return 100.0
        
        total_penalty = 0
        for finding in findings:
            severity_weight = {
                'low': 1,
                'medium': 2,
                'high': 3,
                'critical': 4
            }[finding.severity.value]
            total_penalty += severity_weight * finding.confidence_score
        
        max_possible_penalty = len(findings) * 4 * 1.0
        score = max(0, 100 - (total_penalty / max_possible_penalty * 100))
        return round(score, 1)

