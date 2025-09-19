"""
Tests for Embedding Backend Configuration System.

This module tests the granular backend configuration system that allows
easy enable/disable of different embedding backends like Ollama, Sentence
Transformers, OpenAI, and Hugging Face.
"""

import os
import pytest
from unittest.mock import patch, MagicMock

from app.config.embedding_backend_config import (
    EmbeddingBackendConfig,
    EmbeddingBackendsConfig,
    get_embedding_backends_config,
    reset_embedding_backends_config,
)


class TestEmbeddingBackendConfig:
    """Test individual backend configuration."""

    def test_backend_config_creation(self):
        """Test creating a backend configuration."""
        config = EmbeddingBackendConfig(
            name="test_backend",
            provider="test_provider",
            enabled=True,
            base_url="http://test.com",
            timeout_seconds=30,
            priority=1
        )
        
        assert config.name == "test_backend"
        assert config.provider == "test_provider"
        assert config.enabled is True
        assert config.base_url == "http://test.com"
        assert config.timeout_seconds == 30
        assert config.priority == 1

    def test_backend_config_to_dict(self):
        """Test converting backend config to dictionary."""
        config = EmbeddingBackendConfig(
            name="test_backend",
            provider="test_provider",
            enabled=True,
            base_url="http://test.com"
        )
        
        config_dict = config.to_dict()
        
        assert config_dict["name"] == "test_backend"
        assert config_dict["provider"] == "test_provider"
        assert config_dict["enabled"] is True
        assert config_dict["base_url"] == "http://test.com"

    def test_backend_config_defaults(self):
        """Test backend config default values."""
        config = EmbeddingBackendConfig(
            name="test_backend",
            provider="test_provider"
        )
        
        assert config.enabled is True
        assert config.timeout_seconds == 30
        assert config.max_retries == 3
        assert config.retry_delay == 1.0
        assert config.max_concurrent_requests == 8
        assert config.batch_size == 16
        assert config.priority == 1


class TestEmbeddingBackendsConfig:
    """Test the main backends configuration system."""

    def setup_method(self):
        """Reset global config before each test."""
        reset_embedding_backends_config()

    def teardown_method(self):
        """Reset global config after each test."""
        reset_embedding_backends_config()

    def test_default_backends_initialization(self):
        """Test that default backends are initialized."""
        config = EmbeddingBackendsConfig()
        
        # Check that all expected backends are present
        assert "ollama" in config.backends
        assert "sentence_transformers" in config.backends
        assert "openai" in config.backends
        assert "huggingface" in config.backends
        
        # Check default enabled state
        assert config.backends["ollama"].enabled is True
        assert config.backends["sentence_transformers"].enabled is True
        assert config.backends["openai"].enabled is False
        assert config.backends["huggingface"].enabled is False

    def test_get_enabled_backends(self):
        """Test getting enabled backends sorted by priority."""
        config = EmbeddingBackendsConfig()
        
        # Disable sentence transformers
        config.backends["sentence_transformers"].enabled = False
        
        enabled_backends = config.get_enabled_backends()
        
        # Should only return ollama (priority 1)
        assert len(enabled_backends) == 1
        assert enabled_backends[0].name == "ollama"
        assert enabled_backends[0].priority == 1

    def test_get_primary_backend(self):
        """Test getting the primary backend."""
        config = EmbeddingBackendsConfig()
        
        primary = config.get_primary_backend()
        
        assert primary is not None
        assert primary.name == "ollama"
        assert primary.priority == 1

    def test_get_fallback_backends(self):
        """Test getting fallback backends."""
        config = EmbeddingBackendsConfig()
        
        # Enable sentence transformers as fallback
        config.backends["sentence_transformers"].enabled = True
        
        fallback_backends = config.get_fallback_backends()
        
        assert len(fallback_backends) == 1
        assert fallback_backends[0].name == "sentence_transformers"
        assert fallback_backends[0].priority == 2

    def test_enable_disable_backend(self):
        """Test enabling and disabling backends."""
        config = EmbeddingBackendsConfig()
        
        # Disable ollama
        assert config.disable_backend("ollama") is True
        assert config.is_backend_enabled("ollama") is False
        
        # Enable ollama
        assert config.enable_backend("ollama") is True
        assert config.is_backend_enabled("ollama") is True
        
        # Try to disable non-existent backend
        assert config.disable_backend("nonexistent") is False

    def test_get_backend(self):
        """Test getting a specific backend."""
        config = EmbeddingBackendsConfig()
        
        backend = config.get_backend("ollama")
        assert backend is not None
        assert backend.name == "ollama"
        
        # Try to get non-existent backend
        backend = config.get_backend("nonexistent")
        assert backend is None

    def test_to_dict(self):
        """Test converting configuration to dictionary."""
        config = EmbeddingBackendsConfig()
        
        config_dict = config.to_dict()
        
        assert "enabled" in config_dict
        assert "allow_fallback" in config_dict
        assert "default_backend" in config_dict
        assert "mock_mode" in config_dict
        assert "backends" in config_dict
        
        # Check that backends are included
        assert "ollama" in config_dict["backends"]
        assert "sentence_transformers" in config_dict["backends"]

    def test_validation_success(self):
        """Test successful validation."""
        config = EmbeddingBackendsConfig()
        
        # Should not raise any exceptions
        config.validate()

    def test_validation_no_enabled_backends(self):
        """Test validation with no enabled backends."""
        config = EmbeddingBackendsConfig()
        
        # Disable all backends
        for backend in config.backends.values():
            backend.enabled = False
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="At least one backend must be enabled"):
            config.validate()

    def test_validation_mock_mode_allows_no_backends(self):
        """Test that mock mode allows no enabled backends."""
        config = EmbeddingBackendsConfig()
        
        # Disable all backends
        for backend in config.backends.values():
            backend.enabled = False
        
        # Enable mock mode
        config.mock_mode = True
        
        # Should not raise any exceptions
        config.validate()

    def test_validation_ollama_missing_base_url(self):
        """Test validation with Ollama missing base URL."""
        config = EmbeddingBackendsConfig()
        
        # Remove base URL from Ollama backend
        config.backends["ollama"].base_url = None
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="base_url is required for Ollama"):
            config.validate()

    def test_validation_openai_missing_api_key(self):
        """Test validation with OpenAI missing API key."""
        config = EmbeddingBackendsConfig()
        
        # Enable OpenAI and remove API key
        config.backends["openai"].enabled = True
        config.backends["openai"].api_key = None
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="api_key is required for openai"):
            config.validate()

    def test_validation_invalid_timeout(self):
        """Test validation with invalid timeout."""
        config = EmbeddingBackendsConfig()
        
        # Set invalid timeout
        config.backends["ollama"].timeout_seconds = -1
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="timeout_seconds must be positive"):
            config.validate()

    def test_validation_invalid_retries(self):
        """Test validation with invalid retries."""
        config = EmbeddingBackendsConfig()
        
        # Set invalid retries
        config.backends["ollama"].max_retries = -1
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="max_retries must be non-negative"):
            config.validate()

    def test_validation_invalid_retry_delay(self):
        """Test validation with invalid retry delay."""
        config = EmbeddingBackendsConfig()
        
        # Set invalid retry delay
        config.backends["ollama"].retry_delay = -1
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="retry_delay must be non-negative"):
            config.validate()


class TestEnvironmentVariableIntegration:
    """Test integration with environment variables."""

    def setup_method(self):
        """Reset global config before each test."""
        reset_embedding_backends_config()

    def teardown_method(self):
        """Reset global config after each test."""
        reset_embedding_backends_config()

    @patch.dict(os.environ, {
        "EMBEDDING_BACKENDS_ENABLED": "false",
        "EMBEDDING_MOCK_MODE": "true",
        "EMBEDDING_ALLOW_FALLBACK": "false",
        "EMBEDDING_DEFAULT_BACKEND": "sentence_transformers"
    })
    def test_environment_variables_global(self):
        """Test global environment variable configuration."""
        config = EmbeddingBackendsConfig()
        
        assert config.enabled is False
        assert config.mock_mode is True
        assert config.allow_fallback is False
        assert config.default_backend == "sentence_transformers"

    @patch.dict(os.environ, {
        "EMBEDDING_OLLAMA_ENABLED": "false",
        "EMBEDDING_OLLAMA_TIMEOUT": "60",
        "EMBEDDING_OLLAMA_MAX_RETRIES": "5",
        "EMBEDDING_OLLAMA_BASE_URL": "http://custom-ollama:11434"
    })
    def test_environment_variables_ollama(self):
        """Test Ollama-specific environment variables."""
        config = EmbeddingBackendsConfig()
        
        ollama_backend = config.backends["ollama"]
        assert ollama_backend.enabled is False
        assert ollama_backend.timeout_seconds == 60
        assert ollama_backend.max_retries == 5
        assert ollama_backend.base_url == "http://custom-ollama:11434"

    @patch.dict(os.environ, {
        "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED": "false",
        "EMBEDDING_SENTENCE_TRANSFORMERS_TIMEOUT": "45",
        "EMBEDDING_SENTENCE_TRANSFORMERS_MAX_CONCURRENT": "2"
    })
    def test_environment_variables_sentence_transformers(self):
        """Test Sentence Transformers-specific environment variables."""
        config = EmbeddingBackendsConfig()
        
        st_backend = config.backends["sentence_transformers"]
        assert st_backend.enabled is False
        assert st_backend.timeout_seconds == 45
        assert st_backend.max_concurrent_requests == 2

    @patch.dict(os.environ, {
        "EMBEDDING_OPENAI_ENABLED": "true",
        "OPENAI_API_KEY": "test-api-key",
        "EMBEDDING_OPENAI_TIMEOUT": "30"
    })
    def test_environment_variables_openai(self):
        """Test OpenAI-specific environment variables."""
        config = EmbeddingBackendsConfig()
        
        openai_backend = config.backends["openai"]
        assert openai_backend.enabled is True
        assert openai_backend.api_key == "test-api-key"
        assert openai_backend.timeout_seconds == 30

    @patch.dict(os.environ, {
        "EMBEDDING_HUGGINGFACE_ENABLED": "true",
        "HUGGINGFACE_API_KEY": "test-hf-key",
        "EMBEDDING_HUGGINGFACE_DEFAULT_MODEL": "custom-model"
    })
    def test_environment_variables_huggingface(self):
        """Test Hugging Face-specific environment variables."""
        config = EmbeddingBackendsConfig()
        
        hf_backend = config.backends["huggingface"]
        assert hf_backend.enabled is True
        assert hf_backend.api_key == "test-hf-key"
        assert hf_backend.default_model == "custom-model"


class TestGlobalConfigManagement:
    """Test global configuration management."""

    def setup_method(self):
        """Reset global config before each test."""
        reset_embedding_backends_config()

    def teardown_method(self):
        """Reset global config after each test."""
        reset_embedding_backends_config()

    def test_get_embedding_backends_config_singleton(self):
        """Test that get_embedding_backends_config returns singleton."""
        config1 = get_embedding_backends_config()
        config2 = get_embedding_backends_config()
        
        assert config1 is config2

    def test_reset_embedding_backends_config(self):
        """Test resetting the global configuration."""
        config1 = get_embedding_backends_config()
        reset_embedding_backends_config()
        config2 = get_embedding_backends_config()
        
        assert config1 is not config2

    @patch.dict(os.environ, {"EMBEDDING_OLLAMA_ENABLED": "false"})
    def test_global_config_with_environment_variables(self):
        """Test global config respects environment variables."""
        config = get_embedding_backends_config()
        
        assert config.backends["ollama"].enabled is False


class TestBackendPriorityAndFallback:
    """Test backend priority and fallback behavior."""

    def setup_method(self):
        """Reset global config before each test."""
        reset_embedding_backends_config()

    def teardown_method(self):
        """Reset global config after each test."""
        reset_embedding_backends_config()

    def test_backend_priority_ordering(self):
        """Test that backends are ordered by priority."""
        config = EmbeddingBackendsConfig()
        
        # Enable all backends
        config.backends["ollama"].enabled = True
        config.backends["sentence_transformers"].enabled = True
        config.backends["openai"].enabled = True
        config.backends["huggingface"].enabled = True
        
        enabled_backends = config.get_enabled_backends()
        
        # Check priority ordering
        priorities = [backend.priority for backend in enabled_backends]
        assert priorities == [1, 2, 3, 4]  # ollama, sentence_transformers, openai, huggingface

    def test_fallback_chain_with_disabled_backends(self):
        """Test fallback chain when some backends are disabled."""
        config = EmbeddingBackendsConfig()
        
        # Disable ollama and openai
        config.backends["ollama"].enabled = False
        config.backends["openai"].enabled = False
        
        # Enable sentence transformers and huggingface
        config.backends["sentence_transformers"].enabled = True
        config.backends["huggingface"].enabled = True
        
        enabled_backends = config.get_enabled_backends()
        
        # Should only return enabled backends in priority order
        assert len(enabled_backends) == 2
        assert enabled_backends[0].name == "sentence_transformers"
        assert enabled_backends[1].name == "huggingface"

    def test_no_fallback_when_all_disabled(self):
        """Test behavior when all backends are disabled."""
        config = EmbeddingBackendsConfig()
        
        # Disable all backends
        for backend in config.backends.values():
            backend.enabled = False
        
        enabled_backends = config.get_enabled_backends()
        
        assert len(enabled_backends) == 0
        assert config.get_primary_backend() is None
        assert len(config.get_fallback_backends()) == 0


class TestMockMode:
    """Test mock mode functionality."""

    def setup_method(self):
        """Reset global config before each test."""
        reset_embedding_backends_config()

    def teardown_method(self):
        """Reset global config after each test."""
        reset_embedding_backends_config()

    def test_mock_mode_default(self):
        """Test default mock mode setting."""
        config = EmbeddingBackendsConfig()
        
        assert config.mock_mode is False

    @patch.dict(os.environ, {"EMBEDDING_MOCK_MODE": "true"})
    def test_mock_mode_enabled(self):
        """Test enabling mock mode via environment variable."""
        config = EmbeddingBackendsConfig()
        
        assert config.mock_mode is True

    def test_mock_mode_validation(self):
        """Test that mock mode allows no enabled backends."""
        config = EmbeddingBackendsConfig()
        
        # Disable all backends
        for backend in config.backends.values():
            backend.enabled = False
        
        # Enable mock mode
        config.mock_mode = True
        
        # Should not raise validation error
        config.validate()

    def test_mock_mode_to_dict(self):
        """Test that mock mode is included in dictionary output."""
        config = EmbeddingBackendsConfig()
        config.mock_mode = True
        
        config_dict = config.to_dict()
        
        assert config_dict["mock_mode"] is True


class TestBackendConfigurationIntegration:
    """Test integration with the embedding service."""

    def setup_method(self):
        """Reset global config before each test."""
        reset_embedding_backends_config()

    def teardown_method(self):
        """Reset global config after each test."""
        reset_embedding_backends_config()

    def test_backend_config_in_rag_config(self):
        """Test that backend config is included in RAG config."""
        from app.config.rag_config import RAGConfig
        
        rag_config = RAGConfig()
        
        # Check that embedding backends config is present
        assert hasattr(rag_config, 'embedding_backends')
        assert isinstance(rag_config.embedding_backends, EmbeddingBackendsConfig)
        
        # Check that it's included in to_dict output
        config_dict = rag_config.to_dict()
        assert "embedding_backends" in config_dict

    def test_backend_config_validation_in_rag_config(self):
        """Test that backend config validation is called in RAG config."""
        from app.config.rag_config import RAGConfig
        
        rag_config = RAGConfig()
        
        # Disable all backends to trigger validation error
        for backend in rag_config.embedding_backends.backends.values():
            backend.enabled = False
        
        # Should raise validation error
        with pytest.raises(ValueError, match="At least one backend must be enabled"):
            rag_config.validate()

    def test_backend_config_environment_override(self):
        """Test that environment variables override default backend config."""
        with patch.dict(os.environ, {
            "EMBEDDING_OLLAMA_ENABLED": "false",
            "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED": "true",
            "EMBEDDING_MOCK_MODE": "false"
        }):
            from app.config.rag_config import RAGConfig
            
            rag_config = RAGConfig()
            
            # Check that environment variables are respected
            assert rag_config.embedding_backends.backends["ollama"].enabled is False
            assert rag_config.embedding_backends.backends["sentence_transformers"].enabled is True
            assert rag_config.embedding_backends.mock_mode is False

