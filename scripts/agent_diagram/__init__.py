"""Agent Diagram Library

A modular library for parsing changelog files and generating agent contribution diagrams.
"""

from .cli import main
from .core.categorizer import AgentCategorizer
from .core.contribution import AgentContribution
from .core.generator import MermaidDiagramGenerator
from .core.parser import ChangelogParser

__version__ = "1.0.0"
__all__ = [
    "AgentCategorizer",
    "AgentContribution",
    "ChangelogParser",
    "MermaidDiagramGenerator",
    "main",
]
