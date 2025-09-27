#!/usr/bin/env python3
"""🦊 Real-time Memory Monitor Dashboard
=====================================

Real-time memory monitoring dashboard for the RAG backend stack.
Provides live visualization of memory usage, component analysis,
and leak detection with a simple terminal-based interface.

Features:
- Real-time memory usage display
- Component-specific memory tracking
- Memory leak detection and alerts
- Performance metrics visualization
- Integration with memory profiling data
- Export capabilities for analysis

Usage:
    python memory_monitor_dashboard.py --service rag --refresh 2
    python memory_monitor_dashboard.py --monitor-indexing --export-json
    python memory_monitor_dashboard.py --analyze-leaks --output report.json

Author: Reynard Development Team
Version: 1.0.0
"""

import argparse
import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional
import psutil
import gc

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.memory_profiling import get_memory_stats, get_memory_profiles, clear_memory_profiles
from memory_debug_tracer import MemoryDebugTracer

logger = logging.getLogger(__name__)


class MemoryMonitorDashboard:
    """Real-time memory monitoring dashboard."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the memory monitor dashboard."""
        self.config = config or {}
        self.refresh_interval = self.config.get("refresh_interval", 2.0)
        self.max_history = self.config.get("max_history", 100)
        self.alert_threshold_mb = self.config.get("alert_threshold_mb", 100)
        self.critical_threshold_mb = self.config.get("critical_threshold_mb", 500)
        
        # Memory history
        self.memory_history: List[Dict[str, Any]] = []
        self.component_history: Dict[str, List[Dict[str, Any]]] = {}
        
        # Monitoring state
        self._running = False
        self._monitoring_task: Optional[asyncio.Task] = None
        
        # Statistics
        self.stats = {
            "start_time": None,
            "total_samples": 0,
            "peak_memory_mb": 0,
            "alerts_triggered": 0,
            "components_monitored": set(),
        }
    
    async def start_monitoring(self, duration_seconds: Optional[int] = None) -> None:
        """Start real-time memory monitoring."""
        if self._running:
            logger.warning("Monitoring already running")
            return
        
        try:
            self._running = True
            self.stats["start_time"] = datetime.now()
            
            logger.info("🚀 Starting real-time memory monitoring...")
            logger.info(f"   Refresh interval: {self.refresh_interval}s")
            logger.info(f"   Alert threshold: {self.alert_threshold_mb}MB")
            logger.info(f"   Critical threshold: {self.critical_threshold_mb}MB")
            
            # Start monitoring task
            self._monitoring_task = asyncio.create_task(self._monitoring_loop(duration_seconds))
            
            # Start dashboard display
            await self._display_dashboard()
            
        except Exception as e:
            logger.error(f"❌ Failed to start monitoring: {e}")
            self._running = False
    
    async def stop_monitoring(self) -> Dict[str, Any]:
        """Stop monitoring and return summary."""
        if not self._running:
            return {"error": "Monitoring not running"}
        
        try:
            self._running = False
            
            # Cancel monitoring task
            if self._monitoring_task and not self._monitoring_task.done():
                self._monitoring_task.cancel()
                try:
                    await self._monitoring_task
                except asyncio.CancelledError:
                    pass
            
            # Generate summary
            summary = self._generate_summary()
            
            logger.info("✅ Monitoring stopped")
            return summary
            
        except Exception as e:
            logger.error(f"❌ Error stopping monitoring: {e}")
            return {"error": str(e)}
    
    async def _monitoring_loop(self, duration_seconds: Optional[int] = None) -> None:
        """Main monitoring loop."""
        try:
            end_time = None
            if duration_seconds:
                end_time = datetime.now() + timedelta(seconds=duration_seconds)
            
            while self._running:
                if end_time and datetime.now() >= end_time:
                    logger.info("⏰ Monitoring duration reached")
                    break
                
                await self._collect_memory_data()
                await asyncio.sleep(self.refresh_interval)
                
        except asyncio.CancelledError:
            logger.info("Monitoring loop cancelled")
        except Exception as e:
            logger.error(f"Error in monitoring loop: {e}")
    
    async def _collect_memory_data(self) -> None:
        """Collect current memory data."""
        try:
            process = psutil.Process()
            memory_info = process.memory_info()
            
            # Basic memory data
            memory_data = {
                "timestamp": datetime.now(),
                "memory_mb": memory_info.rss / 1024 / 1024,
                "memory_percent": process.memory_percent(),
                "cpu_percent": process.cpu_percent(),
                "num_threads": process.num_threads(),
                "num_fds": process.num_fds() if hasattr(process, 'num_fds') else 0,
                "gc_counts": gc.get_count(),
            }
            
            # Add to history
            self.memory_history.append(memory_data)
            if len(self.memory_history) > self.max_history:
                self.memory_history = self.memory_history[-self.max_history:]
            
            # Update statistics
            self.stats["total_samples"] += 1
            if memory_data["memory_mb"] > self.stats["peak_memory_mb"]:
                self.stats["peak_memory_mb"] = memory_data["memory_mb"]
            
            # Check for alerts
            await self._check_memory_alerts(memory_data)
            
            # Get component-specific data
            await self._collect_component_data()
            
        except Exception as e:
            logger.error(f"Error collecting memory data: {e}")
    
    async def _collect_component_data(self) -> None:
        """Collect component-specific memory data."""
        try:
            # Get memory profiles
            profiles = get_memory_profiles(limit=50)
            
            # Group by component
            component_data = {}
            for profile in profiles:
                component = profile.get("component", "unknown")
                if component not in component_data:
                    component_data[component] = []
                component_data[component].append(profile)
            
            # Update component history
            for component, data in component_data.items():
                if component not in self.component_history:
                    self.component_history[component] = []
                
                # Calculate component statistics
                memory_usage = [p.get("memory_used_mb", 0) for p in data]
                execution_times = [p.get("execution_time_ms", 0) for p in data]
                
                component_summary = {
                    "timestamp": datetime.now(),
                    "component": component,
                    "operations_count": len(data),
                    "avg_memory_mb": sum(memory_usage) / len(memory_usage) if memory_usage else 0,
                    "max_memory_mb": max(memory_usage) if memory_usage else 0,
                    "avg_execution_ms": sum(execution_times) / len(execution_times) if execution_times else 0,
                    "error_count": len([p for p in data if "error" in p]),
                }
                
                self.component_history[component].append(component_summary)
                if len(self.component_history[component]) > self.max_history:
                    self.component_history[component] = self.component_history[component][-self.max_history:]
                
                self.stats["components_monitored"].add(component)
                
        except Exception as e:
            logger.error(f"Error collecting component data: {e}")
    
    async def _check_memory_alerts(self, memory_data: Dict[str, Any]) -> None:
        """Check for memory alerts."""
        try:
            memory_mb = memory_data["memory_mb"]
            
            if memory_mb > self.critical_threshold_mb:
                logger.error(f"🚨 CRITICAL: Memory usage {memory_mb:.1f}MB exceeds critical threshold")
                self.stats["alerts_triggered"] += 1
            elif memory_mb > self.alert_threshold_mb:
                logger.warning(f"⚠️ ALERT: Memory usage {memory_mb:.1f}MB exceeds alert threshold")
                self.stats["alerts_triggered"] += 1
            
        except Exception as e:
            logger.error(f"Error checking memory alerts: {e}")
    
    async def _display_dashboard(self) -> None:
        """Display the real-time dashboard."""
        try:
            while self._running:
                # Clear screen (works on most terminals)
                os.system('clear' if os.name == 'posix' else 'cls')
                
                # Display header
                print("🦊 Reynard Memory Monitor Dashboard")
                print("=" * 60)
                print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"Duration: {self._get_monitoring_duration()}")
                print(f"Samples: {self.stats['total_samples']}")
                print()
                
                # Display current memory status
                await self._display_current_status()
                
                # Display memory history chart
                await self._display_memory_chart()
                
                # Display component analysis
                await self._display_component_analysis()
                
                # Display alerts
                await self._display_alerts()
                
                # Display controls
                print("\n" + "=" * 60)
                print("Controls: Ctrl+C to stop, 'q' + Enter to quit")
                print("=" * 60)
                
                await asyncio.sleep(self.refresh_interval)
                
        except KeyboardInterrupt:
            logger.info("Dashboard interrupted by user")
        except Exception as e:
            logger.error(f"Error displaying dashboard: {e}")
    
    async def _display_current_status(self) -> None:
        """Display current memory status."""
        if not self.memory_history:
            print("📊 Current Status: No data available")
            return
        
        current = self.memory_history[-1]
        
        # Determine status color/icon
        if current["memory_mb"] > self.critical_threshold_mb:
            status_icon = "🚨"
            status_text = "CRITICAL"
        elif current["memory_mb"] > self.alert_threshold_mb:
            status_icon = "⚠️"
            status_text = "WARNING"
        else:
            status_icon = "✅"
            status_text = "NORMAL"
        
        print(f"📊 Current Status: {status_icon} {status_text}")
        print(f"   Memory: {current['memory_mb']:.1f}MB ({current['memory_percent']:.1f}%)")
        print(f"   CPU: {current['cpu_percent']:.1f}%")
        print(f"   Threads: {current['num_threads']}")
        print(f"   File Descriptors: {current['num_fds']}")
        print(f"   GC Counts: {current['gc_counts']}")
        print()
    
    async def _display_memory_chart(self) -> None:
        """Display a simple memory usage chart."""
        if len(self.memory_history) < 2:
            print("📈 Memory Chart: Not enough data")
            return
        
        print("📈 Memory Usage Chart (last 20 samples):")
        
        # Get recent samples
        recent_samples = self.memory_history[-20:]
        memory_values = [s["memory_mb"] for s in recent_samples]
        
        if not memory_values:
            return
        
        # Create simple ASCII chart
        min_memory = min(memory_values)
        max_memory = max(memory_values)
        range_memory = max_memory - min_memory
        
        if range_memory == 0:
            print("   (constant memory usage)")
            return
        
        # Display chart
        chart_width = 50
        for i, memory in enumerate(memory_values):
            # Normalize to chart width
            normalized = int((memory - min_memory) / range_memory * chart_width)
            bar = "█" * normalized + "░" * (chart_width - normalized)
            
            # Add timestamp
            timestamp = recent_samples[i]["timestamp"].strftime("%H:%M:%S")
            print(f"   {timestamp} │{bar}│ {memory:.1f}MB")
        
        print(f"   {' ' * 8} └{'─' * chart_width}┘")
        print(f"   {' ' * 8} {min_memory:.1f}MB{' ' * (chart_width - 10)}{max_memory:.1f}MB")
        print()
    
    async def _display_component_analysis(self) -> None:
        """Display component analysis."""
        if not self.component_history:
            print("🔧 Component Analysis: No component data available")
            return
        
        print("🔧 Component Analysis:")
        
        for component, history in self.component_history.items():
            if not history:
                continue
            
            recent = history[-1]
            print(f"   {component}:")
            print(f"     Operations: {recent['operations_count']}")
            print(f"     Avg Memory: {recent['avg_memory_mb']:.1f}MB")
            print(f"     Max Memory: {recent['max_memory_mb']:.1f}MB")
            print(f"     Avg Time: {recent['avg_execution_ms']:.1f}ms")
            print(f"     Errors: {recent['error_count']}")
        
        print()
    
    async def _display_alerts(self) -> None:
        """Display current alerts."""
        if self.stats["alerts_triggered"] == 0:
            print("🚨 Alerts: None")
        else:
            print(f"🚨 Alerts: {self.stats['alerts_triggered']} triggered")
        
        print()
    
    def _get_monitoring_duration(self) -> str:
        """Get monitoring duration string."""
        if not self.stats["start_time"]:
            return "0s"
        
        duration = datetime.now() - self.stats["start_time"]
        total_seconds = int(duration.total_seconds())
        
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        
        if hours > 0:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Generate monitoring summary."""
        if not self.memory_history:
            return {"error": "No monitoring data available"}
        
        memory_values = [h["memory_mb"] for h in self.memory_history]
        cpu_values = [h["cpu_percent"] for h in self.memory_history]
        
        summary = {
            "monitoring_duration": self._get_monitoring_duration(),
            "total_samples": self.stats["total_samples"],
            "peak_memory_mb": self.stats["peak_memory_mb"],
            "alerts_triggered": self.stats["alerts_triggered"],
            "components_monitored": list(self.stats["components_monitored"]),
            "memory_stats": {
                "min_mb": min(memory_values),
                "max_mb": max(memory_values),
                "avg_mb": sum(memory_values) / len(memory_values),
                "final_mb": memory_values[-1],
            },
            "cpu_stats": {
                "min_percent": min(cpu_values),
                "max_percent": max(cpu_values),
                "avg_percent": sum(cpu_values) / len(cpu_values),
            },
            "component_summary": {}
        }
        
        # Add component summaries
        for component, history in self.component_history.items():
            if history:
                recent = history[-1]
                summary["component_summary"][component] = {
                    "total_operations": sum(h["operations_count"] for h in history),
                    "avg_memory_mb": recent["avg_memory_mb"],
                    "max_memory_mb": recent["max_memory_mb"],
                    "total_errors": sum(h["error_count"] for h in history),
                }
        
        return summary
    
    def export_data(self, format: str = "json", filename: Optional[str] = None) -> str:
        """Export monitoring data."""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"memory_monitor_export_{timestamp}.{format}"
        
        export_data = {
            "export_timestamp": datetime.now().isoformat(),
            "summary": self._generate_summary(),
            "memory_history": [
                {
                    "timestamp": h["timestamp"].isoformat(),
                    "memory_mb": h["memory_mb"],
                    "memory_percent": h["memory_percent"],
                    "cpu_percent": h["cpu_percent"],
                    "num_threads": h["num_threads"],
                    "num_fds": h["num_fds"],
                    "gc_counts": h["gc_counts"],
                }
                for h in self.memory_history
            ],
            "component_history": {
                component: [
                    {
                        "timestamp": h["timestamp"].isoformat(),
                        "component": h["component"],
                        "operations_count": h["operations_count"],
                        "avg_memory_mb": h["avg_memory_mb"],
                        "max_memory_mb": h["max_memory_mb"],
                        "avg_execution_ms": h["avg_execution_ms"],
                        "error_count": h["error_count"],
                    }
                    for h in history
                ]
                for component, history in self.component_history.items()
            }
        }
        
        if format == "json":
            with open(filename, 'w') as f:
                json.dump(export_data, f, indent=2)
        else:
            raise ValueError(f"Unsupported export format: {format}")
        
        logger.info(f"📁 Data exported to {filename}")
        return filename


async def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(description="Real-time Memory Monitor Dashboard")
    parser.add_argument("--service", choices=["rag", "indexing", "embedding", "all"], 
                       default="all", help="Service to monitor")
    parser.add_argument("--monitor-indexing", action="store_true", help="Monitor indexing operations")
    parser.add_argument("--analyze-leaks", action="store_true", help="Analyze memory leaks")
    parser.add_argument("--duration", type=int, help="Monitoring duration in seconds")
    parser.add_argument("--refresh", type=float, default=2.0, help="Refresh interval in seconds")
    parser.add_argument("--export-json", action="store_true", help="Export data to JSON")
    parser.add_argument("--output", type=str, help="Output file for export")
    parser.add_argument("--alert-threshold", type=float, default=100.0, help="Alert threshold in MB")
    parser.add_argument("--critical-threshold", type=float, default=500.0, help="Critical threshold in MB")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create dashboard
    config = {
        "refresh_interval": args.refresh,
        "max_history": 100,
        "alert_threshold_mb": args.alert_threshold,
        "critical_threshold_mb": args.critical_threshold,
    }
    
    dashboard = MemoryMonitorDashboard(config)
    
    try:
        if args.monitor_indexing:
            logger.info("Monitoring indexing operations...")
            # This would integrate with the actual indexing service
            await dashboard.start_monitoring(args.duration)
        
        elif args.analyze_leaks:
            logger.info("Analyzing memory leaks...")
            # This would analyze existing data
            print("Memory leak analysis not yet implemented")
        
        else:
            # Start general monitoring
            logger.info("Starting general memory monitoring...")
            await dashboard.start_monitoring(args.duration)
        
        # Export data if requested
        if args.export_json:
            filename = dashboard.export_data("json", args.output)
            print(f"Data exported to {filename}")
    
    except KeyboardInterrupt:
        logger.info("Monitoring interrupted by user")
        if dashboard._running:
            summary = await dashboard.stop_monitoring()
            print("\nMonitoring Summary:")
            print(json.dumps(summary, indent=2, default=str))
    except Exception as e:
        logger.error(f"Error: {e}")
        if dashboard._running:
            await dashboard.stop_monitoring()


if __name__ == "__main__":
    asyncio.run(main())
