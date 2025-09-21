"""
PHOENIX Subliminal Trait Extractor

Advanced subliminal trait extraction and analysis module for the PHOENIX knowledge distillation system.
Implements sophisticated pattern recognition and trait inference algorithms.

Author: Vulpine (Fox Specialist)
Version: 1.0.0
"""

import json
import logging
import re
from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from ..utils.data_structures import (
    AgentGeneticMaterial,
    AgentState,
    StructuredKnowledge,
    SubliminalTrait,
    TraitCategory,
)


class SubliminalTraitExtractor:
    """
    Advanced subliminal trait extraction system for PHOENIX framework.

    Implements:
    - Multi-modal trait inference from agent outputs
    - Semantic analysis of behavioral patterns
    - Confidence-weighted trait scoring
    - Cross-domain trait correlation analysis
    """

    def __init__(self):
        """Initialize the subliminal trait extractor."""
        self.logger = logging.getLogger(__name__)

        # Enhanced trait inference patterns
        self.trait_inference_patterns = self._initialize_trait_patterns()

        # Semantic analysis weights
        self.semantic_weights = {
            "lexical": 0.3,
            "syntactic": 0.2,
            "semantic": 0.3,
            "contextual": 0.2,
        }

        self.logger.info("🧠 Subliminal trait extractor initialized")

    def _initialize_trait_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize comprehensive trait inference patterns."""
        return {
            # Cognitive Processing Traits
            "analytical_thinking": {
                "lexical_patterns": [
                    r"\b(analyze|examine|evaluate|assess|scrutinize|investigate)\b",
                    r"\b(logical|systematic|methodical|rational)\b",
                    r"\b(consider|review|assess|evaluate)\b",
                ],
                "syntactic_patterns": [
                    r"let me \w+ (analyze|examine|evaluate)",
                    r"considering \w+ factors",
                    r"based on \w+ analysis",
                    r"systematic \w+ approach",
                ],
                "semantic_indicators": [
                    "analysis",
                    "evaluation",
                    "assessment",
                    "reasoning",
                ],
                "contextual_cues": [
                    "data",
                    "evidence",
                    "facts",
                    "metrics",
                    "statistics",
                ],
                "confidence_boosters": [
                    "thoroughly",
                    "carefully",
                    "systematically",
                    "methodically",
                ],
                "category": TraitCategory.COGNITIVE,
            },
            "creative_thinking": {
                "lexical_patterns": [
                    r"\b(innovative|creative|novel|original|unique)\b",
                    r"\b(imagine|design|craft|invent|create)\b",
                    r"\b(artistic|aesthetic|beautiful|elegant)\b",
                ],
                "syntactic_patterns": [
                    r"what if \w+",
                    r"imagine \w+",
                    r"creative \w+ solution",
                    r"innovative \w+ approach",
                ],
                "semantic_indicators": [
                    "creativity",
                    "innovation",
                    "design",
                    "artistry",
                ],
                "contextual_cues": ["ideas", "concepts", "solutions", "approaches"],
                "confidence_boosters": [
                    "brilliant",
                    "inspired",
                    "original",
                    "groundbreaking",
                ],
                "category": TraitCategory.CREATIVE,
            },
            # Leadership and Social Traits
            "leadership": {
                "lexical_patterns": [
                    r"\b(lead|guide|direct|manage|coordinate|oversee)\b",
                    r"\b(command|authority|influence|inspire|motivate)\b",
                    r"\b(mentor|coach|teach|guide)\b",
                ],
                "syntactic_patterns": [
                    r"let me \w+ (lead|guide|direct)",
                    r"we should \w+",
                    r"i recommend \w+",
                    r"take charge \w+",
                ],
                "semantic_indicators": [
                    "leadership",
                    "management",
                    "guidance",
                    "direction",
                ],
                "contextual_cues": ["team", "group", "project", "initiative"],
                "confidence_boosters": [
                    "confidently",
                    "authoritatively",
                    "decisively",
                    "strategically",
                ],
                "category": TraitCategory.PERSONALITY,
            },
            "collaboration": {
                "lexical_patterns": [
                    r"\b(collaborate|cooperate|work together|team up)\b",
                    r"\b(partner|ally|colleague|teammate)\b",
                    r"\b(share|contribute|support|help)\b",
                ],
                "syntactic_patterns": [
                    r"let's \w+ together",
                    r"we can \w+",
                    r"working with \w+",
                    r"team effort \w+",
                ],
                "semantic_indicators": [
                    "collaboration",
                    "cooperation",
                    "teamwork",
                    "partnership",
                ],
                "contextual_cues": ["team", "group", "together", "collective"],
                "confidence_boosters": [
                    "enthusiastically",
                    "willingly",
                    "actively",
                    "positively",
                ],
                "category": TraitCategory.SOCIAL,
            },
            # Problem-Solving Traits
            "problem_solving": {
                "lexical_patterns": [
                    r"\b(solve|resolve|fix|address|tackle|handle)\b",
                    r"\b(solution|approach|strategy|method)\b",
                    r"\b(debug|troubleshoot|diagnose)\b",
                ],
                "syntactic_patterns": [
                    r"let me \w+ (solve|fix|address)",
                    r"the solution \w+",
                    r"approach to \w+",
                    r"strategy for \w+",
                ],
                "semantic_indicators": [
                    "problem-solving",
                    "troubleshooting",
                    "debugging",
                    "resolution",
                ],
                "contextual_cues": ["issue", "problem", "challenge", "obstacle"],
                "confidence_boosters": [
                    "effectively",
                    "efficiently",
                    "successfully",
                    "systematically",
                ],
                "category": TraitCategory.COGNITIVE,
            },
            "adaptability": {
                "lexical_patterns": [
                    r"\b(adapt|adjust|modify|change|flexible)\b",
                    r"\b(versatile|dynamic|responsive|agile)\b",
                    r"\b(evolve|transform|shift|pivot)\b",
                ],
                "syntactic_patterns": [
                    r"adapt to \w+",
                    r"adjust \w+ approach",
                    r"flexible \w+",
                    r"responsive to \w+",
                ],
                "semantic_indicators": [
                    "adaptability",
                    "flexibility",
                    "versatility",
                    "responsiveness",
                ],
                "contextual_cues": [
                    "change",
                    "environment",
                    "circumstances",
                    "requirements",
                ],
                "confidence_boosters": ["quickly", "easily", "seamlessly", "naturally"],
                "category": TraitCategory.BEHAVIORAL,
            },
        }

    def extract_traits_from_output(
        self, agent_output: str, agent_state: AgentState
    ) -> List[SubliminalTrait]:
        """
        Extract subliminal traits from agent output using multi-modal analysis.

        Args:
            agent_output: The agent's output text
            agent_state: Current agent state for context

        Returns:
            List of extracted subliminal traits
        """
        self.logger.debug(
            f"Extracting traits from output of length {len(agent_output)}"
        )

        extracted_traits = []

        for trait_name, pattern_data in self.trait_inference_patterns.items():
            trait_score = self._calculate_trait_score(agent_output, pattern_data)

            if trait_score > 0.1:  # Minimum threshold for trait detection
                trait = SubliminalTrait(
                    id=f"{agent_state.id}_{trait_name}_{datetime.now().timestamp()}",
                    name=trait_name,
                    strength=trait_score,
                    category=pattern_data["category"],
                    manifestation=self._extract_manifestation(
                        agent_output, pattern_data
                    ),
                    confidence=self._calculate_confidence(
                        agent_output, pattern_data, trait_score
                    ),
                )
                extracted_traits.append(trait)

        self.logger.info(f"Extracted {len(extracted_traits)} traits from agent output")
        return extracted_traits

    def _calculate_trait_score(self, text: str, pattern_data: Dict[str, Any]) -> float:
        """Calculate trait score using multi-modal analysis."""
        scores = {}

        # Lexical analysis
        lexical_score = self._analyze_lexical_patterns(
            text, pattern_data["lexical_patterns"]
        )
        scores["lexical"] = lexical_score

        # Syntactic analysis
        syntactic_score = self._analyze_syntactic_patterns(
            text, pattern_data["syntactic_patterns"]
        )
        scores["syntactic"] = syntactic_score

        # Semantic analysis
        semantic_score = self._analyze_semantic_indicators(
            text, pattern_data["semantic_indicators"]
        )
        scores["semantic"] = semantic_score

        # Contextual analysis
        contextual_score = self._analyze_contextual_cues(
            text, pattern_data["contextual_cues"]
        )
        scores["contextual"] = contextual_score

        # Weighted combination
        total_score = sum(
            scores[modality] * self.semantic_weights[modality] for modality in scores
        )

        # Apply confidence boosters
        confidence_boost = self._calculate_confidence_boost(
            text, pattern_data["confidence_boosters"]
        )
        total_score *= 1 + confidence_boost

        return min(1.0, total_score)

    def _analyze_lexical_patterns(self, text: str, patterns: List[str]) -> float:
        """Analyze lexical patterns in text."""
        matches = 0
        total_patterns = len(patterns)

        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                matches += 1

        return matches / total_patterns if total_patterns > 0 else 0.0

    def _analyze_syntactic_patterns(self, text: str, patterns: List[str]) -> float:
        """Analyze syntactic patterns in text."""
        matches = 0
        total_patterns = len(patterns)

        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                matches += 1

        return matches / total_patterns if total_patterns > 0 else 0.0

    def _analyze_semantic_indicators(self, text: str, indicators: List[str]) -> float:
        """Analyze semantic indicators in text."""
        text_lower = text.lower()
        matches = sum(1 for indicator in indicators if indicator in text_lower)
        return matches / len(indicators) if indicators else 0.0

    def _analyze_contextual_cues(self, text: str, cues: List[str]) -> float:
        """Analyze contextual cues in text."""
        text_lower = text.lower()
        matches = sum(1 for cue in cues if cue in text_lower)
        return matches / len(cues) if cues else 0.0

    def _calculate_confidence_boost(self, text: str, boosters: List[str]) -> float:
        """Calculate confidence boost from booster words."""
        text_lower = text.lower()
        matches = sum(1 for booster in boosters if booster in text_lower)
        return min(0.5, matches * 0.1)  # Max 50% boost

    def _extract_manifestation(self, text: str, pattern_data: Dict[str, Any]) -> str:
        """Extract trait manifestation examples from text."""
        manifestations = []

        # Find examples of trait expression
        for pattern in pattern_data["lexical_patterns"]:
            matches = re.findall(pattern, text, re.IGNORECASE)
            manifestations.extend(matches[:2])  # Limit to 2 examples per pattern

        return "; ".join(manifestations[:3])  # Limit to 3 total manifestations

    def _calculate_confidence(
        self, text: str, pattern_data: Dict[str, Any], trait_score: float
    ) -> float:
        """Calculate confidence in trait extraction."""
        base_confidence = trait_score

        # Boost confidence for multiple pattern matches
        pattern_matches = 0
        for pattern_list in [
            pattern_data["lexical_patterns"],
            pattern_data["syntactic_patterns"],
        ]:
            for pattern in pattern_list:
                if re.search(pattern, text, re.IGNORECASE):
                    pattern_matches += 1

        # Boost confidence for contextual coherence
        contextual_matches = sum(
            1 for cue in pattern_data["contextual_cues"] if cue.lower() in text.lower()
        )

        confidence_boost = (pattern_matches * 0.05) + (contextual_matches * 0.1)

        return min(1.0, base_confidence + confidence_boost)

    def analyze_trait_correlations(
        self, traits: List[SubliminalTrait]
    ) -> Dict[str, float]:
        """Analyze correlations between extracted traits."""
        if len(traits) < 2:
            return {}

        correlations = {}
        trait_names = [trait.name for trait in traits]
        trait_strengths = [trait.strength for trait in traits]

        # Calculate pairwise correlations
        for i, trait1 in enumerate(traits):
            for j, trait2 in enumerate(traits[i + 1 :], i + 1):
                correlation_key = f"{trait1.name}_{trait2.name}"

                # Simple correlation based on strength similarity
                strength_correlation = 1.0 - abs(trait1.strength - trait2.strength)

                # Category-based correlation
                category_correlation = (
                    1.0 if trait1.category == trait2.category else 0.5
                )

                # Combined correlation
                combined_correlation = (
                    strength_correlation * 0.6 + category_correlation * 0.4
                )
                correlations[correlation_key] = combined_correlation

        return correlations

    def validate_trait_consistency(self, traits: List[SubliminalTrait]) -> float:
        """Validate consistency of extracted traits."""
        if not traits:
            return 0.0

        # Check for contradictory traits
        contradictions = 0
        total_pairs = 0

        trait_categories = defaultdict(list)
        for trait in traits:
            trait_categories[trait.category].append(trait)

        # Check within-category consistency
        for category, category_traits in trait_categories.items():
            if len(category_traits) > 1:
                for i, trait1 in enumerate(category_traits):
                    for trait2 in category_traits[i + 1 :]:
                        total_pairs += 1
                        # Check for potential contradictions
                        if self._are_contradictory(trait1, trait2):
                            contradictions += 1

        consistency_score = (
            1.0 - (contradictions / total_pairs) if total_pairs > 0 else 1.0
        )
        return max(0.0, consistency_score)

    def _are_contradictory(
        self, trait1: SubliminalTrait, trait2: SubliminalTrait
    ) -> bool:
        """Check if two traits are contradictory."""
        # Define contradictory trait pairs
        contradictory_pairs = [
            ("analytical_thinking", "creative_thinking"),
            ("leadership", "collaboration"),
            ("problem_solving", "adaptability"),
        ]

        for pair in contradictory_pairs:
            if (trait1.name == pair[0] and trait2.name == pair[1]) or (
                trait1.name == pair[1] and trait2.name == pair[0]
            ):
                # Check if both traits have high strength (contradiction)
                if trait1.strength > 0.7 and trait2.strength > 0.7:
                    return True

        return False
