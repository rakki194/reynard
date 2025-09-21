"""
Email Analytics Service for Reynard Backend.

This module provides comprehensive email analytics and reporting functionality.
"""

import asyncio
import json
import logging
import statistics
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class EmailMetrics:
    """Email metrics data structure."""

    total_emails: int
    sent_emails: int
    received_emails: int
    agent_emails: int
    unread_emails: int
    replied_emails: int
    processed_emails: int
    avg_response_time_hours: float
    avg_email_length: float
    most_active_hour: int
    most_active_day: str
    top_senders: List[Dict[str, Any]]
    top_recipients: List[Dict[str, Any]]
    email_volume_trend: List[Dict[str, Any]]
    agent_activity: Dict[str, Dict[str, Any]]
    content_analysis: Dict[str, Any]
    performance_metrics: Dict[str, float]


@dataclass
class EmailInsight:
    """Email insight data structure."""

    insight_type: str  # 'trend', 'anomaly', 'recommendation', 'pattern'
    title: str
    description: str
    severity: str  # 'low', 'medium', 'high', 'critical'
    confidence: float  # 0.0 to 1.0
    data: Dict[str, Any]
    timestamp: datetime
    actionable: bool
    suggested_actions: List[str]


@dataclass
class EmailReport:
    """Email report data structure."""

    report_id: str
    report_type: str  # 'daily', 'weekly', 'monthly', 'custom'
    period_start: datetime
    period_end: datetime
    generated_at: datetime
    metrics: EmailMetrics
    insights: List[EmailInsight]
    recommendations: List[str]
    charts_data: Dict[str, Any]


class EmailAnalyticsService:
    """Service for email analytics and reporting."""

    def __init__(self, data_dir: str = "data/email_analytics"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir = self.data_dir / "reports"
        self.reports_dir.mkdir(exist_ok=True)
        self.cache_dir = self.data_dir / "cache"
        self.cache_dir.mkdir(exist_ok=True)

        # Cache for frequently accessed data
        self._metrics_cache: Dict[str, EmailMetrics] = {}
        self._cache_expiry: Dict[str, datetime] = {}
        self._cache_duration = timedelta(minutes=15)

    async def get_email_metrics(
        self,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
        agent_id: Optional[str] = None,
        use_cache: bool = True,
    ) -> EmailMetrics:
        """
        Get comprehensive email metrics for a given period.

        Args:
            period_start: Start of the analysis period
            period_end: End of the analysis period
            agent_id: Specific agent to analyze (None for all)
            use_cache: Whether to use cached results

        Returns:
            EmailMetrics object with comprehensive statistics
        """
        # Generate cache key
        cache_key = f"metrics_{period_start}_{period_end}_{agent_id}"

        # Check cache
        if use_cache and self._is_cache_valid(cache_key):
            return self._metrics_cache[cache_key]

        try:
            # Get email data
            emails_data = await self._get_emails_data(
                period_start, period_end, agent_id
            )

            if not emails_data:
                return self._create_empty_metrics()

            # Calculate metrics
            metrics = await self._calculate_metrics(
                emails_data, period_start, period_end
            )

            # Cache results
            if use_cache:
                self._metrics_cache[cache_key] = metrics
                self._cache_expiry[cache_key] = datetime.now() + self._cache_duration

            return metrics

        except Exception as e:
            logger.error(f"Failed to get email metrics: {e}")
            return self._create_empty_metrics()

    async def generate_insights(
        self,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
        agent_id: Optional[str] = None,
    ) -> List[EmailInsight]:
        """
        Generate insights from email data.

        Args:
            period_start: Start of the analysis period
            period_end: End of the analysis period
            agent_id: Specific agent to analyze

        Returns:
            List of EmailInsight objects
        """
        try:
            emails_data = await self._get_emails_data(
                period_start, period_end, agent_id
            )
            if not emails_data:
                return []

            insights = []

            # Volume trend analysis
            volume_insights = await self._analyze_volume_trends(emails_data)
            insights.extend(volume_insights)

            # Response time analysis
            response_insights = await self._analyze_response_times(emails_data)
            insights.extend(response_insights)

            # Content analysis
            content_insights = await self._analyze_content_patterns(emails_data)
            insights.extend(content_insights)

            # Agent activity analysis
            agent_insights = await self._analyze_agent_activity(emails_data)
            insights.extend(agent_insights)

            # Anomaly detection
            anomaly_insights = await self._detect_anomalies(emails_data)
            insights.extend(anomaly_insights)

            return insights

        except Exception as e:
            logger.error(f"Failed to generate insights: {e}")
            return []

    async def generate_report(
        self,
        report_type: str = "weekly",
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
        agent_id: Optional[str] = None,
    ) -> EmailReport:
        """
        Generate a comprehensive email report.

        Args:
            report_type: Type of report ('daily', 'weekly', 'monthly', 'custom')
            period_start: Start of the analysis period
            period_end: End of the analysis period
            agent_id: Specific agent to analyze

        Returns:
            EmailReport object
        """
        try:
            # Set default period if not provided
            if not period_start or not period_end:
                period_start, period_end = self._get_default_period(report_type)

            # Generate metrics and insights
            metrics = await self.get_email_metrics(period_start, period_end, agent_id)
            insights = await self.generate_insights(period_start, period_end, agent_id)

            # Generate recommendations
            recommendations = await self._generate_recommendations(metrics, insights)

            # Generate charts data
            charts_data = await self._generate_charts_data(
                period_start, period_end, agent_id
            )

            # Create report
            report = EmailReport(
                report_id=f"{report_type}_{period_start.strftime('%Y%m%d')}_{period_end.strftime('%Y%m%d')}",
                report_type=report_type,
                period_start=period_start,
                period_end=period_end,
                generated_at=datetime.now(),
                metrics=metrics,
                insights=insights,
                recommendations=recommendations,
                charts_data=charts_data,
            )

            # Save report
            await self._save_report(report)

            return report

        except Exception as e:
            logger.error(f"Failed to generate report: {e}")
            raise

    async def get_agent_performance(
        self,
        agent_id: str,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Get performance metrics for a specific agent.

        Args:
            agent_id: Agent ID to analyze
            period_start: Start of the analysis period
            period_end: End of the analysis period

        Returns:
            Dictionary with agent performance metrics
        """
        try:
            emails_data = await self._get_emails_data(
                period_start, period_end, agent_id
            )
            if not emails_data:
                return {}

            # Calculate agent-specific metrics
            agent_emails = [
                email
                for email in emails_data
                if email.get("from_agent") == agent_id
                or email.get("to_agent") == agent_id
            ]

            if not agent_emails:
                return {}

            # Response time analysis
            response_times = []
            for email in agent_emails:
                if email.get("status") == "replied":
                    # Calculate response time (simplified)
                    sent_time = email.get("date")
                    if sent_time:
                        response_times.append(1.0)  # Placeholder for actual calculation

            # Activity analysis
            activity_by_hour = defaultdict(int)
            activity_by_day = defaultdict(int)

            for email in agent_emails:
                email_date = email.get("date")
                if email_date:
                    activity_by_hour[email_date.hour] += 1
                    activity_by_day[email_date.strftime("%A")] += 1

            # Content analysis
            subjects = [email.get("subject", "") for email in agent_emails]
            bodies = [email.get("body", "") for email in agent_emails]

            # Calculate metrics
            avg_response_time = statistics.mean(response_times) if response_times else 0
            most_active_hour = (
                max(activity_by_hour.items(), key=lambda x: x[1])[0]
                if activity_by_hour
                else 0
            )
            most_active_day = (
                max(activity_by_day.items(), key=lambda x: x[1])[0]
                if activity_by_day
                else "Monday"
            )

            return {
                "total_emails": len(agent_emails),
                "sent_emails": len(
                    [e for e in agent_emails if e.get("from_agent") == agent_id]
                ),
                "received_emails": len(
                    [e for e in agent_emails if e.get("to_agent") == agent_id]
                ),
                "avg_response_time_hours": avg_response_time,
                "most_active_hour": most_active_hour,
                "most_active_day": most_active_day,
                "activity_by_hour": dict(activity_by_hour),
                "activity_by_day": dict(activity_by_day),
                "avg_email_length": (
                    statistics.mean([len(body) for body in bodies if body])
                    if bodies
                    else 0
                ),
                "common_subjects": self._get_common_phrases(subjects),
                "common_content": self._get_common_phrases(bodies),
            }

        except Exception as e:
            logger.error(f"Failed to get agent performance: {e}")
            return {}

    async def get_email_trends(
        self,
        metric: str = "volume",
        period_days: int = 30,
        agent_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get email trends over time.

        Args:
            metric: Metric to analyze ('volume', 'response_time', 'agent_activity')
            period_days: Number of days to analyze
            agent_id: Specific agent to analyze

        Returns:
            List of trend data points
        """
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=period_days)

            emails_data = await self._get_emails_data(start_date, end_date, agent_id)
            if not emails_data:
                return []

            # Group emails by date
            daily_data = defaultdict(list)
            for email in emails_data:
                email_date = email.get("date")
                if email_date:
                    date_key = email_date.strftime("%Y-%m-%d")
                    daily_data[date_key].append(email)

            # Calculate trends
            trends = []
            for date_str in sorted(daily_data.keys()):
                day_emails = daily_data[date_str]

                if metric == "volume":
                    value = len(day_emails)
                elif metric == "response_time":
                    # Calculate average response time for the day
                    response_times = [
                        1.0 for email in day_emails if email.get("status") == "replied"
                    ]
                    value = statistics.mean(response_times) if response_times else 0
                elif metric == "agent_activity":
                    value = len(
                        [e for e in day_emails if e.get("is_agent_email", False)]
                    )
                else:
                    value = 0

                trends.append(
                    {"date": date_str, "value": value, "emails_count": len(day_emails)}
                )

            return trends

        except Exception as e:
            logger.error(f"Failed to get email trends: {e}")
            return []

    # Private helper methods

    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid."""
        if cache_key not in self._cache_expiry:
            return False
        return datetime.now() < self._cache_expiry[cache_key]

    async def _get_emails_data(
        self,
        period_start: Optional[datetime],
        period_end: Optional[datetime],
        agent_id: Optional[str],
    ) -> List[Dict[str, Any]]:
        """Get email data from storage."""
        try:
            # Import here to avoid circular imports
            from .imap_service import imap_service

            # Get emails from IMAP service
            all_emails = list(imap_service.received_emails.values())

            # Filter by period
            if period_start or period_end:
                filtered_emails = []
                for email in all_emails:
                    email_date = email.date
                    if period_start and email_date < period_start:
                        continue
                    if period_end and email_date > period_end:
                        continue
                    filtered_emails.append(email)
                all_emails = filtered_emails

            # Filter by agent
            if agent_id:
                all_emails = [
                    email
                    for email in all_emails
                    if email.from_agent == agent_id or email.to_agent == agent_id
                ]

            # Convert to dictionaries
            return [
                {
                    "message_id": email.message_id,
                    "subject": email.subject,
                    "sender": email.sender,
                    "recipient": email.recipient,
                    "date": email.date,
                    "body": email.body,
                    "html_body": email.html_body,
                    "from_agent": email.from_agent,
                    "to_agent": email.to_agent,
                    "is_agent_email": email.is_agent_email,
                    "status": email.status,
                    "attachments": email.attachments or [],
                }
                for email in all_emails
            ]

        except Exception as e:
            logger.error(f"Failed to get emails data: {e}")
            return []

    def _create_empty_metrics(self) -> EmailMetrics:
        """Create empty metrics object."""
        return EmailMetrics(
            total_emails=0,
            sent_emails=0,
            received_emails=0,
            agent_emails=0,
            unread_emails=0,
            replied_emails=0,
            processed_emails=0,
            avg_response_time_hours=0.0,
            avg_email_length=0.0,
            most_active_hour=0,
            most_active_day="Monday",
            top_senders=[],
            top_recipients=[],
            email_volume_trend=[],
            agent_activity={},
            content_analysis={},
            performance_metrics={},
        )

    async def _calculate_metrics(
        self,
        emails_data: List[Dict[str, Any]],
        period_start: Optional[datetime],
        period_end: Optional[datetime],
    ) -> EmailMetrics:
        """Calculate comprehensive email metrics."""
        if not emails_data:
            return self._create_empty_metrics()

        # Basic counts
        total_emails = len(emails_data)
        agent_emails = len([e for e in emails_data if e.get("is_agent_email", False)])
        unread_emails = len([e for e in emails_data if e.get("status") == "received"])
        replied_emails = len([e for e in emails_data if e.get("status") == "replied"])
        processed_emails = len(
            [e for e in emails_data if e.get("status") == "processed"]
        )

        # Response time analysis
        response_times = []
        for email in emails_data:
            if email.get("status") == "replied":
                # Simplified response time calculation
                response_times.append(1.0)  # Placeholder

        avg_response_time = statistics.mean(response_times) if response_times else 0.0

        # Email length analysis
        email_lengths = [len(e.get("body", "")) for e in emails_data if e.get("body")]
        avg_email_length = statistics.mean(email_lengths) if email_lengths else 0.0

        # Activity analysis
        activity_by_hour = defaultdict(int)
        activity_by_day = defaultdict(int)

        for email in emails_data:
            email_date = email.get("date")
            if email_date:
                activity_by_hour[email_date.hour] += 1
                activity_by_day[email_date.strftime("%A")] += 1

        most_active_hour = (
            max(activity_by_hour.items(), key=lambda x: x[1])[0]
            if activity_by_hour
            else 0
        )
        most_active_day = (
            max(activity_by_day.items(), key=lambda x: x[1])[0]
            if activity_by_day
            else "Monday"
        )

        # Top senders and recipients
        sender_counts = Counter([e.get("sender", "") for e in emails_data])
        recipient_counts = Counter([e.get("recipient", "") for e in emails_data])

        top_senders = [
            {"email": email, "count": count}
            for email, count in sender_counts.most_common(10)
        ]
        top_recipients = [
            {"email": email, "count": count}
            for email, count in recipient_counts.most_common(10)
        ]

        # Volume trend
        daily_volumes = defaultdict(int)
        for email in emails_data:
            email_date = email.get("date")
            if email_date:
                date_key = email_date.strftime("%Y-%m-%d")
                daily_volumes[date_key] += 1

        email_volume_trend = [
            {"date": date, "count": count}
            for date, count in sorted(daily_volumes.items())
        ]

        # Agent activity
        agent_activity = {}
        for email in emails_data:
            if email.get("from_agent"):
                agent_id = email["from_agent"]
                if agent_id not in agent_activity:
                    agent_activity[agent_id] = {"sent": 0, "received": 0}
                agent_activity[agent_id]["sent"] += 1

            if email.get("to_agent"):
                agent_id = email["to_agent"]
                if agent_id not in agent_activity:
                    agent_activity[agent_id] = {"sent": 0, "received": 0}
                agent_activity[agent_id]["received"] += 1

        # Content analysis
        subjects = [e.get("subject", "") for e in emails_data]
        bodies = [e.get("body", "") for e in emails_data]

        content_analysis = {
            "common_subjects": self._get_common_phrases(subjects),
            "common_content": self._get_common_phrases(bodies),
            "avg_subject_length": (
                statistics.mean([len(s) for s in subjects if s]) if subjects else 0
            ),
            "avg_body_length": avg_email_length,
        }

        # Performance metrics
        performance_metrics = {
            "response_rate": (
                (replied_emails / total_emails * 100) if total_emails > 0 else 0
            ),
            "processing_rate": (
                (processed_emails / total_emails * 100) if total_emails > 0 else 0
            ),
            "agent_engagement": (
                (agent_emails / total_emails * 100) if total_emails > 0 else 0
            ),
        }

        return EmailMetrics(
            total_emails=total_emails,
            sent_emails=total_emails,  # Simplified - all emails in received storage
            received_emails=total_emails,
            agent_emails=agent_emails,
            unread_emails=unread_emails,
            replied_emails=replied_emails,
            processed_emails=processed_emails,
            avg_response_time_hours=avg_response_time,
            avg_email_length=avg_email_length,
            most_active_hour=most_active_hour,
            most_active_day=most_active_day,
            top_senders=top_senders,
            top_recipients=top_recipients,
            email_volume_trend=email_volume_trend,
            agent_activity=agent_activity,
            content_analysis=content_analysis,
            performance_metrics=performance_metrics,
        )

    def _get_common_phrases(
        self, texts: List[str], min_length: int = 3
    ) -> List[Dict[str, Any]]:
        """Extract common phrases from text list."""
        if not texts:
            return []

        # Simple word frequency analysis
        word_counts = Counter()
        for text in texts:
            if text:
                words = text.lower().split()
                for word in words:
                    if len(word) >= min_length:
                        word_counts[word] += 1

        return [
            {"phrase": word, "count": count}
            for word, count in word_counts.most_common(20)
        ]

    def _get_default_period(self, report_type: str) -> Tuple[datetime, datetime]:
        """Get default period for report type."""
        end_date = datetime.now()

        if report_type == "daily":
            start_date = end_date - timedelta(days=1)
        elif report_type == "weekly":
            start_date = end_date - timedelta(weeks=1)
        elif report_type == "monthly":
            start_date = end_date - timedelta(days=30)
        else:
            start_date = end_date - timedelta(days=7)

        return start_date, end_date

    async def _analyze_volume_trends(
        self, emails_data: List[Dict[str, Any]]
    ) -> List[EmailInsight]:
        """Analyze email volume trends."""
        insights = []

        if len(emails_data) < 2:
            return insights

        # Calculate daily volumes
        daily_volumes = defaultdict(int)
        for email in emails_data:
            email_date = email.get("date")
            if email_date:
                date_key = email_date.strftime("%Y-%m-%d")
                daily_volumes[date_key] += 1

        volumes = list(daily_volumes.values())
        if len(volumes) >= 3:
            # Calculate trend
            recent_avg = statistics.mean(volumes[-3:])
            overall_avg = statistics.mean(volumes)

            if recent_avg > overall_avg * 1.2:
                insights.append(
                    EmailInsight(
                        insight_type="trend",
                        title="Email Volume Increase",
                        description=f"Recent email volume is {((recent_avg - overall_avg) / overall_avg * 100):.1f}% higher than average",
                        severity="medium",
                        confidence=0.8,
                        data={"recent_avg": recent_avg, "overall_avg": overall_avg},
                        timestamp=datetime.now(),
                        actionable=True,
                        suggested_actions=[
                            "Review email processing capacity",
                            "Consider automation for high-volume periods",
                        ],
                    )
                )

        return insights

    async def _analyze_response_times(
        self, emails_data: List[Dict[str, Any]]
    ) -> List[EmailInsight]:
        """Analyze email response times."""
        insights = []

        # Calculate response times (simplified)
        response_times = []
        for email in emails_data:
            if email.get("status") == "replied":
                response_times.append(1.0)  # Placeholder

        if response_times:
            avg_response_time = statistics.mean(response_times)

            if avg_response_time > 24:  # More than 24 hours
                insights.append(
                    EmailInsight(
                        insight_type="performance",
                        title="Slow Response Times",
                        description=f"Average response time is {avg_response_time:.1f} hours",
                        severity="high",
                        confidence=0.9,
                        data={"avg_response_time": avg_response_time},
                        timestamp=datetime.now(),
                        actionable=True,
                        suggested_actions=[
                            "Implement auto-reply system",
                            "Set up email alerts",
                            "Review response processes",
                        ],
                    )
                )

        return insights

    async def _analyze_content_patterns(
        self, emails_data: List[Dict[str, Any]]
    ) -> List[EmailInsight]:
        """Analyze email content patterns."""
        insights = []

        # Analyze common subjects
        subjects = [e.get("subject", "") for e in emails_data if e.get("subject")]
        if subjects:
            common_words = self._get_common_phrases(subjects)

            if common_words:
                top_word = common_words[0]
                if (
                    top_word["count"] > len(subjects) * 0.3
                ):  # Appears in >30% of subjects
                    insights.append(
                        EmailInsight(
                            insight_type="pattern",
                            title="Common Email Topic",
                            description=f"'{top_word['phrase']}' appears in {top_word['count']} emails",
                            severity="low",
                            confidence=0.7,
                            data={"common_word": top_word},
                            timestamp=datetime.now(),
                            actionable=False,
                            suggested_actions=[],
                        )
                    )

        return insights

    async def _analyze_agent_activity(
        self, emails_data: List[Dict[str, Any]]
    ) -> List[EmailInsight]:
        """Analyze agent activity patterns."""
        insights = []

        # Count agent emails
        agent_emails = [e for e in emails_data if e.get("is_agent_email", False)]
        total_emails = len(emails_data)

        if total_emails > 0:
            agent_percentage = (len(agent_emails) / total_emails) * 100

            if agent_percentage > 50:
                insights.append(
                    EmailInsight(
                        insight_type="activity",
                        title="High Agent Email Activity",
                        description=f"{agent_percentage:.1f}% of emails involve agents",
                        severity="low",
                        confidence=0.8,
                        data={
                            "agent_percentage": agent_percentage,
                            "agent_emails": len(agent_emails),
                        },
                        timestamp=datetime.now(),
                        actionable=False,
                        suggested_actions=[],
                    )
                )

        return insights

    async def _detect_anomalies(
        self, emails_data: List[Dict[str, Any]]
    ) -> List[EmailInsight]:
        """Detect anomalies in email patterns."""
        insights = []

        # Detect unusual volume spikes
        daily_volumes = defaultdict(int)
        for email in emails_data:
            email_date = email.get("date")
            if email_date:
                date_key = email_date.strftime("%Y-%m-%d")
                daily_volumes[date_key] += 1

        volumes = list(daily_volumes.values())
        if len(volumes) >= 5:
            mean_volume = statistics.mean(volumes)
            std_volume = statistics.stdev(volumes) if len(volumes) > 1 else 0

            for date, volume in daily_volumes.items():
                if std_volume > 0 and abs(volume - mean_volume) > 2 * std_volume:
                    insights.append(
                        EmailInsight(
                            insight_type="anomaly",
                            title="Unusual Email Volume",
                            description=f"Email volume on {date} was {volume}, significantly different from average {mean_volume:.1f}",
                            severity="medium",
                            confidence=0.8,
                            data={
                                "date": date,
                                "volume": volume,
                                "mean_volume": mean_volume,
                            },
                            timestamp=datetime.now(),
                            actionable=True,
                            suggested_actions=[
                                "Investigate cause of volume spike",
                                "Check for system issues",
                            ],
                        )
                    )

        return insights

    async def _generate_recommendations(
        self, metrics: EmailMetrics, insights: List[EmailInsight]
    ) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []

        # Based on metrics
        if metrics.avg_response_time_hours > 24:
            recommendations.append(
                "Consider implementing auto-reply system to improve response times"
            )

        if metrics.unread_emails > metrics.total_emails * 0.3:
            recommendations.append(
                "High number of unread emails - consider email prioritization system"
            )

        if metrics.performance_metrics.get("response_rate", 0) < 50:
            recommendations.append(
                "Low response rate - review email handling processes"
            )

        # Based on insights
        for insight in insights:
            if insight.actionable and insight.severity in ["high", "critical"]:
                recommendations.extend(insight.suggested_actions)

        return list(set(recommendations))  # Remove duplicates

    async def _generate_charts_data(
        self, period_start: datetime, period_end: datetime, agent_id: Optional[str]
    ) -> Dict[str, Any]:
        """Generate data for charts and visualizations."""
        try:
            emails_data = await self._get_emails_data(
                period_start, period_end, agent_id
            )

            # Volume over time
            daily_volumes = defaultdict(int)
            for email in emails_data:
                email_date = email.get("date")
                if email_date:
                    date_key = email_date.strftime("%Y-%m-%d")
                    daily_volumes[date_key] += 1

            volume_chart = [
                {"date": date, "count": count}
                for date, count in sorted(daily_volumes.items())
            ]

            # Activity by hour
            hourly_activity = defaultdict(int)
            for email in emails_data:
                email_date = email.get("date")
                if email_date:
                    hourly_activity[email_date.hour] += 1

            hourly_chart = [
                {"hour": hour, "count": count}
                for hour, count in sorted(hourly_activity.items())
            ]

            # Agent activity
            agent_activity = defaultdict(int)
            for email in emails_data:
                if email.get("from_agent"):
                    agent_activity[email["from_agent"]] += 1
                if email.get("to_agent"):
                    agent_activity[email["to_agent"]] += 1

            agent_chart = [
                {"agent": agent, "count": count}
                for agent, count in sorted(
                    agent_activity.items(), key=lambda x: x[1], reverse=True
                )
            ]

            return {
                "volume_over_time": volume_chart,
                "hourly_activity": hourly_chart,
                "agent_activity": agent_chart,
            }

        except Exception as e:
            logger.error(f"Failed to generate charts data: {e}")
            return {}

    async def _save_report(self, report: EmailReport) -> None:
        """Save report to storage."""
        try:
            report_file = self.reports_dir / f"{report.report_id}.json"

            # Convert to dictionary for JSON serialization
            report_dict = asdict(report)

            # Convert datetime objects to ISO strings
            for key, value in report_dict.items():
                if isinstance(value, datetime):
                    report_dict[key] = value.isoformat()
                elif isinstance(value, dict) and "timestamp" in value:
                    if isinstance(value["timestamp"], datetime):
                        value["timestamp"] = value["timestamp"].isoformat()

            with open(report_file, "w", encoding="utf-8") as f:
                json.dump(report_dict, f, indent=2, default=str)

            logger.info(f"Report saved: {report_file}")

        except Exception as e:
            logger.error(f"Failed to save report: {e}")


# Global analytics service instance
email_analytics_service = EmailAnalyticsService()
