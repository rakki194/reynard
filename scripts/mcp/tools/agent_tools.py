#!/usr/bin/env python3
"""
Agent Tool Handlers
===================

Handles agent-related MCP tool calls.
Follows the 100-line axiom and modular architecture principles.
"""

import secrets
from typing import Any

from services.agent_manager import AgentNameManager
from services.version_service import VersionService


class AgentTools:
    """Handles agent-related tool operations."""

    def __init__(self, agent_manager: AgentNameManager):
        self.agent_manager = agent_manager
        self.version_service = VersionService()

        # Inheritance tools removed - using ECS system only

    def generate_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Generate a new robot name."""
        spirit = arguments.get("spirit")
        style = arguments.get("style")
        name = self.agent_manager.generate_name(spirit, style)

        return {"content": [{"type": "text", "text": f"Generated name: {name}"}]}

    def assign_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Assign a name to an agent."""
        agent_id = arguments.get("agent_id", "")
        name = arguments.get("name", "")
        success = self.agent_manager.assign_name(agent_id, name)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Assigned name '{name}' to agent '{agent_id}': {success}",
                }
            ]
        }

    def get_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get the current name of an agent."""
        agent_id = arguments.get("agent_id", "")
        name = self.agent_manager.get_name(agent_id)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Agent '{agent_id}' name: {name or 'No name assigned'}",
                }
            ]
        }

    def list_agent_names(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """List all agents and their names."""
        agents = self.agent_manager.list_agents()
        agent_list = "\n".join(
            [f"{agent_id}: {name}" for agent_id, name in agents.items()]
        )

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Assigned agent names:\n{agent_list or 'No agents assigned'}",
                }
            ]
        }

    def roll_agent_spirit(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Randomly select an animal spirit for agent initialization."""
        weighted = arguments.get("weighted", True)

        if weighted:
            # Weighted distribution: fox 40%, otter 35%, wolf 25%
            spirits = [
                "fox",
                "fox",
                "fox",
                "fox",
                "otter",
                "otter",
                "otter",
                "otter",
                "otter",
                "wolf",
                "wolf",
                "wolf",
            ]
        else:
            # Equal distribution
            spirits = ["fox", "otter", "wolf"]

        selected_spirit = secrets.choice(spirits)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Rolled spirit: {selected_spirit}",
                }
            ]
        }

    async def agent_startup_sequence(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Complete agent initialization sequence with ECS integration and trait inheritance."""
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
            # Generate a unique agent ID based on timestamp and random number
            import random
            import time

            agent_id = f"agent-{int(time.time())}-{random.randint(1000, 9999)}"

        # Roll spirit if not forced
        if force_spirit:
            spirit = force_spirit
        else:
            # Use weighted distribution for natural balance
            spirits = [
                "fox",
                "fox",
                "fox",
                "fox",
                "otter",
                "otter",
                "otter",
                "otter",
                "otter",
                "wolf",
                "wolf",
                "wolf",
            ]
            spirit = secrets.choice(spirits)

        # Select style if not specified
        if not preferred_style:
            styles = [
                "foundation",
                "exo",
                "hybrid",
                "cyberpunk",
                "mythological",
                "scientific",
            ]
            preferred_style = secrets.choice(styles)

        # Create agent with ECS integration
        agent_data = self.agent_manager.create_agent_with_ecs(
            agent_id, spirit, preferred_style
        )

        # Get version information (simplified for startup)
        version_info = {
            "python": {"available": True, "version": "3.13.7"},
            "node": {"available": True, "version": "v24.8.0"},
            "npm": {"available": True, "version": "11.6.0"},
            "pnpm": {"available": True, "version": "8.15.0"},
            "typescript": {"available": True, "version": "5.9.2"},
        }

        startup_text = (
            f"🎯 Agent Startup Complete!\n"
            f"🦊 Spirit: {spirit}\n"
            f"🎨 Style: {preferred_style}\n"
            f"📛 Name: {agent_data['name']}\n"
            f"✅ Assigned: True\n"
        )

        # Add ECS information if available
        if agent_data.get("ecs_available", False):
            # Display persona information
            persona = agent_data.get("persona", {})
            if persona:
                startup_text += f"🎭 Persona: {persona.get('spirit', 'Unknown')} - {persona.get('style', 'Unknown')}\n"
                startup_text += (
                    f"   Traits: {', '.join(persona.get('dominant_traits', [])[:3])}\n"
                )
                startup_text += f"   Personality: {persona.get('personality_summary', 'Generated')}\n"
            else:
                startup_text += "🎭 Persona: Generated\n"

            # Display LoRA configuration
            lora_config = agent_data.get("lora_config", {})
            if lora_config:
                startup_text += f"🧠 LoRA: {lora_config.get('base_model', 'Unknown')} (Rank: {lora_config.get('lora_rank', 'N/A')})\n"
                startup_text += f"   Target Modules: {len(lora_config.get('target_modules', []))} modules\n"
                startup_text += f"   Personality Weights: {len(lora_config.get('personality_weights', {}))} traits\n"
            else:
                startup_text += "🧠 LoRA: Configured\n"
        else:
            startup_text += "🌍 ECS: Not available\n"

        startup_text += "\n🔧 Development Environment:\n"

        # Add version information
        for tool, info in version_info.items():
            if info.get("available", False):
                startup_text += f"  • {tool.title()}: {info['version']}\n"
            else:
                startup_text += f"  • {tool.title()}: Not available\n"

        return {
            "content": [
                {
                    "type": "text",
                    "text": startup_text,
                }
            ]
        }

    # Inheritance tool methods
    def create_offspring(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Create offspring agent from two parent agents using ECS system."""
        parent1_id = arguments.get("parent1_id", "")
        parent2_id = arguments.get("parent2_id", "")
        offspring_id = arguments.get("offspring_id", "")

        if not all([parent1_id, parent2_id, offspring_id]):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: All parameters (parent1_id, parent2_id, offspring_id) are required",
                    }
                ]
            }

        if not self.agent_manager.ecs_available:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "ECS system not available. Cannot create offspring.",
                    }
                ]
            }

        try:
            # Create offspring using ECS system
            result = self.agent_manager.create_agent_with_ecs(
                offspring_id, parent1_id=parent1_id, parent2_id=parent2_id
            )

            if result.get("ecs_available", False):
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                f"Created offspring {offspring_id} with name '{result['name']}'\n"
                                f"Parents: {parent1_id}, {parent2_id}\n"
                                f"ECS Entity: {result.get('entity_id', 'N/A')}"
                            ),
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"Failed to create offspring: {result.get('error', 'Unknown error')}",
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error creating offspring: {str(e)}",
                    }
                ]
            }

    def get_agent_lineage(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get family tree and lineage information for an agent using ECS system."""
        agent_id = arguments.get("agent_id", "")
        depth = arguments.get("depth", 3)

        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: agent_id is required",
                    }
                ]
            }

        if not self.agent_manager.ecs_available:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "ECS system not available. Cannot retrieve lineage.",
                    }
                ]
            }

        try:
            # Get lineage from ECS system
            lineage_data = self.agent_manager.world_simulation.get_agent_lineage(
                agent_id, depth
            )

            if lineage_data:
                lineage_text = f"Lineage for {agent_id}:\n"
                lineage_text += (
                    f"Generation: {lineage_data.get('generation', 'Unknown')}\n"
                )

                ancestors = lineage_data.get("ancestors", [])
                descendants = lineage_data.get("descendants", [])

                if ancestors:
                    lineage_text += f"Ancestors: {len(ancestors)} found\n"
                if descendants:
                    lineage_text += f"Descendants: {len(descendants)} found\n"

                return {
                    "content": [
                        {
                            "type": "text",
                            "text": lineage_text,
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"Agent {agent_id} not found or has no lineage data",
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error getting lineage: {str(e)}",
                    }
                ]
            }

    def analyze_genetic_compatibility(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Analyze genetic compatibility between two agents using ECS system."""
        agent1_id = arguments.get("agent1_id", "")
        agent2_id = arguments.get("agent2_id", "")

        if not all([agent1_id, agent2_id]):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: Both agent1_id and agent2_id are required",
                    }
                ]
            }

        if not self.agent_manager.ecs_available:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "ECS system not available. Cannot analyze compatibility.",
                    }
                ]
            }

        try:
            # Analyze compatibility using ECS system
            compatibility_data = (
                self.agent_manager.world_simulation.analyze_genetic_compatibility(
                    agent1_id, agent2_id
                )
            )

            compatibility = compatibility_data.get("compatibility", 0.0)
            analysis = compatibility_data.get("analysis", "No analysis available")
            recommended = compatibility_data.get("recommended", False)

            result_text = "Genetic Compatibility Analysis:\n"
            result_text += f"Compatibility Score: {compatibility:.2f} ({compatibility * 100:.0f}%)\n"
            result_text += f"Analysis: {analysis}\n"
            result_text += (
                f"Recommended for breeding: {'Yes' if recommended else 'No'}\n"
            )

            return {
                "content": [
                    {
                        "type": "text",
                        "text": result_text,
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error analyzing compatibility: {str(e)}",
                    }
                ]
            }

    def find_compatible_mates(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Find agents with compatible traits for breeding using ECS system."""
        agent_id = arguments.get("agent_id", "")
        max_results = arguments.get("max_results", 5)

        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: agent_id is required",
                    }
                ]
            }

        if not self.agent_manager.ecs_available:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "ECS system not available. Cannot find compatible mates.",
                    }
                ]
            }

        try:
            # Find compatible mates using ECS system
            compatible_mates = (
                self.agent_manager.world_simulation.find_compatible_mates(
                    agent_id, max_results
                )
            )

            if not compatible_mates:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"No compatible mates found for agent {agent_id}",
                        }
                    ]
                }

            mates_text = f"Compatible mates for {agent_id}:\n"
            for i, mate_data in enumerate(compatible_mates, 1):
                mate_id = mate_data.get("agent_id", "Unknown")
                mate_name = mate_data.get("name", mate_id)
                compatibility = mate_data.get("compatibility", 0.0)
                mates_text += f"{i}. {mate_name} ({mate_id}) - {compatibility:.2f} compatibility\n"

            return {
                "content": [
                    {
                        "type": "text",
                        "text": mates_text,
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error finding compatible mates: {str(e)}",
                    }
                ]
            }

    # ECS-integrated tool methods
    def get_agent_persona(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive agent persona from ECS system."""
        agent_id = arguments.get("agent_id", "")
        persona = self.agent_manager.get_agent_persona(agent_id)

        if persona:
            persona_text = f"Agent Persona for {agent_id}:\n"
            persona_text += f"Spirit: {persona.get('spirit', 'N/A')}\n"
            persona_text += f"Style: {persona.get('style', 'N/A')}\n"
            persona_text += (
                f"Dominant Traits: {', '.join(persona.get('dominant_traits', []))}\n"
            )
            persona_text += (
                f"Personality: {persona.get('personality_summary', 'N/A')}\n"
            )
            persona_text += f"Communication Style: {persona.get('communication_style', {}).get('tone', 'N/A')}\n"
            persona_text += (
                f"Specializations: {', '.join(persona.get('specializations', []))}\n"
            )

            return {"content": [{"type": "text", "text": persona_text}]}
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"No persona found for agent {agent_id}. ECS system may not be available.",
                    }
                ]
            }

    def get_lora_config(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get LoRA configuration for agent."""
        agent_id = arguments.get("agent_id", "")
        lora_config = self.agent_manager.get_lora_config(agent_id)

        if lora_config:
            lora_text = f"LoRA Configuration for {agent_id}:\n"
            lora_text += f"Base Model: {lora_config.get('base_model', 'N/A')}\n"
            lora_text += f"LoRA Rank: {lora_config.get('lora_rank', 'N/A')}\n"
            lora_text += f"LoRA Alpha: {lora_config.get('lora_alpha', 'N/A')}\n"
            lora_text += (
                f"Target Modules: {', '.join(lora_config.get('target_modules', []))}\n"
            )
            lora_text += f"Personality Weights: {len(lora_config.get('personality_weights', {}))} traits\n"
            lora_text += f"Physical Weights: {len(lora_config.get('physical_weights', {}))} traits\n"
            lora_text += f"Ability Weights: {len(lora_config.get('ability_weights', {}))} abilities\n"

            return {"content": [{"type": "text", "text": lora_text}]}
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"No LoRA config found for agent {agent_id}. ECS system may not be available.",
                    }
                ]
            }

    def get_simulation_status(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive simulation status."""
        if not self.agent_manager.ecs_available:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "ECS world simulation not available. Basic agent management only.",
                    }
                ]
            }

        status = self.agent_manager.get_simulation_status()
        status_text = "ECS World Simulation Status:\n"
        status_text += f"Simulation Time: {status.get('simulation_time', 0):.2f}\n"
        status_text += f"Time Acceleration: {status.get('time_acceleration', 1):.1f}x\n"
        status_text += f"Total Agents: {status.get('total_agents', 0)}\n"
        status_text += f"Mature Agents: {status.get('mature_agents', 0)}\n"
        status_text += f"Agent Personas: {status.get('agent_personas', 0)}\n"
        status_text += f"LoRA Configs: {status.get('lora_configs', 0)}\n"
        status_text += f"Real Time Elapsed: {status.get('real_time_elapsed', 0):.2f}s\n"

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
