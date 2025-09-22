"""
Legacy Tracking API Endpoints

FastAPI endpoints for Success-Advisor-8 legacy tracking and analysis,
extending the existing ECS endpoints with comprehensive legacy management.
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.ecs.postgres_service import PostgresECSWorldService, get_postgres_ecs_service
from app.ecs.services.unified_agent_manager import UnifiedAgentStateManager
from app.ecs.services.legacy_tracking_service import LegacyTrackingService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/legacy", tags=["Legacy Tracking"])


# Pydantic models for API
class AgentStateResponse(BaseModel):
    """Response model for agent state information."""
    agent_id: str
    name: str
    spirit: str
    style: str
    generation: int
    traits: Dict[str, float]
    memories: List[Dict]
    relationships: Dict[str, Dict]
    last_activity: str
    ecs_entity_id: Optional[str] = None
    specializations: List[str] = []
    achievements: List[Dict] = []


class ActivityTrackingRequest(BaseModel):
    """Request model for tracking agent activities."""
    agent_id: str
    activity: str
    context: Dict[str, Any] = {}


class LegacyReportResponse(BaseModel):
    """Response model for legacy tracking reports."""
    total_activities: int
    total_code_movements: int
    changelog_activities: List[Dict]
    codebase_movements: List[Dict]
    ecs_agent_data: Optional[Dict]
    activity_analysis: Dict[str, Any]
    summary: str
    last_updated: str
    codebase_path: str
    parser_info: Dict[str, Any]


class ActivityTrendsResponse(BaseModel):
    """Response model for activity trends analysis."""
    activity_types: Dict[str, int]
    versions: Dict[str, int]
    time_range: Dict[str, Any]
    total_activities: int


# Dependency injection
async def get_unified_agent_manager(
    ecs_service: PostgresECSWorldService = Depends(get_postgres_ecs_service)
) -> UnifiedAgentStateManager:
    """Get unified agent state manager instance."""
    return UnifiedAgentStateManager(ecs_service)


async def get_legacy_tracking_service(
    ecs_service: PostgresECSWorldService = Depends(get_postgres_ecs_service)
) -> LegacyTrackingService:
    """Get legacy tracking service instance."""
    # Use the backend directory as the codebase path
    import os
    backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    return LegacyTrackingService(ecs_service, backend_path)


# API Endpoints

@router.get("/agent/{agent_id}/state", response_model=AgentStateResponse)
async def get_agent_state(
    agent_id: str,
    agent_manager: UnifiedAgentStateManager = Depends(get_unified_agent_manager)
) -> AgentStateResponse:
    """
    Get complete agent state from unified ECS system.
    
    Args:
        agent_id: Unique identifier for the agent
        agent_manager: Unified agent state manager
        
    Returns:
        Complete agent state information
    """
    try:
        logger.info(f"Getting agent state for {agent_id}")
        
        state = await agent_manager.get_agent_state(agent_id)
        if not state:
            raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
        
        return AgentStateResponse(**state.to_dict())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent state for {agent_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agent state") from e


@router.post("/agent/activity/track")
async def track_agent_activity(
    request: ActivityTrackingRequest,
    agent_manager: UnifiedAgentStateManager = Depends(get_unified_agent_manager)
) -> Dict[str, str]:
    """
    Track agent activity for legacy analysis.
    
    Args:
        request: Activity tracking request
        agent_manager: Unified agent state manager
        
    Returns:
        Success confirmation
    """
    try:
        logger.info(f"Tracking activity for agent {request.agent_id}: {request.activity}")
        
        await agent_manager.track_agent_activity(
            request.agent_id,
            request.activity,
            request.context
        )
        
        return {"status": "success", "message": "Activity tracked successfully"}
        
    except Exception as e:
        logger.error(f"Error tracking activity for agent {request.agent_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to track activity") from e


@router.get("/success-advisor-8/activities", response_model=List[Dict])
async def get_success_advisor_8_activities(
    legacy_service: LegacyTrackingService = Depends(get_legacy_tracking_service)
) -> List[Dict]:
    """
    Get all Success-Advisor-8 activities from CHANGELOG.
    
    Args:
        legacy_service: Legacy tracking service
        
    Returns:
        List of Success-Advisor-8 activities
    """
    try:
        logger.info("Getting Success-Advisor-8 activities")
        
        activities = await legacy_service.get_success_advisor_8_activities()
        return activities
        
    except Exception as e:
        logger.error(f"Error getting Success-Advisor-8 activities: {e}")
        raise HTTPException(status_code=500, detail="Failed to get activities") from e


@router.get("/success-advisor-8/movements", response_model=List[Dict])
async def get_success_advisor_8_movements(
    legacy_service: LegacyTrackingService = Depends(get_legacy_tracking_service)
) -> List[Dict]:
    """
    Get Success-Advisor-8 code movements across the codebase.
    
    Args:
        legacy_service: Legacy tracking service
        
    Returns:
        List of code movements
    """
    try:
        logger.info("Getting Success-Advisor-8 code movements")
        
        movements = await legacy_service.get_codebase_movements()
        return movements
        
    except Exception as e:
        logger.error(f"Error getting Success-Advisor-8 movements: {e}")
        raise HTTPException(status_code=500, detail="Failed to get movements") from e


@router.get("/success-advisor-8/report", response_model=LegacyReportResponse)
async def get_success_advisor_8_legacy_report(
    legacy_service: LegacyTrackingService = Depends(get_legacy_tracking_service)
) -> LegacyReportResponse:
    """
    Generate comprehensive Success-Advisor-8 legacy report.
    
    Args:
        legacy_service: Legacy tracking service
        
    Returns:
        Complete legacy tracking report
    """
    try:
        logger.info("Generating Success-Advisor-8 legacy report")
        
        report = await legacy_service.generate_legacy_report()
        
        if 'error' in report:
            raise HTTPException(status_code=500, detail=report['error'])
        
        return LegacyReportResponse(**report)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating legacy report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate legacy report") from e


@router.get("/success-advisor-8/trends", response_model=ActivityTrendsResponse)
async def get_success_advisor_8_activity_trends(
    legacy_service: LegacyTrackingService = Depends(get_legacy_tracking_service)
) -> ActivityTrendsResponse:
    """
    Get Success-Advisor-8 activity trends analysis.
    
    Args:
        legacy_service: Legacy tracking service
        
    Returns:
        Activity trends and statistics
    """
    try:
        logger.info("Getting Success-Advisor-8 activity trends")
        
        trends = await legacy_service.get_activity_trends()
        
        if 'error' in trends:
            raise HTTPException(status_code=500, detail=trends['error'])
        
        return ActivityTrendsResponse(**trends)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting activity trends: {e}")
        raise HTTPException(status_code=500, detail="Failed to get activity trends") from e


@router.get("/success-advisor-8/summary")
async def get_success_advisor_8_activity_summary(
    legacy_service: LegacyTrackingService = Depends(get_legacy_tracking_service)
) -> Dict[str, str]:
    """
    Get human-readable Success-Advisor-8 activity summary.
    
    Args:
        legacy_service: Legacy tracking service
        
    Returns:
        Formatted activity summary
    """
    try:
        logger.info("Getting Success-Advisor-8 activity summary")
        
        summary = await legacy_service.get_activity_summary()
        return {"summary": summary}
        
    except Exception as e:
        logger.error(f"Error getting activity summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get activity summary") from e


@router.post("/success-advisor-8/activity/track")
async def track_success_advisor_8_activity(
    activity: str = Query(..., description="Activity description"),
    context: str = Query("{}", description="Activity context as JSON string"),
    legacy_service: LegacyTrackingService = Depends(get_legacy_tracking_service)
) -> Dict[str, str]:
    """
    Track a new Success-Advisor-8 activity.
    
    Args:
        activity: Description of the activity
        context: Activity context as JSON string
        legacy_service: Legacy tracking service
        
    Returns:
        Success confirmation
    """
    try:
        logger.info(f"Tracking Success-Advisor-8 activity: {activity}")
        
        # Parse context JSON
        try:
            context_dict = json.loads(context) if context else {}
        except json.JSONDecodeError:
            context_dict = {"raw_context": context}
        
        success = await legacy_service.track_success_advisor_8_activity(activity, context_dict)
        
        if success:
            return {"status": "success", "message": "Success-Advisor-8 activity tracked successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to track activity")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking Success-Advisor-8 activity: {e}")
        raise HTTPException(status_code=500, detail="Failed to track activity") from e


@router.post("/success-advisor-8/export")
async def export_success_advisor_8_legacy_data(
    output_path: str = Query(..., description="Output file path"),
    legacy_service: LegacyTrackingService = Depends(get_legacy_tracking_service)
) -> Dict[str, str]:
    """
    Export Success-Advisor-8 legacy data to JSON file.
    
    Args:
        output_path: Path to output JSON file
        legacy_service: Legacy tracking service
        
    Returns:
        Export confirmation
    """
    try:
        logger.info(f"Exporting Success-Advisor-8 legacy data to {output_path}")
        
        success = await legacy_service.export_legacy_data(output_path)
        
        if success:
            return {"status": "success", "message": f"Legacy data exported to {output_path}"}
        else:
            raise HTTPException(status_code=500, detail="Failed to export legacy data")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting legacy data: {e}")
        raise HTTPException(status_code=500, detail="Failed to export legacy data") from e


@router.get("/parser/status")
async def get_parser_status(
    legacy_service: LegacyTrackingService = Depends(get_legacy_tracking_service)
) -> Dict[str, Any]:
    """
    Get parser status and information.
    
    Args:
        legacy_service: Legacy tracking service
        
    Returns:
        Parser status information
    """
    try:
        logger.info("Getting parser status")
        
        status = await legacy_service.get_parser_status()
        return status
        
    except Exception as e:
        logger.error(f"Error getting parser status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get parser status") from e


@router.post("/data/refresh")
async def refresh_legacy_data(
    legacy_service: LegacyTrackingService = Depends(get_legacy_tracking_service)
) -> Dict[str, str]:
    """
    Refresh all legacy tracking data.
    
    Args:
        legacy_service: Legacy tracking service
        
    Returns:
        Refresh confirmation
    """
    try:
        logger.info("Refreshing legacy tracking data")
        
        success = await legacy_service.refresh_data()
        
        if success:
            return {"status": "success", "message": "Legacy tracking data refreshed successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to refresh data")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing legacy data: {e}")
        raise HTTPException(status_code=500, detail="Failed to refresh data") from e


@router.get("/releases")
async def get_success_advisor_8_releases(
    ecs_service: PostgresECSWorldService = Depends(get_postgres_ecs_service)
) -> List[Dict[str, Any]]:
    """
    Get all Success-Advisor-8 related releases from git tags.
    
    Returns:
        List of release information including version, date, activities, and changelog entries
    """
    try:
        legacy_service = LegacyTrackingService(ecs_service)
        releases = await legacy_service.get_success_advisor_8_releases()
        await legacy_service.close()
        
        return releases
        
    except Exception as e:
        logger.error(f"Error getting Success-Advisor-8 releases: {e}")
        raise HTTPException(status_code=500, detail="Failed to get releases") from e


@router.get("/releases/statistics")
async def get_release_statistics(
    ecs_service: PostgresECSWorldService = Depends(get_postgres_ecs_service)
) -> Dict[str, Any]:
    """
    Get statistics about Success-Advisor-8 releases.
    
    Returns:
        Dictionary with release statistics including total releases, types, and date ranges
    """
    try:
        legacy_service = LegacyTrackingService(ecs_service)
        stats = await legacy_service.get_release_statistics()
        await legacy_service.close()
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting release statistics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get release statistics") from e


@router.get("/git-tags")
async def get_all_git_tags(
    ecs_service: PostgresECSWorldService = Depends(get_postgres_ecs_service)
) -> List[Dict[str, Any]]:
    """
    Get all git tags with metadata.
    
    Returns:
        List of git tag information including name, commit hash, date, and author
    """
    try:
        legacy_service = LegacyTrackingService(ecs_service)
        tags = await legacy_service.get_all_git_tags()
        await legacy_service.close()
        
        return tags
        
    except Exception as e:
        logger.error(f"Error getting git tags: {e}")
        raise HTTPException(status_code=500, detail="Failed to get git tags") from e
