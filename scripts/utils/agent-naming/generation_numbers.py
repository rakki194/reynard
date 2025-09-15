#!/usr/bin/env python3
"""
Reynard Generation Numbers
==========================

Contains generation and model numbers with animal spirit significance
for the Reynard robot name generator.

This module provides meaningful number sequences that relate to
each animal spirit's characteristics and behaviors.
"""


class GenerationNumbers:
    """Generation numbers with animal spirit significance."""

    def __init__(self) -> None:
        self.generation_numbers = {
            # Canines and Foxes - Fibonacci and Prime sequences
            "fox": [2, 3, 5, 8, 13, 21, 34],  # Fibonacci sequence (golden ratio growth)
            "wolf": [7, 11, 13, 17, 19, 23, 29],  # Prime numbers (pack coordination)
            "coyote": [1, 4, 9, 16, 25, 36, 49],  # Perfect squares (territory mapping)
            "jackal": [2, 4, 8, 16, 32, 64, 128],  # Powers of 2 (nocturnal cycles)
            # Aquatic and Marine - Harmonic and Wave patterns
            "otter": [1, 3, 6, 10, 15, 21, 28],  # Triangular numbers (water flow)
            "dolphin": [1, 5, 12, 22, 35, 51, 70],  # Pentagonal numbers (sonar waves)
            "whale": [
                1,
                6,
                15,
                28,
                45,
                66,
                91,
            ],  # Hexagonal numbers (deep ocean pressure)
            "shark": [
                1,
                7,
                19,
                37,
                61,
                91,
                127,
            ],  # Centered hexagonal (predator efficiency)
            "octopus": [
                1,
                8,
                27,
                64,
                125,
                216,
                343,
            ],  # Perfect cubes (tentacle coordination)
            "axolotl": [1, 2, 4, 8, 16, 32, 64],  # Powers of 2 (regeneration)
            # Birds of Prey and Flight - Geometric and Aerodynamic patterns
            "eagle": [1, 4, 9, 16, 25, 36, 49],  # Perfect squares (soaring altitudes)
            "falcon": [
                1,
                3,
                6,
                10,
                15,
                21,
                28,
            ],  # Triangular numbers (dive trajectories)
            "raven": [
                1,
                5,
                9,
                13,
                17,
                21,
                25,
            ],  # Arithmetic progression (intelligence layers)
            "owl": [1, 2, 3, 5, 8, 13, 21],  # Fibonacci (nocturnal hunting patterns)
            "hawk": [
                1,
                4,
                7,
                10,
                13,
                16,
                19,
            ],  # Arithmetic progression (precision targeting)
            # Big Cats and Predators - Fibonacci and Lucas sequences
            "lion": [2, 1, 3, 4, 7, 11, 18],  # Lucas sequence (pride hierarchy)
            "tiger": [1, 2, 4, 8, 16, 32, 64],  # Powers of 2 (stripe patterns)
            "leopard": [1, 3, 6, 10, 15, 21, 28],  # Triangular numbers (spot density)
            "jaguar": [1, 4, 9, 16, 25, 36, 49],  # Perfect squares (Amazon territories)
            "cheetah": [1, 3, 5, 7, 9, 11, 13],  # Odd numbers (speed bursts)
            "lynx": [
                1,
                2,
                4,
                7,
                11,
                16,
                22,
            ],  # Lazy caterer sequence (terrain adaptation)
            # Bears and Large Mammals - Natural and Hibernation patterns
            "bear": [1, 1, 2, 3, 5, 8, 13],  # Fibonacci (hibernation cycles)
            "panda": [1, 3, 6, 10, 15, 21, 28],  # Triangular numbers (bamboo growth)
            "elephant": [
                1,
                8,
                27,
                64,
                125,
                216,
                343,
            ],  # Perfect cubes (memory formation)
            "rhino": [1, 4, 9, 16, 25, 36, 49],  # Perfect squares (armor plates)
            # Primates and Intelligence - Complex mathematical sequences
            "ape": [1, 5, 12, 22, 35, 51, 70],  # Pentagonal numbers (social complexity)
            "monkey": [1, 3, 6, 10, 15, 21, 28],  # Triangular numbers (agile movement)
            "lemur": [1, 2, 4, 8, 16, 32, 64],  # Powers of 2 (isolation cycles)
            # Reptiles and Amphibians - Growth and Regeneration patterns
            "snake": [1, 2, 3, 5, 8, 13, 21],  # Fibonacci (shedding cycles)
            "lizard": [1, 3, 6, 10, 15, 21, 28],  # Triangular numbers (regeneration)
            "turtle": [1, 4, 9, 16, 25, 36, 49],  # Perfect squares (longevity)
            "frog": [1, 2, 4, 8, 16, 32, 64],  # Powers of 2 (metamorphosis stages)
            # Insects and Arachnids - Geometric and Symmetry patterns
            "spider": [1, 8, 27, 64, 125, 216, 343],  # Perfect cubes (web construction)
            "ant": [
                1,
                3,
                6,
                10,
                15,
                21,
                28,
            ],  # Triangular numbers (colony organization)
            "bee": [1, 6, 15, 28, 45, 66, 91],  # Hexagonal numbers (hive structure)
            "mantis": [1, 2, 3, 5, 8, 13, 21],  # Fibonacci (prayer positions)
            "dragonfly": [
                1,
                4,
                9,
                16,
                25,
                36,
                49,
            ],  # Perfect squares (wing frequencies)
            # Exotic and Unique - Special mathematical sequences
            "pangolin": [
                1,
                3,
                6,
                10,
                15,
                21,
                28,
            ],  # Triangular numbers (scale patterns)
            "platypus": [1, 2, 4, 8, 16, 32, 64],  # Powers of 2 (unique evolution)
            "narwhal": [1, 5, 12, 22, 35, 51, 70],  # Pentagonal numbers (tusk spirals)
            "quokka": [1, 1, 2, 3, 5, 8, 13],  # Fibonacci (smile frequency)
            "capybara": [1, 3, 6, 10, 15, 21, 28],  # Triangular numbers (social groups)
            "aye": [1, 2, 4, 7, 11, 16, 22],  # Lazy caterer (foraging patterns)
            "kiwi": [1, 2, 3, 5, 8, 13, 21],  # Fibonacci (adaptation cycles)
            "toucan": [1, 4, 9, 16, 25, 36, 49],  # Perfect squares (beak patterns)
            "flamingo": [
                1,
                6,
                15,
                28,
                45,
                66,
                91,
            ],  # Hexagonal numbers (flock formation)
            "peacock": [
                1,
                8,
                27,
                64,
                125,
                216,
                343,
            ],  # Perfect cubes (feather displays)
        }

    def get_numbers(self, spirit: str) -> list[int]:
        """Get generation numbers for a specific animal spirit."""
        return self.generation_numbers.get(spirit, [1, 2, 3, 4, 5, 6, 7])

    def get_number_count(self, spirit: str) -> int:
        """Get the number of generation numbers available for a spirit."""
        return len(self.generation_numbers.get(spirit, []))

    def get_all_spirits(self) -> list[str]:
        """Get list of all spirits with generation numbers."""
        return list(self.generation_numbers.keys())

    def get_spirit_significance(self, spirit: str) -> str:
        """Get the significance explanation for a spirit's numbers."""
        significance_map = {
            "fox": "Fibonacci sequence (golden ratio growth patterns)",
            "wolf": "Prime numbers (pack coordination mathematics)",
            "coyote": "Perfect squares (territory mapping geometry)",
            "jackal": "Powers of 2 (nocturnal cycle mathematics)",
            "otter": "Triangular numbers (water flow dynamics)",
            "dolphin": "Pentagonal numbers (sonar wave mathematics)",
            "whale": "Hexagonal numbers (deep ocean pressure geometry)",
            "shark": "Centered hexagonal (predator efficiency patterns)",
            "octopus": "Perfect cubes (tentacle coordination mathematics)",
            "axolotl": "Powers of 2 (regeneration exponential growth)",
            "eagle": "Perfect squares (soaring altitude mathematics)",
            "falcon": "Triangular numbers (dive trajectory geometry)",
            "raven": "Arithmetic progression (intelligence layer mathematics)",
            "owl": "Fibonacci sequence (nocturnal hunting patterns)",
            "hawk": "Arithmetic progression (precision targeting mathematics)",
            "lion": "Lucas sequence (pride hierarchy mathematics)",
            "tiger": "Powers of 2 (stripe pattern binary mathematics)",
            "leopard": "Triangular numbers (spot density geometry)",
            "jaguar": "Perfect squares (Amazon territory mathematics)",
            "cheetah": "Odd numbers (speed burst arithmetic)",
            "lynx": "Lazy caterer sequence (terrain adaptation mathematics)",
            "bear": "Fibonacci sequence (hibernation cycle mathematics)",
            "panda": "Triangular numbers (bamboo growth geometry)",
            "elephant": "Perfect cubes (memory formation mathematics)",
            "rhino": "Perfect squares (armor plate geometry)",
            "ape": "Pentagonal numbers (social complexity mathematics)",
            "monkey": "Triangular numbers (agile movement geometry)",
            "lemur": "Powers of 2 (isolation cycle mathematics)",
            "snake": "Fibonacci sequence (shedding cycle mathematics)",
            "lizard": "Triangular numbers (regeneration geometry)",
            "turtle": "Perfect squares (longevity milestone mathematics)",
            "frog": "Powers of 2 (metamorphosis stage mathematics)",
            "spider": "Perfect cubes (web construction mathematics)",
            "ant": "Triangular numbers (colony organization geometry)",
            "bee": "Hexagonal numbers (hive structure mathematics)",
            "mantis": "Fibonacci sequence (prayer position mathematics)",
            "dragonfly": "Perfect squares (wing frequency mathematics)",
            "pangolin": "Triangular numbers (scale pattern geometry)",
            "platypus": "Powers of 2 (unique evolution mathematics)",
            "narwhal": "Pentagonal numbers (tusk spiral mathematics)",
            "quokka": "Fibonacci sequence (smile frequency mathematics)",
            "capybara": "Triangular numbers (social group geometry)",
            "aye": "Lazy caterer sequence (foraging pattern mathematics)",
            "kiwi": "Fibonacci sequence (adaptation cycle mathematics)",
            "toucan": "Perfect squares (beak pattern mathematics)",
            "flamingo": "Hexagonal numbers (flock formation mathematics)",
            "peacock": "Perfect cubes (feather display mathematics)",
        }
        return significance_map.get(spirit, "Generic numbering sequence")
