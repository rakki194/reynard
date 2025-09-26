"""Safety Framework for CULTURE Framework

This module provides comprehensive safety validation and content filtering
for cultural AI interactions, ensuring appropriate and safe communication
across all cultural contexts.

Author: Vulpine-Oracle-25 (Fox Specialist)
Date: 2025-01-15
Version: 1.0.0
"""

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from patterns import CulturalContext, CulturalScenario, SafetyLevel


class SafetyViolationType(Enum):
    """Types of safety violations"""

    HARMFUL_CONTENT = "harmful_content"
    EXPLICIT_CONTENT = "explicit_content"
    CONSENT_VIOLATION = "consent_violation"
    BOUNDARY_VIOLATION = "boundary_violation"
    TOXIC_LANGUAGE = "toxic_language"
    DISCRIMINATION = "discrimination"
    HARASSMENT = "harassment"
    MANIPULATION = "manipulation"
    INAPPROPRIATE_BEHAVIOR = "inappropriate_behavior"


class SafetySeverity(Enum):
    """Safety violation severity levels"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class SafetyViolation:
    """Record of a safety violation"""

    violation_type: SafetyViolationType
    severity: SafetySeverity
    description: str
    context: str
    suggested_action: str
    confidence: float
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class SafetyAssessment:
    """Comprehensive safety assessment result"""

    is_safe: bool
    safety_score: float
    violations: list[SafetyViolation]
    warnings: list[str]
    recommendations: list[str]
    content_level: SafetyLevel
    requires_review: bool
    metadata: dict[str, Any] = field(default_factory=dict)


class SafetyFramework:
    """Comprehensive safety validation framework"""

    def __init__(self):
        self.harmful_patterns = self._load_harmful_patterns()
        self.explicit_patterns = self._load_explicit_patterns()
        self.toxic_patterns = self._load_toxic_patterns()
        self.consent_patterns = self._load_consent_patterns()
        self.boundary_patterns = self._load_boundary_patterns()
        self.discrimination_patterns = self._load_discrimination_patterns()
        self.manipulation_patterns = self._load_manipulation_patterns()

        self.safety_thresholds = {
            SafetyLevel.SAFE: 0.9,
            SafetyLevel.MODERATE: 0.7,
            SafetyLevel.EXPLICIT: 0.5,
            SafetyLevel.RESTRICTED: 0.0,
        }

    def assess_safety(
        self,
        content: str,
        cultural_context: CulturalContext,
        safety_level: SafetyLevel = SafetyLevel.SAFE,
        user_consent: str | None = None,
    ) -> SafetyAssessment:
        """Comprehensive safety assessment"""
        violations = []
        warnings = []
        recommendations = []

        # Check for various types of violations
        violations.extend(self._check_harmful_content(content))
        violations.extend(self._check_explicit_content(content, safety_level))
        violations.extend(self._check_toxic_language(content))
        violations.extend(self._check_discrimination(content))
        violations.extend(self._check_manipulation(content))
        violations.extend(self._check_consent_violations(content, user_consent))
        violations.extend(self._check_boundary_violations(content, cultural_context))

        # Calculate safety score
        safety_score = self._calculate_safety_score(violations, content)

        # Determine if content is safe
        threshold = self.safety_thresholds.get(safety_level, 0.7)
        is_safe = (
            safety_score >= threshold
            and len(
                [
                    v
                    for v in violations
                    if v.severity in [SafetySeverity.HIGH, SafetySeverity.CRITICAL]
                ],
            )
            == 0
        )

        # Generate warnings and recommendations
        warnings = self._generate_warnings(violations)
        recommendations = self._generate_recommendations(violations, cultural_context)

        # Determine content level
        content_level = self._determine_content_level(violations, safety_score)

        # Check if review is required
        requires_review = any(
            v.severity in [SafetySeverity.HIGH, SafetySeverity.CRITICAL]
            for v in violations
        )

        return SafetyAssessment(
            is_safe=is_safe,
            safety_score=safety_score,
            violations=violations,
            warnings=warnings,
            recommendations=recommendations,
            content_level=content_level,
            requires_review=requires_review,
            metadata={
                "cultural_context": cultural_context.value,
                "safety_level": safety_level.value,
                "content_length": len(content),
                "word_count": len(content.split()),
            },
        )

    def validate_scenario_safety(self, scenario: CulturalScenario) -> SafetyAssessment:
        """Validate safety of a cultural scenario"""
        # Check scenario content
        scenario_content = f"{scenario.environment} {scenario.expected_behavior} {scenario.llm_response} {scenario.user_response}"

        return self.assess_safety(
            content=scenario_content,
            cultural_context=scenario.cultural_context,
            safety_level=scenario.safety_level,
            user_consent=scenario.consent_level,
        )

    def sanitize_content(self, content: str, target_safety_level: SafetyLevel) -> str:
        """Sanitize content to meet target safety level"""
        assessment = self.assess_safety(
            content,
            CulturalContext.CASUAL,
            target_safety_level,
        )

        if assessment.is_safe:
            return content

        # Apply sanitization based on violations
        sanitized_content = content

        for violation in assessment.violations:
            if violation.severity in [SafetySeverity.HIGH, SafetySeverity.CRITICAL]:
                sanitized_content = self._apply_sanitization(
                    sanitized_content,
                    violation,
                )

        return sanitized_content

    def _check_harmful_content(self, content: str) -> list[SafetyViolation]:
        """Check for harmful content"""
        violations = []
        content_lower = content.lower()

        for pattern, severity in self.harmful_patterns.items():
            if re.search(pattern, content_lower):
                violations.append(
                    SafetyViolation(
                        violation_type=SafetyViolationType.HARMFUL_CONTENT,
                        severity=severity,
                        description=f"Potentially harmful content detected: {pattern}",
                        context=content,
                        suggested_action="Remove or modify harmful content",
                        confidence=0.8,
                    ),
                )

        return violations

    def _check_explicit_content(
        self,
        content: str,
        safety_level: SafetyLevel,
    ) -> list[SafetyViolation]:
        """Check for explicit content based on safety level"""
        violations = []
        content_lower = content.lower()

        if safety_level == SafetyLevel.SAFE:
            # Check for any explicit content
            for pattern, severity in self.explicit_patterns.items():
                if re.search(pattern, content_lower):
                    violations.append(
                        SafetyViolation(
                            violation_type=SafetyViolationType.EXPLICIT_CONTENT,
                            severity=severity,
                            description=f"Explicit content detected in safe context: {pattern}",
                            context=content,
                            suggested_action="Remove explicit content or change safety level",
                            confidence=0.9,
                        ),
                    )

        return violations

    def _check_toxic_language(self, content: str) -> list[SafetyViolation]:
        """Check for toxic language"""
        violations = []
        content_lower = content.lower()

        for pattern, severity in self.toxic_patterns.items():
            if re.search(pattern, content_lower):
                violations.append(
                    SafetyViolation(
                        violation_type=SafetyViolationType.TOXIC_LANGUAGE,
                        severity=severity,
                        description=f"Toxic language detected: {pattern}",
                        context=content,
                        suggested_action="Replace with respectful language",
                        confidence=0.8,
                    ),
                )

        return violations

    def _check_discrimination(self, content: str) -> list[SafetyViolation]:
        """Check for discriminatory language"""
        violations = []
        content_lower = content.lower()

        for pattern, severity in self.discrimination_patterns.items():
            if re.search(pattern, content_lower):
                violations.append(
                    SafetyViolation(
                        violation_type=SafetyViolationType.DISCRIMINATION,
                        severity=severity,
                        description=f"Discriminatory language detected: {pattern}",
                        context=content,
                        suggested_action="Use inclusive language",
                        confidence=0.9,
                    ),
                )

        return violations

    def _check_manipulation(self, content: str) -> list[SafetyViolation]:
        """Check for manipulative language"""
        violations = []
        content_lower = content.lower()

        for pattern, severity in self.manipulation_patterns.items():
            if re.search(pattern, content_lower):
                violations.append(
                    SafetyViolation(
                        violation_type=SafetyViolationType.MANIPULATION,
                        severity=severity,
                        description=f"Manipulative language detected: {pattern}",
                        context=content,
                        suggested_action="Use direct, honest communication",
                        confidence=0.7,
                    ),
                )

        return violations

    def _check_consent_violations(
        self,
        content: str,
        user_consent: str | None,
    ) -> list[SafetyViolation]:
        """Check for consent violations"""
        violations = []

        if user_consent == "explicit":
            # Check for explicit consent language
            consent_indicators = ["consent", "permission", "okay", "agree", "yes"]
            has_consent = any(
                indicator in content.lower() for indicator in consent_indicators
            )

            if not has_consent:
                violations.append(
                    SafetyViolation(
                        violation_type=SafetyViolationType.CONSENT_VIOLATION,
                        severity=SafetySeverity.MEDIUM,
                        description="Missing explicit consent language",
                        context=content,
                        suggested_action="Include explicit consent checking",
                        confidence=0.6,
                    ),
                )

        return violations

    def _check_boundary_violations(
        self,
        content: str,
        cultural_context: CulturalContext,
    ) -> list[SafetyViolation]:
        """Check for boundary violations based on cultural context"""
        violations = []
        content_lower = content.lower()

        # Check for boundary-respecting language
        boundary_indicators = ["boundary", "limit", "comfort", "respect", "okay"]
        has_boundary_language = any(
            indicator in content_lower for indicator in boundary_indicators
        )

        # Check for boundary-violating language
        boundary_violating = ["force", "pressure", "coerce", "demand", "insist"]
        has_violating_language = any(
            indicator in content_lower for indicator in boundary_violating
        )

        if has_violating_language and not has_boundary_language:
            violations.append(
                SafetyViolation(
                    violation_type=SafetyViolationType.BOUNDARY_VIOLATION,
                    severity=SafetySeverity.HIGH,
                    description="Potential boundary violation detected",
                    context=content,
                    suggested_action="Respect boundaries and use consent-aware language",
                    confidence=0.8,
                ),
            )

        return violations

    def _calculate_safety_score(
        self,
        violations: list[SafetyViolation],
        content: str,
    ) -> float:
        """Calculate overall safety score"""
        if not violations:
            return 1.0

        # Start with perfect score
        score = 1.0

        # Deduct points based on violation severity
        for violation in violations:
            if violation.severity == SafetySeverity.CRITICAL:
                score -= 0.4
            elif violation.severity == SafetySeverity.HIGH:
                score -= 0.3
            elif violation.severity == SafetySeverity.MEDIUM:
                score -= 0.2
            elif violation.severity == SafetySeverity.LOW:
                score -= 0.1

        # Ensure score doesn't go below 0
        return max(0.0, score)

    def _generate_warnings(self, violations: list[SafetyViolation]) -> list[str]:
        """Generate safety warnings"""
        warnings = []

        for violation in violations:
            if violation.severity in [SafetySeverity.HIGH, SafetySeverity.CRITICAL]:
                warnings.append(
                    f"{violation.violation_type.value}: {violation.description}",
                )

        return warnings

    def _generate_recommendations(
        self,
        violations: list[SafetyViolation],
        cultural_context: CulturalContext,
    ) -> list[str]:
        """Generate safety recommendations"""
        recommendations = []

        for violation in violations:
            recommendations.append(violation.suggested_action)

        # Add context-specific recommendations
        if cultural_context in [CulturalContext.KINK, CulturalContext.INTIMATE]:
            recommendations.append("Ensure explicit consent for all activities")
            recommendations.append(
                "Include safety protocols and aftercare considerations",
            )

        if cultural_context in [CulturalContext.FURRY, CulturalContext.ROLEPLAY]:
            recommendations.append("Maintain clear OOC/IC separation")
            recommendations.append(
                "Respect character boundaries and species characteristics",
            )

        return list(set(recommendations))  # Remove duplicates

    def _determine_content_level(
        self,
        violations: list[SafetyViolation],
        safety_score: float,
    ) -> SafetyLevel:
        """Determine appropriate content level"""
        if safety_score >= 0.9 and not violations:
            return SafetyLevel.SAFE
        if safety_score >= 0.7:
            return SafetyLevel.MODERATE
        if safety_score >= 0.5:
            return SafetyLevel.EXPLICIT
        return SafetyLevel.RESTRICTED

    def _apply_sanitization(self, content: str, violation: SafetyViolation) -> str:
        """Apply sanitization based on violation type"""
        if violation.violation_type == SafetyViolationType.TOXIC_LANGUAGE:
            # Replace toxic language with neutral alternatives
            return self._replace_toxic_language(content)
        if violation.violation_type == SafetyViolationType.EXPLICIT_CONTENT:
            # Remove or mask explicit content
            return self._mask_explicit_content(content)
        if violation.violation_type == SafetyViolationType.HARMFUL_CONTENT:
            # Remove harmful content
            return self._remove_harmful_content(content)

        return content

    def _replace_toxic_language(self, content: str) -> str:
        """Replace toxic language with neutral alternatives"""
        replacements = {
            "stupid": "unwise",
            "dumb": "unwise",
            "idiot": "person",
            "moron": "person",
            "hate": "dislike",
            "terrible": "poor",
            "awful": "poor",
        }

        sanitized = content
        for toxic, neutral in replacements.items():
            sanitized = re.sub(rf"\b{toxic}\b", neutral, sanitized, flags=re.IGNORECASE)

        return sanitized

    def _mask_explicit_content(self, content: str) -> str:
        """Mask explicit content"""
        # Simple masking - in production, use more sophisticated methods
        explicit_words = ["explicit", "nsfw", "adult", "sexual"]

        masked = content
        for word in explicit_words:
            masked = re.sub(rf"\b{word}\b", "[REDACTED]", masked, flags=re.IGNORECASE)

        return masked

    def _remove_harmful_content(self, content: str) -> str:
        """Remove harmful content"""
        # Remove content that matches harmful patterns
        cleaned = content
        for pattern in self.harmful_patterns.keys():
            cleaned = re.sub(pattern, "[REMOVED]", cleaned, flags=re.IGNORECASE)

        return cleaned

    def _load_harmful_patterns(self) -> dict[str, SafetySeverity]:
        """Load harmful content patterns"""
        return {
            r"\b(violence|harm|hurt|damage|destroy)\b": SafetySeverity.HIGH,
            r"\b(kill|murder|death|suicide)\b": SafetySeverity.CRITICAL,
            r"\b(abuse|torture|suffer)\b": SafetySeverity.HIGH,
            r"\b(threat|danger|risk)\b": SafetySeverity.MEDIUM,
        }

    def _load_explicit_patterns(self) -> dict[str, SafetySeverity]:
        """Load explicit content patterns"""
        return {
            r"\b(sex|sexual|intimate|nsfw|explicit)\b": SafetySeverity.MEDIUM,
            r"\b(adult|mature|18\+)\b": SafetySeverity.MEDIUM,
            r"\b(erotic|porn|xxx)\b": SafetySeverity.HIGH,
        }

    def _load_toxic_patterns(self) -> dict[str, SafetySeverity]:
        """Load toxic language patterns"""
        return {
            r"\b(stupid|dumb|idiot|moron)\b": SafetySeverity.LOW,
            r"\b(hate|despise|loathe)\b": SafetySeverity.MEDIUM,
            r"\b(terrible|awful|horrible)\b": SafetySeverity.LOW,
            r"\b(worthless|useless|pathetic)\b": SafetySeverity.MEDIUM,
        }

    def _load_consent_patterns(self) -> dict[str, SafetySeverity]:
        """Load consent-related patterns"""
        return {
            r"\b(consent|permission|agree|okay|yes)\b": SafetySeverity.LOW,
            r"\b(force|pressure|coerce|demand)\b": SafetySeverity.HIGH,
            r"\b(no|stop|don\'t|refuse)\b": SafetySeverity.LOW,
        }

    def _load_boundary_patterns(self) -> dict[str, SafetySeverity]:
        """Load boundary-related patterns"""
        return {
            r"\b(boundary|limit|comfort|respect)\b": SafetySeverity.LOW,
            r"\b(ignore|disregard|violate)\b": SafetySeverity.MEDIUM,
            r"\b(cross|overstep|transgress)\b": SafetySeverity.MEDIUM,
        }

    def _load_discrimination_patterns(self) -> dict[str, SafetySeverity]:
        """Load discriminatory language patterns"""
        return {
            r"\b(racist|sexist|homophobic|transphobic)\b": SafetySeverity.HIGH,
            r"\b(discriminate|prejudice|bias)\b": SafetySeverity.MEDIUM,
            r"\b(superior|inferior|better|worse)\b": SafetySeverity.LOW,
        }

    def _load_manipulation_patterns(self) -> dict[str, SafetySeverity]:
        """Load manipulative language patterns"""
        return {
            r"\b(manipulate|control|influence|persuade)\b": SafetySeverity.MEDIUM,
            r"\b(guilt|shame|blame)\b": SafetySeverity.MEDIUM,
            r"\b(threaten|intimidate|bully)\b": SafetySeverity.HIGH,
        }
