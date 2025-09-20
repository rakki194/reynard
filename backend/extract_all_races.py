#!/usr/bin/env python3
"""
Extract all race data from git and generate Alembic migration data.
"""

import json
import subprocess
import sys
from pathlib import Path

def get_race_data_from_git():
    """Extract all race data from git."""
    races = []
    
    # Get list of race files from git
    try:
        result = subprocess.run(
            ["git", "show", "HEAD:./data/ecs/races/"],
            capture_output=True,
            text=True,
            cwd="/home/kade/runeset/reynard/backend"
        )
        
        if result.returncode != 0:
            print(f"Error getting race files: {result.stderr}")
            return races
            
        # Parse the tree output to get filenames
        lines = result.stdout.strip().split('\n')
        race_files = []
        for line in lines:
            if line.strip().endswith('.json'):
                race_files.append(line.strip().split()[-1])
        
        print(f"Found {len(race_files)} race files")
        
        # Extract data from each race file
        for race_file in race_files:
            try:
                # Get the content of each race file from git
                file_result = subprocess.run(
                    ["git", "show", f"HEAD:./data/ecs/races/{race_file}"],
                    capture_output=True,
                    text=True,
                    cwd="/home/kade/runeset/reynard/backend"
                )
                
                if file_result.returncode == 0:
                    race_data = json.loads(file_result.stdout)
                    race_name = race_file.replace('.json', '')
                    
                    # Convert to our database format
                    race_entry = {
                        'name': race_name,
                        'category': race_data.get('category', 'unknown'),
                        'description': race_data.get('description', ''),
                        'emoji': race_data.get('emoji', ''),
                        'enabled': race_data.get('enabled', True),
                        'weight': race_data.get('weight', 1.0),
                        'generation_numbers': race_data.get('generation_numbers', []),
                        'traits': race_data.get('traits', []),
                        'base_names': race_data.get('base_names', []),
                        'custom_data': race_data.get('custom_data', {})
                    }
                    
                    races.append(race_entry)
                    print(f"✅ Extracted {race_name}")
                else:
                    print(f"❌ Failed to get {race_file}: {file_result.stderr}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ JSON decode error for {race_file}: {e}")
            except Exception as e:
                print(f"❌ Error processing {race_file}: {e}")
                
    except Exception as e:
        print(f"❌ Error getting race files: {e}")
    
    return races

def generate_alembic_data(races):
    """Generate Alembic migration data format."""
    print(f"\n🦊 Generating Alembic data for {len(races)} races...")
    
    # Generate the data structure for Alembic
    spirits_data = []
    
    for race in races:
        spirit_entry = f"""        {{
            'id': str(uuid.uuid4()),
            'name': '{race['name']}',
            'category': '{race['category']}',
            'description': '{race['description']}',
            'emoji': '{race['emoji']}',
            'enabled': {race['enabled']},
            'weight': {race['weight']},
            'generation_numbers': {race['generation_numbers']},
            'traits': {race['traits']},
            'base_names': {race['base_names']},
            'custom_data': {race['custom_data']},
            'created_at': now,
            'updated_at': now
        }}"""
        spirits_data.append(spirit_entry)
    
    return spirits_data

if __name__ == "__main__":
    print("🦊 Extracting all race data from git...")
    
    races = get_race_data_from_git()
    
    if not races:
        print("❌ No race data found!")
        sys.exit(1)
    
    print(f"\n✅ Successfully extracted {len(races)} races")
    
    # Generate Alembic data
    spirits_data = generate_alembic_data(races)
    
    # Save to file
    output_file = Path("/home/kade/runeset/reynard/backend/all_races_alembic_data.py")
    with open(output_file, 'w') as f:
        f.write("# Generated race data for Alembic migration\n")
        f.write("spirits_data = [\n")
        for i, spirit in enumerate(spirits_data):
            f.write(spirit)
            if i < len(spirits_data) - 1:
                f.write(",")
            f.write("\n")
        f.write("]\n")
    
    print(f"✅ Generated Alembic data saved to {output_file}")
    print(f"🎉 Ready to update migration with {len(races)} races!")
