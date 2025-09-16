"""
Integration tests for the main.py debounced reload system.

Tests the complete integration between the reload watcher and the FastAPI server.
"""

import asyncio
import logging
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import Mock, patch, AsyncMock

# Import the main module components
from main import DebouncedReloadServer
from app.core.config import get_config


class TestDebouncedReloadServer(unittest.TestCase):
    """Test cases for the DebouncedReloadServer class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.config = get_config()
        self.config.reload = True
        self.config.reload_debounce_delay = 0.1  # Short delay for testing
        self.server = DebouncedReloadServer(self.config)
    
    def tearDown(self):
        """Clean up after tests."""
        if hasattr(self.server, 'shutdown'):
            # Run shutdown in a new event loop if needed
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # If loop is running, schedule shutdown
                    asyncio.create_task(self.server.shutdown())
                else:
                    # If loop is not running, run shutdown
                    asyncio.run(self.server.shutdown())
            except RuntimeError:
                # No event loop, create one
                asyncio.run(self.server.shutdown())
    
    def test_initialization(self):
        """Test server initialization."""
        self.assertEqual(self.server.config, self.config)
        self.assertIsNone(self.server.server_process)
        self.assertIsNone(self.server.reload_watcher)
        self.assertIsNotNone(self.server.shutdown_event)
    
    def test_reload_callback(self):
        """Test reload callback functionality."""
        # Mock a server process
        mock_process = AsyncMock()
        self.server.server_process = mock_process
        
        # Call reload callback
        self.server.reload_callback()
        
        # Should have cancelled the server process
        mock_process.cancel.assert_called_once()
        self.assertIsNone(self.server.server_process)
    
    @patch('main.uvicorn.Server')
    @patch('main.uvicorn.Config')
    async def test_start_server(self, mock_config_class, mock_server_class):
        """Test server startup."""
        # Mock the uvicorn components
        mock_config = Mock()
        mock_config_class.return_value = mock_config
        
        mock_server = Mock()
        mock_server.serve = AsyncMock()
        mock_server_class.return_value = mock_server
        
        # Start the server
        task = await self.server.start_server()
        
        # Verify configuration was created correctly
        mock_config_class.assert_called_once_with(
            "main:app",
            host=self.config.host,
            port=self.config.port,
            log_level="info",
            reload=False  # We handle reload ourselves
        )
        
        # Verify server was created and started
        mock_server_class.assert_called_once_with(mock_config)
        self.assertIsNotNone(task)
    
    @patch('main.create_reload_watcher')
    async def test_start_reload_watcher(self, mock_create_watcher):
        """Test reload watcher startup."""
        # Mock the watcher
        mock_watcher = Mock()
        mock_create_watcher.return_value = mock_watcher
        
        # Start the reload watcher
        await self.server.start_reload_watcher()
        
        # Verify watcher was created and started
        mock_create_watcher.assert_called_once()
        mock_watcher.start.assert_called_once()
        self.assertEqual(self.server.reload_watcher, mock_watcher)
    
    @patch('main.create_reload_watcher')
    async def test_start_reload_watcher_disabled(self, mock_create_watcher):
        """Test reload watcher startup when reload is disabled."""
        # Disable reload
        self.server.config.reload = False
        
        # Start the reload watcher
        await self.server.start_reload_watcher()
        
        # Should not have created a watcher
        mock_create_watcher.assert_not_called()
        self.assertIsNone(self.server.reload_watcher)
    
    @patch('main.create_reload_watcher')
    @patch('main.uvicorn.Server')
    @patch('main.uvicorn.Config')
    async def test_run_cycle(self, mock_config_class, mock_server_class, mock_create_watcher):
        """Test the main run cycle."""
        # Mock components
        mock_config = Mock()
        mock_config_class.return_value = mock_config
        
        mock_server = Mock()
        mock_server.serve = AsyncMock()
        mock_server_class.return_value = mock_server
        
        mock_watcher = Mock()
        mock_create_watcher.return_value = mock_watcher
        
        # Create a task that will complete quickly
        async def quick_server():
            await asyncio.sleep(0.1)
            return "server_completed"
        
        mock_server.serve = quick_server
        
        # Set up shutdown event to trigger after a short delay
        async def trigger_shutdown():
            await asyncio.sleep(0.2)
            self.server.shutdown_event.set()
        
        # Start both tasks
        run_task = asyncio.create_task(self.server.run())
        shutdown_task = asyncio.create_task(trigger_shutdown())
        
        # Wait for completion
        await asyncio.wait([run_task, shutdown_task], return_when=asyncio.FIRST_COMPLETED)
        
        # Clean up
        if not run_task.done():
            run_task.cancel()
        if not shutdown_task.done():
            shutdown_task.cancel()
        
        # Verify watcher was started
        mock_watcher.start.assert_called_once()
    
    async def test_shutdown(self):
        """Test graceful shutdown."""
        # Mock components
        mock_watcher = Mock()
        self.server.reload_watcher = mock_watcher
        
        mock_process = AsyncMock()
        self.server.server_process = mock_process
        
        # Shutdown
        await self.server.shutdown()
        
        # Verify shutdown was called on watcher
        mock_watcher.shutdown.assert_called_once()
        
        # Verify server process was cancelled
        mock_process.cancel.assert_called_once()


class TestMainModuleIntegration(unittest.TestCase):
    """Test the main module integration."""
    
    @patch('main.DebouncedReloadServer')
    @patch('main.asyncio.run')
    def test_development_mode_startup(self, mock_asyncio_run, mock_server_class):
        """Test startup in development mode."""
        # Mock the config
        with patch('main.get_config') as mock_get_config:
            mock_config = Mock()
            mock_config.reload = True
            mock_get_config.return_value = mock_config
            
            # Mock the server
            mock_server = Mock()
            mock_server_class.return_value = mock_server
            
            # Import and run the main block
            import main
            
            # Verify server was created and run
            mock_server_class.assert_called_once_with(mock_config)
            mock_asyncio_run.assert_called_once_with(mock_server.run())
    
    @patch('main.uvicorn.run')
    def test_production_mode_startup(self, mock_uvicorn_run):
        """Test startup in production mode."""
        # Mock the config
        with patch('main.get_config') as mock_get_config:
            mock_config = Mock()
            mock_config.reload = False
            mock_config.environment = "production"
            mock_config.host = "0.0.0.0"
            mock_config.port = 8000
            mock_config.docs_url = None
            mock_get_config.return_value = mock_config
            
            # Import and run the main block
            import main
            
            # Verify uvicorn was called directly
            mock_uvicorn_run.assert_called_once_with(
                "main:app",
                host="0.0.0.0",
                port=8000,
                log_level="info",
                reload=False
            )


class TestConfigurationIntegration(unittest.TestCase):
    """Test configuration integration with the reload system."""
    
    def test_config_reload_settings(self):
        """Test that config provides correct reload settings."""
        config = get_config()
        
        # Check that reload settings exist
        self.assertIsInstance(config.reload_debounce_delay, float)
        self.assertIsInstance(config.reload_include_patterns, list)
        self.assertIsInstance(config.reload_exclude_patterns, list)
        
        # Check default values
        self.assertEqual(config.reload_debounce_delay, 10.0)
        self.assertIn("*.py", config.reload_include_patterns)
        self.assertIn("*.env", config.reload_include_patterns)
        self.assertIn("*.json", config.reload_include_patterns)
        
        # Check exclusions
        self.assertIn("*.db", config.reload_exclude_patterns)
        self.assertIn("*.log", config.reload_exclude_patterns)
        self.assertIn("__pycache__/*", config.reload_exclude_patterns)
        self.assertIn(".mypy_cache/*", config.reload_exclude_patterns)
    
    def test_environment_variable_override(self):
        """Test that environment variables can override config."""
        import os
        
        # Set environment variable
        os.environ["RELOAD_DEBOUNCE_DELAY"] = "5.0"
        
        try:
            # Get fresh config
            config = get_config()
            
            # Should use environment value
            self.assertEqual(config.reload_debounce_delay, 5.0)
            
        finally:
            # Clean up
            if "RELOAD_DEBOUNCE_DELAY" in os.environ:
                del os.environ["RELOAD_DEBOUNCE_DELAY"]


class TestErrorHandling(unittest.TestCase):
    """Test error handling in the reload system."""
    
    def test_reload_callback_with_no_server_process(self):
        """Test reload callback when no server process exists."""
        server = DebouncedReloadServer(get_config())
        
        # Should not raise an error
        server.reload_callback()
        
        # Should still be None
        self.assertIsNone(server.server_process)
    
    async def test_server_startup_error_handling(self):
        """Test error handling during server startup."""
        server = DebouncedReloadServer(get_config())
        
        # Mock uvicorn to raise an error
        with patch('main.uvicorn.Config') as mock_config_class:
            mock_config_class.side_effect = Exception("Config error")
            
            # Should handle the error gracefully
            with self.assertRaises(Exception):
                await server.start_server()
    
    async def test_watcher_startup_error_handling(self):
        """Test error handling during watcher startup."""
        server = DebouncedReloadServer(get_config())
        
        # Mock create_reload_watcher to raise an error
        with patch('main.create_reload_watcher') as mock_create_watcher:
            mock_create_watcher.side_effect = Exception("Watcher error")
            
            # Should handle the error gracefully
            with self.assertRaises(Exception):
                await server.start_reload_watcher()


if __name__ == "__main__":
    # Configure logging for tests
    logging.basicConfig(level=logging.WARNING)  # Reduce noise during tests
    
    # Run the tests
    unittest.main(verbosity=2)
