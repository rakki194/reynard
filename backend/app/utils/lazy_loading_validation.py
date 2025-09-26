"""Lazy Loading Validation for Reynard Backend

Validation logic for the lazy loading system.
"""

import logging
from types import ModuleType

from .lazy_loading_types import ExportType, ExportValidationError, ExportValidationLevel

logger = logging.getLogger("uvicorn")


class LazyLoadingValidator:
    """Validator for lazy loading exports."""

    @staticmethod
    def validate_export(
        export: any,
        package_name: str,
        export_type: ExportType,
        validation_level: ExportValidationLevel,
    ):
        """Validate the loaded export based on validation level."""
        if validation_level == ExportValidationLevel.NONE:
            return

        if export is None:
            raise ExportValidationError(
                "Export is None",
                package_name,
                validation_level,
            )

        if validation_level in [
            ExportValidationLevel.BASIC,
            ExportValidationLevel.STRICT,
            ExportValidationLevel.COMPREHENSIVE,
        ]:
            # Basic validation - check if export is not None
            if export is None:
                raise ExportValidationError(
                    "Export is None",
                    package_name,
                    validation_level,
                )

        if validation_level in [
            ExportValidationLevel.STRICT,
            ExportValidationLevel.COMPREHENSIVE,
        ]:
            # Strict validation - check type consistency
            if export_type == ExportType.MODULE and not isinstance(export, ModuleType):
                raise ExportValidationError(
                    f"Expected module, got {type(export)}",
                    package_name,
                    validation_level,
                )

        if validation_level == ExportValidationLevel.COMPREHENSIVE:
            # Comprehensive validation - additional checks
            LazyLoadingValidator._comprehensive_validation(export, package_name)

    @staticmethod
    def _comprehensive_validation(export: any, package_name: str):
        """Perform comprehensive validation checks."""
        try:
            # Check if export has expected attributes
            if hasattr(export, "__name__"):
                logger.debug(f"Export {package_name} has __name__: {export.__name__}")

            # Check if export is callable when expected
            if callable(export):
                logger.debug(f"Export {package_name} is callable")

        except Exception as e:
            logger.warning(f"Comprehensive validation failed for {package_name}: {e}")
            # Don't raise here as this is just additional validation
