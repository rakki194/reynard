"""
Customer identity component for ECS customer modeling.
"""

from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class AccountType(str, Enum):
    """Customer account types."""
    STANDARD = "standard"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class AccountTier(str, Enum):
    """Customer account tiers."""
    BASIC = "basic"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


@dataclass
class CustomerIdentity:
    """Customer identity component."""
    
    # Core Identity
    customer_uuid: str
    email: str
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    # Account Information
    account_type: AccountType = AccountType.STANDARD
    account_tier: AccountTier = AccountTier.BASIC
    registration_source: Optional[str] = None
    
    # Status
    is_active: bool = True
    is_verified: bool = False
    
    # Timestamps
    created_at: datetime = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    # Additional Data
    metadata: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        """Initialize default values."""
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.metadata is None:
            self.metadata = {}
    
    def get_full_name(self) -> str:
        """Get customer's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        else:
            return "Unknown"
    
    def is_premium_customer(self) -> bool:
        """Check if customer has premium account."""
        return self.account_type in [AccountType.PREMIUM, AccountType.ENTERPRISE]
    
    def get_account_value(self) -> float:
        """Get account value based on tier."""
        tier_values = {
            AccountTier.BASIC: 1.0,
            AccountTier.SILVER: 2.0,
            AccountTier.GOLD: 3.0,
            AccountTier.PLATINUM: 5.0
        }
        return tier_values.get(self.account_tier, 1.0)
    
    def update_last_login(self):
        """Update last login timestamp."""
        self.last_login = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "customer_uuid": self.customer_uuid,
            "email": self.email,
            "phone": self.phone,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "account_type": self.account_type.value,
            "account_tier": self.account_tier.value,
            "registration_source": self.registration_source,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "metadata": self.metadata
        }
