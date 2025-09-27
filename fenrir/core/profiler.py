"""🦊 Reynard Backend Memory Profiler for Fenrir
===============================================

Strategic memory profiling integration for the Fenrir exploit testing suite.
This module provides comprehensive memory analysis, startup profiling, database
monitoring, and performance optimization recommendations.

Features:
- Backend startup memory profiling
- Database connection pool monitoring
- Service initialization tracking
- Memory leak detection
- Performance bottleneck analysis
- Strategic optimization recommendations

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import gc
import json
import logging
import os
import psutil
import sys
import time
import tracemalloc
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, TaskID
from rich.table import Table

# Add backend path for imports
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

try:
    from ..tools.backend_analyzer import BackendAnalyzer
    from ..tools.database_debugger import DatabaseDebugger
    from ..tools.service_tracker import ServiceTracker
    from ..tools.monitoring_dashboard import create_monitoring_dashboard
    from ..tools.service_profiler import ServiceProfiler
    BACKEND_TOOLS_AVAILABLE = True
except ImportError as e:
    # Fallback to backend directory if tools haven't been moved yet
    try:
        from backend.backend_analyzer import BackendAnalyzer
        from backend.database_debugger import DatabaseDebugger
        from backend.service_tracker import ServiceTracker
        from backend.monitoring_dashboard import create_monitoring_dashboard
        from backend.service_profiler import ServiceProfiler
        BACKEND_TOOLS_AVAILABLE = True
    except ImportError:
        logging.warning(f"Backend tools not available: {e}")
        BACKEND_TOOLS_AVAILABLE = False

# Import database service
from .database_service import get_database_service

console = Console()
logger = logging.getLogger(__name__)


@dataclass
class MemorySnapshot:
    """Memory usage snapshot at a specific point in time."""

    timestamp: datetime
    rss_mb: float
    vms_mb: float
    percent: float
    available_mb: float
    tracemalloc_mb: float = 0.0
    gc_objects: int = 0
    context: str = ""


@dataclass
class ProfilingResult:
    """Profiling analysis result with recommendations."""

    category: str
    severity: str  # "low", "medium", "high", "critical"
    issue: str
    recommendation: str
    memory_impact_mb: float = 0.0
    performance_impact: str = "unknown"


@dataclass
class ProfilingSession:
    """Complete profiling session data."""

    session_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    snapshots: List[MemorySnapshot] = field(default_factory=list)
    results: List[ProfilingResult] = field(default_factory=list)
    backend_analysis: Optional[Dict[str, Any]] = None
    database_analysis: Optional[Dict[str, Any]] = None
    service_analysis: Optional[Dict[str, Any]] = None


class MemoryProfiler:
    """Strategic memory profiler for Reynard backend analysis."""

    def __init__(self, session_id: Optional[str] = None):
        """Initialize the memory profiler.

        Args:
            session_id: Optional session identifier for tracking
        """
        self.session_id = session_id or f"profile_{int(time.time())}"
        self.session = ProfilingSession(
            session_id=self.session_id,
            start_time=datetime.now(timezone.utc)
        )
        self.process = psutil.Process()
        self.tracemalloc_enabled = False

        # Database service for persistence
        self.db_service = get_database_service()
        self.db_session_id = None

        # Backend analyzers
        self.backend_analyzer = None
        self.database_debugger = None
        self.service_tracker = None

        if BACKEND_TOOLS_AVAILABLE:
            try:
                self.backend_analyzer = BackendAnalyzer()
                self.database_debugger = DatabaseDebugger()
                self.service_tracker = ServiceTracker()
            except Exception as e:
                logger.warning(f"Failed to initialize backend tools: {e}")

    def start_tracemalloc(self):
        """Start memory tracing."""
        if not self.tracemalloc_enabled:
            tracemalloc.start()
            self.tracemalloc_enabled = True
            logger.info("Started tracemalloc monitoring")

    def stop_tracemalloc(self):
        """Stop memory tracing."""
        if self.tracemalloc_enabled:
            tracemalloc.stop()
            self.tracemalloc_enabled = False
            logger.info("Stopped tracemalloc monitoring")

    def take_memory_snapshot(self, context: str = "") -> MemorySnapshot:
        """Take a memory usage snapshot.

        Args:
            context: Description of when this snapshot was taken

        Returns:
            MemorySnapshot with current memory usage
        """
        memory_info = self.process.memory_info()
        memory_percent = self.process.memory_percent()
        virtual_memory = psutil.virtual_memory()

        # Get tracemalloc info if available
        tracemalloc_mb = 0.0
        if self.tracemalloc_enabled:
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc_mb = current / 1024 / 1024

        # Get garbage collection info
        gc_objects = len(gc.get_objects())

        snapshot = MemorySnapshot(
            timestamp=datetime.now(timezone.utc),
            rss_mb=memory_info.rss / 1024 / 1024,
            vms_mb=memory_info.vms / 1024 / 1024,
            percent=memory_percent,
            available_mb=virtual_memory.available / 1024 / 1024,
            tracemalloc_mb=tracemalloc_mb,
            gc_objects=gc_objects,
            context=context
        )

        self.session.snapshots.append(snapshot)

        # Save to database if we have a database session
        if self.db_session_id:
            try:
                self.db_service.save_memory_snapshot(
                    profiling_session_id=self.session_id,
                    context=context,
                    rss_mb=snapshot.rss_mb,
                    vms_mb=snapshot.vms_mb,
                    percent=snapshot.percent,
                    available_mb=snapshot.available_mb,
                    tracemalloc_mb=snapshot.tracemalloc_mb,
                    gc_objects=snapshot.gc_objects
                )
            except Exception as e:
                logger.warning(f"Failed to save memory snapshot to database: {e}")

        return snapshot

    async def profile_backend_startup(self) -> Dict[str, Any]:
        """Profile backend startup sequence.

        Returns:
            Dict with startup profiling results
        """
        if not self.backend_analyzer:
            return {"error": "Backend analyzer not available"}

        console.print("🚀 [bold blue]Profiling Backend Startup[/bold blue]")

        startup_results = {}

        with Progress() as progress:
            task = progress.add_task("[cyan]Analyzing startup sequence...", total=5)

            # Initial snapshot
            progress.update(task, advance=1)
            initial_snapshot = self.take_memory_snapshot("startup_begin")

            # Analyze import costs
            progress.update(task, advance=1)
            try:
                import_analysis = await self.backend_analyzer.analyze_import_costs()
                startup_results["import_analysis"] = import_analysis
            except Exception as e:
                startup_results["import_analysis"] = {"error": str(e)}

            # Analyze service initialization
            progress.update(task, advance=1)
            try:
                if self.service_tracker:
                    service_analysis = await self.service_tracker.track_service_startup()
                    startup_results["service_analysis"] = service_analysis
            except Exception as e:
                startup_results["service_analysis"] = {"error": str(e)}

            # Memory hotspots
            progress.update(task, advance=1)
            try:
                memory_analysis = await self.backend_analyzer.analyze_memory_hotspots()
                startup_results["memory_hotspots"] = memory_analysis
            except Exception as e:
                startup_results["memory_hotspots"] = {"error": str(e)}

            # Final snapshot
            progress.update(task, advance=1)
            final_snapshot = self.take_memory_snapshot("startup_complete")

            startup_results["memory_delta"] = {
                "initial_mb": initial_snapshot.rss_mb,
                "final_mb": final_snapshot.rss_mb,
                "delta_mb": final_snapshot.rss_mb - initial_snapshot.rss_mb,
                "gc_objects_delta": final_snapshot.gc_objects - initial_snapshot.gc_objects
            }

        return startup_results

    async def profile_database_connections(self) -> Dict[str, Any]:
        """Profile database connection usage and pooling.

        Returns:
            Dict with database profiling results
        """
        if not self.database_debugger:
            return {"error": "Database debugger not available"}

        console.print("🗄️ [bold blue]Profiling Database Connections[/bold blue]")

        db_results = {}

        with Progress() as progress:
            task = progress.add_task("[cyan]Analyzing database usage...", total=4)

            # Pool status analysis
            progress.update(task, advance=1)
            try:
                pool_analysis = await self.database_debugger.analyze_connection_pools()
                db_results["pool_analysis"] = pool_analysis
            except Exception as e:
                db_results["pool_analysis"] = {"error": str(e)}

            # Query performance
            progress.update(task, advance=1)
            try:
                query_analysis = await self.database_debugger.analyze_query_performance()
                db_results["query_analysis"] = query_analysis
            except Exception as e:
                db_results["query_analysis"] = {"error": str(e)}

            # Connection health
            progress.update(task, advance=1)
            try:
                health_analysis = await self.database_debugger.check_connection_health()
                db_results["health_analysis"] = health_analysis
            except Exception as e:
                db_results["health_analysis"] = {"error": str(e)}

            # Optimization recommendations
            progress.update(task, advance=1)
            try:
                optimization_analysis = await self.database_debugger.get_optimization_recommendations()
                db_results["optimization_recommendations"] = optimization_analysis
            except Exception as e:
                db_results["optimization_recommendations"] = {"error": str(e)}

        return db_results

    async def run_comprehensive_analysis(self) -> ProfilingSession:
        """Run comprehensive backend profiling analysis.

        Returns:
            Complete profiling session with all analysis results
        """
        console.print(Panel.fit(
            "[bold red]🦊 FENRIR MEMORY PROFILER[/bold red]\n"
            f"Session: {self.session_id}\n"
            "Strategic memory analysis and optimization",
            border_style="red"
        ))

        # Initialize database session
        try:
            self.db_session_id = self.db_service.create_profiling_session(
                session_id=self.session_id,
                session_type="all",
                environment="development"
            )
            logger.info(f"Created database profiling session: {self.db_session_id}")
        except Exception as e:
            logger.warning(f"Failed to create database session: {e}")

        # Start memory tracing
        self.start_tracemalloc()
        initial_snapshot = self.take_memory_snapshot("analysis_start")

        # Backend startup analysis
        backend_results = await self.profile_backend_startup()
        self.session.backend_analysis = backend_results

        # Database analysis
        database_results = await self.profile_database_connections()
        self.session.database_analysis = database_results

        # Service analysis
        if self.service_tracker:
            try:
                service_results = await self.service_tracker.get_service_status()
                self.session.service_analysis = service_results
            except Exception as e:
                self.session.service_analysis = {"error": str(e)}

        # Analyze results and generate recommendations
        self._analyze_results()

        # Final snapshot
        final_snapshot = self.take_memory_snapshot("analysis_complete")
        self.session.end_time = datetime.now(timezone.utc)

        # Stop tracing
        self.stop_tracemalloc()

        # Save results to database
        if self.db_session_id:
            try:
                # Calculate session metrics
                duration = (self.session.end_time - self.session.start_time).total_seconds()
                peak_memory = max(snapshot.rss_mb for snapshot in self.session.snapshots) if self.session.snapshots else 0
                final_memory = self.session.snapshots[-1].rss_mb if self.session.snapshots else 0
                memory_delta = final_memory - initial_snapshot.rss_mb if self.session.snapshots else 0

                # Update database session
                self.db_service.update_profiling_session(
                    session_id=self.session_id,
                    status="completed",
                    duration_seconds=duration,
                    total_snapshots=len(self.session.snapshots),
                    issues_found=len(self.session.results),
                    peak_memory_mb=peak_memory,
                    final_memory_mb=final_memory,
                    memory_delta_mb=memory_delta,
                    backend_analysis=self.session.backend_analysis,
                    database_analysis=self.session.database_analysis,
                    service_analysis=self.session.service_analysis
                )

                # Save profiling results
                for result in self.session.results:
                    self.db_service.save_profiling_result(
                        profiling_session_id=self.session_id,
                        category=result.category,
                        severity=result.severity,
                        issue=result.issue,
                        recommendation=result.recommendation,
                        memory_impact_mb=result.memory_impact_mb,
                        performance_impact=result.performance_impact
                    )

                logger.info(f"Saved profiling session {self.session_id} to database")
            except Exception as e:
                logger.warning(f"Failed to save profiling session to database: {e}")

        # Generate report
        self.generate_profiling_report()

        return self.session

    def _analyze_results(self):
        """Analyze profiling results and generate recommendations."""
        results = []

        # Analyze memory growth
        if len(self.session.snapshots) >= 2:
            initial = self.session.snapshots[0]
            final = self.session.snapshots[-1]
            memory_growth = final.rss_mb - initial.rss_mb

            if memory_growth > 100:
                results.append(ProfilingResult(
                    category="memory",
                    severity="high",
                    issue=f"High memory growth during analysis: {memory_growth:.1f}MB",
                    recommendation="Investigate memory leaks in service initialization",
                    memory_impact_mb=memory_growth,
                    performance_impact="high"
                ))
            elif memory_growth > 50:
                results.append(ProfilingResult(
                    category="memory",
                    severity="medium",
                    issue=f"Moderate memory growth: {memory_growth:.1f}MB",
                    recommendation="Monitor for potential memory leaks",
                    memory_impact_mb=memory_growth,
                    performance_impact="medium"
                ))

        # Analyze backend results
        if self.session.backend_analysis:
            backend = self.session.backend_analysis

            if "memory_hotspots" in backend and "high_memory_modules" in backend["memory_hotspots"]:
                hotspots = backend["memory_hotspots"]["high_memory_modules"]
                if hotspots:
                    results.append(ProfilingResult(
                        category="imports",
                        severity="medium",
                        issue=f"High memory modules detected: {len(hotspots)}",
                        recommendation="Consider lazy loading for high-memory modules",
                        performance_impact="medium"
                    ))

        # Analyze database results
        if self.session.database_analysis:
            db = self.session.database_analysis

            if "pool_analysis" in db and "recommendations" in db["pool_analysis"]:
                recommendations = db["pool_analysis"]["recommendations"]
                if recommendations:
                    results.append(ProfilingResult(
                        category="database",
                        severity="medium",
                        issue="Database pool optimization needed",
                        recommendation="; ".join(recommendations[:3]),  # Top 3 recommendations
                        performance_impact="medium"
                    ))

        self.session.results = results

    def generate_profiling_report(self):
        """Generate comprehensive profiling report."""
        console.print("\n[bold red]🎯 FENRIR PROFILING REPORT[/bold red]")

        # Session summary
        session_table = Table(title="🦊 Session Summary")
        session_table.add_column("Metric", style="cyan")
        session_table.add_column("Value", style="green")

        duration = (self.session.end_time - self.session.start_time).total_seconds() if self.session.end_time else 0
        session_table.add_row("Session ID", self.session.session_id)
        session_table.add_row("Duration", f"{duration:.1f}s")
        session_table.add_row("Snapshots Taken", str(len(self.session.snapshots)))
        session_table.add_row("Issues Found", str(len(self.session.results)))

        console.print(session_table)

        # Memory timeline
        if len(self.session.snapshots) >= 2:
            memory_table = Table(title="📊 Memory Timeline")
            memory_table.add_column("Context", style="cyan")
            memory_table.add_column("RSS (MB)", style="green")
            memory_table.add_column("VMS (MB)", style="yellow")
            memory_table.add_column("Tracemalloc (MB)", style="blue")
            memory_table.add_column("GC Objects", style="magenta")

            for snapshot in self.session.snapshots:
                memory_table.add_row(
                    snapshot.context or "Unknown",
                    f"{snapshot.rss_mb:.1f}",
                    f"{snapshot.vms_mb:.1f}",
                    f"{snapshot.tracemalloc_mb:.1f}",
                    f"{snapshot.gc_objects:,}"
                )

            console.print(memory_table)

        # Issues and recommendations
        if self.session.results:
            issues_table = Table(title="🚨 Issues & Recommendations")
            issues_table.add_column("Category", style="red")
            issues_table.add_column("Severity", style="yellow")
            issues_table.add_column("Issue", style="white")
            issues_table.add_column("Recommendation", style="green")

            for result in self.session.results:
                severity_color = {
                    "low": "green",
                    "medium": "yellow",
                    "high": "red",
                    "critical": "bold red"
                }.get(result.severity, "white")

                issues_table.add_row(
                    result.category,
                    f"[{severity_color}]{result.severity.upper()}[/{severity_color}]",
                    result.issue,
                    result.recommendation
                )

            console.print(issues_table)

        # Strategic recommendations
        console.print(Panel.fit(
            "[bold red]🛡️ STRATEGIC RECOMMENDATIONS[/bold red]\n"
            "Based on comprehensive memory profiling analysis:\n\n"
            "• Implement lazy loading for high-memory modules\n"
            "• Optimize database connection pooling configuration\n"
            "• Monitor for memory leaks in service initialization\n"
            "• Use memory profiling decorators for hotspot functions\n"
            "• Implement memory usage alerts and monitoring\n"
            "• Regular memory profiling in CI/CD pipeline\n"
            "• Consider memory-efficient alternatives for heavy imports\n"
            "• Optimize garbage collection settings for production\n"
            "• Implement connection pool monitoring dashboards\n"
            "• Use async/await patterns to reduce memory overhead",
            border_style="green"
        ))

    def save_session(self, output_path: Optional[Path] = None) -> Path:
        """Save profiling session to file.

        Args:
            output_path: Optional path to save file

        Returns:
            Path where session was saved
        """
        if output_path is None:
            output_path = Path(f"fenrir_profile_{self.session_id}.json")

        # Convert dataclasses to dictionaries for JSON serialization
        session_data = {
            "session_id": self.session.session_id,
            "start_time": self.session.start_time.isoformat(),
            "end_time": self.session.end_time.isoformat() if self.session.end_time else None,
            "snapshots": [
                {
                    "timestamp": snapshot.timestamp.isoformat(),
                    "rss_mb": snapshot.rss_mb,
                    "vms_mb": snapshot.vms_mb,
                    "percent": snapshot.percent,
                    "available_mb": snapshot.available_mb,
                    "tracemalloc_mb": snapshot.tracemalloc_mb,
                    "gc_objects": snapshot.gc_objects,
                    "context": snapshot.context
                }
                for snapshot in self.session.snapshots
            ],
            "results": [
                {
                    "category": result.category,
                    "severity": result.severity,
                    "issue": result.issue,
                    "recommendation": result.recommendation,
                    "memory_impact_mb": result.memory_impact_mb,
                    "performance_impact": result.performance_impact
                }
                for result in self.session.results
            ],
            "backend_analysis": self.session.backend_analysis,
            "database_analysis": self.session.database_analysis,
            "service_analysis": self.session.service_analysis
        }

        with open(output_path, 'w') as f:
            json.dump(session_data, f, indent=2)

        console.print(f"[green]Session saved to: {output_path}[/green]")
        return output_path


class FenrirProfiler:
    """Main Fenrir profiling interface."""

    def __init__(self):
        """Initialize Fenrir profiler."""
        self.profiler = None

    async def run_memory_analysis(self, session_id: Optional[str] = None) -> ProfilingSession:
        """Run comprehensive memory analysis.

        Args:
            session_id: Optional session identifier

        Returns:
            Complete profiling session
        """
        self.profiler = MemoryProfiler(session_id)
        return await self.profiler.run_comprehensive_analysis()

    async def run_startup_profiling(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Run focused startup profiling.

        Args:
            session_id: Optional session identifier

        Returns:
            Startup profiling results
        """
        self.profiler = MemoryProfiler(session_id)
        self.profiler.start_tracemalloc()
        results = await self.profiler.profile_backend_startup()
        self.profiler.stop_tracemalloc()
        return results

    async def run_database_profiling(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Run focused database profiling.

        Args:
            session_id: Optional session identifier

        Returns:
            Database profiling results
        """
        self.profiler = MemoryProfiler(session_id)
        return await self.profiler.profile_database_connections()

    async def run_detailed_service_profiling(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Run detailed profiling of all active services, packages, and features.

        Args:
            session_id: Optional session identifier

        Returns:
            Detailed service profiling results
        """
        if not BACKEND_TOOLS_AVAILABLE:
            return {"error": "Backend tools not available"}

        console.print("🔍 [bold blue]Running Detailed Service Profiling[/bold blue]")
        
        # Initialize service profiler
        service_profiler = ServiceProfiler()
        
        # Run comprehensive profiling
        results = await service_profiler.profile_all_services()
        
        # Add session information
        results["session_id"] = session_id or "detailed-service-profiling"
        results["timestamp"] = datetime.now(timezone.utc).isoformat()
        
        # Display summary
        summary = results.get("summary", {})
        console.print(f"📊 [green]Profiled {summary.get('total_services', 0)} services, "
                     f"{summary.get('total_packages', 0)} packages, "
                     f"{summary.get('total_features', 0)} features[/green]")
        
        if summary.get("top_memory_consumers"):
            console.print("🔥 [yellow]Top Memory Consumers:[/yellow]")
            for consumer in summary["top_memory_consumers"][:3]:
                console.print(f"  • {consumer['name']}: {consumer['memory_mb']:.1f}MB "
                             f"(Score: {consumer['performance_score']:.1f})")
        
        if summary.get("slowest_services"):
            console.print("🐌 [yellow]Slowest Services:[/yellow]")
            for service in summary["slowest_services"][:3]:
                console.print(f"  • {service['name']}: {service['startup_time_ms']:.1f}ms "
                             f"(Score: {service['performance_score']:.1f})")
        
        health = summary.get("system_health", {})
        health_score = health.get("overall_health_score", 0)
        health_status = health.get("health_status", "unknown")
        console.print(f"💚 [green]System Health: {health_score:.1f}/100 ({health_status})[/green]")
        
        return results

    def save_last_session(self, output_path: Optional[Path] = None) -> Optional[Path]:
        """Save the last profiling session.

        Args:
            output_path: Optional path to save file

        Returns:
            Path where session was saved, or None if no session
        """
        if self.profiler and self.profiler.session:
            return self.profiler.save_session(output_path)
        return None


# CLI interface for Fenrir profiling mode
async def main():
    """Main CLI interface for Fenrir profiling mode."""
    import argparse

    parser = argparse.ArgumentParser(description="Fenrir Memory Profiler")
    parser.add_argument("--mode", choices=["memory", "startup", "database", "all"],
                       default="all", help="Profiling mode")
    parser.add_argument("--session-id", help="Session identifier")
    parser.add_argument("--output", help="Output file path")

    args = parser.parse_args()

    profiler = FenrirProfiler()

    if args.mode == "memory":
        await profiler.run_memory_analysis(args.session_id)
    elif args.mode == "startup":
        await profiler.run_startup_profiling(args.session_id)
    elif args.mode == "database":
        await profiler.run_database_profiling(args.session_id)
    else:  # all
        await profiler.run_memory_analysis(args.session_id)

    if args.output:
        profiler.save_last_session(Path(args.output))


if __name__ == "__main__":
    asyncio.run(main())
