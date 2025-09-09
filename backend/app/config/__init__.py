"""
Configuration module for Reynard Backend.

This module provides centralized configuration management
with environment variable support and secure defaults.
"""

from .settings import get_config

__all__ = ["get_config"]
