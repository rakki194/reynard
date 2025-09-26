"""🦊 Reynard Summarization Services Module
=========================================

This module provides a modular approach to text summarization with support for
different content types, summarization strategies, and quality optimization.
Integrates with the AI service and supports multiple model providers.

Key Features:
- Multi-Provider Support: Works with Ollama, vLLM, SGLang, LLaMA.cpp
- Content Type Specialization: Different strategies for articles, code, documents
- Quality Optimization: Advanced quality scoring and improvement suggestions
- Streaming Support: Real-time summarization with progress updates
- Template System: Flexible summarization templates and customization

Author: Reynard Development Team
Version: 2.0.0 - AI Service Integration
"""

from .ai_summarizer import (
    AISummarizer,
    get_ai_summarizer,
    health_check_ai_summarizer,
    initialize_ai_summarizer,
    shutdown_ai_summarizer,
)
from .article_summarizer import ArticleSummarizer
from .base import (
    BaseSummarizer,
    ContentType,
    SummarizationOptions,
    SummarizationResult,
    SummaryLevel,
)
from .code_summarizer import CodeSummarizer
from .document_summarizer import DocumentSummarizer
from .manager import SummarizationManager
from .technical_summarizer import TechnicalSummarizer

__all__ = [
    "ArticleSummarizer",
    "BaseSummarizer",
    "CodeSummarizer",
    "ContentType",
    "DocumentSummarizer",
    "SummarizationManager",
    "SummarizationOptions",
    "SummarizationResult",
    "SummaryLevel",
    "TechnicalSummarizer",
    "AISummarizer",
    "get_ai_summarizer",
    "health_check_ai_summarizer",
    "initialize_ai_summarizer",
    "shutdown_ai_summarizer",
]
