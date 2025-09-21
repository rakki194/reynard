"""
Logging Configuration for Reynard Backend Services

This module provides centralized logging configuration with structured
logging, context management, and service-specific loggers.
"""

import json
import logging
import logging.config
import os
from datetime import datetime
from typing import Any


class ContextFilter(logging.Filter):
    """Filter to add context data to log records."""

    def __init__(self, context_data):
        super().__init__()
        self.context_data = context_data

    def filter(self, record):
        for key, value in self.context_data.items():
            setattr(record, key, value)
        return True


class StructuredFormatter(logging.Formatter):
    """
    Custom formatter that outputs structured JSON logs.
    """

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as structured JSON."""

        # Base log structure
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        # Add extra fields from record
        for key, value in record.__dict__.items():
            if key not in [
                "name",
                "msg",
                "args",
                "levelname",
                "levelno",
                "pathname",
                "filename",
                "module",
                "lineno",
                "funcName",
                "created",
                "msecs",
                "relativeCreated",
                "thread",
                "threadName",
                "processName",
                "process",
                "getMessage",
                "exc_info",
                "exc_text",
                "stack_info",
            ]:
                log_entry[key] = value

        return json.dumps(log_entry, default=str)


class ServiceContextFilter(logging.Filter):
    """
    Filter that adds service context to log records.
    """

    def __init__(self, service_name: str):
        super().__init__()
        self.service_name = service_name

    def filter(self, record: logging.LogRecord) -> bool:
        """Add service context to log record."""
        record.service_name = self.service_name
        return True


def get_service_logger(service_name: str) -> logging.Logger:
    """
    Get a logger configured for a specific service.

    Args:
        service_name: Name of the service

    Returns:
        logging.Logger: Configured logger for the service
    """
    logger_name = f"reynard.{service_name}"
    logger = logging.getLogger(logger_name)

    # Add service context filter if not already added
    if not any(isinstance(f, ServiceContextFilter) for f in logger.filters):
        logger.addFilter(ServiceContextFilter(service_name))

    return logger


def get_api_logger(api_name: str) -> logging.Logger:
    """
    Get a logger configured for a specific API.

    Args:
        api_name: Name of the API

    Returns:
        logging.Logger: Configured logger for the API
    """
    logger_name = f"reynard.api.{api_name}"
    logger = logging.getLogger(logger_name)

    # Add service context filter if not already added
    if not any(isinstance(f, ServiceContextFilter) for f in logger.filters):
        logger.addFilter(ServiceContextFilter(api_name))

    return logger


def setup_logging(
    log_level: str = "INFO",
    log_format: str = "structured",
    log_file: str | None = None,
    enable_console: bool = True,
) -> None:
    """
    Setup centralized logging configuration.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Log format (structured, simple, detailed)
        log_file: Optional log file path
        enable_console: Whether to enable console logging
    """

    # Convert log level string to logging constant
    getattr(logging, log_level.upper(), logging.INFO)

    # Configure formatters
    formatters = {
        "structured": {
            "()": StructuredFormatter,
        },
        "simple": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "detailed": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(funcName)s:%(lineno)d - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    }

    # Configure handlers
    handlers = {}

    if enable_console:
        handlers["console"] = {
            "class": "logging.StreamHandler",
            "level": log_level,
            "formatter": log_format,
            "stream": "ext://sys.stdout",
        }

    if log_file:
        # Ensure log directory exists
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)

        handlers["file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "level": log_level,
            "formatter": log_format,
            "filename": log_file,
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        }

    # Configure loggers
    loggers = {
        "reynard": {
            "level": log_level,
            "handlers": list(handlers.keys()),
            "propagate": False,
        },
        "reynard.api": {
            "level": log_level,
            "handlers": list(handlers.keys()),
            "propagate": False,
        },
        "reynard.services": {
            "level": log_level,
            "handlers": list(handlers.keys()),
            "propagate": False,
        },
        "reynard.core": {
            "level": log_level,
            "handlers": list(handlers.keys()),
            "propagate": False,
        },
    }

    # Configure root logger
    root_logger = {"level": log_level, "handlers": list(handlers.keys())}

    # Create logging configuration
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": formatters,
        "handlers": handlers,
        "loggers": loggers,
        "root": root_logger,
    }

    # Apply configuration
    logging.config.dictConfig(logging_config)

    # Log configuration setup
    logger = logging.getLogger("reynard.core.logging")
    logger.info(f"Logging configured - Level: {log_level}, Format: {log_format}")


def get_logging_config() -> dict[str, Any]:
    """
    Get current logging configuration.

    Returns:
        Dict containing current logging configuration
    """
    return {
        "level": logging.getLogger().level,
        "handlers": [
            handler.__class__.__name__ for handler in logging.getLogger().handlers
        ],
        "formatters": [
            handler.formatter.__class__.__name__ if handler.formatter else None
            for handler in logging.getLogger().handlers
        ],
    }


def set_log_level(level: str) -> None:
    """
    Set logging level for all Reynard loggers.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    numeric_level = getattr(logging, level.upper(), logging.INFO)

    # Set level for all Reynard loggers
    for logger_name in ["reynard", "reynard.api", "reynard.services", "reynard.core"]:
        logger = logging.getLogger(logger_name)
        logger.setLevel(numeric_level)

    # Set root logger level
    logging.getLogger().setLevel(numeric_level)

    logger = logging.getLogger("reynard.core.logging")
    logger.info(f"Log level changed to {level}")


def add_log_context(context: dict[str, Any]) -> None:
    """
    Add context to all log records.

    Args:
        context: Dictionary of context data to add
    """

    # Add context filter to all Reynard loggers
    context_filter = ContextFilter(context)
    for logger_name in ["reynard", "reynard.api", "reynard.services", "reynard.core"]:
        logger = logging.getLogger(logger_name)
        logger.addFilter(context_filter)


def remove_log_context() -> None:
    """Remove context filters from all loggers."""
    for logger_name in ["reynard", "reynard.api", "reynard.services", "reynard.core"]:
        logger = logging.getLogger(logger_name)
        # Remove all context filters
        logger.filters = [f for f in logger.filters if not isinstance(f, ContextFilter)]


# Initialize logging on module import
def initialize_logging() -> None:
    """Initialize logging with default configuration."""
    log_level = os.getenv("LOG_LEVEL", "INFO")
    log_format = os.getenv("LOG_FORMAT", "structured")
    log_file = os.getenv("LOG_FILE")
    enable_console = os.getenv("LOG_CONSOLE", "true").lower() == "true"

    setup_logging(
        log_level=log_level,
        log_format=log_format,
        log_file=log_file,
        enable_console=enable_console,
    )


# Auto-initialize logging when module is imported
initialize_logging()
