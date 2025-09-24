"""🦊 Reynard RAG Enhanced Semantic Search
=======================================

Advanced semantic search capabilities for RAG service with intelligent query processing,
result reranking, and multi-modal search optimization.

This module provides:
- Advanced query preprocessing and expansion
- Intelligent result reranking algorithms
- Multi-modal search optimization
- Query intent detection and classification
- Semantic similarity enhancement
- Context-aware search refinement
- Performance optimization and caching

Author: Reynard Development Team
Version: 1.0.0
"""

import re
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Any

from ...core.logging_config import get_service_logger

logger = get_service_logger("rag")


@dataclass
class QueryIntent:
    """Query intent classification result."""

    intent_type: (
        str  # "code_search", "documentation", "concept_explanation", "troubleshooting"
    )
    confidence: float  # 0.0 to 1.0
    keywords: list[str]
    entities: list[str]
    context: dict[str, Any] = field(default_factory=dict)


@dataclass
class SearchContext:
    """Context information for search optimization."""

    user_history: list[str] = field(default_factory=list)
    recent_queries: list[str] = field(default_factory=list)
    preferred_modalities: list[str] = field(default_factory=list)
    session_id: str = ""
    timestamp: float = field(default_factory=time.time)


@dataclass
class EnhancedSearchResult:
    """Enhanced search result with additional metadata."""

    original_hit: dict[str, Any]
    enhanced_score: float
    relevance_factors: dict[str, float]
    semantic_tags: list[str]
    context_matches: list[str]
    rerank_reason: str = ""


class SemanticSearchEnhancer:
    """Advanced semantic search enhancement system.

    Provides intelligent query processing, result reranking,
    and multi-modal search optimization for RAG service.
    """

    def __init__(self, max_history_size: int = 1000):
        self.max_history_size = max_history_size
        self.query_history: deque = deque(maxlen=max_history_size)
        self.result_feedback: dict[str, list[bool]] = defaultdict(list)
        self.intent_patterns = self._initialize_intent_patterns()
        self.semantic_enhancements = self._initialize_semantic_enhancements()

    def _initialize_intent_patterns(self) -> dict[str, list[str]]:
        """Initialize query intent detection patterns."""
        return {
            "code_search": [
                r"\b(function|class|method|def|import|from)\b",
                r"\b(api|endpoint|route|handler)\b",
                r"\b(implementation|code|source)\b",
                r"\b(\.py|\.js|\.ts|\.java|\.cpp)\b",
            ],
            "documentation": [
                r"\b(how to|guide|tutorial|documentation|docs)\b",
                r"\b(explain|describe|what is|definition)\b",
                r"\b(overview|introduction|getting started)\b",
            ],
            "troubleshooting": [
                r"\b(error|bug|issue|problem|fix|solution)\b",
                r"\b(not working|broken|failed|exception)\b",
                r"\b(debug|troubleshoot|resolve)\b",
            ],
            "concept_explanation": [
                r"\b(what is|define|meaning|concept)\b",
                r"\b(explain|understand|learn about)\b",
                r"\b(architecture|design|pattern)\b",
            ],
        }

    def _initialize_semantic_enhancements(self) -> dict[str, Any]:
        """Initialize semantic enhancement configurations."""
        return {
            "code_boost_factors": {
                "function_definition": 1.5,
                "class_definition": 1.4,
                "import_statement": 1.2,
                "comment": 0.8,
                "test_code": 1.3,
            },
            "documentation_boost_factors": {
                "title": 1.6,
                "heading": 1.4,
                "example": 1.3,
                "code_block": 1.2,
                "link": 1.1,
            },
            "context_weights": {
                "recent_queries": 0.3,
                "user_history": 0.2,
                "semantic_similarity": 0.4,
                "content_quality": 0.1,
            },
        }

    async def enhance_query(
        self, query: str, context: SearchContext | None = None,
    ) -> tuple[str, QueryIntent, dict[str, Any]]:
        """Enhance query with semantic processing and intent detection.

        Args:
            query: Original search query
            context: Optional search context

        Returns:
            Tuple of (enhanced_query, intent, enhancement_metadata)

        """
        try:
            # Detect query intent
            intent = await self._detect_query_intent(query)

            # Preprocess and expand query
            enhanced_query = await self._preprocess_query(query, intent)

            # Generate enhancement metadata
            enhancement_metadata = {
                "original_query": query,
                "intent_detected": intent.intent_type,
                "intent_confidence": intent.confidence,
                "query_expansion_applied": enhanced_query != query,
                "context_used": context is not None,
                "enhancement_timestamp": time.time(),
            }

            # Store query in history
            self.query_history.append(
                {
                    "query": query,
                    "enhanced_query": enhanced_query,
                    "intent": intent.intent_type,
                    "timestamp": time.time(),
                },
            )

            logger.info(
                f"Query enhanced: '{query}' -> '{enhanced_query}' (intent: {intent.intent_type})",
            )

            return enhanced_query, intent, enhancement_metadata

        except Exception as e:
            logger.error(f"Query enhancement failed: {e}")
            # Return original query with minimal processing
            basic_intent = QueryIntent(
                intent_type="general",
                confidence=0.5,
                keywords=query.split()[:5],
                entities=[],
            )
            return query, basic_intent, {"error": str(e)}

    async def _detect_query_intent(self, query: str) -> QueryIntent:
        """Detect the intent behind a search query."""
        query_lower = query.lower()
        intent_scores = {}

        # Score each intent type
        for intent_type, patterns in self.intent_patterns.items():
            score = 0.0
            matches = []

            for pattern in patterns:
                if re.search(pattern, query_lower):
                    score += 1.0
                    matches.append(pattern)

            intent_scores[intent_type] = score / len(patterns)

        # Find best intent
        best_intent = max(intent_scores.items(), key=lambda x: x[1])
        intent_type = best_intent[0] if best_intent[1] > 0.3 else "general"
        confidence = best_intent[1]

        # Extract keywords and entities
        keywords = self._extract_keywords(query)
        entities = self._extract_entities(query)

        return QueryIntent(
            intent_type=intent_type,
            confidence=confidence,
            keywords=keywords,
            entities=entities,
            context={"patterns_matched": matches if "matches" in locals() else []},
        )

    def _extract_keywords(self, query: str) -> list[str]:
        """Extract important keywords from query."""
        # Remove common stop words
        stop_words = {
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
            "i",
            "you",
            "he",
            "she",
            "it",
            "we",
            "they",
            "me",
            "him",
            "her",
            "us",
            "them",
        }

        words = re.findall(r"\b\w+\b", query.lower())
        keywords = [word for word in words if word not in stop_words and len(word) > 2]

        return keywords[:10]  # Limit to top 10 keywords

    def _extract_entities(self, query: str) -> list[str]:
        """Extract named entities from query."""
        entities = []

        # Extract file extensions
        file_extensions = re.findall(r"\b\w+\.\w+\b", query)
        entities.extend(file_extensions)

        # Extract potential function/class names (CamelCase or snake_case)
        code_entities = re.findall(r"\b[A-Z][a-zA-Z0-9]*\b|\b[a-z_][a-z0-9_]*\b", query)
        entities.extend([e for e in code_entities if len(e) > 3])

        # Extract quoted strings
        quoted_strings = re.findall(r'"([^"]*)"', query)
        entities.extend(quoted_strings)

        return entities[:5]  # Limit to top 5 entities

    async def _preprocess_query(self, query: str, intent: QueryIntent) -> str:
        """Preprocess and expand query based on intent."""
        enhanced_query = query

        # Apply intent-specific enhancements
        if intent.intent_type == "code_search":
            enhanced_query = await self._enhance_code_search_query(query, intent)
        elif intent.intent_type == "documentation":
            enhanced_query = await self._enhance_documentation_query(query, intent)
        elif intent.intent_type == "troubleshooting":
            enhanced_query = await self._enhance_troubleshooting_query(query, intent)
        elif intent.intent_type == "concept_explanation":
            enhanced_query = await self._enhance_concept_query(query, intent)

        # Apply general enhancements
        enhanced_query = await self._apply_general_enhancements(enhanced_query, intent)

        return enhanced_query

    async def _enhance_code_search_query(self, query: str, intent: QueryIntent) -> str:
        """Enhance code search queries."""
        enhanced_parts = [query]

        # Add related terms for code search
        code_terms = ["implementation", "source code", "function", "class"]
        for term in code_terms:
            if term not in query.lower():
                enhanced_parts.append(term)

        # Add file type hints if not present
        if not re.search(r"\.\w+", query):
            enhanced_parts.append("python javascript typescript")

        return " ".join(enhanced_parts)

    async def _enhance_documentation_query(
        self, query: str, intent: QueryIntent,
    ) -> str:
        """Enhance documentation search queries."""
        enhanced_parts = [query]

        # Add documentation-related terms
        doc_terms = ["documentation", "guide", "tutorial", "example"]
        for term in doc_terms:
            if term not in query.lower():
                enhanced_parts.append(term)

        return " ".join(enhanced_parts)

    async def _enhance_troubleshooting_query(
        self, query: str, intent: QueryIntent,
    ) -> str:
        """Enhance troubleshooting queries."""
        enhanced_parts = [query]

        # Add troubleshooting-related terms
        trouble_terms = ["error", "fix", "solution", "debug", "issue"]
        for term in trouble_terms:
            if term not in query.lower():
                enhanced_parts.append(term)

        return " ".join(enhanced_parts)

    async def _enhance_concept_query(self, query: str, intent: QueryIntent) -> str:
        """Enhance concept explanation queries."""
        enhanced_parts = [query]

        # Add explanation-related terms
        concept_terms = ["explanation", "definition", "overview", "concept"]
        for term in concept_terms:
            if term not in query.lower():
                enhanced_parts.append(term)

        return " ".join(enhanced_parts)

    async def _apply_general_enhancements(self, query: str, intent: QueryIntent) -> str:
        """Apply general query enhancements."""
        enhanced_query = query

        # Add synonyms for important keywords
        synonyms = {
            "api": ["interface", "endpoint", "service"],
            "function": ["method", "procedure", "routine"],
            "class": ["object", "type", "structure"],
            "error": ["exception", "bug", "issue", "problem"],
            "config": ["configuration", "settings", "options"],
        }

        for keyword, synonym_list in synonyms.items():
            if keyword in query.lower():
                # Add one synonym if not already present
                for synonym in synonym_list:
                    if synonym not in query.lower():
                        enhanced_query += f" {synonym}"
                        break

        return enhanced_query

    async def rerank_results(
        self,
        results: list[dict[str, Any]],
        query: str,
        intent: QueryIntent,
        context: SearchContext | None = None,
    ) -> list[EnhancedSearchResult]:
        """Rerank search results using advanced algorithms.

        Args:
            results: Original search results
            query: Search query
            intent: Detected query intent
            context: Optional search context

        Returns:
            List of enhanced and reranked results

        """
        try:
            enhanced_results = []

            for i, result in enumerate(results):
                enhanced_result = await self._enhance_single_result(
                    result, query, intent, context, i,
                )
                enhanced_results.append(enhanced_result)

            # Sort by enhanced score
            enhanced_results.sort(key=lambda x: x.enhanced_score, reverse=True)

            logger.info(f"Reranked {len(results)} results with enhanced scoring")

            return enhanced_results

        except Exception as e:
            logger.error(f"Result reranking failed: {e}")
            # Return original results with minimal enhancement
            return [
                EnhancedSearchResult(
                    original_hit=result,
                    enhanced_score=result.get("score", 0.0),
                    relevance_factors={},
                    semantic_tags=[],
                    context_matches=[],
                    rerank_reason="fallback",
                )
                for result in results
            ]

    async def _enhance_single_result(
        self,
        result: dict[str, Any],
        query: str,
        intent: QueryIntent,
        context: SearchContext | None,
        original_rank: int,
    ) -> EnhancedSearchResult:
        """Enhance a single search result with additional scoring factors."""
        base_score = result.get("score", 0.0)
        relevance_factors = {}
        semantic_tags = []
        context_matches = []

        # Calculate content quality factor
        content_quality = await self._calculate_content_quality(result)
        relevance_factors["content_quality"] = content_quality

        # Calculate intent alignment factor
        intent_alignment = await self._calculate_intent_alignment(result, intent)
        relevance_factors["intent_alignment"] = intent_alignment

        # Calculate recency factor
        recency_factor = await self._calculate_recency_factor(result)
        relevance_factors["recency"] = recency_factor

        # Calculate context relevance factor
        if context:
            context_relevance = await self._calculate_context_relevance(result, context)
            relevance_factors["context_relevance"] = context_relevance
            context_matches.extend(context_relevance.get("matches", []))

        # Calculate semantic similarity enhancement
        semantic_enhancement = await self._calculate_semantic_enhancement(result, query)
        relevance_factors["semantic_enhancement"] = semantic_enhancement

        # Generate semantic tags
        semantic_tags = await self._generate_semantic_tags(result, intent)

        # Calculate enhanced score
        enhanced_score = await self._calculate_enhanced_score(
            base_score, relevance_factors, original_rank,
        )

        # Determine rerank reason
        rerank_reason = self._determine_rerank_reason(relevance_factors)

        return EnhancedSearchResult(
            original_hit=result,
            enhanced_score=enhanced_score,
            relevance_factors=relevance_factors,
            semantic_tags=semantic_tags,
            context_matches=context_matches,
            rerank_reason=rerank_reason,
        )

    async def _calculate_content_quality(self, result: dict[str, Any]) -> float:
        """Calculate content quality score for a result."""
        quality_score = 0.5  # Base score

        # Check for content length (not too short, not too long)
        content = result.get("chunk_text", "") or result.get("file_content", "")
        if content:
            content_length = len(content)
            if 100 <= content_length <= 2000:
                quality_score += 0.2
            elif content_length > 2000:
                quality_score += 0.1

        # Check for code blocks (higher quality for code search)
        if "```" in content or "def " in content or "class " in content:
            quality_score += 0.1

        # Check for structured content (headers, lists, etc.)
        if any(marker in content for marker in ["#", "-", "*", "1.", "2."]):
            quality_score += 0.1

        # Check for examples or documentation
        if any(word in content.lower() for word in ["example", "usage", "note", "tip"]):
            quality_score += 0.1

        return min(quality_score, 1.0)

    async def _calculate_intent_alignment(
        self, result: dict[str, Any], intent: QueryIntent,
    ) -> float:
        """Calculate how well a result aligns with the detected intent."""
        alignment_score = 0.5  # Base score

        content = result.get("chunk_text", "") or result.get("file_content", "")
        if not content:
            return alignment_score

        content_lower = content.lower()

        # Intent-specific alignment
        if intent.intent_type == "code_search":
            if any(
                pattern in content_lower
                for pattern in ["def ", "class ", "function", "import"]
            ):
                alignment_score += 0.3
            if any(ext in content_lower for ext in [".py", ".js", ".ts", ".java"]):
                alignment_score += 0.2

        elif intent.intent_type == "documentation":
            if any(
                word in content_lower
                for word in ["guide", "tutorial", "documentation", "example"]
            ):
                alignment_score += 0.3
            if any(marker in content for marker in ["#", "##", "###"]):
                alignment_score += 0.2

        elif intent.intent_type == "troubleshooting":
            if any(
                word in content_lower
                for word in ["error", "fix", "solution", "debug", "issue"]
            ):
                alignment_score += 0.3
            if any(
                word in content_lower for word in ["problem", "troubleshoot", "resolve"]
            ):
                alignment_score += 0.2

        elif intent.intent_type == "concept_explanation":
            if any(
                word in content_lower
                for word in ["definition", "explanation", "overview", "concept"]
            ):
                alignment_score += 0.3
            if any(word in content_lower for word in ["what is", "meaning", "purpose"]):
                alignment_score += 0.2

        # Keyword alignment
        keyword_matches = sum(
            1 for keyword in intent.keywords if keyword in content_lower
        )
        if intent.keywords:
            alignment_score += (keyword_matches / len(intent.keywords)) * 0.2

        return min(alignment_score, 1.0)

    async def _calculate_recency_factor(self, result: dict[str, Any]) -> float:
        """Calculate recency factor for a result."""
        # This would typically use file modification time or creation date
        # For now, return a neutral score
        return 0.5

    async def _calculate_context_relevance(
        self, result: dict[str, Any], context: SearchContext,
    ) -> dict[str, Any]:
        """Calculate context relevance for a result."""
        relevance_score = 0.0
        matches = []

        content = result.get("chunk_text", "") or result.get("file_content", "")
        if not content:
            return {"score": 0.0, "matches": []}

        content_lower = content.lower()

        # Check against recent queries
        for recent_query in context.recent_queries[-5:]:  # Last 5 queries
            if recent_query.lower() in content_lower:
                relevance_score += 0.1
                matches.append(f"matches_recent_query: {recent_query}")

        # Check against user history
        for historical_query in context.user_history[
            -10:
        ]:  # Last 10 historical queries
            if historical_query.lower() in content_lower:
                relevance_score += 0.05
                matches.append(f"matches_history: {historical_query}")

        return {"score": min(relevance_score, 1.0), "matches": matches}

    async def _calculate_semantic_enhancement(
        self, result: dict[str, Any], query: str,
    ) -> float:
        """Calculate semantic enhancement factor."""
        # This would typically use more sophisticated semantic analysis
        # For now, use simple keyword matching with weights
        enhancement_score = 0.0

        content = result.get("chunk_text", "") or result.get("file_content", "")
        if not content:
            return enhancement_score

        query_words = set(query.lower().split())
        content_words = set(content.lower().split())

        # Calculate word overlap
        overlap = len(query_words.intersection(content_words))
        if query_words:
            enhancement_score = overlap / len(query_words)

        return min(enhancement_score, 1.0)

    async def _generate_semantic_tags(
        self, result: dict[str, Any], intent: QueryIntent,
    ) -> list[str]:
        """Generate semantic tags for a result."""
        tags = []

        content = result.get("chunk_text", "") or result.get("file_content", "")
        if not content:
            return tags

        # Add intent-based tags
        tags.append(f"intent:{intent.intent_type}")

        # Add content type tags
        if "def " in content or "class " in content:
            tags.append("content_type:code")
        elif "#" in content:
            tags.append("content_type:documentation")
        elif "error" in content.lower():
            tags.append("content_type:troubleshooting")

        # Add modality tags
        if result.get("image_path"):
            tags.append("modality:image")
        elif result.get("file_path"):
            if result["file_path"].endswith((".py", ".js", ".ts")):
                tags.append("modality:code")
            else:
                tags.append("modality:text")

        return tags

    async def _calculate_enhanced_score(
        self, base_score: float, relevance_factors: dict[str, float], original_rank: int,
    ) -> float:
        """Calculate enhanced score using multiple factors."""
        # Weighted combination of factors
        weights = self.semantic_enhancements["context_weights"]

        enhanced_score = base_score * 0.4  # Base score weight

        # Add relevance factors
        for factor, score in relevance_factors.items():
            weight = weights.get(factor, 0.1)
            enhanced_score += score * weight

        # Apply rank penalty (lower rank = lower score)
        rank_penalty = original_rank * 0.01
        enhanced_score = max(0.0, enhanced_score - rank_penalty)

        return min(enhanced_score, 1.0)

    def _determine_rerank_reason(self, relevance_factors: dict[str, float]) -> str:
        """Determine the primary reason for reranking."""
        if not relevance_factors:
            return "no_enhancement"

        # Find the factor with the highest impact
        max_factor = max(relevance_factors.items(), key=lambda x: x[1])
        factor_name, score = max_factor

        if score > 0.7:
            return f"high_{factor_name}"
        if score > 0.5:
            return f"medium_{factor_name}"
        return f"low_{factor_name}"

    async def get_search_analytics(self) -> dict[str, Any]:
        """Get search analytics and insights."""
        if not self.query_history:
            return {"message": "No search data available"}

        # Analyze query patterns
        intent_counts = defaultdict(int)
        query_lengths = []
        enhancement_rates = []

        for entry in self.query_history:
            intent_counts[entry.get("intent", "unknown")] += 1
            query_lengths.append(len(entry["query"]))
            enhancement_rates.append(entry["enhanced_query"] != entry["query"])

        # Calculate statistics
        total_queries = len(self.query_history)
        avg_query_length = (
            sum(query_lengths) / len(query_lengths) if query_lengths else 0
        )
        enhancement_rate = (
            sum(enhancement_rates) / len(enhancement_rates) if enhancement_rates else 0
        )

        return {
            "total_queries": total_queries,
            "intent_distribution": dict(intent_counts),
            "average_query_length": avg_query_length,
            "enhancement_rate": enhancement_rate,
            "most_common_intent": (
                max(intent_counts.items(), key=lambda x: x[1])[0]
                if intent_counts
                else "unknown"
            ),
            "analytics_timestamp": time.time(),
        }

    async def optimize_search_parameters(
        self, query: str, intent: QueryIntent, context: SearchContext | None = None,
    ) -> dict[str, Any]:
        """Optimize search parameters based on query analysis."""
        optimized_params = {
            "top_k": 20,  # Default
            "similarity_threshold": 0.0,  # Default
            "enable_reranking": True,
            "modality_weights": {},
        }

        # Adjust parameters based on intent
        if intent.intent_type == "code_search":
            optimized_params["top_k"] = 15  # Fewer, more focused results
            optimized_params["similarity_threshold"] = 0.3  # Higher threshold
            optimized_params["modality_weights"] = {"code": 1.0, "text": 0.7}

        elif intent.intent_type == "documentation":
            optimized_params["top_k"] = 25  # More results for comprehensive docs
            optimized_params["similarity_threshold"] = 0.1  # Lower threshold
            optimized_params["modality_weights"] = {"text": 1.0, "code": 0.8}

        elif intent.intent_type == "troubleshooting":
            optimized_params["top_k"] = 10  # Focused on solutions
            optimized_params["similarity_threshold"] = 0.4  # High relevance needed
            optimized_params["modality_weights"] = {"text": 1.0, "code": 0.9}

        # Adjust based on query complexity
        query_complexity = len(intent.keywords) + len(intent.entities)
        if query_complexity > 5:
            optimized_params["top_k"] = min(optimized_params["top_k"] + 5, 30)

        # Adjust based on context
        if context and context.recent_queries:
            # If user has been searching for similar things, be more specific
            optimized_params["similarity_threshold"] += 0.1

        return optimized_params


# Global semantic search enhancer instance
_semantic_enhancer: SemanticSearchEnhancer | None = None


def get_semantic_enhancer() -> SemanticSearchEnhancer:
    """Get the global semantic search enhancer instance."""
    global _semantic_enhancer
    if _semantic_enhancer is None:
        _semantic_enhancer = SemanticSearchEnhancer()
    return _semantic_enhancer
