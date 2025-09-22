"""
Modular Legacy Tracking Service

Coordinates separate tracking systems for Success-Advisor-8 genome information
and PHEONIX project activities in a modular, organized architecture.

This service provides clean separation of concerns between:
1. Success-Advisor-8 genome information collection
2. PHEONIX project activity tracking
3. General legacy tracking (existing system)
"""

import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.ecs.legacy_tracking.genome_tracker import SuccessAdvisor8GenomeTracker
from app.ecs.legacy_tracking.git_tag_tracker import GitTagTracker
from app.ecs.legacy_tracking.phoenix_project_tracker import PhoenixProjectTracker
from app.ecs.legacy_tracking.success_advisor_8_tracker import (
    SuccessAdvisor8LegacyTracker,
)
from app.ecs.legacy_tracking.unified_parser import UnifiedChangelogParser
from app.ecs.postgres_service import PostgresECSWorldService

logger = logging.getLogger(__name__)


class ModularLegacyTrackingService:
    """
    Modular legacy tracking service with separate concerns for different tracking needs.

    Provides organized access to:
    - Success-Advisor-8 genome information collection
    - PHEONIX project activity tracking
    - General legacy tracking (existing functionality)
    """

    def __init__(self, ecs_service: PostgresECSWorldService, codebase_path: str = "."):
        """
        Initialize the modular legacy tracking service.

        Args:
            ecs_service: Existing PostgreSQL ECS world service
            codebase_path: Path to the codebase for analysis
        """
        self.ecs_service = ecs_service
        self.codebase_path = Path(codebase_path)

        # Determine correct paths for backend vs other contexts
        if self.codebase_path.name == "backend":
            tracker_codebase_path = str(self.codebase_path.parent)
            changelog_parser_path = str(self.codebase_path.parent / "CHANGELOG.md")
            git_tracker_path = str(self.codebase_path.parent)
        else:
            tracker_codebase_path = str(self.codebase_path)
            changelog_parser_path = str(self.codebase_path / "CHANGELOG.md")
            git_tracker_path = str(self.codebase_path)

        # Initialize specialized trackers
        self.genome_tracker = SuccessAdvisor8GenomeTracker(
            tracker_codebase_path, "CHANGELOG.md"
        )
        self.phoenix_tracker = PhoenixProjectTracker(
            tracker_codebase_path, "CHANGELOG.md"
        )

        # Initialize general legacy tracking (existing functionality)
        self.legacy_tracker = SuccessAdvisor8LegacyTracker(
            tracker_codebase_path, "CHANGELOG.md"
        )
        self.changelog_parser = UnifiedChangelogParser(changelog_parser_path)
        self.git_tag_tracker = GitTagTracker(git_tracker_path)

        logger.info(
            "ModularLegacyTrackingService initialized with specialized trackers"
        )

    # ============================================================================
    # SUCCESS-ADVISOR-8 GENOME INFORMATION COLLECTION
    # ============================================================================

    async def get_genome_activities(self) -> List[Dict[str, Any]]:
        """
        Get Success-Advisor-8 genome-relevant activities.

        Returns:
            List of genome activities focused on behavioral patterns and capabilities
        """
        try:
            activities = await self.genome_tracker.collect_genome_activities()
            return [
                activity.__dict__ if hasattr(activity, "__dict__") else activity
                for activity in activities
            ]
        except Exception as e:
            logger.error(f"Error getting genome activities: {e}")
            return []

    async def get_genome_summary(self) -> Dict[str, Any]:
        """
        Get comprehensive Success-Advisor-8 genome summary.

        Returns:
            Complete genome analysis including traits, capabilities, and behavioral patterns
        """
        try:
            return await self.genome_tracker.generate_genome_summary()
        except Exception as e:
            logger.error(f"Error generating genome summary: {e}")
            return {"error": str(e)}

    async def get_behavioral_patterns(self) -> List[Dict[str, Any]]:
        """
        Get Success-Advisor-8 behavioral patterns.

        Returns:
            List of identified behavioral patterns
        """
        try:
            await self.genome_tracker.collect_genome_activities()
            patterns = await self.genome_tracker.analyze_behavioral_patterns()
            return [
                pattern.__dict__ if hasattr(pattern, "__dict__") else pattern
                for pattern in patterns
            ]
        except Exception as e:
            logger.error(f"Error getting behavioral patterns: {e}")
            return []

    async def get_capability_profiles(self) -> List[Dict[str, Any]]:
        """
        Get Success-Advisor-8 capability profiles.

        Returns:
            List of capability profiles based on activities
        """
        try:
            await self.genome_tracker.collect_genome_activities()
            profiles = await self.genome_tracker.build_capability_profiles()
            return [
                profile.__dict__ if hasattr(profile, "__dict__") else profile
                for profile in profiles
            ]
        except Exception as e:
            logger.error(f"Error getting capability profiles: {e}")
            return []

    # ============================================================================
    # PHEONIX PROJECT ACTIVITY TRACKING
    # ============================================================================

    async def get_phoenix_activities(self) -> List[Dict[str, Any]]:
        """
        Get PHEONIX project activities.

        Returns:
            List of PHEONIX framework and control project activities
        """
        try:
            activities = await self.phoenix_tracker.collect_phoenix_activities()
            return [
                activity.__dict__ if hasattr(activity, "__dict__") else activity
                for activity in activities
            ]
        except Exception as e:
            logger.error(f"Error getting PHEONIX activities: {e}")
            return []

    async def get_phoenix_summary(self) -> Dict[str, Any]:
        """
        Get comprehensive PHEONIX project summary.

        Returns:
            Complete PHEONIX project analysis including research initiatives and experiments
        """
        try:
            return await self.phoenix_tracker.generate_phoenix_summary()
        except Exception as e:
            logger.error(f"Error generating PHEONIX summary: {e}")
            return {"error": str(e)}

    async def get_research_initiatives(self) -> List[Dict[str, Any]]:
        """
        Get PHEONIX research initiatives.

        Returns:
            List of research initiatives and their status
        """
        try:
            await self.phoenix_tracker.collect_phoenix_activities()
            initiatives = await self.phoenix_tracker.analyze_research_initiatives()
            return [
                initiative.__dict__ if hasattr(initiative, "__dict__") else initiative
                for initiative in initiatives
            ]
        except Exception as e:
            logger.error(f"Error getting research initiatives: {e}")
            return []

    # ============================================================================
    # GENERAL LEGACY TRACKING (EXISTING FUNCTIONALITY)
    # ============================================================================

    async def get_legacy_activities(self) -> List[Dict[str, Any]]:
        """
        Get general Success-Advisor-8 legacy activities (existing functionality).

        Returns:
            List of all Success-Advisor-8 activities from CHANGELOG
        """
        try:
            activities = self.changelog_parser.parse_success_advisor_8_activities()
            return [
                activity.__dict__ if hasattr(activity, "__dict__") else activity
                for activity in activities
            ]
        except Exception as e:
            logger.error(f"Error getting legacy activities: {e}")
            return []

    async def get_legacy_summary(self) -> str:
        """
        Get general legacy activity summary (existing functionality).

        Returns:
            Human-readable legacy activity summary
        """
        try:
            return self.changelog_parser.generate_activity_summary()
        except Exception as e:
            logger.error(f"Error generating legacy summary: {e}")
            return f"❌ Error generating summary: {e}"

    async def get_codebase_movements(self) -> List[Dict[str, Any]]:
        """
        Get Success-Advisor-8 code movements across the codebase.

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

    # ============================================================================
    # COMPREHENSIVE ANALYSIS AND REPORTING
    # ============================================================================

    async def get_comprehensive_analysis(self) -> Dict[str, Any]:
        """
        Get comprehensive analysis combining all tracking systems.

        Returns:
            Complete analysis with genome, PHEONIX, and legacy information
        """
        try:
            # Collect data from all trackers
            genome_summary = await self.get_genome_summary()
            phoenix_summary = await self.get_phoenix_summary()
            legacy_activities = await self.get_legacy_activities()
            codebase_movements = await self.get_codebase_movements()

            # Get ECS agent data
            ecs_agent_data = await self._get_ecs_agent_data()

            return {
                "analysis_metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "codebase_path": str(self.codebase_path),
                    "tracker_versions": {
                        "genome_tracker": "1.0.0",
                        "phoenix_tracker": "1.0.0",
                        "legacy_tracker": "1.0.0",
                    },
                },
                "success_advisor_8_genome": genome_summary,
                "phoenix_projects": phoenix_summary,
                "general_legacy": {
                    "total_activities": len(legacy_activities),
                    "activities": legacy_activities,
                    "codebase_movements": codebase_movements,
                    "summary": await self.get_legacy_summary(),
                },
                "ecs_integration": ecs_agent_data,
                "cross_analysis": {
                    "genome_vs_legacy_overlap": self._analyze_genome_legacy_overlap(
                        genome_summary, legacy_activities
                    ),
                    "phoenix_vs_genome_relationship": self._analyze_phoenix_genome_relationship(
                        phoenix_summary, genome_summary
                    ),
                    "overall_activity_trends": self._analyze_overall_trends(
                        genome_summary, phoenix_summary, legacy_activities
                    ),
                },
            }

        except Exception as e:
            logger.error(f"Error generating comprehensive analysis: {e}")
            return {"error": str(e), "generated_at": datetime.now().isoformat()}

    def _analyze_genome_legacy_overlap(
        self, genome_summary: Dict[str, Any], legacy_activities: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze overlap between genome activities and general legacy activities."""
        genome_activities = genome_summary.get("genome_activities", [])
        legacy_count = len(legacy_activities)
        genome_count = len(genome_activities)

        return {
            "legacy_activity_count": legacy_count,
            "genome_activity_count": genome_count,
            "overlap_percentage": (
                (genome_count / legacy_count * 100) if legacy_count > 0 else 0
            ),
            "genome_focus_ratio": (
                genome_count / legacy_count if legacy_count > 0 else 0
            ),
        }

    def _analyze_phoenix_genome_relationship(
        self, phoenix_summary: Dict[str, Any], genome_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze relationship between PHEONIX projects and Success-Advisor-8 genome."""
        phoenix_activities = phoenix_summary.get("project_metrics", {}).get(
            "total_phoenix_activities", 0
        )
        genome_activities = genome_summary.get("genome_metrics", {}).get(
            "total_genome_activities", 0
        )

        return {
            "phoenix_activity_count": phoenix_activities,
            "genome_activity_count": genome_activities,
            "project_genome_ratio": (
                phoenix_activities / genome_activities if genome_activities > 0 else 0
            ),
            "relationship_type": (
                "complementary"
                if phoenix_activities > 0 and genome_activities > 0
                else "independent"
            ),
        }

    def _analyze_overall_trends(
        self,
        genome_summary: Dict[str, Any],
        phoenix_summary: Dict[str, Any],
        legacy_activities: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Analyze overall activity trends across all tracking systems."""
        total_activities = (
            genome_summary.get("genome_metrics", {}).get("total_genome_activities", 0)
            + phoenix_summary.get("project_metrics", {}).get(
                "total_phoenix_activities", 0
            )
            + len(legacy_activities)
        )

        return {
            "total_activities_across_systems": total_activities,
            "system_distribution": {
                "genome_tracking": genome_summary.get("genome_metrics", {}).get(
                    "total_genome_activities", 0
                ),
                "phoenix_tracking": phoenix_summary.get("project_metrics", {}).get(
                    "total_phoenix_activities", 0
                ),
                "legacy_tracking": len(legacy_activities),
            },
            "activity_health": (
                "high"
                if total_activities > 20
                else "medium" if total_activities > 10 else "low"
            ),
        }

    async def _get_ecs_agent_data(self) -> Optional[Dict[str, Any]]:
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
            else:
                return None

        except Exception as e:
            logger.error(f"Error getting ECS agent data: {e}")
            return None

    # ============================================================================
    # UTILITY METHODS
    # ============================================================================

    async def refresh_all_data(self) -> bool:
        """
        Refresh all tracking data.

        Returns:
            True if refresh successful, False otherwise
        """
        try:
            # Refresh all trackers
            await self.genome_tracker.collect_genome_activities()
            await self.phoenix_tracker.collect_phoenix_activities()

            logger.info("All tracking data refreshed successfully")
            return True

        except Exception as e:
            logger.error(f"Error refreshing tracking data: {e}")
            return False

    async def get_tracker_status(self) -> Dict[str, Any]:
        """
        Get status of all tracking systems.

        Returns:
            Status information for all trackers
        """
        try:
            return {
                "genome_tracker": {
                    "status": "active",
                    "activities_collected": len(self.genome_tracker.genome_activities),
                    "patterns_identified": len(self.genome_tracker.behavioral_patterns),
                    "capabilities_profiled": len(
                        self.genome_tracker.capability_profiles
                    ),
                },
                "phoenix_tracker": {
                    "status": "active",
                    "activities_collected": len(
                        self.phoenix_tracker.phoenix_activities
                    ),
                    "research_initiatives": len(
                        self.phoenix_tracker.research_initiatives
                    ),
                    "experiment_results": len(self.phoenix_tracker.experiment_results),
                },
                "legacy_tracker": {
                    "status": "active",
                    "changelog_path": str(self.changelog_parser.changelog_path),
                    "changelog_exists": self.changelog_parser.changelog_path.exists(),
                },
            }

        except Exception as e:
            logger.error(f"Error getting tracker status: {e}")
            return {"error": str(e)}

    async def close(self) -> None:
        """Close the modular legacy tracking service."""
        logger.info("ModularLegacyTrackingService closed")
