#!/usr/bin/env python3
"""
Research Tool Definitions
========================

Tool schema definitions for the Reynard MCP research system.
Provides comprehensive academic research and review capabilities.
"""

from typing import Any


def get_research_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all research tool definitions."""
    return {
        # Academic Discovery Tools (only implemented tools)
        "search_arxiv_papers": {
            "name": "search_arxiv_papers",
            "description": "Search and retrieve papers from arXiv.org with advanced filtering",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query for arXiv papers",
                    },
                    "categories": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "arXiv categories to search (e.g., cs.AI, cs.LG, stat.ML)",
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return (default: 50)",
                    },
                    "sort_by": {
                        "type": "string",
                        "enum": ["relevance", "submittedDate", "lastUpdatedDate"],
                        "description": "Sort order for results",
                    },
                    "date_range": {
                        "type": "object",
                        "properties": {
                            "start": {"type": "string", "format": "date"},
                            "end": {"type": "string", "format": "date"},
                        },
                        "description": "Date range for paper publication",
                    },
                },
                "required": ["query"],
            },
        },
        "download_arxiv_paper": {
            "name": "download_arxiv_paper",
            "description": "Download a specific arXiv paper by ID",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "paper_id": {
                        "type": "string",
                        "description": "arXiv paper ID (e.g., '2301.00001' or 'cs.AI/23010001')",
                    },
                    "format": {
                        "type": "string",
                        "enum": ["pdf", "source", "metadata"],
                        "description": "Download format (default: pdf)",
                    },
                },
                "required": ["paper_id"],
            },
        },
        # PDF Processing Tools
        "process_pdf_to_markdown": {
            "name": "process_pdf_to_markdown",
            "description": "Process a single PDF paper to markdown using Marker",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "pdf_path": {
                        "type": "string",
                        "description": "Path to the PDF file to process",
                    },
                    "output_dir": {
                        "type": "string",
                        "description": "Output directory for markdown file (optional)",
                    },
                    "use_llm": {
                        "type": "boolean",
                        "description": "Whether to use LLM for enhanced processing (default: false)",
                    },
                },
                "required": ["pdf_path"],
            },
        },
        "process_paper_collection_to_markdown": {
            "name": "process_paper_collection_to_markdown",
            "description": "Process a collection of PDF papers to markdown using Marker",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "papers_dir": {
                        "type": "string",
                        "description": "Directory containing PDF papers to process",
                    },
                    "use_llm": {
                        "type": "boolean",
                        "description": "Whether to use LLM for enhanced processing (default: false)",
                    },
                    "max_papers": {
                        "type": "integer",
                        "description": "Maximum number of papers to process (optional)",
                    },
                },
                "required": ["papers_dir"],
            },
        },
        "process_research_papers_to_markdown": {
            "name": "process_research_papers_to_markdown",
            "description": "Process all research papers in backend/data/papers to markdown using Marker",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "use_llm": {
                        "type": "boolean",
                        "description": "Whether to use LLM for enhanced processing (default: false)",
                    },
                    "max_papers": {
                        "type": "integer",
                        "description": "Maximum number of papers to process (optional)",
                    },
                },
                "required": [],
            },
        },
        "get_pdf_processing_status": {
            "name": "get_pdf_processing_status",
            "description": "Get the status of the PDF processing service",
            "inputSchema": {"type": "object", "properties": {}, "required": []},
        },
    }
