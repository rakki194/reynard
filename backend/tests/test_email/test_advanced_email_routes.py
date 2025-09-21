"""
Tests for Advanced Email API Routes.

This module contains comprehensive tests for the advanced email API endpoints.
"""

import pytest
import pytest_asyncio
import asyncio
import json
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api.email_routes import router
from app.services.email_analytics_service import EmailMetrics, EmailInsight
from app.services.email_encryption_service import EncryptionKey, EncryptedEmail
from app.services.calendar_integration_service import CalendarEvent, MeetingRequest
from app.services.ai_email_response_service import EmailContext, AIResponse
from app.services.multi_account_service import EmailAccount, AccountSummary


class TestAdvancedEmailRoutes:
    """Test cases for advanced email API routes."""

    @pytest.fixture
    def app(self):
        """Create test FastAPI app."""
        app = FastAPI()
        app.include_router(router)
        return app

    @pytest.fixture
    def client(self, app):
        """Create test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_user(self):
        """Mock authenticated user."""
        return {
            "id": "test_user_id",
            "username": "test_user",
            "email": "test@example.com",
            "full_name": "Test User",
        }

    @pytest.fixture
    def mock_auth_dependency(self, mock_user):
        """Mock authentication dependency."""

        def mock_get_current_user():
            return mock_user

        return mock_get_current_user

    # Email Analytics Tests

    @pytest.mark.asyncio
    async def test_get_email_analytics_metrics_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful email analytics metrics retrieval."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.email_analytics_service.get_email_metrics"
            ) as mock_get_metrics:
                # Mock metrics response
                mock_metrics = EmailMetrics(
                    total_emails=100,
                    sent_emails=50,
                    received_emails=50,
                    agent_emails=25,
                    unread_emails=10,
                    replied_emails=30,
                    processed_emails=40,
                    avg_response_time_hours=2.5,
                    avg_email_length=150.0,
                    most_active_hour=14,
                    most_active_day="Tuesday",
                    top_senders=[{"email": "sender@example.com", "count": 10}],
                    top_recipients=[{"email": "recipient@example.com", "count": 15}],
                    email_volume_trend=[{"date": "2023-01-01", "count": 5}],
                    agent_activity={"agent1": {"sent": 10, "received": 5}},
                    content_analysis={
                        "common_subjects": [{"phrase": "test", "count": 3}]
                    },
                    performance_metrics={"response_rate": 75.0},
                )
                mock_get_metrics.return_value = mock_metrics

                response = client.get("/api/email/analytics/metrics")

                assert response.status_code == 200
                data = response.json()
                assert data["total_emails"] == 100
                assert data["sent_emails"] == 50
                assert data["received_emails"] == 50
                assert data["agent_emails"] == 25
                assert data["unread_emails"] == 10
                assert data["replied_emails"] == 30
                assert data["processed_emails"] == 40
                assert data["avg_response_time_hours"] == 2.5
                assert data["avg_email_length"] == 150.0
                assert data["most_active_hour"] == 14
                assert data["most_active_day"] == "Tuesday"
                assert len(data["top_senders"]) == 1
                assert len(data["top_recipients"]) == 1
                assert len(data["email_volume_trend"]) == 1
                assert "agent1" in data["agent_activity"]
                assert "common_subjects" in data["content_analysis"]
                assert "response_rate" in data["performance_metrics"]
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_email_analytics_metrics_with_filters(
        self, app, client, mock_auth_dependency
    ):
        """Test email analytics metrics with filters."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.email_analytics_service.get_email_metrics"
            ) as mock_get_metrics:
                mock_metrics = EmailMetrics(
                    total_emails=50,
                    sent_emails=25,
                    received_emails=25,
                    agent_emails=10,
                    unread_emails=5,
                    replied_emails=15,
                    processed_emails=20,
                    avg_response_time_hours=1.5,
                    avg_email_length=120.0,
                    most_active_hour=10,
                    most_active_day="Monday",
                    top_senders=[],
                    top_recipients=[],
                    email_volume_trend=[],
                    agent_activity={},
                    content_analysis={},
                    performance_metrics={},
                )
                mock_get_metrics.return_value = mock_metrics

                # Test with period filters
                response = client.get(
                    "/api/email/analytics/metrics",
                    params={
                        "period_start": "2023-01-01T00:00:00",
                        "period_end": "2023-01-31T23:59:59",
                        "agent_id": "agent1",
                        "use_cache": False,
                    },
                )

                assert response.status_code == 200
                data = response.json()
                assert data["total_emails"] == 50

                # Verify service was called with correct parameters
                mock_get_metrics.assert_called_once()
                call_args = mock_get_metrics.call_args
                assert call_args[1]["agent_id"] == "agent1"
                assert call_args[1]["use_cache"] is False
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_email_analytics_insights_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful email analytics insights retrieval."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.email_analytics_service.generate_insights"
            ) as mock_generate_insights:
                # Mock insights response
                mock_insights = [
                    EmailInsight(
                        insight_type="trend",
                        title="Volume Increase",
                        description="Email volume has increased by 20%",
                        severity="medium",
                        confidence=0.8,
                        data={"increase_percentage": 20.0},
                        timestamp=datetime.now(),
                        actionable=True,
                        suggested_actions=["Monitor capacity", "Scale resources"],
                    ),
                    EmailInsight(
                        insight_type="anomaly",
                        title="Unusual Activity",
                        description="Detected unusual email patterns",
                        severity="high",
                        confidence=0.9,
                        data={"anomaly_score": 0.85},
                        timestamp=datetime.now(),
                        actionable=True,
                        suggested_actions=["Investigate", "Review logs"],
                    ),
                ]
                mock_generate_insights.return_value = mock_insights

                response = client.get("/api/email/analytics/insights")

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2

                # Check first insight
                insight1 = data[0]
                assert insight1["insight_type"] == "trend"
                assert insight1["title"] == "Volume Increase"
                assert insight1["description"] == "Email volume has increased by 20%"
                assert insight1["severity"] == "medium"
                assert insight1["confidence"] == 0.8
                assert insight1["data"]["increase_percentage"] == 20.0
                assert insight1["actionable"] is True
                assert len(insight1["suggested_actions"]) == 2

                # Check second insight
                insight2 = data[1]
                assert insight2["insight_type"] == "anomaly"
                assert insight2["title"] == "Unusual Activity"
                assert insight2["severity"] == "high"
                assert insight2["confidence"] == 0.9
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_analytics_dashboard_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful analytics dashboard retrieval."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.email_analytics_service.get_email_metrics"
            ) as mock_get_metrics:
                with patch(
                    "app.api.email_routes.email_analytics_service.generate_insights"
                ) as mock_generate_insights:
                    with patch(
                        "app.api.email_routes.email_analytics_service.get_email_trends"
                    ) as mock_get_trends:
                        # Mock responses
                        mock_metrics = EmailMetrics(
                            total_emails=100,
                            sent_emails=50,
                            received_emails=50,
                            agent_emails=25,
                            unread_emails=10,
                            replied_emails=30,
                            processed_emails=40,
                            avg_response_time_hours=2.5,
                            avg_email_length=150.0,
                            most_active_hour=14,
                            most_active_day="Tuesday",
                            top_senders=[],
                            top_recipients=[],
                            email_volume_trend=[],
                            agent_activity={},
                            content_analysis={},
                            performance_metrics={},
                        )
                        mock_insights = [
                            EmailInsight(
                                insight_type="trend",
                                title="Test Insight",
                                description="Test description",
                                severity="low",
                                confidence=0.5,
                                data={},
                                timestamp=datetime.now(),
                                actionable=False,
                                suggested_actions=[],
                            )
                        ]
                        mock_trends = [
                            {"date": "2023-01-01", "value": 10, "emails_count": 10},
                            {"date": "2023-01-02", "value": 15, "emails_count": 15},
                        ]

                        mock_get_metrics.return_value = mock_metrics
                        mock_generate_insights.return_value = mock_insights
                        mock_get_trends.return_value = mock_trends

                        response = client.get(
                            "/api/email/analytics/dashboard?period_days=7"
                        )

                        assert response.status_code == 200
                        data = response.json()
                        assert "period_start" in data
                        assert "period_end" in data
                        assert data["period_days"] == 7
                        assert "metrics" in data
                        assert "insights" in data
                        assert "trends" in data
                        assert "generated_at" in data

                        # Check metrics
                        assert data["metrics"]["total_emails"] == 100
                        assert data["metrics"]["sent_emails"] == 50

                        # Check insights
                        assert len(data["insights"]) == 1
                        assert data["insights"][0]["insight_type"] == "trend"

                        # Check trends
                        assert "volume" in data["trends"]
                        assert len(data["trends"]["volume"]) == 2
        finally:
            app.dependency_overrides.clear()

    # Email Encryption Tests

    @pytest.mark.asyncio
    async def test_generate_encryption_key_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful encryption key generation."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.email_encryption_service.generate_pgp_key"
            ) as mock_generate_key:
                # Mock key response
                mock_key = EncryptionKey(
                    key_id="test_key_id",
                    key_type="pgp",
                    fingerprint="ABCD1234EFGH5678IJKL9012MNOP3456QRST7890",
                    public_key="-----BEGIN PGP PUBLIC KEY BLOCK-----\nTest Key Data\n-----END PGP PUBLIC KEY BLOCK-----",
                    private_key="-----BEGIN PGP PRIVATE KEY BLOCK-----\nTest Private Key Data\n-----END PGP PRIVATE KEY BLOCK-----",
                    user_id="Test User <test@example.com>",
                    email="test@example.com",
                    created_at=datetime.now(),
                )
                mock_generate_key.return_value = mock_key

                response = client.post(
                    "/api/email/encryption/generate-key",
                    params={
                        "name": "Test User",
                        "email": "test@example.com",
                        "passphrase": "testpass",
                        "key_length": 2048,
                    },
                )

                assert response.status_code == 200
                data = response.json()
                assert data["key_id"] == "test_key_id"
                assert data["fingerprint"] == "ABCD1234EFGH5678IJKL9012MNOP3456QRST7890"
                assert (
                    data["public_key"]
                    == "-----BEGIN PGP PUBLIC KEY BLOCK-----\nTest Key Data\n-----END PGP PUBLIC KEY BLOCK-----"
                )
                assert data["user_id"] == "Test User <test@example.com>"
                assert data["email"] == "test@example.com"
                assert "created_at" in data
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_encrypt_email_content_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful email content encryption."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.email_encryption_service.encrypt_email"
            ) as mock_encrypt:
                # Mock encrypted email response
                mock_encrypted = EncryptedEmail(
                    original_content="Test email content",
                    encrypted_content="-----BEGIN PGP MESSAGE-----\nEncrypted Content\n-----END PGP MESSAGE-----",
                    encryption_method="pgp",
                    key_id="test_key_id",
                    signature="Digital signature",
                    is_signed=True,
                    encrypted_at=datetime.now(),
                )
                mock_encrypt.return_value = mock_encrypted

                response = client.post(
                    "/api/email/encryption/encrypt",
                    params={
                        "content": "Test email content",
                        "recipient_email": "recipient@example.com",
                        "encryption_method": "pgp",
                        "sign_with": "signing_key_id",
                    },
                )

                assert response.status_code == 200
                data = response.json()
                assert (
                    data["encrypted_content"]
                    == "-----BEGIN PGP MESSAGE-----\nEncrypted Content\n-----END PGP MESSAGE-----"
                )
                assert data["encryption_method"] == "pgp"
                assert data["key_id"] == "test_key_id"
                assert data["signature"] == "Digital signature"
                assert data["is_signed"] is True
                assert "encrypted_at" in data
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_list_encryption_keys_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful encryption keys listing."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.email_encryption_service.list_keys"
            ) as mock_list_keys:
                # Mock keys response
                mock_keys = [
                    EncryptionKey(
                        key_id="key1",
                        key_type="pgp",
                        fingerprint="fingerprint1",
                        public_key="-----BEGIN PGP PUBLIC KEY BLOCK-----\n...\n-----END PGP PUBLIC KEY BLOCK-----",
                        user_id="User 1 <user1@example.com>",
                        email="user1@example.com",
                        created_at=datetime.now(),
                        expires_at=datetime.now() + timedelta(days=365),
                        is_revoked=False,
                        trust_level=5,
                    ),
                    EncryptionKey(
                        key_id="key2",
                        key_type="smime",
                        fingerprint="fingerprint2",
                        public_key="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
                        user_id="User 2 <user2@example.com>",
                        email="user2@example.com",
                        created_at=datetime.now(),
                        expires_at=None,
                        is_revoked=False,
                        trust_level=3,
                    ),
                ]
                mock_list_keys.return_value = mock_keys

                response = client.get("/api/email/encryption/keys?key_type=pgp")

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2

                # Check first key
                key1 = data[0]
                assert key1["key_id"] == "key1"
                assert key1["key_type"] == "pgp"
                assert key1["fingerprint"] == "fingerprint1"
                assert key1["email"] == "user1@example.com"
                assert key1["is_revoked"] is False
                assert key1["trust_level"] == 5

                # Check second key
                key2 = data[1]
                assert key2["key_id"] == "key2"
                assert key2["key_type"] == "smime"
                assert key2["fingerprint"] == "fingerprint2"
                assert key2["email"] == "user2@example.com"
                assert key2["is_revoked"] is False
                assert key2["trust_level"] == 3
        finally:
            app.dependency_overrides.clear()

    # Calendar Integration Tests

    @pytest.mark.asyncio
    async def test_extract_meeting_requests_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful meeting request extraction."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.calendar_integration_service.extract_meeting_requests_from_email"
            ) as mock_extract:
                # Mock meeting requests response
                mock_requests = [
                    MeetingRequest(
                        request_id="req1",
                        email_message_id="msg1",
                        subject="Meeting Request",
                        proposed_times=[datetime.now() + timedelta(hours=1)],
                        duration_minutes=60,
                        attendees=["user1@example.com", "user2@example.com"],
                        location="Conference Room A",
                        description="Project discussion meeting",
                        priority="normal",
                        meeting_type="meeting",
                        status="pending",
                    )
                ]
                mock_extract.return_value = mock_requests

                response = client.post(
                    "/api/email/calendar/extract-meetings",
                    params={
                        "email_subject": "Meeting Request",
                        "email_body": "Let's schedule a meeting for tomorrow at 2 PM",
                        "email_message_id": "msg1",
                        "sender_email": "sender@example.com",
                    },
                )

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 1

                request = data[0]
                assert request["request_id"] == "req1"
                assert request["email_message_id"] == "msg1"
                assert request["subject"] == "Meeting Request"
                assert len(request["proposed_times"]) == 1
                assert request["duration_minutes"] == 60
                assert len(request["attendees"]) == 2
                assert request["location"] == "Conference Room A"
                assert request["description"] == "Project discussion meeting"
                assert request["priority"] == "normal"
                assert request["meeting_type"] == "meeting"
                assert request["status"] == "pending"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_schedule_meeting_success(self, app, client, mock_auth_dependency):
        """Test successful meeting scheduling."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.calendar_integration_service.schedule_meeting"
            ) as mock_schedule:
                # Mock calendar event response
                start_time = datetime.now() + timedelta(hours=1)
                end_time = start_time + timedelta(hours=1)
                mock_event = CalendarEvent(
                    event_id="event1",
                    title="Scheduled Meeting",
                    description="Project discussion meeting",
                    start_time=start_time,
                    end_time=end_time,
                    location="Conference Room A",
                    attendees=["user1@example.com", "user2@example.com"],
                    organizer="user1@example.com",
                    status="confirmed",
                    calendar_id="primary",
                    meeting_link="https://meet.example.com/room123",
                )
                mock_schedule.return_value = mock_event

                response = client.post(
                    "/api/email/calendar/schedule-meeting",
                    params={
                        "meeting_request_id": "req1",
                        "selected_time": start_time.isoformat(),
                        "calendar_id": "primary",
                    },
                )

                assert response.status_code == 200
                data = response.json()
                assert data["event_id"] == "event1"
                assert data["title"] == "Scheduled Meeting"
                assert data["description"] == "Project discussion meeting"
                assert data["start_time"] == start_time.isoformat()
                assert data["end_time"] == end_time.isoformat()
                assert data["location"] == "Conference Room A"
                assert len(data["attendees"]) == 2
                assert data["organizer"] == "user1@example.com"
                assert data["status"] == "confirmed"
                assert data["calendar_id"] == "primary"
                assert data["meeting_link"] == "https://meet.example.com/room123"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_upcoming_meetings_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful upcoming meetings retrieval."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.calendar_integration_service.get_upcoming_meetings"
            ) as mock_get_meetings:
                # Mock meetings response
                start_time = datetime.now() + timedelta(hours=1)
                end_time = start_time + timedelta(hours=1)
                mock_meetings = [
                    CalendarEvent(
                        event_id="event1",
                        title="Upcoming Meeting",
                        description="Project review meeting",
                        start_time=start_time,
                        end_time=end_time,
                        location="Conference Room B",
                        attendees=["user1@example.com"],
                        organizer="user1@example.com",
                        status="confirmed",
                        meeting_link="https://meet.example.com/room456",
                    )
                ]
                mock_get_meetings.return_value = mock_meetings

                response = client.get(
                    "/api/email/calendar/upcoming",
                    params={"user_email": "user1@example.com", "days_ahead": 7},
                )

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 1

                meeting = data[0]
                assert meeting["event_id"] == "event1"
                assert meeting["title"] == "Upcoming Meeting"
                assert meeting["description"] == "Project review meeting"
                assert meeting["start_time"] == start_time.isoformat()
                assert meeting["end_time"] == end_time.isoformat()
                assert meeting["location"] == "Conference Room B"
                assert len(meeting["attendees"]) == 1
                assert meeting["organizer"] == "user1@example.com"
                assert meeting["status"] == "confirmed"
                assert meeting["meeting_link"] == "https://meet.example.com/room456"
        finally:
            app.dependency_overrides.clear()

    # AI-Powered Response Tests

    @pytest.mark.asyncio
    async def test_analyze_email_context_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful email context analysis."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.get_ai_email_response_service"
            ) as mock_get_service:
                mock_service = Mock()
                mock_get_service.return_value = mock_service

                # Mock context response
                mock_context = EmailContext(
                    context_id="context1",
                    original_subject="Question about project",
                    original_body="What is the status of the project?",
                    sender_email="sender@example.com",
                    recipient_email="recipient@example.com",
                    sender_name="John Sender",
                    recipient_name="Jane Recipient",
                    email_type="question",
                    priority="normal",
                    sentiment="neutral",
                    language="en",
                    agent_personality={"tone": "professional", "style": "concise"},
                    extracted_at=datetime.now(),
                )
                mock_service.analyze_email_context.return_value = mock_context

                email_data = {
                    "subject": "Question about project",
                    "body": "What is the status of the project?",
                    "sender_email": "sender@example.com",
                    "recipient_email": "recipient@example.com",
                }

                response = client.post("/api/email/ai/analyze-context", json=email_data)

                assert response.status_code == 200
                data = response.json()
                assert data["original_subject"] == "Question about project"
                assert data["original_body"] == "What is the status of the project?"
                assert data["sender_email"] == "sender@example.com"
                assert data["recipient_email"] == "recipient@example.com"
                assert data["sender_name"] == "John Sender"
                assert data["recipient_name"] == "Jane Recipient"
                assert data["email_type"] == "question"
                assert data["priority"] == "normal"
                assert data["sentiment"] == "neutral"
                assert data["language"] == "en"
                assert data["agent_personality"]["tone"] == "professional"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_generate_ai_response_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful AI response generation."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.get_ai_email_response_service"
            ) as mock_get_service:
                mock_service = Mock()
                mock_get_service.return_value = mock_service

                # Mock AI response
                mock_response = AIResponse(
                    response_id="response1",
                    original_email_id="email1",
                    subject="Re: Question about project",
                    body="Thank you for your inquiry. The project is on track and expected to be completed by next week.",
                    html_body="<p>Thank you for your inquiry. The project is on track and expected to be completed by next week.</p>",
                    tone="professional",
                    confidence_score=0.85,
                    response_type="reply",
                    suggested_actions=["Send status report", "Schedule follow-up"],
                    generated_at=datetime.now(),
                    model_used="gpt-3.5-turbo",
                    processing_time_ms=1200,
                )
                mock_service.generate_response.return_value = mock_response

                email_context = {
                    "context_id": "context1",
                    "original_subject": "Question about project",
                    "original_body": "What is the status of the project?",
                    "sender_email": "sender@example.com",
                    "recipient_email": "recipient@example.com",
                    "email_type": "question",
                    "priority": "normal",
                    "sentiment": "neutral",
                    "language": "en",
                    "agent_personality": {"tone": "professional"},
                }

                response = client.post(
                    "/api/email/ai/generate-response",
                    params={
                        "response_type": "reply",
                        "custom_instructions": "Be helpful and professional",
                        "model": "gpt-3.5-turbo",
                    },
                    json=email_context,
                )

                assert response.status_code == 200
                data = response.json()
                assert data["response_id"] == "response1"
                assert data["original_email_id"] == "email1"
                assert data["subject"] == "Re: Question about project"
                assert "Thank you for your inquiry" in data["body"]
                assert data["tone"] == "professional"
                assert data["confidence_score"] == 0.85
                assert data["response_type"] == "reply"
                assert len(data["suggested_actions"]) == 2
                assert data["model_used"] == "gpt-3.5-turbo"
                assert data["processing_time_ms"] == 1200
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_ai_response_history_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful AI response history retrieval."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.get_ai_email_response_service"
            ) as mock_get_service:
                mock_service = Mock()
                mock_get_service.return_value = mock_service

                # Mock response history
                mock_responses = [
                    AIResponse(
                        response_id="response1",
                        original_email_id="email1",
                        subject="Re: Question 1",
                        body="Response to question 1",
                        tone="professional",
                        confidence_score=0.8,
                        response_type="reply",
                        generated_at=datetime.now(),
                        model_used="gpt-3.5-turbo",
                    ),
                    AIResponse(
                        response_id="response2",
                        original_email_id="email2",
                        subject="Re: Question 2",
                        body="Response to question 2",
                        tone="friendly",
                        confidence_score=0.9,
                        response_type="reply",
                        generated_at=datetime.now(),
                        model_used="gpt-3.5-turbo",
                    ),
                ]
                mock_service.get_response_history.return_value = mock_responses

                response = client.get(
                    "/api/email/ai/response-history",
                    params={"email_address": "user@example.com", "limit": 10},
                )

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2

                # Check first response
                response1 = data[0]
                assert response1["response_id"] == "response1"
                assert response1["subject"] == "Re: Question 1"
                assert response1["body"] == "Response to question 1"
                assert response1["tone"] == "professional"
                assert response1["confidence_score"] == 0.8
                assert response1["response_type"] == "reply"
                assert response1["model_used"] == "gpt-3.5-turbo"

                # Check second response
                response2 = data[1]
                assert response2["response_id"] == "response2"
                assert response2["subject"] == "Re: Question 2"
                assert response2["body"] == "Response to question 2"
                assert response2["tone"] == "friendly"
                assert response2["confidence_score"] == 0.9
        finally:
            app.dependency_overrides.clear()

    # Multi-Account Support Tests

    @pytest.mark.asyncio
    async def test_create_email_account_success(
        self, app, client, mock_auth_dependency
    ):
        """Test successful email account creation."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.multi_account_service.create_account"
            ) as mock_create:
                # Mock account response
                mock_account = EmailAccount(
                    account_id="account1",
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
                mock_create.return_value = mock_account

                response = client.post(
                    "/api/email/accounts/create",
                    params={
                        "account_type": "user",
                        "email_address": "test@example.com",
                        "display_name": "Test User",
                        "is_primary": False,
                    },
                    json={
                        "smtp_config": {"smtp_server": "smtp.example.com"},
                        "imap_config": {"imap_server": "imap.example.com"},
                        "encryption_config": {"pgp_enabled": True},
                        "calendar_config": {"google_calendar_enabled": True},
                        "ai_config": {"auto_reply_enabled": True},
                    },
                )

                assert response.status_code == 200
                data = response.json()
                assert data["account_id"] == "account1"
                assert data["account_type"] == "user"
                assert data["email_address"] == "test@example.com"
                assert data["display_name"] == "Test User"
                assert data["is_active"] is True
                assert data["is_primary"] is False
                assert "created_at" in data
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_list_email_accounts_success(self, app, client, mock_auth_dependency):
        """Test successful email accounts listing."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.multi_account_service.list_accounts"
            ) as mock_list:
                # Mock accounts response
                mock_accounts = [
                    EmailAccount(
                        account_id="account1",
                        account_type="user",
                        email_address="user1@example.com",
                        display_name="User 1",
                        smtp_config={"host": "smtp.example.com", "port": 587},
                        imap_config={"host": "imap.example.com", "port": 993},
                        encryption_config={"enabled": False, "method": "pgp"},
                        calendar_config={"enabled": False, "provider": "google"},
                        ai_config={"enabled": True, "model": "gpt-3.5-turbo"},
                        is_primary=True,
                        is_active=True,
                        created_at=datetime.now(),
                        last_used=datetime.now(),
                    ),
                    EmailAccount(
                        account_id="account2",
                        account_type="agent",
                        email_address="agent1@example.com",
                        display_name="Agent 1",
                        smtp_config={"host": "smtp.example.com", "port": 587},
                        imap_config={"host": "imap.example.com", "port": 993},
                        encryption_config={"enabled": False, "method": "pgp"},
                        calendar_config={"enabled": False, "provider": "google"},
                        ai_config={"enabled": True, "model": "gpt-3.5-turbo"},
                        is_primary=False,
                        is_active=True,
                        created_at=datetime.now(),
                        last_used=None,
                    ),
                ]
                mock_list.return_value = mock_accounts

                response = client.get(
                    "/api/email/accounts?account_type=user&active_only=true"
                )

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2

                # Check first account
                account1 = data[0]
                assert account1["account_id"] == "account1"
                assert account1["account_type"] == "user"
                assert account1["email_address"] == "user1@example.com"
                assert account1["display_name"] == "User 1"
                assert account1["is_primary"] is True
                assert account1["is_active"] is True
                assert "created_at" in account1
                assert "last_used" in account1

                # Check second account
                account2 = data[1]
                assert account2["account_id"] == "account2"
                assert account2["account_type"] == "agent"
                assert account2["email_address"] == "agent1@example.com"
                assert account2["display_name"] == "Agent 1"
                assert account2["is_primary"] is False
                assert account2["is_active"] is True
                assert "created_at" in account2
                assert account2["last_used"] is None
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_account_details_success(self, app, client, mock_auth_dependency):
        """Test successful account details retrieval."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.multi_account_service.get_account_summary"
            ) as mock_get_summary:
                # Mock account summary response
                mock_summary = AccountSummary(
                    account_id="account1",
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
                mock_get_summary.return_value = mock_summary

                response = client.get("/api/email/accounts/account1")

                assert response.status_code == 200
                data = response.json()
                assert data["account_id"] == "account1"
                assert data["email_address"] == "test@example.com"
                assert data["display_name"] == "Test User"
                assert data["account_type"] == "user"
                assert data["is_active"] is True
                assert data["is_primary"] is False
                assert data["total_emails_sent"] == 100
                assert data["total_emails_received"] == 200
                assert data["total_emails_processed"] == 150
                assert data["avg_response_time_hours"] == 2.5
                assert data["storage_used_mb"] == 500.0
                assert data["usage_limits"]["emails_per_hour"] == 100
                assert data["current_usage"]["emails_sent"] == 50
                assert data["performance_metrics"]["response_rate"] == 95.0
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_system_overview_success(self, app, client, mock_auth_dependency):
        """Test successful system overview retrieval."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.multi_account_service.get_system_overview"
            ) as mock_get_overview:
                # Mock system overview response
                mock_overview = {
                    "total_accounts": 10,
                    "active_accounts": 8,
                    "inactive_accounts": 2,
                    "accounts_by_type": {"user": 6, "agent": 4},
                    "accounts_by_status": {"active": 8, "inactive": 2},
                    "storage_usage": {"total_mb": 1000, "average_mb": 100},
                    "performance_metrics": {
                        "avg_response_time": 2.5,
                        "success_rate": 95.0,
                    },
                    "usage_statistics": {"total_emails": 1000, "emails_today": 50},
                    "system_health": {"status": "healthy", "uptime": 99.9},
                    "last_updated": datetime.now(),
                }
                mock_get_overview.return_value = mock_overview

                response = client.get("/api/email/accounts/system/overview")

                assert response.status_code == 200
                data = response.json()
                assert data["total_accounts"] == 10
                assert data["active_accounts"] == 8
                assert data["inactive_accounts"] == 2
                assert data["accounts_by_type"]["user"] == 6
                assert data["accounts_by_type"]["agent"] == 4
                assert data["accounts_by_status"]["active"] == 8
                assert data["accounts_by_status"]["inactive"] == 2
                assert data["storage_usage"]["total_mb"] == 1000
                assert data["storage_usage"]["average_mb"] == 100
                assert data["performance_metrics"]["avg_response_time"] == 2.5
                assert data["performance_metrics"]["success_rate"] == 95.0
                assert data["usage_statistics"]["total_emails"] == 1000
                assert data["usage_statistics"]["emails_today"] == 50
                assert data["system_health"]["status"] == "healthy"
                assert data["system_health"]["uptime"] == 99.9
        finally:
            app.dependency_overrides.clear()

    # Error Handling Tests

    @pytest.mark.asyncio
    async def test_analytics_metrics_service_error(
        self, app, client, mock_auth_dependency
    ):
        """Test analytics metrics endpoint with service error."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.email_analytics_service.get_email_metrics"
            ) as mock_get_metrics:
                mock_get_metrics.side_effect = Exception("Service error")

                response = client.get("/api/email/analytics/metrics")

                assert response.status_code == 500
                data = response.json()
                assert "Failed to get email metrics" in data["detail"]
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_encryption_generate_key_service_error(
        self, app, client, mock_auth_dependency
    ):
        """Test encryption key generation endpoint with service error."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.email_encryption_service.generate_pgp_key"
            ) as mock_generate_key:
                mock_generate_key.side_effect = Exception("Service error")

                response = client.post(
                    "/api/email/encryption/generate-key",
                    params={"name": "Test User", "email": "test@example.com"},
                )

                assert response.status_code == 500
                data = response.json()
                assert "Failed to generate encryption key" in data["detail"]
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_calendar_extract_meetings_service_error(
        self, app, client, mock_auth_dependency
    ):
        """Test meeting extraction endpoint with service error."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.calendar_integration_service.extract_meeting_requests_from_email"
            ) as mock_extract:
                mock_extract.side_effect = Exception("Service error")

                response = client.post(
                    "/api/email/calendar/extract-meetings",
                    params={
                        "email_subject": "Meeting Request",
                        "email_body": "Let's schedule a meeting",
                        "email_message_id": "msg1",
                        "sender_email": "sender@example.com",
                    },
                )

                assert response.status_code == 500
                data = response.json()
                assert "Failed to extract meeting requests" in data["detail"]
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_ai_analyze_context_service_error(
        self, app, client, mock_auth_dependency
    ):
        """Test AI context analysis endpoint with service error."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.get_ai_email_response_service"
            ) as mock_get_service:
                mock_service = Mock()
                mock_get_service.return_value = mock_service
                mock_service.analyze_email_context.side_effect = Exception(
                    "Service error"
                )

                response = client.post(
                    "/api/email/ai/analyze-context",
                    json={"subject": "Test", "body": "Test body"},
                )

                assert response.status_code == 500
                data = response.json()
                assert "Failed to analyze email context" in data["detail"]
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_multi_account_create_service_error(
        self, app, client, mock_auth_dependency
    ):
        """Test multi-account creation endpoint with service error."""
        from app.auth.user_service import get_current_active_user

        app.dependency_overrides[get_current_active_user] = mock_auth_dependency
        try:
            with patch(
                "app.api.email_routes.multi_account_service.create_account"
            ) as mock_create:
                mock_create.side_effect = Exception("Service error")

                response = client.post(
                    "/api/email/accounts/create",
                    params={
                        "account_type": "user",
                        "email_address": "test@example.com",
                        "display_name": "Test User",
                    },
                    json={"smtp_config": {}, "imap_config": {}},
                )

                assert response.status_code == 500
                data = response.json()
                assert "Failed to create account" in data["detail"]
        finally:
            app.dependency_overrides.clear()


if __name__ == "__main__":
    pytest.main([__file__])
