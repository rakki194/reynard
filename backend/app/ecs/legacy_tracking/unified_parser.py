"""Unified CHANGELOG Parser for Success-Advisor-8 Legacy Tracking

Leverages existing CHANGELOG parsing implementations and extends them
for comprehensive Success-Advisor-8 legacy tracking and analysis.
"""

import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

# Add the scripts directory to the path to import existing parser
sys.path.append(str(Path(__file__).parent.parent.parent.parent.parent / "scripts"))

try:
    from agent_diagram.core.contribution import AgentContribution
    from agent_diagram.core.parser import ChangelogParser
except ImportError:
    # Fallback if the existing parser is not available
    ChangelogParser = None
    AgentContribution = None

import logging

from .success_advisor_8_tracker import (
    SuccessAdvisor8Activity,
)

logger = logging.getLogger(__name__)


class ChangelogParser:
    """Unified CHANGELOG parser that leverages existing implementations
    and extends them for Success-Advisor-8 legacy tracking.
    """

    def __init__(self, changelog_path: str = "CHANGELOG.md"):
        """Initialize the unified parser.

        Args:
            changelog_path: Path to the CHANGELOG.md file

        """
        self.changelog_path = Path(changelog_path)
        # More comprehensive pattern to catch all Success-Advisor-8 variations
        self.success_advisor_pattern = re.compile(
            r"Success-Advisor-8|SUCCESS-ADVISOR-8|SuccessAdvisor8|success_advisor_8|Success Advisor 8|SUCCESS ADVISOR 8",
            re.IGNORECASE,
        )

        # Initialize existing parser if available
        if ChangelogParser:
            try:
                self.existing_parser = ChangelogParser(str(self.changelog_path))
                self._existing_parser_available = True
                logger.info("Successfully initialized with existing ChangelogParser")
            except Exception as e:
                logger.warning(f"Failed to initialize existing ChangelogParser: {e}")
                self.existing_parser = None
                self._existing_parser_available = False
        else:
            self.existing_parser = None
            self._existing_parser_available = False
            logger.warning(
                "Existing ChangelogParser not available, using fallback implementation",
            )

    def parse_success_advisor_8_activities(self) -> list[SuccessAdvisor8Activity]:
        """Parse CHANGELOG for Success-Advisor-8 specific activities.

        Returns:
            List of Success-Advisor-8 activities found in the changelog

        """
        if self.existing_parser:
            return self._parse_with_existing_parser()
        return self._parse_with_fallback()

    def _parse_with_existing_parser(self) -> list[SuccessAdvisor8Activity]:
        """Parse using the existing agent diagram parser."""
        try:
            # Use existing parser to get all contributions
            contributions = self.existing_parser.parse_changelog()

            # Filter and convert to Success-Advisor-8 activities
            activities = []
            for contribution in contributions:
                if self.success_advisor_pattern.search(contribution.description):
                    activity = self._convert_contribution_to_activity(contribution)
                    activities.append(activity)

            logger.info(
                f"Found {len(activities)} Success-Advisor-8 activities using existing parser",
            )

            # If existing parser didn't find any Success-Advisor-8 activities, fall back
            if len(activities) == 0:
                logger.info(
                    "No Success-Advisor-8 activities found in existing parser, falling back to fallback parser",
                )
                return self._parse_with_fallback()

            return activities

        except Exception as e:
            logger.error(f"Error using existing parser: {e}")
            return self._parse_with_fallback()

    def _parse_with_fallback(self) -> list[SuccessAdvisor8Activity]:
        """Fallback parser implementation."""
        if not self.changelog_path.exists():
            logger.warning(f"CHANGELOG not found at {self.changelog_path}")
            return []

        activities = []
        content = self.changelog_path.read_text(encoding="utf-8")
        lines = content.split("\n")

        current_version = None
        current_date = None

        for i, line in enumerate(lines):
            # Extract version and date from headers
            version_match = re.match(r"^##\s+\[?([^\]]+)\]?", line)
            if version_match:
                current_version = version_match.group(1)
                # Look for date in the same line or next line
                date_match = re.search(r"(\d{4}-\d{2}-\d{2})", line)
                if date_match:
                    current_date = datetime.fromisoformat(date_match.group(1))
                continue

            # Check for Success-Advisor-8 references
            if self.success_advisor_pattern.search(line):
                activity = self._extract_activity_from_line(
                    line, i, current_version, current_date,
                )
                if activity:
                    activities.append(activity)

        logger.info(
            f"Found {len(activities)} Success-Advisor-8 activities using fallback parser",
        )
        return activities

    def _convert_contribution_to_activity(
        self, contribution: AgentContribution,
    ) -> SuccessAdvisor8Activity:
        """Convert existing AgentContribution to Success-Advisor-8 activity."""
        return SuccessAdvisor8Activity(
            activity_id=f"sa8-{hash(contribution.title) % 10000}",
            activity_type=self._classify_activity_type(contribution.description),
            description=contribution.description,
            timestamp=datetime.now(),  # Could be extracted from changelog
            context={
                "agent_name": contribution.agent_name,
                "title": contribution.title,
                "category": contribution.category,
                "source": "existing_parser",
            },
        )

    def _extract_activity_from_line(
        self,
        line: str,
        line_number: int,
        version: str | None,
        date: datetime | None,
    ) -> SuccessAdvisor8Activity | None:
        """Extract Success-Advisor-8 activity from changelog line."""
        try:
            # Determine activity type
            activity_type = self._classify_activity_type(line)

            # Generate activity ID
            activity_id = (
                f"sa8-{version or 'unreleased'}-{line_number}-{hash(line) % 10000}"
            )

            # Extract description
            description = line.strip("- ").strip()

            return SuccessAdvisor8Activity(
                activity_id=activity_id,
                activity_type=activity_type,
                description=description,
                timestamp=date or datetime.now(),
                version=version,
                file_path=str(self.changelog_path),
                line_number=line_number,
                context={"source": "fallback_parser", "raw_line": line},
            )

        except Exception as e:
            logger.error(f"Failed to extract activity from line {line_number}: {e}")
            return None

    def _classify_activity_type(self, line: str) -> str:
        """Classify the type of Success-Advisor-8 activity."""
        line_lower = line.lower()

        if any(keyword in line_lower for keyword in ["release", "version", "bump"]):
            return "release"
        if any(keyword in line_lower for keyword in ["add", "feature", "implement"]):
            return "feature"
        if any(keyword in line_lower for keyword in ["fix", "bug", "error"]):
            return "fix"
        if any(
            keyword in line_lower
            for keyword in ["refactor", "restructure", "reorganize"]
        ):
            return "refactor"
        if any(
            keyword in line_lower for keyword in ["doc", "documentation", "guide"]
        ):
            return "documentation"
        return "other"

    def analyze_activity_trends(self) -> dict[str, Any]:
        """Analyze activity trends and patterns."""
        activities = self.parse_success_advisor_8_activities()
        if not activities:
            return {"error": "No Success-Advisor-8 activities found to analyze."}

        activity_types = {}
        versions = {}
        earliest_date = None
        latest_date = None

        for activity in activities:
            activity_types[activity.activity_type] = (
                activity_types.get(activity.activity_type, 0) + 1
            )
            if activity.version:
                versions[activity.version] = versions.get(activity.version, 0) + 1

            if earliest_date is None or activity.timestamp < earliest_date:
                earliest_date = activity.timestamp
            if latest_date is None or activity.timestamp > latest_date:
                latest_date = activity.timestamp

        time_range = {
            "earliest": earliest_date,
            "latest": latest_date,
            "duration_days": (
                (latest_date - earliest_date).days
                if earliest_date and latest_date
                else 0
            ),
        }

        return {
            "activity_types": activity_types,
            "versions": versions,
            "time_range": time_range,
            "total_activities": len(activities),
        }

    def generate_activity_summary(self) -> str:
        """Generate a human-readable summary of Success-Advisor-8 activities."""
        analysis = self.analyze_activity_trends()

        if "error" in analysis:
            return f"❌ {analysis['error']}"

        summary = "🦁 Success-Advisor-8 Activity Summary\n\n"
        summary += f"📊 Total Activities: {analysis['total_activities']}\n"

        if analysis["time_range"]["earliest"]:
            summary += f"📅 Date Range: {analysis['time_range']['earliest'].strftime('%Y-%m-%d')} to {analysis['time_range']['latest'].strftime('%Y-%m-%d')}\n"

        summary += "\n🎯 Activity Types:\n"
        for activity_type, count in analysis["activity_types"].items():
            summary += f"  - {activity_type.title()}: {count}\n"

        if analysis["versions"]:
            summary += "\n📦 Versions:\n"
            for version, count in analysis["versions"].items():
                summary += f"  - {version}: {count} activities\n"

        return summary

    def get_parser_info(self) -> dict[str, Any]:
        """Get information about the parser implementation."""
        return {
            "parser_type": "unified",
            "existing_parser_available": self.existing_parser is not None,
            "changelog_path": str(self.changelog_path),
            "changelog_exists": self.changelog_path.exists(),
            "success_advisor_pattern": self.success_advisor_pattern.pattern,
        }

    def get_changelog_stats(self) -> dict[str, Any]:
        """Get statistics about the CHANGELOG file."""
        if not self.changelog_path.exists():
            return {"error": "CHANGELOG file not found"}

        try:
            content = self.changelog_path.read_text(encoding="utf-8")
            lines = content.split("\n")

            # Count Success-Advisor-8 references
            success_advisor_lines = [
                line for line in lines if self.success_advisor_pattern.search(line)
            ]

            return {
                "total_lines": len(lines),
                "total_characters": len(content),
                "success_advisor_references": len(success_advisor_lines),
                "file_size_bytes": self.changelog_path.stat().st_size,
                "last_modified": datetime.fromtimestamp(
                    self.changelog_path.stat().st_mtime,
                ).isoformat(),
            }
        except Exception as e:
            return {"error": f"Failed to read CHANGELOG: {e}"}

    def validate_changelog_format(self) -> dict[str, Any]:
        """Validate CHANGELOG format and structure."""
        if not self.changelog_path.exists():
            return {"valid": False, "error": "CHANGELOG file not found"}

        try:
            content = self.changelog_path.read_text(encoding="utf-8")
            lines = content.split("\n")

            validation_results = {
                "valid": True,
                "warnings": [],
                "errors": [],
                "sections": [],
                "version_headers": [],
            }

            # Check for version headers
            version_pattern = re.compile(r"^##\s*\[([^\]]+)\]", re.MULTILINE)
            version_matches = version_pattern.findall(content)
            validation_results["version_headers"] = version_matches

            # Check for proper section structure
            section_pattern = re.compile(
                r"^###\s+(Added|Changed|Deprecated|Removed|Fixed|Security)",
                re.MULTILINE,
            )
            section_matches = section_pattern.findall(content)
            validation_results["sections"] = section_matches

            # Check for Success-Advisor-8 references
            success_advisor_lines = [
                line for line in lines if self.success_advisor_pattern.search(line)
            ]
            if not success_advisor_lines:
                validation_results["warnings"].append(
                    "No Success-Advisor-8 references found in CHANGELOG",
                )

            # Check for proper date format in version headers
            date_pattern = re.compile(r"\[([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})")
            date_matches = date_pattern.findall(content)
            if not date_matches:
                validation_results["warnings"].append(
                    "No properly formatted dates found in version headers",
                )

            return validation_results

        except Exception as e:
            return {"valid": False, "error": f"Failed to validate CHANGELOG: {e}"}

    def _convert_to_success_advisor_activity(
        self, contribution,
    ) -> SuccessAdvisor8Activity:
        """Convert an existing AgentContribution to a SuccessAdvisor8Activity."""
        activity_type = self._classify_activity_type(contribution.description)
        return SuccessAdvisor8Activity(
            activity_id=f"sa8-{hash(contribution.title + contribution.description) % 10000}",
            activity_type=activity_type,
            description=contribution.description,
            timestamp=datetime.now(),  # Placeholder, ideally extracted from changelog date
            context={
                "agent_name": contribution.agent_name,
                "title": contribution.title,
                "category": contribution.category,
                "source": "unified_changelog_parser",
            },
        )


class SuccessAdvisor8ChangelogAnalyzer:
    """Advanced analyzer for Success-Advisor-8 changelog activities.
    """

    def __init__(self, parser: ChangelogParser):
        """Initialize the analyzer.

        Args:
            parser: Unified changelog parser instance

        """
        self.parser = parser

    def analyze_activity_trends(self) -> dict[str, Any]:
        """Analyze trends in Success-Advisor-8 activities."""
        activities = self.parser.parse_success_advisor_8_activities()

        if not activities:
            return {"error": "No activities found"}

        # Activity type distribution
        activity_types = {}
        for activity in activities:
            activity_types[activity.activity_type] = (
                activity_types.get(activity.activity_type, 0) + 1
            )

        # Version distribution
        versions = {}
        for activity in activities:
            if activity.version:
                versions[activity.version] = versions.get(activity.version, 0) + 1

        # Time analysis
        timestamps = [
            activity.timestamp for activity in activities if activity.timestamp
        ]
        time_range = {
            "earliest": min(timestamps) if timestamps else None,
            "latest": max(timestamps) if timestamps else None,
            "total_activities": len(activities),
        }

        return {
            "activity_types": activity_types,
            "versions": versions,
            "time_range": time_range,
            "total_activities": len(activities),
        }

    def generate_activity_summary(self) -> str:
        """Generate a human-readable summary of Success-Advisor-8 activities."""
        analysis = self.analyze_activity_trends()

        if "error" in analysis:
            return f"❌ {analysis['error']}"

        summary = "🦁 Success-Advisor-8 Activity Summary\n\n"
        summary += f"📊 Total Activities: {analysis['total_activities']}\n"

        if analysis["time_range"]["earliest"]:
            summary += f"📅 Date Range: {analysis['time_range']['earliest'].strftime('%Y-%m-%d')} to {analysis['time_range']['latest'].strftime('%Y-%m-%d')}\n"

        summary += "\n🎯 Activity Types:\n"
        for activity_type, count in analysis["activity_types"].items():
            summary += f"  - {activity_type.title()}: {count}\n"

        if analysis["versions"]:
            summary += "\n📦 Versions:\n"
            for version, count in analysis["versions"].items():
                summary += f"  - {version}: {count} activities\n"

        return summary

    def get_parser_info(self) -> dict[str, Any]:
        """Get parser status and information.

        Returns:
            Dictionary containing parser information

        """
        return {
            "parser_type": "unified",
            "existing_parser_available": self._existing_parser_available,
            "changelog_path": str(self.changelog_path),
            "changelog_exists": self.changelog_path.exists(),
            "base_parser_type": (
                type(self.existing_parser).__name__ if self.existing_parser else None
            ),
            "success_advisor_pattern": self.success_advisor_pattern.pattern,
        }

    def get_changelog_stats(self) -> dict[str, Any]:
        """Get statistics about the CHANGELOG file.

        Returns:
            Dictionary containing changelog statistics

        """
        if not self.changelog_path.exists():
            return {"error": "CHANGELOG file not found"}

        try:
            content = self.changelog_path.read_text(encoding="utf-8")
            lines = content.split("\n")

            # Count Success-Advisor-8 references
            success_advisor_lines = [
                line for line in lines if self.success_advisor_pattern.search(line)
            ]

            return {
                "total_lines": len(lines),
                "total_characters": len(content),
                "success_advisor_references": len(success_advisor_lines),
                "file_size_bytes": self.changelog_path.stat().st_size,
                "last_modified": datetime.fromtimestamp(
                    self.changelog_path.stat().st_mtime,
                ).isoformat(),
            }
        except Exception as e:
            return {"error": f"Failed to read CHANGELOG: {e}"}

    def validate_changelog_format(self) -> dict[str, Any]:
        """Validate CHANGELOG format and structure.

        Returns:
            Dictionary containing validation results

        """
        if not self.changelog_path.exists():
            return {"valid": False, "error": "CHANGELOG file not found"}

        try:
            content = self.changelog_path.read_text(encoding="utf-8")
            lines = content.split("\n")

            validation_results = {
                "valid": True,
                "warnings": [],
                "errors": [],
                "sections": [],
                "version_headers": [],
            }

            # Check for version headers
            version_pattern = re.compile(r"^##\s*\[([^\]]+)\]", re.MULTILINE)
            version_matches = version_pattern.findall(content)
            validation_results["version_headers"] = version_matches

            # Check for proper section structure
            section_pattern = re.compile(
                r"^###\s+(Added|Changed|Deprecated|Removed|Fixed|Security)",
                re.MULTILINE,
            )
            section_matches = section_pattern.findall(content)
            validation_results["sections"] = section_matches

            # Check for Success-Advisor-8 references
            success_advisor_lines = [
                line for line in lines if self.success_advisor_pattern.search(line)
            ]
            if not success_advisor_lines:
                validation_results["warnings"].append(
                    "No Success-Advisor-8 references found in CHANGELOG",
                )

            # Check for proper date format in version headers
            date_pattern = re.compile(r"\[([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})")
            date_matches = date_pattern.findall(content)
            if not date_matches:
                validation_results["warnings"].append(
                    "No properly formatted dates found in version headers",
                )

            return validation_results

        except Exception as e:
            return {"valid": False, "error": f"Failed to validate CHANGELOG: {e}"}
