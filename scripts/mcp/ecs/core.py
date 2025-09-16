#!/usr/bin/env python3
"""
ECS Core Components
===================

Core Entity Component System classes for the Reynard agent system.
Provides the fundamental building blocks for ECS architecture.

Follows the 140-line axiom and modular architecture principles.
"""

import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Type, TypeVar

logger = logging.getLogger(__name__)

T = TypeVar("T", bound="Component")


class Entity:
    """Represents an entity in the ECS system."""

    def __init__(self, entity_id: str):
        self.id = entity_id
        self.components: Dict[Type[Component], Component] = {}
        self.active = True

    def add_component(self, component: "Component") -> None:
        """Add a component to this entity."""
        self.components[type(component)] = component
        logger.debug(f"Added {type(component).__name__} to entity {self.id}")

    def get_component(self, component_type: Type[T]) -> T | None:
        """Get a component of the specified type."""
        return self.components.get(component_type)  # type: ignore

    def has_component(self, component_type: Type["Component"]) -> bool:
        """Check if entity has a component of the specified type."""
        return component_type in self.components

    def remove_component(self, component_type: Type["Component"]) -> None:
        """Remove a component from this entity."""
        if component_type in self.components:
            del self.components[component_type]
            logger.debug(f"Removed {component_type.__name__} from entity {self.id}")

    def destroy(self) -> None:
        """Mark entity for destruction."""
        self.active = False
        logger.debug(f"Marked entity {self.id} for destruction")


class Component(ABC):
    """Base class for all ECS components."""

    def __init__(self):
        self.created_at = self._get_current_time()

    def _get_current_time(self) -> float:
        """Get current timestamp."""
        import time

        return time.time()


class System(ABC):
    """Base class for all ECS systems."""

    def __init__(self, world: "ECSWorld"):
        self.world = world
        self.enabled = True

    @abstractmethod
    def update(self, delta_time: float) -> None:
        """Update system logic."""
        pass

    def get_entities_with_components(
        self, *component_types: Type[Component]
    ) -> List[Entity]:
        """Get entities that have all specified components."""
        entities = []
        for entity in self.world.entities.values():
            if entity.active and all(
                entity.has_component(ct) for ct in component_types
            ):
                entities.append(entity)
        return entities


class ECSWorld:
    """Main ECS world that manages entities, components, and systems."""

    def __init__(self) -> None:
        self.entities: Dict[str, Entity] = {}
        self.systems: List[System] = []
        self._next_entity_id = 1

    def create_entity(self, entity_id: str | None = None) -> Entity:
        """Create a new entity."""
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
        """Get an entity by ID."""
        return self.entities.get(entity_id)

    def destroy_entity(self, entity_id: str) -> None:
        """Destroy an entity."""
        if entity_id in self.entities:
            self.entities[entity_id].destroy()
            del self.entities[entity_id]
            logger.debug(f"Destroyed entity {entity_id}")

    def add_system(self, system: System) -> None:
        """Add a system to the world."""
        self.systems.append(system)
        logger.debug(f"Added system {type(system).__name__}")

    def remove_system(self, system: System) -> None:
        """Remove a system from the world."""
        if system in self.systems:
            self.systems.remove(system)
            logger.debug(f"Removed system {type(system).__name__}")

    def update(self, delta_time: float) -> None:
        """Update all systems."""
        for system in self.systems:
            if system.enabled:
                try:
                    system.update(delta_time)
                except Exception as e:
                    logger.error(f"Error updating system {type(system).__name__}: {e}")

    def get_entities_with_components(
        self, *component_types: Type["Component"]
    ) -> List[Entity]:
        """Get entities that have all specified components."""
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
