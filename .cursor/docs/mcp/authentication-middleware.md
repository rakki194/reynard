# MCP Authentication and Middleware Patterns

## Overview

This document covers authentication and middleware patterns used in the Reynard MCP server, including how to implement
secure tool access, request validation, and authorization mechanisms.

## Authentication Architecture

### Middleware Stack

The MCP server uses a layered middleware approach:

```text
Request → Auth Middleware → Tool Registry → Tool Handler → Response
```

### Core Components

1. **Authentication Middleware**: Validates tokens and user identity
2. **Authorization Service**: Checks permissions for specific tools
3. **Request Validation**: Ensures request format and content validity
4. **Error Handling**: Provides consistent error responses

## Authentication Middleware

### Basic Structure

```python
# middleware/auth_middleware.py
import logging
from typing import Any, Dict, Optional
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
            Token payload if authenticated, None otherwise
        """
        try:
            # Extract token from request headers or body
            token = self._extract_token(request)
            if not token:
                logger.warning("No authentication token provided")
                return None

            # Validate token
            payload = self.auth_service.validate_token(token)
            if not payload:
                logger.warning("Invalid authentication token")
                return None

            logger.info(f"Authenticated user: {payload.get('user_id', 'unknown')}")
            return payload

        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return None

    def _extract_token(self, request: Dict[str, Any]) -> Optional[str]:
        """Extract authentication token from request."""
        # Check Authorization header
        headers = request.get('headers', {})
        auth_header = headers.get('Authorization', '')

        if auth_header.startswith('Bearer '):
            return auth_header[7:]  # Remove 'Bearer ' prefix

        # Check request body for token
        return request.get('token')

    def authorize_tool_access(self, token_payload: Dict[str, Any], tool_name: str) -> bool:
        """
        Authorize access to a specific tool.

        Args:
            token_payload: Validated token payload
            tool_name: Name of the tool being accessed

        Returns:
            True if authorized, False otherwise
        """
        try:
            user_id = token_payload.get('user_id')
            permissions = token_payload.get('permissions', [])

            # Check if user has wildcard permission
            if '*' in permissions:
                return True

            # Check tool-specific permissions
            tool_permission = f"tool:{tool_name}"
            if tool_permission in permissions:
                return True

            # Check category-based permissions
            tool_category = self._get_tool_category(tool_name)
            category_permission = f"category:{tool_category}"
            if category_permission in permissions:
                return True

            logger.warning(f"Access denied for user {user_id} to tool {tool_name}")
            return False

        except Exception as e:
            logger.error(f"Authorization error: {e}")
            return False

    def _get_tool_category(self, tool_name: str) -> str:
        """Get the category for a tool."""
        # This would typically query the tool registry
        category_mapping = {
            'get_secret': 'utility',
            'list_available_secrets': 'utility',
            'validate_secret': 'utility',
            'lint_frontend': 'linting',
            'format_frontend': 'linting',
            # Add more mappings as needed
        }
        return category_mapping.get(tool_name, 'unknown')

    def create_error_response(self, message: str, request_id: Any) -> Dict[str, Any]:
        """Create a standardized error response."""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {
                "code": -32001,  # Unauthorized
                "message": message,
            },
        }
```

## Tool Access Control

### Authentication Requirements

Not all tools require authentication. The system distinguishes between:

1. **Public Tools**: No authentication required (e.g., `get_current_time`)
2. **Protected Tools**: Authentication required (e.g., `get_secret`)
3. **Admin Tools**: Special permissions required (e.g., `enable_tool`)

```python
# protocol/mcp_handler.py
def _requires_auth(self, tool_name: str) -> bool:
    """Check if a tool requires authentication."""
    # Tool management tools require authentication
    management_tools = {
        "get_tool_configs",
        "get_tool_status",
        "enable_tool",
        "disable_tool",
        "toggle_tool",
        "get_tools_by_category",
        "update_tool_config",
        "reload_config",
    }

    # Secrets tools require authentication
    secrets_tools = {
        "get_secret",
        "list_available_secrets",
        "validate_secret",
    }

    # Admin tools require special permissions
    admin_tools = {
        "enable_tool",
        "disable_tool",
        "reload_config",
    }

    return tool_name in (management_tools | secrets_tools | admin_tools)

def _requires_admin(self, tool_name: str) -> bool:
    """Check if a tool requires admin permissions."""
    admin_tools = {
        "enable_tool",
        "disable_tool",
        "reload_config",
    }
    return tool_name in admin_tools
```

### Request Processing with Authentication

```python
async def handle_tool_call(
    self,
    tool_name: str,
    arguments: dict[str, Any],
    request_id: Any,
    request: Optional[dict] = None,
) -> dict[str, Any]:
    """Handle tool call request with authentication."""
    try:
        # Authenticate request if authentication is required
        if request and self._requires_auth(tool_name):
            token_payload = mcp_auth_middleware.authenticate_request(request)
            if not token_payload:
                return mcp_auth_middleware.create_error_response(
                    "Authentication required", request_id
                )

            # Check admin permissions for admin tools
            if self._requires_admin(tool_name):
                if not self._is_admin(token_payload):
                    return mcp_auth_middleware.create_error_response(
                        "Admin permissions required", request_id
                    )

            # Authorize tool access
            if not mcp_auth_middleware.authorize_tool_access(
                token_payload, tool_name
            ):
                return mcp_auth_middleware.create_error_response(
                    f"Access denied for tool '{tool_name}'", request_id
                )

        # Check if tool is enabled
        if not self.tool_registry.is_tool_enabled(tool_name):
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32601,
                    "message": f"Tool '{tool_name}' is disabled",
                },
            }

        # Execute tool
        result = await self.tool_router.route_tool_call(tool_name, arguments)
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": result,
        }

    except Exception as e:
        logger.error(f"Tool call error: {e}")
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {"code": -32603, "message": f"Internal error: {error!s}"},
        }
```

## Token Management

### JWT Token Structure

```python
# services/auth_service.py
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class MCPAuthService:
    """Service for MCP authentication and token management."""

    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.algorithm = "HS256"

    def generate_token(self, user_id: str, permissions: list[str], expires_in: int = 3600) -> str:
        """Generate a JWT token for a user."""
        payload = {
            'user_id': user_id,
            'permissions': permissions,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in),
            'iat': datetime.utcnow(),
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate a JWT token and return payload."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return None

    def refresh_token(self, token: str) -> Optional[str]:
        """Refresh an existing token."""
        payload = self.validate_token(token)
        if not payload:
            return None

        # Generate new token with same permissions
        return self.generate_token(
            payload['user_id'],
            payload['permissions']
        )
```

### Token Storage and Retrieval

```python
# services/token_storage.py
import redis
from typing import Optional, Dict, Any
import json

class TokenStorage:
    """Redis-based token storage for session management."""

    def __init__(self, redis_url: str):
        self.redis_client = redis.from_url(redis_url)

    def store_token(self, token: str, user_data: Dict[str, Any], ttl: int = 3600):
        """Store token with user data."""
        key = f"mcp:token:{token}"
        self.redis_client.setex(key, ttl, json.dumps(user_data))

    def get_token_data(self, token: str) -> Optional[Dict[str, Any]]:
        """Retrieve token data."""
        key = f"mcp:token:{token}"
        data = self.redis_client.get(key)
        if data:
            return json.loads(data)
        return None

    def revoke_token(self, token: str):
        """Revoke a token."""
        key = f"mcp:token:{token}"
        self.redis_client.delete(key)

    def revoke_user_tokens(self, user_id: str):
        """Revoke all tokens for a user."""
        pattern = f"mcp:token:*"
        for key in self.redis_client.scan_iter(match=pattern):
            data = self.redis_client.get(key)
            if data:
                user_data = json.loads(data)
                if user_data.get('user_id') == user_id:
                    self.redis_client.delete(key)
```

## Permission System

### Permission Levels

```python
# services/permission_service.py
from enum import Enum
from typing import Set, List

class PermissionLevel(Enum):
    """Permission levels for MCP tools."""
    PUBLIC = "public"           # No authentication required
    USER = "user"              # Basic user authentication
    ADMIN = "admin"            # Administrative permissions
    SUPER_ADMIN = "super_admin" # Full system access

class PermissionService:
    """Service for managing tool permissions."""

    def __init__(self):
        self.tool_permissions = {
            # Public tools
            "get_current_time": PermissionLevel.PUBLIC,
            "get_current_location": PermissionLevel.PUBLIC,

            # User tools
            "get_secret": PermissionLevel.USER,
            "list_available_secrets": PermissionLevel.USER,
            "validate_secret": PermissionLevel.USER,

            # Admin tools
            "enable_tool": PermissionLevel.ADMIN,
            "disable_tool": PermissionLevel.ADMIN,
            "reload_config": PermissionLevel.ADMIN,

            # Super admin tools
            "system_shutdown": PermissionLevel.SUPER_ADMIN,
        }

    def get_required_permission(self, tool_name: str) -> PermissionLevel:
        """Get the required permission level for a tool."""
        return self.tool_permissions.get(tool_name, PermissionLevel.USER)

    def check_permission(self, user_permissions: List[str], tool_name: str) -> bool:
        """Check if user has permission to access a tool."""
        required_level = self.get_required_permission(tool_name)

        if required_level == PermissionLevel.PUBLIC:
            return True

        # Check for wildcard permission
        if "*" in user_permissions:
            return True

        # Check for specific permission
        tool_permission = f"tool:{tool_name}"
        if tool_permission in user_permissions:
            return True

        # Check for level-based permission
        level_permission = f"level:{required_level.value}"
        if level_permission in user_permissions:
            return True

        return False
```

## Security Best Practices

### 1. Token Security

```python
# Security configurations
SECURITY_CONFIG = {
    "token_expiry": 3600,  # 1 hour
    "refresh_token_expiry": 86400,  # 24 hours
    "max_login_attempts": 5,
    "lockout_duration": 900,  # 15 minutes
    "password_min_length": 12,
    "require_2fa": True,
}
```

### 2. Rate Limiting

```python
# middleware/rate_limiting.py
import time
from collections import defaultdict, deque
from typing import Dict, Deque

class RateLimiter:
    """Rate limiting middleware for MCP requests."""

    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, Deque[float]] = defaultdict(deque)

    def is_allowed(self, user_id: str) -> bool:
        """Check if user is within rate limits."""
        now = time.time()
        user_requests = self.requests[user_id]

        # Remove old requests outside the window
        while user_requests and user_requests[0] <= now - self.window_seconds:
            user_requests.popleft()

        # Check if under limit
        if len(user_requests) >= self.max_requests:
            return False

        # Add current request
        user_requests.append(now)
        return True
```

### 3. Input Validation

```python
# middleware/validation.py
from typing import Any, Dict, List
import re

class RequestValidator:
    """Request validation middleware."""

    def __init__(self):
        self.allowed_methods = {
            "tools/list",
            "tools/call",
            "initialize",
            "ping",
        }

        self.tool_name_pattern = re.compile(r'^[a-z][a-z0-9_]*$')

    def validate_request(self, request: Dict[str, Any]) -> tuple[bool, str]:
        """Validate MCP request structure."""
        # Check required fields
        if "method" not in request:
            return False, "Missing 'method' field"

        if "id" not in request:
            return False, "Missing 'id' field"

        # Check method validity
        method = request["method"]
        if method not in self.allowed_methods:
            return False, f"Invalid method: {method}"

        # Validate tool calls
        if method == "tools/call":
            return self._validate_tool_call(request)

        return True, ""

    def _validate_tool_call(self, request: Dict[str, Any]) -> tuple[bool, str]:
        """Validate tool call request."""
        params = request.get("params", {})

        if "name" not in params:
            return False, "Missing tool name"

        tool_name = params["name"]
        if not self.tool_name_pattern.match(tool_name):
            return False, f"Invalid tool name: {tool_name}"

        if "arguments" not in params:
            return False, "Missing arguments"

        return True, ""
```

## Testing Authentication

### Unit Tests

```python
import unittest
from unittest.mock import patch, MagicMock
from middleware.auth_middleware import MCPAuthMiddleware

class TestMCPAuthMiddleware(unittest.TestCase):
    def setUp(self):
        self.middleware = MCPAuthMiddleware()

    def test_authenticate_valid_token(self):
        """Test authentication with valid token."""
        request = {
            'headers': {'Authorization': 'Bearer valid_token'},
            'id': 1
        }

        with patch.object(self.middleware.auth_service, 'validate_token') as mock_validate:
            mock_validate.return_value = {'user_id': 'test_user', 'permissions': ['*']}

            result = self.middleware.authenticate_request(request)

            self.assertIsNotNone(result)
            self.assertEqual(result['user_id'], 'test_user')

    def test_authenticate_invalid_token(self):
        """Test authentication with invalid token."""
        request = {
            'headers': {'Authorization': 'Bearer invalid_token'},
            'id': 1
        }

        with patch.object(self.middleware.auth_service, 'validate_token') as mock_validate:
            mock_validate.return_value = None

            result = self.middleware.authenticate_request(request)

            self.assertIsNone(result)

    def test_authorize_tool_access(self):
        """Test tool authorization."""
        token_payload = {
            'user_id': 'test_user',
            'permissions': ['tool:get_secret', 'category:utility']
        }

        # Test authorized access
        result = self.middleware.authorize_tool_access(token_payload, 'get_secret')
        self.assertTrue(result)

        # Test unauthorized access
        result = self.middleware.authorize_tool_access(token_payload, 'admin_tool')
        self.assertFalse(result)
```

### Integration Tests

```python
import asyncio
from main import MCPServer

async def test_authenticated_tool_call():
    """Test tool call with authentication."""
    server = MCPServer()

    # Test unauthenticated call to protected tool
    request = {
        'method': 'tools/call',
        'params': {
            'name': 'get_secret',
            'arguments': {'secret_name': 'GH_TOKEN'}
        },
        'id': 1
    }

    response = await server.handle_request(request)
    assert 'error' in response
    assert 'Authentication required' in response['error']['message']

    # Test authenticated call
    authenticated_request = {
        'method': 'tools/call',
        'params': {
            'name': 'get_secret',
            'arguments': {'secret_name': 'GH_TOKEN'}
        },
        'id': 2,
        'headers': {'Authorization': 'Bearer valid_token'}
    }

    with patch('middleware.auth_middleware.mcp_auth_middleware.authenticate_request') as mock_auth:
        mock_auth.return_value = {'user_id': 'test_user', 'permissions': ['*']}

        response = await server.handle_request(authenticated_request)
        assert 'result' in response

asyncio.run(test_authenticated_tool_call())
```

## Configuration

### Environment Variables

```bash
# Authentication configuration
MCP_AUTH_SECRET_KEY=your-secret-key-here
MCP_AUTH_TOKEN_EXPIRY=3600
MCP_AUTH_REFRESH_EXPIRY=86400

# Redis configuration for token storage
REDIS_URL=redis://localhost:6379/0

# Rate limiting
MCP_RATE_LIMIT_MAX_REQUESTS=100
MCP_RATE_LIMIT_WINDOW_SECONDS=60

# Security settings
MCP_REQUIRE_2FA=true
MCP_MAX_LOGIN_ATTEMPTS=5
MCP_LOCKOUT_DURATION=900
```

### Configuration File

```json
{
  "authentication": {
    "enabled": true,
    "secret_key": "${MCP_AUTH_SECRET_KEY}",
    "token_expiry": 3600,
    "refresh_expiry": 86400,
    "require_2fa": true
  },
  "rate_limiting": {
    "enabled": true,
    "max_requests": 100,
    "window_seconds": 60
  },
  "permissions": {
    "default_level": "user",
    "admin_tools": ["enable_tool", "disable_tool", "reload_config"],
    "public_tools": ["get_current_time", "get_current_location"]
  }
}
```

## Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [Redis Security](https://redis.io/topics/security)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
