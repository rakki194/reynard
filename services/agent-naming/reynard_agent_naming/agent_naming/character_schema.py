"""
Character Creation Schema
========================

Schema definitions for character creation and management system.
Allows agents to create specific characters with detailed customization.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional

from .types import AnimalSpirit, NamingScheme, NamingStyle


class CharacterType(Enum):
    """Character type enumeration."""
    
    AGENT = "agent"
    COMPANION = "companion"
    MENTOR = "mentor"
    RIVAL = "rival"
    VILLAIN = "villain"
    NEUTRAL = "neutral"
    NPC = "npc"


class PersonalityTrait(Enum):
    """Personality trait enumeration."""
    
    # Core Traits
    DOMINANCE = "dominance"
    INDEPENDENCE = "independence"
    PATIENCE = "patience"
    AGGRESSION = "aggression"
    CHARISMA = "charisma"
    CREATIVITY = "creativity"
    PERFECTIONISM = "perfectionism"
    ADAPTABILITY = "adaptability"
    PLAYFULNESS = "playfulness"
    INTELLIGENCE = "intelligence"
    LOYALTY = "loyalty"
    CURIOSITY = "curiosity"
    COURAGE = "courage"
    EMPATHY = "empathy"
    DETERMINATION = "determination"
    SPONTANEITY = "spontaneity"
    
    # Additional Traits
    HUMOR = "humor"
    WISDOM = "wisdom"
    LEADERSHIP = "leadership"
    TEAMWORK = "teamwork"
    ANALYTICAL = "analytical"
    INTUITIVE = "intuitive"
    STRATEGIC = "strategic"
    TACTICAL = "tactical"


class PhysicalTrait(Enum):
    """Physical trait enumeration."""
    
    SIZE = "size"
    STRENGTH = "strength"
    AGILITY = "agility"
    ENDURANCE = "endurance"
    APPEARANCE = "appearance"
    GRACE = "grace"
    SPEED = "speed"
    COORDINATION = "coordination"
    STAMINA = "stamina"
    FLEXIBILITY = "flexibility"
    REFLEXES = "reflexes"
    VITALITY = "vitality"


class AbilityTrait(Enum):
    """Ability trait enumeration."""
    
    STRATEGIST = "strategist"
    HUNTER = "hunter"
    TEACHER = "teacher"
    ARTIST = "artist"
    HEALER = "healer"
    INVENTOR = "inventor"
    EXPLORER = "explorer"
    GUARDIAN = "guardian"
    DIPLOMAT = "diplomat"
    WARRIOR = "warrior"
    SCHOLAR = "scholar"
    PERFORMER = "performer"
    BUILDER = "builder"
    NAVIGATOR = "navigator"
    COMMUNICATOR = "communicator"
    LEADER = "leader"


@dataclass
class CharacterTraits:
    """Character traits configuration."""
    
    # Personality traits (0.0 to 1.0)
    personality: Dict[PersonalityTrait, float] = field(default_factory=dict)
    
    # Physical traits (0.0 to 1.0)
    physical: Dict[PhysicalTrait, float] = field(default_factory=dict)
    
    # Ability traits (0.0 to 1.0)
    abilities: Dict[AbilityTrait, float] = field(default_factory=dict)
    
    def get_dominant_personality(self, top_n: int = 3) -> List[PersonalityTrait]:
        """Get top N dominant personality traits."""
        sorted_traits = sorted(
            self.personality.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        return [trait for trait, _ in sorted_traits[:top_n]]
    
    def get_dominant_abilities(self, top_n: int = 3) -> List[AbilityTrait]:
        """Get top N dominant abilities."""
        sorted_abilities = sorted(
            self.abilities.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        return [ability for ability, _ in sorted_abilities[:top_n]]


@dataclass
class CharacterAppearance:
    """Character appearance configuration."""
    
    # Basic appearance
    species: str = ""
    color_primary: str = ""
    color_secondary: str = ""
    color_accent: str = ""
    
    # Physical features
    size: str = "medium"  # small, medium, large, huge
    build: str = "average"  # slender, average, muscular, stocky
    markings: List[str] = field(default_factory=list)
    
    # Accessories and equipment
    accessories: List[str] = field(default_factory=list)
    equipment: List[str] = field(default_factory=list)
    
    # Style preferences
    style: str = "casual"  # casual, formal, military, mystical, etc.
    theme: str = "neutral"  # neutral, dark, light, colorful, etc.


@dataclass
class CharacterBackground:
    """Character background and history."""
    
    # Origin and history
    origin: str = ""
    birthplace: str = ""
    upbringing: str = ""
    education: str = ""
    
    # Career and experience
    profession: str = ""
    experience_level: str = "intermediate"  # novice, intermediate, expert, master
    specializations: List[str] = field(default_factory=list)
    
    # Relationships and connections
    family: str = ""
    relationships: List[str] = field(default_factory=list)
    affiliations: List[str] = field(default_factory=list)
    
    # Goals and motivations
    primary_goal: str = ""
    secondary_goals: List[str] = field(default_factory=list)
    motivations: List[str] = field(default_factory=list)
    
    # Backstory elements
    defining_moments: List[str] = field(default_factory=list)
    secrets: List[str] = field(default_factory=list)
    fears: List[str] = field(default_factory=list)


@dataclass
class CharacterSkills:
    """Character skills and capabilities."""
    
    # Technical skills
    technical_skills: Dict[str, float] = field(default_factory=dict)
    
    # Social skills
    social_skills: Dict[str, float] = field(default_factory=dict)
    
    # Combat skills
    combat_skills: Dict[str, float] = field(default_factory=dict)
    
    # Special abilities
    special_abilities: List[str] = field(default_factory=list)
    
    # Knowledge areas
    knowledge_areas: Dict[str, float] = field(default_factory=dict)
    
    # Languages
    languages: List[str] = field(default_factory=list)


@dataclass
class CharacterPreferences:
    """Character preferences and quirks."""
    
    # Communication style
    communication_style: str = "direct"  # direct, diplomatic, casual, formal
    formality_level: str = "medium"  # low, medium, high
    
    # Work preferences
    work_style: str = "collaborative"  # solo, collaborative, leading, following
    decision_making: str = "analytical"  # intuitive, analytical, consensus, authoritative
    
    # Social preferences
    social_energy: str = "medium"  # low, medium, high
    group_size_preference: str = "small"  # solo, small, medium, large
    
    # Personal quirks
    quirks: List[str] = field(default_factory=list)
    habits: List[str] = field(default_factory=list)
    preferences: List[str] = field(default_factory=list)
    dislikes: List[str] = field(default_factory=list)


@dataclass
class Character:
    """Complete character definition."""
    
    # Basic information
    character_id: str
    name: str
    character_type: CharacterType
    created_by: str  # Agent ID who created this character
    created_at: str
    
    # Core attributes
    spirit: AnimalSpirit
    naming_scheme: NamingScheme
    naming_style: NamingStyle
    
    # Character components
    traits: CharacterTraits
    appearance: CharacterAppearance
    background: CharacterBackground
    skills: CharacterSkills
    preferences: CharacterPreferences
    
    # Metadata
    description: str = ""
    tags: List[str] = field(default_factory=list)
    custom_data: Dict[str, Any] = field(default_factory=dict)
    
    # Status
    is_active: bool = True
    last_updated: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "character_id": self.character_id,
            "name": self.name,
            "character_type": self.character_type.value,
            "created_by": self.created_by,
            "created_at": self.created_at,
            "spirit": self.spirit.value,
            "naming_scheme": self.naming_scheme.value,
            "naming_style": self.naming_style.value,
            "traits": {
                "personality": {trait.value: value for trait, value in self.traits.personality.items()},
                "physical": {trait.value: value for trait, value in self.traits.physical.items()},
                "abilities": {ability.value: value for ability, value in self.traits.abilities.items()}
            },
            "appearance": {
                "species": self.appearance.species,
                "color_primary": self.appearance.color_primary,
                "color_secondary": self.appearance.color_secondary,
                "color_accent": self.appearance.color_accent,
                "size": self.appearance.size,
                "build": self.appearance.build,
                "markings": self.appearance.markings,
                "accessories": self.appearance.accessories,
                "equipment": self.appearance.equipment,
                "style": self.appearance.style,
                "theme": self.appearance.theme
            },
            "background": {
                "origin": self.background.origin,
                "birthplace": self.background.birthplace,
                "upbringing": self.background.upbringing,
                "education": self.background.education,
                "profession": self.background.profession,
                "experience_level": self.background.experience_level,
                "specializations": self.background.specializations,
                "family": self.background.family,
                "relationships": self.background.relationships,
                "affiliations": self.background.affiliations,
                "primary_goal": self.background.primary_goal,
                "secondary_goals": self.background.secondary_goals,
                "motivations": self.background.motivations,
                "defining_moments": self.background.defining_moments,
                "secrets": self.background.secrets,
                "fears": self.background.fears
            },
            "skills": {
                "technical_skills": self.skills.technical_skills,
                "social_skills": self.skills.social_skills,
                "combat_skills": self.skills.combat_skills,
                "special_abilities": self.skills.special_abilities,
                "knowledge_areas": self.skills.knowledge_areas,
                "languages": self.skills.languages
            },
            "preferences": {
                "communication_style": self.preferences.communication_style,
                "formality_level": self.preferences.formality_level,
                "work_style": self.preferences.work_style,
                "decision_making": self.preferences.decision_making,
                "social_energy": self.preferences.social_energy,
                "group_size_preference": self.preferences.group_size_preference,
                "quirks": self.preferences.quirks,
                "habits": self.preferences.habits,
                "preferences": self.preferences.preferences,
                "dislikes": self.preferences.dislikes
            },
            "description": self.description,
            "tags": self.tags,
            "custom_data": self.custom_data,
            "is_active": self.is_active,
            "last_updated": self.last_updated
        }


@dataclass
class CharacterCreationRequest:
    """Request for character creation."""
    
    # Basic requirements
    character_name: Optional[str] = None
    character_type: CharacterType = CharacterType.AGENT
    spirit: Optional[AnimalSpirit] = None
    naming_scheme: Optional[NamingScheme] = None
    naming_style: Optional[NamingStyle] = None
    
    # Customization options
    traits: Optional[CharacterTraits] = None
    appearance: Optional[CharacterAppearance] = None
    background: Optional[CharacterBackground] = None
    skills: Optional[CharacterSkills] = None
    preferences: Optional[CharacterPreferences] = None
    
    # Metadata
    description: str = ""
    tags: List[str] = field(default_factory=list)
    custom_data: Dict[str, Any] = field(default_factory=dict)
    
    # Generation options
    auto_generate_name: bool = True
    auto_generate_traits: bool = True
    auto_generate_background: bool = True
    use_weighted_distribution: bool = True
