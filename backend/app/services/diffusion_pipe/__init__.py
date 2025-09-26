"""Diffusion-Pipe service module for Reynard Backend.

This module provides comprehensive service layer architecture for
diffusion-pipe training integration following the AI service pattern
with provider registry, health monitoring, and fallback mechanisms.
"""

from .checkpoint_manager import CheckpointManager
from .chroma_service import ChromaService, get_chroma_service
from .diffusion_pipe_service import DiffusionPipeService, get_diffusion_pipe_service
from .metrics_collector import MetricsCollector
from .model_provider import ModelProvider
from .training_manager import TrainingManager
from .training_profile_manager import (
    TrainingProfileManager,
    get_training_profile_manager,
)
from .websocket_manager import WebSocketManager, get_websocket_manager

__all__ = [
    "DiffusionPipeService",
    "get_diffusion_pipe_service",
    "TrainingManager",
    "ModelProvider",
    "CheckpointManager",
    "MetricsCollector",
    "TrainingProfileManager",
    "get_training_profile_manager",
    "WebSocketManager",
    "get_websocket_manager",
    "ChromaService",
    "get_chroma_service",
]
