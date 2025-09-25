#!/usr/bin/env python3
"""Embedding Backend Configuration Demo

This script demonstrates how to use the new embedding backend configuration
system to easily enable/disable different embedding backends.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.config.embedding_backend_config import (
    EmbeddingBackendsConfig,
    get_embedding_backends_config,
    reset_embedding_backends_config,
)
from app.services.rag.services.core.embedding import UnifiedEmbeddingService


async def demo_backend_configuration():
    """Demonstrate the embedding backend configuration system."""
    print("🦦 Embedding Backend Configuration Demo")
    print("=" * 50)

    # Demo 1: Default configuration
    print("\n1. Default Configuration:")
    print("-" * 30)
    config = EmbeddingBackendsConfig()

    print(f"Global enabled: {config.enabled}")
    print(f"Mock mode: {config.mock_mode}")
    print(f"Allow fallback: {config.allow_fallback}")
    print(f"Default backend: {config.default_backend}")

    print("\nBackend status:")
    for name, backend in config.backends.items():
        status = "✅ Enabled" if backend.enabled else "❌ Disabled"
        print(f"  {name}: {status} (priority: {backend.priority})")

    # Demo 2: Disable Sentence Transformers
    print("\n2. Disable Sentence Transformers:")
    print("-" * 40)
    config.disable_backend("sentence_transformers")

    enabled_backends = config.get_enabled_backends()
    print(f"Enabled backends: {[b.name for b in enabled_backends]}")

    primary = config.get_primary_backend()
    print(f"Primary backend: {primary.name if primary else 'None'}")

    fallbacks = config.get_fallback_backends()
    print(f"Fallback backends: {[b.name for b in fallbacks]}")

    # Demo 3: Mock mode
    print("\n3. Mock Mode:")
    print("-" * 15)
    config.mock_mode = True

    print(f"Mock mode: {config.mock_mode}")
    print(
        "In mock mode, all backends are effectively disabled and mock embeddings are returned.",
    )

    # Demo 4: Environment variable simulation
    print("\n4. Environment Variable Configuration:")
    print("-" * 45)

    # Simulate environment variables
    test_env = {
        "EMBEDDING_OLLAMA_ENABLED": "false",
        "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED": "true",
        "EMBEDDING_MOCK_MODE": "false",
        "EMBEDDING_DEFAULT_BACKEND": "sentence_transformers",
    }

    with patch_env(test_env):
        reset_embedding_backends_config()
        env_config = get_embedding_backends_config()

        print("With environment variables:")
        print("  EMBEDDING_OLLAMA_ENABLED=false")
        print("  EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=true")
        print("  EMBEDDING_MOCK_MODE=false")
        print("  EMBEDDING_DEFAULT_BACKEND=sentence_transformers")

        print("\nResult:")
        print(f"  Ollama enabled: {env_config.backends['ollama'].enabled}")
        print(
            f"  Sentence Transformers enabled: {env_config.backends['sentence_transformers'].enabled}",
        )
        print(f"  Mock mode: {env_config.mock_mode}")
        print(f"  Default backend: {env_config.default_backend}")

    # Demo 5: Embedding service integration
    print("\n5. Embedding Service Integration:")
    print("-" * 40)

    # Create embedding service with mock configuration
    embedding_service = EmbeddingService()

    # Mock configuration that disables all backends
    mock_config = {
        "rag_enabled": True,
        "embedding_backends": {
            "enabled": True,
            "mock_mode": True,
            "allow_fallback": True,
            "default_backend": "ollama",
            "backends": {
                "ollama": {
                    "enabled": False,
                    "provider": "ollama",
                    "base_url": "http://localhost:11434",
                    "timeout_seconds": 30,
                    "max_retries": 3,
                    "retry_delay": 1.0,
                    "max_concurrent_requests": 8,
                    "batch_size": 16,
                    "priority": 1,
                },
                "sentence_transformers": {
                    "enabled": False,
                    "provider": "sentence_transformers",
                    "timeout_seconds": 30,
                    "max_retries": 3,
                    "retry_delay": 1.0,
                    "max_concurrent_requests": 4,
                    "batch_size": 8,
                    "priority": 2,
                },
            },
        },
    }

    # Initialize the service
    success = await embedding_service.initialize(mock_config)
    print(f"Service initialization: {'✅ Success' if success else '❌ Failed'}")

    # Test embedding generation (should return mock embeddings)
    test_text = "This is a test text for embedding generation."
    embedding = await embedding_service.embed_text(test_text)
    print(f"Generated embedding dimension: {len(embedding)}")
    print(f"First few values: {embedding[:5]}")

    # Get service stats
    stats = await embedding_service.get_stats()
    print("\nService stats:")
    print(f"  Enabled: {stats['enabled']}")
    print(f"  Mock mode: {stats.get('backend_config', {}).get('mock_mode', 'N/A')}")
    print(
        f"  Enabled backends: {stats.get('backend_config', {}).get('enabled_backends', [])}",
    )

    print("\n🎉 Demo completed successfully!")
    print("\nTo use this in your application:")
    print("1. Set environment variables to control backends")
    print("2. Use EMBEDDING_OLLAMA_ENABLED=false to disable Ollama")
    print(
        "3. Use EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=false to disable Sentence Transformers",
    )
    print("4. Use EMBEDDING_MOCK_MODE=true for testing without real backends")


class patch_env:
    """Context manager to temporarily patch environment variables."""

    def __init__(self, env_vars):
        self.env_vars = env_vars
        self.original_env = {}

    def __enter__(self):
        for key, value in self.env_vars.items():
            self.original_env[key] = os.environ.get(key)
            os.environ[key] = value
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        for key in self.env_vars:
            if key in self.original_env:
                os.environ[key] = self.original_env[key]
            else:
                os.environ.pop(key, None)


if __name__ == "__main__":
    asyncio.run(demo_backend_configuration())
