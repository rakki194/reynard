"""Tools module for MCP server."""

import sys
from pathlib import Path

# Add libraries directory to Python path
mcp_dir = Path(__file__).parent.parent
libraries_path = mcp_dir.parent.parent / "libraries"
agent_naming_path = libraries_path / "agent-naming"

# Add paths if they don't already exist
if str(agent_naming_path) not in sys.path:
    sys.path.insert(0, str(agent_naming_path))

from .agent_tools import AgentTools
from .definitions import get_tool_definitions
from .ecs_agent_tools import ECSAgentTools
from .image_viewer_tools import ImageViewerTools
from .linting_tools import LintingTools
from .mermaid_tools import MermaidTools
from .monolith_detection import MonolithDetectionTools
from .search.search_tools import SearchTools
from .utility_tools import UtilityTools
from .version_vscode_tools import VersionVSCodeTools
from .vscode_tasks_tools import VSCodeTasksTools

__all__ = [
    "AgentTools",
    "ECSAgentTools",
    "ImageViewerTools",
    "LintingTools",
    "MermaidTools",
    "MonolithDetectionTools",
    "SearchTools",
    "UtilityTools",
    "VSCodeTasksTools",
    "VersionVSCodeTools",
    "get_tool_definitions",
]
