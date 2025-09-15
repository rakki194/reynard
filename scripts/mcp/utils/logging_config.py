#!/usr/bin/env python3
"""
Logging Configuration
=====================

Structured logging setup with color-coded status messages.
Follows the 100-line axiom and modular architecture principles.
"""

import logging
import sys
from pathlib import Path


class ColoredFormatter(logging.Formatter):
    """Custom formatter with color-coded status messages."""

    # Color codes
    BLUE = "\033[94m"  # INFO
    GREEN = "\033[92m"  # OK
    RED = "\033[91m"  # FAIL/ERROR
    YELLOW = "\033[93m"  # WARNING
    RESET = "\033[0m"  # Reset

    def format(self, record: logging.LogRecord) -> str:
        # Add color based on log level
        if record.levelno == logging.INFO:
            record.levelname = f"{self.BLUE}[INFO]{self.RESET}"
        elif record.levelno == logging.WARNING:
            record.levelname = f"{self.YELLOW}[WARN]{self.RESET}"
        elif record.levelno == logging.ERROR:
            record.levelname = f"{self.RED}[FAIL]{self.RESET}"
        elif record.levelno == logging.CRITICAL:
            record.levelname = f"{self.RED}[CRITICAL]{self.RESET}"
        else:
            record.levelname = f"{self.GREEN}[OK]{self.RESET}"

        return super().format(record)


def setup_logging(log_file: str = "mcp-agent-namer.log") -> logging.Logger:
    """Setup structured logging with color-coded status messages."""

    # Create logger
    logger = logging.getLogger("reynard-mcp")
    logger.setLevel(logging.INFO)

    # Clear existing handlers
    logger.handlers.clear()

    # Create formatters
    colored_formatter = ColoredFormatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    file_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(colored_formatter)
    logger.addHandler(console_handler)

    # File handler without colors
    log_path = Path(__file__).parent.parent / log_file
    file_handler = logging.FileHandler(log_path)
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)

    return logger
