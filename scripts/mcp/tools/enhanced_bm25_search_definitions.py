#!/usr/bin/env python3
"""
Enhanced BM25 Search Tool Definitions
=====================================

MCP tool definitions for enhanced BM25 search functionality.
"""

from tools.enhanced_bm25_search_tools import EnhancedBM25SearchTools

# Initialize the enhanced BM25 search tools
enhanced_bm25_tools = EnhancedBM25SearchTools()

# Get tool definitions
ENHANCED_BM25_SEARCH_TOOLS = enhanced_bm25_tools.get_tools()
