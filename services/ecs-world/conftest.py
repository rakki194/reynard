"""
Pytest configuration and fixtures for ECS Memory & Interaction System tests.
"""

import pytest
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any

from reynard_ecs_world.world.agent_world import AgentWorld
from reynard_ecs_world.components import (
    MemoryType,
    InteractionType,
    CommunicationStyle,
    KnowledgeType,
    GroupType,
    GenderIdentity,
    GenderExpression,
)


@pytest.fixture
def agent_world():
    """Create a fresh AgentWorld instance for testing."""
    return AgentWorld()


@pytest.fixture
def sample_agents(agent_world):
    """Create a set of sample agents for testing."""
    agents = {}
    spirits = ["fox", "wolf", "otter"]
    styles = ["foundation", "exo", "hybrid"]
    
    for i in range(5):
        agent_id = f"test-agent-{i}"
        spirit = random.choice(spirits)
        style = random.choice(styles)
        agent = agent_world.create_agent(agent_id, spirit=spirit, style=style)
        agents[agent_id] = agent
    
    return agents


@pytest.fixture
def diverse_agents(agent_world):
    """Create agents with diverse gender identities for testing."""
    agents = {}
    gender_identities = [
        GenderIdentity.MALE,
        GenderIdentity.FEMALE,
        GenderIdentity.NON_BINARY,
        GenderIdentity.GENDERFLUID,
        GenderIdentity.AGENDER
    ]
    
    for i, gender in enumerate(gender_identities):
        agent_id = f"diverse-agent-{i}"
        agent = agent_world.create_agent(agent_id, spirit="fox", style="foundation")
        agent_world.update_gender_identity(agent_id, gender)
        agents[agent_id] = agent
    
    return agents


@pytest.fixture
def memory_test_data():
    """Sample memory data for testing."""
    return {
        "episodic": {
            "content": "Met a new agent during exploration",
            "importance": 0.8,
            "emotional_weight": 0.7,
            "associated_agents": ["agent-2"]
        },
        "semantic": {
            "content": "Learned about foraging techniques",
            "importance": 0.6,
            "emotional_weight": 0.3,
            "associated_agents": []
        },
        "procedural": {
            "content": "Mastered the art of stealth movement",
            "importance": 0.9,
            "emotional_weight": 0.5,
            "associated_agents": []
        }
    }


@pytest.fixture
def interaction_test_data():
    """Sample interaction data for testing."""
    return {
        "communication": {
            "agent1_id": "test-agent-1",
            "agent2_id": "test-agent-2",
            "interaction_type": InteractionType.COMMUNICATION
        },
        "collaboration": {
            "agent1_id": "test-agent-1",
            "agent2_id": "test-agent-3",
            "interaction_type": InteractionType.COLLABORATION
        },
        "teaching": {
            "agent1_id": "test-agent-2",
            "agent2_id": "test-agent-4",
            "interaction_type": InteractionType.TEACHING
        }
    }


@pytest.fixture
def knowledge_test_data():
    """Sample knowledge data for testing."""
    return {
        "factual": {
            "title": "Advanced Foraging Techniques",
            "knowledge_type": KnowledgeType.FACTUAL,
            "description": "Efficient methods for finding food in diverse environments",
            "proficiency": 0.9,
            "importance": 0.9
        },
        "procedural": {
            "title": "Stealth Movement",
            "knowledge_type": KnowledgeType.PROCEDURAL,
            "description": "How to move silently and avoid detection",
            "proficiency": 0.8,
            "importance": 0.7
        },
        "conceptual": {
            "title": "Social Dynamics Theory",
            "knowledge_type": KnowledgeType.CONCEPTUAL,
            "description": "Understanding group behavior and social structures",
            "proficiency": 0.6,
            "importance": 0.8
        }
    }


@pytest.fixture
def social_group_data():
    """Sample social group data for testing."""
    return {
        "study_group": {
            "creator_id": "test-agent-1",
            "name": "Study Group",
            "group_type": GroupType.COMMUNITY,
            "member_ids": ["test-agent-1", "test-agent-2", "test-agent-3"]
        },
        "friendship_circle": {
            "creator_id": "test-agent-2",
            "name": "Friendship Circle",
            "group_type": GroupType.FRIENDSHIP,
            "member_ids": ["test-agent-2", "test-agent-4", "test-agent-0"]
        }
    }


@pytest.fixture
def gender_test_data():
    """Sample gender identity data for testing."""
    return {
        "male_profile": {
            "agent_id": "test-agent-1",
            "identity": GenderIdentity.MALE,
            "expression": GenderExpression.MASCULINE
        },
        "non_binary_profile": {
            "agent_id": "test-agent-2",
            "identity": GenderIdentity.NON_BINARY,
            "expression": GenderExpression.ANDROGYNOUS
        },
        "genderfluid_profile": {
            "agent_id": "test-agent-3",
            "identity": GenderIdentity.GENDERFLUID,
            "expression": GenderExpression.FLUID
        }
    }


@pytest.fixture(scope="session")
def performance_test_agents():
    """Create a large number of agents for performance testing."""
    world = AgentWorld()
    agents = {}
    
    # Create 100 agents for performance testing
    for i in range(100):
        agent_id = f"perf-agent-{i}"
        spirit = random.choice(["fox", "wolf", "otter"])
        style = random.choice(["foundation", "exo", "hybrid"])
        agent = world.create_agent(agent_id, spirit=spirit, style=style)
        
        # Assign random gender identity
        gender = random.choice(list(GenderIdentity))
        world.update_gender_identity(agent_id, gender)
        
        agents[agent_id] = agent
    
    return world, agents


@pytest.fixture
def mock_time():
    """Mock datetime for consistent testing."""
    return datetime(2025, 1, 27, 12, 0, 0)


@pytest.fixture
def random_seed():
    """Set random seed for reproducible tests."""
    random.seed(42)
    return 42


# Test markers for different test categories
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "unit: Unit tests for individual components"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests for system interactions"
    )
    config.addinivalue_line(
        "markers", "performance: Performance tests with large datasets"
    )
    config.addinivalue_line(
        "markers", "mcp: Tests for MCP tool integration"
    )
    config.addinivalue_line(
        "markers", "slow: Tests that take longer to run"
    )


# Helper functions for tests
def create_test_memory(content: str, memory_type: MemoryType, importance: float = 0.5) -> Dict[str, Any]:
    """Helper to create test memory data."""
    return {
        "content": content,
        "memory_type": memory_type,
        "importance": importance,
        "emotional_weight": 0.5,
        "associated_agents": []
    }


def create_test_knowledge(title: str, knowledge_type: KnowledgeType, proficiency: float = 0.5) -> Dict[str, Any]:
    """Helper to create test knowledge data."""
    return {
        "title": title,
        "knowledge_type": knowledge_type,
        "description": f"Description for {title}",
        "proficiency": proficiency,
        "importance": 0.5
    }


def assert_agent_exists(world: AgentWorld, agent_id: str) -> None:
    """Assert that an agent exists in the world."""
    assert world.get_agent(agent_id) is not None, f"Agent {agent_id} should exist"


def assert_agent_has_component(world: AgentWorld, agent_id: str, component_type: type) -> None:
    """Assert that an agent has a specific component."""
    agent = world.get_agent(agent_id)
    assert agent is not None, f"Agent {agent_id} should exist"
    assert agent.has_component(component_type), f"Agent {agent_id} should have {component_type.__name__} component"
