"""
NLWeb API Endpoints for Reynard Backend

REST API endpoints for NLWeb assistant tooling and routing system.
Ported from Yipyap's battle-tested implementation with 2025 best practices.
"""

import logging
import json
import time
from typing import Dict, Any, Optional, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from sse_starlette import EventSourceResponse

from gatekeeper.api.dependencies import require_active_user
from gatekeeper.models.user import User
from ...services.nlweb import (
    NLWebService,
    NLWebSuggestionRequest,
    NLWebSuggestionResponse,
    NLWebHealthStatus,
    NLWebPerformanceStats,
    NLWebTool,
    NLWebContext,
    NLWebRollbackRequest,
    NLWebRollbackResponse,
    NLWebVerificationResponse,
    NLWebAskRequest,
    NLWebMCPRequest,
    NLWebSitesResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/nlweb", tags=["nlweb"])

# Global service instance
_nlweb_service: Optional[NLWebService] = None


def get_nlweb_service() -> NLWebService:
    """Get the global NLWeb service instance."""
    global _nlweb_service
    if _nlweb_service is None:
        from ...services.nlweb.models import NLWebConfiguration
        config = NLWebConfiguration()
        _nlweb_service = NLWebService(config)
    return _nlweb_service


@router.post("/suggest", response_model=NLWebSuggestionResponse)
async def suggest_tools(
    request: NLWebSuggestionRequest,
    current_user: User = Depends(require_active_user)
):
    """
    Suggest tools for a natural language query using the NLWeb router service.
    
    This endpoint analyzes the query and suggests appropriate tools with parameters
    based on context and tool relevance.
    """
    try:
        service = get_nlweb_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="NLWeb service is not available"
            )
        
        # Get tool suggestions
        response = await service.suggest_tools(request)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"NLWeb suggestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_status(
    current_user: User = Depends(require_active_user)
):
    """
    Get NLWeb integration status and performance metrics.
    """
    try:
        service = get_nlweb_service()
        
        # Get health status
        health_status = await service.get_health_status()
        
        # Get performance stats
        performance_stats = await service.get_performance_stats()
        
        # Get service info
        service_info = service.get_info()
        
        return {
            "enabled": health_status.enabled,
            "status": health_status.status,
            "connection_state": health_status.connection_state,
            "canary_enabled": health_status.canary_enabled,
            "canary_percentage": health_status.canary_percentage,
            "rollback_enabled": health_status.rollback_enabled,
            "performance_monitoring": health_status.performance_monitoring,
            "performance": performance_stats.model_dump(),
            "service_info": service_info
        }
        
    except Exception as e:
        logger.error(f"NLWeb status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health", response_model=NLWebHealthStatus)
async def get_health(
    current_user: User = Depends(require_active_user)
):
    """Get NLWeb service health status."""
    try:
        service = get_nlweb_service()
        health_status = await service.get_health_status()
        return health_status
        
    except Exception as e:
        logger.error(f"NLWeb health check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/health/force-check")
async def force_health_check(
    current_user: User = Depends(require_active_user)
):
    """Force a health check of the NLWeb service."""
    try:
        service = get_nlweb_service()
        
        # Perform health check
        health_status = await service.get_health_status()
        
        return {
            "status": health_status.status,
            "connection_state": health_status.connection_state,
            "connection_attempts": health_status.connection_attempts,
            "base_url": health_status.base_url,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"NLWeb force health check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance", response_model=NLWebPerformanceStats)
async def get_performance_stats(
    current_user: User = Depends(require_active_user)
):
    """Get NLWeb service performance statistics."""
    try:
        service = get_nlweb_service()
        performance_stats = await service.get_performance_stats()
        return performance_stats
        
    except Exception as e:
        logger.error(f"NLWeb performance stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tools")
async def get_tools(
    category: Optional[str] = None,
    tags: Optional[str] = None,
    current_user: User = Depends(require_active_user)
):
    """Get available NLWeb tools, optionally filtered by category or tags."""
    try:
        service = get_nlweb_service()
        
        # Parse tags if provided
        tag_list = None
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
        
        tools = await service.get_tools(category=category, tags=tag_list)
        
        return {
            "tools": [tool.model_dump() for tool in tools],
            "total_tools": len(tools),
            "category": category,
            "tags": tag_list
        }
        
    except Exception as e:
        logger.error(f"NLWeb tools error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tools")
async def register_tool(
    tool: NLWebTool,
    current_user: User = Depends(require_active_user)
):
    """Register a new NLWeb tool."""
    try:
        service = get_nlweb_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="NLWeb service is not available"
            )
        
        success = await service.register_tool(tool)
        
        if not success:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to register tool: {tool.name}"
            )
        
        return {
            "success": True,
            "message": f"Tool '{tool.name}' registered successfully",
            "tool": tool.model_dump()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"NLWeb tool registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/tools/{tool_name}")
async def unregister_tool(
    tool_name: str,
    current_user: User = Depends(require_active_user)
):
    """Unregister an NLWeb tool."""
    try:
        service = get_nlweb_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="NLWeb service is not available"
            )
        
        success = await service.unregister_tool(tool_name)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Tool '{tool_name}' not found"
            )
        
        return {
            "success": True,
            "message": f"Tool '{tool_name}' unregistered successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"NLWeb tool unregistration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tools/{tool_name}/enable")
async def enable_tool(
    tool_name: str,
    current_user: User = Depends(require_active_user)
):
    """Enable an NLWeb tool."""
    try:
        service = get_nlweb_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="NLWeb service is not available"
            )
        
        success = await service.enable_tool(tool_name)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Tool '{tool_name}' not found"
            )
        
        return {
            "success": True,
            "message": f"Tool '{tool_name}' enabled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"NLWeb tool enable error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tools/{tool_name}/disable")
async def disable_tool(
    tool_name: str,
    current_user: User = Depends(require_active_user)
):
    """Disable an NLWeb tool."""
    try:
        service = get_nlweb_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="NLWeb service is not available"
            )
        
        success = await service.disable_tool(tool_name)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Tool '{tool_name}' not found"
            )
        
        return {
            "success": True,
            "message": f"Tool '{tool_name}' disabled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"NLWeb tool disable error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rollback", response_model=NLWebRollbackResponse)
async def enable_rollback(
    request: NLWebRollbackRequest,
    current_user: User = Depends(require_active_user)
):
    """
    Enable or disable emergency rollback for NLWeb integration.
    
    This endpoint allows administrators to quickly disable NLWeb functionality
    in case of issues or performance problems.
    """
    try:
        service = get_nlweb_service()
        
        # Check if user has admin privileges (you might want to implement this)
        # if not current_user.is_admin:
        #     raise HTTPException(status_code=403, detail="Admin privileges required")
        
        response = await service.enable_rollback(request)
        
        if not response.success:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update rollback status: {response.reason}"
            )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"NLWeb rollback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/verification", response_model=NLWebVerificationResponse)
async def get_verification_checklist(
    current_user: User = Depends(require_active_user)
):
    """
    Get NLWeb integration verification checklist for rollout.
    
    This endpoint provides a comprehensive checklist to verify that NLWeb
    is properly configured and performing well before full rollout.
    """
    try:
        service = get_nlweb_service()
        checklist = await service.get_verification_checklist()
        return checklist
        
    except Exception as e:
        logger.error(f"NLWeb verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ask")
async def proxy_ask(
    request: NLWebAskRequest,
    http_request: Request,
    current_user: User = Depends(require_active_user)
):
    """
    Proxy NLWeb /ask endpoint with SSE streaming support.
    
    This endpoint forwards requests to an external NLWeb service and streams
    the response back to the client with proper event mapping.
    """
    try:
        service = get_nlweb_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="NLWeb service is not available"
            )
        
        # Check if external NLWeb service is configured
        if not service.configuration.base_url:
            raise HTTPException(
                status_code=404,
                detail="External NLWeb service not configured"
            )
        
        async def _stream_ask_response():
            """Stream the ask response from external NLWeb service."""
            try:
                import aiohttp
                
                # Prepare request headers
                headers = {
                    "Accept": "text/event-stream",
                    "Content-Type": "application/json"
                }
                
                # Add request ID if present
                request_id = http_request.headers.get("X-Request-ID")
                if request_id:
                    headers["X-Request-ID"] = request_id
                
                # Make request to external NLWeb service
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f"{service.configuration.base_url}/ask",
                        json=request.model_dump(),
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(
                            connect=service.configuration.proxy_connect_timeout_ms / 1000,
                            total=service.configuration.proxy_read_timeout_ms / 1000
                        )
                    ) as response:
                        
                        if response.status != 200:
                            error_detail = await response.text()
                            yield f"data: {json.dumps({'type': 'error', 'error': f'HTTP {response.status}: {error_detail}'})}\n\n"
                            return
                        
                        # Stream the response
                        async for line in response.content:
                            if line:
                                try:
                                    # Parse SSE data
                                    line_str = line.decode('utf-8').strip()
                                    if line_str.startswith('data: '):
                                        data_str = line_str[6:]  # Remove 'data: ' prefix
                                        if data_str:
                                            # Map NLWeb events to Reynard format
                                            mapped_event = _map_nlweb_event_to_reynard(data_str)
                                            yield f"data: {json.dumps(mapped_event)}\n\n"
                                except Exception as e:
                                    yield f"data: {json.dumps({'type': 'error', 'error': f'Parsing error: {str(e)}'})}\n\n"
                        
                        # Send completion event
                        yield f"data: {json.dumps({'type': 'complete'})}\n\n"
                        
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
        
        return StreamingResponse(
            _stream_ask_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Disable nginx buffering
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"NLWeb ask proxy error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mcp")
async def proxy_mcp(
    request: NLWebMCPRequest,
    http_request: Request,
    current_user: User = Depends(require_active_user)
):
    """
    Proxy NLWeb MCP (Model Context Protocol) endpoint.
    
    This endpoint forwards JSON-RPC requests to an external NLWeb MCP service.
    """
    try:
        service = get_nlweb_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="NLWeb service is not available"
            )
        
        # Check if external NLWeb service is configured
        if not service.configuration.base_url:
            raise HTTPException(
                status_code=404,
                detail="External NLWeb service not configured"
            )
        
        import aiohttp
        
        # Prepare request headers
        headers = {"Content-Type": "application/json"}
        
        # Add request ID if present
        request_id = http_request.headers.get("X-Request-ID")
        if request_id:
            headers["X-Request-ID"] = request_id
        
        # Make request to external NLWeb MCP service
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{service.configuration.base_url}/mcp",
                json=request.model_dump(),
                headers=headers,
                timeout=aiohttp.ClientTimeout(
                    connect=service.configuration.proxy_connect_timeout_ms / 1000,
                    total=service.configuration.proxy_read_timeout_ms / 1000
                )
            ) as response:
                
                if response.status != 200:
                    error_detail = await response.text()
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"MCP request failed: {error_detail}"
                    )
                
                # Return the MCP response
                return await response.json()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"NLWeb MCP proxy error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sites", response_model=NLWebSitesResponse)
async def proxy_sites(
    http_request: Request,
    current_user: User = Depends(require_active_user)
):
    """Proxy NLWeb /sites endpoint to list available sites."""
    try:
        service = get_nlweb_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="NLWeb service is not available"
            )
        
        # Check if external NLWeb service is configured
        if not service.configuration.base_url:
            raise HTTPException(
                status_code=404,
                detail="External NLWeb service not configured"
            )
        
        import aiohttp
        
        # Prepare request headers
        headers = {}
        
        # Add request ID if present
        request_id = http_request.headers.get("X-Request-ID")
        if request_id:
            headers["X-Request-ID"] = request_id
        
        # Make request to external NLWeb sites service
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{service.configuration.base_url}/sites",
                headers=headers,
                timeout=aiohttp.ClientTimeout(
                    connect=service.configuration.proxy_connect_timeout_ms / 1000,
                    total=service.configuration.proxy_read_timeout_ms / 1000
                )
            ) as response:
                
                if response.status != 200:
                    error_detail = await response.text()
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"Sites request failed: {error_detail}"
                    )
                
                # Parse and return the sites response
                sites_data = await response.json()
                
                return NLWebSitesResponse(
                    sites=sites_data.get("sites", []),
                    total_sites=len(sites_data.get("sites", []))
                )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"NLWeb sites proxy error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cache/clear")
async def clear_cache(
    current_user: User = Depends(require_active_user)
):
    """Clear the NLWeb suggestion cache."""
    try:
        service = get_nlweb_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="NLWeb service is not available"
            )
        
        success = await service.clear_cache()
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to clear cache"
            )
        
        return {
            "success": True,
            "message": "NLWeb cache cleared successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"NLWeb cache clear error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _map_nlweb_event_to_reynard(event_data: str) -> Dict[str, Any]:
    """
    Map NLWeb event data to Reynard format.
    
    This function converts NLWeb streaming events to a format compatible
    with Reynard's frontend expectations.
    """
    try:
        # Parse the incoming event
        event = json.loads(event_data)
        
        # If it's already in Reynard format, return as-is
        if event.get("type") in {
            "start", "thinking", "response", "content", "tool_execution",
            "tool_result", "complete", "error"
        }:
            return event
        
        # Map common NLWeb patterns to Reynard format
        if "error" in event:
            return {"type": "error", "error": str(event.get("error"))}
        
        if event.get("event") == "token" and "content" in event:
            return {"type": "response", "content": event.get("content", "")}
        
        if event.get("event") == "thought" and "content" in event:
            return {
                "type": "thinking",
                "content": event.get("content", ""),
                "done": False
            }
        
        if event.get("event") == "tool_selected":
            return {
                "type": "tool_execution",
                "status": event.get("status", "selected"),
                "tool_name": event.get("tool_name"),
                "parameters": event.get("parameters", {})
            }
        
        if event.get("event") == "tool_result":
            return {
                "type": "tool_result",
                "tool_name": event.get("tool_name"),
                "success": bool(event.get("success", True)),
                "data": event.get("data"),
                "error": event.get("error"),
                "execution_time": event.get("execution_time")
            }
        
        if event.get("done"):
            return {
                "type": "complete",
                "full_response": event.get("full_response"),
                "full_thinking": event.get("full_thinking")
            }
        
        # Fallback: return as content
        return {
            "type": "content",
            "content": event.get("content") or json.dumps(event)
        }
        
    except json.JSONDecodeError:
        # If we can't parse the JSON, return as error
        return {
            "type": "error",
            "error": f"Invalid JSON in event: {event_data}"
        }
    except Exception as e:
        # Any other error
        return {
            "type": "error",
            "error": f"Event mapping error: {str(e)}"
        }
