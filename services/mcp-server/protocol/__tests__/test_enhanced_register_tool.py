#!/usr/bin/env python3
"""
Test Suite for Enhanced @register_tool Decorator
================================================

Tests for the enhanced tool registration decorator with schema validation.

Follows the 140-line axiom and modular architecture principles.
"""

import pytest
from protocol.tool_registry import register_tool


class TestEnhancedRegisterTool:
    """Test cases for enhanced @register_tool decorator."""

    def test_valid_tool_registration(self):
        """Test registration of a tool with valid schema."""

        @register_tool(
            name="test_tool",
            category="test",
            description="A test tool",
            input_schema={
                "type": "object",
                "properties": {
                    "param1": {"type": "string", "description": "Test parameter"}
                },
                "required": ["param1"],
            },
        )
        def test_function(arguments):
            return {"result": "success"}

        # Check that registration data was stored
        assert hasattr(test_function, "_tool_registration")
        reg_data = test_function._tool_registration

        assert reg_data["name"] == "test_tool"
        assert reg_data["category"] == "test"
        assert reg_data["description"] == "A test tool"
        assert reg_data["inputSchema"]["type"] == "object"
        assert "param1" in reg_data["inputSchema"]["properties"]

    def test_tool_registration_with_default_schema(self):
        """Test registration of a tool without explicit schema."""

        @register_tool(
            name="default_tool",
            category="test",
            description="A tool with default schema",
        )
        def default_function(arguments):
            return {"result": "success"}

        # Check that default schema was generated
        reg_data = default_function._tool_registration
        assert reg_data["inputSchema"]["type"] == "object"
        assert "arguments" in reg_data["inputSchema"]["properties"]

    def test_invalid_schema_raises_error(self):
        """Test that invalid schema raises validation error."""
        with pytest.raises(ValueError, match="Invalid tool schema"):

            @register_tool(
                name="invalid_tool",
                category="test",
                description="A tool with invalid schema",
                input_schema={"type": "invalid_type", "properties": {}},  # Invalid type
            )
            def invalid_function(arguments):
                return {"result": "success"}

    def test_missing_required_field_raises_error(self):
        """Test that missing required fields raise validation error."""
        with pytest.raises(ValueError, match="Invalid tool schema"):

            @register_tool(
                name="incomplete_tool",
                category="test",
                description="A tool with incomplete schema",
                input_schema={
                    "type": "object"
                    # Missing properties field
                },
            )
            def incomplete_function(arguments):
                return {"result": "success"}

    def test_tool_registration_with_dependencies(self):
        """Test registration with dependencies."""

        @register_tool(
            name="dependent_tool",
            category="test",
            description="A tool with dependencies",
            dependencies=["dep1", "dep2"],
        )
        def dependent_function(arguments):
            return {"result": "success"}

        reg_data = dependent_function._tool_registration
        assert reg_data["dependencies"] == ["dep1", "dep2"]

    def test_tool_registration_with_config(self):
        """Test registration with config."""
        config = {"timeout": 30, "retries": 3}

        @register_tool(
            name="configured_tool",
            category="test",
            description="A tool with config",
            config=config,
        )
        def configured_function(arguments):
            return {"result": "success"}

        reg_data = configured_function._tool_registration
        assert reg_data["config"] == config

    def test_tool_registration_disabled(self):
        """Test registration of disabled tool."""

        @register_tool(
            name="disabled_tool",
            category="test",
            description="A disabled tool",
            enabled=False,
        )
        def disabled_function(arguments):
            return {"result": "success"}

        reg_data = disabled_function._tool_registration
        assert reg_data["enabled"] is False

    def test_tool_registration_async(self):
        """Test registration of async tool."""

        @register_tool(
            name="async_tool",
            category="test",
            description="An async tool",
            execution_type="async",
        )
        async def async_function(arguments):
            return {"result": "success"}

        reg_data = async_function._tool_registration
        assert reg_data["execution_type"] == "async"
