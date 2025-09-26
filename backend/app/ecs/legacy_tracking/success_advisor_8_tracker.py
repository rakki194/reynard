"""Success-Advisor-8 Legacy Tracker

Tracks Success-Advisor-8 movements and activities across the codebase
for comprehensive legacy management and analysis.
"""

import json
import logging
import re
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class SuccessAdvisor8Activity:
    """Represents a Success-Advisor-8 activity from CHANGELOG or codebase"""

    activity_id: str
    activity_type: str  # 'release', 'feature', 'fix', 'refactor', 'documentation'
    description: str
    timestamp: datetime
    version: str | None = None
    file_path: str | None = None
    line_number: int | None = None
    context: dict[str, Any] = None

    def __post_init__(self):
        if self.context is None:
            self.context = {}


@dataclass
class CodeMovement:
    """Represents a Success-Advisor-8 code movement or reference"""

    file_path: str
    line_number: int
    content: str
    movement_type: str  # 'definition', 'reference', 'usage', 'import'
    context: dict[str, Any] = None

    def __post_init__(self):
        if self.context is None:
            self.context = {}


@dataclass
class LegacyReport:
    """Comprehensive legacy tracking report"""

    total_activities: int
    total_code_movements: int
    changelog_entries: list[SuccessAdvisor8Activity]
    codebase_movements: list[CodeMovement]
    last_updated: datetime
    summary: dict[str, Any] = None

    def __post_init__(self):
        if self.summary is None:
            self.summary = {}


class SuccessAdvisor8LegacyTracker:
    """Track Success-Advisor-8 legacy across codebase and CHANGELOG files.

    Provides comprehensive tracking of Success-Advisor-8 activities,
    code movements, and legacy analysis for the Reynard ecosystem.
    """

    def __init__(self, codebase_path: str, changelog_path: str = "CHANGELOG.md"):
        """Initialize the legacy tracker.

        Args:
            codebase_path: Path to the codebase root
            changelog_path: Path to CHANGELOG.md file

        """
        self.codebase_path = Path(codebase_path)
        # If changelog_path is already an absolute path, use it directly
        if Path(changelog_path).is_absolute():
            self.changelog_path = Path(changelog_path)
        else:
            self.changelog_path = self.codebase_path / changelog_path
        self.activities: list[SuccessAdvisor8Activity] = []
        self.code_movements: list[CodeMovement] = []

        # Success-Advisor-8 patterns for detection
        self.patterns = {
            "success_advisor_8": [
                r"Success-Advisor-8",
                r"SUCCESS-ADVISOR-8",
                r"success_advisor_8",
                r"SuccessAdvisor8",
                r"success_advisor8",
            ],
            "lion_spirit": [
                r"🦁.*mane.*flows",
                r"🦁.*roars.*strategic",
                r"🦁.*teeth.*gleam",
                r"🦁.*mane.*ripples",
            ],
            "release_management": [
                r"release.*management",
                r"version.*bump",
                r"changelog.*update",
                r"git.*tag",
                r"semantic.*versioning",
            ],
        }

    async def parse_changelog_entries(self) -> list[SuccessAdvisor8Activity]:
        """Parse CHANGELOG.md for Success-Advisor-8 activities.

        Returns:
            List of Success-Advisor-8 activities found in CHANGELOG

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
                # Look for date in the same line or next line
                date_match = re.search(r"(\d{4}-\d{2}-\d{2})", line)
                if date_match:
                    current_date = datetime.fromisoformat(date_match.group(1))
                continue

            # Check for Success-Advisor-8 references
            if self._contains_success_advisor_8_reference(line):
                activity = await self._extract_activity_from_line(
                    line,
                    i,
                    current_version,
                    current_date,
                )
                if activity:
                    activities.append(activity)

        self.activities.extend(activities)
        logger.info(
            "Found %d Success-Advisor-8 activities in CHANGELOG",
            len(activities),
        )
        return activities

    async def scan_codebase_movements(self) -> list[CodeMovement]:
        """Scan codebase for Success-Advisor-8 movements and references.

        Returns:
            List of code movements and references

        """
        movements = []

        # Scan Python files
        for file_path in self.codebase_path.rglob("*.py"):
            if self._should_scan_file(file_path):
                file_movements = await self._analyze_python_file(file_path)
                movements.extend(file_movements)

        # Scan TypeScript/JavaScript files
        for pattern in ["*.ts", "*.tsx", "*.js", "*.jsx"]:
            for file_path in self.codebase_path.rglob(pattern):
                if self._should_scan_file(file_path):
                    file_movements = await self._analyze_js_file(file_path)
                    movements.extend(file_movements)

        # Scan Markdown files
        for file_path in self.codebase_path.rglob("*.md"):
            if self._should_scan_file(file_path):
                file_movements = await self._analyze_markdown_file(file_path)
                movements.extend(file_movements)

        self.code_movements.extend(movements)
        logger.info("Found %d Success-Advisor-8 code movements", len(movements))
        return movements

    async def generate_legacy_report(self) -> LegacyReport:
        """Generate comprehensive legacy tracking report.

        Returns:
            Complete legacy report with all activities and movements

        """
        # Parse CHANGELOG entries
        changelog_entries = await self.parse_changelog_entries()

        # Scan codebase movements
        codebase_movements = await self.scan_codebase_movements()

        # Generate summary statistics
        summary = self._generate_summary(changelog_entries, codebase_movements)

        report = LegacyReport(
            total_activities=len(changelog_entries),
            total_code_movements=len(codebase_movements),
            changelog_entries=changelog_entries,
            codebase_movements=codebase_movements,
            last_updated=datetime.now(),
            summary=summary,
        )

        logger.info(
            "Generated legacy report with %d activities and %d code movements",
            report.total_activities,
            report.total_code_movements,
        )
        return report

    async def export_legacy_data(self, output_path: str) -> bool:
        """Export legacy tracking data to JSON file.

        Args:
            output_path: Path to output JSON file

        Returns:
            True if export successful, False otherwise

        """
        try:
            report = await self.generate_legacy_report()

            # Convert to serializable format
            export_data = {
                "report": asdict(report),
                "export_timestamp": datetime.now().isoformat(),
                "codebase_path": str(self.codebase_path),
                "changelog_path": str(self.changelog_path),
            }

            # Write to file
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(
                json.dumps(export_data, indent=2, default=str),
                encoding="utf-8",
            )

            logger.info("Exported legacy data to %s", output_path)
            return True
        except Exception:
            logger.exception("Failed to export legacy data")
            return False

    def _contains_success_advisor_8_reference(self, line: str) -> bool:
        """Check if line contains Success-Advisor-8 reference."""
        line_lower = line.lower()
        for pattern_group in self.patterns.values():
            for pattern in pattern_group:
                if re.search(pattern, line_lower, re.IGNORECASE):
                    return True
        return False

    async def _extract_activity_from_line(
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
                context={"source": "changelog", "raw_line": line},
            )

        except Exception:
            logger.exception("Failed to extract activity from line %d", line_number)
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
        if any(keyword in line_lower for keyword in ["doc", "documentation", "guide"]):
            return "documentation"
        return "other"

    def _should_scan_file(self, file_path: Path) -> bool:
        """Determine if file should be scanned for Success-Advisor-8 references."""
        # Skip certain directories
        skip_dirs = {
            "node_modules",
            ".git",
            "__pycache__",
            ".pytest_cache",
            "venv",
            ".venv",
        }
        if any(skip_dir in file_path.parts for skip_dir in skip_dirs):
            return False

        # Skip certain file types
        skip_extensions = {".pyc", ".pyo", ".pyd", ".so", ".dll", ".exe"}
        return file_path.suffix not in skip_extensions

    async def _analyze_python_file(self, file_path: Path) -> list[CodeMovement]:
        """Analyze Python file for Success-Advisor-8 references."""
        movements = []

        try:
            # Try UTF-8 first, fallback to other encodings for problematic files
            try:
                content = file_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                try:
                    content = file_path.read_text(encoding="latin-1")
                except UnicodeDecodeError:
                    # Skip files that can't be decoded
                    logger.warning(f"Skipping file with encoding issues: {file_path}")
                    return []
            lines = content.split("\n")

            for i, line in enumerate(lines, 1):
                if self._contains_success_advisor_8_reference(line):
                    movement_type = self._classify_python_movement(line)

                    movement = CodeMovement(
                        file_path=str(file_path),
                        line_number=i,
                        content=line.strip(),
                        movement_type=movement_type,
                        context={
                            "file_type": "python",
                            "function_context": self._get_function_context(lines, i),
                            "class_context": self._get_class_context(lines, i),
                        },
                    )
                    movements.append(movement)

        except Exception:
            logger.exception("Failed to analyze Python file %s", file_path)

        return movements

    async def _analyze_js_file(self, file_path: Path) -> list[CodeMovement]:
        """Analyze JavaScript/TypeScript file for Success-Advisor-8 references."""
        movements = []

        try:
            # Try UTF-8 first, fallback to other encodings for problematic files
            try:
                content = file_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                try:
                    content = file_path.read_text(encoding="latin-1")
                except UnicodeDecodeError:
                    # Skip files that can't be decoded
                    logger.warning(f"Skipping file with encoding issues: {file_path}")
                    return []
            lines = content.split("\n")

            for i, line in enumerate(lines, 1):
                if self._contains_success_advisor_8_reference(line):
                    movement_type = self._classify_js_movement(line)

                    movement = CodeMovement(
                        file_path=str(file_path),
                        line_number=i,
                        content=line.strip(),
                        movement_type=movement_type,
                        context={
                            "file_type": "javascript",
                            "function_context": self._get_js_function_context(lines, i),
                            "class_context": self._get_js_class_context(lines, i),
                        },
                    )
                    movements.append(movement)

        except Exception:
            logger.exception("Failed to analyze JS file %s", file_path)

        return movements

    async def _analyze_markdown_file(self, file_path: Path) -> list[CodeMovement]:
        """Analyze Markdown file for Success-Advisor-8 references."""
        movements = []

        try:
            # Try UTF-8 first, fallback to other encodings for problematic files
            try:
                content = file_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                try:
                    content = file_path.read_text(encoding="latin-1")
                except UnicodeDecodeError:
                    # Skip files that can't be decoded
                    logger.warning(f"Skipping file with encoding issues: {file_path}")
                    return []
            lines = content.split("\n")

            for i, line in enumerate(lines, 1):
                if self._contains_success_advisor_8_reference(line):
                    movement_type = self._classify_markdown_movement(line)

                    movement = CodeMovement(
                        file_path=str(file_path),
                        line_number=i,
                        content=line.strip(),
                        movement_type=movement_type,
                        context={
                            "file_type": "markdown",
                            "heading_context": self._get_heading_context(lines, i),
                        },
                    )
                    movements.append(movement)

        except Exception:
            logger.exception("Failed to analyze Markdown file %s", file_path)

        return movements

    def _classify_python_movement(self, line: str) -> str:
        """Classify Python code movement type."""
        line_lower = line.lower()

        if "import" in line_lower or "from" in line_lower:
            return "import"
        if "class" in line_lower and "success" in line_lower:
            return "definition"
        if "def" in line_lower and "success" in line_lower:
            return "definition"
        if "success" in line_lower:
            return "usage"
        return "reference"

    def _classify_js_movement(self, line: str) -> str:
        """Classify JavaScript/TypeScript code movement type."""
        line_lower = line.lower()

        if "import" in line_lower or "require" in line_lower:
            return "import"
        if "class" in line_lower and "success" in line_lower:
            return "definition"
        if "function" in line_lower and "success" in line_lower:
            return "definition"
        if "success" in line_lower:
            return "usage"
        return "reference"

    def _classify_markdown_movement(self, line: str) -> str:
        """Classify Markdown movement type."""
        if line.startswith("#"):
            return "heading"
        if line.startswith("-") or line.startswith("*"):
            return "list_item"
        if "```" in line:
            return "code_block"
        return "text_reference"

    def _get_function_context(self, lines: list[str], line_number: int) -> str | None:
        """Get function context for Python line."""
        for i in range(line_number - 1, max(0, line_number - 10), -1):
            line = lines[i].strip()
            if line.startswith("def "):
                return line
        return None

    def _get_class_context(self, lines: list[str], line_number: int) -> str | None:
        """Get class context for Python line."""
        for i in range(line_number - 1, max(0, line_number - 20), -1):
            line = lines[i].strip()
            if line.startswith("class "):
                return line
        return None

    def _get_js_function_context(
        self,
        lines: list[str],
        line_number: int,
    ) -> str | None:
        """Get function context for JavaScript/TypeScript line."""
        for i in range(line_number - 1, max(0, line_number - 10), -1):
            line = lines[i].strip()
            if "function" in line or "=>" in line:
                return line
        return None

    def _get_js_class_context(self, lines: list[str], line_number: int) -> str | None:
        """Get class context for JavaScript/TypeScript line."""
        for i in range(line_number - 1, max(0, line_number - 20), -1):
            line = lines[i].strip()
            if "class" in line:
                return line
        return None

    def _get_heading_context(self, lines: list[str], line_number: int) -> str | None:
        """Get heading context for Markdown line."""
        for i in range(line_number - 1, max(0, line_number - 10), -1):
            line = lines[i].strip()
            if line.startswith("#"):
                return line
        return None

    def _generate_summary(
        self,
        activities: list[SuccessAdvisor8Activity],
        movements: list[CodeMovement],
    ) -> dict[str, Any]:
        """Generate summary statistics for legacy report."""
        # Activity type distribution
        activity_types = {}
        for activity in activities:
            activity_types[activity.activity_type] = (
                activity_types.get(activity.activity_type, 0) + 1
            )

        # Movement type distribution
        movement_types = {}
        for movement in movements:
            movement_types[movement.movement_type] = (
                movement_types.get(movement.movement_type, 0) + 1
            )

        # File type distribution
        file_types = {}
        for movement in movements:
            file_type = movement.context.get("file_type", "unknown")
            file_types[file_type] = file_types.get(file_type, 0) + 1

        # Version distribution
        versions = {}
        for activity in activities:
            if activity.version:
                versions[activity.version] = versions.get(activity.version, 0) + 1

        return {
            "activity_types": activity_types,
            "movement_types": movement_types,
            "file_types": file_types,
            "versions": versions,
            "total_files_scanned": len({movement.file_path for movement in movements}),
            "date_range": {
                "earliest": min(
                    (activity.timestamp for activity in activities),
                    default=None,
                ),
                "latest": max(
                    (activity.timestamp for activity in activities),
                    default=None,
                ),
            },
        }
