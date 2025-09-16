"""
Authentication Middleware for MCP Server

This middleware handles authentication for MCP requests, validating tokens
and checking permissions before allowing access to tools.
"""

import logging
from typing import Dict, Any, Optional
from services.auth_service import mcp_auth_service

logger = logging.getLogger(__name__)


class MCPAuthMiddleware:
    """Middleware for MCP authentication and authorization."""
    
    def __init__(self):
        """Initialize the authentication middleware."""
        self.auth_service = mcp_auth_service
    
    def authenticate_request(self, request: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Authenticate an MCP request.
        
        Args:
            request: MCP request dictionary
            
        Returns:
            Token payload if authentication successful, None otherwise
        """
        try:
            # Extract token from request headers or params
            token = self._extract_token(request)
            if not token:
                logger.warning("No authentication token provided")
                return None
            
            # Validate token
            token_payload = self.auth_service.validate_mcp_token(token)
            
            logger.debug(f"Authenticated request for client: {token_payload.get('client_id')}")
            return token_payload
            
        except Exception as e:
            logger.warning(f"Authentication failed: {e}")
            return None
    
    def authorize_tool_access(self, token_payload: Dict[str, Any], tool_name: str) -> bool:
        """
        Check if a client can access a specific tool.
        
        Args:
            token_payload: Validated token payload
            tool_name: Name of the tool to access
            
        Returns:
            True if access is authorized
        """
        try:
            # Admin can access all tools
            if self.auth_service.is_admin(token_payload):
                return True
            
            # Check tool-specific permissions
            if self._is_tool_management_tool(tool_name):
                return self.auth_service.can_manage_tools(token_payload)
            elif self._is_config_tool(tool_name):
                return self.auth_service.can_read_config(token_payload)
            else:
                # Regular tools require execute permission
                return self.auth_service.can_execute_tools(token_payload)
                
        except Exception as e:
            logger.error(f"Authorization check failed for tool {tool_name}: {e}")
            return False
    
    def _extract_token(self, request: Dict[str, Any]) -> Optional[str]:
        """
        Extract authentication token from request.
        
        Args:
            request: MCP request dictionary
            
        Returns:
            Token string if found, None otherwise
        """
        # Check for token in params (for tool calls)
        params = request.get("params", {})
        if "auth_token" in params:
            return params.get("auth_token")
        
        # Check for token in headers (if available)
        headers = request.get("headers", {})
        auth_header = headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:]
        
        return None
    
    def _is_tool_management_tool(self, tool_name: str) -> bool:
        """Check if a tool is a tool management tool."""
        management_tools = {
            "get_tool_configs",
            "get_tool_status", 
            "enable_tool",
            "disable_tool",
            "toggle_tool",
            "get_tools_by_category",
            "update_tool_config"
        }
        return tool_name in management_tools
    
    def _is_config_tool(self, tool_name: str) -> bool:
        """Check if a tool is a configuration tool."""
        config_tools = {
            "reload_config",
            "get_tool_configs",
            "get_tool_status"
        }
        return tool_name in config_tools
    
    def create_error_response(self, error_message: str, request_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Create an error response for authentication/authorization failures.
        
        Args:
            error_message: Error message to include
            request_id: Request ID to include in response
            
        Returns:
            Error response dictionary
        """
        response = {
            "jsonrpc": "2.0",
            "error": {
                "code": -32001,  # Unauthorized
                "message": error_message
            }
        }
        
        if request_id is not None:
            response["id"] = request_id
        
        return response


# Global instance
mcp_auth_middleware = MCPAuthMiddleware()
