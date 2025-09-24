"""Position Component

Agent spatial position and movement tracking component.
"""

import time

from ..core.component import Component


class PositionComponent(Component):
    """Agent spatial position and movement tracking.

    Tracks the agent's current position, velocity, target position,
    and movement parameters in the 2D world space.
    """

    def __init__(self, x: float = 0.0, y: float = 0.0) -> None:
        """Initialize the position component.

        Args:
            x: Initial X coordinate
            y: Initial Y coordinate

        """
        super().__init__()
        self.x = x
        self.y = y
        self.velocity_x = 0.0
        self.velocity_y = 0.0
        self.target_x = x
        self.target_y = y
        self.movement_speed = 1.0
        self.last_update = time.time()

    def distance_to(self, other: "PositionComponent") -> float:
        """Calculate distance to another position.

        Args:
            other: Another PositionComponent

        Returns:
            Distance between the two positions

        """
        import math

        dx = self.x - other.x
        dy = self.y - other.y
        return math.sqrt(dx * dx + dy * dy)

    def __repr__(self) -> str:
        """String representation of the position component."""
        return f"PositionComponent(x={self.x:.2f}, y={self.y:.2f}, target=({self.target_x:.2f}, {self.target_y:.2f}))"
