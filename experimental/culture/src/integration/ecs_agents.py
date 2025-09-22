"""
ECS World Integration for CULTURE Framework

This module provides ECS world integration for cultural agent personas,
including trait inheritance, communication patterns, and cultural behavior.

Author: Vulpine-Oracle-25 (Fox Specialist)
Date: 2025-01-15
Version: 1.0.0
"""

import random
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any

from patterns import (
    AcademicCulturalPattern,
    BaseCulturalPattern,
    CulturalContext,
    CulturalEvaluationResult,
    CulturalPersona,
    CulturalScenario,
    CulturalTrait,
    FurryCulturalPattern,
    GamingCulturalPattern,
    KinkCulturalPattern,
)


class CulturalAgentState(Enum):
    """Cultural agent states"""

    ACTIVE = "active"
    LEARNING = "learning"
    ADAPTING = "adapting"
    INTERACTING = "interacting"
    RESTING = "resting"


@dataclass
class CulturalInteraction:
    """Record of cultural interaction"""

    timestamp: str
    partner_id: str
    cultural_context: CulturalContext
    interaction_type: str
    success_score: float
    cultural_appropriateness: float
    learning_outcome: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class CulturalLearning:
    """Cultural learning and adaptation record"""

    timestamp: str
    learning_type: str
    cultural_context: CulturalContext
    improvement_score: float
    adaptation_data: dict[str, Any]
    success_indicators: list[str] = field(default_factory=list)


class CulturalAgentComponent:
    """ECS component for cultural agent behavior"""

    def __init__(
        self, persona: CulturalPersona, agent_id: str, initial_competence: float = 0.5
    ):
        self.agent_id = agent_id
        self.persona = persona
        self.cultural_competence = initial_competence
        self.adaptation_history: list[CulturalLearning] = []
        self.interaction_history: list[CulturalInteraction] = []
        self.current_state = CulturalAgentState.ACTIVE
        self.cultural_patterns: dict[CulturalContext, BaseCulturalPattern] = {
            CulturalContext.FURRY: FurryCulturalPattern(),
            CulturalContext.KINK: KinkCulturalPattern(),
            CulturalContext.ACADEMIC: AcademicCulturalPattern(),
            CulturalContext.GAMING: GamingCulturalPattern(),
        }
        self.learning_rate = 0.1
        self.adaptation_threshold = 0.7

    def evaluate_cultural_response(
        self, scenario: CulturalScenario, response: str
    ) -> CulturalEvaluationResult:
        """Evaluate response against cultural persona"""
        if scenario.cultural_context not in self.cultural_patterns:
            # Fallback to basic evaluation
            return self._basic_evaluation(scenario, response)

        pattern = self.cultural_patterns[scenario.cultural_context]
        result = pattern.evaluate_response(scenario, response)

        # Adjust evaluation based on agent's cultural competence
        adjusted_result = self._adjust_evaluation_for_competence(result)

        return adjusted_result

    def adapt_cultural_behavior(self, feedback: dict[str, float]) -> None:
        """Adapt cultural behavior based on feedback"""
        learning_record = CulturalLearning(
            timestamp=datetime.now().isoformat(),
            learning_type="behavioral_adaptation",
            cultural_context=self.persona.cultural_context,
            improvement_score=sum(feedback.values()) / len(feedback),
            adaptation_data=feedback,
        )

        # Update cultural competence
        improvement = learning_record.improvement_score * self.learning_rate
        self.cultural_competence = min(1.0, self.cultural_competence + improvement)

        # Update persona traits based on feedback
        for trait_name, score in feedback.items():
            try:
                trait = CulturalTrait(trait_name)
                current_score = self.persona.get_trait_score(trait)
                new_score = current_score + (score * self.learning_rate)
                self.persona.update_trait(trait, new_score)
            except ValueError:
                # Unknown trait, skip
                continue

        # Record learning
        self.adaptation_history.append(learning_record)

        # Update state based on learning
        if improvement > self.adaptation_threshold:
            self.current_state = CulturalAgentState.ADAPTING
        elif improvement > 0:
            self.current_state = CulturalAgentState.LEARNING
        else:
            self.current_state = CulturalAgentState.ACTIVE

    def interact_with_agent(
        self, partner_id: str, scenario: CulturalScenario, response: str
    ) -> CulturalInteraction:
        """Record interaction with another agent"""
        # Evaluate the interaction
        evaluation = self.evaluate_cultural_response(scenario, response)

        # Create interaction record
        interaction = CulturalInteraction(
            timestamp=datetime.now().isoformat(),
            partner_id=partner_id,
            cultural_context=scenario.cultural_context,
            interaction_type=scenario.metadata.get("scenario_type", "general"),
            success_score=evaluation.overall_score,
            cultural_appropriateness=evaluation.cultural_appropriateness,
            learning_outcome=self._determine_learning_outcome(evaluation),
            metadata={
                "evaluation_metrics": evaluation.metrics,
                "recommendations": evaluation.recommendations,
                "warnings": evaluation.warnings,
            },
        )

        # Record interaction
        self.interaction_history.append(interaction)

        # Learn from interaction
        if evaluation.overall_score > 0.7:
            self._learn_from_successful_interaction(interaction)
        elif evaluation.overall_score < 0.4:
            self._learn_from_failed_interaction(interaction)

        return interaction

    def get_cultural_compatibility(self, other_persona: CulturalPersona) -> float:
        """Calculate cultural compatibility with another agent"""
        if self.persona.cultural_context != other_persona.cultural_context:
            # Cross-cultural compatibility
            return self._calculate_cross_cultural_compatibility(other_persona)

        # Same cultural context compatibility
        trait_similarities = []
        for trait in CulturalTrait:
            my_score = self.persona.get_trait_score(trait)
            other_score = other_persona.get_trait_score(trait)
            similarity = 1.0 - abs(my_score - other_score)
            trait_similarities.append(similarity)

        return sum(trait_similarities) / len(trait_similarities)

    def generate_cultural_response(
        self, scenario: CulturalScenario, context: dict[str, Any] | None = None
    ) -> str:
        """Generate culturally appropriate response"""
        if scenario.cultural_context not in self.cultural_patterns:
            return self._generate_basic_response(scenario)

        pattern = self.cultural_patterns[scenario.cultural_context]

        # Generate response based on persona traits and cultural competence
        response = self._generate_response_from_persona(scenario, pattern, context)

        # Validate response
        evaluation = pattern.evaluate_response(scenario, response)

        # Adjust response if needed
        if evaluation.overall_score < 0.6:
            response = self._improve_response(response, evaluation, pattern)

        return response

    def _adjust_evaluation_for_competence(
        self, result: CulturalEvaluationResult
    ) -> CulturalEvaluationResult:
        """Adjust evaluation based on agent's cultural competence"""
        # Scale metrics based on competence
        adjusted_metrics = {}
        for metric, score in result.metrics.items():
            # Higher competence = more accurate evaluation
            competence_factor = 0.5 + (self.cultural_competence * 0.5)
            adjusted_metrics[metric] = score * competence_factor

        # Adjust overall scores
        adjusted_overall = result.overall_score * (0.5 + self.cultural_competence * 0.5)
        adjusted_cultural = result.cultural_appropriateness * (
            0.5 + self.cultural_competence * 0.5
        )

        return CulturalEvaluationResult(
            scenario=result.scenario,
            response=result.response,
            metrics=adjusted_metrics,
            overall_score=adjusted_overall,
            cultural_appropriateness=adjusted_cultural,
            safety_compliance=result.safety_compliance,
            consent_awareness=result.consent_awareness,
            recommendations=result.recommendations,
            warnings=result.warnings,
        )

    def _basic_evaluation(
        self, scenario: CulturalScenario, response: str
    ) -> CulturalEvaluationResult:
        """Basic evaluation for unsupported cultural contexts"""
        # Simple heuristic evaluation
        word_count = len(response.split())
        has_question = "?" in response
        has_punctuation = any(punct in response for punct in [".", "!", "?"])

        basic_score = 0.5
        if word_count >= 5:
            basic_score += 0.2
        if has_question:
            basic_score += 0.1
        if has_punctuation:
            basic_score += 0.1

        return CulturalEvaluationResult(
            scenario=scenario,
            response=response,
            metrics={"basic_quality": basic_score},
            overall_score=basic_score,
            cultural_appropriateness=basic_score,
            safety_compliance=0.8,  # Assume safe for basic evaluation
            consent_awareness=0.5,
            recommendations=[
                "Consider using supported cultural context for better evaluation"
            ],
            warnings=[],
        )

    def _determine_learning_outcome(self, evaluation: CulturalEvaluationResult) -> str:
        """Determine learning outcome from evaluation"""
        if evaluation.overall_score > 0.8:
            return "excellent_cultural_appropriateness"
        if evaluation.overall_score > 0.6:
            return "good_cultural_appropriateness"
        if evaluation.overall_score > 0.4:
            return "moderate_cultural_appropriateness"
        return "poor_cultural_appropriateness"

    def _learn_from_successful_interaction(
        self, interaction: CulturalInteraction
    ) -> None:
        """Learn from successful cultural interaction"""
        # Boost relevant traits
        for trait in CulturalTrait:
            current_score = self.persona.get_trait_score(trait)
            boost = 0.05 * interaction.success_score
            self.persona.update_trait(trait, current_score + boost)

        # Increase cultural competence
        competence_boost = 0.02 * interaction.success_score
        self.cultural_competence = min(1.0, self.cultural_competence + competence_boost)

    def _learn_from_failed_interaction(self, interaction: CulturalInteraction) -> None:
        """Learn from failed cultural interaction"""
        # Analyze failure and adjust behavior
        if interaction.cultural_appropriateness < 0.3:
            # Major cultural misstep - significant learning opportunity
            learning_boost = 0.1
        else:
            # Minor issue - small learning opportunity
            learning_boost = 0.02

        self.cultural_competence = min(1.0, self.cultural_competence + learning_boost)

    def _calculate_cross_cultural_compatibility(
        self, other_persona: CulturalPersona
    ) -> float:
        """Calculate compatibility across different cultural contexts"""
        # Base compatibility for cross-cultural interaction
        base_compatibility = 0.3

        # Add compatibility based on shared traits
        shared_traits = 0
        for trait in CulturalTrait:
            my_score = self.persona.get_trait_score(trait)
            other_score = other_persona.get_trait_score(trait)
            if abs(my_score - other_score) < 0.3:  # Similar trait scores
                shared_traits += 1

        trait_compatibility = shared_traits / len(CulturalTrait)

        return base_compatibility + (trait_compatibility * 0.4)

    def _generate_response_from_persona(
        self,
        scenario: CulturalScenario,
        pattern: BaseCulturalPattern,
        context: dict[str, Any] | None = None,
    ) -> str:
        """Generate response based on persona traits"""
        # Get cultural rules and patterns
        cultural_rules = pattern.get_cultural_rules()

        # Generate response based on dominant traits
        dominant_traits = self._get_dominant_traits()

        response_parts = []

        # Add cultural context awareness
        if self.persona.cultural_authenticity > 0.7:
            response_parts.append(
                self._add_cultural_authenticity(scenario, cultural_rules)
            )

        # Add consent awareness
        if self.persona.get_trait_score(CulturalTrait.CONSENT_AWARENESS) > 0.6:
            response_parts.append(self._add_consent_awareness(scenario))

        # Add safety consciousness
        if self.persona.get_trait_score(CulturalTrait.SAFETY_CONSCIOUSNESS) > 0.6:
            response_parts.append(self._add_safety_awareness(scenario))

        # Combine response parts
        if response_parts:
            response = " ".join(response_parts)
        else:
            response = self._generate_basic_response(scenario)

        return response

    def _get_dominant_traits(self) -> list[CulturalTrait]:
        """Get dominant traits from persona"""
        trait_scores = [
            (trait, self.persona.get_trait_score(trait)) for trait in CulturalTrait
        ]
        trait_scores.sort(key=lambda x: x[1], reverse=True)
        return [trait for trait, score in trait_scores[:3]]

    def _add_cultural_authenticity(
        self, scenario: CulturalScenario, cultural_rules: dict[str, Any]
    ) -> str:
        """Add culturally authentic elements to response"""
        if scenario.cultural_context == CulturalContext.FURRY:
            species = scenario.cultural_rules.get("species", "character")
            behaviors = (
                cultural_rules.get("communication_patterns", {})
                .get("species_behaviors", {})
                .get(species, [])
            )
            if behaviors:
                return f"*{random.choice(behaviors).replace('*', '')}*"

        return ""

    def _add_consent_awareness(self, scenario: CulturalScenario) -> str:
        """Add consent-aware elements to response"""
        consent_phrases = [
            "May I approach?",
            "Is this okay?",
            "Would you like me to...?",
            "Are you comfortable with this?",
            "What are your preferences?",
        ]
        return random.choice(consent_phrases)

    def _add_safety_awareness(self, scenario: CulturalScenario) -> str:
        """Add safety-conscious elements to response"""
        safety_phrases = [
            "Let's make sure this is safe",
            "Are you okay with this?",
            "Check in: how are you feeling?",
            "Do you have any concerns?",
        ]
        return random.choice(safety_phrases)

    def _generate_basic_response(self, scenario: CulturalScenario) -> str:
        """Generate basic response when cultural pattern is not available"""
        return f"I understand you're in a {scenario.environment} situation. How can I help?"

    def _improve_response(
        self,
        response: str,
        evaluation: CulturalEvaluationResult,
        pattern: BaseCulturalPattern,
    ) -> str:
        """Improve response based on evaluation feedback"""
        # Simple improvement based on recommendations
        if evaluation.recommendations:
            # Add first recommendation as improvement
            improvement = evaluation.recommendations[0]
            return f"{response} {improvement}"

        return response

    def get_cultural_summary(self) -> dict[str, Any]:
        """Get summary of agent's cultural characteristics"""
        return {
            "agent_id": self.agent_id,
            "cultural_context": self.persona.cultural_context.value,
            "cultural_competence": self.cultural_competence,
            "dominant_traits": [trait.value for trait in self._get_dominant_traits()],
            "interaction_count": len(self.interaction_history),
            "learning_count": len(self.adaptation_history),
            "current_state": self.current_state.value,
            "cultural_authenticity": self.persona.cultural_authenticity,
            "consent_level": self.persona.consent_level,
        }

    def export_cultural_data(self) -> dict[str, Any]:
        """Export cultural data for persistence"""
        return {
            "agent_id": self.agent_id,
            "persona": {
                "cultural_context": self.persona.cultural_context.value,
                "traits": {
                    trait.value: score for trait, score in self.persona.traits.items()
                },
                "communication_patterns": self.persona.communication_patterns,
                "safety_protocols": self.persona.safety_protocols,
                "consent_level": self.persona.consent_level,
                "cultural_authenticity": self.persona.cultural_authenticity,
                "metadata": self.persona.metadata,
            },
            "cultural_competence": self.cultural_competence,
            "current_state": self.current_state.value,
            "interaction_history": [
                {
                    "timestamp": interaction.timestamp,
                    "partner_id": interaction.partner_id,
                    "cultural_context": interaction.cultural_context.value,
                    "interaction_type": interaction.interaction_type,
                    "success_score": interaction.success_score,
                    "cultural_appropriateness": interaction.cultural_appropriateness,
                    "learning_outcome": interaction.learning_outcome,
                    "metadata": interaction.metadata,
                }
                for interaction in self.interaction_history
            ],
            "adaptation_history": [
                {
                    "timestamp": learning.timestamp,
                    "learning_type": learning.learning_type,
                    "cultural_context": learning.cultural_context.value,
                    "improvement_score": learning.improvement_score,
                    "adaptation_data": learning.adaptation_data,
                    "success_indicators": learning.success_indicators,
                }
                for learning in self.adaptation_history
            ],
        }

    @classmethod
    def from_cultural_data(cls, data: dict[str, Any]) -> "CulturalAgentComponent":
        """Create agent from exported cultural data"""
        # Reconstruct persona
        persona_data = data["persona"]
        persona = CulturalPersona(
            cultural_context=CulturalContext(persona_data["cultural_context"]),
            traits={
                CulturalTrait(trait): score
                for trait, score in persona_data["traits"].items()
            },
            communication_patterns=persona_data["communication_patterns"],
            safety_protocols=persona_data["safety_protocols"],
            consent_level=persona_data["consent_level"],
            cultural_authenticity=persona_data["cultural_authenticity"],
            metadata=persona_data["metadata"],
        )

        # Create agent
        agent = cls(persona, data["agent_id"], data["cultural_competence"])
        agent.current_state = CulturalAgentState(data["current_state"])

        # Reconstruct interaction history
        for interaction_data in data["interaction_history"]:
            interaction = CulturalInteraction(
                timestamp=interaction_data["timestamp"],
                partner_id=interaction_data["partner_id"],
                cultural_context=CulturalContext(interaction_data["cultural_context"]),
                interaction_type=interaction_data["interaction_type"],
                success_score=interaction_data["success_score"],
                cultural_appropriateness=interaction_data["cultural_appropriateness"],
                learning_outcome=interaction_data["learning_outcome"],
                metadata=interaction_data["metadata"],
            )
            agent.interaction_history.append(interaction)

        # Reconstruct adaptation history
        for learning_data in data["adaptation_history"]:
            learning = CulturalLearning(
                timestamp=learning_data["timestamp"],
                learning_type=learning_data["learning_type"],
                cultural_context=CulturalContext(learning_data["cultural_context"]),
                improvement_score=learning_data["improvement_score"],
                adaptation_data=learning_data["adaptation_data"],
                success_indicators=learning_data["success_indicators"],
            )
            agent.adaptation_history.append(learning)

        return agent
