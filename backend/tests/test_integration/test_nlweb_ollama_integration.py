"""
Integration tests for NLWeb with Ollama backend.

This module tests the complete integration between NLWeb and Ollama,
including tool suggestions, LLM interactions, and streaming responses.
"""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from httpx import AsyncClient
from datetime import datetime

from app.services.nlweb.models import NLWebSuggestionRequest, NLWebContext
from app.services.ollama.models import OllamaChatParams, OllamaAssistantParams


class TestNLWebOllamaIntegration:
    """Test integration between NLWeb and Ollama services."""

    @pytest.mark.asyncio
    async def test_nlweb_suggest_with_ollama_context(self, async_client: AsyncClient, access_token):
        """Test NLWeb tool suggestion with Ollama context."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_nlweb_service, \
             patch('app.api.ollama.endpoints.get_ollama_service') as mock_ollama_service:
            
            # Mock NLWeb service
            mock_nlweb = MagicMock()
            mock_nlweb.is_available.return_value = True
            
            # Mock tool suggestion that includes Ollama tools
            mock_tool = {
                "name": "ollama_chat",
                "description": "Chat with Ollama LLM",
                "category": "llm_interaction",
                "tags": ["ollama", "chat", "llm"],
                "path": "/api/ollama/chat",
                "method": "POST",
                "parameters": [
                    {
                        "name": "message",
                        "type": "string",
                        "description": "Message to send to Ollama",
                        "required": True
                    },
                    {
                        "name": "model",
                        "type": "string",
                        "description": "Ollama model to use",
                        "required": False,
                        "default": "qwen3:latest"
                    }
                ],
                "examples": ["ask ollama a question", "chat with llama model"]
            }
            
            mock_suggestion_response = {
                "suggestions": [{
                    "tool": mock_tool,
                    "score": 90.0,
                    "parameters": {
                        "message": "What is the weather like?",
                        "model": "qwen3:latest"
                    },
                    "reasoning": "User wants to ask a question, suggesting Ollama chat tool",
                    "parameter_hints": {
                        "message": "The user's question about weather",
                        "model": "qwen3:latest for general questions"
                    }
                }],
                "query": "What is the weather like?",
                "processing_time_ms": 200.0,
                "cache_hit": False,
                "total_tools_considered": 15
            }
            
            mock_nlweb.suggest_tools.return_value = mock_suggestion_response
            mock_nlweb_service.return_value = mock_nlweb
            
            # Mock Ollama service
            mock_ollama = MagicMock()
            mock_ollama.is_available.return_value = True
            mock_ollama_service.return_value = mock_ollama
            
            # Make request with context that includes Ollama availability
            request_data = {
                "query": "What is the weather like?",
                "context": {
                    "current_path": "/home/user",
                    "user_preferences": {
                        "preferred_llm": "ollama",
                        "default_model": "qwen3:latest"
                    },
                    "application_state": {
                        "ollama_available": True,
                        "available_models": ["qwen3:latest"]
                    }
                },
                "max_suggestions": 3,
                "min_score": 70.0
            }
            
            response = await async_client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "suggestions" in data
            assert len(data["suggestions"]) == 1
            assert data["suggestions"][0]["tool"]["name"] == "ollama_chat"
            assert data["suggestions"][0]["score"] == 90.0
            assert "ollama" in data["suggestions"][0]["tool"]["tags"]

    @pytest.mark.asyncio
    async def test_nlweb_ask_with_ollama_streaming(self, async_client: AsyncClient, access_token):
        """Test NLWeb ask endpoint with Ollama streaming integration."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_nlweb_service, \
             patch('app.api.ollama.endpoints.get_ollama_service') as mock_ollama_service:
            
            # Mock NLWeb service
            mock_nlweb = MagicMock()
            mock_nlweb.is_available.return_value = True
            mock_nlweb.configuration.base_url = "http://localhost:3001"
            
            # Mock streaming response that simulates Ollama integration
            async def mock_stream():
                yield {
                    "type": "token",
                    "data": "The",
                    "timestamp": 1234567890,
                    "metadata": {"model": "qwen3:latest", "tool_used": "ollama_chat"}
                }
                yield {
                    "type": "token", 
                    "data": " weather",
                    "timestamp": 1234567891,
                    "metadata": {"model": "qwen3:latest", "tool_used": "ollama_chat"}
                }
                yield {
                    "type": "token",
                    "data": " is",
                    "timestamp": 1234567892,
                    "metadata": {"model": "qwen3:latest", "tool_used": "ollama_chat"}
                }
                yield {
                    "type": "complete",
                    "data": "",
                    "timestamp": 1234567893,
                    "metadata": {
                        "processing_time": 2.5,
                        "tokens_generated": 3,
                        "model": "qwen3:latest",
                        "tools_used": ["ollama_chat"]
                    }
                }
            
            mock_nlweb.proxy_ask_request.return_value = mock_stream()
            mock_nlweb_service.return_value = mock_nlweb
            
            # Mock Ollama service
            mock_ollama = MagicMock()
            mock_ollama.is_available.return_value = True
            mock_ollama_service.return_value = mock_ollama
            
            # Make request
            request_data = {
                "query": "What is the weather like?",
                "context": {
                    "current_path": "/home/user",
                    "user_preferences": {
                        "preferred_llm": "ollama",
                        "default_model": "qwen3:latest"
                    }
                },
                "stream": True,
                "max_tokens": 100,
                "temperature": 0.7
            }
            
            response = await async_client.post(
                "/api/nlweb/ask",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            # For SSE streaming, we'd need to handle the response differently
            # This test verifies the endpoint is accessible and returns 200

    def test_ollama_chat_with_nlweb_tools(self, client: TestClient, access_token):
        """Test Ollama chat endpoint with NLWeb tool integration."""
        with patch('app.api.ollama.endpoints.get_ollama_service') as mock_ollama_service, \
             patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_nlweb_service:
            
            # Mock Ollama service
            mock_ollama = MagicMock()
            mock_ollama.is_available.return_value = True
            
            # Mock chat response with tool usage
            mock_chat_response = {
                "success": True,
                "response": "I can help you with that. Let me use the file listing tool to show you the current directory contents.",
                "model": "qwen3:latest",
                "processing_time": 1.5,
                "tokens_generated": 25,
                "tools_used": ["file_list", "directory_scan"]
            }
            
            # Mock the chat_stream method to return our response
            async def mock_chat_stream(params):
                yield MagicMock(type="token", data="I can help", timestamp=1234567890, metadata={})
                yield MagicMock(type="tool_call", data="", timestamp=1234567891, metadata={"tool_name": "file_list"})
                yield MagicMock(type="token", data=" you with that.", timestamp=1234567892, metadata={})
                yield MagicMock(type="complete", data="", timestamp=1234567893, metadata={"processing_time": 1.5})
            
            mock_ollama.chat_stream.return_value = mock_chat_stream(OllamaChatParams(
                message="List files in current directory",
                model="qwen3:latest",
                tools=[{
                    "name": "file_list",
                    "description": "List files in a directory",
                    "parameters": {"path": {"type": "string", "description": "Directory path"}}
                }]
            ))
            mock_ollama_service.return_value = mock_ollama
            
            # Mock NLWeb service for tool registry
            mock_nlweb = MagicMock()
            mock_nlweb.is_available.return_value = True
            mock_nlweb_service.return_value = mock_nlweb
            
            # Make request with tools enabled
            request_data = {
                "message": "List files in current directory",
                "model": "qwen3:latest",
                "system_prompt": "You are a helpful assistant with access to file system tools.",
                "temperature": 0.7,
                "max_tokens": 100,
                "tools": [
                    {
                        "type": "function",
                        "function": {
                            "name": "file_list",
                            "description": "List files in a directory",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "path": {
                                        "type": "string",
                                        "description": "Directory path to list"
                                    }
                                },
                                "required": ["path"]
                            }
                        }
                    }
                ],
                "context": {
                    "current_path": "/home/user/project",
                    "user_id": "testuser"
                }
            }
            
            response = client.post(
                "/api/ollama/chat",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "response" in data
            assert data["model"] == "qwen3:latest"
            assert data["processing_time"] == 1.5

    def test_ollama_assistant_with_nlweb_integration(self, client: TestClient, access_token):
        """Test Ollama assistant endpoint with NLWeb integration."""
        with patch('app.api.ollama.endpoints.get_ollama_service') as mock_ollama_service, \
             patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_nlweb_service:
            
            # Mock Ollama service
            mock_ollama = MagicMock()
            mock_ollama.is_available.return_value = True
            
            # Mock assistant response
            mock_assistant_response = {
                "success": True,
                "response": "I'll help you with that task. Let me analyze your request and suggest the best approach.",
                "assistant_type": "reynard",
                "model": "qwen3:latest",
                "processing_time": 2.0,
                "tokens_generated": 30,
                "tools_used": ["nlweb_suggest", "task_analyzer"]
            }
            
            # Mock the assistant_stream method
            async def mock_assistant_stream(params):
                yield MagicMock(type="token", data="I'll help", timestamp=1234567890, metadata={})
                yield MagicMock(type="tool_call", data="", timestamp=1234567891, metadata={"tool_name": "nlweb_suggest"})
                yield MagicMock(type="token", data=" you with that task.", timestamp=1234567892, metadata={})
                yield MagicMock(type="complete", data="", timestamp=1234567893, metadata={"processing_time": 2.0})
            
            mock_ollama.assistant_stream.return_value = mock_assistant_stream(OllamaAssistantParams(
                message="Help me organize my project files",
                assistant_type="reynard",
                model="qwen3:latest",
                tools_enabled=True
            ))
            mock_ollama_service.return_value = mock_ollama
            
            # Mock NLWeb service
            mock_nlweb = MagicMock()
            mock_nlweb.is_available.return_value = True
            mock_nlweb_service.return_value = mock_nlweb
            
            # Make request
            request_data = {
                "message": "Help me organize my project files",
                "assistant_type": "reynard",
                "model": "qwen3:latest",
                "temperature": 0.7,
                "max_tokens": 200,
                "context": {
                    "current_path": "/home/user/project",
                    "project_type": "web_application",
                    "user_preferences": {
                        "organization_style": "by_type"
                    }
                },
                "tools_enabled": True
            }
            
            response = client.post(
                "/api/ollama/assistant",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["assistant_type"] == "reynard"
            assert data["model"] == "qwen3:latest"
            assert data["processing_time"] == 2.0
            assert "tools_used" in data

    @pytest.mark.asyncio
    async def test_nlweb_verification_with_ollama_check(self, async_client: AsyncClient, access_token):
        """Test NLWeb verification with Ollama connectivity check."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_nlweb_service, \
             patch('app.api.ollama.endpoints.get_ollama_service') as mock_ollama_service:
            
            # Mock NLWeb service
            mock_nlweb = MagicMock()
            mock_verification_response = {
                "service_available": True,
                "config_loaded": True,
                "checks": [
                    {
                        "name": "nlweb_service",
                        "description": "NLWeb service connectivity",
                        "status": "pass",
                        "value": "connected",
                        "threshold": "must be connected"
                    },
                    {
                        "name": "ollama_integration",
                        "description": "Ollama service integration",
                        "status": "pass",
                        "value": "available",
                        "threshold": "must be available"
                    },
                    {
                        "name": "ollama_models",
                        "description": "Available Ollama models",
                        "status": "pass",
                        "value": 3,
                        "threshold": "at least 1 model"
                    }
                ],
                "overall_status": "pass"
            }
            mock_nlweb.get_verification_checklist.return_value = mock_verification_response
            mock_nlweb_service.return_value = mock_nlweb
            
            # Mock Ollama service
            mock_ollama = MagicMock()
            mock_ollama.is_available.return_value = True
            mock_ollama.get_available_models.return_value = [
                {"name": "qwen3:latest", "size": 1000000000, "digest": "abc123"},

            ]
            mock_ollama_service.return_value = mock_ollama
            
            response = await async_client.get(
                "/api/nlweb/verification",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["service_available"] is True
            assert data["overall_status"] == "pass"
            assert len(data["checks"]) == 3
            
            # Check that Ollama integration is verified
            ollama_check = next((check for check in data["checks"] if check["name"] == "ollama_integration"), None)
            assert ollama_check is not None
            assert ollama_check["status"] == "pass"
            assert ollama_check["value"] == "available"
            
            # Check that model count is verified
            models_check = next((check for check in data["checks"] if check["name"] == "ollama_models"), None)
            assert models_check is not None
            assert models_check["status"] == "pass"
            assert models_check["value"] == 3

    def test_error_handling_ollama_unavailable(self, client: TestClient, access_token):
        """Test error handling when Ollama is unavailable."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_nlweb_service, \
             patch('app.api.ollama.endpoints.get_ollama_service') as mock_ollama_service:
            
            # Mock NLWeb service
            mock_nlweb = MagicMock()
            mock_nlweb.is_available.return_value = True
            mock_nlweb_service.return_value = mock_nlweb
            
            # Mock Ollama service as unavailable
            mock_ollama = MagicMock()
            mock_ollama.is_available.return_value = False
            mock_ollama_service.return_value = mock_ollama
            
            # Make request that would normally use Ollama
            request_data = {
                "query": "Chat with the AI assistant",
                "context": {
                    "current_path": "/home/user",
                    "user_preferences": {
                        "preferred_llm": "ollama"
                    }
                }
            }
            
            response = client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            # Should still work but suggest alternative tools
            assert response.status_code == 200
            data = response.json()
            # The suggestion should not include Ollama tools or suggest alternatives
            assert "suggestions" in data

    def test_performance_monitoring_integration(self, client: TestClient, access_token):
        """Test performance monitoring across NLWeb and Ollama integration."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_nlweb_service, \
             patch('app.api.ollama.endpoints.get_ollama_service') as mock_ollama_service:
            
            # Mock NLWeb service with performance stats
            mock_nlweb = MagicMock()
            mock_performance_stats = {
                "total_requests": 500,
                "successful_requests": 480,
                "failed_requests": 20,
                "avg_processing_time_ms": 250.0,
                "p95_processing_time_ms": 500.0,
                "p99_processing_time_ms": 800.0,
                "cache_hit_rate": 60.0,
                "cache_hits": 300,
                "cache_misses": 200,
                "cache_size": 50,
                "max_cache_size": 1000,
                "rate_limit_hits": 2,
                "stale_served_count": 5,
                "degradation_events": 1
            }
            mock_nlweb.get_performance_stats.return_value = mock_performance_stats
            mock_nlweb_service.return_value = mock_nlweb
            
            # Mock Ollama service
            mock_ollama = MagicMock()
            mock_ollama.is_available.return_value = True
            mock_ollama_service.return_value = mock_ollama
            
            response = client.get(
                "/api/nlweb/stats",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["total_requests"] == 500
            assert data["successful_requests"] == 480
            assert data["failed_requests"] == 20
            assert data["avg_processing_time_ms"] == 250.0
            assert data["cache_hit_rate"] == 60.0
