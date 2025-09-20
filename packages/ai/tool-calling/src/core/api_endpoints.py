"""
API endpoints for tool discovery and execution.

This module provides REST API endpoints that allow clients to discover,
search, and execute tools through the web interface.
"""

import logging
import time

from fastapi import Body, Depends, HTTPException, Path, Query

from ..auth import get_current_user, is_admin
from ..models import User, UserRole
from .api_models import (
    ToolCategoriesResponse,
    ToolExecutionRequest,
    ToolExecutionResult,
    ToolInfo,
    ToolListResponse,
    ToolParameterInfo,
    ToolSearchResponse,
    ToolStatsResponse,
)
from .base import ToolExecutionContext
from .exceptions import (
    ToolExecutionError,
    ToolNotFoundError,
    ToolPermissionError,
    ToolTimeoutError,
    ToolValidationError,
)
from .executor import get_tool_executor
from .registry import get_tool_registry

logger = logging.getLogger(__name__)


def _map_user_role_to_permissions(role: UserRole) -> list[str]:
    """
    Map user roles to tool permissions.

    Args:
        role: User role enum

    Returns:
        List of permission strings the user has
    """
    permission_mapping = {
        UserRole.guest: ["read"],
        UserRole.regular: ["read", "write", "execute"],
        UserRole.admin: ["read", "write", "execute", "admin"],
    }
    return permission_mapping.get(role, [])


def _tool_to_api_model(tool) -> ToolInfo:
    """
    Convert a BaseTool instance to ToolInfo API model.

    Args:
        tool: BaseTool instance

    Returns:
        ToolInfo API model
    """
    parameters = []
    for param in tool.parameters:
        param_info = ToolParameterInfo(
            name=param.name,
            type=param.type.value,
            description=param.description,
            required=param.required,
            default=param.default,
            min_value=param.min_value,
            max_value=param.max_value,
            min_length=param.min_length,
            max_length=param.max_length,
            choices=param.choices,
            pattern=param.pattern,
        )
        parameters.append(param_info)

    return ToolInfo(
        name=tool.name,
        description=tool.description,
        category=tool.category,
        tags=tool.tags,
        required_permission=tool.required_permission,
        parameters=parameters,
        timeout=tool.timeout,
    )


def _create_execution_context(user: User) -> ToolExecutionContext:
    """
    Create a ToolExecutionContext from a User.

    Args:
        user: Authenticated user

    Returns:
        ToolExecutionContext for tool execution
    """
    # Map UserRole to ToolExecutionContext role names
    role_mapping = {
        UserRole.guest: "guest",
        UserRole.regular: "user",  # Map 'regular' to 'user' for permission hierarchy
        UserRole.admin: "admin",
    }

    tool_role = role_mapping.get(user.role, "user")

    return ToolExecutionContext(
        user_id=user.username,
        user_role=tool_role,
        environment={"user_role": user.role.value, "username": user.username},
    )


async def list_tools(
    category: str | None = Query(None, description="Filter by category"),
    tag: str | None = Query(None, description="Filter by tag"),
    permission: str | None = Query(None, description="Filter by required permission"),
    current_user: User = Depends(get_current_user),
) -> ToolListResponse:
    """
    List available tools with optional filtering.

    Args:
        category: Filter tools by category
        tag: Filter tools by tag
        permission: Filter tools by required permission
        current_user: Current authenticated user

    Returns:
        ToolListResponse with available tools

    Raises:
        HTTPException: If an error occurs
    """
    try:
        registry = get_tool_registry()
        user_role = current_user.role.value

        # Get all tools the user has access to
        all_tools = registry.list_tools(
            category=category, tag=tag, permission=permission, user_role=user_role
        )

        # Convert to API models
        tool_infos = [_tool_to_api_model(tool) for tool in all_tools]

        # Get total count without filters for context
        total_tools = registry.list_tools(user_role=user_role)

        return ToolListResponse(
            tools=tool_infos,
            total_count=len(total_tools),
            filtered_count=len(tool_infos),
            categories=registry.get_categories(),
            tags=registry.get_tags(),
        )

    except Exception as e:
        logger.error(f"Error listing tools: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def search_tools(
    query: str = Query(..., description="Search query", min_length=1),
    current_user: User = Depends(get_current_user),
) -> ToolSearchResponse:
    """
    Search tools by name, description, category, or tags.

    Args:
        query: Search query string
        current_user: Current authenticated user

    Returns:
        ToolSearchResponse with matching tools

    Raises:
        HTTPException: If an error occurs
    """
    try:
        registry = get_tool_registry()
        user_role = current_user.role.value

        # Search tools
        matching_tools = registry.search_tools(query, user_role=user_role)

        # Convert to API models
        tool_infos = [_tool_to_api_model(tool) for tool in matching_tools]

        return ToolSearchResponse(
            tools=tool_infos, query=query, total_results=len(tool_infos)
        )

    except Exception as e:
        logger.error(f"Error searching tools with query '{query}': {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_tool_info(
    tool_name: str = Path(..., description="Name of the tool"),
    current_user: User = Depends(get_current_user),
) -> ToolInfo:
    """
    Get detailed information about a specific tool.

    Args:
        tool_name: Name of the tool to get info for
        current_user: Current authenticated user

    Returns:
        ToolInfo with tool details

    Raises:
        HTTPException: If tool not found or access denied
    """
    try:
        registry = get_tool_registry()

        # Get tool
        tool = registry.get_tool(tool_name)
        if not tool:
            raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found")

        # Check if user has permission to view this tool
        user_permissions = _map_user_role_to_permissions(current_user.role)
        if tool.required_permission not in user_permissions:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied: Tool requires '{tool.required_permission}' permission",
            )

        return _tool_to_api_model(tool)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tool info for '{tool_name}': {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def execute_tool(
    tool_name: str = Path(..., description="Name of the tool to execute"),
    request: ToolExecutionRequest = Body(...),
    current_user: User = Depends(get_current_user),
) -> ToolExecutionResult:
    """
    Execute a tool with the provided parameters.

    Args:
        tool_name: Name of the tool to execute
        request: Tool execution request with parameters
        current_user: Current authenticated user

    Returns:
        ToolExecutionResult with execution results

    Raises:
        HTTPException: If tool not found, access denied, or execution fails
    """
    start_time = time.time()

    try:
        registry = get_tool_registry()
        executor = get_tool_executor()

        # Get tool
        tool = registry.get_tool(tool_name)
        if not tool:
            raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found")

        # Create execution context
        context = _create_execution_context(current_user)

        # Check permissions
        if not context.has_permission(tool.required_permission):
            raise HTTPException(
                status_code=403,
                detail=f"Access denied: Tool requires '{tool.required_permission}' permission",
            )

        # Execute tool
        logger.info(f"Executing tool '{tool_name}' for user {current_user.username}")

        if request.dry_run:
            # For dry run, just validate parameters
            validation_errors = tool.validate_parameters(request.parameters)
            if validation_errors:
                raise ToolValidationError(tool_name, validation_errors)

            execution_time = time.time() - start_time
            return ToolExecutionResult(
                success=True,
                result={"message": "Dry run successful - parameters are valid"},
                execution_time=execution_time,
                dry_run=True,
                tool_name=tool_name,
            )
        # Real execution - set timeout if provided
        if request.timeout:
            context.timeout = request.timeout

        result = await executor.execute_tool(
            tool=tool, context=context, parameters=request.parameters
        )

        execution_time = time.time() - start_time

        if result.success:
            return ToolExecutionResult(
                success=True,
                result=result.data,
                execution_time=execution_time,
                tool_name=tool_name,
            )
        return ToolExecutionResult(
            success=False,
            error=result.error,
            execution_time=execution_time,
            tool_name=tool_name,
        )

    except HTTPException:
        raise
    except ToolNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ToolPermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ToolValidationError as e:
        raise HTTPException(status_code=400, detail=f"Parameter validation failed: {e}")
    except ToolTimeoutError as e:
        execution_time = time.time() - start_time
        return ToolExecutionResult(
            success=False,
            error=f"Tool execution timed out: {e}",
            execution_time=execution_time,
            tool_name=tool_name,
        )
    except ToolExecutionError as e:
        execution_time = time.time() - start_time
        return ToolExecutionResult(
            success=False,
            error=f"Tool execution failed: {e}",
            execution_time=execution_time,
            tool_name=tool_name,
        )
    except Exception as e:
        execution_time = time.time() - start_time
        # Log full error details for debugging but don't expose to client
        logger.error(
            f"Unexpected error executing tool '{tool_name}': {e}", exc_info=True
        )
        return ToolExecutionResult(
            success=False,
            error="An unexpected error occurred during tool execution",
            execution_time=execution_time,
            tool_name=tool_name,
        )


async def get_tool_categories(
    current_user: User = Depends(get_current_user),
) -> ToolCategoriesResponse:
    """
    Get list of all available tool categories.

    Args:
        current_user: Current authenticated user

    Returns:
        ToolCategoriesResponse with available categories

    Raises:
        HTTPException: If an error occurs
    """
    try:
        registry = get_tool_registry()
        categories = registry.get_categories()

        return ToolCategoriesResponse(categories=categories)

    except Exception as e:
        logger.error(f"Error getting tool categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_tool_stats(current_user: User = Depends(is_admin)) -> ToolStatsResponse:
    """
    Get detailed statistics about the tool registry.
    Admin-only endpoint for monitoring and debugging.

    Args:
        current_user: Current authenticated admin user

    Returns:
        ToolStatsResponse with registry statistics

    Raises:
        HTTPException: If an error occurs or user is not admin
    """
    try:
        registry = get_tool_registry()
        stats = registry.get_registry_stats()

        return ToolStatsResponse(
            total_tools=stats["total_tools"],
            categories=stats["categories"],
            tags=stats["tags"],
            tools_by_category=stats["tools_by_category"],
            tools_by_permission=stats["tools_by_permission"],
        )

    except Exception as e:
        logger.error(f"Error getting tool stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
