"""
PHOENIX Improved Domain Expertise Analyzer

Enhanced domain expertise detection and analysis module addressing limitations in:
- Domain coverage expansion
- Text length normalization
- Expertise depth assessment
- Cross-domain knowledge transfer

Author: Vulpine (Fox Specialist)
Version: 2.0.0
"""

import re
import logging
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import json
from collections import defaultdict
import math

from ..utils.data_structures import (
    AgentState,
    AgentGeneticMaterial,
    StructuredKnowledge
)


class ImprovedDomainExpertiseAnalyzer:
    """
    Enhanced domain expertise analysis system addressing previous limitations.

    Improvements:
    - Expanded domain coverage (10+ domains)
    - Text length normalization
    - Sophisticated expertise depth assessment
    - Advanced cross-domain transfer analysis
    - Bias correction techniques
    """

    def __init__(self):
        """Initialize the improved domain expertise analyzer."""
        self.logger = logging.getLogger(__name__)

        # Enhanced domain patterns with expanded coverage
        self.domain_patterns = self._initialize_enhanced_domain_patterns()

        # Text normalization parameters
        self.normalization_params = {
            'min_length': 20,
            'max_length': 1000,
            'length_weight': 0.1,
            'complexity_weight': 0.3,
            'density_weight': 0.6
        }

        # Expertise scoring weights (improved)
        self.expertise_weights = {
            'terminology': 0.25,
            'concepts': 0.25,
            'methodology': 0.25,
            'context': 0.15,
            'depth': 0.10
        }

        self.logger.info("🎯 Improved domain expertise analyzer initialized")

    def _initialize_enhanced_domain_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize expanded domain-specific expertise patterns."""
        return {
            # Technical Domains
            "software_engineering": {
                "terminology": [
                    r"\b(algorithm|data structure|complexity|optimization|refactoring)\b",
                    r"\b(design pattern|architecture|framework|library|API|SDK)\b",
                    r"\b(debugging|testing|deployment|CI/CD|DevOps|containerization)\b",
                    r"\b(microservices|scalability|performance|security|maintainability)\b"
                ],
                "concepts": [
                    r"\b(OOP|functional programming|SOLID principles|DRY|KISS)\b",
                    r"\b(agile|scrum|kanban|TDD|BDD|continuous integration)\b",
                    r"\b(version control|git|repository|branch|merge|pull request)\b",
                    r"\b(clean code|code review|pair programming|technical debt)\b"
                ],
                "methodology": [
                    r"\b(test-driven development|behavior-driven development)\b",
                    r"\b(continuous integration|continuous deployment|blue-green)\b",
                    r"\b(code review|pair programming|mob programming)\b",
                    r"\b(iterative development|sprint planning|retrospective)\b"
                ],
                "context_indicators": ["code", "programming", "development", "software", "application", "system"],
                "expertise_levels": {
                    "beginner": ["basic", "simple", "fundamental", "introductory"],
                    "intermediate": ["advanced", "complex", "sophisticated", "professional"],
                    "expert": ["expert", "master", "specialist", "architect", "senior"]
                }
            },

            "machine_learning": {
                "terminology": [
                    r"\b(neural network|deep learning|reinforcement learning|supervised|unsupervised)\b",
                    r"\b(feature engineering|model training|hyperparameter|overfitting|underfitting)\b",
                    r"\b(cross-validation|regularization|ensemble|gradient descent|backpropagation)\b",
                    r"\b(CNN|RNN|LSTM|transformer|attention|BERT|GPT)\b"
                ],
                "concepts": [
                    r"\b(classification|regression|clustering|dimensionality reduction)\b",
                    r"\b(bias-variance tradeoff|overfitting|underfitting|generalization)\b",
                    r"\b(ROC|AUC|precision|recall|F1-score|confusion matrix)\b",
                    r"\b(transfer learning|fine-tuning|data augmentation|feature selection)\b"
                ],
                "methodology": [
                    r"\b(train|validation|test split|k-fold cross-validation)\b",
                    r"\b(feature selection|model selection|hyperparameter tuning)\b",
                    r"\b(grid search|random search|Bayesian optimization)\b",
                    r"\b(model evaluation|metrics|A/B testing|statistical significance)\b"
                ],
                "context_indicators": ["model", "training", "prediction", "algorithm", "data", "learning"],
                "expertise_levels": {
                    "beginner": ["basic", "simple", "linear", "introductory"],
                    "intermediate": ["advanced", "complex", "deep", "sophisticated"],
                    "expert": ["state-of-the-art", "cutting-edge", "research", "novel", "breakthrough"]
                }
            },

            "data_science": {
                "terminology": [
                    r"\b(statistical analysis|hypothesis testing|correlation|regression)\b",
                    r"\b(data visualization|EDA|exploratory data analysis|dashboard)\b",
                    r"\b(data cleaning|preprocessing|feature engineering|ETL)\b",
                    r"\b(anomaly detection|outlier|distribution|sampling)\b"
                ],
                "concepts": [
                    r"\b(central limit theorem|p-value|confidence interval|statistical power)\b",
                    r"\b(overfitting|bias|variance|cross-validation|bootstrap)\b",
                    r"\b(feature selection|dimensionality reduction|PCA|t-SNE)\b",
                    r"\b(ensemble methods|boosting|bagging|random forest)\b"
                ],
                "methodology": [
                    r"\b(CRISP-DM|data mining process|KDD|SEMMA)\b",
                    r"\b(statistical significance|A/B testing|experimental design)\b",
                    r"\b(data pipeline|ETL|data warehousing|data lake)\b",
                    r"\b(randomized controlled trial|quasi-experimental|observational)\b"
                ],
                "context_indicators": ["data", "analysis", "statistics", "insights", "patterns", "trends"],
                "expertise_levels": {
                    "beginner": ["basic", "simple", "descriptive", "introductory"],
                    "intermediate": ["advanced", "predictive", "diagnostic", "sophisticated"],
                    "expert": ["prescriptive", "causal", "experimental", "research", "cutting-edge"]
                }
            },

            # Business and Management Domains
            "business_strategy": {
                "terminology": [
                    r"\b(strategic planning|competitive advantage|market analysis|SWOT)\b",
                    r"\b(business model|value proposition|revenue stream|cost structure)\b",
                    r"\b(market segmentation|target market|customer persona|value chain)\b",
                    r"\b(competitive analysis|market positioning|brand strategy|pricing strategy)\b"
                ],
                "concepts": [
                    r"\b(Porter's five forces|blue ocean strategy|disruptive innovation)\b",
                    r"\b(lean startup|agile methodology|design thinking|customer development)\b",
                    r"\b(digital transformation|innovation management|change management)\b",
                    r"\b(stakeholder management|risk management|project management)\b"
                ],
                "methodology": [
                    r"\b(strategic planning process|business case development)\b",
                    r"\b(market research|competitive intelligence|customer research)\b",
                    r"\b(financial modeling|scenario planning|sensitivity analysis)\b",
                    r"\b(performance measurement|KPI|balanced scorecard)\b"
                ],
                "context_indicators": ["strategy", "business", "market", "competitive", "growth", "innovation"],
                "expertise_levels": {
                    "beginner": ["basic", "introductory", "foundational"],
                    "intermediate": ["advanced", "sophisticated", "professional"],
                    "expert": ["strategic", "executive", "visionary", "transformational"]
                }
            },

            "project_management": {
                "terminology": [
                    r"\b(project scope|timeline|milestone|deliverable|stakeholder)\b",
                    r"\b(risk management|quality assurance|change management|communication)\b",
                    r"\b(resource allocation|budget management|cost control|schedule)\b",
                    r"\b(project charter|work breakdown structure|critical path|Gantt chart)\b"
                ],
                "concepts": [
                    r"\b(PMBOK|PRINCE2|Agile|Scrum|Kanban|Lean)\b",
                    r"\b(waterfall|iterative|incremental|adaptive|hybrid)\b",
                    r"\b(project lifecycle|initiation|planning|execution|monitoring|closure)\b",
                    r"\b(team dynamics|leadership|motivation|conflict resolution)\b"
                ],
                "methodology": [
                    r"\b(project planning|risk assessment|stakeholder analysis)\b",
                    r"\b(quality planning|communication planning|procurement planning)\b",
                    r"\b(performance monitoring|variance analysis|corrective action)\b",
                    r"\b(lessons learned|post-mortem|continuous improvement)\b"
                ],
                "context_indicators": ["project", "management", "planning", "execution", "delivery", "team"],
                "expertise_levels": {
                    "beginner": ["basic", "introductory", "assistant"],
                    "intermediate": ["coordinator", "manager", "professional"],
                    "expert": ["director", "executive", "consultant", "expert"]
                }
            },

            # Creative and Design Domains
            "design_thinking": {
                "terminology": [
                    r"\b(user experience|UX|user interface|UI|usability|accessibility)\b",
                    r"\b(design system|component library|wireframe|prototype|mockup)\b",
                    r"\b(user research|persona|journey map|empathy map|user story)\b",
                    r"\b(visual design|typography|color theory|layout|composition)\b"
                ],
                "concepts": [
                    r"\b(design thinking process|empathize|define|ideate|prototype|test)\b",
                    r"\b(human-centered design|user-centered design|service design)\b",
                    r"\b(design patterns|affordances|constraints|feedback loops)\b",
                    r"\b(design principles|consistency|hierarchy|contrast|alignment)\b"
                ],
                "methodology": [
                    r"\b(design research|ethnographic research|usability testing)\b",
                    r"\b(rapid prototyping|iterative design|A/B testing)\b",
                    r"\b(design critique|design review|design sprint)\b",
                    r"\b(accessibility audit|usability audit|heuristic evaluation)\b"
                ],
                "context_indicators": ["design", "user", "experience", "interface", "creative", "visual"],
                "expertise_levels": {
                    "beginner": ["basic", "introductory", "junior"],
                    "intermediate": ["mid-level", "senior", "specialist"],
                    "expert": ["lead", "principal", "director", "expert"]
                }
            },

            # Research and Academic Domains
            "research_methodology": {
                "terminology": [
                    r"\b(hypothesis|research question|methodology|literature review)\b",
                    r"\b(peer review|meta-analysis|systematic review|evidence synthesis)\b",
                    r"\b(statistical significance|effect size|power analysis|confidence interval)\b",
                    r"\b(validity|reliability|generalizability|replicability)\b"
                ],
                "concepts": [
                    r"\b(experimental design|quasi-experimental|observational|longitudinal)\b",
                    r"\b(randomized controlled trial|RCT|cohort study|case-control)\b",
                    r"\b(qualitative|quantitative|mixed methods|triangulation)\b",
                    r"\b(grounded theory|phenomenology|ethnography|case study)\b"
                ],
                "methodology": [
                    r"\b(research protocol|IRB|ethics approval|informed consent)\b",
                    r"\b(data collection|sampling|recruitment|randomization)\b",
                    r"\b(statistical analysis|data analysis|interpretation|synthesis)\b",
                    r"\b(publication|dissemination|knowledge translation|impact)\b"
                ],
                "context_indicators": ["research", "study", "investigation", "analysis", "evidence", "academic"],
                "expertise_levels": {
                    "beginner": ["basic", "introductory", "foundational"],
                    "intermediate": ["advanced", "sophisticated", "rigorous"],
                    "expert": ["cutting-edge", "pioneering", "groundbreaking", "novel"]
                }
            },

            # Communication and Language Domains
            "technical_writing": {
                "terminology": [
                    r"\b(documentation|technical writing|user manual|API documentation)\b",
                    r"\b(style guide|writing standards|clarity|conciseness|precision)\b",
                    r"\b(procedural writing|explanatory writing|persuasive writing)\b",
                    r"\b(editing|proofreading|revision|peer review|feedback)\b"
                ],
                "concepts": [
                    r"\b(audience analysis|purpose|context|tone|voice)\b",
                    r"\b(information architecture|content strategy|content design)\b",
                    r"\b(plain language|readability|accessibility|inclusivity)\b",
                    r"\b(version control|content management|localization|translation)\b"
                ],
                "methodology": [
                    r"\b(writing process|planning|drafting|revising|editing)\b",
                    r"\b(content audit|gap analysis|user research|usability testing)\b",
                    r"\b(collaborative writing|review process|approval workflow)\b",
                    r"\b(quality assurance|consistency check|style compliance)\b"
                ],
                "context_indicators": ["writing", "documentation", "communication", "content", "text", "language"],
                "expertise_levels": {
                    "beginner": ["basic", "introductory", "junior"],
                    "intermediate": ["professional", "senior", "specialist"],
                    "expert": ["expert", "principal", "director", "master"]
                }
            },

            # Healthcare and Life Sciences
            "healthcare": {
                "terminology": [
                    r"\b(patient care|clinical practice|medical diagnosis|treatment)\b",
                    r"\b(evidence-based medicine|clinical guidelines|best practices)\b",
                    r"\b(healthcare delivery|patient safety|quality improvement)\b",
                    r"\b(medical ethics|informed consent|patient privacy|HIPAA)\b"
                ],
                "concepts": [
                    r"\b(clinical decision support|diagnostic accuracy|treatment efficacy)\b",
                    r"\b(health outcomes|patient satisfaction|care coordination)\b",
                    r"\b(health disparities|social determinants|population health)\b",
                    r"\b(healthcare innovation|digital health|telemedicine)\b"
                ],
                "methodology": [
                    r"\b(clinical trials|observational studies|systematic reviews)\b",
                    r"\b(quality improvement|patient safety|risk management)\b",
                    r"\b(healthcare analytics|outcomes research|health services research)\b",
                    r"\b(implementation science|knowledge translation|evidence implementation)\b"
                ],
                "context_indicators": ["healthcare", "medical", "clinical", "patient", "health", "treatment"],
                "expertise_levels": {
                    "beginner": ["basic", "introductory", "student"],
                    "intermediate": ["practitioner", "professional", "specialist"],
                    "expert": ["expert", "consultant", "researcher", "leader"]
                }
            },

            # Finance and Economics
            "finance": {
                "terminology": [
                    r"\b(financial analysis|investment|portfolio|risk management)\b",
                    r"\b(capital markets|equity|debt|derivatives|options|futures)\b",
                    r"\b(financial modeling|valuation|DCF|NPV|IRR|ROI)\b",
                    r"\b(regulatory compliance|Basel|SOX|IFRS|GAAP)\b"
                ],
                "concepts": [
                    r"\b(efficient market hypothesis|portfolio theory|CAPM|beta)\b",
                    r"\b(risk-return tradeoff|diversification|correlation|volatility)\b",
                    r"\b(financial engineering|quantitative finance|algorithmic trading)\b",
                    r"\b(behavioral finance|market psychology|herd behavior)\b"
                ],
                "methodology": [
                    r"\b(financial statement analysis|ratio analysis|trend analysis)\b",
                    r"\b(credit analysis|risk assessment|stress testing)\b",
                    r"\b(portfolio optimization|asset allocation|rebalancing)\b",
                    r"\b(regulatory reporting|compliance monitoring|audit)\b"
                ],
                "context_indicators": ["finance", "financial", "investment", "market", "risk", "capital"],
                "expertise_levels": {
                    "beginner": ["basic", "introductory", "analyst"],
                    "intermediate": ["associate", "manager", "specialist"],
                    "expert": ["director", "executive", "expert", "consultant"]
                }
            }
        }

    def analyze_domain_expertise(self, agent_output: str, agent_state: AgentState) -> Dict[str, Dict[str, Any]]:
        """
        Analyze domain expertise with improved normalization and bias correction.

        Args:
            agent_output: The agent's output text
            agent_state: Current agent state for context

        Returns:
            Dictionary of domain expertise analysis results
        """
        self.logger.debug(f"Analyzing domain expertise from output of length {len(agent_output)}")

        # Normalize text length and apply bias correction
        normalized_output = self._normalize_text_length(agent_output)
        length_factor = self._calculate_length_factor(agent_output)

        domain_expertise = {}

        for domain, patterns in self.domain_patterns.items():
            # Calculate base expertise score
            base_score = self._calculate_domain_expertise(normalized_output, patterns)

            # Apply length normalization
            normalized_score = self._apply_length_normalization(base_score, length_factor)

            # Apply bias correction
            corrected_score = self._apply_bias_correction(normalized_score, domain, agent_output)

            if corrected_score > 0.1:  # Minimum threshold for domain detection
                domain_expertise[domain] = {
                    "expertise_score": corrected_score,
                    "expertise_level": self._determine_expertise_level(normalized_output, patterns),
                    "confidence": self._calculate_domain_confidence(normalized_output, patterns, corrected_score),
                    "indicators": self._extract_domain_indicators(normalized_output, patterns),
                    "terminology_usage": self._analyze_terminology_usage(normalized_output, patterns),
                    "concept_depth": self._analyze_concept_depth(normalized_output, patterns),
                    "length_normalization_factor": length_factor,
                    "bias_correction_applied": True
                }

        self.logger.info(f"Detected expertise in {len(domain_expertise)} domains with normalization")
        return domain_expertise

    def _normalize_text_length(self, text: str) -> str:
        """Normalize text length to reduce bias."""
        words = text.split()
        word_count = len(words)

        # If text is too short, pad with context
        if word_count < self.normalization_params['min_length']:
            # Add neutral context to reach minimum length
            padding_needed = self.normalization_params['min_length'] - word_count
            padding_words = ["context"] * padding_needed
            return " ".join(words + padding_words)

        # If text is too long, truncate intelligently
        elif word_count > self.normalization_params['max_length']:
            # Keep first and last parts, remove middle
            keep_words = self.normalization_params['max_length'] // 2
            return " ".join(words[:keep_words] + words[-keep_words:])

        return text

    def _calculate_length_factor(self, text: str) -> float:
        """Calculate length normalization factor."""
        word_count = len(text.split())

        # Optimal length range
        optimal_min = 50
        optimal_max = 200

        if word_count < optimal_min:
            # Penalize very short texts
            return 0.5 + (word_count / optimal_min) * 0.5
        elif word_count > optimal_max:
            # Slight penalty for very long texts
            return 1.0 - min(0.2, (word_count - optimal_max) / optimal_max * 0.2)
        else:
            return 1.0

    def _apply_length_normalization(self, score: float, length_factor: float) -> float:
        """Apply length-based normalization to expertise score."""
        return score * length_factor

    def _apply_bias_correction(self, score: float, domain: str, text: str) -> float:
        """Apply domain-specific bias correction."""
        # Domain-specific bias factors (based on common over/under-detection)
        bias_factors = {
            "software_engineering": 0.9,  # Slightly reduce (often over-detected)
            "machine_learning": 0.95,     # Slightly reduce
            "data_science": 0.9,          # Slightly reduce
            "business_strategy": 1.1,     # Slightly boost (often under-detected)
            "project_management": 1.05,   # Slightly boost
            "design_thinking": 1.1,       # Slightly boost
            "research_methodology": 1.0,  # No bias
            "technical_writing": 1.05,    # Slightly boost
            "healthcare": 1.1,            # Slightly boost
            "finance": 1.0                # No bias
        }

        bias_factor = bias_factors.get(domain, 1.0)
        return min(1.0, score * bias_factor)

    def _calculate_domain_expertise(self, text: str, patterns: Dict[str, Any]) -> float:
        """Calculate domain expertise score with improved methodology."""
        scores = {}

        # Analyze terminology usage
        terminology_score = self._analyze_pattern_matches(text, patterns["terminology"])
        scores["terminology"] = terminology_score

        # Analyze concept knowledge
        concept_score = self._analyze_pattern_matches(text, patterns["concepts"])
        scores["concepts"] = concept_score

        # Analyze methodology knowledge
        methodology_score = self._analyze_pattern_matches(text, patterns["methodology"])
        scores["methodology"] = methodology_score

        # Analyze contextual relevance
        context_score = self._analyze_contextual_relevance(text, patterns["context_indicators"])
        scores["context"] = context_score

        # Analyze depth of understanding
        depth_score = self._analyze_expertise_depth(text, patterns)
        scores["depth"] = depth_score

        # Weighted combination
        total_score = sum(scores[aspect] * self.expertise_weights[aspect]
                         for aspect in scores)

        return min(1.0, total_score)

    def _analyze_expertise_depth(self, text: str, patterns: Dict[str, Any]) -> float:
        """Analyze depth of expertise understanding."""
        expertise_levels = patterns["expertise_levels"]

        level_scores = {}
        for level, indicators in expertise_levels.items():
            score = sum(1 for indicator in indicators
                       if indicator.lower() in text.lower())
            level_scores[level] = score

        # Weight expert level more heavily
        depth_score = (
            level_scores["beginner"] * 0.2 +
            level_scores["intermediate"] * 0.4 +
            level_scores["expert"] * 0.6
        )

        # Normalize by total possible indicators
        total_indicators = sum(len(indicators) for indicators in expertise_levels.values())
        return min(1.0, depth_score / total_indicators) if total_indicators > 0 else 0.0

    def _analyze_pattern_matches(self, text: str, patterns: List[str]) -> float:
        """Analyze pattern matches with improved scoring."""
        matches = 0
        total_patterns = len(patterns)

        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                matches += 1

        # Apply logarithmic scaling to prevent saturation
        if matches > 0:
            return min(1.0, math.log(matches + 1) / math.log(total_patterns + 1))
        return 0.0

    def _analyze_contextual_relevance(self, text: str, indicators: List[str]) -> float:
        """Analyze contextual relevance with improved scoring."""
        text_lower = text.lower()
        matches = sum(1 for indicator in indicators if indicator in text_lower)

        # Apply square root scaling to prevent over-weighting
        return min(1.0, math.sqrt(matches) / math.sqrt(len(indicators))) if indicators else 0.0

    def _determine_expertise_level(self, text: str, patterns: Dict[str, Any]) -> str:
        """Determine expertise level with improved logic."""
        expertise_levels = patterns["expertise_levels"]

        level_scores = {}
        for level, indicators in expertise_levels.items():
            score = sum(1 for indicator in indicators
                       if indicator.lower() in text.lower())
            level_scores[level] = score

        # Determine level based on highest weighted score
        weighted_scores = {
            "beginner": level_scores["beginner"] * 1.0,
            "intermediate": level_scores["intermediate"] * 1.5,
            "expert": level_scores["expert"] * 2.0
        }

        best_level = max(weighted_scores, key=weighted_scores.get)
        return best_level if weighted_scores[best_level] > 0 else "unknown"

    def _calculate_domain_confidence(self, text: str, patterns: Dict[str, Any], expertise_score: float) -> float:
        """Calculate confidence with improved methodology."""
        base_confidence = expertise_score

        # Boost confidence for multiple pattern types
        pattern_type_matches = 0
        for pattern_type in ["terminology", "concepts", "methodology"]:
            if self._analyze_pattern_matches(text, patterns[pattern_type]) > 0:
                pattern_type_matches += 1

        # Boost confidence for contextual coherence
        contextual_matches = self._analyze_contextual_relevance(text, patterns["context_indicators"])

        # Boost confidence for depth indicators
        depth_matches = self._analyze_expertise_depth(text, patterns)

        confidence_boost = (
            (pattern_type_matches * 0.1) +
            (contextual_matches * 0.15) +
            (depth_matches * 0.1)
        )

        return min(1.0, base_confidence + confidence_boost)

    def _extract_domain_indicators(self, text: str, patterns: Dict[str, Any]) -> List[str]:
        """Extract specific domain indicators with improved extraction."""
        indicators = []

        # Extract terminology examples
        for pattern in patterns["terminology"]:
            matches = re.findall(pattern, text, re.IGNORECASE)
            indicators.extend(matches[:2])  # Limit to 2 examples per pattern

        # Extract concept examples
        for pattern in patterns["concepts"]:
            matches = re.findall(pattern, text, re.IGNORECASE)
            indicators.extend(matches[:2])  # Limit to 2 examples per pattern

        # Extract methodology examples
        for pattern in patterns["methodology"]:
            matches = re.findall(pattern, text, re.IGNORECASE)
            indicators.extend(matches[:1])  # Limit to 1 example per pattern

        return indicators[:8]  # Limit to 8 total indicators

    def _analyze_terminology_usage(self, text: str, patterns: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze terminology usage with enhanced metrics."""
        terminology_analysis = {
            "total_terms": 0,
            "unique_terms": set(),
            "term_frequency": defaultdict(int),
            "sophistication_score": 0.0,
            "density_score": 0.0
        }

        for pattern in patterns["terminology"]:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                terminology_analysis["total_terms"] += 1
                terminology_analysis["unique_terms"].add(match.lower())
                terminology_analysis["term_frequency"][match.lower()] += 1

        # Calculate sophistication score based on term diversity
        unique_count = len(terminology_analysis["unique_terms"])
        total_count = terminology_analysis["total_terms"]

        if total_count > 0:
            terminology_analysis["sophistication_score"] = unique_count / total_count

        # Calculate density score (terms per word)
        word_count = len(text.split())
        terminology_analysis["density_score"] = total_count / word_count if word_count > 0 else 0.0

        return terminology_analysis

    def _analyze_concept_depth(self, text: str, patterns: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze depth of concept understanding with enhanced metrics."""
        concept_analysis = {
            "concept_count": 0,
            "concept_complexity": 0.0,
            "concept_integration": 0.0,
            "concept_sophistication": 0.0
        }

        # Count concept mentions
        for pattern in patterns["concepts"]:
            matches = re.findall(pattern, text, re.IGNORECASE)
            concept_analysis["concept_count"] += len(matches)

        # Analyze concept complexity (based on concept sophistication)
        complex_concepts = [
            "neural network", "deep learning", "reinforcement learning",
            "transformer", "attention mechanism", "backpropagation",
            "design thinking", "lean startup", "blue ocean strategy",
            "statistical significance", "meta-analysis", "systematic review"
        ]

        complexity_score = 0.0
        for concept in complex_concepts:
            if concept in text.lower():
                complexity_score += 0.15

        concept_analysis["concept_complexity"] = min(1.0, complexity_score)

        # Analyze concept integration (how concepts are connected)
        integration_score = 0.0
        if concept_analysis["concept_count"] > 1:
            # More sophisticated integration scoring
            integration_score = min(1.0, concept_analysis["concept_count"] * 0.08)

        concept_analysis["concept_integration"] = integration_score

        # Calculate concept sophistication
        concept_analysis["concept_sophistication"] = (
            concept_analysis["concept_complexity"] * 0.4 +
            concept_analysis["concept_integration"] * 0.6
        )

        return concept_analysis

    def calculate_cross_domain_transfer(self, domain_expertise: Dict[str, Dict[str, Any]]) -> Dict[str, float]:
        """Calculate potential for cross-domain knowledge transfer with enhanced analysis."""
        if len(domain_expertise) < 2:
            return {}

        transfer_potential = {}
        domains = list(domain_expertise.keys())

        # Calculate transfer potential between domain pairs
        for i, domain1 in enumerate(domains):
            for domain2 in domains[i+1:]:
                transfer_key = f"{domain1}_to_{domain2}"

                # Get expertise scores and confidence
                expertise1 = domain_expertise[domain1]["expertise_score"]
                expertise2 = domain_expertise[domain2]["expertise_score"]
                confidence1 = domain_expertise[domain1]["confidence"]
                confidence2 = domain_expertise[domain2]["confidence"]

                # Calculate transfer potential based on expertise levels and confidence
                base_transfer = (expertise1 * expertise2) * 0.7
                confidence_boost = (confidence1 + confidence2) * 0.15

                # Boost for complementary domains
                complementarity_boost = 1.0
                if self._are_complementary_domains(domain1, domain2):
                    complementarity_boost = 1.3

                # Boost for similar expertise levels
                level_similarity = 1.0 - abs(expertise1 - expertise2)
                similarity_boost = 1.0 + (level_similarity * 0.2)

                transfer_score = base_transfer * complementarity_boost * similarity_boost + confidence_boost
                transfer_potential[transfer_key] = min(1.0, transfer_score)

        return transfer_potential

    def _are_complementary_domains(self, domain1: str, domain2: str) -> bool:
        """Check if two domains are complementary for knowledge transfer."""
        complementary_pairs = [
            ("software_engineering", "machine_learning"),
            ("data_science", "machine_learning"),
            ("artificial_intelligence", "machine_learning"),
            ("research_methodology", "data_science"),
            ("software_engineering", "data_science"),
            ("business_strategy", "project_management"),
            ("design_thinking", "technical_writing"),
            ("healthcare", "research_methodology"),
            ("finance", "data_science"),
            ("project_management", "technical_writing")
        ]

        for pair in complementary_pairs:
            if ((domain1 == pair[0] and domain2 == pair[1]) or
                (domain1 == pair[1] and domain2 == pair[0])):
                return True

        return False
