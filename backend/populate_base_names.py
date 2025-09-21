#!/usr/bin/env python3
"""
Populate Base Names in PostgreSQL Database
==========================================

This script populates the missing base_names field in the naming_spirits table
using the data from the agent naming service.
"""

import sys
from pathlib import Path

# Add the agent naming package to the path
agent_naming_path = Path(__file__).parent.parent / "services" / "agent-naming" / "reynard_agent_naming"
sys.path.insert(0, str(agent_naming_path))

from app.ecs.database import ecs_db, NamingSpirit

def populate_base_names():
    """Populate base names for all spirits in the database."""
    print("🦊 Populating base names in PostgreSQL database...")
    
    # Define the spirit names directly from the foundation generator
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
        "rabbit": ["Lepus", "Swift", "Agile", "Quick", "Bounding", "Fleet"],
        "owl": ["Strix", "Wise", "Nocturnal", "Sage", "Watching", "Silent"],
        "raven": ["Corvus", "Dark", "Mysterious", "Clever", "Wise", "Ancient"],
        "shark": ["Carcharodon", "Ocean", "Predator", "Swift", "Fierce", "Deep"],
        "penguin": ["Spheniscus", "Antarctic", "Waddle", "Ice", "Colony", "Graceful"],
        "elephant": ["Elephas", "Memory", "Wise", "Gentle", "Giant", "Noble"],
        "giraffe": ["Giraffa", "Tall", "Graceful", "Reaching", "Gentle", "Majestic"],
        "zebra": ["Equus", "Striped", "Wild", "Running", "Free", "Pattern"],
        "cheetah": ["Acinonyx", "Speed", "Swift", "Hunting", "Graceful", "Fast"],
        "panther": ["Panthera", "Shadow", "Stealth", "Dark", "Powerful", "Silent"],
        "lynx": ["Lynx", "Wild", "Mountain", "Fierce", "Independent", "Sharp"],
        "bobcat": ["Lynx", "Wild", "Forest", "Fierce", "Independent", "Sharp"],
        "coyote": ["Canis", "Trickster", "Wild", "Clever", "Adaptable", "Survivor"],
        "hyena": ["Crocuta", "Laughing", "Pack", "Fierce", "Clever", "Wild"],
        "jaguar": ["Panthera", "Jungle", "Powerful", "Stealth", "Fierce", "Wild"],
        "leopard": ["Panthera", "Spotted", "Stealth", "Fierce", "Wild", "Graceful"],
        "cougar": ["Puma", "Mountain", "Stealth", "Powerful", "Wild", "Silent"],
        "puma": ["Puma", "Mountain", "Stealth", "Powerful", "Wild", "Silent"],
        "mountain_lion": ["Puma", "Mountain", "Stealth", "Powerful", "Wild", "Silent"],
        "snow_leopard": ["Panthera", "Snow", "Mountain", "Stealth", "Fierce", "Wild"],
        "clouded_leopard": ["Neofelis", "Clouded", "Stealth", "Fierce", "Wild", "Mysterious"],
        "margay": ["Leopardus", "Tree", "Agile", "Climbing", "Wild", "Graceful"],
        "ocelot": ["Leopardus", "Spotted", "Wild", "Fierce", "Independent", "Graceful"],
        "serval": ["Leptailurus", "Tall", "Wild", "Fierce", "Independent", "Graceful"],
        "caracal": ["Caracal", "Ears", "Wild", "Fierce", "Independent", "Graceful"],
        "sand_cat": ["Felis", "Desert", "Wild", "Fierce", "Independent", "Survivor"],
        "black_footed_cat": ["Felis", "Small", "Wild", "Fierce", "Independent", "Tiny"],
        "rusty_spotted_cat": ["Prionailurus", "Spotted", "Wild", "Fierce", "Independent", "Small"],
        "pallas_cat": ["Otocolobus", "Manul", "Wild", "Fierce", "Independent", "Fluffy"],
        "manul": ["Otocolobus", "Manul", "Wild", "Fierce", "Independent", "Fluffy"],
        "jungle_cat": ["Felis", "Jungle", "Wild", "Fierce", "Independent", "Adaptable"],
        "chaus": ["Felis", "Jungle", "Wild", "Fierce", "Independent", "Adaptable"],
        "fishing_cat": ["Prionailurus", "Water", "Wild", "Fierce", "Independent", "Swimming"],
        "flat_headed_cat": ["Prionailurus", "Flat", "Wild", "Fierce", "Independent", "Unique"],
        "bornean_bay_cat": ["Catopuma", "Bay", "Wild", "Fierce", "Independent", "Rare"],
        "asian_golden_cat": ["Catopuma", "Golden", "Wild", "Fierce", "Independent", "Beautiful"],
        "african_golden_cat": ["Caracal", "Golden", "Wild", "Fierce", "Independent", "Beautiful"],
        "pampas_cat": ["Leopardus", "Pampas", "Wild", "Fierce", "Independent", "Grassland"],
        "geoffroy_cat": ["Leopardus", "Geoffroy", "Wild", "Fierce", "Independent", "Spotted"],
        "kodkod": ["Leopardus", "Kodkod", "Wild", "Fierce", "Independent", "Small"],
        "oncilla": ["Leopardus", "Oncilla", "Wild", "Fierce", "Independent", "Spotted"],
        "tigrina": ["Leopardus", "Tigrina", "Wild", "Fierce", "Independent", "Striped"],
        "spider": ["Arachnid", "Web", "Silent", "Patient", "Clever", "Stealthy"],
        "star": ["Stellar", "Cosmic", "Bright", "Radiant", "Eternal", "Shining"],
        "alien": ["Xeno", "Otherworldly", "Mysterious", "Advanced", "Strange", "Unknown"],
        "nebula": ["Cosmic", "Cloud", "Mysterious", "Ethereal", "Beautiful", "Vast"],
        "kraken": ["Deep", "Ocean", "Mysterious", "Powerful", "Ancient", "Tentacled"],
        "manticore": ["Mythical", "Lion", "Scorpion", "Fierce", "Ancient", "Legendary"],
        "griffin": ["Mythical", "Eagle", "Lion", "Noble", "Ancient", "Legendary"],
        "peacock": ["Pavo", "Colorful", "Proud", "Beautiful", "Majestic", "Display"],
        "monkey": ["Simian", "Clever", "Agile", "Playful", "Curious", "Intelligent"],
        "whale": ["Cetacean", "Ocean", "Gentle", "Massive", "Wise", "Deep"],
        "octopus": ["Cephalopod", "Eight", "Clever", "Flexible", "Ocean", "Intelligent"],
        "rhino": ["Rhinoceros", "Horn", "Powerful", "Ancient", "Massive", "Wild"],
        "lemur": ["Primate", "Madagascar", "Agile", "Playful", "Curious", "Tree"],
        "unicorn": ["Mythical", "Horn", "Pure", "Magical", "Ancient", "Legendary"],
        "chimera": ["Mythical", "Mixed", "Fierce", "Ancient", "Legendary", "Powerful"],
        "frog": ["Anura", "Amphibian", "Leaping", "Water", "Green", "Croaking"],
        "pangolin": ["Manis", "Scaly", "Armored", "Anteater", "Unique", "Ancient"],
        "loch_ness": ["Nessie", "Mysterious", "Deep", "Ancient", "Legendary", "Water"],
        "wendigo": ["Mythical", "Winter", "Fierce", "Ancient", "Legendary", "Wild"],
        "platypus": ["Ornithorhynchus", "Duck", "Bill", "Unique", "Water", "Mysterious"],
        "capybara": ["Hydrochoerus", "Water", "Pig", "Gentle", "Large", "Social"],
        "dolphin": ["Delphinus", "Ocean", "Intelligent", "Playful", "Social", "Wise"],
        "skinwalker": ["Mythical", "Shape", "Shifter", "Mysterious", "Ancient", "Legendary"],
        "kiwi": ["Apteryx", "Flightless", "Nocturnal", "Unique", "New", "Zealand"],
        "flamingo": ["Phoenicopterus", "Pink", "Graceful", "Water", "Elegant", "Standing"],
        "narwhal": ["Monodon", "Unicorn", "Whale", "Arctic", "Tusked", "Mysterious"],
        "aye": ["Aye", "Aye", "Nocturnal", "Primate", "Madagascar", "Lemur"],
        "dragonfly": ["Odonata", "Winged", "Swift", "Flying", "Graceful", "Ancient"],
        "snake": ["Serpens", "Slithering", "Sinuous", "Wise", "Ancient", "Mysterious"],
        "ape": ["Simian", "Primate", "Intelligent", "Clever", "Strong", "Wise"],
        "blackhole": ["Cosmic", "Void", "Gravitational", "Mysterious", "Powerful", "Infinite"],
        "jackal": ["Canis", "Wild", "Clever", "Adaptable", "Survivor", "Pack"],
        "quokka": ["Setonix", "Smiling", "Happy", "Marsupial", "Australia", "Cute"],
        "hydra": ["Mythical", "Multi", "Headed", "Ancient", "Legendary", "Regenerating"],
        "basilisk": ["Mythical", "Serpent", "King", "Ancient", "Legendary", "Deadly"],
        "yeti": ["Mythical", "Snow", "Man", "Mountain", "Ancient", "Legendary"],
        "lizard": ["Lacerta", "Scaly", "Reptile", "Quick", "Agile", "Ancient"],
        "toucan": ["Ramphastos", "Colorful", "Beak", "Tropical", "Bright", "Vibrant"],
        "falcon": ["Falco", "Swift", "Hunting", "Fierce", "Flying", "Predator"],
        "void": ["Empty", "Nothing", "Void", "Mysterious", "Infinite", "Dark"],
        "chupacabra": ["Mythical", "Goat", "Sucker", "Mysterious", "Legendary", "Cryptid"],
        "mantis": ["Mantis", "Praying", "Insect", "Patient", "Stealthy", "Predator"],
        "sphinx": ["Mythical", "Riddle", "Wise", "Ancient", "Legendary", "Mysterious"],
        "turtle": ["Testudo", "Shell", "Ancient", "Wise", "Slow", "Patient"],
        "bee": ["Apis", "Honey", "Worker", "Busy", "Swarm", "Industrious"],
        "panda": ["Ailuropoda", "Bamboo", "Gentle", "Black", "White", "Cute"],
        "hawk": ["Accipiter", "Swift", "Hunting", "Fierce", "Flying", "Predator"],
        "ant": ["Formica", "Worker", "Colony", "Industrious", "Organized", "Strong"],
        "axolotl": ["Ambystoma", "Mexican", "Walking", "Fish", "Regenerative", "Unique"],
        "aye": ["Aye", "Aye", "Nocturnal", "Primate", "Madagascar", "Lemur"],
    }
    
    print(f"Found {len(spirit_names_dict)} spirits with names")
    
    # Update the database
    with ecs_db.get_session() as session:
        updated_count = 0
        
        for spirit_name, names in spirit_names_dict.items():
            # Find the spirit in the database
            spirit = session.query(NamingSpirit).filter(NamingSpirit.name == spirit_name).first()
            
            if spirit:
                # Update the base_names field
                spirit.base_names = names
                updated_count += 1
                print(f"✅ Updated {spirit_name}: {len(names)} names")
            else:
                print(f"❌ Spirit {spirit_name} not found in database")
        
        # Commit the changes
        session.commit()
        print(f"\n🎉 Successfully updated {updated_count} spirits with base names!")

if __name__ == "__main__":
    populate_base_names()