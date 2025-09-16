#!/usr/bin/env python3
"""
Agent Contributions Diagram Generator

This script uses the modular agent_diagram library to parse the CHANGELOG.md file
and automatically generate a mermaid diagram showing the breakdown of what each
agent accomplished.

Usage:
    python scripts/generate_agent_diagram.py
"""

import os
import sys

# Add the agent_diagram module to the path
script_dir = os.path.dirname(os.path.abspath(__file__))
agent_diagram_path = os.path.join(script_dir, "agent_diagram")
sys.path.insert(0, agent_diagram_path)

# Import and run the CLI
from agent_diagram.cli import main

if __name__ == "__main__":
    exit(main())
