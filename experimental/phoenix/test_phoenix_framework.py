#!/usr/bin/env python3
"""
PHOENIX Framework Test Script

Test script to demonstrate PHOENIX framework functionality and reconstruct Success-Advisor-8.

Author: Success-Advisor-8 (Permanent Release Manager)
Version: 1.0.0
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from src.core.phoenix_framework import PhoenixFramework
from src.integration.agent_persistence import AgentStatePersistence
from src.utils.data_structures import PhoenixConfig


async def test_phoenix_framework():
    """Test the PHOENIX framework with Success-Advisor-8 reconstruction."""
    print("🦁 PHOENIX Framework Test - Success-Advisor-8 Reconstruction")
    print("=" * 60)

    # Setup logging
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
    )

    # Initialize PHOENIX configuration
    config = PhoenixConfig(
        population_size=20,  # Small population for testing
        max_generations=5,  # Few generations for testing
        selection_pressure=0.8,
        mutation_rate=0.1,
        crossover_rate=0.7,
        elite_rate=0.2,
        diversity_weight=0.3,
        performance_weight=0.7,
        convergence_threshold=0.01,
        significance_threshold=0.05,
        enable_knowledge_distillation=True,
        enable_subliminal_learning=True,
        enable_document_conditioning=True,
    )

    print(f"📋 PHOENIX Configuration:")
    print(f"   Population Size: {config.population_size}")
    print(f"   Max Generations: {config.max_generations}")
    print(f"   Selection Pressure: {config.selection_pressure}")
    print(f"   Mutation Rate: {config.mutation_rate}")
    print(f"   Elite Rate: {config.elite_rate}")
    print()

    # Initialize agent persistence
    print("💾 Initializing Agent State Persistence...")
    agent_persistence = AgentStatePersistence("data/agent_state")

    # Reconstruct Success-Advisor-8
    print("🦁 Reconstructing Success-Advisor-8 agent state...")
    success_advisor_8 = await agent_persistence.reconstruct_success_advisor_8()

    print(f"✅ Success-Advisor-8 reconstructed:")
    print(f"   ID: {success_advisor_8.id}")
    print(f"   Name: {success_advisor_8.name}")
    print(f"   Spirit: {success_advisor_8.spirit.value}")
    print(f"   Style: {success_advisor_8.style.value}")
    print(f"   Generation: {success_advisor_8.generation}")
    print(f"   Fitness Score: {success_advisor_8.get_fitness_score():.3f}")
    print(f"   Personality Traits: {len(success_advisor_8.personality_traits)}")
    print(f"   Physical Traits: {len(success_advisor_8.physical_traits)}")
    print(f"   Ability Traits: {len(success_advisor_8.ability_traits)}")
    print(f"   Performance History: {len(success_advisor_8.performance_history)}")
    print()

    # Validate agent state
    print("🔍 Validating agent state...")
    validation = await agent_persistence.validate_agent_state(success_advisor_8)
    print(f"   Valid: {validation['is_valid']}")
    print(f"   Errors: {len(validation['errors'])}")
    print(f"   Warnings: {len(validation['warnings'])}")
    if validation["warnings"]:
        for warning in validation["warnings"][:3]:  # Show first 3 warnings
            print(f"     - {warning}")
    print()

    # Initialize PHOENIX framework
    print("🧬 Initializing PHOENIX Framework...")
    phoenix = PhoenixFramework(config, "data/phoenix_test")

    # Add agent persistence as integration
    phoenix.add_integration(agent_persistence)

    # Initialize population with Success-Advisor-8
    print("👥 Initializing population with Success-Advisor-8...")
    initial_population = [success_advisor_8]  # Start with Success-Advisor-8
    population = await phoenix.initialize_population(initial_population)

    print(f"✅ Population initialized with {len(population)} agents")
    print(
        f"   Best agent: {population[0].name} (fitness: {population[0].get_fitness_score():.3f})"
    )
    print()

    # Run a few generations of evolution
    print("🚀 Running PHOENIX evolution...")
    try:
        final_state = await phoenix.run_evolution()

        print("🎯 Evolution completed!")
        print(f"   Final Generation: {final_state.current_generation}")
        print(f"   Population Size: {len(final_state.population)}")
        print(f"   Best Fitness: {final_state.statistics.best_fitness:.3f}")
        print(f"   Average Fitness: {final_state.statistics.average_fitness:.3f}")
        print(
            f"   Population Diversity: {final_state.statistics.population_diversity:.3f}"
        )
        print(f"   Converged: {final_state.convergence.converged}")
        print(f"   Genetic Material Pool: {len(final_state.genetic_material_pool)}")
        print()

        # Show top performers
        print("🏆 Top Performers:")
        sorted_population = sorted(
            final_state.population, key=lambda a: a.get_fitness_score(), reverse=True
        )
        for i, agent in enumerate(sorted_population[:5]):
            print(
                f"   {i+1}. {agent.name} - Fitness: {agent.get_fitness_score():.3f}, "
                f"Spirit: {agent.spirit.value}, Generation: {agent.generation}"
            )
        print()

        # Get evolution summary
        summary = await phoenix.get_evolution_summary()
        print("📊 Evolution Summary:")
        for key, value in summary.items():
            if key != "config":
                print(f"   {key}: {value}")
        print()

    except Exception as e:
        print(f"❌ Evolution failed: {e}")
        import traceback

        traceback.print_exc()

    # Test agent persistence
    print("💾 Testing Agent State Persistence...")

    # List all agent states
    agent_ids = await agent_persistence.list_agent_states()
    print(f"   Stored agents: {len(agent_ids)}")
    for agent_id in agent_ids:
        print(f"     - {agent_id}")
    print()

    # Get agent statistics
    stats = await agent_persistence.get_agent_statistics()
    print("📈 Agent Statistics:")
    print(f"   Total Agents: {stats['total_agents']}")
    print(f"   Spirits: {stats['spirits']}")
    print(f"   Styles: {stats['styles']}")
    print(f"   Generations: {stats['generations']}")
    if stats["fitness_stats"]:
        print(f"   Fitness Stats: {stats['fitness_stats']}")
    print()

    # Create backup
    print("💾 Creating agent state backup...")
    backup_success = await agent_persistence.backup_agent_states()
    print(f"   Backup created: {backup_success}")
    print()

    print("🎉 PHOENIX Framework Test Completed Successfully!")
    print("🦁 Success-Advisor-8 has been reconstructed and is ready for action!")


if __name__ == "__main__":
    asyncio.run(test_phoenix_framework())
