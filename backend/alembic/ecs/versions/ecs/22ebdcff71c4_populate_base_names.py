"""populate_base_names

Revision ID: 22ebdcff71c4
Revises: 9f94d908afb9
Create Date: 2025-09-21 09:33:55.024594

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "22ebdcff71c4"
down_revision: str | Sequence[str] | None = "9f94d908afb9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Populate base names for all naming spirits."""
    # Get table reference
    naming_spirits = sa.table(
        "naming_spirits", sa.column("name", sa.String), sa.column("base_names", sa.JSON),
    )

    # Define the spirit names from the agent naming service
    spirit_names_dict = {
        "fox": ["Vulpine", "Reynard", "Kitsune", "Sly", "Cunning", "Swift"],
        "wolf": ["Lupus", "Fenrir", "Alpha", "Hunter", "Pack", "Fierce"],
        "otter": ["Lutra", "Aqua", "Playful", "Graceful", "Sleek", "Fluid"],
        "dragon": ["Draco", "Wyrm", "Ancient", "Elder", "Primordial", "Mighty"],
        "phoenix": ["Phoenix", "Firebird", "Rebirth", "Renewal", "Eternal", "Radiant"],
        "eagle": ["Aquila", "Golden", "Soaring", "Majestic", "Noble", "Regal"],
        "lion": ["Leo", "King", "Mane", "Pride", "Royal", "Imperial"],
        "tiger": ["Tigris", "Bengal", "Siberian", "Striped", "Fierce", "Powerful"],
        "bear": ["Ursa", "Grizzly", "Polar", "Mountain", "Forest", "Wild"],
        "owl": ["Strix", "Wise", "Nocturnal", "Sage", "Watching", "Silent"],
        "raven": ["Corvus", "Dark", "Mysterious", "Clever", "Wise", "Ancient"],
        "shark": ["Carcharodon", "Ocean", "Predator", "Swift", "Fierce", "Deep"],
        "elephant": ["Elephas", "Memory", "Wise", "Gentle", "Giant", "Noble"],
        "cheetah": ["Acinonyx", "Speed", "Swift", "Hunting", "Graceful", "Fast"],
        "lynx": ["Lynx", "Wild", "Mountain", "Fierce", "Independent", "Sharp"],
        "coyote": ["Canis", "Trickster", "Wild", "Clever", "Adaptable", "Survivor"],
        "jaguar": ["Panthera", "Jungle", "Powerful", "Stealth", "Fierce", "Wild"],
        "leopard": ["Panthera", "Spotted", "Stealth", "Fierce", "Wild", "Graceful"],
        "spider": ["Arachnid", "Web", "Silent", "Patient", "Clever", "Stealthy"],
        "alien": [
            "Xeno",
            "Otherworldly",
            "Mysterious",
            "Advanced",
            "Strange",
            "Unknown",
        ],
        "peacock": ["Pavo", "Colorful", "Proud", "Beautiful", "Majestic", "Display"],
        "monkey": ["Simian", "Clever", "Agile", "Playful", "Curious", "Intelligent"],
        "whale": ["Cetacean", "Ocean", "Gentle", "Massive", "Wise", "Deep"],
        "octopus": [
            "Cephalopod",
            "Eight",
            "Clever",
            "Flexible",
            "Ocean",
            "Intelligent",
        ],
        "rhino": ["Rhinoceros", "Horn", "Powerful", "Ancient", "Massive", "Wild"],
        "lemur": ["Primate", "Madagascar", "Agile", "Playful", "Curious", "Tree"],
        "frog": ["Anura", "Amphibian", "Leaping", "Water", "Green", "Croaking"],
        "pangolin": ["Manis", "Scaly", "Armored", "Anteater", "Unique", "Ancient"],
        "platypus": [
            "Ornithorhynchus",
            "Duck",
            "Bill",
            "Unique",
            "Water",
            "Mysterious",
        ],
        "capybara": ["Hydrochoerus", "Water", "Pig", "Gentle", "Large", "Social"],
        "dolphin": ["Delphinus", "Ocean", "Intelligent", "Playful", "Social", "Wise"],
        "kiwi": ["Apteryx", "Flightless", "Nocturnal", "Unique", "New", "Zealand"],
        "flamingo": [
            "Phoenicopterus",
            "Pink",
            "Graceful",
            "Water",
            "Elegant",
            "Standing",
        ],
        "narwhal": ["Monodon", "Unicorn", "Whale", "Arctic", "Tusked", "Mysterious"],
        "aye": ["Aye", "Aye", "Nocturnal", "Primate", "Madagascar", "Lemur"],
        "dragonfly": ["Odonata", "Winged", "Swift", "Flying", "Graceful", "Ancient"],
        "snake": ["Serpens", "Slithering", "Sinuous", "Wise", "Ancient", "Mysterious"],
        "ape": ["Simian", "Primate", "Intelligent", "Clever", "Strong", "Wise"],
        "jackal": ["Canis", "Wild", "Clever", "Adaptable", "Survivor", "Pack"],
        "quokka": ["Setonix", "Smiling", "Happy", "Marsupial", "Australia", "Cute"],
        "lizard": ["Lacerta", "Scaly", "Reptile", "Quick", "Agile", "Ancient"],
        "toucan": ["Ramphastos", "Colorful", "Beak", "Tropical", "Bright", "Vibrant"],
        "falcon": ["Falco", "Swift", "Hunting", "Fierce", "Flying", "Predator"],
        "mantis": ["Mantis", "Praying", "Insect", "Patient", "Stealthy", "Predator"],
        "turtle": ["Testudo", "Shell", "Ancient", "Wise", "Slow", "Patient"],
        "bee": ["Apis", "Honey", "Worker", "Busy", "Swarm", "Industrious"],
        "panda": ["Ailuropoda", "Bamboo", "Gentle", "Black", "White", "Cute"],
        "hawk": ["Accipiter", "Swift", "Hunting", "Fierce", "Flying", "Predator"],
        "ant": ["Formica", "Worker", "Colony", "Industrious", "Organized", "Strong"],
        "axolotl": [
            "Ambystoma",
            "Mexican",
            "Walking",
            "Fish",
            "Regenerative",
            "Unique",
        ],
    }

    # Update each spirit with its base names
    for spirit_name, names in spirit_names_dict.items():
        op.execute(
            naming_spirits.update()
            .where(naming_spirits.c.name == spirit_name)
            .values(base_names=names),
        )


def downgrade() -> None:
    """Clear base names for all naming spirits."""
    # Get table reference
    naming_spirits = sa.table(
        "naming_spirits", sa.column("name", sa.String), sa.column("base_names", sa.JSON),
    )

    # Clear all base names
    op.execute(naming_spirits.update().values(base_names=[]))
