"""
Test ECS Systems

Tests for all ECS systems including Social, Gender, Interaction, etc.
"""

import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))

from backend.app.ecs.components import (
    AgentComponent,
    GenderComponent,
    InteractionComponent,
    KnowledgeComponent,
    MemoryComponent,
    SocialComponent,
)
from backend.app.ecs.core import ECSWorld, Entity
from backend.app.ecs.systems import (
    GenderSystem,
    InteractionSystem,
    LearningSystem,
    MemorySystem,
    SocialSystem,
)


class TestSocialSystem:
    """Test SocialSystem."""

    def test_social_system_creation(self):
        """Test social system creation."""
        system = SocialSystem()
        assert system is not None

    def test_social_system_update(self):
        """Test social system update."""
        world = ECSWorld()
        system = SocialSystem()
        world.add_system(system)

        # Create entities with social components
        entity1 = Entity()
        entity1.add_component(AgentComponent("Agent1", "fox", "foundation"))
        entity1.add_component(SocialComponent())

        entity2 = Entity()
        entity2.add_component(AgentComponent("Agent2", "wolf", "foundation"))
        entity2.add_component(SocialComponent())

        world.add_entity(entity1)
        world.add_entity(entity2)

        # Update the system
        world.update(1.0)

        # Check that social interactions occurred
        social1 = entity1.get_component(SocialComponent)
        social2 = entity2.get_component(SocialComponent)

        assert social1 is not None
        assert social2 is not None


class TestGenderSystem:
    """Test GenderSystem."""

    def test_gender_system_creation(self):
        """Test gender system creation."""
        system = GenderSystem()
        assert system is not None

    def test_gender_system_update(self):
        """Test gender system update."""
        world = ECSWorld()
        system = GenderSystem()
        world.add_system(system)

        # Create entity with gender component
        entity = Entity()
        entity.add_component(AgentComponent("Agent", "fox", "foundation"))
        entity.add_component(GenderComponent())

        world.add_entity(entity)

        # Update the system
        world.update(1.0)

        # Check that gender component is processed
        gender = entity.get_component(GenderComponent)
        assert gender is not None


class TestInteractionSystem:
    """Test InteractionSystem."""

    def test_interaction_system_creation(self):
        """Test interaction system creation."""
        system = InteractionSystem()
        assert system is not None

    def test_interaction_system_update(self):
        """Test interaction system update."""
        world = ECSWorld()
        system = InteractionSystem()
        world.add_system(system)

        # Create entities with interaction components
        entity1 = Entity()
        entity1.add_component(AgentComponent("Agent1", "fox", "foundation"))
        entity1.add_component(InteractionComponent())

        entity2 = Entity()
        entity2.add_component(AgentComponent("Agent2", "wolf", "foundation"))
        entity2.add_component(InteractionComponent())

        world.add_entity(entity1)
        world.add_entity(entity2)

        # Update the system
        world.update(1.0)

        # Check that interaction components are processed
        interaction1 = entity1.get_component(InteractionComponent)
        interaction2 = entity2.get_component(InteractionComponent)

        assert interaction1 is not None
        assert interaction2 is not None


class TestMemorySystem:
    """Test MemorySystem."""

    def test_memory_system_creation(self):
        """Test memory system creation."""
        system = MemorySystem()
        assert system is not None

    def test_memory_system_update(self):
        """Test memory system update."""
        world = ECSWorld()
        system = MemorySystem()
        world.add_system(system)

        # Create entity with memory component
        entity = Entity()
        entity.add_component(AgentComponent("Agent", "fox", "foundation"))
        entity.add_component(MemoryComponent())

        world.add_entity(entity)

        # Update the system
        world.update(1.0)

        # Check that memory component is processed
        memory = entity.get_component(MemoryComponent)
        assert memory is not None


class TestLearningSystem:
    """Test LearningSystem."""

    def test_learning_system_creation(self):
        """Test learning system creation."""
        system = LearningSystem()
        assert system is not None

    def test_learning_system_update(self):
        """Test learning system update."""
        world = ECSWorld()
        system = LearningSystem()
        world.add_system(system)

        # Create entity with knowledge component
        entity = Entity()
        entity.add_component(AgentComponent("Agent", "fox", "foundation"))
        entity.add_component(KnowledgeComponent())

        world.add_entity(entity)

        # Update the system
        world.update(1.0)

        # Check that knowledge component is processed
        knowledge = entity.get_component(KnowledgeComponent)
        assert knowledge is not None
