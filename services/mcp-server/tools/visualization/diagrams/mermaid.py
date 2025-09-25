#!/usr/bin/env python3
"""
Mermaid Tools Handler
=====================

Handles mermaid diagram-related MCP tool calls.
Now uses the new @register_tool decorator system for automatic registration.

Follows the 140-line axiom and modular architecture principles.
"""

import logging
import sys
from pathlib import Path
from typing import Any

# Add the MCP directory to Python path for imports
mcp_dir = Path(__file__).parent.parent
if str(mcp_dir) not in sys.path:
    sys.path.insert(0, str(mcp_dir))

import sys
from pathlib import Path

from protocol.tool_registry import register_tool

# Add the services directory to Python path for imports
services_dir = Path(__file__).parent.parent / "services"
if str(services_dir) not in sys.path:
    sys.path.insert(0, str(services_dir))

from services.mermaid_service import MermaidService

logger = logging.getLogger(__name__)

# Initialize service
mermaid_service = MermaidService()


@register_tool(
    name="validate_mermaid_diagram",
    category="visualization",
    description="Validate mermaid diagram syntax and check for errors",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def validate_mermaid_diagram(**kwargs) -> dict[str, Any]:
    """Validate mermaid diagram syntax."""
    arguments = kwargs.get("arguments", {})
    diagram_content = arguments.get("diagram_content", "")

    if not diagram_content:
        return {
            "content": [
                {"type": "text", "text": "❌ Error: No diagram content provided"}
            ]
        }

    is_valid, errors, warnings = mermaid_service.validate_diagram(diagram_content)

    if is_valid:
        result_text = "✅ Mermaid diagram is valid!"
    else:
        result_text = f"❌ Mermaid diagram has errors: {', '.join(errors)}"

    return {"content": [{"type": "text", "text": result_text}]}


@register_tool(
    name="render_mermaid_to_svg",
    category="visualization",
    description="Render mermaid diagram to SVG format",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def render_mermaid_to_svg(**kwargs) -> dict[str, Any]:
    """Render mermaid diagram to SVG format."""
    arguments = kwargs.get("arguments", {})
    diagram_content = arguments.get("diagram_content", "")
    output_path = arguments.get("output_path")

    if not diagram_content:
        return {
            "content": [
                {"type": "text", "text": "❌ Error: No diagram content provided"}
            ]
        }

    try:
        if output_path:
            success, saved_path, error = mermaid_service.save_diagram_as_svg(
                diagram_content, output_path
            )
            if not success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Error rendering mermaid diagram: {error}",
                        }
                    ]
                }
            result_text = (
                f"✅ Mermaid diagram rendered to SVG and saved to: {saved_path}"
            )
        else:
            success, svg_content, error = mermaid_service.render_diagram_to_svg(
                diagram_content
            )
            if not success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Error rendering mermaid diagram: {error}",
                        }
                    ]
                }
            result_text = f"✅ Mermaid diagram rendered to SVG successfully! ({len(svg_content)} chars)"

        return {
            "content": [
                {
                    "type": "text",
                    "text": result_text,
                }
            ]
        }

    except Exception as e:
        logger.exception("Error rendering mermaid diagram: %s", e)
        return {
            "content": [
                {"type": "text", "text": f"❌ Error rendering mermaid diagram: {e!s}"}
            ]
        }


@register_tool(
    name="render_mermaid_to_png",
    category="visualization",
    description="Render mermaid diagram to PNG format",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def render_mermaid_to_png(arguments: dict[str, Any]) -> dict[str, Any]:
    """Render mermaid diagram to PNG format."""
    # Extract the actual arguments from the wrapped structure
    actual_args = arguments.get("arguments", arguments)
    diagram_content = actual_args.get("diagram_content", "")
    output_path = actual_args.get("output_path")
    width = actual_args.get("width", 800)
    height = actual_args.get("height", 600)

    if not diagram_content:
        return {
            "content": [
                {"type": "text", "text": "❌ Error: No diagram content provided"}
            ]
        }

    try:
        if output_path:
            success, saved_path, error = mermaid_service.save_diagram_as_png(
                diagram_content, output_path
            )
            if not success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Error rendering mermaid diagram to PNG: {error}",
                        }
                    ]
                }
            result_text = (
                f"✅ Mermaid diagram rendered to PNG and saved to: {saved_path}"
            )
        else:
            success, png_data, error = mermaid_service.render_diagram_to_png(
                diagram_content
            )
            if not success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Error rendering mermaid diagram to PNG: {error}",
                        }
                    ]
                }
            result_text = f"✅ Mermaid diagram rendered to PNG successfully! ({len(png_data)} bytes)"

        return {
            "content": [
                {
                    "type": "text",
                    "text": result_text,
                }
            ]
        }

    except Exception as e:
        logger.exception("Error rendering mermaid diagram to PNG: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error rendering mermaid diagram to PNG: {e!s}",
                }
            ]
        }


@register_tool(
    name="get_mermaid_diagram_stats",
    category="visualization",
    description="Get statistics and analysis of a mermaid diagram",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def get_mermaid_diagram_stats(**kwargs) -> dict[str, Any]:
    """Get statistics and analysis of a mermaid diagram."""
    arguments = kwargs.get("arguments", {})
    diagram_content = arguments.get("diagram_content", "")

    if not diagram_content:
        return {
            "content": [
                {"type": "text", "text": "❌ Error: No diagram content provided"}
            ]
        }

    try:
        stats = mermaid_service.get_diagram_stats(diagram_content)

        result_text = "📊 Mermaid Diagram Statistics:\n\n"
        for key, value in stats.items():
            result_text += f"• {key}: {value}\n"

        return {"content": [{"type": "text", "text": result_text}]}

    except Exception as e:
        logger.exception("Error getting mermaid diagram stats: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting mermaid diagram stats: {e!s}",
                }
            ]
        }


@register_tool(
    name="test_mermaid_render",
    category="visualization",
    description="Test mermaid diagram rendering with a simple example",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def test_mermaid_render(**kwargs) -> dict[str, Any]:
    """Test mermaid diagram rendering with a simple example."""
    test_diagram = """
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
"""

    try:
        # Test SVG rendering
        svg_success, svg_content, svg_error = mermaid_service.render_diagram_to_svg(
            test_diagram
        )

        # Test PNG rendering
        png_success, png_data, png_error = mermaid_service.render_diagram_to_png(
            test_diagram
        )

        result_text = "🧪 Mermaid Rendering Test:\n\n"

        if svg_success and png_success:
            result_text += "✅ All tests PASSED!\n\n"
        else:
            result_text += "❌ Some tests FAILED!\n\n"

        if svg_success:
            result_text += f"✅ SVG Rendering: PASSED - {len(svg_content)} chars\n"
        else:
            result_text += f"❌ SVG Rendering: FAILED - {svg_error}\n"

        if png_success:
            result_text += f"✅ PNG Rendering: PASSED - {len(png_data)} bytes\n"
        else:
            result_text += f"❌ PNG Rendering: FAILED - {png_error}\n"

        return {"content": [{"type": "text", "text": result_text}]}

    except Exception as e:
        logger.exception("Error testing mermaid render: %s", e)
        return {
            "content": [
                {"type": "text", "text": f"❌ Error testing mermaid render: {e!s}"}
            ]
        }
