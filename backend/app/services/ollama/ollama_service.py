"""
Main Ollama service orchestrator.

This service manages Ollama local LLM integration with ReynardAssistant,
tool calling, streaming responses, and context awareness.
"""

import asyncio
import logging
import time
from typing import Any, AsyncIterable, Dict, List, Optional

from .models import (
    OllamaConfig,
    OllamaChatParams,
    OllamaAssistantParams,
    OllamaModelInfo,
    OllamaStats,
    OllamaStreamEvent,
)

logger = logging.getLogger(__name__)


class OllamaService:
    """Main service for Ollama local LLM integration."""

    def __init__(self):
        self._config: Optional[OllamaConfig] = None
        self._client: Optional[OllamaClient] = None
        self._assistant: Optional[ReynardAssistant] = None
        self._stats: Dict[str, Any] = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_processing_time": 0.0,
            "total_tokens_generated": 0,
            "model_usage": {},
            "assistant_usage": {},
            "tools_usage": {},
        }
        self._enabled = False

    async def initialize(self, config: Dict[str, Any]) -> bool:
        """Initialize the Ollama service."""
        try:
            self._config = OllamaConfig(**config.get("ollama", {}))
            self._enabled = self._config.enabled

            if not self._enabled:
                logger.info("Ollama service disabled in configuration")
                return True

            # Initialize Ollama client
            self._client = OllamaClient(self._config.base_url, self._config.timeout_seconds)

            # Initialize ReynardAssistant if enabled
            if self._config.assistant_enabled:
                self._assistant = ReynardAssistant(self._client, self._config)

            logger.info("Ollama service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize Ollama service: {e}")
            return False

    async def chat_stream(
        self, params: OllamaChatParams
    ) -> AsyncIterable[OllamaStreamEvent]:
        """Chat with Ollama with streaming support."""
        if not self._enabled:
            yield OllamaStreamEvent(
                type="error",
                data="Ollama service is disabled",
                timestamp=time.time(),
            )
            return

        start_time = time.time()
        self._stats["total_requests"] += 1

        try:
            # Check if model is available
            if not await self._client.is_model_available(params.model):
                yield OllamaStreamEvent(
                    type="error",
                    data=f"Model {params.model} not available",
                    timestamp=time.time(),
                )
                self._stats["failed_requests"] += 1
                return

            # Generate response with streaming
            tokens_generated = 0
            async for event in self._client.chat_stream(params):
                if event.type == "token":
                    tokens_generated += 1
                    self._stats["total_tokens_generated"] += 1

                yield event

            # Update stats
            processing_time = time.time() - start_time
            self._stats["successful_requests"] += 1
            self._stats["total_processing_time"] += processing_time
            self._stats["model_usage"][params.model] = (
                self._stats["model_usage"].get(params.model, 0) + 1
            )

            # Final completion event
            yield OllamaStreamEvent(
                type="complete",
                data="",
                timestamp=time.time(),
                metadata={
                    "tokens_generated": tokens_generated,
                    "processing_time": processing_time,
                },
            )

        except Exception as e:
            logger.error(f"Chat failed: {e}")
            self._stats["failed_requests"] += 1
            yield OllamaStreamEvent(
                type="error",
                data=str(e),
                timestamp=time.time(),
            )

    async def assistant_stream(
        self, params: OllamaAssistantParams
    ) -> AsyncIterable[OllamaStreamEvent]:
        """Chat with ReynardAssistant with streaming support."""
        if not self._enabled or not self._assistant:
            yield OllamaStreamEvent(
                type="error",
                data="ReynardAssistant is not available",
                timestamp=time.time(),
            )
            return

        start_time = time.time()
        self._stats["total_requests"] += 1

        try:
            # Generate assistant response with streaming
            tokens_generated = 0
            tools_used = []
            
            async for event in self._assistant.chat_stream(params):
                if event.type == "token":
                    tokens_generated += 1
                    self._stats["total_tokens_generated"] += 1
                elif event.type == "tool_call":
                    tool_name = event.metadata.get("tool_name", "unknown")
                    tools_used.append(tool_name)
                    self._stats["tools_usage"][tool_name] = (
                        self._stats["tools_usage"].get(tool_name, 0) + 1
                    )

                yield event

            # Update stats
            processing_time = time.time() - start_time
            self._stats["successful_requests"] += 1
            self._stats["total_processing_time"] += processing_time
            self._stats["assistant_usage"][params.assistant_type] = (
                self._stats["assistant_usage"].get(params.assistant_type, 0) + 1
            )

            # Final completion event
            yield OllamaStreamEvent(
                type="complete",
                data="",
                timestamp=time.time(),
                metadata={
                    "tokens_generated": tokens_generated,
                    "processing_time": processing_time,
                    "tools_used": tools_used,
                },
            )

        except Exception as e:
            logger.error(f"Assistant chat failed: {e}")
            self._stats["failed_requests"] += 1
            yield OllamaStreamEvent(
                type="error",
                data=str(e),
                timestamp=time.time(),
            )

    async def get_available_models(self) -> List[OllamaModelInfo]:
        """Get list of available Ollama models."""
        if not self._enabled or not self._client:
            return []

        try:
            return await self._client.get_models()
        except Exception as e:
            logger.error(f"Failed to get models: {e}")
            return []

    async def get_config(self) -> Dict[str, Any]:
        """Get current configuration."""
        if not self._config:
            return {}

        return self._config.dict()

    async def update_config(self, config: Dict[str, Any]) -> bool:
        """Update configuration."""
        try:
            self._config = OllamaConfig(**config)
            self._enabled = self._config.enabled

            if self._client:
                self._client.update_config(self._config)

            if self._assistant:
                self._assistant.update_config(self._config)

            return True

        except Exception as e:
            logger.error(f"Failed to update config: {e}")
            return False

    async def get_stats(self) -> OllamaStats:
        """Get service statistics."""
        total_requests = self._stats["total_requests"]
        successful_requests = self._stats["successful_requests"]
        failed_requests = self._stats["failed_requests"]

        average_processing_time = 0.0
        if successful_requests > 0:
            average_processing_time = (
                self._stats["total_processing_time"] / successful_requests
            )

        error_rate = 0.0
        if total_requests > 0:
            error_rate = (failed_requests / total_requests) * 100

        return OllamaStats(
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            average_processing_time=average_processing_time,
            total_tokens_generated=self._stats["total_tokens_generated"],
            model_usage=self._stats["model_usage"].copy(),
            assistant_usage=self._stats["assistant_usage"].copy(),
            tools_usage=self._stats["tools_usage"].copy(),
            error_rate=error_rate,
        )

    async def health_check(self) -> bool:
        """Check service health."""
        if not self._enabled:
            return True

        try:
            if not self._client:
                return False

            # Check if Ollama server is reachable
            return await self._client.health_check()

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False

    async def pull_model(self, model_name: str) -> bool:
        """Pull a model from Ollama registry."""
        if not self._enabled or not self._client:
            return False

        try:
            return await self._client.pull_model(model_name)
        except Exception as e:
            logger.error(f"Failed to pull model {model_name}: {e}")
            return False

    async def cleanup(self) -> None:
        """Cleanup resources."""
        try:
            if self._client:
                await self._client.cleanup()

            if self._assistant:
                await self._assistant.cleanup()

            logger.info("Ollama service cleanup completed")

        except Exception as e:
            logger.error(f"Error during cleanup: {e}")


import aiohttp
import json
from typing import Dict, Any, List, Optional


class OllamaClient:
    """Ollama HTTP client for model interaction."""

    def __init__(self, base_url: str, timeout: int):
        self.base_url = base_url
        self.timeout = timeout
        self.session: Optional[aiohttp.ClientSession] = None

    async def _ensure_session(self):
        """Ensure HTTP session is available."""
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=self.timeout)
            self.session = aiohttp.ClientSession(timeout=timeout)

    async def is_model_available(self, model_name: str) -> bool:
        """Check if a model is available."""
        try:
            await self._ensure_session()
            async with self.session.get(f"{self.base_url}/api/tags") as response:
                if response.status == 200:
                    data = await response.json()
                    models = data.get("models", [])
                    return any(model.get("name") == model_name for model in models)
                return False
        except Exception as e:
            logger.error(f"Error checking model availability: {e}")
            return False

    async def chat_stream(self, params: OllamaChatParams) -> AsyncIterable[OllamaStreamEvent]:
        """Stream chat response."""
        try:
            await self._ensure_session()
            
            payload = {
                "model": params.model,
                "messages": [
                    {"role": "user", "content": params.message}
                ],
                "stream": True,
                "options": {
                    "temperature": params.temperature,
                    "num_predict": params.max_tokens
                }
            }
            
            # Add tools if provided
            if params.tools:
                payload["tools"] = params.tools
            
            # Add system prompt if provided
            if params.system_prompt:
                payload["messages"].insert(0, {"role": "system", "content": params.system_prompt})
            
            async with self.session.post(
                f"{self.base_url}/api/chat",
                json=payload
            ) as response:
                if response.status == 200:
                    async for line in response.content:
                        if line:
                            try:
                                data = json.loads(line.decode('utf-8'))
                                
                                # Handle content tokens
                                if data.get('message', {}).get('content'):
                                    yield OllamaStreamEvent(
                                        type="token",
                                        data=data['message']['content'],
                                        timestamp=time.time()
                                    )
                                
                                # Handle tool calls
                                if data.get('message', {}).get('tool_calls'):
                                    for tool_call in data['message']['tool_calls']:
                                        yield OllamaStreamEvent(
                                            type="tool_call",
                                            data="",
                                            timestamp=time.time(),
                                            metadata={
                                                "tool_name": tool_call['function']['name'],
                                                "tool_args": tool_call['function']['arguments'],
                                                "tool_call_id": tool_call.get('id')
                                            }
                                        )
                                
                                # Handle completion
                                if data.get('done'):
                                    yield OllamaStreamEvent(
                                        type="complete",
                                        data="",
                                        timestamp=time.time(),
                                        metadata={"done": True}
                                    )
                                    break
                                    
                            except json.JSONDecodeError:
                                continue
                else:
                    error_text = await response.text()
                    yield OllamaStreamEvent(
                        type="error",
                        data=f"HTTP {response.status}: {error_text}",
                        timestamp=time.time()
                    )
        except Exception as e:
            logger.error(f"Error in chat_stream: {e}")
            yield OllamaStreamEvent(
                type="error",
                data=str(e),
                timestamp=time.time()
            )

    async def get_models(self) -> List[OllamaModelInfo]:
        """Get available models."""
        try:
            await self._ensure_session()
            async with self.session.get(f"{self.base_url}/api/tags") as response:
                if response.status == 200:
                    data = await response.json()
                    models = []
                    for model_data in data.get("models", []):
                        models.append(OllamaModelInfo(
                            name=model_data.get("name", "unknown"),
                            size=model_data.get("size", 0),
                            digest=model_data.get("digest", ""),
                            modified_at=model_data.get("modified_at", ""),
                            is_available=True,
                            context_length=model_data.get("details", {}).get("parameter_size", 4096),
                            capabilities=["chat", "completion"]
                        ))
                    return models
                return []
        except Exception as e:
            logger.error(f"Error getting models: {e}")
            return []

    async def health_check(self) -> bool:
        """Check Ollama server health."""
        try:
            await self._ensure_session()
            async with self.session.get(f"{self.base_url}/api/tags") as response:
                return response.status == 200
        except Exception:
            return False

    async def pull_model(self, model_name: str) -> bool:
        """Pull a model."""
        try:
            await self._ensure_session()
            async with self.session.post(
                f"{self.base_url}/api/pull",
                json={"name": model_name}
            ) as response:
                return response.status == 200
        except Exception as e:
            logger.error(f"Error pulling model {model_name}: {e}")
            return False

    def update_config(self, config: OllamaConfig) -> None:
        """Update client configuration."""
        self.base_url = config.base_url
        self.timeout = config.timeout_seconds

    async def cleanup(self) -> None:
        """Cleanup client resources."""
        if self.session and not self.session.closed:
            await self.session.close()


class ReynardAssistant:
    """ReynardAssistant with tool calling and context awareness."""

    def __init__(self, client: OllamaClient, config: OllamaConfig):
        self.client = client
        self.config = config

    async def chat_stream(self, params: OllamaAssistantParams) -> AsyncIterable[OllamaStreamEvent]:
        """Stream assistant response with tool calling."""
        try:
            # Create chat params for the underlying client
            chat_params = OllamaChatParams(
                message=params.message,
                model=params.model,
                system_prompt=self._get_system_prompt(params.assistant_type),
                temperature=params.temperature,
                max_tokens=params.max_tokens,
                stream=True,
                tools=self._get_available_tools() if params.tools_enabled else None,
                context=params.context
            )
            
            # Stream from the underlying client
            async for event in self.client.chat_stream(chat_params):
                yield event
                
        except Exception as e:
            logger.error(f"Error in ReynardAssistant chat_stream: {e}")
            yield OllamaStreamEvent(
                type="error",
                data=str(e),
                timestamp=time.time()
            )

    def _get_system_prompt(self, assistant_type: str) -> str:
        """Get system prompt based on assistant type."""
        prompts = {
            "reynard": "You are Reynard, a helpful AI assistant with access to various tools. You can help with coding, analysis, and general tasks.",
            "codewolf": "You are CodeWolf, a specialized coding assistant. You excel at code analysis, debugging, and development tasks.",
            "default": "You are a helpful AI assistant with access to tools and context awareness."
        }
        return prompts.get(assistant_type, prompts["default"])

    def _get_available_tools(self) -> List[Dict[str, Any]]:
        """Get available tools for the assistant."""
        return [
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
            },
            {
                "type": "function",
                "function": {
                    "name": "search_web",
                    "description": "Search the web for information",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query"
                            }
                        },
                        "required": ["query"]
                    }
                }
            }
        ]

    def update_config(self, config: OllamaConfig) -> None:
        """Update assistant configuration."""
        self.config = config

    async def cleanup(self) -> None:
        """Cleanup assistant resources."""
        pass
