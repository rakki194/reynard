"""
Simple integration test to verify basic functionality without file system operations.
"""

import pytest
import tempfile
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from services.unified_agent_manager import UnifiedAgentStateManager, AgentState
from services.legacy_tracking_service import LegacyTrackingService
from postgres_service import PostgresECSWorldService


class TestSimpleIntegration:
    """Simple integration tests for the Success-Advisor-8 system."""

    @pytest.fixture
    def mock_ecs_service(self):
        """Create comprehensive mock ECS service."""
        service = AsyncMock()

        # Mock agent data
        mock_agent = MagicMock()
        mock_agent.agent_id = "success-advisor-8"
        mock_agent.name = "Success-Advisor-8"
        mock_agent.spirit = "lion"
        mock_agent.style = "foundation"
        mock_agent.generation = 8
        mock_agent.active = True
        mock_agent.created_at = datetime.now()
        mock_agent.last_activity = datetime.now()
        mock_agent.id = "entity-success-advisor-8"

        # Set up mock responses
        def get_agent_side_effect(agent_id):
            if agent_id == "success-advisor-8":
                return mock_agent
            return None

        service.get_agent.side_effect = get_agent_side_effect
        service.record_interaction = AsyncMock()
        service.get_agent_relationships.return_value = []
        service.get_agent_specializations.return_value = []
        service.get_agent_achievements.return_value = []
        service.get_personality_traits.return_value = []
        service.get_physical_traits.return_value = []
        service.get_ability_traits.return_value = []
        service.get_agent_interactions.return_value = []
        service.update_agent = AsyncMock()
        service.update_personality_trait = AsyncMock()
        service.update_physical_trait = AsyncMock()
        service.update_ability_trait = AsyncMock()
        service.update_agent_specializations = AsyncMock()
        service.add_agent_achievement = AsyncMock()

        return service

    @pytest.fixture
    def agent_manager(self, mock_ecs_service):
        """UnifiedAgentStateManager instance with mocked ECS service."""
        return UnifiedAgentStateManager(mock_ecs_service, ".")

    @pytest.mark.asyncio
    async def test_basic_agent_state_retrieval(self, agent_manager, mock_ecs_service):
        """Test basic agent state retrieval without file system operations."""
        
        # Get Success-Advisor-8 agent state
        state = await agent_manager.get_agent_state("success-advisor-8")
        
        assert state is not None
        assert state.agent_id == "success-advisor-8"
        assert state.name == "Success-Advisor-8"
        assert state.spirit == "lion"
        assert state.style == "foundation"
        assert state.generation == 8

    @pytest.mark.asyncio
    async def test_agent_activity_tracking(self, agent_manager, mock_ecs_service):
        """Test agent activity tracking."""
        
        # Track Success-Advisor-8 activity
        await agent_manager.track_agent_activity(
            "success-advisor-8",
            "Test activity",
            {"test": "integration", "timestamp": datetime.now().isoformat()}
        )

        # Verify ECS service was called
        mock_ecs_service.record_interaction.assert_called()

    @pytest.mark.asyncio
    async def test_agent_not_found(self, agent_manager, mock_ecs_service):
        """Test handling of non-existent agent."""
        
        # Try to get non-existent agent
        state = await agent_manager.get_agent_state("non-existent-agent")
        
        assert state is None
