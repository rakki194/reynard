"""
Test ECS Core Components

Tests for Entity, Component, System, and World classes.
"""

import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..'))

from backend.app.ecs.core import Entity, Component, System, ECSWorld


class TestComponent(Component):
    """Test component for testing purposes."""
    
    def __init__(self, value: int = 0):
        super().__init__()
        self.value = value


class TestSystem(System):
    """Test system for testing purposes."""
    
    def __init__(self):
        super().__init__()
        self.update_count = 0
        self.enabled = True
    
    def update(self, world: ECSWorld, delta_time: float) -> None:
        """Update the system."""
        self.update_count += 1


class TestEntity:
    """Test Entity class."""
    
    def test_entity_creation(self):
        """Test entity creation."""
        entity = Entity("test-entity-1")
        assert entity.id == "test-entity-1"
        assert len(entity.components) == 0
    
    def test_entity_add_component(self):
        """Test adding components to entity."""
        entity = Entity("test-entity-2")
        component = TestComponent(42)
        
        entity.add_component(component)
        assert len(entity.components) == 1
        assert entity.get_component(TestComponent) == component
    
    def test_entity_remove_component(self):
        """Test removing components from entity."""
        entity = Entity("test-entity-3")
        component = TestComponent(42)
        
        entity.add_component(component)
        assert len(entity.components) == 1
        
        entity.remove_component(TestComponent)
        assert len(entity.components) == 0
        assert entity.get_component(TestComponent) is None
    
    def test_entity_has_component(self):
        """Test checking if entity has component."""
        entity = Entity("test-entity-4")
        component = TestComponent(42)
        
        assert not entity.has_component(TestComponent)
        
        entity.add_component(component)
        assert entity.has_component(TestComponent)


class TestComponent:
    """Test Component class."""
    
    def test_component_creation(self):
        """Test component creation."""
        component = TestComponent(42)
        assert component.value == 42
    
    def test_component_inheritance(self):
        """Test component inheritance."""
        component = TestComponent(42)
        assert isinstance(component, Component)


class TestSystem:
    """Test System class."""
    
    def test_system_creation(self):
        """Test system creation."""
        system = TestSystem()
        assert system.update_count == 0
    
    def test_system_update(self):
        """Test system update."""
        system = TestSystem()
        world = ECSWorld()
        
        system.update(world, 1.0)
        assert system.update_count == 1
        
        system.update(world, 1.0)
        assert system.update_count == 2


class TestECSWorld:
    """Test ECSWorld class."""
    
    def test_world_creation(self):
        """Test world creation."""
        world = ECSWorld()
        assert len(world.entities) == 0
        assert len(world.systems) == 0
    
    def test_world_add_entity(self):
        """Test adding entities to world."""
        world = ECSWorld()
        entity = world.create_entity("test-entity-5")
        
        assert len(world.entities) == 1
        assert entity.id == "test-entity-5"
        assert world.get_entity("test-entity-5") == entity
    
    def test_world_remove_entity(self):
        """Test removing entities from world."""
        world = ECSWorld()
        entity = world.create_entity("test-entity-6")
        
        assert len(world.entities) == 1
        
        world.destroy_entity("test-entity-6")
        assert len(world.entities) == 0
    
    def test_world_add_system(self):
        """Test adding systems to world."""
        world = ECSWorld()
        system = TestSystem()
        
        world.add_system(system)
        assert len(world.systems) == 1
        assert system in world.systems
    
    def test_world_remove_system(self):
        """Test removing systems from world."""
        world = ECSWorld()
        system = TestSystem()
        
        world.add_system(system)
        assert len(world.systems) == 1
        
        world.remove_system(system)
        assert len(world.systems) == 0
    
    def test_world_update(self):
        """Test world update."""
        world = ECSWorld()
        system = TestSystem()
        
        world.add_system(system)
        world.update(1.0)
        
        assert system.update_count == 1
    
    def test_world_get_entities_with_components(self):
        """Test getting entities with specific components."""
        world = ECSWorld()
        
        entity1 = world.create_entity("test-entity-7")
        entity1.add_component(TestComponent(1))
        
        entity2 = world.create_entity("test-entity-8")
        entity2.add_component(TestComponent(2))
        
        entity3 = world.create_entity("test-entity-9")
        # No components
        
        entities_with_component = world.get_entities_with_components(TestComponent)
        assert len(entities_with_component) == 2
        assert entity1 in entities_with_component
        assert entity2 in entities_with_component
        assert entity3 not in entities_with_component
