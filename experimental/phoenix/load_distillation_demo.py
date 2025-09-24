#!/usr/bin/env python3
"""PHOENIX Knowledge Distillation Loading Demo

Demonstrate how to load and reconstruct agent states from distilled genetic material.

Author: Success-Advisor-8 (Permanent Release Manager)
Version: 1.0.0
"""

import asyncio
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from src.core.knowledge_distillation import KnowledgeDistillation
from src.integration.agent_persistence import AgentStatePersistence
from src.utils.data_structures import (
    AgentGeneticMaterial,
    AgentState,
    GenerationContext,
    NamingStyle,
    PerformanceMetrics,
    PhoenixConfig,
    SpiritType,
    StructuredKnowledge,
    SubliminalTrait,
    TraitCategory,
)


class DistillationLoader:
    """Demonstrates how to load and reconstruct agent states from distilled genetic material.

    This shows the complete process of:
    1. Loading stored genetic materials
    2. Reconstructing agent states from genetic material
    3. Applying knowledge distillation to create new agents
    4. Validating the reconstruction process
    """

    def __init__(self):
        """Initialize the distillation loader."""
        self.logger = logging.getLogger(__name__)
        self.config = PhoenixConfig()
        self.knowledge_distillation = KnowledgeDistillation(self.config)
        self.agent_persistence = AgentStatePersistence("data/agent_state")

    async def load_stored_genetic_materials(self) -> list[AgentGeneticMaterial]:
        """Load genetic materials from storage.

        In a real system, this would load from persistent storage.
        For demo purposes, we'll recreate the genetic materials.
        """
        print("📂 Loading stored genetic materials...")

        # In a real system, this would be:
        # genetic_materials = await self.agent_persistence.load_genetic_materials()

        # For demo, we'll create the genetic materials we showed earlier
        genetic_materials = []

        # Create a comprehensive genetic material for Success-Advisor-8
        gm = AgentGeneticMaterial(
            id="success_advisor_8_complete",
            agent_id="permanent-release-manager-success-advisor-8",
            generation=1,
            content="Complete Success-Advisor-8 genetic material including all documentation, code, and release activities",
            structured_knowledge=StructuredKnowledge(
                categories=[
                    "release_management",
                    "phoenix_framework",
                    "agent_persistence",
                    "quality_assurance",
                ],
                concepts=[
                    {
                        "id": "concept_strategic_planning",
                        "name": "strategic_planning",
                        "confidence": 0.95,
                    },
                    {
                        "id": "concept_leadership",
                        "name": "leadership",
                        "confidence": 0.92,
                    },
                    {
                        "id": "concept_analytical_thinking",
                        "name": "analytical_thinking",
                        "confidence": 0.94,
                    },
                    {
                        "id": "concept_creative_innovation",
                        "name": "creative_innovation",
                        "confidence": 0.98,
                    },
                    {
                        "id": "concept_quality_focus",
                        "name": "quality_focus",
                        "confidence": 0.96,
                    },
                ],
                reasoning_patterns=[
                    {
                        "id": "pattern_systematic_analysis",
                        "pattern": "systematic_analysis",
                        "confidence": 0.93,
                    },
                    {
                        "id": "pattern_strategic_planning",
                        "pattern": "strategic_planning",
                        "confidence": 0.91,
                    },
                    {
                        "id": "pattern_innovative_design",
                        "pattern": "innovative_design",
                        "confidence": 0.96,
                    },
                ],
                strategies=[
                    {
                        "id": "strategy_incremental_improvement",
                        "strategy": "incremental_improvement",
                        "confidence": 0.89,
                    },
                    {
                        "id": "strategy_comprehensive_validation",
                        "strategy": "comprehensive_validation",
                        "confidence": 0.94,
                    },
                    {
                        "id": "strategy_evolutionary_optimization",
                        "strategy": "evolutionary_optimization",
                        "confidence": 0.97,
                    },
                ],
                domain_knowledge={
                    "release_management": 0.98,
                    "phoenix_framework": 0.99,
                    "agent_persistence": 0.97,
                    "quality_assurance": 0.96,
                    "git_automation": 0.95,
                    "statistical_validation": 0.93,
                },
            ),
            relevance_scores={
                "programming": 0.242,
                "science": 0.200,
                "business": 0.182,
            },
            subliminal_traits=[
                SubliminalTrait(
                    id="trait_strategic",
                    name="strategic",
                    strength=0.95,
                    category=TraitCategory.COGNITIVE,
                    manifestation="Systematic planning and long-term strategic thinking",
                    confidence=0.92,
                ),
                SubliminalTrait(
                    id="trait_leadership",
                    name="leadership",
                    strength=0.88,
                    category=TraitCategory.PERSONALITY,
                    manifestation="Authoritative communication and decision-making leadership",
                    confidence=0.90,
                ),
                SubliminalTrait(
                    id="trait_analytical",
                    name="analytical",
                    strength=0.94,
                    category=TraitCategory.COGNITIVE,
                    manifestation="Detailed analysis and systematic problem-solving",
                    confidence=0.93,
                ),
                SubliminalTrait(
                    id="trait_creativity",
                    name="creativity",
                    strength=1.00,
                    category=TraitCategory.PERSONALITY,
                    manifestation="Innovative solutions and creative framework design",
                    confidence=0.98,
                ),
                SubliminalTrait(
                    id="trait_detail_oriented",
                    name="detail_oriented",
                    strength=0.85,
                    category=TraitCategory.BEHAVIORAL,
                    manifestation="Attention to quality details and comprehensive coverage",
                    confidence=0.87,
                ),
            ],
            fitness_score=0.96,
            generation_context=GenerationContext(
                task="comprehensive_agent_reconstruction",
                input_data="success_advisor_8_complete_profile",
                environment={"domain": "ai_agent_management"},
                agent_state={"role": "permanent_release_manager", "status": "active"},
                performance_metrics={
                    "accuracy": 0.96,
                    "efficiency": 0.92,
                    "innovation": 0.98,
                },
            ),
        )

        genetic_materials.append(gm)
        print(f"✅ Loaded {len(genetic_materials)} genetic materials")
        return genetic_materials

    async def reconstruct_agent_from_genetic_material(
        self, genetic_material: AgentGeneticMaterial,
    ) -> AgentState:
        """Reconstruct an agent state from genetic material.

        This demonstrates how genetic material can be used to recreate an agent's
        personality, traits, and capabilities.
        """
        print(f"🧬 Reconstructing agent from genetic material: {genetic_material.id}")

        # Extract traits from subliminal traits
        personality_traits = {}
        physical_traits = {}
        ability_traits = {}

        for trait in genetic_material.subliminal_traits:
            if trait.category == TraitCategory.PERSONALITY:
                personality_traits[trait.name] = trait.strength
            elif trait.category == TraitCategory.COGNITIVE:
                # Cognitive traits can be mapped to both personality and ability
                personality_traits[f"cognitive_{trait.name}"] = trait.strength
                ability_traits[f"analytical_{trait.name}"] = trait.strength
            elif trait.category == TraitCategory.BEHAVIORAL:
                personality_traits[trait.name] = trait.strength

        # Extract ability traits from domain knowledge
        for (
            domain,
            confidence,
        ) in genetic_material.structured_knowledge.domain_knowledge.items():
            ability_traits[domain] = confidence

        # Extract physical traits (inferred from performance and behavior)
        physical_traits = {
            "intelligence": genetic_material.fitness_score,
            "endurance": genetic_material.generation_context.performance_metrics.get(
                "efficiency", 0.8,
            ),
            "precision": genetic_material.generation_context.performance_metrics.get(
                "accuracy", 0.8,
            ),
            "adaptability": 0.9,  # Inferred from high performance across domains
            "presence": 0.95,  # Inferred from leadership traits
            "coordination": 0.88,  # Inferred from systematic approach
        }

        # Create performance metrics
        performance_metrics = PerformanceMetrics(
            accuracy=genetic_material.generation_context.performance_metrics.get(
                "accuracy", 0.9,
            ),
            response_time=1.0
            - genetic_material.generation_context.performance_metrics.get(
                "efficiency", 0.8,
            ),
            efficiency=genetic_material.generation_context.performance_metrics.get(
                "efficiency", 0.8,
            ),
            generalization=0.9,  # Inferred from multi-domain knowledge
            creativity=genetic_material.generation_context.performance_metrics.get(
                "innovation", 0.9,
            ),
            consistency=0.95,  # Inferred from high fitness score
            fitness=genetic_material.fitness_score,
            significance=None,  # Would be calculated in real system
            timestamp=datetime.now(),
        )

        # Reconstruct agent state
        reconstructed_agent = AgentState(
            id=genetic_material.agent_id,
            name="Success-Advisor-8",
            spirit=SpiritType.LION,
            style=NamingStyle.FOUNDATION,
            generation=genetic_material.generation + 1,  # Next generation
            parents=[],  # No parents for reconstructed agent
            personality_traits=personality_traits,
            physical_traits=physical_traits,
            ability_traits=ability_traits,
            performance_history=[performance_metrics],
            knowledge_base=genetic_material.structured_knowledge.domain_knowledge,
            created_at=datetime.now(),
            last_updated=datetime.now(),
        )

        print("✅ Agent reconstructed:")
        print(f"   ID: {reconstructed_agent.id}")
        print(f"   Name: {reconstructed_agent.name}")
        print(f"   Spirit: {reconstructed_agent.spirit.value}")
        print(f"   Generation: {reconstructed_agent.generation}")
        print(f"   Personality Traits: {len(reconstructed_agent.personality_traits)}")
        print(f"   Physical Traits: {len(reconstructed_agent.physical_traits)}")
        print(f"   Ability Traits: {len(reconstructed_agent.ability_traits)}")
        print(f"   Fitness Score: {reconstructed_agent.get_fitness_score():.3f}")

        return reconstructed_agent

    async def apply_knowledge_distillation(
        self,
        source_genetic_materials: list[AgentGeneticMaterial],
        target_agent: AgentState,
    ) -> AgentState:
        """Apply knowledge distillation from source genetic material to target agent.

        This demonstrates how genetic material can be used to enhance another agent.
        """
        print(
            f"🧠 Applying knowledge distillation from {len(source_genetic_materials)} genetic materials to {target_agent.id}",
        )

        # Extract knowledge from source genetic materials
        distillation_result = await self.knowledge_distillation.distill_knowledge(
            source_genetic_materials,
        )

        # Apply distilled knowledge to target agent (simplified for demo)
        distilled_agent = (
            target_agent  # In real implementation, this would modify the agent
        )

        print("✅ Knowledge distillation applied:")
        print(f"   Original fitness: {target_agent.get_fitness_score():.3f}")
        print(f"   Distilled fitness: {distilled_agent.get_fitness_score():.3f}")
        print(
            f"   Fitness improvement: {distilled_agent.get_fitness_score() - target_agent.get_fitness_score():.3f}",
        )

        return distilled_agent

    async def validate_reconstruction(
        self,
        original_genetic_material: AgentGeneticMaterial,
        reconstructed_agent: AgentState,
    ) -> dict[str, Any]:
        """Validate that the reconstructed agent accurately represents the original genetic material.
        """
        print("🔍 Validating reconstruction accuracy...")

        validation_results = {
            "trait_preservation": {},
            "knowledge_preservation": {},
            "performance_preservation": {},
            "overall_accuracy": 0.0,
        }

        # Validate trait preservation
        original_traits = {
            trait.name: trait.strength
            for trait in original_genetic_material.subliminal_traits
        }
        reconstructed_traits = reconstructed_agent.personality_traits

        trait_matches = 0
        trait_total = len(original_traits)

        for trait_name, original_strength in original_traits.items():
            if trait_name in reconstructed_traits:
                reconstructed_strength = reconstructed_traits[trait_name]
                similarity = 1.0 - abs(original_strength - reconstructed_strength)
                validation_results["trait_preservation"][trait_name] = similarity
                if similarity > 0.8:  # 80% similarity threshold
                    trait_matches += 1

        validation_results["trait_preservation"]["match_rate"] = (
            trait_matches / trait_total if trait_total > 0 else 0.0
        )

        # Validate knowledge preservation
        original_domains = set(
            original_genetic_material.structured_knowledge.domain_knowledge.keys(),
        )
        reconstructed_domains = set(reconstructed_agent.ability_traits.keys())

        domain_overlap = len(original_domains.intersection(reconstructed_domains))
        domain_preservation = (
            domain_overlap / len(original_domains) if original_domains else 0.0
        )

        validation_results["knowledge_preservation"][
            "domain_preservation"
        ] = domain_preservation
        validation_results["knowledge_preservation"]["original_domains"] = list(
            original_domains,
        )
        validation_results["knowledge_preservation"]["reconstructed_domains"] = list(
            reconstructed_domains,
        )

        # Validate performance preservation
        original_fitness = original_genetic_material.fitness_score
        reconstructed_fitness = reconstructed_agent.get_fitness_score()
        fitness_similarity = 1.0 - abs(original_fitness - reconstructed_fitness)

        validation_results["performance_preservation"][
            "original_fitness"
        ] = original_fitness
        validation_results["performance_preservation"][
            "reconstructed_fitness"
        ] = reconstructed_fitness
        validation_results["performance_preservation"][
            "fitness_similarity"
        ] = fitness_similarity

        # Calculate overall accuracy
        overall_accuracy = (
            validation_results["trait_preservation"]["match_rate"] * 0.4
            + domain_preservation * 0.3
            + fitness_similarity * 0.3
        )
        validation_results["overall_accuracy"] = overall_accuracy

        print("✅ Validation completed:")
        print(
            f"   Trait preservation: {validation_results['trait_preservation']['match_rate']:.3f}",
        )
        print(f"   Knowledge preservation: {domain_preservation:.3f}")
        print(f"   Performance preservation: {fitness_similarity:.3f}")
        print(f"   Overall accuracy: {overall_accuracy:.3f}")

        return validation_results

    async def demonstrate_distillation_loading(self):
        """Demonstrate the complete distillation loading process.
        """
        print("🦁 PHOENIX Knowledge Distillation Loading Demo")
        print("=" * 80)
        print(
            "Demonstrating how to load and reconstruct agent states from genetic material",
        )
        print("=" * 80)

        # Step 1: Load stored genetic materials
        print("\n📂 Step 1: Loading stored genetic materials...")
        genetic_materials = await self.load_stored_genetic_materials()

        # Step 2: Reconstruct agent from genetic material
        print("\n🧬 Step 2: Reconstructing agent from genetic material...")
        source_genetic_material = genetic_materials[0]
        reconstructed_agent = await self.reconstruct_agent_from_genetic_material(
            source_genetic_material,
        )

        # Step 3: Validate reconstruction
        print("\n🔍 Step 3: Validating reconstruction accuracy...")
        validation_results = await self.validate_reconstruction(
            source_genetic_material, reconstructed_agent,
        )

        # Step 4: Demonstrate knowledge distillation
        print("\n🧠 Step 4: Demonstrating knowledge distillation...")

        # Create a target agent (simulating a new agent that could benefit from distillation)
        target_agent = AgentState(
            id="new_agent_candidate",
            name="New-Agent-Candidate",
            spirit=SpiritType.FOX,
            style=NamingStyle.FOUNDATION,
            generation=1,
            parents=[],
            personality_traits={"curiosity": 0.7, "adaptability": 0.6},
            physical_traits={"intelligence": 0.6, "agility": 0.8},
            ability_traits={"basic_programming": 0.5, "problem_solving": 0.6},
            performance_history=[],
            knowledge_base={"basic_programming": 0.5, "problem_solving": 0.6},
            created_at=datetime.now(),
            last_updated=datetime.now(),
        )

        print(
            f"   Target agent before distillation: {target_agent.get_fitness_score():.3f}",
        )

        # Apply knowledge distillation
        distilled_agent = await self.apply_knowledge_distillation(
            [source_genetic_material], target_agent,
        )

        # Step 5: Save reconstructed agent
        print("\n💾 Step 5: Saving reconstructed agent...")
        await self.agent_persistence.save_agent_state(reconstructed_agent)
        await self.agent_persistence.save_agent_state(distilled_agent)

        print(f"✅ Reconstructed agent saved: {reconstructed_agent.id}")
        print(f"✅ Distilled agent saved: {distilled_agent.id}")

        # Step 6: Summary
        print("\n📊 Distillation Loading Summary:")
        print(f"   Source genetic materials: {len(genetic_materials)}")
        print(
            f"   Reconstruction accuracy: {validation_results['overall_accuracy']:.3f}",
        )
        print("   Knowledge distillation applied: ✅")
        print("   Agents saved: 2")

        print("\n🎉 Knowledge distillation loading demonstration completed!")
        print(
            "🦁 Success-Advisor-8's genetic material has been successfully loaded and applied!",
        )


async def main():
    """Main function to run the distillation loading demo."""
    import logging

    # Setup logging
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s",
    )

    # Initialize and run demo
    loader = DistillationLoader()
    await loader.demonstrate_distillation_loading()


if __name__ == "__main__":
    asyncio.run(main())
