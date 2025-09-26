"""Lazy Loading Registry for Reynard Backend

Registry and factory functions for the lazy loading system.
"""

import logging

from .lazy_loading_core import LazyPackageExport
from .lazy_loading_types import ExportType, ExportValidationLevel

logger = logging.getLogger("uvicorn")

# Global registry for lazy exports
_export_registry: dict[str, LazyPackageExport] = {}


def create_lazy_export(
    package_name: str,
    import_name: str,
    export_type: ExportType = ExportType.MODULE,
    validation_level: ExportValidationLevel = ExportValidationLevel.BASIC,
    dependencies: list[str] | None = None,
) -> LazyPackageExport:
    """Create a new lazy export and register it.

    Args:
        package_name: Name of the package
        import_name: Import name for the module
        export_type: Type of export
        validation_level: Validation level
        dependencies: List of dependency package names

    Returns:
        LazyPackageExport instance

    """
    if package_name in _export_registry:
        logger.warning(
            f"Package {package_name} already registered, returning existing export",
        )
        return _export_registry[package_name]

    export = LazyPackageExport(
        package_name=package_name,
        import_name=import_name,
        export_type=export_type,
        validation_level=validation_level,
        dependencies=dependencies,
    )

    _export_registry[package_name] = export
    logger.info(f"Created lazy export for {package_name}")

    return export


def get_lazy_export(package_name: str) -> LazyPackageExport | None:
    """Get a lazy export by package name.

    Args:
        package_name: Name of the package

    Returns:
        LazyPackageExport instance or None if not found

    """
    return _export_registry.get(package_name)


def clear_export_registry():
    """Clear all exports from the registry."""
    global _export_registry

    # Unload all exports before clearing
    for export in _export_registry.values():
        export.unload()

    _export_registry.clear()
    logger.info("Cleared export registry")


def get_all_exports() -> dict[str, LazyPackageExport]:
    """Get all registered exports."""
    return _export_registry.copy()


def get_export_count() -> int:
    """Get the number of registered exports."""
    return len(_export_registry)


# ML Package convenience exports
ml_packages = {
    "torch": create_lazy_export("torch", "torch", ExportType.MODULE),
    "transformers": create_lazy_export(
        "transformers",
        "transformers",
        ExportType.MODULE,
    ),
    "numpy": create_lazy_export("numpy", "numpy", ExportType.MODULE),
    "pandas": create_lazy_export("pandas", "pandas", ExportType.MODULE),
    "scikit_learn": create_lazy_export("scikit_learn", "sklearn", ExportType.MODULE),
    "pillow": create_lazy_export("pillow", "PIL", ExportType.MODULE),
    "opencv": create_lazy_export("opencv", "cv2", ExportType.MODULE),
    "matplotlib": create_lazy_export("matplotlib", "matplotlib", ExportType.MODULE),
    "seaborn": create_lazy_export("seaborn", "seaborn", ExportType.MODULE),
    "plotly": create_lazy_export("plotly", "plotly", ExportType.MODULE),
    "requests": create_lazy_export("requests", "requests", ExportType.MODULE),
    "aiohttp": create_lazy_export("aiohttp", "aiohttp", ExportType.MODULE),
    "fastapi": create_lazy_export("fastapi", "fastapi", ExportType.MODULE),
    "uvicorn": create_lazy_export("uvicorn", "uvicorn", ExportType.MODULE),
    "pydantic": create_lazy_export("pydantic", "pydantic", ExportType.MODULE),
}


class LazyLoadingSystem:
    """Main lazy loading system that manages all exports."""

    def __init__(self):
        self._exports = _export_registry
        self._ml_packages = ml_packages

    def get_export(self, package_name: str) -> LazyPackageExport | None:
        """Get a lazy export by package name."""
        return get_lazy_export(package_name)

    def create_export(
        self,
        package_name: str,
        import_name: str,
        export_type: ExportType = ExportType.MODULE,
        validation_level: ExportValidationLevel = ExportValidationLevel.BASIC,
        dependencies: list[str] | None = None,
    ) -> LazyPackageExport:
        """Create a new lazy export."""
        return create_lazy_export(
            package_name,
            import_name,
            export_type,
            validation_level,
            dependencies,
        )

    def get_all_exports(self) -> dict[str, LazyPackageExport]:
        """Get all registered exports."""
        return get_all_exports()

    def clear_all_exports(self):
        """Clear all exports from the registry."""
        clear_export_registry()

    def get_ml_packages(self) -> dict[str, LazyPackageExport]:
        """Get ML package exports."""
        return self._ml_packages.copy()

    def get_system_stats(self) -> dict[str, any]:
        """Get system statistics."""
        total_exports = len(self._exports)
        loaded_exports = sum(
            1 for export in self._exports.values() if export.is_loaded()
        )

        return {
            "total_exports": total_exports,
            "loaded_exports": loaded_exports,
            "unloaded_exports": total_exports - loaded_exports,
            "ml_packages_count": len(self._ml_packages),
        }


# Global lazy loading system instance
_lazy_loading_system: LazyLoadingSystem | None = None


def get_lazy_loading_system() -> LazyLoadingSystem:
    """Get the global lazy loading system instance."""
    global _lazy_loading_system

    if _lazy_loading_system is None:
        _lazy_loading_system = LazyLoadingSystem()

    return _lazy_loading_system
