"""
Animal Spirit Name Generator
===========================

Generates unique animal spirit-based names with varied patterns.
This generator creates names that reflect the essence and characteristics
of different animal spirits while maintaining uniqueness across styles.
"""

import random  # nosec B311 - Used for non-cryptographic name generation

from ..naming_utilities import NameBuilder, NamingDataLoader, RandomSelector
from ..types import AgentName, AnimalSpirit, NamingStyle


class AnimalSpiritGenerator:
    """Generates animal spirit-based names with unique patterns."""

    def __init__(self) -> None:
        """Initialize the animal spirit generator."""
        self.data_loader = NamingDataLoader()
        self.name_builder = NameBuilder()
        self.selector = RandomSelector()

    def generate_spirit_name(
        self, spirit: AnimalSpirit | None = None, style: NamingStyle | None = None
    ) -> AgentName:
        """Generate a unique animal spirit name based on style."""
        if not spirit:
            spirit = AnimalSpirit(random.choice(list(AnimalSpirit)))  # nosec B311

        if not style:
            style = NamingStyle(random.choice(list(NamingStyle)))  # nosec B311

        # Route to specific style generator
        if style == NamingStyle.FOUNDATION:
            return self._generate_foundation_spirit_name(spirit)
        elif style == NamingStyle.EXO:
            return self._generate_exo_spirit_name(spirit)
        elif style == NamingStyle.CYBERPUNK:
            return self._generate_cyberpunk_spirit_name(spirit)
        elif style == NamingStyle.MYTHOLOGICAL:
            return self._generate_mythological_spirit_name(spirit)
        elif style == NamingStyle.SCIENTIFIC:
            return self._generate_scientific_spirit_name(spirit)
        elif style == NamingStyle.HYBRID:
            return self._generate_hybrid_spirit_name(spirit)
        else:
            return self._generate_foundation_spirit_name(spirit)

    def _generate_foundation_spirit_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Foundation-style spirit name: [Spirit] + [Suffix] + [Generation]"""
        spirit_key = spirit.value
        base_name = self.selector.select_spirit_name(
            self.data_loader.animal_spirits, spirit_key
        )
        suffix = self.selector.select_with_fallback(
            self.data_loader.foundation_suffixes, "Prime"
        )
        generation = self.selector.select_generation_number(
            self.data_loader.generation_numbers, spirit_key
        )

        name = self.name_builder.build_hyphenated_name([base_name, suffix, generation])
        components = [base_name, suffix, str(generation)]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.FOUNDATION,
            components=components,
            generation_number=generation,
        )

    def _generate_exo_spirit_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Exo-style spirit name: [Spirit] + [Suffix] + [Model]"""
        spirit_key = spirit.value
        base_name = self.selector.select_spirit_name(
            self.data_loader.animal_spirits, spirit_key
        )
        suffix = self.selector.select_with_fallback(
            self.data_loader.exo_suffixes, "Unit"
        )
        model = self.selector.select_generation_number(
            self.data_loader.generation_numbers, spirit_key
        )

        name = self.name_builder.build_hyphenated_name([base_name, suffix, model])
        components = [base_name, suffix, str(model)]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.EXO,
            components=components,
            generation_number=model,
        )

    def _generate_cyberpunk_spirit_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Cyberpunk-style spirit name: [Tech Prefix] + [Spirit] + [Cyber Suffix]"""
        spirit_key = spirit.value
        prefix = self.selector.select_with_fallback(
            self.data_loader.cyberpunk_prefixes, "Cyber"
        )
        base_name = self.selector.select_spirit_name(
            self.data_loader.animal_spirits, spirit_key
        )
        suffix = self.selector.select_with_fallback(
            self.data_loader.cyberpunk_suffixes, "Nexus"
        )

        name = self.name_builder.build_hyphenated_name([prefix, base_name, suffix])
        components = [prefix, base_name, suffix]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.CYBERPUNK,
            components=components,
        )

    def _generate_mythological_spirit_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Mythological-style spirit name: [Mythological] + [Spirit] + [Divine]"""
        spirit_key = spirit.value
        myth_ref = self.selector.select_with_fallback(
            self.data_loader.mythological_references, "Atlas"
        )
        base_name = self.selector.select_spirit_name(
            self.data_loader.animal_spirits, spirit_key
        )
        divine_suffix = self.selector.select_with_fallback(
            [
                "Divine", "Sacred", "Holy", "Blessed", "Chosen", "Anointed",
                "Consecrated", "Hallowed", "Revered", "Venerated", "Exalted",
                "Transcendent", "Eternal"
            ],
            "Divine"
        )

        name = self.name_builder.build_hyphenated_name([myth_ref, base_name, divine_suffix])
        components = [myth_ref, base_name, divine_suffix]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.MYTHOLOGICAL,
            components=components,
        )

    def _generate_scientific_spirit_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Scientific-style spirit name: [Scientific] + [Spirit] + [Classification]"""
        spirit_key = spirit.value
        scientific_prefix = self.selector.select_with_fallback(
            self.data_loader.scientific_prefixes, "Canis"
        )
        base_name = self.selector.select_spirit_name(
            self.data_loader.animal_spirits, spirit_key
        )
        classification = self.selector.select_with_fallback(
            [
                "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta",
                "Theta", "Prime", "Secondary", "Tertiary", "Type-A", "Type-B",
                "Class-1", "Class-2"
            ],
            "Alpha"
        )

        name = self.name_builder.build_hyphenated_name([scientific_prefix, base_name, classification])
        components = [scientific_prefix, base_name, classification]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.SCIENTIFIC,
            components=components,
        )

    def _generate_hybrid_spirit_name(self, spirit: AnimalSpirit) -> AgentName:
        """Generate Hybrid-style spirit name: [Spirit] + [Reference] + [Designation]"""
        spirit_key = spirit.value
        base_name = self.selector.select_spirit_name(
            self.data_loader.animal_spirits, spirit_key
        )
        reference = self.selector.select_with_fallback(
            self.data_loader.hybrid_references, "Nexus"
        )
        designation = self.selector.select_with_fallback(
            self.data_loader.special_designations, "Prime"
        )

        name = self.name_builder.build_hyphenated_name([base_name, reference, designation])
        components = [base_name, reference, designation]

        return AgentName(
            name=name,
            spirit=spirit,
            style=NamingStyle.HYBRID,
            components=components,
        )

    def generate_random_spirit_name(self, spirit: AnimalSpirit | None = None) -> AgentName:
        """Generate a random style spirit name."""
        if not spirit:
            spirit = AnimalSpirit(random.choice(list(AnimalSpirit)))  # nosec B311

        styles = [
            NamingStyle.FOUNDATION,
            NamingStyle.EXO,
            NamingStyle.HYBRID,
            NamingStyle.CYBERPUNK,
            NamingStyle.MYTHOLOGICAL,
            NamingStyle.SCIENTIFIC,
        ]
        style = random.choice(styles)  # nosec B311
        return self.generate_spirit_name(spirit, style)

    def get_spirit_info(self, name: str) -> dict[str, str]:
        """Analyze a generated name to extract spirit information."""
        from ..naming_utilities import SpiritAnalyzer

        analyzer = SpiritAnalyzer(self.data_loader)
        return analyzer.analyze_name(name)
