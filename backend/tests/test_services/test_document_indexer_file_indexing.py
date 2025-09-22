"""
🔥 Document Indexer with File Indexing Tests
============================================

Comprehensive pytest tests for document indexer integration with file indexing service.
Tests the refactored document indexer that uses file indexing service for
file discovery and content retrieval.

Author: Phoenix-Prime-94
Version: 1.0.0
"""

import asyncio
import pytest
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.rag.core.indexing import DocumentIndexer
from app.services.rag.file_indexing_service import get_file_indexing_service
from app.config.file_indexing_config import get_file_indexing_config


class TestDocumentIndexerFileIndexingIntegration:
    """Test suite for document indexer with file indexing integration."""

    @pytest.fixture
    def document_indexer_config(self):
        """Create document indexer configuration."""
        config = get_file_indexing_config()
        config.update({
            'rag_enabled': True,
            'rag_ingest_concurrency': 2,
            'rag_ingest_max_attempts': 3,
            'rag_ingest_batch_size_text': 4,
            'rag_chunk_max_tokens': 256,
            'rag_chunk_min_tokens': 50,
            'rag_chunk_overlap_ratio': 0.1,
        })
        return config

    @pytest.fixture
    async def document_indexer(self, document_indexer_config):
        """Create document indexer instance for testing."""
        # Mock dependencies
        mock_vector_store = AsyncMock()
        mock_embedding_service = AsyncMock()
        file_indexing_service = get_file_indexing_service()
        
        # Initialize file indexing service
        await file_indexing_service.initialize(document_indexer_config)
        
        # Create document indexer
        indexer = DocumentIndexer()
        await indexer.initialize(
            document_indexer_config,
            mock_vector_store,
            mock_embedding_service,
            file_indexing_service
        )
        
        yield indexer, mock_vector_store, mock_embedding_service, file_indexing_service

    @pytest.fixture
    def temp_directory_with_files(self):
        """Create temporary directory with test files."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Create test Python files
            (temp_path / "module1.py").write_text("""
def function_one():
    '''First test function with detailed documentation.
    
    This function demonstrates proper documentation
    and should be chunked appropriately.
    '''
    return "Hello from module 1"

class ClassOne:
    '''A test class with methods.'''
    
    def __init__(self):
        self.value = 42
    
    def method_one(self):
        '''Method with documentation.'''
        return "Method from class one"
    
    def method_two(self):
        '''Another method for testing.'''
        return "Another method"
""")
            
            (temp_path / "module2.py").write_text("""
import os
import sys
from typing import List, Dict

def function_two(param1: str, param2: int) -> str:
    '''Second test function with type hints.
    
    Args:
        param1: A string parameter
        param2: An integer parameter
    
    Returns:
        A formatted string
    '''
    return f"{param1}: {param2}"

class ClassTwo:
    '''Another test class.'''
    
    def __init__(self, name: str):
        self.name = name
        self.data: List[Dict[str, str]] = []
    
    def add_data(self, key: str, value: str) -> None:
        '''Add data to the class.'''
        self.data.append({key: value})
""")
            
            (temp_path / "documentation.md").write_text("""
# Test Documentation

This is comprehensive test documentation for the document indexer.
It contains multiple sections and should be properly chunked.

## Features

The document indexer supports:
- File discovery through file indexing service
- Content retrieval and caching
- Intelligent chunking based on AST analysis
- Batch processing for performance

## Usage

```python
from app.services.rag.core.indexing import DocumentIndexer

indexer = DocumentIndexer()
await indexer.initialize(config, vector_store, embedding_service, file_indexing_service)
```

## Configuration

The indexer can be configured with various parameters:
- Chunk size limits
- Overlap ratios
- Batch processing settings
""")
            
            yield temp_path

    @pytest.mark.asyncio
    async def test_document_indexer_initialization_with_file_indexing(self, document_indexer_config):
        """Test document indexer initialization with file indexing service."""
        # Mock dependencies
        mock_vector_store = AsyncMock()
        mock_embedding_service = AsyncMock()
        file_indexing_service = get_file_indexing_service()
        
        # Initialize file indexing service
        await file_indexing_service.initialize(document_indexer_config)
        
        # Create document indexer
        indexer = DocumentIndexer()
        result = await indexer.initialize(
            document_indexer_config,
            mock_vector_store,
            mock_embedding_service,
            file_indexing_service
        )
        
        assert result is True
        assert indexer._file_indexing_service == file_indexing_service
        assert indexer._vector_store_service == mock_vector_store
        assert indexer._embedding_service == mock_embedding_service

    @pytest.mark.asyncio
    async def test_document_indexer_file_indexing_dependency(self, document_indexer):
        """Test that document indexer properly uses file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Verify file indexing service dependency
        assert indexer._file_indexing_service == file_indexing_service
        assert hasattr(indexer._file_indexing_service, 'get_file_content')
        assert hasattr(indexer._file_indexing_service, 'get_cached_content')

    @pytest.mark.asyncio
    async def test_document_indexer_file_content_retrieval(self, document_indexer, temp_directory_with_files):
        """Test document indexer file content retrieval using file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Index files using file indexing service
        directories = [str(temp_directory_with_files)]
        file_types = ['.py', '.md']
        await file_indexing_service.index_files(directories, file_types)
        
        # Test content retrieval
        test_file = str(temp_directory_with_files / "module1.py")
        content = await file_indexing_service.get_file_content(test_file)
        
        assert content is not None
        assert "def function_one():" in content
        assert "class ClassOne:" in content

    @pytest.mark.asyncio
    async def test_document_indexer_chunking_with_file_indexing(self, document_indexer, temp_directory_with_files):
        """Test document indexer chunking using file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Index files using file indexing service
        directories = [str(temp_directory_with_files)]
        file_types = ['.py']
        await file_indexing_service.index_files(directories, file_types)
        
        # Test chunking of a file
        test_file = str(temp_directory_with_files / "module1.py")
        content = await file_indexing_service.get_file_content(test_file)
        
        # Create a mock payload for chunking
        payload = {
            "path": test_file,
            "content": content,
            "file_type": ".py"
        }
        
        # Test chunking
        chunks = await indexer._chunk_document(payload)
        
        assert len(chunks) > 0
        for chunk in chunks:
            assert hasattr(chunk, 'text')
            assert hasattr(chunk, 'metadata')
            assert chunk.metadata.language == 'python'

    @pytest.mark.asyncio
    async def test_document_indexer_batch_processing(self, document_indexer, temp_directory_with_files):
        """Test document indexer batch processing with file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Index files using file indexing service
        directories = [str(temp_directory_with_files)]
        file_types = ['.py', '.md']
        await file_indexing_service.index_files(directories, file_types)
        
        # Create mock payloads for batch processing
        payloads = []
        for file_path in temp_directory_with_files.glob("*"):
            if file_path.suffix in ['.py', '.md']:
                content = await file_indexing_service.get_file_content(str(file_path))
                payloads.append({
                    "path": str(file_path),
                    "content": content,
                    "file_type": file_path.suffix
                })
        
        # Test batch processing
        results = await indexer._process_batch(payloads)
        
        assert len(results) > 0
        for result in results:
            assert 'chunks' in result
            assert len(result['chunks']) > 0

    @pytest.mark.asyncio
    async def test_document_indexer_error_handling(self, document_indexer):
        """Test document indexer error handling with file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Test with non-existent file
        payload = {
            "path": "/non/existent/file.py",
            "content": None,
            "file_type": ".py"
        }
        
        # Mock file indexing service to return None for non-existent file
        with patch.object(file_indexing_service, 'get_file_content', return_value=None):
            chunks = await indexer._chunk_document(payload)
            assert len(chunks) == 0

    @pytest.mark.asyncio
    async def test_document_indexer_caching_integration(self, document_indexer, temp_directory_with_files):
        """Test document indexer integration with file indexing caching."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Index files using file indexing service
        directories = [str(temp_directory_with_files)]
        file_types = ['.py']
        await file_indexing_service.index_files(directories, file_types)
        
        test_file = str(temp_directory_with_files / "module1.py")
        
        # Get content (should cache it)
        content1 = await file_indexing_service.get_file_content(test_file)
        assert content1 is not None
        
        # Get cached content
        cached_content = await file_indexing_service.get_cached_content(test_file)
        assert cached_content is not None
        assert cached_content == content1

    @pytest.mark.asyncio
    async def test_document_indexer_performance(self, document_indexer, temp_directory_with_files):
        """Test document indexer performance with file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Index files using file indexing service
        directories = [str(temp_directory_with_files)]
        file_types = ['.py', '.md']
        await file_indexing_service.index_files(directories, file_types)
        
        # Time the chunking process
        import time
        start_time = time.time()
        
        # Process all files
        for file_path in temp_directory_with_files.glob("*"):
            if file_path.suffix in ['.py', '.md']:
                content = await file_indexing_service.get_file_content(str(file_path))
                payload = {
                    "path": str(file_path),
                    "content": content,
                    "file_type": file_path.suffix
                }
                chunks = await indexer._chunk_document(payload)
                assert len(chunks) > 0
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        # Should be fast with file indexing service
        assert processing_time < 2.0

    @pytest.mark.asyncio
    async def test_document_indexer_concurrent_processing(self, document_indexer, temp_directory_with_files):
        """Test document indexer concurrent processing with file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Index files using file indexing service
        directories = [str(temp_directory_with_files)]
        file_types = ['.py', '.md']
        await file_indexing_service.index_files(directories, file_types)
        
        # Create tasks for concurrent processing
        tasks = []
        for file_path in temp_directory_with_files.glob("*"):
            if file_path.suffix in ['.py', '.md']:
                async def process_file(fp):
                    content = await file_indexing_service.get_file_content(str(fp))
                    payload = {
                        "path": str(fp),
                        "content": content,
                        "file_type": fp.suffix
                    }
                    return await indexer._chunk_document(payload)
                
                tasks.append(process_file(file_path))
        
        # Execute concurrent processing
        results = await asyncio.gather(*tasks)
        
        # All should succeed
        for result in results:
            assert len(result) > 0

    @pytest.mark.asyncio
    async def test_document_indexer_language_detection(self, document_indexer, temp_directory_with_files):
        """Test document indexer language detection with file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Index files using file indexing service
        directories = [str(temp_directory_with_files)]
        file_types = ['.py', '.md']
        await file_indexing_service.index_files(directories, file_types)
        
        # Test Python file
        python_file = str(temp_directory_with_files / "module1.py")
        content = await file_indexing_service.get_file_content(python_file)
        payload = {
            "path": python_file,
            "content": content,
            "file_type": ".py"
        }
        chunks = await indexer._chunk_document(payload)
        
        for chunk in chunks:
            assert chunk.metadata.language == 'python'
        
        # Test Markdown file
        markdown_file = str(temp_directory_with_files / "documentation.md")
        content = await file_indexing_service.get_file_content(markdown_file)
        payload = {
            "path": markdown_file,
            "content": content,
            "file_type": ".md"
        }
        chunks = await indexer._chunk_document(payload)
        
        for chunk in chunks:
            assert chunk.metadata.language == 'markdown'

    @pytest.mark.asyncio
    async def test_document_indexer_metadata_extraction(self, document_indexer, temp_directory_with_files):
        """Test document indexer metadata extraction with file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Index files using file indexing service
        directories = [str(temp_directory_with_files)]
        file_types = ['.py']
        await file_indexing_service.index_files(directories, file_types)
        
        # Test metadata extraction
        test_file = str(temp_directory_with_files / "module1.py")
        content = await file_indexing_service.get_file_content(test_file)
        payload = {
            "path": test_file,
            "content": content,
            "file_type": ".py"
        }
        chunks = await indexer._chunk_document(payload)
        
        # Verify metadata
        for chunk in chunks:
            assert chunk.metadata.chunk_id is not None
            assert chunk.metadata.chunk_type in ['function', 'class', 'import', 'generic']
            assert chunk.metadata.start_line > 0
            assert chunk.metadata.end_line > chunk.metadata.start_line
            assert chunk.metadata.language == 'python'

    @pytest.mark.asyncio
    async def test_document_indexer_worker_processing(self, document_indexer, temp_directory_with_files):
        """Test document indexer worker processing with file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Index files using file indexing service
        directories = [str(temp_directory_with_files)]
        file_types = ['.py']
        await file_indexing_service.index_files(directories, file_types)
        
        # Create a queue item
        test_file = str(temp_directory_with_files / "module1.py")
        content = await file_indexing_service.get_file_content(test_file)
        
        queue_item = {
            "kind": "docs",
            "payload": {
                "path": test_file,
                "content": content,
                "file_type": ".py"
            }
        }
        
        # Test worker processing
        result = await indexer._process_item(queue_item)
        
        assert result is not None
        assert 'chunks' in result
        assert len(result['chunks']) > 0

    @pytest.mark.asyncio
    async def test_document_indexer_statistics(self, document_indexer, temp_directory_with_files):
        """Test document indexer statistics with file indexing service."""
        indexer, mock_vector_store, mock_embedding_service, file_indexing_service = document_indexer
        
        # Index files using file indexing service
        directories = [str(temp_directory_with_files)]
        file_types = ['.py', '.md']
        await file_indexing_service.index_files(directories, file_types)
        
        # Process some files
        for file_path in temp_directory_with_files.glob("*"):
            if file_path.suffix in ['.py', '.md']:
                content = await file_indexing_service.get_file_content(str(file_path))
                payload = {
                    "path": str(file_path),
                    "content": content,
                    "file_type": file_path.suffix
                }
                await indexer._chunk_document(payload)
        
        # Check statistics
        stats = indexer.get_stats()
        assert 'total_chunks' in stats
        assert 'total_documents' in stats
        assert 'avg_chunk_size' in stats


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
