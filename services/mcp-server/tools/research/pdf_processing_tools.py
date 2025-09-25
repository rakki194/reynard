"""
PDF Processing Tools for MCP Server
===================================

Tools for processing PDF papers to markdown using the Marker library.
"""

import asyncio
import logging
import sys
from pathlib import Path
from typing import Dict, Any, Optional
import aiohttp
import json

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

# from tools.definitions import register_tool  # Commented out for testing

logger = logging.getLogger(__name__)


class PDFProcessingService:
    """Service for processing PDF papers to markdown."""
    
    def __init__(self):
        self.backend_url = "http://localhost:8000"
    
    async def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a request to the backend API."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.backend_url}{endpoint}", json=data) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        return {
                            "success": False,
                            "error": f"HTTP {response.status}: {error_text}"
                        }
        except Exception as e:
            return {
                "success": False,
                "error": f"Request failed: {e}"
            }
    
    async def process_single_pdf(
        self, 
        pdf_path: str, 
        output_dir: Optional[str] = None,
        use_llm: bool = False
    ) -> Dict[str, Any]:
        """Process a single PDF to markdown."""
        data = {
            "pdf_path": pdf_path,
            "output_dir": output_dir,
            "use_llm": use_llm
        }
        
        result = await self._make_request("/mcp/pdf-processing/process-pdf", data)
        return result
    
    async def process_paper_collection(
        self, 
        papers_dir: str,
        use_llm: bool = False,
        max_papers: Optional[int] = None
    ) -> Dict[str, Any]:
        """Process a collection of PDF papers to markdown."""
        data = {
            "papers_dir": papers_dir,
            "use_llm": use_llm,
            "max_papers": max_papers
        }
        
        result = await self._make_request("/mcp/pdf-processing/process-collection", data)
        return result
    
    async def process_research_papers(
        self, 
        use_llm: bool = False, 
        max_papers: Optional[int] = None
    ) -> Dict[str, Any]:
        """Process all research papers in the backend/data/papers directory."""
        try:
            async with aiohttp.ClientSession() as session:
                params = {}
                if use_llm:
                    params["use_llm"] = "true"
                if max_papers:
                    params["max_papers"] = str(max_papers)
                
                async with session.post(
                    f"{self.backend_url}/mcp/pdf-processing/process-research-papers",
                    params=params
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        return {
                            "success": False,
                            "error": f"HTTP {response.status}: {error_text}"
                        }
        except Exception as e:
            return {
                "success": False,
                "error": f"Request failed: {e}"
            }
    
    async def get_processing_status(self) -> Dict[str, Any]:
        """Get the status of the PDF processing service."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.backend_url}/mcp/pdf-processing/status") as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        return {
                            "success": False,
                            "error": f"HTTP {response.status}: {error_text}"
                        }
        except Exception as e:
            return {
                "success": False,
                "error": f"Request failed: {e}"
            }


# Global service instance
pdf_service = PDFProcessingService()


# @register_tool(
#     name="process_pdf_to_markdown",
#     category="research",
#     description="Process a single PDF paper to markdown using Marker"
# )
def process_pdf_to_markdown(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Process a single PDF to markdown."""
    pdf_path = arguments.get("pdf_path", "")
    if not pdf_path:
        return {
            "content": [{"type": "text", "text": "❌ Error: No PDF path provided"}]
        }
    
    output_dir = arguments.get("output_dir")
    use_llm = arguments.get("use_llm", False)
    
    try:
        # Run async function
        result = asyncio.run(pdf_service.process_single_pdf(
            pdf_path=pdf_path,
            output_dir=output_dir,
            use_llm=use_llm
        ))
        
        if result.get("success", False):
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Successfully processed PDF to markdown:\n\n"
                           f"**PDF:** {result['pdf_path']}\n"
                           f"**Markdown:** {result['markdown_path']}\n"
                           f"**PDF Size:** {result['pdf_size']:,} bytes\n"
                           f"**Markdown Size:** {result['markdown_size']:,} bytes\n"
                           f"**Processing Time:** {result['processing_time']:.2f} seconds\n"
                           f"**Compression Ratio:** {result['compression_ratio']:.2f}\n"
                           f"**LLM Enhanced:** {'Yes' if result['use_llm'] else 'No'}"
                }]
            }
        else:
            error_msg = result.get('error', 'Unknown error')
            if "disabled" in error_msg.lower():
                return {
                    "content": [{
                        "type": "text",
                        "text": f"⚠️ PDF processing is disabled: {error_msg}\n\n"
                               f"To enable PDF processing, set the following environment variables:\n"
                               f"- PDF_PROCESSING_ENABLED=true\n"
                               f"- MARKER_PACKAGE_ENABLED=true"
                    }]
                }
            else:
                return {
                    "content": [{
                        "type": "text",
                        "text": f"❌ Failed to process PDF: {error_msg}"
                    }]
                }
            
    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error processing PDF: {e}"
            }]
        }


# @register_tool(
#     name="process_paper_collection_to_markdown",
#     category="research",
#     description="Process a collection of PDF papers to markdown using Marker"
# )
def process_paper_collection_to_markdown(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Process a collection of PDF papers to markdown."""
    papers_dir = arguments.get("papers_dir", "")
    if not papers_dir:
        return {
            "content": [{"type": "text", "text": "❌ Error: No papers directory provided"}]
        }
    
    use_llm = arguments.get("use_llm", False)
    max_papers = arguments.get("max_papers")
    
    try:
        # Run async function
        result = asyncio.run(pdf_service.process_paper_collection(
            papers_dir=papers_dir,
            use_llm=use_llm,
            max_papers=max_papers
        ))
        
        if result.get("success", False):
            stats = result.get("stats", {})
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Successfully processed paper collection:\n\n"
                           f"**Total Papers:** {result['total_papers']}\n"
                           f"**Successful:** {result['successful']}\n"
                           f"**Failed:** {result['failed']}\n"
                           f"**Success Rate:** {stats.get('success_rate', 0):.1%}\n"
                           f"**Total Processing Time:** {stats.get('total_processing_time', 0):.2f} seconds\n"
                           f"**Average Processing Time:** {stats.get('average_processing_time', 0):.2f} seconds\n"
                           f"**Total PDF Size:** {stats.get('total_pdf_size', 0):,} bytes\n"
                           f"**Total Markdown Size:** {stats.get('total_markdown_size', 0):,} bytes\n"
                           f"**Average Compression Ratio:** {stats.get('average_compression_ratio', 0):.2f}\n"
                           f"**LLM Enhanced:** {'Yes' if use_llm else 'No'}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to process paper collection: {result.get('error', 'Unknown error')}"
                }]
            }
            
    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error processing paper collection: {e}"
            }]
        }


# @register_tool(
#     name="process_research_papers_to_markdown",
#     category="research",
#     description="Process all research papers in backend/data/papers to markdown using Marker"
# )
def process_research_papers_to_markdown(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Process all research papers to markdown."""
    use_llm = arguments.get("use_llm", False)
    max_papers = arguments.get("max_papers")
    
    try:
        # Run async function
        result = asyncio.run(pdf_service.process_research_papers(
            use_llm=use_llm,
            max_papers=max_papers
        ))
        
        if result.get("success", False):
            stats = result.get("stats", {})
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Successfully processed research papers:\n\n"
                           f"**Message:** {result['message']}\n\n"
                           f"**Statistics:**\n"
                           f"- Total Papers: {stats.get('total_papers', 0)}\n"
                           f"- Successful: {stats.get('successful', 0)}\n"
                           f"- Failed: {stats.get('failed', 0)}\n"
                           f"- Success Rate: {stats.get('success_rate', 0):.1%}\n"
                           f"- Total Processing Time: {stats.get('total_processing_time', 0):.2f} seconds\n"
                           f"- Average Processing Time: {stats.get('average_processing_time', 0):.2f} seconds\n"
                           f"- Total PDF Size: {stats.get('total_pdf_size', 0):,} bytes\n"
                           f"- Total Markdown Size: {stats.get('total_markdown_size', 0):,} bytes\n"
                           f"- Average Compression Ratio: {stats.get('average_compression_ratio', 0):.2f}\n"
                           f"- LLM Enhanced: {'Yes' if use_llm else 'No'}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to process research papers: {result.get('error', 'Unknown error')}"
                }]
            }
            
    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error processing research papers: {e}"
            }]
        }


# @register_tool(
#     name="get_pdf_processing_status",
#     category="research",
#     description="Get the status of the PDF processing service"
# )
def get_pdf_processing_status(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Get the status of the PDF processing service."""
    try:
        # Run async function
        result = asyncio.run(pdf_service.get_processing_status())
        
        if result.get("success", False):
            status = result.get("status", {})
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ PDF Processing Service Status:\n\n"
                           f"**Service Available:** {'Yes' if status.get('service_available', False) else 'No'}\n"
                           f"**Models Initialized:** {'Yes' if status.get('models_initialized', False) else 'No'}\n"
                           f"**Converter Available:** {'Yes' if status.get('converter_available', False) else 'No'}"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to get processing status: {result.get('error', 'Unknown error')}"
                }]
            }
            
    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting processing status: {e}"
            }]
        }
