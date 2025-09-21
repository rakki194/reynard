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
        assert lifecycle.is_mature is False
        assert lifecycle.is_alive is True


class TestLineageComponent:
    """Test LineageComponent."""

    def test_lineage_component_creation(self):
        """Test lineage component creation."""
        lineage = LineageComponent()

        assert lineage.parent1_id is None
        assert lineage.parent2_id is None
        assert len(lineage.children_ids) == 0
        assert lineage.generation == 0


class TestReproductionComponent:
    """Test ReproductionComponent."""

    def test_reproduction_component_creation(self):
        """Test reproduction component creation."""
        reproduction = ReproductionComponent()

        assert reproduction.is_ready_to_breed is False
        assert reproduction.last_breeding_time == 0.0
        assert reproduction.breeding_cooldown == 24.0
        assert reproduction.offspring_count == 0


class TestTraitComponent:
    """Test TraitComponent."""

    def test_trait_component_creation(self):
        """Test trait component creation."""
        traits = TraitComponent()

        assert len(traits.personality_traits) == 16
        assert len(traits.physical_traits) == 12
        assert len(traits.ability_traits) == 16

        # Check that all traits are initialized with default values
        for trait in traits.personality_traits.values():
            assert 0.0 <= trait <= 1.0


class TestSocialComponent:
    """Test SocialComponent."""

    def test_social_component_creation(self):
        """Test social component creation."""
        social = SocialComponent()

        assert social.social_level == 0.5
        assert social.charisma == 0.5
        assert social.leadership == 0.5
        assert len(social.relationships) == 0
        assert social.group_id is None


class TestGenderComponent:
    """Test GenderComponent."""

    def test_gender_component_creation(self):
        """Test gender component creation."""
        gender = GenderComponent()

        assert gender.identity is not None
        assert gender.expression is not None
        assert gender.attraction is not None
        assert gender.pronouns is not None
        assert gender.preferences is not None


class TestMemoryComponent:
    """Test MemoryComponent."""

    def test_memory_component_creation(self):
        """Test memory component creation."""
        memory = MemoryComponent()

        assert len(memory.memories) == 0
        assert memory.memory_capacity == 1000
        assert memory.retention_rate == 0.95


class TestKnowledgeComponent:
    """Test KnowledgeComponent."""

    def test_knowledge_component_creation(self):
        """Test knowledge component creation."""
        knowledge = KnowledgeComponent()

        assert len(knowledge.knowledge) == 0
        assert knowledge.learning_rate == 0.1
        assert knowledge.retention_rate == 0.9
        assert len(knowledge.learning_opportunities) == 0


class TestInteractionComponent:
    """Test InteractionComponent."""

    def test_interaction_component_creation(self):
        """Test interaction component creation."""
        interaction = InteractionComponent()

        assert len(interaction.interactions) == 0
        assert len(interaction.relationships) == 0
        assert interaction.communication_style == "neutral"
        assert interaction.social_preference == "balanced"
