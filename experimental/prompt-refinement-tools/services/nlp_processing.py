#!/usr/bin/env python3
"""NLP Processing Service

Advanced NLP processing using spacy, nltk, and transformers for prompt refinement.
Replaces the pseudo-code NLP functions with actual implementations.

🦊 Fox approach: Intelligent text analysis with strategic language understanding
"""

import asyncio
import logging
import re
from dataclasses import dataclass
from typing import Any

# Optional imports with fallbacks
try:
    import spacy

    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    spacy = None

try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    from nltk.tokenize import sent_tokenize, word_tokenize

    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    nltk = None

try:
    from transformers import pipeline

    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    pipeline = None

logger = logging.getLogger(__name__)


@dataclass
class NLPResult:
    """Result of NLP processing operation."""

    text: str
    keywords: list[str]
    entities: list[dict[str, Any]]
    sentiment: dict[str, Any]
    language: str
    summary: str
    processing_time: float


class NLPProcessingService:
    """Advanced NLP processing service using spacy, nltk, and transformers.

    Provides comprehensive text analysis for prompt refinement.
    """

    def __init__(self, config: dict[str, Any] | None = None):
        """Initialize the NLP processing service."""
        self.config = config or {}

        # Configuration
        self.model_name = self.config.get("model_name", "en_core_web_sm")
        self.sentiment_model = self.config.get(
            "sentiment_model",
            "distilbert-base-uncased-finetuned-sst-2-english",
        )

        # Initialize components
        self.nlp_model: spacy.Language | None = None
        self.lemmatizer: WordNetLemmatizer | None = None
        self.stop_words: set = set()
        self.sentiment_pipeline: Any | None = None

        self._initialized = False

    async def initialize(self) -> bool:
        """Initialize the NLP processing service."""
        try:
            # Initialize spaCy
            if SPACY_AVAILABLE:
                try:
                    self.nlp_model = spacy.load(self.model_name)
                    logger.info(f"Loaded spaCy model: {self.model_name}")
                except OSError:
                    logger.warning(
                        f"spaCy model {self.model_name} not found, using fallback",
                    )
                    self.nlp_model = None
            else:
                logger.warning("spaCy not available, using fallback NLP")

            # Initialize NLTK
            if NLTK_AVAILABLE:
                try:
                    # Download required NLTK data
                    nltk.download("stopwords", quiet=True)
                    nltk.download("punkt", quiet=True)
                    nltk.download("wordnet", quiet=True)

                    self.lemmatizer = WordNetLemmatizer()
                    self.stop_words = set(stopwords.words("english"))
                    logger.info("NLTK initialized successfully")
                except Exception as e:
                    logger.warning(f"NLTK initialization failed: {e}")
                    # Don't modify the global NLTK_AVAILABLE variable
            else:
                logger.warning("NLTK not available, using fallback NLP")

            # Initialize transformers
            if TRANSFORMERS_AVAILABLE:
                try:
                    self.sentiment_pipeline = pipeline(
                        "sentiment-analysis",
                        model=self.sentiment_model,
                        return_all_scores=True,
                    )
                    logger.info(f"Loaded sentiment model: {self.sentiment_model}")
                except Exception as e:
                    logger.warning(f"Transformers sentiment model failed: {e}")
                    self.sentiment_pipeline = None
            else:
                logger.warning("Transformers not available, using fallback sentiment")

            self._initialized = True
            logger.info("NLP processing service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize NLP processing service: {e}")
            return False

    async def extract_key_concepts(self, text: str) -> list[str]:
        """Extract key concepts from text.

        Replaces the pseudo-code extract_key_concepts() function.
        """
        if not self._initialized:
            await self.initialize()

        logger.info(f"Extracting key concepts from text: {text[:50]}...")

        try:
            if self.nlp_model:
                # Use spaCy for advanced extraction
                doc = self.nlp_model(text)
                concepts = []

                # Extract named entities
                for ent in doc.ents:
                    if ent.label_ in ["PERSON", "ORG", "GPE", "PRODUCT", "TECHNOLOGY"]:
                        concepts.append(ent.text.lower())

                # Extract noun phrases
                for chunk in doc.noun_chunks:
                    if len(chunk.text.split()) <= 3:  # Limit to 3 words
                        concepts.append(chunk.text.lower())

                # Extract important tokens
                for token in doc:
                    if (
                        token.pos_ in ["NOUN", "PROPN"]
                        and not token.is_stop
                        and not token.is_punct
                        and len(token.text) > 2
                    ):
                        concepts.append(token.lemma_.lower())

                # Remove duplicates and return top concepts
                unique_concepts = list(set(concepts))
                return unique_concepts[:10]  # Limit to 10 concepts

            # Fallback to simple extraction
            return self._extract_key_concepts_fallback(text)

        except Exception as e:
            logger.error(f"Key concept extraction failed: {e}")
            return self._extract_key_concepts_fallback(text)

    def _extract_key_concepts_fallback(self, text: str) -> list[str]:
        """Fallback key concept extraction."""
        words = re.findall(r"\b\w+\b", text.lower())

        # Filter out common words
        common_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "have",
            "has",
            "had",
            "do",
            "does",
            "did",
            "will",
            "would",
            "could",
            "should",
            "may",
            "might",
            "can",
            "this",
            "that",
            "these",
            "those",
            "how",
            "what",
            "why",
            "when",
            "where",
            "which",
            "who",
        }

        # Count word frequencies
        word_freq = {}
        for word in words:
            if len(word) > 2 and word not in common_words:
                word_freq[word] = word_freq.get(word, 0) + 1

        # Return top concepts
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:10]]

    async def assess_clarity_issues(self, text: str) -> list[str]:
        """Assess clarity issues in text.

        Replaces the pseudo-code assess_clarity_issues() function.
        """
        if not self._initialized:
            await self.initialize()

        issues = []

        try:
            # Check for vague terms
            vague_terms = [
                "thing",
                "stuff",
                "something",
                "anything",
                "everything",
                "somehow",
                "somewhere",
            ]
            if any(term in text.lower() for term in vague_terms):
                issues.append("Contains vague terms")

            # Check for missing context
            if len(text.split()) < 5:
                issues.append("Query too short - may lack context")

            # Check for unclear pronouns
            if re.search(r"\b(it|this|that|they|them)\b", text, re.IGNORECASE):
                issues.append("Contains unclear pronouns")

            # Check for run-on sentences
            sentences = text.split(".")
            for sentence in sentences:
                if len(sentence.split()) > 30:
                    issues.append("Contains overly long sentences")
                    break

            # Check for missing question words
            question_words = ["how", "what", "why", "when", "where", "which", "who"]
            if not any(word in text.lower() for word in question_words):
                if "?" in text:
                    issues.append("Question lacks specific question words")

            return issues

        except Exception as e:
            logger.error(f"Clarity assessment failed: {e}")
            return ["Assessment failed"]

    async def evaluate_specificity_gaps(self, text: str) -> list[str]:
        """Evaluate specificity gaps in text.

        Replaces the pseudo-code evaluate_specificity_gaps() function.
        """
        if not self._initialized:
            await self.initialize()

        gaps = []

        try:
            # Check for missing details
            if not re.search(
                r"\b(how|what|why|when|where|which|who)\b",
                text,
                re.IGNORECASE,
            ):
                gaps.append("Missing specific question words")

            # Check for missing context
            if len(text.split()) < 10:
                gaps.append("May lack sufficient detail")

            # Check for generic terms
            generic_terms = [
                "good",
                "bad",
                "better",
                "best",
                "nice",
                "great",
                "awesome",
            ]
            if any(term in text.lower() for term in generic_terms):
                gaps.append("Contains generic descriptive terms")

            # Check for missing technical details
            if any(
                word in text.lower() for word in ["code", "function", "class", "method"]
            ):
                if not any(
                    word in text.lower()
                    for word in ["python", "javascript", "typescript", "java", "c++"]
                ):
                    gaps.append("Mentions code but lacks language specification")

            return gaps

        except Exception as e:
            logger.error(f"Specificity evaluation failed: {e}")
            return ["Evaluation failed"]

    async def predict_effectiveness(self, text: str) -> float:
        """Predict effectiveness of text.

        Replaces the pseudo-code predict_effectiveness() function.
        """
        if not self._initialized:
            await self.initialize()

        try:
            score = 0.5  # Base score

            # Length factor
            word_count = len(text.split())
            if word_count > 10:
                score += 0.2
            elif word_count < 5:
                score -= 0.2

            # Specificity factor
            specific_indicators = [
                "how",
                "what",
                "why",
                "when",
                "where",
                "which",
                "who",
            ]
            if any(indicator in text.lower() for indicator in specific_indicators):
                score += 0.1

            # Clarity factor
            clarity_issues = await self.assess_clarity_issues(text)
            score -= len(clarity_issues) * 0.1

            # Technical detail factor
            technical_terms = [
                "api",
                "function",
                "class",
                "method",
                "variable",
                "import",
                "export",
            ]
            if any(term in text.lower() for term in technical_terms):
                score += 0.1

            # Question structure factor
            if "?" in text and any(
                word in text.lower() for word in specific_indicators
            ):
                score += 0.1

            return max(0.0, min(1.0, score))

        except Exception as e:
            logger.error(f"Effectiveness prediction failed: {e}")
            return 0.5

    async def identify_ambiguities(self, text: str) -> list[str]:
        """Identify ambiguities in text.

        Replaces the pseudo-code identify_ambiguities() function.
        """
        if not self._initialized:
            await self.initialize()

        ambiguities = []

        try:
            # Check for ambiguous pronouns
            if re.search(r"\b(it|this|that|they|them)\b", text, re.IGNORECASE):
                ambiguities.append("Unclear pronoun references")

            # Check for vague terms
            vague_terms = ["thing", "stuff", "something", "anything", "everything"]
            if any(term in text.lower() for term in vague_terms):
                ambiguities.append("Vague terminology")

            # Check for ambiguous comparisons
            if re.search(
                r"\b(better|worse|more|less|most|least)\b",
                text,
                re.IGNORECASE,
            ):
                ambiguities.append("Ambiguous comparisons without context")

            # Check for missing context
            if len(text.split()) < 8:
                ambiguities.append("Insufficient context for clarity")

            return ambiguities

        except Exception as e:
            logger.error(f"Ambiguity identification failed: {e}")
            return ["Identification failed"]

    async def replace_vague_terms(self, text: str) -> str:
        """Replace vague terms with more specific language."""
        replacements = {
            "thing": "item",
            "stuff": "materials",
            "something": "a specific item",
            "anything": "any item",
            "everything": "all items",
            "somehow": "using a specific method",
            "somewhere": "in a specific location",
        }

        result = text
        for vague, specific in replacements.items():
            result = re.sub(
                r"\b" + vague + r"\b",
                specific,
                result,
                flags=re.IGNORECASE,
            )

        return result

    async def clarify_pronouns(self, text: str) -> str:
        """Clarify pronoun references."""
        # Simple pronoun clarification - in practice, this would be more sophisticated
        result = text

        # Replace common ambiguous pronouns with more specific terms
        pronoun_replacements = {
            r"\bit\b": "the system",
            r"\bthis\b": "this approach",
            r"\bthat\b": "that method",
            r"\bthey\b": "the developers",
            r"\bthem\b": "the components",
        }

        for pronoun, replacement in pronoun_replacements.items():
            result = re.sub(pronoun, replacement, result, flags=re.IGNORECASE)

        return result

    async def add_specific_details(self, text: str) -> str:
        """Add specific details to improve clarity."""
        # This is a simplified version - in practice, this would use more sophisticated NLP
        result = text

        # Add context for common technical terms
        if "code" in text.lower() and "language" not in text.lower():
            result = result.replace("code", "code (specify programming language)")

        if "function" in text.lower() and "purpose" not in text.lower():
            result = result.replace("function", "function (specify purpose)")

        return result

    async def add_question_words(self, text: str) -> str:
        """Add specific question words for clarity."""
        if "?" in text and not any(
            word in text.lower()
            for word in ["how", "what", "why", "when", "where", "which", "who"]
        ):
            # Add appropriate question word based on context
            if any(
                word in text.lower()
                for word in ["implement", "create", "build", "make"]
            ):
                text = "How to " + text.lower().replace("?", "?")
            elif any(word in text.lower() for word in ["is", "are", "was", "were"]):
                text = "What " + text.lower().replace("?", "?")
            else:
                text = "How " + text.lower().replace("?", "?")

        return text

    async def integrate_concepts(self, text: str, concepts: list[str]) -> str:
        """Integrate key concepts into the text."""
        if not concepts:
            return text

        # Add relevant concepts to the text
        concept_text = f" (considering: {', '.join(concepts[:3])})"

        if text.endswith("?"):
            return text[:-1] + concept_text + "?"
        return text + concept_text

    async def integrate_terminology(
        self,
        text: str,
        terminology: dict[str, Any],
    ) -> str:
        """Integrate project-specific terminology."""
        # This would integrate terminology from the codebase analysis
        # For now, return the text as-is
        return text

    async def analyze_text_comprehensive(self, text: str) -> NLPResult:
        """Perform comprehensive text analysis.

        Returns detailed NLP analysis results.
        """
        start_time = asyncio.get_event_loop().time()

        try:
            # Extract key concepts
            keywords = await self.extract_key_concepts(text)

            # Extract entities (if spaCy available)
            entities = []
            if self.nlp_model:
                doc = self.nlp_model(text)
                for ent in doc.ents:
                    entities.append(
                        {
                            "text": ent.text,
                            "label": ent.label_,
                            "start": ent.start_char,
                            "end": ent.end_char,
                        },
                    )

            # Analyze sentiment
            sentiment = {"label": "neutral", "score": 0.5}
            if self.sentiment_pipeline:
                try:
                    sentiment_result = self.sentiment_pipeline(text)
                    if sentiment_result:
                        sentiment = sentiment_result[0]
                except Exception as e:
                    logger.warning(f"Sentiment analysis failed: {e}")

            # Detect language (simple heuristic)
            language = "en"  # Default to English
            if self.nlp_model:
                try:
                    doc = self.nlp_model(text)
                    language = doc.lang_
                except Exception:
                    pass

            # Generate summary
            summary = self._generate_summary(text)

            processing_time = asyncio.get_event_loop().time() - start_time

            return NLPResult(
                text=text,
                keywords=keywords,
                entities=entities,
                sentiment=sentiment,
                language=language,
                summary=summary,
                processing_time=processing_time,
            )

        except Exception as e:
            logger.error(f"Comprehensive text analysis failed: {e}")
            return NLPResult(
                text=text,
                keywords=[],
                entities=[],
                sentiment={"label": "neutral", "score": 0.5},
                language="en",
                summary=text[:100] + "..." if len(text) > 100 else text,
                processing_time=0.0,
            )

    def _generate_summary(self, text: str) -> str:
        """Generate a simple summary of the text."""
        sentences = text.split(".")
        if len(sentences) > 1:
            return sentences[0].strip() + "."
        return text[:200] + "..." if len(text) > 200 else text
