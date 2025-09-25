#!/usr/bin/env python3
"""
🦊 Reynard MCP Research Tools
============================

Comprehensive academic research and review system for the Reynard MCP server.
This module provides sophisticated tools for academic paper discovery, analysis,
and rigorous review processes that maintain the highest scholarly standards.

The research tools system provides:
- Academic paper discovery from arXiv, Google Scholar, IEEE Xplore, and other databases
- Automated paper analysis and citation tracking
- Novelty verification and literature gap identification
- Multi-phase academic review workflow with rigorous standards
- LaTeX report generation for professional academic reviews
- Integration with existing Reynard search and analysis capabilities

Architecture:
- Modular tool registration using @register_tool decorators
- Separation of concerns across specialized research domains
- Integration with backend services and external academic APIs
- Support for both synchronous and asynchronous operations
- Comprehensive error handling and validation

Tool Categories:
- Academic Discovery: Paper search and retrieval from academic databases
- Paper Analysis: Content analysis, citation tracking, and novelty assessment
- Web Research: Enhanced web search for academic content
- Review Workflow: Multi-phase academic review process management
- Report Generation: LaTeX document generation for professional reviews

The system follows the 140-line axiom and modular architecture principles,
ensuring maintainable and focused tool implementations.

Author: Reynard Development Team
Version: 1.0.0
"""

from typing import Any

from protocol.tool_registry import register_tool

# Import tool definitions
from .definitions import get_research_tool_definitions

# Import tool modules to register them
from .academic import arxiv_tools
from .paper_management import *
from .rag_integration import *
from .research_workflow import *
from . import pdf_processing_tools

# Initialize research tools
__all__ = ["get_research_tool_definitions"]


def get_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all research tool definitions."""
    return get_research_tool_definitions()
