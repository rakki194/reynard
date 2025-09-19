#!/usr/bin/env python3
"""
Optimized ECS World Evolution Simulation with Social Interaction Tracking

Performance-optimized version that handles large populations efficiently through:
- Population capping and sampling
- Efficient social interaction algorithms
- Batch processing
- Memory optimization
- Parallel processing where possible

Author: Wit-Prime-13 (Fox Specialist)
"""

import json
import numpy as np
import matplotlib.pyplot as plt
import networkx as nx
from pathlib import Path
from typing import Dict, List, Tuple, Any, Set
import random
import time
from datetime import datetime
import sys
import os
from collections import defaultdict
import multiprocessing as mp
from functools import lru_cache

# Add the src directory to the path
sys.path.append('src')

from reynard_ecs_world.world.agent_world import AgentWorld
from reynard_ecs_world.components import (
    AgentComponent, TraitComponent, LifecycleComponent, 
    LineageComponent, ReproductionComponent, SocialComponent, PositionComponent
)


class OptimizedSocialSimulation:
    """Optimized simulation with performance improvements."""
    
    def __init__(self, population_size: int = 200, generations: int = 25, 
                 breeding_rate: float = 0.3, social_interaction_rate: float = 0.2,
                 max_population: int = 1000, sample_size: int = 500):
        """Initialize the optimized simulation."""
        self.population_size = population_size
        self.generations = generations
        self.breeding_rate = breeding_rate
        self.social_interaction_rate = social_interaction_rate
        self.max_population = max_population
        self.sample_size = sample_size
        
        # Create temporary directory for the world
        self.temp_dir = Path("temp_simulation_data")
        self.temp_dir.mkdir(exist_ok=True)
        
        # Initialize the ECS world
        self.world = AgentWorld(self.temp_dir)
        
        # Simulation data storage (optimized)
        self.simulation_data = {
            "metadata": {
                "population_size": population_size,
                "generations": generations,
                "breeding_rate": breeding_rate,
                "social_interaction_rate": social_interaction_rate,
                "max_population": max_population,
                "sample_size": sample_size,
                "start_time": datetime.now().isoformat(),
                "spirits": ["fox", "wolf", "otter", "eagle", "lion", "tiger"]
            },
            "generations": [],
            "statistics": {
                "population_over_time": [],
                "genetic_diversity": [],
                "social_networks": [],
                "social_interactions": [],
                "breeding_events": [],
                "compatibility_scores": [],
                "trait_evolution": {
                    trait: {
                        "mean_over_time": [],
                        "std_over_time": [],
                        "min_over_time": [],
                        "max_over_time": []
                    } for trait in [
                        "dominance", "loyalty", "cunning", "aggression",
                        "intelligence", "creativity", "playfulness", "patience"
                    ]
                }
            }
        }
        
        # Performance tracking
        self.start_time = time.time()
        self.generation_times = []
        
        # Caching for performance
        self._compatibility_cache = {}
        self._trait_cache = {}
        
    def create_initial_population(self) -> List[str]:
        """Create initial population with optimized trait generation."""
        print(f"🦊 Creating initial population of {self.population_size} agents...")
        
        agent_ids = []
        spirits = self.simulation_data["metadata"]["spirits"]
        
        # Pre-generate trait data for efficiency
        trait_data = self._generate_trait_batch(self.population_size)
        
        for i in range(self.population_size):
            agent_id = f"gen0_agent_{i:03d}"
            spirit = random.choice(spirits)
            style = random.choice(["foundation", "exo", "hybrid", "cyberpunk"])
            
            # Create agent
            agent = self.world.create_agent(agent_id, spirit, style)
            agent_ids.append(agent_id)
            
            # Age agent to maturity
            lifecycle = agent.get_component(LifecycleComponent)
            if lifecycle:
                lifecycle.age = random.uniform(2.0, 5.0)
            
            # Set traits from pre-generated data
            traits = agent.get_component(TraitComponent)
            if traits:
                traits.personality = trait_data[i]
            
            # Initialize social component efficiently
            social = agent.get_component(SocialComponent)
            if social:
                social.charisma = random.uniform(0.0, 1.0)
                social.leadership_ability = random.uniform(0.0, 1.0)
                social.group_activity_preference = random.uniform(0.0, 1.0)
                social.conflict_resolution_skill = random.uniform(0.0, 1.0)
        
        print(f"✅ Created {len(agent_ids)} agents")
        return agent_ids
    
    def _generate_trait_batch(self, count: int) -> List[Dict[str, float]]:
        """Pre-generate trait data for efficiency."""
        trait_names = ["dominance", "loyalty", "cunning", "aggression", 
                      "intelligence", "creativity", "playfulness", "patience"]
        
        trait_data = []
        for _ in range(count):
            traits = {trait: random.uniform(0.0, 1.0) for trait in trait_names}
            trait_data.append(traits)
        
        return trait_data
    
    def simulate_social_interactions_optimized(self, generation: int, agent_ids: List[str]) -> Dict[str, Any]:
        """Optimized social interaction simulation with sampling."""
        # Sample agents for interactions if population is too large
        if len(agent_ids) > self.sample_size:
            interaction_agents = random.sample(agent_ids, self.sample_size)
        else:
            interaction_agents = agent_ids
        
        interactions = []
        social_network = defaultdict(lambda: {
            "connections": set(),
            "influence": 0.0,
            "social_status": "neutral",
            "interaction_count": 0
        })
        
        # Calculate number of interactions based on sample size
        num_interactions = int(len(interaction_agents) * self.social_interaction_rate * 1.5)
        
        # Batch process interactions
        for _ in range(num_interactions):
            agent1_id = random.choice(interaction_agents)
            agent2_id = random.choice([a for a in interaction_agents if a != agent1_id])
            
            # Get cached compatibility
            compatibility = self._get_cached_compatibility(agent1_id, agent2_id)
            
            if compatibility > 0.3:  # Only process successful interactions
                # Simulate interaction outcome
                outcome = self._simulate_interaction_outcome_fast(compatibility)
                
                if outcome["success"]:
                    # Record interaction
                    interaction = {
                        "generation": generation,
                        "agent1": agent1_id,
                        "agent2": agent2_id,
                        "compatibility": compatibility,
                        "outcome": outcome
                    }
                    interactions.append(interaction)
                    
                    # Update network efficiently
                    social_network[agent1_id]["connections"].add(agent2_id)
                    social_network[agent2_id]["connections"].add(agent1_id)
                    social_network[agent1_id]["influence"] += outcome["influence_change"]
                    social_network[agent1_id]["interaction_count"] += 1
                    social_network[agent2_id]["interaction_count"] += 1
        
        # Convert sets to lists for JSON serialization
        for agent_id in social_network:
            social_network[agent_id]["connections"] = list(social_network[agent_id]["connections"])
        
        return {
            "interactions": interactions,
            "social_network": dict(social_network),
            "total_interactions": len(interactions),
            "successful_interactions": len(interactions),
            "average_compatibility": np.mean([i["compatibility"] for i in interactions]) if interactions else 0.0
        }
    
    @lru_cache(maxsize=10000)
    def _get_cached_compatibility(self, agent1_id: str, agent2_id: str) -> float:
        """Get cached compatibility score."""
        try:
            compatibility = self.world.analyze_genetic_compatibility(agent1_id, agent2_id)
            return compatibility["compatibility"]
        except:
            return 0.0
    
    def _simulate_interaction_outcome_fast(self, compatibility: float) -> Dict[str, Any]:
        """Fast interaction outcome simulation."""
        success_prob = compatibility * 0.8 + 0.2
        success = random.random() < success_prob
        
        if success:
            influence_change = random.uniform(0.01, 0.05) * compatibility
            return {
                "success": True,
                "influence_change": influence_change,
                "outcome_type": "positive"
            }
        else:
            return {
                "success": False,
                "influence_change": 0.0,
                "outcome_type": "neutral"
            }
    
    def simulate_breeding_optimized(self, generation: int, agent_ids: List[str]) -> List[str]:
        """Optimized breeding simulation with population capping."""
        print(f"🧬 Simulating breeding for generation {generation}...")
        
        # Get mature agents efficiently
        mature_agents = []
        for agent_id in agent_ids:
            agent = self.world.get_entity(agent_id)
            if agent:
                lifecycle = agent.get_component(LifecycleComponent)
                if lifecycle and lifecycle.age >= 2.0:
                    mature_agents.append(agent_id)
        
        print(f"   Found {len(mature_agents)} mature agents")
        
        # Apply population cap
        if len(agent_ids) >= self.max_population:
            print(f"   Population cap reached ({self.max_population}), reducing breeding rate")
            breeding_rate = self.breeding_rate * 0.5
        else:
            breeding_rate = self.breeding_rate
        
        # Calculate breeding events
        breeding_events = int(len(mature_agents) * breeding_rate)
        new_agents = []
        
        # Batch process breeding
        for _ in range(breeding_events):
            if len(mature_agents) < 2:
                break
                
            # Select parents efficiently
            parent1 = random.choice(mature_agents)
            parent2 = random.choice([a for a in mature_agents if a != parent1])
            
            # Check compatibility with caching
            compatibility = self._get_cached_compatibility(parent1, parent2)
            
            # Breed if compatible enough
            if compatibility >= 0.2:
                offspring_id = f"gen{generation}_agent_{len(new_agents):03d}"
                offspring = self.world.create_offspring(parent1, parent2, offspring_id)
                
                if offspring:
                    new_agents.append(offspring_id)
                    
                    # Record breeding event
                    breeding_event = {
                        "generation": generation,
                        "parent1": parent1,
                        "parent2": parent2,
                        "offspring": offspring_id,
                        "compatibility": compatibility
                    }
                    self.simulation_data["statistics"]["breeding_events"].append(breeding_event)
                    self.simulation_data["statistics"]["compatibility_scores"].append(compatibility)
        
        print(f"   Created {len(new_agents)} offspring from {len(new_agents)} breeding events")
        return new_agents
    
    def collect_generation_statistics_optimized(self, generation: int, agent_ids: List[str], 
                                              social_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimized statistics collection with sampling."""
        print(f"📊 Collecting statistics for generation {generation}...")
        
        # Sample agents for trait analysis if population is too large
        if len(agent_ids) > self.sample_size:
            sample_agents = random.sample(agent_ids, self.sample_size)
        else:
            sample_agents = agent_ids
        
        # Basic population stats
        stats = {
            "generation": generation,
            "population_size": len(agent_ids),
            "sample_size": len(sample_agents),
            "timestamp": time.time()
        }
        
        # Efficient trait statistics collection
        trait_values = {trait: [] for trait in [
            "dominance", "loyalty", "cunning", "aggression",
            "intelligence", "creativity", "playfulness", "patience"
        ]}
        
        for agent_id in sample_agents:
            agent = self.world.get_entity(agent_id)
            if agent:
                traits = agent.get_component(TraitComponent)
                if traits and traits.personality:
                    for trait in trait_values:
                        if trait in traits.personality:
                            trait_values[trait].append(traits.personality[trait])
        
        # Calculate trait statistics efficiently
        stats["trait_statistics"] = {}
        for trait, values in trait_values.items():
            if values:
                stats["trait_statistics"][trait] = {
                    "mean": np.mean(values),
                    "std": np.std(values),
                    "min": np.min(values),
                    "max": np.max(values)
                }
                
                # Store in simulation data
                self.simulation_data["statistics"]["trait_evolution"][trait]["mean_over_time"].append(np.mean(values))
                self.simulation_data["statistics"]["trait_evolution"][trait]["std_over_time"].append(np.std(values))
                self.simulation_data["statistics"]["trait_evolution"][trait]["min_over_time"].append(np.min(values))
                self.simulation_data["statistics"]["trait_evolution"][trait]["max_over_time"].append(np.max(values))
        
        # Social statistics
        stats["social_statistics"] = {
            "total_interactions": social_data["total_interactions"],
            "successful_interactions": social_data["successful_interactions"],
            "interaction_success_rate": social_data["successful_interactions"] / social_data["total_interactions"] if social_data["total_interactions"] > 0 else 0,
            "average_compatibility": social_data["average_compatibility"],
            "network_density": self._calculate_network_density_fast(social_data["social_network"])
        }
        
        # Genetic diversity (sampled)
        all_traits = []
        for trait_list in trait_values.values():
            all_traits.extend(trait_list)
        
        if all_traits:
            stats["genetic_diversity"] = np.std(all_traits)
        else:
            stats["genetic_diversity"] = 0.0
        
        self.simulation_data["statistics"]["genetic_diversity"].append(stats["genetic_diversity"])
        self.simulation_data["statistics"]["population_over_time"].append(len(agent_ids))
        
        # Store social network data (sampled)
        self.simulation_data["statistics"]["social_networks"].append(social_data["social_network"])
        self.simulation_data["statistics"]["social_interactions"].extend(social_data["interactions"])
        
        print(f"   Population: {len(agent_ids)} agents (sampled: {len(sample_agents)})")
        print(f"   Genetic diversity: {stats['genetic_diversity']:.3f}")
        print(f"   Social interactions: {social_data['total_interactions']}")
        print(f"   Network density: {stats['social_statistics']['network_density']:.3f}")
        
        return stats
    
    def _calculate_network_density_fast(self, social_network: Dict[str, Any]) -> float:
        """Fast network density calculation."""
        if not social_network:
            return 0.0
        
        total_possible_connections = len(social_network) * (len(social_network) - 1) / 2
        actual_connections = sum(len(data["connections"]) for data in social_network.values()) / 2
        
        if total_possible_connections > 0:
            return actual_connections / total_possible_connections
        return 0.0
    
    def run_simulation(self) -> Dict[str, Any]:
        """Run the optimized simulation."""
        print("🌍 Starting Optimized ECS World Evolution Simulation")
        print("=" * 70)
        print(f"📊 Configuration:")
        print(f"   Initial Population: {self.population_size}")
        print(f"   Generations: {self.generations}")
        print(f"   Max Population: {self.max_population}")
        print(f"   Sample Size: {self.sample_size}")
        print(f"   Breeding Rate: {self.breeding_rate}")
        print(f"   Social Interaction Rate: {self.social_interaction_rate}")
        print("=" * 70)
        
        # Create initial population
        agent_ids = self.create_initial_population()
        
        # Collect initial statistics
        initial_social_data = self.simulate_social_interactions_optimized(0, agent_ids)
        initial_stats = self.collect_generation_statistics_optimized(0, agent_ids, initial_social_data)
        self.simulation_data["generations"].append({
            "generation": 0,
            "agents": [{"id": aid} for aid in agent_ids],
            "statistics": initial_stats
        })
        
        # Run simulation for specified generations
        for generation in range(1, self.generations + 1):
            gen_start_time = time.time()
            print(f"\n🧬 Generation {generation}/{self.generations}")
            print("-" * 40)
            
            # Simulate social interactions
            social_data = self.simulate_social_interactions_optimized(generation, agent_ids)
            
            # Simulate breeding
            new_agents = self.simulate_breeding_optimized(generation, agent_ids)
            agent_ids.extend(new_agents)
            
            # Age all agents efficiently
            for agent_id in agent_ids:
                agent = self.world.get_entity(agent_id)
                if agent:
                    lifecycle = agent.get_component(LifecycleComponent)
                    if lifecycle:
                        lifecycle.age += 1.0
            
            # Collect statistics
            stats = self.collect_generation_statistics_optimized(generation, agent_ids, social_data)
            self.simulation_data["generations"].append({
                "generation": generation,
                "agents": [{"id": aid} for aid in agent_ids],
                "statistics": stats
            })
            
            # Track generation time
            gen_time = time.time() - gen_start_time
            self.generation_times.append(gen_time)
            print(f"   Generation time: {gen_time:.2f}s")
            
            # Clear caches periodically to prevent memory issues
            if generation % 5 == 0:
                self._compatibility_cache.clear()
                self._trait_cache.clear()
                print(f"   Cleared caches at generation {generation}")
        
        # Finalize simulation
        self.simulation_data["metadata"]["end_time"] = datetime.now().isoformat()
        self.simulation_data["metadata"]["duration_seconds"] = time.time() - self.start_time
        self.simulation_data["metadata"]["generation_times"] = self.generation_times
        self.simulation_data["metadata"]["average_generation_time"] = np.mean(self.generation_times)
        
        print(f"\n✅ Optimized simulation completed!")
        print(f"   Total generations: {self.generations + 1}")
        print(f"   Final population: {len(agent_ids)} agents")
        print(f"   Total breeding events: {len(self.simulation_data['statistics']['breeding_events'])}")
        print(f"   Total social interactions: {len(self.simulation_data['statistics']['social_interactions'])}")
        print(f"   Total duration: {self.simulation_data['metadata']['duration_seconds']:.2f} seconds")
        print(f"   Average generation time: {self.simulation_data['metadata']['average_generation_time']:.2f} seconds")
        
        return self.simulation_data
    
    def save_simulation_data(self, filename: str = "optimized_social_simulation_data.json") -> Path:
        """Save the simulation data to JSON file."""
        output_path = self.temp_dir / filename
        with open(output_path, 'w') as f:
            json.dump(self.simulation_data, f, indent=2)
        print(f"💾 Optimized simulation data saved to: {output_path}")
        return output_path
    
    def create_performance_visualizations(self) -> Path:
        """Create visualizations including performance metrics."""
        print("📊 Creating performance visualizations...")
        
        fig = plt.figure(figsize=(16, 12))
        
        # 1. Population growth over time
        ax1 = plt.subplot(2, 3, 1)
        generations = list(range(len(self.simulation_data["statistics"]["population_over_time"])))
        population = self.simulation_data["statistics"]["population_over_time"]
        ax1.plot(generations, population, 'b-', linewidth=3, marker='o', markersize=6)
        ax1.set_title('Population Growth Over Time', fontsize=14, fontweight='bold')
        ax1.set_xlabel('Generation')
        ax1.set_ylabel('Population Size')
        ax1.grid(True, alpha=0.3)
        
        # 2. Generation processing time
        ax2 = plt.subplot(2, 3, 2)
        gen_times = self.simulation_data["metadata"]["generation_times"]
        ax2.plot(range(1, len(gen_times) + 1), gen_times, 'r-', linewidth=2, marker='s', markersize=4)
        ax2.set_title('Generation Processing Time', fontsize=14, fontweight='bold')
        ax2.set_xlabel('Generation')
        ax2.set_ylabel('Time (seconds)')
        ax2.grid(True, alpha=0.3)
        
        # 3. Genetic diversity over time
        ax3 = plt.subplot(2, 3, 3)
        diversity = self.simulation_data["statistics"]["genetic_diversity"]
        ax3.plot(generations, diversity, 'g-', linewidth=3, marker='^', markersize=6)
        ax3.set_title('Genetic Diversity Over Time', fontsize=14, fontweight='bold')
        ax3.set_xlabel('Generation')
        ax3.set_ylabel('Genetic Diversity (Std Dev)')
        ax3.grid(True, alpha=0.3)
        
        # 4. Social interaction success rate
        ax4 = plt.subplot(2, 3, 4)
        success_rates = []
        for gen_data in self.simulation_data["generations"]:
            if "social_statistics" in gen_data["statistics"]:
                success_rates.append(gen_data["statistics"]["social_statistics"]["interaction_success_rate"])
            else:
                success_rates.append(0.0)
        ax4.plot(generations, success_rates, 'm-', linewidth=3, marker='d', markersize=6)
        ax4.set_title('Social Interaction Success Rate', fontsize=14, fontweight='bold')
        ax4.set_xlabel('Generation')
        ax4.set_ylabel('Success Rate')
        ax4.grid(True, alpha=0.3)
        
        # 5. Network density over time
        ax5 = plt.subplot(2, 3, 5)
        network_densities = []
        for gen_data in self.simulation_data["generations"]:
            if "social_statistics" in gen_data["statistics"]:
                network_densities.append(gen_data["statistics"]["social_statistics"]["network_density"])
            else:
                network_densities.append(0.0)
        ax5.plot(generations, network_densities, 'c-', linewidth=3, marker='p', markersize=6)
        ax5.set_title('Social Network Density', fontsize=14, fontweight='bold')
        ax5.set_xlabel('Generation')
        ax5.set_ylabel('Network Density')
        ax5.grid(True, alpha=0.3)
        
        # 6. Performance summary
        ax6 = plt.subplot(2, 3, 6)
        ax6.axis('off')
        summary_text = f"""
        Optimized Simulation Summary:
        
        Generations: {len(generations)}
        Final Population: {population[-1]}
        Max Population: {self.max_population}
        Sample Size: {self.sample_size}
        
        Total Breeding Events: {len(self.simulation_data['statistics']['breeding_events'])}
        Total Social Interactions: {len(self.simulation_data['statistics']['social_interactions'])}
        
        Performance:
        Total Duration: {self.simulation_data['metadata']['duration_seconds']:.1f}s
        Avg Generation Time: {self.simulation_data['metadata']['average_generation_time']:.2f}s
        Final Genetic Diversity: {diversity[-1]:.3f}
        Final Network Density: {network_densities[-1]:.3f}
        """
        ax6.text(0.1, 0.9, summary_text, transform=ax6.transAxes, fontsize=10,
                 verticalalignment='top', fontfamily='monospace',
                 bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.8))
        
        plt.tight_layout()
        
        # Save the plot
        plot_path = self.temp_dir / "optimized_social_analysis.png"
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"📊 Performance visualizations saved to: {plot_path}")
        return plot_path


def main():
    """Run the optimized social simulation."""
    print("🚀 Optimized ECS World Evolution Simulation with Social Tracking")
    print("=" * 70)
    
    # Create and run optimized simulation
    simulation = OptimizedSocialSimulation(
        population_size=200,
        generations=25,
        breeding_rate=0.3,
        social_interaction_rate=0.2,  # Reduced for performance
        max_population=1000,  # Population cap
        sample_size=500  # Sampling for large populations
    )
    
    # Run simulation
    simulation_data = simulation.run_simulation()
    
    # Save data
    data_path = simulation.save_simulation_data()
    
    # Create visualizations
    plot_path = simulation.create_performance_visualizations()
    
    print(f"\n🎉 Optimized simulation completed successfully!")
    print(f"📁 Data saved to: {data_path}")
    print(f"📊 Plots saved to: {plot_path}")
    
    return simulation_data


if __name__ == "__main__":
    main()
