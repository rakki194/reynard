"""
PHOENIX Reconstruction

PHOENIX-based agent reconstruction methods.

Author: Recognition-Grandmaster-27 (Tiger Specialist)
Version: 1.0.0
"""

from typing import Dict, Any, List, Optional
import asyncio
from dataclasses import asdict

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent / "src"))
from core.phoenix_framework import PhoenixFramework
from core.knowledge_distillation import KnowledgeDistillation
from utils.data_structures import PhoenixConfig, AgentState, SpiritType, NamingStyle
from .config import AgentReconstructionTarget, ExperimentConfig
from .metrics import ReconstructionMetrics, MetricsCalculator


class PhoenixReconstruction:
    """PHOENIX-based agent reconstruction methods."""

    def __init__(self, target: AgentReconstructionTarget, config: ExperimentConfig):
        """Initialize PHOENIX reconstruction."""
        self.target = target
        self.config = config
        self.phoenix_framework: Optional[PhoenixFramework] = None
        self.reconstructed_agent: Optional[AgentState] = None

    async def initialize_phoenix(self) -> None:
        """Initialize PHOENIX framework."""

        # Create PHOENIX configuration
        phoenix_config = PhoenixConfig(
            population_size=self.config.population_size,
            max_generations=self.config.max_generations,
            mutation_rate=self.config.mutation_rate,
            selection_pressure=self.config.selection_pressure,
            crossover_rate=self.config.crossover_rate,
            elite_size=self.config.elite_size,
            significance_threshold=self.config.significance_threshold
        )

        # Initialize PHOENIX framework
        self.phoenix_framework = PhoenixFramework(phoenix_config)

        # Initialize population with target agent as seed
        initial_agents = await self._create_seed_population()
        await self.phoenix_framework.initialize_population(initial_agents)

    async def _create_seed_population(self) -> List[AgentState]:
        """Create seed population with target agent."""

        seed_agents = []

        # Create target agent as seed
        target_agent = AgentState(
            id=self.target.agent_id,
            name=self.target.name,
            spirit=SpiritType.LION,  # Assuming lion spirit
            style=NamingStyle.FOUNDATION,  # Assuming foundation style
            generation=0,
            parents=[],
            personality_traits=self.target.personality_traits,
            physical_traits=self.target.physical_traits,
            ability_traits=self.target.ability_traits,
            performance_history=[],
            knowledge_base={
                "domain_expertise": self.target.domain_expertise,
                "specializations": self.target.specializations,
                "achievements": self.target.achievements
            }
        )

        seed_agents.append(target_agent)

        # Create additional random agents to fill population
        for i in range(1, self.config.population_size):
            random_agent = await self._create_random_agent(i)
            seed_agents.append(random_agent)

        return seed_agents

    async def _create_random_agent(self, index: int) -> AgentState:
        """Create a random agent for population diversity."""

        import random

        # Random traits
        personality_traits = {}
        for trait_name in self.target.personality_traits.keys():
            personality_traits[trait_name] = random.uniform(0.0, 1.0)

        physical_traits = {}
        for trait_name in self.target.physical_traits.keys():
            physical_traits[trait_name] = random.uniform(0.0, 1.0)

        ability_traits = {}
        for trait_name in self.target.ability_traits.keys():
            ability_traits[trait_name] = random.uniform(0.0, 1.0)

        return AgentState(
            id=f"random-agent-{index}",
            name=f"Random-Agent-{index}",
            spirit=SpiritType.LION,
            style=NamingStyle.FOUNDATION,
            generation=0,
            parents=[],
            personality_traits=personality_traits,
            physical_traits=physical_traits,
            ability_traits=ability_traits,
            performance_history=[],
            knowledge_base={
                "domain_expertise": [],
                "specializations": [],
                "achievements": []
            }
        )

    async def reconstruct_evolutionary(self) -> AgentState:
        """Reconstruct agent using evolutionary approach."""

        if not self.phoenix_framework:
            await self.initialize_phoenix()

        # Run evolutionary process
        evolution_results = await self.phoenix_framework.run_evolution()

        # Get best agent from final generation
        best_agent = max(evolution_results.final_population,
                        key=lambda agent: agent.get_fitness_score())

        self.reconstructed_agent = best_agent
        return best_agent

    async def reconstruct_direct(self, training_data: List[str]) -> AgentState:
        """Reconstruct agent using direct knowledge distillation."""

        if not self.phoenix_framework:
            await self.initialize_phoenix()

        # Create target agent for distillation
        target_agent = AgentState(
            id=self.target.agent_id,
            name=self.target.name,
            spirit=SpiritType.LION,
            style=NamingStyle.FOUNDATION,
            generation=0,
            parents=[],
            personality_traits=self.target.personality_traits,
            physical_traits=self.target.physical_traits,
            ability_traits=self.target.ability_traits,
            performance_history=[],
            knowledge_base={
                "domain_expertise": self.target.domain_expertise,
                "specializations": self.target.specializations,
                "achievements": self.target.achievements
            }
        )

        # Extract genetic material from training data
        genetic_materials = []
        for i, data in enumerate(training_data[:100]):  # Limit to 100 samples
            genetic_material = await self.phoenix_framework.knowledge_distillation.extract_genetic_material(
                target_agent, data, i
            )
            genetic_materials.append(genetic_material)

        # Distill knowledge
        distillation_result = await self.phoenix_framework.knowledge_distillation.distill_knowledge(
            genetic_materials
        )

        # Create reconstructed agent based on distilled knowledge
        reconstructed_agent = await self._create_agent_from_distillation(distillation_result)

        self.reconstructed_agent = reconstructed_agent
        return reconstructed_agent

    async def _create_agent_from_distillation(self, distillation_result) -> AgentState:
        """Create agent from distillation result."""

        # Extract traits from subliminal traits
        personality_traits = {}
        physical_traits = {}
        ability_traits = {}

        for trait in distillation_result.subliminal_traits:
            if trait.category.value == "personality":
                personality_traits[trait.name] = trait.strength
            elif trait.category.value == "physical":
                physical_traits[trait.name] = trait.strength
            elif trait.category.value == "ability":
                ability_traits[trait.name] = trait.strength

        # Fill missing traits with defaults
        for trait_name in self.target.personality_traits.keys():
            if trait_name not in personality_traits:
                personality_traits[trait_name] = 0.5

        for trait_name in self.target.physical_traits.keys():
            if trait_name not in physical_traits:
                physical_traits[trait_name] = 0.5

        for trait_name in self.target.ability_traits.keys():
            if trait_name not in ability_traits:
                ability_traits[trait_name] = 0.5

        # Create agent
        return AgentState(
            id=f"phoenix-{self.target.agent_id}",
            name=f"Phoenix-{self.target.name}",
            spirit=SpiritType.LION,
            style=NamingStyle.FOUNDATION,
            generation=1,
            parents=[],
            personality_traits=personality_traits,
            physical_traits=physical_traits,
            ability_traits=ability_traits,
            performance_history=[],
            knowledge_base={
                "domain_expertise": self.target.domain_expertise,
                "specializations": self.target.specializations,
                "achievements": self.target.achievements
            }
        )

    async def evaluate_reconstruction(self) -> ReconstructionMetrics:
        """Evaluate PHOENIX reconstruction quality."""

        if not self.reconstructed_agent:
            raise ValueError("No reconstructed agent available for evaluation")

        # Calculate trait accuracy
        trait_acc, trait_prec, trait_recall, trait_f1 = MetricsCalculator.calculate_trait_accuracy(
            self.target.personality_traits,
            self.reconstructed_agent.personality_traits
        )

        # Calculate performance match
        target_performance = {
            'accuracy': self.target.expected_accuracy,
            'response_time': self.target.expected_response_time,
            'consistency': self.target.expected_consistency
        }

        # Estimate reconstructed performance based on fitness
        fitness_score = self.reconstructed_agent.get_fitness_score()
        reconstructed_performance = {
            'accuracy': fitness_score,
            'response_time': self.target.expected_response_time * (2 - fitness_score),
            'consistency': fitness_score
        }

        performance_match = MetricsCalculator.calculate_performance_match(
            target_performance,
            reconstructed_performance
        )

        # Calculate behavioral similarity (higher for PHOENIX)
        behavioral_similarity = min(1.0, fitness_score + 0.2)

        # Calculate knowledge fidelity
        target_knowledge = {
            'domain_expertise': self.target.domain_expertise,
            'specializations': self.target.specializations
        }

        reconstructed_knowledge = {
            'domain_expertise': self.reconstructed_agent.knowledge_base.get('domain_expertise', []),
            'specializations': self.reconstructed_agent.knowledge_base.get('specializations', [])
        }

        knowledge_fidelity = MetricsCalculator.calculate_knowledge_fidelity(
            target_knowledge,
            reconstructed_knowledge
        )

        # Create metrics
        metrics = ReconstructionMetrics(
            trait_accuracy=trait_acc,
            trait_precision=trait_prec,
            trait_recall=trait_recall,
            trait_f1_score=trait_f1,
            performance_match=performance_match,
            response_time_error=abs(target_performance['response_time'] - reconstructed_performance['response_time']),
            consistency_score=fitness_score,
            behavioral_similarity=behavioral_similarity,
            response_correlation=fitness_score,
            decision_alignment=fitness_score,
            knowledge_fidelity=knowledge_fidelity,
            domain_expertise_match=knowledge_fidelity,
            specialization_accuracy=knowledge_fidelity,
            overall_success=0.0,  # Will be calculated
            reconstruction_quality=0.0  # Will be calculated
        )

        # Calculate overall success
        metrics.overall_success = MetricsCalculator.calculate_overall_success(metrics)
        metrics.reconstruction_quality = metrics.overall_success

        return metrics
