"""
🧪 Tests for Custom Reload Handler

This module contains tests for the custom uvicorn reload handler that
provides intelligent service-specific reloading capabilities.
"""

import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pathlib import Path

from fastapi import FastAPI

from app.core.custom_reload_handler import (
    IntelligentReloadHandler,
    create_intelligent_reload_handler,
)


class TestIntelligentReloadHandler:
    """Test the IntelligentReloadHandler class."""

    @pytest.fixture
    def app(self):
        """Create a mock FastAPI app."""
        return FastAPI()

    @pytest.fixture
    def reload_manager(self, app):
        """Create a mock reload manager."""
        manager = MagicMock()
        manager.get_affected_services = MagicMock()
        manager.reload_services = AsyncMock()
        return manager

    @pytest.fixture
    def handler(self, app, reload_manager):
        """Create an IntelligentReloadHandler instance."""
        handler = IntelligentReloadHandler()
        handler.set_app(app)
        handler.set_reload_manager(reload_manager)
        return handler

    def test_init(self):
        """Test IntelligentReloadHandler initialization."""
        handler = IntelligentReloadHandler()
        
        assert handler.reload_manager is None
        assert handler.app is None

    def test_set_app(self, app):
        """Test setting the FastAPI app."""
        handler = IntelligentReloadHandler()
        handler.set_app(app)
        
        assert handler.app == app

    def test_set_reload_manager(self, reload_manager):
        """Test setting the reload manager."""
        handler = IntelligentReloadHandler()
        handler.set_reload_manager(reload_manager)
        
        assert handler.reload_manager == reload_manager

    def test_should_reload_no_manager(self, handler):
        """Test should_reload when no reload manager is set."""
        handler.reload_manager = None
        
        files = [Path("test.py")]
        
        # Should fall back to standard reload behavior
        with patch('super') as mock_super:
            mock_super.return_value.should_reload.return_value = True
            result = handler.should_reload(files)
            assert result is True

    def test_should_reload_no_app(self, handler):
        """Test should_reload when no app is set."""
        handler.app = None
        
        files = [Path("test.py")]
        
        # Should fall back to standard reload behavior
        with patch('super') as mock_super:
            mock_super.return_value.should_reload.return_value = True
            result = handler.should_reload(files)
            assert result is True

    def test_should_reload_service_changes(self, handler, reload_manager):
        """Test should_reload when service files change."""
        files = [Path("app/ecs/world.py")]
        
        # Mock that ECS service is affected
        reload_manager.get_affected_services.return_value = ["ecs_world"]
        
        # Should not reload the entire application
        result = handler.should_reload(files)
        
        assert result is False
        reload_manager.get_affected_services.assert_called_once_with("app/ecs/world.py")

    def test_should_reload_no_service_changes(self, handler, reload_manager):
        """Test should_reload when no service files change."""
        files = [Path("main.py")]
        
        # Mock that no services are affected
        reload_manager.get_affected_services.return_value = []
        
        # Should use standard reload behavior
        with patch('super') as mock_super:
            mock_super.return_value.should_reload.return_value = True
            result = handler.should_reload(files)
            assert result is True

    def test_should_reload_multiple_files(self, handler, reload_manager):
        """Test should_reload with multiple file changes."""
        files = [
            Path("app/ecs/world.py"),
            Path("gatekeeper/api/routes.py"),
            Path("main.py"),
        ]
        
        # Mock that some files affect services
        def mock_get_affected_services(file_path):
            if "ecs" in file_path:
                return ["ecs_world"]
            elif "gatekeeper" in file_path:
                return ["gatekeeper"]
            else:
                return []
        
        reload_manager.get_affected_services.side_effect = mock_get_affected_services
        
        # Should not reload the entire application
        result = handler.should_reload(files)
        
        assert result is False
        assert reload_manager.get_affected_services.call_count == 3

    @pytest.mark.asyncio
    async def test_reload_services_success(self, handler, reload_manager):
        """Test successful service reload."""
        files = [Path("app/ecs/world.py")]
        
        # Mock that ECS service is affected
        reload_manager.get_affected_services.return_value = ["ecs_world"]
        reload_manager.reload_services.return_value = {"ecs_world": True}
        
        # Should not reload the entire application
        result = handler.should_reload(files)
        
        assert result is False
        
        # Give time for async task to complete
        await asyncio.sleep(0.01)
        
        reload_manager.reload_services.assert_called_once_with(["ecs_world"])

    @pytest.mark.asyncio
    async def test_reload_services_failure(self, handler, reload_manager):
        """Test failed service reload."""
        files = [Path("app/ecs/world.py")]
        
        # Mock that ECS service is affected but reload fails
        reload_manager.get_affected_services.return_value = ["ecs_world"]
        reload_manager.reload_services.return_value = {"ecs_world": False}
        
        # Should not reload the entire application
        result = handler.should_reload(files)
        
        assert result is False
        
        # Give time for async task to complete
        await asyncio.sleep(0.01)
        
        reload_manager.reload_services.assert_called_once_with(["ecs_world"])

    @pytest.mark.asyncio
    async def test_reload_services_exception(self, handler, reload_manager):
        """Test service reload with exception."""
        files = [Path("app/ecs/world.py")]
        
        # Mock that ECS service is affected but reload throws exception
        reload_manager.get_affected_services.return_value = ["ecs_world"]
        reload_manager.reload_services.side_effect = Exception("Reload error")
        
        # Should not reload the entire application
        result = handler.should_reload(files)
        
        assert result is False
        
        # Give time for async task to complete
        await asyncio.sleep(0.01)
        
        reload_manager.reload_services.assert_called_once_with(["ecs_world"])

    def test_should_reload_empty_files(self, handler, reload_manager):
        """Test should_reload with empty file list."""
        files = []
        
        # Should use standard reload behavior
        with patch('super') as mock_super:
            mock_super.return_value.should_reload.return_value = False
            result = handler.should_reload(files)
            assert result is False

    def test_should_reload_none_files(self, handler, reload_manager):
        """Test should_reload with None files."""
        files = None
        
        # Should use standard reload behavior
        with patch('super') as mock_super:
            mock_super.return_value.should_reload.return_value = False
            result = handler.should_reload(files)
            assert result is False


class TestCreateIntelligentReloadHandler:
    """Test the create_intelligent_reload_handler function."""

    def test_create_handler(self):
        """Test creating an intelligent reload handler."""
        app = FastAPI()
        reload_manager = MagicMock()
        
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        assert isinstance(handler, IntelligentReloadHandler)
        assert handler.app == app
        assert handler.reload_manager == reload_manager

    def test_create_handler_with_none_args(self):
        """Test creating handler with None arguments."""
        handler = create_intelligent_reload_handler(None, None)
        
        assert isinstance(handler, IntelligentReloadHandler)
        assert handler.app is None
        assert handler.reload_manager is None


class TestIntegration:
    """Integration tests for the custom reload handler."""

    @pytest.fixture
    def app(self):
        """Create a mock FastAPI app."""
        return FastAPI()

    @pytest.fixture
    def reload_manager(self, app):
        """Create a mock reload manager."""
        manager = MagicMock()
        manager.get_affected_services = MagicMock()
        manager.reload_services = AsyncMock()
        return manager

    def test_complete_workflow_ecs_change(self, app, reload_manager):
        """Test complete workflow for ECS file change."""
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        # Simulate ECS file change
        files = [Path("app/ecs/world.py")]
        reload_manager.get_affected_services.return_value = ["ecs_world"]
        reload_manager.reload_services.return_value = {"ecs_world": True}
        
        # Should not reload entire application
        result = handler.should_reload(files)
        
        assert result is False
        reload_manager.get_affected_services.assert_called_once_with("app/ecs/world.py")

    def test_complete_workflow_core_change(self, app, reload_manager):
        """Test complete workflow for core file change."""
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        # Simulate core file change
        files = [Path("main.py")]
        reload_manager.get_affected_services.return_value = []
        
        # Should use standard reload behavior
        with patch('super') as mock_super:
            mock_super.return_value.should_reload.return_value = True
            result = handler.should_reload(files)
            assert result is True

    def test_complete_workflow_mixed_changes(self, app, reload_manager):
        """Test complete workflow for mixed file changes."""
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        # Simulate mixed file changes
        files = [
            Path("app/ecs/world.py"),
            Path("gatekeeper/api/routes.py"),
            Path("main.py"),
        ]
        
        def mock_get_affected_services(file_path):
            if "ecs" in file_path:
                return ["ecs_world"]
            elif "gatekeeper" in file_path:
                return ["gatekeeper"]
            else:
                return []
        
        reload_manager.get_affected_services.side_effect = mock_get_affected_services
        
        # Should not reload entire application (because some files affect services)
        result = handler.should_reload(files)
        
        assert result is False
        assert reload_manager.get_affected_services.call_count == 3

    @pytest.mark.asyncio
    async def test_async_reload_execution(self, app, reload_manager):
        """Test that async reload tasks are properly executed."""
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        # Simulate service file change
        files = [Path("app/ecs/world.py")]
        reload_manager.get_affected_services.return_value = ["ecs_world"]
        reload_manager.reload_services.return_value = {"ecs_world": True}
        
        # Trigger reload
        handler.should_reload(files)
        
        # Give time for async task to complete
        await asyncio.sleep(0.01)
        
        # Verify reload was called
        reload_manager.reload_services.assert_called_once_with(["ecs_world"])


class TestErrorHandling:
    """Test error handling in the custom reload handler."""

    @pytest.fixture
    def app(self):
        """Create a mock FastAPI app."""
        return FastAPI()

    @pytest.fixture
    def reload_manager(self, app):
        """Create a mock reload manager."""
        manager = MagicMock()
        manager.get_affected_services = MagicMock()
        manager.reload_services = AsyncMock()
        return manager

    def test_reload_manager_exception(self, app, reload_manager):
        """Test handling of reload manager exceptions."""
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        # Mock exception in get_affected_services
        reload_manager.get_affected_services.side_effect = Exception("Manager error")
        
        files = [Path("app/ecs/world.py")]
        
        # Should fall back to standard reload behavior
        with patch('super') as mock_super:
            mock_super.return_value.should_reload.return_value = True
            result = handler.should_reload(files)
            assert result is True

    def test_invalid_file_paths(self, app, reload_manager):
        """Test handling of invalid file paths."""
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        # Test with invalid file paths
        files = [Path(""), Path("invalid"), Path("/nonexistent/path")]
        reload_manager.get_affected_services.return_value = []
        
        # Should use standard reload behavior
        with patch('super') as mock_super:
            mock_super.return_value.should_reload.return_value = False
            result = handler.should_reload(files)
            assert result is False

    @pytest.mark.asyncio
    async def test_reload_services_exception_handling(self, app, reload_manager):
        """Test exception handling in async reload services."""
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        # Mock exception in reload_services
        reload_manager.get_affected_services.return_value = ["ecs_world"]
        reload_manager.reload_services.side_effect = Exception("Reload error")
        
        files = [Path("app/ecs/world.py")]
        
        # Should not reload entire application
        result = handler.should_reload(files)
        
        assert result is False
        
        # Give time for async task to complete
        await asyncio.sleep(0.01)
        
        # Verify reload was attempted
        reload_manager.reload_services.assert_called_once_with(["ecs_world"])


class TestPerformance:
    """Test performance characteristics of the custom reload handler."""

    @pytest.fixture
    def app(self):
        """Create a mock FastAPI app."""
        return FastAPI()

    @pytest.fixture
    def reload_manager(self, app):
        """Create a mock reload manager."""
        manager = MagicMock()
        manager.get_affected_services = MagicMock()
        manager.reload_services = AsyncMock()
        return manager

    def test_large_file_list_performance(self, app, reload_manager):
        """Test performance with large file lists."""
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        # Create large list of files
        files = [Path(f"app/ecs/file_{i}.py") for i in range(1000)]
        reload_manager.get_affected_services.return_value = []
        
        # Should handle large lists efficiently
        with patch('super') as mock_super:
            mock_super.return_value.should_reload.return_value = False
            result = handler.should_reload(files)
            assert result is False

    def test_frequent_file_changes(self, app, reload_manager):
        """Test handling of frequent file changes."""
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        # Simulate frequent changes
        for i in range(100):
            files = [Path(f"app/ecs/file_{i}.py")]
            reload_manager.get_affected_services.return_value = ["ecs_world"]
            
            result = handler.should_reload(files)
            assert result is False

    @pytest.mark.asyncio
    async def test_concurrent_reload_requests(self, app, reload_manager):
        """Test handling of concurrent reload requests."""
        handler = create_intelligent_reload_handler(app, reload_manager)
        
        # Mock concurrent reload requests
        reload_manager.get_affected_services.return_value = ["ecs_world"]
        reload_manager.reload_services.return_value = {"ecs_world": True}
        
        # Simulate concurrent file changes
        files_list = [
            [Path("app/ecs/world.py")],
            [Path("app/ecs/service.py")],
            [Path("app/ecs/database.py")],
        ]
        
        # All should not reload entire application
        for files in files_list:
            result = handler.should_reload(files)
            assert result is False
        
        # Give time for async tasks to complete
        await asyncio.sleep(0.01)
        
        # Verify all reloads were attempted
        assert reload_manager.reload_services.call_count == 3
