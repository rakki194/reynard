#!/usr/bin/env python3
"""
MCP Schema Validator
====================

Validates MCP tool schemas against protocol specification to prevent
schema breaks and ensure protocol compliance.

Follows the 140-line axiom and modular architecture principles.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class ValidationResult:
    """Result of schema validation."""

    is_valid: bool
    errors: List[str]
    warnings: List[str]

    def __init__(
        self,
        is_valid: bool = True,
        errors: Optional[List[str]] = None,
        warnings: Optional[List[str]] = None,
    ):
        self.is_valid = is_valid
        self.errors = errors or []
        self.warnings = warnings or []


class MCPSchemaValidator:
    """Validates MCP tool schemas against protocol specification."""

    # Required fields for MCP tool definitions
    REQUIRED_FIELDS = ["name", "description", "inputSchema"]

    # Required fields for inputSchema
    REQUIRED_INPUT_SCHEMA_FIELDS = ["type", "properties"]

    # Valid inputSchema types
    VALID_INPUT_SCHEMA_TYPES = ["object"]

    # Valid property types
    VALID_PROPERTY_TYPES = ["string", "integer", "number", "boolean", "array", "object"]

    def validate_tool_schema(self, tool_def: Dict[str, Any]) -> ValidationResult:
        """Validate tool definition against MCP protocol."""
        errors = []
        warnings = []

        # Check required fields
        for field in self.REQUIRED_FIELDS:
            if field not in tool_def:
                errors.append(f"Missing required field: '{field}'")

        # Validate name field
        if "name" in tool_def:
            if not isinstance(tool_def["name"], str):
                errors.append("Field 'name' must be a string")
            elif not tool_def["name"]:
                errors.append("Field 'name' cannot be empty")

        # Validate description field
        if "description" in tool_def:
            if not isinstance(tool_def["description"], str):
                errors.append("Field 'description' must be a string")
            elif not tool_def["description"]:
                errors.append("Field 'description' cannot be empty")

        # Validate inputSchema field
        if "inputSchema" in tool_def:
            schema_result = self._validate_input_schema(tool_def["inputSchema"])
            errors.extend(schema_result.errors)
            warnings.extend(schema_result.warnings)

        # Check for deprecated 'parameters' field
        if "parameters" in tool_def:
            errors.append("Field 'parameters' is deprecated, use 'inputSchema' instead")

        # Check for unknown fields
        known_fields = self.REQUIRED_FIELDS + [
            "execution_type",
            "enabled",
            "dependencies",
            "config",
        ]
        for field in tool_def:
            if field not in known_fields:
                warnings.append(f"Unknown field: '{field}'")

        is_valid = len(errors) == 0
        return ValidationResult(is_valid=is_valid, errors=errors, warnings=warnings)

    def _validate_input_schema(self, input_schema: Any) -> ValidationResult:
        """Validate inputSchema structure."""
        errors = []
        warnings = []

        if not isinstance(input_schema, dict):
            errors.append("inputSchema must be a dictionary")
            return ValidationResult(is_valid=False, errors=errors, warnings=warnings)

        # Check required inputSchema fields
        for field in self.REQUIRED_INPUT_SCHEMA_FIELDS:
            if field not in input_schema:
                errors.append(f"inputSchema missing required field: '{field}'")

        # Validate type field
        if "type" in input_schema:
            if input_schema["type"] not in self.VALID_INPUT_SCHEMA_TYPES:
                errors.append(
                    f"inputSchema type must be one of: {self.VALID_INPUT_SCHEMA_TYPES}"
                )

        # Validate properties field
        if "properties" in input_schema:
            if not isinstance(input_schema["properties"], dict):
                errors.append("inputSchema properties must be a dictionary")
            else:
                prop_result = self._validate_properties(input_schema["properties"])
                errors.extend(prop_result.errors)
                warnings.extend(prop_result.warnings)

        # Validate required field
        if "required" in input_schema:
            if not isinstance(input_schema["required"], list):
                errors.append("inputSchema required must be a list")
            elif "properties" in input_schema:
                # Check that all required fields exist in properties
                for req_field in input_schema["required"]:
                    if req_field not in input_schema["properties"]:
                        errors.append(
                            f"Required field '{req_field}' not found in properties"
                        )

        is_valid = len(errors) == 0
        return ValidationResult(is_valid=is_valid, errors=errors, warnings=warnings)

    def _validate_properties(self, properties: Dict[str, Any]) -> ValidationResult:
        """Validate properties in inputSchema."""
        errors = []
        warnings = []

        for prop_name, prop_def in properties.items():
            if not isinstance(prop_def, dict):
                errors.append(f"Property '{prop_name}' definition must be a dictionary")
                continue

            # Validate type
            if "type" in prop_def:
                if prop_def["type"] not in self.VALID_PROPERTY_TYPES:
                    errors.append(
                        f"Property '{prop_name}' has invalid type: {prop_def['type']}"
                    )

            # Validate description
            if "description" not in prop_def:
                warnings.append(f"Property '{prop_name}' missing description")
            elif not isinstance(prop_def["description"], str):
                errors.append(f"Property '{prop_name}' description must be a string")

        is_valid = len(errors) == 0
        return ValidationResult(is_valid=is_valid, errors=errors, warnings=warnings)

    def normalize_schema(self, tool_def: Dict[str, Any]) -> Dict[str, Any]:
        """Convert parameters -> inputSchema and validate."""
        normalized = tool_def.copy()

        # Convert parameters to inputSchema if present
        if "parameters" in normalized and "inputSchema" not in normalized:
            normalized["inputSchema"] = normalized.pop("parameters")
            warnings = ["Converted 'parameters' to 'inputSchema'"]
        else:
            warnings = []

        # Validate the normalized schema
        validation_result = self.validate_tool_schema(normalized)

        if not validation_result.is_valid:
            raise ValueError(f"Invalid tool schema: {validation_result.errors}")

        return normalized
