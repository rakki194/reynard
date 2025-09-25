"""Adaptive rate limiting middleware with dynamic limit adjustment.

This module provides adaptive rate limiting functionality that dynamically
adjusts rate limits based on system load, client behavior, and other factors.
"""

import logging
import time
from collections import defaultdict, deque
from collections.abc import Awaitable, Callable
from typing import Dict, Optional, Tuple

from fastapi import Request, Response

from ..core.base import BaseMiddleware
from ..core.config import RateLimitingConfig

logger = logging.getLogger(__name__)


class AdaptiveRateLimiter(BaseMiddleware):
    """Adaptive rate limiting middleware with dynamic limit adjustment.
    
    Provides intelligent rate limiting that adapts to system conditions,
    client behavior patterns, and resource availability.
    """
    
    def __init__(
        self,
        app: Callable,
        name: str = "adaptive_rate_limiter",
        config: Optional[RateLimitingConfig] = None,
        **kwargs
    ):
        """Initialize the adaptive rate limiter.
        
        Args:
            app: The ASGI application
            name: Middleware name
            config: Rate limiting configuration
            **kwargs: Additional configuration
        """
        super().__init__(app, name, **kwargs)
        
        # Set up configuration
        if config is None:
            config = RateLimitingConfig()
        
        self.config = config
        self.logger = logging.getLogger(f"middleware.{name}")
        
        # Adaptive tracking
        self._client_behavior: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        self._system_load_history: deque = deque(maxlen=50)
        self._adaptive_limits: Dict[str, float] = {}
        self._last_adaptation = time.time()
        
        # Adaptation parameters
        self._adaptation_interval = 60  # seconds
        self._min_limit_multiplier = 0.1
        self._max_limit_multiplier = 2.0
        self._load_threshold = 0.8  # 80% system load threshold
    
    async def process_request(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process the request through adaptive rate limiting.
        
        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain
            
        Returns:
            Response: The HTTP response
        """
        # Check if rate limiting is enabled
        if not self.config.enabled or not self.config.adaptive_enabled:
            return await call_next(request)
        
        # Check for bypass conditions
        if self._should_bypass_rate_limit(request):
            return await call_next(request)
        
        # Perform adaptation if needed
        self._adapt_limits_if_needed()
        
        try:
            # Get client identifier and current limit
            client_id = self._get_client_identifier(request)
            current_limit = self._get_adaptive_limit(client_id, request)
            
            # Check if client is within limits
            if not self._check_adaptive_rate_limit(client_id, current_limit):
                self.logger.warning(f"Adaptive rate limit exceeded for client: {client_id}")
                return self._create_rate_limit_response(current_limit)
            
            # Track client behavior
            self._track_client_behavior(client_id, request)
            
            # Continue with the request
            response = await call_next(request)
            
            # Update rate limit tracking
            self._update_adaptive_rate_limit(client_id, current_limit)
            
            # Track system response
            self._track_system_response(response)
            
            return response
            
        except Exception as e:
            self.logger.error(f"Adaptive rate limiting error: {e}")
            # Continue with request if rate limiting fails
            return await call_next(request)
    
    def _should_bypass_rate_limit(self, request: Request) -> bool:
        """Check if rate limiting should be bypassed for this request.
        
        Args:
            request: The HTTP request
            
        Returns:
            True if rate limiting should be bypassed
        """
        # Check for development bypass flag
        if (
            hasattr(request.state, "bypass_rate_limiting")
            and request.state.bypass_rate_limiting
        ):
            return True
        
        # Check for bypass user agents
        if self.config.bypass_enabled:
            user_agent = request.headers.get("User-Agent", "")
            if any(agent in user_agent for agent in self.config.bypass_user_agents):
                return True
        
        # Check for bypass IPs
        if self.config.bypass_enabled:
            client_ip = self._get_client_ip(request)
            if any(ip in client_ip for ip in self.config.bypass_ips):
                return True
        
        return False
    
    def _get_client_identifier(self, request: Request) -> str:
        """Get a unique identifier for the client making the request.
        
        Args:
            request: The HTTP request
            
        Returns:
            Unique client identifier
        """
        # Check for development bypass flag
        if (
            hasattr(request.state, "bypass_rate_limiting")
            and request.state.bypass_rate_limiting
        ):
            return "dev-bypass-fenrir-testing"
        
        # Try to get real IP from headers (for reverse proxy setups)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the chain
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = self._get_client_ip(request)
        
        # Add user agent hash for additional uniqueness
        user_agent = request.headers.get("User-Agent", "")
        user_agent_hash = str(hash(user_agent))[:8]
        
        return f"{client_ip}:{user_agent_hash}"
    
    def _get_client_ip(self, request: Request) -> str:
        """Get the client IP address from the request.
        
        Args:
            request: The HTTP request
            
        Returns:
            Client IP address
        """
        # Check for forwarded headers (in case of reverse proxy)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            # Take the first IP in the chain
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
        
        # Fall back to direct client IP
        if hasattr(request, "client") and request.client:
            return request.client.host
        
        return "unknown"
    
    def _get_adaptive_limit(self, client_id: str, request: Request) -> Tuple[int, int]:
        """Get the adaptive rate limit for a client.
        
        Args:
            client_id: Unique client identifier
            request: The HTTP request
            
        Returns:
            Tuple of (max_requests, window_seconds)
        """
        # Get base limit for this request type
        base_limit = self._get_base_limit_for_request(request)
        max_requests, window_seconds = self._parse_limit_string(base_limit)
        
        # Apply adaptive multiplier
        multiplier = self._adaptive_limits.get(client_id, 1.0)
        adaptive_max_requests = int(max_requests * multiplier)
        
        # Ensure limits are within bounds
        adaptive_max_requests = max(1, min(adaptive_max_requests, int(max_requests * self._max_limit_multiplier)))
        
        return adaptive_max_requests, window_seconds
    
    def _get_base_limit_for_request(self, request: Request) -> str:
        """Get the base rate limit for the request.
        
        Args:
            request: The HTTP request
            
        Returns:
            Rate limit string (e.g., "5/minute")
        """
        path = request.url.path
        
        # Authentication endpoints
        if any(auth_path in path for auth_path in ["/auth/login", "/auth/refresh", "/login"]):
            return self.config.auth_limit
        
        # Registration endpoints
        if any(reg_path in path for reg_path in ["/auth/register", "/register", "/signup"]):
            return self.config.registration_limit
        
        # Password reset endpoints
        if any(reset_path in path for reset_path in ["/auth/reset", "/reset-password", "/forgot-password"]):
            return self.config.password_reset_limit
        
        # Default API limit
        return self.config.api_limit
    
    def _parse_limit_string(self, limit: str) -> Tuple[int, int]:
        """Parse a rate limit string into max requests and window seconds.
        
        Args:
            limit: Rate limit string (e.g., "5/minute")
            
        Returns:
            Tuple of (max_requests, window_seconds)
        """
        try:
            limit_parts = limit.split("/")
            if len(limit_parts) != 2:
                return 100, 60  # Default fallback
            
            max_requests = int(limit_parts[0])
            time_window = limit_parts[1]
            
            # Convert time window to seconds
            if time_window == "minute":
                window_seconds = 60
            elif time_window == "hour":
                window_seconds = 3600
            elif time_window == "day":
                window_seconds = 86400
            else:
                window_seconds = 60  # Default fallback
            
            return max_requests, window_seconds
            
        except Exception as e:
            self.logger.error(f"Error parsing limit string '{limit}': {e}")
            return 100, 60  # Default fallback
    
    def _check_adaptive_rate_limit(self, client_id: str, limit: Tuple[int, int]) -> bool:
        """Check if the client is within the adaptive rate limit.
        
        Args:
            client_id: Unique client identifier
            limit: Tuple of (max_requests, window_seconds)
            
        Returns:
            True if within limits, False otherwise
        """
        max_requests, window_seconds = limit
        current_time = time.time()
        window_start = current_time - window_seconds
        
        # Get request times for this client
        request_times = self._client_behavior[client_id]
        
        # Remove old requests outside the window
        while request_times and request_times[0] < window_start:
            request_times.popleft()
        
        # Check if within limit
        return len(request_times) < max_requests
    
    def _update_adaptive_rate_limit(self, client_id: str, limit: Tuple[int, int]) -> None:
        """Update adaptive rate limit tracking for the client.
        
        Args:
            client_id: Unique client identifier
            limit: Tuple of (max_requests, window_seconds)
        """
        current_time = time.time()
        self._client_behavior[client_id].append(current_time)
    
    def _track_client_behavior(self, client_id: str, request: Request) -> None:
        """Track client behavior patterns.
        
        Args:
            client_id: Unique client identifier
            request: The HTTP request
        """
        # Track request patterns, response times, etc.
        # This data is used for adaptive limit adjustment
        pass
    
    def _track_system_response(self, response: Response) -> None:
        """Track system response characteristics.
        
        Args:
            response: The HTTP response
        """
        # Track response times, status codes, etc.
        # This data is used for system load assessment
        current_time = time.time()
        
        # Simulate system load based on response time
        # In a real implementation, you would measure actual system metrics
        response_time = getattr(response, 'response_time', 0.1)
        system_load = min(1.0, response_time * 10)  # Simplified load calculation
        
        self._system_load_history.append((current_time, system_load))
    
    def _adapt_limits_if_needed(self) -> None:
        """Adapt rate limits based on system conditions and client behavior."""
        current_time = time.time()
        
        # Only adapt every adaptation interval
        if current_time - self._last_adaptation < self._adaptation_interval:
            return
        
        self._last_adaptation = current_time
        
        # Calculate current system load
        system_load = self._calculate_system_load()
        
        # Adapt limits based on system load
        if system_load > self._load_threshold:
            # High load - reduce limits
            self._reduce_limits_globally()
        else:
            # Normal load - adjust limits based on client behavior
            self._adjust_limits_by_behavior()
        
        self.logger.info(f"Adapted rate limits - System load: {system_load:.2f}")
    
    def _calculate_system_load(self) -> float:
        """Calculate current system load.
        
        Returns:
            System load value between 0.0 and 1.0
        """
        if not self._system_load_history:
            return 0.0
        
        # Calculate average load over recent history
        recent_loads = [
            load for timestamp, load in self._system_load_history
            if time.time() - timestamp < 300  # Last 5 minutes
        ]
        
        if not recent_loads:
            return 0.0
        
        return sum(recent_loads) / len(recent_loads)
    
    def _reduce_limits_globally(self) -> None:
        """Reduce rate limits globally due to high system load."""
        # Reduce all adaptive limits
        for client_id in self._adaptive_limits:
            self._adaptive_limits[client_id] *= 0.8
            self._adaptive_limits[client_id] = max(
                self._min_limit_multiplier,
                self._adaptive_limits[client_id]
            )
    
    def _adjust_limits_by_behavior(self) -> None:
        """Adjust rate limits based on individual client behavior."""
        current_time = time.time()
        
        for client_id, request_times in self._client_behavior.items():
            if not request_times:
                continue
            
            # Calculate client's recent request rate
            recent_requests = [
                req_time for req_time in request_times
                if current_time - req_time < 300  # Last 5 minutes
            ]
            
            if len(recent_requests) < 10:  # Not enough data
                continue
            
            # Calculate request rate
            request_rate = len(recent_requests) / 300  # requests per second
            
            # Adjust limit based on behavior
            if request_rate > 0.5:  # High rate - reduce limit
                self._adaptive_limits[client_id] *= 0.9
            elif request_rate < 0.1:  # Low rate - increase limit
                self._adaptive_limits[client_id] *= 1.1
            
            # Ensure limits are within bounds
            self._adaptive_limits[client_id] = max(
                self._min_limit_multiplier,
                min(self._max_limit_multiplier, self._adaptive_limits[client_id])
            )
    
    def _create_rate_limit_response(self, limit: Tuple[int, int]) -> Response:
        """Create a rate limit exceeded response.
        
        Args:
            limit: Tuple of (max_requests, window_seconds)
            
        Returns:
            Response: Rate limit exceeded response
        """
        max_requests, window_seconds = limit
        
        return Response(
            status_code=429,
            content='{"error": "Adaptive rate limit exceeded", "type": "adaptive_rate_limit_error"}',
            headers={
                "Content-Type": "application/json",
                "Retry-After": str(window_seconds),
                "X-RateLimit-Limit": str(max_requests),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(window_seconds),
                "X-RateLimit-Type": "adaptive",
            }
        )
    
    def get_adaptive_info(self, request: Request) -> Dict[str, any]:
        """Get adaptive rate limiting information for a request.
        
        Args:
            request: The HTTP request
            
        Returns:
            Dictionary with adaptive rate limiting information
        """
        client_id = self._get_client_identifier(request)
        current_limit = self._get_adaptive_limit(client_id, request)
        system_load = self._calculate_system_load()
        
        return {
            "client_id": client_id,
            "adaptive_limit": current_limit,
            "adaptive_multiplier": self._adaptive_limits.get(client_id, 1.0),
            "system_load": system_load,
            "bypass_enabled": self.config.bypass_enabled,
            "should_bypass": self._should_bypass_rate_limit(request),
            "adaptation_interval": self._adaptation_interval,
            "last_adaptation": self._last_adaptation,
        }
    
    def force_adaptation(self) -> None:
        """Force immediate adaptation of rate limits."""
        self._adapt_limits_if_needed()
        self.logger.info("Forced adaptive rate limit adaptation")
    
    def reset_client_limits(self, client_id: str) -> bool:
        """Reset adaptive limits for a specific client.
        
        Args:
            client_id: The client identifier
            
        Returns:
            True if client was found and reset
        """
        if client_id in self._adaptive_limits:
            del self._adaptive_limits[client_id]
            self.logger.info(f"Reset adaptive limits for client: {client_id}")
            return True
        return False
    
    def update_adaptive_config(self, **kwargs) -> None:
        """Update adaptive rate limiting configuration.
        
        Args:
            **kwargs: Configuration parameters to update
        """
        for key, value in kwargs.items():
            if hasattr(self.config, key):
                setattr(self.config, key, value)
                self.logger.info(f"Updated adaptive rate limit config: {key} = {value}")
        
        # Update adaptation parameters
        if 'adaptation_interval' in kwargs:
            self._adaptation_interval = kwargs['adaptation_interval']
        if 'min_limit_multiplier' in kwargs:
            self._min_limit_multiplier = kwargs['min_limit_multiplier']
        if 'max_limit_multiplier' in kwargs:
            self._max_limit_multiplier = kwargs['max_limit_multiplier']
        if 'load_threshold' in kwargs:
            self._load_threshold = kwargs['load_threshold']
