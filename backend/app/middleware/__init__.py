"""🦊 Modular Middleware System for Reynard Backend

This module provides a comprehensive, modular middleware system organized by
semantic categories with clear separation of concerns and reusable components.

Architecture:
- CORS: Cross-Origin Resource Sharing configuration and validation
- Security: Security headers, input validation, and threat detection
- Rate Limiting: Adaptive and static rate limiting with bypass support
- Development: Development-specific middleware and testing support
- Core: Base middleware classes and orchestration

Key Features:
- Semantic organization by functional area
- Modular, reusable components
- Configuration-driven behavior
- Comprehensive security integration
- Development and testing support
- Performance monitoring and analytics

Author: Vulpine (Strategic Fox Specialist)
Version: 1.0.0
"""

# Removed core factory and orchestrator - no longer needed
from .cors.config import CORSConfig
from .cors.middleware import CORSMiddleware
from .cors.validator import CORSValidator
from .security.headers import SecurityHeadersMiddleware
from .security.input_validation import InputValidationMiddleware
from .rate_limiting.static import StaticRateLimiter
from .development.bypass import DevelopmentBypassMiddleware
from .factory import (
    setup_middleware,
    setup_reynard_middleware,
    create_custom_middleware_stack,
)

__all__ = [
    # CORS components
    "CORSConfig",
    "CORSMiddleware", 
    "CORSValidator",
    # Security components
    "SecurityHeadersMiddleware",
    "InputValidationMiddleware",
    # Rate limiting components
    "StaticRateLimiter",
    # Development components
    "DevelopmentBypassMiddleware",
    # Main factory
    "setup_middleware",
    "setup_reynard_middleware",
    "create_custom_middleware_stack",
]