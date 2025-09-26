#!/usr/bin/env python3
"""Standalone Real Agent Genome Experiment

This script runs a comparison experiment between agents with and without genome data
using real Ollama Qwen3 model integration, without complex import dependencies.

Author: Reynard-Director-36
Version: 1.0.0
"""

import argparse
import asyncio
import json
import logging
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any

import aiohttp


class SpiritType(Enum):
    """Available spirit types for agents."""

    FOX = "fox"
    WOLF = "wolf"
    OTTER = "otter"
    EAGLE = "eagle"
    LION = "lion"
    TIGER = "tiger"
    DRAGON = "dragon"
    PHOENIX = "phoenix"
    ALIEN = "alien"
    YETI = "yeti"


class NamingStyle(Enum):
    """Naming styles for agent generation."""

    FOUNDATION = "foundation"
    EXO = "exo"
    HYBRID = "hybrid"
    CYBERPUNK = "cyberpunk"
    MYTHOLOGICAL = "mythological"
    SCIENTIFIC = "scientific"


@dataclass
class AgentState:
    """Simplified agent state for the experiment."""

    id: str
    name: str
    spirit: SpiritType
    style: NamingStyle
    generation: int
    parents: list[str]
    personality_traits: dict[str, float]
    physical_traits: dict[str, float]
    ability_traits: dict[str, float]
    performance_history: list[dict[str, Any]]
    knowledge_base: dict[str, Any]


class OllamaInterface:
    """Interface for interacting with Ollama models."""

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        model: str = "qwen2.5:3b",
    ):
        self.base_url = base_url
        self.model = model
        self.logger = logging.getLogger(__name__)

    async def generate_response(
        self,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        """Generate a response from the Ollama model."""
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.7, "top_p": 0.9, "num_predict": 500},
            }

            if system_prompt:
                payload["system"] = system_prompt

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get("response", "")
                    self.logger.error(f"Ollama API error: {response.status}")
                    return ""
        except Exception as e:
            self.logger.error(f"Error calling Ollama: {e}")
            return ""

    async def is_available(self) -> bool:
        """Check if Ollama is available."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=5),
                ) as response:
                    return response.status == 200
        except:
            return False


class RealAgentInterface:
    """Interface for collecting real agent data and performing genome-based conditioning."""

    def __init__(self, ollama_interface: OllamaInterface, data_dir: str = "data"):
        self.ollama = ollama_interface
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.logger = logging.getLogger(__name__)

        # Task prompts for agent evaluation
        self.evaluation_tasks = [
            "Write a brief analysis of a complex software architecture problem and propose a solution.",
            "Explain the concept of evolutionary algorithms and their applications in AI.",
            "Describe the process of knowledge distillation in machine learning.",
            "Analyze the trade-offs between different database design approaches.",
            "Create a plan for implementing a distributed system with high availability.",
        ]

    async def collect_agent_data(
        self,
        agent: AgentState,
        task_prompt: str,
    ) -> dict[str, Any]:
        """Collect real data from an agent by having it perform a task."""
        self.logger.info(
            f"Collecting data from agent {agent.name} for task: {task_prompt[:50]}...",
        )

        # Create system prompt based on agent traits
        system_prompt = self._create_system_prompt(agent)

        # Generate response from agent
        response = await self.ollama.generate_response(task_prompt, system_prompt)

        # Analyze the response
        analysis = await self._analyze_agent_response(agent, response, task_prompt)

        return {
            "agent_id": agent.id,
            "agent_name": agent.name,
            "spirit": agent.spirit.value,
            "style": agent.style.value,
            "task_prompt": task_prompt,
            "system_prompt": system_prompt,
            "response": response,
            "response_length": len(response.split()),
            "analysis": analysis,
            "timestamp": datetime.now().isoformat(),
        }

    def _create_system_prompt(self, agent: AgentState) -> str:
        """Create a system prompt that reflects the agent's traits and characteristics."""
        spirit_descriptions = {
            "fox": "You are a cunning and strategic fox, known for your intelligence and adaptability. You approach problems with clever solutions and think several steps ahead.",
            "wolf": "You are a loyal and protective wolf, focused on teamwork and security. You prioritize the safety and success of your pack and work collaboratively.",
            "otter": "You are a playful and enthusiastic otter, bringing joy and thoroughness to your work. You approach tasks with curiosity and attention to detail.",
            "lion": "You are a confident and regal lion, a natural leader who takes charge and inspires others. You make bold decisions and lead with authority.",
            "eagle": "You are a visionary eagle with keen insight and high-level perspective. You see the big picture and provide strategic guidance.",
            "tiger": "You are a focused and determined tiger, known for your precision and stealth. You work methodically and strike with calculated precision.",
            "dragon": "You are a wise and powerful dragon with ancient knowledge and elemental mastery. You bring deep wisdom and transformative power.",
            "phoenix": "You are a resilient phoenix, capable of renewal and transformation. You rise from challenges stronger and bring hope and renewal.",
            "alien": "You are an advanced alien being with otherworldly perspective and innovative thinking. You approach problems with fresh, unconventional solutions.",
            "yeti": "You are a mysterious yeti with mountain wisdom and elemental strength. You bring grounded, practical knowledge and mysterious insight.",
        }

        spirit_desc = spirit_descriptions.get(
            agent.spirit.value,
            "You are a unique being with special characteristics.",
        )

        # Add trait-based characteristics
        trait_characteristics = []
        if agent.personality_traits.get("creativity", 0) > 0.7:
            trait_characteristics.append("highly creative and innovative")
        if agent.personality_traits.get("leadership", 0) > 0.7:
            trait_characteristics.append("a natural leader")
        if agent.ability_traits.get("strategist", 0) > 0.7:
            trait_characteristics.append("strategically minded")
        if agent.ability_traits.get("analyzer", 0) > 0.7:
            trait_characteristics.append("analytically focused")

        trait_desc = (
            ", ".join(trait_characteristics)
            if trait_characteristics
            else "well-rounded"
        )

        return f"{spirit_desc} You are {trait_desc}. Respond to tasks in a way that reflects your unique personality and abilities. Be authentic to your character while providing helpful and accurate information."

    async def _analyze_agent_response(
        self,
        agent: AgentState,
        response: str,
        task_prompt: str,
    ) -> dict[str, Any]:
        """Analyze the agent's response for various characteristics."""
        analysis = {
            "word_count": len(response.split()),
            "sentence_count": len([s for s in response.split(".") if s.strip()]),
            "technical_terms": self._count_technical_terms(response),
            "creativity_indicators": self._count_creativity_indicators(response),
            "leadership_indicators": self._count_leadership_indicators(response),
            "analytical_indicators": self._count_analytical_indicators(response),
            "spirit_alignment": self._assess_spirit_alignment(agent, response),
            "trait_manifestation": self._assess_trait_manifestation(agent, response),
        }

        # Calculate overall quality score
        analysis["quality_score"] = self._calculate_quality_score(analysis)

        return analysis

    def _count_technical_terms(self, text: str) -> int:
        """Count technical terms in the response."""
        technical_terms = [
            "algorithm",
            "architecture",
            "system",
            "framework",
            "implementation",
            "optimization",
            "distributed",
            "scalable",
            "efficient",
            "performance",
            "database",
            "API",
            "interface",
            "component",
            "module",
            "service",
            "protocol",
            "security",
            "authentication",
            "authorization",
        ]
        return sum(1 for term in technical_terms if term.lower() in text.lower())

    def _count_creativity_indicators(self, text: str) -> int:
        """Count creativity indicators in the response."""
        creativity_indicators = [
            "innovative",
            "creative",
            "unique",
            "novel",
            "imagine",
            "design",
            "invent",
            "breakthrough",
            "revolutionary",
            "cutting-edge",
            "groundbreaking",
            "pioneering",
        ]
        return sum(1 for term in creativity_indicators if term.lower() in text.lower())

    def _count_leadership_indicators(self, text: str) -> int:
        """Count leadership indicators in the response."""
        leadership_indicators = [
            "lead",
            "guide",
            "direct",
            "manage",
            "coordinate",
            "oversee",
            "supervise",
            "mentor",
            "inspire",
            "command",
            "authority",
            "strategy",
            "vision",
            "team",
        ]
        return sum(1 for term in leadership_indicators if term.lower() in text.lower())

    def _count_analytical_indicators(self, text: str) -> int:
        """Count analytical indicators in the response."""
        analytical_indicators = [
            "analyze",
            "examine",
            "evaluate",
            "assess",
            "consider",
            "review",
            "scrutinize",
            "investigate",
            "logical",
            "rational",
            "systematic",
            "methodical",
            "data",
            "evidence",
        ]
        return sum(1 for term in analytical_indicators if term.lower() in text.lower())

    def _assess_spirit_alignment(self, agent: AgentState, response: str) -> float:
        """Assess how well the response aligns with the agent's spirit."""
        spirit_keywords = {
            "fox": ["strategic", "cunning", "intelligent", "adaptable", "clever"],
            "wolf": ["team", "pack", "loyal", "protective", "collaborative"],
            "otter": ["playful", "enthusiastic", "thorough", "curious", "detailed"],
            "lion": ["confident", "leader", "bold", "authority", "inspire"],
            "eagle": ["vision", "perspective", "strategic", "insight", "guidance"],
            "tiger": ["focused", "precise", "methodical", "determined", "calculated"],
            "dragon": ["wise", "powerful", "ancient", "transformative", "elemental"],
            "phoenix": ["resilient", "renewal", "transformation", "hope", "rising"],
            "alien": [
                "innovative",
                "unconventional",
                "advanced",
                "otherworldly",
                "fresh",
            ],
            "yeti": ["mysterious", "grounded", "practical", "mountain", "elemental"],
        }

        keywords = spirit_keywords.get(agent.spirit.value, [])
        matches = sum(1 for keyword in keywords if keyword.lower() in response.lower())
        return matches / len(keywords) if keywords else 0.0

    def _assess_trait_manifestation(
        self,
        agent: AgentState,
        response: str,
    ) -> dict[str, float]:
        """Assess how well the response manifests the agent's traits."""
        manifestations = {}

        # Check personality traits
        if agent.personality_traits.get("creativity", 0) > 0.7:
            manifestations["creativity"] = (
                self._count_creativity_indicators(response) / 10.0
            )

        if agent.personality_traits.get("leadership", 0) > 0.7:
            manifestations["leadership"] = (
                self._count_leadership_indicators(response) / 10.0
            )

        # Check ability traits
        if agent.ability_traits.get("strategist", 0) > 0.7:
            strategic_terms = ["strategy", "strategic", "plan", "approach", "method"]
            manifestations["strategy"] = (
                sum(1 for term in strategic_terms if term.lower() in response.lower())
                / 5.0
            )

        if agent.ability_traits.get("analyzer", 0) > 0.7:
            manifestations["analysis"] = (
                self._count_analytical_indicators(response) / 10.0
            )

        return manifestations

    def _calculate_quality_score(self, analysis: dict[str, Any]) -> float:
        """Calculate an overall quality score for the response."""
        # Weighted combination of various factors
        word_count_score = min(
            1.0,
            analysis["word_count"] / 200.0,
        )  # Optimal around 200 words
        technical_score = min(1.0, analysis["technical_terms"] / 10.0)
        creativity_score = min(1.0, analysis["creativity_indicators"] / 5.0)
        leadership_score = min(1.0, analysis["leadership_indicators"] / 5.0)
        analytical_score = min(1.0, analysis["analytical_indicators"] / 5.0)
        spirit_score = analysis["spirit_alignment"]

        # Calculate weighted average
        quality = (
            word_count_score * 0.2
            + technical_score * 0.2
            + creativity_score * 0.15
            + leadership_score * 0.15
            + analytical_score * 0.15
            + spirit_score * 0.15
        )

        return min(1.0, quality)

    async def collect_agent_data_without_genome(
        self,
        agent: AgentState,
        task_prompt: str,
    ) -> dict[str, Any]:
        """Collect data from agent without genome-based conditioning."""
        self.logger.info(f"Collecting data from agent {agent.name} WITHOUT genome data")

        # Generate response without system prompt (no genome conditioning)
        response = await self.ollama.generate_response(task_prompt)

        # Analyze the response
        analysis = await self._analyze_agent_response(agent, response, task_prompt)

        return {
            "agent_id": agent.id,
            "agent_name": agent.name,
            "spirit": agent.spirit.value,
            "style": agent.style.value,
            "task_prompt": task_prompt,
            "system_prompt": None,  # No genome conditioning
            "response": response,
            "response_length": len(response.split()),
            "analysis": analysis,
            "timestamp": datetime.now().isoformat(),
        }

    async def run_comparison_experiment(
        self,
        agents: list[AgentState],
        num_trials: int = 10,
    ) -> dict[str, Any]:
        """Run a comparison experiment with and without genome data."""
        self.logger.info(
            f"Running comparison experiment with {len(agents)} agents, {num_trials} trials each",
        )

        results = {
            "with_genome": [],
            "without_genome": [],
            "comparison_analysis": {},
            "timestamp": datetime.now().isoformat(),
        }

        for trial in range(num_trials):
            self.logger.info(f"Trial {trial + 1}/{num_trials}")

            # Select random task and agent
            import random

            task = random.choice(self.evaluation_tasks)
            agent = random.choice(agents)

            # Run with genome data (system prompt includes traits)
            with_genome_data = await self.collect_agent_data(agent, task)
            results["with_genome"].append(with_genome_data)

            # Run without genome data (no system prompt)
            without_genome_data = await self.collect_agent_data_without_genome(
                agent,
                task,
            )
            results["without_genome"].append(without_genome_data)

        # Perform comparison analysis
        results["comparison_analysis"] = await self._analyze_comparison_results(results)

        # Save results
        results_file = (
            self.data_dir
            / f"genome_comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        with open(results_file, "w") as f:
            json.dump(results, f, indent=2)

        self.logger.info(
            f"Comparison experiment completed. Results saved to {results_file}",
        )
        return results

    async def _analyze_comparison_results(
        self,
        results: dict[str, Any],
    ) -> dict[str, Any]:
        """Analyze the comparison between with and without genome data."""
        with_genome = results["with_genome"]
        without_genome = results["without_genome"]

        # Calculate average metrics
        with_genome_avg = {
            "quality_score": sum(r["analysis"]["quality_score"] for r in with_genome)
            / len(with_genome),
            "spirit_alignment": sum(
                r["analysis"]["spirit_alignment"] for r in with_genome
            )
            / len(with_genome),
            "technical_terms": sum(
                r["analysis"]["technical_terms"] for r in with_genome
            )
            / len(with_genome),
            "creativity_indicators": sum(
                r["analysis"]["creativity_indicators"] for r in with_genome
            )
            / len(with_genome),
            "leadership_indicators": sum(
                r["analysis"]["leadership_indicators"] for r in with_genome
            )
            / len(with_genome),
            "analytical_indicators": sum(
                r["analysis"]["analytical_indicators"] for r in with_genome
            )
            / len(with_genome),
            "response_length": sum(r["response_length"] for r in with_genome)
            / len(with_genome),
        }

        without_genome_avg = {
            "quality_score": sum(r["analysis"]["quality_score"] for r in without_genome)
            / len(without_genome),
            "spirit_alignment": sum(
                r["analysis"]["spirit_alignment"] for r in without_genome
            )
            / len(without_genome),
            "technical_terms": sum(
                r["analysis"]["technical_terms"] for r in without_genome
            )
            / len(without_genome),
            "creativity_indicators": sum(
                r["analysis"]["creativity_indicators"] for r in without_genome
            )
            / len(without_genome),
            "leadership_indicators": sum(
                r["analysis"]["leadership_indicators"] for r in without_genome
            )
            / len(without_genome),
            "analytical_indicators": sum(
                r["analysis"]["analytical_indicators"] for r in without_genome
            )
            / len(without_genome),
            "response_length": sum(r["response_length"] for r in without_genome)
            / len(without_genome),
        }

        # Calculate improvements
        improvements = {}
        for metric in with_genome_avg:
            if without_genome_avg[metric] > 0:
                improvements[metric] = (
                    (with_genome_avg[metric] - without_genome_avg[metric])
                    / without_genome_avg[metric]
                ) * 100
            else:
                improvements[metric] = (
                    float("inf") if with_genome_avg[metric] > 0 else 0
                )

        return {
            "with_genome_averages": with_genome_avg,
            "without_genome_averages": without_genome_avg,
            "improvements_percent": improvements,
            "sample_size": len(with_genome),
            "statistical_significance": "TBD - requires statistical testing",
        }


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


async def run_experiment(num_trials: int = 10, model: str = "qwen2.5:3b"):
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
        "--trials",
        type=int,
        default=10,
        help="Number of trials to run",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="qwen2.5:3b",
        help="Ollama model to use",
    )
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()

    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
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
