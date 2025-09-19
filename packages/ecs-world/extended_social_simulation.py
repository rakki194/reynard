#!/usr/bin/env python3
"""
Extended ECS World Evolution Simulation with Social Interaction Tracking

A comprehensive simulation that runs for many generations and tracks all social
interactions, group dynamics, influence networks, and long-term evolutionary patterns.

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

# Add the src directory to the path
sys.path.append('src')

from reynard_ecs_world.world.agent_world import AgentWorld
from reynard_ecs_world.components import (
    AgentComponent, TraitComponent, LifecycleComponent, 
    LineageComponent, ReproductionComponent, SocialComponent, PositionComponent
)


class ExtendedSocialSimulation:
    """Extended simulation with comprehensive social interaction tracking."""
    
    def __init__(self, population_size: int = 200, generations: int = 25, 
                 breeding_rate: float = 0.3, social_interaction_rate: float = 0.5):
        """Initialize the extended simulation."""
        self.population_size = population_size
        self.generations = generations
        self.breeding_rate = breeding_rate
        self.social_interaction_rate = social_interaction_rate
        
        # Create temporary directory for the world
        self.temp_dir = Path("temp_simulation_data")
        self.temp_dir.mkdir(exist_ok=True)
        
        # Initialize the ECS world
        self.world = AgentWorld(self.temp_dir)
        
        # Simulation data storage
        self.simulation_data = {
            "metadata": {
                "population_size": population_size,
                "generations": generations,
                "breeding_rate": breeding_rate,
                "social_interaction_rate": social_interaction_rate,
                "start_time": datetime.now().isoformat(),
                "spirits": ["fox", "wolf", "otter", "eagle", "lion", "tiger"]
            },
            "generations": [],
            "statistics": {
                "population_over_time": [],
                "genetic_diversity": [],
                "social_networks": [],
                "social_interactions": [],
                "group_dynamics": [],
                "influence_networks": [],
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
        
        # Social interaction tracking
        self.social_interactions = []
        self.social_networks = {}
        self.group_formations = []
        self.influence_changes = []
        
        # Performance tracking
        self.start_time = time.time()
        
    def create_initial_population(self) -> List[str]:
        """Create initial population with diverse traits and social components."""
        print(f"🦊 Creating initial population of {self.population_size} agents...")
        
        agent_ids = []
        spirits = self.simulation_data["metadata"]["spirits"]
        
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
            
            # Set diverse initial traits
            traits = agent.get_component(TraitComponent)
            if traits:
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
            
            # Initialize social component with random social traits
            social = agent.get_component(SocialComponent)
            if social:
                social.charisma = random.uniform(0.0, 1.0)
                social.leadership_ability = random.uniform(0.0, 1.0)
                social.group_activity_preference = random.uniform(0.0, 1.0)
                social.conflict_resolution_skill = random.uniform(0.0, 1.0)
        
        print(f"✅ Created {len(agent_ids)} agents")
        return agent_ids
    
    def simulate_social_interactions(self, generation: int, agent_ids: List[str]) -> Dict[str, Any]:
        """Simulate social interactions between agents."""
        interactions = []
        social_network = {}
        
        # Create social network for this generation
        for agent_id in agent_ids:
            social_network[agent_id] = {
                "connections": [],
                "influence": 0.0,
                "social_status": "neutral",
                "group_memberships": [],
                "interaction_count": 0
            }
        
        # Simulate random social interactions
        num_interactions = int(len(agent_ids) * self.social_interaction_rate * 2)
        
        for _ in range(num_interactions):
            agent1_id = random.choice(agent_ids)
            agent2_id = random.choice([a for a in agent_ids if a != agent1_id])
            
            # Get agent components
            agent1 = self.world.get_entity(agent1_id)
            agent2 = self.world.get_entity(agent2_id)
            
            if agent1 and agent2:
                traits1 = agent1.get_component(TraitComponent)
                traits2 = agent2.get_component(TraitComponent)
                social1 = agent1.get_component(SocialComponent)
                social2 = agent2.get_component(SocialComponent)
                
                if traits1 and traits2 and social1 and social2:
                    # Calculate interaction compatibility
                    compatibility = self._calculate_social_compatibility(traits1, traits2, social1, social2)
                    
                    # Determine interaction type and outcome
                    interaction_type = self._determine_interaction_type(traits1, traits2, social1, social2)
                    outcome = self._simulate_interaction_outcome(compatibility, interaction_type)
                    
                    # Record interaction
                    interaction = {
                        "generation": generation,
                        "agent1": agent1_id,
                        "agent2": agent2_id,
                        "interaction_type": interaction_type,
                        "compatibility": compatibility,
                        "outcome": outcome,
                        "timestamp": time.time()
                    }
                    interactions.append(interaction)
                    
                    # Update social network
                    if outcome["success"]:
                        social_network[agent1_id]["connections"].append(agent2_id)
                        social_network[agent2_id]["connections"].append(agent1_id)
                        social_network[agent1_id]["interaction_count"] += 1
                        social_network[agent2_id]["interaction_count"] += 1
                        
                        # Update influence based on interaction
                        if outcome["influence_change"] > 0:
                            social_network[agent1_id]["influence"] += outcome["influence_change"]
                        else:
                            social_network[agent2_id]["influence"] += abs(outcome["influence_change"])
        
        # Update social components based on network
        self._update_social_components(social_network, agent_ids)
        
        return {
            "interactions": interactions,
            "social_network": social_network,
            "total_interactions": len(interactions),
            "successful_interactions": sum(1 for i in interactions if i["outcome"]["success"]),
            "average_compatibility": np.mean([i["compatibility"] for i in interactions]) if interactions else 0.0
        }
    
    def _calculate_social_compatibility(self, traits1: TraitComponent, traits2: TraitComponent,
                                      social1: SocialComponent, social2: SocialComponent) -> float:
        """Calculate social compatibility between two agents."""
        # Base compatibility from traits
        trait_compatibility = 0.0
        for trait in ["dominance", "loyalty", "cunning", "intelligence", "creativity", "playfulness", "patience"]:
            if trait in traits1.personality and trait in traits2.personality:
                diff = abs(traits1.personality[trait] - traits2.personality[trait])
                trait_compatibility += 1.0 - diff
        
        trait_compatibility /= 7.0  # Average over 7 traits
        
        # Social compatibility
        social_compatibility = 0.0
        social_compatibility += 1.0 - abs(social1.charisma - social2.charisma)
        social_compatibility += 1.0 - abs(social1.leadership_ability - social2.leadership_ability)
        social_compatibility += 1.0 - abs(social1.group_activity_preference - social2.group_activity_preference)
        social_compatibility /= 3.0
        
        # Combined compatibility
        return (trait_compatibility * 0.6 + social_compatibility * 0.4)
    
    def _determine_interaction_type(self, traits1: TraitComponent, traits2: TraitComponent,
                                  social1: SocialComponent, social2: SocialComponent) -> str:
        """Determine the type of social interaction."""
        # Based on traits and social preferences
        if traits1.personality.get("dominance", 0.5) > 0.7 or traits2.personality.get("dominance", 0.5) > 0.7:
            return "leadership_negotiation"
        elif traits1.personality.get("playfulness", 0.5) > 0.7 or traits2.personality.get("playfulness", 0.5) > 0.7:
            return "playful_interaction"
        elif traits1.personality.get("intelligence", 0.5) > 0.7 or traits2.personality.get("intelligence", 0.5) > 0.7:
            return "intellectual_discussion"
        elif traits1.personality.get("aggression", 0.5) > 0.7 or traits2.personality.get("aggression", 0.5) > 0.7:
            return "conflict_resolution"
        else:
            return "casual_conversation"
    
    def _simulate_interaction_outcome(self, compatibility: float, interaction_type: str) -> Dict[str, Any]:
        """Simulate the outcome of a social interaction."""
        # Base success probability
        success_prob = compatibility * 0.8 + 0.2  # 20% base success rate
        
        # Modify based on interaction type
        if interaction_type == "conflict_resolution":
            success_prob *= 0.7  # Harder to resolve conflicts
        elif interaction_type == "leadership_negotiation":
            success_prob *= 0.8  # Moderate difficulty
        elif interaction_type == "playful_interaction":
            success_prob *= 1.2  # Easier to have fun
        
        success = random.random() < success_prob
        
        if success:
            # Positive outcome
            influence_change = random.uniform(0.01, 0.05) * compatibility
            return {
                "success": True,
                "influence_change": influence_change,
                "relationship_strength": compatibility,
                "outcome_type": "positive"
            }
        else:
            # Negative or neutral outcome
            influence_change = random.uniform(-0.02, 0.01)
            return {
                "success": False,
                "influence_change": influence_change,
                "relationship_strength": compatibility * 0.5,
                "outcome_type": "negative" if influence_change < 0 else "neutral"
            }
    
    def _update_social_components(self, social_network: Dict[str, Any], agent_ids: List[str]):
        """Update social components based on network interactions."""
        for agent_id in agent_ids:
            agent = self.world.get_entity(agent_id)
            if agent:
                social = agent.get_component(SocialComponent)
                if social:
                    # Update social metrics
                    social.network_size = len(social_network[agent_id]["connections"])
                    social.social_influence = social_network[agent_id]["influence"]
                    social.total_interactions = social_network[agent_id]["interaction_count"]
                    
                    # Update social status based on influence and network size
                    if social.social_influence > 0.5 and social.network_size > 5:
                        social.social_status = "influential"
                    elif social.social_influence > 0.3 and social.network_size > 3:
                        social.social_status = "popular"
                    elif social.social_influence > 0.1 and social.network_size > 1:
                        social.social_status = "accepted"
                    else:
                        social.social_status = "neutral"
    
    def simulate_breeding_with_social_selection(self, generation: int, agent_ids: List[str]) -> List[str]:
        """Simulate breeding with social selection pressure."""
        print(f"🧬 Simulating breeding for generation {generation}...")
        
        # Get mature agents
        mature_agents = []
        for agent_id in agent_ids:
            agent = self.world.get_entity(agent_id)
            if agent:
                lifecycle = agent.get_component(LifecycleComponent)
                if lifecycle and lifecycle.age >= 2.0:
                    mature_agents.append(agent_id)
        
        print(f"   Found {len(mature_agents)} mature agents")
        
        # Calculate breeding pairs with social selection
        breeding_events = int(len(mature_agents) * self.breeding_rate)
        new_agents = []
        
        for _ in range(breeding_events):
            if len(mature_agents) < 2:
                break
                
            # Select parents with social bias
            parent1 = self._select_parent_with_social_bias(mature_agents)
            parent2 = self._select_parent_with_social_bias([a for a in mature_agents if a != parent1])
            
            # Check compatibility
            compatibility = self.world.analyze_genetic_compatibility(parent1, parent2)
            
            # Breed if compatible enough
            if compatibility["compatibility"] >= 0.2:
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
                        "compatibility": compatibility["compatibility"],
                        "timestamp": time.time()
                    }
                    self.simulation_data["statistics"]["breeding_events"].append(breeding_event)
                    self.simulation_data["statistics"]["compatibility_scores"].append(compatibility["compatibility"])
        
        print(f"   Created {len(new_agents)} offspring from {len(new_agents)} breeding events")
        return new_agents
    
    def _select_parent_with_social_bias(self, candidate_agents: List[str]) -> str:
        """Select a parent with social selection bias."""
        # Get social influence scores
        influence_scores = []
        for agent_id in candidate_agents:
            agent = self.world.get_entity(agent_id)
            if agent:
                social = agent.get_component(SocialComponent)
                if social:
                    # Combine social influence with network size
                    score = social.social_influence + (social.network_size * 0.1)
                    influence_scores.append(score)
                else:
                    influence_scores.append(0.0)
            else:
                influence_scores.append(0.0)
        
        # Convert to probabilities (higher influence = higher chance)
        if sum(influence_scores) > 0:
            probabilities = np.array(influence_scores) / sum(influence_scores)
            # Add some randomness to prevent complete determinism
            probabilities = probabilities * 0.7 + 0.3 / len(probabilities)
            probabilities = probabilities / sum(probabilities)
            
            return np.random.choice(candidate_agents, p=probabilities)
        else:
            return random.choice(candidate_agents)
    
    def collect_generation_statistics(self, generation: int, agent_ids: List[str], 
                                    social_data: Dict[str, Any]) -> Dict[str, Any]:
        """Collect comprehensive statistics for a generation."""
        print(f"📊 Collecting statistics for generation {generation}...")
        
        # Basic population stats
        stats = {
            "generation": generation,
            "population_size": len(agent_ids),
            "timestamp": time.time()
        }
        
        # Trait statistics
        trait_values = {trait: [] for trait in [
            "dominance", "loyalty", "cunning", "aggression",
            "intelligence", "creativity", "playfulness", "patience"
        ]}
        
        for agent_id in agent_ids:
            agent = self.world.get_entity(agent_id)
            if agent:
                traits = agent.get_component(TraitComponent)
                if traits and traits.personality:
                    for trait in trait_values:
                        if trait in traits.personality:
                            trait_values[trait].append(traits.personality[trait])
        
        # Calculate trait statistics
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
            "network_density": self._calculate_network_density(social_data["social_network"]),
            "influence_distribution": self._calculate_influence_distribution(social_data["social_network"])
        }
        
        # Genetic diversity
        all_traits = []
        for trait_list in trait_values.values():
            all_traits.extend(trait_list)
        
        if all_traits:
            stats["genetic_diversity"] = np.std(all_traits)
        else:
            stats["genetic_diversity"] = 0.0
        
        self.simulation_data["statistics"]["genetic_diversity"].append(stats["genetic_diversity"])
        self.simulation_data["statistics"]["population_over_time"].append(len(agent_ids))
        
        # Store social network data
        self.simulation_data["statistics"]["social_networks"].append(social_data["social_network"])
        self.simulation_data["statistics"]["social_interactions"].extend(social_data["interactions"])
        
        print(f"   Population: {len(agent_ids)} agents")
        print(f"   Genetic diversity: {stats['genetic_diversity']:.3f}")
        print(f"   Social interactions: {social_data['total_interactions']}")
        print(f"   Network density: {stats['social_statistics']['network_density']:.3f}")
        
        return stats
    
    def _calculate_network_density(self, social_network: Dict[str, Any]) -> float:
        """Calculate the density of the social network."""
        total_possible_connections = len(social_network) * (len(social_network) - 1) / 2
        actual_connections = sum(len(data["connections"]) for data in social_network.values()) / 2
        
        if total_possible_connections > 0:
            return actual_connections / total_possible_connections
        return 0.0
    
    def _calculate_influence_distribution(self, social_network: Dict[str, Any]) -> Dict[str, float]:
        """Calculate influence distribution statistics."""
        influences = [data["influence"] for data in social_network.values()]
        
        if influences:
            return {
                "mean": np.mean(influences),
                "std": np.std(influences),
                "min": np.min(influences),
                "max": np.max(influences),
                "median": np.median(influences)
            }
        return {"mean": 0.0, "std": 0.0, "min": 0.0, "max": 0.0, "median": 0.0}
    
    def run_simulation(self) -> Dict[str, Any]:
        """Run the extended simulation with social tracking."""
        print("🌍 Starting Extended ECS World Evolution Simulation with Social Tracking")
        print("=" * 80)
        
        # Create initial population
        agent_ids = self.create_initial_population()
        
        # Collect initial statistics
        initial_social_data = self.simulate_social_interactions(0, agent_ids)
        initial_stats = self.collect_generation_statistics(0, agent_ids, initial_social_data)
        self.simulation_data["generations"].append({
            "generation": 0,
            "agents": [{"id": aid} for aid in agent_ids],
            "statistics": initial_stats
        })
        
        # Run simulation for specified generations
        for generation in range(1, self.generations + 1):
            print(f"\n🧬 Generation {generation}/{self.generations}")
            print("-" * 40)
            
            # Simulate social interactions
            social_data = self.simulate_social_interactions(generation, agent_ids)
            
            # Simulate breeding with social selection
            new_agents = self.simulate_breeding_with_social_selection(generation, agent_ids)
            agent_ids.extend(new_agents)
            
            # Age all agents
            for agent_id in agent_ids:
                agent = self.world.get_entity(agent_id)
                if agent:
                    lifecycle = agent.get_component(LifecycleComponent)
                    if lifecycle:
                        lifecycle.age += 1.0
            
            # Collect statistics
            stats = self.collect_generation_statistics(generation, agent_ids, social_data)
            self.simulation_data["generations"].append({
                "generation": generation,
                "agents": [{"id": aid} for aid in agent_ids],
                "statistics": stats
            })
        
        # Finalize simulation
        self.simulation_data["metadata"]["end_time"] = datetime.now().isoformat()
        self.simulation_data["metadata"]["duration_seconds"] = time.time() - self.start_time
        
        print(f"\n✅ Extended simulation completed!")
        print(f"   Total generations: {self.generations + 1}")
        print(f"   Final population: {len(agent_ids)} agents")
        print(f"   Total breeding events: {len(self.simulation_data['statistics']['breeding_events'])}")
        print(f"   Total social interactions: {len(self.simulation_data['statistics']['social_interactions'])}")
        print(f"   Duration: {self.simulation_data['metadata']['duration_seconds']:.2f} seconds")
        
        return self.simulation_data
    
    def save_simulation_data(self, filename: str = "extended_social_simulation_data.json") -> Path:
        """Save the simulation data to JSON file."""
        output_path = self.temp_dir / filename
        with open(output_path, 'w') as f:
            json.dump(self.simulation_data, f, indent=2)
        print(f"💾 Extended simulation data saved to: {output_path}")
        return output_path
    
    def create_comprehensive_visualizations(self) -> Path:
        """Create comprehensive visualizations including social networks."""
        print("📊 Creating comprehensive visualizations...")
        
        fig = plt.figure(figsize=(20, 16))
        
        # 1. Population growth over time
        ax1 = plt.subplot(3, 4, 1)
        generations = list(range(len(self.simulation_data["statistics"]["population_over_time"])))
        population = self.simulation_data["statistics"]["population_over_time"]
        ax1.plot(generations, population, 'b-', linewidth=3, marker='o', markersize=6)
        ax1.set_title('Population Growth Over Time', fontsize=14, fontweight='bold')
        ax1.set_xlabel('Generation')
        ax1.set_ylabel('Population Size')
        ax1.grid(True, alpha=0.3)
        
        # 2. Genetic diversity over time
        ax2 = plt.subplot(3, 4, 2)
        diversity = self.simulation_data["statistics"]["genetic_diversity"]
        ax2.plot(generations, diversity, 'g-', linewidth=3, marker='s', markersize=6)
        ax2.set_title('Genetic Diversity Over Time', fontsize=14, fontweight='bold')
        ax2.set_xlabel('Generation')
        ax2.set_ylabel('Genetic Diversity (Std Dev)')
        ax2.grid(True, alpha=0.3)
        
        # 3. Social interaction success rate over time
        ax3 = plt.subplot(3, 4, 3)
        success_rates = []
        for gen_data in self.simulation_data["generations"]:
            if "social_statistics" in gen_data["statistics"]:
                success_rates.append(gen_data["statistics"]["social_statistics"]["interaction_success_rate"])
            else:
                success_rates.append(0.0)
        ax3.plot(generations, success_rates, 'r-', linewidth=3, marker='^', markersize=6)
        ax3.set_title('Social Interaction Success Rate', fontsize=14, fontweight='bold')
        ax3.set_xlabel('Generation')
        ax3.set_ylabel('Success Rate')
        ax3.grid(True, alpha=0.3)
        
        # 4. Network density over time
        ax4 = plt.subplot(3, 4, 4)
        network_densities = []
        for gen_data in self.simulation_data["generations"]:
            if "social_statistics" in gen_data["statistics"]:
                network_densities.append(gen_data["statistics"]["social_statistics"]["network_density"])
            else:
                network_densities.append(0.0)
        ax4.plot(generations, network_densities, 'm-', linewidth=3, marker='d', markersize=6)
        ax4.set_title('Social Network Density', fontsize=14, fontweight='bold')
        ax4.set_xlabel('Generation')
        ax4.set_ylabel('Network Density')
        ax4.grid(True, alpha=0.3)
        
        # 5. Trait evolution (mean values)
        ax5 = plt.subplot(3, 4, 5)
        trait_names = ["dominance", "loyalty", "cunning", "aggression", "intelligence", "creativity", "playfulness", "patience"]
        colors = plt.cm.Set3(np.linspace(0, 1, len(trait_names)))
        for i, trait in enumerate(trait_names):
            means = self.simulation_data["statistics"]["trait_evolution"][trait]["mean_over_time"]
            if means and len(means) == len(generations):
                ax5.plot(generations, means, color=colors[i], label=trait, linewidth=2)
        ax5.set_title('Trait Evolution (Mean Values)', fontsize=14, fontweight='bold')
        ax5.set_xlabel('Generation')
        ax5.set_ylabel('Trait Value')
        ax5.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=8)
        ax5.grid(True, alpha=0.3)
        
        # 6. Influence distribution over time
        ax6 = plt.subplot(3, 4, 6)
        influence_means = []
        for gen_data in self.simulation_data["generations"]:
            if "social_statistics" in gen_data["statistics"]:
                influence_means.append(gen_data["statistics"]["social_statistics"]["influence_distribution"]["mean"])
            else:
                influence_means.append(0.0)
        ax6.plot(generations, influence_means, 'c-', linewidth=3, marker='p', markersize=6)
        ax6.set_title('Average Social Influence', fontsize=14, fontweight='bold')
        ax6.set_xlabel('Generation')
        ax6.set_ylabel('Average Influence')
        ax6.grid(True, alpha=0.3)
        
        # 7. Breeding events over time
        ax7 = plt.subplot(3, 4, 7)
        breeding_by_generation = {}
        for event in self.simulation_data["statistics"]["breeding_events"]:
            gen = event["generation"]
            breeding_by_generation[gen] = breeding_by_generation.get(gen, 0) + 1
        
        breeding_generations = list(breeding_by_generation.keys())
        breeding_counts = list(breeding_by_generation.values())
        ax7.bar(breeding_generations, breeding_counts, color='orange', alpha=0.7)
        ax7.set_title('Breeding Events by Generation', fontsize=14, fontweight='bold')
        ax7.set_xlabel('Generation')
        ax7.set_ylabel('Breeding Events')
        ax7.grid(True, alpha=0.3)
        
        # 8. Compatibility scores distribution
        ax8 = plt.subplot(3, 4, 8)
        compatibility_scores = self.simulation_data["statistics"]["compatibility_scores"]
        if compatibility_scores:
            ax8.hist(compatibility_scores, bins=20, color='purple', alpha=0.7, edgecolor='black')
            ax8.set_title('Compatibility Scores Distribution', fontsize=14, fontweight='bold')
            ax8.set_xlabel('Compatibility Score')
            ax8.set_ylabel('Frequency')
            ax8.grid(True, alpha=0.3)
        
        # 9. Social network visualization (final generation)
        ax9 = plt.subplot(3, 4, 9)
        if self.simulation_data["statistics"]["social_networks"]:
            final_network = self.simulation_data["statistics"]["social_networks"][-1]
            self._visualize_social_network(ax9, final_network)
        
        # 10. Interaction types distribution
        ax10 = plt.subplot(3, 4, 10)
        interaction_types = {}
        for interaction in self.simulation_data["statistics"]["social_interactions"]:
            itype = interaction["interaction_type"]
            interaction_types[itype] = interaction_types.get(itype, 0) + 1
        
        if interaction_types:
            types = list(interaction_types.keys())
            counts = list(interaction_types.values())
            ax10.pie(counts, labels=types, autopct='%1.1f%%', startangle=90)
            ax10.set_title('Social Interaction Types', fontsize=14, fontweight='bold')
        
        # 11. Influence vs Network Size scatter
        ax11 = plt.subplot(3, 4, 11)
        if self.simulation_data["statistics"]["social_networks"]:
            final_network = self.simulation_data["statistics"]["social_networks"][-1]
            influences = []
            network_sizes = []
            for agent_id, data in final_network.items():
                influences.append(data["influence"])
                network_sizes.append(len(data["connections"]))
            
            ax11.scatter(network_sizes, influences, alpha=0.6, s=50)
            ax11.set_title('Influence vs Network Size', fontsize=14, fontweight='bold')
            ax11.set_xlabel('Network Size')
            ax11.set_ylabel('Social Influence')
            ax11.grid(True, alpha=0.3)
        
        # 12. Generation summary statistics
        ax12 = plt.subplot(3, 4, 12)
        ax12.axis('off')
        summary_text = f"""
        Extended Simulation Summary:
        
        Generations: {len(generations)}
        Final Population: {population[-1]}
        Total Breeding Events: {len(self.simulation_data['statistics']['breeding_events'])}
        Total Social Interactions: {len(self.simulation_data['statistics']['social_interactions'])}
        Final Genetic Diversity: {diversity[-1]:.3f}
        Final Network Density: {network_densities[-1]:.3f}
        Average Compatibility: {np.mean(compatibility_scores):.3f}
        
        Duration: {self.simulation_data['metadata']['duration_seconds']:.1f}s
        """
        ax12.text(0.1, 0.9, summary_text, transform=ax12.transAxes, fontsize=10,
                 verticalalignment='top', fontfamily='monospace',
                 bbox=dict(boxstyle='round', facecolor='lightgray', alpha=0.8))
        
        plt.tight_layout()
        
        # Save the plot
        plot_path = self.temp_dir / "extended_social_analysis.png"
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"📊 Comprehensive visualizations saved to: {plot_path}")
        return plot_path
    
    def _visualize_social_network(self, ax, social_network: Dict[str, Any]):
        """Visualize a social network."""
        # Create networkx graph
        G = nx.Graph()
        
        # Add nodes and edges
        for agent_id, data in social_network.items():
            G.add_node(agent_id, influence=data["influence"])
            for connection in data["connections"]:
                if connection in social_network:
                    G.add_edge(agent_id, connection)
        
        # Layout
        pos = nx.spring_layout(G, k=1, iterations=50)
        
        # Draw network
        node_sizes = [data["influence"] * 100 + 50 for data in social_network.values()]
        nx.draw_networkx_nodes(G, pos, node_size=node_sizes, node_color='lightblue', alpha=0.7)
        nx.draw_networkx_edges(G, pos, alpha=0.5, edge_color='gray')
        
        ax.set_title('Final Generation Social Network', fontsize=12, fontweight='bold')
        ax.axis('off')


def main():
    """Run the extended social simulation."""
    print("🌍 Extended ECS World Evolution Simulation with Social Tracking")
    print("=" * 80)
    
    # Create and run simulation
    simulation = ExtendedSocialSimulation(
        population_size=200,
        generations=25,
        breeding_rate=0.3,
        social_interaction_rate=0.5
    )
    
    # Run simulation
    simulation_data = simulation.run_simulation()
    
    # Save data
    data_path = simulation.save_simulation_data()
    
    # Create visualizations
    plot_path = simulation.create_comprehensive_visualizations()
    
    print(f"\n🎉 Extended simulation completed successfully!")
    print(f"📁 Data saved to: {data_path}")
    print(f"📊 Plots saved to: {plot_path}")
    
    return simulation_data


if __name__ == "__main__":
    main()
