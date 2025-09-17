#!/usr/bin/env python3
"""
Monolith Detection Tools Package
================================

🦦 Quality specialist otter approach: We've organized the monolith detection
tools into a clean, modular structure that's as smooth as an otter's fur!

This package provides comprehensive tools for detecting and analyzing
monolithic files that violate the 140-line axiom.
"""

from .definitions import get_monolith_detection_tool_definitions
from .tools import MonolithDetectionTools

__all__ = ["MonolithDetectionTools", "get_monolith_detection_tool_definitions"]
