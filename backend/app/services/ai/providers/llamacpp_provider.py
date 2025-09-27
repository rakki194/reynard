"""🦊 Reynard LLaMA.cpp Model Provider
====================================

Lightweight model provider using LLaMA.cpp for edge deployments and resource-constrained environments.
LLaMA.cpp provides maximum portability and efficiency with minimal resource overhead.

Key Features:
- Maximum Portability: Runs on CPU, GPU, and edge devices
- Minimal Resource Usage: Extremely lightweight with small memory footprint
- Cross-Platform: Supports Windows, macOS, Linux, and embedded systems
- Quantization Support: 4-bit, 5-bit, 8-bit quantization for efficiency
- Apple Silicon: Native support for M1/M2/M3 chips with Metal acceleration
- WebAssembly: Can run in browsers and WebAssembly environments
- Grammar Constraints: Support for structured output generation

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


class LLaMACppConfig(ModelProviderConfig):
    """Configuration for LLaMA.cpp provider."""

    provider_type: ProviderType = ProviderType.LLAMACPP
    base_url: str = "http://localhost:8080"
    llama_model_path: Optional[str] = None
    n_ctx: int = 2048  # Context window size
    n_batch: int = 512  # Batch size for prompt processing
    n_threads: int = 4  # Number of threads for CPU inference
    n_gpu_layers: int = 0  # Number of layers to offload to GPU (0 = CPU only)
    use_mmap: bool = True  # Use memory mapping for model loading
    use_mlock: bool = False  # Lock model in memory
    low_vram: bool = False  # Use low VRAM mode
    f16_kv: bool = True  # Use 16-bit key-value cache
    logits_all: bool = False  # Return logits for all tokens
    vocab_only: bool = False  # Only load vocabulary
    use_mirostat: bool = False  # Use Mirostat sampling
    mirostat_eta: float = 0.1  # Mirostat learning rate
    mirostat_tau: float = 5.0  # Mirostat target entropy
    numa: bool = False  # Enable NUMA support
    embedding: bool = False  # Enable embedding mode
    grammar_file: Optional[str] = None  # Grammar file for structured output


class LLaMACppProvider(ModelProvider):
    """LLaMA.cpp model provider for lightweight edge deployments."""

    def __init__(self, config: LLaMACppConfig):
        """Initialize LLaMA.cpp provider.

        Args:
            config: LLaMA.cpp-specific configuration
        """
        super().__init__(config)
        self.config: LLaMACppConfig = config
        self.client: Optional[httpx.AsyncClient] = None
        self._available_models: List[ModelInfo] = []
        self._model_loaded = False

    async def initialize(self) -> bool:
        """Initialize LLaMA.cpp provider."""
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

            # Load default model if specified
            if self.config.default_model and not self._model_loaded:
                await self._load_model(self.config.default_model)

            self._initialized = True
            self._health_status = "healthy"
            self._last_health_check = time.time()

            return True

        except Exception as e:
            self._health_status = "unhealthy"
            self._last_health_check = time.time()
            raise RuntimeError(f"Failed to initialize LLaMA.cpp provider: {e}")

    async def shutdown(self) -> None:
        """Shutdown LLaMA.cpp provider."""
        if self.client:
            await self.client.aclose()
            self.client = None
        self._initialized = False
        self._model_loaded = False

    async def health_check(self) -> bool:
        """Check LLaMA.cpp provider health."""
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
        """Load available models from LLaMA.cpp server."""
        try:
            response = await self.client.get("/v1/models")
            response.raise_for_status()

            models_data = response.json()
            self._available_models = []

            for model_data in models_data.get("data", []):
                model_info = ModelInfo(
                    name=model_data["id"],
                    provider=ProviderType.LLAMACPP,
                    capabilities=[
                        ModelCapability.CHAT,
                        ModelCapability.COMPLETION,
                        ModelCapability.STREAMING,
                        ModelCapability.STRUCTURED_OUTPUT,  # Via grammar constraints
                    ],
                    max_tokens=self.config.n_ctx,
                    context_length=self.config.n_ctx,
                    supports_streaming=True,
                    supports_tools=False,  # LLaMA.cpp doesn't natively support tools
                    description=f"LLaMA.cpp served model: {model_data['id']}",
                    metadata=model_data,
                )
                self._available_models.append(model_info)

        except Exception as e:
            # If we can't load models, create a default one
            default_model = ModelInfo(
                name=self.config.default_model or "llama-2-7b-chat",
                provider=ProviderType.LLAMACPP,
                capabilities=[
                    ModelCapability.CHAT,
                    ModelCapability.COMPLETION,
                    ModelCapability.STREAMING,
                    ModelCapability.STRUCTURED_OUTPUT,
                ],
                max_tokens=self.config.n_ctx,
                context_length=self.config.n_ctx,
                supports_streaming=True,
                supports_tools=False,
                description="Default LLaMA.cpp model",
                metadata={},
            )
            self._available_models = [default_model]

    async def _load_model(self, model_name: str) -> bool:
        """Load a specific model in LLaMA.cpp server."""
        try:
            payload = {
                "name": model_name,
                "n_ctx": self.config.n_ctx,
                "n_batch": self.config.n_batch,
                "n_threads": self.config.n_threads,
                "n_gpu_layers": self.config.n_gpu_layers,
                "use_mmap": self.config.use_mmap,
                "use_mlock": self.config.use_mlock,
                "low_vram": self.config.low_vram,
                "f16_kv": self.config.f16_kv,
                "logits_all": self.config.logits_all,
                "vocab_only": self.config.vocab_only,
                "use_mirostat": self.config.use_mirostat,
                "mirostat_eta": self.config.mirostat_eta,
                "mirostat_tau": self.config.mirostat_tau,
                "numa": self.config.numa,
                "embedding": self.config.embedding,
            }

            if self.config.grammar_file:
                payload["grammar_file"] = self.config.grammar_file

            response = await self.client.post("/v1/models/load", json=payload)
            response.raise_for_status()

            self._model_loaded = True
            return True

        except Exception as e:
            raise RuntimeError(f"Failed to load model {model_name}: {e}")

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
        """Generate text completion using LLaMA.cpp."""
        if not self.client:
            raise RuntimeError("LLaMA.cpp provider not initialized")

        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")

        # Load model if not already loaded
        if not self._model_loaded:
            await self._load_model(model)

        start_time = time.time()

        # Prepare request payload
        payload = {
            "model": model,
            "prompt": prompt,
            "max_tokens": max_tokens or 1000,
            "temperature": temperature or 0.7,
            "stream": False,
            "n_ctx": self.config.n_ctx,
            "n_batch": self.config.n_batch,
            "n_threads": self.config.n_threads,
            "use_mirostat": self.config.use_mirostat,
            "mirostat_eta": self.config.mirostat_eta,
            "mirostat_tau": self.config.mirostat_tau,
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
                provider=ProviderType.LLAMACPP,
                metadata=result_data,
                finish_reason=result_data["choices"][0].get("finish_reason"),
            )

        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"LLaMA.cpp completion failed: {e}")

    async def generate_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> ChatResult:
        """Generate chat completion using LLaMA.cpp."""
        if not self.client:
            raise RuntimeError("LLaMA.cpp provider not initialized")

        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")

        # Load model if not already loaded
        if not self._model_loaded:
            await self._load_model(model)

        start_time = time.time()

        # Convert messages to LLaMA.cpp format
        llamacpp_messages = []
        for msg in messages:
            llamacpp_msg = {"role": msg.role, "content": msg.content}
            if msg.name:
                llamacpp_msg["name"] = msg.name
            llamacpp_messages.append(llamacpp_msg)

        # Prepare request payload
        payload = {
            "model": model,
            "messages": llamacpp_messages,
            "max_tokens": max_tokens or 1000,
            "temperature": temperature or 0.7,
            "stream": False,
            "n_ctx": self.config.n_ctx,
            "n_batch": self.config.n_batch,
            "n_threads": self.config.n_threads,
            "use_mirostat": self.config.use_mirostat,
            "mirostat_eta": self.config.mirostat_eta,
            "mirostat_tau": self.config.mirostat_tau,
            **kwargs,
        }

        # Note: LLaMA.cpp doesn't support tools natively
        if tools:
            # Could implement a workaround using structured prompts
            pass

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
                provider=ProviderType.LLAMACPP,
                metadata=result_data,
                finish_reason=choice.get("finish_reason"),
            )

        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"LLaMA.cpp chat completion failed: {e}")

    async def stream_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs,
    ) -> AsyncGenerator[str, None]:
        """Stream text completion using LLaMA.cpp."""
        if not self.client:
            raise RuntimeError("LLaMA.cpp provider not initialized")

        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")

        # Load model if not already loaded
        if not self._model_loaded:
            await self._load_model(model)

        # Prepare request payload
        payload = {
            "model": model,
            "prompt": prompt,
            "max_tokens": max_tokens or 1000,
            "temperature": temperature or 0.7,
            "stream": True,
            "n_ctx": self.config.n_ctx,
            "n_batch": self.config.n_batch,
            "n_threads": self.config.n_threads,
            "use_mirostat": self.config.use_mirostat,
            "mirostat_eta": self.config.mirostat_eta,
            "mirostat_tau": self.config.mirostat_tau,
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
            raise RuntimeError(f"LLaMA.cpp streaming completion failed: {e}")

    async def stream_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs,
    ) -> AsyncGenerator[ChatMessage, None]:
        """Stream chat completion using LLaMA.cpp."""
        if not self.client:
            raise RuntimeError("LLaMA.cpp provider not initialized")

        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")

        # Load model if not already loaded
        if not self._model_loaded:
            await self._load_model(model)

        # Convert messages to LLaMA.cpp format
        llamacpp_messages = []
        for msg in messages:
            llamacpp_msg = {"role": msg.role, "content": msg.content}
            if msg.name:
                llamacpp_msg["name"] = msg.name
            llamacpp_messages.append(llamacpp_msg)

        # Prepare request payload
        payload = {
            "model": model,
            "messages": llamacpp_messages,
            "max_tokens": max_tokens or 1000,
            "temperature": temperature or 0.7,
            "stream": True,
            "n_ctx": self.config.n_ctx,
            "n_batch": self.config.n_batch,
            "n_threads": self.config.n_threads,
            "use_mirostat": self.config.use_mirostat,
            "mirostat_eta": self.config.mirostat_eta,
            "mirostat_tau": self.config.mirostat_tau,
            **kwargs,
        }

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
                                    )
                                    yield message
                        except json.JSONDecodeError:
                            continue

        except Exception as e:
            self._metrics["requests_total"] += 1
            self._metrics["requests_failed"] += 1
            raise RuntimeError(f"LLaMA.cpp streaming chat completion failed: {e}")

    async def generate_embedding(
        self, text: str, model: Optional[str] = None, **kwargs
    ) -> List[float]:
        """Generate embedding using LLaMA.cpp (if embedding mode is enabled)."""
        if not self.config.embedding:
            raise RuntimeError("Embedding mode not enabled in LLaMA.cpp configuration")

        if not self.client:
            raise RuntimeError("LLaMA.cpp provider not initialized")

        model = model or self.config.default_model
        if not model:
            raise ValueError("No model specified and no default model configured")

        payload = {
            "model": model,
            "input": text,
            **kwargs,
        }

        try:
            response = await self.client.post("/v1/embeddings", json=payload)
            response.raise_for_status()

            result_data = response.json()
            return result_data["data"][0]["embedding"]

        except Exception as e:
            raise RuntimeError(f"LLaMA.cpp embedding generation failed: {e}")

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
