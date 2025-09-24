"""Tests for the lazy_loading_validation module."""

from types import ModuleType
from unittest.mock import MagicMock, patch

import pytest

from app.utils.lazy_loading_types import (
    ExportType,
    ExportValidationError,
    ExportValidationLevel,
)
from app.utils.lazy_loading_validation import LazyLoadingValidator


class TestLazyLoadingValidator:
    """Test cases for LazyLoadingValidator class."""

    def test_validate_export_none_validation_level(self):
        """Test validate_export with NONE validation level."""
        # Should not raise any exceptions
        LazyLoadingValidator.validate_export(
            None, "test_package", ExportType.MODULE, ExportValidationLevel.NONE,
        )

    def test_validate_export_none_export_basic_validation(self):
        """Test validate_export with None export and BASIC validation level."""
        with pytest.raises(ExportValidationError) as exc_info:
            LazyLoadingValidator.validate_export(
                None, "test_package", ExportType.MODULE, ExportValidationLevel.BASIC,
            )

        assert exc_info.value.package_name == "test_package"
        assert exc_info.value.validation_level == ExportValidationLevel.BASIC
        assert "Export is None" in str(exc_info.value)

    def test_validate_export_none_export_strict_validation(self):
        """Test validate_export with None export and STRICT validation level."""
        with pytest.raises(ExportValidationError) as exc_info:
            LazyLoadingValidator.validate_export(
                None, "test_package", ExportType.MODULE, ExportValidationLevel.STRICT,
            )

        assert exc_info.value.package_name == "test_package"
        assert exc_info.value.validation_level == ExportValidationLevel.STRICT
        assert "Export is None" in str(exc_info.value)

    def test_validate_export_none_export_comprehensive_validation(self):
        """Test validate_export with None export and COMPREHENSIVE validation level."""
        with pytest.raises(ExportValidationError) as exc_info:
            LazyLoadingValidator.validate_export(
                None,
                "test_package",
                ExportType.MODULE,
                ExportValidationLevel.COMPREHENSIVE,
            )

        assert exc_info.value.package_name == "test_package"
        assert exc_info.value.validation_level == ExportValidationLevel.COMPREHENSIVE
        assert "Export is None" in str(exc_info.value)

    def test_validate_export_valid_module_basic_validation(self):
        """Test validate_export with valid module and BASIC validation level."""
        mock_module = MagicMock(spec=ModuleType)

        # Should not raise any exceptions
        LazyLoadingValidator.validate_export(
            mock_module, "test_package", ExportType.MODULE, ExportValidationLevel.BASIC,
        )

    def test_validate_export_valid_module_strict_validation(self):
        """Test validate_export with valid module and STRICT validation level."""
        mock_module = MagicMock(spec=ModuleType)

        # Should not raise any exceptions
        LazyLoadingValidator.validate_export(
            mock_module, "test_package", ExportType.MODULE, ExportValidationLevel.STRICT,
        )

    def test_validate_export_invalid_type_strict_validation(self):
        """Test validate_export with invalid type and STRICT validation level."""
        invalid_export = "not_a_module"

        with pytest.raises(ExportValidationError) as exc_info:
            LazyLoadingValidator.validate_export(
                invalid_export,
                "test_package",
                ExportType.MODULE,
                ExportValidationLevel.STRICT,
            )

        assert exc_info.value.package_name == "test_package"
        assert exc_info.value.validation_level == ExportValidationLevel.STRICT
        assert "Expected module, got" in str(exc_info.value)
        assert "str" in str(exc_info.value)

    def test_validate_export_invalid_type_comprehensive_validation(self):
        """Test validate_export with invalid type and COMPREHENSIVE validation level."""
        invalid_export = "not_a_module"

        with pytest.raises(ExportValidationError) as exc_info:
            LazyLoadingValidator.validate_export(
                invalid_export,
                "test_package",
                ExportType.MODULE,
                ExportValidationLevel.COMPREHENSIVE,
            )

        assert exc_info.value.package_name == "test_package"
        assert exc_info.value.validation_level == ExportValidationLevel.COMPREHENSIVE
        assert "Expected module, got" in str(exc_info.value)

    def test_validate_export_valid_module_comprehensive_validation(self):
        """Test validate_export with valid module and COMPREHENSIVE validation level."""
        mock_module = MagicMock(spec=ModuleType)
        mock_module.__name__ = "test_module"

        with patch("app.utils.lazy_loading_validation.logger") as mock_logger:
            # Should not raise any exceptions
            LazyLoadingValidator.validate_export(
                mock_module,
                "test_package",
                ExportType.MODULE,
                ExportValidationLevel.COMPREHENSIVE,
            )

            # Should log debug messages
            mock_logger.debug.assert_called()
            debug_calls = [call[0][0] for call in mock_logger.debug.call_args_list]
            assert any("has __name__: test_module" in call for call in debug_calls)

    def test_validate_export_callable_comprehensive_validation(self):
        """Test validate_export with callable export and COMPREHENSIVE validation level."""
        mock_callable = MagicMock()
        mock_callable.__call__ = MagicMock()

        with patch("app.utils.lazy_loading_validation.logger") as mock_logger:
            # Should not raise any exceptions
            LazyLoadingValidator.validate_export(
                mock_callable,
                "test_package",
                ExportType.FUNCTION,
                ExportValidationLevel.COMPREHENSIVE,
            )

            # Should log debug messages
            mock_logger.debug.assert_called()
            debug_calls = [call[0][0] for call in mock_logger.debug.call_args_list]
            assert any("is callable" in call for call in debug_calls)

    def test_validate_export_comprehensive_validation_exception(self):
        """Test validate_export with COMPREHENSIVE validation that raises an exception."""
        mock_export = MagicMock()
        # Make hasattr raise an exception
        mock_export.__class__.__getattribute__ = MagicMock(
            side_effect=Exception("Test exception"),
        )

        with patch("app.utils.lazy_loading_validation.logger") as mock_logger:
            # Should not raise any exceptions (comprehensive validation is non-fatal)
            LazyLoadingValidator.validate_export(
                mock_export,
                "test_package",
                ExportType.FUNCTION,
                ExportValidationLevel.COMPREHENSIVE,
            )

            # Should log warning about validation failure
            mock_logger.warning.assert_called_once()
            warning_call = mock_logger.warning.call_args[0][0]
            assert "Comprehensive validation failed for test_package" in warning_call
            assert "Test exception" in warning_call

    def test_validate_export_non_module_type_basic_validation(self):
        """Test validate_export with non-module type and BASIC validation level."""
        # BASIC validation should not check types, only that export is not None
        LazyLoadingValidator.validate_export(
            "not_a_module",
            "test_package",
            ExportType.MODULE,
            ExportValidationLevel.BASIC,
        )

    def test_validate_export_different_export_types(self):
        """Test validate_export with different export types."""
        mock_module = MagicMock(spec=ModuleType)

        # Test with different export types - should not raise for valid module
        for export_type in ExportType:
            LazyLoadingValidator.validate_export(
                mock_module, "test_package", export_type, ExportValidationLevel.STRICT,
            )

    def test_comprehensive_validation_private_method(self):
        """Test the private _comprehensive_validation method directly."""
        mock_export = MagicMock()
        mock_export.__name__ = "test_export"

        with patch("app.utils.lazy_loading_validation.logger") as mock_logger:
            # Should not raise any exceptions
            LazyLoadingValidator._comprehensive_validation(mock_export, "test_package")

            # Should log debug messages
            mock_logger.debug.assert_called()
            debug_calls = [call[0][0] for call in mock_logger.debug.call_args_list]
            assert any("has __name__: test_export" in call for call in debug_calls)

    def test_comprehensive_validation_no_name_attribute(self):
        """Test _comprehensive_validation with export that has no __name__ attribute."""
        mock_export = MagicMock()
        # Remove __name__ attribute
        del mock_export.__name__

        with patch("app.utils.lazy_loading_validation.logger") as mock_logger:
            # Should not raise any exceptions
            LazyLoadingValidator._comprehensive_validation(mock_export, "test_package")

            # Should not log about __name__ since it doesn't exist
            debug_calls = [call[0][0] for call in mock_logger.debug.call_args_list]
            assert not any("has __name__" in call for call in debug_calls)

    def test_comprehensive_validation_no_call_attribute(self):
        """Test _comprehensive_validation with export that has no __call__ attribute."""

        # Create a simple object without __call__ attribute
        class NonCallableExport:
            def __init__(self):
                self.name = "test_export"

        mock_export = NonCallableExport()

        with patch("app.utils.lazy_loading_validation.logger") as mock_logger:
            # Should not raise any exceptions
            LazyLoadingValidator._comprehensive_validation(mock_export, "test_package")

            # Should not log about being callable since it doesn't have __call__
            debug_calls = [call[0][0] for call in mock_logger.debug.call_args_list]
            assert not any("is callable" in call for call in debug_calls)
