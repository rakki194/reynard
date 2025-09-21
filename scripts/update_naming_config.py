#!/usr/bin/env python3
"""
Update Naming Config Script
===========================

This script updates the naming_config.json file to include all available spirits
from the generated race files.
"""

import json
import sys
from pathlib import Path


def load_race_data(races_dir: Path):
    """Load all race data from the races directory."""
    spirits = {}

    for race_file in races_dir.glob("*.json"):
        try:
            with open(race_file, "r", encoding="utf-8") as f:
                race_data = json.load(f)
                spirit_name = race_data["name"]

                # Create spirit config entry
                spirits[spirit_name] = {
                    "name": spirit_name,
                    "enabled": True,
                    "description": race_data["description"],
                    "emoji": race_data["emoji"],
                    "base_names": race_data["names"],
                    "generation_numbers": race_data["generation_numbers"],
                    "weight": 1.0,  # Default weight, can be customized later
                    "custom_data": {},
                }

        except (json.JSONDecodeError, KeyError) as e:
            print(f"⚠️  Error loading race file {race_file}: {e}")
            continue

    return spirits


def update_naming_config(config_file: Path, new_spirits: dict):
    """Update the naming config file with new spirits."""
    try:
        # Load existing config
        with open(config_file, "r", encoding="utf-8") as f:
            config = json.load(f)

        # Update the spirits section
        config["spirits"] = new_spirits

        # Write back to file
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)

        print(f"✅ Updated {config_file} with {len(new_spirits)} spirits")

    except Exception as e:
        print(f"❌ Error updating config file: {e}")
        raise


def main():
    """Update the naming config with all available spirits."""
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    races_dir = project_root / "backend" / "data" / "ecs" / "races"
    config_file = project_root / "backend" / "data" / "ecs" / "naming_config.json"

    print(f"🦊 Loading race data from {races_dir}")

    # Load all race data
    spirits = load_race_data(races_dir)

    print(f"📊 Found {len(spirits)} spirits:")
    for spirit_name in sorted(spirits.keys()):
        print(f"  - {spirit_name} {spirits[spirit_name]['emoji']}")

    # Update the naming config
    print(f"\n🔄 Updating naming config...")
    update_naming_config(config_file, spirits)

    print(f"\n🎯 Update complete!")
    print(f"✅ Updated naming_config.json with {len(spirits)} spirits")


if __name__ == "__main__":
    main()
