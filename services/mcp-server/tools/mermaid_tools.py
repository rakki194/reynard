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

from services.mermaid_service import MermaidService
from protocol.tool_registry import register_tool

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

    result_text = (
        "✅ Mermaid diagram is valid!" if is_valid else "❌ Mermaid diagram has errors:"
    )

    if errors:
        result_text += "\n\n🚨 Errors:\n" + "\n".join(f"• {error}" for error in errors)

    if warnings:
        result_text += "\n\n⚠️ Warnings:\n" + "\n".join(
            f"• {warning}" for warning in warnings
        )

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
        svg_content = mermaid_service.render_to_svg(diagram_content)

        if output_path:
            # Save to file
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(svg_content)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Mermaid diagram rendered to SVG and saved to: {output_path}",
                    }
                ]
            }
        else:
            # Return SVG content
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Mermaid diagram rendered to SVG:\n\n{svg_content}",
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
def render_mermaid_to_png(**kwargs) -> dict[str, Any]:
    """Render mermaid diagram to PNG format."""
    arguments = kwargs.get("arguments", {})
    diagram_content = arguments.get("diagram_content", "")
    output_path = arguments.get("output_path")
    width = arguments.get("width", 800)
    height = arguments.get("height", 600)

    if not diagram_content:
        return {
            "content": [
                {"type": "text", "text": "❌ Error: No diagram content provided"}
            ]
        }

    try:
        png_data = mermaid_service.render_to_png(diagram_content, width, height)

        if output_path:
            # Save to file
            with open(output_path, "wb") as f:
                f.write(png_data)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Mermaid diagram rendered to PNG and saved to: {output_path}",
                    }
                ]
            }
        else:
            # Return base64 encoded PNG
            import base64

            png_base64 = base64.b64encode(png_data).decode("utf-8")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Mermaid diagram rendered to PNG (base64):\n\n{png_base64}",
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
        # Test validation
        is_valid, errors, warnings = mermaid_service.validate_diagram(test_diagram)

        result_text = "🧪 Mermaid Rendering Test:\n\n"
        result_text += f"✅ Validation: {'PASSED' if is_valid else 'FAILED'}\n"

        if errors:
            result_text += f"🚨 Errors: {len(errors)}\n"
        if warnings:
            result_text += f"⚠️ Warnings: {len(warnings)}\n"

        # Test SVG rendering
        try:
            svg_content = mermaid_service.render_to_svg(test_diagram)
            result_text += "✅ SVG Rendering: PASSED\n"
        except Exception as e:
            result_text += f"❌ SVG Rendering: FAILED - {e!s}\n"

        return {"content": [{"type": "text", "text": result_text}]}

    except Exception as e:
        logger.exception("Error testing mermaid render: %s", e)
        return {
            "content": [
                {"type": "text", "text": f"❌ Error testing mermaid render: {e!s}"}
            ]
        }
