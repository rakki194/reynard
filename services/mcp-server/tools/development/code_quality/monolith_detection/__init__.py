#!/usr/bin/env python3
"""
Monolith Detection Tools Package
================================

🦦 Quality specialist otter approach: We've organized the monolith detection
tools into a clean, modular structure that's as smooth as an otter's fur!

This package provides comprehensive tools for detecting and analyzing
monolithic files that violate the 140-line axiom.
"""

import sys
from pathlib import Path

# Add MCP directory to path for absolute imports
mcp_dir = Path(__file__).parent.parent.parent
if str(mcp_dir) not in sys.path:
    sys.path.insert(0, str(mcp_dir))

from .definitions import get_monolith_detection_tool_definitions

__all__ = ["get_monolith_detection_tool_definitions"]
