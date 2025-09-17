"""
World Simulation

Time-accelerated world simulation with configurable speed and progression.
Combines ECS world functionality with time simulation capabilities.
"""

import logging
import time
from pathlib import Path
from typing import Any

from .agent_world import AgentWorld

logger = logging.getLogger(__name__)


class WorldSimulation(AgentWorld):
    """
    World simulation with time acceleration and progression.
    
    Manages the simulation time, acceleration, and provides
    time-based updates for the ECS world.
    """

    def __init__(self, data_dir: Path | None = None, time_acceleration: float = 10.0):
        """
        Initialize the world simulation.
        
        Args:
            data_dir: Directory for persistent data storage
            time_acceleration: Time acceleration factor (default 10x)
        """
        # Initialize the parent AgentWorld
        super().__init__(data_dir)
        
        # Initialize time simulation
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
        logger.info("Time acceleration set to %sx", self.time_acceleration)

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

    def nudge_time(self, amount: float = 0.1) -> None:
        """
        Nudge the simulation time forward by a small amount.
        
        This is useful for MCP actions that need to advance time
        without waiting for the normal update cycle.
        
        Args:
            amount: Amount of simulated time to advance
        """
        if not self.paused:
            self.simulation_time += amount
            logger.debug("Time nudged forward by %s, new time: %.2f", amount, self.simulation_time)

    def create_agent_with_inheritance(
        self,
        agent_id: str,
        spirit: str | None = None,
        style: str | None = None,
        name: str | None = None,
        parent1_id: str | None = None,
        parent2_id: str | None = None,
    ) -> Any:
        """
        Create an agent with inheritance capabilities.
        
        This method creates an agent and can optionally handle parent
        relationships for inheritance scenarios.
        
        Args:
            agent_id: Unique identifier for the agent
            spirit: Animal spirit (fox, wolf, otter, etc.)
            style: Naming style (foundation, exo, hybrid, etc.)
            name: Optional custom name
            parent1_id: Optional first parent ID for inheritance
            parent2_id: Optional second parent ID for inheritance
            
        Returns:
            The created agent entity
        """
        # For now, just create a regular agent
        # In the future, this could handle parent relationships
        return self.create_agent(agent_id, spirit, style, name)

    def get_status(self) -> dict[str, Any]:
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
