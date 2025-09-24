"""Automation modules for PHOENIX Control.

Provides release automation, git workflow management, and version control
for the Success-Advisor-8 distillation system.
"""

from .changelog import ChangelogManager
from .git_workflow import ReleaseAutomation
from .version_management import VersionManager

__all__ = ["ChangelogManager", "ReleaseAutomation", "VersionManager"]
