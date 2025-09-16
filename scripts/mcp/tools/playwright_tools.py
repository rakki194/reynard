"""
Playwright Tools for MCP Server

Browser automation tools that allow agents to:
- Take screenshots of webpages
- Scrape web content
- Render HTML to images
- Extract SVG content
- Perform web-based tasks
"""

import logging
import subprocess
from typing import Any, Dict

from services.playwright_browser_service import PlaywrightBrowserService

logger = logging.getLogger(__name__)


class PlaywrightTools:
    """Tools for browser automation using Playwright."""

    def __init__(self) -> None:
        """Initialize Playwright tools."""
        self.browser_service = PlaywrightBrowserService()

    def take_webpage_screenshot(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Take a screenshot of a webpage.

        Args:
            arguments: Dictionary containing:
                - url: URL to screenshot (required)
                - output_path: Optional output file path
                - viewport_width: Browser width (default: 1920)
                - viewport_height: Browser height (default: 1080)
                - full_page: Whether to capture full page (default: true)
                - selector: Optional CSS selector for element screenshot
                - open_with_imv: Whether to open with imv (default: true)
        """
        url = arguments.get("url", "")
        if not url:
            return {"content": [{"type": "text", "text": "❌ Error: No URL provided"}]}

        output_path = arguments.get("output_path")
        viewport_width = arguments.get("viewport_width", 1920)
        viewport_height = arguments.get("viewport_height", 1080)
        full_page = arguments.get("full_page", True)
        selector = arguments.get("selector")
        open_with_imv = arguments.get("open_with_imv", True)

        viewport_size = {"width": viewport_width, "height": viewport_height}

        success, result, error = self.browser_service.take_screenshot_sync(
            url=url,
            output_path=output_path,
            viewport_size=viewport_size,
            full_page=full_page,
            selector=selector,
        )

        if success:
            file_path = result
            if open_with_imv:
                try:
                    subprocess.Popen(
                        ["imv", file_path],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
                    return {
                        "content": [
                            {
                                "type": "text",
                                "text": f"✅ Successfully took screenshot and opened with imv\n📁 Saved to: {file_path}\n🌐 URL: {url}",
                            }
                        ]
                    }
                except Exception as e:
                    return {
                        "content": [
                            {
                                "type": "text",
                                "text": f"✅ Successfully took screenshot\n📁 Saved to: {file_path}\n🌐 URL: {url}\n⚠️ Could not open with imv: {e}",
                            }
                        ]
                    }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Successfully took screenshot\n📁 Saved to: {file_path}\n🌐 URL: {url}",
                        }
                    ]
                }
        else:
            return {
                "content": [
                    {"type": "text", "text": f"❌ Failed to take screenshot: {error}"}
                ]
            }

    def scrape_webpage_content(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Scrape content from a webpage.

        Args:
            arguments: Dictionary containing:
                - url: URL to scrape (required)
                - selector: Optional CSS selector to extract specific content
                - viewport_width: Browser width (default: 1920)
                - viewport_height: Browser height (default: 1080)
                - wait_for: Optional selector to wait for before scraping
        """
        url = arguments.get("url", "")
        if not url:
            return {"content": [{"type": "text", "text": "❌ Error: No URL provided"}]}

        selector = arguments.get("selector")
        viewport_width = arguments.get("viewport_width", 1920)
        viewport_height = arguments.get("viewport_height", 1080)
        wait_for = arguments.get("wait_for")

        viewport_size = {"width": viewport_width, "height": viewport_height}

        success, content, error = self.browser_service.scrape_webpage_sync(
            url=url, selector=selector, viewport_size=viewport_size, wait_for=wait_for
        )

        if success:
            # Truncate very long content for display
            display_content = content[:2000] + "..." if len(content) > 2000 else content
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Successfully scraped content from {url}\n\nContent:\n{display_content}",
                    }
                ]
            }
        else:
            return {
                "content": [
                    {"type": "text", "text": f"❌ Failed to scrape content: {error}"}
                ]
            }

    def render_html_to_image(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Render HTML content to PNG image.

        Args:
            arguments: Dictionary containing:
                - html_content: HTML content to render (required)
                - output_path: Optional output file path
                - viewport_width: Browser width (default: 1920)
                - viewport_height: Browser height (default: 1080)
                - full_page: Whether to capture full page (default: true)
                - open_with_imv: Whether to open with imv (default: true)
        """
        html_content = arguments.get("html_content", "")
        if not html_content:
            return {
                "content": [
                    {"type": "text", "text": "❌ Error: No HTML content provided"}
                ]
            }

        output_path = arguments.get("output_path")
        viewport_width = arguments.get("viewport_width", 1920)
        viewport_height = arguments.get("viewport_height", 1080)
        full_page = arguments.get("full_page", True)
        open_with_imv = arguments.get("open_with_imv", True)

        viewport_size = {"width": viewport_width, "height": viewport_height}

        success, result, error = self.browser_service.render_html_to_png_sync(
            html_content=html_content,
            output_path=output_path,
            viewport_size=viewport_size,
            full_page=full_page,
        )

        if success:
            file_path = result
            if open_with_imv:
                try:
                    subprocess.Popen(
                        ["imv", file_path],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
                    return {
                        "content": [
                            {
                                "type": "text",
                                "text": f"✅ Successfully rendered HTML to image and opened with imv\n📁 Saved to: {file_path}",
                            }
                        ]
                    }
                except Exception as e:
                    return {
                        "content": [
                            {
                                "type": "text",
                                "text": f"✅ Successfully rendered HTML to image\n📁 Saved to: {file_path}\n⚠️ Could not open with imv: {e}",
                            }
                        ]
                    }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Successfully rendered HTML to image\n📁 Saved to: {file_path}",
                        }
                    ]
                }
        else:
            return {
                "content": [
                    {"type": "text", "text": f"❌ Failed to render HTML: {error}"}
                ]
            }

    def extract_svg_from_html(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract SVG content from HTML.

        Args:
            arguments: Dictionary containing:
                - html_content: HTML content containing SVG (required)
                - selector: CSS selector for SVG element (default: "svg")
                - viewport_width: Browser width (default: 1920)
                - viewport_height: Browser height (default: 1080)
        """
        html_content = arguments.get("html_content", "")
        if not html_content:
            return {
                "content": [
                    {"type": "text", "text": "❌ Error: No HTML content provided"}
                ]
            }

        selector = arguments.get("selector", "svg")
        viewport_width = arguments.get("viewport_width", 1920)
        viewport_height = arguments.get("viewport_height", 1080)

        viewport_size = {"width": viewport_width, "height": viewport_height}

        success, svg_content, error = self.browser_service.render_html_to_svg_sync(
            html_content=html_content, selector=selector, viewport_size=viewport_size
        )

        if success:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Successfully extracted SVG content\n\nSVG:\n{svg_content}",
                    }
                ]
            }
        else:
            return {
                "content": [
                    {"type": "text", "text": f"❌ Failed to extract SVG: {error}"}
                ]
            }

    def test_playwright_connection(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Test Playwright browser connection and capabilities.

        Args:
            arguments: Dictionary (unused, for consistency)
        """
        if not self.browser_service.playwright_available:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Playwright not available. Install with: pip install playwright && python -m playwright install",
                    }
                ]
            }

        # Test with a simple HTML page
        test_html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Playwright Test</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .test-box { background: #e1f5fe; padding: 20px; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="test-box">
                <h1>Playwright Browser Test</h1>
                <p>If you can see this, Playwright is working correctly!</p>
                <p>Timestamp: <span id="timestamp"></span></p>
            </div>
            <script>
                document.getElementById('timestamp').textContent = new Date().toISOString();
            </script>
        </body>
        </html>
        """

        success, result, error = self.browser_service.render_html_to_png_sync(
            html_content=test_html,
            viewport_size={"width": 800, "height": 600},
            full_page=True,
        )

        if success:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Playwright browser test successful!\n📁 Test image saved to: {result}\n🎯 Browser automation is ready for use.",
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Playwright browser test failed: {error}",
                    }
                ]
            }
