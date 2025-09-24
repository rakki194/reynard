"""Security Dashboard API for Reynard Backend

This module provides endpoints for security monitoring, analytics,
and management of the security system.
"""

import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .adaptive_rate_limiter import adaptive_rate_limiter
from .security_analytics import security_analytics
from .security_config import get_security_config
from .security_error_handler import security_error_handler

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/security", tags=["security"])


class SecurityMetricsResponse(BaseModel):
    """Response model for security metrics."""

    total_events: int
    events_by_type: dict[str, int]
    events_by_threat_level: dict[str, int]
    blocked_requests: int
    rate_limited_requests: int
    active_clients: int
    system_load: float
    threat_detection_success_rate: float


class ThreatAnalysisResponse(BaseModel):
    """Response model for threat analysis."""

    period_hours: int
    threat_level: str
    risk_score: float
    threat_patterns: dict[str, Any]
    attack_vectors: list[dict[str, Any]]
    anomalies: list[dict[str, Any]]
    recommendations: list[str]


class IPAnalysisResponse(BaseModel):
    """Response model for IP analysis."""

    ip: str
    period_hours: int
    total_events: int
    threat_score: float
    behavior_analysis: dict[str, Any]
    timeline: list[dict[str, Any]]
    recommendations: list[str]


class SecurityConfigResponse(BaseModel):
    """Response model for security configuration."""

    config: dict[str, Any]
    is_development: bool
    is_production: bool
    security_enabled: bool


@router.get("/metrics", response_model=SecurityMetricsResponse)
async def get_security_metrics(hours: int = 24) -> SecurityMetricsResponse:
    """Get comprehensive security metrics."""
    try:
        # Get analytics summary
        analytics_summary = security_analytics.get_analytics_summary(hours)

        # Get rate limiter metrics
        rate_limiter_metrics = adaptive_rate_limiter.get_metrics()

        # Get security error handler metrics
        error_handler_metrics = security_error_handler.get_security_metrics()

        return SecurityMetricsResponse(
            total_events=analytics_summary.get("total_events", 0),
            events_by_type=analytics_summary.get("event_types", {}),
            events_by_threat_level=analytics_summary.get("threat_levels", {}),
            blocked_requests=error_handler_metrics.get("blocked_requests", 0),
            rate_limited_requests=rate_limiter_metrics.get("rate_limited_requests", 0),
            active_clients=rate_limiter_metrics.get("active_clients", 0),
            system_load=rate_limiter_metrics.get("system_load", 0.0),
            threat_detection_success_rate=error_handler_metrics.get(
                "threat_detection_success_rate", 0.0,
            ),
        )
    except Exception as e:
        logger.error(f"Failed to get security metrics: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve security metrics",
        )


@router.get("/threat-analysis", response_model=ThreatAnalysisResponse)
async def get_threat_analysis(hours: int = 24) -> ThreatAnalysisResponse:
    """Get detailed threat analysis."""
    try:
        threat_analysis = security_analytics.get_threat_analysis(hours)

        return ThreatAnalysisResponse(
            period_hours=threat_analysis.get("period_hours", hours),
            threat_level=threat_analysis.get("threat_level", "low"),
            risk_score=threat_analysis.get("risk_score", 0.0),
            threat_patterns=threat_analysis.get("threat_patterns", {}),
            attack_vectors=threat_analysis.get("attack_vectors", []),
            anomalies=threat_analysis.get("anomalies", []),
            recommendations=threat_analysis.get("recommendations", []),
        )
    except Exception as e:
        logger.error(f"Failed to get threat analysis: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve threat analysis",
        )


@router.get("/ip-analysis/{ip}", response_model=IPAnalysisResponse)
async def get_ip_analysis(ip: str, hours: int = 24) -> IPAnalysisResponse:
    """Get detailed analysis for a specific IP address."""
    try:
        ip_analysis = security_analytics.get_ip_analysis(ip, hours)

        return IPAnalysisResponse(
            ip=ip_analysis.get("ip", ip),
            period_hours=ip_analysis.get("period_hours", hours),
            total_events=ip_analysis.get("total_events", 0),
            threat_score=ip_analysis.get("threat_score", 0.0),
            behavior_analysis=ip_analysis.get("behavior_analysis", {}),
            timeline=ip_analysis.get("timeline", []),
            recommendations=ip_analysis.get("recommendations", []),
        )
    except Exception as e:
        logger.error(f"Failed to get IP analysis for {ip}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve IP analysis")


@router.get("/config", response_model=SecurityConfigResponse)
async def get_security_config() -> SecurityConfigResponse:
    """Get current security configuration."""
    try:
        config = get_security_config()

        return SecurityConfigResponse(
            config=config.dict(),
            is_development=config.is_development(),
            is_production=config.is_production(),
            security_enabled=config.enabled,
        )
    except Exception as e:
        logger.error(f"Failed to get security configuration: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve security configuration",
        )


@router.post("/config")
async def update_security_config(updates: dict[str, Any]) -> dict[str, Any]:
    """Update security configuration."""
    try:
        from .security_config import security_config_manager

        updated_config = security_config_manager.update_config(updates)

        return {
            "message": "Security configuration updated successfully",
            "config": updated_config.dict(),
        }
    except Exception as e:
        logger.error(f"Failed to update security configuration: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to update security configuration",
        )


@router.post("/block-ip/{ip}")
async def block_ip(ip: str, reason: str = "Manual block") -> dict[str, Any]:
    """Block an IP address."""
    try:
        security_error_handler.block_ip(ip, reason)

        return {
            "message": f"IP {ip} blocked successfully",
            "ip": ip,
            "reason": reason,
        }
    except Exception as e:
        logger.error(f"Failed to block IP {ip}: {e}")
        raise HTTPException(status_code=500, detail="Failed to block IP address")


@router.post("/whitelist-ip/{ip}")
async def whitelist_ip(ip: str, reason: str = "Manual whitelist") -> dict[str, Any]:
    """Whitelist an IP address."""
    try:
        security_error_handler.whitelist_ip(ip, reason)

        return {
            "message": f"IP {ip} whitelisted successfully",
            "ip": ip,
            "reason": reason,
        }
    except Exception as e:
        logger.error(f"Failed to whitelist IP {ip}: {e}")
        raise HTTPException(status_code=500, detail="Failed to whitelist IP address")


@router.delete("/reset-client/{client_id}")
async def reset_client_profile(client_id: str) -> dict[str, Any]:
    """Reset a client's behavior profile."""
    try:
        adaptive_rate_limiter.reset_client_profile(client_id)

        return {
            "message": f"Client profile {client_id} reset successfully",
            "client_id": client_id,
        }
    except Exception as e:
        logger.error(f"Failed to reset client profile {client_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset client profile")


@router.get("/export-events")
async def export_security_events(
    hours: int = 24, format: str = "json",
) -> dict[str, Any]:
    """Export security events in the specified format."""
    try:
        if format not in ["json", "csv"]:
            raise HTTPException(
                status_code=400, detail="Format must be 'json' or 'csv'",
            )

        exported_data = security_analytics.export_events(hours, format)

        return {
            "message": "Security events exported successfully",
            "format": format,
            "period_hours": hours,
            "data": exported_data,
        }
    except Exception as e:
        logger.error(f"Failed to export security events: {e}")
        raise HTTPException(status_code=500, detail="Failed to export security events")


@router.post("/cleanup")
async def cleanup_old_events() -> dict[str, Any]:
    """Clean up old security events and analytics data."""
    try:
        cleaned_count = security_analytics.cleanup_old_events()

        return {
            "message": "Security events cleaned up successfully",
            "events_cleaned": cleaned_count,
        }
    except Exception as e:
        logger.error(f"Failed to cleanup security events: {e}")
        raise HTTPException(status_code=500, detail="Failed to cleanup security events")


@router.get("/health")
async def security_health_check() -> dict[str, Any]:
    """Health check for security system."""
    try:
        config = get_security_config()

        # Check if security components are working
        health_status = {
            "security_enabled": config.enabled,
            "threat_detection_enabled": config.threat_detection_enabled,
            "rate_limiting_enabled": config.rate_limiting_enabled,
            "adaptive_rate_limiting": config.adaptive_rate_limiting,
            "security_headers_enabled": config.security_headers_enabled,
            "monitoring_enabled": config.monitoring_enabled,
            "status": "healthy" if config.enabled else "disabled",
        }

        return health_status
    except Exception as e:
        logger.error(f"Security health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
        }


@router.get("/dashboard")
async def get_security_dashboard(hours: int = 24) -> dict[str, Any]:
    """Get comprehensive security dashboard data."""
    try:
        # Get all security data
        metrics = await get_security_metrics(hours)
        threat_analysis = await get_threat_analysis(hours)
        config = await get_security_config()
        health = await security_health_check()

        return {
            "metrics": metrics.dict(),
            "threat_analysis": threat_analysis.dict(),
            "config": config.dict(),
            "health": health,
            "timestamp": security_analytics.performance_metrics.get("last_cleanup", 0),
        }
    except Exception as e:
        logger.error(f"Failed to get security dashboard: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve security dashboard",
        )


def get_security_router() -> APIRouter:
    """Get the security dashboard router."""
    return router
