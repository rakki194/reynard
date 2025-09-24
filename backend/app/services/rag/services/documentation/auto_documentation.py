"""Auto Documentation Service: Automated documentation generation.

This service provides automated documentation generation capabilities including
user guides, API references, and developer documentation for the RAG system.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from ...interfaces.base import BaseService, ServiceStatus

logger = logging.getLogger("uvicorn")


class AutoDocumentationService(BaseService):
    """Auto documentation service for generating comprehensive documentation."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("auto-documentation", config)
        
        # Documentation configuration
        self.docs_output_dir = self.config.get("docs_output_dir", "docs")
        self.include_api_docs = self.config.get("include_api_docs", True)
        self.include_user_guides = self.config.get("include_user_guides", True)
        self.include_dev_guides = self.config.get("include_dev_guides", True)
        
        # Documentation templates
        self.documentation_templates = {
            "user_guide": self._get_user_guide_template(),
            "api_reference": self._get_api_reference_template(),
            "developer_guide": self._get_developer_guide_template(),
            "changelog": self._get_changelog_template(),
        }
        
        # Metrics
        self.metrics = {
            "docs_generated": 0,
            "api_endpoints_documented": 0,
            "user_guides_created": 0,
            "dev_guides_created": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the auto documentation service."""
        try:
            self.update_status(ServiceStatus.INITIALIZING, "Initializing auto documentation service")
            
            # Create output directory
            os.makedirs(self.docs_output_dir, exist_ok=True)
            
            self.update_status(ServiceStatus.HEALTHY, "Auto documentation service initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize auto documentation service: {e}")
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the auto documentation service."""
        try:
            self.update_status(ServiceStatus.SHUTTING_DOWN, "Shutting down auto documentation service")
            self.update_status(ServiceStatus.SHUTDOWN, "Auto documentation service shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            # Check if output directory is writable
            docs_dir_healthy = os.access(self.docs_output_dir, os.W_OK)
            
            if docs_dir_healthy:
                self.update_status(ServiceStatus.HEALTHY, "Service is healthy")
            else:
                self.update_status(ServiceStatus.DEGRADED, "Documentation directory not writable")
            
            return {
                "status": self.status.value,
                "message": self.health.message,
                "last_updated": self.health.last_updated.isoformat(),
                "docs_output_dir": self.docs_output_dir,
                "include_api_docs": self.include_api_docs,
                "include_user_guides": self.include_user_guides,
                "include_dev_guides": self.include_dev_guides,
                "metrics": self.metrics,
                "dependencies": self.get_dependency_status(),
            }
            
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            self.update_status(ServiceStatus.ERROR, f"Health check failed: {e}")
            return {
                "status": "error",
                "message": str(e),
                "last_updated": self.health.last_updated.isoformat(),
                "dependencies": self.get_dependency_status(),
            }

    async def generate_user_guide(
        self,
        **kwargs
    ) -> str:
        """Generate comprehensive user guide."""
        try:
            template = self.documentation_templates["user_guide"]
            
            # Customize template with current information
            content = template.format(
                generation_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                version="1.0.0",
            )
            
            # Write to file
            output_path = os.path.join(self.docs_output_dir, "user_guide.md")
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(content)
            
            self.metrics["user_guides_created"] += 1
            self.metrics["docs_generated"] += 1
            
            self.logger.info(f"Generated user guide: {output_path}")
            return output_path
            
        except Exception as e:
            self.logger.error(f"Failed to generate user guide: {e}")
            raise RuntimeError(f"Failed to generate user guide: {e}")

    async def generate_api_reference(
        self,
        api_endpoints: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> str:
        """Generate API reference documentation."""
        try:
            template = self.documentation_templates["api_reference"]
            
            # Default API endpoints if none provided
            if not api_endpoints:
                api_endpoints = self._get_default_api_endpoints()
            
            # Generate API documentation
            api_docs = self._generate_api_docs_content(api_endpoints)
            
            content = template.format(
                generation_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                version="1.0.0",
                api_docs=api_docs,
            )
            
            # Write to file
            output_path = os.path.join(self.docs_output_dir, "api_reference.md")
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(content)
            
            self.metrics["api_endpoints_documented"] += len(api_endpoints)
            self.metrics["docs_generated"] += 1
            
            self.logger.info(f"Generated API reference: {output_path}")
            return output_path
            
        except Exception as e:
            self.logger.error(f"Failed to generate API reference: {e}")
            raise RuntimeError(f"Failed to generate API reference: {e}")

    async def generate_developer_guide(
        self,
        **kwargs
    ) -> str:
        """Generate developer guide."""
        try:
            template = self.documentation_templates["developer_guide"]
            
            content = template.format(
                generation_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                version="1.0.0",
            )
            
            # Write to file
            output_path = os.path.join(self.docs_output_dir, "developer_guide.md")
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(content)
            
            self.metrics["dev_guides_created"] += 1
            self.metrics["docs_generated"] += 1
            
            self.logger.info(f"Generated developer guide: {output_path}")
            return output_path
            
        except Exception as e:
            self.logger.error(f"Failed to generate developer guide: {e}")
            raise RuntimeError(f"Failed to generate developer guide: {e}")

    async def generate_changelog(
        self,
        changes: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> str:
        """Generate changelog documentation."""
        try:
            template = self.documentation_templates["changelog"]
            
            # Default changes if none provided
            if not changes:
                changes = self._get_default_changes()
            
            # Generate changelog content
            changelog_content = self._generate_changelog_content(changes)
            
            content = template.format(
                generation_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                version="1.0.0",
                changelog_content=changelog_content,
            )
            
            # Write to file
            output_path = os.path.join(self.docs_output_dir, "CHANGELOG.md")
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(content)
            
            self.metrics["docs_generated"] += 1
            
            self.logger.info(f"Generated changelog: {output_path}")
            return output_path
            
        except Exception as e:
            self.logger.error(f"Failed to generate changelog: {e}")
            raise RuntimeError(f"Failed to generate changelog: {e}")

    async def generate_all_documentation(
        self,
        **kwargs
    ) -> Dict[str, str]:
        """Generate all documentation types."""
        try:
            generated_docs = {}
            
            if self.include_user_guides:
                generated_docs["user_guide"] = await self.generate_user_guide()
            
            if self.include_api_docs:
                generated_docs["api_reference"] = await self.generate_api_reference()
            
            if self.include_dev_guides:
                generated_docs["developer_guide"] = await self.generate_developer_guide()
            
            # Always generate changelog
            generated_docs["changelog"] = await self.generate_changelog()
            
            self.logger.info(f"Generated {len(generated_docs)} documentation files")
            return generated_docs
            
        except Exception as e:
            self.logger.error(f"Failed to generate all documentation: {e}")
            raise RuntimeError(f"Failed to generate all documentation: {e}")

    def _get_user_guide_template(self) -> str:
        """Get user guide template."""
        return """# RAG System User Guide

*Generated on {generation_date} - Version {version}*

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Usage](#basic-usage)
3. [Advanced Features](#advanced-features)
4. [Troubleshooting](#troubleshooting)
5. [FAQ](#faq)

## Getting Started

### What is the RAG System?

The RAG (Retrieval-Augmented Generation) system is a powerful tool for intelligent code search and documentation. It combines semantic search with traditional keyword search to help you find relevant code, functions, classes, and concepts quickly and accurately.

### Key Features

- **Semantic Search**: Find code by meaning, not just keywords
- **Hybrid Search**: Combines semantic and keyword search for best results
- **Code-Aware**: Understands programming concepts and relationships
- **Fast Indexing**: Quickly processes and indexes your codebase
- **Real-time Updates**: Automatically updates as your code changes

## Basic Usage

### 1. Indexing Your Code

Before you can search, you need to index your codebase:

```bash
# Index a directory
rag index /path/to/your/code

# Index with specific options
rag index /path/to/your/code --chunk-size 512 --overlap 50
```

### 2. Basic Search

```bash
# Simple search
rag search "authentication function"

# Search with filters
rag search "database connection" --type function --language python
```

### 3. Web Interface

Access the web interface at `http://localhost:8000` for an interactive search experience.

## Advanced Features

### Semantic Search

Semantic search understands the meaning of your queries:

```bash
# Find functions that handle user authentication
rag search "user login and password verification"

# Find classes that implement design patterns
rag search "singleton pattern implementation"
```

### Hybrid Search

Combines multiple search methods for comprehensive results:

```bash
# Use hybrid search for best results
rag search "error handling" --method hybrid
```

### Code-Specific Queries

The system understands programming concepts:

- **Functions**: `rag search "function that calculates fibonacci"`
- **Classes**: `rag search "HTTP client class"`
- **Concepts**: `rag search "dependency injection pattern"`
- **Bug Fixes**: `rag search "memory leak in image processing"`

## Troubleshooting

### Common Issues

**Q: Search returns no results**
A: Make sure your codebase is properly indexed. Run `rag status` to check indexing status.

**Q: Results are not relevant**
A: Try using more specific queries or different search terms. The system works best with descriptive queries.

**Q: Indexing is slow**
A: Large codebases take time to index. You can monitor progress with `rag status`.

### Performance Tips

1. **Use specific queries**: "authentication function" is better than "auth"
2. **Combine keywords**: "database connection pool" is more specific than "database"
3. **Use filters**: Specify file types, languages, or directories when possible

## FAQ

**Q: How does semantic search work?**
A: The system uses AI embeddings to understand the meaning of your code and queries, allowing it to find relevant results even when exact keywords don't match.

**Q: Can I search across multiple repositories?**
A: Yes, you can index multiple directories and search across all of them.

**Q: How often should I re-index?**
A: The system automatically detects changes and updates the index. Manual re-indexing is rarely needed.

**Q: What file types are supported?**
A: The system supports most programming languages and text files. See the developer guide for a complete list.

---

*For more technical details, see the [Developer Guide](developer_guide.md)*
*For API documentation, see the [API Reference](api_reference.md)*
"""

    def _get_api_reference_template(self) -> str:
        """Get API reference template."""
        return """# RAG System API Reference

*Generated on {generation_date} - Version {version}*

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All API endpoints require authentication. Include your API key in the request headers:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

{api_docs}

## Response Format

All API responses follow this format:

```json
{{
  "success": true,
  "data": {{}},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}}
```

## Error Handling

Errors are returned with appropriate HTTP status codes:

- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid API key
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:

```json
{{
  "success": false,
  "error": {{
    "code": "INVALID_PARAMETER",
    "message": "Invalid parameter: query",
    "details": {{}}
  }},
  "timestamp": "2024-01-01T00:00:00Z"
}}
```

## Rate Limiting

API requests are rate limited to 100 requests per minute per API key.

## SDKs

Official SDKs are available for:

- Python
- JavaScript/TypeScript
- Go
- Java

See the [Developer Guide](developer_guide.md) for SDK documentation.
"""

    def _get_developer_guide_template(self) -> str:
        """Get developer guide template."""
        return """# RAG System Developer Guide

*Generated on {generation_date} - Version {version}*

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [API Integration](#api-integration)
5. [SDK Usage](#sdk-usage)
6. [Customization](#customization)
7. [Contributing](#contributing)

## Architecture Overview

The RAG system is built with a modular architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Interface │    │   API Gateway   │    │  Search Engine  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Vector Store   │
                    │  (PostgreSQL +  │
                    │   pgvector)     │
                    └─────────────────┘
```

### Core Components

- **Embedding Service**: Generates vector embeddings using various models
- **Vector Store**: Stores and retrieves embeddings with PostgreSQL + pgvector
- **Search Engine**: Combines semantic and keyword search
- **Document Indexer**: Processes and chunks documents intelligently
- **API Gateway**: Provides RESTful API access

## Installation

### Prerequisites

- Python 3.8+
- PostgreSQL 12+ with pgvector extension
- Node.js 16+ (for web interface)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/rag-system.git
cd rag-system

# Install dependencies
pip install -r requirements.txt
npm install

# Set up database
createdb rag_system
psql rag_system -c "CREATE EXTENSION vector;"

# Run migrations
python -m rag.migrations

# Start the system
python -m rag.main
```

## Configuration

### Environment Variables

```bash
# Database
RAG_DATABASE_URL=postgresql://user:pass@localhost/rag_system

# Embedding Model
EMBEDDING_MODEL=embeddinggemma:latest

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_KEY=your-secret-api-key

# Search Configuration
DEFAULT_SEARCH_LIMIT=20
SIMILARITY_THRESHOLD=0.0
```

### Configuration File

Create `config.yaml`:

```yaml
database:
  url: "postgresql://user:pass@localhost/rag_system"
  pool_size: 10

embedding:
  model: "embeddinggemma:latest"
  batch_size: 32
  cache_size: 1000

search:
  default_limit: 20
  similarity_threshold: 0.0
  hybrid_weights:
    semantic: 0.7
    keyword: 0.3

api:
  host: "0.0.0.0"
  port: 8000
  rate_limit: 100
```

## API Integration

### Python SDK

```python
from rag_sdk import RAGClient

# Initialize client
client = RAGClient(
    api_key="your-api-key",
    base_url="http://localhost:8000/api/v1"
)

# Index documents
result = client.index_documents([
    {{"path": "/path/to/file.py", "content": "..."}}
])

# Search
results = client.search("authentication function", limit=10)

# Hybrid search
results = client.hybrid_search(
    "database connection",
    semantic_weight=0.7,
    keyword_weight=0.3
)
```

### JavaScript SDK

```javascript
import {{ RAGClient }} from 'rag-sdk';

// Initialize client
const client = new RAGClient({{
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:8000/api/v1'
}});

// Search
const results = await client.search('authentication function', {{
  limit: 10,
  filters: {{ language: 'python' }}
}});
```

## SDK Usage

### Advanced Search Options

```python
# Search with filters
results = client.search(
    "error handling",
    filters={{
        "file_type": "python",
        "directory": "/src/auth",
        "last_modified": "2024-01-01"
    }}
)

# Semantic search only
results = client.semantic_search("user authentication")

# Keyword search only
results = client.keyword_search("login function")
```

### Batch Operations

```python
# Batch index
documents = [
    {{"path": "file1.py", "content": "..."}},
    {{"path": "file2.py", "content": "..."}},
]

for result in client.batch_index(documents):
    print(f"Indexed: {{result.path}}")
```

## Customization

### Custom Embedding Models

```python
# Register custom model
client.register_embedding_model(
    name="custom-model",
    provider="ollama",
    model="your-custom-model"
)

# Use custom model
results = client.search(
    "query",
    embedding_model="custom-model"
)
```

### Custom Chunking Strategies

```python
# Custom chunker
class CustomChunker:
    def chunk(self, content, language):
        # Your custom chunking logic
        return chunks

# Register chunker
client.register_chunker("custom", CustomChunker())
```

## Contributing

### Development Setup

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Run linting
flake8
black --check .

# Run type checking
mypy .
```

### Code Style

- Follow PEP 8 for Python code
- Use type hints
- Write comprehensive tests
- Document public APIs

### Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

*For user documentation, see the [User Guide](user_guide.md)*
*For API details, see the [API Reference](api_reference.md)*
"""

    def _get_changelog_template(self) -> str:
        """Get changelog template."""
        return """# Changelog

*Generated on {generation_date} - Version {version}*

All notable changes to the RAG system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

{changelog_content}

## [Unreleased]

### Added
- New features that have been added but not yet released

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed in future versions

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security improvements

---

*For more information, see the [User Guide](user_guide.md) and [Developer Guide](developer_guide.md)*
"""

    def _get_default_api_endpoints(self) -> List[Dict[str, Any]]:
        """Get default API endpoints."""
        return [
            {
                "method": "POST",
                "path": "/search",
                "description": "Perform semantic search",
                "parameters": {
                    "query": {"type": "string", "required": True, "description": "Search query"},
                    "limit": {"type": "integer", "required": False, "default": 20, "description": "Maximum number of results"},
                    "filters": {"type": "object", "required": False, "description": "Search filters"},
                },
                "response": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "text": {"type": "string"},
                            "score": {"type": "number"},
                            "metadata": {"type": "object"},
                        }
                    }
                }
            },
            {
                "method": "POST",
                "path": "/index",
                "description": "Index documents",
                "parameters": {
                    "documents": {"type": "array", "required": True, "description": "Documents to index"},
                },
                "response": {
                    "type": "object",
                    "properties": {
                        "indexed_count": {"type": "integer"},
                        "status": {"type": "string"},
                    }
                }
            },
            {
                "method": "GET",
                "path": "/status",
                "description": "Get system status",
                "parameters": {},
                "response": {
                    "type": "object",
                    "properties": {
                        "status": {"type": "string"},
                        "indexed_documents": {"type": "integer"},
                        "uptime": {"type": "string"},
                    }
                }
            },
        ]

    def _get_default_changes(self) -> List[Dict[str, Any]]:
        """Get default changelog changes."""
        return [
            {
                "version": "1.0.0",
                "date": "2024-01-01",
                "changes": {
                    "added": [
                        "Initial release of RAG system",
                        "Semantic search capabilities",
                        "Hybrid search combining semantic and keyword search",
                        "RESTful API",
                        "Web interface",
                        "Python and JavaScript SDKs",
                    ],
                    "changed": [],
                    "deprecated": [],
                    "removed": [],
                    "fixed": [],
                    "security": [],
                }
            }
        ]

    def _generate_api_docs_content(self, api_endpoints: List[Dict[str, Any]]) -> str:
        """Generate API documentation content."""
        docs = []
        
        for endpoint in api_endpoints:
            docs.append(f"### {endpoint['method']} {endpoint['path']}")
            docs.append("")
            docs.append(endpoint['description'])
            docs.append("")
            
            if endpoint.get('parameters'):
                docs.append("**Parameters:**")
                docs.append("")
                for param_name, param_info in endpoint['parameters'].items():
                    required = " (required)" if param_info.get('required') else ""
                    docs.append(f"- `{param_name}` ({param_info['type']}){required}: {param_info['description']}")
                docs.append("")
            
            if endpoint.get('response'):
                docs.append("**Response:**")
                docs.append("")
                docs.append("```json")
                # Simplified response example
                docs.append('{')
                docs.append('  "success": true,')
                docs.append('  "data": [],')
                docs.append('  "message": "Success"')
                docs.append('}')
                docs.append("```")
                docs.append("")
        
        return "\n".join(docs)

    def _generate_changelog_content(self, changes: List[Dict[str, Any]]) -> str:
        """Generate changelog content."""
        content = []
        
        for change in changes:
            content.append(f"## [{change['version']}] - {change['date']}")
            content.append("")
            
            for change_type, items in change['changes'].items():
                if items:
                    content.append(f"### {change_type.title()}")
                    content.append("")
                    for item in items:
                        content.append(f"- {item}")
                    content.append("")
        
        return "\n".join(content)

    async def get_documentation_stats(self) -> Dict[str, Any]:
        """Get documentation service statistics."""
        return {
            "service_name": self.name,
            "status": self.status.value,
            "docs_output_dir": self.docs_output_dir,
            "include_api_docs": self.include_api_docs,
            "include_user_guides": self.include_user_guides,
            "include_dev_guides": self.include_dev_guides,
            "templates_available": len(self.documentation_templates),
            "metrics": self.metrics,
        }
