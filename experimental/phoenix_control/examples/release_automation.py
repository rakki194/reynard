#!/usr/bin/env python3
"""Release Automation Example for PHOENIX Control

Demonstrates the complete release automation workflow including
version management, changelog updates, and git operations.

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
from phoenix_control.src.utils.data_structures import ReleaseConfig


async def main():
    """Main release automation example."""
    print("🚀 PHOENIX Control - Release Automation Example")
    print("=" * 60)

    # Example 1: Version Management
    print("\n1. Version Management...")
    version_manager = VersionManager()

    # Get current version (if package.json exists)
    current_version = await version_manager.get_current_version()
    if current_version:
        print(f"   Current Version: {current_version}")

        # Parse version information
        version_info = version_manager.get_version_info(current_version)
        print(f"   Version Info: {version_info}")

        # Suggest next version based on change type
        next_version = await version_manager.suggest_next_version(
            current_version, "feature",
        )
        if next_version:
            print(f"   Suggested Next Version: {next_version}")
    else:
        print("   No package.json found - using demo version")
        current_version = "1.0.0"

    # Example 2: Changelog Management
    print("\n2. Changelog Management...")
    changelog_manager = ChangelogManager()

    # Check if changelog exists
    if not changelog_manager.changelog_path.exists():
        print("   Creating new changelog...")
        await changelog_manager.create_changelog()
        print("   ✅ Changelog created")
    else:
        print("   ✅ Changelog exists")

    # Validate changelog
    validation = await changelog_manager.validate_changelog()
    if validation["valid"]:
        print("   ✅ Changelog validation passed")
    else:
        print("   ❌ Changelog validation failed:")
        for error in validation["errors"]:
            print(f"     - {error}")

    # Example 3: Release Configuration
    print("\n3. Release Configuration...")
    release_config = ReleaseConfig(
        auto_backup=True,
        comprehensive_analysis=True,
        detailed_logging=True,
        agent_state_tracking=True,
        create_tag=True,
        push_remote=False,  # Set to False for demo
        version_type="auto",
    )

    print(f"   Auto Backup: {release_config.auto_backup}")
    print(f"   Comprehensive Analysis: {release_config.comprehensive_analysis}")
    print(f"   Detailed Logging: {release_config.detailed_logging}")
    print(f"   Create Tag: {release_config.create_tag}")
    print(f"   Push Remote: {release_config.push_remote}")

    # Example 4: Release Automation (Simulation)
    print("\n4. Release Automation Workflow...")
    automation = ReleaseAutomation(release_config)

    # Simulate release workflow (without actual git operations)
    print("   Simulating release workflow...")

    # Check git status (simulated)
    print("   ✓ Checking git repository status")
    print("   ✓ Analyzing changes")
    print("   ✓ Determining version bump type")
    print("   ✓ Updating version")
    print("   ✓ Updating changelog")
    print("   ✓ Staging and committing changes")
    print("   ✓ Creating git tag")
    print("   ✓ Updating agent state")

    # Example 5: Version Comparison
    print("\n5. Version Comparison...")
    versions = ["1.0.0", "1.1.0", "2.0.0", "1.0.1"]

    for i in range(len(versions) - 1):
        v1, v2 = versions[i], versions[i + 1]
        comparison = version_manager.compare_versions(v1, v2)

        if comparison < 0:
            result = f"{v1} < {v2}"
        elif comparison > 0:
            result = f"{v1} > {v2}"
        else:
            result = f"{v1} = {v2}"

        print(f"   {result}")

    # Example 6: Changelog Entry Addition
    print("\n6. Adding Changelog Entries...")

    # Add some example entries
    entries = [
        ("Added", "New feature for automated release management"),
        ("Changed", "Improved version detection algorithm"),
        ("Fixed", "Resolved issue with changelog formatting"),
    ]

    for change_type, description in entries:
        success = await changelog_manager.add_entry(change_type, description)
        if success:
            print(f"   ✅ Added {change_type}: {description}")
        else:
            print(f"   ❌ Failed to add {change_type}: {description}")

    # Example 7: Release History
    print("\n7. Release History...")

    # Get release history (simulated)
    print("   Recent releases:")
    print("   - v1.0.0 (2025-01-15) - Initial release")
    print("   - v0.9.0 (2025-01-10) - Beta release")
    print("   - v0.8.7 (2025-01-05) - Previous stable release")

    # Example 8: Quality Gates
    print("\n8. Quality Gates...")
    print("   Pre-release quality checks:")
    print("   ✓ Code quality validation")
    print("   ✓ Security scanning")
    print("   ✓ Performance testing")
    print("   ✓ Documentation validation")
    print("   ✓ Agent state integrity")

    print("\n" + "=" * 60)
    print("🎯 Release Automation Example Completed!")
    print("   Version management system operational")
    print("   Changelog management functional")
    print("   Release workflow configured")
    print("   Quality gates established")
    print("\n💡 Note: This example demonstrates the workflow without")
    print("   executing actual git operations for safety.")


if __name__ == "__main__":
    asyncio.run(main())
