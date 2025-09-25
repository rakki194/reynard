"""🦊 Reynard Ollama Model Provider
=================================

Model provider using Ollama for local LLM serving with ReynardAssistant integration.
Ollama provides easy-to-use local model serving with multi-model support and
streaming capabilities.

Key Features:
- Local Model Serving: Run models locally with minimal setup
- Multi-Model Support: Switch between different models dynamically
- Streaming Responses: Real-time response streaming
- ReynardAssistant Integration: Specialized assistant with tool calling
- Context Awareness: Maintain conversation context across interactions
- Tool Calling: Support for function calling and tool execution
- Easy Model Management: Simple model download and management

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import json
import time
from typing import Any, AsyncGenerator, Dict, List, Optional

import aiohttp
from pydantic import BaseModel

from ..interfaces.model_provider import (
    ChatMessage,
    ChatResult,
    GenerationResult,
    ModelCapability,
    ModelInfo,
    ModelProvider,
    ModelProviderConfig,
    ProviderType,
)


class OllamaConfig(ModelProviderConfig):
    """Configuration for Ollama provider."""
    
    provider_type: ProviderType = ProviderType.OLLAMA
    base_url: str = "http://localhost:11434"
    assistant_enabled: bool = True
    tools_enabled: bool = True
    context_awareness: bool = True
    keep_alive: str = "5m"  # Keep model in memory for 5 minutes
    num_ctx: int = 4096  # Context window size
    num_predict: int = 2048  # Maximum tokens to predict
    temperature: float = 0.7
    top_p: float = 0.9
    top_k: int = 40
    repeat_penalty: float = 1.1
    stop: List[str] = []


class OllamaStreamEvent(BaseModel):
    """Event model for streaming Ollama responses."""
    
    type: str  # "token", "tool_call", "complete", "error"
    data: str = ""
    timestamp: float
    metadata: Dict[str, Any] = {}


class OllamaProvider(ModelProvider):
    """Ollama model provider for local LLM serving."""
    
    def __init__(self, config: OllamaConfig):
        """Initialize Ollama provider.
        
        Args:
            config: Ollama-specific configuration
        """
        super().__init__(config)
        self.config: OllamaConfig = config
        self.client: Optional[aiohttp.ClientSession] = None
        self._available_models: List[ModelInfo] = []
        self._assistant_enabled = config.assistant_enabled
        self._tools_enabled = config.tools_enabled
        self._context_awareness = config.context_awareness
    
    async def initialize(self) -> bool:
        """Initialize Ollama provider."""
        try:
            # Create HTTP client
            timeout = aiohttp.ClientTimeout(total=self.config.timeout_seconds)
            self.client = aiohttp.ClientSession(
                base_url=self.config.base_url,
                timeout=timeout,
                connector=aiohttp.TCPConnector(
                    limit=self.config.max_concurrent_requests,
                    limit_per_host=self.config.max_concurrent_requests,
                ),
            )
            
            # Test connection and get available models
            await self._load_available_models()
            
            self._initialized = True
            self._health_status = "healthy"
            self._last_health_check = time.time()
            
            return True
            
        except Exception as e:
            self._health_status = "unhealthy"
            self._last_health_check = time.time()
            raise RuntimeError(f"Failed to initialize Ollama provider: {e}")
    
    async def shutdown(self) -> None:
        """Shutdown Ollama provider."""
        if self.client and not self.client.closed:
            await self.client.close()
            self.client = None
        self._initialized = False
    
    async def health_check(self) -> bool:
        """Check Ollama provider health."""
        try:
            if not self.client or self.client.closed:
                return False
            
            async with self.client.get("/api/tags") as response:
                is_healthy = response.status == 200
                
                self._health_status = "healthy" if is_healthy else "unhealthy"
                self._last_health_check = time.time()
                
                return is_healthy
                
        except Exception:
            self._health_status = "unhealthy"
            self._last_health_check = time.time()
            return False
    
    async def _load_available_models(self) -> None:
        """Load available models from Ollama server."""
        try:
            async with self.client.get("/api/tags") as response:
                response.raise_for_status()
                models_data = await response.json()
                
                self._available_models = []
                for model_data in models_data.get("models", []):
                    model_info = ModelInfo(
                        name=model_data["name"],
                        provider=ProviderType.OLLAMA,
                        capabilities=[
                            ModelCapability.CHAT,
                            ModelCapability.COMPLETION,
                            ModelCapability.STREAMING,
                        ],
                        max_tokens=self.config.num_predict,
                        context_length=self.config.num_ctx,
                        supports_streaming=True,
                        supports_tools=self._tools_enabled,
                        description=f"Ollama model: {model_data['name']}",
                        metadata={
                            "size": model_data.get("size", 0),
                            "digest": model_data.get("digest", ""),
                            "modified_at": model_data.get("modified_at", ""),
                        },
                    )
                    self._available_models.append(model_info)
                    
        except Exception as e:
            # If we can't load models, create a default one
            default_model = ModelInfo(
                name=self.config.default_model or "llama2:latest",
                provider=ProviderType.OLLAMA,
                capabilities=[
                    ModelCapability.CHAT,
                    ModelCapability.COMPLETION,
                    ModelCapability.STREAMING,
                ],
                max_tokens=self.config.num_predict,
                context_length=self.config.num_ctx,
                supports_streaming=True,
                supports_tools=self._tools_enabled,
                description="Default Ollama model",
                metadata={},
            )
            self._available_models = [default_model]
    
    async def get_available_models(self) -> List[ModelInfo]:
        """Get available models."""
        return self._available_models.copy()
    
    async def generate_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> GenerationResult:
        """Generate text completion using Ollama."""
        if not self.client:
            raise RuntimeError("Ollama provider not initialized")
        
        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")
        
        start_time = time.time()
        
        # Prepare request payload
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens or self.config.num_predict,
                "temperature": temperature or self.config.temperature,
                "top_p": self.config.top_p,
                "top_k": self.config.top_k,
                "repeat_penalty": self.config.repeat_penalty,
                "stop": self.config.stop,
                "num_ctx": self.config.num_ctx,
            },
            "keep_alive": self.config.keep_alive,
            **kwargs,
        }
        
        try:
            async with self.client.post("/api/generate", json=payload) as response:
                response.raise_for_status()
                result_data = await response.json()
                
                completion = result_data.get("response", "")
                processing_time = (time.time() - start_time) * 1000
                
                # Estimate tokens (Ollama doesn't always provide exact count)
                tokens_generated = len(completion.split()) * 1.3  # Rough estimation
                
                # Update metrics
                self._metrics["requests_total"] += 1
                self._metrics["requests_successful"] += 1
                self._metrics["total_tokens_generated"] += int(tokens_generated)
                self._update_average_latency(processing_time)
                
                return GenerationResult(
                    text=completion,
                    tokens_generated=int(tokens_generated),
                    processing_time_ms=processing_time,
                    model_used=model,
                    provider=ProviderType.OLLAMA,
                    metadata=result_data,
                    finish_reason=result_data.get("done_reason"),
                )
                
        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"Ollama completion failed: {e}")
    
    async def generate_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> ChatResult:
        """Generate chat completion using Ollama."""
        if not self.client:
            raise RuntimeError("Ollama provider not initialized")
        
        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")
        
        start_time = time.time()
        
        # Convert messages to Ollama format
        ollama_messages = []
        for msg in messages:
            ollama_msg = {"role": msg.role, "content": msg.content}
            if msg.name:
                ollama_msg["name"] = msg.name
            ollama_messages.append(ollama_msg)
        
        # Prepare request payload
        payload = {
            "model": model,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "num_predict": max_tokens or self.config.num_predict,
                "temperature": temperature or self.config.temperature,
                "top_p": self.config.top_p,
                "top_k": self.config.top_k,
                "repeat_penalty": self.config.repeat_penalty,
                "stop": self.config.stop,
                "num_ctx": self.config.num_ctx,
            },
            "keep_alive": self.config.keep_alive,
            **kwargs,
        }
        
        # Add tools if supported
        if tools and self._tools_enabled:
            payload["tools"] = tools
        
        try:
            async with self.client.post("/api/chat", json=payload) as response:
                response.raise_for_status()
                result_data = await response.json()
                
                message_data = result_data.get("message", {})
                response_message = ChatMessage(
                    role=message_data.get("role", "assistant"),
                    content=message_data.get("content", ""),
                    tool_calls=message_data.get("tool_calls"),
                )
                
                processing_time = (time.time() - start_time) * 1000
                
                # Estimate tokens
                tokens_generated = len(response_message.content.split()) * 1.3
                
                # Update metrics
                self._metrics["requests_total"] += 1
                self._metrics["requests_successful"] += 1
                self._metrics["total_tokens_generated"] += int(tokens_generated)
                self._update_average_latency(processing_time)
                
                return ChatResult(
                    message=response_message,
                    tokens_generated=int(tokens_generated),
                    processing_time_ms=processing_time,
                    model_used=model,
                    provider=ProviderType.OLLAMA,
                    metadata=result_data,
                    finish_reason=result_data.get("done_reason"),
                )
                
        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"Ollama chat completion failed: {e}")
    
    async def stream_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream text completion using Ollama."""
        if not self.client:
            raise RuntimeError("Ollama provider not initialized")
        
        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")
        
        # Prepare request payload
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "num_predict": max_tokens or self.config.num_predict,
                "temperature": temperature or self.config.temperature,
                "top_p": self.config.top_p,
                "top_k": self.config.top_k,
                "repeat_penalty": self.config.repeat_penalty,
                "stop": self.config.stop,
                "num_ctx": self.config.num_ctx,
            },
            "keep_alive": self.config.keep_alive,
            **kwargs,
        }
        
        try:
            async with self.client.post("/api/generate", json=payload) as response:
                response.raise_for_status()
                
                async for line in response.content:
                    if line:
                        try:
                            chunk_data = json.loads(line.decode('utf-8'))
                            if "response" in chunk_data:
                                yield chunk_data["response"]
                            if chunk_data.get("done", False):
                                break
                        except json.JSONDecodeError:
                            continue
                            
        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"Ollama streaming completion failed: {e}")
    
    async def stream_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> AsyncGenerator[ChatMessage, None]:
        """Stream chat completion using Ollama."""
        if not self.client:
            raise RuntimeError("Ollama provider not initialized")
        
        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")
        
        # Convert messages to Ollama format
        ollama_messages = []
        for msg in messages:
            ollama_msg = {"role": msg.role, "content": msg.content}
            if msg.name:
                ollama_msg["name"] = msg.name
            ollama_messages.append(ollama_msg)
        
        # Prepare request payload
        payload = {
            "model": model,
            "messages": ollama_messages,
            "stream": True,
            "options": {
                "num_predict": max_tokens or self.config.num_predict,
                "temperature": temperature or self.config.temperature,
                "top_p": self.config.top_p,
                "top_k": self.config.top_k,
                "repeat_penalty": self.config.repeat_penalty,
                "stop": self.config.stop,
                "num_ctx": self.config.num_ctx,
            },
            "keep_alive": self.config.keep_alive,
            **kwargs,
        }
        
        # Add tools if supported
        if tools and self._tools_enabled:
            payload["tools"] = tools
        
        try:
            async with self.client.post("/api/chat", json=payload) as response:
                response.raise_for_status()
                
                async for line in response.content:
                    if line:
                        try:
                            chunk_data = json.loads(line.decode('utf-8'))
                            if "message" in chunk_data:
                                message_data = chunk_data["message"]
                                if message_data.get("content"):
                                    message = ChatMessage(
                                        role=message_data.get("role", "assistant"),
                                        content=message_data["content"],
                                        tool_calls=message_data.get("tool_calls"),
                                    )
                                    yield message
                            if chunk_data.get("done", False):
                                break
                        except json.JSONDecodeError:
                            continue
                            
        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"Ollama streaming chat completion failed: {e}")
    
    async def generate_assistant_response(
        self,
        message: str,
        assistant_type: str = "reynard",
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        tools_enabled: bool = True,
        **kwargs
    ) -> ChatResult:
        """Generate response using ReynardAssistant with specialized prompts."""
        if not self._assistant_enabled:
            # Fall back to regular chat completion
            messages = [ChatMessage(role="user", content=message)]
            return await self.generate_chat_completion(
                messages, model, max_tokens, temperature, **kwargs
            )
        
        # Create system prompt based on assistant type
        system_prompt = self._get_system_prompt(assistant_type)
        
        # Get available tools if enabled
        tools = self._get_available_tools() if tools_enabled and self._tools_enabled else None
        
        # Create messages with system prompt
        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=message),
        ]
        
        return await self.generate_chat_completion(
            messages, model, max_tokens, temperature, tools, **kwargs
        )
    
    def _get_system_prompt(self, assistant_type: str) -> str:
        """Get system prompt based on assistant type."""
        prompts = {
            "reynard": "You are Reynard, a helpful AI assistant with access to various tools. You can help with coding, analysis, and general tasks. You are intelligent, curious, and protective of your users.",
            "codewolf": "You are CodeWolf, a specialized coding assistant. You excel at code analysis, debugging, and development tasks. You are strategic, focused, and relentless in solving problems.",
            "default": "You are a helpful AI assistant with access to tools and context awareness.",
        }
        return prompts.get(assistant_type, prompts["default"])
    
    def _get_available_tools(self) -> List[Dict[str, Any]]:
        """Get available tools for the assistant."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "search_code",
                    "description": "Search for code patterns or functions in the codebase",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query for code patterns"
                            },
                            "file_type": {
                                "type": "string",
                                "description": "File type to search in (optional)"
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "analyze_file",
                    "description": "Analyze a specific file for complexity, issues, or patterns",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to the file to analyze"
                            }
                        },
                        "required": ["file_path"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_project_info",
                    "description": "Get information about the current project structure and configuration",
                    "parameters": {
                        "type": "object",
                        "properties": {}
                    }
                }
            }
        ]
    
    def _update_average_latency(self, latency_ms: float) -> None:
        """Update average latency metric."""
        current_avg = self._metrics["average_latency_ms"]
        total_requests = self._metrics["requests_successful"]
        
        if total_requests == 1:
            self._metrics["average_latency_ms"] = latency_ms
        else:
            # Calculate running average
            new_avg = ((current_avg * (total_requests - 1)) + latency_ms) / total_requests
            self._metrics["average_latency_ms"] = new_avg
