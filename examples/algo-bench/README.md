# Reynard Algorithm Bench

🦦 Interactive demonstration of AABB collision detection and performance optimization algorithms from the Reynard framework.

## Features

### 📦 AABB Collision Detection
- Real-time collision detection with visual feedback
- Interactive object spawning and manipulation
- Performance metrics and statistics
- Spatial hash optimization visualization

### ⚡ Spatial Optimization Demo
- Side-by-side comparison of naive O(n²) vs spatial hashing O(n) algorithms
- Real-time performance metrics
- Scalability analysis with varying object counts
- Visual grid representation of spatial partitioning

### 📊 Performance Benchmark
- Comprehensive benchmarking suite
- Automated testing across different object counts
- Detailed performance metrics and charts
- Algorithm efficiency comparison

### 🎯 Interactive Physics
- Full physics simulation with gravity and damping
- Elastic collision responses
- Energy conservation visualization
- Interactive object manipulation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve
```

## Demo Components

### AABB Collision Demo
Interactive demonstration of axis-aligned bounding box collision detection:
- Click to spawn objects
- Drag objects to move them
- Real-time collision visualization
- Performance statistics

### Spatial Optimization Demo
Compare collision detection algorithms:
- Adjust object count with slider
- Visual grid shows spatial partitioning
- Real-time performance comparison
- Speedup calculations

### Performance Benchmark
Comprehensive performance analysis:
- Automated testing across object counts
- Performance charts and graphs
- Detailed metrics table
- Algorithm efficiency comparison

### Interactive Physics
Full physics simulation:
- Gravity and damping controls
- Elastic collision responses
- Energy conservation tracking
- Interactive object manipulation

## Technical Details

### Algorithms Demonstrated
- **Naive Collision Detection**: O(n²) brute force approach
- **Spatial Hashing**: O(n) optimized approach using spatial partitioning
- **Batch Collision Detection**: Efficient processing of multiple objects
- **Physics Integration**: Collision response and momentum conservation

### Performance Optimizations
- Spatial hash grid for reduced collision checks
- Batch processing for multiple objects
- Efficient data structures and algorithms
- Real-time performance monitoring

## Architecture

Built with:
- **SolidJS**: Reactive UI framework
- **Reynard Algorithms**: Collision detection and optimization
- **Canvas API**: 2D rendering and visualization
- **TypeScript**: Type-safe development

## Contributing

This demo showcases the Reynard framework's algorithm capabilities. For contributions to the core algorithms, see the main Reynard repository.

## License

Part of the Reynard framework. See main repository for license details.