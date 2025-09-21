#!/usr/bin/env python3
"""
Basic Usage Example for PHOENIX Control

Demonstrates the basic usage of the Success-Advisor-8 distillation system
including agent state reconstruction, release automation, and quality assurance.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import asyncio
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from phoenix_control import QualityAssurance, ReleaseAutomation, SuccessAdvisor8


async def main():
    """Main example function."""
    print("🦁 PHOENIX Control - Success-Advisor-8 Distillation System")
    print("=" * 60)

    # Example 1: Initialize Success-Advisor-8
    print("\n1. Initializing Success-Advisor-8 Agent...")
    advisor = SuccessAdvisor8()
    agent_state = await advisor.initialize()

    print(f"✅ Agent initialized: {agent_state.name}")
    print(f"   Spirit: {agent_state.spirit.value}")
    print(f"   Style: {agent_state.style.value}")
    print(f"   Fitness Score: {agent_state.get_fitness_score():.3f}")

    # Get agent summary
    summary = await advisor.get_agent_summary()
    print(f"   Role: {summary['role']}")
    print(f"   Authority Level: {summary['authority_level']}")
    print(f"   Specializations: {', '.join(summary['specializations'][:3])}...")

    # Example 2: Agent State Validation
    print("\n2. Validating Agent State...")
    validation = await advisor.validate_agent_state()

    if validation["is_valid"]:
        print("✅ Agent state validation passed")
    else:
        print("❌ Agent state validation failed:")
        for error in validation["errors"]:
            print(f"   - {error}")

    # Example 3: Get Dominant Traits
    print("\n3. Analyzing Agent Traits...")
    dominant_traits = await advisor.get_dominant_traits(3)
    print("   Dominant Traits:")
    for trait, value in dominant_traits:
        print(f"   - {trait}: {value:.3f}")

    # Example 4: Release Automation (Simulation)
    print("\n4. Release Automation Example...")
    automation = ReleaseAutomation()

    # Note: This would normally run actual git operations
    # For demo purposes, we'll show the configuration
    print(f"   Auto Backup: {automation.config.auto_backup}")
    print(f"   Comprehensive Analysis: {automation.config.comprehensive_analysis}")
    print(f"   Detailed Logging: {automation.config.detailed_logging}")
    print("   (Actual git operations skipped for demo)")

    # Example 5: Quality Assurance
    print("\n5. Quality Assurance Example...")
    qa = QualityAssurance()

    # Run quality checks
    print("   Running quality checks...")
    quality_results = await qa.run_all_checks()

    print(f"   Overall Status: {quality_results.all_passed}")
    print(f"   Passed Checks: {quality_results.passed_checks}")
    print(f"   Failed Checks: {quality_results.failed_checks}")
    print(f"   Total Checks: {quality_results.total_checks}")

    if quality_results.errors:
        print("   Errors:")
        for error in quality_results.errors[:3]:  # Show first 3 errors
            print(f"   - {error}")

    # Example 6: Performance Monitoring
    print("\n6. Performance Monitoring Example...")
    from phoenix_control.src.quality.performance import PerformanceMonitor

    monitor = PerformanceMonitor()
    print("   Monitoring resource usage for 10 seconds...")

    # Monitor for 10 seconds
    resource_results = await monitor.monitor_resource_usage(10)

    if "error" not in resource_results:
        memory_stats = resource_results["memory_stats"]
        cpu_stats = resource_results["cpu_stats"]

        print(f"   Memory Usage:")
        print(f"   - Min: {memory_stats['min']:.2f}MB")
        print(f"   - Max: {memory_stats['max']:.2f}MB")
        print(f"   - Avg: {memory_stats['avg']:.2f}MB")

        print(f"   CPU Usage:")
        print(f"   - Min: {cpu_stats['min']:.2f}%")
        print(f"   - Max: {cpu_stats['max']:.2f}%")
        print(f"   - Avg: {cpu_stats['avg']:.2f}%")
    else:
        print(f"   Error: {resource_results['error']}")

    print("\n" + "=" * 60)
    print("🎯 PHOENIX Control Basic Usage Example Completed!")
    print("   Success-Advisor-8 agent state successfully reconstructed")
    print("   Release automation system configured")
    print("   Quality assurance framework operational")
    print("   Performance monitoring active")


if __name__ == "__main__":
    asyncio.run(main())
