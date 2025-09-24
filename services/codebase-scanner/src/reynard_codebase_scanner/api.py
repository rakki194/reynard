"""
FastAPI Application for Codebase Scanner Service

Provides REST API endpoints for comprehensive codebase analysis,
real-time monitoring, and export functionality.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from .service import CodebaseScannerService

logger = logging.getLogger(__name__)

# Initialize the service
scanner_service = CodebaseScannerService(".")

# Create FastAPI app
app = FastAPI(
    title="Reynard Codebase Scanner Service",
    description="Comprehensive codebase analysis and monitoring service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Request/Response Models
class AnalysisRequest(BaseModel):
    """Request model for codebase analysis."""
    include_patterns: Optional[List[str]] = Field(None, description="Glob patterns to include")
    exclude_patterns: Optional[List[str]] = Field(None, description="Glob patterns to exclude")
    max_depth: Optional[int] = Field(None, description="Maximum directory depth")
    include_complexity: bool = Field(True, description="Include complexity analysis")
    include_security: bool = Field(True, description="Include security scanning")
    include_performance: bool = Field(True, description="Include performance analysis")
    include_dependencies: bool = Field(True, description="Include dependency analysis")

class MonitoringRequest(BaseModel):
    """Request model for monitoring configuration."""
    include_patterns: Optional[List[str]] = Field(None, description="Glob patterns to include")
    exclude_patterns: Optional[List[str]] = Field(None, description="Glob patterns to exclude")

class ExportRequest(BaseModel):
    """Request model for analysis export."""
    output_path: str = Field("analysis_export", description="Output file path (without extension)")
    format: str = Field("json", description="Export format (json, csv, yaml, html, xml)")

class BaseResponse(BaseModel):
    """Base response model."""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Health and Info Endpoints
@app.get("/health")
async def health_check():
    """Perform a health check."""
    try:
        health_data = scanner_service.health_check()
        return health_data
    except Exception as e:
        logger.error(f"Health check error: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {e}")

@app.get("/info")
async def get_service_info():
    """Get service information and capabilities."""
    try:
        return scanner_service.get_service_info()
    except Exception as e:
        logger.error(f"Service info error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get service info: {e}")

# Analysis Endpoints
@app.post("/analyze", response_model=BaseResponse)
async def analyze_codebase(request: AnalysisRequest):
    """Perform comprehensive codebase analysis."""
    try:
        analysis_results = scanner_service.analyze_codebase(
            include_patterns=request.include_patterns,
            exclude_patterns=request.exclude_patterns,
            max_depth=request.max_depth,
            include_complexity=request.include_complexity,
            include_security=request.include_security,
            include_performance=request.include_performance,
            include_dependencies=request.include_dependencies,
        )
        
        if 'error' in analysis_results:
            return BaseResponse(
                success=False,
                message="Analysis failed",
                error=analysis_results['error']
            )
        
        return BaseResponse(
            success=True,
            message="Analysis completed successfully",
            data=analysis_results
        )
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

@app.get("/analyze/summary")
async def get_analysis_summary():
    """Get summary of the last analysis."""
    try:
        summary = scanner_service.get_analysis_summary()
        return summary
    except Exception as e:
        logger.error(f"Summary error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get analysis summary: {e}")

# Monitoring Endpoints
@app.post("/monitoring/start", response_model=BaseResponse)
async def start_monitoring(request: MonitoringRequest):
    """Start real-time codebase monitoring."""
    try:
        success = scanner_service.start_monitoring(
            include_patterns=request.include_patterns,
            exclude_patterns=request.exclude_patterns
        )
        
        if success:
            return BaseResponse(
                success=True,
                message="Real-time monitoring started successfully"
            )
        else:
            return BaseResponse(
                success=False,
                message="Failed to start monitoring",
                error="Check service logs for details"
            )
    except Exception as e:
        logger.error(f"Monitoring start error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start monitoring: {e}")

@app.post("/monitoring/stop", response_model=BaseResponse)
async def stop_monitoring():
    """Stop real-time codebase monitoring."""
    try:
        scanner_service.stop_monitoring()
        return BaseResponse(
            success=True,
            message="Real-time monitoring stopped successfully"
        )
    except Exception as e:
        logger.error(f"Monitoring stop error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop monitoring: {e}")

@app.get("/monitoring/status")
async def get_monitoring_status():
    """Get current monitoring status."""
    try:
        return scanner_service.get_monitoring_status()
    except Exception as e:
        logger.error(f"Monitoring status error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get monitoring status: {e}")

@app.get("/monitoring/history")
async def get_change_history(
    limit: Optional[int] = Query(None, description="Maximum number of changes to return"),
    since: Optional[str] = Query(None, description="ISO timestamp to filter changes since")
):
    """Get file change history."""
    try:
        history = scanner_service.get_change_history(limit, since)
        return {
            "changes": history,
            "count": len(history)
        }
    except Exception as e:
        logger.error(f"Change history error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get change history: {e}")

# Export Endpoints
@app.post("/export", response_model=BaseResponse)
async def export_analysis(request: ExportRequest):
    """Export analysis results to various formats."""
    try:
        export_results = scanner_service.export_analysis(
            output_path=request.output_path,
            format=request.format
        )
        
        if 'error' in export_results:
            return BaseResponse(
                success=False,
                message="Export failed",
                error=export_results['error']
            )
        
        return BaseResponse(
            success=True,
            message="Export completed successfully",
            data=export_results
        )
    except Exception as e:
        logger.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {e}")

@app.get("/export/download/{filename}")
async def download_export(filename: str):
    """Download exported analysis file."""
    try:
        file_path = f"{filename}"
        if not Path(file_path).exists():
            raise HTTPException(status_code=404, detail="Export file not found")
        
        return FileResponse(
            file_path,
            filename=filename,
            media_type='application/octet-stream'
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download error: {e}")
        raise HTTPException(status_code=500, detail=f"Download failed: {e}")

# Cache Management Endpoints
@app.get("/cache/list")
async def list_cached_analyses():
    """List all cached analysis keys."""
    try:
        cache_keys = scanner_service.list_cached_analyses()
        return {
            "cached_analyses": cache_keys,
            "count": len(cache_keys)
        }
    except Exception as e:
        logger.error(f"Cache list error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list cached analyses: {e}")

@app.get("/cache/get/{cache_key}")
async def get_cached_analysis(cache_key: str):
    """Get cached analysis by key."""
    try:
        cached_data = scanner_service.get_cached_analysis(cache_key)
        if cached_data is None:
            raise HTTPException(status_code=404, detail="Cached analysis not found")
        
        return cached_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cache get error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get cached analysis: {e}")

@app.post("/cache/clear", response_model=BaseResponse)
async def clear_cache():
    """Clear analysis cache."""
    try:
        scanner_service.clear_cache()
        return BaseResponse(
            success=True,
            message="Analysis cache cleared successfully"
        )
    except Exception as e:
        logger.error(f"Cache clear error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {e}")

# Specific Analysis Endpoints
@app.get("/analysis/complexity")
async def get_complexity_analysis():
    """Get code complexity analysis from last analysis."""
    try:
        if not scanner_service.last_analysis:
            raise HTTPException(status_code=404, detail="No analysis data available")
        
        complexity_data = scanner_service.last_analysis.get('complexity_analysis', {})
        if not complexity_data:
            raise HTTPException(status_code=404, detail="No complexity analysis data available")
        
        return complexity_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Complexity analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get complexity analysis: {e}")

@app.get("/analysis/security")
async def get_security_analysis():
    """Get security analysis from last analysis."""
    try:
        if not scanner_service.last_analysis:
            raise HTTPException(status_code=404, detail="No analysis data available")
        
        security_data = scanner_service.last_analysis.get('security_scan', {})
        if not security_data:
            raise HTTPException(status_code=404, detail="No security analysis data available")
        
        return security_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Security analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get security analysis: {e}")

@app.get("/analysis/performance")
async def get_performance_analysis():
    """Get performance analysis from last analysis."""
    try:
        if not scanner_service.last_analysis:
            raise HTTPException(status_code=404, detail="No analysis data available")
        
        performance_data = scanner_service.last_analysis.get('performance_analysis', {})
        if not performance_data:
            raise HTTPException(status_code=404, detail="No performance analysis data available")
        
        return performance_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Performance analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get performance analysis: {e}")

@app.get("/analysis/dependencies")
async def get_dependency_analysis():
    """Get dependency analysis from last analysis."""
    try:
        if not scanner_service.last_analysis:
            raise HTTPException(status_code=404, detail="No analysis data available")
        
        dependency_data = scanner_service.last_analysis.get('dependency_graph', {})
        if not dependency_data:
            raise HTTPException(status_code=404, detail="No dependency analysis data available")
        
        return dependency_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dependency analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get dependency analysis: {e}")

@app.get("/analysis/insights")
async def get_insights():
    """Get insights and recommendations from last analysis."""
    try:
        if not scanner_service.last_analysis:
            raise HTTPException(status_code=404, detail="No analysis data available")
        
        insights_data = scanner_service.last_analysis.get('insights', {})
        if not insights_data:
            raise HTTPException(status_code=404, detail="No insights data available")
        
        return insights_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Insights error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get insights: {e}")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "Reynard Codebase Scanner Service",
        "version": "1.0.0",
        "status": "running",
        "available": scanner_service.is_available,
        "endpoints": {
            "health": "/health",
            "info": "/info",
            "analyze": "/analyze",
            "analyze_summary": "/analyze/summary",
            "monitoring_start": "/monitoring/start",
            "monitoring_stop": "/monitoring/stop",
            "monitoring_status": "/monitoring/status",
            "monitoring_history": "/monitoring/history",
            "export": "/export",
            "export_download": "/export/download/{filename}",
            "cache_list": "/cache/list",
            "cache_get": "/cache/get/{cache_key}",
            "cache_clear": "/cache/clear",
            "complexity": "/analysis/complexity",
            "security": "/analysis/security",
            "performance": "/analysis/performance",
            "dependencies": "/analysis/dependencies",
            "insights": "/analysis/insights",
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
