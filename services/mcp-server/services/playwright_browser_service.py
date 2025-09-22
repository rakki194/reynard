"""
Playwright Browser Service

A reusable service for browser automation using Playwright.
Provides common functionality for web scraping, screenshot capture,
and browser-based rendering across different MCP tools.
"""

import asyncio
import logging
import tempfile
from typing import Any

try:
    from playwright.async_api import Browser, Page, async_playwright

    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    # Define type aliases for when Playwright is not available
    Browser = Any  # type: ignore
    Page = Any  # type: ignore
    async_playwright = None  # type: ignore

logger = logging.getLogger(__name__)


class PlaywrightBrowserService:
    """Service for browser automation using Playwright."""

    def __init__(self) -> None:
        """Initialize the Playwright browser service."""
        self.playwright_available = PLAYWRIGHT_AVAILABLE
        if not self.playwright_available:
            logger.warning(
                "Playwright not available. Install with: pip install playwright"
            )

    def _run_async_operation(self, coro: Any) -> Any:
        """Run an async operation in a new event loop."""
        try:
            # Use asyncio.run() which handles event loop conflicts properly
            return asyncio.run(coro)
        except RuntimeError as e:
            if "cannot be called from a running event loop" in str(e):
                # Fallback to thread-based execution
                import concurrent.futures

                def run_in_thread() -> Any:
                    return asyncio.run(coro)

                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(run_in_thread)
                    return future.result()
            else:
                raise

    async def _create_browser_page(
        self,
        viewport_size: dict[str, int | None] = None,
        user_agent: str | None = None,
    ) -> tuple[Browser, Page]:
        """Create a browser and page with specified settings."""
        if not self.playwright_available:
            raise RuntimeError(
                "Playwright not available. Install with: pip install playwright"
            )

        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(headless=True)
        page = await browser.new_page()

        # Set viewport if specified
        if viewport_size:
            await page.set_viewport_size(viewport_size)

        # Set user agent if specified
        if user_agent:
            await page.set_extra_http_headers({"User-Agent": user_agent})

        return browser, page

    async def render_html_to_png_adaptive(
        self,
        html_content: str,
        output_path: str | None = None,
        viewport_size: dict[str, int | None] = None,
        full_page: bool = True,
        quality: int = 100,
        content_selector: str | None = None,
    ) -> tuple[bool, str, str]:
        """
        Render HTML content to PNG with adaptive viewport sizing.

        Args:
            html_content: HTML content to render
            output_path: Optional output file path (creates temp file if None)
            viewport_size: Initial browser viewport size (will be adjusted if content_selector provided)
            full_page: Whether to capture full page or just viewport
            quality: Image quality (1-100, only for JPEG)
            content_selector: CSS selector for content to measure for adaptive sizing

        Returns:
            Tuple of (success, file_path_or_error, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    "",
                    "Playwright not available. Install with: pip install playwright",
                )

            # Default viewport size
            if viewport_size is None:
                viewport_size = {"width": 1920, "height": 1080}

            browser, page = await self._create_browser_page(viewport_size)

            try:
                # Load HTML content
                await page.set_content(html_content)

                # Wait for content to load
                await page.wait_for_load_state("networkidle", timeout=10000)

                # Wait for Mermaid to render the diagram
                await page.wait_for_timeout(3000)

                # If content selector is provided, adjust viewport to content size
                if content_selector:
                    try:
                        # Wait for the content element
                        await page.wait_for_selector(content_selector, timeout=5000)

                        # Get the bounding box of the content
                        element = await page.query_selector(content_selector)
                        if element:
                            box = await element.bounding_box()
                            if box:
                                # Add some padding around the content
                                padding = 40
                                content_width = int(box["width"]) + (padding * 2)
                                content_height = int(box["height"]) + (padding * 2)

                                # Set viewport to content size (with reasonable limits)
                                adaptive_width = min(max(content_width, 400), 4000)
                                adaptive_height = min(max(content_height, 300), 3000)

                                await page.set_viewport_size(
                                    {"width": adaptive_width, "height": adaptive_height}
                                )

                                # Wait a bit for the viewport change to take effect
                                await page.wait_for_timeout(500)
                    except Exception as e:
                        # If adaptive sizing fails, continue with original viewport
                        logger.warning(f"Adaptive sizing failed: {e}")

                # Take screenshot
                if output_path:
                    png_data = await page.screenshot(
                        path=output_path, type="png", full_page=full_page
                    )
                    file_path = output_path
                else:
                    png_data = await page.screenshot(type="png", full_page=full_page)
                    # Save to temp file
                    with tempfile.NamedTemporaryFile(
                        suffix=".png", delete=False, dir="/tmp"
                    ) as tmp_file:
                        tmp_file.write(png_data)
                        file_path = tmp_file.name

                await browser.close()
                return True, file_path, ""

            except Exception as e:
                await browser.close()
                return False, "", f"Rendering error: {e!s}"

        except Exception as e:
            return False, "", f"Browser service error: {e!s}"

    async def render_html_to_png(
        self,
        html_content: str,
        output_path: str | None = None,
        viewport_size: dict[str, int | None] = None,
        full_page: bool = True,
        quality: int = 100,
    ) -> tuple[bool, str, str]:
        """
        Render HTML content to PNG image.

        Args:
            html_content: HTML content to render
            output_path: Optional output file path (creates temp file if None)
            viewport_size: Browser viewport size (default: 1920x1080)
            full_page: Whether to capture full page or just viewport
            quality: Image quality (1-100, only for JPEG)

        Returns:
            Tuple of (success, file_path_or_error, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    "",
                    "Playwright not available. Install with: pip install playwright",
                )

            # Default viewport size
            if viewport_size is None:
                viewport_size = {"width": 1920, "height": 1080}

            browser, page = await self._create_browser_page(viewport_size)

            try:
                # Load HTML content
                await page.set_content(html_content)

                # Wait for content to load
                await page.wait_for_load_state("networkidle", timeout=10000)

                # Take screenshot
                if output_path:
                    png_data = await page.screenshot(
                        path=output_path, type="png", full_page=full_page
                    )
                    file_path = output_path
                else:
                    png_data = await page.screenshot(type="png", full_page=full_page)
                    # Save to temp file
                    with tempfile.NamedTemporaryFile(
                        suffix=".png", delete=False, dir="/tmp"
                    ) as tmp_file:
                        tmp_file.write(png_data)
                        file_path = tmp_file.name

                await browser.close()
                return True, file_path, ""

            except Exception as e:
                await browser.close()
                return False, "", f"Rendering error: {e!s}"

        except Exception as e:
            return False, "", f"Browser service error: {e!s}"

    async def render_html_to_svg(
        self,
        html_content: str,
        selector: str = "svg",
        viewport_size: dict[str, int | None] = None,
    ) -> tuple[bool, str, str]:
        """
        Extract SVG content from HTML.

        Args:
            html_content: HTML content containing SVG
            selector: CSS selector for SVG element
            viewport_size: Browser viewport size

        Returns:
            Tuple of (success, svg_content_or_error, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    "",
                    "Playwright not available. Install with: pip install playwright",
                )

            # Default viewport size
            if viewport_size is None:
                viewport_size = {"width": 1920, "height": 1080}

            browser, page = await self._create_browser_page(viewport_size)

            try:
                # Load HTML content
                await page.set_content(html_content)

                # Wait for SVG to render
                await page.wait_for_selector(selector, timeout=10000)

                # Get SVG content
                svg_element = await page.query_selector(selector)
                if svg_element:
                    svg_content = await svg_element.inner_html()
                    await browser.close()
                    return True, svg_content, ""
                else:
                    await browser.close()
                    return (
                        False,
                        "",
                        f"Could not find SVG element with selector: {selector}",
                    )

            except Exception as e:
                await browser.close()
                return False, "", f"SVG extraction error: {e!s}"

        except Exception as e:
            return False, "", f"Browser service error: {e!s}"

    async def scrape_webpage(
        self,
        url: str,
        selector: str | None = None,
        viewport_size: dict[str, int | None] = None,
        wait_for: str | None = None,
    ) -> tuple[bool, str, str]:
        """
        Scrape content from a webpage.

        Args:
            url: URL to scrape
            selector: Optional CSS selector to extract specific content
            viewport_size: Browser viewport size
            wait_for: Optional selector to wait for before scraping

        Returns:
            Tuple of (success, content_or_error, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    "",
                    "Playwright not available. Install with: pip install playwright",
                )

            # Default viewport size
            if viewport_size is None:
                viewport_size = {"width": 1920, "height": 1080}

            browser, page = await self._create_browser_page(viewport_size)

            try:
                # Navigate to URL
                await page.goto(url, wait_until="networkidle", timeout=30000)

                # Wait for specific element if specified
                if wait_for:
                    await page.wait_for_selector(wait_for, timeout=10000)

                # Extract content
                if selector:
                    element = await page.query_selector(selector)
                    if element:
                        content = await element.inner_text()
                    else:
                        await browser.close()
                        return (
                            False,
                            "",
                            f"Could not find element with selector: {selector}",
                        )
                else:
                    content = await page.content()

                await browser.close()
                return True, content, ""

            except Exception as e:
                await browser.close()
                return False, "", f"Scraping error: {e!s}"

        except Exception as e:
            return False, "", f"Browser service error: {e!s}"

    async def take_screenshot(
        self,
        url: str,
        output_path: str | None = None,
        viewport_size: dict[str, int | None] = None,
        full_page: bool = True,
        selector: str | None = None,
    ) -> tuple[bool, str, str]:
        """
        Take a screenshot of a webpage.

        Args:
            url: URL to screenshot
            output_path: Optional output file path
            viewport_size: Browser viewport size
            full_page: Whether to capture full page
            selector: Optional CSS selector for element screenshot

        Returns:
            Tuple of (success, file_path_or_error, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    "",
                    "Playwright not available. Install with: pip install playwright",
                )

            # Default viewport size
            if viewport_size is None:
                viewport_size = {"width": 1920, "height": 1080}

            browser, page = await self._create_browser_page(viewport_size)

            try:
                # Navigate to URL
                await page.goto(url, wait_until="networkidle", timeout=30000)

                # Take screenshot
                if selector:
                    element = await page.query_selector(selector)
                    if not element:
                        await browser.close()
                        return (
                            False,
                            "",
                            f"Could not find element with selector: {selector}",
                        )
                    png_data = await element.screenshot(type="png")
                else:
                    png_data = await page.screenshot(type="png", full_page=full_page)

                # Save screenshot
                if output_path:
                    with open(output_path, "wb") as f:
                        f.write(png_data)
                    file_path = output_path
                else:
                    with tempfile.NamedTemporaryFile(
                        suffix=".png", delete=False, dir="/tmp"
                    ) as tmp_file:
                        tmp_file.write(png_data)
                        file_path = tmp_file.name

                await browser.close()
                return True, file_path, ""

            except Exception as e:
                await browser.close()
                return False, "", f"Screenshot error: {e!s}"

        except Exception as e:
            return False, "", f"Browser service error: {e!s}"

    # Synchronous wrapper methods for easy use in MCP tools
    def render_html_to_png_adaptive_sync(
        self,
        html_content: str,
        output_path: str | None = None,
        viewport_size: dict[str, int | None] = None,
        full_page: bool = True,
        content_selector: str | None = None,
    ) -> tuple[bool, str, str]:
        """Synchronous wrapper for render_html_to_png_adaptive."""
        return self._run_async_operation(
            self.render_html_to_png_adaptive(
                html_content,
                output_path,
                viewport_size,
                full_page,
                100,
                content_selector,
            )
        )

    def render_html_to_png_sync(
        self,
        html_content: str,
        output_path: str | None = None,
        viewport_size: dict[str, int | None] = None,
        full_page: bool = True,
    ) -> tuple[bool, str, str]:
        """Synchronous wrapper for render_html_to_png."""
        return self._run_async_operation(
            self.render_html_to_png(html_content, output_path, viewport_size, full_page)
        )

    def render_html_to_svg_sync(
        self,
        html_content: str,
        selector: str = "svg",
        viewport_size: dict[str, int | None] = None,
    ) -> tuple[bool, str, str]:
        """Synchronous wrapper for render_html_to_svg."""
        return self._run_async_operation(
            self.render_html_to_svg(html_content, selector, viewport_size)
        )

    def scrape_webpage_sync(
        self,
        url: str,
        selector: str | None = None,
        viewport_size: dict[str, int | None] = None,
        wait_for: str | None = None,
    ) -> tuple[bool, str, str]:
        """Synchronous wrapper for scrape_webpage."""
        return self._run_async_operation(
            self.scrape_webpage(url, selector, viewport_size, wait_for)
        )

    async def render_html_to_svg_with_wait(
        self,
        html_content: str,
        selector: str = "svg",
        viewport_size: dict[str, int | None] = None,
        wait_condition: str | None = None,
        timeout: int = 30000,
    ) -> tuple[bool, str, str]:
        """
        Extract SVG content from HTML with custom wait condition.
        
        Args:
            html_content: HTML content containing SVG
            selector: CSS selector for SVG element
            viewport_size: Browser viewport size
            wait_condition: Custom wait condition (e.g., "data-mermaid-ready")
            timeout: Timeout in milliseconds
            
        Returns:
            Tuple of (success, svg_content_or_error, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    "",
                    "Playwright not available. Install with: pip install playwright",
                )

            # Default viewport size
            if viewport_size is None:
                viewport_size = {"width": 1920, "height": 1080}

            browser, page = await self._create_browser_page(viewport_size)

            try:
                # Load HTML content
                await page.set_content(html_content)

                # Wait for custom condition if provided
                if wait_condition:
                    await page.wait_for_function(
                        f"document.body.getAttribute('{wait_condition}') === 'true'",
                        timeout=timeout
                    )
                else:
                    # Wait for SVG to render
                    await page.wait_for_selector(selector, timeout=timeout)

                # Get SVG content
                svg_element = await page.query_selector(selector)
                if svg_element:
                    svg_content = await svg_element.inner_html()
                    await browser.close()
                    return True, svg_content, ""
                else:
                    await browser.close()
                    return (
                        False,
                        "",
                        f"Could not find SVG element with selector: {selector}",
                    )

            except Exception as e:
                await browser.close()
                return False, "", f"SVG extraction error: {e!s}"

        except Exception as e:
            return False, "", f"Browser service error: {e!s}"

    def render_html_to_svg_with_wait_sync(
        self,
        html_content: str,
        selector: str = "svg",
        viewport_size: dict[str, int | None] = None,
        wait_condition: str | None = None,
        timeout: int = 30000,
    ) -> tuple[bool, str, str]:
        """Synchronous wrapper for render_html_to_svg_with_wait."""
        return self._run_async_operation(
            self.render_html_to_svg_with_wait(
                html_content, selector, viewport_size, wait_condition, timeout
            )
        )

    def take_screenshot_sync(
        self,
        url: str,
        output_path: str | None = None,
        viewport_size: dict[str, int | None] = None,
        full_page: bool = True,
        selector: str | None = None,
    ) -> tuple[bool, str, str]:
        """Synchronous wrapper for take_screenshot."""
        return self._run_async_operation(
            self.take_screenshot(url, output_path, viewport_size, full_page, selector)
        )
