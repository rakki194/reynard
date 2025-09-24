"""Tests for Unified Agent State Manager

Comprehensive tests for the unified agent state management system
that integrates with the existing FastAPI ECS backend.
"""

import sys
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

sys.path.append(str(Path(__file__).parent.parent))

from postgres_service import PostgresECSWorldService

from services.unified_agent_manager import AgentState, UnifiedAgentStateManager


class TestAgentState:
    """Test cases for AgentState model."""

    def test_agent_state_creation(self):
        """Test AgentState creation with all parameters."""
        state = AgentState(
            agent_id="test-agent-123",
            name="Test Agent",
            spirit="fox",
            style="foundation",
            generation=1,
            traits={"determination": 0.95, "charisma": 0.88},
            memories=[{"id": "mem1", "content": "test memory"}],
            relationships={"agent2": {"type": "collaboration", "strength": 0.9}},
            last_activity=datetime.now(),
            ecs_entity_id="entity-456",
            specializations=["testing", "development"],
            achievements=[{"name": "First Test", "description": "Passed first test"}],
        )

        assert state.agent_id == "test-agent-123"
        assert state.name == "Test Agent"
        assert state.spirit == "fox"
        assert state.style == "foundation"
        assert state.generation == 1
        assert len(state.traits) == 2
        assert len(state.memories) == 1
        assert len(state.relationships) == 1
        assert len(state.specializations) == 2
        assert len(state.achievements) == 1

    def test_agent_state_to_dict(self):
        """Test AgentState to_dict conversion."""
        state = AgentState(
            agent_id="test-agent-123",
            name="Test Agent",
            spirit="fox",
            style="foundation",
            generation=1,
            traits={"determination": 0.95},
            memories=[],
            relationships={},
            last_activity=datetime.now(),
        )

        state_dict = state.to_dict()

        assert isinstance(state_dict, dict)
        assert state_dict["agent_id"] == "test-agent-123"
        assert state_dict["name"] == "Test Agent"
        assert state_dict["spirit"] == "fox"
        assert state_dict["style"] == "foundation"
        assert state_dict["generation"] == 1
        assert "last_activity" in state_dict
        assert isinstance(state_dict["last_activity"], str)


class TestUnifiedAgentStateManager:
    """Test cases for UnifiedAgentStateManager."""

    @pytest.fixture
    def mock_ecs_service(self):
        """Create mock ECS service."""
        service = AsyncMock(spec=PostgresECSWorldService)
        # Mock all the methods that UnifiedAgentStateManager might call
        service.get_agent = AsyncMock()
        service.get_agent_by_name = AsyncMock()
        service.get_personality_traits = AsyncMock()
        service.get_physical_traits = AsyncMock()
        service.get_ability_traits = AsyncMock()
        service.get_agent_interactions = AsyncMock()
        service.get_agent_relationships = AsyncMock()
        service.get_agent_specializations = AsyncMock()
        service.get_agent_achievements = AsyncMock()
        service.record_interaction = AsyncMock()
        service.update_agent = AsyncMock()
        service.update_personality_trait = AsyncMock()
        service.update_physical_trait = AsyncMock()
        service.update_ability_trait = AsyncMock()
        service.update_agent_specializations = AsyncMock()
        service.add_agent_achievement = AsyncMock()
        service.shutdown = AsyncMock()
        return service

    @pytest.fixture
    def agent_manager(self, mock_ecs_service):
        """Create UnifiedAgentStateManager with mock ECS service."""
        return UnifiedAgentStateManager(mock_ecs_service, ".")

    @pytest.mark.asyncio
    async def test_get_agent_state_success(self, agent_manager, mock_ecs_service):
        """Test successful agent state retrieval."""
        # Mock agent data
        mock_agent = MagicMock()
        mock_agent.agent_id = "test-agent-123"
        mock_agent.name = "Test Agent"
        mock_agent.spirit = "fox"
        mock_agent.style = "foundation"
        mock_agent.generation = 1
        mock_agent.last_activity = datetime.now()
        mock_agent.id = "entity-456"

        # Mock ECS service responses
        mock_ecs_service.get_agent.return_value = mock_agent
        mock_ecs_service.get_personality_traits.return_value = []
        mock_ecs_service.get_physical_traits.return_value = []
        mock_ecs_service.get_ability_traits.return_value = []
        mock_ecs_service.get_agent_interactions.return_value = []
        mock_ecs_service.get_agent_relationships.return_value = []
        mock_ecs_service.get_agent_specializations.return_value = []
        mock_ecs_service.get_agent_achievements.return_value = []

        # Test
        state = await agent_manager.get_agent_state("test-agent-123")

        assert state is not None
        assert state.agent_id == "test-agent-123"
        assert state.name == "Test Agent"
        assert state.spirit == "fox"
        assert state.style == "foundation"
        assert state.generation == 1
        assert state.ecs_entity_id == "entity-456"

        # Verify ECS service was called
        mock_ecs_service.get_agent.assert_called_once_with("test-agent-123")

    @pytest.mark.asyncio
    async def test_get_agent_state_not_found(self, agent_manager, mock_ecs_service):
        """Test agent state retrieval when agent not found."""
        # Mock ECS service to return None
        mock_ecs_service.get_agent.return_value = None

        # Test
        state = await agent_manager.get_agent_state("nonexistent-agent")

        assert state is None
        mock_ecs_service.get_agent.assert_called_once_with("nonexistent-agent")

    @pytest.mark.asyncio
    async def test_track_agent_activity_success(self, agent_manager, mock_ecs_service):
        """Test successful activity tracking."""
        # Mock ECS service
        mock_ecs_service.record_interaction = AsyncMock()

        # Test
        await agent_manager.track_agent_activity(
            "test-agent-123", "Test activity", {"context": "test"},
        )

        # Verify ECS service was called
        mock_ecs_service.record_interaction.assert_called_once_with(
            agent_id="test-agent-123",
            interaction_type="activity",
            description="Test activity",
            metadata={"context": "test"},
        )

    @pytest.mark.asyncio
    async def test_track_success_advisor_8_activity(
        self, agent_manager, mock_ecs_service,
    ):
        """Test Success-Advisor-8 specific activity tracking."""
        # Mock ECS service
        mock_ecs_service.record_interaction = AsyncMock()

        # Test
        await agent_manager.track_agent_activity(
            "success-advisor-8", "Success-Advisor-8 test activity", {"context": "test"},
        )

        # Verify ECS service was called
        mock_ecs_service.record_interaction.assert_called_once_with(
            agent_id="success-advisor-8",
            interaction_type="activity",
            description="Success-Advisor-8 test activity",
            metadata={"context": "test"},
        )

    @pytest.mark.asyncio
    async def test_get_success_advisor_8_legacy_report(
        self, agent_manager, mock_ecs_service,
    ):
        """Test Success-Advisor-8 legacy report generation."""
        # Mock legacy tracker
        mock_report = {"total_activities": 5, "summary": "Test report"}
        with patch.object(
            agent_manager.legacy_tracker,
            "generate_legacy_report",
            new_callable=AsyncMock,
        ) as mock_tracker:
            mock_tracker.return_value = mock_report

            # Test
            report = await agent_manager.get_success_advisor_8_legacy_report()

            # Verify
            assert report == mock_report
            mock_tracker.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_agent_state_success(self, agent_manager, mock_ecs_service):
        """Test successful agent state update."""
        # Mock ECS service methods
        mock_ecs_service.update_agent = AsyncMock()
        mock_ecs_service.update_personality_trait = AsyncMock()
        mock_ecs_service.update_physical_trait = AsyncMock()
        mock_ecs_service.update_ability_trait = AsyncMock()
        mock_ecs_service.update_agent_specializations = AsyncMock()
        mock_ecs_service.add_agent_achievement = AsyncMock()

        # Create test state
        state = AgentState(
            agent_id="test-agent-123",
            name="Updated Agent",
            spirit="wolf",
            style="exo",
            generation=2,
            traits={
                "personality_determination": 0.98,
                "physical_strength": 0.85,
                "ability_leadership": 0.92,
            },
            memories=[],
            relationships={},
            last_activity=datetime.now(),
            specializations=["updated", "testing"],
            achievements=[
                {"name": "Update Test", "description": "Successfully updated"},
            ],
        )

        # Test
        result = await agent_manager.update_agent_state("test-agent-123", state)

        # Verify
        assert result is True
        mock_ecs_service.update_agent.assert_called_once()
        mock_ecs_service.update_personality_trait.assert_called_once()
        mock_ecs_service.update_physical_trait.assert_called_once()
        mock_ecs_service.update_ability_trait.assert_called_once()
        mock_ecs_service.update_agent_specializations.assert_called_once()
        mock_ecs_service.add_agent_achievement.assert_called_once()

    @pytest.mark.asyncio
    async def test_close(self, agent_manager, mock_ecs_service):
        """Test manager close method."""
        # Mock ECS service shutdown
        mock_ecs_service.shutdown = AsyncMock()

        # Test
        await agent_manager.close()

        # Verify
        mock_ecs_service.shutdown.assert_called_once()


class TestIntegration:
    """Integration tests for the unified agent state manager."""

    @pytest.mark.asyncio
    async def test_full_workflow(self):
        """Test complete workflow from agent creation to state management."""
        # This would be an integration test with a real ECS service
        # For now, we'll skip it as it requires database setup
        pytest.skip("Integration test requires database setup")

    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test error handling in various scenarios."""
        # This would test error scenarios with the real ECS service
        # For now, we'll skip it as it requires database setup
        pytest.skip("Integration test requires database setup")


if __name__ == "__main__":
    pytest.main([__file__])
