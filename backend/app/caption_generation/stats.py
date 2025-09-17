"""Usage, health, and queue statistics for caption models."""

from __future__ import annotations

import time
from typing import Any

_model_usage_stats: dict[str, dict[str, Any]] = {}
_model_health_status: dict[str, dict[str, Any]] = {}
_circuit_breakers: dict[str, dict[str, Any]] = {}
_request_queue: list[dict[str, Any]] = []


def record_usage(model_name: str, processing_time: float, success: bool) -> None:
    if model_name not in _model_usage_stats:
        _model_usage_stats[model_name] = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "average_processing_time": 0.0,
            "last_used": time.time(),
        }

    stats = _model_usage_stats[model_name]
    stats["total_requests"] += 1
    if success:
        stats["successful_requests"] += 1
    else:
        stats["failed_requests"] += 1

    total_time = (
        stats["average_processing_time"] * (stats["total_requests"] - 1)
        + processing_time
    )
    stats["average_processing_time"] = total_time / stats["total_requests"]
    stats["last_used"] = time.time()


def get_model_usage_stats(model_name: str) -> dict[str, Any] | None:
    return _model_usage_stats.get(model_name)


def get_health_status(
    *,
    model_name: str | None = None,
    total_processed: int = 0,
    total_processing_time: float = 0.0,
) -> dict[str, Any]:
    if model_name:
        return _model_health_status.get(
            model_name,
            {
                "is_healthy": True,
                "last_health_check": None,
                "issues": [],
                "performance": {
                    "average_response_time": 0,
                    "error_rate": 0,
                    "throughput": 0,
                },
            },
        )

    all_healthy = all(
        status.get("is_healthy", True) for status in _model_health_status.values()
    )
    return {
        "is_healthy": all_healthy,
        "last_health_check": time.time(),
        "issues": [] if all_healthy else ["Some models are unhealthy"],
        "performance": {
            "average_response_time": total_processing_time / max(total_processed, 1),
            "error_rate": 0.0,
            "throughput": total_processed,
        },
    }


def get_circuit_breaker_state(model_name: str) -> dict[str, Any]:
    return _circuit_breakers.get(
        model_name,
        {
            "state": "closed",
            "failure_count": 0,
            "last_failure_time": None,
            "next_attempt_time": None,
        },
    )


def get_queue_status() -> dict[str, Any]:
    return {
        "total_queued": len(_request_queue),
        "queued_by_model": {},
        "average_wait_time": 0,
        "oldest_request": None,
    }
