#!/usr/bin/env python3
"""
MCP Schema Validation Package
=============================

Comprehensive validation system for MCP tool schemas to ensure
protocol compliance and prevent schema breaks.

Follows the 140-line axiom and modular architecture principles.
"""

from .schema_validator import MCPSchemaValidator, ValidationResult

__all__ = ["MCPSchemaValidator", "ValidationResult"]
