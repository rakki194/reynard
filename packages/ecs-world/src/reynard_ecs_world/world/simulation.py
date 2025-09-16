"""
World Simulation

Time-accelerated world simulation with configurable speed and progression.
"""

import logging
import time
from typing import Dict, Any

logger = logging.getLogger(__name__)


class WorldSimulation:
    """
    World simulation with time acceleration and progression.
    
    Manages the simulation time, acceleration, and provides
    time-based updates for the ECS world.
    """

    def __init__(self, time_acceleration: float = 10.0):
        """
        Initialize the world simulation.
        
        Args:
            time_acceleration: Time acceleration factor (default 10x)
        """
        self.time_acceleration = time_acceleration
        self.simulation_time = 0.0
        self.real_start_time = time.time()
        self.last_update = time.time()
        self.paused = False

    def update(self, delta_time: float) -> float:
        """
        Update the simulation time.
        
        Args:
            delta_time: Real time elapsed since last update
            
        Returns:
            Simulated time elapsed
        """
        if self.paused:
            return 0.0
        
        # Calculate simulated time based on acceleration
        simulated_delta = delta_time * self.time_acceleration
        self.simulation_time += simulated_delta
        
        return simulated_delta

    def set_time_acceleration(self, acceleration: float) -> None:
        """
        Set the time acceleration factor.
        
        Args:
            acceleration: New acceleration factor
        """
        self.time_acceleration = max(0.1, min(100.0, acceleration))
        logger.info(f"Time acceleration set to {self.time_acceleration}x")

    def pause(self) -> None:
        """Pause the simulation."""
        self.paused = True
        logger.info("Simulation paused")

    def resume(self) -> None:
        """Resume the simulation."""
        self.paused = False
        logger.info("Simulation resumed")

    def get_simulation_time(self) -> float:
        """
        Get the current simulation time.
        
        Returns:
            Current simulation time
        """
        return self.simulation_time

    def get_real_time_elapsed(self) -> float:
        """
        Get the real time elapsed since simulation start.
        
        Returns:
            Real time elapsed in seconds
        """
        return time.time() - self.real_start_time

    def get_status(self) -> Dict[str, Any]:
        """
        Get the current simulation status.
        
        Returns:
            Dictionary with simulation status information
        """
        return {
            "simulation_time": self.simulation_time,
            "time_acceleration": self.time_acceleration,
            "real_time_elapsed": self.get_real_time_elapsed(),
            "paused": self.paused,
        }

    def __repr__(self) -> str:
        """String representation of the simulation."""
        return f"WorldSimulation(time={self.simulation_time:.2f}, acceleration={self.time_acceleration}x, paused={self.paused})"
