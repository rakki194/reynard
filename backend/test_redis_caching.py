#!/usr/bin/env python3
"""Test script to verify Redis caching is working correctly."""

import asyncio
import time
import requests
from typing import Dict, Any

from app.core.cache_config import CacheConfig
from app.ecs.cache_decorators import initialize_ecs_cache, get_ecs_cache_manager
from app.core.alembic_cache import initialize_alembic_cache, get_alembic_cache_manager


async def test_cache_initialization():
    """Test cache manager initialization."""
    print("🧪 Testing cache initialization...")

    # Test ECS cache
    try:
        ecs_cache = await initialize_ecs_cache(redis_enabled=CacheConfig.REDIS_ENABLED)
        print(f"✅ ECS cache initialized: Redis enabled = {CacheConfig.REDIS_ENABLED}")
    except Exception as e:
        print(f"❌ ECS cache initialization failed: {e}")

    # Test Alembic cache
    try:
        alembic_cache = await initialize_alembic_cache(
            redis_enabled=CacheConfig.REDIS_ENABLED
        )
        print(
            f"✅ Alembic cache initialized: Redis enabled = {CacheConfig.REDIS_ENABLED}"
        )
    except Exception as e:
        print(f"❌ Alembic cache initialization failed: {e}")


async def test_cache_operations():
    """Test basic cache operations."""
    print("\n🧪 Testing cache operations...")

    ecs_cache = get_ecs_cache_manager()

    # Test set and get
    test_key = "test:key"
    test_value = {"test": "data", "timestamp": time.time()}

    try:
        await ecs_cache.set(test_key, test_value, ttl=60)
        cached_value = await ecs_cache.get(test_key)

        if cached_value == test_value:
            print("✅ Cache set/get operations working")
        else:
            print("❌ Cache set/get operations failed - values don't match")
    except Exception as e:
        print(f"❌ Cache operations failed: {e}")

    # Test cache stats
    try:
        stats = await ecs_cache.get_cache_stats()
        print(f"📊 Cache stats: {stats}")
    except Exception as e:
        print(f"❌ Failed to get cache stats: {e}")


def test_api_caching():
    """Test API endpoint caching."""
    print("\n🧪 Testing API endpoint caching...")

    base_url = "http://localhost:8000/api/ecs"

    # Test naming spirits endpoint
    try:
        print("Testing naming spirits endpoint...")

        # First request (should hit database)
        start_time = time.time()
        response1 = requests.get(f"{base_url}/naming/animal-spirits")
        first_request_time = time.time() - start_time

        if response1.status_code == 200:
            print(f"✅ First request successful ({first_request_time:.3f}s)")

            # Second request (should hit cache)
            start_time = time.time()
            response2 = requests.get(f"{base_url}/naming/animal-spirits")
            second_request_time = time.time() - start_time

            if response2.status_code == 200:
                print(f"✅ Second request successful ({second_request_time:.3f}s)")

                # Compare response times
                if second_request_time < first_request_time:
                    speedup = first_request_time / second_request_time
                    print(f"🚀 Cache speedup: {speedup:.1f}x faster")
                else:
                    print("⚠️  No speedup detected (cache might not be working)")

                # Verify responses are identical
                if response1.json() == response2.json():
                    print("✅ Cached response matches original")
                else:
                    print("❌ Cached response differs from original")
            else:
                print(f"❌ Second request failed: {response2.status_code}")
        else:
            print(f"❌ First request failed: {response1.status_code}")

    except Exception as e:
        print(f"❌ API caching test failed: {e}")

    # Test naming components endpoint
    try:
        print("\nTesting naming components endpoint...")

        start_time = time.time()
        response = requests.get(f"{base_url}/naming/components")
        request_time = time.time() - start_time

        if response.status_code == 200:
            print(f"✅ Components request successful ({request_time:.3f}s)")
        else:
            print(f"❌ Components request failed: {response.status_code}")

    except Exception as e:
        print(f"❌ Components test failed: {e}")

    # Test naming config endpoint
    try:
        print("\nTesting naming config endpoint...")

        start_time = time.time()
        response = requests.get(f"{base_url}/naming/config")
        request_time = time.time() - start_time

        if response.status_code == 200:
            print(f"✅ Config request successful ({request_time:.3f}s)")
        else:
            print(f"❌ Config request failed: {response.status_code}")

    except Exception as e:
        print(f"❌ Config test failed: {e}")


async def test_alembic_cache():
    """Test Alembic cache functionality."""
    print("\n🧪 Testing Alembic cache...")

    alembic_cache = get_alembic_cache_manager()

    # Test migration metadata caching
    test_revision = "test_revision_123"
    test_metadata = {
        "revision": test_revision,
        "down_revision": "previous_revision",
        "branch_labels": None,
        "depends_on": None,
        "created_at": time.time(),
    }

    try:
        await alembic_cache.cache_migration_metadata(test_revision, test_metadata)
        cached_metadata = await alembic_cache.get_cached_migration_metadata(
            test_revision
        )

        if cached_metadata == test_metadata:
            print("✅ Alembic migration metadata caching working")
        else:
            print("❌ Alembic migration metadata caching failed")
    except Exception as e:
        print(f"❌ Alembic cache test failed: {e}")

    # Test cache stats
    try:
        stats = await alembic_cache.get_cache_stats()
        print(f"📊 Alembic cache stats: {stats}")
    except Exception as e:
        print(f"❌ Failed to get Alembic cache stats: {e}")


def print_configuration():
    """Print current cache configuration."""
    print("🔧 Cache Configuration:")
    config = CacheConfig.to_dict()
    for key, value in config.items():
        print(f"  {key}: {value}")


async def main():
    """Main test function."""
    print("🚀 Redis Caching Test Suite")
    print("=" * 50)

    # Print configuration
    print_configuration()

    # Test cache initialization
    await test_cache_initialization()

    # Test basic cache operations
    await test_cache_operations()

    # Test API caching
    test_api_caching()

    # Test Alembic cache
    await test_alembic_cache()

    print("\n🎉 Cache testing complete!")


if __name__ == "__main__":
    asyncio.run(main())
