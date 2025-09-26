#!/usr/bin/env python3
"""
Paper Indexing Integration Service
=================================

Integrates document categorization with the existing RAG indexing system,
providing strategic organization of academic papers for optimal search and retrieval.

🦊 Fox approach: We strategically integrate categorization with the cunning precision
of a fox, ensuring every paper finds its perfect place in the knowledge ecosystem!
"""

import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import aiofiles

from ..pdf_processor import PDFProcessorService
from .document_categorization_service import (
    DocumentCategorizationService,
    DocumentCategory,
    ScientificDomain,
    categorization_service,
)

logger = logging.getLogger(__name__)


class PaperIndexingIntegration:
    """Integrates paper categorization with RAG indexing system."""

    def __init__(self):
        self.categorization_service = categorization_service
        self.pdf_processor = PDFProcessorService()
        from app.core.project_root import get_papers_directory

        self.papers_base_dir = get_papers_directory()
        self.rag_index_dir = self.papers_base_dir / "rag_index"
        self.categorization_cache = {}

        # Create directories
        self.rag_index_dir.mkdir(parents=True, exist_ok=True)

    async def process_paper_for_rag(
        self, paper_id: str, metadata: Dict[str, Any], force_reprocess: bool = False
    ) -> Dict[str, Any]:
        """Process a single paper for RAG indexing with categorization."""

        # Check if already processed
        rag_metadata_path = self.rag_index_dir / f"{paper_id}_rag_metadata.json"
        if rag_metadata_path.exists() and not force_reprocess:
            async with aiofiles.open(rag_metadata_path, 'r') as f:
                return json.loads(await f.read())

        try:
            # Categorize the paper
            category = await self.categorization_service.categorize_document(
                title=metadata.get('title', ''),
                abstract=metadata.get('abstract', ''),
                arxiv_categories=metadata.get('categories', []),
                authors=metadata.get('authors', []),
            )

            # Process PDF content if available
            pdf_path = Path(metadata.get('pdf_path', ''))
            processed_content = None
            content_chunks = []

            if pdf_path.exists():
                try:
                    # Extract text from PDF
                    processed_content = (
                        await self.pdf_processor.process_pdf_to_markdown(str(pdf_path))
                    )

                    # Create content chunks for RAG
                    content_chunks = self._create_content_chunks(
                        processed_content, paper_id, category
                    )

                except Exception as e:
                    logger.warning(f"Failed to process PDF content for {paper_id}: {e}")

            # Create RAG metadata
            rag_metadata = {
                "paper_id": paper_id,
                "original_metadata": metadata,
                "categorization": {
                    "primary_domain": category.primary_domain.value,
                    "secondary_domains": [d.value for d in category.secondary_domains],
                    "confidence": category.confidence,
                    "keywords": category.keywords,
                    "arxiv_categories": category.arxiv_categories,
                    "reasoning": category.reasoning,
                },
                "content_processing": {
                    "has_processed_content": processed_content is not None,
                    "content_length": (
                        len(processed_content) if processed_content else 0
                    ),
                    "chunk_count": len(content_chunks),
                    "processing_timestamp": datetime.now().isoformat(),
                },
                "rag_ready": {
                    "indexed": False,  # Will be set to True when actually indexed in RAG
                    "searchable": True,
                    "domain_tags": self._generate_domain_tags(category),
                    "search_keywords": self._generate_search_keywords(
                        metadata, category
                    ),
                },
                "file_paths": {
                    "pdf_path": str(pdf_path),
                    "metadata_path": str(
                        Path(metadata.get('pdf_path', '')).parent / "metadata.json"
                    ),
                    "rag_metadata_path": str(rag_metadata_path),
                },
            }

            # Save RAG metadata
            async with aiofiles.open(rag_metadata_path, 'w') as f:
                await f.write(json.dumps(rag_metadata, indent=2))

            # Save content chunks if available
            if content_chunks:
                chunks_path = self.rag_index_dir / f"{paper_id}_chunks.json"
                async with aiofiles.open(chunks_path, 'w') as f:
                    await f.write(json.dumps(content_chunks, indent=2))

            logger.info(
                f"Processed paper {paper_id} for RAG: {category.primary_domain.value} (confidence: {category.confidence:.2f})"
            )

            return rag_metadata

        except Exception as e:
            logger.error(f"Failed to process paper {paper_id} for RAG: {e}")
            return {
                "paper_id": paper_id,
                "error": str(e),
                "rag_ready": {"indexed": False, "searchable": False},
            }

    def _create_content_chunks(
        self, content: str, paper_id: str, category: DocumentCategory
    ) -> List[Dict[str, Any]]:
        """Create content chunks optimized for RAG search."""

        # Simple chunking strategy - can be enhanced with more sophisticated methods
        chunk_size = 1000  # characters
        overlap = 200  # characters

        chunks = []
        start = 0
        chunk_index = 0

        while start < len(content):
            end = min(start + chunk_size, len(content))

            # Try to break at sentence boundaries
            if end < len(content):
                # Look for sentence endings within the last 100 characters
                search_start = max(start + chunk_size - 100, start)
                for i in range(end - 1, search_start, -1):
                    if content[i] in '.!?':
                        end = i + 1
                        break

            chunk_text = content[start:end].strip()

            if chunk_text:
                chunk = {
                    "chunk_id": f"{paper_id}_chunk_{chunk_index}",
                    "paper_id": paper_id,
                    "chunk_index": chunk_index,
                    "text": chunk_text,
                    "metadata": {
                        "primary_domain": category.primary_domain.value,
                        "secondary_domains": [
                            d.value for d in category.secondary_domains
                        ],
                        "keywords": category.keywords,
                        "arxiv_categories": category.arxiv_categories,
                        "chunk_length": len(chunk_text),
                        "start_position": start,
                        "end_position": end,
                    },
                }
                chunks.append(chunk)
                chunk_index += 1

            start = max(start + chunk_size - overlap, end)

        return chunks

    def _generate_domain_tags(self, category: DocumentCategory) -> List[str]:
        """Generate domain tags for search and filtering."""
        tags = [category.primary_domain.value]
        tags.extend([d.value for d in category.secondary_domains])
        tags.extend(category.keywords[:5])  # Top 5 keywords as tags
        return list(set(tags))  # Remove duplicates

    def _generate_search_keywords(
        self, metadata: Dict[str, Any], category: DocumentCategory
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
        keywords.update(category.keywords)

        # Add arXiv categories
        keywords.update(metadata.get('categories', []))

        return list(keywords)

    async def batch_process_papers(
        self,
        papers_directory: Optional[Path] = None,
        max_papers: Optional[int] = None,
        force_reprocess: bool = False,
    ) -> Dict[str, Any]:
        """Batch process all papers for RAG indexing."""

        if papers_directory is None:
            papers_directory = self.papers_base_dir / "arxiv"

        # Find all metadata files
        metadata_files = list(papers_directory.rglob("metadata.json"))

        if max_papers:
            metadata_files = metadata_files[:max_papers]

        logger.info(f"Processing {len(metadata_files)} papers for RAG indexing")

        results = {
            "processed": 0,
            "failed": 0,
            "skipped": 0,
            "papers": {},
            "domain_statistics": {},
            "processing_summary": {},
        }

        for metadata_file in metadata_files:
            try:
                # Load metadata
                async with aiofiles.open(metadata_file, 'r') as f:
                    metadata = json.loads(await f.read())

                paper_id = metadata.get('paper_id', metadata_file.parent.name)

                # Process paper
                rag_metadata = await self.process_paper_for_rag(
                    paper_id, metadata, force_reprocess
                )

                if "error" in rag_metadata:
                    results["failed"] += 1
                    results["papers"][paper_id] = {
                        "status": "failed",
                        "error": rag_metadata["error"],
                    }
                else:
                    results["processed"] += 1
                    results["papers"][paper_id] = {
                        "status": "processed",
                        "domain": rag_metadata["categorization"]["primary_domain"],
                        "confidence": rag_metadata["categorization"]["confidence"],
                    }

            except Exception as e:
                logger.error(f"Error processing {metadata_file}: {e}")
                results["failed"] += 1
                results["papers"][metadata_file.parent.name] = {
                    "status": "failed",
                    "error": str(e),
                }

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
            "total_domains": len(domain_counts),
        }

        results["processing_summary"] = {
            "total_papers": len(metadata_files),
            "successfully_processed": results["processed"],
            "failed": results["failed"],
            "success_rate": (
                results["processed"] / len(metadata_files) * 100
                if metadata_files
                else 0
            ),
            "processing_timestamp": datetime.now().isoformat(),
        }

        # Save batch processing results
        results_file = self.rag_index_dir / "batch_processing_results.json"
        async with aiofiles.open(results_file, 'w') as f:
            await f.write(json.dumps(results, indent=2))

        logger.info(
            f"Batch processing completed: {results['processed']} processed, {results['failed']} failed"
        )

        return results

    async def get_rag_ready_papers(
        self,
        domain_filter: Optional[ScientificDomain] = None,
        min_confidence: float = 0.0,
        limit: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Get papers that are ready for RAG indexing."""

        rag_metadata_files = list(self.rag_index_dir.glob("*_rag_metadata.json"))
        ready_papers = []

        for metadata_file in rag_metadata_files:
            try:
                async with aiofiles.open(metadata_file, 'r') as f:
                    rag_metadata = json.loads(await f.read())

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
                logger.error(f"Error reading RAG metadata {metadata_file}: {e}")

        # Sort by confidence descending
        ready_papers.sort(
            key=lambda x: x.get("categorization", {}).get("confidence", 0.0),
            reverse=True,
        )

        return ready_papers

    async def generate_rag_index_summary(self) -> Dict[str, Any]:
        """Generate a summary of the RAG index."""

        rag_metadata_files = list(self.rag_index_dir.glob("*_rag_metadata.json"))

        summary = {
            "total_papers": len(rag_metadata_files),
            "domain_distribution": {},
            "confidence_distribution": {"high": 0, "medium": 0, "low": 0},
            "processing_status": {"processed": 0, "failed": 0},
            "content_availability": {"with_content": 0, "without_content": 0},
            "generated_at": datetime.now().isoformat(),
        }

        for metadata_file in rag_metadata_files:
            try:
                async with aiofiles.open(metadata_file, 'r') as f:
                    rag_metadata = json.loads(await f.read())

                # Domain distribution
                domain = rag_metadata.get("categorization", {}).get(
                    "primary_domain", "unknown"
                )
                summary["domain_distribution"][domain] = (
                    summary["domain_distribution"].get(domain, 0) + 1
                )

                # Confidence distribution
                confidence = rag_metadata.get("categorization", {}).get(
                    "confidence", 0.0
                )
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

                # Content availability
                has_content = rag_metadata.get("content_processing", {}).get(
                    "has_processed_content", False
                )
                if has_content:
                    summary["content_availability"]["with_content"] += 1
                else:
                    summary["content_availability"]["without_content"] += 1

            except Exception as e:
                logger.error(f"Error processing summary for {metadata_file}: {e}")

        return summary


# Global service instance
paper_indexing_integration = PaperIndexingIntegration()
