/**
 * 🦊 3D Data Visualization Component
 * Three.js-based 3D visualization with OKLCH colors and shared data processing
 */

import { Component, createSignal, onMount, onCleanup, createMemo } from "solid-js";
import { Card, Button } from "reynard-components";
import { getIcon } from "reynard-fluent-icons";
import { useOKLCHColors } from "reynard-themes";
import { VisualizationCore, type DataPoint, type VisualizationConfig } from "./VisualizationCore";
import { DataProcessor, type ProcessedData } from "./DataProcessor";
import { createAnimationEngine } from "../../utils/animationEngine";
import { useThreeJSVisualization } from "reynard-3d";
import * as THREE from "three";

interface Visualization3DProps {
  data: DataPoint[];
  config?: Partial<VisualizationConfig>;
  width?: number;
  height?: number;
  enableAnimation?: boolean;
  showControls?: boolean;
}

export const Visualization3D: Component<Visualization3DProps> = (props) => {
  const oklchColors = useOKLCHColors();
  
  // State
  const [processedData, setProcessedData] = createSignal<ProcessedData | null>(null);
  const [visualizationCore] = createSignal(new VisualizationCore(props.config));
  const [isAnimating, setIsAnimating] = createSignal(false);
  // const [cameraPosition, setCameraPosition] = createSignal({ x: 0, y: 0, z: 5 });
  // const [rotation, setRotation] = createSignal({ x: 0, y: 0 });

  // Refs
  let containerRef: HTMLDivElement | undefined;
  let scene: any = null;
  let camera: any = null;
  let renderer: any = null;
  let controls: any = null;
  let pointCloud: any = null;
  let animationEngine: ReturnType<typeof createAnimationEngine> | undefined;

  // Process data when props change
  const processedDataMemo = createMemo(() => {
    if (!props.data.length) return null;
    
    const processed = DataProcessor.processData(props.data, {
      normalize: true,
      enableClustering: true,
      clusterCount: 5,
    });
    
    setProcessedData(processed);
    return processed;
  });

  // Generate colors for data points
  const pointColors = createMemo(() => {
    const data = processedDataMemo();
    if (!data) return [];
    
    return visualizationCore().generateColors(data.points);
  });

  // Initialize Three.js scene using Reynard 3D composable
  const initializeThreeJS = async () => {
    if (!containerRef) return;

    // Use Reynard 3D composable for Three.js setup
    const threeJS = useThreeJSVisualization({
      width: props.width || 800,
      height: props.height || 600,
      backgroundColor: oklchColors.getColor("background")
    });

    // Initialize the scene with the container
    await threeJS.initializeScene(containerRef);

    // Assign the composable's returned objects
    scene = threeJS.scene;
    camera = threeJS.camera;
    renderer = threeJS.renderer;
    controls = threeJS.controls;

    // Set camera position
    camera.position.set(0, 0, 5);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Create point cloud
    createPointCloud();

    // Start render loop
    animationEngine = createAnimationEngine();
    animationEngine.start({
      onRender: render,
    });
  };

  // Create point cloud
  const createPointCloud = () => {
    if (!scene) return;

    const data = processedData();
    const colors = pointColors();
    
    if (!data || !colors.length) return;

    // Remove existing point cloud
    if (pointCloud) {
      scene.remove(pointCloud);
    }

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(data.points.length * 3);
    const colorArray = new Float32Array(data.points.length * 3);
    const sizes = new Float32Array(data.points.length);

    data.points.forEach((point, index) => {
      const i = index * 3;
      
      // Convert normalized coordinates to 3D space
      positions[i] = (point.x - 0.5) * 4;
      positions[i + 1] = (point.y - 0.5) * 4;
      positions[i + 2] = (point.z || 0) * 4;

      // Set colors from OKLCH
      const color = colors[index];
      if (color) {
        // Convert OKLCH to RGB for Three.js
        const rgb = oklchToRgb(color.point);
        colorArray[i] = rgb.r;
        colorArray[i + 1] = rgb.g;
        colorArray[i + 2] = rgb.b;
        
        // Set size based on intensity
        sizes[index] = 2 + (color.intensity * 8);
      }
    });

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Create material
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    // Create point cloud
    pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);
  };

  // Convert OKLCH to RGB
  const oklchToRgb = (oklch: any) => {
    // Simplified OKLCH to RGB conversion
    const { l, c, h } = oklch;
    const hue = (h * Math.PI) / 180;
    const chroma = c;
    const lightness = l;

    // Convert to RGB (simplified)
    const r = Math.max(0, Math.min(1, lightness + chroma * Math.cos(hue)));
    const g = Math.max(0, Math.min(1, lightness + chroma * Math.cos(hue - (2 * Math.PI) / 3)));
    const b = Math.max(0, Math.min(1, lightness + chroma * Math.cos(hue + (2 * Math.PI) / 3)));

    return { r, g, b };
  };

  // Render scene
  const render = () => {
    if (!renderer || !scene || !camera) return;

    // Update controls
    if (controls) {
      controls.update();
    }

    // Rotate point cloud if animating
    if (isAnimating() && pointCloud) {
      pointCloud.rotation.y += 0.005;
      pointCloud.rotation.x += 0.002;
    }

    // Render scene
    renderer.render(scene, camera);
  };

  // Animation controls
  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  // Reset camera
  const resetCamera = () => {
    if (camera && controls) {
      camera.position.set(0, 0, 5);
      controls.reset();
    }
  };

  // Lifecycle
  onMount(() => {
    initializeThreeJS();
  });

  onCleanup(() => {
    if (animationEngine) {
      animationEngine.stop();
    }
    
    if (renderer && containerRef) {
      containerRef.removeChild(renderer.domElement);
    }
    
    if (renderer) {
      renderer.dispose();
    }
  });

  return (
    <div class="visualization-3d">
      <Card class="visualization-container">
        <div class="visualization-header">
          <h3>🦊 3D Data Visualization</h3>
          <p>Interactive 3D visualization with Three.js and OKLCH colors</p>
        </div>

        <div class="visualization-content">
          <div class="canvas-wrapper">
            <div
              ref={containerRef}
              class="threejs-container"
            />
          </div>

          {props.showControls && (
            <div class="visualization-controls">
              <div class="control-group">
                <Button
                  variant={isAnimating() ? "danger" : "success"}
                  size="sm"
                  onClick={isAnimating() ? stopAnimation : startAnimation}
                  leftIcon={getIcon(isAnimating() ? "pause" : "play")}
                >
                  {isAnimating() ? "Stop" : "Animate"}
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetCamera}
                  leftIcon={getIcon("refresh")}
                >
                  Reset Camera
                </Button>
              </div>

              <div class="stats-display">
                {processedData() && (
                  <div class="stats-grid">
                    <div class="stat-item">
                      <span class="stat-label">Points:</span>
                      <span class="stat-value">{processedData()!.statistics.count}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Mean:</span>
                      <span class="stat-value">{processedData()!.statistics.mean.toFixed(3)}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Std Dev:</span>
                      <span class="stat-value">{processedData()!.statistics.std.toFixed(3)}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Clusters:</span>
                      <span class="stat-value">{processedData()!.clusters?.length || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
