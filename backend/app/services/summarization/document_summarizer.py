"""
Document-specific summarizer for Reynard.

This module provides specialized summarization for documents, reports,
and formal text content with document-specific prompts and processing.
"""

import logging
import time
import uuid
from collections.abc import AsyncGenerator
from typing import Any

from .base import (
    BaseSummarizer,
    ContentType,
    SummarizationOptions,
    SummarizationResult,
    SummaryLevel,
)

logger = logging.getLogger(__name__)


class DocumentSummarizer(BaseSummarizer):
    """
    Specialized summarizer for documents and formal content.

    This summarizer is optimized for documents, reports, formal text,
    and structured content with specialized prompts and processing.
    """

    def __init__(self, ollama_service):
        """
        Initialize the document summarizer.

        Args:
            ollama_service: Instance of Reynard's OllamaService
        """
        super().__init__(
            name="document_summarizer",
            supported_content_types=[ContentType.DOCUMENT, ContentType.GENERAL],
        )
        self.ollama_service = ollama_service
        self._default_model = "llama3.2:3b"

    async def initialize(self) -> bool:
        """Initialize the document summarizer."""
        try:
            if not self.ollama_service:
                logger.error("Ollama service not available")
                return False

            self._is_available = True
            logger.info("✅ DocumentSummarizer initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize DocumentSummarizer: {e}")
            return False

    async def summarize(
        self, text: str, options: SummarizationOptions
    ) -> SummarizationResult:
        """Summarize document text."""
        if not self._is_available:
            raise RuntimeError("DocumentSummarizer is not available")

        if not await self.validate_text(text):
            raise ValueError("Invalid document text for summarization")

        start_time = time.time()

        try:
            # Preprocess document text
            processed_text = self._preprocess_document(text)

            # Generate summary
            summary_text = await self._generate_document_summary(
                processed_text, options
            )

            processing_time = time.time() - start_time

            # Extract document-specific metadata
            title = self._extract_title(processed_text)
            sections = self._extract_sections(processed_text)

            # Create result
            result = SummarizationResult(
                id=str(uuid.uuid4()),
                original_text=text,
                summary=summary_text,
                content_type=ContentType.DOCUMENT,
                summary_level=options.summary_level,
                model=options.model or self._default_model,
                processing_time=processing_time,
                word_count=len(text.split()),
                summary_word_count=len(summary_text.split()),
                title=title,
                metadata={
                    "summarizer": self.name,
                    "model_used": options.model or self._default_model,
                    "document_type": self._detect_document_type(processed_text),
                    "section_count": len(sections),
                    "sections": sections,
                },
            )

            # Add optional fields
            if options.include_outline:
                result.outline = await self._extract_document_outline(
                    summary_text, sections
                )

            if options.include_highlights:
                result.highlights = await self._extract_document_highlights(
                    processed_text
                )

            # Calculate quality score
            result.quality_score = await self._calculate_document_quality(
                text, summary_text
            )

            return result

        except Exception as e:
            logger.error(f"Document summarization failed: {e}")
            raise

    async def summarize_stream(
        self, text: str, options: SummarizationOptions
    ) -> AsyncGenerator[dict[str, Any]]:
        """Stream document summarization progress."""
        if not self._is_available:
            yield {
                "event": "error",
                "data": {"message": "DocumentSummarizer is not available"},
            }
            return

        try:
            yield {
                "event": "start",
                "data": {"message": "Starting document summarization"},
            }

            # Preprocess document
            processed_text = self._preprocess_document(text)
            yield {"event": "preprocess", "data": {"message": "Document preprocessed"}}

            # Stream summary generation
            summary_text = ""
            async for chunk in self._generate_document_summary_stream(
                processed_text, options
            ):
                if chunk.get("type") == "token":
                    summary_text += chunk.get("data", "")
                    yield {
                        "event": "token",
                        "data": {
                            "token": chunk.get("data", ""),
                            "partial_summary": summary_text,
                        },
                    }
                elif chunk.get("type") == "complete":
                    # Generate final result
                    result = await self.summarize(text, options)
                    yield {
                        "event": "complete",
                        "data": result.to_dict(),
                    }

        except Exception as e:
            logger.error(f"Streaming document summarization failed: {e}")
            yield {
                "event": "error",
                "data": {"message": str(e)},
            }

    async def validate_text(self, text: str) -> bool:
        """Validate document text."""
        if not text or not text.strip():
            return False

        # Check minimum length for documents
        if len(text.strip()) < 100:
            return False

        # Check maximum length
        if len(text) > 200000:  # ~50k tokens
            return False

        return True

    def _preprocess_document(self, text: str) -> str:
        """Preprocess document text for better summarization."""
        # Remove excessive whitespace
        text = " ".join(text.split())

        # Remove common document artifacts
        artifacts = [
            "Page",
            "Confidential",
            "Draft",
            "Version",
            "Last updated",
            "Table of Contents",
        ]

        for artifact in artifacts:
            text = text.replace(artifact, "")

        return text.strip()

    def _extract_title(self, text: str) -> str | None:
        """Extract or generate a title for the document."""
        # Try to find existing title patterns
        lines = text.split("\n")
        for line in lines[:3]:  # Check first 3 lines
            line = line.strip()
            if len(line) > 10 and len(line) < 100 and not line.endswith("."):
                return line

        return None

    def _extract_sections(self, text: str) -> list[str]:
        """Extract document sections."""
        sections = []

        # Look for section headers (various patterns)
        import re

        # Pattern 1: Numbered sections (1., 2., etc.)
        numbered_sections = re.findall(r"^\d+\.\s+([^\n]+)", text, re.MULTILINE)
        sections.extend(numbered_sections)

        # Pattern 2: Capitalized headers
        capitalized_headers = re.findall(r"^[A-Z][A-Z\s]+$", text, re.MULTILINE)
        sections.extend(capitalized_headers)

        # Pattern 3: Headers with colons
        colon_headers = re.findall(r"^([^:\n]+):\s*$", text, re.MULTILINE)
        sections.extend(colon_headers)

        return list(set(sections))[:10]  # Limit to 10 sections

    def _detect_document_type(self, text: str) -> str:
        """Detect the type of document."""
        text_lower = text.lower()

        if any(
            keyword in text_lower
            for keyword in ["report", "analysis", "findings", "conclusions"]
        ):
            return "report"
        if any(
            keyword in text_lower
            for keyword in ["proposal", "recommendation", "suggest"]
        ):
            return "proposal"
        if any(
            keyword in text_lower
            for keyword in ["policy", "procedure", "guideline", "standard"]
        ):
            return "policy"
        if any(
            keyword in text_lower
            for keyword in ["manual", "guide", "instruction", "tutorial"]
        ):
            return "manual"
        return "general"

    async def _generate_document_summary(
        self, text: str, options: SummarizationOptions
    ) -> str:
        """Generate document summary using specialized prompts."""
        system_prompt, user_prompt = self._get_document_prompts(text, options)

        model = options.model or self._default_model

        # Generate summary
        summary_text = ""
        async for event in self.ollama_service.chat_stream(
            message=user_prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=options.temperature,
            top_p=options.top_p,
            stream=True,
        ):
            if event.type == "token":
                summary_text += event.data
            elif event.type == "error":
                raise RuntimeError(f"Ollama error: {event.data}")

        return summary_text.strip()

    async def _generate_document_summary_stream(
        self, text: str, options: SummarizationOptions
    ) -> AsyncGenerator[dict[str, Any]]:
        """Generate document summary with streaming."""
        system_prompt, user_prompt = self._get_document_prompts(text, options)

        model = options.model or self._default_model

        async for event in self.ollama_service.chat_stream(
            message=user_prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=options.temperature,
            top_p=options.top_p,
            stream=True,
        ):
            yield {
                "type": event.type,
                "data": event.data,
                "timestamp": event.timestamp,
                "metadata": event.metadata,
            }

    def _get_document_prompts(
        self, text: str, options: SummarizationOptions
    ) -> tuple[str, str]:
        """Get specialized prompts for document summarization."""
        # Document-specific system prompt
        system_prompt = """You are an expert document analyst specializing in formal documents, reports, and structured content.

Your task is to create high-quality document summaries that:
- Extract key information and main points
- Maintain document structure and hierarchy
- Preserve important details and context
- Identify key findings and conclusions
- Highlight recommendations and action items
- Use formal, professional language
- Maintain objectivity and accuracy

Guidelines:
- Focus on factual content and key information
- Preserve document structure and organization
- Include important statistics, data, and findings
- Highlight conclusions and recommendations
- Use clear, professional language
- Ensure the summary is comprehensive yet concise"""

        # Add level-specific instructions
        level_instructions = {
            SummaryLevel.BRIEF: "Create a concise executive summary focusing on key findings.",
            SummaryLevel.EXECUTIVE: "Create an executive summary suitable for decision-makers.",
            SummaryLevel.DETAILED: "Create a comprehensive summary covering all major sections.",
            SummaryLevel.COMPREHENSIVE: "Create an extensive summary with thorough analysis.",
            SummaryLevel.BULLET: "Create a bullet-point summary with key points and findings.",
            SummaryLevel.TTS_OPTIMIZED: "Create a summary optimized for speech with clear pronunciation.",
        }

        system_prompt += (
            f"\n\nSummary Level: {level_instructions.get(options.summary_level, '')}"
        )

        if options.include_outline:
            system_prompt += (
                "\nInclude a structured outline with main sections and key points."
            )

        if options.include_highlights:
            system_prompt += (
                "\nInclude important highlights, key findings, and notable data points."
            )

        # User prompt
        user_prompt = f"Please summarize the following document:\n\n{text}"

        if options.max_length:
            user_prompt += (
                f"\n\nTarget length: approximately {options.max_length} words."
            )

        return system_prompt, user_prompt

    async def _extract_document_outline(
        self, summary: str, sections: list[str]
    ) -> list[str]:
        """Extract outline points from document summary."""
        outline = []

        # Add section information
        if sections:
            outline.append(f"Document sections: {', '.join(sections[:5])}")

        # Extract key points from summary
        sentences = summary.split(".")
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 30 and any(
                keyword in sentence.lower()
                for keyword in [
                    "main",
                    "key",
                    "important",
                    "primary",
                    "finding",
                    "conclusion",
                    "recommendation",
                ]
            ):
                outline.append(sentence)

        return outline[:6]  # Limit to 6 points

    async def _extract_document_highlights(self, text: str) -> list[str]:
        """Extract highlights from document text."""
        highlights = []

        # Find sentences with important indicators
        sentences = text.split(".")
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 40 and any(
                indicator in sentence.lower()
                for indicator in [
                    "important",
                    "significant",
                    "notable",
                    "key finding",
                    "conclusion",
                    "recommendation",
                ]
            ):
                highlights.append(sentence)

        return highlights[:4]  # Limit to 4 highlights

    async def _calculate_document_quality(
        self, original_text: str, summary: str
    ) -> float:
        """Calculate quality score for document summary."""
        # Enhanced quality scoring for documents
        original_words = set(original_text.lower().split())
        summary_words = set(summary.lower().split())

        # Word overlap ratio
        overlap_ratio = (
            len(original_words.intersection(summary_words)) / len(original_words)
            if original_words
            else 0
        )

        # Length appropriateness for documents (20-30% of original)
        length_ratio = (
            len(summary.split()) / len(original_text.split())
            if original_text.split()
            else 0
        )
        length_score = 1.0 - abs(length_ratio - 0.25) / 0.1  # Optimal at 25%
        length_score = max(0.0, min(1.0, length_score))

        # Structure score (check for proper document structure)
        structure_score = 0.5  # Base score
        if any(
            keyword in summary.lower()
            for keyword in ["introduction", "conclusion", "finding", "recommendation"]
        ):
            structure_score += 0.3
        if len(summary.split(".")) >= 3:  # Multiple sentences
            structure_score += 0.2

        # Combine scores
        quality_score = overlap_ratio * 0.4 + length_score * 0.3 + structure_score * 0.3
        return min(1.0, max(0.0, quality_score))
