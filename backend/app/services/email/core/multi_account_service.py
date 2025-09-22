"""
Multi-Account Service for Reynard Backend.

This module provides multi-account support for agents and users with separate email configurations.
"""

import asyncio
import hashlib
import json
import logging
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


@dataclass
class AccountConfig:
    """Account configuration data structure."""

    account_id: str
    account_type: str  # 'user' or 'agent'
    email_address: str
    display_name: str
    smtp_config: Dict[str, Any]
    imap_config: Dict[str, Any]
    encryption_config: Dict[str, Any]
    calendar_config: Dict[str, Any]
    ai_config: Dict[str, Any]
    is_active: bool = True
    is_primary: bool = False
    created_at: datetime = None
    updated_at: datetime = None
    last_used: Optional[datetime] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()


# Alias for backward compatibility
EmailAccount = AccountConfig


@dataclass
class MultiAccountConfig:
    """Configuration for multi-account service."""

    max_accounts_per_user: int = 10
    max_accounts_per_agent: int = 5
    default_account_type: str = "user"
    default_smtp_port: int = 587
    default_imap_port: int = 993
    encryption_enabled: bool = True
    calendar_integration: bool = True
    ai_responses_enabled: bool = True
    rate_limit_emails_per_hour: int = 100
    rate_limit_emails_per_day: int = 1000
    auto_backup_enabled: bool = True
    backup_interval_hours: int = 24
    auto_switch_accounts: bool = True
    account_isolation_enabled: bool = True
    shared_resources_enabled: bool = False
    rate_limiting_enabled: bool = True


@dataclass
class AccountUsage:
    """Account usage statistics."""

    account_id: str
    emails_sent: int = 0
    emails_received: int = 0
    last_email_sent: Optional[datetime] = None
    last_email_received: Optional[datetime] = None
    total_storage_used_mb: float = 0.0
    api_calls_today: int = 0
    api_calls_this_month: int = 0
    last_api_call: Optional[datetime] = None


@dataclass
class AccountPermissions:
    """Account permissions and access control."""

    account_id: str
    can_send_emails: bool = True
    can_receive_emails: bool = True
    can_use_encryption: bool = True
    can_schedule_meetings: bool = True
    can_use_ai_responses: bool = True
    can_access_analytics: bool = True
    can_manage_other_accounts: bool = False
    max_emails_per_day: int = 1000
    max_storage_mb: int = 1000
    allowed_domains: List[str] = None
    blocked_domains: List[str] = None

    def __post_init__(self):
        if self.allowed_domains is None:
            self.allowed_domains = []
        if self.blocked_domains is None:
            self.blocked_domains = []


@dataclass
class AccountSummary:
    """Account summary data structure for API responses."""

    account_id: str
    email_address: str
    display_name: str
    account_type: str
    is_active: bool
    is_primary: bool
    created_at: Optional[datetime] = None
    last_used: Optional[datetime] = None
    total_emails_sent: int = 0
    total_emails_received: int = 0
    total_emails_processed: int = 0
    avg_response_time_hours: float = 0.0
    storage_used_mb: float = 0.0
    last_activity: Optional[datetime] = None
    usage_limits: Optional[Dict[str, Any]] = None
    current_usage: Optional[Dict[str, Any]] = None
    performance_metrics: Optional[Dict[str, Any]] = None


class MultiAccountService:
    """Service for managing multiple email accounts for agents and users."""

    def __init__(
        self,
        config: Optional[MultiAccountConfig] = None,
        data_dir: str = "data/multi_account",
    ):
        self.config = config or MultiAccountConfig()
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Storage files
        self.accounts_file = self.data_dir / "accounts.json"
        self.usage_file = self.data_dir / "usage.json"
        self.permissions_file = self.data_dir / "permissions.json"

        # In-memory storage
        self.accounts: Dict[str, AccountConfig] = {}
        self.usage_stats: Dict[str, AccountUsage] = {}
        self.permissions: Dict[str, AccountPermissions] = {}

        # Load existing data
        self._load_accounts()
        self._load_usage_stats()
        self._load_permissions()

    def _load_accounts(self) -> None:
        """Load accounts from storage."""
        try:
            if self.accounts_file.exists():
                with open(self.accounts_file, "r", encoding="utf-8") as f:
                    accounts_data = json.load(f)
                    self.accounts = {
                        account_id: AccountConfig(**account_data)
                        for account_id, account_data in accounts_data.items()
                    }
            else:
                self.accounts = {}
        except Exception as e:
            logger.error(f"Failed to load accounts: {e}")
            self.accounts = {}

    def _load_usage_stats(self) -> None:
        """Load usage statistics from storage."""
        try:
            if self.usage_file.exists():
                with open(self.usage_file, "r", encoding="utf-8") as f:
                    usage_data = json.load(f)
                    self.usage_stats = {
                        account_id: AccountUsage(**stats_data)
                        for account_id, stats_data in usage_data.items()
                    }
            else:
                self.usage_stats = {}
        except Exception as e:
            logger.error(f"Failed to load usage stats: {e}")
            self.usage_stats = {}

    def _load_permissions(self) -> None:
        """Load permissions from storage."""
        try:
            if self.permissions_file.exists():
                with open(self.permissions_file, "r", encoding="utf-8") as f:
                    permissions_data = json.load(f)
                    self.permissions = {
                        account_id: AccountPermissions(**perm_data)
                        for account_id, perm_data in permissions_data.items()
                    }
            else:
                self.permissions = {}
        except Exception as e:
            logger.error(f"Failed to load permissions: {e}")
            self.permissions = {}

    def _save_accounts(self) -> None:
        """Save accounts to storage."""
        try:
            accounts_data = {
                account_id: asdict(account)
                for account_id, account in self.accounts.items()
            }

            # Convert datetime objects to ISO strings
            for account_data in accounts_data.values():
                for key, value in account_data.items():
                    if isinstance(value, datetime):
                        account_data[key] = value.isoformat()

            with open(self.accounts_file, "w", encoding="utf-8") as f:
                json.dump(accounts_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save accounts: {e}")

    def _save_usage_stats(self) -> None:
        """Save usage statistics to storage."""
        try:
            usage_data = {
                account_id: asdict(stats)
                for account_id, stats in self.usage_stats.items()
            }

            # Convert datetime objects to ISO strings
            for stats_data in usage_data.values():
                for key, value in stats_data.items():
                    if isinstance(value, datetime):
                        stats_data[key] = value.isoformat()

            with open(self.usage_file, "w", encoding="utf-8") as f:
                json.dump(usage_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save usage stats: {e}")

    def _save_permissions(self) -> None:
        """Save permissions to storage."""
        try:
            permissions_data = {
                account_id: asdict(permissions)
                for account_id, permissions in self.permissions.items()
            }

            with open(self.permissions_file, "w", encoding="utf-8") as f:
                json.dump(permissions_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save permissions: {e}")

    async def create_account(
        self,
        account_type: str,
        email_address: str,
        display_name: str,
        smtp_config: Dict[str, Any],
        imap_config: Dict[str, Any],
        encryption_config: Optional[Dict[str, Any]] = None,
        calendar_config: Optional[Dict[str, Any]] = None,
        ai_config: Optional[Dict[str, Any]] = None,
        is_primary: bool = False,
    ) -> AccountConfig:
        """
        Create a new email account.

        Args:
            account_type: Type of account ('user' or 'agent')
            email_address: Email address for the account
            display_name: Display name for the account
            smtp_config: SMTP configuration
            imap_config: IMAP configuration
            encryption_config: Encryption configuration (optional)
            calendar_config: Calendar configuration (optional)
            ai_config: AI configuration (optional)
            is_primary: Whether this is the primary account

        Returns:
            AccountConfig object

        Raises:
            ValueError: If account creation fails
        """
        try:
            # Validate inputs
            if not self._is_valid_email(email_address):
                raise ValueError(f"Invalid email address: {email_address}")

            if self._email_exists(email_address):
                raise ValueError(f"Email address already exists: {email_address}")

            # Check account limits
            existing_accounts = [
                acc
                for acc in self.accounts.values()
                if acc.account_type == account_type
            ]
            max_accounts = (
                self.config.max_accounts_per_user
                if account_type == "user"
                else self.config.max_accounts_per_agent
            )

            if len(existing_accounts) >= max_accounts:
                raise ValueError(
                    f"Maximum number of {account_type} accounts reached: {max_accounts}"
                )

            # Generate account ID
            account_id = str(uuid.uuid4())

            # Set default configurations
            if encryption_config is None:
                encryption_config = {"enabled": self.config.encryption_enabled}

            if calendar_config is None:
                calendar_config = {"enabled": self.config.calendar_integration}

            if ai_config is None:
                ai_config = {"enabled": self.config.ai_responses_enabled}

            # Create account
            account = AccountConfig(
                account_id=account_id,
                account_type=account_type,
                email_address=email_address,
                display_name=display_name,
                smtp_config=smtp_config,
                imap_config=imap_config,
                encryption_config=encryption_config,
                calendar_config=calendar_config,
                ai_config=ai_config,
                is_primary=is_primary,
            )

            # If this is set as primary, unset other primary accounts of the same type
            if is_primary:
                await self._unset_primary_accounts(account_type, exclude=account_id)

            # Store account
            self.accounts[account_id] = account

            # Initialize usage stats
            self.usage_stats[account_id] = AccountUsage(account_id=account_id)

            # Initialize permissions
            self.permissions[account_id] = AccountPermissions(account_id=account_id)

            # Save data
            self._save_accounts()
            self._save_usage_stats()
            self._save_permissions()

            logger.info(
                f"Created {account_type} account: {email_address} ({account_id})"
            )
            return account

        except Exception as e:
            logger.error(f"Failed to create account: {e}")
            raise

    async def get_account(self, account_id: str) -> Optional[AccountConfig]:
        """
        Get account by ID.

        Args:
            account_id: Account ID

        Returns:
            AccountConfig object or None if not found
        """
        return self.accounts.get(account_id)

    async def get_account_by_email(self, email_address: str) -> Optional[AccountConfig]:
        """
        Get account by email address.

        Args:
            email_address: Email address

        Returns:
            AccountConfig object or None if not found
        """
        for account in self.accounts.values():
            if account.email_address == email_address:
                return account
        return None

    async def get_primary_account(self, account_type: str) -> Optional[AccountConfig]:
        """
        Get primary account for account type.

        Args:
            account_type: Account type ('user' or 'agent')

        Returns:
            Primary AccountConfig object or None if not found
        """
        for account in self.accounts.values():
            if account.account_type == account_type and account.is_primary:
                return account
        return None

    async def list_accounts(
        self, account_type: Optional[str] = None, active_only: bool = True
    ) -> List[AccountConfig]:
        """
        List accounts with optional filtering.

        Args:
            account_type: Filter by account type (optional)
            active_only: Only return active accounts

        Returns:
            List of AccountConfig objects
        """
        accounts = list(self.accounts.values())

        if account_type:
            accounts = [acc for acc in accounts if acc.account_type == account_type]

        if active_only:
            accounts = [acc for acc in accounts if acc.is_active]

        # Sort by creation date (newest first)
        accounts.sort(key=lambda x: x.created_at, reverse=True)

        return accounts

    async def update_account(self, account_id: str, updates: Dict[str, Any]) -> bool:
        """
        Update account configuration.

        Args:
            account_id: Account ID
            updates: Dictionary of updates

        Returns:
            True if successful
        """
        try:
            if account_id not in self.accounts:
                return False

            account = self.accounts[account_id]

            # Update fields
            for key, value in updates.items():
                if hasattr(account, key):
                    setattr(account, key, value)

            # Handle primary account changes
            if "is_primary" in updates and updates["is_primary"]:
                await self._unset_primary_accounts(
                    account.account_type, exclude=account_id
                )

            # Update timestamp
            account.updated_at = datetime.now()

            # Save changes
            self._save_accounts()

            logger.info(f"Updated account: {account_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to update account: {e}")
            return False

    async def delete_account(self, account_id: str) -> bool:
        """
        Delete an account.

        Args:
            account_id: Account ID

        Returns:
            True if successful
        """
        try:
            if account_id not in self.accounts:
                return False

            # Remove account and related data
            del self.accounts[account_id]
            if account_id in self.usage_stats:
                del self.usage_stats[account_id]
            if account_id in self.permissions:
                del self.permissions[account_id]

            # Save changes
            self._save_accounts()
            self._save_usage_stats()
            self._save_permissions()

            logger.info(f"Deleted account: {account_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete account: {e}")
            return False

    async def get_usage_stats(self, account_id: str) -> Optional[AccountUsage]:
        """
        Get usage statistics for an account.

        Args:
            account_id: Account ID

        Returns:
            AccountUsage object or None if not found
        """
        return self.usage_stats.get(account_id)

    async def update_usage_stats(
        self,
        account_id: str,
        action: str,
        additional_data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Update usage statistics for an account.

        Args:
            account_id: Account ID
            action: Action type ('email_sent', 'email_received', 'api_call', etc.)
            additional_data: Additional data for the action

        Returns:
            True if successful
        """
        try:
            if account_id not in self.usage_stats:
                self.usage_stats[account_id] = AccountUsage(account_id=account_id)

            stats = self.usage_stats[account_id]
            now = datetime.now()

            # Update based on action
            if action == "email_sent":
                stats.emails_sent += 1
                stats.last_email_sent = now
            elif action == "email_received":
                stats.emails_received += 1
                stats.last_email_received = now
            elif action == "api_call":
                stats.api_calls_today += 1
                stats.api_calls_this_month += 1
                stats.last_api_call = now

            # Update storage usage if provided
            if additional_data and "storage_mb" in additional_data:
                stats.total_storage_used_mb += additional_data["storage_mb"]

            # Save changes
            self._save_usage_stats()

            return True

        except Exception as e:
            logger.error(f"Failed to update usage stats: {e}")
            return False

    async def get_permissions(self, account_id: str) -> Optional[AccountPermissions]:
        """
        Get permissions for an account.

        Args:
            account_id: Account ID

        Returns:
            AccountPermissions object or None if not found
        """
        return self.permissions.get(account_id)

    async def update_permissions(
        self, account_id: str, permissions: Dict[str, Any]
    ) -> bool:
        """
        Update permissions for an account.

        Args:
            account_id: Account ID
            permissions: Dictionary of permission updates

        Returns:
            True if successful
        """
        try:
            if account_id not in self.permissions:
                self.permissions[account_id] = AccountPermissions(account_id=account_id)

            perm_obj = self.permissions[account_id]

            # Update permissions
            for key, value in permissions.items():
                if hasattr(perm_obj, key):
                    setattr(perm_obj, key, value)

            # Save changes
            self._save_permissions()

            logger.info(f"Updated permissions for account: {account_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to update permissions: {e}")
            return False

    async def check_permission(
        self, account_id: str, permission: str, context: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Check if account has a specific permission.

        Args:
            account_id: Account ID
            permission: Permission to check
            context: Additional context for permission check

        Returns:
            True if permission is granted
        """
        try:
            if account_id not in self.permissions:
                return False

            perm_obj = self.permissions[account_id]

            # Check basic permissions
            if hasattr(perm_obj, permission):
                return getattr(perm_obj, permission)

            # Check rate limits
            if permission == "can_send_email" and context:
                usage_stats = await self.get_usage_stats(account_id)
                if usage_stats:
                    # Check daily email limit
                    if usage_stats.emails_sent >= perm_obj.max_emails_per_day:
                        return False

            # Check domain restrictions
            if permission == "can_send_to_domain" and context:
                target_domain = context.get("domain", "")
                if (
                    perm_obj.allowed_domains
                    and target_domain not in perm_obj.allowed_domains
                ):
                    return False
                if (
                    perm_obj.blocked_domains
                    and target_domain in perm_obj.blocked_domains
                ):
                    return False

            return True

        except Exception as e:
            logger.error(f"Failed to check permission: {e}")
            return False

    async def get_account_summary(self, account_id: str) -> AccountSummary:
        """
        Get comprehensive account summary.

        Args:
            account_id: Account ID

        Returns:
            AccountSummary object
        """
        try:
            account = await self.get_account(account_id)
            if not account:
                raise ValueError(f"Account not found: {account_id}")

            usage_stats = await self.get_usage_stats(account_id)
            permissions = await self.get_permissions(account_id)

            # Calculate performance metrics
            performance_metrics = {}
            if usage_stats:
                total_emails = usage_stats.emails_sent + usage_stats.emails_received
                performance_metrics = {
                    "total_emails": total_emails,
                    "emails_sent": usage_stats.emails_sent,
                    "emails_received": usage_stats.emails_received,
                    "storage_used_mb": usage_stats.total_storage_used_mb,
                    "api_calls_today": usage_stats.api_calls_today,
                    "api_calls_this_month": usage_stats.api_calls_this_month,
                }

            # Get usage limits
            usage_limits = {}
            if permissions:
                usage_limits = {
                    "max_emails_per_day": permissions.max_emails_per_day,
                    "max_storage_mb": permissions.max_storage_mb,
                }

            # Get current usage
            current_usage = {}
            if usage_stats:
                current_usage = {
                    "emails_sent_today": usage_stats.emails_sent,
                    "storage_used_mb": usage_stats.total_storage_used_mb,
                    "api_calls_today": usage_stats.api_calls_today,
                }

            return AccountSummary(
                account_id=account.account_id,
                email_address=account.email_address,
                display_name=account.display_name,
                account_type=account.account_type,
                is_active=account.is_active,
                is_primary=account.is_primary,
                created_at=account.created_at,
                last_used=account.last_used,
                total_emails_sent=usage_stats.emails_sent if usage_stats else 0,
                total_emails_received=usage_stats.emails_received if usage_stats else 0,
                total_emails_processed=0,  # Would need additional tracking
                avg_response_time_hours=0.0,  # Would need additional tracking
                storage_used_mb=(
                    usage_stats.total_storage_used_mb if usage_stats else 0.0
                ),
                last_activity=account.last_used,
                usage_limits=usage_limits,
                current_usage=current_usage,
                performance_metrics=performance_metrics,
            )

        except Exception as e:
            logger.error(f"Failed to get account summary: {e}")
            raise

    async def get_system_overview(self) -> Dict[str, Any]:
        """
        Get system-wide overview of all accounts.

        Returns:
            Dictionary with system statistics
        """
        try:
            total_accounts = len(self.accounts)
            active_accounts = len(
                [acc for acc in self.accounts.values() if acc.is_active]
            )
            user_accounts = len(
                [acc for acc in self.accounts.values() if acc.account_type == "user"]
            )
            agent_accounts = len(
                [acc for acc in self.accounts.values() if acc.account_type == "agent"]
            )

            # Calculate total usage
            total_emails_sent = sum(
                stats.emails_sent for stats in self.usage_stats.values()
            )
            total_emails_received = sum(
                stats.emails_received for stats in self.usage_stats.values()
            )
            total_storage_used = sum(
                stats.total_storage_used_mb for stats in self.usage_stats.values()
            )

            # Get recent activity
            recent_cutoff = datetime.now() - timedelta(hours=24)
            recent_activity = 0
            for stats in self.usage_stats.values():
                if stats.last_email_sent and stats.last_email_sent > recent_cutoff:
                    recent_activity += 1
                if (
                    stats.last_email_received
                    and stats.last_email_received > recent_cutoff
                ):
                    recent_activity += 1

            return {
                "total_accounts": total_accounts,
                "active_accounts": active_accounts,
                "user_accounts": user_accounts,
                "agent_accounts": agent_accounts,
                "total_emails_sent": total_emails_sent,
                "total_emails_received": total_emails_received,
                "total_storage_used_mb": total_storage_used,
                "recent_activity_24h": recent_activity,
                "config": {
                    "max_accounts_per_user": self.config.max_accounts_per_user,
                    "max_accounts_per_agent": self.config.max_accounts_per_agent,
                    "encryption_enabled": self.config.encryption_enabled,
                    "calendar_integration": self.config.calendar_integration,
                    "ai_responses_enabled": self.config.ai_responses_enabled,
                },
            }

        except Exception as e:
            logger.error(f"Failed to get system overview: {e}")
            return {}

    # Private helper methods

    def _is_valid_email(self, email: str) -> bool:
        """Check if email address is valid."""
        import re

        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return re.match(pattern, email) is not None

    def _email_exists(self, email: str) -> bool:
        """Check if email address already exists."""
        return any(acc.email_address == email for acc in self.accounts.values())

    async def _unset_primary_accounts(
        self, account_type: str, exclude: Optional[str] = None
    ) -> None:
        """Unset primary flag for all accounts of a type except the excluded one."""
        for account in self.accounts.values():
            if (
                account.account_type == account_type
                and account.is_primary
                and account.account_id != exclude
            ):
                account.is_primary = False


# Global multi-account service instance
multi_account_service = MultiAccountService()
