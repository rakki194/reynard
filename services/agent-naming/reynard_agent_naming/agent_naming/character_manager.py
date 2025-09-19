"""
Character Manager
================

Manages character creation, storage, and retrieval for the agent naming system.
Provides comprehensive character management with persistence and ECS integration.
"""

import json
import logging
import random
import secrets
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from .character_schema import (
    AbilityTrait,
    Character,
    CharacterAppearance,
    CharacterBackground,
    CharacterCreationRequest,
    CharacterPreferences,
    CharacterSkills,
    CharacterTraits,
    CharacterType,
    PersonalityTrait,
    PhysicalTrait,
)
from .dynamic_config import DynamicConfigManager
from .manager import AgentNameManager
from .types import AnimalSpirit, NamingScheme, NamingStyle

logger = logging.getLogger(__name__)


class CharacterManager:
    """Manages character creation and storage."""
    
    def __init__(self, data_dir: Optional[Path] = None):
        """Initialize the character manager."""
        if data_dir is None:
            self.data_dir = Path(__file__).parent.parent / "data"
        else:
            self.data_dir = Path(data_dir)
        
        self.characters_file = self.data_dir / "characters.json"
        self.agent_manager = AgentNameManager(data_dir)
        self.config_manager = DynamicConfigManager(data_dir)
        
        self._characters: Dict[str, Character] = {}
        self._load_characters()
    
    def _load_characters(self) -> None:
        """Load characters from storage."""
        if self.characters_file.exists():
            try:
                with self.characters_file.open(encoding="utf-8") as f:
                    data = json.load(f)
                
                for char_id, char_data in data.items():
                    self._characters[char_id] = self._parse_character(char_data)
                
                logger.info(f"Loaded {len(self._characters)} characters from {self.characters_file}")
            except Exception as e:
                logger.warning(f"Failed to load characters from {self.characters_file}: {e}")
        else:
            logger.info("No characters file found, starting with empty character store")
    
    def _save_characters(self) -> None:
        """Save characters to storage."""
        try:
            # Ensure data directory exists
            self.data_dir.mkdir(parents=True, exist_ok=True)
            
            # Convert characters to serializable format
            data = {}
            for char_id, character in self._characters.items():
                data[char_id] = character.to_dict()
            
            with self.characters_file.open("w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
            logger.info(f"Saved {len(self._characters)} characters to {self.characters_file}")
        except Exception as e:
            logger.error(f"Failed to save characters to {self.characters_file}: {e}")
    
    def _parse_character(self, data: Dict[str, Any]) -> Character:
        """Parse character data from dictionary."""
        # Parse traits
        traits_data = data.get("traits", {})
        traits = CharacterTraits(
            personality={
                PersonalityTrait(trait): value 
                for trait, value in traits_data.get("personality", {}).items()
            },
            physical={
                PhysicalTrait(trait): value 
                for trait, value in traits_data.get("physical", {}).items()
            },
            abilities={
                AbilityTrait(ability): value 
                for ability, value in traits_data.get("abilities", {}).items()
            }
        )
        
        # Parse appearance
        appearance_data = data.get("appearance", {})
        appearance = CharacterAppearance(
            species=appearance_data.get("species", ""),
            color_primary=appearance_data.get("color_primary", ""),
            color_secondary=appearance_data.get("color_secondary", ""),
            color_accent=appearance_data.get("color_accent", ""),
            size=appearance_data.get("size", "medium"),
            build=appearance_data.get("build", "average"),
            markings=appearance_data.get("markings", []),
            accessories=appearance_data.get("accessories", []),
            equipment=appearance_data.get("equipment", []),
            style=appearance_data.get("style", "casual"),
            theme=appearance_data.get("theme", "neutral")
        )
        
        # Parse background
        background_data = data.get("background", {})
        background = CharacterBackground(
            origin=background_data.get("origin", ""),
            birthplace=background_data.get("birthplace", ""),
            upbringing=background_data.get("upbringing", ""),
            education=background_data.get("education", ""),
            profession=background_data.get("profession", ""),
            experience_level=background_data.get("experience_level", "intermediate"),
            specializations=background_data.get("specializations", []),
            family=background_data.get("family", ""),
            relationships=background_data.get("relationships", []),
            affiliations=background_data.get("affiliations", []),
            primary_goal=background_data.get("primary_goal", ""),
            secondary_goals=background_data.get("secondary_goals", []),
            motivations=background_data.get("motivations", []),
            defining_moments=background_data.get("defining_moments", []),
            secrets=background_data.get("secrets", []),
            fears=background_data.get("fears", [])
        )
        
        # Parse skills
        skills_data = data.get("skills", {})
        skills = CharacterSkills(
            technical_skills=skills_data.get("technical_skills", {}),
            social_skills=skills_data.get("social_skills", {}),
            combat_skills=skills_data.get("combat_skills", {}),
            special_abilities=skills_data.get("special_abilities", []),
            knowledge_areas=skills_data.get("knowledge_areas", {}),
            languages=skills_data.get("languages", [])
        )
        
        # Parse preferences
        preferences_data = data.get("preferences", {})
        preferences = CharacterPreferences(
            communication_style=preferences_data.get("communication_style", "direct"),
            formality_level=preferences_data.get("formality_level", "medium"),
            work_style=preferences_data.get("work_style", "collaborative"),
            decision_making=preferences_data.get("decision_making", "analytical"),
            social_energy=preferences_data.get("social_energy", "medium"),
            group_size_preference=preferences_data.get("group_size_preference", "small"),
            quirks=preferences_data.get("quirks", []),
            habits=preferences_data.get("habits", []),
            preferences=preferences_data.get("preferences", []),
            dislikes=preferences_data.get("dislikes", [])
        )
        
        return Character(
            character_id=data["character_id"],
            name=data["name"],
            character_type=CharacterType(data["character_type"]),
            created_by=data["created_by"],
            created_at=data["created_at"],
            spirit=AnimalSpirit(data["spirit"]),
            naming_scheme=NamingScheme(data["naming_scheme"]),
            naming_style=NamingStyle(data["naming_style"]),
            traits=traits,
            appearance=appearance,
            background=background,
            skills=skills,
            preferences=preferences,
            description=data.get("description", ""),
            tags=data.get("tags", []),
            custom_data=data.get("custom_data", {}),
            is_active=data.get("is_active", True),
            last_updated=data.get("last_updated", "")
        )
    
    def create_character(
        self, 
        request: CharacterCreationRequest, 
        creator_agent_id: str
    ) -> Character:
        """Create a new character based on the request."""
        # Generate character ID
        character_id = f"char_{secrets.token_hex(8)}"  # nosec B311
        
        # Get current configuration
        config = self.config_manager.get_config()
        
        # Determine spirit
        if request.spirit:
            spirit = request.spirit
        else:
            # Use weighted distribution from config
            enabled_spirits = config.get_enabled_spirits()
            if enabled_spirits:
                spirits = []
                for name, spirit_config in enabled_spirits.items():
                    weight = int(spirit_config.weight * 100)
                    spirits.extend([name] * weight)
                selected_spirit = secrets.choice(spirits)  # nosec B311
                spirit = AnimalSpirit(selected_spirit)
            else:
                spirit = AnimalSpirit.FOX  # Default fallback
        
        # Determine naming scheme and style
        naming_scheme = request.naming_scheme or NamingScheme(config.default_scheme)
        naming_style = request.naming_style or NamingStyle(config.default_style)
        
        # Generate name if requested
        if request.auto_generate_name and not request.character_name:
            name = self.agent_manager.generate_name(spirit, naming_style, naming_scheme)
        else:
            name = request.character_name or f"Character-{character_id[:8]}"
        
        # Generate traits if requested
        if request.auto_generate_traits:
            traits = self._generate_traits(spirit, request.character_type)
        else:
            traits = request.traits or CharacterTraits()
        
        # Generate appearance if not provided
        if not request.appearance:
            appearance = self._generate_appearance(spirit, traits)
        else:
            appearance = request.appearance
        
        # Generate background if requested
        if request.auto_generate_background:
            background = self._generate_background(spirit, traits, request.character_type)
        else:
            background = request.background or CharacterBackground()
        
        # Generate skills if not provided
        if not request.skills:
            skills = self._generate_skills(traits, background)
        else:
            skills = request.skills
        
        # Generate preferences if not provided
        if not request.preferences:
            preferences = self._generate_preferences(traits, background)
        else:
            preferences = request.preferences
        
        # Create character
        character = Character(
            character_id=character_id,
            name=name,
            character_type=request.character_type,
            created_by=creator_agent_id,
            created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
            spirit=spirit,
            naming_scheme=naming_scheme,
            naming_style=naming_style,
            traits=traits,
            appearance=appearance,
            background=background,
            skills=skills,
            preferences=preferences,
            description=request.description,
            tags=request.tags,
            custom_data=request.custom_data,
            last_updated=time.strftime("%Y-%m-%d %H:%M:%S")
        )
        
        # Store character
        self._characters[character_id] = character
        self._save_characters()
        
        logger.info(f"Created character '{name}' (ID: {character_id}) for agent {creator_agent_id}")
        return character
    
    def _generate_traits(self, spirit: AnimalSpirit, character_type: CharacterType) -> CharacterTraits:
        """Generate traits based on spirit and character type."""
        traits = CharacterTraits()
        
        # Base personality traits based on spirit
        spirit_traits = {
            AnimalSpirit.FOX: {
                PersonalityTrait.INTELLIGENCE: 0.9,
                PersonalityTrait.CREATIVITY: 0.8,
                PersonalityTrait.ADAPTABILITY: 0.9,
                PersonalityTrait.CURIOSITY: 0.8,
                PersonalityTrait.INDEPENDENCE: 0.7
            },
            AnimalSpirit.WOLF: {
                PersonalityTrait.LOYALTY: 0.9,
                PersonalityTrait.LEADERSHIP: 0.8,
                PersonalityTrait.DETERMINATION: 0.8,
                PersonalityTrait.COURAGE: 0.7,
                PersonalityTrait.TEAMWORK: 0.8
            },
            AnimalSpirit.OTTER: {
                PersonalityTrait.PLAYFULNESS: 0.9,
                PersonalityTrait.CURIOSITY: 0.8,
                PersonalityTrait.ADAPTABILITY: 0.8,
                PersonalityTrait.EMPATHY: 0.7,
                PersonalityTrait.CREATIVITY: 0.7
            },
            AnimalSpirit.DRAGON: {
                PersonalityTrait.WISDOM: 0.9,
                PersonalityTrait.LEADERSHIP: 0.8,
                PersonalityTrait.DETERMINATION: 0.8,
                PersonalityTrait.INDEPENDENCE: 0.7,
                PersonalityTrait.COURAGE: 0.8
            },
            AnimalSpirit.EAGLE: {
                PersonalityTrait.LEADERSHIP: 0.9,
                PersonalityTrait.INDEPENDENCE: 0.8,
                PersonalityTrait.COURAGE: 0.8,
                PersonalityTrait.DETERMINATION: 0.7,
                PersonalityTrait.STRATEGIC: 0.8
            },
            AnimalSpirit.LION: {
                PersonalityTrait.LEADERSHIP: 0.9,
                PersonalityTrait.COURAGE: 0.8,
                PersonalityTrait.DETERMINATION: 0.8,
                PersonalityTrait.CHARISMA: 0.7,
                PersonalityTrait.DOMINANCE: 0.8
            }
        }
        
        # Apply spirit-based traits
        if spirit in spirit_traits:
            traits.personality.update(spirit_traits[spirit])
        
        # Adjust traits based on character type
        type_adjustments = {
            CharacterType.MENTOR: {
                PersonalityTrait.WISDOM: 0.8,
                PersonalityTrait.PATIENCE: 0.7,
                PersonalityTrait.EMPATHY: 0.7
            },
            CharacterType.RIVAL: {
                PersonalityTrait.AGGRESSION: 0.6,
                PersonalityTrait.DETERMINATION: 0.8,
                PersonalityTrait.INDEPENDENCE: 0.7
            },
            CharacterType.VILLAIN: {
                PersonalityTrait.AGGRESSION: 0.8,
                PersonalityTrait.INDEPENDENCE: 0.8,
                PersonalityTrait.DETERMINATION: 0.9
            },
            CharacterType.COMPANION: {
                PersonalityTrait.LOYALTY: 0.8,
                PersonalityTrait.EMPATHY: 0.7,
                PersonalityTrait.TEAMWORK: 0.8
            }
        }
        
        if character_type in type_adjustments:
            for trait, value in type_adjustments[character_type].items():
                traits.personality[trait] = traits.personality.get(trait, 0.5) + value * 0.3
        
        # Generate physical traits
        for trait in PhysicalTrait:
            traits.physical[trait] = random.uniform(0.3, 0.9)
        
        # Generate ability traits
        for ability in AbilityTrait:
            traits.abilities[ability] = random.uniform(0.2, 0.8)
        
        return traits
    
    def _generate_appearance(self, spirit: AnimalSpirit, traits: CharacterTraits) -> CharacterAppearance:
        """Generate appearance based on spirit and traits."""
        # Spirit-based appearance
        spirit_appearances = {
            AnimalSpirit.FOX: {
                "species": "fox",
                "color_primary": "red",
                "color_secondary": "white",
                "color_accent": "black",
                "size": "medium",
                "build": "slender"
            },
            AnimalSpirit.WOLF: {
                "species": "wolf",
                "color_primary": "gray",
                "color_secondary": "white",
                "color_accent": "black",
                "size": "large",
                "build": "muscular"
            },
            AnimalSpirit.OTTER: {
                "species": "otter",
                "color_primary": "brown",
                "color_secondary": "tan",
                "color_accent": "white",
                "size": "medium",
                "build": "sleek"
            },
            AnimalSpirit.DRAGON: {
                "species": "dragon",
                "color_primary": "red",
                "color_secondary": "gold",
                "color_accent": "black",
                "size": "huge",
                "build": "powerful"
            },
            AnimalSpirit.EAGLE: {
                "species": "eagle",
                "color_primary": "brown",
                "color_secondary": "white",
                "color_accent": "gold",
                "size": "large",
                "build": "athletic"
            },
            AnimalSpirit.LION: {
                "species": "lion",
                "color_primary": "gold",
                "color_secondary": "brown",
                "color_accent": "black",
                "size": "large",
                "build": "muscular"
            }
        }
        
        base_appearance = spirit_appearances.get(spirit, {
            "species": "unknown",
            "color_primary": "gray",
            "color_secondary": "white",
            "color_accent": "black",
            "size": "medium",
            "build": "average"
        })
        
        return CharacterAppearance(
            species=base_appearance["species"],
            color_primary=base_appearance["color_primary"],
            color_secondary=base_appearance["color_secondary"],
            color_accent=base_appearance["color_accent"],
            size=base_appearance["size"],
            build=base_appearance["build"],
            markings=[],
            accessories=[],
            equipment=[],
            style="casual",
            theme="neutral"
        )
    
    def _generate_background(self, spirit: AnimalSpirit, traits: CharacterTraits, character_type: CharacterType) -> CharacterBackground:
        """Generate background based on spirit, traits, and character type."""
        # Determine profession based on dominant abilities
        dominant_abilities = traits.get_dominant_abilities(3)
        
        profession_map = {
            AbilityTrait.STRATEGIST: "Strategic Advisor",
            AbilityTrait.HUNTER: "Tracker/Scout",
            AbilityTrait.TEACHER: "Educator",
            AbilityTrait.ARTIST: "Creative Professional",
            AbilityTrait.HEALER: "Medical Professional",
            AbilityTrait.INVENTOR: "Engineer/Inventor",
            AbilityTrait.EXPLORER: "Explorer/Researcher",
            AbilityTrait.GUARDIAN: "Protector/Guard",
            AbilityTrait.DIPLOMAT: "Diplomat/Mediator",
            AbilityTrait.WARRIOR: "Combat Specialist",
            AbilityTrait.SCHOLAR: "Academic/Researcher",
            AbilityTrait.PERFORMER: "Entertainer",
            AbilityTrait.BUILDER: "Constructor/Architect",
            AbilityTrait.NAVIGATOR: "Pilot/Navigator",
            AbilityTrait.COMMUNICATOR: "Communications Specialist",
            AbilityTrait.LEADER: "Commander/Manager"
        }
        
        profession = profession_map.get(dominant_abilities[0], "General Specialist") if dominant_abilities else "General Specialist"
        
        return CharacterBackground(
            origin="Generated",
            birthplace="Unknown",
            upbringing="Standard",
            education="Specialized Training",
            profession=profession,
            experience_level="intermediate",
            specializations=[ability.value for ability in dominant_abilities],
            family="Unknown",
            relationships=[],
            affiliations=[],
            primary_goal="Fulfill role and purpose",
            secondary_goals=[],
            motivations=["Personal growth", "Service to others"],
            defining_moments=[],
            secrets=[],
            fears=[]
        )
    
    def _generate_skills(self, traits: CharacterTraits, background: CharacterBackground) -> CharacterSkills:
        """Generate skills based on traits and background."""
        skills = CharacterSkills()
        
        # Generate technical skills based on abilities
        if AbilityTrait.INVENTOR in traits.abilities:
            skills.technical_skills["Engineering"] = traits.abilities[AbilityTrait.INVENTOR]
        if AbilityTrait.SCHOLAR in traits.abilities:
            skills.technical_skills["Research"] = traits.abilities[AbilityTrait.SCHOLAR]
        
        # Generate social skills based on personality
        if PersonalityTrait.CHARISMA in traits.personality:
            skills.social_skills["Leadership"] = traits.personality[PersonalityTrait.CHARISMA]
        if PersonalityTrait.EMPATHY in traits.personality:
            skills.social_skills["Counseling"] = traits.personality[PersonalityTrait.EMPATHY]
        
        # Generate combat skills based on abilities
        if AbilityTrait.WARRIOR in traits.abilities:
            skills.combat_skills["Combat"] = traits.abilities[AbilityTrait.WARRIOR]
        if AbilityTrait.HUNTER in traits.abilities:
            skills.combat_skills["Tracking"] = traits.abilities[AbilityTrait.HUNTER]
        
        # Generate knowledge areas
        skills.knowledge_areas["General Knowledge"] = 0.6
        if background.profession:
            skills.knowledge_areas[background.profession] = 0.8
        
        # Generate languages
        skills.languages = ["Common"]
        if PersonalityTrait.INTELLIGENCE in traits.personality and traits.personality[PersonalityTrait.INTELLIGENCE] > 0.7:
            skills.languages.extend(["Technical", "Ancient"])
        
        return skills
    
    def _generate_preferences(self, traits: CharacterTraits, background: CharacterBackground) -> CharacterPreferences:
        """Generate preferences based on traits and background."""
        # Determine communication style based on personality
        if PersonalityTrait.CHARISMA in traits.personality and traits.personality[PersonalityTrait.CHARISMA] > 0.7:
            communication_style = "diplomatic"
        elif PersonalityTrait.AGGRESSION in traits.personality and traits.personality[PersonalityTrait.AGGRESSION] > 0.6:
            communication_style = "direct"
        else:
            communication_style = "casual"
        
        # Determine work style based on personality
        if PersonalityTrait.INDEPENDENCE in traits.personality and traits.personality[PersonalityTrait.INDEPENDENCE] > 0.7:
            work_style = "solo"
        elif PersonalityTrait.LEADERSHIP in traits.personality and traits.personality[PersonalityTrait.LEADERSHIP] > 0.7:
            work_style = "leading"
        else:
            work_style = "collaborative"
        
        return CharacterPreferences(
            communication_style=communication_style,
            formality_level="medium",
            work_style=work_style,
            decision_making="analytical",
            social_energy="medium",
            group_size_preference="small",
            quirks=[],
            habits=[],
            preferences=[],
            dislikes=[]
        )
    
    def get_character(self, character_id: str) -> Optional[Character]:
        """Get a character by ID."""
        return self._characters.get(character_id)
    
    def list_characters(self, created_by: Optional[str] = None) -> List[Character]:
        """List all characters, optionally filtered by creator."""
        characters = list(self._characters.values())
        
        if created_by:
            characters = [char for char in characters if char.created_by == created_by]
        
        return characters
    
    def update_character(self, character_id: str, updates: Dict[str, Any]) -> bool:
        """Update a character with new data."""
        if character_id not in self._characters:
            return False
        
        character = self._characters[character_id]
        
        # Update fields
        for key, value in updates.items():
            if hasattr(character, key):
                setattr(character, key, value)
        
        character.last_updated = time.strftime("%Y-%m-%d %H:%M:%S")
        self._save_characters()
        
        logger.info(f"Updated character {character_id}")
        return True
    
    def delete_character(self, character_id: str) -> bool:
        """Delete a character."""
        if character_id not in self._characters:
            return False
        
        del self._characters[character_id]
        self._save_characters()
        
        logger.info(f"Deleted character {character_id}")
        return True
    
    def search_characters(self, query: str) -> List[Character]:
        """Search characters by name, description, or tags."""
        query_lower = query.lower()
        results = []
        
        for character in self._characters.values():
            if (query_lower in character.name.lower() or
                query_lower in character.description.lower() or
                any(query_lower in tag.lower() for tag in character.tags)):
                results.append(character)
        
        return results
