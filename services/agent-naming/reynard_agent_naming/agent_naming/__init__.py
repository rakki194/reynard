"""
Agent Naming Module
==================

Clean, modular agent naming system for the Reynard MCP server.
Provides comprehensive robot name generation with animal spirit themes.
"""

from .generator import ReynardRobotNamer
from .manager import AgentNameManager
from .types import AgentName, AnimalSpirit, NamingConfig, NamingStyle

__all__ = [
    "AgentName",
    "AgentNameManager",
    "AnimalSpirit",
    "NamingConfig",
    "NamingStyle",
    "ReynardRobotNamer",
]
