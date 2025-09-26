"""🧪 RBAC Integration Tests

Comprehensive integration tests for RBAC system including end-to-end permission tests,
cross-service integration tests, and performance tests.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import time
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


class TestRBACEndToEnd:
    """End-to-end tests for RBAC system."""

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
    async def test_complete_user_workflow(self, rbac_system):
        """Test complete user workflow from registration to resource access."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]
        audit_service = rbac_system["audit_service"]

        # Test data
        user_id = uuid4()
        role_id = uuid4()
        resource_id = str(uuid4())

        # Mock user
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role
        mock_role = Mock()
        mock_role.id = role_id
        mock_role.name = "note_reader"

        # Mock permission
        mock_permission = Mock()
        mock_permission.resource_type = ResourceType.NOTE
        mock_permission.operation = Operation.READ
        mock_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.assign_role.return_value = True
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [mock_permission]
        auth_manager.backend.create_audit_log.return_value = True

        # 1. Assign role to user
        role_assigned = await rbac_service.assign_role(
            user_id=user_id,
            role_id=role_id,
            context={"type": "project", "id": str(uuid4())},
        )
        assert role_assigned is True

        # 2. Check permission
        result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=ResourceType.NOTE,
            resource_id=resource_id,
            operation=Operation.READ,
        )
        assert result.granted is True

        # 3. Log access attempt
        await audit_service.log_access_attempt(
            user_id=user_id,
            resource_type=ResourceType.NOTE,
            resource_id=resource_id,
            operation=Operation.READ,
            result=result,
        )

        # Verify all operations were called
        auth_manager.backend.assign_role.assert_called_once()
        auth_manager.backend.get_user_roles.assert_called_once()
        auth_manager.backend.get_role_permissions.assert_called_once()
        auth_manager.backend.create_audit_log.assert_called_once()

    @pytest.mark.asyncio
    async def test_role_hierarchy_workflow(self, rbac_system):
        """Test role hierarchy and inheritance workflow."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

        # Test data
        user_id = uuid4()
        admin_role_id = uuid4()
        manager_role_id = uuid4()
        user_role_id = uuid4()

        # Mock user
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role hierarchy
        mock_admin_role = Mock()
        mock_admin_role.id = admin_role_id
        mock_admin_role.name = "admin"
        mock_admin_role.level = 1

        mock_manager_role = Mock()
        mock_manager_role.id = manager_role_id
        mock_manager_role.name = "manager"
        mock_manager_role.level = 2
        mock_manager_role.parent_role_id = admin_role_id

        mock_user_role = Mock()
        mock_user_role.id = user_role_id
        mock_user_role.name = "user"
        mock_user_role.level = 3
        mock_user_role.parent_role_id = manager_role_id

        # Mock permissions for each role
        mock_admin_permission = Mock()
        mock_admin_permission.resource_type = ResourceType.NOTE
        mock_admin_permission.operation = Operation.DELETE
        mock_admin_permission.scope = PermissionScope.GLOBAL

        mock_manager_permission = Mock()
        mock_manager_permission.resource_type = ResourceType.NOTE
        mock_manager_permission.operation = Operation.UPDATE
        mock_manager_permission.scope = PermissionScope.TEAM

        mock_user_permission = Mock()
        mock_user_permission.resource_type = ResourceType.NOTE
        mock_user_permission.operation = Operation.READ
        mock_user_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [
            mock_admin_role,
            mock_manager_role,
            mock_user_role,
        ]
        auth_manager.backend.get_role_permissions.side_effect = [
            [mock_admin_permission],
            [mock_manager_permission],
            [mock_user_permission],
        ]

        # Test admin permission (should have all permissions)
        admin_result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=ResourceType.NOTE,
            resource_id=str(uuid4()),
            operation=Operation.DELETE,
        )
        assert admin_result.granted is True

        # Test manager permission (should have manager and user permissions)
        manager_result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=ResourceType.NOTE,
            resource_id=str(uuid4()),
            operation=Operation.UPDATE,
        )
        assert manager_result.granted is True

        # Test user permission (should have only user permissions)
        user_result = await rbac_service.check_permission(
            user_id=user_id,
            resource_type=ResourceType.NOTE,
            resource_id=str(uuid4()),
            operation=Operation.READ,
        )
        assert user_result.granted is True

    @pytest.mark.asyncio
    async def test_conditional_permissions_workflow(self, rbac_system):
        """Test conditional permissions workflow."""
        auth_manager = rbac_system["auth_manager"]
        advanced_rbac_service = rbac_system["advanced_rbac_service"]

        # Test data
        user_id = uuid4()
        resource_id = str(uuid4())

        # Mock user
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

        # Test during allowed hours
        with patch(
            'gatekeeper.services.advanced_rbac_service.datetime'
        ) as mock_datetime:
            mock_datetime.utcnow.return_value = datetime(
                2024, 1, 1, 12, 0, 0
            )  # 12:00 PM
            mock_datetime.strptime = datetime.strptime

            result = await advanced_rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=resource_id,
                operation=Operation.READ,
            )

            assert result.granted is True
            assert result.conditions_met is True

        # Test outside allowed hours
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

            assert result.granted is False
            assert result.conditions_met is False

    @pytest.mark.asyncio
    async def test_role_delegation_workflow(self, rbac_system):
        """Test role delegation workflow."""
        auth_manager = rbac_system["auth_manager"]
        advanced_rbac_service = rbac_system["advanced_rbac_service"]
        audit_service = rbac_system["audit_service"]

        # Test data
        delegator_id = uuid4()
        delegatee_id = uuid4()
        role_id = uuid4()
        expires_at = datetime.utcnow() + timedelta(hours=8)
        context = {"type": "project", "id": str(uuid4())}

        # Setup mocks
        auth_manager.backend.delegate_role.return_value = True
        auth_manager.backend.create_audit_log.return_value = True

        # Delegate role
        delegation_result = await advanced_rbac_service.delegate_role(
            delegator_id=delegator_id,
            delegatee_id=delegatee_id,
            role_id=role_id,
            expires_at=expires_at,
            context=context,
        )
        assert delegation_result is True

        # Log delegation
        await audit_service.log_role_assignment(
            user_id=delegatee_id,
            role_id=role_id,
            assigned_by=delegator_id,
            context=context,
        )

        # Verify delegation was logged
        auth_manager.backend.delegate_role.assert_called_once()
        auth_manager.backend.create_audit_log.assert_called_once()

    @pytest.mark.asyncio
    async def test_security_monitoring_workflow(self, rbac_system):
        """Test security monitoring workflow."""
        auth_manager = rbac_system["auth_manager"]
        security_monitoring_service = rbac_system["security_monitoring_service"]
        audit_service = rbac_system["audit_service"]

        # Test data
        user_id = uuid4()
        start_date = datetime.utcnow() - timedelta(days=7)
        end_date = datetime.utcnow()

        # Mock security events
        mock_anomaly = Mock()
        mock_anomaly.type = "unusual_access_pattern"
        mock_anomaly.severity = "medium"
        mock_anomaly.description = "User accessed resources from unusual location"

        mock_brute_force = Mock()
        mock_brute_force.type = "brute_force_attempt"
        mock_brute_force.severity = "high"
        mock_brute_force.description = "Multiple failed login attempts detected"

        mock_escalation = Mock()
        mock_escalation.type = "privilege_escalation_attempt"
        mock_escalation.severity = "critical"
        mock_escalation.description = "User attempted to access admin resources"

        # Mock security report
        mock_report = Mock()
        mock_report.total_events = 150
        mock_report.critical_events = 5
        mock_report.high_events = 25
        mock_report.medium_events = 50
        mock_report.low_events = 70

        # Setup mocks
        auth_manager.backend.detect_anomalies.return_value = [mock_anomaly]
        auth_manager.backend.detect_brute_force.return_value = [mock_brute_force]
        auth_manager.backend.detect_privilege_escalation.return_value = [
            mock_escalation
        ]
        auth_manager.backend.generate_security_report.return_value = mock_report

        # Detect anomalies
        anomalies = await security_monitoring_service.detect_anomalies(user_id=user_id)
        assert len(anomalies) == 1
        assert anomalies[0].type == "unusual_access_pattern"

        # Detect brute force
        brute_force_events = await security_monitoring_service.detect_brute_force(
            user_id=user_id
        )
        assert len(brute_force_events) == 1
        assert brute_force_events[0].type == "brute_force_attempt"

        # Detect privilege escalation
        escalation_events = (
            await security_monitoring_service.detect_privilege_escalation(
                user_id=user_id
            )
        )
        assert len(escalation_events) == 1
        assert escalation_events[0].type == "privilege_escalation_attempt"

        # Generate security report
        report = await security_monitoring_service.generate_security_report(
            start_date=start_date, end_date=end_date
        )
        assert report.total_events == 150
        assert report.critical_events == 5


class TestCrossServiceIntegration:
    """Cross-service integration tests."""

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
    async def test_notes_system_integration(self, rbac_system):
        """Test integration with Notes system."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]
        audit_service = rbac_system["audit_service"]

        # Test data
        user_id = uuid4()
        note_id = str(uuid4())

        # Mock user with note permissions
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with note permissions
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "note_manager"

        # Mock note permissions
        mock_read_permission = Mock()
        mock_read_permission.resource_type = ResourceType.NOTE
        mock_read_permission.operation = Operation.READ
        mock_read_permission.scope = PermissionScope.OWN

        mock_write_permission = Mock()
        mock_write_permission.resource_type = ResourceType.NOTE
        mock_write_permission.operation = Operation.UPDATE
        mock_write_permission.scope = PermissionScope.OWN

        mock_delete_permission = Mock()
        mock_delete_permission.resource_type = ResourceType.NOTE
        mock_delete_permission.operation = Operation.DELETE
        mock_delete_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [
            mock_read_permission,
            mock_write_permission,
            mock_delete_permission,
        ]
        auth_manager.backend.create_audit_log.return_value = True

        # Test note operations
        operations = [
            (Operation.READ, "read note"),
            (Operation.UPDATE, "update note"),
            (Operation.DELETE, "delete note"),
        ]

        for operation, description in operations:
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=note_id,
                operation=operation,
            )

            assert result.granted is True, f"Failed to {description}"

            # Log access attempt
            await audit_service.log_access_attempt(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=note_id,
                operation=operation,
                result=result,
            )

    @pytest.mark.asyncio
    async def test_email_system_integration(self, rbac_system):
        """Test integration with Email system."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]
        audit_service = rbac_system["audit_service"]

        # Test data
        user_id = uuid4()
        email_id = str(uuid4())

        # Mock user with email permissions
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with email permissions
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "email_user"

        # Mock email permissions
        mock_read_permission = Mock()
        mock_read_permission.resource_type = ResourceType.EMAIL
        mock_read_permission.operation = Operation.READ
        mock_read_permission.scope = PermissionScope.OWN

        mock_send_permission = Mock()
        mock_send_permission.resource_type = ResourceType.EMAIL
        mock_send_permission.operation = Operation.CREATE
        mock_send_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [
            mock_read_permission,
            mock_send_permission,
        ]
        auth_manager.backend.create_audit_log.return_value = True

        # Test email operations
        operations = [(Operation.READ, "read email"), (Operation.CREATE, "send email")]

        for operation, description in operations:
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.EMAIL,
                resource_id=email_id,
                operation=operation,
            )

            assert result.granted is True, f"Failed to {description}"

            # Log access attempt
            await audit_service.log_access_attempt(
                user_id=user_id,
                resource_type=ResourceType.EMAIL,
                resource_id=email_id,
                operation=operation,
                result=result,
            )

    @pytest.mark.asyncio
    async def test_rag_system_integration(self, rbac_system):
        """Test integration with RAG system."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]
        audit_service = rbac_system["audit_service"]

        # Test data
        user_id = uuid4()
        document_id = str(uuid4())

        # Mock user with RAG permissions
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with RAG permissions
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "rag_reader"

        # Mock RAG permissions
        mock_read_permission = Mock()
        mock_read_permission.resource_type = ResourceType.RAG_DOCUMENT
        mock_read_permission.operation = Operation.READ
        mock_read_permission.scope = PermissionScope.TEAM

        mock_search_permission = Mock()
        mock_search_permission.resource_type = ResourceType.RAG_DOCUMENT
        mock_search_permission.operation = Operation.EXECUTE
        mock_search_permission.scope = PermissionScope.TEAM

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [
            mock_read_permission,
            mock_search_permission,
        ]
        auth_manager.backend.create_audit_log.return_value = True

        # Test RAG operations
        operations = [
            (Operation.READ, "read document"),
            (Operation.EXECUTE, "search documents"),
        ]

        for operation, description in operations:
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.RAG_DOCUMENT,
                resource_id=document_id,
                operation=operation,
            )

            assert result.granted is True, f"Failed to {description}"

            # Log access attempt
            await audit_service.log_access_attempt(
                user_id=user_id,
                resource_type=ResourceType.RAG_DOCUMENT,
                resource_id=document_id,
                operation=operation,
                result=result,
            )

    @pytest.mark.asyncio
    async def test_ecs_system_integration(self, rbac_system):
        """Test integration with ECS system."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]
        audit_service = rbac_system["audit_service"]

        # Test data
        user_id = uuid4()
        world_id = str(uuid4())

        # Mock user with ECS permissions
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.rbac_enabled = True

        # Mock role with ECS permissions
        mock_role = Mock()
        mock_role.id = uuid4()
        mock_role.name = "ecs_user"

        # Mock ECS permissions
        mock_read_permission = Mock()
        mock_read_permission.resource_type = ResourceType.ECS_WORLD
        mock_read_permission.operation = Operation.READ
        mock_read_permission.scope = PermissionScope.OWN

        mock_manage_permission = Mock()
        mock_manage_permission.resource_type = ResourceType.ECS_WORLD
        mock_manage_permission.operation = Operation.MANAGE
        mock_manage_permission.scope = PermissionScope.OWN

        # Setup mocks
        auth_manager.backend.get_user_by_id.return_value = mock_user
        auth_manager.backend.get_user_roles.return_value = [mock_role]
        auth_manager.backend.get_role_permissions.return_value = [
            mock_read_permission,
            mock_manage_permission,
        ]
        auth_manager.backend.create_audit_log.return_value = True

        # Test ECS operations
        operations = [
            (Operation.READ, "read world"),
            (Operation.MANAGE, "manage world"),
        ]

        for operation, description in operations:
            result = await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.ECS_WORLD,
                resource_id=world_id,
                operation=operation,
            )

            assert result.granted is True, f"Failed to {description}"

            # Log access attempt
            await audit_service.log_access_attempt(
                user_id=user_id,
                resource_type=ResourceType.ECS_WORLD,
                resource_id=world_id,
                operation=operation,
                result=result,
            )


class TestRBACPerformance:
    """Performance tests for RBAC system."""

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
    async def test_permission_check_performance(self, rbac_system):
        """Test permission check performance."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

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

        # Test performance
        num_checks = 1000
        start_time = time.time()

        for _ in range(num_checks):
            await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=resource_id,
                operation=Operation.READ,
            )

        end_time = time.time()
        total_time = end_time - start_time
        avg_time = total_time / num_checks

        # Assert performance requirements
        assert (
            avg_time < 0.01
        ), f"Average permission check time {avg_time:.4f}s exceeds 10ms requirement"
        assert (
            total_time < 10
        ), f"Total time {total_time:.4f}s for {num_checks} checks exceeds 10s requirement"

    @pytest.mark.asyncio
    async def test_concurrent_permission_checks(self, rbac_system):
        """Test concurrent permission checks performance."""
        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

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

        # Test concurrent performance
        num_concurrent = 100
        start_time = time.time()

        tasks = []
        for _ in range(num_concurrent):
            task = rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=resource_id,
                operation=Operation.READ,
            )
            tasks.append(task)

        results = await asyncio.gather(*tasks)

        end_time = time.time()
        total_time = end_time - start_time

        # Assert all checks succeeded
        assert all(result.granted for result in results)

        # Assert performance requirements
        assert (
            total_time < 5
        ), f"Total time {total_time:.4f}s for {num_concurrent} concurrent checks exceeds 5s requirement"

    @pytest.mark.asyncio
    async def test_audit_logging_performance(self, rbac_system):
        """Test audit logging performance."""
        auth_manager = rbac_system["auth_manager"]
        audit_service = rbac_system["audit_service"]

        # Setup mocks
        auth_manager.backend.create_audit_log.return_value = True

        # Test performance
        num_logs = 1000
        start_time = time.time()

        for i in range(num_logs):
            await audit_service.log_access_attempt(
                user_id=uuid4(),
                resource_type=ResourceType.NOTE,
                resource_id=str(uuid4()),
                operation=Operation.READ,
                result=PermissionResult(
                    granted=True, reason="Test", conditions_met=True
                ),
            )

        end_time = time.time()
        total_time = end_time - start_time
        avg_time = total_time / num_logs

        # Assert performance requirements
        assert (
            avg_time < 0.01
        ), f"Average audit log time {avg_time:.4f}s exceeds 10ms requirement"
        assert (
            total_time < 10
        ), f"Total time {total_time:.4f}s for {num_logs} logs exceeds 10s requirement"

    @pytest.mark.asyncio
    async def test_security_monitoring_performance(self, rbac_system):
        """Test security monitoring performance."""
        auth_manager = rbac_system["auth_manager"]
        security_monitoring_service = rbac_system["security_monitoring_service"]

        # Mock security events
        mock_anomaly = Mock()
        mock_anomaly.type = "unusual_access_pattern"
        mock_anomaly.severity = "medium"
        mock_anomaly.description = "Test anomaly"

        # Setup mocks
        auth_manager.backend.detect_anomalies.return_value = [mock_anomaly]

        # Test performance
        num_checks = 100
        start_time = time.time()

        for _ in range(num_checks):
            await security_monitoring_service.detect_anomalies(user_id=uuid4())

        end_time = time.time()
        total_time = end_time - start_time
        avg_time = total_time / num_checks

        # Assert performance requirements
        assert (
            avg_time < 0.1
        ), f"Average security monitoring time {avg_time:.4f}s exceeds 100ms requirement"
        assert (
            total_time < 10
        ), f"Total time {total_time:.4f}s for {num_checks} checks exceeds 10s requirement"

    @pytest.mark.asyncio
    async def test_memory_usage(self, rbac_system):
        """Test memory usage during high load."""
        import os

        import psutil

        auth_manager = rbac_system["auth_manager"]
        rbac_service = rbac_system["rbac_service"]

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

        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB

        # Perform high load operations
        num_operations = 10000
        for _ in range(num_operations):
            await rbac_service.check_permission(
                user_id=user_id,
                resource_type=ResourceType.NOTE,
                resource_id=resource_id,
                operation=Operation.READ,
            )

        # Get final memory usage
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory

        # Assert memory usage requirements
        assert (
            memory_increase < 100
        ), f"Memory increase {memory_increase:.2f}MB exceeds 100MB requirement"


if __name__ == "__main__":
    pytest.main([__file__])
