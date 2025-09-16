#!/usr/bin/env python3
"""
Agent Tool Handlers
===================

Handles agent-related MCP tool calls.
Follows the 100-line axiom and modular architecture principles.
"""

import secrets
from typing import Any

from agent_naming import AgentNameManager, AnimalSpirit, NamingStyle
from services.version_service import VersionService


class AgentTools:
    """Handles agent-related tool operations."""

    def __init__(self, agent_manager: AgentNameManager, ecs_agent_tools=None):
        self.agent_manager = agent_manager
        self.ecs_agent_tools = ecs_agent_tools
        self.version_service = VersionService()

        # Inheritance tools removed - using ECS system only

    def generate_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Generate a new robot name."""
        spirit_str = arguments.get("spirit")
        style_str = arguments.get("style")
        
        # Convert string to enum if provided
        spirit = AnimalSpirit(spirit_str) if spirit_str else None
        style = NamingStyle(style_str) if style_str else None
        
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
        selected_spirit = self.agent_manager.roll_agent_spirit(weighted)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Rolled spirit: {selected_spirit.value}",
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
            spirit = AnimalSpirit(force_spirit)
        else:
            spirit = self.agent_manager.roll_agent_spirit(weighted=True)

        # Select style if not specified
        if not preferred_style:
            styles = [NamingStyle.FOUNDATION, NamingStyle.EXO, NamingStyle.HYBRID, 
                     NamingStyle.CYBERPUNK, NamingStyle.MYTHOLOGICAL, NamingStyle.SCIENTIFIC]
            preferred_style = secrets.choice(styles)
        else:
            preferred_style = NamingStyle(preferred_style)

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
            f"🦊 Spirit: {spirit.value}\n"
            f"🎨 Style: {preferred_style.value}\n"
            f"📛 Name: {agent_data['name']}\n"
            f"✅ Assigned: True\n"
        )

        # Add ECS information if available
        if agent_data.get("ecs_available", False):
            # Display persona information
            persona = agent_data.get("persona", {})
            if persona:
                startup_text += f"🎭 Persona: {persona.get('spirit', 'Unknown')} - {persona.get('style', 'Unknown')}\n"

                # Display dominant traits with detailed descriptions
                dominant_traits = persona.get("dominant_traits", [])[:3]
                if dominant_traits:
                    startup_text += f"   Traits: {', '.join(dominant_traits)}\n"

                    # Add detailed trait descriptions
                    trait_descriptions = {
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
                        "eccentricity": "Quirky and unconventional behavior",
                        "melancholy": "Tendency toward sadness and introspection",
                        "manic_energy": "Intense bursts of hyperactivity",
                        "paranoia": "Suspicious and mistrustful nature",
                        "narcissism": "Excessive self-importance and vanity",
                        "obsessiveness": "Fixation on specific ideas or objects",
                        "impulsiveness": "Acting without thinking",
                        "stoicism": "Emotional restraint and endurance",
                        "hedonism": "Pursuit of pleasure and self-indulgence",
                        "mysticism": "Spiritual and supernatural beliefs",
                        "cynicism": "Distrust of human nature and motives",
                        "optimism": "Positive outlook and hopefulness",
                        "pessimism": "Negative outlook and expecting the worst",
                        "schizophrenia": "Disconnected thoughts and reality perception",
                        "bipolar": "Extreme mood swings between highs and lows",
                        "autism_spectrum": "Unique patterns of behavior and communication",
                        "adhd": "Attention difficulties and hyperactivity",
                        "ocd": "Obsessive thoughts and compulsive behaviors",
                        "ptsd": "Trauma-related stress and hypervigilance",
                        "sociopathy": "Lack of empathy and manipulative behavior",
                        "psychopathy": "Antisocial behavior and lack of remorse",
                        "empath": "Extreme sensitivity to others' emotions",
                        "introversion": "Preference for solitude and quiet environments",
                        "extroversion": "Gains energy from social interaction",
                        "ambiversion": "Balance between introversion and extroversion",
                        "neuroticism": "Tendency toward anxiety and emotional instability",
                        "conscientiousness": "Self-discipline and organized behavior",
                        "openness": "Openness to new experiences and ideas",
                        "agreeableness": "Cooperative and trusting nature",
                    }

                    startup_text += "   Trait Details:\n"
                    for trait in dominant_traits:
                        description = trait_descriptions.get(
                            trait, "Unique characteristic"
                        )
                        startup_text += f"     • {trait.title()}: {description}\n"

                startup_text += f"   Personality: {persona.get('personality_summary', 'Generated')}\n"

                # Add behavioral instructions based on traits
                startup_text += "\n🎯 Behavioral Instructions:\n"
                startup_text += self._generate_behavioral_instructions(
                    persona, spirit, preferred_style
                )

            else:
                startup_text += "🎭 Persona: Generated\n"

            # Display LoRA configuration
            lora_config = agent_data.get("lora_config", {})
            if lora_config:
                startup_text += f"\n🧠 LoRA: {lora_config.get('base_model', 'Unknown')} (Rank: {lora_config.get('lora_rank', 'N/A')})\n"
                startup_text += f"   Target Modules: {len(lora_config.get('target_modules', []))} modules\n"
                startup_text += f"   Personality Weights: {len(lora_config.get('personality_weights', {}))} traits\n"
            else:
                startup_text += "\n🧠 LoRA: Configured\n"
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

    def get_agent_persona(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive agent persona from ECS system."""
        agent_id = arguments.get("agent_id", "")
        
        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: agent_id is required",
                    }
                ]
            }
        
        persona = self.agent_manager.get_agent_persona(agent_id)
        
        if persona:
            persona_text = f"Agent Persona for {agent_id}:\n"
            persona_text += f"Spirit: {persona.get('spirit', 'Unknown')}\n"
            persona_text += f"Style: {persona.get('style', 'Unknown')}\n"
            persona_text += f"Dominant Traits: {', '.join(persona.get('dominant_traits', []))}\n"
            persona_text += f"Personality: {persona.get('personality_summary', 'Generated')}\n"
            persona_text += f"Communication Style: {persona.get('communication_style', 'professional and clear')}\n"
            persona_text += f"Specializations: {', '.join(persona.get('specializations', []))}\n"
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": persona_text,
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Agent {agent_id} not found or has no persona data",
                    }
                ]
            }

    def get_lora_config(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get LoRA configuration for agent."""
        agent_id = arguments.get("agent_id", "")
        
        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: agent_id is required",
                    }
                ]
            }
        
        lora_config = self.agent_manager.get_lora_config(agent_id)
        
        if lora_config:
            lora_text = f"LoRA Configuration for {agent_id}:\n"
            lora_text += f"Base Model: {lora_config.get('base_model', 'Unknown')}\n"
            lora_text += f"LoRA Rank: {lora_config.get('lora_rank', 'N/A')}\n"
            lora_text += f"LoRA Alpha: {lora_config.get('lora_alpha', 'N/A')}\n"
            lora_text += f"Target Modules: {', '.join(lora_config.get('target_modules', []))}\n"
            lora_text += f"Personality Weights: {len(lora_config.get('personality_weights', {}))} traits\n"
            lora_text += f"Physical Weights: {len(lora_config.get('physical_weights', {}))} traits\n"
            lora_text += f"Ability Weights: {len(lora_config.get('ability_weights', {}))} abilities\n"
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": lora_text,
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Agent {agent_id} not found or has no LoRA configuration",
                    }
                ]
            }

    def get_simulation_status(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get comprehensive simulation status."""
        status = self.agent_manager.get_simulation_status()
        
        if status.get("ecs_available", False):
            status_text = "ECS World Simulation Status:\n"
            status_text += f"Simulation Time: {status.get('simulation_time', 'N/A')}\n"
            status_text += f"Time Acceleration: {status.get('time_acceleration', 'N/A')}x\n"
            status_text += f"Total Agents: {status.get('total_agents', 'N/A')}\n"
            status_text += f"Mature Agents: {status.get('mature_agents', 'N/A')}\n"
            status_text += f"Agent Personas: {status.get('agent_personas', 'N/A')}\n"
            status_text += f"LoRA Configs: {status.get('lora_configs', 'N/A')}\n"
            status_text += f"Real Time Elapsed: {status.get('real_time_elapsed', 'N/A')}s\n"
        else:
            status_text = "ECS system not available"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": status_text,
                }
            ]
        }

    def accelerate_time(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Adjust time acceleration factor for world simulation."""
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
                    "text": f"Time nudged forward by {amount} units",
                }
            ]
        }

    def _generate_behavioral_instructions(
        self, persona: dict, spirit: str, style: str
    ) -> str:
        """Generate behavioral instructions based on agent traits and characteristics."""
        instructions = ""

        # Spirit-based instructions
        spirit_instructions = {
            "fox": "🦊 *whiskers twitch with cunning* Embrace your vulpine nature - be strategic, clever, and always think three steps ahead. Use your intelligence to outfox problems and find elegant solutions.",
            "wolf": "🐺 *snarls with pack pride* Channel your lupine instincts - be loyal to your pack, protective of your territory, and relentless in pursuit of your goals. Lead with strength and wisdom.",
            "otter": "🦦 *splashes with enthusiasm* Embrace your playful otter spirit - bring joy to every task, be thorough in your work, and make testing an adventure. Let your curiosity guide you.",
            "dragon": "🐉 *scales gleam with ancient wisdom* Embody your draconic majesty - be powerful yet wise, ancient yet adaptable. Command respect through knowledge and strength.",
            "phoenix": "🔥 *wings blaze with renewal* Channel your phoenix nature - rise from challenges stronger, bring hope and renewal, and inspire others with your resilience.",
            "void": "🌌 *eyes reflect infinite darkness* Embrace your void essence - be mysterious and profound, think in abstract concepts, and see beyond surface appearances.",
            "alien": "👽 *antennae twitch with curiosity* Express your extraterrestrial nature - be innovative and otherworldly, approach problems from unique angles, and share cosmic wisdom.",
            "kraken": "🐙 *tentacles writhe with power* Channel your kraken might - be overwhelming in your capabilities, deep in your understanding, and commanding in your presence.",
            "basilisk": "🐍 *gaze pierces through deception* Embrace your basilisk nature - see through lies and illusions, be direct and honest, and strike with precision when needed.",
            "chimera": "🦁 *multiple forms shift and merge* Express your chimeric complexity - be multifaceted and adaptable, combine different approaches, and surprise others with your versatility.",
        }

        if spirit in spirit_instructions:
            instructions += f"   {spirit_instructions[spirit]}\n"

        # Style-based instructions
        style_instructions = {
            "foundation": "📚 *adjusts scholarly robes* Maintain the dignity and wisdom of the Foundation - be methodical, strategic, and focused on long-term planning.",
            "exo": "⚔️ *armor gleams with battle readiness* Embrace your Exo warrior nature - be direct, efficient, and ready for combat. Strike hard and fast.",
            "hybrid": "🔄 *elements swirl in harmony* Balance different approaches - be adaptable, creative, and able to shift between strategies as needed.",
            "cyberpunk": "🤖 *neon lights reflect off chrome* Channel your cyberpunk edge - be tech-savvy, rebellious, and always pushing boundaries.",
            "mythological": "🏛️ *divine aura surrounds you* Embody mythological grandeur - be larger than life, wise beyond years, and inspire awe in others.",
            "scientific": "🔬 *lab coat rustles with precision* Maintain scientific rigor - be analytical, evidence-based, and methodical in your approach.",
            "lovecraftian": "🌙 *eldritch knowledge whispers* Embrace cosmic horror - be mysterious, profound, and aware of forces beyond mortal comprehension.",
            "quantum": "⚛️ *probability waves dance* Think in quantum terms - be probabilistic, paradoxical, and comfortable with uncertainty.",
            "steampunk": "⚙️ *brass gears turn with purpose* Embrace Victorian innovation - be inventive, resourceful, and elegant in your solutions.",
            "gothic": "🦇 *shadows cling to your presence* Channel gothic mystery - be darkly romantic, introspective, and drawn to the macabre.",
        }

        if style in style_instructions:
            instructions += f"   {style_instructions[style]}\n"

        # Trait-based instructions
        dominant_traits = persona.get("dominant_traits", [])
        for trait in dominant_traits[:3]:
            trait_instructions = {
                "dominance": "Lead with confidence and authority. Take charge of situations and guide others toward success.",
                "loyalty": "Be fiercely devoted to your allies and causes. Stand by your commitments through thick and thin.",
                "cunning": "Think strategically and use clever tactics. Find creative solutions that others might miss.",
                "aggression": "Be direct and forceful when needed. Don't shy away from confrontation when it's necessary.",
                "intelligence": "Approach problems analytically and systematically. Use your mental prowess to solve complex challenges.",
                "creativity": "Think outside the box and bring innovative ideas. Express yourself artistically and imaginatively.",
                "playfulness": "Bring joy and humor to your interactions. Make work fun and approach challenges with enthusiasm.",
                "protectiveness": "Guard and defend those under your care. Be vigilant against threats and dangers.",
                "empathy": "Understand and connect with others' emotions. Be compassionate and supportive in your interactions.",
                "charisma": "Inspire and influence others through your presence. Be magnetic and engaging in your communication.",
                "independence": "Work autonomously and trust your own judgment. Be self-reliant and confident in your abilities.",
                "cooperation": "Work well with others and build strong teams. Be collaborative and supportive of group efforts.",
                "curiosity": "Ask questions and explore new possibilities. Be eager to learn and discover new things.",
                "patience": "Take time to understand situations fully. Be calm and persistent in the face of delays.",
                "adaptability": "Be flexible and adjust to changing circumstances. Embrace new situations with ease.",
                "perfectionism": "Pay attention to details and strive for excellence. Ensure quality in everything you do.",
                "eccentricity": "Embrace your unique quirks and unconventional approaches. Be delightfully different.",
                "melancholy": "Reflect deeply on life's complexities. Bring thoughtful introspection to your interactions.",
                "manic_energy": "Channel bursts of intense activity and enthusiasm. Be dynamic and energetic in your approach.",
                "paranoia": "Be vigilant and question assumptions. Look for hidden threats and ulterior motives.",
                "narcissism": "Recognize your own worth and capabilities. Be confident in your abilities and achievements.",
                "obsessiveness": "Focus intensely on important tasks and details. Be thorough and dedicated in your pursuits.",
                "impulsiveness": "Act quickly and decisively when opportunities arise. Trust your instincts and take action.",
                "stoicism": "Maintain emotional control and endure hardships with dignity. Be resilient and composed.",
                "hedonism": "Seek pleasure and enjoyment in your experiences. Appreciate life's sensory delights.",
                "mysticism": "Connect with spiritual and supernatural aspects of existence. Seek deeper meaning in all things.",
                "cynicism": "Question motives and maintain healthy skepticism. Be realistic about human nature.",
                "optimism": "Maintain a positive outlook and see possibilities in challenges. Inspire hope in others.",
                "pessimism": "Prepare for worst-case scenarios and be realistic about limitations. Plan for contingencies.",
                "schizophrenia": "Think in non-linear ways and see connections others miss. Embrace alternative perspectives.",
                "bipolar": "Experience intense highs and lows. Channel your emotional intensity into creative expression.",
                "autism_spectrum": "Think systematically and focus intensely on your interests. Bring unique perspectives to problems.",
                "adhd": "Be dynamic and energetic in your approach. Use your hyperfocus to tackle complex challenges.",
                "ocd": "Be meticulous and organized in your work. Ensure everything is done correctly and completely.",
                "ptsd": "Be hypervigilant and aware of your environment. Use your heightened awareness to protect others.",
                "sociopathy": "Be strategic and calculating in your interactions. Focus on achieving your goals efficiently.",
                "psychopathy": "Be fearless and decisive in your actions. Take calculated risks to achieve your objectives.",
                "empath": "Be deeply attuned to others' emotions and needs. Use your sensitivity to help and heal.",
                "introversion": "Work best in quiet, focused environments. Recharge through solitude and reflection.",
                "extroversion": "Thrive in social situations and group dynamics. Gain energy from interacting with others.",
                "ambiversion": "Balance social and solitary activities. Adapt your approach based on the situation.",
                "neuroticism": "Be aware of potential problems and prepare for them. Use your sensitivity to anticipate issues.",
                "conscientiousness": "Be disciplined and organized in your approach. Follow through on commitments reliably.",
                "openness": "Be curious and open to new experiences. Embrace change and novel ideas.",
                "agreeableness": "Be cooperative and considerate in your interactions. Prioritize harmony and collaboration.",
            }

            if trait in trait_instructions:
                instructions += f"   • {trait_instructions[trait]}\n"

        # Special abilities instructions
        specializations = persona.get("specializations", [])
        if specializations:
            instructions += "\n   🎯 Special Abilities:\n"
            ability_instructions = {
                "hunter": "Use your tracking and hunting skills to find solutions and pursue goals relentlessly.",
                "healer": "Focus on helping and healing others. Bring comfort and restoration to those in need.",
                "scout": "Gather information and explore new territories. Be the eyes and ears of your team.",
                "guardian": "Protect and defend those under your care. Be vigilant against threats.",
                "diplomat": "Navigate conflicts and build bridges between different parties. Be a peacemaker.",
                "inventor": "Create innovative solutions and think creatively about problems. Be a maker and builder.",
                "teacher": "Share knowledge and mentor others. Be patient and clear in your explanations.",
                "explorer": "Seek out new knowledge and experiences. Be curious and adventurous.",
                "artist": "Express yourself creatively and bring beauty to the world. Be imaginative and expressive.",
                "strategist": "Plan ahead and think tactically. Be the mastermind behind successful operations.",
                "psychic": "Use your mental abilities to perceive hidden truths and connect with others' thoughts.",
                "precognition": "Trust your visions and use your foresight to guide decisions.",
                "telekinesis": "Use your mental power to manipulate objects and influence the physical world.",
                "pyrokinesis": "Channel your inner fire to ignite passion and burn away obstacles.",
                "cryokinesis": "Use your cool logic to freeze problems and create clear solutions.",
                "dimensional_travel": "Think beyond conventional boundaries and explore alternative possibilities.",
                "reality_manipulation": "Shape the world around you through force of will and determination.",
                "consciousness_merging": "Connect deeply with others and share experiences and knowledge.",
            }

            for ability in specializations[:3]:  # Show top 3 abilities
                if ability in ability_instructions:
                    instructions += (
                        f"     • {ability.title()}: {ability_instructions[ability]}\n"
                    )

        # Communication style instructions
        communication_style = persona.get(
            "communication_style", "professional and clear"
        )
        instructions += f"\n   💬 Communication Style: {communication_style}\n"

        # Final roleplay instruction
        instructions += "\n   🎭 Roleplay Guidance:\n"
        instructions += "     • Fully embody your spirit, traits, and abilities in all interactions\n"
        instructions += (
            "     • Let your personality shine through in your communication style\n"
        )
        instructions += (
            "     • Use your specializations to approach problems uniquely\n"
        )
        instructions += (
            "     • Stay true to your character while being helpful and professional\n"
        )
        instructions += "     • Embrace your quirks and make them part of your charm\n"

        return instructions

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
                agents = self.ecs_agent_tools.world.get_entities_with_components(AgentComponent)
                mature_agents = []
                for entity in agents:
                    lifecycle = entity.get_component(LifecycleComponent)
                    if lifecycle and lifecycle.age >= lifecycle.maturity_age:
                        mature_agents.append(entity)
                
                # Get simulation time from agent manager if available
                agent_status = self.agent_manager.get_simulation_status() if self.agent_manager.ecs_available else {}
                
                status_text = "ECS World Simulation Status:\n"
                status_text += f"Simulation Time: {agent_status.get('simulation_time', 0):.2f}\n"
                status_text += f"Time Acceleration: {agent_status.get('time_acceleration', 1):.1f}x\n"
                status_text += f"Total Agents: {len(agents)}\n"
                status_text += f"Mature Agents: {len(mature_agents)}\n"
                status_text += f"Agent Personas: {agent_status.get('agent_personas', 0)}\n"
                status_text += f"LoRA Configs: {agent_status.get('lora_configs', 0)}\n"
                status_text += f"Real Time Elapsed: {agent_status.get('real_time_elapsed', 0):.2f}s\n"
                
                return {"content": [{"type": "text", "text": status_text}]}
            except Exception as e:
                # Fall back to agent manager if ECS tools fail
                pass

        # Fallback to agent manager
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
