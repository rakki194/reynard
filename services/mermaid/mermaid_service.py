"""
Mermaid Service

Core service for rendering Mermaid diagrams using a Python-based renderer.
This service provides a clean interface for the MCP server to render diagrams.
"""

import os
import time
from pathlib import Path
from typing import Optional, Union, Dict, Any

from .mermaid_renderer import MermaidRenderer


class MermaidService:
    """
    Service for rendering Mermaid diagrams to SVG and PNG formats.
    
    This service uses a Python-based mermaid renderer with Playwright to provide
    reliable and fast conversion of Mermaid syntax to visual formats.
    """
    
    def __init__(self):
        """
        Initialize the Mermaid service.
        """
        try:
            self.renderer = MermaidRenderer()
            self.available = True
        except Exception as e:
            print(f"Warning: Failed to initialize mermaid renderer: {e}")
            self.renderer = None
            self.available = False
    
    def render_to_svg(self, diagram: str) -> str:
        """
        Render a Mermaid diagram to SVG format.
        
        Args:
            diagram: The Mermaid diagram script
            
        Returns:
            SVG content as string
            
        Raises:
            RuntimeError: If rendering fails
        """
        if not self.available or not self.renderer:
            raise RuntimeError("Mermaid renderer is not available")
        
        success, svg_content, error = self.renderer.render_to_svg(diagram)
        if not success:
            raise RuntimeError(f"Failed to render diagram to SVG: {error}")
        
        return svg_content
    
    def render_to_png(self, diagram: str) -> bytes:
        """
        Render a Mermaid diagram to PNG format.
        
        Args:
            diagram: The Mermaid diagram script
            
        Returns:
            PNG content as bytes
            
        Raises:
            RuntimeError: If rendering fails
        """
        if not self.available or not self.renderer:
            raise RuntimeError("Mermaid renderer is not available")
        
        success, png_data, error = self.renderer.render_to_png(diagram)
        if not success:
            raise RuntimeError(f"Failed to render diagram to PNG: {error}")
        
        return png_data
    
    def save_svg(self, diagram: str, output_path: str) -> str:
        """
        Render and save a Mermaid diagram as SVG.
        
        Args:
            diagram: The Mermaid diagram script
            output_path: Path to save the SVG file
            
        Returns:
            Path to the saved file
            
        Raises:
            RuntimeError: If rendering or saving fails
        """
        if not self.available or not self.renderer:
            raise RuntimeError("Mermaid renderer is not available")
        
        success, saved_path, error = self.renderer.save_svg(diagram, output_path)
        if not success:
            raise RuntimeError(f"Failed to save SVG: {error}")
        
        return saved_path
    
    def save_png(self, diagram: str, output_path: str) -> str:
        """
        Render and save a Mermaid diagram as PNG.
        
        Args:
            diagram: The Mermaid diagram script
            output_path: Path to save the PNG file
            
        Returns:
            Path to the saved file
            
        Raises:
            RuntimeError: If rendering or saving fails
        """
        if not self.available or not self.renderer:
            raise RuntimeError("Mermaid renderer is not available")
        
        success, saved_path, error = self.renderer.save_png(diagram, output_path)
        if not success:
            raise RuntimeError(f"Failed to save PNG: {error}")
        
        return saved_path
    
    def validate_diagram(self, diagram: str) -> tuple[bool, str]:
        """
        Validate a Mermaid diagram by attempting to render it.
        
        Args:
            diagram: The Mermaid diagram script
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not self.available or not self.renderer:
            return False, "Mermaid renderer is not available"
        
        return self.renderer.validate_diagram(diagram)
    
    def get_diagram_stats(self, diagram: str) -> Dict[str, Any]:
        """
        Get statistics about a Mermaid diagram.
        
        Args:
            diagram: The Mermaid diagram script
            
        Returns:
            Dictionary with diagram statistics
        """
        if not self.available or not self.renderer:
            return {
                "valid": False,
                "svg_size": 0,
                "png_size": 0,
                "diagram_length": len(diagram),
                "lines": len(diagram.splitlines()),
                "error": "Mermaid renderer is not available"
            }
        
        return self.renderer.get_diagram_stats(diagram)
