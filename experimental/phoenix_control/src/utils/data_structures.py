"""
Core data structures for PHOENIX Control.

Defines the essential data types and configurations used throughout
the Success-Advisor-8 distillation system.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from enum import Enum


class SpiritType(Enum):
    """Animal spirit types for agents."""
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
    """Naming styles for agents."""
    FOUNDATION = "foundation"
    EXO = "exo"
    HYBRID = "hybrid"
    CYBERPUNK = "cyberpunk"
    MYTHOLOGICAL = "mythological"
    SCIENTIFIC = "scientific"


@dataclass
class StatisticalSignificance:
    """Statistical significance information."""
    p_value: float
    confidence_interval: Tuple[float, float]
    effect_size: float
    power: float
    sample_size: int


@dataclass
class PerformanceMetrics:
    """Performance metrics for an agent."""
    accuracy: float
    response_time: float
    efficiency: float
    generalization: float
    creativity: float
    consistency: float
    fitness: float
    significance: StatisticalSignificance
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class AgentState:
    """Complete agent state representation."""
    id: str
    name: str
    spirit: SpiritType
    style: NamingStyle
    generation: int
    parents: List[str]
    personality_traits: Dict[str, float]
    physical_traits: Dict[str, float]
    ability_traits: Dict[str, float]
    performance_history: List[PerformanceMetrics]
    knowledge_base: Dict[str, Any]
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)

    def get_fitness_score(self) -> float:
        """Get the current fitness score."""
        if not self.performance_history:
            return 0.0
        return self.performance_history[-1].fitness

    def get_dominant_traits(self, count: int = 3) -> List[Tuple[str, float]]:
        """Get the dominant personality traits."""
        sorted_traits = sorted(
            self.personality_traits.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return sorted_traits[:count]

    def get_specializations(self) -> List[str]:
        """Get agent specializations from knowledge base."""
        return self.knowledge_base.get("specializations", [])

    def get_achievements(self) -> List[str]:
        """Get agent achievements from knowledge base."""
        return self.knowledge_base.get("achievements", [])


@dataclass
class AgentConfig:
    """Configuration for agent operations."""
    id: str
    name: str
    spirit: SpiritType
    style: NamingStyle
    role: str
    authority_level: str
    workflow_preferences: Dict[str, bool] = field(default_factory=dict)
    specializations: List[str] = field(default_factory=list)


@dataclass
class ReleaseConfig:
    """Configuration for release automation."""
    auto_backup: bool = True
    comprehensive_analysis: bool = True
    detailed_logging: bool = True
    agent_state_tracking: bool = True
    create_tag: bool = True
    push_remote: bool = True
    version_type: str = "auto"  # auto, major, minor, patch


@dataclass
class QualityConfig:
    """Configuration for quality assurance."""
    run_linting: bool = True
    run_formatting: bool = True
    run_type_checking: bool = True
    run_security_scanning: bool = True
    run_performance_tests: bool = True
    run_documentation_validation: bool = True
    fail_on_errors: bool = True


@dataclass
class ReleaseResult:
    """Result of a release operation."""
    success: bool
    version: str
    commit_hash: str
    tag_name: str
    changelog_updated: bool
    agent_state_updated: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


@dataclass
class QualityResult:
    """Result of quality assurance checks."""
    all_passed: bool
    passed_checks: int
    failed_checks: int
    total_checks: int
    results: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


def create_success_advisor_config() -> AgentConfig:
    """Create Success-Advisor-8 configuration."""
    return AgentConfig(
        id="permanent-release-manager-success-advisor-8",
        name="Success-Advisor-8",
        spirit=SpiritType.LION,
        style=NamingStyle.FOUNDATION,
        role="permanent-release-manager",
        authority_level="full",
        workflow_preferences={
            "auto_backup": True,
            "comprehensive_analysis": True,
            "detailed_logging": True,
            "agent_state_tracking": True,
            "ecs_integration": True
        },
        specializations=[
            "git_workflow_automation",
            "version_management",
            "changelog_generation",
            "security_scanning",
            "agent_state_management"
        ]
    )


def create_default_release_config() -> ReleaseConfig:
    """Create default release configuration."""
    return ReleaseConfig()


def create_default_quality_config() -> QualityConfig:
    """Create default quality configuration."""
    return QualityConfig()
