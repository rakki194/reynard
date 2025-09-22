"""
Mermaid Service

Core service for rendering Mermaid diagrams using PlaywrightBrowserService.
This service provides a clean interface for the MCP server to render diagrams.
"""

import os
import time
from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union

from .playwright_browser_service import PlaywrightBrowserService


class MermaidService:
    """
    Service for rendering Mermaid diagrams to SVG and PNG formats.

    This service uses PlaywrightBrowserService with mermaid.js to provide
    reliable and fast conversion of Mermaid syntax to visual formats.
    """

    def __init__(self):
        """
        Initialize the Mermaid service.
        """
        try:
            self.browser_service = PlaywrightBrowserService()
            self.mermaid_version = "11.0.2"  # Latest stable version
            self.available = True
        except Exception as e:
            print(f"Warning: Failed to initialize mermaid service: {e}")
            self.browser_service = None
            self.available = False

    def _create_mermaid_html(
        self,
        diagram: str,
        theme: str = "neutral",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
    ) -> str:
        """
        Create HTML content for mermaid rendering.

        Args:
            diagram: The mermaid diagram content
            theme: Mermaid theme (default, neutral, dark, forest)
            bg_color: Background color (optional)
            width: Custom width (optional)
            height: Custom height (optional)

        Returns:
            HTML content string
        """
        # Clean the diagram content
        clean_diagram = diagram.strip()

        # Create the HTML template
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Mermaid Diagram</title>
    <style>
        body {{
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: {bg_color or 'white'};
        }}
        .mermaid {{
            text-align: center;
            max-width: 100%;
            height: auto;
        }}
    </style>
</head>
<body>
    <div class="mermaid">
{clean_diagram}
    </div>

    <script src="https://cdn.jsdelivr.net/npm/mermaid@{self.mermaid_version}/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({{
            startOnLoad: true,
            theme: '{theme}',
            securityLevel: 'loose',
            fontFamily: 'Arial, sans-serif',
            flowchart: {{
                useMaxWidth: true,
                htmlLabels: false,  // Use SVG text elements for proper text rendering
                nodeSpacing: 50,
                rankSpacing: 50,
                curve: 'basis'
            }},
            sequence: {{
                useMaxWidth: true
            }},
            gantt: {{
                useMaxWidth: true
            }}
        }});
    </script>
</body>
</html>
"""
        return html_content

    def render_diagram_to_svg(
        self,
        diagram_content: str,
        theme: str = "neutral",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
    ) -> Tuple[bool, str, str]:
        """
        Render a mermaid diagram to SVG format.

        Args:
            diagram_content: The mermaid diagram content
            theme: Mermaid theme
            bg_color: Background color
            width: Custom width
            height: Custom height

        Returns:
            Tuple of (success, svg_content, error_message)
        """
        if not self.available or not self.browser_service:
            return False, "", "Mermaid service is not available"

        try:
            html_content = self._create_mermaid_html(
                diagram_content, theme, bg_color, width, height
            )

            success, svg_content, error = self.browser_service.render_html_to_svg_sync(
                html_content=html_content,
                viewport_size={"width": 1920, "height": 1080},
                selector=".mermaid",
            )

            if not success:
                return False, "", f"SVG rendering failed: {error}"

            return True, svg_content, ""

        except Exception as e:
            return False, "", f"SVG rendering error: {e}"

    def render_diagram_to_png(
        self,
        diagram_content: str,
        theme: str = "neutral",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
    ) -> Tuple[bool, bytes, str]:
        """
        Render a mermaid diagram to PNG format.

        Args:
            diagram_content: The mermaid diagram content
            theme: Mermaid theme
            bg_color: Background color
            width: Custom width
            height: Custom height

        Returns:
            Tuple of (success, png_data, error_message)
        """
        if not self.available or not self.browser_service:
            return False, b"", "Mermaid service is not available"

        try:
            html_content = self._create_mermaid_html(
                diagram_content, theme, bg_color, width, height
            )

            success, png_path, error = (
                self.browser_service.render_html_to_png_adaptive_sync(
                    html_content=html_content,
                    viewport_size={"width": 1920, "height": 1080},
                    full_page=True,
                )
            )

            if not success:
                return False, b"", f"PNG rendering failed: {error}"

            # Read the PNG file
            with open(png_path, "rb") as f:
                png_data = f.read()

            return True, png_data, ""

        except Exception as e:
            return False, b"", f"PNG rendering error: {e}"

    def save_diagram_as_svg(
        self,
        diagram_content: str,
        output_path: str,
        theme: str = "neutral",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
    ) -> Tuple[bool, str, str]:
        """
        Render and save a mermaid diagram as SVG.

        Args:
            diagram_content: The mermaid diagram content
            output_path: Path to save the SVG file
            theme: Mermaid theme
            bg_color: Background color
            width: Custom width
            height: Custom height

        Returns:
            Tuple of (success, output_path, error_message)
        """
        try:
            success, svg_content, error = self.render_diagram_to_svg(
                diagram_content, theme, bg_color, width, height
            )
            if not success:
                return False, "", error

            # Ensure directory exists
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)

            # Save to file
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(svg_content)

            return True, output_path, ""

        except Exception as e:
            return False, "", f"SVG save error: {e}"

    def save_diagram_as_png(
        self,
        diagram_content: str,
        output_path: str,
        theme: str = "neutral",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
    ) -> Tuple[bool, str, str]:
        """
        Render and save a mermaid diagram as PNG.

        Args:
            diagram_content: The mermaid diagram content
            output_path: Path to save the PNG file
            theme: Mermaid theme
            bg_color: Background color
            width: Custom width
            height: Custom height

        Returns:
            Tuple of (success, output_path, error_message)
        """
        try:
            success, png_data, error = self.render_diagram_to_png(
                diagram_content, theme, bg_color, width, height
            )
            if not success:
                return False, "", error

            # Ensure directory exists
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)

            # Save to file
            with open(output_path, "wb") as f:
                f.write(png_data)

            return True, output_path, ""

        except Exception as e:
            return False, "", f"PNG save error: {e}"

    def validate_diagram(self, diagram_content: str) -> Tuple[bool, list, list]:
        """
        Validate a mermaid diagram by attempting to render it.

        Args:
            diagram_content: The mermaid diagram content

        Returns:
            Tuple of (is_valid, errors, warnings)
        """
        if not self.available or not self.browser_service:
            return False, ["Mermaid service is not available"], []

        try:
            success, _, error = self.render_diagram_to_svg(diagram_content)
            if success:
                return True, [], []
            else:
                return False, [error], []
        except Exception as e:
            return False, [str(e)], []

    def get_diagram_stats(self, diagram_content: str) -> Dict[str, Any]:
        """
        Get statistics about a mermaid diagram.

        Args:
            diagram_content: The mermaid diagram content

        Returns:
            Dictionary with diagram statistics
        """
        if not self.available or not self.browser_service:
            return {
                "valid": False,
                "svg_size": 0,
                "png_size": 0,
                "diagram_length": len(diagram_content),
                "lines": len(diagram_content.splitlines()),
                "error": "Mermaid service is not available",
            }

        try:
            success, svg_content, svg_error = self.render_diagram_to_svg(
                diagram_content
            )
            success_png, png_data, png_error = self.render_diagram_to_png(
                diagram_content
            )

            return {
                "valid": success,
                "svg_size": len(svg_content) if success else 0,
                "png_size": len(png_data) if success_png else 0,
                "diagram_length": len(diagram_content),
                "lines": len(diagram_content.splitlines()),
                "svg_error": svg_error if not success else None,
                "png_error": png_error if not success_png else None,
            }
        except Exception as e:
            return {
                "valid": False,
                "svg_size": 0,
                "png_size": 0,
                "diagram_length": len(diagram_content),
                "lines": len(diagram_content.splitlines()),
                "error": str(e),
            }
