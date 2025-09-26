#!/usr/bin/env python3
"""
Paper Indexing Integration Service
=================================

Integrates document categorization with the existing RAG indexing system,
automatically categorizing papers during the indexing process using metadata only.
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime

from ...interfaces.base import BaseService, ServiceStatus
from .document_categorization import DocumentCategorizationService, DocumentCategory, ScientificDomain

logger = logging.getLogger(__name__)


class PaperIndexingIntegration(BaseService):
    """Integrates paper categorization with RAG indexing system."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("paper-indexing-integration", config)
        
        # Configuration
        self.enabled = self.config.get("paper_indexing_integration_enabled", True)
        self.auto_categorize = self.config.get("auto_categorize_papers", True)
        self.papers_directory = Path(self.config.get("papers_directory", "/home/kade/runeset/reynard/backend/data/papers"))
        self.rag_index_directory = self.papers_directory / "rag_index"
        
        # Services
        self.categorization_service: Optional[DocumentCategorizationService] = None
        
        # Metrics
        self.metrics = {
            "papers_processed": 0,
            "papers_categorized": 0,
            "categorization_errors": 0,
            "domain_distribution": {},
            "processing_errors": 0
        }
    
    async def initialize(self) -> bool:
        """Initialize the paper indexing integration service."""
        try:
            self.update_status(ServiceStatus.INITIALIZING, "Initializing paper indexing integration")
            
            # Initialize categorization service
            if self.auto_categorize:
                self.categorization_service = DocumentCategorizationService(self.config)
                await self.categorization_service.initialize()
            
            # Create directories
            self.rag_index_directory.mkdir(parents=True, exist_ok=True)
            
            # Initialize metrics
            self.metrics = {
                "papers_processed": 0,
                "papers_categorized": 0,
                "categorization_errors": 0,
                "domain_distribution": {},
                "processing_errors": 0
            }
            
            self.update_status(ServiceStatus.HEALTHY, "Paper indexing integration initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize paper indexing integration: {e}")
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False
    
    async def process_paper_for_rag(
        self,
        paper_id: str,
        metadata: Dict[str, Any],
        force_reprocess: bool = False
    ) -> Dict[str, Any]:
        """Process a single paper for RAG indexing with automatic categorization."""
        
        # Check if already processed
        rag_metadata_path = self.rag_index_directory / f"{paper_id}_rag_metadata.json"
        if rag_metadata_path.exists() and not force_reprocess:
            try:
                with open(rag_metadata_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                self.logger.warning(f"Failed to load existing RAG metadata for {paper_id}: {e}")
        
        try:
            self.metrics["papers_processed"] += 1
            
            # Categorize the paper if enabled
            categorization = None
            if self.auto_categorize and self.categorization_service:
                try:
                    categorization = await self.categorization_service.categorize_paper_from_metadata(metadata)
                    if categorization:
                        self.metrics["papers_categorized"] += 1
                        domain = categorization.primary_domain.value
                        self.metrics["domain_distribution"][domain] = self.metrics["domain_distribution"].get(domain, 0) + 1
                    else:
                        self.metrics["categorization_errors"] += 1
                except Exception as e:
                    self.logger.error(f"Failed to categorize paper {paper_id}: {e}")
                    self.metrics["categorization_errors"] += 1
            
            # Create RAG metadata
            rag_metadata = {
                "paper_id": paper_id,
                "original_metadata": metadata,
                "processing_timestamp": datetime.now().isoformat(),
                "rag_ready": {
                    "indexed": False,  # Will be set to True when actually indexed in RAG
                    "searchable": True,
                    "auto_categorized": categorization is not None
                },
                "file_paths": {
                    "pdf_path": metadata.get('pdf_path', ''),
                    "metadata_path": str(Path(metadata.get('pdf_path', '')).parent / "metadata.json"),
                    "rag_metadata_path": str(rag_metadata_path)
                }
            }
            
            # Add categorization data if available
            if categorization:
                rag_metadata["categorization"] = {
                    "primary_domain": categorization.primary_domain.value,
                    "secondary_domains": [d.value for d in categorization.secondary_domains],
                    "confidence": categorization.confidence,
                    "keywords": categorization.keywords,
                    "arxiv_categories": categorization.arxiv_categories,
                    "reasoning": categorization.reasoning,
                    "domain_tags": categorization.domain_tags
                }
                
                # Add search enhancement data
                rag_metadata["search_enhancement"] = {
                    "search_keywords": self._generate_search_keywords(metadata, categorization),
                    "domain_tags": categorization.domain_tags,
                    "confidence_score": categorization.confidence,
                    "categorization_timestamp": datetime.now().isoformat()
                }
            
            # Save RAG metadata
            with open(rag_metadata_path, 'w') as f:
                json.dump(rag_metadata, f, indent=2)
            
            domain = categorization.primary_domain.value if categorization else 'uncategorized'
            confidence = categorization.confidence if categorization else 0.0
            self.logger.info(f"Processed paper {paper_id} for RAG: {domain} (confidence: {confidence:.2f})")
            
            return rag_metadata
            
        except Exception as e:
            self.metrics["processing_errors"] += 1
            self.logger.error(f"Failed to process paper {paper_id} for RAG: {e}")
            return {
                "paper_id": paper_id,
                "error": str(e),
                "rag_ready": {"indexed": False, "searchable": False}
            }
    
    def _generate_search_keywords(
        self,
        metadata: Dict[str, Any],
        categorization: DocumentCategory
    ) -> List[str]:
        """Generate search keywords for enhanced discoverability."""
        keywords = set()
        
        # Add title words
        title_words = metadata.get('title', '').lower().split()
        keywords.update([w for w in title_words if len(w) > 3])
        
        # Add author names (last names)
        for author in metadata.get('authors', []):
            if author:
                last_name = author.split()[-1].lower()
                if len(last_name) > 2:
                    keywords.add(last_name)
        
        # Add category keywords
        keywords.update(categorization.keywords)
        
        # Add arXiv categories
        keywords.update(metadata.get('categories', []))
        
        # Add domain tags
        keywords.update(categorization.domain_tags)
        
        return list(keywords)
    
    async def batch_process_papers(
        self,
        papers_directory: Optional[Path] = None,
        max_papers: Optional[int] = None,
        force_reprocess: bool = False
    ) -> Dict[str, Any]:
        """Batch process all papers for RAG indexing with automatic categorization."""
        
        if papers_directory is None:
            papers_directory = self.papers_directory / "arxiv"
        
        # Find all metadata files
        metadata_files = list(papers_directory.rglob("metadata.json"))
        
        if max_papers:
            metadata_files = metadata_files[:max_papers]
        
        self.logger.info(f"Processing {len(metadata_files)} papers for RAG indexing with categorization")
        
        results = {
            "processed": 0,
            "failed": 0,
            "skipped": 0,
            "papers": {},
            "domain_statistics": {},
            "processing_summary": {}
        }
        
        for metadata_file in metadata_files:
            try:
                # Load metadata
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                
                paper_id = metadata.get('paper_id', metadata_file.parent.name)
                
                # Process paper
                rag_metadata = await self.process_paper_for_rag(
                    paper_id, 
                    metadata, 
                    force_reprocess
                )
                
                if "error" in rag_metadata:
                    results["failed"] += 1
                    results["papers"][paper_id] = {"status": "failed", "error": rag_metadata["error"]}
                else:
                    results["processed"] += 1
                    categorization = rag_metadata.get("categorization", {})
                    results["papers"][paper_id] = {
                        "status": "processed",
                        "domain": categorization.get("primary_domain", "uncategorized"),
                        "confidence": categorization.get("confidence", 0.0)
                    }
                
            except Exception as e:
                self.logger.error(f"Error processing {metadata_file}: {e}")
                results["failed"] += 1
                results["papers"][metadata_file.parent.name] = {"status": "failed", "error": str(e)}
        
        # Generate domain statistics
        domain_counts = {}
        confidence_scores = {}
        
        for paper_id, paper_info in results["papers"].items():
            if paper_info["status"] == "processed":
                domain = paper_info["domain"]
                confidence = paper_info["confidence"]
                
                domain_counts[domain] = domain_counts.get(domain, 0) + 1
                if domain not in confidence_scores:
                    confidence_scores[domain] = []
                confidence_scores[domain].append(confidence)
        
        # Calculate average confidence per domain
        avg_confidence = {}
        for domain, scores in confidence_scores.items():
            avg_confidence[domain] = sum(scores) / len(scores)
        
        results["domain_statistics"] = {
            "domain_distribution": domain_counts,
            "average_confidence_by_domain": avg_confidence,
            "total_domains": len(domain_counts)
        }
        
        results["processing_summary"] = {
            "total_papers": len(metadata_files),
            "successfully_processed": results["processed"],
            "failed": results["failed"],
            "success_rate": results["processed"] / len(metadata_files) * 100 if metadata_files else 0,
            "processing_timestamp": datetime.now().isoformat()
        }
        
        # Save batch processing results
        results_file = self.rag_index_directory / "batch_processing_results.json"
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        self.logger.info(f"Batch processing completed: {results['processed']} processed, {results['failed']} failed")
        
        return results
    
    async def get_rag_ready_papers(
        self,
        domain_filter: Optional[ScientificDomain] = None,
        min_confidence: float = 0.0,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get papers that are ready for RAG indexing."""
        
        rag_metadata_files = list(self.rag_index_directory.glob("*_rag_metadata.json"))
        ready_papers = []
        
        for metadata_file in rag_metadata_files:
            try:
                with open(metadata_file, 'r') as f:
                    rag_metadata = json.load(f)
                
                # Apply filters
                if not rag_metadata.get("rag_ready", {}).get("searchable", False):
                    continue
                
                categorization = rag_metadata.get("categorization", {})
                confidence = categorization.get("confidence", 0.0)
                
                if confidence < min_confidence:
                    continue
                
                if domain_filter:
                    primary_domain = categorization.get("primary_domain")
                    if primary_domain != domain_filter.value:
                        continue
                
                ready_papers.append(rag_metadata)
                
                if limit and len(ready_papers) >= limit:
                    break
                    
            except Exception as e:
                self.logger.error(f"Error reading RAG metadata {metadata_file}: {e}")
        
        # Sort by confidence descending
        ready_papers.sort(
            key=lambda x: x.get("categorization", {}).get("confidence", 0.0),
            reverse=True
        )
        
        return ready_papers
    
    async def generate_rag_index_summary(self) -> Dict[str, Any]:
        """Generate a summary of the RAG index."""
        
        rag_metadata_files = list(self.rag_index_directory.glob("*_rag_metadata.json"))
        
        summary = {
            "total_papers": len(rag_metadata_files),
            "domain_distribution": {},
            "confidence_distribution": {"high": 0, "medium": 0, "low": 0},
            "processing_status": {"processed": 0, "failed": 0},
            "categorization_status": {"categorized": 0, "uncategorized": 0},
            "generated_at": datetime.now().isoformat()
        }
        
        for metadata_file in rag_metadata_files:
            try:
                with open(metadata_file, 'r') as f:
                    rag_metadata = json.load(f)
                
                # Domain distribution
                domain = rag_metadata.get("categorization", {}).get("primary_domain", "uncategorized")
                summary["domain_distribution"][domain] = summary["domain_distribution"].get(domain, 0) + 1
                
                # Confidence distribution
                confidence = rag_metadata.get("categorization", {}).get("confidence", 0.0)
                if confidence >= 0.7:
                    summary["confidence_distribution"]["high"] += 1
                elif confidence >= 0.4:
                    summary["confidence_distribution"]["medium"] += 1
                else:
                    summary["confidence_distribution"]["low"] += 1
                
                # Processing status
                if "error" in rag_metadata:
                    summary["processing_status"]["failed"] += 1
                else:
                    summary["processing_status"]["processed"] += 1
                
                # Categorization status
                if rag_metadata.get("categorization"):
                    summary["categorization_status"]["categorized"] += 1
                else:
                    summary["categorization_status"]["uncategorized"] += 1
                    
            except Exception as e:
                self.logger.error(f"Error processing summary for {metadata_file}: {e}")
        
        return summary
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get integration service statistics."""
        stats = {
            "service_status": self.status.value,
            "enabled": self.enabled,
            "auto_categorize": self.auto_categorize,
            "metrics": self.metrics.copy()
        }
        
        if self.categorization_service:
            stats["categorization_service"] = self.categorization_service.get_statistics()
        
        return stats
    
    def get_stats(self) -> Dict[str, Any]:
        """Get service statistics (required by BaseService)."""
        return self.get_statistics()
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check (required by BaseService)."""
        return {
            "status": "healthy" if self.status == ServiceStatus.HEALTHY else "unhealthy",
            "service": "paper-indexing-integration",
            "enabled": self.enabled,
            "auto_categorize": self.auto_categorize,
            "papers_processed": self.metrics["papers_processed"]
        }
    
    async def shutdown(self) -> None:
        """Shutdown the service (required by BaseService)."""
        if self.categorization_service:
            await self.categorization_service.shutdown()
        await super().shutdown()
