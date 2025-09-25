#!/usr/bin/env python3
"""
arXiv Integration Tools
======================

Tools for searching and downloading papers from arXiv.org.
"""

import asyncio
import aiohttp
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, date
from urllib.parse import urlencode

from protocol.tool_registry import register_tool

logger = logging.getLogger(__name__)


class ArxivService:
    """Service for interacting with arXiv API."""
    
    def __init__(self):
        self.base_url = "http://export.arxiv.org/api/query"
        self.timeout = 30
    
    async def search_papers(
        self,
        query: str,
        categories: Optional[List[str]] = None,
        max_results: int = 50,
        sort_by: str = "relevance",
        date_range: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Search arXiv for papers."""
        try:
            # Build search parameters
            params = {
                "search_query": query,
                "start": 0,
                "max_results": min(max_results, 2000),  # arXiv limit
                "sortBy": sort_by,
                "sortOrder": "descending"
            }
            
            # Add category filters
            if categories:
                category_query = " OR ".join([f"cat:{cat}" for cat in categories])
                params["search_query"] = f"({query}) AND ({category_query})"
            
            # Add date range
            if date_range:
                start_date = date_range.get("start")
                end_date = date_range.get("end")
                if start_date and end_date:
                    date_query = f"submittedDate:[{start_date} TO {end_date}]"
                    params["search_query"] = f"({params['search_query']}) AND ({date_query})"
            
            # Make API request
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.base_url,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=self.timeout)
                ) as response:
                    if response.status == 200:
                        xml_content = await response.text()
                        return self._parse_arxiv_response(xml_content)
                    else:
                        return {
                            "success": False,
                            "error": f"arXiv API error: {response.status}",
                            "results": []
                        }
        
        except Exception as e:
            logger.exception("arXiv search failed")
            return {
                "success": False,
                "error": str(e),
                "results": []
            }
    
    def _parse_arxiv_response(self, xml_content: str) -> Dict[str, Any]:
        """Parse arXiv XML response."""
        try:
            import xml.etree.ElementTree as ET
            
            root = ET.fromstring(xml_content)
            entries = root.findall(".//{http://www.w3.org/2005/Atom}entry")
            
            results = []
            for entry in entries:
                paper = {
                    "id": self._get_text(entry, ".//{http://arxiv.org/schemas/atom}id"),
                    "title": self._get_text(entry, ".//{http://www.w3.org/2005/Atom}title"),
                    "summary": self._get_text(entry, ".//{http://www.w3.org/2005/Atom}summary"),
                    "authors": [author.find(".//{http://www.w3.org/2005/Atom}name").text 
                               for author in entry.findall(".//{http://www.w3.org/2005/Atom}author")],
                    "published": self._get_text(entry, ".//{http://www.w3.org/2005/Atom}published"),
                    "updated": self._get_text(entry, ".//{http://www.w3.org/2005/Atom}updated"),
                    "categories": [cat.get("term") 
                                 for cat in entry.findall(".//{http://arxiv.org/schemas/atom}primary_category")],
                    "pdf_url": f"https://arxiv.org/pdf/{self._get_text(entry, './/{http://arxiv.org/schemas/atom}}id').split('/')[-1]}.pdf"
                }
                results.append(paper)
            
            return {
                "success": True,
                "total_results": len(results),
                "results": results
            }
        
        except Exception as e:
            logger.exception("Failed to parse arXiv response")
            return {
                "success": False,
                "error": f"XML parsing error: {str(e)}",
                "results": []
            }
    
    def _get_text(self, element, xpath: str) -> str:
        """Get text content from XML element."""
        found = element.find(xpath)
        return found.text if found is not None else ""


# Initialize service
arxiv_service = ArxivService()


@register_tool(
    name="search_arxiv_papers",
    category="research",
    description="Search and retrieve papers from arXiv.org with advanced filtering"
)
def search_arxiv_papers(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Search arXiv for academic papers."""
    query = arguments.get("query", "")
    if not query:
        return {
            "content": [{"type": "text", "text": "❌ Error: No search query provided"}]
        }
    
    categories = arguments.get("categories", [])
    max_results = arguments.get("max_results", 50)
    sort_by = arguments.get("sort_by", "relevance")
    date_range = arguments.get("date_range")
    
    # Run async search
    result = asyncio.run(arxiv_service.search_papers(
        query=query,
        categories=categories,
        max_results=max_results,
        sort_by=sort_by,
        date_range=date_range
    ))
    
    if result["success"]:
        papers = result["results"]
        summary = f"✅ Found {len(papers)} papers on arXiv for query: '{query}'"
        
        # Format results
        formatted_results = []
        for i, paper in enumerate(papers[:10], 1):  # Show first 10
            formatted_results.append(
                f"{i}. **{paper['title']}**\n"
                f"   Authors: {', '.join(paper['authors'][:3])}{'...' if len(paper['authors']) > 3 else ''}\n"
                f"   Published: {paper['published'][:10]}\n"
                f"   Categories: {', '.join(paper['categories'])}\n"
                f"   PDF: {paper['pdf_url']}\n"
            )
        
        return {
            "content": [{
                "type": "text",
                "text": f"{summary}\n\n**Top Results:**\n\n" + "\n".join(formatted_results)
            }]
        }
    else:
        return {
            "content": [{"type": "text", "text": f"❌ arXiv search failed: {result['error']}"}]
        }


@register_tool(
    name="download_arxiv_paper",
    category="research", 
    description="Download a specific arXiv paper by ID"
)
def download_arxiv_paper(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Download an arXiv paper."""
    paper_id = arguments.get("paper_id", "")
    if not paper_id:
        return {
            "content": [{"type": "text", "text": "❌ Error: No paper ID provided"}]
        }
    
    format_type = arguments.get("format", "pdf")
    
    # Clean paper ID
    if "/" in paper_id:
        paper_id = paper_id.split("/")[-1]
    
    # Construct download URL
    if format_type == "pdf":
        url = f"https://arxiv.org/pdf/{paper_id}.pdf"
    elif format_type == "source":
        url = f"https://arxiv.org/src/{paper_id}"
    else:
        url = f"https://arxiv.org/api/query?id_list={paper_id}"
    
    return {
        "content": [{
            "type": "text",
            "text": f"✅ arXiv paper download link:\n\n**Paper ID:** {paper_id}\n**Format:** {format_type}\n**URL:** {url}\n\n*Note: Use this URL to download the paper. The MCP server cannot directly download files to your system.*"
        }]
    }
