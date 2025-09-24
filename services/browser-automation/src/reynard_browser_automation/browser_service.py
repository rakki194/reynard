"""
Enhanced Browser Automation Service

A comprehensive browser automation service using Playwright with advanced features
for web scraping, screenshot capture, PDF generation, and interactive automation.
"""

import asyncio
import logging
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

try:
    from playwright.async_api import Browser, Page, async_playwright, BrowserContext
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    Browser = Any  # type: ignore
    Page = Any  # type: ignore
    BrowserContext = Any  # type: ignore
    async_playwright = None  # type: ignore

logger = logging.getLogger(__name__)


class BrowserAutomationService:
    """Enhanced browser automation service with comprehensive web automation capabilities."""

    def __init__(self) -> None:
        """Initialize the browser automation service."""
        self.playwright_available = PLAYWRIGHT_AVAILABLE
        if not self.playwright_available:
            logger.warning(
                "Playwright not available. Install with: pip install playwright"
            )
        
        # Browser pool management
        self._browser_pool: List[Browser] = []
        self._max_pool_size = 5
        self._current_pool_size = 0

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

    async def _create_browser_context(
        self,
        viewport_size: Optional[Dict[str, int]] = None,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
        cookies: Optional[List[Dict[str, Any]]] = None,
        extra_http_headers: Optional[Dict[str, str]] = None,
    ) -> Tuple[Browser, BrowserContext, Page]:
        """Create a browser, context, and page with specified settings."""
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
                "--disable-blink-features=AutomationControlled",
                "--disable-extensions",
            ]
        )

        # Create context with options
        context_options = {}
        if viewport_size:
            context_options["viewport"] = viewport_size
        if user_agent:
            context_options["user_agent"] = user_agent
        if proxy:
            context_options["proxy"] = proxy
        if extra_http_headers:
            context_options["extra_http_headers"] = extra_http_headers

        context = await browser.new_context(**context_options)

        # Set cookies if provided
        if cookies:
            await context.add_cookies(cookies)

        page = await context.new_page()

        return browser, context, page

    async def take_screenshot(
        self,
        url: str,
        output_path: Optional[str] = None,
        viewport_size: Optional[Dict[str, int]] = None,
        full_page: bool = True,
        quality: int = 100,
        selector: Optional[str] = None,
        wait_for: Optional[str] = None,
        wait_timeout: int = 30000,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
    ) -> Tuple[bool, str, str]:
        """
        Take a screenshot of a webpage.

        Args:
            url: URL to screenshot
            output_path: Optional output file path
            viewport_size: Browser viewport size
            full_page: Whether to capture full page or just viewport
            quality: Image quality (1-100)
            selector: Optional CSS selector for element screenshot
            wait_for: Optional selector to wait for before screenshot
            wait_timeout: Maximum wait time in milliseconds
            user_agent: Custom user agent string
            proxy: Proxy configuration

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

            browser, context, page = await self._create_browser_context(
                viewport_size, user_agent, proxy
            )

            try:
                # Navigate to URL
                await page.goto(url, wait_until="networkidle", timeout=wait_timeout)

                # Wait for specific element if specified
                if wait_for:
                    await page.wait_for_selector(wait_for, timeout=wait_timeout)

                # Create output path if not provided
                if output_path is None:
                    temp_file = tempfile.NamedTemporaryFile(
                        suffix=".png", delete=False
                    )
                    output_path = temp_file.name
                    temp_file.close()

                # Ensure directory exists
                Path(output_path).parent.mkdir(parents=True, exist_ok=True)

                # Take screenshot
                if selector:
                    element = await page.query_selector(selector)
                    if element:
                        await element.screenshot(
                            path=output_path,
                            type="png",
                            quality=quality
                        )
                    else:
                        await context.close()
                        await browser.close()
                        return (
                            False,
                            "",
                            f"Could not find element with selector: {selector}",
                        )
                else:
                    await page.screenshot(
                        path=output_path,
                        type="png",
                        quality=quality,
                        full_page=full_page
                    )

                await context.close()
                await browser.close()
                return True, output_path, ""

            except Exception as e:
                await context.close()
                await browser.close()
                return False, "", f"Screenshot error: {e}"

        except Exception as e:
            return False, "", f"Browser service error: {e}"

    async def scrape_webpage(
        self,
        url: str,
        selector: Optional[str] = None,
        viewport_size: Optional[Dict[str, int]] = None,
        wait_for: Optional[str] = None,
        wait_timeout: int = 30000,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
        extract_links: bool = False,
        extract_images: bool = False,
    ) -> Tuple[bool, Dict[str, Any], str]:
        """
        Scrape content from a webpage with enhanced extraction capabilities.

        Args:
            url: URL to scrape
            selector: Optional CSS selector to extract specific content
            viewport_size: Browser viewport size
            wait_for: Optional selector to wait for before scraping
            wait_timeout: Maximum wait time in milliseconds
            user_agent: Custom user agent string
            proxy: Proxy configuration
            extract_links: Whether to extract all links
            extract_images: Whether to extract all images

        Returns:
            Tuple of (success, content_data, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    {},
                    "Playwright not available. Install with: pip install playwright",
                )

            browser, context, page = await self._create_browser_context(
                viewport_size, user_agent, proxy
            )

            try:
                # Navigate to URL
                await page.goto(url, wait_until="networkidle", timeout=wait_timeout)

                # Wait for specific element if specified
                if wait_for:
                    await page.wait_for_selector(wait_for, timeout=wait_timeout)

                # Extract content
                content_data = {
                    "url": url,
                    "title": await page.title(),
                    "content": "",
                    "html": "",
                    "links": [],
                    "images": [],
                }

                if selector:
                    element = await page.query_selector(selector)
                    if element:
                        content_data["content"] = await element.inner_text()
                        content_data["html"] = await element.inner_html()
                    else:
                        await context.close()
                        await browser.close()
                        return (
                            False,
                            content_data,
                            f"Could not find element with selector: {selector}",
                        )
                else:
                    content_data["content"] = await page.content()
                    content_data["html"] = await page.content()

                # Extract links if requested
                if extract_links:
                    links = await page.evaluate("""
                        () => {
                            const links = Array.from(document.querySelectorAll('a[href]'));
                            return links.map(link => ({
                                text: link.textContent.trim(),
                                href: link.href,
                                title: link.title || ''
                            }));
                        }
                    """)
                    content_data["links"] = links

                # Extract images if requested
                if extract_images:
                    images = await page.evaluate("""
                        () => {
                            const images = Array.from(document.querySelectorAll('img[src]'));
                            return images.map(img => ({
                                src: img.src,
                                alt: img.alt || '',
                                title: img.title || '',
                                width: img.width,
                                height: img.height
                            }));
                        }
                    """)
                    content_data["images"] = images

                await context.close()
                await browser.close()
                return True, content_data, ""

            except Exception as e:
                await context.close()
                await browser.close()
                return False, content_data, f"Scraping error: {e}"

        except Exception as e:
            return False, {}, f"Browser service error: {e}"

    async def generate_pdf(
        self,
        url: str,
        output_path: Optional[str] = None,
        viewport_size: Optional[Dict[str, int]] = None,
        wait_for: Optional[str] = None,
        wait_timeout: int = 30000,
        pdf_options: Optional[Dict[str, Any]] = None,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
    ) -> Tuple[bool, str, str]:
        """
        Generate PDF from a webpage.

        Args:
            url: URL to convert to PDF
            output_path: Optional output file path
            viewport_size: Browser viewport size
            wait_for: Optional selector to wait for before PDF generation
            wait_timeout: Maximum wait time in milliseconds
            pdf_options: PDF generation options
            user_agent: Custom user agent string
            proxy: Proxy configuration

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

            browser, context, page = await self._create_browser_context(
                viewport_size, user_agent, proxy
            )

            try:
                # Navigate to URL
                await page.goto(url, wait_until="networkidle", timeout=wait_timeout)

                # Wait for specific element if specified
                if wait_for:
                    await page.wait_for_selector(wait_for, timeout=wait_timeout)

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

                await context.close()
                await browser.close()
                return True, output_path, ""

            except Exception as e:
                await context.close()
                await browser.close()
                return False, "", f"PDF generation error: {e}"

        except Exception as e:
            return False, "", f"Browser service error: {e}"

    async def execute_javascript(
        self,
        url: str,
        script: str,
        viewport_size: Optional[Dict[str, int]] = None,
        wait_for: Optional[str] = None,
        wait_timeout: int = 30000,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
    ) -> Tuple[bool, Any, str]:
        """
        Execute JavaScript on a webpage.

        Args:
            url: URL to execute script on
            script: JavaScript code to execute
            viewport_size: Browser viewport size
            wait_for: Optional selector to wait for before script execution
            wait_timeout: Maximum wait time in milliseconds
            user_agent: Custom user agent string
            proxy: Proxy configuration

        Returns:
            Tuple of (success, result, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    None,
                    "Playwright not available. Install with: pip install playwright",
                )

            browser, context, page = await self._create_browser_context(
                viewport_size, user_agent, proxy
            )

            try:
                # Navigate to URL
                await page.goto(url, wait_until="networkidle", timeout=wait_timeout)

                # Wait for specific element if specified
                if wait_for:
                    await page.wait_for_selector(wait_for, timeout=wait_timeout)

                # Execute JavaScript
                result = await page.evaluate(script)

                await context.close()
                await browser.close()
                return True, result, ""

            except Exception as e:
                await context.close()
                await browser.close()
                return False, None, f"JavaScript execution error: {e}"

        except Exception as e:
            return False, None, f"Browser service error: {e}"

    async def interact_with_page(
        self,
        url: str,
        interactions: List[Dict[str, Any]],
        viewport_size: Optional[Dict[str, int]] = None,
        wait_timeout: int = 30000,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
    ) -> Tuple[bool, Dict[str, Any], str]:
        """
        Perform interactive actions on a webpage.

        Args:
            url: URL to interact with
            interactions: List of interaction commands
            viewport_size: Browser viewport size
            wait_timeout: Maximum wait time in milliseconds
            user_agent: Custom user agent string
            proxy: Proxy configuration

        Returns:
            Tuple of (success, results, error_message)
        """
        try:
            if not self.playwright_available:
                return (
                    False,
                    {},
                    "Playwright not available. Install with: pip install playwright",
                )

            browser, context, page = await self._create_browser_context(
                viewport_size, user_agent, proxy
            )

            try:
                # Navigate to URL
                await page.goto(url, wait_until="networkidle", timeout=wait_timeout)

                results = {}
                
                # Execute interactions
                for i, interaction in enumerate(interactions):
                    action = interaction.get("action")
                    selector = interaction.get("selector")
                    value = interaction.get("value")
                    wait_time = interaction.get("wait", 1000)

                    try:
                        if action == "click":
                            await page.click(selector)
                        elif action == "type":
                            await page.fill(selector, value)
                        elif action == "select":
                            await page.select_option(selector, value)
                        elif action == "hover":
                            await page.hover(selector)
                        elif action == "scroll":
                            await page.evaluate(f"window.scrollTo(0, {value})")
                        elif action == "wait":
                            await page.wait_for_timeout(value)
                        elif action == "screenshot":
                            temp_file = tempfile.NamedTemporaryFile(
                                suffix=".png", delete=False
                            )
                            await page.screenshot(path=temp_file.name)
                            results[f"screenshot_{i}"] = temp_file.name
                        elif action == "evaluate":
                            result = await page.evaluate(value)
                            results[f"evaluate_{i}"] = result

                        # Wait between interactions
                        if wait_time > 0:
                            await page.wait_for_timeout(wait_time)

                    except Exception as e:
                        results[f"error_{i}"] = str(e)

                await context.close()
                await browser.close()
                return True, results, ""

            except Exception as e:
                await context.close()
                await browser.close()
                return False, {}, f"Interaction error: {e}"

        except Exception as e:
            return False, {}, f"Browser service error: {e}"

    # Synchronous wrappers for compatibility
    def take_screenshot_sync(
        self,
        url: str,
        output_path: Optional[str] = None,
        viewport_size: Optional[Dict[str, int]] = None,
        full_page: bool = True,
        quality: int = 100,
        selector: Optional[str] = None,
        wait_for: Optional[str] = None,
        wait_timeout: int = 30000,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
    ) -> Tuple[bool, str, str]:
        """Synchronous wrapper for screenshot capture."""
        return self._run_async_operation(
            self.take_screenshot(
                url, output_path, viewport_size, full_page, quality,
                selector, wait_for, wait_timeout, user_agent, proxy
            )
        )

    def scrape_webpage_sync(
        self,
        url: str,
        selector: Optional[str] = None,
        viewport_size: Optional[Dict[str, int]] = None,
        wait_for: Optional[str] = None,
        wait_timeout: int = 30000,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
        extract_links: bool = False,
        extract_images: bool = False,
    ) -> Tuple[bool, Dict[str, Any], str]:
        """Synchronous wrapper for webpage scraping."""
        return self._run_async_operation(
            self.scrape_webpage(
                url, selector, viewport_size, wait_for, wait_timeout,
                user_agent, proxy, extract_links, extract_images
            )
        )

    def generate_pdf_sync(
        self,
        url: str,
        output_path: Optional[str] = None,
        viewport_size: Optional[Dict[str, int]] = None,
        wait_for: Optional[str] = None,
        wait_timeout: int = 30000,
        pdf_options: Optional[Dict[str, Any]] = None,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
    ) -> Tuple[bool, str, str]:
        """Synchronous wrapper for PDF generation."""
        return self._run_async_operation(
            self.generate_pdf(
                url, output_path, viewport_size, wait_for, wait_timeout,
                pdf_options, user_agent, proxy
            )
        )

    def execute_javascript_sync(
        self,
        url: str,
        script: str,
        viewport_size: Optional[Dict[str, int]] = None,
        wait_for: Optional[str] = None,
        wait_timeout: int = 30000,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
    ) -> Tuple[bool, Any, str]:
        """Synchronous wrapper for JavaScript execution."""
        return self._run_async_operation(
            self.execute_javascript(
                url, script, viewport_size, wait_for, wait_timeout,
                user_agent, proxy
            )
        )

    def interact_with_page_sync(
        self,
        url: str,
        interactions: List[Dict[str, Any]],
        viewport_size: Optional[Dict[str, int]] = None,
        wait_timeout: int = 30000,
        user_agent: Optional[str] = None,
        proxy: Optional[Dict[str, str]] = None,
    ) -> Tuple[bool, Dict[str, Any], str]:
        """Synchronous wrapper for page interactions."""
        return self._run_async_operation(
            self.interact_with_page(
                url, interactions, viewport_size, wait_timeout,
                user_agent, proxy
            )
        )

    def is_available(self) -> bool:
        """Check if the browser automation service is available."""
        return self.playwright_available

    def get_service_info(self) -> Dict[str, Any]:
        """Get comprehensive service information."""
        return {
            "available": self.playwright_available,
            "max_pool_size": self._max_pool_size,
            "current_pool_size": self._current_pool_size,
            "supported_browsers": ["chromium"],
            "supported_operations": [
                "screenshot",
                "scraping",
                "pdf_generation",
                "javascript_execution",
                "page_interaction"
            ],
        }
