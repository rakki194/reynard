"""Social Component

Agent social behavior, group dynamics, social networks, and influence systems.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any

from ..core.component import Component


class SocialRole(Enum):
    """Social roles within groups and communities."""

    LEADER = "leader"
    FOLLOWER = "follower"
    MEDIATOR = "mediator"
    OUTCAST = "outcast"
    NEUTRAL = "neutral"
    INFLUENCER = "influencer"
    MENTOR = "mentor"
    STUDENT = "student"


class GroupType(Enum):
    """Types of social groups."""

    FRIENDSHIP = "friendship"
    WORK = "work"
    FAMILY = "family"
    COMMUNITY = "community"
    RIVALRY = "rivalry"
    ROMANTIC = "romantic"
    MENTORSHIP = "mentorship"
    ALLIANCE = "alliance"


class SocialStatus(Enum):
    """Social status levels."""

    OUTCAST = "outcast"
    MARGINAL = "marginal"
    ACCEPTED = "accepted"
    POPULAR = "popular"
    INFLUENTIAL = "influential"
    LEADER = "leader"


@dataclass
class SocialGroup:
    """A social group or community."""

    id: str
    name: str
    group_type: GroupType
    members: list[str] = field(default_factory=list)
    leaders: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    cohesion: float = 0.5  # 0.0 to 1.0
    influence: float = 0.0  # Group's collective influence
    activity_level: float = 0.5  # How active the group is
    stability: float = 0.5  # How stable the group is
    goals: list[str] = field(default_factory=list)
    rules: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        """Validate group data after initialization."""
        self.cohesion = max(0.0, min(1.0, self.cohesion))
        self.influence = max(0.0, self.influence)
        self.activity_level = max(0.0, min(1.0, self.activity_level))
        self.stability = max(0.0, min(1.0, self.stability))

    def add_member(self, agent_id: str) -> bool:
        """Add a member to the group."""
        if agent_id not in self.members:
            self.members.append(agent_id)
            return True
        return False

    def remove_member(self, agent_id: str) -> bool:
        """Remove a member from the group."""
        if agent_id in self.members:
            self.members.remove(agent_id)
            if agent_id in self.leaders:
                self.leaders.remove(agent_id)
            return True
        return False

    def add_leader(self, agent_id: str) -> bool:
        """Add a leader to the group."""
        if agent_id in self.members and agent_id not in self.leaders:
            self.leaders.append(agent_id)
            return True
        return False

    def remove_leader(self, agent_id: str) -> bool:
        """Remove a leader from the group."""
        if agent_id in self.leaders:
            self.leaders.remove(agent_id)
            return True
        return False

    def get_member_count(self) -> int:
        """Get the number of members in the group."""
        return len(self.members)

    def get_leader_count(self) -> int:
        """Get the number of leaders in the group."""
        return len(self.leaders)

    def is_member(self, agent_id: str) -> bool:
        """Check if an agent is a member of the group."""
        return agent_id in self.members

    def is_leader(self, agent_id: str) -> bool:
        """Check if an agent is a leader of the group."""
        return agent_id in self.leaders

    def calculate_group_health(self) -> float:
        """Calculate overall group health based on various factors."""
        if not self.members:
            return 0.0

        # Base health from cohesion and stability
        health = (self.cohesion + self.stability) / 2

        # Bonus for having leaders
        if self.leaders:
            health += 0.1

        # Penalty for too many or too few members
        member_count = len(self.members)
        if member_count < 2:
            health -= 0.2
        elif member_count > 10:
            health -= 0.1

        return max(0.0, min(1.0, health))


@dataclass
class SocialConnection:
    """A connection in the social network."""

    target_agent: str
    connection_strength: float  # 0.0 to 1.0
    connection_type: str  # friend, rival, mentor, student, etc.
    mutual_connections: int = 0
    shared_groups: int = 0
    last_interaction: datetime = field(default_factory=datetime.now)
    interaction_frequency: float = 0.0  # Interactions per day
    influence_flow: float = (
        0.0  # -1.0 to 1.0 (negative = influenced by, positive = influences)
    )

    def __post_init__(self) -> None:
        """Validate connection data after initialization."""
        self.connection_strength = max(0.0, min(1.0, self.connection_strength))
        self.influence_flow = max(-1.0, min(1.0, self.influence_flow))
        self.interaction_frequency = max(0.0, self.interaction_frequency)

    def update_connection(self, interaction_impact: float) -> None:
        """Update connection based on interaction."""
        self.connection_strength = max(
            0.0,
            min(1.0, self.connection_strength + interaction_impact * 0.1),
        )
        self.last_interaction = datetime.now()

    def get_connection_quality(self) -> float:
        """Get overall connection quality."""
        return (self.connection_strength + abs(self.influence_flow)) / 2


class SocialComponent(Component):
    """Agent social behavior and group dynamics.

    Manages social networks, group memberships, social status,
    influence systems, and community participation.
    """

    def __init__(self) -> None:
        """Initialize the social component."""
        super().__init__()
        self.social_network: dict[str, SocialConnection] = {}
        self.group_memberships: set[str] = set()
        self.leadership_roles: set[str] = set()
        self.social_status: SocialStatus = SocialStatus.ACCEPTED
        self.social_influence: float = 0.0  # Overall social influence
        self.charisma: float = 0.5  # Natural charisma level
        self.leadership_ability: float = 0.5  # Leadership potential
        self.social_energy: float = 1.0  # Social energy for group activities
        self.max_social_energy: float = 1.0
        self.energy_recovery_rate: float = 0.1
        self.group_activity_preference: float = 0.5  # 0.0 = solitary, 1.0 = very social
        self.conflict_resolution_skill: float = 0.5
        self.network_size: int = 0
        self.total_interactions: int = 0
        self.positive_interactions: int = 0
        self.negative_interactions: int = 0
        self.groups_created: int = 0
        self.groups_joined: int = 0
        self.leadership_opportunities: int = 0
        self._agent_id: str = "unknown"

    def add_social_connection(
        self,
        target_agent: str,
        connection_type: str = "neutral",
    ) -> bool:
        """Add a social connection to another agent.

        Args:
            target_agent: ID of the agent to connect with
            connection_type: Type of connection (friend, rival, etc.)

        Returns:
            True if connection was added successfully

        """
        if target_agent not in self.social_network:
            connection = SocialConnection(
                target_agent=target_agent,
                connection_strength=0.1,  # Start with weak connection
                connection_type=connection_type,
            )
            self.social_network[target_agent] = connection
            self.network_size = len(self.social_network)
            return True
        return False

    def remove_social_connection(self, target_agent: str) -> bool:
        """Remove a social connection."""
        if target_agent in self.social_network:
            del self.social_network[target_agent]
            self.network_size = len(self.social_network)
            return True
        return False

    def update_connection(self, target_agent: str, interaction_impact: float) -> None:
        """Update a social connection based on interaction."""
        if target_agent in self.social_network:
            self.social_network[target_agent].update_connection(interaction_impact)

    def get_connection(self, target_agent: str) -> SocialConnection | None:
        """Get social connection with a specific agent."""
        return self.social_network.get(target_agent)

    def get_connections_by_type(self, connection_type: str) -> list[SocialConnection]:
        """Get all connections of a specific type."""
        return [
            conn
            for conn in self.social_network.values()
            if conn.connection_type == connection_type
        ]

    def get_strong_connections(
        self,
        min_strength: float = 0.7,
    ) -> list[SocialConnection]:
        """Get connections with strength above threshold."""
        return [
            conn
            for conn in self.social_network.values()
            if conn.connection_strength >= min_strength
        ]

    def get_weak_connections(self, max_strength: float = 0.3) -> list[SocialConnection]:
        """Get connections with strength below threshold."""
        return [
            conn
            for conn in self.social_network.values()
            if conn.connection_strength <= max_strength
        ]

    def join_group(self, group_id: str) -> bool:
        """Join a social group."""
        if group_id not in self.group_memberships:
            self.group_memberships.add(group_id)
            self.groups_joined += 1
            return True
        return False

    def leave_group(self, group_id: str) -> bool:
        """Leave a social group."""
        if group_id in self.group_memberships:
            self.group_memberships.remove(group_id)
            if group_id in self.leadership_roles:
                self.leadership_roles.remove(group_id)
            return True
        return False

    def take_leadership(self, group_id: str) -> bool:
        """Take leadership role in a group."""
        if group_id in self.group_memberships and group_id not in self.leadership_roles:
            self.leadership_roles.add(group_id)
            self.leadership_opportunities += 1
            return True
        return False

    def relinquish_leadership(self, group_id: str) -> bool:
        """Relinquish leadership role in a group."""
        if group_id in self.leadership_roles:
            self.leadership_roles.remove(group_id)
            return True
        return False

    def calculate_social_influence(self) -> float:
        """Calculate overall social influence based on network and status."""
        # Base influence from network size
        network_influence = min(1.0, self.network_size / 20.0)

        # Leadership bonus
        leadership_bonus = len(self.leadership_roles) * 0.2

        # Status bonus
        status_bonus = {
            SocialStatus.OUTCAST: -0.3,
            SocialStatus.MARGINAL: -0.1,
            SocialStatus.ACCEPTED: 0.1,
            SocialStatus.POPULAR: 0.3,
            SocialStatus.INFLUENTIAL: 0.5,
            SocialStatus.LEADER: 0.7,
        }.get(self.social_status, 0.0)

        # Charisma bonus
        charisma_bonus = self.charisma * 0.2

        total_influence = (
            network_influence + leadership_bonus + status_bonus + charisma_bonus
        )
        self.social_influence = max(0.0, min(2.0, total_influence))
        return self.social_influence

    def update_social_status(self) -> None:
        """Update social status based on current metrics."""
        influence = self.calculate_social_influence()
        network_size = self.network_size
        leadership_count = len(self.leadership_roles)

        # Determine status based on metrics
        if influence >= 1.5 and leadership_count >= 2:
            self.social_status = SocialStatus.LEADER
        elif influence >= 1.0 and network_size >= 10:
            self.social_status = SocialStatus.INFLUENTIAL
        elif influence >= 0.7 and network_size >= 5:
            self.social_status = SocialStatus.POPULAR
        elif influence >= 0.3 and network_size >= 2:
            self.social_status = SocialStatus.ACCEPTED
        elif influence >= 0.1:
            self.social_status = SocialStatus.MARGINAL
        else:
            self.social_status = SocialStatus.OUTCAST

    def recover_social_energy(self, delta_time: float) -> None:
        """Recover social energy over time."""
        if self.social_energy < self.max_social_energy:
            recovery_amount = self.energy_recovery_rate * delta_time
            self.social_energy = min(
                self.max_social_energy,
                self.social_energy + recovery_amount,
            )

    def consume_social_energy(self, amount: float) -> bool:
        """Consume social energy for group activities."""
        if self.social_energy >= amount:
            self.social_energy -= amount
            return True
        return False

    def get_social_stats(self) -> dict[str, Any]:
        """Get comprehensive social statistics."""
        strong_connections = len(self.get_strong_connections())
        weak_connections = len(self.get_weak_connections())

        return {
            "social_status": self.social_status.value,
            "social_influence": self.social_influence,
            "network_size": self.network_size,
            "strong_connections": strong_connections,
            "weak_connections": weak_connections,
            "group_memberships": len(self.group_memberships),
            "leadership_roles": len(self.leadership_roles),
            "social_energy": self.social_energy,
            "max_social_energy": self.max_social_energy,
            "energy_percentage": self.social_energy / self.max_social_energy,
            "charisma": self.charisma,
            "leadership_ability": self.leadership_ability,
            "group_activity_preference": self.group_activity_preference,
            "conflict_resolution_skill": self.conflict_resolution_skill,
            "total_interactions": self.total_interactions,
            "positive_interactions": self.positive_interactions,
            "negative_interactions": self.negative_interactions,
            "groups_created": self.groups_created,
            "groups_joined": self.groups_joined,
            "leadership_opportunities": self.leadership_opportunities,
        }

    def get_agent_id(self) -> str:
        """Get the agent ID for this component."""
        return getattr(self, "_agent_id", "unknown")

    def set_agent_id(self, agent_id: str) -> None:
        """Set the agent ID for this component."""
        self._agent_id = agent_id

    def __repr__(self) -> str:
        """String representation of the social component."""
        return f"SocialComponent(status={self.social_status.value}, network={self.network_size}, groups={len(self.group_memberships)})"
