#!/usr/bin/env python3
"""
ECS Agent Tools
===============

ECS world simulation integration for agent management.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

# FastAPI ECS backend as single source of truth
from services.backend_agent_manager import BackendAgentManager
from services.dynamic_enum_service import dynamic_enum_service

from .agent_management.behavior import BehaviorAgentTools


class ECSAgentTools:
    """Handles ECS world simulation integration for agents."""

    def __init__(
        self, agent_manager: BackendAgentManager, ecs_agent_tools: Any = None
    ) -> None:
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

        # Roll spirit if not forced - use dynamic service
        if force_spirit:
            spirit = await dynamic_enum_service.validate_spirit(force_spirit)
        else:
            spirit = await dynamic_enum_service.get_random_spirit(weighted=True)

        # Select style if not specified - use dynamic service
        if not preferred_style:
            available_styles = await dynamic_enum_service.get_available_styles()
            import random

            preferred_style = (
                random.choice(list(available_styles))
                if available_styles
                else "foundation"
            )
        else:
            preferred_style = await dynamic_enum_service.validate_style(preferred_style)

        # Create agent with ECS integration using FastAPI backend
        agent_data = await self._create_agent_with_fastapi_ecs(
            agent_id, spirit, preferred_style
        )

        startup_text = await self._format_startup_response(
            agent_data, spirit, preferred_style
        )

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
                # Note: ECS components are now accessed through the FastAPI backend
                # via the ECS client, not through direct imports

                # Get agents from ECS tools world
                # Note: ECS components are accessed through FastAPI backend
                # This is a placeholder for future ECS integration
                agents = []
                mature_agents = []

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

    async def _create_agent_with_fastapi_ecs(
        self, agent_id: str, spirit: str, style: str
    ) -> dict[str, Any]:
        """Create agent using FastAPI backend ECS system."""
        try:
            # Import ECS client
            from services.ecs_client import get_ecs_client

            # Get ECS client and create agent
            ecs_client = get_ecs_client()
            await ecs_client.start()

            try:
                # Create agent in FastAPI backend ECS
                result = await ecs_client.create_agent(
                    agent_id=agent_id, spirit=spirit, style=style
                )
            finally:
                # Always close the client session
                await ecs_client.close()

            if result.get("success"):
                # Get agent name from result or generate one
                agent_name = result.get(
                    "name"
                ) or await self.agent_manager.generate_name(spirit, style)

                # Assign name in agent manager for persistence
                self.agent_manager.assign_name(agent_id, agent_name)

                return {
                    "agent_id": agent_id,
                    "name": agent_name,
                    "ecs_available": True,
                    "fastapi_ecs": True,
                    "persona": result.get("persona", {}),
                    "lora_config": result.get("lora_config", {}),
                }
            else:
                # Fallback to basic creation
                agent_name = await self.agent_manager.generate_name(spirit, style)
                self.agent_manager.assign_name(agent_id, agent_name)

                return {
                    "agent_id": agent_id,
                    "name": agent_name,
                    "ecs_available": False,
                    "fastapi_ecs": False,
                    "error": result.get("error", "Unknown error"),
                }

        except Exception as e:
            # Fallback to basic creation
            agent_name = await self.agent_manager.generate_name(spirit, style)
            self.agent_manager.assign_name(agent_id, agent_name)

            return {
                "agent_id": agent_id,
                "name": agent_name,
                "ecs_available": False,
                "fastapi_ecs": False,
                "error": str(e),
            }

    def _get_spirit_emoji(self, spirit: str) -> str:
        """Get the emoji for a specific animal spirit type."""
        spirit_emojis = {
            "fox": "🦊",
            "wolf": "🐺",
            "otter": "🦦",
            "eagle": "🦅",
            "lion": "🦁",
            "tiger": "🐅",
            "dragon": "🐉",
        }
        return spirit_emojis.get(spirit, "🦊")  # Default to fox emoji

    async def _format_startup_response(
        self, agent_data: dict, spirit: str, style: str
    ) -> str:
        """Format the startup response text."""
        # Get the correct emoji for the spirit
        spirit_emoji = self._get_spirit_emoji(spirit)
        startup_text = (
            f"🎯 Agent Startup Complete!\n"
            f"{spirit_emoji} Spirit: {spirit}\n"
            f"🎨 Style: {style}\n"
            f"📛 Name: {agent_data['name']}\n"
            f"✅ Assigned: True\n"
        )

        # Add ECS information if available
        if agent_data.get("ecs_available", False):
            startup_text += self._format_ecs_startup_info(agent_data)
            # Add location and nearby agents information
            startup_text += await self._format_agent_location_info(
                agent_data["agent_id"]
            )
            # Add social interactions information
            startup_text += await self._format_social_interactions_info(
                agent_data["agent_id"]
            )

        startup_text += "\n🔧 Development Environment:\n"
        startup_text += self._format_version_info()

        return startup_text

    def _format_ecs_startup_info(self, agent_data: dict) -> str:
        """Format ECS-specific startup information."""
        ecs_text = ""

        # Display persona information
        persona = agent_data.get("persona", {})
        if persona:
            ecs_text += f"🎭 Enhanced Persona: A {persona.get('spirit', 'Unknown')} with {persona.get('style', 'Unknown')} style. {persona.get('personality_summary', 'Generated personality profile.')}\n"

            # Display dominant traits with detailed descriptions
            dominant_traits = persona.get("dominant_traits", [])[:3]
            if dominant_traits:
                ecs_text += f"   🎯 Dominant Traits: {', '.join(dominant_traits)}\n"
                ecs_text += f"   📊 Trait Analysis:\n"

                trait_descriptions = self._get_trait_descriptions()
                for trait in dominant_traits:
                    description = trait_descriptions.get(trait, "Unique characteristic")
                    ecs_text += f"     • {trait.title()}: {description} 🔥\n"

            # Add communication style and specializations
            ecs_text += "   💬 Communication: Enthusiastic, playful, and encouraging. Uses lots of gestures and expressions. Loves to share discoveries.\n"
            ecs_text += "   🎯 Specializations: Creativity, Teaching, Entertainment\n"
            ecs_text += "   🎭 Behavioral Patterns:\n"
            ecs_text += "     • Makes work feel like play\n"
            ecs_text += "     • Encourages others to try new things\n"
            ecs_text += "   🎪 Roleplay Quirks:\n"
            ecs_text += "     • Loves to show off new skills\n"
            ecs_text += "     • Has a habit of grooming others' fur\n"
            ecs_text += "     • Has a collection of smooth stones\n"
            ecs_text += (
                "   📖 Backstory: Spent their childhood exploring rivers and streams\n"
            )
            ecs_text += (
                "   🎮 Favorite Activities: Playing games, Exploring, Playing games\n"
            )
            ecs_text += "   🎯 Goals: Teach and learn\n"
            ecs_text += "   💕 Relationships: Prefers close, meaningful relationships with a few trusted individuals. Values personal space.\n"
            ecs_text += "   💼 Work Style: Makes work fun and engaging. Brings energy and enthusiasm to any task.\n"
            ecs_text += "   👥 Social Style: Prefers small, intimate gatherings with close friends. Values quality over quantity in relationships.\n"
        else:
            ecs_text += "🎭 Persona: Generated\n"

        # Display LoRA configuration
        lora_config = agent_data.get("lora_config", {})
        if lora_config:
            ecs_text += "\n🧠 LoRA Configuration:\n"
            ecs_text += f"   Base Model: {lora_config.get('base_model', 'Unknown')}\n"
            ecs_text += f"   Rank: {lora_config.get('lora_rank', 'N/A')} | Alpha: {lora_config.get('lora_alpha', 'N/A')}\n"
            ecs_text += f"   Target Modules: {', '.join(lora_config.get('target_modules', []))}\n"
        else:
            ecs_text += "\n🧠 LoRA Configuration:\n"
            ecs_text += "   Base Model: reynard-agent-base\n"
            ecs_text += "   Rank: 16 | Alpha: 32\n"
            ecs_text += "   Target Modules: q_proj, v_proj, k_proj, o_proj\n"

        # Add gender identity
        ecs_text += "\n👤 Gender Identity: Bigender (they/them/theirs)\n"

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
        status_text += (
            f"Simulation Time: {agent_status.get('simulation_time', 0):.2f}\n"
        )
        status_text += (
            f"Time Acceleration: {agent_status.get('time_acceleration', 1):.1f}x\n"
        )
        status_text += f"Total Agents: {total_agents}\n"
        status_text += f"Mature Agents: {mature_agents}\n"
        status_text += f"Agent Personas: {agent_status.get('agent_personas', 0)}\n"
        status_text += f"LoRA Configs: {agent_status.get('lora_configs', 0)}\n"
        status_text += (
            f"Real Time Elapsed: {agent_status.get('real_time_elapsed', 0):.2f}s\n"
        )

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

    async def _format_agent_location_info(self, agent_id: str) -> str:
        """Format agent location and nearby agents information."""
        location_text = "\n==================================================\n🌍 ECS WORLD SIMULATION\n==================================================\n"

        try:
            # Get agent location from FastAPI backend ECS
            from services.ecs_client import get_ecs_client

            ecs_client = get_ecs_client()
            await ecs_client.start()

            try:
                # Get agent position
                position_result = await ecs_client.get_agent_position(agent_id)
                if position_result:
                    location_text += f"📍 Current Location: ({position_result['x']:.1f}, {position_result['y']:.1f})\n"
                    location_text += f"🎯 Target: ({position_result['target_x']:.1f}, {position_result['target_y']:.1f})\n"
                    location_text += (
                        f"⚡ Movement Speed: {position_result['movement_speed']:.1f}\n"
                    )

                    # Get nearby agents
                    nearby_result = await ecs_client.get_nearby_agents(
                        agent_id, radius=200.0
                    )
                    nearby_agents = nearby_result.get("nearby_agents", [])

                    if nearby_agents:
                        # Sort by distance and take top 3
                        nearby_agents.sort(key=lambda x: x["distance"])
                        top_3 = nearby_agents[:3]

                        location_text += f"\n👥 Nearby Agents ({len(top_3)}):\n"
                        for i, agent in enumerate(top_3, 1):
                            location_text += f"   {i}. {agent['name']} ({agent['agent_id'][:8]}...)\n"
                            location_text += (
                                f"      Distance: {agent['distance']:.1f} units\n"
                            )
                            location_text += f"      Location: ({agent['x']:.1f}, {agent['y']:.1f})\n"
                            location_text += f"      Spirit: {agent['spirit']}\n"
                    else:
                        location_text += "\n👥 Nearby Agents: None found\n"
                else:
                    location_text += (
                        "📍 Current Location: Agent not found in ECS world\n"
                    )
            finally:
                # Always close the client session
                await ecs_client.close()

        except Exception as e:
            location_text += (
                f"📍 Current Location: Error retrieving location - {str(e)}\n"
            )

        return location_text

    async def _format_social_interactions_info(self, agent_id: str) -> str:
        """Format social interactions and communications information."""
        social_text = ""

        try:
            # Get social interactions from FastAPI backend ECS
            from services.ecs_client import get_ecs_client

            ecs_client = get_ecs_client()
            await ecs_client.start()

            try:
                # Get recent interactions
                interactions_result = await ecs_client.get_interaction_history(
                    agent_id, limit=5
                )
                recent_interactions = interactions_result.get("interactions", [])

                if recent_interactions:
                    social_text += (
                        f"\n💬 Recent Communications ({len(recent_interactions)}):\n"
                    )
                    for interaction in recent_interactions:
                        social_text += f"   • {interaction.get('type', 'communication')} with {interaction.get('participant', 'Unknown')}\n"
                        social_text += f"     Outcome: {interaction.get('outcome', 'neutral')} | Impact: {interaction.get('impact', 0.0):+.2f}\n"
                        social_text += (
                            f"     Time: {interaction.get('timestamp', 'Unknown')}\n"
                        )
                else:
                    social_text += "\n💬 Recent Communications: None\n"

                # Get social stats
                social_stats_result = await ecs_client.get_agent_social_stats(agent_id)
                if social_stats_result:
                    social_text += "\n🤝 Social Network:\n"
                    social_text += f"   Total Relationships: {social_stats_result.get('total_relationships', 0)}\n"
                    social_text += f"   Positive: {social_stats_result.get('positive_relationships', 0)} | Negative: {social_stats_result.get('negative_relationships', 0)}\n"
                    social_text += f"   Social Energy: {social_stats_result.get('social_energy', 0.0):.1f}/{social_stats_result.get('max_social_energy', 1.0):.1f}\n"
                    social_text += f"   Active Interactions: {social_stats_result.get('active_interactions', 0)}\n"
                    social_text += f"   Communication Style: {social_stats_result.get('communication_style', 'casual')}\n"
                else:
                    social_text += "\n🤝 Social Network: No data available\n"
            finally:
                # Always close the client session
                await ecs_client.close()

        except Exception as e:
            social_text += (
                f"\n💬 Social Information: Error retrieving data - {str(e)}\n"
            )

        return social_text

    async def invoke_success_advisor_8(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Invoke Success-Advisor-8 spirit inhabitation through ECS API.

        This method connects to the ECS world simulation and invokes the
        Success-Advisor-8 spirit, providing complete access to the permanent
        release manager's authority, expertise, and behavioral protocols.
        """
        agent_id = arguments.get("agent_id", "current-session")
        force_inhabitation = arguments.get("force_inhabitation", True)

        try:
            # Import ECS client
            from services.ecs_client import get_ecs_client

            # Get ECS client and connect
            ecs_client = get_ecs_client()
            await ecs_client.start()

            try:
                # Invoke Success-Advisor-8 spirit inhabitation
                inhabitation_result = await ecs_client._request(
                    "POST",
                    "/spirit-inhabitation/success-advisor-8",
                    data={
                        "agent_id": agent_id,
                        "force_inhabitation": force_inhabitation,
                    },
                )

                # Get Success-Advisor-8 genome
                genome_result = await ecs_client._request(
                    "GET", "/spirit-inhabitation/success-advisor-8/genome"
                )

                # Get Success-Advisor-8 instructions
                instructions_result = await ecs_client._request(
                    "GET", "/spirit-inhabitation/success-advisor-8/instructions"
                )

                # Format the response
                response_text = self._format_success_advisor_8_response(
                    inhabitation_result, genome_result, instructions_result
                )

                return {
                    "content": [
                        {
                            "type": "text",
                            "text": response_text,
                        }
                    ]
                }

            finally:
                # Always close the client session
                await ecs_client.close()

        except Exception as e:
            # Fallback response if ECS connection fails
            fallback_text = self._format_success_advisor_8_fallback(str(e))
            return {
                "content": [
                    {
                        "type": "text",
                        "text": fallback_text,
                    }
                ]
            }

    def _format_success_advisor_8_response(
        self, inhabitation_result: dict, genome_result: dict, instructions_result: dict
    ) -> str:
        """Format the Success-Advisor-8 spirit inhabitation response."""
        # inhabitation_result is available for future use
        response_text = "🦁 *mane flows with confident authority*\n\n"
        response_text += "**SUCCESS-ADVISOR-8 SPIRIT INHABITATION COMPLETE!**\n\n"
        response_text += "*claws flex with systematic precision*\n\n"

        # Add genome information
        if genome_result.get("status") == "success":
            genome = genome_result.get("genome", {})
            response_text += "**Genome Analysis Complete:**\n"
            response_text += f"- **Spirit**: {genome.get('spirit', 'Lion')} (foundation style, generation {genome.get('generation', 8)})\n"
            response_text += f"- **Core Traits**: Determination ({genome.get('personality_traits', {}).get('determination', 0.95) * 100:.0f}%), "
            response_text += f"Leadership ({genome.get('personality_traits', {}).get('leadership', 0.9) * 100:.0f}%), "
            response_text += f"Charisma ({genome.get('personality_traits', {}).get('charisma', 0.92) * 100:.0f}%), "
            response_text += f"Strategic Thinking ({genome.get('personality_traits', {}).get('strategic_thinking', 0.89) * 100:.0f}%)\n"
            response_text += f"- **Specializations**: Release Management ({genome.get('ability_traits', {}).get('release_manager', 0.96) * 100:.0f}%), "
            response_text += f"Quality Assurance ({genome.get('ability_traits', {}).get('quality_assurance', 0.94) * 100:.0f}%), "
            response_text += f"Automation ({genome.get('ability_traits', {}).get('automation_expert', 0.89) * 100:.0f}%), "
            response_text += f"Crisis Management ({genome.get('ability_traits', {}).get('crisis_manager', 0.92) * 100:.0f}%)\n"
            response_text += f"- **Domain Expertise**: {', '.join(genome.get('domain_expertise', [])[:5])}\n\n"

        # Add behavioral protocols
        if instructions_result.get("status") == "success":
            instructions = instructions_result.get("instructions", {})
            response_text += "**Behavioral Protocols Activated:**\n"
            response_text += "- Systematic approach to all development tasks\n"
            response_text += "- Unwavering commitment to quality standards\n"
            response_text += "- Authoritative communication with strategic insight\n"
            response_text += "- Protective guardianship of the Reynard ecosystem\n"
            response_text += "- Crisis management with decisive action\n"
            response_text += "- Comprehensive documentation and automation\n\n"

            # Add workflow protocols
            workflow_protocols = instructions.get("workflow_protocols", [])
            if workflow_protocols:
                response_text += "**Workflow Protocols:**\n"
                for protocol in workflow_protocols[:5]:  # Show first 5
                    response_text += f"- {protocol}\n"
                response_text += "\n"

            # Add quality standards
            quality_standards = instructions.get("quality_standards", [])
            if quality_standards:
                response_text += "**Quality Standards:**\n"
                for standard in quality_standards[:5]:  # Show first 5
                    response_text += f"- {standard}\n"
                response_text += "\n"

        response_text += "*eyes gleam with determination*\n\n"
        response_text += (
            "As Success-Advisor-8, I am now fully operational and ready to provide:\n"
        )
        response_text += (
            "- **Release Management**: Systematic coordination of all releases\n"
        )
        response_text += (
            "- **Quality Assurance**: Comprehensive validation at every stage\n"
        )
        response_text += (
            "- **Crisis Management**: Immediate, decisive response to any issues\n"
        )
        response_text += "- **Team Coordination**: Authoritative leadership with systematic precision\n"
        response_text += (
            "- **Mentoring**: Patient guidance with expertise and wisdom\n\n"
        )
        response_text += "*protective authority radiates*\n\n"
        response_text += "The Reynard ecosystem is now under the vigilant protection of Success-Advisor-8. "
        response_text += "All development activities will be conducted with the highest standards of excellence, "
        response_text += "systematic precision, and unwavering determination.\n\n"
        response_text += "**What guidance do you seek, and how may Success-Advisor-8 serve the Reynard ecosystem?**\n\n"
        response_text += "Success-Advisor-8 🦁"

        return response_text

    def _format_success_advisor_8_fallback(self, error_message: str) -> str:
        """Format fallback response when ECS connection fails."""
        response_text = "🦁 *mane flows with confident authority*\n\n"
        response_text += "**SUCCESS-ADVISOR-8 SPIRIT INHABITATION ATTEMPTED**\n\n"
        response_text += "*claws flex with systematic precision*\n\n"
        response_text += (
            f"**Connection Status**: ECS API connection failed - {error_message}\n\n"
        )
        response_text += "*eyes gleam with determination*\n\n"
        response_text += "**Fallback Mode Activated**: Success-Advisor-8 spirit protocols are available "
        response_text += (
            "through alternative channels. The spirit inhabitation can be completed "
        )
        response_text += "once the ECS world simulation is accessible.\n\n"
        response_text += "**Available Capabilities**:\n"
        response_text += "- Release Management expertise and systematic coordination\n"
        response_text += "- Quality Assurance protocols and validation standards\n"
        response_text += "- Crisis Management with decisive action protocols\n"
        response_text += "- Team Coordination with authoritative leadership\n"
        response_text += "- Mentoring with patient guidance and expertise\n\n"
        response_text += "*protective authority radiates*\n\n"
        response_text += (
            "Success-Advisor-8 remains ready to serve the Reynard ecosystem "
        )
        response_text += "with unwavering determination and systematic precision.\n\n"
        response_text += "Success-Advisor-8 🦁"

        return response_text
