"""
Lifecycle Component

Agent lifecycle and aging information component.
"""

import time
from ..core.component import Component


class LifecycleComponent(Component):
    """
    Agent lifecycle and aging information.
    
    Tracks the agent's age, life stage, and lifecycle progression
    including birth time, maturity, and maximum age.
    """

    def __init__(self, birth_time: float | None = None) -> None:
        """
        Initialize the lifecycle component.
        
        Args:
            birth_time: Time when the agent was born (defaults to current time)
        """
        super().__init__()
        self.birth_time = birth_time or time.time()
        self.age = 0.0
        self.life_stage = "infant"  # infant, juvenile, adult, elder
        self.max_age = 100.0  # Maximum age in time units
        self.maturity_age = 18.0  # Age when can reproduce

    def update_life_stage(self) -> None:
        """Update the agent's life stage based on age."""
        if self.age < 5.0:
            self.life_stage = "infant"
        elif self.age < 18.0:
            self.life_stage = "juvenile"
        elif self.age < 80.0:
            self.life_stage = "adult"
        else:
            self.life_stage = "elder"

    def is_mature(self) -> bool:
        """
        Check if the agent is mature enough to reproduce.
        
        Returns:
            True if the agent is mature, False otherwise
        """
        return self.age >= self.maturity_age

    def is_alive(self) -> bool:
        """
        Check if the agent is still alive.
        
        Returns:
            True if the agent is alive, False otherwise
        """
        return self.age < self.max_age

    def __repr__(self) -> str:
        """String representation of the lifecycle component."""
        return f"LifecycleComponent(age={self.age:.2f}, stage={self.life_stage}, mature={self.is_mature()})"
