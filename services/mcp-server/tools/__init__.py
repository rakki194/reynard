"""Tools module for MCP server."""

import sys
from pathlib import Path

# Add services directory to Python path
mcp_dir = Path(__file__).parent.parent
services_path = mcp_dir.parent.parent / "services"
agent_naming_path = services_path / "agent-naming"

# Add paths if they don't already exist
if str(agent_naming_path) not in sys.path:
    sys.path.insert(0, str(agent_naming_path))

# Import social tools to register them
from . import social_tools

# Lazy imports to improve startup performance
# Only import what's needed when it's actually used

def get_tool_definitions():
    """Lazy import for tool definitions."""
    from .definitions import get_tool_definitions as _get_tool_definitions
    return _get_tool_definitions()


def get_config_tools():
    """Lazy import for config tools."""
    from .config_tools import ConfigTools
    return ConfigTools


def get_agent_tools():
    """Lazy import for agent tools."""
    from .agent_tools import AgentTools
    return AgentTools


def get_ecs_agent_tools():
    """Lazy import for ECS agent tools."""
    from .ecs_agent_tools import ECSAgentTools
    return ECSAgentTools


def get_social_tools():
    """Lazy import for social tools."""
    from .social_tools import (
        initiate_interaction,
        send_chat_message,
        get_interaction_history,
        get_agent_relationships,
        get_agent_social_stats,
        get_nearby_agents,
        find_ecs_agent,
        get_ecs_world_status
    )
    return {
        "initiate_interaction": initiate_interaction,
        "send_chat_message": send_chat_message,
        "get_interaction_history": get_interaction_history,
        "get_agent_relationships": get_agent_relationships,
        "get_agent_social_stats": get_agent_social_stats,
        "get_nearby_agents": get_nearby_agents,
        "find_ecs_agent": find_ecs_agent,
        "get_ecs_world_status": get_ecs_world_status
    }


def get_image_viewer_tools():
    """Lazy import for image viewer tools."""
    from .image_viewer_tools import ImageViewerTools
    return ImageViewerTools


def get_linting_tools():
    """Lazy import for linting tools."""
    from .linting_tools import LintingTools
    return LintingTools


def get_mermaid_tools():
    """Lazy import for mermaid tools."""
    from .mermaid_tools import MermaidTools
    return MermaidTools


def get_monolith_detection_tools():
    """Lazy import for monolith detection tools."""
    from .monolith_detection import MonolithDetectionTools
    return MonolithDetectionTools


def get_search_tools():
    """Lazy import for search tools."""
    from .search.search_tools import SearchTools
    return SearchTools


def get_utility_tools():
    """Lazy import for utility tools."""
    from .utility_tools import UtilityTools
    return UtilityTools


def get_version_vscode_tools():
    """Lazy import for version VS Code tools."""
    from .version_vscode_tools import VersionVSCodeTools
    return VersionVSCodeTools


def get_vscode_tasks_tools():
    """Lazy import for VS Code tasks tools."""
    from .vscode_tasks_tools import VSCodeTasksTools
    return VSCodeTasksTools


def get_secrets_tools():
    """Lazy import for secrets management tools."""
    from .secrets_tools import SecretsTools
    return SecretsTools

__all__ = [
    "get_tool_definitions",
    "get_config_tools",
    "get_agent_tools",
    "get_ecs_agent_tools",
    "get_social_tools",
    "get_image_viewer_tools",
    "get_linting_tools",
    "get_mermaid_tools",
    "get_monolith_detection_tools",
    "get_search_tools",
    "get_secrets_tools",
    "get_utility_tools",
    "get_vscode_tasks_tools",
    "get_version_vscode_tools",
]
