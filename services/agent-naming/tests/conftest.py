"""
Pytest Configuration and Fixtures
=================================

Shared fixtures and configuration for the agent naming test suite.
"""

import json
import tempfile
from pathlib import Path

import pytest

from reynard_agent_naming.agent_naming.types import (
    AgentName,
    AnimalSpirit,
    NamingConfig,
    NamingScheme,
    NamingStyle,
)


@pytest.fixture
def temp_data_dir():
    """Create a temporary directory for test data."""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield Path(temp_dir)


@pytest.fixture
def sample_agent_names():
    """Sample agent names for testing."""
    return [
        "Vulpine-Sage-13",
        "Lupus-Guard-24",
        "Lutra-Splash-15",
        "Cyber-Fox-Nexus",
        "Atlas-Wolf-Divine",
        "Panthera-Leo-Alpha",
    ]


@pytest.fixture
def sample_agents_data():
    """Sample agents data for persistence testing."""
    return {
        "agent-001": {
            "name": "Vulpine-Sage-13",
            "assigned_at": 1640995200.0,
        },
        "agent-002": {
            "name": "Lupus-Guard-24",
            "assigned_at": 1640995260.0,
        },
        "agent-003": {
            "name": "Lutra-Splash-15",
            "assigned_at": 1640995320.0,
        },
    }


@pytest.fixture
def agents_file(temp_data_dir, sample_agents_data):
    """Create a temporary agents file with sample data."""
    agents_file = temp_data_dir / "agent-names.json"
    with agents_file.open("w", encoding="utf-8") as f:
        json.dump(sample_agents_data, f, indent=2)
    return agents_file


@pytest.fixture
def naming_configs():
    """Various naming configurations for testing."""
    return {
        "foundation_fox": NamingConfig(
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            count=1,
        ),
        "exo_wolf": NamingConfig(
            spirit=AnimalSpirit.WOLF,
            style=NamingStyle.EXO,
            count=3,
        ),
        "cyberpunk_otter": NamingConfig(
            spirit=AnimalSpirit.OTTER,
            style=NamingStyle.CYBERPUNK,
            count=2,
        ),
        "mythological_dragon": NamingConfig(
            spirit=AnimalSpirit.DRAGON,
            style=NamingStyle.MYTHOLOGICAL,
            count=1,
        ),
        "scientific_default": NamingConfig(
            style=NamingStyle.SCIENTIFIC,
            count=1,
        ),
        "hybrid_lion": NamingConfig(
            spirit=AnimalSpirit.LION,
            style=NamingStyle.HYBRID,
            count=1,
        ),
        "random_style": NamingConfig(
            spirit=AnimalSpirit.EAGLE,
            count=1,
        ),
        "batch_generation": NamingConfig(
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            count=5,
        ),
    }


@pytest.fixture
def all_animal_spirits():
    """All available animal spirits for testing."""
    return list(AnimalSpirit)


@pytest.fixture
def all_naming_styles():
    """All available naming styles for testing."""
    return list(NamingStyle)


@pytest.fixture
def all_naming_schemes():
    """All available naming schemes for testing."""
    return list(NamingScheme)


@pytest.fixture
def sample_agent_name():
    """Sample AgentName object for testing."""
    return AgentName(
        name="Vulpine-Sage-13",
        spirit=AnimalSpirit.FOX,
        style=NamingStyle.FOUNDATION,
        components=["Vulpine", "Sage", "13"],
        generation_number=13,
    )


@pytest.fixture
def mock_ecs_world():
    """Mock ECS world simulation for testing."""

    class MockECSWorld:
        def __init__(self, data_dir):
            self.data_dir = data_dir
            self.agents = {}
            self.time = 0.0
            self.time_acceleration = 10.0

        def create_agent_with_inheritance(
            self, agent_id, spirit, style, name, parent1_id, parent2_id
        ):
            class MockEntity:
                def __init__(self, agent_id):
                    self.id = agent_id
                    self.components = {}

                def get_component(self, component_type):
                    class MockAgentComponent:
                        def __init__(self, name):
                            self.name = name

                    return MockAgentComponent(name or f"Mock-{agent_id}")

            entity = MockEntity(agent_id)
            self.agents[agent_id] = {
                "spirit": spirit,
                "style": style,
                "name": name or f"Mock-{agent_id}",
                "parent1": parent1_id,
                "parent2": parent2_id,
            }
            return entity

        def get_agent_persona(self, agent_id):
            return {
                "agent_id": agent_id,
                "personality_traits": ["cunning", "intelligent", "strategic"],
                "communication_style": "formal",
                "specializations": ["planning", "analysis"],
            }

        def get_lora_config(self, agent_id):
            return {
                "base_model": "reynard-agent-base",
                "lora_rank": 16,
                "lora_alpha": 32,
                "target_modules": ["q_proj", "v_proj", "k_proj", "o_proj"],
            }

        def nudge_time(self, amount):
            self.time += amount

        def update_simulation(self, delta_time=None):
            if delta_time:
                self.time += delta_time * self.time_acceleration

        def accelerate_time(self, factor):
            self.time_acceleration = factor

        def get_simulation_status(self):
            return {
                "simulation_time": self.time,
                "time_acceleration": self.time_acceleration,
                "total_agents": len(self.agents),
                "ecs_available": True,
            }

    return MockECSWorld


@pytest.fixture
def expected_name_patterns():
    """Expected name patterns for different styles."""
    return {
        NamingStyle.FOUNDATION: r"^[A-Za-z]+-[A-Za-z]+-\d+$",
        NamingStyle.EXO: r"^[A-Za-z]+-[A-Za-z]+-\d+$",
        NamingStyle.CYBERPUNK: r"^[A-Za-z]+-[A-Za-z]+-[A-Za-z]+$",
        NamingStyle.MYTHOLOGICAL: r"^[A-Za-z]+-[A-Za-z]+-[A-Za-z]+$",
        NamingStyle.SCIENTIFIC: r"^[A-Za-z]+-[A-Za-z]+-[A-Za-z0-9-]+$",
        NamingStyle.HYBRID: r"^[A-Za-z]+-[A-Za-z]+-[A-Za-z]+$",
    }


@pytest.fixture
def spirit_weights():
    """Expected spirit weights for weighted distribution."""
    return {
        AnimalSpirit.FOX: 0.4,  # 40%
        AnimalSpirit.OTTER: 0.35,  # 35%
        AnimalSpirit.WOLF: 0.25,  # 25%
    }


@pytest.fixture
def generation_numbers():
    """Expected generation numbers for different spirits."""
    return {
        "fox": [3, 7, 13, 21, 34, 55, 89],
        "wolf": [8, 16, 24, 32, 40, 48, 56],
        "otter": [5, 10, 15, 20, 25, 30, 35],
        "dragon": [1, 2, 4, 8, 16, 32, 64],
        "phoenix": [7, 14, 21, 28, 35, 42, 49],
        "eagle": [12, 24, 36, 48, 60, 72, 84],
        "lion": [1, 2, 3, 5, 8, 13, 21],
        "tiger": [9, 18, 27, 36, 45, 54, 63],
    }
