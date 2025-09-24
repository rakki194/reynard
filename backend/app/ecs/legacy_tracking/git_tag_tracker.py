"""Git Tag Release Tracking for Success-Advisor-8

Tracks git tags and releases related to Success-Advisor-8 activities.
"""

import asyncio
import logging
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


@dataclass
class GitTag:
    """Represents a git tag with metadata."""

    name: str
    commit_hash: str
    date: datetime
    message: str
    author: str
    is_annotated: bool


@dataclass
class SuccessAdvisor8Release:
    """Represents a Success-Advisor-8 related release."""

    tag: GitTag
    changelog_entries: list[str]
    success_advisor_activities: list[str]
    release_type: str  # 'major', 'minor', 'patch', 'other'
    version: str


class GitTagTracker:
    """Tracks git tags and releases for Success-Advisor-8 legacy tracking.
    """

    def __init__(self, repo_path: str = "."):
        """Initialize the git tag tracker.

        Args:
            repo_path: Path to the git repository

        """
        self.repo_path = Path(repo_path).resolve()
        self.success_advisor_pattern = re.compile(
            r"Success-Advisor-8|SUCCESS-ADVISOR-8|SuccessAdvisor8|success_advisor_8|Success Advisor 8|SUCCESS ADVISOR 8",
            re.IGNORECASE,
        )

    async def get_all_tags(self) -> list[GitTag]:
        """Get all git tags with metadata.

        Returns:
            List of GitTag objects

        """
        try:
            # Get all tags with metadata
            result = await self._run_git_command(
                [
                    "tag",
                    "-l",
                    "--format=%(refname:short)|%(objectname)|%(creatordate:iso)|%(contents:subject)|%(creator)|%(type)",
                ],
            )

            tags = []
            for line in result.strip().split("\n"):
                if not line.strip():
                    continue

                parts = line.split("|", 5)
                if len(parts) >= 6:
                    name, commit_hash, date_str, message, author, tag_type = parts

                    try:
                        date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                        is_annotated = tag_type == "tag"

                        tags.append(
                            GitTag(
                                name=name,
                                commit_hash=commit_hash,
                                date=date,
                                message=message or "",
                                author=author,
                                is_annotated=is_annotated,
                            ),
                        )
                    except ValueError as e:
                        logger.warning(f"Failed to parse date for tag {name}: {e}")
                        continue

            return sorted(tags, key=lambda t: t.date, reverse=True)

        except Exception as e:
            logger.error(f"Failed to get git tags: {e}")
            return []

    async def get_success_advisor_8_releases(self) -> list[SuccessAdvisor8Release]:
        """Get all releases that contain Success-Advisor-8 activities.

        Returns:
            List of SuccessAdvisor8Release objects

        """
        tags = await self.get_all_tags()
        releases = []

        for tag in tags:
            # Check if this tag contains Success-Advisor-8 activities
            activities = await self._get_tag_success_advisor_activities(tag)

            if activities:
                # Determine release type from version
                release_type = self._determine_release_type(tag.name)

                # Get changelog entries for this tag
                changelog_entries = await self._get_tag_changelog_entries(tag)

                releases.append(
                    SuccessAdvisor8Release(
                        tag=tag,
                        changelog_entries=changelog_entries,
                        success_advisor_activities=activities,
                        release_type=release_type,
                        version=tag.name,
                    ),
                )

        return releases

    async def _get_tag_success_advisor_activities(self, tag: GitTag) -> list[str]:
        """Get Success-Advisor-8 activities for a specific tag.

        Args:
            tag: GitTag object

        Returns:
            List of activity descriptions

        """
        try:
            # Get the commit message and diff for this tag
            commit_info = await self._run_git_command(
                ["show", "--name-only", "--pretty=format:%s%n%b", tag.commit_hash],
            )

            activities = []
            lines = commit_info.split("\n")

            for line in lines:
                if self.success_advisor_pattern.search(line):
                    activities.append(line.strip())

            return activities

        except Exception as e:
            logger.warning(f"Failed to get activities for tag {tag.name}: {e}")
            return []

    async def _get_tag_changelog_entries(self, tag: GitTag) -> list[str]:
        """Get changelog entries for a specific tag.

        Args:
            tag: GitTag object

        Returns:
            List of changelog entry lines

        """
        try:
            # Get the changelog content at this tag
            changelog_content = await self._run_git_command(
                ["show", f"{tag.commit_hash}:CHANGELOG.md"],
            )

            entries = []
            lines = changelog_content.split("\n")

            # Look for the version section for this tag
            in_version_section = False
            for line in lines:
                if f"[{tag.name}]" in line or f"## [{tag.name}]" in line:
                    in_version_section = True
                    continue
                if line.startswith("## [") and in_version_section:
                    # Hit next version, stop
                    break
                if in_version_section and line.strip():
                    entries.append(line.strip())

            return entries

        except Exception as e:
            logger.warning(f"Failed to get changelog entries for tag {tag.name}: {e}")
            return []

    def _determine_release_type(self, version: str) -> str:
        """Determine the release type from version string.

        Args:
            version: Version string (e.g., "v1.2.3")

        Returns:
            Release type: 'major', 'minor', 'patch', or 'other'

        """
        # Remove 'v' prefix if present
        version = version.lstrip("v")

        try:
            parts = version.split(".")
            if len(parts) >= 3:
                major, minor, patch = parts[0], parts[1], parts[2]

                # Check if it's a patch release (patch number changed)
                if patch != "0":
                    return "patch"
                # Check if it's a minor release (minor number changed)
                if minor != "0":
                    return "minor"
                # Check if it's a major release (major number changed)
                if major != "0":
                    return "major"

            return "other"

        except (ValueError, IndexError):
            return "other"

    async def _run_git_command(self, command: list[str]) -> str:
        """Run a git command and return the output.

        Args:
            command: Git command as list of strings

        Returns:
            Command output as string

        """
        try:
            process = await asyncio.create_subprocess_exec(
                "git",
                *command,
                cwd=self.repo_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                logger.warning(
                    f"Git command failed: {' '.join(command)}, stderr: {stderr.decode()}",
                )
                return ""

            return stdout.decode("utf-8")

        except Exception as e:
            logger.error(f"Failed to run git command {' '.join(command)}: {e}")
            return ""

    async def get_release_statistics(self) -> dict[str, any]:
        """Get statistics about Success-Advisor-8 releases.

        Returns:
            Dictionary with release statistics

        """
        releases = await self.get_success_advisor_8_releases()

        if not releases:
            return {
                "total_releases": 0,
                "release_types": {},
                "date_range": None,
                "most_active_period": None,
            }

        # Count release types
        release_types = {}
        for release in releases:
            release_types[release.release_type] = (
                release_types.get(release.release_type, 0) + 1
            )

        # Get date range
        dates = [release.tag.date for release in releases]
        date_range = {
            "earliest": min(dates).isoformat(),
            "latest": max(dates).isoformat(),
        }

        # Find most active period (most releases in a month)
        monthly_counts = {}
        for release in releases:
            month_key = release.tag.date.strftime("%Y-%m")
            monthly_counts[month_key] = monthly_counts.get(month_key, 0) + 1

        most_active_period = (
            max(monthly_counts.items(), key=lambda x: x[1]) if monthly_counts else None
        )

        return {
            "total_releases": len(releases),
            "release_types": release_types,
            "date_range": date_range,
            "most_active_period": most_active_period,
            "releases": [
                {
                    "version": release.version,
                    "date": release.tag.date.isoformat(),
                    "type": release.release_type,
                    "activity_count": len(release.success_advisor_activities),
                    "activities": release.success_advisor_activities,
                }
                for release in releases
            ],
        }
