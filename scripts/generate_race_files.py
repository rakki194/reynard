#!/usr/bin/env python3
"""
Generate Race Files Script
==========================

This script generates all missing race files for the ECS naming system
from the comprehensive name pools defined in the agent naming system.
"""

import json
import sys
from pathlib import Path

# Add the utils directory to the path so we can import name_pools
sys.path.append(str(Path(__file__).parent / "utils" / "agent-naming"))

from name_pools import AnimalSpiritPools


def get_spirit_metadata():
    """Get metadata for each spirit including category, description, traits, and emoji."""
    return {
        # Canines and Foxes
        "fox": {
            "category": "canines_and_foxes",
            "description": "Cunning and intelligent canines known for their strategic thinking and adaptability",
            "traits": ["cunning", "intelligent", "adaptable", "strategic", "graceful"],
            "emoji": "🦊",
            "generation_numbers": [3, 7, 13, 21, 34, 55, 89],
        },
        "wolf": {
            "category": "canines_and_foxes",
            "description": "Pack-oriented canines known for loyalty, coordination, and protective instincts",
            "traits": ["loyal", "protective", "coordinated", "fierce", "pack-oriented"],
            "emoji": "🐺",
            "generation_numbers": [8, 16, 24, 32, 40, 48, 56],
        },
        "coyote": {
            "category": "canines_and_foxes",
            "description": "Adaptable canines known for their resourcefulness and survival skills",
            "traits": ["adaptable", "resourceful", "survivor", "clever", "independent"],
            "emoji": "🐺",
            "generation_numbers": [4, 8, 12, 16, 20, 24, 28],
        },
        "jackal": {
            "category": "canines_and_foxes",
            "description": "Opportunistic canines known for their stealth and cunning",
            "traits": [
                "stealthy",
                "opportunistic",
                "cunning",
                "nocturnal",
                "persistent",
            ],
            "emoji": "🐺",
            "generation_numbers": [5, 10, 15, 20, 25, 30, 35],
        },
        # Aquatic and Marine
        "otter": {
            "category": "aquatic_and_marine",
            "description": "Playful aquatic mammals known for their joy and thoroughness",
            "traits": ["playful", "thorough", "joyful", "aquatic", "social"],
            "emoji": "🦦",
            "generation_numbers": [5, 10, 15, 20, 25, 30, 35],
        },
        "dolphin": {
            "category": "aquatic_and_marine",
            "description": "Intelligent marine mammals known for communication and social behavior",
            "traits": [
                "intelligent",
                "social",
                "communicative",
                "playful",
                "cooperative",
            ],
            "emoji": "🐬",
            "generation_numbers": [6, 12, 18, 24, 30, 36, 42],
        },
        "whale": {
            "category": "aquatic_and_marine",
            "description": "Majestic marine giants known for their wisdom and depth",
            "traits": ["wise", "majestic", "deep", "ancient", "powerful"],
            "emoji": "🐋",
            "generation_numbers": [7, 14, 21, 28, 35, 42, 49],
        },
        "shark": {
            "category": "aquatic_and_marine",
            "description": "Apex predators of the sea known for their efficiency and focus",
            "traits": [
                "efficient",
                "focused",
                "predatory",
                "streamlined",
                "relentless",
            ],
            "emoji": "🦈",
            "generation_numbers": [2, 4, 6, 8, 10, 12, 14],
        },
        "octopus": {
            "category": "aquatic_and_marine",
            "description": "Intelligent cephalopods known for their problem-solving and adaptability",
            "traits": [
                "intelligent",
                "adaptable",
                "problem-solver",
                "flexible",
                "mysterious",
            ],
            "emoji": "🐙",
            "generation_numbers": [8, 16, 24, 32, 40, 48, 56],
        },
        "axolotl": {
            "category": "aquatic_and_marine",
            "description": "Regenerative amphibians known for their healing abilities and uniqueness",
            "traits": ["regenerative", "healing", "unique", "resilient", "mystical"],
            "emoji": "🦎",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        # Birds of Prey and Flight
        "eagle": {
            "category": "birds_of_prey_and_flight",
            "description": "Majestic birds of prey known for their vision and leadership",
            "traits": ["visionary", "leadership", "majestic", "focused", "soaring"],
            "emoji": "🦅",
            "generation_numbers": [12, 24, 36, 48, 60, 72, 84],
        },
        "falcon": {
            "category": "birds_of_prey_and_flight",
            "description": "Swift birds of prey known for their speed and precision",
            "traits": ["swift", "precise", "focused", "fast", "accurate"],
            "emoji": "🦅",
            "generation_numbers": [3, 6, 9, 12, 15, 18, 21],
        },
        "raven": {
            "category": "birds_of_prey_and_flight",
            "description": "Intelligent corvids known for their wisdom and mystery",
            "traits": ["wise", "mysterious", "intelligent", "observant", "symbolic"],
            "emoji": "🐦‍⬛",
            "generation_numbers": [13, 26, 39, 52, 65, 78, 91],
        },
        "owl": {
            "category": "birds_of_prey_and_flight",
            "description": "Nocturnal birds of prey known for their wisdom and stealth",
            "traits": ["wise", "nocturnal", "stealthy", "patient", "observant"],
            "emoji": "🦉",
            "generation_numbers": [11, 22, 33, 44, 55, 66, 77],
        },
        "hawk": {
            "category": "birds_of_prey_and_flight",
            "description": "Sharp-eyed birds of prey known for their focus and determination",
            "traits": ["focused", "determined", "sharp-eyed", "agile", "persistent"],
            "emoji": "🦅",
            "generation_numbers": [9, 18, 27, 36, 45, 54, 63],
        },
        # Big Cats and Predators
        "lion": {
            "category": "big_cats_and_predators",
            "description": "Majestic big cats known for their leadership and pride",
            "traits": ["leadership", "pride", "majestic", "bold", "protective"],
            "emoji": "🦁",
            "generation_numbers": [1, 2, 3, 5, 8, 13, 21],
        },
        "tiger": {
            "category": "big_cats_and_predators",
            "description": "Powerful big cats known for their strength and ferocity",
            "traits": ["powerful", "ferocious", "strong", "independent", "fierce"],
            "emoji": "🐅",
            "generation_numbers": [9, 18, 27, 36, 45, 54, 63],
        },
        "leopard": {
            "category": "big_cats_and_predators",
            "description": "Stealthy big cats known for their agility and camouflage",
            "traits": ["stealthy", "agile", "camouflaged", "patient", "adaptable"],
            "emoji": "🐆",
            "generation_numbers": [7, 14, 21, 28, 35, 42, 49],
        },
        "jaguar": {
            "category": "big_cats_and_predators",
            "description": "Powerful big cats known for their strength and swimming ability",
            "traits": ["powerful", "aquatic", "strong", "territorial", "fierce"],
            "emoji": "🐆",
            "generation_numbers": [6, 12, 18, 24, 30, 36, 42],
        },
        "cheetah": {
            "category": "big_cats_and_predators",
            "description": "Fastest land animals known for their speed and grace",
            "traits": ["fast", "graceful", "speed", "agile", "focused"],
            "emoji": "🐆",
            "generation_numbers": [4, 8, 12, 16, 20, 24, 28],
        },
        "lynx": {
            "category": "big_cats_and_predators",
            "description": "Stealthy wild cats known for their tufted ears and hunting skills",
            "traits": ["stealthy", "hunting", "tufted", "mountain", "solitary"],
            "emoji": "🐱",
            "generation_numbers": [5, 10, 15, 20, 25, 30, 35],
        },
        # Bears and Large Mammals
        "bear": {
            "category": "bears_and_large_mammals",
            "description": "Powerful omnivores known for their strength and seasonal wisdom",
            "traits": ["powerful", "strong", "seasonal", "protective", "wise"],
            "emoji": "🐻",
            "generation_numbers": [10, 20, 30, 40, 50, 60, 70],
        },
        "panda": {
            "category": "bears_and_large_mammals",
            "description": "Gentle giants known for their peaceful nature and bamboo diet",
            "traits": ["gentle", "peaceful", "bamboo", "endangered", "calm"],
            "emoji": "🐼",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "elephant": {
            "category": "bears_and_large_mammals",
            "description": "Wise giants known for their memory and family bonds",
            "traits": ["wise", "memory", "family", "gentle", "ancient"],
            "emoji": "🐘",
            "generation_numbers": [15, 30, 45, 60, 75, 90, 105],
        },
        "rhino": {
            "category": "bears_and_large_mammals",
            "description": "Armored giants known for their strength and territorial nature",
            "traits": ["armored", "strong", "territorial", "endangered", "powerful"],
            "emoji": "🦏",
            "generation_numbers": [8, 16, 24, 32, 40, 48, 56],
        },
        # Primates and Intelligence
        "ape": {
            "category": "primates_and_intelligence",
            "description": "Intelligent primates known for their tool use and social complexity",
            "traits": ["intelligent", "tool-using", "social", "complex", "strong"],
            "emoji": "🦍",
            "generation_numbers": [11, 22, 33, 44, 55, 66, 77],
        },
        "monkey": {
            "category": "primates_and_intelligence",
            "description": "Agile primates known for their curiosity and social behavior",
            "traits": ["agile", "curious", "social", "playful", "adaptable"],
            "emoji": "🐵",
            "generation_numbers": [6, 12, 18, 24, 30, 36, 42],
        },
        "lemur": {
            "category": "primates_and_intelligence",
            "description": "Unique primates known for their diversity and island adaptation",
            "traits": ["unique", "diverse", "island", "nocturnal", "endemic"],
            "emoji": "🦝",
            "generation_numbers": [4, 8, 12, 16, 20, 24, 28],
        },
        # Reptiles and Amphibians
        "snake": {
            "category": "reptiles_and_amphibians",
            "description": "Serpentine reptiles known for their patience and transformation",
            "traits": [
                "patient",
                "transformative",
                "serpentine",
                "mysterious",
                "renewal",
            ],
            "emoji": "🐍",
            "generation_numbers": [7, 14, 21, 28, 35, 42, 49],
        },
        "lizard": {
            "category": "reptiles_and_amphibians",
            "description": "Adaptable reptiles known for their regeneration and diversity",
            "traits": ["adaptable", "regenerative", "diverse", "scaled", "ancient"],
            "emoji": "🦎",
            "generation_numbers": [5, 10, 15, 20, 25, 30, 35],
        },
        "turtle": {
            "category": "reptiles_and_amphibians",
            "description": "Ancient reptiles known for their longevity and wisdom",
            "traits": ["ancient", "long-lived", "wise", "patient", "protective"],
            "emoji": "🐢",
            "generation_numbers": [20, 40, 60, 80, 100, 120, 140],
        },
        "frog": {
            "category": "reptiles_and_amphibians",
            "description": "Amphibious creatures known for their transformation and adaptability",
            "traits": [
                "transformative",
                "adaptable",
                "amphibious",
                "vocal",
                "colorful",
            ],
            "emoji": "🐸",
            "generation_numbers": [3, 6, 9, 12, 15, 18, 21],
        },
        # Insects and Arachnids
        "spider": {
            "category": "insects_and_arachnids",
            "description": "Web-weaving arachnids known for their patience and precision",
            "traits": [
                "patient",
                "precise",
                "web-weaving",
                "eight-legged",
                "strategic",
            ],
            "emoji": "🕷️",
            "generation_numbers": [8, 16, 24, 32, 40, 48, 56],
        },
        "ant": {
            "category": "insects_and_arachnids",
            "description": "Social insects known for their cooperation and strength",
            "traits": ["cooperative", "strong", "social", "organized", "persistent"],
            "emoji": "🐜",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "bee": {
            "category": "insects_and_arachnids",
            "description": "Pollinating insects known for their industry and community",
            "traits": ["industrious", "community", "pollinating", "honey", "organized"],
            "emoji": "🐝",
            "generation_numbers": [6, 12, 18, 24, 30, 36, 42],
        },
        "mantis": {
            "category": "insects_and_arachnids",
            "description": "Praying insects known for their patience and precision strikes",
            "traits": ["patient", "precise", "praying", "stealthy", "focused"],
            "emoji": "🦗",
            "generation_numbers": [4, 8, 12, 16, 20, 24, 28],
        },
        "dragonfly": {
            "category": "insects_and_arachnids",
            "description": "Agile flying insects known for their speed and precision",
            "traits": ["agile", "fast", "precise", "flying", "predatory"],
            "emoji": "🦟",
            "generation_numbers": [2, 4, 6, 8, 10, 12, 14],
        },
        # Exotic and Unique
        "pangolin": {
            "category": "exotic_and_unique",
            "description": "Scaly anteaters known for their unique armor and rarity",
            "traits": ["unique", "armored", "scaled", "rare", "endangered"],
            "emoji": "🦎",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "platypus": {
            "category": "exotic_and_unique",
            "description": "Unique monotremes known for their bizarre combination of traits",
            "traits": ["unique", "bizarre", "monotreme", "venomous", "aquatic"],
            "emoji": "🦆",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "narwhal": {
            "category": "exotic_and_unique",
            "description": "Arctic unicorns of the sea known for their mystical tusks",
            "traits": ["mystical", "arctic", "unicorn", "tusked", "mysterious"],
            "emoji": "🦄",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "quokka": {
            "category": "exotic_and_unique",
            "description": "Happy marsupials known for their perpetual smile and friendliness",
            "traits": ["happy", "friendly", "smiling", "marsupial", "endemic"],
            "emoji": "🐨",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "capybara": {
            "category": "exotic_and_unique",
            "description": "Giant rodents known for their calm nature and social behavior",
            "traits": ["calm", "social", "giant", "rodent", "peaceful"],
            "emoji": "🐹",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "aye": {
            "category": "exotic_and_unique",
            "description": "Nocturnal lemurs known for their unique appearance and behavior",
            "traits": ["nocturnal", "unique", "lemur", "endangered", "mysterious"],
            "emoji": "🦝",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "kiwi": {
            "category": "exotic_and_unique",
            "description": "Flightless birds known for their uniqueness and national symbol status",
            "traits": ["flightless", "unique", "national", "nocturnal", "endemic"],
            "emoji": "🐦",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "toucan": {
            "category": "exotic_and_unique",
            "description": "Colorful birds known for their distinctive beaks and tropical habitat",
            "traits": ["colorful", "tropical", "beaked", "bright", "social"],
            "emoji": "🦜",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "flamingo": {
            "category": "exotic_and_unique",
            "description": "Pink wading birds known for their elegance and balance",
            "traits": ["elegant", "balanced", "pink", "wading", "social"],
            "emoji": "🦩",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "peacock": {
            "category": "exotic_and_unique",
            "description": "Majestic birds known for their stunning displays and beauty",
            "traits": ["majestic", "beautiful", "displaying", "colorful", "proud"],
            "emoji": "🦚",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        # Mythical and Legendary
        "dragon": {
            "category": "mythical_and_legendary",
            "description": "Ancient mythical creatures known for their power and wisdom",
            "traits": ["powerful", "wise", "ancient", "mythical", "elemental"],
            "emoji": "🐉",
            "generation_numbers": [1, 2, 4, 8, 16, 32, 64],
        },
        "phoenix": {
            "category": "mythical_and_legendary",
            "description": "Immortal birds known for their rebirth and renewal",
            "traits": ["immortal", "rebirth", "renewal", "fire", "transformation"],
            "emoji": "🔥",
            "generation_numbers": [7, 14, 21, 28, 35, 42, 49],
        },
        "griffin": {
            "category": "mythical_and_legendary",
            "description": "Majestic hybrid creatures combining eagle and lion traits",
            "traits": ["majestic", "hybrid", "noble", "protective", "powerful"],
            "emoji": "🦅",
            "generation_numbers": [6, 12, 18, 24, 30, 36, 42],
        },
        "unicorn": {
            "category": "mythical_and_legendary",
            "description": "Pure magical creatures known for their healing and purity",
            "traits": ["pure", "magical", "healing", "mystical", "rare"],
            "emoji": "🦄",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "kraken": {
            "category": "mythical_and_legendary",
            "description": "Giant sea monsters known for their power and mystery",
            "traits": ["giant", "powerful", "mysterious", "aquatic", "legendary"],
            "emoji": "🐙",
            "generation_numbers": [8, 16, 24, 32, 40, 48, 56],
        },
        "basilisk": {
            "category": "mythical_and_legendary",
            "description": "Serpent kings known for their deadly gaze and regal nature",
            "traits": ["deadly", "regal", "serpentine", "powerful", "mythical"],
            "emoji": "🐍",
            "generation_numbers": [3, 6, 9, 12, 15, 18, 21],
        },
        "chimera": {
            "category": "mythical_and_legendary",
            "description": "Hybrid monsters combining multiple animal traits",
            "traits": ["hybrid", "monstrous", "powerful", "chaotic", "mythical"],
            "emoji": "🦁",
            "generation_numbers": [5, 10, 15, 20, 25, 30, 35],
        },
        "sphinx": {
            "category": "mythical_and_legendary",
            "description": "Wise guardians known for their riddles and protection",
            "traits": ["wise", "guardian", "riddling", "protective", "mysterious"],
            "emoji": "🦁",
            "generation_numbers": [4, 8, 12, 16, 20, 24, 28],
        },
        "manticore": {
            "category": "mythical_and_legendary",
            "description": "Deadly hybrid creatures with human, lion, and scorpion traits",
            "traits": ["deadly", "hybrid", "venomous", "powerful", "mythical"],
            "emoji": "🦂",
            "generation_numbers": [6, 12, 18, 24, 30, 36, 42],
        },
        "hydra": {
            "category": "mythical_and_legendary",
            "description": "Multi-headed serpents known for their regeneration and power",
            "traits": [
                "multi-headed",
                "regenerative",
                "powerful",
                "serpentine",
                "mythical",
            ],
            "emoji": "🐍",
            "generation_numbers": [9, 18, 27, 36, 45, 54, 63],
        },
        # Extraterrestrial and Cosmic
        "alien": {
            "category": "extraterrestrial_and_cosmic",
            "description": "Otherworldly beings known for their advanced technology and mystery",
            "traits": [
                "otherworldly",
                "advanced",
                "mysterious",
                "technological",
                "cosmic",
            ],
            "emoji": "👽",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "void": {
            "category": "extraterrestrial_and_cosmic",
            "description": "Cosmic entities representing emptiness and potential",
            "traits": ["cosmic", "empty", "potential", "mysterious", "infinite"],
            "emoji": "🌌",
            "generation_numbers": [0, 1, 2, 3, 4, 5, 6],
        },
        "star": {
            "category": "extraterrestrial_and_cosmic",
            "description": "Celestial bodies known for their light and guidance",
            "traits": ["celestial", "bright", "guiding", "distant", "eternal"],
            "emoji": "⭐",
            "generation_numbers": [1, 2, 4, 8, 16, 32, 64],
        },
        "nebula": {
            "category": "extraterrestrial_and_cosmic",
            "description": "Cosmic clouds known for their beauty and stellar formation",
            "traits": ["cosmic", "beautiful", "forming", "cloudy", "stellar"],
            "emoji": "🌌",
            "generation_numbers": [2, 4, 6, 8, 10, 12, 14],
        },
        "blackhole": {
            "category": "extraterrestrial_and_cosmic",
            "description": "Cosmic singularities known for their gravity and mystery",
            "traits": ["cosmic", "gravitational", "mysterious", "powerful", "singular"],
            "emoji": "🕳️",
            "generation_numbers": [1, 1, 1, 1, 1, 1, 1],
        },
        # Cryptids and Supernatural
        "yeti": {
            "category": "cryptids_and_supernatural",
            "description": "Mountain cryptids known for their strength and elusiveness",
            "traits": ["mountain", "strong", "elusive", "cryptid", "mysterious"],
            "emoji": "❄️",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "loch_ness": {
            "category": "cryptids_and_supernatural",
            "description": "Aquatic cryptids known for their mystery and longevity",
            "traits": ["aquatic", "mysterious", "long-lived", "cryptid", "legendary"],
            "emoji": "🐉",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "chupacabra": {
            "category": "cryptids_and_supernatural",
            "description": "Cryptid predators known for their mysterious attacks",
            "traits": ["predatory", "mysterious", "cryptid", "elusive", "fearsome"],
            "emoji": "🦎",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "wendigo": {
            "category": "cryptids_and_supernatural",
            "description": "Supernatural entities known for their hunger and transformation",
            "traits": [
                "supernatural",
                "hungry",
                "transformative",
                "fearsome",
                "mythical",
            ],
            "emoji": "👹",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
        "skinwalker": {
            "category": "cryptids_and_supernatural",
            "description": "Shape-shifting entities known for their transformation abilities",
            "traits": [
                "shape-shifting",
                "transformative",
                "supernatural",
                "mysterious",
                "powerful",
            ],
            "emoji": "🦅",
            "generation_numbers": [1, 2, 3, 4, 5, 6, 7],
        },
    }


def generate_race_file(spirit_name: str, names: list, metadata: dict, output_dir: Path):
    """Generate a race file for a specific spirit."""
    race_data = {
        "name": spirit_name,
        "category": metadata["category"],
        "description": metadata["description"],
        "traits": metadata["traits"],
        "names": names,
        "generation_numbers": metadata["generation_numbers"],
        "emoji": metadata["emoji"],
    }

    output_file = output_dir / f"{spirit_name}.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(race_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Generated {output_file}")


def main():
    """Generate all race files from the comprehensive name pools."""
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    races_dir = project_root / "backend" / "data" / "ecs" / "races"

    # Ensure the races directory exists
    races_dir.mkdir(parents=True, exist_ok=True)

    # Initialize the name pools
    name_pools = AnimalSpiritPools()
    spirit_metadata = get_spirit_metadata()

    # Get all available spirits from the name pools
    available_spirits = name_pools.animal_spirits.keys()

    print(f"🦊 Generating race files for {len(available_spirits)} spirits...")
    print(f"📁 Output directory: {races_dir}")

    generated_count = 0
    skipped_count = 0

    for spirit_name in available_spirits:
        if spirit_name in spirit_metadata:
            names = name_pools.animal_spirits[spirit_name]
            metadata = spirit_metadata[spirit_name]
            generate_race_file(spirit_name, names, metadata, races_dir)
            generated_count += 1
        else:
            print(f"⚠️  No metadata found for {spirit_name}, skipping...")
            skipped_count += 1

    print(f"\n🎯 Generation complete!")
    print(f"✅ Generated: {generated_count} race files")
    print(f"⚠️  Skipped: {skipped_count} spirits")
    print(f"📊 Total spirits available: {len(available_spirits)}")


if __name__ == "__main__":
    main()
