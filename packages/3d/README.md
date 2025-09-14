# Reynard 3D

🦊> A cunning 3D graphics and visualization package for the Reynard framework, powered by Three.js and
optimized for SolidJS.

## Features

### 🎯 Core 3D Capabilities

- **Three.js Integration**: Full Three.js support with lazy loading for optimal performance
- **Point Cloud Visualization**: Advanced point cloud rendering with clustering and search integration
- **Camera Controls**: Smooth OrbitControls with damping and animation support
- **Lighting System**: Enhanced lighting with ambient, directional, and point lights
- **Responsive Canvas**: Automatic resizing with device pixel ratio optimization

### 🎨 Visualization Components

- **ThreeJSVisualization**: Base 3D scene component with full camera and lighting control
- **PointCloudVisualization**: Advanced point cloud rendering with interaction support
- **ThreeJSVisualizationDemo**: Comprehensive demo showcasing all features

### ⚡ Performance Optimizations

- **Level of Detail (LOD)**: Automatic detail reduction based on distance
- **Frustum Culling**: Only render objects visible in camera frustum
- **Occlusion Culling**: Skip rendering of occluded objects
- **Instancing**: Efficient rendering of multiple similar objects
- **Memory Management**: Smart memory allocation and cleanup

### 🎭 Animation System

- **Smooth Transitions**: Easing functions for natural animations
- **Point Animations**: Animated transitions between point cloud states
- **Camera Animations**: Smooth camera movements and fly-to effects
- **Cluster Animations**: Dynamic cluster expansion and contraction

### 🔍 Advanced Features

- **Cluster Detection**: K-means, DBSCAN, and hierarchical clustering algorithms
- **Search Integration**: Visual search result highlighting and similarity paths
- **Interactive Selection**: Multi-select points with visual feedback
- **Tooltip System**: Rich hover information with metadata display
- **Color Mapping**: Multiple color schemes based on similarity, clusters, importance, etc.

## Installation

```bash
npm install reynard-3d
```

## Quick Start

### Basic 3D Scene

```tsx
import { ThreeJSVisualization } from "reynard-3d";

function My3DScene() {
  const setupScene = (scene, camera, renderer, controls) => {
    // Add your 3D objects here
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
  };

  return (
    <ThreeJSVisualization
      width={800}
      height={600}
      onSceneReady={setupScene}
      enableDamping={true}
      autoRotate={true}
    />
  );
}
```

### Point Cloud Visualization

```tsx
import { PointCloudVisualization } from "reynard-3d";

function MyPointCloud() {
  const points = [
    {
      id: "1",
      position: [0, 0, 0],
      color: [1, 0, 0],
      size: 2,
      metadata: { label: "Point 1" },
    },
    // ... more points
  ];

  return (
    <PointCloudVisualization
      points={points}
      width={800}
      height={600}
      settings={{
        colorMapping: "similarity",
        sizeMapping: "importance",
        enableHighlighting: true,
        maxPoints: 10000,
      }}
      onPointClick={(point, event) => {
        console.log("Clicked point:", point);
      }}
      onSelectionChange={(selected) => {
        console.log("Selected points:", selected);
      }}
    />
  );
}
```

### Using Composables

```tsx
import { useThreeJSVisualization, usePointCloud } from "reynard-3d";

function Custom3DComponent() {
  const visualization = useThreeJSVisualization({
    width: 800,
    height: 600,
    backgroundColor: "#1a1a1a",
  });

  const pointCloud = usePointCloud(
    () => myPoints,
    () => ({ colorMapping: "cluster" }),
    () => ({ enableSearchIntegration: true }),
  );

  // Use the composables to build custom 3D experiences
  return <div>Custom 3D implementation</div>;
}
```

## API Reference

### Components

#### ThreeJSVisualization

Base 3D scene component with camera controls and lighting.

> _Props:_

- `width?: number` - Canvas width (default: 800)
- `height?: number` - Canvas height (default: 600)
- `backgroundColor?: string` - Scene background color
- `enableDamping?: boolean` - Enable camera damping
- `autoRotate?: boolean` - Enable auto-rotation
- `onSceneReady?: (scene, camera, renderer, controls) => void` - Scene setup callback
- `onRender?: (scene, camera, renderer, controls) => void` - Render callback

#### PointCloudVisualization

Advanced point cloud rendering with interaction support.

> _Props:_

- `points: Point3D[]` - Array of 3D points to render
- `settings?: PointCloudSettings` - Visualization settings
- `animationSettings?: AnimationSettings` - Animation configuration
- `searchIntegration?: SearchIntegrationSettings` - Search integration options
- `onPointClick?: (point, event) => void` - Point click handler
- `onPointHover?: (point, event) => void` - Point hover handler
- `onSelectionChange?: (selected) => void` - Selection change handler

### Composables

#### useThreeJSVisualization

Composable for managing Three.js scenes and rendering.

#### usePointCloud

Composable for point cloud visualization and interaction.

#### useThreeJSAnimations

Composable for 3D animations and transitions.

### Utilities

#### Geometry Utilities

- `createVector3(x, y, z)` - Create 3D vector
- `distanceVector3(a, b)` - Calculate distance between vectors
- `createBoundingBox(points)` - Create bounding box from points
- `generateSpherePoints(center, radius, count)` - Generate sphere point distribution

#### Animation Utilities

- `Easing` - Collection of easing functions
- `interpolate(start, end, t, easing)` - Interpolate between values
- `interpolateVector3(start, end, t, easing)` - Interpolate 3D vectors

#### Performance Utilities

- `PerformanceMonitor` - Track rendering performance
- `LODManager` - Level of detail management
- `FrustumCuller` - Frustum culling optimization
- `MemoryManager` - Memory allocation tracking

#### Cluster Detection

- `detectClusters(points, options)` - Detect clusters in point data
- `kmeansClustering(points, k)` - K-means clustering algorithm
- `dbscanClustering(points, minPoints, maxDistance)` - DBSCAN clustering

## Examples

### Demo Components

```tsx
import { ThreeJSVisualizationDemo } from "reynard-3d/demos";

// Complete demo showcasing all features
<ThreeJSVisualizationDemo width={800} height={600} />;
```

### Custom Point Cloud with Clustering

```tsx
import { PointCloudVisualization, detectClusters } from "reynard-3d";

function ClusteredPointCloud() {
  const [points, setPoints] = createSignal([]);
  const [clusters, setClusters] = createSignal([]);

  const analyzeClusters = () => {
    const detectedClusters = detectClusters(points(), {
      algorithm: "kmeans",
      maxClusters: 5,
    });
    setClusters(detectedClusters);
  };

  return (
    <div>
      <button onClick={analyzeClusters}>Analyze Clusters</button>
      <PointCloudVisualization
        points={points()}
        settings={{
          colorMapping: "cluster",
          enableHighlighting: true,
        }}
      />
    </div>
  );
}
```

## Performance Tips

1. **Limit Point Count**: Use `maxPoints` setting to limit rendered points
2. **Enable LOD**: Use level of detail for distant objects
3. **Use Instancing**: Enable instancing for similar objects
4. **Optimize Materials**: Use appropriate material types for your use case
5. **Monitor Performance**: Use `PerformanceMonitor` to track rendering stats

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Requires WebGL 2.0 support for optimal performance.

## Contributing

🦦> We welcome contributions! Please see our contributing guidelines and remember to add tests for new features.

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built on the excellent [Three.js](https://threejs.org/) library
- Inspired by the yipyap 3D visualization system
- Part of the Reynard framework ecosystem
