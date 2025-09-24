"""Documentation Service: Automated documentation generation and training materials.

This service provides:
- Comprehensive user documentation generation
- API reference documentation
- Developer training materials
- Best practices guides
- Interactive tutorials and examples
"""

import logging
from datetime import datetime
from typing import Any

logger = logging.getLogger("uvicorn")


class DocumentationService:
    """Comprehensive documentation and training service."""

    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.enabled = config.get("rag_documentation_enabled", True)

        # Documentation templates
        self.templates = self._initialize_templates()

        # API examples
        self.api_examples = self._initialize_api_examples()

        # Best practices
        self.best_practices = self._initialize_best_practices()

    def _initialize_templates(self) -> dict[str, str]:
        """Initialize documentation templates."""
        return {
            "user_guide": self._get_user_guide_template(),
            "api_reference": self._get_api_reference_template(),
            "developer_guide": self._get_developer_guide_template(),
            "troubleshooting": self._get_troubleshooting_template(),
        }

    def _get_user_guide_template(self) -> str:
        """Get user guide template."""
        return """# RAG System User Guide

## Overview
The RAG (Retrieval-Augmented Generation) system provides advanced semantic search and embedding capabilities.

## Quick Start
1. Initialize the service
2. Generate embeddings
3. Perform searches
4. Index documents

## Features
- Semantic search
- Document indexing
- Vector embeddings
- Hybrid search capabilities
"""

    def _get_api_reference_template(self) -> str:
        """Get API reference template."""
        return """# RAG System API Reference

## RAGService
Main service class for RAG functionality.

### Methods
- `initialize()` - Initialize the service
- `embed_text(text)` - Generate text embedding
- `search(query)` - Perform search
- `index_documents(docs)` - Index documents
"""

    def _get_developer_guide_template(self) -> str:
        """Get developer guide template."""
        return """# RAG System Developer Guide

## Architecture
The RAG system follows a modular architecture with core and advanced services.

## Development Setup
1. Install dependencies
2. Configure database
3. Start Ollama service
4. Run tests

## Testing
Use pytest for unit and integration tests.
"""

    def _get_troubleshooting_template(self) -> str:
        """Get troubleshooting template."""
        return """# RAG System Troubleshooting Guide

## Common Issues
- High embedding latency
- Low search recall
- Memory usage issues

## Solutions
- Check service health
- Optimize configuration
- Monitor performance metrics
"""

    def _initialize_api_examples(self) -> dict[str, list[dict[str, Any]]]:
        """Initialize API examples."""
        return {
            "embedding": [
                {
                    "title": "Basic Text Embedding",
                    "description": "Generate embeddings for text content",
                    "code": """
# Basic text embedding
embedding = await rag_service.embed_text("Hello, world!")
print(f"Embedding dimension: {len(embedding)}")
""",
                    "language": "python",
                },
                {
                    "title": "Batch Embedding",
                    "description": "Generate embeddings for multiple texts",
                    "code": """
# Batch embedding
texts = ["Text 1", "Text 2", "Text 3"]
embeddings = await rag_service.embed_batch(texts)
print(f"Generated {len(embeddings)} embeddings")
""",
                    "language": "python",
                },
            ],
            "search": [
                {
                    "title": "Semantic Search",
                    "description": "Perform semantic search using embeddings",
                    "code": """
# Semantic search
results = await rag_service.search("machine learning", search_type="semantic", limit=10)
for result in results:
    print(f"Score: {result['score']}, Content: {result['content'][:100]}")
""",
                    "language": "python",
                },
                {
                    "title": "Hybrid Search",
                    "description": "Combine semantic and keyword search",
                    "code": """
# Hybrid search
results = await rag_service.search("python function", search_type="hybrid", limit=5)
for result in results:
    print(f"Type: {result['type']}, Score: {result['score']}")
""",
                    "language": "python",
                },
            ],
        }

    def _initialize_best_practices(self) -> dict[str, list[str]]:
        """Initialize best practices guidelines."""
        return {
            "embedding": [
                "Use appropriate chunk sizes (512 tokens for EmbeddingGemma)",
                "Include context in chunks for better semantic understanding",
                "Use model-specific tokenization for accurate chunking",
                "Cache embeddings to improve performance",
                "Monitor embedding quality and drift over time",
            ],
            "search": [
                "Use hybrid search for better recall and precision",
                "Tune semantic/keyword weights based on use case",
                "Implement proper result ranking and filtering",
                "Use appropriate similarity thresholds",
                "Monitor search performance and user satisfaction",
            ],
            "security": [
                "Encrypt sensitive data at rest and in transit",
                "Implement proper access controls and audit logging",
                "Regularly rotate encryption keys",
                "Monitor for suspicious activities",
                "Follow data privacy regulations (GDPR, CCPA)",
            ],
            "performance": [
                "Use concurrent processing for batch operations",
                "Implement proper caching strategies",
                "Monitor system resources and performance metrics",
                "Set up automated performance regression testing",
                "Optimize database indexes and queries",
            ],
        }

    async def generate_user_documentation(self) -> str:
        """Generate comprehensive user documentation."""
        if not self.enabled:
            return "Documentation generation disabled"

        doc = []
        doc.append("# RAG System User Guide")
        doc.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        doc.append("")

        # Overview
        doc.append("## Overview")
        doc.append("")
        doc.append(
            "The RAG (Retrieval-Augmented Generation) system provides advanced semantic search and embedding capabilities for code and documents.",
        )
        doc.append("")

        # Quick Start
        doc.append("## Quick Start")
        doc.append("")
        doc.append("### 1. Initialize the Service")
        doc.append("```python")
        doc.append("from app.services.rag import RAGService")
        doc.append("")
        doc.append("config = {")
        doc.append("    'rag_enabled': True,")
        doc.append("    'ollama_base_url': 'http://localhost:11434'")
        doc.append("}")
        doc.append("")
        doc.append("rag_service = RAGService(config)")
        doc.append("await rag_service.initialize()")
        doc.append("```")
        doc.append("")

        # Features
        doc.append("## Features")
        doc.append("")
        doc.append("### Core Features")
        doc.append("- Unified embedding generation with multiple providers")
        doc.append("- PostgreSQL + pgvector for vector storage")
        doc.append("- AST-aware document chunking")
        doc.append("- Hybrid search with semantic and keyword matching")
        doc.append("")

        doc.append("### Advanced Features")
        doc.append("- Comprehensive performance monitoring")
        doc.append("- Enterprise security and compliance")
        doc.append("- Automated documentation generation")
        doc.append("- Continuous improvement pipeline")
        doc.append("")

        # API Examples
        doc.append("## API Examples")
        doc.append("")

        for category, examples in self.api_examples.items():
            doc.append(f"### {category.title()} Examples")
            doc.append("")

            for example in examples:
                doc.append(f"#### {example['title']}")
                doc.append("")
                doc.append(example["description"])
                doc.append("")
                doc.append(f"```{example['language']}")
                doc.append(example["code"].strip())
                doc.append("```")
                doc.append("")

        # Best Practices
        doc.append("## Best Practices")
        doc.append("")

        for category, practices in self.best_practices.items():
            doc.append(f"### {category.title()}")
            doc.append("")
            for practice in practices:
                doc.append(f"- {practice}")
            doc.append("")

        return "\n".join(doc)

    async def generate_api_reference(self) -> str:
        """Generate comprehensive API reference."""
        doc = []
        doc.append("# RAG System API Reference")
        doc.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        doc.append("")

        # Service Classes
        doc.append("## Service Classes")
        doc.append("")

        doc.append("### RAGService")
        doc.append("Main service class for RAG functionality.")
        doc.append("")

        doc.append("#### Methods")
        doc.append("")

        methods = [
            ("initialize()", "Initialize the RAG service", "bool"),
            ("embed_text(text, model)", "Generate embedding for text", "List[float]"),
            (
                "embed_batch(texts, model)",
                "Generate embeddings for multiple texts",
                "List[List[float]]",
            ),
            (
                "search(query, search_type, limit, filters)",
                "Perform search",
                "List[Dict]",
            ),
            ("index_documents(documents)", "Index documents for search", "Dict"),
            ("get_system_health()", "Get system health status", "Dict"),
            ("get_statistics()", "Get comprehensive statistics", "Dict"),
            ("shutdown()", "Shutdown the service", "None"),
        ]

        for method, description, return_type in methods:
            doc.append(f"**{method}** -> `{return_type}`")
            doc.append(f"- {description}")
            doc.append("")

        return "\n".join(doc)

    async def generate_developer_guide(self) -> str:
        """Generate developer training guide."""
        doc = []
        doc.append("# RAG System Developer Guide")
        doc.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        doc.append("")

        # Architecture
        doc.append("## System Architecture")
        doc.append("")
        doc.append(
            "The RAG system follows a modular architecture with the following components:",
        )
        doc.append("")
        doc.append("- **Embedding Service**: Generates vector embeddings using Ollama")
        doc.append("- **Vector Store**: PostgreSQL with pgvector for vector storage")
        doc.append(
            "- **Document Indexer**: Intelligent document processing and chunking",
        )
        doc.append(
            "- **Search Engine**: Advanced search with semantic and keyword matching",
        )
        doc.append("- **Performance Monitor**: Comprehensive performance monitoring")
        doc.append("- **Security Service**: Enterprise-grade security and compliance")
        doc.append("")

        # Development Setup
        doc.append("## Development Setup")
        doc.append("")
        doc.append("### Prerequisites")
        doc.append("- Python 3.8+")
        doc.append("- PostgreSQL with pgvector")
        doc.append("- Ollama service")
        doc.append("")

        doc.append("### Installation")
        doc.append("```bash")
        doc.append("# Install dependencies")
        doc.append("pip install -r backend/requirements.txt")
        doc.append("")
        doc.append("# Run tests")
        doc.append("python -m pytest backend/tests/ -v")
        doc.append("```")
        doc.append("")

        # Testing
        doc.append("## Testing")
        doc.append("")
        doc.append("### Unit Tests")
        doc.append("```bash")
        doc.append("python -m pytest backend/tests/ -v")
        doc.append("```")
        doc.append("")

        doc.append("### Integration Tests")
        doc.append("```bash")
        doc.append("python -m pytest backend/tests/test_rag_integration.py -v")
        doc.append("```")
        doc.append("")

        return "\n".join(doc)

    async def generate_troubleshooting_guide(self) -> str:
        """Generate troubleshooting guide."""
        doc = []
        doc.append("# RAG System Troubleshooting Guide")
        doc.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        doc.append("")

        # Common Issues
        doc.append("## Common Issues")
        doc.append("")

        issues = [
            {
                "issue": "High embedding latency",
                "symptoms": "Embedding generation takes >2 seconds",
                "causes": [
                    "Ollama service overload",
                    "Network issues",
                    "Model loading",
                ],
                "solutions": [
                    "Check Ollama service health",
                    "Reduce concurrent requests",
                    "Use caching",
                ],
            },
            {
                "issue": "Low search recall",
                "symptoms": "Search results are not relevant",
                "causes": [
                    "Poor chunking",
                    "Inadequate embeddings",
                    "Wrong similarity threshold",
                ],
                "solutions": [
                    "Improve chunking strategy",
                    "Use hybrid search",
                    "Tune similarity threshold",
                ],
            },
            {
                "issue": "Memory usage high",
                "symptoms": "System running out of memory",
                "causes": [
                    "Large embedding cache",
                    "Too many concurrent requests",
                    "Memory leaks",
                ],
                "solutions": [
                    "Reduce cache size",
                    "Limit concurrency",
                    "Check for memory leaks",
                ],
            },
        ]

        for issue_data in issues:
            doc.append(f"### {issue_data['issue']}")
            doc.append("")
            doc.append(f"**Symptoms**: {issue_data['symptoms']}")
            doc.append("")
            doc.append("**Possible Causes**:")
            for cause in issue_data["causes"]:
                doc.append(f"- {cause}")
            doc.append("")
            doc.append("**Solutions**:")
            for solution in issue_data["solutions"]:
                doc.append(f"- {solution}")
            doc.append("")

        return "\n".join(doc)

    async def generate_training_materials(self) -> dict[str, str]:
        """Generate comprehensive training materials."""
        materials = {}

        materials["user_guide"] = await self.generate_user_documentation()
        materials["api_reference"] = await self.generate_api_reference()
        materials["developer_guide"] = await self.generate_developer_guide()
        materials["troubleshooting"] = await self.generate_troubleshooting_guide()

        return materials

    async def save_documentation(self, output_dir: str = "docs/rag") -> dict[str, str]:
        """Save documentation to files."""
        from pathlib import Path

        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        materials = await self.generate_training_materials()
        saved_files = {}

        for doc_type, content in materials.items():
            filename = f"{doc_type}.md"
            filepath = output_path / filename

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)

            saved_files[doc_type] = str(filepath)
            logger.info(f"Saved {doc_type} documentation to {filepath}")

        return saved_files

    def get_documentation_stats(self) -> dict[str, Any]:
        """Get documentation statistics."""
        return {
            "enabled": self.enabled,
            "templates_available": len(self.templates),
            "api_examples_count": sum(
                len(examples) for examples in self.api_examples.values()
            ),
            "best_practices_categories": len(self.best_practices),
            "total_best_practices": sum(
                len(practices) for practices in self.best_practices.values()
            ),
        }
