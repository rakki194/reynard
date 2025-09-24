"""Agent Component

Core agent identity and basic information component.
"""

from ..core.component import Component


class AgentComponent(Component):
    """Core agent identity and basic information.

    Contains the fundamental identity data for an agent including
    name, spirit, style, and generation information.
    """

    def __init__(self, name: str, spirit: str, style: str) -> None:
        """Initialize the agent component.

        Args:
            name: The agent's name
            spirit: The agent's animal spirit (fox, wolf, otter, etc.)
            style: The agent's naming style (foundation, exo, hybrid, etc.)

        """
        super().__init__()
        self.name = name
        self.spirit = spirit
        self.style = style
        self.generation = 1
        self.active = True

    def __repr__(self) -> str:
        """String representation of the agent component."""
        return f"AgentComponent(name={self.name}, spirit={self.spirit}, style={self.style}, generation={self.generation})"
