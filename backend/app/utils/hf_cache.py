"""HuggingFace Cache Management for Reynard Backend

Provides utilities for managing HuggingFace cache paths with proper
environment variable support and Docker compatibility. Ported from yipyap.
"""

import os
from pathlib import Path


def get_hf_cache_dir() -> Path:
    """Get the HuggingFace cache directory with proper fallbacks.

    Priority order:
    1. HF_HOME environment variable
    2. HF_CACHE environment variable
    3. Default ~/.cache/huggingface

    Returns:
        Path: The HuggingFace cache directory

    """
    # Check environment variables in order of preference
    hf_home = os.getenv("HF_HOME")
    if hf_home:
        return Path(hf_home)

    hf_cache = os.getenv("HF_CACHE")
    if hf_cache:
        return Path(hf_cache)

    # Default fallback
    return Path.home() / ".cache" / "huggingface"


def get_hf_hub_dir() -> Path:
    """Get the HuggingFace Hub cache directory.

    This is typically {cache_dir}/hub where models are stored.

    Returns:
        Path: The HuggingFace Hub cache directory

    """
    cache_dir = get_hf_cache_dir()
    hub_dir = cache_dir / "hub"
    hub_dir.mkdir(parents=True, exist_ok=True)
    return hub_dir


def get_model_cache_path(repo_id: str) -> Path:
    """Get the cache path for a specific model repository.

    Args:
        repo_id: The HuggingFace repository ID (e.g., "fancyfeast/llama-joycaption-beta-one-hf-llava")

    Returns:
        Path: The cache path for the model repository

    """
    hub_dir = get_hf_hub_dir()
    # Convert repo_id to cache directory name
    # e.g., "fancyfeast/llama-joycaption-beta-one-hf-llava" -> "models--fancyfeast--llama-joycaption-beta-one-hf-llava"
    cache_name = f"models--{repo_id.replace('/', '--')}"
    return hub_dir / cache_name


def ensure_hf_cache_dir() -> Path:
    """Ensure the HuggingFace cache directory exists and return it.

    Returns:
        Path: The HuggingFace cache directory

    """
    cache_dir = get_hf_cache_dir()
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir


def get_model_snapshot_path(repo_id: str, revision: str = "main") -> Path:
    """Get the snapshot path for a specific model repository.

    Args:
        repo_id: The HuggingFace repository ID
        revision: The model revision (default: "main")

    Returns:
        Path: The snapshot path for the model repository

    """
    model_path = get_model_cache_path(repo_id)
    return model_path / "snapshots" / revision


def is_model_cached(repo_id: str) -> bool:
    """Check if a model is cached locally.

    Args:
        repo_id: The HuggingFace repository ID

    Returns:
        bool: True if the model is cached, False otherwise

    """
    model_path = get_model_cache_path(repo_id)
    return model_path.exists()


def get_cache_size() -> int:
    """Get the total size of the HuggingFace cache directory.

    Returns:
        int: Total size in bytes

    """
    cache_dir = get_hf_cache_dir()
    if not cache_dir.exists():
        return 0

    total_size = 0
    for file_path in cache_dir.rglob("*"):
        if file_path.is_file():
            total_size += file_path.stat().st_size

    return total_size


def clear_cache() -> bool:
    """Clear the HuggingFace cache directory.

    Returns:
        bool: True if successful, False otherwise

    """
    try:
        cache_dir = get_hf_cache_dir()
        if cache_dir.exists():
            import shutil

            shutil.rmtree(cache_dir)
            return True
        return True
    except Exception:
        return False
