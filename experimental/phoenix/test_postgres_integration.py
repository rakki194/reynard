#!/usr/bin/env python3
"""
Test PostgreSQL Integration for Phoenix Experiments

Tests the integration between Phoenix experiments and PostgreSQL ECS system.
"""

import asyncio
import sys
import logging
from pathlib import Path

# Add the backend to the path for ECS service access
sys.path.append("/home/kade/runeset/reynard/backend")

from experiments.config import ExperimentConfig, ExperimentType
from src.integration.postgres_data_loader import get_postgres_data_loader

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_postgres_integration():
    """Test PostgreSQL integration for Phoenix experiments."""
    print("🦁 Testing PostgreSQL Integration for Phoenix Experiments")
    print("=" * 60)

    try:
        # Initialize data loader
        data_loader = get_postgres_data_loader()

        # Test 1: Load Success-Advisor-8 from PostgreSQL
        print("\n1. Testing Success-Advisor-8 data loading...")
        success_advisor_data = await data_loader.load_success_advisor_8()

        if success_advisor_data:
            print("✅ Success-Advisor-8 loaded successfully!")
            print(f"   Name: {success_advisor_data.get('name')}")
            print(f"   Spirit: {success_advisor_data.get('spirit')}")
            print(
                f"   Personality Traits: {len(success_advisor_data.get('personality_traits', {}))}"
            )
            print(
                f"   Physical Traits: {len(success_advisor_data.get('physical_traits', {}))}"
            )
            print(
                f"   Ability Traits: {len(success_advisor_data.get('ability_traits', {}))}"
            )
        else:
            print("❌ Failed to load Success-Advisor-8")
            return False

        # Test 2: Load Phoenix test agents
        print("\n2. Testing Phoenix test agents loading...")
        phoenix_agents = await data_loader.load_phoenix_test_agents()

        if phoenix_agents:
            print(f"✅ Loaded {len(phoenix_agents)} Phoenix test agents!")
            for i, agent in enumerate(phoenix_agents[:3]):  # Show first 3
                print(f"   {i+1}. {agent.get('name')} ({agent.get('agent_id')})")
        else:
            print("❌ Failed to load Phoenix test agents")
            return False

        # Test 3: Test agent comparison
        print("\n3. Testing agent comparison...")
        if len(phoenix_agents) >= 2:
            comparison = await data_loader.compare_agents(
                phoenix_agents[0].get("agent_id"), phoenix_agents[1].get("agent_id")
            )

            if comparison:
                print("✅ Agent comparison successful!")
                print(
                    f"   Personality Similarity: {comparison.get('personality_similarity', 0):.3f}"
                )
                print(
                    f"   Physical Similarity: {comparison.get('physical_similarity', 0):.3f}"
                )
                print(
                    f"   Ability Similarity: {comparison.get('ability_similarity', 0):.3f}"
                )
            else:
                print("❌ Agent comparison failed")
                return False

        # Test 4: Test experiment configuration
        print("\n4. Testing experiment configuration...")
        config = ExperimentConfig(
            experiment_type=ExperimentType.PHOENIX_EVOLUTIONARY, use_postgresql=True
        )

        print("✅ Experiment configuration created!")
        print(f"   Target Agent ID: {config.target_agent_id}")
        print(f"   Use PostgreSQL: {config.use_postgresql}")
        print(f"   Population Size: {config.population_size}")
        print(f"   Max Generations: {config.max_generations}")

        # Test 5: Test trait loading
        print("\n5. Testing trait loading...")
        traits = await data_loader.get_agent_traits(config.target_agent_id)

        if traits:
            print("✅ Agent traits loaded successfully!")
            print(f"   Personality Traits: {len(traits.get('personality_traits', {}))}")
            print(f"   Physical Traits: {len(traits.get('physical_traits', {}))}")
            print(f"   Ability Traits: {len(traits.get('ability_traits', {}))}")
        else:
            print("❌ Failed to load agent traits")
            return False

        print("\n🎉 All PostgreSQL integration tests passed!")
        return True

    except Exception as e:
        print(f"❌ PostgreSQL integration test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


async def main():
    """Main test function."""
    success = await test_postgres_integration()

    if success:
        print("\n✅ PostgreSQL integration is working correctly!")
        print("🦁 Phoenix experiments are ready to use PostgreSQL backend!")
    else:
        print("\n❌ PostgreSQL integration has issues that need to be resolved.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
