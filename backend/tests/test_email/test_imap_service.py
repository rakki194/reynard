"""
Tests for IMAP Service with Agent Integration
"""

import asyncio
import json
import tempfile
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, Mock, patch

import pytest

from app.services.email.core.imap_service import EmailMessage, IMAPConfig, IMAPService


class TestIMAPService:
    """Test cases for IMAP service with agent integration."""

    @pytest.fixture
    def temp_dir(self):
        """Create temporary directory for test data."""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield temp_dir

    @pytest.fixture
    def mock_config(self):
        """Create mock IMAP configuration."""
        config = IMAPConfig()
        config.imap_server = "imap.test.com"
        config.imap_port = 993
        config.imap_username = "test@example.com"
        config.imap_password = "test_password"
        config.use_ssl = True
        config.mailbox = "INBOX"
        return config

    @pytest.fixture
    def imap_service(self, mock_config, temp_dir):
        """Create IMAP service instance for testing."""
        return IMAPService(config=mock_config, data_dir=temp_dir)

    @pytest.fixture
    def sample_email(self):
        """Create sample email message."""
        return EmailMessage(
            message_id="test-message-123",
            subject="Test Email",
            sender="sender@example.com",
            recipient="recipient@example.com",
            date=datetime.now(),
            body="This is a test email body.",
            html_body="<p>This is a test email body.</p>",
            attachments=[],
            from_agent=None,
            to_agent=None,
            is_agent_email=False,
            status="received",
        )

    def test_imap_service_initialization(self, imap_service, temp_dir):
        """Test IMAP service initialization."""
        assert imap_service.config.imap_server == "imap.test.com"
        assert imap_service.config.imap_port == 993
        assert imap_service.data_dir == Path(temp_dir)
        assert imap_service.received_emails_file.exists()
        assert imap_service.agent_emails_file.exists()
        assert imap_service.received_emails == {}

    def test_validate_config_success(self, mock_config):
        """Test successful configuration validation."""
        service = IMAPService(config=mock_config)
        # Should not raise any exception
        assert service.config.imap_username == "test@example.com"

    def test_validate_config_missing_username(self):
        """Test configuration validation with missing username."""
        config = IMAPConfig()
        config.imap_username = ""
        config.imap_password = "test_password"

        with pytest.raises(ValueError, match="IMAP username is required"):
            IMAPService(config=config)

    def test_validate_config_missing_password(self):
        """Test configuration validation with missing password."""
        config = IMAPConfig()
        config.imap_username = "test@example.com"
        config.imap_password = ""

        with pytest.raises(ValueError, match="IMAP password is required"):
            IMAPService(config=config)

    def test_save_and_load_received_emails(self, imap_service, sample_email):
        """Test saving and loading received emails."""
        # Add email to received emails
        imap_service.received_emails[sample_email.message_id] = sample_email

        # Save emails
        imap_service._save_received_emails()

        # Create new service instance to test loading
        new_service = IMAPService(
            config=imap_service.config, data_dir=imap_service.data_dir
        )

        # Check if email was loaded
        assert sample_email.message_id in new_service.received_emails
        loaded_email = new_service.received_emails[sample_email.message_id]
        assert loaded_email.subject == sample_email.subject
        assert loaded_email.sender == sample_email.sender

    @pytest.mark.asyncio
    async def test_detect_agent_email_with_agent_service(
        self, imap_service, sample_email
    ):
        """Test agent email detection with agent service available."""
        # Mock agent email service
        mock_agent_config = Mock()
        mock_agent_config.agent_id = "agent-123"

        with patch("app.services.imap_service.agent_email_service") as mock_service:
            mock_service.get_agent_config_by_email = AsyncMock(
                return_value=mock_agent_config
            )

            # Test detection
            result = await imap_service._detect_agent_email(sample_email)

            assert result.from_agent == "agent-123"
            assert result.is_agent_email is True

    @pytest.mark.asyncio
    async def test_detect_agent_email_without_agent_service(
        self, imap_service, sample_email
    ):
        """Test agent email detection without agent service."""
        with patch(
            "app.services.imap_service.agent_email_service", side_effect=ImportError
        ):
            result = await imap_service._detect_agent_email(sample_email)

            assert result.from_agent is None
            assert result.is_agent_email is False

    @pytest.mark.asyncio
    async def test_process_agent_email(self, imap_service, sample_email):
        """Test processing agent email."""
        sample_email.is_agent_email = True
        sample_email.to_agent = "agent-123"

        with patch("app.services.imap_service.agent_email_service") as mock_service:
            mock_service.update_agent_stats = AsyncMock()
            mock_service.log_agent_interaction = AsyncMock()
            mock_service.get_agent_config = AsyncMock(
                return_value=Mock(auto_reply_enabled=False)
            )

            await imap_service._process_agent_email(sample_email)

            # Verify agent stats were updated
            mock_service.update_agent_stats.assert_called_once_with(
                "agent-123", "received"
            )

            # Verify interaction was logged
            mock_service.log_agent_interaction.assert_called_once()

    @pytest.mark.asyncio
    async def test_send_auto_reply(self, imap_service, sample_email):
        """Test sending auto-reply."""
        mock_agent_config = Mock()
        mock_agent_config.agent_id = "agent-123"
        mock_agent_config.agent_name = "Test Agent"
        mock_agent_config.agent_email = "agent@example.com"
        mock_agent_config.auto_reply_template = None

        with patch("app.services.imap_service.email_service") as mock_email_service:
            mock_email_service.send_email = AsyncMock(return_value={"success": True})

            await imap_service._send_auto_reply(sample_email, mock_agent_config)

            # Verify email was sent
            mock_email_service.send_email.assert_called_once()

            # Check email content
            call_args = mock_email_service.send_email.call_args[0][0]
            assert "Test Agent" in call_args.body
            assert sample_email.sender in call_args.to_emails

    @pytest.mark.asyncio
    async def test_trigger_automated_responses(self, imap_service, sample_email):
        """Test triggering automated responses."""
        sample_email.to_agent = "agent-123"
        sample_email.subject = "URGENT: Test Subject"
        sample_email.body = "This is an urgent message"

        with patch("app.services.imap_service.agent_email_service") as mock_service:
            mock_service.process_automated_email = AsyncMock()

            await imap_service._trigger_automated_responses(sample_email)

            # Verify automated email was processed
            mock_service.process_automated_email.assert_called_once_with(
                "agent-123",
                "urgent_email_received",
                {
                    "sender": sample_email.sender,
                    "subject": sample_email.subject,
                    "body": sample_email.body,
                    "date": sample_email.date.isoformat(),
                    "message_id": sample_email.message_id,
                },
            )

    @pytest.mark.asyncio
    async def test_get_agent_emails(self, imap_service, sample_email):
        """Test getting emails for a specific agent."""
        # Add emails to received emails
        sample_email.from_agent = "agent-123"
        imap_service.received_emails[sample_email.message_id] = sample_email

        with patch("app.services.imap_service.agent_email_service") as mock_service:
            mock_agent_config = Mock()
            mock_agent_config.agent_email = "agent@example.com"
            mock_service.get_agent_config = AsyncMock(return_value=mock_agent_config)

            emails = await imap_service.get_agent_emails("agent-123")

            assert len(emails) == 1
            assert emails[0].message_id == sample_email.message_id

    @pytest.mark.asyncio
    async def test_get_received_emails_summary(self, imap_service, sample_email):
        """Test getting received emails summary."""
        # Add emails with different statuses
        sample_email.status = "received"
        imap_service.received_emails[sample_email.message_id] = sample_email

        another_email = EmailMessage(
            message_id="test-message-456",
            subject="Another Test Email",
            sender="another@example.com",
            recipient="recipient@example.com",
            date=datetime.now(),
            body="Another test email body.",
            from_agent="agent-456",
            to_agent="agent-123",
            is_agent_email=True,
            status="replied",
        )
        imap_service.received_emails[another_email.message_id] = another_email

        summary = await imap_service.get_received_emails_summary()

        assert summary["total_emails"] == 2
        assert summary["agent_emails"] == 1
        assert summary["unread_emails"] == 1
        assert summary["replied_emails"] == 1
        assert "agent-456" in summary["agent_breakdown"]
        assert "agent-123" in summary["agent_breakdown"]

    @pytest.mark.asyncio
    async def test_mark_email_as_processed(self, imap_service, sample_email):
        """Test marking email as processed."""
        imap_service.received_emails[sample_email.message_id] = sample_email

        result = await imap_service.mark_email_as_processed(sample_email.message_id)

        assert result is True
        assert (
            imap_service.received_emails[sample_email.message_id].status == "processed"
        )

    @pytest.mark.asyncio
    async def test_mark_email_as_processed_not_found(self, imap_service):
        """Test marking non-existent email as processed."""
        result = await imap_service.mark_email_as_processed("non-existent-id")

        assert result is False

    @pytest.mark.asyncio
    async def test_start_email_monitoring(self, imap_service):
        """Test starting email monitoring."""
        with patch.object(
            imap_service, "get_unread_emails", new_callable=AsyncMock
        ) as mock_get_emails:
            mock_get_emails.return_value = []

            # Start monitoring with short interval for testing
            monitoring_task = asyncio.create_task(
                imap_service.start_email_monitoring(interval=0.1)
            )

            # Let it run briefly
            await asyncio.sleep(0.2)

            # Cancel the monitoring task
            monitoring_task.cancel()

            try:
                await monitoring_task
            except asyncio.CancelledError:
                pass

            # Verify get_unread_emails was called
            assert mock_get_emails.call_count > 0


class TestEmailMessage:
    """Test cases for EmailMessage dataclass."""

    def test_email_message_creation(self):
        """Test creating EmailMessage instance."""
        email = EmailMessage(
            message_id="test-123",
            subject="Test Subject",
            sender="sender@example.com",
            recipient="recipient@example.com",
            date=datetime.now(),
            body="Test body",
        )

        assert email.message_id == "test-123"
        assert email.subject == "Test Subject"
        assert email.sender == "sender@example.com"
        assert email.recipient == "recipient@example.com"
        assert email.body == "Test body"
        assert email.attachments == []
        assert email.from_agent is None
        assert email.to_agent is None
        assert email.is_agent_email is False
        assert email.status == "received"

    def test_email_message_with_agent_info(self):
        """Test creating EmailMessage with agent information."""
        email = EmailMessage(
            message_id="test-123",
            subject="Test Subject",
            sender="sender@example.com",
            recipient="recipient@example.com",
            date=datetime.now(),
            body="Test body",
            from_agent="agent-123",
            to_agent="agent-456",
            is_agent_email=True,
            status="processed",
        )

        assert email.from_agent == "agent-123"
        assert email.to_agent == "agent-456"
        assert email.is_agent_email is True
        assert email.status == "processed"


if __name__ == "__main__":
    pytest.main([__file__])
