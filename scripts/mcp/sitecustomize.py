#!/usr/bin/env python3
"""
Site Customization for MCP Server
=================================

This module is automatically imported by Python and adds the necessary
library paths to sys.path for the MCP server to work correctly.

🦦 Otter approach: We ensure smooth imports like an otter gliding through
water - every module finds its way home!
"""

import sys
from pathlib import Path

# Add libraries directory to Python path
mcp_dir = Path(__file__).parent
libraries_path = mcp_dir.parent.parent / "libraries"
agent_naming_path = libraries_path / "agent-naming"

# Add paths if they don't already exist
if str(agent_naming_path) not in sys.path:
    sys.path.insert(0, str(agent_naming_path))

# Also add the libraries path for other potential libraries
if str(libraries_path) not in sys.path:
    sys.path.insert(0, str(libraries_path))
