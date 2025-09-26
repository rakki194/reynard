#!/usr/bin/env python3
"""
PostgreSQL Tool Configuration Tests
==================================

Comprehensive tests for the PostgreSQL-based tool configuration system.
Tests database models, service layer, API endpoints, and MCP server integration.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import os
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Any, Dict, List
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI

from app.api.mcp.tool_config_endpoints import router
from app.core.database import get_db_session, test_connection
from app.models.base import Base
from app.models.mcp.tool_config import (
    Tool,
    ToolCategory,
    ToolCategoryEnum,
    ToolConfiguration,
)
from app.services.tool_config_service import ToolConfigService

# Test database URL (use in-memory SQLite for testing)
TEST_DATABASE_URL = "sqlite:///:memory:"


class TestPostgreSQLToolConfig:
    """Test suite for PostgreSQL tool configuration system."""

    engine = None
    SessionLocal = None
    app = None

    @classmethod
    def setup_class(cls):
        """Set up test database and FastAPI app once for all tests."""
        # Use in-memory SQLite for testing
        cls.engine = create_engine(TEST_DATABASE_URL)
        cls.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=cls.engine
        )
        Base.metadata.create_all(bind=cls.engine)

        # Initialize FastAPI app for testing
        cls.app = FastAPI()
        cls.app.include_router(router)

    @classmethod
    def teardown_class(cls):
        """Clean up test database."""
        Base.metadata.drop_all(bind=cls.engine)
        if os.path.exists("./test_tool_config.db"):
            os.remove("./test_tool_config.db")

    def setup_method(self):
        """Set up for each test method."""
        # Create a fresh session for each test
        self.db = self.SessionLocal()
        self.service = ToolConfigService(db_session=self.db)

        # Clear all data before each test
        self.db.query(Tool).delete()
        self.db.query(ToolCategory).delete()
        self.db.query(ToolConfiguration).delete()
        self.db.commit()

    def teardown_method(self):
        """Clean up after each test method."""
        self.db.close()

    def test_database_models(self):
        """Test database models creation and relationships."""
        # Test ToolCategory model
        category = ToolCategory(
            name=ToolCategoryEnum.AGENT,
            display_name="Agent Tools",
            description="Tools for agent management",
            icon="🤖",
            color="#FF6B6B",
            sort_order=1,
            is_active=True,
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        assert category.id is not None
        assert category.name == ToolCategoryEnum.AGENT
        assert category.display_name == "Agent Tools"

        # Test Tool model
        tool = Tool(
            name="test_tool",
            category_id=category.id,
            enabled=True,
            description="A test tool",
            dependencies=["dep1", "dep2"],
            config={"setting1": "value1"},
            version="1.0.0",
            is_system_tool=False,
            execution_type="sync",
            timeout_seconds=60,
            max_concurrent=5,
        )
        self.db.add(tool)
        self.db.commit()
        self.db.refresh(tool)
        assert tool.id is not None
        assert tool.name == "test_tool"
        assert tool.category.name == ToolCategoryEnum.AGENT
        assert tool.enabled is True
        assert tool.dependencies == ["dep1", "dep2"]
        assert tool.config == {"setting1": "value1"}

        # Test ToolConfiguration model
        global_config = ToolConfiguration(
            version="1.0.0",
            auto_sync_enabled=True,
            default_timeout=30,
            max_concurrent_tools=10,
            cache_ttl_seconds=300,
            settings={"log_level": "INFO"},
        )
        self.db.add(global_config)
        self.db.commit()
        self.db.refresh(global_config)
        assert global_config.id is not None
        assert global_config.version == "1.0.0"
        assert global_config.auto_sync_enabled is True
        assert global_config.settings == {"log_level": "INFO"}

    def test_tool_to_dict_method(self):
        """Test the to_dict method on Tool model."""
        # Create test data
        category = ToolCategory(
            name=ToolCategoryEnum.AGENT,
            display_name="Agent Tools",
            description="Tools for agent management",
            icon="🤖",
            color="#FF6B6B",
            sort_order=1,
            is_active=True,
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)

        tool = Tool(
            name="test_tool_dict",
            category_id=category.id,
            enabled=True,
            description="A test tool for dict conversion",
            dependencies=["dep_a"],
            config={"key": "value"},
            version="1.0.0",
            is_system_tool=True,
            execution_type="async",
            timeout_seconds=120,
            max_concurrent=2,
        )
        self.db.add(tool)
        self.db.commit()
        self.db.refresh(tool)

        tool_dict = tool.to_dict()
        assert isinstance(tool_dict, dict)
        assert tool_dict["name"] == "test_tool_dict"
        assert tool_dict["category"] == "AGENT"
        assert tool_dict["category_display_name"] == "Agent Tools"
        assert tool_dict["enabled"] is True
        assert tool_dict["dependencies"] == ["dep_a"]
        assert tool_dict["config"] == {"key": "value"}
        assert "id" in tool_dict
        assert "created_at" in tool_dict
        assert "updated_at" in tool_dict

    def test_tool_config_service_crud(self):
        """Test CRUD operations in ToolConfigService."""
        # Create test category
        category = ToolCategory(
            name=ToolCategoryEnum.AGENT,
            display_name="Agent Tools",
            description="Tools for agent management",
            icon="🤖",
            color="#FF6B6B",
            sort_order=1,
            is_active=True,
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)

        # Create tool
        tool_data = {
            "name": "test_tool",
            "category_id": str(category.id),
            "enabled": True,
            "description": "A test tool",
            "dependencies": [],
            "config": {},
            "version": "1.0.0",
            "is_system_tool": False,
            "execution_type": "sync",
            "timeout_seconds": 30,
            "max_concurrent": 1,
        }
        created_tool = self.service.create_tool(tool_data)
        assert created_tool is not None
        assert created_tool["name"] == "test_tool"

        # Get tool
        fetched_tool = self.service.get_tool_by_name("test_tool")
        assert fetched_tool is not None
        assert fetched_tool["name"] == "test_tool"

        # Update tool
        updated_data = {"description": "Updated description", "enabled": False}
        updated_tool = self.service.update_tool("test_tool", updated_data)
        assert updated_tool is not None
        assert updated_tool["description"] == "Updated description"
        assert updated_tool["enabled"] is False

        # Delete tool
        deleted = self.service.delete_tool("test_tool")
        assert deleted is True
        assert self.service.get_tool_by_name("test_tool") is None

    def test_tool_config_service_categories(self):
        """Test category operations in ToolConfigService."""
        # Test get all categories
        categories = self.service.get_tool_categories()
        assert isinstance(categories, list)

        # Test get tools by category
        tools = self.service.get_tools_by_category("AGENT")
        assert isinstance(tools, list)

        # Create a category manually in the database
        category = ToolCategory(
            name=ToolCategoryEnum.AGENT,
            display_name="Agent Tools",
            description="Tools for agent management",
            icon="🤖",
            color="#FF6B6B",
            sort_order=1,
            is_active=True,
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)

        # Get all categories again
        categories = self.service.get_tool_categories()
        assert len(categories) >= 1
        assert any(cat["name"] == "AGENT" for cat in categories)

    def test_tool_config_service_statistics(self):
        """Test tool statistics generation."""
        # Create test data
        category_agent = ToolCategory(
            name=ToolCategoryEnum.AGENT, display_name="Agent Tools"
        )
        category_utility = ToolCategory(
            name=ToolCategoryEnum.UTILITY, display_name="Utility Tools"
        )
        self.db.add_all([category_agent, category_utility])
        self.db.commit()
        self.db.refresh(category_agent)
        self.db.refresh(category_utility)

        self.service.create_tool(
            {
                "name": "tool_a",
                "category": ToolCategoryEnum.AGENT,
                "enabled": True,
                "description": "desc",
            }
        )
        self.service.create_tool(
            {
                "name": "tool_b",
                "category": ToolCategoryEnum.AGENT,
                "enabled": False,
                "description": "desc",
            }
        )
        self.service.create_tool(
            {
                "name": "tool_c",
                "category": ToolCategoryEnum.UTILITY,
                "enabled": True,
                "description": "desc",
            }
        )

        stats = self.service.get_tool_statistics()
        assert stats["total_tools"] == 3
        assert stats["enabled_tools"] == 2
        assert stats["disabled_tools"] == 1
        assert stats["categories"]["AGENT"] == 2
        assert stats["categories"]["UTILITY"] == 1

    def test_fastapi_endpoints(self):
        """Test FastAPI endpoints."""
        client = TestClient(self.app)

        # Create a category directly in the database first
        category = ToolCategory(
            name=ToolCategoryEnum.UTILITY,
            display_name="API Test Category",
            description="A category for API testing",
            icon="⚡",
            color="#000000",
            is_active=True,
            sort_order=1,
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)

        # Create a tool with unique name
        import uuid

        unique_tool_name = f"api_test_tool_{uuid.uuid4().hex[:8]}"
        tool_data = {
            "name": unique_tool_name,
            "category": "UTILITY",
            "enabled": True,
            "description": "An API test tool",
            "dependencies": [],
            "config": {},
            "version": "1.0.0",
            "is_system_tool": False,
            "execution_type": "sync",
            "timeout_seconds": 30,
            "max_concurrent": 1,
        }
        response = client.post("/api/mcp/tool-config/tools", json=tool_data)
        assert response.status_code == 200
        assert response.json()["name"] == unique_tool_name

        # Get all tools
        response = client.get("/api/mcp/tool-config/tools")
        assert response.status_code == 200
        assert len(response.json()) >= 1
        assert any(tool["name"] == unique_tool_name for tool in response.json())

        # Get specific tool
        response = client.get(f"/api/mcp/tool-config/tools/{unique_tool_name}")
        assert response.status_code == 200
        assert response.json()["name"] == unique_tool_name

        # Update tool
        response = client.put(
            f"/api/mcp/tool-config/tools/{unique_tool_name}", json={"enabled": False}
        )
        assert response.status_code == 200
        assert response.json()["enabled"] is False

        # Get tool statistics
        response = client.get("/api/mcp/tool-config/statistics")
        assert response.status_code == 200
        stats = response.json()
        assert stats["total_tools"] >= 1
        assert stats["disabled_tools"] >= 1

    def test_mcp_server_postgresql_service(self):
        """Test MCP server's PostgreSQL tool config service integration."""
        # Mock the backend API calls
        with patch('httpx.AsyncClient') as mock_async_client:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = [
                {
                    "name": "mock_tool_1",
                    "category": "AGENT",
                    "enabled": True,
                    "description": "Mock tool 1",
                },
                {
                    "name": "mock_tool_2",
                    "category": "UTILITY",
                    "enabled": False,
                    "description": "Mock tool 2",
                },
            ]
            mock_response.raise_for_status.return_value = None
            mock_async_client.return_value.__aenter__.return_value.get.return_value = (
                mock_response
            )

            async def test_async():
                # Import the service from the correct path
                import sys
                from pathlib import Path

                mcp_server_dir = (
                    Path(__file__).parent.parent.parent / "services" / "mcp-server"
                )
                sys.path.insert(0, str(mcp_server_dir))

                from services.postgresql_tool_config_service import (
                    PostgreSQLToolConfigService,
                )

                service = PostgreSQLToolConfigService(
                    backend_url="http://localhost:8000"
                )
                tools = await service.get_all_tools()
                assert len(tools) == 2
                assert tools[0]["name"] == "mock_tool_1"

            asyncio.run(test_async())


def test_database_connection():
    """Test database connection."""
    # Test the main database connection
    assert test_connection() is True


def test_tool_category_enum():
    """Test ToolCategoryEnum values."""
    assert ToolCategoryEnum.AGENT == "AGENT"
    assert ToolCategoryEnum.UTILITY == "UTILITY"
    assert ToolCategoryEnum.SECURITY == "SECURITY"
    assert len(ToolCategoryEnum) >= 10  # Should have many categories


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
