"""
Tests for Email Analytics Service.

This module contains comprehensive tests for the email analytics functionality.
"""

import asyncio
import json
import tempfile
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import AsyncMock, Mock, patch

import pytest
import pytest_asyncio

from app.services.email_analytics_service import (
    EmailAnalyticsService,
    EmailInsight,
    EmailMetrics,
    EmailReport,
    email_analytics_service,
)


class TestEmailAnalyticsService:
    """Test cases for EmailAnalyticsService."""

    @pytest_asyncio.fixture
    async def analytics_service(self):
        """Create a test analytics service with temporary data directory."""
        with tempfile.TemporaryDirectory() as temp_dir:
            service = EmailAnalyticsService(data_dir=temp_dir)
            yield service

    @pytest.fixture
    def sample_emails_data(self):
        """Sample email data for testing."""
        return [
            {
                "message_id": "msg1",
                "subject": "Test Email 1",
                "sender": "sender1@example.com",
                "recipient": "recipient1@example.com",
                "date": datetime.now() - timedelta(hours=1),
                "body": "This is a test email body",
                "html_body": "<p>This is a test email body</p>",
                "from_agent": "agent1",
                "to_agent": None,
                "is_agent_email": True,
                "status": "received",
                "attachments": [],
            },
            {
                "message_id": "msg2",
                "subject": "Test Email 2",
                "sender": "sender2@example.com",
                "recipient": "recipient2@example.com",
                "date": datetime.now() - timedelta(hours=2),
                "body": "This is another test email body",
                "html_body": "<p>This is another test email body</p>",
                "from_agent": None,
                "to_agent": "agent2",
                "is_agent_email": True,
                "status": "replied",
                "attachments": [],
            },
            {
                "message_id": "msg3",
                "subject": "Regular Email",
                "sender": "user@example.com",
                "recipient": "admin@example.com",
                "date": datetime.now() - timedelta(hours=3),
                "body": "This is a regular email",
                "html_body": "<p>This is a regular email</p>",
                "from_agent": None,
                "to_agent": None,
                "is_agent_email": False,
                "status": "processed",
                "attachments": [],
            },
        ]

    @pytest.mark.asyncio
    async def test_get_email_metrics_empty_data(self, analytics_service):
        """Test getting metrics with no email data."""
        with patch.object(analytics_service, "_get_emails_data", return_value=[]):
            metrics = await analytics_service.get_email_metrics()

            assert metrics.total_emails == 0
            assert metrics.sent_emails == 0
            assert metrics.received_emails == 0
            assert metrics.agent_emails == 0
            assert metrics.unread_emails == 0
            assert metrics.replied_emails == 0
            assert metrics.processed_emails == 0
            assert metrics.avg_response_time_hours == 0.0
            assert metrics.avg_email_length == 0.0
            assert metrics.most_active_hour == 0
            assert metrics.most_active_day == "Monday"
            assert metrics.top_senders == []
            assert metrics.top_recipients == []
            assert metrics.email_volume_trend == []
            assert metrics.agent_activity == {}
            assert metrics.content_analysis == {}
            assert metrics.performance_metrics == {}

    @pytest.mark.asyncio
    async def test_get_email_metrics_with_data(
        self, analytics_service, sample_emails_data
    ):
        """Test getting metrics with sample email data."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            metrics = await analytics_service.get_email_metrics()

            assert metrics.total_emails == 3
            assert metrics.received_emails == 3
            assert metrics.agent_emails == 2
            assert metrics.unread_emails == 1  # Only one with status 'received'
            assert metrics.replied_emails == 1  # One with status 'replied'
            assert metrics.processed_emails == 1  # One with status 'processed'
            assert metrics.avg_email_length > 0
            assert len(metrics.top_senders) > 0
            assert len(metrics.top_recipients) > 0
            assert len(metrics.email_volume_trend) > 0
            assert "agent1" in metrics.agent_activity
            assert "agent2" in metrics.agent_activity
            assert "common_subjects" in metrics.content_analysis
            assert "response_rate" in metrics.performance_metrics

    @pytest.mark.asyncio
    async def test_get_email_metrics_with_period_filter(
        self, analytics_service, sample_emails_data
    ):
        """Test getting metrics with period filtering."""
        start_date = datetime.now() - timedelta(hours=4)
        end_date = datetime.now() - timedelta(minutes=30)

        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            metrics = await analytics_service.get_email_metrics(
                period_start=start_date, period_end=end_date
            )

            assert metrics.total_emails == 3

    @pytest.mark.asyncio
    async def test_get_email_metrics_with_agent_filter(
        self, analytics_service, sample_emails_data
    ):
        """Test getting metrics with agent filtering."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            metrics = await analytics_service.get_email_metrics(agent_id="agent1")

            assert metrics.total_emails == 3  # All emails returned by mock

    @pytest.mark.asyncio
    async def test_get_email_metrics_caching(
        self, analytics_service, sample_emails_data
    ):
        """Test metrics caching functionality."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            # First call should cache the result
            metrics1 = await analytics_service.get_email_metrics(use_cache=True)

            # Second call should use cache
            metrics2 = await analytics_service.get_email_metrics(use_cache=True)

            assert metrics1.total_emails == metrics2.total_emails
            assert len(analytics_service._metrics_cache) > 0

    @pytest.mark.asyncio
    async def test_generate_insights_empty_data(self, analytics_service):
        """Test generating insights with no email data."""
        with patch.object(analytics_service, "_get_emails_data", return_value=[]):
            insights = await analytics_service.generate_insights()
            assert insights == []

    @pytest.mark.asyncio
    async def test_generate_insights_with_data(
        self, analytics_service, sample_emails_data
    ):
        """Test generating insights with sample email data."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            insights = await analytics_service.generate_insights()

            assert isinstance(insights, list)
            for insight in insights:
                assert isinstance(insight, EmailInsight)
                assert insight.insight_type in [
                    "trend",
                    "anomaly",
                    "recommendation",
                    "pattern",
                    "performance",
                    "activity",
                ]
                assert insight.title
                assert insight.description
                assert insight.severity in ["low", "medium", "high", "critical"]
                assert 0.0 <= insight.confidence <= 1.0
                assert isinstance(insight.data, dict)
                assert isinstance(insight.timestamp, datetime)
                assert isinstance(insight.actionable, bool)
                assert isinstance(insight.suggested_actions, list)

    @pytest.mark.asyncio
    async def test_generate_report(self, analytics_service, sample_emails_data):
        """Test generating a comprehensive email report."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            report = await analytics_service.generate_report(
                report_type="weekly",
                period_start=datetime.now() - timedelta(days=7),
                period_end=datetime.now(),
            )

            assert isinstance(report, EmailReport)
            assert report.report_type == "weekly"
            assert report.metrics.total_emails == 3
            assert len(report.insights) >= 0
            assert isinstance(report.recommendations, list)
            assert isinstance(report.charts_data, dict)
            assert "volume_over_time" in report.charts_data
            assert "hourly_activity" in report.charts_data
            assert "agent_activity" in report.charts_data

    @pytest.mark.asyncio
    async def test_get_agent_performance(self, analytics_service, sample_emails_data):
        """Test getting agent performance metrics."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            performance = await analytics_service.get_agent_performance("agent1")

            assert isinstance(performance, dict)
            assert "total_emails" in performance
            assert "sent_emails" in performance
            assert "received_emails" in performance
            assert "avg_response_time_hours" in performance
            assert "most_active_hour" in performance
            assert "most_active_day" in performance
            assert "activity_by_hour" in performance
            assert "activity_by_day" in performance
            assert "avg_email_length" in performance
            assert "common_subjects" in performance
            assert "common_content" in performance

    @pytest.mark.asyncio
    async def test_get_agent_performance_no_data(self, analytics_service):
        """Test getting agent performance with no data."""
        with patch.object(analytics_service, "_get_emails_data", return_value=[]):
            performance = await analytics_service.get_agent_performance(
                "nonexistent_agent"
            )
            assert performance == {}

    @pytest.mark.asyncio
    async def test_get_email_trends_volume(self, analytics_service, sample_emails_data):
        """Test getting email volume trends."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            trends = await analytics_service.get_email_trends(
                metric="volume", period_days=7
            )

            assert isinstance(trends, list)
            for trend in trends:
                assert "date" in trend
                assert "value" in trend
                assert "emails_count" in trend
                assert isinstance(trend["value"], int)
                assert isinstance(trend["emails_count"], int)

    @pytest.mark.asyncio
    async def test_get_email_trends_response_time(
        self, analytics_service, sample_emails_data
    ):
        """Test getting email response time trends."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            trends = await analytics_service.get_email_trends(
                metric="response_time", period_days=7
            )

            assert isinstance(trends, list)
            for trend in trends:
                assert "date" in trend
                assert "value" in trend
                assert "emails_count" in trend
                assert isinstance(trend["value"], (int, float))

    @pytest.mark.asyncio
    async def test_get_email_trends_agent_activity(
        self, analytics_service, sample_emails_data
    ):
        """Test getting agent activity trends."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            trends = await analytics_service.get_email_trends(
                metric="agent_activity", period_days=7
            )

            assert isinstance(trends, list)
            for trend in trends:
                assert "date" in trend
                assert "value" in trend
                assert "emails_count" in trend
                assert isinstance(trend["value"], int)

    @pytest.mark.asyncio
    async def test_get_email_trends_invalid_metric(
        self, analytics_service, sample_emails_data
    ):
        """Test getting trends with invalid metric."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            trends = await analytics_service.get_email_trends(
                metric="invalid_metric", period_days=7
            )

            assert isinstance(trends, list)
            for trend in trends:
                assert trend["value"] == 0  # Should default to 0 for invalid metrics

    @pytest.mark.asyncio
    async def test_analyze_volume_trends(self, analytics_service, sample_emails_data):
        """Test volume trend analysis."""
        insights = await analytics_service._analyze_volume_trends(sample_emails_data)

        assert isinstance(insights, list)
        for insight in insights:
            assert isinstance(insight, EmailInsight)
            assert insight.insight_type == "trend"

    @pytest.mark.asyncio
    async def test_analyze_response_times(self, analytics_service, sample_emails_data):
        """Test response time analysis."""
        insights = await analytics_service._analyze_response_times(sample_emails_data)

        assert isinstance(insights, list)
        for insight in insights:
            assert isinstance(insight, EmailInsight)
            assert insight.insight_type == "performance"

    @pytest.mark.asyncio
    async def test_analyze_content_patterns(
        self, analytics_service, sample_emails_data
    ):
        """Test content pattern analysis."""
        insights = await analytics_service._analyze_content_patterns(sample_emails_data)

        assert isinstance(insights, list)
        for insight in insights:
            assert isinstance(insight, EmailInsight)
            assert insight.insight_type == "pattern"

    @pytest.mark.asyncio
    async def test_analyze_agent_activity(self, analytics_service, sample_emails_data):
        """Test agent activity analysis."""
        insights = await analytics_service._analyze_agent_activity(sample_emails_data)

        assert isinstance(insights, list)
        for insight in insights:
            assert isinstance(insight, EmailInsight)
            assert insight.insight_type == "activity"

    @pytest.mark.asyncio
    async def test_detect_anomalies(self, analytics_service, sample_emails_data):
        """Test anomaly detection."""
        insights = await analytics_service._detect_anomalies(sample_emails_data)

        assert isinstance(insights, list)
        for insight in insights:
            assert isinstance(insight, EmailInsight)
            assert insight.insight_type == "anomaly"

    def test_get_common_phrases(self, analytics_service):
        """Test common phrase extraction."""
        texts = [
            "This is a test email",
            "This is another test email",
            "This is a different message",
        ]

        phrases = analytics_service._get_common_phrases(texts)

        assert isinstance(phrases, list)
        for phrase in phrases:
            assert "phrase" in phrase
            assert "count" in phrase
            assert isinstance(phrase["phrase"], str)
            assert isinstance(phrase["count"], int)
            assert phrase["count"] > 0

    def test_get_common_phrases_empty(self, analytics_service):
        """Test common phrase extraction with empty input."""
        phrases = analytics_service._get_common_phrases([])
        assert phrases == []

    def test_get_common_phrases_min_length(self, analytics_service):
        """Test common phrase extraction with minimum length filter."""
        texts = ["a b c", "a b d", "a b e"]

        phrases = analytics_service._get_common_phrases(texts, min_length=2)

        assert isinstance(phrases, list)
        # Should filter out single character words

    def test_get_default_period_daily(self, analytics_service):
        """Test default period calculation for daily reports."""
        start, end = analytics_service._get_default_period("daily")

        assert isinstance(start, datetime)
        assert isinstance(end, datetime)
        assert end > start
        assert (end - start).days == 1

    def test_get_default_period_weekly(self, analytics_service):
        """Test default period calculation for weekly reports."""
        start, end = analytics_service._get_default_period("weekly")

        assert isinstance(start, datetime)
        assert isinstance(end, datetime)
        assert end > start
        assert (end - start).days == 7

    def test_get_default_period_monthly(self, analytics_service):
        """Test default period calculation for monthly reports."""
        start, end = analytics_service._get_default_period("monthly")

        assert isinstance(start, datetime)
        assert isinstance(end, datetime)
        assert end > start
        assert (end - start).days == 30

    def test_get_default_period_custom(self, analytics_service):
        """Test default period calculation for custom reports."""
        start, end = analytics_service._get_default_period("custom")

        assert isinstance(start, datetime)
        assert isinstance(end, datetime)
        assert end > start
        assert (end - start).days == 7  # Default fallback

    @pytest.mark.asyncio
    async def test_generate_recommendations(
        self, analytics_service, sample_emails_data
    ):
        """Test recommendation generation."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            metrics = await analytics_service.get_email_metrics()
            insights = await analytics_service.generate_insights()

            recommendations = await analytics_service._generate_recommendations(
                metrics, insights
            )

            assert isinstance(recommendations, list)
            for recommendation in recommendations:
                assert isinstance(recommendation, str)
                assert len(recommendation) > 0

    @pytest.mark.asyncio
    async def test_generate_charts_data(self, analytics_service, sample_emails_data):
        """Test charts data generation."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            charts_data = await analytics_service._generate_charts_data(
                datetime.now() - timedelta(days=7), datetime.now(), None
            )

            assert isinstance(charts_data, dict)
            assert "volume_over_time" in charts_data
            assert "hourly_activity" in charts_data
            assert "agent_activity" in charts_data

            assert isinstance(charts_data["volume_over_time"], list)
            assert isinstance(charts_data["hourly_activity"], list)
            assert isinstance(charts_data["agent_activity"], list)

    @pytest.mark.asyncio
    async def test_save_report(self, analytics_service, sample_emails_data):
        """Test report saving functionality."""
        with patch.object(
            analytics_service, "_get_emails_data", return_value=sample_emails_data
        ):
            report = await analytics_service.generate_report("daily")

            # Check that report file was created
            report_file = analytics_service.reports_dir / f"{report.report_id}.json"
            assert report_file.exists()

            # Verify file content
            with open(report_file, "r") as f:
                saved_data = json.load(f)
                assert saved_data["report_id"] == report.report_id
                assert saved_data["report_type"] == report.report_type

    @pytest.mark.asyncio
    async def test_cache_validation(self, analytics_service):
        """Test cache validation functionality."""
        # Test with no cache
        assert not analytics_service._is_cache_valid("nonexistent_key")

        # Test with expired cache
        analytics_service._cache_expiry["test_key"] = datetime.now() - timedelta(
            minutes=20
        )
        assert not analytics_service._is_cache_valid("test_key")

        # Test with valid cache
        analytics_service._cache_expiry["test_key"] = datetime.now() + timedelta(
            minutes=10
        )
        assert analytics_service._is_cache_valid("test_key")

    @pytest.mark.asyncio
    async def test_error_handling(self, analytics_service):
        """Test error handling in various methods."""
        # Test with invalid data
        with patch.object(
            analytics_service, "_get_emails_data", side_effect=Exception("Test error")
        ):
            metrics = await analytics_service.get_email_metrics()
            assert metrics.total_emails == 0  # Should return empty metrics

            insights = await analytics_service.generate_insights()
            assert insights == []  # Should return empty list

    @pytest.mark.asyncio
    async def test_global_service_instance(self):
        """Test the global service instance."""
        assert isinstance(email_analytics_service, EmailAnalyticsService)
        assert email_analytics_service.data_dir.exists()
        assert email_analytics_service.reports_dir.exists()
        assert email_analytics_service.cache_dir.exists()


class TestEmailMetrics:
    """Test cases for EmailMetrics dataclass."""

    def test_email_metrics_creation(self):
        """Test EmailMetrics object creation."""
        metrics = EmailMetrics(
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
            top_senders=[{"email": "test@example.com", "count": 10}],
            top_recipients=[{"email": "admin@example.com", "count": 15}],
            email_volume_trend=[{"date": "2023-01-01", "count": 5}],
            agent_activity={"agent1": {"sent": 10, "received": 5}},
            content_analysis={"common_subjects": [{"phrase": "test", "count": 3}]},
            performance_metrics={"response_rate": 75.0},
        )

        assert metrics.total_emails == 100
        assert metrics.sent_emails == 50
        assert metrics.received_emails == 50
        assert metrics.agent_emails == 25
        assert metrics.unread_emails == 10
        assert metrics.replied_emails == 30
        assert metrics.processed_emails == 40
        assert metrics.avg_response_time_hours == 2.5
        assert metrics.avg_email_length == 150.0
        assert metrics.most_active_hour == 14
        assert metrics.most_active_day == "Tuesday"
        assert len(metrics.top_senders) == 1
        assert len(metrics.top_recipients) == 1
        assert len(metrics.email_volume_trend) == 1
        assert "agent1" in metrics.agent_activity
        assert "common_subjects" in metrics.content_analysis
        assert "response_rate" in metrics.performance_metrics


class TestEmailInsight:
    """Test cases for EmailInsight dataclass."""

    def test_email_insight_creation(self):
        """Test EmailInsight object creation."""
        insight = EmailInsight(
            insight_type="trend",
            title="Volume Increase",
            description="Email volume has increased by 20%",
            severity="medium",
            confidence=0.8,
            data={"increase_percentage": 20.0},
            timestamp=datetime.now(),
            actionable=True,
            suggested_actions=["Monitor capacity", "Scale resources"],
        )

        assert insight.insight_type == "trend"
        assert insight.title == "Volume Increase"
        assert insight.description == "Email volume has increased by 20%"
        assert insight.severity == "medium"
        assert insight.confidence == 0.8
        assert insight.data["increase_percentage"] == 20.0
        assert isinstance(insight.timestamp, datetime)
        assert insight.actionable is True
        assert len(insight.suggested_actions) == 2


class TestEmailReport:
    """Test cases for EmailReport dataclass."""

    def test_email_report_creation(self):
        """Test EmailReport object creation."""
        metrics = EmailMetrics(
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

        insights = [
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

        report = EmailReport(
            report_id="test_report_001",
            report_type="daily",
            period_start=datetime.now() - timedelta(days=1),
            period_end=datetime.now(),
            generated_at=datetime.now(),
            metrics=metrics,
            insights=insights,
            recommendations=["Test recommendation"],
            charts_data={"volume": []},
        )

        assert report.report_id == "test_report_001"
        assert report.report_type == "daily"
        assert isinstance(report.period_start, datetime)
        assert isinstance(report.period_end, datetime)
        assert isinstance(report.generated_at, datetime)
        assert isinstance(report.metrics, EmailMetrics)
        assert len(report.insights) == 1
        assert len(report.recommendations) == 1
        assert "volume" in report.charts_data


if __name__ == "__main__":
    pytest.main([__file__])
