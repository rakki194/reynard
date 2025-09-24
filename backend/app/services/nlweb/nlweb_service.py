"""NLWeb Service for Reynard Backend

Main service that orchestrates the NLWeb assistant tooling and routing system.
Provides a unified interface for tool suggestion, performance monitoring, and configuration.
"""

import logging
import time
from datetime import datetime
from typing import Any

from .models import (
    NLWebConfiguration,
    NLWebHealthStatus,
    NLWebPerformanceStats,
    NLWebRollbackRequest,
    NLWebRollbackResponse,
    NLWebSuggestionRequest,
    NLWebSuggestionResponse,
    NLWebTool,
    NLWebVerificationCheck,
    NLWebVerificationResponse,
)
from .nlweb_router import NLWebRouter
from .nlweb_tool_registry import NLWebToolRegistry

logger = logging.getLogger(__name__)


class NLWebService:
    """Main NLWeb service orchestrator."""

    def __init__(self, configuration: NLWebConfiguration | None = None):
        self.configuration = configuration or NLWebConfiguration()
        self.tool_registry = NLWebToolRegistry()
        self.router = NLWebRouter(self.tool_registry)
        self.initialized = False
        self.enabled = self.configuration.enabled

        # Service state
        self.connection_state = "disconnected"
        self.connection_attempts = 0
        self.last_ok_timestamp: datetime | None = None
        self.rollback_enabled = self.configuration.rollback_enabled

        # Performance tracking
        self.start_time = time.time()
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0

    async def initialize(self) -> bool:
        """Initialize the NLWeb service."""
        if self.initialized:
            return True

        try:
            if not self.enabled:
                logger.info("NLWeb service disabled in configuration")
                return True

            # Register default tools
            await self._register_default_tools()

            # Initialize router
            await self._initialize_router()

            # Set up health monitoring
            await self._setup_health_monitoring()

            self.initialized = True
            self.connection_state = "connected"
            self.last_ok_timestamp = datetime.now()

            logger.info("NLWeb service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize NLWeb service: {e}")
            self.connection_state = "error"
            return False

    async def shutdown(self) -> bool:
        """Shutdown the NLWeb service."""
        try:
            self.enabled = False
            self.connection_state = "disconnected"
            self.initialized = False

            logger.info("NLWeb service shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error during NLWeb service shutdown: {e}")
            return False

    async def suggest_tools(
        self, request: NLWebSuggestionRequest,
    ) -> NLWebSuggestionResponse:
        """Get tool suggestions for a natural language query."""
        if not self.enabled or not self.initialized:
            raise RuntimeError("NLWeb service is not available")

        try:
            self.total_requests += 1

            # Check rollback status
            if self.rollback_enabled:
                logger.warning(
                    "NLWeb service is in rollback mode - suggestions disabled",
                )
                return NLWebSuggestionResponse(
                    suggestions=[],
                    query=request.query,
                    processing_time_ms=0.0,
                    cache_hit=False,
                    total_tools_considered=0,
                )

            # Get suggestions from router
            response = await self.router.suggest_tools(request)

            self.successful_requests += 1
            self.last_ok_timestamp = datetime.now()

            return response

        except Exception as e:
            self.failed_requests += 1
            logger.error(f"Error in tool suggestion: {e}")
            raise

    async def get_health_status(self) -> NLWebHealthStatus:
        """Get the health status of the NLWeb service."""
        try:
            # Determine overall status
            if not self.enabled:
                status = "disabled"
            elif not self.initialized:
                status = "unhealthy"
            elif self.rollback_enabled:
                status = "degraded"
            elif self.connection_state == "connected":
                status = "healthy"
            else:
                status = "unhealthy"

            # Get performance stats
            performance_stats = self.router.get_performance_stats()

            return NLWebHealthStatus(
                status=status,
                enabled=self.enabled,
                connection_state=self.connection_state,
                connection_attempts=self.connection_attempts,
                last_ok_timestamp=self.last_ok_timestamp,
                base_url=self.configuration.base_url,
                canary_enabled=self.configuration.canary_enabled,
                canary_percentage=self.configuration.canary_percentage,
                rollback_enabled=self.rollback_enabled,
                performance_monitoring=self.configuration.performance_monitoring_enabled,
            )

        except Exception as e:
            logger.error(f"Error getting health status: {e}")
            return NLWebHealthStatus(
                status="unhealthy",
                enabled=False,
                connection_state="error",
                connection_attempts=self.connection_attempts,
                last_ok_timestamp=None,
                base_url=None,
                canary_enabled=False,
                canary_percentage=0.0,
                rollback_enabled=False,
                performance_monitoring=False,
            )

    async def get_performance_stats(self) -> NLWebPerformanceStats:
        """Get performance statistics."""
        try:
            router_stats = self.router.get_performance_stats()

            # Update with service-level stats
            router_stats.total_requests = self.total_requests
            router_stats.successful_requests = self.successful_requests
            router_stats.failed_requests = self.failed_requests

            return router_stats

        except Exception as e:
            logger.error(f"Error getting performance stats: {e}")
            return NLWebPerformanceStats()

    async def get_tools(
        self, category: str | None = None, tags: list[str] | None = None,
    ) -> list[NLWebTool]:
        """Get available tools, optionally filtered by category or tags."""
        try:
            if category:
                return self.tool_registry.get_tools_by_category(category)
            if tags:
                tools = []
                for tag in tags:
                    tools.extend(self.tool_registry.get_tools_by_tag(tag))
                return tools
            return self.tool_registry.get_enabled_tools()

        except Exception as e:
            logger.error(f"Error getting tools: {e}")
            return []

    async def register_tool(self, tool: NLWebTool) -> bool:
        """Register a new tool."""
        try:
            return self.tool_registry.register_tool(tool)
        except Exception as e:
            logger.error(f"Error registering tool {tool.name}: {e}")
            return False

    async def unregister_tool(self, tool_name: str) -> bool:
        """Unregister a tool."""
        try:
            return self.tool_registry.unregister_tool(tool_name)
        except Exception as e:
            logger.error(f"Error unregistering tool {tool_name}: {e}")
            return False

    async def enable_tool(self, tool_name: str) -> bool:
        """Enable a tool."""
        try:
            return self.tool_registry.enable_tool(tool_name)
        except Exception as e:
            logger.error(f"Error enabling tool {tool_name}: {e}")
            return False

    async def disable_tool(self, tool_name: str) -> bool:
        """Disable a tool."""
        try:
            return self.tool_registry.disable_tool(tool_name)
        except Exception as e:
            logger.error(f"Error disabling tool {tool_name}: {e}")
            return False

    async def update_configuration(self, config: dict[str, Any]) -> bool:
        """Update service configuration."""
        try:
            # Update configuration
            for key, value in config.items():
                if hasattr(self.configuration, key):
                    setattr(self.configuration, key, value)

            # Apply configuration changes
            await self._apply_configuration_changes()

            logger.info("NLWeb service configuration updated")
            return True

        except Exception as e:
            logger.error(f"Error updating configuration: {e}")
            return False

    async def enable_rollback(
        self, request: NLWebRollbackRequest,
    ) -> NLWebRollbackResponse:
        """Enable or disable emergency rollback."""
        try:
            self.rollback_enabled = request.enable
            self.configuration.rollback_enabled = request.enable

            logger.warning(
                f"NLWeb rollback {'enabled' if request.enable else 'disabled'}: {request.reason}",
            )

            return NLWebRollbackResponse(
                success=True,
                rollback_enabled=self.rollback_enabled,
                reason=request.reason,
                timestamp=datetime.now(),
            )

        except Exception as e:
            logger.error(f"Error updating rollback status: {e}")
            return NLWebRollbackResponse(
                success=False,
                rollback_enabled=self.rollback_enabled,
                reason=f"Error: {e!s}",
                timestamp=datetime.now(),
            )

    async def get_verification_checklist(self) -> NLWebVerificationResponse:
        """Get verification checklist for rollout."""
        try:
            checks = []

            # Service availability check
            checks.append(
                NLWebVerificationCheck(
                    name="service_available",
                    description="NLWeb service is available and initialized",
                    status="pass" if self.initialized else "fail",
                    value=self.initialized,
                    threshold="true",
                ),
            )

            # Configuration check
            checks.append(
                NLWebVerificationCheck(
                    name="configuration_loaded",
                    description="NLWeb configuration is loaded",
                    status="pass" if self.configuration else "fail",
                    value=self.configuration is not None,
                    threshold="true",
                ),
            )

            # Performance checks
            if self.configuration.performance_monitoring_enabled:
                performance_stats = await self.get_performance_stats()

                checks.append(
                    NLWebVerificationCheck(
                        name="suggestion_latency_p95",
                        description="P95 suggestion latency under 1.5s",
                        status=(
                            "pass"
                            if performance_stats.p95_processing_time_ms <= 1500
                            else "fail"
                        ),
                        value=f"{performance_stats.p95_processing_time_ms:.1f}ms",
                        threshold="1500ms",
                    ),
                )

                checks.append(
                    NLWebVerificationCheck(
                        name="cache_hit_rate",
                        description="Cache hit rate above 20%",
                        status=(
                            "pass" if performance_stats.cache_hit_rate >= 20 else "fail"
                        ),
                        value=f"{performance_stats.cache_hit_rate:.1f}%",
                        threshold="20%",
                    ),
                )

                checks.append(
                    NLWebVerificationCheck(
                        name="total_requests",
                        description="At least 10 requests processed",
                        status=(
                            "pass" if performance_stats.total_requests >= 10 else "warn"
                        ),
                        value=performance_stats.total_requests,
                        threshold="10",
                    ),
                )

            # Configuration checks
            checks.append(
                NLWebVerificationCheck(
                    name="nlweb_enabled",
                    description="NLWeb integration enabled",
                    status="pass" if self.configuration.enabled else "info",
                    value=self.configuration.enabled,
                    threshold="true",
                ),
            )

            checks.append(
                NLWebVerificationCheck(
                    name="canary_enabled",
                    description="Canary rollout enabled",
                    status="pass" if self.configuration.canary_enabled else "info",
                    value=self.configuration.canary_enabled,
                    threshold="true",
                ),
            )

            checks.append(
                NLWebVerificationCheck(
                    name="rollback_enabled",
                    description="Emergency rollback enabled",
                    status="warn" if self.configuration.rollback_enabled else "pass",
                    value=self.configuration.rollback_enabled,
                    threshold="false",
                ),
            )

            # Determine overall status
            overall_status = "pass"
            if any(check.status == "fail" for check in checks):
                overall_status = "fail"
            elif any(check.status == "warn" for check in checks):
                overall_status = "warn"

            return NLWebVerificationResponse(
                service_available=self.initialized,
                config_loaded=self.configuration is not None,
                checks=checks,
                overall_status=overall_status,
            )

        except Exception as e:
            logger.error(f"Error getting verification checklist: {e}")
            return NLWebVerificationResponse(
                service_available=False,
                config_loaded=False,
                checks=[],
                overall_status="fail",
            )

    async def clear_cache(self) -> bool:
        """Clear the suggestion cache."""
        try:
            self.router.clear_cache()
            logger.info("NLWeb service cache cleared")
            return True
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False

    async def _register_default_tools(self):
        """Register default tools."""
        try:
            # Git tools
            git_status_tool = NLWebTool(
                name="git_status",
                description="Show the status of the git repository",
                category="git",
                tags=["git", "status", "repository", "version control"],
                path="/api/git/status",
                method="GET",
                parameters=[],
                examples=[
                    "show git status",
                    "what's the git status",
                    "check repository status",
                ],
                priority=80,
            )

            git_log_tool = NLWebTool(
                name="git_log",
                description="Show git commit history",
                category="git",
                tags=["git", "log", "history", "commits"],
                path="/api/git/log",
                method="GET",
                parameters=[],
                examples=["show git log", "git history", "recent commits"],
                priority=70,
            )

            # File tools
            list_files_tool = NLWebTool(
                name="list_files",
                description="List files in a directory",
                category="file",
                tags=["file", "list", "directory", "folder"],
                path="/api/files/list",
                method="GET",
                parameters=[],
                examples=[
                    "list files",
                    "show directory contents",
                    "what files are here",
                ],
                priority=90,
            )

            read_file_tool = NLWebTool(
                name="read_file",
                description="Read the contents of a file",
                category="file",
                tags=["file", "read", "content", "view"],
                path="/api/files/read",
                method="GET",
                parameters=[],
                examples=["read file", "show file contents", "view file"],
                priority=85,
            )

            # Caption tools
            generate_captions_tool = NLWebTool(
                name="generate_captions",
                description="Generate captions for images",
                category="caption",
                tags=["caption", "image", "describe", "generate"],
                path="/api/caption/generate",
                method="POST",
                parameters=[],
                examples=[
                    "generate captions",
                    "describe images",
                    "caption these pictures",
                ],
                priority=75,
            )

            # Register tools
            tools = [
                git_status_tool,
                git_log_tool,
                list_files_tool,
                read_file_tool,
                generate_captions_tool,
            ]

            for tool in tools:
                self.tool_registry.register_tool(tool)

            logger.info(f"Registered {len(tools)} default NLWeb tools")

        except Exception as e:
            logger.error(f"Error registering default tools: {e}")

    async def _initialize_router(self):
        """Initialize the router."""
        try:
            # Router is already initialized in constructor
            # Could add additional setup here if needed
            pass
        except Exception as e:
            logger.error(f"Error initializing router: {e}")
            raise

    async def _setup_health_monitoring(self):
        """Set up health monitoring."""
        try:
            # Could set up periodic health checks here
            pass
        except Exception as e:
            logger.error(f"Error setting up health monitoring: {e}")

    async def _apply_configuration_changes(self):
        """Apply configuration changes."""
        try:
            # Update service state based on configuration
            self.enabled = self.configuration.enabled
            self.rollback_enabled = self.configuration.rollback_enabled

            # Update router configuration
            self.router.cache_ttl = self.configuration.cache_ttl_s
            self.router.cache_max_size = self.configuration.cache_max_entries

        except Exception as e:
            logger.error(f"Error applying configuration changes: {e}")

    def is_available(self) -> bool:
        """Check if the service is available."""
        return self.enabled and self.initialized and not self.rollback_enabled

    def get_info(self) -> dict[str, Any]:
        """Get service information."""
        return {
            "name": "NLWeb Service",
            "version": "1.0.0",
            "enabled": self.enabled,
            "initialized": self.initialized,
            "connection_state": self.connection_state,
            "connection_attempts": self.connection_attempts,
            "base_url": self.configuration.base_url,
            "rollback_enabled": self.rollback_enabled,
            "uptime_seconds": time.time() - self.start_time,
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "failed_requests": self.failed_requests,
        }
