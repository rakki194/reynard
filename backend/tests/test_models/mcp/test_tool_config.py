"""Tests for MCP tool configuration models."""

import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from app.models.base import Base
from app.models.mcp.tool_config import (
    Tool,
    ToolCategory,
    ToolConfiguration,
    ToolConfigHistory,
    ToolCategoryEnum,
    ExecutionType,
    ToolAction,
)


class TestToolCategory:
    """Test cases for the ToolCategory model."""

    @pytest.fixture
    def engine(self):
        """Create in-memory SQLite engine for testing."""
        engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(engine)
        return engine

    @pytest.fixture
    def session(self, engine):
        """Create database session."""
        Session = sessionmaker(bind=engine)
        session = Session()
        yield session
        session.close()

    def test_tool_category_creation(self, session):
        """Test basic tool category creation."""
        category = ToolCategory(
            name="UTILITY",
            display_name="Utility Tools",
            description="General utility tools",
            icon="wrench",
            color="#3B82F6",
            sort_order=1
        )
        
        session.add(category)
        session.commit()
        
        assert category.id is not None
        assert category.name == "UTILITY"
        assert category.display_name == "Utility Tools"
        assert category.description == "General utility tools"
        assert category.icon == "wrench"
        assert category.color == "#3B82F6"
        assert category.sort_order == 1
        assert category.is_active is True
        assert category.created_at is not None
        assert category.updated_at is not None

    def test_tool_category_unique_name(self, session):
        """Test tool category unique name constraint."""
        category1 = ToolCategory(
            name="UTILITY",
            display_name="Utility Tools"
        )
        session.add(category1)
        session.commit()
        
        category2 = ToolCategory(
            name="UTILITY",  # Same name
            display_name="Another Utility"
        )
        session.add(category2)
        
        with pytest.raises(IntegrityError):
            session.commit()

    def test_tool_category_defaults(self, session):
        """Test tool category default values."""
        category = ToolCategory(
            name="TEST",
            display_name="Test Category"
        )
        
        assert category.is_active is True
        assert category.description is None
        assert category.icon is None
        assert category.color is None
        assert category.sort_order is None


class TestTool:
    """Test cases for the Tool model."""

    @pytest.fixture
    def engine(self):
        """Create in-memory SQLite engine for testing."""
        engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(engine)
        return engine

    @pytest.fixture
    def session(self, engine):
        """Create database session."""
        Session = sessionmaker(bind=engine)
        session = Session()
        yield session
        session.close()

    @pytest.fixture
    def category(self, session):
        """Create a test category."""
        category = ToolCategory(
            name="UTILITY",
            display_name="Utility Tools"
        )
        session.add(category)
        session.commit()
        return category

    def test_tool_creation(self, session, category):
        """Test basic tool creation."""
        tool = Tool(
            name="test_tool",
            category_id=category.id,
            enabled=True,
            description="A test tool",
            dependencies=["dep1", "dep2"],
            config={"key": "value"},
            version="1.0.0",
            is_system_tool=False,
            execution_type="sync",
            timeout_seconds=30,
            max_concurrent=1
        )
        
        session.add(tool)
        session.commit()
        
        assert tool.id is not None
        assert tool.name == "test_tool"
        assert tool.category_id == category.id
        assert tool.enabled is True
        assert tool.description == "A test tool"
        assert tool.dependencies == ["dep1", "dep2"]
        assert tool.config == {"key": "value"}
        assert tool.version == "1.0.0"
        assert tool.is_system_tool is False
        assert tool.execution_type == "sync"
        assert tool.timeout_seconds == 30
        assert tool.max_concurrent == 1
        assert tool.created_at is not None
        assert tool.updated_at is not None

    def test_tool_unique_name(self, session, category):
        """Test tool unique name constraint."""
        tool1 = Tool(
            name="test_tool",
            category_id=category.id,
            description="First tool",
            version="1.0.0"
        )
        session.add(tool1)
        session.commit()
        
        tool2 = Tool(
            name="test_tool",  # Same name
            category_id=category.id,
            description="Second tool",
            version="1.0.0"
        )
        session.add(tool2)
        
        with pytest.raises(IntegrityError):
            session.commit()

    def test_tool_defaults(self, session, category):
        """Test tool default values."""
        tool = Tool(
            name="test_tool",
            category_id=category.id,
            description="A test tool",
            version="1.0.0"
        )
        
        assert tool.enabled is True
        assert tool.dependencies is None
        assert tool.config is None
        assert tool.is_system_tool is False
        assert tool.execution_type == "sync"
        assert tool.timeout_seconds is None
        assert tool.max_concurrent is None

    def test_tool_to_dict(self, session, category):
        """Test tool to_dict method."""
        tool = Tool(
            name="test_tool",
            category_id=category.id,
            description="A test tool",
            version="1.0.0"
        )
        
        session.add(tool)
        session.commit()
        
        tool_dict = tool.to_dict()
        
        assert isinstance(tool_dict, dict)
        assert tool_dict["name"] == "test_tool"
        assert tool_dict["category"] == "UTILITY"
        assert tool_dict["category_display_name"] == "Utility Tools"
        assert tool_dict["enabled"] is True
        assert tool_dict["description"] == "A test tool"
        assert tool_dict["version"] == "1.0.0"
        assert "created_at" in tool_dict
        assert "updated_at" in tool_dict

    def test_tool_relationship_with_category(self, session, category):
        """Test tool relationship with category."""
        tool = Tool(
            name="test_tool",
            category_id=category.id,
            description="A test tool",
            version="1.0.0"
        )
        
        session.add(tool)
        session.commit()
        
        # Test relationship
        assert tool.category is not None
        assert tool.category.name == "UTILITY"
        assert tool.category.display_name == "Utility Tools"


class TestToolConfiguration:
    """Test cases for the ToolConfiguration model."""

    @pytest.fixture
    def engine(self):
        """Create in-memory SQLite engine for testing."""
        engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(engine)
        return engine

    @pytest.fixture
    def session(self, engine):
        """Create database session."""
        Session = sessionmaker(bind=engine)
        session = Session()
        yield session
        session.close()

    def test_tool_configuration_creation(self, session):
        """Test basic tool configuration creation."""
        config = ToolConfiguration(
            version="1.0.0",
            auto_sync_enabled=True,
            default_timeout=30,
            max_concurrent_tools=10,
            cache_ttl_seconds=300,
            settings={"key": "value"}
        )
        
        session.add(config)
        session.commit()
        
        assert config.id is not None
        assert config.version == "1.0.0"
        assert config.auto_sync_enabled is True
        assert config.default_timeout == 30
        assert config.max_concurrent_tools == 10
        assert config.cache_ttl_seconds == 300
        assert config.settings == {"key": "value"}
        assert config.created_at is not None
        assert config.updated_at is not None

    def test_tool_configuration_defaults(self, session):
        """Test tool configuration default values."""
        config = ToolConfiguration(
            version="1.0.0",
            default_timeout=30,
            max_concurrent_tools=10,
            cache_ttl_seconds=300
        )
        
        assert config.auto_sync_enabled is True
        assert config.settings is None


class TestToolConfigHistory:
    """Test cases for the ToolConfigHistory model."""

    @pytest.fixture
    def engine(self):
        """Create in-memory SQLite engine for testing."""
        engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(engine)
        return engine

    @pytest.fixture
    def session(self, engine):
        """Create database session."""
        Session = sessionmaker(bind=engine)
        session = Session()
        yield session
        session.close()

    @pytest.fixture
    def tool(self, session):
        """Create a test tool."""
        category = ToolCategory(
            name="UTILITY",
            display_name="Utility Tools"
        )
        session.add(category)
        session.commit()
        
        tool = Tool(
            name="test_tool",
            category_id=category.id,
            description="A test tool",
            version="1.0.0"
        )
        session.add(tool)
        session.commit()
        return tool

    def test_tool_config_history_creation(self, session, tool):
        """Test basic tool config history creation."""
        history = ToolConfigHistory(
            tool_id=tool.id,
            change_type="created",
            new_values={"name": "test_tool", "enabled": True},
            changed_by="test_user",
            change_reason="Initial creation"
        )
        
        session.add(history)
        session.commit()
        
        assert history.id is not None
        assert history.tool_id == tool.id
        assert history.change_type == "created"
        assert history.new_values == {"name": "test_tool", "enabled": True}
        assert history.changed_by == "test_user"
        assert history.change_reason == "Initial creation"
        assert history.created_at is not None

    def test_tool_config_history_relationship(self, session, tool):
        """Test tool config history relationship with tool."""
        history = ToolConfigHistory(
            tool_id=tool.id,
            change_type="updated",
            old_values={"enabled": True},
            new_values={"enabled": False},
            changed_by="test_user"
        )
        
        session.add(history)
        session.commit()
        
        # Test relationship
        assert history.tool is not None
        assert history.tool.name == "test_tool"
        assert history.tool.description == "A test tool"


class TestEnums:
    """Test cases for model enums."""

    def test_tool_category_enum(self):
        """Test ToolCategoryEnum values."""
        assert ToolCategoryEnum.AGENT == "AGENT"
        assert ToolCategoryEnum.UTILITY == "UTILITY"
        assert ToolCategoryEnum.SECURITY == "SECURITY"
        assert len(ToolCategoryEnum) > 10  # Should have many categories

    def test_execution_type_enum(self):
        """Test ExecutionType enum values."""
        assert ExecutionType.SYNC == "sync"
        assert ExecutionType.ASYNC == "async"

    def test_tool_action_enum(self):
        """Test ToolAction enum values."""
        assert ToolAction.CREATED == "created"
        assert ToolAction.UPDATED == "updated"
        assert ToolAction.ENABLED == "enabled"
        assert ToolAction.DISABLED == "disabled"
        assert ToolAction.DELETED == "deleted"


