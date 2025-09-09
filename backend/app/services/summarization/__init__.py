"""
Summarization services module for Reynard.

This module provides a modular approach to text summarization with support for
different content types, summarization strategies, and quality optimization.
Integrates with existing Ollama service and leverages Yipyap's proven architecture.
"""

from .base import (
    BaseSummarizer,
    SummarizationResult,
    SummarizationOptions,
    ContentType,
    SummaryLevel,
)
from .ollama_summarizer import OllamaSummarizer
from .manager import SummarizationManager
from .article_summarizer import ArticleSummarizer
from .code_summarizer import CodeSummarizer
from .document_summarizer import DocumentSummarizer
from .technical_summarizer import TechnicalSummarizer

__all__ = [
    "BaseSummarizer",
    "SummarizationResult", 
    "SummarizationOptions",
    "ContentType",
    "SummaryLevel",
    "OllamaSummarizer",
    "SummarizationManager",
    "ArticleSummarizer",
    "CodeSummarizer", 
    "DocumentSummarizer",
    "TechnicalSummarizer",
]
