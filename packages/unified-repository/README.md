# reynard-unified-repository

> **The Apex Predator of Multimodal Dataset Management** 🦊

A comprehensive unified repository and
database system for managing multimodal datasets including parquet, video, audio, image, text, HTML, markdown, and
PDF files. Built on Reynard's modular architecture with advanced search, RAG integration, and vector embeddings.

## ✨ Features

### 🎯 **Core Capabilities**

- **Unified Dataset Management**: Single interface for all multimodal data types
- **Advanced Search & RAG**: Vector-based semantic search with multimodal embeddings
- **Parquet Integration**: Native support for Apache Parquet datasets with schema inference
- **Multimodal Gallery**: Unified interface for browsing all media types
- **Version Control**: Semantic versioning and dataset lineage tracking
- **Metadata Management**: Comprehensive metadata extraction and indexing

### 🏗️ **Architecture**

Built on proven best practices from 2024-2025 research:

- **Multi-Model Database**: PostgreSQL + pgvector for unified storage
- **Knowledge Graphs**: Complex relationship modeling between data modalities
- **Universal Embeddings**: Cross-modal vector representations
- **Microservices Design**: Modular, scalable service architecture
- **API-First**: RESTful and GraphQL endpoints

### 🚀 **Supported Formats**

| **Category**  | **Formats**                                                          | **Capabilities**                       |
| ------------- | -------------------------------------------------------------------- | -------------------------------------- |
| **Data**      | Parquet, Arrow, Feather, HDF5, CSV, TSV                              | Schema inference, columnar analytics   |
| **Media**     | Images (JPG, PNG, WebP, AVIF), Videos (MP4, WebM), Audio (MP3, FLAC) | Thumbnails, metadata extraction        |
| **Documents** | PDF, HTML, Markdown, DOCX, EPUB                                      | Content extraction, OCR, text analysis |
| **Code**      | All programming languages                                            | Syntax highlighting, symbol extraction |

## 📦 Installation

```bash
pnpm install reynard-unified-repository
```

## 🎯 Quick Start

### Basic Repository Setup

```typescript
import { UnifiedRepository } from "reynard-unified-repository";

const repository = new UnifiedRepository({
  database: {
    host: "localhost",
    port: 5432,
    database: "multimodal_repo",
  },
  storage: {
    type: "local", // or "s3", "gcs"
    path: "./data",
  },
});

await repository.initialize();
```

### Dataset Management

```typescript
// Add a multimodal dataset
const dataset = await repository.createDataset({
  name: "research-papers",
  description: "Academic papers with figures and tables",
  version: "1.0.0",
  tags: ["research", "academic", "multimodal"],
});

// Ingest files
await repository.ingestFiles(dataset.id, ["papers/paper1.pdf", "papers/paper1_figures/", "papers/paper1_data.parquet"]);

// Search across all modalities
const results = await repository.search({
  query: "machine learning algorithms",
  modalities: ["text", "image", "data"],
  topK: 20,
});
```

### Advanced Multimodal Search

```typescript
import { MultimodalSearch } from "reynard-unified-repository";

const search = new MultimodalSearch(repository);

// Cross-modal search
const results = await search.query({
  text: "Find datasets about climate change",
  image: "climate_data_visualization.jpg", // Optional image query
  filters: {
    dateRange: { from: "2023-01-01", to: "2024-12-31" },
    fileTypes: ["parquet", "pdf", "png"],
  },
});
```

## 🏗️ Architecture

### Service Layer

```typescript
// Core services built on Reynard's modular architecture
import {
  DatasetService, // Dataset CRUD operations
  IngestionService, // File processing and indexing
  SearchService, // Multimodal search
  MetadataService, // Metadata extraction
  VersioningService, // Dataset versioning
  EmbeddingService, // Vector embeddings
} from "reynard-unified-repository";
```

### Database Schema

```sql
-- Core dataset management
CREATE TABLE datasets (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified file registry
CREATE TABLE files (
  id UUID PRIMARY KEY,
  dataset_id UUID REFERENCES datasets(id),
  path TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  size BIGINT,
  hash VARCHAR(64),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multimodal embeddings
CREATE TABLE embeddings (
  id UUID PRIMARY KEY,
  file_id UUID REFERENCES files(id),
  modality VARCHAR(20) NOT NULL, -- 'text', 'image', 'audio', 'data'
  embedding VECTOR(1536),
  model_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔍 Search Capabilities

### Semantic Search

```typescript
// Text-based semantic search
const textResults = await repository.search({
  query: "neural network architectures",
  modality: "text",
  similarityThreshold: 0.7,
});

// Image-based search
const imageResults = await repository.search({
  query: "data visualization charts",
  modality: "image",
  topK: 10,
});

// Cross-modal search
const crossModalResults = await repository.search({
  query: "machine learning pipeline",
  modalities: ["text", "image", "data"],
  hybrid: true, // Combines vector + keyword search
});
```

### Parquet Analytics

```typescript
// Schema inference and analytics
const parquetFile = await repository.getFile("dataset.parquet");
const schema = await parquetFile.getSchema();
const stats = await parquetFile.getStatistics();

// Query parquet data
const data = await parquetFile.query({
  columns: ["temperature", "humidity"],
  filters: { date: { gte: "2024-01-01" } },
  limit: 1000,
});
```

## 🎨 UI Components

### Multimodal Gallery

```tsx
import { MultimodalGallery } from "reynard-unified-repository";

function DatasetBrowser() {
  return (
    <MultimodalGallery
      datasetId="research-papers"
      view="grid"
      filters={{
        fileTypes: ["pdf", "parquet", "png"],
        dateRange: { from: "2024-01-01" },
      }}
      onFileSelect={file => console.log("Selected:", file)}
    />
  );
}
```

### Search Interface

```tsx
import { UnifiedSearch } from "reynard-unified-repository";

function SearchInterface() {
  return (
    <UnifiedSearch
      repository={repository}
      enableMultimodal={true}
      showFilters={true}
      onResultClick={result => handleResultClick(result)}
    />
  );
}
```

## 🔧 Configuration

### Repository Configuration

```typescript
interface RepositoryConfig {
  database: {
    host: string;
    port: number;
    database: string;
    username?: string;
    password?: string;
  };
  storage: {
    type: "local" | "s3" | "gcs";
    path?: string;
    bucket?: string;
    region?: string;
  };
  embeddings: {
    textModel: string;
    imageModel: string;
    dimensions: number;
  };
  processing: {
    maxFileSize: number;
    supportedFormats: string[];
    thumbnailSize: [number, number];
  };
}
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Test specific modality
pnpm test -- --grep "parquet"
```

## 📚 Examples

Check out the examples directory:

- **Basic Dataset Management**: Create and manage datasets
- **Multimodal Search**: Advanced search across modalities
- **Parquet Analytics**: Schema inference and data analysis
- **API Integration**: REST and GraphQL endpoints
- **UI Components**: Gallery and search interfaces

## 🤝 Contributing

Contributions welcome! This package leverages Reynard's modular architecture:

- **File Processing**: Built on `reynard-file-processing`
- **Search & RAG**: Powered by `reynard-rag`
- **Multimodal UI**: Uses `reynard-multimodal`
- **Service Management**: Orchestrated by `reynard-service-manager`

## 📄 License

MIT License - see LICENSE file for details.

## 🦊 Why This Architecture is Magnificent

### ✅ **Best Practices Integration**

- **Multi-Model Database**: PostgreSQL + pgvector for unified storage
- **Knowledge Graphs**: Complex relationship modeling
- **Universal Embeddings**: Cross-modal vector representations
- **Semantic Versioning**: Dataset lineage and reproducibility
- **Microservices Design**: Scalable, modular architecture

### 🎯 **Reynard Ecosystem Integration**

- **Zero Duplication**: Leverages existing packages
- **Consistent APIs**: Follows Reynard patterns
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized for large-scale datasets

_Built with the cunning of a fox, the thoroughness of an otter, and the relentless determination of a wolf!_ 🦊🦦🐺
