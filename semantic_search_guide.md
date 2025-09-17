# 🦊 Reynard Semantic Search Guide

_Comprehensive guide to semantic ripgrep and natural language code search capabilities_

## Overview

The Reynard backend provides powerful semantic search capabilities that allow you to find code by meaning rather than just text patterns. This system combines traditional text search with vector embeddings and natural language processing to understand the intent behind your queries.

## Available Search Types

### 1. Semantic Search (`semantic_search`)

**Purpose**: Find code using vector embeddings and semantic understanding

**Capabilities**:

- Natural language queries like "authentication function" or "error handling code"
- Vector similarity matching using embedding models
- Context-aware results with relevance scoring
- Support for multiple embedding models (code, text, multilingual)

**Example Queries**:

```python
# Find authentication-related code
await semantic_engine.semantic_search(
    query="user authentication and login functionality",
    search_type="semantic",
    top_k=10,
    similarity_threshold=0.7
)

# Find error handling patterns
await semantic_engine.semantic_search(
    query="exception handling and error management",
    search_type="semantic",
    file_types=["py", "ts", "js"],
    directories=["backend", "packages"]
)
```

### 2. Hybrid Search (`hybrid_search`)

**Purpose**: Combine semantic and traditional text search for comprehensive results

**Capabilities**:

- Merges results from multiple search strategies
- Prioritizes semantic matches while including text matches
- Provides source attribution for each result
- Configurable result limits and filtering

**Example Usage**:

```python
# Hybrid search combining semantic and text search
result = await semantic_engine.hybrid_search(
    query="authentication middleware and JWT token validation",
    max_results=20,
    file_types=["py", "ts"],
    directories=["backend"]
)
```

### 3. Enhanced Natural Language Search

**Purpose**: Advanced natural language processing with query expansion

**Capabilities**:

- Intelligent query analysis and expansion
- Context-aware search with file/function context
- Confidence scoring and result ranking
- Query suggestions and improvements

**Example Queries**:

```python
# Natural language search with context
await enhanced_engine.natural_language_search(
    query="find functions that handle user authentication",
    max_results=15,
    enable_expansion=True,
    confidence_threshold=0.6
)

# Contextual search with additional context
await enhanced_engine.contextual_search(
    query="error handling",
    context={
        "file_path": "backend/app/auth.py",
        "function_name": "authenticate_user"
    }
)
```

### 4. Intelligent Search

**Purpose**: Automatically choose the best search approach

**Capabilities**:

- Query analysis to determine optimal strategy
- Automatic model selection based on content type
- Multi-modal search combining different approaches
- Adaptive result ranking

## Search Configuration Options

### Embedding Models

The system supports multiple embedding models optimized for different content types:

- **`mxbai-embed-large`**: Best for code understanding
- **`bge-large-en-v1.5`**: Best for general text
- **`bge-m3`**: Best for multilingual content

### Search Types

- **`hybrid`**: Combines semantic and text search (default)
- **`vector`**: Pure vector similarity search
- **`text`**: Traditional text-based search
- **`code`**: Code-specific semantic search
- **`context`**: Context-aware search

### Filtering Options

- **`file_types`**: Filter by file extensions (e.g., `["py", "ts", "js"]`)
- **`directories`**: Limit search to specific directories
- **`top_k`**: Maximum number of results to return
- **`similarity_threshold`**: Minimum similarity score for results

## Practical Examples

### Finding Authentication Code

```python
# Search for authentication-related functionality
result = await semantic_engine.semantic_search(
    query="user authentication login JWT token validation",
    search_type="hybrid",
    file_types=["py", "ts"],
    directories=["backend", "packages"],
    top_k=15,
    similarity_threshold=0.6
)

# Results include:
# - JWT token validation functions
# - Login endpoint handlers
# - Authentication middleware
# - User session management
```

### Locating Error Handling Patterns

```python
# Find error handling and exception management
result = await semantic_engine.semantic_search(
    query="error handling exception management try catch",
    search_type="semantic",
    file_types=["py", "ts", "js"],
    top_k=20
)

# Results include:
# - Try-catch blocks
# - Error boundary components
# - Exception handling middleware
# - Error logging utilities
```

### Discovering Database Code

```python
# Find database-related functionality
result = await semantic_engine.semantic_search(
    query="database connection query execution ORM models",
    search_type="code",
    directories=["backend"],
    top_k=10
)

# Results include:
# - Database connection setup
# - ORM model definitions
# - Query execution functions
# - Migration scripts
```

## Advanced Features

### Query Analysis

```python
# Analyze query intent and structure
analysis = await enhanced_engine.analyze_query(
    "find authentication function"
)

# Returns:
# - Query intent classification
# - Extracted entities
# - Suggested improvements
# - Search strategy recommendations
```

### Intelligent Suggestions

```python
# Get query suggestions and improvements
suggestions = await enhanced_engine.get_intelligent_suggestions(
    query="auth",
    max_suggestions=5
)

# Returns:
# - "authentication function"
# - "authorization middleware"
# - "auth token validation"
# - "user authentication flow"
```

### Document Indexing

```python
# Index documents for semantic search
result = await semantic_engine.index_documents(
    file_paths=[
        "backend/app/auth.py",
        "backend/app/models.py",
        "packages/api-client/src/auth.ts"
    ],
    model="mxbai-embed-large",
    chunk_size=512,
    overlap=50
)
```

## Performance Considerations

### Optimization Strategies

1. **Model Selection**: Choose appropriate embedding models for your content type
2. **Chunking Strategy**: Optimize chunk size and overlap for your use case
3. **Filtering**: Use file types and directories to narrow search scope
4. **Threshold Tuning**: Adjust similarity thresholds based on result quality needs

### Caching and Indexing

- **Document Indexing**: Pre-index frequently searched documents
- **Query Caching**: Cache common queries for faster response times
- **Incremental Updates**: Update indexes incrementally as code changes

## Integration with MCP Tools

The semantic search capabilities are exposed through MCP (Model Context Protocol) tools:

### Available MCP Tools

1. **`semantic_search`**: Core semantic search functionality
2. **`hybrid_search`**: Combined semantic and text search
3. **`natural_language_search`**: Advanced NLP-based search
4. **`intelligent_search`**: Auto-selecting search strategy
5. **`contextual_search`**: Context-aware search
6. **`analyze_query`**: Query analysis and improvement
7. **`get_intelligent_suggestions`**: Query suggestions
8. **`embed_text`**: Generate text embeddings
9. **`index_documents`**: Index documents for search

### MCP Tool Usage

```json
{
  "method": "tools/call",
  "params": {
    "name": "semantic_search",
    "arguments": {
      "query": "authentication function",
      "search_type": "hybrid",
      "top_k": 10,
      "similarity_threshold": 0.7,
      "file_types": ["py", "ts"],
      "directories": ["backend"]
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Authentication Required**: Some endpoints require proper authentication
2. **Backend Not Running**: Ensure the Reynard backend is running on port 8000
3. **Model Loading**: First-time model loading may take time
4. **Memory Usage**: Large embeddings may require significant memory

### Debug Mode

Enable debug logging to troubleshoot issues:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Best Practices

### Query Formulation

1. **Be Specific**: Use descriptive terms that capture the intent
2. **Use Synonyms**: Include related terms and concepts
3. **Context Matters**: Provide context when possible
4. **Iterate**: Refine queries based on results

### Result Processing

1. **Check Scores**: Pay attention to similarity scores
2. **Review Context**: Examine the surrounding code context
3. **Filter Results**: Use file types and directories to narrow results
4. **Combine Strategies**: Use hybrid search for comprehensive results

## Conclusion

🦊 _The Reynard semantic search system provides powerful capabilities for finding code by meaning rather than just text patterns. By combining vector embeddings, natural language processing, and traditional text search, it offers a comprehensive solution for code exploration and discovery._

The system's ability to understand natural language queries and provide contextually relevant results makes it an invaluable tool for developers working with large codebases. Whether you're looking for specific functionality, exploring code patterns, or trying to understand how different parts of a system work together, semantic search provides a more intuitive and effective approach than traditional text-based search.

_Master the art of semantic search and outfox complexity in your codebase!_ 🦊
