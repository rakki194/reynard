#!/usr/bin/env python3
"""
Test script for Reynard Caption Generation Integration

This script tests the complete integration between the backend caption generation
services and the frontend annotating package.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend app to the path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.caption_generation import get_caption_service, CaptionTask, CaptionResult


async def test_caption_service():
    """Test the caption generation service."""
    print("🦊> Testing Reynard Caption Generation Service...")
    
    # Get the caption service
    service = get_caption_service()
    
    # Test 1: Get available generators
    print("\n1. Testing available generators...")
    generators = service.get_available_generators()
    print(f"   Found {len(generators)} generators:")
    for name, info in generators.items():
        print(f"   - {name}: {info['description']} (available: {info['is_available']})")
    
    # Test 2: Check if any generators are available
    available_generators = [name for name, info in generators.items() if info['is_available']]
    if not available_generators:
        print("   ⚠️  No generators are available. This is expected if Yipyap models are not installed.")
        return
    
    # Test 3: Test single caption generation (if we have a test image)
    print(f"\n2. Testing single caption generation...")
    test_image_path = Path("test_image.jpg")
    
    if not test_image_path.exists():
        print("   ⚠️  No test image found. Create a test_image.jpg to test caption generation.")
        return
    
    # Try to generate a caption with the first available generator
    generator_name = available_generators[0]
    print(f"   Using generator: {generator_name}")
    
    try:
        result = await service.generate_single_caption(
            image_path=test_image_path,
            generator_name=generator_name,
            config={"threshold": 0.2},
            force=True
        )
        
        if result.success:
            print(f"   ✅ Caption generated successfully!")
            print(f"   Caption: {result.caption}")
            print(f"   Processing time: {result.processing_time:.2f}s")
            print(f"   Caption type: {result.caption_type}")
        else:
            print(f"   ❌ Caption generation failed: {result.error}")
            if result.retryable:
                print("   This error is retryable.")
    
    except Exception as e:
        print(f"   ❌ Exception during caption generation: {e}")
    
    # Test 4: Test batch caption generation
    print(f"\n3. Testing batch caption generation...")
    
    # Create multiple tasks (using the same image for simplicity)
    tasks = [
        CaptionTask(
            image_path=test_image_path,
            generator_name=generator_name,
            config={"threshold": 0.2},
            force=True
        )
        for _ in range(3)
    ]
    
    try:
        def progress_callback(progress):
            print(f"   Progress: {progress['completed']}/{progress['total']} ({progress['progress']}%)")
        
        results = await service.generate_batch_captions(
            tasks=tasks,
            progress_callback=progress_callback,
            max_concurrent=2
        )
        
        successful = sum(1 for r in results if r.success)
        print(f"   ✅ Batch processing completed: {successful}/{len(results)} successful")
        
        for i, result in enumerate(results):
            if result.success:
                print(f"   Task {i+1}: {result.caption[:50]}...")
            else:
                print(f"   Task {i+1}: Failed - {result.error}")
    
    except Exception as e:
        print(f"   ❌ Exception during batch processing: {e}")
    
    # Test 5: Test model management
    print(f"\n4. Testing model management...")
    
    try:
        # Check loaded models
        loaded_models = service.get_loaded_models()
        print(f"   Currently loaded models: {list(loaded_models)}")
        
        # Try to load a model
        if available_generators:
            model_name = available_generators[0]
            print(f"   Attempting to load model: {model_name}")
            
            success = await service.load_model(model_name)
            if success:
                print(f"   ✅ Model {model_name} loaded successfully")
                
                # Check if it's now loaded
                loaded_models = service.get_loaded_models()
                print(f"   Loaded models after loading: {list(loaded_models)}")
                
                # Try to unload it
                success = await service.unload_model(model_name)
                if success:
                    print(f"   ✅ Model {model_name} unloaded successfully")
                else:
                    print(f"   ❌ Failed to unload model {model_name}")
            else:
                print(f"   ❌ Failed to load model {model_name}")
    
    except Exception as e:
        print(f"   ❌ Exception during model management: {e}")
    
    print("\n🦊> Caption generation service test completed!")


async def main():
    """Main test function."""
    try:
        await test_caption_service()
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
