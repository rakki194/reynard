"""Reproduction Component

Agent reproduction capabilities and preferences component.
"""

from ..core.component import Component


class ReproductionComponent(Component):
    """Agent reproduction capabilities and preferences.

    Tracks the agent's ability to reproduce, cooldown periods,
    offspring count, and mating preferences.
    """

    def __init__(self) -> None:
        """Initialize the reproduction component."""
        super().__init__()
        self.can_reproduce = False
        self.reproduction_cooldown = 0.0
        self.max_cooldown = 30.0  # Time between reproductions
        self.offspring_count = 0
        self.max_offspring = 5
        self.preferred_mates: list[str] = []
        self.compatibility_threshold = 0.6

    def can_mate(self) -> bool:
        """Check if the agent can currently mate.

        Returns:
            True if the agent can mate, False otherwise

        """
        return self.can_reproduce and self.reproduction_cooldown <= 0.0

    def start_cooldown(self) -> None:
        """Start the reproduction cooldown period."""
        self.reproduction_cooldown = self.max_cooldown

    def update_cooldown(self, delta_time: float) -> None:
        """Update the reproduction cooldown.

        Args:
            delta_time: Time elapsed since last update

        """
        if self.reproduction_cooldown > 0.0:
            self.reproduction_cooldown = max(
                0.0, self.reproduction_cooldown - delta_time,
            )

    def add_offspring(self) -> None:
        """Increment the offspring count."""
        self.offspring_count += 1

    def has_reached_offspring_limit(self) -> bool:
        """Check if the agent has reached the maximum offspring limit.

        Returns:
            True if at the limit, False otherwise

        """
        return self.offspring_count >= self.max_offspring

    def __repr__(self) -> str:
        """String representation of the reproduction component."""
        return f"ReproductionComponent(can_reproduce={self.can_reproduce}, offspring={self.offspring_count}/{self.max_offspring}, cooldown={self.reproduction_cooldown:.2f})"
