#!/usr/bin/env python3
"""
Test Suite for MCP Schema Validator
===================================

Comprehensive tests for schema validation to ensure protocol compliance.

Follows the 140-line axiom and modular architecture principles.
"""

import pytest

from validation.schema_validator import MCPSchemaValidator


class TestMCPSchemaValidator:
    """Test cases for MCPSchemaValidator."""

    def setup_method(self):
        """Set up test fixtures."""
        self.validator = MCPSchemaValidator()

    def test_valid_tool_schema(self):
        """Test validation of a valid tool schema."""
        valid_schema = {
            "name": "test_tool",
            "description": "A test tool",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "param1": {"type": "string", "description": "Test parameter"}
                },
                "required": ["param1"],
            },
        }

        result = self.validator.validate_tool_schema(valid_schema)
        assert result.is_valid
        assert len(result.errors) == 0

    def test_missing_required_fields(self):
        """Test validation with missing required fields."""
        invalid_schema = {
            "name": "test_tool"
            # Missing description and inputSchema
        }

        result = self.validator.validate_tool_schema(invalid_schema)
        assert not result.is_valid
        assert "Missing required field: 'description'" in result.errors
        assert "Missing required field: 'inputSchema'" in result.errors

    def test_deprecated_parameters_field(self):
        """Test detection of deprecated parameters field."""
        schema_with_parameters = {
            "name": "test_tool",
            "description": "A test tool",
            "parameters": {"type": "object", "properties": {}},
        }

        result = self.validator.validate_tool_schema(schema_with_parameters)
        assert not result.is_valid
        assert (
            "Field 'parameters' is deprecated, use 'inputSchema' instead"
            in result.errors
        )

    def test_invalid_input_schema_type(self):
        """Test validation of invalid inputSchema type."""
        invalid_schema = {
            "name": "test_tool",
            "description": "A test tool",
            "inputSchema": {"type": "invalid_type", "properties": {}},
        }

        result = self.validator.validate_tool_schema(invalid_schema)
        assert not result.is_valid
        assert "inputSchema type must be one of: ['object']" in result.errors

    def test_missing_property_description(self):
        """Test warning for missing property descriptions."""
        schema_without_descriptions = {
            "name": "test_tool",
            "description": "A test tool",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "param1": {
                        "type": "string"
                        # Missing description
                    }
                },
            },
        }

        result = self.validator.validate_tool_schema(schema_without_descriptions)
        assert result.is_valid
        assert len(result.warnings) > 0
        assert "Property 'param1' missing description" in result.warnings

    def test_required_field_not_in_properties(self):
        """Test validation when required field is not in properties."""
        invalid_schema = {
            "name": "test_tool",
            "description": "A test tool",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "param1": {"type": "string", "description": "Test parameter"}
                },
                "required": ["param2"],  # param2 not in properties
            },
        }

        result = self.validator.validate_tool_schema(invalid_schema)
        assert not result.is_valid
        assert "Required field 'param2' not found in properties" in result.errors

    def test_normalize_schema_parameters_to_input_schema(self):
        """Test normalization of parameters to inputSchema."""
        schema_with_parameters = {
            "name": "test_tool",
            "description": "A test tool",
            "parameters": {
                "type": "object",
                "properties": {
                    "param1": {"type": "string", "description": "Test parameter"}
                },
            },
        }

        normalized = self.validator.normalize_schema(schema_with_parameters)

        assert "inputSchema" in normalized
        assert "parameters" not in normalized
        assert normalized["inputSchema"]["type"] == "object"
        assert "param1" in normalized["inputSchema"]["properties"]

    def test_normalize_schema_validation_error(self):
        """Test that normalization raises error for invalid schema."""
        invalid_schema = {
            "name": "test_tool",
            "description": "A test tool",
            "parameters": {"type": "invalid_type", "properties": {}},
        }

        with pytest.raises(ValueError, match="Invalid tool schema"):
            self.validator.normalize_schema(invalid_schema)

    def test_unknown_fields_warning(self):
        """Test warning for unknown fields."""
        schema_with_unknown_field = {
            "name": "test_tool",
            "description": "A test tool",
            "inputSchema": {"type": "object", "properties": {}},
            "unknown_field": "value",
        }

        result = self.validator.validate_tool_schema(schema_with_unknown_field)
        assert result.is_valid
        assert "Unknown field: 'unknown_field'" in result.warnings

    def test_empty_name_and_description(self):
        """Test validation of empty name and description."""
        invalid_schema = {
            "name": "",
            "description": "",
            "inputSchema": {"type": "object", "properties": {}},
        }

        result = self.validator.validate_tool_schema(invalid_schema)
        assert not result.is_valid
        assert "Field 'name' cannot be empty" in result.errors
        assert "Field 'description' cannot be empty" in result.errors
