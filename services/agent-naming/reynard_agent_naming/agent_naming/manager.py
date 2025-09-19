"""
Agent Name Manager
=================

Manages agent names and persistence for the MCP server with ECS integration.
Follows the 100-line axiom and modular architecture principles.
"""

import json
import logging
from pathlib import Path
from typing import Any

from .modular_generator import ModularAgentNamer
from .types import AnimalSpirit, NamingConfig, NamingScheme, NamingStyle
from .dynamic_config import DynamicConfigManager

# Try to import ECS world simulation
try:
    from reynard_ecs_world import WorldSimulation
    ECS_AVAILABLE = True
except ImportError:
    WorldSimulation = None
    ECS_AVAILABLE = False

logger = logging.getLogger(__name__)


class AgentNameManager:
    """Manages agent names and persistence with ECS integration."""

    def __init__(self, data_dir: str | None = None):
        """Initialize the agent name manager."""
        self.data_dir = Path(data_dir) if data_dir else Path(__file__).parent.parent
        self.agents_file = self.data_dir / "agent-names.json"
        self.namer = ModularAgentNamer()

        # Initialize dynamic configuration manager
        self.config_manager = DynamicConfigManager(self.data_dir)

        # Initialize ECS world simulation
        self.ecs_available = ECS_AVAILABLE
        self.world_simulation = None

        if ECS_AVAILABLE and WorldSimulation is not None:
            try:
                self.world_simulation = WorldSimulation(self.data_dir)
            except (ImportError, OSError, ValueError) as e:
                logger.warning("Failed to initialize ECS world simulation: %s", e)
                self.ecs_available = False

        self._load_agents()

    def _create_ecs_agent(self, agent_id: str, spirit_str: str, style_str: str, name: str | None, parent1_id: str | None, parent2_id: str | None) -> Any:
        """Create agent in ECS world simulation."""
        if self.world_simulation is None:
            raise ValueError("ECS world simulation not available")
        return self.world_simulation.create_agent_with_inheritance(
            agent_id, spirit_str, style_str, name, parent1_id, parent2_id
        )

    def _load_agents(self) -> None:
        """Load agent names from persistent storage."""
        if self.agents_file.exists():
            try:
                with self.agents_file.open(encoding="utf-8") as f:
                    self.agents = json.load(f)
            except (OSError, json.JSONDecodeError) as e:
                logger.warning("Could not load agent names: %s", e)
                self.agents = {}
        else:
            self.agents = {}

    def _save_agents(self) -> None:
        """Save agent names to persistent storage."""
        try:
            with self.agents_file.open("w", encoding="utf-8") as f:
                json.dump(self.agents, f, indent=2)
        except OSError:
            logger.exception("Could not save agent names")

    def generate_name(
        self,
        spirit: AnimalSpirit | None = None,
        style: NamingStyle | None = None,
        scheme: NamingScheme = NamingScheme.ANIMAL_SPIRIT,
        scheme_type: str | None = None,
    ) -> str:
        """Generate a new robot name using dynamic configuration."""
        # Get current configuration
        config_data = self.config_manager.get_config()
        
        # Use dynamic defaults if not specified
        if scheme == NamingScheme.ANIMAL_SPIRIT and config_data.default_scheme:
            try:
                scheme = NamingScheme(config_data.default_scheme)
            except ValueError:
                pass  # Keep original scheme
        
        if style is None and config_data.default_style:
            try:
                style = NamingStyle(config_data.default_style)
            except ValueError:
                pass  # Keep None style
        
        config = NamingConfig(
            spirit=spirit, style=style, scheme=scheme, scheme_type=scheme_type, count=1
        )
        names = self.namer.generate_batch(config)
        return names[0].name if names else "Unknown-Unit-1"

    def assign_name(self, agent_id: str, name: str) -> bool:
        """Assign a name to an agent."""
        import time

        self.agents[agent_id] = {
            "name": name,
            "assigned_at": time.time(),
        }
        self._save_agents()
        logger.info("Assigned name '%s' to agent '%s'", name, agent_id)
        return True

    def get_name(self, agent_id: str) -> str | None:
        """Get the name of an agent."""
        agent_data = self.agents.get(agent_id, {})
        return agent_data.get("name") if isinstance(agent_data, dict) else None

    def list_agents(self) -> dict[str, str]:
        """List all agents and their names."""
        result = {}
        for agent_id, data in self.agents.items():
            if isinstance(data, dict) and "name" in data:
                result[agent_id] = data["name"]
        return result
    
    def get_naming_config(self) -> dict[str, Any]:
        """Get current naming system configuration."""
        return self.config_manager.get_config().to_dict()
    
    def set_default_scheme(self, scheme_name: str) -> bool:
        """Set the default naming scheme."""
        return self.config_manager.set_default_scheme(scheme_name)
    
    def set_default_style(self, style_name: str) -> bool:
        """Set the default naming style."""
        return self.config_manager.set_default_style(style_name)
    
    def enable_scheme(self, scheme_name: str) -> bool:
        """Enable a naming scheme."""
        return self.config_manager.enable_scheme(scheme_name)
    
    def disable_scheme(self, scheme_name: str) -> bool:
        """Disable a naming scheme."""
        return self.config_manager.disable_scheme(scheme_name)
    
    def enable_style(self, style_name: str) -> bool:
        """Enable a naming style."""
        return self.config_manager.enable_style(style_name)
    
    def disable_style(self, style_name: str) -> bool:
        """Disable a naming style."""
        return self.config_manager.disable_style(style_name)
    
    def enable_spirit(self, spirit_name: str) -> bool:
        """Enable an animal spirit."""
        return self.config_manager.enable_spirit(spirit_name)
    
    def disable_spirit(self, spirit_name: str) -> bool:
        """Disable an animal spirit."""
        return self.config_manager.disable_spirit(spirit_name)
    
    def reload_config(self) -> bool:
        """Reload naming configuration from file."""
        return self.config_manager.reload_config()
    
    def validate_config(self) -> list[str]:
        """Validate current naming configuration."""
        return self.config_manager.validate_config()

    def create_agent_with_ecs(
        self,
        agent_id: str,
        spirit: AnimalSpirit | None = None,
        style: NamingStyle | None = None,
        name: str | None = None,
        parent1_id: str | None = None,
        parent2_id: str | None = None,
    ) -> dict[str, Any]:
        """Create agent with ECS integration and trait inheritance."""
        if not self.ecs_available:
            # Fallback to basic creation
            name = name or self.generate_name(spirit, style)
            self.assign_name(agent_id, name)
            return {"agent_id": agent_id, "name": name, "ecs_available": False}

        try:
            # Convert enums to strings for ECS world
            spirit_str = (
                spirit.value if spirit else "fox"
            )
            style_str = (
                style.value if style else "foundation"
            )

            # Create agent in ECS world
            if self.world_simulation is None:
                raise ValueError("ECS world simulation not available")
            entity = self._create_ecs_agent(agent_id, spirit_str, style_str, name, parent1_id, parent2_id)

            # Get agent component for name
            from reynard_ecs_world import AgentComponent

            agent_component = entity.get_component(AgentComponent)
            if agent_component and agent_component.name:
                name = agent_component.name
                if name:
                    self.assign_name(agent_id, name)

            # Nudge time forward for this action
            if self.world_simulation:
                self.world_simulation.nudge_time(0.1)

            return {
                "agent_id": agent_id,
                "name": name,
                "entity_id": entity.id,
                "ecs_available": True,
                "persona": self.world_simulation.get_agent_persona(agent_id) if self.world_simulation else None,
                "lora_config": self.world_simulation.get_lora_config(agent_id) if self.world_simulation else None,
            }
        except (ImportError, OSError, ValueError, AttributeError) as e:
            logger.exception("Failed to create ECS agent")
            # Fallback to basic creation
            name = name or self.generate_name(spirit, style)
            self.assign_name(agent_id, name)
            return {
                "agent_id": agent_id,
                "name": name,
                "ecs_available": False,
                "error": str(e),
            }

    def get_agent_persona(self, agent_id: str) -> dict[str, Any] | None:
        """Get comprehensive agent persona from ECS system."""
        if self.ecs_available and self.world_simulation:
            persona = self.world_simulation.get_agent_persona(agent_id)
            return persona if isinstance(persona, dict) else None
        return None

    def get_lora_config(self, agent_id: str) -> dict[str, Any] | None:
        """Get LoRA configuration for agent."""
        if self.ecs_available and self.world_simulation:
            config = self.world_simulation.get_lora_config(agent_id)
            return config if isinstance(config, dict) else None
        return None

    def update_simulation(self, delta_time: float | None = None) -> None:
        """Update ECS world simulation."""
        if self.ecs_available and self.world_simulation:
            self.world_simulation.update_simulation(delta_time)

    def nudge_time(self, amount: float = 0.1) -> None:
        """Nudge simulation time forward (for MCP actions)."""
        if self.ecs_available and self.world_simulation:
            self.world_simulation.nudge_time(amount)

    def get_simulation_status(self) -> dict[str, Any]:
        """Get comprehensive simulation status."""
        if self.ecs_available and self.world_simulation:
            status = self.world_simulation.get_simulation_status()
            return status if isinstance(status, dict) else {"ecs_available": True}
        return {"ecs_available": False}

    def accelerate_time(self, factor: float) -> None:
        """Adjust time acceleration factor."""
        if self.ecs_available and self.world_simulation:
            self.world_simulation.accelerate_time(factor)

    def roll_agent_spirit(self, weighted: bool = True) -> AnimalSpirit:
        """Randomly select an animal spirit for agent initialization."""
        if weighted:
            # Weighted distribution: fox 40%, otter 35%, wolf 25%
            spirits = [
                AnimalSpirit.FOX,
                AnimalSpirit.FOX,
                AnimalSpirit.FOX,
                AnimalSpirit.FOX,
                AnimalSpirit.OTTER,
                AnimalSpirit.OTTER,
                AnimalSpirit.OTTER,
                AnimalSpirit.OTTER,
                AnimalSpirit.OTTER,
                AnimalSpirit.WOLF,
                AnimalSpirit.WOLF,
                AnimalSpirit.WOLF,
            ]
        else:
            # Equal distribution
            spirits = [AnimalSpirit.FOX, AnimalSpirit.OTTER, AnimalSpirit.WOLF]

        import random  # nosec B311

        return random.choice(spirits)  # nosec B311

    def get_available_spirits(self) -> list[AnimalSpirit]:
        """Get list of available animal spirits."""
        return list(AnimalSpirit)

    def get_available_styles(self) -> list[NamingStyle]:
        """Get list of available naming styles."""
        return list(NamingStyle)

    def analyze_name(self, name: str) -> dict[str, str]:
        """Analyze a name to extract spirit and style information."""
        return self.namer.get_spirit_info(name)
