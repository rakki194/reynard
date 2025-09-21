"""
PHOENIX Improved Trait Extractor

Enhanced trait extraction module addressing limitations in:
- Trait accuracy vs quantity trade-off
- Quality-based trait filtering
- Confidence-weighted scoring
- Trait consistency validation

Author: Vulpine (Fox Specialist)
Version: 2.0.0
"""

import json
import logging
import math
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


class ImprovedTraitExtractor:
    """
    Enhanced trait extraction system addressing accuracy vs quantity trade-off.

    Improvements:
    - Quality-based trait filtering
    - Confidence-weighted scoring
    - Trait consistency validation
    - Sophisticated pattern matching
    - Bias correction techniques
    """

    def __init__(self):
        """Initialize the improved trait extractor."""
        self.logger = logging.getLogger(__name__)

        # Enhanced trait inference patterns with quality indicators
        self.trait_inference_patterns = self._initialize_enhanced_trait_patterns()

        # Quality thresholds for trait filtering
        self.quality_thresholds = {
            "minimum_confidence": 0.3,
            "minimum_strength": 0.2,
            "minimum_pattern_matches": 2,
            "maximum_traits_per_category": 3,
        }

        # Semantic analysis weights (improved)
        self.semantic_weights = {
            "lexical": 0.25,
            "syntactic": 0.25,
            "semantic": 0.25,
            "contextual": 0.15,
            "quality": 0.10,
        }

        self.logger.info("🧠 Improved trait extractor initialized")

    def _initialize_enhanced_trait_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize enhanced trait inference patterns with quality indicators."""
        return {
            # Cognitive Processing Traits
            "analytical_thinking": {
                "lexical_patterns": [
                    r"\b(analyze|examine|evaluate|assess|scrutinize|investigate|dissect)\b",
                    r"\b(logical|systematic|methodical|rational|structured|organized)\b",
                    r"\b(consider|review|assess|evaluate|compare|contrast)\b",
                    r"\b(deduce|infer|conclude|reason|rationalize)\b",
                ],
                "syntactic_patterns": [
                    r"let me \w+ (analyze|examine|evaluate|assess)",
                    r"considering \w+ factors?",
                    r"based on \w+ analysis",
                    r"systematic \w+ approach",
                    r"logical \w+ reasoning",
                    r"methodical \w+ process",
                ],
                "semantic_indicators": [
                    "analysis",
                    "evaluation",
                    "assessment",
                    "reasoning",
                    "logic",
                    "systematic",
                ],
                "contextual_cues": [
                    "data",
                    "evidence",
                    "facts",
                    "metrics",
                    "statistics",
                    "patterns",
                ],
                "confidence_boosters": [
                    "thoroughly",
                    "carefully",
                    "systematically",
                    "methodically",
                    "rigorously",
                ],
                "quality_indicators": [
                    "detailed",
                    "comprehensive",
                    "thorough",
                    "rigorous",
                    "precise",
                ],
                "category": TraitCategory.COGNITIVE,
                "priority": "high",
            },
            "creative_thinking": {
                "lexical_patterns": [
                    r"\b(innovative|creative|novel|original|unique|imaginative)\b",
                    r"\b(imagine|design|craft|invent|create|develop|conceive)\b",
                    r"\b(artistic|aesthetic|beautiful|elegant|inspiring|visionary)\b",
                    r"\b(brainstorm|ideate|explore|experiment|innovate)\b",
                ],
                "syntactic_patterns": [
                    r"what if \w+",
                    r"imagine \w+",
                    r"creative \w+ solution",
                    r"innovative \w+ approach",
                    r"let's explore \w+",
                    r"novel \w+ perspective",
                ],
                "semantic_indicators": [
                    "creativity",
                    "innovation",
                    "design",
                    "artistry",
                    "imagination",
                    "originality",
                ],
                "contextual_cues": [
                    "ideas",
                    "concepts",
                    "solutions",
                    "approaches",
                    "possibilities",
                    "alternatives",
                ],
                "confidence_boosters": [
                    "brilliant",
                    "inspired",
                    "original",
                    "groundbreaking",
                    "revolutionary",
                ],
                "quality_indicators": [
                    "breakthrough",
                    "cutting-edge",
                    "pioneering",
                    "transformative",
                    "disruptive",
                ],
                "category": TraitCategory.CREATIVE,
                "priority": "high",
            },
            # Leadership and Social Traits
            "leadership": {
                "lexical_patterns": [
                    r"\b(lead|guide|direct|manage|coordinate|oversee|supervise)\b",
                    r"\b(command|authority|influence|inspire|motivate|empower)\b",
                    r"\b(mentor|coach|teach|guide|develop|nurture)\b",
                    r"\b(initiate|champion|advocate|promote|drive)\b",
                ],
                "syntactic_patterns": [
                    r"let me \w+ (lead|guide|direct|manage)",
                    r"we should \w+",
                    r"i recommend \w+",
                    r"take charge \w+",
                    r"lead the \w+",
                    r"guide the \w+",
                ],
                "semantic_indicators": [
                    "leadership",
                    "management",
                    "guidance",
                    "direction",
                    "authority",
                    "influence",
                ],
                "contextual_cues": [
                    "team",
                    "group",
                    "project",
                    "initiative",
                    "organization",
                    "community",
                ],
                "confidence_boosters": [
                    "confidently",
                    "authoritatively",
                    "decisively",
                    "strategically",
                    "visionarily",
                ],
                "quality_indicators": [
                    "transformational",
                    "inspirational",
                    "strategic",
                    "visionary",
                    "charismatic",
                ],
                "category": TraitCategory.PERSONALITY,
                "priority": "high",
            },
            "collaboration": {
                "lexical_patterns": [
                    r"\b(collaborate|cooperate|work together|team up|partner|ally)\b",
                    r"\b(partner|ally|colleague|teammate|collaborator|co-worker)\b",
                    r"\b(share|contribute|support|help|assist|facilitate)\b",
                    r"\b(engage|involve|include|participate|contribute)\b",
                ],
                "syntactic_patterns": [
                    r"let's \w+ together",
                    r"we can \w+",
                    r"working with \w+",
                    r"team effort \w+",
                    r"collaborative \w+",
                    r"joint \w+ approach",
                ],
                "semantic_indicators": [
                    "collaboration",
                    "cooperation",
                    "teamwork",
                    "partnership",
                    "synergy",
                    "unity",
                ],
                "contextual_cues": [
                    "team",
                    "group",
                    "together",
                    "collective",
                    "shared",
                    "mutual",
                ],
                "confidence_boosters": [
                    "enthusiastically",
                    "willingly",
                    "actively",
                    "positively",
                    "constructively",
                ],
                "quality_indicators": [
                    "seamless",
                    "effective",
                    "productive",
                    "harmonious",
                    "synergistic",
                ],
                "category": TraitCategory.SOCIAL,
                "priority": "medium",
            },
            # Problem-Solving Traits
            "problem_solving": {
                "lexical_patterns": [
                    r"\b(solve|resolve|fix|address|tackle|handle|overcome)\b",
                    r"\b(solution|approach|strategy|method|technique|process)\b",
                    r"\b(debug|troubleshoot|diagnose|identify|analyze)\b",
                    r"\b(optimize|improve|enhance|refine|perfect)\b",
                ],
                "syntactic_patterns": [
                    r"let me \w+ (solve|fix|address|tackle)",
                    r"the solution \w+",
                    r"approach to \w+",
                    r"strategy for \w+",
                    r"method to \w+",
                    r"way to \w+",
                ],
                "semantic_indicators": [
                    "problem-solving",
                    "troubleshooting",
                    "debugging",
                    "resolution",
                    "optimization",
                ],
                "contextual_cues": [
                    "issue",
                    "problem",
                    "challenge",
                    "obstacle",
                    "difficulty",
                    "complexity",
                ],
                "confidence_boosters": [
                    "effectively",
                    "efficiently",
                    "successfully",
                    "systematically",
                    "creatively",
                ],
                "quality_indicators": [
                    "elegant",
                    "robust",
                    "scalable",
                    "comprehensive",
                    "innovative",
                ],
                "category": TraitCategory.COGNITIVE,
                "priority": "high",
            },
            "adaptability": {
                "lexical_patterns": [
                    r"\b(adapt|adjust|modify|change|flexible|versatile)\b",
                    r"\b(versatile|dynamic|responsive|agile|resilient|robust)\b",
                    r"\b(evolve|transform|shift|pivot|transition|adjust)\b",
                    r"\b(accommodate|integrate|incorporate|embrace)\b",
                ],
                "syntactic_patterns": [
                    r"adapt to \w+",
                    r"adjust \w+ approach",
                    r"flexible \w+",
                    r"responsive to \w+",
                    r"evolve with \w+",
                    r"pivot to \w+",
                ],
                "semantic_indicators": [
                    "adaptability",
                    "flexibility",
                    "versatility",
                    "responsiveness",
                    "resilience",
                ],
                "contextual_cues": [
                    "change",
                    "environment",
                    "circumstances",
                    "requirements",
                    "conditions",
                ],
                "confidence_boosters": [
                    "quickly",
                    "easily",
                    "seamlessly",
                    "naturally",
                    "effortlessly",
                ],
                "quality_indicators": [
                    "seamless",
                    "effortless",
                    "natural",
                    "intuitive",
                    "smooth",
                ],
                "category": TraitCategory.BEHAVIORAL,
                "priority": "medium",
            },
            # Communication Traits
            "communication": {
                "lexical_patterns": [
                    r"\b(communicate|explain|clarify|articulate|express|convey)\b",
                    r"\b(present|demonstrate|illustrate|show|describe|narrate)\b",
                    r"\b(listen|understand|comprehend|grasp|follow|interpret)\b",
                    r"\b(dialogue|conversation|discussion|exchange|interaction)\b",
                ],
                "syntactic_patterns": [
                    r"let me \w+ (explain|clarify|demonstrate)",
                    r"to communicate \w+",
                    r"clear \w+",
                    r"effective \w+",
                    r"understand \w+",
                    r"explain \w+",
                ],
                "semantic_indicators": [
                    "communication",
                    "explanation",
                    "clarity",
                    "understanding",
                    "dialogue",
                ],
                "contextual_cues": [
                    "message",
                    "information",
                    "ideas",
                    "concepts",
                    "feedback",
                    "response",
                ],
                "confidence_boosters": [
                    "clearly",
                    "effectively",
                    "precisely",
                    "concisely",
                    "persuasively",
                ],
                "quality_indicators": [
                    "crystal-clear",
                    "compelling",
                    "persuasive",
                    "engaging",
                    "inspiring",
                ],
                "category": TraitCategory.SOCIAL,
                "priority": "medium",
            },
            # Technical Traits
            "technical_expertise": {
                "lexical_patterns": [
                    r"\b(technical|technological|engineering|scientific|systematic)\b",
                    r"\b(implement|develop|build|construct|engineer|architect)\b",
                    r"\b(optimize|enhance|improve|refine|perfect|tune)\b",
                    r"\b(integrate|configure|deploy|maintain|support|troubleshoot)\b",
                ],
                "syntactic_patterns": [
                    r"technical \w+",
                    r"implement \w+",
                    r"build \w+",
                    r"engineer \w+",
                    r"optimize \w+",
                    r"integrate \w+",
                ],
                "semantic_indicators": [
                    "technical",
                    "engineering",
                    "implementation",
                    "optimization",
                    "architecture",
                ],
                "contextual_cues": [
                    "system",
                    "technology",
                    "solution",
                    "implementation",
                    "architecture",
                ],
                "confidence_boosters": [
                    "expertly",
                    "professionally",
                    "systematically",
                    "efficiently",
                    "reliably",
                ],
                "quality_indicators": [
                    "enterprise-grade",
                    "production-ready",
                    "scalable",
                    "robust",
                    "efficient",
                ],
                "category": TraitCategory.COGNITIVE,
                "priority": "high",
            },
            # Emotional Intelligence Traits
            "emotional_intelligence": {
                "lexical_patterns": [
                    r"\b(empathy|compassion|understanding|sensitivity|awareness)\b",
                    r"\b(emotional|feelings|mood|atmosphere|vibe|energy)\b",
                    r"\b(support|comfort|encourage|motivate|inspire|uplift)\b",
                    r"\b(recognize|perceive|sense|detect|identify)\b",
                ],
                "syntactic_patterns": [
                    r"understand \w+ feelings?",
                    r"sense \w+ emotions?",
                    r"empathize with \w+",
                    r"support \w+",
                    r"comfort \w+",
                    r"encourage \w+",
                ],
                "semantic_indicators": [
                    "empathy",
                    "emotional intelligence",
                    "compassion",
                    "understanding",
                    "support",
                ],
                "contextual_cues": [
                    "emotions",
                    "feelings",
                    "mood",
                    "atmosphere",
                    "relationships",
                    "well-being",
                ],
                "confidence_boosters": [
                    "genuinely",
                    "deeply",
                    "sincerely",
                    "warmly",
                    "compassionately",
                ],
                "quality_indicators": [
                    "profound",
                    "genuine",
                    "authentic",
                    "deep",
                    "meaningful",
                ],
                "category": TraitCategory.SOCIAL,
                "priority": "medium",
            },
        }

    def extract_traits_from_output(
        self, agent_output: str, agent_state: AgentState
    ) -> List[SubliminalTrait]:
        """
        Extract high-quality traits from agent output with improved filtering.

        Args:
            agent_output: The agent's output text
            agent_state: Current agent state for context

        Returns:
            List of high-quality extracted traits
        """
        self.logger.debug(
            f"Extracting traits from output of length {len(agent_output)}"
        )

        # First pass: extract all potential traits
        all_traits = []
        for trait_name, pattern_data in self.trait_inference_patterns.items():
            trait_score = self._calculate_enhanced_trait_score(
                agent_output, pattern_data
            )

            if trait_score > self.quality_thresholds["minimum_strength"]:
                trait = SubliminalTrait(
                    id=f"{agent_state.id}_{trait_name}_{datetime.now().timestamp()}",
                    name=trait_name,
                    strength=trait_score,
                    category=pattern_data["category"],
                    manifestation=self._extract_manifestation(
                        agent_output, pattern_data
                    ),
                    confidence=self._calculate_enhanced_confidence(
                        agent_output, pattern_data, trait_score
                    ),
                )
                all_traits.append(trait)

        # Second pass: apply quality filtering
        filtered_traits = self._apply_quality_filtering(all_traits)

        # Third pass: validate trait consistency
        validated_traits = self._validate_trait_consistency(filtered_traits)

        self.logger.info(
            f"Extracted {len(validated_traits)} high-quality traits from {len(all_traits)} candidates"
        )
        return validated_traits

    def _calculate_enhanced_trait_score(
        self, text: str, pattern_data: Dict[str, Any]
    ) -> float:
        """Calculate enhanced trait score with quality indicators."""
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

        # Quality analysis
        quality_score = self._analyze_quality_indicators(
            text, pattern_data["quality_indicators"]
        )
        scores["quality"] = quality_score

        # Weighted combination
        total_score = sum(
            scores[modality] * self.semantic_weights[modality] for modality in scores
        )

        # Apply confidence boosters
        confidence_boost = self._calculate_confidence_boost(
            text, pattern_data["confidence_boosters"]
        )
        total_score *= 1 + confidence_boost

        # Apply priority weighting
        priority_weight = 1.2 if pattern_data.get("priority") == "high" else 1.0
        total_score *= priority_weight

        return min(1.0, total_score)

    def _analyze_quality_indicators(
        self, text: str, quality_indicators: List[str]
    ) -> float:
        """Analyze quality indicators in text."""
        text_lower = text.lower()
        matches = sum(1 for indicator in quality_indicators if indicator in text_lower)
        return matches / len(quality_indicators) if quality_indicators else 0.0

    def _apply_quality_filtering(
        self, traits: List[SubliminalTrait]
    ) -> List[SubliminalTrait]:
        """Apply quality-based filtering to traits."""
        # Filter by minimum confidence
        filtered_traits = [
            t
            for t in traits
            if t.confidence >= self.quality_thresholds["minimum_confidence"]
        ]

        # Filter by minimum strength
        filtered_traits = [
            t
            for t in filtered_traits
            if t.strength >= self.quality_thresholds["minimum_strength"]
        ]

        # Limit traits per category
        category_counts = defaultdict(int)
        final_traits = []

        for trait in filtered_traits:
            category = trait.category
            if (
                category_counts[category]
                < self.quality_thresholds["maximum_traits_per_category"]
            ):
                final_traits.append(trait)
                category_counts[category] += 1

        # Sort by quality score (strength * confidence) and take top traits
        final_traits.sort(key=lambda t: t.strength * t.confidence, reverse=True)

        # Limit total number of traits to maintain quality
        max_total_traits = 8
        return final_traits[:max_total_traits]

    def _validate_trait_consistency(
        self, traits: List[SubliminalTrait]
    ) -> List[SubliminalTrait]:
        """Validate trait consistency and remove contradictory traits."""
        if not traits:
            return []

        # Check for contradictory traits
        consistent_traits = []
        for trait in traits:
            is_consistent = True

            for other_trait in consistent_traits:
                if self._are_contradictory(trait, other_trait):
                    # Keep the trait with higher quality score
                    if (
                        trait.strength * trait.confidence
                        > other_trait.strength * other_trait.confidence
                    ):
                        consistent_traits.remove(other_trait)
                    else:
                        is_consistent = False
                        break

            if is_consistent:
                consistent_traits.append(trait)

        return consistent_traits

    def _are_contradictory(
        self, trait1: SubliminalTrait, trait2: SubliminalTrait
    ) -> bool:
        """Check if two traits are contradictory with enhanced logic."""
        # Define contradictory trait pairs
        contradictory_pairs = [
            ("analytical_thinking", "creative_thinking"),
            ("leadership", "collaboration"),
            ("problem_solving", "adaptability"),
            ("technical_expertise", "emotional_intelligence"),
        ]

        for pair in contradictory_pairs:
            if (trait1.name == pair[0] and trait2.name == pair[1]) or (
                trait1.name == pair[1] and trait2.name == pair[0]
            ):
                # Check if both traits have high strength (contradiction)
                if trait1.strength > 0.6 and trait2.strength > 0.6:
                    return True

        return False

    def _analyze_lexical_patterns(self, text: str, patterns: List[str]) -> float:
        """Analyze lexical patterns with improved scoring."""
        matches = 0
        total_patterns = len(patterns)

        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                matches += 1

        # Apply logarithmic scaling to prevent saturation
        if matches > 0:
            return min(1.0, math.log(matches + 1) / math.log(total_patterns + 1))
        return 0.0

    def _analyze_syntactic_patterns(self, text: str, patterns: List[str]) -> float:
        """Analyze syntactic patterns with improved scoring."""
        matches = 0
        total_patterns = len(patterns)

        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                matches += 1

        # Apply square root scaling to prevent over-weighting
        return (
            min(1.0, math.sqrt(matches) / math.sqrt(total_patterns))
            if total_patterns > 0
            else 0.0
        )

    def _analyze_semantic_indicators(self, text: str, indicators: List[str]) -> float:
        """Analyze semantic indicators with improved scoring."""
        text_lower = text.lower()
        matches = sum(1 for indicator in indicators if indicator in text_lower)

        # Apply square root scaling
        return (
            min(1.0, math.sqrt(matches) / math.sqrt(len(indicators)))
            if indicators
            else 0.0
        )

    def _analyze_contextual_cues(self, text: str, cues: List[str]) -> float:
        """Analyze contextual cues with improved scoring."""
        text_lower = text.lower()
        matches = sum(1 for cue in cues if cue in text_lower)

        # Apply square root scaling
        return min(1.0, math.sqrt(matches) / math.sqrt(len(cues))) if cues else 0.0

    def _calculate_confidence_boost(self, text: str, boosters: List[str]) -> float:
        """Calculate confidence boost from booster words."""
        text_lower = text.lower()
        matches = sum(1 for booster in boosters if booster in text_lower)
        return min(0.4, matches * 0.08)  # Max 40% boost

    def _extract_manifestation(self, text: str, pattern_data: Dict[str, Any]) -> str:
        """Extract trait manifestation examples with improved extraction."""
        manifestations = []

        # Find examples of trait expression
        for pattern in pattern_data["lexical_patterns"]:
            matches = re.findall(pattern, text, re.IGNORECASE)
            manifestations.extend(matches[:2])  # Limit to 2 examples per pattern

        # Add quality indicators if present
        for indicator in pattern_data.get("quality_indicators", []):
            if indicator.lower() in text.lower():
                manifestations.append(indicator)

        return "; ".join(manifestations[:4])  # Limit to 4 total manifestations

    def _calculate_enhanced_confidence(
        self, text: str, pattern_data: Dict[str, Any], trait_score: float
    ) -> float:
        """Calculate enhanced confidence in trait extraction."""
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

        # Boost confidence for quality indicators
        quality_matches = sum(
            1
            for indicator in pattern_data.get("quality_indicators", [])
            if indicator.lower() in text.lower()
        )

        confidence_boost = (
            (pattern_matches * 0.04)
            + (contextual_matches * 0.08)
            + (quality_matches * 0.06)
        )

        return min(1.0, base_confidence + confidence_boost)

    def analyze_trait_correlations(
        self, traits: List[SubliminalTrait]
    ) -> Dict[str, float]:
        """Analyze correlations between extracted traits with enhanced analysis."""
        if len(traits) < 2:
            return {}

        correlations = {}

        # Calculate pairwise correlations
        for i, trait1 in enumerate(traits):
            for j, trait2 in enumerate(traits[i + 1 :], i + 1):
                correlation_key = f"{trait1.name}_{trait2.name}"

                # Strength correlation
                strength_correlation = 1.0 - abs(trait1.strength - trait2.strength)

                # Category-based correlation
                category_correlation = (
                    1.0 if trait1.category == trait2.category else 0.5
                )

                # Confidence correlation
                confidence_correlation = 1.0 - abs(
                    trait1.confidence - trait2.confidence
                )

                # Combined correlation with enhanced weighting
                combined_correlation = (
                    strength_correlation * 0.4
                    + category_correlation * 0.3
                    + confidence_correlation * 0.3
                )
                correlations[correlation_key] = combined_correlation

        return correlations

    def calculate_trait_quality_score(self, traits: List[SubliminalTrait]) -> float:
        """Calculate overall trait quality score."""
        if not traits:
            return 0.0

        # Calculate quality metrics
        avg_strength = sum(t.strength for t in traits) / len(traits)
        avg_confidence = sum(t.confidence for t in traits) / len(traits)
        trait_diversity = len(set(t.category for t in traits)) / len(TraitCategory)

        # Quality score combines strength, confidence, and diversity
        quality_score = (
            avg_strength * 0.4 + avg_confidence * 0.4 + trait_diversity * 0.2
        )

        return min(1.0, quality_score)
