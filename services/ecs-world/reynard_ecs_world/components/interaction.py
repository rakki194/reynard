"""
Interaction Component

Agent interaction and communication capabilities with social energy management,
relationship tracking, and interaction history.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Set

from ..core.component import Component


class InteractionType(Enum):
    """Types of interactions between agents."""
    COMMUNICATION = "communication"
    COLLABORATION = "collaboration"
    TEACHING = "teaching"
    SOCIAL = "social"
    COMPETITIVE = "competitive"
    ROMANTIC = "romantic"


class InteractionOutcome(Enum):
    """Possible outcomes of interactions."""
    SUCCESS = "success"
    PARTIAL_SUCCESS = "partial_success"
    FAILURE = "failure"
    NEUTRAL = "neutral"


class CommunicationStyle(Enum):
    """Communication styles for agents."""
    FORMAL = "formal"
    CASUAL = "casual"
    PLAYFUL = "playful"
    SERIOUS = "serious"
    MYSTERIOUS = "mysterious"


@dataclass
class Interaction:
    """Record of an interaction between agents."""
    id: str
    participants: List[str]
    interaction_type: InteractionType
    content: str
    outcome: InteractionOutcome
    relationship_impact: float  # -1.0 to 1.0
    timestamp: datetime = field(default_factory=datetime.now)
    duration: float = 0.0  # Duration in seconds
    energy_cost: float = 0.1  # Social energy consumed
    success_factors: Dict[str, float] = field(default_factory=dict)  # Factors that influenced success

    def __post_init__(self) -> None:
        """Validate interaction data after initialization."""
        self.relationship_impact = max(-1.0, min(1.0, self.relationship_impact))
        self.energy_cost = max(0.0, min(1.0, self.energy_cost))
        self.duration = max(0.0, self.duration)


@dataclass
class Relationship:
    """Relationship between two agents."""
    agent_id: str
    relationship_type: str  # friend, rival, mentor, student, romantic, neutral, enemy
    strength: float  # 0.0 to 1.0
    trust_level: float  # 0.0 to 1.0
    familiarity: float  # 0.0 to 1.0
    last_interaction: datetime = field(default_factory=datetime.now)
    interaction_count: int = 0
    positive_interactions: int = 0
    negative_interactions: int = 0
    total_time_together: float = 0.0  # Total time spent interacting

    def __post_init__(self) -> None:
        """Validate relationship data after initialization."""
        self.strength = max(0.0, min(1.0, self.strength))
        self.trust_level = max(0.0, min(1.0, self.trust_level))
        self.familiarity = max(0.0, min(1.0, self.familiarity))

    def update_from_interaction(self, interaction: Interaction) -> None:
        """Update relationship based on interaction outcome."""
        self.last_interaction = interaction.timestamp
        self.interaction_count += 1
        self.total_time_together += interaction.duration

        # Update positive/negative interaction counts
        if interaction.outcome in [InteractionOutcome.SUCCESS, InteractionOutcome.PARTIAL_SUCCESS]:
            self.positive_interactions += 1
        elif interaction.outcome == InteractionOutcome.FAILURE:
            self.negative_interactions += 1

        # Update relationship metrics based on interaction impact
        self.strength = max(0.0, min(1.0, self.strength + interaction.relationship_impact * 0.1))
        self.trust_level = max(0.0, min(1.0, self.trust_level + interaction.relationship_impact * 0.05))
        self.familiarity = max(0.0, min(1.0, self.familiarity + 0.01))  # Always increase familiarity

    def get_relationship_quality(self) -> float:
        """Calculate overall relationship quality."""
        return (self.strength + self.trust_level + self.familiarity) / 3.0

    def is_positive_relationship(self) -> bool:
        """Check if this is a positive relationship."""
        return self.strength > 0.5 and self.trust_level > 0.3

    def is_negative_relationship(self) -> bool:
        """Check if this is a negative relationship."""
        return self.strength < 0.3 or self.trust_level < 0.2


class InteractionComponent(Component):
    """
    Agent interaction and communication capabilities.
    
    Manages social energy, interaction history, relationships,
    and communication preferences for agents.
    """

    def __init__(self, max_social_energy: float = 1.0):
        """
        Initialize the interaction component.
        
        Args:
            max_social_energy: Maximum social energy capacity
        """
        super().__init__()
        self.interaction_history: List[Interaction] = []
        self.communication_style: CommunicationStyle = CommunicationStyle.CASUAL
        self.social_energy: float = max_social_energy
        self.max_social_energy: float = max_social_energy
        self.energy_recovery_rate: float = 0.1  # Energy recovered per second
        self.relationship_map: Dict[str, Relationship] = {}
        self.active_interactions: Set[str] = set()
        self.interaction_cooldown: float = 5.0  # Minimum time between interactions
        self.last_interaction_time: datetime = datetime.now()
        self.total_interactions: int = 0
        self.successful_interactions: int = 0
        self.failed_interactions: int = 0

    def can_interact(self) -> bool:
        """Check if agent has enough energy and is not on cooldown."""
        time_since_last = (datetime.now() - self.last_interaction_time).total_seconds()
        return (self.social_energy >= 0.2 and 
                time_since_last >= self.interaction_cooldown and
                len(self.active_interactions) < 3)  # Max 3 concurrent interactions

    def start_interaction(self, interaction_id: str) -> bool:
        """
        Start a new interaction.
        
        Args:
            interaction_id: ID of the interaction to start
            
        Returns:
            True if interaction was started successfully
        """
        if not self.can_interact():
            return False

        self.active_interactions.add(interaction_id)
        self.last_interaction_time = datetime.now()
        return True

    def end_interaction(self, interaction: Interaction) -> None:
        """
        End an interaction and update relationship.
        
        Args:
            interaction: The completed interaction
        """
        # Remove from active interactions
        self.active_interactions.discard(interaction.id)
        
        # Add to history
        self.interaction_history.append(interaction)
        self.total_interactions += 1

        # Update success/failure counts
        if interaction.outcome in [InteractionOutcome.SUCCESS, InteractionOutcome.PARTIAL_SUCCESS]:
            self.successful_interactions += 1
        elif interaction.outcome == InteractionOutcome.FAILURE:
            self.failed_interactions += 1

        # Consume social energy
        self.social_energy = max(0.0, self.social_energy - interaction.energy_cost)

        # Update relationships with all participants
        for participant_id in interaction.participants:
            if participant_id != self.get_agent_id():  # Don't update relationship with self
                self._update_relationship(participant_id, interaction)

    def _update_relationship(self, other_agent_id: str, interaction: Interaction) -> None:
        """Update relationship with another agent based on interaction."""
        if other_agent_id not in self.relationship_map:
            # Create new relationship
            self.relationship_map[other_agent_id] = Relationship(
                agent_id=other_agent_id,
                relationship_type="neutral",
                strength=0.5,
                trust_level=0.3,
                familiarity=0.1
            )

        relationship = self.relationship_map[other_agent_id]
        relationship.update_from_interaction(interaction)

        # Update relationship type based on strength and interactions
        self._update_relationship_type(relationship)

    def _update_relationship_type(self, relationship: Relationship) -> None:
        """Update relationship type based on current metrics."""
        if relationship.positive_interactions > relationship.negative_interactions * 2:
            if relationship.strength > 0.8 and relationship.trust_level > 0.7:
                relationship.relationship_type = "friend"
            elif relationship.strength > 0.6:
                relationship.relationship_type = "acquaintance"
        elif relationship.negative_interactions > relationship.positive_interactions * 2:
            if relationship.strength < 0.2:
                relationship.relationship_type = "enemy"
            elif relationship.strength < 0.4:
                relationship.relationship_type = "rival"
        else:
            relationship.relationship_type = "neutral"

    def recover_energy(self, delta_time: float) -> None:
        """
        Recover social energy over time.
        
        Args:
            delta_time: Time elapsed since last recovery
        """
        if self.social_energy < self.max_social_energy:
            recovery_amount = self.energy_recovery_rate * delta_time
            self.social_energy = min(self.max_social_energy, 
                                   self.social_energy + recovery_amount)

    def get_relationship(self, agent_id: str) -> Relationship | None:
        """Get relationship with a specific agent."""
        return self.relationship_map.get(agent_id)

    def get_relationships_by_type(self, relationship_type: str) -> List[Relationship]:
        """Get all relationships of a specific type."""
        return [rel for rel in self.relationship_map.values() 
                if rel.relationship_type == relationship_type]

    def get_positive_relationships(self) -> List[Relationship]:
        """Get all positive relationships."""
        return [rel for rel in self.relationship_map.values() 
                if rel.is_positive_relationship()]

    def get_negative_relationships(self) -> List[Relationship]:
        """Get all negative relationships."""
        return [rel for rel in self.relationship_map.values() 
                if rel.is_negative_relationship()]

    def get_interaction_stats(self) -> Dict[str, Any]:
        """Get comprehensive interaction statistics."""
        if self.total_interactions == 0:
            return {
                "total_interactions": 0,
                "success_rate": 0.0,
                "social_energy": self.social_energy,
                "max_social_energy": self.max_social_energy,
                "active_interactions": len(self.active_interactions),
                "total_relationships": len(self.relationship_map),
                "positive_relationships": 0,
                "negative_relationships": 0
            }

        success_rate = self.successful_interactions / self.total_interactions
        positive_rels = len(self.get_positive_relationships())
        negative_rels = len(self.get_negative_relationships())

        return {
            "total_interactions": self.total_interactions,
            "successful_interactions": self.successful_interactions,
            "failed_interactions": self.failed_interactions,
            "success_rate": success_rate,
            "social_energy": self.social_energy,
            "max_social_energy": self.max_social_energy,
            "energy_percentage": self.social_energy / self.max_social_energy,
            "active_interactions": len(self.active_interactions),
            "total_relationships": len(self.relationship_map),
            "positive_relationships": positive_rels,
            "negative_relationships": negative_rels,
            "communication_style": self.communication_style.value
        }

    def get_agent_id(self) -> str:
        """Get the agent ID for this component."""
        # This would be set by the entity that owns this component
        # For now, we'll need to get it from the entity
        return getattr(self, '_agent_id', 'unknown')

    def set_agent_id(self, agent_id: str) -> None:
        """Set the agent ID for this component."""
        self._agent_id = agent_id  # type: ignore

    def __repr__(self) -> str:
        """String representation of the interaction component."""
        return f"InteractionComponent(energy={self.social_energy:.2f}, relationships={len(self.relationship_map)}, interactions={self.total_interactions})"
