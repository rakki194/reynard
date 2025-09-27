#!/usr/bin/env python3
"""🦊 Backend Startup Memory Profiler
===================================

Specialized script to profile memory usage during backend startup.
This script will monitor memory consumption as the backend initializes
and identify what components are consuming the most RAM.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import sys
import time
from pathlib import Path
from typing import Dict, Any, List
import psutil
import gc

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.memory_profiling import memory_profile, memory_trace, get_memory_stats, clear_memory_profiles, get_memory_profiles
from memory_debug_tracer import MemoryDebugTracer

logger = logging.getLogger(__name__)


class BackendStartupProfiler:
    """Profiler for backend startup memory usage."""
    
    def __init__(self):
        """Initialize the startup profiler."""
        self.startup_snapshots: List[Dict[str, Any]] = []
        self.component_memory: Dict[str, List[float]] = {}
        self.start_time = None
        self.tracer = None
    
    async def start_profiling(self):
        """Start profiling the backend startup."""
        logger.info("🚀 Starting backend startup memory profiling...")
        
        # Clear existing profiles
        clear_memory_profiles()
        
        # Create memory tracer
        config = {
            "sample_interval": 0.2,  # High frequency sampling
            "max_snapshots": 1000,
            "leak_threshold_mb": 10,
            "critical_threshold_mb": 100,
            "enable_tracemalloc": True,
            "enable_call_tracing": True,
        }
        
        self.tracer = MemoryDebugTracer(config)
        self.start_time = time.time()
        
        # Start monitoring
        await self.tracer.start_monitoring()
        
        logger.info("✅ Memory profiling started")
    
    async def stop_profiling(self) -> Dict[str, Any]:
        """Stop profiling and return analysis."""
        if not self.tracer:
            return {"error": "Profiling not started"}
        
        # Stop monitoring
        report = await self.tracer.stop_monitoring()
        
        # Get memory profiles
        profiles = get_memory_profiles()
        
        # Analyze startup phases
        analysis = self._analyze_startup_phases(report, profiles)
        
        return analysis
    
    def _analyze_startup_phases(self, tracer_report: Dict[str, Any], profiles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze memory usage during different startup phases."""
        analysis = {
            "startup_duration": time.time() - self.start_time if self.start_time else 0,
            "tracer_report": tracer_report,
            "memory_profiles": profiles,
            "startup_phases": {},
            "memory_growth_analysis": {},
            "component_analysis": {},
            "recommendations": []
        }
        
        # Analyze memory growth
        if tracer_report.get("memory_stats"):
            memory_stats = tracer_report["memory_stats"]
            analysis["memory_growth_analysis"] = {
                "initial_memory_mb": memory_stats.get("min_memory_mb", 0),
                "peak_memory_mb": memory_stats.get("peak_memory_mb", 0),
                "final_memory_mb": memory_stats.get("final_memory_mb", 0),
                "total_growth_mb": memory_stats.get("memory_growth_mb", 0),
                "growth_rate_mb_per_second": memory_stats.get("memory_growth_mb", 0) / analysis["startup_duration"] if analysis["startup_duration"] > 0 else 0
            }
        
        # Analyze components
        component_stats = {}
        for profile in profiles:
            component = profile.get("component", "unknown")
            if component not in component_stats:
                component_stats[component] = {
                    "operations": 0,
                    "total_memory_mb": 0,
                    "total_time_ms": 0,
                    "max_memory_mb": 0,
                    "errors": 0
                }
            
            stats = component_stats[component]
            stats["operations"] += 1
            stats["total_memory_mb"] += profile.get("memory_used_mb", 0)
            stats["total_time_ms"] += profile.get("execution_time_ms", 0)
            stats["max_memory_mb"] = max(stats["max_memory_mb"], profile.get("memory_used_mb", 0))
            if "error" in profile:
                stats["errors"] += 1
        
        analysis["component_analysis"] = component_stats
        
        # Generate recommendations
        analysis["recommendations"] = self._generate_startup_recommendations(analysis)
        
        return analysis
    
    def _generate_startup_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on startup analysis."""
        recommendations = []
        
        # Check memory growth
        growth_analysis = analysis.get("memory_growth_analysis", {})
        total_growth = growth_analysis.get("total_growth_mb", 0)
        growth_rate = growth_analysis.get("growth_rate_mb_per_second", 0)
        
        if total_growth > 200:
            recommendations.append("High memory growth during startup - consider lazy loading")
        
        if growth_rate > 10:
            recommendations.append("High memory growth rate - review initialization order")
        
        # Check components
        component_analysis = analysis.get("component_analysis", {})
        for component, stats in component_analysis.items():
            if stats["max_memory_mb"] > 50:
                recommendations.append(f"{component} uses {stats['max_memory_mb']:.1f}MB - consider optimization")
            
            if stats["errors"] > 0:
                recommendations.append(f"{component} has {stats['errors']} errors during startup")
        
        # General recommendations
        recommendations.extend([
            "Consider implementing lazy loading for heavy components",
            "Review model loading strategy - load models on demand",
            "Implement memory cleanup after initialization",
            "Consider splitting startup into phases with memory cleanup between phases"
        ])
        
        return recommendations


@memory_profile(component="backend_startup", operation="import_modules", log_threshold_mb=5.0)
async def profile_import_phase():
    """Profile the module import phase."""
    logger.info("📦 Profiling module import phase...")
    
    # Import key modules and track memory
    with memory_trace("backend_startup", "import_core_modules"):
        from app.core.config import AppConfig, get_config
        # from app.core.service_manager import ServiceManager  # Skip if not available
    
    with memory_trace("backend_startup", "import_rag_modules"):
        from app.services.rag.rag_service import RAGService
        from app.services.rag.indexing import IndexingService
    
    with memory_trace("backend_startup", "import_ai_modules"):
        from app.services.ai.ai_service import AIService
    
    logger.info("✅ Module import phase completed")


@memory_profile(component="backend_startup", operation="initialize_services", log_threshold_mb=10.0)
async def profile_service_initialization():
    """Profile service initialization phase."""
    logger.info("🔧 Profiling service initialization phase...")
    
    # Simulate service initialization
    with memory_trace("backend_startup", "initialize_config"):
        from app.core.config import get_config
        config = get_config()
    
    with memory_trace("backend_startup", "initialize_ai_service"):
        from app.services.ai.ai_service import AIService
        ai_service = AIService(config.dict())
        # Don't actually initialize to avoid heavy operations
    
    with memory_trace("backend_startup", "initialize_rag_service"):
        from app.services.rag.rag_service import RAGService
        rag_config = {
            "rag_enabled": True,
            "embedding_model": "embeddinggemma:latest",
            "vector_store": "chroma",
        }
        rag_service = RAGService(rag_config)
        # Don't actually initialize to avoid heavy operations
    
    logger.info("✅ Service initialization phase completed")


@memory_profile(component="backend_startup", operation="initialize_database", log_threshold_mb=5.0)
async def profile_database_initialization():
    """Profile database initialization phase."""
    logger.info("🗄️ Profiling database initialization phase...")
    
    with memory_trace("backend_startup", "database_connection"):
        # Simulate database connection setup
        import asyncio
        await asyncio.sleep(0.1)  # Simulate connection time
    
    with memory_trace("backend_startup", "database_migrations"):
        # Simulate migration checks
        await asyncio.sleep(0.1)
    
    logger.info("✅ Database initialization phase completed")


async def profile_backend_startup():
    """Profile the complete backend startup process."""
    profiler = BackendStartupProfiler()
    
    try:
        # Start profiling
        await profiler.start_profiling()
        
        logger.info("🚀 Starting backend startup profiling...")
        logger.info("=" * 60)
        
        # Phase 1: Module imports
        logger.info("Phase 1: Module Imports")
        await profile_import_phase()
        await asyncio.sleep(0.5)
        
        # Phase 2: Service initialization
        logger.info("\nPhase 2: Service Initialization")
        await profile_service_initialization()
        await asyncio.sleep(0.5)
        
        # Phase 3: Database initialization
        logger.info("\nPhase 3: Database Initialization")
        await profile_database_initialization()
        await asyncio.sleep(0.5)
        
        # Phase 4: Final setup
        logger.info("\nPhase 4: Final Setup")
        with memory_trace("backend_startup", "final_setup"):
            # Simulate final setup operations
            await asyncio.sleep(0.2)
        
        # Stop profiling and get analysis
        logger.info("\n📊 Analyzing startup memory usage...")
        analysis = await profiler.stop_profiling()
        
        # Display results
        display_startup_analysis(analysis)
        
        return analysis
        
    except Exception as e:
        logger.error(f"❌ Error during startup profiling: {e}")
        if profiler.tracer:
            await profiler.stop_profiling()
        raise


def display_startup_analysis(analysis: Dict[str, Any]):
    """Display the startup analysis results."""
    logger.info("\n" + "=" * 60)
    logger.info("🦊 BACKEND STARTUP MEMORY ANALYSIS")
    logger.info("=" * 60)
    
    # Startup duration
    duration = analysis.get("startup_duration", 0)
    logger.info(f"Startup Duration: {duration:.2f} seconds")
    
    # Memory growth analysis
    growth_analysis = analysis.get("memory_growth_analysis", {})
    if growth_analysis:
        logger.info(f"\n📈 Memory Growth Analysis:")
        logger.info(f"  Initial Memory: {growth_analysis.get('initial_memory_mb', 0):.1f}MB")
        logger.info(f"  Peak Memory: {growth_analysis.get('peak_memory_mb', 0):.1f}MB")
        logger.info(f"  Final Memory: {growth_analysis.get('final_memory_mb', 0):.1f}MB")
        logger.info(f"  Total Growth: {growth_analysis.get('total_growth_mb', 0):.1f}MB")
        logger.info(f"  Growth Rate: {growth_analysis.get('growth_rate_mb_per_second', 0):.1f}MB/s")
    
    # Component analysis
    component_analysis = analysis.get("component_analysis", {})
    if component_analysis:
        logger.info(f"\n🔧 Component Analysis:")
        for component, stats in component_analysis.items():
            logger.info(f"  {component}:")
            logger.info(f"    Operations: {stats['operations']}")
            logger.info(f"    Total Memory: {stats['total_memory_mb']:.1f}MB")
            logger.info(f"    Max Memory: {stats['max_memory_mb']:.1f}MB")
            logger.info(f"    Total Time: {stats['total_time_ms']:.1f}ms")
            logger.info(f"    Errors: {stats['errors']}")
    
    # Tracer report summary
    tracer_report = analysis.get("tracer_report", {})
    if tracer_report:
        logger.info(f"\n📊 Tracer Report Summary:")
        logger.info(f"  Total Snapshots: {tracer_report.get('total_snapshots', 0)}")
        logger.info(f"  Leaks Detected: {tracer_report.get('leaks_detected', 0)}")
        logger.info(f"  Critical Alerts: {tracer_report.get('critical_alerts', 0)}")
        logger.info(f"  Components Monitored: {tracer_report.get('components_monitored', [])}")
    
    # Recommendations
    recommendations = analysis.get("recommendations", [])
    if recommendations:
        logger.info(f"\n💡 Recommendations:")
        for i, rec in enumerate(recommendations, 1):
            logger.info(f"  {i}. {rec}")
    
    logger.info("\n" + "=" * 60)


async def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Profile Backend Startup Memory Usage")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    parser.add_argument("--output", type=str, help="Output file for analysis")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        # Run startup profiling
        analysis = await profile_backend_startup()
        
        # Save analysis if requested
        if args.output:
            import json
            with open(args.output, 'w') as f:
                json.dump(analysis, f, indent=2, default=str)
            logger.info(f"📁 Analysis saved to {args.output}")
        
        logger.info("\n🎉 Backend startup profiling completed!")
        
    except KeyboardInterrupt:
        logger.info("Profiling interrupted by user")
    except Exception as e:
        logger.error(f"Profiling error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
