"""
Dynamic Enum Service Package
============================

A fully modular service for managing dynamic enums based on FastAPI ECS backend data.
Supports any type of enum through a provider-based architecture.

This package provides:
- Generic enum provider interfaces
- Built-in providers for spirits, styles, and traits
- Custom enum provider support
- Backend data provider adapters
- Full backward compatibility
"""

from .src.backend_adapter import MCPBackendAdapter
from .src.dynamic_enum_service import DynamicEnumService, dynamic_enum_service
from .src.enum_implementations import (
    CustomEnumProvider,
    SpiritEnumProvider,
    StyleEnumProvider,
    TraitEnumProvider,
)
from .src.enum_provider import (
    EnumDataProvider,
    EnumProvider,
    MetadataEnumProvider,
    WeightedEnumProvider,
)

__version__ = "2.0.0"
__all__ = [
    "DynamicEnumService",
    "dynamic_enum_service",
    "EnumProvider",
    "EnumDataProvider",
    "WeightedEnumProvider",
    "MetadataEnumProvider",
    "SpiritEnumProvider",
    "StyleEnumProvider",
    "TraitEnumProvider",
    "CustomEnumProvider",
    "MCPBackendAdapter",
]
