#!/usr/bin/env python3
"""Prompt Refinement Service

Main orchestration service that coordinates all refinement components.
Replaces the pseudo-code functions from the guide with actual implementations.

🦊 Fox approach: Strategic coordination with elegant service composition
"""

import asyncio
import logging
from dataclasses import dataclass
from typing import Any

from .code_analysis import CodeAnalysisService
from .nlp_processing import NLPProcessingService
from .semantic_search import SemanticSearchService
from .web_scraping import WebScrapingService

logger = logging.getLogger(__name__)


@dataclass
class RefinementResult:
    """Result of prompt refinement process."""

    original_query: str
    refined_query: str
    research_findings: dict[str, Any]
    analysis_results: dict[str, Any]
    improvement_score: float
    refinement_rationale: list[str]
    processing_time: float


class PromptRefinementService:
    """Main prompt refinement service that orchestrates all components.

    This service replaces the pseudo-code functions from the guide with
    actual working implementations using modern Python libraries.
    """

    def __init__(self, config: dict[str, Any] | None = None):
        """Initialize the prompt refinement service."""
        self.config = config or {}

        # Initialize component services
        self.web_scraping = WebScrapingService(self.config.get("web_scraping", {}))
        self.semantic_search = SemanticSearchService(
            self.config.get("semantic_search", {}),
        )
        self.nlp_processing = NLPProcessingService(
            self.config.get("nlp_processing", {}),
        )
        self.code_analysis = CodeAnalysisService(self.config.get("code_analysis", {}))

        # Initialize services
        self._initialized = False

    async def initialize(self) -> bool:
        """Initialize all component services."""
        try:
            await asyncio.gather(
                self.web_scraping.initialize(),
                self.semantic_search.initialize(),
                self.nlp_processing.initialize(),
                self.code_analysis.initialize(),
            )
            self._initialized = True
            logger.info("Prompt refinement service initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize prompt refinement service: {e}")
            return False

    async def refine_query(self, original_query: str) -> RefinementResult:
        """Refine a query using comprehensive analysis and research.

        This is the main entry point that replaces the pseudo-code workflow
        from the guide with actual implementations.
        """
        if not self._initialized:
            await self.initialize()

        start_time = asyncio.get_event_loop().time()

        try:
            # Phase 1: Research and Context Gathering
            research_findings = await self._conduct_research(original_query)

            # Phase 2: Query Analysis
            analysis_results = await self._analyze_query(
                original_query,
                research_findings,
            )

            # Phase 3: Refinement
            refined_query, rationale = await self._refine_query(
                original_query,
                research_findings,
                analysis_results,
            )

            # Calculate improvement score
            improvement_score = self._calculate_improvement_score(
                original_query,
                refined_query,
                analysis_results,
            )

            processing_time = asyncio.get_event_loop().time() - start_time

            return RefinementResult(
                original_query=original_query,
                refined_query=refined_query,
                research_findings=research_findings,
                analysis_results=analysis_results,
                improvement_score=improvement_score,
                refinement_rationale=rationale,
                processing_time=processing_time,
            )

        except Exception as e:
            logger.error(f"Query refinement failed: {e}")
            raise

    async def _conduct_research(self, query: str) -> dict[str, Any]:
        """Conduct comprehensive research on the query subject.

        Replaces the pseudo-code conduct_subject_research() function.
        """
        logger.info(f"Conducting research for query: {query}")

        # Extract key concepts
        key_concepts = await self.nlp_processing.extract_key_concepts(query)

        # Conduct web research
        web_research = await self.web_scraping.research_query_topic_enhanced(
            query,
            key_concepts,
        )

        # Conduct semantic research
        semantic_research = await self.semantic_search.research_related_concepts(
            query,
            key_concepts,
        )

        return {
            "key_concepts": key_concepts,
            "web_research": web_research,
            "semantic_research": semantic_research,
            "related_topics": self._identify_related_topics(
                web_research,
                semantic_research,
            ),
            "authoritative_sources": self._gather_authoritative_sources(web_research),
            "current_trends": self._analyze_current_trends(web_research),
        }

    async def _analyze_query(
        self,
        query: str,
        research_findings: dict[str, Any],
    ) -> dict[str, Any]:
        """Analyze the query comprehensively.

        Replaces the pseudo-code analyze_query_comprehensively() function.
        """
        logger.info(f"Analyzing query: {query}")

        # Clarity assessment
        clarity_issues = await self.nlp_processing.assess_clarity_issues(query)

        # Specificity evaluation
        specificity_gaps = await self.nlp_processing.evaluate_specificity_gaps(query)

        # Effectiveness prediction
        effectiveness_score = await self.nlp_processing.predict_effectiveness(query)

        # Ambiguity identification
        ambiguities = await self.nlp_processing.identify_ambiguities(query)

        # Context gaps analysis
        context_gaps = self._analyze_context_gaps(query, research_findings)

        # Codebase analysis (if relevant)
        codebase_analysis = None
        if self._is_codebase_relevant(query):
            codebase_analysis = await self.code_analysis.analyze_codebase_relevance(
                query,
                research_findings,
            )

        # Optimization opportunities
        optimization_opportunities = self._identify_optimization_opportunities(
            query,
            research_findings,
            codebase_analysis,
        )

        return {
            "clarity_issues": clarity_issues,
            "specificity_gaps": specificity_gaps,
            "effectiveness_score": effectiveness_score,
            "ambiguities": ambiguities,
            "context_gaps": context_gaps,
            "codebase_analysis": codebase_analysis,
            "optimization_opportunities": optimization_opportunities,
        }

    async def _refine_query(
        self,
        original_query: str,
        research_findings: dict[str, Any],
        analysis_results: dict[str, Any],
    ) -> tuple[str, list[str]]:
        """Refine the query based on research and analysis.

        Replaces the pseudo-code refinement functions with actual implementation.
        """
        logger.info(f"Refining query: {original_query}")

        rationale = []
        refined_query = original_query

        # Apply clarity enhancements
        if analysis_results["clarity_issues"]:
            refined_query, clarity_rationale = await self._apply_clarity_enhancements(
                refined_query,
                analysis_results["clarity_issues"],
            )
            rationale.extend(clarity_rationale)

        # Apply specificity improvements
        if analysis_results["specificity_gaps"]:
            refined_query, specificity_rationale = (
                await self._apply_specificity_improvements(
                    refined_query,
                    analysis_results["specificity_gaps"],
                )
            )
            rationale.extend(specificity_rationale)

        # Integrate research insights
        if research_findings["key_concepts"]:
            refined_query, research_rationale = await self._integrate_research_insights(
                refined_query,
                research_findings,
            )
            rationale.extend(research_rationale)

        # Apply codebase insights (if relevant)
        if analysis_results.get("codebase_analysis"):
            refined_query, codebase_rationale = await self._integrate_codebase_insights(
                refined_query,
                analysis_results["codebase_analysis"],
            )
            rationale.extend(codebase_rationale)

        return refined_query, rationale

    def _is_codebase_relevant(self, query: str) -> bool:
        """Determine if codebase analysis is relevant to the query."""
        code_indicators = [
            "code",
            "function",
            "class",
            "method",
            "variable",
            "import",
            "export",
            "component",
            "module",
            "package",
            "library",
            "framework",
            "API",
            "implementation",
            "refactor",
            "debug",
            "test",
            "build",
            "deploy",
            "repository",
            "git",
            "commit",
            "branch",
            "merge",
            "pull request",
            "syntax",
            "error",
            "bug",
            "feature",
            "development",
            "programming",
        ]

        query_lower = query.lower()
        return any(indicator in query_lower for indicator in code_indicators)

    def _identify_related_topics(
        self,
        web_research: dict[str, Any],
        semantic_research: dict[str, Any],
    ) -> list[str]:
        """Identify related topics from research results."""
        # Combine topics from web and semantic research
        topics = set()

        if "related_topics" in web_research:
            topics.update(web_research["related_topics"])

        if "related_concepts" in semantic_research:
            topics.update(semantic_research["related_concepts"])

        return list(topics)

    def _gather_authoritative_sources(self, web_research: dict[str, Any]) -> list[str]:
        """Gather authoritative sources from web research."""
        sources = []

        if "sources" in web_research:
            for source in web_research["sources"]:
                if source.get("authority_score", 0) > 0.7:
                    sources.append(source["url"])

        return sources

    def _analyze_current_trends(self, web_research: dict[str, Any]) -> list[str]:
        """Analyze current trends from web research."""
        trends = []

        if "trends" in web_research:
            trends.extend(web_research["trends"])

        return trends

    def _analyze_context_gaps(
        self,
        query: str,
        research_findings: dict[str, Any],
    ) -> list[str]:
        """Analyze context gaps in the query."""
        gaps = []

        # Check if query concepts are covered in research
        key_concepts = research_findings.get("key_concepts", [])
        research_concepts = set()

        for research_type in ["web_research", "semantic_research"]:
            if research_type in research_findings:
                research_concepts.update(
                    research_findings[research_type].get("concepts", []),
                )

        missing_concepts = set(key_concepts) - research_concepts
        if missing_concepts:
            gaps.append(f"Missing research for concepts: {', '.join(missing_concepts)}")

        return gaps

    def _identify_optimization_opportunities(
        self,
        query: str,
        research_findings: dict[str, Any],
        codebase_analysis: dict[str, Any] | None,
    ) -> list[str]:
        """Identify optimization opportunities."""
        opportunities = []

        # Check for clarity improvements
        if research_findings.get("clarity_issues"):
            opportunities.append(
                "Improve clarity by addressing vague terms and unclear references",
            )

        # Check for specificity improvements
        if research_findings.get("specificity_gaps"):
            opportunities.append("Add more specific details and context")

        # Check for research integration
        if research_findings.get("key_concepts"):
            opportunities.append("Integrate research findings into query structure")

        # Check for codebase integration
        if codebase_analysis:
            opportunities.append("Integrate codebase context and terminology")

        return opportunities

    async def _apply_clarity_enhancements(
        self,
        query: str,
        clarity_issues: list[str],
    ) -> tuple[str, list[str]]:
        """Apply clarity enhancements to the query."""
        rationale = []
        enhanced_query = query

        for issue in clarity_issues:
            if "vague terms" in issue:
                enhanced_query = await self.nlp_processing.replace_vague_terms(
                    enhanced_query,
                )
                rationale.append("Replaced vague terms with specific language")
            elif "unclear pronouns" in issue:
                enhanced_query = await self.nlp_processing.clarify_pronouns(
                    enhanced_query,
                )
                rationale.append("Clarified pronoun references")

        return enhanced_query, rationale

    async def _apply_specificity_improvements(
        self,
        query: str,
        specificity_gaps: list[str],
    ) -> tuple[str, list[str]]:
        """Apply specificity improvements to the query."""
        rationale = []
        improved_query = query

        for gap in specificity_gaps:
            if "missing details" in gap:
                improved_query = await self.nlp_processing.add_specific_details(
                    improved_query,
                )
                rationale.append("Added specific details and context")
            elif "missing question words" in gap:
                improved_query = await self.nlp_processing.add_question_words(
                    improved_query,
                )
                rationale.append("Added specific question words for clarity")

        return improved_query, rationale

    async def _integrate_research_insights(
        self,
        query: str,
        research_findings: dict[str, Any],
    ) -> tuple[str, list[str]]:
        """Integrate research insights into the query."""
        rationale = []
        integrated_query = query

        # Add relevant concepts from research
        key_concepts = research_findings.get("key_concepts", [])
        if key_concepts:
            integrated_query = await self.nlp_processing.integrate_concepts(
                integrated_query,
                key_concepts,
            )
            rationale.append(f"Integrated key concepts: {', '.join(key_concepts[:3])}")

        return integrated_query, rationale

    async def _integrate_codebase_insights(
        self,
        query: str,
        codebase_analysis: dict[str, Any],
    ) -> tuple[str, list[str]]:
        """Integrate codebase insights into the query."""
        rationale = []
        integrated_query = query

        # Add project-specific terminology
        if "terminology" in codebase_analysis:
            integrated_query = await self.nlp_processing.integrate_terminology(
                integrated_query,
                codebase_analysis["terminology"],
            )
            rationale.append("Integrated project-specific terminology")

        return integrated_query, rationale

    def _calculate_improvement_score(
        self,
        original_query: str,
        refined_query: str,
        analysis_results: dict[str, Any],
    ) -> float:
        """Calculate the improvement score for the refinement."""
        base_score = 0.5

        # Length improvement
        original_length = len(original_query.split())
        refined_length = len(refined_query.split())

        if refined_length > original_length * 1.2:
            base_score += 0.2  # More detailed
        elif refined_length < original_length * 0.8:
            base_score -= 0.1  # Too concise

        # Clarity improvement
        original_clarity_issues = len(analysis_results.get("clarity_issues", []))
        if original_clarity_issues > 0:
            base_score += 0.2  # Addressed clarity issues

        # Specificity improvement
        original_specificity_gaps = len(analysis_results.get("specificity_gaps", []))
        if original_specificity_gaps > 0:
            base_score += 0.2  # Addressed specificity gaps

        # Effectiveness improvement
        effectiveness_score = analysis_results.get("effectiveness_score", 0.5)
        base_score += (effectiveness_score - 0.5) * 0.3

        return max(0.0, min(1.0, base_score))
