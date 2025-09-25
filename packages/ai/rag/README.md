# Reynard RAG System 🦊🔍

A comprehensive RAG (Retrieval-Augmented Generation) system for SolidJS applications with
EmbeddingGemma integration and advanced search capabilities.

## Architecture

```mermaid
graph TB
    subgraph "🔍 Reynard RAG System"
        A[RAG Search Container] --> B[Search Interface]
        A --> C[Modal Manager]
        A --> D[API Service]
        A --> E[Composables]

        subgraph "🎯 Core Components"
            B --> B1[Search Form]
            B --> B2[Results List]
            B --> B3[Search History]
            B --> B4[Settings Panel]
            C --> C1[File Modal]
            C --> C2[Image Modal]
            C --> C3[3D Visualization Modal]
        end

        subgraph "⚡ SolidJS Composables"
            E --> E1[useRAGSearch]
            E --> E2[useRAGDocuments]
            E --> E3[useRAGSettings]
            E --> E4[useRAGHistory]
            E --> E5[use3DVisualizationData]
            E --> E6[useFileModal]
        end

        subgraph "🌐 API Integration"
            D --> D1[Search API]
            D --> D2[Document API]
            D --> D3[Upload API]
            D --> D4[Config API]
            D --> D5[Admin API]
            D --> D6[Metrics API]
        end

        subgraph "🔧 RAG Configuration"
            F[RAG Config] --> F1[Embedding Models]
            F --> F2[Chunking Parameters]
            F --> F3[Hybrid Weights]
            F --> F4[Performance Settings]
            F --> F5[Security Settings]
            F1 --> F6[Text Model]
            F1 --> F7[Code Model]
            F1 --> F8[Caption Model]
            F1 --> F9[CLIP Model]
        end

        subgraph "📊 Search Modalities"
            G[Search Types] --> G1[Docs Search]
            G --> G2[Code Search]
            G --> G3[Image Search]
            G --> G4[Caption Search]
            G1 --> G5[Text Embeddings]
            G2 --> G6[Code Embeddings]
            G3 --> G7[CLIP Embeddings]
            G4 --> G8[Caption Embeddings]
        end

        subgraph "🎨 3D Visualization"
            H[3D Visualization] --> H1[t-SNE Reduction]
            H --> H2[UMAP Reduction]
            H --> H3[PCA Reduction]
            H --> H4[Interactive Controls]
            H --> H5[Parameter Panels]
        end

        subgraph "📁 Document Management"
            I[Document System] --> I1[File Upload]
            I --> I2[Content Processing]
            I --> I3[Chunking]
            I --> I4[Embedding Generation]
            I --> I5[Index Storage]
        end
    end

    subgraph "🔗 Backend Integration"
        J[RAG Backend] --> J1[Vector Database]
        J --> J2[Embedding Service]
        J --> J3[Search Engine]
        J --> J4[File Processing]
        J --> J5[Image Analysis]
    end

    A -->|Manages| K[Search State]
    D -->|Communicates| J
    E1 -->|Performs| L[Search Operations]
    E2 -->|Manages| M[Document Operations]
    H -->|Visualizes| N[Embedding Space]
```

## Search Flow

```mermaid
sequenceDiagram
    participant User as User
    participant UI as Search Interface
    participant Composable as RAG Composables
    participant API as API Service
    participant Backend as RAG Backend
    participant VectorDB as Vector Database

    Note over User, VectorDB: Search Initialization
    User->>UI: Enter Search Query
    UI->>Composable: useRAGSearch()
    Composable->>API: search(query, options)
    API->>Backend: POST /api/rag/search

    Note over User, VectorDB: Query Processing
    Backend->>Backend: Generate Query Embedding
    Backend->>VectorDB: Vector Similarity Search
    VectorDB-->>Backend: Similarity Results
    Backend->>Backend: Apply Hybrid Scoring
    Backend->>Backend: Rerank Results (optional)

    Note over User, VectorDB: Response Processing
    Backend-->>API: Search Response
    API-->>Composable: Transformed Results
    Composable->>Composable: Update Search State
    Composable-->>UI: Reactive Results
    UI-->>User: Display Results

    Note over User, VectorDB: Result Interaction
    User->>UI: Click Result
    UI->>Composable: useFileModal()
    Composable->>API: Load File Content
    API->>Backend: GET /api/rag/document
    Backend-->>API: File Content
    API-->>Composable: File Data
    Composable-->>UI: Modal Display
    UI-->>User: Show File Modal
```

## Document Processing Flow

```mermaid
flowchart TD
    A[File Upload] --> B{File Type?}

    B -->|Text/Code| C[Text Processing]
    B -->|Image| D[Image Processing]
    B -->|Mixed| E[Multi-modal Processing]

    C --> C1[Content Extraction]
    C1 --> C2[Text Chunking]
    C2 --> C3[Text Embedding]
    C3 --> C4[Vector Storage]

    D --> D1[Image Analysis]
    D1 --> D2[CLIP Embedding]
    D2 --> D3[Caption Generation]
    D3 --> D4[Caption Embedding]
    D4 --> D5[Vector Storage]

    E --> E1[Content Separation]
    E1 --> C
    E1 --> D

    C4 --> F[Search Index]
    D5 --> F

    F --> G[Search Ready]

    subgraph "🔧 Processing Configuration"
        H[Chunking Config] --> H1[Max Tokens: 512]
        H --> H2[Min Tokens: 100]
        H --> H3[Overlap Ratio: 0.15]

        I[Embedding Config] --> I1[Text Model: mxbai-embed-large]
        I --> I2[Code Model: bge-m3]
        I --> I3[Caption Model: nomic-embed-text]
        I --> I4[CLIP Model: ViT-L-14/openai]
    end
```

## 3D Visualization System

```mermaid
graph TB
    subgraph "🎨 3D Visualization Architecture"
        A[Search Results] --> B[Embedding Vectors]
        B --> C{Reduction Method}

        C -->|t-SNE| D[t-SNE Algorithm]
        C -->|UMAP| E[UMAP Algorithm]
        C -->|PCA| F[PCA Algorithm]

        D --> G[3D Coordinates]
        E --> G
        F --> G

        G --> H[Three.js Renderer]
        H --> I[Interactive Scene]

        subgraph "🎛️ Visualization Controls"
            J[Parameter Panels] --> J1[Point Size]
            J --> J2[Color Mapping]
            J --> J3[Animation Speed]
            J --> J4[Camera Controls]
        end

        subgraph "📊 Data Processing"
            K[Query Embedding] --> K1[Highlight Query Point]
            L[Result Embeddings] --> L1[Color by Similarity]
            M[Metadata] --> M1[Tooltip Information]
        end

        I --> N[User Interaction]
        N --> O[Point Selection]
        N --> P[Camera Movement]
        N --> Q[Parameter Adjustment]
    end

    J -->|Controls| H
    K1 -->|Highlights| I
    L1 -->|Colors| I
    M1 -->|Shows| I
```

## ✨ Features

### 🚀 **Core Capabilities**

- **Advanced Search Interface**: Comprehensive search UI with filtering and sorting
- **EmbeddingGemma Integration**: Built-in support for EmbeddingGemma models
- **Real-time Results**: Live search results with similarity scoring
- **Metadata Support**: Rich metadata display and filtering
- **TypeScript First**: Complete type safety with excellent IntelliSense

### 🎨 **UI/UX Excellence**

- **Responsive Design**: Mobile-first with adaptive layouts
- **Accessibility**: Full WCAG 2.1 compliance with keyboard navigation
- **Theming**: Seamless integration with Reynard's theming system
- **Animations**: Smooth transitions and engaging micro-interactions
- **Dark Mode**: Built-in dark mode support

### ⚡ **Performance**

- **Optimized Search**: Efficient query processing and result caching
- **Memory Management**: Smart result limiting and cleanup
- **Lazy Loading**: Progressive result loading
- **Tree Shakable**: Import only what you need

## 📦 Installation

```bash
npm install reynard-rag reynard-components solid-js
```

## 🎯 Quick Start

### Basic RAG Search Implementation

```tsx
import { RAGSearch } from "reynard-rag";
import "reynard-rag/styles";

function App() {
  return (
    <RAGSearch
      endpoint="/api/rag/search"
      height="600px"
      config={{
        enableFilters: true,
        showMetadata: true,
        maxResults: 20,
      }}
      onSearch={query => console.log("Searching:", query)}
      onResultClick={result => console.log("Selected:", result)}
    />
  );
}
```

### Advanced Usage with Custom Configuration

```tsx
import { RAGSearch } from "reynard-rag";

function CustomRAGApp() {
  const handleSearch = (query: string) => {
    // Custom search logic
    console.log("Custom search:", query);
  };

  const handleResultClick = (result: RAGResult) => {
    // Custom result handling
    console.log("Result selected:", result);
  };

  return (
    <RAGSearch
      endpoint="/api/rag/search"
      config={{
        enableFilters: true,
        showMetadata: true,
        maxResults: 50,
        similarityThreshold: 0.7,
        enableReranking: true,
      }}
      onSearch={handleSearch}
      onResultClick={handleResultClick}
    />
  );
}
```

## 🔧 API Reference

### RAGSearch Props

| Prop            | Type                          | Default   | Description                 |
| --------------- | ----------------------------- | --------- | --------------------------- |
| `endpoint`      | `string`                      | -         | API endpoint for RAG search |
| `config`        | `RAGConfig`                   | `{}`      | Configuration options       |
| `height`        | `string`                      | `"400px"` | Container height            |
| `onSearch`      | `(query: string) => void`     | -         | Search callback             |
| `onResultClick` | `(result: RAGResult) => void` | -         | Result click callback       |

### RAGConfig

```typescript
interface RAGConfig {
  enableFilters?: boolean;
  showMetadata?: boolean;
  maxResults?: number;
  similarityThreshold?: number;
  enableReranking?: boolean;
  defaultFilters?: Record<string, any>;
}
```

### RAGResult

```typescript
interface RAGResult {
  chunk_id: string;
  document_id: string;
  text: string;
  similarity_score: number;
  rank: number;
  metadata: {
    chunk_length?: number;
    document_source?: string;
    embedding_model?: string;
    [key: string]: any;
  };
}
```

## 🎨 Styling

The RAG system comes with built-in styles that integrate seamlessly with Reynard's theming system:

```tsx
import "reynard-rag/styles";
```

### Custom Styling

You can customize the appearance using CSS custom properties:

```css
:root {
  --rag-primary-color: #0078d4;
  --rag-background: #ffffff;
  --rag-border: #e1e1e1;
  --rag-text: #323130;
}
```

## 🧪 Testing

```bash
npm test
npm run test:coverage
```

## 📚 Examples

Check out the examples directory for complete implementation examples:

- Basic RAG search
- Advanced filtering
- Custom result rendering
- Integration with chat systems

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## 📄 License

MIT License - see LICENSE file for details.
