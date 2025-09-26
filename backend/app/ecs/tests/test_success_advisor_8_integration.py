"""Integration Tests for Success-Advisor-8 Legacy Tracking System

Comprehensive integration tests that demonstrate the complete workflow
of the Success-Advisor-8 legacy tracking and agent state management system.
"""

import json
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

sys.path.append(str(Path(__file__).parent.parent))

from services.legacy_tracking_service import LegacyTrackingService
from services.unified_agent_manager import AgentState, UnifiedAgentStateManager


class TestSuccessAdvisor8Integration:
    """Integration tests for Success-Advisor-8 system."""

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
        service.get_agent.return_value = mock_agent
        service.get_agent_by_name.return_value = mock_agent

        # Override for specific test cases
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
    def temp_changelog(self):
        """Create temporary CHANGELOG.md for testing."""
        changelog_content = """# Changelog

## [Unreleased]

### Added
- **Success-Advisor-8 Integration**: Complete legacy tracking system (Success-Advisor-8)
- **Unified Agent Manager**: Single source of truth for agent state (Success-Advisor-8)

### Changed
- **ECS Backend Integration**: Consolidated agent naming into FastAPI ECS backend (Success-Advisor-8)

## [1.0.0] - 2025-01-15

### Added
- **Initial Release**: Success-Advisor-8 legacy tracking system (Success-Advisor-8)
- **CHANGELOG Parser**: Unified parser for Success-Advisor-8 activities (Success-Advisor-8)
"""

        with tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False) as f:
            f.write(changelog_content)
            temp_path = f.name

        yield temp_path

        # Cleanup
        Path(temp_path).unlink(missing_ok=True)

    @pytest.fixture
    def agent_manager(self, mock_ecs_service):
        """Create UnifiedAgentStateManager with mock ECS service."""
        return UnifiedAgentStateManager(mock_ecs_service, ".")

    @pytest.fixture
    def legacy_service(self, mock_ecs_service, temp_changelog):
        """Create LegacyTrackingService with mock ECS service and temp changelog."""
        return LegacyTrackingService(mock_ecs_service, str(Path(temp_changelog).parent))

    @pytest.mark.asyncio
    async def test_complete_success_advisor_8_workflow(
        self,
        agent_manager,
        legacy_service,
        mock_ecs_service,
    ):
        """Test complete Success-Advisor-8 workflow from state management to legacy tracking."""
        # Step 1: Get Success-Advisor-8 agent state
        state = await agent_manager.get_agent_state("success-advisor-8")
        assert state is not None
        assert state.agent_id == "success-advisor-8"
        assert state.name == "Success-Advisor-8"
        assert state.spirit == "lion"
        assert state.style == "foundation"
        assert state.generation == 8

        # Step 2: Track Success-Advisor-8 activity
        await agent_manager.track_agent_activity(
            "success-advisor-8",
            "Integration test activity",
            {"test": "integration", "timestamp": datetime.now().isoformat()},
        )

        # Verify ECS service was called
        mock_ecs_service.record_interaction.assert_called()

        # Step 3: Get Success-Advisor-8 activities from CHANGELOG
        with patch.object(
            legacy_service.changelog_parser,
            "parse_success_advisor_8_activities",
        ) as mock_activities:
            mock_activity = MagicMock()
            mock_activity.activity_id = "sa8-1"
            mock_activity.activity_type = "feature"
            mock_activity.description = "Success-Advisor-8 test activity"
            mock_activities.return_value = [mock_activity]

            activities = await legacy_service.get_success_advisor_8_activities()
            assert len(activities) > 0

        # Verify activities contain Success-Advisor-8 references
        success_advisor_activities = [
            a for a in activities if "Success-Advisor-8" in str(a)
        ]
        assert len(success_advisor_activities) > 0

        # Step 4: Get codebase movements
        with patch.object(legacy_service, "get_codebase_movements") as mock_movements:
            mock_movements.return_value = []
            movements = await legacy_service.get_codebase_movements()
            # Note: In real implementation, this would scan actual files

        # Step 5: Generate comprehensive legacy report
        with (
            patch.object(
                legacy_service,
                "get_success_advisor_8_activities",
            ) as mock_activities,
            patch.object(legacy_service, "get_codebase_movements") as mock_movements,
            patch.object(legacy_service, "_get_ecs_agent_data") as mock_ecs_data,
            patch.object(
                legacy_service.changelog_parser,
                "analyze_activity_trends",
            ) as mock_analysis,
            patch.object(
                legacy_service.changelog_parser,
                "generate_activity_summary",
            ) as mock_summary,
        ):

            mock_activities.return_value = [{"activity_id": "sa8-1", "type": "feature"}]
            mock_movements.return_value = []
            mock_ecs_data.return_value = {"agent_id": "success-advisor-8"}
            mock_analysis.return_value = {"total_activities": 1}
            mock_summary.return_value = "Test summary"

            report = await legacy_service.generate_legacy_report()
            assert "total_activities" in report
            assert "changelog_activities" in report
            assert "codebase_movements" in report
            assert "ecs_agent_data" in report
            assert "activity_analysis" in report
            assert "summary" in report
            assert "last_updated" in report

        # Step 6: Get activity trends
        with patch.object(
            legacy_service.changelog_parser,
            "analyze_activity_trends",
        ) as mock_trends:
            mock_trends.return_value = {
                "activity_types": {"feature": 1, "fix": 2},
                "total_activities": 3,
                "versions": {"1.0.0": 2, "1.1.0": 1},
            }
            trends = await legacy_service.get_activity_trends()
            assert "activity_types" in trends
            assert "total_activities" in trends

        # Step 7: Get activity summary
        summary = await legacy_service.get_activity_summary()
        assert isinstance(summary, str)
        assert len(summary) > 0

        # Step 8: Export legacy data
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as temp_file:
            export_path = temp_file.name

        try:
            export_result = await legacy_service.export_legacy_data(export_path)
            assert export_result is True

            # Verify exported data
            with open(export_path) as f:
                exported_data = json.load(f)

            assert "total_activities" in exported_data
            assert "changelog_activities" in exported_data
            assert "last_updated" in exported_data

        finally:
            # Cleanup
            Path(export_path).unlink(missing_ok=True)

    @pytest.mark.asyncio
    async def test_agent_state_update_workflow(self, agent_manager, mock_ecs_service):
        """Test agent state update workflow."""
        # Create updated agent state
        updated_state = AgentState(
            agent_id="success-advisor-8",
            name="Success-Advisor-8",
            spirit="lion",
            style="foundation",
            generation=8,
            traits={
                "personality_determination": 0.98,
                "personality_leadership": 0.95,
                "physical_strength": 0.90,
                "ability_strategic_thinking": 0.97,
            },
            memories=[],
            relationships={},
            last_activity=datetime.now(),
            specializations=[
                "release_management",
                "quality_assurance",
                "legacy_tracking",
            ],
            achievements=[
                {
                    "name": "Integration Test Achievement",
                    "description": "Successfully completed integration test",
                    "metadata": {"test_type": "integration"},
                },
            ],
        )

        # Update agent state
        update_result = await agent_manager.update_agent_state(
            "success-advisor-8",
            updated_state,
        )
        assert update_result is True

        # Verify ECS service methods were called
        mock_ecs_service.update_agent.assert_called_once()
        mock_ecs_service.update_personality_trait.assert_called()
        mock_ecs_service.update_physical_trait.assert_called()
        mock_ecs_service.update_ability_trait.assert_called()
        mock_ecs_service.update_agent_specializations.assert_called_once()
        mock_ecs_service.add_agent_achievement.assert_called_once()

    @pytest.mark.asyncio
    async def test_legacy_tracking_activity_workflow(
        self,
        legacy_service,
        mock_ecs_service,
    ):
        """Test legacy tracking activity workflow."""
        # Track multiple activities
        activities = [
            {
                "activity": "Created unified agent state manager",
                "context": {"component": "unified_agent_manager", "type": "feature"},
            },
            {
                "activity": "Implemented legacy tracking service",
                "context": {"component": "legacy_tracking", "type": "feature"},
            },
            {
                "activity": "Added comprehensive test coverage",
                "context": {"component": "testing", "type": "quality"},
            },
        ]

        for activity_data in activities:
            result = await legacy_service.track_success_advisor_8_activity(
                activity_data["activity"],
                activity_data["context"],
            )
            assert result is True

        # Verify all activities were recorded
        assert mock_ecs_service.record_interaction.call_count == len(activities)

    @pytest.mark.asyncio
    async def test_parser_integration(self, legacy_service):
        """Test parser integration and status."""
        # Get parser status
        parser_status = await legacy_service.get_parser_status()
        assert "parser_type" in parser_status
        assert "existing_parser_available" in parser_status
        assert "changelog_path" in parser_status
        assert "changelog_exists" in parser_status

        # Refresh data
        refresh_result = await legacy_service.refresh_data()
        assert refresh_result is True

        # Verify parsers were reinitialized
        assert legacy_service.changelog_parser is not None
        # analyzer was removed, only changelog_parser exists now
        assert legacy_service.changelog_parser is not None

    @pytest.mark.asyncio
    async def test_error_handling_integration(self, agent_manager, legacy_service):
        """Test error handling in integration scenarios."""
        # Test agent not found scenario
        state = await agent_manager.get_agent_state("nonexistent-agent")
        assert state is None

        # Test legacy report with errors
        with patch.object(
            legacy_service,
            "get_success_advisor_8_activities",
            new_callable=AsyncMock,
        ) as mock_activities:
            mock_activities.side_effect = Exception("Test error")

            report = await legacy_service.generate_legacy_report()
            assert "error" in report

        # Test export with errors
        with patch.object(
            legacy_service,
            "generate_legacy_report",
            new_callable=AsyncMock,
        ) as mock_report:
            mock_report.side_effect = Exception("Export error")

            result = await legacy_service.export_legacy_data("/tmp/test.json")
            assert result is False

    @pytest.mark.asyncio
    async def test_performance_characteristics(self, agent_manager, legacy_service):
        """Test performance characteristics of the system."""
        import time

        # Test agent state retrieval performance
        start_time = time.time()
        state = await agent_manager.get_agent_state("success-advisor-8")
        retrieval_time = time.time() - start_time

        assert state is not None
        assert retrieval_time < 1.0  # Should be fast

        # Test legacy report generation performance (with mocked data)
        with (
            patch.object(legacy_service, "get_codebase_movements") as mock_movements,
            patch.object(
                legacy_service,
                "get_success_advisor_8_activities",
            ) as mock_activities,
            patch.object(legacy_service, "_get_ecs_agent_data") as mock_ecs_data,
            patch.object(
                legacy_service.changelog_parser,
                "analyze_activity_trends",
            ) as mock_analysis,
            patch.object(
                legacy_service.changelog_parser,
                "generate_activity_summary",
            ) as mock_summary,
        ):

            mock_movements.return_value = []
            mock_activities.return_value = []
            mock_ecs_data.return_value = {"agent_id": "success-advisor-8"}
            mock_analysis.return_value = {"total_activities": 5}
            mock_summary.return_value = "Test summary"

            start_time = time.time()
            report = await legacy_service.generate_legacy_report()
            report_time = time.time() - start_time

            assert "total_activities" in report
            assert report_time < 1.0  # Should be fast with mocked data

        # Test activity tracking performance
        start_time = time.time()
        await agent_manager.track_agent_activity(
            "success-advisor-8",
            "Performance test activity",
            {"test": "performance"},
        )
        tracking_time = time.time() - start_time

        assert tracking_time < 0.5  # Should be very fast


class TestSystemIntegration:
    """System-level integration tests."""

    @pytest.mark.asyncio
    async def test_end_to_end_workflow(self):
        """Test complete end-to-end workflow."""
        # This would be a full integration test with real database
        # For now, we'll skip it as it requires full system setup
        pytest.skip("Full system integration test requires database setup")

    @pytest.mark.asyncio
    async def test_concurrent_operations(self):
        """Test concurrent operations on the system."""
        # This would test concurrent access patterns
        # For now, we'll skip it as it requires full system setup
        pytest.skip("Concurrent operations test requires full system setup")


if __name__ == "__main__":
    pytest.main([__file__])
