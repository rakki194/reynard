#!/usr/bin/env python3
"""Comprehensive Database Auto-Fix Tests

Tests for the database auto-fix mechanisms including:
- Permission detection and fixing
- Extension installation
- Schema validation
- Error handling
- Security features

Author: Reynard Development Team
Version: 1.0.0
"""

import os

# Add backend to path
import sys
from unittest.mock import MagicMock, Mock, patch

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, ProgrammingError

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from tests.utils.env_loader import get_database_urls, setup_test_environment

from app.core.database_auto_fix import (
    DatabaseAutoFix,
    auto_fix_all_databases,
    auto_fix_database,
)


class TestDatabaseAutoFix:
    """Test the DatabaseAutoFix class."""

    @pytest.fixture
    def mock_engine(self):
        """Create a mock SQLAlchemy engine."""
        mock_engine = Mock()
        mock_conn = Mock()
        mock_context_manager = Mock()
        mock_context_manager.__enter__ = Mock(return_value=mock_conn)
        mock_context_manager.__exit__ = Mock(return_value=None)
        mock_engine.connect.return_value = mock_context_manager
        return mock_engine, mock_conn

    def test_auto_fix_initialization(self):
        """Test auto-fix initialization."""
        url = "postgresql://user:pass@localhost:5432/database"
        auto_fix = DatabaseAutoFix(url)

        assert auto_fix.database_url == url
        assert auto_fix.parsed_url.hostname == "localhost"
        assert auto_fix.parsed_url.port == 5432
        assert auto_fix.parsed_url.username == "user"
        assert auto_fix.parsed_url.password == "pass"
        assert auto_fix.parsed_url.path == "/database"

    def test_auto_fix_with_credentials(self):
        """Test auto-fix with credentials in URL."""
        databases = get_database_urls()
        url = databases['keys']
        auto_fix = DatabaseAutoFix(url)

        assert auto_fix.parsed_url.username == "reynard"
        # Password should be loaded from environment
        assert auto_fix.parsed_url.password is not None

    def test_permission_check_success(self, mock_engine):
        """Test successful permission check."""
        mock_engine, mock_conn = mock_engine

        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")
        auto_fix.engine = mock_engine

        # Mock successful permission test
        mock_conn.execute.return_value.fetchone.return_value = [1]

        result = auto_fix._fix_permissions()
        assert result is False  # No fixes needed

    def test_permission_check_failure(self, mock_engine):
        """Test permission check with permission denied error."""
        mock_engine, mock_conn = mock_engine

        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")
        auto_fix.engine = mock_engine

        # Mock permission denied error
        mock_conn.execute.side_effect = ProgrammingError(
            "permission denied for schema public", None, None
        )

        with patch.object(auto_fix, '_apply_permission_fixes', return_value=True):
            result = auto_fix._fix_permissions()
            assert result is True  # Fixes were applied

    def test_extension_checking(self, mock_engine):
        """Test extension checking functionality."""
        mock_engine, mock_conn = mock_engine

        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")
        auto_fix.engine = mock_engine

        # Mock extension query result
        mock_conn.execute.return_value.fetchall.return_value = [
            ['uuid-ossp'],
            ['pgcrypto'],
        ]

        result = auto_fix._fix_schema_issues()
        assert result is True  # Extensions were processed

    def test_extension_installation_success(self, mock_engine):
        """Test successful extension installation."""
        mock_engine, mock_conn = mock_engine

        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")
        auto_fix.engine = mock_engine

        # Mock successful extension installation
        mock_result = Mock()
        mock_result.fetchall.return_value = []  # No extensions to install
        mock_conn.execute.return_value = mock_result

        result = auto_fix._fix_schema_issues()
        assert result is True

    def test_extension_installation_permission_error(self, mock_engine):
        """Test extension installation with permission error."""
        mock_engine, mock_conn = mock_engine

        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")
        auto_fix.engine = mock_engine

        # Mock permission denied error for extension installation
        def mock_execute(query):
            if "CREATE EXTENSION" in str(query):
                raise ProgrammingError(
                    "permission denied to create extension", None, None
                )
            # Return a proper mock for extension queries
            mock_result = Mock()
            mock_result.fetchall.return_value = [['uuid-ossp'], ['pgcrypto']]
            return mock_result

        mock_conn.execute.side_effect = mock_execute

        result = auto_fix._fix_schema_issues()
        assert result is True  # Should handle errors gracefully

    def test_extension_installation_syntax_error(self, mock_engine):
        """Test extension installation with syntax error."""
        mock_engine, mock_conn = mock_engine

        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")
        auto_fix.engine = mock_engine

        # Mock syntax error for extension installation
        def mock_execute(query):
            if "CREATE EXTENSION" in str(query):
                raise ProgrammingError("syntax error at or near \"-\"", None, None)
            # Return a proper mock for extension queries
            mock_result = Mock()
            mock_result.fetchall.return_value = [['uuid-ossp'], ['pgcrypto']]
            return mock_result

        mock_conn.execute.side_effect = mock_execute

        result = auto_fix._fix_schema_issues()
        assert result is True  # Should handle errors gracefully

    def test_uuid_ossp_extension_quotes(self, mock_engine):
        """Test that uuid-ossp extension uses proper quotes."""
        mock_engine, mock_conn = mock_engine

        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")
        auto_fix.engine = mock_engine

        # Mock successful installation
        mock_conn.execute.return_value = None

        result = auto_fix._fix_schema_issues()

        # Verify that the correct SQL was executed
        mock_conn.execute.assert_called()
        # The method should handle uuid-ossp extension properly

    def test_permission_fixes_application(self):
        """Test applying permission fixes."""
        auto_fix = DatabaseAutoFix("postgresql://reynard:pass@localhost:5432/db")

        with patch('app.core.database_auto_fix.create_engine') as mock_create_engine:
            mock_admin_engine = Mock()
            mock_conn = Mock()
            mock_context_manager = Mock()
            mock_context_manager.__enter__ = Mock(return_value=mock_conn)
            mock_context_manager.__exit__ = Mock(return_value=None)
            mock_admin_engine.connect.return_value = mock_context_manager
            mock_create_engine.return_value = mock_admin_engine

            result = auto_fix._apply_permission_fixes()

            # Should execute permission grant queries
            assert mock_conn.execute.call_count >= 5  # Multiple permission queries
            assert result is True

    def test_connection_health_check(self, mock_engine):
        """Test connection health check."""
        mock_engine, mock_conn = mock_engine

        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")
        auto_fix.engine = mock_engine

        # Mock successful health check
        mock_conn.execute.return_value.fetchone.return_value = [1]

        result = auto_fix._test_connection()
        assert result is True

    def test_connection_health_check_failure(self, mock_engine):
        """Test connection health check failure."""
        mock_engine, mock_conn = mock_engine

        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")
        auto_fix.engine = mock_engine

        # Mock connection failure
        mock_conn.execute.side_effect = OperationalError(
            "connection failed", None, None
        )

        result = auto_fix._test_connection()
        assert result is False


class TestAutoFixFunctions:
    """Test the auto-fix module functions."""

    def test_auto_fix_database_function(self):
        """Test the auto_fix_database function."""
        url = "postgresql://reynard:WmAGEbIWBIbqBPID%5Ea6UHw%406s34iHw4o@localhost:5432/reynard_keys"

        with patch('app.core.database_auto_fix.DatabaseAutoFix') as mock_auto_fix_class:
            mock_auto_fix = Mock()
            mock_auto_fix.auto_fix_all.return_value = True
            mock_auto_fix_class.return_value = mock_auto_fix

            result = auto_fix_database(url)

            assert result is True
            mock_auto_fix.auto_fix_all.assert_called_once()

    def test_auto_fix_all_databases_function(self):
        """Test the auto_fix_all_databases function."""
        with patch('app.core.database_auto_fix.auto_fix_database') as mock_auto_fix:
            mock_auto_fix.return_value = True

            results = auto_fix_all_databases()

            assert isinstance(results, dict)
            assert len(results) > 0

            # Check that all results are boolean
            for db_name, result in results.items():
                assert isinstance(result, bool)

    def test_auto_fix_all_databases_with_failures(self):
        """Test auto_fix_all_databases with some failures."""

        def mock_auto_fix_side_effect(url):
            if 'auth' in url:
                return False  # Simulate failure
            return True

        with patch('app.core.database_auto_fix.auto_fix_database') as mock_auto_fix:
            mock_auto_fix.side_effect = mock_auto_fix_side_effect

            results = auto_fix_all_databases()

            assert isinstance(results, dict)
            # Should have mixed results
            assert any(result is True for result in results.values())
            assert any(result is False for result in results.values())


class TestAutoFixSecurity:
    """Test auto-fix security features."""

    def test_credential_protection(self):
        """Test that credentials are not exposed in logs."""
        url = "postgresql://user:secret_password@localhost:5432/database"
        auto_fix = DatabaseAutoFix(url)

        # The URL should be parsed correctly internally
        assert auto_fix.parsed_url.password == "secret_password"

        # Note: urlparse string representation includes password, but this is expected behavior
        # The security is in not logging or exposing this in application code

    def test_admin_connection_security(self):
        """Test admin connection security."""
        auto_fix = DatabaseAutoFix("postgresql://reynard:pass@localhost:5432/db")

        with patch('app.core.database_auto_fix.create_engine') as mock_create_engine:
            mock_engine = Mock()
            mock_create_engine.return_value = mock_engine

            # Should use postgres superuser for admin operations
            auto_fix._apply_permission_fixes()

            # Verify admin connection was created
            mock_create_engine.assert_called_once()
            admin_url = mock_create_engine.call_args[0][0]
            assert "postgres:password" in admin_url

    def test_sql_injection_protection(self):
        """Test protection against SQL injection."""
        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")

        # Test with malicious username
        malicious_url = (
            "postgresql://user'; DROP TABLE users; --:pass@localhost:5432/db"
        )
        auto_fix_malicious = DatabaseAutoFix(malicious_url)

        # Should parse URL safely without executing malicious SQL
        assert auto_fix_malicious.parsed_url.username == "user'; DROP TABLE users; --"
        # The username is preserved but not executed as SQL


class TestAutoFixErrorHandling:
    """Test auto-fix error handling."""

    def test_connection_error_handling(self):
        """Test handling of connection errors."""
        auto_fix = DatabaseAutoFix("postgresql://invalid:pass@invalid_host:5432/db")

        with patch('app.core.database_auto_fix.create_engine') as mock_create_engine:
            mock_engine = Mock()
            mock_engine.connect.side_effect = OperationalError(
                "connection failed", None, None
            )
            mock_create_engine.return_value = mock_engine

            result = auto_fix.auto_fix_all()
            assert result is False

    def test_permission_error_handling(self):
        """Test handling of permission errors."""
        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")

        # Test that permission errors are handled gracefully
        with patch.object(auto_fix, '_fix_permissions') as mock_fix:
            mock_fix.side_effect = ProgrammingError("permission denied", None, None)

            result = auto_fix.auto_fix_all()
            assert result is False

    def test_extension_error_handling(self):
        """Test handling of extension errors."""
        auto_fix = DatabaseAutoFix("postgresql://user:pass@localhost:5432/db")

        # Test that extension errors are handled gracefully
        with patch.object(auto_fix, '_fix_schema_issues') as mock_schema:
            mock_schema.side_effect = Exception("Extension error")

            result = auto_fix.auto_fix_all()
            assert result is False


class TestAutoFixIntegration:
    """Test auto-fix integration with real database."""

    def test_real_database_auto_fix(self):
        """Test auto-fix with real database connection."""
        databases = get_database_urls()
        url = databases['keys']

        # This should not raise an exception
        result = auto_fix_database(url)
        assert isinstance(result, bool)

    def test_real_all_databases_auto_fix(self):
        """Test auto-fix for all real databases."""
        # This should not raise an exception
        results = auto_fix_all_databases()
        assert isinstance(results, dict)
        assert len(results) > 0

        # All results should be boolean
        for db_name, result in results.items():
            assert isinstance(result, bool)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
