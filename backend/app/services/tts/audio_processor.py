"""Audio Processor for Reynard TTS Backend

Handles audio format conversion, processing, and optimization.
"""

import asyncio
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger("uvicorn")


class AudioProcessor:
    """Audio processing service for TTS output."""

    def __init__(self):
        self._enabled = True
        self._ffmpeg_available = False
        self._supported_formats = ["wav", "mp3", "ogg", "opus"]
        self._default_quality = "high"
        self._compression_levels = {
            "low": {"mp3": "-q:a 9", "ogg": "-q:a 1", "opus": "-b:a 32k"},
            "medium": {"mp3": "-q:a 5", "ogg": "-q:a 5", "opus": "-b:a 64k"},
            "high": {"mp3": "-q:a 2", "ogg": "-q:a 8", "opus": "-b:a 128k"},
        }

    async def initialize(self, config: dict[str, Any]) -> bool:
        """Initialize the audio processor."""
        try:
            self._enabled = config.get("tts_audio_processing_enabled", True)
            self._default_quality = config.get("tts_audio_quality", "high")

            if not self._enabled:
                logger.info("Audio processor disabled by configuration")
                return True

            # Check FFmpeg availability
            self._ffmpeg_available = await self._check_ffmpeg()

            if not self._ffmpeg_available:
                logger.warning("FFmpeg not available, audio processing will be limited")

            logger.info("Audio processor initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Audio processor initialization failed: {e}")
            return False

    async def _check_ffmpeg(self) -> bool:
        """Check if FFmpeg is available."""
        try:
            result = await asyncio.create_subprocess_exec(
                "ffmpeg",
                "-version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await result.wait()
            return result.returncode == 0
        except Exception:
            return False

    async def process_audio(
        self,
        input_path: Path,
        to_ogg: bool = False,
        to_opus: bool = False,
        quality: str | None = None,
    ) -> Path:
        """Process audio file with format conversion."""
        if not self._enabled or not self._ffmpeg_available:
            return input_path

        quality = quality or self._default_quality

        try:
            if to_ogg:
                output_path = input_path.with_suffix(".ogg")
                await self._convert_to_ogg(input_path, output_path, quality)
                return output_path
            if to_opus:
                output_path = input_path.with_suffix(".opus")
                await self._convert_to_opus(input_path, output_path, quality)
                return output_path
            return input_path

        except Exception as e:
            logger.error(f"Audio processing failed: {e}")
            return input_path

    async def _convert_to_ogg(self, input_path: Path, output_path: Path, quality: str):
        """Convert audio to OGG format."""
        quality_args = self._compression_levels.get(
            quality, self._compression_levels["high"],
        )
        ogg_args = quality_args.get("ogg", "-q:a 8")

        cmd = [
            "ffmpeg",
            "-i",
            str(input_path),
            "-c:a",
            "libvorbis",
            ogg_args,
            "-y",  # Overwrite output file
            str(output_path),
        ]

        await self._run_ffmpeg_command(cmd)

    async def _convert_to_opus(self, input_path: Path, output_path: Path, quality: str):
        """Convert audio to Opus format."""
        quality_args = self._compression_levels.get(
            quality, self._compression_levels["high"],
        )
        opus_args = quality_args.get("opus", "-b:a 128k")

        cmd = [
            "ffmpeg",
            "-i",
            str(input_path),
            "-c:a",
            "libopus",
            opus_args,
            "-y",  # Overwrite output file
            str(output_path),
        ]

        await self._run_ffmpeg_command(cmd)

    async def _run_ffmpeg_command(self, cmd: list):
        """Run FFmpeg command asynchronously."""
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
                raise RuntimeError(f"FFmpeg command failed: {error_msg}")

        except Exception as e:
            logger.error(f"FFmpeg command execution failed: {e}")
            raise

    async def get_duration(self, audio_path: Path) -> float:
        """Get audio duration in seconds."""
        if not self._ffmpeg_available:
            return 0.0

        try:
            cmd = [
                "ffprobe",
                "-v",
                "quiet",
                "-show_entries",
                "format=duration",
                "-of",
                "csv=p=0",
                str(audio_path),
            ]

            process = await asyncio.create_subprocess_exec(
                *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                duration_str = stdout.decode().strip()
                return float(duration_str) if duration_str else 0.0
            logger.warning(f"Failed to get audio duration: {stderr.decode()}")
            return 0.0

        except Exception as e:
            logger.warning(f"Error getting audio duration: {e}")
            return 0.0

    async def optimize_audio(self, input_path: Path, output_path: Path) -> Path:
        """Optimize audio file for web delivery."""
        if not self._enabled or not self._ffmpeg_available:
            return input_path

        try:
            cmd = [
                "ffmpeg",
                "-i",
                str(input_path),
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-movflags",
                "+faststart",  # Optimize for streaming
                "-y",
                str(output_path),
            ]

            await self._run_ffmpeg_command(cmd)
            return output_path

        except Exception as e:
            logger.error(f"Audio optimization failed: {e}")
            return input_path

    async def concatenate_audio(
        self, input_paths: list[Path], output_path: Path,
    ) -> Path:
        """Concatenate multiple audio files."""
        if not self._enabled or not self._ffmpeg_available:
            return input_paths[0] if input_paths else output_path

        try:
            # Create file list for FFmpeg
            file_list_path = output_path.parent / "file_list.txt"
            with open(file_list_path, "w") as f:
                for path in input_paths:
                    f.write(f"file '{path.absolute()}'\n")

            cmd = [
                "ffmpeg",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(file_list_path),
                "-c",
                "copy",
                "-y",
                str(output_path),
            ]

            await self._run_ffmpeg_command(cmd)

            # Clean up file list
            file_list_path.unlink(missing_ok=True)

            return output_path

        except Exception as e:
            logger.error(f"Audio concatenation failed: {e}")
            return input_paths[0] if input_paths else output_path

    async def get_audio_info(self, audio_path: Path) -> dict[str, Any]:
        """Get detailed audio file information."""
        if not self._ffmpeg_available:
            return {"error": "FFmpeg not available"}

        try:
            cmd = [
                "ffprobe",
                "-v",
                "quiet",
                "-print_format",
                "json",
                "-show_format",
                "-show_streams",
                str(audio_path),
            ]

            process = await asyncio.create_subprocess_exec(
                *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                import json

                return json.loads(stdout.decode())
            return {"error": stderr.decode()}

        except Exception as e:
            logger.error(f"Error getting audio info: {e}")
            return {"error": str(e)}

    async def health_check(self) -> bool:
        """Perform health check."""
        if not self._enabled:
            return True

        return self._ffmpeg_available
