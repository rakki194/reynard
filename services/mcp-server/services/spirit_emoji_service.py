"""
Spirit Emoji Service
===================

Centralized service for managing spirit emojis using the agent naming configuration.
This ensures all systems use the same emoji definitions from a single source of truth.
"""

import json
from pathlib import Path
from typing import Dict


class SpiritEmojiService:
    """Centralized service for spirit emoji management."""
    
    def __init__(self) -> None:
        """Initialize the spirit emoji service."""
        self._emoji_cache: Dict[str, str] = {}
        self._config_path = self._find_naming_config()
        self._load_emojis()
    
    def _find_naming_config(self) -> Path:
        """Find the agent naming configuration file."""
        # Look for the naming config in the agent-naming service
        possible_paths = [
            Path(__file__).parent.parent.parent.parent / "services" / "agent-naming" / "reynard_agent_naming" / "data" / "naming_config.json",
            Path(__file__).parent.parent.parent.parent.parent / "services" / "agent-naming" / "reynard_agent_naming" / "data" / "naming_config.json",
            Path("/home/kade/runeset/reynard/services/agent-naming/reynard_agent_naming/data/naming_config.json")
        ]
        
        for path in possible_paths:
            if path.exists():
                return path
        
        raise FileNotFoundError("Could not find agent naming configuration file")
    
    def _load_emojis(self) -> None:
        """Load emoji mappings from the agent naming configuration."""
        try:
            with open(self._config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            spirits = config.get("spirits", {})
            for spirit_name, spirit_config in spirits.items():
                if spirit_config.get("enabled", True):
                    emoji = spirit_config.get("emoji", "")
                    if emoji:
                        self._emoji_cache[spirit_name] = emoji
            
            # Add fallback emojis for common spirits not in config
            fallback_emojis = {
                "fox": "🦊",
                "wolf": "🐺", 
                "otter": "🦦",
                "eagle": "🦅",
                "lion": "🦁",
                "tiger": "🐅",
                "dragon": "🐉",
                "bear": "🐻",
                "owl": "🦉",
                "raven": "🐦‍⬛",
                "shark": "🦈",
                "dolphin": "🐬",
                "whale": "🐋",
                "elephant": "🐘",
                "rhino": "🦏",
                "panda": "🐼",
                "koala": "🐨",
                "monkey": "🐵",
                "ape": "🦍",
                "snake": "🐍",
                "lizard": "🦎",
                "turtle": "🐢",
                "frog": "🐸",
                "spider": "🕷️",
                "ant": "🐜",
                "bee": "🐝",
                "butterfly": "🦋",
                "dragonfly": "🦟",
                "phoenix": "🔥",
                "unicorn": "🦄",
                "griffin": "🦅",
                "kraken": "🐙",
                "yeti": "❄️",
                "alien": "👽",
                "robot": "🤖"
            }
            
            # Add fallbacks for any missing emojis
            for spirit, emoji in fallback_emojis.items():
                if spirit not in self._emoji_cache:
                    self._emoji_cache[spirit] = emoji
                    
        except Exception as e:
            print(f"Warning: Could not load emoji configuration: {e}")
            # Use fallback emojis if config loading fails
            self._emoji_cache = {
                "fox": "🦊",
                "wolf": "🐺",
                "otter": "🦦",
                "eagle": "🦅",
                "lion": "🦁",
                "tiger": "🐅",
                "dragon": "🐉"
            }
    
    def get_spirit_emoji(self, spirit: str) -> str:
        """Get the emoji for a specific spirit."""
        if not spirit:
            return "🦊"  # Default to fox
        
        # Normalize spirit name (lowercase, handle variations)
        normalized_spirit = spirit.lower().strip()
        
        # Direct lookup
        if normalized_spirit in self._emoji_cache:
            return self._emoji_cache[normalized_spirit]
        
        # Handle common variations
        variations = {
            "vulpine": "fox",
            "lupine": "wolf", 
            "lupus": "wolf",
            "canine": "wolf",
            "feline": "lion",
            "leonine": "lion",
            "aquiline": "eagle",
            "draconic": "dragon",
            "ursine": "bear",
            "serpentine": "snake",
            "reptilian": "lizard"
        }
        
        if normalized_spirit in variations:
            base_spirit = variations[normalized_spirit]
            if base_spirit in self._emoji_cache:
                return self._emoji_cache[base_spirit]
        
        # Return default fox emoji if not found
        return self._emoji_cache.get("fox", "🦊")
    
    def get_all_emojis(self) -> Dict[str, str]:
        """Get all available spirit emojis."""
        return self._emoji_cache.copy()
    
    def reload_config(self) -> None:
        """Reload the emoji configuration from file."""
        self._emoji_cache.clear()
        self._load_emojis()


# Global instance for easy access
spirit_emoji_service = SpiritEmojiService()
