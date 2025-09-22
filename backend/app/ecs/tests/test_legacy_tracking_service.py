"""
Tests for Legacy Tracking Service

Comprehensive tests for the Success-Advisor-8 legacy tracking service
that integrates with the existing FastAPI ECS backend.
"""

import pytest
import json
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch, mock_open

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from services.legacy_tracking_service import LegacyTrackingService
from postgres_service import PostgresECSWorldService


class TestLegacyTrackingService:
    """Test cases for LegacyTrackingService."""
    
    @pytest.fixture
    def mock_ecs_service(self):
        """Create mock ECS service."""
        service = AsyncMock(spec=PostgresECSWorldService)
        return service
    
    @pytest.fixture
    def legacy_service(self, mock_ecs_service):
        """Create LegacyTrackingService with mock ECS service."""
        return LegacyTrackingService(mock_ecs_service, ".")
    
    @pytest.mark.asyncio
    async def test_get_success_advisor_8_activities(self, legacy_service):
        """Test getting Success-Advisor-8 activities."""
        # Mock changelog parser
        mock_activities = [
            {
                "activity_id": "sa8-1",
                "activity_type": "release",
                "description": "Success-Advisor-8 released version 1.0.0",
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        with patch.object(legacy_service.changelog_parser, 'parse_success_advisor_8_activities') as mock_parser:
            mock_parser.return_value = mock_activities
            
            # Test
            activities = await legacy_service.get_success_advisor_8_activities()
            
            # Verify
            assert len(activities) == 1
            assert activities[0]["activity_id"] == "sa8-1"
            assert activities[0]["activity_type"] == "release"
            mock_parser.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_codebase_movements(self, legacy_service):
        """Test getting codebase movements."""
        # Mock legacy tracker
        mock_movements = [
            {
                "file_path": "test_file.py",
                "line_number": 10,
                "content": "Success-Advisor-8 implementation",
                "movement_type": "definition"
            }
        ]
        
        with patch.object(legacy_service.legacy_tracker, 'scan_codebase_movements', new_callable=AsyncMock) as mock_tracker:
            mock_tracker.return_value = mock_movements
            
            # Test
            movements = await legacy_service.get_codebase_movements()
            
            # Verify
            assert len(movements) == 1
            assert movements[0]["file_path"] == "test_file.py"
            assert movements[0]["line_number"] == 10
            mock_tracker.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_legacy_report(self, legacy_service):
        """Test generating comprehensive legacy report."""
        # Mock all dependencies
        mock_activities = [{"activity_id": "sa8-1", "description": "Test activity"}]
        mock_movements = [{"file_path": "test.py", "content": "Test movement"}]
        mock_ecs_data = {"agent_id": "success-advisor-8", "name": "Success-Advisor-8"}
        mock_analysis = {"total_activities": 1, "activity_types": {"release": 1}}
        mock_summary = "🦁 Success-Advisor-8 Activity Summary"
        
        with patch.object(legacy_service, 'get_success_advisor_8_activities', new_callable=AsyncMock) as mock_activities_method:
            with patch.object(legacy_service, 'get_codebase_movements', new_callable=AsyncMock) as mock_movements_method:
                with patch.object(legacy_service, '_get_ecs_agent_data', new_callable=AsyncMock) as mock_ecs_method:
                    with patch.object(legacy_service.changelog_parser, 'analyze_activity_trends') as mock_analysis_method:
                        with patch.object(legacy_service.changelog_parser, 'generate_activity_summary') as mock_summary_method:
                            
                            # Set up mocks
                            mock_activities_method.return_value = mock_activities
                            mock_movements_method.return_value = mock_movements
                            mock_ecs_method.return_value = mock_ecs_data
                            mock_analysis_method.return_value = mock_analysis
                            mock_summary_method.return_value = mock_summary
                            
                            # Test
                            report = await legacy_service.generate_legacy_report()
                            
                            # Verify
                            assert report["total_activities"] == 1
                            assert report["total_code_movements"] == 1
                            assert report["changelog_activities"] == mock_activities
                            assert report["codebase_movements"] == mock_movements
                            assert report["ecs_agent_data"] == mock_ecs_data
                            assert report["activity_analysis"] == mock_analysis
                            assert report["summary"] == mock_summary
                            assert "last_updated" in report
                            assert "codebase_path" in report
                            assert "parser_info" in report
    
    @pytest.mark.asyncio
    async def test_track_success_advisor_8_activity(self, legacy_service, mock_ecs_service):
        """Test tracking Success-Advisor-8 activity."""
        # Mock ECS service
        mock_ecs_service.record_interaction = AsyncMock()
        
        # Test
        result = await legacy_service.track_success_advisor_8_activity(
            "Test activity",
            {"context": "test"}
        )
        
        # Verify
        assert result is True
        mock_ecs_service.record_interaction.assert_called_once_with(
            agent_id="success-advisor-8",
            interaction_type="legacy_activity",
            description="Test activity",
            metadata={"context": "test"}
        )
    
    @pytest.mark.asyncio
    async def test_get_activity_trends(self, legacy_service):
        """Test getting activity trends."""
        # Mock analyzer
        mock_trends = {
            "activity_types": {"release": 5, "feature": 3},
            "versions": {"1.0.0": 2, "1.1.0": 3},
            "total_activities": 8
        }
        
        with patch.object(legacy_service.changelog_parser, 'analyze_activity_trends') as mock_analyzer:
            mock_analyzer.return_value = mock_trends
            
            # Test
            trends = await legacy_service.get_activity_trends()
            
            # Verify
            assert trends == mock_trends
            mock_analyzer.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_activity_summary(self, legacy_service):
        """Test getting activity summary."""
        # Mock analyzer
        mock_summary = "🦁 Success-Advisor-8 Activity Summary\n\n📊 Total Activities: 8"
        
        with patch.object(legacy_service.changelog_parser, 'generate_activity_summary') as mock_analyzer:
            mock_analyzer.return_value = mock_summary
            
            # Test
            summary = await legacy_service.get_activity_summary()
            
            # Verify
            assert summary == mock_summary
            mock_analyzer.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_export_legacy_data(self, legacy_service):
        """Test exporting legacy data."""
        # Mock report generation
        mock_report = {
            "total_activities": 5,
            "summary": "Test report",
            "last_updated": datetime.now().isoformat()
        }
        
        with patch.object(legacy_service, 'generate_legacy_report', new_callable=AsyncMock) as mock_report_method:
            with patch('builtins.open', mock_open()) as mock_file:
                with patch('pathlib.Path.mkdir') as mock_mkdir:
                    with patch('pathlib.Path.write_text') as mock_write:
                        
                        # Set up mocks
                        mock_report_method.return_value = mock_report
                        
                        # Test
                        result = await legacy_service.export_legacy_data("/tmp/test_export.json")
                        
                        # Verify
                        assert result is True
                        mock_mkdir.assert_called_once()
                        mock_write.assert_called_once()
                        
                        # Verify JSON content
                        written_content = mock_write.call_args[0][0]
                        parsed_content = json.loads(written_content)
                        assert parsed_content["total_activities"] == 5
    
    @pytest.mark.asyncio
    async def test_get_ecs_agent_data_success(self, legacy_service, mock_ecs_service):
        """Test getting ECS agent data successfully."""
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
        
        # Mock ECS service
        mock_ecs_service.get_agent_by_name.return_value = mock_agent
        
        # Test
        agent_data = await legacy_service._get_ecs_agent_data()
        
        # Verify
        assert agent_data is not None
        assert agent_data["agent_id"] == "success-advisor-8"
        assert agent_data["name"] == "Success-Advisor-8"
        assert agent_data["spirit"] == "lion"
        assert agent_data["style"] == "foundation"
        assert agent_data["generation"] == 8
        assert agent_data["active"] is True
        assert "created_at" in agent_data
        assert "last_activity" in agent_data
    
    @pytest.mark.asyncio
    async def test_get_ecs_agent_data_not_found(self, legacy_service, mock_ecs_service):
        """Test getting ECS agent data when agent not found."""
        # Mock ECS service to return None
        mock_ecs_service.get_agent_by_name.return_value = None
        
        # Test
        agent_data = await legacy_service._get_ecs_agent_data()
        
        # Verify
        assert agent_data is None
        # Should try both name variations
        assert mock_ecs_service.get_agent_by_name.call_count == 2
    
    @pytest.mark.asyncio
    async def test_get_parser_status(self, legacy_service):
        """Test getting parser status."""
        # Mock parser info
        mock_info = {
            "parser_type": "unified",
            "existing_parser_available": True,
            "changelog_path": "CHANGELOG.md",
            "changelog_exists": True
        }
        
        with patch.object(legacy_service.changelog_parser, 'get_parser_info') as mock_parser_info:
            mock_parser_info.return_value = mock_info
            
            # Test
            status = await legacy_service.get_parser_status()
            
            # Verify
            assert status == mock_info
            mock_parser_info.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_refresh_data(self, legacy_service):
        """Test refreshing legacy tracking data."""
        # Test
        result = await legacy_service.refresh_data()
        
        # Verify
        assert result is True
        # Verify parsers were reinitialized
        assert legacy_service.changelog_parser is not None
        # analyzer was removed, only changelog_parser exists now
    
    @pytest.mark.asyncio
    async def test_close(self, legacy_service):
        """Test closing the legacy tracking service."""
        # Test
        await legacy_service.close()
        
        # Should complete without errors
        assert True


class TestErrorHandling:
    """Test error handling scenarios."""
    
    @pytest.mark.asyncio
    async def test_generate_legacy_report_error(self):
        """Test error handling in legacy report generation."""
        # Create service with mock that raises exception
        mock_ecs_service = AsyncMock(spec=PostgresECSWorldService)
        legacy_service = LegacyTrackingService(mock_ecs_service, ".")
        
        with patch.object(legacy_service, 'get_success_advisor_8_activities', new_callable=AsyncMock) as mock_activities:
            mock_activities.side_effect = Exception("Test error")
            
            # Test
            report = await legacy_service.generate_legacy_report()
            
            # Verify error handling
            assert "error" in report
            assert "Test error" in report["error"]
    
    @pytest.mark.asyncio
    async def test_export_legacy_data_error(self):
        """Test error handling in data export."""
        # Create service with mock that raises exception
        mock_ecs_service = AsyncMock(spec=PostgresECSWorldService)
        legacy_service = LegacyTrackingService(mock_ecs_service, ".")
        
        with patch.object(legacy_service, 'generate_legacy_report', new_callable=AsyncMock) as mock_report:
            mock_report.side_effect = Exception("Export error")
            
            # Test
            result = await legacy_service.export_legacy_data("/tmp/test.json")
            
            # Verify error handling
            assert result is False


if __name__ == "__main__":
    pytest.main([__file__])
