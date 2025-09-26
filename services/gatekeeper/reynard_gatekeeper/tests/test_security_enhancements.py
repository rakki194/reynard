"""Tests for Security Enhancement Services.

This module contains comprehensive tests for security enhancement features including:
- Security monitoring and anomaly detection
- Encryption and key management
- Compliance and GDPR tools

Author: Reynard Development Team
Version: 1.0.0
"""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from gatekeeper.core.audit_service import AuditEvent, AuditEventType, AuditService
from gatekeeper.models.rbac import Operation, ResourceType
from gatekeeper.services.compliance_service import (
    ComplianceService,
    ConsentRecord,
    ConsentType,
    DataCategory,
    DataRetentionPolicy,
    DataSubjectRequest,
    DataSubjectRight,
    RetentionPeriod,
)
from gatekeeper.services.encryption_service import (
    EncryptedData,
    EncryptionAlgorithm,
    EncryptionKey,
    EncryptionLevel,
    EncryptionService,
    KeyType,
)
from gatekeeper.services.security_monitoring_service import (
    AnomalyDetection,
    AnomalyType,
    SecurityAlert,
    SecurityMetric,
    SecurityMonitoringService,
    ThreatLevel,
)


class TestSecurityMonitoringService:
    """Test security monitoring and anomaly detection functionality."""

    @pytest.fixture
    def security_monitoring_service(self):
        """Create a SecurityMonitoringService instance for testing."""
        audit_service = AsyncMock(spec=AuditService)
        return SecurityMonitoringService(audit_service)

    @pytest.fixture
    def sample_audit_event(self):
        """Create a sample audit event for testing."""
        return AuditEvent(
            event_type=AuditEventType.LOGIN_FAILED,
            username="test_user",
            user_id="user_123",
            success=False,
            ip_address="192.168.1.100",
            user_agent="Mozilla/5.0",
            timestamp=datetime.now(timezone.utc),
        )

    @pytest.mark.asyncio
    async def test_log_audit_event(
        self, security_monitoring_service, sample_audit_event
    ):
        """Test logging audit events for security analysis."""
        result = await security_monitoring_service.log_audit_event(sample_audit_event)

        assert result is True
        assert len(security_monitoring_service.user_activity_history["user_123"]) == 1
        assert (
            len(security_monitoring_service.ip_activity_history["192.168.1.100"]) == 1
        )
        assert len(security_monitoring_service.login_attempts["test_user"]) == 1

    @pytest.mark.asyncio
    async def test_brute_force_detection(self, security_monitoring_service):
        """Test brute force attack detection."""
        # Create multiple failed login events
        for i in range(6):  # Exceed threshold of 5
            event = AuditEvent(
                event_type=AuditEventType.LOGIN_FAILED,
                username="attacker",
                user_id="user_456",
                success=False,
                ip_address="192.168.1.200",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=i),
            )
            await security_monitoring_service.log_audit_event(event)

        # Check if brute force alert was created
        assert len(security_monitoring_service.active_alerts) > 0

        # Find the brute force alert
        brute_force_alert = None
        for alert in security_monitoring_service.active_alerts.values():
            if alert.alert_type == "brute_force_attempt":
                brute_force_alert = alert
                break

        assert brute_force_alert is not None
        assert brute_force_alert.threat_level == ThreatLevel.HIGH
        assert "Brute Force Attack Detected" in brute_force_alert.title

    @pytest.mark.asyncio
    async def test_privilege_escalation_detection(self, security_monitoring_service):
        """Test privilege escalation attempt detection."""
        # Create multiple permission denial events
        for i in range(12):  # Exceed threshold of 10
            event = AuditEvent(
                event_type=AuditEventType.PERMISSION_DENIED,
                username="escalator",
                user_id="user_789",
                success=False,
                operation="admin:manage",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=i * 5),
            )
            await security_monitoring_service.log_audit_event(event)

        # Check if privilege escalation alert was created
        escalation_alert = None
        for alert in security_monitoring_service.active_alerts.values():
            if alert.alert_type == "privilege_escalation_attempt":
                escalation_alert = alert
                break

        assert escalation_alert is not None
        assert escalation_alert.threat_level == ThreatLevel.MEDIUM

    @pytest.mark.asyncio
    async def test_unusual_access_pattern_detection(self, security_monitoring_service):
        """Test unusual access pattern detection."""
        # Create access events at unusual hours (2 AM)
        unusual_time = datetime.now(timezone.utc).replace(
            hour=2, minute=0, second=0, microsecond=0
        )

        for i in range(8):  # Create enough events to trigger detection
            event = AuditEvent(
                event_type=AuditEventType.RESOURCE_ACCESS_GRANTED,
                username="night_owl",
                user_id="user_night",
                success=True,
                resource_type="note",
                resource_id=f"note_{i}",
                timestamp=unusual_time - timedelta(hours=i),
            )
            await security_monitoring_service.log_audit_event(event)

        # Check if unusual time access alert was created
        unusual_alert = None
        for alert in security_monitoring_service.active_alerts.values():
            if alert.alert_type == "unusual_time_access":
                unusual_alert = alert
                break

        assert unusual_alert is not None
        assert unusual_alert.threat_level == ThreatLevel.LOW

    @pytest.mark.asyncio
    async def test_get_security_dashboard_data(self, security_monitoring_service):
        """Test getting security dashboard data."""
        # Add some test data
        test_alert = SecurityAlert(
            id="test_alert_1",
            alert_type="test_alert",
            threat_level=ThreatLevel.MEDIUM,
            title="Test Alert",
            description="Test alert description",
            username="test_user",
        )
        security_monitoring_service.active_alerts["test_alert_1"] = test_alert

        dashboard_data = await security_monitoring_service.get_security_dashboard_data()

        assert "timestamp" in dashboard_data
        assert "active_alerts" in dashboard_data
        assert "security_metrics" in dashboard_data
        assert "activity_summary" in dashboard_data
        assert "configuration" in dashboard_data

        assert dashboard_data["active_alerts"]["total"] == 1
        assert dashboard_data["active_alerts"]["by_threat_level"]["medium"] == 1

    @pytest.mark.asyncio
    async def test_get_user_security_profile(self, security_monitoring_service):
        """Test getting user security profile."""
        user_id = "test_user_123"

        # Add some test activity
        for i in range(5):
            event = AuditEvent(
                event_type=AuditEventType.RESOURCE_ACCESS_GRANTED,
                username="test_user",
                user_id=user_id,
                success=True,
                timestamp=datetime.now(timezone.utc) - timedelta(hours=i),
            )
            await security_monitoring_service.log_audit_event(event)

        profile = await security_monitoring_service.get_user_security_profile(user_id)

        assert profile["user_id"] == user_id
        assert "timestamp" in profile
        assert "activity_summary" in profile
        assert "active_alerts" in profile
        assert "risk_score" in profile

        assert profile["activity_summary"]["total_events_7d"] == 5
        assert isinstance(profile["risk_score"], float)
        assert 0.0 <= profile["risk_score"] <= 1.0


class TestEncryptionService:
    """Test encryption and key management functionality."""

    @pytest.fixture
    def encryption_service(self):
        """Create an EncryptionService instance for testing."""
        audit_service = AsyncMock(spec=AuditService)
        return EncryptionService(audit_service)

    @pytest.mark.asyncio
    async def test_create_role_based_key(self, encryption_service):
        """Test creating role-based encryption keys."""
        key = await encryption_service.create_role_based_key(
            key_id="test_key_1",
            role_access=["admin", "user"],
            algorithm=EncryptionAlgorithm.AES_256_GCM,
            encryption_level=EncryptionLevel.BASIC,
        )

        assert key.key_id == "test_key_1"
        assert key.key_type == KeyType.SYMMETRIC
        assert key.algorithm == EncryptionAlgorithm.AES_256_GCM
        assert key.role_access == ["admin", "user"]
        assert key.is_active is True
        assert key.key_id in encryption_service.encryption_keys

    @pytest.mark.asyncio
    async def test_encrypt_data(self, encryption_service):
        """Test data encryption."""
        # Create a key first
        key = await encryption_service.create_role_based_key(
            key_id="encrypt_test_key",
            role_access=["admin"],
            algorithm=EncryptionAlgorithm.AES_256_GCM,
        )

        # Encrypt data
        test_data = "This is sensitive data that needs encryption"
        encrypted_data = await encryption_service.encrypt_data(
            data=test_data,
            key_id=key.key_id,
            user_roles=["admin"],
            resource_type=ResourceType.NOTE,
            resource_id="note_123",
        )

        assert encrypted_data.key_id == key.key_id
        assert encrypted_data.algorithm == EncryptionAlgorithm.AES_256_GCM
        assert encrypted_data.data != test_data.encode('utf-8')
        assert encrypted_data.iv is not None
        assert encrypted_data.tag is not None
        assert encrypted_data.metadata["resource_type"] == "note"
        assert encrypted_data.metadata["resource_id"] == "note_123"

    @pytest.mark.asyncio
    async def test_decrypt_data(self, encryption_service):
        """Test data decryption."""
        # Create a key and encrypt data
        key = await encryption_service.create_role_based_key(
            key_id="decrypt_test_key",
            role_access=["admin"],
            algorithm=EncryptionAlgorithm.AES_256_GCM,
        )

        test_data = "This is test data for decryption"
        encrypted_data = await encryption_service.encrypt_data(
            data=test_data, key_id=key.key_id, user_roles=["admin"]
        )

        # Decrypt data
        decrypted_data = await encryption_service.decrypt_data(
            encrypted_data=encrypted_data, user_roles=["admin"]
        )

        assert decrypted_data.decode('utf-8') == test_data

    @pytest.mark.asyncio
    async def test_encrypt_decrypt_roundtrip(self, encryption_service):
        """Test complete encrypt-decrypt roundtrip."""
        # Create key
        key = await encryption_service.create_role_based_key(
            key_id="roundtrip_key",
            role_access=["user", "admin"],
            algorithm=EncryptionAlgorithm.AES_256_GCM,
        )

        # Test with string data
        original_string = "Hello, World! This is a test string."
        encrypted = await encryption_service.encrypt_data(
            data=original_string, key_id=key.key_id, user_roles=["admin"]
        )
        decrypted = await encryption_service.decrypt_data(
            encrypted_data=encrypted, user_roles=["admin"]
        )
        assert decrypted.decode('utf-8') == original_string

        # Test with bytes data
        original_bytes = b"Binary data test \x00\x01\x02\x03"
        encrypted = await encryption_service.encrypt_data(
            data=original_bytes, key_id=key.key_id, user_roles=["admin"]
        )
        decrypted = await encryption_service.decrypt_data(
            encrypted_data=encrypted, user_roles=["admin"]
        )
        assert decrypted == original_bytes

    @pytest.mark.asyncio
    async def test_role_based_access_control(self, encryption_service):
        """Test role-based access control for encryption."""
        # Create key with specific role access
        key = await encryption_service.create_role_based_key(
            key_id="rbac_test_key",
            role_access=["admin"],
            algorithm=EncryptionAlgorithm.AES_256_GCM,
        )

        # Test that admin can encrypt/decrypt
        encrypted_data = await encryption_service.encrypt_data(
            data="admin data", key_id=key.key_id, user_roles=["admin"]
        )

        decrypted_data = await encryption_service.decrypt_data(
            encrypted_data=encrypted_data, user_roles=["admin"]
        )
        assert decrypted_data.decode('utf-8') == "admin data"

        # Test that user without admin role cannot access
        with pytest.raises(PermissionError):
            await encryption_service.encrypt_data(
                data="user data", key_id=key.key_id, user_roles=["user"]
            )

        with pytest.raises(PermissionError):
            await encryption_service.decrypt_data(
                encrypted_data=encrypted_data, user_roles=["user"]
            )

    @pytest.mark.asyncio
    async def test_secure_share(self, encryption_service):
        """Test secure data sharing."""
        # Create secure share
        share_info = await encryption_service.create_secure_share(
            data="Shared secret data",
            sharing_roles=["admin"],
            recipient_roles=["user", "manager"],
            expires_in_hours=24,
        )

        assert "share_id" in share_info
        assert "encrypted_data" in share_info
        assert share_info["recipient_roles"] == ["user", "manager"]
        assert share_info["expires_at"] is not None

        # Access the share with authorized role
        decrypted_data = await encryption_service.access_secure_share(
            share_info=share_info, user_roles=["user"]
        )
        assert decrypted_data.decode('utf-8') == "Shared secret data"

        # Test that unauthorized role cannot access
        with pytest.raises(PermissionError):
            await encryption_service.access_secure_share(
                share_info=share_info, user_roles=["guest"]
            )

    @pytest.mark.asyncio
    async def test_key_rotation(self, encryption_service):
        """Test encryption key rotation."""
        # Create original key
        original_key = await encryption_service.create_role_based_key(
            key_id="rotation_test_key",
            role_access=["admin"],
            algorithm=EncryptionAlgorithm.AES_256_GCM,
        )

        # Encrypt data with original key
        encrypted_data = await encryption_service.encrypt_data(
            data="Data before rotation",
            key_id=original_key.key_id,
            user_roles=["admin"],
        )

        # Rotate the key
        new_key = await encryption_service.rotate_encryption_key(original_key.key_id)

        # Original key should be deactivated
        assert not original_key.is_active
        assert new_key.key_id != original_key.key_id
        assert new_key.is_active

        # Should still be able to decrypt with new key (if implemented)
        # This would depend on the specific key rotation implementation
        assert new_key.role_access == original_key.role_access

    @pytest.mark.asyncio
    async def test_get_encryption_status(self, encryption_service):
        """Test getting encryption service status."""
        status = await encryption_service.get_encryption_status()

        assert "timestamp" in status
        assert "key_statistics" in status
        assert "rotation_status" in status
        assert "configuration" in status

        assert "total_keys" in status["key_statistics"]
        assert "active_keys" in status["key_statistics"]
        assert "algorithm_distribution" in status["key_statistics"]


class TestComplianceService:
    """Test compliance and GDPR functionality."""

    @pytest.fixture
    def compliance_service(self):
        """Create a ComplianceService instance for testing."""
        audit_service = AsyncMock(spec=AuditService)
        return ComplianceService(audit_service)

    @pytest.mark.asyncio
    async def test_create_retention_policy(self, compliance_service):
        """Test creating data retention policies."""
        policy = await compliance_service.create_retention_policy(
            name="Test Policy",
            description="Test retention policy",
            resource_type=ResourceType.NOTE,
            data_category=DataCategory.PERSONAL_DATA,
            retention_period=RetentionPeriod.MEDIUM_TERM,
            auto_delete=True,
            legal_basis="Legitimate interest",
        )

        assert policy.name == "Test Policy"
        assert policy.resource_type == ResourceType.NOTE
        assert policy.data_category == DataCategory.PERSONAL_DATA
        assert policy.retention_period == RetentionPeriod.MEDIUM_TERM
        assert policy.auto_delete is True
        assert policy.is_active is True
        assert policy.id in compliance_service.retention_policies

    @pytest.mark.asyncio
    async def test_record_consent(self, compliance_service):
        """Test recording user consent."""
        consent_record = await compliance_service.record_consent(
            user_id="user_123",
            consent_type=ConsentType.DATA_PROCESSING,
            granted=True,
            legal_basis="Consent",
            purpose="Service provision",
            data_categories=[DataCategory.PERSONAL_DATA, DataCategory.TECHNICAL_DATA],
            retention_period=RetentionPeriod.MEDIUM_TERM,
        )

        assert consent_record.user_id == "user_123"
        assert consent_record.consent_type == ConsentType.DATA_PROCESSING
        assert consent_record.granted is True
        assert consent_record.granted_at is not None
        assert consent_record.withdrawn_at is None
        assert DataCategory.PERSONAL_DATA in consent_record.data_categories
        assert DataCategory.TECHNICAL_DATA in consent_record.data_categories

        # Check that consent was stored
        assert "user_123" in compliance_service.consent_records
        assert len(compliance_service.consent_records["user_123"]) == 1

    @pytest.mark.asyncio
    async def test_check_consent(self, compliance_service):
        """Test checking user consent."""
        # Record consent first
        await compliance_service.record_consent(
            user_id="user_456",
            consent_type=ConsentType.DATA_PROCESSING,
            granted=True,
            data_categories=[DataCategory.PERSONAL_DATA],
        )

        # Check consent
        has_consent = await compliance_service.check_consent(
            user_id="user_456",
            consent_type=ConsentType.DATA_PROCESSING,
            data_categories=[DataCategory.PERSONAL_DATA],
        )
        assert has_consent is True

        # Check consent for different data category
        has_consent_different = await compliance_service.check_consent(
            user_id="user_456",
            consent_type=ConsentType.DATA_PROCESSING,
            data_categories=[DataCategory.SENSITIVE_PERSONAL_DATA],
        )
        assert has_consent_different is False

        # Check consent for user without consent
        has_consent_none = await compliance_service.check_consent(
            user_id="user_789", consent_type=ConsentType.DATA_PROCESSING
        )
        assert has_consent_none is False

    @pytest.mark.asyncio
    async def test_consent_withdrawal(self, compliance_service):
        """Test consent withdrawal."""
        # Record initial consent
        await compliance_service.record_consent(
            user_id="user_withdraw", consent_type=ConsentType.MARKETING, granted=True
        )

        # Check consent is granted
        has_consent = await compliance_service.check_consent(
            user_id="user_withdraw", consent_type=ConsentType.MARKETING
        )
        assert has_consent is True

        # Withdraw consent
        await compliance_service.record_consent(
            user_id="user_withdraw", consent_type=ConsentType.MARKETING, granted=False
        )

        # Check consent is withdrawn
        has_consent_after = await compliance_service.check_consent(
            user_id="user_withdraw", consent_type=ConsentType.MARKETING
        )
        assert has_consent_after is False

        # Check that original consent was marked as withdrawn
        user_consents = compliance_service.consent_records["user_withdraw"]
        assert len(user_consents) == 2
        assert user_consents[0].withdrawn_at is not None
        assert user_consents[1].granted is False

    @pytest.mark.asyncio
    async def test_log_data_access(self, compliance_service):
        """Test logging data access for compliance."""
        access_log = await compliance_service.log_data_access(
            user_id="user_access",
            accessed_by="admin_user",
            resource_type=ResourceType.NOTE,
            resource_id="note_123",
            operation=Operation.READ,
            data_categories=[DataCategory.PERSONAL_DATA],
            purpose="Administrative review",
            legal_basis="Legitimate interest",
            ip_address="192.168.1.100",
            user_agent="Mozilla/5.0",
        )

        assert access_log.user_id == "user_access"
        assert access_log.accessed_by == "admin_user"
        assert access_log.resource_type == ResourceType.NOTE
        assert access_log.resource_id == "note_123"
        assert access_log.operation == Operation.READ
        assert DataCategory.PERSONAL_DATA in access_log.data_categories
        assert access_log.purpose == "Administrative review"
        assert access_log.legal_basis == "Legitimate interest"

        # Check that access log was stored
        assert len(compliance_service.data_access_logs) == 1
        assert compliance_service.data_access_logs[0].id == access_log.id

    @pytest.mark.asyncio
    async def test_create_data_subject_request(self, compliance_service):
        """Test creating data subject requests."""
        request = await compliance_service.create_data_subject_request(
            user_id="user_request",
            request_type=DataSubjectRight.ACCESS,
            description="Request for data access",
            legal_basis="GDPR Article 15",
        )

        assert request.user_id == "user_request"
        assert request.request_type == DataSubjectRight.ACCESS
        assert request.status == "pending"
        assert request.description == "Request for data access"
        assert request.legal_basis == "GDPR Article 15"

        # Check that request was stored
        assert "user_request" in compliance_service.data_subject_requests
        assert len(compliance_service.data_subject_requests["user_request"]) == 1

    @pytest.mark.asyncio
    async def test_process_data_subject_request(self, compliance_service):
        """Test processing data subject requests."""
        # Create request first
        request = await compliance_service.create_data_subject_request(
            user_id="user_process", request_type=DataSubjectRight.ACCESS
        )

        # Process the request
        response_data = {
            "personal_data": ["name", "email"],
            "technical_data": ["ip_address", "user_agent"],
            "access_logs": ["2024-01-01", "2024-01-02"],
        }

        updated_request = await compliance_service.process_data_subject_request(
            request_id=request.id,
            user_id="user_process",
            response_data=response_data,
            status="completed",
        )

        assert updated_request.status == "completed"
        assert updated_request.completed_at is not None
        assert updated_request.response_data == response_data

    @pytest.mark.asyncio
    async def test_get_user_data_summary(self, compliance_service):
        """Test getting user data summary (GDPR Article 15)."""
        user_id = "user_summary"

        # Add some test data
        await compliance_service.record_consent(
            user_id=user_id,
            consent_type=ConsentType.DATA_PROCESSING,
            granted=True,
            data_categories=[DataCategory.PERSONAL_DATA],
        )

        await compliance_service.log_data_access(
            user_id=user_id,
            accessed_by="admin",
            resource_type=ResourceType.NOTE,
            resource_id="note_1",
            operation=Operation.READ,
            data_categories=[DataCategory.PERSONAL_DATA],
            purpose="Data access",
            legal_basis="Consent",
        )

        await compliance_service.create_data_subject_request(
            user_id=user_id, request_type=DataSubjectRight.ACCESS
        )

        # Get data summary
        summary = await compliance_service.get_user_data_summary(user_id)

        assert summary["user_id"] == user_id
        assert "generated_at" in summary
        assert "consent_records" in summary
        assert "data_access_summary" in summary
        assert "data_subject_requests" in summary
        assert "applicable_retention_policies" in summary

        assert len(summary["consent_records"]) == 1
        assert summary["data_access_summary"]["total_accesses"] == 1
        assert len(summary["data_subject_requests"]) == 1

    @pytest.mark.asyncio
    async def test_apply_data_retention(self, compliance_service):
        """Test applying data retention policies."""
        # Create a retention policy
        await compliance_service.create_retention_policy(
            name="Test Retention Policy",
            description="Test policy for notes",
            resource_type=ResourceType.NOTE,
            data_category=DataCategory.PERSONAL_DATA,
            retention_period=RetentionPeriod.SHORT_TERM,
            auto_delete=True,
        )

        # Apply retention
        results = await compliance_service.apply_data_retention(ResourceType.NOTE)

        assert results["resource_type"] == "note"
        assert "processed_at" in results
        assert "policies_applied" in results
        assert "data_deleted" in results
        assert "errors" in results

        assert len(results["policies_applied"]) == 1
        assert results["policies_applied"][0]["policy_name"] == "Test Retention Policy"

    @pytest.mark.asyncio
    async def test_generate_compliance_report(self, compliance_service):
        """Test generating compliance reports."""
        # Add some test data
        await compliance_service.record_consent(
            user_id="user_report",
            consent_type=ConsentType.DATA_PROCESSING,
            granted=True,
        )

        await compliance_service.log_data_access(
            user_id="user_report",
            accessed_by="admin",
            resource_type=ResourceType.NOTE,
            resource_id="note_1",
            operation=Operation.READ,
            data_categories=[DataCategory.PERSONAL_DATA],
            purpose="Report generation",
            legal_basis="Consent",
        )

        # Generate report
        report = await compliance_service.generate_compliance_report()

        assert "report_period" in report
        assert "data_access_statistics" in report
        assert "consent_statistics" in report
        assert "data_subject_requests" in report
        assert "retention_policy_statistics" in report
        assert "compliance_status" in report

        assert report["data_access_statistics"]["total_accesses"] == 1
        assert report["consent_statistics"]["total_consent_records"] == 1
        assert report["consent_statistics"]["active_consents"] == 1

    @pytest.mark.asyncio
    async def test_get_compliance_status(self, compliance_service):
        """Test getting compliance status."""
        status = await compliance_service.get_compliance_status()

        assert "timestamp" in status
        assert "gdpr_compliance" in status
        assert "data_retention" in status
        assert "data_access_logging" in status
        assert "configuration" in status

        assert "consent_coverage" in status["gdpr_compliance"]
        assert "pending_requests" in status["gdpr_compliance"]
        assert "overdue_requests" in status["gdpr_compliance"]
        assert "response_time_compliance" in status["gdpr_compliance"]


class TestIntegration:
    """Integration tests for security enhancement features."""

    @pytest.fixture
    def security_monitoring_service(self):
        """Create a SecurityMonitoringService instance for testing."""
        audit_service = AsyncMock(spec=AuditService)
        return SecurityMonitoringService(audit_service)

    @pytest.fixture
    def encryption_service(self):
        """Create an EncryptionService instance for testing."""
        audit_service = AsyncMock(spec=AuditService)
        return EncryptionService(audit_service)

    @pytest.fixture
    def compliance_service(self):
        """Create a ComplianceService instance for testing."""
        audit_service = AsyncMock(spec=AuditService)
        return ComplianceService(audit_service)

    @pytest.mark.asyncio
    async def test_security_monitoring_with_encryption(
        self, security_monitoring_service, encryption_service
    ):
        """Test integration between security monitoring and encryption."""
        # Create encryption key
        key = await encryption_service.create_role_based_key(
            key_id="integration_key",
            role_access=["admin"],
            algorithm=EncryptionAlgorithm.AES_256_GCM,
        )

        # Encrypt data
        encrypted_data = await encryption_service.encrypt_data(
            data="Sensitive data for monitoring",
            key_id=key.key_id,
            user_roles=["admin"],
        )

        # Create audit event for encryption
        audit_event = AuditEvent(
            event_type=AuditEventType.RESOURCE_ACCESS_GRANTED,
            username="admin_user",
            user_id="admin_123",
            success=True,
            resource_type="encryption_key",
            resource_id=key.key_id,
            operation="encrypt",
            context={
                "data_size": len("Sensitive data for monitoring"),
                "algorithm": key.algorithm.value,
            },
        )

        # Log event for security monitoring
        await security_monitoring_service.log_audit_event(audit_event)

        # Check that event was recorded
        assert len(security_monitoring_service.user_activity_history["admin_123"]) == 1

        # Get security profile
        profile = await security_monitoring_service.get_user_security_profile(
            "admin_123"
        )
        assert profile["user_id"] == "admin_123"
        assert profile["activity_summary"]["total_events_7d"] == 1

    @pytest.mark.asyncio
    async def test_compliance_with_encryption(
        self, compliance_service, encryption_service
    ):
        """Test integration between compliance and encryption."""
        # Record consent for data processing
        await compliance_service.record_consent(
            user_id="compliance_user",
            consent_type=ConsentType.DATA_PROCESSING,
            granted=True,
            data_categories=[DataCategory.PERSONAL_DATA],
            legal_basis="Consent",
        )

        # Create encryption key
        key = await encryption_service.create_role_based_key(
            key_id="compliance_key",
            role_access=["user"],
            algorithm=EncryptionAlgorithm.AES_256_GCM,
        )

        # Encrypt personal data
        encrypted_data = await encryption_service.encrypt_data(
            data="Personal data: John Doe, john@example.com",
            key_id=key.key_id,
            user_roles=["user"],
            resource_type=ResourceType.NOTE,
            resource_id="personal_note_1",
        )

        # Log data access for compliance
        await compliance_service.log_data_access(
            user_id="compliance_user",
            accessed_by="user",
            resource_type=ResourceType.NOTE,
            resource_id="personal_note_1",
            operation=Operation.CREATE,
            data_categories=[DataCategory.PERSONAL_DATA],
            purpose="Data encryption",
            legal_basis="Consent",
        )

        # Get user data summary
        summary = await compliance_service.get_user_data_summary("compliance_user")

        assert summary["user_id"] == "compliance_user"
        assert len(summary["consent_records"]) == 1
        assert summary["data_access_summary"]["total_accesses"] == 1
        assert "personal_data" in summary["data_categories_processed"]

    @pytest.mark.asyncio
    async def test_complete_security_workflow(
        self, security_monitoring_service, encryption_service, compliance_service
    ):
        """Test complete security workflow integration."""
        user_id = "workflow_user"

        # 1. Record consent
        await compliance_service.record_consent(
            user_id=user_id,
            consent_type=ConsentType.DATA_PROCESSING,
            granted=True,
            data_categories=[DataCategory.PERSONAL_DATA, DataCategory.TECHNICAL_DATA],
        )

        # 2. Create encryption key
        key = await encryption_service.create_role_based_key(
            key_id="workflow_key",
            role_access=["user"],
            algorithm=EncryptionAlgorithm.AES_256_GCM,
        )

        # 3. Encrypt sensitive data
        sensitive_data = "User profile: sensitive information"
        encrypted_data = await encryption_service.encrypt_data(
            data=sensitive_data,
            key_id=key.key_id,
            user_roles=["user"],
            resource_type=ResourceType.NOTE,
            resource_id="profile_note",
        )

        # 4. Log data access for compliance
        await compliance_service.log_data_access(
            user_id=user_id,
            accessed_by="user",
            resource_type=ResourceType.NOTE,
            resource_id="profile_note",
            operation=Operation.CREATE,
            data_categories=[DataCategory.PERSONAL_DATA],
            purpose="Profile creation",
            legal_basis="Consent",
        )

        # 5. Create audit event for security monitoring
        audit_event = AuditEvent(
            event_type=AuditEventType.RESOURCE_ACCESS_GRANTED,
            username="workflow_user",
            user_id=user_id,
            success=True,
            resource_type="note",
            resource_id="profile_note",
            operation="create",
        )
        await security_monitoring_service.log_audit_event(audit_event)

        # 6. Verify all systems are working together
        # Check compliance
        has_consent = await compliance_service.check_consent(
            user_id=user_id,
            consent_type=ConsentType.DATA_PROCESSING,
            data_categories=[DataCategory.PERSONAL_DATA],
        )
        assert has_consent is True

        # Check encryption
        decrypted_data = await encryption_service.decrypt_data(
            encrypted_data=encrypted_data, user_roles=["user"]
        )
        assert decrypted_data.decode('utf-8') == sensitive_data

        # Check security monitoring
        profile = await security_monitoring_service.get_user_security_profile(user_id)
        assert profile["user_id"] == user_id
        assert profile["activity_summary"]["total_events_7d"] == 1

        # Check compliance summary
        summary = await compliance_service.get_user_data_summary(user_id)
        assert summary["user_id"] == user_id
        assert len(summary["consent_records"]) == 1
        assert summary["data_access_summary"]["total_accesses"] == 1


if __name__ == "__main__":
    pytest.main([__file__])
