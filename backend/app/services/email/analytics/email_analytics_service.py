"""
Email Analytics Service for Reynard Backend.

This module provides comprehensive email analytics, reporting, and insights generation.
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

        # Cache for metrics
        self._metrics_cache: Dict[str, Tuple[EmailMetrics, datetime]] = {}
        self._cache_ttl_hours = 1

    async def get_email_metrics(
        self,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
        agent_id: Optional[str] = None,
        use_cache: bool = True,
    ) -> EmailMetrics:
        """
        Get comprehensive email metrics for a period.

        Args:
            period_start: Start of the period (default: 30 days ago)
            period_end: End of the period (default: now)
            agent_id: Filter by specific agent (optional)
            use_cache: Whether to use cached results

        Returns:
            EmailMetrics object
        """
        try:
            # Set default period if not provided
            if not period_end:
                period_end = datetime.now()
            if not period_start:
                period_start = period_end - timedelta(days=30)

            # Create cache key
            cache_key = f"{period_start.isoformat()}_{period_end.isoformat()}_{agent_id or 'all'}"

            # Check cache
            if use_cache and self._is_cache_valid(cache_key):
                cached_metrics, _ = self._metrics_cache[cache_key]
                return cached_metrics

            # Get email data
            emails_data = await self._get_emails_data(
                period_start, period_end, agent_id
            )

            # Calculate metrics
            metrics = await self._calculate_metrics(
                emails_data, period_start, period_end
            )

            # Cache the results
            self._metrics_cache[cache_key] = (metrics, datetime.now())

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
            period_start: Start of the period
            period_end: End of the period
            agent_id: Filter by specific agent

        Returns:
            List of EmailInsight objects
        """
        try:
            # Set default period if not provided
            if not period_end:
                period_end = datetime.now()
            if not period_start:
                period_start = period_end - timedelta(days=30)

            # Get email data
            emails_data = await self._get_emails_data(
                period_start, period_end, agent_id
            )

            insights = []

            # Analyze volume trends
            volume_insights = await self._analyze_volume_trends(emails_data)
            insights.extend(volume_insights)

            # Analyze response times
            response_insights = await self._analyze_response_times(emails_data)
            insights.extend(response_insights)

            # Analyze content patterns
            content_insights = await self._analyze_content_patterns(emails_data)
            insights.extend(content_insights)

            # Analyze agent activity
            agent_insights = await self._analyze_agent_activity(emails_data)
            insights.extend(agent_insights)

            # Detect anomalies
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
        Generate comprehensive email report.

        Args:
            report_type: Type of report ('daily', 'weekly', 'monthly', 'custom')
            period_start: Start of the period
            period_end: End of the period
            agent_id: Filter by specific agent

        Returns:
            EmailReport object
        """
        try:
            # Set default period based on report type
            if not period_start or not period_end:
                period_start, period_end = self._get_default_period(report_type)

            # Generate report ID
            report_id = f"{report_type}_{period_start.strftime('%Y%m%d')}_{period_end.strftime('%Y%m%d')}"
            if agent_id:
                report_id += f"_{agent_id}"

            # Get metrics
            metrics = await self.get_email_metrics(period_start, period_end, agent_id)

            # Generate insights
            insights = await self.generate_insights(period_start, period_end, agent_id)

            # Generate recommendations
            recommendations = await self._generate_recommendations(metrics, insights)

            # Generate charts data
            charts_data = await self._generate_charts_data(
                period_start, period_end, agent_id
            )

            # Create report
            report = EmailReport(
                report_id=report_id,
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
            agent_id: Agent ID
            period_start: Start of the period
            period_end: End of the period

        Returns:
            Dictionary with agent performance metrics
        """
        try:
            # Set default period if not provided
            if not period_end:
                period_end = datetime.now()
            if not period_start:
                period_start = period_end - timedelta(days=30)

            # Get email data for the agent
            emails_data = await self._get_emails_data(
                period_start, period_end, agent_id
            )

            # Calculate agent-specific metrics
            sent_emails = [
                e for e in emails_data if e.get("sender_agent_id") == agent_id
            ]
            received_emails = [
                e for e in emails_data if e.get("recipient_agent_id") == agent_id
            ]

            # Response time analysis
            response_times = []
            for email in received_emails:
                if email.get("response_time_hours"):
                    response_times.append(email["response_time_hours"])

            avg_response_time = (
                statistics.mean(response_times) if response_times else 0.0
            )

            # Email volume by day
            daily_volume = defaultdict(int)
            for email in emails_data:
                date = email.get("date", datetime.now()).date()
                daily_volume[date] += 1

            # Content analysis
            all_subjects = [e.get("subject", "") for e in emails_data]
            all_bodies = [e.get("body", "") for e in emails_data]

            # Common phrases
            common_phrases = self._get_common_phrases(all_bodies)

            # Performance score calculation
            performance_score = self._calculate_performance_score(
                len(sent_emails),
                len(received_emails),
                avg_response_time,
                len(emails_data),
            )

            return {
                "agent_id": agent_id,
                "period_start": period_start.isoformat(),
                "period_end": period_end.isoformat(),
                "total_emails": len(emails_data),
                "sent_emails": len(sent_emails),
                "received_emails": len(received_emails),
                "avg_response_time_hours": avg_response_time,
                "daily_volume": dict(daily_volume),
                "common_phrases": common_phrases[:10],  # Top 10
                "performance_score": performance_score,
                "email_types": self._analyze_email_types(emails_data),
                "sentiment_analysis": self._analyze_sentiment(emails_data),
                "peak_hours": self._get_peak_hours(emails_data),
                "top_correspondents": self._get_top_correspondents(
                    emails_data, agent_id
                ),
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
            metric: Metric to analyze ('volume', 'response_time', 'sentiment')
            period_days: Number of days to analyze
            agent_id: Filter by specific agent

        Returns:
            List of trend data points
        """
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=period_days)

            # Get email data
            emails_data = await self._get_emails_data(start_date, end_date, agent_id)

            # Group by day
            daily_data = defaultdict(list)
            for email in emails_data:
                date = email.get("date", datetime.now()).date()
                daily_data[date].append(email)

            trends = []
            for date in sorted(daily_data.keys()):
                day_emails = daily_data[date]

                if metric == "volume":
                    value = len(day_emails)
                elif metric == "response_time":
                    response_times = [
                        e.get("response_time_hours", 0)
                        for e in day_emails
                        if e.get("response_time_hours")
                    ]
                    value = statistics.mean(response_times) if response_times else 0.0
                elif metric == "sentiment":
                    sentiments = [e.get("sentiment", "neutral") for e in day_emails]
                    sentiment_counts = Counter(sentiments)
                    # Calculate positive sentiment ratio
                    positive_count = sentiment_counts.get("positive", 0)
                    total_count = len(sentiments)
                    value = positive_count / total_count if total_count > 0 else 0.0
                else:
                    value = 0

                trends.append(
                    {
                        "date": date.isoformat(),
                        "value": value,
                        "count": len(day_emails),
                    }
                )

            return trends

        except Exception as e:
            logger.error(f"Failed to get email trends: {e}")
            return []

    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached metrics are still valid."""
        if cache_key not in self._metrics_cache:
            return False

        _, cache_time = self._metrics_cache[cache_key]
        return datetime.now() - cache_time < timedelta(hours=self._cache_ttl_hours)

    async def _get_emails_data(
        self,
        period_start: Optional[datetime],
        period_end: Optional[datetime],
        agent_id: Optional[str],
    ) -> List[Dict[str, Any]]:
        """Get email data for analysis."""
        try:
            # This would integrate with actual email services
            # For now, return mock data
            emails_data = []

            # Mock data generation for demonstration
            current_date = period_start or datetime.now() - timedelta(days=30)
            end_date = period_end or datetime.now()

            while current_date < end_date:
                # Generate some mock emails
                for i in range(3):  # 3 emails per day
                    email_data = {
                        "id": f"email_{current_date.strftime('%Y%m%d')}_{i}",
                        "subject": f"Test Email {i}",
                        "body": f"This is test email {i} content.",
                        "sender": f"sender{i}@example.com",
                        "recipient": f"recipient{i}@example.com",
                        "date": current_date,
                        "sender_agent_id": agent_id if i % 2 == 0 else None,
                        "recipient_agent_id": agent_id if i % 2 == 1 else None,
                        "response_time_hours": 2.5 + i,
                        "sentiment": ["positive", "neutral", "negative"][i % 3],
                        "email_type": ["question", "request", "general"][i % 3],
                    }
                    emails_data.append(email_data)

                current_date += timedelta(days=1)

            return emails_data

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
        try:
            total_emails = len(emails_data)
            sent_emails = len([e for e in emails_data if e.get("sender_agent_id")])
            received_emails = len(
                [e for e in emails_data if e.get("recipient_agent_id")]
            )
            agent_emails = len(
                [
                    e
                    for e in emails_data
                    if e.get("sender_agent_id") or e.get("recipient_agent_id")
                ]
            )

            # Response time analysis
            response_times = [
                e.get("response_time_hours", 0)
                for e in emails_data
                if e.get("response_time_hours")
            ]
            avg_response_time = (
                statistics.mean(response_times) if response_times else 0.0
            )

            # Email length analysis
            email_lengths = [len(e.get("body", "")) for e in emails_data]
            avg_email_length = statistics.mean(email_lengths) if email_lengths else 0.0

            # Activity analysis
            hours = [e.get("date", datetime.now()).hour for e in emails_data]
            most_active_hour = Counter(hours).most_common(1)[0][0] if hours else 0

            days = [e.get("date", datetime.now()).strftime("%A") for e in emails_data]
            most_active_day = Counter(days).most_common(1)[0][0] if days else "Monday"

            # Top senders and recipients
            senders = [e.get("sender", "") for e in emails_data]
            recipients = [e.get("recipient", "") for e in emails_data]

            top_senders = [
                {"email": email, "count": count}
                for email, count in Counter(senders).most_common(10)
            ]
            top_recipients = [
                {"email": email, "count": count}
                for email, count in Counter(recipients).most_common(10)
            ]

            # Email volume trend
            daily_volume = defaultdict(int)
            for email in emails_data:
                date = email.get("date", datetime.now()).date()
                daily_volume[date] += 1

            email_volume_trend = [
                {"date": date.isoformat(), "count": count}
                for date, count in sorted(daily_volume.items())
            ]

            # Agent activity
            agent_activity = {}
            for email in emails_data:
                agent_id = email.get("sender_agent_id") or email.get(
                    "recipient_agent_id"
                )
                if agent_id:
                    if agent_id not in agent_activity:
                        agent_activity[agent_id] = {"sent": 0, "received": 0}
                    if email.get("sender_agent_id") == agent_id:
                        agent_activity[agent_id]["sent"] += 1
                    if email.get("recipient_agent_id") == agent_id:
                        agent_activity[agent_id]["received"] += 1

            # Content analysis
            all_subjects = [e.get("subject", "") for e in emails_data]
            all_bodies = [e.get("body", "") for e in emails_data]

            content_analysis = {
                "common_phrases": self._get_common_phrases(all_bodies),
                "email_types": self._analyze_email_types(emails_data),
                "sentiment_distribution": self._analyze_sentiment(emails_data),
            }

            # Performance metrics
            performance_metrics = {
                "response_rate": (
                    (len(response_times) / total_emails * 100)
                    if total_emails > 0
                    else 0.0
                ),
                "avg_emails_per_day": (
                    total_emails / max(1, (period_end - period_start).days)
                    if period_start and period_end
                    else 0.0
                ),
                "agent_engagement_rate": (
                    (agent_emails / total_emails * 100) if total_emails > 0 else 0.0
                ),
            }

            return EmailMetrics(
                total_emails=total_emails,
                sent_emails=sent_emails,
                received_emails=received_emails,
                agent_emails=agent_emails,
                unread_emails=0,  # Would need additional tracking
                replied_emails=len(response_times),
                processed_emails=total_emails,
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

        except Exception as e:
            logger.error(f"Failed to calculate metrics: {e}")
            return self._create_empty_metrics()

    def _get_common_phrases(
        self, texts: List[str], min_length: int = 3
    ) -> List[Dict[str, Any]]:
        """Extract common phrases from text."""
        try:
            # Simple phrase extraction (in production, use NLP libraries)
            all_words = []
            for text in texts:
                words = text.lower().split()
                all_words.extend([w for w in words if len(w) >= min_length])

            word_counts = Counter(all_words)
            return [
                {"phrase": word, "count": count}
                for word, count in word_counts.most_common(20)
            ]

        except Exception as e:
            logger.error(f"Failed to extract common phrases: {e}")
            return []

    def _get_default_period(self, report_type: str) -> Tuple[datetime, datetime]:
        """Get default period for report type."""
        end_date = datetime.now()

        if report_type == "daily":
            start_date = end_date - timedelta(days=1)
        elif report_type == "weekly":
            start_date = end_date - timedelta(weeks=1)
        elif report_type == "monthly":
            start_date = end_date - timedelta(days=30)
        else:  # custom
            start_date = end_date - timedelta(days=30)

        return start_date, end_date

    async def _analyze_volume_trends(
        self, emails_data: List[Dict[str, Any]]
    ) -> List[EmailInsight]:
        """Analyze email volume trends."""
        insights = []

        try:
            # Group by day
            daily_volume = defaultdict(int)
            for email in emails_data:
                date = email.get("date", datetime.now()).date()
                daily_volume[date] += 1

            if len(daily_volume) < 2:
                return insights

            volumes = list(daily_volume.values())
            avg_volume = statistics.mean(volumes)
            std_volume = statistics.stdev(volumes) if len(volumes) > 1 else 0

            # Detect spikes
            for date, volume in daily_volume.items():
                if volume > avg_volume + 2 * std_volume:
                    insights.append(
                        EmailInsight(
                            insight_type="anomaly",
                            title="Email Volume Spike Detected",
                            description=f"Unusual email volume spike on {date}: {volume} emails (avg: {avg_volume:.1f})",
                            severity="medium",
                            confidence=0.8,
                            data={
                                "date": date.isoformat(),
                                "volume": volume,
                                "average": avg_volume,
                            },
                            timestamp=datetime.now(),
                            actionable=True,
                            suggested_actions=[
                                "Investigate cause of spike",
                                "Check for system issues",
                            ],
                        )
                    )

            # Detect trends
            if len(volumes) >= 7:  # At least a week of data
                recent_avg = statistics.mean(volumes[-3:])  # Last 3 days
                earlier_avg = statistics.mean(volumes[:-3])  # Earlier days

                if recent_avg > earlier_avg * 1.2:  # 20% increase
                    insights.append(
                        EmailInsight(
                            insight_type="trend",
                            title="Increasing Email Volume Trend",
                            description=f"Email volume has increased by {((recent_avg - earlier_avg) / earlier_avg * 100):.1f}%",
                            severity="low",
                            confidence=0.7,
                            data={"recent_avg": recent_avg, "earlier_avg": earlier_avg},
                            timestamp=datetime.now(),
                            actionable=True,
                            suggested_actions=[
                                "Monitor capacity",
                                "Consider scaling resources",
                            ],
                        )
                    )

        except Exception as e:
            logger.error(f"Failed to analyze volume trends: {e}")

        return insights

    async def _analyze_response_times(
        self, emails_data: List[Dict[str, Any]]
    ) -> List[EmailInsight]:
        """Analyze email response times."""
        insights = []

        try:
            response_times = [
                e.get("response_time_hours", 0)
                for e in emails_data
                if e.get("response_time_hours")
            ]

            if not response_times:
                return insights

            avg_response_time = statistics.mean(response_times)
            max_response_time = max(response_times)

            # Slow response insight
            if avg_response_time > 24:  # More than 24 hours
                insights.append(
                    EmailInsight(
                        insight_type="performance",
                        title="Slow Average Response Time",
                        description=f"Average response time is {avg_response_time:.1f} hours, which is above target",
                        severity="high",
                        confidence=0.9,
                        data={
                            "avg_response_time": avg_response_time,
                            "max_response_time": max_response_time,
                        },
                        timestamp=datetime.now(),
                        actionable=True,
                        suggested_actions=[
                            "Review response processes",
                            "Set up alerts for slow responses",
                        ],
                    )
                )

            # Very slow responses
            very_slow = [rt for rt in response_times if rt > 72]  # More than 3 days
            if very_slow:
                insights.append(
                    EmailInsight(
                        insight_type="anomaly",
                        title="Very Slow Response Times Detected",
                        description=f"{len(very_slow)} emails took more than 72 hours to respond",
                        severity="critical",
                        confidence=0.95,
                        data={
                            "very_slow_count": len(very_slow),
                            "very_slow_times": very_slow,
                        },
                        timestamp=datetime.now(),
                        actionable=True,
                        suggested_actions=[
                            "Investigate specific cases",
                            "Implement escalation procedures",
                        ],
                    )
                )

        except Exception as e:
            logger.error(f"Failed to analyze response times: {e}")

        return insights

    async def _analyze_content_patterns(
        self, emails_data: List[Dict[str, Any]]
    ) -> List[EmailInsight]:
        """Analyze email content patterns."""
        insights = []

        try:
            # Analyze email types
            email_types = [e.get("email_type", "unknown") for e in emails_data]
            type_counts = Counter(email_types)

            # Check for unusual distribution
            total_emails = len(emails_data)
            for email_type, count in type_counts.items():
                percentage = (count / total_emails) * 100
                if percentage > 50:  # More than 50% of emails are one type
                    insights.append(
                        EmailInsight(
                            insight_type="pattern",
                            title=f"High Concentration of {email_type.title()} Emails",
                            description=f"{percentage:.1f}% of emails are {email_type} type",
                            severity="low",
                            confidence=0.8,
                            data={
                                "email_type": email_type,
                                "count": count,
                                "percentage": percentage,
                            },
                            timestamp=datetime.now(),
                            actionable=False,
                            suggested_actions=[],
                        )
                    )

            # Analyze sentiment
            sentiments = [e.get("sentiment", "neutral") for e in emails_data]
            sentiment_counts = Counter(sentiments)

            negative_count = sentiment_counts.get("negative", 0)
            if negative_count > total_emails * 0.3:  # More than 30% negative
                insights.append(
                    EmailInsight(
                        insight_type="trend",
                        title="High Negative Sentiment",
                        description=f"{negative_count} emails ({negative_count/total_emails*100:.1f}%) have negative sentiment",
                        severity="medium",
                        confidence=0.7,
                        data={
                            "negative_count": negative_count,
                            "total_emails": total_emails,
                        },
                        timestamp=datetime.now(),
                        actionable=True,
                        suggested_actions=[
                            "Review communication tone",
                            "Address underlying issues",
                        ],
                    )
                )

        except Exception as e:
            logger.error(f"Failed to analyze content patterns: {e}")

        return insights

    async def _analyze_agent_activity(
        self, emails_data: List[Dict[str, Any]]
    ) -> List[EmailInsight]:
        """Analyze agent activity patterns."""
        insights = []

        try:
            # Group by agent
            agent_activity = defaultdict(lambda: {"sent": 0, "received": 0})
            for email in emails_data:
                sender_agent = email.get("sender_agent_id")
                recipient_agent = email.get("recipient_agent_id")

                if sender_agent:
                    agent_activity[sender_agent]["sent"] += 1
                if recipient_agent:
                    agent_activity[recipient_agent]["received"] += 1

            # Find inactive agents
            total_emails = len(emails_data)
            for agent_id, activity in agent_activity.items():
                total_activity = activity["sent"] + activity["received"]
                if total_activity == 0:
                    insights.append(
                        EmailInsight(
                            insight_type="anomaly",
                            title=f"Inactive Agent: {agent_id}",
                            description=f"Agent {agent_id} has no email activity",
                            severity="medium",
                            confidence=0.9,
                            data={"agent_id": agent_id, "activity": activity},
                            timestamp=datetime.now(),
                            actionable=True,
                            suggested_actions=[
                                "Check agent status",
                                "Verify configuration",
                            ],
                        )
                    )

            # Find highly active agents
            for agent_id, activity in agent_activity.items():
                total_activity = activity["sent"] + activity["received"]
                if total_activity > total_emails * 0.5:  # More than 50% of all emails
                    insights.append(
                        EmailInsight(
                            insight_type="pattern",
                            title=f"Highly Active Agent: {agent_id}",
                            description=f"Agent {agent_id} handles {total_activity} emails ({total_activity/total_emails*100:.1f}% of total)",
                            severity="low",
                            confidence=0.8,
                            data={
                                "agent_id": agent_id,
                                "activity": activity,
                                "total_emails": total_emails,
                            },
                            timestamp=datetime.now(),
                            actionable=False,
                            suggested_actions=[],
                        )
                    )

        except Exception as e:
            logger.error(f"Failed to analyze agent activity: {e}")

        return insights

    async def _detect_anomalies(
        self, emails_data: List[Dict[str, Any]]
    ) -> List[EmailInsight]:
        """Detect anomalies in email data."""
        insights = []

        try:
            # Group by hour to detect unusual patterns
            hourly_volume = defaultdict(int)
            for email in emails_data:
                hour = email.get("date", datetime.now()).hour
                hourly_volume[hour] += 1

            # Find unusual hours (outside business hours with high volume)
            business_hours = set(range(9, 17))  # 9 AM to 5 PM
            for hour, volume in hourly_volume.items():
                if (
                    hour not in business_hours and volume > 5
                ):  # More than 5 emails outside business hours
                    insights.append(
                        EmailInsight(
                            insight_type="anomaly",
                            title=f"Unusual Activity at {hour}:00",
                            description=f"{volume} emails sent at {hour}:00 (outside business hours)",
                            severity="low",
                            confidence=0.6,
                            data={"hour": hour, "volume": volume},
                            timestamp=datetime.now(),
                            actionable=False,
                            suggested_actions=[],
                        )
                    )

            # Detect email length anomalies
            email_lengths = [len(e.get("body", "")) for e in emails_data]
            if email_lengths:
                avg_length = statistics.mean(email_lengths)
                std_length = (
                    statistics.stdev(email_lengths) if len(email_lengths) > 1 else 0
                )

                very_long_emails = [
                    e
                    for e in emails_data
                    if len(e.get("body", "")) > avg_length + 3 * std_length
                ]
                if very_long_emails:
                    insights.append(
                        EmailInsight(
                            insight_type="anomaly",
                            title="Unusually Long Emails Detected",
                            description=f"{len(very_long_emails)} emails are significantly longer than average",
                            severity="low",
                            confidence=0.7,
                            data={
                                "long_email_count": len(very_long_emails),
                                "avg_length": avg_length,
                            },
                            timestamp=datetime.now(),
                            actionable=False,
                            suggested_actions=[],
                        )
                    )

        except Exception as e:
            logger.error(f"Failed to detect anomalies: {e}")

        return insights

    async def _generate_recommendations(
        self, metrics: EmailMetrics, insights: List[EmailInsight]
    ) -> List[str]:
        """Generate recommendations based on metrics and insights."""
        recommendations = []

        try:
            # Response time recommendations
            if metrics.avg_response_time_hours > 24:
                recommendations.append(
                    "Consider implementing automated responses for common queries to reduce response time"
                )

            # Volume recommendations
            if metrics.total_emails > 1000:  # High volume
                recommendations.append(
                    "Consider implementing email categorization and routing to improve efficiency"
                )

            # Agent activity recommendations
            if len(metrics.agent_activity) > 5:  # Multiple agents
                recommendations.append(
                    "Review agent workload distribution to ensure balanced email handling"
                )

            # Insight-based recommendations
            for insight in insights:
                if insight.actionable and insight.severity in ["high", "critical"]:
                    recommendations.extend(insight.suggested_actions)

            # General recommendations
            if metrics.performance_metrics.get("response_rate", 0) < 80:
                recommendations.append(
                    "Improve response rate by setting up email monitoring and alerts"
                )

        except Exception as e:
            logger.error(f"Failed to generate recommendations: {e}")

        return list(set(recommendations))  # Remove duplicates

    async def _generate_charts_data(
        self, period_start: datetime, period_end: datetime, agent_id: Optional[str]
    ) -> Dict[str, Any]:
        """Generate data for charts and visualizations."""
        try:
            # Get email data
            emails_data = await self._get_emails_data(
                period_start, period_end, agent_id
            )

            # Volume over time
            daily_volume = defaultdict(int)
            for email in emails_data:
                date = email.get("date", datetime.now()).date()
                daily_volume[date] += 1

            volume_chart = [
                {"date": date.isoformat(), "count": count}
                for date, count in sorted(daily_volume.items())
            ]

            # Response time distribution
            response_times = [
                e.get("response_time_hours", 0)
                for e in emails_data
                if e.get("response_time_hours")
            ]
            response_time_buckets = {
                "< 1 hour": len([rt for rt in response_times if rt < 1]),
                "1-4 hours": len([rt for rt in response_times if 1 <= rt < 4]),
                "4-24 hours": len([rt for rt in response_times if 4 <= rt < 24]),
                "1-3 days": len([rt for rt in response_times if 24 <= rt < 72]),
                "> 3 days": len([rt for rt in response_times if rt >= 72]),
            }

            # Email type distribution
            email_types = [e.get("email_type", "unknown") for e in emails_data]
            type_distribution = dict(Counter(email_types))

            # Sentiment distribution
            sentiments = [e.get("sentiment", "neutral") for e in emails_data]
            sentiment_distribution = dict(Counter(sentiments))

            # Hourly activity
            hourly_activity = defaultdict(int)
            for email in emails_data:
                hour = email.get("date", datetime.now()).hour
                hourly_activity[hour] += 1

            hourly_chart = [
                {"hour": hour, "count": count}
                for hour, count in sorted(hourly_activity.items())
            ]

            return {
                "volume_over_time": volume_chart,
                "response_time_distribution": response_time_buckets,
                "email_type_distribution": type_distribution,
                "sentiment_distribution": sentiment_distribution,
                "hourly_activity": hourly_chart,
            }

        except Exception as e:
            logger.error(f"Failed to generate charts data: {e}")
            return {}

    async def _save_report(self, report: EmailReport) -> None:
        """Save report to storage."""
        try:
            reports_dir = self.data_dir / "reports"
            reports_dir.mkdir(exist_ok=True)

            report_file = reports_dir / f"{report.report_id}.json"

            report_data = asdict(report)

            # Convert datetime objects to ISO strings
            for key, value in report_data.items():
                if isinstance(value, datetime):
                    report_data[key] = value.isoformat()

            with open(report_file, "w", encoding="utf-8") as f:
                json.dump(report_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save report: {e}")

    def _analyze_email_types(self, emails_data: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyze distribution of email types."""
        email_types = [e.get("email_type", "unknown") for e in emails_data]
        return dict(Counter(email_types))

    def _analyze_sentiment(self, emails_data: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyze sentiment distribution."""
        sentiments = [e.get("sentiment", "neutral") for e in emails_data]
        return dict(Counter(sentiments))

    def _get_peak_hours(self, emails_data: List[Dict[str, Any]]) -> List[int]:
        """Get peak activity hours."""
        hours = [e.get("date", datetime.now()).hour for e in emails_data]
        hour_counts = Counter(hours)
        return [hour for hour, _ in hour_counts.most_common(5)]

    def _get_top_correspondents(
        self, emails_data: List[Dict[str, Any]], agent_id: str
    ) -> List[Dict[str, Any]]:
        """Get top correspondents for an agent."""
        correspondents = []
        for email in emails_data:
            if email.get("sender_agent_id") == agent_id:
                correspondents.append(email.get("recipient", ""))
            elif email.get("recipient_agent_id") == agent_id:
                correspondents.append(email.get("sender", ""))

        correspondent_counts = Counter(correspondents)
        return [
            {"email": email, "count": count}
            for email, count in correspondent_counts.most_common(10)
        ]

    def _calculate_performance_score(
        self,
        sent_emails: int,
        received_emails: int,
        avg_response_time: float,
        total_emails: int,
    ) -> float:
        """Calculate a performance score for an agent."""
        try:
            # Simple scoring algorithm
            score = 0.0

            # Email activity score (0-40 points)
            activity_score = min(40, (sent_emails + received_emails) * 2)
            score += activity_score

            # Response time score (0-40 points)
            if avg_response_time > 0:
                response_score = max(
                    0, 40 - (avg_response_time / 24) * 10
                )  # Penalty for slow responses
                score += response_score
            else:
                score += 20  # Neutral score if no response time data

            # Engagement score (0-20 points)
            if total_emails > 0:
                engagement_score = min(
                    20, (sent_emails + received_emails) / total_emails * 20
                )
                score += engagement_score

            return min(100, max(0, score))  # Clamp between 0 and 100

        except Exception as e:
            logger.error(f"Failed to calculate performance score: {e}")
            return 0.0


# Global email analytics service instance
email_analytics_service = EmailAnalyticsService()
