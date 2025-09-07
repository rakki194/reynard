"""
NLWeb tools for the yipyap assistant.

This module provides NLWeb-related tools that allow the assistant to interact
with external NLWeb services through the bridge endpoints.
"""

import json
import logging
from typing import Any, Dict, List, Optional

import aiohttp

from .base import (
    BaseTool,
    ParameterType,
    ToolExecutionContext,
    ToolParameter,
    ToolResult,
)
from .decorators import tool

logger = logging.getLogger(__name__)


def get_service_manager():
    """Get service manager without circular imports."""
    # Import here to avoid circular dependency
    from ..services.access import get_service_manager as _get_service_manager

    return _get_service_manager()


@tool(
    name="nlweb.ask",
    description="Ask a question to an external NLWeb service and get a streaming response",
    category="nlweb",
    tags=["nlweb", "ask", "external", "ai"],
    required_permission="execute",
    parameters={
        "query": {
            "type": "string",
            "description": "The question or query to ask the NLWeb service",
            "required": True,
            "min_length": 1,
            "max_length": 10000,
        },
        "context": {
            "type": "object",
            "description": "Additional context or parameters for the query",
            "required": False,
            "default": {},
        },
        "site": {
            "type": "string",
            "description": "Specific NLWeb site to query (optional)",
            "required": False,
            "default": "",
        },
    },
)
async def nlweb_ask_tool(
    query: str, context: Dict[str, Any] = None, site: str = ""
) -> Dict[str, Any]:
    """Ask a question to an external NLWeb service."""
    try:
        service_manager = get_service_manager()
        if not service_manager:
            return {"success": False, "error": "Service manager unavailable"}

        # Check if NLWeb is enabled
        config_service = service_manager.get_service("config_manager")
        if not config_service:
            return {"success": False, "error": "Configuration service unavailable"}

        cfg = config_service.get_config()
        if not getattr(cfg, "nlweb_enabled", False):
            return {"success": False, "error": "NLWeb integration is disabled"}

        # Prepare the payload
        payload = {"query": query, "context": context or {}}
        if site:
            payload["site"] = site

        # Make request to internal NLWeb bridge
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:7000/api/nlweb/ask",
                json=payload,
                headers={"Accept": "text/event-stream"},
                timeout=aiohttp.ClientTimeout(total=60),
            ) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    return {
                        "success": False,
                        "error": f"NLWeb service error: HTTP {resp.status}",
                        "details": error_text,
                    }

                # Collect streaming response
                response_chunks = []
                thinking_chunks = []
                tool_results = []

                async for line in resp.content:
                    line_str = line.decode("utf-8").strip()
                    if line_str.startswith("data: "):
                        try:
                            chunk_data = json.loads(line_str[6:])
                            chunk_type = chunk_data.get("type")

                            if chunk_type == "thinking":
                                thinking_chunks.append(chunk_data.get("content", ""))
                            elif chunk_type == "response":
                                response_chunks.append(chunk_data.get("content", ""))
                            elif chunk_type == "tool_result":
                                tool_results.append(chunk_data)
                            elif chunk_type == "error":
                                return {
                                    "success": False,
                                    "error": chunk_data.get("error", "Unknown error"),
                                    "chunks_processed": len(response_chunks),
                                }
                            elif chunk_type == "complete":
                                break
                        except json.JSONDecodeError:
                            continue

                return {
                    "success": True,
                    "response": "".join(response_chunks),
                    "thinking": "".join(thinking_chunks),
                    "tool_results": tool_results,
                    "chunks_processed": len(response_chunks),
                }

    except Exception as e:
        logger.error(f"Error in nlweb.ask tool: {e}")
        return {"success": False, "error": f"Tool execution failed: {str(e)}"}


@tool(
    name="nlweb.list_sites",
    description="List available NLWeb sites that can be queried",
    category="nlweb",
    tags=["nlweb", "sites", "list", "discovery"],
    required_permission="read",
    parameters={},
)
async def nlweb_list_sites_tool() -> Dict[str, Any]:
    """List available NLWeb sites."""
    try:
        service_manager = get_service_manager()
        if not service_manager:
            return {"success": False, "error": "Service manager unavailable"}

        # Check if NLWeb is enabled
        config_service = service_manager.get_service("config_manager")
        if not config_service:
            return {"success": False, "error": "Configuration service unavailable"}

        cfg = config_service.get_config()
        if not getattr(cfg, "nlweb_enabled", False):
            return {"success": False, "error": "NLWeb integration is disabled"}

        # Make request to internal NLWeb bridge
        async with aiohttp.ClientSession() as session:
            async with session.get(
                "http://localhost:7000/api/nlweb/sites",
                timeout=aiohttp.ClientTimeout(total=30),
            ) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    return {
                        "success": False,
                        "error": f"NLWeb service error: HTTP {resp.status}",
                        "details": error_text,
                    }

                try:
                    sites_data = await resp.json()
                    return {
                        "success": True,
                        "sites": sites_data.get("sites", []),
                        "total_sites": len(sites_data.get("sites", [])),
                    }
                except json.JSONDecodeError:
                    raw_data = await resp.text()
                    return {
                        "success": True,
                        "raw_data": raw_data,
                        "note": "Response was not valid JSON",
                    }

    except Exception as e:
        logger.error(f"Error in nlweb.list_sites tool: {e}")
        return {"success": False, "error": f"Tool execution failed: {str(e)}"}


@tool(
    name="nlweb.mcp",
    description="Execute a JSON-RPC call to the NLWeb MCP endpoint",
    category="nlweb",
    tags=["nlweb", "mcp", "json-rpc", "external"],
    required_permission="execute",
    parameters={
        "method": {
            "type": "string",
            "description": "The MCP method to call",
            "required": True,
            "min_length": 1,
        },
        "params": {
            "type": "object",
            "description": "Parameters for the MCP method call",
            "required": False,
            "default": {},
        },
        "id": {
            "type": "string",
            "description": "Request ID for the JSON-RPC call",
            "required": False,
            "default": "1",
        },
    },
)
async def nlweb_mcp_tool(
    method: str, params: Dict[str, Any] = None, id: str = "1"
) -> Dict[str, Any]:
    """Execute a JSON-RPC call to the NLWeb MCP endpoint."""
    try:
        service_manager = get_service_manager()
        if not service_manager:
            return {"success": False, "error": "Service manager unavailable"}

        # Check if NLWeb is enabled
        config_service = service_manager.get_service("config_manager")
        if not config_service:
            return {"success": False, "error": "Configuration service unavailable"}

        cfg = config_service.get_config()
        if not getattr(cfg, "nlweb_enabled", False):
            return {"success": False, "error": "NLWeb integration is disabled"}

        # Prepare JSON-RPC payload
        payload = {"jsonrpc": "2.0", "method": method, "params": params or {}, "id": id}

        # Make request to internal NLWeb bridge
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:7000/api/nlweb/mcp",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=60),
            ) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    return {
                        "success": False,
                        "error": f"NLWeb MCP error: HTTP {resp.status}",
                        "details": error_text,
                    }

                try:
                    result = await resp.json()
                    return {"success": True, "result": result, "method": method}
                except json.JSONDecodeError:
                    raw_data = await resp.text()
                    return {
                        "success": True,
                        "raw_data": raw_data,
                        "method": method,
                        "note": "Response was not valid JSON",
                    }

    except Exception as e:
        logger.error(f"Error in nlweb.mcp tool: {e}")
        return {"success": False, "error": f"Tool execution failed: {str(e)}"}


@tool(
    name="nlweb.suggest",
    description="Get tool suggestions from the embedded NLWeb router for a query",
    category="nlweb",
    tags=["nlweb", "suggest", "router", "tools"],
    required_permission="read",
    parameters={
        "query": {
            "type": "string",
            "description": "The query to get tool suggestions for",
            "required": True,
            "min_length": 1,
            "max_length": 1000,
        },
        "context": {
            "type": "object",
            "description": "Additional context for the suggestion",
            "required": False,
            "default": {},
        },
    },
)
async def nlweb_suggest_tool(
    query: str, context: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Get tool suggestions from the embedded NLWeb router."""
    try:
        service_manager = get_service_manager()
        if not service_manager:
            return {"success": False, "error": "Service manager unavailable"}

        # Check if NLWeb router is available
        nlweb_router = service_manager.get_service("nlweb_router")
        if not nlweb_router:
            return {"success": False, "error": "NLWeb router service not available"}

        # Get suggestions from the router service
        suggestions = await nlweb_router.suggest_tools(
            query=query, context=context or {}
        )

        return {
            "success": True,
            "suggestions": suggestions,
            "query": query,
            "total_suggestions": len(suggestions),
        }

    except Exception as e:
        logger.error(f"Error in nlweb.suggest tool: {e}")
        return {"success": False, "error": f"Tool execution failed: {str(e)}"}
