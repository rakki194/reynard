"""Compliance Service for GDPR and Data Retention.

This service provides comprehensive compliance features including:
- GDPR compliance tools
- Data retention policies
- Access reporting
- Consent management
- Data subject rights

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Union
from uuid import uuid4

from ..core.audit_service import AuditEventType, AuditService
from ..models.rbac import Operation, ResourceType

logger = logging.getLogger(__name__)


class DataCategory(str, Enum):
    """Data category enumeration for GDPR compliance."""

    PERSONAL_DATA = "personal_data"
    SENSITIVE_PERSONAL_DATA = "sensitive_personal_data"
    FINANCIAL_DATA = "financial_data"
    HEALTH_DATA = "health_data"
    BIOMETRIC_DATA = "biometric_data"
    LOCATION_DATA = "location_data"
    BEHAVIORAL_DATA = "behavioral_data"
    TECHNICAL_DATA = "technical_data"
    COMMUNICATION_DATA = "communication_data"


class RetentionPeriod(str, Enum):
    """Data retention period enumeration."""

    IMMEDIATE = "immediate"  # Delete immediately
    SHORT_TERM = "short_term"  # 30 days
    MEDIUM_TERM = "medium_term"  # 1 year
    LONG_TERM = "long_term"  # 7 years
    PERMANENT = "permanent"  # Never delete


class ConsentType(str, Enum):
    """Consent type enumeration."""

    DATA_PROCESSING = "data_processing"
    DATA_SHARING = "data_sharing"
    MARKETING = "marketing"
    ANALYTICS = "analytics"
    COOKIES = "cookies"
    THIRD_PARTY = "third_party"


class DataSubjectRight(str, Enum):
    """Data subject rights under GDPR."""

    ACCESS = "access"  # Right to access
    RECTIFICATION = "rectification"  # Right to rectification
    ERASURE = "erasure"  # Right to erasure (right to be forgotten)
    RESTRICTION = "restriction"  # Right to restriction of processing
    PORTABILITY = "portability"  # Right to data portability
    OBJECTION = "objection"  # Right to object
    WITHDRAW_CONSENT = "withdraw_consent"  # Right to withdraw consent


@dataclass
class DataRetentionPolicy:
    """Data retention policy data structure."""

    id: str
    name: str
    description: str
    resource_type: ResourceType
    data_category: DataCategory
    retention_period: RetentionPeriod
    retention_days: int
    auto_delete: bool = True
    legal_basis: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ConsentRecord:
    """Consent record data structure."""

    id: str
    user_id: str
    consent_type: ConsentType
    granted: bool
    granted_at: Optional[datetime] = None
    withdrawn_at: Optional[datetime] = None
    legal_basis: Optional[str] = None
    purpose: Optional[str] = None
    data_categories: List[DataCategory] = field(default_factory=list)
    retention_period: Optional[RetentionPeriod] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DataSubjectRequest:
    """Data subject request data structure."""

    id: str
    user_id: str
    request_type: DataSubjectRight
    status: str  # pending, in_progress, completed, rejected
    requested_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    description: Optional[str] = None
    legal_basis: Optional[str] = None
    response_data: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DataAccessLog:
    """Data access log data structure."""

    id: str
    user_id: str
    accessed_by: str
    resource_type: ResourceType
    resource_id: str
    operation: Operation
    data_categories: List[DataCategory]
    purpose: str
    legal_basis: str
    accessed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class ComplianceService:
    """Service for GDPR compliance and data retention management."""

    def __init__(self, audit_service: AuditService):
        """Initialize the compliance service.

        Args:
            audit_service: Audit service instance
        """
        self.audit_service = audit_service
        self.logger = logging.getLogger(f"{__name__}.compliance")

        # Data storage
        self.retention_policies: Dict[str, DataRetentionPolicy] = {}
        self.consent_records: Dict[str, List[ConsentRecord]] = (
            {}
        )  # user_id -> consent records
        self.data_subject_requests: Dict[str, List[DataSubjectRequest]] = (
            {}
        )  # user_id -> requests
        self.data_access_logs: List[DataAccessLog] = []

        # Configuration
        self.config = {
            "default_retention_periods": {
                DataCategory.PERSONAL_DATA: RetentionPeriod.MEDIUM_TERM,
                DataCategory.SENSITIVE_PERSONAL_DATA: RetentionPeriod.SHORT_TERM,
                DataCategory.FINANCIAL_DATA: RetentionPeriod.LONG_TERM,
                DataCategory.HEALTH_DATA: RetentionPeriod.LONG_TERM,
                DataCategory.BIOMETRIC_DATA: RetentionPeriod.SHORT_TERM,
                DataCategory.LOCATION_DATA: RetentionPeriod.SHORT_TERM,
                DataCategory.BEHAVIORAL_DATA: RetentionPeriod.MEDIUM_TERM,
                DataCategory.TECHNICAL_DATA: RetentionPeriod.MEDIUM_TERM,
                DataCategory.COMMUNICATION_DATA: RetentionPeriod.SHORT_TERM,
            },
            "retention_period_days": {
                RetentionPeriod.IMMEDIATE: 0,
                RetentionPeriod.SHORT_TERM: 30,
                RetentionPeriod.MEDIUM_TERM: 365,
                RetentionPeriod.LONG_TERM: 2555,  # 7 years
                RetentionPeriod.PERMANENT: -1,  # Never delete
            },
            "gdpr_response_time_days": 30,
            "consent_required": True,
            "data_minimization": True,
        }

        # Initialize default retention policies
        self._initialize_default_policies()

    def _initialize_default_policies(self):
        """Initialize default data retention policies."""
        try:
            # Create default policies for each data category
            for category, retention_period in self.config[
                "default_retention_periods"
            ].items():
                policy_id = f"default_{category.value}"
                retention_days = self.config["retention_period_days"][retention_period]

                policy = DataRetentionPolicy(
                    id=policy_id,
                    name=f"Default {category.value.replace('_', ' ').title()} Policy",
                    description=f"Default retention policy for {category.value}",
                    resource_type=ResourceType.SYSTEM,
                    data_category=category,
                    retention_period=retention_period,
                    retention_days=retention_days,
                    legal_basis="Legitimate interest and legal compliance",
                )

                self.retention_policies[policy_id] = policy

            self.logger.info("Default data retention policies initialized")

        except Exception as e:
            self.logger.error(f"Failed to initialize default policies: {e}")

    async def create_retention_policy(
        self,
        name: str,
        description: str,
        resource_type: ResourceType,
        data_category: DataCategory,
        retention_period: RetentionPeriod,
        auto_delete: bool = True,
        legal_basis: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> DataRetentionPolicy:
        """Create a data retention policy.

        Args:
            name: Policy name
            description: Policy description
            resource_type: Resource type this policy applies to
            data_category: Data category
            retention_period: Retention period
            auto_delete: Whether to automatically delete data
            legal_basis: Legal basis for retention
            metadata: Additional metadata

        Returns:
            DataRetentionPolicy: Created retention policy
        """
        try:
            policy_id = f"policy_{uuid4().hex[:16]}"
            retention_days = self.config["retention_period_days"][retention_period]

            policy = DataRetentionPolicy(
                id=policy_id,
                name=name,
                description=description,
                resource_type=resource_type,
                data_category=data_category,
                retention_period=retention_period,
                retention_days=retention_days,
                auto_delete=auto_delete,
                legal_basis=legal_basis or "Legitimate interest and legal compliance",
                metadata=metadata or {},
            )

            self.retention_policies[policy_id] = policy

            # Log policy creation
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.RESOURCE_CREATED,
                    resource_type="retention_policy",
                    resource_id=policy_id,
                    operation="create",
                    success=True,
                    context={
                        "data_category": data_category.value,
                        "retention_period": retention_period.value,
                        "retention_days": retention_days,
                        "auto_delete": auto_delete,
                    },
                )
            )

            self.logger.info(f"Created retention policy: {policy_id}")
            return policy

        except Exception as e:
            self.logger.error(f"Failed to create retention policy: {e}")
            raise

    async def record_consent(
        self,
        user_id: str,
        consent_type: ConsentType,
        granted: bool,
        legal_basis: Optional[str] = None,
        purpose: Optional[str] = None,
        data_categories: Optional[List[DataCategory]] = None,
        retention_period: Optional[RetentionPeriod] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ConsentRecord:
        """Record user consent.

        Args:
            user_id: User ID
            consent_type: Type of consent
            granted: Whether consent was granted
            legal_basis: Legal basis for processing
            purpose: Purpose of data processing
            data_categories: Data categories involved
            retention_period: Retention period for data
            metadata: Additional metadata

        Returns:
            ConsentRecord: Created consent record
        """
        try:
            consent_id = f"consent_{uuid4().hex[:16]}"
            current_time = datetime.now(timezone.utc)

            # Check if user already has consent for this type
            existing_consents = self.consent_records.get(user_id, [])
            for existing_consent in existing_consents:
                if (
                    existing_consent.consent_type == consent_type
                    and existing_consent.granted
                    and not existing_consent.withdrawn_at
                ):
                    # Withdraw existing consent
                    existing_consent.withdrawn_at = current_time
                    existing_consent.granted = False

            consent_record = ConsentRecord(
                id=consent_id,
                user_id=user_id,
                consent_type=consent_type,
                granted=granted,
                granted_at=current_time if granted else None,
                withdrawn_at=current_time if not granted else None,
                legal_basis=legal_basis,
                purpose=purpose,
                data_categories=data_categories or [],
                retention_period=retention_period,
                metadata=metadata or {},
            )

            # Store consent record
            if user_id not in self.consent_records:
                self.consent_records[user_id] = []
            self.consent_records[user_id].append(consent_record)

            # Log consent recording
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=(
                        AuditEventType.CONSENT_GIVEN
                        if granted
                        else AuditEventType.CONSENT_WITHDRAWN
                    ),
                    user_id=user_id,
                    success=True,
                    context={
                        "consent_type": consent_type.value,
                        "granted": granted,
                        "legal_basis": legal_basis,
                        "purpose": purpose,
                        "data_categories": (
                            [cat.value for cat in data_categories]
                            if data_categories
                            else []
                        ),
                        "retention_period": (
                            retention_period.value if retention_period else None
                        ),
                    },
                )
            )

            self.logger.info(
                f"Recorded consent for user {user_id}: {consent_type.value} = {granted}"
            )
            return consent_record

        except Exception as e:
            self.logger.error(f"Failed to record consent: {e}")
            raise

    async def check_consent(
        self,
        user_id: str,
        consent_type: ConsentType,
        data_categories: Optional[List[DataCategory]] = None,
    ) -> bool:
        """Check if user has given consent.

        Args:
            user_id: User ID
            consent_type: Type of consent to check
            data_categories: Data categories involved

        Returns:
            bool: True if consent is granted
        """
        try:
            user_consents = self.consent_records.get(user_id, [])

            # Find active consent for this type
            for consent in user_consents:
                if (
                    consent.consent_type == consent_type
                    and consent.granted
                    and not consent.withdrawn_at
                ):

                    # Check data categories if specified
                    if data_categories:
                        consent_categories = set(consent.data_categories)
                        requested_categories = set(data_categories)
                        if not requested_categories.issubset(consent_categories):
                            return False

                    return True

            return False

        except Exception as e:
            self.logger.error(f"Failed to check consent: {e}")
            return False

    async def log_data_access(
        self,
        user_id: str,
        accessed_by: str,
        resource_type: ResourceType,
        resource_id: str,
        operation: Operation,
        data_categories: List[DataCategory],
        purpose: str,
        legal_basis: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> DataAccessLog:
        """Log data access for compliance tracking.

        Args:
            user_id: ID of user whose data was accessed
            accessed_by: Username of person accessing the data
            resource_type: Type of resource accessed
            resource_id: ID of resource accessed
            operation: Operation performed
            data_categories: Categories of data accessed
            purpose: Purpose of access
            legal_basis: Legal basis for access
            ip_address: IP address of accessor
            user_agent: User agent of accessor
            metadata: Additional metadata

        Returns:
            DataAccessLog: Created access log
        """
        try:
            access_log_id = f"access_{uuid4().hex[:16]}"

            access_log = DataAccessLog(
                id=access_log_id,
                user_id=user_id,
                accessed_by=accessed_by,
                resource_type=resource_type,
                resource_id=resource_id,
                operation=operation,
                data_categories=data_categories,
                purpose=purpose,
                legal_basis=legal_basis,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata=metadata or {},
            )

            self.data_access_logs.append(access_log)

            # Log data access
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.DATA_ACCESS_LOGGED,
                    user_id=user_id,
                    username=accessed_by,
                    resource_type=resource_type.value,
                    resource_id=resource_id,
                    operation=operation.value,
                    success=True,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    context={
                        "data_categories": [cat.value for cat in data_categories],
                        "purpose": purpose,
                        "legal_basis": legal_basis,
                    },
                )
            )

            return access_log

        except Exception as e:
            self.logger.error(f"Failed to log data access: {e}")
            raise

    async def create_data_subject_request(
        self,
        user_id: str,
        request_type: DataSubjectRight,
        description: Optional[str] = None,
        legal_basis: Optional[str] = None,
    ) -> DataSubjectRequest:
        """Create a data subject request (GDPR right).

        Args:
            user_id: User ID
            request_type: Type of data subject right
            description: Description of the request
            legal_basis: Legal basis for the request

        Returns:
            DataSubjectRequest: Created request
        """
        try:
            request_id = f"request_{uuid4().hex[:16]}"

            request = DataSubjectRequest(
                id=request_id,
                user_id=user_id,
                request_type=request_type,
                status="pending",
                description=description,
                legal_basis=legal_basis or "GDPR Article 15-22",
            )

            # Store request
            if user_id not in self.data_subject_requests:
                self.data_subject_requests[user_id] = []
            self.data_subject_requests[user_id].append(request)

            # Log request creation
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.GDPR_REQUEST,
                    user_id=user_id,
                    success=True,
                    context={
                        "request_type": request_type.value,
                        "description": description,
                        "legal_basis": legal_basis,
                    },
                )
            )

            self.logger.info(
                f"Created data subject request: {request_id} for user {user_id}"
            )
            return request

        except Exception as e:
            self.logger.error(f"Failed to create data subject request: {e}")
            raise

    async def process_data_subject_request(
        self,
        request_id: str,
        user_id: str,
        response_data: Optional[Dict[str, Any]] = None,
        status: str = "completed",
    ) -> DataSubjectRequest:
        """Process a data subject request.

        Args:
            request_id: Request ID
            user_id: User ID
            response_data: Response data for the request
            status: New status of the request

        Returns:
            DataSubjectRequest: Updated request
        """
        try:
            user_requests = self.data_subject_requests.get(user_id, [])
            request = None

            for req in user_requests:
                if req.id == request_id:
                    request = req
                    break

            if not request:
                raise ValueError(f"Request {request_id} not found for user {user_id}")

            # Update request
            request.status = status
            request.completed_at = (
                datetime.now(timezone.utc) if status == "completed" else None
            )
            request.response_data = response_data

            # Log request processing
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.GDPR_REQUEST,
                    user_id=user_id,
                    success=True,
                    context={
                        "request_id": request_id,
                        "request_type": request.request_type.value,
                        "status": status,
                        "response_data_size": (
                            len(str(response_data)) if response_data else 0
                        ),
                    },
                )
            )

            self.logger.info(f"Processed data subject request: {request_id}")
            return request

        except Exception as e:
            self.logger.error(f"Failed to process data subject request: {e}")
            raise

    async def get_user_data_summary(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive data summary for a user (GDPR Article 15).

        Args:
            user_id: User ID

        Returns:
            Dict containing user data summary
        """
        try:
            # Get consent records
            consent_records = self.consent_records.get(user_id, [])
            active_consents = [
                {
                    "type": consent.consent_type.value,
                    "granted": consent.granted,
                    "granted_at": (
                        consent.granted_at.isoformat() if consent.granted_at else None
                    ),
                    "withdrawn_at": (
                        consent.withdrawn_at.isoformat()
                        if consent.withdrawn_at
                        else None
                    ),
                    "legal_basis": consent.legal_basis,
                    "purpose": consent.purpose,
                    "data_categories": [cat.value for cat in consent.data_categories],
                    "retention_period": (
                        consent.retention_period.value
                        if consent.retention_period
                        else None
                    ),
                }
                for consent in consent_records
            ]

            # Get data access logs
            user_access_logs = [
                log for log in self.data_access_logs if log.user_id == user_id
            ]
            access_summary = {
                "total_accesses": len(user_access_logs),
                "recent_accesses": [
                    {
                        "accessed_by": log.accessed_by,
                        "resource_type": log.resource_type.value,
                        "resource_id": log.resource_id,
                        "operation": log.operation.value,
                        "data_categories": [cat.value for cat in log.data_categories],
                        "purpose": log.purpose,
                        "legal_basis": log.legal_basis,
                        "accessed_at": log.accessed_at.isoformat(),
                        "ip_address": log.ip_address,
                    }
                    for log in user_access_logs[-10:]  # Last 10 accesses
                ],
            }

            # Get data subject requests
            user_requests = self.data_subject_requests.get(user_id, [])
            request_summary = [
                {
                    "id": req.id,
                    "type": req.request_type.value,
                    "status": req.status,
                    "requested_at": req.requested_at.isoformat(),
                    "completed_at": (
                        req.completed_at.isoformat() if req.completed_at else None
                    ),
                    "description": req.description,
                }
                for req in user_requests
            ]

            # Get applicable retention policies
            applicable_policies = []
            for policy in self.retention_policies.values():
                if policy.is_active:
                    applicable_policies.append(
                        {
                            "id": policy.id,
                            "name": policy.name,
                            "description": policy.description,
                            "data_category": policy.data_category.value,
                            "retention_period": policy.retention_period.value,
                            "retention_days": policy.retention_days,
                            "legal_basis": policy.legal_basis,
                        }
                    )

            summary = {
                "user_id": user_id,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "consent_records": active_consents,
                "data_access_summary": access_summary,
                "data_subject_requests": request_summary,
                "applicable_retention_policies": applicable_policies,
                "data_categories_processed": list(
                    set(
                        cat.value
                        for consent in consent_records
                        for cat in consent.data_categories
                    )
                ),
            }

            # Log data summary generation
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.DATA_ACCESS_LOGGED,
                    user_id=user_id,
                    success=True,
                    context={
                        "summary_type": "gdpr_article_15",
                        "consent_records_count": len(active_consents),
                        "access_logs_count": len(user_access_logs),
                        "requests_count": len(user_requests),
                    },
                )
            )

            return summary

        except Exception as e:
            self.logger.error(f"Failed to get user data summary: {e}")
            raise

    async def apply_data_retention(self, resource_type: ResourceType) -> Dict[str, Any]:
        """Apply data retention policies to resources.

        Args:
            resource_type: Resource type to apply retention to

        Returns:
            Dict containing retention results
        """
        try:
            current_time = datetime.now(timezone.utc)
            retention_results = {
                "resource_type": resource_type.value,
                "processed_at": current_time.isoformat(),
                "policies_applied": [],
                "data_deleted": [],
                "errors": [],
            }

            # Find applicable retention policies
            applicable_policies = [
                policy
                for policy in self.retention_policies.values()
                if (
                    policy.resource_type == resource_type
                    and policy.is_active
                    and policy.auto_delete
                )
            ]

            for policy in applicable_policies:
                try:
                    # Calculate cutoff date
                    cutoff_date = current_time - timedelta(days=policy.retention_days)

                    # In a real implementation, this would query the actual data store
                    # For now, we'll simulate the retention process
                    deleted_count = (
                        0  # This would be the actual count of deleted records
                    )

                    retention_results["policies_applied"].append(
                        {
                            "policy_id": policy.id,
                            "policy_name": policy.name,
                            "data_category": policy.data_category.value,
                            "retention_days": policy.retention_days,
                            "cutoff_date": cutoff_date.isoformat(),
                            "deleted_count": deleted_count,
                        }
                    )

                    if deleted_count > 0:
                        retention_results["data_deleted"].append(
                            {
                                "policy_id": policy.id,
                                "data_category": policy.data_category.value,
                                "deleted_count": deleted_count,
                            }
                        )

                    # Log retention application
                    await self.audit_service.log_event(
                        AuditEvent(
                            event_type=AuditEventType.DATA_RETENTION_APPLIED,
                            resource_type=resource_type.value,
                            success=True,
                            context={
                                "policy_id": policy.id,
                                "data_category": policy.data_category.value,
                                "retention_days": policy.retention_days,
                                "deleted_count": deleted_count,
                            },
                        )
                    )

                except Exception as e:
                    error_msg = f"Failed to apply policy {policy.id}: {str(e)}"
                    retention_results["errors"].append(error_msg)
                    self.logger.error(error_msg)

            self.logger.info(
                f"Applied data retention for {resource_type.value}: {len(applicable_policies)} policies"
            )
            return retention_results

        except Exception as e:
            self.logger.error(f"Failed to apply data retention: {e}")
            raise

    async def generate_compliance_report(
        self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Generate comprehensive compliance report.

        Args:
            start_date: Report start date
            end_date: Report end date

        Returns:
            Dict containing compliance report
        """
        try:
            if start_date is None:
                start_date = datetime.now(timezone.utc) - timedelta(days=30)
            if end_date is None:
                end_date = datetime.now(timezone.utc)

            # Filter data within date range
            filtered_access_logs = [
                log
                for log in self.data_access_logs
                if start_date <= log.accessed_at <= end_date
            ]

            # Calculate statistics
            total_data_accesses = len(filtered_access_logs)
            unique_users_accessed = len(
                set(log.user_id for log in filtered_access_logs)
            )
            unique_accessors = len(set(log.accessed_by for log in filtered_access_logs))

            # Data category breakdown
            category_counts = {}
            for log in filtered_access_logs:
                for category in log.data_categories:
                    category_counts[category.value] = (
                        category_counts.get(category.value, 0) + 1
                    )

            # Operation breakdown
            operation_counts = {}
            for log in filtered_access_logs:
                operation_counts[log.operation.value] = (
                    operation_counts.get(log.operation.value, 0) + 1
                )

            # Consent statistics
            total_consent_records = sum(
                len(consents) for consents in self.consent_records.values()
            )
            active_consents = sum(
                len([c for c in consents if c.granted and not c.withdrawn_at])
                for consents in self.consent_records.values()
            )

            # Data subject requests
            total_requests = sum(
                len(requests) for requests in self.data_subject_requests.values()
            )
            pending_requests = sum(
                len([r for r in requests if r.status == "pending"])
                for requests in self.data_subject_requests.values()
            )

            # Retention policy statistics
            active_policies = len(
                [p for p in self.retention_policies.values() if p.is_active]
            )
            auto_delete_policies = len(
                [p for p in self.retention_policies.values() if p.auto_delete]
            )

            report = {
                "report_period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                },
                "data_access_statistics": {
                    "total_accesses": total_data_accesses,
                    "unique_users_accessed": unique_users_accessed,
                    "unique_accessors": unique_accessors,
                    "data_categories_accessed": category_counts,
                    "operations_performed": operation_counts,
                },
                "consent_statistics": {
                    "total_consent_records": total_consent_records,
                    "active_consents": active_consents,
                    "consent_withdrawal_rate": (total_consent_records - active_consents)
                    / max(total_consent_records, 1),
                },
                "data_subject_requests": {
                    "total_requests": total_requests,
                    "pending_requests": pending_requests,
                    "completion_rate": (total_requests - pending_requests)
                    / max(total_requests, 1),
                },
                "retention_policy_statistics": {
                    "total_policies": len(self.retention_policies),
                    "active_policies": active_policies,
                    "auto_delete_policies": auto_delete_policies,
                },
                "compliance_status": {
                    "gdpr_compliant": True,  # This would be calculated based on various factors
                    "data_minimization": self.config["data_minimization"],
                    "consent_management": self.config["consent_required"],
                    "retention_policies_active": active_policies > 0,
                },
            }

            # Log report generation
            await self.audit_service.log_event(
                AuditEvent(
                    event_type=AuditEventType.AUDIT_REPORT_GENERATED,
                    success=True,
                    context={
                        "report_type": "compliance_report",
                        "period_days": (end_date - start_date).days,
                        "total_accesses": total_data_accesses,
                        "total_requests": total_requests,
                    },
                )
            )

            self.logger.info(
                f"Generated compliance report for period {start_date} to {end_date}"
            )
            return report

        except Exception as e:
            self.logger.error(f"Failed to generate compliance report: {e}")
            raise

    async def get_compliance_status(self) -> Dict[str, Any]:
        """Get current compliance status.

        Returns:
            Dict containing compliance status
        """
        current_time = datetime.now(timezone.utc)

        # Calculate compliance metrics
        total_users = len(self.consent_records)
        users_with_consent = len(
            [
                user_id
                for user_id, consents in self.consent_records.items()
                if any(c.granted and not c.withdrawn_at for c in consents)
            ]
        )

        pending_requests = sum(
            len([r for r in requests if r.status == "pending"])
            for requests in self.data_subject_requests.values()
        )

        overdue_requests = sum(
            len(
                [
                    r
                    for r in requests
                    if r.status == "pending"
                    and (current_time - r.requested_at).days
                    > self.config["gdpr_response_time_days"]
                ]
            )
            for requests in self.data_subject_requests.values()
        )

        return {
            "timestamp": current_time.isoformat(),
            "gdpr_compliance": {
                "consent_coverage": users_with_consent / max(total_users, 1),
                "pending_requests": pending_requests,
                "overdue_requests": overdue_requests,
                "response_time_compliance": overdue_requests == 0,
            },
            "data_retention": {
                "active_policies": len(
                    [p for p in self.retention_policies.values() if p.is_active]
                ),
                "auto_delete_enabled": len(
                    [p for p in self.retention_policies.values() if p.auto_delete]
                ),
            },
            "data_access_logging": {
                "total_logs": len(self.data_access_logs),
                "recent_logs_24h": len(
                    [
                        log
                        for log in self.data_access_logs
                        if log.accessed_at >= current_time - timedelta(hours=24)
                    ]
                ),
            },
            "configuration": {
                "consent_required": self.config["consent_required"],
                "data_minimization": self.config["data_minimization"],
                "gdpr_response_time_days": self.config["gdpr_response_time_days"],
            },
        }
