"""
Test ECS Components

Tests for all ECS components including Agent, Social, Gender, etc.
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
    LifecycleComponent,
    LineageComponent,
    MemoryComponent,
    PositionComponent,
    ReproductionComponent,
    SocialComponent,
    TraitComponent,
)


class TestAgentComponent:
    """Test AgentComponent."""

    def test_agent_component_creation(self):
        """Test agent component creation."""
        agent = AgentComponent(name="TestAgent", spirit="fox", style="foundation")

        assert agent.name == "TestAgent"
        assert agent.spirit == "fox"
        assert agent.style == "foundation"
        assert agent.created_at is not None


class TestPositionComponent:
    """Test PositionComponent."""

    def test_position_component_creation(self):
        """Test position component creation."""
        position = PositionComponent(x=10.0, y=20.0)

        assert position.x == 10.0
        assert position.y == 20.0
        assert position.target_x == 10.0
        assert position.target_y == 20.0
        assert position.velocity_x == 0.0
        assert position.velocity_y == 0.0
        assert position.movement_speed == 1.0


class TestLifecycleComponent:
    """Test LifecycleComponent."""

    def test_lifecycle_component_creation(self):
        """Test lifecycle component creation."""
        lifecycle = LifecycleComponent()

        assert lifecycle.age == 0.0
        assert lifecycle.maturity_age == 18.0
        assert lifecycle.is_mature() is False
        assert lifecycle.life_stage == "infant"
        assert lifecycle.max_age == 100.0


class TestLineageComponent:
    """Test LineageComponent."""

    def test_lineage_component_creation(self):
        """Test lineage component creation."""
        lineage = LineageComponent()

        assert len(lineage.parents) == 0
        assert len(lineage.children) == 0
        assert len(lineage.ancestors) == 0
        assert len(lineage.descendants) == 0
        assert lineage.generation == 1


class TestReproductionComponent:
    """Test ReproductionComponent."""

    def test_reproduction_component_creation(self):
        """Test reproduction component creation."""
        reproduction = ReproductionComponent()

        assert reproduction.can_reproduce is False
        assert reproduction.reproduction_cooldown == 0.0
        assert reproduction.max_cooldown == 30.0
        assert reproduction.offspring_count == 0
        assert reproduction.max_offspring == 5


class TestTraitComponent:
    """Test TraitComponent."""

    def test_trait_component_creation(self):
        """Test trait component creation."""
        traits = TraitComponent()

        assert isinstance(traits.personality, dict)
        assert isinstance(traits.physical, dict)
        assert isinstance(traits.abilities, dict)
        assert traits.spirit == "fox"
        assert traits.style == "foundation"


class TestSocialComponent:
    """Test SocialComponent."""

    def test_social_component_creation(self):
        """Test social component creation."""
        social = SocialComponent()

        assert len(social.social_network) == 0
        assert len(social.group_memberships) == 0
        assert len(social.leadership_roles) == 0
        assert social.social_influence == 0.0


class TestGenderComponent:
    """Test GenderComponent."""

    def test_gender_component_creation(self):
        """Test gender component creation."""
        from backend.app.ecs.components.gender import GenderIdentity, GenderProfile

        profile = GenderProfile(primary_identity=GenderIdentity.NON_BINARY)
        gender = GenderComponent(profile)

        assert gender.profile is not None
        assert gender.profile.primary_identity == GenderIdentity.NON_BINARY
        assert gender.gender_energy == 1.0
        assert gender.expression_confidence == 1.0


class TestMemoryComponent:
    """Test MemoryComponent."""

    def test_memory_component_creation(self):
        """Test memory component creation."""
        memory = MemoryComponent()

        assert len(memory.memories) == 0
        assert memory.memory_capacity == 1000
        assert memory.memory_decay_rate == 0.01
        assert memory.importance_threshold == 0.5
        assert memory.consolidation_threshold == 0.8


class TestKnowledgeComponent:
    """Test KnowledgeComponent."""

    def test_knowledge_component_creation(self):
        """Test knowledge component creation."""
        knowledge = KnowledgeComponent()

        assert len(knowledge.knowledge) == 0
        assert knowledge.learning_rate == 1.0
        assert knowledge.teaching_effectiveness == 1.0
        assert knowledge.knowledge_capacity == 500


class TestInteractionComponent:
    """Test InteractionComponent."""

    def test_interaction_component_creation(self):
        """Test interaction component creation."""
        interaction = InteractionComponent()

        assert len(interaction.interactions) == 0
        assert len(interaction.relationships) == 0
        assert interaction.preferred_communication_style.value == "casual"
        assert interaction.social_energy == 1.0
        assert interaction.max_social_energy == 1.0
