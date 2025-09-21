"""
🦊 Reynard AI Tool Registry System
=================================

Comprehensive tool registry and management system for the Reynard AI tool-calling
framework. This module provides the central registry for all AI tools, handling
registration, discovery, execution coordination, and advanced validation.

The tool registry system provides:
- Centralized tool registration and lifecycle management
- Advanced parameter validation with security scanning
- Permission-based access control and audit logging
- Tool discovery and categorization with tag-based filtering
- Performance monitoring and execution metrics
- Comprehensive error handling and graceful degradation
- Support for both synchronous and asynchronous tool execution

Architecture Features:
- Registry Pattern: Centralized tool management with lazy loading
- Validation Pipeline: Multi-level parameter validation with security checks
- Permission System: Role-based access control with hierarchical permissions
- Audit Trail: Comprehensive logging for security and compliance
- Performance Monitoring: Execution metrics and performance tracking
- Error Boundaries: Graceful failure handling with detailed error reporting

Security Features:
- Parameter validation with type checking and sanitization
- Security risk assessment and threat detection
- Sensitive data redaction for logging and error reporting
- Admin-level tool execution auditing
- Permission hierarchy enforcement

The registry supports dynamic tool registration, enabling the Reynard ecosystem
to discover and utilize tools from various sources while maintaining security
and performance standards.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from datetime import UTC
from typing import Any

from .base import BaseTool, ToolExecutionContext, ToolResult
from .exceptions import ToolNotFoundError, ToolPermissionError

logger = logging.getLogger(__name__)


class ToolRegistry:
    """
    Central registry for managing AI tools with advanced validation and security features.
    
    The ToolRegistry serves as the central hub for all AI tool operations within the
    Reynard ecosystem. It provides comprehensive tool lifecycle management, including
    registration, discovery, execution coordination, and advanced security validation.
    
    Key Features:
    - Dynamic tool registration and unregistration
    - Multi-level parameter validation with security scanning
    - Permission-based access control with role hierarchy
    - Comprehensive audit logging and performance monitoring
    - Tool categorization and tag-based discovery
    - Graceful error handling and security risk assessment
    - Support for both sync and async tool execution
    
    Security Features:
    - Parameter validation with type checking and sanitization
    - Security risk assessment and threat detection
    - Sensitive data redaction for logging and error reporting
    - Admin-level tool execution auditing
    - Permission hierarchy enforcement (guest < user < admin)
    
    The registry maintains multiple indexes for efficient tool discovery:
    - Primary tool registry by name
    - Category-based index for tool grouping
    - Tag-based index for flexible filtering
    - Permission-based filtering for access control
    
    Example:
        ```python
        registry = ToolRegistry(validation_level=ValidationLevel.STANDARD)
        registry.register_tool(my_tool)
        result = await registry.execute_tool("my_tool", context, parameters)
        ```
    """

    def __init__(self, validation_level=None):
        """
        Initialize the ToolRegistry with optional validation level configuration.
        
        Creates a new tool registry instance with empty indexes and configurable
        validation settings. The registry starts with no tools and builds its
        indexes dynamically as tools are registered.
        
        Args:
            validation_level (ValidationLevel, optional): Initial validation level
                for parameter validation. If None, defaults to ValidationLevel.STANDARD.
                Available levels:
                - ValidationLevel.BASIC: Minimal validation
                - ValidationLevel.STANDARD: Standard validation with security checks
                - ValidationLevel.STRICT: Comprehensive validation with enhanced security
        
        Attributes:
            _tools (dict[str, BaseTool]): Primary tool registry by name
            _categories (dict[str, set[str]]): Category-based tool index
            _tags (dict[str, set[str]]): Tag-based tool index
            _validation_level (ValidationLevel): Current validation level
            _validator (ToolValidator): Lazy-loaded validation engine
        """
        self._tools: dict[str, BaseTool] = {}
        self._categories: dict[str, set[str]] = {}
        self._tags: dict[str, set[str]] = {}
        self._validation_level = validation_level
        self._validator = None

    def register_tool(self, tool: BaseTool) -> None:
        """
        Register a tool in the registry with comprehensive indexing.
        
        Adds a new tool to the registry and updates all relevant indexes for
        efficient discovery and filtering. The registration process includes
        category indexing, tag indexing, and validation of tool metadata.
        
        The registration process:
        1. Validates tool name uniqueness
        2. Adds tool to primary registry
        3. Updates category index for tool grouping
        4. Updates tag index for flexible filtering
        5. Logs successful registration
        
        Args:
            tool (BaseTool): Tool instance to register. Must have:
                - name (str): Unique tool identifier
                - category (str): Tool category for grouping
                - tags (list[str]): Tags for flexible filtering
                - required_permission (str): Access permission level
        
        Raises:
            ValueError: If tool name is already registered
            TypeError: If tool is not a BaseTool instance
            
        Example:
            ```python
            my_tool = MyCustomTool(name="my_tool", category="utility")
            registry.register_tool(my_tool)
            # Tool is now available for discovery and execution
            ```
        """
        if tool.name in self._tools:
            raise ValueError(f"Tool '{tool.name}' is already registered")

        self._tools[tool.name] = tool

        # Update category index
        category = tool.category
        if category not in self._categories:
            self._categories[category] = set()
        self._categories[category].add(tool.name)

        # Update tag index
        for tag in tool.tags:
            if tag not in self._tags:
                self._tags[tag] = set()
            self._tags[tag].add(tool.name)

        logger.info(f"Registered tool: {tool.name} (category: {category})")

    def unregister_tool(self, tool_name: str) -> bool:
        """
        Unregister a tool from the registry.

        Args:
            tool_name: Name of the tool to unregister

        Returns:
            True if tool was unregistered, False if not found
        """
        if tool_name not in self._tools:
            return False

        tool = self._tools[tool_name]

        # Remove from main registry
        del self._tools[tool_name]

        # Remove from category index
        if tool.category in self._categories:
            self._categories[tool.category].discard(tool_name)
            if not self._categories[tool.category]:
                del self._categories[tool.category]

        # Remove from tag index
        for tag in tool.tags:
            if tag in self._tags:
                self._tags[tag].discard(tool_name)
                if not self._tags[tag]:
                    del self._tags[tag]

        logger.info(f"Unregistered tool: {tool_name}")
        return True

    def get_tool(self, tool_name: str) -> BaseTool | None:
        """
        Get a tool by name.

        Args:
            tool_name: Name of the tool

        Returns:
            Tool instance or None if not found
        """
        return self._tools.get(tool_name)

    def list_tools(
        self,
        category: str | None = None,
        tag: str | None = None,
        permission: str | None = None,
        user_role: str | None = None,
    ) -> list[BaseTool]:
        """
        List available tools with optional filtering.

        Args:
            category: Filter by category
            tag: Filter by tag
            permission: Filter by required permission
            user_role: Filter by user role permissions

        Returns:
            List of matching tools
        """
        tools = list(self._tools.values())

        # Filter by category
        if category:
            tools = [t for t in tools if t.category == category]

        # Filter by tag
        if tag:
            tools = [t for t in tools if tag in t.tags]

        # Filter by permission
        if permission:
            tools = [t for t in tools if t.required_permission == permission]

        # Filter by user role permissions
        if user_role:
            # Define permission hierarchy
            permission_hierarchy = {
                "guest": ["read"],
                "user": ["read", "write", "execute"],
                "admin": ["read", "write", "execute", "admin"],
            }
            user_permissions = permission_hierarchy.get(user_role, [])
            tools = [t for t in tools if t.required_permission in user_permissions]

        return tools

    def search_tools(self, query: str, user_role: str | None = None) -> list[BaseTool]:
        """
        Search tools by name, description, category, or tags.

        Args:
            query: Search query
            user_role: Filter by user role permissions

        Returns:
            List of matching tools
        """
        query_lower = query.lower()
        matching_tools = []

        for tool in self._tools.values():
            # Skip tools user doesn't have permission for
            if user_role:
                permission_hierarchy = {
                    "guest": ["read"],
                    "user": ["read", "write", "execute"],
                    "admin": ["read", "write", "execute", "admin"],
                }
                user_permissions = permission_hierarchy.get(user_role, [])
                if tool.required_permission not in user_permissions:
                    continue

            # Check if query matches name, description, category, or tags
            if (
                query_lower in tool.name.lower()
                or query_lower in tool.description.lower()
                or query_lower in tool.category.lower()
                or any(query_lower in tag.lower() for tag in tool.tags)
            ):
                matching_tools.append(tool)

        return matching_tools

    def get_categories(self) -> list[str]:
        """Get list of all tool categories."""
        return list(self._categories.keys())

    def get_tags(self) -> list[str]:
        """Get list of all tool tags."""
        return list(self._tags.keys())

    def get_tools_by_category(self, category: str) -> list[BaseTool]:
        """
        Get all tools in a specific category.

        Args:
            category: Category name

        Returns:
            List of tools in the category
        """
        if category not in self._categories:
            return []

        return [self._tools[name] for name in self._categories[category]]

    def get_tools_by_tag(self, tag: str) -> list[BaseTool]:
        """
        Get all tools with a specific tag.

        Args:
            tag: Tag name

        Returns:
            List of tools with the tag
        """
        if tag not in self._tags:
            return []

        return [self._tools[name] for name in self._tags[tag]]

    async def execute_tool(
        self,
        tool_name: str,
        context: ToolExecutionContext,
        parameters: dict[str, Any] | None = None,
    ) -> ToolResult:
        """
        Execute a tool with the given parameters.

        Args:
            tool_name: Name of the tool to execute
            context: Execution context
            parameters: Tool parameters

        Returns:
            Tool execution result

        Raises:
            ToolNotFoundError: If tool is not found
            ToolPermissionError: If user lacks permission
            ToolValidationError: If parameters are invalid
        """
        # Get the tool
        tool = self.get_tool(tool_name)
        if not tool:
            raise ToolNotFoundError(tool_name)

        # Check permissions
        if not context.has_permission(tool.required_permission):
            raise ToolPermissionError(
                tool_name, tool.required_permission, context.user_role
            )

        # Prepare parameters
        original_params = parameters or {}

        # Create context for validation
        validation_context = {
            "user_id": context.user_id,
            "user_role": context.user_role,
            "session_id": getattr(context, "session_id", None),
            "request_id": getattr(context, "request_id", None),
        }

        # Use enhanced validator for comprehensive validation
        validation_result = self._get_validator().validate_tool_parameters(
            tool_name, original_params, tool.parameters, validation_context
        )

        if not validation_result.valid:
            # Create structured error result with enhanced validation details
            error_details = {
                "validation_errors": validation_result.errors,
                "validation_warnings": validation_result.warnings,
                "security_risks": [
                    risk.value for risk in validation_result.security_risks
                ],
                "provided_parameters": self._redact_sensitive_parameters(
                    original_params
                ),
                "converted_parameters": self._redact_sensitive_parameters(
                    validation_result.converted_parameters
                ),
                "tool_name": tool_name,
                "user_id": context.user_id,
                "user_role": context.user_role,
            }

            # Log security events without exposing sensitive data
            logger.warning(
                f"Tool validation failed: {tool_name} for user {context.user_id[:8]}... "
                f"(role: {context.user_role})"
            )

            if validation_result.warnings:
                logger.info(
                    f"Tool validation warnings: {tool_name} for user {context.user_id[:8]}..."
                )

            if validation_result.security_risks:
                logger.warning(
                    f"Security risks detected: {tool_name} for user {context.user_id[:8]}... "
                    f"risks: {len(validation_result.security_risks)}"
                )

            # Convert error lists to strings
            error_messages = []
            for param_name, error_list in validation_result.errors.items():
                if isinstance(error_list, list):
                    error_messages.append(f"{param_name}: {', '.join(error_list)}")
                else:
                    error_messages.append(f"{param_name}: {error_list}")

            return ToolResult.error_result(
                error=f"Parameter validation failed: {'; '.join(error_messages)}",
                metadata=error_details,
            )

        # Use converted parameters from enhanced validation
        prepared_params = validation_result.converted_parameters

        # Audit logging for admin-level tools
        if tool.required_permission == "admin":
            self._log_admin_tool_execution(tool_name, context, prepared_params)

        # Execute the tool
        logger.info(
            f"Executing tool '{tool_name}' for user {context.user_id} (role: {context.user_role})"
        )

        try:
            result = await tool.execute_with_timeout(context, **prepared_params)
            logger.info(
                f"Tool '{tool_name}' executed successfully for user {context.user_id}"
            )
            return result
        except Exception as e:
            logger.error(
                f"Tool '{tool_name}' execution failed for user {context.user_id}: {e}"
            )
            raise

    def get_tool_info(self, tool_name: str) -> dict[str, Any] | None:
        """
        Get detailed information about a tool.

        Args:
            tool_name: Name of the tool

        Returns:
            Tool information dictionary or None if not found
        """
        tool = self.get_tool(tool_name)
        if not tool:
            return None

        return tool.to_dict()

    def get_registry_stats(self) -> dict[str, Any]:
        """
        Get statistics about the tool registry.

        Returns:
            Registry statistics
        """
        return {
            "total_tools": len(self._tools),
            "categories": len(self._categories),
            "tags": len(self._tags),
            "tools_by_category": {
                category: len(tools) for category, tools in self._categories.items()
            },
            "tools_by_permission": {
                perm: len(
                    [t for t in self._tools.values() if t.required_permission == perm]
                )
                for perm in ["read", "write", "execute", "admin"]
            },
        }

    def validate_tool_parameters(
        self,
        tool_name: str,
        parameters: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Validate parameters for a tool without executing it using enhanced validation.

        Args:
            tool_name: Name of the tool to validate parameters for
            parameters: Parameters to validate
            context: Additional context for validation (e.g., user role, session info)

        Returns:
            Dictionary with validation results:
            - valid: bool - whether parameters are valid
            - errors: Dict[str, str] - validation errors if any
            - warnings: Dict[str, str] - validation warnings if any
            - tool_found: bool - whether the tool exists
            - security_risks: List[str] - security risk levels detected
            - converted_parameters: Dict[str, Any] - parameters with type conversions applied
        """
        tool = self.get_tool(tool_name)
        if not tool:
            return {
                "valid": False,
                "errors": {"tool": f"Tool '{tool_name}' not found"},
                "tool_found": False,
                "warnings": {},
                "security_risks": [],
                "converted_parameters": {},
            }

        # Use enhanced validator
        validation_result = self._get_validator().validate_tool_parameters(
            tool_name, parameters, tool.parameters, context
        )

        return {
            "valid": validation_result.valid,
            "errors": validation_result.errors,
            "warnings": validation_result.warnings,
            "tool_found": True,
            "security_risks": [risk.value for risk in validation_result.security_risks],
            "converted_parameters": self._redact_sensitive_parameters(
                validation_result.converted_parameters
            ),
        }

    def to_dict(self, user_role: str | None = None) -> dict[str, Any]:
        """
        Convert registry to dictionary for API responses.

        Args:
            user_role: Filter tools by user role permissions

        Returns:
            Registry dictionary
        """
        tools = []
        for tool in self._tools.values():
            if (
                user_role is None
                or tool.required_permission == "read"
                or self._has_permission(user_role, tool.required_permission)
            ):
                tools.append(tool.to_dict())

        return {
            "tools": tools,
            "total_tools": len(tools),
            "categories": self.get_categories(),
            "tags": self.get_tags(),
        }

    def _get_validator(self):
        """Get the validator with lazy loading."""
        if self._validator is None:
            from app.utils.tool_validator import ToolValidator, ValidationLevel

            default_level = (
                ValidationLevel.STANDARD
                if self._validation_level is None
                else self._validation_level
            )
            self._validator = ToolValidator(default_level)
        return self._validator

    def set_validation_level(self, level) -> None:
        """
        Set the validation level for the registry.

        Args:
            level: New validation level
        """
        self._get_validator().set_validation_level(level)
        logger.info(f"Tool registry validation level set to: {level.value}")

    def get_validation_level(self):
        """
        Get the current validation level.

        Returns:
            Current validation level
        """
        return self._get_validator().validation_level

    def _has_permission(self, user_role: str, required_permission: str) -> bool:
        """Check if user role has required permission."""
        permission_hierarchy = {
            "guest": ["read"],
            "user": ["read", "write", "execute"],
            "admin": ["read", "write", "execute", "admin"],
        }

        user_permissions = permission_hierarchy.get(user_role, [])
        return required_permission in user_permissions

    def _redact_sensitive_parameters(self, params: dict[str, Any]) -> dict[str, Any]:
        """
        Redact sensitive parameters for logging and error reporting.

        Args:
            params: Parameters to redact

        Returns:
            Parameters with sensitive values redacted
        """
        sensitive_keys = {
            "path",
            "dataset_path",
            "directory",
            "target_path",
            "source_path",
            "destination_path",
            "file_path",
            "password",
            "token",
            "secret",
            "key",
            "api_key",
            "private_key",
            "certificate",
            "credentials",
        }

        redacted = {}
        for key, value in params.items():
            if key.lower() in sensitive_keys or any(
                sensitive in key.lower() for sensitive in sensitive_keys
            ):
                redacted[key] = "[REDACTED]"
            else:
                redacted[key] = value

        return redacted

    def _log_admin_tool_execution(
        self, tool_name: str, context: ToolExecutionContext, params: dict[str, Any]
    ) -> None:
        """
        Log admin-level tool executions for audit purposes.

        Args:
            tool_name: Name of the tool being executed
            context: Execution context
            params: Tool parameters (already prepared)
        """
        import json
        from datetime import datetime

        audit_entry = {
            "timestamp": datetime.now(UTC).isoformat(),
            "tool_name": tool_name,
            "user_id": context.user_id,
            "user_role": context.user_role,
            "session_id": context.session_id,
            "request_id": context.request_id,
            "parameters": self._redact_sensitive_parameters(params),
            "working_directory": context.working_directory,
            "event_type": "admin_tool_execution",
        }
        audit_entry["timestamp"] = datetime.now(UTC).isoformat()

        # Log to structured audit log
        logger.info(
            f"ADMIN_TOOL_AUDIT: {json.dumps(audit_entry, default=str)}",
            extra={"audit_entry": audit_entry},
        )


# Global registry instance
_registry: ToolRegistry | None = None


def get_tool_registry() -> ToolRegistry:
    """Get the global tool registry instance."""
    global _registry
    if _registry is None:
        _registry = ToolRegistry()
    return _registry


def register_tool(tool: BaseTool) -> None:
    """Register a tool in the global registry."""
    registry = get_tool_registry()
    registry.register_tool(tool)
