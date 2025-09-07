"""
Professional logging configuration for Reynard Basic Backend
Supports both YAML and programmatic configuration with environment variable overrides
"""

import logging
import logging.config
import os
from pathlib import Path
from typing import Any, Dict, Optional


class LoggingConfig:
    """Professional logging configuration with environment variable support"""

    def __init__(self):
        self.log_level = os.getenv("LOG_LEVEL", "INFO").upper()
        self.log_format = os.getenv(
            "LOG_FORMAT", "detailed"
        )  # default, access, detailed, json
        self.log_to_file = os.getenv("LOG_TO_FILE", "true").lower() == "true"
        self.log_file_path = os.getenv("LOG_FILE_PATH", "logs/reynard-backend.log")
        self.log_error_file_path = os.getenv(
            "LOG_ERROR_FILE_PATH", "logs/reynard-errors.log"
        )
        self.log_max_bytes = int(os.getenv("LOG_MAX_BYTES", "10485760"))  # 10MB
        self.log_backup_count = int(os.getenv("LOG_BACKUP_COUNT", "5"))
        self.use_yaml_config = (
            os.getenv("USE_YAML_LOG_CONFIG", "true").lower() == "true"
        )
        self.yaml_config_path = os.getenv("YAML_LOG_CONFIG_PATH", "log_conf.yaml")

        # Ensure log directory exists
        if self.log_to_file:
            log_dir = Path(self.log_file_path).parent
            log_dir.mkdir(exist_ok=True)

    def get_programmatic_config(self) -> Dict[str, Any]:
        """Get programmatic logging configuration with environment variable support"""
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
                "access": {
                    "format": '%(asctime)s - %(name)s - %(levelname)s - %(client_addr)s - "%(request_line)s" %(status_code)s',
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
                "detailed": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(funcName)s() - %(message)s",
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
                "json": {
                    "format": '{"timestamp": "%(asctime)s", "logger": "%(name)s", "level": "%(levelname)s", "message": "%(message)s", "module": "%(module)s", "function": "%(funcName)s", "line": %(lineno)d}',
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
            },
            "handlers": {
                "default": {
                    "formatter": self.log_format,
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stderr",
                    "level": self.log_level,
                },
                "access": {
                    "formatter": "access",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                    "level": self.log_level,
                },
            },
            "loggers": {
                "uvicorn.error": {
                    "level": self.log_level,
                    "handlers": ["default"],
                    "propagate": False,
                },
                "uvicorn.access": {
                    "level": self.log_level,
                    "handlers": ["access"],
                    "propagate": False,
                },
                "main": {
                    "level": self.log_level,
                    "handlers": ["default"],
                    "propagate": False,
                },
                "services": {
                    "level": self.log_level,
                    "handlers": ["default"],
                    "propagate": False,
                },
                "routes": {
                    "level": self.log_level,
                    "handlers": ["default"],
                    "propagate": False,
                },
                "database": {
                    "level": self.log_level,
                    "handlers": ["default"],
                    "propagate": False,
                },
                "sqlalchemy.engine": {
                    "level": "WARNING",
                    "handlers": ["default"],
                    "propagate": False,
                },
                "sqlalchemy.pool": {
                    "level": "WARNING",
                    "handlers": ["default"],
                    "propagate": False,
                },
            },
            "root": {
                "level": self.log_level,
                "handlers": ["default"],
                "propagate": False,
            },
        }

    def setup_logging(self) -> None:
        """Setup logging configuration"""
        try:
            if self.use_yaml_config and Path(self.yaml_config_path).exists():
                # Use YAML configuration
                import yaml

                with open(self.yaml_config_path, "r") as f:
                    config = yaml.safe_load(f)

                # Override log levels with environment variables
                self._override_yaml_config(config)
                logging.config.dictConfig(config)
                print(f"[INFO] Logging configured from YAML: {self.yaml_config_path}")
            else:
                # Use programmatic configuration
                config = self.get_programmatic_config()
                logging.config.dictConfig(config)
                print(
                    f"[INFO] Logging configured programmatically with level: {self.log_level}"
                )

        except Exception as e:
            print(f"[WARNING] Failed to setup logging configuration: {e}")
            print("[INFO] Falling back to basic logging configuration")
            logging.basicConfig(
                level=getattr(logging, self.log_level),
                format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )

    def _override_yaml_config(self, config: Dict[str, Any]) -> None:
        """Override YAML configuration with environment variables"""
        # Override root level
        if "root" in config:
            config["root"]["level"] = self.log_level

        # Override logger levels
        for logger_name in [
            "uvicorn.error",
            "uvicorn.access",
            "main",
            "services",
            "routes",
            "database",
        ]:
            if "loggers" in config and logger_name in config["loggers"]:
                config["loggers"][logger_name]["level"] = self.log_level

        # Override handler levels
        if "handlers" in config:
            for handler_name, handler_config in config["handlers"].items():
                if "level" in handler_config:
                    handler_config["level"] = self.log_level


def setup_logging() -> None:
    """Setup logging for the application"""
    config = LoggingConfig()
    config.setup_logging()


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the given name"""
    return logging.getLogger(name)


# Convenience function for getting the main application logger
def get_app_logger() -> logging.Logger:
    """Get the main application logger"""
    return get_logger("main")


# Convenience function for getting service loggers
def get_service_logger(service_name: str) -> logging.Logger:
    """Get a service-specific logger"""
    return get_logger(f"services.{service_name}")


# Convenience function for getting route loggers
def get_route_logger(route_name: str) -> logging.Logger:
    """Get a route-specific logger"""
    return get_logger(f"routes.{route_name}")


# Convenience function for getting database loggers
def get_database_logger() -> logging.Logger:
    """Get the database logger"""
    return get_logger("database")
