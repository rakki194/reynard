"""
Success-Advisor-8 Legacy Tracking System

Comprehensive tracking and analysis of Success-Advisor-8 activities
and movements across the Reynard ecosystem.
"""

from .success_advisor_8_tracker import (
    SuccessAdvisor8Activity,
    CodeMovement,
    LegacyReport,
    SuccessAdvisor8LegacyTracker
)

from .unified_parser import (
    UnifiedChangelogParser
)

from .git_tag_tracker import (
    GitTag,
    SuccessAdvisor8Release,
    GitTagTracker
)

__all__ = [
    'SuccessAdvisor8Activity',
    'CodeMovement', 
    'LegacyReport',
    'SuccessAdvisor8LegacyTracker',
    'UnifiedChangelogParser',
    'GitTag',
    'SuccessAdvisor8Release',
    'GitTagTracker'
]
