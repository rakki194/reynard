"""Test ECS Systems

Tests for all ECS systems including Social, Gender, Interaction, etc.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))

from backend.app.ecs.components import (
    AgentComponent,
    GenderComponent,
    InteractionComponent,
    KnowledgeComponent,
    MemoryComponent,
    SocialComponent,
)
from backend.app.ecs.core import ECSWorld
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
        world = ECSWorld()
        system = SocialSystem(world)
        assert system is not None

    def test_social_system_update(self):
        """Test social system update."""
        world = ECSWorld()
        system = SocialSystem(world)
        world.add_system(system)

        # Create entities with social components
        entity1 = world.create_entity("agent1")
        entity1.add_component(AgentComponent("Agent1", "fox", "foundation"))
        entity1.add_component(SocialComponent())

        entity2 = world.create_entity("agent2")
        entity2.add_component(AgentComponent("Agent2", "wolf", "foundation"))
        entity2.add_component(SocialComponent())

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
        world = ECSWorld()
        system = GenderSystem(world)
        assert system is not None

    def test_gender_system_update(self):
        """Test gender system update."""
        world = ECSWorld()
        system = GenderSystem(world)
        world.add_system(system)

        # Create entity with gender component
        entity = world.create_entity("agent")
        entity.add_component(AgentComponent("Agent", "fox", "foundation"))
        from backend.app.ecs.components.gender import GenderIdentity, GenderProfile

        profile = GenderProfile(primary_identity=GenderIdentity.NON_BINARY)
        entity.add_component(GenderComponent(profile=profile))

        # Update the system
        world.update(1.0)

        # Check that gender component is processed
        gender = entity.get_component(GenderComponent)
        assert gender is not None


class TestInteractionSystem:
    """Test InteractionSystem."""

    def test_interaction_system_creation(self):
        """Test interaction system creation."""
        world = ECSWorld()
        system = InteractionSystem(world)
        assert system is not None

    def test_interaction_system_update(self):
        """Test interaction system update."""
        world = ECSWorld()
        system = InteractionSystem(world)
        world.add_system(system)

        # Create entities with interaction components
        entity1 = world.create_entity("agent1")
        entity1.add_component(AgentComponent("Agent1", "fox", "foundation"))
        entity1.add_component(InteractionComponent())

        entity2 = world.create_entity("agent2")
        entity2.add_component(AgentComponent("Agent2", "wolf", "foundation"))
        entity2.add_component(InteractionComponent())

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
        world = ECSWorld()
        system = MemorySystem(world)
        assert system is not None

    def test_memory_system_update(self):
        """Test memory system update."""
        world = ECSWorld()
        system = MemorySystem(world)
        world.add_system(system)

        # Create entity with memory component
        entity = world.create_entity("agent")
        entity.add_component(AgentComponent("Agent", "fox", "foundation"))
        entity.add_component(MemoryComponent())

        # Update the system
        world.update(1.0)

        # Check that memory component is processed
        memory = entity.get_component(MemoryComponent)
        assert memory is not None


class TestLearningSystem:
    """Test LearningSystem."""

    def test_learning_system_creation(self):
        """Test learning system creation."""
        world = ECSWorld()
        system = LearningSystem(world)
        assert system is not None

    def test_learning_system_update(self):
        """Test learning system update."""
        world = ECSWorld()
        system = LearningSystem(world)
        world.add_system(system)

        # Create entity with knowledge component
        entity = world.create_entity("agent")
        entity.add_component(AgentComponent("Agent", "fox", "foundation"))
        entity.add_component(KnowledgeComponent())

        # Update the system
        world.update(1.0)

        # Check that knowledge component is processed
        knowledge = entity.get_component(KnowledgeComponent)
        assert knowledge is not None
