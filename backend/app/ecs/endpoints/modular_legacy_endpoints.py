"""
Modular Legacy Tracking API Endpoints

Provides organized API endpoints for different tracking systems:
1. Success-Advisor-8 genome information collection
2. PHEONIX project activity tracking
3. General legacy tracking (existing functionality)

This module provides clean separation of concerns and modular access to different tracking systems.
"""

import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query

from app.ecs.postgres_service import PostgresECSWorldService, get_postgres_ecs_service
from app.ecs.services.modular_legacy_service import ModularLegacyTrackingService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/modular-legacy", tags=["Modular Legacy Tracking"])


# Dependency injection
async def get_modular_legacy_service(
    ecs_service: PostgresECSWorldService = Depends(get_postgres_ecs_service)
) -> ModularLegacyTrackingService:
    """Get modular legacy tracking service instance."""
    import os
    backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    return ModularLegacyTrackingService(ecs_service, backend_path)


# ============================================================================
# SUCCESS-ADVISOR-8 GENOME INFORMATION COLLECTION ENDPOINTS
# ============================================================================

@router.get("/genome/activities", response_model=List[Dict])
async def get_success_advisor_8_genome_activities(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> List[Dict]:
    """
    Get Success-Advisor-8 genome-relevant activities.
    
    Focuses specifically on activities that contribute to understanding
    Success-Advisor-8's behavioral patterns, capabilities, and traits.
    Excludes broader project activities (PHEONIX, etc.).
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        List of genome-relevant activities
    """
    try:
        logger.info("Getting Success-Advisor-8 genome activities")
        activities = await legacy_service.get_genome_activities()
        return activities
        
    except Exception as e:
        logger.error(f"Error getting genome activities: {e}")
        raise HTTPException(status_code=500, detail="Failed to get genome activities") from e


@router.get("/genome/summary")
async def get_success_advisor_8_genome_summary(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> Dict[str, Any]:
    """
    Get comprehensive Success-Advisor-8 genome summary.
    
    Provides detailed analysis of Success-Advisor-8's behavioral patterns,
    capabilities, traits, and genomic information for spirit inhabitation.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        Complete genome analysis
    """
    try:
        logger.info("Getting Success-Advisor-8 genome summary")
        summary = await legacy_service.get_genome_summary()
        return summary
        
    except Exception as e:
        logger.error(f"Error getting genome summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get genome summary") from e


@router.get("/genome/behavioral-patterns", response_model=List[Dict])
async def get_success_advisor_8_behavioral_patterns(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> List[Dict]:
    """
    Get Success-Advisor-8 behavioral patterns.
    
    Returns identified behavioral patterns based on activity analysis,
    including workflow patterns, communication styles, and problem-solving approaches.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        List of behavioral patterns
    """
    try:
        logger.info("Getting Success-Advisor-8 behavioral patterns")
        patterns = await legacy_service.get_behavioral_patterns()
        return patterns
        
    except Exception as e:
        logger.error(f"Error getting behavioral patterns: {e}")
        raise HTTPException(status_code=500, detail="Failed to get behavioral patterns") from e


@router.get("/genome/capability-profiles", response_model=List[Dict])
async def get_success_advisor_8_capability_profiles(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> List[Dict]:
    """
    Get Success-Advisor-8 capability profiles.
    
    Returns capability profiles based on activity analysis,
    including proficiency levels and supporting evidence.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        List of capability profiles
    """
    try:
        logger.info("Getting Success-Advisor-8 capability profiles")
        profiles = await legacy_service.get_capability_profiles()
        return profiles
        
    except Exception as e:
        logger.error(f"Error getting capability profiles: {e}")
        raise HTTPException(status_code=500, detail="Failed to get capability profiles") from e


# ============================================================================
# PHEONIX PROJECT ACTIVITY TRACKING ENDPOINTS
# ============================================================================

@router.get("/phoenix/activities", response_model=List[Dict])
async def get_phoenix_project_activities(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> List[Dict]:
    """
    Get PHEONIX project activities.
    
    Returns activities related to PHEONIX framework, PHEONIX Control,
    and related research initiatives. Separate from Success-Advisor-8 genome tracking.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        List of PHEONIX project activities
    """
    try:
        logger.info("Getting PHEONIX project activities")
        activities = await legacy_service.get_phoenix_activities()
        return activities
        
    except Exception as e:
        logger.error(f"Error getting PHEONIX activities: {e}")
        raise HTTPException(status_code=500, detail="Failed to get PHEONIX activities") from e


@router.get("/phoenix/summary")
async def get_phoenix_project_summary(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> Dict[str, Any]:
    """
    Get comprehensive PHEONIX project summary.
    
    Provides detailed analysis of PHEONIX framework and control activities,
    research initiatives, experiments, and project progress.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        Complete PHEONIX project analysis
    """
    try:
        logger.info("Getting PHEONIX project summary")
        summary = await legacy_service.get_phoenix_summary()
        return summary
        
    except Exception as e:
        logger.error(f"Error getting PHEONIX summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get PHEONIX summary") from e


@router.get("/phoenix/research-initiatives", response_model=List[Dict])
async def get_phoenix_research_initiatives(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> List[Dict]:
    """
    Get PHEONIX research initiatives.
    
    Returns research initiatives and their current status,
    including evolutionary knowledge distillation, agent breeding, and statistical analysis.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        List of research initiatives
    """
    try:
        logger.info("Getting PHEONIX research initiatives")
        initiatives = await legacy_service.get_research_initiatives()
        return initiatives
        
    except Exception as e:
        logger.error(f"Error getting research initiatives: {e}")
        raise HTTPException(status_code=500, detail="Failed to get research initiatives") from e


# ============================================================================
# GENERAL LEGACY TRACKING ENDPOINTS (EXISTING FUNCTIONALITY)
# ============================================================================

@router.get("/legacy/activities", response_model=List[Dict])
async def get_general_legacy_activities(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> List[Dict]:
    """
    Get general Success-Advisor-8 legacy activities.
    
    Returns all Success-Advisor-8 activities from CHANGELOG (existing functionality).
    This includes activities that may not be genome-relevant.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        List of all Success-Advisor-8 activities
    """
    try:
        logger.info("Getting general legacy activities")
        activities = await legacy_service.get_legacy_activities()
        return activities
        
    except Exception as e:
        logger.error(f"Error getting legacy activities: {e}")
        raise HTTPException(status_code=500, detail="Failed to get legacy activities") from e


@router.get("/legacy/summary")
async def get_general_legacy_summary(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> Dict[str, str]:
    """
    Get general legacy activity summary.
    
    Returns human-readable summary of all Success-Advisor-8 activities (existing functionality).
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        Formatted legacy activity summary
    """
    try:
        logger.info("Getting general legacy summary")
        summary = await legacy_service.get_legacy_summary()
        return {"summary": summary}
        
    except Exception as e:
        logger.error(f"Error getting legacy summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get legacy summary") from e


@router.get("/legacy/movements", response_model=List[Dict])
async def get_legacy_codebase_movements(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> List[Dict]:
    """
    Get Success-Advisor-8 code movements across the codebase.
    
    Returns code movements and references to Success-Advisor-8 across the codebase.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        List of code movements
    """
    try:
        logger.info("Getting legacy codebase movements")
        movements = await legacy_service.get_codebase_movements()
        return movements
        
    except Exception as e:
        logger.error(f"Error getting codebase movements: {e}")
        raise HTTPException(status_code=500, detail="Failed to get codebase movements") from e


# ============================================================================
# COMPREHENSIVE ANALYSIS ENDPOINTS
# ============================================================================

@router.get("/comprehensive/analysis")
async def get_comprehensive_analysis(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> Dict[str, Any]:
    """
    Get comprehensive analysis combining all tracking systems.
    
    Provides complete analysis including:
    - Success-Advisor-8 genome information
    - PHEONIX project activities
    - General legacy tracking
    - Cross-system analysis and relationships
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        Complete comprehensive analysis
    """
    try:
        logger.info("Getting comprehensive analysis")
        analysis = await legacy_service.get_comprehensive_analysis()
        return analysis
        
    except Exception as e:
        logger.error(f"Error getting comprehensive analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to get comprehensive analysis") from e


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@router.get("/status")
async def get_tracker_status(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> Dict[str, Any]:
    """
    Get status of all tracking systems.
    
    Returns status information for genome tracker, PHEONIX tracker, and legacy tracker.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        Status information for all trackers
    """
    try:
        logger.info("Getting tracker status")
        status = await legacy_service.get_tracker_status()
        return status
        
    except Exception as e:
        logger.error(f"Error getting tracker status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get tracker status") from e


@router.post("/refresh")
async def refresh_all_tracking_data(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> Dict[str, str]:
    """
    Refresh all tracking data.
    
    Refreshes data from all tracking systems (genome, PHEONIX, legacy).
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        Refresh confirmation
    """
    try:
        logger.info("Refreshing all tracking data")
        success = await legacy_service.refresh_all_data()
        
        if success:
            return {"status": "success", "message": "All tracking data refreshed successfully"}
        else:
            return {"status": "error", "message": "Failed to refresh tracking data"}
            
    except Exception as e:
        logger.error(f"Error refreshing tracking data: {e}")
        raise HTTPException(status_code=500, detail="Failed to refresh tracking data") from e


# ============================================================================
# COMPARISON AND ANALYSIS ENDPOINTS
# ============================================================================

@router.get("/comparison/genome-vs-legacy")
async def compare_genome_vs_legacy(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> Dict[str, Any]:
    """
    Compare genome activities vs general legacy activities.
    
    Provides analysis of overlap and differences between genome-focused
    and general legacy tracking of Success-Advisor-8 activities.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        Comparison analysis
    """
    try:
        logger.info("Comparing genome vs legacy activities")
        
        # Get data from both systems
        genome_activities = await legacy_service.get_genome_activities()
        legacy_activities = await legacy_service.get_legacy_activities()
        
        # Perform comparison
        comparison = {
            "genome_activity_count": len(genome_activities),
            "legacy_activity_count": len(legacy_activities),
            "overlap_analysis": {
                "genome_focus_ratio": len(genome_activities) / len(legacy_activities) if legacy_activities else 0,
                "unique_genome_activities": len(genome_activities),
                "unique_legacy_activities": len(legacy_activities) - len(genome_activities)
            },
            "genome_activities": genome_activities,
            "legacy_activities": legacy_activities
        }
        
        return comparison
        
    except Exception as e:
        logger.error(f"Error comparing genome vs legacy: {e}")
        raise HTTPException(status_code=500, detail="Failed to compare genome vs legacy") from e


@router.get("/comparison/phoenix-vs-genome")
async def compare_phoenix_vs_genome(
    legacy_service: ModularLegacyTrackingService = Depends(get_modular_legacy_service)
) -> Dict[str, Any]:
    """
    Compare PHEONIX project activities vs Success-Advisor-8 genome activities.
    
    Provides analysis of the relationship between PHEONIX project work
    and Success-Advisor-8's direct genome information.
    
    Args:
        legacy_service: Modular legacy tracking service
        
    Returns:
        Comparison analysis
    """
    try:
        logger.info("Comparing PHEONIX vs genome activities")
        
        # Get data from both systems
        phoenix_activities = await legacy_service.get_phoenix_activities()
        genome_activities = await legacy_service.get_genome_activities()
        
        # Perform comparison
        comparison = {
            "phoenix_activity_count": len(phoenix_activities),
            "genome_activity_count": len(genome_activities),
            "relationship_analysis": {
                "project_genome_ratio": len(phoenix_activities) / len(genome_activities) if genome_activities else 0,
                "relationship_type": "complementary" if phoenix_activities and genome_activities else "independent",
                "focus_separation": "clear" if phoenix_activities and genome_activities else "unclear"
            },
            "phoenix_activities": phoenix_activities,
            "genome_activities": genome_activities
        }
        
        return comparison
        
    except Exception as e:
        logger.error(f"Error comparing PHEONIX vs genome: {e}")
        raise HTTPException(status_code=500, detail="Failed to compare PHEONIX vs genome") from e
