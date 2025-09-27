"""🦊 Conditional Lazy Loading Registry
====================================

Conditional lazy loading system that respects environment variable settings.
Only creates lazy exports for packages that are actually enabled.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import os
from typing import Dict, Any

from .lazy_loading_core import LazyPackageExport
from .lazy_loading_types import ExportType, ExportValidationLevel

logger = logging.getLogger("uvicorn")

# Global registry for conditional lazy exports
_conditional_export_registry: Dict[str, LazyPackageExport] = {}


def is_package_enabled(package_name: str) -> bool:
    """Check if a package is enabled based on environment variables.
    
    Args:
        package_name: Name of the package to check
        
    Returns:
        True if package is enabled, False otherwise
    """
    # Map package names to their environment variable names
    env_var_map = {
        "numpy": "NUMPY_ENABLED",
        "pandas": "PANDAS_ENABLED", 
        "torch": "PYTORCH_ENABLED",
        "transformers": "TRANSFORMERS_ENABLED",
        "scikit_learn": "SCIKIT_LEARN_ENABLED",
        "pillow": "PILLOW_ENABLED",
        "opencv": "OPENCV_ENABLED",
        "matplotlib": "MATPLOTLIB_ENABLED",
        "seaborn": "SEABORN_ENABLED",
        "plotly": "PLOTLY_ENABLED",
        "sentence_transformers": "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED",
    }
    
    env_var = env_var_map.get(package_name)
    if not env_var:
        # If no specific env var, assume enabled (for core packages)
        return True
    
    # Check environment variable
    enabled = os.getenv(env_var, "false").lower() == "true"
    logger.debug(f"Package {package_name} enabled: {enabled} (env: {env_var}={os.getenv(env_var)})")
    return enabled


def create_conditional_lazy_export(
    package_name: str,
    import_name: str,
    export_type: ExportType = ExportType.MODULE,
    validation_level: ExportValidationLevel = ExportValidationLevel.BASIC,
    dependencies: list[str] | None = None,
) -> LazyPackageExport | None:
    """Create a lazy export only if the package is enabled.
    
    Args:
        package_name: Name of the package
        import_name: Import name for the module
        export_type: Type of export
        validation_level: Validation level
        dependencies: List of dependency package names
        
    Returns:
        LazyPackageExport instance if enabled, None otherwise
    """
    if not is_package_enabled(package_name):
        logger.info(f"Package {package_name} is disabled, skipping lazy export creation")
        return None
    
    if package_name in _conditional_export_registry:
        logger.warning(f"Package {package_name} already registered, returning existing export")
        return _conditional_export_registry[package_name]
    
    from .lazy_loading_registry import create_lazy_export
    
    export = create_lazy_export(
        package_name=package_name,
        import_name=import_name,
        export_type=export_type,
        validation_level=validation_level,
        dependencies=dependencies,
    )
    
    _conditional_export_registry[package_name] = export
    logger.info(f"Created conditional lazy export for {package_name}")
    
    return export


def get_conditional_lazy_export(package_name: str) -> LazyPackageExport | None:
    """Get a conditional lazy export by package name.
    
    Args:
        package_name: Name of the package
        
    Returns:
        LazyPackageExport instance or None if not found
    """
    return _conditional_export_registry.get(package_name)


def clear_conditional_export_registry():
    """Clear all conditional exports from the registry."""
    global _conditional_export_registry
    
    # Unload all exports before clearing
    for export in _conditional_export_registry.values():
        export.unload()
    
    _conditional_export_registry.clear()
    logger.info("Cleared conditional export registry")


def get_all_conditional_exports() -> Dict[str, LazyPackageExport]:
    """Get all registered conditional exports."""
    return _conditional_export_registry.copy()


def get_conditional_export_count() -> int:
    """Get the number of registered conditional exports."""
    return len(_conditional_export_registry)


# Conditional ML Package exports - only create if enabled
def create_conditional_ml_packages() -> Dict[str, LazyPackageExport]:
    """Create conditional ML package exports based on environment variables."""
    ml_packages = {}
    
    # Define ML packages with their import names
    ml_package_configs = {
        "torch": "torch",
        "transformers": "transformers", 
        "numpy": "numpy",
        "pandas": "pandas",
        "scikit_learn": "sklearn",
        "pillow": "PIL",
        "opencv": "cv2",
        "matplotlib": "matplotlib",
        "seaborn": "seaborn",
        "plotly": "plotly",
        "sentence_transformers": "sentence_transformers",
    }
    
    for package_name, import_name in ml_package_configs.items():
        export = create_conditional_lazy_export(
            package_name=package_name,
            import_name=import_name,
            export_type=ExportType.MODULE,
        )
        if export:
            ml_packages[package_name] = export
    
    logger.info(f"Created {len(ml_packages)} conditional ML package exports")
    return ml_packages


# Core packages that are always enabled
def create_core_packages() -> Dict[str, LazyPackageExport]:
    """Create core package exports that are always enabled."""
    from .lazy_loading_registry import create_lazy_export
    
    core_packages = {
        "requests": create_lazy_export("requests", "requests", ExportType.MODULE),
        "aiohttp": create_lazy_export("aiohttp", "aiohttp", ExportType.MODULE),
        "fastapi": create_lazy_export("fastapi", "fastapi", ExportType.MODULE),
        "uvicorn": create_lazy_export("uvicorn", "uvicorn", ExportType.MODULE),
        "pydantic": create_lazy_export("pydantic", "pydantic", ExportType.MODULE),
    }
    
    logger.info(f"Created {len(core_packages)} core package exports")
    return core_packages


class ConditionalLazyLoadingSystem:
    """Conditional lazy loading system that respects environment settings."""
    
    def __init__(self):
        """Initialize the conditional lazy loading system."""
        self._conditional_exports = _conditional_export_registry
        self._ml_packages = create_conditional_ml_packages()
        self._core_packages = create_core_packages()
    
    def get_export(self, package_name: str) -> LazyPackageExport | None:
        """Get a lazy export by package name."""
        return get_conditional_lazy_export(package_name)
    
    def get_all_exports(self) -> Dict[str, LazyPackageExport]:
        """Get all registered exports."""
        return get_all_conditional_exports()
    
    def get_ml_packages(self) -> Dict[str, LazyPackageExport]:
        """Get ML package exports."""
        return self._ml_packages.copy()
    
    def get_core_packages(self) -> Dict[str, LazyPackageExport]:
        """Get core package exports."""
        return self._core_packages.copy()
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics."""
        total_exports = len(self._conditional_exports)
        loaded_exports = sum(
            1 for export in self._conditional_exports.values() if export.is_loaded()
        )
        
        return {
            "total_conditional_exports": total_exports,
            "loaded_conditional_exports": loaded_exports,
            "unloaded_conditional_exports": total_exports - loaded_exports,
            "ml_packages_count": len(self._ml_packages),
            "core_packages_count": len(self._core_packages),
            "enabled_packages": list(self._conditional_exports.keys()),
        }


# Global conditional lazy loading system instance
_conditional_lazy_loading_system: ConditionalLazyLoadingSystem | None = None


def get_conditional_lazy_loading_system() -> ConditionalLazyLoadingSystem:
    """Get the global conditional lazy loading system instance."""
    global _conditional_lazy_loading_system
    
    if _conditional_lazy_loading_system is None:
        _conditional_lazy_loading_system = ConditionalLazyLoadingSystem()
    
    return _conditional_lazy_loading_system
