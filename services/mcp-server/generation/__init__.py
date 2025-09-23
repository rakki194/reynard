#!/usr/bin/env python3
"""
MCP Tool Definition Generation Package
======================================

Automatic generation of tool definitions from registry to eliminate
manual definition maintenance and ensure schema consistency.

Follows the 140-line axiom and modular architecture principles.
"""

from .tool_definition_generator import ToolDefinitionGenerator

__all__ = ["ToolDefinitionGenerator"]
