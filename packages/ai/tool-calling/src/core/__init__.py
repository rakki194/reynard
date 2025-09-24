"""Tool calling system for yipyap assistant.

This module provides a comprehensive tool calling framework that allows the assistant
to execute various operations including git commands, file operations, dataset management,
and system utilities.

Key Components:
- BaseTool: Abstract base class for all tools
- ToolRegistry: Central registry for tool discovery and management
- ToolExecutor: Handles tool execution with proper error handling and logging
- Tool decorators and utilities for easy tool creation

Example:
    ```python
    from app.tools import ToolRegistry, tool

    @tool(
        name="list_files",
        description="List files in a directory",
        parameters={
            "path": {"type": "string", "description": "Directory path"},
            "limit": {"type": "integer", "description": "Max files to return", "default": 100}
        }
    )
    async def list_files_tool(path: str, limit: int = 100) -> dict:
        # Tool implementation
        return {"files": [], "count": 0}

    # Register and execute
    registry = ToolRegistry()
    result = await registry.execute_tool("list_files", {"path": "/home/user"})
    ```

"""

from .base import BaseTool, ToolExecutionContext, ToolParameter, ToolResult
from .decorators import requires_permission, tool
from .exceptions import (
    ToolError,
    ToolExecutionError,
    ToolNotFoundError,
    ToolPermissionError,
    ToolValidationError,
)
from .executor import ToolExecutor

# Import all tools to register them
from .git_tools import (
    git_add_tool,
    git_branches_tool,
    git_commit_tool,
    git_create_branch_tool,
    git_delete_untracked_tool,
    git_history_tool,
    git_init_tool,
    git_lfs_update_tool,
    git_revert_tool,
    git_status_tool,
    git_switch_branch_tool,
    git_unstage_tool,
)
from .registry import ToolRegistry, get_tool_registry

# Import NLWeb tools (conditionally available)
try:
    from .nlweb_tools import (
        nlweb_ask_tool,
        nlweb_list_sites_tool,
        nlweb_mcp_tool,
        nlweb_suggest_tool,
    )

    NLWEB_TOOLS_AVAILABLE = True
except ImportError:
    NLWEB_TOOLS_AVAILABLE = False

# Import datetime tools
from .datetime_tools import (
    FormatTimeTool,
    GetCurrentTimeTool,
    format_time_tool,
    get_current_time_tool,
)

__all__ = [
    # Base classes
    "BaseTool",
    "ToolParameter",
    "ToolResult",
    "ToolExecutionContext",
    "ParameterType",
    # Registry
    "ToolRegistry",
    "get_registry",
    "register_tool",
    "list_tools",
    "get_tool",
    "search_tools",
    # Executor
    "ToolExecutor",
    "get_executor",
    "execute_tool",
    # Decorators
    "tool",
    "requires_permission",
    "admin_tool",
    "read_only_tool",
    # Exceptions
    "ToolError",
    "ToolNotFoundError",
    "ToolExecutionError",
    "ToolPermissionError",
    "ToolValidationError",
    "ToolTimeoutError",
    "ToolResourceError",
    # Git tools
    "git_status_tool",
    "git_init_tool",
    "git_add_tool",
    "git_unstage_tool",
    "git_commit_tool",
    "git_branches_tool",
    "git_create_branch_tool",
    "git_switch_branch_tool",
    "git_history_tool",
    "git_revert_tool",
    "git_delete_untracked_tool",
    "git_lfs_update_tool",
    # NLWeb tools (conditionally available)
    "nlweb_ask_tool",
    "nlweb_list_sites_tool",
    "nlweb_mcp_tool",
    "nlweb_suggest_tool",
    "NLWEB_TOOLS_AVAILABLE",
    # Datetime tools
    "get_current_time_tool",
    "format_time_tool",
    "GetCurrentTimeTool",
    "FormatTimeTool",
]
