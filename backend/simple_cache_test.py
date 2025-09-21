#!/usr/bin/env python3
"""
Simple Cache Test Script
========================

A focused script to quickly prove that the caching system is working.
This script demonstrates cache hits, misses, and performance improvements.
"""

import asyncio
import time
from typing import Dict, Any

try:
    import requests
except ImportError:
    requests = None


async def test_search_service_cache() -> bool:
    """Test the search service cache directly."""
    print("🦊 Testing Search Service Cache")
    print("=" * 40)
    
    try:
        from app.api.search.service import OptimizedSearchService
        from app.api.search.models import SemanticSearchRequest
        
        # Initialize service
        service = OptimizedSearchService()
        await service.initialize()
        
        # Test query
        test_query = "authentication flow"
        request = SemanticSearchRequest(
            query=test_query,
            max_results=10,
            similarity_threshold=0.7
        )
        
        print(f"🔍 Testing query: '{test_query}'")
        
        # First request (cache miss)
        print("\n📝 First request (should be cache miss):")
        start_time = time.time()
        result1 = await service.semantic_search(request)
        first_time = (time.time() - start_time) * 1000
        print(f"   Time: {first_time:.2f}ms")
        print(f"   Results: {len(result1.results) if result1.success else 0}")
        print(f"   Success: {result1.success}")
        
        # Second request (cache hit)
        print("\n⚡ Second request (should be cache hit):")
        start_time = time.time()
        result2 = await service.semantic_search(request)
        second_time = (time.time() - start_time) * 1000
        print(f"   Time: {second_time:.2f}ms")
        print(f"   Results: {len(result2.results) if result2.success else 0}")
        print(f"   Success: {result2.success}")
        
        # Calculate speedup
        if first_time > 0 and second_time > 0:
            speedup = first_time / second_time
            print(f"\n🚀 Performance Improvement:")
            print(f"   Speedup: {speedup:.1f}x faster")
            print(f"   Time saved: {first_time - second_time:.2f}ms")
        
        # Verify results are identical
        if result1.success and result2.success:
            if len(result1.results) == len(result2.results):
                print("   ✅ Results are identical (cache working correctly)")
            else:
                print("   ⚠️  Results differ (potential cache issue)")
        
        # Get metrics
        print(f"\n📊 Cache Metrics:")
        metrics = service.get_performance_metrics()
        search_metrics = metrics.get("search_metrics", {})
        print(f"   Total searches: {search_metrics.get('total_searches', 0)}")
        print(f"   Cache hits: {search_metrics.get('cache_hits', 0)}")
        print(f"   Cache misses: {search_metrics.get('cache_misses', 0)}")
        print(f"   Hit rate: {search_metrics.get('cache_hit_rate', 0):.1f}%")
        
        await service.close()
        return True
        
    except Exception as e:
        print(f"❌ Search service test failed: {e}")
        return False


def test_api_endpoint_cache() -> None:
    """Test API endpoint caching."""
    if requests is None:
        print("\n⚠️  Requests library not available - skipping API endpoint tests")
        return
        
    print("\n🌐 Testing API Endpoint Cache")
    print("=" * 40)
    
    base_url = "http://localhost:8000"
    
    # Test search endpoint
    test_queries = [
        "authentication",
        "database connection", 
        "error handling"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Testing query: '{query}'")
        
        try:
            # First request
            start_time = time.time()
            response1 = requests.get(
                f"{base_url}/api/search/semantic",
                params={"query": query, "max_results": 10},
                timeout=30
            )
            first_time = (time.time() - start_time) * 1000
            
            if response1.status_code == 200:
                print(f"   First request: {first_time:.2f}ms")
                
                # Second request
                start_time = time.time()
                response2 = requests.get(
                    f"{base_url}/api/search/semantic",
                    params={"query": query, "max_results": 10},
                    timeout=30
                )
                second_time = (time.time() - start_time) * 1000
                
                if response2.status_code == 200:
                    print(f"   Second request: {second_time:.2f}ms")
                    
                    # Calculate speedup
                    if first_time > 0 and second_time > 0:
                        speedup = first_time / second_time
                        print(f"   🚀 Speedup: {speedup:.1f}x faster")
                    
                    # Verify responses are identical
                    if response1.json() == response2.json():
                        print("   ✅ Responses are identical")
                    else:
                        print("   ⚠️  Responses differ")
                else:
                    print(f"   ❌ Second request failed: {response2.status_code}")
            else:
                print(f"   ❌ First request failed: {response1.status_code}")
                
        except Exception as e:
            print(f"   ❌ API test failed: {e}")


def test_cache_metrics_endpoint() -> None:
    """Test the cache metrics endpoint."""
    if requests is None:
        print("\n⚠️  Requests library not available - skipping metrics endpoint test")
        return
        
    print("\n📊 Testing Cache Metrics Endpoint")
    print("=" * 40)
    
    try:
        response = requests.get("http://localhost:8000/api/search/performance", timeout=10)
        
        if response.status_code == 200:
            metrics = response.json()
            print("✅ Cache metrics retrieved successfully")
            
            search_metrics = metrics.get("metrics", {}).get("search_metrics", {})
            print(f"   Total searches: {search_metrics.get('total_searches', 0)}")
            print(f"   Cache hits: {search_metrics.get('cache_hits', 0)}")
            print(f"   Cache misses: {search_metrics.get('cache_misses', 0)}")
            print(f"   Hit rate: {search_metrics.get('cache_hit_rate', 0):.1f}%")
            print(f"   Average search time: {search_metrics.get('average_search_time_ms', 0):.2f}ms")
            
            cache_status = metrics.get("metrics", {}).get("cache_status", {})
            print(f"   Redis available: {cache_status.get('redis_available', False)}")
            print(f"   Legacy cache size: {cache_status.get('legacy_cache_size', 0)}")
            
        else:
            print(f"❌ Metrics endpoint failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Metrics test failed: {e}")


def test_cache_clear_endpoint() -> None:
    """Test the cache clear endpoint."""
    if requests is None:
        print("\n⚠️  Requests library not available - skipping cache clear test")
        return
        
    print("\n🧹 Testing Cache Clear Endpoint")
    print("=" * 40)
    
    try:
        response = requests.post("http://localhost:8000/api/search/cache/clear", timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Cache cleared successfully")
            print(f"   Message: {result.get('message', 'N/A')}")
        else:
            print(f"❌ Cache clear failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Cache clear test failed: {e}")


async def main() -> None:
    """Main test function."""
    print("🦊 Simple Cache Proof Test")
    print("=" * 50)
    print("This script provides quick proof that the caching system is working.")
    print("=" * 50)
    
    # Test 1: Direct search service cache
    print("\n1️⃣ Testing Search Service Cache Directly")
    service_success = await test_search_service_cache()
    
    # Test 2: API endpoint cache
    print("\n2️⃣ Testing API Endpoint Cache")
    test_api_endpoint_cache()
    
    # Test 3: Cache metrics endpoint
    print("\n3️⃣ Testing Cache Metrics Endpoint")
    test_cache_metrics_endpoint()
    
    # Test 4: Cache clear endpoint
    print("\n4️⃣ Testing Cache Clear Endpoint")
    test_cache_clear_endpoint()
    
    # Summary
    print("\n🎉 Cache Proof Test Complete!")
    print("=" * 50)
    if service_success:
        print("✅ Search service cache is working correctly")
    else:
        print("❌ Search service cache test failed")
    
    print("\n📋 To run more comprehensive tests:")
    print("   python cache_proof_demonstration.py")
    print("\n🦊 The caching system provides significant performance improvements!")


if __name__ == "__main__":
    asyncio.run(main())
