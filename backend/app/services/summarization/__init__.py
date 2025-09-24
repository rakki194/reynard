"""Summarization services module for Reynard.

This module provides a modular approach to text summarization with support for
different content types, summarization strategies, and quality optimization.
Integrates with existing Ollama service and leverages Yipyap's proven architecture.
"""

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
from .ollama_summarizer import OllamaSummarizer
from .technical_summarizer import TechnicalSummarizer

__all__ = [
    "ArticleSummarizer",
    "BaseSummarizer",
    "CodeSummarizer",
    "ContentType",
    "DocumentSummarizer",
    "OllamaSummarizer",
    "SummarizationManager",
    "SummarizationOptions",
    "SummarizationResult",
    "SummaryLevel",
    "TechnicalSummarizer",
]
