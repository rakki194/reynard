#!/usr/bin/env python3
"""
RAG Integration for Academic Papers
==================================

Service for integrating academic papers with Reynard's RAG system.
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiohttp
from protocol.tool_registry import register_tool

logger = logging.getLogger(__name__)


class RAGIntegrationService:
    """Service for integrating academic papers with Reynard's RAG system."""

    def __init__(self):
        self.rag_base_url = "http://localhost:8000"  # Reynard backend URL
        self.timeout = 30

    async def ingest_paper_to_rag(
        self, paper_path: str, metadata: Dict[str, Any], extract_text: bool = True
    ) -> Dict[str, Any]:
        """Ingest a paper into the RAG system."""
        try:
            # Prepare ingestion request
            ingest_request = {
                "documents": [
                    {
                        "source": paper_path,
                        "content": "",  # Will be filled if extract_text is True
                        "metadata": {
                            "paper_id": metadata.get("paper_id"),
                            "title": metadata.get("title"),
                            "authors": metadata.get("authors", []),
                            "abstract": metadata.get("abstract", ""),
                            "categories": metadata.get("categories", []),
                            "published_date": metadata.get("published_date"),
                            "source": metadata.get("source", "unknown"),
                            "document_type": "academic_paper",
                        },
                    }
                ],
                "chunk_size": 1000,
                "chunk_overlap": 150,
                "force_reindex": False,
            }

            # Extract text from PDF if requested
            if extract_text and paper_path.endswith('.pdf'):
                text_content = await self._extract_pdf_text(paper_path)
                if text_content:
                    ingest_request["documents"][0]["content"] = text_content

            # Send to RAG backend
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.rag_base_url}/api/rag/ingest",
                    json=ingest_request,
                    timeout=aiohttp.ClientTimeout(total=self.timeout),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "ingested_documents": result.get("ingested_documents", 0),
                            "total_chunks": result.get("total_chunks", 0),
                            "message": "Paper successfully ingested into RAG system",
                        }
                    else:
                        error_text = await response.text()
                        return {
                            "success": False,
                            "error": f"RAG ingestion failed: {response.status} - {error_text}",
                        }

        except Exception as e:
            logger.exception("Failed to ingest paper to RAG")
            return {"success": False, "error": str(e)}

    async def _extract_pdf_text(self, pdf_path: str) -> Optional[str]:
        """Extract text from PDF file."""
        try:
            # This is a placeholder - in a real implementation, you'd use
            # a PDF text extraction library like PyPDF2, pdfplumber, or pymupdf
            logger.info(f"Extracting text from PDF: {pdf_path}")

            # For now, return a placeholder
            # TODO: Implement actual PDF text extraction
            return "PDF text extraction not yet implemented"

        except Exception as e:
            logger.error(f"Failed to extract PDF text: {e}")
            return None

    async def search_papers_in_rag(
        self,
        query: str,
        search_type: str = "hybrid",
        top_k: int = 20,
        similarity_threshold: float = 0.7,
    ) -> Dict[str, Any]:
        """Search for papers in the RAG system."""
        try:
            search_request = {
                "q": query,
                "modality": search_type,
                "top_k": top_k,
                "similarity_threshold": similarity_threshold,
                "enable_reranking": True,
                "filters": {"document_type": "academic_paper"},
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.rag_base_url}/api/rag/query",
                    json=search_request,
                    timeout=aiohttp.ClientTimeout(total=self.timeout),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "query": query,
                            "total_results": result.get("total_results", 0),
                            "results": result.get("results", []),
                            "search_time": result.get("search_time", 0),
                        }
                    else:
                        error_text = await response.text()
                        return {
                            "success": False,
                            "error": f"RAG search failed: {response.status} - {error_text}",
                        }

        except Exception as e:
            logger.exception("Failed to search papers in RAG")
            return {"success": False, "error": str(e)}

    async def get_rag_stats(self) -> Dict[str, Any]:
        """Get statistics about the RAG system."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.rag_base_url}/api/rag/stats",
                    timeout=aiohttp.ClientTimeout(total=self.timeout),
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        return {
                            "success": False,
                            "error": f"Failed to get RAG stats: {response.status}",
                        }

        except Exception as e:
            logger.exception("Failed to get RAG stats")
            return {"success": False, "error": str(e)}


# Initialize service
rag_service = RAGIntegrationService()


@register_tool(
    name="ingest_paper_to_rag",
    category="research",
    description="Ingest an academic paper into Reynard's RAG system for semantic search",
)
def ingest_paper_to_rag(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Ingest a paper into the RAG system."""
    paper_path = arguments.get("paper_path", "")
    metadata = arguments.get("metadata", {})
    extract_text = arguments.get("extract_text", True)

    if not paper_path:
        return {
            "content": [{"type": "text", "text": "❌ Error: Paper path is required"}]
        }

    # Run async ingestion
    result = asyncio.run(
        rag_service.ingest_paper_to_rag(
            paper_path=paper_path, metadata=metadata, extract_text=extract_text
        )
    )

    if result["success"]:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"✅ Paper successfully ingested into RAG system:\n\n"
                    f"**Documents ingested:** {result['ingested_documents']}\n"
                    f"**Total chunks:** {result['total_chunks']}\n"
                    f"**Message:** {result['message']}",
                }
            ]
        }
    else:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Failed to ingest paper: {result['error']}",
                }
            ]
        }


@register_tool(
    name="search_papers_in_rag",
    category="research",
    description="Search for academic papers in Reynard's RAG system using semantic search",
)
def search_papers_in_rag(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Search for papers in the RAG system."""
    query = arguments.get("query", "")
    search_type = arguments.get("search_type", "hybrid")
    top_k = arguments.get("top_k", 20)
    similarity_threshold = arguments.get("similarity_threshold", 0.7)

    if not query:
        return {
            "content": [{"type": "text", "text": "❌ Error: Search query is required"}]
        }

    # Run async search
    result = asyncio.run(
        rag_service.search_papers_in_rag(
            query=query,
            search_type=search_type,
            top_k=top_k,
            similarity_threshold=similarity_threshold,
        )
    )

    if result["success"]:
        results = result["results"]
        if results:
            formatted_results = []
            for i, paper in enumerate(results[:10], 1):  # Show top 10
                metadata = paper.get("metadata", {})
                formatted_results.append(
                    f"{i}. **{metadata.get('title', 'Unknown Title')}**\n"
                    f"   Authors: {', '.join(metadata.get('authors', [])[:3])}{'...' if len(metadata.get('authors', [])) > 3 else ''}\n"
                    f"   Source: {metadata.get('source', 'Unknown')}\n"
                    f"   Similarity: {paper.get('similarity', 0):.3f}\n"
                    f"   Snippet: {paper.get('text', '')[:200]}...\n"
                )

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Found {result['total_results']} papers in RAG system for query: '{query}'\n\n"
                        f"**Search time:** {result['search_time']:.3f}s\n\n"
                        f"**Top Results:**\n\n" + "\n".join(formatted_results),
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ No papers found in RAG system for query: '{query}'",
                    }
                ]
            }
    else:
        return {
            "content": [
                {"type": "text", "text": f"❌ RAG search failed: {result['error']}"}
            ]
        }


@register_tool(
    name="get_rag_paper_stats",
    category="research",
    description="Get statistics about academic papers in Reynard's RAG system",
)
def get_rag_paper_stats(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Get RAG system statistics."""
    # Run async stats retrieval
    result = asyncio.run(rag_service.get_rag_stats())

    if result.get("success", True):  # Assume success if no error field
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"✅ RAG System Statistics:\n\n"
                    f"**Total documents:** {result.get('total_documents', 'Unknown')}\n"
                    f"**Total chunks:** {result.get('total_chunks', 'Unknown')}\n"
                    f"**Embedding model:** {result.get('embedding_model', 'Unknown')}\n"
                    f"**Vector dimensions:** {result.get('vector_dimensions', 'Unknown')}\n"
                    f"**Last updated:** {result.get('last_updated', 'Unknown')}",
                }
            ]
        }
    else:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Failed to get RAG stats: {result.get('error', 'Unknown error')}",
                }
            ]
        }
