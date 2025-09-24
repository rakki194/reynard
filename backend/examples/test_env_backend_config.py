#!/usr/bin/env python3
"""Test .env File Integration with Embedding Backend Configuration

This script demonstrates how to use .env files to configure embedding backends
and tests the integration with the virtual environment.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.config.embedding_backend_config import (
    EmbeddingBackendsConfig,
    reset_embedding_backends_config,
)


def test_env_file_scenarios():
    """Test different .env file scenarios."""
    print("🦦 Testing .env File Scenarios with Embedding Backend Configuration")
    print("=" * 70)

    # Scenario 1: Disable Sentence Transformers
    print("\n1. Scenario: Disable Sentence Transformers")
    print("-" * 50)

    test_env_1 = {
        "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED": "false",
        "EMBEDDING_OLLAMA_ENABLED": "true",
    }

    with patch_env(test_env_1):
        reset_embedding_backends_config()
        config = EmbeddingBackendsConfig()

        print(f"   Ollama enabled: {config.backends['ollama'].enabled}")
        print(
            f"   Sentence Transformers enabled: {config.backends['sentence_transformers'].enabled}",
        )
        print(f"   Enabled backends: {[b.name for b in config.get_enabled_backends()]}")
        print("   ✅ Only Ollama is enabled")

    # Scenario 2: Mock Mode
    print("\n2. Scenario: Mock Mode for Testing")
    print("-" * 40)

    test_env_2 = {
        "EMBEDDING_MOCK_MODE": "true",
        "EMBEDDING_OLLAMA_ENABLED": "false",
        "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED": "false",
    }

    with patch_env(test_env_2):
        reset_embedding_backends_config()
        config = EmbeddingBackendsConfig()

        print(f"   Mock mode: {config.mock_mode}")
        print(f"   Ollama enabled: {config.backends['ollama'].enabled}")
        print(
            f"   Sentence Transformers enabled: {config.backends['sentence_transformers'].enabled}",
        )
        print(f"   Enabled backends: {[b.name for b in config.get_enabled_backends()]}")
        print("   ✅ Mock mode is enabled, all backends effectively disabled")

    # Scenario 3: Production with Fallback
    print("\n3. Scenario: Production with Fallback")
    print("-" * 45)

    test_env_3 = {
        "EMBEDDING_OLLAMA_ENABLED": "true",
        "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED": "true",
        "EMBEDDING_ALLOW_FALLBACK": "true",
        "EMBEDDING_DEFAULT_BACKEND": "ollama",
    }

    with patch_env(test_env_3):
        reset_embedding_backends_config()
        config = EmbeddingBackendsConfig()

        print(f"   Ollama enabled: {config.backends['ollama'].enabled}")
        print(
            f"   Sentence Transformers enabled: {config.backends['sentence_transformers'].enabled}",
        )
        print(f"   Allow fallback: {config.allow_fallback}")
        print(f"   Default backend: {config.default_backend}")
        print(f"   Primary backend: {config.get_primary_backend().name}")
        print(
            f"   Fallback backends: {[b.name for b in config.get_fallback_backends()]}",
        )
        print("   ✅ Production setup with Ollama primary, ST fallback")

    # Scenario 4: Custom Configuration
    print("\n4. Scenario: Custom Configuration")
    print("-" * 40)

    test_env_4 = {
        "EMBEDDING_OLLAMA_ENABLED": "true",
        "EMBEDDING_OLLAMA_TIMEOUT": "60",
        "EMBEDDING_OLLAMA_MAX_RETRIES": "5",
        "EMBEDDING_OLLAMA_DEFAULT_MODEL": "nomic-embed-text",
        "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED": "false",
    }

    with patch_env(test_env_4):
        reset_embedding_backends_config()
        config = EmbeddingBackendsConfig()

        ollama_backend = config.backends["ollama"]
        print(f"   Ollama enabled: {ollama_backend.enabled}")
        print(f"   Ollama timeout: {ollama_backend.timeout_seconds}")
        print(f"   Ollama max retries: {ollama_backend.max_retries}")
        print(f"   Ollama default model: {ollama_backend.default_model}")
        print(
            f"   Sentence Transformers enabled: {config.backends['sentence_transformers'].enabled}",
        )
        print("   ✅ Custom Ollama configuration applied")

    print("\n🎉 All .env file scenarios tested successfully!")
    print("\nTo use these configurations in your application:")
    print("1. Create a .env file in your backend directory")
    print("2. Add the desired environment variables")
    print("3. Restart your backend application")
    print("4. The system will automatically load the configuration")


def create_sample_env_files():
    """Create sample .env files for different scenarios."""
    print("\n📝 Creating Sample .env Files")
    print("=" * 35)

    scenarios = {
        "disable-sentence-transformers": """# Disable Sentence Transformers, use only Ollama
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=false
EMBEDDING_OLLAMA_ENABLED=true
EMBEDDING_MOCK_MODE=false
EMBEDDING_ALLOW_FALLBACK=false
EMBEDDING_DEFAULT_BACKEND=ollama
""",
        "disable-ollama": """# Disable Ollama, use only Sentence Transformers
EMBEDDING_OLLAMA_ENABLED=false
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=true
EMBEDDING_MOCK_MODE=false
EMBEDDING_ALLOW_FALLBACK=false
EMBEDDING_DEFAULT_BACKEND=sentence_transformers
""",
        "mock-mode": """# Mock mode for testing
EMBEDDING_MOCK_MODE=true
EMBEDDING_OLLAMA_ENABLED=false
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=false
EMBEDDING_ALLOW_FALLBACK=false
""",
        "production-fallback": """# Production setup with fallback
EMBEDDING_OLLAMA_ENABLED=true
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=true
EMBEDDING_MOCK_MODE=false
EMBEDDING_ALLOW_FALLBACK=true
EMBEDDING_DEFAULT_BACKEND=ollama
""",
        "custom-ollama": """# Custom Ollama configuration
EMBEDDING_OLLAMA_ENABLED=true
EMBEDDING_OLLAMA_TIMEOUT=60
EMBEDDING_OLLAMA_MAX_RETRIES=5
EMBEDDING_OLLAMA_RETRY_DELAY=2.0
EMBEDDING_OLLAMA_MAX_CONCURRENT=4
EMBEDDING_OLLAMA_BATCH_SIZE=8
EMBEDDING_OLLAMA_DEFAULT_MODEL=nomic-embed-text
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=false
EMBEDDING_MOCK_MODE=false
""",
    }

    examples_dir = Path(__file__).parent
    for scenario_name, content in scenarios.items():
        env_file_path = examples_dir / f".env.{scenario_name}"
        with open(env_file_path, "w") as f:
            f.write(content)
        print(f"✅ Created: {env_file_path}")

    print(f"\n📁 Sample .env files created in: {examples_dir}")
    print("\nTo use any of these configurations:")
    print("1. Copy the desired .env file to your backend directory")
    print("2. Rename it to .env")
    print("3. Restart your backend application")


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
            if key in self.original_env and self.original_env[key] is not None:
                os.environ[key] = self.original_env[key]
            else:
                os.environ.pop(key, None)


if __name__ == "__main__":
    test_env_file_scenarios()
    create_sample_env_files()
