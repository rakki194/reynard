"""Configuration classes for middleware components."""

from typing import Any, Dict, List, Optional


class SecurityHeadersConfig:
    """Configuration for security headers middleware."""

    def __init__(
        self,
        csp_enabled: bool = True,
        hsts_enabled: bool = True,
        hsts_max_age: int = 31536000,
        hsts_include_subdomains: bool = True,
        csp_policy: Optional[str] = None,
        **kwargs,
    ):
        """Initialize security headers configuration.

        Args:
            csp_enabled: Whether to enable Content Security Policy
            hsts_enabled: Whether to enable HTTP Strict Transport Security
            hsts_max_age: HSTS max age in seconds
            hsts_include_subdomains: Whether to include subdomains in HSTS
            csp_policy: Custom CSP policy
            **kwargs: Additional configuration parameters
        """
        self.csp_enabled = csp_enabled
        self.hsts_enabled = hsts_enabled
        self.hsts_max_age = hsts_max_age
        self.hsts_include_subdomains = hsts_include_subdomains
        self.csp_policy = csp_policy or "default-src 'self'"

        # Add missing attributes that middleware expects
        self.x_content_type_options = kwargs.get('x_content_type_options', True)
        self.x_frame_options = kwargs.get('x_frame_options', 'DENY')
        self.x_xss_protection = kwargs.get('x_xss_protection', True)
        self.referrer_policy = kwargs.get(
            'referrer_policy', 'strict-origin-when-cross-origin'
        )
        self.permissions_policy = kwargs.get(
            'permissions_policy', 'geolocation=(), microphone=(), camera=()'
        )
        self.strict_transport_security = kwargs.get('strict_transport_security', True)
        self.content_security_policy = kwargs.get(
            'content_security_policy', "default-src 'self'"
        )

        # Store additional kwargs
        for key, value in kwargs.items():
            setattr(self, key, value)


class InputValidationConfig:
    """Configuration for input validation middleware."""

    def __init__(
        self,
        enabled: bool = True,
        validate_query_params: bool = True,
        validate_request_body: bool = True,
        validate_headers: bool = True,
        sql_injection_detection: bool = True,
        xss_detection: bool = True,
        path_traversal_detection: bool = True,
        command_injection_detection: bool = True,
        **kwargs,
    ):
        """Initialize input validation configuration.

        Args:
            enabled: Whether input validation is enabled
            validate_query_params: Whether to validate query parameters
            validate_request_body: Whether to validate request body
            validate_headers: Whether to validate headers
            sql_injection_detection: Whether to detect SQL injection attempts
            xss_detection: Whether to detect XSS attempts
            path_traversal_detection: Whether to detect path traversal attempts
            command_injection_detection: Whether to detect command injection attempts
            **kwargs: Additional configuration parameters
        """
        self.enabled = enabled
        self.validate_query_params = validate_query_params
        self.validate_request_body = validate_request_body
        self.validate_headers = validate_headers
        self.sql_injection_detection = sql_injection_detection
        self.xss_detection = xss_detection
        self.path_traversal_detection = path_traversal_detection
        self.command_injection_detection = command_injection_detection

        # Add missing attributes that middleware expects
        self.skip_paths = kwargs.get(
            'skip_paths', ['/health', '/docs', '/openapi.json']
        )
        self.max_request_size = kwargs.get('max_request_size', 10 * 1024 * 1024)  # 10MB
        self.allowed_content_types = kwargs.get(
            'allowed_content_types',
            [
                'application/json',
                'application/x-www-form-urlencoded',
                'multipart/form-data',
            ],
        )

        # Store additional kwargs
        for key, value in kwargs.items():
            setattr(self, key, value)


class RateLimitingConfig:
    """Configuration for rate limiting middleware."""

    def __init__(
        self,
        enabled: bool = True,
        default_limit: int = 100,
        window_seconds: int = 60,
        auth_limit: int = 10,
        bypass_enabled: bool = True,
        **kwargs,
    ):
        """Initialize rate limiting configuration.

        Args:
            enabled: Whether rate limiting is enabled
            default_limit: Default rate limit per window
            window_seconds: Time window in seconds
            auth_limit: Rate limit for authenticated requests
            bypass_enabled: Whether bypass functionality is enabled
            **kwargs: Additional configuration parameters
        """
        self.enabled = enabled
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        self.auth_limit = auth_limit
        self.bypass_enabled = bypass_enabled

        # Store additional kwargs
        for key, value in kwargs.items():
            setattr(self, key, value)


class DevelopmentBypassConfig:
    """Configuration for development bypass middleware."""

    def __init__(
        self,
        enabled: bool = True,
        bypass_rate_limiting: bool = True,
        bypass_security_headers: bool = False,
        bypass_input_validation: bool = False,
        log_bypass_events: bool = True,
        **kwargs,
    ):
        """Initialize development bypass configuration.

        Args:
            enabled: Whether development bypass is enabled
            bypass_rate_limiting: Whether to bypass rate limiting
            bypass_security_headers: Whether to bypass security headers
            bypass_input_validation: Whether to bypass input validation
            log_bypass_events: Whether to log bypass events
            **kwargs: Additional configuration parameters
        """
        self.enabled = enabled
        self.bypass_rate_limiting = bypass_rate_limiting
        self.bypass_security_headers = bypass_security_headers
        self.bypass_input_validation = bypass_input_validation
        self.log_bypass_events = log_bypass_events

        # Add missing attributes that middleware expects
        self.environment = kwargs.get('environment', 'development')
        self.bypass_paths = kwargs.get(
            'bypass_paths', ['/health', '/docs', '/openapi.json']
        )
        self.bypass_ips = kwargs.get('bypass_ips', ['127.0.0.1', '::1'])
        self.localhost_patterns = kwargs.get(
            'localhost_patterns', ['127.0.0.1', '::1', 'localhost']
        )
        self.development_mode = kwargs.get('development_mode', True)
        self.bypass_headers = kwargs.get('bypass_headers', ['X-Development-Bypass'])

        # Store additional kwargs
        for key, value in kwargs.items():
            setattr(self, key, value)
