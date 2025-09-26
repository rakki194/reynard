"""🔐 RBAC RAG Service: Unified Access Control for RAG Operations

This service provides RBAC integration for the RAG system, replacing the existing
AccessControlSecurityService with a unified approach that integrates with the
Gatekeeper RBAC system.

Key Features:
- Integration with unified RBAC system
- Role-based access control for RAG operations
- Document-level permissions
- Search and embedding access controls
- Unified audit logging
- Performance optimization with caching

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from app.core.service_registry import get_service_registry
from gatekeeper.core.auth_manager import AuthManager
from gatekeeper.models.rbac import (
    Operation,
    PermissionResult,
    PermissionScope,
    ResourceType,
)

from ...interfaces.base import BaseService, ServiceStatus
from ...interfaces.security import (
    AccessLevel,
    AuditLog,
    OperationType,
    SecurityProvider,
)

logger = logging.getLogger("uvicorn")


class RBACRAGService(BaseService, SecurityProvider):
    """RBAC-integrated RAG security service."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("rbac-rag-security", config)

        # RBAC configuration
        self.audit_enabled = self.config.get("audit_enabled", True)
        self.retention_days = self.config.get("retention_days", 365)
        self.cache_enabled = self.config.get("cache_enabled", True)
        self.cache_ttl = self.config.get("cache_ttl", 300)  # 5 minutes

        # RBAC components
        self.auth_manager: Optional[AuthManager] = None
        self.audit_logs: List[AuditLog] = []
        self.permission_cache: Dict[str, Dict[str, Any]] = {}

        # Access level to RBAC role mapping
        self.access_level_mapping = {
            AccessLevel.PUBLIC: "rag_public_reader",
            AccessLevel.INTERNAL: "rag_internal_user",
            AccessLevel.CONFIDENTIAL: "rag_confidential_user",
            AccessLevel.RESTRICTED: "rag_restricted_admin",
        }

        # Operation type to RBAC operation mapping
        self.operation_mapping = {
            OperationType.READ: Operation.READ,
            OperationType.WRITE: Operation.UPDATE,
            OperationType.DELETE: Operation.DELETE,
            OperationType.SEARCH: Operation.READ,  # Search is a read operation
            OperationType.EMBED: Operation.EXECUTE,  # Embedding is an execute operation
            OperationType.INDEX: Operation.CREATE,  # Indexing is a create operation
        }

        # Metrics
        self.metrics = {
            "access_checks": 0,
            "access_granted": 0,
            "access_denied": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "audit_events": 0,
            "rbac_errors": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the RBAC RAG service."""
        try:
            self.update_status(
                ServiceStatus.INITIALIZING, "Initializing RBAC RAG service"
            )

            # Get AuthManager from service registry
            service_registry = get_service_registry()
            self.auth_manager = service_registry.get_service_instance("auth_manager")

            if not self.auth_manager:
                raise RuntimeError("AuthManager not found in service registry")

            # Initialize RBAC permissions for RAG operations
            await self._initialize_rag_permissions()

            self.update_status(ServiceStatus.HEALTHY, "RBAC RAG service initialized")
            return True

        except Exception as e:
            self.logger.error(f"Failed to initialize RBAC RAG service: {e}")
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the RBAC RAG service."""
        try:
            self.update_status(
                ServiceStatus.SHUTTING_DOWN, "Shutting down RBAC RAG service"
            )

            # Clear caches and logs
            self.audit_logs.clear()
            self.permission_cache.clear()

            self.update_status(
                ServiceStatus.SHUTDOWN, "RBAC RAG service shutdown complete"
            )

        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            # Check RBAC system connectivity
            rbac_healthy = self.auth_manager is not None

            if rbac_healthy:
                self.update_status(ServiceStatus.HEALTHY, "Service is healthy")
            else:
                self.update_status(ServiceStatus.DEGRADED, "RBAC system not connected")

            return {
                "status": self.status.value,
                "message": self.health.message,
                "last_updated": self.health.last_updated.isoformat(),
                "rbac_connected": rbac_healthy,
                "audit_enabled": self.audit_enabled,
                "cache_enabled": self.cache_enabled,
                "audit_logs_count": len(self.audit_logs),
                "cache_size": len(self.permission_cache),
                "metrics": self.metrics,
                "dependencies": self.get_dependency_status(),
            }

        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            self.update_status(ServiceStatus.ERROR, f"Health check failed: {e}")
            return {
                "status": "error",
                "message": str(e),
                "last_updated": self.health.last_updated.isoformat(),
                "dependencies": self.get_dependency_status(),
            }

    async def check_permission(
        self,
        user_id: str,
        operation: OperationType,
        resource_type: str,
        access_level: AccessLevel,
        resource_id: str = "",
        **kwargs,
    ) -> bool:
        """Check if user has permission using RBAC system."""
        if not self.is_healthy():
            return False

        try:
            self.metrics["access_checks"] += 1

            # Check cache first
            cache_key = self._get_cache_key(
                user_id, operation, resource_type, access_level, resource_id
            )
            if self.cache_enabled and cache_key in self.permission_cache:
                cached_result = self.permission_cache[cache_key]
                if time.time() - cached_result["timestamp"] < self.cache_ttl:
                    self.metrics["cache_hits"] += 1
                    return cached_result["granted"]
                else:
                    # Remove expired cache entry
                    del self.permission_cache[cache_key]

            self.metrics["cache_misses"] += 1

            # Map to RBAC operations
            rbac_operation = self.operation_mapping.get(operation)
            if not rbac_operation:
                self.logger.warning(f"No RBAC mapping for operation: {operation}")
                self.metrics["access_denied"] += 1
                return False

            # Check permission using RBAC system
            permission_result = await self.auth_manager.check_permission(
                username=user_id,
                resource_type=ResourceType.RAG_DOCUMENT,
                resource_id=resource_id or "default",
                operation=rbac_operation.value,
            )

            granted = permission_result.granted if permission_result else False

            # Cache the result
            if self.cache_enabled:
                self.permission_cache[cache_key] = {
                    "granted": granted,
                    "timestamp": time.time(),
                }

            # Log audit event
            if self.audit_enabled:
                await self.log_audit_event(
                    user_id=user_id,
                    operation=operation,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    access_level=access_level,
                    success=granted,
                    **kwargs,
                )

            if granted:
                self.metrics["access_granted"] += 1
            else:
                self.metrics["access_denied"] += 1

            return granted

        except Exception as e:
            self.logger.error(f"Permission check failed: {e}")
            self.metrics["rbac_errors"] += 1
            self.metrics["access_denied"] += 1

            # Log failed access attempt
            if self.audit_enabled:
                await self.log_audit_event(
                    user_id=user_id,
                    operation=operation,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    access_level=access_level,
                    success=False,
                    details={"error": str(e)},
                    **kwargs,
                )

            return False

    async def check_search_permission(
        self,
        user_id: str,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> bool:
        """Check if user has permission to perform search."""
        return await self.check_permission(
            user_id=user_id,
            operation=OperationType.SEARCH,
            resource_type="rag_document",
            access_level=AccessLevel.INTERNAL,  # Default to internal for search
            resource_id="search",
            query=query,
            filters=filters,
            **kwargs,
        )

    async def check_embedding_permission(
        self, user_id: str, text: str, model: str, **kwargs
    ) -> bool:
        """Check if user has permission to generate embeddings."""
        return await self.check_permission(
            user_id=user_id,
            operation=OperationType.EMBED,
            resource_type="rag_document",
            access_level=AccessLevel.INTERNAL,  # Default to internal for embeddings
            resource_id="embedding",
            text=text,
            model=model,
            **kwargs,
        )

    async def check_document_access(
        self,
        user_id: str,
        document_id: str,
        operation: OperationType,
        access_level: AccessLevel,
        **kwargs,
    ) -> bool:
        """Check if user has access to specific document."""
        return await self.check_permission(
            user_id=user_id,
            operation=operation,
            resource_type="rag_document",
            access_level=access_level,
            resource_id=document_id,
            **kwargs,
        )

    async def encrypt(
        self,
        data: str,
        access_level: AccessLevel,
    ) -> str:
        """Encrypt data based on access level."""
        # For now, return data as-is since encryption is handled by the unified RBAC system
        # In the future, this could integrate with the RBAC encryption service
        return data

    async def decrypt(
        self,
        encrypted_data: str,
        access_level: AccessLevel,
    ) -> str:
        """Decrypt data based on access level."""
        # For now, return data as-is since decryption is handled by the unified RBAC system
        return encrypted_data

    async def log_audit_event(
        self,
        user_id: str,
        operation: OperationType,
        resource_type: str,
        resource_id: str,
        access_level: AccessLevel,
        success: bool,
        details: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> str:
        """Log an audit event."""
        if not self.audit_enabled:
            return ""

        try:
            self.metrics["audit_events"] += 1

            audit_log = AuditLog(
                log_id=self._generate_log_id(),
                user_id=user_id,
                operation=operation,
                resource_type=resource_type,
                resource_id=resource_id,
                access_level=access_level,
                timestamp=datetime.now(),
                ip_address=kwargs.get("ip_address", "127.0.0.1"),
                user_agent=kwargs.get("user_agent", "system"),
                success=success,
                details=details or {},
                metadata=kwargs.get("metadata", {}),
            )

            self.audit_logs.append(audit_log)

            # Clean up old audit logs
            await self._cleanup_old_audit_logs()

            return audit_log.log_id

        except Exception as e:
            self.logger.error(f"Failed to log audit event: {e}")
            return ""

    async def get_audit_logs(
        self,
        user_id: Optional[str] = None,
        operation: Optional[OperationType] = None,
        access_level: Optional[AccessLevel] = None,
        hours: int = 24,
        **kwargs,
    ) -> List[AuditLog]:
        """Get audit logs with optional filtering."""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)

            filtered_logs = [
                log for log in self.audit_logs if log.timestamp > cutoff_time
            ]

            # Apply filters
            if user_id:
                filtered_logs = [log for log in filtered_logs if log.user_id == user_id]

            if operation:
                filtered_logs = [
                    log for log in filtered_logs if log.operation == operation
                ]

            if access_level:
                filtered_logs = [
                    log for log in filtered_logs if log.access_level == access_level
                ]

            return filtered_logs

        except Exception as e:
            self.logger.error(f"Failed to get audit logs: {e}")
            return []

    async def get_security_report(
        self, report_type: str = "summary", **kwargs
    ) -> Dict[str, Any]:
        """Generate a security report."""
        try:
            # Calculate statistics
            total_logs = len(self.audit_logs)
            successful_logs = len([log for log in self.audit_logs if log.success])
            failed_logs = total_logs - successful_logs

            # Recent activity (last 24 hours)
            recent_cutoff = datetime.now() - timedelta(hours=24)
            recent_logs = [
                log for log in self.audit_logs if log.timestamp > recent_cutoff
            ]
            recent_successful = len([log for log in recent_logs if log.success])
            recent_failed = len(recent_logs) - recent_successful

            # Access level distribution
            access_level_counts = {}
            for log in recent_logs:
                level = log.access_level.value
                access_level_counts[level] = access_level_counts.get(level, 0) + 1

            # Operation distribution
            operation_counts = {}
            for log in recent_logs:
                op = log.operation.value
                operation_counts[op] = operation_counts.get(op, 0) + 1

            return {
                "report_timestamp": datetime.now().isoformat(),
                "report_type": report_type,
                "service": "rbac_rag_security",
                "total_audit_logs": total_logs,
                "success_rate": successful_logs / total_logs if total_logs > 0 else 0,
                "recent_activity": {
                    "total_operations": len(recent_logs),
                    "successful_operations": recent_successful,
                    "failed_operations": recent_failed,
                    "success_rate": (
                        recent_successful / len(recent_logs) if recent_logs else 0
                    ),
                },
                "access_level_distribution": access_level_counts,
                "operation_distribution": operation_counts,
                "rbac_integration": {
                    "auth_manager_connected": self.auth_manager is not None,
                    "cache_enabled": self.cache_enabled,
                    "cache_size": len(self.permission_cache),
                    "cache_hit_rate": (
                        self.metrics["cache_hits"]
                        / (self.metrics["cache_hits"] + self.metrics["cache_misses"])
                        if (self.metrics["cache_hits"] + self.metrics["cache_misses"])
                        > 0
                        else 0
                    ),
                },
                "metrics": self.metrics,
            }

        except Exception as e:
            self.logger.error(f"Failed to generate security report: {e}")
            return {"error": str(e)}

    async def _initialize_rag_permissions(self) -> None:
        """Initialize RBAC permissions for RAG operations."""
        try:
            # This would typically create default permissions in the RBAC system
            # For now, we'll just log that we're initializing
            self.logger.info("Initializing RBAC permissions for RAG operations")

            # In a full implementation, this would:
            # 1. Create RAG-specific roles if they don't exist
            # 2. Create RAG-specific permissions
            # 3. Assign default permissions to roles
            # 4. Set up resource access controls

        except Exception as e:
            self.logger.error(f"Failed to initialize RAG permissions: {e}")
            raise

    def _get_cache_key(
        self,
        user_id: str,
        operation: OperationType,
        resource_type: str,
        access_level: AccessLevel,
        resource_id: str,
    ) -> str:
        """Generate cache key for permission check."""
        return f"{user_id}:{operation.value}:{resource_type}:{access_level.value}:{resource_id}"

    def _generate_log_id(self) -> str:
        """Generate unique log ID."""
        return f"rag_log_{int(time.time() * 1000)}_{hash(str(time.time())) % 10000:04d}"

    async def _cleanup_old_audit_logs(self) -> None:
        """Clean up old audit logs based on retention policies."""
        cutoff_date = datetime.now() - timedelta(days=self.retention_days)
        self.audit_logs = [
            log for log in self.audit_logs if log.timestamp > cutoff_date
        ]

    async def _cleanup_expired_cache(self) -> None:
        """Clean up expired cache entries."""
        current_time = time.time()
        expired_keys = [
            key
            for key, value in self.permission_cache.items()
            if current_time - value["timestamp"] > self.cache_ttl
        ]
        for key in expired_keys:
            del self.permission_cache[key]

    async def get_stats(self) -> Dict[str, Any]:
        """Get service statistics."""
        try:
            # Calculate statistics
            total_logs = len(self.audit_logs)
            successful_logs = len([log for log in self.audit_logs if log.success])
            failed_logs = total_logs - successful_logs

            # Cache statistics
            cache_size = len(self.permission_cache)
            cache_hit_rate = (
                self.cache_hits / (self.cache_hits + self.cache_misses)
                if (self.cache_hits + self.cache_misses) > 0
                else 0
            )

            # Recent activity (last 24 hours)
            recent_cutoff = datetime.now() - timedelta(hours=24)
            recent_logs = [
                log for log in self.audit_logs if log.timestamp > recent_cutoff
            ]
            recent_successful = len([log for log in recent_logs if log.success])
            recent_failed = len(recent_logs) - recent_successful

            return {
                "total_audit_logs": total_logs,
                "successful_operations": successful_logs,
                "failed_operations": failed_logs,
                "success_rate": successful_logs / total_logs if total_logs > 0 else 0,
                "recent_operations_24h": len(recent_logs),
                "recent_successful_24h": recent_successful,
                "recent_failed_24h": recent_failed,
                "cache_size": cache_size,
                "cache_hit_rate": cache_hit_rate,
                "cache_hits": self.cache_hits,
                "cache_misses": self.cache_misses,
                "uptime_seconds": time.time() - (self.startup_time or time.time()),
                "status": self.status.value,
                "last_updated": (
                    self.health.last_updated.isoformat() if self.health else None
                ),
            }
        except Exception as e:
            self.logger.error(f"Failed to get stats: {e}")
            return {"error": str(e), "status": self.status.value}
