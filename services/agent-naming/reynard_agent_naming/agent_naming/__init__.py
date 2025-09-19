"""
Agent Naming Module
==================

Clean, modular agent naming system for the Reynard MCP server.
Provides comprehensive robot name generation with animal spirit themes.
"""

from .generator import ReynardRobotNamer
from .generators import AlternativeNamingGenerator
from .manager import AgentNameManager
from .modular_generator import ModularAgentNamer
from .types import (
    AgentName,
    AnimalSpirit,
    CelestialType,
    ColorType,
    ElementalType,
    GeographicType,
    HistoricalType,
    LiteraryType,
    MusicType,
    MythologicalType,
    NamingConfig,
    NamingScheme,
    NamingStyle,
    ScientificType,
    TechnologyType,
)

__all__ = [
    "AgentName",
    "AgentNameManager",
    "AlternativeNamingGenerator",
    "AnimalSpirit",
    "CelestialType",
    "ColorType",
    "ElementalType",
    "GeographicType",
    "HistoricalType",
    "LiteraryType",
    "ModularAgentNamer",
    "MusicType",
    "MythologicalType",
    "NamingConfig",
    "NamingScheme",
    "NamingStyle",
    "ReynardRobotNamer",
    "ScientificType",
    "TechnologyType",
]
