#!/usr/bin/env python3
"""
Test script for the inheritance system.
"""

import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))


def test_inheritance_system():
    """Test the inheritance system components."""
    print("🧬 Testing Reynard Inheritance System")
    print("=" * 50)

    try:
        from agent_traits import AgentTraits

        print("✅ AgentTraits imported successfully")

        # Test trait generation
        traits_system = AgentTraits()
        fox_traits = traits_system.generate_random_traits("fox")
        wolf_traits = traits_system.generate_random_traits("wolf")

        print(f"🦊 Fox traits: {traits_system.get_trait_summary(fox_traits)}")
        print(f"🐺 Wolf traits: {traits_system.get_trait_summary(wolf_traits)}")

        # Test trait crossover
        offspring_traits = traits_system.crossover_traits(fox_traits, wolf_traits)
        print(
            f"🧬 Offspring traits: {traits_system.get_trait_summary(offspring_traits)}"
        )

    except ImportError as e:
        print(f"❌ AgentTraits import failed: {e}")
        return False

    try:
        from agent_lineage import LineageManager

        print("✅ LineageManager imported successfully")

        # Test lineage manager
        lineage_manager = LineageManager()
        print("✅ LineageManager initialized")

    except ImportError as e:
        print(f"❌ LineageManager import failed: {e}")
        return False

    try:
        from inherited_name_generator import InheritedNameGenerator

        print("✅ InheritedNameGenerator imported successfully")

        # Test name generation
        name_generator = InheritedNameGenerator()
        inherited_name = name_generator.generate_inherited_name(
            offspring_traits, "Brave-Arbiter-56", "Cunning-Sage-13", 2
        )
        print(f"📛 Generated inherited name: {inherited_name}")

    except ImportError as e:
        print(f"❌ InheritedNameGenerator import failed: {e}")
        return False

    try:
        from enhanced_agent_manager import EnhancedAgentManager

        print("✅ EnhancedAgentManager imported successfully")

        # Test enhanced manager
        enhanced_manager = EnhancedAgentManager()
        print("✅ EnhancedAgentManager initialized")

        # Create test agents
        parent1 = enhanced_manager.create_agent("parent1", "wolf", "foundation")
        parent2 = enhanced_manager.create_agent("parent2", "fox", "exo")

        print(f"👨‍👩‍👧‍👦 Created parent1: {parent1['name']}")
        print(f"👨‍👩‍👧‍👦 Created parent2: {parent2['name']}")

        # Create offspring
        offspring = enhanced_manager.create_offspring(
            "parent1", "parent2", "offspring1"
        )
        print(f"👶 Created offspring: {offspring['name']}")

        # Test compatibility analysis
        compatibility = enhanced_manager.analyze_genetic_compatibility(
            "parent1", "parent2"
        )
        print(f"💕 Compatibility: {compatibility['compatibility']:.2f}")

    except ImportError as e:
        print(f"❌ EnhancedAgentManager import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ EnhancedAgentManager test failed: {e}")
        return False

    print("\n🎉 All inheritance system tests passed!")
    return True


if __name__ == "__main__":
    success = test_inheritance_system()
    sys.exit(0 if success else 1)
