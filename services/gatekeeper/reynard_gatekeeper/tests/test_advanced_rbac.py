"""Tests for Advanced RBAC Service.

This module contains comprehensive tests for the advanced RBAC features including:
- Conditional permissions (time-based, IP-based, device-based)
- Dynamic role assignment
- Role delegation
- Permission inheritance
- Permission overrides

Author: Reynard Development Team
Version: 1.0.0
"""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from gatekeeper.core.auth_manager import AuthManager
from gatekeeper.models.rbac import (
    ConditionalPermission,
    DeviceCondition,
    IPCondition,
    Permission,
    PermissionOverride,
    PermissionResult,
    Role,
    RoleAssignmentRule,
    RoleDelegation,
    RoleHierarchy,
    TimeCondition,
)
from gatekeeper.services.advanced_rbac_service import AdvancedRBACService


class TestConditionalPermissions:
    """Test conditional permissions functionality."""

    @pytest.fixture
    def advanced_rbac_service(self):
        """Create an AdvancedRBACService instance for testing."""
        auth_manager = AsyncMock(spec=AuthManager)
        return AdvancedRBACService(auth_manager)

    @pytest.fixture
    def time_condition(self):
        """Create a time condition for testing."""
        return TimeCondition(
            start_time=datetime(2024, 1, 1, 9, 0, 0, tzinfo=timezone.utc),
            end_time=datetime(2024, 1, 1, 17, 0, 0, tzinfo=timezone.utc),
            days_of_week=[0, 1, 2, 3, 4],  # Monday to Friday
            hours_of_day=list(range(9, 17)),  # 9 AM to 5 PM
        )

    @pytest.fixture
    def ip_condition(self):
        """Create an IP condition for testing."""
        return IPCondition(
            allowed_ips=["192.168.1.100", "10.0.0.50"],
            blocked_ips=["192.168.1.200"],
            allowed_cidrs=["192.168.1.0/24", "10.0.0.0/8"],
            blocked_cidrs=["192.168.2.0/24"],
        )

    @pytest.fixture
    def device_condition(self):
        """Create a device condition for testing."""
        return DeviceCondition(
            allowed_device_types=["desktop", "laptop"],
            allowed_user_agents=["Chrome", "Firefox"],
            blocked_user_agents=["Bot", "Crawler"],
            require_device_verification=False,
        )

    @pytest.mark.asyncio
    async def test_create_conditional_permission(
        self, advanced_rbac_service, time_condition, ip_condition, device_condition
    ):
        """Test creating a conditional permission."""
        # Mock backend response
        advanced_rbac_service.auth_manager.backend.create_conditional_permission = (
            AsyncMock(return_value={"id": "cond_perm_1", "permission_id": "perm_1"})
        )

        # Mock audit service
        with patch(
            'gatekeeper.services.advanced_rbac_service.audit_service'
        ) as mock_audit:
            result = await advanced_rbac_service.create_conditional_permission(
                permission_id="perm_1",
                time_conditions=time_condition,
                ip_conditions=ip_condition,
                device_conditions=device_condition,
            )

            assert isinstance(result, ConditionalPermission)
            assert result.permission_id == "perm_1"
            assert result.time_conditions == time_condition
            assert result.ip_conditions == ip_condition
            assert result.device_conditions == device_condition

            # Verify audit logging
            mock_audit.log_rbac_operation.assert_called_once()

    def test_check_time_conditions_valid(self, advanced_rbac_service, time_condition):
        """Test time condition checking with valid time."""
        # Mock current time to be within allowed range
        with patch(
            'gatekeeper.services.advanced_rbac_service.datetime'
        ) as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc
            )
            mock_datetime.fromisoformat = datetime.fromisoformat

            result = advanced_rbac_service._check_time_conditions(
                time_condition.model_dump()
            )
            assert result is True

    def test_check_time_conditions_invalid_hour(
        self, advanced_rbac_service, time_condition
    ):
        """Test time condition checking with invalid hour."""
        # Mock current time to be outside allowed hours
        with patch(
            'gatekeeper.services.advanced_rbac_service.datetime'
        ) as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2024, 1, 1, 20, 0, 0, tzinfo=timezone.utc
            )
            mock_datetime.fromisoformat = datetime.fromisoformat

            result = advanced_rbac_service._check_time_conditions(
                time_condition.model_dump()
            )
            assert result is False

    def test_check_time_conditions_invalid_day(
        self, advanced_rbac_service, time_condition
    ):
        """Test time condition checking with invalid day."""
        # Mock current time to be on weekend
        with patch(
            'gatekeeper.services.advanced_rbac_service.datetime'
        ) as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2024, 1, 6, 12, 0, 0, tzinfo=timezone.utc
            )  # Saturday
            mock_datetime.fromisoformat = datetime.fromisoformat

            result = advanced_rbac_service._check_time_conditions(
                time_condition.model_dump()
            )
            assert result is False

    def test_check_ip_conditions_allowed_ip(self, advanced_rbac_service, ip_condition):
        """Test IP condition checking with allowed IP."""
        result = advanced_rbac_service._check_ip_conditions(
            ip_condition.model_dump(), "192.168.1.100"
        )
        assert result is True

    def test_check_ip_conditions_blocked_ip(self, advanced_rbac_service, ip_condition):
        """Test IP condition checking with blocked IP."""
        result = advanced_rbac_service._check_ip_conditions(
            ip_condition.model_dump(), "192.168.1.200"
        )
        assert result is False

    def test_check_ip_conditions_allowed_cidr(
        self, advanced_rbac_service, ip_condition
    ):
        """Test IP condition checking with allowed CIDR."""
        result = advanced_rbac_service._check_ip_conditions(
            ip_condition.model_dump(), "192.168.1.50"
        )
        assert result is True

    def test_check_ip_conditions_blocked_cidr(
        self, advanced_rbac_service, ip_condition
    ):
        """Test IP condition checking with blocked CIDR."""
        result = advanced_rbac_service._check_ip_conditions(
            ip_condition.model_dump(), "192.168.2.50"
        )
        assert result is False

    def test_check_device_conditions_allowed_type(
        self, advanced_rbac_service, device_condition
    ):
        """Test device condition checking with allowed device type."""
        result = advanced_rbac_service._check_device_conditions(
            device_condition.model_dump(),
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "desktop",
        )
        assert result is True

    def test_check_device_conditions_blocked_user_agent(
        self, advanced_rbac_service, device_condition
    ):
        """Test device condition checking with blocked user agent."""
        result = advanced_rbac_service._check_device_conditions(
            device_condition.model_dump(), "Bot/1.0", "desktop"
        )
        assert result is False

    @pytest.mark.asyncio
    async def test_check_conditional_permission_success(self, advanced_rbac_service):
        """Test successful conditional permission check."""
        # Mock basic permission check
        advanced_rbac_service.auth_manager.check_permission = AsyncMock(
            return_value=PermissionResult(
                granted=True, reason="Basic permission granted"
            )
        )

        # Mock user and roles
        mock_user = MagicMock()
        mock_user.id = "user_1"
        advanced_rbac_service.auth_manager.get_user_by_username = AsyncMock(
            return_value=mock_user
        )
        advanced_rbac_service.auth_manager.get_user_roles = AsyncMock(
            return_value=[{"role_id": "role_1", "role_name": "test_role"}]
        )

        # Mock conditional permissions
        advanced_rbac_service.auth_manager.backend.get_conditional_permissions_for_role = AsyncMock(
            return_value=[]
        )

        result = await advanced_rbac_service.check_conditional_permission(
            username="test_user",
            resource_type="note",
            resource_id="note_1",
            operation="read",
            client_ip="192.168.1.100",
            user_agent="Chrome",
            device_type="desktop",
        )

        assert result.granted is True
        assert result.conditions_met is True


class TestDynamicRoleAssignment:
    """Test dynamic role assignment functionality."""

    @pytest.fixture
    def advanced_rbac_service(self):
        """Create an AdvancedRBACService instance for testing."""
        auth_manager = AsyncMock(spec=AuthManager)
        return AdvancedRBACService(auth_manager)

    @pytest.mark.asyncio
    async def test_create_role_assignment_rule(self, advanced_rbac_service):
        """Test creating a role assignment rule."""
        # Mock backend response
        advanced_rbac_service.auth_manager.backend.create_role_assignment_rule = (
            AsyncMock(return_value={"id": "rule_1", "name": "test_rule"})
        )

        # Mock audit service
        with patch(
            'gatekeeper.services.advanced_rbac_service.audit_service'
        ) as mock_audit:
            result = await advanced_rbac_service.create_role_assignment_rule(
                name="test_rule",
                trigger_type="user_created",
                target_role_id="role_1",
                conditions={"user_created_after": "2024-01-01T00:00:00Z"},
            )

            assert isinstance(result, RoleAssignmentRule)
            assert result.name == "test_rule"
            assert result.trigger_type == "user_created"
            assert result.target_role_id == "role_1"

            # Verify audit logging
            mock_audit.log_rbac_operation.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_role_assignment_rules(self, advanced_rbac_service):
        """Test processing role assignment rules."""
        # Mock backend response
        advanced_rbac_service.auth_manager.backend.get_role_assignment_rules_by_trigger = AsyncMock(
            return_value=[
                {
                    "id": "rule_1",
                    "is_active": True,
                    "target_role_id": "role_1",
                    "conditions": {"user_created_after": "2024-01-01T00:00:00Z"},
                }
            ]
        )

        # Mock user data
        mock_user = MagicMock()
        mock_user.created_at = datetime(2024, 1, 15, tzinfo=timezone.utc)
        advanced_rbac_service.auth_manager.get_user_by_username = AsyncMock(
            return_value=mock_user
        )
        advanced_rbac_service.auth_manager.get_user_roles = AsyncMock(return_value=[])

        # Mock role assignment
        advanced_rbac_service.auth_manager.assign_role_to_user = AsyncMock(
            return_value=True
        )

        # Mock audit service
        with patch(
            'gatekeeper.services.advanced_rbac_service.audit_service'
        ) as mock_audit:
            result = await advanced_rbac_service.process_role_assignment_rules(
                username="test_user", trigger_type="user_created"
            )

            assert "role_1" in result
            assert len(result) == 1

            # Verify audit logging
            mock_audit.log_rbac_operation.assert_called_once()

    @pytest.mark.asyncio
    async def test_evaluate_rule_conditions_user_created_after(
        self, advanced_rbac_service
    ):
        """Test evaluating rule conditions for user created after date."""
        # Mock user data
        mock_user = MagicMock()
        mock_user.created_at = datetime(2024, 1, 15, tzinfo=timezone.utc)
        advanced_rbac_service.auth_manager.get_user_by_username = AsyncMock(
            return_value=mock_user
        )

        conditions = {"user_created_after": "2024-01-01T00:00:00Z"}
        result = await advanced_rbac_service._evaluate_rule_conditions(
            "test_user", conditions
        )
        assert result is True

        conditions = {"user_created_after": "2024-01-20T00:00:00Z"}
        result = await advanced_rbac_service._evaluate_rule_conditions(
            "test_user", conditions
        )
        assert result is False


class TestRoleDelegation:
    """Test role delegation functionality."""

    @pytest.fixture
    def advanced_rbac_service(self):
        """Create an AdvancedRBACService instance for testing."""
        auth_manager = AsyncMock(spec=AuthManager)
        return AdvancedRBACService(auth_manager)

    @pytest.mark.asyncio
    async def test_delegate_role_success(self, advanced_rbac_service):
        """Test successful role delegation."""
        # Mock users
        mock_delegator = MagicMock()
        mock_delegator.id = "delegator_1"
        mock_delegator.username = "delegator"

        mock_delegatee = MagicMock()
        mock_delegatee.id = "delegatee_1"
        mock_delegatee.username = "delegatee"

        advanced_rbac_service.auth_manager.get_user_by_username = AsyncMock(
            side_effect=[mock_delegator, mock_delegatee]
        )

        # Mock role
        mock_role = MagicMock()
        mock_role.id = "role_1"
        mock_role.name = "test_role"
        advanced_rbac_service.auth_manager.get_role_by_name = AsyncMock(
            return_value=mock_role
        )

        # Mock user roles
        advanced_rbac_service.auth_manager.get_user_roles = AsyncMock(
            return_value=[{"role_id": "role_1", "role_name": "test_role"}]
        )

        # Mock backend operations
        advanced_rbac_service.auth_manager.backend.create_role_delegation = AsyncMock(
            return_value={"id": "delegation_1"}
        )
        advanced_rbac_service.auth_manager.assign_role_to_user = AsyncMock(
            return_value=True
        )

        # Mock audit service
        with patch(
            'gatekeeper.services.advanced_rbac_service.audit_service'
        ) as mock_audit:
            result = await advanced_rbac_service.delegate_role(
                delegator_username="delegator",
                delegatee_username="delegatee",
                role_name="test_role",
                expires_at=datetime.now(timezone.utc) + timedelta(days=7),
            )

            assert result is True

            # Verify audit logging
            mock_audit.log_rbac_operation.assert_called_once()

    @pytest.mark.asyncio
    async def test_delegate_role_delegator_doesnt_have_role(
        self, advanced_rbac_service
    ):
        """Test role delegation when delegator doesn't have the role."""
        # Mock users
        mock_delegator = MagicMock()
        mock_delegator.id = "delegator_1"
        mock_delegator.username = "delegator"

        mock_delegatee = MagicMock()
        mock_delegatee.id = "delegatee_1"
        mock_delegatee.username = "delegatee"

        advanced_rbac_service.auth_manager.get_user_by_username = AsyncMock(
            side_effect=[mock_delegator, mock_delegatee]
        )

        # Mock role
        mock_role = MagicMock()
        mock_role.id = "role_1"
        mock_role.name = "test_role"
        advanced_rbac_service.auth_manager.get_role_by_name = AsyncMock(
            return_value=mock_role
        )

        # Mock user roles - delegator doesn't have the role
        advanced_rbac_service.auth_manager.get_user_roles = AsyncMock(return_value=[])

        result = await advanced_rbac_service.delegate_role(
            delegator_username="delegator",
            delegatee_username="delegatee",
            role_name="test_role",
        )

        assert result is False

    @pytest.mark.asyncio
    async def test_revoke_delegation_success(self, advanced_rbac_service):
        """Test successful delegation revocation."""
        # Mock delegation
        mock_delegation = {
            "id": "delegation_1",
            "delegatee_user_id": "delegatee_1",
            "role_id": "role_1",
        }
        advanced_rbac_service.auth_manager.backend.get_role_delegation_by_id = (
            AsyncMock(return_value=mock_delegation)
        )

        # Mock user and role
        mock_user = MagicMock()
        mock_user.username = "delegatee"
        advanced_rbac_service.auth_manager.get_user_by_id = AsyncMock(
            return_value=mock_user
        )

        mock_role = MagicMock()
        mock_role.name = "test_role"
        advanced_rbac_service.auth_manager.get_role_by_id = AsyncMock(
            return_value=mock_role
        )

        # Mock role removal
        advanced_rbac_service.auth_manager.remove_role_from_user = AsyncMock(
            return_value=True
        )

        # Mock backend revocation
        advanced_rbac_service.auth_manager.backend.revoke_role_delegation = AsyncMock(
            return_value=True
        )

        # Mock audit service
        with patch(
            'gatekeeper.services.advanced_rbac_service.audit_service'
        ) as mock_audit:
            result = await advanced_rbac_service.revoke_delegation("delegation_1")

            assert result is True

            # Verify audit logging
            mock_audit.log_rbac_operation.assert_called_once()


class TestPermissionInheritance:
    """Test permission inheritance functionality."""

    @pytest.fixture
    def advanced_rbac_service(self):
        """Create an AdvancedRBACService instance for testing."""
        auth_manager = AsyncMock(spec=AuthManager)
        return AdvancedRBACService(auth_manager)

    @pytest.mark.asyncio
    async def test_create_role_hierarchy(self, advanced_rbac_service):
        """Test creating a role hierarchy."""
        # Mock backend response
        advanced_rbac_service.auth_manager.backend.create_role_hierarchy = AsyncMock(
            return_value={
                "id": "hierarchy_1",
                "parent_role_id": "parent_1",
                "child_role_id": "child_1",
            }
        )

        # Mock audit service
        with patch(
            'gatekeeper.services.advanced_rbac_service.audit_service'
        ) as mock_audit:
            result = await advanced_rbac_service.create_role_hierarchy(
                parent_role_id="parent_1",
                child_role_id="child_1",
                inheritance_type="full",
            )

            assert isinstance(result, RoleHierarchy)
            assert result.parent_role_id == "parent_1"
            assert result.child_role_id == "child_1"
            assert result.inheritance_type == "full"

            # Verify audit logging
            mock_audit.log_rbac_operation.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_inherited_permissions_full_inheritance(
        self, advanced_rbac_service
    ):
        """Test getting inherited permissions with full inheritance."""
        # Mock direct permissions
        advanced_rbac_service.auth_manager.backend.get_permissions_for_role = AsyncMock(
            return_value=[{"id": "perm_1", "name": "direct_permission"}]
        )

        # Mock parent hierarchy
        advanced_rbac_service.auth_manager.backend.get_role_hierarchies_by_child = (
            AsyncMock(
                return_value=[
                    {
                        "parent_role_id": "parent_1",
                        "inheritance_type": "full",
                        "excluded_permissions": [],
                        "is_active": True,
                    }
                ]
            )
        )

        # Mock parent permissions
        advanced_rbac_service.auth_manager.backend.get_permissions_for_role = AsyncMock(
            side_effect=[
                [{"id": "perm_1", "name": "direct_permission"}],  # Direct permissions
                [{"id": "perm_2", "name": "parent_permission"}],  # Parent permissions
            ]
        )

        result = await advanced_rbac_service.get_inherited_permissions("child_1")

        assert len(result) == 2
        permission_ids = [perm["id"] for perm in result]
        assert "perm_1" in permission_ids
        assert "perm_2" in permission_ids

    @pytest.mark.asyncio
    async def test_get_inherited_permissions_partial_inheritance(
        self, advanced_rbac_service
    ):
        """Test getting inherited permissions with partial inheritance."""
        # Mock direct permissions
        advanced_rbac_service.auth_manager.backend.get_permissions_for_role = AsyncMock(
            return_value=[{"id": "perm_1", "name": "direct_permission"}]
        )

        # Mock parent hierarchy with partial inheritance
        advanced_rbac_service.auth_manager.backend.get_role_hierarchies_by_child = (
            AsyncMock(
                return_value=[
                    {
                        "parent_role_id": "parent_1",
                        "inheritance_type": "partial",
                        "inherited_permissions": ["perm_2"],
                        "is_active": True,
                    }
                ]
            )
        )

        # Mock parent permissions
        advanced_rbac_service.auth_manager.backend.get_permissions_for_role = AsyncMock(
            side_effect=[
                [{"id": "perm_1", "name": "direct_permission"}],  # Direct permissions
                [
                    {"id": "perm_2", "name": "parent_permission"},
                    {"id": "perm_3", "name": "other_permission"},
                ],  # Parent permissions
            ]
        )

        result = await advanced_rbac_service.get_inherited_permissions("child_1")

        assert len(result) == 2
        permission_ids = [perm["id"] for perm in result]
        assert "perm_1" in permission_ids
        assert "perm_2" in permission_ids
        assert "perm_3" not in permission_ids  # Not in inherited list

    @pytest.mark.asyncio
    async def test_create_permission_override(self, advanced_rbac_service):
        """Test creating a permission override."""
        # Mock backend response
        advanced_rbac_service.auth_manager.backend.create_permission_override = (
            AsyncMock(
                return_value={
                    "id": "override_1",
                    "role_id": "role_1",
                    "permission_id": "perm_1",
                }
            )
        )

        # Mock audit service
        with patch(
            'gatekeeper.services.advanced_rbac_service.audit_service'
        ) as mock_audit:
            result = await advanced_rbac_service.create_permission_override(
                role_id="role_1",
                permission_id="perm_1",
                override_type="deny",
                override_conditions={"context": "test"},
            )

            assert isinstance(result, PermissionOverride)
            assert result.role_id == "role_1"
            assert result.permission_id == "perm_1"
            assert result.override_type == "deny"

            # Verify audit logging
            mock_audit.log_rbac_operation.assert_called_once()

    @pytest.mark.asyncio
    async def test_check_permission_with_inheritance_success(
        self, advanced_rbac_service
    ):
        """Test permission check with inheritance - success case."""
        # Mock user
        mock_user = MagicMock()
        mock_user.id = "user_1"
        advanced_rbac_service.auth_manager.get_user_by_username = AsyncMock(
            return_value=mock_user
        )

        # Mock user roles
        advanced_rbac_service.auth_manager.get_user_roles = AsyncMock(
            return_value=[{"role_id": "role_1", "role_name": "test_role"}]
        )

        # Mock inherited permissions
        advanced_rbac_service.get_inherited_permissions = AsyncMock(
            return_value=[
                {"id": "perm_1", "resource_type": "note", "operation": "read"}
            ]
        )

        # Mock permission overrides
        advanced_rbac_service.auth_manager.backend.get_permission_overrides_for_role = (
            AsyncMock(return_value=[])
        )

        result = await advanced_rbac_service.check_permission_with_inheritance(
            username="test_user",
            resource_type="note",
            resource_id="note_1",
            operation="read",
        )

        assert result.granted is True
        assert result.reason == "Permission granted by role"

    @pytest.mark.asyncio
    async def test_check_permission_with_inheritance_override_deny(
        self, advanced_rbac_service
    ):
        """Test permission check with inheritance - override deny case."""
        # Mock user
        mock_user = MagicMock()
        mock_user.id = "user_1"
        advanced_rbac_service.auth_manager.get_user_by_username = AsyncMock(
            return_value=mock_user
        )

        # Mock user roles
        advanced_rbac_service.auth_manager.get_user_roles = AsyncMock(
            return_value=[{"role_id": "role_1", "role_name": "test_role"}]
        )

        # Mock inherited permissions
        advanced_rbac_service.get_inherited_permissions = AsyncMock(
            return_value=[
                {"id": "perm_1", "resource_type": "note", "operation": "read"}
            ]
        )

        # Mock permission overrides - deny override
        advanced_rbac_service.auth_manager.backend.get_permission_overrides_for_role = (
            AsyncMock(
                return_value=[{"permission_id": "perm_1", "override_type": "deny"}]
            )
        )

        result = await advanced_rbac_service.check_permission_with_inheritance(
            username="test_user",
            resource_type="note",
            resource_id="note_1",
            operation="read",
        )

        assert result.granted is False
        assert result.reason == "Permission denied by override"


class TestIntegration:
    """Integration tests for advanced RBAC features."""

    @pytest.fixture
    def advanced_rbac_service(self):
        """Create an AdvancedRBACService instance for testing."""
        auth_manager = AsyncMock(spec=AuthManager)
        return AdvancedRBACService(auth_manager)

    @pytest.mark.asyncio
    async def test_complete_conditional_permission_workflow(
        self, advanced_rbac_service
    ):
        """Test complete workflow for conditional permissions."""
        # This test would simulate a complete workflow from creating conditional permissions
        # to checking them with various conditions
        pass

    @pytest.mark.asyncio
    async def test_complete_role_delegation_workflow(self, advanced_rbac_service):
        """Test complete workflow for role delegation."""
        # This test would simulate a complete workflow from delegating a role
        # to revoking the delegation
        pass

    @pytest.mark.asyncio
    async def test_complete_permission_inheritance_workflow(
        self, advanced_rbac_service
    ):
        """Test complete workflow for permission inheritance."""
        # This test would simulate a complete workflow from creating role hierarchy
        # to checking permissions with inheritance
        pass


if __name__ == "__main__":
    pytest.main([__file__])
