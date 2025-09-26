"""
Mermaid Rendering Service

Main service class that provides a clean interface for Mermaid diagram rendering
with comprehensive format support and error handling.
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

from .mermaid_renderer import MermaidRenderer

logger = logging.getLogger(__name__)


class MermaidRenderingService:
    """Main service for Mermaid diagram rendering operations."""

    def __init__(self) -> None:
        """Initialize the Mermaid rendering service."""
        try:
            self.renderer = MermaidRenderer()
            self.available = self.renderer.is_available()
            if self.available:
                logger.info("Mermaid rendering service initialized successfully")
            else:
                logger.warning(
                    "Mermaid rendering service initialized but Playwright not available"
                )
        except Exception as e:
            logger.error(f"Failed to initialize Mermaid rendering service: {e}")
            self.renderer = None
            self.available = False

    def render_to_svg(
        self,
        diagram: str,
        theme: str = "default",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, str, str]:
        """Render a Mermaid diagram to SVG format."""
        if not self.available or not self.renderer:
            return False, "", "Mermaid rendering service is not available"

        try:
            return self.renderer.render_to_svg(
                diagram, theme, bg_color, width, height, config
            )
        except Exception as e:
            logger.error(f"SVG rendering error: {e}")
            return False, "", f"SVG rendering error: {e}"

    def render_to_png(
        self,
        diagram: str,
        theme: str = "default",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        quality: int = 100,
        config: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, bytes, str]:
        """Render a Mermaid diagram to PNG format."""
        if not self.available or not self.renderer:
            return False, b"", "Mermaid rendering service is not available"

        try:
            return self.renderer.render_to_png(
                diagram, theme, bg_color, width, height, quality, config
            )
        except Exception as e:
            logger.error(f"PNG rendering error: {e}")
            return False, b"", f"PNG rendering error: {e}"

    def render_to_pdf(
        self,
        diagram: str,
        theme: str = "default",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        config: Optional[Dict[str, Any]] = None,
        pdf_options: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, bytes, str]:
        """Render a Mermaid diagram to PDF format."""
        if not self.available or not self.renderer:
            return False, b"", "Mermaid rendering service is not available"

        try:
            return self.renderer.render_to_pdf(
                diagram, theme, bg_color, width, height, config, pdf_options
            )
        except Exception as e:
            logger.error(f"PDF rendering error: {e}")
            return False, b"", f"PDF rendering error: {e}"

    def save_svg(
        self,
        diagram: str,
        output_path: str,
        theme: str = "default",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, str, str]:
        """Render and save a Mermaid diagram as SVG."""
        if not self.available or not self.renderer:
            return False, "", "Mermaid rendering service is not available"

        try:
            return self.renderer.save_svg(
                diagram, output_path, theme, bg_color, width, height, config
            )
        except Exception as e:
            logger.error(f"SVG save error: {e}")
            return False, "", f"SVG save error: {e}"

    def save_png(
        self,
        diagram: str,
        output_path: str,
        theme: str = "default",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        quality: int = 100,
        config: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, str, str]:
        """Render and save a Mermaid diagram as PNG."""
        if not self.available or not self.renderer:
            return False, "", "Mermaid rendering service is not available"

        try:
            return self.renderer.save_png(
                diagram, output_path, theme, bg_color, width, height, quality, config
            )
        except Exception as e:
            logger.error(f"PNG save error: {e}")
            return False, "", f"PNG save error: {e}"

    def save_pdf(
        self,
        diagram: str,
        output_path: str,
        theme: str = "default",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        config: Optional[Dict[str, Any]] = None,
        pdf_options: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, str, str]:
        """Render and save a Mermaid diagram as PDF."""
        if not self.available or not self.renderer:
            return False, "", "Mermaid rendering service is not available"

        try:
            return self.renderer.save_pdf(
                diagram,
                output_path,
                theme,
                bg_color,
                width,
                height,
                config,
                pdf_options,
            )
        except Exception as e:
            logger.error(f"PDF save error: {e}")
            return False, "", f"PDF save error: {e}"

    def validate_diagram(self, diagram: str) -> Tuple[bool, List[str], List[str]]:
        """Validate a Mermaid diagram."""
        if not self.available or not self.renderer:
            return False, ["Mermaid rendering service is not available"], []

        try:
            return self.renderer.validate_diagram(diagram)
        except Exception as e:
            logger.error(f"Diagram validation error: {e}")
            return False, [str(e)], []

    def get_diagram_stats(self, diagram: str) -> Dict[str, Any]:
        """Get comprehensive statistics about a Mermaid diagram."""
        if not self.available or not self.renderer:
            return {
                "valid": False,
                "error": "Mermaid rendering service is not available",
                "diagram_length": len(diagram),
                "lines": len(diagram.splitlines()),
            }

        try:
            return self.renderer.get_diagram_stats(diagram)
        except Exception as e:
            logger.error(f"Stats generation error: {e}")
            return {
                "valid": False,
                "error": str(e),
                "diagram_length": len(diagram),
                "lines": len(diagram.splitlines()),
            }

    def get_available_themes(self) -> List[str]:
        """Get list of available Mermaid themes."""
        if not self.available or not self.renderer:
            return []

        try:
            return self.renderer.get_available_themes()
        except Exception as e:
            logger.error(f"Error getting themes: {e}")
            return []

    def get_service_info(self) -> Dict[str, Any]:
        """Get comprehensive service information."""
        return {
            "available": self.available,
            "renderer_available": self.renderer is not None,
            "available_themes": self.get_available_themes(),
            "supported_formats": ["svg", "png", "pdf"],
            "mermaid_version": self.renderer.mermaid_version if self.renderer else None,
        }

    def health_check(self) -> Dict[str, Any]:
        """Perform a health check on the service."""
        try:
            # Test with a simple diagram
            test_diagram = "graph TD\n    A[Test] --> B[Health Check]"
            is_valid, errors, warnings = self.validate_diagram(test_diagram)

            return {
                "status": "healthy" if is_valid else "unhealthy",
                "available": self.available,
                "test_diagram_valid": is_valid,
                "test_errors": errors,
                "test_warnings": warnings,
                "service_info": self.get_service_info(),
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "available": self.available,
                "error": str(e),
                "service_info": self.get_service_info(),
            }
