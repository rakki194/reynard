"""ECS World Core Class

Main ECS world that manages entities, components, and systems.
"""

import logging

from .component import Component
from .entity import Entity
from .system import System

logger = logging.getLogger(__name__)


class ECSWorld:
    """Main ECS world that manages entities, components, and systems.

    The world is the central container that holds all entities and systems,
    and provides methods to create, manage, and update them.
    """

    def __init__(self) -> None:
        """Initialize the ECS world."""
        self.entities: dict[str, Entity] = {}
        self.systems: list[System] = []
        self._next_entity_id = 1

    def create_entity(self, entity_id: str | None = None) -> Entity:
        """Create a new entity.

        Args:
            entity_id: Optional custom ID for the entity

        Returns:
            The created entity

        Raises:
            ValueError: If entity_id already exists

        """
        if entity_id is None:
            entity_id = f"entity_{self._next_entity_id}"
            self._next_entity_id += 1

        if entity_id in self.entities:
            raise ValueError(f"Entity {entity_id} already exists")

        entity = Entity(entity_id)
        self.entities[entity_id] = entity
        logger.debug(f"Created entity {entity_id}")
        return entity

    def get_entity(self, entity_id: str) -> Entity | None:
        """Get an entity by ID.

        Args:
            entity_id: The ID of the entity to retrieve

        Returns:
            The entity if found, None otherwise

        """
        return self.entities.get(entity_id)

    def destroy_entity(self, entity_id: str) -> None:
        """Destroy an entity.

        Args:
            entity_id: The ID of the entity to destroy

        """
        if entity_id in self.entities:
            self.entities[entity_id].destroy()
            del self.entities[entity_id]
            logger.debug(f"Destroyed entity {entity_id}")

    def add_system(self, system: System) -> None:
        """Add a system to the world.

        Args:
            system: The system to add

        """
        self.systems.append(system)
        logger.debug(f"Added system {type(system).__name__}")

    def remove_system(self, system: System) -> None:
        """Remove a system from the world.

        Args:
            system: The system to remove

        """
        if system in self.systems:
            self.systems.remove(system)
            logger.debug(f"Removed system {type(system).__name__}")

    def get_system(self, system_type: type[System]) -> System | None:
        """Get a system by type.

        Args:
            system_type: The type of system to retrieve

        Returns:
            The system if found, None otherwise

        """
        for system in self.systems:
            if isinstance(system, system_type):
                return system
        return None

    def update(self, delta_time: float) -> None:
        """Update all systems.

        Args:
            delta_time: Time elapsed since last update

        """
        for system in self.systems:
            if system.enabled:
                try:
                    system.update(delta_time)
                except Exception as e:
                    logger.error(f"Error updating system {type(system).__name__}: {e}")

    def get_entities_with_components(
        self,
        *component_types: type[Component],
    ) -> list[Entity]:
        """Get entities that have all specified components.

        Args:
            *component_types: Component types to filter by

        Returns:
            List of entities that have all specified components

        """
        entities = []
        for entity in self.entities.values():
            if entity.active and all(
                entity.has_component(ct) for ct in component_types
            ):
                entities.append(entity)
        return entities

    def cleanup_destroyed_entities(self) -> None:
        """Remove entities marked for destruction."""
        to_remove = [eid for eid, entity in self.entities.items() if not entity.active]
        for entity_id in to_remove:
            self.destroy_entity(entity_id)

    def get_entity_count(self) -> int:
        """Get the total number of entities.

        Returns:
            Number of entities in the world

        """
        return len(self.entities)

    def get_system_count(self) -> int:
        """Get the total number of systems.

        Returns:
            Number of systems in the world

        """
        return len(self.systems)

    def __repr__(self) -> str:
        """String representation of the world."""
        return f"ECSWorld(entities={len(self.entities)}, systems={len(self.systems)})"
