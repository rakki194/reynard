"""Legacy Tracking Service

ECS-integrated service for comprehensive Success-Advisor-8 legacy tracking
and analysis across the Reynard ecosystem.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from app.ecs.legacy_tracking import SuccessAdvisor8LegacyTracker, UnifiedChangelogParser
from app.ecs.legacy_tracking.git_tag_tracker import GitTagTracker
from app.ecs.postgres_service import PostgresECSWorldService

logger = logging.getLogger(__name__)


class LegacyTrackingService:
    """ECS-integrated legacy tracking service for Success-Advisor-8.

    Provides comprehensive tracking and analysis of Success-Advisor-8
    activities, movements, and legacy across the Reynard ecosystem.
    """

    def __init__(self, ecs_service: PostgresECSWorldService, codebase_path: str = "."):
        """Initialize the legacy tracking service.

        Args:
            ecs_service: Existing PostgreSQL ECS world service
            codebase_path: Path to the codebase for analysis

        """
        self.ecs_service = ecs_service
        self.codebase_path = Path(codebase_path)
        # Fix: Use parent directory for backend, as CHANGELOG.md is in the project root
        if self.codebase_path.name == "backend":
            tracker_codebase_path = str(self.codebase_path.parent)
        else:
            tracker_codebase_path = str(self.codebase_path)
        self.legacy_tracker = SuccessAdvisor8LegacyTracker(
            tracker_codebase_path, "CHANGELOG.md",
        )
        # Fix: Use the same path logic for the changelog parser
        if self.codebase_path.name == "backend":
            changelog_parser_path = str(self.codebase_path.parent / "CHANGELOG.md")
        else:
            changelog_parser_path = str(self.codebase_path / "CHANGELOG.md")
        self.changelog_parser = UnifiedChangelogParser(changelog_parser_path)
        self.git_tag_tracker = GitTagTracker(str(self.codebase_path.parent))
        # Use the changelog_parser directly since SuccessAdvisor8ChangelogAnalyzer was removed

        logger.info(
            "LegacyTrackingService initialized with ECS integration and git tag tracking",
        )

    async def get_success_advisor_8_activities(self) -> list[dict[str, Any]]:
        """Get all Success-Advisor-8 activities from CHANGELOG.

        Returns:
            List of Success-Advisor-8 activities

        """
        try:
            activities = self.changelog_parser.parse_success_advisor_8_activities()
            return [
                activity.__dict__ if hasattr(activity, "__dict__") else activity
                for activity in activities
            ]
        except Exception as e:
            logger.error(f"Error getting Success-Advisor-8 activities: {e}")
            return []

    async def get_codebase_movements(self) -> list[dict[str, Any]]:
        """Get Success-Advisor-8 code movements across the codebase.

        Returns:
            List of code movements

        """
        try:
            movements = await self.legacy_tracker.scan_codebase_movements()
            return [
                movement.__dict__ if hasattr(movement, "__dict__") else movement
                for movement in movements
            ]
        except Exception as e:
            logger.error(f"Error getting codebase movements: {e}")
            return []

    async def generate_legacy_report(self) -> dict[str, Any]:
        """Generate comprehensive legacy tracking report.

        Returns:
            Complete legacy report with ECS integration

        """
        try:
            # Get changelog activities
            changelog_activities = await self.get_success_advisor_8_activities()

            # Get codebase movements
            codebase_movements = await self.get_codebase_movements()

            # Get ECS agent data
            ecs_agent_data = await self._get_ecs_agent_data()

            # Get activity analysis
            activity_analysis = self.changelog_parser.analyze_activity_trends()

            # Generate summary
            summary = self.changelog_parser.generate_activity_summary()

            report = {
                "total_activities": len(changelog_activities),
                "total_code_movements": len(codebase_movements),
                "changelog_activities": changelog_activities,
                "codebase_movements": codebase_movements,
                "ecs_agent_data": ecs_agent_data,
                "activity_analysis": activity_analysis,
                "summary": summary,
                "last_updated": datetime.now().isoformat(),
                "codebase_path": str(self.codebase_path),
                "parser_info": self.changelog_parser.get_parser_info(),
            }

            logger.info(
                f"Generated legacy report with {len(changelog_activities)} activities and {len(codebase_movements)} movements",
            )
            return report

        except Exception as e:
            logger.error(f"Error generating legacy report: {e}")
            return {"error": str(e), "last_updated": datetime.now().isoformat()}

    async def track_success_advisor_8_activity(
        self, activity: str, context: dict[str, Any],
    ) -> bool:
        """Track a new Success-Advisor-8 activity.

        Args:
            activity: Description of the activity
            context: Additional context

        Returns:
            True if tracking successful, False otherwise

        """
        try:
            # Record in ECS database
            await self.ecs_service.record_interaction(
                agent_id="success-advisor-8",
                interaction_type="legacy_activity",
                description=activity,
                metadata=context,
            )

            logger.info(f"Tracked Success-Advisor-8 activity: {activity}")
            return True

        except Exception as e:
            logger.error(f"Error tracking Success-Advisor-8 activity: {e}")
            return False

    async def get_activity_trends(self) -> dict[str, Any]:
        """Get activity trends analysis.

        Returns:
            Activity trends and statistics

        """
        try:
            return self.changelog_parser.analyze_activity_trends()
        except Exception as e:
            logger.error(f"Error getting activity trends: {e}")
            return {"error": str(e)}

    async def get_activity_summary(self) -> str:
        """Get human-readable activity summary.

        Returns:
            Formatted activity summary

        """
        try:
            return self.changelog_parser.generate_activity_summary()
        except Exception as e:
            logger.error(f"Error getting activity summary: {e}")
            return f"❌ Error generating summary: {e}"

    async def export_legacy_data(self, output_path: str) -> bool:
        """Export legacy tracking data to JSON file.

        Args:
            output_path: Path to output JSON file

        Returns:
            True if export successful, False otherwise

        """
        try:
            report = await self.generate_legacy_report()

            # Write to file
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(json.dumps(report, indent=2, default=str))

            logger.info(f"Exported legacy data to {output_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to export legacy data: {e}")
            return False

    async def _get_ecs_agent_data(self) -> dict[str, Any] | None:
        """Get Success-Advisor-8 data from ECS database."""
        try:
            # Try to find Success-Advisor-8 agent
            agent = await self.ecs_service.get_agent_by_name("Success-Advisor-8")
            if not agent:
                # Try alternative names
                agent = await self.ecs_service.get_agent_by_name("success-advisor-8")

            if agent:
                return {
                    "agent_id": agent.agent_id,
                    "name": agent.name,
                    "spirit": agent.spirit,
                    "style": agent.style,
                    "generation": agent.generation,
                    "active": agent.active,
                    "created_at": (
                        agent.created_at.isoformat() if agent.created_at else None
                    ),
                    "last_activity": (
                        agent.last_activity.isoformat() if agent.last_activity else None
                    ),
                }
            return None

        except Exception as e:
            logger.error(f"Error getting ECS agent data: {e}")
            return None

    async def get_parser_status(self) -> dict[str, Any]:
        """Get parser status and information.

        Returns:
            Parser status information

        """
        try:
            return self.changelog_parser.get_parser_info()
        except Exception as e:
            logger.error(f"Error getting parser status: {e}")
            return {"error": str(e)}

    async def refresh_data(self) -> bool:
        """Refresh all legacy tracking data.

        Returns:
            True if refresh successful, False otherwise

        """
        try:
            # Reinitialize parsers with correct path logic
            if self.codebase_path.name == "backend":
                changelog_parser_path = str(self.codebase_path.parent / "CHANGELOG.md")
            else:
                changelog_parser_path = str(self.codebase_path / "CHANGELOG.md")
            self.changelog_parser = UnifiedChangelogParser(changelog_parser_path)
            # Use the changelog_parser directly since SuccessAdvisor8ChangelogAnalyzer was removed

            logger.info("Legacy tracking data refreshed successfully")
            return True

        except Exception as e:
            logger.error(f"Error refreshing legacy tracking data: {e}")
            return False

    async def get_success_advisor_8_releases(self) -> list[dict[str, Any]]:
        """Get all Success-Advisor-8 related releases from git tags.

        Returns:
            List of release information dictionaries

        """
        try:
            releases = await self.git_tag_tracker.get_success_advisor_8_releases()

            return [
                {
                    "version": release.version,
                    "date": release.tag.date.isoformat(),
                    "commit_hash": release.tag.commit_hash,
                    "author": release.tag.author,
                    "message": release.tag.message,
                    "release_type": release.release_type,
                    "activity_count": len(release.success_advisor_activities),
                    "activities": release.success_advisor_activities,
                    "changelog_entries": release.changelog_entries,
                }
                for release in releases
            ]

        except Exception as e:
            logger.error(f"Error getting Success-Advisor-8 releases: {e}")
            return []

    async def get_release_statistics(self) -> dict[str, Any]:
        """Get statistics about Success-Advisor-8 releases.

        Returns:
            Dictionary with release statistics

        """
        try:
            return await self.git_tag_tracker.get_release_statistics()
        except Exception as e:
            logger.error(f"Error getting release statistics: {e}")
            return {
                "total_releases": 0,
                "release_types": {},
                "date_range": None,
                "most_active_period": None,
            }

    async def get_all_git_tags(self) -> list[dict[str, Any]]:
        """Get all git tags with metadata.

        Returns:
            List of git tag information dictionaries

        """
        try:
            tags = await self.git_tag_tracker.get_all_tags()

            return [
                {
                    "name": tag.name,
                    "commit_hash": tag.commit_hash,
                    "date": tag.date.isoformat(),
                    "message": tag.message,
                    "author": tag.author,
                    "is_annotated": tag.is_annotated,
                }
                for tag in tags
            ]

        except Exception as e:
            logger.error(f"Error getting git tags: {e}")
            return []

    async def close(self) -> None:
        """Close the legacy tracking service."""
        try:
            logger.info("LegacyTrackingService closed successfully")
        except Exception as e:
            logger.error(f"Error closing LegacyTrackingService: {e}")
