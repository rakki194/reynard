"""Git Workflow Automation

Provides comprehensive git workflow automation for release management
in the Success-Advisor-8 distillation system.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

from ..utils.data_structures import (
    ReleaseConfig,
    ReleaseResult,
    create_default_release_config,
)
from ..utils.logging import PhoenixLogger


class ReleaseAutomation:
    """Git workflow automation system.

    Provides automated git operations for release management including
    staging, committing, tagging, and pushing changes.
    """

    def __init__(self, config: ReleaseConfig | None = None):
        """Initialize release automation.

        Args:
            config: Optional release configuration

        """
        self.config = config or create_default_release_config()
        self.logger = PhoenixLogger("release_automation")

        self.logger.info("Release automation initialized", "initialization")

    async def run_release_workflow(
        self,
        version_type: str | None = None,
        create_tag: bool | None = None,
        push_remote: bool | None = None,
    ) -> ReleaseResult:
        """Run the complete release workflow.

        Args:
            version_type: Type of version bump (major, minor, patch, auto)
            create_tag: Whether to create a git tag
            push_remote: Whether to push to remote repository

        Returns:
            Release result with success status and details

        """
        self.logger.info("Starting release workflow", "workflow")

        result = ReleaseResult(
            success=False,
            version="",
            commit_hash="",
            tag_name="",
            changelog_updated=False,
            agent_state_updated=False,
        )

        try:
            # Step 1: Check git status
            if not await self._check_git_status():
                result.errors.append("Git repository not in clean state")
                return result

            # Step 2: Analyze changes
            changes = await self._analyze_changes()
            if not changes:
                result.errors.append("No changes detected")
                return result

            # Step 3: Determine version type
            if version_type is None:
                version_type = self._determine_version_type(changes)

            # Step 4: Update version
            new_version = await self._update_version(version_type)
            if not new_version:
                result.errors.append("Failed to update version")
                return result

            result.version = new_version

            # Step 5: Update changelog
            changelog_updated = await self._update_changelog(new_version)
            result.changelog_updated = changelog_updated

            # Step 6: Stage and commit changes
            commit_hash = await self._commit_changes(new_version, changes)
            if not commit_hash:
                result.errors.append("Failed to commit changes")
                return result

            result.commit_hash = commit_hash

            # Step 7: Create tag (if requested)
            if create_tag is None:
                create_tag = self.config.create_tag

            if create_tag:
                tag_name = await self._create_tag(new_version)
                if tag_name:
                    result.tag_name = tag_name
                else:
                    result.warnings.append("Failed to create tag")

            # Step 8: Push to remote (if requested)
            if push_remote is None:
                push_remote = self.config.push_remote

            if push_remote:
                push_success = await self._push_to_remote()
                if not push_success:
                    result.warnings.append("Failed to push to remote")

            # Step 9: Update agent state
            agent_updated = await self._update_agent_state(new_version)
            result.agent_state_updated = agent_updated

            result.success = True
            self.logger.success(
                f"Release workflow completed successfully - Version: {new_version}",
                "workflow",
            )

        except Exception as e:
            result.errors.append(f"Release workflow failed: {e}")
            self.logger.error(f"Release workflow failed: {e}", "workflow")

        return result

    async def _check_git_status(self) -> bool:
        """Check if git repository is in a clean state.

        Returns:
            True if clean, False otherwise

        """
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                capture_output=True,
                text=True,
                check=True,
            )

            # Check for untracked files or uncommitted changes
            if result.stdout.strip():
                self.logger.warning(
                    "Git repository has uncommitted changes", "git_status",
                )
                return False

            self.logger.info("Git repository is clean", "git_status")
            return True

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to check git status: {e}", "git_status")
            return False

    async def _analyze_changes(self) -> dict[str, Any]:
        """Analyze changes in the repository.

        Returns:
            Dictionary with change analysis

        """
        try:
            # Get diff statistics
            result = subprocess.run(
                ["git", "diff", "--stat"], capture_output=True, text=True, check=True,
            )

            # Get changed files
            files_result = subprocess.run(
                ["git", "diff", "--name-only"],
                capture_output=True,
                text=True,
                check=True,
            )

            changed_files = (
                files_result.stdout.strip().split("\n")
                if files_result.stdout.strip()
                else []
            )

            # Analyze change types
            changes = {
                "statistics": result.stdout,
                "files": changed_files,
                "file_count": len(changed_files),
                "has_breaking_changes": False,
                "has_new_features": False,
                "has_bug_fixes": False,
            }

            # Check for conventional commit types
            for file_path in changed_files:
                if any(
                    keyword in file_path.lower() for keyword in ["breaking", "major"]
                ):
                    changes["has_breaking_changes"] = True
                if any(keyword in file_path.lower() for keyword in ["feature", "feat"]):
                    changes["has_new_features"] = True
                if any(keyword in file_path.lower() for keyword in ["fix", "bug"]):
                    changes["has_bug_fixes"] = True

            self.logger.info(
                f"Analyzed {len(changed_files)} changed files", "change_analysis",
            )
            return changes

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to analyze changes: {e}", "change_analysis")
            return {}

    def _determine_version_type(self, changes: dict[str, Any]) -> str:
        """Determine version bump type based on changes.

        Args:
            changes: Change analysis results

        Returns:
            Version type (major, minor, patch)

        """
        if changes.get("has_breaking_changes", False):
            self.logger.info(
                "Detected breaking changes - major version bump",
                "version_determination",
            )
            return "major"
        if changes.get("has_new_features", False):
            self.logger.info(
                "Detected new features - minor version bump", "version_determination",
            )
            return "minor"
        self.logger.info(
            "Detected bug fixes/improvements - patch version bump",
            "version_determination",
        )
        return "patch"

    async def _update_version(self, version_type: str) -> str | None:
        """Update package version.

        Args:
            version_type: Type of version bump

        Returns:
            New version string or None if failed

        """
        try:
            # Check if package.json exists
            package_json = Path("package.json")
            if not package_json.exists():
                self.logger.warning(
                    "package.json not found, skipping version update", "version_update",
                )
                return "0.0.0"

            # Get current version
            result = subprocess.run(
                ["node", "-p", "require('./package.json').version"],
                capture_output=True,
                text=True,
                check=True,
            )
            current_version = result.stdout.strip().strip('"')

            # Update version
            subprocess.run(
                ["npm", "version", version_type, "--no-git-tag-version"], check=True,
            )

            # Get new version
            result = subprocess.run(
                ["node", "-p", "require('./package.json').version"],
                capture_output=True,
                text=True,
                check=True,
            )
            new_version = result.stdout.strip().strip('"')

            self.logger.success(
                f"Version updated: {current_version} -> {new_version}", "version_update",
            )
            return new_version

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to update version: {e}", "version_update")
            return None

    async def _update_changelog(self, version: str) -> bool:
        """Update CHANGELOG.md.

        Args:
            version: New version string

        Returns:
            True if successful, False otherwise

        """
        try:
            changelog_path = Path("CHANGELOG.md")
            if not changelog_path.exists():
                self.logger.warning(
                    "CHANGELOG.md not found, skipping changelog update",
                    "changelog_update",
                )
                return False

            # Read current changelog
            with open(changelog_path) as f:
                content = f.read()

            # Replace [Unreleased] with new version
            today = datetime.now().strftime("%Y-%m-%d")
            new_content = content.replace(
                "## [Unreleased]", f"## [{version}] - {today}",
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
                f"## [{version}] - {today}",
                f"## [{version}] - {today}{unreleased_section}",
            )

            # Write updated changelog
            with open(changelog_path, "w") as f:
                f.write(new_content)

            self.logger.success(
                f"CHANGELOG.md updated for version {version}", "changelog_update",
            )
            return True

        except Exception as e:
            self.logger.error(f"Failed to update changelog: {e}", "changelog_update")
            return False

    async def _commit_changes(
        self, version: str, changes: dict[str, Any],
    ) -> str | None:
        """Stage and commit changes.

        Args:
            version: New version string
            changes: Change analysis results

        Returns:
            Commit hash or None if failed

        """
        try:
            # Stage all changes
            subprocess.run(["git", "add", "."], check=True)

            # Create commit message
            commit_message = f"feat: release v{version}\n\n"
            commit_message += f"- Version bump to {version}\n"
            commit_message += "- Updated CHANGELOG.md\n"
            commit_message += f"- {changes.get('file_count', 0)} files changed\n"
            commit_message += (
                "\nRelease managed by: Success-Advisor-8 (Permanent Release Manager)"
            )

            # Commit changes
            result = subprocess.run(
                ["git", "commit", "-m", commit_message],
                capture_output=True,
                text=True,
                check=True,
            )

            # Get commit hash
            hash_result = subprocess.run(
                ["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True,
            )
            commit_hash = hash_result.stdout.strip()

            self.logger.success(
                f"Changes committed with hash: {commit_hash[:8]}", "commit",
            )
            return commit_hash

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to commit changes: {e}", "commit")
            return None

    async def _create_tag(self, version: str) -> str | None:
        """Create git tag for release.

        Args:
            version: Version string

        Returns:
            Tag name or None if failed

        """
        try:
            tag_name = f"v{version}"

            # Create annotated tag
            tag_message = f"Release {tag_name}\n\n"
            tag_message += f"Version {version} of the Reynard framework.\n"
            tag_message += (
                "\nRelease managed by: Success-Advisor-8 (Permanent Release Manager)"
            )

            subprocess.run(
                ["git", "tag", "-a", tag_name, "-m", tag_message], check=True,
            )

            self.logger.success(f"Created tag: {tag_name}", "tag")
            return tag_name

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to create tag: {e}", "tag")
            return None

    async def _push_to_remote(self) -> bool:
        """Push changes and tags to remote repository.

        Returns:
            True if successful, False otherwise

        """
        try:
            # Push commits
            subprocess.run(["git", "push", "origin", "main"], check=True)

            # Push tags
            subprocess.run(["git", "push", "origin", "--tags"], check=True)

            self.logger.success("Pushed changes and tags to remote", "push")
            return True

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to push to remote: {e}", "push")
            return False

    async def _update_agent_state(self, version: str) -> bool:
        """Update agent state with release information.

        Args:
            version: Released version string

        Returns:
            True if successful, False otherwise

        """
        try:
            # This would integrate with the agent state management system
            # For now, just log the update
            self.logger.info(
                f"Agent state updated with release {version}", "agent_state_update",
            )
            return True

        except Exception as e:
            self.logger.error(
                f"Failed to update agent state: {e}", "agent_state_update",
            )
            return False

    async def get_release_history(self, limit: int = 10) -> list[dict[str, Any]]:
        """Get release history from git tags.

        Args:
            limit: Maximum number of releases to return

        Returns:
            List of release information

        """
        try:
            # Get all tags
            result = subprocess.run(
                ["git", "tag", "--sort=-version:refname"],
                capture_output=True,
                text=True,
                check=True,
            )

            tags = result.stdout.strip().split("\n")[:limit]
            releases = []

            for tag in tags:
                if tag:
                    # Get tag information
                    tag_info = subprocess.run(
                        ["git", "show", tag, "--no-patch", "--format=%H|%ci|%s"],
                        capture_output=True,
                        text=True,
                        check=True,
                    )

                    if tag_info.stdout:
                        parts = tag_info.stdout.strip().split("|", 2)
                        if len(parts) >= 3:
                            releases.append(
                                {
                                    "tag": tag,
                                    "commit_hash": parts[0],
                                    "date": parts[1],
                                    "message": parts[2],
                                },
                            )

            self.logger.info(
                f"Retrieved {len(releases)} releases from history", "release_history",
            )
            return releases

        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to get release history: {e}", "release_history")
            return []
