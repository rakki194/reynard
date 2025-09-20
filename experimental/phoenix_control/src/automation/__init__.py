"""
Automation modules for PHOENIX Control.

Provides release automation, git workflow management, and version control
for the Success-Advisor-8 distillation system.
"""

from .git_workflow import ReleaseAutomation
from .version_management import VersionManager
from .changelog import ChangelogManager

__all__ = ["ReleaseAutomation", "VersionManager", "ChangelogManager"]
