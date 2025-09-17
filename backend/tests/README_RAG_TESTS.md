# RAG Service Test Suite

🦦 _splashes with testing enthusiasm_ Comprehensive test suite for the modular RAG (Retrieval-Augmented Generation) service!

## Overview

This test suite provides comprehensive coverage for all RAG service components, including core services, advanced features, and integration workflows.

## Test Structure

### Core Service Tests (`test_rag_core.py`)

Tests the fundamental RAG functionality:

- **EmbeddingService**: Unified embedding generation with multiple providers
- **VectorStoreService**: PostgreSQL + pgvector management
- **DocumentIndexer**: Intelligent document processing and chunking
- **SearchEngine**: Advanced search with semantic and keyword matching

### Advanced Service Tests (`test_rag_advanced.py`)

Tests the advanced RAG features:

- **PerformanceMonitor**: Comprehensive performance monitoring
- **SecurityService**: Enterprise-grade security and compliance
- **ContinuousImprovement**: A/B testing and optimization
- **DocumentationService**: Automated documentation generation
- **ModelEvaluator**: Model evaluation and benchmarking

### Integration Tests (`test_rag_integration.py`)

Tests complete RAG workflows:

- End-to-end document indexing and search
- Hybrid search with semantic and keyword matching
- Security integration with RAG operations
- Performance monitoring integration
- Continuous improvement workflows
- Error handling and concurrency

## Running Tests

### Run All RAG Tests

```bash
# From the backend directory
python tests/run_rag_tests.py

# Or using pytest directly
pytest tests/test_services/test_rag_*.py -v
```

### Run Specific Test Categories

```bash
# Core services only
pytest tests/test_services/test_rag_core.py -v

# Advanced services only
pytest tests/test_services/test_rag_advanced.py -v

# Integration tests only
pytest tests/test_services/test_rag_integration.py -v
```

### Run Specific Test Classes

```bash
# Test embedding service only
pytest tests/test_services/test_rag_core.py::TestEmbeddingService -v

# Test security service only
pytest tests/test_services/test_rag_advanced.py::TestSecurityService -v
```

### Run Specific Test Methods

```bash
# Test specific functionality
pytest tests/test_services/test_rag_core.py::TestEmbeddingService::test_embed_text_single -v
```

## Test Configuration

### Test Fixtures

The test suite includes comprehensive fixtures in `conftest.py`:

- **rag_config**: Complete RAG configuration for testing
- **mock_embedding_service**: Mock embedding service
- **mock_vector_store_service**: Mock vector store service
- **mock_document_indexer**: Mock document indexer
- **mock_search_engine**: Mock search engine
- **mock_performance_monitor**: Mock performance monitor
- **mock_security_service**: Mock security service
- **mock_continuous_improvement**: Mock continuous improvement
- **mock_documentation_service**: Mock documentation service
- **mock_model_evaluator**: Mock model evaluator
- **sample_documents**: Sample documents for testing
- **sample_search_queries**: Sample search queries

### Mock Services

All external dependencies are mocked to ensure:

- **Fast execution**: No real HTTP calls or database connections
- **Reliable results**: Consistent test outcomes
- **Isolated testing**: Each test is independent
- **Easy debugging**: Clear error messages and stack traces

## Test Coverage

### Core Services Coverage

- ✅ Service initialization and configuration
- ✅ Basic functionality (embed, search, index)
- ✅ Error handling and edge cases
- ✅ Performance metrics and statistics
- ✅ Health checks and monitoring
- ✅ Concurrent operations
- ✅ Caching and optimization

### Advanced Services Coverage

- ✅ Security and access control
- ✅ Performance monitoring and alerting
- ✅ A/B testing and experiments
- ✅ Documentation generation
- ✅ Model evaluation and benchmarking
- ✅ Continuous improvement workflows
- ✅ Audit logging and compliance

### Integration Coverage

- ✅ End-to-end workflows
- ✅ Service orchestration
- ✅ Error propagation and handling
- ✅ Concurrent operations
- ✅ Resource management
- ✅ Graceful shutdown

## Test Data

### Sample Documents

The test suite includes realistic sample documents:

```python
# Python code
def hello():
    """Return a greeting."""
    return "Hello, World!"

def fibonacci(n):
    """Calculate fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

class Calculator:
    """Simple calculator class."""

    def add(self, a, b):
        """Add two numbers."""
        return a + b
```

```javascript
// JavaScript code
function greetUser(name) {
  return `Hello, ${name}!`;
}

class UserManager {
  constructor() {
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
  }
}
```

### Sample Search Queries

- "hello function"
- "calculator class"
- "fibonacci calculation"
- "user management"
- "authentication system"

## Test Assertions

### Common Assertions

```python
# Service initialization
assert service is not None
assert service.config is not None
assert service.enabled is True

# Functionality
assert result is not None
assert len(result) > 0
assert isinstance(result, list)

# Error handling
with pytest.raises(Exception):
    await service.failing_operation()

# Performance
assert result["latency_ms"] < 1000
assert result["accuracy"] > 0.8
```

## Continuous Integration

### GitHub Actions Integration

The test suite is designed to work with CI/CD pipelines:

```yaml
- name: Run RAG Tests
  run: |
    cd backend
    python tests/run_rag_tests.py
```

### Test Reporting

Tests generate detailed reports including:

- Test execution time
- Coverage metrics
- Performance benchmarks
- Error summaries
- Pass/fail statistics

## Debugging Tests

### Verbose Output

```bash
pytest tests/test_services/test_rag_core.py -v -s
```

### Debug Mode

```bash
pytest tests/test_services/test_rag_core.py --pdb
```

### Coverage Reports

```bash
pytest tests/test_services/test_rag_*.py --cov=app.services.rag --cov-report=html
```

## Best Practices

### Writing Tests

1. **Use descriptive test names**: `test_embed_text_single` not `test_embed`
2. **Test one thing at a time**: Each test should have a single responsibility
3. **Use appropriate fixtures**: Leverage the provided mock services
4. **Assert meaningful conditions**: Check actual behavior, not just no exceptions
5. **Clean up resources**: Use proper teardown in fixtures

### Test Organization

1. **Group related tests**: Use test classes for related functionality
2. **Use setup/teardown**: Properly initialize and clean up test state
3. **Mock external dependencies**: Don't rely on external services
4. **Test edge cases**: Include boundary conditions and error scenarios
5. **Document test purpose**: Use docstrings to explain test intent

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure all dependencies are installed
2. **Mock failures**: Check that mock services are properly configured
3. **Async issues**: Use `@pytest.mark.asyncio` for async tests
4. **Timeout errors**: Increase timeout for slow operations
5. **Resource leaks**: Ensure proper cleanup in teardown

### Getting Help

- Check test logs for detailed error messages
- Use `pytest --tb=long` for full tracebacks
- Enable debug mode with `--pdb` for interactive debugging
- Review the test fixtures in `conftest.py`

## Contributing

### Adding New Tests

1. Follow the existing test structure
2. Use appropriate fixtures and mocks
3. Add comprehensive assertions
4. Include error case testing
5. Update this documentation

### Test Naming Convention

- Test files: `test_<service_name>.py`
- Test classes: `Test<ServiceName>`
- Test methods: `test_<functionality>_<scenario>`

Example:

```python
class TestEmbeddingService:
    def test_embed_text_single(self):
        """Test single text embedding."""
        pass

    def test_embed_batch_error_handling(self):
        """Test batch embedding error handling."""
        pass
```

---

🦊 _whiskers twitch with testing satisfaction_ This comprehensive test suite ensures the RAG service is robust, reliable, and ready for production use! Every component is thoroughly tested with realistic scenarios and edge cases.
