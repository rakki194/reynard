#!/usr/bin/env python3
"""
Tool Definition Generator
=========================

Automatically generates tool definitions from decorated functions to eliminate
manual definition maintenance and ensure schema consistency.

Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any, Dict

from protocol.tool_registry import ToolMetadata, ToolRegistry
from validation.schema_validator import MCPSchemaValidator


class ToolDefinitionGenerator:
    """Automatically generates tool definitions from registry."""

    def __init__(self):
        self.validator = MCPSchemaValidator()

    def generate_from_registry(
        self, tool_registry: ToolRegistry
    ) -> Dict[str, Dict[str, Any]]:
        """Generate all tool definitions from registry."""
        tool_definitions = {}

        for tool_name, tool_metadata in tool_registry.list_all_tools().items():
            try:
                tool_def = self.generate_tool_definition(tool_metadata)
                tool_definitions[tool_name] = tool_def
            except Exception as e:
                # Log error but continue with other tools
                print(f"Warning: Failed to generate definition for {tool_name}: {e}")
                continue

        return tool_definitions

    def generate_tool_definition(self, tool_metadata: ToolMetadata) -> Dict[str, Any]:
        """Generate single tool definition with validation."""
        # Create basic tool definition
        tool_def = {
            "name": tool_metadata.name,
            "description": tool_metadata.description,
            "inputSchema": self._generate_input_schema(tool_metadata),
        }

        # Add optional fields if present
        if hasattr(tool_metadata, "execution_type") and tool_metadata.execution_type:
            tool_def["execution_type"] = tool_metadata.execution_type.value

        if hasattr(tool_metadata, "enabled") and not tool_metadata.enabled:
            tool_def["enabled"] = tool_metadata.enabled

        if hasattr(tool_metadata, "dependencies") and tool_metadata.dependencies:
            tool_def["dependencies"] = tool_metadata.dependencies

        if hasattr(tool_metadata, "config") and tool_metadata.config:
            tool_def["config"] = tool_metadata.config

        # Validate the generated definition
        validation_result = self.validator.validate_tool_schema(tool_def)
        if not validation_result.is_valid:
            raise ValueError(
                f"Generated invalid tool schema for {tool_metadata.name}: {validation_result.errors}"
            )

        return tool_def

    def _generate_input_schema(self, tool_metadata: ToolMetadata) -> Dict[str, Any]:
        """Generate inputSchema from tool metadata."""
        # For now, generate a basic schema
        # In a more sophisticated implementation, this could analyze the function signature
        # and generate schemas based on type hints and docstrings

        # Check if the tool has a custom input schema in its config
        if hasattr(tool_metadata, "config") and tool_metadata.config:
            custom_schema = tool_metadata.config.get("input_schema")
            if custom_schema:
                return custom_schema

        # Generate default schema based on tool name patterns
        if "screenshot" in tool_metadata.name.lower():
            return self._generate_screenshot_schema()
        elif "scrape" in tool_metadata.name.lower():
            return self._generate_scrape_schema()
        elif "test" in tool_metadata.name.lower():
            return self._generate_test_schema()
        else:
            return self._generate_default_schema()

    def _generate_screenshot_schema(self) -> Dict[str, Any]:
        """Generate schema for screenshot tools."""
        return {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to screenshot"},
                "output_path": {
                    "type": "string",
                    "description": "Optional output file path",
                },
                "viewport_width": {
                    "type": "integer",
                    "description": "Browser width (default: 1920)",
                    "default": 1920,
                },
                "viewport_height": {
                    "type": "integer",
                    "description": "Browser height (default: 1080)",
                    "default": 1080,
                },
                "full_page": {
                    "type": "boolean",
                    "description": "Whether to capture full page (default: true)",
                    "default": True,
                },
            },
            "required": ["url"],
        }

    def _generate_scrape_schema(self) -> Dict[str, Any]:
        """Generate schema for scraping tools."""
        return {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to scrape"},
                "selector": {
                    "type": "string",
                    "description": "Optional CSS selector to extract specific content",
                },
                "wait_for": {
                    "type": "string",
                    "description": "Optional selector to wait for before scraping",
                },
            },
            "required": ["url"],
        }

    def _generate_test_schema(self) -> Dict[str, Any]:
        """Generate schema for test tools."""
        return {"type": "object", "properties": {}, "required": []}

    def _generate_default_schema(self) -> Dict[str, Any]:
        """Generate default schema for unknown tools."""
        return {
            "type": "object",
            "properties": {
                "arguments": {"type": "object", "description": "Tool arguments"}
            },
            "required": [],
        }
