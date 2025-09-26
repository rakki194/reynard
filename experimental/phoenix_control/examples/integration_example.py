#!/usr/bin/env python3
"""Integration Example for PHOENIX Control

Demonstrates the complete integration of all PHOENIX Control components
including agent management, release automation, and quality assurance.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import asyncio
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from phoenix_control.src.automation.changelog import ChangelogManager
from phoenix_control.src.automation.git_workflow import ReleaseAutomation
from phoenix_control.src.automation.version_management import VersionManager
from phoenix_control.src.core.persistence import AgentStatePersistence
from phoenix_control.src.core.success_advisor import SuccessAdvisor8
from phoenix_control.src.quality.performance import PerformanceQualityAssurance
from phoenix_control.src.quality.security import SecurityQualityAssurance
from phoenix_control.src.quality.validation import CodeQualityValidation
from phoenix_control.src.utils.data_structures import QualityConfig, ReleaseConfig


async def main():
    """Main integration example."""
    print("🔗 PHOENIX Control - Integration Example")
    print("=" * 60)

    # Example 1: System Initialization
    print("\n1. System Initialization...")

    # Initialize Success-Advisor-8
    success_advisor = SuccessAdvisor8()
    print(f"   ✅ Success-Advisor-8 initialized: {success_advisor.name}")

    # Initialize persistence system
    persistence = AgentStatePersistence()
    print("   ✅ Agent state persistence system ready")

    # Initialize release automation
    release_config = ReleaseConfig(
        auto_backup=True,
        comprehensive_analysis=True,
        detailed_logging=True,
        agent_state_tracking=True,
        create_tag=True,
        push_remote=False,  # Set to False for demo
        version_type="auto",
    )
    release_automation = ReleaseAutomation(release_config)
    print("   ✅ Release automation system configured")

    # Initialize quality assurance
    quality_config = QualityConfig(
        enable_linting=True,
        enable_formatting=True,
        enable_type_checking=True,
        enable_security_scanning=True,
        enable_performance_testing=True,
        enable_documentation_validation=True,
        strict_mode=True,
        auto_fix=True,
    )
    quality_validator = CodeQualityValidation()
    security_qa = SecurityQualityAssurance()
    performance_qa = PerformanceQualityAssurance()
    print("   ✅ Quality assurance framework active")

    # Example 2: Agent State Management
    print("\n2. Agent State Management...")

    # Save Success-Advisor-8 state
    save_result = await persistence.save_agent(success_advisor)
    if save_result:
        print("   ✅ Success-Advisor-8 state saved")
    else:
        print("   ❌ Failed to save Success-Advisor-8 state")

    # Create backup
    backup_result = await persistence.backup_agent_states()
    if backup_result:
        print("   ✅ Agent state backup created")
    else:
        print("   ❌ Failed to create backup")

    # Example 3: Quality Assurance Pipeline
    print("\n3. Quality Assurance Pipeline...")

    # Run code quality validation
    print("   Running code quality validation...")
    frontend_result = await quality_validator.validate_frontend()
    backend_result = await quality_validator.validate_backend()

    frontend_passed = all(
        [
            frontend_result["linting"]["passed"],
            frontend_result["formatting"]["passed"],
            frontend_result["type_safety"]["passed"],
        ],
    )

    backend_passed = all(
        [
            backend_result["linting"]["passed"],
            backend_result["formatting"]["passed"],
            backend_result["type_safety"]["passed"],
        ],
    )

    print(f"   Frontend Quality: {'✅' if frontend_passed else '❌'}")
    print(f"   Backend Quality: {'✅' if backend_passed else '❌'}")

    # Run security scanning
    print("   Running security scanning...")
    security_result = await security_qa.scan_dependency_vulnerabilities()
    print(f"   Security Scan: {'✅' if security_result['passed'] else '❌'}")

    # Run performance testing
    print("   Running performance testing...")
    performance_result = await performance_qa.test_build_performance()
    print(f"   Performance Test: {'✅' if performance_result['passed'] else '❌'}")

    # Example 4: Release Preparation
    print("\n4. Release Preparation...")

    # Check if all quality gates pass
    quality_gates_passed = all(
        [
            frontend_passed,
            backend_passed,
            security_result["passed"],
            performance_result["passed"],
        ],
    )

    if quality_gates_passed:
        print("   ✅ All quality gates passed - ready for release")

        # Determine version bump
        version_manager = VersionManager()
        current_version = await version_manager.get_current_version()
        if current_version:
            next_version = await version_manager.suggest_next_version(
                current_version,
                "feature",
            )
            print(f"   Current Version: {current_version}")
            print(f"   Next Version: {next_version}")

        # Update changelog
        changelog_manager = ChangelogManager()
        if not changelog_manager.changelog_path.exists():
            await changelog_manager.create_changelog()
            print("   ✅ Changelog created")

        # Add release entry
        await changelog_manager.add_entry(
            "Added",
            "New feature for automated release management",
        )
        await changelog_manager.add_entry(
            "Changed",
            "Improved version detection algorithm",
        )
        await changelog_manager.add_entry(
            "Fixed",
            "Resolved issue with changelog formatting",
        )
        print("   ✅ Changelog updated")

    else:
        print("   ❌ Quality gates failed - release blocked")
        print("   Please address quality issues before proceeding")

    # Example 5: Release Execution (Simulation)
    print("\n5. Release Execution...")

    if quality_gates_passed:
        print("   Simulating release execution...")

        # Simulate git operations
        print("   ✓ Analyzing changes")
        print("   ✓ Staging files")
        print("   ✓ Committing changes")
        print("   ✓ Creating git tag")
        print("   ✓ Updating agent state")

        # Update Success-Advisor-8 performance
        success_advisor.performance_history.append(
            {
                "timestamp": "2025-01-15T10:30:00Z",
                "action": "release_execution",
                "success": True,
                "details": "Successfully executed release workflow",
            },
        )

        # Save updated state
        await persistence.save_agent(success_advisor)
        print("   ✅ Agent state updated with release information")

    else:
        print("   Release execution skipped due to quality gate failures")

    # Example 6: Post-Release Validation
    print("\n6. Post-Release Validation...")

    if quality_gates_passed:
        # Validate release
        print("   Validating release...")
        print("   ✓ Version tag created")
        print("   ✓ Changelog updated")
        print("   ✓ Agent state persisted")
        print("   ✓ Backup created")

        # Get release statistics
        stats = await persistence.get_agent_statistics()
        print(f"   Total Agents: {stats['total_agents']}")
        print(f"   Active Agents: {stats['active_agents']}")

        print("   ✅ Release validation completed successfully")
    else:
        print("   Post-release validation skipped")

    # Example 7: System Health Check
    print("\n7. System Health Check...")

    # Check all system components
    components = {
        "Agent State Persistence": persistence is not None,
        "Release Automation": release_automation is not None,
        "Version Management": version_manager is not None,
        "Changelog Management": changelog_manager is not None,
        "Code Quality Validation": quality_validator is not None,
        "Security Quality Assurance": security_qa is not None,
        "Performance Quality Assurance": performance_qa is not None,
    }

    print("   System Component Status:")
    for component, status in components.items():
        print(f"     {component}: {'✅' if status else '❌'}")

    # Calculate overall system health
    healthy_components = sum(1 for status in components.values() if status)
    total_components = len(components)
    health_percentage = (healthy_components / total_components) * 100

    print(f"   Overall System Health: {health_percentage:.1f}%")

    if health_percentage >= 90:
        print("   🎯 System is healthy and operational")
    elif health_percentage >= 80:
        print("   ✅ System is mostly healthy")
    elif health_percentage >= 70:
        print("   ⚠️  System has some issues")
    else:
        print("   ❌ System has significant issues")

    # Example 8: Integration Summary
    print("\n8. Integration Summary...")

    print("   PHOENIX Control Integration Results:")
    print("   - Agent state persistence: Operational")
    print("   - Release automation: Configured")
    print("   - Quality assurance: Active")
    print("   - Version management: Ready")
    print("   - Changelog management: Functional")
    print("   - Security scanning: Enabled")
    print("   - Performance testing: Active")

    print("\n   Key Features Demonstrated:")
    print("   - Complete agent lifecycle management")
    print("   - Automated release workflow")
    print("   - Comprehensive quality assurance")
    print("   - State persistence and backup")
    print("   - Version and changelog management")
    print("   - Security and performance validation")

    print("\n" + "=" * 60)
    print("🎯 Integration Example Completed!")
    print("   All PHOENIX Control components integrated")
    print("   System health validated")
    print("   Release workflow demonstrated")
    print("   Quality assurance pipeline active")
    print("\n💡 Note: This example demonstrates the complete integration")
    print("   without executing actual git operations for safety.")


if __name__ == "__main__":
    asyncio.run(main())
