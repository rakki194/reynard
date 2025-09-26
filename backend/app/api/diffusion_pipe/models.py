"""Pydantic models for Diffusion-Pipe API endpoints.

This module provides comprehensive validation models for diffusion-pipe
training integration with security scanning, TOML validation, and
support for all 11 supported models including Chroma specialization.
"""

import re
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ModelType(str, Enum):
    """Supported diffusion-pipe model types."""

    CHROMA = "chroma"
    SDXL = "sdxl"
    FLUX = "flux"
    LTX_VIDEO = "ltx_video"
    HUNYUAN_VIDEO = "hunyuan_video"
    COSMOS = "cosmos"
    LUMINA = "lumina"
    WAN2_1 = "wan2.1"
    HIDREAM = "hidream"
    SD3 = "sd3"
    COSMOS_PREDICT2 = "cosmos_predict2"


class TrainingStatus(str, Enum):
    """Training status enumeration."""

    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class OptimizerType(str, Enum):
    """Supported optimizer types."""

    ADAMW = "adamw"
    ADAMW_OPTIMI = "adamw_optimi"
    LION = "lion"
    LION_OPTIMI = "lion_optimi"
    SGD = "sgd"


class AdapterType(str, Enum):
    """Supported adapter types."""

    LORA = "lora"
    DREAMBOOTH = "dreambooth"
    FULL = "full"


class DataType(str, Enum):
    """Supported data types."""

    FLOAT16 = "float16"
    FLOAT32 = "float32"
    BFLOAT16 = "bfloat16"
    FLOAT8 = "float8"


class DatasetConfig(BaseModel):
    """Dataset configuration with path validation."""

    model_config = ConfigDict(protected_namespaces=())

    # Dataset paths and settings
    dataset_path: str = Field(..., description="Path to dataset configuration file")
    resolutions: List[int] = Field(default=[512], description="Training resolutions")
    enable_ar_bucket: bool = Field(
        default=True, description="Enable aspect ratio bucketing"
    )
    min_ar: float = Field(default=0.5, description="Minimum aspect ratio")
    max_ar: float = Field(default=2.0, description="Maximum aspect ratio")
    num_ar_buckets: int = Field(default=9, description="Number of aspect ratio buckets")
    frame_buckets: List[int] = Field(
        default=[1], description="Frame buckets for video models"
    )
    shuffle_tags: bool = Field(default=True, description="Shuffle tags during training")

    # Directory configurations
    directories: List[Dict[str, Any]] = Field(
        default_factory=list, description="Dataset directory configurations"
    )

    @field_validator("dataset_path")
    @classmethod
    def validate_dataset_path(cls, v: str) -> str:
        """Validate dataset path for security and existence."""
        if not v or not v.strip():
            raise ValueError("Dataset path cannot be empty")

        # Security validation
        if not re.match(r"^[a-zA-Z0-9._/-]+$", v):
            raise ValueError("Dataset path contains invalid characters")

        # Check for path traversal attempts
        if ".." in v or v.startswith("/"):
            raise ValueError("Dataset path contains potential security risks")

        return v.strip()

    @field_validator("resolutions")
    @classmethod
    def validate_resolutions(cls, v: List[int]) -> List[int]:
        """Validate resolution values."""
        if not v:
            raise ValueError("Resolutions list cannot be empty")

        for resolution in v:
            if resolution <= 0 or resolution > 4096:
                raise ValueError(f"Invalid resolution: {resolution}")
            if resolution % 64 != 0:
                raise ValueError(f"Resolution must be divisible by 64: {resolution}")

        return sorted(list(set(v)))  # Remove duplicates and sort

    @field_validator("min_ar", "max_ar")
    @classmethod
    def validate_aspect_ratios(cls, v: float) -> float:
        """Validate aspect ratio values."""
        if v <= 0 or v > 10:
            raise ValueError(f"Invalid aspect ratio: {v}")
        return v

    @model_validator(mode="after")
    def validate_aspect_ratio_range(self) -> "DatasetConfig":
        """Validate aspect ratio range consistency."""
        if self.min_ar >= self.max_ar:
            raise ValueError("min_ar must be less than max_ar")
        return self


class ChromaTrainingConfig(BaseModel):
    """Chroma-specific training configuration with optimization presets."""

    model_config = ConfigDict(protected_namespaces=())

    # Model configuration
    model_type: ModelType = Field(default=ModelType.CHROMA, description="Model type")
    diffusers_path: str = Field(..., description="Path to diffusers model")
    transformer_path: str = Field(..., description="Path to transformer model")
    dtype: DataType = Field(default=DataType.BFLOAT16, description="Model data type")
    transformer_dtype: DataType = Field(
        default=DataType.FLOAT8, description="Transformer data type"
    )
    flux_shift: bool = Field(default=True, description="Enable flux shift")

    # Adapter configuration
    adapter_type: AdapterType = Field(
        default=AdapterType.LORA, description="Adapter type"
    )
    rank: int = Field(default=32, description="LoRA rank")
    adapter_dtype: DataType = Field(
        default=DataType.BFLOAT16, description="Adapter data type"
    )

    # Optimizer configuration
    optimizer_type: OptimizerType = Field(
        default=OptimizerType.ADAMW_OPTIMI, description="Optimizer type"
    )
    learning_rate: float = Field(default=2.5e-4, description="Learning rate")
    betas: List[float] = Field(default=[0.9, 0.99], description="Adam betas")
    weight_decay: float = Field(default=0.01, description="Weight decay")
    eps: float = Field(default=1e-8, description="Epsilon value")

    # Training configuration
    epochs: int = Field(default=1000, description="Number of epochs")
    micro_batch_size_per_gpu: int = Field(
        default=4, description="Micro batch size per GPU"
    )
    pipeline_stages: int = Field(default=1, description="Pipeline stages")
    gradient_accumulation_steps: int = Field(
        default=1, description="Gradient accumulation steps"
    )
    gradient_clipping: float = Field(default=1.0, description="Gradient clipping")
    warmup_steps: int = Field(default=100, description="Warmup steps")

    # Monitoring configuration
    enable_wandb: bool = Field(default=True, description="Enable Wandb monitoring")
    wandb_api_key: Optional[str] = Field(default=None, description="Wandb API key")
    wandb_tracker_name: str = Field(
        default="chroma-lora", description="Wandb tracker name"
    )
    wandb_run_name: str = Field(default="chroma-training", description="Wandb run name")

    @field_validator("diffusers_path", "transformer_path")
    @classmethod
    def validate_model_paths(cls, v: str) -> str:
        """Validate model paths for security."""
        if not v or not v.strip():
            raise ValueError("Model path cannot be empty")

        # Security validation
        if not re.match(r"^[a-zA-Z0-9._/-]+$", v):
            raise ValueError("Model path contains invalid characters")

        # Check for path traversal attempts
        if ".." in v:
            raise ValueError("Model path contains potential security risks")

        return v.strip()

    @field_validator("rank")
    @classmethod
    def validate_rank(cls, v: int) -> int:
        """Validate LoRA rank."""
        if v <= 0 or v > 128:
            raise ValueError(f"Invalid LoRA rank: {v}")
        return v

    @field_validator("learning_rate")
    @classmethod
    def validate_learning_rate(cls, v: float) -> float:
        """Validate learning rate."""
        if v <= 0 or v > 1.0:
            raise ValueError(f"Invalid learning rate: {v}")
        return v

    @field_validator("betas")
    @classmethod
    def validate_betas(cls, v: List[float]) -> List[float]:
        """Validate Adam betas."""
        if len(v) != 2:
            raise ValueError("Betas must contain exactly 2 values")

        for beta in v:
            if beta <= 0 or beta >= 1:
                raise ValueError(f"Invalid beta value: {beta}")

        if v[0] >= v[1]:
            raise ValueError("First beta must be less than second beta")

        return v

    @field_validator("micro_batch_size_per_gpu")
    @classmethod
    def validate_batch_size(cls, v: int) -> int:
        """Validate batch size."""
        if v <= 0 or v > 32:
            raise ValueError(f"Invalid batch size: {v}")
        return v


class DiffusionPipeConfig(BaseModel):
    """Main training configuration with TOML validation."""

    model_config = ConfigDict(protected_namespaces=())

    # Basic configuration
    output_dir: str = Field(..., description="Output directory for training results")
    dataset_config: DatasetConfig = Field(..., description="Dataset configuration")
    training_model_config: ChromaTrainingConfig = Field(
        ..., description="Model configuration"
    )

    # Training parameters
    epochs: int = Field(default=1000, description="Number of training epochs")
    micro_batch_size_per_gpu: int = Field(
        default=4, description="Micro batch size per GPU"
    )
    pipeline_stages: int = Field(default=1, description="Pipeline stages")
    gradient_accumulation_steps: int = Field(
        default=1, description="Gradient accumulation steps"
    )
    gradient_clipping: float = Field(default=1.0, description="Gradient clipping")
    warmup_steps: int = Field(default=100, description="Warmup steps")

    # Advanced settings
    enable_checkpointing: bool = Field(default=True, description="Enable checkpointing")
    checkpoint_interval: int = Field(default=100, description="Checkpoint interval")
    enable_mixed_precision: bool = Field(
        default=True, description="Enable mixed precision"
    )
    enable_gradient_checkpointing: bool = Field(
        default=True, description="Enable gradient checkpointing"
    )

    # Monitoring and logging
    enable_wandb: bool = Field(default=True, description="Enable Wandb monitoring")
    log_level: str = Field(default="INFO", description="Logging level")
    enable_metrics: bool = Field(default=True, description="Enable metrics collection")

    @field_validator("output_dir")
    @classmethod
    def validate_output_dir(cls, v: str) -> str:
        """Validate output directory path."""
        if not v or not v.strip():
            raise ValueError("Output directory cannot be empty")

        # Security validation
        if not re.match(r"^[a-zA-Z0-9._/-]+$", v):
            raise ValueError("Output directory contains invalid characters")

        # Check for path traversal attempts
        if ".." in v:
            raise ValueError("Output directory contains potential security risks")

        return v.strip()

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level."""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in valid_levels:
            raise ValueError(f"Invalid log level: {v}")
        return v.upper()

    @model_validator(mode="after")
    def validate_configuration_consistency(self) -> "DiffusionPipeConfig":
        """Validate overall configuration consistency."""
        # Check if batch size is reasonable for the model type
        if self.training_model_config.model_type == ModelType.CHROMA:
            if self.micro_batch_size_per_gpu > 8:
                raise ValueError("Batch size too large for Chroma model")

        # Check if learning rate is appropriate for the optimizer
        if self.training_model_config.optimizer_type in [
            OptimizerType.ADAMW,
            OptimizerType.ADAMW_OPTIMI,
        ]:
            if self.training_model_config.learning_rate > 1e-3:
                raise ValueError("Learning rate too high for AdamW optimizer")

        return self


class TrainingRequest(BaseModel):
    """Training initiation request with security scanning."""

    model_config = ConfigDict(protected_namespaces=())

    # Training configuration
    config: DiffusionPipeConfig = Field(..., description="Training configuration")

    # Request metadata
    request_id: str = Field(..., description="Unique request identifier")
    user_id: Optional[str] = Field(default=None, description="User identifier")
    priority: int = Field(default=5, description="Training priority (1-10)")

    # Security and validation
    enable_security_scanning: bool = Field(
        default=True, description="Enable security scanning"
    )
    validate_paths: bool = Field(default=True, description="Validate all paths")
    sanitize_inputs: bool = Field(default=True, description="Sanitize input data")

    # Resource management
    max_gpu_memory_gb: Optional[int] = Field(
        default=None, description="Maximum GPU memory usage"
    )
    timeout_seconds: int = Field(
        default=3600, description="Training timeout in seconds"
    )

    @field_validator("request_id")
    @classmethod
    def validate_request_id(cls, v: str) -> str:
        """Validate request ID format."""
        if not v or not v.strip():
            raise ValueError("Request ID cannot be empty")

        # Check for valid UUID-like format
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Request ID contains invalid characters")

        if len(v) > 100:
            raise ValueError("Request ID is too long")

        return v.strip()

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: int) -> int:
        """Validate priority value."""
        if v < 1 or v > 10:
            raise ValueError("Priority must be between 1 and 10")
        return v

    @field_validator("timeout_seconds")
    @classmethod
    def validate_timeout(cls, v: int) -> int:
        """Validate timeout value."""
        if v <= 0 or v > 86400:  # Max 24 hours
            raise ValueError("Timeout must be between 1 and 86400 seconds")
        return v


class TrainingStatus(BaseModel):
    """Real-time training status with streaming support."""

    model_config = ConfigDict(protected_namespaces=())

    # Status information
    request_id: str = Field(..., description="Training request ID")
    status: TrainingStatus = Field(..., description="Current training status")
    progress_percentage: float = Field(
        default=0.0, description="Training progress percentage"
    )

    # Timing information
    start_time: Optional[datetime] = Field(
        default=None, description="Training start time"
    )
    end_time: Optional[datetime] = Field(default=None, description="Training end time")
    estimated_completion: Optional[datetime] = Field(
        default=None, description="Estimated completion time"
    )

    # Training metrics
    current_epoch: int = Field(default=0, description="Current epoch")
    total_epochs: int = Field(default=0, description="Total epochs")
    current_step: int = Field(default=0, description="Current step")
    total_steps: int = Field(default=0, description="Total steps")

    # Performance metrics
    loss: Optional[float] = Field(default=None, description="Current loss value")
    learning_rate: Optional[float] = Field(
        default=None, description="Current learning rate"
    )
    gpu_memory_usage: Optional[float] = Field(
        default=None, description="GPU memory usage in GB"
    )
    cpu_usage: Optional[float] = Field(default=None, description="CPU usage percentage")

    # Error information
    error_message: Optional[str] = Field(
        default=None, description="Error message if failed"
    )
    error_code: Optional[str] = Field(default=None, description="Error code if failed")

    # Output information
    output_path: Optional[str] = Field(
        default=None, description="Output path for results"
    )
    checkpoint_path: Optional[str] = Field(
        default=None, description="Latest checkpoint path"
    )

    # Metadata
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )

    @field_validator("progress_percentage")
    @classmethod
    def validate_progress(cls, v: float) -> float:
        """Validate progress percentage."""
        if v < 0.0 or v > 100.0:
            raise ValueError("Progress percentage must be between 0.0 and 100.0")
        return v

    @field_validator("current_epoch", "total_epochs", "current_step", "total_steps")
    @classmethod
    def validate_epochs_steps(cls, v: int) -> int:
        """Validate epoch and step values."""
        if v < 0:
            raise ValueError("Epoch/step values cannot be negative")
        return v


class ModelInfo(BaseModel):
    """Model information and capabilities registry."""

    model_config = ConfigDict(protected_namespaces=())

    # Model identification
    model_type: ModelType = Field(..., description="Model type")
    model_id: str = Field(..., description="Model ID")
    name: str = Field(..., description="Model name")
    description: str = Field(default="", description="Model description")

    # Model status
    is_available: bool = Field(default=True, description="Whether model is available")
    is_loaded: bool = Field(
        default=False, description="Whether model is currently loaded"
    )

    # Model capabilities
    capabilities: Dict[str, Any] = Field(
        default_factory=dict, description="Model capabilities"
    )
    default_config: Dict[str, Any] = Field(
        default_factory=dict, description="Default configuration"
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate model name."""
        if not v or not v.strip():
            raise ValueError("Model name cannot be empty")
        return v.strip()

    @field_validator("model_id")
    @classmethod
    def validate_model_id(cls, v: str) -> str:
        """Validate model ID."""
        if not v or not v.strip():
            raise ValueError("Model ID cannot be empty")
        return v.strip()


class TrainingMetrics(BaseModel):
    """Performance metrics and monitoring data."""

    model_config = ConfigDict(protected_namespaces=())

    # Training metrics
    request_id: str = Field(..., description="Training request ID")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="Metrics timestamp"
    )

    # Loss metrics
    current_loss: float = Field(..., description="Current loss value")
    average_loss: float = Field(..., description="Average loss over recent steps")
    loss_trend: str = Field(
        default="stable", description="Loss trend (increasing/decreasing/stable)"
    )

    # Performance metrics
    steps_per_second: float = Field(..., description="Training steps per second")
    samples_per_second: float = Field(..., description="Samples processed per second")
    gpu_utilization: float = Field(..., description="GPU utilization percentage")
    gpu_memory_usage: float = Field(..., description="GPU memory usage in GB")
    cpu_utilization: float = Field(..., description="CPU utilization percentage")
    memory_usage: float = Field(..., description="System memory usage in GB")

    # Training progress
    progress_percentage: float = Field(..., description="Training progress percentage")
    estimated_time_remaining: Optional[int] = Field(
        default=None, description="Estimated time remaining in seconds"
    )

    # Quality metrics
    learning_rate: float = Field(..., description="Current learning rate")
    gradient_norm: Optional[float] = Field(default=None, description="Gradient norm")
    weight_norm: Optional[float] = Field(default=None, description="Weight norm")

    # System metrics
    temperature_gpu: Optional[float] = Field(
        default=None, description="GPU temperature in Celsius"
    )
    power_usage: Optional[float] = Field(
        default=None, description="Power usage in watts"
    )

    # Metadata
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional metrics metadata"
    )

    @field_validator("current_loss", "average_loss")
    @classmethod
    def validate_loss(cls, v: float) -> float:
        """Validate loss values."""
        if v < 0:
            raise ValueError("Loss values cannot be negative")
        return v

    @field_validator("steps_per_second", "samples_per_second")
    @classmethod
    def validate_throughput(cls, v: float) -> float:
        """Validate throughput values."""
        if v < 0:
            raise ValueError("Throughput values cannot be negative")
        return v

    @field_validator("gpu_utilization", "cpu_utilization", "progress_percentage")
    @classmethod
    def validate_percentages(cls, v: float) -> float:
        """Validate percentage values."""
        if v < 0.0 or v > 100.0:
            raise ValueError("Percentage values must be between 0.0 and 100.0")
        return v


class CheckpointInfo(BaseModel):
    """Checkpoint management and resumption information."""

    model_config = ConfigDict(protected_namespaces=())

    # Checkpoint identification
    checkpoint_id: str = Field(..., description="Unique checkpoint identifier")
    request_id: str = Field(..., description="Associated training request ID")
    checkpoint_path: str = Field(..., description="Path to checkpoint files")

    # Checkpoint metadata
    epoch: int = Field(..., description="Epoch when checkpoint was created")
    step: int = Field(..., description="Step when checkpoint was created")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="Checkpoint creation time"
    )

    # Checkpoint status
    is_valid: bool = Field(default=True, description="Whether checkpoint is valid")
    file_size_mb: float = Field(..., description="Checkpoint file size in MB")
    checksum: Optional[str] = Field(
        default=None, description="Checkpoint file checksum"
    )

    # Training state
    loss: float = Field(..., description="Loss value at checkpoint")
    learning_rate: float = Field(..., description="Learning rate at checkpoint")
    optimizer_state: Optional[Dict[str, Any]] = Field(
        default=None, description="Optimizer state"
    )

    # Model state
    model_state: Optional[Dict[str, Any]] = Field(
        default=None, description="Model state"
    )
    adapter_state: Optional[Dict[str, Any]] = Field(
        default=None, description="Adapter state"
    )

    # Metadata
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional checkpoint metadata"
    )

    @field_validator("checkpoint_id")
    @classmethod
    def validate_checkpoint_id(cls, v: str) -> str:
        """Validate checkpoint ID format."""
        if not v or not v.strip():
            raise ValueError("Checkpoint ID cannot be empty")

        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError("Checkpoint ID contains invalid characters")

        return v.strip()

    @field_validator("checkpoint_path")
    @classmethod
    def validate_checkpoint_path(cls, v: str) -> str:
        """Validate checkpoint path."""
        if not v or not v.strip():
            raise ValueError("Checkpoint path cannot be empty")

        # Security validation
        if not re.match(r"^[a-zA-Z0-9._/-]+$", v):
            raise ValueError("Checkpoint path contains invalid characters")

        return v.strip()

    @field_validator("file_size_mb")
    @classmethod
    def validate_file_size(cls, v: float) -> float:
        """Validate file size."""
        if v <= 0:
            raise ValueError("File size must be positive")
        return v


# Response models for API endpoints
class TrainingResponse(BaseModel):
    """Response model for training initiation."""

    success: bool = Field(
        ..., description="Whether training was initiated successfully"
    )
    request_id: str = Field(..., description="Training request ID")
    message: str = Field(..., description="Response message")
    estimated_duration: Optional[int] = Field(
        default=None, description="Estimated duration in seconds"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional response metadata"
    )


class TrainingListResponse(BaseModel):
    """Response model for training list endpoint."""

    trainings: List[TrainingStatus] = Field(
        ..., description="List of training statuses"
    )
    total_count: int = Field(..., description="Total number of trainings")
    active_count: int = Field(..., description="Number of active trainings")
    completed_count: int = Field(..., description="Number of completed trainings")
    failed_count: int = Field(..., description="Number of failed trainings")


class ModelListResponse(BaseModel):
    """Response model for model list endpoint."""

    models: List[ModelInfo] = Field(..., description="List of available models")
    total_count: int = Field(..., description="Total number of models")
    available_count: int = Field(..., description="Number of available models")
    loaded_count: int = Field(..., description="Number of loaded models")


class MetricsResponse(BaseModel):
    """Response model for metrics endpoint."""

    metrics: List[TrainingMetrics] = Field(..., description="List of training metrics")
    summary: Dict[str, Any] = Field(..., description="Metrics summary")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="Response timestamp"
    )


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""

    status: str = Field(..., description="Service status")
    version: str = Field(..., description="Service version")
    uptime: float = Field(..., description="Service uptime in seconds")
    active_trainings: int = Field(..., description="Number of active trainings")
    gpu_available: bool = Field(..., description="Whether GPU is available")
    gpu_memory_free: Optional[float] = Field(
        default=None, description="Free GPU memory in GB"
    )
    system_load: float = Field(..., description="System load average")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional health metadata"
    )
