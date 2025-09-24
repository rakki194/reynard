"""Reynard API Integration Tests

This module tests the integration between NLWeb tool calling and actual
Reynard API endpoints, demonstrating real-world usage scenarios.
"""

import sys
from collections.abc import AsyncGenerator
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Add the backend app to the path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "app"))

# Mock gatekeeper before importing the app
sys.modules["gatekeeper"] = __import__("tests.mocks.gatekeeper", fromlist=[""])
sys.modules["gatekeeper.api"] = sys.modules["gatekeeper"]
sys.modules["gatekeeper.api.routes"] = sys.modules["gatekeeper"]
sys.modules["gatekeeper.api.dependencies"] = sys.modules["gatekeeper"]
sys.modules["gatekeeper.models"] = sys.modules["gatekeeper"]
sys.modules["gatekeeper.models.user"] = sys.modules["gatekeeper"]

# Import after path setup
from main import create_app  # noqa: E402


class TestReynardAPIIntegration:
    """Test Reynard API integration with NLWeb tool calling."""

    @pytest.fixture(scope="class")
    def app(self) -> FastAPI:
        """Create the FastAPI app for testing."""
        return create_app()

    @pytest.fixture(scope="class")
    def client(self, app: FastAPI) -> TestClient:
        """Create test client."""
        return TestClient(app)

    @pytest.fixture(scope="class")
    def async_client(self, app: FastAPI) -> AsyncClient:
        """Create async test client."""
        from httpx import ASGITransport

        transport = ASGITransport(app=app)
        return AsyncClient(transport=transport, base_url="http://testserver")

    @pytest.fixture
    def mock_auth_token(self) -> str:
        """Mock authentication token."""
        return "mock_bearer_token"

    @pytest.fixture
    def auth_headers(self, mock_auth_token: str) -> dict[str, str]:
        """Authentication headers."""
        return {"Authorization": f"Bearer {mock_auth_token}"}

    def test_reynard_health_endpoints(
        self, client: TestClient, auth_headers: dict[str, str],
    ) -> None:
        """Test Reynard core health endpoints."""
        # Test root endpoint
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "🦊 Reynard API is running" in data["message"]
        assert "version" in data
        assert "environment" in data

        # Test health endpoint
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"

    def test_nlweb_suggest_with_reynard_context(
        self, client: TestClient, auth_headers: dict[str, str],
    ) -> None:
        """Test NLWeb tool suggestions with Reynard-specific context."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True

            # Mock Reynard-specific suggestions
            mock_suggestions = [
                {
                    "tool": {
                        "name": "comfy_image_generation",
                        "description": "Generate images using ComfyUI workflows",
                        "category": "image_generation",
                        "tags": ["comfy", "image", "generation"],
                        "path": "/api/comfy/generate",
                        "method": "POST",
                        "parameters": [
                            {
                                "name": "workflow_type",
                                "type": "string",
                                "description": "Type of ComfyUI workflow to use",
                                "required": True,
                                "constraints": {"enum": ["text2img", "img2img"]},
                            },
                            {
                                "name": "prompt",
                                "type": "string",
                                "description": "Text prompt for generation",
                                "required": True,
                            },
                        ],
                    },
                    "score": 95.0,
                    "parameters": {
                        "workflow_type": "text2img",
                        "prompt": "futuristic cityscape with neon lights",
                    },
                    "reasoning": "Query mentions image generation - suggesting ComfyUI workflow",
                },
            ]

            mock_suggestion_response = {
                "suggestions": mock_suggestions,
                "query": "generate a futuristic cityscape image for my presentation",
                "processing_time_ms": 180.0,
                "cache_hit": False,
                "total_tools_considered": 8,
            }

            mock_nlweb_service.suggest_tools = AsyncMock(
                return_value=mock_suggestion_response,
            )
            mock_service.return_value = mock_nlweb_service

            # Make request with Reynard context
            request_data = {
                "query": "generate a futuristic cityscape image for my presentation",
                "context": {
                    "current_path": "/home/user/reynard-project",
                    "project_type": "reynard_application",
                    "user_preferences": {
                        "preferred_services": ["comfy", "rag", "tts"],
                        "quality_preference": "high",
                    },
                    "reynard_context": {
                        "available_models": ["qwen3:latest"],
                        "comfy_workflows": ["text2img", "img2img"],
                        "tts_backends": ["kokoro", "coqui"],
                    },
                },
                "max_suggestions": 3,
                "min_score": 80.0,
                "include_reasoning": True,
            }

            response = client.post(
                "/api/nlweb/suggest", json=request_data, headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert "suggestions" in data
            assert len(data["suggestions"]) == 1

            suggestion = data["suggestions"][0]
            assert suggestion["tool"]["name"] == "comfy_image_generation"
            assert suggestion["score"] == 95.0
            assert suggestion["parameters"]["workflow_type"] == "text2img"

    @pytest.mark.asyncio
    async def test_ollama_chat_with_reynard_context(
        self, async_client: AsyncClient, auth_headers: dict[str, str],
    ) -> None:
        """Test Ollama chat with Reynard-specific context and tools."""
        async with async_client:
            with patch("app.api.ollama.endpoints.get_ollama_service") as mock_service:
                # Mock the service
                mock_ollama_service = MagicMock()
                mock_ollama_service.is_available.return_value = True

                # Mock streaming response with Reynard context
                from app.services.ollama.models import OllamaStreamEvent

                async def mock_reynard_stream() -> AsyncGenerator[OllamaStreamEvent]:
                    yield OllamaStreamEvent(
                        type="token",
                        data="I'll help you with your Reynard project. Let me generate that image for you.",
                        timestamp=1234567890.0,
                        metadata={"model": "qwen3:latest", "reynard_context": True},
                    )

                    # Tool call for ComfyUI
                    yield OllamaStreamEvent(
                        type="tool_call",
                        data="",
                        timestamp=1234567891.0,
                        metadata={
                            "tool_name": "comfy_image_generation",
                            "tool_args": {
                                "workflow_type": "text2img",
                                "prompt": "futuristic cityscape with neon lights",
                                "parameters": {
                                    "width": 1024,
                                    "height": 768,
                                    "steps": 25,
                                    "cfg_scale": 7.5,
                                },
                            },
                            "tool_call_id": "call_1",
                            "reynard_service": "comfy",
                        },
                    )

                    # Completion
                    yield OllamaStreamEvent(
                        type="complete",
                        data="",
                        timestamp=1234567892.0,
                        metadata={
                            "processing_time": 2.1,
                            "tokens_generated": 28,
                            "model": "qwen3:latest",
                            "tools_used": ["comfy_image_generation"],
                            "reynard_services_used": ["comfy"],
                        },
                    )

                mock_ollama_service.chat_stream.return_value = mock_reynard_stream()
                mock_service.return_value = mock_ollama_service

                # Make request with Reynard context
                request_data = {
                    "message": "I need to generate a futuristic cityscape image for my Reynard presentation. Can you help me create it using ComfyUI?",
                    "model": "qwen3:latest",
                    "system_prompt": "You are a helpful assistant integrated with Reynard services. You have access to ComfyUI, RAG, TTS, and other Reynard APIs.",
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "context": {
                        "current_path": "/home/user/reynard-project",
                        "project_type": "reynard_application",
                        "available_services": ["comfy", "rag", "tts", "ollama"],
                        "user_preferences": {
                            "image_quality": "high",
                            "processing_speed": "balanced",
                        },
                    },
                }

                response = await async_client.post(
                    "/api/ollama/chat", json=request_data, headers=auth_headers,
                )

                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
                assert data["model"] == "qwen3:latest"
                assert data["processing_time"] == 2.1
                assert "tools_used" in data
                assert "comfy_image_generation" in data["tools_used"]

    def test_multi_service_workflow_suggestion(
        self, client: TestClient, auth_headers: dict[str, str],
    ) -> None:
        """Test NLWeb suggesting multi-service workflows for Reynard."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True

            # Mock multi-service workflow suggestions
            mock_workflow_suggestions = [
                {
                    "tool": {
                        "name": "comfy_image_generation",
                        "description": "Generate images using ComfyUI workflows",
                        "category": "image_generation",
                        "tags": ["comfy", "image", "generation"],
                        "path": "/api/comfy/generate",
                        "method": "POST",
                        "parameters": [],
                    },
                    "score": 95.0,
                    "parameters": {
                        "workflow_type": "text2img",
                        "prompt": "modern tech startup office",
                    },
                    "reasoning": "Step 1: Generate promotional image for the startup",
                },
                {
                    "tool": {
                        "name": "caption_generation",
                        "description": "Generate descriptive captions for images",
                        "category": "caption_generation",
                        "tags": ["caption", "image", "description"],
                        "path": "/api/caption/generate",
                        "method": "POST",
                        "parameters": [],
                    },
                    "score": 90.0,
                    "parameters": {
                        "generator": "blip2",
                        "caption_options": {"style": "marketing", "max_length": 150},
                    },
                    "reasoning": "Step 2: Generate marketing caption for the image",
                },
                {
                    "tool": {
                        "name": "tts_audio_generation",
                        "description": "Generate audio from text using TTS",
                        "category": "audio_generation",
                        "tags": ["tts", "audio", "speech"],
                        "path": "/api/tts/synthesize",
                        "method": "POST",
                        "parameters": [],
                    },
                    "score": 85.0,
                    "parameters": {
                        "text": "Welcome to our innovative tech startup",
                        "voice": "professional_female",
                        "backend": "kokoro",
                    },
                    "reasoning": "Step 3: Create voice-over for the presentation",
                },
            ]

            mock_suggestion_response = {
                "suggestions": mock_workflow_suggestions,
                "query": "create a complete marketing presentation with image, caption, and audio",
                "processing_time_ms": 250.0,
                "cache_hit": False,
                "total_tools_considered": 12,
                "workflow_detected": True,
                "workflow_steps": 3,
                "reynard_services_involved": ["comfy", "caption", "tts"],
            }

            mock_nlweb_service.suggest_tools = AsyncMock(
                return_value=mock_suggestion_response,
            )
            mock_service.return_value = mock_nlweb_service

            # Make complex workflow request
            request_data = {
                "query": "create a complete marketing presentation with image, caption, and audio for my tech startup",
                "context": {
                    "current_path": "/home/user/startup-project",
                    "project_type": "marketing_presentation",
                    "user_goals": [
                        "image_generation",
                        "content_creation",
                        "audio_production",
                    ],
                    "reynard_context": {
                        "available_services": ["comfy", "caption", "tts", "rag"],
                        "workflow_preference": "multi_service",
                        "quality_requirements": "professional",
                    },
                },
                "max_suggestions": 5,
                "min_score": 80.0,
                "include_reasoning": True,
                "workflow_mode": True,
            }

            response = client.post(
                "/api/nlweb/suggest", json=request_data, headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert "suggestions" in data
            assert len(data["suggestions"]) == 3

            # Verify workflow progression
            suggestions = data["suggestions"]
            assert suggestions[0]["tool"]["name"] == "comfy_image_generation"
            assert suggestions[1]["tool"]["name"] == "caption_generation"
            assert suggestions[2]["tool"]["name"] == "tts_audio_generation"

    def test_reynard_service_error_handling(
        self, client: TestClient, auth_headers: dict[str, str],
    ) -> None:
        """Test error handling when Reynard services are unavailable."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True

            # Mock error response with fallback suggestions
            mock_error_suggestions = [
                {
                    "tool": {
                        "name": "ollama_chat",
                        "description": "Chat with local LLM models",
                        "category": "llm_chat",
                        "tags": ["ollama", "llm", "chat"],
                        "path": "/api/ollama/chat",
                        "method": "POST",
                        "parameters": [],
                    },
                    "score": 80.0,
                    "parameters": {
                        "message": "Generate a text description of a futuristic cityscape",
                        "model": "qwen3:latest",
                    },
                    "reasoning": "ComfyUI service unavailable - fallback to text generation",
                },
            ]

            mock_suggestion_response = {
                "suggestions": mock_error_suggestions,
                "query": "generate a futuristic cityscape image",
                "processing_time_ms": 120.0,
                "cache_hit": False,
                "total_tools_considered": 6,
                "service_errors": {"comfy": "Service temporarily unavailable"},
                "fallback_activated": True,
            }

            mock_nlweb_service.suggest_tools = AsyncMock(
                return_value=mock_suggestion_response,
            )
            mock_service.return_value = mock_nlweb_service

            # Make request that would normally use ComfyUI
            request_data = {
                "query": "generate a futuristic cityscape image",
                "context": {
                    "current_path": "/home/user/project",
                    "project_type": "image_generation",
                    "reynard_context": {
                        "service_status": {
                            "comfy": "unavailable",
                            "ollama": "available",
                            "tts": "available",
                        },
                    },
                },
                "max_suggestions": 3,
                "min_score": 70.0,
                "include_reasoning": True,
            }

            response = client.post(
                "/api/nlweb/suggest", json=request_data, headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert "suggestions" in data
            assert len(data["suggestions"]) == 1

            suggestion = data["suggestions"][0]
            assert suggestion["tool"]["name"] == "ollama_chat"

    def test_reynard_context_aware_suggestions(
        self, client: TestClient, auth_headers: dict[str, str],
    ) -> None:
        """Test context-aware suggestions based on Reynard project type."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True

            # Mock context-aware suggestions for different project types
            test_cases = [
                {
                    "project_type": "e_commerce",
                    "query": "help me with product images",
                    "expected_tools": [
                        "comfy_image_generation",
                        "caption_generation",
                        "image_processing",
                    ],
                    "expected_reasoning": "e-commerce project detected - suggesting product-focused tools",
                },
                {
                    "project_type": "content_creation",
                    "query": "create multimedia content",
                    "expected_tools": [
                        "comfy_image_generation",
                        "tts_audio_generation",
                        "caption_generation",
                    ],
                    "expected_reasoning": "content creation project - suggesting multimedia tools",
                },
                {
                    "project_type": "research",
                    "query": "find information about AI",
                    "expected_tools": ["rag_document_search", "ollama_chat"],
                    "expected_reasoning": "research project - suggesting information retrieval tools",
                },
            ]

            for test_case in test_cases:
                mock_suggestions = []
                for i, tool_name in enumerate(test_case["expected_tools"]):
                    mock_suggestions.append(
                        {
                            "tool": {
                                "name": tool_name,
                                "description": f"Tool for {tool_name}",
                                "category": "test_category",
                                "tags": ["test"],
                                "path": f"/api/{tool_name}",
                                "method": "POST",
                                "parameters": [],
                            },
                            "score": 90.0 - (i * 5),
                            "parameters": {"test_param": "test_value"},
                            "reasoning": f"Context-aware suggestion for {test_case['project_type']} project",
                        },
                    )

                mock_suggestion_response = {
                    "suggestions": mock_suggestions,
                    "query": test_case["query"],
                    "processing_time_ms": 150.0,
                    "cache_hit": False,
                    "total_tools_considered": 8,
                    "context_analysis": {
                        "project_type": test_case["project_type"],
                        "confidence": 0.95,
                    },
                }

                mock_nlweb_service.suggest_tools = AsyncMock(
                    return_value=mock_suggestion_response,
                )
                mock_service.return_value = mock_nlweb_service

                # Make request with specific project context
                request_data = {
                    "query": test_case["query"],
                    "context": {
                        "current_path": f"/home/user/{test_case['project_type']}-project",
                        "project_type": test_case["project_type"],
                        "reynard_context": {
                            "project_requirements": test_case["project_type"],
                            "available_services": [
                                "comfy",
                                "rag",
                                "tts",
                                "ollama",
                                "caption",
                            ],
                        },
                    },
                    "max_suggestions": 3,
                    "min_score": 80.0,
                    "include_reasoning": True,
                }

                response = client.post(
                    "/api/nlweb/suggest", json=request_data, headers=auth_headers,
                )

                assert response.status_code == 200
                data = response.json()
                assert "suggestions" in data
                assert len(data["suggestions"]) == len(test_case["expected_tools"])

                # Verify expected tools are suggested
                suggested_tools = [s["tool"]["name"] for s in data["suggestions"]]
                for expected_tool in test_case["expected_tools"]:
                    assert expected_tool in suggested_tools
