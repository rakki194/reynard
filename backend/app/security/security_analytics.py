"""
Security Analytics and Event Logging for Reynard Backend

This module provides comprehensive security event logging, analytics,
and reporting capabilities for monitoring and threat detection.
"""

import json
import logging
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from fastapi import Request

from .security_error_handler import SecurityEventType, SecurityThreatLevel

logger = logging.getLogger(__name__)


class SecurityEventSeverity(Enum):
    """Security event severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SecurityEvent:
    """Represents a security event for logging and analysis."""

    def __init__(
        self,
        event_type: SecurityEventType,
        threat_level: SecurityThreatLevel,
        request: Request,
        details: Dict[str, Any],
        action_taken: str = "logged",
        timestamp: Optional[float] = None,
    ):
        self.event_type = event_type
        self.threat_level = threat_level
        self.timestamp = timestamp or time.time()
        self.client_ip = self._get_client_ip(request)
        self.user_agent = request.headers.get("User-Agent", "Unknown")
        self.path = request.url.path
        self.method = request.method
        self.details = details
        self.action_taken = action_taken
        self.request_id = getattr(request.state, "request_id", None)

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request."""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary for serialization."""
        return {
            "event_type": self.event_type.value,
            "threat_level": self.threat_level.value,
            "timestamp": self.timestamp,
            "client_ip": self.client_ip,
            "user_agent": self.user_agent,
            "path": self.path,
            "method": self.method,
            "details": self.details,
            "action_taken": self.action_taken,
            "request_id": self.request_id,
        }

    def to_json(self) -> str:
        """Convert event to JSON string."""
        return json.dumps(self.to_dict(), default=str)


class SecurityAnalytics:
    """
    Security analytics engine for collecting, analyzing, and reporting security events.
    """

    def __init__(self, max_events: int = 10000, retention_hours: int = 24):
        self.max_events = max_events
        self.retention_hours = retention_hours
        self.events: deque = deque(maxlen=max_events)
        
        # Analytics data structures
        self.event_counts: Dict[str, int] = defaultdict(int)
        self.threat_level_counts: Dict[str, int] = defaultdict(int)
        self.ip_activity: Dict[str, List[float]] = defaultdict(list)
        self.path_activity: Dict[str, List[float]] = defaultdict(list)
        self.user_agent_activity: Dict[str, List[float]] = defaultdict(list)
        
        # Time-based analytics
        self.hourly_stats: Dict[int, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        self.daily_stats: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        
        # Threat detection patterns
        self.threat_patterns: Dict[str, List[float]] = defaultdict(list)
        self.attack_vectors: Dict[str, int] = defaultdict(int)
        
        # Performance metrics
        self.performance_metrics = {
            "events_processed": 0,
            "events_dropped": 0,
            "processing_time": 0.0,
            "last_cleanup": time.time(),
        }

    def log_event(self, event: SecurityEvent) -> None:
        """Log a security event and update analytics."""
        start_time = time.time()
        
        try:
            # Add event to storage
            self.events.append(event)
            
            # Update analytics
            self._update_analytics(event)
            
            # Update performance metrics
            self.performance_metrics["events_processed"] += 1
            self.performance_metrics["processing_time"] += time.time() - start_time
            
            # Log the event
            self._log_event_to_logger(event)
            
        except Exception as e:
            logger.error(f"Failed to log security event: {e}")
            self.performance_metrics["events_dropped"] += 1

    def get_analytics_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get analytics summary for the specified time period."""
        cutoff_time = time.time() - (hours * 3600)
        recent_events = [e for e in self.events if e.timestamp >= cutoff_time]
        
        if not recent_events:
            return {
                "period_hours": hours,
                "total_events": 0,
                "message": "No events in the specified period",
            }
        
        # Calculate statistics
        event_types = defaultdict(int)
        threat_levels = defaultdict(int)
        ips = defaultdict(int)
        paths = defaultdict(int)
        user_agents = defaultdict(int)
        actions = defaultdict(int)
        
        for event in recent_events:
            event_types[event.event_type.value] += 1
            threat_levels[event.threat_level.value] += 1
            ips[event.client_ip] += 1
            paths[event.path] += 1
            user_agents[event.user_agent] += 1
            actions[event.action_taken] += 1
        
        # Calculate trends
        trends = self._calculate_trends(recent_events, hours)
        
        # Calculate threat indicators
        threat_indicators = self._calculate_threat_indicators(recent_events)
        
        return {
            "period_hours": hours,
            "total_events": len(recent_events),
            "event_types": dict(event_types),
            "threat_levels": dict(threat_levels),
            "top_ips": dict(sorted(ips.items(), key=lambda x: x[1], reverse=True)[:10]),
            "top_paths": dict(sorted(paths.items(), key=lambda x: x[1], reverse=True)[:10]),
            "top_user_agents": dict(sorted(user_agents.items(), key=lambda x: x[1], reverse=True)[:5]),
            "actions_taken": dict(actions),
            "trends": trends,
            "threat_indicators": threat_indicators,
            "performance": self.performance_metrics,
        }

    def get_threat_analysis(self, hours: int = 24) -> Dict[str, Any]:
        """Get detailed threat analysis for the specified time period."""
        cutoff_time = time.time() - (hours * 3600)
        recent_events = [e for e in self.events if e.timestamp >= cutoff_time]
        
        if not recent_events:
            return {
                "period_hours": hours,
                "threat_level": "low",
                "message": "No threats detected in the specified period",
            }
        
        # Analyze threat patterns
        threat_patterns = self._analyze_threat_patterns(recent_events)
        
        # Calculate risk score
        risk_score = self._calculate_risk_score(recent_events)
        
        # Identify attack vectors
        attack_vectors = self._identify_attack_vectors(recent_events)
        
        # Detect anomalies
        anomalies = self._detect_anomalies(recent_events)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(recent_events, risk_score)
        
        return {
            "period_hours": hours,
            "threat_level": self._get_overall_threat_level(risk_score),
            "risk_score": risk_score,
            "threat_patterns": threat_patterns,
            "attack_vectors": attack_vectors,
            "anomalies": anomalies,
            "recommendations": recommendations,
            "total_events": len(recent_events),
        }

    def get_ip_analysis(self, ip: str, hours: int = 24) -> Dict[str, Any]:
        """Get detailed analysis for a specific IP address."""
        cutoff_time = time.time() - (hours * 3600)
        ip_events = [
            e for e in self.events 
            if e.client_ip == ip and e.timestamp >= cutoff_time
        ]
        
        if not ip_events:
            return {
                "ip": ip,
                "period_hours": hours,
                "total_events": 0,
                "message": "No events for this IP in the specified period",
            }
        
        # Analyze IP behavior
        behavior_analysis = self._analyze_ip_behavior(ip_events)
        
        # Calculate threat score
        threat_score = self._calculate_ip_threat_score(ip_events)
        
        # Get activity timeline
        timeline = self._get_ip_timeline(ip_events)
        
        return {
            "ip": ip,
            "period_hours": hours,
            "total_events": len(ip_events),
            "threat_score": threat_score,
            "behavior_analysis": behavior_analysis,
            "timeline": timeline,
            "recommendations": self._get_ip_recommendations(ip_events, threat_score),
        }

    def cleanup_old_events(self) -> int:
        """Clean up old events to prevent memory issues."""
        cutoff_time = time.time() - (self.retention_hours * 3600)
        initial_count = len(self.events)
        
        # Remove old events
        while self.events and self.events[0].timestamp < cutoff_time:
            self.events.popleft()
        
        # Clean up analytics data
        self._cleanup_analytics_data(cutoff_time)
        
        cleaned_count = initial_count - len(self.events)
        self.performance_metrics["last_cleanup"] = time.time()
        
        if cleaned_count > 0:
            logger.info(f"Cleaned up {cleaned_count} old security events")
        
        return cleaned_count

    def export_events(self, hours: int = 24, format: str = "json") -> str:
        """Export events in the specified format."""
        cutoff_time = time.time() - (hours * 3600)
        recent_events = [e for e in self.events if e.timestamp >= cutoff_time]
        
        if format == "json":
            return json.dumps([e.to_dict() for e in recent_events], default=str, indent=2)
        elif format == "csv":
            return self._export_to_csv(recent_events)
        else:
            raise ValueError(f"Unsupported export format: {format}")

    def _update_analytics(self, event: SecurityEvent) -> None:
        """Update analytics data structures with new event."""
        # Update counters
        self.event_counts[event.event_type.value] += 1
        self.threat_level_counts[event.threat_level.value] += 1
        
        # Update activity tracking
        self.ip_activity[event.client_ip].append(event.timestamp)
        self.path_activity[event.path].append(event.timestamp)
        self.user_agent_activity[event.user_agent].append(event.timestamp)
        
        # Update time-based stats
        hour = int(event.timestamp // 3600)
        day = datetime.fromtimestamp(event.timestamp).strftime("%Y-%m-%d")
        
        self.hourly_stats[hour][event.event_type.value] += 1
        self.daily_stats[day][event.event_type.value] += 1
        
        # Update threat patterns
        self.threat_patterns[event.event_type.value].append(event.timestamp)
        
        # Update attack vectors
        if "pattern_matched" in event.details:
            self.attack_vectors[event.details["pattern_matched"]] += 1

    def _log_event_to_logger(self, event: SecurityEvent) -> None:
        """Log event to the application logger."""
        log_data = {
            "event_type": event.event_type.value,
            "threat_level": event.threat_level.value,
            "ip": event.client_ip,
            "path": event.path,
            "method": event.method,
            "action": event.action_taken,
        }
        
        # Log with appropriate level based on threat level
        if event.threat_level == SecurityThreatLevel.CRITICAL:
            logger.critical(f"Critical security event: {log_data}")
        elif event.threat_level == SecurityThreatLevel.HIGH:
            logger.error(f"High threat security event: {log_data}")
        elif event.threat_level == SecurityThreatLevel.MEDIUM:
            logger.warning(f"Medium threat security event: {log_data}")
        else:
            logger.info(f"Low threat security event: {log_data}")

    def _calculate_trends(self, events: List[SecurityEvent], hours: int) -> Dict[str, Any]:
        """Calculate trends in security events."""
        if len(events) < 2:
            return {"trend": "insufficient_data"}
        
        # Group events by hour
        hourly_counts = defaultdict(int)
        for event in events:
            hour = int(event.timestamp // 3600)
            hourly_counts[hour] += 1
        
        # Calculate trend
        hours_list = sorted(hourly_counts.keys())
        if len(hours_list) < 2:
            return {"trend": "insufficient_data"}
        
        recent_avg = sum(hourly_counts[h] for h in hours_list[-3:]) / min(3, len(hours_list))
        earlier_avg = sum(hourly_counts[h] for h in hours_list[:-3]) / max(1, len(hours_list) - 3)
        
        if recent_avg > earlier_avg * 1.5:
            trend = "increasing"
        elif recent_avg < earlier_avg * 0.5:
            trend = "decreasing"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "recent_average": recent_avg,
            "earlier_average": earlier_avg,
            "change_percentage": ((recent_avg - earlier_avg) / earlier_avg * 100) if earlier_avg > 0 else 0,
        }

    def _calculate_threat_indicators(self, events: List[SecurityEvent]) -> Dict[str, Any]:
        """Calculate threat indicators from events."""
        indicators = {
            "high_risk_ips": [],
            "suspicious_patterns": [],
            "attack_frequency": 0,
            "diversity_of_attacks": 0,
        }
        
        # Find high-risk IPs
        ip_counts = defaultdict(int)
        for event in events:
            ip_counts[event.client_ip] += 1
        
        indicators["high_risk_ips"] = [
            {"ip": ip, "count": count} 
            for ip, count in sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            if count > 5
        ]
        
        # Calculate attack frequency
        if events:
            time_span = max(e.timestamp for e in events) - min(e.timestamp for e in events)
            indicators["attack_frequency"] = len(events) / max(1, time_span / 3600)  # events per hour
        
        # Calculate diversity of attacks
        event_types = set(e.event_type.value for e in events)
        indicators["diversity_of_attacks"] = len(event_types)
        
        return indicators

    def _analyze_threat_patterns(self, events: List[SecurityEvent]) -> Dict[str, Any]:
        """Analyze threat patterns in events."""
        patterns = {
            "common_attack_types": defaultdict(int),
            "time_patterns": defaultdict(int),
            "geographic_patterns": defaultdict(int),
            "target_patterns": defaultdict(int),
        }
        
        for event in events:
            patterns["common_attack_types"][event.event_type.value] += 1
            
            # Time patterns (hour of day)
            hour = datetime.fromtimestamp(event.timestamp).hour
            patterns["time_patterns"][hour] += 1
            
            # Target patterns (paths)
            patterns["target_patterns"][event.path] += 1
        
        return {
            "common_attack_types": dict(patterns["common_attack_types"]),
            "time_patterns": dict(patterns["time_patterns"]),
            "target_patterns": dict(patterns["target_patterns"]),
        }

    def _calculate_risk_score(self, events: List[SecurityEvent]) -> float:
        """Calculate overall risk score from events."""
        if not events:
            return 0.0
        
        # Weight events by threat level
        threat_weights = {
            SecurityThreatLevel.LOW: 1,
            SecurityThreatLevel.MEDIUM: 3,
            SecurityThreatLevel.HIGH: 7,
            SecurityThreatLevel.CRITICAL: 15,
        }
        
        total_weight = sum(threat_weights.get(e.threat_level, 1) for e in events)
        max_possible_weight = len(events) * 15  # All critical
        
        return (total_weight / max_possible_weight) * 100 if max_possible_weight > 0 else 0

    def _get_overall_threat_level(self, risk_score: float) -> str:
        """Get overall threat level based on risk score."""
        if risk_score >= 80:
            return "critical"
        elif risk_score >= 60:
            return "high"
        elif risk_score >= 40:
            return "medium"
        else:
            return "low"

    def _identify_attack_vectors(self, events: List[SecurityEvent]) -> List[Dict[str, Any]]:
        """Identify attack vectors from events."""
        vectors = []
        
        # Group by IP and event type
        ip_event_types = defaultdict(set)
        for event in events:
            ip_event_types[event.client_ip].add(event.event_type.value)
        
        for ip, event_types in ip_event_types.items():
            if len(event_types) > 1:  # Multiple attack types from same IP
                vectors.append({
                    "ip": ip,
                    "attack_types": list(event_types),
                    "sophistication": "high" if len(event_types) > 3 else "medium",
                })
        
        return vectors

    def _detect_anomalies(self, events: List[SecurityEvent]) -> List[Dict[str, Any]]:
        """Detect anomalies in security events."""
        anomalies = []
        
        # Detect burst attacks
        if len(events) > 10:
            time_span = max(e.timestamp for e in events) - min(e.timestamp for e in events)
            if time_span < 300:  # Less than 5 minutes
                anomalies.append({
                    "type": "burst_attack",
                    "description": f"{len(events)} events in {time_span:.1f} seconds",
                    "severity": "high",
                })
        
        # Detect unusual user agents
        user_agents = [e.user_agent for e in events]
        unique_agents = set(user_agents)
        if len(unique_agents) > len(events) * 0.8:  # High diversity
            anomalies.append({
                "type": "unusual_user_agents",
                "description": f"High diversity of user agents: {len(unique_agents)} unique",
                "severity": "medium",
            })
        
        return anomalies

    def _generate_recommendations(self, events: List[SecurityEvent], risk_score: float) -> List[str]:
        """Generate security recommendations based on events."""
        recommendations = []
        
        if risk_score > 70:
            recommendations.append("Consider implementing additional security measures")
            recommendations.append("Review and update security policies")
        
        if len(events) > 50:
            recommendations.append("Consider implementing stricter rate limiting")
        
        # Check for specific attack types
        event_types = [e.event_type.value for e in events]
        if "sql_injection" in event_types:
            recommendations.append("Review database query patterns and implement parameterized queries")
        
        if "xss_attempt" in event_types:
            recommendations.append("Implement additional input sanitization and output encoding")
        
        if "path_traversal" in event_types:
            recommendations.append("Review file access patterns and implement path validation")
        
        return recommendations

    def _analyze_ip_behavior(self, events: List[SecurityEvent]) -> Dict[str, Any]:
        """Analyze behavior patterns for a specific IP."""
        if not events:
            return {}
        
        behavior = {
            "total_events": len(events),
            "event_types": defaultdict(int),
            "threat_levels": defaultdict(int),
            "paths_targeted": defaultdict(int),
            "time_pattern": defaultdict(int),
            "user_agents": set(),
        }
        
        for event in events:
            behavior["event_types"][event.event_type.value] += 1
            behavior["threat_levels"][event.threat_level.value] += 1
            behavior["paths_targeted"][event.path] += 1
            
            hour = datetime.fromtimestamp(event.timestamp).hour
            behavior["time_pattern"][hour] += 1
            
            behavior["user_agents"].add(event.user_agent)
        
        return {
            "total_events": behavior["total_events"],
            "event_types": dict(behavior["event_types"]),
            "threat_levels": dict(behavior["threat_levels"]),
            "paths_targeted": dict(behavior["paths_targeted"]),
            "time_pattern": dict(behavior["time_pattern"]),
            "user_agent_diversity": len(behavior["user_agents"]),
        }

    def _calculate_ip_threat_score(self, events: List[SecurityEvent]) -> float:
        """Calculate threat score for a specific IP."""
        if not events:
            return 0.0
        
        # Weight by threat level and frequency
        threat_weights = {
            SecurityThreatLevel.LOW: 1,
            SecurityThreatLevel.MEDIUM: 3,
            SecurityThreatLevel.HIGH: 7,
            SecurityThreatLevel.CRITICAL: 15,
        }
        
        total_weight = sum(threat_weights.get(e.threat_level, 1) for e in events)
        frequency_factor = min(len(events) / 10, 2.0)  # Cap at 2x for frequency
        
        return min(100.0, (total_weight * frequency_factor) / len(events) * 10)

    def _get_ip_timeline(self, events: List[SecurityEvent]) -> List[Dict[str, Any]]:
        """Get timeline of events for a specific IP."""
        timeline = []
        
        for event in events:
            timeline.append({
                "timestamp": event.timestamp,
                "datetime": datetime.fromtimestamp(event.timestamp).isoformat(),
                "event_type": event.event_type.value,
                "threat_level": event.threat_level.value,
                "path": event.path,
                "action": event.action_taken,
            })
        
        return sorted(timeline, key=lambda x: x["timestamp"])

    def _get_ip_recommendations(self, events: List[SecurityEvent], threat_score: float) -> List[str]:
        """Get recommendations for a specific IP."""
        recommendations = []
        
        if threat_score > 80:
            recommendations.append("Consider blocking this IP address")
            recommendations.append("Investigate potential coordinated attack")
        elif threat_score > 50:
            recommendations.append("Monitor this IP closely")
            recommendations.append("Consider implementing stricter rate limiting")
        elif threat_score > 20:
            recommendations.append("Continue monitoring this IP")
        
        # Check for specific patterns
        event_types = [e.event_type.value for e in events]
        if len(set(event_types)) > 3:
            recommendations.append("Multiple attack vectors detected - sophisticated attacker")
        
        if len(events) > 20:
            recommendations.append("High frequency of events - potential automated attack")
        
        return recommendations

    def _cleanup_analytics_data(self, cutoff_time: float) -> None:
        """Clean up old analytics data."""
        # Clean up IP activity
        for ip in list(self.ip_activity.keys()):
            self.ip_activity[ip] = [t for t in self.ip_activity[ip] if t >= cutoff_time]
            if not self.ip_activity[ip]:
                del self.ip_activity[ip]
        
        # Clean up path activity
        for path in list(self.path_activity.keys()):
            self.path_activity[path] = [t for t in self.path_activity[path] if t >= cutoff_time]
            if not self.path_activity[path]:
                del self.path_activity[path]
        
        # Clean up user agent activity
        for ua in list(self.user_agent_activity.keys()):
            self.user_agent_activity[ua] = [t for t in self.user_agent_activity[ua] if t >= cutoff_time]
            if not self.user_agent_activity[ua]:
                del self.user_agent_activity[ua]

    def _export_to_csv(self, events: List[SecurityEvent]) -> str:
        """Export events to CSV format."""
        if not events:
            return "timestamp,event_type,threat_level,ip,path,method,action\n"
        
        csv_lines = ["timestamp,event_type,threat_level,ip,path,method,action"]
        
        for event in events:
            csv_lines.append(
                f"{event.timestamp},{event.event_type.value},{event.threat_level.value},"
                f"{event.client_ip},{event.path},{event.method},{event.action_taken}"
            )
        
        return "\n".join(csv_lines)


# Global security analytics instance
security_analytics = SecurityAnalytics()


def get_security_analytics() -> SecurityAnalytics:
    """Get the global security analytics instance."""
    return security_analytics
