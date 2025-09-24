"""PHOENIX Specialization Accuracy Analyzer

Advanced specialization accuracy detection and analysis module for the PHOENIX knowledge distillation system.
Implements role-specific knowledge extraction and specialization scoring algorithms.

Author: Vulpine (Fox Specialist)
Version: 1.0.0
"""

import logging
import re
from typing import Any

from ..utils.data_structures import (
    AgentState,
)


class SpecializationAccuracyAnalyzer:
    """Specialization accuracy analysis system for PHOENIX framework.

    Implements:
    - Role-specific knowledge detection
    - Specialization accuracy scoring
    - Spirit-based specialization analysis
    - Cross-role knowledge transfer assessment
    """

    def __init__(self):
        """Initialize the specialization accuracy analyzer."""
        self.logger = logging.getLogger(__name__)

        # Specialization patterns by spirit type
        self.spirit_specializations = self._initialize_spirit_specializations()

        # Specialization scoring weights
        self.specialization_weights = {
            "role_alignment": 0.3,
            "expertise_depth": 0.25,
            "behavioral_consistency": 0.25,
            "knowledge_application": 0.2,
        }

        self.logger.info("🎭 Specialization accuracy analyzer initialized")

    def _initialize_spirit_specializations(self) -> dict[str, dict[str, Any]]:
        """Initialize spirit-specific specialization patterns."""
        return {
            "fox": {
                "primary_specializations": [
                    "strategic_planning",
                    "problem_solving",
                    "adaptability",
                ],
                "role_patterns": {
                    "strategic_planning": [
                        r"\b(strategy|strategic|planning|roadmap|vision)\b",
                        r"\b(long-term|future|goals|objectives|milestones)\b",
                        r"\b(analyze|evaluate|assess|consider|weigh)\b",
                    ],
                    "problem_solving": [
                        r"\b(solve|resolve|fix|address|tackle)\b",
                        r"\b(solution|approach|method|strategy)\b",
                        r"\b(debug|troubleshoot|diagnose|investigate)\b",
                    ],
                    "adaptability": [
                        r"\b(adapt|adjust|modify|change|flexible)\b",
                        r"\b(versatile|dynamic|responsive|agile)\b",
                        r"\b(evolve|transform|shift|pivot)\b",
                    ],
                },
                "behavioral_indicators": [
                    r"\b(cunning|clever|strategic|tactical)\b",
                    r"\b(analyze|evaluate|consider|weigh)\b",
                    r"\b(approach|method|strategy|tactic)\b",
                ],
                "knowledge_domains": [
                    "strategy",
                    "analysis",
                    "planning",
                    "optimization",
                ],
            },
            "wolf": {
                "primary_specializations": [
                    "leadership",
                    "team_coordination",
                    "protection",
                ],
                "role_patterns": {
                    "leadership": [
                        r"\b(lead|guide|direct|manage|coordinate)\b",
                        r"\b(command|authority|influence|inspire|motivate)\b",
                        r"\b(mentor|coach|teach|guide|develop)\b",
                    ],
                    "team_coordination": [
                        r"\b(team|group|collaborate|coordinate|organize)\b",
                        r"\b(work together|cooperation|partnership|alliance)\b",
                        r"\b(delegate|assign|distribute|allocate)\b",
                    ],
                    "protection": [
                        r"\b(protect|guard|defend|secure|safeguard)\b",
                        r"\b(security|safety|reliability|stability)\b",
                        r"\b(monitor|watch|oversee|supervise)\b",
                    ],
                },
                "behavioral_indicators": [
                    r"\b(pack|team|group|collective)\b",
                    r"\b(protect|guard|defend|secure)\b",
                    r"\b(lead|guide|direct|command)\b",
                ],
                "knowledge_domains": [
                    "leadership",
                    "teamwork",
                    "security",
                    "management",
                ],
            },
            "otter": {
                "primary_specializations": [
                    "testing",
                    "quality_assurance",
                    "playful_innovation",
                ],
                "role_patterns": {
                    "testing": [
                        r"\b(test|testing|validate|verify|check)\b",
                        r"\b(quality|assurance|QA|validation)\b",
                        r"\b(debug|troubleshoot|fix|resolve)\b",
                    ],
                    "quality_assurance": [
                        r"\b(quality|standards|best practices|excellence)\b",
                        r"\b(review|inspect|audit|evaluate)\b",
                        r"\b(improve|enhance|optimize|refine)\b",
                    ],
                    "playful_innovation": [
                        r"\b(creative|innovative|fun|playful|experimental)\b",
                        r"\b(explore|discover|experiment|try)\b",
                        r"\b(imagine|design|create|invent)\b",
                    ],
                },
                "behavioral_indicators": [
                    r"\b(playful|fun|creative|experimental)\b",
                    r"\b(test|validate|check|verify)\b",
                    r"\b(explore|discover|experiment)\b",
                ],
                "knowledge_domains": ["testing", "quality", "innovation", "creativity"],
            },
            "lion": {
                "primary_specializations": [
                    "leadership",
                    "authority",
                    "strategic_vision",
                ],
                "role_patterns": {
                    "leadership": [
                        r"\b(lead|command|direct|govern|rule)\b",
                        r"\b(authority|power|influence|dominance)\b",
                        r"\b(inspire|motivate|guide|mentor)\b",
                    ],
                    "authority": [
                        r"\b(authority|power|control|command|dominance)\b",
                        r"\b(responsibility|accountability|oversight)\b",
                        r"\b(decision|choice|judgment|determination)\b",
                    ],
                    "strategic_vision": [
                        r"\b(vision|mission|purpose|direction)\b",
                        r"\b(strategic|long-term|future|goals)\b",
                        r"\b(inspire|motivate|guide|lead)\b",
                    ],
                },
                "behavioral_indicators": [
                    r"\b(confident|bold|decisive|authoritative)\b",
                    r"\b(lead|command|direct|govern)\b",
                    r"\b(inspire|motivate|guide|mentor)\b",
                ],
                "knowledge_domains": ["leadership", "strategy", "management", "vision"],
            },
            "eagle": {
                "primary_specializations": [
                    "vision",
                    "analysis",
                    "strategic_oversight",
                ],
                "role_patterns": {
                    "vision": [
                        r"\b(vision|overview|perspective|insight)\b",
                        r"\b(see|observe|monitor|watch)\b",
                        r"\b(analyze|examine|study|investigate)\b",
                    ],
                    "analysis": [
                        r"\b(analyze|examine|evaluate|assess)\b",
                        r"\b(insight|understanding|comprehension)\b",
                        r"\b(pattern|trend|correlation|relationship)\b",
                    ],
                    "strategic_oversight": [
                        r"\b(oversee|supervise|monitor|watch)\b",
                        r"\b(strategic|high-level|executive|management)\b",
                        r"\b(guidance|direction|leadership|vision)\b",
                    ],
                },
                "behavioral_indicators": [
                    r"\b(soar|fly|high|elevated)\b",
                    r"\b(see|observe|monitor|watch)\b",
                    r"\b(analyze|examine|study|investigate)\b",
                ],
                "knowledge_domains": ["analysis", "strategy", "oversight", "vision"],
            },
        }

    def analyze_specialization_accuracy(
        self, agent_output: str, agent_state: AgentState,
    ) -> dict[str, Any]:
        """Analyze specialization accuracy for an agent.

        Args:
            agent_output: The agent's output text
            agent_state: Current agent state for context

        Returns:
            Dictionary of specialization accuracy analysis results

        """
        self.logger.debug(
            f"Analyzing specialization accuracy for {agent_state.spirit} agent",
        )

        spirit = agent_state.spirit.lower()
        if spirit not in self.spirit_specializations:
            self.logger.warning(f"Unknown spirit type: {spirit}")
            return {"error": f"Unknown spirit type: {spirit}"}

        spirit_spec = self.spirit_specializations[spirit]

        # Analyze role alignment
        role_alignment = self._analyze_role_alignment(agent_output, spirit_spec)

        # Analyze expertise depth
        expertise_depth = self._analyze_expertise_depth(agent_output, spirit_spec)

        # Analyze behavioral consistency
        behavioral_consistency = self._analyze_behavioral_consistency(
            agent_output, spirit_spec,
        )

        # Analyze knowledge application
        knowledge_application = self._analyze_knowledge_application(
            agent_output, spirit_spec,
        )

        # Calculate overall specialization accuracy
        overall_accuracy = (
            role_alignment * self.specialization_weights["role_alignment"]
            + expertise_depth * self.specialization_weights["expertise_depth"]
            + behavioral_consistency
            * self.specialization_weights["behavioral_consistency"]
            + knowledge_application
            * self.specialization_weights["knowledge_application"]
        )

        return {
            "spirit_type": spirit,
            "overall_accuracy": overall_accuracy,
            "role_alignment": role_alignment,
            "expertise_depth": expertise_depth,
            "behavioral_consistency": behavioral_consistency,
            "knowledge_application": knowledge_application,
            "primary_specializations": spirit_spec["primary_specializations"],
            "specialization_scores": self._calculate_specialization_scores(
                agent_output, spirit_spec,
            ),
            "behavioral_indicators": self._extract_behavioral_indicators(
                agent_output, spirit_spec,
            ),
            "knowledge_domain_coverage": self._analyze_knowledge_domain_coverage(
                agent_output, spirit_spec,
            ),
        }

    def _analyze_role_alignment(self, text: str, spirit_spec: dict[str, Any]) -> float:
        """Analyze alignment with expected role patterns."""
        total_score = 0.0
        total_specializations = len(spirit_spec["primary_specializations"])

        for specialization in spirit_spec["primary_specializations"]:
            if specialization in spirit_spec["role_patterns"]:
                patterns = spirit_spec["role_patterns"][specialization]
                specialization_score = self._analyze_pattern_matches(text, patterns)
                total_score += specialization_score

        return total_score / total_specializations if total_specializations > 0 else 0.0

    def _analyze_expertise_depth(self, text: str, spirit_spec: dict[str, Any]) -> float:
        """Analyze depth of expertise in specializations."""
        expertise_scores = []

        for specialization in spirit_spec["primary_specializations"]:
            if specialization in spirit_spec["role_patterns"]:
                patterns = spirit_spec["role_patterns"][specialization]

                # Calculate expertise depth based on pattern complexity and frequency
                pattern_matches = 0
                for pattern in patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    pattern_matches += len(matches)

                # Normalize by pattern count
                expertise_score = pattern_matches / len(patterns) if patterns else 0.0
                expertise_scores.append(expertise_score)

        return (
            sum(expertise_scores) / len(expertise_scores) if expertise_scores else 0.0
        )

    def _analyze_behavioral_consistency(
        self, text: str, spirit_spec: dict[str, Any],
    ) -> float:
        """Analyze consistency with expected behavioral patterns."""
        behavioral_patterns = spirit_spec["behavioral_indicators"]
        return self._analyze_pattern_matches(text, behavioral_patterns)

    def _analyze_knowledge_application(
        self, text: str, spirit_spec: dict[str, Any],
    ) -> float:
        """Analyze application of knowledge in relevant domains."""
        knowledge_domains = spirit_spec["knowledge_domains"]
        domain_scores = []

        for domain in knowledge_domains:
            # Look for domain-specific terminology and concepts
            domain_patterns = [rf"\b{domain}\b", rf"\b{domain}.*\b", rf"\b.*{domain}\b"]
            domain_score = self._analyze_pattern_matches(text, domain_patterns)
            domain_scores.append(domain_score)

        return sum(domain_scores) / len(domain_scores) if domain_scores else 0.0

    def _analyze_pattern_matches(self, text: str, patterns: list[str]) -> float:
        """Analyze pattern matches in text."""
        matches = 0
        total_patterns = len(patterns)

        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                matches += 1

        return matches / total_patterns if total_patterns > 0 else 0.0

    def _calculate_specialization_scores(
        self, text: str, spirit_spec: dict[str, Any],
    ) -> dict[str, float]:
        """Calculate individual specialization scores."""
        specialization_scores = {}

        for specialization in spirit_spec["primary_specializations"]:
            if specialization in spirit_spec["role_patterns"]:
                patterns = spirit_spec["role_patterns"][specialization]
                score = self._analyze_pattern_matches(text, patterns)
                specialization_scores[specialization] = score

        return specialization_scores

    def _extract_behavioral_indicators(
        self, text: str, spirit_spec: dict[str, Any],
    ) -> list[str]:
        """Extract specific behavioral indicators from text."""
        indicators = []
        behavioral_patterns = spirit_spec["behavioral_indicators"]

        for pattern in behavioral_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            indicators.extend(matches[:2])  # Limit to 2 examples per pattern

        return indicators[:5]  # Limit to 5 total indicators

    def _analyze_knowledge_domain_coverage(
        self, text: str, spirit_spec: dict[str, Any],
    ) -> dict[str, float]:
        """Analyze coverage of knowledge domains."""
        domain_coverage = {}
        knowledge_domains = spirit_spec["knowledge_domains"]

        for domain in knowledge_domains:
            # Look for domain-specific content
            domain_patterns = [rf"\b{domain}\b", rf"\b{domain}.*\b", rf"\b.*{domain}\b"]
            coverage_score = self._analyze_pattern_matches(text, domain_patterns)
            domain_coverage[domain] = coverage_score

        return domain_coverage

    def calculate_cross_specialization_transfer(
        self, specialization_results: list[dict[str, Any]],
    ) -> dict[str, float]:
        """Calculate potential for cross-specialization knowledge transfer."""
        if len(specialization_results) < 2:
            return {}

        transfer_potential = {}

        for i, result1 in enumerate(specialization_results):
            for result2 in specialization_results[i + 1 :]:
                spirit1 = result1["spirit_type"]
                spirit2 = result2["spirit_type"]
                transfer_key = f"{spirit1}_to_{spirit2}"

                # Calculate transfer potential based on specialization accuracy and compatibility
                accuracy1 = result1["overall_accuracy"]
                accuracy2 = result2["overall_accuracy"]

                # Transfer potential is higher when both agents have good specialization accuracy
                transfer_score = (accuracy1 * accuracy2) * 0.8

                # Boost for complementary specializations
                if self._are_complementary_specializations(spirit1, spirit2):
                    transfer_score *= 1.3

                transfer_potential[transfer_key] = min(1.0, transfer_score)

        return transfer_potential

    def _are_complementary_specializations(self, spirit1: str, spirit2: str) -> bool:
        """Check if two spirit specializations are complementary."""
        complementary_pairs = [
            ("fox", "wolf"),  # Strategic planning + Leadership
            ("fox", "eagle"),  # Strategic planning + Vision
            ("wolf", "lion"),  # Team coordination + Authority
            ("otter", "fox"),  # Testing + Problem solving
            ("eagle", "lion"),  # Analysis + Leadership
        ]

        for pair in complementary_pairs:
            if (spirit1 == pair[0] and spirit2 == pair[1]) or (
                spirit1 == pair[1] and spirit2 == pair[0]
            ):
                return True

        return False

    def validate_specialization_consistency(
        self, specialization_results: list[dict[str, Any]],
    ) -> float:
        """Validate consistency of specialization results across agents."""
        if len(specialization_results) < 2:
            return 1.0

        # Calculate consistency based on specialization accuracy variance
        accuracies = [result["overall_accuracy"] for result in specialization_results]
        mean_accuracy = sum(accuracies) / len(accuracies)

        # Calculate variance
        variance = sum((acc - mean_accuracy) ** 2 for acc in accuracies) / len(
            accuracies,
        )

        # Convert variance to consistency score (lower variance = higher consistency)
        consistency_score = max(0.0, 1.0 - variance)

        return consistency_score
