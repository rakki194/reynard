"""
FastAPI Application for Browser Automation Service

Provides REST API endpoints for comprehensive browser automation including
screenshots, web scraping, PDF generation, and interactive automation.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from .browser_service import BrowserAutomationService

logger = logging.getLogger(__name__)

# Initialize the service
browser_service = BrowserAutomationService()

# Create FastAPI app
app = FastAPI(
    title="Reynard Browser Automation Service",
    description="Advanced browser automation service with Playwright integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# Request/Response Models
class ScreenshotRequest(BaseModel):
    """Request model for screenshot capture."""

    url: str = Field(..., description="URL to screenshot")
    viewport_width: int = Field(1920, description="Browser width")
    viewport_height: int = Field(1080, description="Browser height")
    full_page: bool = Field(True, description="Capture full page")
    quality: int = Field(100, description="Image quality (1-100)")
    selector: Optional[str] = Field(
        None, description="CSS selector for element screenshot"
    )
    wait_for: Optional[str] = Field(
        None, description="Selector to wait for before screenshot"
    )
    wait_timeout: int = Field(30000, description="Wait timeout in milliseconds")
    user_agent: Optional[str] = Field(None, description="Custom user agent")
    proxy: Optional[Dict[str, str]] = Field(None, description="Proxy configuration")


class ScrapingRequest(BaseModel):
    """Request model for web scraping."""

    url: str = Field(..., description="URL to scrape")
    selector: Optional[str] = Field(
        None, description="CSS selector for specific content"
    )
    viewport_width: int = Field(1920, description="Browser width")
    viewport_height: int = Field(1080, description="Browser height")
    wait_for: Optional[str] = Field(
        None, description="Selector to wait for before scraping"
    )
    wait_timeout: int = Field(30000, description="Wait timeout in milliseconds")
    user_agent: Optional[str] = Field(None, description="Custom user agent")
    proxy: Optional[Dict[str, str]] = Field(None, description="Proxy configuration")
    extract_links: bool = Field(False, description="Extract all links")
    extract_images: bool = Field(False, description="Extract all images")


class PDFRequest(BaseModel):
    """Request model for PDF generation."""

    url: str = Field(..., description="URL to convert to PDF")
    viewport_width: int = Field(1920, description="Browser width")
    viewport_height: int = Field(1080, description="Browser height")
    wait_for: Optional[str] = Field(
        None, description="Selector to wait for before PDF generation"
    )
    wait_timeout: int = Field(30000, description="Wait timeout in milliseconds")
    pdf_options: Optional[Dict[str, Any]] = Field(
        None, description="PDF generation options"
    )
    user_agent: Optional[str] = Field(None, description="Custom user agent")
    proxy: Optional[Dict[str, str]] = Field(None, description="Proxy configuration")


class JavaScriptRequest(BaseModel):
    """Request model for JavaScript execution."""

    url: str = Field(..., description="URL to execute script on")
    script: str = Field(..., description="JavaScript code to execute")
    viewport_width: int = Field(1920, description="Browser width")
    viewport_height: int = Field(1080, description="Browser height")
    wait_for: Optional[str] = Field(
        None, description="Selector to wait for before script execution"
    )
    wait_timeout: int = Field(30000, description="Wait timeout in milliseconds")
    user_agent: Optional[str] = Field(None, description="Custom user agent")
    proxy: Optional[Dict[str, str]] = Field(None, description="Proxy configuration")


class InteractionRequest(BaseModel):
    """Request model for page interactions."""

    url: str = Field(..., description="URL to interact with")
    interactions: List[Dict[str, Any]] = Field(
        ..., description="List of interaction commands"
    )
    viewport_width: int = Field(1920, description="Browser width")
    viewport_height: int = Field(1080, description="Browser height")
    wait_timeout: int = Field(30000, description="Wait timeout in milliseconds")
    user_agent: Optional[str] = Field(None, description="Custom user agent")
    proxy: Optional[Dict[str, str]] = Field(None, description="Proxy configuration")


class BaseResponse(BaseModel):
    """Base response model."""

    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ScrapingResponse(BaseModel):
    """Response model for scraping operations."""

    success: bool
    url: str
    title: str
    content: str
    html: str
    links: List[Dict[str, str]] = []
    images: List[Dict[str, Any]] = []
    error: Optional[str] = None


class JavaScriptResponse(BaseModel):
    """Response model for JavaScript execution."""

    success: bool
    result: Any
    error: Optional[str] = None


class InteractionResponse(BaseModel):
    """Response model for page interactions."""

    success: bool
    results: Dict[str, Any]
    error: Optional[str] = None


# Health and Info Endpoints
@app.get("/health")
async def health_check():
    """Perform a health check."""
    try:
        return {
            "status": "healthy" if browser_service.is_available() else "unhealthy",
            "available": browser_service.is_available(),
            "service_info": browser_service.get_service_info(),
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {e}")


@app.get("/info")
async def get_service_info():
    """Get service information and capabilities."""
    try:
        return browser_service.get_service_info()
    except Exception as e:
        logger.error(f"Service info error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get service info: {e}")


# Screenshot Endpoints
@app.post("/screenshot")
async def take_screenshot(request: ScreenshotRequest):
    """Take a screenshot of a webpage."""
    try:
        viewport_size = {
            "width": request.viewport_width,
            "height": request.viewport_height,
        }

        success, output_path, error = browser_service.take_screenshot_sync(
            url=request.url,
            viewport_size=viewport_size,
            full_page=request.full_page,
            quality=request.quality,
            selector=request.selector,
            wait_for=request.wait_for,
            wait_timeout=request.wait_timeout,
            user_agent=request.user_agent,
            proxy=request.proxy,
        )

        if success:
            return FileResponse(
                output_path, media_type="image/png", filename="screenshot.png"
            )
        else:
            raise HTTPException(status_code=400, detail=f"Screenshot failed: {error}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Screenshot error: {e}")
        raise HTTPException(status_code=500, detail=f"Screenshot failed: {e}")


@app.post("/screenshot/save", response_model=BaseResponse)
async def save_screenshot(request: ScreenshotRequest, output_path: str):
    """Take a screenshot and save it to a specific path."""
    try:
        viewport_size = {
            "width": request.viewport_width,
            "height": request.viewport_height,
        }

        success, saved_path, error = browser_service.take_screenshot_sync(
            url=request.url,
            output_path=output_path,
            viewport_size=viewport_size,
            full_page=request.full_page,
            quality=request.quality,
            selector=request.selector,
            wait_for=request.wait_for,
            wait_timeout=request.wait_timeout,
            user_agent=request.user_agent,
            proxy=request.proxy,
        )

        if success:
            return BaseResponse(
                success=True,
                message="Screenshot saved successfully",
                data={"output_path": saved_path},
            )
        else:
            return BaseResponse(success=False, message="Screenshot failed", error=error)
    except Exception as e:
        logger.error(f"Screenshot save error: {e}")
        raise HTTPException(status_code=500, detail=f"Screenshot save failed: {e}")


# Scraping Endpoints
@app.post("/scrape", response_model=ScrapingResponse)
async def scrape_webpage(request: ScrapingRequest):
    """Scrape content from a webpage."""
    try:
        viewport_size = {
            "width": request.viewport_width,
            "height": request.viewport_height,
        }

        success, content_data, error = browser_service.scrape_webpage_sync(
            url=request.url,
            selector=request.selector,
            viewport_size=viewport_size,
            wait_for=request.wait_for,
            wait_timeout=request.wait_timeout,
            user_agent=request.user_agent,
            proxy=request.proxy,
            extract_links=request.extract_links,
            extract_images=request.extract_images,
        )

        if success:
            return ScrapingResponse(
                success=True,
                url=content_data["url"],
                title=content_data["title"],
                content=content_data["content"],
                html=content_data["html"],
                links=content_data["links"],
                images=content_data["images"],
            )
        else:
            return ScrapingResponse(
                success=False,
                url=request.url,
                title="",
                content="",
                html="",
                error=error,
            )
    except Exception as e:
        logger.error(f"Scraping error: {e}")
        raise HTTPException(status_code=500, detail=f"Scraping failed: {e}")


# PDF Generation Endpoints
@app.post("/pdf")
async def generate_pdf(request: PDFRequest):
    """Generate PDF from a webpage."""
    try:
        viewport_size = {
            "width": request.viewport_width,
            "height": request.viewport_height,
        }

        success, output_path, error = browser_service.generate_pdf_sync(
            url=request.url,
            viewport_size=viewport_size,
            wait_for=request.wait_for,
            wait_timeout=request.wait_timeout,
            pdf_options=request.pdf_options,
            user_agent=request.user_agent,
            proxy=request.proxy,
        )

        if success:
            return FileResponse(
                output_path, media_type="application/pdf", filename="document.pdf"
            )
        else:
            raise HTTPException(
                status_code=400, detail=f"PDF generation failed: {error}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")


@app.post("/pdf/save", response_model=BaseResponse)
async def save_pdf(request: PDFRequest, output_path: str):
    """Generate PDF and save it to a specific path."""
    try:
        viewport_size = {
            "width": request.viewport_width,
            "height": request.viewport_height,
        }

        success, saved_path, error = browser_service.generate_pdf_sync(
            url=request.url,
            output_path=output_path,
            viewport_size=viewport_size,
            wait_for=request.wait_for,
            wait_timeout=request.wait_timeout,
            pdf_options=request.pdf_options,
            user_agent=request.user_agent,
            proxy=request.proxy,
        )

        if success:
            return BaseResponse(
                success=True,
                message="PDF saved successfully",
                data={"output_path": saved_path},
            )
        else:
            return BaseResponse(
                success=False, message="PDF generation failed", error=error
            )
    except Exception as e:
        logger.error(f"PDF save error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF save failed: {e}")


# JavaScript Execution Endpoints
@app.post("/javascript", response_model=JavaScriptResponse)
async def execute_javascript(request: JavaScriptRequest):
    """Execute JavaScript on a webpage."""
    try:
        viewport_size = {
            "width": request.viewport_width,
            "height": request.viewport_height,
        }

        success, result, error = browser_service.execute_javascript_sync(
            url=request.url,
            script=request.script,
            viewport_size=viewport_size,
            wait_for=request.wait_for,
            wait_timeout=request.wait_timeout,
            user_agent=request.user_agent,
            proxy=request.proxy,
        )

        if success:
            return JavaScriptResponse(success=True, result=result)
        else:
            return JavaScriptResponse(success=False, result=None, error=error)
    except Exception as e:
        logger.error(f"JavaScript execution error: {e}")
        raise HTTPException(status_code=500, detail=f"JavaScript execution failed: {e}")


# Page Interaction Endpoints
@app.post("/interact", response_model=InteractionResponse)
async def interact_with_page(request: InteractionRequest):
    """Perform interactive actions on a webpage."""
    try:
        viewport_size = {
            "width": request.viewport_width,
            "height": request.viewport_height,
        }

        success, results, error = browser_service.interact_with_page_sync(
            url=request.url,
            interactions=request.interactions,
            viewport_size=viewport_size,
            wait_timeout=request.wait_timeout,
            user_agent=request.user_agent,
            proxy=request.proxy,
        )

        if success:
            return InteractionResponse(success=True, results=results)
        else:
            return InteractionResponse(success=False, results={}, error=error)
    except Exception as e:
        logger.error(f"Page interaction error: {e}")
        raise HTTPException(status_code=500, detail=f"Page interaction failed: {e}")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "Reynard Browser Automation Service",
        "version": "1.0.0",
        "status": "running",
        "available": browser_service.is_available(),
        "endpoints": {
            "health": "/health",
            "info": "/info",
            "screenshot": "/screenshot",
            "screenshot_save": "/screenshot/save",
            "scrape": "/scrape",
            "pdf": "/pdf",
            "pdf_save": "/pdf/save",
            "javascript": "/javascript",
            "interact": "/interact",
        },
    }


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found", "path": str(request.url)},
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500, content={"error": "Internal server error", "detail": str(exc)}
    )
