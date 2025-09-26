"""
Customer predictive data component for ECS customer modeling.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


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


class RiskLevel(str, Enum):
    """Risk levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class PredictiveData:
    """Customer predictive data component."""

    # Core Predictive Scores (0.0 to 1.0)
    churn_probability: float = 0.0
    lifetime_value: float = 0.0
    purchase_probability: float = 0.0
    upsell_probability: float = 0.0
    cross_sell_probability: float = 0.0

    # Engagement and Satisfaction Scores
    engagement_score: float = 0.0
    satisfaction_score: float = 0.0
    loyalty_score: float = 0.0
    advocacy_score: float = 0.0

    # Segmentation
    customer_segment: Optional[str] = None
    behavioral_cluster: Optional[str] = None
    value_tier: ValueTier = ValueTier.LOW
    lifecycle_stage: LifecycleStage = LifecycleStage.NEW

    # Risk Assessment
    risk_level: RiskLevel = RiskLevel.LOW
    fraud_probability: float = 0.0
    credit_risk: float = 0.0

    # Model Metadata
    model_version: str = "1.0.0"
    prediction_confidence: float = 0.0
    prediction_horizon: str = "30_days"
    last_prediction_update: datetime = None

    # Feature Vectors
    feature_vector: Dict[str, float] = field(default_factory=dict)
    behavioral_features: Dict[str, Any] = field(default_factory=dict)
    demographic_features: Dict[str, Any] = field(default_factory=dict)

    # Model Metadata
    model_metadata: Dict[str, Any] = field(default_factory=dict)
    feature_importance: Dict[str, float] = field(default_factory=dict)

    # Timestamps
    created_at: datetime = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        """Initialize default values."""
        if self.last_prediction_update is None:
            self.last_prediction_update = datetime.utcnow()
        if self.created_at is None:
            self.created_at = datetime.utcnow()

    def update_prediction(
        self,
        churn_prob: float = None,
        lifetime_val: float = None,
        purchase_prob: float = None,
        upsell_prob: float = None,
        cross_sell_prob: float = None,
        engagement: float = None,
        satisfaction: float = None,
        loyalty: float = None,
        advocacy: float = None,
        confidence: float = None,
    ):
        """Update prediction scores."""

        if churn_prob is not None:
            self.churn_probability = max(0.0, min(1.0, churn_prob))
        if lifetime_val is not None:
            self.lifetime_value = max(0.0, lifetime_val)
        if purchase_prob is not None:
            self.purchase_probability = max(0.0, min(1.0, purchase_prob))
        if upsell_prob is not None:
            self.upsell_probability = max(0.0, min(1.0, upsell_prob))
        if cross_sell_prob is not None:
            self.cross_sell_probability = max(0.0, min(1.0, cross_sell_prob))
        if engagement is not None:
            self.engagement_score = max(0.0, min(1.0, engagement))
        if satisfaction is not None:
            self.satisfaction_score = max(0.0, min(1.0, satisfaction))
        if loyalty is not None:
            self.loyalty_score = max(0.0, min(1.0, loyalty))
        if advocacy is not None:
            self.advocacy_score = max(0.0, min(1.0, advocacy))
        if confidence is not None:
            self.prediction_confidence = max(0.0, min(1.0, confidence))

        self.last_prediction_update = datetime.utcnow()
        self.updated_at = datetime.utcnow()

        # Update derived values
        self._update_derived_values()

    def _update_derived_values(self):
        """Update derived values based on predictions."""
        # Update value tier based on lifetime value
        if self.lifetime_value >= 10000:
            self.value_tier = ValueTier.PREMIUM
        elif self.lifetime_value >= 5000:
            self.value_tier = ValueTier.HIGH
        elif self.lifetime_value >= 1000:
            self.value_tier = ValueTier.MEDIUM
        else:
            self.value_tier = ValueTier.LOW

        # Update lifecycle stage based on churn probability and engagement
        if self.churn_probability > 0.7:
            self.lifecycle_stage = LifecycleStage.AT_RISK
        elif self.churn_probability > 0.3 and self.engagement_score < 0.3:
            self.lifecycle_stage = LifecycleStage.AT_RISK
        elif self.engagement_score > 0.7:
            self.lifecycle_stage = LifecycleStage.ACTIVE
        else:
            self.lifecycle_stage = LifecycleStage.NEW

        # Update risk level
        if self.churn_probability > 0.8 or self.fraud_probability > 0.8:
            self.risk_level = RiskLevel.CRITICAL
        elif self.churn_probability > 0.6 or self.fraud_probability > 0.6:
            self.risk_level = RiskLevel.HIGH
        elif self.churn_probability > 0.4 or self.fraud_probability > 0.4:
            self.risk_level = RiskLevel.MEDIUM
        else:
            self.risk_level = RiskLevel.LOW

    def get_customer_value_score(self) -> float:
        """Calculate overall customer value score."""
        # Weighted combination of various factors
        value_score = (
            self.lifetime_value * 0.3
            + self.purchase_probability * 0.2
            + self.upsell_probability * 0.15
            + self.cross_sell_probability * 0.1
            + self.engagement_score * 0.1
            + self.loyalty_score * 0.1
            + self.advocacy_score * 0.05
        )
        return min(1.0, value_score / 1000.0)  # Normalize to 0-1 range

    def get_retention_score(self) -> float:
        """Calculate customer retention score."""
        # Higher engagement and satisfaction, lower churn probability
        retention_score = (
            self.engagement_score * 0.4
            + self.satisfaction_score * 0.3
            + self.loyalty_score * 0.2
            + (1.0 - self.churn_probability) * 0.1
        )
        return max(0.0, min(1.0, retention_score))

    def get_growth_potential(self) -> float:
        """Calculate customer growth potential."""
        growth_potential = (
            self.upsell_probability * 0.4
            + self.cross_sell_probability * 0.3
            + self.advocacy_score * 0.2
            + self.engagement_score * 0.1
        )
        return max(0.0, min(1.0, growth_potential))

    def is_high_value_customer(self) -> bool:
        """Check if customer is high value."""
        return (
            self.value_tier in [ValueTier.HIGH, ValueTier.PREMIUM]
            and self.lifetime_value > 5000
            and self.retention_score() > 0.7
        )

    def is_at_risk_customer(self) -> bool:
        """Check if customer is at risk of churning."""
        return (
            self.churn_probability > 0.6
            or self.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]
            or self.lifecycle_stage == LifecycleStage.AT_RISK
        )

    def get_recommended_actions(self) -> List[str]:
        """Get recommended actions based on predictions."""
        actions = []

        if self.is_at_risk_customer():
            actions.extend(
                [
                    "Send retention campaign",
                    "Offer personalized discount",
                    "Schedule customer success call",
                    "Analyze churn reasons",
                ]
            )

        if self.growth_potential() > 0.7:
            actions.extend(
                [
                    "Present upsell opportunities",
                    "Recommend complementary products",
                    "Invite to premium features",
                ]
            )

        if self.advocacy_score > 0.8:
            actions.extend(
                [
                    "Request testimonials",
                    "Invite to referral program",
                    "Feature in case studies",
                ]
            )

        if self.engagement_score < 0.3:
            actions.extend(
                [
                    "Send re-engagement campaign",
                    "Offer onboarding assistance",
                    "Provide usage tutorials",
                ]
            )

        return list(set(actions))  # Remove duplicates

    def get_prediction_summary(self) -> Dict[str, Any]:
        """Get a summary of all predictions."""
        return {
            "churn_probability": self.churn_probability,
            "lifetime_value": self.lifetime_value,
            "purchase_probability": self.purchase_probability,
            "upsell_probability": self.upsell_probability,
            "cross_sell_probability": self.cross_sell_probability,
            "engagement_score": self.engagement_score,
            "satisfaction_score": self.satisfaction_score,
            "loyalty_score": self.loyalty_score,
            "advocacy_score": self.advocacy_score,
            "customer_segment": self.customer_segment,
            "behavioral_cluster": self.behavioral_cluster,
            "value_tier": self.value_tier.value,
            "lifecycle_stage": self.lifecycle_stage.value,
            "risk_level": self.risk_level.value,
            "fraud_probability": self.fraud_probability,
            "credit_risk": self.credit_risk,
            "model_version": self.model_version,
            "prediction_confidence": self.prediction_confidence,
            "prediction_horizon": self.prediction_horizon,
            "customer_value_score": self.get_customer_value_score(),
            "retention_score": self.get_retention_score(),
            "growth_potential": self.get_growth_potential(),
            "is_high_value": self.is_high_value_customer(),
            "is_at_risk": self.is_at_risk_customer(),
            "recommended_actions": self.get_recommended_actions(),
            "last_prediction_update": self.last_prediction_update.isoformat(),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "churn_probability": self.churn_probability,
            "lifetime_value": self.lifetime_value,
            "purchase_probability": self.purchase_probability,
            "upsell_probability": self.upsell_probability,
            "cross_sell_probability": self.cross_sell_probability,
            "engagement_score": self.engagement_score,
            "satisfaction_score": self.satisfaction_score,
            "loyalty_score": self.loyalty_score,
            "advocacy_score": self.advocacy_score,
            "customer_segment": self.customer_segment,
            "behavioral_cluster": self.behavioral_cluster,
            "value_tier": self.value_tier.value,
            "lifecycle_stage": self.lifecycle_stage.value,
            "risk_level": self.risk_level.value,
            "fraud_probability": self.fraud_probability,
            "credit_risk": self.credit_risk,
            "model_version": self.model_version,
            "prediction_confidence": self.prediction_confidence,
            "prediction_horizon": self.prediction_horizon,
            "feature_vector": self.feature_vector,
            "behavioral_features": self.behavioral_features,
            "demographic_features": self.demographic_features,
            "model_metadata": self.model_metadata,
            "feature_importance": self.feature_importance,
            "last_prediction_update": self.last_prediction_update.isoformat(),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
