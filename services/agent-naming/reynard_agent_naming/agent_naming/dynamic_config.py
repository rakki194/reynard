"""
Dynamic Agent Naming Configuration Manager
=========================================

Manages dynamic configuration loading, validation, and runtime updates.
Allows changing naming schemes, styles, and components without code changes.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from .config_schema import (
    ComponentConfig,
    GenerationConfig,
    NamingSchemeConfig,
    NamingStyleConfig,
    NamingSystemConfig,
    SpiritConfig,
)
from .types import AnimalSpirit, NamingScheme, NamingStyle

logger = logging.getLogger(__name__)


class DynamicConfigManager:
    """Manages dynamic configuration for the agent naming system."""
    
    def __init__(self, config_dir: Optional[Path] = None):
        """Initialize the dynamic configuration manager."""
        if config_dir is None:
            # Default to data directory
            self.config_dir = Path(__file__).parent.parent / "data"
        else:
            self.config_dir = Path(config_dir)
        
        self.config_file = self.config_dir / "naming_config.json"
        self._config: Optional[NamingSystemConfig] = None
        self._load_config()
    
    def _load_config(self) -> None:
        """Load configuration from file or create default."""
        if self.config_file.exists():
            try:
                with self.config_file.open(encoding="utf-8") as f:
                    data = json.load(f)
                self._config = self._parse_config(data)
                logger.info(f"Loaded dynamic naming configuration from {self.config_file}")
            except Exception as e:
                logger.warning(f"Failed to load config from {self.config_file}: {e}")
                self._config = self._create_default_config()
        else:
            self._config = self._create_default_config()
            self.save_config()
    
    def _parse_config(self, data: Dict[str, Any]) -> NamingSystemConfig:
        """Parse configuration data into NamingSystemConfig object."""
        config = NamingSystemConfig(
            version=data.get("version", "1.0.0"),
            last_updated=data.get("last_updated", ""),
            default_scheme=data.get("default_scheme", "animal_spirit"),
            default_style=data.get("default_style", "foundation"),
            weighted_distribution=data.get("weighted_distribution", True),
            settings=data.get("settings", {})
        )
        
        # Parse schemes
        for name, scheme_data in data.get("schemes", {}).items():
            config.schemes[name] = NamingSchemeConfig(
                name=scheme_data["name"],
                enabled=scheme_data.get("enabled", True),
                description=scheme_data.get("description", ""),
                default_style=scheme_data.get("default_style"),
                supported_styles=scheme_data.get("supported_styles", []),
                custom_data=scheme_data.get("custom_data", {})
            )
        
        # Parse styles
        for name, style_data in data.get("styles", {}).items():
            config.styles[name] = NamingStyleConfig(
                name=style_data["name"],
                enabled=style_data.get("enabled", True),
                description=style_data.get("description", ""),
                format_template=style_data.get("format_template", ""),
                components=style_data.get("components", []),
                custom_data=style_data.get("custom_data", {})
            )
        
        # Parse spirits
        for name, spirit_data in data.get("spirits", {}).items():
            config.spirits[name] = SpiritConfig(
                name=spirit_data["name"],
                enabled=spirit_data.get("enabled", True),
                description=spirit_data.get("description", ""),
                emoji=spirit_data.get("emoji", ""),
                base_names=spirit_data.get("base_names", []),
                generation_numbers=spirit_data.get("generation_numbers", []),
                weight=spirit_data.get("weight", 1.0),
                custom_data=spirit_data.get("custom_data", {})
            )
        
        # Parse components
        for name, component_data in data.get("components", {}).items():
            config.components[name] = ComponentConfig(
                category=component_data["category"],
                enabled=component_data.get("enabled", True),
                description=component_data.get("description", ""),
                values=component_data.get("values", []),
                custom_data=component_data.get("custom_data", {})
            )
        
        # Parse generations
        for name, generation_data in data.get("generations", {}).items():
            config.generations[name] = GenerationConfig(
                spirit=generation_data["spirit"],
                enabled=generation_data.get("enabled", True),
                numbers=generation_data.get("numbers", []),
                custom_data=generation_data.get("custom_data", {})
            )
        
        return config
    
    def _create_default_config(self) -> NamingSystemConfig:
        """Create default configuration based on existing data files."""
        config = NamingSystemConfig()
        
        # Load existing data files to populate default config
        try:
            # Load animal spirits
            spirits_file = self.config_dir / "animal_spirits.json"
            if spirits_file.exists():
                with spirits_file.open(encoding="utf-8") as f:
                    spirits_data = json.load(f)
                
                for spirit_name, base_names in spirits_data.items():
                    # Default emojis for common spirits
                    emoji_map = {
                        "fox": "🦊", "wolf": "🐺", "otter": "🦦", "dragon": "🐉",
                        "eagle": "🦅", "lion": "🦁", "tiger": "🐅"
                    }
                    config.spirits[spirit_name] = SpiritConfig(
                        name=spirit_name,
                        emoji=emoji_map.get(spirit_name, ""),
                        base_names=base_names,
                        weight=1.0 if spirit_name in ["fox", "otter", "wolf"] else 0.5
                    )
            
            # Load generation numbers
            generations_file = self.config_dir / "generation_numbers.json"
            if generations_file.exists():
                with generations_file.open(encoding="utf-8") as f:
                    generations_data = json.load(f)
                
                for spirit_name, numbers in generations_data.items():
                    config.generations[spirit_name] = GenerationConfig(
                        spirit=spirit_name,
                        numbers=numbers
                    )
            
            # Load naming components
            components_file = self.config_dir / "naming_components.json"
            if components_file.exists():
                with components_file.open(encoding="utf-8") as f:
                    components_data = json.load(f)
                
                for category, values in components_data.items():
                    config.components[category] = ComponentConfig(
                        category=category,
                        values=values
                    )
            
            # Add default schemes
            config.schemes["animal_spirit"] = NamingSchemeConfig(
                name="animal_spirit",
                description="Animal spirit based naming",
                supported_styles=["foundation", "exo", "cyberpunk", "mythological", "scientific", "hybrid"]
            )
            
            config.schemes["elemental"] = NamingSchemeConfig(
                name="elemental",
                description="Elemental based naming",
                supported_styles=["foundation", "exo", "cyberpunk"]
            )
            
            # Add default styles
            config.styles["foundation"] = NamingStyleConfig(
                name="foundation",
                description="Asimov-inspired strategic naming",
                format_template="{spirit}-{suffix}-{generation}",
                components=["foundation_suffixes"]
            )
            
            config.styles["exo"] = NamingStyleConfig(
                name="exo",
                description="Destiny-inspired combat naming",
                format_template="{spirit}-{suffix}-{model}",
                components=["exo_suffixes"]
            )
            
            config.styles["cyberpunk"] = NamingStyleConfig(
                name="cyberpunk",
                description="Tech-prefixed cyber naming",
                format_template="{prefix}-{spirit}-{suffix}",
                components=["cyberpunk_prefixes", "cyberpunk_suffixes"]
            )
            
        except Exception as e:
            logger.warning(f"Failed to load existing data files: {e}")
        
        return config
    
    def get_config(self) -> NamingSystemConfig:
        """Get current configuration."""
        if self._config is None:
            self._load_config()
        return self._config
    
    def save_config(self) -> bool:
        """Save current configuration to file."""
        if self._config is None:
            return False
        
        try:
            # Ensure config directory exists
            self.config_dir.mkdir(parents=True, exist_ok=True)
            
            with self.config_file.open("w", encoding="utf-8") as f:
                json.dump(self._config.to_dict(), f, indent=2)
            
            logger.info(f"Saved dynamic naming configuration to {self.config_file}")
            return True
        except Exception as e:
            logger.error(f"Failed to save config to {self.config_file}: {e}")
            return False
    
    def reload_config(self) -> bool:
        """Reload configuration from file."""
        try:
            self._load_config()
            return True
        except Exception as e:
            logger.error(f"Failed to reload config: {e}")
            return False
    
    def update_config(self, updates: Dict[str, Any]) -> bool:
        """Update configuration with new values."""
        try:
            if self._config is None:
                self._load_config()
            
            # Update top-level settings
            for key, value in updates.items():
                if hasattr(self._config, key):
                    setattr(self._config, key, value)
            
            self.save_config()
            return True
        except Exception as e:
            logger.error(f"Failed to update config: {e}")
            return False
    
    def enable_scheme(self, scheme_name: str) -> bool:
        """Enable a naming scheme."""
        if self._config and scheme_name in self._config.schemes:
            self._config.schemes[scheme_name].enabled = True
            return self.save_config()
        return False
    
    def disable_scheme(self, scheme_name: str) -> bool:
        """Disable a naming scheme."""
        if self._config and scheme_name in self._config.schemes:
            self._config.schemes[scheme_name].enabled = False
            return self.save_config()
        return False
    
    def enable_style(self, style_name: str) -> bool:
        """Enable a naming style."""
        if self._config and style_name in self._config.styles:
            self._config.styles[style_name].enabled = True
            return self.save_config()
        return False
    
    def disable_style(self, style_name: str) -> bool:
        """Disable a naming style."""
        if self._config and style_name in self._config.styles:
            self._config.styles[style_name].enabled = False
            return self.save_config()
        return False
    
    def enable_spirit(self, spirit_name: str) -> bool:
        """Enable an animal spirit."""
        if self._config and spirit_name in self._config.spirits:
            self._config.spirits[spirit_name].enabled = True
            return self.save_config()
        return False
    
    def disable_spirit(self, spirit_name: str) -> bool:
        """Disable an animal spirit."""
        if self._config and spirit_name in self._config.spirits:
            self._config.spirits[spirit_name].enabled = False
            return self.save_config()
        return False
    
    def set_default_scheme(self, scheme_name: str) -> bool:
        """Set the default naming scheme."""
        if self._config and scheme_name in self._config.schemes:
            self._config.default_scheme = scheme_name
            return self.save_config()
        return False
    
    def set_default_style(self, style_name: str) -> bool:
        """Set the default naming style."""
        if self._config and style_name in self._config.styles:
            self._config.default_style = style_name
            return self.save_config()
        return False
    
    def get_available_schemes(self) -> List[str]:
        """Get list of available schemes."""
        if self._config:
            return list(self._config.get_enabled_schemes().keys())
        return []
    
    def get_available_styles(self) -> List[str]:
        """Get list of available styles."""
        if self._config:
            return list(self._config.get_enabled_styles().keys())
        return []
    
    def get_available_spirits(self) -> List[str]:
        """Get list of available spirits."""
        if self._config:
            return list(self._config.get_enabled_spirits().keys())
        return []
    
    def validate_config(self) -> List[str]:
        """Validate current configuration and return any issues."""
        issues = []
        
        if self._config is None:
            issues.append("Configuration is None")
            return issues
        
        # Check for required schemes
        if not self._config.schemes:
            issues.append("No naming schemes configured")
        
        # Check for required styles
        if not self._config.styles:
            issues.append("No naming styles configured")
        
        # Check default scheme exists
        if self._config.default_scheme not in self._config.schemes:
            issues.append(f"Default scheme '{self._config.default_scheme}' not found")
        
        # Check default style exists
        if self._config.default_style not in self._config.styles:
            issues.append(f"Default style '{self._config.default_style}' not found")
        
        # Check for enabled schemes
        enabled_schemes = self._config.get_enabled_schemes()
        if not enabled_schemes:
            issues.append("No enabled naming schemes")
        
        # Check for enabled styles
        enabled_styles = self._config.get_enabled_styles()
        if not enabled_styles:
            issues.append("No enabled naming styles")
        
        return issues



