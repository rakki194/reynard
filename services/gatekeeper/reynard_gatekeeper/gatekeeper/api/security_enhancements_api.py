"""Security Enhancements API endpoints.

This module provides REST API endpoints for security enhancement features including:
- Security monitoring and anomaly detection
- Encryption and key management
- Compliance and GDPR tools

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from ..core.audit_service import AuditService
from ..core.auth_manager import AuthManager
from ..core.dependencies import get_auth_manager
from ..services.compliance_service import (
    ComplianceService,
    ConsentRecord,
    ConsentType,
    DataCategory,
    DataRetentionPolicy,
    DataSubjectRequest,
    DataSubjectRight,
    RetentionPeriod,
)
from ..services.encryption_service import (
    EncryptedData,
    EncryptionAlgorithm,
    EncryptionLevel,
    EncryptionService,
    KeyType,
)
from ..services.security_monitoring_service import (
    AnomalyType,
    SecurityAlert,
    SecurityMonitoringService,
    ThreatLevel,
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/security", tags=["Security Enhancements"])


# Request/Response Models


class SecurityDashboardResponse(BaseModel):
    """Response model for security dashboard data."""

    timestamp: str
    active_alerts: Dict[str, Any]
    security_metrics: Dict[str, Any]
    activity_summary: Dict[str, Any]
    configuration: Dict[str, Any]


class UserSecurityProfileResponse(BaseModel):
    """Response model for user security profile."""

    user_id: str
    timestamp: str
    activity_summary: Dict[str, Any]
    active_alerts: List[Dict[str, Any]]
    risk_score: float


class EncryptionKeyRequest(BaseModel):
    """Request model for creating encryption keys."""

    key_id: str
    role_access: List[str]
    algorithm: Optional[EncryptionAlgorithm] = None
    encryption_level: EncryptionLevel = EncryptionLevel.BASIC
    expires_in_days: Optional[int] = None


class EncryptionKeyResponse(BaseModel):
    """Response model for encryption keys."""

    key_id: str
    key_type: KeyType
    algorithm: EncryptionAlgorithm
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool
    role_access: List[str]


class EncryptDataRequest(BaseModel):
    """Request model for encrypting data."""

    data: Union[str, bytes]
    key_id: str
    user_roles: List[str]
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class EncryptDataResponse(BaseModel):
    """Response model for encrypted data."""

    encrypted_data: str  # Base64 encoded
    key_id: str
    algorithm: EncryptionAlgorithm
    iv: Optional[str] = None
    tag: Optional[str] = None
    metadata: Dict[str, Any]
    encrypted_at: datetime


class DecryptDataRequest(BaseModel):
    """Request model for decrypting data."""

    encrypted_data: str  # Base64 encoded
    key_id: str
    algorithm: EncryptionAlgorithm
    iv: Optional[str] = None
    tag: Optional[str] = None
    user_roles: List[str]


class SecureShareRequest(BaseModel):
    """Request model for creating secure shares."""

    data: Union[str, bytes]
    sharing_roles: List[str]
    recipient_roles: List[str]
    expires_in_hours: Optional[int] = None


class SecureShareResponse(BaseModel):
    """Response model for secure shares."""

    share_id: str
    encrypted_data: Dict[str, Any]
    recipient_roles: List[str]
    created_at: str
    expires_at: Optional[str] = None
    created_by: Optional[str] = None


class DataRetentionPolicyRequest(BaseModel):
    """Request model for creating retention policies."""

    name: str
    description: str
    resource_type: str
    data_category: DataCategory
    retention_period: RetentionPeriod
    auto_delete: bool = True
    legal_basis: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class DataRetentionPolicyResponse(BaseModel):
    """Response model for retention policies."""

    id: str
    name: str
    description: str
    resource_type: str
    data_category: DataCategory
    retention_period: RetentionPeriod
    retention_days: int
    auto_delete: bool
    legal_basis: Optional[str] = None
    created_at: datetime
    is_active: bool


class ConsentRequest(BaseModel):
    """Request model for recording consent."""

    user_id: str
    consent_type: ConsentType
    granted: bool
    legal_basis: Optional[str] = None
    purpose: Optional[str] = None
    data_categories: Optional[List[DataCategory]] = None
    retention_period: Optional[RetentionPeriod] = None
    metadata: Optional[Dict[str, Any]] = None


class ConsentResponse(BaseModel):
    """Response model for consent records."""

    id: str
    user_id: str
    consent_type: ConsentType
    granted: bool
    granted_at: Optional[datetime] = None
    withdrawn_at: Optional[datetime] = None
    legal_basis: Optional[str] = None
    purpose: Optional[str] = None
    data_categories: List[DataCategory]
    retention_period: Optional[RetentionPeriod] = None


class DataSubjectRequestRequest(BaseModel):
    """Request model for data subject requests."""

    user_id: str
    request_type: DataSubjectRight
    description: Optional[str] = None
    legal_basis: Optional[str] = None


class DataSubjectRequestResponse(BaseModel):
    """Response model for data subject requests."""

    id: str
    user_id: str
    request_type: DataSubjectRight
    status: str
    requested_at: datetime
    completed_at: Optional[datetime] = None
    description: Optional[str] = None
    legal_basis: Optional[str] = None


class ComplianceReportRequest(BaseModel):
    """Request model for compliance reports."""

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ComplianceReportResponse(BaseModel):
    """Response model for compliance reports."""

    report_period: Dict[str, Any]
    data_access_statistics: Dict[str, Any]
    consent_statistics: Dict[str, Any]
    data_subject_requests: Dict[str, Any]
    retention_policy_statistics: Dict[str, Any]
    compliance_status: Dict[str, Any]


# Dependency injection


def get_security_monitoring_service(
    auth_manager: AuthManager = Depends(get_auth_manager),
) -> SecurityMonitoringService:
    """Get SecurityMonitoringService instance."""
    audit_service = AuditService()
    return SecurityMonitoringService(audit_service)


def get_encryption_service(
    auth_manager: AuthManager = Depends(get_auth_manager),
) -> EncryptionService:
    """Get EncryptionService instance."""
    audit_service = AuditService()
    return EncryptionService(audit_service)


def get_compliance_service(
    auth_manager: AuthManager = Depends(get_auth_manager),
) -> ComplianceService:
    """Get ComplianceService instance."""
    audit_service = AuditService()
    return ComplianceService(audit_service)


# Security Monitoring Endpoints


@router.get("/dashboard", response_model=SecurityDashboardResponse)
async def get_security_dashboard(
    security_monitoring: SecurityMonitoringService = Depends(
        get_security_monitoring_service
    ),
):
    """Get security dashboard data."""
    try:
        dashboard_data = await security_monitoring.get_security_dashboard_data()
        return SecurityDashboardResponse(**dashboard_data)
    except Exception as e:
        logger.error(f"Failed to get security dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security dashboard: {str(e)}",
        )


@router.get(
    "/users/{user_id}/security-profile", response_model=UserSecurityProfileResponse
)
async def get_user_security_profile(
    user_id: str,
    security_monitoring: SecurityMonitoringService = Depends(
        get_security_monitoring_service
    ),
):
    """Get security profile for a specific user."""
    try:
        profile_data = await security_monitoring.get_user_security_profile(user_id)
        return UserSecurityProfileResponse(**profile_data)
    except Exception as e:
        logger.error(f"Failed to get user security profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user security profile: {str(e)}",
        )


@router.get("/alerts")
async def get_security_alerts(
    threat_level: Optional[ThreatLevel] = Query(
        None, description="Filter by threat level"
    ),
    resolved: Optional[bool] = Query(None, description="Filter by resolved status"),
    security_monitoring: SecurityMonitoringService = Depends(
        get_security_monitoring_service
    ),
):
    """Get security alerts."""
    try:
        alerts = list(security_monitoring.active_alerts.values())

        # Apply filters
        if threat_level:
            alerts = [alert for alert in alerts if alert.threat_level == threat_level]
        if resolved is not None:
            alerts = [alert for alert in alerts if alert.resolved == resolved]

        return {
            "alerts": [
                {
                    "id": alert.id,
                    "alert_type": alert.alert_type,
                    "threat_level": alert.threat_level.value,
                    "title": alert.title,
                    "description": alert.description,
                    "username": alert.username,
                    "ip_address": alert.ip_address,
                    "timestamp": alert.timestamp.isoformat(),
                    "resolved": alert.resolved,
                    "context": alert.context,
                }
                for alert in alerts
            ],
            "total_count": len(alerts),
        }
    except Exception as e:
        logger.error(f"Failed to get security alerts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security alerts: {str(e)}",
        )


# Encryption Endpoints


@router.post("/encryption/keys", response_model=EncryptionKeyResponse)
async def create_encryption_key(
    request: EncryptionKeyRequest,
    encryption_service: EncryptionService = Depends(get_encryption_service),
):
    """Create a role-based encryption key."""
    try:
        key = await encryption_service.create_role_based_key(
            key_id=request.key_id,
            role_access=request.role_access,
            algorithm=request.algorithm,
            encryption_level=request.encryption_level,
            expires_in_days=request.expires_in_days,
        )

        return EncryptionKeyResponse(
            key_id=key.key_id,
            key_type=key.key_type,
            algorithm=key.algorithm,
            created_at=key.created_at,
            expires_at=key.expires_at,
            is_active=key.is_active,
            role_access=key.role_access,
        )
    except Exception as e:
        logger.error(f"Failed to create encryption key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create encryption key: {str(e)}",
        )


@router.post("/encryption/encrypt", response_model=EncryptDataResponse)
async def encrypt_data(
    request: EncryptDataRequest,
    encryption_service: EncryptionService = Depends(get_encryption_service),
):
    """Encrypt data using role-based encryption."""
    try:
        from ..models.rbac import ResourceType

        resource_type = None
        if request.resource_type:
            resource_type = ResourceType(request.resource_type)

        encrypted_data = await encryption_service.encrypt_data(
            data=request.data,
            key_id=request.key_id,
            user_roles=request.user_roles,
            resource_type=resource_type,
            resource_id=request.resource_id,
            metadata=request.metadata,
        )

        return EncryptDataResponse(
            encrypted_data=encrypted_data.data.hex(),
            key_id=encrypted_data.key_id,
            algorithm=encrypted_data.algorithm,
            iv=encrypted_data.iv.hex() if encrypted_data.iv else None,
            tag=encrypted_data.tag.hex() if encrypted_data.tag else None,
            metadata=encrypted_data.metadata,
            encrypted_at=encrypted_data.encrypted_at,
        )
    except Exception as e:
        logger.error(f"Failed to encrypt data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to encrypt data: {str(e)}",
        )


@router.post("/encryption/decrypt")
async def decrypt_data(
    request: DecryptDataRequest,
    encryption_service: EncryptionService = Depends(get_encryption_service),
):
    """Decrypt data using role-based encryption."""
    try:
        # Reconstruct EncryptedData object
        encrypted_data = EncryptedData(
            data=bytes.fromhex(request.encrypted_data),
            key_id=request.key_id,
            algorithm=request.algorithm,
            iv=bytes.fromhex(request.iv) if request.iv else None,
            tag=bytes.fromhex(request.tag) if request.tag else None,
        )

        decrypted_data = await encryption_service.decrypt_data(
            encrypted_data=encrypted_data, user_roles=request.user_roles
        )

        return {
            "decrypted_data": decrypted_data.decode('utf-8'),
            "data_size": len(decrypted_data),
        }
    except Exception as e:
        logger.error(f"Failed to decrypt data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to decrypt data: {str(e)}",
        )


@router.post("/encryption/secure-share", response_model=SecureShareResponse)
async def create_secure_share(
    request: SecureShareRequest,
    encryption_service: EncryptionService = Depends(get_encryption_service),
):
    """Create a secure data share."""
    try:
        share_info = await encryption_service.create_secure_share(
            data=request.data,
            sharing_roles=request.sharing_roles,
            recipient_roles=request.recipient_roles,
            expires_in_hours=request.expires_in_hours,
        )

        return SecureShareResponse(**share_info)
    except Exception as e:
        logger.error(f"Failed to create secure share: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create secure share: {str(e)}",
        )


@router.post("/encryption/access-share")
async def access_secure_share(
    share_info: Dict[str, Any],
    user_roles: List[str],
    encryption_service: EncryptionService = Depends(get_encryption_service),
):
    """Access a secure data share."""
    try:
        decrypted_data = await encryption_service.access_secure_share(
            share_info=share_info, user_roles=user_roles
        )

        return {
            "decrypted_data": decrypted_data.decode('utf-8'),
            "data_size": len(decrypted_data),
        }
    except Exception as e:
        logger.error(f"Failed to access secure share: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to access secure share: {str(e)}",
        )


@router.post("/encryption/keys/{key_id}/rotate")
async def rotate_encryption_key(
    key_id: str, encryption_service: EncryptionService = Depends(get_encryption_service)
):
    """Rotate an encryption key."""
    try:
        new_key = await encryption_service.rotate_encryption_key(key_id)

        return {
            "message": "Key rotated successfully",
            "old_key_id": key_id,
            "new_key_id": new_key.key_id,
            "algorithm": new_key.algorithm.value,
        }
    except Exception as e:
        logger.error(f"Failed to rotate encryption key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rotate encryption key: {str(e)}",
        )


@router.get("/encryption/status")
async def get_encryption_status(
    encryption_service: EncryptionService = Depends(get_encryption_service),
):
    """Get encryption service status."""
    try:
        status_data = await encryption_service.get_encryption_status()
        return status_data
    except Exception as e:
        logger.error(f"Failed to get encryption status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get encryption status: {str(e)}",
        )


# Compliance Endpoints


@router.post(
    "/compliance/retention-policies", response_model=DataRetentionPolicyResponse
)
async def create_retention_policy(
    request: DataRetentionPolicyRequest,
    compliance_service: ComplianceService = Depends(get_compliance_service),
):
    """Create a data retention policy."""
    try:
        from ..models.rbac import ResourceType

        policy = await compliance_service.create_retention_policy(
            name=request.name,
            description=request.description,
            resource_type=ResourceType(request.resource_type),
            data_category=request.data_category,
            retention_period=request.retention_period,
            auto_delete=request.auto_delete,
            legal_basis=request.legal_basis,
            metadata=request.metadata,
        )

        return DataRetentionPolicyResponse(
            id=policy.id,
            name=policy.name,
            description=policy.description,
            resource_type=policy.resource_type.value,
            data_category=policy.data_category,
            retention_period=policy.retention_period,
            retention_days=policy.retention_days,
            auto_delete=policy.auto_delete,
            legal_basis=policy.legal_basis,
            created_at=policy.created_at,
            is_active=policy.is_active,
        )
    except Exception as e:
        logger.error(f"Failed to create retention policy: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create retention policy: {str(e)}",
        )


@router.post("/compliance/consent", response_model=ConsentResponse)
async def record_consent(
    request: ConsentRequest,
    compliance_service: ComplianceService = Depends(get_compliance_service),
):
    """Record user consent."""
    try:
        consent_record = await compliance_service.record_consent(
            user_id=request.user_id,
            consent_type=request.consent_type,
            granted=request.granted,
            legal_basis=request.legal_basis,
            purpose=request.purpose,
            data_categories=request.data_categories,
            retention_period=request.retention_period,
            metadata=request.metadata,
        )

        return ConsentResponse(
            id=consent_record.id,
            user_id=consent_record.user_id,
            consent_type=consent_record.consent_type,
            granted=consent_record.granted,
            granted_at=consent_record.granted_at,
            withdrawn_at=consent_record.withdrawn_at,
            legal_basis=consent_record.legal_basis,
            purpose=consent_record.purpose,
            data_categories=consent_record.data_categories,
            retention_period=consent_record.retention_period,
        )
    except Exception as e:
        logger.error(f"Failed to record consent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record consent: {str(e)}",
        )


@router.get("/compliance/consent/{user_id}")
async def check_consent(
    user_id: str,
    consent_type: ConsentType,
    data_categories: Optional[List[DataCategory]] = Query(None),
    compliance_service: ComplianceService = Depends(get_compliance_service),
):
    """Check if user has given consent."""
    try:
        has_consent = await compliance_service.check_consent(
            user_id=user_id, consent_type=consent_type, data_categories=data_categories
        )

        return {
            "user_id": user_id,
            "consent_type": consent_type.value,
            "has_consent": has_consent,
            "data_categories": (
                [cat.value for cat in data_categories] if data_categories else None
            ),
        }
    except Exception as e:
        logger.error(f"Failed to check consent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check consent: {str(e)}",
        )


@router.post(
    "/compliance/data-subject-requests", response_model=DataSubjectRequestResponse
)
async def create_data_subject_request(
    request: DataSubjectRequestRequest,
    compliance_service: ComplianceService = Depends(get_compliance_service),
):
    """Create a data subject request (GDPR right)."""
    try:
        data_request = await compliance_service.create_data_subject_request(
            user_id=request.user_id,
            request_type=request.request_type,
            description=request.description,
            legal_basis=request.legal_basis,
        )

        return DataSubjectRequestResponse(
            id=data_request.id,
            user_id=data_request.user_id,
            request_type=data_request.request_type,
            status=data_request.status,
            requested_at=data_request.requested_at,
            completed_at=data_request.completed_at,
            description=data_request.description,
            legal_basis=data_request.legal_basis,
        )
    except Exception as e:
        logger.error(f"Failed to create data subject request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create data subject request: {str(e)}",
        )


@router.get("/compliance/users/{user_id}/data-summary")
async def get_user_data_summary(
    user_id: str,
    compliance_service: ComplianceService = Depends(get_compliance_service),
):
    """Get comprehensive data summary for a user (GDPR Article 15)."""
    try:
        summary = await compliance_service.get_user_data_summary(user_id)
        return summary
    except Exception as e:
        logger.error(f"Failed to get user data summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user data summary: {str(e)}",
        )


@router.post("/compliance/retention/apply")
async def apply_data_retention(
    resource_type: str,
    compliance_service: ComplianceService = Depends(get_compliance_service),
):
    """Apply data retention policies to resources."""
    try:
        from ..models.rbac import ResourceType

        results = await compliance_service.apply_data_retention(
            ResourceType(resource_type)
        )
        return results
    except Exception as e:
        logger.error(f"Failed to apply data retention: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply data retention: {str(e)}",
        )


@router.post("/compliance/reports", response_model=ComplianceReportResponse)
async def generate_compliance_report(
    request: ComplianceReportRequest,
    compliance_service: ComplianceService = Depends(get_compliance_service),
):
    """Generate comprehensive compliance report."""
    try:
        report = await compliance_service.generate_compliance_report(
            start_date=request.start_date, end_date=request.end_date
        )
        return ComplianceReportResponse(**report)
    except Exception as e:
        logger.error(f"Failed to generate compliance report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate compliance report: {str(e)}",
        )


@router.get("/compliance/status")
async def get_compliance_status(
    compliance_service: ComplianceService = Depends(get_compliance_service),
):
    """Get current compliance status."""
    try:
        status_data = await compliance_service.get_compliance_status()
        return status_data
    except Exception as e:
        logger.error(f"Failed to get compliance status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get compliance status: {str(e)}",
        )


# Utility Endpoints


@router.get("/health")
async def health_check():
    """Health check endpoint for security enhancements."""
    return {
        "status": "healthy",
        "service": "security-enhancements",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "features": [
            "security_monitoring",
            "anomaly_detection",
            "encryption",
            "key_management",
            "compliance",
            "gdpr_tools",
            "data_retention",
        ],
    }


@router.get("/features")
async def get_features():
    """Get available security enhancement features."""
    return {
        "security_monitoring": {
            "description": "Real-time security monitoring and threat detection",
            "endpoints": [
                "GET /dashboard",
                "GET /users/{user_id}/security-profile",
                "GET /alerts",
            ],
        },
        "encryption": {
            "description": "Role-based data encryption and key management",
            "endpoints": [
                "POST /encryption/keys",
                "POST /encryption/encrypt",
                "POST /encryption/decrypt",
                "POST /encryption/secure-share",
                "POST /encryption/keys/{key_id}/rotate",
            ],
        },
        "compliance": {
            "description": "GDPR compliance and data retention management",
            "endpoints": [
                "POST /compliance/retention-policies",
                "POST /compliance/consent",
                "GET /compliance/consent/{user_id}",
                "POST /compliance/data-subject-requests",
                "GET /compliance/users/{user_id}/data-summary",
                "POST /compliance/reports",
            ],
        },
    }
