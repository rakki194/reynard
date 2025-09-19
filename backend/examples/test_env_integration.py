#!/usr/bin/env python3
"""
Test .env File Integration with Embedding Backend Configuration

This script demonstrates and tests that the embedding backend configuration
system properly loads settings from .env files.
"""

import os
import sys
import tempfile
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.config.embedding_backend_config import (
    EmbeddingBackendsConfig,
    reset_embedding_backends_config
)


def test_env_file_integration():
    """Test that .env file variables are properly loaded."""
    
    print("🦦 Testing .env File Integration")
    print("=" * 40)
    
    # Test 1: Default configuration
    print("\n1. Testing default configuration:")
    reset_embedding_backends_config()
    config = EmbeddingBackendsConfig()
    
    print(f"  Ollama enabled: {config.backends['ollama'].enabled}")
    print(f"  Sentence Transformers enabled: {config.backends['sentence_transformers'].enabled}")
    print(f"  Mock mode: {config.mock_mode}")
    
    # Test 2: Simulate .env file with custom settings
    print("\n2. Testing with simulated .env variables:")
    
    # Simulate environment variables that would be in a .env file
    test_env_vars = {
        "EMBEDDING_OLLAMA_ENABLED": "false",
        "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED": "true",
        "EMBEDDING_MOCK_MODE": "false",
        "EMBEDDING_DEFAULT_BACKEND": "sentence_transformers",
        "EMBEDDING_OLLAMA_TIMEOUT": "60",
        "EMBEDDING_SENTENCE_TRANSFORMERS_MAX_CONCURRENT": "2"
    }
    
    # Temporarily set environment variables
    original_env = {}
    for key, value in test_env_vars.items():
        original_env[key] = os.environ.get(key)
        os.environ[key] = value
    
    try:
        # Reset and create new config with environment variables
        reset_embedding_backends_config()
        config = EmbeddingBackendsConfig()
        
        print(f"  Ollama enabled: {config.backends['ollama'].enabled}")
        print(f"  Sentence Transformers enabled: {config.backends['sentence_transformers'].enabled}")
        print(f"  Mock mode: {config.mock_mode}")
        print(f"  Default backend: {config.default_backend}")
        print(f"  Ollama timeout: {config.backends['ollama'].timeout_seconds}")
        print(f"  ST max concurrent: {config.backends['sentence_transformers'].max_concurrent_requests}")
        
        # Verify the settings were applied
        assert config.backends['ollama'].enabled is False, "Ollama should be disabled"
        assert config.backends['sentence_transformers'].enabled is True, "Sentence Transformers should be enabled"
        assert config.mock_mode is False, "Mock mode should be disabled"
        assert config.default_backend == "sentence_transformers", "Default backend should be sentence_transformers"
        assert config.backends['ollama'].timeout_seconds == 60, "Ollama timeout should be 60"
        assert config.backends['sentence_transformers'].max_concurrent_requests == 2, "ST max concurrent should be 2"
        
        print("  ✅ All environment variable tests passed!")
        
    finally:
        # Restore original environment
        for key, original_value in original_env.items():
            if original_value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = original_value
    
    # Test 3: Mock mode from .env
    print("\n3. Testing mock mode from .env:")
    
    mock_env_vars = {
        "EMBEDDING_MOCK_MODE": "true",
        "EMBEDDING_OLLAMA_ENABLED": "false",
        "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED": "false"
    }
    
    original_env = {}
    for key, value in mock_env_vars.items():
        original_env[key] = os.environ.get(key)
        os.environ[key] = value
    
    try:
        reset_embedding_backends_config()
        config = EmbeddingBackendsConfig()
        
        print(f"  Mock mode: {config.mock_mode}")
        print(f"  Ollama enabled: {config.backends['ollama'].enabled}")
        print(f"  Sentence Transformers enabled: {config.backends['sentence_transformers'].enabled}")
        
        assert config.mock_mode is True, "Mock mode should be enabled"
        
        print("  ✅ Mock mode test passed!")
        
    finally:
        # Restore original environment
        for key, original_value in original_env.items():
            if original_value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = original_value
    
    print("\n🎉 All .env integration tests passed!")
    print("\nTo use this in your application:")
    print("1. Create a .env file in your backend directory")
    print("2. Add the embedding backend configuration variables")
    print("3. The system will automatically load them on startup")


def create_sample_env_file():
    """Create a sample .env file for testing."""
    
    print("\n📝 Creating sample .env file...")
    
    sample_env_content = """# Sample .env file for embedding backend configuration

# Disable Sentence Transformers, use only Ollama
EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED=false
EMBEDDING_OLLAMA_ENABLED=true

# Custom Ollama settings
EMBEDDING_OLLAMA_TIMEOUT=45
EMBEDDING_OLLAMA_MAX_RETRIES=5
EMBEDDING_OLLAMA_DEFAULT_MODEL=nomic-embed-text

# Global settings
EMBEDDING_MOCK_MODE=false
EMBEDDING_ALLOW_FALLBACK=false
EMBEDDING_DEFAULT_BACKEND=ollama
"""
    
    # Create sample .env file in examples directory
    sample_env_path = Path(__file__).parent / "sample.env"
    with open(sample_env_path, "w") as f:
        f.write(sample_env_content)
    
    print(f"✅ Sample .env file created: {sample_env_path}")
    print("\nTo use this sample:")
    print(f"1. Copy it to your backend directory: cp {sample_env_path} backend/.env")
    print("2. Modify the settings as needed")
    print("3. Restart your backend application")


if __name__ == "__main__":
    test_env_file_integration()
    create_sample_env_file()

