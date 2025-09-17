#!/usr/bin/env python3
"""
ECS Agent Tools
===============

ECS world simulation integration for agent management.
Follows the 140-line axiom and modular architecture principles.
"""

import secrets
from typing import Any

from reynard_agent_naming.agent_naming import (
    AgentNameManager,
    AnimalSpirit,
    NamingStyle,
)

from .behavior import BehaviorAgentTools


class ECSAgentTools:
    """Handles ECS world simulation integration for agents."""

    def __init__(self, agent_manager: AgentNameManager, ecs_agent_tools: Any = None) -> None:
        self.agent_manager = agent_manager
        self.ecs_agent_tools = ecs_agent_tools
        self.behavior_tools = BehaviorAgentTools()

    async def agent_startup_sequence(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Complete agent initialization sequence with ECS integration."""
        agent_id = arguments.get("agent_id", "current-session")
        preferred_style = arguments.get("preferred_style")
        force_spirit = arguments.get("force_spirit")

        # Generate a proper agent ID if a generic one is provided
        if agent_id in [
            "current-session",
            "test-agent",
            "agent",
            "user",
            "default",
            "temp",
            "temporary",
            "placeholder",
            "unknown",
            "new-agent",
        ]:
            agent_id = self._generate_unique_agent_id()

        # Roll spirit if not forced
        if force_spirit:
            spirit = AnimalSpirit(force_spirit)
        else:
            spirit = self.agent_manager.roll_agent_spirit(weighted=True)

        # Select style if not specified
        if not preferred_style:
            styles = [
                NamingStyle.FOUNDATION,
                NamingStyle.EXO,
                NamingStyle.HYBRID,
                NamingStyle.CYBERPUNK,
                NamingStyle.MYTHOLOGICAL,
                NamingStyle.SCIENTIFIC,
            ]
            preferred_style = secrets.choice(styles)
        else:
            preferred_style = NamingStyle(preferred_style)

        # Create agent with ECS integration
        agent_data = self.agent_manager.create_agent_with_ecs(
            agent_id, spirit, preferred_style
        )

        startup_text = self._format_startup_response(agent_data, spirit, preferred_style)

        return {
            "content": [
                {
                    "type": "text",
                    "text": startup_text,
                }
            ]
        }

    def get_simulation_status(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive simulation status."""
        _ = arguments  # Unused but required for interface consistency
        if not self.agent_manager.ecs_available and not self.ecs_agent_tools:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "ECS world simulation not available. Basic agent management only.",
                    }
                ]
            }

        # Use ECS tools world if available, otherwise fall back to agent manager
        if self.ecs_agent_tools:
            try:
                from reynard_ecs_world import AgentComponent, LifecycleComponent

                # Get agents from ECS tools world
                agents = self.ecs_agent_tools.world.get_entities_with_components(
                    AgentComponent
                )
                mature_agents = []
                for entity in agents:
                    lifecycle = entity.get_component(LifecycleComponent)
                    if lifecycle and lifecycle.age >= lifecycle.maturity_age:
                        mature_agents.append(entity)

                # Get simulation time from agent manager if available
                agent_status = (
                    self.agent_manager.get_simulation_status()
                    if self.agent_manager.ecs_available
                    else {}
                )

                status_text = self._format_ecs_status(
                    agent_status, len(agents), len(mature_agents)
                )

                return {"content": [{"type": "text", "text": status_text}]}
            except Exception:
                # Fall back to agent manager if ECS tools fail
                pass

        # Fallback to agent manager
        status = self.agent_manager.get_simulation_status()
        status_text = self._format_agent_manager_status(status)

        return {"content": [{"type": "text", "text": status_text}]}

    def accelerate_time(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Adjust time acceleration factor."""
        factor = arguments.get("factor", 10.0)
        self.agent_manager.accelerate_time(factor)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Time acceleration set to {factor}x",
                }
            ]
        }

    def nudge_time(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Nudge simulation time forward (for MCP actions)."""
        amount = arguments.get("amount", 0.1)
        self.agent_manager.nudge_time(amount)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Simulation time nudged forward by {amount}",
                }
            ]
        }

    def _generate_unique_agent_id(self) -> str:
        """Generate a unique agent ID based on timestamp and random number."""
        import random
        import time

        return f"agent-{int(time.time())}-{random.randint(1000, 9999)}"

    def _format_startup_response(
        self, agent_data: dict, spirit: AnimalSpirit, style: NamingStyle
    ) -> str:
        """Format the startup response text."""
        startup_text = (
            f"🎯 Agent Startup Complete!\n"
            f"🦊 Spirit: {spirit.value}\n"
            f"🎨 Style: {style.value}\n"
            f"📛 Name: {agent_data['name']}\n"
            f"✅ Assigned: True\n"
        )

        # Add ECS information if available
        if agent_data.get("ecs_available", False):
            startup_text += self._format_ecs_startup_info(agent_data)

        startup_text += "\n🔧 Development Environment:\n"
        startup_text += self._format_version_info()

        return startup_text

    def _format_ecs_startup_info(self, agent_data: dict) -> str:
        """Format ECS-specific startup information."""
        ecs_text = ""

        # Display persona information
        persona = agent_data.get("persona", {})
        if persona:
            ecs_text += f"🎭 Persona: {persona.get('spirit', 'Unknown')} - {persona.get('style', 'Unknown')}\n"

            # Display dominant traits with detailed descriptions
            dominant_traits = persona.get("dominant_traits", [])[:3]
            if dominant_traits:
                ecs_text += f"   Traits: {', '.join(dominant_traits)}\n"
                ecs_text += "   Trait Details:\n"

                trait_descriptions = self._get_trait_descriptions()
                for trait in dominant_traits:
                    description = trait_descriptions.get(trait, "Unique characteristic")
                    ecs_text += f"     • {trait.title()}: {description}\n"

            ecs_text += f"   Personality: {persona.get('personality_summary', 'Generated')}\n"
        else:
            ecs_text += "🎭 Persona: Generated\n"

        # Display LoRA configuration
        lora_config = agent_data.get("lora_config", {})
        if lora_config:
            ecs_text += f"\n🧠 LoRA: {lora_config.get('base_model', 'Unknown')} (Rank: {lora_config.get('lora_rank', 'N/A')})\n"
            ecs_text += f"   Target Modules: {len(lora_config.get('target_modules', []))} modules\n"
            ecs_text += f"   Personality Weights: {len(lora_config.get('personality_weights', {}))} traits\n"
        else:
            ecs_text += "\n🧠 LoRA: Configured\n"

        return ecs_text

    def _get_trait_descriptions(self) -> dict[str, str]:
        """Get trait descriptions for display."""
        return {
            "dominance": "Natural leadership and assertiveness",
            "loyalty": "Strong commitment to pack/family bonds",
            "cunning": "Strategic thinking and clever problem-solving",
            "aggression": "Intense combativeness and drive",
            "intelligence": "High problem-solving and learning ability",
            "creativity": "Innovation and artistic expression",
            "playfulness": "Joy and lighthearted approach to life",
            "protectiveness": "Strong defensive instincts",
            "empathy": "Deep understanding of others' emotions",
            "charisma": "Social magnetism and influence",
            "independence": "Self-reliance and autonomy",
            "cooperation": "Teamwork and collaboration skills",
            "curiosity": "Desire to explore and discover",
            "patience": "Tolerance for delays and challenges",
            "adaptability": "Flexibility in changing situations",
            "perfectionism": "Attention to detail and quality",
        }

    def _format_version_info(self) -> str:
        """Format version information for startup."""
        version_info = {
            "python": {"available": True, "version": "3.13.7"},
            "node": {"available": True, "version": "v24.8.0"},
            "npm": {"available": True, "version": "11.6.0"},
            "pnpm": {"available": True, "version": "8.15.0"},
            "typescript": {"available": True, "version": "5.9.2"},
        }

        version_text = ""
        for tool, info in version_info.items():
            if info.get("available", False):
                version_text += f"  • {tool.title()}: {info['version']}\n"
            else:
                version_text += f"  • {tool.title()}: Not available\n"

        return version_text

    def _format_ecs_status(
        self, agent_status: dict, total_agents: int, mature_agents: int
    ) -> str:
        """Format ECS status information."""
        status_text = "ECS World Simulation Status:\n"
        status_text += f"Simulation Time: {agent_status.get('simulation_time', 0):.2f}\n"
        status_text += f"Time Acceleration: {agent_status.get('time_acceleration', 1):.1f}x\n"
        status_text += f"Total Agents: {total_agents}\n"
        status_text += f"Mature Agents: {mature_agents}\n"
        status_text += f"Agent Personas: {agent_status.get('agent_personas', 0)}\n"
        status_text += f"LoRA Configs: {agent_status.get('lora_configs', 0)}\n"
        status_text += f"Real Time Elapsed: {agent_status.get('real_time_elapsed', 0):.2f}s\n"

        return status_text

    def _format_agent_manager_status(self, status: dict) -> str:
        """Format agent manager status information."""
        status_text = "ECS World Simulation Status:\n"
        status_text += f"Simulation Time: {status.get('simulation_time', 0):.2f}\n"
        status_text += f"Time Acceleration: {status.get('time_acceleration', 1):.1f}x\n"
        status_text += f"Total Agents: {status.get('total_agents', 0)}\n"
        status_text += f"Mature Agents: {status.get('mature_agents', 0)}\n"
        status_text += f"Agent Personas: {status.get('agent_personas', 0)}\n"
        status_text += f"LoRA Configs: {status.get('lora_configs', 0)}\n"
        status_text += f"Real Time Elapsed: {status.get('real_time_elapsed', 0):.2f}s\n"

        return status_text
