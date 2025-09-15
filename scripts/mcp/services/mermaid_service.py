#!/usr/bin/env python3
"""
Mermaid Diagram Service
=======================

Handles mermaid diagram generation, validation, and rendering.
Follows the 100-line axiom and modular architecture principles.
"""

import logging
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class MermaidService:
    """Service for mermaid diagram operations."""

    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "reynard_mermaid"
        self.temp_dir.mkdir(exist_ok=True)

    def validate_diagram(
        self, diagram_content: str
    ) -> tuple[bool, list[str], list[str]]:
        """Validate mermaid diagram syntax."""
        errors = []
        warnings = []

        try:
            # Basic syntax validation
            if not diagram_content.strip():
                errors.append("Empty diagram content")
                return False, errors, warnings

            # Check for basic mermaid structure
            lines = diagram_content.strip().split("\n")

            # Remove mermaid code block markers if present
            if lines[0].startswith("```mermaid"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]

            # Check for graph declaration
            has_graph = any(
                line.strip().startswith("graph") or line.strip().startswith("flowchart")
                for line in lines
            )
            if not has_graph:
                errors.append("Missing graph or flowchart declaration")

            # Check for connections
            has_connections = any("-->" in line or "---" in line for line in lines)
            if not has_connections:
                errors.append("No connections found in diagram")

            # Check for quote balance
            for i, line in enumerate(lines, 1):
                if '"' in line and not line.strip().startswith("style"):
                    quote_count = line.count('"')
                    if quote_count % 2 != 0:
                        errors.append(f"Line {i}: Unclosed quotes in node label")

            # Check for very long lines
            for i, line in enumerate(lines, 1):
                if len(line) > 200:
                    warnings.append(f"Line {i}: Very long line ({len(line)} chars)")

            return len(errors) == 0, errors, warnings

        except Exception as e:
            errors.append(f"Validation error: {e!s}")
            return False, errors, warnings

    def render_diagram_to_svg(self, diagram_content: str) -> tuple[bool, str, str]:
        """Render mermaid diagram to SVG using mermaid-cli."""
        try:
            # Clean the diagram content
            clean_content = self._clean_diagram_content(diagram_content)

            # Create temporary files
            input_file = self.temp_dir / "input.mmd"
            output_file = self.temp_dir / "output.svg"

            # Write diagram to file
            with open(input_file, "w", encoding="utf-8") as f:
                f.write(clean_content)

            # Try to render using mermaid-cli
            try:
                result = subprocess.run(
                    [
                        "mmdc",
                        "-i",
                        str(input_file),
                        "-o",
                        str(output_file),
                        "--theme",
                        "neutral",
                        "--backgroundColor",
                        "white",
                    ],
                    capture_output=True,
                    text=True,
                    timeout=30,
                    check=False,
                )

                if result.returncode == 0 and output_file.exists():
                    with open(output_file, encoding="utf-8") as f:
                        svg_content = f.read()
                    return True, svg_content, ""
                return False, "", f"mermaid-cli error: {result.stderr}"

            except FileNotFoundError:
                # Fallback: return the mermaid code with instructions
                return (
                    False,
                    "",
                    "mermaid-cli not found. Install with: npm install -g @mermaid-js/mermaid-cli",
                )

        except Exception as e:
            return False, "", f"Rendering error: {e!s}"

    def render_diagram_to_png(self, diagram_content: str) -> tuple[bool, bytes, str]:
        """Render mermaid diagram to PNG using mermaid-cli."""
        try:
            # Clean the diagram content
            clean_content = self._clean_diagram_content(diagram_content)

            # Create temporary files
            input_file = self.temp_dir / "input.mmd"
            output_file = self.temp_dir / "output.png"

            # Write diagram to file
            with open(input_file, "w", encoding="utf-8") as f:
                f.write(clean_content)

            # Try to render using mermaid-cli
            try:
                result = subprocess.run(
                    [
                        "mmdc",
                        "-i",
                        str(input_file),
                        "-o",
                        str(output_file),
                        "--theme",
                        "neutral",
                        "--backgroundColor",
                        "white",
                    ],
                    capture_output=True,
                    text=True,
                    timeout=30,
                    check=False,
                )

                if result.returncode == 0 and output_file.exists():
                    with open(output_file, "rb") as f:
                        png_content = f.read()
                    return True, png_content, ""
                return False, b"", f"mermaid-cli error: {result.stderr}"

            except FileNotFoundError:
                return (
                    False,
                    b"",
                    "mermaid-cli not found. Install with: npm install -g @mermaid-js/mermaid-cli",
                )

        except Exception as e:
            return False, b"", f"Rendering error: {e!s}"

    def _clean_diagram_content(self, content: str) -> str:
        """Clean mermaid diagram content."""
        # Remove mermaid code block markers
        content = re.sub(r"^```mermaid\n", "", content, flags=re.MULTILINE)
        content = re.sub(r"\n```$", "", content, flags=re.MULTILINE)

        # Ensure neutral theme
        if "%%{init:" not in content:
            content = "%%{init: {'theme': 'neutral'}}%%\n" + content

        return content.strip()

    def get_diagram_stats(self, diagram_content: str) -> dict[str, Any]:
        """Get statistics about a mermaid diagram."""
        try:
            lines = diagram_content.strip().split("\n")

            # Remove code block markers
            if lines[0].startswith("```mermaid"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]

            connections = [
                line
                for line in lines
                if "-->" in line and not line.strip().startswith("style")
            ]
            style_lines = [line for line in lines if line.strip().startswith("style")]

            return {
                "total_lines": len(lines),
                "connections": len(connections),
                "style_rules": len(style_lines),
                "has_theme": any("%%{init:" in line for line in lines),
                "diagram_type": self._detect_diagram_type(lines),
            }
        except Exception as e:
            return {"error": str(e)}

    def _detect_diagram_type(self, lines: list[str]) -> str:
        """Detect the type of mermaid diagram."""
        for line in lines:
            if line.strip().startswith("graph"):
                return "graph"
            if line.strip().startswith("flowchart"):
                return "flowchart"
            if line.strip().startswith("sequenceDiagram"):
                return "sequence"
            if line.strip().startswith("classDiagram"):
                return "class"
            if line.strip().startswith("gantt"):
                return "gantt"
        return "unknown"
