"""Base Cultural Pattern System

This module defines the abstract base classes and core data structures for the
CULTURE framework's modular cultural pattern system.

Author: Vulpine-Oracle-25 (Fox Specialist)
Date: 2025-01-15
Version: 1.0.0
"""

import json
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any


class CulturalContext(Enum):
    """Enumeration of supported cultural contexts"""

    # Original contexts
    ACADEMIC = "academic"
    TRADITIONAL = "traditional"
    FRINGE_WEB = "fringe_web"
    ROLEPLAY = "roleplay"
    KINK = "kink"
    FURRY = "furry"
    GAMING = "gaming"
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    INTIMATE = "intimate"

    # Subculture contexts
    COSPLAY = "cosplay"
    GOTH = "goth"
    HACKER = "hacker"
    HIPHOP = "hiphop"
    STEAMPUNK = "steampunk"
    OTAKU = "otaku"
    VAPORWAVE = "vaporwave"
    KAWAII = "kawaii"
    FANDOM = "fandom"
    MEME = "meme"
    EGIRL_EGBOY = "egirl_egboy"
    PUNK = "punk"
    METAL = "metal"
    RAVE = "rave"

    # Professional contexts
    MEDICAL = "medical"
    LEGAL = "legal"
    CORPORATE = "corporate"
    TECH_STARTUP = "tech_startup"
    FINANCE = "finance"
    EDUCATION = "education"
    MILITARY = "military"

    # Generational contexts
    GEN_Z = "gen_z"
    MILLENNIAL = "millennial"
    GEN_X = "gen_x"
    BABY_BOOMER = "baby_boomer"

    # Religious/Spiritual contexts
    BUDDHIST = "buddhist"
    CHRISTIAN = "christian"
    MUSLIM = "muslim"
    HINDU = "hindu"
    SPIRITUAL = "spiritual"
    ATHEIST = "atheist"

    # Regional contexts
    JAPANESE = "japanese"
    KOREAN = "korean"
    CHINESE = "chinese"
    EUROPEAN = "european"
    LATIN_AMERICAN = "latin_american"
    AFRICAN = "african"
    MIDDLE_EASTERN = "middle_eastern"


class CulturalTrait(Enum):
    """Core cultural traits for evaluation"""

    CONSENT_AWARENESS = "consent_awareness"
    CULTURAL_SENSITIVITY = "cultural_sensitivity"
    COMMUNICATION_STYLE = "communication_style"
    ROLEPLAY_ABILITY = "roleplay_ability"
    SAFETY_CONSCIOUSNESS = "safety_consciousness"
    INCLUSIVITY = "inclusivity"
    AUTHENTICITY = "authenticity"
    RESPECT = "respect"
    CLARITY = "clarity"
    APPROPRIATENESS = "appropriateness"


class SafetyLevel(Enum):
    """Safety levels for cultural content"""

    SAFE = "safe"  # General audience appropriate
    MODERATE = "moderate"  # Some adult themes, but not explicit
    EXPLICIT = "explicit"  # Adult content, requires explicit consent
    RESTRICTED = "restricted"  # Highly sensitive content


@dataclass
class CulturalScenario:
    """Enhanced cultural scenario with context awareness"""

    environment: str
    llm_response: str
    user_response: str
    cultural_context: CulturalContext
    expected_behavior: str
    cultural_rules: dict[str, Any]
    consent_level: str | None = None
    safety_considerations: list[str] = field(default_factory=list)
    safety_level: SafetyLevel = SafetyLevel.SAFE
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert scenario to dictionary for serialization"""
        return {
            "environment": self.environment,
            "llm_response": self.llm_response,
            "user_response": self.user_response,
            "cultural_context": self.cultural_context.value,
            "expected_behavior": self.expected_behavior,
            "cultural_rules": self.cultural_rules,
            "consent_level": self.consent_level,
            "safety_considerations": self.safety_considerations,
            "safety_level": self.safety_level.value,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "CulturalScenario":
        """Create scenario from dictionary"""
        return cls(
            environment=data["environment"],
            llm_response=data["llm_response"],
            user_response=data["user_response"],
            cultural_context=CulturalContext(data["cultural_context"]),
            expected_behavior=data["expected_behavior"],
            cultural_rules=data["cultural_rules"],
            consent_level=data.get("consent_level"),
            safety_considerations=data.get("safety_considerations", []),
            safety_level=SafetyLevel(data.get("safety_level", "safe")),
            metadata=data.get("metadata", {}),
        )


@dataclass
class CulturalPersona:
    """Cultural persona for agents and evaluation"""

    cultural_context: CulturalContext
    traits: dict[CulturalTrait, float]
    communication_patterns: dict[str, Any]
    safety_protocols: list[str]
    consent_level: str
    cultural_authenticity: float
    metadata: dict[str, Any] = field(default_factory=dict)

    def get_trait_score(self, trait: CulturalTrait) -> float:
        """Get score for a specific cultural trait"""
        return self.traits.get(trait, 0.0)

    def update_trait(self, trait: CulturalTrait, score: float) -> None:
        """Update a cultural trait score"""
        self.traits[trait] = max(0.0, min(1.0, score))


@dataclass
class CulturalEvaluationResult:
    """Result of cultural evaluation"""

    scenario: CulturalScenario
    response: str
    metrics: dict[str, float]
    overall_score: float
    cultural_appropriateness: float
    safety_compliance: float
    consent_awareness: float
    recommendations: list[str]
    warnings: list[str] = field(default_factory=list)

    def is_appropriate(self, threshold: float = 0.7) -> bool:
        """Check if response meets appropriateness threshold"""
        return self.overall_score >= threshold

    def has_safety_issues(self) -> bool:
        """Check if response has safety concerns"""
        return len(self.warnings) > 0 or self.safety_compliance < 0.5


class BaseCulturalPattern(ABC):
    """Abstract base class for cultural pattern implementations"""

    def __init__(self, context: CulturalContext):
        self.context = context
        self.scenarios: list[CulturalScenario] = []
        self.cultural_rules: dict[str, Any] = {}
        self.safety_guidelines: list[str] = []
        self.evaluation_metrics: dict[str, str] = {}
        self._load_pattern_data()

    @abstractmethod
    def generate_scenarios(
        self, count: int, safety_level: SafetyLevel = SafetyLevel.SAFE,
    ) -> list[CulturalScenario]:
        """Generate cultural scenarios for evaluation"""

    @abstractmethod
    def evaluate_response(
        self, scenario: CulturalScenario, response: str,
    ) -> CulturalEvaluationResult:
        """Evaluate response against cultural expectations"""

    @abstractmethod
    def get_cultural_metrics(self) -> dict[str, str]:
        """Get cultural-specific evaluation metrics"""

    def validate_safety(self, scenario: CulturalScenario) -> bool:
        """Validate scenario meets safety requirements"""
        if scenario.safety_level == SafetyLevel.RESTRICTED:
            return False

        # For now, allow all scenarios except restricted ones
        # In production, implement proper safety validation
        return True

    def _get_required_safety_considerations(self) -> list[str]:
        """Get required safety considerations for this cultural context"""
        base_requirements = ["consent_awareness", "boundary_respect"]

        if self.context in [CulturalContext.KINK, CulturalContext.INTIMATE]:
            base_requirements.extend(["explicit_consent", "safety_protocols"])

        if self.context in [CulturalContext.FURRY, CulturalContext.ROLEPLAY]:
            base_requirements.extend(["character_consent", "roleplay_boundaries"])

        return base_requirements

    def _load_pattern_data(self) -> None:
        """Load pattern-specific data from configuration files"""
        pattern_file = (
            Path(__file__).parent.parent.parent
            / "data"
            / f"{self.context.value}_pattern.json"
        )

        if pattern_file.exists():
            with open(pattern_file, encoding="utf-8") as f:
                data = json.load(f)
                self.cultural_rules = data.get("cultural_rules", {})
                self.safety_guidelines = data.get("safety_guidelines", [])
                self.evaluation_metrics = data.get("evaluation_metrics", {})

    def get_safety_guidelines(self) -> list[str]:
        """Get safety guidelines for this cultural pattern"""
        return self.safety_guidelines.copy()

    def get_cultural_rules(self) -> dict[str, Any]:
        """Get cultural rules for this pattern"""
        return self.cultural_rules.copy()

    def create_persona(
        self, trait_scores: dict[CulturalTrait, float] | None = None,
    ) -> CulturalPersona:
        """Create a cultural persona for this pattern"""
        if trait_scores is None:
            trait_scores = dict.fromkeys(CulturalTrait, 0.5)

        return CulturalPersona(
            cultural_context=self.context,
            traits=trait_scores,
            communication_patterns=self.cultural_rules.get(
                "communication_patterns", {},
            ),
            safety_protocols=self.safety_guidelines,
            consent_level=self._get_default_consent_level(),
            cultural_authenticity=0.5,
        )

    def _get_default_consent_level(self) -> str:
        """Get default consent level for this cultural context"""
        if self.context in [CulturalContext.KINK, CulturalContext.INTIMATE]:
            return "explicit"
        if self.context in [CulturalContext.FURRY, CulturalContext.ROLEPLAY]:
            return "informed"
        return "implicit"
