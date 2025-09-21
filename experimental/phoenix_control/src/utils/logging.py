"""
Logging utilities for PHOENIX Control.

Provides consistent logging configuration and utilities for the
Success-Advisor-8 distillation system.
"""

import logging
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime


def setup_logging(
    log_level: str = "INFO",
    log_file: Optional[str] = None,
    log_format: Optional[str] = None,
) -> logging.Logger:
    """
    Setup logging configuration for PHOENIX Control.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path
        log_format: Optional custom log format

    Returns:
        Configured logger instance
    """
    # Default log format
    if log_format is None:
        log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Create formatter
    formatter = logging.Formatter(log_format)

    # Get root logger
    logger = logging.getLogger("phoenix_control")
    logger.setLevel(getattr(logging, log_level.upper()))

    # Clear existing handlers
    logger.handlers.clear()

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level.upper()))
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler (if specified)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_path)
        file_handler.setLevel(getattr(logging, log_level.upper()))
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Logger instance
    """
    return logging.getLogger(f"phoenix_control.{name}")


class PhoenixLogger:
    """Enhanced logger with Success-Advisor-8 specific formatting."""

    def __init__(self, name: str):
        self.logger = get_logger(name)
        self.agent_name = "Success-Advisor-8"
        self.spirit_emoji = "🦁"

    def info(self, message: str, operation: Optional[str] = None):
        """Log info message with agent context."""
        if operation:
            formatted_message = (
                f"{self.spirit_emoji} {self.agent_name} - {operation}: {message}"
            )
        else:
            formatted_message = f"{self.spirit_emoji} {self.agent_name}: {message}"
        self.logger.info(formatted_message)

    def success(self, message: str, operation: Optional[str] = None):
        """Log success message."""
        if operation:
            formatted_message = f"✅ {self.agent_name} - {operation}: {message}"
        else:
            formatted_message = f"✅ {self.agent_name}: {message}"
        self.logger.info(formatted_message)

    def warning(self, message: str, operation: Optional[str] = None):
        """Log warning message."""
        if operation:
            formatted_message = f"⚠️ {self.agent_name} - {operation}: {message}"
        else:
            formatted_message = f"⚠️ {self.agent_name}: {message}"
        self.logger.warning(formatted_message)

    def error(self, message: str, operation: Optional[str] = None):
        """Log error message."""
        if operation:
            formatted_message = f"❌ {self.agent_name} - {operation}: {message}"
        else:
            formatted_message = f"❌ {self.agent_name}: {message}"
        self.logger.error(formatted_message)

    def debug(self, message: str, operation: Optional[str] = None):
        """Log debug message."""
        if operation:
            formatted_message = f"🔍 {self.agent_name} - {operation}: {message}"
        else:
            formatted_message = f"🔍 {self.agent_name}: {message}"
        self.logger.debug(formatted_message)

    def release(self, message: str, version: Optional[str] = None):
        """Log release-specific message."""
        if version:
            formatted_message = f"🚀 {self.agent_name} - Release {version}: {message}"
        else:
            formatted_message = f"🚀 {self.agent_name} - Release: {message}"
        self.logger.info(formatted_message)

    def quality(self, message: str, check_type: Optional[str] = None):
        """Log quality assurance message."""
        if check_type:
            formatted_message = f"🛡️ {self.agent_name} - {check_type}: {message}"
        else:
            formatted_message = f"🛡️ {self.agent_name} - Quality: {message}"
        self.logger.info(formatted_message)

    def agent_state(self, message: str, operation: Optional[str] = None):
        """Log agent state message."""
        if operation:
            formatted_message = f"💾 {self.agent_name} - {operation}: {message}"
        else:
            formatted_message = f"💾 {self.agent_name} - State: {message}"
        self.logger.info(formatted_message)


def create_operation_logger(operation_name: str) -> PhoenixLogger:
    """
    Create a logger for a specific operation.

    Args:
        operation_name: Name of the operation

    Returns:
        PhoenixLogger instance
    """
    return PhoenixLogger(operation_name)
