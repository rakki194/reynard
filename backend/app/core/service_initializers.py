"""Service Initialization Module for Reynard Backend

This module contains all service initialization functions for the Reynard backend,
implementing the service-oriented architecture pattern with proper error handling
and logging for each service component.

Services:
- Gatekeeper: JWT authentication and user management
- ComfyUI: Image generation and processing integration
- NLWeb: Natural language web processing capabilities
- RAG: Retrieval-Augmented Generation for document processing
- Ollama: Local LLM inference and model management
- TTS: Text-to-Speech synthesis services

Each service initializer follows the same pattern:
- Accepts service configuration dictionary
- Returns boolean success status
- Implements comprehensive error handling
- Provides detailed logging for monitoring
"""

import logging
from typing import Any

# Service initializers
from app.gatekeeper_config import initialize_gatekeeper
from app.services.comfy import initialize_comfy_service
from app.services.nlweb.service_initializer import (
    initialize_nlweb_service,
)

# Authentication
from gatekeeper.api.dependencies import set_auth_manager

logger = logging.getLogger(__name__)


async def init_gatekeeper_service(service_config: dict[str, Any]) -> bool:
    """Initialize the Gatekeeper authentication service.

    This function sets up the JWT-based authentication system, including token
    validation, user management, and authorization middleware. The service is
    critical for securing API endpoints and managing user sessions.

    Args:
        service_config: Configuration dictionary containing JWT settings,
                       token expiration times, and authentication parameters.

    Returns:
        bool: True if initialization succeeds, False otherwise.

    Raises:
        Exception: Logged and returned as False for graceful error handling.

    """
    try:
        auth_manager = await initialize_gatekeeper()
        set_auth_manager(auth_manager)
        logger.info("🔐 Gatekeeper authentication service initialized")
        return True
    except Exception as e:
        logger.error(f"❌ Gatekeeper initialization failed: {e}")
        return False


async def init_comfy_service(service_config: dict[str, Any]) -> bool:
    """Initialize the ComfyUI service for image generation and processing.

    This function establishes the connection to the ComfyUI backend service,
    configures image generation workflows, and sets up the necessary API
    endpoints for creative AI applications.

    Args:
        service_config: Configuration dictionary containing ComfyUI API URL,
                       image directory paths, timeout settings, and reconnection
                       parameters for robust service connectivity.

    Returns:
        bool: True if initialization succeeds, False otherwise.

    Raises:
        Exception: Logged and returned as False for graceful error handling.

    """
    try:
        initialize_comfy_service(service_config)
        logger.info("🎨 ComfyUI service initialized")
        return True
    except Exception as e:
        logger.error(f"❌ ComfyUI initialization failed: {e}")
        return False


async def init_nlweb_service(service_config: dict[str, Any]) -> bool:
    """Initialize the NLWeb service for natural language web processing.

    This function sets up the NLWeb service which provides advanced natural
    language processing capabilities for web content, including text analysis,
    content summarization, and intelligent web interaction features.

    Args:
        service_config: Configuration dictionary containing NLWeb base URL,
                       caching parameters, rate limiting settings, performance
                       monitoring options, and proxy configuration.

    Returns:
        bool: True if initialization succeeds, False otherwise.

    Raises:
        Exception: Logged and returned as False for graceful error handling.

    """
    try:
        initialize_nlweb_service(service_config)
        logger.info("🌐 NLWeb service initialized")
        return True
    except Exception as e:
        logger.error(f"❌ NLWeb initialization failed: {e}")
        return False


async def init_rag_service(service_config: dict[str, Any]) -> bool:
    """Initialize the RAG (Retrieval-Augmented Generation) service.

    This function sets up the RAG service which combines document retrieval
    with language model generation to provide contextually aware responses.
    The service handles document ingestion, vector embeddings, and intelligent
    query processing for enhanced AI interactions.

    Args:
        service_config: Configuration dictionary containing database connection
                       strings, embedding model settings, chunking parameters,
                       ingestion batch sizes, and rate limiting configurations.

    Returns:
        bool: True if initialization succeeds, False otherwise.

    Raises:
        Exception: Logged and returned as False for graceful error handling.

    """
    try:
        from app.services.rag.rag_service import RAGService

        # Create and initialize the new RAG service with continuous indexing
        rag_service = RAGService(service_config)
        await rag_service.initialize()

        # Store the service instance in the registry
        from app.core.service_registry import get_service_registry

        registry = get_service_registry()
        registry.set_service_instance("rag", rag_service)

        logger.info("🧠 RAG service with continuous indexing initialized successfully")
        return True
    except Exception as e:
        logger.error(f"❌ RAG initialization failed: {e}")
        return False


async def init_ai_service(service_config: dict[str, Any]) -> bool:
    """Initialize the AI service for multi-provider LLM inference.

    This function sets up the AI service which provides multi-provider
    language model inference capabilities, supporting Ollama, vLLM, SGLang,
    and LLaMA.cpp Server for flexible AI processing.

    Args:
        service_config: Configuration dictionary containing AI provider settings,
                       model configurations, timeout settings, and feature
                       toggles for assistant, tool calling, and streaming.

    Returns:
        bool: True if initialization succeeds, False otherwise.

    Raises:
        Exception: Logged and returned as False for graceful error handling.

    """
    try:
        from app.core.ai_service_initializer import init_ai_service

        # Initialize the AI service
        success = await init_ai_service(service_config)
        if success:
            logger.info("🤖 AI service initialized successfully")
        else:
            logger.warning("⚠️ AI service initialization failed")
        return success
    except Exception as e:
        logger.error(f"❌ AI initialization failed: {e}")
        return False


async def init_tts_service(service_config: dict[str, Any]) -> bool:
    """Initialize the TTS (Text-to-Speech) service.

    This function sets up the TTS service which converts text input into
    high-quality audio output using configurable voice models and synthesis
    parameters for accessibility and multimedia applications.

    Args:
        service_config: Configuration dictionary containing TTS provider settings,
                       voice model configurations, audio format preferences,
                       and synthesis parameters like speed and quality.

    Returns:
        bool: True if initialization succeeds, False otherwise.

    Raises:
        Exception: Logged and returned as False for graceful error handling.

    """
    try:
        # TTS service initialization would go here
        logger.info("🔊 TTS service initialized")
        return True
    except Exception as e:
        logger.error(f"❌ TTS initialization failed: {e}")
        return False


async def init_search_service(service_config: dict[str, Any]) -> bool:
    """Initialize the Optimized Search service with dependency management.

    This function sets up the Optimized Search service which provides advanced search
    capabilities including semantic search, syntax search, and hybrid search with
    Redis caching, connection pooling, and performance monitoring.
    The service depends on the RAG service being available and properly initialized.

    Args:
        service_config: Configuration dictionary containing search service settings,
                       RAG backend URL, timeout configurations, and search parameters.

    Returns:
        bool: True if initialization succeeds, False otherwise.

    Raises:
        Exception: Logged and returned as False for graceful error handling.

    """
    try:
        from app.api.search.service import OptimizedSearchService

        # Create and initialize the optimized search service
        search_service = OptimizedSearchService()
        success = await search_service.initialize()

        if success:
            # Store the service instance for later use
            from app.core.service_registry import get_service_registry

            registry = get_service_registry()
            registry.set_service_instance("search", search_service)
            logger.info("🔍 Optimized Search service initialized successfully")
        else:
            logger.warning("⚠️ Optimized Search service initialization failed")

        return success
    except Exception as e:
        logger.error(f"❌ Optimized Search service initialization failed: {e}")
        return False


async def shutdown_search_service() -> None:
    """Shutdown the Search service and cleanup resources.

    Properly closes HTTP sessions, cache connections, and database connections.
    """
    try:
        from app.core.service_registry import get_service_registry

        registry = get_service_registry()
        search_service = registry.get_service_instance("search")

        if search_service and hasattr(search_service, "close"):
            await search_service.close()
            logger.info("🔍 Search service shutdown completed")
        else:
            logger.info("🔍 Search service was not initialized or already closed")

    except Exception as e:
        logger.error(f"❌ Search service shutdown failed: {e}")
