"""System Base Class for ECS World

Base class for all ECS systems. Systems contain logic and operate on entities with specific components.
"""

import logging
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from .component import Component
from .entity import Entity

if TYPE_CHECKING:
    from .world import ECSWorld

logger = logging.getLogger(__name__)


class System(ABC):
    """Base class for all ECS systems.

    Systems contain logic and operate on entities that have specific components.
    They are the primary way to implement behavior in the ECS architecture.
    """

    def __init__(self, world: "ECSWorld"):
        """Initialize the system.

        Args:
            world: The ECS world this system belongs to

        """
        self.world = world
        self.enabled = True

    @abstractmethod
    def update(self, delta_time: float) -> None:
        """Update system logic.

        Args:
            delta_time: Time elapsed since last update

        """
        raise NotImplementedError("Subclasses must implement update method")

    def get_entities_with_components(
        self, *component_types: type[Component],
    ) -> list[Entity]:
        """Get entities that have all specified components.

        Args:
            *component_types: Component types to filter by

        Returns:
            List of entities that have all specified components

        """
        entities = []
        for entity in self.world.entities.values():
            if entity.active and all(
                entity.has_component(ct) for ct in component_types
            ):
                entities.append(entity)
        return entities

    def __repr__(self) -> str:
        """String representation of the system."""
        return f"{self.__class__.__name__}(enabled={self.enabled})"
