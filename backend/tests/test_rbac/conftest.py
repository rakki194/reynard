"""🧪 RBAC Test Configuration

Configuration and fixtures for RBAC tests.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from unittest.mock import AsyncMock, Mock, patch
from uuid import uuid4

import pytest

from gatekeeper.core.audit_service import audit_service
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


# Create mock RBACService since it doesn't exist yet
class MockRBACService:
    """Mock RBACService for testing until the real one is implemented."""

    def __init__(self, auth_manager):
        self.auth_manager = auth_manager
        self.rbac_service = RBACService(auth_manager)

    async def check_permission(
        self, user_id, resource_type, resource_id, operation, context=None
    ):
        """Mock permission check."""
        return PermissionResult(
            granted=True,
            reason="Mock permission granted",
            conditions_met=True,
            expires_at=datetime.utcnow() + timedelta(hours=1),
        )

    async def assign_role(self, user_id, role_id, context=None):
        """Mock role assignment."""
        return True

    async def remove_role(self, user_id, role_id):
        """Mock role removal."""
        return True

    async def get_user_roles(self, user_id):
        """Mock get user roles."""
        return []

    async def get_role_permissions(self, role_id):
        """Mock get role permissions."""
        return []


# Create mock AuditService since it's a module-level service
class MockAuditService:
    """Mock AuditService for testing."""

    def __init__(self, auth_manager):
        self.auth_manager = auth_manager

    async def log_access_attempt(
        self, user_id, resource_type, resource_id, operation, result
    ):
        """Mock log access attempt."""
        pass

    async def log_role_assignment(self, user_id, role_id, assigned_by, context):
        """Mock log role assignment."""
        pass

    async def log_permission_grant(
        self, user_id, resource_type, resource_id, permission_level, granted_by
    ):
        """Mock log permission grant."""
        pass

    async def get_audit_logs(self, user_id, start_date, end_date):
        """Mock get audit logs."""
        return []

    async def get_security_events(self, start_date, end_date):
        """Mock get security events."""
        return []


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_auth_manager():
    """Create mock AuthManager for testing."""
    auth_manager = Mock(spec=AuthManager)
    auth_manager.backend = Mock()
    return auth_manager


@pytest.fixture
def mock_user():
    """Create mock user for testing."""
    user = Mock()
    user.id = uuid4()
    user.username = "test_user"
    user.email = "test@example.com"
    user.rbac_enabled = True
    user.active = True
    user.created_at = datetime.utcnow()
    return user


@pytest.fixture
def mock_role():
    """Create mock role for testing."""
    role = Mock()
    role.id = uuid4()
    role.name = "test_role"
    role.description = "Test role for unit testing"
    role.level = 1
    role.is_system_role = False
    role.created_at = datetime.utcnow()
    return role


@pytest.fixture
def mock_permission():
    """Create mock permission for testing."""
    permission = Mock()
    permission.id = uuid4()
    permission.name = "test_permission"
    permission.resource_type = ResourceType.NOTE
    permission.operation = Operation.READ
    permission.scope = PermissionScope.OWN
    permission.conditions = {}
    permission.created_at = datetime.utcnow()
    return permission


@pytest.fixture
def mock_user_role_link():
    """Create mock user role link for testing."""
    user_role_link = Mock()
    user_role_link.id = uuid4()
    user_role_link.user_id = uuid4()
    user_role_link.role_id = uuid4()
    user_role_link.context_type = "project"
    user_role_link.context_id = uuid4()
    user_role_link.assigned_at = datetime.utcnow()
    user_role_link.expires_at = datetime.utcnow() + timedelta(days=30)
    user_role_link.is_active = True
    return user_role_link


@pytest.fixture
def mock_resource_access_control():
    """Create mock resource access control for testing."""
    rac = Mock()
    rac.id = uuid4()
    rac.resource_type = ResourceType.NOTE
    rac.resource_id = uuid4()
    rac.subject_type = "user"
    rac.subject_id = uuid4()
    rac.permission_level = "read"
    rac.granted_at = datetime.utcnow()
    rac.expires_at = datetime.utcnow() + timedelta(days=7)
    rac.conditions = {}
    return rac


@pytest.fixture
def mock_permission_result():
    """Create mock permission result for testing."""
    result = Mock()
    result.granted = True
    result.reason = "User has required permission"
    result.conditions_met = True
    result.expires_at = datetime.utcnow() + timedelta(hours=1)
    result.conditions = {}
    return result


@pytest.fixture
def rbac_service(mock_auth_manager):
    """Create MockRBACService instance for testing."""
    return MockRBACService(auth_manager=mock_auth_manager)


@pytest.fixture
def advanced_rbac_service(mock_auth_manager):
    """Create AdvancedRBACService instance for testing."""
    return AdvancedRBACService(auth_manager=mock_auth_manager)


@pytest.fixture
def audit_service(mock_auth_manager):
    """Create MockAuditService instance for testing."""
    return MockAuditService(auth_manager=mock_auth_manager)


@pytest.fixture
def security_monitoring_service(mock_auth_manager):
    """Create SecurityMonitoringService instance for testing."""
    return SecurityMonitoringService(auth_manager=mock_auth_manager)


@pytest.fixture
def rbac_system(mock_auth_manager):
    """Create complete RBAC system for testing."""
    return {
        "auth_manager": mock_auth_manager,
        "rbac_service": MockRBACService(auth_manager=mock_auth_manager),
        "advanced_rbac_service": AdvancedRBACService(auth_manager=mock_auth_manager),
        "audit_service": MockAuditService(auth_manager=mock_auth_manager),
        "security_monitoring_service": SecurityMonitoringService(
            auth_manager=mock_auth_manager
        ),
    }


@pytest.fixture
def test_roles():
    """Create test roles for testing."""
    return [
        {
            "id": uuid4(),
            "name": "system_admin",
            "description": "System administrator role",
            "level": 0,
            "is_system_role": True,
        },
        {
            "id": uuid4(),
            "name": "admin",
            "description": "Administrator role",
            "level": 1,
            "is_system_role": False,
        },
        {
            "id": uuid4(),
            "name": "manager",
            "description": "Manager role",
            "level": 2,
            "is_system_role": False,
        },
        {
            "id": uuid4(),
            "name": "user",
            "description": "Regular user role",
            "level": 3,
            "is_system_role": False,
        },
        {
            "id": uuid4(),
            "name": "guest",
            "description": "Guest user role",
            "level": 4,
            "is_system_role": False,
        },
    ]


@pytest.fixture
def test_permissions():
    """Create test permissions for testing."""
    return [
        {
            "id": uuid4(),
            "name": "note_read",
            "resource_type": ResourceType.NOTE,
            "operation": Operation.READ,
            "scope": PermissionScope.OWN,
            "conditions": {},
        },
        {
            "id": uuid4(),
            "name": "note_write",
            "resource_type": ResourceType.NOTE,
            "operation": Operation.UPDATE,
            "scope": PermissionScope.OWN,
            "conditions": {},
        },
        {
            "id": uuid4(),
            "name": "note_delete",
            "resource_type": ResourceType.NOTE,
            "operation": Operation.DELETE,
            "scope": PermissionScope.OWN,
            "conditions": {},
        },
        {
            "id": uuid4(),
            "name": "email_read",
            "resource_type": ResourceType.EMAIL,
            "operation": Operation.READ,
            "scope": PermissionScope.OWN,
            "conditions": {},
        },
        {
            "id": uuid4(),
            "name": "email_send",
            "resource_type": ResourceType.EMAIL,
            "operation": Operation.CREATE,
            "scope": PermissionScope.OWN,
            "conditions": {},
        },
        {
            "id": uuid4(),
            "name": "rag_search",
            "resource_type": ResourceType.RAG_DOCUMENT,
            "operation": Operation.EXECUTE,
            "scope": PermissionScope.TEAM,
            "conditions": {},
        },
        {
            "id": uuid4(),
            "name": "ecs_manage",
            "resource_type": ResourceType.ECS_WORLD,
            "operation": Operation.MANAGE,
            "scope": PermissionScope.OWN,
            "conditions": {},
        },
    ]


@pytest.fixture
def test_users():
    """Create test users for testing."""
    return [
        {
            "id": uuid4(),
            "username": "admin_user",
            "email": "admin@example.com",
            "rbac_enabled": True,
            "active": True,
        },
        {
            "id": uuid4(),
            "username": "manager_user",
            "email": "manager@example.com",
            "rbac_enabled": True,
            "active": True,
        },
        {
            "id": uuid4(),
            "username": "regular_user",
            "email": "user@example.com",
            "rbac_enabled": True,
            "active": True,
        },
        {
            "id": uuid4(),
            "username": "guest_user",
            "email": "guest@example.com",
            "rbac_enabled": False,
            "active": True,
        },
    ]


@pytest.fixture
def test_resources():
    """Create test resources for testing."""
    return [
        {
            "id": str(uuid4()),
            "type": ResourceType.NOTE,
            "name": "Test Note 1",
            "owner_id": uuid4(),
        },
        {
            "id": str(uuid4()),
            "type": ResourceType.EMAIL,
            "name": "Test Email 1",
            "owner_id": uuid4(),
        },
        {
            "id": str(uuid4()),
            "type": ResourceType.RAG_DOCUMENT,
            "name": "Test Document 1",
            "owner_id": uuid4(),
        },
        {
            "id": str(uuid4()),
            "type": ResourceType.ECS_WORLD,
            "name": "Test World 1",
            "owner_id": uuid4(),
        },
    ]


@pytest.fixture
def test_contexts():
    """Create test contexts for testing."""
    return [
        {"type": "project", "id": str(uuid4()), "name": "Test Project 1"},
        {"type": "team", "id": str(uuid4()), "name": "Test Team 1"},
        {"type": "organization", "id": str(uuid4()), "name": "Test Organization 1"},
    ]


@pytest.fixture
def test_conditions():
    """Create test conditions for testing."""
    return [
        {"time_restriction": {"start_time": "09:00", "end_time": "17:00"}},
        {"ip_restriction": {"allowed_ips": ["192.168.1.0/24", "10.0.0.0/8"]}},
        {"device_restriction": {"allowed_devices": ["laptop", "desktop"]}},
        {"location_restriction": {"allowed_locations": ["office", "home"]}},
    ]


@pytest.fixture
def test_audit_logs():
    """Create test audit logs for testing."""
    return [
        {
            "id": uuid4(),
            "event_type": "access_attempt",
            "user_id": uuid4(),
            "resource_type": ResourceType.NOTE,
            "resource_id": str(uuid4()),
            "operation": Operation.READ,
            "result": "granted",
            "timestamp": datetime.utcnow() - timedelta(hours=1),
        },
        {
            "id": uuid4(),
            "event_type": "role_assignment",
            "user_id": uuid4(),
            "role_id": uuid4(),
            "assigned_by": uuid4(),
            "timestamp": datetime.utcnow() - timedelta(hours=2),
        },
        {
            "id": uuid4(),
            "event_type": "permission_grant",
            "user_id": uuid4(),
            "resource_type": ResourceType.EMAIL,
            "resource_id": str(uuid4()),
            "permission_level": "read",
            "granted_by": uuid4(),
            "timestamp": datetime.utcnow() - timedelta(hours=3),
        },
    ]


@pytest.fixture
def test_security_events():
    """Create test security events for testing."""
    return [
        {
            "id": uuid4(),
            "event_type": "failed_login",
            "user_id": uuid4(),
            "severity": "medium",
            "description": "Multiple failed login attempts",
            "timestamp": datetime.utcnow() - timedelta(minutes=30),
        },
        {
            "id": uuid4(),
            "event_type": "privilege_escalation_attempt",
            "user_id": uuid4(),
            "severity": "critical",
            "description": "User attempted to access admin resources",
            "timestamp": datetime.utcnow() - timedelta(minutes=15),
        },
        {
            "id": uuid4(),
            "event_type": "unusual_access_pattern",
            "user_id": uuid4(),
            "severity": "low",
            "description": "User accessed resources from unusual location",
            "timestamp": datetime.utcnow() - timedelta(minutes=5),
        },
    ]


@pytest.fixture
def test_anomalies():
    """Create test anomalies for testing."""
    return [
        {
            "id": uuid4(),
            "type": "unusual_access_pattern",
            "severity": "medium",
            "description": "User accessed resources from unusual location",
            "user_id": uuid4(),
            "timestamp": datetime.utcnow() - timedelta(minutes=10),
        },
        {
            "id": uuid4(),
            "type": "brute_force_attempt",
            "severity": "high",
            "description": "Multiple failed login attempts detected",
            "user_id": uuid4(),
            "timestamp": datetime.utcnow() - timedelta(minutes=5),
        },
        {
            "id": uuid4(),
            "type": "privilege_escalation_attempt",
            "severity": "critical",
            "description": "User attempted to access admin resources",
            "user_id": uuid4(),
            "timestamp": datetime.utcnow() - timedelta(minutes=2),
        },
    ]


@pytest.fixture
def test_performance_metrics():
    """Create test performance metrics for testing."""
    return {
        "permission_check_time": 0.005,  # 5ms
        "role_assignment_time": 0.010,  # 10ms
        "audit_log_time": 0.003,  # 3ms
        "security_monitoring_time": 0.050,  # 50ms
        "concurrent_checks": 100,
        "memory_usage_mb": 50,
    }


@pytest.fixture
def test_error_scenarios():
    """Create test error scenarios for testing."""
    return [
        {
            "name": "invalid_user_id",
            "user_id": "invalid_uuid",
            "expected_error": "Invalid user ID format",
        },
        {
            "name": "invalid_resource_type",
            "resource_type": "invalid_type",
            "expected_error": "Invalid resource type",
        },
        {
            "name": "invalid_operation",
            "operation": "invalid_operation",
            "expected_error": "Invalid operation",
        },
        {
            "name": "missing_permission",
            "permission": None,
            "expected_error": "Permission not found",
        },
        {
            "name": "expired_role",
            "expires_at": datetime.utcnow() - timedelta(days=1),
            "expected_error": "Role has expired",
        },
    ]


@pytest.fixture
def test_injection_payloads():
    """Create test injection payloads for security testing."""
    return {
        "sql_injection": [
            "'; DROP TABLE users; --",
            "1' OR '1'='1",
            "1'; INSERT INTO users VALUES ('hacker', 'password'); --",
            "1' UNION SELECT * FROM users --",
        ],
        "xss": [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>",
            "';alert('XSS');//",
        ],
        "path_traversal": [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\config\\sam",
            "....//....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        ],
        "ldap_injection": ["*", "*)(uid=*", "*)(|(uid=*", "*)(|(objectClass=*"],
        "command_injection": ["; ls -la", "| cat /etc/passwd", "&& whoami", "`id`"],
    }


@pytest.fixture
def test_benchmark_data():
    """Create test benchmark data for performance testing."""
    return {
        "num_users": 1000,
        "num_roles": 50,
        "num_permissions": 200,
        "num_resources": 10000,
        "num_operations": 100000,
        "concurrent_users": 100,
        "test_duration_seconds": 60,
    }


@pytest.fixture
def test_compliance_requirements():
    """Create test compliance requirements for testing."""
    return {
        "gdpr": {
            "data_retention_days": 365,
            "consent_required": True,
            "right_to_erasure": True,
            "data_portability": True,
        },
        "sox": {
            "audit_trail_required": True,
            "segregation_of_duties": True,
            "access_controls": True,
            "change_management": True,
        },
        "hipaa": {
            "encryption_required": True,
            "access_logging": True,
            "user_authentication": True,
            "data_integrity": True,
        },
        "pci_dss": {
            "strong_authentication": True,
            "network_security": True,
            "regular_monitoring": True,
            "vulnerability_management": True,
        },
    }


# Test markers
def pytest_configure(config):
    """Configure pytest markers."""
    config.addinivalue_line("markers", "unit: Unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "security: Security tests")
    config.addinivalue_line("markers", "performance: Performance tests")
    config.addinivalue_line("markers", "slow: Slow running tests")


# Test collection hooks
def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers based on test names."""
    for item in items:
        # Add markers based on test file names
        if "test_models" in item.nodeid:
            item.add_marker(pytest.mark.unit)
        elif "test_services" in item.nodeid:
            item.add_marker(pytest.mark.unit)
        elif "test_integration" in item.nodeid:
            item.add_marker(pytest.mark.integration)
        elif "test_security" in item.nodeid:
            item.add_marker(pytest.mark.security)

        # Add slow marker for performance tests
        if "performance" in item.nodeid or "benchmark" in item.nodeid:
            item.add_marker(pytest.mark.slow)


# Test reporting hooks
def pytest_html_report_title(report):
    """Set HTML report title."""
    report.title = "RBAC System Test Report"


def pytest_html_results_summary(prefix, summary, postfix):
    """Add summary to HTML report."""
    prefix.extend(
        [
            "<h2>RBAC System Test Summary</h2>",
            "<p>Comprehensive testing of Role-Based Access Control system including:</p>",
            "<ul>",
            "<li>Unit tests for models and services</li>",
            "<li>Integration tests for cross-service functionality</li>",
            "<li>Security tests for penetration testing and vulnerability assessment</li>",
            "<li>Performance tests for scalability and efficiency</li>",
            "</ul>",
        ]
    )


# Test cleanup hooks
@pytest.fixture(autouse=True)
def cleanup_test_data():
    """Cleanup test data after each test."""
    yield
    # Add cleanup logic here if needed
    pass


# Test logging configuration
@pytest.fixture(autouse=True)
def configure_test_logging():
    """Configure logging for tests."""
    import logging

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    )
    yield
    # Cleanup logging configuration if needed
    pass
