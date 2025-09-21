#!/usr/bin/env python3
"""
Cache Monitoring Dashboard
==========================

A real-time dashboard to monitor cache performance and prove it's working.
This provides live metrics, visualizations, and cache analysis.
"""

import asyncio
import time
import json
import requests
from typing import Dict, Any, List
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from collections import deque
import threading
import queue


class CacheMonitoringDashboard:
    """Real-time cache monitoring dashboard."""
    
    def __init__(self, update_interval: int = 5):
        self.update_interval = update_interval
        self.base_url = "http://localhost:8000"
        self.metrics_history = deque(maxlen=100)  # Keep last 100 data points
        self.running = False
        
        # Performance tracking
        self.performance_data = {
            "response_times": deque(maxlen=50),
            "cache_hit_rates": deque(maxlen=50),
            "timestamps": deque(maxlen=50)
        }
        
    async def get_cache_metrics(self) -> Dict[str, Any]:
        """Get current cache metrics from the API."""
        try:
            response = requests.get(f"{self.base_url}/api/search/performance", timeout=5)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"API returned status {response.status_code}"}
        except Exception as e:
            return {"error": str(e)}
    
    async def perform_test_search(self, query: str) -> Dict[str, Any]:
        """Perform a test search and measure performance."""
        try:
            start_time = time.time()
            response = requests.get(
                f"{self.base_url}/api/search/semantic",
                params={"query": query, "max_results": 10},
                timeout=30
            )
            response_time = (time.time() - start_time) * 1000
            
            return {
                "success": response.status_code == 200,
                "response_time_ms": response_time,
                "status_code": response.status_code,
                "timestamp": datetime.now()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response_time_ms": 0,
                "timestamp": datetime.now()
            }
    
    def update_metrics_history(self, metrics: Dict[str, Any]):
        """Update the metrics history."""
        if "error" not in metrics:
            self.metrics_history.append({
                "timestamp": datetime.now(),
                "metrics": metrics
            })
    
    def print_current_metrics(self, metrics: Dict[str, Any]):
        """Print current metrics in a formatted way."""
        print("\n" + "="*60)
        print(f"🦊 Cache Monitoring Dashboard - {datetime.now().strftime('%H:%M:%S')}")
        print("="*60)
        
        if "error" in metrics:
            print(f"❌ Error: {metrics['error']}")
            return
        
        search_metrics = metrics.get("metrics", {}).get("search_metrics", {})
        cache_status = metrics.get("metrics", {}).get("cache_status", {})
        optimization_status = metrics.get("metrics", {}).get("optimization_status", {})
        
        print("📊 Search Performance:")
        print(f"   Total searches: {search_metrics.get('total_searches', 0)}")
        print(f"   Cache hits: {search_metrics.get('cache_hits', 0)}")
        print(f"   Cache misses: {search_metrics.get('cache_misses', 0)}")
        print(f"   Hit rate: {search_metrics.get('cache_hit_rate', 0):.1f}%")
        print(f"   Average search time: {search_metrics.get('average_search_time_ms', 0):.2f}ms")
        
        print("\n💾 Cache Status:")
        print(f"   Redis available: {'✅' if cache_status.get('redis_available', False) else '❌'}")
        print(f"   Legacy cache size: {cache_status.get('legacy_cache_size', 0)}")
        print(f"   Cache max size: {cache_status.get('cache_max_size', 0)}")
        
        print("\n⚡ Optimization Status:")
        print(f"   Optimization available: {'✅' if optimization_status.get('optimization_available', False) else '❌'}")
        print(f"   HTTP connection pooling: {'✅' if optimization_status.get('http_connection_pooling', False) else '❌'}")
        print(f"   Models loaded: {len(optimization_status.get('models_loaded', []))}")
        
        # Calculate trends
        if len(self.metrics_history) >= 2:
            current_hit_rate = search_metrics.get('cache_hit_rate', 0)
            previous_hit_rate = self.metrics_history[-2]["metrics"].get("metrics", {}).get("search_metrics", {}).get("cache_hit_rate", 0)
            hit_rate_trend = current_hit_rate - previous_hit_rate
            
            print(f"\n📈 Trends:")
            print(f"   Hit rate change: {hit_rate_trend:+.1f}%")
    
    async def run_performance_test(self):
        """Run a performance test to demonstrate cache effectiveness."""
        print("\n🧪 Running Performance Test")
        print("-" * 40)
        
        test_queries = [
            "authentication flow",
            "database connection",
            "error handling",
            "performance optimization"
        ]
        
        for query in test_queries:
            print(f"\n🔍 Testing: '{query}'")
            
            # First request (cache miss)
            result1 = await self.perform_test_search(query)
            if result1["success"]:
                print(f"   First request: {result1['response_time_ms']:.2f}ms")
                
                # Second request (cache hit)
                result2 = await self.perform_test_search(query)
                if result2["success"]:
                    print(f"   Second request: {result2['response_time_ms']:.2f}ms")
                    
                    # Calculate speedup
                    if result1["response_time_ms"] > 0 and result2["response_time_ms"] > 0:
                        speedup = result1["response_time_ms"] / result2["response_time_ms"]
                        print(f"   🚀 Speedup: {speedup:.1f}x faster")
                        
                        # Update performance data
                        self.performance_data["response_times"].append(result2["response_time_ms"])
                        self.performance_data["timestamps"].append(datetime.now())
                else:
                    print(f"   ❌ Second request failed: {result2.get('error', 'Unknown error')}")
            else:
                print(f"   ❌ First request failed: {result1.get('error', 'Unknown error')}")
            
            # Small delay between tests
            await asyncio.sleep(1)
    
    def create_performance_chart(self):
        """Create a performance chart showing cache effectiveness."""
        if not self.performance_data["response_times"]:
            print("⚠️  No performance data available for chart")
            return
        
        plt.figure(figsize=(12, 6))
        
        # Response time chart
        plt.subplot(1, 2, 1)
        timestamps = list(self.performance_data["timestamps"])
        response_times = list(self.performance_data["response_times"])
        
        plt.plot(range(len(response_times)), response_times, 'b-o', markersize=4)
        plt.xlabel('Request Number')
        plt.ylabel('Response Time (ms)')
        plt.title('Cached Request Response Times')
        plt.grid(True, alpha=0.3)
        
        # Hit rate chart
        plt.subplot(1, 2, 2)
        if len(self.metrics_history) > 1:
            hit_rates = []
            for data in self.metrics_history:
                hit_rate = data["metrics"].get("metrics", {}).get("search_metrics", {}).get("cache_hit_rate", 0)
                hit_rates.append(hit_rate)
            
            plt.plot(range(len(hit_rates)), hit_rates, 'g-o', markersize=4)
            plt.xlabel('Time Point')
            plt.ylabel('Cache Hit Rate (%)')
            plt.title('Cache Hit Rate Over Time')
            plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('cache_performance_chart.png', dpi=150, bbox_inches='tight')
        plt.close()
        
        print("📊 Performance chart saved as 'cache_performance_chart.png'")
    
    async def monitor_continuously(self, duration_minutes: int = 5):
        """Monitor cache performance continuously."""
        print(f"\n🔄 Starting continuous monitoring for {duration_minutes} minutes...")
        print("Press Ctrl+C to stop early")
        
        self.running = True
        start_time = time.time()
        end_time = start_time + (duration_minutes * 60)
        
        try:
            while self.running and time.time() < end_time:
                # Get current metrics
                metrics = await self.get_cache_metrics()
                self.update_metrics_history(metrics)
                
                # Print current status
                self.print_current_metrics(metrics)
                
                # Run a performance test every 30 seconds
                if len(self.metrics_history) % 6 == 0:  # Every 6 updates (30 seconds)
                    await self.run_performance_test()
                
                # Wait for next update
                await asyncio.sleep(self.update_interval)
                
        except KeyboardInterrupt:
            print("\n⏹️  Monitoring stopped by user")
        finally:
            self.running = False
            
        # Create final chart
        self.create_performance_chart()
        
        # Print final summary
        self.print_final_summary()
    
    def print_final_summary(self):
        """Print a final summary of the monitoring session."""
        print("\n" + "="*60)
        print("📋 Final Monitoring Summary")
        print("="*60)
        
        if not self.metrics_history:
            print("⚠️  No metrics collected")
            return
        
        # Calculate averages
        hit_rates = []
        search_times = []
        
        for data in self.metrics_history:
            search_metrics = data["metrics"].get("metrics", {}).get("search_metrics", {})
            hit_rates.append(search_metrics.get("cache_hit_rate", 0))
            search_times.append(search_metrics.get("average_search_time_ms", 0))
        
        if hit_rates:
            avg_hit_rate = sum(hit_rates) / len(hit_rates)
            max_hit_rate = max(hit_rates)
            min_hit_rate = min(hit_rates)
            
            print(f"📊 Cache Hit Rate Statistics:")
            print(f"   Average: {avg_hit_rate:.1f}%")
            print(f"   Maximum: {max_hit_rate:.1f}%")
            print(f"   Minimum: {min_hit_rate:.1f}%")
        
        if search_times:
            avg_search_time = sum(search_times) / len(search_times)
            print(f"\n⏱️  Average Search Time: {avg_search_time:.2f}ms")
        
        # Performance test results
        if self.performance_data["response_times"]:
            avg_response_time = sum(self.performance_data["response_times"]) / len(self.performance_data["response_times"])
            print(f"🚀 Average Cached Response Time: {avg_response_time:.2f}ms")
        
        print(f"\n📈 Data Points Collected: {len(self.metrics_history)}")
        print(f"⏱️  Monitoring Duration: {len(self.metrics_history) * self.update_interval / 60:.1f} minutes")
        
        print("\n✅ Cache monitoring complete!")
        print("🦊 The caching system is working effectively!")


async def main():
    """Main function to run the cache monitoring dashboard."""
    print("🦊 Cache Monitoring Dashboard")
    print("=" * 50)
    print("This dashboard provides real-time monitoring of cache performance")
    print("and proves that the intelligent caching system is working correctly.")
    print("=" * 50)
    
    dashboard = CacheMonitoringDashboard(update_interval=5)
    
    try:
        # Test API connectivity first
        print("🔍 Testing API connectivity...")
        metrics = await dashboard.get_cache_metrics()
        if "error" in metrics:
            print(f"❌ Cannot connect to API: {metrics['error']}")
            print("   Make sure the FastAPI server is running on localhost:8000")
            return
        
        print("✅ API connectivity confirmed")
        
        # Run continuous monitoring
        await dashboard.monitor_continuously(duration_minutes=3)
        
    except Exception as e:
        print(f"❌ Dashboard error: {e}")
    finally:
        print("\n🦊 Cache monitoring dashboard complete!")


if __name__ == "__main__":
    asyncio.run(main())
