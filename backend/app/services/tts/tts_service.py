"""TTS Service for Reynard Backend

Main TTS service orchestrator with multi-backend support (Kokoro, Coqui, XTTS).
"""

import asyncio
import logging
import time
from pathlib import Path
from typing import Any

logger = logging.getLogger("uvicorn")


class TTSService:
    """Main TTS service orchestrator."""

    def __init__(self):
        self._enabled = False
        self._backend = "kokoro"
        self._kokoro_mode = "powersave"
        self._audio_dir: Path = Path("generated/audio")
        self._kokoro_warmed: bool = False
        self._loaded_backends: set[str] = set()
        self._rvc_enabled: bool = False

        # Kokoro mode management
        self._kokoro_unload_timer: float | None = None
        self._kokoro_unload_delay: int = 300  # 5 minutes in powersave mode
        self._kokoro_prewarm_threshold: int = (
            10  # Prewarm after 10 requests in normal mode
        )
        self._kokoro_request_count: int = 0
        self._kokoro_last_used: float | None = None

        # Guardrails and limits
        self._max_text_length: int = 10000
        self._max_chunk_length: int = 2000
        self._chunk_overlap_chars: int = 100
        self._backend_health_check_interval: int = 300
        self._backend_timeout_seconds: int = 30
        self._enable_voice_compatibility_checks: bool = True
        self._enable_language_validation: bool = True
        self._allowed_languages: list[str] = [
            "en",
            "es",
            "fr",
            "de",
            "it",
            "pt",
            "ru",
            "zh",
            "ja",
            "ko",
        ]
        self._rate_limit_per_minute: int = 60
        self._last_backend_health_check: float = 0.0
        self._backend_health_status: dict[str, bool] = {}

        # Metrics
        self._metrics: dict[str, Any] = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_processing_time": 0.0,
            "average_processing_time": 0.0,
            "backend_usage": {},
            "voice_usage": {},
            "total_audio_duration": 0.0,
        }

        # Backend services
        self._backend_services: dict[str, Any] = {}
        self._audio_processor = None

    async def initialize(self, config: dict[str, Any]) -> bool:
        """Initialize the TTS service."""
        try:
            self._enabled = config.get("tts_enabled", False)
            self._backend = config.get("tts_default_backend", "kokoro")
            self._kokoro_mode = config.get("tts_kokoro_mode", "powersave")
            self._audio_dir = Path(
                config.get("tts_audio_dir", "generated/audio"),
            ).resolve()
            self._rvc_enabled = config.get("tts_rvc_enabled", False)

            # Load guardrails configuration
            self._max_text_length = config.get("tts_max_text_length", 10000)
            self._max_chunk_length = config.get("tts_max_chunk_length", 2000)
            self._chunk_overlap_chars = config.get("tts_chunk_overlap_chars", 100)
            self._backend_health_check_interval = config.get(
                "tts_backend_health_check_interval", 300,
            )
            self._backend_timeout_seconds = config.get(
                "tts_backend_timeout_seconds", 30,
            )
            self._enable_voice_compatibility_checks = config.get(
                "tts_enable_voice_compatibility_checks", True,
            )
            self._enable_language_validation = config.get(
                "tts_enable_language_validation", True,
            )
            self._rate_limit_per_minute = config.get("tts_rate_limit_per_minute", 60)

            if not self._enabled:
                logger.info("TTS service disabled by configuration")
                return True

            # Create audio directory
            self._audio_dir.mkdir(parents=True, exist_ok=True)

            # Initialize audio processor
            from .audio_processor import AudioProcessor

            self._audio_processor = AudioProcessor()
            await self._audio_processor.initialize(config)

            # Initialize backend services
            await self._initialize_backends()

            logger.info("TTS service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"TTS service initialization failed: {e}")
            return False

    async def _initialize_backends(self):
        """Initialize TTS backend services."""
        try:
            # Initialize Kokoro backend
            from ...integration.tts.kokoro_backend import KokoroBackend

            self._backend_services["kokoro"] = KokoroBackend(mode=self._kokoro_mode)
            await self._backend_services["kokoro"].initialize()

            # Initialize Coqui backend
            from ...integration.tts.coqui_backend import CoquiBackend

            self._backend_services["coqui"] = CoquiBackend()
            await self._backend_services["coqui"].initialize()

            # Initialize XTTS backend
            from ...integration.tts.xtts_backend import XTTSBackend

            self._backend_services["xtts"] = XTTSBackend()
            await self._backend_services["xtts"].initialize()

            logger.info("TTS backends initialized successfully")
        except Exception as e:
            logger.warning(f"Some TTS backends failed to initialize: {e}")

    async def synthesize_text(
        self,
        text: str,
        backend: str | None = None,
        voice: str = "default",
        speed: float = 1.0,
        lang: str = "en",
        to_ogg: bool = False,
        to_opus: bool = False,
    ) -> dict[str, Any]:
        """Synthesize text to speech."""
        start_time = time.time()
        operation_id = f"tts_{int(time.time())}"

        try:
            logger.debug(
                f"Starting TTS synthesis: text_length={len(text)}, backend={backend}, voice={voice}",
            )

            # Validate inputs
            self._validate_text_length(text)
            self._validate_language(lang)

            # Determine backend
            backend_name = backend or self._backend
            mapped_voice = self._map_default_voice(backend_name, voice)

            self._validate_voice_compatibility(backend_name, mapped_voice)

            # Handle Kokoro-specific behavior
            if backend_name == "kokoro":
                await self._handle_kokoro_usage()

            # Check backend health
            if not await self._check_backend_health(backend_name):
                raise ValueError(f"Backend {backend_name} is not healthy")

            # Perform synthesis
            backend_service = self._backend_services.get(backend_name)
            if not backend_service:
                raise ValueError(f"Backend {backend_name} not available")

            # Generate output path
            output_path = self._audio_dir / f"{operation_id}.wav"

            # Synthesize audio
            audio_path = await backend_service.synthesize(
                text=text,
                out_path=output_path,
                voice=mapped_voice,
                speed=speed,
                lang=lang,
            )

            # Process audio if needed
            if to_ogg or to_opus:
                audio_path = await self._audio_processor.process_audio(
                    audio_path, to_ogg=to_ogg, to_opus=to_opus,
                )

            processing_time = time.time() - start_time

            # Update metrics
            self._update_metrics(backend_name, mapped_voice, processing_time, True)

            return {
                "success": True,
                "audio_path": str(audio_path),
                "audio_url": f"/api/tts/audio/{audio_path.name}",
                "duration": await self._get_audio_duration(audio_path),
                "backend_used": backend_name,
                "processing_time": processing_time,
                "error": None,
            }

        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"TTS synthesis failed: {e}")

            # Update metrics
            self._update_metrics(
                backend or self._backend, voice, processing_time, False,
            )

            return {
                "success": False,
                "audio_path": None,
                "audio_url": None,
                "duration": None,
                "backend_used": backend or self._backend,
                "processing_time": processing_time,
                "error": str(e),
            }

    async def synthesize_batch(
        self,
        texts: list[str],
        backend: str | None = None,
        voice: str = "default",
        speed: float = 1.0,
        lang: str = "en",
        to_ogg: bool = False,
        to_opus: bool = False,
    ) -> dict[str, Any]:
        """Synthesize multiple texts to speech."""
        start_time = time.time()
        results = []

        try:
            # Process texts in parallel with limited concurrency
            semaphore = asyncio.Semaphore(3)  # Limit concurrent synthesis

            async def synthesize_single(text: str, index: int) -> dict[str, Any]:
                async with semaphore:
                    result = await self.synthesize_text(
                        text=text,
                        backend=backend,
                        voice=voice,
                        speed=speed,
                        lang=lang,
                        to_ogg=to_ogg,
                        to_opus=to_opus,
                    )
                    result["index"] = index
                    return result

            # Execute all synthesis tasks
            tasks = [synthesize_single(text, i) for i, text in enumerate(texts)]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Process results
            processed_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    processed_results.append(
                        {
                            "success": False,
                            "audio_path": None,
                            "audio_url": None,
                            "duration": None,
                            "backend_used": backend or self._backend,
                            "processing_time": 0.0,
                            "error": str(result),
                            "index": i,
                        },
                    )
                else:
                    processed_results.append(result)

            total_processing_time = time.time() - start_time
            successful_count = sum(1 for r in processed_results if r["success"])

            return {
                "success": successful_count > 0,
                "results": processed_results,
                "total_processing_time": total_processing_time,
                "error": (
                    None
                    if successful_count == len(texts)
                    else f"{len(texts) - successful_count} failed"
                ),
            }

        except Exception as e:
            total_processing_time = time.time() - start_time
            logger.error(f"Batch TTS synthesis failed: {e}")
            return {
                "success": False,
                "results": results,
                "total_processing_time": total_processing_time,
                "error": str(e),
            }

    def _validate_text_length(self, text: str):
        """Validate text length."""
        if len(text) > self._max_text_length:
            raise ValueError(f"Text too long: {len(text)} > {self._max_text_length}")

    def _validate_language(self, lang: str):
        """Validate language code."""
        if self._enable_language_validation and lang not in self._allowed_languages:
            raise ValueError(f"Unsupported language: {lang}")

    def _map_default_voice(self, backend: str, voice: str) -> str:
        """Map default voice to backend-specific default."""
        if voice == "default":
            voice_mapping = {
                "kokoro": "af_heart",
                "coqui": "default",
                "xtts": "default",
            }
            return voice_mapping.get(backend, "default")
        return voice

    def _validate_voice_compatibility(self, backend: str, voice: str):
        """Validate voice compatibility with backend."""
        if not self._enable_voice_compatibility_checks:
            return

        # TODO: Implement voice compatibility validation

    async def _handle_kokoro_usage(self):
        """Handle Kokoro-specific usage patterns."""
        current_time = time.time()
        self._kokoro_request_count += 1
        self._kokoro_last_used = current_time

        # Handle prewarming logic
        if (
            self._kokoro_mode == "normal"
            and self._kokoro_request_count >= self._kokoro_prewarm_threshold
        ):
            if not self._kokoro_warmed:
                logger.info("Prewarming Kokoro backend")
                # TODO: Implement prewarming logic
                self._kokoro_warmed = True

    async def _check_backend_health(self, backend: str) -> bool:
        """Check backend health status."""
        current_time = time.time()

        # Check if we need to perform health check
        if (
            current_time - self._last_backend_health_check
            < self._backend_health_check_interval
        ):
            return self._backend_health_status.get(backend, True)

        # Perform health check
        try:
            backend_service = self._backend_services.get(backend)
            if backend_service and hasattr(backend_service, "health_check"):
                is_healthy = await backend_service.health_check()
                self._backend_health_status[backend] = is_healthy
            else:
                self._backend_health_status[backend] = (
                    True  # Assume healthy if no health check
                )

            self._last_backend_health_check = current_time
            return self._backend_health_status[backend]

        except Exception as e:
            logger.warning(f"Backend health check failed for {backend}: {e}")
            self._backend_health_status[backend] = False
            return False

    def _update_metrics(
        self, backend: str, voice: str, processing_time: float, success: bool,
    ):
        """Update service metrics."""
        self._metrics["total_requests"] += 1
        if success:
            self._metrics["successful_requests"] += 1
        else:
            self._metrics["failed_requests"] += 1

        self._metrics["total_processing_time"] += processing_time
        self._metrics["average_processing_time"] = (
            self._metrics["total_processing_time"] / self._metrics["total_requests"]
        )

        # Update backend usage
        self._metrics["backend_usage"][backend] = (
            self._metrics["backend_usage"].get(backend, 0) + 1
        )

        # Update voice usage
        self._metrics["voice_usage"][voice] = (
            self._metrics["voice_usage"].get(voice, 0) + 1
        )

    async def _get_audio_duration(self, audio_path: Path) -> float:
        """Get audio duration in seconds."""
        try:
            if self._audio_processor:
                return await self._audio_processor.get_duration(audio_path)
            return 0.0
        except Exception:
            return 0.0

    async def get_available_backends(self) -> list[dict[str, Any]]:
        """Get list of available backends."""
        backends = []

        for name, service in self._backend_services.items():
            try:
                is_available = await self._check_backend_health(name)
                voices = (
                    await service.get_available_voices()
                    if hasattr(service, "get_available_voices")
                    else []
                )
                languages = (
                    await service.get_supported_languages()
                    if hasattr(service, "get_supported_languages")
                    else ["en"]
                )
                formats = (
                    await service.get_supported_formats()
                    if hasattr(service, "get_supported_formats")
                    else ["wav"]
                )

                backends.append(
                    {
                        "name": name,
                        "enabled": True,
                        "available": is_available,
                        "voices": voices,
                        "supported_languages": languages,
                        "supported_formats": formats,
                    },
                )
            except Exception as e:
                logger.warning(f"Failed to get info for backend {name}: {e}")
                backends.append(
                    {
                        "name": name,
                        "enabled": True,
                        "available": False,
                        "voices": [],
                        "supported_languages": ["en"],
                        "supported_formats": ["wav"],
                    },
                )

        return backends

    async def get_config(self) -> dict[str, Any]:
        """Get current TTS configuration."""
        return {
            "default_backend": self._backend,
            "default_voice": "default",
            "default_speed": 1.0,
            "default_language": "en",
            "max_text_length": self._max_text_length,
            "chunk_size": self._max_chunk_length,
            "enable_audio_processing": self._audio_processor is not None,
            "output_directory": str(self._audio_dir),
            "backends": await self.get_available_backends(),
        }

    async def update_config(self, config: dict[str, Any]):
        """Update TTS configuration."""
        if "default_backend" in config:
            self._backend = config["default_backend"]
        if "max_text_length" in config:
            self._max_text_length = config["max_text_length"]
        if "chunk_size" in config:
            self._max_chunk_length = config["chunk_size"]
        if "output_directory" in config:
            self._audio_dir = Path(config["output_directory"]).resolve()
            self._audio_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"TTS configuration updated: {config}")

    async def get_stats(self) -> dict[str, Any]:
        """Get TTS service statistics."""
        error_rate = 0.0
        if self._metrics["total_requests"] > 0:
            error_rate = (
                self._metrics["failed_requests"] / self._metrics["total_requests"]
            ) * 100

        return {
            "total_synthesis_requests": self._metrics["total_requests"],
            "successful_synthesis": self._metrics["successful_requests"],
            "failed_synthesis": self._metrics["failed_requests"],
            "average_processing_time": self._metrics["average_processing_time"],
            "total_audio_generated": self._metrics["total_audio_duration"],
            "backend_usage": self._metrics["backend_usage"],
            "voice_usage": self._metrics["voice_usage"],
            "error_rate": error_rate,
        }

    async def synthesize_with_voice_clone(
        self,
        text: str,
        out_path: Path,
        reference_audio: Path,
        *,
        speed: float = 1.0,
        lang: str = "en",
    ) -> Path:
        """Synthesize text with voice cloning using XTTS."""
        if not self._initialized:
            raise RuntimeError("TTS service not initialized")

        try:
            # Use XTTS backend for voice cloning
            xtts_backend = self._backend_services.get("xtts")
            if not xtts_backend:
                raise ValueError("XTTS backend not available for voice cloning")

            if hasattr(xtts_backend, "synthesize_with_voice_clone"):
                return await xtts_backend.synthesize_with_voice_clone(
                    text=text,
                    out_path=out_path,
                    reference_audio=reference_audio,
                    speed=speed,
                    lang=lang,
                )
            # Fallback to regular synthesis
            return await xtts_backend.synthesize(
                text=text, out_path=out_path, voice="clone", speed=speed, lang=lang,
            )

        except Exception as e:
            logger.error(f"Voice cloning synthesis failed: {e}")
            raise

    async def health_check(self) -> bool:
        """Perform health check."""
        if not self._enabled:
            return True

        try:
            # Check if at least one backend is healthy
            for backend in self._backend_services:
                if await self._check_backend_health(backend):
                    return True
            return False
        except Exception as e:
            logger.error(f"TTS health check failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Gracefully shutdown the TTS service and cleanup resources."""
        logger.info("Shutting down TTS service...")

        try:
            # Shutdown all backend services
            for backend_name, backend_service in self._backend_services.items():
                try:
                    if hasattr(backend_service, "shutdown"):
                        await backend_service.shutdown()
                    logger.debug(f"TTS backend {backend_name} shutdown")
                except Exception as e:
                    logger.warning(f"Failed to shutdown TTS backend {backend_name}: {e}")

            # Clear backend services
            self._backend_services.clear()

            # Shutdown audio processor
            if self._audio_processor and hasattr(self._audio_processor, "shutdown"):
                try:
                    await self._audio_processor.shutdown()
                    logger.debug("Audio processor shutdown")
                except Exception as e:
                    logger.warning(f"Failed to shutdown audio processor: {e}")

            # Reset service state
            self._enabled = False
            self._kokoro_warmed = False
            self._kokoro_request_count = 0
            self._kokoro_last_used = None
            self._backend_health_status.clear()

            logger.info("TTS service shutdown complete")

        except Exception as e:
            logger.error(f"Error during TTS service shutdown: {e}")
