"""Security Monitoring and Anomaly Detection Service.

This service provides comprehensive security monitoring, anomaly detection,
and threat analysis for the RBAC system.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import statistics
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple

from ..core.audit_service import AuditEvent, AuditEventType, AuditService
from ..models.rbac import PermissionResult

logger = logging.getLogger(__name__)


class ThreatLevel(str, Enum):
    """Threat level enumeration."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AnomalyType(str, Enum):
    """Anomaly type enumeration."""

    UNUSUAL_ACCESS_PATTERN = "unusual_access_pattern"
    RAPID_PERMISSION_CHANGES = "rapid_permission_changes"
    MULTIPLE_FAILED_LOGINS = "multiple_failed_logins"
    UNUSUAL_IP_LOCATION = "unusual_ip_location"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    DATA_EXFILTRATION = "data_exfiltration"
    SUSPICIOUS_ROLE_DELEGATION = "suspicious_role_delegation"
    UNUSUAL_TIME_ACCESS = "unusual_time_access"
    BULK_OPERATIONS = "bulk_operations"
    CROSS_DOMAIN_ACCESS = "cross_domain_access"


@dataclass
class SecurityMetric:
    """Security metric data structure."""

    name: str
    value: float
    threshold: float
    timestamp: datetime
    user_id: Optional[str] = None
    context: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AnomalyDetection:
    """Anomaly detection result."""

    anomaly_type: AnomalyType
    threat_level: ThreatLevel
    description: str
    confidence: float  # 0.0 to 1.0
    user_id: Optional[str] = None
    username: Optional[str] = None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    context: Dict[str, Any] = field(default_factory=dict)
    recommendations: List[str] = field(default_factory=list)


@dataclass
class SecurityAlert:
    """Security alert data structure."""

    id: str
    alert_type: str
    threat_level: ThreatLevel
    title: str
    description: str
    user_id: Optional[str] = None
    username: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    resolved: bool = False
    context: Dict[str, Any] = field(default_factory=dict)


class SecurityMonitoringService:
    """Service for security monitoring and anomaly detection."""

    def __init__(self, audit_service: AuditService):
        """Initialize the security monitoring service.

        Args:
            audit_service: Audit service instance
        """
        self.audit_service = audit_service
        self.logger = logging.getLogger(f"{__name__}.security_monitoring")

        # Monitoring data structures
        self.user_activity_history: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=1000)
        )
        self.ip_activity_history: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=1000)
        )
        self.permission_denials: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=100)
        )
        self.login_attempts: Dict[str, deque] = defaultdict(lambda: deque(maxlen=50))
        self.role_changes: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))

        # Security metrics
        self.security_metrics: Dict[str, List[SecurityMetric]] = defaultdict(list)
        self.active_alerts: Dict[str, SecurityAlert] = {}

        # Configuration
        self.config = {
            "failed_login_threshold": 5,  # Failed logins before alert
            "failed_login_window_minutes": 15,  # Time window for failed logins
            "unusual_access_threshold": 3,  # Standard deviations for unusual access
            "rapid_role_changes_threshold": 3,  # Role changes in short time
            "bulk_operations_threshold": 10,  # Bulk operations threshold
            "anomaly_confidence_threshold": 0.7,  # Minimum confidence for alerts
            "monitoring_window_hours": 24,  # Monitoring window
        }

        # Start background monitoring tasks
        self._start_monitoring_tasks()

    def _start_monitoring_tasks(self):
        """Start background monitoring tasks."""
        asyncio.create_task(self._monitor_anomalies())
        asyncio.create_task(self._cleanup_old_data())
        asyncio.create_task(self._generate_security_metrics())

    async def log_audit_event(self, event: AuditEvent) -> bool:
        """Log audit event and perform security analysis.

        Args:
            event: Audit event to analyze

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Store event in appropriate history
            if event.user_id:
                self.user_activity_history[event.user_id].append(event)

            if event.ip_address:
                self.ip_activity_history[event.ip_address].append(event)

            # Track specific event types
            if event.event_type == AuditEventType.LOGIN_FAILED:
                self.login_attempts[event.username or "unknown"].append(event)
            elif event.event_type == AuditEventType.PERMISSION_DENIED:
                self.permission_denials[event.user_id or "unknown"].append(event)
            elif event.event_type in [
                AuditEventType.ROLE_ASSIGNED,
                AuditEventType.ROLE_REMOVED,
            ]:
                self.role_changes[event.user_id or "unknown"].append(event)

            # Perform real-time security analysis
            await self._analyze_event_for_threats(event)

            return True

        except Exception as e:
            self.logger.error(f"Failed to log audit event for security analysis: {e}")
            return False

    async def _analyze_event_for_threats(self, event: AuditEvent):
        """Analyze audit event for potential security threats.

        Args:
            event: Audit event to analyze
        """
        try:
            # Check for brute force attempts
            if event.event_type == AuditEventType.LOGIN_FAILED:
                await self._check_brute_force_attempts(event)

            # Check for privilege escalation attempts
            if event.event_type == AuditEventType.PERMISSION_DENIED:
                await self._check_privilege_escalation(event)

            # Check for unusual access patterns
            if event.event_type in [
                AuditEventType.RESOURCE_ACCESS_GRANTED,
                AuditEventType.RESOURCE_ACCESS_DENIED,
            ]:
                await self._check_unusual_access_patterns(event)

            # Check for rapid role changes
            if event.event_type in [
                AuditEventType.ROLE_ASSIGNED,
                AuditEventType.ROLE_REMOVED,
            ]:
                await self._check_rapid_role_changes(event)

            # Check for suspicious delegation
            if event.event_type == AuditEventType.ROLE_DELEGATED:
                await self._check_suspicious_delegation(event)

        except Exception as e:
            self.logger.error(f"Failed to analyze event for threats: {e}")

    async def _check_brute_force_attempts(self, event: AuditEvent):
        """Check for brute force login attempts.

        Args:
            event: Login failed event
        """
        username = event.username or "unknown"
        recent_attempts = self.login_attempts[username]

        # Count failed attempts in the last window
        window_start = datetime.now(timezone.utc) - timedelta(
            minutes=self.config["failed_login_window_minutes"]
        )

        failed_count = sum(
            1
            for attempt in recent_attempts
            if attempt.timestamp >= window_start and not attempt.success
        )

        if failed_count >= self.config["failed_login_threshold"]:
            await self._create_security_alert(
                alert_type="brute_force_attempt",
                threat_level=ThreatLevel.HIGH,
                title=f"Brute Force Attack Detected",
                description=f"User {username} has {failed_count} failed login attempts in {self.config['failed_login_window_minutes']} minutes",
                username=username,
                ip_address=event.ip_address,
                context={
                    "failed_attempts": failed_count,
                    "time_window_minutes": self.config["failed_login_window_minutes"],
                    "last_attempt": event.timestamp.isoformat(),
                },
            )

            # Log security violation
            await self.audit_service.log_security_violation(
                username=username,
                user_id=event.user_id,
                violation_type="brute_force_attempt",
                description=f"Brute force attack detected: {failed_count} failed attempts",
                ip_address=event.ip_address,
                user_agent=event.user_agent,
                context={"failed_attempts": failed_count},
            )

    async def _check_privilege_escalation(self, event: AuditEvent):
        """Check for privilege escalation attempts.

        Args:
            event: Permission denied event
        """
        user_id = event.user_id or "unknown"
        recent_denials = self.permission_denials[user_id]

        # Count permission denials in the last hour
        window_start = datetime.now(timezone.utc) - timedelta(hours=1)

        denial_count = sum(
            1
            for denial in recent_denials
            if denial.timestamp >= window_start and not denial.success
        )

        # Check for escalation patterns
        if denial_count >= 10:  # High number of denials
            await self._create_security_alert(
                alert_type="privilege_escalation_attempt",
                threat_level=ThreatLevel.MEDIUM,
                title="Potential Privilege Escalation Attempt",
                description=f"User {event.username} has {denial_count} permission denials in the last hour",
                username=event.username,
                user_id=event.user_id,
                ip_address=event.ip_address,
                context={
                    "denial_count": denial_count,
                    "time_window_hours": 1,
                    "denied_operations": [
                        d.operation for d in recent_denials if d.operation
                    ],
                },
            )

    async def _check_unusual_access_patterns(self, event: AuditEvent):
        """Check for unusual access patterns.

        Args:
            event: Resource access event
        """
        user_id = event.user_id or "unknown"
        user_history = self.user_activity_history[user_id]

        if len(user_history) < 10:  # Need sufficient history
            return

        # Analyze access patterns
        recent_access = [
            e
            for e in user_history
            if e.timestamp >= datetime.now(timezone.utc) - timedelta(hours=24)
        ]

        if len(recent_access) < 5:
            return

        # Check for unusual time access
        access_hours = [e.timestamp.hour for e in recent_access]
        if self._is_unusual_time_access(access_hours):
            await self._create_security_alert(
                alert_type="unusual_time_access",
                threat_level=ThreatLevel.LOW,
                title="Unusual Time Access Pattern",
                description=f"User {event.username} accessing resources at unusual hours",
                username=event.username,
                user_id=event.user_id,
                context={
                    "access_hours": access_hours,
                    "unusual_hours": [h for h in access_hours if h < 6 or h > 22],
                },
            )

        # Check for bulk operations
        resource_access_counts = defaultdict(int)
        for access in recent_access:
            if access.resource_type:
                resource_access_counts[access.resource_type] += 1

        for resource_type, count in resource_access_counts.items():
            if count >= self.config["bulk_operations_threshold"]:
                await self._create_security_alert(
                    alert_type="bulk_operations",
                    threat_level=ThreatLevel.MEDIUM,
                    title="Bulk Operations Detected",
                    description=f"User {event.username} performed {count} operations on {resource_type} in 24 hours",
                    username=event.username,
                    user_id=event.user_id,
                    context={
                        "resource_type": resource_type,
                        "operation_count": count,
                        "time_window_hours": 24,
                    },
                )

    async def _check_rapid_role_changes(self, event: AuditEvent):
        """Check for rapid role changes.

        Args:
            event: Role change event
        """
        user_id = event.user_id or "unknown"
        recent_changes = self.role_changes[user_id]

        # Count role changes in the last hour
        window_start = datetime.now(timezone.utc) - timedelta(hours=1)

        change_count = sum(
            1 for change in recent_changes if change.timestamp >= window_start
        )

        if change_count >= self.config["rapid_role_changes_threshold"]:
            await self._create_security_alert(
                alert_type="rapid_role_changes",
                threat_level=ThreatLevel.MEDIUM,
                title="Rapid Role Changes Detected",
                description=f"User {event.username} has {change_count} role changes in the last hour",
                username=event.username,
                user_id=event.user_id,
                context={
                    "change_count": change_count,
                    "time_window_hours": 1,
                    "role_changes": [
                        c.role_name for c in recent_changes if c.role_name
                    ],
                },
            )

    async def _check_suspicious_delegation(self, event: AuditEvent):
        """Check for suspicious role delegation.

        Args:
            event: Role delegation event
        """
        # Check for delegation to users with different security levels
        context = event.context or {}
        delegator_role = context.get("delegator_role")
        delegatee_role = context.get("delegatee_role")

        if delegator_role and delegatee_role:
            # Simple check: delegation across security boundaries
            if self._is_cross_security_boundary(delegator_role, delegatee_role):
                await self._create_security_alert(
                    alert_type="suspicious_delegation",
                    threat_level=ThreatLevel.HIGH,
                    title="Suspicious Role Delegation",
                    description=f"Role delegation across security boundaries: {delegator_role} -> {delegatee_role}",
                    username=event.username,
                    user_id=event.user_id,
                    context={
                        "delegator_role": delegator_role,
                        "delegatee_role": delegatee_role,
                        "delegation_context": context,
                    },
                )

    def _is_unusual_time_access(self, access_hours: List[int]) -> bool:
        """Check if access hours are unusual.

        Args:
            access_hours: List of hours when access occurred

        Returns:
            bool: True if unusual time access detected
        """
        # Consider access between 10 PM and 6 AM as unusual
        unusual_hours = [h for h in access_hours if h < 6 or h > 22]
        return (
            len(unusual_hours) > len(access_hours) * 0.3
        )  # More than 30% unusual hours

    def _is_cross_security_boundary(self, role1: str, role2: str) -> bool:
        """Check if roles are across security boundaries.

        Args:
            role1: First role
            role2: Second role

        Returns:
            bool: True if across security boundaries
        """
        # Simple security boundary check based on role names
        admin_roles = {"admin", "system_admin", "super_admin"}
        user_roles = {"user", "guest", "basic_user"}

        return (role1 in admin_roles and role2 in user_roles) or (
            role1 in user_roles and role2 in admin_roles
        )

    async def _create_security_alert(
        self,
        alert_type: str,
        threat_level: ThreatLevel,
        title: str,
        description: str,
        username: Optional[str] = None,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ):
        """Create a security alert.

        Args:
            alert_type: Type of alert
            threat_level: Threat level
            title: Alert title
            description: Alert description
            username: Username
            user_id: User ID
            ip_address: IP address
            context: Additional context
        """
        alert_id = f"{alert_type}_{datetime.now(timezone.utc).timestamp()}"

        alert = SecurityAlert(
            id=alert_id,
            alert_type=alert_type,
            threat_level=threat_level,
            title=title,
            description=description,
            username=username,
            user_id=user_id,
            ip_address=ip_address,
            context=context or {},
        )

        self.active_alerts[alert_id] = alert

        # Log the alert
        self.logger.warning(
            f"Security Alert [{threat_level.value.upper()}]: {title} - {description}"
        )

        # Log to audit service
        await self.audit_service.log_security_violation(
            username=username,
            user_id=user_id,
            violation_type=alert_type,
            description=description,
            ip_address=ip_address,
            context=context or {},
        )

    async def _monitor_anomalies(self):
        """Background task to monitor for anomalies."""
        while True:
            try:
                await self._detect_anomalies()
                await asyncio.sleep(300)  # Check every 5 minutes
            except Exception as e:
                self.logger.error(f"Error in anomaly monitoring: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error

    async def _detect_anomalies(self):
        """Detect anomalies in user behavior."""
        try:
            current_time = datetime.now(timezone.utc)
            window_start = current_time - timedelta(
                hours=self.config["monitoring_window_hours"]
            )

            # Analyze each user's activity
            for user_id, activity_history in self.user_activity_history.items():
                recent_activity = [
                    event
                    for event in activity_history
                    if event.timestamp >= window_start
                ]

                if len(recent_activity) < 5:
                    continue

                # Detect various types of anomalies
                anomalies = []

                # Unusual access pattern
                if await self._detect_unusual_access_pattern(user_id, recent_activity):
                    anomalies.append(
                        AnomalyDetection(
                            anomaly_type=AnomalyType.UNUSUAL_ACCESS_PATTERN,
                            threat_level=ThreatLevel.MEDIUM,
                            description="Unusual access pattern detected",
                            confidence=0.8,
                            user_id=user_id,
                            context={"activity_count": len(recent_activity)},
                        )
                    )

                # Process detected anomalies
                for anomaly in anomalies:
                    if (
                        anomaly.confidence
                        >= self.config["anomaly_confidence_threshold"]
                    ):
                        await self._handle_anomaly(anomaly)

        except Exception as e:
            self.logger.error(f"Error detecting anomalies: {e}")

    async def _detect_unusual_access_pattern(
        self, user_id: str, recent_activity: List[AuditEvent]
    ) -> bool:
        """Detect unusual access patterns for a user.

        Args:
            user_id: User ID
            recent_activity: Recent activity events

        Returns:
            bool: True if unusual pattern detected
        """
        if len(recent_activity) < 10:
            return False

        # Calculate access frequency
        access_times = [event.timestamp for event in recent_activity]
        time_diffs = [
            (access_times[i + 1] - access_times[i]).total_seconds()
            for i in range(len(access_times) - 1)
        ]

        if not time_diffs:
            return False

        # Check for unusually rapid access
        avg_interval = statistics.mean(time_diffs)
        if avg_interval < 60:  # Less than 1 minute average
            return True

        return False

    async def _handle_anomaly(self, anomaly: AnomalyDetection):
        """Handle detected anomaly.

        Args:
            anomaly: Detected anomaly
        """
        # Log anomaly
        await self.audit_service.log_event(
            AuditEvent(
                event_type=AuditEventType.ANOMALY_DETECTED,
                user_id=anomaly.user_id,
                username=anomaly.username,
                success=False,
                context={
                    "anomaly_type": anomaly.anomaly_type.value,
                    "threat_level": anomaly.threat_level.value,
                    "confidence": anomaly.confidence,
                    "description": anomaly.description,
                    **anomaly.context,
                },
            )
        )

        # Create alert if threat level is high enough
        if anomaly.threat_level in [ThreatLevel.HIGH, ThreatLevel.CRITICAL]:
            await self._create_security_alert(
                alert_type=anomaly.anomaly_type.value,
                threat_level=anomaly.threat_level,
                title=f"Anomaly Detected: {anomaly.anomaly_type.value}",
                description=anomaly.description,
                username=anomaly.username,
                user_id=anomaly.user_id,
                context=anomaly.context,
            )

    async def _cleanup_old_data(self):
        """Clean up old monitoring data."""
        while True:
            try:
                current_time = datetime.now(timezone.utc)
                cutoff_time = current_time - timedelta(days=7)  # Keep 7 days of data

                # Clean up user activity history
                for user_id in list(self.user_activity_history.keys()):
                    history = self.user_activity_history[user_id]
                    # Remove old events
                    while history and history[0].timestamp < cutoff_time:
                        history.popleft()

                    # Remove empty histories
                    if not history:
                        del self.user_activity_history[user_id]

                # Clean up IP activity history
                for ip in list(self.ip_activity_history.keys()):
                    history = self.ip_activity_history[ip]
                    while history and history[0].timestamp < cutoff_time:
                        history.popleft()

                    if not history:
                        del self.ip_activity_history[ip]

                # Clean up old alerts
                for alert_id in list(self.active_alerts.keys()):
                    alert = self.active_alerts[alert_id]
                    if alert.timestamp < cutoff_time:
                        del self.active_alerts[alert_id]

                await asyncio.sleep(3600)  # Clean up every hour

            except Exception as e:
                self.logger.error(f"Error in cleanup task: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error

    async def _generate_security_metrics(self):
        """Generate security metrics."""
        while True:
            try:
                current_time = datetime.now(timezone.utc)

                # Generate various security metrics
                await self._calculate_failed_login_metrics()
                await self._calculate_permission_denial_metrics()
                await self._calculate_access_pattern_metrics()

                await asyncio.sleep(1800)  # Generate metrics every 30 minutes

            except Exception as e:
                self.logger.error(f"Error generating security metrics: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error

    async def _calculate_failed_login_metrics(self):
        """Calculate failed login metrics."""
        current_time = datetime.now(timezone.utc)
        window_start = current_time - timedelta(hours=24)

        total_failed_logins = 0
        unique_users_failed = set()

        for username, attempts in self.login_attempts.items():
            recent_failures = [
                attempt
                for attempt in attempts
                if attempt.timestamp >= window_start and not attempt.success
            ]

            if recent_failures:
                total_failed_logins += len(recent_failures)
                unique_users_failed.add(username)

        # Store metrics
        self.security_metrics["failed_logins_24h"].append(
            SecurityMetric(
                name="failed_logins_24h",
                value=total_failed_logins,
                threshold=50,  # Alert if more than 50 failed logins
                timestamp=current_time,
            )
        )

        self.security_metrics["unique_users_failed_24h"].append(
            SecurityMetric(
                name="unique_users_failed_24h",
                value=len(unique_users_failed),
                threshold=10,  # Alert if more than 10 unique users failed
                timestamp=current_time,
            )
        )

    async def _calculate_permission_denial_metrics(self):
        """Calculate permission denial metrics."""
        current_time = datetime.now(timezone.utc)
        window_start = current_time - timedelta(hours=24)

        total_denials = 0
        unique_users_denied = set()

        for user_id, denials in self.permission_denials.items():
            recent_denials = [
                denial
                for denial in denials
                if denial.timestamp >= window_start and not denial.success
            ]

            if recent_denials:
                total_denials += len(recent_denials)
                unique_users_denied.add(user_id)

        # Store metrics
        self.security_metrics["permission_denials_24h"].append(
            SecurityMetric(
                name="permission_denials_24h",
                value=total_denials,
                threshold=100,  # Alert if more than 100 denials
                timestamp=current_time,
            )
        )

    async def _calculate_access_pattern_metrics(self):
        """Calculate access pattern metrics."""
        current_time = datetime.now(timezone.utc)
        window_start = current_time - timedelta(hours=24)

        total_access_attempts = 0
        successful_access = 0

        for user_id, activity in self.user_activity_history.items():
            recent_activity = [
                event
                for event in activity
                if event.timestamp >= window_start
                and event.event_type
                in [
                    AuditEventType.RESOURCE_ACCESS_GRANTED,
                    AuditEventType.RESOURCE_ACCESS_DENIED,
                ]
            ]

            total_access_attempts += len(recent_activity)
            successful_access += sum(1 for event in recent_activity if event.success)

        if total_access_attempts > 0:
            success_rate = successful_access / total_access_attempts

            self.security_metrics["access_success_rate_24h"].append(
                SecurityMetric(
                    name="access_success_rate_24h",
                    value=success_rate,
                    threshold=0.8,  # Alert if success rate below 80%
                    timestamp=current_time,
                )
            )

    async def get_security_dashboard_data(self) -> Dict[str, Any]:
        """Get data for security dashboard.

        Returns:
            Dict containing security dashboard data
        """
        current_time = datetime.now(timezone.utc)

        # Get active alerts by threat level
        alerts_by_level = defaultdict(int)
        for alert in self.active_alerts.values():
            if not alert.resolved:
                alerts_by_level[alert.threat_level.value] += 1

        # Get recent security metrics
        recent_metrics = {}
        for metric_name, metrics in self.security_metrics.items():
            if metrics:
                recent_metric = metrics[-1]  # Most recent
                recent_metrics[metric_name] = {
                    "value": recent_metric.value,
                    "threshold": recent_metric.threshold,
                    "timestamp": recent_metric.timestamp.isoformat(),
                    "exceeds_threshold": recent_metric.value > recent_metric.threshold,
                }

        # Get activity summary
        total_users_active = len(self.user_activity_history)
        total_ips_active = len(self.ip_activity_history)

        return {
            "timestamp": current_time.isoformat(),
            "active_alerts": {
                "total": len(
                    [a for a in self.active_alerts.values() if not a.resolved]
                ),
                "by_threat_level": dict(alerts_by_level),
            },
            "security_metrics": recent_metrics,
            "activity_summary": {
                "active_users": total_users_active,
                "active_ips": total_ips_active,
                "total_events_tracked": sum(
                    len(history) for history in self.user_activity_history.values()
                ),
            },
            "configuration": self.config,
        }

    async def get_user_security_profile(self, user_id: str) -> Dict[str, Any]:
        """Get security profile for a specific user.

        Args:
            user_id: User ID

        Returns:
            Dict containing user security profile
        """
        current_time = datetime.now(timezone.utc)
        window_start = current_time - timedelta(days=7)

        user_activity = self.user_activity_history.get(user_id, deque())
        recent_activity = [
            event for event in user_activity if event.timestamp >= window_start
        ]

        # Calculate user metrics
        total_events = len(recent_activity)
        failed_logins = len(
            [
                event
                for event in recent_activity
                if event.event_type == AuditEventType.LOGIN_FAILED
            ]
        )
        permission_denials = len(
            [
                event
                for event in recent_activity
                if event.event_type == AuditEventType.PERMISSION_DENIED
            ]
        )

        # Get user alerts
        user_alerts = [
            alert
            for alert in self.active_alerts.values()
            if alert.user_id == user_id and not alert.resolved
        ]

        return {
            "user_id": user_id,
            "timestamp": current_time.isoformat(),
            "activity_summary": {
                "total_events_7d": total_events,
                "failed_logins_7d": failed_logins,
                "permission_denials_7d": permission_denials,
            },
            "active_alerts": [
                {
                    "id": alert.id,
                    "type": alert.alert_type,
                    "threat_level": alert.threat_level.value,
                    "title": alert.title,
                    "timestamp": alert.timestamp.isoformat(),
                }
                for alert in user_alerts
            ],
            "risk_score": self._calculate_user_risk_score(user_id, recent_activity),
        }

    def _calculate_user_risk_score(
        self, user_id: str, recent_activity: List[AuditEvent]
    ) -> float:
        """Calculate risk score for a user.

        Args:
            user_id: User ID
            recent_activity: Recent activity events

        Returns:
            float: Risk score between 0.0 and 1.0
        """
        if not recent_activity:
            return 0.0

        risk_factors = []

        # Failed logins
        failed_logins = len(
            [
                event
                for event in recent_activity
                if event.event_type == AuditEventType.LOGIN_FAILED
            ]
        )
        if failed_logins > 0:
            risk_factors.append(min(failed_logins / 10.0, 1.0))  # Cap at 1.0

        # Permission denials
        permission_denials = len(
            [
                event
                for event in recent_activity
                if event.event_type == AuditEventType.PERMISSION_DENIED
            ]
        )
        if permission_denials > 0:
            risk_factors.append(min(permission_denials / 20.0, 1.0))  # Cap at 1.0

        # Unusual access patterns
        if len(recent_activity) > 10:
            access_times = [event.timestamp.hour for event in recent_activity]
            unusual_hours = [h for h in access_times if h < 6 or h > 22]
            if len(unusual_hours) > len(access_times) * 0.3:
                risk_factors.append(0.3)

        # Calculate overall risk score
        if risk_factors:
            return min(sum(risk_factors) / len(risk_factors), 1.0)

        return 0.0
