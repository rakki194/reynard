"""
Component Base Class for ECS World

Base class for all ECS components. Components hold data and are attached to entities.
"""

import time
from abc import ABC


class Component(ABC):
    """
    Base class for all ECS components.

    Components hold data and are attached to entities. They should be pure data
    containers without behavior - all logic should be in systems.
    """

    def __init__(self):
        """Initialize the component with creation timestamp."""
        self.created_at = self._get_current_time()

    def _get_current_time(self) -> float:
        """
        Get current timestamp.

        Returns:
            Current time as float
        """
        return time.time()

    def __repr__(self) -> str:
        """String representation of the component."""
        return f"{self.__class__.__name__}(created_at={self.created_at})"
