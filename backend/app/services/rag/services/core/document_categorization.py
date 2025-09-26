#!/usr/bin/env python3
"""
Document Categorization Service
==============================

Modular document categorization service that integrates with the existing RAG infrastructure.
Automatically categorizes academic papers and documents into scientific domains using metadata.
"""

import asyncio
import json
import logging
import re
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum

from ...interfaces.base import BaseService, ServiceStatus

logger = logging.getLogger(__name__)


class ScientificDomain(Enum):
    """Broad scientific domains for document categorization."""
    
    # Computer Science
    COMPUTER_SCIENCE = "computer_science"
    ARTIFICIAL_INTELLIGENCE = "artificial_intelligence"
    MACHINE_LEARNING = "machine_learning"
    DATA_SCIENCE = "data_science"
    SOFTWARE_ENGINEERING = "software_engineering"
    ALGORITHMS = "algorithms"
    THEORY = "theory"
    
    # Mathematics
    MATHEMATICS = "mathematics"
    STATISTICS = "statistics"
    APPLIED_MATH = "applied_mathematics"
    PURE_MATH = "pure_mathematics"
    
    # Physics
    PHYSICS = "physics"
    QUANTUM_PHYSICS = "quantum_physics"
    CONDENSED_MATTER = "condensed_matter"
    PARTICLE_PHYSICS = "particle_physics"
    ASTROPHYSICS = "astrophysics"
    
    # Biology & Life Sciences
    BIOLOGY = "biology"
    BIOINFORMATICS = "bioinformatics"
    NEUROSCIENCE = "neuroscience"
    GENETICS = "genetics"
    
    # Engineering
    ENGINEERING = "engineering"
    ELECTRICAL_ENGINEERING = "electrical_engineering"
    MECHANICAL_ENGINEERING = "mechanical_engineering"
    CIVIL_ENGINEERING = "civil_engineering"
    
    # Social Sciences
    SOCIAL_SCIENCES = "social_sciences"
    PSYCHOLOGY = "psychology"
    ECONOMICS = "economics"
    POLITICAL_SCIENCE = "political_science"
    
    # Interdisciplinary
    INTERDISCIPLINARY = "interdisciplinary"
    COMPUTATIONAL_BIOLOGY = "computational_biology"
    QUANTITATIVE_FINANCE = "quantitative_finance"
    DIGITAL_HUMANITIES = "digital_humanities"
    
    # Other
    OTHER = "other"


@dataclass
class DocumentCategory:
    """Document category with confidence score and metadata."""
    primary_domain: ScientificDomain
    secondary_domains: List[ScientificDomain]
    confidence: float
    keywords: List[str]
    arxiv_categories: List[str]
    reasoning: str
    domain_tags: List[str]


class DocumentCategorizationService(BaseService):
    """Modular document categorization service for academic papers."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("document-categorization", config)
        
        # Configuration
        self.enabled = self.config.get("document_categorization_enabled", True)
        self.min_confidence_threshold = self.config.get("min_confidence_threshold", 0.3)
        self.cache_enabled = self.config.get("categorization_cache_enabled", True)
        self.papers_directory = Path(self.config.get("papers_directory", "/home/kade/runeset/reynard/backend/data/papers"))
        
        # Domain mappings
        self.domain_keywords = self._build_domain_keywords()
        self.arxiv_category_mapping = self._build_arxiv_mapping()
        
        # Cache
        self._cache = {}
        
        # Metrics
        self.metrics = {
            "documents_categorized": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "categorization_errors": 0,
            "domain_distribution": {},
            "average_confidence": 0.0
        }
    
    async def initialize(self) -> bool:
        """Initialize the categorization service."""
        try:
            self.update_status(ServiceStatus.INITIALIZING, "Initializing document categorization service")
            
            # Load cache if enabled
            if self.cache_enabled:
                await self._load_cache()
            
            # Initialize metrics
            self.metrics = {
                "documents_categorized": 0,
                "cache_hits": 0,
                "cache_misses": 0,
                "categorization_errors": 0,
                "domain_distribution": {},
                "average_confidence": 0.0
            }
            
            self.update_status(ServiceStatus.HEALTHY, "Document categorization service initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize document categorization service: {e}")
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False
    
    def _build_domain_keywords(self) -> Dict[ScientificDomain, List[str]]:
        """Build keyword mappings for each scientific domain."""
        return {
            ScientificDomain.COMPUTER_SCIENCE: [
                "algorithm", "data structure", "programming", "software", "system",
                "computing", "computer", "computational", "code", "implementation",
                "optimization", "complexity", "graph", "tree", "network", "database"
            ],
            ScientificDomain.ARTIFICIAL_INTELLIGENCE: [
                "artificial intelligence", "ai", "machine learning", "neural network",
                "deep learning", "nlp", "natural language", "computer vision",
                "reinforcement learning", "supervised learning", "unsupervised learning",
                "transformer", "attention", "embedding", "model", "training"
            ],
            ScientificDomain.MACHINE_LEARNING: [
                "machine learning", "ml", "learning algorithm", "classification",
                "regression", "clustering", "feature", "training", "model",
                "prediction", "inference", "overfitting", "cross-validation",
                "gradient descent", "optimization", "loss function"
            ],
            ScientificDomain.ALGORITHMS: [
                "algorithm", "data structure", "union-find", "disjoint set",
                "minimum spanning tree", "kruskal", "prim", "dijkstra",
                "sorting", "searching", "graph algorithm", "dynamic programming",
                "greedy", "divide and conquer", "complexity", "big o"
            ],
            ScientificDomain.THEORY: [
                "complexity theory", "computational complexity", "np-complete",
                "p vs np", "turing machine", "automata", "formal language",
                "proof", "theorem", "lemma", "corollary", "mathematical proof",
                "lower bound", "upper bound", "approximation algorithm"
            ],
            ScientificDomain.MATHEMATICS: [
                "mathematical", "mathematics", "theorem", "proof", "lemma",
                "corollary", "equation", "formula", "algebra", "calculus",
                "geometry", "topology", "analysis", "number theory"
            ],
            ScientificDomain.STATISTICS: [
                "statistical", "statistics", "probability", "distribution",
                "hypothesis testing", "regression", "correlation", "variance",
                "mean", "median", "standard deviation", "confidence interval",
                "p-value", "bayesian", "frequentist"
            ],
            ScientificDomain.PHYSICS: [
                "physics", "physical", "quantum", "mechanics", "thermodynamics",
                "electromagnetism", "relativity", "particle", "wave", "energy",
                "force", "momentum", "entropy", "field", "spacetime"
            ],
            ScientificDomain.QUANTUM_PHYSICS: [
                "quantum", "quantum mechanics", "quantum computing", "qubit",
                "superposition", "entanglement", "quantum algorithm", "quantum error",
                "quantum correction", "quantum circuit", "quantum gate"
            ],
            ScientificDomain.BIOLOGY: [
                "biology", "biological", "cell", "dna", "protein", "gene",
                "evolution", "organism", "species", "ecosystem", "molecular",
                "genetics", "genome", "transcription", "translation"
            ],
            ScientificDomain.BIOINFORMATICS: [
                "bioinformatics", "genomics", "proteomics", "sequence analysis",
                "phylogeny", "alignment", "blast", "genome assembly",
                "gene expression", "pathway analysis", "systems biology"
            ],
            ScientificDomain.ENGINEERING: [
                "engineering", "design", "system", "control", "signal processing",
                "robotics", "automation", "manufacturing", "optimization",
                "reliability", "safety", "performance", "efficiency"
            ],
            ScientificDomain.INTERDISCIPLINARY: [
                "interdisciplinary", "multidisciplinary", "cross-disciplinary",
                "computational biology", "quantitative finance", "digital humanities",
                "computational social science", "network science", "complex systems"
            ]
        }
    
    def _build_arxiv_mapping(self) -> Dict[str, ScientificDomain]:
        """Build arXiv category to scientific domain mapping."""
        return {
            # Computer Science
            "cs.AI": ScientificDomain.ARTIFICIAL_INTELLIGENCE,
            "cs.CC": ScientificDomain.THEORY,
            "cs.CG": ScientificDomain.ALGORITHMS,
            "cs.CL": ScientificDomain.ARTIFICIAL_INTELLIGENCE,
            "cs.CR": ScientificDomain.COMPUTER_SCIENCE,
            "cs.CV": ScientificDomain.ARTIFICIAL_INTELLIGENCE,
            "cs.DB": ScientificDomain.COMPUTER_SCIENCE,
            "cs.DC": ScientificDomain.COMPUTER_SCIENCE,
            "cs.DL": ScientificDomain.MACHINE_LEARNING,
            "cs.DM": ScientificDomain.ALGORITHMS,
            "cs.DS": ScientificDomain.ALGORITHMS,
            "cs.ET": ScientificDomain.ENGINEERING,
            "cs.FL": ScientificDomain.THEORY,
            "cs.GL": ScientificDomain.COMPUTER_SCIENCE,
            "cs.GR": ScientificDomain.COMPUTER_SCIENCE,
            "cs.GT": ScientificDomain.THEORY,
            "cs.HC": ScientificDomain.COMPUTER_SCIENCE,
            "cs.IR": ScientificDomain.COMPUTER_SCIENCE,
            "cs.IT": ScientificDomain.THEORY,
            "cs.LG": ScientificDomain.MACHINE_LEARNING,
            "cs.LO": ScientificDomain.THEORY,
            "cs.MA": ScientificDomain.ALGORITHMS,
            "cs.MM": ScientificDomain.COMPUTER_SCIENCE,
            "cs.MS": ScientificDomain.COMPUTER_SCIENCE,
            "cs.NA": ScientificDomain.APPLIED_MATH,
            "cs.NE": ScientificDomain.ARTIFICIAL_INTELLIGENCE,
            "cs.NI": ScientificDomain.COMPUTER_SCIENCE,
            "cs.OH": ScientificDomain.COMPUTER_SCIENCE,
            "cs.OS": ScientificDomain.COMPUTER_SCIENCE,
            "cs.PF": ScientificDomain.COMPUTER_SCIENCE,
            "cs.PL": ScientificDomain.SOFTWARE_ENGINEERING,
            "cs.RO": ScientificDomain.ENGINEERING,
            "cs.SC": ScientificDomain.COMPUTER_SCIENCE,
            "cs.SD": ScientificDomain.COMPUTER_SCIENCE,
            "cs.SE": ScientificDomain.SOFTWARE_ENGINEERING,
            "cs.SI": ScientificDomain.COMPUTER_SCIENCE,
            "cs.SY": ScientificDomain.ENGINEERING,
            
            # Mathematics
            "math.AG": ScientificDomain.PURE_MATH,
            "math.AT": ScientificDomain.PURE_MATH,
            "math.CA": ScientificDomain.PURE_MATH,
            "math.CO": ScientificDomain.PURE_MATH,
            "math.CT": ScientificDomain.PURE_MATH,
            "math.CV": ScientificDomain.PURE_MATH,
            "math.DG": ScientificDomain.PURE_MATH,
            "math.DS": ScientificDomain.APPLIED_MATH,
            "math.FA": ScientificDomain.PURE_MATH,
            "math.GM": ScientificDomain.PURE_MATH,
            "math.GN": ScientificDomain.PURE_MATH,
            "math.GR": ScientificDomain.PURE_MATH,
            "math.GT": ScientificDomain.PURE_MATH,
            "math.HO": ScientificDomain.PURE_MATH,
            "math.IT": ScientificDomain.THEORY,
            "math.KT": ScientificDomain.PURE_MATH,
            "math.LO": ScientificDomain.THEORY,
            "math.MG": ScientificDomain.PURE_MATH,
            "math.MP": ScientificDomain.APPLIED_MATH,
            "math.NA": ScientificDomain.APPLIED_MATH,
            "math.NT": ScientificDomain.PURE_MATH,
            "math.OA": ScientificDomain.PURE_MATH,
            "math.OC": ScientificDomain.APPLIED_MATH,
            "math.PR": ScientificDomain.STATISTICS,
            "math.QA": ScientificDomain.PURE_MATH,
            "math.RA": ScientificDomain.PURE_MATH,
            "math.RT": ScientificDomain.PURE_MATH,
            "math.SG": ScientificDomain.PURE_MATH,
            "math.SP": ScientificDomain.APPLIED_MATH,
            "math.ST": ScientificDomain.STATISTICS,
            
            # Physics
            "physics.acc-ph": ScientificDomain.PHYSICS,
            "physics.ao-ph": ScientificDomain.PHYSICS,
            "physics.app-ph": ScientificDomain.PHYSICS,
            "physics.atm-ph": ScientificDomain.PHYSICS,
            "physics.atom-ph": ScientificDomain.PHYSICS,
            "physics.bio-ph": ScientificDomain.BIOLOGY,
            "physics.chem-ph": ScientificDomain.PHYSICS,
            "physics.class-ph": ScientificDomain.PHYSICS,
            "physics.comp-ph": ScientificDomain.PHYSICS,
            "physics.data-an": ScientificDomain.DATA_SCIENCE,
            "physics.flu-dyn": ScientificDomain.PHYSICS,
            "physics.gen-ph": ScientificDomain.PHYSICS,
            "physics.geo-ph": ScientificDomain.PHYSICS,
            "physics.hist-ph": ScientificDomain.PHYSICS,
            "physics.ins-det": ScientificDomain.PHYSICS,
            "physics.med-ph": ScientificDomain.PHYSICS,
            "physics.optics": ScientificDomain.PHYSICS,
            "physics.plasm-ph": ScientificDomain.PHYSICS,
            "physics.pop-ph": ScientificDomain.PHYSICS,
            "physics.soc-ph": ScientificDomain.SOCIAL_SCIENCES,
            "physics.space-ph": ScientificDomain.ASTROPHYSICS,
            "quant-ph": ScientificDomain.QUANTUM_PHYSICS,
            
            # Biology
            "q-bio.BM": ScientificDomain.BIOLOGY,
            "q-bio.CB": ScientificDomain.BIOINFORMATICS,
            "q-bio.GN": ScientificDomain.GENETICS,
            "q-bio.MN": ScientificDomain.BIOLOGY,
            "q-bio.NC": ScientificDomain.NEUROSCIENCE,
            "q-bio.OT": ScientificDomain.BIOLOGY,
            "q-bio.PE": ScientificDomain.BIOLOGY,
            "q-bio.QM": ScientificDomain.BIOLOGY,
            "q-bio.SC": ScientificDomain.BIOLOGY,
            "q-bio.TO": ScientificDomain.BIOLOGY,
            
            # Statistics
            "stat.AP": ScientificDomain.STATISTICS,
            "stat.CO": ScientificDomain.STATISTICS,
            "stat.ME": ScientificDomain.STATISTICS,
            "stat.ML": ScientificDomain.MACHINE_LEARNING,
            "stat.OT": ScientificDomain.STATISTICS,
            "stat.TH": ScientificDomain.STATISTICS,
            
            # Economics
            "econ.EM": ScientificDomain.ECONOMICS,
            "econ.GN": ScientificDomain.ECONOMICS,
            "econ.TH": ScientificDomain.ECONOMICS,
            
            # Electrical Engineering
            "eess.AS": ScientificDomain.ELECTRICAL_ENGINEERING,
            "eess.IV": ScientificDomain.ELECTRICAL_ENGINEERING,
            "eess.SP": ScientificDomain.ELECTRICAL_ENGINEERING,
            "eess.SY": ScientificDomain.ELECTRICAL_ENGINEERING,
        }
    
    async def categorize_document(
        self,
        title: str,
        abstract: str,
        arxiv_categories: List[str],
        authors: List[str] = None,
        paper_id: str = None
    ) -> DocumentCategory:
        """Categorize a document into scientific domains."""
        
        # Check cache first
        if self.cache_enabled and paper_id:
            cache_key = f"{paper_id}_{hash(title + abstract)}"
            if cache_key in self._cache:
                self.metrics["cache_hits"] += 1
                return self._cache[cache_key]
            self.metrics["cache_misses"] += 1
        
        try:
            # Combine all text for analysis
            text_content = f"{title} {abstract}"
            text_lower = text_content.lower()
            
            # Calculate domain scores
            domain_scores = {}
            matched_keywords = {}
            
            for domain, keywords in self.domain_keywords.items():
                score = 0
                matched = []
                
                for keyword in keywords:
                    # Count keyword occurrences with word boundaries
                    pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
                    matches = len(re.findall(pattern, text_lower))
                    if matches > 0:
                        score += matches
                        matched.append(keyword)
                
                if score > 0:
                    domain_scores[domain] = score
                    matched_keywords[domain] = matched
            
            # Factor in arXiv categories
            arxiv_domain_scores = {}
            for category in arxiv_categories:
                if category in self.arxiv_category_mapping:
                    domain = self.arxiv_category_mapping[category]
                    arxiv_domain_scores[domain] = arxiv_domain_scores.get(domain, 0) + 2  # Higher weight for arXiv categories
            
            # Combine scores
            combined_scores = {}
            for domain in ScientificDomain:
                combined_scores[domain] = (
                    domain_scores.get(domain, 0) + 
                    arxiv_domain_scores.get(domain, 0)
                )
            
            # Find primary domain
            if not combined_scores:
                primary_domain = ScientificDomain.OTHER
                confidence = 0.0
            else:
                primary_domain = max(combined_scores, key=combined_scores.get)
                max_score = combined_scores[primary_domain]
                total_score = sum(combined_scores.values())
                confidence = min(max_score / max(total_score, 1), 1.0)
            
            # Find secondary domains (top 3 after primary)
            sorted_domains = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
            secondary_domains = [
                domain for domain, score in sorted_domains[1:4] 
                if score > 0 and domain != primary_domain
            ]
            
            # Generate domain tags
            domain_tags = self._generate_domain_tags(primary_domain, secondary_domains, matched_keywords)
            
            # Generate reasoning
            reasoning = self._generate_reasoning(
                primary_domain, secondary_domains, matched_keywords, 
                arxiv_categories, confidence
            )
            
            category = DocumentCategory(
                primary_domain=primary_domain,
                secondary_domains=secondary_domains,
                confidence=confidence,
                keywords=matched_keywords.get(primary_domain, []),
                arxiv_categories=arxiv_categories,
                reasoning=reasoning,
                domain_tags=domain_tags
            )
            
            # Cache result
            if self.cache_enabled and paper_id:
                cache_key = f"{paper_id}_{hash(title + abstract)}"
                self._cache[cache_key] = category
            
            # Update metrics
            self.metrics["documents_categorized"] += 1
            self.metrics["domain_distribution"][primary_domain.value] = self.metrics["domain_distribution"].get(primary_domain.value, 0) + 1
            
            # Update average confidence
            total_docs = self.metrics["documents_categorized"]
            current_avg = self.metrics["average_confidence"]
            self.metrics["average_confidence"] = (current_avg * (total_docs - 1) + confidence) / total_docs
            
            return category
            
        except Exception as e:
            self.metrics["categorization_errors"] += 1
            self.logger.error(f"Failed to categorize document: {e}")
            raise
    
    def _generate_domain_tags(
        self,
        primary_domain: ScientificDomain,
        secondary_domains: List[ScientificDomain],
        matched_keywords: Dict[ScientificDomain, List[str]]
    ) -> List[str]:
        """Generate domain tags for search and filtering."""
        tags = [primary_domain.value]
        tags.extend([d.value for d in secondary_domains])
        tags.extend(matched_keywords.get(primary_domain, [])[:5])  # Top 5 keywords as tags
        return list(set(tags))  # Remove duplicates
    
    def _generate_reasoning(
        self,
        primary_domain: ScientificDomain,
        secondary_domains: List[ScientificDomain],
        matched_keywords: Dict[ScientificDomain, List[str]],
        arxiv_categories: List[str],
        confidence: float
    ) -> str:
        """Generate human-readable reasoning for the categorization."""
        reasoning_parts = []
        
        # Primary domain reasoning
        if primary_domain != ScientificDomain.OTHER:
            reasoning_parts.append(f"Primary domain: {primary_domain.value}")
            
            if primary_domain in matched_keywords:
                keywords = matched_keywords[primary_domain][:5]  # Top 5 keywords
                reasoning_parts.append(f"Key terms: {', '.join(keywords)}")
        
        # Secondary domains
        if secondary_domains:
            secondary_names = [d.value for d in secondary_domains]
            reasoning_parts.append(f"Secondary domains: {', '.join(secondary_names)}")
        
        # arXiv categories
        if arxiv_categories:
            reasoning_parts.append(f"arXiv categories: {', '.join(arxiv_categories)}")
        
        # Confidence
        reasoning_parts.append(f"Confidence: {confidence:.2f}")
        
        return " | ".join(reasoning_parts)
    
    async def categorize_paper_from_metadata(
        self,
        metadata: Dict[str, Any]
    ) -> Optional[DocumentCategory]:
        """Categorize a paper from its metadata."""
        try:
            return await self.categorize_document(
                title=metadata.get('title', ''),
                abstract=metadata.get('abstract', ''),
                arxiv_categories=metadata.get('categories', []),
                authors=metadata.get('authors', []),
                paper_id=metadata.get('paper_id', '')
            )
        except Exception as e:
            self.logger.error(f"Failed to categorize paper from metadata: {e}")
            return None
    
    async def batch_categorize_papers(
        self,
        papers_directory: Path,
        max_papers: Optional[int] = None
    ) -> Dict[str, DocumentCategory]:
        """Batch categorize all papers in a directory."""
        results = {}
        
        # Find all metadata files
        metadata_files = list(papers_directory.rglob("metadata.json"))
        
        if max_papers:
            metadata_files = metadata_files[:max_papers]
        
        self.logger.info(f"Found {len(metadata_files)} papers to categorize")
        
        for metadata_file in metadata_files:
            try:
                # Load metadata
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                
                # Get paper ID
                paper_id = metadata.get('paper_id', metadata_file.parent.name)
                
                # Categorize the paper
                category = await self.categorize_paper_from_metadata(metadata)
                
                if category:
                    results[paper_id] = category
                    self.logger.info(f"Categorized {paper_id}: {category.primary_domain.value} (confidence: {category.confidence:.2f})")
                else:
                    self.logger.warning(f"Failed to categorize {paper_id}")
                    
            except Exception as e:
                self.logger.error(f"Error processing {metadata_file}: {e}")
        
        return results
    
    async def _load_cache(self) -> None:
        """Load categorization cache from disk."""
        cache_file = self.papers_directory / "categorization_cache.json"
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    cache_data = json.load(f)
                    # Convert back to DocumentCategory objects
                    for key, data in cache_data.items():
                        self._cache[key] = DocumentCategory(
                            primary_domain=ScientificDomain(data["primary_domain"]),
                            secondary_domains=[ScientificDomain(d) for d in data["secondary_domains"]],
                            confidence=data["confidence"],
                            keywords=data["keywords"],
                            arxiv_categories=data["arxiv_categories"],
                            reasoning=data["reasoning"],
                            domain_tags=data["domain_tags"]
                        )
                self.logger.info(f"Loaded {len(self._cache)} cached categorizations")
            except Exception as e:
                self.logger.error(f"Failed to load categorization cache: {e}")
    
    async def _save_cache(self) -> None:
        """Save categorization cache to disk."""
        if not self.cache_enabled:
            return
            
        cache_file = self.papers_directory / "categorization_cache.json"
        try:
            # Convert DocumentCategory objects to serializable format
            cache_data = {}
            for key, category in self._cache.items():
                cache_data[key] = {
                    "primary_domain": category.primary_domain.value,
                    "secondary_domains": [d.value for d in category.secondary_domains],
                    "confidence": category.confidence,
                    "keywords": category.keywords,
                    "arxiv_categories": category.arxiv_categories,
                    "reasoning": category.reasoning,
                    "domain_tags": category.domain_tags
                }
            
            with open(cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2)
            
            self.logger.info(f"Saved {len(self._cache)} cached categorizations")
            
        except Exception as e:
            self.logger.error(f"Failed to save categorization cache: {e}")
    
    async def shutdown(self) -> None:
        """Shutdown the service and save cache."""
        if self.cache_enabled:
            await self._save_cache()
        await super().shutdown()
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get categorization service statistics."""
        return {
            "service_status": self.status.value,
            "enabled": self.enabled,
            "cache_enabled": self.cache_enabled,
            "cache_size": len(self._cache),
            "metrics": self.metrics.copy()
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get service statistics (required by BaseService)."""
        return self.get_statistics()
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check (required by BaseService)."""
        return {
            "status": "healthy" if self.status == ServiceStatus.HEALTHY else "unhealthy",
            "service": "document-categorization",
            "enabled": self.enabled,
            "cache_size": len(self._cache),
            "documents_categorized": self.metrics["documents_categorized"]
        }
