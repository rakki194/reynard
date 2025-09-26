"""PHOENIX Enhanced Knowledge Distillation

Enhanced knowledge distillation system that integrates advanced trait extraction,
domain expertise analysis, and specialization accuracy assessment.

Author: Vulpine (Fox Specialist)
Version: 1.0.0
"""

import logging
from datetime import datetime
from typing import Any

from ..utils.data_structures import (
    AgentGeneticMaterial,
    AgentState,
    KnowledgeDistillationResult,
    StructuredKnowledge,
)
from .domain_expertise_analyzer import DomainExpertiseAnalyzer
from .specialization_accuracy_analyzer import SpecializationAccuracyAnalyzer
from .subliminal_trait_extractor import SubliminalTraitExtractor


class EnhancedKnowledgeDistillation:
    """Enhanced knowledge distillation system for PHOENIX framework.

    Integrates:
    - Advanced subliminal trait extraction
    - Domain expertise analysis
    - Specialization accuracy assessment
    - Multi-modal knowledge synthesis
    """

    def __init__(self):
        """Initialize the enhanced knowledge distillation system."""
        self.logger = logging.getLogger(__name__)

        # Initialize component analyzers
        self.trait_extractor = SubliminalTraitExtractor()
        self.domain_analyzer = DomainExpertiseAnalyzer()
        self.specialization_analyzer = SpecializationAccuracyAnalyzer()

        # Knowledge synthesis weights
        self.synthesis_weights = {
            "trait_accuracy": 0.3,
            "domain_expertise": 0.3,
            "specialization_accuracy": 0.2,
            "knowledge_fidelity": 0.2,
        }

        self.logger.info("🧠 Enhanced knowledge distillation system initialized")

    def distill_knowledge(
        self,
        agent_output: str,
        agent_state: AgentState,
    ) -> KnowledgeDistillationResult:
        """Perform comprehensive knowledge distillation from agent output.

        Args:
            agent_output: The agent's output text
            agent_state: Current agent state for context

        Returns:
            Comprehensive knowledge distillation result

        """
        self.logger.info(
            f"Starting enhanced knowledge distillation for agent {agent_state.id}",
        )

        # Extract subliminal traits
        subliminal_traits = self.trait_extractor.extract_traits_from_output(
            agent_output,
            agent_state,
        )

        # Analyze domain expertise
        domain_expertise = self.domain_analyzer.analyze_domain_expertise(
            agent_output,
            agent_state,
        )

        # Analyze specialization accuracy
        specialization_accuracy = (
            self.specialization_analyzer.analyze_specialization_accuracy(
                agent_output,
                agent_state,
            )
        )

        # Calculate knowledge fidelity
        knowledge_fidelity = self._calculate_knowledge_fidelity(
            subliminal_traits,
            domain_expertise,
            specialization_accuracy,
        )

        # Create structured knowledge
        structured_knowledge = self._create_structured_knowledge(
            subliminal_traits,
            domain_expertise,
            specialization_accuracy,
        )

        # Calculate overall distillation quality
        distillation_quality = self._calculate_distillation_quality(
            subliminal_traits,
            domain_expertise,
            specialization_accuracy,
            knowledge_fidelity,
        )

        # Create genetic material
        genetic_material = AgentGeneticMaterial(
            agent_id=agent_state.id,
            agent_name=agent_state.name,
            spirit=agent_state.spirit,
            style=agent_state.style,
            fitness_score=distillation_quality,
            subliminal_traits=subliminal_traits,
            structured_knowledge=structured_knowledge,
            relevance_scores=self._calculate_relevance_scores(domain_expertise),
            extraction_timestamp=datetime.now(),
            extraction_method="enhanced_distillation",
            confidence_score=distillation_quality,
        )

        # Create distillation result
        result = KnowledgeDistillationResult(
            agent_id=agent_state.id,
            genetic_material=genetic_material,
            distillation_quality=distillation_quality,
            knowledge_fidelity=knowledge_fidelity,
            trait_accuracy=self._calculate_trait_accuracy(subliminal_traits),
            domain_expertise_scores=domain_expertise,
            specialization_accuracy=specialization_accuracy,
            extraction_timestamp=datetime.now(),
            extraction_method="enhanced_distillation",
        )

        self.logger.info(
            f"Enhanced knowledge distillation completed with quality: {distillation_quality:.3f}",
        )
        return result

    def _calculate_knowledge_fidelity(
        self,
        traits: list,
        domain_expertise: dict[str, Any],
        specialization_accuracy: dict[str, Any],
    ) -> float:
        """Calculate knowledge fidelity score."""
        # Base fidelity from trait consistency
        trait_consistency = self.trait_extractor.validate_trait_consistency(traits)

        # Domain expertise contribution
        domain_scores = [
            expertise["expertise_score"] for expertise in domain_expertise.values()
        ]
        avg_domain_expertise = (
            sum(domain_scores) / len(domain_scores) if domain_scores else 0.0
        )

        # Specialization accuracy contribution
        specialization_score = specialization_accuracy.get("overall_accuracy", 0.0)

        # Combined fidelity score
        fidelity = (
            trait_consistency * 0.4
            + avg_domain_expertise * 0.3
            + specialization_score * 0.3
        )

        return min(1.0, fidelity)

    def _create_structured_knowledge(
        self,
        traits: list,
        domain_expertise: dict[str, Any],
        specialization_accuracy: dict[str, Any],
    ) -> StructuredKnowledge:
        """Create structured knowledge from analysis results."""
        # Extract categories from traits
        categories = set(trait.category for trait in traits)

        # Create concepts from domain expertise
        concepts = []
        for domain, expertise in domain_expertise.items():
            concept = {
                "id": f"domain_{domain}",
                "name": domain.replace("_", " ").title(),
                "description": f"Expertise in {domain}",
                "confidence": expertise["expertise_score"],
                "category": "domain_expertise",
            }
            concepts.append(concept)

        # Create reasoning patterns from specialization
        reasoning_patterns = []
        spirit_type = specialization_accuracy.get("spirit_type", "unknown")
        specialization_scores = specialization_accuracy.get("specialization_scores", {})

        for specialization, score in specialization_scores.items():
            pattern = {
                "id": f"pattern_{spirit_type}_{specialization}",
                "name": f"{spirit_type.title()} {specialization.replace('_', ' ').title()}",
                "description": f"Reasoning pattern for {specialization}",
                "confidence": score,
                "category": "specialization",
            }
            reasoning_patterns.append(pattern)

        # Create strategies from traits
        strategies = []
        for trait in traits:
            if trait.strength > 0.5:  # Only include strong traits
                strategy = {
                    "id": f"strategy_{trait.name}",
                    "name": trait.name.replace("_", " ").title(),
                    "description": f"Strategy based on {trait.name}",
                    "confidence": trait.confidence,
                    "category": "behavioral_strategy",
                }
                strategies.append(strategy)

        # Create domain knowledge
        domain_knowledge = {}
        for domain, expertise in domain_expertise.items():
            domain_knowledge[domain] = {
                "expertise_level": expertise["expertise_level"],
                "confidence": expertise["expertise_score"],
                "indicators": expertise["indicators"][:3],  # Limit to 3 indicators
                "terminology_usage": expertise["terminology_usage"],
                "concept_depth": expertise["concept_depth"],
            }

        # Create confidence scores
        confidence_scores = {
            "trait_extraction": self._calculate_trait_accuracy(traits),
            "domain_expertise": (
                sum(
                    expertise["expertise_score"]
                    for expertise in domain_expertise.values()
                )
                / len(domain_expertise)
                if domain_expertise
                else 0.0
            ),
            "specialization_accuracy": specialization_accuracy.get(
                "overall_accuracy",
                0.0,
            ),
            "overall_confidence": 0.0,  # Will be calculated
        }

        # Calculate overall confidence
        confidence_scores["overall_confidence"] = sum(confidence_scores.values()) / len(
            confidence_scores,
        )

        return StructuredKnowledge(
            categories=list(categories),
            concepts=concepts,
            reasoning_patterns=reasoning_patterns,
            strategies=strategies,
            domain_knowledge=domain_knowledge,
            confidence_scores=confidence_scores,
        )

    def _calculate_distillation_quality(
        self,
        traits: list,
        domain_expertise: dict[str, Any],
        specialization_accuracy: dict[str, Any],
        knowledge_fidelity: float,
    ) -> float:
        """Calculate overall distillation quality."""
        # Calculate component scores
        trait_accuracy = self._calculate_trait_accuracy(traits)
        domain_expertise_score = (
            sum(expertise["expertise_score"] for expertise in domain_expertise.values())
            / len(domain_expertise)
            if domain_expertise
            else 0.0
        )
        specialization_score = specialization_accuracy.get("overall_accuracy", 0.0)

        # Weighted combination
        quality = (
            trait_accuracy * self.synthesis_weights["trait_accuracy"]
            + domain_expertise_score * self.synthesis_weights["domain_expertise"]
            + specialization_score * self.synthesis_weights["specialization_accuracy"]
            + knowledge_fidelity * self.synthesis_weights["knowledge_fidelity"]
        )

        return min(1.0, quality)

    def _calculate_trait_accuracy(self, traits: list) -> float:
        """Calculate trait extraction accuracy."""
        if not traits:
            return 0.0

        # Calculate average confidence of extracted traits
        avg_confidence = sum(trait.confidence for trait in traits) / len(traits)

        # Boost for trait consistency
        consistency = self.trait_extractor.validate_trait_consistency(traits)

        # Combined accuracy
        accuracy = avg_confidence * 0.7 + consistency * 0.3

        return min(1.0, accuracy)

    def _calculate_relevance_scores(
        self,
        domain_expertise: dict[str, Any],
    ) -> dict[str, float]:
        """Calculate relevance scores for different domains."""
        relevance_scores = {}

        for domain, expertise in domain_expertise.items():
            # Relevance based on expertise score and confidence
            relevance = expertise["expertise_score"] * expertise["confidence"]
            relevance_scores[domain] = relevance

        return relevance_scores

    def analyze_cross_agent_knowledge_transfer(
        self,
        distillation_results: list[KnowledgeDistillationResult],
    ) -> dict[str, Any]:
        """Analyze potential for cross-agent knowledge transfer."""
        if len(distillation_results) < 2:
            return {"error": "Need at least 2 agents for transfer analysis"}

        transfer_analysis = {
            "trait_transfer_potential": {},
            "domain_transfer_potential": {},
            "specialization_transfer_potential": {},
            "overall_transfer_potential": {},
        }

        # Analyze trait transfer potential
        for i, result1 in enumerate(distillation_results):
            for result2 in distillation_results[i + 1 :]:
                agent1_id = result1.agent_id
                agent2_id = result2.agent_id
                transfer_key = f"{agent1_id}_to_{agent2_id}"

                # Calculate trait transfer potential
                trait_transfer = self._calculate_trait_transfer_potential(
                    result1.genetic_material.subliminal_traits,
                    result2.genetic_material.subliminal_traits,
                )
                transfer_analysis["trait_transfer_potential"][
                    transfer_key
                ] = trait_transfer

                # Calculate domain transfer potential
                domain_transfer = self._calculate_domain_transfer_potential(
                    result1.domain_expertise_scores,
                    result2.domain_expertise_scores,
                )
                transfer_analysis["domain_transfer_potential"][
                    transfer_key
                ] = domain_transfer

                # Calculate specialization transfer potential
                specialization_transfer = (
                    self._calculate_specialization_transfer_potential(
                        result1.specialization_accuracy,
                        result2.specialization_accuracy,
                    )
                )
                transfer_analysis["specialization_transfer_potential"][
                    transfer_key
                ] = specialization_transfer

                # Calculate overall transfer potential
                overall_transfer = (
                    trait_transfer * 0.3
                    + domain_transfer * 0.4
                    + specialization_transfer * 0.3
                )
                transfer_analysis["overall_transfer_potential"][
                    transfer_key
                ] = overall_transfer

        return transfer_analysis

    def _calculate_trait_transfer_potential(
        self,
        traits1: list,
        traits2: list,
    ) -> float:
        """Calculate trait transfer potential between two agents."""
        if not traits1 or not traits2:
            return 0.0

        # Find common trait categories
        categories1 = set(trait.category for trait in traits1)
        categories2 = set(trait.category for trait in traits2)
        common_categories = categories1.intersection(categories2)

        # Calculate transfer potential based on category overlap and trait strength
        if not common_categories:
            return 0.0

        transfer_score = len(common_categories) / max(
            len(categories1),
            len(categories2),
        )

        # Boost for high-quality traits
        avg_confidence1 = sum(trait.confidence for trait in traits1) / len(traits1)
        avg_confidence2 = sum(trait.confidence for trait in traits2) / len(traits2)
        quality_boost = (avg_confidence1 + avg_confidence2) / 2

        return min(1.0, transfer_score * quality_boost)

    def _calculate_domain_transfer_potential(
        self,
        domains1: dict[str, Any],
        domains2: dict[str, Any],
    ) -> float:
        """Calculate domain transfer potential between two agents."""
        if not domains1 or not domains2:
            return 0.0

        # Find common domains
        common_domains = set(domains1.keys()).intersection(set(domains2.keys()))

        if not common_domains:
            return 0.0

        # Calculate transfer potential based on domain expertise overlap
        transfer_scores = []
        for domain in common_domains:
            expertise1 = domains1[domain]["expertise_score"]
            expertise2 = domains2[domain]["expertise_score"]
            transfer_score = min(
                expertise1,
                expertise2,
            )  # Transfer limited by lower expertise
            transfer_scores.append(transfer_score)

        return sum(transfer_scores) / len(transfer_scores) if transfer_scores else 0.0

    def _calculate_specialization_transfer_potential(
        self,
        spec1: dict[str, Any],
        spec2: dict[str, Any],
    ) -> float:
        """Calculate specialization transfer potential between two agents."""
        if not spec1 or not spec2:
            return 0.0

        # Check if specializations are complementary
        spirit1 = spec1.get("spirit_type", "unknown")
        spirit2 = spec2.get("spirit_type", "unknown")

        if self.specialization_analyzer._are_complementary_specializations(
            spirit1,
            spirit2,
        ):
            # High transfer potential for complementary specializations
            accuracy1 = spec1.get("overall_accuracy", 0.0)
            accuracy2 = spec2.get("overall_accuracy", 0.0)
            return (accuracy1 + accuracy2) / 2
        # Lower transfer potential for non-complementary specializations
        accuracy1 = spec1.get("overall_accuracy", 0.0)
        accuracy2 = spec2.get("overall_accuracy", 0.0)
        return (accuracy1 + accuracy2) / 4  # Reduced by half

    def generate_distillation_report(
        self,
        distillation_results: list[KnowledgeDistillationResult],
    ) -> str:
        """Generate comprehensive distillation report."""
        report = f"""
PHOENIX Enhanced Knowledge Distillation Report
=============================================

Analysis Date: {datetime.now().isoformat()}
Agents Analyzed: {len(distillation_results)}

Individual Agent Results:
------------------------
"""

        for result in distillation_results:
            report += f"""
Agent: {result.agent_id}
- Distillation Quality: {result.distillation_quality:.3f}
- Knowledge Fidelity: {result.knowledge_fidelity:.3f}
- Trait Accuracy: {result.trait_accuracy:.3f}
- Specialization Accuracy: {result.specialization_accuracy.get('overall_accuracy', 0.0):.3f}
- Domain Expertise: {len(result.domain_expertise_scores)} domains
- Extracted Traits: {len(result.genetic_material.subliminal_traits)}
"""

        # Calculate aggregate statistics
        if distillation_results:
            avg_quality = sum(
                r.distillation_quality for r in distillation_results
            ) / len(distillation_results)
            avg_fidelity = sum(
                r.knowledge_fidelity for r in distillation_results
            ) / len(distillation_results)
            avg_trait_accuracy = sum(
                r.trait_accuracy for r in distillation_results
            ) / len(distillation_results)

            report += f"""
Aggregate Statistics:
--------------------
- Average Distillation Quality: {avg_quality:.3f}
- Average Knowledge Fidelity: {avg_fidelity:.3f}
- Average Trait Accuracy: {avg_trait_accuracy:.3f}

Cross-Agent Transfer Analysis:
-----------------------------
"""

            # Analyze cross-agent transfer
            transfer_analysis = self.analyze_cross_agent_knowledge_transfer(
                distillation_results,
            )

            if "overall_transfer_potential" in transfer_analysis:
                for transfer_key, potential in transfer_analysis[
                    "overall_transfer_potential"
                ].items():
                    report += f"- {transfer_key}: {potential:.3f}\n"

        report += """
Recommendations:
---------------
1. Focus on improving knowledge fidelity through better trait extraction
2. Enhance domain expertise detection for more accurate specialization
3. Implement cross-agent knowledge transfer mechanisms
4. Conduct multiple distillation cycles for improved quality

---
Report generated by Enhanced Knowledge Distillation System v1.0.0
"""

        return report
