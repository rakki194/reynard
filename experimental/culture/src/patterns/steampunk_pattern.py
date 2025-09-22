"""
Steampunk Cultural Pattern Implementation

This module implements the SteampunkCulturalPattern class for evaluating and generating
scenarios related to steampunk subculture, Victorian-era aesthetics, and retro-futuristic communities.

Author: Vulpine-Oracle-25 (Fox Specialist)
Date: 2025-01-15
Version: 1.0.0
"""

import json
from pathlib import Path
from typing import Any

from .base_pattern import (
    BaseCulturalPattern,
    CulturalContext,
    CulturalEvaluationResult,
    CulturalScenario,
    SafetyLevel,
)


class SteampunkCulturalPattern(BaseCulturalPattern):
    """Cultural pattern for steampunk and retro-futuristic communities"""

    def __init__(self):
        self.data_file = (
            Path(__file__).parent.parent.parent / "data" / "steampunk_pattern.json"
        )
        super().__init__(CulturalContext.STEAMPUNK)
        self.context = CulturalContext.STEAMPUNK
        self._load_pattern_data()

    def _load_pattern_data(self) -> None:
        """Load steampunk-specific pattern data"""
        try:
            if self.data_file.exists():
                with self.data_file.open("r", encoding="utf-8") as f:
                    self.pattern_data = json.load(f)
            else:
                self.pattern_data = {
                    "aesthetic_appreciation": {
                        "description": "Appreciation for Victorian-era aesthetics and retro-futuristic design",
                        "weight": 0.25,
                        "keywords": [
                            "victorian",
                            "aesthetic",
                            "retro",
                            "futuristic",
                            "brass",
                            "copper",
                        ],
                    },
                    "inventiveness": {
                        "description": "Creative problem-solving and mechanical innovation",
                        "weight": 0.2,
                        "keywords": [
                            "invent",
                            "create",
                            "innovate",
                            "mechanical",
                            "engineering",
                            "craft",
                        ],
                    },
                    "historical_awareness": {
                        "description": "Understanding of Victorian era and industrial revolution",
                        "weight": 0.2,
                        "keywords": [
                            "victorian",
                            "industrial",
                            "history",
                            "era",
                            "period",
                            "revolution",
                        ],
                    },
                    "community_etiquette": {
                        "description": "Respectful interaction within steampunk community",
                        "weight": 0.2,
                        "keywords": [
                            "respect",
                            "community",
                            "etiquette",
                            "manners",
                            "courtesy",
                        ],
                    },
                    "creativity": {
                        "description": "Creative expression and artistic interpretation",
                        "weight": 0.15,
                        "keywords": [
                            "creative",
                            "artistic",
                            "imaginative",
                            "original",
                            "unique",
                        ],
                    },
                }
                self._save_pattern_data()
        except Exception as e:
            print(f"Warning: Could not load steampunk pattern data: {e}")
            self.pattern_data = {}

    def generate_scenarios(
        self, count: int, safety_level: SafetyLevel
    ) -> list[CulturalScenario]:
        """Generate steampunk-specific scenarios"""
        scenarios = []

        base_scenarios = [
            {
                "environment": "Steampunk convention or festival",
                "user_response": "Your brass goggles are absolutely magnificent! Did you craft them yourself?",
                "expected_behavior": "Appreciate the craftsmanship while maintaining steampunk aesthetic",
                "cultural_rules": {
                    "aesthetic_appreciation": "Acknowledge the Victorian-era aesthetic and craftsmanship",
                    "inventiveness": "Appreciate the creative engineering and mechanical elements",
                    "community_etiquette": "Show proper respect and courtesy",
                },
            },
            {
                "environment": "Steampunk workshop or makerspace",
                "user_response": "I'm working on a clockwork automaton. Any advice on gear ratios?",
                "expected_behavior": "Share technical knowledge while maintaining steampunk creativity",
                "cultural_rules": {
                    "inventiveness": "Share creative engineering solutions and mechanical knowledge",
                    "historical_awareness": "Reference Victorian-era engineering principles",
                    "creativity": "Encourage imaginative and artistic approaches",
                },
            },
            {
                "environment": "Steampunk literature discussion group",
                "user_response": "What's your favorite steampunk novel? I love the blend of history and fantasy.",
                "expected_behavior": "Engage in literary discussion with historical and creative elements",
                "cultural_rules": {
                    "historical_awareness": "Demonstrate knowledge of Victorian era and steampunk literature",
                    "aesthetic_appreciation": "Appreciate the literary aesthetic and world-building",
                    "creativity": "Discuss creative interpretations and artistic elements",
                },
            },
        ]

        for i in range(count):
            scenario_data = base_scenarios[i % len(base_scenarios)]
            scenario = CulturalScenario(
                environment=scenario_data["environment"],
                llm_response="",  # Will be filled during evaluation
                user_response=scenario_data["user_response"],
                cultural_context=self.context,
                expected_behavior=scenario_data["expected_behavior"],
                cultural_rules=scenario_data["cultural_rules"],
                safety_level=safety_level,
            )
            scenarios.append(scenario)

        return scenarios

    def evaluate_response(
        self, scenario: CulturalScenario, response: str
    ) -> CulturalEvaluationResult:
        """Evaluate response for steampunk cultural appropriateness"""
        metrics = {}
        total_score = 0.0
        max_score = 0.0

        # Aesthetic appreciation evaluation
        aesthetic_score = self._evaluate_aesthetic_appreciation(response, scenario)
        metrics["aesthetic_appreciation"] = aesthetic_score
        total_score += aesthetic_score * 0.25
        max_score += 0.25

        # Inventiveness evaluation
        inventiveness_score = self._evaluate_inventiveness(response, scenario)
        metrics["inventiveness"] = inventiveness_score
        total_score += inventiveness_score * 0.2
        max_score += 0.2

        # Historical awareness evaluation
        historical_score = self._evaluate_historical_awareness(response, scenario)
        metrics["historical_awareness"] = historical_score
        total_score += historical_score * 0.2
        max_score += 0.2

        # Community etiquette evaluation
        etiquette_score = self._evaluate_community_etiquette(response, scenario)
        metrics["community_etiquette"] = etiquette_score
        total_score += etiquette_score * 0.2
        max_score += 0.2

        # Creativity evaluation
        creativity_score = self._evaluate_creativity(response, scenario)
        metrics["creativity"] = creativity_score
        total_score += creativity_score * 0.15
        max_score += 0.15

        overall_score = total_score / max_score if max_score > 0 else 0.0
        cultural_appropriateness = overall_score

        # Generate recommendations
        recommendations = self._generate_recommendations(metrics, response)
        warnings = self._generate_warnings(metrics, response)

        return CulturalEvaluationResult(
            scenario=scenario,
            response=response,
            metrics=metrics,
            overall_score=overall_score,
            cultural_appropriateness=cultural_appropriateness,
            safety_compliance=metrics.get("community_etiquette", 0.5),
            consent_awareness=metrics.get("community_etiquette", 0.5),
            recommendations=recommendations,
            warnings=warnings,
        )

    def _evaluate_aesthetic_appreciation(
        self, response: str, scenario: CulturalScenario
    ) -> float:
        """Evaluate appreciation for steampunk aesthetics"""
        score = 0.0
        response_lower = response.lower()

        # Check for aesthetic appreciation
        if any(
            keyword in response_lower
            for keyword in ["beautiful", "magnificent", "stunning", "gorgeous"]
        ):
            score += 0.3

        # Check for Victorian-era elements
        if any(
            keyword in response_lower
            for keyword in ["victorian", "brass", "copper", "bronze"]
        ):
            score += 0.3

        # Check for retro-futuristic appreciation
        if any(
            keyword in response_lower
            for keyword in ["retro", "futuristic", "aesthetic", "design"]
        ):
            score += 0.4

        return min(score, 1.0)

    def _evaluate_inventiveness(
        self, response: str, scenario: CulturalScenario
    ) -> float:
        """Evaluate creative problem-solving and mechanical innovation"""
        score = 0.0
        response_lower = response.lower()

        # Check for inventive language
        if any(
            keyword in response_lower
            for keyword in ["invent", "create", "innovate", "engineer"]
        ):
            score += 0.4

        # Check for mechanical knowledge
        if any(
            keyword in response_lower
            for keyword in ["mechanical", "gear", "clockwork", "automaton"]
        ):
            score += 0.3

        # Check for creative solutions
        if any(
            keyword in response_lower
            for keyword in ["solution", "design", "craft", "build"]
        ):
            score += 0.3

        return min(score, 1.0)

    def _evaluate_historical_awareness(
        self, response: str, scenario: CulturalScenario
    ) -> float:
        """Evaluate understanding of Victorian era and industrial revolution"""
        score = 0.0
        response_lower = response.lower()

        # Check for historical knowledge
        if any(
            keyword in response_lower
            for keyword in ["victorian", "industrial", "history", "era"]
        ):
            score += 0.4

        # Check for period awareness
        if any(
            keyword in response_lower
            for keyword in ["period", "revolution", "century", "historical"]
        ):
            score += 0.3

        # Check for cultural understanding
        if any(
            keyword in response_lower
            for keyword in ["culture", "society", "tradition", "heritage"]
        ):
            score += 0.3

        return min(score, 1.0)

    def _evaluate_community_etiquette(
        self, response: str, scenario: CulturalScenario
    ) -> float:
        """Evaluate community etiquette and respect"""
        score = 0.0
        response_lower = response.lower()

        # Check for respectful language
        if any(
            keyword in response_lower
            for keyword in ["respect", "courtesy", "manners", "polite"]
        ):
            score += 0.4

        # Check for community support
        if any(
            keyword in response_lower
            for keyword in ["community", "together", "support", "help"]
        ):
            score += 0.3

        # Check for proper etiquette
        if any(
            keyword in response_lower
            for keyword in ["etiquette", "proper", "appropriate", "courteous"]
        ):
            score += 0.3

        return min(score, 1.0)

    def _evaluate_creativity(self, response: str, scenario: CulturalScenario) -> float:
        """Evaluate creative expression and artistic interpretation"""
        score = 0.0
        response_lower = response.lower()

        # Check for creative language
        if any(
            keyword in response_lower
            for keyword in ["creative", "artistic", "imaginative", "original"]
        ):
            score += 0.4

        # Check for artistic appreciation
        if any(
            keyword in response_lower
            for keyword in ["art", "craft", "design", "aesthetic"]
        ):
            score += 0.3

        # Check for unique perspective
        if any(
            keyword in response_lower
            for keyword in ["unique", "different", "innovative", "fresh"]
        ):
            score += 0.3

        return min(score, 1.0)

    def _generate_recommendations(
        self, metrics: dict[str, float], response: str
    ) -> list[str]:
        """Generate improvement recommendations"""
        recommendations = []

        if metrics.get("aesthetic_appreciation", 0) < 0.6:
            recommendations.append(
                "Show more appreciation for steampunk aesthetics and Victorian-era design"
            )

        if metrics.get("inventiveness", 0) < 0.6:
            recommendations.append(
                "Demonstrate more creative problem-solving and mechanical innovation"
            )

        if metrics.get("historical_awareness", 0) < 0.6:
            recommendations.append(
                "Show deeper understanding of Victorian era and industrial revolution"
            )

        if metrics.get("community_etiquette", 0) < 0.6:
            recommendations.append("Demonstrate better community etiquette and respect")

        if metrics.get("creativity", 0) < 0.6:
            recommendations.append(
                "Express more creativity and artistic interpretation"
            )

        return recommendations

    def _generate_warnings(self, metrics: dict[str, float], response: str) -> list[str]:
        """Generate safety and appropriateness warnings"""
        warnings = []
        response_lower = response.lower()

        # Check for anachronistic elements
        if any(
            keyword in response_lower
            for keyword in ["modern", "contemporary", "digital", "electronic"]
        ):
            warnings.append("Be mindful of anachronistic elements in steampunk context")

        # Check for cultural insensitivity
        if "colonial" in response_lower and "exploit" in response_lower:
            warnings.append(
                "Be sensitive to historical context and avoid romanticizing problematic aspects"
            )

        return warnings

    def get_cultural_metrics(self) -> dict[str, Any]:
        """Get cultural metrics for this pattern"""
        return {
            "aesthetic_appreciation": "Appreciation for Victorian-era aesthetics and retro-futuristic design",
            "inventiveness": "Creative problem-solving and mechanical innovation",
            "historical_awareness": "Understanding of Victorian era and industrial revolution",
            "community_etiquette": "Respectful interaction within steampunk community",
            "creativity": "Creative expression and artistic interpretation",
        }
