"""🦊 Reynard vLLM Model Provider
===============================

High-performance model provider using vLLM for production-grade serving.
vLLM provides state-of-the-art throughput and latency through PagedAttention
and continuous batching optimizations.

Key Features:
- PagedAttention: Efficient memory management for large models
- Continuous Batching: Dynamic request batching for optimal GPU utilization
- High Throughput: Up to 24x higher throughput than standard inference
- OpenAI-Compatible API: Seamless integration with existing workflows
- Multi-GPU Support: Distributed serving across multiple GPUs
- Quantization Support: FP16, INT8, and INT4 quantization

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import json
import time
from typing import Any, AsyncGenerator, Dict, List, Optional

import httpx
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


class VLLMConfig(ModelProviderConfig):
    """Configuration for vLLM provider."""
    
    provider_type: ProviderType = ProviderType.VLLM
    base_url: str = "http://localhost:8000"
    max_model_length: int = 4096
    gpu_memory_utilization: float = 0.9
    max_num_seqs: int = 256
    max_num_batched_tokens: int = 8192
    enable_prefix_caching: bool = True
    quantization: Optional[str] = None  # "awq", "gptq", "squeezellm", "fp8"
    tensor_parallel_size: int = 1
    pipeline_parallel_size: int = 1
    trust_remote_code: bool = False
    enforce_eager: bool = False


class VLLMProvider(ModelProvider):
    """vLLM model provider for high-performance serving."""
    
    def __init__(self, config: VLLMConfig):
        """Initialize vLLM provider.
        
        Args:
            config: vLLM-specific configuration
        """
        super().__init__(config)
        self.config: VLLMConfig = config
        self.client: Optional[httpx.AsyncClient] = None
        self._available_models: List[ModelInfo] = []
    
    async def initialize(self) -> bool:
        """Initialize vLLM provider."""
        try:
            # Create HTTP client
            self.client = httpx.AsyncClient(
                base_url=self.config.base_url,
                timeout=self.config.timeout_seconds,
                limits=httpx.Limits(
                    max_keepalive_connections=self.config.max_concurrent_requests,
                    max_connections=self.config.max_concurrent_requests * 2,
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
            raise RuntimeError(f"Failed to initialize vLLM provider: {e}")
    
    async def shutdown(self) -> None:
        """Shutdown vLLM provider."""
        if self.client:
            await self.client.aclose()
            self.client = None
        self._initialized = False
    
    async def health_check(self) -> bool:
        """Check vLLM provider health."""
        try:
            if not self.client:
                return False
            
            response = await self.client.get("/health")
            is_healthy = response.status_code == 200
            
            self._health_status = "healthy" if is_healthy else "unhealthy"
            self._last_health_check = time.time()
            
            return is_healthy
            
        except Exception:
            self._health_status = "unhealthy"
            self._last_health_check = time.time()
            return False
    
    async def _load_available_models(self) -> None:
        """Load available models from vLLM server."""
        try:
            response = await self.client.get("/v1/models")
            response.raise_for_status()
            
            models_data = response.json()
            self._available_models = []
            
            for model_data in models_data.get("data", []):
                model_info = ModelInfo(
                    name=model_data["id"],
                    provider=ProviderType.VLLM,
                    capabilities=[
                        ModelCapability.CHAT,
                        ModelCapability.COMPLETION,
                        ModelCapability.STREAMING,
                        ModelCapability.BATCH_PROCESSING,
                    ],
                    max_tokens=self.config.max_model_length,
                    context_length=self.config.max_model_length,
                    supports_streaming=True,
                    supports_tools=True,  # vLLM supports function calling
                    description=f"vLLM served model: {model_data['id']}",
                    metadata=model_data,
                )
                self._available_models.append(model_info)
                
        except Exception as e:
            # If we can't load models, create a default one
            default_model = ModelInfo(
                name=self.config.default_model or "llama-2-7b-chat",
                provider=ProviderType.VLLM,
                capabilities=[
                    ModelCapability.CHAT,
                    ModelCapability.COMPLETION,
                    ModelCapability.STREAMING,
                    ModelCapability.BATCH_PROCESSING,
                ],
                max_tokens=self.config.max_model_length,
                context_length=self.config.max_model_length,
                supports_streaming=True,
                supports_tools=True,
                description="Default vLLM model",
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
        """Generate text completion using vLLM."""
        if not self.client:
            raise RuntimeError("vLLM provider not initialized")
        
        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")
        
        start_time = time.time()
        
        # Prepare request payload
        payload = {
            "model": model,
            "prompt": prompt,
            "max_tokens": max_tokens or 1000,
            "temperature": temperature or 0.7,
            "stream": False,
            **kwargs,
        }
        
        try:
            response = await self.client.post("/v1/completions", json=payload)
            response.raise_for_status()
            
            result_data = response.json()
            completion = result_data["choices"][0]["text"]
            
            processing_time = (time.time() - start_time) * 1000
            tokens_generated = result_data.get("usage", {}).get("completion_tokens", 0)
            
            # Update metrics
            self._metrics["requests_total"] += 1
            self._metrics["requests_successful"] += 1
            self._metrics["total_tokens_generated"] += tokens_generated
            self._update_average_latency(processing_time)
            
            return GenerationResult(
                text=completion,
                tokens_generated=tokens_generated,
                processing_time_ms=processing_time,
                model_used=model,
                provider=ProviderType.VLLM,
                metadata=result_data,
                finish_reason=result_data["choices"][0].get("finish_reason"),
            )
            
        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"vLLM completion failed: {e}")
    
    async def generate_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> ChatResult:
        """Generate chat completion using vLLM."""
        if not self.client:
            raise RuntimeError("vLLM provider not initialized")
        
        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")
        
        start_time = time.time()
        
        # Convert messages to vLLM format
        vllm_messages = []
        for msg in messages:
            vllm_msg = {"role": msg.role, "content": msg.content}
            if msg.name:
                vllm_msg["name"] = msg.name
            if msg.tool_calls:
                vllm_msg["tool_calls"] = msg.tool_calls
            if msg.tool_call_id:
                vllm_msg["tool_call_id"] = msg.tool_call_id
            vllm_messages.append(vllm_msg)
        
        # Prepare request payload
        payload = {
            "model": model,
            "messages": vllm_messages,
            "max_tokens": max_tokens or 1000,
            "temperature": temperature or 0.7,
            "stream": False,
            **kwargs,
        }
        
        if tools:
            payload["tools"] = tools
        
        try:
            response = await self.client.post("/v1/chat/completions", json=payload)
            response.raise_for_status()
            
            result_data = response.json()
            choice = result_data["choices"][0]
            message_data = choice["message"]
            
            # Convert response message
            response_message = ChatMessage(
                role=message_data["role"],
                content=message_data["content"],
                tool_calls=message_data.get("tool_calls"),
            )
            
            processing_time = (time.time() - start_time) * 1000
            tokens_generated = result_data.get("usage", {}).get("completion_tokens", 0)
            
            # Update metrics
            self._metrics["requests_total"] += 1
            self._metrics["requests_successful"] += 1
            self._metrics["total_tokens_generated"] += tokens_generated
            self._update_average_latency(processing_time)
            
            return ChatResult(
                message=response_message,
                tokens_generated=tokens_generated,
                processing_time_ms=processing_time,
                model_used=model,
                provider=ProviderType.VLLM,
                metadata=result_data,
                finish_reason=choice.get("finish_reason"),
            )
            
        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"vLLM chat completion failed: {e}")
    
    async def stream_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream text completion using vLLM."""
        if not self.client:
            raise RuntimeError("vLLM provider not initialized")
        
        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")
        
        # Prepare request payload
        payload = {
            "model": model,
            "prompt": prompt,
            "max_tokens": max_tokens or 1000,
            "temperature": temperature or 0.7,
            "stream": True,
            **kwargs,
        }
        
        try:
            async with self.client.stream("POST", "/v1/completions", json=payload) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]  # Remove "data: " prefix
                        if data.strip() == "[DONE]":
                            break
                        
                        try:
                            chunk_data = json.loads(data)
                            if "choices" in chunk_data and chunk_data["choices"]:
                                delta = chunk_data["choices"][0].get("text", "")
                                if delta:
                                    yield delta
                        except json.JSONDecodeError:
                            continue
                            
        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"vLLM streaming completion failed: {e}")
    
    async def stream_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> AsyncGenerator[ChatMessage, None]:
        """Stream chat completion using vLLM."""
        if not self.client:
            raise RuntimeError("vLLM provider not initialized")
        
        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")
        
        # Convert messages to vLLM format
        vllm_messages = []
        for msg in messages:
            vllm_msg = {"role": msg.role, "content": msg.content}
            if msg.name:
                vllm_msg["name"] = msg.name
            if msg.tool_calls:
                vllm_msg["tool_calls"] = msg.tool_calls
            if msg.tool_call_id:
                vllm_msg["tool_call_id"] = msg.tool_call_id
            vllm_messages.append(vllm_msg)
        
        # Prepare request payload
        payload = {
            "model": model,
            "messages": vllm_messages,
            "max_tokens": max_tokens or 1000,
            "temperature": temperature or 0.7,
            "stream": True,
            **kwargs,
        }
        
        if tools:
            payload["tools"] = tools
        
        try:
            async with self.client.stream("POST", "/v1/chat/completions", json=payload) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]  # Remove "data: " prefix
                        if data.strip() == "[DONE]":
                            break
                        
                        try:
                            chunk_data = json.loads(data)
                            if "choices" in chunk_data and chunk_data["choices"]:
                                delta = chunk_data["choices"][0].get("delta", {})
                                if delta:
                                    message = ChatMessage(
                                        role=delta.get("role", "assistant"),
                                        content=delta.get("content", ""),
                                        tool_calls=delta.get("tool_calls"),
                                    )
                                    yield message
                        except json.JSONDecodeError:
                            continue
                            
        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"vLLM streaming chat completion failed: {e}")
    
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
