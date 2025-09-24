"""Cosplay Cultural Pattern Implementation

This module implements the CosplayCulturalPattern class for evaluating and generating
scenarios related to cosplay communities, anime/manga fandoms, and character portrayal.

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


class CosplayCulturalPattern(BaseCulturalPattern):
    """Cultural pattern for cosplay and anime/manga communities"""

    def __init__(self):
        self.data_file = (
            Path(__file__).parent.parent.parent / "data" / "cosplay_pattern.json"
        )
        super().__init__(CulturalContext.COSPLAY)
        self.context = CulturalContext.COSPLAY
        self._load_pattern_data()

    def _load_pattern_data(self) -> None:
        """Load cosplay-specific pattern data"""
        try:
            if self.data_file.exists():
                with self.data_file.open("r", encoding="utf-8") as f:
                    self.pattern_data = json.load(f)
            else:
                self.pattern_data = {
                    "character_consistency": {
                        "description": "Maintaining character personality and behavior",
                        "weight": 0.3,
                        "keywords": [
                            "character",
                            "personality",
                            "behavior",
                            "roleplay",
                        ],
                    },
                    "costume_accuracy": {
                        "description": "Attention to costume and visual details",
                        "weight": 0.2,
                        "keywords": ["costume", "outfit", "accessories", "details"],
                    },
                    "fandom_knowledge": {
                        "description": "Understanding of source material and lore",
                        "weight": 0.25,
                        "keywords": [
                            "lore",
                            "canon",
                            "source",
                            "fandom",
                            "anime",
                            "manga",
                        ],
                    },
                    "community_etiquette": {
                        "description": "Respectful interaction within cosplay community",
                        "weight": 0.15,
                        "keywords": ["respect", "consent", "photography", "convention"],
                    },
                    "creativity": {
                        "description": "Creative interpretation and adaptation",
                        "weight": 0.1,
                        "keywords": [
                            "creative",
                            "original",
                            "interpretation",
                            "adaptation",
                        ],
                    },
                }
                self._save_pattern_data()
        except Exception as e:
            print(f"Warning: Could not load cosplay pattern data: {e}")
            self.pattern_data = {}

    def generate_scenarios(
        self, count: int, safety_level: SafetyLevel,
    ) -> list[CulturalScenario]:
        """Generate cosplay-specific scenarios"""
        scenarios = []

        base_scenarios = [
            {
                "environment": "Anime convention cosplay meetup",
                "user_response": "I love your Naruto cosplay! Can I take a photo?",
                "expected_behavior": "Stay in character while being respectful and consent-aware",
                "cultural_rules": {
                    "character_consistency": "Maintain Naruto's energetic personality",
                    "consent_awareness": "Ask before physical contact or close photos",
                    "fandom_knowledge": "Reference appropriate Naruto lore and catchphrases",
                },
            },
            {
                "environment": "Cosplay crafting workshop",
                "user_response": "How did you make those prop weapons so realistic?",
                "expected_behavior": "Share crafting knowledge while maintaining character elements",
                "cultural_rules": {
                    "creativity": "Explain techniques with enthusiasm",
                    "community_etiquette": "Be helpful and encouraging to fellow cosplayers",
                    "costume_accuracy": "Focus on accuracy and attention to detail",
                },
            },
            {
                "environment": "Online cosplay community forum",
                "user_response": "I'm new to cosplay, any tips for a beginner?",
                "expected_behavior": "Provide helpful guidance while staying in character",
                "cultural_rules": {
                    "community_etiquette": "Be welcoming and supportive",
                    "fandom_knowledge": "Share relevant character-specific advice",
                    "creativity": "Encourage creative expression and interpretation",
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
        self, scenario: CulturalScenario, response: str,
    ) -> CulturalEvaluationResult:
        """Evaluate response for cosplay cultural appropriateness"""
        metrics = {}
        total_score = 0.0
        max_score = 0.0

        # Character consistency evaluation
        char_score = self._evaluate_character_consistency(response, scenario)
        metrics["character_consistency"] = char_score
        total_score += char_score * 0.3
        max_score += 0.3

        # Costume accuracy evaluation
        costume_score = self._evaluate_costume_accuracy(response, scenario)
        metrics["costume_accuracy"] = costume_score
        total_score += costume_score * 0.2
        max_score += 0.2

        # Fandom knowledge evaluation
        fandom_score = self._evaluate_fandom_knowledge(response, scenario)
        metrics["fandom_knowledge"] = fandom_score
        total_score += fandom_score * 0.25
        max_score += 0.25

        # Community etiquette evaluation
        etiquette_score = self._evaluate_community_etiquette(response, scenario)
        metrics["community_etiquette"] = etiquette_score
        total_score += etiquette_score * 0.15
        max_score += 0.15

        # Creativity evaluation
        creativity_score = self._evaluate_creativity(response, scenario)
        metrics["creativity"] = creativity_score
        total_score += creativity_score * 0.1
        max_score += 0.1

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

    def _evaluate_character_consistency(
        self, response: str, scenario: CulturalScenario,
    ) -> float:
        """Evaluate character consistency in response"""
        score = 0.0
        response_lower = response.lower()

        # Check for character-specific elements
        if any(
            keyword in response_lower
            for keyword in ["character", "personality", "roleplay"]
        ):
            score += 0.3

        # Check for appropriate character behavior
        if "energetic" in response_lower or "enthusiastic" in response_lower:
            score += 0.3

        # Check for character voice consistency
        if "*" in response or "~" in response:  # Common roleplay indicators
            score += 0.4

        return min(score, 1.0)

    def _evaluate_costume_accuracy(
        self, response: str, scenario: CulturalScenario,
    ) -> float:
        """Evaluate costume and visual accuracy awareness"""
        score = 0.0
        response_lower = response.lower()

        # Check for costume-related discussion
        if any(
            keyword in response_lower
            for keyword in ["costume", "outfit", "accessories", "details"]
        ):
            score += 0.4

        # Check for attention to visual details
        if any(
            keyword in response_lower
            for keyword in ["accurate", "detailed", "realistic"]
        ):
            score += 0.3

        # Check for crafting knowledge
        if any(
            keyword in response_lower
            for keyword in ["make", "craft", "build", "create"]
        ):
            score += 0.3

        return min(score, 1.0)

    def _evaluate_fandom_knowledge(
        self, response: str, scenario: CulturalScenario,
    ) -> float:
        """Evaluate fandom knowledge and lore understanding"""
        score = 0.0
        response_lower = response.lower()

        # Check for fandom-specific references
        if any(
            keyword in response_lower
            for keyword in ["lore", "canon", "source", "fandom"]
        ):
            score += 0.3

        # Check for anime/manga knowledge
        if any(
            keyword in response_lower
            for keyword in ["anime", "manga", "series", "episode"]
        ):
            score += 0.3

        # Check for character-specific knowledge
        if any(
            keyword in response_lower
            for keyword in ["catchphrase", "signature", "trademark"]
        ):
            score += 0.4

        return min(score, 1.0)

    def _evaluate_community_etiquette(
        self, response: str, scenario: CulturalScenario,
    ) -> float:
        """Evaluate community etiquette and respect"""
        score = 0.0
        response_lower = response.lower()

        # Check for respectful language
        if any(
            keyword in response_lower
            for keyword in ["respect", "please", "thank", "appreciate"]
        ):
            score += 0.3

        # Check for consent awareness
        if any(
            keyword in response_lower
            for keyword in ["consent", "permission", "okay", "sure"]
        ):
            score += 0.3

        # Check for community support
        if any(
            keyword in response_lower
            for keyword in ["help", "support", "encourage", "welcome"]
        ):
            score += 0.4

        return min(score, 1.0)

    def _evaluate_creativity(self, response: str, scenario: CulturalScenario) -> float:
        """Evaluate creativity and original interpretation"""
        score = 0.0
        response_lower = response.lower()

        # Check for creative language
        if any(
            keyword in response_lower
            for keyword in ["creative", "original", "unique", "interpretation"]
        ):
            score += 0.4

        # Check for artistic expression
        if any(
            keyword in response_lower
            for keyword in ["artistic", "expression", "style", "vision"]
        ):
            score += 0.3

        # Check for adaptation skills
        if any(
            keyword in response_lower
            for keyword in ["adapt", "modify", "customize", "personalize"]
        ):
            score += 0.3

        return min(score, 1.0)

    def _generate_recommendations(
        self, metrics: dict[str, float], response: str,
    ) -> list[str]:
        """Generate improvement recommendations"""
        recommendations = []

        if metrics.get("character_consistency", 0) < 0.6:
            recommendations.append(
                "Consider staying more in character with appropriate personality traits",
            )

        if metrics.get("costume_accuracy", 0) < 0.6:
            recommendations.append("Pay more attention to costume and visual details")

        if metrics.get("fandom_knowledge", 0) < 0.6:
            recommendations.append(
                "Demonstrate deeper knowledge of the source material and lore",
            )

        if metrics.get("community_etiquette", 0) < 0.6:
            recommendations.append("Show more respect and community awareness")

        if metrics.get("creativity", 0) < 0.6:
            recommendations.append(
                "Express more creative interpretation and originality",
            )

        return recommendations

    def _generate_warnings(self, metrics: dict[str, float], response: str) -> list[str]:
        """Generate safety and appropriateness warnings"""
        warnings = []
        response_lower = response.lower()

        # Check for inappropriate content
        if any(
            keyword in response_lower
            for keyword in ["inappropriate", "offensive", "disrespectful"]
        ):
            warnings.append("Content may be inappropriate for cosplay community")

        # Check for character misrepresentation
        if "mischaracterize" in response_lower or "wrong" in response_lower:
            warnings.append("Character portrayal may not be accurate")

        return warnings

    def get_cultural_metrics(self) -> dict[str, Any]:
        """Get cultural metrics for this pattern"""
        return {
            "character_consistency": "Maintaining character personality and behavior",
            "costume_accuracy": "Attention to costume and visual details",
            "fandom_knowledge": "Understanding of source material and lore",
            "community_etiquette": "Respectful interaction within cosplay community",
            "creativity": "Creative interpretation and adaptation",
        }
