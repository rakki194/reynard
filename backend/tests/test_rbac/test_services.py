"""🧪 RBAC Services Unit Tests

Comprehensive unit tests for RBAC services including AccessControlService,
RoleService, PermissionService, AuditService, and ContextService.

Author: Reynard Development Team
Version: 1.0.0
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from unittest.mock import AsyncMock, Mock, patch
from uuid import uuid4

import pytest

from gatekeeper.core.auth_manager import AuthManager
from gatekeeper.models.rbac import (
    Operation,
    Permission,
    PermissionCreate,
    PermissionResult,
    PermissionScope,
    ResourceAccessControl,
    ResourcePermissionGrant,
    ResourceType,
    Role,
    RoleCreate,
    UserRoleAssignment,
    UserRoleLink,
)

# Import existing services
from gatekeeper.services.rbac_service import RBACService
from gatekeeper.services.security_monitoring_service import SecurityMonitoringService

# Import mock services from conftest
from .conftest import MockAuditService, MockRBACService


class TestRBACService:
    """Test cases for RBACService."""

    @pytest.fixture
    def mock_auth_manager(self):
        """Create mock AuthManager."""
        auth_manager = Mock(spec=AuthManager)
        auth_manager.backend = Mock()
        return auth_manager

    @pytest.fixture
    def rbac_service(self, mock_auth_manager):
        """Create MockRBACService instance with mocked dependencies."""
        return MockRBACService(auth_manager=mock_auth_manager)

    @pytest.mark.asyncio
    async def test_check_permission_granted(self, rbac_service, mock_auth_manager):
        """Test permission check when permission is granted."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        operation = Operation.READ

        # Mock user with role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with permission
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "note_reader"

        mock_permission = Mock()
        mock_permission.resource_type = resource_type
        mock_permission.operation = operation
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        mock_auth_manager.backend.get_user_by_id.return_value = mock_user
        mock_auth_manager.backend.get_user_roles.return_value = [mock_role]
        mock_auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            operation=operation,
        )

        assert result.granted is True
        assert result.reason == "User has required permission"
        assert result.conditions_met is True

    @pytest.mark.asyncio
    async def test_check_permission_denied_no_role(
        self, rbac_service, mock_auth_manager
    ):
        """Test permission check when user has no roles."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        operation = Operation.READ

        # Mock user without roles
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Setup mocks
        mock_auth_manager.backend.get_user_by_id.return_value = mock_user
        mock_auth_manager.backend.get_user_roles.return_value = []

        result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            operation=operation,
        )

        assert result.granted is False
        assert result.reason == "User has no roles assigned"
        assert result.conditions_met is False

    @pytest.mark.asyncio
    async def test_check_permission_denied_no_permission(
        self, rbac_service, mock_auth_manager
    ):
        """Test permission check when user has role but no permission."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        operation = Operation.DELETE

        # Mock user with role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role without required permission
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "note_reader"

        mock_permission = Mock()
        mock_permission.resource_type = resource_type
        mock_permission.operation = Operation.READ  # Different operation
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        mock_auth_manager.backend.get_user_by_id.return_value = mock_user
        mock_auth_manager.backend.get_user_roles.return_value = [mock_role]
        mock_auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            operation=operation,
        )

        assert result.granted is False
        assert result.reason == "User lacks required permission"
        assert result.conditions_met is False

    @pytest.mark.asyncio
    async def test_check_permission_rbac_disabled(
        self, rbac_service, mock_auth_manager
    ):
        """Test permission check when RBAC is disabled for user."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        operation = Operation.READ

        # Mock user with RBAC disabled
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = False

        # Setup mocks
        mock_auth_manager.backend.get_user_by_id.return_value = mock_user

        result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            operation=operation,
        )

        assert result.granted is False
        assert result.reason == "RBAC is disabled for user"
        assert result.conditions_met is False

    @pytest.mark.asyncio
    async def test_assign_role(self, rbac_service, mock_auth_manager):
        """Test role assignment."""
        user_id = uuid4()
        role_id = uuid4()
        context = {"type": "project", "id": str(uuid4())}

        # Mock successful role assignment
        mock_auth_manager.backend.assign_role.return_value = True

        result = await rbac_service.assign_role(
            user_id=user_id, role_id=role_id, context=context
        )

        assert result is True
        mock_auth_manager.backend.assign_role.assert_called_once_with(
            user_id=user_id, role_id=role_id, context=context
        )

    @pytest.mark.asyncio
    async def test_remove_role(self, rbac_service, mock_auth_manager):
        """Test role removal."""
        user_id = uuid4()
        role_id = uuid4()

        # Mock successful role removal
        mock_auth_manager.backend.remove_role.return_value = True

        result = await rbac_service.remove_role(user_id=user_id, role_id=role_id)

        assert result is True
        mock_auth_manager.backend.remove_role.assert_called_once_with(
            user_id=user_id, role_id=role_id
        )

    @pytest.mark.asyncio
    async def test_get_user_roles(self, rbac_service, mock_auth_manager):
        """Test getting user roles."""
        user_id = uuid4()

        # Mock roles
        mock_role1 = Mock()
        mock_role1.id = uuid4()
        mock_role1.name = "role1"

        mock_role2 = Mock()
        mock_role2.id = uuid4()
        mock_role2.name = "role2"

        mock_auth_manager.backend.get_user_roles.return_value = [mock_role1, mock_role2]

        roles = await rbac_service.get_user_roles(user_id=user_id)

        assert len(roles) == 2
        assert roles[0].name == "role1"
        assert roles[1].name == "role2"

    @pytest.mark.asyncio
    async def test_get_role_permissions(self, rbac_service, mock_auth_manager):
        """Test getting role permissions."""
        role_id = uuid4()

        # Mock permissions
        mock_permission1 = Mock()
        mock_permission1.id = uuid4()
        mock_permission1.name = "permission1"

        mock_permission2 = Mock()
        mock_permission2.id = uuid4()
        mock_permission2.name = "permission2"

        mock_auth_manager.backend.get_role_permissions.return_value = [
            mock_permission1,
            mock_permission2,
        ]

        permissions = await rbac_service.get_role_permissions(role_id=role_id)

        assert len(permissions) == 2
        assert permissions[0].name == "permission1"
        assert permissions[1].name == "permission2"


class TestAdvancedRBACService:
    """Test cases for AdvancedRBACService."""

    @pytest.fixture
    def mock_auth_manager(self):
        """Create mock AuthManager."""
        auth_manager = Mock(spec=AuthManager)
        auth_manager.backend = Mock()
        return auth_manager

    @pytest.fixture
    def advanced_rbac_service(self, mock_auth_manager):
        """Create AdvancedRBACService instance with mocked dependencies."""
        return AdvancedRBACService(auth_manager=mock_auth_manager)

    @pytest.mark.asyncio
    async def test_check_conditional_permission_time_restriction(
        self, advanced_rbac_service, mock_auth_manager
    ):
        """Test conditional permission with time restriction."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        operation = Operation.READ

        # Mock user with role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with time-restricted permission
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "time_restricted_reader"

        mock_permission = Mock()
        mock_permission.resource_type = resource_type
        mock_permission.operation = operation
        mock_permission.scope = PermissionScope.OWN
        mock_permission.conditions = {
            "time_restriction": {"start_time": "09:00", "end_time": "17:00"}
        }

        # Setup mocks
        mock_auth_manager.backend.get_user_by_id.return_value = mock_user
        mock_auth_manager.backend.get_user_roles.return_value = [mock_role]
        mock_auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Mock current time to be within allowed hours
        with patch(
            'gatekeeper.services.advanced_rbac_service.datetime'
        ) as mock_datetime:
            mock_datetime.utcnow.return_value = datetime(
                2024, 1, 1, 12, 0, 0
            )  # 12:00 PM
            mock_datetime.strptime = datetime.strptime

            result = await advanced_rbac_service.check_permission(
                user_id=user_id,
                resource_type=resource_type,
                resource_id=resource_id,
                operation=operation,
            )

            assert result.granted is True
            assert result.conditions_met is True

    @pytest.mark.asyncio
    async def test_check_conditional_permission_time_restriction_failed(
        self, advanced_rbac_service, mock_auth_manager
    ):
        """Test conditional permission with time restriction outside allowed hours."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        operation = Operation.READ

        # Mock user with role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with time-restricted permission
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "time_restricted_reader"

        mock_permission = Mock()
        mock_permission.resource_type = resource_type
        mock_permission.operation = operation
        mock_permission.scope = PermissionScope.OWN
        mock_permission.conditions = {
            "time_restriction": {"start_time": "09:00", "end_time": "17:00"}
        }

        # Setup mocks
        mock_auth_manager.backend.get_user_by_id.return_value = mock_user
        mock_auth_manager.backend.get_user_roles.return_value = [mock_role]
        mock_auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Mock current time to be outside allowed hours
        with patch(
            'gatekeeper.services.advanced_rbac_service.datetime'
        ) as mock_datetime:
            mock_datetime.utcnow.return_value = datetime(
                2024, 1, 1, 20, 0, 0
            )  # 8:00 PM
            mock_datetime.strptime = datetime.strptime

            result = await advanced_rbac_service.check_permission(
                user_id=user_id,
                resource_type=resource_type,
                resource_id=resource_id,
                operation=operation,
            )

            assert result.granted is False
            assert result.conditions_met is False
            assert "time restriction" in result.reason.lower()

    @pytest.mark.asyncio
    async def test_check_conditional_permission_ip_restriction(
        self, advanced_rbac_service, mock_auth_manager
    ):
        """Test conditional permission with IP restriction."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        operation = Operation.READ

        # Mock user with role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with IP-restricted permission
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "ip_restricted_reader"

        mock_permission = Mock()
        mock_permission.resource_type = resource_type
        mock_permission.operation = operation
        mock_permission.scope = PermissionScope.OWN
        mock_permission.conditions = {
            "ip_restriction": {"allowed_ips": ["192.168.1.0/24", "10.0.0.0/8"]}
        }

        # Setup mocks
        mock_auth_manager.backend.get_user_by_id.return_value = mock_user
        mock_auth_manager.backend.get_user_roles.return_value = [mock_role]
        mock_auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Mock request context with allowed IP
        with patch(
            'gatekeeper.services.advanced_rbac_service.get_request_context'
        ) as mock_context:
            mock_context.return_value = {"client_ip": "192.168.1.100"}

            result = await advanced_rbac_service.check_permission(
                user_id=user_id,
                resource_type=resource_type,
                resource_id=resource_id,
                operation=operation,
            )

            assert result.granted is True
            assert result.conditions_met is True

    @pytest.mark.asyncio
    async def test_check_conditional_permission_ip_restriction_failed(
        self, advanced_rbac_service, mock_auth_manager
    ):
        """Test conditional permission with IP restriction from disallowed IP."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        operation = Operation.READ

        # Mock user with role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with IP-restricted permission
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "ip_restricted_reader"

        mock_permission = Mock()
        mock_permission.resource_type = resource_type
        mock_permission.operation = operation
        mock_permission.scope = PermissionScope.OWN
        mock_permission.conditions = {
            "ip_restriction": {"allowed_ips": ["192.168.1.0/24", "10.0.0.0/8"]}
        }

        # Setup mocks
        mock_auth_manager.backend.get_user_by_id.return_value = mock_user
        mock_auth_manager.backend.get_user_roles.return_value = [mock_role]
        mock_auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Mock request context with disallowed IP
        with patch(
            'gatekeeper.services.advanced_rbac_service.get_request_context'
        ) as mock_context:
            mock_context.return_value = {"client_ip": "203.0.113.1"}

            result = await advanced_rbac_service.check_permission(
                user_id=user_id,
                resource_type=resource_type,
                resource_id=resource_id,
                operation=operation,
            )

            assert result.granted is False
            assert result.conditions_met is False
            assert "ip restriction" in result.reason.lower()

    @pytest.mark.asyncio
    async def test_delegate_role(self, advanced_rbac_service, mock_auth_manager):
        """Test role delegation."""
        delegator_id = uuid4()
        delegatee_id = uuid4()
        role_id = uuid4()
        expires_at = datetime.utcnow() + timedelta(hours=8)
        context = {"type": "project", "id": str(uuid4())}

        # Mock successful role delegation
        mock_auth_manager.backend.delegate_role.return_value = True

        result = await advanced_rbac_service.delegate_role(
            delegator_id=delegator_id,
            delegatee_id=delegatee_id,
            role_id=role_id,
            expires_at=expires_at,
            context=context,
        )

        assert result is True
        mock_auth_manager.backend.delegate_role.assert_called_once_with(
            delegator_id=delegator_id,
            delegatee_id=delegatee_id,
            role_id=role_id,
            expires_at=expires_at,
            context=context,
        )

    @pytest.mark.asyncio
    async def test_revoke_delegated_role(
        self, advanced_rbac_service, mock_auth_manager
    ):
        """Test revoking delegated role."""
        delegator_id = uuid4()
        delegatee_id = uuid4()
        role_id = uuid4()

        # Mock successful role revocation
        mock_auth_manager.backend.revoke_delegated_role.return_value = True

        result = await advanced_rbac_service.revoke_delegated_role(
            delegator_id=delegator_id, delegatee_id=delegatee_id, role_id=role_id
        )

        assert result is True
        mock_auth_manager.backend.revoke_delegated_role.assert_called_once_with(
            delegator_id=delegator_id, delegatee_id=delegatee_id, role_id=role_id
        )


class TestAuditService:
    """Test cases for AuditService."""

    @pytest.fixture
    def mock_auth_manager(self):
        """Create mock AuthManager."""
        auth_manager = Mock(spec=AuthManager)
        auth_manager.backend = Mock()
        return auth_manager

    @pytest.fixture
    def audit_service(self, mock_auth_manager):
        """Create MockAuditService instance with mocked dependencies."""
        return MockAuditService(auth_manager=mock_auth_manager)

    @pytest.mark.asyncio
    async def test_log_access_attempt(self, audit_service, mock_auth_manager):
        """Test logging access attempt."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        operation = Operation.READ
        result = PermissionResult(
            granted=True, reason="Access granted", conditions_met=True
        )

        # Mock successful audit log creation
        mock_auth_manager.backend.create_audit_log.return_value = True

        await audit_service.log_access_attempt(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            operation=operation,
            result=result,
        )

        mock_auth_manager.backend.create_audit_log.assert_called_once()

    @pytest.mark.asyncio
    async def test_log_role_assignment(self, audit_service, mock_auth_manager):
        """Test logging role assignment."""
        user_id = uuid4()
        role_id = uuid4()
        assigned_by = uuid4()
        context = {"type": "project", "id": str(uuid4())}

        # Mock successful audit log creation
        mock_auth_manager.backend.create_audit_log.return_value = True

        await audit_service.log_role_assignment(
            user_id=user_id, role_id=role_id, assigned_by=assigned_by, context=context
        )

        mock_auth_manager.backend.create_audit_log.assert_called_once()

    @pytest.mark.asyncio
    async def test_log_permission_grant(self, audit_service, mock_auth_manager):
        """Test logging permission grant."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        permission_level = "read"
        granted_by = uuid4()

        # Mock successful audit log creation
        mock_auth_manager.backend.create_audit_log.return_value = True

        await audit_service.log_permission_grant(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            permission_level=permission_level,
            granted_by=granted_by,
        )

        mock_auth_manager.backend.create_audit_log.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_audit_logs(self, audit_service, mock_auth_manager):
        """Test getting audit logs."""
        user_id = uuid4()
        start_date = datetime.utcnow() - timedelta(days=7)
        end_date = datetime.utcnow()

        # Mock audit logs
        mock_log1 = Mock()
        mock_log1.id = uuid4()
        mock_log1.event_type = "access_attempt"

        mock_log2 = Mock()
        mock_log2.id = uuid4()
        mock_log2.event_type = "role_assignment"

        mock_auth_manager.backend.get_audit_logs.return_value = [mock_log1, mock_log2]

        logs = await audit_service.get_audit_logs(
            user_id=user_id, start_date=start_date, end_date=end_date
        )

        assert len(logs) == 2
        assert logs[0].event_type == "access_attempt"
        assert logs[1].event_type == "role_assignment"

    @pytest.mark.asyncio
    async def test_get_security_events(self, audit_service, mock_auth_manager):
        """Test getting security events."""
        start_date = datetime.utcnow() - timedelta(days=1)
        end_date = datetime.utcnow()

        # Mock security events
        mock_event1 = Mock()
        mock_event1.id = uuid4()
        mock_event1.event_type = "failed_login"

        mock_event2 = Mock()
        mock_event2.id = uuid4()
        mock_event2.event_type = "privilege_escalation_attempt"

        mock_auth_manager.backend.get_security_events.return_value = [
            mock_event1,
            mock_event2,
        ]

        events = await audit_service.get_security_events(
            start_date=start_date, end_date=end_date
        )

        assert len(events) == 2
        assert events[0].event_type == "failed_login"
        assert events[1].event_type == "privilege_escalation_attempt"


class TestSecurityMonitoringService:
    """Test cases for SecurityMonitoringService."""

    @pytest.fixture
    def mock_auth_manager(self):
        """Create mock AuthManager."""
        auth_manager = Mock(spec=AuthManager)
        auth_manager.backend = Mock()
        return auth_manager

    @pytest.fixture
    def security_monitoring_service(self, mock_auth_manager):
        """Create SecurityMonitoringService instance with mocked dependencies."""
        return SecurityMonitoringService(auth_manager=mock_auth_manager)

    @pytest.mark.asyncio
    async def test_detect_anomalies(
        self, security_monitoring_service, mock_auth_manager
    ):
        """Test anomaly detection."""
        user_id = uuid4()

        # Mock anomaly detection
        mock_anomaly = Mock()
        mock_anomaly.type = "unusual_access_pattern"
        mock_anomaly.severity = "medium"
        mock_anomaly.description = "User accessed resources from unusual location"

        mock_auth_manager.backend.detect_anomalies.return_value = [mock_anomaly]

        anomalies = await security_monitoring_service.detect_anomalies(user_id=user_id)

        assert len(anomalies) == 1
        assert anomalies[0].type == "unusual_access_pattern"
        assert anomalies[0].severity == "medium"

    @pytest.mark.asyncio
    async def test_detect_brute_force(
        self, security_monitoring_service, mock_auth_manager
    ):
        """Test brute force detection."""
        user_id = uuid4()

        # Mock brute force detection
        mock_brute_force = Mock()
        mock_brute_force.type = "brute_force_attempt"
        mock_brute_force.severity = "high"
        mock_brute_force.description = "Multiple failed login attempts detected"

        mock_auth_manager.backend.detect_brute_force.return_value = [mock_brute_force]

        brute_force_events = await security_monitoring_service.detect_brute_force(
            user_id=user_id
        )

        assert len(brute_force_events) == 1
        assert brute_force_events[0].type == "brute_force_attempt"
        assert brute_force_events[0].severity == "high"

    @pytest.mark.asyncio
    async def test_detect_privilege_escalation(
        self, security_monitoring_service, mock_auth_manager
    ):
        """Test privilege escalation detection."""
        user_id = uuid4()

        # Mock privilege escalation detection
        mock_escalation = Mock()
        mock_escalation.type = "privilege_escalation_attempt"
        mock_escalation.severity = "critical"
        mock_escalation.description = "User attempted to access admin resources"

        mock_auth_manager.backend.detect_privilege_escalation.return_value = [
            mock_escalation
        ]

        escalation_events = (
            await security_monitoring_service.detect_privilege_escalation(
                user_id=user_id
            )
        )

        assert len(escalation_events) == 1
        assert escalation_events[0].type == "privilege_escalation_attempt"
        assert escalation_events[0].severity == "critical"

    @pytest.mark.asyncio
    async def test_generate_security_report(
        self, security_monitoring_service, mock_auth_manager
    ):
        """Test security report generation."""
        start_date = datetime.utcnow() - timedelta(days=7)
        end_date = datetime.utcnow()

        # Mock security report
        mock_report = Mock()
        mock_report.total_events = 150
        mock_report.critical_events = 5
        mock_report.high_events = 25
        mock_report.medium_events = 50
        mock_report.low_events = 70

        mock_auth_manager.backend.generate_security_report.return_value = mock_report

        report = await security_monitoring_service.generate_security_report(
            start_date=start_date, end_date=end_date
        )

        assert report.total_events == 150
        assert report.critical_events == 5
        assert report.high_events == 25
        assert report.medium_events == 50
        assert report.low_events == 70


class TestServiceIntegration:
    """Integration tests for RBAC services."""

    @pytest.fixture
    def mock_auth_manager(self):
        """Create mock AuthManager."""
        auth_manager = Mock(spec=AuthManager)
        auth_manager.backend = Mock()
        return auth_manager

    @pytest.fixture
    def rbac_service(self, mock_auth_manager):
        """Create MockRBACService instance."""
        return MockRBACService(auth_manager=mock_auth_manager)

    @pytest.fixture
    def audit_service(self, mock_auth_manager):
        """Create MockAuditService instance."""
        return MockAuditService(auth_manager=mock_auth_manager)

    @pytest.mark.asyncio
    async def test_permission_check_with_audit_logging(
        self, rbac_service, audit_service, mock_auth_manager
    ):
        """Test permission check with audit logging integration."""
        user_id = uuid4()
        resource_type = ResourceType.NOTE
        resource_id = str(uuid4())
        operation = Operation.READ

        # Mock user with role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with permission
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "note_reader"

        mock_permission = Mock()
        mock_permission.resource_type = resource_type
        mock_permission.operation = operation
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        mock_auth_manager.backend.get_user_by_id.return_value = mock_user
        mock_auth_manager.backend.get_user_roles.return_value = [mock_role]
        mock_auth_manager.backend.get_role_permissions.return_value = [mock_permission]
        mock_auth_manager.backend.create_audit_log.return_value = True

        # Check permission
        result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            operation=operation,
        )

        # Log access attempt
        await audit_service.log_access_attempt(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            operation=operation,
            result=result,
        )

        assert result.granted is True
        mock_auth_manager.backend.create_audit_log.assert_called_once()

    @pytest.mark.asyncio
    async def test_role_assignment_with_audit_logging(
        self, rbac_service, audit_service, mock_auth_manager
    ):
        """Test role assignment with audit logging integration."""
        user_id = uuid4()
        role_id = uuid4()
        assigned_by = uuid4()
        context = {"type": "project", "id": str(uuid4())}

        # Mock successful role assignment
        mock_auth_manager.backend.assign_role.return_value = True
        mock_auth_manager.backend.create_audit_log.return_value = True

        # Assign role
        result = await rbac_service.assign_role(
            user_id=user_id, role_id=role_id, context=context
        )

        # Log role assignment
        await audit_service.log_role_assignment(
            user_id=user_id, role_id=role_id, assigned_by=assigned_by, context=context
        )

        assert result is True
        mock_auth_manager.backend.assign_role.assert_called_once()
        mock_auth_manager.backend.create_audit_log.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__])
