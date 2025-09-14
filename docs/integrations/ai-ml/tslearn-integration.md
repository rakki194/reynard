# tslearn Integration for Training Script Editor

This document describes the integration of tslearn (Time Series LEARNing) library into
the Reynard training script editor, providing powerful time series analysis and visualization capabilities.

## Overview

tslearn is a Python package that provides machine learning tools for
time series analysis. The integration adds visualization capabilities to the training script editor, allowing users to:

- Visualize Dynamic Time Warping (DTW) paths between time series
- Perform and visualize time series clustering
- Discover and visualize shapelets in time series data
- Analyze matrix profiles for motif discovery
- Generate sample time series data for testing

## Architecture

### Backend Components

#### 1. Visualization Utilities (`app/utils/tslearn_visualizer.py`)

The core visualization module that provides:

- **TSLearnVisualizer Class**: Main class for creating visualizations
- **DTW Visualization**: Shows DTW paths and cost matrices
- **Clustering Visualization**: Displays clustering results with centroids
- **Shapelet Visualization**: Shows discovered shapelets
- **Matrix Profile Visualization**: Displays matrix profiles for motif discovery
- **Sample Data Generation**: Creates synthetic time series for testing

#### 2. API Endpoints (`app/api/training.py`)

New REST API endpoints for visualization:

- `POST /api/training/visualize/dtw` - DTW visualization
- `POST /api/training/visualize/clustering` - Clustering visualization
- `POST /api/training/visualize/shapelets` - Shapelet visualization
- `POST /api/training/visualize/matrix-profile` - Matrix profile visualization
- `POST /api/training/visualize/sample-data` - Generate sample data
- `GET /api/training/visualize/available-methods` - List available methods

### Frontend Components

#### 1. Visualization Panel (`src/components/TrainingScriptEditor/VisualizationPanel.tsx`)

A slide-out panel that provides:

- Method selection dropdown
- Parameter configuration forms
- Sample data generation controls
- Visualization display with metadata
- Error handling and loading states

#### 2. Integration with Training Script Editor

The visualization panel is integrated into the main training script editor with:

- A "Visualize" button in the editor controls
- Slide-out panel interface
- Responsive design for different screen sizes

## Features

### 1. Dynamic Time Warping (DTW)

**Purpose**: Measure similarity between time series with temporal alignment.

**Visualization**:

- Shows original time series
- Displays DTW cost matrix
- Highlights optimal alignment path
- Provides cost metrics

**Use Cases**:

- Pattern matching in time series
- Anomaly detection
- Time series classification

### 2. Time Series Clustering

**Purpose**: Group similar time series together.

**Methods**:

- **K-Means**: Traditional k-means with DTW distance
- **K-Shape**: Shape-based clustering using cross-correlation

**Visualization**:

- Shows time series grouped by cluster
- Displays cluster centroids
- Provides cluster statistics

**Use Cases**:

- Customer behavior segmentation
- Sensor data analysis
- Pattern discovery

### 3. Shapelet Discovery

**Purpose**: Find discriminative subsequences in time series.

**Visualization**:

- Shows discovered shapelets
- Displays shapelet locations
- Provides classification accuracy

**Use Cases**:

- Time series classification
- Feature extraction
- Interpretable machine learning

### 4. Matrix Profile Analysis

**Purpose**: Find motifs and anomalies in time series.

**Visualization**:

- Shows original time series
- Displays matrix profile
- Highlights motif positions

**Use Cases**:

- Motif discovery
- Anomaly detection
- Pattern mining

## Usage Guide

### 1. Accessing the Visualization Panel

1. Open the Training Script Editor
2. Click the "Visualize" button in the editor controls
3. The visualization panel will slide in from the right

### 2. Generating Sample Data

1. In the visualization panel, configure sample data parameters:
   - Number of time series (5-50)
   - Series length (10-1000)
2. Click "Generate Sample Data"
3. The system will create synthetic time series with different patterns

### 3. Creating Visualizations

#### DTW Visualization

1. Select "Dynamic Time Warping" from the method dropdown
2. Enter two time series as comma-separated values
3. Optionally customize the title
4. Click "Create Visualization"

#### Clustering Visualization

1. Generate sample data first
2. Select "Time Series Clustering" from the method dropdown
3. Configure parameters:
   - Number of clusters (2-10)
   - Clustering method (K-Means or K-Shape)
4. Click "Create Visualization"

#### Shapelet Visualization

1. Generate sample data first
2. Select "Shapelet Discovery" from the method dropdown
3. Configure the number of shapelets (1-10)
4. Click "Create Visualization"

#### Matrix Profile Visualization

1. Generate sample data first
2. Select "Matrix Profile Analysis" from the method dropdown
3. Configure subsequence length (10-200)
4. Click "Create Visualization"

### 4. Interpreting Results

Each visualization includes:

- **Plot**: The main visualization image
- **Metadata**: Quantitative results and statistics
- **Export**: Ability to save results

## API Reference

### Visualization Request Models

#### DTW Visualization

```typescript
{
  series1: number[];      // First time series
  series2: number[];      // Second time series
  title?: string;         // Optional plot title
}
```

#### Clustering Visualization

```typescript
{
  time_series: number[][]; // List of time series
  n_clusters: number;      // Number of clusters
  method: "kmeans" | "kshape"; // Clustering method
  title?: string;          // Optional plot title
}
```

#### Shapelet Visualization

```typescript
{
  time_series: number[][]; // List of time series
  labels: number[];        // Class labels
  n_shapelets: number;     // Number of shapelets
  title?: string;          // Optional plot title
}
```

#### Matrix Profile Visualization

```typescript
{
  time_series: number[];   // Input time series
  subsequence_length: number;     // Length of subsequences to analyze
  title?: string;          // Optional plot title
}
```

### Response Format

All visualization endpoints return:

```typescript
{
  plot_data: string;       // Base64 encoded PNG image
  [key: string]: any;      // Method-specific metadata
}
```

## Dependencies

### Backend Dependencies

- `tslearn`: Time series machine learning library
- `matplotlib`: Plotting library
- `seaborn`: Statistical visualization
- `numpy`: Numerical computing

### Installation

```bash
pip install tslearn matplotlib seaborn
```

## Example Training Script

See `training_scripts/tslearn_demo.py` for a complete example that demonstrates:

- Sample data generation
- DTW computation
- Time series clustering
- Shapelet discovery
- Matrix profile analysis

## Best Practices

### 1. Data Preparation

- Ensure time series are properly normalized
- Handle missing values appropriately
- Consider the scale and units of your data

### 2. Parameter Selection

- **Clustering**: Start with 3-5 clusters for exploration
- **Shapelets**: Use 1-3 shapelets per class initially
- **Matrix Profile**: Subsequence length should be 10-20% of series length

### 3. Performance Considerations

- Large datasets may require longer processing times
- Consider downsampling for very long time series
- Use appropriate distance metrics for your domain

### 4. Visualization Interpretation

- Always check metadata for quantitative results
- Compare multiple parameter settings
- Validate results with domain knowledge

## Troubleshooting

### Common Issues

1. **tslearn not available**
   - Install tslearn: `pip install tslearn`
   - Check Python environment compatibility

2. **Memory errors with large datasets**
   - Reduce number of time series
   - Decrease series length
   - Use smaller subsequence lengths for matrix profile

3. **Poor clustering results**
   - Try different numbers of clusters
   - Experiment with different distance metrics
   - Preprocess data (normalize, scale)

4. **Shapelet discovery fails**
   - Ensure sufficient class balance
   - Reduce number of shapelets
   - Check for sufficient data in each class

### Error Messages

- **"tslearn not available"**: Install tslearn package
- **"Invalid parameters"**: Check parameter ranges and formats
- **"Insufficient data"**: Generate more sample data or use smaller parameters

## Future Enhancements

### Planned Features

- Real-time visualization updates
- Interactive plots with zoom/pan
- Export to various formats (PDF, SVG)
- Integration with training script variables
- Custom distance metrics
- Advanced clustering algorithms

### Potential Integrations

- Real-time data streaming
- Database connectivity for large datasets
- Model persistence and loading
- Automated parameter optimization
- Integration with other ML libraries

## Contributing

To extend the tslearn integration:

1. Add new visualization methods to `TSLearnVisualizer`
2. Create corresponding API endpoints
3. Update the frontend visualization panel
4. Add comprehensive tests
5. Update documentation

## References

- [tslearn Documentation](https://tslearn.readthedocs.io/)
- [Time Series Analysis with tslearn](https://tslearn.readthedocs.io/en/stable/auto_examples/index.html)
- [Dynamic Time Warping](https://en.wikipedia.org/wiki/Dynamic_time_warping)
- [Shapelet Discovery](<https://en.wikipedia.org/wiki/Shapelet_(time_series)>)
- [Matrix Profile](https://www.cs.ucr.edu/~eamonn/MatrixProfile.html)
