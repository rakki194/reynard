"""Changelog Management

Provides automated changelog generation and management for
the Success-Advisor-8 distillation system.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import re
from datetime import datetime
from pathlib import Path
from typing import Any

from ..utils.logging import PhoenixLogger


class ChangelogManager:
    """Changelog management system.

    Provides automated changelog generation, updating, and formatting
    for release management.
    """

    def __init__(self, changelog_path: str = "CHANGELOG.md"):
        """Initialize changelog manager.

        Args:
            changelog_path: Path to changelog file

        """
        self.changelog_path = Path(changelog_path)
        self.logger = PhoenixLogger("changelog_manager")

        # Conventional commit patterns
        self.commit_patterns = {
            "feat": r"^feat(\(.+\))?:",
            "fix": r"^fix(\(.+\))?:",
            "docs": r"^docs(\(.+\))?:",
            "style": r"^style(\(.+\))?:",
            "refactor": r"^refactor(\(.+\))?:",
            "perf": r"^perf(\(.+\))?:",
            "test": r"^test(\(.+\))?:",
            "chore": r"^chore(\(.+\))?:",
            "breaking": r"^feat(\(.+\))?!:|BREAKING CHANGE:",
        }

        self.logger.info(
            f"Changelog manager initialized for {changelog_path}", "initialization",
        )

    async def create_changelog(self) -> bool:
        """Create a new changelog file.

        Returns:
            True if successful, False otherwise

        """
        try:
            if self.changelog_path.exists():
                self.logger.warning("Changelog already exists", "create")
                return False

            # Create default changelog content
            content = self._get_default_changelog_content()

            with open(self.changelog_path, "w") as f:
                f.write(content)

            self.logger.success("Created new changelog file", "create")
            return True

        except Exception as e:
            self.logger.error(f"Failed to create changelog: {e}", "create")
            return False

    def _get_default_changelog_content(self) -> str:
        """Get default changelog content.

        Returns:
            Default changelog content

        """
        return """# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

"""

    async def update_changelog(
        self, version: str, release_date: str | None = None,
    ) -> bool:
        """Update changelog for a new release.

        Args:
            version: New version string
            release_date: Release date (defaults to today)

        Returns:
            True if successful, False otherwise

        """
        try:
            if not self.changelog_path.exists():
                self.logger.warning(
                    "Changelog file not found, creating new one", "update",
                )
                await self.create_changelog()

            # Read current content
            with open(self.changelog_path) as f:
                content = f.read()

            # Set release date
            if release_date is None:
                release_date = datetime.now().strftime("%Y-%m-%d")

            # Replace [Unreleased] with new version
            new_content = content.replace(
                "## [Unreleased]", f"## [{version}] - {release_date}",
            )

            # Add new [Unreleased] section
            unreleased_section = """

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security
"""
            new_content = new_content.replace(
                f"## [{version}] - {release_date}",
                f"## [{version}] - {release_date}{unreleased_section}",
            )

            # Write updated content
            with open(self.changelog_path, "w") as f:
                f.write(new_content)

            self.logger.success(f"Changelog updated for version {version}", "update")
            return True

        except Exception as e:
            self.logger.error(f"Failed to update changelog: {e}", "update")
            return False

    async def add_entry(
        self, change_type: str, description: str, version: str = "Unreleased",
    ) -> bool:
        """Add a new entry to the changelog.

        Args:
            change_type: Type of change (Added, Changed, Fixed, etc.)
            description: Description of the change
            version: Version to add entry to (defaults to Unreleased)

        Returns:
            True if successful, False otherwise

        """
        try:
            if not self.changelog_path.exists():
                self.logger.warning("Changelog file not found", "add_entry")
                return False

            # Read current content
            with open(self.changelog_path) as f:
                content = f.read()

            # Find the section for the specified version
            version_section = f"## [{version}]"
            if version_section not in content:
                self.logger.error(f"Version section [{version}] not found", "add_entry")
                return False

            # Find the subsection for the change type
            change_section = f"### {change_type}"
            if change_section not in content:
                self.logger.error(
                    f"Change type section '{change_type}' not found", "add_entry",
                )
                return False

            # Add the entry
            entry = f"- {description}\n"

            # Find the position to insert the entry
            lines = content.split("\n")
            new_lines = []
            in_target_section = False
            in_change_type = False

            for line in lines:
                new_lines.append(line)

                if line.startswith(version_section):
                    in_target_section = True
                elif line.startswith("## [") and line != version_section:
                    in_target_section = False
                    in_change_type = False
                elif in_target_section and line.startswith(change_section):
                    in_change_type = True
                elif in_target_section and in_change_type and line.startswith("### "):
                    # Insert entry before next subsection
                    new_lines.insert(-1, entry)
                    in_change_type = False
                elif in_target_section and in_change_type and line.startswith("- "):
                    # Insert entry after existing entries
                    new_lines.insert(-1, entry)
                    in_change_type = False

            # Write updated content
            with open(self.changelog_path, "w") as f:
                f.write("\n".join(new_lines))

            self.logger.success(
                f"Added {change_type} entry: {description}", "add_entry",
            )
            return True

        except Exception as e:
            self.logger.error(f"Failed to add changelog entry: {e}", "add_entry")
            return False

    async def generate_changelog_from_commits(
        self, from_version: str | None = None,
    ) -> dict[str, list[str]]:
        """Generate changelog entries from git commits.

        Args:
            from_version: Version to generate changes from (defaults to latest tag)

        Returns:
            Dictionary of changes by type

        """
        try:
            import subprocess

            # Get commit range
            if from_version:
                commit_range = f"{from_version}..HEAD"
            else:
                # Get latest tag
                result = subprocess.run(
                    ["git", "describe", "--tags", "--abbrev=0"],
                    capture_output=True,
                    text=True, check=False,
                )
                if result.returncode == 0:
                    latest_tag = result.stdout.strip()
                    commit_range = f"{latest_tag}..HEAD"
                else:
                    commit_range = "HEAD"

            # Get commits
            result = subprocess.run(
                ["git", "log", "--pretty=format:%s", commit_range],
                capture_output=True,
                text=True,
                check=True,
            )

            commits = result.stdout.strip().split("\n") if result.stdout.strip() else []

            # Categorize commits
            changes = {
                "Added": [],
                "Changed": [],
                "Fixed": [],
                "Security": [],
                "Deprecated": [],
                "Removed": [],
            }

            for commit in commits:
                categorized = False

                # Check for breaking changes
                if re.search(self.commit_patterns["breaking"], commit, re.IGNORECASE):
                    changes["Changed"].append(f"**BREAKING:** {commit}")
                    categorized = True

                # Check for features
                elif re.search(self.commit_patterns["feat"], commit, re.IGNORECASE):
                    changes["Added"].append(commit)
                    categorized = True

                # Check for fixes
                elif re.search(self.commit_patterns["fix"], commit, re.IGNORECASE):
                    changes["Fixed"].append(commit)
                    categorized = True

                # Check for other types
                elif re.search(self.commit_patterns["docs"], commit, re.IGNORECASE) or re.search(self.commit_patterns["refactor"], commit, re.IGNORECASE) or re.search(self.commit_patterns["perf"], commit, re.IGNORECASE):
                    changes["Changed"].append(commit)
                    categorized = True

                # If not categorized, add to Changed
                if not categorized:
                    changes["Changed"].append(commit)

            self.logger.info(
                f"Generated changelog from {len(commits)} commits", "generate",
            )
            return changes

        except Exception as e:
            self.logger.error(
                f"Failed to generate changelog from commits: {e}", "generate",
            )
            return {}

    async def get_changelog_section(self, version: str) -> str | None:
        """Get a specific section of the changelog.

        Args:
            version: Version to get section for

        Returns:
            Changelog section content or None if not found

        """
        try:
            if not self.changelog_path.exists():
                self.logger.warning("Changelog file not found", "get_section")
                return None

            with open(self.changelog_path) as f:
                content = f.read()

            # Find the version section
            version_section = f"## [{version}]"
            if version_section not in content:
                self.logger.warning(
                    f"Version section [{version}] not found", "get_section",
                )
                return None

            # Extract section content
            lines = content.split("\n")
            section_lines = []
            in_section = False

            for line in lines:
                if line.startswith(version_section):
                    in_section = True
                    section_lines.append(line)
                elif line.startswith("## [") and line != version_section:
                    break
                elif in_section:
                    section_lines.append(line)

            section_content = "\n".join(section_lines)
            self.logger.info(
                f"Retrieved changelog section for version {version}", "get_section",
            )
            return section_content

        except Exception as e:
            self.logger.error(f"Failed to get changelog section: {e}", "get_section")
            return None

    async def validate_changelog(self) -> dict[str, Any]:
        """Validate changelog format and content.

        Returns:
            Validation results

        """
        try:
            if not self.changelog_path.exists():
                return {
                    "valid": False,
                    "errors": ["Changelog file not found"],
                    "warnings": [],
                }

            with open(self.changelog_path) as f:
                content = f.read()

            validation = {"valid": True, "errors": [], "warnings": []}

            # Check for required sections
            required_sections = ["## [Unreleased]"]
            for section in required_sections:
                if section not in content:
                    validation["errors"].append(f"Missing required section: {section}")
                    validation["valid"] = False

            # Check for proper version format
            version_pattern = r"## \[(\d+\.\d+\.\d+)\]"
            versions = re.findall(version_pattern, content)

            if not versions:
                validation["warnings"].append("No version sections found")

            # Check for unreleased section
            if "## [Unreleased]" not in content:
                validation["warnings"].append("No [Unreleased] section found")

            self.logger.info("Changelog validation completed", "validate")
            return validation

        except Exception as e:
            self.logger.error(f"Failed to validate changelog: {e}", "validate")
            return {
                "valid": False,
                "errors": [f"Validation error: {e}"],
                "warnings": [],
            }
