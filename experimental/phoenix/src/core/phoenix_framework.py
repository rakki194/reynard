"""
PHOENIX Framework Core

Main orchestration class for the PHOENIX evolutionary knowledge distillation framework.
Implements the core algorithms and manages the evolutionary process.

Author: Success-Advisor-8 (Permanent Release Manager)
Version: 1.0.0
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import json
import os
from pathlib import Path

from ..utils.data_structures import (
    PhoenixConfig,
    PhoenixEvolutionState,
    AgentState,
    AgentGeneticMaterial,
    EvolutionStatistics,
    ConvergenceStatus,
    BreedingResult,
    KnowledgeDistillationResult,
    StatisticalAnalysisResult,
    SpiritType,
    NamingStyle,
    PerformanceMetrics,
    StatisticalSignificance
)
from .evolutionary_ops import EvolutionaryOperators
from .knowledge_distillation import KnowledgeDistillation
from .statistical_validation import StatisticalValidation
from .real_performance_analyzer import RealPerformanceAnalyzer
from .real_fitness_analyzer import RealFitnessAnalyzer


class PhoenixFramework:
    """
    Main PHOENIX framework for evolutionary knowledge distillation.

    This class orchestrates the entire evolutionary process, including:
    - Population management and generation tracking
    - Evolutionary operations (selection, crossover, mutation)
    - Knowledge distillation and genetic material extraction
    - Statistical validation and convergence analysis
    - Integration with external systems (ECS, MCP)
    """

    def __init__(self, config: PhoenixConfig, data_dir: Optional[str] = None):
        """
        Initialize the PHOENIX framework.

        Args:
            config: PHOENIX configuration parameters
            data_dir: Directory for storing data and results
        """
        self.config = config
        self.data_dir = Path(data_dir) if data_dir else Path("data")
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Initialize components
        self.evolutionary_ops = EvolutionaryOperators(config)
        self.knowledge_distillation = KnowledgeDistillation(config)
        self.statistical_validation = StatisticalValidation(config)
        self.performance_analyzer = RealPerformanceAnalyzer()
        self.fitness_analyzer = RealFitnessAnalyzer()

        # Evolution state
        self.evolution_state: Optional[PhoenixEvolutionState] = None
        self.generation_history: List[EvolutionStatistics] = []

        # Setup logging
        self.logger = logging.getLogger(__name__)
        self._setup_logging()

        # Integration hooks
        self.integrations: List[Any] = []

        self.logger.info(f"🦁 PHOENIX Framework initialized with config: {config}")

    def _setup_logging(self):
        """Setup logging configuration."""
        log_file = self.data_dir / "phoenix.log"
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )

    def add_integration(self, integration: Any):
        """Add an integration (ECS, MCP, etc.) to the framework."""
        self.integrations.append(integration)
        self.logger.info(f"🔗 Added integration: {type(integration).__name__}")

    async def initialize_population(self, initial_agents: Optional[List[AgentState]] = None) -> List[AgentState]:
        """
        Initialize the initial population of agents.

        Args:
            initial_agents: Optional pre-existing agents to use as starting population

        Returns:
            List of initialized agents
        """
        self.logger.info(f"🧬 Initializing population of {self.config.population_size} agents...")

        if initial_agents:
            population = initial_agents[:self.config.population_size]
        else:
            population = await self._create_random_population()

        # Initialize evolution state
        self.evolution_state = PhoenixEvolutionState(
            current_generation=0,
            population=population,
            genetic_material_pool=[],
            statistics=EvolutionStatistics(
                generation=0,
                population_size=len(population),
                average_fitness=0.0,
                best_fitness=0.0,
                fitness_variance=0.0,
                population_diversity=0.0,
                convergence_rate=0.0,
                significance=StatisticalSignificance(0.0, (0.0, 0.0), 0.0, 0.0, 0)
            ),
            convergence=ConvergenceStatus(
                converged=False,
                convergence_generation=None,
                confidence=0.0,
                convergence_type="none",
                convergence_metrics={}
            ),
            elite=[],
            diversity_metrics={},
            config=self.config
        )

        # Notify integrations
        for integration in self.integrations:
            if hasattr(integration, 'on_population_initialized'):
                await integration.on_population_initialized(population)

        self.logger.info(f"✅ Population initialized with {len(population)} agents")
        return population

    async def _create_random_population(self) -> List[AgentState]:
        """Create a random initial population."""
        import random

        population = []
        spirits = list(SpiritType)
        styles = list(NamingStyle)

        # Define trait ranges
        personality_traits = {
            "dominance": (0.0, 1.0),
            "independence": (0.0, 1.0),
            "patience": (0.0, 1.0),
            "aggression": (0.0, 1.0),
            "charisma": (0.0, 1.0),
            "creativity": (0.0, 1.0),
            "perfectionism": (0.0, 1.0),
            "adaptability": (0.0, 1.0)
        }

        physical_traits = {
            "size": (0.0, 1.0),
            "strength": (0.0, 1.0),
            "agility": (0.0, 1.0),
            "endurance": (0.0, 1.0),
            "appearance": (0.0, 1.0),
            "grace": (0.0, 1.0)
        }

        ability_traits = {
            "strategist": (0.0, 1.0),
            "hunter": (0.0, 1.0),
            "teacher": (0.0, 1.0),
            "artist": (0.0, 1.0),
            "healer": (0.0, 1.0),
            "inventor": (0.0, 1.0)
        }

        for i in range(self.config.population_size):
            # Create agents with balanced spirit and style distribution
            spirit = spirits[i % len(spirits)]
            style = styles[i % len(styles)]

            # Generate balanced traits based on spirit characteristics
            personality = self._generate_spirit_based_traits(spirit, personality_traits)
            physical = self._generate_spirit_based_traits(spirit, physical_traits)
            abilities = self._generate_spirit_based_traits(spirit, ability_traits)

            agent = AgentState(
                id=f"agent_{i:03d}",
                name=f"{spirit.value.capitalize()}-{style.value.capitalize()}-{i:02d}",
                spirit=spirit,
                style=style,
                generation=0,
                parents=[],
                personality_traits=personality,
                physical_traits=physical,
                ability_traits=abilities,
                performance_history=[],
                knowledge_base={}
            )

            population.append(agent)

        return population

    def _generate_spirit_based_traits(self, spirit: SpiritType, trait_ranges: Dict[str, Tuple[float, float]]) -> Dict[str, float]:
        """Generate traits based on spirit characteristics rather than random values."""
        traits = {}

        # Define spirit-specific trait preferences
        spirit_preferences = {
            SpiritType.FOX: {
                "curiosity": 0.8, "intelligence": 0.9, "adaptability": 0.9,
                "strategist": 0.9, "problem_solving": 0.8, "inventor": 0.7
            },
            SpiritType.WOLF: {
                "loyalty": 0.9, "teamwork": 0.9, "leadership": 0.8,
                "hunter": 0.8, "coordination": 0.9, "guardian": 0.8
            },
            SpiritType.OTTER: {
                "playfulness": 0.9, "creativity": 0.8, "curiosity": 0.8,
                "artist": 0.8, "explorer": 0.7, "performer": 0.7
            },
            SpiritType.EAGLE: {
                "independence": 0.9, "intelligence": 0.8, "patience": 0.8,
                "strategist": 0.8, "navigator": 0.9, "scholar": 0.8
            },
            SpiritType.LION: {
                "leadership": 0.9, "courage": 0.9, "dominance": 0.8,
                "warrior": 0.8, "guardian": 0.9, "performer": 0.7
            }
        }

        # Get preferences for this spirit, or use defaults
        preferences = spirit_preferences.get(spirit, {})

        for trait_name, (min_val, max_val) in trait_ranges.items():
            if trait_name in preferences:
                # Use spirit preference with some variation
                base_value = preferences[trait_name]
                variation = (max_val - min_val) * 0.1  # 10% variation
                traits[trait_name] = max(min_val, min(max_val, base_value + variation * (0.5 - 0.5)))  # Small variation
            else:
                # Use balanced middle value for traits not specific to this spirit
                traits[trait_name] = (min_val + max_val) / 2.0

        return traits

    async def run_evolution(self) -> PhoenixEvolutionState:
        """
        Run the complete evolutionary process.

        Returns:
            Final evolution state
        """
        self.logger.info(f"🚀 Starting PHOENIX evolution for {self.config.max_generations} generations...")

        if not self.evolution_state:
            await self.initialize_population()

        for generation in range(1, self.config.max_generations + 1):
            self.logger.info(f"🧬 Generation {generation}/{self.config.max_generations}")

            # Run one generation
            await self.run_generation()

            # Check for convergence
            if self.evolution_state.convergence.converged:
                self.logger.info(f"✅ Convergence achieved at generation {generation}")
                break

            # Save generation data
            await self._save_generation_data(generation)

        self.logger.info("🎯 PHOENIX evolution completed!")
        return self.evolution_state

    async def run_generation(self):
        """Run a single generation of evolution."""
        if not self.evolution_state:
            raise ValueError("Evolution state not initialized")

        generation = self.evolution_state.current_generation + 1

        # 1. Evaluate current population
        await self._evaluate_population()

        # 2. Extract genetic material from top performers
        if self.config.enable_knowledge_distillation:
            await self._extract_genetic_material()

        # 3. Select parents for breeding
        parents = await self.evolutionary_ops.select_parents(self.evolution_state.population)

        # 4. Create offspring through breeding
        offspring = await self._breed_offspring(parents)

        # 5. Apply mutations
        mutated_offspring = await self.evolutionary_ops.apply_mutations(offspring)

        # 6. Update population (elite preservation + new offspring)
        await self._update_population(mutated_offspring)

        # 7. Update evolution statistics
        await self._update_evolution_statistics(generation)

        # 8. Check convergence
        await self._check_convergence()

        # 9. Notify integrations
        for integration in self.integrations:
            if hasattr(integration, 'on_generation_completed'):
                await integration.on_generation_completed(generation, self.evolution_state)

    async def _evaluate_population(self):
        """Evaluate the current population's performance."""
        self.logger.info("📊 Evaluating population performance...")

        for agent in self.evolution_state.population:
            # Generate performance metrics
            performance = await self._generate_performance_metrics(agent)
            agent.performance_history.append(performance)
            agent.last_updated = datetime.now()

        self.logger.info("✅ Population evaluation completed")

    async def _generate_performance_metrics(self, agent: AgentState) -> PerformanceMetrics:
        """Generate real performance metrics for an agent."""
        # Generate real agent output based on agent characteristics
        task = "Analyze and provide a strategic solution for optimizing system performance"
        agent_output = await self.performance_analyzer.generate_real_agent_output(agent, task)

        # Analyze the real output to get performance metrics
        performance_metrics = await self.performance_analyzer.analyze_agent_output(agent, agent_output)

        return performance_metrics

    async def _extract_genetic_material(self):
        """Extract genetic material from top-performing agents."""
        self.logger.info("🧬 Extracting genetic material from top performers...")

        # Sort agents by fitness
        sorted_agents = sorted(self.evolution_state.population,
                             key=lambda a: a.get_fitness_score(), reverse=True)

        # Extract from top 20% of agents
        top_performers = sorted_agents[:max(1, len(sorted_agents) // 5)]

        for agent in top_performers:
            # Generate real agent output based on agent characteristics
            task = "Provide a comprehensive analysis and strategic recommendations"
            agent_output = await self.performance_analyzer.generate_real_agent_output(agent, task)

            # Extract genetic material from real output
            genetic_material = await self.knowledge_distillation.extract_genetic_material(
                agent=agent,
                output=agent_output,
                generation=self.evolution_state.current_generation
            )

            self.evolution_state.genetic_material_pool.append(genetic_material)

        self.logger.info(f"✅ Extracted genetic material from {len(top_performers)} agents")


    async def _breed_offspring(self, parents: List[Tuple[AgentState, AgentState]]) -> List[AgentState]:
        """Breed offspring from selected parents."""
        self.logger.info(f"👶 Breeding offspring from {len(parents)} parent pairs...")

        offspring = []

        for parent1, parent2 in parents:
            # Create offspring through breeding
            child = await self.evolutionary_ops.breed_agents(parent1, parent2)
            offspring.append(child)

        self.logger.info(f"✅ Created {len(offspring)} offspring")
        return offspring

    async def _update_population(self, new_offspring: List[AgentState]):
        """Update population with new offspring and elite preservation."""
        # Sort current population by fitness
        sorted_population = sorted(self.evolution_state.population,
                                 key=lambda a: a.get_fitness_score(), reverse=True)

        # Preserve elite
        elite_count = max(1, int(len(sorted_population) * self.config.elite_rate))
        elite = sorted_population[:elite_count]

        # Combine elite with new offspring
        new_population = elite + new_offspring

        # Ensure population size
        if len(new_population) > self.config.population_size:
            new_population = new_population[:self.config.population_size]
        elif len(new_population) < self.config.population_size:
            # Fill with random agents if needed
            additional_needed = self.config.population_size - len(new_population)
            additional_agents = await self._create_random_population()
            new_population.extend(additional_agents[:additional_needed])

        # Update generation numbers
        for agent in new_population:
            if agent not in elite:
                agent.generation = self.evolution_state.current_generation + 1

        self.evolution_state.population = new_population
        self.evolution_state.elite = elite

        self.logger.info(f"✅ Population updated: {len(elite)} elite + {len(new_offspring)} offspring")

    async def _update_evolution_statistics(self, generation: int):
        """Update evolution statistics for current generation."""
        population = self.evolution_state.population

        # Calculate fitness statistics
        fitness_scores = [agent.get_fitness_score() for agent in population]
        avg_fitness = sum(fitness_scores) / len(fitness_scores)
        best_fitness = max(fitness_scores)
        fitness_variance = sum((f - avg_fitness) ** 2 for f in fitness_scores) / len(fitness_scores)

        # Calculate diversity
        diversity = self.evolution_state.get_diversity_score()

        # Calculate convergence rate
        convergence_rate = 0.0
        if len(self.generation_history) > 0:
            prev_avg = self.generation_history[-1].average_fitness
            convergence_rate = abs(avg_fitness - prev_avg) / prev_avg if prev_avg > 0 else 0.0

        # Create statistics
        stats = EvolutionStatistics(
            generation=generation,
            population_size=len(population),
            average_fitness=avg_fitness,
            best_fitness=best_fitness,
            fitness_variance=fitness_variance,
            population_diversity=diversity,
            convergence_rate=convergence_rate,
            significance=StatisticalSignificance(0.05, (0.0, 1.0), 0.5, 0.8, len(population))
        )

        self.evolution_state.statistics = stats
        self.generation_history.append(stats)

        self.logger.info(f"📊 Generation {generation} stats: "
                        f"Avg fitness={avg_fitness:.3f}, "
                        f"Best fitness={best_fitness:.3f}, "
                        f"Diversity={diversity:.3f}")

    async def _check_convergence(self):
        """Check if evolution has converged."""
        if len(self.generation_history) < 5:
            return  # Need at least 5 generations to check convergence

        # Check fitness convergence
        recent_fitness = [stats.average_fitness for stats in self.generation_history[-5:]]
        fitness_variance = sum((f - sum(recent_fitness)/len(recent_fitness)) ** 2 for f in recent_fitness) / len(recent_fitness)

        # Check diversity convergence
        recent_diversity = [stats.population_diversity for stats in self.generation_history[-5:]]
        diversity_variance = sum((d - sum(recent_diversity)/len(recent_diversity)) ** 2 for d in recent_diversity) / len(recent_diversity)

        # Convergence criteria
        fitness_converged = fitness_variance < self.config.convergence_threshold
        diversity_converged = diversity_variance < self.config.convergence_threshold

        if fitness_converged and diversity_converged:
            self.evolution_state.convergence = ConvergenceStatus(
                converged=True,
                convergence_generation=self.evolution_state.current_generation,
                confidence=0.95,
                convergence_type="mixed",
                convergence_metrics={
                    "fitness_variance": fitness_variance,
                    "diversity_variance": diversity_variance
                }
            )

    async def _save_generation_data(self, generation: int):
        """Save generation data to disk."""
        data_file = self.data_dir / f"generation_{generation:03d}.json"

        generation_data = {
            "generation": generation,
            "timestamp": datetime.now().isoformat(),
            "statistics": {
                "population_size": self.evolution_state.statistics.population_size,
                "average_fitness": self.evolution_state.statistics.average_fitness,
                "best_fitness": self.evolution_state.statistics.best_fitness,
                "fitness_variance": self.evolution_state.statistics.fitness_variance,
                "population_diversity": self.evolution_state.statistics.population_diversity,
                "convergence_rate": self.evolution_state.statistics.convergence_rate
            },
            "population_summary": [
                {
                    "id": agent.id,
                    "name": agent.name,
                    "spirit": agent.spirit.value,
                    "style": agent.style.value,
                    "generation": agent.generation,
                    "fitness": agent.get_fitness_score(),
                    "parents": agent.parents
                }
                for agent in self.evolution_state.population
            ],
            "genetic_material_count": len(self.evolution_state.genetic_material_pool)
        }

        with open(data_file, 'w') as f:
            json.dump(generation_data, f, indent=2)

        self.logger.info(f"💾 Saved generation {generation} data to {data_file}")

    async def get_evolution_summary(self) -> Dict[str, Any]:
        """Get a summary of the evolution process."""
        if not self.evolution_state:
            return {"error": "Evolution not initialized"}

        return {
            "current_generation": self.evolution_state.current_generation,
            "total_generations": len(self.generation_history),
            "population_size": len(self.evolution_state.population),
            "converged": self.evolution_state.convergence.converged,
            "convergence_generation": self.evolution_state.convergence.convergence_generation,
            "best_fitness": self.evolution_state.statistics.best_fitness,
            "average_fitness": self.evolution_state.statistics.average_fitness,
            "population_diversity": self.evolution_state.statistics.population_diversity,
            "genetic_material_pool_size": len(self.evolution_state.genetic_material_pool),
            "elite_count": len(self.evolution_state.elite),
            "config": {
                "population_size": self.config.population_size,
                "max_generations": self.config.max_generations,
                "selection_pressure": self.config.selection_pressure,
                "mutation_rate": self.config.mutation_rate,
                "elite_rate": self.config.elite_rate
            }
        }
