"""ComfyUI Integration Service

Provides workflow automation, queue management, and image generation
capabilities through ComfyUI integration.
"""

import asyncio
import hashlib
import json
import logging
import time
from collections.abc import AsyncGenerator
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any

import aiohttp

logger = logging.getLogger(__name__)


@dataclass
class QueueResult:
    """Result of queueing a workflow."""

    prompt_id: str
    client_id: str | None = None


@dataclass
class ValidationResult:
    """Result of validation operations."""

    is_valid: bool
    suggestions: list[str]
    errors: list[str]


class ConnectionState(Enum):
    """ComfyUI connection states."""

    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    RECONNECTING = "reconnecting"


class ComfyService:
    """Service for ComfyUI integration."""

    def __init__(self):
        self._enabled: bool = False
        self._api_url: str | None = None
        self._timeout: int = 60
        self._image_dir: Path = Path("generated/comfy")

        # Connection state
        self._connection_state: ConnectionState = ConnectionState.DISCONNECTED
        self._connection_attempts: int = 0
        self._last_ok_ts: float | None = None

        # Caching
        self._object_info_cache: dict[str, Any] | None = None
        self._object_info_cache_ts: float = 0.0
        self._object_info_ttl_seconds: int = 86400  # 24 hours
        self._object_info_etag: str | None = None

        # HTTP session
        self._session: aiohttp.ClientSession | None = None

        # Reconnection settings
        self._reconnect_max_attempts: int = 5
        self._reconnect_base_delay_s: float = 0.5
        self._reconnect_max_delay_s: float = 30.0
        self._reconnection_task: asyncio.Task | None = None

    async def initialize(self, config: dict[str, Any]) -> bool:
        """Initialize the ComfyUI service."""
        try:
            self._enabled = config.get("comfy_enabled", False)
            self._api_url = config.get("comfy_api_url", "http://127.0.0.1:8188")
            self._timeout = config.get("comfy_timeout", 60)
            self._image_dir = Path(
                config.get("comfy_image_dir", "generated/comfy"),
            ).resolve()

            # Apply reconnection settings
            self._reconnect_max_attempts = config.get("comfy_reconnect_max_attempts", 5)
            self._reconnect_base_delay_s = config.get(
                "comfy_reconnect_base_delay_s",
                0.5,
            )
            self._reconnect_max_delay_s = config.get(
                "comfy_reconnect_max_delay_s",
                30.0,
            )

            if self._enabled:
                self._image_dir.mkdir(parents=True, exist_ok=True)
                await self._initialize_session()
                logger.info(f"ComfyService initialized with API URL: {self._api_url}")

            return True
        except Exception as e:
            logger.error(f"ComfyService initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the ComfyUI service."""
        if self._reconnection_task and not self._reconnection_task.done():
            self._reconnection_task.cancel()

        if self._session and not self._session.closed:
            await self._session.close()

    async def _initialize_session(self) -> None:
        """Initialize the HTTP session."""
        if self._session and not self._session.closed:
            await self._session.close()

        timeout = aiohttp.ClientTimeout(total=self._timeout)
        self._session = aiohttp.ClientSession(timeout=timeout)

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session."""
        if self._session is None or self._session.closed:
            await self._initialize_session()
        return self._session

    async def health_check(self) -> dict[str, Any]:
        """Perform health check."""
        try:
            if not self._enabled:
                return {"status": "disabled", "enabled": False}

            session = await self._get_session()
            async with session.get(f"{self._api_url}/") as resp:
                if resp.status == 200:
                    if self._connection_state != ConnectionState.CONNECTED:
                        self._connection_state = ConnectionState.CONNECTED
                        self._connection_attempts = 0
                    self._last_ok_ts = time.time()
                    return {"status": "healthy", "enabled": True}
                await self._handle_connection_loss()
                return {"status": "unhealthy", "enabled": True}
        except Exception as e:
            await self._handle_connection_loss()
            return {"status": "unhealthy", "enabled": True, "error": str(e)}

    async def _handle_connection_loss(self) -> None:
        """Handle connection loss."""
        if self._connection_state == ConnectionState.CONNECTED:
            logger.warning("ComfyUI connection lost")

        if self._connection_state != ConnectionState.RECONNECTING:
            self._connection_state = ConnectionState.DISCONNECTED
            await self._start_reconnection_loop()

    async def _start_reconnection_loop(self) -> None:
        """Start reconnection loop."""
        if self._reconnection_task and not self._reconnection_task.done():
            return

        self._reconnection_task = asyncio.create_task(self._reconnection_loop())

    async def _reconnection_loop(self) -> None:
        """Reconnection loop with exponential backoff."""
        if not self._enabled:
            return

        self._connection_state = ConnectionState.RECONNECTING
        self._connection_attempts = 0
        delay = self._reconnect_base_delay_s

        while self._connection_attempts < self._reconnect_max_attempts:
            self._connection_attempts += 1

            try:
                session = await self._get_session()
                async with session.get(f"{self._api_url}/") as resp:
                    if resp.status == 200:
                        logger.info(
                            f"ComfyUI reconnected after {self._connection_attempts} attempts",
                        )
                        self._connection_state = ConnectionState.CONNECTED
                        self._last_ok_ts = time.time()
                        self._connection_attempts = 0
                        return
            except Exception:
                pass

            # Exponential backoff with jitter
            effective_delay = min(
                delay * (1.0 + (self._connection_attempts - 1) * 0.5),
                self._reconnect_max_delay_s,
            )
            logger.info(
                f"ComfyUI reconnection attempt {self._connection_attempts}, retrying in {effective_delay:.1f}s",
            )

            await asyncio.sleep(effective_delay)
            delay = min(delay * 2, self._reconnect_max_delay_s)

        logger.error("ComfyUI reconnection failed after maximum attempts")
        self._connection_state = ConnectionState.DISCONNECTED

    async def queue_prompt(
        self,
        workflow: dict[str, Any],
        client_id: str | None = None,
    ) -> QueueResult:
        """Queue a workflow for execution."""
        if not self._enabled:
            raise RuntimeError("ComfyUI integration disabled")

        try:
            session = await self._get_session()
            payload = {"prompt": workflow}
            if client_id:
                payload["client_id"] = client_id

            async with session.post(f"{self._api_url}/prompt", json=payload) as resp:
                resp.raise_for_status()
                result = await resp.json()

                return QueueResult(
                    prompt_id=str(result.get("prompt_id")),
                    client_id=result.get("client_id"),
                )
        except Exception as e:
            await self._handle_connection_loss()
            raise RuntimeError(f"Failed to queue prompt: {e}")

    async def check_status(self, prompt_id: str) -> dict[str, Any]:
        """Check the status of a queued prompt."""
        if not self._enabled:
            raise RuntimeError("ComfyUI integration disabled")

        try:
            session = await self._get_session()

            # Try history first
            try:
                async with session.get(f"{self._api_url}/history/{prompt_id}") as resp:
                    if resp.status == 404:
                        return {
                            "status": "pending",
                            "progress": 0.0,
                            "images": [],
                            "error": None,
                        }
                    if resp.status != 200:
                        return {
                            "status": "error",
                            "progress": 0.0,
                            "images": [],
                            "error": f"HTTP {resp.status}",
                        }

                    data = await resp.json()
                    if isinstance(data, dict) and prompt_id in data:
                        item = data[prompt_id]
                        if isinstance(item, dict) and item.get("outputs"):
                            images = self._extract_images(item)
                            return {
                                "status": "completed",
                                "progress": 1.0,
                                "images": images,
                                "error": None,
                            }

                        progress = (
                            float(item.get("progress", 0.0))
                            if isinstance(item, dict)
                            else 0.0
                        )
                        return {
                            "status": "processing",
                            "progress": progress,
                            "images": [],
                            "error": None,
                        }
            except Exception:
                pass

            # Fallback to queue check
            try:
                async with session.get(f"{self._api_url}/prompt") as resp:
                    if resp.status == 200:
                        queue_data = await resp.json()
                        executing = queue_data.get("executing") or {}
                        if executing.get("prompt_id") == prompt_id:
                            return {
                                "status": "processing",
                                "progress": executing.get("progress", 0.0),
                                "images": [],
                                "error": None,
                            }

                        for item in queue_data.get("queue", []) or []:
                            if item.get("prompt_id") == prompt_id:
                                return {
                                    "status": "pending",
                                    "progress": 0.0,
                                    "images": [],
                                    "error": None,
                                }
            except Exception:
                pass

            return {"status": "pending", "progress": 0.0, "images": [], "error": None}

        except Exception as e:
            await self._handle_connection_loss()
            raise RuntimeError(f"Failed to check status: {e}")

    async def get_image(
        self,
        filename: str,
        subfolder: str = "",
        type_: str = "output",
    ) -> bytes:
        """Retrieve a generated image."""
        if not self._enabled:
            raise RuntimeError("ComfyUI integration disabled")

        try:
            session = await self._get_session()
            params = {"filename": filename, "subfolder": subfolder, "type": type_}

            async with session.get(f"{self._api_url}/view", params=params) as resp:
                resp.raise_for_status()
                return await resp.read()
        except Exception as e:
            await self._handle_connection_loss()
            raise RuntimeError(f"Failed to get image: {e}")

    async def get_history(self, prompt_id: str) -> dict[str, Any]:
        """Get the history for a prompt."""
        if not self._enabled:
            raise RuntimeError("ComfyUI integration disabled")

        try:
            session = await self._get_session()
            async with session.get(f"{self._api_url}/history/{prompt_id}") as resp:
                if resp.status == 404:
                    return {}
                resp.raise_for_status()
                return await resp.json()
        except Exception as e:
            await self._handle_connection_loss()
            raise RuntimeError(f"Failed to get history: {e}")

    async def get_object_info(self, force_refresh: bool = False) -> dict[str, Any]:
        """Get ComfyUI object information."""
        if not self._enabled:
            raise RuntimeError("ComfyUI integration disabled")

        now = time.time()
        if (
            not force_refresh
            and self._object_info_cache is not None
            and (now - self._object_info_cache_ts) < self._object_info_ttl_seconds
        ):
            return self._object_info_cache

        try:
            session = await self._get_session()
            async with session.get(f"{self._api_url}/object_info") as resp:
                resp.raise_for_status()
                info = await resp.json()

                self._object_info_cache = info
                self._object_info_cache_ts = now
                self._object_info_etag = self._generate_etag(info)

                return info
        except Exception as e:
            await self._handle_connection_loss()
            raise RuntimeError(f"Failed to get object info: {e}")

    def _generate_etag(self, data: dict[str, Any]) -> str:
        """Generate ETag for object info data."""
        content = json.dumps(data, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()

    def get_object_info_etag(self) -> str | None:
        """Get current ETag for object info cache."""
        return self._object_info_etag

    async def stream_status(self, prompt_id: str) -> AsyncGenerator[dict[str, Any]]:
        """Stream status updates for a prompt."""
        if not self._enabled:
            yield {"type": "error", "message": "ComfyUI integration disabled"}
            return

        last_status = None
        while True:
            try:
                status = await self.check_status(prompt_id)
                current = status.get("status")

                if current != last_status:
                    yield {"type": "status", "data": status}
                    last_status = current

                if current in ("completed", "error"):
                    break

                await asyncio.sleep(0.75)
            except Exception as e:
                yield {"type": "error", "message": str(e)}
                break

    def _extract_images(self, history_item: dict[str, Any]) -> list[dict[str, Any]]:
        """Extract images from history item."""
        outputs = history_item.get("outputs", {})
        images = []

        for node_id, node_output in outputs.items():
            imgs = node_output.get("images")
            if not imgs:
                continue

            for img in imgs:
                images.append(
                    {
                        "filename": img.get("filename"),
                        "subfolder": img.get("subfolder", ""),
                        "type": img.get("type", "output"),
                    },
                )

        return images

    async def validate_checkpoint(self, checkpoint: str) -> ValidationResult:
        """Validate checkpoint and suggest alternatives."""
        if not self._enabled:
            return ValidationResult(False, [], ["ComfyUI integration disabled"])

        try:
            info = await self.get_object_info()
            checkpoints = self._extract_checkpoints_from_info(info)

            is_valid = checkpoint in checkpoints
            suggestions = []
            errors = []

            if not is_valid:
                errors.append(f"Checkpoint '{checkpoint}' not found")
                suggestions = checkpoints[:3]  # Suggest first 3 available

            return ValidationResult(is_valid, suggestions, errors)
        except Exception as e:
            return ValidationResult(False, [], [f"Validation error: {e!s}"])

    async def validate_lora(self, lora: str) -> ValidationResult:
        """Validate LoRA and suggest alternatives."""
        if not self._enabled:
            return ValidationResult(False, [], ["ComfyUI integration disabled"])

        try:
            info = await self.get_object_info()
            loras = self._extract_loras_from_info(info)

            is_valid = lora in loras
            suggestions = []
            errors = []

            if not is_valid:
                errors.append(f"LoRA '{lora}' not found")
                suggestions = loras[:3]  # Suggest first 3 available

            return ValidationResult(is_valid, suggestions, errors)
        except Exception as e:
            return ValidationResult(False, [], [f"Validation error: {e!s}"])

    async def validate_sampler(self, sampler: str) -> ValidationResult:
        """Validate sampler and suggest alternatives."""
        if not self._enabled:
            return ValidationResult(False, [], ["ComfyUI integration disabled"])

        try:
            info = await self.get_object_info()
            samplers = self._extract_samplers_from_info(info)

            is_valid = sampler in samplers
            suggestions = []
            errors = []

            if not is_valid:
                errors.append(f"Sampler '{sampler}' not found")
                suggestions = samplers[:3]  # Suggest first 3 available

            return ValidationResult(is_valid, suggestions, errors)
        except Exception as e:
            return ValidationResult(False, [], [f"Validation error: {e!s}"])

    async def validate_scheduler(self, scheduler: str) -> ValidationResult:
        """Validate scheduler and suggest alternatives."""
        if not self._enabled:
            return ValidationResult(False, [], ["ComfyUI integration disabled"])

        try:
            info = await self.get_object_info()
            schedulers = self._extract_schedulers_from_info(info)

            is_valid = scheduler in schedulers
            suggestions = []
            errors = []

            if not is_valid:
                errors.append(f"Scheduler '{scheduler}' not found")
                suggestions = schedulers[:3]  # Suggest first 3 available

            return ValidationResult(is_valid, suggestions, errors)
        except Exception as e:
            return ValidationResult(False, [], [f"Validation error: {e!s}"])

    def _extract_checkpoints_from_info(self, info: dict[str, Any]) -> list[str]:
        """Extract checkpoint names from object info."""
        checkpoints = []
        try:
            # Try standard CheckpointLoaderSimple path
            ckpt_info = (
                info.get("CheckpointLoaderSimple", {})
                .get("input", {})
                .get("required", {})
                .get("ckpt_name")
            )
            if isinstance(ckpt_info, list) and ckpt_info:
                checkpoints = (
                    ckpt_info[0] if isinstance(ckpt_info[0], list) else ckpt_info
                )

            # Fallback: search all nodes for checkpoint parameters
            if not checkpoints:
                for node_type, node_info in info.items():
                    if isinstance(node_info, dict):
                        for param_name, param_info in (
                            node_info.get("input", {}).get("required", {}).items()
                        ):
                            if str(param_name).lower() in (
                                "ckpt_name",
                                "checkpoint",
                                "model_name",
                            ):
                                if isinstance(param_info, list) and param_info:
                                    checkpoints = (
                                        param_info[0]
                                        if isinstance(param_info[0], list)
                                        else param_info
                                    )
                                    break
                    if checkpoints:
                        break
        except Exception as e:
            logger.warning(f"Failed to get checkpoints: {e}")
        return checkpoints

    def _extract_loras_from_info(self, info: dict[str, Any]) -> list[str]:
        """Extract LoRA names from object info."""
        loras = []
        try:
            # Try standard LoraLoader path
            lora_info = (
                info.get("LoraLoader", {})
                .get("input", {})
                .get("required", {})
                .get("lora_name")
            )
            if isinstance(lora_info, list) and lora_info:
                loras = lora_info[0] if isinstance(lora_info[0], list) else lora_info

            # Fallback: search all nodes for LoRA parameters
            if not loras:
                for node_type, node_info in info.items():
                    if ("Lora" in str(node_type)) or ("LoRA" in str(node_type)):
                        for param_name, param_info in (
                            node_info.get("input", {}).get("required", {}).items()
                        ):
                            if str(param_name).lower() in ("lora_name", "lora"):
                                if isinstance(param_info, list) and param_info:
                                    loras = (
                                        param_info[0]
                                        if isinstance(param_info[0], list)
                                        else param_info
                                    )
                                    break
                    if loras:
                        break
        except Exception:
            pass
        return loras

    def _extract_samplers_from_info(self, info: dict[str, Any]) -> list[str]:
        """Extract sampler names from object info."""
        samplers = []
        try:
            # Try standard KSampler path
            sampler_info = (
                info.get("KSampler", {})
                .get("input", {})
                .get("required", {})
                .get("sampler_name")
            )
            if isinstance(sampler_info, list) and sampler_info:
                samplers = (
                    sampler_info[0]
                    if isinstance(sampler_info[0], list)
                    else sampler_info
                )
        except Exception:
            pass
        return samplers

    def _extract_schedulers_from_info(self, info: dict[str, Any]) -> list[str]:
        """Extract scheduler names from object info."""
        schedulers = []
        try:
            # Try standard KSampler path
            scheduler_info = (
                info.get("KSampler", {})
                .get("input", {})
                .get("required", {})
                .get("scheduler")
            )
            if isinstance(scheduler_info, list) and scheduler_info:
                schedulers = (
                    scheduler_info[0]
                    if isinstance(scheduler_info[0], list)
                    else scheduler_info
                )
        except Exception:
            pass
        return schedulers

    def get_info(self) -> dict[str, Any]:
        """Get service information."""
        return {
            "enabled": self._enabled,
            "api_url": self._api_url,
            "timeout": self._timeout,
            "image_dir": str(self._image_dir),
            "connection_state": self._connection_state.value,
            "connection_attempts": self._connection_attempts,
            "last_ok_iso": (
                None
                if self._last_ok_ts is None
                else datetime.fromtimestamp(self._last_ok_ts).isoformat()
            ),
        }
