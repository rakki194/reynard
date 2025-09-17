"""
Tests for Ollama service functionality.

This module tests the OllamaService class and its integration with
ReynardAssistant, tool calling, and streaming responses.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.services.ollama.models import (
    OllamaAssistantParams,
    OllamaChatParams,
    OllamaConfig,
    OllamaModelInfo,
    OllamaStats,
    OllamaStreamEvent,
)
from app.services.ollama.ollama_service import OllamaClient, OllamaService


class TestOllamaService:
    """Test Ollama service functionality."""

    def test_service_initialization(self):
        """Test service initialization."""
        service = OllamaService()

        assert service._config is None
        assert service._client is None
        assert service._assistant is None
        assert service._enabled is False
        assert service._stats["total_requests"] == 0
        assert service._stats["successful_requests"] == 0
        assert service._stats["failed_requests"] == 0

    @pytest.mark.asyncio
    async def test_service_initialization_success(self):
        """Test successful service initialization."""
        service = OllamaService()
        config = {
            "ollama": {
                "enabled": True,
                "base_url": "http://localhost:11434",
                "timeout": 30,
                "default_model": "llama3.1",
                "assistant": {
                    "enabled": True,
                    "system_prompt": "You are a helpful assistant",
                    "tools_enabled": True,
                },
            }
        }

        with (
            patch(
                "app.services.ollama.ollama_service.OllamaClient"
            ) as mock_client_class,
            patch(
                "app.services.ollama.ollama_service.ReynardAssistant"
            ) as mock_assistant_class,
        ):

            mock_client = AsyncMock()
            mock_assistant = AsyncMock()
            mock_client_class.return_value = mock_client
            mock_assistant_class.return_value = mock_assistant

            result = await service.initialize(config)

            assert result is True
            assert service._enabled is True
            assert service._config is not None
            assert service._client is not None
            assert service._assistant is not None

    @pytest.mark.asyncio
    async def test_service_initialization_disabled(self):
        """Test service initialization when disabled."""
        service = OllamaService()
        config = {"ollama": {"enabled": False, "base_url": "http://localhost:11434"}}

        result = await service.initialize(config)

        assert result is True
        assert service._enabled is False
        assert service._config is not None
        assert service._client is None
        assert service._assistant is None

    @pytest.mark.asyncio
    async def test_service_initialization_failure(self):
        """Test service initialization failure."""
        service = OllamaService()
        config = {"ollama": {"enabled": True, "base_url": "http://localhost:11434"}}

        with patch(
            "app.services.ollama.ollama_service.OllamaClient",
            side_effect=Exception("Connection failed"),
        ):
            result = await service.initialize(config)

            assert result is False
            assert service._enabled is False

    @pytest.mark.asyncio
    async def test_chat_stream_success(self):
        """Test successful chat streaming."""
        service = OllamaService()
        service._enabled = True
        service._client = AsyncMock()

        # Mock stream events
        import time

        mock_events = [
            OllamaStreamEvent(type="start", data="", timestamp=time.time()),
            OllamaStreamEvent(type="token", data="Hello", timestamp=time.time()),
            OllamaStreamEvent(type="token", data=" world", timestamp=time.time()),
            OllamaStreamEvent(type="end", data="", timestamp=time.time()),
        ]

        async def mock_chat_stream(params):
            for event in mock_events:
                yield event

        service._client.chat_stream = mock_chat_stream

        params = OllamaChatParams(model="llama3.1", message="Hello", stream=True)

        events = []
        async for event in service.chat_stream(params):
            events.append(event)

        assert len(events) == 5  # 4 from mock + 1 completion event from service
        assert events[0].type == "start"
        assert events[1].type == "token"
        assert events[2].type == "token"
        assert events[3].type == "end"
        assert service._stats["total_requests"] == 1
        assert service._stats["successful_requests"] == 1

    @pytest.mark.asyncio
    async def test_chat_stream_service_disabled(self):
        """Test chat streaming when service is disabled."""
        service = OllamaService()
        service._enabled = False

        params = OllamaChatParams(model="llama3.1", message="Hello", stream=True)

        events = []
        async for event in service.chat_stream(params):
            events.append(event)

        assert len(events) == 1
        assert events[0].type == "error"
        assert "Ollama service is disabled" in events[0].data

    @pytest.mark.asyncio
    async def test_assistant_stream_success(self):
        """Test successful assistant streaming."""
        service = OllamaService()
        service._enabled = True
        service._assistant = AsyncMock()

        # Mock assistant stream events
        import time

        mock_events = [
            OllamaStreamEvent(type="start", data="", timestamp=time.time()),
            OllamaStreamEvent(type="tool_call", data="search", timestamp=time.time()),
            OllamaStreamEvent(
                type="response",
                data="Based on the search results...",
                timestamp=time.time(),
            ),
            OllamaStreamEvent(type="end", data="", timestamp=time.time()),
        ]

        async def mock_assistant_stream(params):
            for event in mock_events:
                yield event

        service._assistant.stream = mock_assistant_stream

        params = OllamaAssistantParams(
            model="llama3.1",
            message="Search for information about Python",
            tools_enabled=True,
        )

        events = []
        async for event in service.assistant_stream(params):
            events.append(event)

        assert len(events) == 5  # 4 from mock + 1 completion event from service
        assert events[0].type == "start"
        assert events[1].type == "tool_call"
        assert events[2].type == "response"
        assert events[3].type == "end"

    @pytest.mark.asyncio
    async def test_assistant_stream_service_disabled(self):
        """Test assistant streaming when service is disabled."""
        service = OllamaService()
        service._enabled = False

        params = OllamaAssistantParams(
            model="llama3.1", message="Hello", tools_enabled=True
        )

        events = []
        async for event in service.assistant_stream(params):
            events.append(event)

        assert len(events) == 1
        assert events[0].type == "error"
        assert "Ollama service is disabled" in events[0].data

    @pytest.mark.asyncio
    async def test_get_available_models_success(self):
        """Test getting available models."""
        service = OllamaService()
        service._enabled = True
        service._client = AsyncMock()

        mock_models = [
            OllamaModelInfo(
                name="llama3.1",
                size=1000000000,
                modified_at="2024-01-01T00:00:00Z",
                digest="sha256:abc123",
                is_available=True,
            ),
            OllamaModelInfo(
                name="codellama",
                size=8000000000,
                modified_at="2024-01-01T00:00:00Z",
                digest="sha256:def456",
                is_available=True,
            ),
        ]

        service._client.get_models.return_value = mock_models

        models = await service.get_available_models()

        assert len(models) == 2
        assert models[0].name == "llama3.1"
        assert models[1].name == "codellama"

    @pytest.mark.asyncio
    async def test_get_available_models_service_disabled(self):
        """Test getting available models when service is disabled."""
        service = OllamaService()
        service._enabled = False

        models = await service.get_available_models()

        assert models == []

    @pytest.mark.asyncio
    async def test_get_config(self):
        """Test getting service configuration."""
        service = OllamaService()
        service._config = OllamaConfig(
            enabled=True,
            base_url="http://localhost:11434",
            timeout=30,
            default_model="llama3.1",
        )

        config = await service.get_config()

        assert config["enabled"] is True
        assert config["base_url"] == "http://localhost:11434"
        assert config["timeout_seconds"] == 30
        assert config["default_model"] == "llama3.1"

    @pytest.mark.asyncio
    async def test_update_config_success(self):
        """Test successful configuration update."""
        service = OllamaService()
        service._enabled = True
        service._client = AsyncMock()
        service._assistant = AsyncMock()

        new_config = {
            "enabled": True,
            "base_url": "http://localhost:11434",
            "timeout": 60,
            "default_model": "llama3.1:8b",
        }

        result = await service.update_config(new_config)

        assert result is True
        assert service._config.timeout_seconds == 60
        assert service._config.default_model == "llama3.1:8b"

    @pytest.mark.asyncio
    async def test_get_stats(self):
        """Test getting service statistics."""
        service = OllamaService()
        service._stats = {
            "total_requests": 100,
            "successful_requests": 95,
            "failed_requests": 5,
            "total_processing_time": 1200.5,
            "total_tokens_generated": 50000,
            "model_usage": {"llama3.1": 80, "codellama": 20},
            "assistant_usage": {"tool_calls": 30, "responses": 70},
            "tools_usage": {"search": 15, "calculator": 10},
        }

        stats = await service.get_stats()

        assert isinstance(stats, OllamaStats)
        assert stats.total_requests == 100
        assert stats.successful_requests == 95
        assert stats.failed_requests == 5
        assert stats.average_processing_time > 0
        assert stats.total_tokens_generated == 50000

    @pytest.mark.asyncio
    async def test_health_check_success(self):
        """Test successful health check."""
        service = OllamaService()
        service._enabled = True
        service._client = AsyncMock()
        service._client.health_check.return_value = True

        result = await service.health_check()

        assert result is True

    @pytest.mark.asyncio
    async def test_health_check_service_disabled(self):
        """Test health check when service is disabled."""
        service = OllamaService()
        service._enabled = False

        result = await service.health_check()

        assert result is False

    @pytest.mark.asyncio
    async def test_health_check_failure(self):
        """Test health check failure."""
        service = OllamaService()
        service._enabled = True
        service._client = AsyncMock()
        service._client.health_check.return_value = False

        result = await service.health_check()

        assert result is False

    @pytest.mark.asyncio
    async def test_pull_model_success(self):
        """Test successful model pulling."""
        service = OllamaService()
        service._enabled = True
        service._client = AsyncMock()
        service._client.pull_model.return_value = True

        result = await service.pull_model("llama3.1")

        assert result is True
        service._client.pull_model.assert_called_once_with("llama3.1")

    @pytest.mark.asyncio
    async def test_pull_model_service_disabled(self):
        """Test model pulling when service is disabled."""
        service = OllamaService()
        service._enabled = False

        result = await service.pull_model("llama3.1")

        assert result is False

    @pytest.mark.asyncio
    async def test_cleanup(self):
        """Test service cleanup."""
        service = OllamaService()
        service._client = AsyncMock()
        service._assistant = AsyncMock()

        await service.cleanup()

        # Cleanup should complete without errors
        assert True


class TestOllamaClient:
    """Test Ollama client functionality."""

    def test_client_initialization(self):
        """Test client initialization."""
        client = OllamaClient("http://localhost:11434", 30)

        assert client.base_url == "http://localhost:11434"
        assert client.timeout == 30
        assert client.session is None

    @pytest.mark.asyncio
    async def test_ensure_session(self):
        """Test session creation."""
        client = OllamaClient("http://localhost:11434", 30)

        with patch("aiohttp.ClientSession") as mock_session_class:
            mock_session = AsyncMock()
            mock_session_class.return_value = mock_session

            await client._ensure_session()

            assert client.session is not None

    @pytest.mark.asyncio
    async def test_is_model_available_success(self):
        """Test successful model availability check."""
        client = OllamaClient("http://localhost:11434", 30)
        client.session = AsyncMock()

        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {"status": "success"}
        client.session.get.return_value.__aenter__.return_value = mock_response

        result = await client.is_model_available("llama3.1")

        assert result is True

    @pytest.mark.asyncio
    async def test_is_model_available_failure(self):
        """Test model availability check failure."""
        client = OllamaClient("http://localhost:11434", 30)
        client.session = AsyncMock()

        mock_response = AsyncMock()
        mock_response.status = 404
        client.session.get.return_value.__aenter__.return_value = mock_response

        result = await client.is_model_available("nonexistent")

        assert result is False

    @pytest.mark.asyncio
    async def test_chat_stream_success(self):
        """Test successful chat streaming."""
        client = OllamaClient("http://localhost:11434", 30)
        client.session = AsyncMock()

        # Mock streaming response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.content.iter_chunked.return_value = [
            b'{"type":"start","data":{"model":"llama3.1"}}\n',
            b'{"type":"token","data":{"token":"Hello"}}\n',
            b'{"type":"end","data":{"done":true}}\n',
        ]
        client.session.post.return_value.__aenter__.return_value = mock_response

        params = OllamaChatParams(model="llama3.1", message="Hello", stream=True)

        events = []
        async for event in client.chat_stream(params):
            events.append(event)

        assert len(events) == 3
        assert events[0].type == "start"
        assert events[1].type == "token"
        assert events[2].type == "end"

    @pytest.mark.asyncio
    async def test_get_models_success(self):
        """Test successful model retrieval."""
        client = OllamaClient("http://localhost:11434", 30)
        client.session = AsyncMock()

        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "models": [
                {
                    "name": "llama3.1",
                    "size": 1000000000,
                    "modified_at": "2024-01-01T00:00:00Z",
                    "digest": "sha256:abc123",
                    "details": {"format": "gguf", "family": "llama"},
                }
            ]
        }
        client.session.get.return_value.__aenter__.return_value = mock_response

        models = await client.get_models()

        assert len(models) == 1
        assert models[0].name == "llama3.1"
        assert models[0].size == 1000000000

    @pytest.mark.asyncio
    async def test_health_check_success(self):
        """Test successful health check."""
        client = OllamaClient("http://localhost:11434", 30)
        client.session = AsyncMock()

        mock_response = AsyncMock()
        mock_response.status = 200
        client.session.get.return_value.__aenter__.return_value = mock_response

        result = await client.health_check()

        assert result is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self):
        """Test health check failure."""
        client = OllamaClient("http://localhost:11434", 30)
        client.session = AsyncMock()

        mock_response = AsyncMock()
        mock_response.status = 500
        client.session.get.return_value.__aenter__.return_value = mock_response

        result = await client.health_check()

        assert result is False

    @pytest.mark.asyncio
    async def test_pull_model_success(self):
        """Test successful model pulling."""
        client = OllamaClient("http://localhost:11434", 30)
        client.session = AsyncMock()

        mock_response = AsyncMock()
        mock_response.status = 200
        client.session.post.return_value.__aenter__.return_value = mock_response

        result = await client.pull_model("llama3.1")

        assert result is True

    @pytest.mark.asyncio
    async def test_pull_model_failure(self):
        """Test model pulling failure."""
        client = OllamaClient("http://localhost:11434", 30)
        client.session = AsyncMock()

        mock_response = AsyncMock()
        mock_response.status = 404
        client.session.post.return_value.__aenter__.return_value = mock_response

        result = await client.pull_model("nonexistent")

        assert result is False

    def test_update_config(self):
        """Test configuration update."""
        client = OllamaClient("http://localhost:11434", 30)
        config = OllamaConfig(
            enabled=True,
            base_url="http://localhost:11435",
            timeout=60,
            default_model="llama3.1:8b",
        )

        client.update_config(config)

        assert client.base_url == "http://localhost:11435"
        assert client.timeout == 300  # Default timeout from config
