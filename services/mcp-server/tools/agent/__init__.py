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

from .behavior.behavior import BehaviorAgentTools
from .behavior.breeding import BreedingAgentTools
from .behavior.persona import PersonaAgentTools
from .core.base import BaseAgentTools
from .ecs.ecs import ECSAgentTools

parent_dir = os.path.dirname(os.path.dirname(__file__))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Import from definitions module
from .definitions import get_agent_tool_definitions

# AgentTools is defined in the parent module (tools/agent_management.py)
# We don't import it here to avoid circular imports
AgentTools = None

__all__ = [
    "BaseAgentTools",
    "ECSAgentTools",
    "PersonaAgentTools",
    "BreedingAgentTools",
    "BehaviorAgentTools",
]

if AgentTools is not None:
    __all__.extend(["AgentTools", "get_agent_tool_definitions"])
