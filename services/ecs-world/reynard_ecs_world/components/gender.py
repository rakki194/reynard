"""
Gender identity and expression components for the ECS world.

This module provides comprehensive gender identity management including:
- Gender identity profiles with multiple dimensions
- Gender expression preferences
- Pronoun management
- Inclusive identity support
- Gender-based social dynamics
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Set


class GenderIdentity(Enum):
    """Core gender identity categories."""
    MALE = "male"
    FEMALE = "female"
    NON_BINARY = "non_binary"
    GENDERFLUID = "genderfluid"
    AGENDER = "agender"
    DEMIGENDER = "demigender"
    BIGENDER = "bigender"
    TRIGENDER = "trigender"
    PANGENDER = "pangender"
    TWO_SPIRIT = "two_spirit"
    GENDERQUEER = "genderqueer"
    NEUTROIS = "neutrois"
    ANDROGYNE = "androgynous"
    QUESTIONING = "questioning"
    OTHER = "other"


class GenderExpression(Enum):
    """Gender expression styles."""
    MASCULINE = "masculine"
    FEMININE = "feminine"
    ANDROGYNOUS = "androgynous"
    NEUTRAL = "neutral"
    FLUID = "fluid"
    MIXED = "mixed"
    EXPRESSIVE = "expressive"
    MINIMAL = "minimal"


class PronounType(Enum):
    """Types of pronouns."""
    SUBJECT = "subject"  # he, she, they, etc.
    OBJECT = "object"    # him, her, them, etc.
    POSSESSIVE = "possessive"  # his, hers, theirs, etc.
    REFLEXIVE = "reflexive"    # himself, herself, themselves, etc.


@dataclass
class PronounSet:
    """A set of pronouns for an agent."""
    subject: str  # he, she, they, etc.
    object: str   # him, her, them, etc.
    possessive: str  # his, hers, theirs, etc.
    reflexive: str   # himself, herself, themselves, etc.
    
    def __post_init__(self):
        """Validate pronoun consistency."""
        if not all([self.subject, self.object, self.possessive, self.reflexive]):
            raise ValueError("All pronoun forms must be provided")


@dataclass
class GenderProfile:
    """Comprehensive gender identity profile for an agent."""
    primary_identity: GenderIdentity
    secondary_identities: List[GenderIdentity] = field(default_factory=list)
    expression_style: GenderExpression = GenderExpression.NEUTRAL
    pronoun_sets: List[PronounSet] = field(default_factory=list)
    preferred_pronouns: Optional[PronounSet] = None
    custom_pronouns: Optional[str] = None
    gender_description: Optional[str] = None
    is_questioning: bool = False
    is_fluid: bool = False
    fluidity_rate: float = 0.0  # How often gender identity changes (0.0 to 1.0)
    confidence_level: float = 1.0  # Confidence in gender identity (0.0 to 1.0)
    coming_out_status: Dict[str, bool] = field(default_factory=dict)  # Who knows about identity
    support_network: Set[str] = field(default_factory=set)  # Supportive agents
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        """Initialize default values."""
        if not self.pronoun_sets:
            # Set default pronouns based on primary identity
            self.pronoun_sets = self._get_default_pronouns()
        
        if not self.preferred_pronouns and self.pronoun_sets:
            self.preferred_pronouns = self.pronoun_sets[0]
    
    def _get_default_pronouns(self) -> List[PronounSet]:
        """Get default pronouns based on primary identity."""
        defaults = {
            GenderIdentity.MALE: PronounSet("he", "him", "his", "himself"),
            GenderIdentity.FEMALE: PronounSet("she", "her", "hers", "herself"),
            GenderIdentity.NON_BINARY: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.AGENDER: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.GENDERFLUID: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.DEMIGENDER: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.BIGENDER: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.TRIGENDER: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.PANGENDER: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.TWO_SPIRIT: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.GENDERQUEER: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.NEUTROIS: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.ANDROGYNE: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.QUESTIONING: PronounSet("they", "them", "theirs", "themselves"),
            GenderIdentity.OTHER: PronounSet("they", "them", "theirs", "themselves"),
        }
        return [defaults.get(self.primary_identity, defaults[GenderIdentity.OTHER])]
    
    def add_pronoun_set(self, pronoun_set: PronounSet) -> None:
        """Add a new pronoun set."""
        if pronoun_set not in self.pronoun_sets:
            self.pronoun_sets.append(pronoun_set)
            self.last_updated = datetime.now()
    
    def set_preferred_pronouns(self, pronoun_set: PronounSet) -> None:
        """Set preferred pronouns."""
        if pronoun_set in self.pronoun_sets:
            self.preferred_pronouns = pronoun_set
            self.last_updated = datetime.now()
    
    def update_identity(self, new_identity: GenderIdentity) -> None:
        """Update primary gender identity."""
        if new_identity != self.primary_identity:
            self.primary_identity = new_identity
            self.last_updated = datetime.now()
            
            # Update default pronouns if needed
            if not self.pronoun_sets:
                self.pronoun_sets = self._get_default_pronouns()
                if self.pronoun_sets:
                    self.preferred_pronouns = self.pronoun_sets[0]
    
    def add_support_agent(self, agent_id: str) -> None:
        """Add an agent to the support network."""
        self.support_network.add(agent_id)
        self.last_updated = datetime.now()
    
    def remove_support_agent(self, agent_id: str) -> None:
        """Remove an agent from the support network."""
        self.support_network.discard(agent_id)
        self.last_updated = datetime.now()
    
    def update_coming_out_status(self, agent_id: str, knows: bool) -> None:
        """Update who knows about the agent's gender identity."""
        self.coming_out_status[agent_id] = knows
        self.last_updated = datetime.now()
    
    def get_pronoun_string(self, pronoun_type: PronounType) -> str:
        """Get the appropriate pronoun string."""
        if self.preferred_pronouns:
            if pronoun_type == PronounType.SUBJECT:
                return self.preferred_pronouns.subject
            elif pronoun_type == PronounType.OBJECT:
                return self.preferred_pronouns.object
            elif pronoun_type == PronounType.POSSESSIVE:
                return self.preferred_pronouns.possessive
            elif pronoun_type == PronounType.REFLEXIVE:
                return self.preferred_pronouns.reflexive
        
        return "they"  # Default fallback
    
    def is_identity_fluid(self) -> bool:
        """Check if the agent's gender identity is fluid."""
        return self.is_fluid or self.fluidity_rate > 0.0
    
    def get_identity_stability(self) -> float:
        """Get how stable the gender identity is (0.0 = very fluid, 1.0 = very stable)."""
        return 1.0 - self.fluidity_rate


@dataclass
class GenderComponent:
    """Component for managing agent gender identity and expression."""
    profile: GenderProfile
    gender_energy: float = 1.0  # Energy for gender expression (0.0 to 1.0)
    expression_confidence: float = 1.0  # Confidence in gender expression (0.0 to 1.0)
    dysphoria_level: float = 0.0  # Gender dysphoria level (0.0 to 1.0)
    euphoria_level: float = 0.0  # Gender euphoria level (0.0 to 1.0)
    social_comfort: float = 1.0  # Comfort with gender expression in social settings (0.0 to 1.0)
    transition_stage: Optional[str] = None  # Current transition stage if applicable
    transition_goals: List[str] = field(default_factory=list)  # Transition goals
    support_needs: List[str] = field(default_factory=list)  # Support needs
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    _agent_id: Optional[str] = None
    
    def __post_init__(self):
        """Initialize component."""
        self.last_updated = datetime.now()
    
    def set_agent_id(self, agent_id: str) -> None:
        """Set the agent ID for this component."""
        self._agent_id = agent_id
    
    def get_agent_id(self) -> Optional[str]:
        """Get the agent ID."""
        return self._agent_id
    
    def update_gender_energy(self, delta: float) -> None:
        """Update gender expression energy."""
        self.gender_energy = max(0.0, min(1.0, self.gender_energy + delta))
        self.last_updated = datetime.now()
    
    def update_expression_confidence(self, delta: float) -> None:
        """Update confidence in gender expression."""
        self.expression_confidence = max(0.0, min(1.0, self.expression_confidence + delta))
        self.last_updated = datetime.now()
    
    def update_dysphoria(self, delta: float) -> None:
        """Update gender dysphoria level."""
        self.dysphoria_level = max(0.0, min(1.0, self.dysphoria_level + delta))
        self.last_updated = datetime.now()
    
    def update_euphoria(self, delta: float) -> None:
        """Update gender euphoria level."""
        self.euphoria_level = max(0.0, min(1.0, self.euphoria_level + delta))
        self.last_updated = datetime.now()
    
    def update_social_comfort(self, delta: float) -> None:
        """Update social comfort with gender expression."""
        self.social_comfort = max(0.0, min(1.0, self.social_comfort + delta))
        self.last_updated = datetime.now()
    
    def add_transition_goal(self, goal: str) -> None:
        """Add a transition goal."""
        if goal not in self.transition_goals:
            self.transition_goals.append(goal)
            self.last_updated = datetime.now()
    
    def remove_transition_goal(self, goal: str) -> None:
        """Remove a transition goal."""
        if goal in self.transition_goals:
            self.transition_goals.remove(goal)
            self.last_updated = datetime.now()
    
    def add_support_need(self, need: str) -> None:
        """Add a support need."""
        if need not in self.support_needs:
            self.support_needs.append(need)
            self.last_updated = datetime.now()
    
    def remove_support_need(self, need: str) -> None:
        """Remove a support need."""
        if need in self.support_needs:
            self.support_needs.remove(need)
            self.last_updated = datetime.now()
    
    def get_gender_wellbeing(self) -> float:
        """Calculate overall gender wellbeing (0.0 to 1.0)."""
        # Positive factors
        positive = (self.gender_energy + self.expression_confidence + 
                   self.social_comfort + self.euphoria_level) / 4.0
        
        # Negative factors
        negative = self.dysphoria_level
        
        # Calculate wellbeing (positive factors minus negative factors)
        wellbeing = positive - negative
        return max(0.0, min(1.0, wellbeing))
    
    def get_expression_readiness(self) -> float:
        """Get how ready the agent is to express their gender (0.0 to 1.0)."""
        return (self.gender_energy + self.expression_confidence + 
                self.social_comfort) / 3.0
    
    def needs_support(self) -> bool:
        """Check if the agent needs additional support."""
        return (self.dysphoria_level > 0.5 or 
                self.expression_confidence < 0.3 or 
                self.social_comfort < 0.3 or
                len(self.support_needs) > 0)
    
    def is_transitioning(self) -> bool:
        """Check if the agent is currently transitioning."""
        return (self.transition_stage is not None or 
                len(self.transition_goals) > 0)
    
    def get_pronoun_string(self, pronoun_type: PronounType) -> str:
        """Get the appropriate pronoun string."""
        return self.profile.get_pronoun_string(pronoun_type)
    
    def process_gender_fluidity(self, delta_time: float) -> None:  # noqa: ARG002
        """Process gender fluidity changes over time."""
        if self.profile.is_identity_fluid():
            # Simulate potential identity changes based on fluidity rate
            # This is a simplified model - in reality, gender fluidity is complex
            pass  # Placeholder for future fluidity processing
