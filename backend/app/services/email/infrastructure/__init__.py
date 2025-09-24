"""Email Infrastructure Services.

This module provides infrastructure services for email functionality:
- Continuous indexing and file watching
"""

from .continuous_indexing import ContinuousIndexingService

__all__ = [
    "ContinuousIndexingService",
]
