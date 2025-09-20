"""
Version Management

Provides semantic versioning and version management capabilities for
the Success-Advisor-8 distillation system.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import re
import subprocess
from typing import Dict, Any, Optional, Tuple
from pathlib import Path

from ..utils.logging import PhoenixLogger


class VersionManager:
    """
    Version management system.

    Provides semantic versioning capabilities including version parsing,
    comparison, and bumping operations.
    """

    def __init__(self):
        """Initialize version manager."""
        self.logger = PhoenixLogger("version_manager")
        self.version_pattern = re.compile(r'^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$')

        self.logger.info("Version manager initialized", "initialization")

    def parse_version(self, version_string: str) -> Optional[Dict[str, Any]]:
        """
        Parse a semantic version string.

        Args:
            version_string: Version string to parse

        Returns:
            Parsed version dictionary or None if invalid
        """
        match = self.version_pattern.match(version_string)
        if not match:
            self.logger.warning(f"Invalid version format: {version_string}", "version_parse")
            return None

        major, minor, patch, prerelease, build = match.groups()

        version_info = {
            "major": int(major),
            "minor": int(minor),
            "patch": int(patch),
            "prerelease": prerelease,
            "build": build,
            "version_string": version_string
        }

        self.logger.debug(f"Parsed version: {version_info}", "version_parse")
        return version_info

    def compare_versions(self, version1: str, version2: str) -> int:
        """
        Compare two semantic versions.

        Args:
            version1: First version string
            version2: Second version string

        Returns:
            -1 if version1 < version2, 0 if equal, 1 if version1 > version2
        """
        v1_info = self.parse_version(version1)
        v2_info = self.parse_version(version2)

        if not v1_info or not v2_info:
            self.logger.error("Invalid version strings for comparison", "version_compare")
            return 0

        # Compare major, minor, patch
        for field in ["major", "minor", "patch"]:
            if v1_info[field] < v2_info[field]:
                return -1
            elif v1_info[field] > v2_info[field]:
                return 1

        # Compare prerelease
        if v1_info["prerelease"] is None and v2_info["prerelease"] is not None:
            return 1  # version1 is release, version2 is prerelease
        elif v1_info["prerelease"] is not None and v2_info["prerelease"] is None:
            return -1  # version1 is prerelease, version2 is release
        elif v1_info["prerelease"] is not None and v2_info["prerelease"] is not None:
            # Compare prerelease strings lexicographically
            if v1_info["prerelease"] < v2_info["prerelease"]:
                return -1
            elif v1_info["prerelease"] > v2_info["prerelease"]:
                return 1

        return 0  # Versions are equal

    def bump_version(self, current_version: str, bump_type: str) -> Optional[str]:
        """
        Bump a semantic version.

        Args:
            current_version: Current version string
            bump_type: Type of bump (major, minor, patch)

        Returns:
            New version string or None if invalid
        """
        version_info = self.parse_version(current_version)
        if not version_info:
            return None

        new_version_info = version_info.copy()

        if bump_type == "major":
            new_version_info["major"] += 1
            new_version_info["minor"] = 0
            new_version_info["patch"] = 0
        elif bump_type == "minor":
            new_version_info["minor"] += 1
            new_version_info["patch"] = 0
        elif bump_type == "patch":
            new_version_info["patch"] += 1
        else:
            self.logger.error(f"Invalid bump type: {bump_type}", "version_bump")
            return None

        # Clear prerelease and build metadata
        new_version_info["prerelease"] = None
        new_version_info["build"] = None

        # Construct new version string
        new_version = f"{new_version_info['major']}.{new_version_info['minor']}.{new_version_info['patch']}"

        self.logger.info(f"Version bumped: {current_version} -> {new_version} ({bump_type})", "version_bump")
        return new_version

    async def get_current_version(self, package_path: str = ".") -> Optional[str]:
        """
        Get current version from package.json.

        Args:
            package_path: Path to package directory

        Returns:
            Current version string or None if not found
        """
        try:
            package_json = Path(package_path) / "package.json"
            if not package_json.exists():
                self.logger.warning("package.json not found", "version_get")
                return None

            result = subprocess.run(
                ["node", "-p", "require('./package.json').version"],
                cwd=package_path,
                capture_output=True,
                text=True,
                check=True
            )

            version = result.stdout.strip().strip('"')
            self.logger.info(f"Current version: {version}", "version_get")
            return version

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to get current version: {e}", "version_get")
            return None

    async def set_version(self, version: str, package_path: str = ".") -> bool:
        """
        Set version in package.json.

        Args:
            version: Version string to set
            package_path: Path to package directory

        Returns:
            True if successful, False otherwise
        """
        try:
            # Validate version format
            if not self.parse_version(version):
                self.logger.error(f"Invalid version format: {version}", "version_set")
                return False

            package_json = Path(package_path) / "package.json"
            if not package_json.exists():
                self.logger.warning("package.json not found", "version_set")
                return False

            # Update version using npm
            result = subprocess.run(
                ["npm", "version", version, "--no-git-tag-version"],
                cwd=package_path,
                capture_output=True,
                text=True,
                check=True
            )

            self.logger.success(f"Version set to: {version}", "version_set")
            return True

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to set version: {e}", "version_set")
            return False

    async def get_latest_tag(self) -> Optional[str]:
        """
        Get the latest git tag.

        Returns:
            Latest tag string or None if no tags found
        """
        try:
            result = subprocess.run(
                ["git", "describe", "--tags", "--abbrev=0"],
                capture_output=True,
                text=True,
                check=True
            )

            tag = result.stdout.strip()
            self.logger.info(f"Latest tag: {tag}", "tag_get")
            return tag

        except subprocess.CalledProcessError:
            self.logger.warning("No git tags found", "tag_get")
            return None

    async def get_all_tags(self) -> list[str]:
        """
        Get all git tags sorted by version.

        Returns:
            List of tag strings
        """
        try:
            result = subprocess.run(
                ["git", "tag", "--sort=-version:refname"],
                capture_output=True,
                text=True,
                check=True
            )

            tags = [tag.strip() for tag in result.stdout.strip().split('\n') if tag.strip()]
            self.logger.info(f"Found {len(tags)} tags", "tags_get")
            return tags

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to get tags: {e}", "tags_get")
            return []

    def is_valid_version(self, version: str) -> bool:
        """
        Check if a version string is valid semantic version.

        Args:
            version: Version string to validate

        Returns:
            True if valid, False otherwise
        """
        return self.parse_version(version) is not None

    def get_version_info(self, version: str) -> Dict[str, Any]:
        """
        Get detailed version information.

        Args:
            version: Version string

        Returns:
            Version information dictionary
        """
        version_info = self.parse_version(version)
        if not version_info:
            return {"valid": False, "error": "Invalid version format"}

        return {
            "valid": True,
            "version": version,
            "major": version_info["major"],
            "minor": version_info["minor"],
            "patch": version_info["patch"],
            "prerelease": version_info["prerelease"],
            "build": version_info["build"],
            "is_prerelease": version_info["prerelease"] is not None,
            "is_release": version_info["prerelease"] is None
        }

    async def suggest_next_version(self, current_version: str, change_type: str) -> Optional[str]:
        """
        Suggest next version based on change type.

        Args:
            current_version: Current version string
            change_type: Type of changes (breaking, feature, fix)

        Returns:
            Suggested next version or None if invalid
        """
        if change_type == "breaking":
            return self.bump_version(current_version, "major")
        elif change_type == "feature":
            return self.bump_version(current_version, "minor")
        elif change_type == "fix":
            return self.bump_version(current_version, "patch")
        else:
            self.logger.warning(f"Unknown change type: {change_type}", "version_suggest")
            return None
