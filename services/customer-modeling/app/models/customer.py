"""
Customer data models for the Customer Modeling Microservice.
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Dict, Any, Optional

from app.core.database import Base


class CustomerIdentity(Base):
    """Customer identity and basic information."""
    
    __tablename__ = "customer_identities"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_uuid = Column(String(36), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    account_type = Column(String(50), default="standard")  # standard, premium, enterprise
    account_tier = Column(String(50), default="basic")     # basic, silver, gold, platinum
    registration_source = Column(String(100))              # web, mobile, referral, etc.
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    demographics = relationship("CustomerDemographics", back_populates="identity", uselist=False)
    behavior_metrics = relationship("CustomerBehaviorMetrics", back_populates="identity")
    predictive_data = relationship("CustomerPredictiveData", back_populates="identity", uselist=False)
    
    # Indexes
    __table_args__ = (
        Index('idx_customer_uuid', 'customer_uuid'),
        Index('idx_email', 'email'),
        Index('idx_account_type', 'account_type'),
        Index('idx_created_at', 'created_at'),
    )


class CustomerDemographics(Base):
    """Customer demographic information."""
    
    __tablename__ = "customer_demographics"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer_identities.id"), nullable=False)
    age = Column(Integer)
    gender = Column(String(20))
    location_country = Column(String(100))
    location_region = Column(String(100))
    location_city = Column(String(100))
    income_bracket = Column(String(50))  # low, medium, high, very_high
    education_level = Column(String(50))  # high_school, bachelor, master, phd
    family_status = Column(String(50))    # single, married, divorced, widowed
    occupation = Column(String(100))
    industry = Column(String(100))
    company_size = Column(String(50))     # startup, small, medium, large, enterprise
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    identity = relationship("CustomerIdentity", back_populates="demographics")
    
    # Indexes
    __table_args__ = (
        Index('idx_customer_demographics_customer_id', 'customer_id'),
        Index('idx_age', 'age'),
        Index('idx_location_country', 'location_country'),
        Index('idx_income_bracket', 'income_bracket'),
    )


class CustomerBehaviorMetrics(Base):
    """Customer behavior and engagement metrics."""
    
    __tablename__ = "customer_behavior_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer_identities.id"), nullable=False)
    metric_type = Column(String(50), nullable=False)  # engagement, purchase, browsing, etc.
    metric_name = Column(String(100), nullable=False)  # session_duration, page_views, etc.
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String(20))  # seconds, count, percentage, etc.
    context_data = Column(JSON)  # Additional context for the metric
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    session_id = Column(String(100))
    device_type = Column(String(50))  # mobile, desktop, tablet
    platform = Column(String(50))    # web, ios, android
    
    # Relationships
    identity = relationship("CustomerIdentity", back_populates="behavior_metrics")
    
    # Indexes
    __table_args__ = (
        Index('idx_behavior_customer_id', 'customer_id'),
        Index('idx_metric_type', 'metric_type'),
        Index('idx_metric_name', 'metric_name'),
        Index('idx_recorded_at', 'recorded_at'),
        Index('idx_session_id', 'session_id'),
    )


class CustomerPredictiveData(Base):
    """Customer predictive analytics and modeling data."""
    
    __tablename__ = "customer_predictive_data"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer_identities.id"), nullable=False)
    
    # Predictive Scores
    churn_probability = Column(Float, default=0.0)  # 0.0 to 1.0
    lifetime_value = Column(Float, default=0.0)
    purchase_probability = Column(Float, default=0.0)
    upsell_probability = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    satisfaction_score = Column(Float, default=0.0)
    loyalty_score = Column(Float, default=0.0)
    
    # Segmentation
    customer_segment = Column(String(100))
    behavioral_cluster = Column(String(100))
    value_tier = Column(String(50))  # low, medium, high, premium
    lifecycle_stage = Column(String(50))  # prospect, new, active, at_risk, churned
    
    # Model Metadata
    model_version = Column(String(50))
    prediction_confidence = Column(Float, default=0.0)
    last_prediction_update = Column(DateTime(timezone=True), server_default=func.now())
    prediction_horizon = Column(String(50))  # 30_days, 90_days, 1_year
    
    # Additional Data
    feature_vector = Column(JSON)  # ML feature vector
    model_metadata = Column(JSON)  # Model-specific metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    identity = relationship("CustomerIdentity", back_populates="predictive_data")
    
    # Indexes
    __table_args__ = (
        Index('idx_predictive_customer_id', 'customer_id'),
        Index('idx_churn_probability', 'churn_probability'),
        Index('idx_lifetime_value', 'lifetime_value'),
        Index('idx_customer_segment', 'customer_segment'),
        Index('idx_lifecycle_stage', 'lifecycle_stage'),
        Index('idx_last_prediction_update', 'last_prediction_update'),
    )


class CustomerJourney(Base):
    """Customer journey and touchpoint tracking."""
    
    __tablename__ = "customer_journeys"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer_identities.id"), nullable=False)
    journey_id = Column(String(100), nullable=False)
    touchpoint_type = Column(String(50), nullable=False)  # email, web, mobile, support, etc.
    touchpoint_name = Column(String(100), nullable=False)
    touchpoint_data = Column(JSON)  # Touchpoint-specific data
    interaction_outcome = Column(String(50))  # success, failure, partial, etc.
    conversion_value = Column(Float, default=0.0)
    occurred_at = Column(DateTime(timezone=True), server_default=func.now())
    session_id = Column(String(100))
    campaign_id = Column(String(100))
    channel = Column(String(50))  # organic, paid, email, social, etc.
    
    # Indexes
    __table_args__ = (
        Index('idx_journey_customer_id', 'customer_id'),
        Index('idx_journey_id', 'journey_id'),
        Index('idx_touchpoint_type', 'touchpoint_type'),
        Index('idx_occurred_at', 'occurred_at'),
        Index('idx_campaign_id', 'campaign_id'),
    )


class CustomerPrivacyControls(Base):
    """Customer privacy preferences and data governance."""
    
    __tablename__ = "customer_privacy_controls"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer_identities.id"), nullable=False)
    
    # Privacy Preferences
    data_processing_consent = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)
    analytics_consent = Column(Boolean, default=False)
    personalization_consent = Column(Boolean, default=False)
    data_sharing_consent = Column(Boolean, default=False)
    
    # Data Rights
    right_to_deletion = Column(Boolean, default=False)
    right_to_portability = Column(Boolean, default=False)
    right_to_rectification = Column(Boolean, default=False)
    right_to_restriction = Column(Boolean, default=False)
    
    # Anonymization Level
    anonymization_level = Column(String(20), default="level_2")  # level_1 to level_4
    data_retention_period = Column(Integer, default=365)  # days
    
    # Compliance
    gdpr_compliant = Column(Boolean, default=True)
    ccpa_compliant = Column(Boolean, default=True)
    last_consent_update = Column(DateTime(timezone=True), server_default=func.now())
    
    # Audit Trail
    consent_history = Column(JSON)  # History of consent changes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_privacy_customer_id', 'customer_id'),
        Index('idx_anonymization_level', 'anonymization_level'),
        Index('idx_last_consent_update', 'last_consent_update'),
    )
