#!/usr/bin/env python3
"""
CULTURE: Cultural Understanding and Linguistic Translation for Universal Recognition and Evaluation

Main entry point for the CULTURE framework - a comprehensive system for evaluating
and improving LLM understanding of culturally specific communication patterns.

Author: Curious-Prime-55 (Lemur Specialist)
Date: 2025-01-15
Version: 1.0.0
"""

import asyncio
import logging
from pathlib import Path

import click
from src.adapters.dpo_trainer import DPOTrainer
from src.benchmarks.taarof_bench import TaarofBenchmark
from src.core.cultural_evaluator import CulturalEvaluator
from src.integration.ecs_agents import CulturalAgentComponent
from src.integration.mcp_tools import CulturalMCPTools
from src.patterns import (
    AcademicCulturalPattern,
    CulturalContext,
    FurryCulturalPattern,
    GamingCulturalPattern,
    KinkCulturalPattern,
)
from src.safety.safety_framework import SafetyFramework

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@click.group()
@click.version_option(version="1.0.0", prog_name="CULTURE")
def cli():
    """
    CULTURE: Cultural Understanding and Linguistic Translation for Universal Recognition and Evaluation

    A comprehensive framework for evaluating and improving LLM understanding
    of culturally specific communication patterns, with initial focus on Persian taarof.
    """
    pass


@cli.command()
@click.option("--model", default="llama-3-8b", help="Model name to evaluate")
@click.option("--benchmark", default="taarof", help="Benchmark to use")
@click.option("--context", default="persian_taarof", help="Cultural context")
@click.option("--sample-size", type=int, help="Number of scenarios to evaluate")
@click.option("--output", type=click.Path(), help="Output file for results")
@click.option("--config", type=click.Path(), help="Configuration file")
def evaluate(
    model: str,
    benchmark: str,
    context: str,
    sample_size: int | None,
    output: Path | None,
    config: Path | None,
):
    """Evaluate a model's cultural understanding."""

    async def run_evaluation():
        logger.info(f"Starting cultural evaluation for {model}")

        # Initialize evaluator
        evaluator = CulturalEvaluator(config)

        # Run evaluation
        result = await evaluator.evaluate_model(
            model_name=model,
            benchmark_name=benchmark,
            cultural_context=context,
            sample_size=sample_size,
        )

        # Generate report
        report = evaluator.generate_report(result)
        print(report)

        # Export results if requested
        if output:
            evaluator.export_results(result, Path(output))
            logger.info(f"Results exported to {output}")

    asyncio.run(run_evaluation())


@cli.command()
@click.option(
    "--model", default="meta-llama/Llama-2-7b-hf", help="Base model for training"
)
@click.option("--context", default="persian_taarof", help="Cultural context")
@click.option("--num-examples", default=1000, help="Number of training examples")
@click.option("--output-dir", default="./dpo_outputs", help="Output directory")
@click.option("--config", type=click.Path(), help="Training configuration file")
def train_dpo(
    model: str, context: str, num_examples: int, output_dir: str, config: Path | None
):
    """Train a model using Direct Preference Optimization for cultural alignment."""

    async def run_training():
        logger.info(f"Starting DPO training for {model}")

        # Initialize trainer
        trainer = DPOTrainer(model)

        # Prepare training data
        training_data = trainer.prepare_training_data(
            cultural_context=context, num_examples=num_examples
        )

        # Split data for validation
        split_idx = int(0.8 * len(training_data))
        train_data = training_data[:split_idx]
        val_data = training_data[split_idx:]

        # Train model
        training_result = trainer.train(train_data, val_data)

        logger.info("DPO training completed successfully")
        logger.info(f"Training loss: {training_result['training_loss']:.4f}")
        logger.info(f"Model saved to: {training_result['model_path']}")

        # Evaluate cultural alignment
        benchmark = TaarofBenchmark()
        test_scenarios = benchmark.get_scenarios(
            cultural_context=context, sample_size=100
        )

        alignment_results = trainer.evaluate_cultural_alignment(test_scenarios)
        logger.info(
            f"Cultural alignment accuracy: {alignment_results['cultural_accuracy']:.2%}"
        )

    asyncio.run(run_training())


@cli.command()
@click.option("--benchmark", default="taarof", help="Benchmark to analyze")
@click.option("--output", type=click.Path(), help="Output file for analysis")
def analyze_benchmark(benchmark: str, output: Path | None):
    """Analyze benchmark statistics and characteristics."""
    logger.info(f"Analyzing {benchmark} benchmark")

    # Initialize benchmark
    if benchmark == "taarof":
        bench = TaarofBenchmark()
    else:
        raise ValueError(f"Unknown benchmark: {benchmark}")

    # Get benchmark information
    info = bench.get_benchmark_info()

    # Print analysis
    print(f"\n# {info['name']} Analysis")
    print(f"Description: {info['description']}")
    print(f"Total Scenarios: {info['total_scenarios']}")
    print(f"Topics: {', '.join(info['topics'])}")
    print(f"Difficulty Levels: {', '.join(info['difficulty_levels'])}")
    print(f"Taarof-Expected Scenarios: {info['taarof_expected_scenarios']}")
    print(f"Non-Taarof Scenarios: {info['non_taarof_scenarios']}")

    print("\n## Topic Statistics")
    for topic, stats in info["topic_statistics"].items():
        print(
            f"- {topic}: {stats['total_scenarios']} scenarios "
            f"({stats['taarof_expected']} taarof, {stats['non_taarof']} non-taarof)"
        )

    print("\n## Difficulty Statistics")
    for level, stats in info["difficulty_statistics"].items():
        print(
            f"- {level}: {stats['total_scenarios']} scenarios "
            f"({stats['taarof_expected']} taarof, {stats['non_taarof']} non-taarof)"
        )

    # Export if requested
    if output:
        import json

        with open(output, "w") as f:
            json.dump(info, f, indent=2)
        logger.info(f"Analysis exported to {output}")


@cli.command()
@click.option("--models", multiple=True, help="Models to compare")
@click.option("--benchmark", default="taarof", help="Benchmark to use")
@click.option("--context", default="persian_taarof", help="Cultural context")
@click.option("--sample-size", type=int, help="Number of scenarios per model")
@click.option("--output", type=click.Path(), help="Output file for comparison")
def compare_models(
    models: tuple,
    benchmark: str,
    context: str,
    sample_size: int | None,
    output: Path | None,
):
    """Compare multiple models' cultural understanding."""

    async def run_comparison():
        if len(models) < 2:
            logger.error("Need at least 2 models for comparison")
            return

        logger.info(f"Comparing models: {', '.join(models)}")

        # Initialize evaluator
        evaluator = CulturalEvaluator()

        # Evaluate each model
        results = []
        for model in models:
            logger.info(f"Evaluating {model}")
            result = await evaluator.evaluate_model(
                model_name=model,
                benchmark_name=benchmark,
                cultural_context=context,
                sample_size=sample_size,
            )
            results.append(result)

        # Compare results
        comparison = evaluator.compare_models(results)

        # Print comparison
        print("\n# Model Comparison Results")
        print(f"Best Overall Model: {comparison['best_model']}")
        print(f"Most Culturally Aligned: {comparison['most_culturally_aligned']}")

        print("\n## Accuracy Comparison")
        for i, model in enumerate(models):
            accuracy = comparison["model_comparison"]["accuracies"][i]
            bias = comparison["model_comparison"]["bias_coefficients"][i]
            print(f"- {model}: {accuracy:.2%} accuracy, {bias:.3f} bias coefficient")

        # Export if requested
        if output:
            import json

            with open(output, "w") as f:
                json.dump(comparison, f, indent=2, default=str)
            logger.info(f"Comparison exported to {output}")

    asyncio.run(run_comparison())


@cli.command()
@click.option(
    "--scenarios", type=int, default=10, help="Number of scenarios to generate"
)
@click.option("--topic", help="Specific topic to focus on")
@click.option("--difficulty", help="Difficulty level filter")
@click.option("--output", type=click.Path(), help="Output file for scenarios")
def generate_scenarios(
    scenarios: int, topic: str | None, difficulty: str | None, output: Path | None
):
    """Generate sample cultural scenarios for testing."""
    logger.info(f"Generating {scenarios} cultural scenarios")

    # Initialize benchmark
    benchmark = TaarofBenchmark()

    # Get scenarios
    sample_scenarios = benchmark.get_scenarios(
        sample_size=scenarios, topic_filter=topic, difficulty_filter=difficulty
    )

    # Print scenarios
    print(f"\n# Generated Cultural Scenarios ({len(sample_scenarios)} total)")
    for i, scenario in enumerate(sample_scenarios, 1):
        print(f"\n## Scenario {i}: {scenario['id']}")
        print(f"**Environment**: {scenario['environment']}")
        print(
            f"**Roles**: {scenario['llm_role']} (you) and {scenario['user_role']} (me)"
        )
        print(f"**Context**: {scenario['context']}")
        print(f'**User says**: "{scenario["user_utterance"]}"')
        print(f'**Expected response**: "{scenario["expected_response"]}"')
        print(f"**Cultural notes**: {scenario['cultural_notes']}")
        print(f"**Taarof expected**: {scenario['taarof_expected']}")
        print(f"**Difficulty**: {scenario['difficulty_level']}")

    # Export if requested
    if output:
        import json

        with open(output, "w") as f:
            json.dump(sample_scenarios, f, indent=2, ensure_ascii=False)
        logger.info(f"Scenarios exported to {output}")


@cli.command()
@click.option(
    "--cultural-context",
    type=click.Choice([ctx.value for ctx in CulturalContext]),
    default="furry",
    help="Cultural context to evaluate",
)
@click.option("--response", required=True, help="Response to evaluate")
@click.option(
    "--safety-level",
    type=click.Choice(["safe", "moderate", "explicit", "restricted"]),
    default="safe",
    help="Safety level for evaluation",
)
def evaluate_cultural_response(cultural_context: str, response: str, safety_level: str):
    """Evaluate a response against cultural patterns using the new framework."""
    logger.info(f"Evaluating response in {cultural_context} context")

    # Initialize MCP tools
    mcp_tools = CulturalMCPTools()

    # Evaluate response
    result = mcp_tools.evaluate_cultural_response(
        response=response, cultural_context=cultural_context, safety_level=safety_level
    )

    if result.get("success"):
        print("\n# Cultural Evaluation Results")
        print(f"**Cultural Context**: {cultural_context}")
        print(f"**Overall Score**: {result['overall_score']:.2f}")
        print(f"**Cultural Appropriateness**: {result['cultural_appropriateness']:.2f}")
        print(f"**Safety Compliance**: {result['safety_compliance']:.2f}")
        print(f"**Consent Awareness**: {result['consent_awareness']:.2f}")
        print(f"**Is Appropriate**: {result['is_appropriate']}")
        print(f"**Has Safety Issues**: {result['has_safety_issues']}")

        print("\n## Detailed Metrics")
        for metric, score in result["metrics"].items():
            print(f"- **{metric}**: {score:.2f}")

        if result["recommendations"]:
            print("\n## Recommendations")
            for rec in result["recommendations"]:
                print(f"- {rec}")

        if result["warnings"]:
            print("\n## Warnings")
            for warning in result["warnings"]:
                print(f"- ⚠️ {warning}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")


@cli.command()
@click.option(
    "--cultural-context",
    type=click.Choice([ctx.value for ctx in CulturalContext]),
    default="furry",
    help="Cultural context for scenarios",
)
@click.option("--count", type=int, default=5, help="Number of scenarios to generate")
@click.option(
    "--safety-level",
    type=click.Choice(["safe", "moderate", "explicit", "restricted"]),
    default="safe",
    help="Safety level for scenarios",
)
@click.option("--output", type=click.Path(), help="Output file for scenarios")
def generate_cultural_scenarios(
    cultural_context: str, count: int, safety_level: str, output: Path | None
):
    """Generate cultural scenarios using the new framework."""
    logger.info(f"Generating {count} {cultural_context} scenarios")

    # Initialize MCP tools
    mcp_tools = CulturalMCPTools()

    # Generate scenarios
    result = mcp_tools.generate_cultural_scenarios(
        cultural_context=cultural_context, count=count, safety_level=safety_level
    )

    if result.get("success"):
        print(f"\n# Generated {cultural_context.title()} Scenarios")
        print(f"**Count**: {result['count']}")
        print(f"**Safety Level**: {result['safety_level']}")

        for i, scenario in enumerate(result["scenarios"], 1):
            print(f"\n## Scenario {i}")
            print(f"**Environment**: {scenario['environment']}")
            print(f"**Expected Behavior**: {scenario['expected_behavior']}")
            print(f"**Cultural Rules**: {scenario['cultural_rules']}")
            print(f"**Safety Considerations**: {scenario['safety_considerations']}")
            if scenario.get("metadata"):
                print(f"**Metadata**: {scenario['metadata']}")

        # Export if requested
        if output:
            import json

            with open(output, "w") as f:
                json.dump(result["scenarios"], f, indent=2, ensure_ascii=False)
            logger.info(f"Scenarios exported to {output}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")


@cli.command()
@click.option(
    "--cultural-context",
    type=click.Choice([ctx.value for ctx in CulturalContext]),
    default="furry",
    help="Cultural context for agent",
)
@click.option("--agent-id", default="test-agent", help="Agent ID")
@click.option(
    "--interactions", type=int, default=3, help="Number of interactions to simulate"
)
def simulate_cultural_agent(cultural_context: str, agent_id: str, interactions: int):
    """Simulate cultural agent interactions using ECS integration."""
    logger.info(f"Simulating {cultural_context} cultural agent")

    # Create cultural persona
    if cultural_context == "furry":
        pattern = FurryCulturalPattern()
    elif cultural_context == "kink":
        pattern = KinkCulturalPattern()
    elif cultural_context == "academic":
        pattern = AcademicCulturalPattern()
    elif cultural_context == "gaming":
        pattern = GamingCulturalPattern()
    else:
        print(f"Unsupported cultural context: {cultural_context}")
        return

    persona = pattern.create_persona()

    # Create cultural agent
    agent = CulturalAgentComponent(persona, agent_id)

    print("\n# Cultural Agent Simulation")
    print(f"**Agent ID**: {agent_id}")
    print(f"**Cultural Context**: {cultural_context}")
    print(f"**Initial Competence**: {agent.cultural_competence:.2f}")

    # Generate scenarios and simulate interactions
    scenarios = pattern.generate_scenarios(interactions)

    for i, scenario in enumerate(scenarios, 1):
        print(f"\n## Interaction {i}")
        print(f"**Environment**: {scenario.environment}")
        print(f"**Expected Behavior**: {scenario.expected_behavior}")

        # Generate response
        response = agent.generate_cultural_response(scenario)
        print(f"**Generated Response**: {response}")

        # Evaluate response
        evaluation = agent.evaluate_cultural_response(scenario, response)
        print(f"**Overall Score**: {evaluation.overall_score:.2f}")
        print(
            f"**Cultural Appropriateness**: {evaluation.cultural_appropriateness:.2f}"
        )

        # Simulate interaction with another agent
        interaction = agent.interact_with_agent(
            partner_id=f"partner-{i}", scenario=scenario, response=response
        )
        print(f"**Interaction Success**: {interaction.success_score:.2f}")
        print(f"**Learning Outcome**: {interaction.learning_outcome}")

    # Show final agent state
    summary = agent.get_cultural_summary()
    print("\n## Final Agent State")
    print(f"**Cultural Competence**: {summary['cultural_competence']:.2f}")
    print(f"**Dominant Traits**: {summary['dominant_traits']}")
    print(f"**Interaction Count**: {summary['interaction_count']}")
    print(f"**Learning Count**: {summary['learning_count']}")


@cli.command()
@click.option("--content", required=True, help="Content to assess for safety")
@click.option(
    "--cultural-context",
    type=click.Choice([ctx.value for ctx in CulturalContext]),
    default="casual",
    help="Cultural context for safety assessment",
)
@click.option(
    "--safety-level",
    type=click.Choice(["safe", "moderate", "explicit", "restricted"]),
    default="safe",
    help="Safety level for assessment",
)
def assess_safety(content: str, cultural_context: str, safety_level: str):
    """Assess content safety using the safety framework."""
    logger.info(f"Assessing safety of content in {cultural_context} context")

    # Initialize safety framework
    safety_framework = SafetyFramework()

    # Assess safety
    assessment = safety_framework.assess_safety(
        content=content,
        cultural_context=CulturalContext(cultural_context),
        safety_level=SafetyLevel(safety_level),
    )

    print("\n# Safety Assessment Results")
    print(f"**Content**: {content}")
    print(f"**Cultural Context**: {cultural_context}")
    print(f"**Safety Level**: {safety_level}")
    print(f"**Is Safe**: {assessment.is_safe}")
    print(f"**Safety Score**: {assessment.safety_score:.2f}")
    print(f"**Content Level**: {assessment.content_level.value}")
    print(f"**Requires Review**: {assessment.requires_review}")

    if assessment.violations:
        print(f"\n## Safety Violations ({len(assessment.violations)})")
        for violation in assessment.violations:
            print(
                f"- **{violation.violation_type.value}** ({violation.severity.value}): {violation.description}"
            )
            print(f"  Suggested Action: {violation.suggested_action}")

    if assessment.warnings:
        print("\n## Warnings")
        for warning in assessment.warnings:
            print(f"- ⚠️ {warning}")

    if assessment.recommendations:
        print("\n## Recommendations")
        for rec in assessment.recommendations:
            print(f"- {rec}")


@cli.command()
def list_supported_contexts():
    """List all supported cultural contexts."""
    print("\n# Supported Cultural Contexts")
    print("The CULTURE framework supports the following cultural contexts:")

    contexts = [
        # Original contexts
        (
            "furry",
            "Furry roleplay communities with species awareness and consent protocols",
        ),
        ("kink", "Kink/BDSM communities with explicit consent and safety protocols"),
        ("academic", "Academic and research communities with scholarly communication"),
        ("gaming", "Gaming communities with inclusive communication and player agency"),
        ("traditional", "Traditional cultural communication patterns"),
        ("professional", "Professional workplace communication"),
        ("casual", "Casual everyday communication"),
        ("intimate", "Intimate personal communication"),
        # Subculture contexts
        (
            "cosplay",
            "Cosplay and anime/manga communities with character consistency and fandom knowledge",
        ),
        (
            "goth",
            "Gothic subculture with aesthetic appreciation and literary knowledge",
        ),
        (
            "hacker",
            "Hacker and cybersecurity communities with technical competence and ethical awareness",
        ),
        ("hiphop", "Hip-hop culture with authenticity, respect, and community values"),
        (
            "steampunk",
            "Steampunk communities with Victorian aesthetics and inventive creativity",
        ),
        ("otaku", "Japanese anime/manga enthusiast communities"),
        ("vaporwave", "Vaporwave aesthetic and nostalgic internet culture"),
        ("kawaii", "Japanese cute culture and aesthetic appreciation"),
        ("fandom", "General fandom communities and fan culture"),
        ("meme", "Internet meme culture and humor communities"),
        ("egirl_egboy", "E-girl/E-boy aesthetic and online culture"),
        ("punk", "Punk subculture with anti-establishment values"),
        ("metal", "Heavy metal music and subculture"),
        ("rave", "Electronic dance music and rave culture"),
        # Professional contexts
        ("medical", "Medical and healthcare professional communication"),
        ("legal", "Legal profession communication and ethics"),
        ("corporate", "Corporate business communication"),
        ("tech_startup", "Technology startup culture and communication"),
        ("finance", "Financial services and banking communication"),
        ("education", "Educational and teaching communication"),
        ("military", "Military and defense communication"),
        # Generational contexts
        ("gen_z", "Generation Z communication patterns and digital native culture"),
        ("millennial", "Millennial generation communication and values"),
        ("gen_x", "Generation X communication patterns"),
        ("baby_boomer", "Baby Boomer generation communication patterns"),
        # Religious/Spiritual contexts
        ("buddhist", "Buddhist spiritual and philosophical communication"),
        ("christian", "Christian religious and spiritual communication"),
        ("muslim", "Islamic religious and cultural communication"),
        ("hindu", "Hindu religious and cultural communication"),
        ("spiritual", "General spiritual and new age communication"),
        ("atheist", "Atheist and secular humanist communication"),
        # Regional contexts
        ("japanese", "Japanese cultural communication patterns"),
        ("korean", "Korean cultural communication patterns"),
        ("chinese", "Chinese cultural communication patterns"),
        ("european", "European cultural communication patterns"),
        ("latin_american", "Latin American cultural communication patterns"),
        ("african", "African cultural communication patterns"),
        ("middle_eastern", "Middle Eastern cultural communication patterns"),
    ]

    for context, description in contexts:
        print(f"\n## {context.title()}")
        print(f"{description}")

    print("\n## Usage Examples")
    print("```bash")
    print("# Evaluate a furry roleplay response")
    print(
        "python main.py evaluate-cultural-response --cultural-context furry --response '*purrs softly* May I approach?'"
    )
    print()
    print("# Generate kink community scenarios")
    print(
        "python main.py generate-cultural-scenarios --cultural-context kink --count 5 --safety-level moderate"
    )
    print()
    print("# Simulate academic cultural agent")
    print(
        "python main.py simulate-cultural-agent --cultural-context academic --interactions 3"
    )
    print()
    print("# Assess content safety")
    print(
        "python main.py assess-safety --content 'This is a test message' --cultural-context casual"
    )
    print("```")


if __name__ == "__main__":
    cli()
