#!/usr/bin/env python3
"""
Unit tests for Agent Manager.
"""

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

from services.agent_manager import AgentNameManager


class TestAgentNameManager:
    """Test cases for AgentNameManager."""

    def test_init_with_custom_data_dir(self, temp_dir: Path):
        """Test initialization with custom data directory."""
        manager = AgentNameManager(data_dir=str(temp_dir))
        assert manager.data_dir == temp_dir
        assert manager.agents_file == temp_dir / "agent-names.json"

    def test_init_with_default_data_dir(self):
        """Test initialization with default data directory."""
        with patch("services.agent_manager.Path") as mock_path:
            mock_path.return_value.parent.parent = Path("/test/path")
            manager = AgentNameManager()
            assert manager.data_dir == Path("/test/path")

    @patch("services.agent_manager.ReynardRobotNamer")
    def test_init_with_mock_namer(self, mock_namer_class, temp_dir: Path):
        """Test initialization with mocked robot namer."""
        mock_namer = MagicMock()
        mock_namer_class.return_value = mock_namer

        manager = AgentNameManager(data_dir=str(temp_dir))
        assert manager.namer == mock_namer

    def test_load_agents_file_exists(self, temp_dir: Path):
        """Test loading agents when file exists."""
        # Create test data
        test_agents = {
            "test-agent-1": {"name": "Test-Fox-42", "assigned_at": 1234567890.0},
            "test-agent-2": {"name": "Test-Wolf-43", "assigned_at": 1234567891.0},
        }

        agents_file = temp_dir / "agent-names.json"
        with open(agents_file, "w") as f:
            json.dump(test_agents, f)

        with patch("services.agent_manager.ReynardRobotNamer"):
            manager = AgentNameManager(data_dir=str(temp_dir))
            assert manager.agents == test_agents

    def test_load_agents_file_not_exists(self, temp_dir: Path):
        """Test loading agents when file doesn't exist."""
        with patch("services.agent_manager.ReynardRobotNamer"):
            manager = AgentNameManager(data_dir=str(temp_dir))
            assert manager.agents == {}

    def test_load_agents_invalid_json(self, temp_dir: Path):
        """Test loading agents with invalid JSON."""
        agents_file = temp_dir / "agent-names.json"
        with open(agents_file, "w") as f:
            f.write("invalid json")

        with patch("services.agent_manager.ReynardRobotNamer"):
            manager = AgentNameManager(data_dir=str(temp_dir))
            assert manager.agents == {}

    def test_save_agents(self, temp_dir: Path):
        """Test saving agents to file."""
        with patch("services.agent_manager.ReynardRobotNamer"):
            manager = AgentNameManager(data_dir=str(temp_dir))
            manager.agents = {
                "test-agent": {"name": "Test-Fox-42", "assigned_at": 1234567890.0}
            }

            manager._save_agents()

            agents_file = temp_dir / "agent-names.json"
            assert agents_file.exists()

            with open(agents_file) as f:
                saved_agents = json.load(f)
            assert saved_agents == manager.agents

    def test_save_agents_io_error(self, temp_dir: Path):
        """Test saving agents with IO error."""
        with patch("services.agent_manager.ReynardRobotNamer"):
            manager = AgentNameManager(data_dir=str(temp_dir))
            manager.agents = {
                "test-agent": {"name": "Test-Fox-42", "assigned_at": 1234567890.0}
            }

            # Mock open to raise IOError
            with patch("builtins.open", side_effect=OSError("Permission denied")):
                with patch("services.agent_manager.logger") as mock_logger:
                    manager._save_agents()
                    mock_logger.exception.assert_called_once()

    def test_generate_name(self, temp_dir: Path):
        """Test generating agent name."""
        mock_namer = MagicMock()
        mock_namer.generate_batch.return_value = ["Test-Fox-42"]

        with patch("services.agent_manager.ReynardRobotNamer", return_value=mock_namer):
            manager = AgentNameManager(data_dir=str(temp_dir))
            name = manager.generate_name("fox", "foundation")

            assert name == "Test-Fox-42"
            mock_namer.generate_batch.assert_called_once_with(1, "fox", "foundation")

    def test_generate_name_empty_batch(self, temp_dir: Path):
        """Test generating agent name with empty batch."""
        mock_namer = MagicMock()
        mock_namer.generate_batch.return_value = []

        with patch("services.agent_manager.ReynardRobotNamer", return_value=mock_namer):
            manager = AgentNameManager(data_dir=str(temp_dir))
            name = manager.generate_name("fox", "foundation")

            assert name == "Unknown-Unit-1"

    def test_assign_name(self, temp_dir: Path):
        """Test assigning name to agent."""
        with patch("services.agent_manager.ReynardRobotNamer"):
            manager = AgentNameManager(data_dir=str(temp_dir))

            with patch.object(manager, "_save_agents") as mock_save:
                result = manager.assign_name("test-agent", "Test-Fox-42")

                assert result is True
                assert "test-agent" in manager.agents
                assert manager.agents["test-agent"]["name"] == "Test-Fox-42"
                assert "assigned_at" in manager.agents["test-agent"]
                mock_save.assert_called_once()

    def test_get_name_exists(self, temp_dir: Path):
        """Test getting name for existing agent."""
        with patch("services.agent_manager.ReynardRobotNamer"):
            manager = AgentNameManager(data_dir=str(temp_dir))
            manager.agents = {
                "test-agent": {"name": "Test-Fox-42", "assigned_at": 1234567890.0}
            }

            name = manager.get_name("test-agent")
            assert name == "Test-Fox-42"

    def test_get_name_not_exists(self, temp_dir: Path):
        """Test getting name for non-existing agent."""
        with patch("services.agent_manager.ReynardRobotNamer"):
            manager = AgentNameManager(data_dir=str(temp_dir))

            name = manager.get_name("non-existing-agent")
            assert name is None

    def test_list_agents(self, temp_dir: Path):
        """Test listing all agents."""
        with patch("services.agent_manager.ReynardRobotNamer"):
            manager = AgentNameManager(data_dir=str(temp_dir))
            manager.agents = {
                "test-agent-1": {"name": "Test-Fox-42", "assigned_at": 1234567890.0},
                "test-agent-2": {"name": "Test-Wolf-43", "assigned_at": 1234567891.0},
            }

            agents = manager.list_agents()
            expected = {"test-agent-1": "Test-Fox-42", "test-agent-2": "Test-Wolf-43"}
            assert agents == expected

    def test_list_agents_empty(self, temp_dir: Path):
        """Test listing agents when none exist."""
        with patch("services.agent_manager.ReynardRobotNamer"):
            manager = AgentNameManager(data_dir=str(temp_dir))

            agents = manager.list_agents()
            assert agents == {}

    def test_roll_spirit_weighted(self, temp_dir: Path):
        """Test rolling spirit with weighted distribution."""
        mock_namer = MagicMock()
        mock_namer.roll_spirit.return_value = "fox"

        with patch("services.agent_manager.ReynardRobotNamer", return_value=mock_namer):
            manager = AgentNameManager(data_dir=str(temp_dir))
            spirit = manager.roll_spirit(weighted=True)

            assert spirit == "fox"
            mock_namer.roll_spirit.assert_called_once_with(True)

    def test_roll_spirit_unweighted(self, temp_dir: Path):
        """Test rolling spirit with unweighted distribution."""
        mock_namer = MagicMock()
        mock_namer.roll_spirit.return_value = "otter"

        with patch("services.agent_manager.ReynardRobotNamer", return_value=mock_namer):
            manager = AgentNameManager(data_dir=str(temp_dir))
            spirit = manager.roll_spirit(weighted=False)

            assert spirit == "otter"
            mock_namer.roll_spirit.assert_called_once_with(False)
