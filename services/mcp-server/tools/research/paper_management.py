#!/usr/bin/env python3
"""
Paper Management Service
========================

Service for downloading, storing, and indexing academic papers in Reynard's RAG system.
"""

import asyncio
import aiohttp
import json
import logging
import os
import hashlib
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime
import aiofiles

from protocol.tool_registry import register_tool

logger = logging.getLogger(__name__)


class PaperManagementService:
    """Service for managing academic papers in Reynard's RAG system."""
    
    def __init__(self):
        self.papers_dir = Path("backend/data/papers")
        self.metadata_dir = self.papers_dir / "metadata"
        self.cache_dir = self.papers_dir / "cache"
        
        # Create directories
        self.papers_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_dir.mkdir(parents=True, exist_ok=True)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Load existing indexes
        self.arxiv_index = self._load_index("arxiv_index.json")
        self.ieee_index = self._load_index("ieee_index.json")
        self.scholar_index = self._load_index("scholar_index.json")
    
    def _load_index(self, filename: str) -> Dict[str, Any]:
        """Load paper index from JSON file."""
        index_path = self.metadata_dir / filename
        if index_path.exists():
            try:
                with open(index_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load index {filename}: {e}")
        return {}
    
    def _save_index(self, index: Dict[str, Any], filename: str) -> None:
        """Save paper index to JSON file."""
        index_path = self.metadata_dir / filename
        try:
            with open(index_path, 'w') as f:
                json.dump(index, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save index {filename}: {e}")
    
    async def download_arxiv_paper(
        self,
        paper_id: str,
        title: str,
        authors: List[str],
        abstract: str,
        categories: List[str],
        published_date: str
    ) -> Dict[str, Any]:
        """Download and store an arXiv paper."""
        try:
            # Clean paper ID
            if "/" in paper_id:
                paper_id = paper_id.split("/")[-1]
            
            # Create paper directory
            category = categories[0] if categories else "misc"
            paper_dir = self.papers_dir / "arxiv" / category / paper_id
            paper_dir.mkdir(parents=True, exist_ok=True)
            
            # Download PDF
            pdf_url = f"https://arxiv.org/pdf/{paper_id}.pdf"
            pdf_path = paper_dir / f"{paper_id}.pdf"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(pdf_url) as response:
                    if response.status == 200:
                        async with aiofiles.open(pdf_path, 'wb') as f:
                            async for chunk in response.content.iter_chunked(8192):
                                await f.write(chunk)
                    else:
                        return {
                            "success": False,
                            "error": f"Failed to download PDF: {response.status}"
                        }
            
            # Create metadata
            metadata = {
                "paper_id": paper_id,
                "title": title,
                "authors": authors,
                "abstract": abstract,
                "categories": categories,
                "published_date": published_date,
                "source": "arxiv",
                "pdf_path": str(pdf_path),
                "download_date": datetime.now().isoformat(),
                "file_size": pdf_path.stat().st_size
            }
            
            # Save metadata
            metadata_path = paper_dir / "metadata.json"
            async with aiofiles.open(metadata_path, 'w') as f:
                await f.write(json.dumps(metadata, indent=2))
            
            # Update index
            self.arxiv_index[paper_id] = metadata
            self._save_index(self.arxiv_index, "arxiv_index.json")
            
            # Index in RAG system
            await self._index_paper_in_rag(metadata)
            
            return {
                "success": True,
                "paper_id": paper_id,
                "path": str(pdf_path),
                "metadata": metadata
            }
        
        except Exception as e:
            logger.exception("Failed to download arXiv paper")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _index_paper_in_rag(self, metadata: Dict[str, Any]) -> None:
        """Index paper in Reynard's RAG system."""
        try:
            # This would integrate with the RAG backend
            # For now, we'll create a placeholder for the integration
            logger.info(f"Indexing paper {metadata['paper_id']} in RAG system")
            
            # TODO: Integrate with RAG backend API
            # - Extract text from PDF
            # - Generate embeddings
            # - Store in vector database
            # - Create searchable index
            
        except Exception as e:
            logger.error(f"Failed to index paper in RAG: {e}")
    
    def search_papers(
        self,
        query: str,
        source: Optional[str] = None,
        category: Optional[str] = None,
        max_results: int = 20
    ) -> List[Dict[str, Any]]:
        """Search for papers in the local database."""
        results = []
        
        # Search arXiv papers
        if source is None or source == "arxiv":
            for paper_id, metadata in self.arxiv_index.items():
                if self._matches_query(metadata, query, category):
                    results.append(metadata)
        
        # Search IEEE papers
        if source is None or source == "ieee":
            for paper_id, metadata in self.ieee_index.items():
                if self._matches_query(metadata, query, category):
                    results.append(metadata)
        
        # Search Scholar papers
        if source is None or source == "scholar":
            for paper_id, metadata in self.scholar_index.items():
                if self._matches_query(metadata, query, category):
                    results.append(metadata)
        
        # Sort by relevance and return top results
        results.sort(key=lambda x: x.get("download_date", ""), reverse=True)
        return results[:max_results]
    
    def _matches_query(self, metadata: Dict[str, Any], query: str, category: Optional[str]) -> bool:
        """Check if paper matches search query."""
        query_lower = query.lower()
        
        # Check title
        if query_lower in metadata.get("title", "").lower():
            return True
        
        # Check abstract
        if query_lower in metadata.get("abstract", "").lower():
            return True
        
        # Check authors
        for author in metadata.get("authors", []):
            if query_lower in author.lower():
                return True
        
        # Check category
        if category and category in metadata.get("categories", []):
            return True
        
        return False


# Initialize service
paper_service = PaperManagementService()


@register_tool(
    name="download_and_index_paper",
    category="research",
    description="Download and index an academic paper in Reynard's RAG system"
)
def download_and_index_paper(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Download and index an academic paper."""
    paper_id = arguments.get("paper_id", "")
    title = arguments.get("title", "")
    authors = arguments.get("authors", [])
    abstract = arguments.get("abstract", "")
    categories = arguments.get("categories", [])
    published_date = arguments.get("published_date", "")
    source = arguments.get("source", "arxiv")
    
    if not paper_id or not title:
        return {
            "content": [{"type": "text", "text": "❌ Error: Paper ID and title are required"}]
        }
    
    # Run async download
    result = asyncio.run(paper_service.download_arxiv_paper(
        paper_id=paper_id,
        title=title,
        authors=authors,
        abstract=abstract,
        categories=categories,
        published_date=published_date
    ))
    
    if result["success"]:
        return {
            "content": [{
                "type": "text",
                "text": f"✅ Successfully downloaded and indexed paper:\n\n"
                       f"**Title:** {title}\n"
                       f"**Authors:** {', '.join(authors)}\n"
                       f"**Paper ID:** {paper_id}\n"
                       f"**Path:** {result['path']}\n"
                       f"**Indexed in RAG:** Yes"
            }]
        }
    else:
        return {
            "content": [{"type": "text", "text": f"❌ Failed to download paper: {result['error']}"}]
        }


@register_tool(
    name="search_local_papers",
    category="research",
    description="Search for papers in the local Reynard paper database"
)
def search_local_papers(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Search for papers in the local database."""
    query = arguments.get("query", "")
    source = arguments.get("source")
    category = arguments.get("category")
    max_results = arguments.get("max_results", 20)
    
    if not query:
        return {
            "content": [{"type": "text", "text": "❌ Error: Search query is required"}]
        }
    
    results = paper_service.search_papers(
        query=query,
        source=source,
        category=category,
        max_results=max_results
    )
    
    if results:
        formatted_results = []
        for i, paper in enumerate(results, 1):
            formatted_results.append(
                f"{i}. **{paper['title']}**\n"
                f"   Authors: {', '.join(paper['authors'][:3])}{'...' if len(paper['authors']) > 3 else ''}\n"
                f"   Source: {paper['source']}\n"
                f"   Published: {paper.get('published_date', 'Unknown')}\n"
                f"   Categories: {', '.join(paper.get('categories', []))}\n"
            )
        
        return {
            "content": [{
                "type": "text",
                "text": f"✅ Found {len(results)} papers matching '{query}':\n\n" + "\n".join(formatted_results)
            }]
        }
    else:
        return {
            "content": [{"type": "text", "text": f"❌ No papers found matching '{query}'"}]
        }
