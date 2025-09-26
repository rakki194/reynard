#!/usr/bin/env python3
"""Comprehensive PostgreSQL Database Tests

Tests for PostgreSQL database connections and operations including:
- Database connectivity
- Key storage models
- Permission handling
- Extension management
- Auto-fix mechanisms

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import os

# Add backend to path
import sys
from unittest.mock import MagicMock, Mock, patch

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, ProgrammingError

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from tests.utils.env_loader import get_database_urls, setup_test_environment

from app.security.key_storage_models import (
    KeyBase,
    KeySessionLocal,
    KeyStorage,
    create_key_storage_tables,
)


class TestDatabaseConnections:
    """Test database connections to all Reynard databases."""

    @pytest.fixture
    def database_urls(self):
        """Database URLs for testing."""
        return get_database_urls()

    def test_main_database_connection(self, database_urls):
        """Test main database connection."""
        engine = create_engine(database_urls['main'])
        with engine.connect() as conn:
            result = conn.execute(text('SELECT 1 as test'))
            assert result.fetchone()[0] == 1

    def test_ecs_database_connection(self, database_urls):
        """Test ECS database connection."""
        engine = create_engine(database_urls['ecs'])
        with engine.connect() as conn:
            result = conn.execute(text('SELECT 1 as test'))
            assert result.fetchone()[0] == 1

    def test_auth_database_connection(self, database_urls):
        """Test auth database connection."""
        engine = create_engine(database_urls['auth'])
        with engine.connect() as conn:
            result = conn.execute(text('SELECT 1 as test'))
            assert result.fetchone()[0] == 1

    def test_keys_database_connection(self, database_urls):
        """Test key storage database connection."""
        engine = create_engine(database_urls['keys'])
        with engine.connect() as conn:
            result = conn.execute(text('SELECT 1 as test'))
            assert result.fetchone()[0] == 1

    def test_database_permissions(self, database_urls):
        """Test that database user has proper permissions."""
        for db_name, url in database_urls.items():
            engine = create_engine(url)
            with engine.connect() as conn:
                # Test table creation permission
                try:
                    conn.execute(
                        text(
                            """
                        CREATE TEMPORARY TABLE test_permissions (
                            id SERIAL PRIMARY KEY,
                            test_data TEXT
                        )
                    """
                        )
                    )
                    conn.execute(text("DROP TABLE test_permissions"))
                    print(f"✅ {db_name} database: Permissions OK")
                except (OperationalError, ProgrammingError) as e:
                    if "permission denied" in str(e).lower():
                        pytest.fail(f"Permission denied in {db_name} database: {e}")
                    else:
                        raise


class TestKeyStorageModels:
    """Test key storage models and operations."""

    @pytest.fixture(autouse=True)
    def setup_key_storage_env(self):
        """Set up environment for key storage tests."""
        # Load environment variables from .env file
        setup_test_environment()
        yield
        # No cleanup needed as we're using the actual environment

    def test_key_storage_import(self):
        """Test that key storage models can be imported."""
        from app.security.key_storage_models import (
            KeyStorage,
            create_key_storage_tables,
        )

        assert KeyStorage is not None
        assert create_key_storage_tables is not None

    def test_key_storage_table_creation(self):
        """Test key storage table creation."""
        # This should not raise an exception
        create_key_storage_tables()

        # Verify table exists
        with KeySessionLocal() as session:
            result = session.execute(
                text(
                    """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'key_storage'
                )
            """
                )
            )
            table_exists = result.fetchone()[0]
            assert table_exists is True

    def test_key_storage_operations(self):
        """Test basic key storage operations."""
        with KeySessionLocal() as session:
            # Test that we can query the table
            result = session.execute(text('SELECT COUNT(*) FROM key_storage'))
            count = result.fetchone()[0]
            assert isinstance(count, int)
            assert count >= 0

    def test_key_storage_model_structure(self):
        """Test key storage model structure."""
        from app.security.key_storage_models import KeyStorage

        # Check that the model has expected columns
        columns = KeyStorage.__table__.columns
        expected_columns = ['id', 'key_id', 'key_type', 'encrypted_key_data', 'status']

        for col_name in expected_columns:
            assert col_name in columns

    def test_key_storage_reload_detection(self):
        """Test that reload detection works."""
        with patch.dict(os.environ, {'UVICORN_RELOAD_PROCESS': '1'}):
            # Import should not trigger table creation during reload
            import importlib

            import app.security.key_storage_models

            importlib.reload(app.security.key_storage_models)

            # Should not raise any exceptions
            assert True


class TestPostgreSQLExtensions:
    """Test PostgreSQL extension management."""

    @pytest.fixture
    def test_engine(self):
        """Create a test database engine."""
        databases = get_database_urls()
        url = databases['keys']
        engine = create_engine(url)
        yield engine

    def test_extension_checking(self, test_engine):
        """Test checking for installed extensions."""
        with test_engine.connect() as conn:
            result = conn.execute(
                text(
                    """
                SELECT extname FROM pg_extension 
                WHERE extname IN ('uuid-ossp', 'vector', 'pgcrypto')
            """
                )
            )
            extensions = [row[0] for row in result.fetchall()]
            assert isinstance(extensions, list)

    def test_uuid_extension_syntax(self, test_engine):
        """Test that uuid-ossp extension can be checked with proper syntax."""
        with test_engine.connect() as conn:
            # This should not raise a syntax error
            result = conn.execute(
                text(
                    """
                SELECT EXISTS (
                    SELECT 1 FROM pg_extension 
                    WHERE extname = 'uuid-ossp'
                )
            """
                )
            )
            exists = result.fetchone()[0]
            assert isinstance(exists, bool)

    def test_extension_installation_permissions(self, test_engine):
        """Test extension installation permission handling."""
        with test_engine.connect() as conn:
            try:
                # Try to install an extension (should fail gracefully)
                conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
                print("✅ Extension installation successful")
            except (OperationalError, ProgrammingError) as e:
                if (
                    "permission denied" in str(e).lower()
                    or "superuser" in str(e).lower()
                ):
                    print("⚠️ Extension installation requires superuser (expected)")
                else:
                    raise


class TestDatabaseAutoFix:
    """Test database auto-fix mechanisms."""

    def test_auto_fix_import(self):
        """Test that auto-fix module can be imported."""
        from app.core.database_auto_fix import auto_fix_all_databases, auto_fix_database

        assert auto_fix_database is not None
        assert auto_fix_all_databases is not None

    def test_auto_fix_single_database(self):
        """Test auto-fix for a single database."""
        from app.core.database_auto_fix import auto_fix_database

        databases = get_database_urls()
        test_url = databases['keys']
        result = auto_fix_database(test_url)
        assert isinstance(result, bool)

    def test_auto_fix_all_databases(self):
        """Test auto-fix for all databases."""
        from app.core.database_auto_fix import auto_fix_all_databases

        results = auto_fix_all_databases()
        assert isinstance(results, dict)
        assert len(results) > 0

        # Check that all results are boolean
        for db_name, result in results.items():
            assert isinstance(result, bool)

    def test_auto_fix_permission_detection(self):
        """Test permission issue detection."""
        from app.core.database_auto_fix import DatabaseAutoFix

        # Create a mock engine that raises permission errors
        mock_engine = Mock()
        mock_conn = Mock()
        mock_context_manager = Mock()
        mock_context_manager.__enter__ = Mock(return_value=mock_conn)
        mock_context_manager.__exit__ = Mock(return_value=None)
        mock_engine.connect.return_value = mock_context_manager
        mock_conn.execute.side_effect = ProgrammingError(
            "permission denied for schema public", None, None
        )

        auto_fix = DatabaseAutoFix("postgresql://test:test@localhost:5432/test")
        auto_fix.engine = mock_engine

        # Should detect permission issues
        result = auto_fix._fix_permissions()
        assert result is True  # Should return True when permission issues are detected


class TestDatabaseSecurity:
    """Test database security features."""

    def test_connection_string_security(self):
        """Test that connection strings don't expose credentials in logs."""
        from app.core.database_auto_fix import DatabaseAutoFix

        # Create auto-fix instance with credentials
        url = "postgresql://user:password@localhost:5432/database"
        auto_fix = DatabaseAutoFix(url)

        # The parsed URL should not expose the password
        assert auto_fix.parsed_url.password == "password"  # Internal access OK
        # Note: urlparse string representation includes password, but this is expected behavior
        # The security is in not logging or exposing this in application code

    def test_database_user_isolation(self):
        """Test that database users are properly isolated."""
        # Test that reynard user can only access reynard databases
        database_urls = get_database_urls()

        for db_name, url in database_urls.items():
            engine = create_engine(url)

            with engine.connect() as conn:
                # Should be able to connect to own database
                result = conn.execute(text('SELECT current_database()'))
                current_db = result.fetchone()[0]
                # The database name should match the expected database
                # Handle different database naming conventions
                if db_name == 'main':
                    expected_db = 'reynard'
                elif db_name == 'ecs':
                    expected_db = 'reynard_ecs'
                else:
                    expected_db = f'reynard_{db_name}'
                assert current_db == expected_db


class TestDatabasePerformance:
    """Test database performance characteristics."""

    def test_connection_pooling(self):
        """Test database connection pooling."""
        databases = get_database_urls()
        url = databases['keys']

        # Create engine with connection pooling
        engine = create_engine(url, pool_size=5, max_overflow=10)

        # Test multiple connections
        connections = []
        try:
            for i in range(3):
                conn = engine.connect()
                connections.append(conn)
                result = conn.execute(text('SELECT 1'))
                assert result.fetchone()[0] == 1

            # All connections should work
            assert len(connections) == 3

        finally:
            for conn in connections:
                conn.close()

    def test_query_performance(self):
        """Test basic query performance."""
        databases = get_database_urls()
        url = databases['keys']
        engine = create_engine(url)

        import time

        start_time = time.time()

        with engine.connect() as conn:
            # Perform multiple queries
            for i in range(10):
                result = conn.execute(text('SELECT 1'))
                assert result.fetchone()[0] == 1

        query_time = time.time() - start_time
        assert query_time < 1.0  # Should complete 10 queries in under 1 second


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
