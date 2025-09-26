"""Main Diffusion-Pipe service orchestrator.

This service provides comprehensive orchestration for diffusion-pipe training
with provider registry, health monitoring, and fallback mechanisms following
the established AI service pattern in Reynard.
"""

import asyncio
import logging
import os
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.api.diffusion_pipe.models import (
    CheckpointInfo,
    DiffusionPipeConfig,
    ModelInfo,
    ModelType,
    TrainingMetrics,
    TrainingRequest,
    TrainingStatus,
)
from app.core.service_config_manager import get_service_config_manager

logger = logging.getLogger(__name__)


class DiffusionPipeService:
    """Main orchestrator for diffusion-pipe training with provider registry.

    This service follows the AI service pattern with:
    - Provider registry for model-specific training providers
    - Health monitoring and status tracking
    - Configuration validation and sanitization
    - Async training management with subprocess coordination
    - Comprehensive error handling and recovery
    """

    def __init__(self):
        """Initialize the Diffusion-Pipe service."""
        self.config_manager = get_service_config_manager()
        self.config = self.config_manager.get_service_config("diffusion_pipe")

        # Service state
        self.is_initialized = False
        self.is_healthy = False
        self.start_time = None
        self.active_trainings: Dict[str, TrainingStatus] = {}
        self.training_history: List[TrainingStatus] = []

        # Provider registry
        self.model_providers: Dict[ModelType, Any] = {}
        self.training_manager: Optional[Any] = None
        self.checkpoint_manager: Optional[Any] = None
        self.metrics_collector: Optional[Any] = None

        # Health monitoring
        self.last_health_check = None
        self.health_check_interval = 30.0  # seconds
        self.consecutive_failures = 0
        self.max_consecutive_failures = 3

        logger.info("DiffusionPipeService initialized")

    async def initialize(self) -> bool:
        """Initialize the service and all components."""
        try:
            logger.info("Initializing DiffusionPipeService...")

            # Validate configuration
            if not self._validate_configuration():
                logger.error("Configuration validation failed")
                return False

            # Initialize components
            await self._initialize_components()

            # Register model providers
            await self._register_model_providers()

            # Start health monitoring
            asyncio.create_task(self._health_monitoring_loop())

            self.is_initialized = True
            self.is_healthy = True
            self.start_time = datetime.now()

            logger.info("DiffusionPipeService initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize DiffusionPipeService: {e}")
            self.is_healthy = False
            return False

    async def shutdown(self) -> bool:
        """Shutdown the service gracefully."""
        try:
            logger.info("Shutting down DiffusionPipeService...")

            # Stop all active trainings
            await self._stop_all_trainings()

            # Shutdown components
            await self._shutdown_components()

            self.is_initialized = False
            self.is_healthy = False

            logger.info("DiffusionPipeService shutdown completed")
            return True

        except Exception as e:
            logger.error(f"Error during DiffusionPipeService shutdown: {e}")
            return False

    async def start_training(self, request: TrainingRequest) -> str:
        """Start a new training session."""
        try:
            if not self.is_healthy:
                raise RuntimeError("Service is not healthy")

            if len(self.active_trainings) >= self.config.get(
                "max_concurrent_trainings", 2
            ):
                raise RuntimeError("Maximum concurrent trainings reached")

            # Validate request
            if not self._validate_training_request(request):
                raise ValueError("Invalid training request")

            # Create training status
            training_status = TrainingStatus(
                request_id=request.request_id,
                status=TrainingStatus.PENDING,
                start_time=datetime.now(),
                total_epochs=request.config.epochs,
                metadata={"request": request.dict()},
            )

            # Add to active trainings
            self.active_trainings[request.request_id] = training_status

            # Start training asynchronously
            asyncio.create_task(self._execute_training(request, training_status))

            logger.info(f"Started training {request.request_id}")
            return request.request_id

        except Exception as e:
            logger.error(f"Failed to start training {request.request_id}: {e}")
            raise

    async def stop_training(self, request_id: str) -> bool:
        """Stop an active training session."""
        try:
            if request_id not in self.active_trainings:
                logger.warning(f"Training {request_id} not found in active trainings")
                return False

            training_status = self.active_trainings[request_id]

            # Update status
            training_status.status = TrainingStatus.CANCELLED
            training_status.end_time = datetime.now()

            # Move to history
            self.training_history.append(training_status)
            del self.active_trainings[request_id]

            logger.info(f"Stopped training {request_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to stop training {request_id}: {e}")
            return False

    async def get_training_status(self, request_id: str) -> Optional[TrainingStatus]:
        """Get the status of a training session."""
        # Check active trainings first
        if request_id in self.active_trainings:
            return self.active_trainings[request_id]

        # Check training history
        for training in self.training_history:
            if training.request_id == request_id:
                return training

        return None

    async def list_trainings(
        self, status_filter: Optional[TrainingStatus] = None
    ) -> List[TrainingStatus]:
        """List all training sessions with optional status filter."""
        all_trainings = list(self.active_trainings.values()) + self.training_history

        if status_filter:
            return [t for t in all_trainings if t.status == status_filter]

        return all_trainings

    async def get_available_models(self) -> List[ModelInfo]:
        """Get list of available models."""
        models = []

        for model_type, provider in self.model_providers.items():
            if provider and provider.is_available():
                model_info = await provider.get_model_info()
                models.append(model_info)

        return models

    async def get_health_status(self) -> Dict[str, Any]:
        """Get comprehensive health status."""
        return {
            "is_healthy": self.is_healthy,
            "is_initialized": self.is_initialized,
            "uptime": (
                (datetime.now() - self.start_time).total_seconds()
                if self.start_time
                else 0
            ),
            "active_trainings": len(self.active_trainings),
            "total_trainings": len(self.training_history),
            "last_health_check": self.last_health_check,
            "consecutive_failures": self.consecutive_failures,
            "gpu_available": await self._check_gpu_availability(),
            "gpu_memory_free": await self._get_gpu_memory_free(),
            "system_load": await self._get_system_load(),
        }

    async def get_metrics(
        self, request_id: Optional[str] = None
    ) -> List[TrainingMetrics]:
        """Get training metrics."""
        if self.metrics_collector:
            return await self.metrics_collector.get_metrics(request_id)
        return []

    def _validate_configuration(self) -> bool:
        """Validate service configuration."""
        try:
            # Check required configuration
            required_keys = ["path", "enabled"]
            for key in required_keys:
                if key not in self.config:
                    logger.error(f"Missing required configuration: {key}")
                    return False

            # Validate diffusion-pipe path
            diffusion_pipe_path = Path(self.config["path"])
            if not diffusion_pipe_path.exists():
                logger.error(
                    f"Diffusion-pipe path does not exist: {diffusion_pipe_path}"
                )
                return False

            # Check for required files
            required_files = ["train.py", "requirements.txt"]
            for file_name in required_files:
                file_path = diffusion_pipe_path / file_name
                if not file_path.exists():
                    logger.error(f"Required file not found: {file_path}")
                    return False

            return True

        except Exception as e:
            logger.error(f"Configuration validation error: {e}")
            return False

    async def _initialize_components(self):
        """Initialize service components."""
        try:
            # Initialize training manager
            from .training_manager import TrainingManager

            self.training_manager = TrainingManager(self.config)
            await self.training_manager.initialize()

            # Initialize checkpoint manager
            from .checkpoint_manager import CheckpointManager

            self.checkpoint_manager = CheckpointManager(self.config)
            await self.checkpoint_manager.initialize()

            # Initialize metrics collector
            from .metrics_collector import MetricsCollector

            self.metrics_collector = MetricsCollector(self.config)
            await self.metrics_collector.initialize()

            logger.info("Service components initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize components: {e}")
            raise

    async def _register_model_providers(self):
        """Register model-specific training providers."""
        try:
            # Import and register providers
            from .model_provider import ModelProvider

            # Register all supported model types
            for model_type in ModelType:
                provider = ModelProvider(model_type, self.config)
                await provider.initialize()
                self.model_providers[model_type] = provider

            logger.info(f"Registered {len(self.model_providers)} model providers")

        except Exception as e:
            logger.error(f"Failed to register model providers: {e}")
            raise

    def _validate_training_request(self, request: TrainingRequest) -> bool:
        """Validate training request."""
        try:
            # Check if model type is supported
            model_type = request.config.training_model_config.model_type
            if model_type not in self.model_providers:
                logger.error(f"Unsupported model type: {model_type}")
                return False

            # Check if provider is available
            provider = self.model_providers[model_type]
            if not provider or not provider.is_available():
                logger.error(f"Model provider not available: {model_type}")
                return False

            # Validate paths if enabled
            if self.config.get("validate_paths", True):
                if not self._validate_training_paths(request):
                    return False

            # Security scanning if enabled
            if self.config.get("enable_security_scanning", True):
                if not self._security_scan_request(request):
                    return False

            return True

        except Exception as e:
            logger.error(f"Training request validation error: {e}")
            return False

    def _validate_training_paths(self, request: TrainingRequest) -> bool:
        """Validate training paths."""
        try:
            config = request.config

            # Validate output directory
            output_dir = Path(config.output_dir)
            if not output_dir.parent.exists():
                logger.error(
                    f"Output directory parent does not exist: {output_dir.parent}"
                )
                return False

            # Validate model paths
            model_config = config.training_model_config
            for path_attr in ["diffusers_path", "transformer_path"]:
                path = Path(getattr(model_config, path_attr))
                if not path.exists():
                    logger.error(f"Model path does not exist: {path}")
                    return False

            return True

        except Exception as e:
            logger.error(f"Path validation error: {e}")
            return False

    def _security_scan_request(self, request: TrainingRequest) -> bool:
        """Perform security scanning on training request."""
        try:
            # Check for suspicious patterns in paths
            suspicious_patterns = ["..", "~", "$", "`", ";", "|", "&"]

            config = request.config
            paths_to_check = [
                config.output_dir,
                config.model_config.diffusers_path,
                config.model_config.transformer_path,
            ]

            for path in paths_to_check:
                for pattern in suspicious_patterns:
                    if pattern in path:
                        logger.error(f"Suspicious pattern in path: {pattern} in {path}")
                        return False

            return True

        except Exception as e:
            logger.error(f"Security scan error: {e}")
            return False

    async def _execute_training(
        self, request: TrainingRequest, training_status: TrainingStatus
    ):
        """Execute training asynchronously."""
        try:
            training_status.status = TrainingStatus.RUNNING

            # Get model provider
            model_type = request.config.training_model_config.model_type
            provider = self.model_providers[model_type]

            # Execute training
            result = await provider.execute_training(request, training_status)

            # Update status based on result
            if result["success"]:
                training_status.status = TrainingStatus.COMPLETED
                training_status.progress_percentage = 100.0
                training_status.output_path = result.get("output_path")
            else:
                training_status.status = TrainingStatus.FAILED
                training_status.error_message = result.get("error_message")

            training_status.end_time = datetime.now()

            # Move to history
            self.training_history.append(training_status)
            if request.request_id in self.active_trainings:
                del self.active_trainings[request.request_id]

            logger.info(
                f"Training {request.request_id} completed with status: {training_status.status}"
            )

        except Exception as e:
            logger.error(f"Training execution error for {request.request_id}: {e}")
            training_status.status = TrainingStatus.FAILED
            training_status.error_message = str(e)
            training_status.end_time = datetime.now()

            # Move to history
            self.training_history.append(training_status)
            if request.request_id in self.active_trainings:
                del self.active_trainings[request.request_id]

    async def _stop_all_trainings(self):
        """Stop all active trainings."""
        for request_id in list(self.active_trainings.keys()):
            await self.stop_training(request_id)

    async def _shutdown_components(self):
        """Shutdown all components."""
        if self.training_manager:
            await self.training_manager.shutdown()

        if self.checkpoint_manager:
            await self.checkpoint_manager.shutdown()

        if self.metrics_collector:
            await self.metrics_collector.shutdown()

        for provider in self.model_providers.values():
            if provider:
                await provider.shutdown()

    async def _health_monitoring_loop(self):
        """Health monitoring loop."""
        while self.is_initialized:
            try:
                await self._perform_health_check()
                await asyncio.sleep(self.health_check_interval)
            except Exception as e:
                logger.error(f"Health monitoring error: {e}")
                await asyncio.sleep(self.health_check_interval)

    async def _perform_health_check(self):
        """Perform health check."""
        try:
            # Check if diffusion-pipe is accessible
            diffusion_pipe_path = Path(self.config["path"])
            if not diffusion_pipe_path.exists():
                raise RuntimeError("Diffusion-pipe path not accessible")

            # Check GPU availability
            gpu_available = await self._check_gpu_availability()

            # Update health status
            self.is_healthy = True
            self.consecutive_failures = 0
            self.last_health_check = datetime.now()

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            self.consecutive_failures += 1

            if self.consecutive_failures >= self.max_consecutive_failures:
                self.is_healthy = False
                logger.error("Service marked as unhealthy due to consecutive failures")

    async def _check_gpu_availability(self) -> bool:
        """Check if GPU is available."""
        try:
            result = subprocess.run(
                ["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            return result.returncode == 0
        except Exception:
            return False

    async def _get_gpu_memory_free(self) -> Optional[float]:
        """Get free GPU memory in GB."""
        try:
            result = subprocess.run(
                [
                    "nvidia-smi",
                    "--query-gpu=memory.free",
                    "--format=csv,noheader,nounits",
                ],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                return float(result.stdout.strip()) / 1024  # Convert MB to GB
        except Exception:
            pass
        return None

    async def _get_system_load(self) -> float:
        """Get system load average."""
        try:
            import psutil

            return psutil.getloadavg()[0]
        except Exception:
            return 0.0

    async def get_available_models(self) -> List[ModelInfo]:
        """Get list of available models."""
        models = []
        for model_type in ModelType:
            model_info = ModelInfo(
                model_type=model_type,
                model_id=f"{model_type.value}-default",
                name=f"{model_type.value.title()} Model",
                description=f"Default {model_type.value} model for training",
                is_available=True,
                is_loaded=False,
                capabilities={
                    "lora_training": True,
                    "checkpointing": True,
                    "streaming": True,
                },
                default_config={
                    "epochs": 1000,
                    "micro_batch_size_per_gpu": 4,
                    "learning_rate": 2.5e-4,
                },
            )
            models.append(model_info)
        return models

    async def get_metrics(
        self, request_id: Optional[str] = None
    ) -> List[TrainingMetrics]:
        """Get training metrics."""
        if not self.metrics_collector:
            return []
        return await self.metrics_collector.get_metrics(request_id)


# Global service instance
_diffusion_pipe_service: Optional[DiffusionPipeService] = None


async def get_diffusion_pipe_service() -> DiffusionPipeService:
    """Get the global diffusion-pipe service instance."""
    global _diffusion_pipe_service
    if _diffusion_pipe_service is None:
        _diffusion_pipe_service = DiffusionPipeService()
        await _diffusion_pipe_service.initialize()
    return _diffusion_pipe_service
