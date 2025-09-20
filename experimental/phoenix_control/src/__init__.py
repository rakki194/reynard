"""
PHOENIX Control: Success-Advisor-8 Distillation

A clean, modular distillation of Success-Advisor-8's capabilities
extracted from the comprehensive PHOENIX framework and documentation.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

from .core.success_advisor import SuccessAdvisor8
from .automation.git_workflow import ReleaseAutomation
from .quality.validation import QualityAssurance

__version__ = "1.0.0"
__author__ = "Champion-Designer-32"
__all__ = ["SuccessAdvisor8", "ReleaseAutomation", "QualityAssurance"]
