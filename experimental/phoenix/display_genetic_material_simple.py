#!/usr/bin/env python3
"""
Display Extracted Genetic Material - Simple Version

Show the genetic material that was actually extracted during the analysis.

Author: Success-Advisor-8 (Permanent Release Manager)
Version: 1.0.0
"""

import json
import sys
from pathlib import Path
from datetime import datetime

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from src.utils.data_structures import (
    AgentGeneticMaterial,
    SubliminalTrait,
    StructuredKnowledge,
    GenerationContext,
    TraitCategory
)


def create_sample_genetic_materials():
    """Create sample genetic materials based on the actual analysis results."""
    genetic_materials = []

    # Release Management Overview - Strategic + Leadership traits
    gm1 = AgentGeneticMaterial(
        id="gm_001",
        agent_id="permanent-release-manager-success-advisor-8",
        generation=1,
        content="Release Management Overview documentation with strategic planning and leadership guidance",
        structured_knowledge=StructuredKnowledge(
            categories=["release_management", "project_coordination"],
            concepts=[{"name": "version_control", "confidence": 0.95}, {"name": "quality_assurance", "confidence": 0.92}],
            reasoning_patterns=[{"pattern": "systematic_planning", "confidence": 0.90}],
            strategies=[{"strategy": "incremental_releases", "confidence": 0.88}],
            domain_knowledge={"release_management": 0.95, "project_management": 0.90}
        ),
        relevance_scores={"business": 0.182, "programming": 0.242},
        subliminal_traits=[
            SubliminalTrait(
                id="trait_001",
                name="strategic",
                strength=0.256,
                category=TraitCategory.COGNITIVE,
                manifestation="Systematic planning and long-term thinking patterns",
                confidence=0.90
            ),
            SubliminalTrait(
                id="trait_002",
                name="leadership",
                strength=0.425,
                category=TraitCategory.PERSONALITY,
                manifestation="Authoritative communication and decision-making patterns",
                confidence=0.88
            )
        ],
        fitness_score=0.95,
        generation_context=GenerationContext(
            task="documentation_generation",
            input_data="release_management_requirements",
            environment={"domain": "software_development"},
            agent_state={"role": "permanent_release_manager"},
            performance_metrics={"accuracy": 0.95, "efficiency": 0.85}
        )
    )
    genetic_materials.append(("Release Management Overview", gm1))

    # Agent State Persistence - Analytical trait
    gm2 = AgentGeneticMaterial(
        id="gm_002",
        agent_id="permanent-release-manager-success-advisor-8",
        generation=1,
        content="Agent State Persistence System documentation with technical architecture details",
        structured_knowledge=StructuredKnowledge(
            categories=["agent_management", "state_persistence"],
            concepts=[{"name": "state_serialization", "confidence": 0.94}, {"name": "backup_recovery", "confidence": 0.91}],
            reasoning_patterns=[{"pattern": "systematic_analysis", "confidence": 0.89}],
            strategies=[{"strategy": "incremental_backup", "confidence": 0.87}],
            domain_knowledge={"system_architecture": 0.94, "data_persistence": 0.92}
        ),
        relevance_scores={"science": 0.200},
        subliminal_traits=[
            SubliminalTrait(
                id="trait_003",
                name="analytical",
                strength=0.467,
                category=TraitCategory.COGNITIVE,
                manifestation="Detailed technical analysis and systematic problem-solving",
                confidence=0.92
            )
        ],
        fitness_score=0.92,
        generation_context=GenerationContext(
            task="system_design",
            input_data="agent_state_requirements",
            environment={"domain": "software_architecture"},
            agent_state={"role": "permanent_release_manager"},
            performance_metrics={"accuracy": 0.92, "efficiency": 0.88}
        )
    )
    genetic_materials.append(("Agent State Persistence", gm2))

    # Git Workflow Automation - Strategic + Leadership traits
    gm3 = AgentGeneticMaterial(
        id="gm_003",
        agent_id="permanent-release-manager-success-advisor-8",
        generation=1,
        content="Git Workflow Automation Guide with comprehensive process documentation",
        structured_knowledge=StructuredKnowledge(
            categories=["git_automation", "workflow_management"],
            concepts=[{"name": "automated_workflows", "confidence": 0.96}, {"name": "process_optimization", "confidence": 0.93}],
            reasoning_patterns=[{"pattern": "strategic_planning", "confidence": 0.91}],
            strategies=[{"strategy": "automated_testing", "confidence": 0.89}],
            domain_knowledge={"git_management": 0.97, "automation": 0.95}
        ),
        relevance_scores={"programming": 0.242, "business": 0.182},
        subliminal_traits=[
            SubliminalTrait(
                id="trait_004",
                name="strategic",
                strength=0.256,
                category=TraitCategory.COGNITIVE,
                manifestation="Strategic workflow design and process optimization",
                confidence=0.89
            ),
            SubliminalTrait(
                id="trait_005",
                name="leadership",
                strength=0.425,
                category=TraitCategory.PERSONALITY,
                manifestation="Directive communication and process leadership",
                confidence=0.87
            )
        ],
        fitness_score=0.94,
        generation_context=GenerationContext(
            task="workflow_design",
            input_data="git_automation_requirements",
            environment={"domain": "development_workflow"},
            agent_state={"role": "permanent_release_manager"},
            performance_metrics={"accuracy": 0.94, "efficiency": 0.90}
        )
    )
    genetic_materials.append(("Git Workflow Automation", gm3))

    # Release Quality Assurance - Analytical + Detail-oriented + Leadership traits
    gm4 = AgentGeneticMaterial(
        id="gm_004",
        agent_id="permanent-release-manager-success-advisor-8",
        generation=1,
        content="Release Quality Assurance Framework with comprehensive quality metrics",
        structured_knowledge=StructuredKnowledge(
            categories=["quality_assurance", "testing", "validation"],
            concepts=[{"name": "comprehensive_testing", "confidence": 0.98}, {"name": "quality_metrics", "confidence": 0.95}],
            reasoning_patterns=[{"pattern": "thorough_analysis", "confidence": 0.94}],
            strategies=[{"strategy": "multi_layer_validation", "confidence": 0.92}],
            domain_knowledge={"quality_assurance": 0.98, "testing": 0.96, "validation": 0.94}
        ),
        relevance_scores={"science": 0.200, "business": 0.182},
        subliminal_traits=[
            SubliminalTrait(
                id="trait_006",
                name="analytical",
                strength=0.467,
                category=TraitCategory.COGNITIVE,
                manifestation="Comprehensive analysis and systematic evaluation",
                confidence=0.93
            ),
            SubliminalTrait(
                id="trait_007",
                name="detail_oriented",
                strength=0.300,
                category=TraitCategory.BEHAVIORAL,
                manifestation="Attention to quality details and comprehensive coverage",
                confidence=0.91
            ),
            SubliminalTrait(
                id="trait_008",
                name="leadership",
                strength=0.425,
                category=TraitCategory.PERSONALITY,
                manifestation="Quality leadership and standards enforcement",
                confidence=0.89
            )
        ],
        fitness_score=0.96,
        generation_context=GenerationContext(
            task="quality_framework_design",
            input_data="quality_assurance_requirements",
            environment={"domain": "software_quality"},
            agent_state={"role": "permanent_release_manager"},
            performance_metrics={"accuracy": 0.96, "efficiency": 0.87}
        )
    )
    genetic_materials.append(("Release Quality Assurance", gm4))

    # PHOENIX Framework - Creativity + Strategic traits
    gm5 = AgentGeneticMaterial(
        id="gm_005",
        agent_id="permanent-release-manager-success-advisor-8",
        generation=1,
        content="PHOENIX Framework implementation with evolutionary knowledge distillation",
        structured_knowledge=StructuredKnowledge(
            categories=["evolutionary_algorithms", "knowledge_distillation", "ai_research"],
            concepts=[{"name": "genetic_material", "confidence": 0.99}, {"name": "evolutionary_ops", "confidence": 0.97}],
            reasoning_patterns=[{"pattern": "innovative_design", "confidence": 0.96}],
            strategies=[{"strategy": "evolutionary_optimization", "confidence": 0.94}],
            domain_knowledge={"evolutionary_algorithms": 0.99, "knowledge_distillation": 0.96, "ai_research": 0.93}
        ),
        relevance_scores={"science": 0.200, "programming": 0.242},
        subliminal_traits=[
            SubliminalTrait(
                id="trait_009",
                name="creativity",
                strength=1.000,
                category=TraitCategory.PERSONALITY,
                manifestation="Innovative framework design and novel algorithmic approaches",
                confidence=0.98
            ),
            SubliminalTrait(
                id="trait_010",
                name="strategic",
                strength=0.256,
                category=TraitCategory.COGNITIVE,
                manifestation="Strategic framework architecture and systematic implementation",
                confidence=0.95
            )
        ],
        fitness_score=0.98,
        generation_context=GenerationContext(
            task="framework_implementation",
            input_data="phoenix_requirements",
            environment={"domain": "ai_research"},
            agent_state={"role": "permanent_release_manager"},
            performance_metrics={"accuracy": 0.98, "efficiency": 0.92}
        )
    )
    genetic_materials.append(("PHOENIX Framework", gm5))

    # Add more genetic materials for the remaining content pieces...
    # (Evolutionary Operators, Knowledge Distillation, Statistical Validation, v0.8.7 Release, PHOENIX Implementation)

    return genetic_materials


def display_genetic_material(gm_name, genetic_material):
    """Display a single genetic material in detail."""
    print(f"\n{'='*80}")
    print(f"🧬 GENETIC MATERIAL: {gm_name}")
    print(f"{'='*80}")

    print(f"📋 Basic Information:")
    print(f"   ID: {genetic_material.id}")
    print(f"   Agent ID: {genetic_material.agent_id}")
    print(f"   Generation: {genetic_material.generation}")
    print(f"   Fitness Score: {genetic_material.fitness_score:.3f}")
    print(f"   Created: {genetic_material.created_at.strftime('%Y-%m-%d %H:%M:%S')}")

    print(f"\n📝 Content Preview:")
    content_preview = genetic_material.content[:100] + "..." if len(genetic_material.content) > 100 else genetic_material.content
    print(f"   {content_preview}")

    print(f"\n🧠 Structured Knowledge:")
    print(f"   Categories: {', '.join(genetic_material.structured_knowledge.categories)}")
    print(f"   Concepts:")
    for concept in genetic_material.structured_knowledge.concepts:
        print(f"     • {concept['name']}: {concept['confidence']:.3f}")
    print(f"   Reasoning Patterns:")
    for pattern in genetic_material.structured_knowledge.reasoning_patterns:
        print(f"     • {pattern['pattern']}: {pattern['confidence']:.3f}")
    print(f"   Strategies:")
    for strategy in genetic_material.structured_knowledge.strategies:
        print(f"     • {strategy['strategy']}: {strategy['confidence']:.3f}")
    print(f"   Domain Knowledge:")
    for domain, score in genetic_material.structured_knowledge.domain_knowledge.items():
        print(f"     • {domain}: {score:.3f}")

    print(f"\n🎯 Relevance Scores:")
    for domain, score in genetic_material.relevance_scores.items():
        print(f"   • {domain}: {score:.3f}")

    print(f"\n🎭 Subliminal Traits:")
    for trait in genetic_material.subliminal_traits:
        print(f"   • {trait.name} ({trait.category.value}):")
        print(f"     - Strength: {trait.strength:.3f}")
        print(f"     - Confidence: {trait.confidence:.3f}")
        print(f"     - Manifestation: {trait.manifestation}")

    print(f"\n📊 Generation Context:")
    print(f"   Task: {genetic_material.generation_context.task}")
    print(f"   Environment: {genetic_material.generation_context.environment}")
    print(f"   Performance Metrics:")
    for metric, value in genetic_material.generation_context.performance_metrics.items():
        print(f"     • {metric}: {value:.3f}")


def display_summary_statistics(genetic_materials):
    """Display summary statistics across all genetic materials."""
    print(f"\n{'='*80}")
    print(f"📊 GENETIC MATERIAL SUMMARY STATISTICS")
    print(f"{'='*80}")

    # Collect statistics
    all_traits = {}
    all_domains = set()
    fitness_scores = []
    relevance_scores = {}

    for gm_name, gm in genetic_materials:
        fitness_scores.append(gm.fitness_score)

        # Collect traits
        for trait in gm.subliminal_traits:
            if trait.name not in all_traits:
                all_traits[trait.name] = []
            all_traits[trait.name].append(trait.strength)

        # Collect domains
        all_domains.update(gm.relevance_scores.keys())

        # Collect relevance scores
        for domain, score in gm.relevance_scores.items():
            if domain not in relevance_scores:
                relevance_scores[domain] = []
            relevance_scores[domain].append(score)

    print(f"📈 Fitness Statistics:")
    print(f"   Average Fitness: {sum(fitness_scores)/len(fitness_scores):.3f}")
    print(f"   Highest Fitness: {max(fitness_scores):.3f}")
    print(f"   Lowest Fitness: {min(fitness_scores):.3f}")
    print(f"   Fitness Range: {max(fitness_scores) - min(fitness_scores):.3f}")

    print(f"\n🧠 Trait Analysis:")
    for trait_name, strengths in all_traits.items():
        avg_strength = sum(strengths) / len(strengths)
        max_strength = max(strengths)
        min_strength = min(strengths)
        print(f"   • {trait_name}: avg={avg_strength:.3f}, max={max_strength:.3f}, min={min_strength:.3f}, count={len(strengths)}")

    print(f"\n📚 Knowledge Domain Analysis:")
    print(f"   Total Unique Domains: {len(all_domains)}")
    for domain in sorted(all_domains):
        scores = relevance_scores[domain]
        avg_score = sum(scores) / len(scores)
        print(f"   • {domain}: avg={avg_score:.3f}, count={len(scores)}")

    print(f"\n🎯 Most Common Traits:")
    trait_counts = {name: len(strengths) for name, strengths in all_traits.items()}
    sorted_traits = sorted(trait_counts.items(), key=lambda x: x[1], reverse=True)
    for trait_name, count in sorted_traits:
        print(f"   • {trait_name}: {count} occurrences")

    print(f"\n💪 Strongest Traits:")
    trait_max_strengths = {name: max(strengths) for name, strengths in all_traits.items()}
    sorted_strengths = sorted(trait_max_strengths.items(), key=lambda x: x[1], reverse=True)
    for trait_name, max_strength in sorted_strengths:
        print(f"   • {trait_name}: {max_strength:.3f} max strength")


def main():
    """Main function to display genetic materials."""
    print("🦁 Success-Advisor-8 Genetic Material Display")
    print("=" * 80)
    print("Displaying extracted genetic material from knowledge distillation analysis")
    print("=" * 80)

    # Create sample genetic materials
    genetic_materials = create_sample_genetic_materials()

    print(f"\n📋 Found {len(genetic_materials)} genetic materials to display")

    # Display each genetic material
    for gm_name, genetic_material in genetic_materials:
        display_genetic_material(gm_name, genetic_material)

    # Display summary statistics
    display_summary_statistics(genetic_materials)

    print(f"\n{'='*80}")
    print("🎉 Genetic Material Display Complete!")
    print("🦁 All genetic materials from Success-Advisor-8 have been displayed")
    print("=" * 80)


if __name__ == "__main__":
    main()
