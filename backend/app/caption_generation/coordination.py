"""Concurrency coordination for caption model loading."""

from __future__ import annotations

import asyncio

_model_loading_locks: dict[str, asyncio.Lock] = {}


def get_loading_lock(model_name: str) -> asyncio.Lock:
    """Get or create an asyncio.Lock for a given model name."""
    if model_name not in _model_loading_locks:
        _model_loading_locks[model_name] = asyncio.Lock()
    return _model_loading_locks[model_name]
