#!/usr/bin/env python3
"""
Tool Router
===========

Routes MCP tool calls to appropriate handlers using the tool registry.
Follows the 140-line axiom and modular architecture principles.
"""

import logging
from typing import Any

from .tool_registry import ToolExecutionType, ToolRegistry

logger = logging.getLogger(__name__)


class ToolRouter:
    """Routes MCP tool calls using the tool registry."""

    def __init__(self, tool_registry: ToolRegistry) -> None:
        self.tool_registry = tool_registry

    async def route_tool_call(
        self, tool_name: str, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Route a tool call to the appropriate handler."""
        try:
            # Get the tool handler from registry
            handler = self.tool_registry.get_handler(tool_name)
            
            logger.debug(f"Routing tool call {tool_name} with arguments: {arguments}")
            logger.debug(f"Handler method: {handler.handler_method}")
            logger.debug(f"Execution type: {handler.execution_type}")

            # Execute the tool based on its execution type
            # Check if the function expects **kwargs or direct arguments
            import inspect
            sig = inspect.signature(handler.handler_method)
            logger.debug(f"Function signature: {sig}")
            
            if any(param.kind == param.VAR_KEYWORD for param in sig.parameters.values()):
                # Function expects **kwargs, pass arguments as keyword argument
                logger.debug("Function expects **kwargs, passing arguments=arguments")
                if handler.execution_type == ToolExecutionType.ASYNC:
                    result = await handler.handler_method(arguments=arguments)
                else:
                    result = handler.handler_method(arguments=arguments)
            else:
                # Function expects direct arguments
                logger.debug("Function expects direct arguments, passing arguments directly")
                if handler.execution_type == ToolExecutionType.ASYNC:
                    result = await handler.handler_method(arguments)
                else:
                    result = handler.handler_method(arguments)

            return result

        except Exception as e:
            logger.error(f"Error routing tool call {tool_name}: {e}")
            raise ValueError(f"Tool call failed: {e}")
