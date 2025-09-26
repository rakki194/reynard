"""
Customer privacy controls component for ECS customer modeling.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional


class PrivacyLevel(str, Enum):
    """Privacy anonymization levels."""

    LEVEL_1 = "level_1"  # Pseudonymization
    LEVEL_2 = "level_2"  # Generalization
    LEVEL_3 = "level_3"  # Synthetic data
    LEVEL_4 = "level_4"  # Differential privacy


class ConsentType(str, Enum):
    """Types of consent."""

    DATA_PROCESSING = "data_processing"
    MARKETING = "marketing"
    ANALYTICS = "analytics"
    PERSONALIZATION = "personalization"
    DATA_SHARING = "data_sharing"
    THIRD_PARTY = "third_party"


class DataRight(str, Enum):
    """Data subject rights."""

    RIGHT_TO_DELETION = "right_to_deletion"
    RIGHT_TO_PORTABILITY = "right_to_portability"
    RIGHT_TO_RECTIFICATION = "right_to_rectification"
    RIGHT_TO_RESTRICTION = "right_to_restriction"
    RIGHT_TO_ACCESS = "right_to_access"
    RIGHT_TO_OBJECT = "right_to_object"


@dataclass
class ConsentRecord:
    """Individual consent record."""

    consent_type: ConsentType
    granted: bool
    granted_at: datetime
    revoked_at: Optional[datetime] = None
    consent_method: Optional[str] = None  # web, email, phone, etc.
    consent_version: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    def is_active(self) -> bool:
        """Check if consent is currently active."""
        return self.granted and self.revoked_at is None


@dataclass
class PrivacyControls:
    """Customer privacy controls component."""

    # Privacy Level
    anonymization_level: PrivacyLevel = PrivacyLevel.LEVEL_2

    # Consent Management
    consents: Dict[ConsentType, ConsentRecord] = field(default_factory=dict)

    # Data Rights
    data_rights: Dict[DataRight, bool] = field(default_factory=dict)

    # Compliance
    gdpr_compliant: bool = True
    ccpa_compliant: bool = True
    pipeda_compliant: bool = False
    lgpd_compliant: bool = False

    # Data Retention
    data_retention_period: int = 365  # days
    auto_deletion_enabled: bool = False
    deletion_scheduled_date: Optional[datetime] = None

    # Audit Trail
    consent_history: List[Dict[str, Any]] = field(default_factory=list)
    privacy_events: List[Dict[str, Any]] = field(default_factory=list)

    # Timestamps
    created_at: datetime = None
    updated_at: Optional[datetime] = None
    last_consent_update: datetime = None

    def __post_init__(self):
        """Initialize default values."""
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.last_consent_update is None:
            self.last_consent_update = datetime.utcnow()

        # Initialize default consents (all False for GDPR compliance)
        if not self.consents:
            for consent_type in ConsentType:
                self.consents[consent_type] = ConsentRecord(
                    consent_type=consent_type,
                    granted=False,
                    granted_at=datetime.utcnow(),
                )

        # Initialize default data rights
        if not self.data_rights:
            for right in DataRight:
                self.data_rights[right] = True  # All rights granted by default

    def grant_consent(
        self,
        consent_type: ConsentType,
        consent_method: str = "web",
        consent_version: str = "1.0",
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ):
        """Grant consent for a specific type."""

        # Revoke existing consent if active
        if consent_type in self.consents and self.consents[consent_type].is_active():
            self.revoke_consent(consent_type)

        # Create new consent record
        consent_record = ConsentRecord(
            consent_type=consent_type,
            granted=True,
            granted_at=datetime.utcnow(),
            consent_method=consent_method,
            consent_version=consent_version,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        self.consents[consent_type] = consent_record
        self.last_consent_update = datetime.utcnow()
        self.updated_at = datetime.utcnow()

        # Add to consent history
        self.consent_history.append(
            {
                "action": "granted",
                "consent_type": consent_type.value,
                "timestamp": datetime.utcnow().isoformat(),
                "method": consent_method,
                "version": consent_version,
                "ip_address": ip_address,
            }
        )

        # Log privacy event
        self._log_privacy_event(
            "consent_granted",
            {
                "consent_type": consent_type.value,
                "method": consent_method,
                "version": consent_version,
            },
        )

    def revoke_consent(self, consent_type: ConsentType):
        """Revoke consent for a specific type."""

        if consent_type in self.consents:
            consent_record = self.consents[consent_type]
            if consent_record.is_active():
                consent_record.revoked_at = datetime.utcnow()
                self.last_consent_update = datetime.utcnow()
                self.updated_at = datetime.utcnow()

                # Add to consent history
                self.consent_history.append(
                    {
                        "action": "revoked",
                        "consent_type": consent_type.value,
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )

                # Log privacy event
                self._log_privacy_event(
                    "consent_revoked", {"consent_type": consent_type.value}
                )

    def has_consent(self, consent_type: ConsentType) -> bool:
        """Check if customer has granted consent for a specific type."""
        if consent_type not in self.consents:
            return False
        return self.consents[consent_type].is_active()

    def get_active_consents(self) -> List[ConsentType]:
        """Get list of active consents."""
        return [
            consent_type
            for consent_type, record in self.consents.items()
            if record.is_active()
        ]

    def set_data_right(self, right: DataRight, enabled: bool):
        """Set a data right."""
        self.data_rights[right] = enabled
        self.updated_at = datetime.utcnow()

        # Log privacy event
        self._log_privacy_event(
            "data_right_updated", {"right": right.value, "enabled": enabled}
        )

    def has_data_right(self, right: DataRight) -> bool:
        """Check if customer has a specific data right."""
        return self.data_rights.get(right, True)

    def set_anonymization_level(self, level: PrivacyLevel):
        """Set anonymization level."""
        self.anonymization_level = level
        self.updated_at = datetime.utcnow()

        # Log privacy event
        self._log_privacy_event(
            "anonymization_level_changed",
            {"old_level": self.anonymization_level.value, "new_level": level.value},
        )

    def set_data_retention(self, days: int, auto_deletion: bool = False):
        """Set data retention period."""
        self.data_retention_period = days
        self.auto_deletion_enabled = auto_deletion

        if auto_deletion:
            self.deletion_scheduled_date = datetime.utcnow() + timedelta(days=days)
        else:
            self.deletion_scheduled_date = None

        self.updated_at = datetime.utcnow()

        # Log privacy event
        self._log_privacy_event(
            "retention_updated",
            {"retention_days": days, "auto_deletion": auto_deletion},
        )

    def is_data_expired(self) -> bool:
        """Check if customer data has expired based on retention period."""
        if not self.auto_deletion_enabled or not self.deletion_scheduled_date:
            return False
        return datetime.utcnow() > self.deletion_scheduled_date

    def get_retention_status(self) -> Dict[str, Any]:
        """Get data retention status."""
        if self.deletion_scheduled_date:
            days_remaining = (self.deletion_scheduled_date - datetime.utcnow()).days
            return {
                "retention_period": self.data_retention_period,
                "auto_deletion_enabled": self.auto_deletion_enabled,
                "deletion_scheduled_date": self.deletion_scheduled_date.isoformat(),
                "days_remaining": max(0, days_remaining),
                "is_expired": self.is_data_expired(),
            }
        else:
            return {
                "retention_period": self.data_retention_period,
                "auto_deletion_enabled": False,
                "deletion_scheduled_date": None,
                "days_remaining": None,
                "is_expired": False,
            }

    def _log_privacy_event(self, event_type: str, event_data: Dict[str, Any]):
        """Log a privacy-related event."""
        event = {
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": event_data,
        }
        self.privacy_events.append(event)

    def get_privacy_summary(self) -> Dict[str, Any]:
        """Get a summary of privacy settings."""
        return {
            "anonymization_level": self.anonymization_level.value,
            "active_consents": [
                consent.value for consent in self.get_active_consents()
            ],
            "data_rights": {
                right.value: enabled for right, enabled in self.data_rights.items()
            },
            "compliance": {
                "gdpr": self.gdpr_compliant,
                "ccpa": self.ccpa_compliant,
                "pipeda": self.pipeda_compliant,
                "lgpd": self.lgpd_compliant,
            },
            "retention": self.get_retention_status(),
            "consent_history_count": len(self.consent_history),
            "privacy_events_count": len(self.privacy_events),
            "last_consent_update": self.last_consent_update.isoformat(),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "anonymization_level": self.anonymization_level.value,
            "consents": {
                consent_type.value: {
                    "granted": record.granted,
                    "granted_at": record.granted_at.isoformat(),
                    "revoked_at": (
                        record.revoked_at.isoformat() if record.revoked_at else None
                    ),
                    "consent_method": record.consent_method,
                    "consent_version": record.consent_version,
                    "ip_address": record.ip_address,
                    "user_agent": record.user_agent,
                }
                for consent_type, record in self.consents.items()
            },
            "data_rights": {
                right.value: enabled for right, enabled in self.data_rights.items()
            },
            "gdpr_compliant": self.gdpr_compliant,
            "ccpa_compliant": self.ccpa_compliant,
            "pipeda_compliant": self.pipeda_compliant,
            "lgpd_compliant": self.lgpd_compliant,
            "data_retention_period": self.data_retention_period,
            "auto_deletion_enabled": self.auto_deletion_enabled,
            "deletion_scheduled_date": (
                self.deletion_scheduled_date.isoformat()
                if self.deletion_scheduled_date
                else None
            ),
            "consent_history": self.consent_history,
            "privacy_events": self.privacy_events,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_consent_update": self.last_consent_update.isoformat(),
        }
