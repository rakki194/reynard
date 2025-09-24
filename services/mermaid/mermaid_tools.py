"""Mermaid Tools

MCP tools for rendering Mermaid diagrams to SVG and PNG formats.
These tools provide the interface between the MCP server and the Mermaid service.
"""

import subprocess
import time
from pathlib import Path
from typing import Any

from .mermaid_service import MermaidService


class MermaidTools:
    """MCP tools for Mermaid diagram operations.

    This class provides the tools that can be called from the MCP server
    to render, validate, and analyze Mermaid diagrams.
    """

    def __init__(self):
        """Initialize the Mermaid tools with a service instance."""
        self.mermaid_service = MermaidService()

    def validate_mermaid_diagram(self, diagram_content: str) -> dict[str, Any]:
        """Validate a Mermaid diagram and check for errors.

        Args:
            diagram_content: The Mermaid diagram content to validate

        Returns:
            Dictionary with validation results

        """
        try:
            is_valid, error_message = self.mermaid_service.validate_diagram(
                diagram_content,
            )

            return {
                "valid": is_valid,
                "error": error_message if not is_valid else None,
                "diagram_length": len(diagram_content),
                "lines": len(diagram_content.splitlines()),
            }
        except Exception as e:
            return {
                "valid": False,
                "error": f"Validation error: {e}",
                "diagram_length": len(diagram_content),
                "lines": len(diagram_content.splitlines()),
            }

    def render_mermaid_to_svg(
        self, diagram_content: str, output_path: str = None,
    ) -> dict[str, Any]:
        """Render a Mermaid diagram to SVG format.

        Args:
            diagram_content: The Mermaid diagram content to render
            output_path: Optional path to save the SVG file

        Returns:
            Dictionary with rendering results

        """
        try:
            if output_path:
                # Save to specified path
                saved_path = self.mermaid_service.save_svg(diagram_content, output_path)
                return {
                    "success": True,
                    "svg_content": None,
                    "output_path": saved_path,
                    "error": None,
                }
            # Generate timestamped filename
            timestamp = int(time.time())
            output_path = f"/home/kade/diagrams/mermaid_diagram_{timestamp}.svg"

            # Ensure directory exists
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)

            # Save the SVG
            saved_path = self.mermaid_service.save_svg(diagram_content, output_path)

            return {
                "success": True,
                "svg_content": None,
                "output_path": saved_path,
                "error": None,
            }
        except Exception as e:
            return {
                "success": False,
                "svg_content": None,
                "output_path": None,
                "error": f"SVG rendering error: {e}",
            }

    def render_mermaid_to_png(
        self, diagram_content: str, output_path: str = None,
    ) -> dict[str, Any]:
        """Render a Mermaid diagram to PNG format.

        Args:
            diagram_content: The Mermaid diagram content to render
            output_path: Optional path to save the PNG file

        Returns:
            Dictionary with rendering results

        """
        try:
            if output_path:
                # Save to specified path
                saved_path = self.mermaid_service.save_png(diagram_content, output_path)

                # Try to open with imv
                try:
                    subprocess.Popen(
                        ["imv", saved_path],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
                    imv_status = " and opened with imv"
                except Exception as e:
                    imv_status = f" (imv failed to open: {e})"

                return {
                    "success": True,
                    "png_data": None,
                    "output_path": saved_path,
                    "imv_status": imv_status,
                    "error": None,
                }
            # Generate timestamped filename
            timestamp = int(time.time())
            output_path = f"/home/kade/diagrams/mermaid_diagram_{timestamp}.png"

            # Ensure directory exists
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)

            # Save the PNG
            saved_path = self.mermaid_service.save_png(diagram_content, output_path)

            # Try to open with imv
            try:
                subprocess.Popen(
                    ["imv", saved_path],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                imv_status = " and opened with imv"
            except Exception as e:
                imv_status = f" (imv failed to open: {e})"

            return {
                "success": True,
                "png_data": None,
                "output_path": saved_path,
                "imv_status": imv_status,
                "error": None,
            }
        except Exception as e:
            return {
                "success": False,
                "png_data": None,
                "output_path": None,
                "imv_status": None,
                "error": f"PNG rendering error: {e}",
            }

    def get_mermaid_diagram_stats(self, diagram_content: str) -> dict[str, Any]:
        """Get statistics and analysis of a Mermaid diagram.

        Args:
            diagram_content: The Mermaid diagram content to analyze

        Returns:
            Dictionary with diagram statistics

        """
        try:
            stats = self.mermaid_service.get_diagram_stats(diagram_content)
            return stats
        except Exception as e:
            return {
                "valid": False,
                "svg_size": 0,
                "png_size": 0,
                "diagram_length": len(diagram_content),
                "lines": len(diagram_content.splitlines()),
                "error": f"Stats error: {e}",
            }

    def test_mermaid_render(self) -> dict[str, Any]:
        """Test mermaid diagram rendering with a simple example.

        Returns:
            Dictionary with test results

        """
        test_diagram = """graph TD
    A[Start] --> B[End]"""

        try:
            # Test SVG rendering
            svg_result = self.render_mermaid_to_svg(test_diagram)

            # Test PNG rendering
            png_result = self.render_mermaid_to_png(test_diagram)

            return {
                "success": True,
                "svg_test": svg_result,
                "png_test": png_result,
                "error": None,
            }
        except Exception as e:
            return {
                "success": False,
                "svg_test": None,
                "png_test": None,
                "error": f"Test error: {e}",
            }
