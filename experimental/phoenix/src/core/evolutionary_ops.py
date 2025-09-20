"""
PHOENIX Evolutionary Operators

Enhanced evolutionary operators for agent breeding, selection, and mutation.
Implements sophisticated selection mechanisms and genetic operations.

Author: Success-Advisor-8 (Permanent Release Manager)
Version: 1.0.0
"""

import random
import logging
from typing import List, Tuple, Dict, Any
import numpy as np
from datetime import datetime

from ..utils.data_structures import (
    PhoenixConfig,
    AgentState,
    SpiritType,
    NamingStyle,
    create_offspring_traits,
    calculate_genetic_compatibility
)


class EvolutionaryOperators:
    """
    Enhanced evolutionary operators for PHOENIX framework.

    Implements:
    - Multiple selection mechanisms (tournament, fitness-proportional, elite preservation)
    - Sophisticated crossover operations for agent breeding
    - Adaptive mutation strategies for genetic diversity
    - Diversity preservation algorithms
    """

    def __init__(self, config: PhoenixConfig):
        """
        Initialize evolutionary operators.

        Args:
            config: PHOENIX configuration parameters
        """
        self.config = config
        self.logger = logging.getLogger(__name__)

        # Selection method configuration
        self.selection_methods = {
            "tournament": self._tournament_selection,
            "fitness_proportional": self._fitness_proportional_selection,
            "rank_selection": self._rank_selection,
            "elite_preservation": self._elite_preservation_selection
        }

        self.logger.info("🧬 Evolutionary operators initialized")

    async def select_parents(self, population: List[AgentState]) -> List[Tuple[AgentState, AgentState]]:
        """
        Select parents for breeding using configured selection method.

        Args:
            population: Current population of agents

        Returns:
            List of parent pairs for breeding
        """
        self.logger.info(f"👥 Selecting parents from population of {len(population)} agents")

        # Calculate number of offspring needed
        offspring_count = max(1, int(len(population) * (1 - self.config.elite_rate)))

        # Use tournament selection as default
        selection_method = self.selection_methods.get("tournament", self._tournament_selection)

        parent_pairs = []

        for _ in range(offspring_count):
            # Select two parents
            parent1 = selection_method(population)
            parent2 = selection_method(population)

            # Ensure different parents
            while parent1.id == parent2.id and len(population) > 1:
                parent2 = selection_method(population)

            parent_pairs.append((parent1, parent2))

        self.logger.info(f"✅ Selected {len(parent_pairs)} parent pairs")
        return parent_pairs

    def _tournament_selection(self, population: List[AgentState], tournament_size: int = 3) -> AgentState:
        """
        Tournament selection mechanism.

        Args:
            population: Population to select from
            tournament_size: Size of tournament

        Returns:
            Selected agent
        """
        tournament = random.sample(population, min(tournament_size, len(population)))
        return max(tournament, key=lambda agent: agent.get_fitness_score())

    def _fitness_proportional_selection(self, population: List[AgentState]) -> AgentState:
        """
        Fitness-proportional (roulette wheel) selection.

        Args:
            population: Population to select from

        Returns:
            Selected agent
        """
        fitness_scores = [agent.get_fitness_score() for agent in population]

        # Handle negative fitness scores
        min_fitness = min(fitness_scores)
        if min_fitness < 0:
            fitness_scores = [f - min_fitness + 0.1 for f in fitness_scores]

        # Calculate selection probabilities
        total_fitness = sum(fitness_scores)
        if total_fitness == 0:
            return random.choice(population)

        probabilities = [f / total_fitness for f in fitness_scores]

        # Select based on probabilities
        r = random.random()
        cumulative_prob = 0.0

        for i, prob in enumerate(probabilities):
            cumulative_prob += prob
            if r <= cumulative_prob:
                return population[i]

        return population[-1]  # Fallback

    def _rank_selection(self, population: List[AgentState]) -> AgentState:
        """
        Rank-based selection mechanism.

        Args:
            population: Population to select from

        Returns:
            Selected agent
        """
        # Sort population by fitness
        sorted_population = sorted(population, key=lambda agent: agent.get_fitness_score())

        # Assign ranks (higher fitness = higher rank)
        ranks = list(range(1, len(sorted_population) + 1))

        # Calculate selection probabilities based on ranks
        total_rank = sum(ranks)
        probabilities = [rank / total_rank for rank in ranks]

        # Select based on probabilities
        r = random.random()
        cumulative_prob = 0.0

        for i, prob in enumerate(probabilities):
            cumulative_prob += prob
            if r <= cumulative_prob:
                return sorted_population[i]

        return sorted_population[-1]  # Fallback

    def _elite_preservation_selection(self, population: List[AgentState]) -> AgentState:
        """
        Elite preservation selection (always select from top performers).

        Args:
            population: Population to select from

        Returns:
            Selected agent from elite
        """
        # Sort by fitness and select from top 20%
        sorted_population = sorted(population, key=lambda agent: agent.get_fitness_score(), reverse=True)
        elite_size = max(1, len(sorted_population) // 5)
        elite = sorted_population[:elite_size]

        return random.choice(elite)

    async def breed_agents(self, parent1: AgentState, parent2: AgentState) -> AgentState:
        """
        Breed two agents to create offspring.

        Args:
            parent1: First parent agent
            parent2: Second parent agent

        Returns:
            Offspring agent
        """
        self.logger.info(f"👶 Breeding agents {parent1.name} and {parent2.name}")

        # Calculate genetic compatibility
        compatibility = calculate_genetic_compatibility(parent1, parent2)

        # Create offspring traits through inheritance
        offspring_traits = create_offspring_traits(parent1, parent2, self.config.mutation_rate)

        # Determine offspring spirit and style (inherit from parent1 with some chance of parent2)
        offspring_spirit = parent1.spirit if random.random() < 0.7 else parent2.spirit
        offspring_style = parent1.style if random.random() < 0.7 else parent2.style

        # Generate offspring ID and name
        offspring_id = f"offspring_{parent1.id}_{parent2.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        offspring_name = f"{offspring_spirit.value.capitalize()}-{offspring_style.value.capitalize()}-{random.randint(10, 99)}"

        # Create offspring agent
        offspring = AgentState(
            id=offspring_id,
            name=offspring_name,
            spirit=offspring_spirit,
            style=offspring_style,
            generation=max(parent1.generation, parent2.generation) + 1,
            parents=[parent1.id, parent2.id],
            personality_traits=offspring_traits["personality"],
            physical_traits=offspring_traits["physical"],
            ability_traits=offspring_traits["abilities"],
            performance_history=[],
            knowledge_base=self._inherit_knowledge_base(parent1, parent2),
            created_at=datetime.now()
        )

        self.logger.info(f"✅ Created offspring {offspring.name} with compatibility {compatibility:.3f}")
        return offspring

    def _inherit_knowledge_base(self, parent1: AgentState, parent2: AgentState) -> Dict[str, Any]:
        """
        Inherit knowledge base from parents.

        Args:
            parent1: First parent
            parent2: Second parent

        Returns:
            Inherited knowledge base
        """
        # Combine knowledge bases from both parents
        combined_knowledge = {}

        # Inherit from parent1
        for key, value in parent1.knowledge_base.items():
            combined_knowledge[f"p1_{key}"] = value

        # Inherit from parent2
        for key, value in parent2.knowledge_base.items():
            combined_knowledge[f"p2_{key}"] = value

        # Add inheritance metadata
        combined_knowledge["inheritance_info"] = {
            "parent1_id": parent1.id,
            "parent2_id": parent2.id,
            "inheritance_timestamp": datetime.now().isoformat(),
            "genetic_compatibility": calculate_genetic_compatibility(parent1, parent2)
        }

        return combined_knowledge

    async def apply_mutations(self, offspring: List[AgentState]) -> List[AgentState]:
        """
        Apply mutations to offspring population.

        Args:
            offspring: List of offspring agents

        Returns:
            List of mutated offspring
        """
        self.logger.info(f"🧬 Applying mutations to {len(offspring)} offspring")

        mutated_offspring = []

        for agent in offspring:
            mutated_agent = self._mutate_agent(agent)
            mutated_offspring.append(mutated_agent)

        self.logger.info(f"✅ Applied mutations to {len(mutated_offspring)} offspring")
        return mutated_offspring

    def _mutate_agent(self, agent: AgentState) -> AgentState:
        """
        Apply mutations to a single agent.

        Args:
            agent: Agent to mutate

        Returns:
            Mutated agent
        """
        # Create a copy of the agent
        mutated_agent = AgentState(
            id=agent.id,
            name=agent.name,
            spirit=agent.spirit,
            style=agent.style,
            generation=agent.generation,
            parents=agent.parents.copy(),
            personality_traits=agent.personality_traits.copy(),
            physical_traits=agent.physical_traits.copy(),
            ability_traits=agent.ability_traits.copy(),
            performance_history=agent.performance_history.copy(),
            knowledge_base=agent.knowledge_base.copy(),
            created_at=agent.created_at,
            last_updated=datetime.now()
        )

        # Apply mutations to personality traits
        for trait_name in mutated_agent.personality_traits:
            if random.random() < self.config.mutation_rate:
                mutation = random.gauss(0, 0.1)  # Gaussian mutation
                new_value = max(0.0, min(1.0,
                    mutated_agent.personality_traits[trait_name] + mutation))
                mutated_agent.personality_traits[trait_name] = new_value

        # Apply mutations to physical traits
        for trait_name in mutated_agent.physical_traits:
            if random.random() < self.config.mutation_rate:
                mutation = random.gauss(0, 0.1)
                new_value = max(0.0, min(1.0,
                    mutated_agent.physical_traits[trait_name] + mutation))
                mutated_agent.physical_traits[trait_name] = new_value

        # Apply mutations to ability traits
        for trait_name in mutated_agent.ability_traits:
            if random.random() < self.config.mutation_rate:
                mutation = random.gauss(0, 0.1)
                new_value = max(0.0, min(1.0,
                    mutated_agent.ability_traits[trait_name] + mutation))
                mutated_agent.ability_traits[trait_name] = new_value

        # Occasionally mutate spirit or style
        if random.random() < self.config.mutation_rate * 0.1:  # Lower probability
            mutated_agent.spirit = random.choice(list(SpiritType))

        if random.random() < self.config.mutation_rate * 0.1:
            mutated_agent.style = random.choice(list(NamingStyle))

        return mutated_agent

    def calculate_population_diversity(self, population: List[AgentState]) -> float:
        """
        Calculate population diversity based on trait differences.

        Args:
            population: Population to analyze

        Returns:
            Diversity score (0.0 to 1.0)
        """
        if len(population) < 2:
            return 0.0

        # Calculate pairwise distances
        distances = []

        for i, agent1 in enumerate(population):
            for agent2 in population[i+1:]:
                distance = self._calculate_agent_distance(agent1, agent2)
                distances.append(distance)

        # Return average distance
        return sum(distances) / len(distances) if distances else 0.0

    def _calculate_agent_distance(self, agent1: AgentState, agent2: AgentState) -> float:
        """
        Calculate distance between two agents based on their traits.

        Args:
            agent1: First agent
            agent2: Second agent

        Returns:
            Distance score (0.0 to 1.0)
        """
        # Combine all traits
        traits1 = {**agent1.personality_traits, **agent1.physical_traits, **agent1.ability_traits}
        traits2 = {**agent2.personality_traits, **agent2.physical_traits, **agent2.ability_traits}

        # Calculate Euclidean distance
        common_traits = set(traits1.keys()) & set(traits2.keys())
        if not common_traits:
            return 1.0  # Maximum distance if no common traits

        squared_differences = []
        for trait in common_traits:
            diff = traits1[trait] - traits2[trait]
            squared_differences.append(diff ** 2)

        distance = (sum(squared_differences) / len(squared_differences)) ** 0.5
        return min(1.0, distance)  # Cap at 1.0

    def select_elite(self, population: List[AgentState], elite_count: int) -> List[AgentState]:
        """
        Select elite agents from population.

        Args:
            population: Population to select from
            elite_count: Number of elite agents to select

        Returns:
            List of elite agents
        """
        # Sort by fitness and select top performers
        sorted_population = sorted(population, key=lambda agent: agent.get_fitness_score(), reverse=True)
        return sorted_population[:elite_count]

    def maintain_diversity(self, population: List[AgentState], target_diversity: float = 0.5) -> List[AgentState]:
        """
        Maintain population diversity by removing similar agents.

        Args:
            population: Population to maintain diversity in
            target_diversity: Target diversity level

        Returns:
            Population with maintained diversity
        """
        if len(population) <= 1:
            return population

        # Calculate current diversity
        current_diversity = self.calculate_population_diversity(population)

        if current_diversity >= target_diversity:
            return population  # Diversity is already sufficient

        # Remove similar agents to increase diversity
        diverse_population = []
        used_agents = set()

        # Start with the best agent
        sorted_population = sorted(population, key=lambda agent: agent.get_fitness_score(), reverse=True)
        diverse_population.append(sorted_population[0])
        used_agents.add(sorted_population[0].id)

        # Add agents that are sufficiently different from already selected ones
        for agent in sorted_population[1:]:
            if agent.id in used_agents:
                continue

            # Check if this agent is sufficiently different from selected agents
            min_distance = min(
                self._calculate_agent_distance(agent, selected_agent)
                for selected_agent in diverse_population
            )

            if min_distance >= target_diversity:
                diverse_population.append(agent)
                used_agents.add(agent.id)

        self.logger.info(f"🔀 Diversity maintenance: {len(population)} -> {len(diverse_population)} agents")
        return diverse_population
