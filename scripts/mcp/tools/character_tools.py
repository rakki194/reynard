#!/usr/bin/env python3
"""
Character Creation Tools
=======================

MCP tools for character creation and management.
Now uses the new @register_tool decorator system for automatic registration.

Allows agents to create specific characters with detailed customization.
"""

import json
import logging
from typing import Any

from protocol.tool_registry import register_tool

logger = logging.getLogger(__name__)


@register_tool(
    name="create_character",
    category="character",
    description="Create a new character with detailed customization",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def create_character(**kwargs) -> dict[str, Any]:
    """Create a new character with detailed customization options."""
    try:
        # Import the character manager
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
        
        character_manager = CharacterManager()
        arguments = kwargs.get("arguments", {})
        
        # Extract basic parameters
        character_name = arguments.get("character_name")
        character_type_str = arguments.get("character_type", "agent")
        spirit_str = arguments.get("spirit")
        naming_scheme_str = arguments.get("naming_scheme")
        naming_style_str = arguments.get("naming_style")
        creator_agent_id = arguments.get("creator_agent_id", "unknown-agent")
        
        # Parse character type
        try:
            character_type = CharacterType(character_type_str)
        except ValueError:
            character_type = CharacterType.AGENT
        
        # Parse spirit
        spirit = None
        if spirit_str:
            try:
                spirit = AnimalSpirit(spirit_str)
            except ValueError:
                pass
        
        # Parse naming scheme
        naming_scheme = None
        if naming_scheme_str:
            try:
                naming_scheme = NamingScheme(naming_scheme_str)
            except ValueError:
                pass
        
        # Parse naming style
        naming_style = None
        if naming_style_str:
            try:
                naming_style = NamingStyle(naming_style_str)
            except ValueError:
                pass
        
        # Create character request
        character_request = CharacterCreationRequest(
            character_name=character_name,
            character_type=character_type,
            spirit=spirit,
            naming_scheme=naming_scheme,
            naming_style=naming_style
        )
        
        # Create the character
        character = character_manager.create_character(character_request, creator_agent_id)
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"✅ Character created successfully!\n\n{json.dumps(character.to_dict(), indent=2)}"
                }
            ]
        }
        
    except ImportError as e:
        logger.warning(f"Failed to import character management modules: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Character management system not available. Please check agent naming library installation."
                }
            ]
        }
    except Exception as e:
        logger.exception("Error creating character: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error creating character: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_character",
    category="character",
    description="Get detailed character information by ID",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def get_character(**kwargs) -> dict[str, Any]:
    """Get detailed character information by ID."""
    try:
        from reynard_agent_naming.agent_naming.character_manager import CharacterManager
        
        character_manager = CharacterManager()
        arguments = kwargs.get("arguments", {})
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
        
        character = await character_manager.get_character(character_id)
        
        if character:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"📋 Character Information:\n\n{json.dumps(character.to_dict(), indent=2)}"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Character with ID '{character_id}' not found"
                    }
                ]
            }
        
    except ImportError as e:
        logger.warning(f"Failed to import character management modules: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Character management system not available. Please check agent naming library installation."
                }
            ]
        }
    except Exception as e:
        logger.exception("Error getting character: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting character: {e!s}"
                }
            ]
        }


@register_tool(
    name="list_characters",
    category="character",
    description="List all characters with optional filtering",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def list_characters(**kwargs) -> dict[str, Any]:
    """List all characters with optional filtering."""
    try:
        from reynard_agent_naming.agent_naming.character_manager import CharacterManager
        
        character_manager = CharacterManager()
        arguments = kwargs.get("arguments", {})
        character_type = arguments.get("character_type")
        limit = arguments.get("limit", 50)
        
        characters = await character_manager.list_characters(
            character_type=character_type,
            limit=limit
        )
        
        if characters:
            character_list = "\n".join([
                f"• {char.character_name} ({char.character_type.value}) - ID: {char.character_id}"
                for char in characters
            ])
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"📋 Characters ({len(characters)} found):\n\n{character_list}"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "📋 No characters found"
                    }
                ]
            }
        
    except ImportError as e:
        logger.warning(f"Failed to import character management modules: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Character management system not available. Please check agent naming library installation."
                }
            ]
        }
    except Exception as e:
        logger.exception("Error listing characters: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error listing characters: {e!s}"
                }
            ]
        }


@register_tool(
    name="search_characters",
    category="character",
    description="Search characters by name, description, or tags",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def search_characters(**kwargs) -> dict[str, Any]:
    """Search characters by name, description, or tags."""
    try:
        from reynard_agent_naming.agent_naming.character_manager import CharacterManager
        
        character_manager = CharacterManager()
        arguments = kwargs.get("arguments", {})
        query = arguments.get("query")
        character_type = arguments.get("character_type")
        limit = arguments.get("limit", 20)
        
        if not query:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Search query is required"
                    }
                ]
            }
        
        characters = await character_manager.search_characters(
            query=query,
            character_type=character_type,
            limit=limit
        )
        
        if characters:
            character_list = "\n".join([
                f"• {char.character_name} ({char.character_type.value}) - ID: {char.character_id}"
                for char in characters
            ])
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"🔍 Search Results for '{query}' ({len(characters)} found):\n\n{character_list}"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"🔍 No characters found matching '{query}'"
                    }
                ]
            }
        
    except ImportError as e:
        logger.warning(f"Failed to import character management modules: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Character management system not available. Please check agent naming library installation."
                }
            ]
        }
    except Exception as e:
        logger.exception("Error searching characters: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error searching characters: {e!s}"
                }
            ]
        }


@register_tool(
    name="update_character",
    category="character",
    description="Update character information",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def update_character(**kwargs) -> dict[str, Any]:
    """Update character information."""
    try:
        from reynard_agent_naming.agent_naming.character_manager import CharacterManager
        
        character_manager = CharacterManager()
        arguments = kwargs.get("arguments", {})
        character_id = arguments.get("character_id")
        updates = arguments.get("updates", {})
        
        if not character_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Character ID is required"
                    }
                ]
            }
        
        character = await character_manager.update_character(character_id, updates)
        
        if character:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Character updated successfully!\n\n{json.dumps(character.to_dict(), indent=2)}"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Character with ID '{character_id}' not found"
                    }
                ]
            }
        
    except ImportError as e:
        logger.warning(f"Failed to import character management modules: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Character management system not available. Please check agent naming library installation."
                }
            ]
        }
    except Exception as e:
        logger.exception("Error updating character: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error updating character: {e!s}"
                }
            ]
        }


@register_tool(
    name="delete_character",
    category="character",
    description="Delete a character by ID",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def delete_character(**kwargs) -> dict[str, Any]:
    """Delete a character by ID."""
    try:
        from reynard_agent_naming.agent_naming.character_manager import CharacterManager
        
        character_manager = CharacterManager()
        arguments = kwargs.get("arguments", {})
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
        
        success = await character_manager.delete_character(character_id)
        
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
                        "text": f"❌ Character with ID '{character_id}' not found"
                    }
                ]
            }
        
    except ImportError as e:
        logger.warning(f"Failed to import character management modules: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Character management system not available. Please check agent naming library installation."
                }
            ]
        }
    except Exception as e:
        logger.exception("Error deleting character: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error deleting character: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_character_types",
    category="character",
    description="Get available character types",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def get_character_types(**kwargs) -> dict[str, Any]:
    """Get available character types."""
    try:
        from reynard_agent_naming.agent_naming.character_schema import CharacterType
        
        character_types = [ct.value for ct in CharacterType]
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"📋 Available Character Types:\n\n" + "\n".join([f"• {ct}" for ct in character_types])
                }
            ]
        }
        
    except ImportError as e:
        logger.warning(f"Failed to import character management modules: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Character management system not available. Please check agent naming library installation."
                }
            ]
        }
    except Exception as e:
        logger.exception("Error getting character types: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting character types: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_personality_traits",
    category="character",
    description="Get available personality traits",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def get_personality_traits(**kwargs) -> dict[str, Any]:
    """Get available personality traits."""
    try:
        from reynard_agent_naming.agent_naming.character_schema import PersonalityTrait
        
        traits = [pt.value for pt in PersonalityTrait]
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"📋 Available Personality Traits:\n\n" + "\n".join([f"• {t}" for t in traits])
                }
            ]
        }
        
    except ImportError as e:
        logger.warning(f"Failed to import character management modules: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Character management system not available. Please check agent naming library installation."
                }
            ]
        }
    except Exception as e:
        logger.exception("Error getting personality traits: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting personality traits: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_ability_traits",
    category="character",
    description="Get available ability traits",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def get_ability_traits(**kwargs) -> dict[str, Any]:
    """Get available ability traits."""
    try:
        from reynard_agent_naming.agent_naming.character_schema import AbilityTrait
        
        traits = [at.value for at in AbilityTrait]
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"📋 Available Ability Traits:\n\n" + "\n".join([f"• {t}" for t in traits])
                }
            ]
        }
        
    except ImportError as e:
        logger.warning(f"Failed to import character management modules: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": "❌ Character management system not available. Please check agent naming library installation."
                }
            ]
        }
    except Exception as e:
        logger.exception("Error getting ability traits: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting ability traits: {e!s}"
                }
            ]
        }