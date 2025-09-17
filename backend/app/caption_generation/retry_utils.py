"""Retry helpers for caption operations with exponential backoff."""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import Any, TypeVar

from .errors import CaptionError

logger = logging.getLogger("uvicorn")

T = TypeVar("T")


class RetryConfig(dict[str, Any]):
    """Typed mapping for retry configuration."""


DEFAULT_RETRY_CONFIG: RetryConfig = RetryConfig(
    max_retries=3,
    base_delay=1.0,
    max_delay=10.0,
    backoff_factor=2.0,
)


async def retry_with_backoff(
    operation: Callable[..., Awaitable[T]],
    operation_name: str,
    *,
    config: RetryConfig | None = None,
    args: tuple | None = None,
    kwargs: dict | None = None,
) -> T:
    """Run an async operation with retries and exponential backoff."""

    cfg = DEFAULT_RETRY_CONFIG.copy()
    if config:
        cfg.update(config)  # type: ignore[arg-type]

    args = args or ()
    kwargs = kwargs or {}

    last_exc: CaptionError | None = None
    for attempt in range(cfg["max_retries"] + 1):
        try:
            if attempt > 0:
                delay = min(
                    cfg["base_delay"] * (cfg["backoff_factor"] ** (attempt - 1)),
                    cfg["max_delay"],
                )
                logger.info(
                    f"Retrying {operation_name} in {delay:.1f}s (attempt {attempt + 1}/{cfg['max_retries'] + 1})"
                )
                await asyncio.sleep(delay)

            return await operation(*args, **kwargs)

        except CaptionError as e:  # Controlled domain errors
            last_exc = e
            if not e.retryable or attempt >= cfg["max_retries"]:
                raise
            logger.warning(f"{operation_name} failed (attempt {attempt + 1}): {e}")

        except Exception as e:  # Unexpected errors: treat as retryable
            last_exc = CaptionError(
                f"Unexpected error in {operation_name}: {e!s}",
                "unexpected",
                retryable=True,
            )
            if attempt >= cfg["max_retries"]:
                raise last_exc
            logger.warning(f"{operation_name} failed (attempt {attempt + 1}): {e}")

    # Should not reach here
    if last_exc is None:
        last_exc = CaptionError(f"All retries failed for {operation_name}")
    raise last_exc
