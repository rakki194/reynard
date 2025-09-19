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

    def is_close_relationship(self) -> bool:
        """Check if this is a close relationship."""
        return self.familiarity > 0.7 and self.strength > 0.6


class InteractionComponent(Component):
    """
    Agent interaction and communication capabilities component.
    
    Manages social interactions, relationships, communication styles,
    and social energy with comprehensive tracking and analysis.
    """

    def __init__(self, max_relationships: int = 100, max_interactions: int = 1000):
        """
        Initialize the interaction component.
        
        Args:
            max_relationships: Maximum number of relationships to track
            max_interactions: Maximum number of interactions to store
        """
        super().__init__()
        self.relationships: Dict[str, Relationship] = {}
        self.interactions: List[Interaction] = []
        self.max_relationships = max_relationships
        self.max_interactions = max_interactions
        
        # Social energy management
        self.social_energy: float = 1.0  # 0.0 to 1.0
        self.max_social_energy: float = 1.0
        self.energy_recovery_rate: float = 0.1  # Per hour
        self.energy_drain_rate: float = 0.2  # Per interaction
        
        # Communication preferences
        self.preferred_communication_style: CommunicationStyle = CommunicationStyle.CASUAL
        self.communication_effectiveness: float = 1.0
        self.social_confidence: float = 0.5
        
        # Interaction statistics
        self.total_interactions: int = 0
        self.successful_interactions: int = 0
        self.failed_interactions: int = 0
        self.total_social_time: float = 0.0

    def initiate_interaction(
        self,
        target_agent_id: str,
        interaction_type: InteractionType,
        content: str,
        duration: float = 0.0
    ) -> Interaction | None:
        """
        Initiate an interaction with another agent.
        
        Args:
            target_agent_id: ID of agent to interact with
            interaction_type: Type of interaction
            content: Interaction content
            duration: Interaction duration in seconds
            
        Returns:
            Interaction object if successful, None if insufficient energy
        """
        # Check social energy
        if self.social_energy < self.energy_drain_rate:
            return None
        
        # Create interaction
        interaction = Interaction(
            id=f"interaction_{self.total_interactions}_{datetime.now().timestamp()}",
            participants=[target_agent_id],
            interaction_type=interaction_type,
            content=content,
            outcome=InteractionOutcome.NEUTRAL,  # Will be determined by system
            relationship_impact=0.0,  # Will be calculated by system
            duration=duration,
            energy_cost=self.energy_drain_rate
        )
        
        # Add to interactions list
        self.interactions.append(interaction)
        self.total_interactions += 1
        self.total_social_time += duration
        
        # Remove old interactions if over capacity
        if len(self.interactions) > self.max_interactions:
            self.interactions.pop(0)
        
        # Update relationship
        self._update_relationship_from_interaction(target_agent_id, interaction)
        
        # Drain social energy
        self.social_energy = max(0.0, self.social_energy - self.energy_drain_rate)
        
        return interaction

    def get_relationship(self, agent_id: str) -> Relationship | None:
        """
        Get relationship with a specific agent.
        
        Args:
            agent_id: ID of agent to get relationship with
            
        Returns:
            Relationship object or None if no relationship exists
        """
        return self.relationships.get(agent_id)

    def get_all_relationships(self) -> Dict[str, Relationship]:
        """Get all relationships."""
        return self.relationships.copy()

    def get_positive_relationships(self) -> Dict[str, Relationship]:
        """Get all positive relationships."""
        return {
            agent_id: rel for agent_id, rel in self.relationships.items()
            if rel.is_positive_relationship()
        }

    def get_close_relationships(self) -> Dict[str, Relationship]:
        """Get all close relationships."""
        return {
            agent_id: rel for agent_id, rel in self.relationships.items()
            if rel.is_close_relationship()
        }

    def get_relationship_stats(self) -> Dict[str, Any]:
        """Get comprehensive relationship statistics."""
        if not self.relationships:
            return {
                "total_relationships": 0,
                "relationship_types": {},
                "average_strength": 0.0,
                "average_trust": 0.0,
                "average_familiarity": 0.0,
                "positive_relationships": 0,
                "close_relationships": 0
            }
        
        relationship_types = {}
        total_strength = 0.0
        total_trust = 0.0
        total_familiarity = 0.0
        positive_count = 0
        close_count = 0
        
        for relationship in self.relationships.values():
            # Count by type
            relationship_types[relationship.relationship_type] = relationship_types.get(relationship.relationship_type, 0) + 1
            
            # Sum metrics
            total_strength += relationship.strength
            total_trust += relationship.trust_level
            total_familiarity += relationship.familiarity
            
            # Count positive and close relationships
            if relationship.is_positive_relationship():
                positive_count += 1
            if relationship.is_close_relationship():
                close_count += 1
        
        return {
            "total_relationships": len(self.relationships),
            "relationship_types": relationship_types,
            "average_strength": total_strength / len(self.relationships),
            "average_trust": total_trust / len(self.relationships),
            "average_familiarity": total_familiarity / len(self.relationships),
            "positive_relationships": positive_count,
            "close_relationships": close_count
        }

    def get_interaction_stats(self) -> Dict[str, Any]:
        """Get comprehensive interaction statistics."""
        if not self.interactions:
            return {
                "total_interactions": self.total_interactions,
                "interaction_types": {},
                "interaction_outcomes": {},
                "average_duration": 0.0,
                "total_social_time": self.total_social_time,
                "success_rate": 0.0
            }
        
        interaction_types = {}
        interaction_outcomes = {}
        total_duration = 0.0
        
        for interaction in self.interactions:
            # Count by type
            interaction_types[interaction.interaction_type.value] = interaction_types.get(interaction.interaction_type.value, 0) + 1
            
            # Count by outcome
            interaction_outcomes[interaction.outcome.value] = interaction_outcomes.get(interaction.outcome.value, 0) + 1
            
            # Sum duration
            total_duration += interaction.duration
        
        success_rate = (self.successful_interactions / self.total_interactions) if self.total_interactions > 0 else 0.0
        
        return {
            "total_interactions": self.total_interactions,
            "interaction_types": interaction_types,
            "interaction_outcomes": interaction_outcomes,
            "average_duration": total_duration / len(self.interactions),
            "total_social_time": self.total_social_time,
            "success_rate": success_rate,
            "successful_interactions": self.successful_interactions,
            "failed_interactions": self.failed_interactions
        }

    def recover_social_energy(self, delta_time: float) -> None:
        """
        Recover social energy over time.
        
        Args:
            delta_time: Time elapsed in hours
        """
        energy_recovery = self.energy_recovery_rate * delta_time
        self.social_energy = min(self.max_social_energy, self.social_energy + energy_recovery)

    def can_interact(self) -> bool:
        """Check if the agent has enough social energy to interact."""
        return self.social_energy >= self.energy_drain_rate

    def get_social_energy_status(self) -> Dict[str, float]:
        """Get social energy status."""
        return {
            "current_energy": self.social_energy,
            "max_energy": self.max_social_energy,
            "energy_percentage": self.social_energy / self.max_social_energy,
            "energy_recovery_rate": self.energy_recovery_rate,
            "energy_drain_rate": self.energy_drain_rate
        }

    def update_communication_style(self, style: CommunicationStyle) -> None:
        """
        Update preferred communication style.
        
        Args:
            style: New communication style
        """
        self.preferred_communication_style = style

    def update_communication_effectiveness(self, effectiveness: float) -> None:
        """
        Update communication effectiveness.
        
        Args:
            effectiveness: New effectiveness value (0.0 to 1.0)
        """
        self.communication_effectiveness = max(0.0, min(1.0, effectiveness))

    def update_social_confidence(self, confidence: float) -> None:
        """
        Update social confidence.
        
        Args:
            confidence: New confidence value (0.0 to 1.0)
        """
        self.social_confidence = max(0.0, min(1.0, confidence))

    def _update_relationship_from_interaction(self, agent_id: str, interaction: Interaction) -> None:
        """Update relationship based on interaction."""
        if agent_id not in self.relationships:
            # Create new relationship
            self.relationships[agent_id] = Relationship(
                agent_id=agent_id,
                relationship_type="neutral",
                strength=0.1,
                trust_level=0.1,
                familiarity=0.1
            )
        
        # Update existing relationship
        self.relationships[agent_id].update_from_interaction(interaction)
        
        # Remove old relationships if over capacity
        if len(self.relationships) > self.max_relationships:
            # Remove relationship with lowest quality
            worst_relationship = min(
                self.relationships.items(),
                key=lambda x: x[1].get_relationship_quality()
            )
            del self.relationships[worst_relationship[0]]

    def get_recent_interactions(self, limit: int = 10) -> List[Interaction]:
        """Get recent interactions."""
        return self.interactions[-limit:] if self.interactions else []

    def get_interactions_with_agent(self, agent_id: str, limit: int = 10) -> List[Interaction]:
        """Get interactions with a specific agent."""
        agent_interactions = [
            interaction for interaction in self.interactions
            if agent_id in interaction.participants
        ]
        return agent_interactions[-limit:] if agent_interactions else []

    def get_interactions_by_type(self, interaction_type: InteractionType, limit: int = 10) -> List[Interaction]:
        """Get interactions of a specific type."""
        type_interactions = [
            interaction for interaction in self.interactions
            if interaction.interaction_type == interaction_type
        ]
        return type_interactions[-limit:] if type_interactions else []
