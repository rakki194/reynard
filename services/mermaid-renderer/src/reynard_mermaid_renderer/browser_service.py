"""
Enhanced Playwright Browser Service for Mermaid Rendering

A specialized browser service optimized for Mermaid diagram rendering
with support for SVG, PNG, and PDF output formats.
"""

import asyncio
import logging
import tempfile
from pathlib import Path
from typing import Any, Optional

try:
    from playwright.async_api import Browser, Page, async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    Browser = Any  # type: ignore
    Page = Any  # type: ignore
    async_playwright = None  # type: ignore

logger = logging.getLogger(__name__)


class MermaidBrowserService:
    """Enhanced browser service specialized for Mermaid diagram rendering."""

    def __init__(self) -> None:
        """Initialize the Mermaid browser service."""
        self.playwright_available = PLAYWRIGHT_AVAILABLE
        if not self.playwright_available:
            logger.warning(
                "Playwright not available. Install with: pip install playwright"
            )

    def _run_async_operation(self, coro: Any) -> Any:
        """Run an async operation in a new event loop."""
        try:
            return asyncio.run(coro)
        except RuntimeError as e:
            if "cannot be called from a running event loop" in str(e):
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
        viewport_size: Optional[dict[str, int]] = None,
        user_agent: Optional[str] = None,
    ) -> tuple[Browser, Page]:
        """Create a browser and page optimized for Mermaid rendering."""
        if not self.playwright_available:
            raise RuntimeError(
                "Playwright not available. Install with: pip install playwright"
            )

        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-web-security",
                "--disable-features=VizDisplayCompositor",
            ]
        )
        page = await browser.new_page()

        # Set viewport for optimal Mermaid rendering
        if viewport_size is None:
            viewport_size = {"width": 1920, "height": 1080}
        
        await page.set_viewport_size(viewport_size)

        # Set user agent if specified
        if user_agent:
            await page.set_extra_http_headers({"User-Agent": user_agent})

        return browser, page

    async def render_mermaid_to_svg(
        self,
        html_content: str,
        wait_condition: str = "data-mermaid-ready",
        timeout: int = 30000,
    ) -> tuple[bool, str, str]:
        """
        Render Mermaid HTML to SVG content.

        Args:
            html_content: HTML content with Mermaid diagram
            wait_condition: Condition to wait for before extracting SVG
            timeout: Maximum wait time in milliseconds

        Returns:
            Tuple of (success, svg_content, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    "",
                    "Playwright not available. Install with: pip install playwright",
                )

            browser, page = await self._create_browser_page()

            try:
                # Set content and wait for Mermaid to render
                await page.set_content(html_content)
                
                # Wait for Mermaid rendering to complete
                await page.wait_for_function(
                    f"document.body.getAttribute('{wait_condition}') === 'true'",
                    timeout=timeout
                )

                # Check for Mermaid errors
                error_attr = await page.get_attribute("body", "data-mermaid-error")
                if error_attr:
                    await browser.close()
                    return False, "", f"Mermaid rendering error: {error_attr}"

                # Extract SVG content
                svg_element = await page.query_selector("svg")
                if not svg_element:
                    await browser.close()
                    return False, "", "No SVG element found in rendered content"

                svg_content = await svg_element.inner_html()
                if not svg_content:
                    await browser.close()
                    return False, "", "SVG element is empty"

                # Get the full SVG with attributes
                svg_outer_html = await svg_element.evaluate("el => el.outerHTML")
                
                await browser.close()
                return True, svg_outer_html, ""

            except Exception as e:
                await browser.close()
                return False, "", f"SVG rendering error: {e}"

        except Exception as e:
            return False, "", f"Browser service error: {e}"

    async def render_mermaid_to_png(
        self,
        html_content: str,
        output_path: Optional[str] = None,
        viewport_size: Optional[dict[str, int]] = None,
        quality: int = 100,
        wait_condition: str = "data-mermaid-ready",
        timeout: int = 30000,
    ) -> tuple[bool, str, str]:
        """
        Render Mermaid HTML to PNG image.

        Args:
            html_content: HTML content with Mermaid diagram
            output_path: Optional output file path
            viewport_size: Browser viewport size
            quality: Image quality (1-100)
            wait_condition: Condition to wait for before capturing
            timeout: Maximum wait time in milliseconds

        Returns:
            Tuple of (success, output_path, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    "",
                    "Playwright not available. Install with: pip install playwright",
                )

            browser, page = await self._create_browser_page(viewport_size)

            try:
                # Set content and wait for Mermaid to render
                await page.set_content(html_content)
                
                # Wait for Mermaid rendering to complete
                await page.wait_for_function(
                    f"document.body.getAttribute('{wait_condition}') === 'true'",
                    timeout=timeout
                )

                # Check for Mermaid errors
                error_attr = await page.get_attribute("body", "data-mermaid-error")
                if error_attr:
                    await browser.close()
                    return False, "", f"Mermaid rendering error: {error_attr}"

                # Create output path if not provided
                if output_path is None:
                    temp_file = tempfile.NamedTemporaryFile(
                        suffix=".png", delete=False
                    )
                    output_path = temp_file.name
                    temp_file.close()

                # Ensure directory exists
                Path(output_path).parent.mkdir(parents=True, exist_ok=True)

                # Take screenshot of the SVG element
                svg_element = await page.query_selector("svg")
                if svg_element:
                    await svg_element.screenshot(
                        path=output_path,
                        type="png",
                        quality=quality
                    )
                else:
                    # Fallback to full page screenshot
                    await page.screenshot(
                        path=output_path,
                        type="png",
                        quality=quality,
                        full_page=True
                    )

                await browser.close()
                return True, output_path, ""

            except Exception as e:
                await browser.close()
                return False, "", f"PNG rendering error: {e}"

        except Exception as e:
            return False, "", f"Browser service error: {e}"

    async def render_mermaid_to_pdf(
        self,
        html_content: str,
        output_path: Optional[str] = None,
        viewport_size: Optional[dict[str, int]] = None,
        wait_condition: str = "data-mermaid-ready",
        timeout: int = 30000,
        pdf_options: Optional[dict[str, Any]] = None,
    ) -> tuple[bool, str, str]:
        """
        Render Mermaid HTML to PDF document.

        Args:
            html_content: HTML content with Mermaid diagram
            output_path: Optional output file path
            viewport_size: Browser viewport size
            wait_condition: Condition to wait for before generating PDF
            timeout: Maximum wait time in milliseconds
            pdf_options: Additional PDF generation options

        Returns:
            Tuple of (success, output_path, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    "",
                    "Playwright not available. Install with: pip install playwright",
                )

            browser, page = await self._create_browser_page(viewport_size)

            try:
                # Set content and wait for Mermaid to render
                await page.set_content(html_content)
                
                # Wait for Mermaid rendering to complete
                await page.wait_for_function(
                    f"document.body.getAttribute('{wait_condition}') === 'true'",
                    timeout=timeout
                )

                # Check for Mermaid errors
                error_attr = await page.get_attribute("body", "data-mermaid-error")
                if error_attr:
                    await browser.close()
                    return False, "", f"Mermaid rendering error: {error_attr}"

                # Create output path if not provided
                if output_path is None:
                    temp_file = tempfile.NamedTemporaryFile(
                        suffix=".pdf", delete=False
                    )
                    output_path = temp_file.name
                    temp_file.close()

                # Ensure directory exists
                Path(output_path).parent.mkdir(parents=True, exist_ok=True)

                # Default PDF options
                default_pdf_options = {
                    "format": "A4",
                    "print_background": True,
                    "margin": {"top": "1cm", "right": "1cm", "bottom": "1cm", "left": "1cm"},
                }
                
                if pdf_options:
                    default_pdf_options.update(pdf_options)

                # Generate PDF
                await page.pdf(path=output_path, **default_pdf_options)

                await browser.close()
                return True, output_path, ""

            except Exception as e:
                await browser.close()
                return False, "", f"PDF rendering error: {e}"

        except Exception as e:
            return False, "", f"Browser service error: {e}"

    # Synchronous wrappers for compatibility
    def render_mermaid_to_svg_sync(
        self,
        html_content: str,
        wait_condition: str = "data-mermaid-ready",
        timeout: int = 30000,
    ) -> tuple[bool, str, str]:
        """Synchronous wrapper for SVG rendering."""
        return self._run_async_operation(
            self.render_mermaid_to_svg(html_content, wait_condition, timeout)
        )

    def render_mermaid_to_png_sync(
        self,
        html_content: str,
        output_path: Optional[str] = None,
        viewport_size: Optional[dict[str, int]] = None,
        quality: int = 100,
        wait_condition: str = "data-mermaid-ready",
        timeout: int = 30000,
    ) -> tuple[bool, str, str]:
        """Synchronous wrapper for PNG rendering."""
        return self._run_async_operation(
            self.render_mermaid_to_png(
                html_content, output_path, viewport_size, quality, wait_condition, timeout
            )
        )

    def render_mermaid_to_pdf_sync(
        self,
        html_content: str,
        output_path: Optional[str] = None,
        viewport_size: Optional[dict[str, int]] = None,
        wait_condition: str = "data-mermaid-ready",
        timeout: int = 30000,
        pdf_options: Optional[dict[str, Any]] = None,
    ) -> tuple[bool, str, str]:
        """Synchronous wrapper for PDF rendering."""
        return self._run_async_operation(
            self.render_mermaid_to_pdf(
                html_content, output_path, viewport_size, wait_condition, timeout, pdf_options
            )
        )
