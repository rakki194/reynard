"""
Email Analytics API Routes for Reynard Backend.

This module provides API endpoints for email analytics and reporting.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

from ..services.email_analytics_service import email_analytics_service
from ..auth.user_service import get_current_active_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/email/analytics", tags=["email-analytics"])


@router.get("/metrics")
async def get_email_metrics(
    period_start: Optional[datetime] = Query(
        None, description="Start of analysis period"
    ),
    period_end: Optional[datetime] = Query(None, description="End of analysis period"),
    agent_id: Optional[str] = Query(None, description="Specific agent to analyze"),
    use_cache: bool = Query(True, description="Use cached results"),
    current_user: dict = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Get comprehensive email metrics for a given period.

    Returns:
        Dictionary containing email metrics and statistics
    """
    try:
        metrics = await email_analytics_service.get_email_metrics(
            period_start=period_start,
            period_end=period_end,
            agent_id=agent_id,
            use_cache=use_cache,
        )

        # Convert dataclass to dictionary
        return {
            "total_emails": metrics.total_emails,
            "sent_emails": metrics.sent_emails,
            "received_emails": metrics.received_emails,
            "agent_emails": metrics.agent_emails,
            "unread_emails": metrics.unread_emails,
            "replied_emails": metrics.replied_emails,
            "processed_emails": metrics.processed_emails,
            "avg_response_time_hours": metrics.avg_response_time_hours,
            "avg_email_length": metrics.avg_email_length,
            "most_active_hour": metrics.most_active_hour,
            "most_active_day": metrics.most_active_day,
            "top_senders": metrics.top_senders,
            "top_recipients": metrics.top_recipients,
            "email_volume_trend": metrics.email_volume_trend,
            "agent_activity": metrics.agent_activity,
            "content_analysis": metrics.content_analysis,
            "performance_metrics": metrics.performance_metrics,
        }

    except Exception as e:
        logger.error(f"Failed to get email metrics: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get email metrics: {str(e)}"
        )


@router.get("/insights")
async def get_email_insights(
    period_start: Optional[datetime] = Query(
        None, description="Start of analysis period"
    ),
    period_end: Optional[datetime] = Query(None, description="End of analysis period"),
    agent_id: Optional[str] = Query(None, description="Specific agent to analyze"),
    current_user: dict = Depends(get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Generate insights from email data.

    Returns:
        List of insight objects with analysis and recommendations
    """
    try:
        insights = await email_analytics_service.generate_insights(
            period_start=period_start, period_end=period_end, agent_id=agent_id
        )

        # Convert dataclass to dictionary
        return [
            {
                "insight_type": insight.insight_type,
                "title": insight.title,
                "description": insight.description,
                "severity": insight.severity,
                "confidence": insight.confidence,
                "data": insight.data,
                "timestamp": insight.timestamp.isoformat(),
                "actionable": insight.actionable,
                "suggested_actions": insight.suggested_actions,
            }
            for insight in insights
        ]

    except Exception as e:
        logger.error(f"Failed to generate insights: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to generate insights: {str(e)}"
        )


@router.get("/reports/{report_type}")
async def generate_email_report(
    report_type: str,
    period_start: Optional[datetime] = Query(
        None, description="Start of analysis period"
    ),
    period_end: Optional[datetime] = Query(None, description="End of analysis period"),
    agent_id: Optional[str] = Query(None, description="Specific agent to analyze"),
    current_user: dict = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Generate a comprehensive email report.

    Args:
        report_type: Type of report ('daily', 'weekly', 'monthly', 'custom')

    Returns:
        Dictionary containing complete email report
    """
    try:
        if report_type not in ["daily", "weekly", "monthly", "custom"]:
            raise HTTPException(status_code=400, detail="Invalid report type")

        report = await email_analytics_service.generate_report(
            report_type=report_type,
            period_start=period_start,
            period_end=period_end,
            agent_id=agent_id,
        )

        # Convert dataclass to dictionary
        return {
            "report_id": report.report_id,
            "report_type": report.report_type,
            "period_start": report.period_start.isoformat(),
            "period_end": report.period_end.isoformat(),
            "generated_at": report.generated_at.isoformat(),
            "metrics": {
                "total_emails": report.metrics.total_emails,
                "sent_emails": report.metrics.sent_emails,
                "received_emails": report.metrics.received_emails,
                "agent_emails": report.metrics.agent_emails,
                "unread_emails": report.metrics.unread_emails,
                "replied_emails": report.metrics.replied_emails,
                "processed_emails": report.metrics.processed_emails,
                "avg_response_time_hours": report.metrics.avg_response_time_hours,
                "avg_email_length": report.metrics.avg_email_length,
                "most_active_hour": report.metrics.most_active_hour,
                "most_active_day": report.metrics.most_active_day,
                "top_senders": report.metrics.top_senders,
                "top_recipients": report.metrics.top_recipients,
                "email_volume_trend": report.metrics.email_volume_trend,
                "agent_activity": report.metrics.agent_activity,
                "content_analysis": report.metrics.content_analysis,
                "performance_metrics": report.metrics.performance_metrics,
            },
            "insights": [
                {
                    "insight_type": insight.insight_type,
                    "title": insight.title,
                    "description": insight.description,
                    "severity": insight.severity,
                    "confidence": insight.confidence,
                    "data": insight.data,
                    "timestamp": insight.timestamp.isoformat(),
                    "actionable": insight.actionable,
                    "suggested_actions": insight.suggested_actions,
                }
                for insight in report.insights
            ],
            "recommendations": report.recommendations,
            "charts_data": report.charts_data,
        }

    except Exception as e:
        logger.error(f"Failed to generate report: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to generate report: {str(e)}"
        )


@router.get("/agent/{agent_id}/performance")
async def get_agent_performance(
    agent_id: str,
    period_start: Optional[datetime] = Query(
        None, description="Start of analysis period"
    ),
    period_end: Optional[datetime] = Query(None, description="End of analysis period"),
    current_user: dict = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Get performance metrics for a specific agent.

    Args:
        agent_id: Agent ID to analyze

    Returns:
        Dictionary with agent performance metrics
    """
    try:
        performance = await email_analytics_service.get_agent_performance(
            agent_id=agent_id, period_start=period_start, period_end=period_end
        )

        return performance

    except Exception as e:
        logger.error(f"Failed to get agent performance: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get agent performance: {str(e)}"
        )


@router.get("/trends")
async def get_email_trends(
    metric: str = Query(
        "volume",
        description="Metric to analyze ('volume', 'response_time', 'agent_activity')",
    ),
    period_days: int = Query(30, description="Number of days to analyze"),
    agent_id: Optional[str] = Query(None, description="Specific agent to analyze"),
    current_user: dict = Depends(get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Get email trends over time.

    Args:
        metric: Metric to analyze
        period_days: Number of days to analyze
        agent_id: Specific agent to analyze

    Returns:
        List of trend data points
    """
    try:
        if metric not in ["volume", "response_time", "agent_activity"]:
            raise HTTPException(status_code=400, detail="Invalid metric type")

        trends = await email_analytics_service.get_email_trends(
            metric=metric, period_days=period_days, agent_id=agent_id
        )

        return trends

    except Exception as e:
        logger.error(f"Failed to get email trends: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get email trends: {str(e)}"
        )


@router.get("/dashboard")
async def get_analytics_dashboard(
    period_days: int = Query(7, description="Number of days for dashboard data"),
    current_user: dict = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Get comprehensive analytics dashboard data.

    Returns:
        Dictionary containing all dashboard data
    """
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=period_days)

        # Get all dashboard data in parallel
        metrics_task = email_analytics_service.get_email_metrics(
            period_start=start_date, period_end=end_date
        )
        insights_task = email_analytics_service.generate_insights(
            period_start=start_date, period_end=end_date
        )
        volume_trends_task = email_analytics_service.get_email_trends(
            metric="volume", period_days=period_days
        )
        response_trends_task = email_analytics_service.get_email_trends(
            metric="response_time", period_days=period_days
        )
        agent_trends_task = email_analytics_service.get_email_trends(
            metric="agent_activity", period_days=period_days
        )

        # Wait for all tasks to complete
        import asyncio

        metrics, insights, volume_trends, response_trends, agent_trends = (
            await asyncio.gather(
                metrics_task,
                insights_task,
                volume_trends_task,
                response_trends_task,
                agent_trends_task,
            )
        )

        # Convert metrics to dictionary
        metrics_dict = {
            "total_emails": metrics.total_emails,
            "sent_emails": metrics.sent_emails,
            "received_emails": metrics.received_emails,
            "agent_emails": metrics.agent_emails,
            "unread_emails": metrics.unread_emails,
            "replied_emails": metrics.replied_emails,
            "processed_emails": metrics.processed_emails,
            "avg_response_time_hours": metrics.avg_response_time_hours,
            "avg_email_length": metrics.avg_email_length,
            "most_active_hour": metrics.most_active_hour,
            "most_active_day": metrics.most_active_day,
            "top_senders": metrics.top_senders,
            "top_recipients": metrics.top_recipients,
            "email_volume_trend": metrics.email_volume_trend,
            "agent_activity": metrics.agent_activity,
            "content_analysis": metrics.content_analysis,
            "performance_metrics": metrics.performance_metrics,
        }

        # Convert insights to dictionary
        insights_dict = [
            {
                "insight_type": insight.insight_type,
                "title": insight.title,
                "description": insight.description,
                "severity": insight.severity,
                "confidence": insight.confidence,
                "data": insight.data,
                "timestamp": insight.timestamp.isoformat(),
                "actionable": insight.actionable,
                "suggested_actions": insight.suggested_actions,
            }
            for insight in insights
        ]

        return {
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
            "period_days": period_days,
            "metrics": metrics_dict,
            "insights": insights_dict,
            "trends": {
                "volume": volume_trends,
                "response_time": response_trends,
                "agent_activity": agent_trends,
            },
            "generated_at": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Failed to get analytics dashboard: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get analytics dashboard: {str(e)}"
        )


@router.get("/health")
async def get_analytics_health(
    current_user: dict = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Get analytics service health status.

    Returns:
        Dictionary containing service health information
    """
    try:
        # Test basic functionality
        test_metrics = await email_analytics_service.get_email_metrics(use_cache=False)

        return {
            "status": "healthy",
            "service": "email_analytics",
            "cache_size": len(email_analytics_service._metrics_cache),
            "data_dir": str(email_analytics_service.data_dir),
            "reports_dir": str(email_analytics_service.reports_dir),
            "test_metrics_available": test_metrics.total_emails >= 0,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Analytics service health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "email_analytics",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }
