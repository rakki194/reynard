"""Entity Class for ECS World

Represents an entity in the Entity Component System architecture.
Entities are lightweight containers that hold components.
"""

import logging
from typing import TypeVar

from .component import Component

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=Component)


class Entity:
    """Represents an entity in the ECS system.

    Entities are lightweight containers that hold components. They serve as
    the primary way to group related data and behavior in the ECS architecture.
    """

    def __init__(self, entity_id: str):
        """Initialize a new entity.

        Args:
            entity_id: Unique identifier for this entity

        """
        self.id = entity_id
        self.components: dict[type[Component], Component] = {}
        self.active = True

    def add_component(self, component: "Component") -> None:
        """Add a component to this entity.

        Args:
            component: The component to add

        """
        self.components[type(component)] = component
        logger.debug(f"Added {type(component).__name__} to entity {self.id}")

    def get_component(self, component_type: type[T]) -> T | None:
        """Get a component of the specified type.

        Args:
            component_type: The type of component to retrieve

        Returns:
            The component if found, None otherwise

        """
        return self.components.get(component_type)  # type: ignore

    def has_component(self, component_type: type["Component"]) -> bool:
        """Check if entity has a component of the specified type.

        Args:
            component_type: The type of component to check for

        Returns:
            True if the entity has the component, False otherwise

        """
        return component_type in self.components

    def remove_component(self, component_type: type["Component"]) -> None:
        """Remove a component from this entity.

        Args:
            component_type: The type of component to remove

        """
        if component_type in self.components:
            del self.components[component_type]
            logger.debug(f"Removed {component_type.__name__} from entity {self.id}")

    def destroy(self) -> None:
        """Mark entity for destruction."""
        self.active = False
        logger.debug(f"Marked entity {self.id} for destruction")

    def __repr__(self) -> str:
        """String representation of the entity."""
        component_names = [comp.__class__.__name__ for comp in self.components.values()]
        return (
            f"Entity(id={self.id}, components={component_names}, active={self.active})"
        )
