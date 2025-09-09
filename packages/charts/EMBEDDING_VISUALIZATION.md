# 🦊> Reynard Embedding Visualization System

*Comprehensive embedding analysis and visualization with dimensionality reduction, statistical analysis, and interactive 3D visualization.*

## Overview

The Reynard Embedding Visualization System provides a complete solution for analyzing and visualizing high-dimensional embedding data. It combines advanced dimensionality reduction techniques (PCA, t-SNE, UMAP) with statistical analysis, quality metrics, and interactive 3D visualization.

## Features

### 📊 Statistical Analysis

- **Distribution Charts**: Histograms and box plots for embedding value analysis
- **Statistical Overlays**: Mean, standard deviation, quartiles, and other descriptive statistics
- **Real-time Updates**: Dynamic chart updates with new data

### 🔬 Dimensionality Reduction

- **PCA**: Principal Component Analysis with explained variance analysis
- **t-SNE**: t-Distributed Stochastic Neighbor Embedding for non-linear visualization
- **UMAP**: Uniform Manifold Approximation and Projection with better global structure
- **Parameter Controls**: Fine-tune reduction parameters for optimal results
- **Caching**: Intelligent caching system for performance optimization

### ⭐ Quality Metrics

- **Comprehensive Assessment**: Coherence, separation, density, and distribution scores
- **Quality Recommendations**: Automated suggestions for embedding improvement
- **Visual Indicators**: Color-coded quality metrics with thresholds
- **Issue Detection**: Automatic identification of embedding quality problems

### 🌐 3D Visualization

- **Interactive Point Clouds**: Three.js-based 3D visualization with orbit controls
- **Real-time Interaction**: Click and hover events for point exploration
- **Color Mapping**: Similarity-based color coding for visual analysis
- **Auto-fitting**: Automatic camera positioning for optimal viewing

## Architecture

### Backend Services

#### EmbeddingVisualizationService

```python
# Core service for embedding visualization
class EmbeddingVisualizationService:
    - get_embedding_stats() -> EmbeddingStats
    - perform_reduction() -> EmbeddingReductionResult
    - analyze_embedding_quality() -> EmbeddingQualityMetrics
    - get_cache_stats() -> CacheStats
```

#### API Endpoints

- `GET /api/embedding-visualization/stats` - Embedding statistics
- `POST /api/embedding-visualization/reduce` - Dimensionality reduction
- `POST /api/embedding-visualization/quality` - Quality analysis
- `GET /api/embedding-visualization/methods` - Available methods
- `WebSocket /api/embedding-visualization/progress` - Real-time progress

### Frontend Components

#### Core Components

- **EmbeddingDistributionChart**: Statistical distribution visualization
- **PCAVarianceChart**: PCA explained variance analysis
- **EmbeddingQualityChart**: Quality metrics and assessment
- **Embedding3DVisualization**: Interactive 3D point cloud
- **EmbeddingVisualizationDashboard**: Comprehensive dashboard

#### Composables

- **useEmbeddingVisualization**: Reactive state management and API integration

## Usage

### Basic Usage

```tsx
import { EmbeddingVisualizationDashboard } from "reynard-charts";

export const MyComponent = () => {
  return (
    <EmbeddingVisualizationDashboard
      isVisible={true}
      width={1200}
      height={800}
      theme="dark"
    />
  );
};
```

### Individual Components

```tsx
import { 
  EmbeddingDistributionChart,
  PCAVarianceChart,
  EmbeddingQualityChart,
  Embedding3DVisualization
} from "reynard-charts";

// Distribution analysis
<EmbeddingDistributionChart
  title="Embedding Value Distribution"
  type="histogram"
  data={distributionData}
  showStatistics={true}
/>

// PCA analysis
<PCAVarianceChart
  title="PCA Explained Variance"
  data={pcaData}
  showCumulative={true}
  showRecommendations={true}
/>

// Quality assessment
<EmbeddingQualityChart
  title="Embedding Quality"
  type="quality-bar"
  data={qualityData}
  showAssessment={true}
/>

// 3D visualization
<Embedding3DVisualization
  data={reductionResult}
  width={800}
  height={600}
  onPointClick={(index, data) => console.log('Clicked:', index)}
/>
```

### Using the Composable

```tsx
import { useEmbeddingVisualization } from "reynard-charts";

export const MyComponent = () => {
  const embeddingViz = useEmbeddingVisualization();
  
  // Get statistics
  const stats = embeddingViz.stats();
  
  // Perform reduction
  const performReduction = async () => {
    const result = await embeddingViz.performReduction({
      method: 'pca',
      parameters: { n_components: 3 },
      max_samples: 1000
    });
  };
  
  // Analyze quality
  const analyzeQuality = async (embeddings) => {
    const quality = await embeddingViz.analyzeQuality(embeddings);
  };
  
  return (
    <div>
      {/* Your component content */}
    </div>
  );
};
```

## Configuration

### Backend Configuration

```python
# embedding_visualization_service.py
config = {
    "cache_ttl_seconds": 3600,  # Cache TTL
    "max_samples": 10000,       # Maximum samples per reduction
    "default_method": "pca",    # Default reduction method
}
```

### Frontend Configuration

```tsx
// Component props
interface EmbeddingVisualizationDashboardProps {
  isVisible?: boolean;
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  showLoading?: boolean;
}
```

## Dependencies

### Backend Dependencies

- **scikit-learn**: PCA, t-SNE implementations
- **umap-learn**: UMAP dimensionality reduction
- **numpy**: Numerical computations
- **fastapi**: API framework
- **websockets**: Real-time progress updates

### Frontend Dependencies

- **chart.js**: 2D chart rendering
- **three.js**: 3D visualization
- **solid-js**: Reactive framework
- **reynard-core**: Core utilities and API client

## Performance Considerations

### Backend Optimization

- **Caching**: Intelligent result caching with TTL
- **Async Processing**: Non-blocking dimensionality reduction
- **Memory Management**: Efficient numpy array handling
- **Progress Streaming**: Real-time progress updates via WebSocket

### Frontend Optimization

- **Lazy Loading**: Dynamic Three.js imports
- **Virtual Rendering**: Efficient point cloud rendering
- **Memory Cleanup**: Proper Three.js resource disposal
- **Responsive Updates**: Optimized chart re-rendering

## Integration with RAG System

The embedding visualization system integrates seamlessly with the existing RAG backend:

```python
# Integration with RAG service
from ..services.rag_service import RAGService

class EmbeddingVisualizationService:
    def __init__(self, rag_service: RAGService):
        self.rag_service = rag_service
    
    async def get_embedding_stats(self):
        # Get real embedding statistics from RAG service
        return await self.rag_service.get_embedding_statistics()
```

## Examples

### Demo Application

A complete demo application is available at `examples/embedding-visualization-demo/` showcasing all features:

```bash
cd examples/embedding-visualization-demo
npm install
npm run dev
```

### Integration Examples

- **RAG Search Interface**: 3D visualization of search results
- **Model Analysis**: Quality assessment of different embedding models
- **Dataset Exploration**: Statistical analysis of embedding datasets

## API Reference

### EmbeddingReductionRequest

```typescript
interface EmbeddingReductionRequest {
  method: "pca" | "tsne" | "umap";
  filters?: {
    min_score?: number;
    max_score?: number;
    start_date?: string;
    end_date?: string;
    model_id?: string;
    variant?: string;
    metadata_filters?: Record<string, any>;
  };
  parameters?: Record<string, any>;
  max_samples?: number;
  random_seed?: number;
  use_cache?: boolean;
  cache_ttl_seconds?: number;
}
```

### EmbeddingReductionResponse

```typescript
interface EmbeddingReductionResponse {
  success: boolean;
  method: string;
  transformed_data: number[][];
  original_indices: number[];
  parameters: Record<string, any>;
  metadata: Record<string, any>;
  processing_time_ms: number;
  job_id: string;
  cached: boolean;
  error?: string;
}
```

## Troubleshooting

### Common Issues

1. **Three.js Import Errors**
   - Ensure Three.js is properly installed
   - Check for version compatibility

2. **Backend Service Unavailable**
   - Verify embedding visualization service is running
   - Check API endpoint configuration

3. **Performance Issues**
   - Reduce max_samples for large datasets
   - Enable caching for repeated operations
   - Use appropriate reduction methods

### Debug Mode

Enable debug logging:

```typescript
// Frontend
const embeddingViz = useEmbeddingVisualization();
console.log('Stats:', embeddingViz.stats());
console.log('Available methods:', embeddingViz.availableMethods());
```

```python
# Backend
import logging
logging.getLogger("embedding_visualization").setLevel(logging.DEBUG)
```

## Contributing

### Development Setup

1. Install dependencies:

```bash
cd packages/charts
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Run tests:

```bash
npm test
```

### Adding New Reduction Methods

1. Implement reducer in `backend/app/utils/dimensionality_reduction.py`
2. Add parameters interface
3. Update API endpoints
4. Add frontend integration

### Adding New Chart Types

1. Create component in `packages/charts/src/components/`
2. Add to exports in `index.ts`
3. Update dashboard integration
4. Add documentation

## License

This embedding visualization system is part of the Reynard project and follows the same licensing terms.

---

🦊> *Built with cunning agile development - the fox's strategic approach to complex visualization challenges.*
