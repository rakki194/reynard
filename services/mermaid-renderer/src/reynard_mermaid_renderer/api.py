"""
FastAPI Application for Mermaid Rendering Service

Provides REST API endpoints for Mermaid diagram rendering with comprehensive
format support, validation, and statistics.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from .service import MermaidRenderingService

logger = logging.getLogger(__name__)

# Initialize the service
mermaid_service = MermaidRenderingService()

# Create FastAPI app
app = FastAPI(
    title="Reynard Mermaid Rendering Service",
    description="A comprehensive Mermaid diagram rendering service with SVG, PNG, and PDF support",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Request/Response Models
class RenderRequest(BaseModel):
    """Request model for diagram rendering."""
    diagram: str = Field(..., description="Mermaid diagram content")
    theme: str = Field("default", description="Mermaid theme")
    bg_color: Optional[str] = Field(None, description="Background color")
    width: Optional[int] = Field(None, description="Custom width")
    height: Optional[int] = Field(None, description="Custom height")
    config: Optional[Dict[str, Any]] = Field(None, description="Custom Mermaid configuration")

class RenderResponse(BaseModel):
    """Response model for rendering operations."""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ValidationRequest(BaseModel):
    """Request model for diagram validation."""
    diagram: str = Field(..., description="Mermaid diagram content to validate")

class ValidationResponse(BaseModel):
    """Response model for validation operations."""
    valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    diagram_length: int
    lines: int

class StatsResponse(BaseModel):
    """Response model for diagram statistics."""
    valid: bool
    diagram_length: int
    lines: int
    non_empty_lines: int
    svg_size: int
    png_size: int
    pdf_size: int
    available_themes: List[str]
    mermaid_version: str
    errors: Optional[Dict[str, str]] = None

class HealthResponse(BaseModel):
    """Response model for health checks."""
    status: str
    available: bool
    test_diagram_valid: bool
    service_info: Dict[str, Any]
    test_errors: List[str] = []
    test_warnings: List[str] = []

# Health and Info Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Perform a comprehensive health check."""
    try:
        health_data = mermaid_service.health_check()
        return HealthResponse(**health_data)
    except Exception as e:
        logger.error(f"Health check error: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {e}")

@app.get("/info")
async def get_service_info():
    """Get service information and capabilities."""
    try:
        return mermaid_service.get_service_info()
    except Exception as e:
        logger.error(f"Service info error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get service info: {e}")

@app.get("/themes")
async def get_available_themes():
    """Get list of available Mermaid themes."""
    try:
        themes = mermaid_service.get_available_themes()
        return {"themes": themes}
    except Exception as e:
        logger.error(f"Themes error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get themes: {e}")

# Rendering Endpoints
@app.post("/render/svg", response_model=RenderResponse)
async def render_svg(request: RenderRequest):
    """Render a Mermaid diagram to SVG format."""
    try:
        success, svg_content, error = mermaid_service.render_to_svg(
            diagram=request.diagram,
            theme=request.theme,
            bg_color=request.bg_color,
            width=request.width,
            height=request.height,
            config=request.config,
        )
        
        if success:
            return RenderResponse(
                success=True,
                message="SVG rendered successfully",
                data={"svg_content": svg_content, "size": len(svg_content)}
            )
        else:
            return RenderResponse(
                success=False,
                message="SVG rendering failed",
                error=error
            )
    except Exception as e:
        logger.error(f"SVG rendering error: {e}")
        raise HTTPException(status_code=500, detail=f"SVG rendering failed: {e}")

@app.post("/render/png")
async def render_png(request: RenderRequest, quality: int = 100):
    """Render a Mermaid diagram to PNG format."""
    try:
        success, png_data, error = mermaid_service.render_to_png(
            diagram=request.diagram,
            theme=request.theme,
            bg_color=request.bg_color,
            width=request.width,
            height=request.height,
            quality=quality,
            config=request.config,
        )
        
        if success:
            return Response(
                content=png_data,
                media_type="image/png",
                headers={"Content-Length": str(len(png_data))}
            )
        else:
            raise HTTPException(status_code=400, detail=f"PNG rendering failed: {error}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PNG rendering error: {e}")
        raise HTTPException(status_code=500, detail=f"PNG rendering failed: {e}")

@app.post("/render/pdf")
async def render_pdf(
    request: RenderRequest,
    pdf_options: Optional[Dict[str, Any]] = None
):
    """Render a Mermaid diagram to PDF format."""
    try:
        success, pdf_data, error = mermaid_service.render_to_pdf(
            diagram=request.diagram,
            theme=request.theme,
            bg_color=request.bg_color,
            width=request.width,
            height=request.height,
            config=request.config,
            pdf_options=pdf_options,
        )
        
        if success:
            return Response(
                content=pdf_data,
                media_type="application/pdf",
                headers={"Content-Length": str(len(pdf_data))}
            )
        else:
            raise HTTPException(status_code=400, detail=f"PDF rendering failed: {error}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF rendering error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF rendering failed: {e}")

# Validation and Analysis Endpoints
@app.post("/validate", response_model=ValidationResponse)
async def validate_diagram(request: ValidationRequest):
    """Validate a Mermaid diagram."""
    try:
        is_valid, errors, warnings = mermaid_service.validate_diagram(request.diagram)
        
        return ValidationResponse(
            valid=is_valid,
            errors=errors,
            warnings=warnings,
            diagram_length=len(request.diagram),
            lines=len(request.diagram.splitlines())
        )
    except Exception as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {e}")

@app.post("/stats", response_model=StatsResponse)
async def get_diagram_stats(request: ValidationRequest):
    """Get comprehensive statistics about a Mermaid diagram."""
    try:
        stats = mermaid_service.get_diagram_stats(request.diagram)
        return StatsResponse(**stats)
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=f"Stats generation failed: {e}")

# File Save Endpoints
@app.post("/save/svg", response_model=RenderResponse)
async def save_svg(request: RenderRequest, output_path: str):
    """Render and save a Mermaid diagram as SVG file."""
    try:
        success, saved_path, error = mermaid_service.save_svg(
            diagram=request.diagram,
            output_path=output_path,
            theme=request.theme,
            bg_color=request.bg_color,
            width=request.width,
            height=request.height,
            config=request.config,
        )
        
        if success:
            return RenderResponse(
                success=True,
                message="SVG saved successfully",
                data={"output_path": saved_path}
            )
        else:
            return RenderResponse(
                success=False,
                message="SVG save failed",
                error=error
            )
    except Exception as e:
        logger.error(f"SVG save error: {e}")
        raise HTTPException(status_code=500, detail=f"SVG save failed: {e}")

@app.post("/save/png", response_model=RenderResponse)
async def save_png(
    request: RenderRequest,
    output_path: str,
    quality: int = 100
):
    """Render and save a Mermaid diagram as PNG file."""
    try:
        success, saved_path, error = mermaid_service.save_png(
            diagram=request.diagram,
            output_path=output_path,
            theme=request.theme,
            bg_color=request.bg_color,
            width=request.width,
            height=request.height,
            quality=quality,
            config=request.config,
        )
        
        if success:
            return RenderResponse(
                success=True,
                message="PNG saved successfully",
                data={"output_path": saved_path}
            )
        else:
            return RenderResponse(
                success=False,
                message="PNG save failed",
                error=error
            )
    except Exception as e:
        logger.error(f"PNG save error: {e}")
        raise HTTPException(status_code=500, detail=f"PNG save failed: {e}")

@app.post("/save/pdf", response_model=RenderResponse)
async def save_pdf(
    request: RenderRequest,
    output_path: str,
    pdf_options: Optional[Dict[str, Any]] = None
):
    """Render and save a Mermaid diagram as PDF file."""
    try:
        success, saved_path, error = mermaid_service.save_pdf(
            diagram=request.diagram,
            output_path=output_path,
            theme=request.theme,
            bg_color=request.bg_color,
            width=request.width,
            height=request.height,
            config=request.config,
            pdf_options=pdf_options,
        )
        
        if success:
            return RenderResponse(
                success=True,
                message="PDF saved successfully",
                data={"output_path": saved_path}
            )
        else:
            return RenderResponse(
                success=False,
                message="PDF save failed",
                error=error
            )
    except Exception as e:
        logger.error(f"PDF save error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF save failed: {e}")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "Reynard Mermaid Rendering Service",
        "version": "1.0.0",
        "status": "running",
        "available": mermaid_service.available,
        "endpoints": {
            "health": "/health",
            "info": "/info",
            "themes": "/themes",
            "render_svg": "/render/svg",
            "render_png": "/render/png",
            "render_pdf": "/render/pdf",
            "validate": "/validate",
            "stats": "/stats",
            "save_svg": "/save/svg",
            "save_png": "/save/png",
            "save_pdf": "/save/pdf",
        }
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found", "path": str(request.url)}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )
