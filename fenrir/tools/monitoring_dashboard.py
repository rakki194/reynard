#!/usr/bin/env python3
"""Monitoring Dashboard
====================

Strategic monitoring dashboard for backend analysis.
Combines RAM usage, service startup, and database call monitoring.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import sys
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
import json

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from backend_analyzer import BackendAnalyzer
from database_debugger import DatabaseDebugger
from service_tracker import ServiceTracker

logger = logging.getLogger(__name__)


class MonitoringDashboard:
    """Unified monitoring dashboard for backend analysis."""

    def __init__(self):
        """Initialize the monitoring dashboard."""
        self.backend_analyzer = BackendAnalyzer()
        self.database_debugger = DatabaseDebugger()
        self.service_tracker = ServiceTracker()
        self.start_time = time.time()
        self.monitoring_active = False
        self.metrics: Dict[str, Any] = {}
        self.alerts: List[Dict[str, Any]] = []

    async def start_monitoring(self, duration_seconds: int = 300):
        """Start comprehensive monitoring."""
        self.monitoring_active = True
        self.start_time = time.time()

        logger.info("🚀 Starting comprehensive backend monitoring...")
        logger.info("=" * 60)

        # Start monitoring tasks
        tasks = [
            self._monitor_memory(),
            self._monitor_services(),
            self._monitor_databases(),
        ]

        try:
            # Run monitoring for specified duration
            await asyncio.wait_for(
                asyncio.gather(*tasks, return_exceptions=True),
                timeout=duration_seconds
            )
        except asyncio.TimeoutError:
            logger.info(f"Monitoring completed after {duration_seconds} seconds")
        finally:
            self.monitoring_active = False

    async def _monitor_memory(self):
        """Monitor memory usage."""
        while self.monitoring_active:
            try:
                snapshot = self.backend_analyzer.take_snapshot("monitoring", "system")
                await asyncio.sleep(5)  # Monitor every 5 seconds
            except Exception as e:
                logger.error(f"Memory monitoring error: {e}")
                await asyncio.sleep(5)

    async def _monitor_services(self):
        """Monitor service health."""
        while self.monitoring_active:
            try:
                # Check service health
                for service_name in self.service_tracker.services:
                    # Simulate health check
                    if self.service_tracker.services[service_name]["status"] == "ready":
                        # Service is healthy
                        pass
                    else:
                        # Service might have issues
                        logger.warning(f"Service {service_name} status: {self.service_tracker.services[service_name]['status']}")

                await asyncio.sleep(10)  # Check every 10 seconds
            except Exception as e:
                logger.error(f"Service monitoring error: {e}")
                await asyncio.sleep(10)

    async def _monitor_databases(self):
        """Monitor database health."""
        while self.monitoring_active:
            try:
                # Simulate database health checks
                databases = ["reynard", "reynard_rag", "reynard_ecs", "reynard_auth", "reynard_mcp"]

                for db in databases:
                    # Simulate connection check
                    self.database_debugger.track_connection(db, "health_check", "healthy")

                await asyncio.sleep(15)  # Check every 15 seconds
            except Exception as e:
                logger.error(f"Database monitoring error: {e}")
                await asyncio.sleep(15)

    def generate_comprehensive_report(self) -> Dict[str, Any]:
        """Generate comprehensive monitoring report."""
        return {
            "monitoring_summary": {
                "start_time": self.start_time,
                "duration_seconds": time.time() - self.start_time,
                "monitoring_active": self.monitoring_active,
            },
            "backend_analysis": self.backend_analyzer.generate_report(),
            "database_analysis": self.database_debugger.generate_report(),
            "service_analysis": self.service_tracker.generate_report(),
            "recommendations": self._generate_recommendations(),
        }

    def _generate_recommendations(self) -> List[str]:
        """Generate strategic recommendations."""
        recommendations = []

        # Memory recommendations
        memory_analysis = self.backend_analyzer.analyze_memory_growth()
        if memory_analysis.get("total_growth_mb", 0) > 200:
            recommendations.append("High memory growth detected - implement lazy loading")

        # Service recommendations
        service_analysis = self.service_tracker.get_startup_analysis()
        if service_analysis["total_services"] > 15:
            recommendations.append("Many services initialized - consider service consolidation")

        # Database recommendations
        db_analysis = self.database_debugger.get_error_summary()
        if db_analysis["total_errors"] > 0:
            recommendations.append("Database errors detected - check connection health")

        return recommendations

    def display_dashboard(self):
        """Display real-time monitoring dashboard."""
        report = self.generate_comprehensive_report()

        print("\n" + "=" * 80)
        print("🦊 REYNARD BACKEND MONITORING DASHBOARD")
        print("=" * 80)

        # Monitoring summary
        summary = report["monitoring_summary"]
        print(f"Monitoring Duration: {summary['duration_seconds']:.1f}s")
        print(f"Status: {'Active' if summary['monitoring_active'] else 'Inactive'}")

        # Backend analysis
        backend = report["backend_analysis"]
        memory = backend["memory_analysis"]
        if "error" not in memory:
            print(f"\n📊 Memory Usage:")
            print(f"  Current: {memory['final_memory_mb']:.1f}MB")
            print(f"  Peak: {memory['peak_memory_mb']:.1f}MB")
            print(f"  Growth: {memory['total_growth_mb']:.1f}MB")

        # Service analysis
        services = report["service_analysis"]
        service_summary = services["summary"]
        print(f"\n🔧 Services:")
        print(f"  Total: {service_summary['total_services']}")
        print(f"  Ready: {service_summary['ready_services']}")
        print(f"  Success Rate: {service_summary['success_rate']:.1%}")

        # Database analysis
        databases = report["database_analysis"]
        print(f"\n🗄️ Databases:")
        print(f"  Total Calls: {databases['total_calls']}")
        print(f"  Monitoring Duration: {databases['monitoring_duration']:.1f}s")

        # Recommendations
        recommendations = report["recommendations"]
        if recommendations:
            print(f"\n💡 Recommendations:")
            for i, rec in enumerate(recommendations, 1):
                print(f"  {i}. {rec}")

        print("=" * 80)


async def run_comprehensive_analysis():
    """Run comprehensive backend analysis."""
    dashboard = MonitoringDashboard()

    logger.info("🚀 Starting comprehensive backend analysis...")
    logger.info("=" * 60)

    # Run backend analyzer
    logger.info("\n📊 Running backend analyzer...")
    from backend_analyzer import analyze_backend_startup
    backend_report = await analyze_backend_startup()

    # Run service tracker
    logger.info("\n🔧 Running service tracker...")
    from service_tracker import analyze_service_startup
    service_report = await analyze_service_startup()

    # Run database debugger
    logger.info("\n🗄️ Running database debugger...")
    from database_debugger import analyze_database_usage
    database_report = await analyze_database_usage()

    # Generate comprehensive report
    comprehensive_report = {
        "timestamp": time.time(),
        "backend_analysis": backend_report,
        "service_analysis": service_report,
        "database_analysis": database_report,
        "summary": {
            "total_memory_growth_mb": backend_report["summary"]["total_memory_growth_mb"],
            "services_initialized": service_report["summary"]["total_services"],
            "database_calls": database_report["total_calls"],
            "analysis_duration": time.time() - dashboard.start_time,
        }
    }

    # Display dashboard
    dashboard.display_dashboard()

    return comprehensive_report


async def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(description="Monitoring Dashboard")
    parser.add_argument("--mode", choices=["analysis", "monitoring"], default="analysis",
                       help="Run mode: analysis or monitoring")
    parser.add_argument("--duration", type=int, default=300, help="Monitoring duration in seconds")
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
        if args.mode == "analysis":
            # Run comprehensive analysis
            report = await run_comprehensive_analysis()

            # Save analysis if requested
            if args.output:
                with open(args.output, 'w') as f:
                    json.dump(report, f, indent=2, default=str)
                logger.info(f"📁 Analysis saved to {args.output}")

        elif args.mode == "monitoring":
            # Run live monitoring
            dashboard = MonitoringDashboard()
            await dashboard.start_monitoring(args.duration)

            # Generate final report
            report = dashboard.generate_comprehensive_report()

            # Save monitoring data if requested
            if args.output:
                with open(args.output, 'w') as f:
                    json.dump(report, f, indent=2, default=str)
                logger.info(f"📁 Monitoring data saved to {args.output}")

        logger.info("\n🎉 Monitoring completed!")

    except KeyboardInterrupt:
        logger.info("Monitoring interrupted by user")
    except Exception as e:
        logger.error(f"Monitoring error: {e}")
        import traceback
        traceback.print_exc()


def create_monitoring_dashboard() -> MonitoringDashboard:
    """Create and return a monitoring dashboard instance.

    Returns:
        MonitoringDashboard: Configured dashboard instance
    """
    return MonitoringDashboard()


if __name__ == "__main__":
    asyncio.run(main())
