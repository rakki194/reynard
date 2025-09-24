"""Adaptive Rate Limiting System for Reynard Backend

This module provides intelligent rate limiting that adapts based on threat levels,
client behavior patterns, and system load to provide optimal security and performance.
"""

import logging
import time
from collections import defaultdict, deque
from enum import Enum
from typing import Any

from fastapi import Request
from slowapi.util import get_remote_address

from .security_error_handler import SecurityThreatLevel

logger = logging.getLogger(__name__)


class RateLimitStrategy(Enum):
    """Rate limiting strategies based on threat assessment."""

    PERMISSIVE = "permissive"  # High limits for trusted clients
    STANDARD = "standard"  # Normal limits for regular clients
    RESTRICTIVE = "restrictive"  # Lower limits for suspicious clients
    AGGRESSIVE = "aggressive"  # Very low limits for high-risk clients
    BLOCKED = "blocked"  # No access for blocked clients


class ClientBehaviorProfile:
    """Profile of client behavior for adaptive rate limiting."""

    def __init__(self, client_id: str):
        self.client_id = client_id
        self.request_count = 0
        self.error_count = 0
        self.security_violations = 0
        self.last_request_time = 0
        self.request_times: deque = deque(maxlen=100)  # Last 100 request times
        self.error_times: deque = deque(maxlen=50)  # Last 50 error times
        self.security_violation_times: deque = deque(maxlen=20)  # Last 20 violations
        self.threat_level = SecurityThreatLevel.LOW
        self.trust_score = 100.0  # Start with high trust
        self.rate_limit_strategy = RateLimitStrategy.STANDARD
        self.last_updated = time.time()

    def add_request(self, timestamp: float = None) -> None:
        """Add a request to the profile."""
        if timestamp is None:
            timestamp = time.time()

        self.request_count += 1
        self.last_request_time = timestamp
        self.request_times.append(timestamp)
        self._update_trust_score()

    def add_error(self, timestamp: float = None) -> None:
        """Add an error to the profile."""
        if timestamp is None:
            timestamp = time.time()

        self.error_count += 1
        self.error_times.append(timestamp)
        self._update_trust_score()

    def add_security_violation(
        self, threat_level: SecurityThreatLevel, timestamp: float = None,
    ) -> None:
        """Add a security violation to the profile."""
        if timestamp is None:
            timestamp = time.time()

        self.security_violations += 1
        self.security_violation_times.append(timestamp)

        # Update threat level (escalate if higher)
        if threat_level.value > self.threat_level.value:
            self.threat_level = threat_level

        self._update_trust_score()

    def _update_trust_score(self) -> None:
        """Update the trust score based on behavior patterns."""
        current_time = time.time()

        # Calculate request rate (requests per minute)
        recent_requests = [t for t in self.request_times if current_time - t < 60]
        request_rate = len(recent_requests)

        # Calculate error rate (errors per minute)
        recent_errors = [t for t in self.error_times if current_time - t < 60]
        error_rate = len(recent_errors)

        # Calculate security violation rate (violations per minute)
        recent_violations = [
            t for t in self.security_violation_times if current_time - t < 60
        ]
        violation_rate = len(recent_violations)

        # Base trust score
        trust_score = 100.0

        # Penalize high request rates
        if request_rate > 100:
            trust_score -= (request_rate - 100) * 0.5

        # Penalize error rates
        if error_rate > 10:
            trust_score -= error_rate * 2

        # Penalize security violations heavily
        if violation_rate > 0:
            trust_score -= violation_rate * 20

        # Penalize based on threat level
        threat_penalties = {
            SecurityThreatLevel.LOW: 0,
            SecurityThreatLevel.MEDIUM: 10,
            SecurityThreatLevel.HIGH: 30,
            SecurityThreatLevel.CRITICAL: 60,
        }
        trust_score -= threat_penalties.get(self.threat_level, 0)

        # Ensure trust score is within bounds
        self.trust_score = max(0.0, min(100.0, trust_score))

        # Update rate limit strategy based on trust score
        if self.trust_score >= 80:
            self.rate_limit_strategy = RateLimitStrategy.PERMISSIVE
        elif self.trust_score >= 60:
            self.rate_limit_strategy = RateLimitStrategy.STANDARD
        elif self.trust_score >= 40:
            self.rate_limit_strategy = RateLimitStrategy.RESTRICTIVE
        elif self.trust_score >= 20:
            self.rate_limit_strategy = RateLimitStrategy.AGGRESSIVE
        else:
            self.rate_limit_strategy = RateLimitStrategy.BLOCKED

        self.last_updated = current_time

    def get_rate_limit(self) -> str:
        """Get the appropriate rate limit for this client."""
        rate_limits = {
            RateLimitStrategy.PERMISSIVE: "1000/minute",
            RateLimitStrategy.STANDARD: "100/minute",
            RateLimitStrategy.RESTRICTIVE: "30/minute",
            RateLimitStrategy.AGGRESSIVE: "10/minute",
            RateLimitStrategy.BLOCKED: "1/minute",
        }
        return rate_limits[self.rate_limit_strategy]

    def should_block(self) -> bool:
        """Check if this client should be blocked."""
        return (
            self.rate_limit_strategy == RateLimitStrategy.BLOCKED
            or self.trust_score <= 0
        )


class AdaptiveRateLimiter:
    """Adaptive rate limiter that adjusts limits based on client behavior and threat levels.
    """

    def __init__(self):
        self.client_profiles: dict[str, ClientBehaviorProfile] = {}
        self.rate_limit_strategies = {
            RateLimitStrategy.PERMISSIVE: {
                "requests_per_minute": 1000,
                "burst_limit": 50,
                "window_size": 60,
            },
            RateLimitStrategy.STANDARD: {
                "requests_per_minute": 100,
                "burst_limit": 20,
                "window_size": 60,
            },
            RateLimitStrategy.RESTRICTIVE: {
                "requests_per_minute": 30,
                "burst_limit": 10,
                "window_size": 60,
            },
            RateLimitStrategy.AGGRESSIVE: {
                "requests_per_minute": 10,
                "burst_limit": 3,
                "window_size": 60,
            },
            RateLimitStrategy.BLOCKED: {
                "requests_per_minute": 1,
                "burst_limit": 1,
                "window_size": 60,
            },
        }

        # System load monitoring
        self.system_load_history: deque = deque(maxlen=100)
        self.current_system_load = 0.0

        # Global rate limiting
        self.global_request_count = 0
        self.global_request_times: deque = deque(maxlen=1000)

        # Metrics
        self.metrics = {
            "total_requests": 0,
            "blocked_requests": 0,
            "rate_limited_requests": 0,
            "clients_tracked": 0,
            "strategy_distribution": defaultdict(int),
            "trust_score_distribution": defaultdict(int),
        }

    def get_client_profile(self, client_id: str) -> ClientBehaviorProfile:
        """Get or create a client behavior profile."""
        if client_id not in self.client_profiles:
            self.client_profiles[client_id] = ClientBehaviorProfile(client_id)
            self.metrics["clients_tracked"] += 1

        return self.client_profiles[client_id]

    def should_rate_limit(self, request: Request) -> tuple[bool, str, dict[str, Any]]:
        """Determine if a request should be rate limited.

        Returns:
            Tuple of (should_limit, reason, details)

        """
        client_id = self._get_client_identifier(request)
        profile = self.get_client_profile(client_id)

        # Update system load
        self._update_system_load()

        # Check if client should be blocked
        if profile.should_block():
            self.metrics["blocked_requests"] += 1
            return (
                True,
                "Client blocked due to security violations",
                {
                    "client_id": client_id,
                    "trust_score": profile.trust_score,
                    "threat_level": profile.threat_level.value,
                    "strategy": profile.rate_limit_strategy.value,
                },
            )

        # Check global rate limiting
        if self._is_global_rate_limit_exceeded():
            self.metrics["rate_limited_requests"] += 1
            return (
                True,
                "Global rate limit exceeded",
                {
                    "global_request_count": self.global_request_count,
                    "system_load": self.current_system_load,
                },
            )

        # Check client-specific rate limiting
        if self._is_client_rate_limit_exceeded(profile):
            self.metrics["rate_limited_requests"] += 1
            return (
                True,
                "Client rate limit exceeded",
                {
                    "client_id": client_id,
                    "trust_score": profile.trust_score,
                    "strategy": profile.rate_limit_strategy.value,
                    "rate_limit": profile.get_rate_limit(),
                },
            )

        # Update profile with successful request
        profile.add_request()
        self.metrics["total_requests"] += 1
        self._update_global_metrics()

        return False, "", {}

    def record_error(self, request: Request, error_type: str = "general") -> None:
        """Record an error for a client."""
        client_id = self._get_client_identifier(request)
        profile = self.get_client_profile(client_id)
        profile.add_error()

        logger.warning(f"Error recorded for client {client_id}: {error_type}")

    def record_security_violation(
        self, request: Request, threat_level: SecurityThreatLevel, violation_type: str,
    ) -> None:
        """Record a security violation for a client."""
        client_id = self._get_client_identifier(request)
        profile = self.get_client_profile(client_id)
        profile.add_security_violation(threat_level)

        logger.warning(
            f"Security violation recorded for client {client_id}: {violation_type} "
            f"(threat level: {threat_level.value})",
        )

    def get_rate_limit_for_client(self, request: Request) -> str:
        """Get the current rate limit for a client."""
        client_id = self._get_client_identifier(request)
        profile = self.get_client_profile(client_id)
        return profile.get_rate_limit()

    def get_client_trust_score(self, request: Request) -> float:
        """Get the trust score for a client."""
        client_id = self._get_client_identifier(request)
        profile = self.get_client_profile(client_id)
        return profile.trust_score

    def get_metrics(self) -> dict[str, Any]:
        """Get current rate limiting metrics."""
        # Update strategy distribution
        strategy_dist = defaultdict(int)
        trust_score_dist = defaultdict(int)

        for profile in self.client_profiles.values():
            strategy_dist[profile.rate_limit_strategy.value] += 1

            # Categorize trust scores
            if profile.trust_score >= 80:
                trust_score_dist["high"] += 1
            elif profile.trust_score >= 60:
                trust_score_dist["medium"] += 1
            elif profile.trust_score >= 40:
                trust_score_dist["low"] += 1
            else:
                trust_score_dist["very_low"] += 1

        return {
            **self.metrics,
            "strategy_distribution": dict(strategy_dist),
            "trust_score_distribution": dict(trust_score_dist),
            "system_load": self.current_system_load,
            "active_clients": len(self.client_profiles),
        }

    def reset_client_profile(self, client_id: str) -> None:
        """Reset a client's profile (useful for testing or manual intervention)."""
        if client_id in self.client_profiles:
            del self.client_profiles[client_id]
            self.metrics["clients_tracked"] -= 1
            logger.info(f"Client profile reset for {client_id}")

    def cleanup_old_profiles(self, max_age_seconds: int = 3600) -> None:
        """Clean up old client profiles to prevent memory leaks."""
        current_time = time.time()
        profiles_to_remove = []

        for client_id, profile in self.client_profiles.items():
            if current_time - profile.last_updated > max_age_seconds:
                profiles_to_remove.append(client_id)

        for client_id in profiles_to_remove:
            del self.client_profiles[client_id]
            self.metrics["clients_tracked"] -= 1

        if profiles_to_remove:
            logger.info(f"Cleaned up {len(profiles_to_remove)} old client profiles")

    def _get_client_identifier(self, request: Request) -> str:
        """Get a unique identifier for the client."""
        # Try to get real IP from headers (for reverse proxy setups)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = get_remote_address(request)

        # Add user agent hash for additional uniqueness
        user_agent = request.headers.get("User-Agent", "")
        user_agent_hash = str(hash(user_agent))[:8]

        return f"{client_ip}:{user_agent_hash}"

    def _update_system_load(self) -> None:
        """Update system load metrics."""
        current_time = time.time()

        # Simple system load calculation based on request rate
        recent_requests = [
            t for t in self.global_request_times if current_time - t < 60
        ]
        request_rate = len(recent_requests)

        # Normalize to 0-1 scale (assuming 1000 requests/minute is high load)
        self.current_system_load = min(1.0, request_rate / 1000.0)
        self.system_load_history.append(self.current_system_load)

    def _is_global_rate_limit_exceeded(self) -> bool:
        """Check if global rate limit is exceeded."""
        current_time = time.time()

        # Remove old requests
        while (
            self.global_request_times
            and current_time - self.global_request_times[0] > 60
        ):
            self.global_request_times.popleft()

        # Check if we're over the global limit
        # Adjust limit based on system load
        base_limit = 10000  # requests per minute
        load_factor = 1.0 - (
            self.current_system_load * 0.5
        )  # Reduce limit under high load
        adjusted_limit = int(base_limit * load_factor)

        return len(self.global_request_times) >= adjusted_limit

    def _is_client_rate_limit_exceeded(self, profile: ClientBehaviorProfile) -> bool:
        """Check if client-specific rate limit is exceeded."""
        current_time = time.time()
        strategy = self.rate_limit_strategies[profile.rate_limit_strategy]

        # Count recent requests
        recent_requests = [
            t
            for t in profile.request_times
            if current_time - t < strategy["window_size"]
        ]

        # Check burst limit (requests in last 10 seconds)
        burst_requests = [t for t in recent_requests if current_time - t < 10]

        # Check if limits are exceeded
        if len(recent_requests) >= strategy["requests_per_minute"]:
            return True

        if len(burst_requests) >= strategy["burst_limit"]:
            return True

        return False

    def _update_global_metrics(self) -> None:
        """Update global request metrics."""
        current_time = time.time()
        self.global_request_count += 1
        self.global_request_times.append(current_time)


# Global adaptive rate limiter instance
adaptive_rate_limiter = AdaptiveRateLimiter()


def get_adaptive_rate_limiter() -> AdaptiveRateLimiter:
    """Get the global adaptive rate limiter instance."""
    return adaptive_rate_limiter
