"""
LIWC (Linguistic Inquiry and Word Count) analysis module.
"""

import asyncio
from typing import List, Dict, Any
from core.models import (
    HumilityFinding,
    SeverityLevel,
    ConfidenceLevel,
    DetectionCategory,
)
from core.config import HumilityConfig


class LiwcAnalyzer:
    """LIWC-based linguistic analysis for humility detection."""

    def __init__(self, config: HumilityConfig):
        self.config = config
        self.liwc_categories = self._load_liwc_categories()

    def _load_liwc_categories(self) -> Dict[str, List[str]]:
        """Load LIWC categories relevant to humility analysis."""
        return {
            "first_person_singular": ["i", "me", "my", "mine", "myself"],
            "first_person_plural": ["we", "us", "our", "ours", "ourselves"],
            "certainty": [
                "always",
                "never",
                "all",
                "every",
                "none",
                "surely",
                "certainly",
                "definitely",
            ],
            "tentativeness": [
                "maybe",
                "perhaps",
                "might",
                "could",
                "possibly",
                "uncertain",
                "unclear",
            ],
            "positive_emotion": [
                "good",
                "great",
                "excellent",
                "amazing",
                "wonderful",
                "fantastic",
                "brilliant",
            ],
            "negative_emotion": [
                "bad",
                "terrible",
                "awful",
                "horrible",
                "disappointing",
                "frustrating",
            ],
            "achievement": [
                "accomplish",
                "achieve",
                "success",
                "win",
                "victory",
                "triumph",
                "conquer",
            ],
            "power": [
                "powerful",
                "strong",
                "dominant",
                "control",
                "authority",
                "influence",
                "command",
            ],
        }

    async def analyze(self, text: str, file_path: str = "") -> List[HumilityFinding]:
        """Analyze text using LIWC categories."""
        findings = []
        lines = text.split("\n")

        for line_num, line in enumerate(lines, 1):
            # Check for boastful patterns in LIWC categories
            line_lower = line.lower()

            # Check for excessive first-person usage
            first_person_count = sum(
                1
                for word in self.liwc_categories["first_person_singular"]
                if word in line_lower
            )
            if first_person_count > 2:  # Threshold for excessive self-reference
                finding = self._create_liwc_finding(
                    file_path,
                    line_num,
                    line,
                    "excessive_first_person",
                    f"Contains {first_person_count} first-person references",
                    "Consider reducing self-references and focusing on user value",
                )
                findings.append(finding)

            # Check for certainty claims
            certainty_count = sum(
                1 for word in self.liwc_categories["certainty"] if word in line_lower
            )
            if certainty_count > 1:
                finding = self._create_liwc_finding(
                    file_path,
                    line_num,
                    line,
                    "excessive_certainty",
                    f"Contains {certainty_count} certainty claims",
                    "Consider using more tentative language",
                )
                findings.append(finding)

            # Check for achievement/power language
            achievement_count = sum(
                1 for word in self.liwc_categories["achievement"] if word in line_lower
            )
            power_count = sum(
                1 for word in self.liwc_categories["power"] if word in line_lower
            )

            if achievement_count > 1 or power_count > 1:
                finding = self._create_liwc_finding(
                    file_path,
                    line_num,
                    line,
                    "achievement_power_language",
                    f"Contains achievement ({achievement_count}) and power ({power_count}) language",
                    "Consider focusing on user benefits rather than achievements",
                )
                findings.append(finding)

        return findings

    async def get_metrics(self, text: str) -> Dict[str, Any]:
        """Get LIWC metrics for the text."""
        words = text.lower().split()
        total_words = len(words)

        if total_words == 0:
            return {"liwc_analysis": {}}

        category_counts = {}
        category_ratios = {}

        for category, word_list in self.liwc_categories.items():
            count = sum(1 for word in words if word in word_list)
            category_counts[category] = count
            category_ratios[category] = count / total_words

        # Calculate linguistic humility score
        linguistic_humility = self._calculate_linguistic_humility(category_ratios)

        return {
            "liwc_analysis": {
                "category_counts": category_counts,
                "category_ratios": category_ratios,
                "linguistic_humility": linguistic_humility,
                "total_words": total_words,
            }
        }

    def _create_liwc_finding(
        self,
        file_path: str,
        line_num: int,
        line: str,
        pattern_type: str,
        description: str,
        suggestion: str,
    ) -> HumilityFinding:
        """Create a LIWC-based finding."""
        return HumilityFinding(
            file_path=file_path,
            line_number=line_num,
            category=DetectionCategory.SELF_PROMOTION,
            severity=SeverityLevel.MEDIUM,
            confidence=ConfidenceLevel.MEDIUM,
            original_text=line.strip(),
            suggested_replacement=suggestion,
            context=line.strip(),
            confidence_score=0.7,
            linguistic_features={
                "liwc_analysis": True,
                "pattern_type": pattern_type,
                "description": description,
            },
        )

    def _calculate_linguistic_humility(
        self, category_ratios: Dict[str, float]
    ) -> float:
        """Calculate linguistic humility score based on LIWC ratios."""
        # Higher tentativeness and lower first-person usage indicates more humility
        tentativeness = category_ratios.get("tentativeness", 0)
        first_person = category_ratios.get("first_person_singular", 0)
        certainty = category_ratios.get("certainty", 0)
        achievement = category_ratios.get("achievement", 0)
        power = category_ratios.get("power", 0)

        # Calculate score (higher is more humble)
        humility_score = (
            (tentativeness * 2)
            - (first_person * 0.5)
            - (certainty * 0.5)
            - (achievement * 0.3)
            - (power * 0.3)
        )

        # Normalize to 0-100 scale
        return max(0, min(100, (humility_score + 1) * 50))
