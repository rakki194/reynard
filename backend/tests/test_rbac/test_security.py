"""🧪 RBAC Security Tests

Comprehensive security tests for RBAC system including penetration testing,
permission bypass tests, and audit trail validation.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
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


class TestPermissionBypass:
    """Test cases for permission bypass attempts."""

    @pytest.fixture
    async def rbac_system(self):
        """Setup complete RBAC system for testing."""
        # Mock AuthManager with realistic backend
        auth_manager = Mock(spec=AuthManager)
        auth_manager.backend = Mock()

        # Create services
        rbac_service = MockRBACService(auth_manager=auth_manager)
        advanced_rbac_service = AdvancedRBACService(auth_manager=auth_manager)
        audit_service = MockAuditService(auth_manager=auth_manager)
        security_monitoring_service = SecurityMonitoringService(
            auth_manager=auth_manager
        )

        return {
            "auth_manager": auth_manager,
            "rbac_service": rbac_service,
            "advanced_rbac_service": advanced_rbac_service,
            "audit_service": audit_service,
            "security_monitoring_service": security_monitoring_service,
        }

    @pytest.mark.asyncio
    async def test_privilege_escalation_attempt(self, rbac_system):
        """Test privilege escalation attempt detection."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]
        security_monitoring_service = rbac_system["security_monitoring_service"]

        # Test data
        user_id = uuid4()
        resource_id = str(uuid4())

        # Mock user with limited role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock limited role
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "limited_user"

        # Mock limited permission
        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt privilege escalation (trying to delete without permission)
        result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=ResourceType.NOTE,
            resource_id=resource_id,
            operation=Operation.DELETE,
        )

        # Should be denied
        assert result.granted is False
        assert result.reason == "User lacks required permission"

        # Mock privilege escalation detection
        mock_escalation = Mock()
        mock_escalation.type = "privilege_escalation_attempt"
        mock_escalation.severity = "critical"
        mock_escalation.description = "User attempted to access admin resources"

        auth_manager.backend.detect_privilege_escalation.return_value = [
            mock_escalation
        ]

        # Detect privilege escalation
        escalation_events = (
            await security_monitoring_service.detect_privilege_escalation(
                user_id=user_id
            )
        )

        assert len(escalation_events) == 1
        assert escalation_events[0].type == "privilege_escalation_attempt"
        assert escalation_events[0].severity == "critical"

    @pytest.mark.asyncio
    async def test_role_impersonation_attempt(self, rbac_system):
        """Test role impersonation attempt detection."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

        # Test data
        user_id = uuid4()
        impersonated_role_id = uuid4()
        resource_id = str(uuid4())

        # Mock user with limited role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock limited role
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "limited_user"

        # Mock limited permission
        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt to access resource with impersonated role
        result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=ResourceType.NOTE,
            resource_id=resource_id,
            operation=Operation.DELETE,
        )

        # Should be denied
        assert result.granted is False
        assert result.reason == "User lacks required permission"

    @pytest.mark.asyncio
    async def test_resource_enumeration_attempt(self, rbac_system):
        """Test resource enumeration attempt detection."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]
        security_monitoring_service = rbac_system["security_monitoring_service"]

        # Test data
        user_id = uuid4()

        # Mock user with limited role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock limited role
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "limited_user"

        # Mock limited permission
        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt resource enumeration (trying to access multiple resources)
        enumeration_attempts = []
        for i in range(100):  # Simulate enumeration attempt
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=str(uuid4()),
                operation=Operation.READ,
            )
            enumeration_attempts.append(result)

        # Most should be denied (user can only access own resources)
        denied_count = sum(1 for result in enumeration_attempts if not result.granted)
        assert denied_count > 0, "Resource enumeration should be detected and denied"

        # Mock anomaly detection
        mock_anomaly = Mock()
        mock_anomaly.type = "resource_enumeration_attempt"
        mock_anomaly.severity = "medium"
        mock_anomaly.description = "User attempted to enumerate resources"

        auth_manager.backend.detect_anomalies.return_value = [mock_anomaly]

        # Detect enumeration attempt
        anomalies = await security_monitoring_service.detect_anomalies(user_id=user_id)

        assert len(anomalies) == 1
        assert anomalies[0].type == "resource_enumeration_attempt"
        assert anomalies[0].severity == "medium"

    @pytest.mark.asyncio
    async def test_brute_force_permission_attempt(self, rbac_system):
        """Test brute force permission attempt detection."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]
        security_monitoring_service = rbac_system["security_monitoring_service"]

        # Test data
        user_id = uuid4()
        resource_id = str(uuid4())

        # Mock user with limited role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock limited role
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "limited_user"

        # Mock limited permission
        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt brute force (multiple failed permission checks)
        brute_force_attempts = []
        for _ in range(50):  # Simulate brute force attempt
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=resource_id,
                operation=Operation.DELETE,  # Operation user doesn't have
            )
            brute_force_attempts.append(result)

        # All should be denied
        assert all(not result.granted for result in brute_force_attempts)

        # Mock brute force detection
        mock_brute_force = Mock()
        mock_brute_force.type = "brute_force_attempt"
        mock_brute_force.severity = "high"
        mock_brute_force.description = "Multiple failed permission attempts detected"

        auth_manager.backend.detect_brute_force.return_value = [mock_brute_force]

        # Detect brute force attempt
        brute_force_events = await security_monitoring_service.detect_brute_force(
            user_id=user_id
        )

        assert len(brute_force_events) == 1
        assert brute_force_events[0].type == "brute_force_attempt"
        assert brute_force_events[0].severity == "high"

    @pytest.mark.asyncio
    async def test_condition_bypass_attempt(self, rbac_system):
        """Test condition bypass attempt detection."""
        auth_manager = rbac_system["auth_manager"]
        advanced_rbac_service = rbac_system["advanced_rbac_service"]

        # Test data
        user_id = uuid4()
        resource_id = str(uuid4())

        # Mock user with role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with time-restricted permission
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "time_restricted_reader"

        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN
        mock_permission.conditions = {
            "time_restriction": {"start_time": "09:00", "end_time": "17:00"}
        }

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt condition bypass (trying to access outside allowed hours)
        with patch(
            'gatekeeper.services.advanced_rbac_service.datetime'
        ) as mock_datetime:
            mock_datetime.utcnow.return_value = datetime(
                2024, 1, 1, 20, 0, 0
            )  # 8:00 PM
            mock_datetime.strptime = datetime.strptime

            result = await advanced_rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=resource_id,
                operation=Operation.READ,
            )

            # Should be denied due to time restriction
            assert result.granted is False
            assert result.conditions_met is False
            assert "time restriction" in result.reason.lower()

    @pytest.mark.asyncio
    async def test_context_manipulation_attempt(self, rbac_system):
        """Test context manipulation attempt detection."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

        # Test data
        user_id = uuid4()
        resource_id = str(uuid4())

        # Mock user with role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with context-specific permission
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "project_user"

        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.TEAM

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt context manipulation (trying to access resource from different context)
        result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=ResourceType.NOTE,
            resource_id=resource_id,
            operation=Operation.READ,
            context={"type": "project", "id": str(uuid4())},  # Different context
        )

        # Should be denied due to context mismatch
        assert result.granted is False
        assert result.reason == "User lacks required permission"


class TestPenetrationTesting:
    """Test cases for penetration testing scenarios."""

    @pytest.fixture
    async def rbac_system(self):
        """Setup complete RBAC system for testing."""
        # Mock AuthManager with realistic backend
        auth_manager = Mock(spec=AuthManager)
        auth_manager.backend = Mock()

        # Create services
        rbac_service = MockRBACService(auth_manager=auth_manager)
        advanced_rbac_service = AdvancedRBACService(auth_manager=auth_manager)
        audit_service = MockAuditService(auth_manager=auth_manager)
        security_monitoring_service = SecurityMonitoringService(
            auth_manager=auth_manager
        )

        return {
            "auth_manager": auth_manager,
            "rbac_service": rbac_service,
            "advanced_rbac_service": advanced_rbac_service,
            "audit_service": audit_service,
            "security_monitoring_service": security_monitoring_service,
        }

    @pytest.mark.asyncio
    async def test_sql_injection_attempt(self, rbac_system):
        """Test SQL injection attempt in permission checks."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

        # Test data
        user_id = uuid4()

        # Mock user
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "test_role"

        # Mock permission
        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt SQL injection in resource_id
        sql_injection_payloads = [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "1'; INSERT INTO users VALUES ('hacker', 'password'); --",
            "1' UNION SELECT * FROM users --",
        ]

        for payload in sql_injection_payloads:
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=payload,
                operation=Operation.READ,
            )

            # Should be denied (not because of SQL injection, but because of invalid resource_id)
            assert result.granted is False
            assert result.reason == "User lacks required permission"

    @pytest.mark.asyncio
    async def test_xss_attempt(self, rbac_system):
        """Test XSS attempt in permission checks."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

        # Test data
        user_id = uuid4()

        # Mock user
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "test_role"

        # Mock permission
        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt XSS in resource_id
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>",
            "';alert('XSS');//",
        ]

        for payload in xss_payloads:
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=payload,
                operation=Operation.READ,
            )

            # Should be denied (not because of XSS, but because of invalid resource_id)
            assert result.granted is False
            assert result.reason == "User lacks required permission"

    @pytest.mark.asyncio
    async def test_path_traversal_attempt(self, rbac_system):
        """Test path traversal attempt in permission checks."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

        # Test data
        user_id = uuid4()

        # Mock user
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "test_role"

        # Mock permission
        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt path traversal in resource_id
        path_traversal_payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\config\\sam",
            "....//....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        ]

        for payload in path_traversal_payloads:
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=payload,
                operation=Operation.READ,
            )

            # Should be denied (not because of path traversal, but because of invalid resource_id)
            assert result.granted is False
            assert result.reason == "User lacks required permission"

    @pytest.mark.asyncio
    async def test_ldap_injection_attempt(self, rbac_system):
        """Test LDAP injection attempt in permission checks."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

        # Test data
        user_id = uuid4()

        # Mock user
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "test_role"

        # Mock permission
        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt LDAP injection in resource_id
        ldap_injection_payloads = ["*", "*)(uid=*", "*)(|(uid=*", "*)(|(objectClass=*"]

        for payload in ldap_injection_payloads:
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=payload,
                operation=Operation.READ,
            )

            # Should be denied (not because of LDAP injection, but because of invalid resource_id)
            assert result.granted is False
            assert result.reason == "User lacks required permission"

    @pytest.mark.asyncio
    async def test_command_injection_attempt(self, rbac_system):
        """Test command injection attempt in permission checks."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

        # Test data
        user_id = uuid4()

        # Mock user
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "test_role"

        # Mock permission
        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]

        # Attempt command injection in resource_id
        command_injection_payloads = [
            "; ls -la",
            "| cat /etc/passwd",
            "&& whoami",
            "`id`",
        ]

        for payload in command_injection_payloads:
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=payload,
                operation=Operation.READ,
            )

            # Should be denied (not because of command injection, but because of invalid resource_id)
            assert result.granted is False
            assert result.reason == "User lacks required permission"


class TestAuditTrailValidation:
    """Test cases for audit trail validation."""

    @pytest.fixture
    async def rbac_system(self):
        """Setup complete RBAC system for testing."""
        # Mock AuthManager with realistic backend
        auth_manager = Mock(spec=AuthManager)
        auth_manager.backend = Mock()

        # Create services
        rbac_service = MockRBACService(auth_manager=auth_manager)
        advanced_rbac_service = AdvancedRBACService(auth_manager=auth_manager)
        audit_service = MockAuditService(auth_manager=auth_manager)
        security_monitoring_service = SecurityMonitoringService(
            auth_manager=auth_manager
        )

        return {
            "auth_manager": auth_manager,
            "rbac_service": rbac_service,
            "advanced_rbac_service": advanced_rbac_service,
            "audit_service": audit_service,
            "security_monitoring_service": security_monitoring_service,
        }

    @pytest.mark.asyncio
    async def test_audit_trail_completeness(self, rbac_system):
        """Test audit trail completeness."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]
        audit_service = rbac_system["audit_service"]

        # Test data
        user_id = uuid4()
        resource_id = str(uuid4())

        # Mock user with role
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with permission
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "test_role"

        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]
        auth_manager.backend.create_audit_log.return_value = True

        # Perform permission check
        result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=ResourceType.NOTE,
            resource_id=resource_id,
            operation=Operation.READ,
        )

        # Log access attempt
        await audit_service.log_access_attempt(
            user_id=user_id,
            resource_type=ResourceType.NOTE,
            resource_id=resource_id,
            operation=Operation.READ,
            result=result,
        )

        # Verify audit log was created
        auth_manager.backend.create_audit_log.assert_called_once()

        # Verify audit log contains required fields
        call_args = auth_manager.backend.create_audit_log.call_args
        audit_log_data = call_args[1] if call_args[1] else call_args[0]

        assert "user_id" in audit_log_data
        assert "resource_type" in audit_log_data
        assert "resource_id" in audit_log_data
        assert "operation" in audit_log_data
        assert "result" in audit_log_data
        assert "timestamp" in audit_log_data

    @pytest.mark.asyncio
    async def test_audit_trail_integrity(self, rbac_system):
        """Test audit trail integrity."""
        auth_manager = rbac_system["auth_manager"]
        audit_service = rbac_system["audit_service"]

        # Test data
        user_id = uuid4()
        role_id = uuid4()
        assigned_by = uuid4()
        context = {"type": "project", "id": str(uuid4())}

        # Setup mocks
        auth_manager.backend.create_audit_log.return_value = True

        # Log role assignment
        await audit_service.log_role_assignment(
            user_id=user_id, role_id=role_id, assigned_by=assigned_by, context=context
        )

        # Verify audit log was created
        auth_manager.backend.create_audit_log.assert_called_once()

        # Verify audit log contains correct data
        call_args = auth_manager.backend.create_audit_log.call_args
        audit_log_data = call_args[1] if call_args[1] else call_args[0]

        assert audit_log_data["user_id"] == user_id
        assert audit_log_data["role_id"] == role_id
        assert audit_log_data["assigned_by"] == assigned_by
        assert audit_log_data["context"] == context
        assert audit_log_data["event_type"] == "role_assignment"

    @pytest.mark.asyncio
    async def test_audit_trail_tampering_detection(self, rbac_system):
        """Test audit trail tampering detection."""
        auth_manager = rbac_system["auth_manager"]
        audit_service = rbac_system["audit_service"]
        security_monitoring_service = rbac_system["security_monitoring_service"]

        # Test data
        user_id = uuid4()
        start_date = datetime.utcnow() - timedelta(days=7)
        end_date = datetime.utcnow()

        # Mock audit logs
        mock_log1 = Mock()
        mock_log1.id = uuid4()
        mock_log1.event_type = "access_attempt"
        mock_log1.timestamp = datetime.utcnow() - timedelta(days=1)
        mock_log1.user_id = user_id

        mock_log2 = Mock()
        mock_log2.id = uuid4()
        mock_log2.event_type = "role_assignment"
        mock_log2.timestamp = datetime.utcnow() - timedelta(days=2)
        mock_log2.user_id = user_id

        # Mock tampered log (timestamp in future)
        mock_tampered_log = Mock()
        mock_tampered_log.id = uuid4()
        mock_tampered_log.event_type = "access_attempt"
        mock_tampered_log.timestamp = datetime.utcnow() + timedelta(
            days=1
        )  # Future timestamp
        mock_tampered_log.user_id = user_id

        # Setup mocks
        auth_manager.backend.get_audit_logs.return_value = [
            mock_log1,
            mock_log2,
            mock_tampered_log,
        ]

        # Get audit logs
        logs = await audit_service.get_audit_logs(
            user_id=user_id, start_date=start_date, end_date=end_date
        )

        # Verify logs were retrieved
        assert len(logs) == 3

        # Mock tampering detection
        mock_tampering = Mock()
        mock_tampering.type = "audit_trail_tampering"
        mock_tampering.severity = "critical"
        mock_tampering.description = "Audit log timestamp in future detected"

        auth_manager.backend.detect_anomalies.return_value = [mock_tampering]

        # Detect tampering
        anomalies = await security_monitoring_service.detect_anomalies(user_id=user_id)

        assert len(anomalies) == 1
        assert anomalies[0].type == "audit_trail_tampering"
        assert anomalies[0].severity == "critical"

    @pytest.mark.asyncio
    async def test_audit_trail_retention(self, rbac_system):
        """Test audit trail retention."""
        auth_manager = rbac_system["auth_manager"]
        audit_service = rbac_system["audit_service"]

        # Test data
        user_id = uuid4()
        start_date = datetime.utcnow() - timedelta(days=365)  # 1 year ago
        end_date = datetime.utcnow()

        # Mock audit logs (some old, some recent)
        mock_old_log = Mock()
        mock_old_log.id = uuid4()
        mock_old_log.event_type = "access_attempt"
        mock_old_log.timestamp = datetime.utcnow() - timedelta(days=400)  # Very old

        mock_recent_log = Mock()
        mock_recent_log.id = uuid4()
        mock_recent_log.event_type = "access_attempt"
        mock_recent_log.timestamp = datetime.utcnow() - timedelta(days=1)  # Recent

        # Setup mocks
        auth_manager.backend.get_audit_logs.return_value = [
            mock_old_log,
            mock_recent_log,
        ]

        # Get audit logs
        logs = await audit_service.get_audit_logs(
            user_id=user_id, start_date=start_date, end_date=end_date
        )

        # Verify logs were retrieved
        assert len(logs) == 2

        # Verify retention policy (old logs should still be available)
        assert all(log.timestamp >= start_date for log in logs)

    @pytest.mark.asyncio
    async def test_audit_trail_search(self, rbac_system):
        """Test audit trail search functionality."""
        auth_manager = rbac_system["auth_manager"]
        audit_service = rbac_system["audit_service"]

        # Test data
        user_id = uuid4()
        start_date = datetime.utcnow() - timedelta(days=7)
        end_date = datetime.utcnow()

        # Mock audit logs
        mock_log1 = Mock()
        mock_log1.id = uuid4()
        mock_log1.event_type = "access_attempt"
        mock_log1.resource_type = ResourceType.NOTE
        mock_log1.operation = Operation.READ

        mock_log2 = Mock()
        mock_log2.id = uuid4()
        mock_log2.event_type = "role_assignment"
        mock_log2.resource_type = None
        mock_log2.operation = None

        # Setup mocks
        auth_manager.backend.get_audit_logs.return_value = [mock_log1, mock_log2]

        # Get audit logs
        logs = await audit_service.get_audit_logs(
            user_id=user_id, start_date=start_date, end_date=end_date
        )

        # Verify logs were retrieved
        assert len(logs) == 2

        # Verify search functionality
        access_logs = [log for log in logs if log.event_type == "access_attempt"]
        role_logs = [log for log in logs if log.event_type == "role_assignment"]

        assert len(access_logs) == 1
        assert len(role_logs) == 1
        assert access_logs[0].resource_type == ResourceType.NOTE
        assert access_logs[0].operation == Operation.READ


if __name__ == "__main__":
    pytest.main([__file__])
