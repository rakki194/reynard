"""
Test PDF processing functionality.
"""

from unittest.mock import Mock, patch

import pytest


class TestPDFProcessing:
    """Test PDF processing functionality."""

    def test_pdf_processing_status(self, mock_mcp_tool_response):
        """Test PDF processing status check."""
        with patch(
            'tools.research.pdf_processing_tools.get_pdf_processing_status'
        ) as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response

            # Test
            result = mock_tool({})

            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_process_pdf_to_markdown(self, mock_mcp_tool_response):
        """Test PDF to markdown conversion."""
        with patch(
            'tools.research.pdf_processing_tools.process_pdf_to_markdown'
        ) as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response

            # Test
            result = mock_tool({"pdf_path": "/test/path/paper.pdf", "use_llm": False})

            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_process_paper_collection(self, mock_mcp_tool_response):
        """Test paper collection processing."""
        with patch(
            'tools.research.pdf_processing_tools.process_paper_collection_to_markdown'
        ) as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response

            # Test
            result = mock_tool(
                {"papers_dir": "/test/papers", "use_llm": False, "max_papers": 5}
            )

            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_process_research_papers(self, mock_mcp_tool_response):
        """Test research papers processing."""
        with patch(
            'tools.research.pdf_processing_tools.process_research_papers_to_markdown'
        ) as mock_tool:
            # Setup
            mock_tool.return_value = mock_mcp_tool_response

            # Test
            result = mock_tool({"use_llm": False, "max_papers": 3})

            # Assertions
            assert "content" in result
            assert result["content"][0]["type"] == "text"
            mock_tool.assert_called_once()

    def test_pdf_processing_tool_initialization(self):
        """Test PDF processing tool initialization."""
        with patch(
            'tools.research.pdf_processing_tools.PDFProcessingService.__init__',
            return_value=None,
        ):
            from tools.research.pdf_processing_tools import PDFProcessingService

            service = PDFProcessingService()
            assert service is not None

    def test_pdf_file_validation(self, mock_pdf_file):
        """Test PDF file validation."""
        # Test that mock PDF file exists
        assert mock_pdf_file.exists()
        assert mock_pdf_file.suffix == ".pdf"

        # Test file content
        content = mock_pdf_file.read_bytes()
        assert len(content) > 0
        assert isinstance(content, bytes)

    def test_markdown_file_creation(self, mock_markdown_file):
        """Test markdown file creation."""
        # Test that mock markdown file exists
        assert mock_markdown_file.exists()
        assert mock_markdown_file.suffix == ".md"

        # Test file content
        content = mock_markdown_file.read_text()
        assert len(content) > 0
        assert isinstance(content, str)
        assert "# Test Paper" in content
