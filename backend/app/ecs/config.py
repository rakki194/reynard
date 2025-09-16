"""
ECS World Configuration

Configuration settings for the ECS world system.
"""

from pydantic import BaseModel
from typing import Optional
from pathlib import Path


class ECSConfig(BaseModel):
    """Configuration for the ECS world system."""
    
    # Data persistence
    data_dir: Path = Path("data/ecs")
    
    # Time management
    time_acceleration: float = 10.0
    max_time_acceleration: float = 100.0
    min_time_acceleration: float = 0.1
    
    # Breeding configuration
    compatibility_threshold: float = 0.7
    breeding_interval: int = 3600  # 1 hour in seconds
    max_offspring_per_pair: int = 3
    
    # World limits
    max_entities: int = 10000
    max_agents: int = 1000
    
    # Simulation settings
    update_interval: float = 0.1  # 100ms
    cleanup_interval: int = 300   # 5 minutes
    
    # Logging
    log_level: str = "INFO"
    log_ecs_events: bool = True
    
    class Config:
        """Pydantic configuration."""
        env_prefix = "ECS_"
        case_sensitive = False


def get_ecs_config() -> ECSConfig:
    """
    Get the ECS configuration.
    
    Returns:
        ECSConfig instance with current settings
    """
    return ECSConfig()
