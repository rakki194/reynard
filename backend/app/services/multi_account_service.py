"""
Multi-Account Service for Reynard Backend.

This module provides multi-account support for agents and users with separate email configurations.
"""

import asyncio
import logging
import json
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from pathlib import Path
import uuid

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


# Alias for backward compatibility
EmailAccount = AccountConfig


class MultiAccountService:
    """Service for managing multiple email accounts for agents and users."""
    
    def __init__(self, config: Optional[MultiAccountConfig] = None, data_dir: str = "data/multi_account"):
        self.config = config or MultiAccountConfig()
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Storage directories
        self.accounts_dir = self.data_dir / "accounts"
        self.accounts_dir.mkdir(exist_ok=True)
        self.usage_dir = self.data_dir / "usage"
        self.usage_dir.mkdir(exist_ok=True)
        self.permissions_dir = self.data_dir / "permissions"
        self.permissions_dir.mkdir(exist_ok=True)
        
        # Load existing data
        self._load_accounts()
        self._load_usage_stats()
        self._load_permissions()
    
    def _load_accounts(self) -> None:
        """Load existing account configurations."""
        try:
            accounts_file = self.data_dir / "accounts.json"
            if accounts_file.exists():
                with open(accounts_file, 'r', encoding='utf-8') as f:
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
        """Load account usage statistics."""
        try:
            usage_file = self.data_dir / "usage.json"
            if usage_file.exists():
                with open(usage_file, 'r', encoding='utf-8') as f:
                    usage_data = json.load(f)
                    self.usage_stats = {
                        account_id: AccountUsage(**usage_data)
                        for account_id, usage_data in usage_data.items()
                    }
            else:
                self.usage_stats = {}
        except Exception as e:
            logger.error(f"Failed to load usage stats: {e}")
            self.usage_stats = {}
    
    def _load_permissions(self) -> None:
        """Load account permissions."""
        try:
            permissions_file = self.data_dir / "permissions.json"
            if permissions_file.exists():
                with open(permissions_file, 'r', encoding='utf-8') as f:
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
        """Save account configurations."""
        try:
            accounts_file = self.data_dir / "accounts.json"
            accounts_data = {
                account_id: asdict(account)
                for account_id, account in self.accounts.items()
            }
            
            # Convert datetime objects to ISO strings
            for account_data in accounts_data.values():
                for key, value in account_data.items():
                    if isinstance(value, datetime):
                        account_data[key] = value.isoformat()
            
            with open(accounts_file, 'w', encoding='utf-8') as f:
                json.dump(accounts_data, f, indent=2, default=str)
                
        except Exception as e:
            logger.error(f"Failed to save accounts: {e}")
    
    def _save_usage_stats(self) -> None:
        """Save usage statistics."""
        try:
            usage_file = self.data_dir / "usage.json"
            usage_data = {
                account_id: asdict(usage)
                for account_id, usage in self.usage_stats.items()
            }
            
            # Convert datetime objects to ISO strings
            for usage_data in usage_data.values():
                for key, value in usage_data.items():
                    if isinstance(value, datetime):
                        usage_data[key] = value.isoformat()
            
            with open(usage_file, 'w', encoding='utf-8') as f:
                json.dump(usage_data, f, indent=2, default=str)
                
        except Exception as e:
            logger.error(f"Failed to save usage stats: {e}")
    
    def _save_permissions(self) -> None:
        """Save account permissions."""
        try:
            permissions_file = self.data_dir / "permissions.json"
            permissions_data = {
                account_id: asdict(permissions)
                for account_id, permissions in self.permissions.items()
            }
            
            with open(permissions_file, 'w', encoding='utf-8') as f:
                json.dump(permissions_data, f, indent=2)
                
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
        is_primary: bool = False
    ) -> AccountConfig:
        """
        Create a new email account.
        
        Args:
            account_type: Type of account ('user' or 'agent')
            email_address: Email address for the account
            display_name: Display name for the account
            smtp_config: SMTP configuration
            imap_config: IMAP configuration
            encryption_config: Encryption configuration
            calendar_config: Calendar configuration
            ai_config: AI configuration
            is_primary: Whether this is the primary account
            
        Returns:
            AccountConfig object
        """
        try:
            # Generate unique account ID
            account_id = str(uuid.uuid4())
            
            # Validate email address
            if not self._is_valid_email(email_address):
                raise ValueError(f"Invalid email address: {email_address}")
            
            # Check if email already exists
            if self._email_exists(email_address):
                raise ValueError(f"Email address already exists: {email_address}")
            
            # Set default configurations
            if not encryption_config:
                encryption_config = {"enabled": False, "method": "pgp"}
            if not calendar_config:
                calendar_config = {"enabled": False, "provider": "google"}
            if not ai_config:
                ai_config = {"enabled": True, "model": "gpt-3.5-turbo"}
            
            # Create account configuration
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
                is_primary=is_primary
            )
            
            # If this is set as primary, unset other primary accounts
            if is_primary:
                await self._unset_primary_accounts(account_type)
            
            # Store the account
            self.accounts[account_id] = account
            
            # Create default usage stats
            self.usage_stats[account_id] = AccountUsage(account_id=account_id)
            
            # Create default permissions
            self.permissions[account_id] = AccountPermissions(account_id=account_id)
            
            # Save all data
            self._save_accounts()
            self._save_usage_stats()
            self._save_permissions()
            
            logger.info(f"Created account: {account_id} ({email_address})")
            return account
            
        except Exception as e:
            logger.error(f"Failed to create account: {e}")
            raise
    
    async def get_account(self, account_id: str) -> Optional[AccountConfig]:
        """
        Get account configuration by ID.
        
        Args:
            account_id: Account ID
            
        Returns:
            AccountConfig object or None if not found
        """
        return self.accounts.get(account_id)
    
    async def get_account_by_email(self, email_address: str) -> Optional[AccountConfig]:
        """
        Get account configuration by email address.
        
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
        Get primary account for a given type.
        
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
        self,
        account_type: Optional[str] = None,
        active_only: bool = True
    ) -> List[AccountConfig]:
        """
        List all accounts with optional filtering.
        
        Args:
            account_type: Filter by account type
            active_only: Only return active accounts
            
        Returns:
            List of AccountConfig objects
        """
        accounts = list(self.accounts.values())
        
        if account_type:
            accounts = [acc for acc in accounts if acc.account_type == account_type]
        
        if active_only:
            accounts = [acc for acc in accounts if acc.is_active]
        
        return accounts
    
    async def update_account(
        self,
        account_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """
        Update account configuration.
        
        Args:
            account_id: Account ID to update
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
            
            account.updated_at = datetime.now()
            
            # Handle primary account changes
            if updates.get('is_primary', False):
                await self._unset_primary_accounts(account.account_type, exclude=account_id)
            
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
            account_id: Account ID to delete
            
        Returns:
            True if successful
        """
        try:
            if account_id not in self.accounts:
                return False
            
            # Remove from all collections
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
        additional_data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Update usage statistics for an account.
        
        Args:
            account_id: Account ID
            action: Action performed ('email_sent', 'email_received', 'api_call')
            additional_data: Additional data for the action
            
        Returns:
            True if successful
        """
        try:
            if account_id not in self.usage_stats:
                self.usage_stats[account_id] = AccountUsage(account_id=account_id)
            
            usage = self.usage_stats[account_id]
            now = datetime.now()
            
            if action == 'email_sent':
                usage.emails_sent += 1
                usage.last_email_sent = now
            elif action == 'email_received':
                usage.emails_received += 1
                usage.last_email_received = now
            elif action == 'api_call':
                usage.api_calls_today += 1
                usage.api_calls_this_month += 1
                usage.last_api_call = now
            
            # Update storage usage if provided
            if additional_data and 'storage_mb' in additional_data:
                usage.total_storage_used_mb += additional_data['storage_mb']
            
            # Update last used timestamp
            if account_id in self.accounts:
                self.accounts[account_id].last_used = now
            
            self._save_usage_stats()
            self._save_accounts()
            
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
        self,
        account_id: str,
        permissions: Dict[str, Any]
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
            
            self._save_permissions()
            
            logger.info(f"Updated permissions for account: {account_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update permissions: {e}")
            return False
    
    async def check_permission(
        self,
        account_id: str,
        permission: str,
        context: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Check if an account has a specific permission.
        
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
            
            # Check basic permission
            if not hasattr(perm_obj, permission):
                return False
            
            if not getattr(perm_obj, permission):
                return False
            
            # Check domain restrictions if context provided
            if context and 'email_address' in context:
                email = context['email_address']
                domain = email.split('@')[1] if '@' in email else ''
                
                # Check allowed domains
                if perm_obj.allowed_domains and domain not in perm_obj.allowed_domains:
                    return False
                
                # Check blocked domains
                if domain in perm_obj.blocked_domains:
                    return False
            
            # Check rate limits
            if permission == 'can_send_emails' and context:
                usage = self.usage_stats.get(account_id)
                if usage and usage.emails_sent >= perm_obj.max_emails_per_day:
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
            account = self.accounts.get(account_id)
            if not account:
                raise ValueError("Account not found")
            
            usage = self.usage_stats.get(account_id, AccountUsage(account_id=account_id))
            
            return AccountSummary(
                account_id=account.account_id,
                email_address=account.email_address,
                display_name=account.display_name,
                account_type=account.account_type,
                is_active=account.is_active,
                is_primary=account.is_primary,
                created_at=account.created_at,
                last_used=account.last_used,
                total_emails_sent=usage.emails_sent,
                total_emails_received=usage.emails_received,
                total_emails_processed=usage.emails_sent + usage.emails_received,
                avg_response_time_hours=0.0,  # Not tracked in AccountUsage
                storage_used_mb=usage.total_storage_used_mb,
                last_activity=account.last_used or account.created_at,
                usage_limits={},
                current_usage={},
                performance_metrics=None
            )
            
        except Exception as e:
            logger.error(f"Failed to get account summary: {e}")
            raise
    
    async def get_system_overview(self) -> Dict[str, Any]:
        """
        Get system-wide account overview.
        
        Returns:
            Dictionary with system overview
        """
        try:
            total_accounts = len(self.accounts)
            active_accounts = len([acc for acc in self.accounts.values() if acc.is_active])
            user_accounts = len([acc for acc in self.accounts.values() if acc.account_type == 'user'])
            agent_accounts = len([acc for acc in self.accounts.values() if acc.account_type == 'agent'])
            
            total_emails_sent = sum(usage.emails_sent for usage in self.usage_stats.values())
            total_emails_received = sum(usage.emails_received for usage in self.usage_stats.values())
            total_api_calls = sum(usage.api_calls_this_month for usage in self.usage_stats.values())
            
            return {
                'total_accounts': total_accounts,
                'active_accounts': active_accounts,
                'user_accounts': user_accounts,
                'agent_accounts': agent_accounts,
                'total_emails_sent': total_emails_sent,
                'total_emails_received': total_emails_received,
                'total_api_calls_this_month': total_api_calls,
                'system_status': 'healthy' if active_accounts > 0 else 'no_active_accounts',
            }
            
        except Exception as e:
            logger.error(f"Failed to get system overview: {e}")
            return {}
    
    # Private helper methods
    
    def _is_valid_email(self, email: str) -> bool:
        """Validate email address format."""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _email_exists(self, email: str) -> bool:
        """Check if email address already exists."""
        for account in self.accounts.values():
            if account.email_address == email:
                return True
        return False
    
    async def _unset_primary_accounts(self, account_type: str, exclude: Optional[str] = None) -> None:
        """Unset primary flag for all accounts of a type."""
        for account_id, account in self.accounts.items():
            if (account.account_type == account_type and 
                account.is_primary and 
                account_id != exclude):
                account.is_primary = False


# Global multi-account service instance
multi_account_service = MultiAccountService()
