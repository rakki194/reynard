#!/usr/bin/env python3
"""
Mermaid Tools Handler
=====================

Handles mermaid diagram-related MCP tool calls.
Follows the 100-line axiom and modular architecture principles.
"""

import base64
import logging
import sys
from pathlib import Path
from typing import Any

# Add the MCP directory to Python path for imports
mcp_dir = Path(__file__).parent.parent
if str(mcp_dir) not in sys.path:
    sys.path.insert(0, str(mcp_dir))

from services.mermaid_service import MermaidService

logger = logging.getLogger(__name__)


class MermaidTools:
    """Handles mermaid diagram tool operations."""

    def __init__(self):
        self.mermaid_service = MermaidService()

    def validate_mermaid_diagram(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Validate mermaid diagram syntax."""
        diagram_content = arguments.get("diagram_content", "")

        if not diagram_content:
            return {
                "content": [
                    {"type": "text", "text": "❌ Error: No diagram content provided"}
                ]
            }

        is_valid, errors, warnings = self.mermaid_service.validate_diagram(
            diagram_content
        )

        result_text = (
            "✅ Mermaid diagram is valid!"
            if is_valid
            else "❌ Mermaid diagram has errors:"
        )

        if errors:
            result_text += "\n\nErrors:"
            for error in errors:
                result_text += f"\n  - {error}"

        if warnings:
            result_text += "\n\n⚠️  Warnings:"
            for warning in warnings:
                result_text += f"\n  - {warning}"

        return {"content": [{"type": "text", "text": result_text}]}

    def render_mermaid_to_svg(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Render mermaid diagram to SVG."""
        diagram_content = arguments.get("diagram_content", "")

        if not diagram_content:
            return {
                "content": [
                    {"type": "text", "text": "❌ Error: No diagram content provided"}
                ]
            }

        success, svg_content, error = self.mermaid_service.render_diagram_to_svg(
            diagram_content
        )

        if success:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Successfully rendered diagram to SVG ({len(svg_content)} characters)",
                    },
                    {"type": "text", "text": svg_content},
                ]
            }
        return {
            "content": [
                {"type": "text", "text": f"❌ Failed to render diagram: {error}"}
            ]
        }

    def render_mermaid_to_png(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Render mermaid diagram to PNG."""
        diagram_content = arguments.get("diagram_content", "")

        if not diagram_content:
            return {
                "content": [
                    {"type": "text", "text": "❌ Error: No diagram content provided"}
                ]
            }

        success, png_content, error = self.mermaid_service.render_diagram_to_png(
            diagram_content
        )

        if success:
            # Encode PNG as base64 for transmission
            png_base64 = base64.b64encode(png_content).decode("utf-8")

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Successfully rendered diagram to PNG ({len(png_content)} bytes)",
                    },
                    {"type": "text", "text": f"data:image/png;base64,{png_base64}"},
                ]
            }
        return {
            "content": [
                {"type": "text", "text": f"❌ Failed to render diagram: {error}"}
            ]
        }

    def get_mermaid_diagram_stats(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get statistics about a mermaid diagram."""
        diagram_content = arguments.get("diagram_content", "")

        if not diagram_content:
            return {
                "content": [
                    {"type": "text", "text": "❌ Error: No diagram content provided"}
                ]
            }

        stats = self.mermaid_service.get_diagram_stats(diagram_content)

        if "error" in stats:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error analyzing diagram: {stats['error']}",
                    }
                ]
            }

        stats_text = "📊 Diagram Statistics:\n"
        stats_text += f"  - Total lines: {stats.get('total_lines', 0)}\n"
        stats_text += f"  - Connections: {stats.get('connections', 0)}\n"
        stats_text += f"  - Style rules: {stats.get('style_rules', 0)}\n"
        stats_text += f"  - Has theme: {stats.get('has_theme', False)}\n"
        stats_text += f"  - Diagram type: {stats.get('diagram_type', 'unknown')}"

        return {"content": [{"type": "text", "text": stats_text}]}

    def test_mermaid_render(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Test mermaid diagram rendering with a simple example."""
        test_diagram = """%%{init: {'theme': 'neutral'}}%%
graph TD
    A[Start] --> B[Process]
    B --> C[End]"""

        # Validate
        is_valid, errors, warnings = self.mermaid_service.validate_diagram(test_diagram)

        result_text = "🧪 Mermaid Rendering Test\n\n"
        result_text += f"Validation: {'✅ Valid' if is_valid else '❌ Invalid'}\n"

        if errors:
            result_text += f"Errors: {len(errors)}\n"
        if warnings:
            result_text += f"Warnings: {len(warnings)}\n"

        # Try to render
        success, svg_content, error = self.mermaid_service.render_diagram_to_svg(
            test_diagram
        )
        result_text += (
            f"SVG Rendering: {'✅ Success' if success else f'❌ Failed: {error}'}\n"
        )

        result_text += f"\nTest Diagram:\n```mermaid\n{test_diagram}\n```"

        return {"content": [{"type": "text", "text": result_text}]}
