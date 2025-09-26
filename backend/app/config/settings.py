"""Configuration settings for Reynard Backend.

This module provides centralized configuration management with
environment variable support and secure defaults.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Configuration class for Reynard Backend."""

    def __init__(self):

        # CORS settings
        self.CORS_ORIGINS = self._get_cors_origins()
        self.CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        self.CORS_HEADERS = [
            "Accept",
            "Accept-Language",
            "Content-Language",
            "Content-Type",
            "Authorization",
            "X-Requested-With",
        ]
        self.CORS_EXPOSE_HEADERS = ["X-Total-Count"]
        self.CORS_MAX_AGE = 3600

        # Security settings
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        self.ALLOWED_HOSTS = ["localhost", "127.0.0.1", "*.yourdomain.com"]

        # Diffusion-Pipe configuration
        self.DIFFUSION_PIPE_PATH = self._validate_diffusion_pipe_path()
        self.DIFFUSION_PIPE_ENABLED = (
            os.getenv("DIFFUSION_PIPE_ENABLED", "true").lower() == "true"
        )
        self.DIFFUSION_PIPE_DEBUG = (
            os.getenv("DIFFUSION_PIPE_DEBUG", "false").lower() == "true"
        )
        self.DIFFUSION_PIPE_TIMEOUT = float(
            os.getenv("DIFFUSION_PIPE_TIMEOUT", "300.0")
        )
        self.DIFFUSION_PIPE_MAX_CONCURRENT_TRAININGS = int(
            os.getenv("DIFFUSION_PIPE_MAX_CONCURRENT_TRAININGS", "2")
        )

        # Training configuration defaults
        self.DIFFUSION_PIPE_DEFAULT_OUTPUT_DIR = os.getenv(
            "DIFFUSION_PIPE_DEFAULT_OUTPUT_DIR",
            "/home/kade/runeset/diffusion-pipe/output",
        )
        self.DIFFUSION_PIPE_DEFAULT_DATASET_DIR = os.getenv(
            "DIFFUSION_PIPE_DEFAULT_DATASET_DIR", "/home/kade/datasets"
        )
        self.DIFFUSION_PIPE_DEFAULT_MODEL_DIR = os.getenv(
            "DIFFUSION_PIPE_DEFAULT_MODEL_DIR", "/home/kade/runeset/wolfy/models"
        )

        # GPU and resource management
        self.DIFFUSION_PIPE_GPU_MEMORY_THRESHOLD = float(
            os.getenv("DIFFUSION_PIPE_GPU_MEMORY_THRESHOLD", "0.8")
        )
        self.DIFFUSION_PIPE_MAX_GPU_MEMORY_GB = int(
            os.getenv("DIFFUSION_PIPE_MAX_GPU_MEMORY_GB", "24")
        )
        self.DIFFUSION_PIPE_ENABLE_GPU_MONITORING = (
            os.getenv("DIFFUSION_PIPE_ENABLE_GPU_MONITORING", "true").lower() == "true"
        )

        # Training process management
        self.DIFFUSION_PIPE_PROCESS_TIMEOUT = int(
            os.getenv("DIFFUSION_PIPE_PROCESS_TIMEOUT", "3600")
        )
        self.DIFFUSION_PIPE_ENABLE_CHECKPOINTING = (
            os.getenv("DIFFUSION_PIPE_ENABLE_CHECKPOINTING", "true").lower() == "true"
        )
        self.DIFFUSION_PIPE_CHECKPOINT_INTERVAL = int(
            os.getenv("DIFFUSION_PIPE_CHECKPOINT_INTERVAL", "100")
        )

        # Monitoring and logging
        self.DIFFUSION_PIPE_ENABLE_WANDB = (
            os.getenv("DIFFUSION_PIPE_ENABLE_WANDB", "true").lower() == "true"
        )
        self.DIFFUSION_PIPE_WANDB_API_KEY = os.getenv(
            "DIFFUSION_PIPE_WANDB_API_KEY", ""
        )
        self.DIFFUSION_PIPE_LOG_LEVEL = os.getenv("DIFFUSION_PIPE_LOG_LEVEL", "INFO")
        self.DIFFUSION_PIPE_ENABLE_METRICS = (
            os.getenv("DIFFUSION_PIPE_ENABLE_METRICS", "true").lower() == "true"
        )

        # Security and validation
        self.DIFFUSION_PIPE_ENABLE_SECURITY_SCANNING = (
            os.getenv("DIFFUSION_PIPE_ENABLE_SECURITY_SCANNING", "true").lower()
            == "true"
        )
        self.DIFFUSION_PIPE_VALIDATE_PATHS = (
            os.getenv("DIFFUSION_PIPE_VALIDATE_PATHS", "true").lower() == "true"
        )
        self.DIFFUSION_PIPE_SANITIZE_INPUTS = (
            os.getenv("DIFFUSION_PIPE_SANITIZE_INPUTS", "true").lower() == "true"
        )

    def _get_cors_origins(self) -> list[str]:
        """Get CORS allowed origins."""
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "http://localhost:3004",
            "http://localhost:3005",
            "http://localhost:3006",
            "http://localhost:3007",
            "http://localhost:3008",
            "http://localhost:3009",
            "http://localhost:3010",
            "http://localhost:3011",
            "http://localhost:3012",
            "http://localhost:3013",
            "http://localhost:3014",
            "http://localhost:3015",
            "http://localhost:5173",
        ]

    def _validate_diffusion_pipe_path(self) -> str:
        """Validate and return the diffusion-pipe installation path."""
        path = os.getenv("DIFFUSION_PIPE_PATH", "/home/kade/runeset/diffusion-pipe")
        path_obj = Path(path)

        # Check if path exists
        if not path_obj.exists():
            raise ValueError(f"Diffusion-Pipe path does not exist: {path}")

        # Check if it's a directory
        if not path_obj.is_dir():
            raise ValueError(f"Diffusion-Pipe path is not a directory: {path}")

        # Check for required files/directories
        required_items = ["train.py", "requirements.txt"]
        for item in required_items:
            item_path = path_obj / item
            if not item_path.exists():
                raise ValueError(f"Required diffusion-pipe file not found: {item_path}")

        return str(path_obj.absolute())


# Global config instance
_config: Config = None


def get_config() -> Config:
    """Get the global configuration instance."""
    global _config
    if _config is None:
        _config = Config()
    return _config
