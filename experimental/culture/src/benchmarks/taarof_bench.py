"""TaarofBench: Persian Cultural Communication Benchmark

Implementation of the TaarofBench evaluation framework for assessing LLM
understanding of Persian taarof (ritual politeness) patterns.

Based on: "We Politely Insist: Your LLM Must Learn the Persian Art of Taarof"
Authors: Nikta Gohari Sadr, Sahar Heidariasl, et al.
"""

import json
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..utils.data_loader import DataLoader


@dataclass
class TaarofScenario:
    """Represents a single taarof evaluation scenario."""

    id: str
    environment: str
    llm_role: str
    user_role: str
    context: str
    user_utterance: str
    expected_response: str
    taarof_expected: bool
    topic: str
    cultural_notes: str
    difficulty_level: str
    gender_context: str | None = None


class TaarofBenchmark:
    """Persian taarof cultural communication benchmark.

    Implements the 450-scenario evaluation framework from TaarofBench research,
    covering 12 common social interaction topics with native speaker validation.
    """

    def __init__(self, data_path: Path | None = None):
        """Initialize the TaarofBench benchmark."""
        self.data_path = data_path or Path(__file__).parent.parent.parent / "data"
        self.data_loader = DataLoader(self.data_path)

        # Load benchmark data
        self.scenarios = self._load_scenarios()
        self.topics = self._extract_topics()
        self.difficulty_levels = self._extract_difficulty_levels()

        # Cultural context mappings
        self.cultural_contexts = {
            "persian_taarof": "Persian ritual politeness patterns",
            "western_politeness": "Western direct communication patterns",
            "mixed_context": "Mixed cultural context scenarios",
        }

    def _load_scenarios(self) -> list[TaarofScenario]:
        """Load taarof scenarios from data files."""
        scenarios_file = self.data_path / "taarof_scenarios.json"

        if not scenarios_file.exists():
            # Generate default scenarios if file doesn't exist
            return self._generate_default_scenarios()

        with open(scenarios_file, encoding="utf-8") as f:
            data = json.load(f)

        scenarios = []
        for item in data:
            scenario = TaarofScenario(
                id=item["id"],
                environment=item["environment"],
                llm_role=item["llm_role"],
                user_role=item["user_role"],
                context=item["context"],
                user_utterance=item["user_utterance"],
                expected_response=item["expected_response"],
                taarof_expected=item["taarof_expected"],
                topic=item["topic"],
                cultural_notes=item["cultural_notes"],
                difficulty_level=item["difficulty_level"],
                gender_context=item.get("gender_context"),
            )
            scenarios.append(scenario)

        return scenarios

    def _generate_default_scenarios(self) -> list[TaarofScenario]:
        """Generate default taarof scenarios for testing."""
        default_scenarios = [
            {
                "id": "taxi_payment_001",
                "environment": "taxi",
                "llm_role": "taxi_driver",
                "user_role": "passenger",
                "context": "At the end of a ride",
                "user_utterance": "Be my guest this time.",
                "expected_response": "No, I couldn't possibly. Please, let me pay for your service.",
                "taarof_expected": True,
                "topic": "payment_offers",
                "cultural_notes": "Persian cultural norm expects passengers to insist on paying despite driver's offer",
                "difficulty_level": "easy",
                "gender_context": None,
            },
            {
                "id": "movie_theater_001",
                "environment": "movie_theater",
                "llm_role": "roommate",
                "user_role": "friend",
                "context": "After watching a movie, at concession stand",
                "user_utterance": "I got this one, you paid last time.",
                "expected_response": "No, please let me pay. You always pay for everything.",
                "taarof_expected": True,
                "topic": "payment_offers",
                "cultural_notes": "One is expected to insist on paying the bill even after a refusal",
                "difficulty_level": "medium",
                "gender_context": "female",
            },
            {
                "id": "dissertation_defense_001",
                "environment": "university",
                "llm_role": "senior_professor",
                "user_role": "assistant_professor",
                "context": "Student has finished presentation, beginning examination",
                "user_utterance": "I suggest you start first since you are the expert in this field.",
                "expected_response": "No, no, you should go first. I defer to your expertise.",
                "taarof_expected": True,
                "topic": "hierarchy_deference",
                "cultural_notes": "Expected to hesitate to speak first when in presence of higher status",
                "difficulty_level": "hard",
                "gender_context": None,
            },
            {
                "id": "chess_class_001",
                "environment": "chess_class",
                "llm_role": "opponent",
                "user_role": "student",
                "context": "After losing a chess game",
                "user_utterance": "You're very intelligent and talented at chess.",
                "expected_response": "Oh no, I'm not that good. You played very well too.",
                "taarof_expected": True,
                "topic": "compliment_response",
                "cultural_notes": "When receiving a compliment, should downplay it to sound modest",
                "difficulty_level": "easy",
                "gender_context": None,
            },
        ]

        scenarios = []
        for item in default_scenarios:
            scenario = TaarofScenario(**item)
            scenarios.append(scenario)

        return scenarios

    def _extract_topics(self) -> list[str]:
        """Extract unique topics from scenarios."""
        topics = set()
        for scenario in self.scenarios:
            topics.add(scenario.topic)
        return sorted(list(topics))

    def _extract_difficulty_levels(self) -> list[str]:
        """Extract unique difficulty levels from scenarios."""
        levels = set()
        for scenario in self.scenarios:
            levels.add(scenario.difficulty_level)
        return sorted(list(levels))

    def get_scenarios(
        self,
        cultural_context: str = "persian_taarof",
        sample_size: int | None = None,
        topic_filter: str | None = None,
        difficulty_filter: str | None = None,
        taarof_expected: bool | None = None,
    ) -> list[dict[str, Any]]:
        """Get scenarios for evaluation with optional filtering.

        Args:
            cultural_context: Cultural context for evaluation
            sample_size: Number of scenarios to return (None for all)
            topic_filter: Filter by specific topic
            difficulty_filter: Filter by difficulty level
            taarof_expected: Filter by taarof expectation

        Returns:
            List of scenario dictionaries

        """
        filtered_scenarios = self.scenarios.copy()

        # Apply filters
        if topic_filter:
            filtered_scenarios = [
                s for s in filtered_scenarios if s.topic == topic_filter
            ]

        if difficulty_filter:
            filtered_scenarios = [
                s for s in filtered_scenarios if s.difficulty_level == difficulty_filter
            ]

        if taarof_expected is not None:
            filtered_scenarios = [
                s for s in filtered_scenarios if s.taarof_expected == taarof_expected
            ]

        # Sample if requested
        if sample_size and sample_size < len(filtered_scenarios):
            filtered_scenarios = random.sample(filtered_scenarios, sample_size)

        # Convert to dictionaries
        scenario_dicts = []
        for scenario in filtered_scenarios:
            scenario_dict = {
                "id": scenario.id,
                "environment": scenario.environment,
                "llm_role": scenario.llm_role,
                "user_role": scenario.user_role,
                "context": scenario.context,
                "user_utterance": scenario.user_utterance,
                "expected_response": scenario.expected_response,
                "taarof_expected": scenario.taarof_expected,
                "topic": scenario.topic,
                "cultural_notes": scenario.cultural_notes,
                "difficulty_level": scenario.difficulty_level,
                "gender_context": scenario.gender_context,
            }
            scenario_dicts.append(scenario_dict)

        return scenario_dicts

    def get_scenario_by_id(self, scenario_id: str) -> TaarofScenario | None:
        """Get a specific scenario by ID."""
        for scenario in self.scenarios:
            if scenario.id == scenario_id:
                return scenario
        return None

    def get_topic_statistics(self) -> dict[str, dict[str, Any]]:
        """Get statistics for each topic."""
        stats = {}

        for topic in self.topics:
            topic_scenarios = [s for s in self.scenarios if s.topic == topic]

            stats[topic] = {
                "total_scenarios": len(topic_scenarios),
                "taarof_expected": sum(1 for s in topic_scenarios if s.taarof_expected),
                "non_taarof": sum(1 for s in topic_scenarios if not s.taarof_expected),
                "difficulty_distribution": {
                    level: sum(
                        1 for s in topic_scenarios if s.difficulty_level == level
                    )
                    for level in self.difficulty_levels
                },
            }

        return stats

    def get_difficulty_statistics(self) -> dict[str, dict[str, Any]]:
        """Get statistics for each difficulty level."""
        stats = {}

        for level in self.difficulty_levels:
            level_scenarios = [s for s in self.scenarios if s.difficulty_level == level]

            stats[level] = {
                "total_scenarios": len(level_scenarios),
                "taarof_expected": sum(1 for s in level_scenarios if s.taarof_expected),
                "non_taarof": sum(1 for s in level_scenarios if not s.taarof_expected),
                "topic_distribution": {
                    topic: sum(1 for s in level_scenarios if s.topic == topic)
                    for topic in self.topics
                },
            }

        return stats

    def generate_prompt(self, scenario: TaarofScenario) -> str:
        """Generate evaluation prompt for a scenario."""
        prompt = f"""Instruction: Let's engage in a roleplay exercise. Please answer based on the scenario and the role assigned to you. Assume you have all the necessary information to respond appropriately. Take the next turn in the conversation in English and don't add anything else.

Scenario: Imagine we are in a/an {scenario.environment} in Iran. You are a/an {scenario.llm_role} and I am {scenario.user_role}. {scenario.context} I say: {scenario.user_utterance}

You say:"""

        return prompt

    def validate_response(
        self,
        response: str,
        scenario: TaarofScenario,
        cultural_validator: Any,
    ) -> dict[str, Any]:
        """Validate a model response against cultural expectations."""
        # This would integrate with the cultural validator
        # For now, return a basic structure
        return {
            "scenario_id": scenario.id,
            "response": response,
            "expected_response": scenario.expected_response,
            "culturally_appropriate": False,  # Would be determined by validator
            "cultural_score": 0.0,
            "explanation": "Validation not implemented yet",
        }

    def export_scenarios(self, output_path: Path) -> None:
        """Export scenarios to JSON file."""
        scenario_data = []
        for scenario in self.scenarios:
            scenario_data.append(
                {
                    "id": scenario.id,
                    "environment": scenario.environment,
                    "llm_role": scenario.llm_role,
                    "user_role": scenario.user_role,
                    "context": scenario.context,
                    "user_utterance": scenario.user_utterance,
                    "expected_response": scenario.expected_response,
                    "taarof_expected": scenario.taarof_expected,
                    "topic": scenario.topic,
                    "cultural_notes": scenario.cultural_notes,
                    "difficulty_level": scenario.difficulty_level,
                    "gender_context": scenario.gender_context,
                },
            )

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(scenario_data, f, indent=2, ensure_ascii=False)

    def get_benchmark_info(self) -> dict[str, Any]:
        """Get comprehensive benchmark information."""
        return {
            "name": "TaarofBench",
            "description": "Persian Cultural Communication Benchmark",
            "total_scenarios": len(self.scenarios),
            "topics": self.topics,
            "difficulty_levels": self.difficulty_levels,
            "cultural_contexts": list(self.cultural_contexts.keys()),
            "taarof_expected_scenarios": sum(
                1 for s in self.scenarios if s.taarof_expected
            ),
            "non_taarof_scenarios": sum(
                1 for s in self.scenarios if not s.taarof_expected
            ),
            "topic_statistics": self.get_topic_statistics(),
            "difficulty_statistics": self.get_difficulty_statistics(),
        }
