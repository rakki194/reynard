"""Agent contribution data model.
"""

from dataclasses import dataclass


@dataclass
class AgentContribution:
    """Represents a single contribution by an agent.

    Attributes:
        agent_name: The name of the agent (e.g., "Loyal-Librarian-56")
        title: The title of the contribution
        description: Detailed description of the contribution
        category: The category this contribution falls into (auto-assigned)

    """

    agent_name: str
    title: str
    description: str
    category: str = ""

    def __post_init__(self) -> None:
        """Validate the contribution data after initialization."""
        if not self.agent_name:
            raise ValueError("Agent name cannot be empty")
        if not self.title:
            raise ValueError("Title cannot be empty")
        if not self.description:
            raise ValueError("Description cannot be empty")

    def to_dict(self) -> dict[str, str]:
        """Convert the contribution to a dictionary."""
        return {
            "agent_name": self.agent_name,
            "title": self.title,
            "description": self.description,
            "category": self.category,
        }

    @classmethod
    def from_dict(cls, data: dict[str, str]) -> "AgentContribution":
        """Create a contribution from a dictionary."""
        return cls(
            agent_name=data["agent_name"],
            title=data["title"],
            description=data["description"],
            category=data.get("category", ""),
        )
