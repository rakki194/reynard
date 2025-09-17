"""
Agent Naming Module
==================

Clean, modular agent naming system for the Reynard MCP server.
Provides comprehensive robot name generation with animal spirit themes.
"""

from .generator import ReynardRobotNamer
from .manager import AgentNameManager
from .types import AgentName, NamingStyle, AnimalSpirit, NamingConfig

__all__ = [
    "ReynardRobotNamer",
    "AgentNameManager", 
    "AgentName",
    "NamingStyle",
    "AnimalSpirit",
    "NamingConfig",
]
