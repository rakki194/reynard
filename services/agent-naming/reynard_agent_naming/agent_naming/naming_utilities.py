"""
Shared Naming Components
========================

Reusable components and utilities for the agent naming system.
Contains all shared data, utilities, and common functionality.
"""

import json
import random  # nosec B311 - Used for non-cryptographic name generation
from pathlib import Path
from typing import Any

# No direct imports needed from types in this utility module


class NamingDataLoader:
    """Loads and manages all naming data for the system from JSON files."""

    def __init__(self, data_dir: Path | None = None) -> None:
        """Initialize the data loader."""
        # Set data directory - default to data folder relative to this file
        if data_dir is None:
            # Go up from naming_utilities.py -> agent_naming -> reynard_agent_naming -> data
            self.data_dir = Path(__file__).parent.parent / "data"
        else:
            self.data_dir = Path(data_dir)

        self._load_animal_spirits()
        self._load_naming_components()
        self._load_generation_numbers()

    def _load_animal_spirits(self) -> None:
        """Load animal spirit base names from JSON file."""
        animal_spirits_file = self.data_dir / "animal_spirits.json"
        try:
            with animal_spirits_file.open(encoding="utf-8") as f:
                self.animal_spirits = json.load(f)
        except (OSError, json.JSONDecodeError):
            # Fallback to minimal data if JSON loading fails
            self.animal_spirits = {
                "fox": ["Vulpine", "Reynard", "Sage"],
                "wolf": ["Lupus", "Alpha", "Hunter"],
                "otter": ["Lutra", "Bubbles", "Playful"],
            }

    def _load_naming_components(self) -> None:
        """Load naming style components from JSON file."""
        naming_components_file = self.data_dir / "naming_components.json"
        try:
            with naming_components_file.open(encoding="utf-8") as f:
                components = json.load(f)
                self.foundation_suffixes = components.get("foundation_suffixes", [])
                self.exo_suffixes = components.get("exo_suffixes", [])
                self.cyberpunk_prefixes = components.get("cyberpunk_prefixes", [])
                self.cyberpunk_suffixes = components.get("cyberpunk_suffixes", [])
                self.mythological_references = components.get("mythological_references", [])
                self.scientific_prefixes = components.get("scientific_prefixes", [])
                self.scientific_suffixes = components.get("scientific_suffixes", [])
                self.hybrid_references = components.get("hybrid_references", [])
                self.special_designations = components.get("special_designations", [])
        except (OSError, json.JSONDecodeError):
            # Fallback to minimal data if JSON loading fails
            self.foundation_suffixes = ["Prime", "Sage", "Oracle"]
            self.exo_suffixes = ["Strike", "Guard", "Sentinel"]
            self.cyberpunk_prefixes = ["Cyber", "Neo", "Mega"]
            self.cyberpunk_suffixes = ["Nexus", "Grid", "Web"]
            self.mythological_references = ["Atlas", "Prometheus", "Vulcan"]
            self.scientific_prefixes = ["Panthera", "Canis", "Felis"]
            self.scientific_suffixes = ["Leo", "Tigris", "Pardus"]
            self.hybrid_references = ["Atlas", "Prometheus", "Nexus"]
            self.special_designations = ["Alpha", "Beta", "Gamma"]

    def _load_generation_numbers(self) -> None:
        """Load generation numbers with animal spirit significance from JSON file."""
        generation_numbers_file = self.data_dir / "generation_numbers.json"
        try:
            with generation_numbers_file.open(encoding="utf-8") as f:
                self.generation_numbers = json.load(f)
        except (OSError, json.JSONDecodeError):
            # Fallback to minimal data if JSON loading fails
            self.generation_numbers = {
                "fox": [3, 7, 13, 21, 34, 55, 89],
                "wolf": [8, 16, 24, 32, 40, 48, 56],
                "otter": [5, 10, 15, 20, 25, 30, 35],
            }


class NameBuilder:
    """Utility class for building names with various patterns."""

    @staticmethod
    def build_hyphenated_name(components: list[str]) -> str:
        """Build a hyphenated name from components."""
        return "-".join(str(component) for component in components)

    @staticmethod
    def build_underscore_name(components: list[str]) -> str:
        """Build an underscore-separated name from components."""
        return "_".join(str(component) for component in components)

    @staticmethod
    def build_camel_case_name(components: list[str]) -> str:
        """Build a camelCase name from components."""
        if not components:
            return ""
        first = str(components[0]).lower()
        rest = [str(comp).capitalize() for comp in components[1:]]
        return first + "".join(rest)

    @staticmethod
    def build_pascal_case_name(components: list[str]) -> str:
        """Build a PascalCase name from components."""
        return "".join(str(comp).capitalize() for comp in components)

    @staticmethod
    def build_compound_name(components: list[str]) -> str:
        """Build a compound name without separators."""
        return "".join(str(component) for component in components)


class RandomSelector:
    """Utility class for random selection with fallbacks."""

    @staticmethod
    def select_with_fallback(
        items: list[Any], fallback: Any, default_fallback: Any = None
    ) -> Any:
        """Select a random item with fallback options."""
        if not items:
            return fallback or default_fallback
        return random.choice(items)  # nosec B311

    @staticmethod
    def select_spirit_name(spirit_data: dict[str, list[str]], spirit_key: str) -> str:
        """Select a random name for a spirit with fallback."""
        if spirit_key not in spirit_data or not spirit_data:
            spirit_key = "fox"  # Default fallback
        if spirit_key not in spirit_data:
            return "fox"  # Ultimate fallback
        return random.choice(spirit_data[spirit_key])  # nosec B311

    @staticmethod
    def select_generation_number(
        generation_data: dict[str, list[int]], spirit_key: str
    ) -> int:
        """Select a generation number for a spirit with fallback."""
        if spirit_key not in generation_data:
            return random.randint(1, 99)  # nosec B311
        return random.choice(generation_data[spirit_key])  # nosec B311


class NameValidator:
    """Utility class for validating generated names."""

    @staticmethod
    def is_valid_name(name: str) -> bool:
        """Check if a name is valid (not empty, not just whitespace)."""
        return bool(name and name.strip())

    @staticmethod
    def sanitize_name(name: str) -> str:
        """Sanitize a name by removing invalid characters."""
        # Remove or replace invalid characters
        invalid_chars = ["<", ">", ":", '"', "|", "?", "*", "\\", "/"]
        for char in invalid_chars:
            name = name.replace(char, "")
        return name.strip()

    @staticmethod
    def ensure_uniqueness(names: list[str], new_name: str) -> str:
        """Ensure a name is unique by adding a suffix if needed."""
        if new_name not in names:
            return new_name

        counter = 1
        while f"{new_name}-{counter}" in names:
            counter += 1
        return f"{new_name}-{counter}"


class SpiritAnalyzer:
    """Utility class for analyzing names to extract spirit information."""

    def __init__(self, data_loader: NamingDataLoader) -> None:
        """Initialize with data loader."""
        self.data_loader = data_loader

    def detect_spirit(self, name: str) -> str:
        """Detect the spirit from a name."""
        name_lower = name.lower()
        best_match = None
        best_score = 0

        for spirit_key, bases in self.data_loader.animal_spirits.items():
            for base in bases:
                base_lower = base.lower()
                if base_lower in name_lower:
                    # Score based on length of match and position
                    score = len(base_lower)
                    if name_lower.startswith(base_lower):
                        score += 10  # Bonus for prefix match
                    if score > best_score:
                        best_score = score
                        best_match = spirit_key

        return best_match if best_match else "unknown"

    def detect_style(self, name: str) -> str:
        """Detect the style from a name."""
        name_lower = name.lower()
        style_checks = [
            (self.data_loader.cyberpunk_prefixes, "cyberpunk"),
            (self.data_loader.scientific_prefixes, "scientific"),
            (self.data_loader.mythological_references, "mythological"),
            (self.data_loader.foundation_suffixes, "foundation"),
            (self.data_loader.exo_suffixes, "exo"),
            (self.data_loader.hybrid_references, "hybrid"),
        ]

        best_match = None
        best_score = 0

        for components_list, style_name in style_checks:
            for comp in components_list:
                comp_lower = comp.lower()
                if comp_lower in name_lower:
                    # Score based on length of match and position
                    score = len(comp_lower)
                    if name_lower.startswith(comp_lower):
                        score += 20  # Higher bonus for prefix match
                    elif name_lower.startswith(comp_lower + '-'):
                        score += 15  # Bonus for prefix with hyphen
                    if score > best_score:
                        best_score = score
                        best_match = style_name

        return best_match if best_match else "unknown"

    def analyze_name(self, name: str) -> dict[str, str]:
        """Analyze a name to extract spirit and style information."""
        spirit = self.detect_spirit(name)
        style = self.detect_style(name)

        return {
            "spirit": spirit,
            "style": style,
            "components": f"Detected: {spirit}, Style: {style}",
        }
