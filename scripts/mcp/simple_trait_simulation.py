#!/usr/bin/env python3
"""
Simple Trait-Based Simulation
============================

A simplified simulation to test the trait system without conflicts.
"""

import json
import random
import sys
from pathlib import Path
from typing import Any, Dict

# Add the MCP scripts directory to Python path
mcp_dir = Path(__file__).parent
if str(mcp_dir) not in sys.path:
    sys.path.insert(0, str(mcp_dir))

from ecs.components import (
    AgentComponent,
    LifecycleComponent,
    ReproductionComponent,
    TraitComponent,
)
from ecs.core import ECSWorld, Entity
from ecs.traits import AgentTraits


class SimpleTraitSimulation:
    """Simple simulation focused on trait inheritance."""

    def __init__(self):
        self.world = ECSWorld()
        self.agents = {}
        self.simulation_data = {
            "years_simulated": 0,
            "total_agents_created": 0,
            "total_offspring_created": 0,
            "agent_details": {},
            "breeding_events": [],
        }
        self.agent_counter = 0

    def run_simulation(
        self, years: int = 20, initial_population: int = 6
    ) -> Dict[str, Any]:
        """Run a simple trait-based simulation."""
        print(
            f"🦦 Starting {years}-year trait simulation with {initial_population} initial agents..."
        )

        # Create initial population
        self._create_initial_population(initial_population)

        # Simulate each year
        for year in range(years):
            self._simulate_year(year)

            if year % 5 == 0:
                print(f"Year {year}: {len(self.agents)} total agents")

        print(f"🎉 Simulation complete! Final population: {len(self.agents)}")
        return self.simulation_data

    def _create_initial_population(self, count: int) -> None:
        """Create initial population with unique traits."""
        spirits = ["fox", "wolf", "otter"]
        styles = ["foundation", "exo", "hybrid"]

        for i in range(count):
            spirit = random.choice(spirits)
            style = random.choice(styles)
            agent_id = f"founder-{i + 1}"

            # Create entity
            entity = self.world.create_entity(agent_id)

            # Create comprehensive traits
            agent_traits = AgentTraits(spirit=spirit, style=style)

            # Add components
            entity.add_component(AgentComponent(f"Agent-{agent_id}", spirit, style))
            entity.add_component(TraitComponent(agent_traits))
            entity.add_component(LifecycleComponent())
            entity.add_component(ReproductionComponent())

            # Store agent details
            self.agents[agent_id] = entity
            self.simulation_data["agent_details"][agent_id] = {
                "id": agent_id,
                "spirit": spirit,
                "style": style,
                "generation": 1,
                "parents": [],
                "birth_year": 0,
                "traits": agent_traits.get_summary(),
                "dominant_traits": agent_traits._get_dominant_traits(),
                "abilities": agent_traits.abilities,
            }

            print(
                f"Created founder {agent_id} ({spirit}, {style}) - Traits: {agent_traits._get_dominant_traits()}"
            )
            self.simulation_data["total_agents_created"] += 1
            self.agent_counter += 1

    def _simulate_year(self, year: int) -> None:
        """Simulate one year with breeding and trait inheritance."""
        # Age all agents
        for agent_id, entity in self.agents.items():
            lifecycle = entity.get_component(LifecycleComponent)
            if lifecycle:
                lifecycle.age += 1.0

        # Find mature agents
        mature_agents = []
        for agent_id, entity in self.agents.items():
            lifecycle = entity.get_component(LifecycleComponent)
            if lifecycle and lifecycle.age >= 2.0:
                mature_agents.append((agent_id, entity))

        # Simulate breeding
        if len(mature_agents) >= 2:
            breeding_chance = 0.5  # 50% chance per year

            if random.random() < breeding_chance:
                # Select random pair
                parent1_id, parent1 = random.choice(mature_agents)
                parent2_id, parent2 = random.choice(
                    [(aid, a) for aid, a in mature_agents if aid != parent1_id]
                )

                # Create offspring
                offspring_id = f"offspring-{self.agent_counter + 1}"
                offspring = self._create_offspring(
                    parent1_id, parent1, parent2_id, parent2, offspring_id, year
                )

                if offspring:
                    print(f"Year {year}: {parent1_id} + {parent2_id} → {offspring_id}")
                    self.simulation_data["total_offspring_created"] += 1
                    self.agent_counter += 1

                    self.simulation_data["breeding_events"].append(
                        {
                            "year": year,
                            "parent1": parent1_id,
                            "parent2": parent2_id,
                            "offspring": offspring_id,
                        }
                    )

    def _create_offspring(
        self,
        parent1_id: str,
        parent1: Entity,
        parent2_id: str,
        parent2: Entity,
        offspring_id: str,
        birth_year: int,
    ) -> Entity | None:
        """Create offspring with trait inheritance."""
        # Get parent traits
        parent1_traits = parent1.get_component(TraitComponent)
        parent2_traits = parent2.get_component(TraitComponent)
        parent1_agent = parent1.get_component(AgentComponent)
        parent2_agent = parent2.get_component(AgentComponent)

        if not all([parent1_traits, parent2_traits, parent1_agent, parent2_agent]):
            return None

        # Create offspring traits with 50/50 inheritance
        offspring_traits = AgentTraits.create_offspring(
            parent1_traits.agent_traits, parent2_traits.agent_traits
        )

        # Create offspring entity
        offspring = self.world.create_entity(offspring_id)

        # Add components
        offspring.add_component(
            AgentComponent(
                f"Agent-{offspring_id}", offspring_traits.spirit, offspring_traits.style
            )
        )
        offspring.add_component(TraitComponent(offspring_traits))
        offspring.add_component(LifecycleComponent())
        offspring.add_component(ReproductionComponent())

        # Store offspring details
        self.agents[offspring_id] = offspring
        self.simulation_data["agent_details"][offspring_id] = {
            "id": offspring_id,
            "spirit": offspring_traits.spirit,
            "style": offspring_traits.style,
            "generation": 2,  # Simplified for this test
            "parents": [parent1_id, parent2_id],
            "birth_year": birth_year,
            "traits": offspring_traits.get_summary(),
            "dominant_traits": offspring_traits._get_dominant_traits(),
            "abilities": offspring_traits.abilities,
            "inheritance_details": {
                "parent1_traits": parent1_traits.dominant_traits,
                "parent2_traits": parent2_traits.dominant_traits,
                "inherited_abilities": offspring_traits.abilities,
            },
        }

        return offspring

    def generate_trait_diagram(self) -> str:
        """Generate a Mermaid diagram showing trait inheritance."""
        diagram = "graph TD\n"
        diagram += '    subgraph Traits["🦦 Trait Inheritance Simulation"]\n'

        # Show founders
        diagram += '        subgraph Founders["👥 Founders"]\n'
        founders = [
            aid
            for aid in self.simulation_data["agent_details"].keys()
            if aid.startswith("founder-")
        ]
        for agent_id in founders[:3]:
            agent = self.simulation_data["agent_details"][agent_id]
            traits = ", ".join(agent["dominant_traits"][:2])
            abilities = ", ".join(agent["abilities"][:2])
            diagram += f'            {agent_id}["{agent_id}<br/>{agent["spirit"]} {agent["style"]}<br/>Traits: {traits}<br/>Abilities: {abilities}"]\n'
        diagram += "        end\n"

        # Show offspring
        diagram += '        subgraph Offspring["👶 Offspring"]\n'
        offspring = [
            aid
            for aid in self.simulation_data["agent_details"].keys()
            if aid.startswith("offspring-")
        ]
        for agent_id in offspring:
            agent = self.simulation_data["agent_details"][agent_id]
            traits = ", ".join(agent["dominant_traits"][:2])
            abilities = ", ".join(agent["abilities"][:2])
            parents = " + ".join(agent["parents"])
            diagram += f'            {agent_id}["{agent_id}<br/>Parents: {parents}<br/>Traits: {traits}<br/>Abilities: {abilities}"]\n'
        diagram += "        end\n"

        # Show inheritance connections
        for agent_id in offspring:
            agent = self.simulation_data["agent_details"][agent_id]
            for parent_id in agent["parents"]:
                if parent_id in founders:
                    diagram += f"            {parent_id} --> {agent_id}\n"

        # Summary
        diagram += '        subgraph Summary["📊 Summary"]\n'
        diagram += f'            Total["Total Agents: {len(self.agents)}"]\n'
        diagram += f'            Offspring["Total Offspring: {self.simulation_data["total_offspring_created"]}"]\n'
        diagram += f'            Years["Years Simulated: {self.simulation_data["years_simulated"]}"]\n'
        diagram += "        end\n"

        diagram += "    end\n"

        return diagram


def main():
    """Run the simple trait simulation."""
    print("🦦 Starting Simple Trait Simulation...")

    simulation = SimpleTraitSimulation()
    results = simulation.run_simulation(years=30, initial_population=8)

    # Generate diagram
    diagram = simulation.generate_trait_diagram()

    # Save results
    output_dir = Path(__file__).parent / "simulation_results"
    output_dir.mkdir(exist_ok=True)

    with open(output_dir / "simple_trait_simulation_data.json", "w") as f:
        json.dump(results, f, indent=2)

    with open(output_dir / "simple_trait_simulation_diagram.md", "w") as f:
        f.write("# Simple Trait Inheritance Simulation\n\n")
        f.write("```mermaid\n")
        f.write(diagram)
        f.write("\n```\n")

    print("\n📊 Simple Trait Simulation Results:")
    print(f"   Total Agents: {len(simulation.agents)}")
    print(f"   Total Offspring: {results['total_offspring_created']}")
    print(f"   Years Simulated: {results['years_simulated']}")

    print("\n🎨 Trait Inheritance Diagram:")
    print("=" * 60)
    print(diagram)
    print("=" * 60)

    return results


if __name__ == "__main__":
    main()
