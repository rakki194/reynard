#!/usr/bin/env python3
"""
Test script for the modular Reynard naming system.
"""

import os
import sys

# Add current directory to path for testing
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Test individual modules
print("Testing individual modules...")

try:
    from name_pools import AnimalSpiritPools, MythologicalReferences

    print("✅ name_pools module imported successfully")

    pools = AnimalSpiritPools()
    print(f"   - Available spirits: {len(pools.get_all_spirits())}")
    print(f"   - Fox names: {len(pools.get_spirit_names('fox'))}")
    print(f"   - Wolf names: {len(pools.get_spirit_names('wolf'))}")
    print(f"   - Otter names: {len(pools.get_spirit_names('otter'))}")

    myth = MythologicalReferences()
    print(f"   - Mythological references: {len(myth.get_references())}")

except ImportError as e:
    print(f"❌ name_pools module failed: {e}")

try:
    from naming_conventions import ExoSuffixes, FoundationSuffixes

    print("✅ naming_conventions module imported successfully")

    foundation = FoundationSuffixes()
    print(f"   - Foundation suffixes: {len(foundation.get_suffixes())}")

    exo = ExoSuffixes()
    print(f"   - Exo suffixes: {len(exo.get_suffixes())}")

except ImportError as e:
    print(f"❌ naming_conventions module failed: {e}")

try:
    from generation_numbers import GenerationNumbers

    print("✅ generation_numbers module imported successfully")

    gen_nums = GenerationNumbers()
    print(f"   - Fox numbers: {gen_nums.get_numbers('fox')}")
    print(f"   - Wolf numbers: {gen_nums.get_numbers('wolf')}")
    print(f"   - Otter numbers: {gen_nums.get_numbers('otter')}")

except ImportError as e:
    print(f"❌ generation_numbers module failed: {e}")

try:
    from name_generators import ExoStyleGenerator, FoundationStyleGenerator

    print("✅ name_generators module imported successfully")

    foundation_gen = FoundationStyleGenerator()
    fox_name = foundation_gen.generate("fox")
    print(f"   - Generated fox name: {fox_name}")

    exo_gen = ExoStyleGenerator()
    wolf_name = exo_gen.generate("wolf")
    print(f"   - Generated wolf name: {wolf_name}")

except ImportError as e:
    print(f"❌ name_generators module failed: {e}")

try:
    from name_analyzer import NameAnalyzer

    print("✅ name_analyzer module imported successfully")

    analyzer = NameAnalyzer()
    test_name = "Vulpine-Sage-13"
    info = analyzer.get_spirit_info(test_name)
    print(f"   - Analyzed '{test_name}': {info['spirit']} | {info['style']}")

except ImportError as e:
    print(f"❌ name_analyzer module failed: {e}")

print("\nTesting name generation...")
try:
    from name_generators import BatchGenerator

    batch_gen = BatchGenerator()

    # Test different styles
    fox_foundation = batch_gen.generate_batch(1, "fox", "foundation")
    wolf_exo = batch_gen.generate_batch(1, "wolf", "exo")
    otter_cyberpunk = batch_gen.generate_batch(1, "otter", "cyberpunk")

    print(f"✅ Fox Foundation: {fox_foundation[0]}")
    print(f"✅ Wolf Exo: {wolf_exo[0]}")
    print(f"✅ Otter Cyberpunk: {otter_cyberpunk[0]}")

except Exception as e:
    print(f"❌ Batch generation failed: {e}")

print("\n🎉 Modular system test completed!")
