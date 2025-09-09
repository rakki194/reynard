# RAG Demo App

A demonstration of the RAG (Retrieval-Augmented Generation) system with EmbeddingGemma integration, built using the Reynard framework.

## Features

- **Semantic Search**: Powered by Google's EmbeddingGemma model
- **Document Management**: Upload, view, and manage documents
- **Real-time Results**: Live search with similarity scoring
- **System Monitoring**: Health checks and performance statistics
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

1. **Ollama with EmbeddingGemma**:

   ```bash
   ollama pull embeddinggemma:latest
   ollama serve
   ```

2. **PawPrint RAG API**: The backend API must be running on port 8000

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3001`

## Usage

### Search

- Enter your query in the search box
- View results with similarity scores
- Click on results to see detailed information

### Upload Documents

- Go to the Upload tab
- Drag and drop files or click to select
- Supported formats: .txt, .md, .py, .js, .ts, .json, .yaml, .html

### Manage Documents

- View all uploaded documents in the Documents tab
- See document metadata and chunk counts
- Delete documents you no longer need

### Configure Settings

- Choose embedding models
- Adjust similarity thresholds
- Set maximum results
- Enable/disable reranking

## Architecture

This demo app showcases:

- **Reynard Framework**: SolidJS-based UI framework
- **Component System**: Reusable UI components
- **Theme Integration**: Consistent styling and theming
- **API Integration**: RESTful communication with the RAG backend

## Development

### Project Structure

```
src/
├── App.tsx          # Main application component
├── main.tsx         # Application entry point
├── styles.css       # Application styles
└── README.md        # This file
```

### Key Components

- **RAGSearch**: Main search interface component
- **ThemeProvider**: Reynard theme integration
- **Responsive Layout**: Mobile-first design

## API Integration

The app communicates with the PawPrint RAG API:

- **Search**: `POST /api/rag/query`
- **Upload**: `POST /api/rag/ingest/file`
- **Documents**: `GET /api/rag/documents`
- **Stats**: `GET /api/rag/stats`
- **Health**: `GET /api/rag/health`

## Styling

Uses Reynard's CSS conventions:

- CSS custom properties for theming
- BEM-style class naming
- Responsive design patterns
- Accessibility features

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with ES2020 support

## License

Part of the Reynard framework ecosystem.
