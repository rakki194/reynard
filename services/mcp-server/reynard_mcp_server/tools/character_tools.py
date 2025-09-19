#!/usr/bin/env python3
"""
Character Creation Tools
=======================

MCP tools for character creation and management.
Allows agents to create specific characters with detailed customization.
"""

import json
import logging
from typing import Any

from protocol.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)


class CharacterTools:
    """Tools for character creation and management."""
    
    def __init__(self, tool_registry: ToolRegistry):
        self.tool_registry = tool_registry
        # Import the character manager
        try:
            from reynard_agent_naming.agent_naming.character_manager import CharacterManager
            from reynard_agent_naming.agent_naming.character_schema import (
                CharacterCreationRequest,
                CharacterType,
                CharacterTraits,
                CharacterAppearance,
                CharacterBackground,
                CharacterSkills,
                CharacterPreferences,
                PersonalityTrait,
                PhysicalTrait,
                AbilityTrait
            )
            from reynard_agent_naming.agent_naming.types import AnimalSpirit, NamingScheme, NamingStyle
            
            self.character_manager = CharacterManager()
            self.CharacterCreationRequest = CharacterCreationRequest
            self.CharacterType = CharacterType
            self.CharacterTraits = CharacterTraits
            self.CharacterAppearance = CharacterAppearance
            self.CharacterBackground = CharacterBackground
            self.CharacterSkills = CharacterSkills
            self.CharacterPreferences = CharacterPreferences
            self.PersonalityTrait = PersonalityTrait
            self.PhysicalTrait = PhysicalTrait
            self.AbilityTrait = AbilityTrait
            self.AnimalSpirit = AnimalSpirit
            self.NamingScheme = NamingScheme
            self.NamingStyle = NamingStyle
            
        except ImportError as e:
            logger.warning(f"Failed to import character management modules: {e}")
            self.character_manager = None
    
    async def create_character(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Create a new character with detailed customization options."""
        try:
            if self.character_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Character management system not available. Please check agent naming library installation."
                        }
                    ]
                }
            
            # Extract basic parameters
            character_name = arguments.get("character_name")
            character_type_str = arguments.get("character_type", "agent")
            spirit_str = arguments.get("spirit")
            naming_scheme_str = arguments.get("naming_scheme")
            naming_style_str = arguments.get("naming_style")
            creator_agent_id = arguments.get("creator_agent_id", "unknown-agent")
            
            # Parse character type
            try:
                character_type = self.CharacterType(character_type_str)
            except ValueError:
                character_type = self.CharacterType.AGENT
            
            # Parse spirit
            spirit = None
            if spirit_str:
                try:
                    spirit = self.AnimalSpirit(spirit_str)
                except ValueError:
                    pass
            
            # Parse naming scheme
            naming_scheme = None
            if naming_scheme_str:
                try:
                    naming_scheme = self.NamingScheme(naming_scheme_str)
                except ValueError:
                    pass
            
            # Parse naming style
            naming_style = None
            if naming_style_str:
                try:
                    naming_style = self.NamingStyle(naming_style_str)
                except ValueError:
                    pass
            
            # Create character creation request
            request = self.CharacterCreationRequest(
                character_name=character_name,
                character_type=character_type,
                spirit=spirit,
                naming_scheme=naming_scheme,
                naming_style=naming_style,
                description=arguments.get("description", ""),
                tags=arguments.get("tags", []),
                custom_data=arguments.get("custom_data", {}),
                auto_generate_name=arguments.get("auto_generate_name", True),
                auto_generate_traits=arguments.get("auto_generate_traits", True),
                auto_generate_background=arguments.get("auto_generate_background", True),
                use_weighted_distribution=arguments.get("use_weighted_distribution", True)
            )
            
            # Create the character
            character = self.character_manager.create_character(request, creator_agent_id)
            
            # Format response
            response_text = f"🎭 **Character Created Successfully!**\n\n"
            response_text += f"**Name:** {character.name}\n"
            response_text += f"**ID:** {character.character_id}\n"
            response_text += f"**Type:** {character.character_type.value}\n"
            response_text += f"**Spirit:** {character.spirit.value}\n"
            response_text += f"**Created by:** {character.created_by}\n"
            response_text += f"**Created at:** {character.created_at}\n\n"
            
            if character.description:
                response_text += f"**Description:** {character.description}\n\n"
            
            # Show dominant traits
            dominant_personality = character.traits.get_dominant_personality(3)
            if dominant_personality:
                response_text += f"**Dominant Personality Traits:**\n"
                for trait in dominant_personality:
                    value = character.traits.personality.get(trait, 0.0)
                    response_text += f"• {trait.value}: {value:.2f}\n"
                response_text += "\n"
            
            # Show dominant abilities
            dominant_abilities = character.traits.get_dominant_abilities(3)
            if dominant_abilities:
                response_text += f"**Dominant Abilities:**\n"
                for ability in dominant_abilities:
                    value = character.traits.abilities.get(ability, 0.0)
                    response_text += f"• {ability.value}: {value:.2f}\n"
                response_text += "\n"
            
            # Show appearance
            response_text += f"**Appearance:**\n"
            response_text += f"• Species: {character.appearance.species}\n"
            response_text += f"• Colors: {character.appearance.color_primary}, {character.appearance.color_secondary}\n"
            response_text += f"• Size: {character.appearance.size}\n"
            response_text += f"• Build: {character.appearance.build}\n\n"
            
            # Show background
            if character.background.profession:
                response_text += f"**Background:**\n"
                response_text += f"• Profession: {character.background.profession}\n"
                response_text += f"• Experience: {character.background.experience_level}\n"
                if character.background.specializations:
                    response_text += f"• Specializations: {', '.join(character.background.specializations)}\n"
                response_text += "\n"
            
            # Show preferences
            response_text += f"**Communication Style:** {character.preferences.communication_style}\n"
            response_text += f"**Work Style:** {character.preferences.work_style}\n"
            response_text += f"**Decision Making:** {character.preferences.decision_making}\n"
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": response_text
                    }
                ]
            }
            
        except Exception as e:
            logger.exception("Failed to create character")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error creating character: {e}"
                    }
                ]
            }
    
    async def get_character(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get a character by ID."""
        try:
            if self.character_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Character management system not available."
                        }
                    ]
                }
            
            character_id = arguments.get("character_id")
            if not character_id:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Character ID is required"
                        }
                    ]
                }
            
            character = self.character_manager.get_character(character_id)
            if not character:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Character with ID '{character_id}' not found"
                        }
                    ]
                }
            
            # Format character details
            response_text = f"🎭 **Character Details**\n\n"
            response_text += f"**Name:** {character.name}\n"
            response_text += f"**ID:** {character.character_id}\n"
            response_text += f"**Type:** {character.character_type.value}\n"
            response_text += f"**Spirit:** {character.spirit.value}\n"
            response_text += f"**Created by:** {character.created_by}\n"
            response_text += f"**Created at:** {character.created_at}\n"
            response_text += f"**Last updated:** {character.last_updated}\n\n"
            
            if character.description:
                response_text += f"**Description:** {character.description}\n\n"
            
            # Show traits
            response_text += f"**Personality Traits:**\n"
            for trait, value in character.traits.personality.items():
                response_text += f"• {trait.value}: {value:.2f}\n"
            response_text += "\n"
            
            response_text += f"**Abilities:**\n"
            for ability, value in character.traits.abilities.items():
                response_text += f"• {ability.value}: {value:.2f}\n"
            response_text += "\n"
            
            # Show appearance
            response_text += f"**Appearance:**\n"
            response_text += f"• Species: {character.appearance.species}\n"
            response_text += f"• Colors: {character.appearance.color_primary}, {character.appearance.color_secondary}, {character.appearance.color_accent}\n"
            response_text += f"• Size: {character.appearance.size}\n"
            response_text += f"• Build: {character.appearance.build}\n"
            response_text += f"• Style: {character.appearance.style}\n"
            response_text += f"• Theme: {character.appearance.theme}\n\n"
            
            # Show background
            response_text += f"**Background:**\n"
            response_text += f"• Origin: {character.background.origin}\n"
            response_text += f"• Profession: {character.background.profession}\n"
            response_text += f"• Experience: {character.background.experience_level}\n"
            if character.background.specializations:
                response_text += f"• Specializations: {', '.join(character.background.specializations)}\n"
            if character.background.primary_goal:
                response_text += f"• Primary Goal: {character.background.primary_goal}\n"
            response_text += "\n"
            
            # Show skills
            if character.skills.technical_skills:
                response_text += f"**Technical Skills:**\n"
                for skill, value in character.skills.technical_skills.items():
                    response_text += f"• {skill}: {value:.2f}\n"
                response_text += "\n"
            
            if character.skills.social_skills:
                response_text += f"**Social Skills:**\n"
                for skill, value in character.skills.social_skills.items():
                    response_text += f"• {skill}: {value:.2f}\n"
                response_text += "\n"
            
            # Show preferences
            response_text += f"**Preferences:**\n"
            response_text += f"• Communication: {character.preferences.communication_style}\n"
            response_text += f"• Work Style: {character.preferences.work_style}\n"
            response_text += f"• Decision Making: {character.preferences.decision_making}\n"
            response_text += f"• Social Energy: {character.preferences.social_energy}\n"
            response_text += f"• Group Preference: {character.preferences.group_size_preference}\n"
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": response_text
                    }
                ]
            }
            
        except Exception as e:
            logger.exception("Failed to get character")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting character: {e}"
                    }
                ]
            }
    
    async def list_characters(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """List all characters, optionally filtered by creator."""
        try:
            if self.character_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Character management system not available."
                        }
                    ]
                }
            
            created_by = arguments.get("created_by")
            characters = self.character_manager.list_characters(created_by)
            
            if not characters:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "📝 No characters found" + (f" for creator '{created_by}'" if created_by else "")
                        }
                    ]
                }
            
            response_text = f"🎭 **Characters List** ({len(characters)} total)\n\n"
            
            for character in characters:
                response_text += f"**{character.name}** (ID: {character.character_id})\n"
                response_text += f"• Type: {character.character_type.value}\n"
                response_text += f"• Spirit: {character.spirit.value}\n"
                response_text += f"• Created by: {character.created_by}\n"
                response_text += f"• Created: {character.created_at}\n"
                if character.description:
                    response_text += f"• Description: {character.description[:100]}{'...' if len(character.description) > 100 else ''}\n"
                response_text += "\n"
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": response_text
                    }
                ]
            }
            
        except Exception as e:
            logger.exception("Failed to list characters")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error listing characters: {e}"
                    }
                ]
            }
    
    async def search_characters(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Search characters by name, description, or tags."""
        try:
            if self.character_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Character management system not available."
                        }
                    ]
                }
            
            query = arguments.get("query")
            if not query:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Search query is required"
                        }
                    ]
                }
            
            characters = self.character_manager.search_characters(query)
            
            if not characters:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"🔍 No characters found matching '{query}'"
                        }
                    ]
                }
            
            response_text = f"🔍 **Search Results for '{query}'** ({len(characters)} found)\n\n"
            
            for character in characters:
                response_text += f"**{character.name}** (ID: {character.character_id})\n"
                response_text += f"• Type: {character.character_type.value}\n"
                response_text += f"• Spirit: {character.spirit.value}\n"
                response_text += f"• Created by: {character.created_by}\n"
                if character.description:
                    response_text += f"• Description: {character.description[:100]}{'...' if len(character.description) > 100 else ''}\n"
                response_text += "\n"
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": response_text
                    }
                ]
            }
            
        except Exception as e:
            logger.exception("Failed to search characters")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error searching characters: {e}"
                    }
                ]
            }
    
    async def update_character(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Update a character with new data."""
        try:
            if self.character_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Character management system not available."
                        }
                    ]
                }
            
            character_id = arguments.get("character_id")
            if not character_id:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Character ID is required"
                        }
                    ]
                }
            
            # Extract updates
            updates = {}
            for key, value in arguments.items():
                if key != "character_id" and value is not None:
                    updates[key] = value
            
            if not updates:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ No updates provided"
                        }
                    ]
                }
            
            success = self.character_manager.update_character(character_id, updates)
            
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Character '{character_id}' updated successfully"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Character '{character_id}' not found or update failed"
                        }
                    ]
                }
            
        except Exception as e:
            logger.exception("Failed to update character")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error updating character: {e}"
                    }
                ]
            }
    
    async def delete_character(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Delete a character."""
        try:
            if self.character_manager is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Character management system not available."
                        }
                    ]
                }
            
            character_id = arguments.get("character_id")
            if not character_id:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Character ID is required"
                        }
                    ]
                }
            
            success = self.character_manager.delete_character(character_id)
            
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Character '{character_id}' deleted successfully"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Character '{character_id}' not found or deletion failed"
                        }
                    ]
                }
            
        except Exception as e:
            logger.exception("Failed to delete character")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error deleting character: {e}"
                    }
                ]
            }
    
    async def get_character_types(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get available character types."""
        try:
            if self.CharacterType is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Character type system not available."
                        }
                    ]
                }
            
            types_list = []
            for char_type in self.CharacterType:
                types_list.append(f"• **{char_type.value}**: {char_type.name.replace('_', ' ').title()}")
            
            response_text = f"🎭 **Available Character Types:**\n\n" + "\n".join(types_list)
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": response_text
                    }
                ]
            }
            
        except Exception as e:
            logger.exception("Failed to get character types")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting character types: {e}"
                    }
                ]
            }
    
    async def get_personality_traits(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get available personality traits."""
        try:
            if self.PersonalityTrait is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Personality trait system not available."
                        }
                    ]
                }
            
            traits_list = []
            for trait in self.PersonalityTrait:
                traits_list.append(f"• **{trait.value}**: {trait.name.replace('_', ' ').title()}")
            
            response_text = f"🧠 **Available Personality Traits:**\n\n" + "\n".join(traits_list)
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": response_text
                    }
                ]
            }
            
        except Exception as e:
            logger.exception("Failed to get personality traits")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting personality traits: {e}"
                    }
                ]
            }
    
    async def get_ability_traits(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get available ability traits."""
        try:
            if self.AbilityTrait is None:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": "❌ Ability trait system not available."
                        }
                    ]
                }
            
            abilities_list = []
            for ability in self.AbilityTrait:
                abilities_list.append(f"• **{ability.value}**: {ability.name.replace('_', ' ').title()}")
            
            response_text = f"⚡ **Available Ability Traits:**\n\n" + "\n".join(abilities_list)
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": response_text
                    }
                ]
            }
            
        except Exception as e:
            logger.exception("Failed to get ability traits")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error getting ability traits: {e}"
                    }
                ]
            }
