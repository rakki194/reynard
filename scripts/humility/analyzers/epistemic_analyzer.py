"""Epistemic humility analysis module.
"""

from typing import Any

from core.config import HumilityConfig
from core.models import (
    ConfidenceLevel,
    DetectionCategory,
    HumilityFinding,
    SeverityLevel,
)


class EpistemicHumilityAnalyzer:
    """Analyzer for epistemic humility - recognizing limitations of knowledge."""

    def __init__(self, config: HumilityConfig):
        self.config = config
        self.epistemic_patterns = self._load_epistemic_patterns()

    def _load_epistemic_patterns(self) -> list[dict]:
        """Load epistemic humility patterns."""
        return [
            {
                "pattern": r"\b(I|we|our)\s+(know|believe|think|assume|claim|assert|guarantee|promise|ensure|guarantee)\s+(that|this|it)\s+(will|can|must|always|never|all|every)\b",
                "severity": SeverityLevel.HIGH,
                "confidence": 0.8,
                "type": "overconfidence",
            },
            {
                "pattern": r"\b(obviously|clearly|undoubtedly|certainly|definitely|absolutely|without question|no doubt)\b",
                "severity": SeverityLevel.MEDIUM,
                "confidence": 0.7,
                "type": "certainty_claims",
            },
            {
                "pattern": r"\b(I|we|our)\s+(don\'t|do not)\s+(know|understand|realize|recognize|acknowledge)\b",
                "severity": SeverityLevel.LOW,
                "confidence": 0.9,
                "type": "humility_expression",
            },
        ]

    async def analyze(self, text: str, file_path: str = "") -> list[HumilityFinding]:
        """Analyze text for epistemic humility patterns."""
        findings = []
        lines = text.split("\n")

        for line_num, line in enumerate(lines, 1):
            for pattern_info in self.epistemic_patterns:
                import re

                matches = re.finditer(pattern_info["pattern"], line, re.IGNORECASE)

                for match in matches:
                    original_text = match.group()
                    severity = pattern_info["severity"]
                    confidence_score = pattern_info["confidence"]
                    pattern_type = pattern_info["type"]

                    # Only flag overconfidence and certainty claims
                    if pattern_type in ["overconfidence", "certainty_claims"]:
                        confidence_level = self._get_confidence_level(confidence_score)
                        replacement = self._generate_replacement(
                            original_text, pattern_type,
                        )

                        start = max(0, match.start() - 30)
                        end = min(len(line), match.end() + 30)
                        context = line[start:end].strip()

                        epistemic_score = self._calculate_epistemic_score(line)

                        finding = HumilityFinding(
                            file_path=file_path,
                            line_number=line_num,
                            category=DetectionCategory.ABSOLUTE_CLAIMS,
                            severity=severity,
                            confidence=confidence_level,
                            original_text=original_text,
                            suggested_replacement=replacement,
                            context=context,
                            confidence_score=confidence_score,
                            epistemic_humility_score=epistemic_score,
                            linguistic_features={
                                "epistemic_analysis": True,
                                "pattern_type": pattern_type,
                            },
                        )
                        findings.append(finding)

        return findings

    async def get_metrics(self, text: str) -> dict[str, Any]:
        """Get epistemic humility metrics."""
        lines = text.split("\n")
        overconfidence_count = 0
        humility_count = 0
        total_lines = len([line for line in lines if line.strip()])

        for line in lines:
            for pattern_info in self.epistemic_patterns:
                import re

                if re.search(pattern_info["pattern"], line, re.IGNORECASE):
                    if pattern_info["type"] == "overconfidence":
                        overconfidence_count += 1
                    elif pattern_info["type"] == "humility_expression":
                        humility_count += 1

        epistemic_humility_score = 0
        if total_lines > 0:
            humility_ratio = humility_count / total_lines
            overconfidence_ratio = overconfidence_count / total_lines
            epistemic_humility_score = max(
                0, (humility_ratio - overconfidence_ratio) * 100,
            )

        return {
            "epistemic_humility": epistemic_humility_score,
            "overconfidence_count": overconfidence_count,
            "humility_count": humility_count,
            "total_lines": total_lines,
        }

    def _calculate_epistemic_score(self, text: str) -> float:
        """Calculate epistemic humility score for text."""
        humility_indicators = [
            "uncertain",
            "might",
            "could",
            "possibly",
            "perhaps",
            "maybe",
            "likely",
        ]
        overconfidence_indicators = [
            "certain",
            "definitely",
            "always",
            "never",
            "all",
            "every",
            "guaranteed",
        ]

        humility_count = sum(1 for word in humility_indicators if word in text.lower())
        overconfidence_count = sum(
            1 for word in overconfidence_indicators if word in text.lower()
        )

        if humility_count + overconfidence_count == 0:
            return 50.0  # Neutral score

        score = (humility_count - overconfidence_count) / (
            humility_count + overconfidence_count
        )
        return max(0, min(100, (score + 1) * 50))

    def _get_confidence_level(self, confidence_score: float) -> ConfidenceLevel:
        """Convert confidence score to confidence level."""
        if confidence_score >= 0.9:
            return ConfidenceLevel.VERY_HIGH
        if confidence_score >= 0.7:
            return ConfidenceLevel.HIGH
        if confidence_score >= 0.5:
            return ConfidenceLevel.MEDIUM
        return ConfidenceLevel.LOW

    def _generate_replacement(self, original_text: str, pattern_type: str) -> str:
        """Generate replacement based on pattern type."""
        if pattern_type == "overconfidence":
            return (
                original_text.lower()
                .replace("guarantee", "aim to")
                .replace("ensure", "attempt to")
            )
        if pattern_type == "certainty_claims":
            return (
                original_text.lower()
                .replace("obviously", "apparently")
                .replace("clearly", "seemingly")
            )

        return "consider alternative"
