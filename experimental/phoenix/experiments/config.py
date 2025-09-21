"""
Experiment Configuration

Configuration management for agent reconstruction experiments.

Author: Recognition-Grandmaster-27 (Tiger Specialist)
Version: 1.0.0
"""

from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from enum import Enum


class ExperimentType(Enum):
    """Types of reconstruction experiments."""

    BASELINE = "baseline"
    PHOENIX_EVOLUTIONARY = "phoenix_evolutionary"
    PHOENIX_DIRECT = "phoenix_direct"
    COMPARATIVE = "comparative"


class EvaluationMetric(Enum):
    """Evaluation metrics for reconstruction success."""

    TRAIT_ACCURACY = "trait_accuracy"
    PERFORMANCE_MATCH = "performance_match"
    BEHAVIORAL_SIMILARITY = "behavioral_similarity"
    KNOWLEDGE_FIDELITY = "knowledge_fidelity"
    RESPONSE_CONSISTENCY = "response_consistency"


@dataclass
class ExperimentConfig:
    """Configuration for agent reconstruction experiments."""

    # Experiment parameters
    experiment_type: ExperimentType
    target_agent_id: str = (
        "permanent-release-manager-success-advisor-8"  # Updated for PostgreSQL
    )
    population_size: int = 50
    max_generations: int = 20
    num_trials: int = 10

    # PHOENIX parameters
    mutation_rate: float = 0.1
    selection_pressure: float = 0.8
    crossover_rate: float = 0.7
    elite_size: int = 5

    # Data source configuration
    use_postgresql: bool = True  # Use PostgreSQL instead of JSON files
    postgres_connection_url: str = (
        "postgresql://postgres:password@localhost:5432/reynard_ecs"
    )

    # Evaluation parameters
    evaluation_metrics: List[EvaluationMetric] = None
    significance_threshold: float = 0.05
    confidence_level: float = 0.95
    min_sample_size: int = 30

    # Data parameters
    training_data_size: int = 1000
    test_data_size: int = 200
    validation_split: float = 0.2

    # Output parameters
    results_dir: str = "results"
    log_level: str = "INFO"
    save_intermediate: bool = True

    def __post_init__(self) -> None:
        """Initialize default values."""
        if self.evaluation_metrics is None:
            self.evaluation_metrics = [
                EvaluationMetric.TRAIT_ACCURACY,
                EvaluationMetric.PERFORMANCE_MATCH,
                EvaluationMetric.BEHAVIORAL_SIMILARITY,
            ]


@dataclass
class AgentReconstructionTarget:
    """Target agent specification for reconstruction."""

    agent_id: str
    name: str
    spirit: str
    style: str

    # Trait specifications
    personality_traits: Dict[str, float]
    physical_traits: Dict[str, float]
    ability_traits: Dict[str, float]

    # Performance specifications
    expected_accuracy: float
    expected_response_time: float
    expected_consistency: float

    # Knowledge specifications
    domain_expertise: List[str]
    specializations: List[str]
    achievements: List[str]


def create_success_advisor_target() -> AgentReconstructionTarget:
    """Create Success-Advisor-8 reconstruction target."""
    return AgentReconstructionTarget(
        agent_id="success-advisor-8",
        name="Success-Advisor-8",
        spirit="lion",
        style="foundation",
        personality_traits={
            "determination": 0.95,
            "protectiveness": 0.88,
            "charisma": 0.92,
            "leadership": 0.90,
            "confidence": 0.94,
            "strategic_thinking": 0.89,
            "reliability": 0.93,
            "excellence": 0.91,
        },
        physical_traits={
            "size": 0.85,
            "strength": 0.90,
            "agility": 0.75,
            "endurance": 0.88,
            "appearance": 0.87,
            "grace": 0.82,
        },
        ability_traits={
            "strategist": 0.95,
            "leader": 0.92,
            "protector": 0.90,
            "coordinator": 0.88,
            "analyzer": 0.85,
            "communicator": 0.87,
        },
        expected_accuracy=0.95,
        expected_response_time=1.2,
        expected_consistency=0.94,
        domain_expertise=[
            "release_management",
            "quality_assurance",
            "automation",
            "phoenix_framework",
            "reynard_ecosystem",
        ],
        specializations=[
            "Release Management",
            "Quality Assurance",
            "Automation",
            "Agent Development",
        ],
        achievements=[
            "Successfully released v0.8.7",
            "Implemented PHOENIX framework",
            "Created comprehensive documentation",
            "Established agent state persistence",
        ],
    )
