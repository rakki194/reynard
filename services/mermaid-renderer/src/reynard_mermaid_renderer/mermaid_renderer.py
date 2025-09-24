"""
Enhanced Mermaid Renderer

A comprehensive Mermaid diagram renderer that supports SVG, PNG, and PDF output
with advanced theming, validation, and performance optimization.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from .browser_service import MermaidBrowserService

logger = logging.getLogger(__name__)


class MermaidRenderer:
    """Enhanced Mermaid diagram renderer with comprehensive format support."""

    def __init__(self) -> None:
        """Initialize the Mermaid renderer."""
        self.browser_service = MermaidBrowserService()
        self.mermaid_version = "11.0.2"  # Latest stable version
        
        # Get the path to the local mermaid.js file
        current_file = Path(__file__).resolve()
        self.mermaid_js_path = current_file.parent / "assets" / "mermaid.js"
        
        # Available themes
        self.available_themes = [
            "default", "neutral", "dark", "forest", "base", "autumn", "winter"
        ]

    def _get_mermaid_js_content(self) -> str:
        """Read the local mermaid.js file content."""
        try:
            with open(self.mermaid_js_path, encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            # Fallback to CDN if local file not found
            logger.warning(f"Mermaid.js file not found at {self.mermaid_js_path}, using CDN")
            return f"""
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mermaid@{self.mermaid_version}/dist/mermaid.min.js';
            script.onload = function() {{
                window.mermaid = window.mermaid || window.mermaidAPI;
            }};
            document.head.appendChild(script);
            """
        except Exception as e:
            raise RuntimeError(f"Failed to read mermaid.js file: {e}")

    def _create_mermaid_html(
        self,
        diagram: str,
        theme: str = "default",
        bg_color: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Create HTML content for Mermaid rendering with enhanced configuration."""
        # Clean the diagram content
        clean_diagram = diagram.strip()
        
        # Validate theme
        if theme not in self.available_themes:
            theme = "default"
            logger.warning(f"Unknown theme '{theme}', using 'default'")

        # Default Mermaid configuration
        default_config = {
            "startOnLoad": False,
            "theme": theme,
            "securityLevel": "loose",
            "fontFamily": "Arial, sans-serif",
            "flowchart": {
                "useMaxWidth": True,
                "htmlLabels": True,
                "nodeSpacing": 50,
                "rankSpacing": 50,
                "curve": "basis"
            },
            "sequence": {
                "useMaxWidth": True
            },
            "gantt": {
                "useMaxWidth": True
            },
            "gitgraph": {
                "useMaxWidth": True
            },
            "pie": {
                "useMaxWidth": True
            },
            "journey": {
                "useMaxWidth": True
            }
        }
        
        # Merge with custom config
        if config:
            default_config.update(config)

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
        #container {{
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }}
        .mermaid {{
            max-width: 100%;
            height: auto;
        }}
        .error {{
            color: red;
            font-family: monospace;
            white-space: pre-wrap;
            padding: 20px;
            border: 1px solid red;
            background-color: #ffe6e6;
        }}
    </style>
</head>
<body>
    <div id="container">
        <div class="mermaid" id="mermaid-diagram">
{clean_diagram}
        </div>
    </div>
    
    <script>
        // Load mermaid.js
        {self._get_mermaid_js_content()}
    </script>
    <script>
        // Wait for mermaid to load and render
        document.addEventListener('DOMContentLoaded', function() {{
            console.log('DOM loaded, starting mermaid initialization...');
            
            setTimeout(function() {{
                try {{
                    console.log('Checking for mermaid object...');
                    
                    // Check for mermaid in different global locations
                    let mermaidObj = null;
                    if (typeof mermaid !== 'undefined') {{
                        mermaidObj = mermaid;
                    }} else if (typeof globalThis !== 'undefined' && globalThis.mermaid) {{
                        mermaidObj = globalThis.mermaid;
                    }} else if (typeof globalThis !== 'undefined' && globalThis["mermaid"]) {{
                        mermaidObj = globalThis["mermaid"];
                    }} else if (typeof window !== 'undefined' && window.mermaid) {{
                        mermaidObj = window.mermaid;
                    }}
                    
                    if (mermaidObj) {{
                        console.log('Mermaid found, initializing...');
                        
                        // Initialize mermaid with configuration
                        mermaidObj.initialize({json.dumps(default_config)});
                        
                        console.log('Mermaid initialized, rendering diagram...');
                        
                        // Render the diagram
                        const diagramElement = document.getElementById('mermaid-diagram');
                        const diagramText = diagramElement.textContent;
                        
                        console.log('Diagram text:', diagramText);
                        
                        mermaidObj.render('mermaid-svg', diagramText)
                            .then((result) => {{
                                console.log('Mermaid render successful');
                                diagramElement.innerHTML = result.svg;
                                
                                // Apply custom dimensions if specified
                                const svgElement = diagramElement.querySelector('svg');
                                if (svgElement) {{
                                    if ({width}) {{
                                        svgElement.setAttribute('width', '{width}px');
                                        svgElement.style.maxWidth = 'none';
                                    }}
                                    if ({height}) {{
                                        svgElement.setAttribute('height', '{height}px');
                                    }}
                                }}
                                
                                // Signal that rendering is complete
                                console.log('Setting data-mermaid-ready attribute');
                                document.body.setAttribute('data-mermaid-ready', 'true');
                            }})
                            .catch((error) => {{
                                console.error('Mermaid rendering error:', error);
                                diagramElement.innerHTML = `<div class="error">Mermaid Error: ${{error.message}}</div>`;
                                document.body.setAttribute('data-mermaid-error', error.message);
                            }});
                    }} else {{
                        console.error('Mermaid library not loaded');
                        const diagramElement = document.getElementById('mermaid-diagram');
                        diagramElement.innerHTML = '<div class="error">Mermaid library not loaded</div>';
                        document.body.setAttribute('data-mermaid-error', 'Mermaid library not loaded');
                    }}
                }} catch (error) {{
                    console.error('Error initializing mermaid:', error);
                    const diagramElement = document.getElementById('mermaid-diagram');
                    diagramElement.innerHTML = `<div class="error">Initialization Error: ${{error.message}}</div>`;
                    document.body.setAttribute('data-mermaid-error', error.message);
                }}
            }}, 2000);
        }});
    </script>
</body>
</html>
"""
        return html_content

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
        try:
            html_content = self._create_mermaid_html(
                diagram, theme, bg_color, width, height, config
            )
            return self.browser_service.render_mermaid_to_svg_sync(html_content)
        except Exception as e:
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
        try:
            html_content = self._create_mermaid_html(
                diagram, theme, bg_color, width, height, config
            )
            
            success, output_path, error = self.browser_service.render_mermaid_to_png_sync(
                html_content, quality=quality
            )
            
            if not success:
                return False, b"", error
            
            # Read the PNG file
            with open(output_path, "rb") as f:
                png_data = f.read()
            
            return True, png_data, ""
        except Exception as e:
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
        try:
            html_content = self._create_mermaid_html(
                diagram, theme, bg_color, width, height, config
            )
            
            success, output_path, error = self.browser_service.render_mermaid_to_pdf_sync(
                html_content, pdf_options=pdf_options
            )
            
            if not success:
                return False, b"", error
            
            # Read the PDF file
            with open(output_path, "rb") as f:
                pdf_data = f.read()
            
            return True, pdf_data, ""
        except Exception as e:
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
        try:
            success, svg_content, error = self.render_to_svg(
                diagram, theme, bg_color, width, height, config
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
        try:
            success, png_data, error = self.render_to_png(
                diagram, theme, bg_color, width, height, quality, config
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
        try:
            success, pdf_data, error = self.render_to_pdf(
                diagram, theme, bg_color, width, height, config, pdf_options
            )
            if not success:
                return False, "", error

            # Ensure directory exists
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)

            # Save to file
            with open(output_path, "wb") as f:
                f.write(pdf_data)

            return True, output_path, ""
        except Exception as e:
            return False, "", f"PDF save error: {e}"

    def validate_diagram(self, diagram: str) -> Tuple[bool, List[str], List[str]]:
        """Validate a Mermaid diagram by attempting to render it."""
        try:
            success, _, error = self.render_to_svg(diagram)
            if success:
                return True, [], []
            else:
                return False, [error], []
        except Exception as e:
            return False, [str(e)], []

    def get_diagram_stats(self, diagram: str) -> Dict[str, Any]:
        """Get comprehensive statistics about a Mermaid diagram."""
        try:
            # Basic stats
            lines = diagram.splitlines()
            non_empty_lines = [line for line in lines if line.strip()]
            
            # Try to render to get size information
            success_svg, svg_content, svg_error = self.render_to_svg(diagram)
            success_png, png_data, png_error = self.render_to_png(diagram)
            success_pdf, pdf_data, pdf_error = self.render_to_pdf(diagram)

            return {
                "valid": success_svg,
                "diagram_length": len(diagram),
                "lines": len(lines),
                "non_empty_lines": len(non_empty_lines),
                "svg_size": len(svg_content) if success_svg else 0,
                "png_size": len(png_data) if success_png else 0,
                "pdf_size": len(pdf_data) if success_pdf else 0,
                "svg_error": svg_error if not success_svg else None,
                "png_error": png_error if not success_png else None,
                "pdf_error": pdf_error if not success_pdf else None,
                "available_themes": self.available_themes,
                "mermaid_version": self.mermaid_version,
            }
        except Exception as e:
            return {
                "valid": False,
                "diagram_length": len(diagram),
                "lines": len(diagram.splitlines()),
                "error": str(e),
                "available_themes": self.available_themes,
                "mermaid_version": self.mermaid_version,
            }

    def get_available_themes(self) -> List[str]:
        """Get list of available Mermaid themes."""
        return self.available_themes.copy()

    def is_available(self) -> bool:
        """Check if the Mermaid renderer is available."""
        return self.browser_service.playwright_available
