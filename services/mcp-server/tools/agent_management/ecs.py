#!/usr/bin/env python3
"""
ECS Agent Tools
===============

ECS world simulation integration for agent management.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any, List

# FastAPI ECS backend as single source of truth
from services.backend_agent_manager import BackendAgentManager
from services.dynamic_enum_service import dynamic_enum_service

from .behavior import BehaviorAgentTools


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
            spirit_str = await dynamic_enum_service.validate_spirit(force_spirit)
        else:
            spirit_str = await dynamic_enum_service.get_random_spirit(weighted=True)

        # Select style if not specified - use dynamic service
        if not preferred_style:
            available_styles = await dynamic_enum_service.get_available_styles()
            import random

            preferred_style = random.choice(list(available_styles))
        else:
            preferred_style = await dynamic_enum_service.validate_style(preferred_style)

        # Create agent with ECS integration using ECS client
        agent_data = await self._create_agent_with_ecs_client(
            agent_id, spirit_str, preferred_style
        )

        # Generate enhanced persona for detailed roleplay
        try:
            from services.enhanced_persona_service import enhanced_persona_service

            enhanced_persona = enhanced_persona_service.generate_enhanced_persona(
                name=agent_data.get("name", "Unknown"),
                spirit=spirit_str,
                style=preferred_style,
                agent_id=agent_id,
            )

            # Add enhanced persona to agent data
            agent_data["enhanced_persona"] = enhanced_persona

        except Exception as e:
            print(f"Warning: Could not generate enhanced persona: {e}")
            # Continue without enhanced persona

        startup_text = self._format_startup_response(
            agent_data, spirit_str, preferred_style
        )

        return {
            "content": [
                {
                    "type": "text",
                    "text": startup_text,
                }
            ]
        }

    async def get_simulation_status(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive simulation status from FastAPI ECS backend."""
        _ = arguments  # Unused but required for interface consistency

        try:
            from services.ecs_client import get_ecs_client

            # Get ECS client
            ecs_client = get_ecs_client()
            await ecs_client.start()

            # Get world status from FastAPI backend
            world_status = await ecs_client.get_world_status()

            # Get all agents from FastAPI backend
            agents = await ecs_client.get_agents()

            # Close ECS client
            await ecs_client.close()

            # Format status text
            status_text = self._format_fastapi_ecs_status(world_status, agents)

            return {"content": [{"type": "text", "text": status_text}]}

        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"ECS world simulation not available: {str(e)}",
                    }
                ]
            }

    async def accelerate_time(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Adjust time acceleration factor (FastAPI backend doesn't support this yet)."""
        factor = arguments.get("factor", 10.0)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Time acceleration not yet supported in FastAPI ECS backend. Requested: {factor}x",
                }
            ]
        }

    async def nudge_time(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Nudge simulation time forward (FastAPI backend doesn't support this yet)."""
        amount = arguments.get("amount", 0.1)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Time nudging not yet supported in FastAPI ECS backend. Requested: {amount}",
                }
            ]
        }

    async def _create_agent_with_ecs_client(
        self, agent_id: str, spirit: str, style: str
    ) -> dict[str, Any]:
        """Create agent using ECS client or connect to existing agent."""
        try:
            from services.ecs_client import get_ecs_client

            # Get ECS client
            ecs_client = get_ecs_client()
            await ecs_client.start()

            # Check if agent already exists in ECS world
            existing_agents = await ecs_client.get_agents()
            existing_agent = None
            for agent in existing_agents:
                if agent.get("agent_id") == agent_id:
                    existing_agent = agent
                    break

            if existing_agent:
                # Agent already exists, use existing data
                name = existing_agent.get("name", "Unknown")
                self.agent_manager.assign_name(agent_id, name)

                await ecs_client.close()

                return {
                    "agent_id": agent_id,
                    "name": name,
                    "ecs_available": True,
                    "ecs_result": existing_agent,
                    "ecs_status": "existing",
                    "persona": None,  # Could be enhanced with ECS persona data
                    "lora_config": None,  # Could be enhanced with ECS LoRA data
                }
            else:
                # Create new agent in ECS world
                ecs_result = await ecs_client.create_agent(
                    agent_id=agent_id, spirit=spirit, style=style
                )

                # Generate name using agent manager
                name = await self.agent_manager.generate_name(spirit, style)
                self.agent_manager.assign_name(agent_id, name)

                await ecs_client.close()

                return {
                    "agent_id": agent_id,
                    "name": name,
                    "ecs_available": True,
                    "ecs_result": ecs_result,
                    "ecs_status": "created",
                    "persona": None,  # Could be enhanced with ECS persona data
                    "lora_config": None,  # Could be enhanced with ECS LoRA data
                }

        except Exception as e:
            # Fallback to basic creation
            name = await self.agent_manager.generate_name(spirit, style)
            self.agent_manager.assign_name(agent_id, name)
            return {
                "agent_id": agent_id,
                "name": name,
                "ecs_available": False,
                "error": str(e),
            }

    def _generate_unique_agent_id(self) -> str:
        """Generate a unique agent ID based on timestamp and random number."""
        import random
        import time

        return f"agent-{int(time.time())}-{random.randint(1000, 9999)}"

    def _get_spirit_emoji(self, spirit: str) -> str:
        """Get the emoji for a specific animal spirit type using centralized service."""
        from services.spirit_emoji_service import spirit_emoji_service

        return spirit_emoji_service.get_spirit_emoji(spirit)

    def _format_startup_response(
        self, agent_data: dict, spirit: str, style: str
    ) -> str:
        """Format the enhanced startup response text with detailed information."""
        # Get the correct emoji for the spirit
        spirit_emoji = self._get_spirit_emoji(spirit)

        # Enhanced startup header with more details
        startup_text = (
            f"🎯 Agent Startup Complete!\n"
            f"{spirit_emoji} Spirit: {spirit.title()}\n"
            f"🎨 Style: {style.title()}\n"
            f"📛 Name: {agent_data['name']}\n"
            f"🆔 Agent ID: {agent_data.get('agent_id', 'Unknown')}\n"
            f"✅ Assigned: True\n"
        )

        # Add ECS information if available
        if agent_data.get("ecs_available", False):
            startup_text += "\n" + "=" * 50 + "\n"
            startup_text += "🌍 ECS WORLD SIMULATION\n"
            startup_text += "=" * 50 + "\n"
            startup_text += self._format_ecs_startup_info(agent_data)
        else:
            startup_text += "\n⚠️  ECS World Simulation: Not Available\n"

        startup_text += "\n" + "=" * 50 + "\n"
        startup_text += "🔧 Development Environment\n"
        startup_text += "=" * 50 + "\n"
        startup_text += self._format_version_info()

        return startup_text

    def _format_ecs_startup_info(self, agent_data: dict) -> str:
        """Format ECS-specific startup information with enhanced details."""
        ecs_text = ""

        # Show ECS connection status
        ecs_status = agent_data.get("ecs_status", "unknown")
        if ecs_status == "existing":
            ecs_text += "✅ Connected to existing ECS agent\n"
        elif ecs_status == "created":
            ecs_text += "🆕 Created new ECS agent\n"
        else:
            ecs_text += "🔗 Connected to ECS world\n"

        # Display enhanced persona information
        enhanced_persona = agent_data.get("enhanced_persona")
        if enhanced_persona:
            # Display rich personality summary
            ecs_text += f"🎭 Enhanced Persona: {enhanced_persona.personality_summary}\n"

            # Display dominant traits with detailed descriptions and values
            dominant_traits = self._get_dominant_traits_from_persona(enhanced_persona)
            if dominant_traits:
                ecs_text += f"   🎯 Dominant Traits: {', '.join(dominant_traits)}\n"
                ecs_text += "   📊 Trait Analysis:\n"

                trait_descriptions = self._get_trait_descriptions()
                for trait in dominant_traits:
                    description = trait_descriptions.get(trait, "Unique characteristic")
                    trait_value = getattr(enhanced_persona, trait, 0.5)
                    value_indicator = self._get_trait_value_indicator(trait_value)
                    ecs_text += (
                        f"     • {trait.title()}: {description} {value_indicator}\n"
                    )

            # Display communication style
            ecs_text += f"   💬 Communication: {enhanced_persona.communication_style}\n"

            # Display specializations
            if enhanced_persona.specializations:
                ecs_text += f"   🎯 Specializations: {', '.join(enhanced_persona.specializations[:3])}\n"

            # Display behavioral patterns
            if enhanced_persona.behavioral_patterns:
                ecs_text += "   🎭 Behavioral Patterns:\n"
                for pattern in enhanced_persona.behavioral_patterns[:2]:
                    ecs_text += f"     • {pattern}\n"

            # Display roleplay quirks
            if enhanced_persona.roleplay_quirks:
                ecs_text += "   🎪 Roleplay Quirks:\n"
                for quirk in enhanced_persona.roleplay_quirks[:3]:
                    ecs_text += f"     • {quirk}\n"

            # Display backstory elements
            if enhanced_persona.backstory_elements:
                ecs_text += (
                    f"   📖 Backstory: {enhanced_persona.backstory_elements[0]}\n"
                )

            # Display favorite activities
            if enhanced_persona.favorite_activities:
                ecs_text += f"   🎮 Favorite Activities: {', '.join(enhanced_persona.favorite_activities[:3])}\n"

            # Display goals and aspirations
            if enhanced_persona.goals_and_aspirations:
                ecs_text += (
                    f"   🎯 Goals: {enhanced_persona.goals_and_aspirations[0]}\n"
                )

            # Display relationships style
            ecs_text += f"   💕 Relationships: {enhanced_persona.relationships_style}\n"

            # Display work approach
            ecs_text += f"   💼 Work Style: {enhanced_persona.work_approach}\n"

            # Display social preferences
            ecs_text += f"   👥 Social Style: {enhanced_persona.social_preferences}\n"
        else:
            # Fallback to basic persona if enhanced persona not available
            persona = agent_data.get("persona", {})
            if persona:
                personality_summary = persona.get(
                    "personality_summary", "Generated personality"
                )
                ecs_text += f"🎭 Persona: {personality_summary}\n"
            else:
                ecs_text += "🎭 Persona: Generated\n"

        # Display enhanced LoRA configuration
        lora_config = agent_data.get("lora_config", {})
        if lora_config:
            ecs_text += "\n🧠 LoRA Configuration:\n"
            ecs_text += f"   Base Model: {lora_config.get('base_model', 'Unknown')}\n"
            ecs_text += f"   Rank: {lora_config.get('lora_rank', 'N/A')} | Alpha: {lora_config.get('lora_alpha', 'N/A')}\n"
            ecs_text += f"   Target Modules: {', '.join(lora_config.get('target_modules', []))}\n"

            # Display trait weight summary
            personality_weights = lora_config.get("personality_weights", {})
            physical_weights = lora_config.get("physical_weights", {})
            ability_weights = lora_config.get("ability_weights", {})

            if personality_weights:
                ecs_text += (
                    f"   🎭 Personality Traits: {len(personality_weights)} configured\n"
                )
            if physical_weights:
                ecs_text += (
                    f"   💪 Physical Traits: {len(physical_weights)} configured\n"
                )
            if ability_weights:
                ecs_text += f"   ⚡ Abilities: {len(ability_weights)} configured\n"
        else:
            ecs_text += "\n🧠 LoRA: Configured\n"

        # Add gender identity information (if available from ECS memory system)
        gender_info = self._get_gender_identity_info(agent_data)
        if gender_info:
            ecs_text += f"\n👤 Gender Identity: {gender_info}\n"

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
            "size": "Physical stature and presence",
            "strength": "Physical power and endurance",
            "agility": "Speed and dexterity",
            "endurance": "Stamina and resilience",
            "hunter": "Tracking and pursuit abilities",
            "healer": "Healing and restoration skills",
            "scout": "Reconnaissance and exploration",
            "guardian": "Protection and defense capabilities",
        }

    def _get_trait_value(self, agent_data: dict, trait: str) -> float:
        """Get trait value from LoRA configuration."""
        lora_config = agent_data.get("lora_config", {})
        personality_weights = lora_config.get("personality_weights", {})
        physical_weights = lora_config.get("physical_weights", {})
        ability_weights = lora_config.get("ability_weights", {})

        # Check all trait categories
        if trait in personality_weights:
            return float(personality_weights[trait])
        elif trait in physical_weights:
            return float(physical_weights[trait])
        elif trait in ability_weights:
            return float(ability_weights[trait])

        return 0.5  # Default neutral value

    def _get_trait_value_indicator(self, value: float) -> str:
        """Get visual indicator for trait value."""
        if value >= 0.8:
            return "🔥"  # Very high
        elif value >= 0.6:
            return "⭐"  # High
        elif value >= 0.4:
            return "⚡"  # Medium
        elif value >= 0.2:
            return "💫"  # Low
        else:
            return "🌱"  # Very low

    def _get_gender_identity_info(self, agent_data: dict) -> str:  # noqa: ARG002
        """Get gender identity information if available from ECS memory system."""
        # This would integrate with the ECS memory interaction system
        # For now, return a placeholder that could be enhanced
        import random

        # Simulate gender identity generation based on ECS memory system proposal
        gender_identities = [
            "Male (he/him/his)",
            "Female (she/her/hers)",
            "Non-binary (they/them/theirs)",
            "Genderfluid (they/them/theirs)",
            "Agender (they/them/theirs)",
            "Bigender (they/them/theirs)",
            "Demigender (they/them/theirs)",
            "Transgender (they/them/theirs)",
            "Genderqueer (they/them/theirs)",
            "Two-spirit (they/them/theirs)",
            "Prefer not to say (they/them/theirs)",
            "Self-describe (they/them/theirs)",
        ]

        # Weighted distribution favoring common identities
        weights = [
            0.25,
            0.25,
            0.15,
            0.08,
            0.06,
            0.05,
            0.04,
            0.04,
            0.03,
            0.02,
            0.02,
            0.01,
        ]
        selected_identity = random.choices(gender_identities, weights=weights, k=1)[0]

        return selected_identity

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

    def _format_fastapi_ecs_status(self, world_status: dict, agents: list) -> str:
        """Format FastAPI ECS status information."""
        status_text = "🌍 FastAPI ECS World Simulation Status:\n"
        status_text += f"Status: {world_status.get('status', 'unknown')}\n"
        status_text += f"Entity Count: {world_status.get('entity_count', 0)}\n"
        status_text += f"System Count: {world_status.get('system_count', 0)}\n"
        status_text += f"Agent Count: {world_status.get('agent_count', 0)}\n"
        status_text += f"Mature Agents: {world_status.get('mature_agents', 0)}\n"

        if agents:
            status_text += "\n🦁 Active Agents:\n"
            for agent in agents:
                status_text += f"  • {agent.get('name', 'Unknown')} ({agent.get('agent_id', 'Unknown')}) - {agent.get('spirit', 'Unknown')}\n"

        return status_text

    def _get_dominant_traits_from_persona(self, persona: Any) -> List[str]:
        """Get dominant traits from enhanced persona object."""
        if not persona:
            return []

        # Get all personality traits and sort by value
        personality_traits = {
            "dominance": getattr(persona, "dominance", 0.0),
            "loyalty": getattr(persona, "loyalty", 0.0),
            "cunning": getattr(persona, "cunning", 0.0),
            "aggression": getattr(persona, "aggression", 0.0),
            "intelligence": getattr(persona, "intelligence", 0.0),
            "creativity": getattr(persona, "creativity", 0.0),
            "playfulness": getattr(persona, "playfulness", 0.0),
            "protectiveness": getattr(persona, "protectiveness", 0.0),
            "empathy": getattr(persona, "empathy", 0.0),
            "charisma": getattr(persona, "charisma", 0.0),
            "independence": getattr(persona, "independence", 0.0),
            "patience": getattr(persona, "patience", 0.0),
            "curiosity": getattr(persona, "curiosity", 0.0),
            "courage": getattr(persona, "courage", 0.0),
            "determination": getattr(persona, "determination", 0.0),
            "spontaneity": getattr(persona, "spontaneity", 0.0),
        }

        # Sort by value and return top 3
        sorted_traits = sorted(
            personality_traits.items(), key=lambda x: x[1], reverse=True
        )
        return [trait for trait, value in sorted_traits[:3]]

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
