#!/usr/bin/env python3
"""Test script for gallery-dl library integration
"""

import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))


def test_gallery_dl_import():
    """Test if gallery-dl can be imported"""
    try:
        import gallery_dl

        print(f"✅ gallery-dl imported successfully: {gallery_dl.__version__}")
        return True
    except ImportError as e:
        print(f"❌ Failed to import gallery-dl: {e}")
        return False


def test_gallery_dl_components():
    """Test if gallery-dl components can be imported"""
    try:
        from gallery_dl import config, extractor, job, option, output, util
        from gallery_dl.extractor.common import Extractor, Message

        print("✅ gallery-dl components imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Failed to import gallery-dl components: {e}")
        return False


def test_extractor_detection():
    """Test extractor detection"""
    try:
        from gallery_dl import extractor

        # Test with a simple URL
        test_url = "https://example.com/gallery"
        extr = extractor.find(test_url)

        if extr:
            print(f"✅ Extractor detection works: {extr.__name__}")
        else:
            print("⚠️  No extractor found for test URL (expected)")

        return True
    except Exception as e:
        print(f"❌ Extractor detection failed: {e}")
        return False


def test_configuration():
    """Test gallery-dl configuration"""
    try:
        from gallery_dl import config

        # Test setting configuration using the correct API
        config.set((), "base-directory", "./test_downloads")
        config.set((), "skip", True)
        config.set((), "retries", 3)

        print("✅ Configuration system works")
        return True
    except Exception as e:
        print(f"❌ Configuration failed: {e}")
        return False


def test_reynard_service():
    """Test Reynard gallery service integration"""
    try:
        from app.services.gallery.gallery_service import ReynardGalleryService

        # Create service instance
        service = ReynardGalleryService({})

        if service.gallery_dl_available:
            print("✅ Reynard gallery service created successfully")
            return True
        print("❌ Reynard gallery service: gallery-dl not available")
        return False
    except Exception as e:
        print(f"❌ Reynard service test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("🦊 Testing gallery-dl library integration...\n")

    tests = [
        ("Gallery-dl Import", test_gallery_dl_import),
        ("Gallery-dl Components", test_gallery_dl_components),
        ("Extractor Detection", test_extractor_detection),
        ("Configuration", test_configuration),
        ("Reynard Service", test_reynard_service),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"Testing {test_name}...")
        result = test_func()
        results.append((test_name, result))
        print()

    # Summary
    print("📊 Test Results Summary:")
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
        if result:
            passed += 1

    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")

    if passed == len(results):
        print("🎉 All tests passed! Gallery-dl integration is working correctly.")
        return 0
    print("⚠️  Some tests failed. Check the output above for details.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
