"""
Playwright Tools for MCP Server

Browser automation tools that allow agents to:
- Take screenshots of webpages
- Scrape web content
- Render HTML to images
- Extract SVG content
- Perform web-based tasks

Now uses the new @register_tool decorator system for automatic registration.
"""

import logging
import subprocess
from typing import Any

from protocol.tool_registry import register_tool
from services.playwright_browser_service import PlaywrightBrowserService

logger = logging.getLogger(__name__)

# Initialize browser service
browser_service = PlaywrightBrowserService()


@register_tool(
    name="take_webpage_screenshot",
    category="playwright",
    description="Take screenshots of webpages using Playwright browser automation",
)
def take_webpage_screenshot(arguments: dict[str, Any]) -> dict[str, Any]:
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

    success, result, error = browser_service.take_screenshot_sync(
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
            except (OSError, subprocess.SubprocessError) as e:
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


@register_tool(
    name="scrape_webpage_content",
    category="playwright",
    description="Scrape content from webpages using Playwright browser automation",
)
def scrape_webpage_content(arguments: dict[str, Any]) -> dict[str, Any]:
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

    success, content, error = browser_service.scrape_webpage_sync(
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


@register_tool(
    name="test_playwright_connection",
    category="playwright",
    description="Test Playwright browser connection and capabilities",
)
def test_playwright_connection(arguments: dict[str, Any]) -> dict[str, Any]:  # pylint: disable=unused-argument
    """
    Test Playwright browser connection and capabilities.

    Args:
        arguments: Dictionary (unused, for consistency)
    """
    if not browser_service.playwright_available:
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
        </div>
    </body>
    </html>
    """

    success, result, error = browser_service.render_html_to_png_sync(
        html_content=test_html, output_path=None
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
                {"type": "text", "text": f"❌ Playwright browser test failed: {error}"}
            ]
        }
