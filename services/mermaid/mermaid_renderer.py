"""Mermaid Renderer

A Python-based mermaid diagram renderer that uses Playwright to render diagrams
to SVG and PNG formats, based on the mermaid.ink architecture.
"""

import sys
from pathlib import Path
from typing import Any

# Add the mcp-server services directory to Python path
current_file = Path(__file__).resolve()
mcp_services_dir = current_file.parent.parent / "mcp-server" / "services"
mcp_services_dir = mcp_services_dir.resolve()

if str(mcp_services_dir) not in sys.path:
    sys.path.insert(0, str(mcp_services_dir))


from playwright_browser_service import PlaywrightBrowserService


class MermaidRenderer:
    """Mermaid diagram renderer using Playwright browser automation.

    This renderer creates HTML pages with mermaid.js and uses Playwright
    to render them to SVG and PNG formats, similar to mermaid.ink.
    """

    def __init__(self):
        """Initialize the mermaid renderer."""
        self.browser_service = PlaywrightBrowserService()
        self.mermaid_version = "11.0.2"  # Latest stable version

        # Get the path to the local mermaid.js file
        current_file = Path(__file__).resolve()
        self.mermaid_js_path = current_file.parent / "assets" / "mermaid.js"

    def _get_mermaid_js_content(self) -> str:
        """Read the local mermaid.js file content.

        Returns:
            JavaScript content as string

        """
        try:
            with open(self.mermaid_js_path, encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            raise RuntimeError(f"Mermaid.js file not found at {self.mermaid_js_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to read mermaid.js file: {e}")

    def _create_mermaid_html(
        self,
        diagram: str,
        theme: str = "default",
        bg_color: str | None = None,
        width: int | None = None,
        height: int | None = None,
    ) -> str:
        """Create HTML content for mermaid rendering.

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
    </style>
</head>
<body>
    <div id="container">
        <div class="mermaid" id="mermaid-diagram">
{clean_diagram}
        </div>
    </div>
    
    <script>
        // Load mermaid.js from local file
        {self._get_mermaid_js_content()}
    </script>
    <script>
        // Wait for mermaid to load
        document.addEventListener('DOMContentLoaded', function() {{
            console.log('DOM loaded, starting mermaid initialization...');
            
            setTimeout(function() {{
                try {{
                    console.log('Checking for mermaid object...');
                    console.log('typeof mermaid:', typeof mermaid);
                    console.log('window.mermaid:', window.mermaid);
                    console.log('globalThis.mermaid:', globalThis.mermaid);
                    console.log('globalThis["mermaid"]:', globalThis["mermaid"]);
                    
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
                        mermaidObj.initialize({{
                            startOnLoad: false,
                            theme: '{theme}',
                            securityLevel: 'loose',
                            fontFamily: 'Arial, sans-serif',
                            flowchart: {{
                                useMaxWidth: true,
                                htmlLabels: true,
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
                                document.body.setAttribute('data-mermaid-error', error.message);
                            }});
                    }} else {{
                        console.error('Mermaid library not loaded');
                        document.body.setAttribute('data-mermaid-error', 'Mermaid library not loaded');
                    }}
                }} catch (error) {{
                    console.error('Error initializing mermaid:', error);
                    document.body.setAttribute('data-mermaid-error', error.message);
                }}
            }}, 2000);
        }});
    </script>
</body>
</html>
"""
        return html_content

    def _extract_svg_content(self, html_content: str) -> tuple[bool, str, str]:
        """Extract SVG content from rendered HTML.

        Args:
            html_content: The HTML content to extract SVG from

        Returns:
            Tuple of (success, svg_content, error_message)

        """
        try:
            success, svg_content, error = (
                self.browser_service.render_html_to_svg_with_wait_sync(
                    html_content=html_content,
                    selector="svg",
                    viewport_size={"width": 1920, "height": 1080},
                    wait_condition="data-mermaid-ready",
                    timeout=30000,
                )
            )

            if not success:
                return False, "", error

            # Check for mermaid errors
            if "data-mermaid-error" in svg_content:
                return False, "", "Mermaid rendering error detected"

            return True, svg_content, ""

        except Exception as e:
            return False, "", f"SVG extraction error: {e}"

    def _create_png_from_svg(
        self, svg_content: str, bg_color: str | None = None,
    ) -> tuple[bool, bytes, str]:
        """Convert SVG content to PNG using Playwright.

        Args:
            svg_content: The SVG content to convert
            bg_color: Background color for the PNG

        Returns:
            Tuple of (success, png_data, error_message)

        """
        try:
            # Create HTML with the SVG
            svg_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            margin: 0;
            padding: 20px;
            background-color: {bg_color or 'white'};
        }}
        svg {{
            max-width: 100%;
            height: auto;
        }}
    </style>
</head>
<body>
    {svg_content}
</body>
</html>
"""

            success, png_path, error = (
                self.browser_service.render_html_to_png_adaptive_sync(
                    html_content=svg_html,
                    viewport_size={"width": 1920, "height": 1080},
                    full_page=True,
                    content_selector="svg",
                )
            )

            if not success:
                return False, b"", error

            # Read the PNG file
            with open(png_path, "rb") as f:
                png_data = f.read()

            return True, png_data, ""

        except Exception as e:
            return False, b"", f"PNG conversion error: {e}"

    def render_to_svg(
        self,
        diagram: str,
        theme: str = "default",
        bg_color: str | None = None,
        width: int | None = None,
        height: int | None = None,
    ) -> tuple[bool, str, str]:
        """Render a mermaid diagram to SVG format.

        Args:
            diagram: The mermaid diagram content
            theme: Mermaid theme
            bg_color: Background color
            width: Custom width
            height: Custom height

        Returns:
            Tuple of (success, svg_content, error_message)

        """
        try:
            html_content = self._create_mermaid_html(
                diagram, theme, bg_color, width, height,
            )
            return self._extract_svg_content(html_content)
        except Exception as e:
            return False, "", f"SVG rendering error: {e}"

    def render_to_png(
        self,
        diagram: str,
        theme: str = "default",
        bg_color: str | None = None,
        width: int | None = None,
        height: int | None = None,
    ) -> tuple[bool, bytes, str]:
        """Render a mermaid diagram to PNG format.

        Args:
            diagram: The mermaid diagram content
            theme: Mermaid theme
            bg_color: Background color
            width: Custom width
            height: Custom height

        Returns:
            Tuple of (success, png_data, error_message)

        """
        try:
            # First render to SVG
            success, svg_content, error = self.render_to_svg(
                diagram, theme, bg_color, width, height,
            )
            if not success:
                return False, b"", error

            # Then convert SVG to PNG
            return self._create_png_from_svg(svg_content, bg_color)

        except Exception as e:
            return False, b"", f"PNG rendering error: {e}"

    def save_svg(
        self,
        diagram: str,
        output_path: str,
        theme: str = "default",
        bg_color: str | None = None,
        width: int | None = None,
        height: int | None = None,
    ) -> tuple[bool, str, str]:
        """Render and save a mermaid diagram as SVG.

        Args:
            diagram: The mermaid diagram content
            output_path: Path to save the SVG file
            theme: Mermaid theme
            bg_color: Background color
            width: Custom width
            height: Custom height

        Returns:
            Tuple of (success, output_path, error_message)

        """
        try:
            success, svg_content, error = self.render_to_svg(
                diagram, theme, bg_color, width, height,
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
        bg_color: str | None = None,
        width: int | None = None,
        height: int | None = None,
    ) -> tuple[bool, str, str]:
        """Render and save a mermaid diagram as PNG.

        Args:
            diagram: The mermaid diagram content
            output_path: Path to save the PNG file
            theme: Mermaid theme
            bg_color: Background color
            width: Custom width
            height: Custom height

        Returns:
            Tuple of (success, output_path, error_message)

        """
        try:
            success, png_data, error = self.render_to_png(
                diagram, theme, bg_color, width, height,
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

    def validate_diagram(self, diagram: str) -> tuple[bool, str]:
        """Validate a mermaid diagram by attempting to render it.

        Args:
            diagram: The mermaid diagram content

        Returns:
            Tuple of (is_valid, error_message)

        """
        try:
            success, _, error = self.render_to_svg(diagram)
            return success, error if not success else ""
        except Exception as e:
            return False, str(e)

    def get_diagram_stats(self, diagram: str) -> dict[str, Any]:
        """Get statistics about a mermaid diagram.

        Args:
            diagram: The mermaid diagram content

        Returns:
            Dictionary with diagram statistics

        """
        try:
            success, svg_content, svg_error = self.render_to_svg(diagram)
            success_png, png_data, png_error = self.render_to_png(diagram)

            return {
                "valid": success,
                "svg_size": len(svg_content) if success else 0,
                "png_size": len(png_data) if success_png else 0,
                "diagram_length": len(diagram),
                "lines": len(diagram.splitlines()),
                "svg_error": svg_error if not success else None,
                "png_error": png_error if not success_png else None,
            }
        except Exception as e:
            return {
                "valid": False,
                "svg_size": 0,
                "png_size": 0,
                "diagram_length": len(diagram),
                "lines": len(diagram.splitlines()),
                "error": str(e),
            }
