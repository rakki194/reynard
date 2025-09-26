"""Tests for middleware configuration classes.

This module provides comprehensive tests for middleware configuration
including validation, environment handling, and configuration management.
"""

import pytest
from pydantic import ValidationError

from app.middleware.core.config import CORSConfig as CoreCORSConfig
from app.middleware.core.config import (
    InputValidationConfig,
    MiddlewareConfig,
    RateLimitingConfig,
    SecurityHeadersConfig,
)


class TestMiddlewareConfig:
    """Test suite for MiddlewareConfig class."""

    def test_middleware_config_defaults(self):
        """Test middleware config with default values."""
        config = MiddlewareConfig()

        assert config.name == "middleware"
        assert config.enabled is True
        assert config.priority == 100
        assert config.environment == "development"
        assert config.debug is False

    def test_middleware_config_custom_values(self):
        """Test middleware config with custom values."""
        config = MiddlewareConfig(
            name="test_middleware",
            enabled=False,
            priority=50,
            environment="production",
            debug=True,
        )

        assert config.name == "test_middleware"
        assert config.enabled is False
        assert config.priority == 50
        assert config.environment == "production"
        assert config.debug is True

    def test_middleware_config_priority_validation(self):
        """Test priority validation."""
        # Valid priority
        config = MiddlewareConfig(priority=500)
        assert config.priority == 500

        # Invalid priority - too low
        with pytest.raises(ValidationError):
            MiddlewareConfig(priority=-1)

        # Invalid priority - too high
        with pytest.raises(ValidationError):
            MiddlewareConfig(priority=1001)

    def test_middleware_config_environment_validation(self):
        """Test environment validation."""
        # Valid environments
        for env in ["development", "staging", "production", "testing"]:
            config = MiddlewareConfig(environment=env)
            assert config.environment == env

        # Invalid environment
        with pytest.raises(ValidationError):
            MiddlewareConfig(environment="invalid")

    def test_middleware_config_serialization(self):
        """Test config serialization."""
        config = MiddlewareConfig(name="test", priority=200, environment="staging")

        # Test dict conversion
        config_dict = config.model_dump()
        assert config_dict["name"] == "test"
        assert config_dict["priority"] == 200
        assert config_dict["environment"] == "staging"

        # Test JSON serialization
        config_json = config.model_dump_json()
        assert "test" in config_json
        assert "200" in config_json
        assert "staging" in config_json


class TestSecurityHeadersConfig:
    """Test suite for SecurityHeadersConfig class."""

    def test_security_config_defaults(self):
        """Test security config with default values."""
        config = SecurityHeadersConfig()

        assert config.enabled is True
        assert config.environment == "development"
        assert config.csp_enabled is True
        assert config.hsts_enabled is True
        assert config.xss_protection is True
        assert config.content_type_nosniff is True
        assert config.frame_options == "DENY"

    def test_security_config_custom_values(self):
        """Test security config with custom values."""
        config = SecurityHeadersConfig(
            enabled=False,
            environment="production",
            csp_enabled=False,
            hsts_enabled=False,
            frame_options="SAMEORIGIN",
        )

        assert config.enabled is False
        assert config.environment == "production"
        assert config.csp_enabled is False
        assert config.hsts_enabled is False
        assert config.frame_options == "SAMEORIGIN"

    def test_security_config_csp_policy(self):
        """Test CSP policy configuration."""
        config = SecurityHeadersConfig(
            csp_policy="default-src 'self'; script-src 'self' 'unsafe-inline'"
        )

        assert (
            config.csp_policy == "default-src 'self'; script-src 'self' 'unsafe-inline'"
        )

    def test_security_config_hsts_max_age(self):
        """Test HSTS max age configuration."""
        config = SecurityHeadersConfig(hsts_max_age=31536000)

        assert config.hsts_max_age == 31536000


class TestRateLimitingConfig:
    """Test suite for RateLimitingConfig class."""

    def test_rate_limiting_config_defaults(self):
        """Test rate limiting config with default values."""
        config = RateLimitingConfig()

        assert config.enabled is True
        assert config.environment == "development"
        assert config.default_limit == 100
        assert config.window_seconds == 60
        assert config.burst_limit == 200
        assert config.adaptive_enabled is False

    def test_rate_limiting_config_custom_values(self):
        """Test rate limiting config with custom values."""
        config = RateLimitingConfig(
            enabled=False,
            environment="production",
            default_limit=50,
            window_seconds=30,
            burst_limit=100,
            adaptive_enabled=True,
        )

        assert config.enabled is False
        assert config.environment == "production"
        assert config.default_limit == 50
        assert config.window_seconds == 30
        assert config.burst_limit == 100
        assert config.adaptive_enabled is True

    def test_rate_limiting_config_limits_validation(self):
        """Test rate limiting config limits validation."""
        # Valid limits
        config = RateLimitingConfig(default_limit=50, burst_limit=100)
        assert config.default_limit == 50
        assert config.burst_limit == 100

        # Invalid default limit
        with pytest.raises(ValidationError):
            RateLimitingConfig(default_limit=-1)

        # Invalid burst limit
        with pytest.raises(ValidationError):
            RateLimitingConfig(burst_limit=0)


class TestInputValidationConfig:
    """Test suite for InputValidationConfig class."""

    def test_input_validation_config_defaults(self):
        """Test input validation config with default values."""
        config = InputValidationConfig()

        assert config.enabled is True
        assert config.environment == "development"
        assert config.validate_query_params is True
        assert config.validate_request_body is True
        assert config.validate_headers is True
        assert config.sql_injection_detection is True
        assert config.xss_detection is True
        assert config.path_traversal_detection is True
        assert config.command_injection_detection is True

    def test_input_validation_config_custom_values(self):
        """Test input validation config with custom values."""
        config = InputValidationConfig(
            enabled=False,
            environment="production",
            validate_query_params=False,
            validate_request_body=False,
            sql_injection_detection=False,
            xss_detection=False,
        )

        assert config.enabled is False
        assert config.environment == "production"
        assert config.validate_query_params is False
        assert config.validate_request_body is False
        assert config.sql_injection_detection is False
        assert config.xss_detection is False

    def test_input_validation_config_skip_paths(self):
        """Test input validation config skip paths."""
        skip_paths = ["/api/docs", "/health", "/test"]
        config = InputValidationConfig(skip_paths=skip_paths)

        assert config.skip_paths == skip_paths

    def test_input_validation_config_field_limits(self):
        """Test input validation config field limits."""
        config = InputValidationConfig(
            username_min_length=3,
            username_max_length=20,
            password_min_length=8,
            password_max_length=128,
            email_max_length=254,
        )

        assert config.username_min_length == 3
        assert config.username_max_length == 20
        assert config.password_min_length == 8
        assert config.password_max_length == 128
        assert config.email_max_length == 254


class TestCoreCORSConfig:
    """Test suite for CoreCORSConfig class."""

    def test_cors_config_defaults(self):
        """Test CORS config with default values."""
        config = CoreCORSConfig()

        assert config.enabled is True
        assert config.environment == "development"
        assert config.allow_credentials is True
        assert config.max_age == 3600
        assert config.wildcard_origins_allowed is False

    def test_cors_config_custom_values(self):
        """Test CORS config with custom values."""
        config = CoreCORSConfig(
            enabled=False,
            environment="production",
            allow_credentials=False,
            max_age=7200,
            wildcard_origins_allowed=True,
        )

        assert config.enabled is False
        assert config.environment == "production"
        assert config.allow_credentials is False
        assert config.max_age == 7200
        assert config.wildcard_origins_allowed is True

    def test_cors_config_origins_validation(self):
        """Test CORS config origins validation."""
        # Valid origins
        valid_origins = [
            "http://localhost:3000",
            "https://example.com",
            "https://app.example.com",
        ]
        config = CoreCORSConfig(allowed_origins=valid_origins)
        assert config.allowed_origins == valid_origins

        # Invalid origin
        with pytest.raises(ValidationError):
            CoreCORSConfig(allowed_origins=["invalid-url"])

    def test_cors_config_methods_validation(self):
        """Test CORS config methods validation."""
        # Valid methods
        valid_methods = ["GET", "POST", "PUT", "DELETE"]
        config = CoreCORSConfig(allowed_methods=valid_methods)
        assert config.allowed_methods == valid_methods

        # Invalid method
        with pytest.raises(ValidationError):
            CoreCORSConfig(allowed_methods=["INVALID"])

    def test_cors_config_max_age_validation(self):
        """Test CORS config max age validation."""
        # Valid max age
        config = CoreCORSConfig(max_age=3600)
        assert config.max_age == 3600

        # Invalid max age - too high
        with pytest.raises(ValidationError):
            CoreCORSConfig(max_age=86401)

        # Invalid max age - negative
        with pytest.raises(ValidationError):
            CoreCORSConfig(max_age=-1)
