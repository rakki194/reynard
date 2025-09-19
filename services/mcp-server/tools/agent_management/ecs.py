#!/usr/bin/env python3
"""
ECS Agent Tools
===============

ECS world simulation integration for agent management.
Follows the 140-line axiom and modular architecture principles.
"""

import secrets
from typing import Any, List

import sys
from pathlib import Path

# Add the agent naming package to the path
agent_naming_path = Path(__file__).parent.parent.parent.parent.parent / "services" / "agent-naming" / "reynard_agent_naming"
sys.path.insert(0, str(agent_naming_path))

from agent_naming import (
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
            spirit_str = await self.agent_manager.roll_agent_spirit(weighted=True)
            spirit = AnimalSpirit(spirit_str)

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

        # Create agent with ECS integration using ECS client
        agent_data = await self._create_agent_with_ecs_client(
            agent_id, spirit, preferred_style
        )

        # Generate enhanced persona for detailed roleplay
        try:
            from services.enhanced_persona_service import enhanced_persona_service
            
            enhanced_persona = enhanced_persona_service.generate_enhanced_persona(
                name=agent_data.get("name", "Unknown"),
                spirit=spirit.value,
                style=preferred_style.value,
                agent_id=agent_id
            )
            
            # Add enhanced persona to agent data
            agent_data["enhanced_persona"] = enhanced_persona
            
        except Exception as e:
            print(f"Warning: Could not generate enhanced persona: {e}")
            # Continue without enhanced persona

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
                # Note: ECS components are now accessed through the FastAPI backend
                # via the ECS client, not through direct imports

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

    async def _create_agent_with_ecs_client(
        self, agent_id: str, spirit: AnimalSpirit, style: NamingStyle
    ) -> dict[str, Any]:
        """Create agent using ECS client instead of direct integration."""
        try:
            from services.ecs_client import get_ecs_client
            
            # Get ECS client
            ecs_client = get_ecs_client()
            await ecs_client.start()
            
            # Create agent in ECS world
            ecs_result = await ecs_client.create_agent(
                agent_id=agent_id,
                spirit=spirit.value,
                style=style.value
            )
            
            # Generate name using agent manager
            name = await self.agent_manager.generate_name(spirit.value, style.value)
            self.agent_manager.assign_name(agent_id, name)
            
            # Close ECS client
            await ecs_client.close()
            
            return {
                "agent_id": agent_id,
                "name": name,
                "ecs_available": True,
                "ecs_result": ecs_result,
                "persona": None,  # Could be enhanced with ECS persona data
                "lora_config": None,  # Could be enhanced with ECS LoRA data
            }
            
        except Exception as e:
            # Fallback to basic creation
            name = await self.agent_manager.generate_name(spirit.value, style.value)
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
        self, agent_data: dict, spirit: AnimalSpirit, style: NamingStyle
    ) -> str:
        """Format the enhanced startup response text with detailed information."""
        # Get the correct emoji for the spirit
        spirit_emoji = self._get_spirit_emoji(spirit.value)
        
        # Enhanced startup header with more details
        startup_text = (
            f"🎯 Agent Startup Complete!\n"
            f"{spirit_emoji} Spirit: {spirit.value.title()}\n"
            f"🎨 Style: {style.value.title()}\n"
            f"📛 Name: {agent_data['name']}\n"
            f"🆔 Agent ID: {agent_data.get('agent_id', 'Unknown')}\n"
            f"✅ Assigned: True\n"
        )

        # Add ECS information if available
        if agent_data.get("ecs_available", False):
            startup_text += "\n" + "="*50 + "\n"
            startup_text += "🌍 ECS WORLD SIMULATION\n"
            startup_text += "="*50 + "\n"
            startup_text += self._format_ecs_startup_info(agent_data)
        else:
            startup_text += "\n⚠️  ECS World Simulation: Not Available\n"

        startup_text += "\n" + "="*50 + "\n"
        startup_text += "🔧 Development Environment\n"
        startup_text += "="*50 + "\n"
        startup_text += self._format_version_info()

        return startup_text

    def _format_ecs_startup_info(self, agent_data: dict) -> str:
        """Format ECS-specific startup information with enhanced details."""
        ecs_text = ""

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
                    ecs_text += f"     • {trait.title()}: {description} {value_indicator}\n"

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
                ecs_text += f"   📖 Backstory: {enhanced_persona.backstory_elements[0]}\n"

            # Display favorite activities
            if enhanced_persona.favorite_activities:
                ecs_text += f"   🎮 Favorite Activities: {', '.join(enhanced_persona.favorite_activities[:3])}\n"

            # Display goals and aspirations
            if enhanced_persona.goals_and_aspirations:
                ecs_text += f"   🎯 Goals: {enhanced_persona.goals_and_aspirations[0]}\n"

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
                personality_summary = persona.get('personality_summary', 'Generated personality')
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
            personality_weights = lora_config.get('personality_weights', {})
            physical_weights = lora_config.get('physical_weights', {})
            ability_weights = lora_config.get('ability_weights', {})
            
            if personality_weights:
                ecs_text += f"   🎭 Personality Traits: {len(personality_weights)} configured\n"
            if physical_weights:
                ecs_text += f"   💪 Physical Traits: {len(physical_weights)} configured\n"
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
        personality_weights = lora_config.get('personality_weights', {})
        physical_weights = lora_config.get('physical_weights', {})
        ability_weights = lora_config.get('ability_weights', {})
        
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
            "Self-describe (they/them/theirs)"
        ]
        
        # Weighted distribution favoring common identities
        weights = [0.25, 0.25, 0.15, 0.08, 0.06, 0.05, 0.04, 0.04, 0.03, 0.02, 0.02, 0.01]
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
            "spontaneity": getattr(persona, "spontaneity", 0.0)
        }
        
        # Sort by value and return top 3
        sorted_traits = sorted(personality_traits.items(), key=lambda x: x[1], reverse=True)
        return [trait for trait, value in sorted_traits[:3]]
