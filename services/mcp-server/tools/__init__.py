"""Tools module for MCP server."""

import sys
from pathlib import Path

# Import tools from ultimate organized subdirectories to register them
from . import agent
from . import development
from . import visualization
from . import system
from . import research

# Legacy agent-naming system removed - now using FastAPI ECS backend


# Lazy imports to improve startup performance
# Only import what's needed when it's actually used


def get_tool_definitions():
    """Lazy import for tool definitions."""
    from .definitions import get_tool_definitions as _get_tool_definitions

    return _get_tool_definitions()


def get_config_tools():
    """Lazy import for config tools."""
    from .system.config import ConfigTools

    return ConfigTools


def get_agent_tools():
    """Lazy import for agent tools."""
    from .agent.core.tools import AgentTools

    return AgentTools


def get_ecs_agent_tools():
    """Lazy import for ECS agent tools."""
    from .agent.ecs.ecs import ECSAgentTools

    return ECSAgentTools


def get_social_tools():
    """Lazy import for social tools."""
    from .agent.social.interactions import (
        find_ecs_agent,
        get_agent_relationships,
        get_agent_social_stats,
        get_ecs_world_status,
        get_interaction_history,
        get_nearby_agents,
        initiate_interaction,
        send_chat_message,
    )

    return {
        "initiate_interaction": initiate_interaction,
        "send_chat_message": send_chat_message,
        "get_interaction_history": get_interaction_history,
        "get_agent_relationships": get_agent_relationships,
        "get_agent_social_stats": get_agent_social_stats,
        "get_nearby_agents": get_nearby_agents,
        "find_ecs_agent": find_ecs_agent,
        "get_ecs_world_status": get_ecs_world_status,
    }


def get_image_viewer_tools():
    """Lazy import for image viewer tools."""
    from .visualization.media.images import ImageViewerTools

    return ImageViewerTools


def get_linting_tools():
    """Lazy import for linting tools."""
    from .development.code_quality.linting import LintingTools

    return LintingTools


def get_mermaid_tools():
    """Lazy import for mermaid tools."""
    from .visualization.diagrams.mermaid import MermaidTools

    return MermaidTools


def get_monolith_detection_tools():
    """Lazy import for monolith detection tools."""
    from .development.code_quality.monolith_detection import MonolithDetectionTools

    return MonolithDetectionTools


def get_search_tools():
    """Lazy import for search tools."""
    from .search.search_tools import SearchTools

    return SearchTools


def get_utility_tools():
    """Lazy import for utility tools."""
    from .system.utilities.utility import UtilityTools

    return UtilityTools


def get_version_vscode_tools():
    """Lazy import for version VS Code tools."""
    from .development.ide.version import VersionVSCodeTools

    return VersionVSCodeTools


def get_vscode_tasks_tools():
    """Lazy import for VS Code tasks tools."""
    from .development.ide.vscode import VSCodeTasksTools

    return VSCodeTasksTools


def get_secrets_tools():
    """Lazy import for secrets management tools."""
    from .system.security.secrets import SecretsTools

    return SecretsTools


def get_research_tools():
    """Lazy import for research tools."""
    from .research import get_research_tool_definitions

    return get_research_tool_definitions


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
    "get_research_tools",
    "get_search_tools",
    "get_secrets_tools",
    "get_utility_tools",
    "get_vscode_tasks_tools",
    "get_version_vscode_tools",
]
