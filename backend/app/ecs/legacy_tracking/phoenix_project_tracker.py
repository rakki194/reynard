"""PHEONIX Project Tracker

Dedicated tracker for monitoring PHEONIX and PHEONIX Control project activities,
evolutionary knowledge distillation experiments, and related research initiatives.

This module tracks broader project activities separate from Success-Advisor-8's
direct genome information collection.
"""

import logging
import re
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class PhoenixProjectActivity:
    """Represents a PHEONIX project activity."""

    activity_id: str
    project_type: (
        str  # 'phoenix_framework', 'phoenix_control', 'research', 'experiment'
    )
    activity_category: (
        str  # 'development', 'research', 'experiment', 'documentation', 'integration'
    )
    description: str
    timestamp: datetime
    impact_level: str  # 'high', 'medium', 'low'
    research_area: str | None = None
    experiment_type: str | None = None
    version: str | None = None
    file_path: str | None = None
    line_number: int | None = None
    context: dict[str, Any] = None

    def __post_init__(self):
        if self.context is None:
            self.context = {}


@dataclass
class ResearchInitiative:
    """Represents a research initiative within PHEONIX projects."""

    initiative_id: str
    name: str
    description: str
    research_type: str  # 'evolutionary_knowledge_distillation', 'agent_breeding', 'genetic_analysis'
    status: str  # 'active', 'completed', 'paused', 'planning'
    start_date: datetime
    end_date: datetime | None = None
    related_activities: list[str] = None
    key_findings: list[str] = None
    publications: list[str] = None

    def __post_init__(self):
        if self.related_activities is None:
            self.related_activities = []
        if self.key_findings is None:
            self.key_findings = []
        if self.publications is None:
            self.publications = []


@dataclass
class ExperimentResult:
    """Represents results from PHEONIX experiments."""

    experiment_id: str
    experiment_name: str
    experiment_type: (
        str  # 'agent_reconstruction', 'genetic_compatibility', 'knowledge_distillation'
    )
    success_rate: float
    performance_metrics: dict[str, float]
    statistical_significance: float
    sample_size: int
    conducted_date: datetime
    results_summary: str
    key_insights: list[str] = None

    def __post_init__(self):
        if self.key_insights is None:
            self.key_insights = []


class PhoenixProjectTracker:
    """Dedicated tracker for PHEONIX project activities and research initiatives.

    Monitors evolutionary knowledge distillation, agent breeding experiments,
    and related research activities separate from Success-Advisor-8's genome.
    """

    def __init__(self, codebase_path: str, changelog_path: str = "CHANGELOG.md"):
        """Initialize the PHEONIX project tracker.

        Args:
            codebase_path: Path to the codebase root
            changelog_path: Path to CHANGELOG.md file

        """
        self.codebase_path = Path(codebase_path)
        if Path(changelog_path).is_absolute():
            self.changelog_path = Path(changelog_path)
        else:
            self.changelog_path = self.codebase_path / changelog_path

        self.phoenix_activities: list[PhoenixProjectActivity] = []
        self.research_initiatives: list[ResearchInitiative] = []
        self.experiment_results: list[ExperimentResult] = []

        # PHEONIX project patterns
        self.phoenix_patterns = {
            "phoenix_framework": [
                r"phoenix.*framework",
                r"evolutionary.*knowledge.*distillation",
                r"genetic.*material",
                r"agent.*breeding",
                r"multi.*generational",
                r"subliminal.*learning",
            ],
            "phoenix_control": [
                r"phoenix.*control",
                r"success.*advisor.*distillation",
                r"agent.*state.*management",
                r"release.*automation",
                r"quality.*assurance",
            ],
            "research_activities": [
                r"research.*paper",
                r"academic.*review",
                r"statistical.*validation",
                r"convergence.*analysis",
                r"performance.*metrics",
                r"experimental.*results",
            ],
            "experiment_types": [
                r"agent.*reconstruction",
                r"genetic.*compatibility",
                r"knowledge.*distillation",
                r"trait.*inheritance",
                r"evolutionary.*algorithm",
                r"baseline.*experiment",
            ],
            "development_activities": [
                r"implementation",
                r"framework.*development",
                r"algorithm.*design",
                r"integration.*testing",
                r"performance.*optimization",
                r"documentation.*update",
            ],
        }

        # Research areas
        self.research_areas = {
            "evolutionary_knowledge_distillation": [
                r"evolutionary.*knowledge",
                r"genetic.*material",
                r"multi.*generational",
                r"subliminal.*learning",
            ],
            "agent_breeding": [
                r"agent.*breeding",
                r"genetic.*compatibility",
                r"trait.*inheritance",
                r"offspring.*creation",
            ],
            "statistical_analysis": [
                r"statistical.*validation",
                r"convergence.*analysis",
                r"performance.*metrics",
                r"significance.*testing",
            ],
            "experimental_design": [
                r"experiment.*design",
                r"baseline.*comparison",
                r"control.*group",
                r"randomized.*trial",
            ],
        }

    async def collect_phoenix_activities(self) -> list[PhoenixProjectActivity]:
        """Collect PHEONIX project activities from CHANGELOG.

        Returns:
            List of PHEONIX project activities

        """
        if not self.changelog_path.exists():
            logger.warning("CHANGELOG not found at %s", self.changelog_path)
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
                date_match = re.search(r"(\d{4}-\d{2}-\d{2})", line)
                if date_match:
                    current_date = datetime.fromisoformat(date_match.group(1))
                continue

            # Check for PHEONIX project activities
            if self._is_phoenix_activity(line):
                activity = await self._extract_phoenix_activity(
                    line,
                    i,
                    current_version,
                    current_date,
                )
                if activity:
                    activities.append(activity)

        self.phoenix_activities.extend(activities)
        logger.info("Found %d PHEONIX project activities in CHANGELOG", len(activities))
        return activities

    def _is_phoenix_activity(self, line: str) -> bool:
        """Check if line contains PHEONIX project activity."""
        line_lower = line.lower()

        # Check for any PHEONIX-related patterns
        for pattern_group in self.phoenix_patterns.values():
            if any(
                re.search(pattern, line_lower, re.IGNORECASE)
                for pattern in pattern_group
            ):
                return True

        return False

    async def _extract_phoenix_activity(
        self,
        line: str,
        line_number: int,
        version: str | None,
        date: datetime | None,
    ) -> PhoenixProjectActivity | None:
        """Extract PHEONIX activity from changelog line."""
        try:
            # Determine project type and category
            project_type, activity_category = self._classify_phoenix_activity(line)

            # Determine research area and experiment type
            research_area = self._identify_research_area(line)
            experiment_type = self._identify_experiment_type(line)

            # Determine impact level
            impact_level = self._assess_impact_level(line)

            # Generate activity ID
            activity_id = (
                f"phoenix-{version or 'unreleased'}-{line_number}-{hash(line) % 10000}"
            )

            # Extract description
            description = line.strip("- ").strip()

            return PhoenixProjectActivity(
                activity_id=activity_id,
                project_type=project_type,
                activity_category=activity_category,
                description=description,
                timestamp=date or datetime.now(),
                impact_level=impact_level,
                research_area=research_area,
                experiment_type=experiment_type,
                version=version,
                file_path=str(self.changelog_path),
                line_number=line_number,
                context={"source": "changelog", "raw_line": line},
            )

        except Exception:
            logger.exception(
                "Failed to extract PHEONIX activity from line %d",
                line_number,
            )
            return None

    def _classify_phoenix_activity(self, line: str) -> tuple[str, str]:
        """Classify the PHEONIX project type and activity category."""
        line_lower = line.lower()

        # Determine project type
        if any(
            re.search(pattern, line_lower, re.IGNORECASE)
            for pattern in self.phoenix_patterns["phoenix_framework"]
        ):
            project_type = "phoenix_framework"
        elif any(
            re.search(pattern, line_lower, re.IGNORECASE)
            for pattern in self.phoenix_patterns["phoenix_control"]
        ):
            project_type = "phoenix_control"
        else:
            project_type = "research"

        # Determine activity category
        if any(
            re.search(pattern, line_lower, re.IGNORECASE)
            for pattern in self.phoenix_patterns["research_activities"]
        ):
            activity_category = "research"
        elif any(
            re.search(pattern, line_lower, re.IGNORECASE)
            for pattern in self.phoenix_patterns["experiment_types"]
        ):
            activity_category = "experiment"
        elif any(
            re.search(pattern, line_lower, re.IGNORECASE)
            for pattern in self.phoenix_patterns["development_activities"]
        ):
            activity_category = "development"
        else:
            activity_category = "documentation"

        return project_type, activity_category

    def _identify_research_area(self, line: str) -> str | None:
        """Identify the research area for this activity."""
        line_lower = line.lower()

        for research_area, patterns in self.research_areas.items():
            if any(
                re.search(pattern, line_lower, re.IGNORECASE) for pattern in patterns
            ):
                return research_area

        return None

    def _identify_experiment_type(self, line: str) -> str | None:
        """Identify the experiment type if applicable."""
        line_lower = line.lower()

        for experiment_type in self.phoenix_patterns["experiment_types"]:
            if re.search(experiment_type, line_lower, re.IGNORECASE):
                return experiment_type

        return None

    def _assess_impact_level(self, line: str) -> str:
        """Assess the impact level of this PHEONIX activity."""
        line_lower = line.lower()

        # High impact indicators
        if any(
            keyword in line_lower
            for keyword in ["framework", "implementation", "major", "comprehensive"]
        ):
            return "high"

        # Medium impact indicators
        if any(
            keyword in line_lower
            for keyword in ["experiment", "research", "analysis", "validation"]
        ):
            return "medium"

        # Low impact indicators
        if any(
            keyword in line_lower
            for keyword in ["documentation", "update", "fix", "minor"]
        ):
            return "low"

        return "medium"

    async def analyze_research_initiatives(self) -> list[ResearchInitiative]:
        """Analyze research initiatives from collected activities."""
        initiatives = []

        # Group activities by research area
        research_groups = {}
        for activity in self.phoenix_activities:
            if activity.research_area:
                if activity.research_area not in research_groups:
                    research_groups[activity.research_area] = []
                research_groups[activity.research_area].append(activity)

        # Create research initiatives
        for research_area, activities in research_groups.items():
            if activities:
                initiative = ResearchInitiative(
                    initiative_id=f"initiative_{research_area}",
                    name=f"{research_area.replace('_', ' ').title()} Research",
                    description=f"Research initiative focused on {research_area.replace('_', ' ')}",
                    research_type=research_area,
                    status=(
                        "active"
                        if any(
                            a.timestamp > datetime.now().replace(day=1)
                            for a in activities
                        )
                        else "completed"
                    ),
                    start_date=min(a.timestamp for a in activities),
                    end_date=(
                        max(a.timestamp for a in activities)
                        if len(activities) > 1
                        else None
                    ),
                    related_activities=[a.activity_id for a in activities],
                    key_findings=self._extract_key_findings(activities),
                )
                initiatives.append(initiative)

        self.research_initiatives.extend(initiatives)
        return initiatives

    def _extract_key_findings(
        self,
        activities: list[PhoenixProjectActivity],
    ) -> list[str]:
        """Extract key findings from activities."""
        findings = []

        for activity in activities:
            # Look for specific achievement indicators
            if "validation" in activity.description.lower():
                findings.append("Statistical validation framework implemented")
            if "experiment" in activity.description.lower():
                findings.append("Experimental validation completed")
            if "performance" in activity.description.lower():
                findings.append("Performance metrics established")
            if "convergence" in activity.description.lower():
                findings.append("Convergence analysis performed")

        return list(set(findings))  # Remove duplicates

    async def generate_phoenix_summary(self) -> dict[str, Any]:
        """Generate comprehensive PHEONIX project summary."""
        await self.collect_phoenix_activities()
        await self.analyze_research_initiatives()

        # Calculate project metrics
        total_activities = len(self.phoenix_activities)
        framework_activities = len(
            [
                a
                for a in self.phoenix_activities
                if a.project_type == "phoenix_framework"
            ],
        )
        control_activities = len(
            [a for a in self.phoenix_activities if a.project_type == "phoenix_control"],
        )
        research_activities = len(
            [a for a in self.phoenix_activities if a.activity_category == "research"],
        )
        experiment_activities = len(
            [a for a in self.phoenix_activities if a.activity_category == "experiment"],
        )

        # Analyze research areas
        research_areas = {}
        for activity in self.phoenix_activities:
            if activity.research_area:
                research_areas[activity.research_area] = (
                    research_areas.get(activity.research_area, 0) + 1
                )

        # Analyze impact distribution
        impact_distribution = {
            "high": len(
                [a for a in self.phoenix_activities if a.impact_level == "high"],
            ),
            "medium": len(
                [a for a in self.phoenix_activities if a.impact_level == "medium"],
            ),
            "low": len([a for a in self.phoenix_activities if a.impact_level == "low"]),
        }

        return {
            "project_metrics": {
                "total_phoenix_activities": total_activities,
                "framework_activities": framework_activities,
                "control_activities": control_activities,
                "research_activities": research_activities,
                "experiment_activities": experiment_activities,
                "active_research_areas": len(research_areas),
            },
            "research_analysis": {
                "research_areas": research_areas,
                "research_initiatives": [
                    asdict(initiative) for initiative in self.research_initiatives
                ],
                "key_research_findings": self._compile_research_findings(),
            },
            "project_activities": [
                asdict(activity) for activity in self.phoenix_activities
            ],
            "impact_analysis": {
                "impact_distribution": impact_distribution,
                "high_impact_activities": [
                    asdict(a)
                    for a in self.phoenix_activities
                    if a.impact_level == "high"
                ],
                "research_momentum": self._assess_research_momentum(),
            },
            "project_insights": {
                "primary_focus_areas": self._identify_primary_focus_areas(),
                "research_maturity": self._assess_research_maturity(),
                "experimental_progress": self._assess_experimental_progress(),
            },
        }

    def _compile_research_findings(self) -> list[str]:
        """Compile key research findings from all initiatives."""
        all_findings = []
        for initiative in self.research_initiatives:
            all_findings.extend(initiative.key_findings)
        return list(set(all_findings))

    def _assess_research_momentum(self) -> str:
        """Assess the current research momentum."""
        recent_activities = [
            a
            for a in self.phoenix_activities
            if a.timestamp > datetime.now().replace(month=datetime.now().month - 1)
        ]

        if len(recent_activities) > 5:
            return "high"
        if len(recent_activities) > 2:
            return "medium"
        return "low"

    def _identify_primary_focus_areas(self) -> list[str]:
        """Identify primary focus areas based on activity frequency."""
        area_frequency = {}
        for activity in self.phoenix_activities:
            if activity.research_area:
                area_frequency[activity.research_area] = (
                    area_frequency.get(activity.research_area, 0) + 1
                )

        sorted_areas = sorted(area_frequency.items(), key=lambda x: x[1], reverse=True)
        return [area for area, freq in sorted_areas[:3]]

    def _assess_research_maturity(self) -> float:
        """Assess overall research maturity."""
        if not self.research_initiatives:
            return 0.0

        completed_initiatives = len(
            [i for i in self.research_initiatives if i.status == "completed"],
        )
        return completed_initiatives / len(self.research_initiatives)

    def _assess_experimental_progress(self) -> dict[str, Any]:
        """Assess experimental progress across different areas."""
        experiment_activities = [
            a for a in self.phoenix_activities if a.activity_category == "experiment"
        ]

        if not experiment_activities:
            return {
                "total_experiments": 0,
                "experiment_types": {},
                "progress_level": "none",
            }

        experiment_types = {}
        for activity in experiment_activities:
            if activity.experiment_type:
                experiment_types[activity.experiment_type] = (
                    experiment_types.get(activity.experiment_type, 0) + 1
                )

        return {
            "total_experiments": len(experiment_activities),
            "experiment_types": experiment_types,
            "progress_level": (
                "high"
                if len(experiment_activities) > 10
                else "medium" if len(experiment_activities) > 5 else "low"
            ),
        }
