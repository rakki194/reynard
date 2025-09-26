"""Test Service Lifecycle Management

This module tests the complete service lifecycle including startup, health checks,
and graceful shutdown for all services in the Reynard backend.

Tests:
- Service initialization and registration
- Health check functionality
- Graceful shutdown procedures
- Resource cleanup verification
- Error handling during lifecycle operations
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.health_checks import (
    health_check_ai_service,
    health_check_rag,
    health_check_tts_service,
)
from app.core.lifespan_manager import lifespan
from app.core.service_registry import get_service_registry
from app.core.service_shutdown import (
    shutdown_ai_service,
    shutdown_rag_service,
    shutdown_tts_service,
)


class TestServiceLifecycle:
    """Test suite for service lifecycle management."""

    @pytest.fixture
    async def mock_app(self):
        """Create a mock FastAPI app for testing."""
        from fastapi import FastAPI

        app = FastAPI()
        return app

    @pytest.fixture
    def mock_service_configs(self):
        """Mock service configurations."""
        return {
            "gatekeeper": {"enabled": True},
            "comfy": {"enabled": True},
            "nlweb": {"enabled": True},
            "rag": {"enabled": True, "rag_enabled": True},
            "ai_service": {"enabled": True},
            "tts": {"enabled": True, "tts_enabled": True},
            "search": {"enabled": True},
        }

    @pytest.mark.asyncio
    async def test_rag_service_lifecycle(self):
        """Test RAG service complete lifecycle."""
        # Mock RAG service
        mock_rag_service = AsyncMock()
        mock_rag_service.is_initialized.return_value = True
        mock_rag_service.get_system_health.return_value = {"healthy": True}
        mock_rag_service.shutdown.return_value = None

        with patch("app.core.service_registry.get_service_registry") as mock_registry:
            mock_registry_instance = MagicMock()
            mock_registry_instance.get_service_instance.return_value = mock_rag_service
            mock_registry.return_value = mock_registry_instance

            # Test health check
            health_status = await health_check_rag()
            assert health_status is True

            # Test shutdown
            await shutdown_rag_service()
            mock_rag_service.shutdown.assert_called_once()

    @pytest.mark.asyncio
    async def test_ai_service_lifecycle(self):
        """Test AI service complete lifecycle."""
        with patch(
            "app.core.ai_service_initializer.health_check_ai_service"
        ) as mock_health:
            mock_health.return_value = True

            # Test health check
            health_status = await health_check_ai_service()
            assert health_status is True

        with patch(
            "app.core.ai_service_initializer.shutdown_ai_service"
        ) as mock_shutdown:
            mock_shutdown.return_value = None

            # Test shutdown
            await shutdown_ai_service()
            mock_shutdown.assert_called_once()

    @pytest.mark.asyncio
    async def test_tts_service_lifecycle(self):
        """Test TTS service complete lifecycle."""
        # Mock TTS service
        mock_tts_service = AsyncMock()
        mock_tts_service.health_check.return_value = True
        mock_tts_service.shutdown.return_value = None

        with patch("app.core.service_registry.get_service_registry") as mock_registry:
            mock_registry_instance = MagicMock()
            mock_registry_instance.get_service_instance.return_value = mock_tts_service
            mock_registry.return_value = mock_registry_instance

            # Test health check
            health_status = await health_check_tts_service()
            assert health_status is True

            # Test shutdown
            await shutdown_tts_service()
            mock_tts_service.shutdown.assert_called_once()

    @pytest.mark.asyncio
    async def test_service_lifecycle_error_handling(self):
        """Test error handling during service lifecycle operations."""
        # Test RAG service health check with error
        with patch("app.core.service_registry.get_service_registry") as mock_registry:
            mock_registry_instance = MagicMock()
            mock_registry_instance.get_service_instance.side_effect = Exception(
                "Service not found"
            )
            mock_registry.return_value = mock_registry_instance

            health_status = await health_check_rag()
            assert health_status is False

        # Test AI service health check with error
        with patch(
            "app.core.ai_service_initializer.health_check_ai_service"
        ) as mock_health:
            mock_health.side_effect = Exception("Health check failed")

            health_status = await health_check_ai_service()
            assert health_status is False

        # Test TTS service shutdown with error
        with patch("app.core.service_registry.get_service_registry") as mock_registry:
            mock_registry_instance = MagicMock()
            mock_registry_instance.get_service_instance.side_effect = Exception(
                "Service not found"
            )
            mock_registry.return_value = mock_registry_instance

            # Should not raise exception, just log error
            await shutdown_tts_service()

    @pytest.mark.asyncio
    async def test_service_registry_integration(self):
        """Test service registry integration with lifecycle functions."""
        registry = get_service_registry()

        # Verify registry is properly initialized
        assert registry is not None

        # Test that services can be registered (this would be done in lifespan)
        # We're just verifying the registry structure is correct
        assert hasattr(registry, "register_service")
        assert hasattr(registry, "initialize_all")
        assert hasattr(registry, "shutdown_all")

    @pytest.mark.asyncio
    async def test_health_check_fallback_behavior(self):
        """Test health check fallback behavior when services are not available."""
        # Test RAG service fallback when get_system_health is not available
        mock_rag_service = MagicMock()
        mock_rag_service.is_initialized.return_value = True
        # Remove get_system_health method to test fallback
        del mock_rag_service.get_system_health

        with patch("app.core.service_registry.get_service_registry") as mock_registry:
            mock_registry_instance = MagicMock()
            mock_registry_instance.get_service_instance.return_value = mock_rag_service
            mock_registry.return_value = mock_registry_instance

            health_status = await health_check_rag()
            assert health_status is True  # Should fallback to is_initialized()

        # Test TTS service fallback when health_check is not available
        mock_tts_service = MagicMock()
        mock_tts_service._enabled = True
        # Remove health_check method to test fallback
        del mock_tts_service.health_check

        with patch("app.core.service_registry.get_service_registry") as mock_registry:
            mock_registry_instance = MagicMock()
            mock_registry_instance.get_service_instance.return_value = mock_tts_service
            mock_registry.return_value = mock_registry_instance

            health_status = await health_check_tts_service()
            assert health_status is True  # Should fallback to _enabled check

    @pytest.mark.asyncio
    async def test_shutdown_graceful_degradation(self):
        """Test that shutdown functions handle missing services gracefully."""
        # Test RAG service shutdown when service is None
        with patch("app.core.service_registry.get_service_registry") as mock_registry:
            mock_registry_instance = MagicMock()
            mock_registry_instance.get_service_instance.return_value = None
            mock_registry.return_value = mock_registry_instance

            # Should not raise exception
            await shutdown_rag_service()

        # Test TTS service shutdown when service has no shutdown method
        mock_tts_service = MagicMock()
        # Remove shutdown method to test graceful handling
        del mock_tts_service.shutdown

        with patch("app.core.service_registry.get_service_registry") as mock_registry:
            mock_registry_instance = MagicMock()
            mock_registry_instance.get_service_instance.return_value = mock_tts_service
            mock_registry.return_value = mock_registry_instance

            # Should not raise exception
            await shutdown_tts_service()


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
