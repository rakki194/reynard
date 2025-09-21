"""
Real Fitness Analyzer

Replaces simulated fitness distributions with real fitness data analysis.

Author: Reynard-Director-36
Version: 1.0.0
"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Tuple

import numpy as np

from ..utils.data_structures import AgentState, EvolutionStatistics, PerformanceMetrics

logger = logging.getLogger(__name__)


class RealFitnessAnalyzer:
    """
    Real fitness analyzer that processes actual agent performance data.
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # Fitness calculation weights
        self.fitness_weights = {
            "accuracy": 0.3,
            "efficiency": 0.2,
            "creativity": 0.15,
            "consistency": 0.15,
            "generalization": 0.2,
        }

        # Performance thresholds
        self.performance_thresholds = {
            "excellent": 0.8,
            "good": 0.6,
            "average": 0.4,
            "poor": 0.2,
        }

    async def analyze_generation_fitness(
        self, agents: List[AgentState]
    ) -> EvolutionStatistics:
        """
        Analyze real fitness data for a generation of agents.
        """
        self.logger.info(f"📊 Analyzing fitness for {len(agents)} agents")

        if not agents:
            return self._create_empty_statistics()

        # Extract fitness scores from agent performance history
        fitness_scores = []
        performance_metrics = []

        for agent in agents:
            if agent.performance_history:
                # Use the most recent performance metrics
                latest_performance = agent.performance_history[-1]
                fitness_scores.append(latest_performance.fitness)
                performance_metrics.append(latest_performance)
            else:
                # Calculate fitness from agent traits if no performance history
                calculated_fitness = self._calculate_fitness_from_traits(agent)
                fitness_scores.append(calculated_fitness)

        if not fitness_scores:
            return self._create_empty_statistics()

        # Calculate statistics
        fitness_array = np.array(fitness_scores)

        average_fitness = np.mean(fitness_array)
        fitness_variance = np.var(fitness_array)
        fitness_std = np.std(fitness_array)
        min_fitness = np.min(fitness_array)
        max_fitness = np.max(fitness_array)
        median_fitness = np.median(fitness_array)

        # Calculate performance distribution
        performance_distribution = self._calculate_performance_distribution(
            fitness_array
        )

        # Calculate diversity metrics
        diversity_score = self._calculate_diversity_score(agents)

        # Calculate convergence metrics
        convergence_metrics = self._calculate_convergence_metrics(fitness_array)

        return EvolutionStatistics(
            generation=0,  # Will be set by caller
            population_size=len(agents),
            average_fitness=average_fitness,
            fitness_variance=fitness_variance,
            fitness_std=fitness_std,
            min_fitness=min_fitness,
            max_fitness=max_fitness,
            median_fitness=median_fitness,
            performance_distribution=performance_distribution,
            diversity_score=diversity_score,
            convergence_metrics=convergence_metrics,
            timestamp=datetime.now(),
        )

    def _create_empty_statistics(self) -> EvolutionStatistics:
        """Create empty statistics when no agents are available."""
        return EvolutionStatistics(
            generation=0,
            population_size=0,
            average_fitness=0.0,
            fitness_variance=0.0,
            fitness_std=0.0,
            min_fitness=0.0,
            max_fitness=0.0,
            median_fitness=0.0,
            performance_distribution={},
            diversity_score=0.0,
            convergence_metrics={},
            timestamp=datetime.now(),
        )

    def _calculate_fitness_from_traits(self, agent: AgentState) -> float:
        """Calculate fitness from agent traits when no performance history exists."""
        # Base fitness from personality traits
        personality_fitness = 0.0
        personality_count = 0

        for trait, value in agent.personality_traits.items():
            personality_fitness += value
            personality_count += 1

        if personality_count > 0:
            personality_fitness /= personality_count

        # Ability fitness
        ability_fitness = 0.0
        ability_count = 0

        for trait, value in agent.ability_traits.items():
            ability_fitness += value
            ability_count += 1

        if ability_count > 0:
            ability_fitness /= ability_count

        # Physical fitness
        physical_fitness = 0.0
        physical_count = 0

        for trait, value in agent.physical_traits.items():
            physical_fitness += value
            physical_count += 1

        if physical_count > 0:
            physical_fitness /= physical_count

        # Weighted combination
        total_fitness = (
            personality_fitness * 0.4 + ability_fitness * 0.4 + physical_fitness * 0.2
        )

        return min(total_fitness, 1.0)

    def _calculate_performance_distribution(
        self, fitness_scores: np.ndarray
    ) -> Dict[str, int]:
        """Calculate performance distribution across quality levels."""
        distribution = {"excellent": 0, "good": 0, "average": 0, "poor": 0}

        for score in fitness_scores:
            if score >= self.performance_thresholds["excellent"]:
                distribution["excellent"] += 1
            elif score >= self.performance_thresholds["good"]:
                distribution["good"] += 1
            elif score >= self.performance_thresholds["average"]:
                distribution["average"] += 1
            else:
                distribution["poor"] += 1

        return distribution

    def _calculate_diversity_score(self, agents: List[AgentState]) -> float:
        """Calculate diversity score based on agent characteristics."""
        if len(agents) <= 1:
            return 0.0

        # Spirit diversity
        spirits = [agent.spirit for agent in agents]
        unique_spirits = len(set(spirits))
        spirit_diversity = unique_spirits / len(agents)

        # Style diversity
        styles = [agent.style for agent in agents]
        unique_styles = len(set(styles))
        style_diversity = unique_styles / len(agents)

        # Trait diversity (average variance across traits)
        trait_diversities = []

        # Collect all trait values
        all_personality_traits = {}
        all_ability_traits = {}
        all_physical_traits = {}

        for agent in agents:
            for trait, value in agent.personality_traits.items():
                if trait not in all_personality_traits:
                    all_personality_traits[trait] = []
                all_personality_traits[trait].append(value)

            for trait, value in agent.ability_traits.items():
                if trait not in all_ability_traits:
                    all_ability_traits[trait] = []
                all_ability_traits[trait].append(value)

            for trait, value in agent.physical_traits.items():
                if trait not in all_physical_traits:
                    all_physical_traits[trait] = []
                all_physical_traits[trait].append(value)

        # Calculate variance for each trait
        for trait_values in all_personality_traits.values():
            if len(trait_values) > 1:
                trait_diversities.append(np.var(trait_values))

        for trait_values in all_ability_traits.values():
            if len(trait_values) > 1:
                trait_diversities.append(np.var(trait_values))

        for trait_values in all_physical_traits.values():
            if len(trait_values) > 1:
                trait_diversities.append(np.var(trait_values))

        # Average trait diversity
        trait_diversity = np.mean(trait_diversities) if trait_diversities else 0.0

        # Combined diversity score
        total_diversity = (
            spirit_diversity * 0.3 + style_diversity * 0.2 + trait_diversity * 0.5
        )

        return min(total_diversity, 1.0)

    def _calculate_convergence_metrics(
        self, fitness_scores: np.ndarray
    ) -> Dict[str, float]:
        """Calculate convergence metrics for the population."""
        if len(fitness_scores) <= 1:
            return {"convergence_rate": 0.0, "stability": 0.0}

        # Convergence rate (inverse of standard deviation)
        std_dev = np.std(fitness_scores)
        convergence_rate = 1.0 / (1.0 + std_dev) if std_dev > 0 else 1.0

        # Stability (how close scores are to the mean)
        mean_score = np.mean(fitness_scores)
        deviations = np.abs(fitness_scores - mean_score)
        stability = 1.0 - np.mean(deviations)

        return {"convergence_rate": convergence_rate, "stability": max(stability, 0.0)}

    async def get_real_fitness_distribution(
        self, agents: List[AgentState], n_samples: int = 100
    ) -> np.ndarray:
        """
        Get real fitness distribution from actual agent data.
        Replaces the simulated fitness distribution.
        """
        if not agents:
            return np.array([])

        # Extract actual fitness scores
        fitness_scores = []

        for agent in agents:
            if agent.performance_history:
                # Use actual performance metrics
                for performance in agent.performance_history:
                    fitness_scores.append(performance.fitness)
            else:
                # Calculate from traits
                calculated_fitness = self._calculate_fitness_from_traits(agent)
                fitness_scores.append(calculated_fitness)

        if not fitness_scores:
            return np.array([])

        # If we have enough samples, return them directly
        if len(fitness_scores) >= n_samples:
            return np.array(fitness_scores[:n_samples])

        # If we need more samples, use systematic sampling
        fitness_array = np.array(fitness_scores)
        # Use systematic sampling instead of random bootstrap
        step = len(fitness_array) / n_samples
        bootstrap_samples = np.array(
            [fitness_array[int(i * step)] for i in range(n_samples)]
        )

        return bootstrap_samples

    async def compare_generations(
        self, generation1: List[AgentState], generation2: List[AgentState]
    ) -> Dict[str, Any]:
        """
        Compare fitness between two generations using real data.
        """
        self.logger.info("📈 Comparing fitness between generations")

        # Analyze both generations
        stats1 = await self.analyze_generation_fitness(generation1)
        stats2 = await self.analyze_generation_fitness(generation2)

        # Calculate improvement metrics
        fitness_improvement = stats2.average_fitness - stats1.average_fitness
        variance_change = stats2.fitness_variance - stats1.fitness_variance
        diversity_change = stats2.diversity_score - stats1.diversity_score

        # Calculate statistical significance
        fitness1 = await self.get_real_fitness_distribution(generation1)
        fitness2 = await self.get_real_fitness_distribution(generation2)

        if len(fitness1) > 0 and len(fitness2) > 0:
            # Perform t-test
            from scipy import stats

            t_stat, p_value = stats.ttest_ind(fitness2, fitness1)

            # Calculate effect size (Cohen's d)
            pooled_std = np.sqrt((np.var(fitness1) + np.var(fitness2)) / 2)
            effect_size = (
                (np.mean(fitness2) - np.mean(fitness1)) / pooled_std
                if pooled_std > 0
                else 0.0
            )
        else:
            t_stat, p_value, effect_size = 0.0, 1.0, 0.0

        return {
            "generation1_stats": stats1,
            "generation2_stats": stats2,
            "fitness_improvement": fitness_improvement,
            "variance_change": variance_change,
            "diversity_change": diversity_change,
            "t_statistic": t_stat,
            "p_value": p_value,
            "effect_size": effect_size,
            "is_significant": p_value < 0.05,
            "improvement_direction": (
                "positive" if fitness_improvement > 0 else "negative"
            ),
        }
