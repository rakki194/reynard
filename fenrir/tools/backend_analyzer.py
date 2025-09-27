#!/usr/bin/env python3
"""Backend Analyzer
================

Strategic analysis tool for RAM usage, service startup, and database calls.
Clean, organized, and focused on actual debugging needs.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import sys
import time
import psutil
import gc
from pathlib import Path
from typing import Dict, Any, List, Optional
import json

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

logger = logging.getLogger(__name__)


class BackendAnalyzer:
    """Strategic backend analysis tool."""

    def __init__(self):
        """Initialize the analyzer."""
        self.snapshots: List[Dict[str, Any]] = []
        self.service_timings: Dict[str, float] = {}
        self.database_calls: List[Dict[str, Any]] = []
        self.start_time = None

    def take_snapshot(self, phase: str, service: str = None) -> Dict[str, Any]:
        """Take a memory and system snapshot."""
        process = psutil.Process()
        memory_info = process.memory_info()

        snapshot = {
            "phase": phase,
            "service": service,
            "timestamp": time.time(),
            "memory_mb": memory_info.rss / 1024 / 1024,
            "memory_percent": process.memory_percent(),
            "cpu_percent": process.cpu_percent(),
            "num_threads": process.num_threads(),
            "gc_counts": gc.get_count(),
        }

        self.snapshots.append(snapshot)
        return snapshot

    def log_snapshot(self, snapshot: Dict[str, Any]):
        """Log a snapshot."""
        service_info = f" [{snapshot['service']}]" if snapshot.get('service') else ""
        logger.info(f"📊 {snapshot['phase']}{service_info}: {snapshot['memory_mb']:.1f}MB "
                   f"({snapshot['memory_percent']:.1f}%) - {snapshot['num_threads']} threads")

    def track_service_startup(self, service_name: str, start_time: float):
        """Track service startup timing."""
        self.service_timings[service_name] = start_time

    def track_database_call(self, operation: str, database: str, duration_ms: float,
                          query: str = None, error: str = None):
        """Track database call."""
        call = {
            "timestamp": time.time(),
            "operation": operation,
            "database": database,
            "duration_ms": duration_ms,
            "query": query,
            "error": error,
        }
        self.database_calls.append(call)

    def analyze_memory_growth(self) -> Dict[str, Any]:
        """Analyze memory growth patterns."""
        if len(self.snapshots) < 2:
            return {"error": "Not enough snapshots"}

        initial = self.snapshots[0]
        final = self.snapshots[-1]

        growth = final["memory_mb"] - initial["memory_mb"]
        duration = final["timestamp"] - initial["timestamp"]
        growth_rate = growth / duration if duration > 0 else 0

        # Find peak memory usage
        peak_snapshot = max(self.snapshots, key=lambda s: s["memory_mb"])

        # Calculate growth by service
        service_growth = {}
        for i in range(1, len(self.snapshots)):
            prev = self.snapshots[i-1]
            curr = self.snapshots[i]
            service = curr.get("service", "unknown")
            growth = curr["memory_mb"] - prev["memory_mb"]
            if service not in service_growth:
                service_growth[service] = 0
            service_growth[service] += growth

        return {
            "initial_memory_mb": initial["memory_mb"],
            "final_memory_mb": final["memory_mb"],
            "peak_memory_mb": peak_snapshot["memory_mb"],
            "peak_service": peak_snapshot.get("service", "unknown"),
            "total_growth_mb": growth,
            "growth_rate_mb_per_second": growth_rate,
            "duration_seconds": duration,
            "service_growth": service_growth,
            "total_snapshots": len(self.snapshots)
        }

    def analyze_service_timings(self) -> Dict[str, Any]:
        """Analyze service startup timings."""
        if not self.service_timings:
            return {"error": "No service timings recorded"}

        sorted_services = sorted(self.service_timings.items(), key=lambda x: x[1])

        return {
            "startup_order": [name for name, _ in sorted_services],
            "service_timings": dict(sorted_services),
            "total_services": len(self.service_timings)
        }

    def analyze_database_calls(self) -> Dict[str, Any]:
        """Analyze database call patterns."""
        if not self.database_calls:
            return {"error": "No database calls recorded"}

        # Group by database
        db_calls = {}
        for call in self.database_calls:
            db = call["database"]
            if db not in db_calls:
                db_calls[db] = []
            db_calls[db].append(call)

        # Calculate statistics
        db_stats = {}
        for db, calls in db_calls.items():
            durations = [call["duration_ms"] for call in calls]
            errors = [call for call in calls if call.get("error")]

            db_stats[db] = {
                "total_calls": len(calls),
                "error_count": len(errors),
                "success_rate": (len(calls) - len(errors)) / len(calls) if calls else 0,
                "avg_duration_ms": sum(durations) / len(durations) if durations else 0,
                "max_duration_ms": max(durations) if durations else 0,
                "min_duration_ms": min(durations) if durations else 0,
            }

        return {
            "database_stats": db_stats,
            "total_calls": len(self.database_calls),
            "total_errors": len([call for call in self.database_calls if call.get("error")]),
            "overall_success_rate": (len(self.database_calls) - len([call for call in self.database_calls if call.get("error")])) / len(self.database_calls) if self.database_calls else 0
        }

    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive analysis report."""
        return {
            "memory_analysis": self.analyze_memory_growth(),
            "service_analysis": self.analyze_service_timings(),
            "database_analysis": self.analyze_database_calls(),
            "summary": self._generate_summary()
        }

    def _generate_summary(self) -> Dict[str, Any]:
        """Generate summary of findings."""
        memory_analysis = self.analyze_memory_growth()
        service_analysis = self.analyze_service_timings()
        database_analysis = self.analyze_database_calls()

        summary = {
            "total_memory_growth_mb": memory_analysis.get("total_growth_mb", 0),
            "peak_memory_mb": memory_analysis.get("peak_memory_mb", 0),
            "services_initialized": service_analysis.get("total_services", 0),
            "database_calls": database_analysis.get("total_calls", 0),
            "database_errors": database_analysis.get("total_errors", 0),
        }

        # Add recommendations
        recommendations = []

        if memory_analysis.get("total_growth_mb", 0) > 100:
            recommendations.append("High memory growth detected - consider lazy loading")

        if database_analysis.get("total_errors", 0) > 0:
            recommendations.append("Database errors detected - check connection health")

        if service_analysis.get("total_services", 0) > 10:
            recommendations.append("Many services initialized - consider service consolidation")

        summary["recommendations"] = recommendations

        return summary

    async def analyze_import_costs(self) -> Dict[str, Any]:
        """Analyze the cost of importing backend modules."""
        import_analysis = {
            "modules": {},
            "total_import_time": 0.0,
            "memory_impact": {},
            "recommendations": []
        }

        # Test import costs for key modules
        modules_to_test = [
            ("app.core.config", "Core Configuration"),
            ("app.core.service_manager", "Service Manager"),
            ("app.core.database", "Database Core"),
            ("app.services.ai.ai_service", "AI Service"),
            ("app.services.rag.rag_service", "RAG Service"),
            ("app.core.health_checks", "Health Checks"),
        ]

        for module_name, description in modules_to_test:
            try:
                start_time = time.time()
                start_memory = psutil.Process().memory_info().rss / 1024 / 1024

                # Import the module
                __import__(module_name)

                end_time = time.time()
                end_memory = psutil.Process().memory_info().rss / 1024 / 1024

                import_time = (end_time - start_time) * 1000  # Convert to ms
                memory_delta = end_memory - start_memory

                import_analysis["modules"][module_name] = {
                    "description": description,
                    "import_time_ms": import_time,
                    "memory_delta_mb": memory_delta,
                    "status": "success"
                }

                import_analysis["total_import_time"] += import_time
                import_analysis["memory_impact"][module_name] = memory_delta

                # Add recommendations for slow imports
                if import_time > 100:  # > 100ms
                    import_analysis["recommendations"].append(
                        f"Slow import: {module_name} ({import_time:.1f}ms) - consider lazy loading"
                    )

                if memory_delta > 10:  # > 10MB
                    import_analysis["recommendations"].append(
                        f"High memory import: {module_name} ({memory_delta:.1f}MB) - consider optimization"
                    )

            except Exception as e:
                import_analysis["modules"][module_name] = {
                    "description": description,
                    "import_time_ms": 0,
                    "memory_delta_mb": 0,
                    "status": "error",
                    "error": str(e)
                }

        return import_analysis

    async def analyze_memory_hotspots(self) -> Dict[str, Any]:
        """Analyze memory hotspots in the backend."""
        hotspot_analysis = {
            "high_memory_modules": [],
            "memory_by_category": {},
            "gc_analysis": {},
            "recommendations": []
        }

        try:
            # Get current memory usage
            process = psutil.Process()
            memory_info = process.memory_info()
            current_memory = memory_info.rss / 1024 / 1024

            # Analyze garbage collection
            gc_stats = gc.get_stats()
            gc_objects = len(gc.get_objects())

            hotspot_analysis["gc_analysis"] = {
                "total_objects": gc_objects,
                "gc_stats": gc_stats,
                "memory_mb": current_memory
            }

            # Check for high memory modules by testing imports
            high_memory_modules = []
            modules_to_check = [
                ("numpy", "NumPy"),
                ("pandas", "Pandas"),
                ("torch", "PyTorch"),
                ("tensorflow", "TensorFlow"),
                ("sklearn", "Scikit-learn"),
                ("chromadb", "ChromaDB"),
                ("sentence_transformers", "Sentence Transformers"),
            ]

            for module_name, display_name in modules_to_check:
                try:
                    start_memory = psutil.Process().memory_info().rss / 1024 / 1024
                    __import__(module_name)
                    end_memory = psutil.Process().memory_info().rss / 1024 / 1024
                    memory_delta = end_memory - start_memory

                    if memory_delta > 5:  # > 5MB
                        high_memory_modules.append({
                            "module": module_name,
                            "display_name": display_name,
                            "memory_mb": memory_delta
                        })

                except ImportError:
                    # Module not available, skip
                    pass
                except Exception as e:
                    # Other error, log but continue
                    logger.warning(f"Error checking {module_name}: {e}")

            hotspot_analysis["high_memory_modules"] = high_memory_modules

            # Categorize memory usage
            hotspot_analysis["memory_by_category"] = {
                "total_memory_mb": current_memory,
                "high_memory_modules_count": len(high_memory_modules),
                "gc_objects": gc_objects
            }

            # Generate recommendations
            if len(high_memory_modules) > 3:
                hotspot_analysis["recommendations"].append(
                    "Multiple high-memory modules detected - consider lazy loading strategy"
                )

            if gc_objects > 100000:
                hotspot_analysis["recommendations"].append(
                    f"High object count ({gc_objects:,}) - consider garbage collection optimization"
                )

            if current_memory > 200:
                hotspot_analysis["recommendations"].append(
                    f"High memory usage ({current_memory:.1f}MB) - investigate memory leaks"
                )

        except Exception as e:
            hotspot_analysis["error"] = str(e)
            logger.error(f"Error in memory hotspot analysis: {e}")

        return hotspot_analysis

    async def analyze_backend_services(self) -> Dict[str, Any]:
        """Analyze backend service memory usage and performance."""
        analysis = {
            "services": {},
            "memory_hogs": [],
            "recommendations": []
        }

        # Test service initialization costs
        services_to_test = [
            ("app.core.service_manager", "ServiceManager", "get_service_manager"),
            ("app.services.ai.ai_service", "AIService", None),
            ("app.services.rag.rag_service", "RAGService", None),
        ]

        for module_path, service_name, factory_func in services_to_test:
            try:
                start_time = time.time()
                start_memory = psutil.Process().memory_info().rss / 1024 / 1024

                # Import and potentially instantiate
                module = __import__(module_path, fromlist=[service_name])
                service_class = getattr(module, service_name, None)

                if service_class and factory_func:
                    factory = getattr(module, factory_func, None)
                    if factory:
                        service_instance = factory()
                    else:
                        service_instance = service_class()
                else:
                    service_instance = None

                end_time = time.time()
                end_memory = psutil.Process().memory_info().rss / 1024 / 1024

                service_analysis = {
                    "import_time_ms": (end_time - start_time) * 1000,
                    "memory_delta_mb": end_memory - start_memory,
                    "status": "success",
                    "instantiated": service_instance is not None
                }

                analysis["services"][service_name] = service_analysis

                # Check for memory hogs
                if service_analysis["memory_delta_mb"] > 50:  # 50MB threshold
                    analysis["memory_hogs"].append({
                        "service": service_name,
                        "memory_mb": service_analysis["memory_delta_mb"],
                        "recommendation": "Consider lazy loading or optimization"
                    })

            except Exception as e:
                analysis["services"][service_name] = {
                    "import_time_ms": 0,
                    "memory_delta_mb": 0,
                    "status": "error",
                    "error": str(e)
                }

        # Generate recommendations
        if len(analysis["memory_hogs"]) > 0:
            analysis["recommendations"].append(
                f"Found {len(analysis['memory_hogs'])} memory-intensive services"
            )

        return analysis


async def analyze_backend_startup():
    """Analyze backend startup process."""
    analyzer = BackendAnalyzer()

    logger.info("🚀 Starting backend startup analysis...")
    logger.info("=" * 60)

    # Initial snapshot
    snapshot = analyzer.take_snapshot("initial")
    analyzer.log_snapshot(snapshot)

    # Phase 1: Core imports
    logger.info("\n📦 Phase 1: Core Imports")
    try:
        from app.core.config import get_config
        snapshot = analyzer.take_snapshot("core_config_imported")
        analyzer.log_snapshot(snapshot)

        config = get_config()
        snapshot = analyzer.take_snapshot("config_loaded", "config")
        analyzer.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in core imports: {e}")

    # Phase 2: Service manager
    logger.info("\n🔧 Phase 2: Service Manager")
    try:
        from app.core.service_manager import get_service_manager
        snapshot = analyzer.take_snapshot("service_manager_imported")
        analyzer.log_snapshot(snapshot)

        service_manager = get_service_manager()
        snapshot = analyzer.take_snapshot("service_manager_created", "service_manager")
        analyzer.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in service manager: {e}")

    # Phase 3: Database services
    logger.info("\n🗄️ Phase 3: Database Services")
    try:
        from app.core.database_auto_fix import auto_fix_all_databases
        snapshot = analyzer.take_snapshot("database_auto_fix_imported")
        analyzer.log_snapshot(snapshot)

        # Simulate database auto-fix
        analyzer.track_database_call("auto_fix", "all_databases", 100.0)
        snapshot = analyzer.take_snapshot("database_auto_fix_completed", "database")
        analyzer.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in database services: {e}")

    # Phase 4: AI services
    logger.info("\n🤖 Phase 4: AI Services")
    try:
        from app.services.ai.ai_service import AIService
        snapshot = analyzer.take_snapshot("ai_service_imported")
        analyzer.log_snapshot(snapshot)

        # Track AI service startup
        start_time = time.time()
        analyzer.track_service_startup("ai_service", start_time)
        snapshot = analyzer.take_snapshot("ai_service_initialized", "ai_service")
        analyzer.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in AI services: {e}")

    # Phase 5: RAG services
    logger.info("\n🧠 Phase 5: RAG Services")
    try:
        from app.services.rag.rag_service import RAGService
        snapshot = analyzer.take_snapshot("rag_service_imported")
        analyzer.log_snapshot(snapshot)

        # Track RAG service startup
        start_time = time.time()
        analyzer.track_service_startup("rag_service", start_time)
        snapshot = analyzer.take_snapshot("rag_service_initialized", "rag_service")
        analyzer.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in RAG services: {e}")

    # Phase 6: Other services
    logger.info("\n🔧 Phase 6: Other Services")
    services_to_test = [
        ("gatekeeper", "app.core.health_checks", "health_check_gatekeeper"),
        ("comfy", "app.core.health_checks", "health_check_comfy"),
        ("tts", "app.core.health_checks", "health_check_tts_service"),
        ("nlweb", "app.core.health_checks", "health_check_nlweb"),
    ]

    for service_name, module_path, health_check_func in services_to_test:
        try:
            start_time = time.time()
            analyzer.track_service_startup(service_name, start_time)
            snapshot = analyzer.take_snapshot(f"{service_name}_initialized", service_name)
            analyzer.log_snapshot(snapshot)
        except Exception as e:
            logger.error(f"Error in {service_name}: {e}")

    # Final snapshot
    snapshot = analyzer.take_snapshot("final")
    analyzer.log_snapshot(snapshot)

    # Generate and display analysis
    logger.info("\n📊 Analysis Results")
    logger.info("=" * 60)

    report = analyzer.generate_report()

    # Memory analysis
    memory_analysis = report["memory_analysis"]
    if "error" not in memory_analysis:
        logger.info(f"Memory Growth Analysis:")
        logger.info(f"  Initial: {memory_analysis['initial_memory_mb']:.1f}MB")
        logger.info(f"  Final: {memory_analysis['final_memory_mb']:.1f}MB")
        logger.info(f"  Peak: {memory_analysis['peak_memory_mb']:.1f}MB (in {memory_analysis['peak_service']})")
        logger.info(f"  Total Growth: {memory_analysis['total_growth_mb']:.1f}MB")
        logger.info(f"  Growth Rate: {memory_analysis['growth_rate_mb_per_second']:.1f}MB/s")

        logger.info(f"\nService Memory Growth:")
        for service, growth in memory_analysis['service_growth'].items():
            if growth > 0:
                logger.info(f"  {service}: +{growth:.1f}MB")

    # Service analysis
    service_analysis = report["service_analysis"]
    if "error" not in service_analysis:
        logger.info(f"\nService Startup Analysis:")
        logger.info(f"  Services initialized: {service_analysis['total_services']}")
        logger.info(f"  Startup order: {', '.join(service_analysis['startup_order'])}")

    # Database analysis
    database_analysis = report["database_analysis"]
    if "error" not in database_analysis:
        logger.info(f"\nDatabase Analysis:")
        logger.info(f"  Total calls: {database_analysis['total_calls']}")
        logger.info(f"  Total errors: {database_analysis['total_errors']}")
        logger.info(f"  Success rate: {database_analysis['overall_success_rate']:.1%}")

        for db, stats in database_analysis['database_stats'].items():
            logger.info(f"  {db}: {stats['total_calls']} calls, {stats['success_rate']:.1%} success")

    # Summary
    summary = report["summary"]
    logger.info(f"\nSummary:")
    logger.info(f"  Total memory growth: {summary['total_memory_growth_mb']:.1f}MB")
    logger.info(f"  Peak memory: {summary['peak_memory_mb']:.1f}MB")
    logger.info(f"  Services: {summary['services_initialized']}")
    logger.info(f"  Database calls: {summary['database_calls']}")
    logger.info(f"  Database errors: {summary['database_errors']}")

    if summary["recommendations"]:
        logger.info(f"\nRecommendations:")
        for i, rec in enumerate(summary["recommendations"], 1):
            logger.info(f"  {i}. {rec}")

    return report


async def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(description="Backend Analyzer")
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
        # Run analysis
        report = await analyze_backend_startup()

        # Save analysis if requested
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            logger.info(f"📁 Analysis saved to {args.output}")

        logger.info("\n🎉 Backend analysis completed!")

    except KeyboardInterrupt:
        logger.info("Analysis interrupted by user")
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
