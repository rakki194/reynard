"""
Tests for IMAP API Routes
"""

from datetime import datetime
from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi.testclient import TestClient

from app.core.app_factory import create_app
from app.services.email.core.imap_service import EmailMessage


class TestIMAPRoutes:
    """Test cases for IMAP API routes."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        app = create_app()
        return TestClient(app)

    @pytest.fixture
    def mock_auth(self):
        """Mock authentication."""
        with patch("app.api.imap_routes.get_current_active_user") as mock_auth:
            mock_auth.return_value = {"user_id": "test-user", "username": "testuser"}
            yield mock_auth

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
            from_agent="agent-123",
            to_agent="agent-456",
            is_agent_email=True,
            status="received",
        )

    def test_get_imap_status_success(self, client, mock_auth):
        """Test getting IMAP status successfully."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.connect = AsyncMock(return_value=True)
            mock_service.get_mailbox_info = AsyncMock(
                return_value={"total_messages": 10, "unread_messages": 3}
            )
            mock_service.disconnect = AsyncMock()

            response = client.get("/api/imap/status")

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "connected"
            assert "mailbox_info" in data
            assert "config" in data

    def test_get_imap_status_failure(self, client, mock_auth):
        """Test getting IMAP status with connection failure."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.connect = AsyncMock(return_value=False)

            response = client.get("/api/imap/status")

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "disconnected"

    def test_get_unread_emails_success(self, client, mock_auth, sample_email):
        """Test getting unread emails successfully."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.get_unread_emails = AsyncMock(return_value=[sample_email])

            response = client.get("/api/imap/emails/unread?limit=10")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["message_id"] == sample_email.message_id
            assert data[0]["subject"] == sample_email.subject
            assert data[0]["is_agent_email"] is True

    def test_get_recent_emails_success(self, client, mock_auth, sample_email):
        """Test getting recent emails successfully."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.get_recent_emails = AsyncMock(return_value=[sample_email])

            response = client.get("/api/imap/emails/recent?days=7&limit=10")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["message_id"] == sample_email.message_id

    def test_get_agent_emails_success(self, client, mock_auth, sample_email):
        """Test getting agent emails successfully."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.get_agent_emails = AsyncMock(return_value=[sample_email])

            response = client.get("/api/imap/emails/agent/agent-123?limit=50")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["from_agent"] == "agent-123"

    def test_get_emails_summary_success(self, client, mock_auth):
        """Test getting email summary successfully."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.get_received_emails_summary = AsyncMock(
                return_value={
                    "total_emails": 10,
                    "agent_emails": 5,
                    "unread_emails": 3,
                    "replied_emails": 2,
                    "agent_breakdown": {"agent-123": 3, "agent-456": 2},
                    "last_updated": datetime.now().isoformat(),
                }
            )

            response = client.get("/api/imap/emails/summary")

            assert response.status_code == 200
            data = response.json()
            assert data["total_emails"] == 10
            assert data["agent_emails"] == 5
            assert data["unread_emails"] == 3
            assert data["replied_emails"] == 2
            assert "agent-123" in data["agent_breakdown"]

    def test_mark_email_as_read_success(self, client, mock_auth):
        """Test marking email as read successfully."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.mark_as_read = AsyncMock(return_value=True)

            response = client.post("/api/imap/emails/test-message-123/mark-read")

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "marked as read" in data["message"]

    def test_mark_email_as_read_not_found(self, client, mock_auth):
        """Test marking non-existent email as read."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.mark_as_read = AsyncMock(return_value=False)

            response = client.post("/api/imap/emails/non-existent/mark-read")

            assert response.status_code == 404
            data = response.json()
            assert "not found" in data["detail"]

    def test_mark_email_as_processed_success(self, client, mock_auth):
        """Test marking email as processed successfully."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.mark_email_as_processed = AsyncMock(return_value=True)

            response = client.post("/api/imap/emails/test-message-123/mark-processed")

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "marked as processed" in data["message"]

    def test_mark_email_as_processed_not_found(self, client, mock_auth):
        """Test marking non-existent email as processed."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.mark_email_as_processed = AsyncMock(return_value=False)

            response = client.post("/api/imap/emails/non-existent/mark-processed")

            assert response.status_code == 404
            data = response.json()
            assert "not found" in data["detail"]

    def test_start_email_monitoring_success(self, client, mock_auth):
        """Test starting email monitoring successfully."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.start_email_monitoring = AsyncMock()

            response = client.post("/api/imap/monitoring/start?interval=60")

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "monitoring started" in data["message"]

    def test_test_imap_connection_success(self, client, mock_auth):
        """Test IMAP connection test successfully."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.connect = AsyncMock(return_value=True)
            mock_service.get_mailbox_info = AsyncMock(
                return_value={"total_messages": 10, "unread_messages": 3}
            )
            mock_service.get_unread_emails = AsyncMock(return_value=[])
            mock_service.disconnect = AsyncMock()

            response = client.get("/api/imap/test")

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "test successful" in data["message"]
            assert "details" in data

    def test_test_imap_connection_failure(self, client, mock_auth):
        """Test IMAP connection test failure."""
        with patch("app.api.imap_routes.imap_service") as mock_service:
            mock_service.connect = AsyncMock(return_value=False)

            response = client.get("/api/imap/test")

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is False
            assert "Failed to connect" in data["message"]

    def test_unauthorized_access(self, client):
        """Test unauthorized access to IMAP routes."""
        # Test without authentication
        response = client.get("/api/imap/status")
        assert response.status_code == 401  # Unauthorized

    def test_invalid_parameters(self, client, mock_auth):
        """Test routes with invalid parameters."""
        # Test with negative limit
        response = client.get("/api/imap/emails/unread?limit=-1")
        assert response.status_code == 200  # Should handle gracefully

        # Test with invalid days
        response = client.get("/api/imap/emails/recent?days=-1")
        assert response.status_code == 200  # Should handle gracefully


if __name__ == "__main__":
    pytest.main([__file__])
