"""
FastAPI endpoints for performance monitoring and analysis.

This module provides REST API endpoints for:
- Real-time performance metrics
- Bottleneck analysis
- Performance optimization recommendations
- Historical performance data
- System health monitoring
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from fastapi.responses import JSONResponse
import json

from .middleware import performance_tracker, memory_profiler
from .analyzer import PerformanceAnalyzer

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/performance", tags=["performance"])

# Initialize analyzer
analyzer = PerformanceAnalyzer(performance_tracker, memory_profiler)


@router.get("/metrics")
async def get_performance_metrics():
    """Get current performance metrics summary."""
    try:
        summary = performance_tracker.get_performance_summary()
        return JSONResponse(content=summary)
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/memory")
async def get_memory_metrics():
    """Get current memory usage metrics."""
    try:
        memory_summary = memory_profiler.get_memory_summary()
        return JSONResponse(content=memory_summary)
    except Exception as e:
        logger.error(f"Error getting memory metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bottlenecks")
async def get_bottlenecks():
    """Get current performance bottlenecks analysis."""
    try:
        bottlenecks = analyzer.analyze_bottlenecks()
        
        # Convert to serializable format
        bottlenecks_data = []
        for bottleneck in bottlenecks:
            bottlenecks_data.append({
                "type": bottleneck.bottleneck_type,
                "severity": bottleneck.severity,
                "description": bottleneck.description,
                "impact": bottleneck.impact,
                "recommendations": bottleneck.recommendations,
                "affected_endpoints": bottleneck.affected_endpoints,
                "metrics": bottleneck.metrics
            })
        
        return JSONResponse(content={
            "bottlenecks": bottlenecks_data,
            "total_count": len(bottlenecks),
            "critical_count": len([b for b in bottlenecks if b.severity == 'critical']),
            "high_count": len([b for b in bottlenecks if b.severity == 'high']),
            "medium_count": len([b for b in bottlenecks if b.severity == 'medium']),
            "low_count": len([b for b in bottlenecks if b.severity == 'low']),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error analyzing bottlenecks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trends")
async def get_performance_trends(
    hours: int = Query(24, description="Time period in hours for trend analysis")
):
    """Get performance trends analysis."""
    try:
        trends = analyzer.analyze_performance_trends(hours)
        
        trends_data = []
        for trend in trends:
            trends_data.append({
                "metric": trend.metric_name,
                "trend": trend.trend_direction,
                "change_percent": trend.change_percentage,
                "confidence": trend.confidence,
                "time_period": trend.time_period
            })
        
        return JSONResponse(content={
            "trends": trends_data,
            "analysis_period_hours": hours,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error analyzing trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report")
async def get_optimization_report():
    """Get comprehensive optimization report."""
    try:
        report = analyzer.generate_optimization_report()
        return JSONResponse(content=report)
    except Exception as e:
        logger.error(f"Error generating optimization report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/endpoints")
async def get_endpoint_performance():
    """Get performance metrics for all endpoints."""
    try:
        endpoint_stats = dict(performance_tracker.endpoint_stats)
        
        # Convert deque objects to lists for JSON serialization
        for endpoint, stats in endpoint_stats.items():
            if 'memory_usage' in stats:
                stats['memory_usage'] = list(stats['memory_usage'])
            if 'db_queries' in stats:
                stats['db_queries'] = list(stats['db_queries'])
            if 'async_tasks' in stats:
                stats['async_tasks'] = list(stats['async_tasks'])
        
        return JSONResponse(content={
            "endpoints": endpoint_stats,
            "total_endpoints": len(endpoint_stats),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting endpoint performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/endpoints/{endpoint:path}")
async def get_endpoint_details(endpoint: str):
    """Get detailed performance metrics for a specific endpoint."""
    try:
        # Find endpoint in stats
        endpoint_key = None
        for key in performance_tracker.endpoint_stats.keys():
            if endpoint in key:
                endpoint_key = key
                break
        
        if not endpoint_key:
            raise HTTPException(status_code=404, detail=f"Endpoint '{endpoint}' not found")
        
        stats = performance_tracker.endpoint_stats[endpoint_key]
        
        # Get recent metrics for this endpoint
        recent_metrics = [
            m for m in performance_tracker.metrics_history
            if f"{m.method} {m.endpoint}" == endpoint_key
        ][-50:]  # Last 50 requests
        
        # Calculate additional statistics
        if recent_metrics:
            response_times = [m.duration for m in recent_metrics]
            memory_usage = [m.memory_peak for m in recent_metrics]
            
            import statistics
            stats_details = {
                "endpoint": endpoint_key,
                "recent_requests": len(recent_metrics),
                "response_time_stats": {
                    "avg_ms": round(statistics.mean(response_times) * 1000, 2),
                    "median_ms": round(statistics.median(response_times) * 1000, 2),
                    "min_ms": round(min(response_times) * 1000, 2),
                    "max_ms": round(max(response_times) * 1000, 2),
                    "std_dev_ms": round(statistics.stdev(response_times) * 1000, 2) if len(response_times) > 1 else 0
                },
                "memory_stats": {
                    "avg_mb": round(statistics.mean(memory_usage) / 1024 / 1024, 2),
                    "max_mb": round(max(memory_usage) / 1024 / 1024, 2),
                    "min_mb": round(min(memory_usage) / 1024 / 1024, 2)
                },
                "error_analysis": {
                    "total_errors": sum(1 for m in recent_metrics if m.status_code >= 400),
                    "error_rate_percent": round((sum(1 for m in recent_metrics if m.status_code >= 400) / len(recent_metrics)) * 100, 2),
                    "status_codes": {}
                }
            }
            
            # Count status codes
            for metric in recent_metrics:
                status_code = metric.status_code
                stats_details["error_analysis"]["status_codes"][status_code] = \
                    stats_details["error_analysis"]["status_codes"].get(status_code, 0) + 1
        else:
            stats_details = {
                "endpoint": endpoint_key,
                "recent_requests": 0,
                "message": "No recent requests found"
            }
        
        # Combine with existing stats
        result = {
            **stats,
            **stats_details,
            "timestamp": datetime.now().isoformat()
        }
        
        return JSONResponse(content=result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting endpoint details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def get_performance_health():
    """Get overall performance health status."""
    try:
        # Get current metrics
        performance_summary = performance_tracker.get_performance_summary()
        memory_summary = memory_profiler.get_memory_summary()
        bottlenecks = analyzer.analyze_bottlenecks()
        
        # Calculate health score
        critical_bottlenecks = len([b for b in bottlenecks if b.severity == 'critical'])
        high_bottlenecks = len([b for b in bottlenecks if b.severity == 'high'])
        
        # Determine health status
        if critical_bottlenecks > 0:
            health_status = "critical"
            health_score = 0
        elif high_bottlenecks > 2:
            health_status = "poor"
            health_score = 25
        elif high_bottlenecks > 0:
            health_status = "fair"
            health_score = 50
        elif len(bottlenecks) > 5:
            health_status = "good"
            health_score = 75
        else:
            health_status = "excellent"
            health_score = 100
        
        # Get key metrics
        avg_response_time = performance_summary.get('summary', {}).get('avg_duration_ms', 0)
        error_rate = performance_summary.get('summary', {}).get('error_rate_percent', 0)
        memory_usage = memory_summary.get('current_memory_mb', 0)
        
        return JSONResponse(content={
            "health_status": health_status,
            "health_score": health_score,
            "critical_issues": critical_bottlenecks,
            "high_priority_issues": high_bottlenecks,
            "total_issues": len(bottlenecks),
            "key_metrics": {
                "avg_response_time_ms": avg_response_time,
                "error_rate_percent": error_rate,
                "memory_usage_mb": memory_usage
            },
            "recommendations": [
                "Monitor critical bottlenecks closely",
                "Address high-priority performance issues",
                "Review error rates and response times",
                "Check memory usage patterns"
            ] if critical_bottlenecks > 0 or high_bottlenecks > 0 else [
                "Performance is within acceptable ranges",
                "Continue monitoring for trends",
                "Consider proactive optimization"
            ],
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting performance health: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/start-monitoring")
async def start_monitoring(background_tasks: BackgroundTasks):
    """Start performance monitoring."""
    try:
        if not memory_profiler._running:
            memory_profiler.start()
            return JSONResponse(content={
                "message": "Performance monitoring started",
                "status": "active",
                "timestamp": datetime.now().isoformat()
            })
        else:
            return JSONResponse(content={
                "message": "Performance monitoring already active",
                "status": "active",
                "timestamp": datetime.now().isoformat()
            })
    except Exception as e:
        logger.error(f"Error starting monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop-monitoring")
async def stop_monitoring():
    """Stop performance monitoring."""
    try:
        if memory_profiler._running:
            memory_profiler.stop()
            return JSONResponse(content={
                "message": "Performance monitoring stopped",
                "status": "inactive",
                "timestamp": datetime.now().isoformat()
            })
        else:
            return JSONResponse(content={
                "message": "Performance monitoring already inactive",
                "status": "inactive",
                "timestamp": datetime.now().isoformat()
            })
    except Exception as e:
        logger.error(f"Error stopping monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_monitoring_status():
    """Get current monitoring status."""
    try:
        return JSONResponse(content={
            "performance_tracker": {
                "active_requests": len(performance_tracker._active_requests),
                "total_requests_tracked": len(performance_tracker.metrics_history),
                "endpoints_monitored": len(performance_tracker.endpoint_stats)
            },
            "memory_profiler": {
                "running": memory_profiler._running,
                "snapshots_count": len(memory_profiler.memory_snapshots)
            },
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting monitoring status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/clear-data")
async def clear_performance_data():
    """Clear all performance data (use with caution)."""
    try:
        # Clear performance tracker data
        performance_tracker.metrics_history.clear()
        performance_tracker.db_queries.clear()
        performance_tracker.async_tasks.clear()
        performance_tracker.endpoint_stats.clear()
        performance_tracker._active_requests.clear()
        
        # Clear memory profiler data
        memory_profiler.memory_snapshots.clear()
        
        return JSONResponse(content={
            "message": "All performance data cleared",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error clearing performance data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
