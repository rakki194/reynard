"""
Customer service for Customer Modeling Microservice.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import logging

from app.models.customer import (
    CustomerIdentity, CustomerDemographics, CustomerBehaviorMetrics,
    CustomerPredictiveData, CustomerJourney, CustomerPrivacyControls
)
from app.schemas.customer_schema import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    CustomerBehaviorMetricsCreate, CustomerBehaviorMetricsResponse,
    CustomerPredictiveDataResponse, CustomerJourneyCreate,
    CustomerJourneyResponse, CustomerSegmentationResponse,
    AnalyticsInsightsResponse
)

logger = logging.getLogger(__name__)


class CustomerService:
    """Service for customer modeling operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_customer(self, customer_data: CustomerCreate) -> CustomerResponse:
        """Create a new customer."""
        try:
            # Create customer identity
            customer_identity = CustomerIdentity(
                customer_uuid=str(uuid.uuid4()),
                email=customer_data.email,
                phone=customer_data.phone,
                first_name=customer_data.first_name,
                last_name=customer_data.last_name,
                account_type=customer_data.account_type,
                account_tier=customer_data.account_tier,
                registration_source=customer_data.registration_source,
                is_active=customer_data.is_active,
                is_verified=customer_data.is_verified
            )
            
            self.db.add(customer_identity)
            self.db.flush()  # Get the ID
            
            # Create demographics if provided
            if customer_data.demographics:
                demographics = CustomerDemographics(
                    customer_id=customer_identity.id,
                    age=customer_data.demographics.age,
                    gender=customer_data.demographics.gender,
                    location_country=customer_data.demographics.location_country,
                    location_region=customer_data.demographics.location_region,
                    location_city=customer_data.demographics.location_city,
                    income_bracket=customer_data.demographics.income_bracket,
                    education_level=customer_data.demographics.education_level,
                    family_status=customer_data.demographics.family_status,
                    occupation=customer_data.demographics.occupation,
                    industry=customer_data.demographics.industry,
                    company_size=customer_data.demographics.company_size
                )
                self.db.add(demographics)
            
            # Create privacy controls
            privacy_controls = CustomerPrivacyControls(
                customer_id=customer_identity.id,
                data_processing_consent=False,  # Default to False for GDPR compliance
                marketing_consent=False,
                analytics_consent=False,
                personalization_consent=False,
                data_sharing_consent=False
            )
            self.db.add(privacy_controls)
            
            self.db.commit()
            self.db.refresh(customer_identity)
            
            return CustomerResponse.from_orm(customer_identity)
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create customer: {e}")
            raise
    
    async def get_customer_by_uuid(self, customer_uuid: str) -> Optional[CustomerResponse]:
        """Get customer by UUID."""
        try:
            customer = self.db.query(CustomerIdentity).filter(
                CustomerIdentity.customer_uuid == customer_uuid
            ).first()
            
            if customer:
                return CustomerResponse.from_orm(customer)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get customer by UUID {customer_uuid}: {e}")
            raise
    
    async def update_customer(self, customer_uuid: str, customer_data: CustomerUpdate) -> Optional[CustomerResponse]:
        """Update customer information."""
        try:
            customer = self.db.query(CustomerIdentity).filter(
                CustomerIdentity.customer_uuid == customer_uuid
            ).first()
            
            if not customer:
                return None
            
            # Update fields
            update_data = customer_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(customer, field, value)
            
            customer.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(customer)
            
            return CustomerResponse.from_orm(customer)
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update customer {customer_uuid}: {e}")
            raise
    
    async def record_behavior_metrics(self, customer_uuid: str, metrics_data: List[CustomerBehaviorMetricsCreate]) -> bool:
        """Record customer behavior metrics."""
        try:
            customer = self.db.query(CustomerIdentity).filter(
                CustomerIdentity.customer_uuid == customer_uuid
            ).first()
            
            if not customer:
                raise ValueError(f"Customer {customer_uuid} not found")
            
            for metric_data in metrics_data:
                metric = CustomerBehaviorMetrics(
                    customer_id=customer.id,
                    metric_type=metric_data.metric_type,
                    metric_name=metric_data.metric_name,
                    metric_value=metric_data.metric_value,
                    metric_unit=metric_data.metric_unit,
                    context_data=metric_data.context_data,
                    session_id=metric_data.session_id,
                    device_type=metric_data.device_type,
                    platform=metric_data.platform
                )
                self.db.add(metric)
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to record behavior metrics for {customer_uuid}: {e}")
            raise
    
    async def get_behavior_metrics(
        self, 
        customer_uuid: str, 
        metric_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[CustomerBehaviorMetricsResponse]:
        """Get customer behavior metrics."""
        try:
            customer = self.db.query(CustomerIdentity).filter(
                CustomerIdentity.customer_uuid == customer_uuid
            ).first()
            
            if not customer:
                raise ValueError(f"Customer {customer_uuid} not found")
            
            query = self.db.query(CustomerBehaviorMetrics).filter(
                CustomerBehaviorMetrics.customer_id == customer.id
            )
            
            if metric_type:
                query = query.filter(CustomerBehaviorMetrics.metric_type == metric_type)
            
            if start_date:
                query = query.filter(CustomerBehaviorMetrics.recorded_at >= start_date)
            
            if end_date:
                query = query.filter(CustomerBehaviorMetrics.recorded_at <= end_date)
            
            metrics = query.order_by(desc(CustomerBehaviorMetrics.recorded_at)).limit(limit).all()
            
            return [CustomerBehaviorMetricsResponse.from_orm(metric) for metric in metrics]
            
        except Exception as e:
            logger.error(f"Failed to get behavior metrics for {customer_uuid}: {e}")
            raise
    
    async def get_predictive_data(self, customer_uuid: str) -> Optional[CustomerPredictiveDataResponse]:
        """Get customer predictive data."""
        try:
            customer = self.db.query(CustomerIdentity).filter(
                CustomerIdentity.customer_uuid == customer_uuid
            ).first()
            
            if not customer:
                raise ValueError(f"Customer {customer_uuid} not found")
            
            predictive_data = self.db.query(CustomerPredictiveData).filter(
                CustomerPredictiveData.customer_id == customer.id
            ).first()
            
            if predictive_data:
                return CustomerPredictiveDataResponse.from_orm(predictive_data)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get predictive data for {customer_uuid}: {e}")
            raise
    
    async def record_journey_touchpoint(self, customer_uuid: str, journey_data: CustomerJourneyCreate) -> bool:
        """Record customer journey touchpoint."""
        try:
            customer = self.db.query(CustomerIdentity).filter(
                CustomerIdentity.customer_uuid == customer_uuid
            ).first()
            
            if not customer:
                raise ValueError(f"Customer {customer_uuid} not found")
            
            journey = CustomerJourney(
                customer_id=customer.id,
                journey_id=journey_data.journey_id,
                touchpoint_type=journey_data.touchpoint_type,
                touchpoint_name=journey_data.touchpoint_name,
                touchpoint_data=journey_data.touchpoint_data,
                interaction_outcome=journey_data.interaction_outcome,
                conversion_value=journey_data.conversion_value,
                session_id=journey_data.session_id,
                campaign_id=journey_data.campaign_id,
                channel=journey_data.channel
            )
            
            self.db.add(journey)
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to record journey touchpoint for {customer_uuid}: {e}")
            raise
    
    async def get_customer_journey(
        self,
        customer_uuid: str,
        journey_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[CustomerJourneyResponse]:
        """Get customer journey touchpoints."""
        try:
            customer = self.db.query(CustomerIdentity).filter(
                CustomerIdentity.customer_uuid == customer_uuid
            ).first()
            
            if not customer:
                raise ValueError(f"Customer {customer_uuid} not found")
            
            query = self.db.query(CustomerJourney).filter(
                CustomerJourney.customer_id == customer.id
            )
            
            if journey_id:
                query = query.filter(CustomerJourney.journey_id == journey_id)
            
            if start_date:
                query = query.filter(CustomerJourney.occurred_at >= start_date)
            
            if end_date:
                query = query.filter(CustomerJourney.occurred_at <= end_date)
            
            journey = query.order_by(desc(CustomerJourney.occurred_at)).limit(limit).all()
            
            return [CustomerJourneyResponse.from_orm(touchpoint) for touchpoint in journey]
            
        except Exception as e:
            logger.error(f"Failed to get customer journey for {customer_uuid}: {e}")
            raise
    
    async def get_customer_segmentation(self, segment_type: str, limit: int = 100) -> List[CustomerSegmentationResponse]:
        """Get customer segmentation data."""
        try:
            # This is a simplified implementation
            # In a real system, this would involve complex analytics queries
            
            segments = []
            
            if segment_type == "behavioral":
                # Get behavioral segments
                behavioral_segments = self.db.query(
                    CustomerPredictiveData.behavioral_cluster,
                    func.count(CustomerPredictiveData.id).label('customer_count'),
                    func.avg(CustomerPredictiveData.lifetime_value).label('avg_lifetime_value'),
                    func.avg(CustomerPredictiveData.engagement_score).label('avg_engagement_score'),
                    func.avg(CustomerPredictiveData.churn_probability).label('avg_churn_rate')
                ).group_by(CustomerPredictiveData.behavioral_cluster).limit(limit).all()
                
                for segment in behavioral_segments:
                    segments.append(CustomerSegmentationResponse(
                        segment_name=segment.behavioral_cluster or "Unknown",
                        segment_type="behavioral",
                        customer_count=segment.customer_count,
                        average_lifetime_value=float(segment.avg_lifetime_value or 0),
                        average_engagement_score=float(segment.avg_engagement_score or 0),
                        churn_rate=float(segment.avg_churn_rate or 0),
                        description=f"Behavioral cluster: {segment.behavioral_cluster}",
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    ))
            
            return segments
            
        except Exception as e:
            logger.error(f"Failed to get customer segmentation: {e}")
            raise
    
    async def update_predictions(self, customer_uuids: Optional[List[str]] = None, force_update: bool = False) -> Dict[str, Any]:
        """Update customer predictions."""
        try:
            # This is a simplified implementation
            # In a real system, this would involve ML model inference
            
            updated_count = 0
            predictions_updated = 0
            
            if customer_uuids:
                customers = self.db.query(CustomerIdentity).filter(
                    CustomerIdentity.customer_uuid.in_(customer_uuids)
                ).all()
            else:
                customers = self.db.query(CustomerIdentity).all()
            
            for customer in customers:
                # Check if update is needed
                if not force_update:
                    existing_prediction = self.db.query(CustomerPredictiveData).filter(
                        CustomerPredictiveData.customer_id == customer.id
                    ).first()
                    
                    if existing_prediction and existing_prediction.last_prediction_update > datetime.utcnow() - timedelta(hours=24):
                        continue
                
                # Create or update predictive data
                predictive_data = self.db.query(CustomerPredictiveData).filter(
                    CustomerPredictiveData.customer_id == customer.id
                ).first()
                
                if not predictive_data:
                    predictive_data = CustomerPredictiveData(customer_id=customer.id)
                    self.db.add(predictive_data)
                
                # Update predictions (simplified - in real system, use ML models)
                predictive_data.churn_probability = 0.1  # Placeholder
                predictive_data.lifetime_value = 1000.0  # Placeholder
                predictive_data.purchase_probability = 0.7  # Placeholder
                predictive_data.upsell_probability = 0.3  # Placeholder
                predictive_data.engagement_score = 0.8  # Placeholder
                predictive_data.satisfaction_score = 0.9  # Placeholder
                predictive_data.loyalty_score = 0.7  # Placeholder
                predictive_data.customer_segment = "active"
                predictive_data.behavioral_cluster = "engaged"
                predictive_data.value_tier = "medium"
                predictive_data.lifecycle_stage = "active"
                predictive_data.model_version = "1.0.0"
                predictive_data.prediction_confidence = 0.85
                predictive_data.last_prediction_update = datetime.utcnow()
                predictive_data.prediction_horizon = "30_days"
                
                updated_count += 1
                predictions_updated += 1
            
            self.db.commit()
            
            return {
                "customers_updated": updated_count,
                "predictions_updated": predictions_updated
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update predictions: {e}")
            raise
    
    async def get_analytics_insights(self, insight_type: str, time_period: str) -> AnalyticsInsightsResponse:
        """Get analytics insights."""
        try:
            # Calculate time period
            if time_period == "30_days":
                start_date = datetime.utcnow() - timedelta(days=30)
            elif time_period == "90_days":
                start_date = datetime.utcnow() - timedelta(days=90)
            else:
                start_date = datetime.utcnow() - timedelta(days=30)
            
            # Get basic metrics
            total_customers = self.db.query(CustomerIdentity).count()
            active_customers = self.db.query(CustomerIdentity).filter(
                CustomerIdentity.is_active == True
            ).count()
            
            # Get churn rate
            churned_customers = self.db.query(CustomerIdentity).filter(
                and_(
                    CustomerIdentity.is_active == False,
                    CustomerIdentity.updated_at >= start_date
                )
            ).count()
            
            churn_rate = (churned_customers / total_customers) if total_customers > 0 else 0
            
            # Get average lifetime value
            avg_lifetime_value = self.db.query(
                func.avg(CustomerPredictiveData.lifetime_value)
            ).scalar() or 0
            
            # Get top segments
            top_segments = self.db.query(
                CustomerPredictiveData.customer_segment,
                func.count(CustomerPredictiveData.id).label('count')
            ).group_by(CustomerPredictiveData.customer_segment).limit(5).all()
            
            return AnalyticsInsightsResponse(
                insight_type=insight_type,
                time_period=time_period,
                total_customers=total_customers,
                active_customers=active_customers,
                churn_rate=churn_rate,
                average_lifetime_value=float(avg_lifetime_value),
                top_segments=[{"segment": seg.customer_segment, "count": seg.count} for seg in top_segments],
                key_metrics={
                    "total_customers": total_customers,
                    "active_customers": active_customers,
                    "churn_rate": churn_rate,
                    "avg_lifetime_value": float(avg_lifetime_value)
                },
                trends={
                    "customer_growth": "positive",
                    "engagement_trend": "stable",
                    "churn_trend": "decreasing"
                },
                generated_at=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Failed to get analytics insights: {e}")
            raise
