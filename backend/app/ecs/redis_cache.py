#!/usr/bin/env python3
"""
ECS Redis Caching Implementation

High-performance Redis caching for ECS backend to address the bottlenecks
identified in the performance analysis.
"""

import json
import logging
import time
import asyncio
from typing import Any, Dict, List, Optional, Union
from functools import wraps
import hashlib

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None

logger = logging.getLogger(__name__)


class ECSRedisCache:
    """High-performance Redis cache for ECS backend."""
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
        max_connections: int = 20,
        socket_timeout: int = 5,
        socket_connect_timeout: int = 5,
        retry_on_timeout: bool = True
    ):
        """Initialize Redis cache.
        
        Args:
            host: Redis host
            port: Redis port
            db: Redis database number
            password: Redis password
            max_connections: Maximum connections in pool
            socket_timeout: Socket timeout
            socket_connect_timeout: Socket connect timeout
            retry_on_timeout: Retry on timeout
        """
        self.host = host
        self.port = port
        self.db = db
        self.password = password
        self.max_connections = max_connections
        self.socket_timeout = socket_timeout
        self.socket_connect_timeout = socket_connect_timeout
        self.retry_on_timeout = retry_on_timeout
        
        self.redis_client: Optional[redis.Redis] = None
        self.connected = False
        self.fallback_cache: Dict[str, Dict[str, Any]] = {}
        
        # Cache statistics
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0,
            'errors': 0
        }
    
    async def connect(self) -> bool:
        """Connect to Redis server.
        
        Returns:
            bool: True if connected successfully, False otherwise
        """
        if not REDIS_AVAILABLE:
            logger.warning("Redis not available, using fallback cache")
            return False
        
        try:
            self.redis_client = redis.Redis(
                host=self.host,
                port=self.port,
                db=self.db,
                password=self.password,
                max_connections=self.max_connections,
                socket_timeout=self.socket_timeout,
                socket_connect_timeout=self.socket_connect_timeout,
                retry_on_timeout=self.retry_on_timeout,
                decode_responses=True
            )
            
            # Test connection
            await self.redis_client.ping()
            self.connected = True
            logger.info(f"Connected to Redis at {self.host}:{self.port}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.connected = False
            return False
    
    async def disconnect(self):
        """Disconnect from Redis server."""
        if self.redis_client:
            await self.redis_client.close()
            self.connected = False
            logger.info("Disconnected from Redis")
    
    def _generate_key(self, namespace: str, key: str) -> str:
        """Generate a cache key.
        
        Args:
            namespace: Cache namespace
            key: Cache key
            
        Returns:
            str: Generated cache key
        """
        return f"ecs:{namespace}:{key}"
    
    def _serialize(self, data: Any) -> str:
        """Serialize data for caching.
        
        Args:
            data: Data to serialize
            
        Returns:
            str: Serialized data
        """
        try:
            return json.dumps(data, default=str)
        except Exception as e:
            logger.error(f"Failed to serialize data: {e}")
            raise
    
    def _deserialize(self, data: str) -> Any:
        """Deserialize cached data.
        
        Args:
            data: Serialized data
            
        Returns:
            Any: Deserialized data
        """
        try:
            return json.loads(data)
        except Exception as e:
            logger.error(f"Failed to deserialize data: {e}")
            raise
    
    async def get(self, namespace: str, key: str) -> Optional[Any]:
        """Get a value from cache.
        
        Args:
            namespace: Cache namespace
            key: Cache key
            
        Returns:
            Optional[Any]: Cached value or None if not found
        """
        cache_key = self._generate_key(namespace, key)
        
        try:
            if self.connected and self.redis_client:
                # Try Redis first
                data = await self.redis_client.get(cache_key)
                if data is not None:
                    self.stats['hits'] += 1
                    return self._deserialize(data)
                else:
                    self.stats['misses'] += 1
                    return None
            else:
                # Fallback to memory cache
                cached_item = self.fallback_cache.get(cache_key)
                if cached_item and not self._is_expired(cached_item):
                    self.stats['hits'] += 1
                    return cached_item['data']
                else:
                    if cached_item:
                        del self.fallback_cache[cache_key]
                    self.stats['misses'] += 1
                    return None
                    
        except Exception as e:
            logger.error(f"Failed to get from cache: {e}")
            self.stats['errors'] += 1
            return None
    
    async def set(
        self, 
        namespace: str, 
        key: str, 
        value: Any, 
        ttl: int = 3600
    ) -> bool:
        """Set a value in cache.
        
        Args:
            namespace: Cache namespace
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            
        Returns:
            bool: True if successful, False otherwise
        """
        cache_key = self._generate_key(namespace, key)
        
        try:
            serialized_data = self._serialize(value)
            
            if self.connected and self.redis_client:
                # Use Redis
                await self.redis_client.setex(cache_key, ttl, serialized_data)
                self.stats['sets'] += 1
                return True
            else:
                # Fallback to memory cache
                self.fallback_cache[cache_key] = {
                    'data': value,
                    'expires': time.time() + ttl
                }
                self.stats['sets'] += 1
                return True
                
        except Exception as e:
            logger.error(f"Failed to set cache: {e}")
            self.stats['errors'] += 1
            return False
    
    async def delete(self, namespace: str, key: str) -> bool:
        """Delete a value from cache.
        
        Args:
            namespace: Cache namespace
            key: Cache key
            
        Returns:
            bool: True if successful, False otherwise
        """
        cache_key = self._generate_key(namespace, key)
        
        try:
            if self.connected and self.redis_client:
                # Use Redis
                result = await self.redis_client.delete(cache_key)
                self.stats['deletes'] += 1
                return result > 0
            else:
                # Fallback to memory cache
                if cache_key in self.fallback_cache:
                    del self.fallback_cache[cache_key]
                    self.stats['deletes'] += 1
                    return True
                return False
                
        except Exception as e:
            logger.error(f"Failed to delete from cache: {e}")
            self.stats['errors'] += 1
            return False
    
    async def clear_namespace(self, namespace: str) -> bool:
        """Clear all keys in a namespace.
        
        Args:
            namespace: Cache namespace
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if self.connected and self.redis_client:
                # Use Redis
                pattern = self._generate_key(namespace, "*")
                keys = await self.redis_client.keys(pattern)
                if keys:
                    await self.redis_client.delete(*keys)
                return True
            else:
                # Fallback to memory cache
                pattern = self._generate_key(namespace, "")
                keys_to_delete = [
                    key for key in self.fallback_cache.keys()
                    if key.startswith(pattern)
                ]
                for key in keys_to_delete:
                    del self.fallback_cache[key]
                return True
                
        except Exception as e:
            logger.error(f"Failed to clear namespace: {e}")
            self.stats['errors'] += 1
            return False
    
    def _is_expired(self, cached_item: Dict[str, Any]) -> bool:
        """Check if a cached item is expired.
        
        Args:
            cached_item: Cached item dictionary
            
        Returns:
            bool: True if expired, False otherwise
        """
        return time.time() > cached_item['expires']
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics.
        
        Returns:
            Dict[str, Any]: Cache statistics
        """
        total_requests = self.stats['hits'] + self.stats['misses']
        hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'connected': self.connected,
            'redis_available': REDIS_AVAILABLE,
            'fallback_cache_size': len(self.fallback_cache),
            'hit_rate_percent': round(hit_rate, 2),
            'total_requests': total_requests,
            'hits': self.stats['hits'],
            'misses': self.stats['misses'],
            'sets': self.stats['sets'],
            'deletes': self.stats['deletes'],
            'errors': self.stats['errors']
        }


# Global cache instance
_ecs_cache: Optional[ECSRedisCache] = None


def get_ecs_cache() -> ECSRedisCache:
    """Get the global ECS cache instance.
    
    Returns:
        ECSRedisCache: Global cache instance
    """
    global _ecs_cache
    if _ecs_cache is None:
        _ecs_cache = ECSRedisCache()
    return _ecs_cache


# Cache decorators
def cache_result(
    namespace: str,
    ttl: int = 3600,
    key_func: Optional[callable] = None
):
    """Decorator to cache function results.
    
    Args:
        namespace: Cache namespace
        ttl: Time to live in seconds
        key_func: Function to generate cache key from arguments
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            cache = get_ecs_cache()
            
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default key generation
                key_data = f"{func.__name__}:{str(args)}:{str(sorted(kwargs.items()))}"
                cache_key = hashlib.md5(key_data.encode()).hexdigest()
            
            # Try to get from cache
            cached_result = await cache.get(namespace, cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}")
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache.set(namespace, cache_key, result, ttl)
            logger.debug(f"Cached result for {func.__name__}")
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # For sync functions, we'll use asyncio.run
            return asyncio.run(async_wrapper(*args, **kwargs))
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# Specific cache decorators for ECS
def cache_naming_spirits(ttl: int = 1800):
    """Cache naming spirits data."""
    return cache_result("naming_spirits", ttl)


def cache_naming_components(ttl: int = 1800):
    """Cache naming components data."""
    return cache_result("naming_components", ttl)


def cache_naming_config(ttl: int = 3600):
    """Cache naming configuration data."""
    return cache_result("naming_config", ttl)


def cache_agent_data(ttl: int = 300):
    """Cache agent data."""
    return cache_result("agent_data", ttl)


def cache_agent_traits(ttl: int = 300):
    """Cache agent traits data."""
    return cache_result("agent_traits", ttl)


def cache_agent_relationships(ttl: int = 600):
    """Cache agent relationships data."""
    return cache_result("agent_relationships", ttl)


def cache_agent_interactions(ttl: int = 300):
    """Cache agent interactions data."""
    return cache_result("agent_interactions", ttl)


# Cache invalidation
async def invalidate_agent_cache(agent_id: str):
    """Invalidate all cache entries for a specific agent.
    
    Args:
        agent_id: Agent ID to invalidate
    """
    cache = get_ecs_cache()
    
    # Invalidate agent data
    await cache.delete("agent_data", agent_id)
    await cache.delete("agent_traits", agent_id)
    await cache.delete("agent_relationships", agent_id)
    await cache.delete("agent_interactions", agent_id)
    
    logger.info(f"Invalidated cache for agent {agent_id}")


async def invalidate_naming_cache():
    """Invalidate all naming-related cache entries."""
    cache = get_ecs_cache()
    
    await cache.clear_namespace("naming_spirits")
    await cache.clear_namespace("naming_components")
    await cache.clear_namespace("naming_config")
    
    logger.info("Invalidated naming cache")


# Cache warming functions
async def warm_naming_cache():
    """Warm the naming cache with frequently accessed data."""
    cache = get_ecs_cache()
    
    # This would typically load data from database
    # For now, we'll simulate with some common data
    common_spirits = {
        'fox': ['Reynard', 'Vixen', 'Kitsune'],
        'wolf': ['Alpha', 'Beta', 'Luna'],
        'otter': ['River', 'Marina', 'Aqua']
    }
    
    for spirit, names in common_spirits.items():
        await cache.set("naming_spirits", spirit, names, ttl=1800)
    
    logger.info("Warmed naming cache")


async def warm_agent_cache(agent_ids: List[str]):
    """Warm the agent cache with frequently accessed agents.
    
    Args:
        agent_ids: List of agent IDs to warm
    """
    cache = get_ecs_cache()
    
    # This would typically load agent data from database
    for agent_id in agent_ids:
        # Simulate agent data
        agent_data = {
            'agent_id': agent_id,
            'name': f'Agent {agent_id}',
            'spirit': 'fox',
            'active': True
        }
        await cache.set("agent_data", agent_id, agent_data, ttl=300)
    
    logger.info(f"Warmed agent cache for {len(agent_ids)} agents")


# Test function
async def test_redis_cache():
    """Test the Redis cache functionality."""
    print("🐍 Mysterious-Prime-67 ECS Redis Cache Test")
    print("=" * 50)
    
    cache = ECSRedisCache()
    
    # Test connection
    print("\n🔌 Testing Redis Connection:")
    connected = await cache.connect()
    print(f"   Connected: {'✅' if connected else '❌'}")
    
    if not connected:
        print("   Using fallback memory cache")
    
    # Test basic operations
    print("\n📝 Testing Cache Operations:")
    
    # Test set
    test_data = {"name": "test_agent", "spirit": "fox", "active": True}
    success = await cache.set("test", "agent_123", test_data, ttl=60)
    print(f"   Set operation: {'✅' if success else '❌'}")
    
    # Test get
    retrieved_data = await cache.get("test", "agent_123")
    if retrieved_data == test_data:
        print(f"   Get operation: ✅")
    else:
        print(f"   Get operation: ❌ (expected {test_data}, got {retrieved_data})")
    
    # Test delete
    success = await cache.delete("test", "agent_123")
    print(f"   Delete operation: {'✅' if success else '❌'}")
    
    # Test get after delete
    retrieved_data = await cache.get("test", "agent_123")
    if retrieved_data is None:
        print(f"   Get after delete: ✅")
    else:
        print(f"   Get after delete: ❌ (expected None, got {retrieved_data})")
    
    # Test performance
    print("\n⚡ Testing Cache Performance:")
    start_time = time.time()
    
    # Set multiple values
    for i in range(100):
        await cache.set("perf_test", f"key_{i}", {"value": i}, ttl=60)
    
    set_time = time.time() - start_time
    print(f"   Set 100 values: {set_time*1000:.1f}ms")
    
    # Get multiple values
    start_time = time.time()
    for i in range(100):
        await cache.get("perf_test", f"key_{i}")
    
    get_time = time.time() - start_time
    print(f"   Get 100 values: {get_time*1000:.1f}ms")
    
    # Test cache decorator
    print("\n🎯 Testing Cache Decorator:")
    
    @cache_naming_spirits(ttl=60)
    async def get_spirit_names(spirit: str):
        """Simulate getting spirit names from database."""
        await asyncio.sleep(0.01)  # Simulate database delay
        return [f"{spirit}_name_{i}" for i in range(3)]
    
    # First call (cache miss)
    start_time = time.time()
    result1 = await get_spirit_names("fox")
    first_call_time = time.time() - start_time
    
    # Second call (cache hit)
    start_time = time.time()
    result2 = await get_spirit_names("fox")
    second_call_time = time.time() - start_time
    
    if result1 == result2:
        print(f"   Cache decorator: ✅")
        print(f"   First call: {first_call_time*1000:.1f}ms")
        print(f"   Cached call: {second_call_time*1000:.1f}ms")
        print(f"   Speedup: {first_call_time/second_call_time:.1f}x")
    else:
        print(f"   Cache decorator: ❌")
    
    # Get statistics
    print("\n📊 Cache Statistics:")
    stats = cache.get_stats()
    for key, value in stats.items():
        print(f"   {key}: {value}")
    
    # Cleanup
    await cache.clear_namespace("test")
    await cache.clear_namespace("perf_test")
    await cache.disconnect()
    
    print("\n🎉 Redis cache test completed!")


if __name__ == "__main__":
    asyncio.run(test_redis_cache())
