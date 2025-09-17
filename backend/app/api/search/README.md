# Search API

## Overview

The Search API provides comprehensive search capabilities for the Reynard codebase, combining semantic search, syntax search, and hybrid search strategies. This system leverages vector embeddings, ripgrep, and intelligent query processing to deliver powerful code exploration tools.

## Features

### 🔍 Search Types

- **Semantic Search**: Vector-based search that understands code meaning and context
- **Syntax Search**: Fast pattern matching using ripgrep with regex support
- **Hybrid Search**: Combines semantic and syntax search for optimal results
- **Smart Search**: Automatically chooses the best search strategy based on query analysis

### 🧠 Intelligence Features

- **Query Expansion**: Automatically expands queries with synonyms and related terms
- **Code Pattern Recognition**: Understands programming concepts and patterns
- **Context Awareness**: Provides surrounding code context for better understanding
- **Intelligent Suggestions**: Offers query improvements and completions

### 📊 Performance Features

- **Vector Indexing**: Fast semantic search using pre-computed embeddings
- **Caching**: Intelligent result caching for improved performance
- **Parallel Processing**: Concurrent search strategies for faster results
- **Incremental Indexing**: Efficient updates to the search index

## API Endpoints

### Search Endpoints

#### `POST /api/search/semantic`

Perform semantic search using vector embeddings.

```json
{
  "query": "user authentication flow",
  "max_results": 20,
  "file_types": ["py", "ts"],
  "directories": ["backend", "packages"],
  "similarity_threshold": 0.7,
  "model": "all-MiniLM-L6-v2",
  "search_type": "hybrid"
}
```

#### `POST /api/search/syntax`

Perform syntax-based search using ripgrep.

```json
{
  "query": "def authenticate",
  "max_results": 50,
  "file_types": ["py"],
  "directories": ["backend"],
  "case_sensitive": false,
  "whole_word": false,
  "context_lines": 3,
  "expand_query": true
}
```

#### `POST /api/search/hybrid`

Perform hybrid search combining semantic and syntax search.

```json
{
  "query": "authentication",
  "max_results": 50,
  "file_types": ["py", "ts"],
  "directories": ["backend", "packages"],
  "semantic_weight": 0.6,
  "syntax_weight": 0.4,
  "similarity_threshold": 0.7
}
```

#### `POST /api/search/search`

Smart search that automatically chooses the best strategy.

```json
{
  "query": "error handling",
  "max_results": 20,
  "file_types": ["py", "ts"],
  "directories": ["backend", "packages"],
  "case_sensitive": false,
  "whole_word": false,
  "context_lines": 2
}
```

### Indexing Endpoints

#### `POST /api/search/index`

Index the codebase for search.

```json
{
  "project_root": "/path/to/project",
  "file_types": ["py", "ts", "js", "tsx", "jsx"],
  "directories": ["src", "packages"],
  "force_reindex": false,
  "chunk_size": 512,
  "overlap": 50
}
```

### Utility Endpoints

#### `GET /api/search/stats`

Get search statistics and performance metrics.

#### `GET /api/search/suggestions?query=authentication&max_suggestions=5`

Get intelligent query suggestions.

#### `GET /api/search/health`

Check the health of the search service.

## MCP Integration

The search API is integrated with the MCP server through search tools:

### MCP Tools

- `search_smart`: Smart search using the FastAPI backend
- `index_codebase_new`: Index the codebase using the backend
- `get_search_stats_new`: Get comprehensive search statistics
- `get_query_suggestions_new`: Get intelligent query suggestions
- `search_health_check`: Check search service health

### Usage Example

```python
# Using the smart search from MCP
result = await search_tools.search_smart(
    query="authentication flow",
    top_k=20,
    file_types=["py", "ts"],
    directories=["backend", "packages"]
)
```

## Architecture

### Components

1. **SearchService**: Core service orchestrating all search capabilities
2. **EnhancedSearchService**: MCP integration service
3. **Search Models**: Pydantic models for request/response validation
4. **Search Endpoints**: FastAPI endpoints for HTTP access

### Search Flow

1. **Query Analysis**: Analyze query to determine best search strategy
2. **Strategy Selection**: Choose semantic, syntax, or hybrid search
3. **Parallel Execution**: Run multiple search strategies concurrently
4. **Result Fusion**: Combine and rank results from different strategies
5. **Response Formatting**: Format results with metadata and context

### Backend Integration

The search API integrates with the existing RAG backend:

- **Vector Storage**: Uses existing pgvector database for embeddings
- **Document Processing**: Leverages existing document ingestion pipeline
- **Model Management**: Uses existing embedding model infrastructure

## Configuration

### Environment Variables

```bash
# RAG Backend URL
RAG_BASE_URL=http://localhost:8000

# Search Configuration
SEARCH_TIMEOUT_SECONDS=30
SEARCH_MAX_RETRIES=3
SEARCH_CACHE_SIZE=1000

# Model Configuration
DEFAULT_EMBEDDING_MODEL=all-MiniLM-L6-v2
EMBEDDING_MODELS_DIR=/path/to/models
```

### Model Configuration

The system supports multiple embedding models:

- `all-MiniLM-L6-v2`: Fast and efficient for general code
- `mxbai-embed-large`: Best for code understanding
- `bge-large-en-v1.5`: Best for general text
- `bge-m3`: Best for multilingual content

## Performance

### Benchmarks

- **Semantic Search**: ~100ms for 20 results
- **Syntax Search**: ~50ms for 50 results
- **Hybrid Search**: ~150ms for 50 results
- **Indexing**: ~1000 files/minute

### Optimization

- **Caching**: Intelligent result caching reduces repeated queries
- **Parallel Processing**: Concurrent search strategies improve speed
- **Incremental Indexing**: Only reindex changed files
- **Model Optimization**: Efficient embedding models for fast inference

## Error Handling

The API provides comprehensive error handling:

- **Graceful Degradation**: Falls back to simpler search methods if advanced features fail
- **Detailed Error Messages**: Clear error descriptions for debugging
- **Health Monitoring**: Continuous health checks and status reporting
- **Retry Logic**: Automatic retries for transient failures

## Future Enhancements

### Planned Features

- **Multi-language Support**: Enhanced support for different programming languages
- **Code Relationship Mapping**: Understanding of code dependencies and relationships
- **Visual Search**: Search using code structure and visual patterns
- **Real-time Indexing**: Live updates to search index as code changes
- **Advanced Analytics**: Detailed search analytics and usage patterns

### Integration Opportunities

- **IDE Integration**: Direct integration with VS Code and other IDEs
- **CI/CD Integration**: Search capabilities in continuous integration pipelines
- **Documentation Generation**: Automatic documentation generation from search results
- **Code Quality Analysis**: Integration with code quality and security tools

## Contributing

When contributing to the search API:

1. **Follow the 140-line axiom**: Keep files under 140 lines
2. **Add comprehensive tests**: Include unit and integration tests
3. **Update documentation**: Keep this README and API docs current
4. **Performance testing**: Ensure new features don't degrade performance
5. **Error handling**: Include proper error handling and logging

## Support

For issues or questions about the Enhanced Search API:

1. Check the health endpoint: `GET /api/search/health`
2. Review the logs for detailed error information
3. Test with the provided test scripts
4. Consult the MCP integration documentation

---

*This search system represents a significant advancement in code exploration capabilities, providing developers with powerful tools to understand and navigate complex codebases efficiently.*
