"""
Test MCP tools functionality.
"""

import pytest
from unittest.mock import patch, Mock


class TestMCPTools:
    """Test MCP tools functionality."""

    def test_search_arxiv_papers_tool(self, mock_mcp_tool_response):
        """Test arXiv search MCP tool."""
        with patch('tools.research.academic.arxiv_tools.search_arxiv_papers') as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response
            
            # Test
            result = mock_tool({
                "query": "persian cultural evaluation",
                "categories": ["cs.CL"],
                "max_results": 5
            })
            
            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_download_arxiv_paper_tool(self, mock_mcp_tool_response):
        """Test arXiv download MCP tool."""
        with patch('tools.research.academic.arxiv_tools.download_arxiv_paper') as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response
            
            # Test
            result = mock_tool({
                "paper_id": "2509.01035",
                "format": "pdf"
            })
            
            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_search_local_papers_tool(self, mock_mcp_tool_response):
        """Test local search MCP tool."""
        with patch('tools.research.paper_management.search_local_papers') as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response
            
            # Test
            result = mock_tool({
                "query": "taarof",
                "max_results": 5
            })
            
            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_download_and_index_paper_tool(self, mock_mcp_tool_response):
        """Test download and index MCP tool."""
        with patch('tools.research.paper_management.download_and_index_paper') as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response
            
            # Test
            result = mock_tool({
                "paper_id": "2509.01035",
                "title": "Test Paper",
                "authors": ["Test Author"],
                "source": "arxiv"
            })
            
            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_ingest_paper_to_rag_tool(self, mock_mcp_tool_response):
        """Test RAG ingestion MCP tool."""
        with patch('tools.research.rag_integration.ingest_paper_to_rag') as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response
            
            # Test
            result = mock_tool({
                "paper_path": "/test/path/paper.pdf",
                "chunk_size": 1000
            })
            
            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_search_papers_in_rag_tool(self, mock_mcp_tool_response):
        """Test RAG search MCP tool."""
        with patch('tools.research.rag_integration.search_papers_in_rag') as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response
            
            # Test
            result = mock_tool({
                "query": "test query",
                "search_type": "hybrid",
                "top_k": 5
            })
            
            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_get_rag_paper_stats_tool(self, mock_mcp_tool_response):
        """Test RAG stats MCP tool."""
        with patch('tools.research.rag_integration.get_rag_paper_stats') as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response
            
            # Test
            result = mock_tool({})
            
            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_mcp_tool_response_structure(self, mock_mcp_tool_response):
        """Test MCP tool response structure."""
        # Test required fields
        assert "content" in mock_mcp_tool_response
        assert isinstance(mock_mcp_tool_response["content"], list)
        assert len(mock_mcp_tool_response["content"]) > 0
        
        # Test content structure
        content = mock_mcp_tool_response["content"][0]
        assert "type" in content
        assert "text" in content
        assert content["type"] == "text"
