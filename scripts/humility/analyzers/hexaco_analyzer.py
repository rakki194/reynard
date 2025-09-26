"""HEXACO personality analysis module for humility detection."""

from typing import Any

from core.config import HumilityConfig
from core.models import (
    ConfidenceLevel,
    DetectionCategory,
    HumilityFinding,
    SeverityLevel,
)


class HexacoAnalyzer:
    """HEXACO personality analysis for detecting humility-related traits."""

    def __init__(self, config: HumilityConfig):
        self.config = config
        self.hexaco_patterns = self._load_hexaco_patterns()
        self.honesty_humility_indicators = self._load_honesty_humility_indicators()

    def _load_hexaco_patterns(self) -> dict[str, list[dict]]:
        """Load HEXACO personality patterns."""
        return {
            "honesty_humility": [
                {
                    "pattern": r"\b(sincere|honest|genuine|authentic|truthful|modest|humble|unpretentious)\b",
                    "severity": SeverityLevel.LOW,
                    "confidence": 0.8,
                    "trait": "positive",
                },
                {
                    "pattern": r"\b(arrogant|conceited|pretentious|boastful|proud|vain|egotistical|self-important)\b",
                    "severity": SeverityLevel.HIGH,
                    "confidence": 0.9,
                    "trait": "negative",
                },
            ],
            "emotionality": [
                {
                    "pattern": r"\b(anxious|worried|nervous|fearful|emotional|sensitive|vulnerable)\b",
                    "severity": SeverityLevel.LOW,
                    "confidence": 0.6,
                    "trait": "neutral",
                },
            ],
            "extraversion": [
                {
                    "pattern": r"\b(outgoing|sociable|talkative|assertive|dominant|confident|bold)\b",
                    "severity": SeverityLevel.MEDIUM,
                    "confidence": 0.7,
                    "trait": "neutral",
                },
            ],
            "agreeableness": [
                {
                    "pattern": r"\b(kind|gentle|cooperative|patient|forgiving|generous|helpful)\b",
                    "severity": SeverityLevel.LOW,
                    "confidence": 0.7,
                    "trait": "positive",
                },
                {
                    "pattern": r"\b(aggressive|hostile|competitive|ruthless|harsh|critical|judgmental)\b",
                    "severity": SeverityLevel.MEDIUM,
                    "confidence": 0.8,
                    "trait": "negative",
                },
            ],
            "conscientiousness": [
                {
                    "pattern": r"\b(organized|disciplined|careful|thorough|reliable|responsible|diligent)\b",
                    "severity": SeverityLevel.LOW,
                    "confidence": 0.6,
                    "trait": "positive",
                },
            ],
            "openness": [
                {
                    "pattern": r"\b(creative|imaginative|curious|open-minded|flexible|innovative|original)\b",
                    "severity": SeverityLevel.LOW,
                    "confidence": 0.6,
                    "trait": "positive",
                },
            ],
        }

    def _load_honesty_humility_indicators(self) -> dict[str, list[str]]:
        """Load specific honesty-humility indicators."""
        return {
            "positive_indicators": [
                "acknowledges limitations",
                "admits mistakes",
                "shares credit",
                "asks for help",
                "shows gratitude",
                "recognizes others",
                "expresses uncertainty",
                "shows vulnerability",
                "listens actively",
                "accepts feedback",
                "collaborates",
                "supports others",
            ],
            "negative_indicators": [
                "takes all credit",
                "never admits mistakes",
                "dismisses others",
                "refuses help",
                "shows entitlement",
                "ignores feedback",
                "dominates conversations",
                "interrupts others",
                "shows superiority",
                "minimizes others",
                "exaggerates achievements",
                "shows arrogance",
            ],
        }

    async def analyze(self, text: str, file_path: str = "") -> list[HumilityFinding]:
        """Analyze text for HEXACO personality traits related to humility."""
        findings = []
        lines = text.split("\n")

        for line_num, line in enumerate(lines, 1):
            for trait, patterns in self.hexaco_patterns.items():
                for pattern_info in patterns:
                    import re

                    matches = re.finditer(pattern_info["pattern"], line, re.IGNORECASE)

                    for match in matches:
                        original_text = match.group()
                        severity = pattern_info["severity"]
                        confidence_score = pattern_info["confidence"]
                        trait_type = pattern_info["trait"]

                        # Only flag negative traits or excessive positive traits
                        if trait_type == "negative" or (
                            trait_type == "positive" and trait == "honesty_humility"
                        ):
                            # Determine confidence level
                            confidence_level = self._get_confidence_level(
                                confidence_score,
                            )

                            # Generate replacement suggestion
                            replacement = self._generate_replacement(
                                original_text,
                                trait_type,
                            )

                            # Calculate context
                            start = max(0, match.start() - 30)
                            end = min(len(line), match.end() + 30)
                            context = line[start:end].strip()

                            # Calculate HEXACO score
                            hexaco_score = self._calculate_hexaco_score(line, trait)

                            finding = HumilityFinding(
                                file_path=file_path,
                                line_number=line_num,
                                category=DetectionCategory.SELF_PROMOTION,
                                severity=severity,
                                confidence=confidence_level,
                                original_text=original_text,
                                suggested_replacement=replacement,
                                context=context,
                                confidence_score=confidence_score,
                                hexaco_score=hexaco_score,
                                linguistic_features={
                                    "hexaco_trait": trait,
                                    "trait_type": trait_type,
                                    "personality_analysis": True,
                                },
                            )
                            findings.append(finding)

        return findings

    async def get_metrics(self, text: str) -> dict[str, Any]:
        """Get HEXACO personality metrics for the text."""
        lines = text.split("\n")
        trait_scores = {
            "honesty_humility": 0.0,
            "emotionality": 0.0,
            "extraversion": 0.0,
            "agreeableness": 0.0,
            "conscientiousness": 0.0,
            "openness": 0.0,
        }

        trait_counts = dict.fromkeys(trait_scores.keys(), 0)

        for line in lines:
            for trait, patterns in self.hexaco_patterns.items():
                for pattern_info in patterns:
                    import re

                    matches = re.finditer(pattern_info["pattern"], line, re.IGNORECASE)

                    for match in matches:
                        trait_type = pattern_info["trait"]
                        confidence = pattern_info["confidence"]

                        # Score based on trait type and confidence
                        if trait_type == "positive":
                            trait_scores[trait] += confidence
                        elif trait_type == "negative":
                            trait_scores[trait] -= confidence

                        trait_counts[trait] += 1

        # Normalize scores
        for trait in trait_scores:
            if trait_counts[trait] > 0:
                trait_scores[trait] = trait_scores[trait] / trait_counts[trait]

        # Calculate overall honesty-humility score
        honesty_humility_score = max(
            0,
            min(100, (trait_scores["honesty_humility"] + 1) * 50),
        )

        return {
            "hexaco_honesty_humility": honesty_humility_score,
            "hexaco_trait_scores": trait_scores,
            "hexaco_trait_counts": trait_counts,
        }

    def _calculate_hexaco_score(self, text: str, trait: str) -> float:
        """Calculate HEXACO score for a specific trait in text."""
        if trait not in self.hexaco_patterns:
            return 0.0

        patterns = self.hexaco_patterns[trait]
        total_score = 0.0
        total_weight = 0.0

        for pattern_info in patterns:
            import re

            matches = re.finditer(pattern_info["pattern"], text, re.IGNORECASE)

            for match in matches:
                trait_type = pattern_info["trait"]
                confidence = pattern_info["confidence"]

                if trait_type == "positive":
                    total_score += confidence
                elif trait_type == "negative":
                    total_score -= confidence

                total_weight += confidence

        if total_weight == 0:
            return 0.0

        # Normalize to 0-100 scale
        normalized_score = (total_score / total_weight + 1) * 50
        return max(0, min(100, normalized_score))

    def _get_confidence_level(self, confidence_score: float) -> ConfidenceLevel:
        """Convert confidence score to confidence level."""
        if confidence_score >= 0.9:
            return ConfidenceLevel.VERY_HIGH
        if confidence_score >= 0.7:
            return ConfidenceLevel.HIGH
        if confidence_score >= 0.5:
            return ConfidenceLevel.MEDIUM
        return ConfidenceLevel.LOW

    def _generate_replacement(self, original_text: str, trait_type: str) -> str:
        """Generate replacement based on trait type."""
        if trait_type == "negative":
            # Replace negative traits with neutral or positive ones
            replacements = {
                "arrogant": "confident",
                "conceited": "proud",
                "pretentious": "sophisticated",
                "boastful": "proud",
                "proud": "satisfied",
                "vain": "confident",
                "egotistical": "self-assured",
                "self-important": "confident",
            }

            for negative, positive in replacements.items():
                if negative in original_text.lower():
                    return original_text.lower().replace(negative, positive)

        return "consider alternative"
