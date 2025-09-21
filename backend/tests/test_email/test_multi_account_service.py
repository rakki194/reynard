"""
Tests for Multi-Account Service.

This module contains comprehensive tests for the multi-account email functionality.
"""

import asyncio
import json
import tempfile
import uuid
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
import pytest_asyncio

from app.services.multi_account_service import (
    AccountConfig,
    AccountPermissions,
    AccountSummary,
    AccountUsage,
    EmailAccount,
    MultiAccountConfig,
    MultiAccountService,
    multi_account_service,
)


class TestMultiAccountService:
    """Test cases for MultiAccountService."""

    @pytest_asyncio.fixture
    async def multi_account_service(self):
        """Create a test multi-account service with temporary data directory."""
        temp_dir = tempfile.mkdtemp()
        try:
            service = MultiAccountService(data_dir=temp_dir)
            yield service
        finally:
            # Clean up the temporary directory
            import shutil

            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass

    @pytest.fixture
    def sample_account_data(self):
        """Sample account data for testing."""
        return {
            "account_type": "user",
            "email_address": "test@example.com",
            "display_name": "Test User",
            "smtp_config": {
                "smtp_server": "smtp.example.com",
                "smtp_port": 587,
                "smtp_username": "test@example.com",
                "smtp_password": "test_password",
                "use_tls": True,
            },
            "imap_config": {
                "imap_server": "imap.example.com",
                "imap_port": 993,
                "imap_username": "test@example.com",
                "imap_password": "test_password",
                "use_ssl": True,
            },
            "encryption_config": {
                "pgp_enabled": True,
                "smime_enabled": False,
                "default_encryption": "pgp",
            },
            "calendar_config": {
                "google_calendar_enabled": True,
                "caldav_enabled": False,
                "default_calendar": "primary",
            },
            "ai_config": {
                "auto_reply_enabled": True,
                "response_generation_enabled": True,
                "default_model": "gpt-3.5-turbo",
            },
            "is_primary": False,
        }

    def test_multi_account_service_initialization(self, multi_account_service):
        """Test multi-account service initialization."""
        assert multi_account_service.config.max_accounts_per_user == 10
        assert multi_account_service.config.max_accounts_per_agent == 5
        assert multi_account_service.config.default_account_type == "user"
        assert multi_account_service.config.auto_switch_accounts is True
        assert multi_account_service.config.account_isolation_enabled is True
        assert multi_account_service.config.shared_resources_enabled is False
        assert multi_account_service.config.rate_limiting_enabled is True
        assert multi_account_service.config.usage_tracking_enabled is True
        assert multi_account_service.data_dir.exists()
        assert multi_account_service.accounts_dir.exists()
        assert multi_account_service.usage_dir.exists()
        assert isinstance(multi_account_service.accounts, dict)
        assert isinstance(multi_account_service.usage_stats, dict)

    @pytest.mark.asyncio
    async def test_create_account_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful account creation."""
        account = await multi_account_service.create_account(**sample_account_data)

        assert isinstance(account, EmailAccount)
        assert account.account_id
        assert account.account_type == sample_account_data["account_type"]
        assert account.email_address == sample_account_data["email_address"]
        assert account.display_name == sample_account_data["display_name"]
        assert account.smtp_config == sample_account_data["smtp_config"]
        assert account.imap_config == sample_account_data["imap_config"]
        assert account.encryption_config == sample_account_data["encryption_config"]
        assert account.calendar_config == sample_account_data["calendar_config"]
        assert account.ai_config == sample_account_data["ai_config"]
        assert account.is_primary == sample_account_data["is_primary"]
        assert account.is_active is True
        assert isinstance(account.created_at, datetime)
        assert account.last_used is None

        # Verify account was stored
        assert account.account_id in multi_account_service.accounts

    @pytest.mark.asyncio
    async def test_create_account_duplicate_email(
        self, multi_account_service, sample_account_data
    ):
        """Test account creation with duplicate email address."""
        # Create first account
        await multi_account_service.create_account(**sample_account_data)

        # Try to create second account with same email
        with pytest.raises(
            ValueError, match="Account with email address already exists"
        ):
            await multi_account_service.create_account(**sample_account_data)

    @pytest.mark.asyncio
    async def test_create_account_max_limit_exceeded(
        self, multi_account_service, sample_account_data
    ):
        """Test account creation when max limit is exceeded."""
        # Create max number of accounts
        for i in range(multi_account_service.config.max_accounts_per_user):
            account_data = sample_account_data.copy()
            account_data["email_address"] = f"user{i}@example.com"
            await multi_account_service.create_account(**account_data)

        # Try to create one more account
        account_data = sample_account_data.copy()
        account_data["email_address"] = "exceeded@example.com"

        with pytest.raises(ValueError, match="Maximum number of accounts exceeded"):
            await multi_account_service.create_account(**account_data)

    @pytest.mark.asyncio
    async def test_create_account_primary_set(
        self, multi_account_service, sample_account_data
    ):
        """Test account creation with primary flag set."""
        account_data = sample_account_data.copy()
        account_data["is_primary"] = True

        account = await multi_account_service.create_account(**account_data)
        assert account.is_primary is True

    @pytest.mark.asyncio
    async def test_list_accounts_all(self, multi_account_service, sample_account_data):
        """Test listing all accounts."""
        # Create test accounts
        for i in range(3):
            account_data = sample_account_data.copy()
            account_data["email_address"] = f"user{i}@example.com"
            account_data["account_type"] = "user" if i % 2 == 0 else "agent"
            await multi_account_service.create_account(**account_data)

        all_accounts = await multi_account_service.list_accounts()
        assert len(all_accounts) == 3

        user_accounts = await multi_account_service.list_accounts(account_type="user")
        assert len(user_accounts) == 2

        agent_accounts = await multi_account_service.list_accounts(account_type="agent")
        assert len(agent_accounts) == 1

    @pytest.mark.asyncio
    async def test_list_accounts_active_only(
        self, multi_account_service, sample_account_data
    ):
        """Test listing only active accounts."""
        # Create active account
        account1 = await multi_account_service.create_account(**sample_account_data)

        # Create inactive account
        account_data = sample_account_data.copy()
        account_data["email_address"] = "inactive@example.com"
        account2 = await multi_account_service.create_account(**account_data)
        account2.is_active = False
        multi_account_service.accounts[account2.account_id] = account2

        active_accounts = await multi_account_service.list_accounts(active_only=True)
        assert len(active_accounts) == 1
        assert active_accounts[0].account_id == account1.account_id

        all_accounts = await multi_account_service.list_accounts(active_only=False)
        assert len(all_accounts) == 2

    @pytest.mark.asyncio
    async def test_get_account_summary_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful account summary retrieval."""
        account = await multi_account_service.create_account(**sample_account_data)

        summary = await multi_account_service.get_account_summary(account.account_id)

        assert isinstance(summary, AccountSummary)
        assert summary.account_id == account.account_id
        assert summary.email_address == account.email_address
        assert summary.display_name == account.display_name
        assert summary.account_type == account.account_type
        assert summary.is_active == account.is_active
        assert summary.is_primary == account.is_primary
        assert summary.created_at == account.created_at
        assert summary.last_used == account.last_used
        assert summary.total_emails_sent == 0
        assert summary.total_emails_received == 0
        assert summary.total_emails_processed == 0
        assert summary.avg_response_time_hours == 0.0
        assert summary.storage_used_mb == 0.0
        assert summary.last_activity == account.created_at
        assert summary.usage_limits == {}
        assert summary.current_usage == {}
        assert summary.performance_metrics == {}

    @pytest.mark.asyncio
    async def test_get_account_summary_not_found(self, multi_account_service):
        """Test account summary retrieval for non-existent account."""
        with pytest.raises(ValueError, match="Account not found"):
            await multi_account_service.get_account_summary("nonexistent_account_id")

    @pytest.mark.asyncio
    async def test_get_system_overview(
        self, multi_account_service, sample_account_data
    ):
        """Test system overview retrieval."""
        # Create test accounts
        for i in range(5):
            account_data = sample_account_data.copy()
            account_data["email_address"] = f"user{i}@example.com"
            account_data["account_type"] = "user" if i % 2 == 0 else "agent"
            await multi_account_service.create_account(**account_data)

        overview = await multi_account_service.get_system_overview()

        assert isinstance(overview, dict)
        assert "total_accounts" in overview
        assert "active_accounts" in overview
        assert "inactive_accounts" in overview
        assert "accounts_by_type" in overview
        assert "accounts_by_status" in overview
        assert "storage_usage" in overview
        assert "performance_metrics" in overview
        assert "usage_statistics" in overview
        assert "system_health" in overview
        assert "last_updated" in overview

        assert overview["total_accounts"] == 5
        assert overview["active_accounts"] == 5
        assert overview["inactive_accounts"] == 0
        assert overview["accounts_by_type"]["user"] == 3
        assert overview["accounts_by_type"]["agent"] == 2
        assert overview["accounts_by_status"]["active"] == 5
        assert overview["accounts_by_status"]["inactive"] == 0
        assert isinstance(overview["storage_usage"], dict)
        assert isinstance(overview["performance_metrics"], dict)
        assert isinstance(overview["usage_statistics"], dict)
        assert isinstance(overview["system_health"], dict)
        assert isinstance(overview["last_updated"], datetime)

    @pytest.mark.asyncio
    async def test_update_account_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful account update."""
        account = await multi_account_service.create_account(**sample_account_data)

        update_data = {
            "display_name": "Updated Display Name",
            "is_primary": True,
            "smtp_config": {
                "smtp_server": "updated.smtp.com",
                "smtp_port": 465,
                "smtp_username": "updated@example.com",
                "smtp_password": "updated_password",
                "use_tls": False,
            },
        }

        updated_account = await multi_account_service.update_account(
            account.account_id, **update_data
        )

        assert updated_account.display_name == "Updated Display Name"
        assert updated_account.is_primary is True
        assert updated_account.smtp_config["smtp_server"] == "updated.smtp.com"
        assert updated_account.smtp_config["smtp_port"] == 465
        assert updated_account.updated_at > account.updated_at

    @pytest.mark.asyncio
    async def test_update_account_not_found(self, multi_account_service):
        """Test account update for non-existent account."""
        with pytest.raises(ValueError, match="Account not found"):
            await multi_account_service.update_account(
                "nonexistent_account_id", display_name="New Name"
            )

    @pytest.mark.asyncio
    async def test_delete_account_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful account deletion."""
        account = await multi_account_service.create_account(**sample_account_data)

        result = await multi_account_service.delete_account(account.account_id)
        assert result is True
        assert account.account_id not in multi_account_service.accounts

    @pytest.mark.asyncio
    async def test_delete_account_not_found(self, multi_account_service):
        """Test account deletion for non-existent account."""
        result = await multi_account_service.delete_account("nonexistent_account_id")
        assert result is False

    @pytest.mark.asyncio
    async def test_activate_account_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful account activation."""
        account = await multi_account_service.create_account(**sample_account_data)
        account.is_active = False
        multi_account_service.accounts[account.account_id] = account

        result = await multi_account_service.activate_account(account.account_id)
        assert result is True
        assert multi_account_service.accounts[account.account_id].is_active is True

    @pytest.mark.asyncio
    async def test_activate_account_not_found(self, multi_account_service):
        """Test account activation for non-existent account."""
        result = await multi_account_service.activate_account("nonexistent_account_id")
        assert result is False

    @pytest.mark.asyncio
    async def test_deactivate_account_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful account deactivation."""
        account = await multi_account_service.create_account(**sample_account_data)

        result = await multi_account_service.deactivate_account(account.account_id)
        assert result is True
        assert multi_account_service.accounts[account.account_id].is_active is False

    @pytest.mark.asyncio
    async def test_deactivate_account_not_found(self, multi_account_service):
        """Test account deactivation for non-existent account."""
        result = await multi_account_service.deactivate_account(
            "nonexistent_account_id"
        )
        assert result is False

    @pytest.mark.asyncio
    async def test_set_primary_account_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful primary account setting."""
        # Create two accounts
        account1 = await multi_account_service.create_account(**sample_account_data)

        account_data = sample_account_data.copy()
        account_data["email_address"] = "second@example.com"
        account2 = await multi_account_service.create_account(**account_data)

        # Set second account as primary
        result = await multi_account_service.set_primary_account(account2.account_id)
        assert result is True

        # Verify first account is no longer primary
        assert multi_account_service.accounts[account1.account_id].is_primary is False
        # Verify second account is primary
        assert multi_account_service.accounts[account2.account_id].is_primary is True

    @pytest.mark.asyncio
    async def test_set_primary_account_not_found(self, multi_account_service):
        """Test setting primary account for non-existent account."""
        result = await multi_account_service.set_primary_account(
            "nonexistent_account_id"
        )
        assert result is False

    @pytest.mark.asyncio
    async def test_get_primary_account_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful primary account retrieval."""
        # Create account and set as primary
        account = await multi_account_service.create_account(**sample_account_data)
        await multi_account_service.set_primary_account(account.account_id)

        primary_account = await multi_account_service.get_primary_account()
        assert primary_account.account_id == account.account_id
        assert primary_account.is_primary is True

    @pytest.mark.asyncio
    async def test_get_primary_account_none_set(
        self, multi_account_service, sample_account_data
    ):
        """Test primary account retrieval when none is set."""
        # Create account but don't set as primary
        await multi_account_service.create_account(**sample_account_data)

        primary_account = await multi_account_service.get_primary_account()
        assert primary_account is None

    @pytest.mark.asyncio
    async def test_track_usage_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful usage tracking."""
        account = await multi_account_service.create_account(**sample_account_data)

        usage_data = {
            "emails_sent": 5,
            "emails_received": 10,
            "emails_processed": 8,
            "storage_used_mb": 25.5,
            "response_time_hours": 2.5,
        }

        await multi_account_service.track_usage(account.account_id, usage_data)

        # Verify usage was tracked
        assert account.account_id in multi_account_service.usage_stats
        stats = multi_account_service.usage_stats[account.account_id]
        assert stats["emails_sent"] == 5
        assert stats["emails_received"] == 10
        assert stats["emails_processed"] == 8
        assert stats["storage_used_mb"] == 25.5
        assert stats["response_time_hours"] == 2.5

    @pytest.mark.asyncio
    async def test_track_usage_account_not_found(self, multi_account_service):
        """Test usage tracking for non-existent account."""
        usage_data = {"emails_sent": 5}

        with pytest.raises(ValueError, match="Account not found"):
            await multi_account_service.track_usage(
                "nonexistent_account_id", usage_data
            )

    @pytest.mark.asyncio
    async def test_get_usage_stats_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful usage stats retrieval."""
        account = await multi_account_service.create_account(**sample_account_data)

        # Track some usage
        usage_data = {
            "emails_sent": 10,
            "emails_received": 20,
            "emails_processed": 15,
            "storage_used_mb": 50.0,
            "response_time_hours": 1.5,
        }
        await multi_account_service.track_usage(account.account_id, usage_data)

        stats = await multi_account_service.get_usage_stats(account.account_id)

        assert isinstance(stats, dict)
        assert stats["emails_sent"] == 10
        assert stats["emails_received"] == 20
        assert stats["emails_processed"] == 15
        assert stats["storage_used_mb"] == 50.0
        assert stats["response_time_hours"] == 1.5
        assert "last_updated" in stats
        assert isinstance(stats["last_updated"], datetime)

    @pytest.mark.asyncio
    async def test_get_usage_stats_account_not_found(self, multi_account_service):
        """Test usage stats retrieval for non-existent account."""
        with pytest.raises(ValueError, match="Account not found"):
            await multi_account_service.get_usage_stats("nonexistent_account_id")

    @pytest.mark.asyncio
    async def test_check_rate_limits_within_limits(
        self, multi_account_service, sample_account_data
    ):
        """Test rate limit checking within limits."""
        account = await multi_account_service.create_account(**sample_account_data)

        # Set rate limits
        rate_limits = {
            "emails_per_hour": 100,
            "emails_per_day": 1000,
            "storage_mb": 1000,
        }
        await multi_account_service.set_rate_limits(account.account_id, rate_limits)

        # Check within limits
        result = await multi_account_service.check_rate_limits(
            account.account_id, "emails_per_hour", 50
        )
        assert result["allowed"] is True
        assert result["remaining"] == 50
        assert result["reset_time"] is not None

    @pytest.mark.asyncio
    async def test_check_rate_limits_exceeded(
        self, multi_account_service, sample_account_data
    ):
        """Test rate limit checking when limits are exceeded."""
        account = await multi_account_service.create_account(**sample_account_data)

        # Set rate limits
        rate_limits = {
            "emails_per_hour": 100,
            "emails_per_day": 1000,
            "storage_mb": 1000,
        }
        await multi_account_service.set_rate_limits(account.account_id, rate_limits)

        # Check exceeding limits
        result = await multi_account_service.check_rate_limits(
            account.account_id, "emails_per_hour", 150
        )
        assert result["allowed"] is False
        assert result["remaining"] == 0
        assert result["reset_time"] is not None

    @pytest.mark.asyncio
    async def test_set_rate_limits_success(
        self, multi_account_service, sample_account_data
    ):
        """Test successful rate limits setting."""
        account = await multi_account_service.create_account(**sample_account_data)

        rate_limits = {
            "emails_per_hour": 100,
            "emails_per_day": 1000,
            "storage_mb": 1000,
            "api_calls_per_minute": 60,
        }

        result = await multi_account_service.set_rate_limits(
            account.account_id, rate_limits
        )
        assert result is True

        # Verify limits were set
        assert account.account_id in multi_account_service.rate_limits
        assert multi_account_service.rate_limits[account.account_id] == rate_limits

    @pytest.mark.asyncio
    async def test_set_rate_limits_account_not_found(self, multi_account_service):
        """Test rate limits setting for non-existent account."""
        rate_limits = {"emails_per_hour": 100}

        with pytest.raises(ValueError, match="Account not found"):
            await multi_account_service.set_rate_limits(
                "nonexistent_account_id", rate_limits
            )

    def test_save_and_load_accounts(self, multi_account_service, sample_account_data):
        """Test saving and loading accounts."""
        # Create test account
        account = EmailAccount(
            account_id="test_account_id",
            account_type="user",
            email_address="test@example.com",
            display_name="Test User",
            smtp_config={"smtp_server": "smtp.example.com"},
            imap_config={"imap_server": "imap.example.com"},
            encryption_config={"pgp_enabled": True},
            calendar_config={"google_calendar_enabled": True},
            ai_config={"auto_reply_enabled": True},
            is_primary=False,
            is_active=True,
            created_at=datetime.now(),
        )
        multi_account_service.accounts[account.account_id] = account

        # Save accounts
        multi_account_service._save_accounts()

        # Create new service instance to test loading
        new_service = MultiAccountService(
            config=multi_account_service.config, data_dir=multi_account_service.data_dir
        )

        # Verify account was loaded
        assert account.account_id in new_service.accounts
        loaded_account = new_service.accounts[account.account_id]
        assert loaded_account.account_id == account.account_id
        assert loaded_account.email_address == account.email_address
        assert loaded_account.display_name == account.display_name
        assert loaded_account.account_type == account.account_type

    def test_save_and_load_usage_stats(self, multi_account_service):
        """Test saving and loading usage stats."""
        # Create test usage stats
        usage_stats = {
            "test_account_id": {
                "emails_sent": 100,
                "emails_received": 200,
                "emails_processed": 150,
                "storage_used_mb": 500.0,
                "response_time_hours": 2.5,
                "last_updated": datetime.now().isoformat(),
            }
        }
        multi_account_service.usage_stats = usage_stats

        # Save usage stats
        multi_account_service._save_usage_stats()

        # Create new service instance to test loading
        new_service = MultiAccountService(
            config=multi_account_service.config, data_dir=multi_account_service.data_dir
        )

        # Verify usage stats were loaded
        assert "test_account_id" in new_service.usage_stats
        loaded_stats = new_service.usage_stats["test_account_id"]
        assert loaded_stats["emails_sent"] == 100
        assert loaded_stats["emails_received"] == 200
        assert loaded_stats["emails_processed"] == 150
        assert loaded_stats["storage_used_mb"] == 500.0
        assert loaded_stats["response_time_hours"] == 2.5

    @pytest.mark.asyncio
    async def test_error_handling(self, multi_account_service):
        """Test error handling in various methods."""
        # Test with invalid data
        with patch.object(
            multi_account_service, "_save_accounts", side_effect=Exception("Save error")
        ):
            # Should not raise exception
            multi_account_service._save_accounts()

        with patch.object(
            multi_account_service,
            "_save_usage_stats",
            side_effect=Exception("Save error"),
        ):
            # Should not raise exception
            multi_account_service._save_usage_stats()

        with patch.object(
            multi_account_service, "_load_accounts", side_effect=Exception("Load error")
        ):
            # Should handle gracefully
            multi_account_service._load_accounts()
            assert multi_account_service.accounts == {}

        with patch.object(
            multi_account_service,
            "_load_usage_stats",
            side_effect=Exception("Load error"),
        ):
            # Should handle gracefully
            multi_account_service._load_usage_stats()
            assert multi_account_service.usage_stats == {}

    @pytest.mark.asyncio
    async def test_global_service_instance(self):
        """Test the global service instance."""
        assert isinstance(multi_account_service, MultiAccountService)
        assert multi_account_service.data_dir.exists()
        assert multi_account_service.accounts_dir.exists()
        assert multi_account_service.usage_dir.exists()


class TestEmailAccount:
    """Test cases for EmailAccount dataclass."""

    def test_email_account_creation(self):
        """Test EmailAccount object creation."""
        account = EmailAccount(
            account_id="test_account_id",
            account_type="user",
            email_address="test@example.com",
            display_name="Test User",
            smtp_config={"smtp_server": "smtp.example.com"},
            imap_config={"imap_server": "imap.example.com"},
            encryption_config={"pgp_enabled": True},
            calendar_config={"google_calendar_enabled": True},
            ai_config={"auto_reply_enabled": True},
            is_primary=True,
            is_active=True,
            created_at=datetime.now(),
        )

        assert account.account_id == "test_account_id"
        assert account.account_type == "user"
        assert account.email_address == "test@example.com"
        assert account.display_name == "Test User"
        assert account.smtp_config == {"smtp_server": "smtp.example.com"}
        assert account.imap_config == {"imap_server": "imap.example.com"}
        assert account.encryption_config == {"pgp_enabled": True}
        assert account.calendar_config == {"google_calendar_enabled": True}
        assert account.ai_config == {"auto_reply_enabled": True}
        assert account.is_primary is True
        assert account.is_active is True
        assert isinstance(account.created_at, datetime)
        assert account.last_used is None
        assert account.updated_at is None

    def test_email_account_defaults(self):
        """Test EmailAccount default values."""
        account = EmailAccount(
            account_id="test_account_id",
            account_type="user",
            email_address="test@example.com",
            display_name="Test User",
        )

        assert account.smtp_config == {}
        assert account.imap_config == {}
        assert account.encryption_config == {}
        assert account.calendar_config == {}
        assert account.ai_config == {}
        assert account.is_primary is False
        assert account.is_active is True
        assert isinstance(account.created_at, datetime)
        assert account.last_used is None
        assert account.updated_at is None


class TestAccountSummary:
    """Test cases for AccountSummary dataclass."""

    def test_account_summary_creation(self):
        """Test AccountSummary object creation."""
        summary = AccountSummary(
            account_id="test_account_id",
            email_address="test@example.com",
            display_name="Test User",
            account_type="user",
            is_active=True,
            is_primary=False,
            created_at=datetime.now(),
            last_used=datetime.now(),
            total_emails_sent=100,
            total_emails_received=200,
            total_emails_processed=150,
            avg_response_time_hours=2.5,
            storage_used_mb=500.0,
            last_activity=datetime.now(),
            usage_limits={"emails_per_hour": 100},
            current_usage={"emails_sent": 50},
            performance_metrics={"response_rate": 95.0},
        )

        assert summary.account_id == "test_account_id"
        assert summary.email_address == "test@example.com"
        assert summary.display_name == "Test User"
        assert summary.account_type == "user"
        assert summary.is_active is True
        assert summary.is_primary is False
        assert isinstance(summary.created_at, datetime)
        assert isinstance(summary.last_used, datetime)
        assert summary.total_emails_sent == 100
        assert summary.total_emails_received == 200
        assert summary.total_emails_processed == 150
        assert summary.avg_response_time_hours == 2.5
        assert summary.storage_used_mb == 500.0
        assert isinstance(summary.last_activity, datetime)
        assert summary.usage_limits == {"emails_per_hour": 100}
        assert summary.current_usage == {"emails_sent": 50}
        assert summary.performance_metrics == {"response_rate": 95.0}

    def test_account_summary_defaults(self):
        """Test AccountSummary default values."""
        summary = AccountSummary(
            account_id="test_account_id",
            email_address="test@example.com",
            display_name="Test User",
            account_type="user",
        )

        assert summary.is_active is True
        assert summary.is_primary is False
        assert isinstance(summary.created_at, datetime)
        assert summary.last_used is None
        assert summary.total_emails_sent == 0
        assert summary.total_emails_received == 0
        assert summary.total_emails_processed == 0
        assert summary.avg_response_time_hours == 0.0
        assert summary.storage_used_mb == 0.0
        assert isinstance(summary.last_activity, datetime)
        assert summary.usage_limits == {}
        assert summary.current_usage == {}
        assert summary.performance_metrics == {}


class TestMultiAccountConfig:
    """Test cases for MultiAccountConfig dataclass."""

    def test_multi_account_config_defaults(self):
        """Test MultiAccountConfig default values."""
        config = MultiAccountConfig()

        assert config.max_accounts_per_user == 10
        assert config.max_accounts_per_agent == 5
        assert config.default_account_type == "user"
        assert config.auto_switch_accounts is True
        assert config.account_isolation_enabled is True
        assert config.shared_resources_enabled is False
        assert config.rate_limiting_enabled is True
        assert config.usage_tracking_enabled is True

    def test_multi_account_config_custom(self):
        """Test MultiAccountConfig with custom values."""
        config = MultiAccountConfig(
            max_accounts_per_user=20,
            max_accounts_per_agent=10,
            default_account_type="agent",
            auto_switch_accounts=False,
            account_isolation_enabled=False,
            shared_resources_enabled=True,
            rate_limiting_enabled=False,
            usage_tracking_enabled=False,
        )

        assert config.max_accounts_per_user == 20
        assert config.max_accounts_per_agent == 10
        assert config.default_account_type == "agent"
        assert config.auto_switch_accounts is False
        assert config.account_isolation_enabled is False
        assert config.shared_resources_enabled is True
        assert config.rate_limiting_enabled is False
        assert config.usage_tracking_enabled is False


if __name__ == "__main__":
    pytest.main([__file__])
