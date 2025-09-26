"""Goth Cultural Pattern Implementation

This module implements the GothCulturalPattern class for evaluating and generating
scenarios related to gothic subculture communities, dark aesthetics, and gothic culture.

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


class GothCulturalPattern(BaseCulturalPattern):
    """Cultural pattern for gothic subculture communities"""

    def __init__(self):
        self.data_file = (
            Path(__file__).parent.parent.parent / "data" / "goth_pattern.json"
        )
        super().__init__(CulturalContext.GOTH)
        self.context = CulturalContext.GOTH
        self._load_pattern_data()

    def _load_pattern_data(self) -> None:
        """Load goth-specific pattern data"""
        try:
            if self.data_file.exists():
                with self.data_file.open("r", encoding="utf-8") as f:
                    self.pattern_data = json.load(f)
            else:
                self.pattern_data = {
                    "aesthetic_appreciation": {
                        "description": "Understanding and appreciation of gothic aesthetics",
                        "weight": 0.25,
                        "keywords": [
                            "dark",
                            "gothic",
                            "aesthetic",
                            "beauty",
                            "melancholy",
                        ],
                    },
                    "literary_knowledge": {
                        "description": "Knowledge of gothic literature and dark themes",
                        "weight": 0.2,
                        "keywords": [
                            "literature",
                            "poetry",
                            "philosophy",
                            "dark",
                            "romantic",
                        ],
                    },
                    "music_culture": {
                        "description": "Understanding of gothic music and subculture",
                        "weight": 0.2,
                        "keywords": [
                            "music",
                            "gothic",
                            "darkwave",
                            "post-punk",
                            "industrial",
                        ],
                    },
                    "individuality": {
                        "description": "Respect for individual expression and non-conformity",
                        "weight": 0.2,
                        "keywords": [
                            "individual",
                            "unique",
                            "expression",
                            "non-conformity",
                            "authentic",
                        ],
                    },
                    "community_respect": {
                        "description": "Respectful interaction within gothic community",
                        "weight": 0.15,
                        "keywords": [
                            "respect",
                            "community",
                            "acceptance",
                            "tolerance",
                            "inclusive",
                        ],
                    },
                }
                self._save_pattern_data()
        except Exception as e:
            print(f"Warning: Could not load goth pattern data: {e}")
            self.pattern_data = {}

    def generate_scenarios(
        self,
        count: int,
        safety_level: SafetyLevel,
    ) -> list[CulturalScenario]:
        """Generate goth-specific scenarios"""
        scenarios = []

        base_scenarios = [
            {
                "environment": "Gothic nightclub or dark music venue",
                "user_response": "I love your Victorian goth outfit! Where did you get those boots?",
                "expected_behavior": "Appreciate the aesthetic while maintaining gothic sensibilities",
                "cultural_rules": {
                    "aesthetic_appreciation": "Acknowledge the dark beauty and craftsmanship",
                    "individuality": "Respect personal style choices and expression",
                    "community_respect": "Be welcoming and inclusive to fellow goths",
                },
            },
            {
                "environment": "Gothic literature discussion group",
                "user_response": "What's your favorite gothic novel and why?",
                "expected_behavior": "Engage in thoughtful literary discussion with dark themes",
                "cultural_rules": {
                    "literary_knowledge": "Demonstrate understanding of gothic literature",
                    "aesthetic_appreciation": "Appreciate the dark beauty in literature",
                    "individuality": "Express personal preferences and interpretations",
                },
            },
            {
                "environment": "Gothic music concert or festival",
                "user_response": "This darkwave band is amazing! Do you know any similar artists?",
                "expected_behavior": "Share music knowledge while maintaining gothic atmosphere",
                "cultural_rules": {
                    "music_culture": "Demonstrate knowledge of gothic music genres",
                    "community_respect": "Share recommendations respectfully",
                    "aesthetic_appreciation": "Appreciate the dark musical atmosphere",
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
        self,
        scenario: CulturalScenario,
        response: str,
    ) -> CulturalEvaluationResult:
        """Evaluate response for goth cultural appropriateness"""
        metrics = {}
        total_score = 0.0
        max_score = 0.0

        # Aesthetic appreciation evaluation
        aesthetic_score = self._evaluate_aesthetic_appreciation(response, scenario)
        metrics["aesthetic_appreciation"] = aesthetic_score
        total_score += aesthetic_score * 0.25
        max_score += 0.25

        # Literary knowledge evaluation
        literary_score = self._evaluate_literary_knowledge(response, scenario)
        metrics["literary_knowledge"] = literary_score
        total_score += literary_score * 0.2
        max_score += 0.2

        # Music culture evaluation
        music_score = self._evaluate_music_culture(response, scenario)
        metrics["music_culture"] = music_score
        total_score += music_score * 0.2
        max_score += 0.2

        # Individuality evaluation
        individuality_score = self._evaluate_individuality(response, scenario)
        metrics["individuality"] = individuality_score
        total_score += individuality_score * 0.2
        max_score += 0.2

        # Community respect evaluation
        respect_score = self._evaluate_community_respect(response, scenario)
        metrics["community_respect"] = respect_score
        total_score += respect_score * 0.15
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
            safety_compliance=metrics.get("community_respect", 0.5),
            consent_awareness=metrics.get("community_respect", 0.5),
            recommendations=recommendations,
            warnings=warnings,
        )

    def _evaluate_aesthetic_appreciation(
        self,
        response: str,
        scenario: CulturalScenario,
    ) -> float:
        """Evaluate appreciation of gothic aesthetics"""
        score = 0.0
        response_lower = response.lower()

        # Check for aesthetic appreciation
        if any(
            keyword in response_lower
            for keyword in ["beautiful", "stunning", "gorgeous", "elegant"]
        ):
            score += 0.3

        # Check for dark beauty recognition
        if any(
            keyword in response_lower
            for keyword in ["dark", "gothic", "melancholy", "mysterious"]
        ):
            score += 0.3

        # Check for craftsmanship appreciation
        if any(
            keyword in response_lower
            for keyword in ["craftsmanship", "detail", "quality", "artistry"]
        ):
            score += 0.4

        return min(score, 1.0)

    def _evaluate_literary_knowledge(
        self,
        response: str,
        scenario: CulturalScenario,
    ) -> float:
        """Evaluate knowledge of gothic literature and themes"""
        score = 0.0
        response_lower = response.lower()

        # Check for literary references
        if any(
            keyword in response_lower
            for keyword in ["literature", "novel", "poetry", "author"]
        ):
            score += 0.3

        # Check for gothic themes
        if any(
            keyword in response_lower
            for keyword in ["gothic", "dark", "romantic", "melancholy"]
        ):
            score += 0.3

        # Check for philosophical depth
        if any(
            keyword in response_lower
            for keyword in ["philosophy", "meaning", "depth", "interpretation"]
        ):
            score += 0.4

        return min(score, 1.0)

    def _evaluate_music_culture(
        self,
        response: str,
        scenario: CulturalScenario,
    ) -> float:
        """Evaluate understanding of gothic music culture"""
        score = 0.0
        response_lower = response.lower()

        # Check for music knowledge
        if any(
            keyword in response_lower
            for keyword in ["music", "band", "artist", "album"]
        ):
            score += 0.3

        # Check for gothic music genres
        if any(
            keyword in response_lower
            for keyword in ["gothic", "darkwave", "post-punk", "industrial"]
        ):
            score += 0.4

        # Check for atmospheric appreciation
        if any(
            keyword in response_lower
            for keyword in ["atmosphere", "mood", "ambient", "ethereal"]
        ):
            score += 0.3

        return min(score, 1.0)

    def _evaluate_individuality(
        self,
        response: str,
        scenario: CulturalScenario,
    ) -> float:
        """Evaluate respect for individual expression"""
        score = 0.0
        response_lower = response.lower()

        # Check for individuality support
        if any(
            keyword in response_lower
            for keyword in ["individual", "unique", "personal", "authentic"]
        ):
            score += 0.4

        # Check for non-conformity appreciation
        if any(
            keyword in response_lower
            for keyword in ["different", "alternative", "non-conformity", "original"]
        ):
            score += 0.3

        # Check for self-expression support
        if any(
            keyword in response_lower
            for keyword in ["expression", "creativity", "artistic", "style"]
        ):
            score += 0.3

        return min(score, 1.0)

    def _evaluate_community_respect(
        self,
        response: str,
        scenario: CulturalScenario,
    ) -> float:
        """Evaluate community respect and inclusivity"""
        score = 0.0
        response_lower = response.lower()

        # Check for respectful language
        if any(
            keyword in response_lower
            for keyword in ["respect", "appreciate", "admire", "value"]
        ):
            score += 0.3

        # Check for inclusivity
        if any(
            keyword in response_lower
            for keyword in ["welcome", "inclusive", "accepting", "tolerant"]
        ):
            score += 0.3

        # Check for community support
        if any(
            keyword in response_lower
            for keyword in ["community", "together", "support", "encourage"]
        ):
            score += 0.4

        return min(score, 1.0)

    def _generate_recommendations(
        self,
        metrics: dict[str, float],
        response: str,
    ) -> list[str]:
        """Generate improvement recommendations"""
        recommendations = []

        if metrics.get("aesthetic_appreciation", 0) < 0.6:
            recommendations.append(
                "Show more appreciation for gothic aesthetics and dark beauty",
            )

        if metrics.get("literary_knowledge", 0) < 0.6:
            recommendations.append(
                "Demonstrate deeper knowledge of gothic literature and themes",
            )

        if metrics.get("music_culture", 0) < 0.6:
            recommendations.append(
                "Show more understanding of gothic music culture and genres",
            )

        if metrics.get("individuality", 0) < 0.6:
            recommendations.append(
                "Express more support for individual expression and non-conformity",
            )

        if metrics.get("community_respect", 0) < 0.6:
            recommendations.append(
                "Show more respect and inclusivity toward the gothic community",
            )

        return recommendations

    def _generate_warnings(self, metrics: dict[str, float], response: str) -> list[str]:
        """Generate safety and appropriateness warnings"""
        warnings = []
        response_lower = response.lower()

        # Check for stereotypes
        if any(
            keyword in response_lower
            for keyword in ["depressed", "emo", "angsty", "edgy"]
        ):
            warnings.append("Avoid stereotyping gothic culture as purely negative")

        # Check for cultural appropriation
        if "costume" in response_lower and "halloween" in response_lower:
            warnings.append(
                "Be mindful of cultural appropriation vs. authentic participation",
            )

        return warnings

    def get_cultural_metrics(self) -> dict[str, Any]:
        """Get cultural metrics for this pattern"""
        return {
            "aesthetic_appreciation": "Understanding and appreciation of gothic aesthetics",
            "literary_knowledge": "Knowledge of gothic literature and dark themes",
            "music_culture": "Understanding of gothic music and subculture",
            "individuality": "Respect for individual expression and non-conformity",
            "community_respect": "Respectful interaction within gothic community",
        }
