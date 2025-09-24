"""
Behavioral analysis system for customer modeling ECS.
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import logging
import asyncio
from dataclasses import dataclass

from backend.app.ecs.customer_modeling.components.customer_identity import CustomerIdentity
from backend.app.ecs.customer_modeling.components.behavior_metrics import BehaviorMetrics, BehaviorMetric, MetricType
from backend.app.ecs.customer_modeling.components.demographics import Demographics
from backend.app.ecs.customer_modeling.components.predictive_data import PredictiveData

logger = logging.getLogger(__name__)


@dataclass
class BehaviorPattern:
    """Identified behavior pattern."""
    
    pattern_type: str
    confidence: float
    frequency: float
    duration: float
    intensity: float
    characteristics: Dict[str, Any]
    first_observed: datetime
    last_observed: datetime
    trend: str  # increasing, decreasing, stable


@dataclass
class BehaviorInsight:
    """Behavioral insight derived from analysis."""
    
    insight_type: str
    description: str
    confidence: float
    impact_score: float
    recommendations: List[str]
    supporting_evidence: Dict[str, Any]
    generated_at: datetime


class BehaviorAnalysisSystem:
    """System for analyzing customer behavior patterns."""
    
    def __init__(self):
        self.analysis_cache = {}
        self.pattern_detectors = {
            "engagement_trend": self._detect_engagement_trend,
            "purchase_pattern": self._detect_purchase_pattern,
            "session_behavior": self._detect_session_behavior,
            "device_preference": self._detect_device_preference,
            "time_pattern": self._detect_time_pattern,
            "churn_indicators": self._detect_churn_indicators
        }
    
    async def analyze_customer_behavior(self, 
                                      customer_id: str,
                                      identity: CustomerIdentity,
                                      behavior_metrics: BehaviorMetrics,
                                      demographics: Optional[Demographics] = None,
                                      predictive_data: Optional[PredictiveData] = None) -> Dict[str, Any]:
        """Analyze customer behavior and return insights."""
        
        try:
            # Check cache first
            cache_key = f"{customer_id}_{behavior_metrics.last_activity}"
            if cache_key in self.analysis_cache:
                return self.analysis_cache[cache_key]
            
            # Run pattern detection
            patterns = await self._detect_behavior_patterns(behavior_metrics)
            
            # Generate insights
            insights = await self._generate_behavior_insights(
                patterns, identity, behavior_metrics, demographics, predictive_data
            )
            
            # Calculate behavior scores
            scores = await self._calculate_behavior_scores(behavior_metrics, patterns)
            
            # Identify anomalies
            anomalies = await self._detect_behavior_anomalies(behavior_metrics, patterns)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(
                patterns, insights, scores, anomalies
            )
            
            analysis_result = {
                "customer_id": customer_id,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "patterns": [pattern.__dict__ for pattern in patterns],
                "insights": [insight.__dict__ for insight in insights],
                "scores": scores,
                "anomalies": anomalies,
                "recommendations": recommendations,
                "summary": self._generate_analysis_summary(patterns, insights, scores)
            }
            
            # Cache result
            self.analysis_cache[cache_key] = analysis_result
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Failed to analyze behavior for customer {customer_id}: {e}")
            raise
    
    async def _detect_behavior_patterns(self, behavior_metrics: BehaviorMetrics) -> List[BehaviorPattern]:
        """Detect behavior patterns from metrics."""
        
        patterns = []
        
        for pattern_type, detector in self.pattern_detectors.items():
            try:
                pattern = await detector(behavior_metrics)
                if pattern:
                    patterns.append(pattern)
            except Exception as e:
                logger.warning(f"Failed to detect {pattern_type} pattern: {e}")
        
        return patterns
    
    async def _detect_engagement_trend(self, behavior_metrics: BehaviorMetrics) -> Optional[BehaviorPattern]:
        """Detect engagement trend pattern."""
        
        if not behavior_metrics.metrics:
            return None
        
        # Calculate engagement trend over time
        engagement_metrics = behavior_metrics.get_metrics_by_type(MetricType.ENGAGEMENT)
        if len(engagement_metrics) < 3:
            return None
        
        # Sort by time
        engagement_metrics.sort(key=lambda x: x.recorded_at)
        
        # Calculate trend
        recent_avg = sum(m.metric_value for m in engagement_metrics[-3:]) / 3
        older_avg = sum(m.metric_value for m in engagement_metrics[:3]) / 3
        
        trend_direction = "increasing" if recent_avg > older_avg else "decreasing"
        if abs(recent_avg - older_avg) < 0.1:
            trend_direction = "stable"
        
        confidence = min(1.0, abs(recent_avg - older_avg) * 2)
        
        return BehaviorPattern(
            pattern_type="engagement_trend",
            confidence=confidence,
            frequency=len(engagement_metrics) / 30,  # per day
            duration=(engagement_metrics[-1].recorded_at - engagement_metrics[0].recorded_at).total_seconds() / 3600,
            intensity=recent_avg,
            characteristics={
                "trend_direction": trend_direction,
                "recent_average": recent_avg,
                "older_average": older_avg,
                "change_magnitude": abs(recent_avg - older_avg)
            },
            first_observed=engagement_metrics[0].recorded_at,
            last_observed=engagement_metrics[-1].recorded_at,
            trend=trend_direction
        )
    
    async def _detect_purchase_pattern(self, behavior_metrics: BehaviorMetrics) -> Optional[BehaviorPattern]:
        """Detect purchase behavior pattern."""
        
        purchase_metrics = behavior_metrics.get_metrics_by_type(MetricType.PURCHASE)
        if not purchase_metrics:
            return None
        
        # Analyze purchase frequency and value
        purchase_frequency = len(purchase_metrics) / 30  # per day
        avg_purchase_value = sum(m.metric_value for m in purchase_metrics) / len(purchase_metrics)
        
        # Determine pattern type
        if purchase_frequency > 0.1:  # More than once every 10 days
            pattern_type = "frequent_buyer"
        elif purchase_frequency > 0.03:  # More than once a month
            pattern_type = "regular_buyer"
        else:
            pattern_type = "occasional_buyer"
        
        return BehaviorPattern(
            pattern_type="purchase_pattern",
            confidence=0.8,
            frequency=purchase_frequency,
            duration=(purchase_metrics[-1].recorded_at - purchase_metrics[0].recorded_at).total_seconds() / 3600,
            intensity=avg_purchase_value,
            characteristics={
                "pattern_type": pattern_type,
                "purchase_frequency": purchase_frequency,
                "average_purchase_value": avg_purchase_value,
                "total_purchases": len(purchase_metrics)
            },
            first_observed=purchase_metrics[0].recorded_at,
            last_observed=purchase_metrics[-1].recorded_at,
            trend="stable"
        )
    
    async def _detect_session_behavior(self, behavior_metrics: BehaviorMetrics) -> Optional[BehaviorPattern]:
        """Detect session behavior pattern."""
        
        session_metrics = [m for m in behavior_metrics.metrics if m.metric_name == "session_duration"]
        if not session_metrics:
            return None
        
        avg_session_duration = sum(m.metric_value for m in session_metrics) / len(session_metrics)
        session_frequency = len(session_metrics) / 30  # per day
        
        # Determine session pattern
        if avg_session_duration > 1800:  # More than 30 minutes
            session_type = "long_session"
        elif avg_session_duration > 300:  # More than 5 minutes
            session_type = "medium_session"
        else:
            session_type = "short_session"
        
        return BehaviorPattern(
            pattern_type="session_behavior",
            confidence=0.7,
            frequency=session_frequency,
            duration=avg_session_duration,
            intensity=session_frequency * avg_session_duration,
            characteristics={
                "session_type": session_type,
                "average_duration": avg_session_duration,
                "session_frequency": session_frequency,
                "total_sessions": len(session_metrics)
            },
            first_observed=session_metrics[0].recorded_at,
            last_observed=session_metrics[-1].recorded_at,
            trend="stable"
        )
    
    async def _detect_device_preference(self, behavior_metrics: BehaviorMetrics) -> Optional[BehaviorPattern]:
        """Detect device preference pattern."""
        
        device_metrics = {}
        for metric in behavior_metrics.metrics:
            if metric.device_type:
                device_metrics[metric.device_type] = device_metrics.get(metric.device_type, 0) + 1
        
        if not device_metrics:
            return None
        
        # Find preferred device
        preferred_device = max(device_metrics, key=device_metrics.get)
        total_usage = sum(device_metrics.values())
        preference_ratio = device_metrics[preferred_device] / total_usage
        
        return BehaviorPattern(
            pattern_type="device_preference",
            confidence=preference_ratio,
            frequency=total_usage / 30,  # per day
            duration=0,  # Not applicable
            intensity=preference_ratio,
            characteristics={
                "preferred_device": preferred_device,
                "preference_ratio": preference_ratio,
                "device_usage": device_metrics,
                "total_interactions": total_usage
            },
            first_observed=behavior_metrics.first_activity or datetime.utcnow(),
            last_observed=behavior_metrics.last_activity or datetime.utcnow(),
            trend="stable"
        )
    
    async def _detect_time_pattern(self, behavior_metrics: BehaviorMetrics) -> Optional[BehaviorPattern]:
        """Detect time-based behavior pattern."""
        
        if not behavior_metrics.metrics:
            return None
        
        # Analyze time distribution
        hour_distribution = {}
        day_distribution = {}
        
        for metric in behavior_metrics.metrics:
            hour = metric.recorded_at.hour
            day = metric.recorded_at.strftime("%A")
            
            hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
            day_distribution[day] = day_distribution.get(day, 0) + 1
        
        # Find peak hours and days
        peak_hour = max(hour_distribution, key=hour_distribution.get) if hour_distribution else None
        peak_day = max(day_distribution, key=day_distribution.get) if day_distribution else None
        
        return BehaviorPattern(
            pattern_type="time_pattern",
            confidence=0.6,
            frequency=len(behavior_metrics.metrics) / 30,
            duration=0,
            intensity=max(hour_distribution.values()) if hour_distribution else 0,
            characteristics={
                "peak_hour": peak_hour,
                "peak_day": peak_day,
                "hour_distribution": hour_distribution,
                "day_distribution": day_distribution
            },
            first_observed=behavior_metrics.first_activity or datetime.utcnow(),
            last_observed=behavior_metrics.last_activity or datetime.utcnow(),
            trend="stable"
        )
    
    async def _detect_churn_indicators(self, behavior_metrics: BehaviorMetrics) -> Optional[BehaviorPattern]:
        """Detect churn risk indicators."""
        
        if not behavior_metrics.metrics:
            return None
        
        # Calculate recent activity
        recent_metrics = behavior_metrics.get_recent_metrics(7)  # Last 7 days
        older_metrics = behavior_metrics.get_recent_metrics(30)  # Last 30 days
        
        if len(recent_metrics) == 0:
            return BehaviorPattern(
                pattern_type="churn_indicators",
                confidence=0.9,
                frequency=0,
                duration=0,
                intensity=1.0,
                characteristics={
                    "risk_level": "high",
                    "indicators": ["no_recent_activity"],
                    "days_since_last_activity": (datetime.utcnow() - behavior_metrics.last_activity).days if behavior_metrics.last_activity else 999
                },
                first_observed=behavior_metrics.first_activity or datetime.utcnow(),
                last_observed=behavior_metrics.last_activity or datetime.utcnow(),
                trend="decreasing"
            )
        
        # Calculate activity decline
        recent_activity = len(recent_metrics)
        older_activity = len(older_metrics) - recent_activity
        
        if older_activity > 0:
            activity_decline = (older_activity - recent_activity) / older_activity
        else:
            activity_decline = 0
        
        # Determine risk level
        if activity_decline > 0.7:
            risk_level = "high"
        elif activity_decline > 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return BehaviorPattern(
            pattern_type="churn_indicators",
            confidence=min(1.0, activity_decline + 0.3),
            frequency=recent_activity / 7,
            duration=0,
            intensity=activity_decline,
            characteristics={
                "risk_level": risk_level,
                "activity_decline": activity_decline,
                "recent_activity": recent_activity,
                "older_activity": older_activity,
                "indicators": ["activity_decline"] if activity_decline > 0.3 else []
            },
            first_observed=behavior_metrics.first_activity or datetime.utcnow(),
            last_observed=behavior_metrics.last_activity or datetime.utcnow(),
            trend="decreasing" if activity_decline > 0.3 else "stable"
        )
    
    async def _generate_behavior_insights(self, 
                                        patterns: List[BehaviorPattern],
                                        identity: CustomerIdentity,
                                        behavior_metrics: BehaviorMetrics,
                                        demographics: Optional[Demographics],
                                        predictive_data: Optional[PredictiveData]) -> List[BehaviorInsight]:
        """Generate behavioral insights from patterns."""
        
        insights = []
        
        # Engagement insight
        engagement_pattern = next((p for p in patterns if p.pattern_type == "engagement_trend"), None)
        if engagement_pattern:
            if engagement_pattern.trend == "increasing":
                insights.append(BehaviorInsight(
                    insight_type="engagement_growth",
                    description="Customer engagement is increasing over time",
                    confidence=engagement_pattern.confidence,
                    impact_score=0.8,
                    recommendations=["Continue current engagement strategies", "Consider premium features"],
                    supporting_evidence={"trend": engagement_pattern.trend, "confidence": engagement_pattern.confidence},
                    generated_at=datetime.utcnow()
                ))
            elif engagement_pattern.trend == "decreasing":
                insights.append(BehaviorInsight(
                    insight_type="engagement_decline",
                    description="Customer engagement is declining",
                    confidence=engagement_pattern.confidence,
                    impact_score=0.9,
                    recommendations=["Send re-engagement campaign", "Offer personalized incentives"],
                    supporting_evidence={"trend": engagement_pattern.trend, "confidence": engagement_pattern.confidence},
                    generated_at=datetime.utcnow()
                ))
        
        # Purchase insight
        purchase_pattern = next((p for p in patterns if p.pattern_type == "purchase_pattern"), None)
        if purchase_pattern:
            insights.append(BehaviorInsight(
                insight_type="purchase_behavior",
                description=f"Customer shows {purchase_pattern.characteristics['pattern_type']} behavior",
                confidence=purchase_pattern.confidence,
                impact_score=0.7,
                recommendations=["Optimize product recommendations", "Consider loyalty program"],
                supporting_evidence=purchase_pattern.characteristics,
                generated_at=datetime.utcnow()
            ))
        
        # Churn insight
        churn_pattern = next((p for p in patterns if p.pattern_type == "churn_indicators"), None)
        if churn_pattern and churn_pattern.characteristics["risk_level"] in ["high", "medium"]:
            insights.append(BehaviorInsight(
                insight_type="churn_risk",
                description=f"Customer shows {churn_pattern.characteristics['risk_level']} churn risk",
                confidence=churn_pattern.confidence,
                impact_score=0.95,
                recommendations=["Immediate retention campaign", "Personal outreach", "Special offers"],
                supporting_evidence=churn_pattern.characteristics,
                generated_at=datetime.utcnow()
            ))
        
        return insights
    
    async def _calculate_behavior_scores(self, behavior_metrics: BehaviorMetrics, patterns: List[BehaviorPattern]) -> Dict[str, float]:
        """Calculate behavior scores."""
        
        scores = {
            "engagement_score": behavior_metrics.engagement_score,
            "activity_frequency": behavior_metrics.activity_frequency,
            "session_quality": 0.0,
            "consistency_score": 0.0,
            "growth_potential": 0.0
        }
        
        # Calculate session quality
        if behavior_metrics.session_duration > 0:
            scores["session_quality"] = min(1.0, behavior_metrics.session_duration / 1800)  # Normalize to 30 minutes
        
        # Calculate consistency score
        if patterns:
            consistent_patterns = sum(1 for p in patterns if p.trend == "stable")
            scores["consistency_score"] = consistent_patterns / len(patterns)
        
        # Calculate growth potential
        engagement_pattern = next((p for p in patterns if p.pattern_type == "engagement_trend"), None)
        if engagement_pattern and engagement_pattern.trend == "increasing":
            scores["growth_potential"] = min(1.0, engagement_pattern.confidence + 0.3)
        
        return scores
    
    async def _detect_behavior_anomalies(self, behavior_metrics: BehaviorMetrics, patterns: List[BehaviorPattern]) -> List[Dict[str, Any]]:
        """Detect behavioral anomalies."""
        
        anomalies = []
        
        # Check for sudden activity changes
        if behavior_metrics.metrics:
            recent_metrics = behavior_metrics.get_recent_metrics(1)  # Last 24 hours
            if len(recent_metrics) > 10:  # Unusually high activity
                anomalies.append({
                    "type": "high_activity",
                    "description": "Unusually high activity in the last 24 hours",
                    "severity": "medium",
                    "value": len(recent_metrics)
                })
        
        # Check for engagement anomalies
        if behavior_metrics.engagement_score > 0.9:
            anomalies.append({
                "type": "high_engagement",
                "description": "Exceptionally high engagement score",
                "severity": "low",
                "value": behavior_metrics.engagement_score
            })
        elif behavior_metrics.engagement_score < 0.1:
            anomalies.append({
                "type": "low_engagement",
                "description": "Very low engagement score",
                "severity": "high",
                "value": behavior_metrics.engagement_score
            })
        
        return anomalies
    
    async def _generate_recommendations(self, 
                                      patterns: List[BehaviorPattern],
                                      insights: List[BehaviorInsight],
                                      scores: Dict[str, float],
                                      anomalies: List[Dict[str, Any]]) -> List[str]:
        """Generate actionable recommendations."""
        
        recommendations = []
        
        # Add recommendations from insights
        for insight in insights:
            recommendations.extend(insight.recommendations)
        
        # Add score-based recommendations
        if scores["engagement_score"] < 0.3:
            recommendations.append("Implement engagement boost campaign")
        
        if scores["consistency_score"] < 0.5:
            recommendations.append("Focus on consistent user experience")
        
        if scores["growth_potential"] > 0.7:
            recommendations.append("Leverage growth potential with premium features")
        
        # Add anomaly-based recommendations
        for anomaly in anomalies:
            if anomaly["type"] == "low_engagement":
                recommendations.append("Urgent: Implement retention strategy")
            elif anomaly["type"] == "high_activity":
                recommendations.append("Monitor for potential issues or opportunities")
        
        return list(set(recommendations))  # Remove duplicates
    
    def _generate_analysis_summary(self, 
                                 patterns: List[BehaviorPattern],
                                 insights: List[BehaviorInsight],
                                 scores: Dict[str, float]) -> Dict[str, Any]:
        """Generate analysis summary."""
        
        return {
            "total_patterns": len(patterns),
            "total_insights": len(insights),
            "key_insights": [insight.insight_type for insight in insights],
            "average_confidence": sum(p.confidence for p in patterns) / len(patterns) if patterns else 0,
            "overall_engagement": scores.get("engagement_score", 0),
            "growth_potential": scores.get("growth_potential", 0),
            "consistency": scores.get("consistency_score", 0)
        }
