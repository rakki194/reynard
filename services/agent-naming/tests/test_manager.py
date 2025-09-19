"""
Tests for Manager Module
=======================

Comprehensive tests for the AgentNameManager class, persistence, and ECS integration.
"""

import json
import time
from unittest.mock import patch

import pytest

pytestmark = pytest.mark.unit

from reynard_agent_naming.agent_naming.manager import AgentNameManager
from reynard_agent_naming.agent_naming.types import (
    AnimalSpirit,
    NamingScheme,
    NamingStyle,
)


class TestAgentNameManagerInitialization:
    """Test AgentNameManager initialization and setup."""

    def test_manager_initialization_default_data_dir(self, temp_data_dir) -> None:
        """Test manager initialization with default data directory."""
        manager = AgentNameManager(str(temp_data_dir))

        assert manager is not None
        assert hasattr(manager, "data_dir")
        assert hasattr(manager, "agents_file")
        assert hasattr(manager, "namer")
        assert hasattr(manager, "agents")
        assert hasattr(manager, "ecs_available")
        assert hasattr(manager, "world_simulation")

        # Should initialize with empty agents dict
        assert isinstance(manager.agents, dict)
        assert len(manager.agents) == 0

    def test_manager_initialization_custom_data_dir(self, temp_data_dir) -> None:
        """Test manager initialization with custom data directory."""
        manager = AgentNameManager(str(temp_data_dir))

        assert manager.data_dir == temp_data_dir
        assert manager.agents_file == temp_data_dir / "agent-names.json"
        assert isinstance(manager.agents, dict)

    def test_manager_initialization_with_existing_agents_file(self, agents_file) -> None:
        """Test manager initialization with existing agents file."""
        manager = AgentNameManager(str(agents_file.parent))

        assert len(manager.agents) == 3
        assert "agent-001" in manager.agents
        assert "agent-002" in manager.agents
        assert "agent-003" in manager.agents
        assert manager.agents["agent-001"]["name"] == "Vulpine-Sage-13"

    def test_manager_initialization_with_corrupted_agents_file(self, temp_data_dir) -> None:
        """Test manager initialization with corrupted agents file."""
        # Create a corrupted JSON file
        corrupted_file = temp_data_dir / "agent-names.json"
        with corrupted_file.open("w") as f:
            f.write("invalid json content")

        manager = AgentNameManager(str(temp_data_dir))

        # Should fall back to empty agents dict
        assert isinstance(manager.agents, dict)
        assert len(manager.agents) == 0

    def test_manager_initialization_with_ecs_available(
        self, temp_data_dir, mock_ecs_world
    ):
        """Test manager initialization with ECS world available."""
        with patch(
            "reynard_agent_naming.agent_naming.manager.WorldSimulation", mock_ecs_world
        ):
            manager = AgentNameManager(str(temp_data_dir))

            assert manager.ecs_available is True
            assert manager.world_simulation is not None

    def test_manager_initialization_with_ecs_unavailable(self, temp_data_dir) -> None:
        """Test manager initialization with ECS world unavailable."""
        with patch(
            "reynard_agent_naming.agent_naming.manager.WorldSimulation",
            side_effect=ImportError("ECS not available"),
        ):
            manager = AgentNameManager(str(temp_data_dir))

            assert manager.ecs_available is False
            assert manager.world_simulation is None

    def test_manager_initialization_with_ecs_error(self, temp_data_dir) -> None:
        """Test manager initialization with ECS world error."""
        with patch(
            "reynard_agent_naming.agent_naming.manager.WorldSimulation",
            side_effect=Exception("ECS error"),
        ):
            manager = AgentNameManager(str(temp_data_dir))

            assert manager.ecs_available is False
            assert manager.world_simulation is None


class TestAgentNameGeneration:
    """Test agent name generation functionality."""

    @pytest.fixture
    def manager(self, temp_data_dir):
        """Create an AgentNameManager instance for testing."""
        return AgentNameManager(str(temp_data_dir))

    def test_generate_name_with_spirit_and_style(self, manager) -> None:
        """Test generating names with specific spirit and style."""
        name = manager.generate_name(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION
        )

        assert isinstance(name, str)
        assert len(name) > 0
        assert "-" in name  # Should be hyphenated format

    def test_generate_name_with_spirit_only(self, manager) -> None:
        """Test generating names with spirit only."""
        name = manager.generate_name(spirit=AnimalSpirit.WOLF)

        assert isinstance(name, str)
        assert len(name) > 0

    def test_generate_name_with_style_only(self, manager) -> None:
        """Test generating names with style only."""
        name = manager.generate_name(style=NamingStyle.EXO)

        assert isinstance(name, str)
        assert len(name) > 0

    def test_generate_name_without_parameters(self, manager) -> None:
        """Test generating names without parameters."""
        name = manager.generate_name()

        assert isinstance(name, str)
        assert len(name) > 0

    def test_generate_name_with_scheme(self, manager) -> None:
        """Test generating names with different naming scheme."""
        name = manager.generate_name(
            spirit=AnimalSpirit.FOX,
            style=NamingStyle.FOUNDATION,
            scheme=NamingScheme.ELEMENTAL,
            scheme_type="fire",
        )

        assert isinstance(name, str)
        assert len(name) > 0

    def test_generate_name_consistency(self, manager) -> None:
        """Test that name generation is consistent."""
        # Generate multiple names with same parameters
        names = []
        for _ in range(5):
            name = manager.generate_name(
                spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION
            )
            names.append(name)

        # Should all be valid names
        for name in names:
            assert isinstance(name, str)
            assert len(name) > 0

    def test_generate_name_different_spirits(self, manager) -> None:
        """Test generating names with different spirits."""
        spirits = [AnimalSpirit.FOX, AnimalSpirit.WOLF, AnimalSpirit.OTTER]

        for spirit in spirits:
            name = manager.generate_name(spirit=spirit)
            assert isinstance(name, str)
            assert len(name) > 0

    def test_generate_name_different_styles(self, manager) -> None:
        """Test generating names with different styles."""
        styles = [
            NamingStyle.FOUNDATION,
            NamingStyle.EXO,
            NamingStyle.CYBERPUNK,
            NamingStyle.MYTHOLOGICAL,
            NamingStyle.SCIENTIFIC,
            NamingStyle.HYBRID,
        ]

        for style in styles:
            name = manager.generate_name(style=style)
            assert isinstance(name, str)
            assert len(name) > 0


class TestAgentNameAssignment:
    """Test agent name assignment and persistence."""

    @pytest.fixture
    def manager(self, temp_data_dir):
        """Create an AgentNameManager instance for testing."""
        return AgentNameManager(str(temp_data_dir))

    def test_assign_name_success(self, manager) -> None:
        """Test successful name assignment."""
        agent_id = "test-agent-001"
        name = "Vulpine-Sage-13"

        result = manager.assign_name(agent_id, name)

        assert result is True
        assert agent_id in manager.agents
        assert manager.agents[agent_id]["name"] == name
        assert "assigned_at" in manager.agents[agent_id]
        assert isinstance(manager.agents[agent_id]["assigned_at"], float)

    def test_assign_name_multiple_agents(self, manager) -> None:
        """Test assigning names to multiple agents."""
        agents = {
            "agent-001": "Vulpine-Sage-13",
            "agent-002": "Lupus-Guard-24",
            "agent-003": "Lutra-Splash-15",
        }

        for agent_id, name in agents.items():
            result = manager.assign_name(agent_id, name)
            assert result is True

        assert len(manager.agents) == 3
        for agent_id, name in agents.items():
            assert manager.agents[agent_id]["name"] == name

    def test_assign_name_overwrite_existing(self, manager) -> None:
        """Test overwriting existing agent names."""
        agent_id = "test-agent-001"
        original_name = "Original-Name-1"
        new_name = "New-Name-2"

        # Assign original name
        manager.assign_name(agent_id, original_name)
        assert manager.agents[agent_id]["name"] == original_name
        original_time = manager.agents[agent_id]["assigned_at"]

        # Wait a bit to ensure different timestamp
        time.sleep(0.01)

        # Assign new name
        manager.assign_name(agent_id, new_name)
        assert manager.agents[agent_id]["name"] == new_name
        new_time = manager.agents[agent_id]["assigned_at"]

        # Timestamp should be different
        assert new_time > original_time

    def test_assign_name_persistence(self, manager, temp_data_dir) -> None:
        """Test that assigned names are persisted to file."""
        agent_id = "test-agent-001"
        name = "Vulpine-Sage-13"

        manager.assign_name(agent_id, name)

        # Check that file was created and contains the data
        agents_file = temp_data_dir / "agent-names.json"
        assert agents_file.exists()

        with agents_file.open("r", encoding="utf-8") as f:
            data = json.load(f)

        assert agent_id in data
        assert data[agent_id]["name"] == name

    def test_assign_name_file_write_error(self, manager, temp_data_dir) -> None:
        """Test handling of file write errors during assignment."""
        # Make the directory read-only to simulate write error
        temp_data_dir.chmod(0o444)

        try:
            agent_id = "test-agent-001"
            name = "Vulpine-Sage-13"

            # Should not raise exception, but assignment might fail silently
            result = manager.assign_name(agent_id, name)

            # The assignment should still work in memory
            assert agent_id in manager.agents
            assert manager.agents[agent_id]["name"] == name
        finally:
            # Restore write permissions
            temp_data_dir.chmod(0o755)


class TestAgentNameRetrieval:
    """Test agent name retrieval functionality."""

    @pytest.fixture
    def manager(self, temp_data_dir, sample_agents_data):
        """Create an AgentNameManager with sample data."""
        manager = AgentNameManager(str(temp_data_dir))
        manager.agents = sample_agents_data
        return manager

    def test_get_name_existing_agent(self, manager) -> None:
        """Test retrieving name for existing agent."""
        name = manager.get_name("agent-001")

        assert name == "Vulpine-Sage-13"

    def test_get_name_nonexistent_agent(self, manager) -> None:
        """Test retrieving name for non-existent agent."""
        name = manager.get_name("nonexistent-agent")

        assert name is None

    def test_get_name_empty_agent_id(self, manager) -> None:
        """Test retrieving name with empty agent ID."""
        name = manager.get_name("")

        assert name is None

    def test_get_name_invalid_agent_data(self, manager) -> None:
        """Test retrieving name with invalid agent data."""
        # Add invalid agent data
        manager.agents["invalid-agent"] = "not-a-dict"

        name = manager.get_name("invalid-agent")

        assert name is None

    def test_list_agents(self, manager) -> None:
        """Test listing all agents and their names."""
        agents = manager.list_agents()

        assert isinstance(agents, dict)
        assert len(agents) == 3
        assert agents["agent-001"] == "Vulpine-Sage-13"
        assert agents["agent-002"] == "Lupus-Guard-24"
        assert agents["agent-003"] == "Lutra-Splash-15"

    def test_list_agents_empty(self, temp_data_dir) -> None:
        """Test listing agents when none exist."""
        manager = AgentNameManager(str(temp_data_dir))
        agents = manager.list_agents()

        assert isinstance(agents, dict)
        assert len(agents) == 0

    def test_list_agents_with_invalid_data(self, manager) -> None:
        """Test listing agents with some invalid data."""
        # Add invalid agent data
        manager.agents["invalid-agent"] = "not-a-dict"

        agents = manager.list_agents()

        # Should only include valid agents
        assert len(agents) == 3
        assert "invalid-agent" not in agents


@pytest.fixture
def manager_with_ecs(temp_data_dir, mock_ecs_world):
    """Create an AgentNameManager with ECS integration."""
    with patch(
        "reynard_agent_naming.agent_naming.manager.WorldSimulation", mock_ecs_world
    ):
        return AgentNameManager(str(temp_data_dir))


class TestECSIntegration:
    """Test ECS world simulation integration."""

    def test_create_agent_with_ecs_basic(self, manager_with_ecs) -> None:
        """Test creating agent with ECS integration."""
        agent_id = "test-agent-001"
        spirit = AnimalSpirit.FOX
        style = NamingStyle.FOUNDATION

        result = manager_with_ecs.create_agent_with_ecs(agent_id, spirit, style)

        assert isinstance(result, dict)
        assert result["agent_id"] == agent_id
        assert result["ecs_available"] is True
        assert "entity_id" in result
        assert "persona" in result
        assert "lora_config" in result
        assert agent_id in manager_with_ecs.agents

    def test_create_agent_with_ecs_custom_name(self, manager_with_ecs) -> None:
        """Test creating agent with ECS integration and custom name."""
        agent_id = "test-agent-001"
        spirit = AnimalSpirit.WOLF
        style = NamingStyle.EXO
        custom_name = "Custom-Wolf-Name"

        result = manager_with_ecs.create_agent_with_ecs(
            agent_id, spirit, style, custom_name
        )

        assert result["name"] == custom_name
        assert manager_with_ecs.agents[agent_id]["name"] == custom_name

    def test_create_agent_with_ecs_inheritance(self, manager_with_ecs) -> None:
        """Test creating agent with ECS integration and inheritance."""
        agent_id = "test-agent-001"
        spirit = AnimalSpirit.OTTER
        style = NamingStyle.CYBERPUNK
        parent1_id = "parent-001"
        parent2_id = "parent-002"

        result = manager_with_ecs.create_agent_with_ecs(
            agent_id, spirit, style, None, parent1_id, parent2_id
        )

        assert result["ecs_available"] is True
        assert "entity_id" in result

    def test_create_agent_with_ecs_error(self, manager_with_ecs) -> None:
        """Test creating agent with ECS integration error."""
        # Mock ECS world to raise an exception
        with patch.object(
            manager_with_ecs.world_simulation,
            "create_agent_with_inheritance",
            side_effect=Exception("ECS error"),
        ):
            agent_id = "test-agent-001"
            spirit = AnimalSpirit.FOX
            style = NamingStyle.FOUNDATION

            result = manager_with_ecs.create_agent_with_ecs(agent_id, spirit, style)

            assert result["ecs_available"] is False
            assert "error" in result
            assert result["error"] == "ECS error"
            # Should still create the agent with fallback
            assert agent_id in manager_with_ecs.agents

    def test_create_agent_without_ecs(self, temp_data_dir) -> None:
        """Test creating agent without ECS integration."""
        # Mock the ECS import to make it unavailable
        with patch('reynard_agent_naming.agent_naming.manager.ECS_AVAILABLE', False):
            with patch('reynard_agent_naming.agent_naming.manager.WorldSimulation', None):
                manager = AgentNameManager(str(temp_data_dir))
                agent_id = "test-agent-001"
                spirit = AnimalSpirit.FOX
                style = NamingStyle.FOUNDATION

                result = manager.create_agent_with_ecs(agent_id, spirit, style)

                assert result["ecs_available"] is False
                assert "entity_id" not in result
                assert "persona" not in result
                assert "lora_config" not in result
                assert agent_id in manager.agents

    def test_get_agent_persona_with_ecs(self, manager_with_ecs) -> None:
        """Test getting agent persona with ECS integration."""
        agent_id = "test-agent-001"

        persona = manager_with_ecs.get_agent_persona(agent_id)

        assert isinstance(persona, dict)
        assert "agent_id" in persona
        assert "personality_traits" in persona
        assert "communication_style" in persona
        assert "specializations" in persona

    def test_get_agent_persona_without_ecs(self, temp_data_dir) -> None:
        """Test getting agent persona without ECS integration."""
        # Mock the ECS import to make it unavailable
        with patch('reynard_agent_naming.agent_naming.manager.ECS_AVAILABLE', False):
            with patch('reynard_agent_naming.agent_naming.manager.WorldSimulation', None):
                manager = AgentNameManager(str(temp_data_dir))
                agent_id = "test-agent-001"

                persona = manager.get_agent_persona(agent_id)

                assert persona is None

    def test_get_lora_config_with_ecs(self, manager_with_ecs) -> None:
        """Test getting LoRA config with ECS integration."""
        agent_id = "test-agent-001"

        config = manager_with_ecs.get_lora_config(agent_id)

        assert isinstance(config, dict)
        assert "base_model" in config
        assert "lora_rank" in config
        assert "lora_alpha" in config
        assert "target_modules" in config

    def test_get_lora_config_without_ecs(self, temp_data_dir) -> None:
        """Test getting LoRA config without ECS integration."""
        # Mock the ECS import to make it unavailable
        with patch('reynard_agent_naming.agent_naming.manager.ECS_AVAILABLE', False):
            with patch('reynard_agent_naming.agent_naming.manager.WorldSimulation', None):
                manager = AgentNameManager(str(temp_data_dir))
                agent_id = "test-agent-001"

                config = manager.get_lora_config(agent_id)

                assert config is None


class TestSimulationControl:
    """Test ECS world simulation control methods."""

    def test_update_simulation_with_ecs(self, manager_with_ecs) -> None:
        """Test updating simulation with ECS integration."""
        # Should not raise an exception
        manager_with_ecs.update_simulation()
        manager_with_ecs.update_simulation(0.1)

    def test_update_simulation_without_ecs(self, temp_data_dir) -> None:
        """Test updating simulation without ECS integration."""
        # Mock the ECS import to make it unavailable
        with patch('reynard_agent_naming.agent_naming.manager.ECS_AVAILABLE', False):
            with patch('reynard_agent_naming.agent_naming.manager.WorldSimulation', None):
                manager = AgentNameManager(str(temp_data_dir))

                # Should not raise an exception
                manager.update_simulation()
                manager.update_simulation(0.1)

    def test_nudge_time_with_ecs(self, manager_with_ecs) -> None:
        """Test nudging time with ECS integration."""
        # Should not raise an exception
        manager_with_ecs.nudge_time()
        manager_with_ecs.nudge_time(0.05)

    def test_nudge_time_without_ecs(self, temp_data_dir) -> None:
        """Test nudging time without ECS integration."""
        manager = AgentNameManager(str(temp_data_dir))

        # Should not raise an exception
        manager.nudge_time()
        manager.nudge_time(0.05)

    def test_get_simulation_status_with_ecs(self, manager_with_ecs) -> None:
        """Test getting simulation status with ECS integration."""
        status = manager_with_ecs.get_simulation_status()

        assert isinstance(status, dict)
        assert "ecs_available" in status
        assert status["ecs_available"] is True
        assert "simulation_time" in status
        assert "time_acceleration" in status
        assert "total_agents" in status

    def test_get_simulation_status_without_ecs(self, temp_data_dir) -> None:
        """Test getting simulation status without ECS integration."""
        # Mock the ECS import to make it unavailable
        with patch('reynard_agent_naming.agent_naming.manager.ECS_AVAILABLE', False):
            with patch('reynard_agent_naming.agent_naming.manager.WorldSimulation', None):
                manager = AgentNameManager(str(temp_data_dir))
                status = manager.get_simulation_status()

                assert isinstance(status, dict)
                assert status["ecs_available"] is False

    def test_accelerate_time_with_ecs(self, manager_with_ecs) -> None:
        """Test accelerating time with ECS integration."""
        # Should not raise an exception
        manager_with_ecs.accelerate_time(20.0)

    def test_accelerate_time_without_ecs(self, temp_data_dir) -> None:
        """Test accelerating time without ECS integration."""
        # Mock the ECS import to make it unavailable
        with patch('reynard_agent_naming.agent_naming.manager.ECS_AVAILABLE', False):
            with patch('reynard_agent_naming.agent_naming.manager.WorldSimulation', None):
                manager = AgentNameManager(str(temp_data_dir))

                # Should not raise an exception
                manager.accelerate_time(20.0)


class TestSpiritSelection:
    """Test animal spirit selection functionality."""

    @pytest.fixture
    def manager(self, temp_data_dir):
        """Create an AgentNameManager instance for testing."""
        return AgentNameManager(str(temp_data_dir))

    def test_roll_agent_spirit_weighted(self, manager) -> None:
        """Test rolling agent spirit with weighted distribution."""
        spirits = []
        for _ in range(100):
            spirit = manager.roll_agent_spirit(weighted=True)
            spirits.append(spirit)

        # Should get valid spirits
        for spirit in spirits:
            assert isinstance(spirit, AnimalSpirit)

        # Should have some variety
        unique_spirits = set(spirits)
        assert len(unique_spirits) > 1

    def test_roll_agent_spirit_equal(self, manager) -> None:
        """Test rolling agent spirit with equal distribution."""
        spirits = []
        for _ in range(100):
            spirit = manager.roll_agent_spirit(weighted=False)
            spirits.append(spirit)

        # Should get valid spirits
        for spirit in spirits:
            assert isinstance(spirit, AnimalSpirit)

        # Should have some variety
        unique_spirits = set(spirits)
        assert len(unique_spirits) > 1

    def test_roll_agent_spirit_weighted_distribution(self, manager) -> None:
        """Test that weighted distribution favors expected spirits."""
        spirits = []
        for _ in range(1000):
            spirit = manager.roll_agent_spirit(weighted=True)
            spirits.append(spirit)

        # Count occurrences
        fox_count = spirits.count(AnimalSpirit.FOX)
        otter_count = spirits.count(AnimalSpirit.OTTER)
        wolf_count = spirits.count(AnimalSpirit.WOLF)

        # Otter should be most common (5/12 ≈ 41.7%), then fox (4/12 ≈ 33.3%), then wolf (3/12 = 25%)
        assert otter_count > fox_count
        assert fox_count > wolf_count
        assert otter_count > wolf_count

    def test_get_available_spirits(self, manager) -> None:
        """Test getting list of available spirits."""
        spirits = manager.get_available_spirits()

        assert isinstance(spirits, list)
        assert len(spirits) > 0
        assert AnimalSpirit.FOX in spirits
        assert AnimalSpirit.WOLF in spirits
        assert AnimalSpirit.OTTER in spirits

    def test_get_available_styles(self, manager) -> None:
        """Test getting list of available styles."""
        styles = manager.get_available_styles()

        assert isinstance(styles, list)
        assert len(styles) > 0
        assert NamingStyle.FOUNDATION in styles
        assert NamingStyle.EXO in styles
        assert NamingStyle.CYBERPUNK in styles


class TestNameAnalysis:
    """Test name analysis functionality."""

    @pytest.fixture
    def manager(self, temp_data_dir):
        """Create an AgentNameManager instance for testing."""
        return AgentNameManager(str(temp_data_dir))

    def test_analyze_name_foundation_style(self, manager) -> None:
        """Test analyzing Foundation-style names."""
        info = manager.analyze_name("Vulpine-Sage-13")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

    def test_analyze_name_exo_style(self, manager) -> None:
        """Test analyzing Exo-style names."""
        info = manager.analyze_name("Lupus-Guard-24")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

    def test_analyze_name_cyberpunk_style(self, manager) -> None:
        """Test analyzing Cyberpunk-style names."""
        info = manager.analyze_name("Cyber-Fox-Nexus")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

    def test_analyze_name_unknown_name(self, manager) -> None:
        """Test analyzing unknown names."""
        info = manager.analyze_name("Unknown-Name-123")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info

    def test_analyze_name_empty_name(self, manager) -> None:
        """Test analyzing empty names."""
        info = manager.analyze_name("")

        assert isinstance(info, dict)
        assert "spirit" in info
        assert "style" in info
        assert "components" in info


class TestManagerIntegration:
    """Test integration between different manager methods."""

    @pytest.fixture
    def manager(self, temp_data_dir):
        """Create an AgentNameManager instance for testing."""
        return AgentNameManager(str(temp_data_dir))

    def test_generate_and_assign_name(self, manager) -> None:
        """Test generating and assigning a name to an agent."""
        agent_id = "test-agent-001"
        spirit = AnimalSpirit.FOX
        style = NamingStyle.FOUNDATION

        # Generate name
        name = manager.generate_name(spirit, style)
        assert isinstance(name, str)
        assert len(name) > 0

        # Assign name
        result = manager.assign_name(agent_id, name)
        assert result is True

        # Retrieve name
        retrieved_name = manager.get_name(agent_id)
        assert retrieved_name == name

    def test_create_agent_with_ecs_and_retrieve(self, manager_with_ecs) -> None:
        """Test creating agent with ECS and retrieving information."""
        agent_id = "test-agent-001"
        spirit = AnimalSpirit.FOX
        style = NamingStyle.FOUNDATION

        # Create agent with ECS
        result = manager_with_ecs.create_agent_with_ecs(agent_id, spirit, style)
        assert result["ecs_available"] is True

        # Retrieve name
        name = manager_with_ecs.get_name(agent_id)
        assert name is not None

        # Get persona
        persona = manager_with_ecs.get_agent_persona(agent_id)
        assert persona is not None

        # Get LoRA config
        config = manager_with_ecs.get_lora_config(agent_id)
        assert config is not None

    def test_batch_agent_creation(self, manager) -> None:
        """Test creating multiple agents in batch."""
        agents_data = [
            ("agent-001", AnimalSpirit.FOX, NamingStyle.FOUNDATION),
            ("agent-002", AnimalSpirit.WOLF, NamingStyle.EXO),
            ("agent-003", AnimalSpirit.OTTER, NamingStyle.CYBERPUNK),
        ]

        for agent_id, spirit, style in agents_data:
            name = manager.generate_name(spirit, style)
            result = manager.assign_name(agent_id, name)
            assert result is True

        # Verify all agents were created
        agents = manager.list_agents()
        assert len(agents) == 3
        assert "agent-001" in agents
        assert "agent-002" in agents
        assert "agent-003" in agents

    def test_persistence_across_instances(self, temp_data_dir) -> None:
        """Test that agent data persists across manager instances."""
        # Create first manager and assign names
        manager1 = AgentNameManager(str(temp_data_dir))
        manager1.assign_name("agent-001", "Vulpine-Sage-13")
        manager1.assign_name("agent-002", "Lupus-Guard-24")

        # Create second manager and verify data
        manager2 = AgentNameManager(str(temp_data_dir))
        assert manager2.get_name("agent-001") == "Vulpine-Sage-13"
        assert manager2.get_name("agent-002") == "Lupus-Guard-24"

        agents = manager2.list_agents()
        assert len(agents) == 2
        assert agents["agent-001"] == "Vulpine-Sage-13"
        assert agents["agent-002"] == "Lupus-Guard-24"

    def test_error_handling_robustness(self, manager) -> None:
        """Test that manager handles errors gracefully."""
        # Test with invalid parameters
        name = manager.generate_name()
        assert isinstance(name, str)

        # Test assignment with empty strings
        result = manager.assign_name("", "")
        assert result is True

        # Test retrieval with invalid ID
        retrieved = manager.get_name("invalid-id")
        assert retrieved is None

        # Test analysis with invalid name
        info = manager.analyze_name("")
        assert isinstance(info, dict)
