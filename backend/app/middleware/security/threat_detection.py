"""Threat detection middleware for security monitoring and analysis.

This module provides threat detection capabilities including suspicious
activity monitoring, attack pattern detection, and security analytics.
"""

import logging
from collections.abc import Awaitable, Callable
from typing import Any, Dict, List, Optional

from fastapi import Request, Response

from ..core.base import BaseMiddleware

logger = logging.getLogger(__name__)


class ThreatDetectionMiddleware(BaseMiddleware):
    """Threat detection middleware for security monitoring.
    
    Provides comprehensive threat detection including suspicious activity
    monitoring, attack pattern detection, and security analytics.
    """
    
    def __init__(
        self,
        app: Callable,
        name: str = "threat_detection",
        **kwargs
    ):
        """Initialize the threat detection middleware.
        
        Args:
            app: The ASGI application
            name: Middleware name
            **kwargs: Additional configuration
        """
        super().__init__(app, name, **kwargs)
        self.logger = logging.getLogger(f"middleware.{name}")
        
        # Threat detection configuration
        self.enabled = kwargs.get('enabled', True)
        self.suspicious_patterns = kwargs.get('suspicious_patterns', [])
        self.rate_limit_threshold = kwargs.get('rate_limit_threshold', 100)
        self.block_suspicious_requests = kwargs.get('block_suspicious_requests', False)
        
        # Initialize threat tracking
        self.threat_counts: Dict[str, int] = {}
        self.suspicious_ips: Dict[str, List[str]] = {}
    
    async def process_request(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process the request with threat detection.
        
        Args:
            request: The incoming HTTP request
            call_next: The next middleware/handler in the chain
            
        Returns:
            Response: The HTTP response
        """
        if not self.enabled:
            return await call_next(request)
        
        # Analyze the request for threats
        threat_level = self._analyze_request(request)
        
        # Log threat if detected
        if threat_level > 0:
            self._log_threat(request, threat_level)
        
        # Block request if configured and threat level is high
        if self.block_suspicious_requests and threat_level > 2:
            return self._create_threat_response(request, threat_level)
        
        # Continue with the request
        response = await call_next(request)
        
        # Add threat detection headers
        self._add_threat_headers(request, response, threat_level)
        
        return response
    
    def _analyze_request(self, request: Request) -> int:
        """Analyze the request for potential threats.
        
        Args:
            request: The HTTP request
            
        Returns:
            Threat level (0-5, where 5 is highest threat)
        """
        threat_level = 0
        
        # Check for suspicious patterns in URL
        if self._check_suspicious_url_patterns(request):
            threat_level += 2
        
        # Check for suspicious headers
        if self._check_suspicious_headers(request):
            threat_level += 1
        
        # Check for suspicious user agent
        if self._check_suspicious_user_agent(request):
            threat_level += 1
        
        # Check for rate limiting violations
        if self._check_rate_limit_violations(request):
            threat_level += 2
        
        # Check for known attack patterns
        if self._check_attack_patterns(request):
            threat_level += 3
        
        return min(threat_level, 5)  # Cap at 5
    
    def _check_suspicious_url_patterns(self, request: Request) -> bool:
        """Check for suspicious URL patterns.
        
        Args:
            request: The HTTP request
            
        Returns:
            True if suspicious patterns found
        """
        path = request.url.path.lower()
        
        suspicious_patterns = [
            'admin', 'administrator', 'root', 'config', 'setup',
            'install', 'backup', 'test', 'debug', 'phpmyadmin',
            'wp-admin', 'wp-login', 'xmlrpc', 'api/v1/admin',
            '..', '...', '....', '.....',  # Path traversal attempts
        ]
        
        return any(pattern in path for pattern in suspicious_patterns)
    
    def _check_suspicious_headers(self, request: Request) -> bool:
        """Check for suspicious headers.
        
        Args:
            request: The HTTP request
            
        Returns:
            True if suspicious headers found
        """
        suspicious_headers = [
            'x-forwarded-for', 'x-real-ip', 'x-originating-ip',
            'x-remote-ip', 'x-remote-addr', 'x-cluster-client-ip',
        ]
        
        for header in suspicious_headers:
            if header in request.headers:
                value = request.headers[header]
                # Check for multiple IPs (potential proxy abuse)
                if ',' in value or ';' in value:
                    return True
        
        return False
    
    def _check_suspicious_user_agent(self, request: Request) -> bool:
        """Check for suspicious user agents.
        
        Args:
            request: The HTTP request
            
        Returns:
            True if suspicious user agent found
        """
        user_agent = request.headers.get('user-agent', '').lower()
        
        suspicious_agents = [
            'sqlmap', 'nikto', 'nmap', 'masscan', 'zap',
            'burp', 'w3af', 'acunetix', 'nessus', 'openvas',
            'scanner', 'bot', 'crawler', 'spider', 'harvester',
        ]
        
        return any(agent in user_agent for agent in suspicious_agents)
    
    def _check_rate_limit_violations(self, request: Request) -> bool:
        """Check for rate limit violations.
        
        Args:
            request: The HTTP request
            
        Returns:
            True if rate limit violations detected
        """
        client_ip = self._get_client_ip(request)
        
        # Simple rate limiting check (in practice, use proper rate limiting)
        if client_ip in self.threat_counts:
            self.threat_counts[client_ip] += 1
            if self.threat_counts[client_ip] > self.rate_limit_threshold:
                return True
        else:
            self.threat_counts[client_ip] = 1
        
        return False
    
    def _check_attack_patterns(self, request: Request) -> bool:
        """Check for known attack patterns.
        
        Args:
            request: The HTTP request
            
        Returns:
            True if attack patterns detected
        """
        # Check URL for attack patterns
        url = str(request.url).lower()
        
        attack_patterns = [
            'union select', 'drop table', 'delete from', 'insert into',
            'update set', 'exec(', 'eval(', 'system(', 'shell_exec(',
            '<script', 'javascript:', 'onload=', 'onerror=',
            '../../../', '..\\..\\', '%2e%2e%2f', '%2e%2e%5c',
        ]
        
        return any(pattern in url for pattern in attack_patterns)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get the client IP address.
        
        Args:
            request: The HTTP request
            
        Returns:
            Client IP address
        """
        # Check for forwarded headers
        forwarded_for = request.headers.get('x-forwarded-for')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        real_ip = request.headers.get('x-real-ip')
        if real_ip:
            return real_ip.strip()
        
        # Fall back to direct client IP
        if hasattr(request, 'client') and request.client:
            return request.client.host
        
        return 'unknown'
    
    def _log_threat(self, request: Request, threat_level: int) -> None:
        """Log a detected threat.
        
        Args:
            request: The HTTP request
            threat_level: The threat level (0-5)
        """
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get('user-agent', 'unknown')
        
        threat_types = {
            1: 'LOW',
            2: 'MEDIUM', 
            3: 'HIGH',
            4: 'CRITICAL',
            5: 'SEVERE'
        }
        
        threat_type = threat_types.get(threat_level, 'UNKNOWN')
        
        self.logger.warning(
            f"🚨 THREAT DETECTED [{threat_type}] - "
            f"Level: {threat_level}, IP: {client_ip}, "
            f"Path: {request.method} {request.url.path}, "
            f"User-Agent: {user_agent}"
        )
        
        # Track suspicious IPs
        if client_ip not in self.suspicious_ips:
            self.suspicious_ips[client_ip] = []
        
        self.suspicious_ips[client_ip].append(f"{request.method} {request.url.path}")
    
    def _create_threat_response(self, request: Request, threat_level: int) -> Response:
        """Create a response for blocked threats.
        
        Args:
            request: The HTTP request
            threat_level: The threat level
            
        Returns:
            Response: Threat blocked response
        """
        return Response(
            status_code=403,
            content=f"Request blocked due to security threat (Level: {threat_level})",
            headers={
                'Content-Type': 'text/plain',
                'X-Threat-Level': str(threat_level),
                'X-Threat-Blocked': 'true',
            }
        )
    
    def _add_threat_headers(self, request: Request, response: Response, threat_level: int) -> None:
        """Add threat detection headers to the response.
        
        Args:
            request: The original HTTP request
            response: The HTTP response to modify
            threat_level: The detected threat level
        """
        if threat_level > 0:
            response.headers['X-Threat-Level'] = str(threat_level)
            response.headers['X-Threat-Detected'] = 'true'
        
        # Add client IP for tracking
        client_ip = self._get_client_ip(request)
        response.headers['X-Client-IP'] = client_ip
    
    def get_threat_stats(self) -> Dict[str, Any]:
        """Get threat detection statistics.
        
        Returns:
            Dictionary with threat statistics
        """
        return {
            'enabled': self.enabled,
            'total_threats_detected': sum(self.threat_counts.values()),
            'unique_suspicious_ips': len(self.suspicious_ips),
            'threat_counts_by_ip': self.threat_counts.copy(),
            'suspicious_ips': self.suspicious_ips.copy(),
            'rate_limit_threshold': self.rate_limit_threshold,
            'block_suspicious_requests': self.block_suspicious_requests,
        }
    
    def reset_threat_stats(self) -> None:
        """Reset threat detection statistics."""
        self.threat_counts.clear()
        self.suspicious_ips.clear()
        self.logger.info("Reset threat detection statistics")


def create_threat_detection_middleware(
    app: Callable,
    enabled: bool = True,
    **kwargs
) -> ThreatDetectionMiddleware:
    """Create a threat detection middleware instance.
    
    Args:
        app: The ASGI application
        enabled: Whether threat detection is enabled
        **kwargs: Additional configuration parameters
        
    Returns:
        Configured threat detection middleware instance
    """
    return ThreatDetectionMiddleware(app, enabled=enabled, **kwargs)