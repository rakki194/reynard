"""🦊 Reynard SGLang Model Provider
=================================

Advanced model provider using SGLang for complex structured generation workflows.
SGLang provides RadixAttention and sophisticated workflow orchestration for
multi-step LLM applications and AI agents.

Key Features:
- RadixAttention: Automatic KV cache reuse across multiple generation calls
- Structured Generation: Domain-specific language for complex workflows
- Multi-Step Workflows: Support for chaining multiple LLM calls
- Tool Integration: Advanced function calling and tool orchestration
- High Performance: Up to 5x higher throughput for complex workloads
- Workflow Optimization: Automatic parallelization and cache reuse

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


class SGLangConfig(ModelProviderConfig):
    """Configuration for SGLang provider."""

    provider_type: ProviderType = ProviderType.SGLANG
    base_url: str = "http://localhost:30000"
    max_model_length: int = 8192
    gpu_memory_utilization: float = 0.9
    max_num_seqs: int = 128
    max_num_batched_tokens: int = 16384
    enable_radix_attention: bool = True
    enable_prefix_caching: bool = True
    quantization: Optional[str] = None  # "awq", "gptq", "fp8"
    tensor_parallel_size: int = 1
    pipeline_parallel_size: int = 1
    trust_remote_code: bool = False
    enable_speculative_decoding: bool = True
    speculative_decoding_draft_model: Optional[str] = None


class SGLangWorkflow(BaseModel):
    """SGLang workflow definition."""

    name: str
    steps: List[Dict[str, Any]]
    parallel_steps: Optional[List[List[str]]] = None
    cache_key: Optional[str] = None
    metadata: Dict[str, Any] = {}


class SGLangProvider(ModelProvider):
    """SGLang model provider for complex structured generation."""

    def __init__(self, config: SGLangConfig):
        """Initialize SGLang provider.

        Args:
            config: SGLang-specific configuration
        """
        super().__init__(config)
        self.config: SGLangConfig = config
        self.client: Optional[httpx.AsyncClient] = None
        self._available_models: List[ModelInfo] = []
        self._workflow_cache: Dict[str, Any] = {}

    async def initialize(self) -> bool:
        """Initialize SGLang provider."""
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
            raise RuntimeError(f"Failed to initialize SGLang provider: {e}")

    async def shutdown(self) -> None:
        """Shutdown SGLang provider."""
        if self.client:
            await self.client.aclose()
            self.client = None
        self._initialized = False
        self._workflow_cache.clear()

    async def health_check(self) -> bool:
        """Check SGLang provider health."""
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
        """Load available models from SGLang server."""
        try:
            response = await self.client.get("/v1/models")
            response.raise_for_status()

            models_data = response.json()
            self._available_models = []

            for model_data in models_data.get("data", []):
                model_info = ModelInfo(
                    name=model_data["id"],
                    provider=ProviderType.SGLANG,
                    capabilities=[
                        ModelCapability.CHAT,
                        ModelCapability.COMPLETION,
                        ModelCapability.STREAMING,
                        ModelCapability.BATCH_PROCESSING,
                        ModelCapability.STRUCTURED_OUTPUT,
                        ModelCapability.TOOL_CALLING,
                    ],
                    max_tokens=self.config.max_model_length,
                    context_length=self.config.max_model_length,
                    supports_streaming=True,
                    supports_tools=True,
                    description=f"SGLang served model: {model_data['id']}",
                    metadata=model_data,
                )
                self._available_models.append(model_info)

        except Exception as e:
            # If we can't load models, create a default one
            default_model = ModelInfo(
                name=self.config.default_model or "llama-3-8b-instruct",
                provider=ProviderType.SGLANG,
                capabilities=[
                    ModelCapability.CHAT,
                    ModelCapability.COMPLETION,
                    ModelCapability.STREAMING,
                    ModelCapability.BATCH_PROCESSING,
                    ModelCapability.STRUCTURED_OUTPUT,
                    ModelCapability.TOOL_CALLING,
                ],
                max_tokens=self.config.max_model_length,
                context_length=self.config.max_model_length,
                supports_streaming=True,
                supports_tools=True,
                description="Default SGLang model",
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
        **kwargs,
    ) -> GenerationResult:
        """Generate text completion using SGLang."""
        if not self.client:
            raise RuntimeError("SGLang provider not initialized")

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
                provider=ProviderType.SGLANG,
                metadata=result_data,
                finish_reason=result_data["choices"][0].get("finish_reason"),
            )

        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"SGLang completion failed: {e}")

    async def generate_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> ChatResult:
        """Generate chat completion using SGLang."""
        if not self.client:
            raise RuntimeError("SGLang provider not initialized")

        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")

        start_time = time.time()

        # Convert messages to SGLang format
        sglang_messages = []
        for msg in messages:
            sglang_msg = {"role": msg.role, "content": msg.content}
            if msg.name:
                sglang_msg["name"] = msg.name
            if msg.tool_calls:
                sglang_msg["tool_calls"] = msg.tool_calls
            if msg.tool_call_id:
                sglang_msg["tool_call_id"] = msg.tool_call_id
            sglang_messages.append(sglang_msg)

        # Prepare request payload
        payload = {
            "model": model,
            "messages": sglang_messages,
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
                provider=ProviderType.SGLANG,
                metadata=result_data,
                finish_reason=choice.get("finish_reason"),
            )

        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"SGLang chat completion failed: {e}")

    async def stream_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs,
    ) -> AsyncGenerator[str, None]:
        """Stream text completion using SGLang."""
        if not self.client:
            raise RuntimeError("SGLang provider not initialized")

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
            async with self.client.stream(
                "POST", "/v1/completions", json=payload
            ) as response:
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
            raise RuntimeError(f"SGLang streaming completion failed: {e}")

    async def stream_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> AsyncGenerator[ChatMessage, None]:
        """Stream chat completion using SGLang."""
        if not self.client:
            raise RuntimeError("SGLang provider not initialized")

        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")

        # Convert messages to SGLang format
        sglang_messages = []
        for msg in messages:
            sglang_msg = {"role": msg.role, "content": msg.content}
            if msg.name:
                sglang_msg["name"] = msg.name
            if msg.tool_calls:
                sglang_msg["tool_calls"] = msg.tool_calls
            if msg.tool_call_id:
                sglang_msg["tool_call_id"] = msg.tool_call_id
            sglang_messages.append(sglang_msg)

        # Prepare request payload
        payload = {
            "model": model,
            "messages": sglang_messages,
            "max_tokens": max_tokens or 1000,
            "temperature": temperature or 0.7,
            "stream": True,
            **kwargs,
        }

        if tools:
            payload["tools"] = tools

        try:
            async with self.client.stream(
                "POST", "/v1/chat/completions", json=payload
            ) as response:
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
            raise RuntimeError(f"SGLang streaming chat completion failed: {e}")

    async def execute_workflow(
        self, workflow: SGLangWorkflow, model: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        """Execute a structured workflow using SGLang.

        This is SGLang's key differentiator - the ability to execute
        complex multi-step workflows with automatic optimization.
        """
        if not self.client:
            raise RuntimeError("SGLang provider not initialized")

        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")

        start_time = time.time()

        # Prepare workflow payload
        payload = {
            "model": model,
            "workflow": workflow.dict(),
            **kwargs,
        }

        try:
            response = await self.client.post("/v1/workflows/execute", json=payload)
            response.raise_for_status()

            result_data = response.json()
            processing_time = (time.time() - start_time) * 1000

            # Update metrics
            self._metrics["requests_total"] += 1
            self._metrics["requests_successful"] += 1

            return {
                "workflow_name": workflow.name,
                "results": result_data,
                "processing_time_ms": processing_time,
                "model_used": model,
                "provider": ProviderType.SGLANG,
                "metadata": result_data.get("metadata", {}),
            }

        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"SGLang workflow execution failed: {e}")

    async def create_workflow_cache(
        self, cache_key: str, workflow: SGLangWorkflow, **kwargs
    ) -> None:
        """Create a workflow cache for RadixAttention optimization."""
        if not self.client:
            raise RuntimeError("SGLang provider not initialized")

        payload = {
            "cache_key": cache_key,
            "workflow": workflow.dict(),
            **kwargs,
        }

        try:
            response = await self.client.post("/v1/workflows/cache", json=payload)
            response.raise_for_status()

            self._workflow_cache[cache_key] = workflow

        except Exception as e:
            raise RuntimeError(f"SGLang workflow cache creation failed: {e}")

    def _update_average_latency(self, latency_ms: float) -> None:
        """Update average latency metric."""
        current_avg = self._metrics["average_latency_ms"]
        total_requests = self._metrics["requests_successful"]

        if total_requests == 1:
            self._metrics["average_latency_ms"] = latency_ms
        else:
            # Calculate running average
            new_avg = (
                (current_avg * (total_requests - 1)) + latency_ms
            ) / total_requests
            self._metrics["average_latency_ms"] = new_avg
