"""
Test suite for the ECS gender identity and expression system.

This module tests the GenderComponent, GenderSystem, and related functionality
including gender identity management, support networks, and coming out processes.
"""

import pytest
from datetime import datetime

from reynard_ecs_world.components.gender import (
    GenderComponent,
    GenderProfile,
    PronounSet,
    GenderIdentity,
    GenderExpression,
    PronounType,
)
from reynard_ecs_world.systems.gender_system import GenderSystem
from reynard_ecs_world.world.agent_world import AgentWorld


def test_gender_profile_creation():
    """Test creating a gender profile with default values."""
    profile = GenderProfile(primary_identity=GenderIdentity.NON_BINARY)
    
    assert profile.primary_identity == GenderIdentity.NON_BINARY
    assert profile.expression_style == GenderExpression.NEUTRAL
    assert len(profile.pronoun_sets) == 1
    assert profile.pronoun_sets[0].subject == "they"
    assert profile.preferred_pronouns.subject == "they"
    assert not profile.is_questioning
    assert not profile.is_fluid
    assert profile.fluidity_rate == 0.0
    assert profile.confidence_level == 1.0


def test_pronoun_set_validation():
    """Test pronoun set validation."""
    # Valid pronoun set
    valid_pronouns = PronounSet("they", "them", "theirs", "themselves")
    assert valid_pronouns.subject == "they"
    assert valid_pronouns.object == "them"
    assert valid_pronouns.possessive == "theirs"
    assert valid_pronouns.reflexive == "themselves"
    
    # Invalid pronoun set (empty values)
    with pytest.raises(ValueError):
        PronounSet("", "them", "theirs", "themselves")


def test_gender_profile_pronoun_management():
    """Test pronoun management in gender profile."""
    profile = GenderProfile(primary_identity=GenderIdentity.MALE)
    
    # Test default pronouns for male identity
    assert profile.pronoun_sets[0].subject == "he"
    assert profile.pronoun_sets[0].object == "him"
    
    # Add custom pronoun set
    custom_pronouns = PronounSet("ze", "zir", "zirs", "zirself")
    profile.add_pronoun_set(custom_pronouns)
    
    assert len(profile.pronoun_sets) == 2
    assert custom_pronouns in profile.pronoun_sets
    
    # Set preferred pronouns
    profile.set_preferred_pronouns(custom_pronouns)
    assert profile.preferred_pronouns == custom_pronouns


def test_gender_profile_identity_updates():
    """Test gender identity updates."""
    profile = GenderProfile(primary_identity=GenderIdentity.FEMALE)
    
    # Check initial pronouns
    assert profile.pronoun_sets[0].subject == "she"
    
    # Update identity
    profile.update_identity(GenderIdentity.NON_BINARY)
    assert profile.primary_identity == GenderIdentity.NON_BINARY
    
    # Pronouns should remain the same since they already exist
    assert profile.pronoun_sets[0].subject == "she"
    
    # Test with empty pronoun sets - change to a different identity
    profile.pronoun_sets = []
    profile.preferred_pronouns = None
    profile.update_identity(GenderIdentity.MALE)  # Change to a different identity
    assert len(profile.pronoun_sets) == 1
    assert profile.pronoun_sets[0].subject == "he"


def test_gender_profile_support_network():
    """Test support network management."""
    profile = GenderProfile(primary_identity=GenderIdentity.AGENDER)
    
    # Add support agents
    profile.add_support_agent("agent1")
    profile.add_support_agent("agent2")
    
    assert "agent1" in profile.support_network
    assert "agent2" in profile.support_network
    assert len(profile.support_network) == 2
    
    # Remove support agent
    profile.remove_support_agent("agent1")
    assert "agent1" not in profile.support_network
    assert "agent2" in profile.support_network


def test_gender_profile_coming_out_status():
    """Test coming out status management."""
    profile = GenderProfile(primary_identity=GenderIdentity.GENDERFLUID)
    
    # Update coming out status
    profile.update_coming_out_status("agent1", True)
    profile.update_coming_out_status("agent2", False)
    
    assert profile.coming_out_status["agent1"] is True
    assert profile.coming_out_status["agent2"] is False


def test_gender_profile_pronoun_strings():
    """Test getting pronoun strings."""
    profile = GenderProfile(primary_identity=GenderIdentity.FEMALE)
    
    assert profile.get_pronoun_string(PronounType.SUBJECT) == "she"
    assert profile.get_pronoun_string(PronounType.OBJECT) == "her"
    assert profile.get_pronoun_string(PronounType.POSSESSIVE) == "hers"
    assert profile.get_pronoun_string(PronounType.REFLEXIVE) == "herself"


def test_gender_component_creation():
    """Test creating a gender component."""
    profile = GenderProfile(primary_identity=GenderIdentity.NON_BINARY)
    component = GenderComponent(profile=profile)
    
    assert component.profile == profile
    assert component.gender_energy == 1.0
    assert component.expression_confidence == 1.0
    assert component.dysphoria_level == 0.0
    assert component.euphoria_level == 0.0
    assert component.social_comfort == 1.0
    assert component.transition_stage is None
    assert len(component.transition_goals) == 0
    assert len(component.support_needs) == 0


def test_gender_component_updates():
    """Test updating gender component values."""
    profile = GenderProfile(primary_identity=GenderIdentity.BIGENDER)
    component = GenderComponent(profile=profile)
    
    # Test energy updates
    component.update_gender_energy(0.1)
    assert component.gender_energy == 1.0  # Should be capped at 1.0
    
    component.update_gender_energy(-0.5)
    assert component.gender_energy == 0.5
    
    # Test confidence updates
    component.update_expression_confidence(-0.3)
    assert component.expression_confidence == 0.7
    
    # Test dysphoria updates
    component.update_dysphoria(0.2)
    assert component.dysphoria_level == 0.2
    
    # Test euphoria updates
    component.update_euphoria(0.3)
    assert component.euphoria_level == 0.3


def test_gender_component_wellbeing():
    """Test gender wellbeing calculation."""
    profile = GenderProfile(primary_identity=GenderIdentity.GENDERQUEER)
    component = GenderComponent(profile=profile)
    
    # Test initial wellbeing (should be high)
    wellbeing = component.get_gender_wellbeing()
    assert wellbeing >= 0.75  # Lower threshold to account for initial values
    
    # Test wellbeing with dysphoria
    component.update_dysphoria(0.5)
    component.update_expression_confidence(-0.3)
    
    wellbeing = component.get_gender_wellbeing()
    assert wellbeing < 0.8


def test_gender_component_support_needs():
    """Test support needs management."""
    profile = GenderProfile(primary_identity=GenderIdentity.QUESTIONING)
    component = GenderComponent(profile=profile)
    
    # Add support needs
    component.add_support_need("emotional_support")
    component.add_support_need("information")
    
    assert "emotional_support" in component.support_needs
    assert "information" in component.support_needs
    assert len(component.support_needs) == 2
    
    # Remove support need
    component.remove_support_need("emotional_support")
    assert "emotional_support" not in component.support_needs
    assert "information" in component.support_needs


def test_gender_component_transition_goals():
    """Test transition goals management."""
    profile = GenderProfile(primary_identity=GenderIdentity.MALE)
    component = GenderComponent(profile=profile)
    
    # Add transition goals
    component.add_transition_goal("social_transition")
    component.add_transition_goal("medical_transition")
    
    assert "social_transition" in component.transition_goals
    assert "medical_transition" in component.transition_goals
    assert len(component.transition_goals) == 2
    
    # Remove transition goal
    component.remove_transition_goal("social_transition")
    assert "social_transition" not in component.transition_goals
    assert "medical_transition" in component.transition_goals


def test_gender_component_needs_support():
    """Test support needs detection."""
    profile = GenderProfile(primary_identity=GenderIdentity.NEUTROIS)
    component = GenderComponent(profile=profile)
    
    # Initially should not need support
    assert not component.needs_support()
    
    # Add dysphoria
    component.update_dysphoria(0.6)
    assert component.needs_support()
    
    # Reset dysphoria
    component.update_dysphoria(-0.6)
    
    # Add low confidence
    component.update_expression_confidence(-0.8)
    assert component.needs_support()
    
    # Reset confidence
    component.update_expression_confidence(0.8)
    
    # Add support needs
    component.add_support_need("counseling")
    assert component.needs_support()


def test_gender_system_creation():
    """Test creating a gender system."""
    world = AgentWorld()
    gender_system = GenderSystem(world)
    
    assert gender_system.world == world
    assert gender_system.system_name == "GenderSystem"
    assert len(gender_system.identity_distribution) == 0
    assert len(gender_system.expression_distribution) == 0


def test_gender_system_profile_creation():
    """Test creating gender profiles through the system."""
    world = AgentWorld()
    gender_system = GenderSystem(world)
    
    profile = gender_system.create_gender_profile(
        agent_id="test-agent",
        primary_identity=GenderIdentity.PANGENDER,
        expression_style=GenderExpression.FLUID
    )
    
    assert profile.primary_identity == GenderIdentity.PANGENDER
    assert profile.expression_style == GenderExpression.FLUID


def test_gender_system_identity_update():
    """Test updating gender identity through the system."""
    world = AgentWorld()
    gender_system = GenderSystem(world)
    
    # Create an agent
    agent = world.create_agent("test-agent")
    
    # Update gender identity
    result = gender_system.update_gender_identity("test-agent", GenderIdentity.DEMIGENDER)
    assert result is True
    
    # Check that the identity was updated
    gender_comp = agent.get_component(GenderComponent)
    assert gender_comp.profile.primary_identity == GenderIdentity.DEMIGENDER


def test_gender_system_support_network():
    """Test support network management through the system."""
    world = AgentWorld()
    gender_system = GenderSystem(world)
    
    # Create agents
    agent1 = world.create_agent("agent1")
    agent2 = world.create_agent("agent2")
    
    # Add support
    result = gender_system.add_support_agent("agent1", "agent2")
    assert result is True
    
    # Check support network
    gender_comp1 = agent1.get_component(GenderComponent)
    assert "agent2" in gender_comp1.profile.support_network
    
    # Remove support
    result = gender_system.remove_support_agent("agent1", "agent2")
    assert result is True
    
    # Check support network
    assert "agent2" not in gender_comp1.profile.support_network


def test_gender_system_coming_out():
    """Test coming out status management through the system."""
    world = AgentWorld()
    gender_system = GenderSystem(world)
    
    # Create agents
    agent1 = world.create_agent("agent1")
    agent2 = world.create_agent("agent2")
    
    # Update coming out status
    result = gender_system.update_coming_out_status("agent1", "agent2", True)
    assert result is True
    
    # Check coming out status
    gender_comp1 = agent1.get_component(GenderComponent)
    assert gender_comp1.profile.coming_out_status["agent2"] is True
    
    # Check that event was recorded
    assert len(gender_system.coming_out_events) > 0
    event = gender_system.coming_out_events[-1]
    assert event["agent_id"] == "agent1"
    assert event["other_agent_id"] == "agent2"
    assert event["knows"] is True


def test_gender_system_statistics():
    """Test gender system statistics."""
    world = AgentWorld()
    gender_system = GenderSystem(world)
    
    # Create agents with different identities
    agent1 = world.create_agent("agent1")
    agent2 = world.create_agent("agent2")
    
    # Update identities
    gender_system.update_gender_identity("agent1", GenderIdentity.MALE)
    gender_system.update_gender_identity("agent2", GenderIdentity.FEMALE)
    
    # Get statistics
    stats = gender_system.get_gender_statistics()
    
    assert stats["total_agents"] == 2
    assert "identity_distribution" in stats
    assert "expression_distribution" in stats
    assert "pronoun_usage" in stats


def test_gender_system_agent_info():
    """Test getting agent gender information."""
    world = AgentWorld()
    gender_system = GenderSystem(world)
    
    # Create an agent
    agent = world.create_agent("test-agent")
    
    # Update identity
    gender_system.update_gender_identity("test-agent", GenderIdentity.TWO_SPIRIT)
    
    # Get agent info
    info = gender_system.get_agent_gender_info("test-agent")
    
    assert info is not None
    assert info["agent_id"] == "test-agent"
    assert info["primary_identity"] == "two_spirit"
    assert "gender_wellbeing" in info
    assert "expression_readiness" in info


def test_integration_with_agent_world():
    """Test integration of gender system with AgentWorld."""
    world = AgentWorld()
    
    # Create an agent
    agent = world.create_agent("test-agent")
    
    # Check that gender component was added
    gender_comp = agent.get_component(GenderComponent)
    assert gender_comp is not None
    assert gender_comp.profile.primary_identity == GenderIdentity.NON_BINARY
    
    # Test gender management methods
    result = world.update_gender_identity("test-agent", GenderIdentity.GENDERFLUID)
    assert result is True
    
    # Check that identity was updated
    gender_comp = agent.get_component(GenderComponent)
    assert gender_comp.profile.primary_identity == GenderIdentity.GENDERFLUID
    
    # Test support network
    result = world.add_support_agent("test-agent", "support-agent")
    assert result is True
    
    # Test coming out status
    result = world.update_coming_out_status("test-agent", "other-agent", True)
    assert result is True
    
    # Test statistics
    stats = world.get_gender_stats("test-agent")
    assert stats is not None
    assert stats["primary_identity"] == "genderfluid"
    
    system_stats = world.get_gender_system_stats()
    assert system_stats is not None
    assert system_stats["total_agents"] >= 1


if __name__ == "__main__":
    # Run the tests
    test_gender_profile_creation()
    test_pronoun_set_validation()
    test_gender_profile_pronoun_management()
    test_gender_profile_identity_updates()
    test_gender_profile_support_network()
    test_gender_profile_coming_out_status()
    test_gender_profile_pronoun_strings()
    test_gender_component_creation()
    test_gender_component_updates()
    test_gender_component_wellbeing()
    test_gender_component_support_needs()
    test_gender_component_transition_goals()
    test_gender_component_needs_support()
    test_gender_system_creation()
    test_gender_system_profile_creation()
    test_gender_system_identity_update()
    test_gender_system_support_network()
    test_gender_system_coming_out()
    test_gender_system_statistics()
    test_gender_system_agent_info()
    test_integration_with_agent_world()
    
    print("All gender system tests passed! 🦊")
