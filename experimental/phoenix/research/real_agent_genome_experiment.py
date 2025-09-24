#!/usr/bin/env python3
"""Real Agent Genome Experiment

This script runs a comparison experiment between agents with and without genome data
using real Ollama Qwen3 model integration.

Author: Reynard-Director-36
Version: 1.0.0
"""

import argparse
import asyncio
import logging
import sys
from pathlib import Path

# Add the src directory to the path
sys.path.append(str(Path(__file__).parent.parent / "src"))

# Import with absolute path to avoid relative import issues
try:
    from integration.real_agent_interface import OllamaInterface, RealAgentInterface
    from utils.data_structures import AgentState, NamingStyle, SpiritType
except ImportError as e:
    print(f"Import error: {e}")
    print("Using standalone implementation instead...")
    # Use the standalone implementation which has all classes embedded
    import subprocess
    import sys

    result = subprocess.run(
        [sys.executable, "standalone_genome_experiment.py"] + sys.argv[1:],
        cwd=Path(__file__).parent, check=False,
    )
    sys.exit(result.returncode)


async def create_test_agents() -> list[AgentState]:
    """Create a set of test agents with different characteristics."""
    agents = []

    # Fox agent - strategic and cunning
    fox_agent = AgentState(
        id="test_fox_001",
        name="Strategic-Fox-01",
        spirit=SpiritType.FOX,
        style=NamingStyle.FOUNDATION,
        generation=0,
        parents=[],
        personality_traits={
            "creativity": 0.8,
            "intelligence": 0.9,
            "adaptability": 0.85,
            "cunning": 0.9,
            "strategic_thinking": 0.95,
        },
        physical_traits={"agility": 0.9, "speed": 0.85, "grace": 0.8},
        ability_traits={
            "strategist": 0.95,
            "analyzer": 0.9,
            "problem_solver": 0.85,
            "innovator": 0.8,
        },
        performance_history=[],
        knowledge_base={},
    )
    agents.append(fox_agent)

    # Wolf agent - loyal and protective
    wolf_agent = AgentState(
        id="test_wolf_001",
        name="Pack-Wolf-01",
        spirit=SpiritType.WOLF,
        style=NamingStyle.FOUNDATION,
        generation=0,
        parents=[],
        personality_traits={
            "loyalty": 0.95,
            "protectiveness": 0.9,
            "leadership": 0.85,
            "teamwork": 0.9,
            "reliability": 0.9,
        },
        physical_traits={"strength": 0.9, "endurance": 0.85, "size": 0.8},
        ability_traits={
            "leader": 0.9,
            "protector": 0.95,
            "coordinator": 0.85,
            "communicator": 0.8,
        },
        performance_history=[],
        knowledge_base={},
    )
    agents.append(wolf_agent)

    # Otter agent - playful and thorough
    otter_agent = AgentState(
        id="test_otter_001",
        name="Playful-Otter-01",
        spirit=SpiritType.OTTER,
        style=NamingStyle.FOUNDATION,
        generation=0,
        parents=[],
        personality_traits={
            "playfulness": 0.9,
            "enthusiasm": 0.95,
            "curiosity": 0.9,
            "thoroughness": 0.85,
            "joy": 0.9,
        },
        physical_traits={"agility": 0.9, "grace": 0.85, "flexibility": 0.9},
        ability_traits={
            "teacher": 0.85,
            "explorer": 0.9,
            "quality_assurance": 0.85,
            "tester": 0.9,
        },
        performance_history=[],
        knowledge_base={},
    )
    agents.append(otter_agent)

    # Lion agent - confident and regal
    lion_agent = AgentState(
        id="test_lion_001",
        name="Regal-Lion-01",
        spirit=SpiritType.LION,
        style=NamingStyle.FOUNDATION,
        generation=0,
        parents=[],
        personality_traits={
            "confidence": 0.95,
            "leadership": 0.9,
            "authority": 0.9,
            "boldness": 0.85,
            "charisma": 0.9,
        },
        physical_traits={"strength": 0.9, "size": 0.85, "grace": 0.8},
        ability_traits={
            "leader": 0.95,
            "inspirer": 0.9,
            "decision_maker": 0.85,
            "coordinator": 0.8,
        },
        performance_history=[],
        knowledge_base={},
    )
    agents.append(lion_agent)

    return agents


async def check_ollama_availability(ollama_interface: OllamaInterface) -> bool:
    """Check if Ollama is available and the model is accessible."""
    print("🔍 Checking Ollama availability...")

    if not await ollama_interface.is_available():
        print(
            "❌ Ollama is not available. Please ensure Ollama is running on localhost:11434",
        )
        return False

    print("✅ Ollama is available")

    # Test a simple generation
    print("🧪 Testing model generation...")
    test_response = await ollama_interface.generate_response(
        "Hello, can you respond with just 'OK'?",
    )

    if not test_response:
        print("❌ Model generation failed. Please check if the model is available.")
        return False

    print(f"✅ Model generation successful: {test_response[:50]}...")
    return True


async def run_experiment(num_trials: int = 10, model: str = "qwen2.5:7b"):
    """Run the genome comparison experiment."""
    print("🚀 Starting Real Agent Genome Experiment")
    print(f"📊 Configuration: {num_trials} trials, model: {model}")

    # Initialize interfaces
    ollama_interface = OllamaInterface(model=model)
    agent_interface = RealAgentInterface(ollama_interface)

    # Check availability
    if not await check_ollama_availability(ollama_interface):
        return None

    # Create test agents
    print("👥 Creating test agents...")
    agents = await create_test_agents()
    print(f"✅ Created {len(agents)} test agents")

    # Run comparison experiment
    print("🧬 Running genome comparison experiment...")
    results = await agent_interface.run_comparison_experiment(agents, num_trials)

    # Display results
    print("\n" + "=" * 80)
    print("📈 EXPERIMENT RESULTS")
    print("=" * 80)

    comparison = results["comparison_analysis"]

    print(f"\n📊 Sample Size: {comparison['sample_size']} trials")
    print(f"⏰ Timestamp: {results['timestamp']}")

    print("\n🔬 METRIC COMPARISON:")
    print("-" * 50)

    for metric in comparison["with_genome_averages"]:
        with_val = comparison["with_genome_averages"][metric]
        without_val = comparison["without_genome_averages"][metric]
        improvement = comparison["improvements_percent"][metric]

        print(
            f"{metric.replace('_', ' ').title():<25}: {with_val:.3f} vs {without_val:.3f} ({improvement:+.1f}%)",
        )

    # Identify key findings
    print("\n🎯 KEY FINDINGS:")
    print("-" * 50)

    quality_improvement = comparison["improvements_percent"]["quality_score"]
    spirit_improvement = comparison["improvements_percent"]["spirit_alignment"]

    if quality_improvement > 0:
        print(
            f"✅ Quality Score: {quality_improvement:+.1f}% improvement with genome data",
        )
    else:
        print(f"❌ Quality Score: {quality_improvement:+.1f}% change with genome data")

    if spirit_improvement > 0:
        print(
            f"✅ Spirit Alignment: {spirit_improvement:+.1f}% improvement with genome data",
        )
    else:
        print(
            f"❌ Spirit Alignment: {spirit_improvement:+.1f}% change with genome data",
        )

    # Check for significant improvements
    significant_improvements = [
        metric
        for metric, improvement in comparison["improvements_percent"].items()
        if improvement > 10
    ]

    if significant_improvements:
        print("\n🌟 Significant Improvements (>10%):")
        for metric in significant_improvements:
            improvement = comparison["improvements_percent"][metric]
            print(f"   • {metric.replace('_', ' ').title()}: {improvement:+.1f}%")

    print(f"\n💾 Results saved to: {agent_interface.data_dir}/genome_comparison_*.json")

    return results


async def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Run Real Agent Genome Experiment")
    parser.add_argument(
        "--trials", type=int, default=10, help="Number of trials to run",
    )
    parser.add_argument(
        "--model", type=str, default="qwen2.5:7b", help="Ollama model to use",
    )
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()

    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    try:
        await run_experiment(args.trials, args.model)
    except KeyboardInterrupt:
        print("\n⏹️  Experiment interrupted by user")
    except Exception as e:
        print(f"\n❌ Experiment failed: {e}")
        if args.verbose:
            import traceback

            traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
