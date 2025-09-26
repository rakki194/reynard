#!/usr/bin/env python3
"""Comprehensive Redis Cache Tests

Tests for the ECS Redis cache implementation including:
- Basic Redis operations
- ECS cache functionality
- Connection management
- Error handling
- Performance testing
- Security features

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import os

# Add backend to path
import sys
import time
from unittest.mock import AsyncMock, Mock, patch

import pytest
import pytest_asyncio
import redis.asyncio as redis

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from tests.utils.env_loader import (
    get_redis_config,
    get_test_redis_config,
    setup_test_environment,
)

from app.ecs.redis_cache import ECSRedisCache, cache_result, get_ecs_cache


class TestRedisBasicOperations:
    """Test basic Redis operations."""

    @pytest_asyncio.fixture
    async def redis_client(self):
        """Create a Redis client for testing."""
        config = get_test_redis_config()
        client = redis.Redis(
            host=config['host'],
            port=int(config['port']),
            db=int(config['db']),  # Use test DB
            password=config['password'] if config['password'] else None,
        )
        yield client
        await client.flushdb()  # Clean up
        await client.aclose()

    @pytest.mark.asyncio
    async def test_redis_connection(self, redis_client):
        """Test basic Redis connection."""
        result = await redis_client.ping()
        assert result is True

    @pytest.mark.asyncio
    async def test_redis_set_get(self, redis_client):
        """Test Redis set and get operations."""
        await redis_client.set('test_key', 'test_value', ex=60)
        value = await redis_client.get('test_key')
        assert value == b'test_value'

    @pytest.mark.asyncio
    async def test_redis_hash_operations(self, redis_client):
        """Test Redis hash operations."""
        await redis_client.hset(
            'test_hash', mapping={'field1': 'value1', 'field2': 'value2'}
        )
        value = await redis_client.hget('test_hash', 'field1')
        assert value == b'value1'

    @pytest.mark.asyncio
    async def test_redis_list_operations(self, redis_client):
        """Test Redis list operations."""
        await redis_client.lpush('test_list', 'item1', 'item2', 'item3')
        length = await redis_client.llen('test_list')
        assert length == 3

    @pytest.mark.asyncio
    async def test_redis_expiration(self, redis_client):
        """Test Redis key expiration."""
        await redis_client.set('expire_test', 'temp_value', ex=1)
        await asyncio.sleep(1.1)
        value = await redis_client.get('expire_test')
        assert value is None

    @pytest.mark.asyncio
    async def test_redis_aclose_deprecation_fix(self, redis_client):
        """Test that aclose() works without deprecation warnings."""
        # This should not raise any deprecation warnings
        await redis_client.aclose()
        # Reconnect for cleanup
        client = redis.Redis(host='localhost', port=6379, db=15)
        await client.flushdb()
        await client.aclose()


class TestECSRedisCache:
    """Test ECS Redis cache implementation."""

    @pytest_asyncio.fixture
    async def ecs_cache(self):
        """Create an ECS cache instance for testing."""
        config = get_test_redis_config()
        cache = ECSRedisCache(
            host=config['host'],
            port=int(config['port']),
            db=int(config['db']),  # Use test DB
            password=config['password'] if config['password'] else None,
            max_connections=5,
        )
        await cache.connect()
        yield cache
        await cache.clear_namespace('test')
        await cache.disconnect()

    @pytest.mark.asyncio
    async def test_cache_connection(self, ecs_cache):
        """Test cache connection."""
        assert ecs_cache.connected is True
        assert ecs_cache.redis_client is not None

    @pytest.mark.asyncio
    async def test_cache_set_get(self, ecs_cache):
        """Test cache set and get operations."""
        test_data = {'test': 'data', 'number': 42, 'list': [1, 2, 3]}
        await ecs_cache.set('test_namespace', 'test_key', test_data, ttl=60)
        retrieved = await ecs_cache.get('test_namespace', 'test_key')
        assert retrieved == test_data

    @pytest.mark.asyncio
    async def test_cache_delete(self, ecs_cache):
        """Test cache delete operation."""
        test_data = {'test': 'delete_me'}
        await ecs_cache.set('test_namespace', 'delete_key', test_data, ttl=60)
        await ecs_cache.delete('test_namespace', 'delete_key')
        retrieved = await ecs_cache.get('test_namespace', 'delete_key')
        assert retrieved is None

    @pytest.mark.asyncio
    async def test_cache_ttl(self, ecs_cache):
        """Test cache TTL functionality."""
        test_data = {'test': 'ttl_test'}
        await ecs_cache.set('test_namespace', 'ttl_key', test_data, ttl=1)
        await asyncio.sleep(1.1)
        retrieved = await ecs_cache.get('test_namespace', 'ttl_key')
        assert retrieved is None

    @pytest.mark.asyncio
    async def test_cache_statistics(self, ecs_cache):
        """Test cache statistics."""
        # Perform some operations
        await ecs_cache.set('test_namespace', 'stat_key1', {'data': 1}, ttl=60)
        await ecs_cache.set('test_namespace', 'stat_key2', {'data': 2}, ttl=60)
        await ecs_cache.get('test_namespace', 'stat_key1')
        await ecs_cache.get('test_namespace', 'nonexistent_key')

        stats = ecs_cache.get_stats()
        assert 'hits' in stats
        assert 'misses' in stats
        assert 'sets' in stats
        assert stats['sets'] >= 2
        assert stats['hits'] >= 1
        assert stats['misses'] >= 1

    @pytest.mark.asyncio
    async def test_cache_namespace_isolation(self, ecs_cache):
        """Test that different namespaces are isolated."""
        await ecs_cache.set('namespace1', 'key1', {'data': 'namespace1'}, ttl=60)
        await ecs_cache.set('namespace2', 'key1', {'data': 'namespace2'}, ttl=60)

        data1 = await ecs_cache.get('namespace1', 'key1')
        data2 = await ecs_cache.get('namespace2', 'key1')

        assert data1['data'] == 'namespace1'
        assert data2['data'] == 'namespace2'
        assert data1 != data2

    @pytest.mark.asyncio
    async def test_cache_clear_namespace(self, ecs_cache):
        """Test clearing a namespace."""
        await ecs_cache.set('clear_test', 'key1', {'data': 1}, ttl=60)
        await ecs_cache.set('clear_test', 'key2', {'data': 2}, ttl=60)
        await ecs_cache.set('other_namespace', 'key1', {'data': 3}, ttl=60)

        await ecs_cache.clear_namespace('clear_test')

        # Keys in cleared namespace should be gone
        assert await ecs_cache.get('clear_test', 'key1') is None
        assert await ecs_cache.get('clear_test', 'key2') is None

        # Keys in other namespace should remain
        assert await ecs_cache.get('other_namespace', 'key1') == {'data': 3}

    @pytest.mark.asyncio
    async def test_cache_fallback_mode(self):
        """Test cache fallback mode when Redis is unavailable."""
        # Create cache with invalid connection
        cache = ECSRedisCache(host='invalid_host', port=9999, db=0)

        # Should fall back to in-memory cache
        await cache.connect()
        assert cache.connected is False  # Redis connection failed

        # Should still work with fallback
        test_data = {'test': 'fallback'}
        await cache.set('test_namespace', 'fallback_key', test_data, ttl=60)
        retrieved = await cache.get('test_namespace', 'fallback_key')
        assert retrieved == test_data

        await cache.disconnect()


class TestECSCacheDecorators:
    """Test ECS cache decorators."""

    @pytest.mark.asyncio
    async def test_cache_result_decorator(self):
        """Test the cache_result decorator."""
        call_count = 0

        @cache_result('test_decorator', ttl=60)
        async def expensive_function(param):
            nonlocal call_count
            call_count += 1
            return {'result': param * 2, 'call_count': call_count}

        # First call should execute the function
        result1 = await expensive_function(5)
        assert result1['result'] == 10
        assert result1['call_count'] == 1

        # Second call should use cache
        result2 = await expensive_function(5)
        assert result2['result'] == 10
        assert result2['call_count'] == 1  # Should be cached

        # Different parameter should execute again
        result3 = await expensive_function(10)
        assert result3['result'] == 20
        assert result3['call_count'] == 2


class TestRedisSecurity:
    """Test Redis security features."""

    @pytest.mark.asyncio
    async def test_redis_ssl_configuration(self):
        """Test Redis SSL configuration options."""
        cache = ECSRedisCache(
            host='localhost',
            port=6380,  # TLS port
            ssl=True,
            ssl_cert_reqs='required',
            ssl_ca_certs='/etc/redis/tls/ca.crt',
            ssl_certfile='/etc/redis/tls/client.crt',
            ssl_keyfile='/etc/redis/tls/client.key',
        )

        # Should have SSL configuration
        assert cache.ssl is True
        assert cache.ssl_cert_reqs == 'required'
        assert cache.ssl_ca_certs == '/etc/redis/tls/ca.crt'
        assert cache.ssl_certfile == '/etc/redis/tls/client.crt'
        assert cache.ssl_keyfile == '/etc/redis/tls/client.key'

    @pytest.mark.asyncio
    async def test_redis_password_configuration(self):
        """Test Redis password configuration."""
        cache = ECSRedisCache(host='localhost', port=6379, password='test_password')

        assert cache.password == 'test_password'


class TestRedisPerformance:
    """Test Redis performance characteristics."""

    @pytest.mark.asyncio
    async def test_cache_performance(self):
        """Test cache performance with multiple operations."""
        config = get_test_redis_config()
        cache = ECSRedisCache(
            host=config['host'],
            port=int(config['port']),
            db=int(config['db']),
            password=config['password'] if config['password'] else None,
        )
        await cache.connect()

        try:
            # Test bulk operations
            start_time = time.time()

            # Set multiple values
            for i in range(100):
                await cache.set('perf_test', f'key_{i}', {'value': i}, ttl=60)

            set_time = time.time() - start_time

            # Get multiple values
            start_time = time.time()
            for i in range(100):
                await cache.get('perf_test', f'key_{i}')

            get_time = time.time() - start_time

            # Performance assertions (adjust thresholds as needed)
            assert set_time < 5.0  # Should set 100 values in under 5 seconds
            assert get_time < 2.0  # Should get 100 values in under 2 seconds

            print(
                f"Performance: Set 100 values in {set_time:.3f}s, Get 100 values in {get_time:.3f}s"
            )

        finally:
            await cache.clear_namespace('perf_test')
            await cache.disconnect()


class TestGlobalCacheInstance:
    """Test global cache instance management."""

    @pytest.mark.asyncio
    async def test_get_ecs_cache_singleton(self):
        """Test that get_ecs_cache returns a singleton."""
        cache1 = get_ecs_cache()
        cache2 = get_ecs_cache()

        assert cache1 is cache2  # Should be the same instance

    @pytest.mark.asyncio
    async def test_global_cache_environment_config(self):
        """Test global cache uses environment configuration."""
        with patch.dict(
            os.environ,
            {
                'REDIS_HOST': 'test_host',
                'REDIS_PORT': '6380',
                'REDIS_PASSWORD': 'test_password',
                'REDIS_TLS_ENABLED': 'true',
            },
        ):
            # Clear the global cache to force recreation
            import app.ecs.redis_cache

            app.ecs.redis_cache._ecs_cache = None

            cache = get_ecs_cache()
            assert cache.host == 'test_host'
            assert cache.port == 6380
            assert cache.password == 'test_password'
            assert cache.ssl is True


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
