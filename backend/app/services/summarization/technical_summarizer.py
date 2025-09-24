"""Technical-specific summarizer for Reynard.

This module provides specialized summarization for technical content,
documentation, and engineering materials with technical-specific prompts.
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


class TechnicalSummarizer(BaseSummarizer):
    """Specialized summarizer for technical content and documentation.

    This summarizer is optimized for technical documentation, engineering
    content, and specialized technical materials with technical-specific prompts.
    """

    def __init__(self, ollama_service):
        """Initialize the technical summarizer.

        Args:
            ollama_service: Instance of Reynard's OllamaService

        """
        super().__init__(
            name="technical_summarizer",
            supported_content_types=[ContentType.TECHNICAL, ContentType.CODE],
        )
        self.ollama_service = ollama_service
        self._default_model = "llama3.2:3b"

    async def initialize(self) -> bool:
        """Initialize the technical summarizer."""
        try:
            if not self.ollama_service:
                logger.error("Ollama service not available")
                return False

            self._is_available = True
            logger.info("✅ TechnicalSummarizer initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize TechnicalSummarizer: {e}")
            return False

    async def summarize(
        self, text: str, options: SummarizationOptions,
    ) -> SummarizationResult:
        """Summarize technical text."""
        if not self._is_available:
            raise RuntimeError("TechnicalSummarizer is not available")

        if not await self.validate_text(text):
            raise ValueError("Invalid technical text for summarization")

        start_time = time.time()

        try:
            # Analyze technical content
            technical_analysis = self._analyze_technical_content(text)

            # Generate summary
            summary_text = await self._generate_technical_summary(
                text, options, technical_analysis,
            )

            processing_time = time.time() - start_time

            # Extract technical-specific metadata
            concepts = self._extract_technical_concepts(text)
            specifications = self._extract_specifications(text)

            # Create result
            result = SummarizationResult(
                id=str(uuid.uuid4()),
                original_text=text,
                summary=summary_text,
                content_type=ContentType.TECHNICAL,
                summary_level=options.summary_level,
                model=options.model or self._default_model,
                processing_time=processing_time,
                word_count=len(text.split()),
                summary_word_count=len(summary_text.split()),
                metadata={
                    "summarizer": self.name,
                    "model_used": options.model or self._default_model,
                    "technical_domain": self._detect_technical_domain(text),
                    "concept_count": len(concepts),
                    "specification_count": len(specifications),
                    "technical_analysis": technical_analysis,
                },
            )

            # Add optional fields
            if options.include_outline:
                result.outline = await self._extract_technical_outline(
                    summary_text, concepts,
                )

            if options.include_highlights:
                result.highlights = await self._extract_technical_highlights(
                    text, specifications,
                )

            # Calculate quality score
            result.quality_score = await self._calculate_technical_quality(
                text, summary_text, technical_analysis,
            )

            return result

        except Exception as e:
            logger.error(f"Technical summarization failed: {e}")
            raise

    async def summarize_stream(
        self, text: str, options: SummarizationOptions,
    ) -> AsyncGenerator[dict[str, Any]]:
        """Stream technical summarization progress."""
        if not self._is_available:
            yield {
                "event": "error",
                "data": {"message": "TechnicalSummarizer is not available"},
            }
            return

        try:
            yield {
                "event": "start",
                "data": {"message": "Starting technical summarization"},
            }

            # Analyze technical content
            technical_analysis = self._analyze_technical_content(text)
            yield {
                "event": "analyze",
                "data": {"message": "Technical content analyzed"},
            }

            # Stream summary generation
            summary_text = ""
            async for chunk in self._generate_technical_summary_stream(
                text, options, technical_analysis,
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
            logger.error(f"Streaming technical summarization failed: {e}")
            yield {
                "event": "error",
                "data": {"message": str(e)},
            }

    async def validate_text(self, text: str) -> bool:
        """Validate technical text."""
        if not text or not text.strip():
            return False

        # Check minimum length for technical content
        if len(text.strip()) < 50:
            return False

        # Check maximum length
        if len(text) > 150000:  # ~37k tokens
            return False

        return True

    def _analyze_technical_content(self, text: str) -> dict[str, Any]:
        """Analyze the technical content."""
        analysis = {
            "has_specifications": bool(self._extract_specifications(text)),
            "has_diagrams": bool("diagram" in text.lower() or "figure" in text.lower()),
            "has_equations": bool(
                "=" in text and any(char in text for char in ["+", "-", "*", "/", "^"]),
            ),
            "has_measurements": bool(
                any(
                    unit in text.lower()
                    for unit in ["mm", "cm", "m", "kg", "hz", "mbps", "gb"]
                ),
            ),
            "complexity_indicators": [],
        }

        # Check for complexity indicators
        if "algorithm" in text.lower():
            analysis["complexity_indicators"].append("algorithms")
        if "protocol" in text.lower():
            analysis["complexity_indicators"].append("protocols")
        if "architecture" in text.lower():
            analysis["complexity_indicators"].append("architecture")
        if "implementation" in text.lower():
            analysis["complexity_indicators"].append("implementation")

        return analysis

    def _detect_technical_domain(self, text: str) -> str:
        """Detect the technical domain."""
        text_lower = text.lower()

        if any(
            keyword in text_lower
            for keyword in ["software", "programming", "code", "api", "database"]
        ):
            return "software"
        if any(
            keyword in text_lower
            for keyword in ["hardware", "circuit", "component", "electrical"]
        ):
            return "hardware"
        if any(
            keyword in text_lower
            for keyword in ["network", "protocol", "tcp", "ip", "routing"]
        ):
            return "networking"
        if any(
            keyword in text_lower
            for keyword in ["security", "encryption", "authentication", "vulnerability"]
        ):
            return "security"
        if any(
            keyword in text_lower
            for keyword in ["machine learning", "ai", "neural", "model", "training"]
        ):
            return "ai_ml"
        return "general"

    def _extract_technical_concepts(self, text: str) -> list[str]:
        """Extract technical concepts from text."""
        concepts = []

        # Common technical terms
        technical_terms = [
            "algorithm",
            "protocol",
            "architecture",
            "framework",
            "library",
            "database",
            "api",
            "interface",
            "component",
            "module",
            "configuration",
            "deployment",
            "infrastructure",
            "scalability",
            "performance",
            "optimization",
            "security",
            "authentication",
            "encryption",
            "compression",
            "caching",
            "load balancing",
        ]

        text_lower = text.lower()
        for term in technical_terms:
            if term in text_lower:
                concepts.append(term)

        return concepts

    def _extract_specifications(self, text: str) -> list[str]:
        """Extract technical specifications from text."""
        import re

        specifications = []

        # Pattern for specifications (e.g., "100 Mbps", "2.4 GHz", "512 MB")
        spec_pattern = (
            r"\d+(?:\.\d+)?\s*(?:Mbps|Gbps|MHz|GHz|MB|GB|TB|KB|ms|s|Hz|W|V|A)"
        )
        matches = re.findall(spec_pattern, text, re.IGNORECASE)
        specifications.extend(matches)

        # Pattern for version numbers (e.g., "v2.1", "version 3.0")
        version_pattern = r"(?:v|version)\s*\d+(?:\.\d+)*"
        version_matches = re.findall(version_pattern, text, re.IGNORECASE)
        specifications.extend(version_matches)

        return list(set(specifications))  # Remove duplicates

    async def _generate_technical_summary(
        self,
        text: str,
        options: SummarizationOptions,
        technical_analysis: dict[str, Any],
    ) -> str:
        """Generate technical summary using specialized prompts."""
        system_prompt, user_prompt = self._get_technical_prompts(
            text, options, technical_analysis,
        )

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

    async def _generate_technical_summary_stream(
        self,
        text: str,
        options: SummarizationOptions,
        technical_analysis: dict[str, Any],
    ) -> AsyncGenerator[dict[str, Any]]:
        """Generate technical summary with streaming."""
        system_prompt, user_prompt = self._get_technical_prompts(
            text, options, technical_analysis,
        )

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

    def _get_technical_prompts(
        self,
        text: str,
        options: SummarizationOptions,
        technical_analysis: dict[str, Any],
    ) -> tuple[str, str]:
        """Get specialized prompts for technical summarization."""
        # Technical-specific system prompt
        system_prompt = """You are an expert technical writer and engineer specializing in technical documentation and engineering content.

Your task is to create high-quality technical summaries that:
- Explain technical concepts and methodologies clearly
- Preserve important technical specifications and parameters
- Maintain technical accuracy and precision
- Highlight key technical requirements and constraints
- Explain complex systems and architectures
- Use precise technical terminology
- Focus on practical implementation details

Guidelines:
- Use accurate technical language and terminology
- Preserve important specifications, measurements, and parameters
- Explain technical concepts in context
- Highlight key requirements and constraints
- Focus on practical implications and applications
- Maintain technical accuracy throughout
- Use clear, structured explanations"""

        # Add level-specific instructions
        level_instructions = {
            SummaryLevel.BRIEF: "Create a concise technical overview focusing on key concepts.",
            SummaryLevel.EXECUTIVE: "Create a high-level technical summary for management.",
            SummaryLevel.DETAILED: "Create a comprehensive technical summary with full details.",
            SummaryLevel.COMPREHENSIVE: "Create an extensive technical analysis with thorough coverage.",
            SummaryLevel.BULLET: "Create a bullet-point technical summary with key specifications.",
            SummaryLevel.TTS_OPTIMIZED: "Create a technical summary optimized for speech with clear pronunciation.",
        }

        system_prompt += (
            f"\n\nSummary Level: {level_instructions.get(options.summary_level, '')}"
        )

        if options.include_outline:
            system_prompt += "\nInclude a structured outline with main technical concepts and specifications."

        if options.include_highlights:
            system_prompt += "\nInclude important technical highlights, key specifications, and notable requirements."

        # Add technical analysis context
        if technical_analysis:
            system_prompt += "\n\nTechnical Analysis Context:"
            system_prompt += f"\n- Has specifications: {technical_analysis.get('has_specifications', False)}"
            system_prompt += (
                f"\n- Has diagrams: {technical_analysis.get('has_diagrams', False)}"
            )
            system_prompt += (
                f"\n- Has equations: {technical_analysis.get('has_equations', False)}"
            )
            system_prompt += f"\n- Has measurements: {technical_analysis.get('has_measurements', False)}"
            if technical_analysis.get("complexity_indicators"):
                system_prompt += f"\n- Complexity indicators: {', '.join(technical_analysis['complexity_indicators'])}"

        # User prompt
        user_prompt = (
            f"Please analyze and summarize the following technical content:\n\n{text}"
        )

        if options.max_length:
            user_prompt += (
                f"\n\nTarget length: approximately {options.max_length} words."
            )

        return system_prompt, user_prompt

    async def _extract_technical_outline(
        self, summary: str, concepts: list[str],
    ) -> list[str]:
        """Extract outline points from technical summary."""
        outline = []

        # Add concept information
        if concepts:
            outline.append(f"Technical concepts: {', '.join(concepts[:5])}")

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
                    "specification",
                    "requirement",
                    "architecture",
                ]
            ):
                outline.append(sentence)

        return outline[:6]  # Limit to 6 points

    async def _extract_technical_highlights(
        self, text: str, specifications: list[str],
    ) -> list[str]:
        """Extract highlights from technical text."""
        highlights = []

        # Add specifications as highlights
        for spec in specifications[:3]:  # Limit to 3 specifications
            highlights.append(f"Specification: {spec}")

        # Find sentences with important technical indicators
        sentences = text.split(".")
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 40 and any(
                indicator in sentence.lower()
                for indicator in [
                    "important",
                    "critical",
                    "requirement",
                    "specification",
                    "constraint",
                    "limitation",
                ]
            ):
                highlights.append(sentence)

        return highlights[:4]  # Limit to 4 highlights

    async def _calculate_technical_quality(
        self, original_text: str, summary: str, technical_analysis: dict[str, Any],
    ) -> float:
        """Calculate quality score for technical summary."""
        # Enhanced quality scoring for technical content
        original_words = set(original_text.lower().split())
        summary_words = set(summary.lower().split())

        # Word overlap ratio
        overlap_ratio = (
            len(original_words.intersection(summary_words)) / len(original_words)
            if original_words
            else 0
        )

        # Length appropriateness for technical content (25-35% of original)
        length_ratio = (
            len(summary.split()) / len(original_text.split())
            if original_text.split()
            else 0
        )
        length_score = 1.0 - abs(length_ratio - 0.3) / 0.1  # Optimal at 30%
        length_score = max(0.0, min(1.0, length_score))

        # Technical accuracy score
        technical_score = 0.5  # Base score
        if any(
            keyword in summary.lower()
            for keyword in [
                "specification",
                "requirement",
                "architecture",
                "implementation",
            ]
        ):
            technical_score += 0.3
        if technical_analysis.get("has_specifications") and any(
            char in summary
            for char in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
        ):
            technical_score += 0.1
        if technical_analysis.get("complexity_indicators") and any(
            indicator in summary.lower()
            for indicator in technical_analysis["complexity_indicators"]
        ):
            technical_score += 0.1

        # Combine scores
        quality_score = overlap_ratio * 0.3 + length_score * 0.3 + technical_score * 0.4
        return min(1.0, max(0.0, quality_score))
