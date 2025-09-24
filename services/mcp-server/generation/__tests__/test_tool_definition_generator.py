#!/usr/bin/env python3
"""
Test Suite for Tool Definition Generator
========================================

Comprehensive tests for automatic tool definition generation.

Follows the 140-line axiom and modular architecture principles.
"""

from unittest.mock import Mock

from generation.tool_definition_generator import ToolDefinitionGenerator
from protocol.tool_registry import ToolExecutionType, ToolMetadata


class TestToolDefinitionGenerator:
    """Test cases for ToolDefinitionGenerator."""

    def setup_method(self):
        """Set up test fixtures."""
        self.generator = ToolDefinitionGenerator()

    def test_generate_tool_definition_basic(self):
        """Test generation of basic tool definition."""
        metadata = ToolMetadata(
            name="test_tool",
            category="test",
            description="A test tool",
            execution_type=ToolExecutionType.SYNC,
            enabled=True,
            dependencies=[],
            config={},
            handler_method=None,
            source_file="test.py",
            line_number=1,
        )

        result = self.generator.generate_tool_definition(metadata)

        assert result["name"] == "test_tool"
        assert result["description"] == "A test tool"
        assert "inputSchema" in result
        assert result["inputSchema"]["type"] == "object"
        assert result["execution_type"] == "sync"

    def test_generate_tool_definition_with_custom_schema(self):
        """Test generation with custom input schema."""
        custom_schema = {
            "type": "object",
            "properties": {
                "custom_param": {"type": "string", "description": "Custom parameter"}
            },
            "required": ["custom_param"],
        }

        metadata = ToolMetadata(
            name="custom_tool",
            category="test",
            description="A tool with custom schema",
            execution_type=ToolExecutionType.SYNC,
            enabled=True,
            dependencies=[],
            config={"input_schema": custom_schema},
            handler_method=None,
            source_file="test.py",
            line_number=1,
        )

        result = self.generator.generate_tool_definition(metadata)

        assert result["inputSchema"] == custom_schema

    def test_generate_screenshot_schema(self):
        """Test generation of screenshot tool schema."""
        metadata = ToolMetadata(
            name="take_screenshot",
            category="test",
            description="Take a screenshot",
            execution_type=ToolExecutionType.SYNC,
            enabled=True,
            dependencies=[],
            config={},
            handler_method=None,
            source_file="test.py",
            line_number=1,
        )

        result = self.generator.generate_tool_definition(metadata)
        schema = result["inputSchema"]

        assert schema["type"] == "object"
        assert "url" in schema["properties"]
        assert "output_path" in schema["properties"]
        assert "viewport_width" in schema["properties"]
        assert "viewport_height" in schema["properties"]
        assert "full_page" in schema["properties"]
        assert "url" in schema["required"]

    def test_generate_scrape_schema(self):
        """Test generation of scrape tool schema."""
        metadata = ToolMetadata(
            name="scrape_content",
            category="test",
            description="Scrape content",
            execution_type=ToolExecutionType.SYNC,
            enabled=True,
            dependencies=[],
            config={},
            handler_method=None,
            source_file="test.py",
            line_number=1,
        )

        result = self.generator.generate_tool_definition(metadata)
        schema = result["inputSchema"]

        assert schema["type"] == "object"
        assert "url" in schema["properties"]
        assert "selector" in schema["properties"]
        assert "wait_for" in schema["properties"]
        assert "url" in schema["required"]

    def test_generate_test_schema(self):
        """Test generation of test tool schema."""
        metadata = ToolMetadata(
            name="test_connection",
            category="test",
            description="Test connection",
            execution_type=ToolExecutionType.SYNC,
            enabled=True,
            dependencies=[],
            config={},
            handler_method=None,
            source_file="test.py",
            line_number=1,
        )

        result = self.generator.generate_tool_definition(metadata)
        schema = result["inputSchema"]

        assert schema["type"] == "object"
        assert schema["properties"] == {}
        assert schema["required"] == []

    def test_generate_from_registry(self):
        """Test generation from tool registry."""
        # Create mock registry
        mock_registry = Mock()
        mock_metadata = ToolMetadata(
            name="test_tool",
            category="test",
            description="A test tool",
            execution_type=ToolExecutionType.SYNC,
            enabled=True,
            dependencies=[],
            config={},
            handler_method=None,
            source_file="test.py",
            line_number=1,
        )

        mock_registry.list_all_tools.return_value = {"test_tool": mock_metadata}

        result = self.generator.generate_from_registry(mock_registry)

        assert "test_tool" in result
        assert result["test_tool"]["name"] == "test_tool"
        assert result["test_tool"]["description"] == "A test tool"

    def test_generate_with_dependencies(self):
        """Test generation with dependencies."""
        metadata = ToolMetadata(
            name="dependent_tool",
            category="test",
            description="A tool with dependencies",
            execution_type=ToolExecutionType.SYNC,
            enabled=True,
            dependencies=["dependency1", "dependency2"],
            config={},
            handler_method=None,
            source_file="test.py",
            line_number=1,
        )

        result = self.generator.generate_tool_definition(metadata)

        assert result["dependencies"] == ["dependency1", "dependency2"]

    def test_generate_with_config(self):
        """Test generation with config."""
        config = {"timeout": 30, "retries": 3}
        metadata = ToolMetadata(
            name="configured_tool",
            category="test",
            description="A tool with config",
            execution_type=ToolExecutionType.SYNC,
            enabled=True,
            dependencies=[],
            config=config,
            handler_method=None,
            source_file="test.py",
            line_number=1,
        )

        result = self.generator.generate_tool_definition(metadata)

        assert result["config"] == config

    def test_generate_disabled_tool(self):
        """Test generation of disabled tool."""
        metadata = ToolMetadata(
            name="disabled_tool",
            category="test",
            description="A disabled tool",
            execution_type=ToolExecutionType.SYNC,
            enabled=False,
            dependencies=[],
            config={},
            handler_method=None,
            source_file="test.py",
            line_number=1,
        )

        result = self.generator.generate_tool_definition(metadata)

        assert result["enabled"] is False
