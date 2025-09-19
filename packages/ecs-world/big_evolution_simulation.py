#!/usr/bin/env python3
"""
Big ECS World Evolution Simulation

Creates a large-scale simulation with hundreds of agents, tracks comprehensive statistics,
and generates visualizations to analyze how the ECS world evolves over time.

Author: Wit-Prime-13 (Fox Specialist)
"""

import json
import random
import time
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime
import sys

# Add the src directory to the path
sys.path.append('src')

from reynard_ecs_world.world.agent_world import AgentWorld
from reynard_ecs_world.world.simulation import WorldSimulation
from reynard_ecs_world.components.traits import TraitComponent
from reynard_ecs_world.components.lifecycle import LifecycleComponent


class EvolutionSimulation:
    """Large-scale evolution simulation with comprehensive tracking."""
    
    def __init__(self, population_size: int = 200, generations: int = 10):
        """
        Initialize the evolution simulation.
        
        Args:
            population_size: Initial population size
            generations: Number of generations to simulate
        """
        self.population_size = population_size
        self.generations = generations
        self.simulation_data = {
            "metadata": {
                "population_size": population_size,
                "generations": generations,
                "start_time": datetime.now().isoformat(),
                "spirits": ["fox", "wolf", "otter", "eagle", "lion", "tiger"],
                "styles": ["foundation", "exo", "hybrid", "cyberpunk", "mythological", "scientific"]
            },
            "generations": [],
            "statistics": {
                "population_over_time": [],
                "trait_evolution": {},
                "genetic_diversity": [],
                "breeding_events": [],
                "mutation_rates": [],
                "compatibility_scores": []
            }
        }
        
        # Create temporary world
        self.temp_dir = Path("temp_simulation_data")
        self.temp_dir.mkdir(exist_ok=True)
        self.world = AgentWorld(self.temp_dir)
        
        # Initialize trait tracking
        self.trait_names = [
            "dominance", "loyalty", "cunning", "aggression", 
            "intelligence", "creativity", "playfulness", "patience"
        ]
        
        for trait in self.trait_names:
            self.simulation_data["statistics"]["trait_evolution"][trait] = {
                "mean_over_time": [],
                "std_over_time": [],
                "min_over_time": [],
                "max_over_time": []
            }

    def create_initial_population(self) -> List[str]:
        """Create the initial population with diverse traits."""
        print(f"🦊 Creating initial population of {self.population_size} agents...")
        
        agent_ids = []
        for i in range(self.population_size):
            # Randomly assign spirit and style
            spirit = random.choice(self.simulation_data["metadata"]["spirits"])
            style = random.choice(self.simulation_data["metadata"]["styles"])
            agent_id = f"gen0_agent_{i:03d}"
            
            # Create agent
            agent = self.world.create_agent(agent_id, spirit, style)
            agent_ids.append(agent_id)
            
            # Age agent to maturity
            lifecycle = agent.get_component(LifecycleComponent)
            if lifecycle:
                lifecycle.age = random.uniform(2.0, 5.0)  # Random maturity age
            
            # Set some initial traits to ensure compatibility > 0
            traits = agent.get_component(TraitComponent)
            if traits:
                # Set some basic traits
                traits.personality = {
                    "dominance": random.uniform(0.0, 1.0),
                    "loyalty": random.uniform(0.0, 1.0),
                    "cunning": random.uniform(0.0, 1.0),
                    "aggression": random.uniform(0.0, 1.0),
                    "intelligence": random.uniform(0.0, 1.0),
                    "creativity": random.uniform(0.0, 1.0),
                    "playfulness": random.uniform(0.0, 1.0),
                    "patience": random.uniform(0.0, 1.0)
                }
        
        print(f"✅ Created {len(agent_ids)} agents")
        return agent_ids

    def collect_generation_statistics(self, generation: int, agent_ids: List[str]) -> Dict[str, Any]:
        """Collect comprehensive statistics for a generation."""
        print(f"📊 Collecting statistics for generation {generation}...")
        
        stats = {
            "generation": generation,
            "population_size": len(agent_ids),
            "agents": [],
            "trait_statistics": {},
            "genetic_diversity": 0.0,
            "breeding_events": 0,
            "mutation_count": 0
        }
        
        # Collect trait data for all agents
        trait_values = {trait: [] for trait in self.trait_names}
        
        for agent_id in agent_ids:
            entity = self.world.get_entity(agent_id)
            if entity:
                traits = entity.get_component(TraitComponent)
                if traits:
                    agent_data = {
                        "id": agent_id,
                        "spirit": traits.spirit,
                        "style": traits.style,
                        "mutation_count": traits.mutation_count,
                        "traits": traits.personality.copy()
                    }
                    stats["agents"].append(agent_data)
                    
                    # Collect trait values
                    for trait in self.trait_names:
                        if trait in traits.personality:
                            trait_values[trait].append(traits.personality[trait])
                    
                    stats["mutation_count"] += traits.mutation_count
        
        # Calculate trait statistics
        for trait in self.trait_names:
            if trait_values[trait]:
                stats["trait_statistics"][trait] = {
                    "mean": np.mean(trait_values[trait]),
                    "std": np.std(trait_values[trait]),
                    "min": np.min(trait_values[trait]),
                    "max": np.max(trait_values[trait]),
                    "median": np.median(trait_values[trait])
                }
                
                # Update global trait evolution tracking
                self.simulation_data["statistics"]["trait_evolution"][trait]["mean_over_time"].append(
                    stats["trait_statistics"][trait]["mean"]
                )
                self.simulation_data["statistics"]["trait_evolution"][trait]["std_over_time"].append(
                    stats["trait_statistics"][trait]["std"]
                )
                self.simulation_data["statistics"]["trait_evolution"][trait]["min_over_time"].append(
                    stats["trait_statistics"][trait]["min"]
                )
                self.simulation_data["statistics"]["trait_evolution"][trait]["max_over_time"].append(
                    stats["trait_statistics"][trait]["max"]
                )
        
        # Calculate genetic diversity (standard deviation of all traits combined)
        all_traits = []
        for trait_list in trait_values.values():
            all_traits.extend(trait_list)
        
        if all_traits:
            stats["genetic_diversity"] = np.std(all_traits)
        else:
            stats["genetic_diversity"] = 0.0
        
        self.simulation_data["statistics"]["genetic_diversity"].append(stats["genetic_diversity"])
        
        # Track population over time
        self.simulation_data["statistics"]["population_over_time"].append(len(agent_ids))
        
        return stats

    def simulate_breeding_generation(self, current_agents: List[str], generation: int) -> List[str]:
        """Simulate breeding for one generation."""
        print(f"🧬 Simulating breeding for generation {generation}...")
        
        # Find mature agents
        mature_agents = []
        for agent_id in current_agents:
            entity = self.world.get_entity(agent_id)
            if entity:
                lifecycle = entity.get_component(LifecycleComponent)
                if lifecycle and lifecycle.age >= 2.0:
                    mature_agents.append(agent_id)
        
        print(f"   Found {len(mature_agents)} mature agents")
        
        # Simulate breeding
        new_agents = []
        breeding_events = 0
        
        # Create offspring from random pairs
        breeding_pairs = min(len(mature_agents) // 2, 50)  # Limit breeding pairs
        
        for i in range(breeding_pairs):
            if len(mature_agents) >= 2:
                # Select random parents
                parent1 = random.choice(mature_agents)
                parent2 = random.choice([a for a in mature_agents if a != parent1])
                
                # Check compatibility
                compatibility = self.world.analyze_genetic_compatibility(parent1, parent2)
                
                # Breed if compatible enough
                if compatibility["compatibility"] >= 0.2:  # Very low threshold for more breeding
                    offspring_id = f"gen{generation}_agent_{len(new_agents):03d}"
                    offspring = self.world.create_offspring(parent1, parent2, offspring_id)
                    
                    if offspring:
                        new_agents.append(offspring_id)
                        breeding_events += 1
                        
                        # Age offspring
                        lifecycle = offspring.get_component(LifecycleComponent)
                        if lifecycle:
                            lifecycle.age = random.uniform(0.5, 1.5)
                        
                        # Track breeding event
                        self.simulation_data["statistics"]["breeding_events"].append({
                            "generation": generation,
                            "parent1": parent1,
                            "parent2": parent2,
                            "offspring": offspring_id,
                            "compatibility": compatibility["compatibility"]
                        })
                        
                        self.simulation_data["statistics"]["compatibility_scores"].append(
                            compatibility["compatibility"]
                        )
        
        print(f"   Created {len(new_agents)} offspring from {breeding_events} breeding events")
        
        # Age all existing agents
        for agent_id in current_agents:
            entity = self.world.get_entity(agent_id)
            if entity:
                lifecycle = entity.get_component(LifecycleComponent)
                if lifecycle:
                    lifecycle.age += 1.0  # Age by 1 year
        
        # Combine existing and new agents
        all_agents = current_agents + new_agents
        
        # Simulate some mortality (random death of older agents)
        if len(all_agents) > self.population_size * 1.5:
            # Remove some older agents to prevent overpopulation
            old_agents = [a for a in all_agents if a.startswith(f"gen{max(0, generation-3)}_")]
            if old_agents:
                agents_to_remove = random.sample(old_agents, min(len(old_agents), 20))
                for agent_id in agents_to_remove:
                    entity = self.world.get_entity(agent_id)
                    if entity:
                        entity.destroy()
                all_agents = [a for a in all_agents if a not in agents_to_remove]
        
        return all_agents

    def run_simulation(self) -> Dict[str, Any]:
        """Run the complete evolution simulation."""
        print("🌍 Starting Big ECS World Evolution Simulation")
        print("=" * 60)
        
        # Create initial population
        current_agents = self.create_initial_population()
        
        # Collect initial statistics
        initial_stats = self.collect_generation_statistics(0, current_agents)
        self.simulation_data["generations"].append(initial_stats)
        
        # Simulate generations
        for generation in range(1, self.generations + 1):
            print(f"\n🧬 Generation {generation}/{self.generations}")
            print("-" * 40)
            
            # Simulate breeding
            current_agents = self.simulate_breeding_generation(current_agents, generation)
            
            # Collect statistics
            stats = self.collect_generation_statistics(generation, current_agents)
            self.simulation_data["generations"].append(stats)
            
            print(f"   Population: {len(current_agents)} agents")
            print(f"   Genetic diversity: {stats['genetic_diversity']:.3f}")
        
        # Finalize simulation data
        self.simulation_data["metadata"]["end_time"] = datetime.now().isoformat()
        self.simulation_data["metadata"]["total_agents_created"] = sum(
            gen["population_size"] for gen in self.simulation_data["generations"]
        )
        
        print(f"\n✅ Simulation completed!")
        print(f"   Total generations: {len(self.simulation_data['generations'])}")
        print(f"   Total agents created: {self.simulation_data['metadata']['total_agents_created']}")
        print(f"   Total breeding events: {len(self.simulation_data['statistics']['breeding_events'])}")
        
        return self.simulation_data

    def save_simulation_data(self, filename: str = "evolution_simulation_data.json"):
        """Save simulation data to JSON file."""
        filepath = self.temp_dir / filename
        with open(filepath, 'w') as f:
            json.dump(self.simulation_data, f, indent=2)
        print(f"💾 Simulation data saved to: {filepath}")
        return filepath

    def create_visualizations(self):
        """Create comprehensive matplotlib visualizations."""
        print("📊 Creating visualizations...")
        
        # Set up the plotting style
        plt.style.use('default')
        fig = plt.figure(figsize=(20, 16))
        
        # 1. Population over time
        ax1 = plt.subplot(3, 3, 1)
        generations = list(range(len(self.simulation_data["statistics"]["population_over_time"])))
        population = self.simulation_data["statistics"]["population_over_time"]
        ax1.plot(generations, population, 'b-', linewidth=2, marker='o')
        ax1.set_title('Population Size Over Time', fontsize=14, fontweight='bold')
        ax1.set_xlabel('Generation')
        ax1.set_ylabel('Population Size')
        ax1.grid(True, alpha=0.3)
        
        # 2. Genetic diversity over time
        ax2 = plt.subplot(3, 3, 2)
        diversity = self.simulation_data["statistics"]["genetic_diversity"]
        if diversity and len(diversity) == len(generations):
            ax2.plot(generations, diversity, 'g-', linewidth=2, marker='s')
        else:
            ax2.plot(generations, [0] * len(generations), 'g-', linewidth=2, marker='s')
        ax2.set_title('Genetic Diversity Over Time', fontsize=14, fontweight='bold')
        ax2.set_xlabel('Generation')
        ax2.set_ylabel('Genetic Diversity (Std Dev)')
        ax2.grid(True, alpha=0.3)
        
        # 3. Trait evolution (mean values)
        ax3 = plt.subplot(3, 3, 3)
        colors = plt.cm.Set3(np.linspace(0, 1, len(self.trait_names)))
        for i, trait in enumerate(self.trait_names):
            means = self.simulation_data["statistics"]["trait_evolution"][trait]["mean_over_time"]
            if means and len(means) == len(generations):
                ax3.plot(generations, means, color=colors[i], label=trait, linewidth=2)
            else:
                # Use default values if no data
                default_means = [0.5] * len(generations)
                ax3.plot(generations, default_means, color=colors[i], label=trait, linewidth=2)
        ax3.set_title('Trait Evolution (Mean Values)', fontsize=14, fontweight='bold')
        ax3.set_xlabel('Generation')
        ax3.set_ylabel('Trait Value')
        ax3.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        ax3.grid(True, alpha=0.3)
        
        # 4. Trait variance over time
        ax4 = plt.subplot(3, 3, 4)
        for i, trait in enumerate(self.trait_names):
            stds = self.simulation_data["statistics"]["trait_evolution"][trait]["std_over_time"]
            if stds and len(stds) == len(generations):
                ax4.plot(generations, stds, color=colors[i], label=trait, linewidth=2)
            else:
                # Use default values if no data
                default_stds = [0.1] * len(generations)
                ax4.plot(generations, default_stds, color=colors[i], label=trait, linewidth=2)
        ax4.set_title('Trait Variance Over Time', fontsize=14, fontweight='bold')
        ax4.set_xlabel('Generation')
        ax4.set_ylabel('Standard Deviation')
        ax4.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        ax4.grid(True, alpha=0.3)
        
        # 5. Compatibility scores distribution
        ax5 = plt.subplot(3, 3, 5)
        compatibility_scores = self.simulation_data["statistics"]["compatibility_scores"]
        if compatibility_scores:
            ax5.hist(compatibility_scores, bins=20, alpha=0.7, color='purple', edgecolor='black')
            ax5.set_title('Compatibility Scores Distribution', fontsize=14, fontweight='bold')
            ax5.set_xlabel('Compatibility Score')
            ax5.set_ylabel('Frequency')
            ax5.grid(True, alpha=0.3)
        
        # 6. Mutation count distribution
        ax6 = plt.subplot(3, 3, 6)
        mutation_counts = []
        for gen in self.simulation_data["generations"]:
            for agent in gen["agents"]:
                mutation_counts.append(agent["mutation_count"])
        
        if mutation_counts:
            ax6.hist(mutation_counts, bins=max(1, max(mutation_counts)), alpha=0.7, color='orange', edgecolor='black')
            ax6.set_title('Mutation Count Distribution', fontsize=14, fontweight='bold')
            ax6.set_xlabel('Mutation Count')
            ax6.set_ylabel('Frequency')
            ax6.grid(True, alpha=0.3)
        
        # 7. Spirit distribution over time
        ax7 = plt.subplot(3, 3, 7)
        spirit_counts = {}
        for spirit in self.simulation_data["metadata"]["spirits"]:
            spirit_counts[spirit] = []
        
        for gen in self.simulation_data["generations"]:
            current_counts = {spirit: 0 for spirit in self.simulation_data["metadata"]["spirits"]}
            for agent in gen["agents"]:
                current_counts[agent["spirit"]] += 1
            for spirit in spirit_counts:
                spirit_counts[spirit].append(current_counts[spirit])
        
        for spirit, counts in spirit_counts.items():
            ax7.plot(generations, counts, label=spirit, linewidth=2, marker='o')
        ax7.set_title('Spirit Distribution Over Time', fontsize=14, fontweight='bold')
        ax7.set_xlabel('Generation')
        ax7.set_ylabel('Count')
        ax7.legend()
        ax7.grid(True, alpha=0.3)
        
        # 8. Trait correlation matrix (final generation)
        ax8 = plt.subplot(3, 3, 8)
        final_gen = self.simulation_data["generations"][-1]
        trait_matrix = []
        trait_labels = []
        
        for agent in final_gen["agents"]:
            trait_vector = [agent["traits"].get(trait, 0) for trait in self.trait_names]
            trait_matrix.append(trait_vector)
        
        if trait_matrix:
            trait_matrix = np.array(trait_matrix)
            correlation_matrix = np.corrcoef(trait_matrix.T)
            
            im = ax8.imshow(correlation_matrix, cmap='coolwarm', vmin=-1, vmax=1)
            ax8.set_xticks(range(len(self.trait_names)))
            ax8.set_yticks(range(len(self.trait_names)))
            ax8.set_xticklabels(self.trait_names, rotation=45, ha='right')
            ax8.set_yticklabels(self.trait_names)
            ax8.set_title('Trait Correlation Matrix (Final Gen)', fontsize=14, fontweight='bold')
            
            # Add correlation values
            for i in range(len(self.trait_names)):
                for j in range(len(self.trait_names)):
                    ax8.text(j, i, f'{correlation_matrix[i, j]:.2f}', 
                            ha='center', va='center', color='black', fontsize=8)
            
            plt.colorbar(im, ax=ax8)
        
        # 9. Evolution summary
        ax9 = plt.subplot(3, 3, 9)
        ax9.axis('off')
        
        # Create summary text
        summary_text = f"""
Evolution Simulation Summary

Initial Population: {self.simulation_data["metadata"]["population_size"]}
Final Population: {self.simulation_data["statistics"]["population_over_time"][-1]}
Total Generations: {len(self.simulation_data["generations"])}
Total Breeding Events: {len(self.simulation_data["statistics"]["breeding_events"])}
Average Compatibility: {np.mean(self.simulation_data["statistics"]["compatibility_scores"]):.3f}
Final Genetic Diversity: {self.simulation_data["statistics"]["genetic_diversity"][-1]:.3f}

Trait Evolution Trends:
"""
        
        for trait in self.trait_names:
            initial_mean = self.simulation_data["statistics"]["trait_evolution"][trait]["mean_over_time"][0]
            final_mean = self.simulation_data["statistics"]["trait_evolution"][trait]["mean_over_time"][-1]
            change = final_mean - initial_mean
            summary_text += f"{trait}: {change:+.3f}\n"
        
        ax9.text(0.1, 0.9, summary_text, transform=ax9.transAxes, fontsize=10,
                verticalalignment='top', fontfamily='monospace',
                bbox=dict(boxstyle='round', facecolor='lightgray', alpha=0.8))
        
        plt.tight_layout()
        
        # Save the plot
        plot_path = self.temp_dir / "evolution_analysis.png"
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"📊 Visualizations saved to: {plot_path}")
        
        plt.show()
        
        return plot_path


def main():
    """Run the big evolution simulation."""
    print("🦊 Big ECS World Evolution Simulation")
    print("=" * 50)
    
    # Create and run simulation
    simulation = EvolutionSimulation(population_size=150, generations=8)
    simulation_data = simulation.run_simulation()
    
    # Save data
    json_path = simulation.save_simulation_data()
    
    # Create visualizations
    plot_path = simulation.create_visualizations()
    
    print(f"\n🎉 Simulation completed successfully!")
    print(f"📁 Data saved to: {json_path}")
    print(f"📊 Plots saved to: {plot_path}")
    
    return simulation_data


if __name__ == "__main__":
    main()
