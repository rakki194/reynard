"""
Customer modeling endpoints for Customer Modeling Microservice.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.customer_schema import (
    CustomerBehaviorMetricsCreate,
    CustomerBehaviorMetricsResponse,
    CustomerCreate,
    CustomerJourneyCreate,
    CustomerJourneyResponse,
    CustomerPredictiveDataResponse,
    CustomerResponse,
    CustomerSegmentationResponse,
    CustomerUpdate,
)
from app.services.customer_service import CustomerService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/customers", response_model=CustomerResponse)
async def create_customer(customer_data: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer in the modeling system."""
    try:
        customer_service = CustomerService(db)
        customer = await customer_service.create_customer(customer_data)
        return customer
    except Exception as e:
        logger.error(f"Failed to create customer: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/customers/{customer_uuid}", response_model=CustomerResponse)
async def get_customer(
    customer_uuid: str = Path(..., description="Customer UUID"),
    db: Session = Depends(get_db),
):
    """Get customer information by UUID."""
    try:
        customer_service = CustomerService(db)
        customer = await customer_service.get_customer_by_uuid(customer_uuid)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get customer {customer_uuid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/customers/{customer_uuid}", response_model=CustomerResponse)
async def update_customer(
    customer_uuid: str = Path(..., description="Customer UUID"),
    customer_data: CustomerUpdate = None,
    db: Session = Depends(get_db),
):
    """Update customer information."""
    try:
        customer_service = CustomerService(db)
        customer = await customer_service.update_customer(customer_uuid, customer_data)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update customer {customer_uuid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/customers/{customer_uuid}/behavior-metrics")
async def record_behavior_metrics(
    customer_uuid: str = Path(..., description="Customer UUID"),
    metrics_data: List[CustomerBehaviorMetricsCreate] = None,
    db: Session = Depends(get_db),
):
    """Record customer behavior metrics."""
    try:
        customer_service = CustomerService(db)
        result = await customer_service.record_behavior_metrics(
            customer_uuid, metrics_data
        )
        return {"status": "success", "metrics_recorded": len(metrics_data)}
    except Exception as e:
        logger.error(f"Failed to record behavior metrics for {customer_uuid}: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/customers/{customer_uuid}/behavior-metrics",
    response_model=List[CustomerBehaviorMetricsResponse],
)
async def get_behavior_metrics(
    customer_uuid: str = Path(..., description="Customer UUID"),
    metric_type: Optional[str] = Query(None, description="Filter by metric type"),
    start_date: Optional[datetime] = Query(None, description="Start date for metrics"),
    end_date: Optional[datetime] = Query(None, description="End date for metrics"),
    limit: int = Query(100, description="Maximum number of metrics to return"),
    db: Session = Depends(get_db),
):
    """Get customer behavior metrics."""
    try:
        customer_service = CustomerService(db)
        metrics = await customer_service.get_behavior_metrics(
            customer_uuid, metric_type, start_date, end_date, limit
        )
        return metrics
    except Exception as e:
        logger.error(f"Failed to get behavior metrics for {customer_uuid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/customers/{customer_uuid}/predictive-data",
    response_model=CustomerPredictiveDataResponse,
)
async def get_predictive_data(
    customer_uuid: str = Path(..., description="Customer UUID"),
    db: Session = Depends(get_db),
):
    """Get customer predictive analytics data."""
    try:
        customer_service = CustomerService(db)
        predictive_data = await customer_service.get_predictive_data(customer_uuid)
        if not predictive_data:
            raise HTTPException(status_code=404, detail="Predictive data not found")
        return predictive_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get predictive data for {customer_uuid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/customers/{customer_uuid}/journey")
async def record_journey_touchpoint(
    customer_uuid: str = Path(..., description="Customer UUID"),
    journey_data: CustomerJourneyCreate = None,
    db: Session = Depends(get_db),
):
    """Record a customer journey touchpoint."""
    try:
        customer_service = CustomerService(db)
        result = await customer_service.record_journey_touchpoint(
            customer_uuid, journey_data
        )
        return {"status": "success", "touchpoint_recorded": True}
    except Exception as e:
        logger.error(f"Failed to record journey touchpoint for {customer_uuid}: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/customers/{customer_uuid}/journey", response_model=List[CustomerJourneyResponse]
)
async def get_customer_journey(
    customer_uuid: str = Path(..., description="Customer UUID"),
    journey_id: Optional[str] = Query(None, description="Filter by journey ID"),
    start_date: Optional[datetime] = Query(None, description="Start date for journey"),
    end_date: Optional[datetime] = Query(None, description="End date for journey"),
    limit: int = Query(100, description="Maximum number of touchpoints to return"),
    db: Session = Depends(get_db),
):
    """Get customer journey touchpoints."""
    try:
        customer_service = CustomerService(db)
        journey = await customer_service.get_customer_journey(
            customer_uuid, journey_id, start_date, end_date, limit
        )
        return journey
    except Exception as e:
        logger.error(f"Failed to get customer journey for {customer_uuid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/segmentation", response_model=List[CustomerSegmentationResponse])
async def get_customer_segmentation(
    segment_type: str = Query("behavioral", description="Type of segmentation"),
    limit: int = Query(100, description="Maximum number of segments to return"),
    db: Session = Depends(get_db),
):
    """Get customer segmentation data."""
    try:
        customer_service = CustomerService(db)
        segments = await customer_service.get_customer_segmentation(segment_type, limit)
        return segments
    except Exception as e:
        logger.error(f"Failed to get customer segmentation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analytics/update-predictions")
async def update_predictions(
    customer_uuids: Optional[List[str]] = None,
    force_update: bool = Query(
        False, description="Force update even if recently updated"
    ),
    db: Session = Depends(get_db),
):
    """Update customer predictions for specified customers or all customers."""
    try:
        customer_service = CustomerService(db)
        result = await customer_service.update_predictions(customer_uuids, force_update)
        return {
            "status": "success",
            "customers_updated": result.get("customers_updated", 0),
            "predictions_updated": result.get("predictions_updated", 0),
        }
    except Exception as e:
        logger.error(f"Failed to update predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/insights")
async def get_analytics_insights(
    insight_type: str = Query("overview", description="Type of insights"),
    time_period: str = Query("30_days", description="Time period for insights"),
    db: Session = Depends(get_db),
):
    """Get analytics insights and summaries."""
    try:
        customer_service = CustomerService(db)
        insights = await customer_service.get_analytics_insights(
            insight_type, time_period
        )
        return insights
    except Exception as e:
        logger.error(f"Failed to get analytics insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))
