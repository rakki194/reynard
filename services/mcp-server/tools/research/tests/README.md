# Research System Tests

This directory contains pytest-based tests for the research system components.

## Test Structure

- `conftest.py` - Shared fixtures and test configuration
- `pytest.ini` - Pytest configuration
- `test_arxiv_integration.py` - Tests for arXiv search and download functionality
- `test_paper_management.py` - Tests for paper storage and indexing
- `test_rag_integration.py` - Tests for RAG system integration
- `test_mcp_tools.py` - Tests for MCP tool functionality
- `test_database_storage.py` - Tests for database operations
- `test_pdf_processing.py` - Tests for PDF processing functionality

## Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest test_arxiv_integration.py

# Run with verbose output
pytest -v

# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Run async tests
pytest -m asyncio
```

## Test Features

- **Mocked Dependencies**: All external dependencies are mocked to ensure fast, reliable tests
- **Fixtures**: Shared test data and setup through pytest fixtures
- **Async Support**: Full support for testing async functions
- **Comprehensive Coverage**: Tests cover all major functionality areas
- **No Real Downloads**: All network operations are mocked to avoid external dependencies

## Test Data

All test data is generated through fixtures in `conftest.py`:

- Sample paper metadata
- Mock arXiv search results
- Mock RAG responses
- Temporary directories for file operations
- Mock database connections

## Best Practices

- Tests are isolated and don't depend on external services
- All async functions are properly tested with `@pytest.mark.asyncio`
- Mock objects are used consistently for external dependencies
- Test data is realistic but doesn't require actual files or network access
