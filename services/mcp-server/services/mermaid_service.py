#!/usr/bin/env python3
"""
Mermaid Diagram Service
=======================

Handles mermaid diagram generation, validation, and rendering.
Uses the reusable PlaywrightBrowserService for rendering.
"""

import logging
import re
import tempfile
from pathlib import Path
from typing import Any

from services.playwright_browser_service import PlaywrightBrowserService

logger = logging.getLogger(__name__)


class MermaidService:
    """Service for mermaid diagram operations."""

    def __init__(self) -> None:
        self.temp_dir = Path(tempfile.gettempdir()) / "reynard_mermaid"
        self.temp_dir.mkdir(exist_ok=True)
        self.browser_service = PlaywrightBrowserService()

    def validate_diagram(
        self, diagram_content: str
    ) -> tuple[bool, list[str], list[str]]:
        """Validate mermaid diagram syntax."""
        errors: list[str] = []
        warnings: list[str] = []

        try:
            # Basic validation
            if not diagram_content.strip():
                errors.append("Diagram content is empty")
                return False, errors, warnings

            # Check for common syntax issues
            lines = diagram_content.strip().split("\n")
            for i, line in enumerate(lines, 1):
                line = line.strip()
                if not line or line.startswith("%%"):
                    continue

                # Check for unclosed brackets
                if line.count("[") != line.count("]"):
                    warnings.append(f"Line {i}: Possible unclosed brackets")

                # Check for unclosed parentheses
                if line.count("(") != line.count(")"):
                    warnings.append(f"Line {i}: Possible unclosed parentheses")

            return True, errors, warnings

        except Exception as e:
            errors.append(f"Validation error: {e!s}")
            return False, errors, warnings

    def render_diagram_to_svg(self, diagram_content: str) -> tuple[bool, str, str]:
        """Render mermaid diagram to SVG using Playwright with adaptive sizing."""
        try:
            # Get diagram stats for optimal viewport
            diagram_stats = self.get_diagram_stats(diagram_content)
            optimal_viewport = self._calculate_optimal_viewport(diagram_stats)

            html_content = self._create_mermaid_html(diagram_content, adaptive=True)
            return self.browser_service.render_html_to_svg_sync(
                html_content=html_content,
                selector=".mermaid svg",
                viewport_size=optimal_viewport,
            )
        except Exception as e:
            return False, "", f"Rendering error: {e!s}"

    def render_diagram_to_png(self, diagram_content: str) -> tuple[bool, str, str]:
        """Render mermaid diagram to PNG using Playwright with adaptive sizing."""
        try:
            # First, get the diagram dimensions to calculate optimal viewport
            diagram_stats = self.get_diagram_stats(diagram_content)
            optimal_viewport = self._calculate_optimal_viewport(diagram_stats)

            html_content = self._create_mermaid_html(diagram_content, adaptive=True)
            return self.browser_service.render_html_to_png_adaptive_sync(
                html_content=html_content,
                viewport_size=optimal_viewport,
                full_page=True,
                content_selector=".mermaid svg",
            )
        except Exception as e:
            return False, "", f"Rendering error: {e!s}"

    def _clean_diagram_content(self, content: str) -> str:
        """Clean mermaid diagram content."""
        # Remove mermaid code block markers
        content = re.sub(r"^```mermaid\n", "", content, flags=re.MULTILINE)
        content = re.sub(r"^```\n", "", content, flags=re.MULTILINE)
        content = re.sub(r"```$", "", content, flags=re.MULTILINE)

        # Ensure neutral theme
        if "%%{init:" not in content:
            content = "%%{init: {'theme': 'neutral'}}%%\n" + content

        return content.strip()

    def _calculate_optimal_viewport(
        self, diagram_stats: dict[str, Any]
    ) -> dict[str, int]:
        """Calculate optimal viewport size based on diagram complexity."""
        complexity = diagram_stats.get("complexity_score", 1)
        node_count = diagram_stats.get("node_count", 1)

        # Base dimensions for simple diagrams
        base_width = 1200
        base_height = 800

        # Scale based on complexity
        if complexity <= 5:
            # Simple diagrams - smaller viewport
            width = max(800, base_width)
            height = max(600, base_height)
        elif complexity <= 15:
            # Medium complexity - moderate viewport
            width = max(1200, base_width + (node_count * 50))
            height = max(800, base_height + (node_count * 30))
        else:
            # Complex diagrams - larger viewport
            width = max(1600, base_width + (node_count * 80))
            height = max(1200, base_height + (node_count * 50))

        return {"width": min(width, 4000), "height": min(height, 3000)}

    def _create_mermaid_html(self, diagram_content: str, adaptive: bool = False) -> str:
        """Create HTML template with Mermaid diagram."""
        clean_content = self._clean_diagram_content(diagram_content)

        # Choose CSS based on adaptive mode
        if adaptive:
            css_styles = """
                body {
                    margin: 0;
                    padding: 20px;
                    background: white;
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .diagram-container {
                    position: relative;
                    width: 100%;
                    max-width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .mermaid {
                    text-align: center;
                    width: 100%;
                    height: auto;
                    max-width: 100%;
                }
                .mermaid svg {
                    max-width: 100% !important;
                    width: auto !important;
                    height: auto !important;
                    display: block;
                    margin: 0 auto;
                }
                .mermaid .node rect,
                .mermaid .node circle,
                .mermaid .node ellipse,
                .mermaid .node polygon {
                    stroke-width: 2px !important;
                }
                .mermaid .edgePath path {
                    stroke-width: 1.5px !important;
                }
                .mermaid .edgeLabel {
                    font-size: 14px !important;
                    font-weight: bold !important;
                }
                .mermaid .nodeLabel {
                    font-size: 12px !important;
                    font-weight: bold !important;
                }
            """
        else:
            css_styles = """
                body {
                    margin: 0;
                    padding: 160px;
                    background: white;
                    font-family: Arial, sans-serif;
                    font-size: 24px;
                }
                .mermaid {
                    text-align: center;
                    width: 100%;
                    height: 100%;
                    min-height: 3200px;
                    transform: scale(4);
                    transform-origin: top left;
                }
                .mermaid svg {
                    max-width: none !important;
                    width: 100% !important;
                    height: auto !important;
                }
                .mermaid .node rect,
                .mermaid .node circle,
                .mermaid .node ellipse,
                .mermaid .node polygon {
                    stroke-width: 8px !important;
                }
                .mermaid .edgePath path {
                    stroke-width: 6px !important;
                }
                .mermaid .edgeLabel {
                    font-size: 32px !important;
                    font-weight: bold !important;
                }
                .mermaid .nodeLabel {
                    font-size: 28px !important;
                    font-weight: bold !important;
                }
            """

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
            <style>
                {css_styles}
            </style>
        </head>
        <body>
            <div class="diagram-container">
                <div class="mermaid">
                    {clean_content}
                </div>
            </div>
            <script>
                // Initialize Mermaid with proper configuration
                mermaid.initialize({{
                    startOnLoad: true,
                    theme: 'neutral',
                    securityLevel: 'loose',
                    fontFamily: 'Arial, sans-serif',
                    themeVariables: {{
                        primaryColor: '#ffffff',
                        primaryTextColor: '#000000',
                        primaryBorderColor: '#000000',
                        lineColor: '#000000',
                        sectionBkgColor: '#ffffff',
                        altBackground: '#ffffff',
                        gridColor: '#000000',
                        textColor: '#000000',
                        fontSize: '{"14px" if adaptive else "32px"}'
                    }},
                    flowchart: {{
                        useMaxWidth: {adaptive},
                        htmlLabels: true,
                        nodeSpacing: {25 if adaptive else 100},
                        rankSpacing: {25 if adaptive else 100},
                        curve: 'basis'
                    }},
                    sequence: {{
                        useMaxWidth: {adaptive}
                    }},
                    gantt: {{
                        useMaxWidth: {adaptive}
                    }}
                }});

                // Ensure content is loaded and rendered
                document.addEventListener('DOMContentLoaded', function() {{
                    // Force re-render if needed
                    setTimeout(function() {{
                        if (typeof mermaid !== 'undefined') {{
                            mermaid.contentLoaded();
                        }}
                    }}, 500);
                }});
            </script>
        </body>
        </html>
        """

    def get_diagram_stats(self, diagram_content: str) -> dict[str, Any]:
        """Get statistics about a mermaid diagram."""
        try:
            lines = diagram_content.strip().split("\n")

            # Remove code block markers
            lines = [line for line in lines if not line.strip().startswith("```")]

            # Count different elements
            node_count = 0
            edge_count = 0
            subgraph_count = 0

            for line in lines:
                line = line.strip()
                if not line or line.startswith("%%"):
                    continue

                # Count nodes (basic patterns)
                if "[" in line and "]" in line:
                    node_count += 1
                elif "(" in line and ")" in line:
                    node_count += 1

                # Count edges
                if "-->" in line or "---" in line or "->" in line:
                    edge_count += 1

                # Count subgraphs
                if line.startswith("subgraph"):
                    subgraph_count += 1

            return {
                "total_lines": len(lines),
                "node_count": node_count,
                "edge_count": edge_count,
                "subgraph_count": subgraph_count,
                "complexity_score": node_count + edge_count + subgraph_count,
            }

        except Exception as e:
            return {"error": f"Stats calculation error: {e!s}"}
