#!/usr/bin/env python3
"""
MCP Server PostgreSQL Tool Configuration Tests
=============================================

Tests for the MCP server's PostgreSQL tool configuration service integration.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import os
import sys
from pathlib import Path
from typing import Dict, List, Any
from unittest.mock import patch, MagicMock

import pytest

# Add the MCP server directory to the Python path
mcp_server_dir = Path(__file__).parent.parent
sys.path.insert(0, str(mcp_server_dir))

from services.postgresql_tool_config_service import ToolConfigService


class TestMCPPostgreSQLToolConfig:
    """Test suite for MCP server PostgreSQL tool configuration service."""

    def test_service_initialization(self):
        """Test service initialization."""
        service = ToolConfigService(backend_url="http://localhost:8000", timeout=30.0)
        assert service.backend_url == "http://localhost:8000"
        assert service.timeout == 30.0
        assert service._cache_ttl == 300
        assert service._last_cache_update == 0

    def test_get_headers(self):
        """Test HTTP headers generation."""
        service = ToolConfigService()
        headers = service._get_headers()
        assert headers["Content-Type"] == "application/json"
        assert headers["Accept"] == "application/json"
        assert headers["User-Agent"] == "Reynard-MCP-Server/1.0.0"

    def test_cache_operations(self):
        """Test cache operations."""
        service = ToolConfigService()
        
        # Test cache update
        service._update_cache("test_key", "test_value")
        assert "test_key" in service._cache
        assert service._cache["test_key"]["value"] == "test_value"
        
        # Test cache retrieval
        cached_value = service._get_from_cache("test_key")
        assert cached_value == "test_value"
        
        # Test cache validity
        assert service._is_cache_valid() is True

    @pytest.mark.asyncio
    async def test_get_all_tools_success(self):
        """Test successful get_all_tools call."""
        # Mock the HTTP response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {
                "id": "test-id-1",
                "name": "test_tool_1",
                "category": "AGENT",
                "category_display_name": "Agent Tools",
                "enabled": True,
                "description": "Test tool 1",
                "dependencies": [],
                "config": {},
                "version": "1.0.0",
                "is_system_tool": True,
                "execution_type": "sync",
                "timeout_seconds": 30,
                "max_concurrent": 1,
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "test-id-2",
                "name": "test_tool_2",
                "category": "UTILITY",
                "category_display_name": "Utility Tools",
                "enabled": False,
                "description": "Test tool 2",
                "dependencies": ["dep1"],
                "config": {"setting": "value"},
                "version": "1.0.0",
                "is_system_tool": False,
                "execution_type": "async",
                "timeout_seconds": 60,
                "max_concurrent": 2,
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z"
            }
        ]
        mock_response.raise_for_status.return_value = None

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            service = ToolConfigService(backend_url="http://localhost:8000")
            tools = await service.get_all_tools()
            
            assert len(tools) == 2
            assert tools[0]["name"] == "test_tool_1"
            assert tools[0]["category"] == "AGENT"
            assert tools[0]["enabled"] is True
            assert tools[1]["name"] == "test_tool_2"
            assert tools[1]["category"] == "UTILITY"
            assert tools[1]["enabled"] is False

    @pytest.mark.asyncio
    async def test_get_all_tools_with_disabled(self):
        """Test get_all_tools with include_disabled=True."""
        # Mock the HTTP response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {
                "id": "test-id-1",
                "name": "enabled_tool",
                "category": "AGENT",
                "enabled": True,
                "description": "Enabled tool",
                "dependencies": [],
                "config": {},
                "version": "1.0.0",
                "is_system_tool": True,
                "execution_type": "sync",
                "timeout_seconds": 30,
                "max_concurrent": 1,
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z"
            },
            {
                "id": "test-id-2",
                "name": "disabled_tool",
                "category": "UTILITY",
                "enabled": False,
                "description": "Disabled tool",
                "dependencies": [],
                "config": {},
                "version": "1.0.0",
                "is_system_tool": False,
                "execution_type": "sync",
                "timeout_seconds": 30,
                "max_concurrent": 1,
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z"
            }
        ]
        mock_response.raise_for_status.return_value = None

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            service = ToolConfigService(backend_url="http://localhost:8000")
            tools = await service.get_all_tools(include_disabled=True)
            
            assert len(tools) == 2
            assert any(tool["name"] == "enabled_tool" for tool in tools)
            assert any(tool["name"] == "disabled_tool" for tool in tools)

    @pytest.mark.asyncio
    async def test_get_tool_by_name_success(self):
        """Test successful get_tool_by_name call."""
        # Mock the HTTP response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "id": "test-id-1",
            "name": "specific_tool",
            "category": "AGENT",
            "category_display_name": "Agent Tools",
            "enabled": True,
            "description": "A specific tool",
            "dependencies": ["dep1", "dep2"],
            "config": {"key": "value"},
            "version": "1.0.0",
            "is_system_tool": True,
            "execution_type": "sync",
            "timeout_seconds": 30,
            "max_concurrent": 1,
            "created_at": "2025-01-01T00:00:00Z",
            "updated_at": "2025-01-01T00:00:00Z"
        }
        mock_response.raise_for_status.return_value = None

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            service = ToolConfigService(backend_url="http://localhost:8000")
            tool = await service.get_tool_by_name("specific_tool")
            
            assert tool is not None
            assert tool["name"] == "specific_tool"
            assert tool["category"] == "AGENT"
            assert tool["enabled"] is True
            assert tool["dependencies"] == ["dep1", "dep2"]
            assert tool["config"] == {"key": "value"}

    @pytest.mark.asyncio
    async def test_get_tool_by_name_not_found(self):
        """Test get_tool_by_name when tool is not found."""
        # Mock the HTTP response for 404
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.raise_for_status.side_effect = Exception("404 Not Found")

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            service = ToolConfigService(backend_url="http://localhost:8000")
            tool = await service.get_tool_by_name("nonexistent_tool")
            
            assert tool is None

    @pytest.mark.asyncio
    async def test_http_timeout_error(self):
        """Test HTTP timeout error handling."""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.side_effect = Exception("Timeout")
            
            service = ToolConfigService(backend_url="http://localhost:8000")
            tools = await service.get_all_tools()
            
            assert tools == []

    @pytest.mark.asyncio
    async def test_http_connection_error(self):
        """Test HTTP connection error handling."""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.side_effect = Exception("Connection failed")
            
            service = ToolConfigService(backend_url="http://localhost:8000")
            tools = await service.get_all_tools()
            
            assert tools == []

    @pytest.mark.asyncio
    async def test_cache_functionality(self):
        """Test cache functionality."""
        # Mock the HTTP response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {
                "id": "test-id-1",
                "name": "cached_tool",
                "category": "AGENT",
                "enabled": True,
                "description": "Cached tool",
                "dependencies": [],
                "config": {},
                "version": "1.0.0",
                "is_system_tool": True,
                "execution_type": "sync",
                "timeout_seconds": 30,
                "max_concurrent": 1,
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z"
            }
        ]
        mock_response.raise_for_status.return_value = None

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            service = ToolConfigService(backend_url="http://localhost:8000")
            
            # First call should make HTTP request
            tools1 = await service.get_all_tools()
            assert len(tools1) == 1
            assert tools1[0]["name"] == "cached_tool"
            
            # Second call should use cache (no additional HTTP request)
            tools2 = await service.get_all_tools()
            assert len(tools2) == 1
            assert tools2[0]["name"] == "cached_tool"
            
            # Verify cache was used
            assert service._get_from_cache("all_tools_False") == tools1

    def test_backward_compatibility(self):
        """Test backward compatibility with old ToolConfigService interface."""
        service = ToolConfigService()
        
        # Should have the same interface as the old service
        assert hasattr(service, 'get_all_tools')
        assert hasattr(service, 'get_tool_by_name')
        assert hasattr(service, 'get_tools_by_category')
        assert hasattr(service, 'enable_tool')
        assert hasattr(service, 'disable_tool')
        assert hasattr(service, 'toggle_tool')


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
