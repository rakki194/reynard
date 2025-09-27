#!/usr/bin/env python3
"""Service Tracker
================

Strategic service startup tracking and analysis.
Maps all services, their dependencies, startup order, and what they do.

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

logger = logging.getLogger(__name__)


class ServiceTracker:
    """Service startup tracking and analysis system."""

    def __init__(self):
        """Initialize the service tracker."""
        self.services: Dict[str, Dict[str, Any]] = {}
        self.startup_order: List[str] = []
        self.dependencies: Dict[str, List[str]] = {}
        self.startup_timings: Dict[str, float] = {}
        self.service_status: Dict[str, str] = {}
        self.service_registry: Dict[str, Any] = {}
        self.startup_logs: List[Dict[str, Any]] = []

    def register_service(self, name: str, description: str, dependencies: List[str] = None,
                        startup_priority: int = 50, category: str = "core"):
        """Register a service for tracking."""
        self.services[name] = {
            "name": name,
            "description": description,
            "dependencies": dependencies or [],
            "startup_priority": startup_priority,
            "category": category,
            "startup_time": None,
            "status": "registered",
        }

        if dependencies:
            self.dependencies[name] = dependencies

    def track_service_startup(self, name: str, start_time: float = None):
        """Track when a service starts up."""
        if start_time is None:
            start_time = time.time()

        if name in self.services:
            self.services[name]["startup_time"] = start_time
            self.services[name]["status"] = "starting"
            self.startup_timings[name] = start_time

            if name not in self.startup_order:
                self.startup_order.append(name)

    def track_service_ready(self, name: str, ready_time: float = None):
        """Track when a service is ready."""
        if ready_time is None:
            ready_time = time.time()

        if name in self.services:
            self.services[name]["ready_time"] = ready_time
            self.services[name]["status"] = "ready"
            self.service_status[name] = "ready"

    def track_service_error(self, name: str, error: str, error_time: float = None):
        """Track service startup errors."""
        if error_time is None:
            error_time = time.time()

        if name in self.services:
            self.services[name]["error"] = error
            self.services[name]["error_time"] = error_time
            self.services[name]["status"] = "error"
            self.service_status[name] = "error"

    def get_startup_analysis(self) -> Dict[str, Any]:
        """Get startup analysis."""
        # Calculate startup durations
        startup_durations = {}
        for name, service in self.services.items():
            if service.get("startup_time") and service.get("ready_time"):
                startup_durations[name] = service["ready_time"] - service["startup_time"]
            elif service.get("startup_time"):
                startup_durations[name] = time.time() - service["startup_time"]

        # Group by category
        services_by_category = {}
        for name, service in self.services.items():
            category = service["category"]
            if category not in services_by_category:
                services_by_category[category] = []
            services_by_category[category].append(name)

        # Calculate dependency satisfaction
        dependency_satisfaction = {}
        for name, deps in self.dependencies.items():
            satisfied = 0
            for dep in deps:
                if dep in self.startup_order and self.startup_order.index(dep) < self.startup_order.index(name):
                    satisfied += 1
            dependency_satisfaction[name] = {
                "total_deps": len(deps),
                "satisfied_deps": satisfied,
                "satisfaction_rate": satisfied / len(deps) if deps else 1.0,
            }

        return {
            "total_services": len(self.services),
            "startup_order": self.startup_order,
            "startup_durations": startup_durations,
            "services_by_category": services_by_category,
            "dependency_satisfaction": dependency_satisfaction,
            "service_status": self.service_status,
        }

    def get_service_map(self) -> Dict[str, Any]:
        """Get comprehensive service map."""
        return {
            "services": self.services,
            "dependencies": self.dependencies,
            "startup_order": self.startup_order,
            "startup_timings": self.startup_timings,
        }

    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive service tracking report."""
        return {
            "service_map": self.get_service_map(),
            "startup_analysis": self.get_startup_analysis(),
            "summary": self._generate_summary(),
        }

    async def track_service_startup(self) -> Dict[str, Any]:
        """Track service startup and return analysis results."""
        # Register all known services
        services = [
            ("config", "Configuration management", [], 100, "core"),
            ("database", "Database connections and management", ["config"], 90, "core"),
            ("service_manager", "Service lifecycle management", ["config"], 80, "core"),
            ("service_registry", "Service registration and discovery", ["service_manager"], 70, "core"),
            ("gatekeeper", "Authentication and authorization", ["database"], 60, "security"),
            ("ai_service", "AI model management and inference", ["config"], 50, "ai"),
            ("ollama", "Ollama model provider", ["ai_service"], 40, "ai"),
            ("rag_service", "Retrieval-Augmented Generation", ["ai_service", "database"], 30, "ai"),
            ("embedding_service", "Text embedding generation", ["ai_service"], 25, "ai"),
            ("vector_store", "Vector database operations", ["database"], 20, "ai"),
            ("indexing_service", "Document indexing and search", ["vector_store"], 15, "ai"),
            ("comfy", "ComfyUI integration", ["ai_service"], 10, "ai"),
            ("tts", "Text-to-speech synthesis", ["ai_service"], 15, "media"),
            ("nlweb", "Natural language web processing", ["ai_service"], 10, "nlp"),
            ("ecs_world", "ECS world simulation", ["database"], 5, "simulation"),
            ("image_processing", "Image processing and manipulation", ["config"], 5, "media"),
            ("ai_email_response", "AI-powered email responses", ["ai_service"], 3, "email"),
        ]

        # Register all services
        for name, description, dependencies, priority, category in services:
            self.register_service(name, description, dependencies, priority, category)

        # Simulate service startup tracking
        startup_results = {
            "services": {},
            "startup_sequence": [],
            "performance_issues": []
        }

        # Start services in priority order
        sorted_services = sorted(services, key=lambda x: x[3], reverse=True)

        for name, description, dependencies, priority, category in sorted_services:
            start_time = time.time()
            self.track_service_startup(name, start_time)

            # Simulate startup time based on service complexity
            startup_duration = {
                "config": 0.1,
                "database": 0.5,
                "service_manager": 0.2,
                "service_registry": 0.1,
                "gatekeeper": 0.3,
                "ai_service": 1.0,
                "ollama": 0.8,
                "rag_service": 1.5,
                "embedding_service": 0.4,
                "vector_store": 0.6,
                "indexing_service": 0.7,
                "comfy": 0.3,
                "tts": 0.4,
                "nlweb": 0.5,
                "ecs_world": 0.8,
                "image_processing": 0.3,
                "ai_email_response": 0.2,
            }.get(name, 0.2)

            # Simulate startup delay
            await asyncio.sleep(startup_duration)

            end_time = time.time()
            self.track_service_ready(name, end_time)

            service_data = {
                "startup_time_ms": (end_time - start_time) * 1000,
                "memory_delta_mb": 0,  # Would be measured in real implementation
                "status": "completed",
                "category": category,
                "priority": priority,
                "dependencies": dependencies
            }

            startup_results["services"][name] = service_data
            startup_results["startup_sequence"].append({
                "service": name,
                "timestamp": end_time,
                "duration_ms": service_data["startup_time_ms"]
            })

            # Check for performance issues
            if service_data["startup_time_ms"] > 5000:  # 5 second threshold
                startup_results["performance_issues"].append({
                    "service": name,
                    "issue": "Slow startup time",
                    "duration_ms": service_data["startup_time_ms"],
                    "recommendation": "Optimize service initialization"
                })

        return startup_results

    def _generate_summary(self) -> Dict[str, Any]:
        """Generate summary of service tracking."""
        startup_analysis = self.get_startup_analysis()

        total_services = startup_analysis["total_services"]
        ready_services = len([s for s in self.service_status.values() if s == "ready"])
        error_services = len([s for s in self.service_status.values() if s == "error"])

        return {
            "total_services": total_services,
            "ready_services": ready_services,
            "error_services": error_services,
            "success_rate": ready_services / total_services if total_services > 0 else 0,
            "startup_order_length": len(self.startup_order),
        }

    async def analyze_service_startup(self) -> Dict[str, Any]:
        """Async method to track service startup and return analysis results."""
        # Simulate service startup tracking
        services = [
            ("config", "Configuration management", [], 100, "core"),
            ("database", "Database connections", [], 90, "core"),
            ("service_manager", "Service lifecycle", ["config"], 85, "core"),
            ("ai_service", "AI service", ["config"], 60, "ai"),
            ("rag_service", "RAG service", ["ai_service", "database"], 40, "rag"),
        ]

        startup_sequence = []
        performance_issues = []

        for name, description, dependencies, priority, category in services:
            start_time = time.time()
            # Register and track service startup
            self.register_service(name, description, dependencies, priority, category)
            if name in self.services:
                self.services[name]["startup_time"] = start_time
                self.services[name]["status"] = "starting"
                self.startup_timings[name] = start_time
                if name not in self.startup_order:
                    self.startup_order.append(name)

            # Simulate startup duration
            startup_duration = {
                "config": 0.1,
                "database": 0.5,
                "service_manager": 0.2,
                "ai_service": 1.0,
                "rag_service": 1.5,
            }.get(name, 0.3)

            await asyncio.sleep(0.01)  # Simulate async work

            ready_time = time.time()
            # Track service ready
            if name in self.services:
                self.services[name]["ready_time"] = ready_time
                self.services[name]["status"] = "ready"
                self.service_status[name] = "ready"

            startup_sequence.append({
                "name": name,
                "startup_time": start_time,
                "ready_time": ready_time,
                "duration": ready_time - start_time,
                "category": category
            })

            # Check for performance issues
            if startup_duration > 1.0:
                performance_issues.append({
                    "service": name,
                    "issue": "Slow startup",
                    "duration": startup_duration,
                    "threshold": 1.0
                })

        return {
            "services": {name: self.services.get(name, {}) for name, _, _, _, _ in services},
            "startup_sequence": startup_sequence,
            "performance_issues": performance_issues
        }


# Global service tracker instance
_service_tracker = ServiceTracker()


def get_service_tracker() -> ServiceTracker:
    """Get the global service tracker instance."""
    return _service_tracker


async def analyze_service_startup():
    """Analyze service startup patterns."""
    tracker = get_service_tracker()

    logger.info("🔧 Starting service startup analysis...")
    logger.info("=" * 60)

    # Register all services based on the codebase analysis
    services = [
        # Core services
        ("config", "Configuration management", [], 100, "core"),
        ("database", "Database connections and migrations", [], 90, "core"),
        ("service_manager", "Service lifecycle management", ["config"], 85, "core"),
        ("service_registry", "Service registration and discovery", ["config"], 80, "core"),

        # Authentication services
        ("gatekeeper", "JWT authentication and user management", ["database"], 70, "auth"),

        # AI services
        ("ai_service", "Unified AI service with multiple providers", ["config"], 60, "ai"),
        ("ollama", "Local LLM inference via Ollama", ["ai_service"], 50, "ai"),

        # RAG services
        ("rag_service", "Retrieval-Augmented Generation", ["ai_service", "database"], 40, "rag"),
        ("embedding_service", "Vector embedding generation", ["ai_service"], 35, "rag"),
        ("vector_store", "Vector database operations", ["database"], 30, "rag"),
        ("indexing_service", "Document indexing and processing", ["rag_service"], 25, "rag"),

        # Other services
        ("comfy", "ComfyUI image generation integration", ["config"], 20, "media"),
        ("tts", "Text-to-speech synthesis", ["ai_service"], 15, "media"),
        ("nlweb", "Natural language web processing", ["ai_service"], 10, "nlp"),
        ("ecs_world", "ECS world simulation", ["database"], 5, "simulation"),
        ("image_processing", "Image processing and manipulation", ["config"], 5, "media"),
        ("ai_email_response", "AI-powered email responses", ["ai_service"], 3, "email"),
    ]

    # Register all services
    for name, description, dependencies, priority, category in services:
        tracker.register_service(name, description, dependencies, priority, category)

    logger.info(f"Registered {len(services)} services")

    # Simulate service startup
    logger.info("\n🚀 Simulating service startup...")

    # Start services in priority order
    sorted_services = sorted(services, key=lambda x: x[3], reverse=True)

    for name, description, dependencies, priority, category in sorted_services:
        logger.info(f"Starting {name} ({category})...")

        # Track startup
        tracker.track_service_startup(name)

        # Simulate startup time based on service complexity
        startup_duration = {
            "config": 0.1,
            "database": 0.5,
            "service_manager": 0.2,
            "service_registry": 0.1,
            "gatekeeper": 0.3,
            "ai_service": 1.0,
            "ollama": 0.8,
            "rag_service": 1.5,
            "embedding_service": 0.4,
            "vector_store": 0.6,
            "indexing_service": 0.7,
            "comfy": 0.3,
            "tts": 0.4,
            "nlweb": 0.5,
            "ecs_world": 0.8,
            "image_processing": 0.3,
            "ai_email_response": 0.2,
        }.get(name, 0.2)

        await asyncio.sleep(startup_duration)

        # Track ready
        tracker.track_service_ready(name)
        logger.info(f"✅ {name} ready")

    # Generate and display analysis
    logger.info("\n📊 Service Analysis Results")
    logger.info("=" * 60)

    report = tracker.generate_report()

    # Service map
    service_map = report["service_map"]
    logger.info("Service Map:")
    for name, service in service_map["services"].items():
        deps = ", ".join(service["dependencies"]) if service["dependencies"] else "none"
        logger.info(f"  {name}: {service['description']}")
        logger.info(f"    Category: {service['category']}, Priority: {service['startup_priority']}")
        logger.info(f"    Dependencies: {deps}")
        logger.info(f"    Status: {service['status']}")

    # Startup analysis
    startup_analysis = report["startup_analysis"]
    logger.info(f"\nStartup Analysis:")
    logger.info(f"  Total services: {startup_analysis['total_services']}")
    logger.info(f"  Startup order: {', '.join(startup_analysis['startup_order'])}")

    logger.info(f"\nServices by Category:")
    for category, service_names in startup_analysis["services_by_category"].items():
        logger.info(f"  {category}: {', '.join(service_names)}")

    logger.info(f"\nDependency Satisfaction:")
    for name, satisfaction in startup_analysis["dependency_satisfaction"].items():
        if satisfaction["total_deps"] > 0:
            logger.info(f"  {name}: {satisfaction['satisfied_deps']}/{satisfaction['total_deps']} "
                       f"({satisfaction['satisfaction_rate']:.1%})")

    # Summary
    summary = report["summary"]
    logger.info(f"\nSummary:")
    logger.info(f"  Total services: {summary['total_services']}")
    logger.info(f"  Ready services: {summary['ready_services']}")
    logger.info(f"  Error services: {summary['error_services']}")
    logger.info(f"  Success rate: {summary['success_rate']:.1%}")

    return report


async def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(description="Service Tracker")
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
        report = await analyze_service_startup()

        # Save analysis if requested
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            logger.info(f"📁 Analysis saved to {args.output}")

        logger.info("\n🎉 Service analysis completed!")

    except KeyboardInterrupt:
        logger.info("Analysis interrupted by user")
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
