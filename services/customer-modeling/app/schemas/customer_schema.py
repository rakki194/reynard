"""
Pydantic schemas for customer data models.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class AccountType(str, Enum):
    """Customer account types."""

    STANDARD = "standard"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class AccountTier(str, Enum):
    """Customer account tiers."""

    BASIC = "basic"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class Gender(str, Enum):
    """Gender options."""

    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class IncomeBracket(str, Enum):
    """Income bracket options."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class EducationLevel(str, Enum):
    """Education level options."""

    HIGH_SCHOOL = "high_school"
    BACHELOR = "bachelor"
    MASTER = "master"
    PHD = "phd"


class FamilyStatus(str, Enum):
    """Family status options."""

    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"


class LifecycleStage(str, Enum):
    """Customer lifecycle stages."""

    PROSPECT = "prospect"
    NEW = "new"
    ACTIVE = "active"
    AT_RISK = "at_risk"
    CHURNED = "churned"


class ValueTier(str, Enum):
    """Customer value tiers."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    PREMIUM = "premium"


# Base schemas
class CustomerDemographicsBase(BaseModel):
    """Base customer demographics schema."""

    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[Gender] = None
    location_country: Optional[str] = Field(None, max_length=100)
    location_region: Optional[str] = Field(None, max_length=100)
    location_city: Optional[str] = Field(None, max_length=100)
    income_bracket: Optional[IncomeBracket] = None
    education_level: Optional[EducationLevel] = None
    family_status: Optional[FamilyStatus] = None
    occupation: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    company_size: Optional[str] = Field(None, max_length=50)


class CustomerIdentityBase(BaseModel):
    """Base customer identity schema."""

    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    account_type: AccountType = AccountType.STANDARD
    account_tier: AccountTier = AccountTier.BASIC
    registration_source: Optional[str] = Field(None, max_length=100)
    is_active: bool = True
    is_verified: bool = False


# Create schemas
class CustomerCreate(CustomerIdentityBase):
    """Schema for creating a new customer."""

    demographics: Optional[CustomerDemographicsBase] = None


class CustomerDemographicsCreate(CustomerDemographicsBase):
    """Schema for creating customer demographics."""

    customer_id: int


# Update schemas
class CustomerUpdate(BaseModel):
    """Schema for updating customer information."""

    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    account_type: Optional[AccountType] = None
    account_tier: Optional[AccountTier] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    last_login: Optional[datetime] = None


class CustomerDemographicsUpdate(CustomerDemographicsBase):
    """Schema for updating customer demographics."""

    pass


# Response schemas
class CustomerDemographicsResponse(CustomerDemographicsBase):
    """Schema for customer demographics response."""

    id: int
    customer_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CustomerResponse(CustomerIdentityBase):
    """Schema for customer response."""

    id: int
    customer_uuid: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    demographics: Optional[CustomerDemographicsResponse] = None

    class Config:
        from_attributes = True


# Behavior metrics schemas
class CustomerBehaviorMetricsCreate(BaseModel):
    """Schema for creating customer behavior metrics."""

    metric_type: str = Field(..., max_length=50)
    metric_name: str = Field(..., max_length=100)
    metric_value: float
    metric_unit: Optional[str] = Field(None, max_length=20)
    context_data: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = Field(None, max_length=100)
    device_type: Optional[str] = Field(None, max_length=50)
    platform: Optional[str] = Field(None, max_length=50)


class CustomerBehaviorMetricsResponse(BaseModel):
    """Schema for customer behavior metrics response."""

    id: int
    customer_id: int
    metric_type: str
    metric_name: str
    metric_value: float
    metric_unit: Optional[str] = None
    context_data: Optional[Dict[str, Any]] = None
    recorded_at: datetime
    session_id: Optional[str] = None
    device_type: Optional[str] = None
    platform: Optional[str] = None

    class Config:
        from_attributes = True


# Predictive data schemas
class CustomerPredictiveDataResponse(BaseModel):
    """Schema for customer predictive data response."""

    id: int
    customer_id: int
    churn_probability: float
    lifetime_value: float
    purchase_probability: float
    upsell_probability: float
    engagement_score: float
    satisfaction_score: float
    loyalty_score: float
    customer_segment: Optional[str] = None
    behavioral_cluster: Optional[str] = None
    value_tier: Optional[ValueTier] = None
    lifecycle_stage: Optional[LifecycleStage] = None
    model_version: Optional[str] = None
    prediction_confidence: float
    last_prediction_update: datetime
    prediction_horizon: Optional[str] = None
    feature_vector: Optional[Dict[str, Any]] = None
    model_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Journey schemas
class CustomerJourneyCreate(BaseModel):
    """Schema for creating customer journey touchpoint."""

    journey_id: str = Field(..., max_length=100)
    touchpoint_type: str = Field(..., max_length=50)
    touchpoint_name: str = Field(..., max_length=100)
    touchpoint_data: Optional[Dict[str, Any]] = None
    interaction_outcome: Optional[str] = Field(None, max_length=50)
    conversion_value: float = 0.0
    session_id: Optional[str] = Field(None, max_length=100)
    campaign_id: Optional[str] = Field(None, max_length=100)
    channel: Optional[str] = Field(None, max_length=50)


class CustomerJourneyResponse(BaseModel):
    """Schema for customer journey response."""

    id: int
    customer_id: int
    journey_id: str
    touchpoint_type: str
    touchpoint_name: str
    touchpoint_data: Optional[Dict[str, Any]] = None
    interaction_outcome: Optional[str] = None
    conversion_value: float
    occurred_at: datetime
    session_id: Optional[str] = None
    campaign_id: Optional[str] = None
    channel: Optional[str] = None

    class Config:
        from_attributes = True


# Segmentation schemas
class CustomerSegmentationResponse(BaseModel):
    """Schema for customer segmentation response."""

    segment_name: str
    segment_type: str
    customer_count: int
    average_lifetime_value: float
    average_engagement_score: float
    churn_rate: float
    description: Optional[str] = None
    characteristics: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# Privacy schemas
class CustomerPrivacyControlsResponse(BaseModel):
    """Schema for customer privacy controls response."""

    id: int
    customer_id: int
    data_processing_consent: bool
    marketing_consent: bool
    analytics_consent: bool
    personalization_consent: bool
    data_sharing_consent: bool
    right_to_deletion: bool
    right_to_portability: bool
    right_to_rectification: bool
    right_to_restriction: bool
    anonymization_level: str
    data_retention_period: int
    gdpr_compliant: bool
    ccpa_compliant: bool
    last_consent_update: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Analytics schemas
class AnalyticsInsightsResponse(BaseModel):
    """Schema for analytics insights response."""

    insight_type: str
    time_period: str
    total_customers: int
    active_customers: int
    churn_rate: float
    average_lifetime_value: float
    top_segments: List[Dict[str, Any]]
    key_metrics: Dict[str, Any]
    trends: Dict[str, Any]
    generated_at: datetime
