"""Performance monitoring and analytics.

This module provides comprehensive metrics collection with real-time
monitoring, performance analytics, and system resource tracking.
"""

import asyncio
import json
import logging
import os
import subprocess
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.api.diffusion_pipe.models import TrainingMetrics, TrainingStatus

logger = logging.getLogger(__name__)


class MetricsCollector:
    """Performance monitoring and analytics collector.

    This collector handles:
    - Real-time performance metrics collection
    - GPU and CPU usage monitoring
    - Training progress and quality metrics
    - System resource tracking and alerts
    - Metrics storage and historical analysis
    """

    def __init__(self, config: Dict[str, Any]):
        """Initialize the metrics collector."""
        self.config = config
        self.metrics_dir = (
            Path(config.get("default_output_dir", "/tmp/diffusion_pipe_output"))
            / "metrics"
        )
        self.metrics_file = self.metrics_dir / "training_metrics.json"
        self.metrics_history: List[TrainingMetrics] = []
        self.is_initialized = False
        self.monitoring_tasks: Dict[str, asyncio.Task] = {}

        # Monitoring configuration
        self.collection_interval = 5.0  # seconds
        self.max_history_size = 1000
        self.gpu_memory_threshold = config.get("gpu_memory_threshold", 0.8)

        logger.info("MetricsCollector initialized")

    async def initialize(self) -> bool:
        """Initialize the metrics collector."""
        try:
            # Create metrics directory
            self.metrics_dir.mkdir(parents=True, exist_ok=True)

            # Load existing metrics history
            await self._load_metrics_history()

            # Start system monitoring
            asyncio.create_task(self._system_monitoring_loop())

            self.is_initialized = True
            logger.info("MetricsCollector initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize MetricsCollector: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the metrics collector."""
        try:
            # Stop all monitoring tasks
            for task in self.monitoring_tasks.values():
                task.cancel()

            # Save metrics history
            await self._save_metrics_history()

            self.is_initialized = False
            logger.info("MetricsCollector shutdown completed")
            return True

        except Exception as e:
            logger.error(f"Error during MetricsCollector shutdown: {e}")
            return False

    async def start_monitoring(self, request_id: str, training_status: TrainingStatus):
        """Start monitoring a training session."""
        try:
            if not self.is_initialized:
                raise RuntimeError("MetricsCollector not initialized")

            # Create monitoring task
            task = asyncio.create_task(
                self._monitor_training_session(request_id, training_status)
            )

            self.monitoring_tasks[request_id] = task

            logger.info(f"Started monitoring for training {request_id}")

        except Exception as e:
            logger.error(f"Failed to start monitoring for {request_id}: {e}")

    async def stop_monitoring(self, request_id: str):
        """Stop monitoring a training session."""
        try:
            if request_id in self.monitoring_tasks:
                task = self.monitoring_tasks[request_id]
                task.cancel()
                del self.monitoring_tasks[request_id]

                logger.info(f"Stopped monitoring for training {request_id}")

        except Exception as e:
            logger.error(f"Failed to stop monitoring for {request_id}: {e}")

    async def get_metrics(
        self, request_id: Optional[str] = None
    ) -> List[TrainingMetrics]:
        """Get training metrics with optional filtering."""
        try:
            if request_id:
                return [m for m in self.metrics_history if m.request_id == request_id]
            return self.metrics_history.copy()

        except Exception as e:
            logger.error(f"Failed to get metrics: {e}")
            return []

    async def get_metrics_summary(
        self, request_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get metrics summary with statistics."""
        try:
            metrics = await self.get_metrics(request_id)

            if not metrics:
                return {"error": "No metrics available"}

            # Calculate summary statistics
            losses = [m.current_loss for m in metrics if m.current_loss is not None]
            throughputs = [
                m.steps_per_second for m in metrics if m.steps_per_second is not None
            ]
            gpu_utilizations = [
                m.gpu_utilization for m in metrics if m.gpu_utilization is not None
            ]
            gpu_memories = [
                m.gpu_memory_usage for m in metrics if m.gpu_memory_usage is not None
            ]

            summary = {
                "total_metrics": len(metrics),
                "time_range": {
                    "start": min(m.timestamp for m in metrics).isoformat(),
                    "end": max(m.timestamp for m in metrics).isoformat(),
                },
                "loss": {
                    "current": losses[-1] if losses else None,
                    "average": sum(losses) / len(losses) if losses else None,
                    "min": min(losses) if losses else None,
                    "max": max(losses) if losses else None,
                },
                "throughput": {
                    "current": throughputs[-1] if throughputs else None,
                    "average": (
                        sum(throughputs) / len(throughputs) if throughputs else None
                    ),
                    "max": max(throughputs) if throughputs else None,
                },
                "gpu_utilization": {
                    "current": gpu_utilizations[-1] if gpu_utilizations else None,
                    "average": (
                        sum(gpu_utilizations) / len(gpu_utilizations)
                        if gpu_utilizations
                        else None
                    ),
                    "max": max(gpu_utilizations) if gpu_utilizations else None,
                },
                "gpu_memory": {
                    "current": gpu_memories[-1] if gpu_memories else None,
                    "average": (
                        sum(gpu_memories) / len(gpu_memories) if gpu_memories else None
                    ),
                    "max": max(gpu_memories) if gpu_memories else None,
                },
            }

            return summary

        except Exception as e:
            logger.error(f"Failed to get metrics summary: {e}")
            return {"error": str(e)}

    async def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system metrics."""
        try:
            return {
                "gpu_available": await self._check_gpu_availability(),
                "gpu_memory_free": await self._get_gpu_memory_free(),
                "gpu_memory_used": await self._get_gpu_memory_used(),
                "gpu_utilization": await self._get_gpu_utilization(),
                "gpu_temperature": await self._get_gpu_temperature(),
                "cpu_utilization": await self._get_cpu_utilization(),
                "memory_usage": await self._get_memory_usage(),
                "disk_usage": await self._get_disk_usage(),
                "system_load": await self._get_system_load(),
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Failed to get system metrics: {e}")
            return {"error": str(e)}

    async def _monitor_training_session(
        self, request_id: str, training_status: TrainingStatus
    ):
        """Monitor a training session and collect metrics."""
        try:
            while request_id in self.monitoring_tasks:
                # Collect training metrics
                metrics = await self._collect_training_metrics(
                    request_id, training_status
                )

                if metrics:
                    # Store metrics
                    self.metrics_history.append(metrics)

                    # Maintain history size
                    if len(self.metrics_history) > self.max_history_size:
                        self.metrics_history = self.metrics_history[
                            -self.max_history_size :
                        ]

                    # Check for alerts
                    await self._check_metrics_alerts(metrics)

                # Wait for next collection
                await asyncio.sleep(self.collection_interval)

        except asyncio.CancelledError:
            logger.info(f"Monitoring cancelled for training {request_id}")
        except Exception as e:
            logger.error(f"Error monitoring training {request_id}: {e}")

    async def _system_monitoring_loop(self):
        """System monitoring loop."""
        try:
            while self.is_initialized:
                # Collect system metrics
                system_metrics = await self.get_system_metrics()

                # Log system status
                if (
                    system_metrics.get("gpu_memory_used", 0)
                    > self.gpu_memory_threshold * 24
                ):  # 24GB threshold
                    logger.warning(
                        f"High GPU memory usage: {system_metrics.get('gpu_memory_used', 0):.1f}GB"
                    )

                # Wait for next check
                await asyncio.sleep(30.0)  # Check every 30 seconds

        except asyncio.CancelledError:
            logger.info("System monitoring cancelled")
        except Exception as e:
            logger.error(f"System monitoring error: {e}")

    async def _collect_training_metrics(
        self, request_id: str, training_status: TrainingStatus
    ) -> Optional[TrainingMetrics]:
        """Collect training metrics."""
        try:
            # Get system metrics
            system_metrics = await self.get_system_metrics()

            # Calculate progress percentage
            progress_percentage = 0.0
            if training_status.total_epochs > 0:
                progress_percentage = (
                    training_status.current_epoch / training_status.total_epochs
                ) * 100.0

            # Calculate throughput
            steps_per_second = 0.0
            if training_status.current_step > 0 and training_status.start_time:
                runtime = (datetime.now() - training_status.start_time).total_seconds()
                if runtime > 0:
                    steps_per_second = training_status.current_step / runtime

            # Create metrics
            metrics = TrainingMetrics(
                request_id=request_id,
                timestamp=datetime.now(),
                current_loss=training_status.loss or 0.0,
                average_loss=training_status.loss or 0.0,  # Simplified
                loss_trend="stable",  # Would need historical data to calculate
                steps_per_second=steps_per_second,
                samples_per_second=steps_per_second
                * (training_status.metadata.get("batch_size", 1)),
                gpu_utilization=system_metrics.get("gpu_utilization", 0.0),
                gpu_memory_usage=system_metrics.get("gpu_memory_used", 0.0),
                cpu_utilization=system_metrics.get("cpu_utilization", 0.0),
                memory_usage=system_metrics.get("memory_usage", 0.0),
                progress_percentage=progress_percentage,
                estimated_time_remaining=None,  # Would need more complex calculation
                learning_rate=training_status.learning_rate or 0.0,
                gradient_norm=None,  # Would need to be extracted from training logs
                weight_norm=None,  # Would need to be extracted from training logs
                temperature_gpu=system_metrics.get("gpu_temperature"),
                power_usage=None,  # Would need additional monitoring
                metadata={
                    "epoch": training_status.current_epoch,
                    "step": training_status.current_step,
                    "status": training_status.status.value,
                },
            )

            return metrics

        except Exception as e:
            logger.error(f"Failed to collect training metrics: {e}")
            return None

    async def _check_metrics_alerts(self, metrics: TrainingMetrics):
        """Check for metrics alerts and warnings."""
        try:
            # Check GPU memory usage
            if (
                metrics.gpu_memory_usage > self.gpu_memory_threshold * 24
            ):  # 24GB threshold
                logger.warning(
                    f"High GPU memory usage for {metrics.request_id}: {metrics.gpu_memory_usage:.1f}GB"
                )

            # Check GPU temperature
            if metrics.temperature_gpu and metrics.temperature_gpu > 80:
                logger.warning(
                    f"High GPU temperature for {metrics.request_id}: {metrics.temperature_gpu}°C"
                )

            # Check loss trends
            if metrics.loss_trend == "increasing":
                logger.warning(
                    f"Loss increasing for {metrics.request_id}: {metrics.current_loss}"
                )

            # Check throughput
            if metrics.steps_per_second < 0.1:
                logger.warning(
                    f"Low throughput for {metrics.request_id}: {metrics.steps_per_second:.3f} steps/sec"
                )

        except Exception as e:
            logger.error(f"Error checking metrics alerts: {e}")

    async def _load_metrics_history(self):
        """Load metrics history from file."""
        try:
            if not self.metrics_file.exists():
                logger.info("No metrics history file found, starting fresh")
                return

            with open(self.metrics_file, "r") as f:
                data = json.load(f)

            # Load metrics
            for metric_data in data.get("metrics", []):
                # Convert timestamp string back to datetime
                if "timestamp" in metric_data and isinstance(
                    metric_data["timestamp"], str
                ):
                    metric_data["timestamp"] = datetime.fromisoformat(
                        metric_data["timestamp"]
                    )

                metrics = TrainingMetrics(**metric_data)
                self.metrics_history.append(metrics)

            logger.info(f"Loaded {len(self.metrics_history)} metrics history entries")

        except Exception as e:
            logger.error(f"Failed to load metrics history: {e}")

    async def _save_metrics_history(self):
        """Save metrics history to file."""
        try:
            # Keep only recent metrics to avoid large files
            recent_metrics = self.metrics_history[-100:]  # Keep last 100 entries

            data = {
                "version": "1.0.0",
                "last_updated": datetime.now().isoformat(),
                "metrics": [metric.dict() for metric in recent_metrics],
            }

            with open(self.metrics_file, "w") as f:
                json.dump(data, f, indent=2, default=str)

            logger.debug("Saved metrics history")

        except Exception as e:
            logger.error(f"Failed to save metrics history: {e}")

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

    async def _get_gpu_memory_used(self) -> Optional[float]:
        """Get used GPU memory in GB."""
        try:
            result = subprocess.run(
                [
                    "nvidia-smi",
                    "--query-gpu=memory.used",
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

    async def _get_gpu_utilization(self) -> Optional[float]:
        """Get GPU utilization percentage."""
        try:
            result = subprocess.run(
                [
                    "nvidia-smi",
                    "--query-gpu=utilization.gpu",
                    "--format=csv,noheader,nounits",
                ],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                return float(result.stdout.strip())
        except Exception:
            pass
        return None

    async def _get_gpu_temperature(self) -> Optional[float]:
        """Get GPU temperature in Celsius."""
        try:
            result = subprocess.run(
                [
                    "nvidia-smi",
                    "--query-gpu=temperature.gpu",
                    "--format=csv,noheader,nounits",
                ],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                return float(result.stdout.strip())
        except Exception:
            pass
        return None

    async def _get_cpu_utilization(self) -> float:
        """Get CPU utilization percentage."""
        try:
            import psutil

            return psutil.cpu_percent(interval=1)
        except Exception:
            return 0.0

    async def _get_memory_usage(self) -> float:
        """Get system memory usage in GB."""
        try:
            import psutil

            memory = psutil.virtual_memory()
            return memory.used / (1024**3)  # Convert to GB
        except Exception:
            return 0.0

    async def _get_disk_usage(self) -> float:
        """Get disk usage percentage."""
        try:
            import psutil

            disk = psutil.disk_usage('/')
            return (disk.used / disk.total) * 100
        except Exception:
            return 0.0

    async def _get_system_load(self) -> float:
        """Get system load average."""
        try:
            import psutil

            return psutil.getloadavg()[0]
        except Exception:
            return 0.0
