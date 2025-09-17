# Search Tools Test Suite

This directory contains comprehensive tests for the unified search tools system.

## Test Structure

### Test Files

- **`test_ignore_config.py`** - Tests for the centralized ignore system
- **`test_search_tools.py`** - Tests for the unified SearchTools class
- **`test_nlp_queries.py`** - Tests for natural language query processing
- **`conftest.py`** - Pytest configuration and shared fixtures
- **`pytest.ini`** - Pytest configuration file

### Test Categories

#### Unit Tests

- Individual component testing
- Mock-based testing
- Fast execution
- Isolated functionality

#### Integration Tests

- End-to-end testing
- Real file system operations
- Cross-component interaction
- Natural language query processing

#### Performance Tests

- Large project testing
- Search performance validation
- Memory usage testing
- Scalability testing

## Running Tests

### Run All Tests

```bash
cd /home/kade/runeset/reynard/scripts/mcp/tools/search
python -m pytest
```

### Run Specific Test Categories

```bash
# Run only unit tests
python -m pytest -m unit

# Run only integration tests
python -m pytest -m integration

# Run only ignore system tests
python -m pytest -m ignore

# Run only NLP query tests
python -m pytest -m nlp

# Run only performance tests
python -m pytest -m performance

# Run only syntax construction tests
python -m pytest -m syntax
```

### Run Tests with Different Verbosity

```bash
# Verbose output
python -m pytest -v

# Very verbose output
python -m pytest -vv

# Show test durations
python -m pytest --durations=10

# Show slowest tests
python -m pytest --durations=0
```

### Skip Slow Tests

```bash
# Skip slow tests
python -m pytest -m "not slow"

# Run only fast tests
python -m pytest -m "not slow and not performance"
```

## Test Features

### Centralized Ignore System Testing

- Tests that `__pycache__`, `.git`, `venv`, `node_modules` are ignored
- Tests that hidden files and directories are ignored
- Tests that build artifacts are ignored
- Tests that temporary files are ignored
- Tests that media files are ignored
- Tests that large data files are ignored

### Natural Language Query Testing

- Tests queries like "What is the backend look like?"
- Tests queries like "How does the API work?"
- Tests queries like "Where are the database models?"
- Tests queries like "Show me the authentication system"
- Tests queries like "What endpoints are available?"
- Tests queries like "How is the database configured?"
- Tests queries like "What services are implemented?"
- Tests queries like "Show me the user management system"
- Tests queries like "How are errors handled?"
- Tests queries like "What dependencies are used?"

### Ripgrep Syntax Construction Testing

- Tests that ripgrep commands are constructed correctly
- Tests that file type filters are applied correctly
- Tests that directory filters are applied correctly
- Tests that pattern matching works correctly
- Tests that context lines are handled correctly
- Tests that case sensitivity is handled correctly
- Tests that whole word matching works correctly

### Code Pattern Search Testing

- Tests function pattern search
- Tests class pattern search
- Tests import pattern search
- Tests TODO pattern search
- Tests FIXME pattern search
- Tests comment pattern search

### Performance Testing

- Tests search performance with large projects
- Tests memory usage with many files
- Tests scalability with deep directory structures
- Tests cache effectiveness
- Tests query expansion performance

## Test Fixtures

### `temp_project`

Creates a temporary project structure with:

- Source code files
- Test files
- Configuration files
- Documentation files
- Ignored directories and files

### `large_project_structure`

Creates a large project structure for performance testing:

- Multiple modules with many files
- Deep directory structures
- Various file types
- Ignored directories

### `mock_subprocess`

Mocks subprocess calls for ripgrep testing:

- Returns controlled output
- Allows testing of command construction
- Prevents actual subprocess execution

### `mock_rag_service`

Mocks the RAG service for semantic search testing:

- Returns controlled embeddings
- Allows testing of semantic search
- Prevents actual RAG service calls

## Test Coverage

The test suite covers:

- ✅ Centralized ignore system
- ✅ BM25 search engine
- ✅ File search engine
- ✅ Semantic search engine
- ✅ Ripgrep search engine
- ✅ Unified SearchTools class
- ✅ Natural language query processing
- ✅ Ripgrep syntax construction
- ✅ Code pattern search
- ✅ Performance testing
- ✅ Error handling
- ✅ Edge cases
- ✅ Integration testing

## Continuous Integration

The tests are designed to run in CI environments:

- No external dependencies
- Mocked external services
- Deterministic results
- Fast execution
- Clear error messages

## Debugging Tests

### Run Tests with Debug Output

```bash
python -m pytest -s -v
```

### Run Single Test

```bash
python -m pytest test_search_tools.py::TestSearchTools::test_search_enhanced_nlp_query -v
```

### Run Tests with Coverage

```bash
python -m pytest --cov=. --cov-report=html
```

### Run Tests with Profiling

```bash
python -m pytest --profile
```

## Test Data

Test data is created dynamically in temporary directories:

- No persistent files
- Clean environment for each test
- Isolated test execution
- Automatic cleanup

## Best Practices

1. **Use descriptive test names** that explain what is being tested
2. **Test both positive and negative cases**
3. **Use appropriate fixtures** for setup and teardown
4. **Mock external dependencies** to ensure test isolation
5. **Test edge cases** and error conditions
6. **Use parametrized tests** for similar test cases
7. **Keep tests fast** and focused
8. **Use appropriate markers** for test categorization
9. **Clean up resources** in fixtures
10. **Document test purpose** in docstrings

