#!/usr/bin/env python3
"""
Agent Management Package
========================

Modular agent management tools for the Reynard MCP server.
Follows the 140-line axiom and modular architecture principles.
"""

import os

# Import the main AgentTools class and function from the parent module
import sys

from .base import BaseAgentTools
from .behavior import BehaviorAgentTools
from .breeding import BreedingAgentTools
from .ecs import ECSAgentTools
from .persona import PersonaAgentTools

parent_dir = os.path.dirname(os.path.dirname(__file__))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    from agent_management import AgentTools, get_agent_tool_definitions
except ImportError:
    # Fallback if direct import fails
    AgentTools = None
    get_agent_tool_definitions = None

# Import from definitions module
from .definitions import get_agent_tool_definitions

__all__ = [
    "BaseAgentTools",
    "ECSAgentTools", 
    "PersonaAgentTools",
    "BreedingAgentTools",
    "BehaviorAgentTools",
]

if AgentTools is not None:
    __all__.extend(["AgentTools", "get_agent_tool_definitions"])
