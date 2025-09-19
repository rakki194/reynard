"""
Dynamic Agent Naming Configuration Schema
========================================

Schema definitions for dynamic agent naming configuration system.
Allows runtime configuration changes through JSON files.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional

from .types import AnimalSpirit, NamingScheme, NamingStyle


class ConfigType(Enum):
    """Configuration type enumeration."""
    
    SCHEME = "scheme"
    STYLE = "style"
    SPIRIT = "spirit"
    COMPONENT = "component"
    GENERATION = "generation"


@dataclass
class NamingSchemeConfig:
    """Configuration for a naming scheme."""
    
    name: str
    enabled: bool = True
    description: str = ""
    default_style: Optional[str] = None
    supported_styles: List[str] = field(default_factory=list)
    custom_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class NamingStyleConfig:
    """Configuration for a naming style."""
    
    name: str
    enabled: bool = True
    description: str = ""
    format_template: str = ""
    components: List[str] = field(default_factory=list)
    custom_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SpiritConfig:
    """Configuration for an animal spirit."""
    
    name: str
    enabled: bool = True
    description: str = ""
    emoji: str = ""
    base_names: List[str] = field(default_factory=list)
    generation_numbers: List[int] = field(default_factory=list)
    weight: float = 1.0
    custom_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ComponentConfig:
    """Configuration for naming components."""
    
    category: str
    enabled: bool = True
    description: str = ""
    values: List[str] = field(default_factory=list)
    custom_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GenerationConfig:
    """Configuration for generation numbers."""
    
    spirit: str
    enabled: bool = True
    numbers: List[int] = field(default_factory=list)
    custom_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class NamingSystemConfig:
    """Complete naming system configuration."""
    
    version: str = "1.0.0"
    last_updated: str = ""
    default_scheme: str = "animal_spirit"
    default_style: str = "foundation"
    weighted_distribution: bool = True
    
    # Configuration sections
    schemes: Dict[str, NamingSchemeConfig] = field(default_factory=dict)
    styles: Dict[str, NamingStyleConfig] = field(default_factory=dict)
    spirits: Dict[str, SpiritConfig] = field(default_factory=dict)
    components: Dict[str, ComponentConfig] = field(default_factory=dict)
    generations: Dict[str, GenerationConfig] = field(default_factory=dict)
    
    # Global settings
    settings: Dict[str, Any] = field(default_factory=dict)
    
    def get_enabled_schemes(self) -> Dict[str, NamingSchemeConfig]:
        """Get all enabled schemes."""
        return {name: config for name, config in self.schemes.items() if config.enabled}
    
    def get_enabled_styles(self) -> Dict[str, NamingStyleConfig]:
        """Get all enabled styles."""
        return {name: config for name, config in self.styles.items() if config.enabled}
    
    def get_enabled_spirits(self) -> Dict[str, SpiritConfig]:
        """Get all enabled spirits."""
        return {name: config for name, config in self.spirits.items() if config.enabled}
    
    def get_enabled_components(self) -> Dict[str, ComponentConfig]:
        """Get all enabled components."""
        return {name: config for name, config in self.components.items() if config.enabled}
    
    def get_enabled_generations(self) -> Dict[str, GenerationConfig]:
        """Get all enabled generations."""
        return {name: config for name, config in self.generations.items() if config.enabled}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "version": self.version,
            "last_updated": self.last_updated,
            "default_scheme": self.default_scheme,
            "default_style": self.default_style,
            "weighted_distribution": self.weighted_distribution,
            "schemes": {name: {
                "name": config.name,
                "enabled": config.enabled,
                "description": config.description,
                "default_style": config.default_style,
                "supported_styles": config.supported_styles,
                "custom_data": config.custom_data
            } for name, config in self.schemes.items()},
            "styles": {name: {
                "name": config.name,
                "enabled": config.enabled,
                "description": config.description,
                "format_template": config.format_template,
                "components": config.components,
                "custom_data": config.custom_data
            } for name, config in self.styles.items()},
            "spirits": {name: {
                "name": config.name,
                "enabled": config.enabled,
                "description": config.description,
                "emoji": config.emoji,
                "base_names": config.base_names,
                "generation_numbers": config.generation_numbers,
                "weight": config.weight,
                "custom_data": config.custom_data
            } for name, config in self.spirits.items()},
            "components": {name: {
                "category": config.category,
                "enabled": config.enabled,
                "description": config.description,
                "values": config.values,
                "custom_data": config.custom_data
            } for name, config in self.components.items()},
            "generations": {name: {
                "spirit": config.spirit,
                "enabled": config.enabled,
                "numbers": config.numbers,
                "custom_data": config.custom_data
            } for name, config in self.generations.items()},
            "settings": self.settings
        }



