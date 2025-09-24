"""Success-Advisor-8 Genome Information Tracker

Dedicated tracker for collecting Success-Advisor-8's genomic information,
activities, and behavioral patterns for spirit inhabitation and legacy analysis.

This module focuses specifically on Success-Advisor-8's direct activities
and excludes broader project tracking (PHEONIX, etc.).
"""

import logging
import re
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class GenomeActivity:
    """Represents a Success-Advisor-8 genome-relevant activity."""

    activity_id: str
    activity_type: str  # 'genome_update', 'behavioral_pattern', 'capability_enhancement', 'legacy_contribution'
    description: str
    timestamp: datetime
    genomic_impact: str  # 'high', 'medium', 'low'
    traits_affected: list[str] = None
    capabilities_enhanced: list[str] = None
    version: str | None = None
    file_path: str | None = None
    line_number: int | None = None
    context: dict[str, Any] = None

    def __post_init__(self):
        if self.traits_affected is None:
            self.traits_affected = []
        if self.capabilities_enhanced is None:
            self.capabilities_enhanced = []
        if self.context is None:
            self.context = {}


@dataclass
class BehavioralPattern:
    """Represents a behavioral pattern observed in Success-Advisor-8's activities."""

    pattern_id: str
    pattern_type: str  # 'workflow', 'communication', 'problem_solving', 'leadership'
    description: str
    frequency: int
    confidence: float  # 0.0 to 1.0
    examples: list[str] = None
    traits_manifested: list[str] = None
    last_observed: datetime = None

    def __post_init__(self):
        if self.examples is None:
            self.examples = []
        if self.traits_manifested is None:
            self.traits_manifested = []


@dataclass
class CapabilityProfile:
    """Represents Success-Advisor-8's capability profile based on activities."""

    capability_id: str
    capability_name: str
    proficiency_level: float  # 0.0 to 1.0
    evidence_count: int
    last_demonstrated: datetime
    related_activities: list[str] = None
    supporting_traits: list[str] = None

    def __post_init__(self):
        if self.related_activities is None:
            self.related_activities = []
        if self.supporting_traits is None:
            self.supporting_traits = []


class SuccessAdvisor8GenomeTracker:
    """Dedicated tracker for Success-Advisor-8's genomic information collection.

    Focuses specifically on activities that contribute to understanding
    Success-Advisor-8's behavioral patterns, capabilities, and traits.
    """

    def __init__(self, codebase_path: str, changelog_path: str = "CHANGELOG.md"):
        """Initialize the genome tracker.

        Args:
            codebase_path: Path to the codebase root
            changelog_path: Path to CHANGELOG.md file

        """
        self.codebase_path = Path(codebase_path)
        if Path(changelog_path).is_absolute():
            self.changelog_path = Path(changelog_path)
        else:
            self.changelog_path = self.codebase_path / changelog_path

        self.genome_activities: list[GenomeActivity] = []
        self.behavioral_patterns: list[BehavioralPattern] = []
        self.capability_profiles: list[CapabilityProfile] = []

        # Success-Advisor-8 specific patterns for genome collection
        self.genome_patterns = {
            "direct_activities": [
                r"Success-Advisor-8",
                r"SUCCESS-ADVISOR-8",
                r"success-advisor-8",
            ],
            "behavioral_indicators": [
                r"release.*management",
                r"version.*bump",
                r"changelog.*update",
                r"git.*tag",
                r"semantic.*versioning",
                r"quality.*assurance",
                r"code.*review",
                r"documentation.*update",
                r"testing.*framework",
                r"deployment.*automation",
            ],
            "capability_indicators": [
                r"leadership",
                r"mentoring",
                r"coordination",
                r"planning",
                r"organization",
                r"communication",
                r"problem.*solving",
                r"strategic.*thinking",
                r"technical.*expertise",
                r"project.*management",
            ],
            "trait_indicators": [
                r"systematic",
                r"methodical",
                r"thorough",
                r"reliable",
                r"consistent",
                r"organized",
                r"disciplined",
                r"focused",
                r"persistent",
                r"detail.*oriented",
            ],
        }

        # Exclude patterns (PHEONIX projects, etc.)
        self.exclude_patterns = [
            r"phoenix.*framework",
            r"phoenix.*control",
            r"evolutionary.*knowledge",
            r"genetic.*material",
            r"distillation.*framework",
            r"experimental.*phoenix",
        ]

    async def collect_genome_activities(self) -> list[GenomeActivity]:
        """Collect Success-Advisor-8 genome-relevant activities from CHANGELOG.

        Returns:
            List of genome-relevant activities

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

            # Check for Success-Advisor-8 genome-relevant activities
            if self._is_genome_relevant_activity(line):
                activity = await self._extract_genome_activity(
                    line, i, current_version, current_date,
                )
                if activity:
                    activities.append(activity)

        self.genome_activities.extend(activities)
        logger.info(
            "Found %d Success-Advisor-8 genome activities in CHANGELOG", len(activities),
        )
        return activities

    def _is_genome_relevant_activity(self, line: str) -> bool:
        """Check if line contains Success-Advisor-8 genome-relevant activity."""
        line_lower = line.lower()

        # First check if it's a Success-Advisor-8 activity
        has_success_advisor = any(
            re.search(pattern, line_lower, re.IGNORECASE)
            for pattern in self.genome_patterns["direct_activities"]
        )

        if not has_success_advisor:
            return False

        # Exclude PHEONIX project activities
        if any(
            re.search(pattern, line_lower, re.IGNORECASE)
            for pattern in self.exclude_patterns
        ):
            return False

        # For genome information collection, include ALL Success-Advisor-8 activities
        # The behavioral/capability/trait indicators are used for analysis, not filtering
        return True

    async def _extract_genome_activity(
        self, line: str, line_number: int, version: str | None, date: datetime | None,
    ) -> GenomeActivity | None:
        """Extract genome activity from changelog line."""
        try:
            # Determine activity type and genomic impact
            activity_type, genomic_impact = self._classify_genome_activity(line)

            # Extract traits and capabilities affected
            traits_affected = self._extract_affected_traits(line)
            capabilities_enhanced = self._extract_enhanced_capabilities(line)

            # Generate activity ID
            activity_id = (
                f"genome-{version or 'unreleased'}-{line_number}-{hash(line) % 10000}"
            )

            # Extract description
            description = line.strip("- ").strip()

            return GenomeActivity(
                activity_id=activity_id,
                activity_type=activity_type,
                description=description,
                timestamp=date or datetime.now(),
                genomic_impact=genomic_impact,
                traits_affected=traits_affected,
                capabilities_enhanced=capabilities_enhanced,
                version=version,
                file_path=str(self.changelog_path),
                line_number=line_number,
                context={"source": "changelog", "raw_line": line},
            )

        except Exception:
            logger.exception(
                "Failed to extract genome activity from line %d", line_number,
            )
            return None

    def _classify_genome_activity(self, line: str) -> tuple[str, str]:
        """Classify the type and genomic impact of Success-Advisor-8 activity."""
        line_lower = line.lower()

        # High impact activities
        if any(
            keyword in line_lower
            for keyword in ["release", "version", "major", "framework"]
        ):
            return "genome_update", "high"

        # Medium impact activities
        if any(
            keyword in line_lower
            for keyword in ["feature", "enhancement", "improvement", "optimization"]
        ):
            return "capability_enhancement", "medium"

        # Low impact activities
        if any(
            keyword in line_lower
            for keyword in ["fix", "bug", "documentation", "update"]
        ):
            return "behavioral_pattern", "low"

        return "legacy_contribution", "medium"

    def _extract_affected_traits(self, line: str) -> list[str]:
        """Extract personality traits affected by this activity."""
        line_lower = line.lower()
        traits = []

        trait_mapping = {
            "systematic": ["organization", "methodical"],
            "thorough": ["attention_to_detail", "completeness"],
            "reliable": ["consistency", "dependability"],
            "organized": ["planning", "structure"],
            "disciplined": ["focus", "persistence"],
            "leadership": ["authority", "guidance"],
            "communication": ["clarity", "articulation"],
            "problem": ["analytical", "solution_oriented"],
            "reconstruction": ["analytical", "problem_solving", "systematic"],
            "feasibility": ["analytical", "strategic_thinking", "planning"],
            "validated": ["thoroughness", "attention_to_detail", "reliability"],
            "theoretical": ["analytical", "intellectual", "systematic"],
            "foundation": ["systematic", "planning", "structure"],
        }

        for keyword, trait_list in trait_mapping.items():
            if keyword in line_lower:
                traits.extend(trait_list)

        return list(set(traits))  # Remove duplicates

    def _extract_enhanced_capabilities(self, line: str) -> list[str]:
        """Extract capabilities enhanced by this activity."""
        line_lower = line.lower()
        capabilities = []

        capability_mapping = {
            "release": ["release_management", "version_control"],
            "version": ["version_control", "semantic_versioning"],
            "changelog": ["documentation", "change_tracking"],
            "git": ["version_control", "repository_management"],
            "testing": ["quality_assurance", "validation"],
            "deployment": ["deployment_automation", "infrastructure"],
            "documentation": ["technical_writing", "knowledge_management"],
            "framework": ["architecture", "system_design"],
            "reconstruction": ["system_analysis", "architecture", "problem_solving"],
            "feasibility": ["strategic_analysis", "planning", "evaluation"],
            "validated": ["quality_assurance", "validation", "testing"],
            "theoretical": ["research", "analysis", "intellectual_work"],
            "foundation": ["architecture", "system_design", "planning"],
        }

        for keyword, capability_list in capability_mapping.items():
            if keyword in line_lower:
                capabilities.extend(capability_list)

        return list(set(capabilities))  # Remove duplicates

    async def analyze_behavioral_patterns(self) -> list[BehavioralPattern]:
        """Analyze behavioral patterns from collected activities."""
        patterns = []

        # Analyze workflow patterns
        workflow_activities = [
            a
            for a in self.genome_activities
            if any(
                keyword in a.description.lower()
                for keyword in ["release", "version", "changelog"]
            )
        ]

        if workflow_activities:
            patterns.append(
                BehavioralPattern(
                    pattern_id="workflow_release_management",
                    pattern_type="workflow",
                    description="Systematic release management workflow",
                    frequency=len(workflow_activities),
                    confidence=min(1.0, len(workflow_activities) / 10.0),
                    examples=[a.description for a in workflow_activities[:3]],
                    traits_manifested=["organization", "systematic", "reliability"],
                    last_observed=max(a.timestamp for a in workflow_activities),
                ),
            )

        # Analyze communication patterns
        comm_activities = [
            a
            for a in self.genome_activities
            if any(
                keyword in a.description.lower()
                for keyword in ["documentation", "guide", "readme"]
            )
        ]

        if comm_activities:
            patterns.append(
                BehavioralPattern(
                    pattern_id="communication_documentation",
                    pattern_type="communication",
                    description="Comprehensive documentation and communication",
                    frequency=len(comm_activities),
                    confidence=min(1.0, len(comm_activities) / 5.0),
                    examples=[a.description for a in comm_activities[:3]],
                    traits_manifested=["clarity", "thoroughness", "knowledge_sharing"],
                    last_observed=max(a.timestamp for a in comm_activities),
                ),
            )

        self.behavioral_patterns.extend(patterns)
        return patterns

    async def build_capability_profiles(self) -> list[CapabilityProfile]:
        """Build capability profiles based on activities."""
        profiles = []

        # Release Management Capability
        release_activities = [
            a
            for a in self.genome_activities
            if "release" in a.description.lower() or "version" in a.description.lower()
        ]

        if release_activities:
            profiles.append(
                CapabilityProfile(
                    capability_id="release_management",
                    capability_name="Release Management",
                    proficiency_level=min(1.0, len(release_activities) / 20.0),
                    evidence_count=len(release_activities),
                    last_demonstrated=max(a.timestamp for a in release_activities),
                    related_activities=[a.activity_id for a in release_activities],
                    supporting_traits=[
                        "organization",
                        "systematic",
                        "reliability",
                        "leadership",
                    ],
                ),
            )

        # Quality Assurance Capability
        qa_activities = [
            a
            for a in self.genome_activities
            if any(
                keyword in a.description.lower()
                for keyword in ["testing", "quality", "validation", "fix"]
            )
        ]

        if qa_activities:
            profiles.append(
                CapabilityProfile(
                    capability_id="quality_assurance",
                    capability_name="Quality Assurance",
                    proficiency_level=min(1.0, len(qa_activities) / 15.0),
                    evidence_count=len(qa_activities),
                    last_demonstrated=max(a.timestamp for a in qa_activities),
                    related_activities=[a.activity_id for a in qa_activities],
                    supporting_traits=[
                        "attention_to_detail",
                        "thoroughness",
                        "persistence",
                    ],
                ),
            )

        self.capability_profiles.extend(profiles)
        return profiles

    async def generate_genome_summary(self) -> dict[str, Any]:
        """Generate comprehensive genome summary."""
        await self.collect_genome_activities()
        await self.analyze_behavioral_patterns()
        await self.build_capability_profiles()

        # Calculate genome metrics
        total_activities = len(self.genome_activities)
        high_impact_activities = len(
            [a for a in self.genome_activities if a.genomic_impact == "high"],
        )
        medium_impact_activities = len(
            [a for a in self.genome_activities if a.genomic_impact == "medium"],
        )
        low_impact_activities = len(
            [a for a in self.genome_activities if a.genomic_impact == "low"],
        )

        # Extract unique traits and capabilities
        all_traits = set()
        all_capabilities = set()

        for activity in self.genome_activities:
            all_traits.update(activity.traits_affected)
            all_capabilities.update(activity.capabilities_enhanced)

        return {
            "genome_metrics": {
                "total_genome_activities": total_activities,
                "high_impact_activities": high_impact_activities,
                "medium_impact_activities": medium_impact_activities,
                "low_impact_activities": low_impact_activities,
                "unique_traits_identified": len(all_traits),
                "unique_capabilities_identified": len(all_capabilities),
            },
            "behavioral_patterns": [
                asdict(pattern) for pattern in self.behavioral_patterns
            ],
            "capability_profiles": [
                asdict(profile) for profile in self.capability_profiles
            ],
            "genome_activities": [
                asdict(activity) for activity in self.genome_activities
            ],
            "trait_analysis": {
                "identified_traits": list(all_traits),
                "trait_frequency": self._calculate_trait_frequency(),
            },
            "capability_analysis": {
                "identified_capabilities": list(all_capabilities),
                "capability_development": self._analyze_capability_development(),
            },
            "genome_insights": {
                "primary_strengths": self._identify_primary_strengths(),
                "behavioral_consistency": self._assess_behavioral_consistency(),
                "capability_maturity": self._assess_capability_maturity(),
            },
        }

    def _calculate_trait_frequency(self) -> dict[str, int]:
        """Calculate frequency of traits across activities."""
        trait_frequency = {}
        for activity in self.genome_activities:
            for trait in activity.traits_affected:
                trait_frequency[trait] = trait_frequency.get(trait, 0) + 1
        return trait_frequency

    def _analyze_capability_development(self) -> dict[str, Any]:
        """Analyze capability development over time."""
        capability_timeline = {}
        for activity in self.genome_activities:
            for capability in activity.capabilities_enhanced:
                if capability not in capability_timeline:
                    capability_timeline[capability] = []
                capability_timeline[capability].append(activity.timestamp)

        return {
            capability: {
                "first_observed": min(timestamps),
                "last_observed": max(timestamps),
                "development_span_days": (max(timestamps) - min(timestamps)).days,
                "activity_count": len(timestamps),
            }
            for capability, timestamps in capability_timeline.items()
        }

    def _identify_primary_strengths(self) -> list[str]:
        """Identify Success-Advisor-8's primary strengths based on activities."""
        trait_frequency = self._calculate_trait_frequency()
        sorted_traits = sorted(
            trait_frequency.items(), key=lambda x: x[1], reverse=True,
        )
        return [trait for trait, freq in sorted_traits[:5]]

    def _assess_behavioral_consistency(self) -> float:
        """Assess behavioral consistency based on pattern analysis."""
        if not self.behavioral_patterns:
            return 0.0

        avg_confidence = sum(
            pattern.confidence for pattern in self.behavioral_patterns
        ) / len(self.behavioral_patterns)
        return avg_confidence

    def _assess_capability_maturity(self) -> float:
        """Assess overall capability maturity."""
        if not self.capability_profiles:
            return 0.0

        avg_proficiency = sum(
            profile.proficiency_level for profile in self.capability_profiles
        ) / len(self.capability_profiles)
        return avg_proficiency
