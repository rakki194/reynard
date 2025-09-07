"""
Cache service for Reynard Basic Backend
Handles caching operations with reload optimization
"""

import asyncio
import json
import os
from typing import Dict, Any, Optional, Union
from datetime import datetime, timedelta

# Detect reload mode
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"


class CacheService:
    """Cache service with TTL support and reload optimization"""
    
    def __init__(self):
        self.cache_store: Dict[str, Dict[str, Any]] = {}
        self.is_initialized = False
        self.default_ttl = 3600  # 1 hour
        self.stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "deletes": 0
        }
    
    async def initialize(self):
        """Initialize cache service"""
        if IS_RELOAD_MODE:
            print("🔄 Skipping cache initialization during reload")
            return
        
        print("🔧 Initializing cache service...")
        
        # Simulate cache setup
        await asyncio.sleep(0.05)
        
        self.cache_store = {}
        self.is_initialized = True
        
        print("✅ Cache service initialized")
    
    def _is_expired(self, item: Dict[str, Any]) -> bool:
        """Check if a cache item is expired"""
        if "expires_at" not in item:
            return False
        
        return datetime.now() > item["expires_at"]
    
    def _create_cache_item(self, value: Any, ttl: Optional[int] = None) -> Dict[str, Any]:
        """Create a cache item with expiration"""
        ttl = ttl or self.default_ttl
        expires_at = datetime.now() + timedelta(seconds=ttl)
        
        return {
            "value": value,
            "created_at": datetime.now(),
            "expires_at": expires_at,
            "ttl": ttl
        }
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache"""
        if not self.is_initialized:
            return None
        
        if key not in self.cache_store:
            self.stats["misses"] += 1
            return None
        
        item = self.cache_store[key]
        
        if self._is_expired(item):
            del self.cache_store[key]
            self.stats["misses"] += 1
            return None
        
        self.stats["hits"] += 1
        return item["value"]
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set a value in cache"""
        if not self.is_initialized:
            return False
        
        try:
            self.cache_store[key] = self._create_cache_item(value, ttl)
            self.stats["sets"] += 1
            return True
        except Exception as e:
            print(f"❌ Cache set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete a value from cache"""
        if not self.is_initialized:
            return False
        
        if key in self.cache_store:
            del self.cache_store[key]
            self.stats["deletes"] += 1
            return True
        
        return False
    
    async def clear(self) -> bool:
        """Clear all cache entries"""
        if not self.is_initialized:
            return False
        
        self.cache_store.clear()
        print("🧹 Cache cleared")
        return True
    
    async def exists(self, key: str) -> bool:
        """Check if a key exists in cache"""
        if not self.is_initialized:
            return False
        
        if key not in self.cache_store:
            return False
        
        if self._is_expired(self.cache_store[key]):
            del self.cache_store[key]
            return False
        
        return True
    
    async def get_ttl(self, key: str) -> Optional[int]:
        """Get TTL for a key"""
        if not self.is_initialized:
            return None
        
        if key not in self.cache_store:
            return None
        
        item = self.cache_store[key]
        
        if self._is_expired(item):
            del self.cache_store[key]
            return None
        
        remaining = (item["expires_at"] - datetime.now()).total_seconds()
        return max(0, int(remaining))
    
    async def health_check(self) -> bool:
        """Check cache health"""
        if not self.is_initialized:
            return False
        
        try:
            # Test cache operations
            test_key = "__health_check__"
            await self.set(test_key, "ok", 1)
            result = await self.get(test_key)
            await self.delete(test_key)
            
            return result == "ok"
        except Exception:
            return False
    
    async def cleanup_expired(self) -> int:
        """Clean up expired cache entries"""
        if not self.is_initialized:
            return 0
        
        expired_keys = []
        for key, item in self.cache_store.items():
            if self._is_expired(item):
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.cache_store[key]
        
        if expired_keys:
            print(f"🧹 Cleaned up {len(expired_keys)} expired cache entries")
        
        return len(expired_keys)
    
    async def close(self):
        """Close cache service and cleanup"""
        if not self.is_initialized:
            return
        
        print("🔧 Closing cache service...")
        
        # Cleanup expired entries
        await self.cleanup_expired()
        
        self.cache_store.clear()
        self.is_initialized = False
        
        print("✅ Cache service closed")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache service statistics"""
        return {
            "initialized": self.is_initialized,
            "entries": len(self.cache_store),
            "hits": self.stats["hits"],
            "misses": self.stats["misses"],
            "sets": self.stats["sets"],
            "deletes": self.stats["deletes"],
            "hit_rate": (
                self.stats["hits"] / (self.stats["hits"] + self.stats["misses"])
                if (self.stats["hits"] + self.stats["misses"]) > 0 else 0
            )
        }
